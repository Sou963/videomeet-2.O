"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Clock,
  Lock,
  Copy,
  Check,
  Search,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

function StatusDot({ status }) {
  const live = status === "live" || status === "active";
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-3">
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-positive" : "bg-ink-3"}`}
      />
      {status || "ready"}
    </span>
  );
}

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    Promise.all([api("/auth/me"), api("/meetings")])
      .then(([userData, meetingData]) => {
        setCurrentUser(userData.user || null);
        setMeetings(meetingData.meetings || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function deleteMeeting(meetingId) {
    if (!confirm("Permanently delete this meeting?")) return;
    try {
      await api(`/meetings/${meetingId}`, { method: "DELETE" });
      setMeetings((prev) => prev.filter((m) => m.meetingId !== meetingId));
    } catch (err) {
      setError(err.message || "Could not delete the meeting.");
    }
  }

  function copyMeetingId(id) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredMeetings = meetings.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.meetingId && m.meetingId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <BrandLogo href="/" size="sm" />
          </div>
          <span className="tnum font-mono text-xs text-ink-3">
            {filteredMeetings.length} rooms
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
              Meeting history
            </h1>
            <p className="mt-1 text-[13px] text-ink-2">
              Past and scheduled rooms you have access to
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              strokeWidth={1.75}
            />
            <label htmlFor="history-search" className="sr-only">
              Search meetings
            </label>
            <input
              id="history-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or ID"
              className="h-11 w-full rounded-lg border border-hairline bg-surface pl-9 pr-3.5 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-negative/25 bg-negative/5 p-3 text-[13px] text-negative">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((m) => {
              const isHost =
                currentUser &&
                (m.hostId?._id === currentUser._id || m.hostId === currentUser._id);

              return (
                <article
                  key={m._id}
                  className="rounded-xl border border-hairline bg-surface p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-raised text-ink-2">
                        <Video className="h-4 w-4" strokeWidth={1.5} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-[15px] font-medium text-ink">
                            {m.title || "Untitled meeting"}
                          </h2>
                          <StatusDot status={m.status} />
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                          <span className="tnum font-mono">{m.meetingId}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" strokeWidth={1.75} />
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                          {m.hasPassword && (
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" strokeWidth={1.75} />
                              Password protected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
                      {isHost && (
                        <button
                          type="button"
                          onClick={() => deleteMeeting(m.meetingId)}
                          aria-label="Delete meeting"
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-negative transition-colors duration-150 hover:bg-negative/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          <span className="sm:sr-only">Delete</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => copyMeetingId(m.meetingId)}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
                      >
                        {copiedId === m.meetingId ? (
                          <>
                            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Copy ID
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/meeting/${m.meetingId}`)}
                        className="col-span-2 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-hover sm:col-span-1"
                      >
                        <Video className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Join room
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
              <p className="text-[13px] text-ink-2">
                {search
                  ? "No meetings match that search."
                  : "No meeting history yet."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
