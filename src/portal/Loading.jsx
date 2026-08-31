/* Indikator loading: spinner reusable + bar global koneksi lambat. */
import React from 'react';
import { onLoadingChange } from '../api/client';

/* Spinner lingkaran berputar — pakai di mana saja: <Spinner size={20} /> */
export const Spinner = ({ size = 20, color = 'var(--teal, #1A6FA8)', stroke = 2.5, style }) => (
  <span
    role="status"
    aria-label="Loading"
    style={{
      display: 'inline-block', width: size, height: size,
      border: `${stroke}px solid rgba(26,111,168,0.2)`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'assetraSpin 0.7s linear infinite', ...style,
    }}
  >
    <style>{`@keyframes assetraSpin { to { transform: rotate(360deg) } }`}</style>
  </span>
);

/* Baris teks + spinner untuk empty/loading state. */
export const LoadingRow = ({ label = 'Memuat…', size = 16 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13, padding: '10px 0' }}>
    <Spinner size={size} /> {label}
  </div>
);

/* Overlay penuh untuk blok yang sedang memuat (mis. kartu, panel). */
export const LoadingOverlay = ({ label }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(1px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 5 }}>
    <Spinner size={28} />
    {label && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{label}</span>}
  </div>
);

/* Bar loading global — muncul HANYA saat ada request tertunda > 400ms
   (indikasi koneksi lambat), agar tidak berkedip pada request cepat.
   Dipasang sekali di App. */
export const GlobalLoadingBar = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    let timer = null;
    const unsub = onLoadingChange((count) => {
      if (count > 0) {
        if (!timer && !visible) timer = setTimeout(() => { setVisible(true); timer = null; }, 400);
      } else {
        if (timer) { clearTimeout(timer); timer = null; }
        setVisible(false);
      }
    });
    return () => { if (timer) clearTimeout(timer); unsub(); };
  }, [visible]);

  if (!visible) return null;
  return (
    <div aria-live="polite" aria-busy="true">
      {/* Bar progres tipis di atas layar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, overflow: 'hidden', background: 'rgba(26,111,168,0.12)' }}>
        <div style={{ height: '100%', width: '40%', background: 'var(--brand-gradient, linear-gradient(90deg,#1A6FA8,#3BC4D9))', borderRadius: 3, animation: 'assetraBar 1.1s ease-in-out infinite' }} />
      </div>
      {/* Chip spinner mengambang kanan-bawah */}
      <div style={{ position: 'fixed', bottom: 18, right: 18, zIndex: 9999, background: '#fff', border: '1px solid var(--line, #E5E9F0)', borderRadius: 100, boxShadow: '0 6px 20px rgba(10,22,64,0.14)', padding: '8px 14px 8px 10px', display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--ink-2, #33415C)', fontFamily: 'var(--sans, sans-serif)' }}>
        <Spinner size={16} /> Memuat…
      </div>
      <style>{`@keyframes assetraBar { 0% { transform: translateX(-100%) } 100% { transform: translateX(320%) } }`}</style>
    </div>
  );
};
