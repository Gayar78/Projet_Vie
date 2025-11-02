/* static/js/ui/pages/register.js
 * Page “Create Account”
 * ------------------------------------------------------------ */

// ------------------------------------------------------------------
// 1. Le HTML de la page
// ------------------------------------------------------------------
export default function registerPage () {
  return /* html */ `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-20">

    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-20 items-center">

      <!-- MODIFIÉ : Texte sombre -->
      <div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
          Create<br>Account.
        </h1>
        <p class="text-lg text-gray-600">Rejoins la communauté dès aujourd'hui.</p>
      </div>

      <!-- MODIFIÉ : Formulaire style "Glass" clair -->
      <form id="register-form"
            class="liquid-glass-card rounded-2xl p-8 space-y-4">
        
        <h2 class="text-2xl font-semibold mb-6 text-center text-gray-900">Inscrivez-vous</h2>

        <div>
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Email</label>
          <input name="email" type="email" required
                 class="w-full px-4 py-2.5 rounded-lg 
                        bg-white/50 border border-white/30 
                        focus:ring-2 focus:ring-pink-500 focus:border-transparent">
        </div>

        <div>
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Mot de passe</label>
          <input name="password" type="password" minlength="6" required
                 class="w-full px-4 py-2.5 rounded-lg 
                        bg-white/50 border border-white/30 
                        focus:ring-2 focus:ring-pink-500 focus:border-transparent">
        </div>

        <div>
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Confirmer le mot de passe</label>
          <input name="confirm" type="password" required
                 class="w-full px-4 py-2.5 rounded-lg 
                        bg-white/50 border border-white/30 
                        focus:ring-2 focus:ring-pink-500 focus:border-transparent">
        </div>

        <!-- MODIFIÉ : Bouton sombre pour contraste -->
        <button
          class="w-full py-3 rounded-lg bg-gray-900 text-white 
                 font-semibold btn-liquid-press transition-all duration-150 ease-out
                 hover:bg-gray-700 mt-4">
          Créer le compte
        </button>
        
        <p class="text-center text-sm text-gray-600 pt-4">
          Déjà un compte ?
          <a href="/login" data-link class="font-medium text-pink-600 hover:underline">
            Connectez-vous
          </a>
        </p>
      </form>
    </div>
  </section>`
}
// ------------------------------------------------------------------
// 2. Logique (gérée par forms.js, ce fichier n'a besoin de rien)
// ------------------------------------------------------------------
