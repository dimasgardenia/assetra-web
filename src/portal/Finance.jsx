/* Portal Financing Hub — calculator, KPR comparison, pre-approval, cash, installments */
import React from 'react';
import { useT } from '../i18n';
import { PIcon, fmtRp, fmtRpFull, PortalNav, PortalFooter } from './shared';
import { api } from '../api/client';
import { useIsMobile } from '../lib/useIsMobile';

const PortalFinance = ({ lang, onLang, onNav }) => {
  const isMobile = useIsMobile();
  const { t } = useT();
  const L = (en, id) => (lang === 'id' ? id : en);
  const [price, setPrice] = React.useState(5_000_000_000);
  const [downPct, setDownPct] = React.useState(20);
  const [tenor, setTenor] = React.useState(15);
  const [rate, setRate] = React.useState(6.5);

  /* ── Modal pengajuan KPR ── */
  const [apply, setApply] = React.useState(null); // { bank } | null
  const [af, setAf] = React.useState({ name: '', phone: '', email: '', income: '' });
  const [aBusy, setABusy] = React.useState(false);
  const [aDone, setADone] = React.useState(false);
  const [aErr, setAErr] = React.useState('');
  const openApply = (bank) => { setApply({ bank }); setAf({ name: '', phone: '', email: '', income: '' }); setADone(false); setAErr(''); };
  const validPhone = (p) => /^(\+62|62|08)[\d\s\-().]{7,15}$/.test(String(p).trim());
  const submitApply = async () => {
    if (aBusy) return;
    if (!af.name.trim()) { setAErr(L('Full name is required', 'Nama lengkap wajib diisi')); return; }
    if (!validPhone(af.phone)) { setAErr(L('Enter a valid WhatsApp number (08xx / +62xx)', 'Isi nomor WhatsApp valid (08xx / +62xx)')); return; }
    setABusy(true); setAErr('');
    try {
      await api.post('/api/kpr', {
        name: af.name.trim(), phone: af.phone.trim(), email: af.email.trim() || null,
        income: af.income ? Number(af.income) : null,
        bank: apply.bank || 'Semua bank',
        propertyPrice: price, loanAmount: Math.round(loan), downPayment: Math.round(price * downPct / 100),
        tenorYears: tenor, rate,
      });
      setADone(true);
    } catch (e) {
      setAErr(e.message || L('Something went wrong', 'Terjadi kesalahan'));
    } finally { setABusy(false); }
  };

  const loan = price * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = tenor * 12;
  const monthly = r > 0 ? loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : loan / n;
  const totalInt = monthly * n - loan;

  const banks = [
    { bank: 'Bank Mandiri', product: 'KPR Mandiri Fix', fixed: 3.88, fixedFor: '3 yrs', then: '9.5%', best: true },
    { bank: 'BCA', product: 'KPR BCA Fix & Cap', fixed: 4.25, fixedFor: '3 yrs', then: '8.9%', best: false },
    { bank: 'BNI', product: 'BNI Griya', fixed: 4.75, fixedFor: '5 yrs', then: '10.2%', best: false },
    { bank: 'BRI', product: 'KPR BRI', fixed: 5.10, fixedFor: '2 yrs', then: '9.8%', best: false },
    { bank: 'CIMB Niaga', product: 'KPR Xtra', fixed: 4.55, fixedFor: '3 yrs', then: '9.25%', best: false },
  ];
  const bankMonthly = (fr) => { const rr = fr / 100 / 12; return loan * rr * Math.pow(1 + rr, n) / (Math.pow(1 + rr, n) - 1); };

  return (
    <div className="pscreen">
      <PortalNav active="finance" lang={lang} onLang={onLang} onNav={onNav} />

      {/* hero */}
      <section style={{ background: 'var(--ink)', color: '#fff', padding: '40px 0' }}>
        <div className="pwrap">
          <div className="p-eyebrow" style={{ color: 'var(--cyan)' }}>{t('p.fin.eyebrow')}</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 40, letterSpacing: '-0.02em', margin: '6px 0 8px' }}>{t('p.fh.title')}</h1>
          <p style={{ fontSize: 16, color: 'rgba(250,250,247,0.75)', margin: 0 }}>{t('p.fh.sub')}</p>
        </div>
      </section>

      <div className="pwrap" style={{ padding: '36px 32px 56px' }}>
        {/* Calculator + result */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: 24, marginBottom: 40 }}>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, margin: '0 0 22px', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--teal)' }}><PIcon name="calc" size={22} /></span> {t('p.fh.calc')}</h2>

            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="p-field-label" style={{ margin: 0 }}>{t('p.fh.price')}</label>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink)' }}>{fmtRpFull(price)}</span>
              </div>
              <input type="range" min={500_000_000} max={50_000_000_000} step={250_000_000} value={price} onChange={(e) => setPrice(+e.target.value)} style={{ width: '100%', accentColor: 'var(--teal)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 22 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="p-field-label" style={{ margin: 0 }}>{t('p.fh.down')}</label>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{downPct}%</span>
                </div>
                <input type="range" min="5" max="60" step="5" value={downPct} onChange={(e) => setDownPct(+e.target.value)} style={{ width: '100%', accentColor: 'var(--teal)' }} />
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 4 }}>{fmtRp(price * downPct / 100)}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="p-field-label" style={{ margin: 0 }}>{t('p.fh.tenor')}</label>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{tenor} {t('p.fh.years')}</span>
                </div>
                <input type="range" min="5" max="30" step="1" value={tenor} onChange={(e) => setTenor(+e.target.value)} style={{ width: '100%', accentColor: 'var(--teal)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="p-field-label" style={{ margin: 0 }}>{t('p.fh.rate')}</label>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{rate}%</span>
              </div>
              <input type="range" min="3" max="14" step="0.25" value={rate} onChange={(e) => setRate(+e.target.value)} style={{ width: '100%', accentColor: 'var(--teal)' }} />
            </div>
          </div>

          {/* result */}
          <div style={{ background: 'var(--brand-gradient)', color: '#fff', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>{t('p.fh.monthly')}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1.1, margin: '6px 0 20px' }}>{fmtRp(Math.round(monthly))}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              {[[t('p.fh.loan'), fmtRp(loan)], [t('p.fh.down'), fmtRp(price * downPct / 100)], [t('p.fh.totalInt'), fmtRp(Math.round(totalInt))]].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ opacity: 0.85 }}>{k}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <button className="p-btn p-btn-white" style={{ marginTop: 'auto', width: '100%' }} onClick={() => openApply('')}><PIcon name="doc" size={15} /> {t('p.fh.preapproval')}</button>
          </div>
        </div>

        {/* KPR comparison */}
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 26, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: 'var(--teal)' }}><PIcon name="bank" size={22} /></span> {t('p.fh.compare')}</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflowX: 'auto', marginBottom: 40 }}>
          <table style={{ width: '100%', minWidth: isMobile ? 560 : 'auto', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--paper-2)' }}>
                {[t('p.fh.bank'), t('p.fh.product'), t('p.fh.fixedRate'), t('p.fh.fixedFor'), t('p.fh.thenRate'), t('p.fh.estMonthly'), ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 1 && i < 6 ? 'right' : 'left', padding: '14px 18px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banks.map((b, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--line)', background: b.best ? 'rgba(59,196,217,0.05)' : '#fff' }}>
                  <td style={{ padding: '16px 18px', fontWeight: 700 }}>
                    {b.bank} {b.best && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--teal)', border: '1px solid var(--teal)', padding: '1px 6px', borderRadius: 3, marginLeft: 6 }}>{t('p.fh.recommended')}</span>}
                  </td>
                  <td style={{ padding: '16px 18px', color: 'var(--ink-2)' }}>{b.product}</td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--teal)' }}>{b.fixed}%</td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>{b.fixedFor}</td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>{b.then}</td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{fmtRp(Math.round(bankMonthly(b.fixed)))}</td>
                  <td style={{ padding: '16px 18px', textAlign: 'right' }}><button className="p-btn p-btn-cyan p-btn-sm" onClick={() => openApply(b.bank)}>{t('p.fh.apply')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Three payment paths */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { ic: 'doc', k: 'p.fh.preapproval', sub: 'p.fh.preSub', cta: t('p.d.preapproved') },
            { ic: 'cash', k: 'p.fh.cash', sub: 'p.fh.cashSub', cta: t('p.fin.cash') },
            { ic: 'building', k: 'p.fh.plan', sub: 'p.fh.planSub', cta: t('p.fin.plan') },
          ].map((c, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(26,111,168,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name={c.ic} size={22} /></div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20, margin: 0 }}>{t(c.k)}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55, margin: 0, flex: 1 }}>{t(c.sub)}</p>
              <button className="p-btn p-btn-ghost" style={{ width: '100%' }}>{c.cta} <PIcon name="arrowR" size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal pengajuan KPR ── */}
      {apply && (() => {
        const inS = { width: '100%', height: 44, border: '1px solid var(--line)', borderRadius: 9, padding: '0 13px', fontSize: 14, fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box', background: '#fff', color: 'var(--ink)' };
        const lblS = { fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 };
        const bankLabel = apply.bank || L('All partner banks', 'Semua bank mitra');
        return (
          <div onClick={() => setApply(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,64,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, width: 'min(460px, 100%)', maxHeight: '90vh', overflowY: 'auto', padding: '26px 28px', fontFamily: 'var(--sans)' }}>
              {aDone ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ width: 66, height: 66, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(45,138,111,0.12)', border: '1px solid rgba(45,138,111,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>✅</div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, margin: '0 0 8px' }}>{L('Application received!', 'Pengajuan diterima!')}</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 20px' }}>
                    {L(`Our team will review and contact you via WhatsApp shortly regarding ${bankLabel}.`, `Tim kami akan meninjau dan menghubungi Anda via WhatsApp terkait ${bankLabel}.`)}
                  </p>
                  <button className="p-btn p-btn-cyan" style={{ width: '100%' }} onClick={() => setApply(null)}>{L('Done', 'Selesai')}</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, margin: 0 }}>{apply.bank ? L('Apply for KPR', 'Ajukan KPR') : L('Get pre-approved', 'Pra-persetujuan KPR')}</h2>
                    <span onClick={() => setApply(null)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>✕</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 18px' }}>
                    {apply.bank ? <>{L('Bank:', 'Bank:')} <b style={{ color: 'var(--ink)' }}>{apply.bank}</b></> : L('One application, sent to all partner banks.', 'Satu pengajuan, dikirim ke semua bank mitra.')}
                  </p>
                  {/* ringkasan dari kalkulator */}
                  <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 12.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
                    <span style={{ color: 'var(--muted)' }}>{L('Property price', 'Harga properti')}</span><span style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(price)}</span>
                    <span style={{ color: 'var(--muted)' }}>{L('Loan', 'Pinjaman')}</span><span style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(loan)}</span>
                    <span style={{ color: 'var(--muted)' }}>{L('Down payment', 'Uang muka')}</span><span style={{ textAlign: 'right', fontWeight: 600 }}>{downPct}% · {fmtRp(price * downPct / 100)}</span>
                    <span style={{ color: 'var(--muted)' }}>{L('Tenor', 'Tenor')}</span><span style={{ textAlign: 'right', fontWeight: 600 }}>{tenor} {t('p.fh.years')}</span>
                  </div>
                  <div style={{ marginBottom: 13 }}>
                    <label style={lblS}>{L('Full name *', 'Nama lengkap *')}</label>
                    <input style={inS} value={af.name} onChange={e => setAf({ ...af, name: e.target.value })} placeholder={L('e.g. Sarah Wijaya', 'cth. Sarah Wijaya')} />
                  </div>
                  <div style={{ marginBottom: 13 }}>
                    <label style={lblS}>{L('Active WhatsApp number *', 'Nomor WhatsApp aktif *')}</label>
                    <input style={inS} type="tel" value={af.phone} onChange={e => setAf({ ...af, phone: e.target.value })} placeholder="0812 3456 7890" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                    <div>
                      <label style={lblS}>{L('Email (optional)', 'Email (opsional)')}</label>
                      <input style={inS} type="email" value={af.email} onChange={e => setAf({ ...af, email: e.target.value })} placeholder="nama@email.com" />
                    </div>
                    <div>
                      <label style={lblS}>{L('Monthly income (opt.)', 'Penghasilan/bln (opt.)')}</label>
                      <input style={inS} type="number" min="0" value={af.income} onChange={e => setAf({ ...af, income: e.target.value })} placeholder="25000000" />
                    </div>
                  </div>
                  {aErr && <div style={{ padding: '9px 13px', marginBottom: 14, background: 'rgba(166,29,29,0.06)', border: '1px solid rgba(166,29,29,0.4)', borderRadius: 8, color: '#A61D1D', fontSize: 12.5 }}>{aErr}</div>}
                  <button className="p-btn p-btn-cyan" disabled={aBusy} style={{ width: '100%', height: 48, opacity: aBusy ? 0.6 : 1 }} onClick={submitApply}>
                    {aBusy ? L('Submitting…', 'Mengirim…') : (apply.bank ? L('Submit application', 'Kirim pengajuan') : L('Request pre-approval', 'Minta pra-persetujuan'))} <PIcon name="arrowR" size={15} />
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                    {L('Free · no impact on credit score. Our team follows up via WhatsApp.', 'Gratis · tanpa dampak skor kredit. Tim kami menindaklanjuti via WhatsApp.')}
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })()}

      <PortalFooter />
    </div>
  );
};

export default PortalFinance;
