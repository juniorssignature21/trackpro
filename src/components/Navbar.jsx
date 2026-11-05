import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../lib/settings';

const SEND_LINKS = [
  { hash: 'domestic', icon: 'bi-box-seam', title: 'Domestic parcels', sub: 'Next-day across the country' },
  { hash: 'international', icon: 'bi-globe2', title: 'International', sub: '220+ countries & territories' },
  { hash: 'express', icon: 'bi-lightning-charge', title: 'Same day express', sub: 'Door to door in hours' },
  { hash: 'freight', icon: 'bi-truck', title: 'Freight & pallets', sub: 'Heavy and bulky goods' },
];

const LOGO = '/branding/logo_931a74e398.png';

export function Topbar() {
  const s = useSettings();
  return (
    <div className="tp-topbar d-none d-lg-block">
      <div className="container d-flex justify-content-between">
        <span><i className="bi bi-lightning-charge-fill" /> Same-day delivery now live in 40+ cities</span>
        <span><a href={`tel:${s.company_phone}`}><i className="bi bi-telephone" /> {s.company_phone}</a>
          &nbsp;·&nbsp;<a href={`mailto:${s.company_email}`}><i className="bi bi-envelope" /> {s.company_email}</a></span>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile off-canvas menu after navigating
  useEffect(() => {
    const el = document.getElementById('tpMenu');
    window.bootstrap?.Offcanvas.getInstance(el)?.hide();
  }, [pathname]);

  const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className={`navbar navbar-expand-lg tp-nav sticky-top${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand tp-logo" to="/">
          <img src={LOGO} alt="TrackPro Logistics" className="tp-logo-img" style={{ height: 55, width: 'auto' }} />
        </Link>
        <div className="tp-mobile-tools">
          <button type="button" className="btn tp-app-pill" data-install aria-label="Download app">
            <i className="bi bi-download" /><span className="tp-dl-long">Download</span><span className="tp-dl-short">App</span>
          </button>
          <Link to="/track" className="btn tp-icon-btn" aria-label="Track a parcel"><i className="bi bi-upc-scan" /></Link>
          <button className="navbar-toggler border-0 shadow-none p-0" type="button" data-bs-toggle="offcanvas"
            data-bs-target="#tpMenu" aria-label="Open menu">
            <i className="bi bi-list fs-2" />
          </button>
        </div>
        <div className="offcanvas offcanvas-end" tabIndex={-1} id="tpMenu">
          <div className="offcanvas-header">
            <span className="tp-logo"><img src={LOGO} alt="TrackPro Logistics" className="tp-logo-img" style={{ height: 34, width: 'auto' }} /></span>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav mx-auto gap-lg-2">
              <li className="nav-item"><NavLink end className={link} to="/">Home</NavLink></li>
              <li className="nav-item dropdown">
                <a className={`nav-link dropdown-toggle${pathname === '/services' ? ' active' : ''}`} href="#"
                  role="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={e => e.preventDefault()}>Send</a>
                <ul className="dropdown-menu tp-dd">
                  {SEND_LINKS.map(l => (
                    <li key={l.hash}>
                      <Link className="dropdown-item" to={`/services#${l.hash}`}>
                        <i className={`bi ${l.icon}`} /><span><b>{l.title}</b><small>{l.sub}</small></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item"><NavLink className={link} to="/track">Track</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/business">Business</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/about">About</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/help">Help</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/contact">Contact</NavLink></li>
            </ul>
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center mt-3 mt-lg-0">
              <button type="button" className="btn tp-install-btn js-install" data-install>
                <i className="bi bi-phone" /><span className="d-lg-none d-xl-inline ms-2">Install app</span>
              </button>
              <Link to="/quote" className="btn tp-btn-outline-dark">
                <i className="bi bi-box-seam me-2" />Get a quote <i className="bi bi-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
