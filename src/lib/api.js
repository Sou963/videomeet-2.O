const API = "/api";
const memoryMeetingTokens = new Map();

const meetingTokenKey = (meetingId) => `videomeet:meeting-access:${meetingId}`;

export function getMeetingAccessToken(meetingId) {
  try {
    return sessionStorage.getItem(meetingTokenKey(meetingId)) ||
      memoryMeetingTokens.get(meetingId) ||
      null;
  } catch {
    return memoryMeetingTokens.get(meetingId) || null;
  }
}

export function saveMeetingAccessToken(meetingId, token) {
  memoryMeetingTokens.set(meetingId, token);
  try {
    sessionStorage.setItem(meetingTokenKey(meetingId), token);
  } catch {
    return false;
  }
  return true;
}

export function clearMeetingAccessToken(meetingId) {
  memoryMeetingTokens.delete(meetingId);
  try {
    sessionStorage.removeItem(meetingTokenKey(meetingId));
  } catch {
    // The session is already unavailable if browser storage is disabled.
  }
  return true;
}

function meetingIdFromRequest(path, options) {
  const pathMeetingId = path.match(/^\/meetings\/([^/?]+)\/(?:messages|session)(?:[/?]|$)/)?.[1];
  if (pathMeetingId) return decodeURIComponent(pathMeetingId);

  const query = path.match(/[?&]meetingId=([^&]+)/)?.[1];
  if (query) return decodeURIComponent(query);

  if (typeof options.body === "string") {
    try {
      return JSON.parse(options.body).meetingId;
    } catch {
      return null;
    }
  }
  return null;
}

export async function api(path, options = {}) {
  const url = `${API}${path}`;
  const meetingId = meetingIdFromRequest(path, options);
  const meetingToken = meetingId ? getMeetingAccessToken(meetingId) : null;
  const headers = {
    "Content-Type": "application/json",
    ...(meetingToken ? { Authorization: `Bearer ${meetingToken}` } : {}),
    ...options.headers,
  };
  let response;

  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (error) {
    console.error("[API] Could not reach backend", {
      url,
      message: error.message,
    });
    throw new Error(
      "Cannot reach the VideoMeet server. It may be suspended or unavailable; check the backend deployment and try again."
    );
  }

  const body = await response.json().catch(() => ({
    success: false,
    message: "Network response was invalid",
  }));
  if (!response.ok || body.success === false) {
    const requestError = new Error(body.message || "Request failed");
    requestError.status = response.status;
    throw requestError;
  }
  return body.data;
}
