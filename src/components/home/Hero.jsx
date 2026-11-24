"use client";

import Link from "next/link";
import {
  ArrowRight,
  Mic,
  MicOff,
  Video,
  MonitorUp,
  MessageSquare,
  PhoneOff,
  Languages,
} from "lucide-react";

const facts = [
  { label: "Runs in the browser", value: "No install" },
  { label: "Media path", value: "Peer to peer" },
  { label: "Translation", value: "bn ↔ en" },
];

const tiles = [
  { initial: "S", name: "Sourav", role: "Host", muted: false, accent: true },
  { initial: "E", name: "Elena", role: "Design", muted: false, accent: false },
  { initial: "R", name: "Rahim", role: "Engineering", muted: true, accent: false },
  { initial: "K", name: "Karim", role: "Product", muted: false, accent: false },
];

export default function Hero() {
  return (
    <section className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <p
              className="rise-in font-mono text-xs tracking-[0.02em] text-ink-3"
              style={{ "--delay": "40ms" }}
            >
              Browser meetings · live voice translation
            </p>

            <h1
              className="rise-in mt-4 text-[36px] font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[56px]"
              style={{ "--delay": "110ms" }}
            >
              Meetings that translate while you speak
            </h1>

            <p
              className="rise-in mt-5 max-w-[34rem] text-base leading-[1.6] text-ink-2 sm:text-[17px]"
              style={{ "--delay": "190ms" }}
            >
              Peer-to-peer video for small teams, with live Bengali and English
              voice translation inside the call. Guests join from a link with no
              account and no download.
            </p>

            <div
              className="rise-in mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center"
              style={{ "--delay": "270ms" }}
            >
              <Link
                href="/dashboard"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                Start a meeting
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Link>
              <Link
                href="/join"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-raised"
              >
                Join with a code
              </Link>
            </div>

            <dl
              className="rise-in mt-10 grid grid-cols-3 gap-4 border-t border-hairline pt-6"
              style={{ "--delay": "350ms" }}
            >
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs text-ink-3">{fact.label}</dt>
                  <dd className="tnum mt-1 font-mono text-[13px] text-ink">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Product view: the room as it actually looks. */}
          <div
            className="rise-in lg:col-span-6"
            style={{ "--delay": "160ms" }}
          >
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_8px_24px_rgba(17,24,39,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    Design sprint 42
                  </p>
                  <p className="tnum truncate font-mono text-[11px] text-ink-3">
                    meet-894-abc · 12:04
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3">
                {tiles.map((tile) => (
                  <div
                    key={tile.name}
                    className={`relative flex aspect-[4/3] flex-col justify-between rounded-lg p-3 ${
                      tile.accent
                        ? "bg-night-surface"
                        : "bg-raised"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-mono text-[10px] ${
                          tile.accent ? "text-night-ink-3" : "text-ink-3"
                        }`}
                      >
                        {tile.role}
                      </span>
                      {tile.muted ? (
                        <MicOff
                          className={`h-3.5 w-3.5 ${
                            tile.accent ? "text-night-ink-3" : "text-ink-3"
                          }`}
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Mic
                          className={`h-3.5 w-3.5 ${
                            tile.accent ? "text-night-ink-2" : "text-ink-3"
                          }`}
                          strokeWidth={1.75}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium ${
                          tile.accent
                            ? "bg-brand text-white"
                            : "bg-surface text-ink-2"
                        }`}
                      >
                        {tile.initial}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          tile.accent ? "text-night-ink" : "text-ink"
                        }`}
                      >
                        {tile.name}
                      </p>
                      {tile.accent ? (
                        <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                          <i
                            className="level block w-[2px] rounded-full bg-brand"
                            style={{ height: "6px", "--delay": "0ms" }}
                          />
                          <i
                            className="level block w-[2px] rounded-full bg-brand"
                            style={{ height: "12px", "--delay": "180ms" }}
                          />
                          <i
                            className="level block w-[2px] rounded-full bg-brand"
                            style={{ height: "8px", "--delay": "320ms" }}
                          />
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 font-mono text-[11px] text-ink-2">
                  <Languages className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
                  en → bn
                </span>

                <div className="flex items-center gap-1.5">
                  {[Mic, Video, MonitorUp, MessageSquare].map((Icon, index) => (
                    <span
                      key={index}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-raised text-ink-2"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-negative text-white">
                    <PhoneOff className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
