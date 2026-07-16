/* Auth screens — Login & Register, brand-aligned with logo */
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../i18n';
import { Icon2, Logo2, LangSwitch } from '../shared-v2';
import { useActions, useStore } from '../store';
import { signInWithGoogle, HAS_REAL_GOOGLE_CLIENT } from '../sso';

const AuthHero = ({ kind = 'login' }) => {
  const { t } = useT();
  return (
    <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: '100%' }}>
      {/* Subtle gradient corner accent */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,196,217,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,111,168,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        <Logo2 size={36} dark />
        <div style={{ height: 1, background: 'rgba(250,250,247,0.12)', margin: '40px 0 36px' }} />
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--cyan)', marginBottom: 20 }}>◆ {t('auth.heroSub')}</div>
        <h2 className="as-display" style={{ fontSize: 44, lineHeight: 1.1, margin: 0, color: 'var(--paper)', letterSpacing: '-0.02em', maxWidth: 460 }}>
          {t('auth.heroQuote')}
        </h2>
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20, marginTop: 48 }}>
        {[
          { i: 'shield', t: t('auth.feature1'), d: t('auth.feature1d') },
          { i: 'bank', t: t('auth.feature2'), d: t('auth.feature2d') },
          { i: 'scale', t: t('auth.feature3'), d: t('auth.feature3d') },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, border: '1px solid rgba(59,196,217,0.4)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', flexShrink: 0 }}>
              <Icon2 name={f.i} size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.t}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,250,247,0.6)', lineHeight: 1.55 }}>{f.d}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 20, padding: '14px 16px', border: '1px solid rgba(250,250,247,0.12)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(250,250,247,0.7)' }}>
          <Icon2 name="lock" size={12} />
          <span>SSL · 256-BIT · ISO/IEC 27001 · UU PDP</span>
        </div>
      </div>
    </div>
  );
};

const AuthShell = ({ children, kind, lang, onLang }) => (
  <div className="as-screen" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: '100%', background: 'var(--paper)' }}>
    <div style={{ padding: '40px 56px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        <Logo2 size={32} />
        {onLang && <LangSwitch lang={lang} onChange={onLang} />}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 520, width: '100%', margin: '0 auto' }}>
        {children}
      </div>
    </div>
    <AuthHero kind={kind} />
  </div>
);

