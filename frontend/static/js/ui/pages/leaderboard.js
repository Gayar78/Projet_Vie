// -----------------------------------------------------------------------------
// Leaderboard page – filtres dynamiques + appel /leaderboard?cat=…&metric=…
// ─> Le backend renvoie maintenant { list, catMax }
// -----------------------------------------------------------------------------
import { api } from '../../core/api.js'

/*──────────────────────── 1. Mapping catégories / metrics ───────────────────*/
export const categories = {
  general: { label: 'Général', sub: [{ value: 'general', label: 'Général' }] },

  muscu: {
    label: 'Musculation',
    sub: [
      { value: 'total',           label: 'Total'            },
      { value: 'bench',           label: 'Développé couché' },
      { value: 'squat',           label: 'Squat'            },
      { value: 'deadlift',        label: 'Soulevé de terre' },
      { value: 'overhead_press',  label: 'Développé militaire' },
      { value: 'vertical_row',    label: 'Tirage vertical'  }
    ]
  },

  street: {
    label: 'Street Work Out',
    sub: [
      { value: 'total',           label: 'Total'           },
      { value: 'weighted_pullup', label: 'Traction lestée' },
      { value: 'weighted_dip',    label: 'Dips lestés'     },
      { value: 'front_lever',     label: 'Front lever'     },
      { value: 'full_planche',    label: 'Full planche'    },
      { value: 'human_flag',      label: 'Drapeau humain'  },
    ]
  },

  cardio: {
    label: 'Cardio',
    sub: [
      { value: 'total', label: 'Total'         },
      { value: 'run',   label: 'Course à pied' },
      { value: 'bike',  label: 'Vélo'          },
      { value: 'rope',  label: 'Corde à sauter'}
    ]
  }
}

