import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Faq } from '../components/Bits';
import { HELP_GROUPS } from '../content';
import { useTitle } from '../lib/hooks';
import { RATES } from '../lib/pricing';
import { money } from '../lib/format';
import { useSettings } from '../lib/settings';

/* ------------------------------------------------------------------ Services */
const SERVICES = [
  { id: 'domestic', bg: 'var(--tp-green)', icon: 'bi-box-seam-fill', title: 'Domestic parcels', lead: 'Next-day across the country',
    from: () => 3.99, points: ['Collection from your door or drop-off point', 'Up to 30 kg per parcel', 'Live map tracking & SMS updates', 'Free cover up to £50.00'] },
  { id: 'international', bg: 'var(--tp-blue)', icon: 'bi-globe-americas', title: 'International', lead: '220+ countries, customs handled',
    from: () => RATES.Economy[0] * 2.8 + 12, reverse: true,
    points: ['Paperless customs declarations', 'Duties paid or unpaid options', 'Hub-by-hub tracking with flight legs', 'Insurance up to £10,000.00'] },
  { id: 'express', bg: 'var(--tp-pink)', icon: 'bi-lightning-charge-fill', title: 'Same day express', lead: 'Door to door in hours',
    from: () => 19.99, points: ['Dedicated courier, no stops', 'Real-time courier location', 'Call or chat your driver', 'Photo proof of delivery'] },
  { id: 'freight', bg: 'var(--tp-orange)', icon: 'bi-truck-front-fill', title: 'Freight & pallets', lead: 'Heavy and bulky goods', reverse: true,
    points: ['Full and part pallets', 'Tail-lift vehicles', 'Warehouse-to-warehouse', 'Account manager included'] },
];

export function Services() {
  useTitle('Services');
  const { currency_symbol: cur } = useSettings();
  return (
    <>
      <section className="tp-page-hero">
        <div className="container">
          <nav className="breadcrumb mb-2"><Link to="/">Home</Link>&nbsp;/&nbsp;Services</nav>
          <h1>Every way<br />to send</h1>
          <p className="fs-5 mt-3 mb-0" style={{ maxWidth: 560 }}>From a birthday card to a pallet of stock – pick the speed, we&apos;ll handle the rest.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {SERVICES.map(s => (
            <div className="row g-0 mb-5 svc-row bg-white" id={s.id} data-aos="fade-up" key={s.id}>
              <div className={`col-lg-5 ${s.reverse ? 'order-lg-2' : ''}`}>
                <div className="svc-img h-100" style={{ background: s.bg, color: '#fff' }}><i className={`bi ${s.icon}`} /></div>
              </div>
              <div className="col-lg-7 p-4 p-lg-5">
                <span className="eyebrow">{s.from ? `From ${money(s.from(), cur)}` : 'Custom quote'}</span>
                <h2 className="display-6 fw-bold mt-3">{s.title}</h2>
                <p className="lead-x">{s.lead}</p>
                <ul className="check-list fs-5">{s.points.map(p => <li key={p}>{p}</li>)}</ul>
                <Link to={s.id === 'freight' ? '/contact?subject=Freight+quote' : `/quote${s.id === 'international' ? '?international=1' : s.id === 'express' ? '?service=Same+Day' : ''}`}
                  className="btn btn-tp-dark mt-2">Get a quote <i className="bi bi-arrow-right ms-1" /></Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section-sm" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="display-x mb-4">Compare</h2>
          <div className="table-responsive"><table className="table table-borderless align-middle fs-6">
            <thead className="border-bottom border-dark border-2"><tr><th /><th>Economy</th><th>Standard</th><th>Express</th><th>Same Day</th></tr></thead>
            <tbody>
              <tr><td className="fw-bold">Delivery</td><td>3–5 days</td><td>2–3 days</td><td>Next day</td><td>Today</td></tr>
              <tr><td className="fw-bold">Live map</td>{[0, 1, 2, 3].map(i => <td key={i}><i className="bi bi-check-lg" /></td>)}</tr>
              <tr><td className="fw-bold">Courier contact</td><td>—</td><td>—</td><td><i className="bi bi-check-lg" /></td><td><i className="bi bi-check-lg" /></td></tr>
              <tr><td className="fw-bold">Starting price</td>{[3.99, 5.99, 9.99, 19.99].map(p => <td key={p}>{money(p, cur)}</td>)}</tr>
            </tbody>
          </table></div>
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
  useTitle('Business');
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
              <div className="d-flex justify-content-between small"><span>On-time 99.2%</span><span>Saved £1,840.00</span></div>
            </div>
            <div className="sheet-card lime p-4 mb-0 d-flex justify-content-between align-items-center"><div><b>Invoice #INV-0926</b><br /><small>Due in 14 days</small></div><b className="fs-4">£6,420.50</b></div>
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
          <div><h4 className="mb-1">Shipping 100+ parcels a month?</h4><p className="mb-0 fs-5">Talk to us about volume pricing.</p></div>
          <Link to="/contact?subject=Volume+pricing" className="btn btn-tp-dark">Contact sales</Link></div>
      </div></section>
    </>
  );
}

/* ------------------------------------------------------------------ About */
export function About() {
  useTitle('About');
  const tiles = [
    { v: '2019', l: 'Founded in London', bg: 'var(--tp-yellow)', c: 'var(--tp-ink)' },
    { v: '16K+', l: 'Drop-off points', bg: 'var(--tp-ink)', c: '#fff' },
    { v: '220', l: 'Countries', bg: 'var(--tp-blue)', c: '#fff' },
    { v: '1,200', l: 'Team members', bg: 'var(--tp-pink)', c: '#fff' },
  ];
  const beliefs = [
    { icon: 'bi-eye', t: 'Radical transparency', d: 'You see what we see. Every scan, every stop, every penny.' },
    { icon: 'bi-tree', t: 'Greener miles', d: 'Consolidated routes and EV vans in 30 cities cut emissions by 40%.' },
    { icon: 'bi-emoji-smile', t: 'Humans first', d: 'Real support, 24/7, and couriers who are paid fairly.' },
  ];
  const journey = [['2019', 'First 10 couriers in London'], ['2021', 'Launched live map tracking'], ['2023', 'International network: 120 countries'],
    ['2025', 'Digital stamped receipts & in-app payments'], ['2026', '16,000 drop points and growing']];
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
            <p className="lead-x mt-3">TrackPro started with a simple frustration: why could we see our bank balance to the penny, but not where our parcel was? So we built a logistics network that&apos;s as transparent as a fintech app.</p>
            <p>Today our couriers, hubs and partners stream location updates into one live map, every payment produces a stamped receipt, and every customer can call the person carrying their parcel.</p>
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
            <div className="col-md-4" key={b.t}><div className="tp-step"><i className={`bi ${b.icon}`} /><h4 className="mt-3">{b.t}</h4><p className="text-muted mb-0">{b.d}</p></div></div>
          ))}</div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="display-x mb-5">Our journey</h2>
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
  useTitle('Help');
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
