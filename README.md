# Roblox Asset Downloader

A fully client-side, open-source Roblox asset downloader for public metadata and anonymously available original files.

## Features

- Static Vite + React + TypeScript app.
- Accepts Roblox Asset IDs and URLs.
- Bundle and public avatar modes.
- Uses public Roblox metadata, thumbnail, bundle, user, avatar, and Asset Delivery endpoints directly from the browser.
- Builds ZIP files locally with JSZip.
- Scans downloadable RBXM/model bytes for `rbxassetid://ID` references without executing code.
- Shows explicit limitations when Roblox blocks anonymous browser access.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The Vite base path is `./`, so the generated `dist` works under `https://username.github.io/repository-name/`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds `dist` and deploys it to GitHub Pages. In the repository settings, enable Pages with GitHub Actions as the source.

## Optional Free Proxy

The app can use a Cloudflare Worker proxy to avoid browser CORS failures for public Roblox endpoints.

```bash
cd proxy
npx wrangler login
npx wrangler deploy
```

Then set the GitHub repository variable:

```txt
VITE_ROBLOX_PROXY_URL=https://roblox-asset-downloader-proxy.YOUR_SUBDOMAIN.workers.dev
```

The proxy is allowlisted to Roblox API/CDN hosts and does not forward cookies or authorization headers. It fixes CORS for public data only; it does not unlock private, archived, or authentication-required assets.

## Policy

This project does not use Roblox cookies, session tokens, credential storage, paid backend services, analytics, ads, popups, or proxy bypasses.
