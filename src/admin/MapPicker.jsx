import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const COLORS = { origin: '#1d1d1f', dest: '#FF5A1F', current: '#FFCC00', event: '#1B6CFF' };

/** Geocode a place name with OpenStreetMap Nominatim (light, admin-only use). */
export async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Place search failed');
  const [hit] = await res.json();
  if (!hit) throw new Error(`No place found for “${q}”`);
  return { lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), label: hit.display_name };
}

/**
 * Click the map to set the active point.
 * points: { key: {lat, lng, label} }, targets: [{key, label}], value of active target is set via onPick(key, lat, lng).
 */
export default function MapPicker({ points, targets, onPick, height = 320 }) {
  const el = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const fitCount = useRef(-1);
  const [active, setActive] = useState(targets[0]?.key);
  const activeRef = useRef(active);
  activeRef.current = active;
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    const m = L.map(el.current).setView([51.5, -0.12], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(m);
    m.on('click', e => pickRef.current(activeRef.current, +e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5)));
    map.current = m;
    setTimeout(() => m.invalidateSize(), 100);
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const seen = new Set();
    const pts = [];
    Object.entries(points).forEach(([key, p]) => {
      if (p?.lat == null || p?.lng == null || p.lat === '' || p.lng === '') return;
      const latlng = [+p.lat, +p.lng];
      if (Number.isNaN(latlng[0]) || Number.isNaN(latlng[1])) return;
      seen.add(key); pts.push(latlng);
      const color = COLORS[key] || COLORS.event;
      if (!markers.current[key]) {
        markers.current[key] = L.circleMarker(latlng, { radius: 9, color: '#1d1d1f', weight: 3, fillColor: color, fillOpacity: 1 }).addTo(m);
      }
      markers.current[key].setLatLng(latlng).bindTooltip(p.label || key);
    });
    Object.keys(markers.current).forEach(k => { if (!seen.has(k)) { markers.current[k].remove(); delete markers.current[k]; } });
    // re-fit only when a point appears/disappears, so clicking to adjust a point doesn't jump the view
    if (pts.length !== fitCount.current) {
      if (pts.length > 1) m.fitBounds(pts, { padding: [40, 40], maxZoom: 11 });
      else if (pts.length === 1) m.setView(pts[0], Math.max(m.getZoom(), 8));
      fitCount.current = pts.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);

  return (
    <div>
      {targets.length > 1 && (
        <div className="adm-pick mb-2">
          <small className="text-muted fw-bold me-1 align-self-center">Click map to set:</small>
          {targets.map(t => (
            <button type="button" key={t.key} className={active === t.key ? 'on' : ''} onClick={() => setActive(t.key)}>
              <span className="d-inline-block rounded-circle me-1" style={{ width: 9, height: 9, background: COLORS[t.key] || COLORS.event, border: '1px solid #1d1d1f' }} />{t.label}
            </button>
          ))}
        </div>
      )}
      {targets.length === 1 && <small className="text-muted d-block mb-2"><i className="bi bi-cursor" /> Click the map to set {targets[0].label.toLowerCase()}.</small>}
      <div className="adm-map" style={{ height }}><div ref={el} style={{ height: '100%' }} /></div>
    </div>
  );
}
