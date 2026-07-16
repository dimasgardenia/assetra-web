import { api, resolveFileUrl } from './client.js';

const qs = (obj) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v == null || v === '' || v === 'all' || v === 'any') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

const normalize = (l) => {
  if (!l) return l;
  return {
    ...l,
    uploadedPhotos: (l.uploadedPhotos || []).map(resolveFileUrl),
    photoFiles: (l.photoFiles || []).map(p => ({ ...p, path: resolveFileUrl(p.path) })),
    documents: Object.fromEntries(
      Object.entries(l.documents || {}).map(([k, v]) => [k, { ...v, path: resolveFileUrl(v.path) }])
    ),
  };
};

export const listingsApi = {
  list: (params) =>
    api.get(`/api/listings${qs(params)}`).then(r => ({ ...r, data: r.data.map(normalize) })),
  get: (id) =>
    api.get(`/api/listings/${encodeURIComponent(id)}`).then(r => ({ ...r, data: normalize(r.data) })),
  create: (input) =>
    api.post('/api/listings', input).then(r => ({ ...r, data: normalize(r.data) })),
  update: (id, patch) =>
    api.put(`/api/listings/${encodeURIComponent(id)}`, patch).then(r => ({ ...r, data: normalize(r.data) })),
  remove: (id) =>
    api.del(`/api/listings/${encodeURIComponent(id)}`),

  /* Bids on a listing */
  listBids: (id) => api.get(`/api/listings/${encodeURIComponent(id)}/bids`),
  placeBid: (id, amount) => api.post(`/api/listings/${encodeURIComponent(id)}/bids`, { amount }),

  /* File uploads — multipart */
  uploadPhotos: (id, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    return api.post(`/api/listings/${encodeURIComponent(id)}/photos`, fd);
  },
  deletePhoto: (id, photoId) =>
    api.del(`/api/listings/${encodeURIComponent(id)}/photos/${photoId}`),
  reorderPhotos: (id, ids) =>
    api.post(`/api/listings/${encodeURIComponent(id)}/photos/reorder`, { ids }),

  uploadDocument: (id, slot, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/listings/${encodeURIComponent(id)}/documents/${slot}`, fd);
  },
  deleteDocument: (id, slot) =>
    api.del(`/api/listings/${encodeURIComponent(id)}/documents/${slot}`),
};
