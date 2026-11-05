import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Alert, Spinner } from '../components/Bits';
import { useTitle } from '../lib/hooks';
import { useSettings } from '../lib/settings';
import { toast } from '../lib/pwa';
import MapPicker, { geocode } from './MapPicker';
import { StatusBadge } from './Dashboard';
import { EventsPanel, PaymentsPanel, PhotosPanel } from './ShipmentPanels';

const DEFAULTS = {
  tracking_number: '', status: 'pending', service_type: 'Standard', international: false,
  sender_name: '', sender_phone: '', sender_email: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_email: '', receiver_address: '',
  origin: '', origin_lat: '', origin_lng: '', destination: '', dest_lat: '', dest_lng: '',
  current_location: '', current_lat: '', current_lng: '', progress: 0,
  contents: '', weight_kg: 1, length_cm: 0, width_cm: 0, height_cm: 0, pieces: 1, declared_value: 0,
  courier_name: '', courier_phone: '', vehicle: 'truck', notice: '', eta: '', shipped_at: new Date().toISOString().slice(0, 10),
};
const NUM = ['progress', 'weight_kg', 'length_cm', 'width_cm', 'height_cm', 'pieces', 'declared_value'];
const COORD = ['origin_lat', 'origin_lng', 'dest_lat', 'dest_lng', 'current_lat', 'current_lng'];

function toForm(sh) {
  const f = { ...DEFAULTS };
  Object.keys(DEFAULTS).forEach(k => { if (sh[k] !== undefined && sh[k] !== null) f[k] = sh[k]; });
  return f;
}
function toPayload(f, isNew) {
  const out = { ...f };
  COORD.forEach(k => { out[k] = out[k] === '' || out[k] === null ? null : +out[k]; });
  NUM.forEach(k => { out[k] = +out[k] || 0; });
  out.pieces = Math.max(1, out.pieces);
  out.eta = out.eta || null;
  out.shipped_at = out.shipped_at || null;
  if (!isNew) delete out.tracking_number;
  else if (!out.tracking_number.trim()) delete out.tracking_number;
  return out;
}

const Field = ({ label, children, col = 'col-md-6', hint }) => (
  <div className={col}><label className="form-label">{label}</label>{children}{hint && <small className="text-muted d-block mt-1">{hint}</small>}</div>
);

