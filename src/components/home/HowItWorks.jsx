"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/common/Reveal";

const steps = [
  {
    step: "01",
    title: "Create a room",
    description:
      "Start a room from the dashboard in one click. Add a password, a time limit or a participant cap when the meeting needs them.",
  },
  {
    step: "02",
    title: "Share the link",
    description:
      "Send the meeting code or the full invite link. Guests enter a display name and join from the browser without an account.",
  },
  {
    step: "03",
    title: "Meet and translate",
    description:
      "Turn translation on for Bengali or English. The remote audio is muted locally while the translated track plays in its place.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="font-mono text-xs tracking-[0.02em] text-ink-3">
              From link to call
            </p>
            <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[34px]">
              Three steps, no installer
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-ink-2">
              Guests never install anything and never create an account. Hosts
              keep the controls.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
            >
              Open the dashboard
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </Reveal>

          <ol className="lg:col-span-8">
            {steps.map((item, index) => (
              <Reveal
                as="li"
                key={item.step}
                delay={index * 70}
                className="grid gap-2 border-t border-hairline py-6 last:border-b sm:grid-cols-[4rem_1fr] sm:gap-6"
              >
                <span className="tnum font-mono text-xs text-ink-3">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-[1.6] text-ink-2">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
