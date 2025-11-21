/* frontend/static/js/ui/pages/user_profile.js */
import { rankFromPoints, getRankColor } from './leaderboard.js'; 
import { api } from '../../core/api.js';

// --- CONFIGURATION & MAPPING ---
const CATEGORY_NAMES = { muscu: 'Musculation', street: 'Street Workout', cardio: 'Cardio', general: 'Total' };
const DISPLAY_ORDER = { 'muscu': 1, 'street': 2, 'cardio': 3 };

const EXERCISES_MAP = {
    muscu: ["bench", "overhead_press", "dumbbell_press", "squat", "deadlift", "pull_vertical", "pull_horizontal", "curls"],
    muscu_labels: ["Bench", "OHP", "Haltères", "Squat", "Deadlift", "Tir. Vert", "Tir. Hor", "Curls"],
    street: ["weighted_pullup", "weighted_dip", "front_lever", "full_planche", "human_flag"],
    street_labels: ["Tractions", "Dips", "Front", "Planche", "Flag"],
    cardio: ["run", "bike", "rope"],
    cardio_labels: ["Course", "Vélo", "Corde"]
};

function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = resolve; script.onerror = reject;
    document.head.appendChild(script);
  });
}

const commonChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    scales: { 
        r: { 
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' }, 
            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
            pointLabels: { font: { size: 10, family: 'sans-serif', weight: 'bold' }, color: '#e5e7eb' }, 
            ticks: { display: false, backdropColor: 'transparent' } 
        } 
    }, 
    plugins: { 
        legend: { display: false }, 
        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#ffffff', bodyColor: '#ec4899', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, displayColors: false } 
    }, 
    elements: { line: { borderWidth: 2, tension: 0.3 }, point: { radius: 3, hoverRadius: 5 } } 
};

function makeDataset(label, data) { 
    return [{ label: label, data: data, backgroundColor: 'rgba(236, 72, 153, 0.2)', borderColor: '#EC4899', pointBackgroundColor: '#fff', pointBorderColor: '#EC4899' }]; 
}

