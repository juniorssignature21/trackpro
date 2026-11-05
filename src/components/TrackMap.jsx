import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

const VEHICLE_ICON = { truck: 'bi-truck', van: 'bi-truck-front', bike: 'bi-bicycle', plane: 'bi-airplane-fill', ship: 'bi-water' };

const pin = (cls, icon) => L.divIcon({ className: '', html: `<div class="tp-pin ${cls}"><i class="bi ${icon}"></i></div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
const vehicleIcon = v => L.divIcon({ className: '', html: `<div class="tp-vehicle"><i class="bi ${VEHICLE_ICON[v] || 'bi-truck'}"></i></div>`, iconSize: [52, 52], iconAnchor: [26, 26] });

const has = p => p && p.lat != null && p.lng != null;
const ll = p => [p.lat, p.lng];

/** Live tracking map. `data` is the public tracking payload. Ref exposes focus(lat, lng). */
const TrackMap = forwardRef(function TrackMap({ data, onReady }, ref) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layers = useRef({});
  const fitted = useRef(false);
  const anim = useRef(null);

  useImperativeHandle(ref, () => ({
    focus(lat, lng) { mapRef.current?.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 11), { duration: 0.8 }); },
    invalidate() { mapRef.current?.invalidateSize(); },
  }));

  // create the map once
  useEffect(() => {
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true }).setView([51.5, -0.12], 6);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.getContainer().classList.add('tp-map-muted');
    L.tileLayer(TILES.url, { maxZoom: TILES.maxZoom, attribution: TILES.attribution }).addTo(map);
    mapRef.current = map;
    onReady?.();
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(anim.current); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw / update layers whenever tracking data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;
    const Lr = layers.current;

    // journey path: origin -> each event with coordinates (chronological) -> current position
    const chrono = [...data.events].reverse().filter(has);
    const path = [];
    if (has(data.origin)) path.push(ll(data.origin));
    chrono.forEach(e => path.push(ll(e)));
    const current = has(data.current) ? ll(data.current) : path[path.length - 1];
    if (current) path.push(current);
    const dedup = path.filter((p, i) => i === 0 || p[0] !== path[i - 1][0] || p[1] !== path[i - 1][1]);

    const delivered = data.status === 'delivered';

    // origin & destination pins
    const setPin = (key, point, cls, icon, title) => {
      if (!has(point)) { Lr[key]?.remove(); delete Lr[key]; return; }
      if (!Lr[key]) Lr[key] = L.marker(ll(point), { icon: pin(cls, icon), keyboard: false }).addTo(map);
      Lr[key].setLatLng(ll(point)).bindTooltip(title, { direction: 'top', offset: [0, -18] });
    };
    setPin('origin', data.origin, '', 'bi-box-seam', `From: ${data.origin.label}`);
    setPin('dest', data.destination, 'dest', 'bi-geo-alt-fill', `To: ${data.destination.label}`);

    // travelled (solid) and remaining (dashed) lines
    Lr.done?.remove();
    Lr.done = dedup.length > 1 ? L.polyline(dedup, { color: '#1d1d1f', weight: 5, opacity: 0.85, lineCap: 'round' }).addTo(map) : null;
    Lr.todo?.remove();
    Lr.todo = current && has(data.destination) && !delivered
      ? L.polyline([current, ll(data.destination)], { color: '#1d1d1f', weight: 3, opacity: 0.55, dashArray: '2 10', lineCap: 'round' }).addTo(map)
      : null;

    // event dots
    Lr.dots?.remove();
    Lr.dots = L.layerGroup(chrono.slice(0, -1).map(e => L.circleMarker(ll(e), {
      radius: 5, color: '#1d1d1f', weight: 2, fillColor: '#FFCC00', fillOpacity: 1,
    }).bindTooltip(`${e.title}${e.location ? ' · ' + e.location : ''}`))).addTo(map);

    // vehicle marker – animate to its new position
    if (current) {
      if (!Lr.vehicle) {
        Lr.vehicle = L.marker(current, { icon: vehicleIcon(data.vehicle), zIndexOffset: 1000, keyboard: false }).addTo(map);
        Lr.vehicleType = data.vehicle;
      } else {
        if (Lr.vehicleType !== data.vehicle) { Lr.vehicle.setIcon(vehicleIcon(data.vehicle)); Lr.vehicleType = data.vehicle; }
        const from = Lr.vehicle.getLatLng(), to = L.latLng(current);
        if (!from.equals(to)) {
          cancelAnimationFrame(anim.current);
          const t0 = performance.now(), dur = 1600;
          const step = now => {
            const p = Math.min((now - t0) / dur, 1), e = 1 - (1 - p) ** 3;
            Lr.vehicle.setLatLng([from.lat + (to.lat - from.lat) * e, from.lng + (to.lng - from.lng) * e]);
            if (p < 1) anim.current = requestAnimationFrame(step);
          };
          anim.current = requestAnimationFrame(step);
          if (!map.getBounds().contains(to)) map.panTo(to);
        }
      }
      Lr.vehicle.bindTooltip(data.current.label || 'Current location', { direction: 'top', offset: [0, -24] });
    }

    // first load: fit everything in view
    if (!fitted.current) {
      const pts = [...dedup];
      if (has(data.destination)) pts.push(ll(data.destination));
      if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 12 });
      else if (pts.length === 1) map.setView(pts[0], 11);
      fitted.current = true;
    }
  }, [data]);

  return <div id="map" ref={elRef} />;
});

export default TrackMap;
