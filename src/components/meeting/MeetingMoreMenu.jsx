"use client";

import { useEffect, useRef, useState } from "react";
import {
  CopyIcon,
  MaximizeIcon,
  KeyboardIcon,
  InfoIcon,
  SettingsIcon,
  PhoneOffIcon,
  XIcon,
  CheckIcon,
} from "./icons";

export default function MeetingMoreMenu({
  isOpen,
  onClose,
  meetingId,
  title,
  isHost,
  onCopyLink,
  onEndMeeting,
  viewMode,
  onToggleViewMode,
}) {
  const menuRef = useRef(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  }

  if (!isOpen && !showInfoModal && !showShortcutsModal) return null;

  return (
    <>
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-20 right-4 sm:right-12 z-50 w-64 rounded-2xl border border-slate-700/80 bg-[#151D2E]/95 p-2 shadow-2xl backdrop-blur-2xl text-xs font-medium text-slate-200"
        >
          <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Meeting Options
            </p>
          </div>

          <button
            onClick={() => {
              setShowInfoModal(true);
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-700/50 hover:text-white transition text-left"
          >
            <InfoIcon className="w-4 h-4 text-slate-400" />
            <span>Meeting Information</span>
          </button>

          <button
            onClick={() => {
              onCopyLink();
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-700/50 hover:text-white transition text-left"
          >
            <CopyIcon className="w-4 h-4 text-slate-400" />
            <span>Copy Meeting Link</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-700/50 hover:text-white transition text-left"
          >
            <MaximizeIcon className="w-4 h-4 text-slate-400" />
            <span>Toggle Fullscreen</span>
          </button>

          <button
            onClick={() => {
              setShowShortcutsModal(true);
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-700/50 hover:text-white transition text-left"
          >
            <KeyboardIcon className="w-4 h-4 text-slate-400" />
            <span>Keyboard Shortcuts</span>
          </button>

          {isHost && (
            <>
              <div className="h-px bg-slate-700/60 my-1" />
              <button
                onClick={() => {
                  onEndMeeting();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-left"
              >
                <PhoneOffIcon className="w-4 h-4 text-red-400" />
                <span>End Meeting for All</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Meeting Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-[#151D2E] p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <h3 className="text-base font-bold text-white">Meeting Information</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Title</p>
                <p className="text-sm font-bold text-white mt-0.5">{title || "VideoMeet Session"}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Meeting ID</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sm text-[#38BDF8] bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    {meetingId}
                  </span>
                  <button
                    onClick={() => onCopyLink()}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Architecture</p>
                <p className="text-slate-300 mt-0.5">Native WebRTC Peer-to-Peer Mesh (DTLS-SRTP encrypted)</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Voice Translation</p>
                <p className="text-slate-300 mt-0.5">Gemini Live Bengali ↔ English voice translation</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-[#151D2E] p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              {[
                { key: "M", desc: "Toggle Microphone" },
                { key: "V", desc: "Toggle Camera" },
                { key: "H", desc: "Toggle Raise Hand" },
                { key: "C", desc: "Toggle Chat Sidebar" },
                { key: "P", desc: "Toggle Participants Sidebar" },
                { key: "Esc", desc: "Close Modals / Overlays" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-300">{item.desc}</span>
                  <kbd className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-[#38BDF8]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
