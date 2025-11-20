/* static/js/ui/sidebar.js */
export function sideBar (active = 'dashboard', user = {}) {
  const avatar   = user.photoURL   || '/static/images/ranks/rank.png';
  const username = user.displayName || 'Utilisateur';
  const email    = user.email      || '';

  return /* html */ `
  <aside class="w-full lg:w-64 flex-shrink-0 
                liquid-glass-card
                rounded-2xl p-6 space-y-8"
         data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.01">
    
    <div class="text-center">
      <div class="relative w-20 h-20 mx-auto mb-3">
        <div class="absolute inset-0 bg-pink-500 blur-lg opacity-40 rounded-full"></div>
        <img src="${avatar}" class="relative w-full h-full rounded-full ring-2 ring-white/20 object-cover">
      </div>
      <p class="font-bold text-gray-100 tracking-wide">${username}</p>
      <p class="text-xs text-gray-500 break-all">${email}</p>
    </div>

    <ul class="space-y-2 text-sm">
      ${[
        ['dashboard', 'Mon Profile',     '📊'],
        ['friends',   'Amis',            '🧑‍🤝‍🧑'],
        ['contrib',   'Contributions',   '🎁'],
        ['activity',  'Mon Activité',    '⚡'],
        ['refer',     'Parrainer un Ami', '🎉'],
        ['settings',  'Paramètres',       '⚙️']
      ].map(([k, label, icon]) => `
        <li>
          <a href="/profile/${k}" data-link
             class="flex items-center gap-3 py-2.5 px-4 rounded-lg font-medium transition-all
                     ${active === k
                       ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                       : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'}">
            <span class="text-lg">${icon}</span><span>${label}</span>
          </a>
        </li>`).join('')}
    </ul>
  </aside>`
}