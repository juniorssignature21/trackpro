import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import TrackMap from '../components/TrackMap';
import PhotoGallery from '../components/PhotoGallery';
import { TrackForm } from '../components/Bits';
import { api } from '../lib/api';
import { fmtDate, fmtDay, fmtTime, haversineKm, initials, statusMeta, timeAgo, toDate } from '../lib/format';
import { useBodyClass, useInterval, useTitle } from '../lib/hooks';
import { toast } from '../lib/pwa';

const POLL_MS = 15000;

/* ------------------------------------------------------------------ search page */
function SearchHero({ error, initial }) {
  return (
    <section className="track-search-hero">
      <div className="container"><div className="row justify-content-center"><div className="col-lg-8 text-center">
        <span className="eyebrow"><i className="bi bi-broadcast" /> Live tracking</span>
        <h1 className="tp-mega mt-3" style={{ fontSize: 'clamp(3rem,8vw,6rem)' }}><span className="d-block">Where&apos;s my</span><span className="band">parcel?</span></h1>
        {error && (
          <div className="alert alert-danger tp-alert text-start mt-4 mb-0"><i className="bi bi-exclamation-circle-fill me-2" />{error}</div>
        )}
        <TrackForm className="mt-4" initial={initial}>
          {input => (
            <div className="tp-widget p-3 p-md-4 text-start">
              <div className="row g-2">
                <div className="col-md-8"><div className="tp-input-icon"><i className="bi bi-upc-scan" />{input({ className: 'mono', autoFocus: true })}</div></div>
                <div className="col-md-4"><button className="btn btn-tp w-100 h-100">Track now <i className="bi bi-arrow-right" /></button></div>
              </div>
            </div>
          )}
        </TrackForm>
        <p className="mt-3 mb-0 small">Your waybill number has 10 digits and is on your booking confirmation and receipt, e.g. <span className="mono fw-bold">4829137563</span>.</p>
      </div></div></div>
    </section>
  );
}

