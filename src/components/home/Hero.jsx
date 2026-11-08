"use client";

import Link from "next/link";
import {
  Video,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mic,
  Camera,
  Monitor,
  PhoneOff,
  Smile,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import ReactLogo from "../common/ReactLogo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 pt-32 pb-20 lg:pt-40 lg:pb-32 bg-grid-slate">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-gradient-to-tr from-cyan-400/15 via-blue-500/15 to-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-48 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* ================= LEFT CONTENT ================= */}
          <div className="lg:col-span-6 lg:max-w-xl">
            {/* React Tech Pill */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs backdrop-blur-md">
              <ReactLogo className="h-5 w-5 text-cyan-600 drop-shadow-[0_0_6px_rgba(0,216,254,0.4)]" />
              <span className="flex items-center gap-1.5">
                Powered by <strong className="font-bold text-blue-700">React 19</strong> &amp; WebRTC
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Next-Gen Meetings.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Unmatched Clarity.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              VideoMeet delivers ultra-low latency, peer-to-peer HD video, and real-time AI voice translation. Built on modern React architecture for silky-smooth collaboration.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/dashboard"
                className="group flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98]"
              >
                <Video className="h-5 w-5 text-cyan-300" />
                <span>Start Free Meeting</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/join"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white/90 px-7 py-4 text-base font-bold text-slate-700 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 active:scale-[0.98]"
              >
                <span>Join with Code</span>
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Ultra Fast</p>
                  <p className="text-[11px] text-slate-500">&lt;35ms latency</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">End-to-End</p>
                  <p className="text-[11px] text-slate-500">P2P encrypted</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">AI Voice</p>
                  <p className="text-[11px] text-slate-500">Live speech</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT UI SHOWCASE ================= */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 opacity-20 blur-xl" />

              {/* Main Video Meeting Mockup Card */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-3.5 shadow-2xl shadow-slate-950/40">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-3 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
                      <ReactLogo className="h-5 w-5 text-cyan-200" animated={true} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">VideoMeet Room</p>
                      <p className="text-[10px] text-slate-400">Design Sprint #42</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live • 1080p
                    </span>
                  </div>
                </div>

                {/* Video Grid Tiles */}
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {/* Tile 1: Sourav (Speaker) */}
                  <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-3 border border-blue-500/40 shadow-inner">
                    <div className="flex justify-between items-start">
                      <span className="rounded-md bg-blue-600/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Host
                      </span>
                      {/* Audio visualizer dots */}
                      <div className="flex items-end gap-1 h-3">
                        <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-2" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-3" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center my-auto">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                        S
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        Sourav (You)
                      </span>
                      <Mic className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                  </div>

                  {/* Tile 2: Elena */}
                  <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-3 border border-slate-800">
                    <span className="self-end rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] text-slate-400">
                      React Team
                    </span>

                    <div className="flex items-center justify-center my-auto">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-xl font-bold text-white shadow-lg">
                        E
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        Elena Vance
                      </span>
                      <Mic className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Tile 3: Rahim */}
                  <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 p-3 border border-slate-800">
                    <div />
                    <div className="flex items-center justify-center my-auto">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-xl font-bold text-white shadow-lg">
                        R
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        Rahim Khan
                      </span>
                      <Mic className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                  </div>

                  {/* Tile 4: Karim */}
                  <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-3 border border-slate-800">
                    <div />
                    <div className="flex items-center justify-center my-auto">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xl font-bold text-white shadow-lg">
                        K
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
                        Karim Ahmed
                      </span>
                      <Mic className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Sleek Floating Dock Controls */}
                <div className="mt-3 flex items-center justify-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 py-2.5 px-4 backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700">
                    <Mic className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700">
                    <Camera className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700">
                    <Monitor className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-700">
                    <Smile className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-600/40">
                    <PhoneOff className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Floating Pill: React 19 State */}
              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                  <ReactLogo className="h-6 w-6 text-cyan-600" animated={true} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">React 19 Reactive Grid</p>
                  <p className="text-[11px] text-slate-500">Real-time state &amp; WebRTC mesh</p>
                </div>
              </div>

              {/* Floating Pill: AI Voice Translation */}
              <div className="absolute -top-5 -right-4 hidden rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">AI Voice Translation</p>
                  <p className="text-[11px] text-slate-500">Live multi-lingual audio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
