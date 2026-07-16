/* Portal Admin — multi-persona back office
   Personas:
   1. admin      — full access (all nav)
   2. agent      — offline agent: prospek, pengajuan KPR, laporan AI, agen
   3. owner      — home owner: my listings, bulk upload, AI
*/
import React from 'react';
import { Logo2, Photo2 } from '../shared-v2';
import { PIcon, fmtRp } from './shared';
import { api, resolveFileUrl } from '../api/client';

/* Admin form type → backend {type, mode} */
const TY_MAP = {
  'House · Sale':      { type: 'property',   mode: 'sale' },
  'Apartment · Sale':  { type: 'apartment',  mode: 'sale' },
  'Villa · Sale':      { type: 'villa',      mode: 'sale' },
  'Land · Sale':       { type: 'land',       mode: 'sale' },
  'Commercial · Rent': { type: 'commercial', mode: 'rent' },
  'New · Project':     { type: 'property',   mode: 'new' },
};

/* Sesi admin back-office TERPISAH dari sesi user publik.
   Token demo-admin disimpan di sessionStorage sendiri dan dikirim sebagai
   header Authorization eksplisit — TIDAK pernah menimpa localStorage
   'assetra:token' milik user yang sedang login di situs publik. */
let adminToken = null;
try { adminToken = sessionStorage.getItem('assetra:admin-token') || null; } catch {}
const adminHeaders = () => (adminToken ? { Authorization: `Bearer ${adminToken}` } : {});

export const adminApi = {
  get: (p, opts) => api.get(p, { ...opts, headers: { ...opts?.headers, ...adminHeaders() } }),
  post: (p, b, opts) => api.post(p, b, { ...opts, headers: { ...opts?.headers, ...adminHeaders() } }),
  put: (p, b, opts) => api.put(p, b, { ...opts, headers: { ...opts?.headers, ...adminHeaders() } }),
  del: (p, opts) => api.del(p, { ...opts, headers: { ...opts?.headers, ...adminHeaders() } }),
};

/* Jalankan panggilan admin; saat 401/403 auto-login akun demo admin
   (disimpan terpisah) lalu coba sekali lagi. */
async function apiAdmin(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e && (e.status === 401 || e.status === 403)) {
      const r = await api.post('/api/auth/login', { email: 'admin@assetra.co.id', password: 'admin123' });
      if (r?.token) {
        adminToken = r.token;
        try { sessionStorage.setItem('assetra:admin-token', adminToken); } catch {}
      }
      return await fn();
    }
    throw e;
  }
}

