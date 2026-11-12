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
  accessToken,
  onMeetingEnded,
  initialCameraEnabled = true,
  initialMicEnabled = true,
}) {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { [peerId]: { pc, close, handleSignal, maybeCreateOffer, name } }
  const peerStatesRef = useRef({});
  const iceServersRef = useRef(null);
  const iceServersReadyRef = useRef(Promise.resolve());
  const mountedRef = useRef(true);
  const joinedRef = useRef(false);
  const socketListenersCleanupRef = useRef(null);
  const mediaRequestsRef = useRef(new Map());
  const onMeetingEndedRef = useRef(onMeetingEnded);
  const screenStreamRef = useRef(null);
  const cameraEnabledRef = useRef(initialCameraEnabled);
  const micEnabledRef = useRef(initialMicEnabled);
  const activeSocketIdRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  // Each entry: { peerId, name, stream, audio, video }
  const [connectionState, setConnectionState] = useState("connecting");
  const [turnConfigured, setTurnConfigured] = useState(null);
  const [error, setError] = useState("");
  const [micEnabled, setMicEnabled] = useState(initialMicEnabled);
  const [cameraEnabled, setCameraEnabled] = useState(initialCameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [raisedHands, setRaisedHands] = useState({}); // { peerId: bool }
  const [reactions, setReactions] = useState([]); // [{ id, peerId, reaction, name, ts }]
  const [announcement, setAnnouncement] = useState(null);
  const [mediaWarnings, setMediaWarnings] = useState([]);

  useEffect(() => {
    onMeetingEndedRef.current = onMeetingEnded;
  }, [onMeetingEnded]);

  // ── Helpers ──────────────────────────────────────────────────────

  const updateRemoteParticipant = useCallback((peerId, updater) => {
    setRemoteParticipants((prev) => {
      const map = new Map(prev.map((p) => [p.peerId, p]));
      const existing = map.get(peerId) || { peerId, name: "Participant" };
      map.set(peerId, { ...existing, ...updater });
      return [...map.values()];
    });
  }, []);

  const updatePeerConnectionStatus = useCallback(
    (peerId, status) => {
      peerStatesRef.current[peerId] = status;
      updateRemoteParticipant(peerId, { connectionState: status });

      const statuses = Object.values(peerStatesRef.current);
      if (statuses.includes("connected")) setConnectionState("connected");
      else if (statuses.includes("reconnecting")) setConnectionState("reconnecting");
      else if (statuses.length && statuses.every((state) => state === "failed")) {
        setConnectionState("failed");
      } else if (statuses.length) setConnectionState("waiting");
    },
    [updateRemoteParticipant]
  );

  const removePeer = useCallback((peerId) => {
    const entry = peersRef.current[peerId];
    if (entry) {
      entry.close();
      delete peersRef.current[peerId];
    }
    delete peerStatesRef.current[peerId];
    if (Object.keys(peerStatesRef.current).length === 0) {
      setConnectionState(socketRef.current?.connected ? "waiting" : "connecting");
    }
    setRemoteParticipants((prev) => prev.filter((p) => p.peerId !== peerId));
    setRaisedHands((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const requestMedia = useCallback((kind) => {
    const pending = mediaRequestsRef.current.get(kind);
    if (pending) return pending;

    const request = (async () => {
    const isAudio = kind === "audio";
    const setEnabled = isAudio ? setMicEnabled : setCameraEnabled;
    const enabledRef = isAudio ? micEnabledRef : cameraEnabledRef;
    const trackKind = isAudio ? "audio" : "video";
    const label = isAudio ? "microphone" : "camera";
    const existing = localStreamRef.current
      ?.getTracks()
      .find((track) => track.kind === trackKind && track.readyState === "live");

    if (existing) {
      existing.enabled = true;
      enabledRef.current = true;
      setEnabled(true);
      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabledRef.current,
        video: cameraEnabledRef.current,
        screenSharing: Boolean(screenStreamRef.current),
      });
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaWarnings((current) => [...new Set([...current, `${label[0].toUpperCase()}${label.slice(1)} is not available in this browser.`])]);
      enabledRef.current = false;
      setEnabled(false);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        isAudio ? { audio: true, video: false } : { audio: false, video: true }
      );
      if (!mountedRef.current) {
        stream.getTracks().forEach((item) => item.stop());
        return false;
      }
      const track = stream.getTracks().find((candidate) => candidate.kind === trackKind);
      if (!track) {
        stream.getTracks().forEach((item) => item.stop());
        throw new Error(`No ${label} detected.`);
      }

      track.enabled = enabledRef.current;
      track.addEventListener("ended", () => {
        enabledRef.current = false;
        setEnabled(false);
        setMediaWarnings((current) => [...new Set([...current, `${label[0].toUpperCase()}${label.slice(1)} was disconnected.`])]);
      }, { once: true });

      let local = localStreamRef.current;
      if (!local) {
        local = new MediaStream();
        localStreamRef.current = local;
      }
      local.addTrack(track);
      setLocalStream(new MediaStream(local.getTracks()));

      if (!screenStreamRef.current) {
        for (const peer of Object.values(peersRef.current)) {
          await peer.addLocalTrack(track);
        }
      }

      setEnabled(enabledRef.current);
      setMediaWarnings((current) => current.filter((warning) => !warning.toLowerCase().includes(label)));
      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabledRef.current,
        video: cameraEnabledRef.current,
        screenSharing: Boolean(screenStreamRef.current),
      });
      return true;
    } catch (error) {
      const message =
        error.name === "NotFoundError" || error.name === "OverconstrainedError"
          ? `No ${label} detected. You can still participate without it.`
          : error.name === "NotAllowedError" || error.name === "SecurityError"
            ? `${label[0].toUpperCase()}${label.slice(1)} permission was denied. Allow access in browser settings to enable it.`
            : error.name === "NotReadableError"
              ? `${label[0].toUpperCase()}${label.slice(1)} is unavailable or already in use.`
              : error.message || `Could not access the ${label}.`;
      enabledRef.current = false;
      setEnabled(false);
      setMediaWarnings((current) => [...new Set([...current, message])]);
      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabledRef.current,
        video: cameraEnabledRef.current,
        screenSharing: Boolean(screenStreamRef.current),
      });
      return false;
    }
    })();

    mediaRequestsRef.current.set(kind, request);
    void request.finally(() => {
      if (mediaRequestsRef.current.get(kind) === request) {
        mediaRequestsRef.current.delete(kind);
      }
    });
    return request;
  }, [meetingId]);

  const createPeerForRemote = useCallback(
    async (peerId, peerName, peerRole) => {
      if (!peerId) return;
      const existing = peersRef.current[peerId];
      if (existing) {
        if (existing.pc.connectionState !== "failed" && existing.pc.connectionState !== "closed") return;
        removePeer(peerId);
      }
      const socket = socketRef.current;
      if (!socket?.connected) return;
      await iceServersReadyRef.current;
      if (!socket.connected) return;

      const peer = createPeer({
        iceServers: iceServersRef.current,
        localStream: new MediaStream([
          ...(localStreamRef.current?.getAudioTracks() || []),
          ...(screenStreamRef.current?.getVideoTracks() ||
            localStreamRef.current?.getVideoTracks() ||
            []),
        ]),
        myId: socket.id,
        peerId,
        peerName,
        meetingId,
        socket,
        onRemoteStream: (pid, stream) => {
          updateRemoteParticipant(pid, { stream });
        },
        onConnectionStatus: updatePeerConnectionStatus,
      });

      peersRef.current[peerId] = { ...peer, name: peerName };
      peerStatesRef.current[peerId] = "connecting";

      // Show placeholder immediately so UI updates
      updateRemoteParticipant(peerId, {
        name: peerName,
        role: peerRole,
        stream: null,
        audio: true,
        video: true,
        connectionState: "connecting",
      });

      // Deterministic: only one side creates the offer
      await peer.maybeCreateOffer();
    },
    [meetingId, updateRemoteParticipant, updatePeerConnectionStatus, removePeer]
  );

  // ── Main connection effect ──────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    joinedRef.current = false;

    let cancelled = false;

    async function init() {
      iceServersReadyRef.current = getIceServers(meetingId).then((iceConfiguration) => {
        if (cancelled) return;
        iceServersRef.current = iceConfiguration.iceServers;
        setTurnConfigured(iceConfiguration.turnConfigured);
        if (!iceConfiguration.turnConfigured && process.env.NODE_ENV === "development") {
          console.warn(
            "[WebRTC] TURN is not configured on the backend; calls may fail on restrictive networks."
          );
        }
      });
      const socket = getSocket(accessToken);
      socketRef.current = socket;

      // ── Socket event handlers (attached once) ──────────────────
      function onConnect() {
        if (joinedRef.current && activeSocketIdRef.current === socket.id) return;
        if (activeSocketIdRef.current && activeSocketIdRef.current !== socket.id) {
          Object.values(peersRef.current).forEach((peer) => peer.close());
          peersRef.current = {};
          peerStatesRef.current = {};
          setRemoteParticipants([]);
        }
        activeSocketIdRef.current = socket.id;
        joinedRef.current = true;
        console.info("[WebRTC] Signaling socket connected", { socketId: socket.id });
        setError("");
        socket.emit("join-room", { meetingId });
        socket.emit("media-status", {
          meetingId,
          audio: micEnabledRef.current,
          video: cameraEnabledRef.current,
          screenSharing: Boolean(screenStreamRef.current),
        });
        setConnectionState("waiting");
      }

      function onDisconnect(reason) {
        console.warn("[WebRTC] Signaling socket disconnected", { reason });
        joinedRef.current = false;
        setConnectionState("reconnecting");
        Object.values(peersRef.current).forEach((entry) => entry.close());
        peersRef.current = {};
        peerStatesRef.current = {};
        setRemoteParticipants([]);
      }

      function onRoomMembers(members = []) {
        members.forEach(({ peerId, name: peerName, role }) => {
          if (peerId && peerId !== socket.id) {
            createPeerForRemote(peerId, peerName, role);
          }
        });
      }

      function onPeerJoined({ peerId, name: peerName, role }) {
        if (peerId && peerId !== socket.id) {
          createPeerForRemote(peerId, peerName, role);
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

      function onSignal({ from, signal, role }) {
        const entry = peersRef.current[from];
        if (entry) {
          entry.handleSignal(signal);
        } else {
          // Peer sent an offer before we created the connection.
          // Create the peer and then handle the signal.
          (async () => {
            if (!from || peersRef.current[from]) return;
            await iceServersReadyRef.current;
            if (!socket.connected || peersRef.current[from]) return;
            const peer = createPeer({
              iceServers: iceServersRef.current,
              localStream: new MediaStream([
                ...(localStreamRef.current?.getAudioTracks() || []),
                ...(screenStreamRef.current?.getVideoTracks() ||
                  localStreamRef.current?.getVideoTracks() ||
                  []),
              ]),
              myId: socket.id,
              peerId: from,
              peerName: "Participant",
              meetingId,
              socket,
              onRemoteStream: (pid, s) => updateRemoteParticipant(pid, { stream: s }),
              onConnectionStatus: updatePeerConnectionStatus,
            });
            peersRef.current[from] = { ...peer, name: "Participant", role };
            updateRemoteParticipant(from, {
              name: "Participant",
              role,
              stream: null,
              connectionState: "connecting",
            });
            peerStatesRef.current[from] = "connecting";
            await peer.handleSignal(signal);
          })();
        }
      }

      function onMediaStatus({ peerId, audio, video }) {
        updateRemoteParticipant(peerId, { audio, video });
      }

      function onMeetingEnded_() {
        setConnectionState("ended");
        onMeetingEndedRef.current?.();
      }

      function onParticipantRemoved() {
        setConnectionState("ended");
        setError("The host removed you from this meeting.");
        onMeetingEndedRef.current?.();
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

      function onConnectError(connectError) {
        console.error("[WebRTC] Signaling connection failed", {
          message: connectError.message,
        });
        setConnectionState("reconnecting");
        setError(
          "Cannot reach the meeting server. It may be suspended or unavailable; check the backend deployment."
        );
      }

      // Register all listeners
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("room-members", onRoomMembers);
      socket.on("peer-joined", onPeerJoined);
      socket.on("peer-left", onPeerLeft);
      socket.on("webrtc-signal", onSignal);
      socket.on("media-status", onMediaStatus);
      socket.on("meeting-ended", onMeetingEnded_);
      socket.on("participant-removed", onParticipantRemoved);
      socket.on("raise-hand", onRaiseHand);
      socket.on("reaction", onReaction);
      socket.on("host-announcement", onAnnouncement);
      socket.on("socket-error", onSocketError);
      socket.on("connect_error", onConnectError);
      socketListenersCleanupRef.current = () => {
        socket.off("connect", onConnect);
        socket.off("room-members", onRoomMembers);
        socket.off("peer-joined", onPeerJoined);
        socket.off("peer-left", onPeerLeft);
        socket.off("webrtc-signal", onSignal);
        socket.off("media-status", onMediaStatus);
        socket.off("meeting-ended", onMeetingEnded_);
        socket.off("participant-removed", onParticipantRemoved);
        socket.off("raise-hand", onRaiseHand);
        socket.off("reaction", onReaction);
        socket.off("host-announcement", onAnnouncement);
        socket.off("socket-error", onSocketError);
        socket.off("connect_error", onConnectError);
        socket.off("disconnect", onDisconnect);
      };

      // If already connected (reuse), trigger join manually
      if (socket.connected && !joinedRef.current) {
        onConnect();
      }

      console.info("[WebRTC] Local media tracks", {
        audioTracks: localStreamRef.current?.getAudioTracks().length || 0,
        videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
      });
      void (async () => {
        if (initialMicEnabled) await requestMedia("audio");
        if (initialCameraEnabled) await requestMedia("video");
      })();
    }

    init();

    // ── iOS / mobile: reconnect when returning from background ──
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      const socket = socketRef.current;
      if (socket && !socket.connected) {
        socket.connect();
      } else if (socket?.connected) {
        socket.emit("join-room", { meetingId });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handleVisibilityChange);

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelled = true;
      mountedRef.current = false;
      joinedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handleVisibilityChange);

      // Leave the room
      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit("leave-meeting", { meetingId });
      }
      socketListenersCleanupRef.current?.();
      socketListenersCleanupRef.current = null;

      // Close all peer connections
      Object.values(peersRef.current).forEach((entry) => entry.close());
      peersRef.current = {};

      // Stop local media
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;

      // Stop screen share
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      // Destroy this shared connection once the meeting room unmounts.
      destroySocket();
      socketRef.current = null;

      setLocalStream(null);
      setRemoteParticipants([]);
    };
    // The socket lifecycle belongs to the meeting, not to parent callback identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, name, accessToken, initialCameraEnabled, initialMicEnabled]);

  // ── Mic toggle ─────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    const next = !micEnabledRef.current;
    if (next) {
      micEnabledRef.current = true;
      setMicEnabled(true);
      await requestMedia("audio");
      return;
    }
    micEnabledRef.current = false;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setMicEnabled(false);
    socketRef.current?.emit("media-status", {
      meetingId,
      audio: false,
      video: cameraEnabledRef.current,
      screenSharing: Boolean(screenStreamRef.current),
    });
  }, [meetingId, requestMedia]);

  // ── Camera toggle ──────────────────────────────────────────────
  const toggleCamera = useCallback(async () => {
    const next = !cameraEnabledRef.current;
    if (next) {
      cameraEnabledRef.current = true;
      setCameraEnabled(true);
      await requestMedia("video");
      return;
    }
    cameraEnabledRef.current = false;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    setCameraEnabled(false);
    socketRef.current?.emit("media-status", {
      meetingId,
      audio: micEnabledRef.current,
      video: false,
      screenSharing: Boolean(screenStreamRef.current),
    });
  }, [meetingId, requestMedia]);

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
        for (const peer of Object.values(peersRef.current)) {
          await peer.addLocalTrack(screenVideoTrack);
        }
      }

      // Handle browser native "Stop Sharing" button
      screenVideoTrack?.addEventListener("ended", () => {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        replaceVideoTrack(peersRef.current, cameraTrack || null);
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
        socketRef.current?.emit("media-status", {
          meetingId,
          audio: micEnabledRef.current,
          video: cameraEnabledRef.current,
          screenSharing: false,
        });
      });

      socketRef.current?.emit("media-status", {
        meetingId,
        audio: micEnabledRef.current,
        video: cameraEnabledRef.current,
        screenSharing: true,
      });
    } catch {
      setError("Screen sharing was cancelled.");
    }
  }, [meetingId]);

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
      audio: micEnabledRef.current,
      video: cameraEnabledRef.current,
      screenSharing: false,
    });
  }, [meetingId]);

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

  const removeParticipant = useCallback(
    (peerId) => {
      socketRef.current?.emit("remove-participant", { meetingId, targetId: peerId });
    },
    [meetingId]
  );

  return {
    // State
    localStream,
    remoteParticipants,
    connectionState,
    turnConfigured,
    error,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    handRaised,
    raisedHands,
    reactions,
    announcement,
    mediaWarnings,

    // Actions
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    toggleRaiseHand,
    sendReaction,
    sendAnnouncement,
    removeParticipant,
    setError,

    // Refs (for ChatPanel to reuse the same socket)
    socketRef,
  };
}
