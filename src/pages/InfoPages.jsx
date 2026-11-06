import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Faq } from '../components/Bits';
import { HELP_GROUPS } from '../content';
import { useTitle } from '../lib/hooks';
import { money } from '../lib/format';
import { useSettings } from '../lib/settings';

/* ------------------------------------------------------------------ Services */
const SERVICE_DETAILS = {
  'Same Day': { bg: 'var(--tp-pink)', points: ['Dedicated courier, no stops', 'Book by 12:00 PM, delivered today', 'Call or chat your driver', 'Photo proof of delivery'], scope: 'Domestic' },
  'Express 9:00': { bg: 'var(--tp-purple)', points: ['Delivered by 9:00 AM next business day', 'Ideal for contracts, samples and urgent parts', 'Major US cities and international business centers', 'Money-back on late delivery for domestic shipments'], scope: 'Domestic & international' },
  'Express 12:00': { bg: 'var(--tp-blue)', points: ['Delivered by noon next business day', 'Time-definite at a lower premium than 9:00', 'Available to Canada, Mexico, Europe and major Asia-Pacific', 'Live tracking with courier contact'], scope: 'Domestic & international', reverse: true },
  Express: { bg: 'var(--tp-orange)', points: ['Next business day across the US', '1–3 business days to most of the world', 'Customs clearance included', 'Duties paid by receiver (DAP) or by you (DDP)'], scope: 'Domestic & international' },
  'Economy Select': { bg: 'var(--tp-green)', points: ['2–4 days across the US', 'Lower rates for heavier, less urgent shipments', 'Up to 150 kg per piece', 'Same tracking and value protection'], scope: 'Domestic & international', reverse: true },
};

