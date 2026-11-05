# TrackPro frontend (React + Vite)

The TrackPro courier website and admin panel: quote calculator, live tracking map, printable receipts, contact form, PWA, and the `/admin` panel. Data comes from the TrackPro API, which lives in its own repo.

## Run it (development)

Node 18+. Start the API on port 8000 first (see the backend repo), then:

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` and `/uploads` to `http://127.0.0.1:8000` (override with `VITE_API_PROXY`).

## Deploy on Vercel

Import this repo into Vercel. [vercel.json](vercel.json) sets the Vite build, the SPA fallback to `index.html`, and cache headers.

Set one environment variable, then redeploy, because Vite bakes it in at build time:

| Variable | Value |
|---|---|
| `VITE_API_URL` | API URL without a trailing slash, e.g. `https://trackpro-api.vercel.app` |

Then add this site's URL to the API's `TP_CORS_ORIGINS` and redeploy the API. For preview deployments, also set `TP_CORS_ORIGIN_REGEX` on the API.
