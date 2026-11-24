"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/common/Reveal";

export default function QuickJoin() {
  const [meetingId, setMeetingId] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!meetingId.trim()) return;

    const value = meetingId.trim().replace(/^.*\//, "");
    router.push(`/meeting/${encodeURIComponent(value)}`);
  };

  return (
    <section className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <Reveal className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-xl font-medium tracking-[-0.01em] text-ink">
              Have a meeting code?
            </h2>
            <p className="mt-1.5 max-w-sm text-sm text-ink-2">
              Paste the meeting ID or the full invite link. Guest access lasts
              two hours and needs no account.
            </p>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleJoin} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="quick-join" className="sr-only">
                Meeting ID or invite link
              </label>
              <input
                id="quick-join"
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="meet-894-abc"
                className="h-11 w-full rounded-lg border border-hairline bg-paper px-3.5 font-mono text-[13px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand focus:bg-surface"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                Join meeting
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>

            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
              <span>Encrypted peer-to-peer media</span>
              <span aria-hidden="true">·</span>
              <span>Works in current browsers</span>
              <span aria-hidden="true">·</span>
              <span>No install</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
