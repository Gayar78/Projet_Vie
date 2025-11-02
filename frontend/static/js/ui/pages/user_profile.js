// frontend/static/js/ui/pages/user_profile.js
import { rankFromPoints } from './leaderboard.js';

// Helper pour mapper les slugs aux jolis noms (copié de dashboard.js)
const CATEGORY_NAMES = {
    muscu: 'Musculation',
    street: 'Street Workout',
    cardio: 'Cardio',
    general: 'Total'
};

export default function userProfilePage (user = {}) {
  /* ------- helpers --------------------------------------- */
  const rankImg = `/static/images/ranks/${rankFromPoints(user.points || 0)}.png`;
  const avatar = user.photoURL || '/static/images/ranks/rank.png'; // Fallback

  // HTML pour les scores par catégorie
  const scoresHtml = Object.entries(user.scores || {})
    .filter(([key]) => key !== 'general')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `
      <!-- MODIFIÉ : Style Glass clair pour les cartes -->
      <div class="bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg p-4 rounded-lg">
        <h4 class="font-semibold text-purple-600">${CATEGORY_NAMES[key] || key}</h4>
        <p class="text-2xl font-bold text-gray-900">${(value && value.total) ? value.total.toLocaleString() : 0} pts</p>

        <!-- MODIFIÉ : Texte sombre -->
        <div class="mt-2 text-sm text-gray-700 space-y-1">
          ${Object.entries(value || {})
            .filter(([exKey]) => exKey !== 'total')
            .map(([exKey, exPoints]) => `
              <div class="flex justify-between">
                <span class="capitalize">${exKey.replace('_', ' ')}:</span>
                <span class="font-medium text-gray-900">${exPoints.toLocaleString()}</span>
              </div>
            `).join('')}
        </div>
      </div>
    `).join('');

  return /* html */ `
  <section class="relative min-h-[calc(100vh-160px)] pt-28 px-6 pb-20">

    <!-- MODIFIÉ : Un seul panneau "liquide" pour tout le profil -->
    <div class="max-w-4xl mx-auto space-y-6 liquid-glass-card rounded-2xl p-6">

      <!-- BLOC 1: INFOS PUBLIQUES -->
      <section class="flex flex-col sm:flex-row items-center gap-6">
        <img src="${avatar}" alt="avatar" 
             class="w-24 h-24 rounded-full object-cover flex-shrink-0 ring-2 ring-white/50" />
        <img src="${rankImg}" alt="rank" class="w-24 h-24 object-contain flex-shrink-0" />
        
        <!-- MODIFIÉ : Texte sombre -->
        <div class="text-center sm:text-left flex-1">
          <h1 class="text-3xl font-bold text-gray-900">${user.displayName || 'Athlète'}</h1>
          
          ${user.bio ? `
            <p class="mt-2 text-sm text-gray-700 max-w-lg whitespace-pre-wrap">${user.bio}</p>
          ` : ''}
          
          ${user.instagram ? `
            <p class="mt-4 text-sm">
              <a href="https://instagram.com/${user.instagram}"
                 target="_blank" rel="noopener"
                 class="font-medium text-pink-600 hover:underline">
                  @${user.instagram}
              </a>
            </p>` : ''}
        </div>
        
        <!-- MODIFIÉ : Texte sombre -->
        <div class="ml-auto text-center border-l border-gray-900/10 pl-6 flex-shrink-0">
          <p class="text-gray-600">Points Totaux</p>
          <p class="text-3xl font-semibold text-pink-600">${(user.points || 0).toLocaleString()}</p>
        </div>
      </section>

      <!-- SÉPARATEUR LIQUIDE -->
      <hr class="border-black/10" />

      <!-- BLOC 2: SCORES DÉTAILLÉS -->
      <section>
        <h3 class="text-lg font-semibold mb-4 text-gray-900">Scores détaillés de l'athlète</h3>
        <div class="grid md:grid-cols-3 gap-4">
          ${scoresHtml || '<p class="text-gray-600">Aucun score enregistré.</p>'}
        </div>
      </section>

    </div> 
  </section>`
}
