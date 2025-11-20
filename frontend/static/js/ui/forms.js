// frontend/static/js/ui/forms.js
import { api } from '../core/api.js'

export function bindForms (path) {
  // ... (votre handler 'login-form' reste inchangé) ...
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(e.target))

    try {
      const d = await api('/login', { email, password })
      localStorage.setItem('token',    d.idToken)
      localStorage.setItem('userId',   d.localId  || '')
      localStorage.setItem('username', d.email    || '')
      history.pushState(null, '', '/profile/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch {
      alert('Login failed')
    }
  })

  // --- MODIFIEZ CE HANDLER ---
  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    // On récupère aussi le 'gender'
    const { email, password, confirm, gender } = Object.fromEntries(new FormData(e.target))

    if (password !== confirm) {
      alert('Passwords differ')
      return
    }

    if (!gender) {
        alert('Veuillez sélectionner votre genre.');
        return;
    }

    try {
      // On envoie le 'gender' à l'API
      await api('/register', { email, password, gender })
      alert('Account created. Log in!')

      history.pushState(null, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch {
      alert('Register failed')
    }
  })
}