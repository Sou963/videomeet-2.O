function serviceUrl(value, fallback, suffix = "") {
  let url = value || fallback;
  if (!/^https?:\/\//i.test(url)) {
    url = `${url.startsWith("localhost") ? "http" : "https"}://${url}`;
  }
  url = url.replace(/\/+$/, "");
  if (suffix && !url.endsWith(suffix)) url += suffix;
  return url;
}

const API = serviceUrl(
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:5000/api",
  "/api"
);

export async function api(path, options = {}) {
  const url = `${API}${path}`;
  let response;

  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
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
    throw new Error(body.message || "Request failed");
  }
  return body.data;
}
