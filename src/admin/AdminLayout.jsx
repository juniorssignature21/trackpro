import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import { useBodyClass } from '../lib/hooks';
import { api } from '../lib/api';

export default function AdminLayout() {
  useBodyClass('adm');
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ q: 0, m: 0 });
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    api.stats().then(s => setCounts({ q: s.new_quotes, m: s.unread_messages })).catch(() => {});
  }, [pathname]);

  const signOut = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="adm">
      <div className="adm-top">
        <button type="button" className="btn btn-sm text-white" onClick={() => setOpen(true)} aria-label="Open menu"><i className="bi bi-list fs-4" /></button>
        <img src="/branding/logolight_7df7d148ec.png" alt="TrackPro" />
        <Link to="/admin/shipments/new" className="btn btn-sm btn-tp px-2 py-1" aria-label="New shipment"><i className="bi bi-plus-lg" /></Link>
      </div>
      <aside className={`adm-side${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && setOpen(false)}>
        <div className="brand"><img src="/branding/logolight_7df7d148ec.png" alt="TrackPro" /></div>
        <NavLink end to="/admin"><i className="bi bi-grid-1x2-fill" />Dashboard</NavLink>
        <NavLink to="/admin/shipments"><i className="bi bi-box-seam-fill" />Shipments</NavLink>
        <NavLink to="/admin/quotes"><i className="bi bi-calculator-fill" />Quote requests{counts.q > 0 && <span className="pill">{counts.q}</span>}</NavLink>
        <NavLink to="/admin/messages"><i className="bi bi-envelope-fill" />Messages{counts.m > 0 && <span className="pill">{counts.m}</span>}</NavLink>
        <NavLink to="/admin/account"><i className="bi bi-person-fill-gear" />Account</NavLink>
        <div className="foot">
          <a href="/" target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right" />View website</a>
          <a href="#" onClick={e => { e.preventDefault(); signOut(); }}><i className="bi bi-box-arrow-left" />Sign out</a>
          <small className="d-block px-3 pt-2 text-white-50 text-truncate">{user?.email}</small>
        </div>
      </aside>
      <div className="adm-content"><Outlet /></div>
    </div>
  );
}
