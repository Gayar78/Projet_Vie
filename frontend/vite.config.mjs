import { defineConfig } from 'vite';

export default defineConfig({
  /* ───────────────────────────── Firebase clés web ───────────────────────── */
  define: {
    // JSON.stringify obligatoire pour injecter une vraie chaîne
    'import.meta.env.VITE_FB_API_KEY':     JSON.stringify('AIzaSyDOqn7DJSB-FtTfSj1-6RE8vzznyxNhjNw'),
    'import.meta.env.VITE_FB_AUTH_DOMAIN': JSON.stringify('projetvie-212e4.firebaseapp.com'),
    'import.meta.env.VITE_FB_PROJECT_ID':  JSON.stringify('projetvie-212e4'),
  },

  /* ───────────────────────────── Proxy vers FastAPI ──────────────────────── */
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
