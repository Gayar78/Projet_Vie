/* static/js/ui/pages/login.js */
import { api } from '../../core/api.js'

export default function loginPage () {
  return /* html */ `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-20">
    
    <div class="max-w-5xl w-full grid md:grid-cols-2 gap-16 items-center">
      
      <!-- Colonne Texte -->
      <div class="text-center md:text-left space-y-6">
        <h1 class="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight animate-spring-in">
          Welcome<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Back.</span>
        </h1>
        <p class="text-lg text-gray-400 max-w-md mx-auto md:mx-0 animate-spring-in" style="animation-delay: 0.1s">
          Connectez-vous pour accéder à votre tableau de bord, suivre vos stats et défier vos amis.
        </p>
      </div>

      <!-- Colonne Formulaire -->
      <form id="login-form"
            class="liquid-glass-card rounded-2xl p-8 space-y-6 animate-spring-in"
            style="animation-delay: 0.2s"
            data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
        
        <div class="text-center mb-8">
            <h2 class="text-xl font-bold text-white tracking-widest uppercase">Connexion</h2>
            <div class="h-1 w-10 bg-pink-500 mx-auto mt-2 rounded-full"></div>
        </div>

        <div>
          <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
          <input name="email" type="email" placeholder="exemple@email.com"
                 class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600 transition-colors" 
                 required>
        </div>

        <div>
          <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Mot de passe</label>
          <input name="password" type="password" placeholder="••••••••"
                 class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600 transition-colors" 
                 required>
        </div>

        <button class="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-pink-900/20 hover:scale-[1.02] transition-transform active:scale-95">
          Se connecter
        </button>

        <p class="text-center text-sm text-gray-500 pt-2">
          Pas encore de compte ?
          <a href="/register" data-link class="font-bold text-pink-400 hover:text-pink-300 hover:underline transition-colors">
            Inscrivez-vous
          </a>
        </p>
      </form>

    </div>
  </section>`
}

export function setupLogin () {
  const form = document.getElementById('login-form')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(form))

    // Petit feedback visuel sur le bouton
    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Chargement...';
    btn.disabled = true;

    try {
      const res = await api('/login', { email, password }, 'POST')
      localStorage.setItem('token',  res.idToken)
      localStorage.setItem('userId', res.localId)
      
      history.pushState(null, '', '/profile/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))

    } catch (err) {
      alert('Email ou mot de passe incorrect.') // Idéalement à remplacer par un toast plus tard
      console.error(err)
      btn.textContent = originalText;
      btn.disabled = false;
    }
  })
}