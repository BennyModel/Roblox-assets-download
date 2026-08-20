# Roblox Proxy Worker

This Cloudflare Worker only proxies allowlisted public Roblox endpoints. It does not forward cookies, authorization headers, Roblox credentials, or user tokens.

## Deploy

```bash
cd proxy
npx wrangler login
npx wrangler deploy
```

After deploy, copy the worker URL into the frontend environment:

```bash
VITE_ROBLOX_PROXY_URL=https://roblox-asset-downloader-proxy.YOUR_SUBDOMAIN.workers.dev
```

For GitHub Pages, add that variable as a repository variable named `VITE_ROBLOX_PROXY_URL`, then expose it in the Pages workflow build step if needed.

## Limits

- This fixes CORS for public Roblox data.
- This does not unlock private, archived, or authentication-required assets.
- Responses over 50 MB are rejected by default.
