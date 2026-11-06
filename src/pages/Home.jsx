import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import Count from '../components/Count';
import { Faq, PixelQ, PxArrow, TrackForm } from '../components/Bits';
import { HOME_FAQ, TESTIMONIALS } from '../content';
import CountrySelect from '../components/CountrySelect';
import { useSeo } from '../lib/hooks';
import { money } from '../lib/format';
import { useSettings } from '../lib/settings';

const LINK_CARDS = [
  { to: '/quote', bg: '#dcf8e6', c: 'var(--tp-green)', icon: 'bi-send-fill', title: 'Send', text: 'Send parcels the smarter way' },
  { to: '/track', bg: '#ffe0f5', c: 'var(--tp-pink)', icon: 'bi-bag-check-fill', title: 'Collect', text: 'Pick up orders on your terms' },
  { to: '/help#returns', bg: '#ffe8dc', c: 'var(--tp-orange)', icon: 'bi-arrow-repeat', title: 'Returns', text: 'Scan, tap & go – return in seconds' },
];
const STEPS = [
  { icon: 'bi-calculator', title: 'Get a quote', text: 'Enter size, weight and destination. Price appears instantly.' },
  { icon: 'bi-credit-card-2-front', title: 'Pay by card', text: 'Secure card checkout. Your receipt is stamped and saved for you.' },
  { icon: 'bi-box2-heart', title: 'We pick it up', text: 'A courier collects from your door on the business day you choose.' },
  { icon: 'bi-geo-alt', title: 'Track live', text: 'Follow every move on the map until it lands at the door.' },
];
const BLOG = [
  { bg: 'var(--tp-green)', icon: 'bi-heart-fill', title: 'Save your faves', text: 'Your delivery, your rules. Set a go-to drop point, a safe place and a trusted neighbour.', more: 'Power back to you' },
  { bg: 'var(--tp-yellow-soft)', icon: 'bi-house-heart-fill', title: 'There’s no place like out-of-home', text: 'Make deliveries work around your life with 24/7 pickup points.', more: 'We’re not in Kansas anymore' },
  { bg: 'var(--tp-pink)', icon: 'bi-stars', title: 'Chargeable weight, explained', text: 'Why a big light box can cost more than a small heavy one, and how to pack to save.', more: 'Did you know?' },
];
const MARQUEE = ['Live GPS tracking', 'Express 9:00', '200+ countries', 'Same day delivery', 'Secure card payment', 'Customs handled'];

