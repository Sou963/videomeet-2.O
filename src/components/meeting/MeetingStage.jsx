"use client";

import { useMemo, useRef, useEffect } from "react";
import ParticipantGrid from "./ParticipantGrid";
import ParticipantCard from "./ParticipantCard";
import SelfVideo from "./SelfVideo";
import { ScreenShareIcon, CopyIcon, UsersIcon, CheckIcon } from "./icons";

export default function MeetingStage({
  viewMode = "gallery",
  localStream,
  localName,
  isHost,
  micEnabled,
  cameraEnabled,
  handRaised,
  isScreenSharing,
  remoteParticipants,
  raisedHands,
  reactionsMap,
  translationEnabled,
  meetingId,
  onCopyMeetingId,
  onStopScreenShare,
}) {
  const totalCount = 1 + remoteParticipants.length;

  // Detect who is sharing their screen
  const screenSharer = useMemo(() => {
    if (isScreenSharing) {
      return { isLocal: true, name: localName || "You", stream: localStream };
    }
    const remoteSharer = remoteParticipants.find((p) => p.screenSharing && p.stream);
    if (remoteSharer) {
      return { isLocal: false, name: remoteSharer.name, participant: remoteSharer };
    }
    return null;
  }, [isScreenSharing, localName, localStream, remoteParticipants]);

  // If someone is sharing screen or viewMode is 'speaker' with at least 1 remote participant
  const isSpeakerMode = viewMode === "speaker" || !!screenSharer;

  // Active speaker or focus participant in speaker view
  const activeFocus = useMemo(() => {
    if (screenSharer) return null; // screen share takes precedence
    // Prefer remote participant who has hand raised or first remote participant
    const raised = remoteParticipants.find((p) => raisedHands[p.peerId]);
    if (raised) return raised;
    return remoteParticipants[0] || null;
  }, [screenSharer, remoteParticipants, raisedHands]);

  return (
    <div className="relative flex-1 overflow-hidden bg-[#080B14] flex flex-col justify-center items-center">
      {/* ── Waiting State (When alone in meeting) ────────────────── */}
      {totalCount === 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-slate-800 bg-[#101624]/90 px-4 py-1.5 text-xs text-slate-300 shadow-xl backdrop-blur-xl">
          <UsersIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>You're the only one here. Share meeting link to invite others.</span>
        </div>
      )}

      {/* ── Gallery View ────────────────────────────────────────── */}
      {!isSpeakerMode ? (
        <ParticipantGrid
          localStream={localStream}
          localName={localName}
          isHost={isHost}
          micEnabled={micEnabled}
          cameraEnabled={cameraEnabled}
          handRaised={handRaised}
          isScreenSharing={isScreenSharing}
          remoteParticipants={remoteParticipants}
          raisedHands={raisedHands}
          reactionsMap={reactionsMap}
          muteOriginalAudio={translationEnabled}
          onCopyMeetingId={onCopyMeetingId}
          meetingId={meetingId}
        />
      ) : (
        /* ── Speaker Focus / Screen Share Mode ──────────────────── */
        <div className="relative flex flex-col h-full w-full p-2 sm:p-4 gap-3">
          {/* Main Focus Stage (Dominant) */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-[#101624] shadow-2xl">
            {screenSharer ? (
              /* Screen Share View */
              <div className="relative h-full w-full">
                {screenSharer.isLocal ? (
                  <video
                    ref={(el) => {
                      if (el && localStream) el.srcObject = localStream;
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-contain bg-black"
                  />
                ) : (
                  <video
                    ref={(el) => {
                      if (el && screenSharer.participant.stream) {
                        el.srcObject = screenSharer.participant.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-contain bg-black"
                  />
                )}

                {/* Top Overlay Banner */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#080B14]/85 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-lg backdrop-blur-md">
                    <ScreenShareIcon className="w-4 h-4 text-emerald-400" />
                    <span>{screenSharer.name} is sharing their screen</span>
                  </div>

                  {screenSharer.isLocal && (
                    <button
                      onClick={onStopScreenShare}
                      className="pointer-events-auto rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition"
                    >
                      Stop Sharing
                    </button>
                  )}
                </div>
              </div>
            ) : activeFocus ? (
              /* Active Speaker Participant Card */
              <ParticipantCard
                participant={activeFocus}
                isHost={activeFocus.role === "host"}
                handRaised={raisedHands[activeFocus.peerId]}
                muteOriginalAudio={translationEnabled}
                activeReaction={reactionsMap[activeFocus.peerId]}
                isScreenSharing={false}
              />
            ) : (
              /* Self Focus if alone in speaker mode */
              <SelfVideo
                localStream={localStream}
                name={localName}
                isHost={isHost}
                micEnabled={micEnabled}
                cameraEnabled={cameraEnabled}
                handRaised={handRaised}
                isScreenSharing={isScreenSharing}
                activeReaction={reactionsMap["local"]}
              />
            )}
          </div>

          {/* Smaller Participant Strip at bottom */}
          <div className="flex items-center gap-3 h-28 sm:h-36 shrink-0 overflow-x-auto pb-1 px-1">
            {/* Local Video Thumbnail */}
            <div className="h-full aspect-video shrink-0">
              <SelfVideo
                localStream={localStream}
                name={localName}
                isHost={isHost}
                micEnabled={micEnabled}
                cameraEnabled={cameraEnabled}
                handRaised={handRaised}
                isScreenSharing={isScreenSharing}
                activeReaction={reactionsMap["local"]}
              />
            </div>

            {/* Remote Participant Thumbnails */}
            {remoteParticipants
              .filter((p) => !activeFocus || p.peerId !== activeFocus.peerId || screenSharer)
              .map((p) => (
                <div key={p.peerId} className="h-full aspect-video shrink-0">
                  <ParticipantCard
                    participant={p}
                    isHost={p.role === "host"}
                    handRaised={raisedHands[p.peerId]}
                    muteOriginalAudio={translationEnabled}
                    activeReaction={reactionsMap[p.peerId]}
                    isScreenSharing={p.screenSharing}
                    compact={true}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
