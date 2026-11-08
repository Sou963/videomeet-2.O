"use client";

import { useEffect, useState, useRef } from "react";

/**
 * useAudioActivity — detects real audio volume activity from an active WebRTC MediaStream.
 *
 * @param {MediaStream|null} stream
 * @param {boolean} enabled - whether audio track is currently unmuted
 * @returns {boolean} isSpeaking
 */
export default function useAudioActivity(stream, enabled = true) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!stream || !enabled || typeof window === "undefined") {
      setIsSpeaking(false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0 || !audioTracks[0].enabled) {
      setIsSpeaking(false);
      return;
    }

    let audioCtx = null;
    let analyser = null;
    let source = null;
    let animationId = null;
    let cancelled = false;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;

      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (cancelled) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Threshold for speaking
        if (average > 14) {
          setIsSpeaking(true);
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            if (!cancelled) setIsSpeaking(false);
          }, 350);
        }

        animationId = requestAnimationFrame(checkVolume);
      };

      animationId = requestAnimationFrame(checkVolume);
    } catch {
      // In case of any browser audio limitation, gracefully fallback to false
      setIsSpeaking(false);
    }

    return () => {
      cancelled = true;
      if (animationId) cancelAnimationFrame(animationId);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (source) {
        try { source.disconnect(); } catch {}
      }
      if (analyser) {
        try { analyser.disconnect(); } catch {}
      }
      if (audioCtx && audioCtx.state !== "closed") {
        try { audioCtx.close().catch(() => {}); } catch {}
      }
    };
  }, [stream, enabled]);

  return isSpeaking;
}
