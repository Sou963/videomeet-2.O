"use client";

import { Check } from "lucide-react";
import Reveal from "@/components/common/Reveal";

const useCases = [
  {
    title: "Remote teams",
    label: "Standups and reviews",
    description:
      "Daily syncs, design reviews and planning, with the chat and file sharing a working session needs.",
    points: ["Screen sharing", "File sharing", "Group chat"],
  },
  {
    title: "Classes and tutoring",
    label: "Teaching",
    description:
      "Lectures and small study rooms, with raised hands and reactions so quieter students still get heard.",
    points: ["Hand raising", "Reactions", "Room codes"],
  },
  {
    title: "Cross-border teams",
    label: "Two languages, one call",
    description:
      "Run one call in Bengali and English at the same time. Each person picks the language they listen in.",
    points: ["en ↔ bn audio", "Per-person language", "One shared call"],
  },
  {
    title: "Friends and family",
    label: "Personal calls",
    description:
      "A link and a display name is enough. Guest access lasts two hours and needs no download.",
    points: ["Guest join", "Mobile browser", "No install"],
  },
];

export default function UseCases() {
  return (
    <section className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.02em] text-ink-3">
            Where it fits
          </p>
          <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[34px]">
            Built for small rooms, not stadiums
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">
            Calls stay peer to peer, which keeps them fast and private, and keeps
            the room small on purpose.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 60}
              className="border-t border-hairline pt-5"
            >
              <p className="font-mono text-[11px] text-ink-3">{item.label}</p>
              <h3 className="mt-1.5 text-[15px] font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-[1.6] text-ink-2">
                {item.description}
              </p>

              <ul className="mt-4 space-y-1.5">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-xs text-ink-3"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