const PortalAdmin = ({ lang, onLang, onNav }) => {
  const id = lang === 'id';
  const L = (en, idt) => (id ? idt : en);
  const [persona, setPersona] = React.useState('admin');

  const PERSONAS = {
    admin:  { name: 'Rina Aditya',    init: 'RA', role: L('Super Admin', 'Super Admin'),    tag: 'ADMIN',  badge: 'var(--gold)' },
    agent:  { name: 'Bagus Santoso',  init: 'BS', role: L('Offline Agent', 'Agen Offline'), tag: 'AGENT',  badge: 'var(--teal)' },
    owner:  { name: 'Siti Rahayu',    init: 'SR', role: L('Home Owner', 'Pemilik Properti'),tag: 'OWNER',  badge: 'var(--green)' },
  };

  const NAV = {
    admin: [
      { id: 'dashboard', label: L('Dashboard', 'Dasbor'), icon: 'dash' },
      { id: 'listings',  label: L('Listings', 'Listing'), icon: 'home', count: 142 },
      { id: 'bulk',      label: L('Bulk Upload', 'Unggah Massal'), icon: 'doc' },
      { id: 'ads',       label: L('Ad Campaigns', 'Kampanye Iklan'), icon: 'megaphone', count: 8 },
      { id: 'leads',     label: L('Leads', 'Prospek'), icon: 'users', count: 47 },
      { id: 'kpr',       label: L('KPR Applications', 'Pengajuan KPR'), icon: 'bank', count: 12 },
      { id: 'ai',        label: L('AI Reports', 'Laporan AI'), icon: 'sparkle' },
      { id: 'agents',    label: L('Agents', 'Agen'), icon: 'users' },
      { id: 'reports',   label: L('Reports', 'Laporan'), icon: 'doc' },
    ],
    agent: [
      { id: 'leads', label: L('Leads', 'Prospek'), icon: 'users', count: 23 },
      { id: 'kpr',   label: L('KPR Applications', 'Pengajuan KPR'), icon: 'bank', count: 6 },
      { id: 'ai',    label: L('AI Reports', 'Laporan AI'), icon: 'sparkle' },
      { id: 'agents',label: L('Agents', 'Agen'), icon: 'users' },
    ],
    owner: [
      { id: 'mylistings', label: L('My Listings', 'Listing Saya'), icon: 'home', count: 4 },
      { id: 'ownerads',   label: L('Ad Performance', 'Performa Iklan'), icon: 'megaphone', count: 2 },
      { id: 'bulk',       label: L('Bulk Upload', 'Unggah Massal'), icon: 'doc' },
      { id: 'ai',         label: L('AI Consultant', 'Konsultan AI'), icon: 'sparkle' },
      { id: 'reports',    label: L('Reports', 'Laporan'), icon: 'doc' },
    ],
  };

  const defaultNav = { admin: 'dashboard', agent: 'leads', owner: 'mylistings' };
  const [nav, setNav] = React.useState(defaultNav.admin);
  const switchPersona = (p) => { setPersona(p); setNav(defaultNav[p]); };

  const cur = PERSONAS[persona];
  const navItems = NAV[persona];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh', fontFamily: 'var(--sans)', background: '#F4F2EC' }}>
      {/* sidebar */}
      <aside style={{ background: 'var(--ink)', color: 'rgba(250,250,247,0.85)', padding: '18px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 18px 18px', borderBottom: '1px solid rgba(250,250,247,0.08)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo2 size={22} dark />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: cur.badge, border: `1px solid ${cur.badge}55`, padding: '2px 6px', marginLeft: 'auto' }}>{cur.tag}</span>
        </div>
        {navItems.map(n => (
          <div key={n.id} onClick={() => setNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px', fontSize: 13, cursor: 'pointer', color: nav === n.id ? '#fff' : 'rgba(250,250,247,0.7)', background: nav === n.id ? 'rgba(250,250,247,0.06)' : 'transparent', borderLeft: nav === n.id ? `2px solid ${cur.badge}` : '2px solid transparent' }}>
            <PIcon name={n.icon} size={16} /><span>{n.label}</span>
            {n.count != null && <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, background: nav === n.id ? cur.badge : 'rgba(250,250,247,0.1)', color: nav === n.id ? 'var(--paper)' : 'rgba(250,250,247,0.7)', padding: '1px 6px', borderRadius: 3 }}>{n.count}</span>}
          </div>
        ))}

        {/* role switcher (demo) */}
        <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid rgba(250,250,247,0.08)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', color: 'rgba(250,250,247,0.4)', marginBottom: 8 }}>{L('VIEW AS PERSONA', 'LIHAT SEBAGAI')}</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {Object.keys(PERSONAS).map(p => (
              <button key={p} onClick={() => switchPersona(p)} style={{ flex: 1, padding: '6px 0', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', borderRadius: 4, cursor: 'pointer', border: '1px solid ' + (persona === p ? PERSONAS[p].badge : 'rgba(250,250,247,0.15)'), background: persona === p ? PERSONAS[p].badge : 'transparent', color: persona === p ? '#fff' : 'rgba(250,250,247,0.6)', fontWeight: 600 }}>{PERSONAS[p].tag}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: cur.badge, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{cur.init}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{cur.name}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(250,250,247,0.5)', letterSpacing: '0.04em' }}>{cur.role.toUpperCase()}</div></div>
          </div>
        </div>
      </aside>

      {/* main */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Assetra {cur.tag} <span style={{ color: 'var(--line)' }}>/</span> <b style={{ color: 'var(--ink)' }}>{navItems.find(n => n.id === nav)?.label}</b></div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => onNav && onNav('home')}><PIcon name="globe" size={14} /> {L('View site', 'Lihat situs')}</button>
          </div>
        </div>

        <div style={{ padding: 28, overflowY: 'auto' }}>
          {nav === 'dashboard' && <AdmDash L={L} />}
          {nav === 'listings' && <AdmListings L={L} scope="all" persona={persona} onGoBulk={() => setNav('bulk')} />}
          {nav === 'mylistings' && <AdmListings L={L} scope="owner" persona={persona} onGoBulk={() => setNav('bulk')} />}
          {nav === 'ownerads' && <AdmOwnerAds L={L} />}
          {nav === 'reports' && <AdmReports L={L} persona={persona} />}
          {nav === 'bulk' && <AdmBulk L={L} />}
          {nav === 'ads' && <AdmAds L={L} />}
          {nav === 'leads' && <AdmLeads L={L} persona={persona} />}
          {nav === 'kpr' && <AdmKpr L={L} />}
          {nav === 'ai' && <AdmAI L={L} persona={persona} />}
          {nav === 'agents' && <AdmAgents L={L} persona={persona} />}
        </div>
      </div>
    </div>
  );
};

/* ── shared bits ── */
const Kpi = ({ label, val, delta, color }) => (
  <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>{val}</div>
    {delta && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: color || 'var(--green)', marginTop: 4 }}>{delta}</div>}
  </div>
);
const PageHead = ({ title, sub, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
    <div><h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 28, margin: 0 }}>{title}</h1>{sub && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}</div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>
);
const Pill = ({ tone, children }) => {
  const map = { live: ['rgba(45,138,111,0.1)', 'var(--green)'], review: ['rgba(176,136,56,0.12)', 'var(--gold-2)'], draft: ['var(--paper-2)', 'var(--muted)'], hot: ['rgba(193,69,69,0.1)', 'var(--red)'], new: ['rgba(26,111,168,0.1)', 'var(--teal)'] };
  const [bg, fg] = map[tone] || map.draft;
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: bg, color: fg }}>{children}</span>;
};
const ICell = () => (
  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
    <button style={{ border: '1px solid var(--line)', background: '#fff', padding: 6, borderRadius: 5, cursor: 'pointer', color: 'var(--ink-2)' }}><PIcon name="eye" size={13} /></button>
    <button style={{ border: '1px solid var(--line)', background: '#fff', padding: 6, borderRadius: 5, cursor: 'pointer', color: 'var(--ink-2)' }}><PIcon name="edit" size={13} /></button>
  </div>
);
const Th = ({ children, right }) => <th style={{ textAlign: right ? 'right' : 'left', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{children}</th>;
const Td = ({ children, right, mono, bold }) => <td style={{ padding: '13px 16px', textAlign: right ? 'right' : 'left', fontFamily: mono ? 'var(--mono)' : 'inherit', fontSize: mono ? 12 : 13, fontWeight: bold ? 600 : 400, color: 'var(--ink-2)' }}>{children}</td>;
const Card = ({ children }) => <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>{children}</div>;

/* ── Dashboard (admin) ── */
const AdmDash = ({ L }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      <Kpi label={L('Ad revenue (MTD)', 'Pendapatan iklan (MTD)')} val="Rp 847 jt" delta="▲ 18.4% MoM" />
      <Kpi label={L('Active listings', 'Listing aktif')} val="142" delta="▲ 8 this week" />
      <Kpi label={L('Sponsored slots', 'Slot sponsor')} val="38" delta="24 advertisers" color="var(--muted)" />
      <Kpi label={L('Ad fill rate', 'Tingkat isi iklan')} val="82%" delta="▲ 6pp" />
    </div>
    <PageHead title={L('Operations overview', 'Ikhtisar operasional')} sub={L('Platform health across listings, ads, leads & financing.', 'Kesehatan platform: listing, iklan, prospek & pembiayaan.')} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Recent activity', 'Aktivitas terbaru')}</div>
        <div style={{ padding: 6 }}>
          {[[L('New lead on Menteng Townhouse', 'Prospek baru Rumah Menteng'), '2m'], [L('KPR application submitted · BCA', 'Pengajuan KPR · BCA'), '14m'], [L('AI report generated · Kuningan office', 'Laporan AI · kantor Kuningan'), '38m'], [L('Featured campaign went live', 'Kampanye unggulan tayang'), '1h'], [L('New owner listing pending review', 'Listing pemilik menunggu tinjauan'), '2h']].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 12px', fontSize: 13, borderBottom: i < 4 ? '1px solid var(--line-2)' : 'none' }}><span>{r[0]}</span><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{r[1]}</span></div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Revenue by channel', 'Pendapatan per channel')}</div>
        <div style={{ padding: 18 }}>
          {[[L('Featured listings', 'Listing unggulan'), 62, 'var(--teal)'], [L('Display ads', 'Iklan display'), 24, 'var(--gold)'], [L('Agent subscriptions', 'Langganan agen'), 10, 'var(--green)'], [L('Sponsored search', 'Sponsor pencarian'), 4, 'var(--ink-3)']].map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}><span>{r[0]}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{r[1]}%</span></div>
              <div style={{ height: 7, background: 'var(--paper-2)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: r[1] + '%', height: '100%', background: r[2] }} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </>
);

/* ── Listings (admin scope=all, owner scope=owner) ── */
const LISTING_TYPES = ['House · Sale', 'Apartment · Sale', 'Villa · Sale', 'Land · Sale', 'Commercial · Rent', 'New · Project'];

const FieldRow = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 13 }}>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
    {children}
  </label>
);
const inputStyle = { width: '100%', height: 42, border: '1px solid var(--line)', borderRadius: 9, padding: '0 12px', fontSize: 13, fontFamily: 'var(--sans)', background: '#fff', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' };

const Modal = ({ title, onClose, children, width = 460 }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,64,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: `min(${width}px, 100%)`, maxHeight: '88vh', overflowY: 'auto', padding: '24px 26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, margin: 0 }}>{title}</h2>
        <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>✕</span>
      </div>
      {children}
    </div>
  </div>
);

const ListingModal = ({ L, mode, initial, lockOwner, onClose, onSave }) => {
  const [f, setF] = React.useState(initial);
  const ro = mode === 'view';
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const valid = f.t.trim().length > 0 && Number(f.price) > 0;
  const title = mode === 'new' ? L('New Listing', 'Listing Baru') : mode === 'edit' ? L('Edit Listing', 'Edit Listing') : L('Listing Detail', 'Detail Listing');
  const photoInput = React.useRef(null);
  const photos = f.photos || [];
  const [dragging, setDragging] = React.useState(false);
  /* flash = short-lived success/error notification after an upload action */
  const [flash, setFlash] = React.useState(null);
  const flashTimer = React.useRef(null);
  const showFlash = (msg, ok = true) => {
    setFlash({ msg, ok });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 3500);
  };
  React.useEffect(() => () => clearTimeout(flashTimer.current), []);
  const addFiles = (files) => {
    const imgs = files.filter(x => x.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(x.name));
    if (!imgs.length) {
      if (files.length) showFlash(L('No valid images — use JPG/PNG', 'Bukan gambar yang valid — gunakan JPG/PNG'), false);
      return;
    }
    const added = imgs.map(x => ({ name: x.name, url: URL.createObjectURL(x), file: x }));
    setF(prev => ({ ...prev, photos: [...(prev.photos || []), ...added].slice(0, 12) }));
    showFlash(L(`${imgs.length} photo${imgs.length > 1 ? 's' : ''} uploaded successfully`, `${imgs.length} foto berhasil diunggah`));
  };
  const addPhotos = (e) => { addFiles(Array.from(e.target.files || [])); e.target.value = ''; };
  const onPhotoDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!ro) addFiles(Array.from(e.dataTransfer?.files || []));
  };
  const removePhoto = (i) => setF(prev => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) }));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,64,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(520px, 100%)', maxHeight: '88vh', overflowY: 'auto', padding: '24px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, margin: 0 }}>{title}</h2>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>✕</span>
        </div>
        <FieldRow label={L('Property title *', 'Judul properti *')}>
          <input style={inputStyle} value={f.t} onChange={set('t')} disabled={ro} placeholder={L('e.g. Modern House Kemang', 'cth. Rumah Modern Kemang')} />
        </FieldRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldRow label={L('Type', 'Tipe')}>
            <select style={inputStyle} value={f.ty} onChange={set('ty')} disabled={ro}>
              {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={L('Price (IDR) *', 'Harga (Rp) *')}>
            <input style={inputStyle} type="number" min="0" value={f.price} onChange={set('price')} disabled={ro} placeholder="8500000000" />
          </FieldRow>
        </div>
        {Number(f.price) > 0 && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)', margin: '-6px 0 12px' }}>= {fmtRp(Number(f.price))}</div>}
        <FieldRow label={L('Address', 'Alamat')}>
          <input style={inputStyle} value={f.addr || ''} onChange={set('addr')} disabled={ro} placeholder={L('e.g. Jl. Kemang Raya No. 8, Jakarta Selatan', 'cth. Jl. Kemang Raya No. 8, Jakarta Selatan')} />
        </FieldRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FieldRow label={L('Bedrooms', 'Kamar tidur')}>
            <input style={inputStyle} type="number" min="0" value={f.beds || ''} onChange={set('beds')} disabled={ro} placeholder="3" />
          </FieldRow>
          <FieldRow label={L('Bathrooms', 'Kamar mandi')}>
            <input style={inputStyle} type="number" min="0" value={f.baths || ''} onChange={set('baths')} disabled={ro} placeholder="2" />
          </FieldRow>
          <FieldRow label={L('Land area (m²)', 'Luas tanah (m²)')}>
            <input style={inputStyle} type="number" min="0" value={f.area || ''} onChange={set('area')} disabled={ro} placeholder="150" />
          </FieldRow>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FieldRow label={L('Building (m²)', 'Luas bangunan (m²)')}>
            <input style={inputStyle} type="number" min="0" value={f.bldArea || ''} onChange={set('bldArea')} disabled={ro} placeholder="120" />
          </FieldRow>
          <FieldRow label={L('Floors', 'Jumlah lantai')}>
            <input style={inputStyle} type="number" min="1" value={f.floors || ''} onChange={set('floors')} disabled={ro} placeholder="2" />
          </FieldRow>
          <FieldRow label={L('Year built', 'Tahun dibangun')}>
            <input style={inputStyle} type="number" min="1900" max="2100" value={f.year || ''} onChange={set('year')} disabled={ro} placeholder="2020" />
          </FieldRow>
        </div>
        <FieldRow label={L('Certificate', 'Sertifikat')}>
          <select style={inputStyle} value={f.cert || ''} onChange={set('cert')} disabled={ro}>
            <option value="">{L('— select —', '— pilih —')}</option>
            {['SHM', 'HGB', 'SHMSRS', 'Girik', 'AJB'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldRow>
        <FieldRow label={L('Overview / description', 'Ikhtisar / deskripsi')}>
          <textarea value={f.desc || ''} onChange={set('desc')} disabled={ro} rows={4}
            placeholder={L('Describe the property: condition, surroundings, selling points…', 'Deskripsikan properti: kondisi, lingkungan sekitar, keunggulan…')}
            style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.55, fontFamily: 'var(--sans)' }} />
        </FieldRow>
        <FieldRow label={L('Facilities (comma-separated)', 'Fasilitas (pisahkan dengan koma)')}>
          <input style={inputStyle} value={f.fac || ''} onChange={set('fac')} disabled={ro}
            placeholder={L('e.g. Swimming pool, Carport ×2, CCTV, Garden', 'cth. Kolam renang, Carport ×2, CCTV, Taman')} />
        </FieldRow>
        <FieldRow label={L('Owner', 'Pemilik')}>
          <input style={inputStyle} value={f.owner} onChange={set('owner')} disabled={ro || lockOwner} />
        </FieldRow>
        <FieldRow label={L('Photos', 'Foto') + (photos.length ? ` (${photos.length}/12)` : '')}>
          <input ref={photoInput} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addPhotos} />
          {flash && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '9px 13px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
              background: flash.ok ? 'rgba(45,138,111,0.1)' : 'rgba(193,69,69,0.08)',
              border: `1px solid ${flash.ok ? 'rgba(45,138,111,0.35)' : 'rgba(193,69,69,0.3)'}`,
              color: flash.ok ? 'var(--green, #2D8A6F)' : 'var(--red, #C14545)',
            }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: flash.ok ? 'var(--green, #2D8A6F)' : 'var(--red, #C14545)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PIcon name={flash.ok ? 'check' : 'x'} size={11} />
              </span>
              {flash.msg}
            </div>
          )}
          <div
            onDragOver={e => { e.preventDefault(); if (!ro) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onPhotoDrop}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: dragging ? 6 : 0, borderRadius: 10, outline: dragging ? '2px dashed var(--teal)' : 'none', background: dragging ? 'rgba(26,111,168,0.06)' : 'transparent', transition: 'background .15s' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', width: 74, height: 74, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {/* mini success icon — confirms this photo uploaded OK */}
                <span title={L('Uploaded', 'Terunggah')} style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: 'var(--green, #2D8A6F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}><PIcon name="check" size={11} /></span>
                {i === 0 && <span style={{ position: 'absolute', left: 4, bottom: 4, fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.06em', background: 'rgba(10,22,64,0.75)', color: '#fff', padding: '2px 5px', borderRadius: 3 }}>{L('COVER', 'SAMPUL')}</span>}
                {!ro && (
                  <span onClick={() => removePhoto(i)} title={L('Remove', 'Hapus')} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(10,22,64,0.75)', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center', cursor: 'pointer' }}>✕</span>
                )}
              </div>
            ))}
            {!ro && photos.length < 12 && (
              <div onClick={() => photoInput.current?.click()} style={{ position: 'relative', width: 74, height: 74, borderRadius: 8, border: '2px dashed var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', color: 'var(--teal)', background: 'rgba(26,111,168,0.04)' }}>
                {/* mini success badge on the upload box once ≥1 photo added */}
                {photos.length > 0 && (
                  <span title={L('Uploaded', 'Terunggah')} style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: 'var(--green, #2D8A6F)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}><PIcon name="check" size={9} />{photos.length}</span>
                )}
                <PIcon name="cam" size={18} />
                <span style={{ fontSize: 9.5, fontWeight: 600 }}>{L('Add', 'Tambah')}</span>
              </div>
            )}
            {ro && photos.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{L('No photos uploaded.', 'Belum ada foto.')}</span>}
          </div>
          {!ro && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{L('JPG / PNG · click "Add" or drag & drop photos here · first = cover · max 12', 'JPG / PNG · klik "Tambah" atau seret & letakkan foto ke sini · pertama = sampul · maks 12')}</div>}
        </FieldRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldRow label="Promo">
            <select style={inputStyle} value={f.promo} onChange={set('promo')} disabled={ro}>
              {['—', 'Featured', 'Sponsored'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Status">
            <select style={inputStyle} value={f.st} onChange={set('st')} disabled={ro}>
              <option value="draft">Draft</option>
              <option value="review">{L('In review', 'Ditinjau')}</option>
              <option value="live">Live</option>
            </select>
          </FieldRow>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="p-btn p-btn-ghost p-btn-sm" onClick={onClose}>{ro ? L('Close', 'Tutup') : L('Cancel', 'Batal')}</button>
          {!ro && (
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!valid} style={!valid ? { opacity: 0.5, cursor: 'default' } : undefined}
              onClick={() => valid && onSave({ ...f, price: Number(f.price) })}>
              <PIcon name="check" size={14} /> {mode === 'new' ? L('Create listing', 'Buat listing') : L('Save changes', 'Simpan perubahan')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdmListings = ({ L, scope, persona, onGoBulk }) => {
  const [items, setItems] = React.useState(() => ([
    { id: 'P-0847', t: 'Menteng Heritage Townhouse', ty: 'House · Sale', price: 14_200_000_000, owner: 'Siti Rahayu', views: '12.4K', leads: 42, promo: 'Sponsored', st: 'live' },
    { id: 'P-0823', t: 'SCBD Sky Apartment 28F', ty: 'Apartment · Sale', price: 5_350_000_000, owner: 'Andi Wijaya', views: '8.1K', leads: 28, promo: 'Featured', st: 'live' },
    { id: 'P-0801', t: 'Canggu Beachfront Villa', ty: 'Villa · Sale', price: 12_000_000_000, owner: 'Putu Surya', views: '18.9K', leads: 61, promo: 'Sponsored', st: 'live' },
    { id: 'P-0795', t: 'Kuningan Office Floor', ty: 'Commercial · Rent', price: 185_000_000, owner: 'Siti Rahayu', views: '3.2K', leads: 9, promo: '—', st: 'review' },
    { id: 'P-0772', t: 'BSD Green Residence', ty: 'New · Project', price: 1_850_000_000, owner: 'Sinar Mas', views: '24.1K', leads: 132, promo: 'Featured', st: 'live' },
    { id: 'P-0768', t: 'Pondok Indah Family Home', ty: 'House · Sale', price: 9_800_000_000, owner: 'Siti Rahayu', views: '6.7K', leads: 18, promo: '—', st: 'draft' },
    { id: 'P-0741', t: 'Sentul Hillside Land', ty: 'Land · Sale', price: 3_400_000_000, owner: 'Siti Rahayu', views: '2.1K', leads: 5, promo: '—', st: 'live' },
  ]));
  const [chip, setChip] = React.useState('all');
  const [modal, setModal] = React.useState(null); // { mode: 'new'|'edit'|'view', id? }
  const [notice, setNotice] = React.useState(null);

  const CHIPS = [
    { k: 'all', label: L('All', 'Semua') },
    { k: 'live', label: L('Live', 'Aktif') },
    { k: 'featured', label: 'Featured' },
    { k: 'review', label: L('Review', 'Tinjauan') },
    { k: 'draft', label: 'Draft' },
  ];
  const scoped = scope === 'owner' ? items.filter(l => l.owner === 'Siti Rahayu') : items;
  const rows = scoped.filter(l =>
    chip === 'all' ? true
    : chip === 'featured' ? (l.promo === 'Featured' || l.promo === 'Sponsored')
    : l.st === chip);

  const kindFor = (ty) => ty.toLowerCase().includes('villa') ? 'villa' : ty.toLowerCase().includes('apart') ? 'apartment' : ty.toLowerCase().includes('commer') ? 'commercial' : ty.toLowerCase().includes('land') ? 'land' : 'property';
  const nextId = () => 'P-' + String(Math.max(...items.map(i => parseInt(i.id.slice(2), 10))) + 1).padStart(4, '0');

  const openNew = () => setModal({ mode: 'new' });
  const openRow = (mode, id) => setModal({ mode, id });
  const current = modal?.id != null ? items.find(l => l.id === modal.id) : null;
  const initialForm = modal?.mode === 'new'
    ? { t: '', ty: LISTING_TYPES[0], price: '', addr: '', beds: '', baths: '', area: '', bldArea: '', floors: '', year: '', cert: '', desc: '', fac: '', owner: scope === 'owner' ? 'Siti Rahayu' : '', promo: '—', st: 'live' }
    : current ? { ...current, price: String(current.price) } : null;

  /* Load marketplace listings from the database so they survive refresh. */
  React.useEffect(() => {
    let on = true;
    api.get('/api/listings?source=portal&perPage=60').then(r => {
      if (!on) return;
      const rows = (r.data || []).map(x => ({
        id: x.id, t: x.title, ty: x.typeLabel || x.type, price: x.price ?? x.currentBid ?? 0,
        addr: x.address || '', beds: x.beds, baths: x.baths, area: x.area,
        bldArea: x.buildingArea, floors: x.floors, year: x.yearBuilt,
        cert: x.certificate || '', desc: x.description || '',
        fac: (x.facilities || []).join(', '),
        owner: x.agentName || '—', views: '0', leads: 0,
        promo: x.promo || '—', st: x.status,
        photos: (x.uploadedPhotos || []).map(u => ({ url: resolveFileUrl(u) })),
        fromDb: true,
      }));
      setItems(q => [...rows, ...q.filter(i => !rows.some(r2 => r2.id === i.id))]);
    }).catch(() => {}); // backend down → demo rows only
    return () => { on = false; };
  }, []);

  const saveModal = async (f) => {
    const nPhoto = f.photos?.length || 0;
    if (modal.mode === 'new') {
      try {
        /* 1. Create the listing in the database */
        const { type, mode } = TY_MAP[f.ty] || TY_MAP['House · Sale'];
        const created = await apiAdmin(() => adminApi.post('/api/listings', {
          title: f.t, type, typeLabel: f.ty, mode,
          price: Number(f.price), address: f.addr || null,
          beds: f.beds ? Number(f.beds) : null,
          baths: f.baths ? Number(f.baths) : null,
          area: f.area ? Number(f.area) : null,
          buildingArea: f.bldArea ? Number(f.bldArea) : null,
          floors: f.floors ? Number(f.floors) : null,
          yearBuilt: f.year ? Number(f.year) : null,
          certificate: f.cert || null,
          description: f.desc || null,
          facilities: (f.fac || '').split(',').map(s => s.trim()).filter(Boolean),
          agentName: f.owner || 'Pemilik', agency: 'Owner Direct',
          promo: f.promo === '—' ? null : f.promo,
          status: f.st, source: 'portal',
        }));
        const dbId = created.data.id;
        /* 2. Upload the photos to the server */
        const files = (f.photos || []).map(p => p.file).filter(Boolean);
        if (files.length) {
          const fd = new FormData();
          files.forEach(x => fd.append('photos', x));
          await apiAdmin(() => adminApi.post(`/api/listings/${encodeURIComponent(dbId)}/photos`, fd));
        }
        setItems(q => [{ id: dbId, ...f, price: Number(f.price), owner: f.owner || '—', views: '0', leads: 0, fromDb: true }, ...q]);
        setNotice(L(
          `Listing "${f.t}" saved to the database (${dbId})${nPhoto ? ` with ${nPhoto} photo${nPhoto > 1 ? 's' : ''}` : ''} — now live on the public site.`,
          `Listing "${f.t}" tersimpan ke database (${dbId})${nPhoto ? ` dengan ${nPhoto} foto` : ''} — sudah tayang di situs publik.`));
      } catch (e) {
        /* Backend unreachable — keep it locally so work isn't lost. */
        const id = nextId();
        setItems(q => [{ id, ...f, price: Number(f.price), owner: f.owner || '—', views: '0', leads: 0 }, ...q]);
        setNotice(L(
          `Saved locally only — backend error: ${e.message}. It will NOT appear on the public site.`,
          `Hanya tersimpan lokal — backend error: ${e.message}. Listing TIDAK tayang di situs publik.`));
      }
    } else {
      setItems(q => q.map(l => l.id === modal.id ? { ...l, ...f } : l));
      if (current?.fromDb) {
        try {
          await apiAdmin(() => adminApi.put(`/api/listings/${encodeURIComponent(modal.id)}`, {
            title: f.t, price: Number(f.price), address: f.addr || null, status: f.st,
            beds: f.beds ? Number(f.beds) : null, baths: f.baths ? Number(f.baths) : null,
            area: f.area ? Number(f.area) : null,
            buildingArea: f.bldArea ? Number(f.bldArea) : null,
            floors: f.floors ? Number(f.floors) : null,
            yearBuilt: f.year ? Number(f.year) : null,
            certificate: f.cert || null, description: f.desc || null,
            facilities: (f.fac || '').split(',').map(s => s.trim()).filter(Boolean),
            agentName: f.owner, promo: f.promo === '—' ? null : f.promo,
          }));
          setNotice(L(`Changes to "${f.t}" saved to the database.`, `Perubahan "${f.t}" tersimpan ke database.`));
        } catch (e) {
          setNotice(L(`Saved locally; database update failed: ${e.message}`, `Tersimpan lokal; update database gagal: ${e.message}`));
        }
      } else {
        setNotice(L(`Changes to "${f.t}" saved successfully.`, `Perubahan "${f.t}" berhasil disimpan.`));
      }
    }
    setModal(null);
  };

  return (
    <>
      {scope === 'owner' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
          <Kpi label={L('My listings', 'Listing saya')} val={String(scoped.length)} delta={L(`${scoped.filter(l => l.st === 'review').length} in review`, `${scoped.filter(l => l.st === 'review').length} ditinjau`)} color="var(--muted)" />
          <Kpi label={L('Total views', 'Total dilihat')} val="24.4K" delta="▲ 9% this week" />
          <Kpi label={L('Leads received', 'Prospek masuk')} val="74" delta="▲ 11 new" />
          <Kpi label={L('Featured active', 'Unggulan aktif')} val="1" delta={L('Upgrade to boost', 'Upgrade untuk boost')} color="var(--gold-2)" />
        </div>
      )}
      <PageHead
        title={scope === 'owner' ? L('My Listings', 'Listing Saya') : L('Listings & Ad Management', 'Manajemen Listing & Iklan')}
        sub={scope === 'owner' ? L('Manage your own properties. Bulk upload to publish many at once.', 'Kelola properti Anda. Unggah massal untuk publikasi sekaligus.') : L('All inventory, sponsored placements, and revenue.', 'Semua inventori, placement sponsor, dan pendapatan.')}
        actions={<>
          <button className="p-btn p-btn-ghost p-btn-sm" onClick={onGoBulk}><PIcon name="doc" size={14} /> {L('Bulk upload', 'Unggah massal')}</button>
          <button className="p-btn p-btn-primary p-btn-sm" onClick={openNew}><PIcon name="plus" size={14} /> {L('New listing', 'Listing baru')}</button>
        </>}
      />
      {notice && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '11px 16px', borderRadius: 10, background: 'rgba(45,138,111,0.08)', border: '1px solid rgba(45,138,111,0.3)', fontSize: 12.5, color: 'var(--ink-2)' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green, #2D8A6F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="check" size={12} /></span>
          <span style={{ flex: 1 }}>{notice}</span>
          <span style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setNotice(null)}>✕</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {CHIPS.map(c => (
          <span key={c.k} className={`p-chip ${chip === c.k ? 'active' : ''}`} onClick={() => setChip(c.k)} style={{ fontSize: 12, padding: '7px 13px', cursor: 'pointer' }}>{c.label}</span>
        ))}
      </div>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}>
            <Th>ID</Th><Th>{L('Property', 'Properti')}</Th><Th>{L('Price', 'Harga')}</Th>
            {scope !== 'owner' && <Th>{L('Owner', 'Pemilik')}</Th>}
            <Th right>Views</Th><Th right>{L('Leads', 'Prospek')}</Th><Th>Promo</Th><Th>Status</Th><Th> </Th>
          </tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid var(--line)' }}>
                <Td mono>{l.id}</Td>
                <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>{l.photos && l.photos.length ? <img src={l.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Photo2 kind={kindFor(l.ty)} seed={l.id} w={100} />}</div><div><div style={{ fontWeight: 600 }}>{l.t}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.ty}</div></div></div></Td>
                <Td mono bold>{fmtRp(l.price)}</Td>
                {scope !== 'owner' && <Td>{l.owner}</Td>}
                <Td right mono>{l.views}</Td>
                <Td right mono bold>{l.leads}</Td>
                <Td>{l.promo === '—' ? <span style={{ color: 'var(--muted)' }}>—</span> : <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 4, background: l.promo === 'Sponsored' ? 'rgba(26,111,168,0.1)' : 'rgba(176,136,56,0.12)', color: l.promo === 'Sponsored' ? 'var(--teal)' : 'var(--gold-2)' }}>{l.promo === 'Sponsored' ? '★ ' : ''}{l.promo}</span>}</Td>
                <Td><Pill tone={l.st}>{l.st === 'live' ? '● Live' : l.st === 'review' ? L('Review', 'Tinjauan') : 'Draft'}</Pill></Td>
                <Td right>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button title={L('View', 'Lihat')} onClick={() => openRow('view', l.id)} style={{ border: '1px solid var(--line)', background: '#fff', padding: 6, borderRadius: 5, cursor: 'pointer', color: 'var(--ink-2)' }}><PIcon name="eye" size={13} /></button>
                    <button title="Edit" onClick={() => openRow('edit', l.id)} style={{ border: '1px solid var(--line)', background: '#fff', padding: 6, borderRadius: 5, cursor: 'pointer', color: 'var(--ink-2)' }}><PIcon name="edit" size={13} /></button>
                  </div>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr style={{ borderTop: '1px solid var(--line)' }}>
                <td colSpan={scope !== 'owner' ? 9 : 8} style={{ padding: '22px 18px', textAlign: 'center', fontSize: 12.5, color: 'var(--muted)' }}>{L('No listings match this filter.', 'Tidak ada listing untuk filter ini.')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {modal && initialForm && (
        <ListingModal L={L} mode={modal.mode} initial={initialForm} lockOwner={scope === 'owner'} onClose={() => setModal(null)} onSave={saveModal} />
      )}
    </>
  );
};

/* ── Bulk upload (owner) ── */

/* Trigger a client-side file download. */
function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const BULK_REQUIRED = ['title', 'type', 'price_idr', 'address'];
const BULK_COLUMNS = [
  'title', 'type', 'price_idr', 'address', 'region', 'land_m2', 'building_m2',
  'bedrooms', 'bathrooms', 'certificate', 'year_built', 'description',
];
const BULK_TYPES = ['rumah', 'apartemen', 'tanah', 'ruko', 'villa', 'gudang', 'kantor'];

const LISTING_TEMPLATE_CSV =
  '\uFEFF' + BULK_COLUMNS.join(',') + '\n' +
  'Rumah Modern Kebayoran Baru,rumah,8500000000,"Jl. Senopati No. 12, Kebayoran Baru","DKI Jakarta",250,320,4,3,SHM,2019,"Rumah 2 lantai, carport 2 mobil, dekat MRT Blok M"\n' +
  'Apartemen Studio Sudirman Park,apartemen,950000000,"Jl. KH Mas Mansyur Kav. 35, Tanah Abang","DKI Jakarta",,28,1,1,SHMSRS,2016,"Full furnished, view kota, akses langsung ke mall"\n' +
  'Kavling Siap Bangun Sentul,tanah,1200000000,"Cluster Mediterania, Sentul City, Bogor","Jawa Barat",300,,,,SHM,,"Kavling hook, kontur datar, bebas banjir"\n';

const photoGuideTxt = (id) => id
  ? `PANDUAN UNGGAH FOTO & DOKUMEN MASSAL — ASSETRA
================================================

1. Kumpulkan semua berkas dalam satu file ZIP (maks 200 MB).
2. Format yang didukung: JPG, PNG (foto) dan PDF (dokumen legal).
3. Penamaan file menentukan pencocokan ke listing:

   <id-listing>_foto_<urutan>.jpg     → foto listing
   <id-listing>_dok_<jenis>.pdf       → dokumen legal

   Contoh:
   AST-2026-0101_foto_01.jpg
   AST-2026-0101_foto_02.jpg
   AST-2026-0101_dok_shm.pdf
   AST-2026-0101_dok_pbb.pdf

4. Jika listing berasal dari CSV yang belum punya ID, gunakan
   nomor baris CSV: BARIS-2_foto_01.jpg (baris 2 = data pertama).
5. Foto pertama (urutan 01) dipakai sebagai foto sampul.
6. Jenis dokumen yang dikenali: shm, hgb, imb, pbg, pbb, ajb.
`
  : `BULK PHOTO & DOCUMENT UPLOAD GUIDE — ASSETRA
=============================================

1. Collect all files in a single ZIP (max 200 MB).
2. Supported formats: JPG, PNG (photos) and PDF (legal documents).
3. File naming controls matching to listings:

   <listing-id>_foto_<order>.jpg     → listing photo
   <listing-id>_dok_<type>.pdf       → legal document

   Examples:
   AST-2026-0101_foto_01.jpg
   AST-2026-0101_foto_02.jpg
   AST-2026-0101_dok_shm.pdf
   AST-2026-0101_dok_pbb.pdf

4. For listings from a CSV without IDs yet, use the CSV row
   number: BARIS-2_foto_01.jpg (row 2 = first data row).
5. The first photo (order 01) is used as the cover photo.
6. Recognized document types: shm, hgb, imb, pbg, pbb, ajb.
`;

/* Minimal CSV parser that understands quoted fields. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', inQ = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(v => v.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(v => v.trim() !== '')) rows.push(row);
  return rows;
}

/* Validate a parsed listings CSV → { rows, errors: [messages] } */
function validateListingsCsv(rows, L) {
  const errors = [];
  if (rows.length < 2) return { rows: 0, errors: [L('File has no data rows', 'File tidak punya baris data')] };
  const header = rows[0].map(h => h.trim().toLowerCase());
  const missing = BULK_REQUIRED.filter(c => !header.includes(c));
  if (missing.length) errors.push(L(`Missing columns: ${missing.join(', ')}`, `Kolom wajib hilang: ${missing.join(', ')}`));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  rows.slice(1).forEach((r, n) => {
    const line = n + 2;
    for (const col of BULK_REQUIRED) {
      if (idx[col] != null && !(r[idx[col]] || '').trim()) {
        errors.push(L(`Row ${line}: "${col}" is empty`, `Baris ${line}: "${col}" kosong`));
      }
    }
    if (idx.price_idr != null && (r[idx.price_idr] || '').trim() && !/^\d+$/.test(r[idx.price_idr].trim())) {
      errors.push(L(`Row ${line}: price_idr must be a plain number`, `Baris ${line}: price_idr harus angka tanpa titik/koma`));
    }
    if (idx.type != null && (r[idx.type] || '').trim() && !BULK_TYPES.includes(r[idx.type].trim().toLowerCase())) {
      errors.push(L(`Row ${line}: unknown type "${r[idx.type]}"`, `Baris ${line}: tipe "${r[idx.type]}" tidak dikenali`));
    }
  });
  return { rows: rows.length - 1, errors };
}

const AdmBulk = ({ L }) => {
  const id = L('x', 'y') === 'y';
  const [queue, setQueue] = React.useState([
    { n: 'menteng-townhouse.csv', rows: 1, st: 'ok', errors: [] },
    { n: 'jakarta-portfolio-12units.xlsx', rows: 12, st: 'ok', errors: [] },
    { n: 'photos-batch-bsd.zip', rows: 48, st: 'processing', errors: [] },
  ]);
  const [notice, setNotice] = React.useState(null);
  const [expanded, setExpanded] = React.useState(null);
  const listingInput = React.useRef(null);
  const zipInput = React.useRef(null);

  const downloadListingTemplate = () =>
    downloadFile('assetra-template-listing.csv', LISTING_TEMPLATE_CSV, 'text/csv;charset=utf-8');
  const downloadPhotoGuide = () =>
    downloadFile(id ? 'assetra-panduan-foto-dokumen.txt' : 'assetra-photo-doc-guide.txt', photoGuideTxt(id), 'text/plain;charset=utf-8');

  /* Accepts File objects from either the picker or drag & drop. */
  const handleListingFiles = (files) => {
    for (const f of files) {
      if (/\.csv$/i.test(f.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          const { rows, errors } = validateListingsCsv(parseCsv(String(reader.result)), L);
          setQueue(q => [...q, { n: f.name, rows, st: errors.length ? 'error' : 'ok', errors }]);
        };
        reader.readAsText(f);
      } else if (/\.(xlsx|xls)$/i.test(f.name)) {
        /* XLSX is parsed server-side after upload — queue it as processing. */
        setQueue(q => [...q, { n: f.name, rows: '—', st: 'processing', errors: [] }]);
      } else {
        setQueue(q => [...q, { n: f.name, rows: '—', st: 'error', errors: [L('Unsupported format — use CSV or XLSX', 'Format tidak didukung — gunakan CSV atau XLSX')] }]);
      }
    }
  };

  const handleZipFiles = (files) => {
    for (const f of files) {
      if (/\.zip$/i.test(f.name)) {
        setQueue(q => [...q, { n: f.name, rows: '—', st: 'processing', errors: [] }]);
      } else {
        setQueue(q => [...q, { n: f.name, rows: '—', st: 'error', errors: [L('Not a ZIP — compress photos/documents into one .zip first', 'Bukan ZIP — kompres foto/dokumen jadi satu file .zip dulu')] }]);
      }
    }
  };

  const queueNotice = (files) => {
    if (!files.length) return;
    setNotice(files.length === 1
      ? L(`"${files[0].name}" uploaded — check its status in the queue below.`, `"${files[0].name}" berhasil diunggah — cek statusnya di antrean bawah.`)
      : L(`${files.length} files uploaded — check their status in the queue below.`, `${files.length} berkas berhasil diunggah — cek statusnya di antrean bawah.`));
  };
  const onListingFile = (e) => { const fs = Array.from(e.target.files || []); handleListingFiles(fs); queueNotice(fs); e.target.value = ''; };
  const onZipFile = (e) => { const fs = Array.from(e.target.files || []); handleZipFiles(fs); queueNotice(fs); e.target.value = ''; };

  /* Drag & drop onto the dashed cards */
  const [dragIdx, setDragIdx] = React.useState(null);
  const onDrop = (i) => (e) => {
    e.preventDefault();
    setDragIdx(null);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    (i === 0 ? handleListingFiles : handleZipFiles)(files);
    queueNotice(files);
  };

  const publishValid = () => {
    const count = queue.filter(f => f.st === 'ok').length;
    if (!count) { setNotice(L('Nothing valid to publish yet.', 'Belum ada berkas valid untuk dipublikasikan.')); return; }
    setQueue(q => q.map(f => f.st === 'ok' ? { ...f, st: 'published' } : f));
    setNotice(L(`${count} file(s) published — listings go live after review.`, `${count} berkas dipublikasikan — listing tayang setelah ditinjau.`));
  };

  const cards = [
    { ic: 'doc', t: L('Listings (CSV / XLSX)', 'Listing (CSV / XLSX)'),
      s: L('Up to 500 rows · required columns: title, type, price_idr, address', 'Maks 500 baris · kolom wajib: title, type, price_idr, address'),
      pick: () => listingInput.current?.click(), tpl: downloadListingTemplate,
      tplLabel: L('Download CSV template', 'Unduh template CSV') },
    { ic: 'cam', t: L('Photos & documents (ZIP)', 'Foto & dokumen (ZIP)'),
      s: L('JPG / PNG / PDF · matched to listings by filename / ID', 'JPG / PNG / PDF · dicocokkan ke listing via nama file / ID'),
      pick: () => zipInput.current?.click(), tpl: downloadPhotoGuide,
      tplLabel: L('Download naming guide', 'Unduh panduan penamaan') },
  ];

  return (
    <>
      <PageHead title={L('Bulk Upload', 'Unggah Massal')} sub={L('Upload many listings & photos at once. They publish to the public site after review.', 'Unggah banyak listing & foto sekaligus. Tayang ke situs publik setelah ditinjau.')} />
      <input ref={listingInput} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={onListingFile} />
      <input ref={zipInput} type="file" accept=".zip" style={{ display: 'none' }} onChange={onZipFile} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
        {cards.map((d, i) => (
          <div key={i}
            onDragOver={e => { e.preventDefault(); setDragIdx(i); }}
            onDragLeave={() => setDragIdx(v => (v === i ? null : v))}
            onDrop={onDrop(i)}
            style={{ border: dragIdx === i ? '2px dashed var(--teal)' : '2px dashed var(--line)', borderRadius: 12, background: dragIdx === i ? 'rgba(26,111,168,0.06)' : '#fff', padding: '28px 24px', textAlign: 'center', transition: 'background .15s, border-color .15s' }}>
            <div style={{ width: 46, height: 46, borderRadius: 11, margin: '0 auto 12px', background: 'rgba(26,111,168,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={d.ic} size={22} /></div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 6 }}>{d.t}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>{d.s}</div>
            <button className="p-btn p-btn-cyan p-btn-sm" onClick={d.pick}><PIcon name="doc" size={14} /> {L('Choose file', 'Pilih file')}</button>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>{L('or drag & drop here', 'atau seret & letakkan file di sini')}</div>
            <div style={{ marginTop: 8 }}>
              <span className="p-link" style={{ fontSize: 11, cursor: 'pointer' }} onClick={d.tpl}>⬇ {d.tplLabel}</span>
            </div>
          </div>
        ))}
      </div>
      {notice && (
        <div style={{ marginBottom: 16, padding: '11px 16px', borderRadius: 10, background: 'rgba(45,138,111,0.08)', border: '1px solid rgba(45,138,111,0.3)', fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green, #2D8A6F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="check" size={12} /></span>
          <span style={{ flex: 1 }}>{notice}</span>
          <span style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setNotice(null)}>✕</span>
        </div>
      )}
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Upload queue', 'Antrean unggahan')}</span>
          <button className="p-btn p-btn-primary p-btn-sm" onClick={publishValid}><PIcon name="check" size={14} /> {L('Publish all valid', 'Publikasikan yang valid')}</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('File', 'Berkas')}</Th><Th right>{L('Records', 'Catatan')}</Th><Th>Status</Th><Th> </Th></tr></thead>
          <tbody>
            {queue.map((f, i) => (
              <React.Fragment key={i}>
                <tr style={{ borderTop: '1px solid var(--line)' }}>
                  <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><PIcon name={/\.zip$/i.test(f.n) ? 'cam' : 'doc'} size={16} /> <span style={{ fontWeight: 600 }}>{f.n}</span></div></Td>
                  <Td right mono>{f.rows}</Td>
                  <Td>
                    {f.st === 'ok' ? <Pill tone="live">✓ {L('Ready', 'Siap')}</Pill>
                      : f.st === 'published' ? <Pill tone="live">✓ {L('Published', 'Terbit')}</Pill>
                      : f.st === 'processing' ? <Pill tone="review">{L('Processing', 'Memproses')}…</Pill>
                      : <Pill tone="hot">✕ {f.errors.length} {L('errors', 'error')}</Pill>}
                  </Td>
                  <Td right>
                    {f.st === 'error' && (
                      <span className="p-link" style={{ fontSize: 11, cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
                        {expanded === i ? L('Hide', 'Tutup') : L('Details', 'Detail')}
                      </span>
                    )}
                    <span style={{ marginLeft: 12, cursor: 'pointer', color: 'var(--muted)', fontSize: 12 }} onClick={() => setQueue(q => q.filter((_, j) => j !== i))} title={L('Remove', 'Hapus')}>✕</span>
                  </Td>
                </tr>
                {expanded === i && f.errors.length > 0 && (
                  <tr style={{ borderTop: '1px solid var(--line)', background: 'rgba(214,69,69,0.04)' }}>
                    <td colSpan={4} style={{ padding: '10px 18px' }}>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--red, #C0392B)', lineHeight: 1.7 }}>
                        {f.errors.slice(0, 8).map((er, j) => <li key={j}>{er}</li>)}
                        {f.errors.length > 8 && <li>{L(`…and ${f.errors.length - 8} more`, `…dan ${f.errors.length - 8} lainnya`)}</li>}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {queue.length === 0 && (
              <tr style={{ borderTop: '1px solid var(--line)' }}>
                <td colSpan={4} style={{ padding: '22px 18px', textAlign: 'center', fontSize: 12.5, color: 'var(--muted)' }}>{L('Queue is empty — upload a file above.', 'Antrean kosong — unggah berkas di atas.')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ── Ad Campaigns (admin) ── */
const AD_TYPES = ['Featured', 'Display CPM', 'Developer', 'Sponsored search'];
/* Penempatan banner di situs publik + ukuran gambar yang disarankan. */
const BANNER_PLACEMENTS = [
  { id: 'home-leaderboard',   nEn: 'Home — Leaderboard',        nId: 'Beranda — Leaderboard',        size: '1400 × 160 px' },
  { id: 'home-box',           nEn: 'Home — Side Box',           nId: 'Beranda — Kotak Samping',      size: '720 × 760 px' },
  { id: 'search-leaderboard', nEn: 'Search — Leaderboard',      nId: 'Pencarian — Leaderboard',      size: '1400 × 160 px' },
  { id: 'search-box',         nEn: 'Search — Sidebar Box',      nId: 'Pencarian — Kotak Sidebar',    size: '720 × 520 px' },
  { id: 'detail-box',         nEn: 'Listing Detail — Side Box', nId: 'Detail Listing — Kotak Samping', size: '720 × 540 px' },
];

const AdmAds = ({ L }) => {
  const [camps, setCamps] = React.useState([
    ['Menteng — Featured', 'Featured', 'Rp 500k/d', '420K', '3.4%', 312, 'live'],
    ['Bali Villa Banner', 'Display CPM', 'Rp 1.2 jt/d', '680K', '2.7%', 408, 'live'],
    ['BSD Microsite', 'Developer', 'Rp 2 jt/d', '140K', '4.4%', 172, 'live'],
    ['Kuningan Sponsored', 'Sponsored search', 'Rp 300k/d', '—', '—', 0, 'draft'],
  ]);
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ name: '', type: AD_TYPES[0], budget: '' });
  const valid = f.name.trim() && Number(f.budget) > 0;
  const save = () => {
    if (!valid) return;
    const budget = Number(f.budget) >= 1_000_000 ? `Rp ${(Number(f.budget) / 1_000_000).toLocaleString('id-ID')} jt/d` : `Rp ${Math.round(Number(f.budget) / 1000)}k/d`;
    setCamps(q => [[f.name, f.type, budget, '—', '—', 0, 'draft'], ...q]);
    setF({ name: '', type: AD_TYPES[0], budget: '' });
    setOpen(false);
  };

  /* ── Banner per penempatan (tersimpan di database) ── */
  const [banners, setBanners] = React.useState([]);      // semua banner (aktif + riwayat)
  const [bModal, setBModal] = React.useState(null);      // placement id yang sedang diatur
  const [bFile, setBFile] = React.useState(null);        // { file, url }
  const [bLink, setBLink] = React.useState('');
  const [bTitle, setBTitle] = React.useState('');
  const [bBusy, setBBusy] = React.useState(false);
  const [bNotice, setBNotice] = React.useState(null);
  const bFileInput = React.useRef(null);

  const loadBanners = React.useCallback(() => {
    apiAdmin(() => adminApi.get('/api/banners')).then(r => setBanners(r.data || [])).catch(() => {});
  }, []);
  React.useEffect(() => { loadBanners(); }, [loadBanners]);
  const activeFor = (pid) => banners.find(b => b.placement === pid && b.active);
  const totalClicks = (pid) => banners.filter(b => b.placement === pid).reduce((s, b) => s + b.clicks, 0);

  const openBannerModal = (pid) => {
    const cur = activeFor(pid);
    setBModal(pid);
    setBFile(null);
    setBLink(cur?.linkUrl || '');
    setBTitle(cur?.title || '');
  };
  const onBannerFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && file.type.startsWith('image/')) setBFile({ file, url: URL.createObjectURL(file) });
  };
  const bValid = bFile && /^https?:\/\//i.test(bLink.trim());
  const saveBanner = async () => {
    if (!bValid || bBusy) return;
    setBBusy(true);
    try {
      const fd = new FormData();
      fd.append('image', bFile.file);
      fd.append('placement', bModal);
      fd.append('linkUrl', bLink.trim());
      if (bTitle.trim()) fd.append('title', bTitle.trim());
      await apiAdmin(() => adminApi.post('/api/banners', fd));
      loadBanners();
      const p = BANNER_PLACEMENTS.find(x => x.id === bModal);
      setBNotice(L(`Banner for "${L(p.nEn, p.nId)}" is now live on the public site.`, `Banner "${L(p.nEn, p.nId)}" sudah tayang di situs publik.`));
      setBModal(null);
    } catch (e) {
      setBNotice(L(`Failed to save banner: ${e.message}`, `Gagal menyimpan banner: ${e.message}`));
    } finally {
      setBBusy(false);
    }
  };
  const removeBanner = async (pid) => {
    const cur = activeFor(pid);
    if (!cur) return;
    try {
      await apiAdmin(() => adminApi.del(`/api/banners/${cur.id}`));
      loadBanners();
      setBNotice(L('Banner removed — the slot shows the default demo ad again.', 'Banner dihapus — slot kembali menampilkan iklan demo bawaan.'));
    } catch (e) {
      setBNotice(L(`Failed to remove: ${e.message}`, `Gagal menghapus: ${e.message}`));
    }
  };
  const bPlacement = bModal ? BANNER_PLACEMENTS.find(x => x.id === bModal) : null;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('Impressions', 'Impresi')} val="1.24 jt" delta="▲ 18%" />
        <Kpi label={L('Clicks', 'Klik')} val="38,400" delta="▲ 12%" />
        <Kpi label="CTR" val="3.1%" delta="▲ 0.4pp" />
        <Kpi label={L('Ad spend', 'Belanja iklan')} val="Rp 42 jt" delta="8 advertisers" color="var(--muted)" />
      </div>
      <PageHead title={L('Ad Campaigns', 'Kampanye Iklan')} sub={L('Display, featured, and sponsored placements across the portal.', 'Display, unggulan, dan sponsor di seluruh portal.')} actions={<button className="p-btn p-btn-primary p-btn-sm" onClick={() => setOpen(true)}><PIcon name="plus" size={14} /> {L('New campaign', 'Kampanye baru')}</button>} />
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Campaign', 'Kampanye')}</Th><Th>{L('Type', 'Tipe')}</Th><Th right>{L('Budget', 'Anggaran')}</Th><Th right>Impr.</Th><Th right>CTR</Th><Th right>{L('Leads', 'Prospek')}</Th><Th>Status</Th></tr></thead>
          <tbody>
            {camps.map((c, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td bold>{c[0]}</Td><Td>{c[1]}</Td><Td right mono>{c[2]}</Td><Td right mono>{c[3]}</Td><Td right mono>{c[4]}</Td><Td right mono bold>{c[5]}</Td>
                <Td><Pill tone={c[6] === 'live' ? 'live' : 'draft'}>{c[6] === 'live' ? '● Live' : c[6] === 'draft' ? 'Draft' : 'Paused'}</Pill></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Banner per penempatan ── */}
      <div style={{ marginTop: 28 }}>
        <PageHead
          title={L('Placement Banners', 'Banner Penempatan')}
          sub={L('Upload a custom banner per ad slot on the public site. Clicking it opens your link and is counted below.', 'Unggah banner khusus untuk tiap slot iklan di situs publik. Klik pengunjung membuka tautan Anda dan dihitung di bawah.')}
        />
        {bNotice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '11px 16px', borderRadius: 10, background: 'rgba(45,138,111,0.08)', border: '1px solid rgba(45,138,111,0.3)', fontSize: 12.5, color: 'var(--ink-2)' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green, #2D8A6F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="check" size={12} /></span>
            <span style={{ flex: 1 }}>{bNotice}</span>
            <span style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setBNotice(null)}>✕</span>
          </div>
        )}
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--paper-2)' }}>
              <Th>{L('Placement', 'Penempatan')}</Th><Th>{L('Banner size', 'Ukuran banner')}</Th><Th>{L('Preview', 'Pratinjau')}</Th><Th>{L('Link', 'Tautan')}</Th><Th right>{L('Clicks', 'Klik')}</Th><Th>Status</Th><Th right> </Th>
            </tr></thead>
            <tbody>
              {BANNER_PLACEMENTS.map(p => {
                const cur = activeFor(p.id);
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <Td bold>{L(p.nEn, p.nId)}</Td>
                    <Td mono>{p.size}</Td>
                    <Td>
                      {cur
                        ? <img src={resolveFileUrl(cur.imagePath)} alt="" style={{ width: 96, height: 34, objectFit: 'cover', borderRadius: 5, border: '1px solid var(--line)', display: 'block' }} />
                        : <span style={{ fontSize: 12, color: 'var(--muted)' }}>{L('Default demo ad', 'Iklan demo bawaan')}</span>}
                    </Td>
                    <Td>
                      {cur
                        ? <a href={cur.linkUrl} target="_blank" rel="noopener noreferrer" className="p-link" style={{ fontSize: 12, maxWidth: 180, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{cur.linkUrl.replace(/^https?:\/\//, '')}</a>
                        : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </Td>
                    <Td right mono bold>{cur ? totalClicks(p.id).toLocaleString('id-ID') : '—'}</Td>
                    <Td>{cur ? <Pill tone="live">● Live</Pill> : <Pill tone="draft">Demo</Pill>}</Td>
                    <Td right>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="p-btn p-btn-cyan p-btn-sm" onClick={() => openBannerModal(p.id)}><PIcon name="edit" size={13} /> {L('Set banner', 'Atur banner')}</button>
                        {cur && <button className="p-btn p-btn-ghost p-btn-sm" title={L('Remove', 'Hapus')} onClick={() => removeBanner(p.id)}>✕</button>}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {bPlacement && (
        <Modal title={L('Set Banner — ', 'Atur Banner — ') + L(bPlacement.nEn, bPlacement.nId)} onClose={() => setBModal(null)} width={520}>
          <input ref={bFileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={onBannerFile} />
          <FieldRow label={L('Banner image *', 'Gambar banner *')}>
            <div onClick={() => bFileInput.current?.click()} style={{ border: '2px dashed var(--line)', borderRadius: 10, padding: bFile ? 0 : '26px 16px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', background: 'var(--paper-2)' }}>
              {bFile
                ? <img src={bFile.url} alt="" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
                : (
                  <>
                    <div style={{ color: 'var(--teal)', marginBottom: 6 }}><PIcon name="cam" size={22} /></div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{L('Click to choose an image', 'Klik untuk pilih gambar')}</div>
                  </>
                )}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 7, lineHeight: 1.5 }}>
              📐 {L('Recommended size', 'Ukuran disarankan')}: <b style={{ color: 'var(--ink)' }}>{bPlacement.size}</b> · JPG/PNG · {L('max 5 MB. Keep important content centered — the image is cropped to fill the slot.', 'maks 5 MB. Letakkan konten penting di tengah — gambar dipotong menyesuaikan slot.')}
            </div>
          </FieldRow>
          <FieldRow label={L('Destination link (opens on click) *', 'Tautan tujuan (terbuka saat diklik) *')}>
            <input style={inputStyle} value={bLink} onChange={e => setBLink(e.target.value)} placeholder="https://bank-anda.co.id/promo-kpr" />
          </FieldRow>
          <FieldRow label={L('Title (optional)', 'Judul (opsional)')}>
            <input style={inputStyle} value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder={L('e.g. KPR Promo Q3', 'cth. Promo KPR Q3')} />
          </FieldRow>
          {bLink && !/^https?:\/\//i.test(bLink.trim()) && (
            <div style={{ fontSize: 11.5, color: 'var(--red, #C14545)', marginTop: -6, marginBottom: 10 }}>{L('Link must start with http:// or https://', 'Tautan harus diawali http:// atau https://')}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setBModal(null)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!bValid || bBusy} style={!bValid || bBusy ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={saveBanner}>
              <PIcon name="check" size={14} /> {bBusy ? L('Saving…', 'Menyimpan…') : L('Publish banner', 'Terbitkan banner')}
            </button>
          </div>
        </Modal>
      )}
      {open && (
        <Modal title={L('New Campaign', 'Kampanye Baru')} onClose={() => setOpen(false)}>
          <FieldRow label={L('Campaign name *', 'Nama kampanye *')}>
            <input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder={L('e.g. Kemang House — Featured', 'cth. Rumah Kemang — Unggulan')} />
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldRow label={L('Type', 'Tipe')}>
              <select style={inputStyle} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
                {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FieldRow>
            <FieldRow label={L('Budget / day (IDR) *', 'Anggaran / hari (Rp) *')}>
              <input style={inputStyle} type="number" min="0" value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })} placeholder="500000" />
            </FieldRow>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setOpen(false)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!valid} style={!valid ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={save}><PIcon name="check" size={14} /> {L('Create draft', 'Buat draf')}</button>
          </div>
        </Modal>
      )}
    </>
  );
};

/* ── Leads / Prospek (admin + agent) ── */
const AdmLeads = ({ L, persona }) => {
  const leads = [
    { name: 'Hendra Gunawan', prop: 'Menteng Heritage Townhouse', budget: 14_000_000_000, src: 'WhatsApp', when: '2m', st: 'hot' },
    { name: 'Maria Tanuwijaya', prop: 'SCBD Sky Apartment 28F', budget: 5_500_000_000, src: 'Form', when: '22m', st: 'new' },
    { name: 'PT Anugrah Jaya', prop: 'Kuningan Office Floor', budget: 2_200_000_000, src: 'Call', when: '1h', st: 'new' },
    { name: 'Rudi Salim', prop: 'BSD Green Residence', budget: 1_900_000_000, src: 'WhatsApp', when: '3h', st: 'review' },
    { name: 'Lina Wijaya', prop: 'Canggu Beachfront Villa', budget: 12_000_000_000, src: 'Form', when: '5h', st: 'review' },
  ];
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('New leads (today)', 'Prospek baru (hari ini)')} val="9" delta="▲ 3 vs yest." />
        <Kpi label={L('Hot leads', 'Prospek panas')} val="4" delta={L('Follow up now', 'Tindak lanjut')} color="var(--red)" />
        <Kpi label={L('Conversion rate', 'Tingkat konversi')} val="6.2%" delta="▲ 0.8pp" />
        <Kpi label={L('Avg. response', 'Rata-rata respons')} val="12 min" delta="▼ 4 min" />
      </div>
      <PageHead title={L('Leads', 'Prospek')} sub={persona === 'agent' ? L('Buyers assigned to you. Respond fast to convert.', 'Pembeli yang ditugaskan ke Anda. Respons cepat untuk konversi.') : L('All inbound buyer enquiries across listings.', 'Semua pertanyaan pembeli di seluruh listing.')} actions={<button className="p-btn p-btn-ghost p-btn-sm" onClick={() => downloadFile('assetra-leads.csv', '\uFEFFname,property,budget_idr,source,when,status\n' + leads.map(l => `"${l.name}","${l.prop}",${l.budget},${l.src},${l.when},${l.st}`).join('\n') + '\n', 'text/csv;charset=utf-8')}><PIcon name="globe" size={14} /> {L('Export', 'Ekspor')}</button>} />
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Buyer', 'Pembeli')}</Th><Th>{L('Interested in', 'Tertarik pada')}</Th><Th right>{L('Budget', 'Anggaran')}</Th><Th>{L('Source', 'Sumber')}</Th><Th>{L('When', 'Kapan')}</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600 }}>{l.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div><span style={{ fontWeight: 600 }}>{l.name}</span></div></Td>
                <Td>{l.prop}</Td>
                <Td right mono bold>{fmtRp(l.budget)}</Td>
                <Td>{l.src}</Td>
                <Td mono>{l.when}</Td>
                <Td><Pill tone={l.st}>{l.st === 'hot' ? '🔥 ' + L('Hot', 'Panas') : l.st === 'new' ? L('New', 'Baru') : L('Review', 'Tinjauan')}</Pill></Td>
                <Td right><button className="p-btn p-btn-cyan p-btn-sm" onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(L(
                  `Hello ${l.name}, this is Assetra following up on your enquiry about "${l.prop}". When would be a good time for a viewing?`,
                  `Halo ${l.name}, kami dari Assetra menindaklanjuti minat Anda pada "${l.prop}". Kapan waktu yang pas untuk survei lokasi?`)), '_blank')}><PIcon name="chat" size={13} /> WA</button></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ── KPR Applications (admin + agent) ── */
const AdmKpr = ({ L }) => {
  const [apps, setApps] = React.useState([
    { name: 'Hendra Gunawan', prop: 'Menteng Townhouse', loan: 11_360_000_000, bank: 'Bank Mandiri', dp: '20%', st: 'review' },
    { name: 'Maria Tanuwijaya', prop: 'SCBD Apartment', loan: 4_280_000_000, bank: 'BCA', dp: '20%', st: 'approved' },
    { name: 'Rudi Salim', prop: 'BSD Residence', loan: 1_480_000_000, bank: 'BNI', dp: '20%', st: 'submitted' },
    { name: 'Lina Wijaya', prop: 'Canggu Villa', loan: 9_600_000_000, bank: 'CIMB Niaga', dp: '20%', st: 'review' },
    { name: 'Toni Hartono', prop: 'Pondok Indah Home', loan: 7_840_000_000, bank: 'BRI', dp: '20%', st: 'rejected' },
  ]);
  const [sel, setSel] = React.useState(null); // index of app opened in detail modal
  const tone = { approved: 'live', review: 'review', submitted: 'new', rejected: 'hot' };
  const stLabel = (st) => st === 'approved' ? L('Approved', 'Disetujui') : st === 'review' ? L('Review', 'Tinjauan') : st === 'submitted' ? L('Submitted', 'Diajukan') : L('Rejected', 'Ditolak');
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('Applications', 'Pengajuan')} val="12" delta="▲ 4 this week" />
        <Kpi label={L('Approved', 'Disetujui')} val="7" delta="58% rate" color="var(--green)" />
        <Kpi label={L('In review', 'Dalam tinjauan')} val="3" delta={L('Awaiting bank', 'Menunggu bank')} color="var(--gold-2)" />
        <Kpi label={L('Total financed', 'Total dibiayai')} val="Rp 34 M" delta="▲ 22% MoM" />
      </div>
      <PageHead title={L('KPR Applications', 'Pengajuan KPR')} sub={L('Mortgage pre-approvals routed to partner banks.', 'Pra-persetujuan KPR diteruskan ke bank mitra.')} />
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Applicant', 'Pemohon')}</Th><Th>{L('Property', 'Properti')}</Th><Th right>{L('Loan amount', 'Jumlah pinjaman')}</Th><Th>{L('Bank', 'Bank')}</Th><Th>DP</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {apps.map((a, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td bold>{a.name}</Td><Td>{a.prop}</Td><Td right mono bold>{fmtRp(a.loan)}</Td><Td>{a.bank}</Td><Td mono>{a.dp}</Td>
                <Td><Pill tone={tone[a.st]}>{stLabel(a.st)}</Pill></Td>
                <Td right>
                  <button title={L('View & update', 'Lihat & ubah')} onClick={() => setSel(i)} style={{ border: '1px solid var(--line)', background: '#fff', padding: 6, borderRadius: 5, cursor: 'pointer', color: 'var(--ink-2)' }}><PIcon name="eye" size={13} /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {sel != null && apps[sel] && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,64,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(440px, 100%)', padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, margin: 0 }}>{L('KPR Application', 'Pengajuan KPR')}</h2>
              <span onClick={() => setSel(null)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>✕</span>
            </div>
            {[[L('Applicant', 'Pemohon'), apps[sel].name], [L('Property', 'Properti'), apps[sel].prop], [L('Loan amount', 'Jumlah pinjaman'), fmtRp(apps[sel].loan)], ['Bank', apps[sel].bank], [L('Down payment', 'Uang muka'), apps[sel].dp]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line-2)', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <FieldRow label="Status">
              <select style={inputStyle} value={apps[sel].st} onChange={e => setApps(q => q.map((a, j) => j === sel ? { ...a, st: e.target.value } : a))}>
                {['submitted', 'review', 'approved', 'rejected'].map(s => <option key={s} value={s}>{stLabel(s)}</option>)}
              </select>
            </FieldRow>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="p-btn p-btn-primary p-btn-sm" onClick={() => setSel(null)}><PIcon name="check" size={14} /> {L('Done', 'Selesai')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── AI Reports / Consultant (all personas) ── */
const AdmAI = ({ L, persona }) => {
  const [reports, setReports] = React.useState([
    { prop: 'Kuningan Office · 1,200m²', use: L('Office → Boutique hotel', 'Kantor → Hotel butik'), yield: '4.1% → 9.6%', capex: 'Rp 18 M', st: 'live' },
    { prop: 'Menteng Townhouse · 420m²', use: L('Home → Serviced apartment', 'Rumah → Apartemen layanan'), yield: '5.2% → 7.3%', capex: 'Rp 6 M', st: 'live' },
    { prop: 'Sentul Land · 1,500m²', use: L('Vacant → Cluster housing', 'Kosong → Perumahan klaster'), yield: '— → 14.1% IRR', capex: 'Rp 42 M', st: 'review' },
  ]);
  const [ask, setAsk] = React.useState(false);
  const [q, setQ] = React.useState('');
  const submitAnalysis = () => {
    if (!q.trim()) return;
    setReports(r => [{ prop: q.trim().slice(0, 48), use: L('Analyzing…', 'Menganalisis…'), yield: '—', capex: '—', st: 'review' }, ...r]);
    setQ('');
    setAsk(false);
  };
  const downloadReport = (r) => downloadFile(
    'assetra-ai-analysis.txt',
    `ASSETRA — ${L('AI HIGHEST-AND-BEST-USE ANALYSIS', 'ANALISIS PENGGUNAAN TERBAIK AI')}\n${'='.repeat(48)}\n\n` +
    `${L('Property', 'Properti')}: ${r.prop}\n${L('Recommended use', 'Penggunaan disarankan')}: ${r.use}\n` +
    `${L('Yield uplift', 'Kenaikan imbal hasil')}: ${r.yield}\n${L('Estimated capex', 'Estimasi capex')}: ${r.capex}\n` +
    `Status: ${r.st === 'live' ? L('Complete', 'Selesai') : L('Generating', 'Membuat')}\n\n` +
    L('Note: demo report. Connect ANTHROPIC_API_KEY for full AI-generated analyses.',
      'Catatan: laporan demo. Hubungkan ANTHROPIC_API_KEY untuk analisis AI lengkap.') + '\n',
    'text/plain;charset=utf-8');
  return (
    <>
      <PageHead title={persona === 'owner' ? L('AI Consultant', 'Konsultan AI') : L('AI Reports', 'Laporan AI')} sub={persona === 'owner' ? L('Discover the highest-and-best use for your properties.', 'Temukan penggunaan terbaik untuk properti Anda.') : L('Highest-and-best-use analyses generated for clients.', 'Analisis penggunaan terbaik yang dibuat untuk klien.')} actions={<button className="p-btn p-btn-cyan p-btn-sm" onClick={() => setAsk(true)}><PIcon name="sparkle" size={14} /> {L('New analysis', 'Analisis baru')}</button>} />
      {/* AI prompt card */}
      <div style={{ background: 'linear-gradient(135deg, #0A1640, #14306B)', borderRadius: 12, padding: 22, color: '#fff', marginBottom: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={22} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{L('Ask the AI about any property', 'Tanya AI tentang properti apa pun')}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(250,250,247,0.7)' }}>{L('e.g. "Convert my 3-floor office in Kuningan into something higher-yield"', 'cth. "Ubah kantor 3 lantai saya di Kuningan jadi yang lebih cuan"')}</div>
        </div>
        <button className="p-btn p-btn-cyan p-btn-sm" onClick={() => setAsk(true)}>{L('Start', 'Mulai')} <PIcon name="arrowR" size={14} /></button>
      </div>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Property', 'Properti')}</Th><Th>{L('Recommended use', 'Penggunaan disarankan')}</Th><Th>{L('Yield uplift', 'Kenaikan imbal hasil')}</Th><Th right>{L('Est. capex', 'Est. capex')}</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td bold>{r.prop}</Td><Td>{r.use}</Td>
                <Td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{r.yield}</span></Td>
                <Td right mono>{r.capex}</Td>
                <Td><Pill tone={r.st}>{r.st === 'live' ? L('Complete', 'Selesai') : L('Generating', 'Membuat')}…</Pill></Td>
                <Td right><button className="p-btn p-btn-ghost p-btn-sm" onClick={() => downloadReport(r)}><PIcon name="doc" size={13} /> {L('Report', 'Laporan')}</button></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {ask && (
        <Modal title={L('New AI Analysis', 'Analisis AI Baru')} onClose={() => setAsk(false)} width={500}>
          <FieldRow label={L('Describe the property & your goal *', 'Deskripsikan properti & tujuan Anda *')}>
            <textarea value={q} onChange={e => setQ(e.target.value)} rows={4}
              placeholder={L('e.g. Convert my 3-floor office in Kuningan into something higher-yield', 'cth. Ubah kantor 3 lantai saya di Kuningan jadi yang lebih cuan')}
              style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} />
          </FieldRow>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 14 }}>{L('The analysis appears in the table below as "Generating" and completes after review.', 'Analisis akan muncul di tabel sebagai "Membuat" dan selesai setelah ditinjau.')}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setAsk(false)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!q.trim()} style={!q.trim() ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={submitAnalysis}><PIcon name="sparkle" size={14} /> {L('Run analysis', 'Jalankan analisis')}</button>
          </div>
        </Modal>
      )}
    </>
  );
};

/* ── Agents (admin + agent) ── */
const AdmAgents = ({ L, persona }) => {
  const [agents, setAgents] = React.useState([
    { name: 'Bagus Santoso', area: 'Jakarta Selatan', deals: 142, rating: 4.9, st: 'live' },
    { name: 'Dewi Lestari', area: 'Menteng', deals: 98, rating: 4.8, st: 'live' },
    { name: 'Putu Surya', area: 'Bali', deals: 76, rating: 4.9, st: 'live' },
    { name: 'Sari Indah', area: 'Kuningan', deals: 54, rating: 4.6, st: 'review' },
  ]);
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ name: '', area: '' });
  const valid = f.name.trim() && f.area.trim();
  const save = () => {
    if (!valid) return;
    setAgents(q => [...q, { name: f.name.trim(), area: f.area.trim(), deals: 0, rating: '—', st: 'review' }]);
    setF({ name: '', area: '' });
    setOpen(false);
  };
  return (
    <>
      <PageHead title={L('Agents', 'Agen')} sub={persona === 'agent' ? L('Your team & territory performance.', 'Performa tim & teritori Anda.') : L('Field agents executing viewings, paperwork & negotiation.', 'Agen lapangan: survei, dokumen & negosiasi.')} actions={persona === 'admin' ? <button className="p-btn p-btn-primary p-btn-sm" onClick={() => setOpen(true)}><PIcon name="plus" size={14} /> {L('Add agent', 'Tambah agen')}</button> : null} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {agents.map((a, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 600 }}>{a.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.area}</div></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 12 }}>
              <div><div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{a.deals}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{L('DEALS', 'TRANSAKSI')}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--gold-2)' }}>★ {a.rating}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{L('RATING', 'PERINGKAT')}</div></div>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <Modal title={L('Add Agent', 'Tambah Agen')} onClose={() => setOpen(false)}>
          <FieldRow label={L('Full name *', 'Nama lengkap *')}>
            <input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="cth. Andi Prasetyo" />
          </FieldRow>
          <FieldRow label={L('Territory / area *', 'Teritori / area *')}>
            <input style={inputStyle} value={f.area} onChange={e => setF({ ...f, area: e.target.value })} placeholder="cth. Bandung" />
          </FieldRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setOpen(false)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!valid} style={!valid ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={save}><PIcon name="check" size={14} /> {L('Add agent', 'Tambah agen')}</button>
          </div>
        </Modal>
      )}
    </>
  );
};

/* ── Report download button (triggers a real CSV download) ── */
const ReportBtn = ({ L, rows, filename = 'assetra-report', label }) => {
  const dl = () => {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  };
  return (
    <div style={{ position: 'relative' }} className="rpt-wrap">
      <button className="p-btn p-btn-ghost p-btn-sm" onClick={dl}><PIcon name="doc" size={14} /> {label || L('Download report', 'Unduh laporan')} <PIcon name="chevD" size={12} /></button>
    </div>
  );
};

/* ── Owner Ad Performance ── */
const OWNER_PROPS = ['Menteng Heritage Townhouse', 'Kuningan Office Floor', 'Pondok Indah Family Home', 'Sentul Hillside Land'];
const AdmOwnerAds = ({ L }) => {
  const [camps, setCamps] = React.useState([
    { name: L('Menteng Townhouse — Featured', 'Rumah Menteng — Unggulan'), type: 'Featured', spend: 4_500_000, impr: '128K', clk: '4.2K', ctr: '3.3%', leads: 38, st: 'live' },
    { name: L('Pondok Indah Home — Spotlight', 'Rumah Pondok Indah — Sorotan'), type: 'Sponsored', spend: 2_800_000, impr: '74K', clk: '2.1K', ctr: '2.8%', leads: 16, st: 'live' },
    { name: L('Sentul Land — Boost', 'Tanah Sentul — Boost'), type: 'Featured', spend: 1_200_000, impr: '21K', clk: '480', ctr: '2.3%', leads: 4, st: 'ended' },
  ]);
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ prop: OWNER_PROPS[0], type: 'Featured', budget: '' });
  const valid = Number(f.budget) > 0;
  const save = () => {
    if (!valid) return;
    setCamps(q => [{ name: `${f.prop} — ${f.type === 'Featured' ? L('Featured', 'Unggulan') : 'Sponsor'}`, type: f.type, spend: Number(f.budget), impr: '—', clk: '—', ctr: '—', leads: 0, st: 'live' }, ...q]);
    setF({ prop: OWNER_PROPS[0], type: 'Featured', budget: '' });
    setOpen(false);
  };
  const reportRows = [
    ['Campaign', 'Type', 'Spend (Rp)', 'Impressions', 'Clicks', 'CTR', 'Leads', 'Status'],
    ...camps.map(c => [c.name, c.type, c.spend, c.impr, c.clk, c.ctr, c.leads, c.st]),
  ];
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('Total impressions', 'Total impresi')} val="223K" delta="▲ 14% this week" />
        <Kpi label={L('Total clicks', 'Total klik')} val="6,780" delta="▲ 9%" />
        <Kpi label={L('Leads from ads', 'Prospek dari iklan')} val="58" delta="▲ 12 new" />
        <Kpi label={L('Ad spend (MTD)', 'Belanja iklan (MTD)')} val="Rp 8.5 jt" delta={L('of Rp 12 jt budget', 'dari anggaran Rp 12 jt')} color="var(--muted)" />
      </div>
      <PageHead
        title={L('Ad Performance', 'Performa Iklan')}
        sub={L('How your featured & sponsored placements are performing.', 'Performa placement unggulan & sponsor Anda.')}
        actions={<>
          <ReportBtn L={L} rows={reportRows} filename="ad-performance" />
          <button className="p-btn p-btn-cyan p-btn-sm" onClick={() => setOpen(true)}><PIcon name="plus" size={14} /> {L('Boost a listing', 'Boost listing')}</button>
        </>}
      />
      {open && (
        <Modal title={L('Boost a Listing', 'Boost Listing')} onClose={() => setOpen(false)}>
          <FieldRow label={L('Listing', 'Listing')}>
            <select style={inputStyle} value={f.prop} onChange={e => setF({ ...f, prop: e.target.value })}>
              {OWNER_PROPS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldRow label={L('Placement', 'Penempatan')}>
              <select style={inputStyle} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
                <option value="Featured">{L('Featured', 'Unggulan')}</option>
                <option value="Sponsored">Sponsored</option>
              </select>
            </FieldRow>
            <FieldRow label={L('Budget (IDR) *', 'Anggaran (Rp) *')}>
              <input style={inputStyle} type="number" min="0" value={f.budget} onChange={e => setF({ ...f, budget: e.target.value })} placeholder="1500000" />
            </FieldRow>
          </div>
          {valid && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)', margin: '-6px 0 12px' }}>= {fmtRp(Number(f.budget))}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setOpen(false)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!valid} style={!valid ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={save}><PIcon name="check" size={14} /> {L('Start boost', 'Mulai boost')}</button>
          </div>
        </Modal>
      )}
      {/* performance over time bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 22 }}>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Impressions · last 7 days', 'Impresi · 7 hari terakhir')}</div>
          <div style={{ padding: 20, display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {[42, 55, 38, 68, 74, 60, 88].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: h + '%', background: 'var(--brand-gradient)', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Spend vs. leads', 'Belanja vs. prospek')}</div>
          <div style={{ padding: 18 }}>
            {[[L('Featured', 'Unggulan'), 68, 'var(--teal)'], [L('Sponsored', 'Sponsor'), 42, 'var(--gold)'], [L('Organic (free)', 'Organik (gratis)'), 90, 'var(--green)']].map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}><span>{r[0]}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{r[1]} {L('leads', 'prospek')}</span></div>
                <div style={{ height: 7, background: 'var(--paper-2)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: r[1] + '%', height: '100%', background: r[2] }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('My campaigns', 'Kampanye saya')}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Campaign', 'Kampanye')}</Th><Th>{L('Type', 'Tipe')}</Th><Th right>{L('Spend', 'Belanja')}</Th><Th right>Impr.</Th><Th right>{L('Clicks', 'Klik')}</Th><Th right>CTR</Th><Th right>{L('Leads', 'Prospek')}</Th><Th>Status</Th></tr></thead>
          <tbody>
            {camps.map((c, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td bold>{c.name}</Td>
                <Td>{c.type === 'Featured' ? <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(176,136,56,0.12)', color: 'var(--gold-2)' }}>{c.type}</span> : <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(26,111,168,0.1)', color: 'var(--teal)' }}>★ {c.type}</span>}</Td>
                <Td right mono bold>{fmtRp(c.spend)}</Td>
                <Td right mono>{c.impr}</Td>
                <Td right mono>{c.clk}</Td>
                <Td right mono>{c.ctr}</Td>
                <Td right mono bold>{c.leads}</Td>
                <Td><Pill tone={c.st === 'live' ? 'live' : 'draft'}>{c.st === 'live' ? '● Live' : L('Ended', 'Selesai')}</Pill></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ── Reports hub (downloadable) ── */
const AdmReports = ({ L, persona }) => {
  const adminReports = [
    { ic: 'bank', t: L('Revenue & ad billing', 'Pendapatan & tagihan iklan'), s: L('All advertiser invoices, featured spend, subscriptions', 'Semua invoice pengiklan, belanja unggulan, langganan'), period: L('Monthly', 'Bulanan'), rows: [['Channel', 'Revenue (Rp)', 'MoM'], ['Featured listings', 525000000, '+18%'], ['Display ads', 203000000, '+12%'], ['Subscriptions', 84000000, '+6%'], ['Sponsored search', 35000000, '+22%']], file: 'revenue' },
    { ic: 'home', t: L('Listings inventory', 'Inventori listing'), s: L('Every listing, status, owner, views & leads', 'Setiap listing, status, pemilik, dilihat & prospek'), period: L('Live', 'Langsung'), rows: [['ID', 'Property', 'Price', 'Status', 'Leads'], ['P-0847', 'Menteng Townhouse', 14200000000, 'live', 42], ['P-0823', 'SCBD Apartment', 5350000000, 'live', 28]], file: 'listings' },
    { ic: 'users', t: L('Leads & conversion', 'Prospek & konversi'), s: L('Inbound enquiries, source, agent, status', 'Pertanyaan masuk, sumber, agen, status'), period: L('Weekly', 'Mingguan'), rows: [['Buyer', 'Property', 'Source', 'Status'], ['Hendra G.', 'Menteng', 'WhatsApp', 'hot']], file: 'leads' },
    { ic: 'bank', t: L('KPR pipeline', 'Pipeline KPR'), s: L('Applications, banks, approval rate, financed value', 'Pengajuan, bank, tingkat persetujuan, nilai dibiayai'), period: L('Monthly', 'Bulanan'), rows: [['Applicant', 'Bank', 'Loan', 'Status'], ['Hendra G.', 'Mandiri', 11360000000, 'review']], file: 'kpr' },
    { ic: 'sparkle', t: L('AI consultancy log', 'Log konsultasi AI'), s: L('Highest-and-best-use analyses & yield uplift', 'Analisis penggunaan terbaik & kenaikan imbal hasil'), period: L('Live', 'Langsung'), rows: [['Property', 'Use', 'Yield uplift'], ['Kuningan Office', 'Hotel', '4.1→9.6%']], file: 'ai-reports' },
    { ic: 'megaphone', t: L('Ad performance', 'Performa iklan'), s: L('Impressions, clicks, CTR & spend per campaign', 'Impresi, klik, CTR & belanja per kampanye'), period: L('Weekly', 'Mingguan'), rows: [['Campaign', 'Impr', 'CTR', 'Leads'], ['Menteng Featured', '420K', '3.4%', 312]], file: 'ad-performance' },
  ];
  const ownerReports = adminReports.filter(r => ['listings', 'leads', 'ai-reports', 'ad-performance'].includes(r.file));
  const reports = persona === 'owner' ? ownerReports : adminReports;
  const [period, setPeriod] = React.useState(2);
  const [preview, setPreview] = React.useState(null);   // report being previewed
  const [sched, setSched] = React.useState(false);
  const [schedF, setSchedF] = React.useState({ report: reports[0]?.file || '', freq: 'weekly', email: '' });
  const [notice, setNotice] = React.useState(null);
  const saveSchedule = () => {
    if (!/.+@.+\..+/.test(schedF.email)) return;
    const r = reports.find(x => x.file === schedF.report);
    setNotice(L(
      `Scheduled: "${r?.t}" will be emailed ${schedF.freq} to ${schedF.email}.`,
      `Terjadwal: "${r?.t}" akan dikirim ${schedF.freq === 'daily' ? 'harian' : schedF.freq === 'weekly' ? 'mingguan' : 'bulanan'} ke ${schedF.email}.`));
    setSched(false);
  };

  return (
    <>
      <PageHead
        title={L('Reports', 'Laporan')}
        sub={L('Download any report as CSV. Schedule recurring exports to email.', 'Unduh laporan apa pun sebagai CSV. Jadwalkan ekspor berkala ke email.')}
        actions={<button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setSched(true)}><PIcon name="bell" size={14} /> {L('Schedule', 'Jadwalkan')}</button>}
      />
      {notice && (
        <div style={{ marginBottom: 16, padding: '11px 16px', borderRadius: 10, background: 'rgba(45,138,111,0.08)', border: '1px solid rgba(45,138,111,0.3)', fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {notice}</span>
          <span style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setNotice(null)}>✕</span>
        </div>
      )}
      {/* date range bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>{L('PERIOD', 'PERIODE')}</span>
        {[L('Today', 'Hari ini'), L('This week', 'Minggu ini'), L('This month', 'Bulan ini'), L('Quarter', 'Kuartal'), L('Custom', 'Kustom')].map((c, i) => <span key={c} className={`p-chip ${i === period ? 'active' : ''}`} onClick={() => setPeriod(i)} style={{ fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>{c}</span>)}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{L('Format', 'Format')}: <b style={{ color: 'var(--ink)' }}>CSV</b> · XLSX · PDF</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {reports.map((r, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(26,111,168,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={r.ic} size={20} /></div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--line)', padding: '2px 7px', borderRadius: 4 }}>{r.period}</span>
            </div>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 19, margin: '0 0 6px' }}>{r.t}</h3>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>{r.s}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="p-btn p-btn-cyan p-btn-sm" style={{ flex: 1 }} onClick={() => {
                const csv = r.rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                a.download = 'assetra-' + r.file + '-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
              }}><PIcon name="doc" size={14} /> {L('Download CSV', 'Unduh CSV')}</button>
              <button className="p-btn p-btn-ghost p-btn-sm" title={L('Preview', 'Pratinjau')} onClick={() => setPreview(r)}><PIcon name="eye" size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <Modal title={preview.t} onClose={() => setPreview(null)} width={560}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{preview.s} · {preview.period}</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--paper-2)' }}>{preview.rows[0].map((h, i) => <Th key={i}>{h}</Th>)}</tr></thead>
              <tbody>
                {preview.rows.slice(1).map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    {row.map((c, j) => <Td key={j} mono={typeof c === 'number'}>{typeof c === 'number' && c > 1000000 ? fmtRp(c) : String(c)}</Td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setPreview(null)}>{L('Close', 'Tutup')}</button>
          </div>
        </Modal>
      )}
      {sched && (
        <Modal title={L('Schedule Report', 'Jadwalkan Laporan')} onClose={() => setSched(false)}>
          <FieldRow label={L('Report', 'Laporan')}>
            <select style={inputStyle} value={schedF.report} onChange={e => setSchedF({ ...schedF, report: e.target.value })}>
              {reports.map(r => <option key={r.file} value={r.file}>{r.t}</option>)}
            </select>
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FieldRow label={L('Frequency', 'Frekuensi')}>
              <select style={inputStyle} value={schedF.freq} onChange={e => setSchedF({ ...schedF, freq: e.target.value })}>
                <option value="daily">{L('Daily', 'Harian')}</option>
                <option value="weekly">{L('Weekly', 'Mingguan')}</option>
                <option value="monthly">{L('Monthly', 'Bulanan')}</option>
              </select>
            </FieldRow>
            <FieldRow label={L('Email to *', 'Kirim ke email *')}>
              <input style={inputStyle} type="email" value={schedF.email} onChange={e => setSchedF({ ...schedF, email: e.target.value })} placeholder="nama@perusahaan.co.id" />
            </FieldRow>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setSched(false)}>{L('Cancel', 'Batal')}</button>
            <button className="p-btn p-btn-primary p-btn-sm" disabled={!/.+@.+\..+/.test(schedF.email)} style={!/.+@.+\..+/.test(schedF.email) ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={saveSchedule}><PIcon name="bell" size={14} /> {L('Schedule', 'Jadwalkan')}</button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PortalAdmin;
