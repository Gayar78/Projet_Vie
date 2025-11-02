// -----------------------------------------------------------------------------
// Leaderboard page – filtres dynamiques + appel /leaderboard?cat=…&metric=…
// ─> Le backend renvoie maintenant { list, catMax }
// -----------------------------------------------------------------------------
import { api } from '../../core/api.js'

/*──────────────────────── 0. Helper rank → nom d’image ───────────────*/
export function rankFromPoints (score, max = 10_000) {
  /* calcule un index 0‑9 proportionnel au plafond `max` puis renvoie le slug */
  const idx = Math.min(9, Math.floor((score / max) * 10))
  return [
    'iron', 'bronze', 'silver', 'gold', 'platinium',
    'emeraude', 'diamond', 'master', 'grandmaster', 'challenger'
  ][idx]
}

/*──────────────────────── 1. Mapping catégories / metrics ───────────────────*/
export const categories = {
  general: { label: 'Général', sub: [{ value: 'general', label: 'Général' }] },

  muscu: {
    label: 'Musculation',
    sub: [
      { value: 'total',          label: 'Total' },
      { value: 'bench',          label: 'Développé couché' },
      { value: 'squat',          label: 'Squat' },
      { value: 'deadlift',       label: 'Soulevé de terre' },
      { value: 'overhead_press', label: 'Développé militaire' },
      { value: 'vertical_row',   label: 'Tirage vertical' }
    ]
  },

  street: {
    label: 'Street Work Out',
    sub: [
      { value: 'total',           label: 'Total' },
      { value: 'weighted_pullup', label: 'Traction lestée' },
      { value: 'weighted_dip',    label: 'Dips lestés' },
      { value: 'front_lever',     label: 'Front lever' },
      { value: 'full_planche',    label: 'Full planche' },
      { value: 'human_flag',      label: 'Drapeau humain' },
    ]
  },

  cardio: {
    label: 'Cardio',
    sub: [
      { value: 'total', label: 'Total' },
      { value: 'run',   label: 'Course à pied' },
      { value: 'bike',  label: 'Vélo' },
      { value: 'rope',  label: 'Corde à sauter'}
    ]
  }
}

/*──────────────────────── 2. Markup principal ───────────────────────────────*/
export default function leaderboardPage () {
  return /* html */`
<section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col
              items-center text-gray-900 bg-cover bg-center">
  
  <h1 class="mt-24 text-5xl md:text-6xl font-extrabold text-center">
    <span class="bg-gradient-to-r from-pink-500 to-purple-500
                 bg-clip-text text-transparent">Leader&nbsp;Board</span>
  </h1>

  <p class="mt-4 mb-12 text-center text-gray-700 max-w-2xl">
    Follow the strongest athletes and latest community feats in real time.
  </p>

  <!-- Filtres Cat / Metric -->
  <div class="flex flex-wrap gap-6 items-center mb-8 relative z-20">
    ${['cat','metric'].map(t=>`
      <div id="${t}-dd" class="relative">
        <button id="${t}-btn" type="button"
          class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl 
                 border border-white/20 shadow-lg
                 hover:bg-white/90 transition-all duration-150">
          <span id="${t}-label" class="font-semibold text-gray-900">Loading…</span>
          <svg class="w-4 h-4 opacity-70 transition-transform"
               xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
               fill="currentColor"><path fill-rule="evenodd"
               d="M5.23 7.21a.75.75 0 011.06.02L10 11.08l3.71-3.85a.75.75
                  0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75
                  0 01.02-1.06z" clip-rule="evenodd"/></svg>
        </button>
        <div id="${t}-menu"
          class="absolute left-0 mt-3 w-56 origin-top-left rounded-lg
                 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-lg
                 opacity-0 scale-95 pointer-events-none transition-[opacity,transform]
                 duration-150 ease-out z-40"></div>
      </div>`).join('')}
  </div>

  <!-- Tableau + bloc activité -->
  <div class="w-full max-w-6xl grid md:grid-cols-[1fr_340px] gap-10">

    <!-- MODIFIÉ : Le wrapper a maintenant le style "glass" de la nav-bar -->
    <div id="lb-wrapper"
         class="overflow-y-auto scrollbar-hide max-h-[530px]
                bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl 
                border border-white/20 shadow-lg rounded-2xl">
      
      <!-- MODIFIÉ : Le tableau est simple et transparent -->
      <table class="w-full text-left">
        <thead class="uppercase text-xs text-gray-600 tracking-wider">
          <!-- MODIFIÉ : Bordure plus subtile pour le thème clair -->
          <tr class="border-b border-black/10">
            <th class="py-4 pl-6">#</th>
            <th>Athlète</th>
            <th>Rang</th>
            <th class="pr-6 text-right">Points</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body"></tbody>
      </table>
    </div>

    <!-- Activity mock -->
    <div class="relative">
      <!-- MODIFIÉ : Panneau "Glass" unifié -->
      <div class="flex flex-col gap-4 p-6 rounded-2xl liquid-glass-card
                  before:content-[''] before:absolute before:inset-0
                  before:rounded-2xl before:bg-gradient-to-br
                  before:from-pink-500/20 before:to-purple-500/20
                  before:opacity-20 before:-z-10">
        <h3 class="text-lg font-semibold text-gray-900">À propos du classement</h3>
        <div id="activity-feed"
             class="space-y-2 text-sm text-gray-700"></div>
      </div>
    </div>
  </div>
</section>`
}

