/* Admin · Bulk Upload (CSV) + Bidders/KYC + Auctions monitor */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { AdmShell, AdmIcon } from './admin-shell';
import { FieldRow, Field, RadioCard, ChkChip, SectionHead } from './admin-new';
import { useActions, useListings } from '../../store';
import { listingsApi } from '../../api/listings';
import { adminApi } from '../../api/admin';
import FileDropzone from '../../components/FileDropzone';
import { formatBytes, isImageFile, extractAssetId } from '../../lib/files';

const AdmBulkUpload = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const actions = useActions();
  const listings = useListings();
  const [step, setStep] = React.useState(3);
  const [bulkFiles, setBulkFiles] = React.useState({}); // { 'AST·2026·0901': [{file, name, kind, size}] }
  const [busy, setBusy] = React.useState(false);

  // Pre-fetch listings so we can show match counts
  React.useEffect(() => {
    actions.fetchListings({}, 1, 100).catch(() => {});
  }, []);

  const handleBulkFiles = async (files) => {
    setBusy(true);
    try {
      const groups = { ...bulkFiles };
      let matched = 0, unmatched = 0;
      for (const f of files) {
        const assetId = extractAssetId(f.name);
        const targetKey = assetId || '__unmatched__';
        if (assetId) matched++; else unmatched++;
        const item = { file: f, name: f.name, size: f.size, type: f.type, kind: isImageFile(f) ? 'photo' : 'doc' };
        groups[targetKey] = [...(groups[targetKey] || []), item];
      }
      setBulkFiles(groups);
      actions.showToast(matched > 0 ? 'success' : 'info', `${matched} cocok · ${unmatched} tidak cocok dengan Asset ID manapun`);
    } finally {
      setBusy(false);
    }
  };

  const commitBulkFilesToListings = async () => {
    for (const [assetId, files] of Object.entries(bulkFiles)) {
      if (assetId === '__unmatched__') continue;
      const photos = files.filter(f => f.kind === 'photo').map(f => f.file);
      const docs = files.filter(f => f.kind === 'doc');
      if (photos.length) {
        try { await listingsApi.uploadPhotos(assetId, photos); } catch (e) { console.warn('photo upload', assetId, e); }
      }
      for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        const slotName = (d.name.match(/^[A-Z·\d\-_]+[-_·](\w+)/i) || [null, `bulk_${i+1}`])[1].toLowerCase();
        try { await listingsApi.uploadDocument(assetId, slotName, d.file); } catch (e) { console.warn('doc upload', assetId, e); }
      }
    }
  };

  const publishAll = async () => {
    setBusy(true);
    try {
      await commitBulkFilesToListings();
      setStep(5);
      actions.showToast('success', 'Bulk publish selesai');
      setTimeout(() => navigate('/admin/listings'), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdmShell
      active="bulk" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.listings'), t('adm.bulk.title')]}
      title={t('adm.bulk.title')}
      sub={t('adm.bulk.sub')}
      headActions={
        <>
          <button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> {t('adm.bulk.template')}</button>
          <button className="adm-topbar-btn primary" onClick={publishAll}><AdmIcon name="check" size={13} /> {t('adm.btn.publishAll')}</button>
        </>
      }
    >
      {/* Stepper */}
      <div className="adm-stepper">
        {[
          { n: 1, name: t('adm.bulk.tab1'), m: 'COMPLETE' },
          { n: 2, name: t('adm.bulk.tab2'), m: 'COMPLETE' },
          { n: 3, name: t('adm.bulk.tab3'), m: 'IN PROGRESS' },
          { n: 4, name: t('adm.bulk.tab4'), m: 'PENDING' },
          { n: 5, name: t('adm.bulk.tab5'), m: 'PENDING' },
        ].map(s => (
          <div key={s.n} className={`adm-step ${s.n < step ? 'done' : s.n === step ? 'active' : ''}`} onClick={() => setStep(s.n)} style={{ cursor: 'pointer' }}>
            <div className="adm-step-num">{s.n < step ? <AdmIcon name="check" size={12} stroke={3} /> : s.n}</div>
            <div className="adm-step-label">
              <div className="adm-step-name">{s.name}</div>
              <div className="adm-step-meta">{s.m}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 — drop zone (always shown collapsed if step > 1) */}
      {step === 1 && (
        <div className="adm-section">
          <SectionHead num="01" name={t('adm.bulk.tab1')} sub="CSV / XLSX" />
          <div className="adm-drop">
            <div className="adm-drop-icon"><AdmIcon name="file-csv" size={22} /></div>
            <div className="adm-drop-title">{t('adm.bulk.dropTitle')}</div>
            <div className="adm-drop-sub">{t('adm.bulk.dropSub')}</div>
            <div className="adm-drop-pick">{t('adm.drop.pick')}</div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>
            <AdmIcon name="cloud" size={14} /> {t('adm.bulk.template')}
          </div>
        </div>
      )}

      {/* Step 2 — column mapping */}
      {step === 2 && (
        <div className="adm-section">
          <SectionHead num="02" name={t('adm.bulk.tab2')} sub="MATCH" />
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 0, border: '1px solid var(--line)' }}>
            <div style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>CSV Column (sample)</div>
            <div style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>Maps to</div>
            <div style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>Status</div>
            {[
              ['asset_id', 'AST·2026·0901', 'Asset ID', 'auto'],
              ['title', 'Beachfront Land Plot', 'Listing title', 'auto'],
              ['type', 'Land', 'Asset type', 'auto'],
              ['address', 'Jl. Pantai Berawa 8…', 'Address', 'auto'],
              ['land_m2', '1,200', 'Land area (m²)', 'auto'],
              ['cert', 'SHM', 'Certificate', 'auto'],
              ['bpn_no', '12.04.07.18.001950', 'BPN registration', 'auto'],
              ['starting_idr', '5,500,000,000', 'Starting bid', 'auto'],
              ['notary_name', 'H. Surya, S.H.', 'Notary', 'manual'],
            ].map((r, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '11px 16px', borderBottom: i < 8 ? '1px solid var(--line)' : 'none', fontFamily: 'var(--mono)', fontSize: 12 }}>
                  <div style={{ color: 'var(--ink)' }}>{r[0]}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 10 }}>{r[1]}</div>
                </div>
                <div style={{ padding: '11px 16px', borderBottom: i < 8 ? '1px solid var(--line)' : 'none', display: 'flex', alignItems: 'center' }}>
                  <select className="adm-select" defaultValue={r[2]}><option>{r[2]}</option></select>
                </div>
                <div style={{ padding: '11px 16px', borderBottom: i < 8 ? '1px solid var(--line)' : 'none', display: 'flex', alignItems: 'center' }}>
                  {r[3] === 'auto' ? <span className="adm-pill verified">✓ Auto-detected</span> : <span className="adm-pill pending">⊙ Manual</span>}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Validate */}
      {step === 3 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="adm-kpi">
              <div className="adm-kpi-label">{t('adm.bulk.k.total')}</div>
              <div className="adm-kpi-val">247</div>
              <div className="adm-kpi-delta" style={{ color: 'var(--muted)' }}>{t('adm.bulk.k.totalSub')}</div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">{t('adm.bulk.k.valid')}</div>
              <div className="adm-kpi-val" style={{ color: 'var(--green)' }}>232</div>
              <div className="adm-kpi-delta up">▲ 93.9% pass</div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">{t('adm.bulk.k.warnings')}</div>
              <div className="adm-kpi-val" style={{ color: 'var(--gold)' }}>12</div>
              <div className="adm-kpi-delta" style={{ color: 'var(--gold)' }}>{t('adm.bulk.k.warningsSub')}</div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">{t('adm.bulk.k.errors')}</div>
              <div className="adm-kpi-val" style={{ color: 'var(--red)' }}>3</div>
              <div className="adm-kpi-delta down">{t('adm.bulk.k.errorsSub')}</div>
            </div>
          </div>

          <div className="adm-card" style={{ overflow: 'hidden' }}>
            <div className="adm-card-head">
              <h3 className="adm-card-title">{t('adm.bulk.preview')}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="adm-topbar-btn" style={{ fontSize: 11 }}>{t('adm.bulk.filter.errors')}</button>
                <button className="adm-topbar-btn" style={{ fontSize: 11 }}>{t('adm.bulk.filter.warnings')}</button>
                <button className="adm-topbar-btn" style={{ fontSize: 11 }}>{t('adm.bulk.filter.all')}</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-csv-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>asset_id</th>
                    <th>title</th>
                    <th>type</th>
                    <th>region</th>
                    <th style={{ textAlign: 'right' }}>land_m2</th>
                    <th>cert</th>
                    <th>bpn_no</th>
                    <th style={{ textAlign: 'right' }}>starting_idr</th>
                    <th>{t('adm.bulk.col.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1, id: 'AST·2026·0901', title: 'Beachfront Land Plot', type: 'Land', region: 'Bali', m2: '1,200', cert: 'SHM', bpn: '12.04.07.18.001950', idr: '5,500,000,000', s: 'ok' },
                    { n: 2, id: 'AST·2026·0902', title: 'Padi Field — North', type: 'Agricultural', region: 'West Java', m2: '4,500', cert: 'SHM', bpn: '32.04.11.07.000821', idr: '2,200,000,000', s: 'ok' },
                    { n: 3, id: 'AST·2026·0903', title: 'Townhouse Block', type: 'Residential', region: 'Jakarta', m2: '320', cert: 'HGB', bpn: '12.04.07.18.001951', idr: '8,900,000,000', s: 'warn', warn: 'NJOP missing' },
                    { n: 4, id: 'AST·2026·0904', title: 'Office Suite', type: 'Commercial', region: 'Jakarta', m2: '180', cert: 'HGB', bpn: '12.04.07.18.001952', idr: '6,700,000,000', s: 'ok' },
                    { n: 5, id: '', title: 'Mountain Land', type: 'Land', region: 'West Java', m2: '8,000', cert: 'SHM', bpn: '32.05.12.04.000891', idr: '3,400,000,000', s: 'err', err: 'asset_id required' },
                    { n: 6, id: 'AST·2026·0906', title: 'Industrial Lot', type: 'Industrial', region: 'Banten', m2: '2,400', cert: 'HGB', bpn: '36.02.05.07.001119', idr: '14,500,000,000', s: 'ok' },
                    { n: 7, id: 'AST·2026·0907', title: 'Coastal Land', type: 'Land', region: 'Lombok', m2: '6,200', cert: 'SHM', bpn: '52.04.07.11.000284', idr: '9,800,000,00X', s: 'err', err: 'invalid number' },
                    { n: 8, id: 'AST·2026·0908', title: 'Apartment Unit 14F', type: 'Residential', region: 'Jakarta', m2: '180', cert: 'SHGB', bpn: '12.04.07.18.001953', idr: '5,100,000,000', s: 'ok' },
                    { n: 9, id: 'AST·2026·0909', title: 'Beachside Villa', type: 'Residential', region: 'Bali', m2: '720', cert: 'SHM', bpn: '12.04.07.18.001954', idr: '11,200,000,000', s: 'warn', warn: 'NPWP missing' },
                  ].map(r => (
                    <tr key={r.n} className={r.s === 'err' ? 'row-error' : r.s === 'warn' ? 'row-warn' : ''}>
                      <td style={{ color: 'var(--muted)' }}>{r.n}</td>
                      <td style={{ color: r.id ? 'var(--ink)' : 'var(--red)' }}>{r.id || '—'}</td>
                      <td>{r.title}</td>
                      <td>{r.type}</td>
                      <td>{r.region}</td>
                      <td style={{ textAlign: 'right' }}>{r.m2}</td>
                      <td>{r.cert}</td>
                      <td>{r.bpn}</td>
                      <td style={{ textAlign: 'right', color: r.idr.includes('X') ? 'var(--red)' : 'var(--ink)' }}>{r.idr}</td>
                      <td>
                        {r.s === 'ok' && <span className="adm-pill verified">✓ Valid</span>}
                        {r.s === 'warn' && <span className="adm-pill pending">⊙ {r.warn}</span>}
                        {r.s === 'err' && <span className="adm-pill rejected">✕ {r.err}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
              <span>{t('adm.bulk.showing', 9, 247)}</span>
              <button className="adm-topbar-btn" style={{ fontSize: 11 }}>{t('adm.bulk.fix')} →</button>
            </div>
          </div>
        </>
      )}

      {/* Step 4 — Photos & Docs */}
      {step === 4 && (
        <div className="adm-section">
          <SectionHead num="04" name={t('adm.bulk.tab4')} sub="MATCH BY ASSET ID" />
          <FileDropzone
            accept="image/*,.pdf"
            multiple
            onFiles={handleBulkFiles}
            disabled={busy}
            height={160}
            style={{ marginBottom: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
              <AdmIcon name="cloud" size={28} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {busy ? 'Memproses…' : t('adm.bulk.photoTitle')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {t('adm.bulk.photoSub')}
              </div>
              <div style={{ fontSize: 10, color: 'var(--teal)', fontFamily: 'var(--mono)', marginTop: 4 }}>
                Contoh nama file: <b>AST·2026·0901_shm.pdf</b>, <b>AST-2026-0901-front.jpg</b>
              </div>
            </div>
          </FileDropzone>

          {/* Match results — show every listing in store, count uploaded files matched to it */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {listings.slice(0, 12).map(l => {
              const files = bulkFiles[l.id] || [];
              const photoCount = files.filter(f => f.kind === 'photo').length;
              const docCount = files.filter(f => f.kind === 'doc').length;
              const total = photoCount + docCount;
              return (
                <div key={l.id} style={{ padding: 12, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, background: total > 0 ? 'rgba(45,106,79,0.04)' : '#fff' }}>
                  <div style={{ width: 40, height: 40, background: total > 0 ? 'var(--green)' : 'var(--paper-2)', color: total > 0 ? 'var(--paper)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AdmIcon name={total > 0 ? 'check' : 'x'} size={16} stroke={3} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)' }}>{l.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  </div>
                  <span className={`adm-pill ${total > 0 ? 'verified' : 'pending'}`}>
                    {total > 0 ? `${photoCount} photo · ${docCount} doc` : 'no file'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Unmatched warning */}
          {bulkFiles.__unmatched__ && bulkFiles.__unmatched__.length > 0 && (
            <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--red)', background: 'rgba(166,29,29,0.04)', borderLeft: '4px solid var(--red)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', marginBottom: 8 }}>
                ✕ {bulkFiles.__unmatched__.length} FILE TIDAK COCOK
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>
                Nama file harus diawali Asset ID (format: <code style={{ fontFamily: 'var(--mono)' }}>AST·YYYY·NNNN_*</code> atau <code style={{ fontFamily: 'var(--mono)' }}>AST-YYYY-NNNN-*</code>):
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', maxHeight: 120, overflow: 'auto' }}>
                {bulkFiles.__unmatched__.map((f, i) => (
                  <div key={i}>· {f.name} ({formatBytes(f.size)})</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5 — Publish */}
      {step === 5 && (
        <div className="adm-section" style={{ textAlign: 'center', padding: '40px 26px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.12em', marginBottom: 12 }}>● {t('adm.bulk.publishingNow')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 36, color: 'var(--ink)', marginBottom: 6 }}>{t('adm.bulk.publishing')}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>{t('adm.bulk.publishHint')}</div>
          <div className="adm-form-progress" style={{ width: '60%', margin: '0 auto', height: 6 }}>
            <div className="adm-form-progress-fill" style={{ width: '64%' }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>158 / 247 · 64%</div>
        </div>
      )}

      <div className="adm-form-bar">
        <div className="adm-form-bar-status">
          <span>{t('adm.bulk.step', step, 5)}</span>
          {step === 3 && <span style={{ color: 'var(--red)' }}>● {t('adm.bulk.fixFirst')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 1 && <button className="adm-topbar-btn" onClick={() => setStep(step - 1)}>← {t('adm.btn.back')}</button>}
          {step < 5 && <button className="adm-topbar-btn primary" onClick={() => setStep(step + 1)}>{t('adm.btn.next')} →</button>}
        </div>
      </div>
    </AdmShell>
  );
};

/* ─────────── Bidders / KYC ─────────── */

const AdmBidders = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  const actions = useActions();
  const [selected, setSelected] = React.useState(0);
  const [apiKyc, setApiKyc] = React.useState([]);

  React.useEffect(() => {
    adminApi.kycAll().then(r => setApiKyc(r.data)).catch(() => {});
  }, []);

  const baseBidders = [
    { id: 'B-0089', name: 'Anita Kusuma', email: 'a.kusuma@gmail.com', npwp: '02.345.678.9-014.000', deposit: 875_000_000, status: 'pending', submitted: '2d 14h ago', kemenkeu: false, kyc: 'review' },
    { id: 'B-0090', name: 'Bambang Wicaksono', email: 'bambang.w@yahoo.co.id', npwp: '03.567.012.4-031.000', deposit: 245_000_000, status: 'pending', submitted: '1d 8h ago', kemenkeu: true, kyc: 'review' },
    { id: 'B-0091', name: 'PT Mahkota Investama', email: 'corp@mahkota.id', npwp: '01.234.567.8-001.000', deposit: 1_420_000_000, status: 'pending', submitted: '6h ago', kemenkeu: true, kyc: 'review' },
    { id: 'B-0042', name: 'Reza Hartanto', email: 'reza.h@gmail.com', npwp: '02.890.123.4-027.000', deposit: 875_000_000, status: 'verified', submitted: '14d ago', kemenkeu: true, kyc: 'verified' },
    { id: 'B-0017', name: 'Sari Indrawati', email: 'sari.indra@me.com', npwp: '02.456.789.1-018.000', deposit: 245_000_000, status: 'verified', submitted: '23d ago', kemenkeu: false, kyc: 'verified' },
    { id: 'B-0008', name: 'Hendra Setiawan', email: 'hendra@hotmail.com', npwp: '02.111.234.5-009.000', deposit: 0, status: 'rejected', submitted: '32d ago', kemenkeu: false, kyc: 'rejected' },
  ];
  // Merge API KYC submissions on top of the static demo set.
  const apiAsBidder = apiKyc.map(k => ({
    id: `KYC-${k.id}`,
    apiId: k.id,
    name: k.userName || `User #${k.userId}`,
    email: k.userEmail || '—',
    npwp: '—',
    deposit: 0,
    status: k.status,
    submitted: new Date(k.submittedAt).toLocaleString('id-ID'),
    kemenkeu: false,
    kyc: k.status === 'approved' ? 'verified' : k.status === 'rejected' ? 'rejected' : 'review',
  }));

  const bidders = [...apiAsBidder, ...baseBidders];
  const cur = bidders[selected] || bidders[0];

  const approve = async () => {
    if (!cur?.apiId) { actions.showToast('info', 'Demo bidder — tidak ada record di backend'); return; }
    try {
      await adminApi.kycApprove(cur.apiId);
      actions.showToast('success', `KYC #${cur.apiId} disetujui`);
      const r = await adminApi.kycAll(); setApiKyc(r.data);
    } catch (e) { actions.showToast('error', e.message); }
  };
  const reject = async () => {
    if (!cur?.apiId) { actions.showToast('info', 'Demo bidder — tidak ada record di backend'); return; }
    try {
      await adminApi.kycReject(cur.apiId);
      actions.showToast('info', `KYC #${cur.apiId} ditolak`);
      const r = await adminApi.kycAll(); setApiKyc(r.data);
    } catch (e) { actions.showToast('error', e.message); }
  };

  return (
    <AdmShell
      active="bidders" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.section.review'), t('adm.bid.title')]}
      title={t('adm.bid.title')}
      sub={t('adm.bid.sub')}
      headActions={
        <>
          <button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> {t('adm.btn.export')}</button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18, alignItems: 'flex-start' }}>
        {/* List */}
        <div className="adm-card" style={{ overflow: 'hidden' }}>
          <div className="adm-card-head">
            <h3 className="adm-card-title">{t('adm.bid.queue')}</h3>
            <span className="adm-card-subtitle">23 PENDING</span>
          </div>
          <div>
            {bidders.map((b, i) => (
              <div key={b.id} onClick={() => setSelected(i)} style={{
                padding: '14px 22px', borderBottom: i < bidders.length - 1 ? '1px solid var(--line)' : 'none',
                cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                background: selected === i ? 'var(--paper-2)' : '#fff',
                borderLeft: selected === i ? '3px solid var(--ink)' : '3px solid transparent',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--paper-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>
                  {b.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{b.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{b.id} · {b.submitted}</div>
                </div>
                <span className={`adm-pill ${b.kyc === 'verified' ? 'verified' : b.kyc === 'review' ? 'pending' : 'rejected'}`}>
                  {b.kyc === 'verified' && '✓'}
                  {b.kyc === 'review' && '⊙'}
                  {b.kyc === 'rejected' && '✕'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="adm-card" style={{ overflow: 'hidden' }}>
          <div className="adm-card-head" style={{ padding: '20px 24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: 0, color: 'var(--ink)' }}>{cur.name}</h3>
                <span className={`adm-pill ${cur.kyc === 'verified' ? 'verified' : cur.kyc === 'review' ? 'pending' : 'rejected'}`}>
                  {cur.kyc === 'verified' && '✓ Verified'}
                  {cur.kyc === 'review' && '⊙ Under review'}
                  {cur.kyc === 'rejected' && '✕ Rejected'}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{cur.id} · {cur.email} · {t('adm.bid.submitted', cur.submitted)}</div>
            </div>
            {cur.kyc === 'review' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="adm-topbar-btn" style={{ color: 'var(--red)' }} onClick={reject}><AdmIcon name="x" size={13} /> {t('adm.btn.reject')}</button>
                <button className="adm-topbar-btn primary" onClick={approve}><AdmIcon name="check" size={13} /> {t('adm.btn.approve')}</button>
              </div>
            )}
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Verification grid */}
            <div className="adm-eyebrow as-eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>{t('adm.bid.verifs')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { l: 'e-KTP (Dukcapil)', m: 'NIK 3174041201920003 · Verified', s: cur.kyc === 'verified' || cur.kyc === 'review' },
                { l: 'NPWP', m: cur.npwp, s: cur.kyc === 'verified' || cur.kyc === 'review' },
                { l: 'Liveness selfie', m: 'Match score 98.4%', s: cur.kyc === 'verified' || cur.kyc === 'review' },
                { l: 'Bank account', m: 'Bank Mandiri · 073-00-9988421-1', s: cur.kyc === 'verified' },
                { l: 'KEMENKEU·DJKN', m: cur.kemenkeu ? 'Whitelisted' : 'Standard verification', s: cur.kemenkeu },
                { l: 'PEP screening', m: 'No matches found', s: cur.kyc === 'verified' || cur.kyc === 'review' },
              ].map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--line)', background: v.s ? '#fff' : 'var(--paper-2)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: v.s ? 'rgba(45,106,79,0.1)' : 'var(--paper-2)', color: v.s ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v.s ? <AdmIcon name="check" size={14} stroke={3} /> : <AdmIcon name="x" size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v.l}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{v.m}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="adm-eyebrow as-eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>{t('adm.bid.docs')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { n: 'e-KTP front.jpg', s: '2.4 MB' },
                { n: 'e-KTP back.jpg', s: '1.9 MB' },
                { n: 'Selfie verification', s: '780 KB' },
                { n: 'NPWP card.pdf', s: '410 KB' },
                { n: 'Bank statement.pdf', s: '1.2 MB' },
                { n: 'KK Family Card.pdf', s: '890 KB' },
              ].map((d, i) => (
                <div key={i} style={{ padding: 10, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 32, background: 'var(--paper-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdmIcon name="doc" size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{d.s}</div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-2)' }}><AdmIcon name="eye" size={13} /></button>
                </div>
              ))}
            </div>

            {/* Escrow */}
            <div className="adm-eyebrow as-eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>{t('adm.bid.escrow')}</div>
            <div style={{ background: 'var(--paper-2)', padding: 16, border: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>DEPOSIT HELD</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginTop: 4 }}>{fmtIDRShort(cur.deposit || 875_000_000)}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>BANK</div>
                <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 4, fontWeight: 500 }}>Bank Mandiri (Trust)</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>073-00-9988421-1</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>STATUS</div>
                <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 4, fontWeight: 500 }}>● {t('adm.bid.escrowOk')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmShell>
  );
};

/* ─────────── Auctions monitor ─────────── */

const AdmAuctions = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  return (
    <AdmShell
      active="auctions" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.auctions')]}
      title={t('adm.auct.title')}
      sub={t('adm.auct.sub')}
      headActions={<button className="adm-topbar-btn"><AdmIcon name="export" size={13} /> {t('adm.btn.export')}</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.auct.k.now')}</div>
          <div className="adm-kpi-val">6</div>
          <div className="adm-kpi-delta up">▲ 142 bids in last hour</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.auct.k.gmv')}</div>
          <div className="adm-kpi-val">Rp 68.4<small>B</small></div>
          <div className="adm-kpi-delta up">▲ Reserve met on 5/6</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">{t('adm.auct.k.snipes')}</div>
          <div className="adm-kpi-val">3</div>
          <div className="adm-kpi-delta" style={{ color: 'var(--gold)' }}>● Auto-extended</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {[
          { id: 'AST·2026·0823', title: 'Productive Land Plot', loc: 'Subang, West Java', current: 2_450_000_000, bidders: 8, bids: 17, closing: 4 * 60 + 22, status: 'closing-soon' },
          { id: 'AST·2026·0772', title: 'Mountain Retreat', loc: 'Lembang, Bandung', current: 6_100_000_000, bidders: 11, bids: 24, closing: 12 * 60 + 8, status: 'live' },
          { id: 'AST·2026·0847', title: 'Beachfront Villa Estate', loc: 'Canggu, Bali', current: 8_750_000_000, bidders: 14, bids: 32, closing: 26 * 60 + 13, status: 'live' },
          { id: 'AST·2026·0768', title: 'Rice Field Holdings', loc: 'Tegallalang, Bali', current: 4_750_000_000, bidders: 9, bids: 19, closing: 73 * 60, status: 'live' },
        ].map(a => (
          <div key={a.id} className="adm-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>{a.id}</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, margin: '2px 0 0', fontWeight: 500 }}>{a.title}</h3>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.loc}</div>
              </div>
              <span className={`adm-pill ${a.status === 'closing-soon' ? 'live' : 'live'}`}>{a.status === 'closing-soon' ? '● CLOSING' : '● LIVE'}</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>CURRENT</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--ink)', fontWeight: 600, marginTop: 4 }}>{fmtIDRShort(a.current)}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>BIDDERS</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginTop: 4 }}>{a.bidders}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>BIDS</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginTop: 4 }}>{a.bids}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--muted)' }}>CLOSES IN</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: a.closing < 60 * 5 ? 'var(--red)' : 'var(--ink)', fontWeight: 600, marginTop: 4 }}>
                  {Math.floor(a.closing / 60)}h {a.closing % 60}m
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdmShell>
  );
};

export { AdmBulkUpload, AdmBidders, AdmAuctions };
