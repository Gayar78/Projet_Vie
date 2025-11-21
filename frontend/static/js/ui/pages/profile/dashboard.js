/* frontend/static/js/ui/pages/profile/dashboard.js */
import { rankFromPoints, getRankColor } from '../leaderboard.js'

const CATEGORY_NAMES = { muscu: 'Musculation', street: 'Street Workout', cardio: 'Cardio', general: 'Total' };
const DISPLAY_ORDER = { 'muscu': 1, 'street': 2, 'cardio': 3 };

// NOUVELLES CLÉS D'EXERCICE
const EXERCISES_MAP = {
    muscu: ["bench", "overhead_press", "dumbbell_press", "squat", "deadlift", "pull_vertical", "pull_horizontal", "curls"],
    muscu_labels: ["Bench", "OHP", "Haltères", "Squat", "Deadlift", "Tir. Vert", "Tir. Hor", "Curls"],
    
    street: ["weighted_pullup", "weighted_dip", "front_lever", "full_planche", "human_flag"],
    street_labels: ["Tractions", "Dips", "Front", "Planche", "Flag"],
    
    cardio: ["run", "bike", "rope"],
    cardio_labels: ["Course", "Vélo", "Corde"]
};

function loadChartJs() { return new Promise((resolve, reject) => { if (window.Chart) return resolve(); const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/chart.js'; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); }); }

const commonChartOptions = { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: 'rgba(255, 255, 255, 0.1)' }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, pointLabels: { font: { size: 10, family: 'sans-serif', weight: 'bold' }, color: '#e5e7eb' }, ticks: { display: false, backdropColor: 'transparent' } } }, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#ffffff', bodyColor: '#ec4899', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, displayColors: false } }, elements: { line: { borderWidth: 2, tension: 0.3 }, point: { radius: 3, hoverRadius: 5 } } };
function makeDataset(label, data) { return [{ label: label, data: data, backgroundColor: 'rgba(236, 72, 153, 0.2)', borderColor: '#EC4899', pointBackgroundColor: '#fff', pointBorderColor: '#EC4899' }]; }

export default function dashboard (user = {}) {
  const rankName = rankFromPoints(user.points || 0);
  // Conversion du nom de rang en slug pour l'image
  let rankSlug = rankName.toLowerCase().replace(/ /g, '').replace('é', 'e').replace('ê', 'e').replace('î', 'i');
  if(rankSlug.includes('grand')) rankSlug = 'grandmaster';
  else if(rankSlug.includes('maitre')) rankSlug = 'master';
  
  const rankImg = `/static/images/ranks/${rankSlug}.png`;
  const rankColor = getRankColor(rankName);
  
  const pts2coins = Math.floor((user.points || 0) / 10);

  const scoresHtml = Object.entries(user.scores || {}).filter(([key]) => key !== 'general').sort(([keyA], [keyB]) => (DISPLAY_ORDER[keyA] || 99) - (DISPLAY_ORDER[keyB] || 99)).map(([key, value]) => `
      <div class="bg-black/20 border border-white/5 p-4 rounded-lg hover:bg-white/5 transition-colors">
        <h4 class="font-semibold text-gray-200 mb-2 border-b border-white/10 pb-1 flex justify-between"><span>${CATEGORY_NAMES[key] || key}</span><span class="text-pink-500">${(value && value.total) ? value.total.toLocaleString() : 0}</span></h4>
        <div class="text-xs text-gray-400 space-y-1">${Object.entries(value || {}).filter(([exKey]) => exKey !== 'total' && exKey !== 'gender').map(([exKey, exPoints]) => `<div class="flex justify-between items-center"><span class="capitalize">${exKey.replace('_', ' ')}</span><span class="font-mono font-medium bg-gray-800 px-1.5 rounded text-gray-300">${exPoints}</span></div>`).join('')}</div>
      </div>`).join('');

  return /* html */ `
  <div class="space-y-8 liquid-glass-card rounded-2xl p-6 animate-spring-in" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.01">
    <section class="grid grid-cols-3 gap-4 text-center py-2">
      <div class="flex flex-col items-center justify-center"><p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Points</p><p class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">${(user.points || 0).toLocaleString()}</p></div>
      
      <div class="flex flex-col items-center justify-center relative group">
        <div class="absolute inset-0 blur-2xl rounded-full -z-10 opacity-40" style="background-color: ${rankColor}"></div>
        <img src="${rankImg}" alt="rank" class="rank-icon w-24 h-24 object-contain transform transition-transform duration-300" style="--rank-color: ${rankColor};" />
        <p class="text-sm font-bold text-gray-300 mt-2">${rankName}</p>
      </div>
      
      <div class="flex flex-col items-center justify-center"><p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Coins</p><p class="text-3xl md:text-4xl font-black text-yellow-400 drop-shadow-lg">${pts2coins.toLocaleString()}</p></div>
    </section>
    
    <hr class="border-white/10" />
    <section><h3 class="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2"><span class="text-2xl">📊</span> Performance Radar</h3><div class="grid grid-cols-1 lg:grid-cols-3 gap-8">${['muscu','street','cardio'].map(t => `<div class="flex flex-col items-center"><h4 class="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wider">${CATEGORY_NAMES[t]}</h4><div class="relative w-full h-64 md:h-56 bg-black/30 rounded-xl border border-white/5 shadow-inner p-2"><canvas id="chart-${t}"></canvas></div></div>`).join('')}</div></section>
    <hr class="border-white/10" />
    <section><div class="flex justify-between items-end mb-4"><h3 class="text-xl font-bold text-gray-100">Détails des scores</h3><span class="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded border border-white/5">Données brutes</span></div><div class="grid md:grid-cols-3 gap-4">${scoresHtml || '<p class="text-gray-500 italic col-span-3 text-center py-4">Aucune performance enregistrée.</p>'}</div></section>
    ${(user.bio || user.instagram) ? '<hr class="border-white/10" />' : ''}
    <div class="grid md:grid-cols-2 gap-6">
        ${user.bio ? `<section><h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Biographie</h3><p class="text-gray-300 whitespace-pre-wrap text-sm bg-black/20 p-3 rounded-lg border border-white/5">${user.bio}</p></section>` : ''}
        ${user.instagram ? `<section><h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Réseaux</h3><a href="https://instagram.com/${user.instagram}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> @${user.instagram}</a></section>` : ''}</div>
  </div>`
}
export async function mount(user) {
    try { await loadChartJs(); } catch (e) { return; }
    const scores = user.scores || {};
    
    const muscuData = EXERCISES_MAP.muscu.map(k => scores.muscu?.[k] || 0);
    const streetData = EXERCISES_MAP.street.map(k => scores.street?.[k] || 0);
    const cardioData = EXERCISES_MAP.cardio.map(k => scores.cardio?.[k] || 0);

    const createRadar = (canvasId, labels, data, labelName) => {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        new Chart(ctx, { type: 'radar', data: { labels: labels, datasets: makeDataset(labelName, data) }, options: commonChartOptions });
    };

    createRadar('chart-muscu', EXERCISES_MAP.muscu_labels, muscuData, 'Musculation');
    createRadar('chart-street', EXERCISES_MAP.street_labels, streetData, 'Street Workout');
    createRadar('chart-cardio', EXERCISES_MAP.cardio_labels, cardioData, 'Cardio');
}