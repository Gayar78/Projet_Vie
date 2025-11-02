// static/js/ui/pages/profile/contrib.js
import { getIdToken } from '../../../auth.js';

/* ------------------------------------------------------------------ */
/* 1. Data: slug -> labels                                            */
/* ------------------------------------------------------------------ */
const CATEGORIES = {
  muscu: {
    label: 'Muscu',
    sub: {
      bench:           'Développé couché',
      squat:           'Squat',
      deadlift:        'Soulevé de terre',
      weighted_pullup: 'Tractions lestées',
      overhead_press:  'Développé militaire',
      vertical_row:    'Rowing vertical',
    },
  },
  street: {
    label: 'Street Work Out',
    sub: {
      weighted_pullup: 'Tractions lestées',
      weighted_dip:    'Dips lestés',
      front_lever:     'Front Lever',
      full_planche:    'Full Planche',
      human_flag:      'Human Flag',
    },
  },
  cardio: {
    label: 'Cardio',
    sub: {
      run:  'Course',
      bike: 'Vélo',
      rope: 'Corde à sauter',
    },
  },
};

//Barème (pour savoir quels champs afficher)
const PERFORMANCE_BAREME = {
    "bench": { "inputs": ["weight", "reps"] },
    "squat": { "inputs": ["weight", "reps"] },
    "deadlift": { "inputs": ["weight", "reps"] },
    "weighted_pullup": { "inputs": ["weight", "reps"] },
    "overhead_press": { "inputs": ["weight", "reps"] },
    "vertical_row": { "inputs": ["weight", "reps"] },
    "weighted_dip": { "inputs": ["weight", "reps"] },
    "front_lever": { "inputs": ["time"] },
    "full_planche": { "inputs": ["time"] },
    "human_flag": { "inputs": ["time"] },
    "run": { "inputs": ["distance", "time"] },
    "bike": { "inputs": ["distance", "time"] },
    "rope": { "inputs": ["reps"] },
    "default": { "inputs": ["message"] }
};

/* Short helpers */
const catSlugs   = Object.keys(CATEGORIES);
const subSlugs   = cat => Object.keys(CATEGORIES[cat].sub);
const catLabel   = slug => CATEGORIES[slug].label;
const subLabel   = (cat, sub) => CATEGORIES[cat].sub[sub];

