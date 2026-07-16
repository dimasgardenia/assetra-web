/* Admin · Media Library — browse every uploaded photo and document across all listings */
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useT } from '../../i18n';
import { AdmShell, AdmIcon } from './admin-shell';
import { useListings, useActions } from '../../store';
import { listingsApi } from '../../api/listings';
import { formatBytes } from '../../lib/files';
import FileDropzone from '../../components/FileDropzone';
import { isImageFile, extractAssetId } from '../../lib/files';

export default function AdmMediaLibrary({ lang, onLang, onChange }) {
  const { t } = useT();
  const navigate = useNavigate();
  const listings = useListings();
  const actions = useActions();

  React.useEffect(() => {
    actions.fetchListings({}, 1, 100).catch(() => {});
  }, []);
  const [tab, setTab] = React.useState('photos');
  const [query, setQuery] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [previewDoc, setPreviewDoc] = React.useState(null);

  // Flatten all photos with listing context
  const allPhotos = React.useMemo(() => {
    const out = [];
    for (const l of listings) {
      (l.uploadedPhotos || []).forEach((dataUrl, i) => {
        out.push({ dataUrl, listingId: l.id, listingTitle: l.title, index: i });
      });
    }
    return out;
  }, [listings]);

  const allDocs = React.useMemo(() => {
    const out = [];
    for (const l of listings) {
      Object.entries(l.documents || {}).forEach(([slot, doc]) => {
        out.push({ slot, ...doc, listingId: l.id, listingTitle: l.title });
      });
    }
    return out;
  }, [listings]);

  const filteredPhotos = query
    ? allPhotos.filter(p => `${p.listingId} ${p.listingTitle}`.toLowerCase().includes(query.toLowerCase()))
    : allPhotos;
  const filteredDocs = query
    ? allDocs.filter(d => `${d.listingId} ${d.listingTitle} ${d.name} ${d.slot}`.toLowerCase().includes(query.toLowerCase()))
    : allDocs;

  const totalBytes = allPhotos.reduce((s, p) => s + (p.dataUrl?.length || 0), 0)
    + allDocs.reduce((s, d) => s + (d.size || 0), 0);

  const handleBulkUpload = async (files) => {
    setBusy(true);
    try {
      let matched = 0, unmatched = 0;
      // Group images per assetId for batch upload
      const photoGroups = {}; // { assetId: [File] }
      const docFiles = [];    // [{ assetId, slot, file }]
      for (const f of files) {
        const assetId = extractAssetId(f.name);
        if (!assetId || !listings.find(l => l.id === assetId)) { unmatched++; continue; }
        if (isImageFile(f)) {
          (photoGroups[assetId] = photoGroups[assetId] || []).push(f);
        } else {
          const slotMatch = f.name.match(/^[A-Z·\d\-_]+[-_·]([a-zA-Z]+)/i);
          const slot = slotMatch ? slotMatch[1].toLowerCase() : 'other';
          docFiles.push({ assetId, slot, file: f });
        }
        matched++;
      }
      for (const [assetId, photos] of Object.entries(photoGroups)) {
        try { await listingsApi.uploadPhotos(assetId, photos); } catch (e) { console.warn(e); }
      }
      for (const { assetId, slot, file } of docFiles) {
        try { await listingsApi.uploadDocument(assetId, slot, file); } catch (e) { console.warn(e); }
      }
      actions.showToast(matched > 0 ? 'success' : 'info', `${matched} berhasil · ${unmatched} tidak cocok`);
      // Refresh listings to show updated photo/doc counts
      actions.fetchListings({}, 1, 100).catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdmShell
      active="documents" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.documents')]}
      title="Media Library"
      sub="Semua foto dan dokumen yang telah diunggah ke platform. Pencarian, preview, dan upload massal."
      headActions={
        <>
          <button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> Export manifest</button>
        </>
      }
    >
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Total foto</div>
          <div className="adm-kpi-val">{allPhotos.length}</div>
          <div className="adm-kpi-delta" style={{ color: 'var(--muted)' }}>di {new Set(allPhotos.map(p => p.listingId)).size} aset</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Dokumen</div>
          <div className="adm-kpi-val">{allDocs.length}</div>
          <div className="adm-kpi-delta" style={{ color: 'var(--muted)' }}>SHM · BPN · NPWP · Notaris</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Aset tanpa foto</div>
          <div className="adm-kpi-val" style={{ color: listings.filter(l => !l.uploadedPhotos?.length).length > 0 ? 'var(--gold)' : 'var(--green)' }}>
            {listings.filter(l => !l.uploadedPhotos?.length).length}
          </div>
          <div className="adm-kpi-delta" style={{ color: 'var(--muted)' }}>perlu upload</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Storage terpakai</div>
          <div className="adm-kpi-val" style={{ fontSize: 24 }}>{formatBytes(totalBytes)}</div>
          <div className="adm-kpi-delta" style={{ color: 'var(--muted)' }}>localStorage (demo)</div>
        </div>
      </div>

      {/* Bulk dropzone */}
      <FileDropzone
        accept="image/*,.pdf"
        multiple
        onFiles={handleBulkUpload}
        disabled={busy}
        height={120}
        style={{ marginBottom: 18 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
          <AdmIcon name="cloud" size={24} />
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            {busy ? 'Memproses…' : 'Drop foto atau dokumen — auto-match by Asset ID'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
            Nama file harus diawali Asset ID (cth: <b>AST·2026·0847_shm.pdf</b>, <b>AST-2026-0847-hero.jpg</b>)
          </div>
        </div>
      </FileDropzone>

      {/* Tabs + search */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)' }}>
          {[
            { id: 'photos', label: `Foto (${filteredPhotos.length})` },
            { id: 'docs', label: `Dokumen (${filteredDocs.length})` },
          ].map(x => (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              style={{
                padding: '8px 18px',
                background: tab === x.id ? 'var(--ink)' : 'transparent',
                color: tab === x.id ? 'var(--paper)' : 'var(--ink-2)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12, fontWeight: 500,
                fontFamily: 'var(--sans)',
              }}
            >{x.label}</button>
          ))}
        </div>
        <input
          placeholder="Cari berdasarkan Asset ID, judul, atau nama file…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '1px solid var(--line)',
            background: 'var(--paper)',
            fontFamily: 'var(--sans)',
            fontSize: 12,
            minWidth: 320,
            color: 'var(--ink)',
          }}
        />
      </div>

      {/* Content */}
      {tab === 'photos' && (
        filteredPhotos.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--line)', color: 'var(--muted)' }}>
            {query ? 'Tidak ada foto yang cocok dengan pencarian.' : 'Belum ada foto yang diunggah. Drop file di atas atau gunakan form "New Listing".'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {filteredPhotos.map((p, i) => (
              <Link
                key={`${p.listingId}-${p.index}`}
                to={`/listing/${encodeURIComponent(p.listingId)}`}
                style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', cursor: 'pointer', display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <img src={p.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 10px 8px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', opacity: 0.85 }}>{p.listingId}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.listingTitle}</div>
                </div>
                {p.index === 0 && (
                  <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--gold)', color: 'var(--paper)', padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em' }}>COVER</span>
                )}
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'docs' && (
        filteredDocs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--line)', color: 'var(--muted)' }}>
            {query ? 'Tidak ada dokumen yang cocok dengan pencarian.' : 'Belum ada dokumen. Upload via form "New Listing" atau bulk upload di atas.'}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 100px 1fr 1fr 100px 80px', padding: '12px 18px', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              <div>Asset ID</div>
              <div>Slot</div>
              <div>Listing</div>
              <div>File</div>
              <div style={{ textAlign: 'right' }}>Size</div>
              <div style={{ textAlign: 'right' }}>Aksi</div>
            </div>
            {filteredDocs.map((d, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 100px 1fr 1fr 100px 80px', padding: '12px 18px', borderBottom: i < filteredDocs.length - 1 ? '1px solid var(--line)' : 'none', alignItems: 'center', fontSize: 12 }}>
                <Link to={`/listing/${encodeURIComponent(d.listingId)}`} style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', textDecoration: 'none' }}>{d.listingId}</Link>
                <div><span className="adm-pill verified" style={{ textTransform: 'uppercase' }}>{d.slot}</span></div>
                <div style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.listingTitle}</div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <AdmIcon name="doc" size={11} /> {d.name}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{formatBytes(d.size)}</div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setPreviewDoc(d)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', padding: 4 }}
                    title="Preview"
                  ><AdmIcon name="eye" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Doc preview modal */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,36,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--paper)', width: 'min(900px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>{previewDoc.listingId} · {previewDoc.slot.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{previewDoc.name}</div>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'transparent', border: '1px solid var(--line)', padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11 }}>TUTUP ×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--paper-2)' }}>
              {previewDoc.type?.startsWith('image/') ? (
                <img src={previewDoc.dataUrl} alt={previewDoc.name} style={{ maxWidth: '100%', display: 'block', margin: '0 auto' }} />
              ) : previewDoc.type === 'application/pdf' ? (
                <iframe src={previewDoc.dataUrl} title={previewDoc.name} style={{ width: '100%', height: '70vh', border: 'none' }} />
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  Preview tidak tersedia untuk tipe file ini. <a href={previewDoc.dataUrl} download={previewDoc.name}>Download</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
