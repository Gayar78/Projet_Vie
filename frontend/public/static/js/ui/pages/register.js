/* frontend/static/js/ui/pages/register.js */
import { api } from '../../core/api.js' // Nécessaire si on veut gérer l'API ici (optionnel si géré par forms.js)

export default function registerPage () {
  return /* html */ `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-20">
    
    <div class="max-w-5xl w-full grid md:grid-cols-2 gap-16 items-center">
      
      <!-- Colonne Texte -->
      <div class="text-center md:text-left space-y-6 order-last md:order-first">
        <h1 class="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight animate-spring-in">
          Create<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Account.</span>
        </h1>
        <p class="text-lg text-gray-400 max-w-md mx-auto md:mx-0 animate-spring-in" style="animation-delay: 0.1s">
          Rejoins la communauté, enregistre tes performances et grimpe au sommet du classement.
        </p>
      </div>
      
      <!-- Colonne Formulaire -->
      <form id="register-form" 
            class="liquid-glass-card rounded-2xl p-8 space-y-5 animate-spring-in"
            style="animation-delay: 0.2s"
            data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
        
        <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-white tracking-widest uppercase">Inscription</h2>
            <div class="h-1 w-10 bg-pink-500 mx-auto mt-2 rounded-full"></div>
        </div>

        <div>
          <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
          <input name="email" type="email" placeholder="exemple@email.com" required 
                 class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600 transition-colors">
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Mot de passe</label>
              <input name="password" type="password" minlength="6" placeholder="••••••••" required 
                     class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600 transition-colors">
            </div>
            <div>
              <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Confirmation</label>
              <input name="confirm" type="password" placeholder="••••••••" required 
                     class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600 transition-colors">
            </div>
        </div>

        <div>
            <label class="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Genre (pour le classement)</label>
            <div class="flex gap-4">
                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <input type="radio" name="gender" value="M" required class="text-blue-500 focus:ring-blue-500 bg-black/50 border-white/20">
                    <span class="font-bold text-gray-300">Homme</span>
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-black/30 border border-white/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <input type="radio" name="gender" value="F" required class="text-pink-500 focus:ring-pink-500 bg-black/50 border-white/20">
                    <span class="font-bold text-gray-300">Femme</span>
                </label>
            </div>
        </div>
        
        <button class="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-pink-900/20 hover:scale-[1.02] transition-transform active:scale-95 mt-2">
          Créer le compte
        </button>
        
        <p class="text-center text-sm text-gray-500 pt-2">
          Déjà un compte ? <a href="/login" data-link class="font-bold text-pink-400 hover:text-pink-300 hover:underline transition-colors">Connectez-vous</a>
        </p>
      </form>
    </div>
  </section>`
}