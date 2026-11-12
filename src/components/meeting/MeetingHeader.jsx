"use client";

import { useState } from "react";
import BrandLogo from "@/components/common/BrandLogo";
import ConnectionStatus from "./ConnectionStatus";
import {
  CopyIcon,
  CheckIcon,
  UsersIcon,
  LanguagesIcon,
  LayoutGalleryIcon,
  LayoutSpeakerIcon,
  MoreIcon,
} from "./icons";

export default function MeetingHeader({
  meetingId,
  title,
  connectionState,
  durationText,
  remainingText,
  remainingSeconds,
  participantCount,
  maxParticipants,
  translationEnabled,
  viewMode,
  onToggleViewMode,
  onCopyMeetingId,
  onToggleSidebar,
  activeSidebarTab,
  onOpenMoreMenu,
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopyMeetingId();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#080B14]/90 px-4 sm:px-6 backdrop-blur-xl">
      {/* ── Left Section ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3.5 min-w-0">
        <BrandLogo href="/" size="sm" theme="dark" showBadge={false} />

        <div className="hidden sm:block h-4 w-px bg-slate-800" />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[#F8FAFC] truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {title || "Meeting Room"}
            </h1>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-[#101624] px-2 py-0.5 text-[11px] font-mono text-[#38BDF8] hover:border-slate-700 hover:text-white transition shrink-0"
              title="Copy Meeting ID"
            >
              <span>{meetingId}</span>
              {copied ? (
                <CheckIcon className="w-3 h-3 text-[#22C55E]" />
              ) : (
                <CopyIcon className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Center Section ────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-3">
        <ConnectionStatus status={connectionState} />

        <div className="flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-[#101624]/80 px-3 py-1 text-xs text-slate-300 backdrop-blur-md">
          <span className="text-[11px] font-mono font-medium tracking-wide">
            {durationText}
          </span>
        </div>
      </div>

      {/* ── Right Section ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Layout toggle (Gallery vs Speaker view) */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-800 bg-[#101624] p-0.5">
          <button
            onClick={() => onToggleViewMode("gallery")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "gallery"
                ? "bg-[#1A2437] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Gallery View"
          >
            <LayoutGalleryIcon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Gallery</span>
          </button>

          <button
            onClick={() => onToggleViewMode("speaker")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "speaker"
                ? "bg-[#1A2437] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Speaker View"
          >
            <LayoutSpeakerIcon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Speaker</span>
          </button>
        </div>

        {/* Translation active pill indicator */}
        {translationEnabled && (
          <button
            onClick={() => onToggleSidebar("translation")}
            className="flex items-center gap-1.5 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-2.5 py-1.5 text-xs font-medium text-[#38BDF8] hover:bg-[#38BDF8]/20 transition"
            title="Voice Translation Active"
          >
            <LanguagesIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline text-[11px]">Translating</span>
          </button>
        )}

        {/* Participant Count Pill */}
        <button
          onClick={() => onToggleSidebar("people")}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            activeSidebarTab === "people"
              ? "border-[#6366F1]/50 bg-[#6366F1]/15 text-[#F8FAFC]"
              : "border-slate-800 bg-[#101624] text-slate-300 hover:border-slate-700"
          }`}
          title="Participants"
        >
          <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">{participantCount}</span>
        </button>

        {/* More Menu Trigger */}
        <button
          onClick={onOpenMoreMenu}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-[#101624] text-slate-300 hover:border-slate-700 hover:text-white transition"
          aria-label="More options"
          title="More options"
        >
          <MoreIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
