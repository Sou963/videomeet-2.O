"use client";

import {
  Video,
  Mic,
  MonitorUp,
  Languages,
  ShieldCheck,
  Users2,
  Sparkles,
  Zap,
} from "lucide-react";
import ReactLogo from "../common/ReactLogo";

const features = [
  {
    icon: Video,
    color: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50 text-blue-600",
    title: "Ultra-HD Video",
    description:
      "Adaptive bitrate WebRTC streaming keeps your video crisp, clear, and steady even on fluctuating bandwidths.",
    badge: "1080p 60fps",
  },
  {
    icon: Languages,
    color: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50 text-indigo-600",
    title: "AI Live Voice Translation",
    description:
      "Break language barriers in real time. Translate speech between multiple languages with natural audio synthesis.",
    badge: "AI Powered",
  },
  {
    icon: MonitorUp,
    color: "from-cyan-500 to-teal-500",
    bgLight: "bg-cyan-50 text-cyan-600",
    title: "Screen & Audio Sharing",
    description:
      "Share full screens, single application windows, or browser tabs with high fidelity audio passthrough for presentations.",
    badge: "Lossless",
  },
  {
    icon: Mic,
    color: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-50 text-emerald-600",
    title: "Crystal Clear Spatial Audio",
    description:
      "Advanced noise suppression and echo cancellation ensure every word is heard without background disruptions.",
    badge: "Noise Filter",
  },
  {
    icon: Users2,
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 text-amber-600",
    title: "Multi-Party Collaboration",
    description:
      "Join group calls with reactive participant grids, hand raising, emoji reactions, and synchronous group chat.",
    badge: "Interactive",
  },
  {
    icon: ShieldCheck,
    color: "from-rose-500 to-red-500",
    bgLight: "bg-rose-50 text-rose-600",
    title: "P2P Encryption & Room Privacy",
    description:
      "Meeting IDs, password gates, and host controls prevent uninvited attendees and guarantee privacy.",
    badge: "Secure",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-blue-700">
            <ReactLogo className="h-4 w-4 text-cyan-600" animated={true} />
            <span>State-of-the-Art Architecture</span>
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything you need for seamless video collaboration
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Built using modern web technologies to give you fluid, reliable, and intelligent meetings right in your browser.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Top glow hover bar */}
                <div
                  className={`absolute left-0 top-0 h-1.5 w-0 bg-gradient-to-r ${feature.color} transition-all duration-300 group-hover:w-full`}
                />

                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgLight} transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Optimized for performance</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
