/* Live Bidding Room v2 - Trustworthy institutional */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Photo2, Countdown2, Logo2, LangSwitch, fmtIDR, fmtIDRShort } from '../shared-v2';
import { useActions, useListings } from '../store';
import { listingsApi } from '../api/listings';

const SEED_BIDS = [
  { who: 'Bidder #B-0042', verified: 'KEMENKEU', amt: 2_450_000_000, t: 0, lead: true, you: false },
  { who: 'Bidder #B-0017', verified: 'BPN', amt: 2_400_000_000, t: 18, you: false },
  { who: 'You', verified: 'KEMENKEU', amt: 2_350_000_000, t: 42, you: true },
  { who: 'Bidder #B-0042', verified: 'KEMENKEU', amt: 2_300_000_000, t: 67, you: false },
  { who: 'Bidder #B-0008', verified: 'BPN', amt: 2_250_000_000, t: 95, you: false },
  { who: 'Bidder #B-0017', verified: 'BPN', amt: 2_200_000_000, t: 142, you: false },
  { who: 'You', verified: 'KEMENKEU', amt: 2_150_000_000, t: 180, you: true },
  { who: 'Bidder #B-0042', verified: 'KEMENKEU', amt: 2_100_000_000, t: 220, you: false },
];

const LiveBidScreenV2 = ({ lang, onLang }) => {
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
  const safeCurrentBid = l?.currentBid || 0;

  const [bids, setBids] = React.useState(() => SEED_BIDS.map(b => ({ ...b, amt: Math.round(safeCurrentBid * (b.amt / 2_450_000_000)) })));
  const [bidAmt, setBidAmt] = React.useState(safeCurrentBid + 50_000_000);
  const [pulse, setPulse] = React.useState(false);

  if (!l) {
    return (
      <div className="as-screen" style={{ background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontFamily: 'var(--mono)', opacity: 0.6 }}>◆ Memuat live bidding…</div>
      </div>
    );
  }

  const placeBid = async () => {
    if (bidAmt <= (bids[0]?.amt || 0)) return;
    setPulse(true);
    try {
      const bid = await actions.placeBid(l.id, bidAmt);
      setBids(b => [{ who: bid.who || 'You', verified: bid.verified || 'KEMENKEU', amt: bidAmt, t: 0, lead: true, you: true }, ...b.map(x => ({ ...x, lead: false, t: x.t + 5 }))]);
      setBidAmt(a => a + 50_000_000);
    } catch (e) {
      actions.showToast('error', e.message || 'Tawaran gagal');
    } finally {
      setTimeout(() => setPulse(false), 600);
    }
  };

  const currentBid = bids[0]?.amt || l.currentBid;
  const youAreLeading = bids[0]?.you;

  return (
    <div className="as-screen" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
      {/* Live header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid rgba(250,250,247,0.12)', background: 'var(--ink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo2 size={28} dark />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--cyan)', textTransform: 'uppercase', borderLeft: '1px solid rgba(250,250,247,0.2)', paddingLeft: 10 }}>{t('lr.liveRoom')}</span>
          </div>
          <div style={{ width: 1, height: 18, background: 'rgba(250,250,247,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(250,250,247,0.7)', fontFamily: 'var(--mono)', letterSpacing: '0.1em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite' }} />
            {t('lr.live', l.id)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, fontFamily: 'var(--mono)', color: 'rgba(250,250,247,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon2 name="lock" size={11} /> SSL·256
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon2 name="bank" size={11} /> {t('lr.escrow')} · MANDIRI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon2 name="shield" size={11} /> {t('lr.recorded')}
          </div>
          {onLang ? (
            <button onClick={() => onLang(lang === 'id' ? 'en' : 'id')} style={{ border: '1px solid rgba(250,250,247,0.2)', background: 'transparent', color: 'var(--paper)', padding: '6px 10px', fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 1 }}>{lang === 'id' ? 'EN' : 'ID'}</button>
          ) : null}
          <button onClick={() => navigate(`/listing/${encodeURIComponent(l.id)}`)} style={{ border: '1px solid rgba(250,250,247,0.2)', background: 'transparent', color: 'var(--paper)', padding: '6px 14px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: 1 }}>{t('lr.exit')}</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', minHeight: 'calc(100% - 50px)' }}>
        {/* Left: Asset preview */}
        <div style={{ padding: 32, borderRight: '1px solid rgba(250,250,247,0.12)' }}>
          <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', marginBottom: 14 }}>
            <Photo2 kind={l.type} seed={l.id} tag="01 OF 11" w={1600} />
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
              <span className="as-pill as-pill-live">{t('lr.liveNow')}</span>
              <span className="as-pill as-pill-verified"><Icon2 name="shield" size={9} /> {t('lr.kemenkeuVerified')}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 24 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ aspectRatio: 1, overflow: 'hidden', opacity: i === 0 ? 1 : 0.5, border: i === 0 ? '1px solid var(--paper)' : '1px solid transparent', cursor: 'pointer' }}>
                <Photo2 kind={l.type} seed={`${l.id}-${i}`} w={400} />
              </div>
            ))}
          </div>

          <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.5)', marginBottom: 6 }}>{l.id} · {t('card.trust')} {l.trustScore}/100</div>
          <h1 className="as-display" style={{ fontSize: 48, margin: '0 0 10px', color: 'var(--paper)' }}>{l.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(250,250,247,0.6)', marginBottom: 24 }}>
            <Icon2 name="pin" size={13} /> {l.address}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid rgba(250,250,247,0.15)', borderBottom: '1px solid rgba(250,250,247,0.15)', padding: '16px 0', marginBottom: 28 }}>
            <div style={{ borderRight: '1px solid rgba(250,250,247,0.1)' }}>
              <div className="as-stat-label" style={{ color: 'rgba(250,250,247,0.5)' }}>{t('lr.landArea')}</div>
              <div className="as-display as-num" style={{ fontSize: 22, color: 'var(--paper)' }}>12,400<span style={{ fontSize: 11, color: 'rgba(250,250,247,0.5)', marginLeft: 3, fontFamily: 'var(--mono)' }}>m²</span></div>
            </div>
            <div style={{ borderRight: '1px solid rgba(250,250,247,0.1)', paddingLeft: 14 }}>
              <div className="as-stat-label" style={{ color: 'rgba(250,250,247,0.5)' }}>{t('lr.cert')}</div>
              <div className="as-display as-num" style={{ fontSize: 22, color: 'var(--paper)' }}>SHM</div>
            </div>
            <div style={{ borderRight: '1px solid rgba(250,250,247,0.1)', paddingLeft: 14 }}>
              <div className="as-stat-label" style={{ color: 'rgba(250,250,247,0.5)' }}>{t('lr.reserve')}</div>
              <div className="as-display as-num" style={{ fontSize: 18, color: 'var(--green)' }}>{t('lr.reserveMet')}</div>
            </div>
            <div style={{ paddingLeft: 14 }}>
              <div className="as-stat-label" style={{ color: 'rgba(250,250,247,0.5)' }}>{t('lr.notary')}</div>
              <div className="as-display as-num" style={{ fontSize: 16, color: 'var(--paper)' }}>H. Surya</div>
            </div>
          </div>

          {/* Trajectory */}
          <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.5)', marginBottom: 12 }}>{t('lr.trajectory')}</div>
          <svg viewBox="0 0 600 130" style={{ width: '100%', height: 130, display: 'block', marginBottom: 24 }}>
            <defs>
              <linearGradient id="bgv2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#B08838" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#B08838" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0,1,2,3,4].map(i => (
              <line key={i} x1="0" x2="600" y1={20 + i*22} y2={20 + i*22} stroke="rgba(250,250,247,0.06)" strokeWidth="1" />
            ))}
            <path d="M 20,105 L 80,100 L 140,90 L 200,75 L 260,70 L 320,52 L 380,46 L 440,38 L 500,28 L 560,20 L 560,130 L 20,130 Z" fill="url(#bgv2)" />
            <path d="M 20,105 L 80,100 L 140,90 L 200,75 L 260,70 L 320,52 L 380,46 L 440,38 L 500,28 L 560,20" fill="none" stroke="#B08838" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {[[20,105],[80,100],[140,90],[200,75],[260,70],[320,52],[380,46],[440,38],[500,28],[560,20]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r={i === 9 ? 4 : 2} fill={i === 9 ? '#B08838' : 'var(--paper)'} stroke={i === 9 ? 'var(--paper)' : 'none'} strokeWidth="1.5" />
            ))}
            <text x="20" y="125" fill="rgba(250,250,247,0.4)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="0.05em">10:30 WIB</text>
            <text x="290" y="125" fill="rgba(250,250,247,0.4)" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle">12:45</text>
            <text x="560" y="125" fill="rgba(250,250,247,0.4)" fontFamily="JetBrains Mono" fontSize="9" textAnchor="end">15:08</text>
            <text x="560" y="14" fill="#B08838" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" fontWeight="600">Rp 2.45 M</text>
          </svg>

          {/* Trust footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ padding: 12, border: '1px solid rgba(250,250,247,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon2 name="shield" size={16} />
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(250,250,247,0.5)' }}>{t('lr.state')}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>KEMENKEU</div>
              </div>
            </div>
            <div style={{ padding: 12, border: '1px solid rgba(250,250,247,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon2 name="bank" size={16} />
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(250,250,247,0.5)' }}>{t('lr.escrow')}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>MANDIRI</div>
              </div>
            </div>
            <div style={{ padding: 12, border: '1px solid rgba(250,250,247,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon2 name="scale" size={16} />
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(250,250,247,0.5)' }}>{t('lr.notaris')}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>H. SURYA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bidding console */}
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
          {/* Big timer */}
          <div style={{ background: 'rgba(250,250,247,0.04)', padding: '24px 28px', marginBottom: 20, position: 'relative', border: '1px solid rgba(250,250,247,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.closingIn')}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em' }}>{t('lr.antiSnipe')}</div>
            </div>
            <div style={{ color: 'var(--paper)' }}>
              <Countdown2 endDate={l.endDate} size="xl" />
            </div>
            <div style={{ fontSize: 10, color: 'rgba(250,250,247,0.5)', fontFamily: 'var(--mono)', marginTop: 12, letterSpacing: '0.05em' }}>
              {t('lr.antiSnipeDesc')}
            </div>
          </div>

          {/* Current bid hero */}
          <div style={{ padding: '24px 28px', border: `1px solid ${pulse ? 'var(--gold)' : 'rgba(250,250,247,0.15)'}`, marginBottom: 20, background: pulse ? 'rgba(176,136,56,0.12)' : 'transparent', transition: 'all .3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.currentBidN', bids.length)}</div>
              {youAreLeading ? (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--green)' }}>{t('lr.leading')}</span>
              ) : (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--red)' }}>{t('lr.outbid')}</span>
              )}
            </div>
            <div className="as-display as-num" style={{ fontSize: 56, lineHeight: 1, color: 'var(--paper)' }}>
              {fmtIDRShort(currentBid)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(250,250,247,0.5)', fontFamily: 'var(--mono)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>{bids[0]?.you ? t('lr.yourBid') : t('lr.heldBy', bids[0]?.who, bids[0]?.verified)}</span>
              <span>{t('lr.ago', bids[0]?.t)}</span>
            </div>
          </div>

          {/* Bid input */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.nextBid')}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(250,250,247,0.5)' }}>{t('lr.min', fmtIDRShort(currentBid + 50_000_000))}</span>
            </div>
            <div style={{ display: 'flex', border: '1px solid rgba(250,250,247,0.3)', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: 'var(--mono)', fontSize: 16, color: 'rgba(250,250,247,0.5)', borderRight: '1px solid rgba(250,250,247,0.15)' }}>Rp</span>
              <input
                value={bidAmt.toLocaleString('id-ID')}
                onChange={(e) => setBidAmt(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '16px 14px', fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--paper)', outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[50_000_000, 100_000_000, 250_000_000, 500_000_000].map(inc => (
                <button key={inc} onClick={() => setBidAmt(currentBid + inc)} style={{ flex: 1, border: '1px solid rgba(250,250,247,0.2)', background: 'transparent', color: 'rgba(250,250,247,0.85)', padding: '8px 0', fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em' }}>
                  +{fmtIDRShort(inc).replace('Rp\u00A0', '')}
                </button>
              ))}
            </div>
          </div>

          <button onClick={placeBid} style={{ width: '100%', padding: '16px 24px', border: 'none', background: 'var(--gold)', color: 'var(--paper)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer', borderRadius: 1, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.02em' }}>
            <Icon2 name="lock" size={14} /> {t('lr.placeVerified', fmtIDRShort(bidAmt))}
          </button>
          <div style={{ fontSize: 10, color: 'rgba(250,250,247,0.4)', textAlign: 'center', fontFamily: 'var(--mono)', marginBottom: 8, letterSpacing: '0.05em' }}>
            {t('lr.confirm')}
          </div>

          {/* Live bid feed */}
          <div style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div className="as-eyebrow" style={{ color: 'rgba(250,250,247,0.55)' }}>{t('lr.feedTitle')}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(250,250,247,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
                {t('lr.streaming')}
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {bids.map((b, i) => (
                <div key={`${b.who}-${b.t}-${i}`} style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12, alignItems: 'center',
                  padding: '11px 0', borderBottom: '1px dashed rgba(250,250,247,0.08)',
                  fontSize: 13,
                  opacity: i > 4 ? 0.55 - (i - 4) * 0.08 : 1,
                  animation: i === 0 ? 'fadeInV2 0.4s ease-out' : 'none',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: b.you ? 'var(--gold)' : 'rgba(250,250,247,0.1)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600 }}>
                    {b.you ? t('lr.you') : b.who.slice(-2)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500, color: b.you ? 'var(--paper)' : 'rgba(250,250,247,0.85)' }}>{b.who}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--green)', letterSpacing: '0.1em', padding: '2px 5px', border: '1px solid rgba(45,106,79,0.4)' }}>✓ {b.verified}</span>
                    {b.lead && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--gold)', letterSpacing: '0.1em' }}>{t('lr.lead')}</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: b.lead ? 'var(--gold)' : 'var(--paper)' }}>{fmtIDRShort(b.amt)}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(250,250,247,0.4)', minWidth: 32, textAlign: 'right' }}>
                    {b.t < 60 ? `${b.t}s` : `${Math.floor(b.t/60)}m`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInV2 {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export { LiveBidScreenV2 };
