import { RobloxApiError } from "../../types";

const proxyBaseUrl = import.meta.env.VITE_ROBLOX_PROXY_URL?.replace(/\/+$/, "");

export async function robloxFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(toProxyUrl(url), {
      ...init,
      credentials: "omit",
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new RobloxApiError(
      "CORS blocked this request or the network is unavailable.",
      "CORS_BLOCKED",
    );
  }

  if (!response.ok) {
    const body = await safeReadText(response);
    const message =
      response.status === 401
        ? "Authentication required by Roblox."
        : response.status === 403
          ? "User is not authorized to access this asset."
          : response.status === 404
            ? "Asset not found."
            : response.status === 429
              ? "Roblox is rate limiting requests. Wait a minute, then try again."
              : extractRobloxError(body) || `Roblox returned HTTP ${response.status}.`;

    throw new RobloxApiError(message, "HTTP_ERROR", response.status);
  }

  return response.json() as Promise<T>;
}

export async function robloxBlob(url: string, init?: RequestInit): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(toProxyUrl(url), {
      ...init,
      credentials: "omit",
      redirect: "follow",
    });
  } catch {
    throw new RobloxApiError(
      "CORS blocked this request or Asset Delivery did not allow anonymous browser access.",
      "CORS_BLOCKED",
    );
  }

  if (!response.ok) {
    const text = await safeReadText(response);
    const message =
      response.status === 401
        ? "Authentication required by Roblox."
        : response.status === 403
          ? "User is not authorized to access this asset."
          : response.status === 404
            ? "No downloadable source found."
            : response.status === 429
              ? "Roblox is rate limiting downloads. Wait a minute, then try again."
              : extractRobloxError(text) || `Roblox returned HTTP ${response.status}.`;
    throw new RobloxApiError(message, "DOWNLOAD_BLOCKED", response.status);
  }

  return response;
}

export async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function toProxyUrl(url: string): string {
  if (!proxyBaseUrl) return url;
  return `${proxyBaseUrl}/?url=${encodeURIComponent(url)}`;
}

function extractRobloxError(body: string): string | undefined {
  if (!body) return undefined;

  try {
    const payload = JSON.parse(body) as {
      error?: string;
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    return payload.errors?.[0]?.message || payload.message || payload.error;
  } catch {
    return body.length > 220 ? `${body.slice(0, 220)}...` : body;
  }
}
