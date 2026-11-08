"use client";

import Link from "next/link";
import {
  Heart,
  Shield,
  Radio,
  Sparkles,
  Globe,
  Code2,
  MessageCircle,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";
import ReactLogo from "../common/ReactLogo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Info */}
          <div className="lg:col-span-5">
            <BrandLogo href="/" size="lg" theme="dark" />

            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
              Modern WebRTC video conferencing platform crafted with React 19.
              Designed for ultra-low latency, AI live translation, and crystal
              clear peer-to-peer audio &amp; video.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>

              <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                <ReactLogo className="h-3.5 w-3.5 text-cyan-400" />
                React 19
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Product
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <Link
                    href="#features"
                    className="transition hover:text-white"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="transition hover:text-white"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#security"
                    className="transition hover:text-white"
                  >
                    Security &amp; WebRTC
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="transition hover:text-white">
                    Join with Code
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Platform
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="transition hover:text-white"
                  >
                    Meeting Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="transition hover:text-white">
                    Meeting History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="transition hover:text-white"
                  >
                    Account Settings
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-white">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social / Connect */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Connect
              </h4>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  <Code2 className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / Web"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Community"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} VideoMeet. All rights reserved.</p>

          <p className="flex items-center gap-1.5">
            Built By{" "}
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> SB
            Tecnohogy
          </p>
        </div>
      </div>
    </footer>
  );
}
