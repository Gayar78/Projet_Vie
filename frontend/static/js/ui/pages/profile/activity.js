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
            container.innerHTML = '<p class="text-gray-600">Chargement de votre historique...</p>';
            
            // 1. Appelle le nouvel endpoint (GET, pas de body)
            const activities = await api('/profile/activity', null, 'GET');
            
            if (activities.length === 0) {
                container.innerHTML = '<p class="text-gray-600">Aucune performance validée pour le moment.</p>';
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
                <!-- MODIFIÉ : Carte "Glass" pour chaque activité -->
                <div class="bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg p-4 rounded-lg flex items-center gap-4">
                    <div class="flex-shrink-0 w-16 h-16 bg-pink-500/20 rounded-lg flex flex-col items-center justify-center">
                        <span class="text-2xl font-bold text-pink-600">+${act.points_awarded || 0}</span>
                        <span class="text-xs text-pink-500">pts</span>
                    </div>
                    <!-- MODIFIÉ : Texte sombre -->
                    <div class="flex-1">
                        <p class="font-semibold capitalize text-gray-900">${act.exercise.replace('_', ' ')}</p>
                        <p class="text-sm text-gray-700">${perfHtml}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            Validé le ${formatDate(act.approved_at)} 
                            (Niv. ${act.level_equivalent || '?'})
                            ${act.is_personal_record ? '<strong class="ml-2 text-yellow-600">★ Record Perso !</strong>' : ''}
                        </p>
                    </div>
                </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            // Si l'erreur est un problème d'index, on l'affiche
            if (error.message && error.message.includes("index")) {
                 container.innerHTML = `<p class="text-red-500">
                    <strong>Erreur Backend :</strong> Un index Firestore est requis. 
                    Veuillez vérifier votre console backend (Uvicorn), copier le lien de l'erreur,
                    et le coller dans votre navigateur pour créer l'index manquant.
                 </p>`;
            } else {
                container.innerHTML = `<p class="text-red-500">Erreur lors du chargement de l'activité.</p>`;
            }
        }
    };

    loadActivities();
}

// ------------------------------------------------------------------
// 2. Le HTML de la page
// ------------------------------------------------------------------
export default user => `
  <!-- MODIFIÉ : Panneau "Glass" unifié -->
  <div class="liquid-glass-card rounded-2xl p-6 space-y-6">
    <h2 class="text-3xl font-bold text-gray-900">Mon Activité</h2>
    <div id="activity-feed-container" class="space-y-4">
      <!-- Le contenu sera chargé par la fonction mount() -->
    </div>
  </div>
`;
