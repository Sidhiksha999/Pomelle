import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the Pomelle client.
// The dev server runs on http://localhost:5173. The app calls the API server
// directly at VITE_API_URL (falling back to http://localhost:8787), so no dev
// proxy is needed and local development works the same way as production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
