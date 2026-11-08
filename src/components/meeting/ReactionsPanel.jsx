"use client";

import { useEffect, useRef } from "react";

const REACTIONS = ["👍", "❤️", "😂", "👏", "🎉", "🔥"];

export default function ReactionsPanel({ isOpen, onClose, onSelectReaction }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-[#151D2E]/95 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150"
    >
      {REACTIONS.map((r) => (
        <button
          key={r}
          onClick={() => {
            onSelectReaction(r);
            onClose();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-slate-700/60 hover:scale-125 transition active:scale-95"
          title={`React with ${r}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
