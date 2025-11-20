/* frontend/static/js/ui/pages/profile/activity.js */
import { api } from '../../../core/api.js';

function formatDate(timestamp) {
    if (!timestamp || !timestamp.seconds) return 'Date inconnue';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function mount(user) {
    const container = document.getElementById('activity-feed-container');
    if (!container) return;

    const loadActivities = async () => {
        try {
            container.innerHTML = '<p class="text-gray-500 animate-pulse">Chargement de votre historique...</p>';
            const activities = await api('/profile/activity', null, 'GET');
            
            if (activities.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic">Aucune activité récente.</p>';
                return;
            }

            container.innerHTML = activities.map(act => {
                const perf = act.performance || {};
                const perfHtml = [
                    perf.weight ? `${perf.weight} kg` : '',
                    perf.reps ? `${perf.reps} reps` : '',
                    perf.distance ? `${perf.distance} km` : '',
                    perf.time ? `${perf.time}` : ''
                ].filter(Boolean).join(' • ');
                
                return `
                <div class="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 p-4 rounded-xl flex items-center gap-5 transition-all duration-200">
                    <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex flex-col items-center justify-center border border-white/5 group-hover:border-pink-500/30 transition-colors">
                        <span class="text-xl font-bold text-pink-400">+${act.points_awarded || 0}</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <p class="font-bold text-gray-100 capitalize text-lg tracking-tight">${act.exercise.replace('_', ' ')}</p>
                            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-black/30 px-2 py-1 rounded">${formatDate(act.approved_at)}</span>
                        </div>
                        <div class="flex items-center gap-3 mt-1">
                             <p class="text-sm text-gray-300 font-medium">${perfHtml}</p>
                             ${act.is_personal_record ? '<span class="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30 font-bold">NEW RECORD</span>' : ''}
                        </div>
                        ${act.level_equivalent ? `<p class="text-xs text-gray-500 mt-1">Niveau ${act.level_equivalent}</p>` : ''}
                    </div>
                </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            container.innerHTML = `<p class="text-red-400">Erreur de chargement.</p>`;
        }
    };
    loadActivities();
}

export default user => `
  <div class="liquid-glass-card rounded-2xl p-8 space-y-6 animate-spring-in"
       data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
    <h2 class="text-2xl font-bold text-white flex items-center gap-3">
        <span class="bg-purple-500 w-2 h-8 rounded-full"></span> Historique
    </h2>
    <div id="activity-feed-container" class="space-y-3"></div>
  </div>
`;