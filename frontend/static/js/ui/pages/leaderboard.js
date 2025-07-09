export default function leaderboardPage () {
  return `
  <section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col items-center
                   text-white bg-cover bg-center">
    <!-- Canvas Vanta -->
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <h1 class="mt-24 text-5xl md:text-6xl font-extrabold text-center">
      <span class="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Leader&nbsp;Board
      </span>
    </h1>
    <p class="mt-4 mb-12 text-center text-gray-300 max-w-2xl">
      Follow the strongest athletes and latest community feats in real time.
    </p>

    <div class="w-full max-w-6xl grid md:grid-cols-[1fr_340px] gap-10">
      <table class="w-full text-left backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <thead class="uppercase text-xs text-gray-400 tracking-wider">
          <tr class="border-b border-white/10">
            <th class="py-4 pl-6">#</th>
            <th>Athlète</th>
            <th>Rang</th>
            <th class="pr-6 text-right">Points</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body"></tbody>
      </table>

      <div class="relative">
        <div class="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10
                    before:content-[''] before:absolute before:inset-0 before:rounded-2xl
                    before:bg-gradient-to-br before:from-pink-500 before:to-purple-600
                    before:opacity-20 before:-z-10">
          <h3 class="text-lg font-semibold">Recent Activity</h3>
          <div id="activity-feed" class="space-y-2 text-sm text-gray-300"></div>
        </div>
      </div>
    </div>
  </section>`
}

import { api } from '../../core/api.js'

export function loadLeaderboard () {
  const userId = localStorage.getItem('userId')   // l’UID stocké au login

  api('/leaderboard', null, 'GET').then(list => {
    const tbody = document.getElementById('leaderboard-body')
    if (!tbody) return

    tbody.innerHTML = list.map((u, i) => {
      /* --- détection de la ligne utilisateur ---------------- */
      const isUser = u.id === userId        // ← on compare à u.id

      const rankImg = i === 0 ? 'grandmaster.png' : 'diamond.png'

      return /* html */ `
        <tr class="group border-b border-white/10 hover:bg-white/5 relative
            ${isUser ? `
                after:absolute after:inset-y-0 after:left-2 after:right-2
                after:bg-gradient-to-r after:from-pink-500/20 after:to-purple-500/20
                after:shadow-lg after:shadow-pink-500/30
                after:ring-1 after:ring-pink-400/60
                after:rounded-xl after:-z-10
            ` : ''}">


        <!-- # ───────────────────────────── -->
        <td class="py-3 pl-6">
          <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
            ${i===0 ? 'bg-yellow-400 text-black'
              :i===1 ? 'bg-gray-300 text-black'
              :i===2 ? 'bg-orange-500'
              :          'bg-white/10'}">${i+1}
          </div>
        </td>

        <!-- Athlete -->
        <td class="font-medium ${isUser ? 'text-white' : ''}">
          ${u.username || u.email}
          ${isUser ? '<span class="ml-2 text-xs text-white bg-pink-500 px-2 py-0.5 rounded-full">vous</span>' : ''}
        </td>

        <!-- Rank -->
        <td>
          <img src="/static/images/ranks/${rankImg}"
               alt="Rank" class="w-12 h-12 object-contain" />
        </td>

        <!-- Points -->
        <td class="pr-6 text-right font-semibold text-pink-400">
          ${u.points.toLocaleString()} pts
        </td>
      </tr>`
    }).join('')
  })
}


export function loadActivity () {
  const box = document.getElementById('activity-feed')
  if (!box) return
  box.innerHTML = `
    <p><span class="text-white font-medium">Coach&nbsp;Lucy</span>
       posted a new <span class="text-pink-400 font-semibold">HIIT&nbsp;Plan</span></p>
    <p><span class="text-white font-medium">Gayar</span>
       hit <span class="text-pink-400 font-semibold">+50&nbsp;pts</span> on deadlifts</p>`
}