function PlaceInput({ f, set, setMany, name, latKey, lngKey, placeholder }) {
  const [busy, setBusy] = useState(false);
  const find = async () => {
    if (!f[name].trim()) return;
    setBusy(true);
    try {
      const g = await geocode(f[name]);
      setMany({ [latKey]: g.lat, [lngKey]: g.lng });
    } catch (e) { toast(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <div className="input-group">
        <input className="form-control" value={f[name]} onChange={set(name)} placeholder={placeholder} style={{ borderRadius: '12px 0 0 12px' }} />
        <button type="button" className="btn btn-outline-dark" onClick={find} disabled={busy} title="Look up coordinates" style={{ borderRadius: '0 12px 12px 0' }}>
          {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
        </button>
      </div>
      <div className="d-flex gap-2 mt-2">
        <input className="form-control form-control-sm" type="number" step="any" placeholder="Lat" value={f[latKey] ?? ''} onChange={set(latKey)} aria-label={`${name} latitude`} />
        <input className="form-control form-control-sm" type="number" step="any" placeholder="Lng" value={f[lngKey] ?? ''} onChange={set(lngKey)} aria-label={`${name} longitude`} />
      </div>
    </>
  );
}

function DetailsForm({ shipment, onSaved }) {
  const isNew = !shipment;
  const { statuses, service_types: services } = useSettings();
  const navigate = useNavigate();
  const [f, setF] = useState(() => (shipment ? toForm(shipment) : { ...DEFAULTS }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (shipment) setF(toForm(shipment)); }, [shipment]);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setMany = patch => setF(p => ({ ...p, ...patch }));
  const pick = (key, lat, lng) => {
    const map = { origin: ['origin_lat', 'origin_lng'], dest: ['dest_lat', 'dest_lng'], current: ['current_lat', 'current_lng'] }[key];
    setMany({ [map[0]]: lat, [map[1]]: lng });
  };

  const save = async e => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = toPayload(f, isNew);
      if (isNew) {
        const sh = await api.createShipment(payload);
        toast(`Shipment ${sh.tracking_number} created`);
        navigate(`/admin/shipments/${sh.id}`, { replace: true });
      } else {
        onSaved(await api.updateShipment(shipment.id, payload));
        toast('Changes saved');
      }
    } catch (err) { setError(err.message); window.scrollTo({ top: 0, behavior: 'smooth' }); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save}>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <div className="adm-card">
        <h5 className="mb-3">Status &amp; service</h5>
        <div className="row g-3">
          {isNew && <Field label="Tracking number" col="col-md-4" hint="Leave blank to generate one"><input className="form-control mono" value={f.tracking_number} onChange={set('tracking_number')} placeholder="Auto" /></Field>}
          <Field label="Status" col="col-md-4" hint={isNew ? undefined : 'Tip: log scans under “Tracking updates” to keep history.'}>
            <select className="form-select" value={f.status} onChange={set('status')}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </Field>
          <Field label="Service" col="col-md-4">
            <select className="form-select" value={f.service_type} onChange={set('service_type')}>{services.map(s => <option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Shipped on" col="col-md-4"><input type="date" className="form-control" value={f.shipped_at || ''} onChange={set('shipped_at')} /></Field>
          <Field label="Estimated delivery" col="col-md-4"><input type="date" className="form-control" value={f.eta || ''} onChange={set('eta')} /></Field>
          <Field label={`Progress shown to customer: ${f.progress}%`} col="col-md-4">
            <input type="range" className="form-range mt-2" min="0" max="100" step="1" value={f.progress} onChange={set('progress')} />
          </Field>
          <div className="col-12"><div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="intl" checked={f.international} onChange={set('international')} />
            <label className="form-check-label fw-bold" htmlFor="intl">International shipment</label>
          </div></div>
        </div>
      </div>

      <div className="adm-card">
        <h5 className="mb-3">Route &amp; live position</h5>
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="mb-3"><label className="form-label">Origin</label><PlaceInput {...{ f, set, setMany }} name="origin" latKey="origin_lat" lngKey="origin_lng" placeholder="e.g. London, UK" /></div>
            <div className="mb-3"><label className="form-label">Destination</label><PlaceInput {...{ f, set, setMany }} name="destination" latKey="dest_lat" lngKey="dest_lng" placeholder="e.g. Manchester, UK" /></div>
            <div><label className="form-label">Current location</label><PlaceInput {...{ f, set, setMany }} name="current_location" latKey="current_lat" lngKey="current_lng" placeholder="Where the parcel is now" /></div>
          </div>
          <div className="col-lg-7">
            <MapPicker height={380} onPick={pick}
              targets={[{ key: 'origin', label: 'Origin' }, { key: 'dest', label: 'Destination' }, { key: 'current', label: 'Current' }]}
              points={{
                origin: { lat: f.origin_lat, lng: f.origin_lng, label: f.origin || 'Origin' },
                dest: { lat: f.dest_lat, lng: f.dest_lng, label: f.destination || 'Destination' },
                current: { lat: f.current_lat, lng: f.current_lng, label: f.current_location || 'Current' },
              }} />
          </div>
        </div>
      </div>

      <div className="row g-3">
        {[['sender', 'Sender'], ['receiver', 'Receiver']].map(([p, title]) => (
          <div className="col-lg-6" key={p}><div className="adm-card h-100 mb-0">
            <h5 className="mb-3">{title}</h5>
            <div className="row g-3">
              <Field label="Name"><input className="form-control" value={f[`${p}_name`]} onChange={set(`${p}_name`)} /></Field>
              <Field label="Phone"><input className="form-control" value={f[`${p}_phone`]} onChange={set(`${p}_phone`)} /></Field>
              <Field label="Email" col="col-12"><input type="email" className="form-control" value={f[`${p}_email`]} onChange={set(`${p}_email`)} /></Field>
              <Field label="Address" col="col-12"><textarea rows="2" className="form-control" value={f[`${p}_address`]} onChange={set(`${p}_address`)} /></Field>
            </div>
          </div></div>
        ))}
      </div>

      <div className="adm-card mt-3">
        <h5 className="mb-3">Parcel</h5>
        <div className="row g-3">
          <Field label="Contents" col="col-md-6"><input className="form-control" value={f.contents} onChange={set('contents')} /></Field>
          <Field label="Pieces" col="col-6 col-md-3"><input type="number" min="1" className="form-control" value={f.pieces} onChange={set('pieces')} /></Field>
          <Field label="Declared value" col="col-6 col-md-3"><input type="number" min="0" step="0.01" className="form-control" value={f.declared_value} onChange={set('declared_value')} /></Field>
          {[['weight_kg', 'Weight (kg)', '0.1'], ['length_cm', 'Length (cm)', '1'], ['width_cm', 'Width (cm)', '1'], ['height_cm', 'Height (cm)', '1']].map(([k, l, st]) => (
            <Field key={k} label={l} col="col-6 col-md-3"><input type="number" min="0" step={st} className="form-control" value={f[k]} onChange={set(k)} /></Field>
          ))}
        </div>
      </div>

      <div className="adm-card">
        <h5 className="mb-3">Courier &amp; tracking page</h5>
        <div className="row g-3">
          <Field label="Courier name" col="col-md-4"><input className="form-control" value={f.courier_name} onChange={set('courier_name')} /></Field>
          <Field label="Courier phone" col="col-md-4" hint="Shown to customers on Express & Same Day only"><input className="form-control" value={f.courier_phone} onChange={set('courier_phone')} /></Field>
          <Field label="Vehicle icon" col="col-md-4">
            <select className="form-select" value={f.vehicle} onChange={set('vehicle')}>
              {[['truck', 'Truck'], ['van', 'Van'], ['bike', 'Bike'], ['plane', 'Plane'], ['ship', 'Ship']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Notice banner (optional)" col="col-12"><textarea rows="2" className="form-control" value={f.notice} onChange={set('notice')} placeholder="e.g. Delayed by weather – we're on it." /></Field>
        </div>
      </div>

      <div className="sticky-save d-flex gap-2 justify-content-end">
        <Link to="/admin/shipments" className="btn btn-light">Cancel</Link>
        <button className="btn btn-tp-dark px-4" disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : isNew ? 'Create shipment' : 'Save changes'}</button>
      </div>
    </form>
  );
}

export default function ShipmentEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [sh, setSh] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');
  useTitle(isNew ? 'New shipment' : sh ? sh.tracking_number : 'Shipment');

  useEffect(() => {
    if (isNew) { setSh(null); return; }
    setSh(null); setError('');
    api.shipment(id).then(setSh).catch(e => setError(e.message));
  }, [id, isNew]);

  const remove = async () => {
    if (!window.confirm(`Delete shipment ${sh.tracking_number}? Its tracking history, receipts and photos will be removed. This cannot be undone.`)) return;
    try { await api.deleteShipment(sh.id); toast('Shipment deleted'); navigate('/admin/shipments'); } catch (e) { setError(e.message); }
  };

  if (error && !sh) return <Alert>{error}</Alert>;
  if (!isNew && !sh) return <Spinner />;

  const tabs = [
    ['details', 'Details', 'bi-pencil-square'],
    ['events', `Tracking updates (${sh?.events.length ?? 0})`, 'bi-geo-alt'],
    ['payments', `Receipts (${sh?.payments.length ?? 0})`, 'bi-receipt'],
    ['photos', `Photos (${sh?.photos.length ?? 0})`, 'bi-images'],
  ];

  return (
    <>
      <div className="adm-head">
        <div>
          <Link to="/admin/shipments" className="small text-muted text-decoration-none"><i className="bi bi-arrow-left" /> Shipments</Link>
          <h1 className="d-flex align-items-center gap-3 flex-wrap">{isNew ? 'New shipment' : <span className="mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sh.tracking_number}</span>}
            {!isNew && <StatusBadge status={sh.status} />}</h1>
        </div>
        {!isNew && (
          <div className="d-flex gap-2">
            <a href={`/track/${sh.tracking_number}`} target="_blank" rel="noreferrer" className="btn btn-outline-dark"><i className="bi bi-broadcast me-1" />Live page</a>
            <button type="button" className="btn btn-outline-danger" onClick={remove}><i className="bi bi-trash" /></button>
          </div>
        )}
      </div>
      <Alert onClose={() => setError('')}>{sh && error}</Alert>
      {!isNew && (
        <ul className="nav nav-pills gap-2 mb-3 flex-nowrap overflow-auto">
          {tabs.map(([k, l, i]) => (
            <li className="nav-item" key={k}><button type="button" className={`nav-link text-nowrap${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}><i className={`bi ${i} me-1`} />{l}</button></li>
          ))}
        </ul>
      )}
      {(isNew || tab === 'details') && <DetailsForm shipment={sh} onSaved={setSh} />}
      {!isNew && tab === 'events' && <EventsPanel shipment={sh} onChange={setSh} />}
      {!isNew && tab === 'payments' && <PaymentsPanel shipment={sh} onChange={setSh} />}
      {!isNew && tab === 'photos' && <PhotosPanel shipment={sh} onChange={setSh} />}
    </>
  );
}
