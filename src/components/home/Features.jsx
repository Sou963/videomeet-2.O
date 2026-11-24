"use client";

import Reveal from "@/components/common/Reveal";
import {
  Video,
  Languages,
  MonitorUp,
  Paperclip,
  Users,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video and audio over WebRTC",
    description:
      "Each participant connects directly to the others, so media moves peer to peer instead of through a central server.",
  },
  {
    icon: Languages,
    title: "Live voice translation",
    description:
      "Choose Bengali or English in the call and the incoming audio is translated as it plays. The spoken language is detected for you.",
  },
  {
    icon: MonitorUp,
    title: "Screen sharing",
    description:
      "Share a window, a tab or the whole screen. Your camera track is swapped for the screen and restored when you stop.",
  },
  {
    icon: Paperclip,
    title: "Peer-to-peer file sharing",
    description:
      "Send files up to 25 MB over a data channel, with per-recipient progress and a cancel button. Files never touch the server.",
  },
  {
    icon: Users,
    title: "Chat, reactions and hand raising",
    description:
      "The sidebar holds messages, reactions, raised hands and host announcements without covering the video grid.",
  },
  {
    icon: Lock,
    title: "Password-gated rooms",
    description:
      "Hosts can require a password, set a time limit and a participant cap, and end the meeting for everyone.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.02em] text-ink-3">
            What is in the room
          </p>
          <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[34px]">
            What the room includes
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">
            Every one of these ships today. No demo mode, no placeholder
            screens.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 60}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-raised text-ink-2">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-[15px] font-medium text-ink">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-[1.6] text-ink-2">
                  {feature.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
