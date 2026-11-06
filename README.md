# VDC Express Logistics website (React + Vite)

The VDC Express Logistics website and admin panel: service comparison and instant quotes, online booking with card payment, live tracking map, printable receipts, contact form, PWA, and the `/admin` panel. Prices and data come from the API, which lives in its own repo.

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
| `VITE_API_URL` | API URL without a trailing slash, e.g. `https://vdc-api.vercel.app` |
| `VITE_SITE_URL` | the public site URL, e.g. `https://vdcexpresslogistics.com` (canonical URLs, sitemap, social previews) |

Then add this site's URL to the API's `TP_CORS_ORIGINS` and redeploy the API. For preview deployments, also set `TP_CORS_ORIGIN_REGEX` on the API.

## SEO

- Page titles, descriptions and structured data live in [src/seo.js](src/seo.js).
- `npm run build` runs [scripts/seo-build.mjs](scripts/seo-build.mjs) after Vite. It writes static HTML for each public page (its own title, description, canonical URL, Open Graph/Twitter tags and JSON-LD: Organization, WebSite with waybill search, FAQPage, Service list, breadcrumbs), plus `sitemap.xml` and `robots.txt`.
- Booking, tracking results, the admin and unknown URLs are served from `app.html` with `noindex`. Old `.php`/`.html` URLs redirect permanently in [vercel.json](vercel.json).
- After the first deploy, submit `https://<your-domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