/*──────────────────────── 3. Helpers show / hide menu ───────────────────────*/
const show = m => { 
  m.classList.remove('opacity-0','scale-95','pointer-events-none');
  m.classList.add('opacity-100','scale-100', 'animate-spring-in');
  m.previousElementSibling.querySelector('svg')?.classList.add('rotate-180');
}

const hide = m => { 
  m.classList.add('opacity-0','scale-95','pointer-events-none');
  m.classList.remove('opacity-100','scale-100', 'animate-spring-in');
  m.previousElementSibling.querySelector('svg')?.classList.remove('rotate-180');
}

/*──────────────────────── 4. Init filtres + 1er chargement ─────────────────*/
export function initLeaderboardFilters () {
  const catBtn  = document.getElementById('cat-btn')
  const catLab  = document.getElementById('cat-label')
  const catMenu = document.getElementById('cat-menu')

  const metBtn  = document.getElementById('metric-btn')
  const metLab  = document.getElementById('metric-label')
  const metMenu = document.getElementById('metric-menu')

  if (!catBtn) return; // Sécurité

  let currentCat = 'general'
  let currentMet = 'general'

  /* construit menu Cat */
  catMenu.innerHTML = Object.entries(categories).map(
    ([k,c])=>`<a href="#" data-cat="${k}"
              class="block px-5 py-3 text-sm text-gray-900 hover:bg-white/50">${c.label}</a>`
  ).join('')

  /* remplit menu Metric selon Cat */
  const fillMetric = catKey => {
    metMenu.innerHTML = categories[catKey].sub.map(
      s=>`<a href="#" data-met="${s.value}"
            class="block px-5 py-3 text-sm text-gray-900 hover:bg-white/50">${s.label}</a>`
    ).join('')
  }
  fillMetric(currentCat)
  catLab.textContent = categories[currentCat].label
  metLab.textContent = categories[currentCat].sub[0].label

  /* toggle générique */
  const toggle = (btn,menu)=>{
    const isOpen = menu.classList.contains('opacity-100');
    if (isOpen) {
      hide(menu);
    } else {
      show(menu);
      if (menu === catMenu) hide(metMenu);
      if (menu === metMenu) hide(catMenu);
    }
    
    setTimeout(()=>{const away=e=>{
      if(!menu.contains(e.target)&& !btn.contains(e.target)){
        hide(menu); document.removeEventListener('click',away)}
    }; document.addEventListener('click',away)},0)
  }
  
  catBtn.onclick = () => toggle(catBtn,catMenu)
  metBtn.onclick = () => toggle(metBtn,metMenu)

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
}

