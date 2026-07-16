/* Detail v2 - trust-forward listing detail */
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Photo2, Countdown2, Logo2, Nav2, TrustRibbon, TrustSeal, fmtIDR, fmtIDRShort, getListingPhotos } from '../shared-v2';
import { useListings } from '../store';
import { listingsApi } from '../api/listings';
import Lightbox from '../Lightbox';

const DetailScreenV2 = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const allListings = useListings();
  const decodedId = id ? decodeURIComponent(id) : null;
  const cached = (decodedId && allListings.find(x => x.id === decodedId)) || allListings[0];
  const [fetched, setFetched] = React.useState(null);
  const [loadError, setLoadError] = React.useState(null);

  React.useEffect(() => {
    if (!decodedId) return;
    if (cached?.id === decodedId) { setFetched(cached); return; }
    listingsApi.get(decodedId).then(r => setFetched(r.data)).catch(e => setLoadError(e.message));
  }, [decodedId, cached?.id]);

  const l = fetched || cached;
  const [activeTab, setActiveTab] = React.useState('details');

  if (loadError) {
    return (
      <div className="as-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>● ERROR · {loadError}</div>
        <Link to="/" style={{ color: 'var(--teal)' }}>← Kembali ke beranda</Link>
      </div>
    );
  }
  if (!l) {
    return (
      <div className="as-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>◆ Memuat listing…</div>
      </div>
    );
  }
  const photos = React.useMemo(() => {
    // Prefer uploaded photos (admin-supplied); fall back to stock Unsplash photos.
    if (l.uploadedPhotos && l.uploadedPhotos.length > 0) {
      const total = Math.max(l.uploadedPhotos.length, 5);
      const stock = getListingPhotos(l, total - l.uploadedPhotos.length, 1800);
      return [...l.uploadedPhotos, ...stock].slice(0, Math.max(total, 24));
    }
    return getListingPhotos(l, l.photos || 24, 1800);
  }, [l]);
  const [lightbox, setLightbox] = React.useState(null); // null or { index }
  const openLightbox = (index) => setLightbox({ index });
  const closeLightbox = () => setLightbox(null);

  return (
    <div className="as-screen">
      <TrustRibbon />
      <Nav2 lang={lang} onLang={onLang} />

      {/* Breadcrumb + verify badge */}
      <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: '0.05em' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t('crumb.browse')}</Link><Icon2 name="chevR" size={10} /><span>{(l.typeLabel || t('search.residential')).toUpperCase()}</span><Icon2 name="chevR" size={10} /><span>{(l.region || '').toUpperCase()}</span><Icon2 name="chevR" size={10} /><span style={{ color: 'var(--ink)' }}>{l.id}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="as-license-plate"><span className="as-license-plate-num">{t('nav.verified')}</span> {t('crumb.trustScore', l.trustScore)}</span>
          <span style={{ color: 'var(--green)' }}>● {t('crumb.docs')}</span>
        </div>
      </div>

      {/* Gallery */}
      <section style={{ padding: '24px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 520 }}>
          <div onClick={() => openLightbox(0)} style={{ gridRow: 'span 2', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Photo2 kind={l.type} src={photos[0]} seed={l.id} tag={`HERO · 01/${photos.length}`} w={2000} />
          </div>
          <div onClick={() => openLightbox(1)} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Photo2 kind={l.type} src={photos[1]} seed={`${l.id}-2`} tag="02" />
          </div>
          <div onClick={() => openLightbox(2)} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Photo2 kind={l.type} src={photos[2]} seed={`${l.id}-3`} tag="03" />
          </div>
          <div onClick={() => openLightbox(3)} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Photo2 kind={l.type} src={photos[3]} seed={`${l.id}-4`} tag="04" />
          </div>
          <div onClick={() => openLightbox(4)} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <Photo2 kind={l.type} src={photos[4]} seed={`${l.id}-5`} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,27,46,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, color: 'var(--paper)' }}>
              <Icon2 name="grid" size={20} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em' }}>+{Math.max(0, photos.length - 5)} MORE</div>
            </div>
          </div>
        </div>
      </section>
      {lightbox && <Lightbox photos={photos} initialIndex={lightbox.index} onClose={closeLightbox} />}

      {/* Title */}
      <section style={{ padding: '32px 40px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'end', paddingBottom: 28, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="as-pill as-pill-live">{t('d.live')}</span>
              <span className="as-pill as-pill-verified"><Icon2 name="shield" size={9} /> {t('d.kemenkeu')}</span>
              <span className="as-pill"><Icon2 name="bank" size={9} /> {t('d.escrowActive')}</span>
              <span className="as-pill"><Icon2 name="scale" size={9} /> {t('d.notarized')}</span>
              <span className="as-pill">{t('d.reserveMet')}</span>
            </div>
            <div className="as-eyebrow" style={{ marginBottom: 6 }}>{t('d.listing')} {l.id}</div>
            <h1 className="as-display" style={{ fontSize: 76, margin: 0, maxWidth: 900, color: 'var(--ink)' }}>{l.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 14, color: 'var(--muted)' }}>
              <Icon2 name="pin" size={14} /> {l.address}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <TrustSeal label="KEMENKEU" sub="DJKN" mark="K" />
            <TrustSeal label="BPN" sub="VERIFIED" mark="B" />
            <TrustSeal label="NOTARIS" sub="H. SURYA" mark="N" />
          </div>
        </div>
      </section>

      {/* Two-column */}
      <section style={{ padding: '32px 40px 60px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60, alignItems: 'flex-start' }}>
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '20px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
            <div style={{ borderRight: '1px solid var(--line)', paddingRight: 20 }}>
              <div className="as-stat-label">{t('d.landArea')}</div>
              <div className="as-display" style={{ fontSize: 28 }}>850<span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', marginLeft: 4 }}>m²</span></div>
            </div>
            <div style={{ borderRight: '1px solid var(--line)', padding: '0 20px' }}>
              <div className="as-stat-label">{t('d.building')}</div>
              <div className="as-display" style={{ fontSize: 28 }}>620<span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', marginLeft: 4 }}>m²</span></div>
            </div>
            <div style={{ borderRight: '1px solid var(--line)', padding: '0 20px' }}>
              <div className="as-stat-label">{t('d.cert')}</div>
              <div className="as-display" style={{ fontSize: 28 }}>SHM</div>
            </div>
            <div style={{ paddingLeft: 20 }}>
              <div className="as-stat-label">{t('d.year')}</div>
              <div className="as-display" style={{ fontSize: 28 }}>2018</div>
            </div>
          </div>

          {/* Escrow flow */}
          <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('d.escrowFlow')}</div>
          <div className="as-escrow" style={{ marginBottom: 32 }}>
            <div className="as-escrow-step done">
              <div className="as-escrow-icon"><Icon2 name="check" size={20} stroke={2.4} /></div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>1. {t('d.kycVerified')}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('d.kycSub')}</div>
            </div>
            <div className="as-escrow-arrow">→</div>
            <div className="as-escrow-step active">
              <div className="as-escrow-icon"><Icon2 name="lock" size={18} /></div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>2. {t('d.depositEscrow')}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('d.depositSub')}</div>
            </div>
            <div className="as-escrow-arrow">→</div>
            <div className="as-escrow-step">
              <div className="as-escrow-icon"><Icon2 name="handshake" size={18} /></div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>3. {t('d.settlement')}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('d.settlementSub')}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="as-tabs" style={{ marginBottom: 8 }}>
            {[
              { id: 'details', label: t('tab.details'), num: '01' },
              { id: 'bidding', label: t('tab.bidding'), num: '02' },
              { id: 'seller', label: t('tab.seller'), num: '03' },
              { id: 'audit', label: t('tab.audit'), num: '04' },
            ].map(tab => (
              <div key={tab.id} className={`as-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <span className="as-tab-num">{tab.num}</span> {tab.label}
              </div>
            ))}
          </div>

          {activeTab === 'details' && <DetailsV2 />}
          {activeTab === 'bidding' && <BiddingV2 />}
          {activeTab === 'seller' && <SellerV2 />}
          {activeTab === 'audit' && <AuditV2 />}
        </div>

        {/* Bid panel */}
        <aside style={{ position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
          <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)' }}>
            {/* Trust header */}
            <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Icon2 name="lock" size={12} /> {t('bp.secure')}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.08em' }}>{t('bp.ssl')}</span>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span className="as-pill as-pill-live">{t('bp.live')}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{t('bp.bidsBidders', l.bids, l.bidders)}</span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div className="as-eyebrow" style={{ marginBottom: 6 }}>{t('bp.currentBid')}</div>
                <div className="as-display as-num" style={{ fontSize: 44, lineHeight: 1, color: 'var(--ink)' }}>{fmtIDRShort(l.currentBid)}</div>
                <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)', marginTop: 6 }}>
                  {t('bp.reserveUp')}
                </div>
              </div>

              {/* Countdown */}
              <div style={{ background: 'var(--paper-2)', padding: '16px 18px', marginBottom: 20, border: '1px solid var(--line)' }}>
                <div className="as-eyebrow" style={{ marginBottom: 8 }}>{t('bp.closesIn')}</div>
                <div style={{ color: 'var(--ink)' }}><Countdown2 endDate={l.endDate} size="lg" /></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 8, letterSpacing: '0.05em' }}>{t('bp.closesAt')}</div>
              </div>

              {/* Bid input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="as-eyebrow">{t('bp.yourBid')}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t('bp.minBid')}</span>
                </div>
                <div className="as-bid-input-wrap">
                  <span className="as-bid-prefix">Rp</span>
                  <input className="as-bid-input" defaultValue="8.800.000.000" />
                </div>
              </div>

              <button className="as-btn as-btn-primary as-btn-xl" style={{ width: '100%', marginBottom: 8 }} onClick={() => navigate(`/live/${encodeURIComponent(l.id)}`)}>
                <Icon2 name="lock" size={14} /> {t('bp.placeBid')}
              </button>
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--mono)', marginBottom: 16 }}>
                {t('bp.kycReq')}
              </div>

              {/* Deposit info */}
              <div style={{ background: 'var(--paper-2)', padding: 14, fontSize: 12, lineHeight: 1.5, color: 'var(--ink-2)', borderLeft: '3px solid var(--gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 600 }}>
                  <Icon2 name="bank" size={13} /> {t('bp.refundable')}
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  <strong className="as-num" style={{ color: 'var(--ink)' }}>{fmtIDRShort(l.deposit)}</strong>{(t('bp.refundDesc', '')[1])}
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges below */}
          <div style={{ marginTop: 16, padding: 16, border: '1px solid var(--line)', background: 'var(--paper)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
              <div>
                <Icon2 name="shield" size={20} />
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, color: 'var(--ink-2)' }}>{t('legend.verified')}</div>
              </div>
              <div>
                <Icon2 name="bank" size={20} />
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, color: 'var(--ink-2)' }}>{t('lr.escrow')}</div>
              </div>
              <div>
                <Icon2 name="scale" size={20} />
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, color: 'var(--ink-2)' }}>{t('d.notarized')}</div>
              </div>
            </div>
          </div>

          {/* Help */}
          <div style={{ marginTop: 12, padding: 14, fontSize: 12, color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
            <Icon2 name="phone" size={11} /> {t('bp.help')}
          </div>
        </aside>
      </section>
    </div>
  );
};

const DetailsV2 = () => {
  const { t } = useT();
  return (
  <div className="as-detail-section">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 36 }}>
      <div>
        <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('det.desc')}</div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.4, margin: '0 0 14px', color: 'var(--ink)' }}>
          {t('det.descBody1')}
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
          {t('det.descBody2')}
        </p>
      </div>
      <div>
        <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('det.specs')}</div>
        <dl className="as-key">
          <dt>{t('d.cert')}</dt><dd>{t('det.certVal')}</dd>
          <dt>{t('det.bpn')}</dt><dd className="as-num">№ 12.04.07.18.001847</dd>
          <dt>{t('det.njop')}</dt><dd className="as-num">Rp 6,200,000,000</dd>
          <dt>{t('det.notary')}</dt><dd>H. Surya, S.H., M.Kn.</dd>
          <dt>{t('det.encum')}</dt><dd style={{ color: 'var(--green)' }}>{t('det.none')}</dd>
          <dt>{t('det.liens')}</dt><dd style={{ color: 'var(--green)' }}>{t('det.clear')}</dd>
        </dl>
      </div>
    </div>

    <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('det.docsTitle')}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { name: 'Sertifikat Hak Milik (SHM)', meta: 'PDF · 2.4 MB · Notary verified', verified: true },
        { name: 'IMB · Building Permit', meta: 'PDF · 1.1 MB · Disduk verified', verified: true },
        { name: 'PBB Tax Records 2021–2025', meta: 'PDF · 880 KB · DJP verified', verified: true },
        { name: 'BPN Land Survey', meta: 'PDF · 3.2 MB · BPN issued', verified: true },
        { name: 'Notary Deed (Akta)', meta: 'PDF · 540 KB · H. Surya, S.H.', verified: true },
        { name: 'Environmental Audit (AMDAL)', meta: 'PDF · 1.8 MB · KLHK approved', verified: true },
        { name: 'Architectural Drawings', meta: 'PDF · 12 MB · Original', verified: true },
      ].map((d, i) => (
        <div key={i} className="as-doc">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className={`as-doc-icon ${d.verified ? 'as-doc-icon-verified' : ''}`}>PDF</div>
            <div>
              <div className="as-doc-name">{d.name}</div>
              <div className="as-doc-meta">{d.meta}</div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--mono)' }}>
            <Icon2 name="eye" size={13} /> {t('det.view')}
          </button>
        </div>
      ))}
    </div>
  </div>
  );
};

const BiddingV2 = () => {
  const { t } = useT();
  return (
  <div className="as-detail-section">
    <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('bt.terms')}</div>
    <dl className="as-key" style={{ marginBottom: 24 }}>
      <dt>{t('bt.format')}</dt><dd>{t('bt.formatVal')}</dd>
      <dt>{t('bt.starting')}</dt><dd className="as-num">{fmtIDRShort(LISTINGS_V2[0].startingBid)}</dd>
      <dt>{t('bt.reserve')}</dt><dd className="as-num">{fmtIDRShort(8_500_000_000)} <span style={{ color: 'var(--green)', marginLeft: 6 }}>✓ {t('bt.reserveMet')}</span></dd>
      <dt>{t('bt.buyNow')}</dt><dd className="as-num">{fmtIDRShort(LISTINGS_V2[0].buyNow)}</dd>
      <dt>{t('bt.increment')}</dt><dd className="as-num">Rp 50,000,000</dd>
      <dt>{t('bt.deposit')}</dt><dd className="as-num">{fmtIDRShort(LISTINGS_V2[0].deposit)} · Bank Mandiri</dd>
      <dt>{t('bt.fee')}</dt><dd>{t('bt.feeVal')}</dd>
      <dt>{t('bt.settle')}</dt><dd>{t('bt.settleVal')}</dd>
    </dl>

    <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('bt.required')}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { name: 'Auction Catalogue', meta: 'PDF · 4.8 MB' },
        { name: 'Bidder Agreement (REQUIRED)', meta: 'PDF · 320 KB' },
        { name: 'Escrow Deposit Instructions', meta: 'PDF · 180 KB' },
        { name: 'Settlement Procedure', meta: 'PDF · 240 KB' },
      ].map((d, i) => (
        <div key={i} className="as-doc">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="as-doc-icon">PDF</div>
            <div>
              <div className="as-doc-name">{d.name}</div>
              <div className="as-doc-meta">{d.meta}</div>
            </div>
          </div>
          <Icon2 name="download" size={13} />
        </div>
      ))}
    </div>
  </div>
  );
};

const SellerV2 = () => {
  const { t } = useT();
  return (
  <div className="as-detail-section">
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
      <div className="as-seller-avatar">PT</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: 0 }}>PT Wijaya Estate</h3>
          <span className="as-pill as-pill-verified"><Icon2 name="shield" size={9} /> {t('legend.verified')}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>NPWP 02.345.678.9-012.000 · {t('s.memberSince')}</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '20px 0', marginBottom: 24 }}>
      <div style={{ borderRight: '1px solid var(--line)' }}>
        <div className="as-stat-label">{t('s.listings')}</div>
        <div className="as-display as-num" style={{ fontSize: 28 }}>23</div>
      </div>
      <div style={{ borderRight: '1px solid var(--line)', paddingLeft: 20 }}>
        <div className="as-stat-label">{t('s.successful')}</div>
        <div className="as-display as-num" style={{ fontSize: 28 }}>17</div>
      </div>
      <div style={{ borderRight: '1px solid var(--line)', paddingLeft: 20 }}>
        <div className="as-stat-label">{t('s.disputes')}</div>
        <div className="as-display as-num" style={{ fontSize: 28, color: 'var(--green)' }}>0</div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <div className="as-stat-label">{t('s.trustScore')}</div>
        <div className="as-display as-num" style={{ fontSize: 28 }}>98<span style={{ fontSize: 14, color: 'var(--muted)' }}>/100</span></div>
        <div className="as-meter" style={{ marginTop: 6 }}><div className="as-meter-fill" style={{ width: '98%' }} /></div>
      </div>
    </div>

    <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('s.verifications')}</div>
    {[
      { l: 'Legal entity registered (NPWP)', m: 'Verified · 12 Jan 2024 · DJP' },
      { l: 'Identity verified (e-KTP)', m: 'Verified · 12 Jan 2024 · Dukcapil' },
      { l: 'Asset ownership confirmed', m: 'Verified · 03 Mar 2026 · BPN Bali' },
      { l: 'Notary attestation', m: 'Verified · Notaris H. Surya, S.H., M.Kn.' },
      { l: 'KEMENKEU·DJKN clearance', m: 'Cleared · Reg. 2026/0817' },
      { l: 'AML / PPATK screening', m: 'Cleared · No flags' },
    ].map((v, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px dashed var(--line)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon2 name="check" size={14} stroke={2.4} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{v.l}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{v.m}</div>
        </div>
      </div>
    ))}
  </div>
  );
};

const AuditV2 = () => {
  const { t } = useT();
  return (
  <div className="as-detail-section">
    <div className="as-eyebrow" style={{ marginBottom: 14 }}>{t('a.title')}</div>
    <div className="as-audit">
      {[
        { t: '15:08:42', x: 'Bid placed by #B-0042 — Rp 8,750,000,000', h: '0x4f2a...8c91' },
        { t: '14:56:18', x: 'Bid placed by #B-0017 — Rp 8,700,000,000', h: '0x9e3d...2a44' },
        { t: '14:42:03', x: 'Reserve price met', h: '0x1c8b...f07e' },
        { t: '12:15:22', x: 'Auction opened to verified bidders (14)', h: '0x7a5e...91d2' },
        { t: '08:03:11', x: 'Documents notarized — H. Surya, S.H.', h: '0x2b6f...4e89' },
        { t: '21·APR', x: 'Listing approved by KEMENKEU·DJKN', h: '0x8d4c...1a73' },
        { t: '15·APR', x: 'BPN ownership verified — Reg. 12.04.07.18.001847', h: '0x5e91...c7b2' },
        { t: '02·APR', x: 'Asset submitted by PT Wijaya Estate', h: '0xa2f8...3b19' },
      ].map((e, i) => (
        <div key={i} className="as-audit-row">
          <span className="as-audit-time">{e.t}</span>
          <span className="as-audit-text">{e.x}</span>
          <span className="as-audit-hash">{e.h}</span>
        </div>
      ))}
    </div>
    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 12, letterSpacing: '0.05em' }}>
      {t('a.note')}
    </div>
  </div>
  );
};

export { DetailScreenV2 };
