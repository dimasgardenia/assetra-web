import { api } from './client.js';

export const watchlistApi = {
  list: () => api.get('/api/watchlist'),
  add: (id) => api.post(`/api/watchlist/${encodeURIComponent(id)}`),
  remove: (id) => api.del(`/api/watchlist/${encodeURIComponent(id)}`),
};
