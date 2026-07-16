/* Portal Auth — login / register page, Assetra brand. Wired to the real backend. */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '../i18n';
import { Logo2 } from '../shared-v2';
import { PIcon } from './shared';
import { useActions, useUser } from '../store';
import { api, setToken } from '../api/client';
import { signInWithGoogle } from '../sso';

const PortalAuth = ({ lang, onNav }) => {
  const { t } = useT();
  const L = (en, id) => (lang === 'id' ? id : en);
  const actions = useActions();
  const { pathname, search } = useLocation();
  /* Tautan reset dari email: /auth?reset=<token>&email=<email> → langsung ke form kata sandi baru.
     Selain itu: default "Masuk"; hanya /register yang membuka tab "Buat akun". */
  const urlParams = React.useMemo(() => new URLSearchParams(search), [search]);
  const urlResetToken = urlParams.get('reset') || '';
  const urlVerifyToken = urlParams.get('verify') || '';
  const [mode, setMode] = React.useState(
    urlVerifyToken ? 'verifying' : urlResetToken ? 'reset' : (pathname === '/register' ? 'register' : 'login'));

  /* Sudah login tapi membuka /auth (tanpa alur token verify/reset) →
     alihkan ke beranda — KECUALI nomor WA-nya masih menunggu verifikasi. */
  const currentUser = useUser();
  const needsPhoneVerify = (u) => !!u && !!u.phone && !u.phoneVerified;
  React.useEffect(() => {
    if (currentUser && (mode === 'login' || mode === 'register')) {
      if (needsPhoneVerify(currentUser)) {
        setMode('phone');
        sendOtp();
      } else {
        onNav && onNav(currentUser.role === 'admin' ? 'admin' : 'home');
      }
    }
  }, [currentUser, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showPw, setShowPw] = React.useState(false);
  const [role, setRole] = React.useState('buyer'); // buyer | owner
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNum, setPhoneNum] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  /* forgot-password flow: mode 'forgot' (minta token) → 'reset' (password baru) */
  const [info, setInfo] = React.useState('');
  const [resetToken, setResetToken] = React.useState(urlResetToken);
  const [newPw, setNewPw] = React.useState('');
  const [newPw2, setNewPw2] = React.useState('');
  const goMode = (m) => { setMode(m); setError(''); setInfo(''); };

  /* Prefill email dari tautan reset/verifikasi di email. */
  React.useEffect(() => {
    const e = urlParams.get('email');
    if ((urlResetToken || urlVerifyToken) && e) setEmail(e);
  }, [urlResetToken, urlVerifyToken]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Verifikasi email: tautan /auth?verify=<token> diklik dari kotak masuk.
     Sukses → simpan sesi lalu masuk ke situs (reload agar store terhidrasi). */
  const [demoVerifyToken, setDemoVerifyToken] = React.useState('');
  /* Guard useRef: StrictMode (dev) menjalankan efek dua kali — tanpa guard,
     panggilan kedua memakai token yang sudah hangus dan menimpa hasil sukses. */
  const verifyFired = React.useRef(false);
  React.useEffect(() => {
    if (!urlVerifyToken || verifyFired.current) return;
    verifyFired.current = true;
    api.post('/api/auth/verify-email', { token: urlVerifyToken })
      .then(r => {
        setToken(r.token);
        /* Nomor WA belum diverifikasi → lanjut ke halaman OTP (reload /auth
           dengan sesi baru; efek di bawah akan membuka mode 'phone'). */
        const needsPhone = r.user?.phone && !r.user?.phoneVerified;
        window.location.replace(needsPhone ? '/auth' : (r.user?.role === 'admin' ? '/admin' : '/'));
      })
      .catch(e => {
        setMode('login');
        setError(e.message || L('Verification link is invalid or expired', 'Tautan verifikasi tidak valid atau kedaluwarsa'));
      });
  }, [urlVerifyToken]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Email ternyata sudah diverifikasi (mis. tautan diklik di tab lain). */
  const [alreadyVerified, setAlreadyVerified] = React.useState(false);

  /* ── Verifikasi nomor WhatsApp (OTP) ── */
  const isValidIndoPhone = (p) => /^(\+62|62|08)[\d\s\-().]{7,15}$/.test(String(p).trim());
  const [otpCode, setOtpCode] = React.useState('');
  const [otpPhone, setOtpPhone] = React.useState('');   // nomor tujuan (tampilan)
  const [otpDemo, setOtpDemo] = React.useState('');     // kode demo bila penyedia WA belum ada
  const [otpNewPhone, setOtpNewPhone] = React.useState(''); // input nomor utk akun tanpa nomor (SSO)
  const sendOtp = async (customPhone) => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const r = await api.post('/api/auth/phone/send-otp', customPhone ? { phone: customPhone } : {});
      if (r?.alreadyVerified) { window.location.replace('/'); return; }
      setOtpPhone(r.phone || '');
      setOtpDemo(r.demo?.otp || '');
      setInfo(r.demo
        ? L('Demo mode: WhatsApp provider not connected yet — your code is shown below.', 'Mode demo: penyedia WhatsApp belum terhubung — kode Anda tampil di bawah.')
        : L(`Code sent via WhatsApp to ${r.phone}.`, `Kode terkirim via WhatsApp ke ${r.phone}.`));
    } catch (e) {
      setError(e.message || L('Failed to send code', 'Gagal mengirim kode'));
    } finally { setBusy(false); }
  };
  const verifyOtp = async () => {
    if (busy || otpCode.trim().length !== 6) return;
    setBusy(true); setError('');
    try {
      const r = await api.post('/api/auth/phone/verify', { code: otpCode.trim() });
      window.location.replace(r.user?.role === 'admin' ? '/admin' : '/'); // rehidrasi sesi + masuk
    } catch (e) {
      setError(e.message || L('Wrong code', 'Kode salah'));
      setBusy(false);
    }
  };
  const resendVerification = async () => {
    if (busy) return;
    setBusy(true); setError(''); setInfo('');
    try {
      const r = await api.post('/api/auth/send-verification', { email });
      if (r?.alreadyVerified) {
        setAlreadyVerified(true);
        return;
      }
      if (r?.demo?.verifyToken) setDemoVerifyToken(r.demo.verifyToken);
      setInfo(L('Verification email re-sent — check your inbox (and spam folder).', 'Email verifikasi dikirim ulang — cek kotak masuk (dan folder spam).'));
    } catch (e) {
      setError(e.message || L('Something went wrong', 'Terjadi kesalahan'));
    } finally { setBusy(false); }
  };

  const field = { display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 };
  const labelS = { fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 };
  const inputS = { height: 48, border: '1px solid var(--line)', borderRadius: 10, padding: '0 14px', fontSize: 14.5, fontFamily: 'var(--sans)', color: 'var(--ink)', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' };

  const submit = async () => {
    if (busy) return;

    /* Step 1 — minta token reset */
    if (mode === 'forgot') {
      if (!email) { setError(L('Enter your account email first', 'Isi email akun Anda dulu')); return; }
      setBusy(true); setError(''); setInfo('');
      try {
        const r = await api.post('/api/auth/forgot', { email });
        if (r?.demo?.resetToken) {
          setResetToken(r.demo.resetToken);
          setNewPw(''); setNewPw2('');
          setMode('reset');
          setInfo(L(
            'Demo mode: normally this link arrives by email. Set your new password below (token valid 15 minutes).',
            'Mode demo: biasanya tautan ini dikirim via email. Silakan buat kata sandi baru di bawah (token berlaku 15 menit).'));
        } else {
          setInfo(L('If the email is registered, a reset link has been sent.', 'Jika email terdaftar, tautan reset telah dikirim.'));
        }
      } catch (e) {
        setError(e.message || L('Something went wrong', 'Terjadi kesalahan'));
      } finally { setBusy(false); }
      return;
    }

    /* Step 2 — simpan password baru lalu masuk otomatis */
    if (mode === 'reset') {
      if (newPw.length < 6) { setError(L('Password must be at least 6 characters', 'Kata sandi minimal 6 karakter')); return; }
      if (newPw !== newPw2) { setError(L('Passwords do not match', 'Konfirmasi kata sandi tidak sama')); return; }
      setBusy(true); setError('');
      try {
        await api.post('/api/auth/reset', { token: resetToken, password: newPw });
        const user = await actions.login(email, newPw);   // auto-login dengan password baru
        onNav && onNav(user.role === 'admin' ? 'admin' : 'home');
      } catch (e) {
        setError(e.message || L('Something went wrong', 'Terjadi kesalahan'));
      } finally { setBusy(false); }
      return;
    }

    if (!email || !password) { setError(L('Email and password required', 'Email dan kata sandi wajib diisi')); return; }
    setBusy(true); setError('');
    try {
      let user;
      if (mode === 'login') {
        user = await actions.login(email, password);
        /* Gerbang WhatsApp: nomor ada tapi belum diverifikasi → halaman OTP. */
        if (user.phone && !user.phoneVerified) {
          setMode('phone');
          await sendOtp();
          return;
        }
      } else {
        if (!isValidIndoPhone(phoneNum)) {
          setError(L('Enter a valid active WhatsApp number (08xx / +62xx)', 'Isi nomor WhatsApp aktif yang valid (08xx / +62xx)'));
          return;
        }
        const r = await actions.register({ email, password, name: name || email.split('@')[0], accountType: role, phone: phoneNum.trim() });
        if (r?.pendingVerification) {
          /* Gerbang verifikasi: tampilkan halaman "Cek email Anda". */
          setDemoVerifyToken(r.demo?.verifyToken || '');
          setMode('pending');
          setInfo(L('Verification email sent — click the button inside to activate your account.', 'Email verifikasi terkirim — klik tombol di dalamnya untuk mengaktifkan akun.'));
          return;
        }
        user = r;
      }
      if (user.role === 'admin') onNav && onNav('admin');
      else onNav && onNav('home');
    } catch (e) {
      /* Akun belum verifikasi mencoba login → arahkan ke halaman pending. */
      if (e.status === 403 && e.body?.code === 'EMAIL_UNVERIFIED') {
        setMode('pending');
        setError('');
        setInfo(L('This account is not verified yet — check your inbox, or resend the link below.', 'Akun ini belum diverifikasi — cek kotak masuk Anda, atau kirim ulang tautan di bawah.'));
        return;
      }
      setError(e.message || L('Something went wrong', 'Terjadi kesalahan'));
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const profile = await signInWithGoogle();
      if (!profile) return;
      const user = await actions.googleLogin(profile);
      /* Akun SSO tanpa nomor / belum verifikasi → tawarkan verifikasi WA
         (boleh dilewati; SSO tidak mengumpulkan nomor telepon). */
      if (!user.phoneVerified) {
        setMode('phone');
        if (user.phone) await sendOtp();
        return;
      }
      onNav && onNav(user.role === 'admin' ? 'admin' : 'home');
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.05fr', background: '#fff', fontFamily: 'var(--sans)' }}>

      {/* ── Left: brand panel ── */}
      <div style={{ position: 'relative', background: 'radial-gradient(130% 110% at 15% 10%, #17275e 0%, #0A1640 60%)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '44px 52px', overflow: 'hidden' }}>
        {/* decorative grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.14 }} aria-hidden="true">
          <defs><pattern id="authgrid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#3BC4D9" strokeWidth="0.6" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#authgrid)" />
        </svg>
        <div style={{ position: 'absolute', right: -120, bottom: -120, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,196,217,0.22) 0%, transparent 70%)' }} />

        <span style={{ cursor: 'pointer', position: 'relative' }} onClick={() => onNav && onNav('home')}><Logo2 size={32} dark /></span>

        <div style={{ position: 'relative', marginTop: 'auto', paddingBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 16px', maxWidth: 420 }}>
            {L('One account for every property decision.', 'Satu akun untuk setiap keputusan properti.')}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(250,250,247,0.72)', maxWidth: 400, margin: '0 0 32px' }}>
            {L('Save listings, track your KPR application, run AI investment analyses, and manage your ads — all in one place.',
               'Simpan listing, pantau pengajuan KPR, jalankan analisis investasi AI, dan kelola iklan Anda — semua di satu tempat.')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              [L('120,000+ verified listings', '120.000+ listing terverifikasi'), 'home'],
              [L('KPR pre-approval with 12 partner banks', 'Pra-persetujuan KPR dengan 12 bank mitra'), 'bank'],
              [L('AI highest-and-best-use consultant', 'Konsultan AI penggunaan properti terbaik'), 'sparkle'],
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,196,217,0.14)', border: '1px solid rgba(59,196,217,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67D8E8' }}>
                  <PIcon name={r[1]} size={16} />
                </span>
                <span style={{ fontSize: 13.5, color: 'rgba(250,250,247,0.85)' }}>{r[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: 'var(--paper, #F4F6FB)' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* tabs — untuk mode forgot/reset diganti tautan kembali */}
          {(mode === 'login' || mode === 'register') ? (
            <div style={{ display: 'flex', gap: 4, background: '#E9EDF6', borderRadius: 11, padding: 4, marginBottom: 28 }}>
              {[['login', L('Sign in', 'Masuk')], ['register', L('Create account', 'Buat akun')]].map(([id, lbl]) => (
                <button key={id} onClick={() => goMode(id)} style={{
                  flex: 1, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600,
                  background: mode === id ? '#fff' : 'transparent',
                  color: mode === id ? 'var(--ink)' : 'var(--muted)',
                  boxShadow: mode === id ? '0 2px 8px rgba(10,22,64,0.08)' : 'none',
                  transition: 'all .15s',
                }}>{lbl}</button>
              ))}
            </div>
          ) : mode === 'phone' ? (
            <a onClick={() => { actions.logout(); goMode('login'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer', marginBottom: 24 }}>
              ← {L('Sign out', 'Keluar')}
            </a>
          ) : (
            <a onClick={() => goMode('login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'var(--teal)', cursor: 'pointer', marginBottom: 24 }}>
              ← {L('Back to sign in', 'Kembali ke Masuk')}
            </a>
          )}

          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 27, letterSpacing: '-0.01em', margin: '0 0 6px', color: 'var(--ink)' }}>
            {mode === 'login' ? L('Welcome back', 'Selamat datang kembali')
              : mode === 'register' ? L('Join Assetra', 'Bergabung dengan Assetra')
              : mode === 'forgot' ? L('Reset your password', 'Atur ulang kata sandi')
              : mode === 'pending' ? (alreadyVerified ? L('Email already verified ✅', 'Email sudah terverifikasi ✅') : L('Check your email 📬', 'Cek email Anda 📬'))
              : mode === 'verifying' ? L('Verifying your email…', 'Memverifikasi email Anda…')
              : mode === 'phone' ? L('Verify your WhatsApp 📱', 'Verifikasi WhatsApp Anda 📱')
              : L('Create a new password', 'Buat kata sandi baru')}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 26px', lineHeight: 1.55 }}>
            {mode === 'login' ? L('Sign in to continue to your dashboard.', 'Masuk untuk melanjutkan ke dasbor Anda.')
              : mode === 'register' ? L('Free for buyers and renters. Owners get 2 free listings.', 'Gratis untuk pembeli & penyewa. Pemilik mendapat 2 listing gratis.')
              : mode === 'forgot' ? L('Enter your account email and we\'ll send a reset link.', 'Masukkan email akun Anda; kami akan mengirim tautan reset.')
              : mode === 'pending' ? (alreadyVerified
                  ? L(`${email} is verified and your account is active. Sign in to continue.`, `${email} sudah terverifikasi dan akun Anda aktif. Silakan masuk untuk melanjutkan.`)
                  : L(`We sent a verification link to ${email}. Click the button in that email to activate your account and sign in.`, `Kami mengirim tautan verifikasi ke ${email}. Klik tombol di email tersebut untuk mengaktifkan akun dan masuk.`))
              : mode === 'verifying' ? L('One moment — activating your account.', 'Sebentar — sedang mengaktifkan akun Anda.')
              : mode === 'phone' ? ((otpPhone || currentUser?.phone)
                  ? L(`Enter the 6-digit code sent to ${otpPhone || currentUser?.phone}.`, `Masukkan kode 6 digit yang dikirim ke ${otpPhone || currentUser?.phone}.`)
                  : L('Add your active WhatsApp number to secure your account.', 'Tambahkan nomor WhatsApp aktif untuk mengamankan akun Anda.'))
              : L(`Setting a new password for ${email}.`, `Membuat kata sandi baru untuk ${email}.`)}
          </p>

          {mode === 'register' && (
            <>
              {/* role selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...labelS, display: 'block', marginBottom: 8 }}>{L('I am a…', 'Saya adalah…')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { id: 'buyer', ic: 'search', t: L('Buyer / Renter', 'Pembeli / Penyewa'), s: L('Browse, save & enquire on listings', 'Cari, simpan & tanya listing') },
                    { id: 'owner', ic: 'home', t: L('Owner / Agent', 'Pemilik / Agen'), s: L('List & manage properties from a dashboard', 'Pasang & kelola properti lewat dasbor') },
                  ].map(r => (
                    <button key={r.id} onClick={() => setRole(r.id)} style={{
                      textAlign: 'left', padding: '14px 14px 12px', borderRadius: 12, cursor: 'pointer',
                      border: role === r.id ? '2px solid var(--teal)' : '1px solid var(--line)',
                      background: role === r.id ? 'rgba(59,196,217,0.07)' : '#fff',
                      fontFamily: 'var(--sans)', position: 'relative', transition: 'all .15s',
                    }}>
                      {role === r.id && (
                        <span style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9.5 18 20 6.5"></path></svg>
                        </span>
                      )}
                      <span style={{ display: 'flex', width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 9, background: role === r.id ? 'var(--teal)' : 'rgba(10,22,64,0.06)', color: role === r.id ? '#fff' : 'var(--ink-2)' }}>
                        <PIcon name={r.ic} size={16} />
                      </span>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{r.t}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>{r.s}</span>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, margin: '9px 2px 0' }}>
                  {role === 'owner'
                    ? L('You’ll get a dashboard to create listings one by one or bulk-upload, plus ad performance & reports.', 'Anda mendapat dasbor untuk membuat listing satu per satu atau unggah massal, plus performa iklan & laporan.')
                    : L('Browse everything freely — no dashboard needed. You can upgrade to an owner account anytime.', 'Jelajahi semua dengan bebas — tanpa dasbor. Anda bisa upgrade ke akun pemilik kapan saja.')}
                </p>
              </div>
              <div style={field}>
                <label style={labelS}>{L('Full name', 'Nama lengkap')}</label>
                <input style={inputS} placeholder={L('e.g. Sarah Wijaya', 'cth. Sarah Wijaya')} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={field}>
                <label style={labelS}>{L('Active WhatsApp number *', 'Nomor WhatsApp aktif *')}</label>
                <input style={inputS} type="tel" inputMode="tel" placeholder="0812 3456 7890" value={phoneNum} onChange={e => setPhoneNum(e.target.value)} />
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{L('A verification code will be sent to this number.', 'Kode verifikasi akan dikirim ke nomor ini.')}</span>
              </div>
            </>
          )}

          {mode !== 'reset' && mode !== 'pending' && mode !== 'verifying' && mode !== 'phone' && (
            <div style={field}>
              <label style={labelS}>Email</label>
              <input style={inputS} type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => mode === 'forgot' && e.key === 'Enter' && submit()} />
            </div>
          )}

          {/* Halaman tunggu verifikasi email */}
          {mode === 'pending' && (
            <div style={{ textAlign: 'center', padding: '10px 0 6px', marginBottom: 18 }}>
              {alreadyVerified ? (
                <div style={{ width: 74, height: 74, borderRadius: '50%', margin: '0 auto 14px', background: 'rgba(45,138,111,0.12)', border: '1px solid rgba(45,138,111,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✅</div>
              ) : (
                <>
                  <div style={{ width: 74, height: 74, borderRadius: '50%', margin: '0 auto 14px', background: 'rgba(59,196,217,0.12)', border: '1px solid rgba(59,196,217,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✉️</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                    {L('Didn\'t get it? Check your spam folder, or resend below.', 'Belum menerima? Cek folder spam, atau kirim ulang di bawah.')}
                  </div>
                </>
              )}
            </div>
          )}
          {mode === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '18px 0 26px' }}>
              <div style={{ width: 74, height: 74, borderRadius: '50%', margin: '0 auto', border: '3px solid rgba(26,111,168,0.2)', borderTopColor: 'var(--teal)', animation: 'authspin 0.9s linear infinite' }} />
              <style>{`@keyframes authspin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── Verifikasi WhatsApp (OTP) ── */}
          {mode === 'phone' && (
            <div style={{ marginBottom: 6 }}>
              {!(otpPhone || currentUser?.phone) ? (
                /* Akun tanpa nomor (SSO) → minta nomor dulu */
                <>
                  <div style={field}>
                    <label style={labelS}>{L('Active WhatsApp number *', 'Nomor WhatsApp aktif *')}</label>
                    <input style={inputS} type="tel" inputMode="tel" placeholder="0812 3456 7890" value={otpNewPhone} onChange={e => setOtpNewPhone(e.target.value)} />
                  </div>
                  <button className="p-btn p-btn-cyan" disabled={busy || !isValidIndoPhone(otpNewPhone)}
                    style={{ width: '100%', height: 50, fontSize: 15, borderRadius: 10, justifyContent: 'center', opacity: busy || !isValidIndoPhone(otpNewPhone) ? 0.55 : 1 }}
                    onClick={() => sendOtp(otpNewPhone.trim())}>
                    {busy ? L('Sending…', 'Mengirim…') : L('Send verification code', 'Kirim kode verifikasi')} <PIcon name="arrowR" size={16} />
                  </button>
                </>
              ) : (
                <>
                  {otpDemo && (
                    <div style={{ textAlign: 'center', marginBottom: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(176,136,56,0.08)', border: '1px dashed rgba(176,136,56,0.45)' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gold-2, #B08838)', textTransform: 'uppercase', marginBottom: 6 }}>{L('Demo mode — code shown here', 'Mode demo — kode tampil di sini')}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, letterSpacing: 8, color: 'var(--ink)' }}>{otpDemo}</div>
                    </div>
                  )}
                  <div style={field}>
                    <label style={labelS}>{L('6-digit code', 'Kode 6 digit')}</label>
                    <input
                      style={{ ...inputS, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 10, height: 56 }}
                      inputMode="numeric" maxLength={6} placeholder="••••••"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                    />
                  </div>
                  <button className="p-btn p-btn-cyan" disabled={busy || otpCode.length !== 6}
                    style={{ width: '100%', height: 50, fontSize: 15, borderRadius: 10, justifyContent: 'center', opacity: busy || otpCode.length !== 6 ? 0.55 : 1 }}
                    onClick={verifyOtp}>
                    {busy ? L('Verifying…', 'Memverifikasi…') : L('Verify number', 'Verifikasi nomor')} <PIcon name="arrowR" size={16} />
                  </button>
                  <div style={{ textAlign: 'center', marginTop: 14 }}>
                    <a onClick={() => !busy && sendOtp()} style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}>{L('Resend code', 'Kirim ulang kode')}</a>
                  </div>
                </>
              )}
              {currentUser?.provider === 'google' && (
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <a onClick={() => onNav && onNav(currentUser.role === 'admin' ? 'admin' : 'home')} style={{ fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>{L('Skip for now', 'Lewati untuk sekarang')}</a>
                </div>
              )}
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
          <div style={{ ...field, marginBottom: 10 }}>
            <label style={labelS}>{L('Password', 'Kata sandi')}</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputS, paddingRight: 46 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 6, top: 6, width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PIcon name="eye" size={17} />
              </button>
            </div>
          </div>
          )}

          {mode === 'reset' && (
            <>
              <div style={field}>
                <label style={labelS}>{L('New password', 'Kata sandi baru')}</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputS, paddingRight: 46 }} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 6, top: 6, width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PIcon name="eye" size={17} />
                  </button>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{L('Minimum 6 characters.', 'Minimal 6 karakter.')}</span>
              </div>
              <div style={{ ...field, marginBottom: 22 }}>
                <label style={labelS}>{L('Confirm new password', 'Konfirmasi kata sandi baru')}</label>
                <input style={inputS} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={newPw2} onChange={e => setNewPw2(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
            </>
          )}

          {mode === 'login' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 15, height: 15, accentColor: 'var(--teal)' }} />
                {L('Remember me', 'Ingat saya')}
              </label>
              <a onClick={() => goMode('forgot')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}>{L('Forgot password?', 'Lupa kata sandi?')}</a>
            </div>
          ) : mode !== 'register' ? (
            <div style={{ marginBottom: 22 }} />
          ) : (
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 22px' }}>
              {L('By creating an account you agree to Assetra’s ', 'Dengan membuat akun, Anda menyetujui ')}
              <a style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}>{L('Terms', 'Ketentuan')}</a>
              {' '}{L('and', 'dan')}{' '}
              <a style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}>{L('Privacy Policy', 'Kebijakan Privasi')}</a>.
            </p>
          )}

          {info && (
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '10px 14px', marginBottom: 16, background: 'rgba(45,138,111,0.07)', border: '1px solid rgba(45,138,111,0.35)', borderRadius: 8, color: 'var(--ink-2)', fontSize: 12.5, lineHeight: 1.55 }}>
              <span style={{ color: 'var(--green, #2D8A6F)', marginTop: 1 }}><PIcon name="check" size={14} /></span>
              <span>{info}</span>
            </div>
          )}
          {error && (
            <div style={{ padding: '10px 14px', marginBottom: 16, background: 'rgba(166,29,29,0.06)', border: '1px solid rgba(166,29,29,0.4)', borderRadius: 8, color: '#A61D1D', fontSize: 12.5 }}>{error}</div>
          )}

          {mode === 'pending' ? (
            alreadyVerified ? (
              /* Sudah terverifikasi → satu-satunya aksi: masuk. */
              <button className="p-btn p-btn-cyan" style={{ width: '100%', height: 50, fontSize: 15, borderRadius: 10, justifyContent: 'center' }} onClick={() => goMode('login')}>
                {L('Sign in now', 'Masuk sekarang')} <PIcon name="arrowR" size={16} />
              </button>
            ) : (
            <>
              <button className="p-btn p-btn-cyan" disabled={busy} style={{ width: '100%', height: 50, fontSize: 15, borderRadius: 10, justifyContent: 'center', opacity: busy ? 0.6 : 1 }} onClick={resendVerification}>
                {busy ? L('Sending…', 'Mengirim…') : L('Resend verification email', 'Kirim ulang email verifikasi')} <PIcon name="arrowR" size={16} />
              </button>
              {demoVerifyToken && (
                <button className="p-btn p-btn-ghost" style={{ width: '100%', height: 46, marginTop: 10, borderRadius: 10, justifyContent: 'center' }}
                  onClick={async () => {
                    try {
                      const r = await api.post('/api/auth/verify-email', { token: demoVerifyToken });
                      setToken(r.token);
                      const needsPhone = r.user?.phone && !r.user?.phoneVerified;
                      window.location.replace(needsPhone ? '/auth' : (r.user?.role === 'admin' ? '/admin' : '/'));
                    } catch (e) { setError(e.message); }
                  }}>
                  {L('Verify now (demo mode)', 'Verifikasi sekarang (mode demo)')}
                </button>
              )}
            </>
            )
          ) : mode !== 'verifying' && mode !== 'phone' && (
          <button className="p-btn p-btn-cyan" disabled={busy} style={{ width: '100%', height: 50, fontSize: 15, borderRadius: 10, justifyContent: 'center', opacity: busy ? 0.6 : 1 }} onClick={submit}>
            {busy
              ? L('Processing…', 'Memproses…')
              : mode === 'login' ? L('Sign in', 'Masuk')
              : mode === 'forgot' ? L('Send reset link', 'Kirim tautan reset')
              : mode === 'reset' ? L('Save new password & sign in', 'Simpan kata sandi & masuk')
              : role === 'owner' ? L('Create account & open dashboard', 'Buat akun & buka dasbor') : L('Create account', 'Buat akun')} <PIcon name="arrowR" size={16} />
          </button>
          )}

          {(mode === 'login' || mode === 'register') && (
          <>
          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--muted)' }}>{L('OR CONTINUE WITH', 'ATAU LANJUTKAN DENGAN')}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
          </div>

          {/* social — Google saja (WhatsApp disembunyikan) */}
          <button onClick={googleLogin} disabled={busy} style={{ width: '100%', height: 48, border: '1px solid var(--line)', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1l-3.9 3C3.1 21.3 7.2 24 12 24z"/><path fill="#FBBC05" d="M5 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3l-3.9-3C.4 8.3 0 10.1 0 12s.4 3.7 1.1 5.3l3.9-3z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.5l3.3-3.2C17.9 1.1 15.2 0 12 0 7.2 0 3.1 2.7 1.1 6.7l3.9 3c1-2.9 3.8-5 7-5z"/></svg>
            {L('Continue with Google', 'Lanjutkan dengan Google')}
          </button>

          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 26 }}>
            {mode === 'login' ? L("Don't have an account? ", 'Belum punya akun? ') : L('Already registered? ', 'Sudah terdaftar? ')}
            <a onClick={() => goMode(mode === 'login' ? 'register' : 'login')} style={{ color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'login' ? L('Create one free', 'Buat gratis') : L('Sign in', 'Masuk')}
            </a>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalAuth;