/*──────────────────────── 2. Markup principal ───────────────────────────────*/
export default function leaderboardPage () {
  return /* html */`
<section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col
                 items-center text-white bg-cover bg-center">
  <div id="hero-bg" class="fixed inset-0 -z-10"></div>

  <h1 class="mt-24 text-5xl md:text-6xl font-extrabold text-center">
    <span class="bg-gradient-to-r from-pink-500 to-purple-500
                 bg-clip-text text-transparent">Leader&nbsp;Board</span>
  </h1>

  <p class="mt-4 mb-12 text-center text-gray-300 max-w-2xl">
    Follow the strongest athletes and latest community feats in real time.
  </p>

  <!-- Filtres Cat / Metric -->
  <div class="flex flex-wrap gap-6 items-center mb-8 relative z-20">
    ${['cat','metric'].map(t=>`
      <div id="${t}-dd" class="relative">
        <button id="${t}-btn" type="button"
          class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                 bg-white/5 hover:bg-white/10 border border-white/20">
          <span id="${t}-label" class="font-semibold">Loading…</span>
          <svg class="w-4 h-4 opacity-70 transition-transform"
               xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
               fill="currentColor"><path fill-rule="evenodd"
               d="M5.23 7.21a.75.75 0 011.06.02L10 11.08l3.71-3.85a.75.75
                  0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75
                  0 01.02-1.06z" clip-rule="evenodd"/></svg>
        </button>
        <div id="${t}-menu"
          class="absolute left-0 mt-3 w-56 origin-top-left rounded-lg
                 bg-[#20202e] border border-white/15 shadow-lg opacity-0
                 scale-95 pointer-events-none transition-[opacity,transform]
                 duration-150 ease-out z-40"></div>
      </div>`).join('')}
  </div>

  <!-- Tableau + bloc activité -->
  <div class="w-full max-w-6xl grid md:grid-cols-[1fr_340px] gap-10">

    <!-- Tableau -->
    <table class="w-full text-left backdrop-blur-md bg-white/5 border
                  border-white/10 rounded-2xl overflow-hidden">
      <thead class="uppercase text-xs text-gray-400 tracking-wider">
        <tr class="border-b border-white/10">
          <th class="py-4 pl-6">#</th><th>Athlète</th><th>Rang</th>
          <th class="pr-6 text-right">Points</th>
        </tr>
      </thead>
      <tbody id="leaderboard-body"></tbody>
    </table>

    <!-- Activity mock -->
    <div class="relative">
      <div class="flex flex-col gap-4 p-6 rounded-2xl bg-white/5
                  backdrop-blur-md border border-white/10
                  before:content-[''] before:absolute before:inset-0
                  before:rounded-2xl before:bg-gradient-to-br
                  before:from-pink-500 before:to-purple-600
                  before:opacity-20 before:-z-10">
        <h3 class="text-lg font-semibold">Recent Activity</h3>
        <div id="activity-feed"
             class="space-y-2 text-sm text-gray-300"></div>
      </div>
    </div>
  </div>
</section>`
}

/*──────────────────────── 3. Helpers show / hide menu ───────────────────────*/
const show = m => { m.classList.remove('opacity-0','scale-95','pointer-events-none')
                    m.classList.add('opacity-100','scale-100')
                    m.previousElementSibling.querySelector('svg')
                     ?.classList.add('rotate-180') }

const hide = m => { m.classList.add('opacity-0','scale-95','pointer-events-none')
                    m.classList.remove('opacity-100','scale-100')
                    m.previousElementSibling.querySelector('svg')
                     ?.classList.remove('rotate-180') }

/*──────────────────────── 4. Init filtres + 1er chargement ─────────────────*/
export function initLeaderboardFilters () {
  const catBtn  = document.getElementById('cat-btn')
  const catLab  = document.getElementById('cat-label')
  const catMenu = document.getElementById('cat-menu')

  const metBtn  = document.getElementById('metric-btn')
  const metLab  = document.getElementById('metric-label')
  const metMenu = document.getElementById('metric-menu')

  let currentCat = 'general'
  let currentMet = 'general'

  /* construit menu Cat */
  catMenu.innerHTML = Object.entries(categories).map(
    ([k,c])=>`<a href="#" data-cat="${k}"
               class="block px-5 py-3 text-sm hover:bg-white/5">${c.label}</a>`
  ).join('')

  /* remplit menu Metric selon Cat */
  const fillMetric = catKey => {
    metMenu.innerHTML = categories[catKey].sub.map(
      s=>`<a href="#" data-met="${s.value}"
             class="block px-5 py-3 text-sm hover:bg-white/5">${s.label}</a>`
    ).join('')
  }
  fillMetric(currentCat)
  catLab.textContent = categories[currentCat].label
  metLab.textContent = categories[currentCat].sub[0].label

  /* toggle générique */
  const toggle = (btn,menu)=>{
    (menu.classList.contains('opacity-100')?hide:show)(menu)
    setTimeout(()=>{const away=e=>{
      if(!menu.contains(e.target)&&e.target!==btn){
        hide(menu); document.removeEventListener('click',away)}
    }; document.addEventListener('click',away)},0)
  }
  catBtn.onclick = ()=>toggle(catBtn,catMenu)
  metBtn.onclick = ()=>toggle(metBtn,metMenu)

  /* click Cat */
  catMenu.onclick = e=>{
    const a=e.target.closest('[data-cat]'); if(!a) return; e.preventDefault()
    currentCat=a.dataset.cat
    catLab.textContent=categories[currentCat].label
    hide(catMenu)
    currentMet=categories[currentCat].sub[0].value
    metLab.textContent=categories[currentCat].sub[0].label
    fillMetric(currentCat)
    loadLeaderboard(currentCat,currentMet)
  }

  /* click Metric */
  metMenu.onclick = e=>{
    const a=e.target.closest('[data-met]'); if(!a) return; e.preventDefault()
    currentMet=a.dataset.met
    metLab.textContent=categories[currentCat].sub.find(s=>s.value===currentMet).label
    hide(metMenu)
    loadLeaderboard(currentCat,currentMet)
  }

  /* premier tableau */
  loadLeaderboard(currentCat,currentMet)
}

/*──────────────────────── 5. Chargement + rendu tableau ────────────────────*/
export async function loadLeaderboard (cat='general', metric='general') {
  const myId = localStorage.getItem('userId')
  const tbody = document.getElementById('leaderboard-body')
  if (!tbody) return

  try {
    const { list, catMax } =
      await api(`/leaderboard?cat=${cat}&metric=${metric}`, null, 'GET')

    /* sécurité JSON */
    if (!Array.isArray(list)) throw new Error('Bad payload')

    list.sort((a,b)=>b.points-a.points)

    tbody.innerHTML = list.map((u,i)=>`
      <tr class="${u.id===myId
                   ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 ring-1 ring-pink-400/60'
                   : 'group hover:bg-white/5'} border-b border-white/10">

        <td class="py-3 pl-6">
          <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
            ${i===0?'bg-yellow-400 text-black':
              i===1?'bg-gray-300 text-black':
              i===2?'bg-orange-500':'bg-white/10'}">${i+1}</div>
        </td>

        <td class="font-medium ${u.id===myId?'text-white':''}">
          ${u.displayName || u.email || '—'}
          ${u.id===myId?'<span class="ml-2 text-xs bg-pink-500 px-2 py-0.5 rounded-full">vous</span>':''}
        </td>

        <td>
          <img src="/static/images/ranks/${[
            'iron','bronze','silver','gold','platinium',
            'emeraude','diamond','master','grandmaster','challenger'
          ][(u.rank ?? 0) - 1]}.png"
               class="w-12 h-12 object-contain">
        </td>

        <td class="pr-6 text-right font-semibold text-pink-400">
          ${u.points.toLocaleString()} pts
        </td>
      </tr>`).join('')
  } catch (err) {
    console.error(err)
    tbody.innerHTML =
      `<tr><td colspan="4" class="p-6 text-center text-gray-400">
         Erreur de chargement</td></tr>`
  }
}

/*──────────────────────── 6. Activity mock ────────────────────────────────*/
export function loadActivity () {
  const box = document.getElementById('activity-feed')
  if (!box) return
  box.innerHTML = `
    <p><span class="text-white font-medium">Coach&nbsp;Lucy</span>
       posted a new <span class="text-pink-400 font-semibold">HIIT&nbsp;Plan</span></p>
    <p><span class="text-white font-medium">Gayar</span>
       hit <span class="text-pink-400 font-semibold">+50&nbsp;pts</span> on deadlifts</p>`
}

/*──────────────────────── 7. Bootstrap DOM (si page chargée directement) ──*/
document.addEventListener('DOMContentLoaded', () => {
  initLeaderboardFilters()
  loadActivity()
})
