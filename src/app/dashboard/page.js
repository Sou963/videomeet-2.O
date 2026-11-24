"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Plus,
  Lock,
  LogOut,
  Settings,
  History,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Users,
  AlertCircle,
  Trash2,
  Power,
  Timer,
} from "lucide-react";
import { api } from "@/lib/api";
import BrandLogo from "@/components/common/BrandLogo";

const labelClass = "mb-1.5 block text-[13px] font-medium text-ink";
const fieldClass =
  "h-11 w-full rounded-lg border border-hairline bg-paper px-3.5 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-brand focus:bg-surface";
const iconFieldClass = `${fieldClass} pl-10`;

function StatusDot({ status }) {
  const live = status === "live" || status === "active";
  const ended = status === "ended";
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-3">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ended ? "bg-ink-3" : live ? "bg-positive" : "bg-ink-3"
        }`}
      />
      {status || "ready"}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeLimit, setTimeLimit] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api("/auth/me"), api("/meetings", { cache: "no-store" })])
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
          timeLimit: timeLimit || undefined,
          maxParticipants: maxParticipants || undefined,
        }),
      });

      router.push(`/meeting/${meeting.meetingId}`);
    } catch (err) {
      setError(err.message || "Could not create the meeting. Try again.");
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

  async function toggleMeetingStatus(meetingId, currentStatus) {
    const newStatus =
      currentStatus === "active" || currentStatus === "live"
        ? "inactive"
        : "active";
    try {
      await api(`/meetings/${meetingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setMeetings((prev) =>
        prev.map((m) =>
          m.meetingId === meetingId ? { ...m, status: newStatus } : m
        )
      );
    } catch (err) {
      setError(err.message || "Could not update the meeting status.");
    }
  }

  async function deleteMeeting(meetingId) {
    if (!confirm("Delete this meeting?")) return;
    try {
      await api(`/meetings/${meetingId}`, { method: "DELETE" });
      setMeetings((prev) => prev.filter((m) => m.meetingId !== meetingId));
    } catch (err) {
      setError(err.message || "Could not delete the meeting.");
    }
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" size="md" />

          <div className="flex items-center gap-1">
            <Link
              href="/history"
              aria-label="Meeting history"
              className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              <History className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">History</span>
            </Link>

            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Log out</span>
            </button>

            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-raised text-[13px] font-medium text-ink">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
            Your meetings
          </h1>
          <p className="tnum font-mono text-xs text-ink-3">
            {user ? `Signed in as ${user.name}` : "Loading"} · {meetings.length} rooms
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-negative/25 bg-negative/5 p-3 text-[13px] text-negative">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-hairline bg-surface p-5 sm:p-6 lg:col-span-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Host a meeting</h2>
                <p className="mt-0.5 text-[13px] text-ink-2">
                  Start a room now or schedule it for later
                </p>
              </div>
              <Video className="h-[18px] w-[18px] shrink-0 text-ink-3" strokeWidth={1.5} />
            </div>

            <form onSubmit={createMeeting} className="mt-5 space-y-4">
              <div>
                <label htmlFor="meeting-title" className={labelClass}>
                  Meeting title
                </label>
                <input
                  id="meeting-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Weekly product sync"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="meeting-password" className={labelClass}>
                    Room password
                    <span className="ml-1 font-normal text-ink-3">optional</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                      strokeWidth={1.75}
                    />
                    <input
                      id="meeting-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="None"
                      className={iconFieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="meeting-schedule" className={labelClass}>
                    Schedule
                    <span className="ml-1 font-normal text-ink-3">optional</span>
                  </label>
                  <input
                    id="meeting-schedule"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="meeting-limit" className={labelClass}>
                    Time limit
                  </label>
                  <div className="relative">
                    <Timer
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                      strokeWidth={1.75}
                    />
                    <select
                      id="meeting-limit"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className={`${iconFieldClass} appearance-none`}
                    >
                      <option value={0}>No limit</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="meeting-cap" className={labelClass}>
                    Max participants
                  </label>
                  <div className="relative">
                    <Users
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                      strokeWidth={1.75}
                    />
                    <select
                      id="meeting-cap"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Number(e.target.value))}
                      className={`${iconFieldClass} appearance-none`}
                    >
                      <option value={0}>No limit</option>
                      <option value={2}>2 people</option>
                      <option value={5}>5 people</option>
                      <option value={10}>10 people</option>
                      <option value={25}>25 people</option>
                      <option value={50}>50 people</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                <span>{loading ? "Preparing room" : "Start meeting"}</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-5 sm:p-6 lg:col-span-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-medium text-ink">Join a meeting</h2>
                  <p className="mt-0.5 text-[13px] text-ink-2">
                    Enter a code or an invite link
                  </p>
                </div>
                <ArrowRight className="h-[18px] w-[18px] shrink-0 text-ink-3" strokeWidth={1.5} />
              </div>

              <form onSubmit={handleQuickJoin} className="mt-5 space-y-3">
                <div>
                  <label htmlFor="join-code" className={labelClass}>
                    Meeting ID or link
                  </label>
                  <input
                    id="join-code"
                    type="text"
                    spellCheck={false}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="meet-894-abc"
                    className={`${fieldClass} font-mono text-[13px]`}
                  />
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center rounded-lg border border-hairline bg-surface text-sm font-medium text-ink transition-colors duration-150 hover:bg-raised"
                >
                  Enter room
                </button>
              </form>
            </div>

            <p className="mt-6 border-t border-hairline pt-4 text-[13px] leading-[1.6] text-ink-3">
              You can test the camera and microphone before entering the room.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[15px] font-medium text-ink">
              Recent and scheduled
            </h2>
            <Link
              href="/history"
              className="text-[13px] text-brand transition-colors duration-150 hover:text-brand-hover"
            >
              Full history
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {meetings.length > 0 ? (
              meetings.map((m) => {
                const isScheduled = !!m.scheduledAt;
                const dateStr = isScheduled
                  ? new Date(m.scheduledAt).toLocaleString()
                  : new Date(m.createdAt).toLocaleDateString();

                return (
                  <div
                    key={m._id}
                    className="rounded-xl border border-hairline bg-surface p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[15px] font-medium text-ink">
                            {m.title || "Untitled meeting"}
                          </h3>
                          <StatusDot status={m.status} />
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                          <span className="tnum font-mono">{m.meetingId}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" strokeWidth={1.75} />
                            {dateStr}
                          </span>
                          {m.hasPassword && (
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" strokeWidth={1.75} />
                              Protected
                            </span>
                          )}
                          {m.timeLimit > 0 && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" strokeWidth={1.75} />
                              {m.timeLimit} min
                            </span>
                          )}
                          {m.maxParticipants > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" strokeWidth={1.75} />
                              Max {m.maxParticipants}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
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
                          onClick={() => toggleMeetingStatus(m.meetingId, m.status)}
                          disabled={m.status === "ended"}
                          title={
                            m.status === "ended"
                              ? "Ended meetings cannot be reactivated"
                              : m.status === "inactive"
                                ? "Activate meeting"
                                : "Deactivate meeting"
                          }
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Power className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {m.status === "ended"
                            ? "Ended"
                            : m.status === "inactive"
                              ? "Activate"
                              : "Deactivate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteMeeting(m.meetingId)}
                          aria-label="Delete meeting"
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 text-xs font-medium text-negative transition-colors duration-150 hover:bg-negative/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          <span className="sm:sr-only">Delete</span>
                        </button>

                        <button
                          type="button"
                          disabled={m.status === "inactive" || m.status === "ended"}
                          onClick={() => router.push(`/meeting/${m.meetingId}`)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Video className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
                <Video className="mx-auto h-5 w-5 text-ink-3" strokeWidth={1.5} />
                <h3 className="mt-3 text-[15px] font-medium text-ink">
                  No meetings yet
                </h3>
                <p className="mt-1 text-[13px] text-ink-2">
                  Use the form above to open your first room.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
