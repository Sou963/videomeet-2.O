"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket, destroySocket } from "@/lib/socket";
import { getIceServers, createPeer, replaceVideoTrack } from "@/lib/webrtc";

/**
 * useWebRTC — React hook that manages a full WebRTC mesh call.
 *
 * Handles:
 *  - Acquiring local media (camera + mic)
 *  - Connecting to Socket.IO and joining the meeting room
 *  - Creating RTCPeerConnections for each remote participant
 *  - Deterministic negotiation (lower socket ID offers)
 *  - ICE candidate queuing
 *  - Screen sharing with track replacement
 *  - Mic/camera toggle
 *  - Raise hand, reactions, host announcements
 *  - Proper cleanup on unmount
 *
 * @param {Object} opts
 * @param {string} opts.meetingId
 * @param {string} opts.name — local user display name
 * @param {() => void} opts.onMeetingEnded — called when host ends the meeting
 * @returns {Object}
 */
export default function useWebRTC({
  meetingId,
  name,
  onMeetingEnded,
  initialCameraEnabled = true,
  initialMicEnabled = true,
}) {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { [peerId]: { pc, close, handleSignal, maybeCreateOffer, name } }
  const iceServersRef = useRef(null);
  const mountedRef = useRef(true);
  const joinedRef = useRef(false);
  const screenStreamRef = useRef(null);
  const cameraEnabledRef = useRef(initialCameraEnabled);
  const micEnabledRef = useRef(initialMicEnabled);

  const [localStream, setLocalStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  // Each entry: { peerId, name, stream, audio, video }
  const [connectionState, setConnectionState] = useState("connecting");
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] = useState(initialMicEnabled);
  const [cameraEnabled, setCameraEnabled] = useState(initialCameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [raisedHands, setRaisedHands] = useState({}); // { peerId: bool }
  const [reactions, setReactions] = useState([]); // [{ id, peerId, reaction, name, ts }]
  const [announcement, setAnnouncement] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────

  const updateRemoteParticipant = useCallback((peerId, updater) => {
    setRemoteParticipants((prev) => {
      const map = new Map(prev.map((p) => [p.peerId, p]));
      const existing = map.get(peerId) || { peerId, name: "Participant" };
      map.set(peerId, { ...existing, ...updater });
      return [...map.values()];
    });
  }, []);

  const removePeer = useCallback((peerId) => {
    const entry = peersRef.current[peerId];
    if (entry) {
      entry.close();
      delete peersRef.current[peerId];
    }
    setRemoteParticipants((prev) => prev.filter((p) => p.peerId !== peerId));
    setRaisedHands((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const createPeerForRemote = useCallback(
    async (peerId, peerName) => {
      if (!peerId || peersRef.current[peerId]) return;
      const socket = socketRef.current;
      if (!socket?.connected) return;

      const peer = createPeer({
        iceServers: iceServersRef.current,
        localStream: localStreamRef.current,
        myId: socket.id,
        peerId,
        peerName,
        meetingId,
        socket,
        onRemoteStream: (pid, stream) => {
          updateRemoteParticipant(pid, { stream });
        },
        onDisconnected: (pid) => removePeer(pid),
      });

      peersRef.current[peerId] = { ...peer, name: peerName };

      // Show placeholder immediately so UI updates
      updateRemoteParticipant(peerId, {
        name: peerName,
        stream: null,
        audio: true,
        video: true,
      });

      // Deterministic: only one side creates the offer
      await peer.maybeCreateOffer();
    },
    [meetingId, updateRemoteParticipant, removePeer]
  );

  // ── Main connection effect ──────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    joinedRef.current = false;

    let cancelled = false;

    async function init() {
      // 1. Fetch ICE servers
      iceServersRef.current = await getIceServers();

      // 2. Get local media
      if (!navigator.mediaDevices?.getUserMedia) {
        setConnectionState("error");
        setError("This browser does not support video calls.");
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        if (cancelled) return;
        setConnectionState("error");
        setError(
          mediaErr.name === "NotAllowedError"
            ? "Allow camera and microphone access in your browser settings, then refresh."
            : `Camera/microphone unavailable: ${mediaErr.message}`
        );
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      stream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabledRef.current;
      });
      stream.getAudioTracks().forEach((track) => {
        track.enabled = micEnabledRef.current;
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // 3. Connect Socket.IO
      const socket = getSocket();
      socketRef.current = socket;

      // ── Socket event handlers (attached once) ──────────────────
      function onConnect() {
        if (joinedRef.current) return;
        joinedRef.current = true;
        socket.emit("join-room", { meetingId, name });
        socket.emit("media-status", {
          meetingId,
          audio: micEnabledRef.current,
          video: cameraEnabledRef.current,
          screenSharing: Boolean(screenStreamRef.current),
        });
        setConnectionState("connected");
      }

      function onRoomMembers(members = []) {
        members.forEach(({ peerId, name: peerName }) => {
          if (peerId && peerId !== socket.id) {
            createPeerForRemote(peerId, peerName);
          }
        });
      }

      function onPeerJoined({ peerId, name: peerName }) {
        if (peerId && peerId !== socket.id) {
          createPeerForRemote(peerId, peerName);
          socket.emit("media-status", {
            meetingId,
            audio: micEnabledRef.current,
            video: cameraEnabledRef.current,
            screenSharing: Boolean(screenStreamRef.current),
          });
        }
      }

      function onPeerLeft({ peerId }) {
        removePeer(peerId);
      }

      function onSignal({ from, signal }) {
        const entry = peersRef.current[from];
        if (entry) {
          entry.handleSignal(signal);
        } else {
          // Peer sent an offer before we created the connection.
          // Create the peer and then handle the signal.
          (async () => {
            if (!from || peersRef.current[from]) return;
            const peer = createPeer({
              iceServers: iceServersRef.current,
              localStream: localStreamRef.current,
              myId: socket.id,
              peerId: from,
              peerName: "Participant",
              meetingId,
              socket,
              onRemoteStream: (pid, s) => updateRemoteParticipant(pid, { stream: s }),
              onDisconnected: (pid) => removePeer(pid),
            });
            peersRef.current[from] = { ...peer, name: "Participant" };
            updateRemoteParticipant(from, { name: "Participant", stream: null });
            await peer.handleSignal(signal);
          })();
        }
      }

      function onMediaStatus({ peerId, audio, video }) {
        updateRemoteParticipant(peerId, { audio, video });
      }

      function onMeetingEnded_() {
        setConnectionState("ended");
        if (onMeetingEnded) onMeetingEnded();
      }

      function onRaiseHand({ peerId, raised }) {
        setRaisedHands((prev) => ({ ...prev, [peerId]: raised }));
      }

      function onReaction({ peerId, reaction, name: n }) {
        const id = `${peerId}-${Date.now()}`;
        setReactions((prev) => [...prev, { id, peerId, reaction, name: n, ts: Date.now() }]);
        // Auto-remove after 4 seconds
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 4000);
      }

      function onAnnouncement({ message, name: n }) {
        setAnnouncement({ message, name: n, ts: Date.now() });
        setTimeout(() => setAnnouncement(null), 8000);
      }

      function onSocketError({ message }) {
        setError(message);
      }

      function onConnectError() {
        setConnectionState("error");
        setError("Unable to reach the meeting signaling server.");
      }

      // Register all listeners
      socket.on("connect", onConnect);
      socket.on("room-members", onRoomMembers);
      socket.on("peer-joined", onPeerJoined);
      socket.on("peer-left", onPeerLeft);
      socket.on("webrtc-signal", onSignal);
      socket.on("media-status", onMediaStatus);
      socket.on("meeting-ended", onMeetingEnded_);
      socket.on("raise-hand", onRaiseHand);
      socket.on("reaction", onReaction);
      socket.on("host-announcement", onAnnouncement);
      socket.on("socket-error", onSocketError);
      socket.on("connect_error", onConnectError);

      // If already connected (reuse), trigger join manually
      if (socket.connected && !joinedRef.current) {
        onConnect();
      }
    }

    init();

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelled = true;
      mountedRef.current = false;
      joinedRef.current = false;

      // Leave the room
      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit("leave-meeting", { meetingId });
      }

      // Close all peer connections
      Object.values(peersRef.current).forEach((entry) => entry.close());
      peersRef.current = {};

      // Stop local media
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;

      // Stop screen share
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      // Destroy socket
      destroySocket();
      socketRef.current = null;

      setLocalStream(null);
      setRemoteParticipants([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, name]);

  // ── Mic toggle ─────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    setMicEnabled((prev) => {
      const next = !prev;
      micEnabledRef.current = next;
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      socketRef.current?.emit("media-status", {
        meetingId,
        audio: next,
        video: cameraEnabled,
        screenSharing: isScreenSharing,
      });
      return next;
    });
  }, [meetingId, cameraEnabled, isScreenSharing]);

  // ── Camera toggle ──────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    setCameraEnabled((prev) => {
      const next = !prev;
      cameraEnabledRef.current = next;
      localStreamRef.current?.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabled,
        video: next,
        screenSharing: isScreenSharing,
      });
      return next;
    });
  }, [meetingId, micEnabled, isScreenSharing]);

  // ── Screen share ───────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) {
        replaceVideoTrack(peersRef.current, screenVideoTrack);
      }

      // Handle browser native "Stop Sharing" button
      screenVideoTrack?.addEventListener("ended", () => {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (cameraTrack) {
          replaceVideoTrack(peersRef.current, cameraTrack);
        }
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
        socketRef.current?.emit("media-status", {
          meetingId,
          audio: micEnabled,
          video: cameraEnabled,
          screenSharing: false,
        });
      });

      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabled,
        video: cameraEnabled,
        screenSharing: true,
      });
    } catch {
      setError("Screen sharing was cancelled.");
    }
  }, [meetingId, micEnabled, cameraEnabled]);

  const stopScreenShare = useCallback(() => {
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      replaceVideoTrack(peersRef.current, cameraTrack);
    }
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
    socketRef.current?.emit("media-status", {
      meetingId,
      audio: micEnabled,
      video: cameraEnabled,
      screenSharing: false,
    });
  }, [meetingId, micEnabled, cameraEnabled]);

  // ── Raise hand ─────────────────────────────────────────────────
  const [handRaised, setHandRaised] = useState(false);
  const toggleRaiseHand = useCallback(() => {
    setHandRaised((prev) => {
      const next = !prev;
      socketRef.current?.emit("raise-hand", {
        meetingId,
        raised: next,
        name,
      });
      return next;
    });
  }, [meetingId, name]);

  // ── Reactions ──────────────────────────────────────────────────
  const sendReaction = useCallback(
    (reaction) => {
      socketRef.current?.emit("reaction", { meetingId, reaction, name });
    },
    [meetingId, name]
  );

  // ── Host announcement ──────────────────────────────────────────
  const sendAnnouncement = useCallback(
    (message) => {
      socketRef.current?.emit("host-announcement", {
        meetingId,
        message,
      });
    },
    [meetingId]
  );

  return {
    // State
    localStream,
    remoteParticipants,
    connectionState,
    error,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    handRaised,
    raisedHands,
    reactions,
    announcement,

    // Actions
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    toggleRaiseHand,
    sendReaction,
    sendAnnouncement,
    setError,

    // Refs (for ChatPanel to reuse the same socket)
    socketRef,
  };
}
