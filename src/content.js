export const HOME_FAQ = [
  { q: 'How does live tracking work?', a: 'Our couriers’ devices and hubs post GPS points to TrackPro. The map refreshes automatically and animates your parcel to its newest position.' },
  { q: 'How long will delivery take?', a: 'Same Day: today. Express: next working day. Standard: 2–3 days. Economy: 3–5 days. International: 4–7 days.' },
  { q: 'Can I get a receipt for my payment?', a: 'Yes – every payment produces a stamped digital receipt. Enter your tracking number on the Receipts page to view, print or download it.' },
  { q: 'Can I change the delivery address?', a: 'If the parcel isn’t out for delivery yet, contact support with your tracking number and we’ll redirect it.' },
  { q: 'What can’t I send?', a: 'Weapons, flammables, illegal substances, cash and perishables without approval. See our full list in Help.' },
];

export const HELP_GROUPS = [
  {
    id: 'tracking', icon: 'bi-geo-alt', title: 'Tracking', items: [
      { q: 'How does live tracking work?', a: 'Courier devices and hubs send GPS points to TrackPro. Your tracking page refreshes every few seconds and animates the parcel to its newest position.' },
      { q: 'My tracking hasn’t updated', a: 'Parcels on flights or in customs may not report a location for a few hours. If nothing changes for 48 hours, contact us.' },
      { q: 'Can I call my courier?', a: 'Yes – for Express and Same Day deliveries the courier bar on the tracking page has call and chat buttons.' },
    ],
  },
  {
    id: 'sending', icon: 'bi-send', title: 'Sending', items: [
      { q: 'How do I get a price?', a: 'Use the instant quote page – enter weight, size and route and the price updates as you type.' },
      { q: 'What can’t I send?', a: 'Weapons, flammables, illegal substances, cash, and perishables without prior approval.' },
      { q: 'How should I pack my parcel?', a: 'Use a sturdy box, cushion contents, seal all seams and remove old labels.' },
    ],
  },
  {
    id: 'payments', icon: 'bi-receipt', title: 'Payments & receipts', items: [
      { q: 'How do I get my receipt?', a: 'Open the Receipts page and enter your tracking or receipt number. You can print it or save it as a PDF.' },
      { q: 'What do the stamps mean?', a: 'PAID – fully paid. PART PAID – deposit received. CUSTOMS CLEARED – duties settled. REFUNDED – money returned.' },
      { q: 'Which payment methods do you accept?', a: 'Card, bank transfer, cash at counters and mobile wallets.' },
    ],
  },
  {
    id: 'returns', icon: 'bi-arrow-repeat', title: 'Returns', items: [
      { q: 'How do I return a parcel?', a: 'Ask the retailer for a TrackPro return code, then scan it at any drop point. No printer needed.' },
      { q: 'How long do I have?', a: 'That depends on the retailer’s policy – usually 14 to 30 days.' },
    ],
  },
];

export const TESTIMONIALS = [
  { text: 'The live map is addictive. I watched my boots travel up the M6 in real time.', name: 'Amelia H.', city: 'London', color: '#C42BF0' },
  { text: 'Sent fabric samples to London, paid by transfer and got a stamped receipt instantly. Pro.', name: 'Chinedu O.', city: 'Lagos', color: '#1B6CFF' },
  { text: 'Insured a watch, tracked every hop to Berlin. Courier called before arriving. 10/10.', name: 'Lukas M.', city: 'Zürich', color: '#FF5A1F' },
  { text: 'Customs was handled for me. I could see exactly where my parcel was.', name: 'Fatima S.', city: 'Aden', color: '#00C853' },
];
