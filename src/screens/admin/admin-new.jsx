/* Admin · New Listing form (single-submit, multi-section) */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { AdmShell, AdmIcon } from './admin-shell';
import { Photo2 } from '../../shared-v2';
import { useActions } from '../../store';
import { listingsApi } from '../../api/listings';
import FileDropzone from '../../components/FileDropzone';
import { formatBytes, isImageFile } from '../../lib/files';

const FieldRow = ({ children, cols = 2 }) => (
  <div className={`adm-form-row cols-${cols}`}>{children}</div>
);

const Field = ({ label, required, help, children }) => (
  <div className="adm-field">
    <label className="adm-field-label">{label}{required ? <span className="req">*</span> : null}</label>
    {children}
    {help ? <div className="adm-field-help">{help}</div> : null}
  </div>
);

const RadioCard = ({ selected, onClick, title, desc }) => (
  <div className={`adm-radio-card ${selected ? 'selected' : ''}`} onClick={onClick}>
    <div className="rdot" />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
      {desc ? <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{desc}</div> : null}
    </div>
  </div>
);

const ChkChip = ({ selected, onClick, children }) => (
  <button type="button" className={`adm-checkbox ${selected ? 'selected' : ''}`} onClick={onClick}>
    <span className="adm-chkbox">{selected ? <AdmIcon name="check" size={10} stroke={3} /> : null}</span>
    {children}
  </button>
);

const SectionHead = ({ num, name, sub }) => (
  <div>
    <div className="adm-section-num">{num}</div>
    <div className="adm-section-head">
      <h2 className="adm-section-name">{name}</h2>
      <span className="adm-section-sub">{sub}</span>
    </div>
  </div>
);

const readPreview = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

