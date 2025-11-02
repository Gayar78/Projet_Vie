/* static/js/ui/pages/login.js
 * Page “Sign In” + logique de connexion
 * ------------------------------------------------------------ */
import { api } from '../../core/api.js'

export default function loginPage () {
  return /* html */ `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Welcome<br />Back.</h1>
        <p class="text-gray-400">Sign in to access your dashboard.</p>
      </div>

      <form id="login-form"
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-6 text-center">Sign In</h2>

        <label class="block mb-2">Email</label>
        <input name="email"    type="email"
               class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800" required>

        <label class="block mb-2">Password</label>
        <input name="password" type="password"
               class="w-full mb-6 px-3 py-2 rounded-lg bg-gray-800" required>

        <button class="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold">
          Sign In
        </button>

        <p class="text-center text-sm text-gray-400 mt-4">
          Don’t have an account?
          <a href="/register" data-link class="text-pink-400">Create one</a>
        </p>
      </form>
    </div>
  </section>`
}

/* ---------- logique de connexion --------------------------- */
export function setupLogin () {
  const form = document.getElementById('login-form')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()

    const { email, password } = Object.fromEntries(new FormData(form))

    try {
      const res = await api('/login', { email, password }, 'POST')   // Firebase REST

      /* ➊ Stocke le token pour les appels protégés */
      localStorage.setItem('token',  res.idToken)

      /* ➋ Stocke l’UID pour la mise en surbrillance */
      localStorage.setItem('userId', res.localId)

      /* ➌ Redirige directement vers le Dashboard */
      history.pushState(null, '', '/profile/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (err) {
      alert('Login failed – check your email / password.')
      console.error(err)
    }
  })
}
