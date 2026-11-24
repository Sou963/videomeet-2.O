"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import BrandLogo from "../common/BrandLogo";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "/join", label: "Join a meeting" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [isOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-surface/90 backdrop-blur-md transition-colors duration-200 ${
        scrolled || isOpen ? "border-hairline" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" size="md" />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-ink-2 transition-colors duration-150 hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Start a meeting
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink md:hidden"
        >
          {isOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-hairline bg-surface px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 items-center rounded-md px-2 text-[15px] text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex h-11 items-center justify-center rounded-lg border border-hairline text-sm font-medium text-ink transition-colors duration-150 hover:bg-raised"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-medium text-white"
            >
              Start a meeting
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
