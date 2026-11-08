"use client";

import { VOICE_LANGUAGES } from "@/lib/speech";
import { LanguagesIcon, AlertCircleIcon, SparklesIcon } from "./icons";

const STATUS_LABELS = {
  idle: { label: "Disabled", color: "bg-slate-500" },
  connecting: { label: "Connecting", color: "bg-amber-400 animate-pulse" },
  connected: { label: "Connected", color: "bg-emerald-400" },
  translating: { label: "Translating", color: "bg-cyan-400 animate-pulse" },
  error: { label: "Error", color: "bg-red-400" },
};

export default function TranslationPanel({
  enabled,
  setEnabled,
  language,
  setLanguage,
  status,
  error,
}) {
  const currentStatus = STATUS_LABELS[status] || STATUS_LABELS.idle;

  return (
    <div className="flex h-full flex-col space-y-5 overflow-y-auto p-4 text-xs text-slate-300">
      <div className="rounded-2xl border border-slate-800/80 bg-[#1A2437] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#38BDF8]">
              <LanguagesIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Live Translation</h4>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${currentStatus.color}`}
                />
                <span className="text-[11px] text-slate-400">
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            aria-pressed={enabled}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              enabled
                ? "border border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : "bg-[#6366F1] text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-600"
            }`}
          >
            {enabled ? "Disable Translation" : "Enable Translation"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 p-3 text-red-200">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-300">Translation error</p>
            <p className="mt-0.5 break-words text-[11px] text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="translation-language"
          className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          Preferred Listening Language
        </label>
        <select
          id="translation-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="w-full rounded-xl border border-slate-700/80 bg-[#151D2E] px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-[#38BDF8]"
        >
          {VOICE_LANGUAGES.map((option) => (
            <option
              key={option.code}
              value={option.code}
              className="bg-[#151D2E] text-white"
            >
              {option.name} ({option.nativeName})
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-slate-500">
          Spoken language is detected automatically. This preference only
          affects what you hear.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-[#151D2E]/50 p-3.5 text-[11px] leading-relaxed text-slate-400">
        <div className="flex items-start gap-2">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" />
          <p>
            Remote audio is sent directly from this browser to Gemini Live. Only
            translated voice is played; captions and transcripts are not
            enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
