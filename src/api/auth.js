import { api } from './client.js';

export const authApi = {
  register: (input) => api.post('/api/auth/register', input),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  googleSso: (profile) => api.post('/api/auth/google', profile),
  me: () => api.get('/api/auth/me'),
};
