/* Mobile screens — Browse, Detail, Live Bid, Login, Register
   Designed at 390px width to fit iOS/Android frames cleanly. */
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Photo2, Countdown2, Logo2, fmtIDR, fmtIDRShort, getListingPhotos } from '../shared-v2';
import { GoogleG } from './auth-v2';
import { useActions, useListings, useStore } from '../store';
import { listingsApi } from '../api/listings';
import { signInWithGoogle } from '../sso';
import Lightbox from '../Lightbox';

/* ─── Shared mobile chrome ─── */
const MobileScreen = ({ children, dark = false }) => (
  <div style={{
    width: '100%',
    minHeight: '100%',
    background: dark ? 'var(--ink)' : 'var(--paper)',
    color: dark ? 'var(--paper)' : 'var(--ink)',
    fontFamily: 'var(--sans)',
    display: 'flex',
    flexDirection: 'column',
  }}>
    {children}
  </div>
);

const MobileTopBar = ({ lang, onLang, dark = false }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { state } = useStore();
  const user = state.user;
  const c = dark ? 'rgba(250,250,247,0.85)' : 'var(--ink)';
  const sub = dark ? 'rgba(250,250,247,0.55)' : 'var(--muted)';
  const initials = user ? (user.name || user.email).split(/[\s.@]+/).filter(Boolean).slice(0,2).map(s => s[0].toUpperCase()).join('') : '';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px 10px',
      borderBottom: `1px solid ${dark ? 'rgba(250,250,247,0.08)' : 'var(--line-2)'}`,
      background: dark ? 'var(--ink)' : 'var(--paper)',
    }}>
      <Logo2 size={22} dark={dark} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'var(--green)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 7px',
          border: '1px solid rgba(45,138,111,0.3)',
          borderRadius: 1,
        }}>
          <Icon2 name="shield" size={9} /> KEMENKEU
        </span>
        {onLang && (
          <button onClick={() => onLang(lang === 'id' ? 'en' : 'id')} style={{
            border: `1px solid ${dark ? 'rgba(250,250,247,0.2)' : 'var(--line)'}`,
            background: 'transparent',
            color: c,
            padding: '4px 8px',
            fontSize: 10,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.08em',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 2,
          }}>{lang === 'id' ? 'ID' : 'EN'}</button>
        )}
        <button style={{ background: 'transparent', border: 'none', color: c, padding: 4, cursor: 'pointer', display: 'flex' }}>
          <Icon2 name="bell" size={17} />
        </button>
        {user ? (
          <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/account')} title={user.email} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: user.role === 'admin' ? 'var(--gold)' : 'var(--brand-gradient)',
            color: 'var(--paper)', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 10,
          }}>{initials}</button>
        ) : (
          <button onClick={() => navigate('/signin')} style={{ background: 'transparent', border: `1px solid ${dark ? 'rgba(250,250,247,0.2)' : 'var(--line)'}`, color: c, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 2 }}>{t('nav.signin')}</button>
        )}
      </div>
    </div>
  );
};

const MobileTabBar = ({ active = 'browse' }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const items = [
    { id: 'browse', label: t('m.tab.browse'), icon: 'search', to: '/' },
    { id: 'live', label: t('m.tab.live'), icon: 'auction', to: '/live/AST·2026·0823' },
    { id: 'watch', label: t('m.tab.watch'), icon: 'bookmark', to: '/' },
    { id: 'account', label: t('m.tab.account'), icon: 'user', to: '/signin' },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      borderTop: '1px solid var(--line-2)',
      background: 'var(--paper)',
      padding: '8px 0 12px',
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => navigate(it.to)} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: active === it.id ? 'var(--ink)' : 'var(--muted)',
          fontWeight: active === it.id ? 600 : 400,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}>
          <Icon2 name={it.icon} size={18} />
          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ─── 06 · Browse (mobile) ─── */
