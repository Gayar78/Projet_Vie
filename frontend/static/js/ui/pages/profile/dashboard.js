/* dashboard — page principale du profil
   appelé par router.js : pageMod.default(user)
*/

import { api } from '../../../core/api.js'
import { rankFromPoints } from '../leaderboard.js' // <- même helper partagé

// Helper pour mapper les slugs aux jolis noms
const CATEGORY_NAMES = {
    muscu: 'Musculation',
    street: 'Street Workout',
    cardio: 'Cardio',
    general: 'Total'
};

export default function dashboard (user = {}) {
  /* ------- helpers --------------------------------------- */
  const rankImg = `/static/images/ranks/${rankFromPoints(user.points || 0)}.png`
  const pts2coins = Math.floor((user.points || 0) / 10)

  // HTML pour les scores par catégorie
  const scoresHtml = Object.entries(user.scores || {})
    .filter(([key]) => key !== 'general') // On exclut le total, déjà affiché
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Trie muscu, street, cardio
    .map(([key, value]) => `
      <!-- MODIFIÉ : Carte "Glass" -->
      <div class="bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg p-4 rounded-lg">
        <!-- MODIFIÉ : Texte sombre -->
        <h4 class="font-semibold text-blue-600">${CATEGORY_NAMES[key] || key}</h4>
        <p class="text-2xl font-bold text-gray-900">${(value && value.total) ? value.total.toLocaleString() : 0} pts</p>

        <div class="mt-2 text-sm text-gray-700 space-y-1">
          ${Object.entries(value || {})
            .filter(([exKey]) => exKey !== 'total')
            .map(([exKey, exPoints]) => `
              <div class="flex justify-between">
                <span class="capitalize">${exKey.replace('_', ' ')}:</span>
                <span class="font-medium">${exPoints.toLocaleString()}</span>
              </div>
            `).join('')}
        </div>
      </div>
    `).join('');

  return /* html */ `
  <!-- MODIFIÉ : Panneau "Liquid Glass" unifié -->
  <div class="space-y-6 liquid-glass-card rounded-2xl p-6">

    <!-- ── STATS RAPIDES ─────────────────────────────────── -->
    <section class="grid sm:grid-cols-3 gap-6 text-center text-sm">
      <div>
        <p class="text-gray-600">Points</p>
        <p class="text-2xl font-semibold text-pink-500">${(user.points || 0).toLocaleString()}</p>
      </div>
      <div class="flex flex-col items-center">
        <p class="text-gray-600 mb-1">Rang actuel</p>
        <img src="${rankImg}" alt="rank" class="w-14 h-14 object-contain" />
      </div>
      <div>
        <p class="text-gray-600">Coins</p>
        <p class="text-2xl font-semibold text-yellow-500">${pts2coins.toLocaleString()}</p>
      </div>
    </section>

    <!-- SÉPARATEUR LIQUIDE -->
    <hr class="border-black/10" />

    <!-- ── SCORES PAR CATÉGORIE ───────────────── -->
    <section>
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Mes Scores Détaillés</h3>
      <div class="grid md:grid-cols-3 gap-4">
        ${scoresHtml || '<p class="text-gray-600">Aucun score enregistré.</p>'}
      </div>
    </section>

    <!-- SÉPARATEUR LIQUIDE -->
    ${user.bio ? '<hr class="border-black/10" />' : ''}

    <!-- ── BIOGRAPHIE ───────────────── -->
    ${user.bio ? `
    <section>
      <h3 class="text-lg font-semibold mb-2 text-gray-900">Biographie</h3>
      <p class="text-gray-700 whitespace-pre-wrap">${user.bio}</p>
    </section>
    ` : ''}

    <!-- SÉPARATEUR LIQUIDE -->
    <hr class="border-black/10" />

    <!-- ── INSTAGRAM ───────────────── -->
    <section>
      <h3 class="text-lg font-semibold mb-4 text-gray-900">Votre Instagram</h3>
      <form id="insta-form" class="flex flex-col sm:flex-row gap-4 items-start">
        <!-- MODIFIÉ : Champ "Glass" -->
        <input name="instagram" type="text" placeholder="handle (sans @)"
               value="${user.instagram || ''}"
               class="flex-1 px-3 py-2 rounded-lg bg-white/70 border-0 ring-1 ring-black/10 shadow-inner focus:ring-2 focus:ring-pink-500 w-full" />
        <!-- MODIFIÉ : Bouton sombre -->
        <button class="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 font-semibold btn-liquid-press">
          Mettre à jour
        </button>
      </form>
      ${user.instagram ? `
        <p class="mt-4 text-sm">
          Profil&nbsp;: <a href="https://instagram.com/${user.instagram}"
                           target="_blank" rel="noopener"
                           class="text-pink-500 hover:underline">
                            @${user.instagram}</a>
        </p>` : ''}
      <p id="insta-msg" class="mt-2 text-sm"></p>
    </section>

  </div> <!-- Fin du panneau "Liquid Glass" -->
  `
}

/* ───────── post-render logic ────────────────────────────── */
export function setupDashboard () {
  /* update Insta */
  const f   = document.getElementById('insta-form')
  const msg = document.getElementById('insta-msg')

  f?.addEventListener('submit', async e => {
    e.preventDefault()
    const handle = f.instagram.value.trim()
    try {
      // On envoie aussi la version lowercase
      await api('/profile', { 
          instagram: handle,
          displayName: handle, // Met aussi à jour le displayName si vide
          displayName_lowercase: handle.toLowerCase() // Et le lowercase
      }, 'POST')
      
      msg.textContent = 'Instagram mis à jour ✔︎'
      msg.className   = 'text-green-500 text-sm'

      // Rafraîchit la page pour voir le lien
      window.dispatchEvent(new PopStateEvent('popstate'));

    } catch {
      msg.textContent = 'Erreur…'
      msg.className   = 'text-red-500 text-sm'
    }
  })
}
