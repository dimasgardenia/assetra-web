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
  /* Angka nyata dari API: listing tayang & agen aktif. */
  const [stats, setStats] = React.useState({ listings: '…', agents: '…' });
  React.useEffect(() => {
    let on = true;
    Promise.all([
      api.get('/api/listings?source=portal&per_page=1').then(r => r.meta?.total ?? 0).catch(() => 0),
      api.get('/api/agents').then(r => (r.data || []).filter(a => a.status === 'live').length).catch(() => 0),
    ]).then(([listings, agents]) => { if (on) setStats({ listings: listings.toLocaleString('id-ID'), agents: agents.toLocaleString('id-ID') }); });
    return () => { on = false; };
  }, []);
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
            {[[stats.listings, id ? 'Listing aktif' : 'Active listings'], [stats.agents, id ? 'Agen aktif' : 'Active agents']].map((s, i) => (
              <div key={i}><div style={{ fontFamily: 'var(--serif)', fontSize: 30 }}>{s[0]}</div><div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s[1]}</div></div>
            ))}
          </div>
        </div>
      </section>

      {(
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

      <PortalFooter />
      <AppDialog dialog={dialog} onClose={() => setDialog(null)} lang={lang} />
    </div>
  );
};

export default PortalAdvertise;
