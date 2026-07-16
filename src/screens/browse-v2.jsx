/* Browse v2 - Trustworthy institutional */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Photo2, Countdown2, Logo2, Nav2, TrustRibbon, TrustSeal, fmtIDRShort } from '../shared-v2';
import { useListings, useListingsMeta, useListingsLoading, useActions, useWatchlist } from '../store';

const PER_PAGE = 9;

const BrowseScreenV2 = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const allListings = useListings();
  const meta = useListingsMeta();
  const loading = useListingsLoading();
  const actions = useActions();
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [region, setRegion] = React.useState('any');
  const [verifLevel, setVerifLevel] = React.useState('any');
  const [page, setPage] = React.useState(1);
  const gridTopRef = React.useRef(null);

  // Fetch listings from backend whenever filters or page change (debounced for typing).
  React.useEffect(() => {
    const handle = setTimeout(() => {
      actions.fetchListings({ type: filter, region, verif_level: verifLevel, q: query }, page, PER_PAGE)
        .catch(() => {});
    }, query ? 250 : 0);
    return () => clearTimeout(handle);
  }, [filter, query, region, verifLevel, page]);

  // Reset to page 1 when filters change.
  React.useEffect(() => { setPage(1); }, [filter, query, region, verifLevel]);

  // Featured = the first item on page 1; grid = the rest.
  // On further pages we show all items in the grid (no featured to skip).
  const isFirstPage = page === 1;
  const featured = isFirstPage ? allListings[0] : null;
  const grid = isFirstPage ? allListings.slice(1) : allListings;
  const totalPages = Math.max(1, meta.totalPages);
  const safePage = Math.min(page, totalPages);
  const pageItems = grid;
  const totalForLabel = meta.total > 0 ? meta.total - (isFirstPage && featured ? 1 : 0) : 0;

  const goToPage = (p) => {
    setPage(p);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="as-screen">
      <TrustRibbon />
      <Nav2 active="browse" lang={lang} onLang={onLang} />

      {/* Hero */}
      <header style={{ padding: '56px 40px 40px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 60, alignItems: 'end', marginBottom: 36 }}>
          <div>
            <div className="as-eyebrow" style={{ marginBottom: 18, color: 'var(--gold-2)' }}>{t('hero.eyebrow')}</div>
            <h1 className="as-display" style={{ fontSize: 84, margin: 0, maxWidth: 900, color: 'var(--ink)' }}>
              {t('hero.title.1')}<span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('hero.title.em')}</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 640, marginTop: 24, lineHeight: 1.6 }}>{t('hero.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <TrustSeal label="KEMENKEU" sub="DJKN·2024" mark="K" />
            <TrustSeal label="BPN" sub="VERIFIED" mark="B" />
            <TrustSeal label="ISO·27001" sub="CERTIFIED" mark="I" />
          </div>
        </div>

        {/* Search */}
        <div className="as-search">
          <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>
            <Icon2 name="search" size={16} />
          </div>
          <input className="as-search-input" placeholder={t('search.placeholder')} value={query} onChange={e => setQuery(e.target.value)} />
          <div className="as-search-divider" />
          <select className="as-search-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t('search.allTypes')}</option>
            <option value="land">{t('search.land')}</option>
            <option value="property">{t('search.residential')}</option>
            <option value="commercial">{t('search.commercial')}</option>
          </select>
          <div className="as-search-divider" />
          <select className="as-search-select" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="any">{t('search.anyRegion')}</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bali">Bali</option>
            <option value="West Java">West Java</option>
          </select>
          <div className="as-search-divider" />
          <select className="as-search-select" value={verifLevel} onChange={e => setVerifLevel(e.target.value)}>
            <option value="any">{t('search.verifLevel')}</option>
            <option value="kemenkeu">{t('search.fullyVerified')}</option>
            <option value="bpn">{t('search.bpnVerified')}</option>
          </select>
          <button className="as-search-btn" onClick={() => { /* search is live; button is a no-op */ }}>{t('search.btn')} <Icon2 name="arrow" size={14} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: t('filter.all') },
            { id: 'land', label: t('filter.land') },
            { id: 'property', label: t('filter.residential') },
            { id: 'commercial', label: t('filter.commercial') },
          ].map(f => (
            <button key={f.id} className={`as-filter ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 6px' }} />
          <button className="as-filter"><Icon2 name="shield" size={12} /> {t('filter.kemenkeu')}</button>
          <button className="as-filter"><Icon2 name="clock" size={12} /> {t('filter.closingToday')}</button>
          <button className="as-filter"><Icon2 name="sliders" size={12} /> {t('filter.more')}</button>
        </div>
      </header>

      {/* Trust strip */}
      <section style={{ padding: '32px 40px 0' }}>
        <div className="as-trust-strip">
          <div className="as-trust-strip-item">
            <div className="as-trust-strip-icon"><Icon2 name="shield" size={18} /></div>
            <div><div className="as-trust-strip-label">{t('trust.docs')}</div><div className="as-trust-strip-value">{t('trust.docsVal')}</div></div>
          </div>
          <div className="as-trust-strip-item">
            <div className="as-trust-strip-icon"><Icon2 name="bank" size={18} /></div>
            <div><div className="as-trust-strip-label">{t('trust.escrow')}</div><div className="as-trust-strip-value">{t('trust.escrowVal')}</div></div>
          </div>
          <div className="as-trust-strip-item">
            <div className="as-trust-strip-icon"><Icon2 name="scale" size={18} /></div>
            <div><div className="as-trust-strip-label">{t('trust.legal')}</div><div className="as-trust-strip-value">{t('trust.legalVal')}</div></div>
          </div>
          <div className="as-trust-strip-item">
            <div className="as-trust-strip-icon"><Icon2 name="refresh" size={18} /></div>
            <div><div className="as-trust-strip-label">{t('trust.refund')}</div><div className="as-trust-strip-value">{t('trust.refundVal')}</div></div>
          </div>
        </div>
      </section>

      {/* Live stats bar */}
      <section style={{ padding: '32px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--line)' }}>
            <div className="as-stat-label">{t('stats.totalAuctioned')}</div>
            <div className="as-display as-num" style={{ fontSize: 32, color: 'var(--ink)' }}>Rp 4.2 T</div>
            <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{t('stats.since')}</div>
          </div>
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--line)' }}>
            <div className="as-stat-label">{t('stats.successful')}</div>
            <div className="as-display as-num" style={{ fontSize: 32, color: 'var(--ink)' }}>1,847</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('stats.completionRate')}</div>
          </div>
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--line)' }}>
            <div className="as-stat-label">{t('stats.verifiedBidders')}</div>
            <div className="as-display as-num" style={{ fontSize: 32, color: 'var(--ink)' }}>12,418</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('stats.kyc')}</div>
          </div>
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--line)' }}>
            <div className="as-stat-label">{t('stats.liveNow')}</div>
            <div className="as-display as-num" style={{ fontSize: 32, color: 'var(--red)' }}>284</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('stats.acrossProvinces')}</div>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div className="as-stat-label">{t('stats.disputes')}</div>
            <div className="as-display as-num" style={{ fontSize: 32, color: 'var(--ink)' }}>0.04%</div>
            <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{t('stats.allResolved')}</div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
      <section style={{ padding: '0 40px' }}>
        <div className="as-section-head">
          <div>
            <div className="as-section-num">{t('section.featured.num')}</div>
            <h2 className="as-section-title">{t('section.featured.title')}</h2>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 320, textAlign: 'right', lineHeight: 1.5 }}>{t('section.featured.desc')}</div>
        </div>

        <div style={{ position: 'relative', marginBottom: 60 }}>
          <div style={{ aspectRatio: '21/9', position: 'relative', overflow: 'hidden', border: '1px solid var(--line)' }}>
            <Photo2 kind={featured.type} seed={featured.id} tag="01 of 24" w={2000} />
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="as-pill as-pill-live">{t('legend.live')}</span>
              <span className="as-pill as-pill-verified"><Icon2 name="shield" size={10} /> {t('search.fullyVerified')}</span>
              <span className="as-pill"><Icon2 name="bank" size={10} /> {t('d.escrowActive')}</span>
            </div>
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: 'var(--paper)' }}>
              <div>
                <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.7)', marginBottom: 6 }}>{featured.id}</div>
                <h3 className="as-display" style={{ fontSize: 56, margin: 0, color: 'var(--paper)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{featured.title}</h3>
                <div style={{ fontSize: 14, color: 'rgba(250,250,247,0.85)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon2 name="pin" size={14} /> {featured.address}
                </div>
              </div>
              <div style={{ background: 'rgba(11,27,46,0.92)', backdropFilter: 'blur(8px)', padding: 24, minWidth: 320 }}>
                <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.6)', marginBottom: 6 }}>{t('feat.currentBid')}</div>
                <div className="as-display as-num" style={{ fontSize: 36, color: 'var(--paper)' }}>{fmtIDRShort(featured.currentBid)}</div>
                <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.5)', fontFamily: 'var(--mono)', marginBottom: 16 }}>{t('feat.bidsReserve', featured.bids)}</div>
                <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.6)', marginBottom: 6 }}>{t('feat.closesIn')}</div>
                <div style={{ color: 'var(--paper)', marginBottom: 16 }}><Countdown2 endDate={featured.endDate} size="md" /></div>
                <button className="as-btn as-btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/listing/${encodeURIComponent(featured.id)}`)}>
                  <Icon2 name="lock" size={13} /> {t('feat.register')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Loading state */}
      {loading && allListings.length === 0 && (
        <section style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          ◆ Memuat listing dari database…
        </section>
      )}

      {/* Listings grid */}
      <section ref={gridTopRef} style={{ padding: '0 40px', scrollMarginTop: 80 }}>
        <div className="as-section-head">
          <div>
            <div className="as-section-num">{t('section.open.num', grid.length)}</div>
            <h2 className="as-section-title">{t('section.open.title')}</h2>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)' }}>
            <div><span style={{ color: 'var(--red)' }}>●</span> {t('legend.live')}</div>
            <div><span style={{ color: 'var(--gold)' }}>●</span> {t('legend.opensSoon')}</div>
            <div><span style={{ color: 'var(--green)' }}>●</span> {t('legend.verified')}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
          {grid.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)' }}>
              {lang === 'id' ? 'Tidak ada hasil yang cocok dengan pencarian Anda.' : 'No results match your search.'}
            </div>
          ) : (
            pageItems.map(l => <ListingCardV2 key={l.id} listing={l} />)
          )}
        </div>

        {grid.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={grid.length}
            perPage={PER_PAGE}
            onChange={goToPage}
            lang={lang}
          />
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '60px 40px 32px', background: 'var(--ink)', color: 'var(--paper)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 48 }}>
          <div>
            <div>
              <Logo2 size={36} dark />
            </div>
            <div style={{ fontSize: 13, color: 'rgba(250,250,247,0.65)', marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
              PT Assetra Bidding Nusantara · NPWP 01.234.567.8-901.000<br/>
              Wisma Mulia Lt. 18, Jl. Gatot Subroto, Jakarta 12710<br/>
              Licensed auctioneer under KEMENKEU·DJKN, Reg. №2024/0817
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid rgba(250,250,247,0.2)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Icon2 name="shield" size={11} /> ISO 27001</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid rgba(250,250,247,0.2)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Icon2 name="bank" size={11} /> OJK Compliant</span>
            </div>
          </div>
          <div>
            <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.5)', marginBottom: 14 }}>Buy</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'rgba(250,250,247,0.85)' }}>
              <span>Browse all</span><span>How bidding works</span><span>Deposit & escrow</span><span>Bidder verification</span><span>Settlement guarantee</span>
            </div>
          </div>
          <div>
            <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.5)', marginBottom: 14 }}>Trust</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'rgba(250,250,247,0.85)' }}>
              <span>Verification process</span><span>Notarization</span><span>BPN integration</span><span>Audit reports</span><span>Compliance</span>
            </div>
          </div>
          <div>
            <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.5)', marginBottom: 14 }}>Support · 24/7</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'rgba(250,250,247,0.85)' }}>
              <span>+62 21 5099 8800</span><span>support@assetra.co.id</span><span>Dispute resolution</span><span>Legal counsel</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(250,250,247,0.12)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(250,250,247,0.5)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
          <div>© 2026 PT Assetra Bidding Nusantara · All rights reserved</div>
          <div>Reg. №2024/DJKN/0817 · NPWP 01.234.567.8-901.000</div>
        </div>
      </footer>
    </div>
  );
};

