# Roblox API Research

Date: 2026-08-20

This project is intentionally static and client-only. It does not store cookies, tokens, credentials, or Roblox session data. Browser calls use `credentials: "omit"`.

## Summary

Roblox exposes several public metadata APIs that are appropriate for a GitHub Pages client. Direct original-file download is the hard boundary: Asset Delivery may return redirects or file bytes for public assets, but Roblox announced and rolled out authentication requirements for Asset Delivery community tooling in 2025. The app therefore attempts direct anonymous browser access and reports `Authentication required`, `User is not authorized`, `CORS blocked this request`, or `No downloadable source found` instead of bypassing access control.

Local header probe on 2026-08-20 with `Origin: https://example.github.io` returned HTTP 200 for bundle, thumbnail, avatar, users, and legacy Asset Delivery test requests, but did not expose `Access-Control-Allow-Origin` in the checked responses. A browser-hosted GitHub Pages page may therefore block these calls even when the endpoint is publicly readable outside the browser. The app treats that as a technical limitation, not as a condition to bypass.

## Endpoint Matrix

| Endpoint | URL pattern | Purpose | Auth | Browser/CORS expectation | Response |
| --- | --- | --- | --- | --- | --- |
| Catalog item details | `https://catalog.roblox.com/v1/catalog/items/details` | Resolve catalog metadata for asset IDs | Cookie none in Roblox docs | Probe returned 403 for asset `1`; no ACAO observed | JSON |
| Bundle details | `https://catalog.roblox.com/v1/bundles/{bundleId}/details` | Read bundle contents | Cookie none in Roblox docs | Probe returned 200; no ACAO observed | JSON |
| Asset thumbnails | `https://thumbnails.roblox.com/v1/assets?assetIds=...` | Public thumbnail URLs | Cookie none in Roblox docs | Probe returned 200; no ACAO observed | JSON with CDN image URL |
| User lookup | `https://users.roblox.com/v1/usernames/users` | Resolve username to user ID | Cookie none in common public usage | Probe returned 200; no ACAO observed | JSON |
| Avatar appearance | `https://avatar.roblox.com/v1/users/{userId}/avatar` | Public avatar asset list | Cookie none in Roblox docs | Probe returned 200; no ACAO observed | JSON |
| Currently wearing | `https://avatar.roblox.com/v1/users/{userId}/currently-wearing` | Compact currently worn asset ID list | Public endpoint in common usage | Not required by current resolver; likely same CORS risk | JSON |
| Legacy Asset Delivery | `https://assetdelivery.roblox.com/v1/assetId/{assetId}` | Resolve or fetch original asset | May require auth depending on asset and Roblox policy | Probe returned 200 JSON for asset `1`; no ACAO observed | JSON redirect or file response |
| New Asset Delivery | `https://apis.roblox.com/asset-delivery-api/v1/assetId/{assetId}` | Roblox-recommended replacement for community tools | Authentication required after 2025 changes | Not suitable for anonymous static-only client | JSON/file metadata |
| Creator Store toolbox details | `https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=...` | Creator Store item metadata candidate | Varies | Treated as optional; not used for required behavior unless CORS allows | JSON |

## Tested Scenarios To Re-run Before Release

The app contains the same browser code paths that should be used for manual verification from GitHub Pages:

1. Classic shirt or pants: metadata and thumbnail should load; source texture download depends on Asset Delivery.
2. Accessory: metadata should load; model download and RBXM reference scan run only if Asset Delivery allows the original model.
3. Layered clothing: same as accessory, with additional maps discovered only when the public container references them.
4. Bundle: Bundle API should list items; per-item original files are attempted individually.
5. Avatar: public avatar assets should list without Roblox login; hidden or blocked data is shown as a limitation.
6. Creator Store model: metadata can be public, but original model bytes still depend on Asset Delivery access.

## Implementation Rules From Research

- Do not use third-party proxies by default.
- Do not use `.ROBLOSECURITY`, cookies, OAuth tokens, or API keys.
- Do not execute scripts found inside RBXM files.
- Do not convert RBXM, mesh, PNG, JPEG, or OBJ contents.
- If CORS or authentication blocks a request, surface that limitation in the UI.
- Keep graph traversal bounded and de-duplicate asset references.

## Known Limits

- A static GitHub Pages site cannot reliably download every Roblox original asset because Roblox controls anonymous Asset Delivery and CORS.
- If Roblox continues omitting CORS headers, a fully static site cannot directly read those endpoints from GitHub Pages. The included optional Cloudflare Worker proxy is the minimal compliant architecture change: it only proxies allowlisted public Roblox endpoints and strips cookies/authorization.
- RBXM parsing in this implementation is a safe reference scanner. It extracts `rbxassetid://ID` and equivalent asset URLs from file bytes as data; it does not fully instantiate Roblox model classes.
- Resolution detection for images is not guaranteed unless the source image bytes are downloadable.
- OBJ buttons are only active when Roblox directly returns an OBJ-like source. The app does not convert RBXM to OBJ.