// --- LOGIQUE MODALE VERSUS ---
async function openVersusModal(targetUser) {
    let myUser;
    try { myUser = await api('/profile', null, 'GET'); } 
    catch (e) { alert("Erreur chargement vos données."); return; }

    const modal = document.createElement('div');
    // OVERLAY : Plus transparent (60%) pour voir le fond
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-spring-in';
    
    modal.innerHTML = `
        <!-- BOX : Glass Sombre, Scrollbar caché, Max-Height limitée -->
        <div class="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col 
                    bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 ring-1 ring-white/5">
            
            <!-- Header Sticky -->
            <div class="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-gray-900/95 z-20 backdrop-blur-xl">
                <div class="flex items-center gap-3">
                    <span class="text-2xl filter drop-shadow-lg">⚔️</span>
                    <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 italic tracking-tighter">VERSUS MODE</h2>
                </div>
                <button id="close-versus" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors text-xl">&times;</button>
            </div>
            
            <div class="p-6 md:p-10 space-y-10">
                
                <!-- Scoreboard -->
                <div class="flex items-center justify-center gap-4 md:gap-16">
                    <!-- MOI -->
                    <div class="text-center flex-1">
                        <div class="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-blue-500 to-cyan-500 mb-3 shadow-lg shadow-blue-500/20">
                             <img src="${myUser.photoURL || '/static/images/ranks/rank.png'}" class="w-full h-full rounded-full object-cover bg-black">
                        </div>
                        <p class="font-bold text-blue-400 text-sm md:text-base uppercase tracking-widest mb-1">MOI</p>
                        <p class="text-xl md:text-3xl font-black text-white tracking-tight">${(myUser.points || 0).toLocaleString()}</p>
                    </div>

                    <div class="text-gray-700 font-black italic text-4xl md:text-6xl opacity-20 select-none">VS</div>

                    <!-- ADVERSAIRE -->
                    <div class="text-center flex-1">
                        <div class="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-pink-500 to-purple-600 mb-3 shadow-lg shadow-pink-500/20">
                             <img src="${targetUser.photoURL || '/static/images/ranks/rank.png'}" class="w-full h-full rounded-full object-cover bg-black">
                        </div>
                        <p class="font-bold text-pink-500 text-sm md:text-base uppercase tracking-widest mb-1 truncate px-2">${targetUser.displayName}</p>
                        <p class="text-xl md:text-3xl font-black text-white tracking-tight">${(targetUser.points || 0).toLocaleString()}</p>
                    </div>
                </div>

                <hr class="border-white/5" />

                <!-- Charts Comparison -->
                <div class="grid md:grid-cols-2 gap-8 md:gap-12">
                     <div class="flex flex-col items-center">
                        <h3 class="text-white font-bold uppercase tracking-widest text-[10px] mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/5">Musculation</h3>
                        <div class="relative w-full aspect-square bg-black/20 rounded-2xl border border-white/5 p-2 shadow-inner">
                            <canvas id="vs-chart-muscu"></canvas>
                        </div>
                     </div>
                     <div class="flex flex-col items-center">
                        <h3 class="text-white font-bold uppercase tracking-widest text-[10px] mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/5">Street Workout</h3>
                        <div class="relative w-full aspect-square bg-black/20 rounded-2xl border border-white/5 p-2 shadow-inner">
                            <canvas id="vs-chart-street"></canvas>
                        </div>
                     </div>
                </div>

                <!-- Detail Table -->
                <div class="overflow-hidden rounded-xl border border-white/5 bg-black/20 shadow-lg">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/5">
                            <tr>
                                <th class="px-4 py-3 font-bold tracking-wider pl-6">Exercice</th>
                                <th class="px-4 py-3 text-center text-blue-400">Moi</th>
                                <th class="px-4 py-3 text-center text-pink-500">Adv.</th>
                                <th class="px-4 py-3 text-right pr-6">Diff</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5 text-gray-300">
                            ${generateComparisonRows(myUser.scores, targetUser.scores)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('close-versus').onclick = () => modal.remove();

    await loadChartJs();
    
    // Options spécifiques Versus (Légende active)
    const vsOptions = {
        ...commonChartOptions,
        plugins: { legend: { display: true, labels: { color: 'white', font: { size: 10, weight: 'bold' } } } }
    };

    const renderVs = (id, keys, labels, catName) => {
        const ctx = document.getElementById(id);
        if(!ctx) return;
        
        const data1 = keys.map(k => myUser.scores?.[catName]?.[k] || 0);
        const data2 = keys.map(k => targetUser.scores?.[catName]?.[k] || 0);

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Moi', data: data1, borderColor: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.2)', pointBackgroundColor: '#60a5fa', borderWidth: 2, pointRadius: 2 },
                    { label: targetUser.displayName, data: data2, borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.2)', pointBackgroundColor: '#ec4899', borderWidth: 2, pointRadius: 2 }
                ]
            },
            options: vsOptions
        });
    };

    renderVs('vs-chart-muscu', EXERCISES_MAP.muscu, EXERCISES_MAP.muscu_labels, 'muscu');
    renderVs('vs-chart-street', EXERCISES_MAP.street, EXERCISES_MAP.street_labels, 'street');
}

function generateComparisonRows(myScores, targetScores) {
    let html = '';
    ['muscu', 'street', 'cardio'].forEach(cat => {
        const myCat = myScores?.[cat] || {};
        const targetCat = targetScores?.[cat] || {};
        const keys = EXERCISES_MAP[cat];
        if(!keys) return;

        html += `<tr><td colspan="4" class="px-6 py-2 bg-white/5 font-bold text-gray-400 uppercase tracking-wider text-[10px] border-t border-white/5 first:border-0">${CATEGORY_NAMES[cat]}</td></tr>`;
        
        keys.forEach(exo => {
            const myVal = myCat[exo] || 0;
            const targetVal = targetCat[exo] || 0;
            const diff = myVal - targetVal;
            let diffClass = 'text-gray-600';
            let diffStr = '-';
            
            if (diff > 0) { diffClass = 'text-green-400 font-bold'; diffStr = `+${diff}`; }
            if (diff < 0) { diffClass = 'text-red-400 font-bold'; diffStr = `${diff}`; }

            html += `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-2.5 text-gray-300 capitalize font-medium">${exo.replace(/_/g, ' ')}</td>
                    <td class="px-4 py-2.5 text-center font-mono text-blue-200/80 text-xs">${myVal}</td>
                    <td class="px-4 py-2.5 text-center font-mono text-pink-200/80 text-xs">${targetVal}</td>
                    <td class="px-6 py-2.5 text-right font-mono ${diffClass} text-xs">${diffStr}</td>
                </tr>
            `;
        });
    });
    return html;
}

// --- MOUNT FUNCTION ---
export async function mount(user) {
    const actionsContainer = document.getElementById('friend-actions-container');
    const myId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (actionsContainer && token && user.id !== myId) {
        try {
            const { status } = await api(`/friends/status/${user.id}`, null, 'GET');
            const buttons = [];

            // Bouton Versus
            if (!user.is_private || status === 'accepted') {
                 buttons.push(`<button data-action="versus" class="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-purple-900/30 hover:scale-105 transition-all flex items-center gap-2"><span>⚔️</span> Versus</button>`);
            }

            switch (status) {
                case 'not_friends': buttons.push(`<button data-action="add" class="px-5 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-900/30 transition-all hover:scale-105">Ajouter</button>`); break;
                case 'pending_sent': buttons.push(`<button data-action="cancel" class="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 text-sm font-semibold transition-all">Annuler</button>`); break;
                case 'pending_received': buttons.push(`<a href="/profile/friends" data-link class="px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold shadow-lg transition-all">Répondre</a>`); break;
                case 'accepted': buttons.push(`<span class="px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><span class="text-lg">✓</span> Ami</span>`); break;
            }
            
            actionsContainer.className = "flex flex-wrap gap-3 items-center mt-2 md:mt-0";
            actionsContainer.innerHTML = buttons.join('');

            actionsContainer.addEventListener('click', async (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;
                const action = button.dataset.action;
                
                if (action === 'versus') { openVersusModal(user); return; }

                button.disabled = true; button.textContent = '...';
                try {
                     if (action === 'add') { await api(`/friends/request/${user.id}`, null, 'POST'); mount(user); }
                     else if (action === 'cancel') { await api(`/friends/cancel/${user.id}`, null, 'POST'); mount(user); }
                } catch (err) { console.error(err); button.disabled = false; }
            });
        } catch (e) { console.error(e); }
    }

    // Charts Profil (Non Versus)
    if (document.getElementById('chart-muscu')) {
        try { await loadChartJs(); const scores = user.scores || {};
        const muscuData = EXERCISES_MAP.muscu.map(k => scores.muscu?.[k] || 0);
        const streetData = EXERCISES_MAP.street.map(k => scores.street?.[k] || 0);
        const cardioData = EXERCISES_MAP.cardio.map(k => scores.cardio?.[k] || 0);
        const createSimpleRadar = (id, labels, data, name) => { const ctx = document.getElementById(id); if (!ctx) return; new Chart(ctx, { type: 'radar', data: { labels, datasets: [{ label: name, data: data, backgroundColor: 'rgba(236, 72, 153, 0.2)', borderColor: '#EC4899', pointBackgroundColor: '#fff', pointBorderColor: '#EC4899' }] }, options: commonChartOptions }); };
        createSimpleRadar('chart-muscu', EXERCISES_MAP.muscu_labels, muscuData, 'Musculation');
        createSimpleRadar('chart-street', EXERCISES_MAP.street_labels, streetData, 'Street Workout');
        createSimpleRadar('chart-cardio', EXERCISES_MAP.cardio_labels, cardioData, 'Cardio');
        } catch(e){}
    }
}