const AdmNewListing = ({ lang, onLang, onChange }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const actions = useActions();
  const [type, setType] = React.useState('residential');
  const [cert, setCert] = React.useState('shm');
  const [verifs, setVerifs] = React.useState(['BPN', 'KEMENKEU']);
  const [title, setTitle] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [region, setRegion] = React.useState('Bali');
  const [startingBid, setStartingBid] = React.useState(0);
  const [buyNow, setBuyNow] = React.useState(0);
  const [deposit, setDeposit] = React.useState(0);
  const [uploadedPhotos, setUploadedPhotos] = React.useState([]); // [{ file, name, dataUrl, size, type }]
  const [coverIndex, setCoverIndex] = React.useState(0);
  const [documents, setDocuments] = React.useState({});           // { shm: { file, name, size }, ... }
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const toggleV = (v) => setVerifs(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const addPhotos = async (files) => {
    const images = files.filter(isImageFile);
    const previews = await Promise.all(
      images.map(async (f) => ({ file: f, name: f.name, size: f.size, type: f.type, dataUrl: await readPreview(f) }))
    );
    setUploadedPhotos(prev => [...prev, ...previews]);
  };

  const removePhoto = (i) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i));
    if (coverIndex === i) setCoverIndex(0);
    else if (coverIndex > i) setCoverIndex(coverIndex - 1);
  };

  const movePhoto = (from, to) => {
    setUploadedPhotos(prev => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
    if (coverIndex === from) setCoverIndex(to);
  };

  const setDocSlot = (slot, file) => {
    if (!file) return;
    setDocuments(prev => ({ ...prev, [slot]: { file, name: file.name, size: file.size, type: file.type } }));
  };

  const removeDoc = (slot) => {
    setDocuments(prev => { const { [slot]: _, ...rest } = prev; return rest; });
  };

  const typeMap = { residential: 'property', commercial: 'commercial', land: 'land', industrial: 'commercial' };
  const typeLabelMap = { residential: 'Residential', commercial: 'Commercial', land: 'Agricultural Land', industrial: 'Industrial' };

  const submitListing = async (status) => {
    if (submitting) return;
    setSubmitting(true); setError('');
    try {
      // 1) Create listing
      const { data: created } = await listingsApi.create({
        title: title || (status === 'draft' ? 'Untitled Draft' : 'Untitled Listing'),
        type: typeMap[type],
        typeLabel: typeLabelMap[type],
        address, region,
        startingBid: Number(startingBid) || 0,
        buyNow: Number(buyNow) || 0,
        deposit: Number(deposit) || 0,
        verifications: verifs,
        status,
      });

      // 2) Upload photos (cover goes first)
      if (uploadedPhotos.length > 0) {
        const ordered = [...uploadedPhotos];
        if (coverIndex > 0) {
          const [cover] = ordered.splice(coverIndex, 1);
          ordered.unshift(cover);
        }
        await listingsApi.uploadPhotos(created.id, ordered.map(p => p.file));
      }

      // 3) Upload documents (one per slot)
      for (const [slot, doc] of Object.entries(documents)) {
        if (doc?.file) await listingsApi.uploadDocument(created.id, slot, doc.file);
      }

      actions.showToast('success', `Aset ${created.id} berhasil dipublikasikan`);
      navigate('/admin/listings');
    } catch (e) {
      setError(e.message || 'Gagal membuat listing');
    } finally {
      setSubmitting(false);
    }
  };

  const publish = () => submitListing('live');
  const saveDraft = () => submitListing('draft');

  return (
    <AdmShell
      active="new" onChange={onChange} lang={lang} onLang={onLang}
      crumb={[t('adm.brand'), t('adm.nav.listings'), t('adm.new.title')]}
      title={t('adm.new.title')}
      sub={t('adm.new.sub')}
      headActions={
        <>
          <button className="adm-topbar-btn" onClick={() => navigate('/admin/listings')}>{t('adm.btn.cancel')}</button>
          <button className="adm-topbar-btn" disabled={submitting} onClick={saveDraft}>{t('adm.btn.save')}</button>
          <button className="adm-topbar-btn primary" disabled={submitting} onClick={publish}><AdmIcon name="check" size={13} /> {submitting ? '…' : t('adm.btn.publish')}</button>
          {error && <span style={{ color: 'var(--red)', fontSize: 11, fontFamily: 'var(--mono)', marginLeft: 8 }}>{error}</span>}
        </>
      }
    >
      {/* Stepper */}
      <div className="adm-stepper">
        {[
          { n: 1, name: t('adm.step.basics'), m: 'COMPLETE', state: 'done' },
          { n: 2, name: t('adm.step.legal'), m: 'COMPLETE', state: 'done' },
          { n: 3, name: t('adm.step.bidding'), m: 'IN PROGRESS', state: 'active' },
          { n: 4, name: t('adm.step.media'), m: 'PENDING', state: '' },
          { n: 5, name: t('adm.step.review'), m: 'PENDING', state: '' },
        ].map(s => (
          <div key={s.n} className={`adm-step ${s.state}`}>
            <div className="adm-step-num">{s.state === 'done' ? <AdmIcon name="check" size={12} stroke={3} /> : s.n}</div>
            <div className="adm-step-label">
              <div className="adm-step-name">{s.name}</div>
              <div className="adm-step-meta">{s.m}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Section 1 — Basics */}
      <div className="adm-section">
        <SectionHead num="01" name={t('adm.sec.basics')} sub="REQUIRED" />
        <div className="adm-form-grid">
          <FieldRow cols={3}>
            <Field label={t('adm.f.assetId')} help={t('adm.f.assetIdHelp')}>
              <input className="adm-input num" value="AST·2026·0860" readOnly />
            </Field>
            <Field label={t('adm.f.kemenkeu')} required>
              <input className="adm-input num" placeholder="DJKN/2024/0817" />
            </Field>
            <Field label={t('adm.f.startTime')} required>
              <input className="adm-input num" placeholder="2026-04-26 14:30" />
            </Field>
          </FieldRow>

          <Field label={t('adm.f.title')} required>
            <input className="adm-input" placeholder={t('adm.f.titlePh')} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <FieldRow cols={2}>
            <Field label={t('adm.f.assetType')} required>
              <div className="adm-radio-group">
                <RadioCard selected={type === 'residential'} onClick={() => setType('residential')} title={t('adm.type.residential')} desc={t('adm.type.residentialSub')} />
                <RadioCard selected={type === 'commercial'} onClick={() => setType('commercial')} title={t('adm.type.commercial')} desc={t('adm.type.commercialSub')} />
                <RadioCard selected={type === 'land'} onClick={() => setType('land')} title={t('adm.type.land')} desc={t('adm.type.landSub')} />
                <RadioCard selected={type === 'industrial'} onClick={() => setType('industrial')} title={t('adm.type.industrial')} desc={t('adm.type.industrialSub')} />
              </div>
            </Field>
            <Field label={t('adm.f.description')} required help={t('adm.f.descHelp')}>
              <textarea className="adm-textarea" rows="11" placeholder={t('adm.f.descPh')} defaultValue={lang === 'id' ? 'Properti tepi pantai langka di pesisir barat Bali, dengan akses pasir langsung. Vila utama lima kamar, dua paviliun staf, dan paviliun terbuka.' : ''} />
            </Field>
          </FieldRow>

          <FieldRow cols={3}>
            <Field label={t('adm.f.region')} required>
              <select className="adm-select"><option>Bali</option><option>Jakarta</option><option>West Java</option><option>Banten</option><option>Lombok</option><option>Yogyakarta</option><option>North Sumatra</option></select>
            </Field>
            <Field label={t('adm.f.city')} required>
              <input className="adm-input" placeholder="Kota / Kabupaten" />
            </Field>
            <Field label={t('adm.f.postal')}>
              <input className="adm-input num" placeholder="80361" />
            </Field>
          </FieldRow>

          <Field label={t('adm.f.address')} required>
            <input className="adm-input" placeholder="Jl. Pantai Batu Bolong 12" value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>

          <FieldRow cols={4}>
            <Field label={t('adm.f.landArea')} required>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="850" />
                <span className="adm-input-prefix">m²</span>
              </div>
            </Field>
            <Field label={t('adm.f.buildingArea')}>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="620" />
                <span className="adm-input-prefix">m²</span>
              </div>
            </Field>
            <Field label={t('adm.f.bedrooms')}>
              <input className="adm-input num" placeholder="5" />
            </Field>
            <Field label={t('adm.f.bathrooms')}>
              <input className="adm-input num" placeholder="6" />
            </Field>
          </FieldRow>
        </div>
      </div>

      {/* Section 2 — Legal */}
      <div className="adm-section">
        <SectionHead num="02" name={t('adm.sec.legal')} sub="REQUIRED" />
        <div className="adm-form-grid">
          <FieldRow cols={3}>
            <Field label={t('adm.f.cert')} required>
              <div className="adm-radio-group">
                <RadioCard selected={cert === 'shm'} onClick={() => setCert('shm')} title="SHM" desc={t('adm.cert.shm')} />
                <RadioCard selected={cert === 'hgb'} onClick={() => setCert('hgb')} title="HGB" desc={t('adm.cert.hgb')} />
                <RadioCard selected={cert === 'shgb'} onClick={() => setCert('shgb')} title="SHGB" desc={t('adm.cert.shgb')} />
                <RadioCard selected={cert === 'hgu'} onClick={() => setCert('hgu')} title="HGU" desc={t('adm.cert.hgu')} />
              </div>
            </Field>
            <Field label={t('adm.f.bpnNum')} required help="BPN registration number">
              <input className="adm-input num" placeholder="12.04.07.18.001847" />
            </Field>
            <Field label={t('adm.f.imbNum')} help={t('adm.f.imbHelp')}>
              <input className="adm-input num" placeholder="640/IMB/2018" />
            </Field>
          </FieldRow>

          <FieldRow cols={3}>
            <Field label={t('adm.f.njop')} required>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="6,200,000,000" />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
            <Field label={t('adm.f.notary')} required>
              <input className="adm-input" placeholder="H. Surya, S.H., M.Kn." />
            </Field>
            <Field label={t('adm.f.notaryReg')}>
              <input className="adm-input num" placeholder="AHU-9173.AH.02.01.2019" />
            </Field>
          </FieldRow>

          <FieldRow cols={2}>
            <Field label={t('adm.f.encumbrance')} required>
              <select className="adm-select"><option>{t('adm.opt.none')}</option><option>{t('adm.opt.mortgage')}</option><option>{t('adm.opt.lien')}</option></select>
            </Field>
            <Field label={t('adm.f.liens')} required>
              <select className="adm-select"><option>{t('adm.opt.clear')}</option><option>{t('adm.opt.pending')}</option></select>
            </Field>
          </FieldRow>

          <Field label={t('adm.f.verifications')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['BPN', 'KEMENKEU·DJKN', 'IMB', 'PBB Clear', 'AJB', 'NPWP Tax Clear'].map(v => (
                <ChkChip key={v} selected={verifs.includes(v)} onClick={() => toggleV(v)}>{v}</ChkChip>
              ))}
            </div>
          </Field>
        </div>
      </div>

      {/* Section 3 — Bidding */}
      <div className="adm-section">
        <SectionHead num="03" name={t('adm.sec.bidding')} sub="REQUIRED" />
        <div className="adm-form-grid">
          <FieldRow cols={4}>
            <Field label={t('adm.f.startingBid')} required>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="7,500,000,000" value={startingBid || ''} onChange={(e) => setStartingBid(parseInt(e.target.value.replace(/\D/g, '')) || 0)} />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
            <Field label={t('adm.f.reserve')} required>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="8,500,000,000" />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
            <Field label={t('adm.f.buyNow')}>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="12,000,000,000" value={buyNow || ''} onChange={(e) => setBuyNow(parseInt(e.target.value.replace(/\D/g, '')) || 0)} />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
            <Field label={t('adm.f.increment')} required>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="50,000,000" />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
          </FieldRow>

          <FieldRow cols={3}>
            <Field label={t('adm.f.deposit')} required help={t('adm.f.depositHelp')}>
              <div className="adm-input-wrap">
                <input className="adm-input num with-prefix" placeholder="875,000,000" value={deposit || ''} onChange={(e) => setDeposit(parseInt(e.target.value.replace(/\D/g, '')) || 0)} />
                <span className="adm-input-prefix">Rp</span>
              </div>
            </Field>
            <Field label={t('adm.f.depositPct')}>
              <div className="adm-input-wrap">
                <input className="adm-input num" placeholder="10" defaultValue="10" />
                <span className="adm-input-prefix" style={{ left: 'auto', right: 12 }}>%</span>
              </div>
            </Field>
            <Field label={t('adm.f.fee')}>
              <div className="adm-input-wrap">
                <input className="adm-input num" placeholder="2" defaultValue="2" />
                <span className="adm-input-prefix" style={{ left: 'auto', right: 12 }}>%</span>
              </div>
            </Field>
          </FieldRow>

          <FieldRow cols={3}>
            <Field label={t('adm.f.endTime')} required>
              <input className="adm-input num" placeholder="2026-04-28 14:30 WIB" />
            </Field>
            <Field label={t('adm.f.antiSnipe')}>
              <select className="adm-select"><option>{t('adm.opt.snipe2')}</option><option>{t('adm.opt.snipe5')}</option><option>{t('adm.opt.snipe10')}</option><option>{t('adm.opt.snipeNo')}</option></select>
            </Field>
            <Field label={t('adm.f.format')}>
              <select className="adm-select"><option>{t('adm.opt.formatEng')}</option><option>{t('adm.opt.formatSealed')}</option></select>
            </Field>
          </FieldRow>
        </div>
      </div>

      {/* Section 4 — Seller & escrow */}
      <div className="adm-section">
        <SectionHead num="04" name={t('adm.sec.seller')} sub="REQUIRED" />
        <div className="adm-form-grid">
          <FieldRow cols={2}>
            <Field label={t('adm.f.seller')} required>
              <input className="adm-input" placeholder="PT Wijaya Estate" />
            </Field>
            <Field label={t('adm.f.npwp')} required>
              <input className="adm-input num" placeholder="02.345.678.9-012.000" />
            </Field>
          </FieldRow>

          <FieldRow cols={2}>
            <Field label={t('adm.f.bankName')} required>
              <select className="adm-select"><option>Bank Mandiri (Trust)</option><option>BCA Escrow</option><option>BRI Escrow</option><option>BNI Escrow</option></select>
            </Field>
            <Field label={t('adm.f.bankAcc')} required>
              <input className="adm-input num" placeholder="073-00-9988421-1" />
            </Field>
          </FieldRow>
        </div>
      </div>

      {/* Section 5 — Media (real upload) */}
      <div className="adm-section">
        <SectionHead num="05" name={t('adm.sec.media')} sub={t('adm.sec.mediaSub')} />

        {/* Photos */}
        <Field label={`${t('adm.f.coverPhoto')} & ${t('adm.f.gallery')}`} help={`${t('adm.f.galleryHelp')} · JPG/PNG · auto-resize ke 1600px`}>
          <FileDropzone accept="image/*" multiple onFiles={addPhotos} disabled={submitting} height={160}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <AdmIcon name="cloud" size={28} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {submitting ? 'Memproses…' : 'Drag & drop foto, atau klik untuk pilih'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {uploadedPhotos.length > 0
                  ? `${uploadedPhotos.length} foto terunggah · klik foto pertama untuk set sebagai cover`
                  : 'Multi-file · JPG / PNG · maks 10 MB per foto'}
              </div>
            </div>
          </FileDropzone>
          {uploadedPhotos.length > 0 && (
            <div className="adm-thumb-grid" style={{ marginTop: 14 }}>
              {uploadedPhotos.map((p, i) => (
                <div
                  key={i}
                  className="adm-thumb"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(from) && from !== i) movePhoto(from, i);
                  }}
                  onClick={() => setCoverIndex(i)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                  title={`${p.name} · ${formatBytes(p.size)}`}
                >
                  <img src={p.dataUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {coverIndex === i ? <span className="adm-thumb-cover">COVER</span> : null}
                  <span className="adm-thumb-num">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className="adm-thumb-x"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    style={{ cursor: 'pointer' }}
                  >×</span>
                </div>
              ))}
            </div>
          )}
        </Field>

        {/* Documents — labeled per-slot */}
        <div style={{ marginTop: 22 }}>
          <Field label={t('adm.f.docs')} required help="PDF / JPG / PNG · max 25 MB per dokumen. Setiap sertifikat punya slot terpisah.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { slot: 'shm',    name: 'SHM Certificate',     required: true,  accept: '.pdf,image/*' },
                { slot: 'hgb',    name: 'HGB Certificate',     required: false, accept: '.pdf,image/*' },
                { slot: 'imb',    name: 'IMB Building Permit', required: false, accept: '.pdf,image/*' },
                { slot: 'bpn',    name: 'BPN Letter',          required: true,  accept: '.pdf,image/*' },
                { slot: 'ajb',    name: 'AJB Notarized Sale',  required: false, accept: '.pdf,image/*' },
                { slot: 'pbb',    name: 'PBB Tax Clearance',   required: false, accept: '.pdf,image/*' },
                { slot: 'njop',   name: 'NJOP Assessment',     required: false, accept: '.pdf,image/*' },
                { slot: 'notary', name: 'Notary Letter',       required: true,  accept: '.pdf,image/*' },
                { slot: 'npwp',   name: 'Seller NPWP',         required: true,  accept: '.pdf,image/*' },
              ].map(d => {
                const uploaded = documents[d.slot];
                return (
                  <DocSlot
                    key={d.slot}
                    label={d.name}
                    required={d.required}
                    accept={d.accept}
                    file={uploaded}
                    onUpload={(f) => setDocSlot(d.slot, f)}
                    onRemove={() => removeDoc(d.slot)}
                  />
                );
              })}
            </div>
          </Field>
        </div>
      </div>

      {/* Sticky form bar */}
      <div className="adm-form-bar">
        <div className="adm-form-bar-status">
          <div className="adm-form-progress"><div className="adm-form-progress-fill" style={{ width: '78%' }} /></div>
          <span>78% {t('adm.bar.complete')} · {t('adm.bar.required')}</span>
          <span style={{ color: 'var(--green)' }}>● {t('adm.bar.autosaved')}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-topbar-btn">{t('adm.btn.preview')}</button>
          <button className="adm-topbar-btn" disabled={submitting} onClick={saveDraft}>{t('adm.btn.save')}</button>
          <button className="adm-topbar-btn primary" disabled={submitting} onClick={publish}><AdmIcon name="check" size={13} /> {submitting ? 'Memproses…' : t('adm.btn.publish')}</button>
        </div>
      </div>
    </AdmShell>
  );
};

