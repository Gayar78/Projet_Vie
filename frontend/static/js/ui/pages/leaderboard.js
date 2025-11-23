/* frontend/static/js/ui/pages/leaderboard.js */
import { api } from '../../core/api.js'

// 1. DÉFINITION DES COULEURS
export const RANK_COLORS = {
  'fer': '#9ca3af', 'bronze': '#d97706', 'argent': '#e5e7eb', 'or': '#fbbf24',
  'platine': '#2dd4bf', 'emeraude': '#10b981', 'diamant': '#3b82f6',
  'maitre': '#a855f7', 'grandmaitre': '#ef4444', 'challenger': '#facc15'
};

// 2. CONSTANTES DE CALCUL (Basées sur le Backend)
const POINTS_PER_EXO = 650; // Score Elite par exercice
const MAX_POINTS = {
    global: 10000,
    muscu:  POINTS_PER_EXO * 8, // 5200 pts
    street: POINTS_PER_EXO * 5, // 3250 pts
    cardio: POINTS_PER_EXO * 3, // 1950 pts
    exo:    POINTS_PER_EXO      // 650 pts
};

// Helper pour la couleur
export function getRankColor(rankName) {
    const key = rankName.toLowerCase().replace('â', 'a').replace('ê', 'e').replace('î', 'i').replace(' ', ''); 
    if(key.includes('fer')) return RANK_COLORS['fer'];
    if(key.includes('bronze')) return RANK_COLORS['bronze'];
    if(key.includes('argent')) return RANK_COLORS['argent'];
    if(key.includes('or')) return RANK_COLORS['or'];
    if(key.includes('platine')) return RANK_COLORS['platine'];
    if(key.includes('emeraude')) return RANK_COLORS['emeraude'];
    if(key.includes('diamant')) return RANK_COLORS['diamant'];
    if(key.includes('grand')) return RANK_COLORS['grandmaitre'];
    if(key.includes('maitre')) return RANK_COLORS['maitre'];
    if(key.includes('challenger')) return RANK_COLORS['challenger'];
    return '#ffffff';
}

// 3. NOUVELLE LOGIQUE DE RANG CONTEXTUEL
export function rankFromPoints(score, contextMax = 10000) {
    const normalizedScore = (score / contextMax) * 10000;

    if (normalizedScore < 1500) return 'Fer';
    if (normalizedScore < 3500) return 'Bronze';
    if (normalizedScore < 5500) return 'Argent';
    if (normalizedScore < 7500) return 'Or';
    if (normalizedScore < 8700) return 'Platine';
    if (normalizedScore < 9300) return 'Émeraude';
    if (normalizedScore < 9700) return 'Diamant';
    if (normalizedScore < 9850) return 'Maître';
    if (normalizedScore < 9950) return 'Grand Maître';
    return 'Challenger';
}

