/* frontend/static/js/ui/pages/profile/contrib.js */
import { getIdToken } from '../../../auth.js';

// CONFIGURATION DES INPUTS REQUIS PAR EXERCICE
const PERFORMANCE_BAREME = {
    // Muscu
    "bench": { "inputs": ["weight", "reps"] },
    "overhead_press": { "inputs": ["weight", "reps"] },
    "dumbbell_press": { "inputs": ["weight", "reps"] },
    "squat": { "inputs": ["weight", "reps"] },
    "deadlift": { "inputs": ["weight", "reps"] },
    "pull_vertical": { "inputs": ["weight", "reps"] },
    "pull_horizontal": { "inputs": ["weight", "reps"] },
    "curls": { "inputs": ["weight", "reps"] },

    // Street
    "weighted_pullup": { "inputs": ["weight", "reps"] },
    "weighted_dip": { "inputs": ["weight", "reps"] },
    "front_lever": { "inputs": ["time"] },
    "full_planche": { "inputs": ["time"] },
    "human_flag": { "inputs": ["time"] },

    // Cardio
    "run": { "inputs": ["distance", "time"] },
    "bike": { "inputs": ["distance", "time"] },
    "rope": { "inputs": ["reps", "time"] }, // Rope demande le nombre de sauts ET le temps pour calculer la cadence

    "default": { "inputs": ["message"] }
};

const CATEGORIES = {
  muscu: {
    label: 'Musculation',
    sub: {
      bench: 'Développé Couché', overhead_press: 'Développé Militaire', dumbbell_press: 'Développé Haltères',
      squat: 'Squat', deadlift: 'Soulevé de Terre',
      pull_vertical: 'Tirage Vertical', pull_horizontal: 'Tirage Horizontal', curls: 'Curls'
    },
  },
  street: {
    label: 'Street Workout',
    sub: {
      weighted_pullup: 'Traction Lestée', weighted_dip: 'Dips Lestés',
      front_lever: 'Front Lever', full_planche: 'Full Planche', human_flag: 'Human Flag'
    },
  },
  cardio: {
    label: 'Cardio',
    sub: { run: 'Course à pied', bike: 'Vélo', rope: 'Corde à sauter' },
  },
};

const catSlugs = Object.keys(CATEGORIES);
const subSlugs = cat => Object.keys(CATEGORIES[cat].sub);
const catLabel = slug => CATEGORIES[slug].label;
const subLabel = (cat, sub) => CATEGORIES[cat].sub[sub];

export default function contribPage () {
  const firstCat = catSlugs[0];
  const firstMet = subSlugs(firstCat)[0];

  return /* html */`
  <section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col items-center">
    
    <h1 class="mt-24 text-4xl md:text-6xl font-black text-white mb-12 tracking-tight text-center">
      NOUVELLE <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">PERF</span>
    </h1>

    <div class="flex flex-wrap justify-center gap-4 mb-10 relative z-20">
      ${['cat','met'].map(t=>`
        <div id="${t}-dd" class="relative group">
          <button id="${t}-btn" type="button" class="flex items-center gap-3 pl-6 pr-5 py-3 rounded-full bg-black/30 border border-white/10 hover:border-pink-500/50 backdrop-blur-md shadow-lg transition-all duration-300 group-hover:shadow-pink-500/20">
            <span id="${t}-label" class="font-bold text-sm uppercase tracking-wider text-gray-200">${t==='cat' ? catLabel(firstCat) : subLabel(firstCat, firstMet)}</span>
            <svg class="w-4 h-4 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.08l3.71-3.85a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div id="${t}-menu" class="absolute left-0 mt-3 w-60 origin-top-left rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 opacity-0 scale-95 pointer-events-none transition-all duration-200 z-50 overflow-hidden max-h-80 overflow-y-auto"></div>
        </div>`).join('')}
    </div>

    <form id="contrib-form" class="space-y-6 max-w-xl w-full liquid-glass-card p-8 rounded-2xl border-t border-white/10" data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">

      <label class="block">
        <span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Vidéo de preuve</span>
        <input type="file" id="file-input" accept="video/*" class="mt-3 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer" required>
      </label>

      <label class="block hidden" id="form-group-weight"><span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Poids (kg)</span><input type="number" step="0.5" id="input-weight" placeholder="0.0" class="mt-2 w-full px-4 py-3 rounded-lg"></label>
      <label class="block hidden" id="form-group-reps"><span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Répétitions</span><input type="number" id="input-reps" placeholder="0" class="mt-2 w-full px-4 py-3 rounded-lg"></label>
      <label class="block hidden" id="form-group-distance"><span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Distance (km)</span><input type="number" step="0.01" id="input-distance" placeholder="0.0" class="mt-2 w-full px-4 py-3 rounded-lg"></label>
      <label class="block hidden" id="form-group-time"><span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Temps (MM:SS)</span><input type="text" id="input-time" placeholder="00:00" class="mt-2 w-full px-4 py-3 rounded-lg"></label>
      <label class="block hidden" id="form-group-message"><span class="font-semibold text-gray-300 text-sm uppercase tracking-wide">Détails</span><textarea id="input-message" rows="3" class="mt-2 w-full px-4 py-3 rounded-lg"></textarea></label>

      <div class="pt-4 border-t border-white/10">
        <span class="block font-semibold text-gray-300 text-sm mb-3">Diffusion publique ?</span>
        <div class="flex gap-6">
            <label class="inline-flex items-center gap-2 cursor-pointer"><input type="radio" name="consent" id="consent-yes" value="yes" required class="text-pink-500 focus:ring-pink-500 bg-black/50 border-white/20"><span class="text-gray-300">Oui, je valide</span></label>
            <label class="inline-flex items-center gap-2 cursor-pointer"><input type="radio" name="consent" id="consent-no" value="no" class="text-pink-500 focus:ring-pink-500 bg-black/50 border-white/20"><span class="text-gray-300">Non</span></label>
        </div>
      </div>

      <button type="submit" class="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg tracking-wide shadow-lg shadow-pink-900/20 hover:scale-[1.02] transition-transform duration-200 active:scale-95 mt-4">Soumettre la performance</button>
      <p id="status" class="text-center text-sm mt-2 font-medium h-5"></p>
    </form>
  </section>`;
}