export function Services() {
  useTitle();
  const { currency_symbol: cur, products } = useSettings();
  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2" aria-label="Breadcrumb"><Link to="/">Home</Link>&nbsp;/&nbsp;Services</nav>
          <h1>Every way<br />to ship</h1>
          <p className="fs-5 mt-3 mb-0" style={{ maxWidth: 620 }}>From a same-day envelope across town to a 9:00 AM delivery in Frankfurt. Pick the speed, we handle pickup, customs and delivery.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {products.map((p, i) => {
            const d = SERVICE_DETAILS[p.name] || { bg: 'var(--tp-ink)', points: [] };
            return (
              <div className="row g-0 mb-5 svc-row bg-white" id={p.code.toLowerCase()} data-aos="fade-up" key={p.name}>
                <div className={`col-lg-5 ${i % 2 ? 'order-lg-2' : ''}`}>
                  <div className="svc-img h-100" style={{ background: d.bg, color: '#fff' }}><i className={`bi ${p.icon}`} /></div>
                </div>
                <div className="col-lg-7 p-4 p-lg-5">
                  <span className="eyebrow">From {money(p.from, cur)} · {d.scope}</span>
                  <h2 className="display-6 fw-bold mt-3">{p.name}</h2>
                  <p className="lead-x">{p.blurb}</p>
                  <ul className="check-list fs-5">{d.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
                  <Link to={`/quote?service=${encodeURIComponent(p.name)}`} className="btn btn-tp-dark mt-2">Get a price <i className="bi bi-arrow-right ms-1" /></Link>
                </div>
              </div>
            );
          })}
          <div className="row g-0 mb-5 svc-row bg-white" id="freight" data-aos="fade-up">
            <div className="col-lg-5 order-lg-2"><div className="svc-img h-100" style={{ background: 'var(--tp-ink)', color: 'var(--tp-yellow)' }}><i className="bi bi-truck-front-fill" /></div></div>
            <div className="col-lg-7 p-4 p-lg-5">
              <span className="eyebrow">Custom quote</span>
              <h2 className="display-6 fw-bold mt-3">Freight &amp; pallets</h2>
              <p className="lead-x">Over 150 kg a piece, longer than 150 cm, or a full pallet? Our freight team quotes air and road freight within one business day.</p>
              <ul className="check-list fs-5"><li>Full and part pallets</li><li>Liftgate and inside delivery</li><li>Air freight with customs brokerage</li><li>Dedicated account manager</li></ul>
              <Link to="/contact?subject=Freight+quote" className="btn btn-tp-dark mt-2">Request a freight quote <i className="bi bi-arrow-right ms-1" /></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section-sm" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="display-x mb-4">Compare services</h2>
          <div className="table-responsive"><table className="table table-borderless align-middle fs-6">
            <thead className="border-bottom border-dark border-2"><tr><th scope="col" />{products.map(p => <th scope="col" key={p.name}>{p.name}</th>)}</tr></thead>
            <tbody>
              <tr><th scope="row">US delivery</th><td>Today</td><td>Next day, 9:00 AM</td><td>Next day, 12:00 PM</td><td>Next day</td><td>2–4 days</td></tr>
              <tr><th scope="row">International</th><td>—</td><td>1–3 days, 9:00 AM*</td><td>1–3 days, 12:00 PM*</td><td>1–6 days</td><td>3–10 days</td></tr>
              <tr><th scope="row">Courier contact</th><td><i className="bi bi-check-lg" /></td><td><i className="bi bi-check-lg" /></td><td><i className="bi bi-check-lg" /></td><td><i className="bi bi-check-lg" /></td><td>—</td></tr>
              <tr><th scope="row">Live map tracking</th>{products.map(p => <td key={p.name}><i className="bi bi-check-lg" /></td>)}</tr>
              <tr><th scope="row">Starting price</th>{products.map(p => <td key={p.name}>{money(p.from, cur)}</td>)}</tr>
            </tbody>
          </table></div>
          <p className="small text-muted mb-0">Business days, from the pickup day. Book by 5:00 PM (Same Day by 12:00 PM) for pickup the same business day.
            * Time-definite international delivery to Canada, Mexico, Europe and major Asia-Pacific business centers.
            Prices include the current fuel surcharge; duties and taxes are extra.</p>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Business */
const BIZ = [
  { icon: 'bi-upc-scan', title: 'Bulk labels', text: 'Upload a CSV and print hundreds of labels in one go.' },
  { icon: 'bi-code-slash', title: 'Developer API', text: 'Create shipments and pull live tracking straight into your store.' },
  { icon: 'bi-palette', title: 'Branded tracking', text: 'Your logo and colours on the tracking page your customers see.' },
  { icon: 'bi-receipt', title: 'Monthly invoicing', text: 'One stamped invoice per month, with every receipt attached.' },
  { icon: 'bi-arrow-repeat', title: 'Easy returns', text: 'Pre-paid return labels your customers can scan at any drop point.' },
  { icon: 'bi-person-badge', title: 'Account manager', text: 'A real person who knows your business, on call.' },
];

export function Business() {
  useTitle();
  return (
    <>
      <section className="tp-page-hero dark">
        <div className="container"><div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-7">
            <span className="eyebrow" style={{ background: 'var(--tp-yellow)', color: 'var(--tp-ink)' }}>For business</span>
            <h1 className="mt-3">Ship at <span>scale.</span><br />Pay monthly.</h1>
            <p className="fs-5 mt-3 text-white-50">Bulk labels, API access, branded tracking pages and one consolidated invoice every month.</p>
            <div className="d-flex gap-3 flex-wrap mt-4"><Link to="/contact?subject=Business+account" className="btn btn-tp">Open an account</Link><Link to="/quote" className="btn btn-tp-ghost">Get a quote</Link></div>
          </div>
          <div className="col-lg-5" data-aos="fade-left">
            <div className="sheet-card blue p-4">
              <small className="opacity-75">This month</small>
              <div className="display-5 fw-bold">2,418</div><div>parcels shipped</div>
              <div className="progress-x my-3"><span style={{ width: '78%' }} /></div>
              <div className="d-flex justify-content-between small"><span>On-time 99.2%</span><span>Saved $1,840.00</span></div>
            </div>
            <div className="sheet-card lime p-4 mb-0 d-flex justify-content-between align-items-center"><div><b>Invoice #INV-0926</b><br /><small>Due in 14 days</small></div><b className="fs-4">$6,420.50</b></div>
          </div>
        </div></div>
      </section>
      <section className="section">
        <div className="container"><div className="row g-4">
          {BIZ.map((b, i) => (
            <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={(i % 3) * 100} key={b.title}>
              <div className="tp-step"><i className={`bi ${b.icon}`} /><h4 className="mt-3">{b.title}</h4><p className="text-muted mb-0">{b.text}</p></div>
            </div>
          ))}
        </div></div>
      </section>
      <section className="section pt-0"><div className="container">
        <div className="tp-yellowbar"><i className="bi bi-plus-lg plus" />
          <div><h2 className="h4 mb-1">Shipping 100+ parcels a month?</h2><p className="mb-0 fs-5">Talk to us about volume pricing.</p></div>
          <Link to="/contact?subject=Volume+pricing" className="btn btn-tp-dark">Contact sales</Link></div>
      </div></section>
    </>
  );
}

/* ------------------------------------------------------------------ About */
export function About() {
  useTitle();
  const tiles = [
    { v: '200+', l: 'Countries & territories', bg: 'var(--tp-yellow)', c: 'var(--tp-ink)' },
    { v: '5', l: 'Express services', bg: 'var(--tp-ink)', c: '#fff' },
    { v: '24/7', l: 'Live tracking', bg: 'var(--tp-blue)', c: '#fff' },
    { v: 'Mon–Fri', l: 'Door-to-door pickup', bg: 'var(--tp-pink)', c: '#fff' },
  ];
  const beliefs = [
    { icon: 'bi-eye', t: 'Radical transparency', d: 'You see what we see: every scan, every stop and every charge, before you pay.' },
    { icon: 'bi-stopwatch', t: 'Time-definite', d: 'Delivery dates in business days and cut-off times you can plan around.' },
    { icon: 'bi-emoji-smile', t: 'Humans first', d: 'Real support and couriers you can reach on express shipments.' },
  ];
  const journey = [['Quote', 'Instant price for every service, with the delivery date'], ['Book & pay', 'Addresses, contents and secure card payment online'],
    ['Pickup', 'A courier collects from your door on the day you choose'], ['Customs', 'Paperless clearance for international shipments'], ['Delivery', 'Live map tracking to the door, with proof of delivery']];
  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2"><Link to="/">Home</Link>&nbsp;/&nbsp;About</nav>
          <h1>We move<br /><span style={{ background: 'var(--tp-purple)', color: '#fff', padding: '0 .15em' }}>things</span> that<br />matter</h1>
        </div>
      </section>
      <section className="section">
        <div className="container"><div className="row g-4 g-lg-5 align-items-center">
          <div className="col-lg-6" data-aos="fade-right">
            <h2 className="display-x">Delivery should feel like magic, not admin.</h2>
            <p className="lead-x mt-3">VDC Express Logistics started with a simple frustration: why could we see our bank balance to the penny, but not where our shipment was? So we built an express service that&apos;s as transparent as a banking app.</p>
            <p>Our couriers, facilities and partners stream checkpoint scans into one live map, every booking is paid securely by card with a stamped receipt, and express customers can reach the person carrying their shipment.</p>
          </div>
          <div className="col-lg-6"><div className="row g-3">
            {tiles.map((t, i) => (
              <div className="col-6" data-aos="zoom-in" data-aos-delay={i * 80} key={t.l}>
                <div className="p-4 h-100" style={{ background: t.bg, color: t.c }}>
                  <div className="display-6" style={{ fontFamily: 'var(--tp-display)' }}>{t.v}</div><div className="fw-bold">{t.l}</div>
                </div>
              </div>
            ))}
          </div></div>
        </div></div>
      </section>
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="display-x text-center mb-5">What we believe</h2>
          <div className="row g-4">{beliefs.map(b => (
            <div className="col-md-4" key={b.t}><div className="tp-step"><i className={`bi ${b.icon}`} /><h3 className="h4 mt-3">{b.t}</h3><p className="text-muted mb-0">{b.d}</p></div></div>
          ))}</div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="display-x mb-5">How a shipment moves</h2>
          <ul className="timeline fs-5" style={{ maxWidth: 700 }}>
            {journey.map(([y, t]) => <li className="done" key={y}><span className="dot" /><b>{y}</b> — {t}</li>)}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Help */
export function Help() {
  useTitle();
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    return HELP_GROUPS.map(g => {
      const items = g.items.map(it => ({ ...it, hidden: term && !(`${it.q} ${it.a}`.toLowerCase().includes(term)) }));
      return { ...g, items, empty: items.every(i => i.hidden) };
    });
  }, [q]);
  const nothing = groups.every(g => g.empty);

  return (
    <>
      <section className="tp-page-hero">
        <div className="container text-center">
          <h1>How can we<br />help?</h1>
          <form className="mt-4 mx-auto" style={{ maxWidth: 640 }} onSubmit={e => e.preventDefault()} role="search">
            <div className="tp-input-icon"><i className="bi bi-search" />
              <input value={q} onChange={e => setQ(e.target.value)} className="form-control tp-input" placeholder="Search help articles…" aria-label="Search help articles" /></div>
          </form>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="row g-3 mb-5">
            {HELP_GROUPS.map(g => (
              <div className="col-6 col-lg-3" key={g.id}>
                <Link to={`/help#${g.id}`} className="tp-linkcard text-center p-4"><i className={`bi ${g.icon} fs-1`} /><h5 className="mt-2 mb-0">{g.title}</h5></Link>
              </div>
            ))}
          </div>
          {nothing && <div className="tp-card flat mb-4 text-center text-muted">No articles match “{q}”. Try another word, or <Link to="/contact">ask our team</Link>.</div>}
          {groups.map(g => (
            <div className="tp-card flat mb-4 help-group svc-row" id={g.id} key={g.id} hidden={g.empty}>
              <h3><i className={`bi ${g.icon} me-2`} />{g.title}</h3>
              <Faq id={`acc${g.id}`} items={g.items} headingTag="h4" itemClass="help-item" />
            </div>
          ))}
          <div className="tp-yellowbar"><i className="bi bi-chat-dots plus" /><div><h4 className="mb-1">Still stuck?</h4><p className="mb-0">Our team replies within the hour, 24/7.</p></div><Link to="/contact" className="btn btn-tp-dark">Contact us</Link></div>
        </div>
      </section>
    </>
  );
}
