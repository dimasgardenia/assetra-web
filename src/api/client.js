/* Base API client. Adds Authorization header from localStorage token,
   normalizes errors, and resolves relative file paths (/files/photos/...)
   to absolute URLs against the API origin. */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const TOKEN_KEY = 'assetra:token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** Convert a server-relative file URL like /files/photos/xxx.jpg into an absolute URL. */
export function resolveFileUrl(p) {
  if (!p) return p;
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  if (p.startsWith('/files/')) return `${API_BASE}${p}`;
  return p;
}

/* ── Pelacak aktivitas jaringan global ──
   Setiap request menaikkan penghitung; indikator loading global berlangganan
   perubahan ini dan hanya muncul saat request tertunda (koneksi lambat). */
let inflight = 0;
const loadingListeners = new Set();
function notifyLoading() { for (const fn of loadingListeners) { try { fn(inflight); } catch {} } }
export function onLoadingChange(fn) { loadingListeners.add(fn); fn(inflight); return () => loadingListeners.delete(fn); }
export function isLoading() { return inflight > 0; }

async function parseJsonOrEmpty(res) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  try { return await res.json(); } catch { return null; }
}

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function request(path, { method = 'GET', body, headers = {}, json = true, signal } = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const init = { method, headers: { ...headers }, signal };

  /* Header Authorization eksplisit (mis. sesi admin back-office) menang;
     token sesi user dari localStorage hanya dipakai bila tidak ada. */
  const token = getToken();
  if (token && !init.headers['Authorization']) init.headers['Authorization'] = `Bearer ${token}`;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      init.body = body;
    } else if (json) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    } else {
      init.body = body;
    }
  }

  inflight += 1; notifyLoading();
  let res;
  try {
    try {
      res = await fetch(url, init);
    } catch (e) {
      throw new ApiError(`Network error: ${e.message}`, 0);
    }

    const data = await parseJsonOrEmpty(res);
    if (!res.ok) {
      const msg = data?.error || `Request failed with ${res.status}`;
      throw new ApiError(msg, res.status, data);
    }
    return data;
  } finally {
    inflight = Math.max(0, inflight - 1); notifyLoading();
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export { ApiError, API_BASE };
