/* Portal shared — property icons, nav, footer, cards, ad slots, data */
import React from 'react';
import { useT } from '../i18n';
import { Logo2, Photo2 } from '../shared-v2';
import { api, resolveFileUrl } from '../api/client';
import { useUser, useActions } from '../store';

const PIcon = ({ name, size = 16, stroke = 1.7 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0 } };
  switch (name) {
    case 'bed': return <svg {...p}><path d="M2 17V7M2 11h20a0 0 0 0 1 0 0v6M22 17v-3M2 14h20M6 11V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/></svg>;
    case 'bath': return <svg {...p}><path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM7 6h.01M6 19l-1 2M19 19l1 2"/></svg>;
    case 'area': return <svg {...p}><path d="M21 3H3v18M3 3l6 6M21 3v6h-6"/></svg>;
    case 'ruler': return <svg {...p}><path d="M3 21h18M3 21V3m0 18l4-4M3 13l3 0M3 9l3 0M3 17l3 0M21 3H3m18 0v18m0-18l-4 4M11 3v3M15 3v3M7 3v3"/></svg>;
    case 'heart': return <svg {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/></svg>;
    case 'star': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'pin': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case 'cam': return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>;
    case 'home': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'building': return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>;
    case 'land': return <svg {...p}><path d="M2 22h20M4 22V8l8-5 8 5v14M2 11l10-6 10 6"/></svg>;
    case 'shop': return <svg {...p}><path d="M3 9l1-5h16l1 5M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 21v-6h6v6"/></svg>;
    case 'villa': return <svg {...p}><path d="M2 20h20M4 20v-8l8-6 8 6v8M9 20v-5h6v5"/><path d="M3 12l9-7 9 7"/></svg>;
    case 'plus': return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'arrowR': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'chevD': return <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'chevR': return <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>;
    case 'phone': return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'chat': return <svg {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>;
    case 'check': return <svg {...p} strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>;
    case 'x': return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'calc': return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>;
    case 'bank': return <svg {...p}><path d="M3 9l9-6 9 6M4 9v11M20 9v11M2 20h20M8 9v11M12 9v11M16 9v11"/></svg>;
    case 'cash': return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>;
    case 'doc': return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'trend': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    case 'bolt': return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'eye': return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'edit': return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
    case 'megaphone': return <svg {...p}><path d="M3 11l18-5v12L3 14v-3zM3 11v3a2 2 0 0 0 2 2h1M11 17.5a2 2 0 0 1-4 0v-3.5"/></svg>;
    case 'users': return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'dash': return <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case 'bell': return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'globe': return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    default: return null;
  }
};

const fmtRp = (n) => {
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 2).replace(/\.?0+$/, '').replace('.', ',') + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(0) + ' jt';
  return 'Rp ' + n.toLocaleString('id-ID');
};
const fmtRpFull = (n) => 'Rp ' + n.toLocaleString('id-ID');