export const categories = {
  general: { label: 'Général', sub: [{ value: 'general', label: 'Général' }] },
  muscu: {
    label: 'Musculation',
    sub: [
      { value: 'total',          label: 'Total' },
      { value: 'bench',          label: 'Développé Couché' },
      { value: 'overhead_press', label: 'Développé Militaire' },
      { value: 'dumbbell_press', label: 'Développé Haltères' },
      { value: 'squat',          label: 'Squat' },
      { value: 'deadlift',       label: 'Soulevé de Terre' },
      { value: 'pull_vertical',  label: 'Tirage Vertical' },
      { value: 'pull_horizontal',label: 'Tirage Horizontal' },
      { value: 'curls',          label: 'Curls' }
    ]
  },
  street: {
    label: 'Street Workout',
    sub: [
      { value: 'total',           label: 'Total' },
      { value: 'weighted_pullup', label: 'Traction Lestée' },
      { value: 'weighted_dip',    label: 'Dips Lestés' },
      { value: 'front_lever',     label: 'Front Lever' },
      { value: 'full_planche',    label: 'Full Planche' },
      { value: 'human_flag',      label: 'Drapeau Humain' },
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

export default function leaderboardPage () {
  return /* html */`
<section class="page-enter relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col items-center text-white">
  
  <div class="mt-20 mb-12 text-center">
      <h1 class="text-5xl md:text-7xl font-black tracking-tight mb-4">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-pink-500 filter drop-shadow-lg">
            LEADERBOARD
        </span>
      </h1>
      <p class="text-gray-400 text-lg max-w-xl mx-auto">
        Comparez vos performances. Le rang s'adapte à la discipline affichée.
      </p>
  </div>

  <!-- Filtres -->
  <div class="flex flex-wrap justify-center gap-4 mb-10 relative z-20">
    ${['gender', 'cat','metric'].map(t=>`
      <div id="${t}-dd" class="relative group">
        <button id="${t}-btn" type="button" 
                class="flex items-center gap-3 pl-6 pr-5 py-3 rounded-full 
                       bg-black/30 border border-white/10 hover:border-pink-500/50 
                       backdrop-blur-md shadow-lg transition-all duration-300
                       group-hover:shadow-pink-500/20">
          <span id="${t}-label" class="font-bold text-sm uppercase tracking-wider text-gray-200">Loading…</span>
          <svg class="w-4 h-4 text-pink-500 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.08l3.71-3.85a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
        </button>
        <div id="${t}-menu" 
             class="absolute left-1/2 -translate-x-1/2 mt-4 w-60 origin-top 
                    bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 
                    rounded-xl shadow-2xl shadow-black/50 
                    opacity-0 scale-95 pointer-events-none transition-all duration-200 z-50 overflow-hidden">
        </div>
      </div>`).join('')}
  </div>

  <!-- Layout Grille -->
  <div class="w-full max-w-7xl grid lg:grid-cols-[1fr_320px] gap-8">
    
    <!-- TABLEAU -->
    <div class="liquid-glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.00">
        
        <div class="grid grid-cols-[60px_1fr_120px_120px] gap-4 px-6 py-5 border-b border-white/5 bg-black/20 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div class="text-center">#</div>
            <div>Athlète</div>
            <div class="text-center">Rang</div>
            <div class="text-right">Score</div>
        </div>

        <div id="lb-wrapper" class="overflow-y-auto scrollbar-hide flex-1 p-2">
            <table class="w-full border-collapse">
                <tbody id="leaderboard-body" class="text-sm"></tbody>
            </table>
        </div>
    </div>

    <!-- SIDE PANEL -->
    <div class="flex flex-col gap-6">
      <div class="liquid-glass-card p-6 rounded-2xl space-y-4"
           data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.02">
        
        <!-- ICONE INFO MODIFIÉE -->
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Info
        </h3>
        
        <div id="activity-feed" class="space-y-3 text-sm text-gray-400 leading-relaxed"></div>
      </div>
    </div>

  </div>
</section>`
}

/* LOGIQUE FILTRES */
const show = m => { m.classList.remove('opacity-0','scale-95','pointer-events-none'); m.classList.add('opacity-100','scale-100'); m.previousElementSibling.querySelector('svg')?.classList.add('rotate-180'); }
const hide = m => { m.classList.add('opacity-0','scale-95','pointer-events-none'); m.classList.remove('opacity-100','scale-100'); m.previousElementSibling.querySelector('svg')?.classList.remove('rotate-180'); }

export function initLeaderboardFilters () {
  const genderBtn = document.getElementById('gender-btn'), genderLab = document.getElementById('gender-label'), genderMenu = document.getElementById('gender-menu');
  const catBtn = document.getElementById('cat-btn'), catLab = document.getElementById('cat-label'), catMenu = document.getElementById('cat-menu');
  const metBtn = document.getElementById('metric-btn'), metLab = document.getElementById('metric-label'), metMenu = document.getElementById('metric-menu');

  if (!catBtn) return;

  let currentGender = 'all', currentCat = 'general', currentMet = 'general';
  const genders = { all: 'Mixte', M: 'Hommes', F: 'Femmes' };
  const itemClass = "block px-6 py-3 text-sm text-gray-300 hover:bg-pink-500/10 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0";
  
  genderMenu.innerHTML = Object.entries(genders).map(([k,v])=>`<div data-gender="${k}" class="${itemClass}">${v}</div>`).join('');
  catMenu.innerHTML = Object.entries(categories).map(([k,c])=>`<div data-cat="${k}" class="${itemClass}">${c.label}</div>`).join('');
  const fillMetric = catKey => { metMenu.innerHTML = categories[catKey].sub.map(s=>`<div data-met="${s.value}" class="${itemClass}">${s.label}</div>`).join(''); }
  
  genderLab.textContent = genders[currentGender]; catLab.textContent = categories[currentCat].label; metLab.textContent = categories[currentCat].sub[0].label; fillMetric(currentCat);

  const toggle = (btn,menu)=>{
    const isOpen = menu.classList.contains('opacity-100');
    if (isOpen) hide(menu); else { show(menu); [genderMenu, catMenu, metMenu].forEach(m => { if (m !== menu) hide(m); }); }
    setTimeout(()=>{const away=e=>{if(!menu.contains(e.target)&& !btn.contains(e.target)){hide(menu); document.removeEventListener('click',away)}}; document.addEventListener('click',away)},0)
  }
  
  genderBtn.onclick = () => toggle(genderBtn, genderMenu); catBtn.onclick = () => toggle(catBtn,catMenu); metBtn.onclick = () => toggle(metBtn,metMenu);
  const triggerLoad = () => loadLeaderboard(currentGender, currentCat, currentMet);

  genderMenu.onclick = e=>{ const a=e.target.closest('[data-gender]'); if(!a) return; currentGender = a.dataset.gender; genderLab.textContent = genders[currentGender]; hide(genderMenu); triggerLoad(); }
  catMenu.onclick = e=>{ const a=e.target.closest('[data-cat]'); if(!a) return; currentCat=a.dataset.cat; catLab.textContent=categories[currentCat].label; hide(catMenu); currentMet=categories[currentCat].sub[0].value; metLab.textContent=categories[currentCat].sub[0].label; fillMetric(currentCat); triggerLoad(); }
  metMenu.onclick = e=>{ const a=e.target.closest('[data-met]'); if(!a) return; currentMet=a.dataset.met; metLab.textContent=categories[currentCat].sub.find(s=>s.value===currentMet).label; hide(metMenu); triggerLoad(); }
}

/* CHARGEMENT TABLEAU */
export async function loadLeaderboard (gender = 'all', cat='general', metric='general') {
  const myId = localStorage.getItem('userId')
  const tbody = document.getElementById('leaderboard-body')
  if (!tbody) return

  // Skeletons
  tbody.innerHTML = Array(6).fill(0).map(() => `<tr class="border-b border-white/5"><td class="py-4 pl-4"><div class="skeleton w-8 h-8 rounded-lg mx-auto"></div></td><td class="py-3 flex items-center gap-4"><div class="skeleton w-10 h-10 rounded-full"></div><div class="flex flex-col gap-2"><div class="skeleton w-32 h-3 rounded"></div><div class="skeleton w-16 h-2 rounded"></div></div></td><td><div class="skeleton w-16 h-4 mx-auto rounded"></div></td><td class="pr-6"><div class="skeleton w-16 h-4 ml-auto rounded"></div></td></tr>`).join('');

  try {
    const { list } = await api(`/leaderboard?gender=${gender}&cat=${cat}&metric=${metric}`, null, 'GET')
    if (!Array.isArray(list)) throw new Error('Bad payload')
    list.sort((a,b)=>b.points-a.points)
    
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-gray-500">Aucun athlète classé pour le moment.</td></tr>`; return; }

    // 4. DÉTERMINATION DU PLAFOND DE POINTS (CONTEXTE)
    let contextMax = MAX_POINTS.global; // Par défaut 10000
    
    if (cat !== 'general') {
        if (metric === 'total') {
            // Si on regarde le total d'une discipline (Muscu, Street, Cardio)
            contextMax = MAX_POINTS[cat] || 10000;
        } else {
            // Si on regarde un exercice spécifique (Bench, Run...)
            contextMax = MAX_POINTS.exo; // 650 pts
        }
    }

    tbody.innerHTML = list.map((u,i)=> {
        // 5. CALCUL DU RANG CONTEXTUEL
        const rankName = rankFromPoints(u.points, contextMax);
        const rankColor = getRankColor(rankName);

        let rankSlug = rankName.toLowerCase().replace(' ', '').replace('é', 'e').replace('è', 'e').replace('â', 'a').replace('î', 'i');
        if(rankSlug.includes('grand')) rankSlug = 'grandmaster';
        else if(rankSlug.includes('maitre')) rankSlug = 'master';

        return `
      <tr data-id="${u.id}" 
          class="group transition-all duration-200 hover:bg-white/5 
                 ${u.id===myId ? 'bg-pink-500/10 border-l-2 border-pink-500' : 'border-b border-white/5 last:border-0'}">
        <td class="py-4 pl-4">
          <div class="w-8 h-8 mx-auto flex items-center justify-center rounded-lg font-bold text-sm ${i===0?'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-lg': i===1?'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg': i===2?'bg-gradient-to-br from-orange-300 to-orange-600 text-black shadow-lg':'text-gray-500 bg-white/5'}">${i+1}</div>
        </td>
        <td class="py-3">
          <a href="/user/${u.id}" data-link class="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
            <img src="${u.photoURL || '/static/images/ranks/rank.png'}" class="w-10 h-10 rounded-full object-cover ring-2 ${u.id===myId?'ring-pink-500':'ring-transparent group-hover:ring-white/20'} transition-all"/>
            <div class="flex flex-col">
                <span class="font-semibold text-gray-200 group-hover:text-white truncate max-w-[140px] sm:max-w-[200px]">${u.displayName || 'Athlète'}</span>
                ${u.id===myId ? `<span class="text-[10px] text-pink-400 font-bold uppercase tracking-wider">C'est vous</span>` : ''}
            </div>
          </a>
        </td>
        <td class="text-center">
          <div class="flex flex-col items-center justify-center">
             <img src="/static/images/ranks/${rankSlug}.png" class="rank-icon w-8 h-8 object-contain opacity-90 group-hover:opacity-100" style="--rank-color: ${rankColor};" onerror="this.style.display='none'">
             <span class="text-[10px] uppercase font-bold tracking-wide mt-1" style="color:${rankColor}">${rankName}</span>
          </div>
        </td>
        <td class="pr-6 text-right">
          <span class="font-mono font-bold text-lg text-white tracking-tight">${u.points.toLocaleString()}</span>
          <span class="text-xs text-gray-500 ml-1">pts</span>
        </td>
      </tr>`}).join('')
  } catch (err) { tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-red-400">Erreur de connexion.</td></tr>` }
  const wrapper = document.getElementById('lb-wrapper'); const myRow = tbody.querySelector(`[data-id="${myId}"]`); if (wrapper && myRow) setTimeout(() => myRow.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}
export function loadActivity () { document.getElementById('activity-feed').innerHTML = `<p>1. Le rang s'adapte à la catégorie choisie.</p><p>2. Cliquez sur un athlète pour voir ses stats.</p><p>3. Votre ligne est surlignée.</p>`; }