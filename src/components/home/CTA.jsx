"use client";

import Link from "next/link";
import { ArrowRight, Video, Sparkles } from "lucide-react";
import ReactLogo from "../common/ReactLogo";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-cyan-600 px-6 py-16 text-center text-white shadow-2xl shadow-blue-600/30 sm:px-12 lg:px-20 lg:py-20">
          {/* Background Watermark React Logo */}
          <div className="pointer-events-none absolute -right-16 -top-16 opacity-10">
            <ReactLogo className="h-96 w-96 text-white" animated={true} />
          </div>
          <div className="pointer-events-none absolute -left-16 -bottom-16 opacity-10">
            <ReactLogo className="h-80 w-80 text-white" animated={true} />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-cyan-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get Started in 10 Seconds</span>
            </span>

            {/* Heading */}
            <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to elevate your meetings?
            </h2>

            {/* Description */}
            <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg">
              Start hosting crystal-clear, secure video meetings today. Free forever for standard peer-to-peer sessions.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-blue-50 active:scale-[0.98]"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/join"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
              >
                <Video className="h-4 w-4 text-cyan-300" />
                <span>Join a Meeting</span>
              </Link>
            </div>

            <p className="mt-6 text-xs text-blue-200/80">
              No credit card required • Works on all devices
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
