"use client";

import { useEffect } from "react";
import { CheckIcon, AlertCircleIcon, InfoIcon, XIcon } from "./icons";

export default function MeetingToast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const typeStyles = {
    success: {
      bg: "bg-[#101624]/95 border-emerald-500/40 text-emerald-300",
      icon: <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: "bg-[#101624]/95 border-red-500/40 text-red-300",
      icon: <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0" />,
    },
    info: {
      bg: "bg-[#101624]/95 border-indigo-500/40 text-indigo-200",
      icon: <InfoIcon className="w-4 h-4 text-indigo-400 shrink-0" />,
    },
  }[toast.type || "info"];

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className={`flex items-center gap-2.5 text-xs font-medium ${typeStyles.bg}`}>
        {typeStyles.icon}
        <span>{toast.message}</span>
        <button
          onClick={onDismiss}
          className="ml-2 text-slate-400 hover:text-white transition"
          aria-label="Dismiss toast"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
