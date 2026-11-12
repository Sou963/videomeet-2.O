"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  clearMeetingAccessToken,
  getMeetingAccessToken,
  saveMeetingAccessToken,
} from "@/lib/api";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import BrandLogo from "@/components/common/BrandLogo";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
} from "@/components/meeting/icons";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const router = useRouter();

  const [meeting, setMeeting] = useState(null);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [camera, setCamera] = useState(true);
  const [microphone, setMicrophone] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMeeting() {
      try {
        const savedToken = getMeetingAccessToken(meetingId);
        if (savedToken) {
          try {
            const { meeting: restoredMeeting, identity } = await api(
              `/meetings/${meetingId}/session`
            );
            if (!active) return;
            setMeeting(restoredMeeting);
            setUser({ name: identity.name, id: identity.userId });
            setIsGuest(identity.role === "guest");
            setIsHost(identity.role === "host");
            setAccessToken(savedToken);
            setIsJoined(true);
            return;
          } catch (restoreError) {
            if ([401, 403, 404].includes(restoreError.status)) {
              clearMeetingAccessToken(meetingId);
            } else {
              if (active) setError(restoreError.message);
              return;
            }
          }
        }

        const { meeting: meetingInfo } = await api(`/meetings/${meetingId}/info`);
        if (!active) return;
        setMeeting(meetingInfo);

        try {
          const { user: authenticatedUser } = await api("/auth/me");
          if (!active) return;
          setUser(authenticatedUser);
          setDisplayName(authenticatedUser.name || "");

          try {
            const { meeting: fullMeeting } = await api(`/meetings/${meetingId}`);
            if (!active) return;
            setMeeting({ ...meetingInfo, ...fullMeeting });
            const hostId = fullMeeting.hostId?._id || fullMeeting.hostId;
            setIsHost(String(hostId) === String(authenticatedUser.id));
          } catch {
            // A valid guest link remains usable when the current user is not a member.
          }
        } catch {
          if (active) setUser(null);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    loadMeeting();
    return () => {
      active = false;
    };
  }, [meetingId]);

  async function join() {
    if (joining) return;
    setJoining(true);

    try {
      setError("");
      let access;
      if (user) {
        await api(`/meetings/${meetingId}/join`, {
          method: "POST",
          body: JSON.stringify({ password }),
        });
        access = await api(`/meetings/${meetingId}/access-token`, {
          method: "POST",
        });
      } else {
        access = await api(`/meetings/${meetingId}/guest-token`, {
          method: "POST",
          body: JSON.stringify({ name: displayName, password }),
        });
      }

      saveMeetingAccessToken(meetingId, access.token);
      if (access.role === "guest") {
        setUser({ name: access.name, id: null });
        setIsGuest(true);
      }
      setAccessToken(access.token);
      setIsHost(access.role === "host");
      setIsJoined(true);
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setJoining(false);
    }
  }

  if (isJoined) {
    return (
      <MeetingRoom
        meetingId={meetingId}
        name={user?.name}
        title={meeting?.title}
        isHost={isHost}
        timeLimit={meeting?.timeLimit || 0}
        maxParticipants={meeting?.maxParticipants || 0}
        accessToken={accessToken}
        isGuest={isGuest}
        initialCameraEnabled={camera}
        initialMicEnabled={microphone}
        onLeave={() => {
          clearMeetingAccessToken(meetingId);
          router.push(user?.id ? "/dashboard" : "/");
        }}
      />
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#080B14] p-4 text-[#F8FAFC] select-none">
      {/* Background radial gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#6366F1]/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[#38BDF8]/10 blur-[130px]" />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 w-full px-6 py-5 flex items-center justify-between z-20">
        <BrandLogo href="/" size="sm" theme="dark" showBadge={false} />

        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#101624] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <span>← Dashboard</span>
        </Link>
      </header>

      {/* Main Studio Card */}
      <section className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800/80 bg-[#101624]/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
        {/* Top Header inside card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-6 gap-3">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
              meeting?.status === "inactive" || meeting?.status === "ended"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-indigo-500/30 bg-indigo-500/10 text-[#38BDF8]"
            }`}>
              <span>
                {meeting?.status === "inactive" || meeting?.status === "ended"
                  ? "Meeting Unavailable"
                  : "Ready to Join"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {meeting?.title || "Connecting to meeting..."}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Meeting ID: <span className="font-mono text-[#38BDF8]">{meetingId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {meeting?.status === "inactive" || meeting?.status === "ended" ? (
              <span className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300">
                {meeting.status === "ended" ? "Meeting Ended" : "Meeting Deactivated"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Video Preview & Controls Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Camera preview tile (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-800 bg-[#080B14] shadow-xl">
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#151D2E] to-[#101624]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-3xl font-bold text-white shadow-lg shadow-[#6366F1]/20">
                  {(user?.name || displayName || "U")[0].toUpperCase()}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {camera ? "Camera will be requested after you join" : "Camera is off"}
                </p>
              </div>

              {/* Participant Pill overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{user?.name || "Attendee"}</span>
              </div>
            </div>

            {/* Quick preview device toggles */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setMicrophone((enabled) => !enabled)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold transition active:scale-95 ${
                  microphone
                    ? "border border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
                    : "border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                }`}
              >
                {microphone ? <MicIcon className="w-4 h-4 text-[#38BDF8]" /> : <MicOffIcon className="w-4 h-4" />}
                <span>{microphone ? "Microphone On" : "Microphone Muted"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCamera((enabled) => !enabled)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold transition active:scale-95 ${
                  camera
                    ? "border border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
                    : "border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
                }`}
              >
                {camera ? <VideoIcon className="w-4 h-4 text-[#38BDF8]" /> : <VideoOffIcon className="w-4 h-4" />}
                <span>{camera ? "Camera On" : "Camera Off"}</span>
              </button>
            </div>
          </div>

          {/* Right Configuration (5 cols) */}
          <div className="flex flex-col justify-between lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Join Settings</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Connect directly with peer-to-peer encrypted WebRTC. Camera and microphone are optional and will not be requested until after you join.
              </p>

              {!user && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Display Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    maxLength={60}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-[#151D2E] px-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-[#6366F1]"
                  />
                </div>
              )}

              {meeting?.hasPassword && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Meeting Password Required
                  </label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Enter meeting password"
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-[#151D2E] px-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-[#6366F1]"
                  />
                </div>
              )}

              {error && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs font-medium text-red-300">
                  <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={
                  !meeting ||
                  joining ||
                  (!user && displayName.trim().length < 2) ||
                  meeting.status === "inactive" ||
                  meeting.status === "ended"
                }
                onClick={join}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] font-bold text-white shadow-xl shadow-[#6366F1]/25 transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{joining ? "Entering room…" : "Join Meeting"}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>WebRTC direct connection • End-to-end encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
