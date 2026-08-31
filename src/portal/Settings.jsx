/* Halaman Pengaturan Akun — foto, nama, email, telepon, sandi.
   Semua perubahan (kecuali foto) butuh OTP: email untuk nama/email/sandi,
   WhatsApp untuk telepon. User belum terverifikasi: bisa buka, tidak bisa edit. */
import React from 'react';
import { PIcon, PortalNav, PortalFooter } from './shared';
import { api } from '../api/client';
import { useUser, useActions } from '../store';
import { useIsMobile } from '../lib/useIsMobile';
import { resizeToAvatarDataUrl } from '../lib/image';
import { Spinner } from './Loading';

const FIELD_META = {
  name:     { icon: 'edit',  channel: 'email' },
  email:    { icon: 'bell',  channel: 'email' },
  phone:    { icon: 'phone', channel: 'whatsapp' },
  password: { icon: 'lock',  channel: 'email' },
};

/* Modal alur ubah 1 field: input → kirim kode → masukkan OTP → konfirmasi. */
const EditModal = ({ field, lang, user, onClose, onDone }) => {
  const id = lang === 'id';
  const L = (en, idt) => (id ? idt : en);
  const [step, setStep] = React.useState('input');   // input | otp
  const [value, setValue] = React.useState('');
  const [curPw, setCurPw] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [demo, setDemo] = React.useState('');
  const [channel, setChannel] = React.useState(FIELD_META[field].channel);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [okMsg, setOkMsg] = React.useState('');

  const title = {
    name: L('Change name', 'Ubah nama'), email: L('Change email', 'Ubah email'),
    phone: L('Change phone', 'Ubah nomor telepon'), password: L('Change password', 'Ubah kata sandi'),
  }[field];

  const requestCode = async () => {
    setErr('');
    if (field === 'password') {
      if (!curPw) return setErr(L('Enter your current password', 'Isi kata sandi lama'));
      if (value.length < 6) return setErr(L('New password min 6 chars', 'Sandi baru minimal 6 karakter'));
    } else if (!value.trim()) {
      return setErr(L('Please fill the new value', 'Isi nilai baru dulu'));
    }
    setBusy(true);
    try {
      const r = await api.post('/api/account/change/request', { field, value: value.trim(), currentPassword: curPw || undefined });
      setChannel(r.data.channel);
      if (r.data.demo?.otp) { setDemo(r.data.demo.otp); setOtp(r.data.demo.otp); }
      setStep('otp');
    } catch (e) { setErr(e?.message || L('Failed to send code', 'Gagal mengirim kode')); }
    finally { setBusy(false); }
  };

  const confirm = async () => {
    setErr('');
    if (otp.trim().length !== 6) return setErr(L('Enter the 6-digit code', 'Masukkan kode 6 digit'));
    setBusy(true);
    try {
      const r = await api.post('/api/account/change/confirm', { otp: otp.trim() });
      if (r.emailChanged) {
        setOkMsg(L('Email updated — check your new inbox to verify it.', 'Email diperbarui — cek kotak masuk email baru untuk verifikasi.'));
        setStep('done');
      } else {
        onDone(r.data);
      }
    } catch (e) { setErr(e?.message || L('Wrong or expired code', 'Kode salah atau kedaluwarsa')); }
    finally { setBusy(false); }
  };

  const chLabel = channel === 'whatsapp'
    ? L('WhatsApp', 'WhatsApp')
    : L('email', 'email');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,22,64,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, boxShadow: '0 24px 60px rgba(10,22,64,0.28)', padding: '26px 24px 22px', fontFamily: 'var(--sans)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(59,196,217,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}><PIcon name={FIELD_META[field].icon} size={18} /></div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--ink)' }}>{title}</div>
        </div>

        {step === 'input' && (
          <>
            {field === 'password' ? (
              <>
                <label style={lbl}>{L('Current password', 'Kata sandi lama')}</label>
                <input type="password" style={inp} value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="••••••" />
                <label style={lbl}>{L('New password', 'Kata sandi baru')}</label>
                <input type="password" style={inp} value={value} onChange={e => setValue(e.target.value)} placeholder={L('Min 6 characters', 'Min 6 karakter')} />
              </>
            ) : (
              <>
                <label style={lbl}>{field === 'name' ? L('New name', 'Nama baru') : field === 'email' ? L('New email', 'Email baru') : L('New phone (WhatsApp)', 'Nomor baru (WhatsApp)')}</label>
                <input style={inp} value={value} onChange={e => setValue(e.target.value)}
                  placeholder={field === 'phone' ? '0812xxxxxxx' : field === 'email' ? 'nama@email.com' : ''}
                  inputMode={field === 'phone' ? 'tel' : 'text'} />
              </>
            )}
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: '4px 0 16px' }}>
              {field === 'phone'
                ? L('A verification code will be sent to the new number via WhatsApp.', 'Kode verifikasi akan dikirim ke nomor baru via WhatsApp.')
                : field === 'email'
                ? L('A code will be sent to your current email to confirm. The new email must then be verified.', 'Kode dikirim ke email lama untuk konfirmasi. Email baru wajib diverifikasi ulang.')
                : L('A verification code will be sent to your email.', 'Kode verifikasi akan dikirim ke email Anda.')}
            </p>
            {err && <div style={errS}>{err}</div>}
            <div style={rowEnd}>
              <button className="p-btn p-btn-ghost p-btn-sm" onClick={onClose}>{L('Cancel', 'Batal')}</button>
              <button className="p-btn p-btn-cyan p-btn-sm" disabled={busy} onClick={requestCode}>{busy ? <Spinner size={14} color="#fff" /> : <PIcon name="arrowR" size={14} />} {L('Send code', 'Kirim kode')}</button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 14px' }}>
              {L(`Enter the 6-digit code sent via ${chLabel}.`, `Masukkan kode 6 digit yang dikirim via ${chLabel}.`)}
            </p>
            {demo && <div style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.35)', color: '#8a6d0b', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>{L('Demo mode — your code:', 'Mode demo — kode Anda:')} <b style={{ fontFamily: 'var(--mono)' }}>{demo}</b></div>}
            <input style={{ ...inp, fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 8, textAlign: 'center' }} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" maxLength={6} />
            {err && <div style={errS}>{err}</div>}
            <div style={rowEnd}>
              <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setStep('input')}>{L('Back', 'Kembali')}</button>
              <button className="p-btn p-btn-cyan p-btn-sm" disabled={busy} onClick={confirm}>{busy ? <Spinner size={14} color="#fff" /> : <PIcon name="check" size={14} />} {L('Confirm', 'Konfirmasi')}</button>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', margin: '0 auto 12px', background: 'rgba(45,138,111,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green, #2D8A6F)' }}><PIcon name="check" size={26} /></div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{okMsg}</div>
            </div>
            <div style={rowEnd}><button className="p-btn p-btn-cyan p-btn-sm" onClick={() => onDone(null)}>{L('Done', 'Selesai')}</button></div>
          </>
        )}
      </div>
    </div>
  );
};

