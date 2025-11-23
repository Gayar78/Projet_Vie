/* frontend/static/js/ui/pages/profile/activity.js */
import { api } from '../../../core/api.js';

function formatDate(timestamp) {
    if (!timestamp || !timestamp.seconds) return 'Date inconnue';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function mount(user) {
    const container = document.getElementById('activity-feed-container');
    if (!container) return;

    const loadActivities = async () => {
        try {
            container.innerHTML = '<div class="flex justify-center p-8"><div class="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>';
            
            const activities = await api('/profile/activity', null, 'GET');
            
            if (activities.length === 0) {
                container.innerHTML = `
                <div class="text-center p-8 border border-white/5 rounded-xl bg-white/5">
                    <p class="text-gray-400 text-sm mb-2">Aucune activité pour le moment.</p>
                    <a href="/profile/contrib" data-link class="text-pink-400 font-bold text-sm hover:underline">Soumettre une première performance</a>
                </div>`;
                return;
            }

            container.innerHTML = activities.map(act => {
                const status = act.status || 'pending';
                const perf = act.performance || {};
                
                // Construction du texte de perf (ex: 100kg • 5 reps)
                const perfHtml = [
                    perf.weight ? `${perf.weight}kg` : '',
                    perf.reps ? `${perf.reps} reps` : '',
                    perf.distance ? `${perf.distance} km` : '',
                    perf.time ? `${perf.time}` : ''
                ].filter(Boolean).join(' <span class="text-white/20 text-xs mx-1">•</span> ');

                // Styles selon le statut
                let statusStyle = '';
                let icon = '';
                let details = '';

                if (status === 'approved') {
                    statusStyle = 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10';
                    icon = `<div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>`;
                    details = `
                        <div class="mt-2 flex items-center gap-3">
                            <span class="text-lg font-black text-white">+${act.points_awarded || 0} <span class="text-xs font-normal text-gray-500">PTS</span></span>
                            ${act.is_personal_record ? '<span class="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold uppercase border border-yellow-500/30">New Record</span>' : ''}
                            ${act.level_equivalent ? `<span class="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-[10px] uppercase">Niveau ${act.level_equivalent}</span>` : ''}
                        </div>
                    `;
                } else if (status === 'rejected') {
                    statusStyle = 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10';
                    icon = `<div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </div>`;
                    details = `
                        <div class="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p class="text-xs text-red-300 font-bold uppercase mb-1">Motif du refus :</p>
                            <p class="text-sm text-red-100">"${act.rejection_reason || 'Non respect des standards'}"</p>
                        </div>
                    `;
                } else { // Pending
                    statusStyle = 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10';
                    icon = `<div class="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 animate-pulse">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>`;
                    details = `<p class="text-xs text-yellow-200/70 mt-1 italic">En attente de validation par un administrateur...</p>`;
                }
                
                return `
                <div class="group border p-5 rounded-2xl flex gap-5 transition-all duration-300 ${statusStyle}">
                    <div class="flex-shrink-0 mt-1">
                        ${icon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-white capitalize text-base tracking-wide">${act.exercise.replace('_', ' ')}</h3>
                                <p class="text-xs text-pink-400 font-bold uppercase tracking-wider mb-1">${act.category}</p>
                            </div>
                            <span class="text-[10px] font-medium uppercase text-gray-500 whitespace-nowrap">${formatDate(act.submitted_at)}</span>
                        </div>
                        
                        <div class="font-mono text-sm text-gray-300 bg-black/20 inline-block px-3 py-1 rounded border border-white/5">
                            ${perfHtml}
                        </div>

                        ${details}
                    </div>
                </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            // Affichage clair de l'erreur pour debug (souvent l'index manquant)
            if (error.message && error.message.includes("index")) {
                container.innerHTML = `
                <div class="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-center">
                    <p class="text-red-200 font-bold mb-2">⚠️ Configuration Requise</p>
                    <p class="text-xs text-red-300">L'index Firestore est manquant. Regarde ton terminal Backend (Python), copie le lien affiché et ouvre-le pour créer l'index.</p>
                </div>`;
            } else {
                container.innerHTML = `<p class="text-center text-red-400 text-sm mt-8">Impossible de charger l'activité.</p>`;
            }
        }
    };
    loadActivities();
}

export default user => `
  <div class="liquid-glass-card rounded-3xl p-8 space-y-8 animate-spring-in"
       data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
    
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            MON ACTIVITÉ
        </h2>
        <a href="/profile/contrib" data-link class="text-xs font-bold text-gray-400 hover:text-white transition uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full hover:bg-white/5">+ Nouvelle Perf</a>
    </div>

    <div id="activity-feed-container" class="space-y-4 min-h-[200px]">
        <!-- Le contenu sera injecté ici -->
    </div>
  </div>
`;