/* ── Nav ── */
const PortalNav = ({ active, lang, onLang, onNav }) => {
  const { t } = useT();
  const user = useUser();
  const actions = useActions();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);
  const firstName = (user?.name || user?.email || '').split(/[\s@]/)[0];
  const initials = (user?.name || user?.email || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const links = [
    { id: 'buy', label: t('p.nav.buy') }, { id: 'rent', label: t('p.nav.rent') }, { id: 'new', label: t('p.nav.new') },
    { id: 'finance', label: t('p.nav.finance') }, { id: 'ai', label: t('p.nav.ai'), icon: 'sparkle' }, { id: 'advertise', label: t('p.nav.advertise') },
  ];
  return (
    <>
      <nav className="p-nav"><div className="pwrap p-nav-inner">
        <span onClick={() => onNav && onNav('home')} style={{ cursor: 'pointer' }}><Logo2 size={30} /></span>
        <div className="p-nav-links">
          {links.map(l => (
            <span key={l.id} className={`p-nav-link ${active === l.id ? 'active' : ''}`} onClick={() => onNav && onNav(l.id)}>
              {l.icon && <PIcon name={l.icon} size={14} />}{l.label}
            </span>
          ))}
        </div>
        <div className="p-nav-spacer" />
        <div className="p-nav-cta">
          {onLang && (
            <button
              onClick={() => onLang(lang === 'id' ? 'en' : 'id')}
              style={{ border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-2)', padding: '6px 10px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 6 }}
            >{lang === 'id' ? 'ID' : 'EN'}</button>
          )}
          {user ? (
            /* ── sudah masuk: sapaan + menu akun ── */
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid var(--line)', background: '#fff', borderRadius: 100, padding: '5px 13px 5px 5px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {user.picture
                  ? <img src={user.picture} alt="" referrerPolicy="no-referrer" style={{ width: 30, height: 30, borderRadius: '50%', display: 'block' }} />
                  : <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>{initials}</span>}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lang === 'id' ? 'Halo, ' : 'Hi, '}{firstName}
                </span>
                <PIcon name="chevD" size={13} />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 224, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 12px 34px rgba(10,22,64,0.14)', overflow: 'hidden', zIndex: 60 }}>
                  <div style={{ padding: '12px 15px', borderBottom: '1px solid var(--line-2)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{user.name || firstName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    {user.emailVerified && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--green, #2D8A6F)', background: 'rgba(45,138,111,0.1)', padding: '2px 7px', borderRadius: 4 }}>
                        <PIcon name="check" size={10} /> {lang === 'id' ? 'TERVERIFIKASI' : 'VERIFIED'}
                      </div>
                    )}
                  </div>
                  {user.role === 'admin' && (
                    <div onClick={() => { setMenuOpen(false); onNav && onNav('admin'); }} style={{ padding: '11px 15px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, color: 'var(--ink-2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <PIcon name="dash" size={15} /> {lang === 'id' ? 'Dasbor Admin' : 'Admin Dashboard'}
                    </div>
                  )}
                  <div onClick={() => { setMenuOpen(false); actions.logout(); onNav && onNav('home'); }} style={{ padding: '11px 15px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, color: 'var(--red, #C14545)', borderTop: '1px solid var(--line-2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(193,69,69,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <PIcon name="x" size={14} /> {lang === 'id' ? 'Keluar' : 'Sign out'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => onNav && onNav('signin')}>{t('p.nav.signin')}</button>
          )}
          <button className="p-btn p-btn-cyan p-btn-sm" onClick={() => onNav && onNav('sell')}><PIcon name="plus" size={14} /> {t('p.nav.sell')}</button>
        </div>
      </div></nav>
    </>
  );
};

/* ── Footer ── */
const PortalFooter = () => {
  const { t } = useT();
  return (
    <footer className="p-footer"><div className="pwrap">
      <div className="p-footer-grid">
        <div className="p-footer-col">
          <Logo2 size={30} dark />
          <p style={{ fontSize: 13, color: 'rgba(250,250,247,0.6)', marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>{t('p.foot.tagline')}</p>
        </div>
        <div className="p-footer-col"><h4>{t('p.foot.explore')}</h4>
          <a>{t('p.foot.buy')}</a><a>{t('p.foot.rent')}</a><a>{t('p.foot.new')}</a><a>{t('p.foot.areas')}</a></div>
        <div className="p-footer-col"><h4>{t('p.foot.services')}</h4>
          <a>{t('p.foot.kpr')}</a><a>{t('p.foot.ai')}</a><a>{t('p.foot.valuation')}</a><a>{t('p.foot.agents')}</a></div>
        <div className="p-footer-col"><h4>{t('p.foot.business')}</h4>
          <a>{t('p.foot.advertise')}</a><a>{t('p.foot.agentSub')}</a><a>{t('p.foot.devSub')}</a><a>{t('p.foot.api')}</a></div>
        <div className="p-footer-col"><h4>{t('p.foot.company')}</h4>
          <a>{t('p.foot.about')}</a><a>{t('p.foot.careers')}</a><a>{t('p.foot.press')}</a><a>{t('p.foot.contact')}</a></div>
      </div>
      <div className="p-footer-bottom"><span>{t('p.foot.legal')}</span></div>
    </div></footer>
  );
};

/* ── Listing card ── */
const PCard = ({ l, onNav }) => {
  const { t } = useT();
  const modeTag = l.mode === 'rent' ? { c: 'rent', label: t('p.nav.rent') } : l.mode === 'new' ? { c: 'new', label: 'NEW' } : { c: 'sale', label: t('p.nav.buy') };
  return (
    <div className="p-card" onClick={() => onNav && onNav('detail', l)}>
      <div className="p-card-media">
        {l.img
          ? <img src={l.img} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <Photo2 kind={l.kind} seed={`portal-${l.id}`} />}
        <div className="p-card-tags">
          <span className={`p-tag ${modeTag.c}`}>{modeTag.label}</span>
          {l.sponsored && <span className="p-tag sponsor">★ Sponsored</span>}
          {l.featured && !l.sponsored && <span className="p-tag featured">Featured</span>}
        </div>
        <button className="p-card-fav" onClick={(e) => e.stopPropagation()}><PIcon name="heart" size={15} /></button>
        <div className="p-card-count"><PIcon name="cam" size={11} /> {l.photos}</div>
      </div>
      <div className="p-card-body">
        <div className="p-card-price">{l.mode === 'rent' ? <>{fmtRp(l.price)}<small>{t('p.card.month')}</small></> : l.mode === 'new' ? <><small>{t('p.card.starting')} </small>{fmtRp(l.price)}</> : fmtRp(l.price)}</div>
        <div className="p-card-title">{l.title}</div>
        <div className="p-card-addr"><PIcon name="pin" size={12} /> {l.addr}</div>
        <div className="p-card-specs">
          {l.beds != null && <span className="p-spec"><PIcon name="bed" size={15} /> {l.beds} {t('p.beds')}</span>}
          {l.baths != null && <span className="p-spec"><PIcon name="bath" size={15} /> {l.baths} {t('p.baths')}</span>}
          {l.area != null && <span className="p-spec"><PIcon name="ruler" size={15} /> {l.area} {t('p.area')}</span>}
        </div>
      </div>
      <div className="p-card-agent">
        <div className="p-card-agent-av">{l.agentInit}</div>
        <div style={{ minWidth: 0 }}>
          <div className="p-card-agent-name">{l.agent}</div>
          <div className="p-card-agent-co">{l.agency}</div>
        </div>
      </div>
    </div>
  );
};

/* ── Ad slot — Indonesian bank KPR banners ── */
const AD_BANKS = {
  bca: {
    name: 'BCA', full: 'Bank Central Asia',
    bg: 'linear-gradient(100deg, #00369E 0%, #0055C8 55%, #1B74E0 100%)',
    accent: '#FFFFFF', cta: '#FFD100', ctaInk: '#00369E',
    headline: { en: 'KPR BCA Fix & Cap', id: 'KPR BCA Fix & Cap' },
    tag: { en: 'Fixed 3.85% for the first 3 years. No appraisal fee until 31 Aug.', id: 'Fix 3,85% untuk 3 tahun pertama. Gratis biaya appraisal s.d. 31 Agu.' },
    rate: '3.85%', rateNote: { en: 'fixed 3 yr', id: 'fix 3 thn' },
  },
  mandiri: {
    name: 'mandiri', full: 'Bank Mandiri',
    bg: 'linear-gradient(100deg, #003D79 0%, #00529C 60%, #0A6ABF 100%)',
    accent: '#FFB700', cta: '#FFB700', ctaInk: '#003D79',
    headline: { en: 'Mandiri KPR Milenial', id: 'Mandiri KPR Milenial' },
    tag: { en: 'DP from 0% for first-home buyers. Tenor up to 30 years.', id: 'DP mulai 0% untuk rumah pertama. Tenor hingga 30 tahun.' },
    rate: '4.25%', rateNote: { en: 'fixed 5 yr', id: 'fix 5 thn' },
  },
  btn: {
    name: 'BTN', full: 'Bank Tabungan Negara',
    bg: 'linear-gradient(100deg, #F58220 0%, #F89C3D 60%, #FBB040 100%)',
    accent: '#003B71', cta: '#003B71', ctaInk: '#fff',
    headline: { en: 'KPR BTN Subsidi & Platinum', id: 'KPR BTN Subsidi & Platinum' },
    tag: { en: 'The home-loan bank of Indonesia — 5% flat for subsidized homes.', id: 'Bank-nya KPR Indonesia — 5% flat untuk rumah subsidi.' },
    rate: '5.00%', rateNote: { en: 'flat subsidi', id: 'flat subsidi' },
  },
  bri: {
    name: 'BRI', full: 'Bank Rakyat Indonesia',
    bg: 'linear-gradient(100deg, #00468E 0%, #0054A6 55%, #0A69C4 100%)',
    accent: '#F37021', cta: '#F37021', ctaInk: '#fff',
    headline: { en: 'KPR BRI Suku Bunga Spesial', id: 'KPR BRI Suku Bunga Spesial' },
    tag: { en: 'Special 3.65% rate for Assetra listings. Approval in 3 days.', id: 'Bunga spesial 3,65% untuk listing Assetra. Persetujuan 3 hari.' },
    rate: '3.65%', rateNote: { en: 'fixed 1 yr', id: 'fix 1 thn' },
  },
  cimb: {
    name: 'CIMB NIAGA', full: 'CIMB Niaga',
    bg: 'linear-gradient(100deg, #7A0C1E 0%, #A50F2D 55%, #C41230 100%)',
    accent: '#fff', cta: '#fff', ctaInk: '#A50F2D',
    headline: { en: 'KPR X-Tra Fleksi', id: 'KPR X-Tra Fleksi' },
    tag: { en: 'Pay interest only for the first 2 years. Refinancing welcome.', id: 'Bayar bunga saja 2 tahun pertama. Refinancing dipersilakan.' },
    rate: '4.50%', rateNote: { en: 'floating cap', id: 'floating cap' },
  },
};

const BankWordmark = ({ b, size = 17 }) => (
  <span style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: size, letterSpacing: b.name === 'mandiri' ? '-0.02em' : '0.04em', color: '#fff', fontStyle: b.name === 'mandiri' ? 'italic' : 'normal', lineHeight: 1 }}>
    {b.name}
  </span>
);

/* ── Custom ad banners (managed from the admin back office) ── */
let bannersPromise = null;
function fetchActiveBanners() {
  if (!bannersPromise) {
    bannersPromise = api.get('/api/banners/active').then(r => r.data || {}).catch(() => ({}));
  }
  return bannersPromise;
}
function useActiveBanners() {
  const [banners, setBanners] = React.useState(null);
  React.useEffect(() => {
    let on = true;
    fetchActiveBanners().then(b => { if (on) setBanners(b); });
    return () => { on = false; };
  }, []);
  return banners;
}

const AdSlot = ({ variant = 'leaderboard', bank = 'bca', placement, style }) => {
  const { t, lang } = useT();
  const b = AD_BANKS[bank] || AD_BANKS.bca;
  const lx = (o) => (lang === 'id' ? o.id : o.en);
  const banners = useActiveBanners();
  const custom = placement && banners ? banners[placement] : null;

  /* Admin-uploaded banner: full-bleed image, opens link + records the click. */
  if (custom) {
    const openBanner = () => {
      api.post(`/api/banners/${custom.id}/click`).catch(() => {}); // beacon — jangan blokir navigasi
      window.open(custom.linkUrl, '_blank', 'noopener');
    };
    return (
      <div
        className={`p-ad ${variant === 'leaderboard' ? 'p-ad-leaderboard' : ''}`}
        onClick={openBanner}
        title={custom.title || 'Iklan'}
        style={{ ...style, border: 'none', padding: 0, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
      >
        <img src={resolveFileUrl(custom.imagePath)} alt={custom.title || 'Iklan'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <span style={{ position: 'absolute', top: 6, right: 8, fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em', color: '#fff', background: 'rgba(10,22,64,0.55)', padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase' }}>{t('p.ad.label')}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-ad" style={{ ...style, background: b.bg, border: 'none', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <svg aria-hidden="true" style={{ position: 'absolute', right: -40, top: -55, opacity: 0.14 }} width="160" height="160" viewBox="0 0 220 220" fill="none" stroke="#fff"><circle cx="110" cy="110" r="105" strokeWidth="1.4" /><circle cx="110" cy="110" r="70" strokeWidth="1.4" /></svg>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, width: '100%', height: '100%', padding: '0 16px' }}>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <BankWordmark b={b} size={14} />
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 14, color: '#fff', margin: '3px 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lx(b.headline)}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--mono)' }}>{b.rate} {lx(b.rateNote)}</div>
          </div>
          <button className="p-btn p-btn-sm" style={{ background: b.cta, color: b.ctaInk, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, padding: '7px 13px', fontSize: 12 }}>{lang === 'id' ? 'Ajukan' : 'Apply'} →</button>
        </div>
      </div>
    );
  }

  if (variant === 'leaderboard') {
    return (
      <div className="p-ad p-ad-leaderboard" style={{ ...style, background: b.bg, border: 'none', position: 'relative', overflow: 'hidden' }}>
        <svg aria-hidden="true" style={{ position: 'absolute', right: -30, top: -60, opacity: 0.14 }} width="220" height="220" viewBox="0 0 220 220" fill="none" stroke="#fff"><circle cx="110" cy="110" r="105" strokeWidth="1" /><circle cx="110" cy="110" r="75" strokeWidth="1" /><circle cx="110" cy="110" r="45" strokeWidth="1" /></svg>
        <div className="p-ad-content" style={{ display: 'flex', alignItems: 'center', gap: 22, position: 'relative', width: '100%', padding: '0 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 110, alignItems: 'flex-start' }}>
            <BankWordmark b={b} size={19} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>{b.full}</span>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.25)' }}></div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, color: '#fff', marginBottom: 3 }}>{lx(b.headline)}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.45 }}>{lx(b.tag)}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 26, color: b.accent, lineHeight: 1 }}>{b.rate}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 3 }}>{lx(b.rateNote)}</div>
            </div>
            <button className="p-btn p-btn-sm" style={{ background: b.cta, color: b.ctaInk, fontWeight: 700, whiteSpace: 'nowrap' }}>{lang === 'id' ? 'Ajukan' : 'Apply'} →</button>
          </div>
        </div>
      </div>
    );
  }

  /* box / MPU */
  return (
    <div className="p-ad" style={{ ...style, background: b.bg, border: 'none', position: 'relative', overflow: 'hidden' }}>
      <svg aria-hidden="true" style={{ position: 'absolute', left: -50, bottom: -70, opacity: 0.13 }} width="240" height="240" viewBox="0 0 220 220" fill="none" stroke="#fff"><circle cx="110" cy="110" r="105" strokeWidth="1" /><circle cx="110" cy="110" r="75" strokeWidth="1" /><circle cx="110" cy="110" r="45" strokeWidth="1" /></svg>
      <div className="p-ad-content" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <BankWordmark b={b} size={22} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', marginTop: 4 }}>{b.full}</span>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, color: '#fff', margin: '18px 0 8px', lineHeight: 1.3 }}>{lx(b.headline)}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, maxWidth: 240 }}>{lx(b.tag)}</div>
        <div style={{ margin: '16px 0 2px' }}>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 34, color: b.accent, lineHeight: 1 }}>{b.rate}</span>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginTop: 4 }}>{lx(b.rateNote)}</div>
        </div>
        <button className="p-btn p-btn-sm" style={{ background: b.cta, color: b.ctaInk, fontWeight: 700, marginTop: 16 }}>{lang === 'id' ? 'Ajukan Sekarang' : 'Apply Now'} →</button>
      </div>
    </div>
  );
};

/* ── Data (demo fallback; live data comes from the API) ── */
const PLISTINGS = [
  { id: 1, title: 'Menteng Heritage Townhouse', addr: 'Menteng, Jakarta Pusat', kind: 'property', mode: 'sale', price: 14_200_000_000, beds: 4, baths: 3, area: 420, photos: 31, agent: 'Dewi Lestari', agentInit: 'DL', agency: 'Ray White Menteng', featured: true, sponsored: true },
  { id: 2, title: 'SCBD Sky Apartment 28F', addr: 'SCBD, Jakarta Selatan', kind: 'apartment', mode: 'sale', price: 5_350_000_000, beds: 3, baths: 2, area: 186, photos: 22, agent: 'Andi Wijaya', agentInit: 'AW', agency: 'Century 21', featured: true },
  { id: 3, title: 'Canggu Beachfront Villa', addr: 'Canggu, Bali', kind: 'villa', mode: 'sale', price: 12_000_000_000, beds: 5, baths: 6, area: 850, photos: 24, agent: 'Putu Surya', agentInit: 'PS', agency: 'Bali Realty', featured: true, sponsored: true },
  { id: 4, title: 'Kuningan Office Tower Floor', addr: 'Kuningan, Jakarta Selatan', kind: 'commercial', mode: 'rent', price: 185_000_000, beds: null, baths: 4, area: 1200, photos: 18, agent: 'Sari Indah', agentInit: 'SI', agency: 'Colliers', featured: true },
  { id: 5, title: 'BSD Green Residence', addr: 'BSD City, Tangerang', kind: 'property', mode: 'new', price: 1_850_000_000, beds: 3, baths: 2, area: 120, photos: 40, agent: 'Sinar Mas Land', agentInit: 'SM', agency: 'Developer', featured: true },
  { id: 6, title: 'Pondok Indah Family Home', addr: 'Pondok Indah, Jakarta', kind: 'property', mode: 'sale', price: 9_800_000_000, beds: 5, baths: 4, area: 500, photos: 28, agent: 'Budi Hartono', agentInit: 'BH', agency: 'ERA Indonesia' },
  { id: 7, title: 'Seminyak Loft Apartment', addr: 'Seminyak, Bali', kind: 'apartment', mode: 'rent', price: 28_000_000, beds: 2, baths: 2, area: 95, photos: 19, agent: 'Wayan Adi', agentInit: 'WA', agency: 'Bali Realty' },
  { id: 8, title: 'Bandung Hillside Land', addr: 'Dago Atas, Bandung', kind: 'land', mode: 'sale', price: 4_200_000_000, beds: null, baths: null, area: 1500, photos: 12, agent: 'Rina Maharani', agentInit: 'RM', agency: 'Independent' },
  { id: 9, title: 'PIK 2 Waterfront Tower', addr: 'PIK 2, Jakarta Utara', kind: 'apartment', mode: 'new', price: 2_400_000_000, beds: 2, baths: 1, area: 78, photos: 35, agent: 'Agung Podomoro', agentInit: 'AP', agency: 'Developer', sponsored: true },
];

/* ── Category icons: refined line geometry, cyan gradient stroke ── */
const CAT_LINE = {
  house: `<path d="M4 11 12 4.5 20 11"/><path d="M6.2 9.7V19.5h11.6V9.7"/><path d="M10.2 19.5v-4.6a1.8 1.8 0 0 1 3.6 0v4.6"/>`,
  apartment: `<rect x="4.5" y="4" width="9" height="15.5" rx="1"/><path d="M13.5 9.5h5a1 1 0 0 1 1 1v9H4"/><path d="M7.4 7.6h3.2M7.4 10.9h3.2M7.4 14.2h3.2M16.4 13h.01M16.4 16.2h.01"/>`,
  land: `<path d="M12 3.5a3.8 3.8 0 0 1 3.8 3.8c0 2.9-3.8 5.9-3.8 5.9S8.2 10.2 8.2 7.3A3.8 3.8 0 0 1 12 3.5z"/><circle cx="12" cy="7.3" r="1.3"/><path d="M7.2 15.2 4.5 20.5h15L16.8 15.2"/>`,
  commercial: `<path d="M4.5 8.5 5.7 4.5h12.6l1.2 4"/><path d="M4.5 8.5a1.9 1.9 0 0 0 3.8 0 1.85 1.85 0 0 0 3.7 0 1.9 1.9 0 0 0 3.8 0 1.85 1.85 0 0 0 3.7 0"/><path d="M5.6 12v7.5h12.8V12"/><path d="M9 19.5V15h3.4v4.5"/><path d="M14.8 15.2h1.8"/>`,
  villa: `<path d="M3.5 11.3 10 6.3l6.5 5"/><path d="M5.3 10.2v7.2h9.4v-7.2"/><path d="M8.6 17.4v-2.8h2.8v2.8"/><path d="M19 17.4v-5.6"/><path d="M19 11.8c.2-1.7 1.5-2.7 2.7-2.9M19 11.8c-.2-1.7-1.5-2.7-2.7-2.9M19 11.8c.5-1.4.3-2.9-.2-3.8"/><path d="M3.5 20.6c1.4 0 1.4-.9 2.8-.9s1.4.9 2.9.9 1.4-.9 2.8-.9 1.4.9 2.8.9 1.4-.9 2.9-.9 1.4.9 2.8.9"/>`,
  newdev: `<path d="M5 20.5V9.3l6-2v13.2"/><path d="M11 20.5v-8.4l7 2.2v6.2"/><path d="M11 6.2 19.5 8.4"/><path d="M19.5 8.4V4.7h-4v1.6"/><path d="M7.9 11.2h.01M7.9 14.5h.01M7.9 17.8h.01M14.9 16.2h.01M14.9 18.6h.01"/>`,
};
const CatIcon = ({ cat, size = 26 }) => {
  const gid = 'catg-' + cat;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={`url(#${gid})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#67D8E8" />
          <stop offset="1" stopColor="#3BC4D9" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <g dangerouslySetInnerHTML={{ __html: CAT_LINE[cat] || '' }} />
    </svg>
  );
};

const PCATS = [
  { id: 'house', icon: 'house2', kind: 'property', name: 'p.cat.house', count: '82,400' },
  { id: 'apartment', icon: 'apartment2', kind: 'apartment', name: 'p.cat.apartment', count: '41,200' },
  { id: 'land', icon: 'land2', kind: 'land', name: 'p.cat.land', count: '28,900' },
  { id: 'commercial', icon: 'commercial2', kind: 'commercial', name: 'p.cat.commercial', count: '14,700' },
  { id: 'villa', icon: 'villa2', kind: 'villa', name: 'p.cat.villa', count: '9,300' },
  { id: 'newdev', icon: 'newdev2', kind: 'property', name: 'p.cat.newdev', count: '7,700' },
];

/* ── Live listings from the database (created via the admin back office) ── */

/** Map a backend /api/listings row to the portal card shape. */
const mapApiListing = (r) => ({
  id: r.id,
  title: r.title,
  addr: r.address || r.region || '—',
  kind: r.type || 'property',
  mode: r.mode || 'sale',
  price: r.price ?? r.currentBid ?? 0,
  beds: r.beds ?? null,
  baths: r.baths ?? null,
  area: r.area ?? null,
  photos: r.photos || 0,
  img: r.uploadedPhotos && r.uploadedPhotos[0] ? resolveFileUrl(r.uploadedPhotos[0]) : null,
  imgs: (r.uploadedPhotos || []).map(resolveFileUrl),
  agent: r.agentName || 'Pemilik',
  agentInit: (r.agentName || 'PM').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(),
  agency: r.agency || 'Assetra',
  featured: r.promo === 'Featured',
  sponsored: r.promo === 'Sponsored',
  desc: r.description || null,
  cert: r.certificate || null,
  yearBuilt: r.yearBuilt ?? null,
  buildingArea: r.buildingArea ?? null,
  floors: r.floors ?? null,
  facilities: r.facilities || [],
  fromDb: true,
});

/** DB listings (newest first) merged in front of the demo set.
    Falls back to demo-only when the backend is unreachable. */
function usePortalListings() {
  const [dbListings, setDbListings] = React.useState([]);
  React.useEffect(() => {
    let on = true;
    api.get('/api/listings?source=portal&perPage=60')
      .then(r => {
        if (!on) return;
        const rows = (r.data || []).filter(x => x.status !== 'draft').map(mapApiListing);
        setDbListings(rows);
      })
      .catch(() => {}); // backend down → demo data only
    return () => { on = false; };
  }, []);
  return React.useMemo(() => [...dbListings, ...PLISTINGS], [dbListings]);
}

export { PIcon, CatIcon, fmtRp, fmtRpFull, PortalNav, PortalFooter, PCard, AdSlot, AD_BANKS, PLISTINGS, PCATS, mapApiListing, usePortalListings };
