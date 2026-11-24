"use client";

import { Lock, KeyRound, UserCheck, ShieldCheck } from "lucide-react";
import Reveal from "@/components/common/Reveal";

const items = [
  {
    icon: Lock,
    title: "Encrypted peer-to-peer media",
    description:
      "Audio and video use DTLS-SRTP between browsers. The server handles signaling and never carries the media itself.",
  },
  {
    icon: KeyRound,
    title: "Password-gated rooms",
    description:
      "Hosts can require a password before a guest reaches the waiting room, and change it on the next meeting.",
  },
  {
    icon: UserCheck,
    title: "Host-only controls",
    description:
      "Only the host can end the meeting for everyone. Ending starts a five-minute grace period before the room closes.",
  },
  {
    icon: ShieldCheck,
    title: "Signed sessions",
    description:
      "Accounts use signed JWTs in HttpOnly cookies, proxied through the app so mobile browsers keep them first-party.",
  },
];

export default function Security() {
  return (
    <section id="security" className="bg-night text-night-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="font-mono text-xs tracking-[0.02em] text-night-ink-3">
              Privacy
            </p>
            <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
              What keeps the room private
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-night-ink-2">
              The server sees room metadata, not your audio or video.
            </p>
          </Reveal>

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delay={index * 60}
                  className="border-t border-night-line pt-5"
                >
                  <Icon
                    className="h-[18px] w-[18px] text-night-ink-3"
                    strokeWidth={1.5}
                  />
                  <h3 className="mt-3 text-[15px] font-medium">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-[1.6] text-night-ink-2">
                    {item.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-night-line pt-6 font-mono text-[11px] text-night-ink-3">
          <span>React 19</span>
          <span aria-hidden="true">·</span>
          <span>WebRTC</span>
          <span aria-hidden="true">·</span>
          <span>Socket.IO</span>
          <span aria-hidden="true">·</span>
          <span>MongoDB</span>
        </div>
      </div>
    </section>
  );
}
