// static/js/ui/pages/home.js
import { api } from '../../core/api.js';
import { rankFromPoints } from './leaderboard.js'; // On a besoin de ça

// ------------------------------------------------------------------
// 1. Le HTML de la page
// ------------------------------------------------------------------
export default function home () {
  return /* html */ `
  <!-- HERO -------------------------------------------------- -->
  <section
    class="relative flex flex-col items-center justify-center text-center
           px-6 pb-32 overflow-hidden
           min-h-[calc(100vh-160px)]"
  >
    <!-- Le fond Vanta est maintenant global (dans index.html) -->

    <!-- HEADLINE + SLOGAN -->
    <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-center text-gray-900">
      Rise, Record,<br />
      <span class="bg-gradient-to-r from-pink-500 to-purple-500
                   bg-clip-text text-transparent">
        Draft&nbsp;Prime.
      </span>
    </h1>

    <p class="max-w-2xl mx-auto text-gray-700 mb-10 text-center">
      La première plateforme communautaire où chaque performance compte&nbsp;:
      partage tes exploits, grimpe au classement et deviens une légende.
    </p>

    <!-- MODIFIÉ : Bouton "Rose/Violet" -->
    <a
      href="/register"
      data-link
      class="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600
             text-white font-semibold
             hover:opacity-90 shadow-lg shadow-pink-500/30
             transition-transform duration-150 active:scale-95 hover:scale-105"
    >
      Rejoins la compétition
    </a>
  </section>

  <!-- COMMENT ÇA MARCHE (NOUVEAU) ----------------------------- -->
  <section class="py-24 px-6">
    <!-- MODIFIÉ : Utilisation du style de la nav-bar -->
    <div class="max-w-6xl mx-auto bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-12 text-center">
      <h2 class="text-3xl font-bold mb-4 text-gray-900">Comment ça marche ?</h2>
      <p class="text-gray-600 max-w-2xl mx-auto mb-16">
        Notre système est simple et transparent. Prouve ta performance, 
        gagne des points, et domine le classement.
      </p>
      
      <div class="grid md:grid-cols-3 gap-12">
        <!-- Étape 1 -->
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center border-2 border-pink-500">
            <svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"></path></svg>
          </div>
          <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900">1. Filmez</h3>
          <p class="text-gray-600 text-sm">
            Enregistre ta performance (Bench, Squat, 5km...) en suivant nos critères de validation.
          </p>
        </div>
        
        <!-- Étape 2 -->
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center border-2 border-pink-500">
            <svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 003 20.955a11.955 11.955 0 019-4.044 11.955 11.955 0 019 4.044 12 12 0 00-2.382-9.969z"></path></svg>
          </div>
          <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900">2. Validez</h3>
          <p class="text-gray-600 text-sm">
            Soumets ta vidéo. Nos administrateurs l'analysent et calculent ton score officiel.
          </p>
        </div>
        
        <!-- Étape 3 -->
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center border-2 border-pink-500">
            <svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
          </div>
          <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900">3. Dominez</h3>
          <p class="text-gray-600 text-sm">
            Si ta performance est un record, tes points sont ajoutés. Grimpe au classement général !
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- LEADERBOARD PREVIEW (RÉEL) ----------------- -->
  <section class="py-24 px-6">
    <!-- MODIFIÉ : Utilisation du style de la nav-bar -->
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-12">
      <div>
        <h2 class="text-3xl font-bold mb-4 text-gray-900">Classement Général</h2>
        <p class="text-gray-600 mb-6">
          Seuls les meilleurs athlètes atteignent le sommet. 
          Voici le Top 3 actuel du classement général.
        </p>
        <a
          href="/leaderboard"
          data-link
          class="inline-flex items-center gap-2 text-pink-500 font-semibold hover:underline"
        >
          Voir le classement complet&nbsp;→
        </a>
      </div>

      <!-- Le conteneur se remplit via la fonction mount() -->
      <div id="home-leaderboard-preview"
           class="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-3 shadow-inner ring-1 ring-black/5">
        <!-- Contenu injecté par JS -->
      </div>
    </div>
  </section>

  <!-- RANKS --------------------------------------------------- -->
  <section class="py-24 px-6">
    <!-- MODIFIÉ : Utilisation du style de la nav-bar -->
    <div class="max-w-6xl mx-auto text-center bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-12">
      <h2 class="text-3xl font-bold mb-4 text-gray-900">Système de Rangs</h2>
      <p class="text-gray-600 max-w-2xl mx-auto mb-12">
        Chaque effort compte. Gagne des points, monte en grade et affiche fièrement ton rang.
      </p>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
        ${[
          { name: 'Fer', img: 'iron.png' },
          { name: 'Bronze', img: 'bronze.png' },
          { name: 'Argent', img: 'silver.png' },
          { name: 'Or', img: 'gold.png' },
          { name: 'Platine', img: 'platinium.png' },
          { name: 'Émeraude', img: 'emeraude.png' },
          { name: 'Diamant', img: 'diamond.png' },
          { name: 'Maître', img: 'master.png' },
          { name: 'Grand Maître', img: 'grandmaster.png' },
          { name: 'Challenger', img: 'challenger.png' },
        ].map(
          (rank) => `
          <div class="flex flex-col items-center">
            <img src="/static/images/ranks/${rank.img}" alt="${rank.name}" class="w-24 h-24 object-contain mb-2" />
            <p class="text-sm text-gray-700 font-medium">${rank.name}</p>
          </div>
        `
        ).join('')}
      </div>
    </div>
  </section>

  <!-- CTA FINAL --------------------------------------------- -->
  <section class="py-24 px-6 text-center">
    <h2 class="text-4xl font-extrabold mb-6 text-gray-900">
      Prêt à marquer l’histoire&nbsp;?
    </h2>
    <!-- MODIFIÉ : Bouton "Rose/Violet" -->
    <a
      href="/register"
      data-link
      class="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600
             text-white font-semibold
             hover:opacity-90 shadow-lg shadow-pink-500/30
             transition-transform duration-150 active:scale-95 hover:scale-105"
    >
      Je rejoins la compétition
    </a>
  </section>
  `;
}