export default function userProfilePage (user = {}) {
    if (user.is_private) { const avatar = user.photoURL || '/static/images/ranks/rank.png'; return /*html*/`<section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-20"><div class="max-w-md w-full text-center liquid-glass-card rounded-2xl p-10 flex flex-col items-center animate-spring-in" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.01"><div class="relative mb-6"><div class="absolute inset-0 bg-pink-500/20 blur-xl rounded-full"></div><img src="${avatar}" class="relative w-32 h-32 rounded-full object-cover ring-4 ring-white/10 shadow-2xl"></div><h1 class="text-3xl font-bold text-white mb-2">${user.displayName || 'Athlète'}</h1><div id="friend-actions-container" class="h-8 mb-6"></div><div class="bg-black/40 p-4 rounded-lg border border-white/5 w-full"><p class="text-gray-300 font-medium">Profil Privé</p><p class="text-xs text-gray-500 mt-1">Ajoutez cet athlète en ami pour voir ses statistiques.</p></div></div></section>`; }

    const rankName = rankFromPoints(user.points || 0);
    let rankSlug = rankName.toLowerCase().replace(/ /g, '').replace('é', 'e').replace('ê', 'e').replace('î', 'i');
    if(rankSlug.includes('grand')) rankSlug = 'grandmaster';
    else if(rankSlug.includes('maitre')) rankSlug = 'master';
    const rankImg = `/static/images/ranks/${rankSlug}.png`;
    const rankColor = getRankColor(rankName);
    const avatar = user.photoURL || '/static/images/ranks/rank.png';
    const pts2coins = Math.floor((user.points || 0) / 10);
    const scoresHtml = Object.entries(user.scores || {}).filter(([key]) => key !== 'general').sort(([keyA], [keyB]) => (DISPLAY_ORDER[keyA] || 99) - (DISPLAY_ORDER[keyB] || 99)).map(([key, value]) => `<div class="bg-black/20 border border-white/5 p-4 rounded-lg"><h4 class="font-semibold text-gray-200 mb-2 border-b border-white/10 pb-1 flex justify-between"><span>${CATEGORY_NAMES[key] || key}</span><span class="text-pink-500">${(value && value.total) ? value.total.toLocaleString() : 0}</span></h4><div class="text-xs text-gray-400 space-y-1">${Object.entries(value || {}).filter(([exKey]) => exKey !== 'total' && exKey !== 'gender').map(([exKey, exPoints]) => `<div class="flex justify-between items-center"><span class="capitalize">${exKey.replace('_', ' ')}</span><span class="font-mono font-medium bg-gray-800 px-1.5 rounded text-gray-300">${exPoints}</span></div>`).join('')}</div></div>`).join('');

    return /* html */ `
    <section class="relative min-h-[calc(100vh-160px)] pt-24 px-6 pb-20 flex justify-center">
        <div class="w-full max-w-5xl space-y-8 liquid-glass-card rounded-2xl p-6 md:p-10 animate-spring-in" data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.005">
            <div class="flex flex-col md:flex-row items-center gap-8"><img src="${avatar}" class="w-28 h-28 rounded-full object-cover ring-4 ring-white/10 shadow-xl" /><div class="flex-1 text-center md:text-left space-y-2"><h1 class="text-4xl font-bold text-white">${user.displayName || 'Athlète'}</h1><div class="flex flex-wrap gap-4 justify-center md:justify-start items-center"><span class="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.gender === 'M' ? 'bg-blue-900/50 text-blue-300 border border-blue-800' : 'bg-pink-900/50 text-pink-300 border border-pink-800'}">${user.gender === 'M' ? 'Homme' : 'Femme'}</span><div id="friend-actions-container" class="flex gap-3"></div></div></div></div>
            <hr class="border-white/10" />
            <section class="grid grid-cols-3 gap-4 text-center py-2"><div class="flex flex-col items-center justify-center"><p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Points</p><p class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">${(user.points || 0).toLocaleString()}</p></div><div class="flex flex-col items-center justify-center relative"><div class="absolute inset-0 blur-xl rounded-full -z-10 opacity-50" style="background-color: ${rankColor}"></div><img src="${rankImg}" class="w-20 h-20 object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-300" /></div><div class="flex flex-col items-center justify-center"><p class="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Coins</p><p class="text-3xl md:text-4xl font-black text-yellow-400 drop-shadow-lg">${pts2coins.toLocaleString()}</p></div></section>
            <hr class="border-white/10" />
            <section><h3 class="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2"><span class="text-2xl">📊</span> Performance Radar</h3><div class="grid grid-cols-1 lg:grid-cols-3 gap-8">${['muscu','street','cardio'].map(t => `
                <div class="flex flex-col items-center"><h4 class="font-semibold text-xs text-gray-500 mb-2 uppercase tracking-wider">${CATEGORY_NAMES[t]}</h4><div class="relative w-full h-64 md:h-56 bg-black/30 rounded-xl border border-white/5 shadow-inner p-2"><canvas id="chart-${t}"></canvas></div></div>`).join('')}</div></section>
            <hr class="border-white/10" />
            <section><h3 class="text-xl font-bold text-gray-100 mb-4">Détails des scores</h3><div class="grid md:grid-cols-3 gap-4">${scoresHtml || '<p class="text-gray-500 italic col-span-3 text-center">Aucune performance enregistrée.</p>'}</div></section>
            ${(user.bio || user.instagram) ? '<hr class="border-white/10" />' : ''}
            <div class="grid md:grid-cols-2 gap-6">${user.bio ? `<section><h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Biographie</h3><p class="text-gray-300 whitespace-pre-wrap text-sm bg-black/20 p-3 rounded-lg border border-white/5">${user.bio}</p></section>` : ''}${user.instagram ? `<section><h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Réseaux</h3><a href="https://instagram.com/${user.instagram}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> @${user.instagram}</a></section>` : ''}</div>
        </div>
    </section>`;
}