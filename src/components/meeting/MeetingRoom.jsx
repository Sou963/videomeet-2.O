"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import useWebRTC from "@/hooks/useWebRTC";
import useMeetingFiles from "@/hooks/useMeetingFiles";
import useVoiceTranslation from "@/hooks/useVoiceTranslation";
import MeetingHeader from "./MeetingHeader";
import MeetingStage from "./MeetingStage";
import MeetingSidebar from "./MeetingSidebar";
import MeetingControls from "./MeetingControls";
import MeetingMoreMenu from "./MeetingMoreMenu";
import MeetingToast from "./MeetingToast";
import { api } from "@/lib/api";

export default function MeetingRoom({
  meetingId,
  name,
  title,
  isHost,
  isGuest = false,
  accessToken,
  timeLimit = 0,
  maxParticipants = 0,
  initialCameraEnabled = true,
  initialMicEnabled = true,
  meetingStatus = "active",
  hostEndedAt = null,
  deactivateAt = null,
  deactivatedAt = null,
  serverNow = null,
  onLeave,
}) {
  // ── Layout & View State ──────────────────────────────────────────
  const [viewMode, setViewMode] = useState("gallery"); // "gallery" | "speaker"
  const [sidebarTab, setSidebarTab] = useState(null); // null | "people" | "chat" | "translation"
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [endingRequest, setEndingRequest] = useState(false);
  const [meetingLifecycle, setMeetingLifecycle] = useState(() => ({
    status: meetingStatus,
    hostEndedAt,
    deactivateAt,
    deactivatedAt,
    serverNow,
  }));
  const [authoritativeNowMs, setAuthoritativeNowMs] = useState(null);
  const lifecycleClockRef = useRef({ serverNowMs: null, receivedAt: 0 });
  const deactivationRedirectRef = useRef(false);
  const onLeaveRef = useRef(onLeave);
  const timeLimitLeaveTimerRef = useRef(null);

  // ── Translation State ────────────────────────────────────────────
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [listenLanguage, setListenLanguage] = useState("en");

  const syncMeetingLifecycle = useCallback((details) => {
    if (!details) return;
    setMeetingLifecycle((current) => ({
      ...current,
      ...details,
      status: details.status || current.status,
    }));
    const serverNowMs = Date.parse(details.serverNow);
    if (Number.isFinite(serverNowMs)) {
      lifecycleClockRef.current = {
        serverNowMs,
        receivedAt: performance.now(),
      };
      setAuthoritativeNowMs(serverNowMs);
    }
  }, []);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  const handleMeetingEnding = useCallback((details) => {
    syncMeetingLifecycle({ ...details, status: "ending" });
    setTranslationEnabled(false);
    setToast({
      message: "The host has ended this meeting. This room will be deactivated in 5 minutes.",
      type: "warning",
      duration: 8000,
    });
  }, [syncMeetingLifecycle]);

  const handleMeetingDeactivated = useCallback((details) => {
    syncMeetingLifecycle({ ...details, status: "deactivated" });
    setTranslationEnabled(false);
    setToast({
      message: "This meeting has been deactivated.",
      type: "info",
      duration: 3000,
    });
    if (!deactivationRedirectRef.current) {
      deactivationRedirectRef.current = true;
      window.setTimeout(() => onLeaveRef.current?.("deactivated"), 2500);
    }
  }, [syncMeetingLifecycle]);

  const onFileNotification = useCallback(({ message, type }) => {
    setToast({ message, type });
  }, []);
  const fileSharing = useMeetingFiles({ meetingId, name, onNotify: onFileNotification });
  const { setPeerConnections } = fileSharing;
  const meetingCanStartActivities = ["active", "scheduled"].includes(meetingLifecycle.status);

  // ── Reactions Map (peerId -> emoji) ──────────────────────────────
  const [reactionsMap, setReactionsMap] = useState({});

  // ── WebRTC Hook ──────────────────────────────────────────────────
  const {
    localStream,
    remoteParticipants,
    connectionState,
    turnConfigured,
    error,
    mediaWarnings,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    handRaised,
    raisedHands,
    reactions,
    announcement,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    toggleRaiseHand,
    sendReaction,
    sendAnnouncement,
    removeParticipant,
    setError,
    socketRef,
    peerConnectionsRef,
  } = useWebRTC({
    meetingId,
    name,
    accessToken,
    onDataChannel: fileSharing.handleDataChannel,
    onSocketReady: fileSharing.handleSocket,
    onMeetingEnding: handleMeetingEnding,
    onMeetingDeactivated: handleMeetingDeactivated,
    canStartMedia: meetingCanStartActivities,
    initialCameraEnabled,
    initialMicEnabled,
  });

  useEffect(() => {
    setPeerConnections(peerConnectionsRef);
  }, [peerConnectionsRef, setPeerConnections]);

  // ── Voice Translation Hook ───────────────────────────────────────
  const translation = useVoiceTranslation({
    meetingId,
    participants: remoteParticipants,
    enabled: translationEnabled,
    language: listenLanguage,
  });

  const refreshMeetingLifecycle = useCallback(async () => {
    try {
      const current = await api(`/meetings/${meetingId}/status`);
      syncMeetingLifecycle(current);
      if (current.status === "ending") setTranslationEnabled(false);
      if (current.status === "deactivated") handleMeetingDeactivated(current);
    } catch (requestError) {
      if (![401, 403, 404].includes(requestError.status)) {
        setError(requestError.message || "Meeting status could not be refreshed.");
      }
    }
  }, [handleMeetingDeactivated, meetingId, setError, syncMeetingLifecycle]);

  useEffect(() => {
    const firstCheck = window.setTimeout(() => {
      void refreshMeetingLifecycle();
    }, 0);
    const interval = window.setInterval(
      refreshMeetingLifecycle,
      meetingLifecycle.status === "ending" ? 1500 : 15000
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshMeetingLifecycle();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(firstCheck);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [meetingId, meetingLifecycle.status, refreshMeetingLifecycle]);

  useEffect(() => {
    if (meetingLifecycle.status !== "ending") return;
    const interval = window.setInterval(() => {
      const { serverNowMs, receivedAt } = lifecycleClockRef.current;
      if (Number.isFinite(serverNowMs)) {
        setAuthoritativeNowMs(serverNowMs + (performance.now() - receivedAt));
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [meetingLifecycle.status]);

  const deactivationRemaining = useMemo(() => {
    if (meetingLifecycle.status !== "ending" || !meetingLifecycle.deactivateAt) return null;
    const deadline = Date.parse(meetingLifecycle.deactivateAt);
    if (!Number.isFinite(deadline) || !Number.isFinite(authoritativeNowMs)) return null;
    return Math.max(0, Math.ceil((deadline - authoritativeNowMs) / 1000));
  }, [authoritativeNowMs, meetingLifecycle]);

  const deactivationCountdown = useMemo(() => {
    if (deactivationRemaining === null) return "--:--";
    const minutes = Math.floor(deactivationRemaining / 60);
    const seconds = deactivationRemaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [deactivationRemaining]);

  // ── Elapsed Duration Timer ───────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const durationFormatted = useMemo(() => {
    const hrs = Math.floor(sessionSeconds / 3600);
    const mins = Math.floor((sessionSeconds % 3600) / 60);
    const secs = sessionSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [sessionSeconds]);

  // ── Time Limit Countdown ────────────────────────────────────────
  const timeLimitSeconds = timeLimit * 60;
  const remainingSeconds = timeLimitSeconds > 0 ? Math.max(0, timeLimitSeconds - sessionSeconds) : null;
  const warnedRef = useRef(false);

  useEffect(
    () => () => {
      if (timeLimitLeaveTimerRef.current) {
        window.clearTimeout(timeLimitLeaveTimerRef.current);
      }
    },
    []
  );

  const remainingFormatted = useMemo(() => {
    if (remainingSeconds === null) return null;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remainingSeconds]);

  // Warning at 5 minutes remaining
  useEffect(() => {
    if (remainingSeconds === null) return;
    if (["ending", "deactivated"].includes(meetingLifecycle.status)) {
      if (timeLimitLeaveTimerRef.current) {
        window.clearTimeout(timeLimitLeaveTimerRef.current);
        timeLimitLeaveTimerRef.current = null;
      }
      return;
    }
    if (remainingSeconds <= 300 && remainingSeconds > 0 && !warnedRef.current) {
      warnedRef.current = true;
      setToast({
        message: `⏰ Warning: Meeting will auto-end in ${Math.ceil(remainingSeconds / 60)} minute${Math.ceil(remainingSeconds / 60) === 1 ? "" : "s"}!`,
        type: "warning",
        duration: 8000,
      });
    }
    if (remainingSeconds <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Countdown transitions are exposed as derived state.
      setToast({ message: "⏰ Meeting time limit reached. Ending meeting...", type: "warning" });
      if (!timeLimitLeaveTimerRef.current) {
        timeLimitLeaveTimerRef.current = window.setTimeout(() => {
          timeLimitLeaveTimerRef.current = null;
          onLeaveRef.current?.();
        }, 2000);
      }
    }
  }, [meetingLifecycle.status, remainingSeconds, setToast]);

  // ── Handle Incoming Reactions ────────────────────────────────────
  useEffect(() => {
    if (!reactions || reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];
    if (!latest) return;

    const targetKey = latest.peerId || "remote";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The WebRTC hook exposes reactions as event-driven state.
    setReactionsMap((prev) => ({ ...prev, [targetKey]: latest.reaction }));

    const timer = setTimeout(() => {
      setReactionsMap((prev) => {
        const next = { ...prev };
        delete next[targetKey];
        return next;
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [reactions]);

  // Handle local self reaction trigger
  const handleLocalReaction = useCallback(
    (emoji) => {
      sendReaction(emoji);
      setReactionsMap((prev) => ({ ...prev, local: emoji }));
      setTimeout(() => {
        setReactionsMap((prev) => {
          const next = { ...prev };
          delete next.local;
          return next;
        });
      }, 3000);
    },
    [sendReaction]
  );

  // ── Copy Meeting Link Helper with Toast ──────────────────────────
  const handleCopyLink = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : meetingId;
    navigator.clipboard.writeText(url);
    setToast({
      message: "Meeting link copied to clipboard",
      type: "success",
    });
  }, [meetingId]);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(meetingId);
    setToast({
      message: `Meeting ID (${meetingId}) copied to clipboard`,
      type: "success",
    });
  }, [meetingId]);

  const handleEndMeeting = useCallback(async () => {
    if (endingRequest || !meetingCanStartActivities) return;
    setEndingRequest(true);
    try {
      const lifecycle = await api(`/meetings/${meetingId}/end`, { method: "POST" });
      syncMeetingLifecycle(lifecycle);
      setTranslationEnabled(false);
      setToast({
        message: "The host has ended this meeting. This room will be deactivated in 5 minutes.",
        type: "warning",
        duration: 8000,
      });
    } catch (requestError) {
      setError(requestError.message || "Could not end the meeting.");
    } finally {
      setEndingRequest(false);
    }
  }, [endingRequest, meetingCanStartActivities, meetingId, setError, syncMeetingLifecycle]);

  const meetingEnded = ["ending", "deactivated"].includes(meetingLifecycle.status);

  // ── Sidebar Toggle Handler ───────────────────────────────────────
  const handleToggleSidebar = useCallback((tab) => {
    setSidebarTab((current) => (current === tab ? null : tab));
  }, []);

  // ── Keyboard Shortcuts (M, V, H, C, P, Esc) ─────────────────────
  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if typing in input or textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "m") {
        e.preventDefault();
        toggleMic();
      } else if (key === "v") {
        e.preventDefault();
        toggleCamera();
      } else if (key === "h") {
        e.preventDefault();
        toggleRaiseHand();
      } else if (key === "c") {
        e.preventDefault();
        handleToggleSidebar("chat");
      } else if (key === "p") {
        e.preventDefault();
        handleToggleSidebar("people");
      } else if (e.key === "Escape") {
        setIsMoreMenuOpen(false);
        setSidebarTab(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMic, toggleCamera, toggleRaiseHand, handleToggleSidebar]);

  // ── Announcement Toast ───────────────────────────────────────────
  useEffect(() => {
    if (announcement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- The WebRTC hook exposes announcements as event-driven state.
      setToast({
        message: `📢 [${announcement.name}]: ${announcement.message}`,
        type: "info",
        duration: 5000,
      });
    }
  }, [announcement]);

  // ── Compute Translation Status ───────────────────────────────────
  const translationStatus = useMemo(() => {
    const statuses = Object.values(translation.statuses);
    if (statuses.includes("error")) return "error";
    if (statuses.includes("translating")) return "translating";
    if (statuses.includes("connected")) return "connected";
    if (translationEnabled) return "connecting";
    return "idle";
  }, [translation.statuses, translationEnabled]);

  const totalParticipants = 1 + remoteParticipants.length;

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#080B14] text-[#F8FAFC] overflow-hidden select-none">
      {/* ── Toast Notifications ───────────────────────────────────── */}
      <MeetingToast toast={toast} onDismiss={() => setToast(null)} />
      {turnConfigured === false && (
        <div className="z-20 border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs text-amber-200">
          TURN relay is not configured on the backend. Calls may fail across restrictive networks.
        </div>
      )}
      {error && (
        <div role="alert" className="z-20 border-b border-red-500/40 bg-red-950/80 px-4 py-2 text-center text-xs text-red-200">
          {error}
        </div>
      )}

      {/* ── Top Meeting Header ────────────────────────────────────── */}
      <MeetingHeader
        meetingId={meetingId}
        title={title}
        connectionState={connectionState}
        durationText={durationFormatted}
        remainingText={remainingFormatted}
        remainingSeconds={remainingSeconds}
        participantCount={totalParticipants}
        maxParticipants={maxParticipants}
        translationEnabled={translationEnabled}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onCopyMeetingId={handleCopyId}
        onToggleSidebar={handleToggleSidebar}
        activeSidebarTab={sidebarTab}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {(error || mediaWarnings.length > 0) && (
        <div
          role="status"
          className="absolute left-1/2 top-20 z-30 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-amber-500/30 bg-[#151D2E]/95 px-4 py-3 text-center text-xs text-amber-200 shadow-xl"
        >
          {error || mediaWarnings.join(" ")}
        </div>
      )}

      {/* ── Main Workspace: Video Stage + Collapsible Sidebar ─────── */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Main Video Stage */}
        <MeetingStage
          viewMode={viewMode}
          localStream={localStream}
          localName={name}
          isHost={isHost}
          micEnabled={micEnabled}
          cameraEnabled={cameraEnabled}
          handRaised={handRaised}
          isScreenSharing={isScreenSharing}
          remoteParticipants={remoteParticipants}
          raisedHands={raisedHands}
          reactionsMap={reactionsMap}
          translationEnabled={translationEnabled}
          meetingId={meetingId}
          onCopyMeetingId={handleCopyId}
          onStopScreenShare={stopScreenShare}
        />

        {/* Collapsible Right Sidebar */}
        <MeetingSidebar
          isOpen={sidebarTab !== null}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          onClose={() => setSidebarTab(null)}
          localName={name}
          isHost={isHost}
          remoteParticipants={remoteParticipants}
          raisedHands={raisedHands}
          handRaised={handRaised}
          onAnnounce={sendAnnouncement}
          onRemoveParticipant={removeParticipant}
          isGuest={isGuest}
          meetingId={meetingId}
          socketRef={socketRef}
          translationEnabled={translationEnabled}
          onToggleTranslation={setTranslationEnabled}
          listenLanguage={listenLanguage}
          onChangeLanguage={setListenLanguage}
          translationStatus={translationStatus}
          translationError={translation.error}
          fileSharing={fileSharing}
          meetingEnded={meetingEnded}
        />
      </div>

      {/* ── Floating Bottom Control Dock ──────────────────────────── */}
      <MeetingControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        isScreenSharing={isScreenSharing}
        handRaised={handRaised}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
        onToggleRaiseHand={toggleRaiseHand}
        onSendReaction={handleLocalReaction}
        onToggleSidebar={handleToggleSidebar}
        activeSidebarTab={sidebarTab}
        translationEnabled={translationEnabled}
        onOpenMoreMenu={() => setIsMoreMenuOpen((prev) => !prev)}
        onLeave={onLeave}
        meetingEnded={meetingEnded}
      />

      {/* ── More Options Dropdown Menu ────────────────────────────── */}
      <MeetingMoreMenu
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        meetingId={meetingId}
        title={title}
        isHost={isHost}
        onCopyLink={handleCopyLink}
        onEndMeeting={handleEndMeeting}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        meetingEnded={meetingEnded}
        endingRequest={endingRequest}
      />

      {meetingEnded && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-[#080B14]/95 p-6 text-center backdrop-blur-md">
          <section className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-[#151D2E] p-8 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
              <span className="text-xl" aria-hidden="true">⏱</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">
              {meetingLifecycle.status === "deactivated" ? "Meeting deactivated" : "Meeting ended"}
            </h2>
            {meetingLifecycle.status === "ending" ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  The host has ended this meeting. This room will be deactivated in 5 minutes.
                </p>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Room deactivation in
                </p>
                <p className="mt-1 font-mono text-5xl font-bold tracking-wider text-[#38BDF8]" aria-live="polite">
                  {deactivationCountdown}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                This meeting has been deactivated. Returning to the home page…
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