/* ---------------- LOGIN ---------------- */
const LoginScreenV2 = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const actions = useActions();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true); setError('');
    try {
      const user = await actions.login(email, password);
      navigate(user.role === 'admin' ? '/admin' : next);
    } catch (e) {
      setError(e.message || 'Login gagal');
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
      navigate(user.role === 'admin' ? '/admin' : next);
    } catch (e) {
      setError(e.message || 'Sign in dengan Google gagal');
    } finally {
      setBusy(false);
    }
  };

  const adminDemo = async () => {
    setBusy(true); setError('');
    try {
      await actions.login('admin@assetra.co.id', 'admin123');
      navigate('/admin');
    } catch (e) {
      setError(e.message || 'Login gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell kind="login" lang={lang} onLang={onLang}>
      <div className="as-eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 14 }}>— {t('nav.signin').toUpperCase()}</div>
      <h1 className="as-display" style={{ fontSize: 52, margin: '0 0 14px', letterSpacing: '-0.025em' }}>{t('auth.welcome')}</h1>
      <p style={{ fontSize: 15, color: 'var(--ink-3)', margin: '0 0 36px', lineHeight: 1.55, maxWidth: 440 }}>{t('auth.welcomeSub')}</p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label={t('auth.email')} type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label={t('auth.password')} type="password" placeholder="••••••••••••" rightLink={t('auth.forgot')} value={password} onChange={(e) => setPassword(e.target.value)} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', marginTop: 4 }}>
          <span style={{ width: 16, height: 16, border: '1.5px solid var(--ink-3)', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-gradient)', color: 'var(--paper)' }}>
            <Icon2 name="check" size={11} stroke={2.6} />
          </span>
          {t('auth.remember')}
        </label>

        <button type="submit" disabled={busy} className="as-btn as-btn-primary as-btn-xl" style={{ width: '100%', marginTop: 10, background: 'var(--brand-gradient)', borderColor: 'transparent', opacity: busy ? 0.6 : 1 }}>
          <Icon2 name="lock" size={14} /> {busy ? 'Memproses…' : t('auth.signin')}
        </button>
        {error && (
          <div style={{ padding: 10, background: 'rgba(166,29,29,0.06)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'center' }}>{error}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          {t('auth.or').toUpperCase()}
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <button type="button" onClick={googleLogin} style={{
          padding: '14px 16px',
          border: '1.5px solid var(--line)',
          background: 'var(--paper)',
          fontFamily: 'var(--sans)',
          fontSize: 13.5,
          fontWeight: 500,
          color: 'var(--ink)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          borderRadius: 2,
          transition: 'all .15s',
          width: '100%',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'rgba(59,196,217,0.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--paper)'; }}
        >
          <GoogleG size={18} /> {t('auth.google')}
        </button>

        <div style={{ marginTop: 16, padding: 14, background: 'var(--paper-2)', borderLeft: '3px solid var(--cyan)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon2 name="lock" size={14} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{t('auth.twoFactor')}</div>
            <div style={{ color: 'var(--muted)' }}>{t('auth.trustNote')}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--ink-3)' }}>
          {t('auth.noAccount')} <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--teal)' }}>{t('auth.createAccount')}</Link>
        </div>

        <div style={{ marginTop: 18, padding: 12, border: '1px dashed var(--line)', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          <div style={{ color: 'var(--ink-2)', fontWeight: 600, marginBottom: 6 }}>◆ DEMO MODE · BACKEND CONNECTED</div>
          <div>Demo akun (seed di SQLite):</div>
          <div style={{ marginTop: 6, fontSize: 10 }}>
            · Admin: <b>admin@assetra.co.id</b> / <b>admin123</b><br/>
            · Bidder: <b>bidder@assetra.co.id</b> / <b>bidder123</b>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={adminDemo} disabled={busy} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Quick sign in as admin</button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
};

/* ---------------- REGISTER ---------------- */
const RegisterScreenV2 = ({ lang, onLang }) => {
  const { t } = useT();
  const navigate = useNavigate();
  const actions = useActions();
  const [step, setStep] = React.useState(1);
  const [acctType, setAcctType] = React.useState('individual');
  const [name, setName] = React.useState('');
  const [emailReg, setEmailReg] = React.useState('');
  const [pwReg, setPwReg] = React.useState('demo-password-123');
  const [busyReg, setBusyReg] = React.useState(false);
  const [errReg, setErrReg] = React.useState('');

  const submitRegister = async () => {
    if (!emailReg) { setErrReg('Email diperlukan'); return; }
    setBusyReg(true); setErrReg('');
    try {
      await actions.register({ email: emailReg, password: pwReg, name: name || emailReg.split('@')[0], accountType: acctType });
      navigate('/');
    } catch (e) {
      setErrReg(e.message || 'Pendaftaran gagal');
    } finally {
      setBusyReg(false);
    }
  };

  return (
    <AuthShell kind="register" lang={lang} onLang={onLang}>
      <div className="as-eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 14 }}>— {t('reg.step')} {step} {t('reg.of')} 4</div>
      <h1 className="as-display" style={{ fontSize: 40, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>{t('reg.title')}</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 28px', lineHeight: 1.55 }}>{t('reg.sub')}</p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 3, background: n <= step ? 'var(--brand-gradient)' : 'var(--paper-3)' }} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: n === step ? 'var(--ink)' : 'var(--muted-2)', textTransform: 'uppercase', fontWeight: n === step ? 600 : 400 }}>
              0{n} · {[t('reg.s1'), t('reg.s2'), t('reg.s3'), t('reg.s4')][n-1]}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {step === 1 && (
          <>
            <Field label={t('reg.fullName')} placeholder={t('reg.fullNamePh')} value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={t('auth.email')} type="email" placeholder="nama@email.com" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} />
              <Field label={t('reg.phone')} placeholder={t('reg.phonePh')} />
            </div>
            <Field label={t('reg.password')} type="password" placeholder={t('reg.passwordPh')} hint={t('reg.passwordHint')} />

            <div>
              <div className="as-eyebrow" style={{ marginBottom: 10 }}>— {t('reg.accountType')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'individual', label: t('reg.individual'), sub: t('reg.individualSub'), icon: 'user' },
                  { id: 'company', label: t('reg.company'), sub: t('reg.companySub'), icon: 'bank' },
                ].map(o => (
                  <button key={o.id} type="button" onClick={() => setAcctType(o.id)} style={{
                    padding: '14px 14px',
                    border: `1.5px solid ${acctType === o.id ? 'var(--teal)' : 'var(--line)'}`,
                    background: acctType === o.id ? 'rgba(59,196,217,0.06)' : 'var(--paper)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Icon2 name={o.icon} size={18} />
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${acctType === o.id ? 'var(--teal)' : 'var(--line)'}`, background: acctType === o.id ? 'var(--brand-gradient)' : 'transparent' }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{o.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ padding: 14, background: 'var(--paper-2)', borderLeft: '3px solid var(--cyan)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55, display: 'flex', gap: 10, marginBottom: 4 }}>
              <Icon2 name="shield" size={14} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{t('reg.kycTitle')}</div>
                <div style={{ color: 'var(--muted)' }}>{t('reg.kycSub')}</div>
              </div>
            </div>

            <Field label={t('reg.ktpNumber')} placeholder={t('reg.ktpNumberPh')} hint={t('reg.kycVerified')} hintIcon="check" hintColor="var(--green)" />

            <Upload label={t('reg.uploadKtp')} sub={t('reg.uploadKtpSub')} />
            <Upload label={t('reg.selfie')} sub={t('reg.selfieSub')} verified />

            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Icon2 name="lock" size={11} /> {t('reg.kycEnc')}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Field label={t('reg.npwp')} placeholder={t('reg.npwpPh')} />

            <div>
              <div className="as-eyebrow" style={{ marginBottom: 6 }}>— {t('reg.bank')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{t('reg.bankSub')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginBottom: 14 }}>
                <Field compact label={t('reg.bankName')} placeholder="Bank Mandiri" />
                <Field compact label={t('reg.accountNo')} placeholder="13000xxxxxxx" />
              </div>
              <Field compact label={t('reg.accountHolder')} placeholder="Andi Wirawan" hint={t('reg.confirmName')} hintIcon="check" hintColor="var(--green)" />
            </div>

            <Field label={t('reg.maxBid')} placeholder="Rp 5.000.000.000" hint={t('reg.maxBidSub')} />
          </>
        )}

        {step === 4 && (
          <>
            <div className="as-eyebrow" style={{ marginBottom: 6 }}>— {t('reg.review')}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{t('reg.reviewSub')}</div>

            <div style={{ border: '1px solid var(--line)', background: 'var(--paper)' }}>
              {[
                { l: t('reg.fullName'), v: 'Andi Wirawan' },
                { l: t('auth.email'), v: 'andi.wirawan@email.com' },
                { l: t('reg.phone'), v: '+62 812 3456 7890' },
                { l: t('reg.accountType'), v: t('reg.individual') },
                { l: t('reg.ktpNumber'), v: '3271 0405 7301 0042', verified: true },
                { l: t('reg.npwp'), v: '02.345.678.9-012.000', verified: true },
                { l: t('reg.bank'), v: 'Bank Mandiri · 1300 0123 4567', verified: true },
                { l: t('reg.maxBid'), v: 'Rp 5.000.000.000' },
              ].map((r, i, a) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 14, padding: '14px 18px', borderBottom: i === a.length - 1 ? 'none' : '1px solid var(--line-2)', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.l}</span>
                  <span style={{ fontWeight: 500 }}>{r.v}</span>
                  {r.verified && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', padding: '2px 6px', border: '1px solid rgba(45,138,111,0.3)' }}>✓ VERIFIED</span>}
                </div>
              ))}
            </div>

            <label style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55, cursor: 'pointer', marginTop: 8 }}>
              <span style={{ width: 16, height: 16, border: '1.5px solid var(--ink-3)', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-gradient)', color: 'var(--paper)', flexShrink: 0, marginTop: 1 }}>
                <Icon2 name="check" size={11} stroke={2.6} />
              </span>
              {t('reg.terms')}
            </label>
          </>
        )}

        {/* Nav */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="as-btn as-btn-ghost" style={{ padding: '14px 22px' }}>← {t('reg.back')}</button>
          )}
          <button type="button" disabled={busyReg} onClick={() => step < 4 ? setStep(s => s + 1) : submitRegister()} className="as-btn as-btn-primary as-btn-xl" style={{ flex: 1, background: 'var(--brand-gradient)', borderColor: 'transparent', opacity: busyReg ? 0.6 : 1 }}>
            <Icon2 name={step === 4 ? 'check' : 'lock'} size={14} /> {busyReg ? 'Memproses…' : (step === 4 ? t('reg.submit') : t('reg.continue'))}
          </button>
        </div>
        {errReg && (
          <div style={{ padding: 10, background: 'rgba(166,29,29,0.06)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'center' }}>{errReg}</div>
        )}
        {step === 4 && <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>{t('reg.submitSub')}</div>}
        {step === 1 && <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 4 }}>{t('reg.terms')}</div>}

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--ink-3)' }}>
          {t('reg.alreadyHave')} <Link to="/signin" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--teal)' }}>{t('reg.signinLink')}</Link>
        </div>
      </form>
    </AuthShell>
  );
};

/* ---------------- Helpers ---------------- */
const Field = ({ label, type = 'text', placeholder, rightLink, hint, hintIcon, hintColor, compact, value, onChange, defaultValue }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
      <span className="as-eyebrow">— {label}</span>
      {rightLink && <a href="#" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--teal)', textTransform: 'uppercase', textDecoration: 'none' }}>{rightLink}</a>}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
      style={{
        width: '100%',
        padding: compact ? '11px 14px' : '14px 16px',
        border: '1.5px solid var(--line)',
        background: 'var(--paper)',
        fontFamily: 'var(--sans)',
        fontSize: compact ? 13 : 14,
        color: 'var(--ink)',
        outline: 'none',
        borderRadius: 2,
        transition: 'border-color .15s',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
    />
    {hint && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: hintColor || 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>
        {hintIcon && <Icon2 name={hintIcon} size={11} stroke={2.4} />}
        {hint}
      </div>
    )}
  </div>
);

const GoogleG = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const Upload = ({ label, sub, verified }) => (
  <div>
    <div className="as-eyebrow" style={{ marginBottom: 7 }}>— {label}</div>
    <div style={{
      border: `1.5px dashed ${verified ? 'var(--green)' : 'var(--line)'}`,
      background: verified ? 'rgba(45,138,111,0.04)' : 'var(--paper-2)',
      padding: '20px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      borderRadius: 2,
      cursor: 'pointer',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 4, background: verified ? 'var(--green)' : 'var(--paper-3)', color: verified ? 'var(--paper)' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon2 name={verified ? 'check' : 'upload'} size={18} stroke={verified ? 2.6 : 1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
          {verified ? 'andi-ktp-selfie.jpg' : label}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '0.03em' }}>{sub}</div>
      </div>
      {verified && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', padding: '3px 7px', border: '1px solid rgba(45,138,111,0.4)' }}>✓ MATCH</span>}
    </div>
  </div>
);

export { LoginScreenV2, RegisterScreenV2, GoogleG };
