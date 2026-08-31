/* Portal Advertise Hub + self-serve campaign dashboard + membership tiers */
import React from 'react';
import { useT } from '../i18n';
import { PIcon, fmtRp, PortalNav, PortalFooter } from './shared';
import { api } from '../api/client';
import { useUser } from '../store';
import { useIsMobile } from '../lib/useIsMobile';
import AppDialog from './AppDialog';

const PortalAdvertise = ({ lang, onLang, onNav }) => {
  const { t } = useT();
  const id = lang === 'id';
  const isMobile = useIsMobile();
  const [view, setView] = React.useState('tiers');
  const user = useUser();
  const isVerified = !!user && !!user.emailVerified;
  const needsVerify = !!user && !user.emailVerified;
  const [dialog, setDialog] = React.useState(null);
  /* Nomor sales diambil dari server (endpoint wajib login+verifikasi) — tidak di-hardcode. */
  const [contactPhone, setContactPhone] = React.useState(null);
  React.useEffect(() => {
    if (!isVerified) { setContactPhone(null); return; }
    let alive = true;
    api.get('/api/contact').then(r => { if (alive && r.data?.whatsapp) setContactPhone(r.data.whatsapp); }).catch(() => {});
    return () => { alive = false; };
  }, [isVerified]);
  const openWA = (text) => {
    if (!isVerified) {
      if (needsVerify) setDialog({ icon: 'lock', title: id ? 'Verifikasi email dulu' : 'Verify your email', message: id ? 'Cek kotak masuk Anda dan verifikasi email untuk menghubungi tim sales.' : 'Check your inbox and verify your email to contact the sales team.' });
      else setDialog({ icon: 'lock', title: id ? 'Perlu masuk dulu' : 'Sign in required', message: id ? 'Masuk atau daftar dulu untuk menghubungi tim sales Assetra.' : 'Sign in or register first to contact the Assetra sales team.', primary: id ? 'Masuk / Daftar' : 'Sign in / Register', onPrimary: () => onNav && onNav('signin') });
      return;
    }
    if (!contactPhone) {
      setDialog({ icon: 'chat', title: id ? 'Sebentar ya' : 'One moment', message: id ? 'Sedang memuat nomor kontak — coba lagi sebentar.' : 'Loading the contact number — please try again shortly.' });
      return;
    }
    window.open(`https://wa.me/${contactPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };
  const pickTier = (tr) => {
    const priceLabel = tr.price == null ? (id ? 'Kustom' : 'Custom') : tr.price === 0 ? 'Gratis' : `${fmtRp(tr.price)}${tr.unit}`;
    openWA(id
      ? `Halo Assetra, saya tertarik dengan paket keanggotaan "${tr.name}" (${priceLabel}). Mohon info cara berlangganan.`
      : `Hi Assetra, I'm interested in the "${tr.name}" membership plan (${priceLabel}). Please share how to subscribe.`);
  };

  const tiers = [
    { id: 'starter', name: t('p.adv.starter'), price: 0, unit: '', features: id ? ['5 listing aktif', 'Statistik dasar', 'Profil agen'] : ['5 active listings', 'Basic stats', 'Agent profile'], cta: t('p.adv.choose') },
    { id: 'pro', name: t('p.adv.pro'), price: 1_500_000, unit: t('p.adv.month'), features: id ? ['50 listing aktif', '10 listing unggulan/bln', 'Analitik lengkap', 'Badge terverifikasi'] : ['50 active listings', '10 featured/mo', 'Full analytics', 'Verified badge'], popular: true, cta: t('p.adv.choose') },
    { id: 'agency', name: t('p.adv.agency'), price: 6_500_000, unit: t('p.adv.month'), features: id ? ['Listing tak terbatas', '50 unggulan/bln', 'Multi-agen (10)', 'Dukungan prioritas'] : ['Unlimited listings', '50 featured/mo', 'Multi-agent (10)', 'Priority support'], cta: t('p.adv.choose') },
    { id: 'developer', name: t('p.adv.developer'), price: null, unit: '', features: id ? ['Microsite proyek', 'Banner display', 'Generasi prospek', 'Account manager'] : ['Project microsite', 'Display banners', 'Lead generation', 'Account manager'], cta: id ? 'Hubungi sales' : 'Contact sales' },
  ];

  return (
    <div className="pscreen">
      <PortalNav active="advertise" lang={lang} onLang={onLang} onNav={onNav} />

      {/* hero */}
      <section style={{ background: 'linear-gradient(135deg, #1A6FA8, #3BC4D9)', color: '#fff', padding: '48px 0' }}>
        <div className="pwrap">
          <div className="p-eyebrow" style={{ color: '#fff', opacity: 0.85 }}>{t('p.nav.advertise')}</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 42, letterSpacing: '-0.02em', margin: '8px 0 10px' }}>{t('p.adv.title')}</h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 560, margin: '0 0 24px' }}>{t('p.adv.sub')}</p>
          <div style={{ display: 'flex', gap: 36 }}>
            {[['8M', id ? 'Pengunjung/bln' : 'Visitors/mo'], ['12.4K', id ? 'Agen aktif' : 'Active agents'], ['184K', id ? 'Listing' : 'Listings']].map((s, i) => (
              <div key={i}><div style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>{s[0]}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s[1]}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* tab switch */}
      <div className="pwrap" style={{ paddingTop: 28 }}>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          {[['tiers', t('p.adv.tiers')], ['dash', t('p.adv.dash')]].map(([id2, label]) => (
            <button key={id2} onClick={() => setView(id2)} style={{ padding: '11px 22px', border: 'none', background: view === id2 ? 'var(--ink)' : '#fff', color: view === id2 ? '#fff' : 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
      </div>

      {view === 'tiers' && (
        <div className="pwrap" style={{ padding: '24px 32px 56px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
            {tiers.map(tr => (
              <div key={tr.id} style={{ background: '#fff', border: tr.popular ? '2px solid var(--teal)' : '1px solid var(--line)', borderRadius: 14, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {tr.popular && <div style={{ position: 'absolute', top: -11, left: 24, background: 'var(--brand-gradient)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>{t('p.adv.popular')}</div>}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>{tr.name}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)' }}>
                  {tr.price === null ? (id ? 'Kustom' : 'Custom') : tr.price === 0 ? (id ? 'Gratis' : 'Free') : fmtRp(tr.price)}
                  {tr.unit && <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>{tr.unit}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0', flex: 1 }}>
                  {tr.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0 }}><PIcon name="check" size={15} /></span> {f}
                    </div>
                  ))}
                </div>
                <button className={`p-btn ${tr.popular ? 'p-btn-cyan' : 'p-btn-ghost'}`} style={{ width: '100%' }} onClick={() => pickTier(tr)}>{tr.cta}</button>
              </div>
            ))}
          </div>

          {/* display ad + featured explainer */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginTop: 24 }}>
            {[
              { ic: 'megaphone', t: t('p.adv.display'), d: id ? 'Banner di homepage, hasil pencarian, dan halaman detail. Penargetan per lokasi & kategori, harga per impresi (CPM).' : 'Banners on home, search, and detail pages. Targeted by location & category, priced per impression (CPM).' },
              { ic: 'star', t: t('p.adv.featured'), d: id ? 'Listing Anda tampil di atas hasil pencarian dengan label Sponsored — hingga 7x lebih banyak dilihat.' : 'Your listing appears atop search results with a Sponsored badge — up to 7× more views.' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 24, display: 'flex', gap: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(176,136,56,0.12)', color: 'var(--gold-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name={c.ic} size={22} /></div>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20, margin: '0 0 6px' }}>{c.t}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'dash' && (
        <div className="pwrap" style={{ padding: '24px 32px 56px' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              [t('p.adv.impressions'), '1,24 jt', '▲ 18%'], [t('p.adv.clicks'), '38,400', '▲ 12%'], [t('p.adv.ctr'), '3.1%', '▲ 0.4pp'], [t('p.adv.leads'), '892', '▲ 22%'], [t('p.adv.spend'), 'Rp 42 jt', ''],
            ].map((k, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 18 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{k[0]}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26 }}>{k[1]}</div>
                {k[2] && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', marginTop: 4 }}>{k[2]}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, margin: 0 }}>{t('p.adv.campaigns')}</h2>
            <button className="p-btn p-btn-cyan" onClick={() => openWA(id ? 'Halo Assetra, saya ingin membuat kampanye iklan baru. Mohon dibantu.' : 'Hi Assetra, I would like to set up a new ad campaign. Please assist.')}><PIcon name="plus" size={15} /> {t('p.adv.newCampaign')}</button>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--paper-2)' }}>
                  {['Campaign', 'Type', t('p.adv.budget'), t('p.adv.impressions'), t('p.adv.clicks'), t('p.adv.ctr'), t('p.adv.leads'), 'Status'].map((h, i) => (
                    <th key={i} style={{ textAlign: i > 1 && i < 7 ? 'right' : 'left', padding: '13px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Menteng Heritage — Featured', type: 'Featured listing', budget: 'Rp 500k/d', imp: '420K', clk: '14.2K', ctr: '3.4%', leads: 312, st: 'live' },
                  { name: 'Bali Villa Display Banner', type: 'Display CPM', budget: 'Rp 1,2 jt/d', imp: '680K', clk: '18.1K', ctr: '2.7%', leads: 408, st: 'live' },
                  { name: 'BSD New Project Microsite', type: 'Developer', budget: 'Rp 2 jt/d', imp: '140K', clk: '6.1K', ctr: '4.4%', leads: 172, st: 'live' },
                  { name: 'Kuningan Office Sponsored', type: 'Sponsored search', budget: 'Rp 300k/d', imp: '—', clk: '—', ctr: '—', leads: 0, st: 'paused' },
                ].map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '15px 16px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '15px 16px', color: 'var(--ink-2)' }}>{c.type}</td>
                    <td style={{ padding: '15px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.budget}</td>
                    <td style={{ padding: '15px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.imp}</td>
                    <td style={{ padding: '15px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.clk}</td>
                    <td style={{ padding: '15px 16px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{c.ctr}</td>
                    <td style={{ padding: '15px 16px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{c.leads}</td>
                    <td style={{ padding: '15px 16px' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 4, background: c.st === 'live' ? 'rgba(45,138,111,0.1)' : 'var(--paper-2)', color: c.st === 'live' ? 'var(--green)' : 'var(--muted)', border: c.st === 'live' ? '1px solid rgba(45,138,111,0.3)' : '1px solid var(--line)' }}>
                        {c.st === 'live' ? '● Live' : 'Paused'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PortalFooter />
      <AppDialog dialog={dialog} onClose={() => setDialog(null)} lang={lang} />
    </div>
  );
};

export default PortalAdvertise;