// ------------------------------------------------------------------
// 2. Logique (appelée par le routeur après l'affichage)
// ------------------------------------------------------------------
export async function mount() {
  const container = document.getElementById('home-leaderboard-preview');
  if (!container) return;

  container.innerHTML = '<p class="text-gray-600 text-center">Chargement du Top 3...</p>';

  try {
    // On appelle l'API pour le leaderboard (limité à 3)
    const { list } = await api('/leaderboard?cat=general&metric=general&limit=3', null, 'GET');

    if (!list || list.length === 0) {
      container.innerHTML = '<p class="text-gray-600 text-center">Le classement est en cours de calcul. Revenez bientôt !</p>';
      return;
    }

    // On construit le HTML pour le Top 3
    container.innerHTML = list.map((user, i) => `
      <a href="/user/${user.id}" data-link
         class="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 card-liquid-hover ${i === 0 ? 'glow-user' : ''}">
        
        <div class="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm
            ${i === 0 ? 'bg-yellow-400 text-black' :
              i === 1 ? 'bg-gray-300 text-black' :
              i === 2 ? 'bg-orange-500 text-white' : ''}">
          ${i + 1}
        </div>
        
        <img 
          src="${user.photoURL || '/static/images/ranks/rank.png'}" 
          alt="${user.displayName}"
          class="w-12 h-12 rounded-full object-cover"
        />
        <div class="flex-1">
          <p class="font-semibold text-gray-900">${user.displayName || 'Athlète'}</p>
          <p class="text-xs text-gray-600">Rang ${user.rank ? rankFromPoints(user.points) : 'N/A'}</p>
        </div>
        
        <div class="text-right">
          <p class="font-semibold text-pink-500">${user.points.toLocaleString()} pts</p>
        </div>
      </a>
    `).join('');

  } catch (error) {
    console.error("Erreur chargement leaderboard preview:", error);
    container.innerHTML = '<p class="text-red-500 text-center">Impossible de charger le classement.</p>';
  }
}

