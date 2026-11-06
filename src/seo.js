// SEO metadata for every public route. Used at runtime (useSeo) and at build time (scripts/seo-build.mjs),
// which writes a static HTML file per route with these tags, plus sitemap.xml and robots.txt.
const ENV = import.meta.env || globalThis.process?.env || {};

export const SITE = {
  name: 'VDC Express Logistics',
  short: 'VDC Express',
  url: (ENV.VITE_SITE_URL || 'https://vdcexpresslogistics.com').replace(/\/+$/, ''),
  logo: '/branding/vdc-logo.svg',
  image: '/og-image.png',
  phone: '+1-555-010-0199',
  email: 'support@vdcexpresslogistics.com',
  address: { street: '100 Express Way, Suite 200', city: 'Houston', region: 'TX', postal: '77032', country: 'US' },
};

const DEFAULT_DESCRIPTION = 'Same-day, time-definite and international express shipping from the US to 200+ countries. '
  + 'Instant quotes, secure card payment, live map tracking and customs handled.';

export const PAGES = {
  '/': {
    title: 'VDC Express Logistics | Express Courier & International Shipping',
    description: DEFAULT_DESCRIPTION,
    priority: '1.0', changefreq: 'weekly',
  },
  '/services': {
    title: 'Shipping Services: Same Day, Express 9:00, Express & Economy | VDC Express Logistics',
    description: 'Compare Same Day, Express 9:00, Express 12:00, Express and Economy Select. Domestic US and international '
      + 'door-to-door delivery with duties-paid options, value protection and live tracking.',
    priority: '0.9', changefreq: 'monthly', crumb: 'Services',
  },
  '/quote': {
    title: 'Instant Shipping Quote & Online Booking | VDC Express Logistics',
    description: 'Get an instant shipping price for any destination, compare delivery dates and book online with secure card payment. '
      + 'Pickup from your door.',
    priority: '0.9', changefreq: 'monthly', crumb: 'Quote & book',
  },
  '/track': {
    title: 'Track a Shipment | Live Package Tracking | VDC Express Logistics',
    description: 'Track your VDC Express shipment with the 10-digit waybill number. Live map, delivery date, customs status and proof of delivery.',
    priority: '0.9', changefreq: 'monthly', crumb: 'Track',
  },
  '/business': {
    title: 'Business Shipping Accounts | VDC Express Logistics',
    description: 'Business shipping with volume rates, monthly invoicing, bulk labels and an API for your store.',
    priority: '0.7', changefreq: 'monthly', crumb: 'Business',
  },
  '/about': {
    title: 'About Us | VDC Express Logistics',
    description: 'VDC Express Logistics is a US express courier connecting businesses and families to 200+ countries with transparent pricing and live tracking.',
    priority: '0.6', changefreq: 'yearly', crumb: 'About',
  },
  '/help': {
    title: 'Help Center & Shipping FAQs | VDC Express Logistics',
    description: 'Answers on tracking, delivery times, customs and duties, packing, prohibited items, card payments and receipts.',
    priority: '0.7', changefreq: 'monthly', crumb: 'Help',
  },
  '/contact': {
    title: 'Contact Us | VDC Express Logistics',
    description: 'Talk to VDC Express Logistics customer service about a shipment, a quote or a business account.',
    priority: '0.6', changefreq: 'yearly', crumb: 'Contact',
  },
  '/receipt': {
    title: 'Find a Receipt | VDC Express Logistics',
    description: 'View, print or save the receipt for a shipment using your waybill or receipt number.',
    priority: '0.4', changefreq: 'yearly', crumb: 'Receipts',
  },
};

export function pageMeta(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (PAGES[path]) return { ...PAGES[path], path };
  return {
    title: `${SITE.name} | Express Courier & International Shipping`,
    description: DEFAULT_DESCRIPTION,
    noindex: true, // booking, tracking results, admin and 404s stay out of search results
    path,
  };
}

// ------------------------------------------------------------------ structured data (JSON-LD)
export function organizationLd() {
  const a = SITE.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.short,
    url: `${SITE.url}/`,
    logo: SITE.url + SITE.logo,
    image: SITE.url + SITE.image,
    email: SITE.email,
    telephone: SITE.phone,
    address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
    contactPoint: [{ '@type': 'ContactPoint', telephone: SITE.phone, email: SITE.email, contactType: 'customer service', areaServed: 'Worldwide', availableLanguage: ['English'] }],
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: `${SITE.url}/`,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/track/{waybill}` },
      'query-input': 'required name=waybill',
    },
  };
}

export function breadcrumbLd(path) {
  const page = PAGES[path];
  if (!page?.crumb) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: page.crumb, item: SITE.url + path },
    ],
  };
}

export function faqLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function servicesLd(products) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Shipping services',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: p.name,
        serviceType: 'Courier and express delivery',
        description: p.blurb,
        provider: { '@id': `${SITE.url}/#organization` },
        areaServed: p.name === 'Same Day' ? { '@type': 'Country', name: 'United States' } : 'Worldwide',
        offers: { '@type': 'Offer', priceCurrency: 'USD', price: p.from.toFixed(2), url: `${SITE.url}/quote` },
      },
    })),
  };
}