/* ------------------------------------------------------------------ */
/* 2. Page markup                                                     */
/* ------------------------------------------------------------------ */
export default function contribPage () {
  const firstCat = catSlugs[0];
  const firstMet = subSlugs(firstCat)[0];

  return /* html */`
  <section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col items-center text-white">
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <h1 class="mt-24 text-4xl md:text-5xl font-extrabold mb-12">
      <span class="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Contributions</span>
    </h1>

    <!-- Dropdowns Cat / Metric -->
    <div class="flex flex-wrap gap-6 items-center mb-10 relative z-20">
      ${['cat','met'].map(t=>`
        <div id="${t}-dd" class="relative">
          <button id="${t}-btn" type="button"
                  class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                         bg-white/5 hover:bg-white/10 border border-white/20">
            <span id="${t}-label" class="font-semibold">
              ${t==='cat' ? catLabel(firstCat) : subLabel(firstCat, firstMet)}
            </span>
            <svg class="w-4 h-4 opacity-70 transition-transform"
                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.08l3.71-3.85a.75.75
                       0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75
                       0 01.02-1.06z" clip-rule="evenodd"/>
            </svg>
          </button>
          <div id="${t}-menu"
               class="absolute left-0 mt-3 w-56 origin-top-left rounded-lg
                      bg-[#20202e] border border-white/15 shadow-lg opacity-0
                      scale-95 pointer-events-none transition-[opacity,transform]
                      duration-150 ease-out z-40"></div>
        </div>`).join('')}
    </div>

    <!-- Upload form -->
    <form id="contrib-form"
          class="space-y-6 max-w-xl w-full bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">

      <label class="block">
        <span class="font-semibold">Vidéo (.mp4, .mov…)</span>
        <input type="file" id="file-input" accept="video/*" class="mt-1 w-full" required>
      </label>

      <label class="block hidden" id="form-group-weight">
        <span class="font-semibold">Poids (en kg)</span>
        <input type="number" step="0.5" id="input-weight" placeholder="ex: 100.5"
               class="mt-1 p-2 rounded w-full border bg-[#20202e]">
      </label>

      <label class="block hidden" id="form-group-reps">
        <span class="font-semibold">Répétitions</span>
        <input type="number" id="input-reps" placeholder="ex: 5"
               class="mt-1 p-2 rounded w-full border bg-[#20202e]">
      </label>

      <label class="block hidden" id="form-group-distance">
        <span class="font-semibold">Distance (en km)</span>
        <input type="number" step="0.1" id="input-distance" placeholder="ex: 5.5"
               class="mt-1 p-2 rounded w-full border bg-[#20202e]">
      </label>

      <label class="block hidden" id="form-group-time">
        <span class="font-semibold">Temps (ex: 10:30 ou 30s)</span>
        <input type="text" id="input-time" placeholder="ex: 25:30"
               class="mt-1 p-2 rounded w-full border bg-[#20202e]">
      </label>

      <label class="block hidden" id="form-group-message">
        <span class="font-semibold">Indication : Poids / Répétitions / Temps</span>
        <textarea id="input-message" rows="4" class="mt-1 p-2 rounded w-full border bg-[#20202e]"></textarea>
      </label>

      <div class="flex flex-col gap-3">
        <span class="font-semibold">Diffusion sur les réseaux sociaux&nbsp;?</span>
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="consent" id="consent-yes" value="yes" required>
          Oui
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="radio" name="consent" id="consent-no" value="no">
          Non
        </label>
      </div>

      <button type="submit"
              class="w-full py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-semibold">
        Envoyer
      </button>

      <p id="status" class="text-center text-sm mt-2"></p>
    </form>
  </section>`;
}

/* ------------------------------------------------------------------ */
/* 3. Interactive logic                                               */
/* ------------------------------------------------------------------ */
export function mount () {
  const catBtn  = document.getElementById('cat-btn');
  const catLab  = document.getElementById('cat-label');
  const catMenu = document.getElementById('cat-menu');

  const metBtn  = document.getElementById('met-btn');
  const metLab  = document.getElementById('met-label');
  const metMenu = document.getElementById('met-menu');

  let currentCat = catSlugs[0];
  let currentMet = subSlugs(currentCat)[0];

  //FONCTION pour afficher les bons champs
  const showRelevantInputs = (exerciseSlug) => {
    // Cache tous les groupes d'abord
    document.getElementById('form-group-weight').classList.add('hidden');
    document.getElementById('form-group-reps').classList.add('hidden');
    document.getElementById('form-group-distance').classList.add('hidden');
    document.getElementById('form-group-time').classList.add('hidden');
    document.getElementById('form-group-message').classList.add('hidden');

    // Trouve les champs requis pour cet exercice
    const config = PERFORMANCE_BAREME[exerciseSlug] || PERFORMANCE_BAREME["default"];

    // Affiche les champs requis
    config.inputs.forEach(inputType => {
      const group = document.getElementById(`form-group-${inputType}`);
      if (group) {
        group.classList.remove('hidden');
      }
    });
  };

  // Appelle-la une première fois au chargement
  showRelevantInputs(currentMet);

  /* Build menus */
  catMenu.innerHTML = catSlugs.map(
    s=>`<a href="#" data-cat="${s}" class="block px-5 py-3 text-sm hover:bg-white/5">${catLabel(s)}</a>`
  ).join('');

  const buildMetMenu = cat => {
    metMenu.innerHTML = subSlugs(cat).map(
      m=>`<a href="#" data-met="${m}" class="block px-5 py-3 text-sm hover:bg-white/5">
            ${subLabel(cat,m)}</a>`
    ).join('');
  };
  buildMetMenu(currentCat);

  /* toggle helpers */
  const show = m=>{m.classList.remove('opacity-0','scale-95','pointer-events-none');
                   m.classList.add('opacity-100','scale-100');
                   m.previousElementSibling.querySelector('svg')?.classList.add('rotate-180');};
  const hide = m=>{m.classList.add('opacity-0','scale-95','pointer-events-none');
                   m.classList.remove('opacity-100','scale-100');
                   m.previousElementSibling.querySelector('svg')?.classList.remove('rotate-180');};
  const toggle=(btn,menu)=>{(menu.classList.contains('opacity-100')?hide:show)(menu);
     setTimeout(()=>{const away=e=>{if(!menu.contains(e.target)&&e.target!==btn){hide(menu);document.removeEventListener('click',away);}};
                     document.addEventListener('click',away);},0);} ;
  catBtn.onclick=()=>toggle(catBtn,catMenu);
  metBtn.onclick=()=>toggle(metBtn,metMenu);

  catMenu.onclick=e=>{
    const a=e.target.closest('[data-cat]'); if(!a) return; e.preventDefault();
    currentCat=a.dataset.cat;
    catLab.textContent=catLabel(currentCat);
    hide(catMenu);
    buildMetMenu(currentCat);
    currentMet=subSlugs(currentCat)[0];
    metLab.textContent=subLabel(currentCat,currentMet);
    showRelevantInputs(currentMet);
  };
  metMenu.onclick=e=>{
    const a=e.target.closest('[data-met]'); if(!a) return; e.preventDefault();
    currentMet=a.dataset.met;
    metLab.textContent=subLabel(currentCat,currentMet);
    showRelevantInputs(currentMet);
    hide(metMenu);
  };

  /* Submit */
  const form = document.getElementById('contrib-form');
  const status = document.getElementById('status');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fileIn = document.getElementById('file-input');
    if (!fileIn.files.length) {
      status.textContent = 'Choisissez une vidéo.'; status.className = 'text-red-500 text-sm'; return;
    }

    // Récupère les valeurs de tous les champs
    const consentYes = document.getElementById('consent-yes').checked;

    // Récupère les champs de performance (seulement s'ils sont visibles)
    const weight = document.getElementById('input-weight').value;
    const reps = document.getElementById('input-reps').value;
    const distance = document.getElementById('input-distance').value;
    const perf_time = document.getElementById('input-time').value;
    const message = document.getElementById('input-message').value;

    const fd = new FormData();
    fd.append('category', currentCat);
    fd.append('exercise', currentMet);
    fd.append('consent', consentYes);
    fd.append('file', fileIn.files[0]);

    // Ajoute les champs de performance s'ils ont une valeur
    if (weight) fd.append('weight', weight);
    if (reps) fd.append('reps', reps);
    if (distance) fd.append('distance', distance);
    if (perf_time) fd.append('perf_time', perf_time);
    if (message) fd.append('message', message);

    try {
      status.textContent = 'Upload en cours...'; status.className = 'text-yellow-400 text-sm';
      const res = await fetch('/api/contribution', {
        method: 'POST',
        headers: { authorization: localStorage.getItem('token') || '' },
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      status.textContent = '✅ Vidéo envoyée !'; status.className = 'text-green-400 text-sm';
      setTimeout(() => { history.pushState(null, '', '/profile/dashboard'); dispatchEvent(new PopStateEvent('popstate')); }, 800);
    } catch (err) {
      status.textContent = `❌ ${err.message || err}`; status.className = 'text-red-500 text-sm';
    }
  });
}

/* Bootstrap if page opened directly */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('contrib-form')) mount();
});
