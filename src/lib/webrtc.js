/**
 * webrtc.js — Reusable WebRTC helpers for VideoMeet.
 *
 * This module provides:
 *  - ICE server fetching from the backend
 *  - Peer connection factory with ICE candidate queuing
 *  - Deterministic negotiation (lower socket ID creates the offer)
 *  - Track management helpers
 */

import { api } from "./api";

/**
 * Fetch ICE server config from the backend.
 * TURN credentials are fetched per call so short-lived credentials can rotate.
 */
export async function getIceServers() {
  try {
    const data = await api("/webrtc/ice-servers");
    if (!Array.isArray(data.iceServers) || data.iceServers.length === 0) {
      throw new Error("Backend returned no ICE servers");
    }
    return {
      iceServers: data.iceServers,
      turnConfigured: Boolean(data.turnConfigured),
    };
  } catch (error) {
    console.error("[WebRTC] Could not load backend ICE configuration:", error.message);
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
      ],
      turnConfigured: false,
    };
  }
}

// ── Peer wrapper ─────────────────────────────────────────────────────

/**
 * Creates and returns a wrapped RTCPeerConnection with built-in
 * ICE candidate queuing and deterministic negotiation.
 *
 * @param {Object} opts
 * @param {RTCIceServer[]} opts.iceServers
 * @param {MediaStream|null} opts.localStream — local media to add
 * @param {string} opts.myId — our socket ID
 * @param {string} opts.peerId — remote socket ID
 * @param {string} opts.peerName — display name of remote peer
 * @param {string} opts.meetingId
 * @param {import("socket.io-client").Socket} opts.socket
 * @param {(peerId: string, stream: MediaStream) => void} opts.onRemoteStream
 * @param {(peerId: string, state: string) => void} opts.onConnectionStatus
 * @returns {{ pc: RTCPeerConnection, close: () => void, handleSignal: (signal: any) => Promise<void> }}
 */
