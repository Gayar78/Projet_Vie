/* static/js/core/forms.js
 * Bind global forms & buttons – handlers communs (hors page /login)
 * ------------------------------------------------------------ */
import { api } from '../core/api.js'

export function bindForms (path) {
  /* -------------------------------------------------- LOGIN */
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(e.target))

    try {
      const d = await api('/login', { email, password })

      // Stocke immédiatement les infos pour que lʼUI puisse sʼafficher
      localStorage.setItem('token',    d.idToken)           // accès API
      localStorage.setItem('userId',   d.localId  || '')    // highlight leaderboard
      localStorage.setItem('username', d.email    || '')    // montre dans la nav

      // Redirige vers le dashboard
      history.pushState(null, '', '/profile/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch {
      alert('Login failed')
    }
  })

  /* ------------------------------------------------ REGISTER */
  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password, confirm } = Object.fromEntries(new FormData(e.target))

    if (password !== confirm) {
      alert('Passwords differ')
      return
    }

    try {
      await api('/register', { email, password })
      alert('Account created. Log in!')

      // On redirige vers la page de connexion
      history.pushState(null, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch {
      alert('Register failed')
    }
  })
}