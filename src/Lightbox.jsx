/* Full-screen photo carousel with prev/next, thumbnails, ESC + arrow keys. */
import React from 'react';

export default function Lightbox({ photos, initialIndex = 0, onClose }) {
  const [idx, setIdx] = React.useState(initialIndex);
  const [skipped, setSkipped] = React.useState(() => new Set());

  const prev = React.useCallback(() => setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = React.useCallback(() => setIdx(i => (i + 1) % photos.length), [photos.length]);

  // If the current photo fails to load, skip past it (and cap so we don't infinite-loop).
  const onImgError = () => {
    setSkipped(s => {
      if (s.has(idx)) return s;
      const ns = new Set(s); ns.add(idx); return ns;
    });
    if (skipped.size + 1 < photos.length) next();
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose]);

  // Preload neighbors for snappier nav
  React.useEffect(() => {
    [photos[(idx + 1) % photos.length], photos[(idx - 1 + photos.length) % photos.length]].forEach(src => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [idx, photos]);

  if (!photos || photos.length === 0) return null;
  const cur = photos[idx];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(5,11,36,0.96)',
        display: 'flex', flexDirection: 'column',
        animation: 'lb-fade .15s ease-out',
      }}
    >
      <style>{`
        @keyframes lb-fade { from { opacity: 0 } to { opacity: 1 } }
        .lb-arrow { transition: background .15s, transform .15s; }
        .lb-arrow:hover { background: rgba(255,255,255,0.18); transform: translateY(-50%) scale(1.05); }
        .lb-thumb { transition: opacity .12s, border-color .12s; }
        .lb-thumb:hover { opacity: 1; }
      `}</style>

      {/* Header */}
      <div onClick={(e) => e.stopPropagation()} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px',
        color: 'rgba(250,250,247,0.9)',
        fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em',
      }}>
        <span style={{ color: 'rgba(250,250,247,0.7)' }}>FOTO {String(idx + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
        <button onClick={onClose} aria-label="Close" style={{
          background: 'transparent', border: '1px solid rgba(250,250,247,0.25)',
          color: 'var(--paper)', padding: '8px 14px',
          fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.12em',
          cursor: 'pointer', borderRadius: 1,
        }}>TUTUP ×</button>
      </div>

      {/* Stage */}
      <div onClick={(e) => e.stopPropagation()} style={{
        flex: 1, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 80px',
      }}>
        <img
          key={cur}
          src={cur}
          alt={`Foto ${idx + 1}`}
          onError={onImgError}
          style={{
            maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            animation: 'lb-fade .18s ease-out',
          }}
          onClick={next}
        />

        {/* Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous"
          className="lb-arrow"
          style={{
            position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)',
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)', color: 'var(--paper)',
            cursor: 'pointer', fontSize: 22, fontFamily: 'serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >‹</button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next"
          className="lb-arrow"
          style={{
            position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)', color: 'var(--paper)',
            cursor: 'pointer', fontSize: 22, fontFamily: 'serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}
        >›</button>
      </div>

      {/* Thumbnail strip */}
      <div onClick={(e) => e.stopPropagation()} style={{
        padding: '14px 32px 22px',
        display: 'flex', gap: 8, justifyContent: 'center',
        overflowX: 'auto',
      }}>
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="lb-thumb"
            style={{
              flexShrink: 0,
              width: 72, height: 56, padding: 0,
              border: i === idx ? '2px solid var(--paper)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              opacity: i === idx ? 1 : 0.55,
              borderRadius: 1,
            }}
          >
            <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
