"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useAudioActivity from "@/hooks/useAudioActivity";
import { MicOffIcon, CrownIcon } from "./icons";

export default function ParticipantCard({
  participant,
  isHost = false,
  handRaised = false,
  muteOriginalAudio = false,
  activeReaction = null,
  isScreenSharing = false,
  compact = false,
}) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const resumeRemoteAudio = useCallback(() => {
    const playback = audioRef.current?.play();
    if (playback) {
      playback.then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = participant.stream || null;
    if (audioRef.current) {
      audioRef.current.srcObject = participant.stream || null;
      resumeRemoteAudio();
    }

    document.addEventListener("pointerdown", resumeRemoteAudio);
    document.addEventListener("touchend", resumeRemoteAudio);
    return () => {
      document.removeEventListener("pointerdown", resumeRemoteAudio);
      document.removeEventListener("touchend", resumeRemoteAudio);
    };
  }, [participant.stream, resumeRemoteAudio]);

  const hasVideo = participant.video !== false && !!participant.stream;
  const hasAudio = participant.audio !== false;

  // Real audio activity detection using Web Audio API
  const isSpeaking = useAudioActivity(participant.stream, hasAudio);

  const initial = participant.name ? participant.name[0].toUpperCase() : "P";

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border bg-[#101624] transition-all duration-300 ${
        isSpeaking
          ? "border-[#6366F1] ring-2 ring-[#6366F1]/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : "border-slate-800/80 hover:border-slate-700/80 shadow-md"
      } ${compact ? "h-full aspect-video" : "h-full w-full"}`}
    >
      {/* ── Video feed or Avatar ─────────────────────────────────── */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full min-h-[160px] flex-col items-center justify-center bg-gradient-to-b from-[#151D2E] to-[#101624]">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-2xl sm:text-3xl font-bold text-white shadow-lg shadow-[#6366F1]/20">
            {initial}
          </div>
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline muted={muteOriginalAudio} className="hidden" />

      {audioBlocked && participant.stream && !muteOriginalAudio && (
        <button
          type="button"
          onClick={resumeRemoteAudio}
          className="absolute inset-x-4 bottom-12 z-20 mx-auto w-fit rounded-lg bg-slate-950/90 px-3 py-2 text-xs font-semibold text-white"
        >
          Tap to enable audio
        </button>
      )}

      {/* ── Top Bar: Badges & Screen Sharing ──────────────────────── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5">
          {isHost && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md">
              <CrownIcon className="w-3 h-3 text-amber-400" />
              <span>Host</span>
            </span>
          )}

          {isScreenSharing && (
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-md">
              Presenting
            </span>
          )}
        </div>

        {/* Hand Raised Banner */}
        {handRaised && (
          <span className="flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-slate-950 shadow-md backdrop-blur-md animate-bounce">
            ✋ Hand Raised
          </span>
        )}
      </div>

      {/* ── Reaction Animated Overlay ────────────────────────────── */}
      {activeReaction && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          <div className="animate-in zoom-in-50 duration-200 flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-3xl shadow-xl backdrop-blur-md">
            {activeReaction}
          </div>
        </div>
      )}

      {/* ── Bottom Bar: Name & Mic status ─────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-[#080B14]/80 px-2.5 py-1 text-xs font-medium text-[#F8FAFC] backdrop-blur-md border border-slate-700/40">
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {participant.name || "Participant"}
            </span>

            {/* Speaking audio wave animation */}
            {isSpeaking && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.7s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.5s_ease-in-out_infinite] h-3" />
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.9s_ease-in-out_infinite] h-1.5" />
              </span>
            )}
          </div>

          {!hasAudio && (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EF4444]/90 text-white backdrop-blur-md shadow-xs"
              title="Microphone Muted"
            >
              <MicOffIcon className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* ── Connecting indicator if stream not ready ───────────────── */}
      {!participant.stream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#101624]/90 backdrop-blur-xs">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-[#38BDF8]" />
          <p className="mt-2 text-xs font-medium text-slate-400">
            {participant.connectionState === "failed"
              ? "Connection failed"
              : participant.connectionState === "reconnecting"
                ? "Reconnecting…"
                : participant.connectionState === "waiting"
                  ? "Waiting for ICE…"
                  : "Connecting video…"}
          </p>
        </div>
      )}
    </div>
  );
}
