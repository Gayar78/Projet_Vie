/* frontend/static/js/core/api.js */

// DÉTECTION AUTOMATIQUE DE L'ENVIRONNEMENT
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// URL DE PRODUCTION (Ton backend Render)
const BACKEND_URL = 'https://draftprime-api.onrender.com';

export async function api(path, body=null, method='POST') {
  // En local, on utilise le proxy Vite ("/api")
  // En prod, on utilise l'URL complète de Render
  const url = IS_LOCALHOST ? path : `${BACKEND_URL}${path}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Ajout du token s'il existe
      ...(localStorage.getItem('token') ? { 'Authorization': localStorage.getItem('token') } : {})
    }
  };

  if (body) {
      // Si c'est du FormData (pour les fichiers), on ne met pas de Content-Type JSON
      if (body instanceof FormData) {
          delete options.headers['Content-Type'];
          options.body = body;
      } else {
          options.body = JSON.stringify(body);
      }
  }

  const r = await fetch(url, options);
  
  if (!r.ok) {
      const errorText = await r.text();
      throw new Error(errorText);
  }
  
  return r.json();
}