/*──────────────────────── 5. Chargement + rendu tableau ────────────────────*/
export async function loadLeaderboard (cat='general', metric='general') {
  const myId = localStorage.getItem('userId')
  const tbody = document.getElementById('leaderboard-body')
  if (!tbody) return

  try {
    tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-600">Chargement...</td></tr>`;
    const { list } =
      await api(`/leaderboard?cat=${cat}&metric=${metric}`, null, 'GET')

    if (!Array.isArray(list)) throw new Error('Bad payload')

    list.sort((a,b)=>b.points-a.points)

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-gray-600">Aucun score pour cette catégorie.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((u,i)=>`
      <!-- MODIFIÉ : Ligne "Glass" simplifiée -->
      <tr data-id="${u.id}"
          class="${u.id===myId ? 'bg-pink-500/10' : 'group hover:bg-black/5'} 
                 border-b border-black/5 transition-colors duration-150">

        <td class="py-3 pl-6">
          <!-- MODIFIÉ : Style 4ème+ place -->
          <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
            ${i===0?'bg-yellow-400 text-black':
              i===1?'bg-gray-300 text-black':
              i===2?'bg-orange-500 text-white':'bg-gray-200 text-gray-700'}">
            ${i+1}
          </div>
        </td>

        <td class="font-medium py-2">
          <a href="/user/${u.id}" data-link 
             class="flex items-center gap-3 group-hover:text-gray-900 ${u.id===myId?'text-pink-500':'text-gray-800'}">
            
            <img 
              src="${u.photoURL || '/static/images/ranks/rank.png'}" 
              alt="${u.displayName}"
              class="w-10 h-10 rounded-full object-cover"
            />
            
            <span class="hover:underline">
              ${u.displayName || u.email || '—'}
            </span>
            
            <!-- MODIFIÉ : Couleur "vous" -->
            ${u.id===myId?`<span class="ml-2 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">vous</span>`:''}
          </a>
        </td>

        <td>
          <img src="/static/images/ranks/${[
            'iron','bronze','silver','gold','platinium',
            'emeraude','diamond','master','grandmaster','challenger'
          ][(u.rank ?? 1) - 1]}.png"
               class="w-12 h-12 object-contain">
        </td>

        <td class="pr-6 text-right font-semibold text-pink-500">
          ${u.points.toLocaleString()} pts
        </td>
      </tr>`).join('')
  } catch (err) {
    console.error(err)
    tbody.innerHTML =
      `<tr><td colspan="4" class="p-6 text-center text-red-500">
         Erreur de chargement. Le backend est-il lancé ?
       </td></tr>`
  }

  /* ── Auto-scroll vers ma ligne ─────────────────────────── */
    const wrapper = document.getElementById('lb-wrapper')
    const myRow   = tbody.querySelector(`[data-id="${myId}"]`)
    if (wrapper && myRow) {
      const offset = myRow.offsetTop
                     - wrapper.clientHeight / 2
                     + myRow.clientHeight / 2
      wrapper.scrollTo({ top: Math.max(offset, 0), behavior: 'instant' })
    } else {
      wrapper?.scrollTo({ top: 0 })
    }
}

/*──────────────────────── 6. Activity mock ────────────────────────────────*/
export function loadActivity () {
  const box = document.getElementById('activity-feed')
  if (!box) return

  /* MODIFIÉ : Texte sombre */
  box.innerHTML = `
    <p><strong class="text-gray-900">1.</strong> Sélectionnez une <span class="text-pink-500 font-semibold">discipline</span> puis un <span class="text-pink-500 font-semibold">exercice</span>.</p>
    <p><strong class="text-gray-900">2.</strong> Seuls les athlètes ayant au moins 1&nbsp;point apparaissent dans le tableau.</p>
    <p><strong class="text-gray-900">3.</strong> Les rangs vont de <span class="font-semibold">Fer</span> à <span class="font-semibold">Challenger</span></p>
    <p><strong class="text-gray-900">4.</strong> Vos propres lignes sont automatiquement surlignées.</p>`
}

