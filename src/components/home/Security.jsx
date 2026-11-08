"use client";

import { Lock, ShieldCheck, KeyRound, UserCheck, Server, Cpu } from "lucide-react";
import ReactLogo from "../common/ReactLogo";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encrypted WebRTC Mesh",
    description:
      "Audio and video streams are sent directly peer-to-peer with DTLS-SRTP encryption, keeping your conversation private.",
  },
  {
    icon: KeyRound,
    title: "Password-Gated Rooms",
    description:
      "Hosts can enforce strong password protection on any meeting to keep out uninvited guests and drive-by joiners.",
  },
  {
    icon: UserCheck,
    title: "Granular Host Controls",
    description:
      "Meeting creators maintain full command: mute participants, lock the room, and manage access privileges.",
  },
  {
    icon: ShieldCheck,
    title: "Strict JWT Authentication",
    description:
      "HttpOnly cookie tokens with secure session tracking safeguard user identities and account data.",
  },
];

export default function Security() {
  return (
    <section
      id="security"
      className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-32"
    >
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Enterprise-Grade Privacy</span>
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Built with security at every layer
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
            Your conversations are yours alone. VideoMeet combines modern browser security standards with peer-to-peer encryption.
          </p>
        </div>

        {/* Security Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/40 hover:bg-slate-900/90"
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 h-1 w-8 rounded-full bg-cyan-500/40 transition-all duration-300 group-hover:w-16 group-hover:bg-cyan-400" />
              </div>
            );
          })}
        </div>

        {/* Tech Stack Banner with React Logo */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 p-8 sm:p-10">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <ReactLogo className="h-10 w-10 text-white" animated={true} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  State-of-the-Art React 19 Ecosystem
                </h3>
                <p className="mt-1 max-w-xl text-sm text-slate-400">
                  Engineered with React 19 concurrent features, WebRTC direct streaming, Socket.IO signaling, and MongoDB persistence.
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
                React 19
              </span>
              <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300">
                WebRTC P2P
              </span>
              <span className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
                Socket.IO
              </span>
              <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                MongoDB
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
