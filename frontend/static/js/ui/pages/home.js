/* frontend/static/js/ui/pages/home.js */
import { api } from '../../core/api.js';
import { rankFromPoints, getRankColor } from './leaderboard.js';

export default function home () {
  const isLogged = !!localStorage.getItem('token');

  // BLOCK CTA (Différent si connecté ou pas)
  const ctaButton = isLogged 
    ? `<a href="/profile/dashboard" data-link class="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition backdrop-blur-md">Mon Tableau de Bord</a>`
    : `<a href="/register" data-link class="px-10 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform duration-150 shadow-lg shadow-pink-500/30 animate-spring-in" style="animation-delay: 0.2s">Je rejoins la compétition</a>`;

  return /* html */ `
  <!-- HERO -->
  <section class="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden min-h-[60vh]">
    <h1 class="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-center text-white animate-spring-in">
      Rise, Record,<br />
      <span class="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Draft&nbsp;Prime.</span>
    </h1>
    <p class="max-w-2xl mx-auto text-gray-400 mb-10 text-center text-lg animate-spring-in" style="animation-delay: 0.1s">
      La première plateforme communautaire où chaque performance compte.
    </p>
    ${ctaButton}
  </section>

  <!-- LEADERBOARD PREVIEW -->
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center liquid-glass-card rounded-2xl p-12" 
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.005">
      <div class="text-center lg:text-left">
        <h2 class="text-3xl font-bold mb-4 text-white">Classement Général</h2>
        <p class="text-gray-400 mb-6">Seuls les meilleurs athlètes atteignent le sommet. Voici le Top 3 actuel.</p>
        <a href="/leaderboard" data-link class="inline-flex items-center gap-2 text-pink-400 font-semibold hover:underline">
          Voir le classement complet&nbsp;→
        </a>
      </div>
      <div id="home-leaderboard-preview" class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 space-y-3 shadow-inner ring-1 ring-white/5"></div>
    </div>
  </section>

  <!-- COMMENT ÇA MARCHE -->
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto liquid-glass-card rounded-2xl p-12 text-center"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.005">
      <h2 class="text-3xl font-bold mb-12 text-white">Comment ça marche ?</h2>
      <div class="grid md:grid-cols-3 gap-12">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4">
            <span class="text-2xl">🎥</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-100">1. Filmez</h3>
          <p class="text-gray-500 text-sm">Enregistre ta performance en suivant nos critères.</p>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4">
            <span class="text-2xl">✅</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-100">2. Validez</h3>
          <p class="text-gray-500 text-sm">Nos administrateurs vérifient et valident ton score.</p>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4">
            <span class="text-2xl">🏆</span>
          </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-100">3. Dominez</h3>
          <p class="text-gray-500 text-sm">Grimpe au classement et débloque des nouveaux rangs.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- RANKS -->
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto text-center liquid-glass-card rounded-2xl p-12"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.005">
      <h2 class="text-3xl font-bold mb-8 text-white">Système de Rangs</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
        ${[{ name: 'Fer', slug: 'fer' }, { name: 'Bronze', slug: 'bronze' }, { name: 'Argent', slug: 'argent' }, { name: 'Or', slug: 'or' }, { name: 'Platine', slug: 'platine' }, { name: 'Émeraude', slug: 'emeraude' }, { name: 'Diamant', slug: 'diamant' }, { name: 'Maître', slug: 'master' }, { name: 'Grand Maître', slug: 'grandmaster' }, { name: 'Challenger', slug: 'challenger' }].map(
          (rank) => {
            const color = getRankColor(rank.slug);
            return `<div class="flex flex-col items-center group"><img src="/static/images/ranks/${rank.slug}.png" alt="${rank.name}" class="rank-icon w-20 h-20 object-contain mb-2 transform transition-transform duration-300 group-hover:scale-110" style="--rank-color: ${color};" /><p class="text-sm text-gray-300 font-medium">${rank.name}</p></div>`
          }
        ).join('')}
      </div>
    </div>
  </section>
  `;
}

export async function mount() {
    // GESTION LEADERBOARD PREVIEW
    const lbContainer = document.getElementById('home-leaderboard-preview');
    if (lbContainer) {
        lbContainer.innerHTML = '<p class="text-gray-500 text-center">Chargement...</p>';
        try {
            const { list } = await api('/leaderboard?cat=general&metric=general&limit=3', null, 'GET');
            if (!list || list.length === 0) { lbContainer.innerHTML = '<p class="text-gray-500 text-center">Classement vide.</p>'; }
            else {
                lbContainer.innerHTML = list.map((user, i) => {
                    const rankName = rankFromPoints(user.points);
                    const rankColor = getRankColor(rankName);
                    let rankSlug = rankName.toLowerCase().replace(/ /g, '').replace('é', 'e').replace('ê', 'e').replace('î', 'i');
                    if(rankSlug.includes('grand')) rankSlug = 'grandmaster';
                    else if(rankSlug.includes('maitre')) rankSlug = 'master';
                    
                    return `
                  <a href="/user/${user.id}" data-link class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shadow-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white'}">${i + 1}</div>
                    <img src="${user.photoURL || '/static/images/ranks/rank.png'}" class="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                    <div class="flex-1 min-w-0"><p class="font-semibold text-white truncate">${user.displayName || 'Athlète'}</p><div class="flex items-center gap-1"><img src="/static/images/ranks/${rankSlug}.png" class="rank-icon w-4 h-4" style="--rank-color: ${rankColor};"><p class="text-xs text-gray-500">Rang ${rankName}</p></div></div>
                    <div class="text-right"><p class="font-bold text-pink-400 font-mono">${user.points.toLocaleString()}</p></div>
                  </a>`;
                }).join('');
            }
        } catch (e) { lbContainer.innerHTML = ''; }
    }
}