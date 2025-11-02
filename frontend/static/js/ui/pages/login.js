/* static/js/ui/pages/login.js
 * Page “Sign In”
 * ------------------------------------------------------------ */
import { api } from '../../core/api.js'

// ------------------------------------------------------------------
// 1. Le HTML de la page
// ------------------------------------------------------------------
export default function loginPage () {
  return /* html */ `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-20">
    
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-20 items-center">
      
      <!-- MODIFIÉ : Texte sombre -->
      <div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
          Welcome<br />Back.
        </h1>
        <p class="text-lg text-gray-600">
          Connectez-vous pour accéder à votre tableau de bord.
        </p>
      </div>

      <!-- MODIFIÉ : Formulaire style "Glass" clair -->
      <form id="login-form"
            class="liquid-glass-card rounded-2xl p-8 space-y-4">
        
        <h2 class="text-2xl font-semibold mb-6 text-center text-gray-900">Connexion</h2>

        <div>
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Email</label>
          <input name="email" type="email"
                 class="w-full px-4 py-2.5 rounded-lg 
                        bg-white/50 border border-white/30 
                        focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                 required>
        </div>

        <div>
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Mot de passe</label>
          <input name="password" type="password"
                 class="w-full px-4 py-2.5 rounded-lg 
                        bg-white/50 border border-white/30 
                        focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                 required>
        </div>

        <!-- MODIFIÉ : Bouton sombre pour contraste -->
        <button class="w-full py-3 rounded-lg bg-gray-900 text-white 
                       font-semibold btn-liquid-press transition-all duration-150 ease-out
                       hover:bg-gray-700">
          Se connecter
        </button>

        <p class="text-center text-sm text-gray-600 pt-4">
          Pas encore de compte ?
          <a href="/register" data-link class="font-medium text-pink-600 hover:underline">
            Inscrivez-vous
          </a>
        </p>
      </form>
    </div>
  </section>`
}

// ------------------------------------------------------------------
// 2. Logique de connexion (inchangée)
// ------------------------------------------------------------------
export function setupLogin () {
  const form = document.getElementById('login-form')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()

    const { email, password } = Object.fromEntries(new FormData(form))

    try {
      const res = await api('/login', { email, password }, 'POST')

      localStorage.setItem('token',  res.idToken)
      localStorage.setItem('userId', res.localId)
      
      // On recharge pour que la nav bar se mette à jour
      history.pushState(null, '', '/profile/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))

    } catch (err) {
      // TODO: Remplacer alert() par une modale
      alert('Échec de la connexion. Vérifiez votre email ou mot de passe.')
      console.error(err)
    }
  })
}
