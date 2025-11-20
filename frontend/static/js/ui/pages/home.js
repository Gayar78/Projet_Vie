/* frontend/static/js/ui/pages/home.js */
import { api } from '../../core/api.js';
import { rankFromPoints, getRankColor } from './leaderboard.js'; // Import des couleurs

export default function home () {
  return /* html */ `
  <section class="relative flex flex-col items-center justify-center text-center px-6 pb-32 overflow-hidden min-h-[calc(100vh-160px)]">
    <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-center text-white animate-spring-in">Rise, Record,<br /><span class="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Draft&nbsp;Prime.</span></h1>
    <p class="max-w-2xl mx-auto text-gray-400 mb-10 text-center animate-spring-in" style="animation-delay: 0.1s">La première plateforme communautaire où chaque performance compte.</p>
    <a href="/register" data-link class="px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform duration-150 active:scale-95 shadow-lg shadow-pink-500/30 animate-spring-in" style="animation-delay: 0.2s">Rejoins la compétition</a>
  </section>

  <section class="py-24 px-6">
    <!-- (Contenu "Comment ça marche" inchangé pour abréger, remets-le tel quel) -->
    <div class="max-w-6xl mx-auto liquid-glass-card rounded-2xl p-12 text-center" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.005"><h2 class="text-3xl font-bold mb-4 text-white">Comment ça marche ?</h2><p class="text-gray-400 max-w-2xl mx-auto mb-16">Simple et transparent.</p><div class="grid md:grid-cols-3 gap-12"><div class="flex flex-col items-center"><div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4"><svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"></path></svg></div><h3 class="text-xl font-semibold mb-2 text-gray-100">1. Filmez</h3></div><div class="flex flex-col items-center"><div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4"><svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 003 20.955a11.955 11.955 0 019-4.044 11.955 11.955 0 019 4.044 12 12 0 00-2.382-9.969z"></path></svg></div><h3 class="text-xl font-semibold mb-2 text-gray-100">2. Validez</h3></div><div class="flex flex-col items-center"><div class="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center border-2 border-pink-500 mb-4"><svg class="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg></div><h3 class="text-xl font-semibold mb-2 text-gray-100">3. Dominez</h3></div></div></div>
  </section>

  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center liquid-glass-card rounded-2xl p-12" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.005">
      <div class="text-center lg:text-left">
        <h2 class="text-3xl font-bold mb-4 text-white">Classement Général</h2>
        <p class="text-gray-400 mb-6">Voici le Top 3 actuel.</p>
        <a href="/leaderboard" data-link class="inline-flex items-center gap-2 text-pink-400 font-semibold hover:underline">Voir le classement complet&nbsp;→</a>
      </div>
      <div id="home-leaderboard-preview" class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 space-y-3 shadow-inner ring-1 ring-white/5"></div>
    </div>
  </section>

  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto text-center liquid-glass-card rounded-2xl p-12" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.005">
      <h2 class="text-3xl font-bold mb-4 text-white">Système de Rangs</h2>
      <p class="text-gray-400 max-w-2xl mx-auto mb-12">Grimpe en grade et affiche fièrement ton rang.</p>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
        ${[
            { name: 'Fer', slug: 'iron' }, { name: 'Bronze', slug: 'bronze' }, { name: 'Argent', slug: 'silver' },
            { name: 'Or', slug: 'gold' }, { name: 'Platine', slug: 'platinium' }, { name: 'Émeraude', slug: 'emeraude' },
            { name: 'Diamant', slug: 'diamond' }, { name: 'Maître', slug: 'master' }, { name: 'Grand Maître', slug: 'grandmaster' },
            { name: 'Challenger', slug: 'challenger' }
        ].map((rank) => {
            // ON RÉCUPÈRE LA COULEUR ICI
            const color = getRankColor(rank.slug);
            return `
            <div class="flex flex-col items-center group">
                <img src="/static/images/ranks/${rank.slug}.png" alt="${rank.name}" 
                     class="rank-icon w-24 h-24 object-contain mb-2 transform transition-transform duration-300 group-hover:scale-110" 
                     style="--rank-color: ${color};" />
                <p class="text-sm text-gray-300 font-medium">${rank.name}</p>
            </div>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="py-24 px-6 text-center"><h2 class="text-4xl font-extrabold mb-6 text-white">Prêt à marquer l’histoire&nbsp;?</h2><a href="/register" data-link class="px-10 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform duration-150 shadow-lg shadow-pink-500/30">Je rejoins la compétition</a></section>
  `;
}

export async function mount() {
  const container = document.getElementById('home-leaderboard-preview');
  if (!container) return;
  container.innerHTML = '<p class="text-gray-500 text-center">Chargement du Top 3...</p>';
  try {
    const { list } = await api('/leaderboard?cat=general&metric=general&limit=3', null, 'GET');
    if (!list || list.length === 0) { container.innerHTML = '<p class="text-gray-500 text-center">Le classement est en cours de calcul.</p>'; return; }
    
    container.innerHTML = list.map((user, i) => {
        const rankName = rankFromPoints(user.points);
        const rankColor = getRankColor(rankName);

        return `
      <a href="/user/${user.id}" data-link
         class="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors duration-200 ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' : ''}">
        <div class="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm shadow-sm ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}">${i + 1}</div>
        <img src="${user.photoURL || '/static/images/ranks/rank.png'}" class="w-12 h-12 rounded-full object-cover ring-2 ring-white/20" />
        <div class="flex-1">
            <p class="font-semibold text-gray-100">${user.displayName || 'Athlète'}</p>
            
            <div class="flex items-center gap-2 mt-1">
                <img src="/static/images/ranks/${rankName}.png" 
                     class="rank-icon w-5 h-5 object-contain" 
                     style="--rank-color: ${rankColor};">
                <p class="text-xs text-gray-500">Rang ${rankName}</p>
            </div>
        </div>
        <div class="text-right"><p class="font-semibold text-pink-400">${user.points.toLocaleString()} pts</p></div>
      </a>
    `}).join('');
  } catch (error) { container.innerHTML = '<p class="text-red-500 text-center">Impossible de charger le classement.</p>'; }
}