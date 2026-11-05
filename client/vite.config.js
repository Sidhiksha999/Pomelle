import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the Pomelle client.
// The dev server runs on http://localhost:5173 and forwards every /api request
// to the Express server on port 8787, so the browser never needs the API key
// and there are no cross-origin issues.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
