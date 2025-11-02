/* static/js/ui/sidebar.js
   ─────────────────────────────────────────────────────────── */

export function sideBar (active = 'dashboard', user = {}) {
  // On utilise les bonnes variables de l'objet user
  const avatar   = user.photoURL   || '/static/images/ranks/rank.png';
  const username = user.displayName || 'Utilisateur';
  const email    = user.email      || '';

  return /* html */ `
  <!-- MODIFIÉ : Nouveau style "Glass" clair -->
  <aside class="w-full lg:w-64 flex-shrink-0 
                bg-white/70 backdrop-blur-lg border border-white/30 shadow-xl
                rounded-2xl p-6 space-y-8 scrollbar-hide">
    
    <!-- MODIFIÉ : Couleurs de texte sombres -->
    <div class="text-center">
      <img src="${avatar}"
           class="w-20 h-20 mx-auto rounded-full ring-2 ring-pink-500/40 object-cover">
      <p class="mt-3 font-semibold text-gray-900">${username}</p>
      <p class="text-xs text-gray-600 break-all">${email}</p>
    </div>

    <!-- MODIFIÉ : Couleurs de texte et styles de survol -->
    <ul class="space-y-2 text-sm">
      ${[
        ['dashboard', 'Mon Profile',     '📊'],
        ['contrib',   'Contributions',   '🎁'],
        ['activity',  'Mon Activité',    '⚡'],
        ['refer',     'Parrainer un Ami', '🎉'],
        ['settings',  'Paramètres',       '⚙️']
      ].map(([k, label, icon]) => `
        <li>
          <a href="/profile/${k}" data-link
             class="flex items-center gap-3 py-2 px-3 rounded-lg font-medium
                     ${active === k
                       // Style actif
                       ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-700'
                       // Style inactif et survol
                       : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'}">
            <span>${icon}</span><span>${label}</span>
          </a>
        </li>`).join('')}
    </ul>
  </aside>`
}

// Cette fonction est un import circulaire inutile, mais on la garde
// au cas où d'autres fichiers dépendent de son exportation.
export function updateNavHTML () { /* ne fait rien */ }
