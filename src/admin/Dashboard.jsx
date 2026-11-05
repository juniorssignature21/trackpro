import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Alert, Spinner } from '../components/Bits';
import { money, statusMeta, timeAgo } from '../lib/format';
import { useTitle } from '../lib/hooks';
import { useSettings } from '../lib/settings';

export function StatusBadge({ status }) {
  const { statuses } = useSettings();
  return <span className={`tp-badge ${statusMeta(status).cls}`}>{statuses[status] || status}</span>;
}

export function ShipmentTable({ rows }) {
  const navigate = useNavigate();
  if (!rows.length) return <p className="text-muted mb-0">No shipments yet.</p>;
  return (
    <div className="table-responsive">
      <table className="adm-table">
        <thead><tr><th>Tracking no.</th><th>Status</th><th>Route</th><th>Receiver</th><th>Service</th><th>Updated</th></tr></thead>
        <tbody>
          {rows.map(s => (
            <tr key={s.id} className="clickable" onClick={() => navigate(`/admin/shipments/${s.id}`)}>
              <td className="mono fw-bold"><Link to={`/admin/shipments/${s.id}`} className="text-decoration-none" onClick={e => e.stopPropagation()}>{s.tracking_number}</Link></td>
              <td><StatusBadge status={s.status} /></td>
              <td className="text-nowrap">{s.origin || '—'} <i className="bi bi-arrow-right text-muted" /> {s.destination || '—'}</td>
              <td>{s.receiver_name || '—'}</td>
              <td>{s.service_type}{s.international && <i className="bi bi-globe2 ms-1 text-primary" title="International" />}</td>
              <td className="text-muted text-nowrap">{timeAgo(s.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  useTitle('Dashboard');
  const { currency_symbol: cur, statuses } = useSettings();
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.stats().then(setS).catch(e => setError(e.message)); }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!s) return <Spinner />;

  const tiles = [
    { l: 'Active shipments', v: s.active, i: 'bi-truck', bg: '#fff3c4', fg: '#8a6500' },
    { l: 'Delivered', v: s.delivered, i: 'bi-house-check-fill', bg: '#dcf8e6', fg: '#0b7a3a' },
    { l: 'Exceptions', v: s.exceptions, i: 'bi-exclamation-triangle-fill', bg: '#ffe0e0', fg: '#c01d1d' },
    { l: 'Revenue collected', v: money(s.revenue, cur), i: 'bi-cash-stack', bg: '#e2edff', fg: '#1452c9' },
  ];
  const max = Math.max(1, ...Object.values(s.by_status));

  return (
    <>
      <div className="adm-head">
        <h1>Dashboard</h1>
        <Link to="/admin/shipments/new" className="btn btn-tp-dark"><i className="bi bi-plus-lg me-1" />New shipment</Link>
      </div>
      <div className="row g-3 mb-4">
        {tiles.map(t => (
          <div className="col-6 col-xl-3" key={t.l}>
            <div className="adm-stat"><small>{t.l}</small><div className="v">{t.v}</div><i className={`bi ${t.i}`} style={{ '--bg': t.bg, '--fg': t.fg }} /></div>
          </div>
        ))}
      </div>
      <div className="row g-3">
        <div className="col-xl-8">
          <div className="adm-card">
            <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Recently updated</h5><Link to="/admin/shipments" className="small fw-bold">View all</Link></div>
            <ShipmentTable rows={s.recent} />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="adm-card">
            <h5 className="mb-3">By status <small className="text-muted fw-normal">({s.shipments} total)</small></h5>
            {Object.entries(statuses).filter(([k]) => s.by_status[k]).map(([k, label]) => (
              <Link to={`/admin/shipments?status=${k}`} key={k} className="d-block text-decoration-none text-dark mb-3">
                <div className="d-flex justify-content-between small fw-bold mb-1"><span>{label}</span><span>{s.by_status[k]}</span></div>
                <div className="adm-bar"><span style={{ width: `${(s.by_status[k] / max) * 100}%`, background: statusMeta(k).color }} /></div>
              </Link>
            ))}
            {!s.shipments && <p className="text-muted small mb-0">Nothing yet.</p>}
          </div>
          <div className="adm-card">
            <h5 className="mb-3">Inbox</h5>
            <Link to="/admin/quotes" className="d-flex justify-content-between text-decoration-none text-dark py-2 border-bottom"><span><i className="bi bi-calculator me-2" />New quote requests</span><b>{s.new_quotes}</b></Link>
            <Link to="/admin/messages" className="d-flex justify-content-between text-decoration-none text-dark py-2"><span><i className="bi bi-envelope me-2" />Unread messages</span><b>{s.unread_messages}</b></Link>
          </div>
        </div>
      </div>
    </>
  );
}
