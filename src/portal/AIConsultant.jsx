/* Portal AI Property Consultant — the offline-agent differentiator.
   Chat input is live: messages go to POST /api/ai/chat (Claude API). */
import React from 'react';
import { useT } from '../i18n';
import { PIcon, PortalNav, PortalFooter } from './shared';
import { api } from '../api/client';

const PortalAI = ({ lang, onLang, onNav }) => {
  const { t } = useT();
  const id = lang === 'id';
  const [msgs, setMsgs] = React.useState([]);   // real conversation beyond the showcase
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const bodyRef = React.useRef(null);

  const send = async () => {
    const q = input.trim();
    if (!q || typing) return;
    const history = [
      { role: 'user', content: t('p.ai.q') },
      { role: 'assistant', content: t('p.ai.a') },
      ...msgs.map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text })),
    ];
    setMsgs(m => [...m, { from: 'me', text: q }]);
    setInput('');
    setTyping(true);
    try {
      const r = await api.post('/api/ai/chat', { message: q, lang, history: history.slice(-12) });
      setMsgs(m => [...m, { from: 'ai', text: r.reply }]);
    } catch (e) {
      setMsgs(m => [...m, { from: 'ai', text: id
        ? 'Maaf, konsultan AI sedang tidak tersedia. Pastikan backend berjalan dan ANTHROPIC_API_KEY telah dikonfigurasi.'
        : 'Sorry, the AI consultant is unavailable right now. Make sure the backend is running and ANTHROPIC_API_KEY is configured.' }]);
    } finally {
      setTyping(false);
    }
  };

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  return (
    <div className="pscreen">
      <PortalNav active="ai" lang={lang} onLang={onLang} onNav={onNav} />

      {/* hero */}
      <section style={{ background: 'linear-gradient(135deg, #0A1640 0%, #14306B 60%, #1A6FA8 100%)', color: '#fff', padding: '52px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(700px 400px at 85% 0%, rgba(59,196,217,0.3), transparent 60%)' }} />
        <div className="pwrap" style={{ position: 'relative' }}>
          <div className="p-ai-badge" style={{ borderColor: 'rgba(59,196,217,0.5)' }}><PIcon name="sparkle" size={13} /> {t('p.ai.eyebrow')} · BETA</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 46, letterSpacing: '-0.02em', margin: '18px 0 12px', maxWidth: 720, lineHeight: 1.08 }}>{t('p.ai.title')}</h1>
          <p style={{ fontSize: 17, color: 'rgba(250,250,247,0.8)', maxWidth: 620, lineHeight: 1.5, margin: 0 }}>{t('p.ai.sub')}</p>
        </div>
      </section>

      <div className="pwrap" style={{ padding: '40px 32px 56px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'flex-start' }}>
        {/* Chat console */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--p-card-shadow)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ink)', color: '#fff' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIcon name="sparkle" size={18} /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Assetra AI Consultant</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.06em' }}>● ONLINE · HIGHEST-AND-BEST-USE ENGINE</div>
            </div>
          </div>

          <div ref={bodyRef} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18, minHeight: 420, maxHeight: 560, overflowY: 'auto' }}>
            {/* showcase user */}
            <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-end', maxWidth: '78%' }}>
              <div style={{ background: 'var(--ink)', color: '#fff', padding: '12px 16px', borderRadius: '14px 14px 4px 14px', fontSize: 14, lineHeight: 1.5 }}>{t('p.ai.q')}</div>
            </div>

            {/* showcase ai analysis card */}
            <div style={{ display: 'flex', gap: 10, maxWidth: '92%' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={15} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '4px 14px 14px 14px', padding: 18 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', marginBottom: 16 }}>{t('p.ai.a')}</div>

                  {/* HBU comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>CURRENT · OFFICE</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--muted)' }}>4.1%</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>gross yield</div>
                    </div>
                    <div style={{ background: 'rgba(45,138,111,0.06)', border: '1px solid rgba(45,138,111,0.3)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 6 }}>PROPOSED · HOTEL ▲</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--green)' }}>9.6%</div>
                      <div style={{ fontSize: 11, color: 'var(--green)' }}>+5.5pp uplift</div>
                    </div>
                  </div>

                  {/* feasibility row */}
                  <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <span>CAPEX <b>Rp 18 M</b></span><span>PAYBACK <b>6.2 yrs</b></span><span>ZONING <b style={{ color: 'var(--green)' }}>✓ OK</b></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="p-btn p-btn-cyan p-btn-sm"><PIcon name="doc" size={14} /> {id ? 'Laporan kelayakan' : 'Feasibility report'}</button>
                  <button className="p-btn p-btn-ghost p-btn-sm"><PIcon name="users" size={14} /> {t('p.ai.cta2')}</button>
                </div>
              </div>
            </div>

            {/* live conversation */}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {m.from === 'ai' && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={15} /></div>
                )}
                <div style={{
                  padding: '12px 16px', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  borderRadius: m.from === 'me' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  background: m.from === 'me' ? 'var(--ink)' : 'var(--paper-2)',
                  color: m.from === 'me' ? '#fff' : 'var(--ink-2)',
                  border: m.from === 'me' ? 'none' : '1px solid var(--line)',
                }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name="sparkle" size={15} /></div>
                <div style={{ padding: '13px 16px', borderRadius: '4px 14px 14px 14px', background: 'var(--paper-2)', border: '1px solid var(--line)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', opacity: 0.5, animation: `aidot 1s ${i * 0.18}s infinite` }}></span>)}
                </div>
              </div>
            )}
          </div>

          {/* input */}
          <div style={{ padding: 16, borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
            <input
              className="p-input"
              placeholder={id ? 'Tanya tentang properti apa pun…' : 'Ask about any property…'}
              style={{ flex: 1 }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="p-btn p-btn-cyan" onClick={send} disabled={typing || !input.trim()}><PIcon name="arrowR" size={16} /></button>
          </div>
          <style>{`@keyframes aidot { 0%,100% { opacity:.3; transform:translateY(0);} 50% { opacity:1; transform:translateY(-3px);} }`}</style>
        </div>

        {/* Right: how offline agents use it */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 19, margin: '0 0 4px' }}>{id ? 'Apa yang dianalisis AI' : 'What the AI analyses'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
              {[
                { ic: 'trend', k: 'p.ai.f1', d: id ? 'Penggunaan paling menguntungkan untuk lokasi & zonasi' : 'Most profitable use for the site & zoning' },
                { ic: 'calc', k: 'p.ai.f2', d: id ? 'Estimasi nilai pasar dari 50rb+ transaksi' : 'Market value from 50k+ comparables' },
                { ic: 'bolt', k: 'p.ai.f3', d: id ? 'Proyeksi imbal hasil, capex, dan ROI' : 'Yield, capex & ROI projections' },
                { ic: 'shield', k: 'p.ai.f4', d: id ? 'Cek kepatuhan zonasi & perizinan' : 'Zoning & permit compliance check' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(26,111,168,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PIcon name={f.ic} size={17} /></div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t(f.k)}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45, marginTop: 1 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* offline agent CTA */}
          <div style={{ background: 'var(--ink)', color: '#fff', borderRadius: 12, padding: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(400px 200px at 100% 0%, rgba(59,196,217,0.2), transparent 60%)' }} />
            <div style={{ position: 'relative' }}>
              <PIcon name="users" size={24} />
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20, margin: '12px 0 8px' }}>{id ? 'Didukung agen offline' : 'Backed by offline agents'}</h3>
              <p style={{ fontSize: 13, color: 'rgba(250,250,247,0.75)', lineHeight: 1.55, marginBottom: 16 }}>{id ? 'AI menyiapkan analisis, agen lapangan kami yang mengeksekusi: survei, izin, negosiasi, hingga notaris.' : 'The AI prepares the analysis; our field agents execute — surveys, permits, negotiation, and notary.'}</p>
              <button className="p-btn p-btn-cyan" style={{ width: '100%' }}><PIcon name="phone" size={15} /> {t('p.ai.cta2')}</button>
            </div>
          </div>
        </aside>
      </div>

      <PortalFooter />
    </div>
  );
};

export default PortalAI;
