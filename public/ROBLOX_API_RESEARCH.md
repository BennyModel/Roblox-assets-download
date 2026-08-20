# Roblox API Research

The full source repository includes `ROBLOX_API_RESEARCH.md`. Key finding from the 2026-08-20 header probe: several public Roblox endpoints returned data to non-browser HTTP requests, but did not expose `Access-Control-Allow-Origin` for an example GitHub Pages origin. A browser-hosted static page may therefore report CORS-blocked requests. The app does not bypass those restrictions.
