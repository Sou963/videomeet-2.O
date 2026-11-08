"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createGeminiTranslationSession } from "@/services/geminiTranslation";

export default function useVoiceTranslation({ meetingId, participants, enabled, language }) {
  const sessionsRef = useRef(new Map());
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState("");

  const setStatus = useCallback((id, status) => {
    setStatuses((current) => ({ ...current, [id]: status }));
  }, []);

  const stopRecord = useCallback((id, record) => {
    record.cancelled = true;
    record.abortController.abort();
    if (record.session) {
      Promise.resolve(record.session.close()).catch((error) => {
        console.error("Failed to close Gemini translation session:", error.message);
      });
    }
    sessionsRef.current.delete(id);
    setStatuses((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      for (const [id, record] of sessionsRef.current) {
        stopRecord(id, record);
      }
      setError("");
      return;
    }

    const desired = new Map(
      participants
        .filter((participant) =>
          participant.stream
            ?.getAudioTracks()
            .some((track) => track.readyState === "live")
        )
        .map((participant) => [participant.peerId, participant])
    );

    for (const [id, record] of sessionsRef.current) {
      const participant = desired.get(id);
      if (!participant || record.stream !== participant.stream || record.language !== language) {
        stopRecord(id, record);
      }
    }

    setStatuses((current) => {
      const next = { ...current };
      for (const id of Object.keys(next)) {
        if (!desired.has(id)) delete next[id];
      }
      return next;
    });

    for (const [id, participant] of desired) {
      if (sessionsRef.current.has(id)) continue;

      const record = {
        abortController: new AbortController(),
        cancelled: false,
        language,
        session: null,
        stream: participant.stream,
      };
      sessionsRef.current.set(id, record);
      setStatus(id, "connecting");

      const audioStream = new MediaStream(participant.stream.getAudioTracks());
      createGeminiTranslationSession({
        stream: audioStream,
        language,
        meetingId,
        signal: record.abortController.signal,
        onStatus: (status) => {
          if (!record.cancelled && sessionsRef.current.get(id) === record) {
            setStatus(id, status);
            if (status === "translating") setError("");
          }
        },
        onError: (message) => {
          if (!record.cancelled && sessionsRef.current.get(id) === record) {
            setStatus(id, "error");
            setError(message);
          }
        },
      })
        .then((session) => {
          if (record.cancelled || sessionsRef.current.get(id) !== record) {
            return session.close();
          }
          record.session = session;
        })
        .catch((err) => {
          if (record.cancelled || sessionsRef.current.get(id) !== record) return;
          setStatus(id, "error");
          setError(err.message || "Gemini Live translation could not be started.");
        });
    }
  }, [enabled, language, meetingId, participants, setStatus, stopRecord]);

  useEffect(
    () => () => {
      for (const [id, record] of sessionsRef.current) {
        stopRecord(id, record);
      }
    },
    [stopRecord]
  );

  return {
    statuses,
    error,
    clearError: () => setError(""),
  };
}
