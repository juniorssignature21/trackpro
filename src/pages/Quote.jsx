import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Bits';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { useTitle } from '../lib/hooks';
import { calcQuote, DAYS, SERVICES } from '../lib/pricing';
import { useSettings } from '../lib/settings';

export default function Quote() {
  useTitle('Instant quote');
  const [params] = useSearchParams();
  const { currency_symbol: cur, vat_rate: vatRate } = useSettings();
  const [f, setF] = useState(() => ({
    international: params.get('international') === '1',
    origin: params.get('origin') || '', destination: params.get('destination') || '',
    weight: params.get('weight') || '1', length: '30', width: '20', height: '15',
    service: SERVICES.some(s => s.value === params.get('service')) ? params.get('service') : 'Standard',
    name: '', email: '', phone: '', message: '',
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const set = k => e => setF(prev => ({ ...prev, [k]: e.target.type === 'radio' && k === 'international' ? e.target.value === '1' : e.target.value }));
  const q = useMemo(() => calcQuote({ ...f, vatRate }), [f, vatRate]);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await api.requestQuote({
        origin: f.origin, destination: f.destination, international: f.international, service_type: f.service,
        weight_kg: +f.weight || 0, length_cm: +f.length || 0, width_cm: +f.width || 0, height_cm: +f.height || 0,
        name: f.name, email: f.email, phone: f.phone, message: f.message,
      });
      setDone(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2"><Link to="/">Home</Link>&nbsp;/&nbsp;Quote</nav>
          <h1>Instant<br /><span style={{ background: 'var(--tp-ink)', color: 'var(--tp-yellow)', padding: '0 .15em' }}>quote</span></h1>
          <p className="fs-5 mt-3 mb-0">Prices update as you type. Book now or we&apos;ll email you the quote.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {done ? (
            <div className="tp-card text-center mx-auto" style={{ maxWidth: 640 }}>
              <div className="pkg-ico mx-auto mb-3"><i className="bi bi-check2-circle" /></div>
              <h2 className="fw-bold">Quote requested</h2>
              <p className="lead-x">Thanks {done.name.split(' ')[0]} – your reference is <b className="mono text-dark">{done.reference}</b>.
                We&apos;ve saved your price of <b className="text-dark">{money(done.total, cur)}</b> and will be in touch at {done.email} shortly.</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
                <button type="button" className="btn btn-tp-dark" onClick={() => setDone(null)}>Get another quote</button>
                <Link to="/" className="btn btn-outline-dark rounded-0 fw-bold px-4">Back home</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="row g-4">
              <div className="col-lg-8">
                <Alert onClose={() => setError('')}>{error}</Alert>
                <div className="tp-card mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                    <h4 className="mb-0"><i className="bi bi-signpost-split me-2" />Route</h4>
                    <div className="seg">
                      <input type="radio" name="international" id="dom" value="0" checked={!f.international} onChange={set('international')} /><label htmlFor="dom">Domestic</label>
                      <input type="radio" name="international" id="intl" value="1" checked={f.international} onChange={set('international')} /><label htmlFor="intl">International</label>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label" htmlFor="origin">Collect from</label><div className="tp-input-icon"><i className="bi bi-circle" />
                      <input id="origin" value={f.origin} onChange={set('origin')} className="form-control tp-input" placeholder="City or postcode" required minLength={2} /></div></div>
                    <div className="col-md-6"><label className="form-label" htmlFor="destination">Deliver to</label><div className="tp-input-icon"><i className="bi bi-geo-alt-fill" />
                      <input id="destination" value={f.destination} onChange={set('destination')} className="form-control tp-input" placeholder="City or postcode" required minLength={2} /></div></div>
                  </div>
                </div>

                <div className="tp-card mb-4">
                  <h4 className="mb-3"><i className="bi bi-box-seam me-2" />Parcel</h4>
                  <div className="row g-3">
                    {[['weight', 'Weight (kg)', '0.1'], ['length', 'Length (cm)', '1'], ['width', 'Width (cm)', '1'], ['height', 'Height (cm)', '1']].map(([k, l, step]) => (
                      <div className="col-6 col-md-3" key={k}><label className="form-label" htmlFor={k}>{l}</label>
                        <input id={k} type="number" step={step} min="0" value={f[k]} onChange={set(k)} className="form-control tp-input" /></div>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2"><i className="bi bi-info-circle" /> We charge the higher of actual and volumetric weight (L×W×H ÷ 5000).</small>
                </div>

                <div className="tp-card mb-4">
                  <h4 className="mb-3"><i className="bi bi-lightning-charge me-2" />Speed</h4>
                  <div className="row g-3">
                    {SERVICES.map(s => {
                      const id = `svc${s.value.replace(' ', '')}`;
                      return (
                        <div className="col-6 col-md-3 svc-option" key={s.value}>
                          <input type="radio" name="service_type" id={id} value={s.value} checked={f.service === s.value} onChange={set('service')} />
                          <label htmlFor={id}><i className={`bi ${s.icon}`} /><div className="fw-bold mt-2">{s.value}</div><small className="text-muted">{DAYS[s.value]}</small></label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="tp-card">
                  <h4 className="mb-3"><i className="bi bi-person me-2" />Your details</h4>
                  <div className="row g-3">
                    <div className="col-md-4"><label className="form-label" htmlFor="qname">Full name</label><input id="qname" value={f.name} onChange={set('name')} className="form-control tp-input" required minLength={2} autoComplete="name" /></div>
                    <div className="col-md-4"><label className="form-label" htmlFor="qemail">Email</label><input id="qemail" type="email" value={f.email} onChange={set('email')} className="form-control tp-input" required autoComplete="email" /></div>
                    <div className="col-md-4"><label className="form-label" htmlFor="qphone">Phone</label><input id="qphone" value={f.phone} onChange={set('phone')} className="form-control tp-input" autoComplete="tel" /></div>
                    <div className="col-12"><label className="form-label" htmlFor="qmsg">Anything we should know?</label><textarea id="qmsg" rows="3" value={f.message} onChange={set('message')} className="form-control tp-input" placeholder="Fragile items, pickup time…" /></div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="price-card">
                  <small className="text-white-50">Estimated total (incl. VAT)</small>
                  <div className="price my-2">{money(q.total, cur)}</div>
                  <div className="mb-3"><span className="chip-lime">{q.days}</span></div>
                  <div className="row-i"><span>Route</span><b className="text-end">{f.origin || 'Origin'} → {f.destination || 'Destination'}</b></div>
                  <div className="row-i"><span>Service</span><b>{f.service}</b></div>
                  <div className="row-i"><span>Volumetric weight</span><b>{q.vol.toFixed(2)} kg</b></div>
                  <div className="row-i"><span>Chargeable weight</span><b>{q.charge.toFixed(2)} kg</b></div>
                  <div className="row-i"><span>Shipping</span><b>{money(q.net, cur)}</b></div>
                  <div className="row-i"><span>VAT ({Math.round(vatRate * 100)}%)</span><b>{money(q.vat, cur)}</b></div>
                  <button className="btn btn-tp w-100 mt-4 btn-pill" disabled={busy}>
                    {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <>Request this quote <i className="bi bi-arrow-right" /></>}
                  </button>
                  <p className="small text-white-50 mt-3 mb-0"><i className="bi bi-shield-check" /> Free tracking &amp; up to {money(50, cur)} cover included.</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
