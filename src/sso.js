/* Google SSO — Google Identity Services (OAuth 2.0 / OpenID Connect).
   Requires VITE_GOOGLE_CLIENT_ID; the ID token is verified again by the API. */

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

/** Google SSO. Resolves the verified profile + credential, or null when the
 *  user cancels. Throws when no client ID is configured. */
export async function signInWithGoogle() {
  if (!CLIENT_ID) {
    throw new Error('Google Sign-In belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID)');
  }
  return signInWithGoogleReal();
}

export const HAS_REAL_GOOGLE_CLIENT = !!CLIENT_ID;
