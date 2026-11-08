"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
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
  const previewRef = useRef(null);
  const streamRef = useRef(null);
  const cameraRef = useRef(true);
  const microphoneRef = useRef(true);

  const [meeting, setMeeting] = useState(null);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [camera, setCamera] = useState(true);
  const [microphone, setMicrophone] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    Promise.all([api(`/meetings/${meetingId}`), api("/auth/me")])
      .then(([meetingResponse, userResponse]) => {
        setMeeting(meetingResponse.meeting);
        setUser(userResponse.user);
      })
      .catch((requestError) => setError(requestError.message));
  }, [meetingId]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return undefined;

    let active = true;
    const requestMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    requestMedia({ video: true, audio: true })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        stream.getVideoTracks().forEach((track) => {
          track.enabled = cameraRef.current;
        });
        stream.getAudioTracks().forEach((track) => {
          track.enabled = microphoneRef.current;
        });

        if (previewRef.current) {
          previewRef.current.srcObject = stream;
        }
      })
      .catch((deviceError) => {
        if (!active) return;
        setError(
          deviceError.name === "NotAllowedError"
            ? "Allow camera and microphone access in your browser settings to continue."
            : `Camera/microphone unavailable: ${deviceError.message}`
        );
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = camera;
    });
  }, [camera]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = microphone;
    });
  }, [microphone]);

  async function join() {
    if (joining) return;
    setJoining(true);

    try {
      setError("");
      await api(`/meetings/${meetingId}/join`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsJoined(true);
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setJoining(false);
    }
  }

  const isHost =
    user &&
    meeting &&
    (meeting.hostId === user.id ||
      meeting.hostId?._id === user.id ||
      (typeof meeting.hostId === "object" &&
        meeting.hostId?._id?.toString() === user.id?.toString()));

  if (isJoined) {
    return (
      <MeetingRoom
        meetingId={meetingId}
        name={user?.name}
        title={meeting?.title}
        isHost={isHost}
        initialCameraEnabled={camera}
        initialMicEnabled={microphone}
        onLeave={() => router.push("/dashboard")}
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
          href="/dashboard"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-[#38BDF8]">
              <span>Ready to Join</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {meeting?.title || "Connecting to meeting..."}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Meeting ID: <span className="font-mono text-[#38BDF8]">{meetingId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Room Active
            </span>
          </div>
        </div>

        {/* Video Preview & Controls Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Camera preview tile (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-800 bg-[#080B14] shadow-xl">
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover scale-x-[-1] ${camera ? "" : "hidden"}`}
              />

              {!camera && (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#151D2E] to-[#101624]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] text-3xl font-bold text-white shadow-lg shadow-[#6366F1]/20">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Camera is turned off</p>
                </div>
              )}

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
                onClick={() => {
                  const next = !microphone;
                  microphoneRef.current = next;
                  setMicrophone(next);
                }}
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
                onClick={() => {
                  const next = !camera;
                  cameraRef.current = next;
                  setCamera(next);
                }}
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
                Connect directly with peer-to-peer encrypted WebRTC. Test your devices above before entering.
              </p>

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
                disabled={!meeting || !user || joining}
                onClick={join}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#6366F1] font-bold text-white shadow-xl shadow-[#6366F1]/25 transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{joining ? "Entering room…" : "Join Meeting Now"}</span>
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