const lbl = { display: 'block', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 6px' };
const inp = { width: '100%', height: 44, border: '1px solid var(--line)', borderRadius: 10, padding: '0 13px', fontSize: 14, fontFamily: 'var(--sans)', color: 'var(--ink)', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 14 };
const errS = { fontSize: 12.5, color: 'var(--red, #c0392b)', marginBottom: 12 };
const rowEnd = { display: 'flex', gap: 10, justifyContent: 'flex-end' };

const PortalSettings = ({ lang, onLang, onNav }) => {
  const id = lang === 'id';
  const L = (en, idt) => (id ? idt : en);
  const user = useUser();
  const actions = useActions();
  const isMobile = useIsMobile();
  const [edit, setEdit] = React.useState(null);   // field yang sedang diubah
  const [photoBusy, setPhotoBusy] = React.useState(false);
  const [flash, setFlash] = React.useState('');
  const fileRef = React.useRef(null);

  /* Tamu → tidak boleh di sini. */
  React.useEffect(() => { if (user === null) { /* store belum siap atau tamu */ } }, [user]);
  if (!user) {
    return (
      <div className="pscreen">
        <PortalNav active="" lang={lang} onLang={onLang} onNav={onNav} />
        <div className="pwrap" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 10 }}>{L('Please sign in', 'Silakan masuk dulu')}</div>
          <button className="p-btn p-btn-cyan" onClick={() => onNav && onNav('signin')}>{L('Sign in / Register', 'Masuk / Daftar')}</button>
        </div>
        <PortalFooter />
      </div>
    );
  }

  const verified = !!user.emailVerified;
  const initials = (user.name || user.email || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || !verified) return;
    if (file.size > 5 * 1024 * 1024) { setFlash(L('Photo larger than 5 MB', 'Foto lebih dari 5 MB')); return; }
    setPhotoBusy(true); setFlash('');
    try {
      const dataUrl = await resizeToAvatarDataUrl(file, 320);
      const r = await api.post('/api/account/photo', { photo: dataUrl });
      actions.setUser(r.data);
      setFlash(L('Profile photo updated.', 'Foto profil diperbarui.'));
    } catch (ex) { setFlash(ex?.message || L('Failed to upload', 'Gagal mengunggah')); }
    finally { setPhotoBusy(false); }
  };

  const rows = [
    { field: 'name', label: L('Full name', 'Nama lengkap'), value: user.name || '—' },
    { field: 'email', label: 'Email', value: user.email },
    { field: 'phone', label: L('Phone (WhatsApp)', 'Telepon (WhatsApp)'), value: user.phone || L('Not set', 'Belum diisi') },
    { field: 'password', label: L('Password', 'Kata sandi'), value: '••••••••' },
  ];

  return (
    <div className="pscreen">
      <PortalNav active="" lang={lang} onLang={onLang} onNav={onNav} />
      <div className="pwrap" style={{ maxWidth: 720, padding: isMobile ? '24px 16px 48px' : '40px 32px 64px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: isMobile ? 26 : 32, margin: '0 0 6px' }}>{L('Account settings', 'Pengaturan akun')}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>{L('Manage your profile, contact details and password.', 'Kelola profil, kontak, dan kata sandi Anda.')}</p>

        {!verified && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.4)', color: '#8a6d0b', borderRadius: 12, padding: '13px 16px', marginBottom: 22 }}>
            <PIcon name="lock" size={17} />
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{L('Your email is not verified yet. You can view your settings, but editing is disabled until you verify your email (check your inbox).', 'Email Anda belum diverifikasi. Anda bisa melihat pengaturan, tetapi belum bisa mengubah data sampai email diverifikasi (cek kotak masuk).')}</div>
          </div>
        )}

        {/* Foto profil */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 22, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 18 }}>
          {user.picture
            ? <img src={user.picture} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{initials}</div>}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name || user.email}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>{L('Profile photo — no code needed', 'Foto profil — tanpa kode verifikasi')}</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickPhoto} />
            <button className="p-btn p-btn-ghost p-btn-sm" disabled={!verified || photoBusy} style={(!verified || photoBusy) ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={() => fileRef.current?.click()}>
              {photoBusy ? <Spinner size={14} /> : <PIcon name="cam" size={14} />} {user.picture ? L('Change photo', 'Ganti foto') : L('Upload photo', 'Unggah foto')}
            </button>
          </div>
        </div>
        {flash && <div style={{ fontSize: 13, color: 'var(--teal)', margin: '-8px 2px 16px' }}>{flash}</div>}

        {/* Field lain */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div key={r.field} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '14px 16px' : '16px 20px', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</div>
              </div>
              <button className="p-btn p-btn-ghost p-btn-sm" disabled={!verified} style={!verified ? { opacity: 0.5, cursor: 'default' } : undefined} onClick={() => setEdit(r.field)}>
                <PIcon name="edit" size={13} /> {L('Change', 'Ubah')}
              </button>
            </div>
          ))}
        </div>
      </div>
      <PortalFooter />

      {edit && (
        <EditModal
          field={edit} lang={lang} user={user}
          onClose={() => setEdit(null)}
          onDone={async (updated) => {
            setEdit(null);
            if (updated) actions.setUser(updated); else await actions.refreshUser();
            setFlash(L('Changes saved.', 'Perubahan tersimpan.'));
          }}
        />
      )}
    </div>
  );
};

export default PortalSettings;
