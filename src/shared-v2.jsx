/* Shared v2 - trustworthy components */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from './i18n';
import { useActions, useUser } from './store';

const fmtIDR = (n) => 'Rp\u00A0' + n.toLocaleString('id-ID');
const fmtIDRShort = (n) => {
  if (n >= 1e9) return 'Rp\u00A0' + (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + ' M';
  if (n >= 1e6) return 'Rp\u00A0' + (n / 1e6).toFixed(0) + ' jt';
  return 'Rp\u00A0' + n.toLocaleString('id-ID');
};

const Icon2 = ({ name, size = 14, stroke = 1.6 }) => {
  const paths = {
    search: <><circle cx="7" cy="7" r="5"/><path d="m11 11 3 3"/></>,
    pin: <><path d="M8 14s5-4.5 5-9a5 5 0 0 0-10 0c0 4.5 5 9 5 9z"/><circle cx="8" cy="5" r="2"/></>,
    arrow: <><path d="M3 8h10M9 4l4 4-4 4"/></>,
    chevR: <><path d="M6 3l5 5-5 5"/></>,
    chevD: <><path d="M3 6l5 5 5-5"/></>,
    plus: <><path d="M8 3v10M3 8h10"/></>,
    check: <><path d="m3 8 3 3 7-7"/></>,
    doc: <><path d="M4 2h6l2 2v10H4z"/><path d="M10 2v2h2"/></>,
    download: <><path d="M8 2v8m-3-3 3 3 3-3M3 13h10"/></>,
    eye: <><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></>,
    clock: <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></>,
    user: <><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 3-5 6-5s6 2 6 5"/></>,
    bell: <><path d="M4 11V7a4 4 0 1 1 8 0v4l1 2H3z"/><path d="M6 13a2 2 0 0 0 4 0"/></>,
    bookmark: <><path d="M4 2h8v12l-4-3-4 3z"/></>,
    grid: <><rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/></>,
    list: <><path d="M3 4h10M3 8h10M3 12h10"/></>,
    map: <><path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2zM6 2v10M10 4v10"/></>,
    sliders: <><path d="M2 5h8M12 5h2M2 11h2M6 11h8"/><circle cx="11" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/></>,
    shield: <><path d="M8 1 3 3v5c0 4 5 7 5 7s5-3 5-7V3z"/><path d="m6 8 1.5 1.5L11 6"/></>,
    home: <><path d="M2 8 8 2l6 6v6H2z"/><path d="M6 14V9h4v5"/></>,
    land: <><path d="M2 12h12M2 12l3-4 3 2 3-3 3 2v3"/></>,
    building: <><path d="M3 14V4l5-2v12M8 14V6l5 2v6M3 14h10"/></>,
    auction: <><path d="m3 13 6-6M9 3l4 4-2 2-4-4zM2 14h6"/></>,
    lock: <><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M6 7V5a2 2 0 0 1 4 0v2"/></>,
    bank: <><path d="M2 6 8 2l6 4M3 6h10M3 6v7M13 6v7M2 13h12M5 8v3M8 8v3M11 8v3"/></>,
    scale: <><path d="M8 2v12M3 5h10M5 5l-2 4h4zM11 5l-2 4h4z"/></>,
    handshake: <><path d="M2 9l3-3 3 2 3-2 3 3M5 9l3 3 3-3M2 9v3M14 9v3"/></>,
    fingerprint: <><path d="M8 2c3 0 5 2 5 5v3M3 7c0-3 2-5 5-5M5 14c-1-1-2-3-2-5M11 14c1-2 1-4 1-5M8 7v3M5 10c0 2 1 3 1 3"/></>,
    award: <><circle cx="8" cy="6" r="4"/><path d="M5 9l-1 5 4-2 4 2-1-5"/></>,
    chart: <><path d="M2 14V2M14 14H2M5 11V8M8 11V5M11 11V9"/></>,
    refresh: <><path d="M14 6V2M14 6h-4M14 6a6 6 0 0 0-10-2M2 10v4M2 10h4M2 10a6 6 0 0 0 10 2"/></>,
    info: <><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5v.5"/></>,
    phone: <><path d="M3 3h3l1 3-2 1c1 2 3 4 5 5l1-2 3 1v3a1 1 0 0 1-1 1A11 11 0 0 1 2 4a1 1 0 0 1 1-1z"/></>,
    upload: <><path d="M8 11V3M5 6l3-3 3 3M3 13h10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

/* Curated real estate photos hosted on Unsplash. Each kind has multiple options;
   we pick deterministically from the listing id so the same listing always renders
   the same photo. The IDs below are verified, widely-cited stock photos. */
const PROPERTY_PHOTOS = {
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811',  // luxury villa with pool
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',  // modern villa exterior
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',  // bright modern interior
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',  // mediterranean home
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',  // patio + pool
  ],
  property: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994',  // suburban home
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be',  // white modern home
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233',  // residential building
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',  // home exterior
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09',  // colonial home
  ],
  land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef',  // golden field
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',  // mountain landscape
    'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',  // rolling hills
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',  // rural land
    'https://images.unsplash.com/photo-1505852903341-c8a035fc4ec3',  // open countryside
  ],
  commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',  // office building
    'https://images.unsplash.com/photo-1497366216548-37526070297c',  // corporate office
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',  // modern interior
    'https://images.unsplash.com/photo-1577760258779-e787a1733016',  // skyscraper
    'https://images.unsplash.com/photo-1486325212027-8081e485255e',  // tower at dusk
  ],
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',     // apartment interior
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',  // bright apartment
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',  // modern apartment
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6',     // condo interior
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb',  // bedroom
  ],
};

