import { io } from "socket.io-client";

const configuredSocketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
const SOCKET_URL = (
  /^https?:\/\//i.test(configuredSocketUrl)
    ? configuredSocketUrl
    : `${configuredSocketUrl.startsWith("localhost") ? "http" : "https"}://${configuredSocketUrl}`
).replace(/\/+$/, "");

let activeSocket = null;

/**
 * Returns a shared Socket.IO instance. If one already exists and is
 * connected, it is reused. Otherwise a fresh connection is created.
 *
 * This avoids the bug where ChatPanel and MeetingRoom each created
 * their own socket causing duplicate join events and signaling races.
 */
export function getSocket() {
  if (activeSocket?.connected) return activeSocket;
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
  }
  activeSocket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
  return activeSocket;
}

/**
 * Disconnect and destroy the shared socket.
 */
export function destroySocket() {
  if (activeSocket) {
    activeSocket.removeAllListeners();
    activeSocket.disconnect();
    activeSocket = null;
  }
}

/**
 * Legacy alias kept for backward compat — same as getSocket.
 */
export const createSocket = getSocket;