const ListingCardV2 = ({ listing: l }) => {
  const actions = useActions();
  const watchlist = useWatchlist();
  const saved = watchlist.includes(l.id);
  return (
  <Link to={`/listing/${encodeURIComponent(l.id)}`} className="as-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
    <div className="as-card-img">
      {l.uploadedPhotos && l.uploadedPhotos.length > 0
        ? <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img src={l.uploadedPhotos[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(250,250,247,0.92)', padding: '4px 10px', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>{`01 / ${l.photos}`}</div>
          </div>
        : <Photo2 kind={l.type} seed={l.id} tag={`01 / ${l.photos}`} />
      }
      <div className="as-card-badges">
        <div style={{ display: 'flex', gap: 6 }}>
          <span className={`as-pill ${l.status === 'live' ? 'as-pill-live' : 'as-pill-soon'}`}>
            {l.status === 'live' ? 'Live' : 'Opens soon'}
          </span>
          {l.verifications.includes('KEMENKEU') && (
            <span className="as-pill as-pill-verified"><Icon2 name="shield" size={9} /> Verified</span>
          )}
        </div>
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); actions.toggleWatchlist(l.id); }} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: saved ? 'var(--gold)' : 'rgba(250,250,247,0.95)', color: saved ? 'var(--paper)' : 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon2 name="bookmark" size={13} />
        </button>
      </div>
    </div>
    <div className="as-card-body">
      <div className="as-card-meta">
        <span className="as-eyebrow">{l.id}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold-2)', letterSpacing: '0.08em' }}>
          ◆ TRUST {l.trustScore}
        </span>
      </div>
      <h3 className="as-card-title">{l.title}</h3>
      <div className="as-card-addr">
        <Icon2 name="pin" size={11} /> {l.address}
      </div>
      <div className="as-verif-row">
        {l.verifications.map(v => (
          <span key={v} className={`as-verif-chip ${v === 'KEMENKEU' ? 'as-verif-chip-gold' : 'as-verif-chip-green'}`}>
            <Icon2 name="check" size={9} stroke={2.4} /> {v}
          </span>
        ))}
      </div>
      <div className="as-card-stats">
        <div>
          <div className="as-stat-label">Current bid</div>
          <div className="as-stat-val-lg">{fmtIDRShort(l.currentBid)}</div>
        </div>
        <div>
          <div className="as-stat-label">Closes in</div>
          <div className="as-stat-val"><Countdown2 endDate={l.endDate} size="sm" mode="compact" /></div>
        </div>
        <div>
          <div className="as-stat-label">Deposit (escrow)</div>
          <div className="as-stat-val" style={{ fontSize: 12 }}>{fmtIDRShort(l.deposit)}</div>
        </div>
        <div>
          <div className="as-stat-label">Activity</div>
          <div className="as-stat-val" style={{ fontSize: 12 }}>{l.bids} bids · {l.bidders}</div>
        </div>
      </div>
    </div>
  </Link>
  );
};

