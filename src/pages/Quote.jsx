import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Bits';
import CountrySelect from '../components/CountrySelect';
import { api } from '../lib/api';
import { fmtShortDay, money } from '../lib/format';
import { useSeo } from '../lib/hooks';
import { blankShipment, saveDraft, toQuoteBody, useLiveQuote } from '../lib/quote';
import { useSettings } from '../lib/settings';

export default function Quote() {
  useSeo();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const st = useSettings();
  const { currency_symbol: cur, domestic_country: home, limits } = st;
  const [f, setF] = useState(() => {
    const b = blankShipment(home);
    for (const k of ['origin_country', 'dest_country', 'origin', 'destination', 'weight', 'pieces']) {
      if (params.get(k)) b[k] = k.endsWith('country') ? params.get(k).toUpperCase() : params.get(k);
    }
    if (params.get('international') === '1' && b.dest_country === home) b.dest_country = 'GB';
    if (params.get('service')) b.product = params.get('service');
    return b;
  });
  const { quote, error, loading } = useLiveQuote(f);
  const [contact, setContact] = useState(null); // "email me this quote" form, null = hidden
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(null);

  const set = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF(prev => ({ ...prev, [k]: v }));
  };
  const intl = f.origin_country !== f.dest_country;
  const options = quote?.options || [];
  const selected = useMemo(() => {
    const o = options.find(x => x.product === f.product && x.available);
    return o || options.find(x => x.available) || null;
  }, [options, f.product]);

  const book = () => {
    if (!selected) return;
    saveDraft({ ...f, product: selected.product });
    navigate('/book');
  };

  const sendQuote = async e => {
    e.preventDefault();
    setBusy(true); setSendError('');
    try {
      const b = toQuoteBody(f);
      const res = await api.requestQuote({
        ...b, weight_kg: b.weight_kg, service_type: selected.product,
        origin: f.origin || quote.route.origin_name, destination: f.destination || quote.route.dest_name,
        name: contact.name, email: contact.email, phone: contact.phone, message: contact.message,
      });
      setDone(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setSendError(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2" aria-label="Breadcrumb"><Link to="/">Home</Link>&nbsp;/&nbsp;Quote &amp; book</nav>
          <h1>Instant<br /><span style={{ background: 'var(--tp-ink)', color: 'var(--tp-yellow)', padding: '0 .15em' }}>quote</span></h1>
          <p className="fs-5 mt-3 mb-0">Compare every service and delivery date, then book and pay by card in minutes.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {done ? (
            <div className="tp-card text-center mx-auto" style={{ maxWidth: 640 }}>
              <div className="pkg-ico mx-auto mb-3"><i className="bi bi-check2-circle" /></div>
              <h2 className="fw-bold">Quote saved</h2>
              <p className="lead-x">Thanks {done.name.split(' ')[0]}, your reference is <b className="mono text-dark">{done.reference}</b>.
                We&apos;ve saved your {done.service_type} price of <b className="text-dark">{money(done.total, cur)}</b> and will email it to {done.email}.</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
                <button type="button" className="btn btn-tp-dark" onClick={() => { setDone(null); setContact(null); }}>Back to my quote</button>
                <Link to="/" className="btn btn-outline-dark rounded-0 fw-bold px-4">Home</Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="tp-card mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <h2 className="h4 mb-0"><i className="bi bi-signpost-split me-2" />Route</h2>
                    {quote && <span className="badge text-bg-light border">{intl ? `International · ${quote.route.zone_name}` : 'Domestic'}</span>}
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="ocountry">Ship from</label>
                      <CountrySelect id="ocountry" value={f.origin_country} onChange={set('origin_country')} />
                      <input aria-label="Origin city or ZIP" value={f.origin} onChange={set('origin')} className="form-control tp-input mt-2" placeholder="City or ZIP code (optional)" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="dcountry">Ship to</label>
                      <CountrySelect id="dcountry" value={f.dest_country} onChange={set('dest_country')} />
                      <input aria-label="Destination city or postal code" value={f.destination} onChange={set('destination')} className="form-control tp-input mt-2" placeholder="City or postal code (optional)" />
                    </div>
                  </div>
                </div>

                <div className="tp-card mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <h2 className="h4 mb-0"><i className="bi bi-box-seam me-2" />What are you sending?</h2>
                    {intl && (
                      <div className="seg">
                        <input type="radio" name="kind" id="kpkg" checked={!f.is_document} onChange={() => setF(p => ({ ...p, is_document: false }))} /><label htmlFor="kpkg">Package</label>
                        <input type="radio" name="kind" id="kdoc" checked={f.is_document} onChange={() => setF(p => ({ ...p, is_document: true, duties_paid: false }))} /><label htmlFor="kdoc">Documents</label>
                      </div>
                    )}
                  </div>
                  <div className="row g-3">
                    <div className="col-4 col-md-2"><label className="form-label" htmlFor="pieces">Pieces</label>
                      <input id="pieces" type="number" min="1" max={limits.pieces} step="1" value={f.pieces} onChange={set('pieces')} className="form-control tp-input" /></div>
                    {[['weight', 'Weight / piece (kg)', '0.1', limits.piece_kg], ['length', 'Length (cm)', '1', limits.side_cm], ['width', 'Width (cm)', '1', limits.side_cm], ['height', 'Height (cm)', '1', limits.side_cm]].map(([k, l, step, max]) => (
                      <div className={k === 'weight' ? 'col-8 col-md-4' : 'col-4 col-md-2'} key={k}><label className="form-label" htmlFor={k}>{l}</label>
                        <input id={k} type="number" step={step} min="0" max={max} value={f[k]} onChange={set(k)} className="form-control tp-input" /></div>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2"><i className="bi bi-info-circle" /> You pay for the higher of actual and volumetric weight (L×W×H ÷ 5000), rounded up to the next 0.5 kg.
                    {quote && <> This shipment: <b>{quote.chargeable_kg} kg</b> chargeable ({quote.actual_kg} kg actual, {quote.volumetric_kg} kg volumetric).</>}</small>
                </div>

                <div className="tp-card mb-4">
                  <h2 className="h4 mb-3"><i className="bi bi-lightning-charge me-2" />Choose a service</h2>
                  <Alert onClose={null}>{error}</Alert>
                  {!quote && !error && <div className="text-muted"><span className="spinner-border spinner-border-sm me-2" />Pricing…</div>}
                  <div className="d-grid gap-2" style={{ opacity: loading && quote ? 0.6 : 1, transition: 'opacity .2s' }}>
                    {options.map(o => {
                      const id = `svc-${o.code}`;
                      const active = selected?.product === o.product;
                      return (
                        <label key={o.code} htmlFor={id} className={`svc-line${active ? ' active' : ''}${o.available ? '' : ' disabled'}`}>
                          <input type="radio" name="product" id={id} disabled={!o.available} checked={active} onChange={() => setF(p => ({ ...p, product: o.product }))} />
                          <i className={`bi ${o.icon} svc-line-ic`} />
                          <span className="flex-grow-1">
                            <b>{o.product}</b>
                            <small className="d-block text-muted">
                              {o.available ? <>Delivered {o.transit === 'Today' ? 'today' : `by ${fmtShortDay(o.delivery_date)}`}{o.delivery_by !== 'end of day' ? `, ${o.delivery_by}` : ''} · {o.transit}</> : o.reason}
                            </small>
                          </span>
                          <b className="fs-5">{o.available ? money(o.total, cur) : '—'}</b>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="tp-card">
                  <h2 className="h4 mb-3"><i className="bi bi-shield-check me-2" />Options</h2>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-5">
                      <label className="form-label" htmlFor="insured">Shipment value protection</label>
                      <div className="input-group"><span className="input-group-text">{cur}</span>
                        <input id="insured" type="number" min="0" step="1" value={f.insured_value} onChange={set('insured_value')} className="form-control tp-input" placeholder="Value to protect" /></div>
                      <small className="text-muted">1% of the value, minimum {money(15, cur)}. Covers loss and damage.</small>
                    </div>
                    <div className="col-md-7 d-grid gap-2">
                      <div className="form-check"><input className="form-check-input" type="checkbox" id="sig" checked={f.signature} onChange={set('signature')} />
                        <label className="form-check-label" htmlFor="sig">Direct signature required ({money(7.5, cur)})</label></div>
                      {intl && !f.is_document && (
                        <div className="form-check"><input className="form-check-input" type="checkbox" id="ddp" checked={f.duties_paid} onChange={set('duties_paid')} />
                          <label className="form-check-label" htmlFor="ddp">I&apos;ll pay duties &amp; taxes (DDP, {money(25, cur)} service fee)</label></div>
                      )}
                    </div>
                  </div>
                  {quote?.warnings?.map(w => <div className="alert alert-warning small mt-3 mb-0" key={w}><i className="bi bi-info-circle me-1" />{w}</div>)}
                </div>
              </div>

              <div className="col-lg-4">
                <div className="price-card position-sticky" style={{ top: 100 }}>
                  <small className="text-white-50">{selected ? selected.product : 'Your price'}</small>
                  <div className="price my-2">{selected ? money(selected.total, cur) : '—'}</div>
                  {selected && <div className="mb-3"><span className="chip-lime">{selected.transit === 'Today' ? 'Delivered today' : `Delivered by ${fmtShortDay(selected.delivery_date)}`}</span></div>}
                  {quote && <div className="row-i"><span>Route</span><b className="text-end">{f.origin || quote.route.origin_name} → {f.destination || quote.route.dest_name}</b></div>}
                  {selected?.lines.map(ln => <div className="row-i" key={ln.code}><span>{ln.label}</span><b>{money(ln.amount, cur)}</b></div>)}
                  {selected && selected.tax > 0 && <div className="row-i"><span>{st.tax_label}</span><b>{money(selected.tax, cur)}</b></div>}
                  {selected && <div className="row-i"><span>Pickup</span><b>{fmtShortDay(selected.ship_date)}</b></div>}
                  <button type="button" className="btn btn-tp w-100 mt-4 btn-pill" disabled={!selected || loading} onClick={book}>
                    <i className="bi bi-credit-card me-2" />Book &amp; pay by card <i className="bi bi-arrow-right" />
                  </button>
                  <button type="button" className="btn btn-link text-white-50 w-100 mt-2" disabled={!selected} onClick={() => setContact(c => c || { name: '', email: '', phone: '', message: '' })}>
                    Email me this quote instead
                  </button>
                  <p className="small text-white-50 mt-2 mb-0"><i className="bi bi-lock" /> Secure card payment (Visa, Mastercard). Prices in {st.currency_code}, fuel surcharge included.</p>
                </div>

                {contact && selected && (
                  <form className="tp-card mt-4" onSubmit={sendQuote}>
                    <h2 className="h5 mb-3">Email me this quote</h2>
                    <Alert onClose={() => setSendError('')}>{sendError}</Alert>
                    {[['name', 'Full name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone', 'tel', 'tel']].map(([k, l, t, ac]) => (
                      <div className="mb-2" key={k}><label className="form-label" htmlFor={`q${k}`}>{l}</label>
                        <input id={`q${k}`} type={t} autoComplete={ac} required={k !== 'phone'} minLength={k === 'name' ? 2 : undefined} className="form-control tp-input"
                          value={contact[k]} onChange={e => setContact({ ...contact, [k]: e.target.value })} /></div>
                    ))}
                    <div className="mb-3"><label className="form-label" htmlFor="qmsg">Anything we should know?</label>
                      <textarea id="qmsg" rows="2" className="form-control tp-input" value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} /></div>
                    <button className="btn btn-tp-dark w-100" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : 'Send me the quote'}</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
