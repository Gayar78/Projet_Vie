/* dashboard — page principale du profil
   appelé par router.js : pageMod.default(user)                  */

import { api } from '../../../core/api.js'
import { rankFromPoints } from '../leaderboard.js'   // <- même helper partagé

export default function dashboard (user = {}) {
  /* ------- helpers --------------------------------------- */
  const rankImg = `/static/images/ranks/${rankFromPoints(user.points || 0)}.png`
  const pts2coins = Math.floor((user.points || 0) / 10)

  return /* html */ `
  <div class="space-y-12">
    <!-- Canvas Vanta -->
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <!-- ── STATS RAPIDES ─────────────────────────────────── -->
    <section
      class="grid sm:grid-cols-3 gap-6 bg-white/5 backdrop-blur-md p-6
             rounded-2xl border border-white/10 text-center text-sm">
      <div>
        <p class="text-gray-400">Points</p>
        <p class="text-2xl font-semibold text-pink-400">${user.points ?? 0}</p>
      </div>
      <div class="flex flex-col items-center">
        <p class="text-gray-400 mb-1">Rang actuel</p>
        <img src="${rankImg}" alt="rank" class="w-14 h-14 object-contain" />
      </div>
      <div>
        <p class="text-gray-400">Coins</p>
        <p class="text-2xl font-semibold text-yellow-400">${pts2coins}</p>
      </div>
    </section>

    <!-- ── PARAMÈTRES SOCIAUX (Instagram) ───────────────── -->
    <section
      class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h3 class="text-lg font-semibold mb-4">Votre Instagram</h3>
      <form id="insta-form" class="flex flex-col sm:flex-row gap-4 items-start">
        <input name="instagram" type="text" placeholder="@handle"
               value="${user.instagram || ''}"
               class="flex-1 px-3 py-2 rounded-lg bg-gray-800 w-full" />
        <button
          class="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600
                 hover:opacity-90 font-semibold">
          Mettre à jour
        </button>
      </form>
      <p id="insta-msg" class="mt-2 text-sm"></p>
    </section>
  </div>`
}

/* ───────── post-render logic ────────────────────────────── */
export function setupDashboard () {
  /* update Insta */
  const f = document.getElementById('insta-form')
  const msg = document.getElementById('insta-msg')
  f?.addEventListener('submit', async e => {
    e.preventDefault()
    const handle = f.instagram.value.trim()
    try {
      await api('/profile', { instagram: handle }, 'POST')
      msg.textContent = 'Instagram mis à jour ✔︎'
      msg.className = 'text-green-400 text-sm'
    } catch {
      msg.textContent = 'Erreur…'
      msg.className = 'text-red-500 text-sm'
    }
  })

  /* logout */
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    history.pushState(null, '', '/login')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })

  /* delete account (simple) */
  document.getElementById('delete-btn')?.addEventListener('click', async () => {
    if (!confirm('Supprimer définitivement votre compte ?')) return
    try {
      await api('/profile', { delete: True }, 'POST') // à implémenter côté back
    } catch {}
    localStorage.clear()
    history.replaceState(null, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
}
