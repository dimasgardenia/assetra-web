/* AI chat box — embedded in listing detail, free for buyers.
   Backed by the real Claude API via POST /api/ai/chat; falls back to canned
   responses when the backend/AI key is unavailable. */
import React from 'react';
import { PIcon } from './shared';
import { api } from '../api/client';
import { useUser } from '../store';
import { renderRichText } from '../lib/richtext';

const AIChatBox = ({ lang, property, onNav }) => {
  const L = (en, id) => (lang === 'id' ? id : en);
  const user = useUser();
  const isVerified = !!user && !!user.emailVerified;
  const needsVerify = !!user && !user.emailVerified;
  const [open, setOpen] = React.useState(true);
  const [msgs, setMsgs] = React.useState(() => [
    { from: 'ai', text: L(
      'Hi! I’ve analyzed this townhouse in Menteng. Ask me anything — fair price, rental yield, neighborhood trends, or what it would earn as a boutique guesthouse.',
      'Halo! Saya sudah menganalisis townhouse di Menteng ini. Tanyakan apa saja — harga wajar, imbal hasil sewa, tren lingkungan, atau potensi jika dijadikan guesthouse butik.') },
  ]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const bodyRef = React.useRef(null);

  const CANNED = [
    { k: /harga|price|mahal|worth|fair|nego/i, a: L(
      'Based on 14 comparable sales in Menteng over the last 12 months, fair value is Rp 13.8–14.6 M — the asking price of Rp 14.2 M sits right in range. Similar corner-lot townhouses closed at Rp 31.2 jt/m²; this one asks Rp 30.9 jt/m². There may be ~3–5% negotiation room given it’s been listed 24 days.',
      'Berdasarkan 14 penjualan sebanding di Menteng dalam 12 bulan terakhir, nilai wajarnya Rp 13,8–14,6 M — harga minta Rp 14,2 M masih dalam rentang. Townhouse hook serupa terjual di Rp 31,2 jt/m²; yang ini diminta Rp 30,9 jt/m². Ada ruang nego ~3–5% karena sudah tayang 24 hari.') },
    { k: /sewa|rental|yield|rent|imbal/i, a: L(
      'Long-term rental estimate: Rp 55–65 jt/month (≈4.9–5.5% gross yield). If converted to a 6-room boutique guesthouse, projected ADR Rp 1.4 jt at 68% occupancy → ~9.6% yield — nearly double. Menteng heritage zoning allows guesthouse use with a PBG amendment.',
      'Estimasi sewa jangka panjang: Rp 55–65 jt/bulan (≈4,9–5,5% imbal hasil kotor). Jika dikonversi jadi guesthouse butik 6 kamar, proyeksi ADR Rp 1,4 jt dengan okupansi 68% → imbal hasil ~9,6% — hampir dua kali lipat. Zonasi heritage Menteng mengizinkan guesthouse dengan perubahan PBG.') },
    { k: /lingkungan|neighbou?rhood|area|trend|banjir|flood|sekolah|school/i, a: L(
      'Menteng prices rose 6.8%/yr over 5 years vs 4.1% Jakarta average. This block is outside the flood-prone zone (nearest is 1.2 km east). Within 1 km: 3 international schools, MRT Bundaran HI (9 min), and Taman Suropati. Supply is tightly constrained — heritage rules block new towers.',
      'Harga di Menteng naik 6,8%/thn selama 5 tahun vs rata-rata Jakarta 4,1%. Blok ini di luar zona rawan banjir (terdekat 1,2 km ke timur). Dalam 1 km: 3 sekolah internasional, MRT Bundaran HI (9 mnt), dan Taman Suropati. Pasokan sangat terbatas — aturan heritage mencegah tower baru.') },
    { k: /kpr|cicilan|mortgage|installment|dp|down/i, a: L(
      'With 20% down (Rp 2.84 M) and a 20-yr fixed at 7.25%, monthly installment ≈ Rp 89.8 jt. BCA and Mandiri currently offer the best fixed-5yr rates for this bracket. Want me to pass this to the KPR pre-approval form?',
      'Dengan DP 20% (Rp 2,84 M) dan tenor 20 thn bunga 7,25%, cicilan ≈ Rp 89,8 jt/bulan. BCA dan Mandiri saat ini menawarkan fixed-5yr terbaik untuk kelas harga ini. Mau saya teruskan ke formulir pra-persetujuan KPR?') },
    { k: /legal|sertifikat|shm|dokumen|certificate/i, a: L(
      'The listing shows SHM (freehold) certificate, IMB/PBG on file, and PBB paid through 2025 — all verified by Assetra’s legal team on 12 Jun 2026. For heritage-zone properties I’d still recommend a notary check on the building-use permit before signing.',
      'Listing ini menunjukkan sertifikat SHM, IMB/PBG lengkap, dan PBB lunas s.d. 2025 — semua diverifikasi tim legal Assetra pada 12 Jun 2026. Untuk properti zona heritage, saya tetap sarankan cek notaris atas izin penggunaan bangunan sebelum tanda tangan.') },
  ];
  const FALLBACK = L(
    'Good question. Short answer: this property scores 8.4/10 on my investment index — strong location fundamentals, fair pricing, and an unusual upside via guesthouse conversion. Ask me about price, rental yield, the neighborhood, KPR, or legal docs for details.',
    'Pertanyaan bagus. Singkatnya: properti ini skor 8,4/10 di indeks investasi saya — fundamental lokasi kuat, harga wajar, dan potensi unik lewat konversi guesthouse. Tanyakan soal harga, imbal hasil sewa, lingkungan, KPR, atau dokumen legal untuk detailnya.');

  const CHIPS = [
    L('Is the price fair?', 'Apakah harganya wajar?'),
    L('Rental yield?', 'Imbal hasil sewa?'),
    L('Neighborhood trends', 'Tren lingkungan'),
    L('Monthly KPR?', 'Cicilan KPR?'),
  ];

  const cannedReply = (q) => {
    const hit = CANNED.find(c => c.k.test(q));
    return hit ? hit.a : FALLBACK;
  };

  const [quotaLeft, setQuotaLeft] = React.useState(null); // sisa token harian (null = belum tahu)
  const quotaOut = quotaLeft === 0;

  const send = async (text) => {
    if (!isVerified) { if (!needsVerify) onNav && onNav('signin'); return; }
    const q = (text || input).trim();
    if (!q || typing || quotaOut) return;
    const history = msgs;
    setMsgs(m => [...m, { from: 'me', text: q }]);
    setInput('');
    setTyping(true);
    try {
      const r = await api.post('/api/ai/chat', {
        message: q,
        lang,
        property: property || null,
        history: history.slice(-10).map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text })),
      });
      setMsgs(m => [...m, { from: 'ai', text: r.reply }]);
      if (typeof r.remaining === 'number') setQuotaLeft(r.remaining);
    } catch {
      // Backend or API key unavailable — degrade to canned answers.
      await new Promise(res => setTimeout(res, 900));
      setMsgs(m => [...m, { from: 'ai', text: cannedReply(q) }]);
    } finally {
      setTyping(false);
    }
  };

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  return (
    <div style={{ marginTop: 20, border: '1px solid rgba(26,111,168,0.25)', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
      {/* header */}
      <div onClick={() => setOpen(!open)} style={{ background: 'linear-gradient(135deg, rgba(10,22,64,0.05), rgba(59,196,217,0.10))', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={19} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            {L('AI Investment Insight', 'Wawasan Investasi AI')}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#fff', background: 'var(--teal)', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.06em' }}>{L('FREE FOR BUYERS', 'GRATIS UNTUK PEMBELI')}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{L('Chat about this property — pricing, yield, area, financing.', 'Tanya properti ini — harga, imbal hasil, area, pembiayaan.')}</div>
        </div>
        <span style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><PIcon name="chevD" size={16} /></span>
      </div>

      {open && (
        <>
          {/* messages */}
          <div ref={bodyRef} style={{ maxHeight: 340, overflowY: 'auto', padding: '18px 18px 6px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--paper, #F4F6FB)' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.from === 'me' ? 'row-reverse' : 'row' }}>
                {m.from === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><PIcon name="sparkle" size={14} /></div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '11px 14px', fontSize: 13, lineHeight: 1.6,
                  borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.from === 'me' ? 'var(--ink, #0A1640)' : '#fff',
                  color: m.from === 'me' ? '#fff' : 'var(--ink-2)',
                  border: m.from === 'me' ? 'none' : '1px solid var(--line)',
                  whiteSpace: m.from === 'me' ? 'pre-wrap' : 'normal',
                }}>{m.from === 'me' ? m.text : renderRichText(m.text)}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={14} /></div>
                <div style={{ padding: '13px 16px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: '1px solid var(--line)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', opacity: 0.5, animation: `aichatdot 1s ${i * 0.18}s infinite` }}></span>)}
                </div>
              </div>
            )}
          </div>

          {!isVerified ? (
            /* Gerbang — fitur AI hanya untuk pengguna terverifikasi. */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center', padding: '20px 18px 22px', background: 'var(--paper, #F4F6FB)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(26,111,168,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}><PIcon name="lock" size={18} /></div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{needsVerify ? L('Verify your email to use the AI', 'Verifikasi email untuk memakai AI') : L('Sign in to use the AI assistant', 'Masuk untuk memakai asisten AI')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 280, lineHeight: 1.5 }}>{needsVerify ? L('Check your inbox and verify your email to unlock the AI assistant.', 'Cek kotak masuk dan verifikasi email Anda untuk membuka asisten AI.') : L('The AI property analysis is available to verified users only.', 'Analisis properti AI hanya tersedia untuk pengguna terverifikasi.')}</div>
              {!needsVerify && <button className="p-btn p-btn-cyan p-btn-sm" style={{ marginTop: 2 }} onClick={() => onNav && onNav('signin')}>{L('Sign in / Register', 'Masuk / Daftar')}</button>}
            </div>
          ) : (
          <>
          {/* suggestion chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 18px 4px', background: 'var(--paper, #F4F6FB)' }}>
            {CHIPS.map(c => (
              <button key={c} onClick={() => send(c)} style={{ border: '1px solid rgba(26,111,168,0.3)', background: '#fff', color: 'var(--teal)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, padding: '7px 13px', borderRadius: 20, cursor: 'pointer' }}>{c}</button>
            ))}
          </div>

          {/* input */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 18px 16px', background: 'var(--paper, #F4F6FB)' }}>
            <input
              value={input}
              disabled={quotaOut}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={quotaOut ? L('Daily AI quota used up — back tomorrow', 'Jatah AI harian habis — kembali besok') : L('Ask about this property…', 'Tanya tentang properti ini…')}
              style={{ flex: 1, height: 46, border: '1px solid var(--line)', borderRadius: 12, padding: '0 15px', fontSize: 13.5, fontFamily: 'var(--sans)', outline: 'none', background: quotaOut ? '#EEF1F7' : '#fff', color: 'var(--ink)', cursor: quotaOut ? 'not-allowed' : 'text' }}
            />
            <button onClick={() => send()} disabled={!input.trim() || quotaOut} style={{
              width: 46, height: 46, borderRadius: 12, border: 'none', cursor: input.trim() && !quotaOut ? 'pointer' : 'default',
              background: input.trim() && !quotaOut ? 'var(--brand-gradient)' : '#DCE2EF', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"></path><path d="M22 2 15 22l-4-9-9-4z"></path></svg>
            </button>
          </div>
          {quotaLeft != null && !quotaOut && quotaLeft <= 40 && (
            <div style={{ padding: '0 18px 12px', marginTop: -6, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              {L(`AI quota left today: ${quotaLeft} tokens`, `Sisa jatah AI hari ini: ${quotaLeft} token`)}
            </div>
          )}
          <style>{`@keyframes aichatdot { 0%,100% { opacity:.3; transform:translateY(0);} 50% { opacity:1; transform:translateY(-3px);} }`}</style>
          </>
          )}
        </>
      )}
    </div>
  );
};

export default AIChatBox;
