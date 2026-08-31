/* Portal Homepage */
import React from 'react';
import { useT } from '../i18n';
import { PIcon, CatIcon, PortalNav, PortalFooter, PCard, AdSlot, PLISTINGS, PCATS, usePortalListings } from './shared';
import LocationInput from './LocationInput';
import { useIsMobile } from '../lib/useIsMobile';

const PortalHome = ({ lang, onLang, onNav, listings }) => {
  const isMobile = useIsMobile();
  const { t } = useT();
  const [tab, setTab] = React.useState('buy');
  /* hero search state → /search?q=&type=&max=&mode= */
  const [q, setQ] = React.useState('');
  const [typ, setTyp] = React.useState('');
  const [budget, setBudget] = React.useState('');
  const goSearch = () => {
    onNav && onNav('search', { q: q.trim(), type: typ, max: budget, mode: tab === 'buy' ? 'sale' : tab });
  };
  const live = usePortalListings();          // DB listings (admin-created) + demo set
  const data = listings && listings.length ? listings : live;
  /* Lokasi dari listing yang ada → ikut jadi saran autocomplete. */
  const dbLocations = React.useMemo(
    () => [...new Set(data.map(l => l.addr).filter(a => a && a !== '—'))],
    [data],
  );
  const featured = data.filter(l => l.featured || l.fromDb);
  const recent = data.slice(3, 7);

  return (
    <div className="pscreen">
      <PortalNav active="home" lang={lang} onLang={onLang} onNav={onNav} />

      {/* Hero */}
      <section className="p-hero">
        <div className="p-hero-house" aria-hidden="true" />
        <div className="pwrap p-hero-inner">
          <h1>{t('p.hero.title1')}<span className="p-hero-grad">{t('p.hero.title2')}</span></h1>
          <p>{t('p.hero.sub')}</p>

          <div className="p-searchbox">
            <div className="p-search-tabs">
              {['buy', 'rent', 'new'].map(tb => (
                <div key={tb} className={`p-search-tab ${tab === tb ? 'active' : ''}`} onClick={() => setTab(tb)}>{t('p.hero.tab.' + tb)}</div>
              ))}
            </div>
            <div className="p-search-row" style={{ background: 'var(--paper-2)', borderRadius: tab === 'buy' ? '0 8px 8px 8px' : 8, margin: 0 }}>
              <div className="p-search-field" style={{ flex: 2 }}>
                <PIcon name="pin" size={18} />
                <div style={{ flex: 1 }}>
                  <label>{t('p.hero.loc')}</label>
                  <LocationInput
                    value={q}
                    onChange={setQ}
                    onEnter={goSearch}
                    onSelect={(loc) => onNav && onNav('search', { q: loc, type: typ, max: budget, mode: tab === 'buy' ? 'sale' : tab })}
                    extra={dbLocations}
                    placeholder={t('p.hero.locPh')}
                  />
                </div>
              </div>
              <div className="p-search-field">
                <PIcon name="home" size={18} />
                <div style={{ flex: 1 }}>
                  <label>{t('p.hero.type')}</label>
                  <select value={typ} onChange={e => setTyp(e.target.value)}>
                    <option value="">{lang === 'id' ? 'Semua tipe' : 'All types'}</option>
                    <option value="house">{t('p.cat.house')}</option>
                    <option value="apartment">{t('p.cat.apartment')}</option>
                    <option value="villa">{t('p.cat.villa')}</option>
                    <option value="land">{t('p.cat.land')}</option>
                    <option value="commercial">{t('p.cat.commercial')}</option>
                  </select>
                </div>
              </div>
              <div className="p-search-field">
                <PIcon name="calc" size={18} />
                <div style={{ flex: 1 }}>
                  <label>{t('p.hero.budget')}</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}>
                    <option value="">{lang === 'id' ? 'Berapa pun' : 'Any'}</option>
                    <option value="2000000000">≤ Rp 2 M</option>
                    <option value="5000000000">≤ Rp 5 M</option>
                    <option value="10000000000">≤ Rp 10 M</option>
                    <option value="20000000000">≤ Rp 20 M</option>
                  </select>
                </div>
              </div>
              <button className="p-search-go" onClick={goSearch}><PIcon name="search" size={18} /> {t('p.hero.search')}</button>
            </div>
          </div>

        </div>
      </section>

      {/* Categories */}
      <section className="p-section pwrap" style={{ paddingBottom: 28 }}>
        <div className="p-section-head">
          <div><div className="p-eyebrow">{t('p.cat.eyebrow')}</div><h2 className="p-section-title">{t('p.cat.title')}</h2></div>
        </div>
        <div className="p-cats">
          {PCATS.map((c) => {
            /* Hitungan nyata dari listing yang tayang (DB + demo), konsisten
               dengan hasil yang muncul saat kartu diklik. */
            const count = c.id === 'newdev'
              ? data.filter(l => l.mode === 'new').length
              : data.filter(l => l.kind === c.kind).length;
            const goCat = () => onNav && onNav('search', c.id === 'newdev' ? { mode: 'new' } : { type: c.id });
            return (
              <div key={c.id} className="p-cat" data-cat={c.id} onClick={goCat}>
                <div className="p-cat-ic"><CatIcon cat={c.id} size={26} /></div>
                <div className="p-cat-name">{t(c.name)}</div>
                <div className="p-cat-count">{count.toLocaleString('id-ID')} {t('p.cat.listings')}</div>
                <div className="p-cat-go"><PIcon name="arrowR" size={15} /></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard ad */}
      <div className="pwrap" style={{ paddingBottom: 8 }}><AdSlot variant="leaderboard" bank="bca" placement="home-leaderboard" /></div>

      {/* Featured */}
      <section className="p-section pwrap">
        <div className="p-section-head">
          <div><div className="p-eyebrow">{t('p.feat.eyebrow')}</div><h2 className="p-section-title">{t('p.feat.title')}</h2><div className="p-section-sub">{t('p.feat.sub')}</div></div>
          <span className="p-link" onClick={() => onNav && onNav('search')}>{t('p.feat.all')} <PIcon name="arrowR" size={14} /></span>
        </div>
        <div className="p-grid">
          {featured.slice(0, 3).map(l => <PCard key={l.id} l={l} onNav={onNav} />)}
        </div>
      </section>

      {/* AI Consultant teaser */}
      <section className="pwrap" style={{ paddingBottom: 56 }}>
        <div className="p-ai" style={{ padding: isMobile ? '28px 22px' : '40px 44px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 44, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div className="p-ai-badge"><PIcon name="sparkle" size={12} /> {t('p.ai.eyebrow')}</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 36, letterSpacing: '-0.02em', margin: '18px 0 14px', lineHeight: 1.1 }}>{t('p.ai.title')}</h2>
            <p style={{ fontSize: 15, color: 'rgba(250,250,247,0.78)', lineHeight: 1.6, marginBottom: 24 }}>{t('p.ai.sub')}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
              {['f1', 'f2', 'f3', 'f4'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(250,250,247,0.9)' }}>
                  <span style={{ color: 'var(--cyan)' }}><PIcon name="check" size={15} /></span> {t('p.ai.' + f)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="p-btn p-btn-cyan" onClick={() => onNav && onNav('ai')}><PIcon name="sparkle" size={15} /> {t('p.ai.cta')}</button>
              <button className="p-btn p-btn-white" onClick={() => onNav && onNav('ai')}>{t('p.ai.cta2')}</button>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="p-ai-chat">
              <div className="p-ai-msg">
                <div className="p-ai-msg-av" style={{ background: 'rgba(255,255,255,0.15)' }}><PIcon name="users" size={15} /></div>
                <div className="p-ai-bubble" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '4px 12px 12px 12px', color: 'rgba(250,250,247,0.92)' }}>{t('p.ai.q')}</div>
              </div>
              <div className="p-ai-msg" style={{ flexDirection: 'row-reverse' }}>
                <div className="p-ai-msg-av" style={{ background: 'var(--brand-gradient)' }}><PIcon name="sparkle" size={15} /></div>
                <div className="p-ai-bubble" style={{ background: 'rgba(59,196,217,0.14)', border: '1px solid rgba(59,196,217,0.3)', padding: '12px 14px', borderRadius: '12px 4px 12px 12px', color: '#fff' }}>{t('p.ai.a')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'rgba(250,250,247,0.5)' }}>Ask about any property…</div>
                <button onClick={() => onNav && onNav('ai')} style={{ border: 'none', background: 'var(--brand-gradient)', color: '#fff', borderRadius: 8, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><PIcon name="arrowR" size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently added + sidebar ad */}
      <section className="p-section pwrap" style={{ paddingTop: 0 }}>
        <div className="p-section-head">
          <div><div className="p-eyebrow">{t('p.recent.eyebrow')}</div><h2 className="p-section-title">{t('p.recent.title')}</h2></div>
          <span className="p-link" onClick={() => onNav && onNav('search')}>{t('p.recent.all')} <PIcon name="arrowR" size={14} /></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 22 }}>
          <div className="p-grid">
            {recent.slice(0, 3).map(l => <PCard key={l.id} l={l} onNav={onNav} />)}
          </div>
          {!isMobile && <AdSlot variant="box" bank="mandiri" placement="home-box" style={{ minHeight: 380 }} />}
        </div>
      </section>

      {/* Financing band */}
      <section style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="pwrap p-section">
          <div className="p-section-head">
            <div><div className="p-eyebrow">{t('p.fin.eyebrow')}</div><h2 className="p-section-title">{t('p.fin.title')}</h2><div className="p-section-sub">{t('p.fin.sub')}</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
            {[{ ic: 'calc', k: 'p.fin.calc' }, { ic: 'bank', k: 'p.fin.kpr' }, { ic: 'cash', k: 'p.fin.cash' }, { ic: 'doc', k: 'p.fin.plan' }].map(f => (
              <div key={f.k} onClick={() => onNav && onNav('finance')} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(26,111,168,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={f.ic} size={22} /></div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{t(f.k)}</div>
                <span className="p-link" style={{ fontSize: 13 }}>Open <PIcon name="arrowR" size={13} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell / advertise CTA */}
      <section className="pwrap p-section">
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 22 }}>
          <div style={{ background: 'var(--ink)', color: '#fff', borderRadius: 12, padding: '36px 38px', position: 'relative', overflow: 'hidden' }}>
            <PIcon name="home" size={28} />
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 26, margin: '14px 0 10px' }}>{t('p.sell.title')}</h3>
            <p style={{ fontSize: 14, color: 'rgba(250,250,247,0.72)', lineHeight: 1.6, marginBottom: 22, maxWidth: 380 }}>{t('p.sell.sub')}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="p-btn p-btn-cyan" onClick={() => onNav && onNav('sell')}>{t('p.sell.cta')}</button>
              <button className="p-btn p-btn-white" onClick={() => onNav && onNav('ai')}>{t('p.sell.cta2')}</button>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #1A6FA8, #3BC4D9)', color: '#fff', borderRadius: 12, padding: '36px 38px', position: 'relative', overflow: 'hidden' }}>
            <PIcon name="megaphone" size={28} />
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 26, margin: '14px 0 10px' }}>{t('p.adv.title')}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 22, maxWidth: 380 }}>{t('p.adv.sub')}</p>
            <button className="p-btn p-btn-white" onClick={() => onNav && onNav('advertise')}>{t('p.adv.title')} <PIcon name="arrowR" size={15} /></button>
          </div>
        </div>
      </section>

      <PortalFooter />
    </div>
  );
};

export default PortalHome;
