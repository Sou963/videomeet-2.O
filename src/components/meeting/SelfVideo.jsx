"use client";

import { useEffect, useRef } from "react";
import useAudioActivity from "@/hooks/useAudioActivity";
import { MicOffIcon, CrownIcon } from "./icons";

export default function SelfVideo({
  localStream,
  name,
  isHost = false,
  micEnabled = true,
  cameraEnabled = true,
  handRaised = false,
  isScreenSharing = false,
  isFloating = false,
  activeReaction = null,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const isSpeaking = useAudioActivity(localStream, micEnabled);
  const initial = name ? name[0].toUpperCase() : "Y";

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border bg-[#101624] transition-all duration-300 ${
        isSpeaking
          ? "border-[#6366F1] ring-2 ring-[#6366F1]/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : "border-slate-800/80 hover:border-slate-700/80 shadow-md"
      } ${
        isFloating
          ? "w-48 sm:w-56 aspect-video shadow-2xl z-20 pointer-events-auto"
          : "h-full w-full"
      }`}
    >
      {/* ── Video Stream or Avatar ───────────────────────────────── */}
      {cameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex h-full w-full min-h-[160px] flex-col items-center justify-center bg-gradient-to-b from-[#151D2E] to-[#101624]">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-2xl sm:text-3xl font-bold text-white shadow-lg shadow-[#6366F1]/20">
            {initial}
          </div>
        </div>
      )}

      {/* ── Top Badges ───────────────────────────────────────────── */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
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

        {handRaised && (
          <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-md backdrop-blur-md animate-bounce">
            ✋ Hand Raised
          </span>
        )}
      </div>

      {/* ── Reaction overlay ─────────────────────────────────────── */}
      {activeReaction && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
          <div className="animate-in zoom-in-50 duration-200 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-2xl shadow-xl backdrop-blur-md">
            {activeReaction}
          </div>
        </div>
      )}

      {/* ── Bottom Label: You & Mic status ───────────────────────── */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-[#080B14]/80 px-2.5 py-1 text-xs font-medium text-[#F8FAFC] backdrop-blur-md border border-slate-700/40">
            <span className="truncate max-w-[120px]">{name || "You"} (You)</span>

            {isSpeaking && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.7s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.5s_ease-in-out_infinite] h-3" />
                <span className="w-0.5 bg-[#6366F1] rounded-full animate-[hudWave_0.9s_ease-in-out_infinite] h-1.5" />
              </span>
            )}
          </div>

          {!micEnabled && (
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EF4444]/90 text-white backdrop-blur-md shadow-xs">
              <MicOffIcon className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
