import { useEffect, useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../lib/api';
import { fmtDate, fmtDateTime, money } from '../lib/format';
import { useTitle } from '../lib/hooks';
import { toast } from '../lib/pwa';

const STAMP_CLASS = { PAID: 'green', 'PART PAID': 'orange', 'CUSTOMS CLEARED': 'blue', REFUNDED: '', UNPAID: '' };

function Stamp({ word, date }) {
  const pid = `stamp${useId().replace(/:/g, '')}`;
  return (
    <div className={`stamp ${STAMP_CLASS[word] ?? ''}`} aria-label={`Stamp: ${word}`}>
      <svg viewBox="0 0 190 190" aria-hidden="true">
        <defs><path id={pid} d="M95,95 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs>
        <text fontSize="13" fontWeight="800" letterSpacing="3" fill="currentColor">
          <textPath href={`#${pid}`}>TRACKPRO LOGISTICS ★ VERIFIED ★ TRACKPRO LOGISTICS ★</textPath>
        </text>
      </svg>
      <div>
        <div className="word">{word}</div>
        <div className="date">{fmtDate(date).toUpperCase()}</div>
      </div>
    </div>
  );
}

function ReceiptDoc({ r }) {
  const p = r.payment, cur = r.currency_symbol;
  const [qr, setQr] = useState('');
  const link = `${window.location.origin}/receipt?r=${encodeURIComponent(p.receipt_number)}`;
  useEffect(() => {
    QRCode.toDataURL(link, { margin: 1, width: 220, color: { dark: '#1d1d1f', light: '#ffffff' } }).then(setQr).catch(() => {});
  }, [link]);

  return (
    <div className="receipt mb-4">
      <div className="rhead">
        <div>
          <img src="/branding/logo_931a74e398.png" alt={r.company_name} style={{ height: 48 }} />
          <div className="small text-muted mt-2" style={{ maxWidth: 300 }}>{r.company_address}<br />{r.company_email} · {r.company_phone}</div>
        </div>
        <div className="text-md-end">
          <div className="display-x" style={{ fontSize: '2.2rem' }}>Receipt</div>
          <div className="mono fw-bold">{p.receipt_number}</div>
          <small className="text-muted">Issued {fmtDateTime(p.paid_at)}</small>
        </div>
      </div>

      <Stamp word={p.stamp} date={p.paid_at} />

      <div className="row g-4 mb-4">
        <div className="col-sm-6">
          <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '.06em' }}>Sender</small>
          <div className="fw-bold">{r.sender_name || '—'}</div>
          <div className="small">{r.sender_address || r.origin}</div>
        </div>
        <div className="col-sm-6">
          <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '.06em' }}>Receiver</small>
          <div className="fw-bold">{r.receiver_name || '—'}</div>
          <div className="small">{r.receiver_address || r.destination}</div>
        </div>
        <div className="col-sm-6">
          <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '.06em' }}>Shipment</small>
          <div className="mono fw-bold">{r.tracking_number}</div>
          <div className="small">{r.origin} → {r.destination}<br />{r.service_type}{r.international ? ' · International' : ''} · {r.weight_kg} kg{r.pieces > 1 ? ` · ${r.pieces} pcs` : ''}{r.contents ? ` · ${r.contents}` : ''}</div>
        </div>
        <div className="col-sm-6">
          <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '.06em' }}>Payment</small>
          <div className="fw-bold">{p.method}{p.reference ? ` · ${p.reference}` : ''}</div>
          <div className="small">Paid by {p.payer_name || r.sender_name || '—'}</div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Description</th><th className="text-end">Amount</th></tr></thead>
          <tbody>
            {p.items.map((it, i) => <tr key={i}><td>{it.label}</td><td className="text-end">{money(it.amount, cur)}</td></tr>)}
            {!p.items.length && <tr><td colSpan={2} className="text-muted">No line items</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="row align-items-end g-4">
        <div className="col-md-6 order-md-2">
          <table className="w-100 totals">
            <tbody>
              <tr><td>Subtotal</td><td className="text-end">{money(p.net, cur)}</td></tr>
              <tr><td>VAT ({Math.round(p.vat_rate * 100)}%)</td><td className="text-end">{money(p.vat, cur)}</td></tr>
              <tr className="border-top border-dark border-2"><td className="pt-2 fw-bold">Total</td><td className="text-end grand pt-2">{money(p.total, cur)}</td></tr>
              <tr><td>Paid</td><td className="text-end fw-bold">{money(p.paid, cur)}</td></tr>
              {p.balance > 0 && <tr><td className="text-danger fw-bold">Balance due</td><td className="text-end text-danger fw-bold">{money(p.balance, cur)}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="col-md-6 order-md-1 d-flex align-items-end gap-3">
          {qr && <img src={qr} alt="QR code linking to this receipt" width="110" height="110" />}
          <div>
            <div className="sign">TrackPro</div>
            <small className="text-muted d-block">Authorised signature</small>
            <small className="text-muted d-block mt-1">Scan to verify this receipt online.</small>
          </div>
        </div>
      </div>
      {p.note && <div className="alert alert-light border mt-4 mb-0 small"><b>Note:</b> {p.note}</div>}
    </div>
  );
}

