"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

export default function JoinPage() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const id = value.trim().replace(/^.*\//, "");
    if (!id) {
      return setError("Enter a meeting ID or a full invite link.");
    }
    router.push(`/meeting/${encodeURIComponent(id)}`);
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors duration-150 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-2 sm:px-6 sm:pt-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <BrandLogo href="/" size="md" />

            <h1 className="mt-6 text-2xl font-medium tracking-[-0.01em] text-ink">
              Join a meeting
            </h1>
            <p className="mt-1.5 text-sm text-ink-2">
              Paste the invite link or type the meeting ID to open the waiting
              room. No account needed.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="meeting-code"
                  className="mb-1.5 block text-[13px] font-medium text-ink"
                >
                  Meeting ID or link
                </label>
                <input
                  id="meeting-code"
                  autoFocus
                  type="text"
                  spellCheck={false}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError("");
                  }}
                  placeholder="meet-894-abc"
                  className="h-11 w-full rounded-lg border border-hairline bg-paper px-3.5 font-mono text-[13px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand focus:bg-surface"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-negative/25 bg-negative/5 p-3 text-[13px] text-negative">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
              >
                Continue to waiting room
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </form>

            <p className="mt-6 border-t border-hairline pt-5 text-[13px] leading-[1.6] text-ink-3">
              You can test the camera and microphone, and check browser
              permissions, before entering the room. Guest access lasts two
              hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
