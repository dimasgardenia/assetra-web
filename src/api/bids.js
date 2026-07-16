import { api } from './client.js';

export const bidsApi = {
  listMine: () => api.get('/api/bids/mine'),
};
