/* Google SSO — uses Google Identity Services if VITE_GOOGLE_CLIENT_ID is set,
   falls back to a demo account picker so the flow works out of the box. */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function waitForGoogle(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.google?.accounts?.id) return resolve(window.google.accounts.id);
      if (Date.now() - start > timeoutMs) return reject(new Error('Google Identity Services failed to load'));
      setTimeout(tick, 60);
    };
    tick();
  });
}

/** Real Google SSO. Menampilkan modal berisi tombol resmi Google (renderButton)
 *  — jalur paling andal; One-Tap prompt() sering diblokir kebijakan cookie.
 *  Resolves { email, name, picture, sub, credential } — `credential` adalah
 *  JWT asli Google yang diverifikasi ulang di backend. */
export async function signInWithGoogleReal() {
  if (!CLIENT_ID) throw new Error('No client id configured');
  const gid = await waitForGoogle();

  return new Promise((resolve, reject) => {
    /* modal ringan berisi tombol resmi Google */
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,22,64,0.5);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:28px 32px;box-shadow:0 16px 48px rgba(0,0,0,0.25);text-align:center;font-family:system-ui,sans-serif;">
        <div style="font-size:15px;font-weight:600;color:#0A1640;margin-bottom:4px;">Lanjutkan dengan Google</div>
        <div style="font-size:12.5px;color:#6b7280;margin-bottom:18px;">Pilih akun Google Anda untuk masuk ke Assetra</div>
        <div id="gsi-btn-mount" style="display:flex;justify-content:center;"></div>
        <div id="gsi-cancel" style="margin-top:16px;font-size:12.5px;color:#6b7280;cursor:pointer;">Batal</div>
      </div>`;
    const cleanup = () => { overlay.remove(); };
    overlay.querySelector('#gsi-cancel').onclick = () => { cleanup(); resolve(null); };
    overlay.onclick = (e) => { if (e.target === overlay) { cleanup(); resolve(null); } };
    document.body.appendChild(overlay);

    try {
      gid.initialize({
        client_id: CLIENT_ID,
        callback: ({ credential }) => {
          cleanup();
          const decoded = decodeJwt(credential);
          if (!decoded) return reject(new Error('Bad credential'));
          resolve({
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            sub: decoded.sub,
            provider: 'google',
            credential,            // diverifikasi server-side
          });
        },
        auto_select: false,
        ux_mode: 'popup',
      });
      gid.renderButton(overlay.querySelector('#gsi-btn-mount'), {
        theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 280,
      });
      /* One-Tap sebagai bonus — kalau muncul, lebih cepat; kalau tidak, tombol tetap ada. */
      gid.prompt();
    } catch (e) {
      cleanup();
      reject(e);
    }
  });
}

/** Demo account picker — opens a fake Google chooser when no real client ID exists. */
export function signInWithGoogleDemo() {
  return new Promise((resolve) => {
    const picker = document.createElement('div');
    picker.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', system-ui, sans-serif;
    `;
    picker.innerHTML = `
      <div style="background:#fff;width:420px;max-width:92vw;border-radius:8px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.25);">
        <div style="padding:24px 24px 16px;border-bottom:1px solid #eee;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px;">
            <svg width="22" height="22" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2c-.71.48-1.64.81-2.7.81-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.58a4.8 4.8 0 0 1 0-3.07V5.43H1.83a8 8 0 0 0 0 7.18l2.67-2.03z"/>
              <path fill="#EA4335" d="M8.98 4.07c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.42L4.5 7.49a4.77 4.77 0 0 1 4.48-3.42z"/>
            </svg>
            <span style="font-size:14px;color:#5f6368;">Sign in with Google</span>
          </div>
          <div style="font-size:24px;color:#202124;margin-bottom:6px;">Choose an account</div>
          <div style="font-size:14px;color:#5f6368;">to continue to <b style="color:#202124">assetra.co.id</b></div>
        </div>
        <div id="goog-accounts" style="max-height:340px;overflow:auto;"></div>
        <div style="padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#5f6368;line-height:1.5;">
          <div>To continue, Google will share your name, email address, language preference, and profile picture with assetra.co.id.</div>
        </div>
      </div>
    `;

    const accounts = [
      { name: 'Andi Setiawan', email: 'andi.setiawan@gmail.com', picture: '', initials: 'AS', color: '#1a73e8' },
      { name: 'Rina Halimah', email: 'rina.halimah@gmail.com', picture: '', initials: 'RH', color: '#d93025' },
      { name: 'Use another account', email: '', picture: '', initials: '+', color: '#5f6368', custom: true },
    ];

    const list = picker.querySelector('#goog-accounts');
    accounts.forEach((a, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:14px 24px;display:flex;align-items:center;gap:14px;cursor:pointer;border-bottom:1px solid #f1f3f4;';
      row.onmouseenter = () => row.style.background = '#f8f9fa';
      row.onmouseleave = () => row.style.background = 'transparent';
      row.innerHTML = `
        <div style="width:36px;height:36px;border-radius:50%;background:${a.color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:500;font-size:14px;">${a.initials}</div>
        <div style="flex:1;">
          ${a.custom
            ? `<div style="font-size:14px;color:#202124;">${a.name}</div>`
            : `<div style="font-size:14px;color:#202124;">${a.name}</div><div style="font-size:13px;color:#5f6368;">${a.email}</div>`}
        </div>
      `;
      row.onclick = () => {
        document.body.removeChild(picker);
        if (a.custom) {
          const email = prompt('Email Google Anda:', '');
          if (!email) return resolve(null);
          const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          resolve({ email, name, picture: '', sub: 'demo-' + Date.now(), provider: 'google' });
        } else {
          resolve({ email: a.email, name: a.name, picture: '', sub: 'demo-' + i, provider: 'google' });
        }
      };
      list.appendChild(row);
    });

    // Close on backdrop click
    picker.onclick = (e) => {
      if (e.target === picker) {
        document.body.removeChild(picker);
        resolve(null);
      }
    };

    document.body.appendChild(picker);
  });
}

/** Real Google SSO bila client ID terpasang; demo picker bila belum.
 *  Membatalkan dialog asli TIDAK jatuh ke demo (null = batal). */
export async function signInWithGoogle() {
  if (CLIENT_ID) {
    try {
      return await signInWithGoogleReal();
    } catch (e) {
      console.warn('[SSO] Real Google sign-in failed, falling back to demo picker:', e.message);
      return signInWithGoogleDemo();
    }
  }
  return signInWithGoogleDemo();
}

export const HAS_REAL_GOOGLE_CLIENT = !!CLIENT_ID;