export default function Receipt() {
  const [params, setParams] = useSearchParams();
  const id = params.get('id') || '', r = params.get('r') || '';
  const [form, setForm] = useState({ id, r });
  const [state, setState] = useState({ loading: false, error: '', results: null });
  useTitle(state.results?.length ? `Receipt ${state.results[0].payment.receipt_number}` : 'Find your receipt');

  useEffect(() => {
    setForm({ id, r });
    if (!id && !r) { setState({ loading: false, error: '', results: null }); return; }
    let live = true;
    setState(s => ({ ...s, loading: true, error: '' }));
    api.receipts(id.trim(), r.trim())
      .then(results => live && setState({ loading: false, error: '', results }))
      .catch(err => live && setState({ loading: false, error: err.message, results: null }));
    return () => { live = false; };
  }, [id, r]);

  const submit = e => {
    e.preventDefault();
    const next = {};
    if (form.id.trim()) next.id = form.id.trim().toUpperCase();
    if (form.r.trim()) next.r = form.r.trim().toUpperCase();
    setParams(next);
  };

  const copyLink = () => navigator.clipboard?.writeText(window.location.href).then(() => toast('Receipt link copied')).catch(() => {});

  return (
    <>
      <section className="tp-page-hero dark no-print">
        <div className="container"><h1>Find your <span>receipt</span></h1>
          <p className="fs-5 mt-3">Enter a tracking number or receipt number.</p>
          <form className="row g-2 mt-3" style={{ maxWidth: 720 }} onSubmit={submit}>
            <div className="col-md-5"><input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} className="form-control tp-input mono" placeholder="Tracking no. e.g. TP26AB100245" aria-label="Tracking number" /></div>
            <div className="col-md-4"><input value={form.r} onChange={e => setForm({ ...form, r: e.target.value })} className="form-control tp-input mono" placeholder="or Receipt no." aria-label="Receipt number" /></div>
            <div className="col-md-3"><button className="btn btn-tp w-100 h-100" disabled={!form.id.trim() && !form.r.trim()}>Find</button></div>
          </form>
          {state.error && <div className="alert alert-danger tp-alert mt-3 mb-0" style={{ maxWidth: 720 }}><i className="bi bi-exclamation-circle-fill me-2" />{state.error}</div>}
        </div>
      </section>

      {(state.loading || state.results) && (
        <section className="section">
          <div className="container receipt-wrap">
            {state.loading && <div className="text-center py-5"><div className="spinner-border" role="status" /></div>}
            {!state.loading && state.results && (
              <>
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3 no-print">
                  <b>{state.results.length} receipt{state.results.length > 1 ? 's' : ''} found</b>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-dark rounded-pill" onClick={copyLink}><i className="bi bi-link-45deg me-1" />Copy link</button>
                    <button type="button" className="btn btn-tp-dark btn-pill" onClick={() => window.print()}><i className="bi bi-printer me-2" />Print / save PDF</button>
                  </div>
                </div>
                {state.results.map(res => <ReceiptDoc key={res.payment.id} r={res} />)}
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
