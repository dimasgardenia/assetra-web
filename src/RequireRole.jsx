import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './store';

/** Guards routes that require a logged-in user with a specific role. */
export default function RequireRole({ role, children }) {
  const user = useUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/signin?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (role && user.role !== role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 32 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--red)', marginBottom: 16 }}>● AKSES DITOLAK · ROLE NOT AUTHORIZED</div>
          <h1 className="as-display" style={{ fontSize: 36, margin: '0 0 12px' }}>Halaman ini hanya untuk admin.</h1>
          <p style={{ color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 24 }}>
            Akun Anda terdaftar sebagai <b>{user.role}</b>. Hubungi tim operasional untuk akses Admin Console, atau masuk dengan akun admin yang berbeda.
          </p>
          <a href="/" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', fontWeight: 600 }}>← Kembali ke beranda</a>
        </div>
      </div>
    );
  }
  return children;
}
