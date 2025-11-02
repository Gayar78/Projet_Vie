/* static/js/ui/sidebar.js
   ─────────────────────────────────────────────────────────── */

export function sideBar (active = 'dashboard', user = {}) {
  // CORRIGÉ ICI : on utilise photoURL et displayName
  const avatar   = user.photoURL   || '/static/images/ranks/rank.png'
  const username = user.displayName || 'Utilisateur'
  const email    = user.email      || ''

  return /* html */ `
  <aside class="w-full lg:w-64 flex-shrink-0 bg-white/5 rounded-2xl border border-white/10
               backdrop-blur-md p-6 space-y-8 scrollbar-hide">
    <div class="text-center">
      <img src="${avatar}"
           class="w-20 h-20 mx-auto rounded-full ring-2 ring-pink-500/40 object-cover">
      <p class="mt-3 font-semibold text-white">${username}</p>
      <p class="text-xs text-gray-400 break-all">${email}</p>
    </div>

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
             class="flex items-center gap-3 py-2 px-3 rounded-lg
                     ${active === k
                       ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white'
                       : 'hover:bg-white/10'}">
            <span>${icon}</span><span>${label}</span>
          </a>
        </li>`).join('')}
    </ul>
  </aside>`
}

/* rien à changer ici, mais on ré-exporte si le reste du code l’utilise */
export function updateNavHTML () { /* déjà défini dans nav.js */ }