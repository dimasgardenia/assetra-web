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
import { resizeToAvatarDataUrl } from '../lib/image';
import AppDialog from './AppDialog';
import { useUser } from '../store';
import { MapPicker } from './MapWidgets';
import { geocodeAddress, HAS_MAPS_KEY } from '../lib/googleMaps';

/* Admin form type → backend {type, mode} */
const TY_MAP = {
  'House · Sale':      { type: 'property',   mode: 'sale' },
  'Apartment · Sale':  { type: 'apartment',  mode: 'sale' },
  'Villa · Sale':      { type: 'villa',      mode: 'sale' },
  'Land · Sale':       { type: 'land',       mode: 'sale' },
  'Commercial · Rent': { type: 'commercial', mode: 'rent' },
  'New · Project':     { type: 'property',   mode: 'new' },
};

/* Panel dipakai oleh akun asli yang sudah lolos AdminGuard (admin atau agen
   terverifikasi). Panggilan memakai token sesi user (localStorage) via `api`.
   Tidak ada lagi auto-login kredensial demo. */
export const adminApi = {
  get: (p, opts) => api.get(p, opts),
  post: (p, b, opts) => api.post(p, b, opts),
  put: (p, b, opts) => api.put(p, b, opts),
  del: (p, opts) => api.del(p, opts),
};

/* Pembungkus tipis (dipertahankan agar pemanggil tak berubah). */
async function apiAdmin(fn) {
  return fn();
}

