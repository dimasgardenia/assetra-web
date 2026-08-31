/* Portal Listing Detail */
import React from 'react';
import { useT } from '../i18n';
import { Photo2 } from '../shared-v2';
import { PIcon, fmtRpFull, PortalNav, PortalFooter, PCard, AdSlot, PLISTINGS } from './shared';
import { api } from '../api/client';
import { useUser } from '../store';
import { useIsMobile } from '../lib/useIsMobile';
import { Spinner } from './Loading';
import AIChatBox from './AIChatBox';

/* Gerbang login: kartu terkunci untuk konten yang butuh masuk dulu
   (lokasi peta & nomor kontak agen). */
const LoginGate = ({ lang, onNav, height, title, sub }) => (
  <div style={{ height, minHeight: 150, borderRadius: 10, border: '1px dashed var(--line)', background: 'rgba(26,111,168,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 20 }}>
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(26,111,168,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}><PIcon name="lock" size={20} /></div>
    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{title || (lang === 'id' ? 'Masuk untuk melihat' : 'Sign in to view')}</div>
    <div style={{ fontSize: 12.5, color: 'var(--muted)', maxWidth: 260, lineHeight: 1.5 }}>{sub}</div>
    <button className="p-btn p-btn-cyan p-btn-sm" style={{ marginTop: 2 }} onClick={() => onNav && onNav('signin')}>{lang === 'id' ? 'Masuk / Daftar' : 'Sign in / Register'}</button>
  </div>
);

const PortalDetail = ({ lang, onLang, onNav, listing }) => {
  const { t } = useT();
  const user = useUser();
  /* Akses fitur butuh login DAN email terverifikasi. */
  const isVerified = !!user && !!user.emailVerified;
  const gateNeedsVerify = !!user && !user.emailVerified; // login tapi belum verifikasi
  const isMobile = useIsMobile();
  const l = listing || PLISTINGS[0];
  /* Judul & pesan gerbang berbeda: belum masuk vs sudah masuk tapi belum verifikasi. */
  const gateTitle = (idText, enText, verifyId, verifyEn) => gateNeedsVerify ? (lang === 'id' ? verifyId : verifyEn) : (lang === 'id' ? idText : enText);
  const [tab, setTab] = React.useState('overview');
  const similar = PLISTINGS.filter(x => x.id !== l.id).slice(0, 3);

  /* Foto agen dikelola di back office — cocokkan berdasarkan nama agen listing. */
  const [agentPhoto, setAgentPhoto] = React.useState(null);
  React.useEffect(() => {
    setAgentPhoto(null);
    if (!l.agent) return;
    let alive = true;
    api.get('/api/agents').then(r => {
      if (!alive) return;
      const match = (r.data || []).find(a => a.name?.toLowerCase() === l.agent.toLowerCase());
      if (match?.photo) setAgentPhoto(match.photo);
    }).catch(() => {});
    return () => { alive = false; };
  }, [l.agent]);

  /* Nomor kontak diambil dari server HANYA saat sudah login (endpoint wajib auth).
     Nomor tidak pernah ada di bundle frontend maupun payload tamu. */
  const [contactPhone, setContactPhone] = React.useState(null);
  React.useEffect(() => {
    setContactPhone(null);
    if (!isVerified) return;
    let alive = true;
    api.get('/api/contact' + (l.agent ? `?agent=${encodeURIComponent(l.agent)}` : ''))
      .then(r => { if (alive && r.data?.whatsapp) setContactPhone(r.data.whatsapp); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isVerified, l.agent]);

  /* ── Lightbox gallery ──
     Uploaded photos (DB listings) come first; otherwise 8 demo shots. */
  const gallery = (l.imgs && l.imgs.length)
    ? l.imgs.map(src => ({ src }))
    : Array.from({ length: 8 }, (_, i) => ({
        kind: [l.kind || 'property', 'apartment', 'villa', 'commercial', 'land', 'property', 'apartment', 'villa'][i],
        seed: `pd-${l.id}-${i + 1}`,
      }));
  const [lb, setLb] = React.useState(null); // index foto yang dibuka, null = tertutup
  const nGal = gallery.length;
  const lbPrev = (e) => { e && e.stopPropagation(); setLb(v => (v - 1 + nGal) % nGal); };
  const lbNext = (e) => { e && e.stopPropagation(); setLb(v => (v + 1) % nGal); };
  React.useEffect(() => {
    if (lb == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLb(null);
      else if (e.key === 'ArrowLeft') lbPrev();
      else if (e.key === 'ArrowRight') lbNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lb == null]);

  const GalImg = ({ item, cover }) => item.src
    ? <img src={item.src} alt="" style={{ width: '100%', height: '100%', objectFit: cover ? 'cover' : 'contain', display: 'block' }} />
    : <Photo2 kind={item.kind} seed={item.seed} />;

  return (
    <div className="pscreen">
      <PortalNav active="buy" lang={lang} onLang={onLang} onNav={onNav} />

      {/* breadcrumb */}
      <div className="pwrap" style={{ padding: '14px 32px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="p-link" style={{ fontSize: 11, color: 'var(--muted)' }} onClick={() => onNav && onNav('search')}>{t('p.nav.buy')}</span>
        {/* breadcrumb lokasi dari alamat listing: "Menteng, Jakarta Pusat" → JAKARTA PUSAT / MENTENG */}
        {(String(l.addr || '').split(',').map(s => s.trim()).filter(Boolean).slice(-2).reverse()).map((part, i, arr) => (
          <React.Fragment key={i}>
            <PIcon name="chevR" size={10} />
            <span style={i === arr.length - 1 ? { color: 'var(--ink)' } : undefined}>{part.toUpperCase()}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Gallery */}
      <div className="pwrap" style={{ paddingBottom: 24 }}>
        {isMobile ? (
          /* Ponsel: satu foto sampul + tombol "lihat semua". */
          <div onClick={() => setLb(0)} style={{ position: 'relative', height: 240, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
            <GalImg item={gallery[0]} cover />
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(10,22,64,0.8)', color: '#fff', borderRadius: 8, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 12 }}>
              <PIcon name="cam" size={14} /> {nGal}
            </div>
          </div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 460, borderRadius: 10, overflow: 'hidden' }}>
          {/* Klik foto mana pun → lightbox. Foto unggahan (DB) tampil lebih dulu. */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} onClick={() => setLb(Math.min(i, nGal - 1))} style={{ cursor: 'pointer', ...(i === 0 ? { gridRow: 'span 2', position: 'relative' } : {}) }}>
              <GalImg item={gallery[Math.min(i, nGal - 1)]} cover />
            </div>
          ))}
          <div onClick={() => setLb(Math.min(4, nGal - 1))} style={{ position: 'relative', cursor: 'pointer' }}>
            <GalImg item={gallery[Math.min(4, nGal - 1)]} cover />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,64,0.65)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <PIcon name="cam" size={22} /><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{lang === 'id' ? 'Lihat semua foto' : 'View all photos'} ({nGal})</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── Lightbox carousel ── */}
      {lb != null && (
        <div onClick={() => setLb(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(6,10,30,0.93)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* close */}
          <button onClick={() => setLb(null)} aria-label="Close" style={{ position: 'absolute', top: 20, right: 24, width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
          {/* prev */}
          <button onClick={lbPrev} aria-label="Previous" style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {/* photo */}
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(1100px, 86vw)', height: 'min(720px, 80vh)', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
            <GalImg item={gallery[lb]} />
          </div>
          {/* next */}
          <button onClick={lbNext} aria-label="Next" style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {/* counter + title */}
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.08em' }}>{lb + 1} / {nGal}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{l.title}</div>
          </div>
        </div>
      )}

      <div className="pwrap" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 24 : 36, paddingBottom: 56, alignItems: 'flex-start' }}>
        {/* Left */}
        <main style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span className={`p-tag ${l.mode === 'rent' ? 'rent' : l.mode === 'new' ? 'new' : 'sale'}`} style={{ fontSize: 10 }}>
              {l.mode === 'rent' ? (lang === 'id' ? 'DISEWA' : 'FOR RENT') : l.mode === 'new' ? (lang === 'id' ? 'PROPERTI BARU' : 'NEW PROJECT') : (lang === 'id' ? 'DIJUAL' : 'FOR SALE')}
            </span>
            {l.sponsored && <span className="p-tag sponsor" style={{ fontSize: 10 }}>★ SPONSORED</span>}
            {l.featured && !l.sponsored && <span className="p-tag featured" style={{ fontSize: 10 }}>FEATURED</span>}
            {(l.cert || !l.fromDb) && <span className="p-tag" style={{ fontSize: 10, border: '1px solid var(--line)' }}>{l.cert || 'SHM'}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 34, letterSpacing: '-0.02em', margin: 0 }}>{l.title}</h1>
              <div style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><PIcon name="pin" size={15} /> {l.addr}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 38, color: 'var(--ink)', margin: '18px 0 4px' }}>{fmtRpFull(l.price)}</div>

          {/* spec strip — real data for DB listings; demo values for the sample set */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)', borderRadius: 10, marginTop: 20, overflow: 'hidden' }}>
            {[
              { ic: 'bed', v: l.beds, k: 'p.d.bed' },
              { ic: 'bath', v: l.baths, k: 'p.d.bath' },
              { ic: 'ruler', v: l.area != null ? l.area + ' m²' : null, k: 'p.d.land' },
              { ic: 'building', v: l.buildingArea != null ? l.buildingArea + ' m²' : (l.fromDb ? null : '320 m²'), k: 'p.d.building' },
              { ic: 'home', v: l.floors != null ? l.floors : (l.fromDb ? null : '2'), k: 'p.d.floors' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: 0, padding: isMobile ? '12px 8px' : '16px 18px', borderRight: i < 4 ? '1px solid var(--line)' : 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: 'var(--teal)' }}><PIcon name={s.ic} size={isMobile ? 15 : 18} /></span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 15 : 20 }}>{s.v ?? '—'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>{t(s.k)}</span>
              </div>
            ))}
          </div>

          {/* AI investment chat — free for buyers, real Claude API */}
          <AIChatBox lang={lang} property={l} onNav={onNav} />

          {/* tabs */}
          <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--line)', marginTop: 28 }}>
            {['overview', 'facilities', 'location', 'financing'].map(tx => (
              <span key={tx} onClick={() => setTab(tx)} style={{ padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: tab === tx ? 'var(--ink)' : 'var(--muted)', borderBottom: tab === tx ? '2px solid var(--teal)' : '2px solid transparent', marginBottom: -1 }}>{t('p.d.' + tx)}</span>
            ))}
          </div>

          <div style={{ paddingTop: 22 }}>
            {tab === 'overview' && (() => {
              /* DB listings show their own description; the demo set keeps its sample copy. */
              const specRows = l.fromDb
                ? [
                    l.cert && ['p.d.cert', l.cert],
                    l.yearBuilt && ['p.d.year', String(l.yearBuilt)],
                    l.buildingArea != null && ['p.d.building', l.buildingArea + ' m²'],
                    l.area != null && ['p.d.land', l.area + ' m²'],
                    l.floors != null && ['p.d.floors', String(l.floors)],
                    l.beds != null && ['p.d.bed', String(l.beds)],
                  ].filter(Boolean)
                : [['p.d.cert', 'SHM (Hak Milik)'], ['p.d.year', '1958 · Renov. 2023'], ['p.d.facing', 'North-East'], ['p.d.power', '13,200 VA'], ['p.d.garage', '3 cars'], ['p.d.building', '320 m²']];
              return (
                <>
                  {l.fromDb ? (
                    l.desc
                      ? <p style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink-2)', margin: 0, whiteSpace: 'pre-wrap' }}>{l.desc}</p>
                      : <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{lang === 'id' ? 'Belum ada deskripsi untuk listing ini.' : 'No description yet for this listing.'}</p>
                  ) : (
                    <>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 14px' }}>A landmark heritage townhouse in the heart of Menteng, Jakarta's most prestigious address.</p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>Fully renovated in 2023, this four-bedroom residence blends colonial architecture with modern interiors. Features a private garden, staff quarters, and secure carport for three cars. Walking distance to Taman Suropati and embassy row. SHM freehold title, all taxes current.</p>
                    </>
                  )}
                  {specRows.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 32px', marginTop: 22 }}>
                      {specRows.map(([k, v], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line-2)', fontSize: 13.5 }}>
                          <span style={{ color: 'var(--muted)' }}>{t(k)}</span><span style={{ fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
            {tab === 'facilities' && (() => {
              const facs = l.fromDb
                ? (l.facilities || [])
                : ['Private garden', 'Swimming pool', 'Staff quarters', '24h security', 'CCTV', 'Smart home', 'Solar panels', 'Water heater', 'Carport ×3'];
              return facs.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
                  {facs.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13.5 }}>
                      <span style={{ color: 'var(--green)' }}><PIcon name="check" size={16} /></span> {f}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{lang === 'id' ? 'Fasilitas belum dicantumkan.' : 'No facilities listed yet.'}</p>
              );
            })()}
            {tab === 'location' && (
              isVerified ? (
                /* Hanya RADIUS perkiraan area — bukan titik persis. Lokasi tepat
                   diberikan oleh agen Assetra / agen terverifikasi saat kontak. */
                <div>
                  <div style={{ height: 320, borderRadius: 10, position: 'relative', overflow: 'hidden', border: '1px solid var(--line)', background: 'linear-gradient(135deg, #e8edf5, #dce6f0)' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(26,111,168,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(26,111,168,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    {/* Lingkaran radius (area perkiraan), tanpa penanda titik tepat */}
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,111,168,0.22) 0%, rgba(26,111,168,0.12) 55%, rgba(26,111,168,0.04) 100%)', border: '2px dashed rgba(26,111,168,0.55)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--ink)', textAlign: 'center' }}>
                      <PIcon name="pin" size={18} />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-2)' }}>± 1 km</span>
                    </div>
                    {/* Badge sudut: perkiraan area */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.05em', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PIcon name="lock" size={12} /> {lang === 'id' ? 'PERKIRAAN AREA' : 'APPROX. AREA'}
                    </div>
                  </div>
                  <div style={{ marginTop: 12, background: 'rgba(26,111,168,0.06)', border: '1px solid rgba(26,111,168,0.2)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }}><PIcon name="shield" size={16} /></span>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                      {lang === 'id'
                        ? 'Peta menampilkan perkiraan area (radius), bukan titik persis. Untuk alamat & lokasi tepat, hubungi agen Assetra atau agen terverifikasi lewat tombol kontak.'
                        : 'The map shows an approximate area (radius), not the exact point. For the precise address & location, contact an Assetra or verified agent via the contact buttons.'}
                    </div>
                  </div>
                </div>
              ) : (
                <LoginGate lang={lang} onNav={onNav} height={320}
                  title={gateTitle('Masuk untuk melihat lokasi', 'Sign in to view the location', 'Verifikasi email untuk melihat lokasi', 'Verify your email to view the location')}
                  sub={gateNeedsVerify
                    ? (lang === 'id' ? 'Verifikasi email Anda dulu (cek kotak masuk) untuk membuka peta lokasi.' : 'Verify your email first (check your inbox) to unlock the location map.')
                    : (lang === 'id' ? 'Peta & titik lokasi properti hanya tersedia untuk pengguna terverifikasi.' : 'The property map & pin are only available to verified users.')} />
              )
            )}
            {tab === 'financing' && (() => {
              /* Estimasi cicilan KPR untuk harga properti ini: DP 20%, tenor 20 thn. */
              const dpPct = 0.20, tenorYears = 20, n = tenorYears * 12;
              const loan = Math.round((l.price || 0) * (1 - dpPct));
              const monthly = (fixedRate) => {
                const rr = fixedRate / 100 / 12;
                return rr > 0 ? loan * rr * Math.pow(1 + rr, n) / (Math.pow(1 + rr, n) - 1) : loan / n;
              };
              const banks = [
                { bank: 'Bank Mandiri', product: 'KPR Mandiri Fix', fixed: 3.88, fixedFor: '3 thn', best: true },
                { bank: 'BCA', product: 'KPR BCA Fix & Cap', fixed: 4.25, fixedFor: '3 thn' },
                { bank: 'CIMB Niaga', product: 'KPR Xtra', fixed: 4.55, fixedFor: '3 thn' },
                { bank: 'BNI', product: 'BNI Griya', fixed: 4.75, fixedFor: '5 thn' },
                { bank: 'BRI', product: 'KPR BRI', fixed: 5.10, fixedFor: '2 thn' },
              ];
              return (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, fontSize: 12.5, color: 'var(--muted)' }}>
                    <span>{lang === 'id' ? 'Estimasi cicilan berdasarkan:' : 'Estimated installment based on:'}</span>
                    <b style={{ color: 'var(--ink)' }}>DP 20% ({fmtRpFull(Math.round((l.price || 0) * dpPct))})</b>
                    <span>·</span><b style={{ color: 'var(--ink)' }}>{lang === 'id' ? 'Tenor 20 tahun' : '20-year tenor'}</b>
                    <span>·</span><span>{lang === 'id' ? 'Pinjaman' : 'Loan'} {fmtRpFull(loan)}</span>
                  </div>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: isMobile ? 460 : 'auto', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--paper-2)' }}>
                          {[lang === 'id' ? 'Bank' : 'Bank', lang === 'id' ? 'Produk' : 'Product', lang === 'id' ? 'Bunga fix' : 'Fixed', lang === 'id' ? 'Est. cicilan/bln' : 'Est. /month'].map((h, i) => (
                            <th key={i} style={{ padding: '11px 14px', textAlign: i >= 2 ? 'right' : 'left', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {banks.map((b, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--line)', background: b.best ? 'rgba(59,196,217,0.05)' : 'transparent' }}>
                            <td style={{ padding: '13px 14px', fontWeight: 700, fontSize: 13.5 }}>
                              {b.bank}
                              {b.best && <span style={{ marginLeft: 7, fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.06em', color: 'var(--teal)', background: 'rgba(26,111,168,0.1)', padding: '2px 6px', borderRadius: 4, verticalAlign: 'middle' }}>{lang === 'id' ? 'TERBAIK' : 'BEST'}</span>}
                            </td>
                            <td style={{ padding: '13px 14px', fontSize: 12.5, color: 'var(--muted)' }}>{b.product}</td>
                            <td style={{ padding: '13px 14px', textAlign: 'right', fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--teal)' }}>{String(b.fixed).replace('.', ',')}%<span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}> · {b.fixedFor}</span></td>
                            <td style={{ padding: '13px 14px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>{fmtRpFull(Math.round(monthly(b.fixed)))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 14 }}>
                    <button className="p-btn p-btn-cyan p-btn-sm" onClick={() => onNav && onNav('finance')}><PIcon name="calc" size={14} /> {t('p.d.calcCta')}</button>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{lang === 'id' ? 'Angka estimasi; bunga floating berlaku setelah periode fix. Ajukan untuk penawaran resmi.' : 'Estimates only; floating rate applies after the fixed period.'}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* similar */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, margin: '0 0 18px' }}>{t('p.d.similar')}</h3>
            <div className="p-grid">
              {similar.map(s => <PCard key={s.id} l={s} onNav={onNav} />)}
            </div>
          </div>
        </main>

        {/* Right sticky */}
        <aside style={{ position: 'sticky', top: 80 }}>
          {/* financing widget */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 22, marginBottom: 14, boxShadow: 'var(--p-card-shadow)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>{t('p.d.estPay')}</div>
            {/* KPR estimate from the actual price: 20% DP, 20yr fixed 7.25% */}
            <div style={{ fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--ink)' }}>
              {(() => {
                const loan = (l.price || 0) * 0.8;
                const r = 0.0725 / 12, n = 240;
                const m = loan > 0 ? loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : 0;
                return m >= 1e9 ? `Rp ${(m / 1e9).toFixed(2).replace('.', ',')} M` : `Rp ${(m / 1e6).toFixed(1).replace('.', ',')} jt`;
              })()}
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>{t('p.card.month')}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>{t('p.d.estVia')}</div>
            <button className="p-btn p-btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={() => onNav && onNav('finance')}><PIcon name="calc" size={15} /> {t('p.d.calcCta')}</button>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="p-btn p-btn-ghost p-btn-sm" style={{ flex: 1 }} onClick={() => onNav && onNav('finance')}>{t('p.d.cash')}</button>
              <button className="p-btn p-btn-ghost p-btn-sm" style={{ flex: 1 }} onClick={() => onNav && onNav('finance')}>{t('p.d.preapproved')}</button>
            </div>
          </div>

          {/* agent card */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 22, boxShadow: 'var(--p-card-shadow)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              {agentPhoto
                ? <img src={agentPhoto} alt={l.agent} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontWeight: 600, flexShrink: 0 }}>{l.agentInit}</div>}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{l.agent}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.agency}</div>
                <div style={{ fontSize: 11, color: 'var(--gold-2)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}><PIcon name="star" size={11} /> 4.9 · 142 deals</div>
              </div>
            </div>
            {(() => {
              /* Nomor kontak diambil dari server (endpoint wajib login) — tidak
                 di-hardcode di frontend. Tamu tidak pernah menerima nomornya. */
              const agentPhone = contactPhone;
              const price = l.price ? fmtRpFull(l.price) : '';
              const waText = encodeURIComponent(
                `Halo ${l.agent || 'Assetra'}, saya tertarik dengan listing "${l.title}"${price ? ` (${price})` : ''} di Assetra${l.addr ? `, ${l.addr}` : ''}. Apakah masih tersedia?`);
              const surveyText = encodeURIComponent(
                `Halo ${l.agent || 'Assetra'}, saya ingin menjadwalkan survei lokasi untuk "${l.title}"${l.addr ? ` di ${l.addr}` : ''}. Kapan waktu yang memungkinkan?`);
              /* Catat prospek (best-effort) — tidak menghalangi buka WhatsApp/telepon. */
              const captureLead = (type) => {
                api.post('/api/leads', {
                  listingId: l.id, listingTitle: l.title, type,
                  message: type === 'survey' ? 'Minta survei lokasi' : type === 'call' ? 'Telepon agen' : 'Tanya via WhatsApp',
                }).catch(() => {});
              };
              /* Nomor kontak (WhatsApp/telepon) hanya untuk pengguna terverifikasi. */
              if (!isVerified) {
                return (
                  <LoginGate lang={lang} onNav={onNav} height={128}
                    title={gateTitle('Masuk untuk menghubungi agen', 'Sign in to contact the agent', 'Verifikasi email untuk menghubungi agen', 'Verify your email to contact the agent')}
                    sub={gateNeedsVerify
                      ? (lang === 'id' ? 'Verifikasi email Anda dulu untuk melihat nomor & menghubungi agen.' : 'Verify your email first to see the number & contact the agent.')
                      : (lang === 'id' ? 'Nomor WhatsApp & telepon agen hanya tampil untuk pengguna terverifikasi.' : 'The agent’s WhatsApp & phone number are shown to verified users only.')} />
                );
              }
              /* Sudah login tapi nomor belum tiba dari server. */
              if (!agentPhone) {
                return <button className="p-btn p-btn-cyan" style={{ width: '100%', opacity: 0.75, cursor: 'default' }} disabled><Spinner size={15} color="#fff" /> {lang === 'id' ? 'Memuat kontak…' : 'Loading contact…'}</button>;
              }
              return (
                <>
                  <a href={`https://wa.me/${agentPhone}?text=${waText}`} target="_blank" rel="noopener noreferrer" onClick={() => captureLead('whatsapp')} className="p-btn p-btn-cyan" style={{ width: '100%', marginBottom: 8, textDecoration: 'none' }}><PIcon name="chat" size={15} /> {t('p.d.whatsapp')}</a>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${agentPhone}`} onClick={() => captureLead('call')} className="p-btn p-btn-ghost" style={{ flex: 1, textDecoration: 'none' }}><PIcon name="phone" size={15} /> {t('p.d.call')}</a>
                    <a href={`https://wa.me/${agentPhone}?text=${surveyText}`} target="_blank" rel="noopener noreferrer" onClick={() => captureLead('survey')} className="p-btn p-btn-ghost" style={{ flex: 1, textDecoration: 'none' }}>{t('p.d.tour')}</a>
                  </div>
                </>
              );
            })()}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <PIcon name="shield" size={12} /> VERIFIED AGENT
            </div>
          </div>

          {/* sidebar ad */}
          <div style={{ marginTop: 14 }}><AdSlot variant="box" bank="cimb" placement="detail-box" style={{ minHeight: 260 }} /></div>
        </aside>
      </div>

      <PortalFooter />
    </div>
  );
};

export default PortalDetail;
