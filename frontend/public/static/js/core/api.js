/* frontend/static/js/core/api.js */

const API_BASE_URL = 'https://draftprime-api.onrender.com'; 

export async function api(path, body=null, method='POST') {
  // On concatène l'URL de base avec le chemin
  const url = API_BASE_URL + path;

  const r = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: localStorage.getItem('token') || ''
    },
    body: body ? JSON.stringify(body) : null
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}