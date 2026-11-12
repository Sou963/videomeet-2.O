"use client";

import ParticipantCard from "./ParticipantCard";
import SelfVideo from "./SelfVideo";

export default function ParticipantGrid({
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
  muteOriginalAudio,
  onCopyMeetingId,
  meetingId,
}) {
  const totalCount = 1 + remoteParticipants.length;

  // Grid styling based on total participants
  const getGridClasses = () => {
    if (totalCount === 1) {
      return "grid-cols-1 max-w-4xl mx-auto";
    }
    if (totalCount === 2) {
      return "grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto";
    }
    if (totalCount <= 4) {
      return "grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto";
    }
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto";
  };

  return (
    <div className={`grid ${getGridClasses()} gap-3 sm:gap-4 h-full w-full items-center justify-center p-2 sm:p-4 overflow-y-auto`}>
      {/* Local User Card */}
      <div className="h-full max-h-[calc(100vh-170px)] aspect-video w-full">
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

      {/* Remote Participants */}
      {remoteParticipants.map((p) => (
        <div key={p.peerId} className="h-full max-h-[calc(100vh-170px)] aspect-video w-full">
          <ParticipantCard
            participant={p}
            isHost={p.role === "host"}
            handRaised={raisedHands[p.peerId]}
            muteOriginalAudio={muteOriginalAudio}
            activeReaction={reactionsMap[p.peerId]}
            isScreenSharing={p.screenSharing}
          />
        </div>
      ))}
    </div>
  );
}
