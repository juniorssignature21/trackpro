import { useRef, useState } from 'react';
import { api, mediaUrl } from '../lib/api';
import { Alert } from '../components/Bits';
import { fmtDateTime, fromLocalInput, money, toLocalInput } from '../lib/format';
import { calcQuote } from '../lib/pricing';
import { useSettings } from '../lib/settings';
import { toast } from '../lib/pwa';
import MapPicker, { geocode } from './MapPicker';
import { StatusBadge } from './Dashboard';

/* ------------------------------------------------------------------ tracking updates */
const blankEvent = sh => ({
  status: sh.status, title: '', location: '', lat: '', lng: '', note: '', occurred_at: toLocalInput(new Date()), update_shipment: true,
});

export function EventsPanel({ shipment: sh, onChange }) {
  const { statuses } = useSettings();
  const [f, setF] = useState(() => blankEvent(sh));
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [finding, setFinding] = useState(false);
  const formRef = useRef(null);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const find = async () => {
    if (!f.location.trim()) return;
    setFinding(true);
    try { const g = await geocode(f.location); setF(p => ({ ...p, lat: g.lat, lng: g.lng })); } catch (e) { toast(e.message); } finally { setFinding(false); }
  };
  const reset = () => { setEditing(null); setF(blankEvent(sh)); };

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    const body = {
      ...f, lat: f.lat === '' ? null : +f.lat, lng: f.lng === '' ? null : +f.lng, occurred_at: fromLocalInput(f.occurred_at),
    };
    try {
      const next = editing ? await api.updateEvent(sh.id, editing, body) : await api.addEvent(sh.id, body);
      onChange(next);
      toast(editing ? 'Update saved' : 'Tracking update posted');
      setEditing(null); setF(blankEvent(next));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const edit = ev => {
    setEditing(ev.id);
    setF({ status: ev.status, title: ev.title, location: ev.location, lat: ev.lat ?? '', lng: ev.lng ?? '', note: ev.note, occurred_at: toLocalInput(ev.occurred_at), update_shipment: false });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const remove = async ev => {
    if (!window.confirm(`Delete the “${ev.title}” update?`)) return;
    try { onChange(await api.deleteEvent(sh.id, ev.id)); } catch (err) { setError(err.message); }
  };

  const events = [...sh.events].sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));

  return (
    <div className="row g-3">
      <div className="col-xl-5" ref={formRef}>
        <form className="adm-card" onSubmit={submit}>
          <h5 className="mb-3">{editing ? 'Edit update' : 'Post a tracking update'}</h5>
          <Alert onClose={() => setError('')}>{error}</Alert>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Status</label>
              <select className="form-select" value={f.status} onChange={set('status')}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Headline</label><input className="form-control" value={f.title} onChange={set('title')} placeholder={statuses[f.status]} /></div>
            <div className="col-12"><label className="form-label">Location</label>
              <div className="input-group">
                <input className="form-control" value={f.location} onChange={set('location')} placeholder="e.g. Birmingham hub" style={{ borderRadius: '12px 0 0 12px' }} />
                <button type="button" className="btn btn-outline-dark" onClick={find} disabled={finding} title="Look up coordinates" style={{ borderRadius: '0 12px 12px 0' }}>
                  {finding ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}</button>
              </div>
              <div className="d-flex gap-2 mt-2">
                <input className="form-control form-control-sm" type="number" step="any" placeholder="Lat" value={f.lat} onChange={set('lat')} aria-label="Latitude" />
                <input className="form-control form-control-sm" type="number" step="any" placeholder="Lng" value={f.lng} onChange={set('lng')} aria-label="Longitude" />
              </div>
            </div>
            <div className="col-12">
              <MapPicker height={240} targets={[{ key: 'event', label: 'Update location' }]} onPick={(_, lat, lng) => setF(p => ({ ...p, lat, lng }))}
                points={{
                  origin: { lat: sh.origin_lat, lng: sh.origin_lng, label: `Origin: ${sh.origin}` },
                  dest: { lat: sh.dest_lat, lng: sh.dest_lng, label: `Destination: ${sh.destination}` },
                  current: { lat: sh.current_lat, lng: sh.current_lng, label: `Now: ${sh.current_location}` },
                  event: { lat: f.lat, lng: f.lng, label: f.location || 'This update' },
                }} />
            </div>
            <div className="col-12"><label className="form-label">Note (shown to customer)</label><textarea rows="2" className="form-control" value={f.note} onChange={set('note')} /></div>
            <div className="col-md-6"><label className="form-label">Date &amp; time</label><input type="datetime-local" className="form-control" value={f.occurred_at} onChange={set('occurred_at')} /></div>
            <div className="col-md-6 d-flex align-items-end"><div className="form-check">
              <input className="form-check-input" type="checkbox" id="upd" checked={f.update_shipment} onChange={set('update_shipment')} />
              <label className="form-check-label small fw-bold" htmlFor="upd">Move parcel’s live status &amp; position here</label>
            </div></div>
          </div>
          <div className="d-flex gap-2 justify-content-end mt-3">
            {editing && <button type="button" className="btn btn-light" onClick={reset}>Cancel</button>}
            <button className="btn btn-tp-dark px-4" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : editing ? 'Save update' : 'Post update'}</button>
          </div>
        </form>
      </div>
      <div className="col-xl-7">
        <div className="adm-card">
          <h5 className="mb-3">History <small className="text-muted fw-normal">newest first</small></h5>
          {!events.length && <p className="text-muted mb-0">No updates yet.</p>}
          <ul className="timeline">
            {events.map((ev, i) => (
              <li key={ev.id} className={i === 0 ? 'now' : 'done'}>
                <span className="dot" />
                <div className="d-flex justify-content-between gap-2">
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2 flex-wrap"><b>{ev.title}</b><StatusBadge status={ev.status} /></div>
                    <small>{fmtDateTime(ev.occurred_at)}{ev.location && ` · ${ev.location}`}{ev.lat != null && <i className="bi bi-geo-alt-fill ms-1 text-primary" title={`${ev.lat}, ${ev.lng}`} />}</small>
                    {ev.note && <div className="small mt-1">{ev.note}</div>}
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => edit(ev)} aria-label="Edit"><i className="bi bi-pencil" /></button>
                    <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => remove(ev)} aria-label="Delete"><i className="bi bi-trash" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ payments & receipts */
const METHODS = ['Card', 'Bank transfer', 'Cash', 'Mobile wallet', 'Pending'];

function blankPayment(sh, vatRate) {
  const q = calcQuote({ weight: sh.weight_kg, length: sh.length_cm, width: sh.width_cm, height: sh.height_cm, service: sh.service_type, international: sh.international, vatRate });
  return {
    method: 'Card', reference: '', stamp: 'PAID', vat_rate: Math.round(vatRate * 100), amount_paid: '', payer_name: sh.sender_name, note: '',
    paid_at: toLocalInput(new Date()),
    items: [{ label: `${sh.service_type}${sh.international ? ' international' : ''} shipping (${q.charge.toFixed(1)} kg)`, amount: q.net.toFixed(2) }],
  };
}

export function PaymentsPanel({ shipment: sh, onChange }) {
  const { stamps, vat_rate: vatRate, currency_symbol: cur } = useSettings();
  const [f, setF] = useState(() => blankPayment(sh, vatRate));
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const setItem = (i, k) => e => setF(p => ({ ...p, items: p.items.map((it, j) => (j === i ? { ...it, [k]: e.target.value } : it)) }));

  const net = f.items.reduce((s, it) => s + (+it.amount || 0), 0);
  const total = net * (1 + (+f.vat_rate || 0) / 100);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    const body = {
      ...f, vat_rate: (+f.vat_rate || 0) / 100, amount_paid: f.amount_paid === '' ? null : +f.amount_paid,
      paid_at: fromLocalInput(f.paid_at), items: f.items.filter(it => it.label.trim()).map(it => ({ label: it.label.trim(), amount: +it.amount || 0 })),
    };
    try {
      onChange(editing ? await api.updatePayment(sh.id, editing, body) : await api.addPayment(sh.id, body));
      toast(editing ? 'Receipt updated' : 'Receipt issued');
      setEditing(null); setF(blankPayment(sh, vatRate));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const edit = p => {
    setEditing(p.id);
    setF({ method: p.method, reference: p.reference, stamp: p.stamp, vat_rate: Math.round(p.vat_rate * 100), amount_paid: p.amount_paid ?? '',
      payer_name: p.payer_name, note: p.note, paid_at: toLocalInput(p.paid_at), items: p.items.map(it => ({ label: it.label, amount: String(it.amount) })) });
  };
  const remove = async p => {
    if (!window.confirm(`Delete receipt ${p.receipt_number}? Customers will no longer be able to find it.`)) return;
    try { onChange(await api.deletePayment(sh.id, p.id)); } catch (err) { setError(err.message); }
  };

  return (
    <div className="row g-3">
      <div className="col-xl-7">
        <form className="adm-card" onSubmit={submit}>
          <h5 className="mb-3">{editing ? 'Edit receipt' : 'Record a payment & issue receipt'}</h5>
          <Alert onClose={() => setError('')}>{error}</Alert>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Stamp</label>
              <select className="form-select" value={f.stamp} onChange={set('stamp')}>{stamps.map(s => <option key={s}>{s}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Method</label>
              <select className="form-select" value={f.method} onChange={set('method')}>{[...new Set([...METHODS, f.method])].map(m => <option key={m}>{m}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Reference</label><input className="form-control" value={f.reference} onChange={set('reference')} placeholder="e.g. VISA •••• 4242" /></div>
            <div className="col-12">
              <label className="form-label">Line items (before VAT)</label>
              {f.items.map((it, i) => (
                <div className="d-flex gap-2 mb-2" key={i}>
                  <input className="form-control" value={it.label} onChange={setItem(i, 'label')} placeholder="Description" />
                  <input className="form-control" style={{ maxWidth: 130 }} type="number" step="0.01" value={it.amount} onChange={setItem(i, 'amount')} placeholder="0.00" />
                  <button type="button" className="btn btn-light text-danger" onClick={() => setF(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} aria-label="Remove line"><i className="bi bi-x-lg" /></button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-light" onClick={() => setF(p => ({ ...p, items: [...p.items, { label: '', amount: '' }] }))}><i className="bi bi-plus-lg" /> Add line</button>
            </div>
            <div className="col-md-4"><label className="form-label">VAT %</label><input type="number" min="0" max="100" step="0.1" className="form-control" value={f.vat_rate} onChange={set('vat_rate')} /></div>
            <div className="col-md-4"><label className="form-label">Amount paid</label><input type="number" min="0" step="0.01" className="form-control" value={f.amount_paid} onChange={set('amount_paid')} placeholder={`Full: ${total.toFixed(2)}`} /></div>
            <div className="col-md-4"><label className="form-label">Date</label><input type="datetime-local" className="form-control" value={f.paid_at} onChange={set('paid_at')} /></div>
            <div className="col-md-6"><label className="form-label">Paid by</label><input className="form-control" value={f.payer_name} onChange={set('payer_name')} /></div>
            <div className="col-md-6"><label className="form-label">Note on receipt</label><input className="form-control" value={f.note} onChange={set('note')} /></div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <b>Total {money(total, cur)}</b>
            <div className="d-flex gap-2">
              {editing && <button type="button" className="btn btn-light" onClick={() => { setEditing(null); setF(blankPayment(sh, vatRate)); }}>Cancel</button>}
              <button className="btn btn-tp-dark px-4" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : editing ? 'Save receipt' : 'Issue receipt'}</button>
            </div>
          </div>
        </form>
      </div>
      <div className="col-xl-5">
        <div className="adm-card">
          <h5 className="mb-3">Receipts</h5>
          {!sh.payments.length && <p className="text-muted mb-0">No payments recorded.</p>}
          {sh.payments.map(p => (
            <div key={p.id} className="border rounded-4 p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div><div className="mono fw-bold">{p.receipt_number}</div><small className="text-muted">{fmtDateTime(p.paid_at)} · {p.method}</small></div>
                <span className="tp-badge st-pending">{p.stamp}</span>
              </div>
              <div className="d-flex justify-content-between mt-2 small"><span>Total <b>{money(p.total, cur)}</b></span><span>Paid <b>{money(p.paid, cur)}</b></span>{p.balance > 0 && <span className="text-danger">Due <b>{money(p.balance, cur)}</b></span>}</div>
              <div className="d-flex gap-1 mt-2">
                <a className="btn btn-sm btn-light" href={`/receipt?r=${encodeURIComponent(p.receipt_number)}`} target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right" /> View</a>
                <button type="button" className="btn btn-sm btn-light" onClick={() => edit(p)}><i className="bi bi-pencil" /> Edit</button>
                <button type="button" className="btn btn-sm btn-light text-danger ms-auto" onClick={() => remove(p)} aria-label="Delete"><i className="bi bi-trash" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ photos */
export function PhotosPanel({ shipment: sh, onChange }) {
  const { max_upload_mb: maxMb = 8 } = useSettings();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);

  const upload = async e => {
    e.preventDefault();
    if (!files.length) return;
    setBusy(true); setError('');
    try {
      onChange(await api.uploadPhotos(sh.id, files, caption));
      setFiles([]); setCaption(''); if (input.current) input.current.value = '';
      toast('Photos uploaded');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const saveCaption = async (p, value) => {
    if (value === p.caption) return;
    try { onChange(await api.updatePhoto(sh.id, p.id, value)); toast('Caption saved'); } catch (err) { setError(err.message); }
  };
  const remove = async p => {
    if (!window.confirm('Delete this photo?')) return;
    try { onChange(await api.deletePhoto(sh.id, p.id)); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <form className="adm-card" onSubmit={upload}>
        <h5 className="mb-1">Upload package photos</h5>
        <p className="text-muted small">Shown to customers as “Verified photo” on the tracking page. JPEG, PNG, WebP or GIF, up to {maxMb} MB each.</p>
        <Alert onClose={() => setError('')}>{error}</Alert>
        <div className="row g-2 align-items-end">
          <div className="col-md-5"><input ref={input} type="file" className="form-control" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => setFiles([...e.target.files])} /></div>
          <div className="col-md-5"><input className="form-control" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption, e.g. Packed & sealed at hub" maxLength={160} /></div>
          <div className="col-md-2"><button className="btn btn-tp-dark w-100" disabled={busy || !files.length}>{busy ? <span className="spinner-border spinner-border-sm" /> : 'Upload'}</button></div>
        </div>
      </form>
      <div className="adm-card">
        {!sh.photos.length && <p className="text-muted mb-0">No photos yet.</p>}
        <div className="row g-3">
          {sh.photos.map(p => (
            <div className="col-6 col-md-4 col-xl-3" key={p.id}>
              <div className="adm-photo"><img src={mediaUrl(p.url)} alt={p.caption} />
                <button type="button" className="btn btn-sm btn-light x" onClick={() => remove(p)} aria-label="Delete photo"><i className="bi bi-trash text-danger" /></button></div>
              <input className="form-control form-control-sm mt-2" defaultValue={p.caption} placeholder="Caption" onBlur={e => saveCaption(p, e.target.value)} maxLength={160} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