const hashSeed = (s) => {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const pickPhoto = (kind, seed) => {
  const arr = PROPERTY_PHOTOS[kind] || PROPERTY_PHOTOS.property;
  return arr[hashSeed(seed) % arr.length];
};

/** Returns up to `count` unique photo URLs for a listing, ordered by relevance:
 *  the listing's own kind first, then a deterministic shuffle of the rest. */
const getListingPhotos = (listing, count = 24, w = 1800) => {
  const kind = listing?.type || 'property';
  const own = PROPERTY_PHOTOS[kind] || PROPERTY_PHOTOS.property;
  const others = Object.entries(PROPERTY_PHOTOS)
    .filter(([k]) => k !== kind)
    .flatMap(([, arr]) => arr);
  const all = [...new Set([...own, ...others])];
  const seed = hashSeed(listing?.id || kind);
  const rotated = [...all.slice(seed % all.length), ...all.slice(0, seed % all.length)];
  // If we need more than we have, repeat the cycle
  const needed = [];
  while (needed.length < count) needed.push(...rotated);
  return needed.slice(0, count).map(url => `${url}?w=${w}&q=85&auto=format&fit=crop`);
};

const Photo2 = ({ kind = 'property', tag, src, seed, w = 1600 }) => {
  // Build candidate URL list: explicit src first (if given), then the rotated photo
  // set for the kind. If a URL fails, we try the next.
  const candidates = React.useMemo(() => {
    const arr = PROPERTY_PHOTOS[kind] || PROPERTY_PHOTOS.property;
    const start = hashSeed(seed || tag || kind) % arr.length;
    const rotated = [...arr.slice(start), ...arr.slice(0, start)];
    const fallbacks = rotated.map(u => `${u}?w=${w}&q=80&auto=format&fit=crop`);
    return src ? [src, ...fallbacks] : fallbacks;
  }, [src, kind, seed, tag, w]);

  const [tryIdx, setTryIdx] = React.useState(0);
  const url = candidates[tryIdx];

  const fallbackBg = {
    property: 'linear-gradient(135deg, #d4c8b3, #e6dac3)',
    villa: 'linear-gradient(135deg, #e8c8b3, #f0d6c0)',
    land: 'linear-gradient(135deg, #c9d7a8, #b8c997)',
    commercial: 'linear-gradient(135deg, #b3c1d7, #98a8c0)',
    apartment: 'linear-gradient(135deg, #b9c8d3, #a8b8c5)',
  }[kind] || 'linear-gradient(135deg, #d4c8b3, #e6dac3)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: fallbackBg }}>
      {url && (
        <img
          key={url}
          src={url}
          alt={tag || kind}
          loading="lazy"
          onError={() => setTryIdx(i => i + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
      {tag && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(250,250,247,0.92)', padding: '4px 10px', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-2)', borderRadius: 1, backdropFilter: 'blur(4px)' }}>{tag}</div>
      )}
    </div>
  );
};

const Countdown2 = ({ endDate, size = 'md', mode = 'full' }) => {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, endDate - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const sizes = { sm: 13, md: 16, lg: 32, xl: 48 };
  const sz = sizes[size];
  const urgent = diff < 3600000;

  if (mode === 'compact') {
    return (
      <span className="as-num" style={{ fontSize: sz, fontWeight: 500, color: urgent ? 'var(--red)' : 'inherit' }}>
        {d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`}
      </span>
    );
  }

  return (
    <div className="as-timer" style={{ fontSize: sz, color: urgent ? 'var(--red)' : 'inherit' }}>
      {d > 0 && <span className="as-timer-grp"><span className="as-timer-num as-num">{pad(d)}</span><span className="as-timer-lbl">d</span></span>}
      <span className="as-timer-grp"><span className="as-timer-num as-num">{pad(h)}</span><span className="as-timer-lbl">h</span></span>
      <span className="as-timer-grp"><span className="as-timer-num as-num">{pad(m)}</span><span className="as-timer-lbl">m</span></span>
      <span className="as-timer-grp"><span className="as-timer-num as-num">{pad(s)}</span><span className="as-timer-lbl">s</span></span>
    </div>
  );
};

const Logo2 = ({ size = 32, dark = false }) => (
  <img
    src={dark ? "/assets/assetra-logo.png" : "/assets/assetra-logo-light.png"}
    alt="Assetra"
    style={{ height: size, width: 'auto', display: 'block', objectFit: 'contain' }}
  />
);

const TrustRibbon = () => {
  const { t } = useT();
  return (
    <div className="as-trust-ribbon">
      <div className="as-trust-ribbon-items">
        <span className="as-trust-ribbon-item">{t('ribbon.licensed')}</span>
        <span className="as-trust-ribbon-item">{t('ribbon.escrow')}</span>
        <span className="as-trust-ribbon-item">{t('ribbon.iso')}</span>
      </div>
      <div className="as-trust-ribbon-items">
        <span className="as-trust-ribbon-item">{t('ribbon.support')}</span>
      </div>
    </div>
  );
};

const LangSwitch = ({ lang, onChange }) => (
  <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 1, overflow: 'hidden', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em' }}>
    <button onClick={() => onChange('en')} style={{ padding: '6px 10px', border: 'none', cursor: 'pointer', background: lang === 'en' ? 'var(--ink)' : 'var(--paper)', color: lang === 'en' ? 'var(--paper)' : 'var(--ink-2)', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 600 }}>EN</button>
    <button onClick={() => onChange('id')} style={{ padding: '6px 10px', border: 'none', cursor: 'pointer', background: lang === 'id' ? 'var(--ink)' : 'var(--paper)', color: lang === 'id' ? 'var(--paper)' : 'var(--ink-2)', fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', fontWeight: 600 }}>ID</button>
  </div>
);

const UserMenu = () => {
  const actions = useActions();
  const navigate = useNavigate();
  const user = useUser();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!user) return null;
  const initials = (user.name || user.email || '?').split(/[\s.@]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');
  const isAdmin = user.role === 'admin';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="as-btn as-btn-ghost" style={{ padding: '6px 10px 6px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {user.picture ? (
          <img src={user.picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: isAdmin ? 'var(--gold)' : 'var(--brand-gradient)', color: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 11 }}>{initials}</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 500 }}>{(user.name || user.email).split(' ')[0]}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', padding: '2px 6px', background: isAdmin ? 'var(--gold)' : 'var(--green)', color: 'var(--paper)', borderRadius: 1 }}>{isAdmin ? 'ADMIN' : 'BIDDER'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 240, background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: '0 12px 32px rgba(11,27,46,0.12)', zIndex: 1000 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user.name || user.email.split('@')[0]}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{user.email}</div>
          </div>
          {isAdmin ? (
            <button onClick={() => { setOpen(false); navigate('/admin'); }} className="as-menu-item">Admin Console</button>
          ) : (
            <>
              <button onClick={() => { setOpen(false); navigate('/account'); }} className="as-menu-item">Akun saya</button>
              <button onClick={() => { setOpen(false); navigate('/account#bids'); }} className="as-menu-item">Tawaran saya</button>
            </>
          )}
          <button onClick={() => { setOpen(false); actions.logout(); navigate('/'); }} className="as-menu-item" style={{ color: 'var(--red)', borderTop: '1px solid var(--line)' }}>Keluar</button>
        </div>
      )}
    </div>
  );
};

const Nav2 = ({ active = 'browse', lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const user = useUser();
  return (
    <nav className="as-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><Logo2 /></Link>
        <div className="as-nav-links">
          <Link to="/" className={`as-nav-link ${active === 'browse' ? 'active' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('nav.browse')}</Link>
          <Link to="/live/AST·2026·0823" className="as-nav-link" style={{ textDecoration: 'none', color: 'inherit' }}>{t('nav.live')}</Link>
          <Link to="/" className="as-nav-link" style={{ textDecoration: 'none', color: 'inherit' }}>{t('nav.how')}</Link>
          <Link to="/" className="as-nav-link" style={{ textDecoration: 'none', color: 'inherit' }}>{t('nav.trust')}</Link>
          {user?.role === 'admin' ? (
            <Link to="/admin" className="as-nav-link" style={{ textDecoration: 'none', color: 'inherit' }}>Admin</Link>
          ) : (
            <Link to="/" className="as-nav-link" style={{ textDecoration: 'none', color: 'inherit' }}>{t('nav.sell')}</Link>
          )}
        </div>
      </div>
      <div className="as-nav-right">
        {onLang && <LangSwitch lang={lang} onChange={onLang} />}
        <span className="as-license-plate"><span className="as-license-plate-num">{t('nav.verified')}</span> ID·A4F2K9</span>
        <button className="as-btn as-btn-ghost" style={{ padding: '8px 10px' }}><Icon2 name="bell" size={15} /></button>
        {user ? (
          <UserMenu />
        ) : (
          <>
            <button className="as-btn as-btn-ghost" onClick={() => navigate('/signin')}>{t('nav.signin')}</button>
            <button className="as-btn as-btn-primary" onClick={() => navigate('/register')}>{t('nav.register')}</button>
          </>
        )}
      </div>
    </nav>
  );
};

const TrustSeal = ({ label = 'KEMENKEU', sub = 'DJKN', mark = 'A' }) => (
  <div className="as-seal">
    <div className="as-seal-inner">
      <div className="as-seal-mono">{mark}</div>
      <div style={{ fontSize: 5, letterSpacing: '0.1em', color: 'var(--gold-2)' }}>{label}</div>
      <div style={{ fontSize: 5, letterSpacing: '0.1em', color: 'var(--gold-2)' }}>{sub}</div>
    </div>
  </div>
);

const LISTINGS_V2 = [
  { id: 'AST·2026·0847', title: 'Beachfront Villa Estate', type: 'villa', typeLabel: 'Residential · Villa', address: 'Jl. Pantai Batu Bolong 12, Canggu, Bali', region: 'Bali', currentBid: 8_750_000_000, startingBid: 7_500_000_000, buyNow: 12_000_000_000, deposit: 875_000_000, bidders: 14, bids: 32, endDate: Date.now() + 1000*60*60*26 + 1000*60*13, status: 'live', photos: 24, verifications: ['SHM','BPN','KEMENKEU'], trustScore: 96 },
  { id: 'AST·2026·0823', title: 'Productive Land Plot', type: 'land', typeLabel: 'Agricultural Land', address: 'Desa Sukamulya, Subang, West Java', region: 'West Java', currentBid: 2_450_000_000, startingBid: 2_000_000_000, buyNow: 3_500_000_000, deposit: 245_000_000, bidders: 8, bids: 17, endDate: Date.now() + 1000*60*60*4 + 1000*60*22, status: 'live', photos: 11, verifications: ['SHM','BPN'], trustScore: 92 },
  { id: 'AST·2026·0801', title: 'Heritage Townhouse', type: 'property', typeLabel: 'Residential', address: 'Jl. Cikini Raya 84, Menteng, Jakarta Pusat', region: 'Jakarta', currentBid: 14_200_000_000, startingBid: 12_000_000_000, buyNow: 18_500_000_000, deposit: 1_420_000_000, bidders: 21, bids: 47, endDate: Date.now() + 1000*60*60*52, status: 'live', photos: 31, verifications: ['SHM','IMB','BPN','KEMENKEU'], trustScore: 98 },
  { id: 'AST·2026·0795', title: 'Office Tower — Floor 14', type: 'commercial', typeLabel: 'Commercial', address: 'Sudirman CBD, Jakarta', region: 'Jakarta', currentBid: 32_000_000_000, startingBid: 28_000_000_000, buyNow: 45_000_000_000, deposit: 3_200_000_000, bidders: 6, bids: 9, endDate: Date.now() + 1000*60*60*96, status: 'soon', photos: 18, verifications: ['HGB','IMB','BPN'], trustScore: 94 },
  { id: 'AST·2026·0772', title: 'Mountain Retreat Compound', type: 'villa', typeLabel: 'Residential · Villa', address: 'Jl. Cikole, Lembang, Bandung Barat', region: 'West Java', currentBid: 6_100_000_000, startingBid: 5_500_000_000, buyNow: 8_900_000_000, deposit: 610_000_000, bidders: 11, bids: 24, endDate: Date.now() + 1000*60*60*12, status: 'live', photos: 28, verifications: ['SHM','BPN'], trustScore: 91 },
  { id: 'AST·2026·0768', title: 'Rice Field Holdings', type: 'land', typeLabel: 'Agricultural Land', address: 'Tegallalang, Gianyar, Bali', region: 'Bali', currentBid: 4_750_000_000, startingBid: 4_200_000_000, buyNow: 6_500_000_000, deposit: 475_000_000, bidders: 9, bids: 19, endDate: Date.now() + 1000*60*60*73, status: 'live', photos: 14, verifications: ['SHM','BPN','KEMENKEU'], trustScore: 95 },
];

export { Icon2, Photo2, Countdown2, Logo2, Nav2, TrustRibbon, TrustSeal, LangSwitch, fmtIDR, fmtIDRShort, LISTINGS_V2, getListingPhotos };