export function mount () {
  const catBtn = document.getElementById('cat-btn'), catLab = document.getElementById('cat-label'), catMenu = document.getElementById('cat-menu');
  const metBtn = document.getElementById('met-btn'), metLab = document.getElementById('met-label'), metMenu = document.getElementById('met-menu');
  if (!catBtn) return;

  let currentCat = catSlugs[0], currentMet = subSlugs(currentCat)[0];

  const showRelevantInputs = (slug) => {
    ['weight','reps','distance','time','message'].forEach(id => document.getElementById(`form-group-${id}`).classList.add('hidden'));
    (PERFORMANCE_BAREME[slug] || PERFORMANCE_BAREME["default"]).inputs.forEach(id => document.getElementById(`form-group-${id}`).classList.remove('hidden'));
  };
  showRelevantInputs(currentMet);

  const itemClass = "block px-6 py-3 text-sm text-gray-300 hover:bg-pink-500/10 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0";

  catMenu.innerHTML = catSlugs.map(s=>`<div data-cat="${s}" class="${itemClass}">${catLabel(s)}</div>`).join('');
  const buildMetMenu = cat => { metMenu.innerHTML = subSlugs(cat).map(m=>`<div data-met="${m}" class="${itemClass}">${subLabel(cat,m)}</div>`).join(''); };
  buildMetMenu(currentCat);

  const show = m=>{m.classList.remove('opacity-0','scale-95','pointer-events-none'); m.classList.add('opacity-100','scale-100'); m.previousElementSibling.querySelector('svg')?.classList.add('rotate-180');};
  const hide = m=>{m.classList.add('opacity-0','scale-95','pointer-events-none'); m.classList.remove('opacity-100','scale-100'); m.previousElementSibling.querySelector('svg')?.classList.remove('rotate-180');};
  const toggle=(btn,menu)=>{ if(menu.classList.contains('opacity-100')) hide(menu); else { show(menu); if(menu===catMenu) hide(metMenu); if(menu===metMenu) hide(catMenu); } setTimeout(()=>{const away=e=>{if(!menu.contains(e.target)&&!btn.contains(e.target)){hide(menu);document.removeEventListener('click',away)}};document.addEventListener('click',away)},0); };

  catBtn.onclick=()=>toggle(catBtn,catMenu); metBtn.onclick=()=>toggle(metBtn,metMenu);
  
  catMenu.onclick=e=>{ const a=e.target.closest('[data-cat]'); if(!a)return; currentCat=a.dataset.cat; catLab.textContent=catLabel(currentCat); hide(catMenu); buildMetMenu(currentCat); currentMet=subSlugs(currentCat)[0]; metLab.textContent=subLabel(currentCat,currentMet); showRelevantInputs(currentMet); };
  metMenu.onclick=e=>{ const a=e.target.closest('[data-met]'); if(!a)return; currentMet=a.dataset.met; metLab.textContent=subLabel(currentCat,currentMet); showRelevantInputs(currentMet); hide(metMenu); };

  const form = document.getElementById('contrib-form');
  const status = document.getElementById('status');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fileIn = document.getElementById('file-input');
    if (!fileIn.files.length) { status.textContent = 'Vidéo requise.'; status.className = 'text-red-400 text-center text-sm mt-2'; return; }
    
    const fd = new FormData();
    fd.append('category', currentCat); fd.append('exercise', currentMet);
    fd.append('consent', document.getElementById('consent-yes').checked);
    fd.append('file', fileIn.files[0]);
    
    ['weight','reps','distance','time','message'].forEach(k => {
        const val = document.getElementById(`input-${k}`).value;
        if(val) fd.append(k === 'time' ? 'perf_time' : k, val);
    });

    try {
      status.textContent = 'Upload en cours...'; status.className = 'text-yellow-400 text-center text-sm mt-2 animate-pulse';
      const res = await fetch('/api/contribution', { method: 'POST', headers: { authorization: localStorage.getItem('token')||'' }, body: fd });
      if (!res.ok) throw new Error(await res.text());
      status.textContent = '✅ Vidéo envoyée avec succès !'; status.className = 'text-green-400 text-center text-sm mt-2';
      setTimeout(() => { history.pushState(null, '', '/profile/dashboard'); dispatchEvent(new PopStateEvent('popstate')); }, 1500);
    } catch (err) {
      status.textContent = `❌ ${err.message || err}`; status.className = 'text-red-400 text-center text-sm mt-2';
    }
  });
}