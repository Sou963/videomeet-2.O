"use client";

import { useState } from "react";
import ReactionsPanel from "./ReactionsPanel";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ScreenShareIcon,
  HandIcon,
  SmileIcon,
  UsersIcon,
  ChatIcon,
  LanguagesIcon,
  MoreIcon,
  PhoneOffIcon,
} from "./icons";

export default function MeetingControls({
  micEnabled,
  cameraEnabled,
  isScreenSharing,
  handRaised,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRaiseHand,
  onSendReaction,
  onToggleSidebar,
  activeSidebarTab,
  translationEnabled,
  onOpenMoreMenu,
  onLeave,
  meetingEnded = false,
}) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <footer className="relative z-30 shrink-0 px-4 py-3 sm:py-4 pointer-events-none">
      <div className="mx-auto flex max-w-fit items-center justify-center gap-2 sm:gap-2.5 rounded-full border border-slate-800/80 bg-[#101624]/90 p-2 sm:p-2.5 shadow-2xl backdrop-blur-2xl pointer-events-auto">
        {/* Reactions popover */}
        <ReactionsPanel
          isOpen={showReactions && !meetingEnded}
          onClose={() => setShowReactions(false)}
          onSelectReaction={onSendReaction}
        />

        {/* 1. Microphone Toggle */}
        <button
          onClick={onToggleMic}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            micEnabled
              ? "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
              : "bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/30 hover:bg-red-600"
          }`}
          title={micEnabled ? "Mute Microphone (M)" : "Unmute Microphone (M)"}
          aria-label={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micEnabled ? <MicIcon className="w-5 h-5" /> : <MicOffIcon className="w-5 h-5" />}
        </button>

        {/* 2. Camera Toggle */}
        <button
          onClick={onToggleCamera}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            cameraEnabled
              ? "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
              : "bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/30 hover:bg-red-600"
          }`}
          title={cameraEnabled ? "Turn Off Camera (V)" : "Turn On Camera (V)"}
          aria-label={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
        >
          {cameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOffIcon className="w-5 h-5" />}
        </button>

        {/* 3. Screen Share */}
        <button
          onClick={onToggleScreenShare}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            isScreenSharing
              ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/40"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
          aria-label={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        >
          <ScreenShareIcon className="w-5 h-5" />
        </button>

        {/* 4. Raise Hand */}
        <button
          onClick={onToggleRaiseHand}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            handRaised
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title={handRaised ? "Lower Hand (H)" : "Raise Hand (H)"}
          aria-label={handRaised ? "Lower Hand" : "Raise Hand"}
        >
          <HandIcon className="w-5 h-5" />
        </button>

        {/* 5. Reactions Trigger */}
        <button
          onClick={() => setShowReactions((prev) => !prev)}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            showReactions
              ? "bg-[#1A2437] text-amber-300 ring-2 ring-amber-400/50"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title="Send Reaction"
          aria-label="Send Reaction"
        >
          <SmileIcon className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1 hidden xs:block" />

        {/* 6. Participants Drawer Toggle */}
        <button
          onClick={() => onToggleSidebar("people")}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            activeSidebarTab === "people"
              ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title="Participants (P)"
          aria-label="Participants List"
        >
          <UsersIcon className="w-5 h-5" />
        </button>

        {/* 7. Chat Drawer Toggle */}
        <button
          onClick={() => onToggleSidebar("chat")}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            activeSidebarTab === "chat"
              ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title="In-call Chat (C)"
          aria-label="Chat Panel"
        >
          <ChatIcon className="w-5 h-5" />
        </button>

        {/* 8. Voice Translation Toggle */}
        <button
          onClick={() => onToggleSidebar("translation")}
          disabled={meetingEnded}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            activeSidebarTab === "translation" || translationEnabled
              ? "bg-[#38BDF8] text-slate-950 shadow-lg shadow-[#38BDF8]/40"
              : "bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white"
          }`}
          title="Live Voice Translation"
          aria-label="Voice Translation Panel"
        >
          <LanguagesIcon className="w-5 h-5" />
        </button>

        {/* 9. More Menu Trigger */}
        <button
          onClick={onOpenMoreMenu}
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#151D2E] text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200 active:scale-95"
          title="More options"
          aria-label="More options"
        >
          <MoreIcon className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-0.5 sm:mx-1" />

        {/* 10. Leave Meeting (Red button, visually distinct) */}
        <button
          onClick={onLeave}
          className="flex h-11 sm:h-12 items-center gap-2 rounded-full bg-[#EF4444] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#EF4444]/30 transition-all duration-200 hover:bg-red-600 active:scale-95"
          title="Leave Meeting"
          aria-label="Leave Meeting"
        >
          <PhoneOffIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </footer>
  );
}
