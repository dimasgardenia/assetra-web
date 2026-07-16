import { api } from './client.js';

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
  kycAll: () => api.get('/api/admin/kyc'),
  kycPending: () => api.get('/api/admin/kyc/pending'),
  kycApprove: (id) => api.post(`/api/admin/kyc/${id}/approve`),
  kycReject: (id) => api.post(`/api/admin/kyc/${id}/reject`),
  documents: () => api.get('/api/admin/documents'),
};
