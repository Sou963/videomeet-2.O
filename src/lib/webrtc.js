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

// ── ICE server cache ─────────────────────────────────────────────────
let cachedIceServers = null;

/**
 * Fetch ICE server config from the backend.
 * Falls back to a public STUN server if the request fails.
 */
export async function getIceServers() {
  if (cachedIceServers) return cachedIceServers;
  try {
    const data = await api("/webrtc/ice-servers");
    cachedIceServers = data.iceServers;
  } catch (error) {
    console.warn("[WebRTC] Could not load configured ICE servers; using STUN only:", error.message);
    cachedIceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  }
  return cachedIceServers;
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
 * @param {(peerId: string) => void} opts.onDisconnected
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
}) {
  const pc = new RTCPeerConnection({ iceServers });

  // Queue ICE candidates that arrive before remote description is set
  let remoteDescriptionSet = false;
  const candidateQueue = [];
  let disconnectTimer = null;
  let restartInProgress = false;
  let restartAttempts = 0;
  let lastRestartRequestAt = 0;

  // Add local tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }

  // ── Handle incoming remote track ─────────────────────────────────
  pc.ontrack = (event) => {
    const stream = event.streams?.[0];
    if (stream) onRemoteStream(peerId, stream);
  };

  // ── Send ICE candidates to remote peer ───────────────────────────
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    socket.emit("webrtc-signal", {
      meetingId,
      targetId: peerId,
      signal: { type: "candidate", candidate: event.candidate.toJSON() },
    });
  };

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
    if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
      restartAttempts = 0;
    } else if (pc.iceConnectionState === "failed") {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
      requestIceRestart();
    } else if (pc.iceConnectionState === "disconnected" && !disconnectTimer) {
      disconnectTimer = setTimeout(() => {
        disconnectTimer = null;
        if (pc.iceConnectionState === "disconnected") requestIceRestart();
      }, 10000);
    }
  };

  // ── Signal handler ───────────────────────────────────────────────
  async function handleSignal(signal) {
    try {
      if (signal.type === "ice-restart-request") {
        await restartIce();
      } else if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        remoteDescriptionSet = true;
        // Flush queued candidates
        for (const c of candidateQueue) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
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
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        remoteDescriptionSet = true;
        for (const c of candidateQueue) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
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