/* Labeled doc slot — drop or click to upload one PDF/image, shows filename when filled. */
const DocSlot = ({ label, required, accept = '.pdf,image/*', file, onUpload, onRemove }) => {
  const inputRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const pick = () => inputRef.current?.click();

  const isFilled = !!file;
  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setHover(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onUpload?.(f);
      }}
      style={{
        border: `1.5px ${isFilled ? 'solid' : 'dashed'} ${hover ? 'var(--teal)' : isFilled ? 'var(--green)' : 'var(--line)'}`,
        background: isFilled ? 'rgba(45,106,79,0.04)' : hover ? 'rgba(59,196,217,0.06)' : 'var(--paper-2)',
        padding: 12,
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: isFilled ? 'default' : 'pointer',
        minHeight: 60,
      }}
      onClick={(e) => { if (!isFilled) pick(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload?.(f); e.target.value = ''; }}
      />
      <div style={{
        width: 36, height: 36,
        background: isFilled ? 'var(--green)' : 'var(--paper-3)',
        color: isFilled ? 'var(--paper)' : 'var(--ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 2, flexShrink: 0,
      }}>
        <AdmIcon name={isFilled ? 'check' : 'doc'} size={16} stroke={isFilled ? 3 : 1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}{required && !isFilled && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isFilled
            ? `${file.name} · ${formatBytes(file.size)}`
            : (required ? 'Wajib · klik atau drop file' : 'Opsional · klik untuk upload')}
        </div>
      </div>
      {isFilled && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          title="Hapus"
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--muted)', cursor: 'pointer',
            fontSize: 18, padding: 4, lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  );
};

export { AdmNewListing, FieldRow, Field, RadioCard, ChkChip, SectionHead };
