// Keep API requests pointed at one configurable origin for both local and hosted setups.
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const hasBody =
    options.body !== undefined && !(options.body instanceof FormData);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Cookies are required for the backend's HTTP-only login session.
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status}).`);
  }

  return data;
}

export async function apiFile(path) {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : null;
    throw new Error(data?.message || `Request failed (${response.status}).`);
  }

  return response.blob();
}

export function imageUrl(studio) {
  return (
    studio?.imageURL ||
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
  );
}

export function money(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );
}

export function studioId(studio) {
  return studio?._id || studio?.id;
}
