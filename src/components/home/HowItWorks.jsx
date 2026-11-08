"use client";

import { Video, Share2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: Video,
    title: "Create or Schedule",
    description:
      "Generate a secure room with a single click. Set an optional password or schedule it for a later team sync.",
    badge: "1-Click Setup",
  },
  {
    step: "02",
    icon: Share2,
    title: "Share Meeting Link",
    description:
      "Send your unique meeting ID or quick join URL to colleagues, clients, or classmates on any messaging app.",
    badge: "Zero Friction",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Collaborate in Real-Time",
    description:
      "Jump right in from Chrome, Safari, Edge, or mobile. Enjoy HD video, screen sharing, and live voice translation.",
    badge: "Instant Connect",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-slate-50/70 py-24 sm:py-32 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
            Simple Workflow
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Start meeting in 3 quick steps
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            No bloated installers, no forced account signups for guests. Just instant browser connectivity.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative mt-20 grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                {/* Step badge */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-2xl font-black text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
                  <span className="relative z-10">{item.step}</span>
                  <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-xs" />
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{item.badge}</span>
                </div>

                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
          >
            <span>Try it now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
