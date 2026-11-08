"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Video,
  Shield,
  Workflow,
  Sparkles,
  Menu,
  X,
  LogIn,
  ArrowRight,
  Radio,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with React Atom */}
        <BrandLogo href="/" size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1.5 shadow-xs backdrop-blur-md md:flex">
          <Link
            href="#features"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
            Features
          </Link>

          <Link
            href="#how-it-works"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <Workflow className="h-4 w-4 text-indigo-500" />
            How It Works
          </Link>

          <Link
            href="#security"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <Shield className="h-4 w-4 text-emerald-500" />
            Security
          </Link>

          <Link
            href="/join"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <Radio className="h-4 w-4 text-rose-500" />
            Join Meeting
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogIn className="h-4 w-4 text-slate-500" />
            Sign in
          </Link>

          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98]"
          >
            <Video className="h-4 w-4 text-cyan-300" />
            <span>Start Meeting</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 pt-2 pb-6 shadow-xl backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="#features"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Sparkles className="h-5 w-5 text-blue-500" />
              Features
            </Link>

            <Link
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Workflow className="h-5 w-5 text-indigo-500" />
              How It Works
            </Link>

            <Link
              href="#security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Shield className="h-5 w-5 text-emerald-500" />
              Security
            </Link>

            <Link
              href="/join"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Radio className="h-5 w-5 text-rose-500" />
              Join a Meeting
            </Link>

            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25"
              >
                <Video className="h-4 w-4 text-cyan-300" />
                Start Meeting
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
