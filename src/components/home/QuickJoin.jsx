"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, ArrowRight, ShieldCheck, Globe, Zap, Sparkles } from "lucide-react";

export default function QuickJoin() {
  const [meetingId, setMeetingId] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!meetingId.trim()) return;

    const value = meetingId.trim().replace(/^.*\//, "");
    router.push(`/meeting/${encodeURIComponent(value)}`);
  };

  return (
    <section className="relative -mt-10 z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-8">
        {/* Subtle decorative background gradient */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="relative grid items-center gap-6 lg:grid-cols-12">
          {/* Left Text */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Instant Access</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Have a meeting code?
            </h2>

            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Enter the meeting ID or full invite link to drop straight into the session without an account.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-6">
            <form onSubmit={handleJoin} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="e.g. meet-894-abc or link"
                  className="h-13 w-full rounded-2xl border border-slate-300/80 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="group flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98]"
              >
                <span>Join Meeting</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {/* Micro assurances */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Encrypted connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Runs in all modern browsers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>No install required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