function SendTab() {
  const navigate = useNavigate();
  const { domestic_country: home } = useSettings();
  const [f, setF] = useState({ origin_country: home, dest_country: home, weight: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = e => {
    e.preventDefault();
    navigate(`/quote?${new URLSearchParams(Object.entries(f).filter(([, v]) => v))}`);
  };
  return (
    <form onSubmit={submit}>
      <div className="row g-2 mb-3">
        <div className="col-6"><CountrySelect value={f.origin_country} onChange={set('origin_country')} aria-label="Ship from country" /></div>
        <div className="col-6"><CountrySelect value={f.dest_country} onChange={set('dest_country')} aria-label="Ship to country" /></div>
        <div className="col-12"><input value={f.weight} onChange={set('weight')} type="number" step="0.1" min="0" className="form-control tp-input" placeholder="Weight (kg)" aria-label="Weight in kg" /></div>
      </div>
      <button className="btn btn-tp w-100">Compare prices</button>
    </form>
  );
}

export default function Home() {
  useSeo();
  const { products, currency_symbol: cur, international_from: intlFrom } = useSettings();
  const cheapest = Math.min(...products.map(p => p.from));
  return (
    <>
      {/* HERO */}
      <section className="tp-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <Swiper className="hero-swiper" modules={[Autoplay, EffectFade, Pagination]} loop speed={900}
                effect="fade" fadeEffect={{ crossFade: true }} autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ el: '.hero-pagination', clickable: true }}>
                <SwiperSlide>
                  <h1 className="tp-mega"><span className="d-block">Track it</span><span className="band">live on</span><span className="d-block">the map</span></h1>
                  <p className="hero-copy">Watch your parcel move street by street. Real-time GPS, instant updates and receipts in your pocket.</p>
                </SwiperSlide>
                <SwiperSlide>
                  <h2 className="tp-mega"><span className="d-block">Send</span><span className="band pink">smarter</span><span className="d-block outline">pay less</span></h2>
                  <p className="hero-copy">US express from {money(cheapest, cur)}, international from {money(intlFrom, cur)}. Every charge shown up front, pay by card, we pick up.</p>
                </SwiperSlide>
                <SwiperSlide>
                  <h2 className="tp-mega"><span className="d-block">Global</span><span className="band blue">door to</span><span className="d-block">door</span></h2>
                  <p className="hero-copy">200+ countries, customs handled for you, duties paid or unpaid, and a courier you can actually call.</p>
                </SwiperSlide>
                <div slot="container-end" className="swiper-pagination hero-pagination" />
              </Swiper>

              <div className="m-wallet">
                <div className="d-flex justify-content-between align-items-center">
                  <div><small className="text-white-50">Ship with VDC Express</small>
                    <div className="fs-2 fw-bold">200+ countries</div></div>
                  <span className="chip-lime"><i className="bi bi-broadcast" /> Live</span>
                </div>
                <div className="quick-actions">
                  <Link to="/quote"><i className="bi bi-send" />Send</Link>
                  <Link to="/track"><i className="bi bi-geo" />Track</Link>
                  <Link to="/receipt"><i className="bi bi-receipt" />Receipt</Link>
                  <Link to="/help#returns"><i className="bi bi-arrow-repeat" />Return</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5 offset-lg-1" data-aos="fade-left">
              <div className="tp-widget">
                <ul className="nav" role="tablist">
                  <li className="flex-fill d-flex"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#tabSend" type="button"><i className="bi bi-box-seam me-2" />Send</button></li>
                  <li className="flex-fill d-flex"><button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tabTrack" type="button"><i className="bi bi-search me-2" />Track</button></li>
                  <li className="flex-fill d-flex"><button className="nav-link" data-bs-toggle="tab" data-bs-target="#tabReturn" type="button"><i className="bi bi-arrow-counterclockwise me-2" />Return</button></li>
                </ul>
                <div className="tab-content">
                  <div className="tab-pane fade" id="tabSend">
                    <h3>Ship in minutes</h3><p>Compare every service and delivery date</p>
                    <SendTab />
                  </div>
                  <div className="tab-pane fade show active" id="tabTrack">
                    <h3>Track to the future</h3><p>Keep up with your parcels from A to B</p>
                    <TrackForm>
                      {input => (<>
                        <div className="tp-input-icon mb-3"><i className="bi bi-search" />{input()}</div>
                        <button className="btn btn-tp w-100">Track your parcel</button>
                      </>)}
                    </TrackForm>
                  </div>
                  <div className="tab-pane fade" id="tabReturn">
                    <h3>Return made easy</h3><p>Scan, tap &amp; go – return in seconds</p>
                    <Link to="/help#returns" className="btn btn-tp w-100 mb-2">Start a return</Link>
                    <Link to="/receipt" className="btn btn-outline-dark w-100 rounded-0 py-3 fw-bold">Find my receipt</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="tp-marquee"><div className="track">
        {[...MARQUEE, ...MARQUEE].map((t, i) => (<Fragment key={i}><span>{t}</span><i className="bi bi-asterisk" /></Fragment>))}
      </div></div>

      {/* SEND / COLLECT / RETURNS */}
      <section className="section">
        <div className="container"><div className="row g-4">
          {LINK_CARDS.map((c, i) => (
            <div className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100} key={c.title}>
              <Link to={c.to} className="tp-linkcard">
                <div className="ic" style={{ background: c.bg, color: c.c }}><i className={`bi ${c.icon}`} /></div>
                <h3>{c.title}</h3>
                <div className="d-flex justify-content-between align-items-end gap-3 mt-3">
                  <p>{c.text}</p><PxArrow color={c.c} />
                </div>
              </Link>
            </div>
          ))}
        </div></div>
      </section>

      {/* APP SHOWCASE */}
      <section className="section pt-0">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6 order-lg-2" data-aos="fade-up">
              <span className="eyebrow"><i className="bi bi-phone" /> The VDC Express app</span>
              <h2 className="display-x mt-3">Your parcels.<br />Like your bank app.</h2>
              <p className="lead-x mt-3">Everything you&apos;d expect from a modern fintech app – but for deliveries. Live balances become live locations.</p>
              <ul className="list-unstyled feat-list mt-4">
                <li><span className="ic"><i className="bi bi-broadcast-pin" /></span><div><h5 className="mb-1">Live map movement</h5><p className="text-muted mb-0">See your courier glide across the map with refreshed GPS points.</p></div></li>
                <li><span className="ic"><i className="bi bi-receipt-cutoff" /></span><div><h5 className="mb-1">Stamped digital receipts</h5><p className="text-muted mb-0">Every payment produces a verified, printable receipt with QR code.</p></div></li>
                <li><span className="ic"><i className="bi bi-shield-check" /></span><div><h5 className="mb-1">Protected up to $25,000</h5><p className="text-muted mb-0">Add shipment value protection when you book, from 1% of the value.</p></div></li>
              </ul>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/track" className="btn btn-tp-dark btn-pill px-4">Track a parcel <i className="bi bi-arrow-right ms-2" /></Link>
                <button type="button" className="btn btn-tp btn-pill px-4" data-install><i className="bi bi-phone me-2" />Install the app</button>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1" data-aos="zoom-in">
              <div className="row g-0 align-items-center">
                <div className="col-7">
                  <div className="tp-phone tilt float"><div className="screen">
                    <div className="d-flex justify-content-between"><i className="bi bi-chevron-left fs-5" /><i className="bi bi-question-circle fs-5" /></div>
                    <h4 className="mt-2 mb-0">Tracking</h4>
                    <div className="ring-wrap">
                      <svg width="220" height="220"><circle cx="110" cy="110" r="92" stroke="rgba(255,255,255,.25)" strokeWidth="18" fill="none" />
                        <circle cx="110" cy="110" r="92" stroke="#fff" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray="578" strokeDashoffset="190" /></svg>
                      <div className="ring-center"><div className="fw-bold fs-5">In Transit</div><small className="mono opacity-75">#4829137563</small><span className="chip-lime mt-2">Live Tracking</span></div>
                    </div>
                    <div className="mini-card"><div className="fw-bold">Delivery Details</div><div className="mini-bar"><span style={{ width: '62%' }} /></div>
                      <div className="d-flex justify-content-between small opacity-75"><span>Mon</span><span>Wed</span></div></div>
                    <div className="mini-card lime d-flex justify-content-between align-items-center"><div><div className="fw-bold">Receiver</div><small>Daniel Brooks</small></div><span className="avatar" style={{ background: '#1d1d1f' }}>DB</span></div>
                  </div></div>
                </div>
                <div className="col-5 d-none d-sm-block">
                  <div className="float-2" style={{ marginLeft: -30 }}>
                    <div className="route-card d-block" aria-hidden="true"><div className="mono fw-bold">#4829137563</div>
                      <div className="route-line"><span className="dot" /><span className="dash" /><span className="box"><i className="bi bi-box-seam" /></span><span className="dash" /><span className="dot" /></div>
                      <small>In transit · Memphis</small></div>
                    <div className="route-card dark d-block" aria-hidden="true" style={{ transform: 'rotate(-4deg)' }}><div className="mono fw-bold">#3065581201</div>
                      <div className="route-line"><span className="dot" /><span className="dash" /><span className="dot" /></div><small>Delivered</small></div>
                    <div className="route-card light d-block" aria-hidden="true"><div className="mono fw-bold">#5710042181</div>
                      <div className="route-line"><span className="dot" /><span className="dash" /><span className="box" style={{ background: 'var(--tp-ink)', color: '#fff' }}><i className="bi bi-airplane" /></span><span className="dash" /><span className="dot" /></div><small>Customs · Lagos</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="eyebrow">How it works</span>
            <h2 className="display-x mt-3">Four taps to delivered</h2>
          </div>
          <div className="row g-4">
            {STEPS.map((s, i) => (
              <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={i * 100} key={s.title}>
                <div className="tp-step"><span className="num">{String(i + 1).padStart(2, '0')}</span><i className={`bi ${s.icon}`} /><h4 className="mt-3">{s.title}</h4><p className="text-muted mb-0">{s.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="tp-stats">
        <div className="container"><div className="row text-center g-4">
          <div className="col-6 col-lg-3"><Count as="div" className="num" to={16000} suffix="+" /><div>Drop-off points</div></div>
          <div className="col-6 col-lg-3"><Count as="div" className="num" to={220} /><div>Countries served</div></div>
          <div className="col-6 col-lg-3"><Count as="div" className="num" to={99.4} suffix="%" /><div>On-time delivery</div></div>
          <div className="col-6 col-lg-3"><Count as="div" className="num" to={4.9} suffix="★" /><div>App rating</div></div>
        </div></div>
      </section>

      {/* NEW TO / MULTIPLE */}
      <section className="section">
        <div className="container">
          <div className="tp-dark-banner" data-aos="fade-up">
            <div className="row"><div className="col-lg-7">
              <h2>New to VDC Express?</h2>
              <p className="fs-5 mb-4">Get the lowdown on how our couriers, hubs and live map work.</p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/about" className="btn btn-tp">Learn about VDC Express</Link>
                <Link to="/help#tracking" className="btn btn-tp-ghost">What&apos;s live tracking?</Link>
              </div>
            </div></div>
            <div className="locker">
              <span className="brand"><i className="bi bi-geo-alt-fill" /> VDC Express</span>
              <span className="big">SCAN<br />TAP<br />&amp;GO</span>
              {Array.from({ length: 30 }, (_, i) => <div key={i} className={i === 4 ? 'scr' : undefined} />)}
            </div>
          </div>
          <div className="tp-yellowbar mt-5" data-aos="fade-up">
            <i className="bi bi-plus-lg plus" />
            <div><h4 className="mb-1">Sending multiple parcels?</h4><p className="mb-0 fs-5">Open a business account for bulk labels &amp; monthly invoicing.</p></div>
            <Link to="/business" className="btn btn-tp-dark">Take me there</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section pt-0">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
            <h2 className="display-x mb-0">Loved by<br />senders</h2><p className="lead-x mb-0">What customers say about shipping with us</p>
          </div>
          <Swiper className="quote-swiper" modules={[Autoplay]} loop spaceBetween={20} autoplay={{ delay: 4000 }}
            slidesPerView={1.1} breakpoints={{ 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <SwiperSlide className="h-auto" key={i}><div className="tp-quote">
                <div className="stars mb-3">{Array.from({ length: 5 }, (_, j) => <i key={j} className="bi bi-star-fill" />)}</div>
                <p className="fs-5">“{t.text}”</p>
                <div className="d-flex align-items-center gap-3 mt-4"><span className="avatar" style={{ background: t.color }}>{t.name[0]}</span>
                  <div><b>{t.name}</b><br /><small className="text-muted">{t.city}</small></div></div>
              </div></SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* BLOG */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center mb-5"><h2 className="display-5 fw-bold">The latest from us</h2>
            <p className="fs-5">Updates, tips &amp; (if we say so ourselves) the best parcel puns</p></div>
          <div className="row g-4">
            {BLOG.map((b, i) => (
              <div className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100} key={b.title}>
                <Link to="/help" className="tp-blog" style={{ background: 'var(--tp-bg)' }}>
                  <div className="cover" style={{ background: b.bg }}><i className={`bi ${b.icon}`} /></div>
                  <div className="body"><h4>{b.title}</h4><p className="fs-6">{b.text}</p>
                    <span className="more">{b.more} <PxArrow /></span></div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container"><div className="tp-card flat p-lg-5">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-5">
              <h2 className="display-6 fw-bold">Got questions? We&apos;ve got answers.</h2>
              <Link to="/help" className="fw-bold text-decoration-none d-inline-flex align-items-center gap-2 mt-3">View our help page <PxArrow color="var(--tp-ink)" style={{ transform: 'scale(.6)' }} /></Link>
              <div className="d-flex align-items-end gap-4 mt-5 d-none d-lg-flex">
                <PixelQ color="var(--tp-pink)" size={26} /><PixelQ color="var(--tp-blue)" size={14} />
              </div>
            </div>
            <div className="col-lg-7"><Faq id="faq" items={HOME_FAQ} /></div>
          </div>
        </div></div>
      </section>

      <section className="section-sm" style={{ background: 'var(--tp-yellow)' }}>
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-4">
          <h2 className="display-x mb-0">Ready to send?</h2>
          <div className="d-flex gap-3 flex-wrap"><Link to="/quote" className="btn btn-tp-dark">Get an instant quote</Link><Link to="/track" className="btn btn-outline-dark rounded-0 fw-bold px-4 py-3">Track a parcel</Link></div>
        </div>
      </section>
    </>
  );
}
