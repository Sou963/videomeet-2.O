"use client";

import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "./ChatPanel";
import TranslationPanel from "./TranslationPanel";
import { UsersIcon, ChatIcon, LanguagesIcon, XIcon } from "./icons";

export default function MeetingSidebar({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  localName,
  isHost,
  remoteParticipants,
  raisedHands,
  handRaised,
  onAnnounce,
  meetingId,
  socketRef,
  translationEnabled,
  onToggleTranslation,
  listenLanguage,
  onChangeLanguage,
  translationStatus,
  translationError,
}) {
  if (!isOpen) return null;

  const totalCount = 1 + remoteParticipants.length;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-800/80 bg-[#151D2E] shadow-2xl backdrop-blur-2xl sm:relative sm:z-20 sm:w-80 md:w-96 transition-all duration-300">
      {/* ── Sidebar Header & Tab Switcher ────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-[#101624] p-1">
          <button
            onClick={() => onTabChange("people")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "people"
                ? "bg-[#1A2437] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>People ({totalCount})</span>
          </button>

          <button
            onClick={() => onTabChange("chat")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "chat"
                ? "bg-[#1A2437] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ChatIcon className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => onTabChange("translation")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "translation"
                ? "bg-[#1A2437] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LanguagesIcon className="w-3.5 h-3.5" />
            <span>Translation</span>
            {translationEnabled && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close sidebar"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "people" && (
          <ParticipantsPanel
            localName={localName}
            isHost={isHost}
            remoteParticipants={remoteParticipants}
            raisedHands={raisedHands}
            handRaised={handRaised}
            onAnnounce={onAnnounce}
          />
        )}

        {activeTab === "chat" && (
          <ChatPanel
            meetingId={meetingId}
            name={localName}
            socketRef={socketRef}
          />
        )}

        {activeTab === "translation" && (
          <TranslationPanel
            enabled={translationEnabled}
            setEnabled={onToggleTranslation}
            language={listenLanguage}
            setLanguage={onChangeLanguage}
            status={translationStatus}
            error={translationError}
          />
        )}
      </div>
    </aside>
  );
}
