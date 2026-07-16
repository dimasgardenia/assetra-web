/* Reusable drag/drop file zone. Accepts images and/or PDFs.
   Renders children when "minimal" mode is used (caller supplies its own UI). */
import React from 'react';

export default function FileDropzone({
  accept = 'image/*',
  multiple = true,
  onFiles,
  disabled = false,
  className = '',
  style,
  children,
  height = 180,
}) {
  const [hover, setHover] = React.useState(false);
  const inputRef = React.useRef(null);

  const handle = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(f => {
      if (accept === '*' || !accept) return true;
      // crude accept-check: if accept includes pattern like image/* or .pdf, allow accordingly
      return accept.split(',').map(s => s.trim()).some(pattern => {
        if (pattern.endsWith('/*')) return f.type.startsWith(pattern.replace('/*', '/'));
        if (pattern.startsWith('.')) return f.name.toLowerCase().endsWith(pattern.toLowerCase());
        return f.type === pattern;
      });
    });
    if (files.length) onFiles?.(files);
  };

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); if (!disabled) setHover(true); }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setHover(true); }}
      onDragLeave={(e) => { e.preventDefault(); setHover(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        if (disabled) return;
        handle(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={className}
      style={{
        border: `2px dashed ${hover ? 'var(--teal)' : 'var(--line)'}`,
        background: hover ? 'rgba(59,196,217,0.06)' : 'var(--paper-2)',
        padding: 24,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        textAlign: 'center',
        transition: 'all .12s ease',
        minHeight: height,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 6,
        borderRadius: 2,
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files)}
      />
      {children}
    </div>
  );
}
