/* Komponen peta Google Maps:
   - MapPicker  : autocomplete alamat + pin yang bisa digeser (form listing)
   - ListingMap : peta lokasi satu listing (halaman detail)
   - ListingsMap: peta banyak listing dengan label harga (halaman pencarian)
   Semua menampilkan fallback rapi bila kunci Maps belum ada atau gagal dimuat. */
import React from 'react';
import { loadMaps, HAS_MAPS_KEY, DEFAULT_CENTER } from '../lib/googleMaps';
import { fmtRp } from './shared';

const Fallback = ({ height, text }) => (
  <div style={{ height, borderRadius: 10, border: '1px dashed var(--line)', background: 'rgba(26,111,168,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{text}</div>
);

/** Hook: buat google.maps.Map di elemen ref. Mengembalikan { map, maps, error }. */
function useMap(ref, opts, deps = []) {
  const [state, setState] = React.useState({ map: null, maps: null, error: null });
  React.useEffect(() => {
    if (!HAS_MAPS_KEY || !ref.current) return;
    let on = true;
    loadMaps(['maps', 'marker']).then(maps => {
      if (!on || !ref.current) return;
      const map = new maps.Map(ref.current, { mapTypeControl: false, streetViewControl: false, fullscreenControl: true, ...opts });
      setState({ map, maps, error: null });
    }).catch(e => on && setState({ map: null, maps: null, error: e.message }));
    return () => { on = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

/* ── MapPicker ─────────────────────────────────────────────── */
export const MapPicker = ({ lang = 'id', address, lat, lng, onChange, disabled }) => {
  const L = (en, id) => (lang === 'id' ? id : en);
  const mapRef = React.useRef(null);
  const acRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const has = lat != null && lng != null;
  const { map, maps, error } = useMap(mapRef, { center: has ? { lat, lng } : DEFAULT_CENTER, zoom: has ? 16 : 11 }, []);
  const [busy, setBusy] = React.useState(false);

  /* Pin yang bisa digeser */
  React.useEffect(() => {
    if (!map || !maps) return;
    if (!markerRef.current) {
      markerRef.current = new maps.Marker({ map, draggable: !disabled, position: has ? { lat, lng } : null });
      markerRef.current.addListener('dragend', () => { const p = markerRef.current.getPosition(); onChange?.({ lat: p.lat(), lng: p.lng() }); });
      map.addListener('click', (e) => { if (disabled) return; markerRef.current.setPosition(e.latLng); onChange?.({ lat: e.latLng.lat(), lng: e.latLng.lng() }); });
    } else if (has) {
      markerRef.current.setPosition({ lat, lng });
    }
  }, [map, maps, lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Autocomplete alamat (Places API New) */
  React.useEffect(() => {
    if (!map || !maps || !acRef.current || disabled) return;
    let el;
    maps.importLibrary('places').then(({ PlaceAutocompleteElement }) => {
      el = new PlaceAutocompleteElement({ includedRegionCodes: ['id'] });
      el.style.width = '100%';
      acRef.current.replaceChildren(el);
      el.addEventListener('gmp-select', async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['location', 'formattedAddress'] });
        if (!place.location) return;
        const pos = { lat: place.location.lat(), lng: place.location.lng() };
        map.setCenter(pos); map.setZoom(17);
        markerRef.current?.setPosition(pos);
        onChange?.({ ...pos, address: place.formattedAddress });
      });
    }).catch(() => {});
    return () => { el?.remove(); };
  }, [map, maps, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const locateFromAddress = async () => {
    if (!address || !maps) return;
    setBusy(true);
    try {
      const { Geocoder } = await maps.importLibrary('geocoding');
      const { results } = await new Geocoder().geocode({ address, region: 'ID' });
      const r = results?.[0];
      if (r) { const pos = { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() }; map.setCenter(pos); map.setZoom(17); markerRef.current?.setPosition(pos); onChange?.(pos); }
    } catch {} finally { setBusy(false); }
  };

  if (!HAS_MAPS_KEY) return <Fallback height={120} text={L('Map is unavailable — Google Maps API key is not configured.', 'Peta tidak tersedia — kunci Google Maps belum dikonfigurasi.')} />;
  return (
    <div>
      {!disabled && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <div ref={acRef} style={{ flex: 1, minWidth: 0 }} />
          <button type="button" className="p-btn p-btn-ghost p-btn-sm" disabled={busy || !address} onClick={locateFromAddress} title={L('Find the address above on the map', 'Cari alamat di atas pada peta')}>{busy ? '…' : L('Locate address', 'Cari alamat')}</button>
        </div>
      )}
      <div ref={mapRef} style={{ height: 240, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#eef1f6' }} />
      {error && <div style={{ fontSize: 11.5, color: 'var(--red, #C14545)', marginTop: 6 }}>{error}</div>}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        {has ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : L('No pin yet — search an address, tap the map, or drag the pin.', 'Belum ada pin — cari alamat, ketuk peta, atau geser pin.')}
      </div>
    </div>
  );
};

/* ── ListingMap (detail) ───────────────────────────────────── */
export const ListingMap = ({ lang = 'id', lat, lng, title, height = 320 }) => {
  const L = (en, id) => (lang === 'id' ? id : en);
  const mapRef = React.useRef(null);
  const has = lat != null && lng != null;
  const { map, maps, error } = useMap(mapRef, { center: has ? { lat, lng } : DEFAULT_CENTER, zoom: 16, gestureHandling: 'cooperative' }, [lat, lng]);
  React.useEffect(() => {
    if (!map || !maps || !has) return;
    const m = new maps.Marker({ map, position: { lat, lng }, title });
    return () => m.setMap(null);
  }, [map, maps, lat, lng]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!has) return <Fallback height={height} text={L('The owner has not pinned this property on the map yet.', 'Pemilik belum menandai lokasi properti ini di peta.')} />;
  if (!HAS_MAPS_KEY) return <Fallback height={height} text={L('Map is unavailable — Google Maps API key is not configured.', 'Peta tidak tersedia — kunci Google Maps belum dikonfigurasi.')} />;
  return (
    <div>
      <div ref={mapRef} style={{ height, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#eef1f6' }} />
      {error && <div style={{ fontSize: 12, color: 'var(--red, #C14545)', marginTop: 6 }}>{error}</div>}
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12.5, color: 'var(--teal)', fontWeight: 600 }}>{L('Open in Google Maps →', 'Buka di Google Maps →')}</a>
    </div>
  );
};

/* ── ListingsMap (search) ──────────────────────────────────── */
export const ListingsMap = ({ lang = 'id', listings, onSelect, height = 420 }) => {
  const L = (en, id) => (lang === 'id' ? id : en);
  const mapRef = React.useRef(null);
  const withPos = listings.filter(l => l.lat != null && l.lng != null);
  const { map, maps, error } = useMap(mapRef, { center: DEFAULT_CENTER, zoom: 11, gestureHandling: 'greedy' }, []);
  React.useEffect(() => {
    if (!map || !maps) return;
    const markers = withPos.map(l => {
      const m = new maps.Marker({ map, position: { lat: l.lat, lng: l.lng }, title: l.title, label: { text: fmtRp(l.price), color: '#0A1640', fontSize: '11px', fontWeight: '700' } });
      m.addListener('click', () => onSelect?.(l));
      return m;
    });
    if (withPos.length) { const b = new maps.LatLngBounds(); withPos.forEach(l => b.extend({ lat: l.lat, lng: l.lng })); map.fitBounds(b, 48); if (withPos.length === 1) map.setZoom(15); }
    return () => markers.forEach(m => m.setMap(null));
  }, [map, maps, listings]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!HAS_MAPS_KEY) return <Fallback height={height} text={L('Map is unavailable — Google Maps API key is not configured.', 'Peta tidak tersedia — kunci Google Maps belum dikonfigurasi.')} />;
  return (
    <div>
      <div ref={mapRef} style={{ height, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', background: '#eef1f6' }} />
      {error && <div style={{ fontSize: 12, color: 'var(--red, #C14545)', marginTop: 6 }}>{error}</div>}
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>{withPos.length} / {listings.length} {L('listings have a map pin', 'listing punya titik di peta')}</div>
    </div>
  );
};
