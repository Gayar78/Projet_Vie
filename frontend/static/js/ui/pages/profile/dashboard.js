/* dashboard — page principale du profil
   appelé par router.js : pageMod.default(user)
*/

import { api } from '../../../core/api.js'
import { rankFromPoints } from '../leaderboard.js'  // <- même helper partagé

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
      <div class="bg-white/10 p-4 rounded-lg">
        <h4 class="font-semibold text-purple-300">${CATEGORY_NAMES[key] || key}</h4>
        <p class="text-2xl font-bold">${(value && value.total) ? value.total.toLocaleString() : 0} pts</p>

        <div class="mt-2 text-sm text-gray-300 space-y-1">
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
  <div class="space-y-12">
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <section
      class="grid sm:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6
             rounded-2xl border border-white/10 text-center text-sm">
      <div>
        <p class="text-gray-400">Points</p>
        <p class="text-2xl font-semibold text-pink-400">${(user.points || 0).toLocaleString()}</p>
      </div>
      <div class="flex flex-col items-center">
        <p class="text-gray-400 mb-1">Rang actuel</p>
        <img src="${rankImg}" alt="rank" class="w-14 h-14 object-contain" />
      </div>
      <div>
        <p class="text-gray-400">Coins</p>
        <p class="text-2xl font-semibold text-yellow-400">${pts2coins.toLocaleString()}</p>
      </div>
    </section>
    

    <section class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h3 class="text-lg font-semibold mb-4">Mes Scores Détaillés</h3>
      <div class="grid md:grid-cols-3 gap-4">
        ${scoresHtml || '<p class="text-gray-400">Aucun score enregistré.</p>'}
      </div>
    </section>

    ${user.bio ? `
    <section class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h3 class="text-lg font-semibold mb-2">Biographie</h3>
      <p class="text-gray-300 whitespace-pre-wrap">${user.bio}</p>
    </section>
    ` : ''}

    <section class="bg-white/5 backdrop-blur-md p-6 rounded-2xl
                    border border-white/10">
      <h3 class="text-lg font-semibold mb-4">Votre Instagram</h3>

      <form id="insta-form"
            class="flex flex-col sm:flex-row gap-4 items-start">
        <input name="instagram" type="text" placeholder="handle (sans @)"
               value="${user.instagram || ''}"
               class="flex-1 px-3 py-2 rounded-lg bg-gray-800 w-full" />
        <button
          class="px-5 py-2 rounded-lg bg-gradient-to-r
                 from-pink-500 to-purple-600 hover:opacity-90 font-semibold">
          Mettre à jour
        </button>
      </form>

      ${user.instagram ? `
        <p class="mt-4 text-sm">
          Profil&nbsp;: <a href="https://instagram.com/${user.instagram}"
                           target="_blank" rel="noopener"
                           class="text-pink-400 hover:underline">
                            @${user.instagram}</a>
        </p>` : ''}

      <p id="insta-msg" class="mt-2 text-sm"></p>
    </section>
  </div>`
}

/* ───────── post-render logic ────────────────────────────── */
// Ta logique pour le formulaire Insta reste la même
export function setupDashboard () {
  /* update Insta */
  const f   = document.getElementById('insta-form')
  const msg = document.getElementById('insta-msg')

  f?.addEventListener('submit', async e => {
    e.preventDefault()
    const handle = f.instagram.value.trim()
    try {
      await api('/profile', { instagram: handle }, 'POST')
      msg.textContent = 'Instagram mis à jour ✔︎'
      msg.className   = 'text-green-400 text-sm'

      // Rafraîchit la page pour voir le lien
      // C'est simple et ça marche
      window.dispatchEvent(new PopStateEvent('popstate'));

    } catch {
      msg.textContent = 'Erreur…'
      msg.className   = 'text-red-500 text-sm'
    }
  })
}

// N'OUBLIE PAS : On doit aussi appeler setupDashboard après le rendu
// On vérifie que c'est bien branché dans router.js