const M_PER_PAGE = 9;
const BrowseMobile = ({ lang, onLang }) => {
  const { t } = useT();
  const allListings = useListings();
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const listTopRef = React.useRef(null);

  const filtered = allListings.filter(l => {
    if (filter !== 'all' && filter !== 'live' && l.type !== filter && filter !== 'villa') return false;
    if (filter === 'villa' && l.type !== 'villa' && l.type !== 'property') return false;
    if (query) {
      const q = query.toLowerCase();
      if (!l.title.toLowerCase().includes(q) && !l.address.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const featured = filtered[0] || allListings[0];
  const rest = filtered.slice(1);
  const totalPages = Math.max(1, Math.ceil(rest.length / M_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const list = rest.slice((safePage - 1) * M_PER_PAGE, safePage * M_PER_PAGE);

  React.useEffect(() => { setPage(1); }, [filter, query]);

  const goToPage = (p) => {
    setPage(p);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MobileScreen>
      <MobileTopBar lang={lang} onLang={onLang} />

      {/* Hero */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div className="as-eyebrow" style={{ marginBottom: 8, color: 'var(--gold-2)' }}>— {t('hero.eyebrow')}</div>
        <h1 className="as-display" style={{ fontSize: 30, lineHeight: 1.05, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
          {t('hero.title.1')}<br/><em style={{ fontStyle: 'italic', color: 'var(--teal)' }}>{t('hero.title.em')}</em>
        </h1>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          border: '1.5px solid var(--ink)',
          background: 'var(--paper)',
          borderRadius: 2,
          marginBottom: 12,
        }}>
          <Icon2 name="search" size={16} />
          <input placeholder={t('search.placeholder')} value={query} onChange={(e) => setQuery(e.target.value)} style={{
            flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, outline: 'none', color: 'var(--ink)', minWidth: 0,
          }}/>
          <button style={{
            border: 'none', background: 'var(--brand-gradient)', color: 'var(--paper)', padding: '7px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', fontWeight: 700, cursor: 'pointer', borderRadius: 2,
          }}>{t('search.btn')}</button>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 4 }}>
          {[
            { id: 'all', l: t('filter.all') },
            { id: 'live', l: t('filter.closingToday') },
            { id: 'land', l: t('filter.land') },
            { id: 'villa', l: t('filter.residential') },
            { id: 'commercial', l: t('filter.commercial') },
          ].map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding: '7px 14px',
              border: `1px solid ${filter === c.id ? 'var(--ink)' : 'var(--line)'}`,
              background: filter === c.id ? 'var(--ink)' : 'transparent',
              color: filter === c.id ? 'var(--paper)' : 'var(--ink)',
              fontSize: 11,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>{c.l}</button>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        padding: '12px 16px',
        background: 'var(--paper-2)',
        borderTop: '1px solid var(--line-2)',
        borderBottom: '1px solid var(--line-2)',
        marginBottom: 16,
      }}>
        {[
          { i: 'shield', l: t('m.trust1') },
          { i: 'bank', l: t('m.trust2') },
          { i: 'scale', l: t('m.trust3') },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderRight: i < 2 ? '1px solid var(--line-2)' : 'none' }}>
            <Icon2 name={s.i} size={16} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.08em', color: 'var(--ink-2)', textAlign: 'center', textTransform: 'uppercase' }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <div style={{ padding: '0 16px 14px' }}>
          <div className="as-eyebrow" style={{ marginBottom: 10 }}>— {t('m.featured')}</div>
          <MobileListingCard l={featured} large />
        </div>
      )}

      {/* List */}
      <div ref={listTopRef} style={{ padding: '4px 16px 16px', scrollMarginTop: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="as-eyebrow">— {t('m.openAuctions', rest.length)}</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{t('m.endingSoon')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(l => <MobileListingCard key={l.id} l={l} />)}
        </div>

        {rest.length > M_PER_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '20px 0 4px', borderTop: '1px solid var(--line)', marginTop: 16, flexWrap: 'wrap' }}>
            <button
              className="as-pgn-btn"
              onClick={() => goToPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              style={{ minWidth: 32, height: 32, fontSize: 11 }}
            >‹</button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', padding: '0 8px' }}>
              {safePage} / {totalPages}
            </span>
            <button
              className="as-pgn-btn"
              onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              style={{ minWidth: 32, height: 32, fontSize: 11 }}
            >›</button>
          </div>
        )}
      </div>

      <MobileTabBar active="browse" />
    </MobileScreen>
  );
};

const MobileListingCard = ({ l, large = false }) => {
  const { t } = useT();
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/listing/${encodeURIComponent(l.id)}`)} style={{
      border: '1px solid var(--line-2)',
      background: 'var(--paper)',
      overflow: 'hidden',
      borderRadius: 4,
      cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', aspectRatio: large ? '4/3' : '5/3' }}>
        {l.uploadedPhotos && l.uploadedPhotos.length > 0
          ? <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img src={l.uploadedPhotos[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(250,250,247,0.92)', padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.15em', color: 'var(--ink-2)' }}>{l.photos} PHOTOS</div>
            </div>
          : <Photo2 kind={l.type} seed={l.id} tag={`${l.photos} PHOTOS`} />
        }
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
          {l.status === 'live' && <span className="as-pill as-pill-live" style={{ fontSize: 9 }}>{t('card.live')}</span>}
          <span className="as-pill as-pill-verified" style={{ fontSize: 9 }}><Icon2 name="shield" size={8} /> {l.verifications[0]}</span>
        </div>
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon2 name="bookmark" size={14} />
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase' }}>{l.id} · {l.typeLabel}</div>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: large ? 22 : 18, margin: '0 0 4px', lineHeight: 1.15, letterSpacing: '-0.01em' }}>{l.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
          <Icon2 name="pin" size={11} /> {l.address}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 10, marginBottom: 12, paddingTop: 10, borderTop: '1px dashed var(--line-2)' }}>
          <div>
            <div className="as-stat-label">{t('card.currentBid')}</div>
            <div className="as-display as-num" style={{ fontSize: 22, lineHeight: 1, color: 'var(--ink)' }}>{fmtIDRShort(l.currentBid)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="as-stat-label">{t('card.closes')}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}><Countdown2 endDate={l.endDate} mode="compact" size="sm" /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/live/${encodeURIComponent(l.id)}`); }} style={{ flex: 1, padding: '11px 0', background: 'var(--brand-gradient)', color: 'var(--paper)', border: 'none', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon2 name="lock" size={11} /> {t('card.bidNow') || 'Bid'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/listing/${encodeURIComponent(l.id)}`); }} style={{ width: 44, padding: '11px 0', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon2 name="arrow" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── 07 · Detail (mobile) ─── */
const DetailMobile = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const allListings = useListings();
  const decodedId = id ? decodeURIComponent(id) : null;
  const cached = (decodedId && allListings.find(x => x.id === decodedId)) || allListings[0];
  const [fetched, setFetched] = React.useState(null);
  React.useEffect(() => {
    if (!decodedId) return;
    if (cached?.id === decodedId) { setFetched(cached); return; }
    listingsApi.get(decodedId).then(r => setFetched(r.data)).catch(() => {});
  }, [decodedId, cached?.id]);
  const l = fetched || cached;
  const photos = React.useMemo(() => {
    if (!l) return [];
    if (l.uploadedPhotos && l.uploadedPhotos.length > 0) {
      const total = Math.max(l.uploadedPhotos.length, 5);
      const stock = getListingPhotos(l, total - l.uploadedPhotos.length, 1400);
      return [...l.uploadedPhotos, ...stock].slice(0, Math.max(total, 24));
    }
    return getListingPhotos(l, l.photos || 24, 1400);
  }, [l]);
  const [lightbox, setLightbox] = React.useState(null);
  const [tab, setTab] = React.useState('details');

  if (!l) {
    return (
      <MobileScreen>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>◆ Memuat…</div>
      </MobileScreen>
    );
  }

  return (
    <MobileScreen>
      {/* Photo hero */}
      <div onClick={() => setLightbox({ index: 0 })} style={{ position: 'relative', aspectRatio: '4/3', cursor: 'pointer' }}>
        {l.uploadedPhotos && l.uploadedPhotos.length > 0
          ? <img src={l.uploadedPhotos[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <Photo2 kind={l.type} seed={l.id} w={1200} />
        }
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>‹</span>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {onLang && (
              <button onClick={(e) => { e.stopPropagation(); onLang(lang === 'id' ? 'en' : 'id'); }} style={{
                background: 'rgba(255,255,255,0.95)', border: 'none', color: 'var(--ink)', padding: '0 12px', height: 36, fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 18,
              }}>{lang === 'id' ? 'ID' : 'EN'}</button>
            )}
            <button onClick={(e) => e.stopPropagation()} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <Icon2 name="bookmark" size={15} />
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 5 }}>
          <span className="as-pill as-pill-live" style={{ fontSize: 9 }}>{t('d.live')}</span>
          <span className="as-pill as-pill-verified" style={{ fontSize: 9 }}><Icon2 name="shield" size={8} /> {t('d.kemenkeu')}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 9px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em' }}>1 / {photos.length}</div>
      </div>
      {lightbox && <Lightbox photos={photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      {/* Title block */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--line-2)' }}>
        <div className="as-eyebrow" style={{ marginBottom: 4 }}>{l.id} · {t('crumb.trustScore', l.trustScore)}</div>
        <h1 className="as-display" style={{ fontSize: 26, margin: '4px 0 6px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{l.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
          <Icon2 name="pin" size={12} /> {l.address}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--line-2)' }}>
        {[
          { l: t('d.landArea'), v: '850', unit: 'm²' },
          { l: t('d.building'), v: '620', unit: 'm²' },
          { l: t('d.cert'), v: 'SHM' },
          { l: t('d.year'), v: '2018' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '12px 8px', borderRight: i < 3 ? '1px solid var(--line-2)' : 'none', textAlign: 'center' }}>
            <div className="as-stat-label" style={{ fontSize: 8 }}>{s.l}</div>
            <div className="as-display as-num" style={{ fontSize: 17 }}>{s.v}{s.unit && <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 2 }}>{s.unit}</span>}</div>
          </div>
        ))}
      </div>

      {/* Bid panel */}
      <div style={{ padding: '16px', background: 'var(--paper-2)', borderBottom: '1px solid var(--line-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <div className="as-eyebrow" style={{ fontSize: 9, marginBottom: 3 }}>{t('bp.currentBid')}</div>
            <div className="as-display as-num" style={{ fontSize: 28, lineHeight: 1 }}>{fmtIDRShort(l.currentBid)}</div>
            <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)', marginTop: 4 }}>{t('bp.reserveUp')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="as-eyebrow" style={{ fontSize: 9, marginBottom: 3 }}>{t('bp.closesIn')}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}><Countdown2 endDate={l.endDate} size="sm" mode="compact" /></div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
          {l.verifications.map(v => (
            <span key={v} className="as-pill as-pill-verified" style={{ fontSize: 9 }}>
              <Icon2 name="check" size={8} stroke={2.4} /> {v}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line-2)', overflowX: 'auto' }}>
        {[
          { id: 'details', l: t('tab.details') },
          { id: 'bidding', l: t('tab.bidding') },
          { id: 'seller', l: t('tab.seller') },
          { id: 'audit', l: t('tab.audit') },
        ].map(tx => (
          <button key={tx.id} onClick={() => setTab(tx.id)} style={{
            flex: 1,
            padding: '12px 10px',
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            color: tab === tx.id ? 'var(--ink)' : 'var(--muted)',
            fontWeight: tab === tx.id ? 700 : 400,
            borderBottom: `2px solid ${tab === tx.id ? 'var(--teal)' : 'transparent'}`,
            cursor: 'pointer',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>{tx.l}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px', flex: 1 }}>
        {tab === 'details' && (
          <>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.4, margin: '0 0 12px', color: 'var(--ink)' }}>{t('det.descBody1')}</p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 16px' }}>{t('det.descBody2')}</p>

            <div className="as-eyebrow" style={{ marginBottom: 8 }}>— {t('det.specs')}</div>
            <dl style={{ margin: 0, fontSize: 12 }}>
              {[
                [t('d.cert'), t('det.certVal')],
                [t('det.bpn'), '№ 12.04.07.18.001847'],
                [t('det.njop'), 'Rp 6,200,000,000'],
                [t('det.notary'), 'H. Surya, S.H., M.Kn.'],
                [t('det.encum'), t('det.none'), 'green'],
                [t('det.liens'), t('det.clear'), 'green'],
              ].map(([k, v, c], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <dt style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.05em' }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 500, color: c === 'green' ? 'var(--green)' : 'var(--ink)', textAlign: 'right' }}>{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {tab === 'bidding' && (
          <>
            <div className="as-eyebrow" style={{ marginBottom: 8 }}>— {t('bt.terms')}</div>
            <dl style={{ margin: 0, fontSize: 12 }}>
              {[
                [t('bt.format'), t('bt.formatVal')],
                [t('bt.starting'), fmtIDRShort(l.startingBid)],
                [t('bt.reserve'), `${fmtIDRShort(8_500_000_000)} ✓`, 'green'],
                [t('bt.buyNow'), fmtIDRShort(l.buyNow)],
                [t('bt.increment'), 'Rp 50 jt'],
                [t('bt.deposit'), `${fmtIDRShort(l.deposit)} · Mandiri`],
                [t('bt.fee'), t('bt.feeVal')],
                [t('bt.settle'), t('bt.settleVal')],
              ].map(([k, v, c], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line-2)', gap: 12 }}>
                  <dt style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.05em', flexShrink: 0 }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 500, color: c === 'green' ? 'var(--green)' : 'var(--ink)', textAlign: 'right' }}>{v}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {tab === 'seller' && (
          <>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, background: 'var(--brand-gradient)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 18, borderRadius: 4 }}>PT</div>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600 }}>PT Wijaya Estate</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('s.memberSince')}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1px solid var(--line-2)' }}>
              {[
                [t('s.listings'), '23'],
                [t('s.successful'), '17'],
                [t('s.trustScore'), '98/100'],
              ].map((s, i) => (
                <div key={i} style={{ padding: 12, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--line-2)' : 'none' }}>
                  <div className="as-stat-label" style={{ fontSize: 8 }}>{s[0]}</div>
                  <div className="as-display as-num" style={{ fontSize: 18 }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'audit' && (
          <>
            <div className="as-eyebrow" style={{ marginBottom: 8 }}>— {t('a.title')}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>{t('a.note')}</div>
          </>
        )}
      </div>

      {/* Sticky bid CTA */}
      <div style={{
        position: 'sticky', bottom: 0,
        padding: 14,
        background: 'var(--paper)',
        borderTop: '1px solid var(--line-2)',
        boxShadow: '0 -8px 24px rgba(10,22,64,0.08)',
        display: 'flex',
        gap: 8,
      }}>
        <button onClick={() => navigate(`/live/${encodeURIComponent(l.id)}`)} style={{ flex: 1, padding: '14px 0', background: 'var(--brand-gradient)', color: 'var(--paper)', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon2 name="lock" size={13} /> {t('bp.placeBid')}
        </button>
        <button style={{ padding: '0 16px', background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--ink)', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2 }}>
          {t('m.contact')}
        </button>
      </div>
    </MobileScreen>
  );
};

/* ─── 08 · Live Bid (mobile) ─── */
const LiveBidMobile = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const actions = useActions();
  const allListings = useListings();
  const decodedId = id ? decodeURIComponent(id) : null;
  const cached = (decodedId && allListings.find(x => x.id === decodedId)) || allListings[1] || allListings[0];
  const [fetched, setFetched] = React.useState(null);
  React.useEffect(() => {
    if (!decodedId) return;
    if (cached?.id === decodedId) { setFetched(cached); return; }
    listingsApi.get(decodedId).then(r => setFetched(r.data)).catch(() => {});
  }, [decodedId, cached?.id]);
  const l = fetched || cached;
  const [bidAmt, setBidAmt] = React.useState((l?.currentBid || 0) + 50_000_000);
  const [bids, setBids] = React.useState([
    { who: 'Bidder #B-0042', verified: 'KEMENKEU', amt: l?.currentBid || 0, t: 0, lead: true },
    { who: 'Bidder #B-0017', verified: 'BPN', amt: (l?.currentBid || 0) - 50_000_000, t: 18 },
    { who: 'You', verified: 'KEMENKEU', amt: (l?.currentBid || 0) - 100_000_000, t: 42, you: true },
    { who: 'Bidder #B-0042', verified: 'KEMENKEU', amt: (l?.currentBid || 0) - 150_000_000, t: 67 },
    { who: 'Bidder #B-0008', verified: 'BPN', amt: (l?.currentBid || 0) - 200_000_000, t: 95 },
  ]);
  const placeBid = async () => {
    if (bidAmt <= (bids[0]?.amt || 0)) return;
    try {
      const bid = await actions.placeBid(l.id, bidAmt);
      setBids(b => [{ who: bid.who || 'You', verified: bid.verified || 'KEMENKEU', amt: bidAmt, t: 0, lead: true, you: true }, ...b.map(x => ({ ...x, lead: false, t: x.t + 5 }))]);
      setBidAmt(a => a + 50_000_000);
    } catch (e) {
      actions.showToast('error', e.message || 'Tawaran gagal');
    }
  };

  return (
    <MobileScreen dark>
      {/* Live header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(250,250,247,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite' }} />
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--cyan)' }}>{t('lr.liveNow').toUpperCase()}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{l.id}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onLang && (
            <button onClick={() => onLang(lang === 'id' ? 'en' : 'id')} style={{
              border: '1px solid rgba(250,250,247,0.2)', background: 'transparent', color: 'var(--paper)', padding: '4px 8px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 2,
            }}>{lang === 'id' ? 'ID' : 'EN'}</button>
          )}
          <button onClick={() => navigate(`/listing/${encodeURIComponent(l.id)}`)} style={{ background: 'transparent', border: '1px solid rgba(250,250,247,0.2)', color: 'var(--paper)', padding: '4px 10px', fontSize: 11, fontFamily: 'var(--mono)', cursor: 'pointer', borderRadius: 2 }}>{t('lr.exit')}</button>
        </div>
      </div>

      {/* Asset thumb */}
      <div style={{ display: 'flex', gap: 12, padding: 14, borderBottom: '1px solid rgba(250,250,247,0.08)' }}>
        <div style={{ width: 80, height: 80, overflow: 'hidden', flexShrink: 0, borderRadius: 2 }}>
          <Photo2 kind={l.type} seed={l.id} w={400} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(250,250,247,0.5)', marginBottom: 2 }}>SHM · 12,400 m²</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, lineHeight: 1.15, marginBottom: 4 }}>{l.title}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(250,250,247,0.55)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon2 name="pin" size={10} /> {l.address}
          </div>
        </div>
      </div>

      {/* Closing in BIG */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(250,250,247,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.closingIn')}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em' }}>● {t('lr.antiSnipe').replace('● ', '')}</span>
        </div>
        <div style={{ color: 'var(--paper)' }}>
          <Countdown2 endDate={l.endDate} size="lg" />
        </div>
      </div>

      {/* Current bid hero */}
      <div style={{ padding: '20px 16px', textAlign: 'center', background: 'rgba(59,196,217,0.05)', borderBottom: '1px solid rgba(250,250,247,0.08)' }}>
        <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)', marginBottom: 6 }}>{t('lr.currentBidN', bids.length)}</div>
        <div className="as-display as-num" style={{ fontSize: 38, lineHeight: 1, color: 'var(--paper)', marginBottom: 8 }}>{fmtIDRShort(bids[0].amt)}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.12em' }}>{t('lr.outbid')}</div>
      </div>

      {/* Bid input */}
      <div style={{ padding: 16, borderBottom: '1px solid rgba(250,250,247,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.nextBid')}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(250,250,247,0.5)' }}>{t('lr.min', fmtIDRShort(bids[0].amt + 50_000_000))}</span>
        </div>
        <div style={{ display: 'flex', border: '1px solid rgba(250,250,247,0.25)', background: 'rgba(0,0,0,0.2)', overflow: 'hidden', borderRadius: 2, marginBottom: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontFamily: 'var(--mono)', fontSize: 14, color: 'rgba(250,250,247,0.5)', borderRight: '1px solid rgba(250,250,247,0.15)' }}>Rp</span>
          <input value={bidAmt.toLocaleString('id-ID')} onChange={(e) => setBidAmt(parseInt(e.target.value.replace(/\D/g, '')) || 0)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 12px', fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 500, color: 'var(--paper)', outline: 'none', width: '100%', minWidth: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {[50_000_000, 100_000_000, 250_000_000].map(inc => (
            <button key={inc} onClick={() => setBidAmt(bids[0].amt + inc)} style={{ flex: 1, border: '1px solid rgba(250,250,247,0.2)', background: 'transparent', color: 'rgba(250,250,247,0.85)', padding: '8px 0', fontFamily: 'var(--mono)', fontSize: 10, cursor: 'pointer', letterSpacing: '0.04em', borderRadius: 2 }}>+{fmtIDRShort(inc).replace('Rp\u00A0', '').replace(' M','M').replace(' jt','jt')}</button>
          ))}
        </div>
        <button onClick={placeBid} style={{ width: '100%', padding: '14px 0', border: 'none', background: 'var(--brand-gradient)', color: 'var(--paper)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--sans)', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon2 name="lock" size={13} /> {t('lr.placeVerified', fmtIDRShort(bidAmt))}
        </button>
      </div>

      {/* Live feed */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.feedTitle')}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(250,250,247,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} /> {t('lr.streaming')}
          </span>
        </div>
        {bids.map((b, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center',
            padding: '10px 0', borderBottom: '1px dashed rgba(250,250,247,0.08)',
            opacity: i > 2 ? 0.6 - (i - 2) * 0.1 : 1,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: b.you ? 'var(--gold)' : 'rgba(250,250,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, color: 'var(--paper)' }}>
              {b.you ? t('lr.you') : b.who.slice(-2)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{b.who} {b.lead && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--gold)', marginLeft: 4 }}>{t('lr.lead')}</span>}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--green)' }}>✓ {b.verified}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: b.lead ? 'var(--gold)' : 'var(--paper)' }}>{fmtIDRShort(b.amt)}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(250,250,247,0.4)' }}>{b.t}s {t('lr.ago', '').split(' ').pop()}</div>
            </div>
          </div>
        ))}
      </div>
    </MobileScreen>
  );
};

/* ─── 09 · Login (mobile) ─── */
const LoginMobile = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const actions = useActions();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const submit = async () => {
    if (!email || !password) return;
    setBusy(true);
    try {
      const u = await actions.login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/');
    } catch (e) { actions.showToast('error', e.message); }
    finally { setBusy(false); }
  };
  const googleLogin = async () => {
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      if (!profile) return;
      const u = await actions.googleLogin(profile);
      navigate(u.role === 'admin' ? '/admin' : '/');
    } catch (e) { actions.showToast('error', e.message); }
    finally { setBusy(false); }
  };
  const adminDemo = async () => {
    setBusy(true);
    try {
      await actions.login('admin@assetra.co.id', 'admin123');
      navigate('/admin');
    } catch (e) { actions.showToast('error', e.message); }
    finally { setBusy(false); }
  };
  return (
    <MobileScreen>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo2 size={24} />
        {onLang && (
          <button onClick={() => onLang(lang === 'id' ? 'en' : 'id')} style={{
            border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink-2)', padding: '5px 10px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 2,
          }}>{lang === 'id' ? 'ID' : 'EN'}</button>
        )}
      </div>

      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        <div className="as-eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 10 }}>— {t('nav.signin').toUpperCase()}</div>
        <h1 className="as-display" style={{ fontSize: 32, margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{t('auth.welcome')}</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 24px', lineHeight: 1.5 }}>{t('auth.welcomeSub')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobileField label={t('auth.email')} type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <MobileField label={t('auth.password')} type="password" placeholder="••••••••" rightLink={t('auth.forgot')} value={password} onChange={(e) => setPassword(e.target.value)} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>
            <span style={{ width: 18, height: 18, border: '1.5px solid var(--ink-3)', borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-gradient)', color: 'var(--paper)', flexShrink: 0 }}>
              <Icon2 name="check" size={11} stroke={2.6} />
            </span>
            {t('auth.remember')}
          </label>

          <button onClick={submit} style={{ width: '100%', padding: '15px 0', background: 'var(--brand-gradient)', color: 'var(--paper)', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
            <Icon2 name="lock" size={13} /> {t('auth.signin')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.1em' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            {t('auth.or').toUpperCase()}
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <button onClick={googleLogin} style={{ width: '100%', padding: '13px 0', border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <GoogleG size={16} /> {t('auth.google')}
          </button>

          <div style={{ padding: 12, background: 'var(--paper-2)', borderLeft: '3px solid var(--cyan)', fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5, display: 'flex', gap: 8, marginTop: 8 }}>
            <Icon2 name="lock" size={13} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 12 }}>{t('auth.twoFactor')}</div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>{t('auth.trustNote')}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12.5, color: 'var(--ink-3)' }}>
            {t('auth.noAccount')} <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--teal)' }}>{t('auth.createAccount')}</Link>
          </div>
          <div style={{ marginTop: 12, padding: 10, border: '1px dashed var(--line)', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textAlign: 'center', paddingBottom: 24 }}>
            <button type="button" onClick={adminDemo} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Sign in as admin (demo)</button>
          </div>
        </div>
      </div>
    </MobileScreen>
  );
};

/* ─── 10 · Register (mobile) ─── */
const RegisterMobile = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const actions = useActions();
  const [step, setStep] = React.useState(1);
  const [acctType, setAcctType] = React.useState('individual');
  const [name, setName] = React.useState('');
  const [emailReg, setEmailReg] = React.useState('');
  const submit = async () => {
    if (!emailReg) { actions.showToast('error', 'Email diperlukan'); return; }
    try {
      await actions.register({ email: emailReg, password: 'demo-password-123', name: name || emailReg.split('@')[0], accountType: acctType });
      navigate('/');
    } catch (e) { actions.showToast('error', e.message); }
  };

  return (
    <MobileScreen>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line-2)' }}>
        <button onClick={() => navigate('/signin')} style={{ background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: 18, cursor: 'pointer' }}>‹</button>
        <Logo2 size={22} />
        {onLang && (
          <button onClick={() => onLang(lang === 'id' ? 'en' : 'id')} style={{
            border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink-2)', padding: '5px 10px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', borderRadius: 2,
          }}>{lang === 'id' ? 'ID' : 'EN'}</button>
        )}
      </div>

      <div style={{ padding: 20, flex: 1 }}>
        <div className="as-eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 8 }}>— {t('reg.step')} {step} {t('reg.of')} 4</div>
        <h1 className="as-display" style={{ fontSize: 24, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{t('reg.title')}</h1>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 18px', lineHeight: 1.5 }}>{t('reg.sub')}</p>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ flex: 1, height: 3, background: n <= step ? 'var(--brand-gradient)' : 'var(--paper-3)' }} />
          ))}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
          0{step} · {[t('reg.s1'), t('reg.s2'), t('reg.s3'), t('reg.s4')][step-1]}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {step === 1 && (
            <>
              <MobileField label={t('reg.fullName')} placeholder={t('reg.fullNamePh')} value={name} onChange={(e) => setName(e.target.value)} />
              <MobileField label={t('auth.email')} type="email" placeholder="nama@email.com" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} />
              <MobileField label={t('reg.phone')} placeholder={t('reg.phonePh')} />
              <MobileField label={t('reg.password')} type="password" placeholder={t('reg.passwordPh')} hint={t('reg.passwordHint')} />

              <div>
                <div className="as-eyebrow" style={{ marginBottom: 8 }}>— {t('reg.accountType')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'individual', label: t('reg.individual'), sub: t('reg.individualSub'), icon: 'user' },
                    { id: 'company', label: t('reg.company'), sub: t('reg.companySub'), icon: 'bank' },
                  ].map(o => (
                    <button key={o.id} onClick={() => setAcctType(o.id)} style={{
                      padding: 12,
                      border: `1.5px solid ${acctType === o.id ? 'var(--teal)' : 'var(--line)'}`,
                      background: acctType === o.id ? 'rgba(59,196,217,0.06)' : 'var(--paper)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      borderRadius: 2,
                      fontFamily: 'inherit',
                    }}>
                      <Icon2 name={o.icon} size={16} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{o.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ padding: 12, background: 'var(--paper-2)', borderLeft: '3px solid var(--cyan)', fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                <Icon2 name="shield" size={13} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 12 }}>{t('reg.kycTitle')}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 11 }}>{t('reg.kycSub')}</div>
                </div>
              </div>
              <MobileField label={t('reg.ktpNumber')} placeholder={t('reg.ktpNumberPh')} hint={t('reg.kycVerified')} hintColor="var(--green)" />
              <MobileUpload label={t('reg.uploadKtp')} sub={t('reg.uploadKtpSub')} />
              <MobileUpload label={t('reg.selfie')} sub={t('reg.selfieSub')} verified />
            </>
          )}

          {step === 3 && (
            <>
              <MobileField label={t('reg.npwp')} placeholder={t('reg.npwpPh')} />
              <div className="as-eyebrow">— {t('reg.bank')}</div>
              <MobileField label={t('reg.bankName')} placeholder="Bank Mandiri" />
              <MobileField label={t('reg.accountNo')} placeholder="13000xxxxxxx" />
              <MobileField label={t('reg.accountHolder')} placeholder="Andi Wirawan" hint={t('reg.confirmName')} hintColor="var(--green)" />
              <MobileField label={t('reg.maxBid')} placeholder="Rp 5.000.000.000" hint={t('reg.maxBidSub')} />
            </>
          )}

          {step === 4 && (
            <>
              <div style={{ border: '1px solid var(--line)', background: 'var(--paper)' }}>
                {[
                  [t('reg.fullName'), 'Andi Wirawan'],
                  [t('auth.email'), 'andi.wirawan@email.com'],
                  [t('reg.phone'), '+62 812 3456 7890'],
                  [t('reg.ktpNumber'), '3271 0405 7301 0042', true],
                  [t('reg.npwp'), '02.345.678.9-012.000', true],
                  [t('reg.bank'), 'Mandiri · 1300 0123 4567', true],
                ].map(([k, v, ver], i, a) => (
                  <div key={i} style={{ padding: 12, borderBottom: i === a.length - 1 ? 'none' : '1px solid var(--line-2)' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{v}</span>
                      {ver && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--green)', letterSpacing: '0.1em', padding: '2px 5px', border: '1px solid rgba(45,138,111,0.3)', flexShrink: 0 }}>✓ VERIFIED</span>}
                    </div>
                  </div>
                ))}
              </div>
              <label style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <span style={{ width: 16, height: 16, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-gradient)', color: 'var(--paper)', flexShrink: 0, marginTop: 2 }}>
                  <Icon2 name="check" size={11} stroke={2.6} />
                </span>
                {t('reg.terms')}
              </label>
            </>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '13px 18px', background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--line)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2 }}>← {t('reg.back')}</button>
            )}
            <button onClick={() => step < 4 ? setStep(s => s + 1) : submit()} style={{ flex: 1, padding: '13px 0', background: 'var(--brand-gradient)', color: 'var(--paper)', border: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon2 name={step === 4 ? 'check' : 'lock'} size={12} /> {step === 4 ? t('reg.submit') : t('reg.continue')}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: 'var(--ink-3)', paddingBottom: 16 }}>
            {t('reg.alreadyHave')} <Link to="/signin" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>{t('reg.signinLink')}</Link>
          </div>
        </div>
      </div>
    </MobileScreen>
  );
};

/* ─── Helpers ─── */
const MobileField = ({ label, type = 'text', placeholder, rightLink, hint, hintColor, value, onChange }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span className="as-eyebrow">— {label}</span>
      {rightLink && <a href="#" style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--teal)', textTransform: 'uppercase', textDecoration: 'none' }}>{rightLink}</a>}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '12px 14px', border: '1.5px solid var(--line)',
        background: 'var(--paper)', fontFamily: 'var(--sans)', fontSize: 14,
        color: 'var(--ink)', outline: 'none', borderRadius: 2,
      }}
    />
    {hint && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 10.5, color: hintColor || 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>
        <Icon2 name="check" size={10} stroke={2.4} /> {hint}
      </div>
    )}
  </div>
);

const MobileUpload = ({ label, sub, verified }) => (
  <div>
    <div className="as-eyebrow" style={{ marginBottom: 6 }}>— {label}</div>
    <div style={{
      border: `1.5px dashed ${verified ? 'var(--green)' : 'var(--line)'}`,
      background: verified ? 'rgba(45,138,111,0.04)' : 'var(--paper-2)',
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      borderRadius: 2,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 4, background: verified ? 'var(--green)' : 'var(--paper-3)', color: verified ? 'var(--paper)' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon2 name={verified ? 'check' : 'upload'} size={15} stroke={verified ? 2.6 : 1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{verified ? 'andi-ktp-selfie.jpg' : label}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{sub}</div>
      </div>
      {verified && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--green)', letterSpacing: '0.1em', padding: '2px 5px', border: '1px solid rgba(45,138,111,0.3)' }}>✓ MATCH</span>}
    </div>
  </div>
);

export { BrowseMobile, DetailMobile, LiveBidMobile, LoginMobile, RegisterMobile };
