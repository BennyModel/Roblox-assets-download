const ALLOWED_HOSTS = [
  "catalog.roblox.com",
  "thumbnails.roblox.com",
  "users.roblox.com",
  "avatar.roblox.com",
  "assetdelivery.roblox.com",
  "apis.roblox.com",
];

const ALLOWED_HOST_SUFFIXES = [".rbxcdn.com"];

const ALLOWED_PATHS = [
  /^\/v1\/catalog\/items\/details$/,
  /^\/v1\/bundles\/\d+\/details$/,
  /^\/v1\/assets$/,
  /^\/v1\/users\/avatar$/,
  /^\/v1\/usernames\/users$/,
  /^\/v1\/users\/\d+\/avatar$/,
  /^\/v1\/users\/\d+\/currently-wearing$/,
  /^\/v1\/assetId\/\d+$/,
  /^\/asset-delivery-api\/v1\/assetId\/\d+$/,
  /^\/toolbox-service\/v1\/items\/details$/,
  /^\/[a-f0-9]{32,}$/i,
];

const MAX_BYTES = 50 * 1024 * 1024;

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (!["GET", "POST"].includes(request.method)) {
      return jsonError("Method not allowed.", 405);
    }

    const requestUrl = new URL(request.url);
    const targetRaw = requestUrl.searchParams.get("url");
    if (!targetRaw) return jsonError("Missing url parameter.", 400);

    let targetUrl;
    try {
      targetUrl = new URL(targetRaw);
    } catch {
      return jsonError("Invalid target URL.", 400);
    }

    if (targetUrl.protocol !== "https:" || !isAllowedTarget(targetUrl)) {
      return jsonError("Target is not allowed.", 403);
    }

    const upstreamRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: filteredRequestHeaders(request),
      body: request.method === "POST" ? request.body : undefined,
      redirect: "follow",
    });

    let upstream;
    try {
      upstream = await fetch(upstreamRequest);
    } catch {
      return jsonError("Roblox request failed.", 502);
    }

    const lengthHeader = upstream.headers.get("content-length");
    if (lengthHeader && Number(lengthHeader) > MAX_BYTES) {
      return jsonError("Roblox response is too large for this proxy.", 413);
    }

    const headers = filteredResponseHeaders(upstream.headers);
    for (const [key, value] of Object.entries(corsHeaders())) {
      headers.set(key, value);
    }
    headers.set("x-roblox-proxy-status", String(upstream.status));

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};

function isAllowedTarget(url) {
  const hostAllowed =
    ALLOWED_HOSTS.includes(url.hostname) ||
    ALLOWED_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));
  return hostAllowed && ALLOWED_PATHS.some((pattern) => pattern.test(url.pathname));
}

function filteredRequestHeaders(request) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", request.headers.get("accept") || "application/json,*/*");
  headers.set("user-agent", "RobloxAssetDownloaderPublicProxy/1.0");
  return headers;
}

function filteredResponseHeaders(source) {
  const headers = new Headers();
  for (const name of ["content-type", "content-length", "cache-control", "etag", "last-modified"]) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,accept",
    "access-control-max-age": "86400",
  };
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(),
    },
  });
}
