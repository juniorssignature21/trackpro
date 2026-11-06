// Backend timestamps are naive UTC ("2026-11-05T10:00:00"); treat them as UTC.
export const toDate = v => {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnly) return new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]); // calendar date, local
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
};

export const money = (v, cur = '$') => (Number(v) < 0 ? '-' : '') + cur + Math.abs(Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = v => {
  const d = toDate(v);
  return d ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
};
export const fmtDateTime = v => {
  const d = toDate(v);
  return d ? d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
};
export const fmtTime = v => {
  const d = toDate(v);
  return d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
};
export const fmtDay = v => {
  const d = toDate(v);
  if (!d) return '';
  const today = new Date(); const y = new Date(); y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};
export const timeAgo = v => {
  const d = toDate(v);
  if (!d) return '';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

// for <input type="datetime-local"> (local time) <-> ISO UTC
export const toLocalInput = v => {
  const d = toDate(v) || new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = v => (v ? new Date(v).toISOString() : null);

export const initials = name => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

export function haversineKm(a, b) {
  if (a?.lat == null || b?.lat == null) return null;
  const R = 6371, rad = x => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// status -> badge class + colour + icon
export const STATUS_META = {
  pending: { cls: 'st-pending', color: '#6b6b70', icon: 'bi-receipt' },
  picked_up: { cls: 'st-info', color: '#1B6CFF', icon: 'bi-box-arrow-up' },
  in_transit: { cls: 'st-transit', color: '#d49a00', icon: 'bi-truck' },
  at_hub: { cls: 'st-info', color: '#C42BF0', icon: 'bi-building' },
  customs: { cls: 'st-warn', color: '#FF5A1F', icon: 'bi-shield-check' },
  out_for_delivery: { cls: 'st-transit', color: '#FF1FBF', icon: 'bi-signpost-split' },
  delivered: { cls: 'st-success', color: '#00C853', icon: 'bi-house-check-fill' },
  on_hold: { cls: 'st-warn', color: '#b54a00', icon: 'bi-pause-circle' },
  attempted: { cls: 'st-warn', color: '#b54a00', icon: 'bi-door-closed' },
  exception: { cls: 'st-danger', color: '#c01d1d', icon: 'bi-exclamation-triangle-fill' },
  returned: { cls: 'st-danger', color: '#c01d1d', icon: 'bi-arrow-return-left' },
};
export const statusMeta = s => STATUS_META[s] || STATUS_META.pending;

/** "2026-11-10" -> "Tue, Nov 10" */
export const fmtShortDay = v => {
  const d = toDate(v);
  return d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
};
