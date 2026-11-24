"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/common/Reveal";

export default function CTA() {
  return (
    <section className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="rounded-2xl border border-hairline bg-paper px-6 py-10 sm:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <p className="font-mono text-xs tracking-[0.02em] text-ink-3">
                Ready when you are
              </p>
              <h2 className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[34px]">
                Start a room and send the link
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink-2">
                Create an account to start a room and keep the meeting history,
                or join a call someone already sent you.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-brand px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                Create an account
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/join"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-hairline bg-surface px-5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-raised"
              >
                Join a meeting
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
