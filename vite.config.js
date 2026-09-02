import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend target for the dev/preview proxy. Override with API_PROXY_TARGET
// if the API runs on another host/port.
const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:3001';

// Proxy /api and /files to the backend so the browser only ever talks to the
// Vite origin. This makes the app reachable from a phone on the same Wi-Fi
// (or via Chrome USB port forwarding) without CORS or per-device env changes.
const proxy = {
  '/api': { target: API_TARGET, changeOrigin: true },
  '/files': { target: API_TARGET, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on 0.0.0.0 so other devices on the LAN can connect
    port: 5173,
    strictPort: false,
    proxy,
    // Cloud dev hosts (GitHub Codespaces) reach Vite through a public hostname.
    allowedHosts: ['.app.github.dev', '.github.dev'],
    // Behind Codespaces' HTTPS port forwarding, HMR must connect on 443.
    hmr: process.env.CODESPACES ? { clientPort: 443 } : undefined,
  },
  preview: {
    host: true,
    port: 4173,
    proxy,
  },
});
