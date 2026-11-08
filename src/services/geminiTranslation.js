import { GoogleGenAI } from "@google/genai";
import { api } from "@/lib/api";

const MODEL = "gemini-3.5-live-translate-preview";
const OUTPUT_SAMPLE_RATE = 24000;
const WORKLET_PATH = "/audio-worklets/pcm-capture.js";

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

function decodePcm16(data) {
  const binary = atob(data);
  const sampleCount = Math.floor(binary.length / 2);
  const samples = new Float32Array(sampleCount);
  const view = new DataView(new ArrayBuffer(binary.length));

  for (let index = 0; index < binary.length; index += 1) {
    view.setUint8(index, binary.charCodeAt(index));
  }

  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = view.getInt16(index * 2, true) / 0x8000;
  }

  return samples;
}

function getErrorMessage(error) {
  return error?.message || "Gemini Live translation failed.";
}

function isExpiredTokenError(error) {
  const message = getErrorMessage(error);
  return /401|403|1008|expired|invalid.{0,20}token|token.{0,20}invalid/i.test(message);
}

export async function createGeminiTranslationSession({
  stream,
  language,
  meetingId,
  signal,
  onStatus,
  onError,
}) {
  const audioTracks = stream?.getAudioTracks().filter((track) => track.readyState === "live");
  if (!audioTracks?.length) {
    throw new Error("No live remote audio track is available for translation.");
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  const audioContext = new AudioContextClass();
  let closed = false;
  let generation = 0;
  let session = null;
  let refreshTimer = null;
  let status = "connecting";
  let retryingExpiredToken = false;
  let playbackTime = 0;
  const playbackSources = new Set();
  const setStatus = (nextStatus) => {
    if (status !== nextStatus) {
      status = nextStatus;
      onStatus(nextStatus);
    }
  };

  onStatus("connecting");

  try {
    if (signal?.aborted) throw new DOMException("Translation was cancelled.", "AbortError");
    if (!audioContext.audioWorklet) {
      throw new Error("AudioWorklet is not supported in this browser.");
    }
    await audioContext.audioWorklet.addModule(WORKLET_PATH);
    if (signal?.aborted) throw new DOMException("Translation was cancelled.", "AbortError");
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const remoteAudioStream = new MediaStream(audioTracks);
    const source = audioContext.createMediaStreamSource(remoteAudioStream);
    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = Math.min(7600, audioContext.sampleRate / 2 - 100);

    const processor = new AudioWorkletNode(audioContext, "pcm-capture-16khz", {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
    });
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    source.connect(filter);
    filter.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);

    function stopPlayback() {
      for (const playbackSource of playbackSources) {
        playbackSource.onended = null;
        try {
          playbackSource.stop();
        } catch {
          // A source can finish between checking and stopping it.
        }
      }
      playbackSources.clear();
      playbackTime = audioContext.currentTime;
    }

    function playPcmAudio(data) {
      const samples = decodePcm16(data);
      if (!samples.length || closed) return;

      const audioBuffer = audioContext.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
      audioBuffer.copyToChannel(samples, 0);

      const playbackSource = audioContext.createBufferSource();
      playbackSource.buffer = audioBuffer;
      playbackSource.connect(audioContext.destination);
      const startAt = Math.max(audioContext.currentTime + 0.02, playbackTime);
      playbackTime = startAt + audioBuffer.duration;
      playbackSources.add(playbackSource);
      playbackSource.onended = () => {
        playbackSources.delete(playbackSource);
        if (!playbackSources.size && !closed) {
          playbackTime = audioContext.currentTime;
          setStatus("connected");
        }
      };
      playbackSource.start(startAt);
    }

    async function connectToGemini() {
      const currentGeneration = ++generation;
      clearTimeout(refreshTimer);
      const previousSession = session;
      session = null;
      previousSession?.close();
      setStatus("connecting");

      let tokenData;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        tokenData = await api("/gemini/live-token", {
          method: "POST",
          body: JSON.stringify({ meetingId }),
          signal,
        });
        if (closed || currentGeneration !== generation) return;

        const ai = new GoogleGenAI({
          apiKey: tokenData.token,
          httpOptions: { apiVersion: "v1beta" },
        });
        let callbackError = "";

        try {
          const liveSession = await ai.live.connect({
            model: MODEL,
            config: {
              responseModalities: ["AUDIO"],
              translationConfig: {
                targetLanguageCode: language,
                echoTargetLanguage: false,
              },
              abortSignal: signal,
            },
            callbacks: {
              onopen: () => {
                if (closed || currentGeneration !== generation) return;
                callbackError = "";
                retryingExpiredToken = false;
                setStatus("connected");
              },
              onmessage: (message) => {
                if (closed || currentGeneration !== generation) return;
                if (message.serverContent?.interrupted) stopPlayback();

                try {
                  const parts = message.serverContent?.modelTurn?.parts || [];
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      setStatus("translating");
                      playPcmAudio(part.inlineData.data);
                    }
                  }
                } catch (error) {
                  setStatus("error");
                  onError(getErrorMessage(error));
                }
              },
              onerror: (event) => {
                if (closed || currentGeneration !== generation) return;
                const error = event.error || event;
                callbackError = getErrorMessage(error);
                onError(callbackError);
              },
              onclose: (event) => {
                if (closed || currentGeneration !== generation) return;
                const closeError = new Error(
                  `${event.reason || "Gemini Live connection closed"} (code ${event.code}).`
                );
                if (isExpiredTokenError(closeError) && !retryingExpiredToken) {
                  retryingExpiredToken = true;
                  connectToGemini().catch((error) => {
                    if (!closed) onError(getErrorMessage(error));
                  });
                } else {
                  onError(callbackError || getErrorMessage(closeError));
                }
              },
            },
          });

          if (closed || currentGeneration !== generation) {
            liveSession.close();
            return;
          }

          session = liveSession;
          const expiry = Date.parse(tokenData.expiresAt);
          const refreshIn = Number.isFinite(expiry)
            ? Math.max(1000, expiry - Date.now() - 60_000)
            : 14 * 60 * 1000;
          refreshTimer = setTimeout(() => {
            connectToGemini().catch((error) => {
              if (!closed) {
                setStatus("error");
                onError(getErrorMessage(error));
              }
            });
          }, refreshIn);
          return;
        } catch (error) {
          if (attempt === 0 && isExpiredTokenError(error)) continue;
          throw error;
        }
      }
    }

    processor.port.onmessage = ({ data }) => {
      if (closed || !session) return;
      try {
        session.sendRealtimeInput({
          audio: {
            data: arrayBufferToBase64(data),
            mimeType: "audio/pcm;rate=16000",
          },
        });
        setStatus("translating");
      } catch (error) {
        setStatus("error");
        onError(getErrorMessage(error));
      }
    };

    await connectToGemini();

    return {
      close: async () => {
        if (closed) return;
        closed = true;
        generation += 1;
        clearTimeout(refreshTimer);
        processor.port.onmessage = null;
        processor.disconnect();
        filter.disconnect();
        source.disconnect();
        silentGain.disconnect();
        stopPlayback();
        session?.close();
        session = null;
        if (audioContext.state !== "closed") {
          await audioContext.close();
        }
      },
    };
  } catch (error) {
    if (audioContext.state !== "closed") {
      await audioContext.close();
    }
    throw error;
  }
}
