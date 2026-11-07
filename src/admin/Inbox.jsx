import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Alert, Spinner } from '../components/Bits';
import { fmtDateTime, money } from '../lib/format';
import { useTitle } from '../lib/hooks';
import { useSettings } from '../lib/settings';
import { toast } from '../lib/pwa';

const Q_STATUS = { new: 'st-warn', contacted: 'st-info', booked: 'st-success', closed: 'st-pending' };

export function Quotes() {
  useTitle('Quote requests');
  const { currency_symbol: cur } = useSettings();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.quotes(filter).then(setRows).catch(e => setError(e.message));
  useEffect(() => { setRows(null); load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const setStatus = async (q, status) => {
    try { const u = await api.setQuoteStatus(q.id, status); setRows(rs => rs.map(r => (r.id === u.id ? u : r))); } catch (e) { setError(e.message); }
  };
  const convert = async q => {
    if (!window.confirm(`Create a shipment from quote ${q.reference}? An UNPAID receipt for ${money(q.total, cur)} will be issued.`)) return;
    try { const sh = await api.convertQuote(q.id); toast(`Shipment ${sh.tracking_number} created`); navigate(`/admin/shipments/${sh.id}`); } catch (e) { setError(e.message); }
  };
  const remove = async q => {
    if (!window.confirm(`Delete quote ${q.reference}?`)) return;
    try { await api.deleteQuote(q.id); setRows(rs => rs.filter(r => r.id !== q.id)); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="adm-head">
        <h1>Quote requests</h1>
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter">
          <option value="">All</option>{Object.keys(Q_STATUS).map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <Alert onClose={() => setError('')}>{error}</Alert>
      {!rows ? <Spinner /> : !rows.length ? <div className="adm-card text-muted">No quote requests.</div> : rows.map(q => (
        <div className="adm-card" key={q.id}>
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap"><b className="mono">{q.reference}</b><span className={`tp-badge ${Q_STATUS[q.status]}`}>{q.status}</span><small className="text-muted">{fmtDateTime(q.created_at)}</small></div>
              <div className="fs-5 fw-bold mt-1">{q.origin} <i className="bi bi-arrow-right" /> {q.destination}</div>
              <div className="small text-muted">{q.service_type}{q.international ? ` · International ${q.origin_country} → ${q.dest_country}` : ''}{q.is_document ? ' · Documents' : ''} · {q.pieces} × {q.weight_kg} kg ({q.length_cm}×{q.width_cm}×{q.height_cm} cm) · chargeable {q.chargeable_kg} kg</div>
            </div>
            <div className="text-end"><div className="display-x" style={{ fontSize: '1.8rem' }}>{money(q.total, cur)}</div>{q.vat > 0 && <small className="text-muted">incl. {money(q.vat, cur)} tax</small>}</div>
          </div>
          <hr />
          <div className="d-flex justify-content-between flex-wrap gap-2 align-items-center">
            <div className="small">
              <b>{q.name}</b> · <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Your VDC Express quote ${q.reference}`)}`}>{q.email}</a>{q.phone && <> · <a href={`tel:${q.phone}`}>{q.phone}</a></>}
              {q.message && <div className="text-muted mt-1">“{q.message}”</div>}
            </div>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm" style={{ width: 'auto' }} value={q.status} onChange={e => setStatus(q, e.target.value)} aria-label="Quote status">
                {Object.keys(Q_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {q.status !== 'booked' && <button type="button" className="btn btn-sm btn-tp-dark" onClick={() => convert(q)}><i className="bi bi-box-seam me-1" />Book shipment</button>}
              <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => remove(q)} aria-label="Delete"><i className="bi bi-trash" /></button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

const B_STATUS = { awaiting_payment: 'st-warn', paid: 'st-success', failed: 'st-danger' };

export function Bookings() {
  useTitle('Online bookings');
  const { currency_symbol: cur } = useSettings();
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { setRows(null); api.bookings(filter).then(setRows).catch(e => setError(e.message)); }, [filter]);

  return (
    <>
      <div className="adm-head">
        <h1>Online bookings</h1>
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter">
          <option value="">All</option><option value="paid">Paid</option><option value="awaiting_payment">Awaiting payment</option><option value="failed">Failed</option>
        </select>
      </div>
      <p className="text-muted small">Customers book and pay by card on the website. Card payments are taken on the booking page through Stripe; a shipment is created automatically once Stripe confirms the payment.</p>
      <Alert onClose={() => setError('')}>{error}</Alert>
      {!rows ? <Spinner /> : !rows.length ? <div className="adm-card text-muted">No online bookings yet.</div> : rows.map(b => {
        const d = b.details || {};
        return (
          <div className="adm-card" key={b.id}>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap"><b className="mono">{b.reference}</b>
                  <span className={`tp-badge ${B_STATUS[b.status]}`}>{b.status.replace('_', ' ')}</span><small className="text-muted">{fmtDateTime(b.created_at)}</small></div>
                <div className="fs-5 fw-bold mt-1">{d.shipper?.city}, {d.origin_country} <i className="bi bi-arrow-right" /> {d.receiver?.city}, {d.dest_country}</div>
                <div className="small text-muted">{b.product} · {d.pieces} × {d.weight_kg} kg · chargeable {b.quote?.chargeable_kg} kg · {d.contents}</div>
              </div>
              <div className="text-end"><div className="display-x" style={{ fontSize: '1.8rem' }}>{money(b.amount, cur)}</div>
                <small className="text-muted">{b.card || (b.attempts > 1 ? `${b.attempts} payment attempts` : 'card')}</small></div>
            </div>
            <hr />
            <div className="d-flex justify-content-between flex-wrap gap-2 align-items-center small">
              <div><b>{d.shipper?.name}</b> · <a href={`mailto:${b.email}`}>{b.email}</a> · {d.shipper?.phone}
                {b.gateway_message && b.status !== 'paid' && <div className="text-danger mt-1">{b.gateway_message}</div>}</div>
              {b.tracking_number
                ? <Link className="btn btn-sm btn-tp-dark" to={`/admin/shipments?q=${b.tracking_number}`}><i className="bi bi-box-seam me-1" />{b.tracking_number}</Link>
                : <span className="text-muted">No shipment until paid</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function Messages() {
  useTitle('Messages');
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.messages().then(setRows).catch(e => setError(e.message)); }, []);

  const mark = async (m, isRead) => {
    try { const u = await api.markMessage(m.id, isRead); setRows(rs => rs.map(r => (r.id === u.id ? u : r))); } catch (e) { setError(e.message); }
  };
  const toggle = m => { setOpen(open === m.id ? null : m.id); if (!m.is_read) mark(m, true); };
  const remove = async m => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try { await api.deleteMessage(m.id); setRows(rs => rs.filter(r => r.id !== m.id)); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="adm-head"><h1>Messages</h1></div>
      <Alert onClose={() => setError('')}>{error}</Alert>
      {!rows ? <Spinner /> : !rows.length ? <div className="adm-card text-muted">Inbox zero. 🎉</div> : (
        <div className="adm-card p-0 overflow-hidden">
          {rows.map(m => (
            <div key={m.id} className={`adm-msg border-bottom${m.is_read ? '' : ' unread'}`}>
              <button type="button" className="btn w-100 text-start p-3 rounded-0 d-flex gap-3 align-items-center" onClick={() => toggle(m)} aria-expanded={open === m.id}>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between gap-2"><b className={m.is_read ? 'fw-semibold' : ''}>{m.name}</b><small className="text-muted text-nowrap">{fmtDateTime(m.created_at)}</small></div>
                  <div className="text-truncate small">{m.subject ? <b>{m.subject} – </b> : null}<span className="text-muted">{m.message}</span></div>
                </div>
                <i className={`bi bi-chevron-${open === m.id ? 'up' : 'down'}`} />
              </button>
              {open === m.id && (
                <div className="px-3 pb-3">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <a className="btn btn-sm btn-tp-dark" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message to VDC Express'))}`}><i className="bi bi-reply me-1" />Reply to {m.email}</a>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => mark(m, false)}>Mark unread</button>
                    <button type="button" className="btn btn-sm btn-light text-danger ms-auto" onClick={() => remove(m)}><i className="bi bi-trash" /> Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function Account() {
  useTitle('Account');
  const [f, setF] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault();
    if (f.new_password !== f.confirm) { setMsg({ kind: 'danger', text: 'New passwords do not match.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await api.changePassword({ current_password: f.current_password, new_password: f.new_password });
      setMsg({ kind: 'success', text: 'Password updated.' }); setF({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { setMsg({ kind: 'danger', text: err.message }); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="adm-head"><h1>Account</h1></div>
      <form className="adm-card" style={{ maxWidth: 520 }} onSubmit={submit}>
        <h5 className="mb-3">Change password</h5>
        {msg && <Alert kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Alert>}
        {[['current_password', 'Current password', 'current-password'], ['new_password', 'New password (min. 8 characters)', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([k, l, ac]) => (
          <div className="mb-3" key={k}><label className="form-label" htmlFor={k}>{l}</label>
            <input id={k} type="password" className="form-control" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} required minLength={k === 'current_password' ? 1 : 8} autoComplete={ac} /></div>
        ))}
        <button className="btn btn-tp-dark" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : 'Update password'}</button>
      </form>
    </>
  );
}
