import React from 'react';
import { useStore } from './store';

export default function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  const { kind, text } = state.toast;
  const colors = {
    success: { bg: 'var(--green)', fg: '#fff' },
    info: { bg: 'var(--ink)', fg: '#fff' },
    error: { bg: 'var(--red)', fg: '#fff' },
  }[kind] || { bg: 'var(--ink)', fg: '#fff' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: colors.bg, color: colors.fg,
      padding: '12px 20px', borderRadius: 2, fontFamily: 'var(--sans)',
      fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      maxWidth: '90vw',
    }}>{text}</div>
  );
}
