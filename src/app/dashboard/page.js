"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Plus,
  Link2,
  Calendar,
  Lock,
  LogOut,
  Settings,
  History,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Users,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";
import ReactLogo from "@/components/common/ReactLogo";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api("/auth/me"), api("/meetings")])
      .then(([userData, meetingData]) => {
        setUser(userData.user);
        setMeetings(meetingData.meetings || []);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function createMeeting(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { meeting } = await api("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || `${user?.name || "User"}'s Meeting`,
          password: password.trim() || undefined,
          scheduledAt: scheduledAt || undefined,
        }),
      });

      router.push(`/meeting/${meeting.meetingId}`);
    } catch (err) {
      setError(err.message || "Failed to create meeting.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const id = joinCode.trim().replace(/^.*\//, "");
    router.push(`/meeting/${encodeURIComponent(id)}`);
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    router.push("/");
  }

  function copyMeetingId(id) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-50/70 bg-grid-slate flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" size="md" />

          {/* Navigation Links & User Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>

            {/* User Avatar */}
            <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/20">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
              <ReactLogo className="h-3.5 w-3.5 text-cyan-600" animated={true} />
              <span>Interactive Dashboard</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {user ? user.name : "there"}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Start an instant room, schedule a future meeting, or join an active session.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Action Cards */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Card 1: Create Meeting (7 cols) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-8 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                  <Video className="h-6 w-6 text-cyan-200" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Host a New Meeting
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create an instant room or schedule for later
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Instant Ready
              </span>
            </div>

            <form onSubmit={createMeeting} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Product Sync"
                  className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Room Password (Optional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional password"
                      className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Schedule Time (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98] disabled:opacity-60"
              >
                <Plus className="h-5 w-5 text-cyan-300" />
                <span>{loading ? "Preparing room…" : "Launch Meeting Room"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>

          {/* Card 2: Join Meeting with ID (5 cols) */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-xs">
                  <Link2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Join with Code
                  </h2>
                  <p className="text-xs text-slate-500">
                    Jump into someone else's room
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickJoin} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Meeting ID or Link
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. room-749-xyz"
                    className="h-12 w-full rounded-2xl border border-slate-300/80 bg-slate-50/50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white font-bold text-slate-800 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 active:scale-[0.98]"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Info badge */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>You can test your camera &amp; mic in the waiting room.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent & Upcoming Meetings List */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Recent &amp; Scheduled Meetings
              </h2>
              <p className="text-xs text-slate-500">
                Quick access to your created video rooms
              </p>
            </div>

            <Link
              href="/history"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Full History →
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {meetings.length > 0 ? (
              meetings.map((m) => {
                const isScheduled = !!m.scheduledAt;
                const dateStr = isScheduled
                  ? new Date(m.scheduledAt).toLocaleString()
                  : new Date(m.createdAt).toLocaleDateString();

                return (
                  <div
                    key={m._id}
                    className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Video className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {m.title || "Untitled Meeting"}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              m.status === "live"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {m.status || "ready"}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="font-mono text-slate-700">{m.meetingId}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dateStr}
                          </span>
                          {m.hasPassword && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Lock className="h-3 w-3" />
                                Protected
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
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Video className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  No meetings created yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use the card above to host your first video conference in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
