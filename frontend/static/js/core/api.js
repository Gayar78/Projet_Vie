// Helper API ⇄ FastAPI backend (proxy « /api »)
export async function api(path, body=null, method='POST') {
  const r = await fetch('/api' + path, {
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