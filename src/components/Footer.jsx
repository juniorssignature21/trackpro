import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import Logo from './Logo';

const APP_ICON = '/branding/vdc-icon-192.png';

export default function Footer() {
  const s = useSettings();
  return (
    <footer className="tp-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <span className="tp-logo text-white">
              <Logo light height={46} className="tp-logo-img" />
            </span>
            <p className="mt-3 text-white-50">Same-day, time-definite and international express shipping from the US to 200+ countries. Instant quotes, card payment and live tracking.</p>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="h6">Ship</h2>
            <Link to="/services#sdx">Same Day</Link><Link to="/services#x09">Express 9:00</Link>
            <Link to="/services#xpd">International Express</Link><Link to="/quote">Quote &amp; book</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="h6">Receive</h2>
            <Link to="/track">Track a shipment</Link><Link to="/help">Delivery options</Link>
            <Link to="/help#returns">Returns</Link><Link to="/receipt">Find a receipt</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="h6">Company</h2>
            <Link to="/about">About us</Link><Link to="/business">Business</Link>
            <Link to="/contact">Contact</Link><Link to="/help">Help center</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="h6">Get in touch</h2>
            <p className="small text-white-50 mb-1">{s.company_address}</p>
            <a href={`mailto:${s.company_email}`}>{s.company_email}</a>
            <a href={`tel:${s.company_phone}`}>{s.company_phone}</a>
          </div>
        </div>
        <div className="tp-getapp">
          <img src={APP_ICON} alt="" width="64" height="64" />
          <div className="flex-grow-1"><b>Get the VDC Express app</b>
            <span>Live tracking, receipts and quotes on your home screen. Free, no app store needed.</span></div>
          <div className="tp-getapp-btns">
            <button type="button" className="btn tp-store" data-install><i className="bi bi-apple" /><span><small>Install on</small>iPhone</span></button>
            <button type="button" className="btn tp-store" data-install><i className="bi bi-google-play" /><span><small>Install on</small>Android</span></button>
          </div>
        </div>
        <div className="tp-footer-bottom">
          <span>© {new Date().getFullYear()} {s.company_name}. All rights reserved.</span>
          <span><Link to="/help#payments">Payments</Link> · <Link to="/help#sending">Terms of carriage</Link> · <Link to="/contact">Contact</Link></span>
        </div>
      </div>
    </footer>
  );
}

export function TabBar() {
  const cls = ({ isActive }) => (isActive ? 'active' : '');
  return (
    <nav className="tp-tabbar d-lg-none">
      <NavLink end to="/" className={cls}><i className="bi bi-house-door-fill" /><span>Home</span></NavLink>
      <NavLink to="/quote" className={cls}><i className="bi bi-calculator" /><span>Quote</span></NavLink>
      <NavLink to="/track" className={({ isActive }) => `tp-tab-main${isActive ? ' active' : ''}`} aria-label="Track">
        <i className="bi bi-upc-scan" />
      </NavLink>
      <NavLink to="/receipt" className={cls}><i className="bi bi-receipt" /><span>Receipts</span></NavLink>
      <NavLink to="/help" className={cls}><i className="bi bi-question-circle" /><span>Help</span></NavLink>
    </nav>
  );
}

export function InstallUI() {
  return (
    <>
      <div className="tp-install-banner" id="installBanner" role="dialog" aria-label="Install app">
        <img src={APP_ICON} alt="" width="48" height="48" />
        <div className="flex-grow-1 lh-sm"><b>VDC Express app</b><br /><small>Track parcels live from your home screen</small></div>
        <button type="button" className="btn btn-tp btn-pill btn-sm px-3 py-2" data-install>Install</button>
        <button type="button" className="tp-ib-close" data-banner-close aria-label="Dismiss"><i className="bi bi-x-lg" /></button>
      </div>

      <div className="tp-sheet" id="installSheet" aria-hidden="true">
        <div className="tp-sheet-card" role="dialog" aria-modal="true" aria-labelledby="insTitle">
          <span className="tp-sheet-grip" />
          <button type="button" className="tp-sheet-x" data-install-close aria-label="Close"><i className="bi bi-x-lg" /></button>
          <div className="d-flex align-items-center gap-3 mb-3">
            <img src={APP_ICON} alt="" width="60" height="60" className="rounded-4" />
            <div><h5 className="fw-bold mb-0" id="insTitle">Install VDC Express</h5><small className="text-muted">Works like a native app · free · under 1 MB</small></div>
          </div>
          <div className="ins-ios">
            <div className="ins-ios-other alert alert-warning small py-2" hidden><i className="bi bi-info-circle" /> For the best result open this page in <b>Safari</b> first.</div>
            <ol className="ins-steps">
              <li><span className="ins-n">1</span><div>Tap the <b>Share</b> button <span className="ins-key"><i className="bi bi-box-arrow-up" /></span> in Safari&apos;s toolbar</div></li>
              <li><span className="ins-n">2</span><div>Scroll down and tap <b>Add to Home Screen</b> <span className="ins-key"><i className="bi bi-plus-square" /></span></div></li>
              <li><span className="ins-n">3</span><div>Tap <b>Add</b> – the app appears on your home screen</div></li>
            </ol>
          </div>
          <div className="ins-generic">
            <ol className="ins-steps">
              <li><span className="ins-n"><i className="bi bi-android2" /></span><div><b>Android (Chrome):</b> tap the menu <span className="ins-key"><i className="bi bi-three-dots-vertical" /></span> → <b>Install app</b> / <b>Add to Home screen</b></div></li>
              <li><span className="ins-n"><i className="bi bi-apple" /></span><div><b>iPhone (Safari):</b> tap Share <span className="ins-key"><i className="bi bi-box-arrow-up" /></span> → <b>Add to Home Screen</b></div></li>
              <li><span className="ins-n"><i className="bi bi-laptop" /></span><div><b>Computer:</b> click the install icon <span className="ins-key"><i className="bi bi-download" /></span> in Chrome/Edge&apos;s address bar, or in Safari choose <b>File → Add to Dock</b></div></li>
            </ol>
          </div>
          <button type="button" className="btn btn-tp-dark w-100 btn-pill mt-2" data-install-close>Got it</button>
        </div>
      </div>
    </>
  );
}
