// Post-build SEO step (runs after `vite build`):
//  * writes dist/<route>/index.html for every public route with its own <title>, description, canonical URL,
//    Open Graph/Twitter tags and JSON-LD, so crawlers and link previews get the right page without running JS;
//  * writes dist/sitemap.xml and dist/robots.txt.
// Set VITE_SITE_URL (e.g. https://vdcexpresslogistics.com) in the build environment.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const { PAGES, SITE, breadcrumbLd, faqLd, organizationLd, servicesLd, websiteLd } = await import('../src/seo.js');
const { HELP_GROUPS, HOME_FAQ } = await import('../src/content.js');

// Starting prices for the Services structured data. Mirrors backend/tracking/pricing.py starting_prices()
// at the default 18% fuel surcharge; only used for schema.org offers.
const PRODUCTS = [
  { name: 'Same Day', blurb: 'Dedicated courier, collected and delivered today. Domestic only.', from: 53.1 },
  { name: 'Express 9:00', blurb: 'Time-definite: delivered by 9:00 AM on the next possible business day.', from: 55.46 },
  { name: 'Express 12:00', blurb: 'Time-definite: delivered by noon on the next possible business day.', from: 40.12 },
  { name: 'Express', blurb: 'Delivered by end of the next possible business day; 1–6 business days internationally.', from: 25.96 },
  { name: 'Economy Select', blurb: 'Day-definite, lower-cost service for heavier, less urgent shipments.', from: 18.69 },
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function headFor(path, page) {
  const url = SITE.url + (path === '/' ? '/' : path);
  const img = SITE.url + SITE.image;
  const blocks = [];
  if (path === '/') blocks.push(organizationLd(), websiteLd(), faqLd(HOME_FAQ));
  if (path === '/help') blocks.push(faqLd(HELP_GROUPS.flatMap(g => g.items)));
  if (path === '/services') blocks.push(servicesLd(PRODUCTS));
  const crumb = breadcrumbLd(path);
  if (crumb) blocks.push(crumb);
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    `<meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    ...blocks.map(ld),
  ].join('\n  ');
}

const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo:start-->')) throw new Error('dist/index.html is missing the <!--seo:start--> marker');
const render = (path, page) => template
  .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, headFor(path, page))
  .replace(/content="\/og-image\.png"/g, `content="${SITE.url}${SITE.image}"`);

// SPA fallback (unknown routes, /track/:id, /book, /admin): generic, not indexed.
writeFileSync(join(dist, 'app.html'), render('/app', {
  title: `${SITE.name} | Express Courier & International Shipping`,
  description: PAGES['/'].description, noindex: true,
}));

for (const [path, page] of Object.entries(PAGES)) {
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(path, page));
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(PAGES).map(([path, p]) => `  <url><loc>${SITE.url}${path === '/' ? '/' : path}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);

writeFileSync(join(dist, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin
Disallow: /book
Disallow: /track/

Sitemap: ${SITE.url}/sitemap.xml
`);

console.log(`SEO: ${Object.keys(PAGES).length} pages, sitemap.xml and robots.txt for ${SITE.url}`);