export function TrackSearch() {
  useTitle();
  const [params] = useSearchParams();
  const legacy = params.get('id'); // old track.php?id=… links
  if (legacy) return <Navigate to={`/track/${encodeURIComponent(legacy.trim())}`} replace />;
  return (
    <>
      <SearchHero />
      <section className="section" style={{ marginTop: -70 }}>
        <div className="container"><div className="row g-4">
          <div className="col-md-4"><div className="tp-card h-100"><i className="bi bi-broadcast-pin fs-1" /><h4 className="mt-2">Live GPS</h4><p className="text-muted mb-0">Positions refresh automatically – no need to reload.</p></div></div>
          <div className="col-md-4"><div className="tp-card h-100"><i className="bi bi-clock-history fs-1" /><h4 className="mt-2">Full history</h4><p className="text-muted mb-0">Every scan and hand-over with time and location.</p></div></div>
          <div className="col-md-4"><div className="tp-card h-100"><i className="bi bi-receipt fs-1" /><h4 className="mt-2">Receipts</h4><p className="text-muted mb-0">Stamped receipts available straight from your tracking page.</p></div></div>
        </div></div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ result page */
const STAGES = [
  { key: 'booked', label: 'Booked', icon: 'bi-receipt', color: '#1d1d1f' },
  { key: 'picked', label: 'Picked up', icon: 'bi-box-arrow-up', color: '#1B6CFF' },
  { key: 'transit', label: 'In transit', icon: 'bi-truck', color: '#d49a00' },
  { key: 'out', label: 'Out for delivery', icon: 'bi-signpost-split', color: '#FF1FBF' },
  { key: 'done', label: 'Delivered', icon: 'bi-house-check-fill', color: '#00C853' },
];
const STAGE_OF = { pending: 0, picked_up: 1, in_transit: 2, at_hub: 2, customs: 2, on_hold: 2, exception: 2, returned: 2, out_for_delivery: 3, delivered: 4 };

function Stages({ status }) {
  const cur = STAGE_OF[status] ?? 0;
  const delivered = status === 'delivered';
  const problem = status === 'exception' || status === 'returned';
  return (
    <div className="j-stages" role="list" aria-label="Delivery progress">
      {STAGES.map((s, i) => {
        const state = i < cur || (delivered && i === cur) ? 'done' : i === cur ? 'cur' : '';
        const color = problem && i === cur ? '#c01d1d' : s.color;
        return (
          <FragmentStage key={s.key} first={i === 0} on={i <= cur} c1={STAGES[Math.max(i - 1, 0)].color} c2={s.color}>
            <div className={`j-stage ${state}`} style={{ '--c': color }} role="listitem" aria-current={state === 'cur' ? 'step' : undefined}>
              <span className="j-node"><i className={`bi ${problem && i === cur ? 'bi-exclamation-triangle-fill' : s.icon}`} /></span>
              <small>{s.label}</small>
            </div>
          </FragmentStage>
        );
      })}
    </div>
  );
}
function FragmentStage({ first, on, c1, c2, children }) {
  return (
    <>
      {!first && <span className={`j-bar${on ? ' on' : ''}`} style={{ '--c1': c1, '--c2': c2 }} />}
      {children}
    </>
  );
}

function Journey({ data, onFocus }) {
  const [all, setAll] = useState(false);
  const [focused, setFocused] = useState(null);
  const events = data.events; // newest first
  const shown = all ? events : events.slice(0, 5);

  const stats = useMemo(() => {
    const chrono = [...events].reverse();
    let km = 0;
    let prev = data.origin.lat != null ? data.origin : null;
    chrono.forEach(e => { if (e.lat != null) { if (prev) km += haversineKm(prev, e) || 0; prev = e; } });
    const first = toDate(chrono[0]?.occurred_at), last = data.status === 'delivered' ? toDate(events[0]?.occurred_at) : new Date();
    const hours = first ? Math.max((last - first) / 36e5, 0) : 0;
    return {
      km: Math.round(km),
      stops: events.length,
      time: hours >= 48 ? `${Math.round(hours / 24)} days` : `${Math.round(hours)} h`,
      eta: data.status === 'delivered' ? 'Delivered' : data.eta ? fmtDate(data.eta).replace(/ \d{4}$/, '') : '—',
    };
  }, [data, events]);

  // km between each event and the one before it (chronologically)
  const legKm = useMemo(() => {
    const out = {};
    events.forEach((e, i) => {
      const before = events.slice(i + 1).find(x => x.lat != null) || (data.origin.lat != null ? data.origin : null);
      if (e.lat != null && before) {
        const d = haversineKm(before, e);
        if (d >= 1) out[e.id] = Math.round(d);
      }
    });
    return out;
  }, [events, data.origin]);

  let lastDay = '';
  return (
    <div className="sheet-card journey">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Shipment history</h5>
        {data.status !== 'delivered' && <span className="j-live"><span className="live-dot" /> Live</span>}
      </div>
      <Stages status={data.status} />
      <div className="j-stats">
        <div><i className="bi bi-signpost-2" /><b>{stats.km.toLocaleString()} km</b><small>Travelled</small></div>
        <div><i className="bi bi-pin-map" /><b>{stats.stops}</b><small>Scans</small></div>
        <div><i className="bi bi-stopwatch" /><b>{stats.time}</b><small>On the way</small></div>
        <div><i className="bi bi-calendar-check" /><b>{stats.eta}</b><small>ETA</small></div>
      </div>
      {!events.length && <div className="j-empty">No scans yet – check back soon.</div>}
      {shown.map((e, i) => {
        const day = fmtDay(e.occurred_at);
        const showDay = day !== lastDay;
        lastDay = day;
        const m = statusMeta(e.status);
        const next = statusMeta(shown[i + 1]?.status || e.status);
        const now = i === 0;
        const clickable = e.lat != null;
        const focus = () => { if (!clickable) return; setFocused(e.id); onFocus(e.lat, e.lng); };
        return (
          <div key={e.id}>
            {showDay && <div className="j-day">{day}</div>}
            <div className={`j-row${now ? ' now' : ''}${i === shown.length - 1 ? ' last' : ''}${focused === e.id ? ' focus' : ''}`}
              style={{ '--c': m.color, '--c2': next.color }} data-ll={clickable ? `${e.lat},${e.lng}` : undefined}
              onClick={focus} onKeyDown={ev => (ev.key === 'Enter' || ev.key === ' ') && focus()}
              role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}>
              <div className="j-rail"><span className="j-ic"><i className={`bi ${m.icon}`} /></span></div>
              <div className="j-body">
                <div className="j-top"><b>{e.title}</b><span className="j-time">{fmtTime(e.occurred_at)}</span></div>
                {e.location && <div className="j-loc"><i className="bi bi-geo-alt-fill" /> {e.location}</div>}
                {e.note && <div className="j-note">{e.note}</div>}
                <div className="j-chips">
                  {now && <span className="j-latest"><span className="live-dot" /> Latest</span>}
                  {legKm[e.id] && <span className="j-km"><i className="bi bi-arrow-up-right" /> {legKm[e.id].toLocaleString()} km</span>}
                  {clickable && <span className="j-map"><i className="bi bi-map" /> View on map</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {events.length > 5 && (
        <button type="button" className="j-more" onClick={() => setAll(!all)}>
          {all ? 'Show less' : `Show all ${events.length} updates`} <i className={`bi bi-chevron-${all ? 'up' : 'down'}`} />
        </button>
      )}
    </div>
  );
}

function LocationCard({ data }) {
  const m = statusMeta(data.status);
  const offset = 170 - (170 * Math.min(Math.max(data.progress, 0), 100)) / 100;
  const [, tick] = useState(0);
  useInterval(() => tick(t => t + 1), 30000); // keep "x min ago" fresh
  return (
    <div className="sheet-card dark loc-card">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div className="min-w-0">
          <span className="loc-status" style={{ '--c': m.color }}><i className={`bi ${m.icon}`} /> {data.status_label}</span>
          <div className="small opacity-75 mt-3">Current location</div>
          <div className="fs-5 fw-bold lh-sm">{data.current.label || data.origin.label || '—'}</div>
          <small className="opacity-75">Updated {timeAgo(data.updated_at)}</small>
        </div>
        <div className="loc-ring" aria-label={`${data.progress}% of the way`}>
          <svg viewBox="0 0 64 64"><circle className="bg" cx="32" cy="32" r="27" /><circle className="fg" cx="32" cy="32" r="27" style={{ strokeDashoffset: offset }} /></svg>
          <b>{data.progress}%</b>
        </div>
      </div>
      <div className="loc-foot">
        <div><small>{data.status === 'delivered' ? 'Delivered' : 'Est. delivery'}</small><b>{data.status === 'delivered' ? fmtDate(data.events[0]?.occurred_at) : fmtDate(data.eta)}</b></div>
        <div><small>Service</small><b>{data.service_type}{data.international ? ' · Intl' : ''}</b></div>
        <div><small>Weight</small><b>{data.weight_kg} kg{data.pieces > 1 ? ` · ${data.pieces} pcs` : ''}</b></div>
      </div>
    </div>
  );
}

export function TrackResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const mapRef = useRef(null);
  useTitle(data ? `Tracking ${data.tracking_number}` : 'Tracking');
  useBodyClass(data ? 'track-mode' : null);

  const load = useCallback(async (initial = false) => {
    try {
      const d = await api.track(id);
      setData(d); setError(''); setStale(false);
    } catch (err) {
      if (initial || err.status === 404) { setData(null); setError(err.message); } else setStale(true);
    }
  }, [id]);

  useEffect(() => { setData(null); setError(''); load(true); }, [load]);
  useInterval(() => { if (data && data.status !== 'delivered') load(); }, data ? POLL_MS : null);

  if (error) return <SearchHero error={error} initial={id} />;
  if (!data) return <div className="track-search-hero text-center"><div className="spinner-border" role="status" /><p className="mt-3 fw-bold">Finding your parcel…</p></div>;

  const copy = () => {
    navigator.clipboard?.writeText(data.tracking_number).then(() => toast('Tracking number copied')).catch(() => {});
  };
  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `Parcel ${data.tracking_number}`, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => toast('Tracking link copied')).catch(() => {});
  };

  return (
    <div className="track-layout">
      <div className="track-map-wrap">
        <TrackMap ref={mapRef} data={data} />
        <div className="map-float">
          <Link to="/track" className="glass round-btn text-dark" aria-label="Track another parcel"><i className="bi bi-arrow-left" /></Link>
          <span className="glass live-pill">
            {data.status === 'delivered'
              ? <><i className="bi bi-check-circle-fill text-success" /> Delivered</>
              : <><span className="live-dot" /> {stale ? 'Reconnecting…' : 'Live'}</>}
            <span className="mono d-none d-sm-inline opacity-75">· {data.tracking_number}</span>
          </span>
          <button type="button" className="glass round-btn ms-auto" onClick={share} aria-label="Share tracking link"><i className="bi bi-share" /></button>
        </div>
      </div>

      <aside className="track-panel">
        <span className="sheet-handle" />
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
          <div className="min-w-0">
            <small className="text-muted">Tracking number</small>
            <div className="d-flex align-items-center gap-2">
              <h4 className="mono fw-bold mb-0 text-truncate">{data.tracking_number}</h4>
              <button type="button" className="btn btn-sm btn-light rounded-pill" onClick={copy} aria-label="Copy tracking number"><i className="bi bi-copy" /></button>
            </div>
          </div>
          <span className={`tp-badge ${statusMeta(data.status).cls}`}>{data.status_label}</span>
        </div>

        {data.notice && (
          <div className="sheet-card notice-card d-flex gap-3 align-items-start">
            <span className="notice-ic"><i className="bi bi-megaphone-fill" /></span>
            <div className="small fw-semibold">{data.notice}</div>
          </div>
        )}

        <LocationCard data={data} />

        {data.photos.length > 0 && <PhotoGallery photos={data.photos} />}

        <div className="sheet-card">
          <div className="party">
            <span className="ic"><i className="bi bi-box-arrow-up-right" /></span>
            <div className="min-w-0"><small className="text-muted">From</small><div className="fw-bold">{data.sender_name || '—'}</div><small>{data.origin.label}</small></div>
          </div>
          <div className="my-1" style={{ height: 18, marginLeft: 20, borderLeft: '2px dashed #cfcfcf' }} />
          <div className="party">
            <span className="ic" style={{ background: 'var(--tp-orange)' }}><i className="bi bi-geo-alt-fill" /></span>
            <div className="min-w-0"><small className="text-muted">To</small><div className="fw-bold">{data.receiver_name || '—'}</div><small>{data.destination.label}</small></div>
          </div>
          {data.contents && <div className="mt-3 pt-3 border-top small"><i className="bi bi-box-seam me-1" /> <b>Contents:</b> {data.contents}</div>}
        </div>

        {data.courier_name && (
          <div className="courier-bar mb-3">
            <span className="av">{initials(data.courier_name)}</span>
            <div className="flex-grow-1 min-w-0 lh-sm"><small className="opacity-75">Your courier</small><div className="fw-bold text-truncate">{data.courier_name}</div></div>
            {data.courier_contact && data.courier_phone ? (
              <>
                <a href={`sms:${data.courier_phone}`} className="round-btn white" aria-label="Message courier"><i className="bi bi-chat-dots-fill" /></a>
                <a href={`tel:${data.courier_phone}`} className="round-btn orange" aria-label="Call courier"><i className="bi bi-telephone-fill" /></a>
              </>
            ) : <small className="opacity-75 text-end" style={{ maxWidth: 120 }}>Call &amp; chat on Express</small>}
          </div>
        )}

        <Journey data={data} onFocus={(lat, lng) => mapRef.current?.focus(lat, lng)} />

        {data.receipts.length > 0 && (
          <div className="sheet-card">
            <h6 className="fw-bold mb-3"><i className="bi bi-receipt me-2" />Receipts</h6>
            <div className="d-grid gap-2">
              {data.receipts.map(r => (
                <Link key={r} to={`/receipt?r=${encodeURIComponent(r)}`} className="btn btn-light text-start d-flex justify-content-between align-items-center rounded-4">
                  <span className="mono fw-bold">{r}</span><i className="bi bi-arrow-right" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="sheet-card">
          <h6 className="fw-bold">Track another parcel</h6>
          <TrackForm>
            {input => (
              <div className="d-flex gap-2">
                {input({ className: 'mono' })}
                <button className="btn btn-tp px-3" aria-label="Track"><i className="bi bi-arrow-right" /></button>
              </div>
            )}
          </TrackForm>
          <small className="d-block mt-3 text-muted">Problem with this delivery? <Link to={`/contact?subject=${encodeURIComponent('Parcel ' + data.tracking_number)}`}>Contact support</Link></small>
        </div>
      </aside>
    </div>
  );
}