const PortalAdmin = ({ lang, onLang, onNav }) => {
  const id = lang === 'id';
  const L = (en, idt) => (id ? idt : en);
  /* Persona mengikuti akun yang login: admin → semua menu; pemilik properti
     terverifikasi → persona owner; agen terverifikasi → persona agent (keduanya
     memakai menu yang sama). Hanya admin yang boleh "melihat sebagai" persona lain. */
  const user = useUser();
  const isAdmin = user?.role === 'admin';
  const realPersona = isAdmin ? 'admin' : user?.accountType === 'owner' ? 'owner' : 'agent';
  const [persona, setPersona] = React.useState(realPersona);
  React.useEffect(() => { if (!isAdmin && persona !== realPersona) { setPersona(realPersona); setNav('mylistings'); } }, [isAdmin, realPersona]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Badge sidebar dari data nyata (bukan angka statis). */
  const [counts, setCounts] = React.useState(null);
  React.useEffect(() => {
    if (!isAdmin) return; // statistik hanya untuk admin (endpoint menolak peran lain)
    apiAdmin(() => adminApi.get('/api/admin/stats'))
      .then(r => {
        const s = r.data || {};
        setCounts({ listings: s.portalListings ?? 0, ads: s.activeBanners ?? 0, leads: s.newLeads ?? 0, kpr: s.totalKpr ?? 0, agents: s.liveAgents ?? 0 });
      })
      .catch(() => {});
  }, []);

  const PERSONAS = {
    admin:  { role: L('Super Admin', 'Super Admin'),     tag: 'ADMIN',  badge: 'var(--gold)' },
    agent:  { role: L('Agent', 'Agen'),                  tag: 'AGENT',  badge: 'var(--teal)' },
    owner:  { role: L('Property Owner', 'Pemilik Properti'), tag: 'OWNER',  badge: 'var(--green)' },
  };

  const NAV = {
    admin: [
      { id: 'dashboard', label: L('Dashboard', 'Dasbor'), icon: 'dash' },
      { id: 'listings',  label: L('Listings', 'Listing'), icon: 'home' },
      { id: 'bulk',      label: L('Bulk Upload', 'Unggah Massal'), icon: 'doc' },
      { id: 'ads',       label: L('Ad Banners', 'Banner Iklan'), icon: 'megaphone' },
      { id: 'leads',     label: L('Leads', 'Prospek'), icon: 'users' },
      { id: 'kpr',       label: L('KPR Applications', 'Pengajuan KPR'), icon: 'bank' },
      { id: 'agents',    label: L('Agents', 'Agen'), icon: 'users' },
    ],
    agent: [
      { id: 'mylistings', label: L('My Listings', 'Listing Saya'), icon: 'home' },
      { id: 'leads', label: L('Leads', 'Prospek'), icon: 'users' },
      { id: 'agents',label: L('Agents', 'Agen'), icon: 'users' },
    ],
    /* Pemilik properti: akses & menu sama persis dengan agen. */
    owner: [
      { id: 'mylistings', label: L('My Listings', 'Listing Saya'), icon: 'home' },
      { id: 'leads', label: L('Leads', 'Prospek'), icon: 'users' },
      { id: 'agents',label: L('Agents', 'Agen'), icon: 'users' },
    ],
  };

  const defaultNav = { admin: 'dashboard', agent: 'mylistings', owner: 'mylistings' };
  const [nav, setNav] = React.useState(defaultNav[realPersona]);
  const switchPersona = (p) => { setPersona(p); setNav(defaultNav[p]); };

  /* Nama & inisial selalu dari akun yang login; admin yang "melihat sebagai"
     persona lain tetap tampil dengan namanya sendiri. */
  const realName = user?.name || user?.email || '';
  const cur = {
    ...PERSONAS[persona],
    name: realName,
    init: realName.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?',
    role: persona === realPersona ? PERSONAS[persona].role : L(`Viewing as ${PERSONAS[persona].role}`, `Melihat sebagai ${PERSONAS[persona].role}`),
  };
  /* Timpa badge statis dengan hitungan nyata bila sudah termuat. */
  const navItems = NAV[persona].map(n => (counts && counts[n.id] != null ? { ...n, count: counts[n.id] } : n));

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

        {/* role switcher — hanya admin yang boleh melihat sebagai persona lain */}
        <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid rgba(250,250,247,0.08)' }}>
          {isAdmin && (<>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', color: 'rgba(250,250,247,0.4)', marginBottom: 8 }}>{L('VIEW AS PERSONA', 'LIHAT SEBAGAI')}</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {Object.keys(PERSONAS).map(p => (
              <button key={p} onClick={() => switchPersona(p)} style={{ flex: 1, padding: '6px 0', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', borderRadius: 4, cursor: 'pointer', border: '1px solid ' + (persona === p ? PERSONAS[p].badge : 'rgba(250,250,247,0.15)'), background: persona === p ? PERSONAS[p].badge : 'transparent', color: persona === p ? '#fff' : 'rgba(250,250,247,0.6)', fontWeight: 600 }}>{PERSONAS[p].tag}</button>
            ))}
          </div>
          </>)}
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
          {nav === 'listings' && <AdmListings L={L} lang={lang} scope="all" persona={persona} onGoBulk={() => setNav('bulk')} />}
          {nav === 'mylistings' && <AdmListings L={L} lang={lang} scope="mine" persona={persona} me={user} onGoBulk={() => setNav('bulk')} />}
          {nav === 'bulk' && <AdmBulk L={L} />}
          {nav === 'ads' && <AdmAds L={L} />}
          {nav === 'leads' && <AdmLeads L={L} persona={persona} />}
          {nav === 'kpr' && <AdmKpr L={L} />}
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
/* "x menit lalu" relatif dari timestamp ms. */
const timeAgo = (ms, L) => {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return L('just now', 'baru saja');
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}j`;
  return `${Math.floor(h / 24)}h`;
};

const AdmDash = ({ L }) => {
  const [s, setS] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    apiAdmin(() => adminApi.get('/api/admin/stats'))
      .then(r => setS(r.data || {}))
      .catch(() => setS({}))
      .finally(() => setLoading(false));
  }, []);

  const leadTypes = s?.leadsByType || { whatsapp: 0, call: 0, survey: 0, ai: 0 };
  const leadTotal = leadTypes.whatsapp + leadTypes.call + leadTypes.survey + leadTypes.ai;
  const pct = (n) => leadTotal ? Math.round((n / leadTotal) * 100) : 0;
  const recent = s?.recent || [];
  const recLabel = (r) => r.kind === 'kpr'
    ? L(`KPR application · ${r.sub || 'bank'}`, `Pengajuan KPR · ${r.sub || 'bank'}`)
    : L(`New ${r.sub || 'lead'} lead${r.title ? ` · ${r.title}` : ''}`, `Prospek ${r.sub || 'baru'}${r.title ? ` · ${r.title}` : ''}`);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Kpi label={L('Portal listings', 'Listing portal')} val={loading ? '…' : String(s?.portalListings ?? 0)} delta={L('live on marketplace', 'tayang di marketplace')} color="var(--muted)" />
        <Kpi label={L('New leads', 'Prospek baru')} val={loading ? '…' : String(s?.newLeads ?? 0)} delta={L(`${s?.totalLeads ?? 0} total`, `${s?.totalLeads ?? 0} total`)} />
        <Kpi label={L('KPR applications', 'Pengajuan KPR')} val={loading ? '…' : String(s?.totalKpr ?? 0)} delta={L(`${s?.newKpr ?? 0} new`, `${s?.newKpr ?? 0} baru`)} />
        <Kpi label={L('Active agents', 'Agen aktif')} val={loading ? '…' : String(s?.liveAgents ?? 0)} delta={L(`${s?.totalAgents ?? 0} total`, `${s?.totalAgents ?? 0} total`)} color="var(--muted)" />
      </div>
      <PageHead title={L('Operations overview', 'Ikhtisar operasional')} sub={L('Live platform data across listings, leads, financing & agents.', 'Data platform langsung: listing, prospek, pembiayaan & agen.')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Recent activity', 'Aktivitas terbaru')}</div>
          <div style={{ padding: 6 }}>
            {recent.length === 0 && <div style={{ padding: '18px 12px', fontSize: 13, color: 'var(--muted)' }}>{loading ? L('Loading…', 'Memuat…') : L('No activity yet — leads & KPR applications will appear here.', 'Belum ada aktivitas — prospek & pengajuan KPR akan muncul di sini.')}</div>}
            {recent.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 12px', fontSize: 13, borderBottom: i < recent.length - 1 ? '1px solid var(--line-2)' : 'none' }}><span>{recLabel(r)}</span><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{timeAgo(r.created_at, L)}</span></div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 17 }}>{L('Leads by channel', 'Prospek per saluran')}</div>
          <div style={{ padding: 18 }}>
            {leadTotal === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{loading ? L('Loading…', 'Memuat…') : L('No leads captured yet.', 'Belum ada prospek yang tertangkap.')}</div>}
            {leadTotal > 0 && [[L('WhatsApp', 'WhatsApp'), leadTypes.whatsapp, 'var(--teal)'], [L('Call', 'Telepon'), leadTypes.call, 'var(--gold)'], [L('Site survey', 'Survei lokasi'), leadTypes.survey, 'var(--green)'], [L('AI consultant', 'Konsultan AI'), leadTypes.ai, 'var(--ink-3)']].map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}><span>{r[0]}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{r[1]} · {pct(r[1])}%</span></div>
                <div style={{ height: 7, background: 'var(--paper-2)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: pct(r[1]) + '%', height: '100%', background: r[2] }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

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

const ListingModal = ({ L, lang, mode, initial, lockOwner, onClose, onSave }) => {
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
        <FieldRow label={L('Location on map', 'Lokasi di peta')}>
          <MapPicker lang={lang} address={f.addr} lat={f.lat ?? null} lng={f.lng ?? null} disabled={ro}
            onChange={({ lat, lng, address }) => setF(prev => ({ ...prev, lat, lng, ...(address ? { addr: address } : {}) }))} />
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

const AdmListings = ({ L, lang, scope, persona, me, onGoBulk }) => {
  /* scope: 'all' (admin) | 'owner' (persona demo) | 'mine' (agen: hanya listing
     yang ia buat, dari database — tanpa baris contoh). */
  const mine = scope === 'mine';
  const myName = me?.name || me?.email || '';
  const [items, setItems] = React.useState([]);
  /* Jumlah prospek per listing (dari API prospek — hanya listing yang boleh dilihat). */
  const [leadCounts, setLeadCounts] = React.useState({});
  React.useEffect(() => {
    api.get('/api/leads').then(r => {
      const m = {}; (r.data || []).forEach(l => { if (l.listingId) m[l.listingId] = (m[l.listingId] || 0) + 1; });
      setLeadCounts(m);
    }).catch(() => {});
  }, []);
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
  const scoped = items;
  const showOwnerCol = scope === 'all';
  const rows = scoped.filter(l =>
    chip === 'all' ? true
    : chip === 'featured' ? (l.promo === 'Featured' || l.promo === 'Sponsored')
    : l.st === chip);

  const kindFor = (ty) => ty.toLowerCase().includes('villa') ? 'villa' : ty.toLowerCase().includes('apart') ? 'apartment' : ty.toLowerCase().includes('commer') ? 'commercial' : ty.toLowerCase().includes('land') ? 'land' : 'property';

  const openNew = () => setModal({ mode: 'new' });
  const openRow = (mode, id) => setModal({ mode, id });
  const current = modal?.id != null ? items.find(l => l.id === modal.id) : null;
  const initialForm = modal?.mode === 'new'
    ? { t: '', ty: LISTING_TYPES[0], price: '', addr: '', beds: '', baths: '', area: '', bldArea: '', floors: '', year: '', cert: '', desc: '', fac: '', lat: null, lng: null, owner: mine ? myName : '', promo: '—', st: 'live' }
    : current ? { ...current, price: String(current.price) } : null;

  /* Load marketplace listings from the database so they survive refresh. */
  React.useEffect(() => {
    let on = true;
    api.get('/api/listings?source=portal&perPage=60' + (mine ? '&mine=1' : '')).then(r => {
      if (!on) return;
      const rows = (r.data || []).map(x => ({
        id: x.id, t: x.title, ty: x.typeLabel || x.type, price: x.price ?? x.currentBid ?? 0,
        addr: x.address || '', beds: x.beds, baths: x.baths, area: x.area,
        bldArea: x.buildingArea, floors: x.floors, year: x.yearBuilt,
        cert: x.certificate || '', desc: x.description || '',
        fac: (x.facilities || []).join(', '),
        lat: x.lat ?? null, lng: x.lng ?? null,
        owner: x.agentName || '—', leads: 0,
        promo: x.promo || '—', st: x.status,
        photos: (x.uploadedPhotos || []).map(u => ({ url: resolveFileUrl(u) })),
        fromDb: true,
      }));
      setItems(q => [...rows, ...q.filter(i => !rows.some(r2 => r2.id === i.id))]);
    }).catch(() => {}); // backend down → demo rows only
    return () => { on = false; };
  }, [mine]);

  const saveModal = async (f) => {
    const nPhoto = f.photos?.length || 0;
    if (modal.mode === 'new') {
      try {
        /* 1. Create the listing in the database */
        const { type, mode } = TY_MAP[f.ty] || TY_MAP['House · Sale'];
        const created = await apiAdmin(() => adminApi.post('/api/listings', {
          title: f.t, type, typeLabel: f.ty, mode,
          price: Number(f.price), address: f.addr || null,
          lat: f.lat ?? null, lng: f.lng ?? null,
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
        setItems(q => [{ id: dbId, ...f, price: Number(f.price), owner: f.owner || '—', leads: 0, fromDb: true }, ...q]);
        setNotice(L(
          `Listing "${f.t}" saved to the database (${dbId})${nPhoto ? ` with ${nPhoto} photo${nPhoto > 1 ? 's' : ''}` : ''} — now live on the public site.`,
          `Listing "${f.t}" tersimpan ke database (${dbId})${nPhoto ? ` dengan ${nPhoto} foto` : ''} — sudah tayang di situs publik.`));
      } catch (e) {
        setNotice(L(`Failed to save listing: ${e.message}`, `Gagal menyimpan listing: ${e.message}`));
        return;
      }
    } else {
      setItems(q => q.map(l => l.id === modal.id ? { ...l, ...f } : l));
      if (current?.fromDb) {
        try {
          await apiAdmin(() => adminApi.put(`/api/listings/${encodeURIComponent(modal.id)}`, {
            title: f.t, price: Number(f.price), address: f.addr || null, status: f.st,
            lat: f.lat ?? null, lng: f.lng ?? null,
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
      <PageHead
        title={mine ? L('My Listings', 'Listing Saya') : L('Listings', 'Manajemen Listing')}
        sub={mine ? L('Properties you listed. New listings go live on the public site immediately.', 'Properti yang Anda pasang. Listing baru langsung tayang di situs publik.')
          : L('All listings on the marketplace, from admins, agents, and owners.', 'Semua listing di marketplace, dari admin, agen, dan pemilik.')}
        actions={<>
          {!mine && <button className="p-btn p-btn-ghost p-btn-sm" onClick={onGoBulk}><PIcon name="doc" size={14} /> {L('Bulk upload', 'Unggah massal')}</button>}
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
            {showOwnerCol && <Th>{L('Owner', 'Pemilik')}</Th>}
            <Th right>{L('Leads', 'Prospek')}</Th><Th>Promo</Th><Th>Status</Th><Th> </Th>
          </tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid var(--line)' }}>
                <Td mono>{l.id}</Td>
                <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>{l.photos && l.photos.length ? <img src={l.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Photo2 kind={kindFor(l.ty)} seed={l.id} w={100} />}</div><div><div style={{ fontWeight: 600 }}>{l.t}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.ty}</div></div></div></Td>
                <Td mono bold>{fmtRp(l.price)}</Td>
                {showOwnerCol && <Td>{l.owner}</Td>}
                <Td right mono bold>{leadCounts[l.id] ?? 0}</Td>
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
                <td colSpan={showOwnerCol ? 8 : 7} style={{ padding: '22px 18px', textAlign: 'center', fontSize: 12.5, color: 'var(--muted)' }}>{mine && !items.length ? L('You have no listings yet — tap "New listing" to publish your first property.', 'Anda belum punya listing — tekan "Listing baru" untuk memasang properti pertama.') : L('No listings match this filter.', 'Tidak ada listing untuk filter ini.')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {modal && initialForm && (
        <ListingModal L={L} lang={lang} mode={modal.mode} initial={initialForm} lockOwner={mine} onClose={() => setModal(null)} onSave={saveModal} />
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

/* Ubah baris CSV tervalidasi → payload POST /api/listings. */
const BULK_TYPE_MAP = {
  rumah:     { type: 'property',   typeLabel: 'House · Sale' },
  apartemen: { type: 'apartment',  typeLabel: 'Apartment · Sale' },
  tanah:     { type: 'land',       typeLabel: 'Land · Sale' },
  villa:     { type: 'villa',      typeLabel: 'Villa · Sale' },
  ruko:      { type: 'commercial', typeLabel: 'Commercial · Sale' },
  gudang:    { type: 'commercial', typeLabel: 'Commercial · Sale' },
  kantor:    { type: 'commercial', typeLabel: 'Commercial · Sale' },
};
function csvToListings(rows) {
  const header = rows[0].map(h => h.trim().toLowerCase());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const g = (r, k) => (idx[k] != null ? (r[idx[k]] || '').trim() : '');
  const num = (v) => (v === '' ? null : Number(v));
  return rows.slice(1).filter(r =>
    g(r, 'title') && g(r, 'address') && /^\d+$/.test(g(r, 'price_idr')) && Number(g(r, 'price_idr')) > 0 && BULK_TYPE_MAP[g(r, 'type').toLowerCase()],
  ).map(r => {
    const tm = BULK_TYPE_MAP[g(r, 'type').toLowerCase()];
    return {
      title: g(r, 'title'), type: tm.type, typeLabel: tm.typeLabel, mode: 'sale',
      price: Number(g(r, 'price_idr')), address: g(r, 'address') || null, region: g(r, 'region') || null,
      area: num(g(r, 'land_m2')), buildingArea: num(g(r, 'building_m2')),
      beds: num(g(r, 'bedrooms')), baths: num(g(r, 'bathrooms')),
      certificate: g(r, 'certificate') || null, yearBuilt: num(g(r, 'year_built')),
      description: g(r, 'description') || null, status: 'live', source: 'portal',
    };
  });
}

const AdmBulk = ({ L }) => {
  const id = L('x', 'y') === 'y';
  const [queue, setQueue] = React.useState([]);
  const [publishing, setPublishing] = React.useState(false);
  const [notice, setNotice] = React.useState(null);
  const [expanded, setExpanded] = React.useState(null);
  const listingInput = React.useRef(null);

  const downloadListingTemplate = () =>
    downloadFile('assetra-template-listing.csv', LISTING_TEMPLATE_CSV, 'text/csv;charset=utf-8');

  /* Accepts File objects from either the picker or drag & drop. */
  const handleListingFiles = (files) => {
    for (const f of files) {
      if (/\.csv$/i.test(f.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          const parsed = parseCsv(String(reader.result));
          const { rows, errors } = validateListingsCsv(parsed, L);
          /* Baris valid tetap bisa diterbitkan; baris bermasalah dilaporkan. */
          const data = rows > 0 && !errors.some(e => /Kolom wajib hilang|Missing columns/.test(e)) ? csvToListings(parsed) : [];
          setQueue(q => [...q, { n: f.name, rows, valid: data.length, st: data.length ? 'ok' : 'error', errors, data }]);
        };
        reader.readAsText(f);
      } else {
        setQueue(q => [...q, { n: f.name, rows: '—', st: 'error', errors: [L('Unsupported format — use the CSV template', 'Format tidak didukung — gunakan template CSV')] }]);
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

  /* Drag & drop onto the dashed cards */
  const [dragIdx, setDragIdx] = React.useState(null);
  const onDrop = (i) => (e) => {
    e.preventDefault();
    setDragIdx(null);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    handleListingFiles(files);
    queueNotice(files);
  };

  /* Terbitkan: setiap baris CSV yang valid dikirim ke API → listing tayang di situs. */
  const publishValid = async () => {
    const ready = queue.filter(f => f.st === 'ok');
    if (!ready.length) { setNotice(L('Nothing valid to publish yet.', 'Belum ada berkas valid untuk dipublikasikan.')); return; }
    setPublishing(true);
    let okRows = 0; const failed = {};
    for (const f of ready) {
      failed[f.n] = [];
      for (let i = 0; i < f.data.length; i++) {
        try {
          const row = { ...f.data[i] };
          /* Geocode alamat → koordinat agar listing hasil upload massal ikut tampil di peta */
          if (HAS_MAPS_KEY && row.address && row.lat == null) {
            try { const g = await geocodeAddress(row.address); if (g) { row.lat = g.lat; row.lng = g.lng; } } catch { /* tanpa koordinat */ }
          }
          await apiAdmin(() => adminApi.post('/api/listings', row)); okRows++;
        }
        catch (e) { failed[f.n].push(L(`Row ${i + 2}: ${e.message}`, `Baris ${i + 2}: ${e.message}`)); }
      }
    }
    setQueue(q => q.map(f => f.st === 'ok'
      ? (failed[f.n]?.length ? { ...f, st: 'error', errors: failed[f.n] } : { ...f, st: 'published' })
      : f));
    setPublishing(false);
    const nFail = Object.values(failed).reduce((s, a) => s + a.length, 0);
    setNotice(nFail
      ? L(`${okRows} listing(s) published, ${nFail} row(s) failed — see details.`, `${okRows} listing terbit, ${nFail} baris gagal — lihat detail.`)
      : L(`${okRows} listing(s) published and live on the public site.`, `${okRows} listing terbit dan sudah tayang di situs publik.`));
  };

  const cards = [
    { ic: 'doc', t: L('Listings (CSV)', 'Listing (CSV)'),
      s: L('Up to 500 rows · required columns: title, type, price_idr, address. Add photos afterwards via Listings → Edit.', 'Maks 500 baris · kolom wajib: title, type, price_idr, address. Foto ditambahkan setelahnya lewat Listing → Edit.'),
      pick: () => listingInput.current?.click(), tpl: downloadListingTemplate,
      tplLabel: L('Download CSV template', 'Unduh template CSV') },
  ];

  return (
    <>
      <PageHead title={L('Bulk Upload', 'Unggah Massal')} sub={L('Upload many listings at once from a CSV file. Valid rows go live on the public site when you publish.', 'Unggah banyak listing sekaligus dari file CSV. Baris yang valid tayang di situs publik saat dipublikasikan.')} />
      <input ref={listingInput} type="file" accept=".csv" style={{ display: 'none' }} onChange={onListingFile} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 22 }}>
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
          <button className="p-btn p-btn-primary p-btn-sm" disabled={publishing} onClick={publishValid}><PIcon name="check" size={14} /> {publishing ? L('Publishing…', 'Menerbitkan…') : L('Publish all valid', 'Publikasikan yang valid')}</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('File', 'Berkas')}</Th><Th right>{L('Records', 'Catatan')}</Th><Th>Status</Th><Th> </Th></tr></thead>
          <tbody>
            {queue.map((f, i) => (
              <React.Fragment key={i}>
                <tr style={{ borderTop: '1px solid var(--line)' }}>
                  <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><PIcon name="doc" size={16} /> <span style={{ fontWeight: 600 }}>{f.n}</span></div></Td>
                  <Td right mono>{f.rows}</Td>
                  <Td>
                    {f.st === 'ok' ? <Pill tone={f.errors?.length ? 'review' : 'live'}>✓ {f.valid}/{f.rows} {L('ready', 'siap')}{f.errors?.length ? ` · ${f.errors.length} ${L('skipped', 'dilewati')}` : ''}</Pill>
                      : f.st === 'published' ? <Pill tone="live">✓ {L('Published', 'Terbit')}</Pill>
                      : f.st === 'processing' ? <Pill tone="review">{L('Processing', 'Memproses')}…</Pill>
                      : <Pill tone="hot">✕ {f.errors.length} {L('errors', 'error')}</Pill>}
                  </Td>
                  <Td right>
                    {f.errors?.length > 0 && (
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
const BANNER_PLACEMENTS = [
  { id: 'home-leaderboard',   nEn: 'Home — Leaderboard',        nId: 'Beranda — Leaderboard',        size: '1400 × 160 px' },
  { id: 'home-box',           nEn: 'Home — Side Box',           nId: 'Beranda — Kotak Samping',      size: '720 × 760 px' },
  { id: 'search-leaderboard', nEn: 'Search — Leaderboard',      nId: 'Pencarian — Leaderboard',      size: '1400 × 160 px' },
  { id: 'search-box',         nEn: 'Search — Sidebar Box',      nId: 'Pencarian — Kotak Sidebar',    size: '720 × 520 px' },
  { id: 'detail-box',         nEn: 'Listing Detail — Side Box', nId: 'Detail Listing — Kotak Samping', size: '720 × 540 px' },
];

const AdmAds = ({ L }) => {
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
      setBNotice(L('Banner removed — the slot is now hidden on the public site.', 'Banner dihapus — slot disembunyikan di situs publik.'));
    } catch (e) {
      setBNotice(L(`Failed to remove: ${e.message}`, `Gagal menghapus: ${e.message}`));
    }
  };
  const bPlacement = bModal ? BANNER_PLACEMENTS.find(x => x.id === bModal) : null;

  return (
    <>
      {/* ── Banner per penempatan ── */}
      <div>
        <PageHead
          title={L('Ad Banners', 'Banner Iklan')}
          sub={L('Upload a banner per ad slot on the public site. Empty slots are hidden. Clicks open your link and are counted below.', 'Unggah banner untuk tiap slot iklan di situs publik. Slot kosong disembunyikan. Klik pengunjung membuka tautan Anda dan dihitung di bawah.')}
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
                        : <span style={{ fontSize: 12, color: 'var(--muted)' }}>{L('Empty — slot hidden', 'Kosong — slot disembunyikan')}</span>}
                    </Td>
                    <Td>
                      {cur
                        ? <a href={cur.linkUrl} target="_blank" rel="noopener noreferrer" className="p-link" style={{ fontSize: 12, maxWidth: 180, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{cur.linkUrl.replace(/^https?:\/\//, '')}</a>
                        : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </Td>
                    <Td right mono bold>{cur ? totalClicks(p.id).toLocaleString('id-ID') : '—'}</Td>
                    <Td>{cur ? <Pill tone="live">● Live</Pill> : <Pill tone="draft">{L('Empty', 'Kosong')}</Pill>}</Td>
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
          </>
  );
};

/* ── Leads / Prospek (admin + agent) ── */
const LEAD_SRC = { whatsapp: () => 'WhatsApp', call: L => L('Call', 'Telepon'), survey: L => L('Site survey', 'Survei'), ai: L => L('AI consultant', 'Konsultan AI') };
const AdmLeads = ({ L, persona }) => {
  const [leads, setLeads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const load = React.useCallback(() => {
    setLoading(true);
    apiAdmin(() => adminApi.get('/api/leads'))
      .then(r => setLeads(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const setStatus = (lead, st) => {
    setLeads(q => q.map(x => x.id === lead.id ? { ...x, status: st } : x));
    apiAdmin(() => adminApi.post(`/api/leads/${lead.id}/status`, { status: st })).catch(() => {});
  };
  const srcLabel = (t) => (LEAD_SRC[t] || LEAD_SRC.whatsapp)(L);
  const stLabel = (st) => st === 'new' ? L('New', 'Baru') : st === 'contacted' ? L('Contacted', 'Dihubungi') : L('Closed', 'Selesai');
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const today = leads.filter(l => l.createdAt >= dayStart.getTime()).length;
  const openCount = leads.filter(l => l.status === 'new').length;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('Total leads', 'Total prospek')} val={loading ? '…' : String(leads.length)} delta={L('all time', 'sepanjang waktu')} color="var(--muted)" />
        <Kpi label={L('New (today)', 'Baru (hari ini)')} val={loading ? '…' : String(today)} delta={L('captured today', 'masuk hari ini')} />
        <Kpi label={L('Awaiting follow-up', 'Menunggu tindak lanjut')} val={loading ? '…' : String(openCount)} delta={L('status: new', 'status: baru')} color="var(--red)" />
        <Kpi label={L('Closed', 'Selesai')} val={loading ? '…' : String(leads.filter(l => l.status === 'closed').length)} delta={L('completed', 'tuntas')} color="var(--muted)" />
      </div>
      <PageHead title={L('Leads', 'Prospek')} sub={persona !== 'admin' ? L('Buyers who tapped WhatsApp, call, or survey on one of your listings. Respond fast to convert.', 'Pembeli yang menekan tombol WhatsApp, telepon, atau survei di listing Anda. Respons cepat untuk konversi.') : L('Inbound enquiries auto-captured from contact buttons across the site.', 'Pertanyaan masuk yang tertangkap otomatis dari tombol kontak di seluruh situs.')} actions={<button className="p-btn p-btn-ghost p-btn-sm" onClick={() => downloadFile('assetra-leads.csv', '\uFEFFname,phone,property,source,status,created_at\n' + leads.map(l => `"${l.name || ''}","${l.phone || ''}","${l.listingTitle || ''}",${l.type},${l.status},${new Date(l.createdAt).toISOString()}`).join('\n') + '\n', 'text/csv;charset=utf-8')}><PIcon name="globe" size={14} /> {L('Export', 'Ekspor')}</button>} />
      <Card>
        {leads.length === 0 ? (
          <div style={{ padding: '28px 18px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>{loading ? L('Loading…', 'Memuat…') : L('No leads yet. When visitors tap WhatsApp / Call / Survey on a listing, they appear here.', 'Belum ada prospek. Saat pengunjung menekan WhatsApp / Telepon / Survei pada listing, mereka muncul di sini.')}</div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Buyer', 'Pembeli')}</Th><Th>{L('Interested in', 'Tertarik pada')}</Th><Th>{L('Source', 'Sumber')}</Th><Th>{L('When', 'Kapan')}</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {leads.map((l) => {
              const nm = l.name || L('Anonymous', 'Anonim');
              return (
              <tr key={l.id} style={{ borderTop: '1px solid var(--line)' }}>
                <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600 }}>{nm.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</div><div><div style={{ fontWeight: 600 }}>{nm}</div>{l.phone && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{l.phone}</div>}</div></div></Td>
                <Td>{l.listingTitle || '—'}</Td>
                <Td>{srcLabel(l.type)}</Td>
                <Td mono>{timeAgo(l.createdAt, L)}</Td>
                <Td>
                  <select value={l.status} onChange={e => setStatus(l, e.target.value)} style={{ fontSize: 12, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)' }}>
                    <option value="new">{stLabel('new')}</option>
                    <option value="contacted">{stLabel('contacted')}</option>
                    <option value="closed">{stLabel('closed')}</option>
                  </select>
                </Td>
                <Td right><button className="p-btn p-btn-cyan p-btn-sm" onClick={() => window.open('https://wa.me/' + (l.phone ? l.phone.replace(/[^\d]/g, '') : '') + '?text=' + encodeURIComponent(L(
                  `Hello${l.name ? ' ' + l.name : ''}, this is Assetra following up on your enquiry${l.listingTitle ? ` about "${l.listingTitle}"` : ''}. When would be a good time for a viewing?`,
                  `Halo${l.name ? ' ' + l.name : ''}, kami dari Assetra menindaklanjuti minat Anda${l.listingTitle ? ` pada "${l.listingTitle}"` : ''}. Kapan waktu yang pas untuk survei lokasi?`)), '_blank')}><PIcon name="chat" size={13} /> WA</button></Td>
              </tr>
            );})}
          </tbody>
        </table>
        )}
      </Card>
    </>
  );
};

/* ── KPR Applications (admin + agent) ── */
const AdmKpr = ({ L }) => {
  const [apps, setApps] = React.useState([]);
  const [sel, setSel] = React.useState(null); // index of app opened in detail modal

  /* Muat pengajuan dari database. */
  React.useEffect(() => {
    apiAdmin(() => adminApi.get('/api/kpr')).then(r => {
      const rows = (r.data || []).map(a => ({
        dbId: a.id,
        name: a.name,
        phone: a.phone,
        email: a.email,
        income: a.income,
        prop: a.propertyPrice ? `Simulasi ${fmtRp(a.propertyPrice)}` : 'Pra-persetujuan',
        loan: a.loanAmount || 0,
        bank: a.bank || 'Semua bank',
        dp: a.propertyPrice && a.downPayment ? `${Math.round(a.downPayment / a.propertyPrice * 100)}%` : '—',
        st: a.status,
      }));
      setApps(rows);
    }).catch(() => {});
  }, []);
  const tone = { approved: 'live', review: 'review', submitted: 'new', rejected: 'hot' };
  const stLabel = (st) => st === 'approved' ? L('Approved', 'Disetujui') : st === 'review' ? L('Review', 'Tinjauan') : st === 'submitted' ? L('Submitted', 'Diajukan') : L('Rejected', 'Ditolak');
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <Kpi label={L('Applications', 'Pengajuan')} val={String(apps.length)} delta={L(`${apps.filter(a => a.st === 'submitted').length} new`, `${apps.filter(a => a.st === 'submitted').length} baru`)} />
        <Kpi label={L('Approved', 'Disetujui')} val={String(apps.filter(a => a.st === 'approved').length)} delta={apps.length ? `${Math.round(apps.filter(a => a.st === 'approved').length / apps.length * 100)}%` : '—'} color="var(--green)" />
        <Kpi label={L('In review', 'Dalam tinjauan')} val={String(apps.filter(a => a.st === 'review').length)} delta={L('Awaiting bank', 'Menunggu bank')} color="var(--gold-2)" />
        <Kpi label={L('Total financed', 'Total dibiayai')} val={fmtRp(apps.filter(a => a.st === 'approved').reduce((t, a) => t + (a.loan || 0), 0))} delta={L('approved loans', 'pinjaman disetujui')} />
      </div>
      <PageHead title={L('KPR Applications', 'Pengajuan KPR')} sub={L('Mortgage pre-approvals routed to partner banks.', 'Pra-persetujuan KPR diteruskan ke bank mitra.')} />
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--paper-2)' }}><Th>{L('Applicant', 'Pemohon')}</Th><Th>{L('Property', 'Properti')}</Th><Th right>{L('Loan amount', 'Jumlah pinjaman')}</Th><Th>{L('Bank', 'Bank')}</Th><Th>DP</Th><Th>Status</Th><Th right> </Th></tr></thead>
          <tbody>
            {apps.length === 0 && (
              <tr style={{ borderTop: '1px solid var(--line)' }}><td colSpan={7} style={{ padding: '22px 18px', textAlign: 'center', fontSize: 12.5, color: 'var(--muted)' }}>{L('No applications yet — they arrive from the Financing page.', 'Belum ada pengajuan — pengajuan masuk dari halaman Pembiayaan.')}</td></tr>
            )}
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
              <select style={inputStyle} value={apps[sel].st} onChange={e => {
                const st = e.target.value;
                const cur = apps[sel];
                setApps(q => q.map((a, j) => j === sel ? { ...a, st } : a));
                /* Pengajuan nyata (punya dbId) → simpan status ke database. */
                if (cur.dbId) apiAdmin(() => adminApi.post(`/api/kpr/${cur.dbId}/status`, { status: st })).catch(() => {});
              }}>
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

const AdmAgents = ({ L, persona }) => {
  const [agents, setAgents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [edit, setEdit] = React.useState(null); // agen yang sedang di-edit, {} = tambah baru, null = tutup
  const [dialog, setDialog] = React.useState(null);
  const dlgLang = L('en', 'id');
  const canManage = persona === 'admin';

  const load = React.useCallback(() => {
    setLoading(true);
    apiAdmin(() => adminApi.get('/api/agents/manage'))
      .then(r => setAgents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const remove = (a) => {
    setDialog({
      icon: 'lock', danger: true,
      title: L('Delete agent', 'Hapus agen'),
      message: L(`Delete agent "${a.name}"? This cannot be undone.`, `Hapus agen "${a.name}"? Tindakan ini tidak dapat dibatalkan.`),
      primary: L('Delete', 'Hapus'),
      cancel: L('Cancel', 'Batal'),
      onPrimary: async () => {
        await apiAdmin(() => adminApi.del(`/api/agents/${a.id}`)).catch(() => {});
        load();
      },
    });
  };

  return (
    <>
      <PageHead title={L('Agents', 'Agen')} sub={persona === 'agent' ? L('Your team & territory performance.', 'Performa tim & teritori Anda.') : L('Field agents executing viewings, paperwork & negotiation.', 'Agen lapangan: survei, dokumen & negosiasi.')} actions={canManage ? <button className="p-btn p-btn-primary p-btn-sm" onClick={() => setEdit({})}><PIcon name="plus" size={14} /> {L('Add agent', 'Tambah agen')}</button> : null} />
      {loading && <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>{L('Loading…', 'Memuat…')}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {agents.map((a) => (
          <div key={a.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 20, position: 'relative' }}>
            {canManage && (
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                <button onClick={() => setEdit(a)} title={L('Edit', 'Ubah')} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}><PIcon name="edit" size={13} /></button>
                <button onClick={() => remove(a)} title={L('Delete', 'Hapus')} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hot, #c0392b)' }}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <AgentAvatar name={a.name} photo={a.photo} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.area || '—'}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', marginTop: 3, color: a.status === 'live' ? 'var(--green)' : 'var(--gold-2)' }}>{a.status === 'live' ? L('LIVE', 'AKTIF') : L('REVIEW', 'TINJAUAN')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 12 }}>
              <div><div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{a.deals}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{L('DEALS', 'TRANSAKSI')}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--gold-2)' }}>★ {a.rating ?? '—'}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{L('RATING', 'PERINGKAT')}</div></div>
            </div>
          </div>
        ))}
      </div>
      {edit && <AdmAgentForm L={L} agent={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
      <AppDialog dialog={dialog} onClose={() => setDialog(null)} lang={dlgLang} />
    </>
  );
};

/* Form tambah/ubah agen — termasuk unggah & ganti foto. */
const AdmAgentForm = ({ L, agent, onClose, onSaved }) => {
  const isNew = !agent.id;
  const [f, setF] = React.useState({
    name: agent.name || '', area: agent.area || '', phone: agent.phone || '',
    status: agent.status || 'review', deals: agent.deals ?? 0, rating: agent.rating ?? '',
  });
  const [photo, setPhoto] = React.useState(agent.photo || null); // data URL atau null
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const fileRef = React.useRef(null);
  const valid = f.name.trim();

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr('');
    if (file.size > 5 * 1024 * 1024) { setErr(L('Photo is larger than 5 MB — please choose a smaller file.', 'Foto lebih dari 5 MB — pilih berkas yang lebih kecil.')); return; }
    try {
      const dataUrl = await resizeToAvatarDataUrl(file, 320);
      setPhoto(dataUrl);
    } catch (ex) { setErr(ex.message || L('Failed to read image', 'Gagal membaca gambar')); }
  };

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setErr('');
    const body = {
      name: f.name.trim(), area: f.area.trim() || null, phone: f.phone.trim() || null,
      status: f.status, deals: Number(f.deals) || 0,
      rating: f.rating === '' ? null : Number(f.rating),
      photo, // data URL, atau null untuk hapus foto
    };
    try {
      if (isNew) await apiAdmin(() => adminApi.post('/api/agents', body));
      else await apiAdmin(() => adminApi.put(`/api/agents/${agent.id}`, body));
      onSaved();
    } catch (ex) {
      setErr(ex?.message || L('Failed to save', 'Gagal menyimpan'));
      setBusy(false);
    }
  };

  return (
    <Modal title={isNew ? L('Add Agent', 'Tambah Agen') : L('Edit Agent', 'Ubah Agen')} onClose={onClose}>
      {/* Foto */}
      <FieldRow label={L('Photo', 'Foto')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AgentAvatar name={f.name} photo={photo} size={64} />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickPhoto} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => fileRef.current?.click()}>
              <PIcon name="cam" size={14} /> {photo ? L('Change', 'Ganti') : L('Upload', 'Unggah')}
            </button>
            {photo && <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setPhoto(null)}>{L('Remove', 'Hapus')}</button>}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{L('Recommended: square 1:1, at least 400×400px, face centered. JPG / PNG, max 5 MB — auto-cropped & resized to 320px.', 'Rekomendasi: kotak 1:1, minimal 400×400px, wajah di tengah. JPG / PNG, maks 5 MB — otomatis dipotong kotak & diperkecil ke 320px.')}</div>
      </FieldRow>
      <FieldRow label={L('Full name *', 'Nama lengkap *')}>
        <input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="cth. Andi Prasetyo" />
      </FieldRow>
      <FieldRow label={L('Territory / area', 'Teritori / area')}>
        <input style={inputStyle} value={f.area} onChange={e => setF({ ...f, area: e.target.value })} placeholder="cth. Bandung" />
      </FieldRow>
      <FieldRow label={L('WhatsApp / phone', 'WhatsApp / telepon')}>
        <input style={inputStyle} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="cth. 08123456789" />
      </FieldRow>
      <div style={{ display: 'flex', gap: 12 }}>
        <FieldRow label={L('Deals', 'Transaksi')}>
          <input type="number" style={inputStyle} value={f.deals} onChange={e => setF({ ...f, deals: e.target.value })} />
        </FieldRow>
        <FieldRow label={L('Rating', 'Peringkat')}>
          <input type="number" step="0.1" min="0" max="5" style={inputStyle} value={f.rating} onChange={e => setF({ ...f, rating: e.target.value })} placeholder="4.9" />
        </FieldRow>
      </div>
      <FieldRow label={L('Status', 'Status')}>
        <select style={inputStyle} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
          <option value="live">{L('Live (visible)', 'Aktif (tampil)')}</option>
          <option value="review">{L('Review', 'Tinjauan')}</option>
        </select>
      </FieldRow>
      {err && <div style={{ fontSize: 12, color: 'var(--hot, #c0392b)', marginBottom: 8 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button className="p-btn p-btn-ghost p-btn-sm" onClick={onClose}>{L('Cancel', 'Batal')}</button>
        <button className="p-btn p-btn-primary p-btn-sm" disabled={!valid || busy} style={(!valid || busy) ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={submit}><PIcon name="check" size={14} /> {busy ? L('Saving…', 'Menyimpan…') : (isNew ? L('Add agent', 'Tambah agen') : L('Save changes', 'Simpan perubahan'))}</button>
      </div>
    </Modal>
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
export default PortalAdmin;
