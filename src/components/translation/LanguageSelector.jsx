"use client";

import { VOICE_LANGUAGES } from "@/lib/speech";

export default function LanguageSelector({ value, onChange, disabled = false }) {
  return (
    <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-slate-400">
      Translate To
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white outline-none transition focus:border-cyan-400 disabled:opacity-40"
      >
        {VOICE_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="bg-slate-900 text-white">
            {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
