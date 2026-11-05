// Instant on-screen quote. Mirrors backend/app/pricing.py – the server recalculates on submit.
export const RATES = { Economy: [3.99, 1.10], Standard: [5.99, 1.60], Express: [9.99, 2.40], 'Same Day': [19.99, 3.50] };
export const DAYS = { Economy: '3–5 days', Standard: '2–3 days', Express: 'Next day', 'Same Day': 'Today' };
export const SERVICES = [
  { value: 'Economy', icon: 'bi-hourglass-split' },
  { value: 'Standard', icon: 'bi-truck' },
  { value: 'Express', icon: 'bi-lightning-charge-fill' },
  { value: 'Same Day', icon: 'bi-rocket-takeoff-fill' },
];

export function calcQuote({ weight, length, width, height, service, international, vatRate = 0.2 }) {
  const n = v => Math.max(+v || 0, 0);
  const vol = (n(length) * n(width) * n(height)) / 5000;
  const charge = Math.max(n(weight), vol, 0.5);
  const [base, perKg] = RATES[service] || RATES.Standard;
  let price = base + charge * perKg;
  if (international) price = price * 2.8 + 12;
  const vat = price * vatRate;
  return { vol, charge, net: price, vat, total: price + vat, days: international ? '4–7 days' : DAYS[service] };
}
