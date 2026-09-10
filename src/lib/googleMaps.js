/* Pemuat Google Maps JavaScript API (dynamic library import).
   Kunci dari VITE_GOOGLE_MAPS_API_KEY; tanpa kunci semua helper mengembalikan
   null sehingga UI menampilkan fallback tanpa peta. */
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const HAS_MAPS_KEY = !!KEY;
let bootPromise = null;

function bootstrap() {
  if (bootPromise) return bootPromise;
  bootPromise = new Promise((resolve, reject) => {
    if (!KEY) return reject(new Error('Google Maps API key belum dikonfigurasi (VITE_GOOGLE_MAPS_API_KEY)'));
    if (window.google?.maps?.importLibrary) return resolve(window.google.maps);
    /* Bootstrap resmi Google: membuat google.maps.importLibrary lalu memuat skrip. */
    const g = { key: KEY, v: 'weekly', language: 'id', region: 'ID' };
    // eslint-disable-next-line
    (function(g){var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})(g);
    window.google.maps.importLibrary('maps').then(() => resolve(window.google.maps)).catch(reject);
  });
  return bootPromise;
}

/** Muat pustaka yang dibutuhkan. Resolve ke namespace google.maps, atau throw. */
export async function loadMaps(libs = ['maps']) {
  const maps = await bootstrap();
  await Promise.all(libs.map(l => maps.importLibrary(l)));
  return maps;
}

/** Geocode alamat → { lat, lng, formatted } atau null. */
export async function geocodeAddress(address) {
  if (!KEY || !address) return null;
  try {
    const maps = await loadMaps(['geocoding']);
    const geocoder = new maps.Geocoder();
    const { results } = await geocoder.geocode({ address, region: 'ID' });
    const r = results?.[0];
    if (!r) return null;
    return { lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), formatted: r.formatted_address };
  } catch {
    return null;
  }
}

export const DEFAULT_CENTER = { lat: -6.2, lng: 106.816666 }; // Jakarta
