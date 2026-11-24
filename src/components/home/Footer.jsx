"use client";

import Link from "next/link";
import { Code2, Globe, MessageCircle } from "lucide-react";
import BrandLogo from "../common/BrandLogo";

const columns = [
  {
    label: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#security", label: "Security" },
      { href: "/join", label: "Join with a code" },
    ],
  },
  {
    label: "Platform",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/history", label: "Meeting history" },
      { href: "/settings", label: "Account settings" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

const socials = [
  { href: "https://github.com", label: "GitHub", Icon: Code2 },
  { href: "https://twitter.com", label: "Twitter", Icon: Globe },
  { href: "https://linkedin.com", label: "Community", Icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="bg-night text-night-ink">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BrandLogo href="/" size="md" theme="dark" />

            <p className="mt-4 max-w-sm text-sm leading-[1.6] text-night-ink-2">
              Browser video meetings for small teams, built on WebRTC, with live
              Bengali and English voice translation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((column) => (
              <div key={column.label}>
                <h3 className="font-mono text-[11px] text-night-ink-3">
                  {column.label}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-night-ink-2 transition-colors duration-150 hover:text-night-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="font-mono text-[11px] text-night-ink-3">Connect</h3>
              <div className="mt-3 flex gap-1.5">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-night-line text-night-ink-3 transition-colors duration-150 hover:bg-night-raised hover:text-night-ink"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-night-line pt-6 text-xs text-night-ink-3 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} VideoMeet</p>
          <p>Built by SB Technology</p>
        </div>
      </div>
    </footer>
  );
}
