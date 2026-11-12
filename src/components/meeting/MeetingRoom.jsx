"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import useWebRTC from "@/hooks/useWebRTC";
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
  onLeave,
}) {
  // ── Layout & View State ──────────────────────────────────────────
  const [viewMode, setViewMode] = useState("gallery"); // "gallery" | "speaker"
  const [sidebarTab, setSidebarTab] = useState(null); // null | "people" | "chat" | "translation"
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // ── Translation State ────────────────────────────────────────────
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [listenLanguage, setListenLanguage] = useState("en");

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
  } = useWebRTC({
    meetingId,
    name,
    accessToken,
    onMeetingEnded: onLeave,
    initialCameraEnabled,
    initialMicEnabled,
  });

  // ── Voice Translation Hook ───────────────────────────────────────
  const translation = useVoiceTranslation({
    meetingId,
    participants: remoteParticipants,
    enabled: translationEnabled,
    language: listenLanguage,
  });

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

  const remainingFormatted = useMemo(() => {
    if (remainingSeconds === null) return null;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remainingSeconds]);

  // Warning at 5 minutes remaining
  useEffect(() => {
    if (remainingSeconds === null) return;
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
      setTimeout(() => onLeave(), 2000);
    }
  }, [remainingSeconds, onLeave, setToast]);

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
    try {
      await api(`/meetings/${meetingId}`, { method: "DELETE" });
      onLeave();
    } catch (requestError) {
      setError(requestError.message || "Could not end the meeting.");
    }
  }, [meetingId, onLeave, setError]);

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
      />
    </div>
  );
}
