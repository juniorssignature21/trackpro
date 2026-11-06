import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Bits';
import { api } from '../lib/api';
import { fmtShortDay, money, toDate } from '../lib/format';
import { useSeo } from '../lib/hooks';
import { loadDraft, saveDraft, toQuoteBody, useLiveQuote } from '../lib/quote';
import { useCountryName, useSettings } from '../lib/settings';

const blankParty = city => ({ name: '', company: '', email: '', phone: '', address1: '', address2: '', city: city || '', state: '', postal_code: '' });

/** Next `n` business days starting at ISO date `from`. */
function businessDays(from, n = 5) {
  const out = [];
  const d = toDate(from) || new Date();
  while (out.length < n) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function PartyFields({ title, icon, value, onChange, country, prefix }) {
  const countryName = useCountryName();
  const set = k => e => onChange({ ...value, [k]: e.target.value });
  const us = country === 'US';
  const field = (k, label, props = {}, col = 'col-md-6') => (
    <div className={col}>
      <label className="form-label" htmlFor={`${prefix}-${k}`}>{label}</label>
      <input id={`${prefix}-${k}`} className="form-control tp-input" value={value[k]} onChange={set(k)} {...props} />
    </div>
  );
  return (
    <div className="tp-card mb-4">
      <h2 className="h4 mb-3"><i className={`bi ${icon} me-2`} />{title} <small className="text-muted fs-6">· {countryName(country)}</small></h2>
      <div className="row g-3">
        {field('name', 'Contact name', { required: true, minLength: 2, autoComplete: `${prefix} name` })}
        {field('company', 'Company (optional)', { autoComplete: `${prefix} organization` })}
        {field('email', 'Email', { type: 'email', required: true, autoComplete: `${prefix} email` })}
        {field('phone', 'Phone', { type: 'tel', required: true, minLength: 5, autoComplete: `${prefix} tel` })}
        {field('address1', 'Street address', { required: true, minLength: 3, autoComplete: `${prefix} address-line1` }, 'col-md-8')}
        {field('address2', 'Apt, suite, floor', { autoComplete: `${prefix} address-line2` }, 'col-md-4')}
        {field('city', 'City', { required: true, minLength: 2, autoComplete: `${prefix} address-level2` }, 'col-md-5')}
        {field('state', us ? 'State' : 'State / region', { required: us, maxLength: us ? 2 : 80, placeholder: us ? 'TX' : '', autoComplete: `${prefix} address-level1` }, 'col-6 col-md-3')}
        {field('postal_code', us ? 'ZIP code' : 'Postal code', { required: us, autoComplete: `${prefix} postal-code` }, 'col-6 col-md-4')}
      </div>
    </div>
  );
}

export function Book() {
  useSeo('Book a shipment', { noindex: true });
  const st = useSettings();
  const cur = st.currency_symbol;
  const countryName = useCountryName();
  const [draft] = useState(loadDraft);
  const [f, setF] = useState(() => draft && { ...draft, ship_date: '' });
  const [shipper, setShipper] = useState(() => blankParty(draft?.origin));
  const [receiver, setReceiver] = useState(() => blankParty(draft?.destination));
  const [extra, setExtra] = useState({ contents: '', customs_value: '', customer_reference: '', accept_terms: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { quote, error: quoteError, loading } = useLiveQuote(f || {}, 0);

  const option = quote?.options.find(o => o.product === f?.product);
  // earliest pickup day = the ship date of a quote priced without a chosen date
  const [firstDay, setFirstDay] = useState('');
  useEffect(() => { if (!f?.ship_date && option?.ship_date) setFirstDay(option.ship_date); }, [f?.ship_date, option?.ship_date]);
  const days = useMemo(() => (firstDay ? businessDays(firstDay) : []), [firstDay]);

  useEffect(() => { if (f) saveDraft(f); }, [f]);

  if (!draft) return <Navigate to="/quote" replace />;
  const intl = f.origin_country !== f.dest_country;
  const needsCustoms = intl && !f.is_document;

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await api.createBooking({
        ...toQuoteBody(f), product: f.product, shipper, receiver,
        contents: extra.contents, customs_value: +extra.customs_value || 0,
        customer_reference: extra.customer_reference, accept_terms: extra.accept_terms,
      });
      window.location.assign(res.authorization_url); // Paystack hosted card checkout
    } catch (err) {
      setError(err.message);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2" aria-label="Breadcrumb"><Link to="/">Home</Link>&nbsp;/&nbsp;<Link to="/quote">Quote</Link>&nbsp;/&nbsp;Book</nav>
          <h1>Book &amp;<br /><span style={{ background: 'var(--tp-ink)', color: 'var(--tp-yellow)', padding: '0 .15em' }}>ship</span></h1>
          <p className="fs-5 mt-3 mb-0">{countryName(f.origin_country)} → {countryName(f.dest_country)} · {f.product}</p>
        </div>
      </section>

      <section className="section">
        <form className="container" onSubmit={submit}>
          <div className="row g-4">
            <div className="col-lg-8">
              <Alert onClose={() => setError('')}>{error}</Alert>
              {!st.payments_enabled && <Alert kind="warning">Online card payments aren&apos;t switched on yet. <Link to="/contact?subject=Booking">Contact us</Link> to book this shipment.</Alert>}
              <PartyFields title="Ship from" icon="bi-box-arrow-up" prefix="shipping" value={shipper} onChange={setShipper} country={f.origin_country} />
              <PartyFields title="Ship to" icon="bi-geo-alt" prefix="billing" value={receiver} onChange={setReceiver} country={f.dest_country} />

              <div className="tp-card mb-4">
                <h2 className="h4 mb-3"><i className="bi bi-box-seam me-2" />Shipment details</h2>
                <div className="row g-3">
                  <div className="col-md-8"><label className="form-label" htmlFor="contents">{f.is_document ? 'Document description' : 'Describe the contents'}</label>
                    <input id="contents" className="form-control tp-input" required minLength={3} maxLength={255} value={extra.contents}
                      onChange={e => setExtra({ ...extra, contents: e.target.value })} placeholder={f.is_document ? 'e.g. Signed contracts' : 'e.g. 3 cotton T-shirts, 1 pair leather shoes'} />
                    {needsCustoms && <small className="text-muted">Be specific. Customs rejects vague descriptions like &quot;gift&quot; or &quot;parts&quot;.</small>}</div>
                  {needsCustoms && (
                    <div className="col-md-4"><label className="form-label" htmlFor="customs">Customs value</label>
                      <div className="input-group"><span className="input-group-text">{cur}</span>
                        <input id="customs" type="number" min="1" step="0.01" required className="form-control tp-input" value={extra.customs_value}
                          onChange={e => setExtra({ ...extra, customs_value: e.target.value })} /></div></div>
                  )}
                  <div className="col-md-6"><label className="form-label" htmlFor="pickup">Pickup date</label>
                    <select id="pickup" className="form-select tp-input" value={f.ship_date || firstDay || ''} onChange={e => setF({ ...f, ship_date: e.target.value })}>
                      {days.map(d => <option key={d} value={d}>{fmtShortDay(d)}</option>)}
                    </select>
                    <small className="text-muted">Pickups run Monday to Friday. Have the parcel ready from 9:00 AM.</small></div>
                  <div className="col-md-6"><label className="form-label" htmlFor="ref">Your reference (optional)</label>
                    <input id="ref" maxLength={60} className="form-control tp-input" value={extra.customer_reference} onChange={e => setExtra({ ...extra, customer_reference: e.target.value })} placeholder="Order or invoice number" /></div>
                </div>
                <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" id="terms" required checked={extra.accept_terms} onChange={e => setExtra({ ...extra, accept_terms: e.target.checked })} />
                  <label className="form-check-label" htmlFor="terms">
                    The shipment contains no prohibited or dangerous goods (batteries shipped alone, flammables, weapons, cash, illegal items),
                    the details above are accurate, and I accept the <Link to="/help#sending" target="_blank">terms of carriage</Link>.
                  </label>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="price-card position-sticky" style={{ top: 100 }}>
                <small className="text-white-50">{f.product} · {quote ? `${quote.chargeable_kg} kg` : '…'}</small>
                <div className="price my-2">{option?.available ? money(option.total, cur) : '—'}</div>
                {option?.available && <div className="mb-3"><span className="chip-lime">{option.transit === 'Today' ? 'Delivered today' : `Delivered by ${fmtShortDay(option.delivery_date)}`}{option.delivery_by !== 'end of day' ? `, ${option.delivery_by}` : ''}</span></div>}
                {(quoteError || (option && !option.available)) && <div className="alert alert-warning small">{quoteError || option.reason}. <Link to="/quote">Change shipment</Link></div>}
                {option?.lines.map(ln => <div className="row-i" key={ln.code}><span>{ln.label}</span><b>{money(ln.amount, cur)}</b></div>)}
                {option?.tax > 0 && <div className="row-i"><span>{st.tax_label}</span><b>{money(option.tax, cur)}</b></div>}
                <button className="btn btn-tp w-100 mt-4 btn-pill" disabled={busy || loading || !option?.available || !st.payments_enabled}>
                  {busy ? <><span className="spinner-border spinner-border-sm me-2" />Opening secure checkout…</> : <><i className="bi bi-credit-card me-2" />Pay {option?.available ? money(option.total, cur) : ''} by card</>}
                </button>
                <p className="small text-white-50 mt-3 mb-0"><i className="bi bi-lock-fill" /> You&apos;ll pay on a secure Paystack page. We accept debit and credit cards only. Your shipment is booked as soon as the payment is approved.</p>
                <Link to="/quote" className="btn btn-link text-white-50 w-100 mt-2">Change shipment</Link>
              </div>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}

export function BookConfirm() {
  useSeo('Payment', { noindex: true });
  const [params] = useSearchParams();
  const ref = params.get('reference') || params.get('trxref') || '';
  const { currency_symbol: cur } = useSettings();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const check = () => {
    setError('');
    api.verifyBooking(ref).then(setB).catch(err => setError(err.message));
  };
  useEffect(() => { if (ref) check(); }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (b?.status === 'paid') { try { sessionStorage.removeItem('vdc_booking_draft'); } catch { /* ignore */ } } }, [b?.status]);

  const retry = async () => {
    setBusy(true);
    try { window.location.assign((await api.retryBooking(b.reference)).authorization_url); } catch (err) { setError(err.message); setBusy(false); }
  };

  let body;
  if (!ref) body = <p className="lead-x">No payment reference found. <Link to="/quote">Start a new booking</Link>.</p>;
  else if (error && !b) body = <><Alert>{error}</Alert><button type="button" className="btn btn-tp-dark" onClick={check}>Check again</button></>;
  else if (!b) body = <p className="lead-x"><span className="spinner-border spinner-border-sm me-2" />Confirming your payment…</p>;
  else if (b.status === 'paid') {
    body = (
      <>
        <div className="pkg-ico mx-auto mb-3"><i className="bi bi-check2-circle" /></div>
        <h2 className="fw-bold">You&apos;re booked</h2>
        <p className="lead-x">We received {money(b.amount, cur)} from your {b.card}. Your waybill number is</p>
        <p className="display-6 mono fw-bold">{b.tracking_number}</p>
        <p className="text-muted">Pickup on {fmtShortDay(b.quote?.option?.ship_date)}. Write the waybill number on the parcel or show it to the courier.
          A copy of these details is saved on your receipt.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <Link to={`/track/${b.tracking_number}`} className="btn btn-tp-dark"><i className="bi bi-geo-alt me-1" />Track shipment</Link>
          <Link to={`/receipt?r=${b.receipt_number}`} className="btn btn-outline-dark rounded-0 fw-bold px-4"><i className="bi bi-receipt me-1" />View receipt</Link>
        </div>
      </>
    );
  } else if (b.status === 'failed') {
    body = (
      <>
        <div className="pkg-ico mx-auto mb-3" style={{ background: '#ffe0e0' }}><i className="bi bi-x-circle" /></div>
        <h2 className="fw-bold">Payment not completed</h2>
        <p className="lead-x">{b.gateway_message || 'The card payment was cancelled or declined.'} You haven&apos;t been charged for this attempt.</p>
        <Alert>{error}</Alert>
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <button type="button" className="btn btn-tp-dark" disabled={busy} onClick={retry}>{busy ? <span className="spinner-border spinner-border-sm" /> : <>Try another card</>}</button>
          <Link to="/contact?subject=Booking+payment" className="btn btn-outline-dark rounded-0 fw-bold px-4">Contact us</Link>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <h2 className="fw-bold">Waiting for your bank</h2>
        <p className="lead-x">Your payment for booking <b className="mono">{b.reference}</b> hasn&apos;t been confirmed yet.</p>
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <button type="button" className="btn btn-tp-dark" onClick={check}>Check again</button>
          <button type="button" className="btn btn-outline-dark rounded-0 fw-bold px-4" disabled={busy} onClick={retry}>Pay now</button>
        </div>
      </>
    );
  }

  return (
    <section className="section">
      <div className="container"><div className="tp-card text-center mx-auto" style={{ maxWidth: 680 }}>{body}</div></div>
    </section>
  );
}
