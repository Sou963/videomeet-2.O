"use client";

import { useState } from "react";
import { MicOffIcon, VideoOffIcon, CrownIcon, SendIcon, SparklesIcon, XIcon } from "./icons";

export default function ParticipantsPanel({
  localName,
  isHost,
  isGuest,
  remoteParticipants,
  raisedHands,
  handRaised,
  onAnnounce,
  onRemoveParticipant,
  meetingEnded = false,
}) {
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementSent, setAnnouncementSent] = useState(false);

  function handleAnnounce(e) {
    e.preventDefault();
    const trimmed = announcementText.trim();
    if (!trimmed) return;
    onAnnounce(trimmed);
    setAnnouncementText("");
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 2500);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Participant List ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-xs">
        {/* Local user tile */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-[#1A2437] p-3 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-xs font-bold text-white shadow-xs">
              {localName?.[0]?.toUpperCase() || "Y"}
            </div>
            <div>
              <p className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                <span>{localName || "You"}</span>
                <span className="text-[10px] text-slate-400 font-normal">(You)</span>
              </p>
              {isHost && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                  <CrownIcon className="w-2.5 h-2.5" /> Host
                </span>
              )}
              {isGuest && (
                <span className="text-[10px] text-slate-400 font-normal">Guest</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {handRaised && (
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-300 font-bold" title="Hand raised">
                ✋
              </span>
            )}
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" title="Connected" />
          </div>
        </div>

        {/* Remote participants list */}
        {remoteParticipants.map((p) => {
          const isPeerHandRaised = raisedHands[p.peerId];
          const hasAudio = p.audio !== false;
          const hasVideo = p.video !== false;

          return (
            <div
              key={p.peerId}
              className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#151D2E] p-3 hover:border-slate-700/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                  {p.name?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{p.name || "Participant"}</p>
                  {p.role === "host" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                      <CrownIcon className="h-2.5 w-2.5" /> Host
                    </span>
                  )}
                  {p.role === "guest" && (
                    <span className="text-[10px] text-slate-400">Guest</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!hasAudio && (
                  <span className="text-red-400" title="Muted">
                    <MicOffIcon className="w-3.5 h-3.5" />
                  </span>
                )}
                {!hasVideo && (
                  <span className="text-slate-400" title="Camera off">
                    <VideoOffIcon className="w-3.5 h-3.5" />
                  </span>
                )}
                {isPeerHandRaised && (
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-amber-300 font-bold" title="Hand raised">
                    ✋
                  </span>
                )}
                {isHost && !meetingEnded && p.role !== "host" && (
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(p.peerId)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/15 hover:text-red-300"
                    title={`Remove ${p.name || "participant"}`}
                    aria-label={`Remove ${p.name || "participant"}`}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                {p.stream ? (
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" title="Connected" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" title="Connecting" />
                )}
              </div>
            </div>
          );
        })}

        {remoteParticipants.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p className="text-xs">No other participants have joined yet.</p>
          </div>
        )}
      </div>

      {/* ── Host Announcement (Host only) ───────────────────────── */}
      {isHost && !meetingEnded && (
        <form
          onSubmit={handleAnnounce}
          className="border-t border-slate-800/80 p-3.5 bg-[#101624]/60"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Host Announcement</span>
            </span>
            {announcementSent && <span className="text-emerald-400 text-[10px]">Broadcast sent!</span>}
          </div>
          <div className="flex gap-2">
            <input
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Broadcast a note to all attendees…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-[#151D2E] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!announcementText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold transition hover:bg-amber-400 disabled:opacity-40 shrink-0"
              title="Broadcast"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
