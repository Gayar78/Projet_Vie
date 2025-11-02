// frontend/static/js/ui/pages/profile/activity.js
import { api } from '../../../core/api.js';

// Fonction pour formater la date
function formatDate(timestamp) {
    if (!timestamp || !timestamp.seconds) {
        return 'Date inconnue';
    }
    // Multiplie par 1000 pour convertir les secondes en millisecondes
    const date = new Date(timestamp.seconds * 1000); 
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// ------------------------------------------------------------------
// 1. Logique (appelée par le routeur après l'affichage)
// ------------------------------------------------------------------
export function mount(user) {
    const container = document.getElementById('activity-feed-container');
    if (!container) return;

    const loadActivities = async () => {
        try {
            container.innerHTML = '<p class="text-gray-400">Chargement de votre historique...</p>';

            // 1. Appelle le nouvel endpoint (GET, pas de body)
            const activities = await api('/profile/activity', null, 'GET');

            if (activities.length === 0) {
                container.innerHTML = '<p class="text-gray-400">Aucune performance validée pour le moment.</p>';
                return;
            }

            // 2. Construit le HTML pour chaque activité
            container.innerHTML = activities.map(act => {
                // Recrée la chaîne de performance
                const perf = act.performance || {};
                const perfHtml = [
                    perf.weight ? `Poids: <strong>${perf.weight} kg</strong>` : '',
                    perf.reps ? `Reps: <strong>${perf.reps}</strong>` : '',
                    perf.distance ? `Distance: <strong>${perf.distance} km</strong>` : '',
                    perf.time ? `Temps: <strong>${perf.time}</strong>` : '',
                    perf.message ? `Message: <strong>${perf.message}</strong>` : ''
                ].filter(Boolean).join(' / ');

                return `
                <div class="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center gap-4">
                    <div class="flex-shrink-0 w-16 h-16 bg-pink-500/20 rounded-lg flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold text-pink-400">+${act.points_awarded || 0}</span>
                        <span class="text-xs text-pink-300">pts</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold capitalize text-white">${act.exercise.replace('_', ' ')}</p>
                        <p class="text-sm text-gray-300">${perfHtml}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            Validé le ${formatDate(act.approved_at)} (Niv. ${act.level_equivalent || '?'})
                        </p>
                    </div>
                </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            // Si l'erreur est un problème d'index, on l'affiche
            if (error.message && error.message.includes("index")) {
                 container.innerHTML = `<p class="text-red-400">
                    <strong>Erreur Backend :</strong> Un index Firestore est requis. 
                    Veuillez vérifier votre console backend (Uvicorn), copier le lien de l'erreur,
                    et le coller dans votre navigateur pour créer l'index manquant.
                 </p>`;
            } else {
                container.innerHTML = `<p class="text-red-400">Erreur lors du chargement de l'activité.</p>`;
            }
        }
    };

    loadActivities();
}

// ------------------------------------------------------------------
// 2. Le HTML de la page
// ------------------------------------------------------------------
export default user => `
  <div class="space-y-8">
    <h2 class="text-3xl font-bold">Mon Activité</h2>
    <div id="activity-feed-container" class="space-y-4">
      </div>
  </div>
`;