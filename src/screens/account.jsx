/* Bidder account dashboard — profile, KYC, my bids, watchlist */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Photo2, Nav2, TrustRibbon, fmtIDRShort } from '../shared-v2';
import { useActions, useUser, useListings, useWatchlist } from '../store';
import { bidsApi } from '../api/bids';

export default function AccountScreen({ lang, onLang }) {
  const { t } = useT();
  const navigate = useNavigate();
  const user = useUser();
  const listings = useListings();
  const watchlist = useWatchlist();
  const actions = useActions();
  const [tab, setTab] = React.useState(() => (window.location.hash === '#bids' ? 'bids' : 'profile'));
  const [myBids, setMyBids] = React.useState([]);

  React.useEffect(() => {
    if (!user) return;
    bidsApi.listMine().then(r => setMyBids(r.data)).catch(() => {});
  }, [user?.id]);

  if (!user) {
    return (
      <div className="as-screen">
        <TrustRibbon />
        <Nav2 lang={lang} onLang={onLang} />
        <div style={{ padding: 80, textAlign: 'center' }}>
          <h2 className="as-display" style={{ fontSize: 28 }}>Anda belum masuk.</h2>
          <button onClick={() => navigate('/signin')} className="as-btn as-btn-primary" style={{ marginTop: 18 }}>Masuk</button>
        </div>
      </div>
    );
  }

  const watchlistListings = listings.filter(l => watchlist.includes(l.id));
  const initials = (user.name || user.email).split(/[\s.@]+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');

  return (
    <div className="as-screen">
      <TrustRibbon />
      <Nav2 lang={lang} onLang={onLang} />

      {/* Header */}
      <header style={{ padding: '40px 40px 28px', background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--gold-2)', marginBottom: 14 }}>◆ AKUN BIDDER · KYC TERVERIFIKASI</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {user.picture ? (
            <img src={user.picture} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-gradient)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 600 }}>{initials}</div>
          )}
          <div style={{ flex: 1 }}>
            <h1 className="as-display" style={{ fontSize: 38, margin: 0, letterSpacing: '-0.02em' }}>{user.name || 'Bidder'}</h1>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>{user.email}</span>
              <span style={{ color: 'var(--green)' }}>● KYC VERIFIED</span>
              <span style={{ color: 'var(--gold-2)' }}>◆ ROLE · {user.role?.toUpperCase()}</span>
              {user.provider && <span>via {user.provider}</span>}
            </div>
          </div>
          <button onClick={() => { actions.logout(); navigate('/'); }} className="as-btn as-btn-ghost">Keluar</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: '0 40px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 0 }}>
        {[
          { id: 'profile', label: 'Profil & KYC' },
          { id: 'bids', label: `Tawaran saya (${myBids.length})` },
          { id: 'watchlist', label: `Watchlist (${watchlistListings.length})` },
          { id: 'settings', label: 'Pengaturan' },
        ].map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            padding: '16px 22px', background: 'transparent', border: 'none',
            borderBottom: tab === x.id ? '2px solid var(--ink)' : '2px solid transparent',
            color: tab === x.id ? 'var(--ink)' : 'var(--muted)',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: tab === x.id ? 600 : 400,
            cursor: 'pointer', marginBottom: -1,
          }}>{x.label}</button>
        ))}
      </div>

      <main style={{ padding: 40 }}>
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <section>
              <div className="as-eyebrow" style={{ marginBottom: 14 }}>— Identitas</div>
              <div style={{ border: '1px solid var(--line)', padding: 24, background: 'var(--paper)' }}>
                {[
                  ['Nama lengkap', user.name || '—'],
                  ['Email', user.email],
                  ['NIK (e-KTP)', '32•••••••••0142'],
                  ['NPWP', '02.345.678.9-014.000'],
                  ['Tipe akun', user.accountType || 'individual'],
                  ['Bank settlement', 'Bank Mandiri ··0142'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '10px 0', borderBottom: '1px dashed var(--line)', fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.05em', fontSize: 11, textTransform: 'uppercase' }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="as-eyebrow" style={{ marginBottom: 14 }}>— Status verifikasi</div>
              <div style={{ border: '1px solid var(--line)', padding: 24, background: 'var(--paper)' }}>
                {[
                  { k: 'Email', ok: true },
                  { k: 'e-KTP · Dukcapil', ok: true },
                  { k: 'NPWP · DJP', ok: true },
                  { k: 'Selfie · Liveness check', ok: true },
                  { k: 'Bank account · BIfast', ok: true },
                  { k: 'Deposit eskro', ok: false },
                ].map(({ k, ok }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--line)', fontSize: 13 }}>
                    <span>{k}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: ok ? 'var(--green)' : 'var(--gold-2)' }}>{ok ? '✓ TERVERIFIKASI' : '⊙ MENUNGGU'}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'bids' && (
          <div>
            <div className="as-eyebrow" style={{ marginBottom: 14 }}>— Riwayat Tawaran ({myBids.length})</div>
            {myBids.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--line)', color: 'var(--muted)' }}>
                Belum ada tawaran. <Link to="/" style={{ color: 'var(--teal)' }}>Telusuri lelang →</Link>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--line)' }}>
                {myBids.map((b, i) => {
                  const listing = listings.find(l => l.id === b.listingId);
                  const date = new Date(b.createdAt || b.at || Date.now());
                  const amount = b.amount ?? b.amt;
                  const isLeading = (listing && listing.currentBid === amount) || (b.listingCurrentBid === amount);
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 160px 140px 100px', gap: 16, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
                      <div style={{ width: 44, height: 44, overflow: 'hidden' }}>{listing && <Photo2 kind={listing.type} seed={listing.id} w={200} />}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{listing?.title || b.listingId}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{b.listingId} · {listing?.address || ''}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmtIDRShort(amount)}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 10px', background: isLeading ? 'var(--green)' : 'var(--paper-2)', color: isLeading ? 'var(--paper)' : 'var(--muted)', letterSpacing: '0.1em', textAlign: 'center' }}>
                        {isLeading ? 'MEMIMPIN' : 'KALAH'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'watchlist' && (
          <div>
            <div className="as-eyebrow" style={{ marginBottom: 14 }}>— Watchlist ({watchlistListings.length})</div>
            {watchlistListings.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--line)', color: 'var(--muted)' }}>
                Belum ada listing tersimpan. Tap ikon bookmark pada kartu listing untuk menyimpan.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {watchlistListings.map(l => (
                  <Link key={l.id} to={`/listing/${encodeURIComponent(l.id)}`} className="as-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="as-card-img"><Photo2 kind={l.type} seed={l.id} tag={l.id.slice(-4)} /></div>
                    <div className="as-card-body">
                      <h3 className="as-card-title">{l.title}</h3>
                      <div className="as-card-addr"><Icon2 name="pin" size={11} /> {l.address}</div>
                      <div className="as-card-stats">
                        <div><div className="as-stat-label">Current bid</div><div className="as-stat-val-lg">{fmtIDRShort(l.currentBid)}</div></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ maxWidth: 600 }}>
            <div className="as-eyebrow" style={{ marginBottom: 14 }}>— Pengaturan akun</div>
            <div style={{ border: '1px solid var(--line)', padding: 24, background: 'var(--paper)' }}>
              <p style={{ color: 'var(--muted)', lineHeight: 1.55 }}>Notifikasi, keamanan, dan preferensi bahasa akan tersedia di sini. Untuk mengubah role atau menonaktifkan akun, hubungi tim Trust & Safety di <b>support@assetra.co.id</b>.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
