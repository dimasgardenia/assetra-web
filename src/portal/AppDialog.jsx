/* Modal aplikasi yang rapi — pengganti window.alert bawaan browser.
   Dikontrol lewat state: null = tertutup, atau objek { icon, title, message, primary, onPrimary }. */
import React from 'react';
import { PIcon } from './shared';

const AppDialog = ({ dialog, onClose, lang = 'id' }) => {
  const id = lang === 'id';
  /* Tutup dengan tombol Escape. */
  React.useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, onClose]);

  if (!dialog) return null;
  const { icon = 'lock', title, message, primary, onPrimary, tone = 'teal', danger = false } = dialog;
  const accent = danger ? 'var(--red, #C0392B)' : tone === 'gold' ? 'var(--gold-2, #B8860B)' : 'var(--teal)';
  const iconBg = danger ? 'rgba(192,57,43,0.12)' : 'rgba(59,196,217,0.13)';
  const dangerBtn = { background: 'var(--red, #C0392B)', color: '#fff', border: 'none' };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,22,64,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'agdFade .16s ease-out' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true"
        style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(10,22,64,0.28)', padding: '28px 26px 22px', textAlign: 'center', fontFamily: 'var(--sans)', animation: 'agdPop .18s cubic-bezier(.2,.8,.3,1.2)' }}
      >
        <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <PIcon name={icon} size={24} />
        </div>
        {title && <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 19, color: 'var(--ink)', marginBottom: 7 }}>{title}</div>}
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 20 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {primary ? (
            <>
              <button onClick={onClose} className="p-btn p-btn-ghost" style={{ flex: 1 }}>{dialog.cancel || (id ? 'Nanti saja' : 'Not now')}</button>
              <button onClick={() => { onClose(); onPrimary && onPrimary(); }} className={danger ? 'p-btn' : 'p-btn p-btn-cyan'} style={{ flex: 1, ...(danger ? dangerBtn : {}) }}>{primary}</button>
            </>
          ) : (
            <button onClick={onClose} className="p-btn p-btn-cyan" style={{ minWidth: 130 }}>{id ? 'Mengerti' : 'Got it'}</button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes agdFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes agdPop { from { opacity: 0; transform: translateY(8px) scale(.97) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
};

export default AppDialog;
