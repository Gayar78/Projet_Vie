/* frontend/static/js/ui/sidebar.js */

export function sideBar (active = 'dashboard', user = {}) {
  const avatar   = user.photoURL   || '/static/images/ranks/rank.png';
  const username = user.displayName || 'Utilisateur';
  const email    = user.email      || '';

  // Configuration des items du menu avec des icônes SVG (Path)
  const menuItems = [
    { 
      key: 'dashboard', 
      label: 'Mon Profil', 
      path: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' 
    },
    { 
      key: 'friends', 
      label: 'Amis', 
      path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
    { 
      key: 'contrib', 
      label: 'Contributions', 
      path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' 
    },
    { 
      key: 'activity', 
      label: 'Mon Activité', 
      path: 'M13 10V3L4 14h7v7l9-11h-7z' 
    },
    { 
      key: 'refer', 
      label: 'Parrainer', 
      path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' 
    },
    { 
      key: 'settings', 
      label: 'Paramètres', 
      path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
    }
  ];

  return /* html */ `
  <aside class="hidden lg:block w-64 flex-shrink-0 
                liquid-glass-card
                rounded-2xl p-6 space-y-8 sticky top-24 h-fit"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
    
    <div class="text-center">
      <div class="relative w-20 h-20 mx-auto mb-3 group">
        <div class="absolute inset-0 bg-pink-500 blur-lg opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
        <img src="${avatar}" class="relative w-full h-full rounded-full ring-2 ring-white/20 object-cover transition-transform group-hover:scale-105">
      </div>
      <p class="font-bold text-white tracking-wide truncate">${username}</p>
      <p class="text-xs text-gray-500 break-all">${email}</p>
    </div>

    <ul class="space-y-1 text-sm">
      ${menuItems.map(item => `
        <li>
          <a href="/profile/${item.key}" data-link
             class="flex items-center gap-4 py-3 px-4 rounded-xl font-medium transition-all duration-200 group
                     ${active === item.key
                       ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30 shadow-lg shadow-pink-900/20'
                       : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}">
            <svg class="w-5 h-5 ${active === item.key ? 'text-pink-400' : 'text-gray-500 group-hover:text-white'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.path}"></path>
            </svg>
            <span>${item.label}</span>
          </a>
        </li>`).join('')}
    </ul>
  </aside>`
}