/* Compact pagination — « 1 … 4 [5] 6 … N » + range label. */
const Pagination = ({ page, totalPages, total, perPage, onChange, lang }) => {
  const labels = lang === 'id'
    ? { prev: '« Sebelumnya', next: 'Berikutnya »', showing: 'Menampilkan' }
    : { prev: '« Prev', next: 'Next »', showing: 'Showing' };
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Compute which page numbers to show: always 1, current ±1, totalPages, with "…" gaps.
  const pages = (() => {
    const set = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...set].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 60px', borderTop: '1px solid var(--line)', marginTop: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
        {labels.showing} <b style={{ color: 'var(--ink)' }}>{from}–{to}</b> / <b style={{ color: 'var(--ink)' }}>{total}</b>
      </div>
      <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="as-pgn-btn"
        >{labels.prev}</button>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showGap = prev != null && p - prev > 1;
          return (
            <React.Fragment key={p}>
              {showGap && <span style={{ color: 'var(--muted)', padding: '0 4px', fontFamily: 'var(--mono)' }}>…</span>}
              <button
                onClick={() => onChange(p)}
                className={`as-pgn-btn ${p === page ? 'active' : ''}`}
              >{p}</button>
            </React.Fragment>
          );
        })}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="as-pgn-btn"
        >{labels.next}</button>
      </nav>
    </div>
  );
};

export { BrowseScreenV2 };
