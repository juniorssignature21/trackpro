const BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'tp_admin_token';

export const token = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: v => { try { localStorage.setItem(TOKEN_KEY, v); } catch { /* private mode */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } },
};

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function messageFrom(detail, fallback) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    // FastAPI validation errors
    return detail.map(d => {
      const field = Array.isArray(d.loc) ? d.loc.filter(p => p !== 'body').join(' › ') : '';
      return field ? `${field}: ${d.msg}` : d.msg;
    }).join('\n');
  }
  return fallback;
}

export async function request(path, { method = 'GET', body, auth = false, params, form } = {}) {
  let url = BASE + path;
  if (params) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    if ([...qs].length) url += '?' + qs;
  }
  const headers = {};
  if (body !== undefined && !form) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = token.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res;
  try {
    res = await fetch(url, { method, headers, body: form || (body !== undefined ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError(0, 'Network error – check your connection and try again.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth) {
      token.clear();
      window.dispatchEvent(new Event('tp:logout'));
    }
    throw new ApiError(res.status, messageFrom(data?.detail, `Request failed (${res.status})`), data?.detail);
  }
  return data;
}

export const api = {
  // public
  settings: () => request('/api/settings'),
  track: id => request(`/api/track/${encodeURIComponent(id)}`),
  receipts: (id, r) => request('/api/receipts', { params: { id, r } }),
  calcQuote: body => request('/api/quote/calculate', { method: 'POST', body }),
  requestQuote: body => request('/api/quotes', { method: 'POST', body }),
  contact: body => request('/api/contact', { method: 'POST', body }),

  // admin
  login: body => request('/api/admin/login', { method: 'POST', body }),
  me: () => request('/api/admin/me', { auth: true }),
  changePassword: body => request('/api/admin/password', { method: 'POST', body, auth: true }),
  stats: () => request('/api/admin/stats', { auth: true }),
  shipments: params => request('/api/admin/shipments', { auth: true, params }),
  shipment: id => request(`/api/admin/shipments/${id}`, { auth: true }),
  createShipment: body => request('/api/admin/shipments', { method: 'POST', body, auth: true }),
  updateShipment: (id, body) => request(`/api/admin/shipments/${id}`, { method: 'PATCH', body, auth: true }),
  deleteShipment: id => request(`/api/admin/shipments/${id}`, { method: 'DELETE', auth: true }),
  addEvent: (id, body) => request(`/api/admin/shipments/${id}/events`, { method: 'POST', body, auth: true }),
  updateEvent: (id, eid, body) => request(`/api/admin/shipments/${id}/events/${eid}`, { method: 'PUT', body, auth: true }),
  deleteEvent: (id, eid) => request(`/api/admin/shipments/${id}/events/${eid}`, { method: 'DELETE', auth: true }),
  addPayment: (id, body) => request(`/api/admin/shipments/${id}/payments`, { method: 'POST', body, auth: true }),
  updatePayment: (id, pid, body) => request(`/api/admin/shipments/${id}/payments/${pid}`, { method: 'PUT', body, auth: true }),
  deletePayment: (id, pid) => request(`/api/admin/shipments/${id}/payments/${pid}`, { method: 'DELETE', auth: true }),
  uploadPhotos: (id, files, caption = '') => {
    const form = new FormData();
    [...files].forEach(f => form.append('files', f));
    form.append('caption', caption);
    return request(`/api/admin/shipments/${id}/photos`, { method: 'POST', form, auth: true });
  },
  updatePhoto: (id, pid, caption) => request(`/api/admin/shipments/${id}/photos/${pid}`, { method: 'PATCH', body: { caption }, auth: true }),
  deletePhoto: (id, pid) => request(`/api/admin/shipments/${id}/photos/${pid}`, { method: 'DELETE', auth: true }),
  quotes: status => request('/api/admin/quotes', { auth: true, params: { status } }),
  setQuoteStatus: (id, status) => request(`/api/admin/quotes/${id}`, { method: 'PATCH', body: { status }, auth: true }),
  convertQuote: id => request(`/api/admin/quotes/${id}/convert`, { method: 'POST', auth: true }),
  deleteQuote: id => request(`/api/admin/quotes/${id}`, { method: 'DELETE', auth: true }),
  messages: () => request('/api/admin/messages', { auth: true }),
  markMessage: (id, isRead) => request(`/api/admin/messages/${id}`, { method: 'PATCH', auth: true, params: { is_read: isRead } }),
  deleteMessage: id => request(`/api/admin/messages/${id}`, { method: 'DELETE', auth: true }),
};

export const mediaUrl = path => (path?.startsWith('http') ? path : BASE + path);
