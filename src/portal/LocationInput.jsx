/* Input lokasi dengan autocomplete (dropdown saran). Dipakai di hero beranda
   & strip pencarian. `extra` boleh diisi lokasi dari listing DB agar ikut muncul. */
import React from 'react';
import { suggestLocations } from '../lib/locations';

export default function LocationInput({ value, onChange, onSelect, onEnter, placeholder, extra = [], inputStyle, className }) {
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(-1);      // index yang disorot (keyboard)
  const [sugs, setSugs] = React.useState([]);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const recompute = (v) => {
    const list = suggestLocations(v, extra);
    setSugs(list);
    setOpen(list.length > 0);
    setHi(-1);
  };

  const pick = (loc) => {
    onChange(loc);
    setOpen(false);
    setHi(-1);
    onSelect && onSelect(loc);
  };

  const onKey = (e) => {
    if (!open || !sugs.length) {
      if (e.key === 'Enter') onEnter && onEnter();
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, sugs.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (hi >= 0) pick(sugs[hi]);
      else { setOpen(false); onEnter && onEnter(); }
    } else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <input
        className={className}
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); recompute(e.target.value); }}
        onFocus={() => value && recompute(value)}
        onKeyDown={onKey}
        autoComplete="off"
      />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 80,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
          boxShadow: '0 12px 30px rgba(10,22,64,0.16)', overflow: 'hidden', minWidth: 240,
        }}>
          {sugs.map((loc, i) => (
            <div
              key={loc}
              onMouseDown={(e) => { e.preventDefault(); pick(loc); }}
              onMouseEnter={() => setHi(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px',
                fontSize: 13.5, cursor: 'pointer', color: 'var(--ink-2)',
                background: i === hi ? 'var(--paper-2, #EEF1F7)' : 'transparent',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {loc}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