export function createPeer({
  iceServers,
  localStream,
  myId,
  peerId,
  peerName,
  meetingId,
  socket,
  onRemoteStream,
  onConnectionStatus,
}) {
  const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 4 });

  // Queue ICE candidates that arrive before remote description is set
  let remoteDescriptionSet = false;
  const candidateQueue = [];
  let incomingSignals = Promise.resolve();
  let remoteStream = new MediaStream();
  let disconnectTimer = null;
  let statsTimer = null;
  let restartInProgress = false;
  let restartAttempts = 0;
  let lastRestartRequestAt = 0;

  // Add local tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }

  // ── Handle incoming remote track ─────────────────────────────────
  pc.ontrack = ({ track }) => {
    const previousTrack = remoteStream
      .getTracks()
      .find((remoteTrack) => remoteTrack.kind === track.kind);
    if (previousTrack && previousTrack.id !== track.id) {
      remoteStream.removeTrack(previousTrack);
    }
    if (!remoteStream.getTracks().some((remoteTrack) => remoteTrack.id === track.id)) {
      remoteStream.addTrack(track);
    }
    onRemoteStream(peerId, new MediaStream(remoteStream.getTracks()));
    console.info("[WebRTC] Remote media track received", {
      peerId,
      kind: track.kind,
      audioTracks: remoteStream.getAudioTracks().length,
      videoTracks: remoteStream.getVideoTracks().length,
    });
    track.addEventListener("ended", () => {
      remoteStream.removeTrack(track);
      onRemoteStream(peerId, new MediaStream(remoteStream.getTracks()));
    }, { once: true });
  };

  // ── Send ICE candidates to remote peer ───────────────────────────
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    console.debug("[WebRTC] Sending trickled ICE candidate", { peerId });
    socket.emit("webrtc-signal", {
      meetingId,
      targetId: peerId,
      signal: { type: "candidate", candidate: event.candidate.toJSON() },
    });
  };

  async function logStats() {
    try {
      const stats = await pc.getStats();
      const reports = [...stats.values()];
      const inbound = reports.filter((report) => report.type === "inbound-rtp");
      const outbound = reports.filter((report) => report.type === "outbound-rtp");
      const selectedPair = reports.find(
        (report) =>
          report.type === "candidate-pair" &&
          (report.selected || (report.nominated && report.state === "succeeded"))
      );
      const localCandidate = selectedPair && stats.get(selectedPair.localCandidateId);
      const remoteCandidate = selectedPair && stats.get(selectedPair.remoteCandidateId);

      console.info("[WebRTC] Peer media stats", {
        peerId,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        candidatePair: selectedPair?.state || "unselected",
        localCandidateType: localCandidate?.candidateType || "unknown",
        remoteCandidateType: remoteCandidate?.candidateType || "unknown",
        audioBytesReceived: inbound
          .filter((report) => report.kind === "audio" || report.mediaType === "audio")
          .reduce((total, report) => total + (report.bytesReceived || 0), 0),
        videoBytesReceived: inbound
          .filter((report) => report.kind === "video" || report.mediaType === "video")
          .reduce((total, report) => total + (report.bytesReceived || 0), 0),
        audioBytesSent: outbound
          .filter((report) => report.kind === "audio" || report.mediaType === "audio")
          .reduce((total, report) => total + (report.bytesSent || 0), 0),
        videoBytesSent: outbound
          .filter((report) => report.kind === "video" || report.mediaType === "video")
          .reduce((total, report) => total + (report.bytesSent || 0), 0),
      });
    } catch (error) {
      console.warn("[WebRTC] Could not read peer stats:", error.message);
    }
  }

  function reportConnectionStatus() {
    const iceState = pc.iceConnectionState;
    const state =
      iceState === "connected" || iceState === "completed"
        ? "connected"
        : iceState === "failed"
          ? "failed"
          : iceState === "disconnected"
            ? "reconnecting"
            : iceState === "checking"
              ? "waiting"
              : "connecting";

    onConnectionStatus(peerId, state);
    console.info("[WebRTC] Peer connection status", {
      peerId,
      signalingState: pc.signalingState,
      gatheringState: pc.iceGatheringState,
      iceConnectionState: iceState,
      connectionState: pc.connectionState,
    });
  }

  async function restartIce() {
    if (
      myId > peerId ||
      restartInProgress ||
      restartAttempts >= 3 ||
      pc.signalingState !== "stable" ||
      !socket.connected
    ) {
      return;
    }

    restartInProgress = true;
    restartAttempts += 1;
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      socket.emit("webrtc-signal", {
        meetingId,
        targetId: peerId,
        signal: offer,
      });
    } catch (err) {
      console.warn("[WebRTC] ICE restart failed:", err.message);
    } finally {
      restartInProgress = false;
    }
  }

  function requestIceRestart() {
    if (myId < peerId) {
      restartIce();
      return;
    }

    const now = Date.now();
    if (now - lastRestartRequestAt < 10000 || !socket.connected) return;
    lastRestartRequestAt = now;
    socket.emit("webrtc-signal", {
      meetingId,
      targetId: peerId,
      signal: { type: "ice-restart-request" },
    });
  }

  // ── Monitor connection state ─────────────────────────────────────
  pc.oniceconnectionstatechange = () => {
    reportConnectionStatus();
    if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
      restartAttempts = 0;
      if (!statsTimer) {
        logStats();
        statsTimer = setInterval(logStats, 15000);
      }
    } else if (pc.iceConnectionState === "failed") {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
      clearInterval(statsTimer);
      statsTimer = null;
      requestIceRestart();
    } else if (pc.iceConnectionState === "disconnected" && !disconnectTimer) {
      clearInterval(statsTimer);
      statsTimer = null;
      disconnectTimer = setTimeout(() => {
        disconnectTimer = null;
        if (pc.iceConnectionState === "disconnected") requestIceRestart();
      }, 10000);
    }
  };

  pc.onicegatheringstatechange = () => {
    console.info("[WebRTC] ICE gathering state", {
      peerId,
      state: pc.iceGatheringState,
    });
  };

  pc.onicecandidateerror = (event) => {
    console.warn("[WebRTC] ICE candidate gathering error", {
      peerId,
      url: event.url,
      errorCode: event.errorCode,
      errorText: event.errorText,
    });
  };

  pc.onsignalingstatechange = () => {
    console.info("[WebRTC] Signaling state", {
      peerId,
      state: pc.signalingState,
    });
  };

  pc.onconnectionstatechange = () => {
    console.info("[WebRTC] Peer connection state", {
      peerId,
      state: pc.connectionState,
    });
    if (pc.connectionState === "closed") {
      onConnectionStatus(peerId, "failed");
    }
  };

  // ── Signal handler ───────────────────────────────────────────────
  async function processSignal(signal) {
    try {
      if (signal.type === "ice-restart-request") {
        await restartIce();
      } else if (signal.type === "offer") {
        remoteDescriptionSet = false;
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        remoteDescriptionSet = true;
        // Flush queued candidates
        for (const c of candidateQueue) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (error) {
            console.warn("[WebRTC] Could not add queued ICE candidate:", error.message);
          }
        }
        candidateQueue.length = 0;

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-signal", {
          meetingId,
          targetId: peerId,
          signal: answer,
        });
      } else if (signal.type === "answer") {
        remoteDescriptionSet = false;
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        remoteDescriptionSet = true;
        for (const c of candidateQueue) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (error) {
            console.warn("[WebRTC] Could not add queued ICE candidate:", error.message);
          }
        }
        candidateQueue.length = 0;
      } else if (signal.type === "candidate" && signal.candidate) {
        if (remoteDescriptionSet) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          candidateQueue.push(signal.candidate);
        }
      }
    } catch (err) {
      console.warn("[WebRTC] Signal handling error:", err.message);
    }
  }

  function handleSignal(signal) {
    incomingSignals = incomingSignals.then(() => processSignal(signal));
    return incomingSignals;
  }

  // ── Deterministic negotiation: lower socket ID creates offer ─────
  async function maybeCreateOffer() {
    if (myId < peerId) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-signal", {
          meetingId,
          targetId: peerId,
          signal: offer,
        });
      } catch (err) {
        console.warn("[WebRTC] Offer creation error:", err.message);
      }
    }
    // If myId > peerId, we wait for the other peer to send us an offer.
  }

  function close() {
    clearTimeout(disconnectTimer);
    clearInterval(statsTimer);
    try {
      pc.close();
    } catch {
      /* already closed */
    }
  }

  return { pc, close, handleSignal, maybeCreateOffer };
}

/**
 * Replace the video track on all senders in the given peer connections map.
 * Used for screen-share → camera restore flow.
 */
export function replaceVideoTrack(peersMap, newTrack) {
  for (const entry of Object.values(peersMap)) {
    const sender = entry.pc
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender) sender.replaceTrack(newTrack).catch(() => {});
  }
}
