import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Alert, Spinner } from '../components/Bits';
import { ShipmentTable } from './Dashboard';
import { useTitle } from '../lib/hooks';
import { useSettings } from '../lib/settings';

export default function Shipments() {
  useTitle('Shipments');
  const { statuses } = useSettings();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '', status = params.get('status') || '', page = +params.get('page') || 1;
  const [search, setSearch] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api.shipments({ q, status, page, page_size: 20 }).then(setData).catch(e => setError(e.message));
  }, [q, status, page]);

  // debounce search box -> URL
  useEffect(() => {
    if (search === q) return undefined;
    const t = setTimeout(() => update({ q: search, page: '' }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const update = patch => {
    const next = Object.fromEntries([...params]);
    Object.entries(patch).forEach(([k, v]) => { if (v) next[k] = v; else delete next[k]; });
    setParams(next);
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <>
      <div className="adm-head">
        <h1>Shipments</h1>
        <Link to="/admin/shipments/new" className="btn btn-tp-dark"><i className="bi bi-plus-lg me-1" />New shipment</Link>
      </div>
      <div className="adm-card">
        <div className="row g-2 mb-3">
          <div className="col-md-8"><div className="input-group">
            <span className="input-group-text bg-white" style={{ borderRadius: '12px 0 0 12px', border: '2px solid var(--tp-line)', borderRight: 0 }}><i className="bi bi-search" /></span>
            <input className="form-control" style={{ borderLeft: 0 }} placeholder="Search tracking no., names, cities…" value={search} onChange={e => setSearch(e.target.value)} />
          </div></div>
          <div className="col-md-4">
            <select className="form-select" value={status} onChange={e => update({ status: e.target.value, page: '' })} aria-label="Filter by status">
              <option value="">All statuses</option>
              {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <Alert>{error}</Alert>
        {!data ? <Spinner /> : (
          <>
            <ShipmentTable rows={data.items} />
            <div className="d-flex justify-content-between align-items-center mt-3 small">
              <span className="text-muted">{data.total} shipment{data.total === 1 ? '' : 's'}</span>
              {pages > 1 && (
                <div className="btn-group">
                  <button type="button" className="btn btn-sm btn-outline-dark" disabled={page <= 1} onClick={() => update({ page: page - 1 })}><i className="bi bi-chevron-left" /></button>
                  <span className="btn btn-sm btn-outline-dark disabled">{page} / {pages}</span>
                  <button type="button" className="btn btn-sm btn-outline-dark" disabled={page >= pages} onClick={() => update({ page: page + 1 })}><i className="bi bi-chevron-right" /></button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
