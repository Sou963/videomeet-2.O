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
  Calendar,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    api("/meetings")
      .then(({ meetings }) => setMeetings(meetings || []))
      .catch((e) => setError(e.message));
  }, []);

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
    <div className="min-h-screen bg-slate-50/70 bg-grid-slate flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <BrandLogo href="/" size="sm" showBadge={false} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl w-full flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Meeting History
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review your past and upcoming meeting sessions
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or ID..."
              className="h-11 w-full rounded-2xl border border-slate-300/80 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((m) => (
              <article
                key={m._id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Video className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-slate-900 text-base">
                        {m.title || "Untitled Meeting"}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {m.status || "ready"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono text-slate-700">{m.meetingId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                      {m.hasPassword && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600">
                            <Lock className="h-3 w-3" />
                            Password Protected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyMeetingId(m.meetingId)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {copiedId === m.meetingId ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/meeting/${m.meetingId}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Join Room</span>
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
              <p className="text-sm text-slate-500">
                {search ? "No meetings match your search query." : "No meeting history found."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
