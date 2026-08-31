/* Portal Search Results — fully functional client-side search over DB + demo listings. */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { PIcon, fmtRp, PortalNav, PortalFooter, PCard, AdSlot, PLISTINGS, usePortalListings } from './shared';
import LocationInput from './LocationInput';
import { useIsMobile } from '../lib/useIsMobile';

const PER_PAGE = 9;

/* chip id → listing.kind (design uses 'house', data uses 'property') */
const kindOf = (chip) => (chip === 'house' ? 'property' : chip);
const toNum = (s) => {
  const n = Number(String(s).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const PortalSearch = ({ lang, onLang, onNav, listings }) => {
  const { t } = useT();
  const L = (en, id) => (lang === 'id' ? id : en);
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [params] = useSearchParams();
  const [view, setView] = React.useState('list');
  const live = usePortalListings();          // DB listings (admin-created) + demo set
  const all = listings && listings.length ? listings : live;
  const dbLocations = React.useMemo(
    () => [...new Set(all.map(l => l.addr).filter(a => a && a !== '—'))],
    [all],
  );

  /* ── filter state (seeded from URL: ?q=&type=&max=&mode=) ── */
  const [q, setQ] = React.useState(params.get('q') || '');
  const [mode, setMode] = React.useState(params.get('mode') || 'all');
  const [types, setTypes] = React.useState(() => (params.get('type') ? [params.get('type')] : []));
  const [priceMin, setPriceMin] = React.useState('');
  const [priceMax, setPriceMax] = React.useState(params.get('max') || '');
  const [bedsMin, setBedsMin] = React.useState(0);
  const [cert, setCert] = React.useState('any');
  const [areaMin, setAreaMin] = React.useState('');
  const [areaMax, setAreaMax] = React.useState('');
  const [sort, setSort] = React.useState('relevance');
  const [page, setPage] = React.useState(1);
  const [saved, setSaved] = React.useState(false);

  /* re-seed when the URL changes (e.g. nav Beli/Sewa/Proyek Baru) */
  React.useEffect(() => {
    setQ(params.get('q') || '');
    setMode(params.get('mode') || 'all');
    setTypes(params.get('type') ? [params.get('type')] : []);
    setPriceMax(params.get('max') || '');
    setPage(1);
  }, [params]);

  const toggleType = (c) => { setTypes(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c]); setPage(1); };
  const reset = () => {
    setQ(''); setMode('all'); setTypes([]); setPriceMin(''); setPriceMax('');
    setBedsMin(0); setCert('any'); setAreaMin(''); setAreaMax(''); setSort('relevance'); setPage(1);
  };

  /* ── filtering ── */
  const pMin = toNum(priceMin), pMax = toNum(priceMax);
  const aMin = toNum(areaMin), aMax = toNum(areaMax);
  const filtered = all.filter(l => {
    if (mode !== 'all' && l.mode !== mode) return false;
    if (types.length && !types.some(c => kindOf(c) === l.kind)) return false;
    if (q.trim()) {
      const hay = `${l.title} ${l.addr} ${l.id}`.toLowerCase();
      if (!q.trim().toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
    }
    if (pMin != null && l.price < pMin) return false;
    if (pMax != null && l.price > pMax) return false;
    if (bedsMin && (l.beds || 0) < bedsMin) return false;
    if (cert !== 'any') {
      const c = l.cert || (l.fromDb ? null : 'SHM');   // demo set is assumed SHM
      if (c !== cert) return false;
    }
    if (aMin != null && (l.area || 0) < aMin) return false;
    if (aMax != null && (l.area || 0) > aMax) return false;
    return true;
  });

  /* ── sorting ── */
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'priceLow') return a.price - b.price;
    if (sort === 'priceHigh') return b.price - a.price;
    if (sort === 'newest') return (b.fromDb ? 1 : 0) - (a.fromDb ? 1 : 0);
    return 0; // relevance = incoming order (DB newest first, then demo)
  });

  /* ── pagination (9 per page; sponsored block only on page 1) ── */
  const sponsored = page === 1 ? sorted.filter(l => l.sponsored) : [];
  const regular = sorted.filter(l => !l.sponsored);
  const totalPages = Math.max(1, Math.ceil(regular.length / PER_PAGE));
  const curPage = Math.min(page, totalPages);
  const pageRows = regular.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE);
  const setPageSafe = (p) => { setPage(Math.min(Math.max(1, p), totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  /* Rendered via {renderFilters()} (not <Component/>) so typing in the
     inputs doesn't remount the subtree and steal focus. */
  const renderFilters = () => (
    <aside style={{ width: isMobile ? '100%' : 260, flexShrink: 0 }}>
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 20, position: isMobile ? 'static' : 'sticky', top: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, margin: 0 }}>{t('p.search.filters')}</h3>
          <span className="p-link" style={{ fontSize: 12, cursor: 'pointer' }} onClick={reset}>{t('p.search.reset')}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="p-field-label">{L('Mode', 'Mode')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[['all', L('All', 'Semua')], ['sale', L('Resale', 'Dijual')], ['rent', L('For rent', 'Disewa')], ['new', L('New', 'Properti Baru')]].map(([m, lbl]) => (
              <span key={m} className={`p-chip ${mode === m ? 'active' : ''}`} onClick={() => { setMode(m); setPage(1); }} style={{ fontSize: 12, padding: '6px 11px', cursor: 'pointer' }}>{lbl}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="p-field-label">{t('p.search.price')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="p-input" placeholder={t('p.search.min')} inputMode="numeric" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(1); }} />
            <input className="p-input" placeholder={t('p.search.max')} inputMode="numeric" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1); }} />
          </div>
          {(pMin || pMax) && <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--teal)', marginTop: 5 }}>{pMin ? fmtRp(pMin) : '0'} — {pMax ? fmtRp(pMax) : '∞'}</div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="p-field-label">{t('p.search.type')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['house', 'apartment', 'villa', 'land', 'commercial'].map(c => (
              <span key={c} className={`p-chip ${types.includes(c) ? 'active' : ''}`} onClick={() => toggleType(c)} style={{ fontSize: 12, padding: '6px 11px', cursor: 'pointer' }}>{t('p.cat.' + c)}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="p-field-label">{t('p.search.beds')}</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(b => (
              <span key={b} className={`p-chip ${bedsMin === b ? 'active' : ''}`} onClick={() => { setBedsMin(v => v === b ? 0 : b); setPage(1); }} style={{ fontSize: 12, padding: '6px 0', flex: 1, justifyContent: 'center', cursor: 'pointer' }}>{b}+</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="p-field-label">{t('p.search.cert')}</label>
          <select className="p-input" value={cert} onChange={e => { setCert(e.target.value); setPage(1); }}>
            <option value="any">{L('Any', 'Semua')}</option>
            {['SHM', 'HGB', 'SHMSRS', 'Girik', 'AJB'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="p-field-label">{t('p.search.area')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="p-input" placeholder={t('p.search.min')} inputMode="numeric" value={areaMin} onChange={e => { setAreaMin(e.target.value); setPage(1); }} />
            <input className="p-input" placeholder={t('p.search.max')} inputMode="numeric" value={areaMax} onChange={e => { setAreaMax(e.target.value); setPage(1); }} />
          </div>
        </div>
        <button className="p-btn p-btn-ghost" style={{ width: '100%' }} onClick={() => setSaved(true)}><PIcon name="bell" size={14} /> {t('p.search.save')}</button>
        {saved && (
          <div style={{ marginTop: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(45,138,111,0.08)', border: '1px solid rgba(45,138,111,0.3)', fontSize: 11.5, color: 'var(--ink-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--green)' }}><PIcon name="check" size={13} /></span>
            {L('Search saved — you\'ll get alerts for new matches.', 'Pencarian disimpan — Anda akan diberi tahu bila ada listing cocok.')}
          </div>
        )}

        {/* sidebar ad */}
        <div style={{ marginTop: 20 }}><AdSlot variant="box" bank="btn" placement="search-box" style={{ minHeight: 250 }} /></div>
      </div>
    </aside>
  );

  return (
    <div className="pscreen">
      {/* garis aktif navbar mengikuti mode: sale→Dijual, rent→Disewa, new→Properti Baru */}
      <PortalNav active={mode === 'rent' ? 'rent' : mode === 'new' ? 'new' : 'buy'} lang={lang} onLang={onLang} onNav={onNav} />

      {/* search bar strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--line)', position: 'sticky', top: 61, zIndex: 30 }}>
        <div className="pwrap" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--ink)', borderRadius: 8, padding: '10px 14px' }}>
            <PIcon name="search" size={16} />
            <LocationInput
              value={q}
              onChange={(v) => { setQ(v); setPage(1); }}
              extra={dbLocations}
              placeholder={L('Search location, title, or listing ID…', 'Cari lokasi, judul, atau ID listing…')}
              inputStyle={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, background: 'transparent' }}
            />
            {q && <span onClick={() => { setQ(''); setPage(1); }} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✕</span>}
          </div>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => setView('list')} style={{ padding: '9px 12px', border: 'none', background: view === 'list' ? 'var(--ink)' : '#fff', color: view === 'list' ? '#fff' : 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><PIcon name="dash" size={14} /> {t('p.search.list')}</button>
            <button onClick={() => setView('map')} style={{ padding: '9px 12px', border: 'none', borderLeft: '1px solid var(--line)', background: view === 'map' ? 'var(--ink)' : '#fff', color: view === 'map' ? '#fff' : 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><PIcon name="pin" size={14} /> {t('p.search.map')}</button>
          </div>
        </div>
      </div>

      <div className="pwrap" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 14 : 24, padding: isMobile ? '16px 16px 40px' : '24px 32px 56px' }}>
        {isMobile ? (
          <>
            <button className="p-btn p-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setFiltersOpen(v => !v)}>
              <PIcon name={filtersOpen ? 'x' : 'menu'} size={16} /> {filtersOpen ? L('Hide filters', 'Sembunyikan filter') : L('Filters & sort', 'Filter & urutkan')}
            </button>
            {filtersOpen && renderFilters()}
          </>
        ) : renderFilters()}

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div><span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{sorted.length.toLocaleString('id-ID')}</span> <span style={{ color: 'var(--muted)', fontSize: 14 }}>{t('p.search.results')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>{t('p.search.sort')}:</span>
              <select className="p-input" style={{ width: 'auto', padding: '7px 10px' }} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="relevance">{t('p.search.sortRelevance')}</option>
                <option value="priceLow">{t('p.search.sortPriceLow')}</option>
                <option value="priceHigh">{t('p.search.sortPriceHigh')}</option>
                <option value="newest">{t('p.search.sortNewest')}</option>
              </select>
            </div>
          </div>

          {view === 'map' && (
            <div style={{ height: 280, borderRadius: 8, marginBottom: 20, position: 'relative', overflow: 'hidden', border: '1px solid var(--line)', background: 'linear-gradient(135deg, #e8edf5, #dce6f0)' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(26,111,168,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(26,111,168,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {[[30, 40], [55, 30], [48, 60], [70, 50], [38, 72]].map((pos, i) => sorted[i] && (
                <div key={i} onClick={() => onNav && onNav('detail', sorted[i])} style={{ position: 'absolute', left: pos[0] + '%', top: pos[1] + '%', background: 'var(--ink)', color: '#fff', padding: '5px 10px', borderRadius: 100, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, transform: 'translate(-50%,-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer' }}>{fmtRp(sorted[i].price)}</div>
              ))}
            </div>
          )}

          {/* sponsored block — page 1 only */}
          {sponsored.length > 0 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gold-2)', textTransform: 'uppercase', marginBottom: 10 }}>★ Sponsored results</div>
                <div className="p-grid">
                  {sponsored.map(l => <PCard key={l.id} l={l} onNav={onNav} />)}
                </div>
              </div>
              <hr className="p-divider" style={{ margin: '4px 0 20px' }} />
            </>
          )}

          {pageRows.length > 0 ? (
            <div className="p-grid">
              {pageRows.map(l => <PCard key={l.id} l={l} onNav={onNav} />)}
            </div>
          ) : sponsored.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--line)', borderRadius: 12, background: '#fff' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>{L('No listings match', 'Tidak ada listing yang cocok')}</div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 16px' }}>{L('Try widening your filters or clearing the search.', 'Coba longgarkan filter atau kosongkan kata kunci.')}</p>
              <button className="p-btn p-btn-cyan p-btn-sm" onClick={reset}>{t('p.search.reset')}</button>
            </div>
          )}

          {/* inline leaderboard ad */}
          <div style={{ margin: '22px 0' }}><AdSlot variant="leaderboard" bank="bri" placement="search-leaderboard" /></div>

          {/* pagination — 9 per page */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <span className="p-chip" onClick={() => setPageSafe(curPage - 1)} style={{ minWidth: 38, justifyContent: 'center', padding: '8px 0', cursor: 'pointer', opacity: curPage === 1 ? 0.4 : 1 }}>‹</span>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <span key={p} className={`p-chip ${p === curPage ? 'active' : ''}`} onClick={() => setPageSafe(p)} style={{ minWidth: 38, justifyContent: 'center', padding: '8px 0', cursor: 'pointer' }}>{p}</span>
              ))}
              <span className="p-chip" onClick={() => setPageSafe(curPage + 1)} style={{ minWidth: 38, justifyContent: 'center', padding: '8px 0', cursor: 'pointer', opacity: curPage === totalPages ? 0.4 : 1 }}>›</span>
            </div>
          )}
        </main>
      </div>

      <PortalFooter />
    </div>
  );
};

export default PortalSearch;
