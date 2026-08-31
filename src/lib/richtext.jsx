/* Renderer markdown-ringan untuk balasan AI di kotak chat.
   Membangun elemen React langsung (aman dari injeksi HTML — tidak pakai
   dangerouslySetInnerHTML). Mendukung: **tebal**, *miring*, poin (- / •),
   daftar bernomor (1.), dan heading (#) yang dijadikan baris tebal. */
import React from 'react';

/* Inline: **tebal** dan *miring* / _miring_ → <strong>/<em> */
function renderInline(text, keyBase) {
  const nodes = [];
  const re = /(\*\*([^*]+)\*\*|(?:\*|_)([^*_]+)(?:\*|_))/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] != null) nodes.push(<strong key={`${keyBase}-b${i}`}>{m[2]}</strong>);
    else nodes.push(<em key={`${keyBase}-i${i}`}>{m[3]}</em>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const liStyle = { margin: '2px 0', lineHeight: 1.55 };
const listStyle = { margin: '6px 0', paddingLeft: 20 };

export function renderRichText(text) {
  if (!text) return null;
  const lines = String(text).replace(/\r/g, '').split('\n');
  const out = [];
  let list = null;      // { type: 'ul'|'ol', items: [] }
  let k = 0;

  const flush = () => {
    if (!list) return;
    const Tag = list.type === 'ol' ? 'ol' : 'ul';
    out.push(<Tag key={`l${k++}`} style={listStyle}>{list.items}</Tag>);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);

    if (bullet) {
      if (!list || list.type !== 'ul') { flush(); list = { type: 'ul', items: [] }; }
      list.items.push(<li key={`li${k++}`} style={liStyle}>{renderInline(bullet[1], `li${k}`)}</li>);
    } else if (numbered) {
      if (!list || list.type !== 'ol') { flush(); list = { type: 'ol', items: [] }; }
      list.items.push(<li key={`li${k++}`} style={liStyle}>{renderInline(numbered[1], `li${k}`)}</li>);
    } else if (heading) {
      flush();
      out.push(<div key={`h${k++}`} style={{ fontWeight: 700, margin: '8px 0 2px' }}>{renderInline(heading[1], `h${k}`)}</div>);
    } else if (line.trim() === '') {
      flush();
      out.push(<div key={`sp${k++}`} style={{ height: 6 }} />);
    } else {
      flush();
      out.push(<div key={`p${k++}`} style={{ margin: '2px 0' }}>{renderInline(line, `p${k}`)}</div>);
    }
  }
  flush();
  return out;
}
