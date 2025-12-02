import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  /* ───────────────────────────── Firebase clés web ───────────────────────── */
  define: {
    'import.meta.env.VITE_FB_API_KEY':     JSON.stringify('AIzaSyDOqn7DJSB-FtTfSj1-6RE8vzznyxNhjNw'),
    'import.meta.env.VITE_FB_AUTH_DOMAIN': JSON.stringify('projetvie-212e4.firebaseapp.com'),
    'import.meta.env.VITE_FB_PROJECT_ID':  JSON.stringify('projetvie-212e4'),
  },

  /* ───────────────────────────── Config Multi-Pages ──────────────────────── */
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),   // Ta page principale
        admin: resolve(__dirname, 'admin.html'),  // Ta page admin (AJOUTÉ ICI)
      },
    },
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