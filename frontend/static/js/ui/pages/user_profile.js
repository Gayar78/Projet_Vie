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
      <div class="bg-white/10 p-4 rounded-lg">
        <h4 class="font-semibold text-purple-300">${CATEGORY_NAMES[key] || key}</h4>
        <p class="text-2xl font-bold">${(value && value.total) ? value.total.toLocaleString() : 0} pts</p>

        <div class="mt-2 text-sm text-gray-300 space-y-1">
          ${Object.entries(value || {})
            .filter(([exKey]) => exKey !== 'total')
            .map(([exKey, exPoints]) => `
              <div class="flex justify-between">
                <span class="capitalize">${exKey.replace('_', ' ')}:</span>
                <span class="font-medium">${exPoints.toLocaleString()}</span>
              </div>
            `).join('')}
        </div>
      </div>
    `).join('');

  return /* html */ `
  <section class="relative min-h-[calc(100vh-160px)] pt-28 px-6 pb-20">
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <div class="max-w-4xl mx-auto space-y-12">

      <section class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 
                      flex flex-col sm:flex-row items-center gap-6">

        <img src="${avatar}" alt="avatar" 
             class="w-24 h-24 rounded-full object-cover flex-shrink-0" />
        <img src="${rankImg}" alt="rank" class="w-24 h-24 object-contain flex-shrink-0" />

        <div class="text-center sm:text-left flex-1">
          
          <h1 class="text-3xl font-bold">${user.displayName || 'Athlète'}</h1>
          
          ${user.bio ? `
            <p class="mt-2 text-sm text-gray-300 max-w-lg whitespace-pre-wrap">${user.bio}</p>
          ` : ''}
          
          ${user.instagram ? `
            <p class="mt-4 text-sm">
              <a href="https://instagram.com/${user.instagram}"
                 target="_blank" rel="noopener"
                 class="text-pink-400 hover:underline">
                  Instagrame : @${user.instagram}
              </a>
            </p>` : ''}
        </div>
        
        <div class="ml-auto text-center border-l border-white/10 pl-6 flex-shrink-0">
          <p class="text-gray-400">Points Totaux</p>
          <p class="text-3xl font-semibold text-pink-400">${(user.points || 0).toLocaleString()}</p>
        </div>
      </section>

      <section class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
        <h3 class="text-lg font-semibold mb-4">Scores détaillés de l'athlète</h3>
        <div class="grid md:grid-cols-3 gap-4">
          ${scoresHtml || '<p class="text-gray-400">Aucun score enregistré.</p>'}
        </div>
      </section>

    </div> 
  </section>`
}