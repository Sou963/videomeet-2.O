"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Link2, ArrowRight, ShieldCheck, ArrowLeft, Video, Sparkles, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import ReactLogo from "@/components/common/ReactLogo";

export default function JoinPage() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const id = value.trim().replace(/^.*\//, "");
    if (!id) {
      return setError("Please provide a valid meeting ID or invite link.");
    }
    router.push(`/meeting/${encodeURIComponent(id)}`);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 bg-grid-slate">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Top return link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
            <ReactLogo className="h-3.5 w-3.5 text-cyan-500" animated={true} />
            React 19 Powered
          </span>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <BrandLogo href="/" size="md" />

            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Join a Video Meeting
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Paste a full meeting invite link or enter the meeting ID below to enter the waiting room.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="meeting-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Meeting ID or URL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <input
                  id="meeting-code"
                  autoFocus
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. 842-910-384 or link"
                  className="h-13 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98]"
            >
              <Video className="h-5 w-5 text-cyan-300" />
              <span>Continue to Waiting Room</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Quick tips */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs leading-relaxed text-slate-500">
                You will be able to preview and test your camera, microphone, and device permissions before joining the room.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
