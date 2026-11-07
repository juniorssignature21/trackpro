export const HOME_FAQ = [
  { q: 'How does live tracking work?', a: 'Our couriers’ devices and hubs post checkpoint scans and GPS points to VDC Express. The map refreshes automatically and animates your parcel to its newest position.' },
  { q: 'How long will delivery take?', a: 'In the US: Same Day today, Express 9:00 / 12:00 / Express the next business day, Economy Select 2–4 business days. International Express takes 1–6 business days depending on the destination. Book by 5:00 PM (Same Day by 12:00 PM) for pickup the same business day.' },
  { q: 'How do I pay?', a: 'Online bookings are paid by debit or credit card on a secure checkout. Your shipment is booked the moment the payment is approved and you get a stamped digital receipt.' },
  { q: 'Can I change the delivery address?', a: 'If the parcel isn’t out for delivery yet, contact support with your tracking number and we’ll redirect it.' },
  { q: 'Do I pay duties and taxes?', a: 'International goods may attract duties and taxes at destination. By default the receiver pays them (DAP). Choose duties paid (DDP) when you book and we bill them to you after clearance.' },
  { q: 'What can’t I send?', a: 'Weapons, explosives, flammables, loose lithium batteries, cash, illegal substances and perishables without approval. See our full list in Help.' },
];

export const HELP_GROUPS = [
  {
    id: 'tracking', icon: 'bi-geo-alt', title: 'Tracking', items: [
      { q: 'How does live tracking work?', a: 'Courier devices and facilities send checkpoint scans and GPS points to VDC Express. Your tracking page refreshes every few seconds and animates the parcel to its newest position.' },
      { q: 'My tracking hasn’t updated', a: 'Parcels on flights or in customs may not report a location for a few hours. If nothing changes for 48 hours, contact us.' },
      { q: 'Can I call my courier?', a: 'Yes. For Same Day and Express shipments the courier bar on the tracking page has call and chat buttons.' },
      { q: 'What is a waybill number?', a: 'Every shipment gets a 10-digit waybill number when it is booked. Enter it on the Track page or write it on the parcel.' },
    ],
  },
  {
    id: 'sending', icon: 'bi-send', title: 'Sending', items: [
      { q: 'How is the price worked out?', a: 'We charge by chargeable weight: the higher of the actual weight and the volumetric weight (L × W × H in cm ÷ 5000), rounded up to the next 0.5 kg. The quote page shows every charge, including the fuel surcharge, before you pay.' },
      { q: 'When will my parcel be collected?', a: 'Pickups run Monday to Friday. Book by 5:00 PM (12:00 PM for Same Day) and we can collect the same business day, or choose a later date when you book.' },
      { q: 'Do international shipments need paperwork?', a: 'Documents travel without a customs value. For goods, describe the contents precisely and enter their value when you book; we prepare the commercial invoice and handle clearance.' },
      { q: 'What can’t I send?', a: 'Weapons and ammunition, explosives, flammable liquids and gases, loose lithium batteries, cash and negotiable instruments, illegal substances, and perishables without prior approval. Shipments to or from Cuba, Iran, North Korea, Syria, Russia and Belarus are not accepted.' },
      { q: 'Terms of carriage', a: 'By booking you confirm the contents are described accurately, packed to withstand normal handling and contain no prohibited items. Liability is limited unless you add shipment value protection. Delivery dates are estimates in business days.' },
      { q: 'How should I pack my parcel?', a: 'Use a sturdy box, cushion contents, seal all seams and remove old labels.' },
    ],
  },
  {
    id: 'payments', icon: 'bi-receipt', title: 'Payments & receipts', items: [
      { q: 'How do I get my receipt?', a: 'Open the Receipts page and enter your tracking or receipt number. You can print it or save it as a PDF.' },
      { q: 'What do the stamps mean?', a: 'PAID: fully paid. PART PAID: deposit received. CUSTOMS CLEARED: duties settled. REFUNDED: money returned. UNPAID: awaiting payment.' },
      { q: 'Which payment methods do you accept?', a: 'Online bookings are paid by debit or credit card only (Visa, Mastercard, American Express, Discover and more), entered securely on our booking page and processed by Stripe. Business account customers can be invoiced monthly.' },
      { q: 'My card payment failed', a: 'You are not charged for a failed or cancelled attempt. Open the link on the payment page to try another card, or contact us with your booking reference.' },
    ],
  },
  {
    id: 'returns', icon: 'bi-arrow-repeat', title: 'Returns', items: [
      { q: 'How do I return a parcel?', a: 'Ask the retailer for a VDC Express return label, then scan it at any drop point. No printer needed.' },
      { q: 'How long do I have?', a: 'That depends on the retailer’s policy – usually 14 to 30 days.' },
    ],
  },
];

export const TESTIMONIALS = [
  { text: 'The live map is addictive. I watched my boots travel from Houston to Chicago in real time.', name: 'Amelia H.', city: 'Houston', color: '#C42BF0' },
  { text: 'Sent a laptop to my brother in Lagos, paid by card and got a stamped receipt instantly. Pro.', name: 'Grace O.', city: 'Houston', color: '#1B6CFF' },
  { text: 'Insured a watch, tracked every hop to Berlin. Courier called before arriving. 10/10.', name: 'Lukas M.', city: 'Zürich', color: '#FF5A1F' },
  { text: 'Customs was handled for me. I could see exactly where my parcel was.', name: 'Fatima S.', city: 'Aden', color: '#00C853' },
];
