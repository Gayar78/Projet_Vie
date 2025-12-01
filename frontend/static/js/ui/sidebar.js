/* frontend/static/js/ui/sidebar.js */

// Fonction globale pour ouvrir/fermer le menu mobile
window.toggleProfileMenu = () => {
    const menu = document.getElementById('mobile-profile-drawer');
    const overlay = document.getElementById('mobile-profile-overlay');
    const content = document.getElementById('mobile-profile-content');
    
    if (menu.classList.contains('hidden')) {
        // OUVRIR
        menu.classList.remove('hidden');
        // Petit délai pour permettre la transition CSS
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            content.classList.remove('-translate-x-full');
        }, 10);
    } else {
        // FERMER
        overlay.classList.add('opacity-0');
        content.classList.add('-translate-x-full');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300); // Attendre la fin de la transition (300ms)
    }
};

export function sideBar (active = 'dashboard', user = {}) {
  const avatar   = user.photoURL   || '/static/images/ranks/rank.png';
  const username = user.displayName || 'Utilisateur';
  const email    = user.email      || '';

  const menuItems = [
    { key: 'dashboard', label: 'Mon Profil', path: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { key: 'friends', label: 'Amis', path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { key: 'contrib', label: 'Contributions', path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { key: 'activity', label: 'Mon Activité', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { key: 'refer', label: 'Parrainer', path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
    { key: 'settings', label: 'Paramètres', path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  const generateLinks = () => menuItems.map(item => `
    <li>
      <a href="/profile/${item.key}" data-link onclick="toggleProfileMenu()"
         class="flex items-center gap-4 py-3 px-4 rounded-xl font-medium transition-all duration-200 group
                 ${active === item.key
                   ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30 shadow-lg shadow-pink-900/20'
                   : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}">
        <svg class="w-5 h-5 ${active === item.key ? 'text-pink-400' : 'text-gray-500 group-hover:text-white'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.path}"></path>
        </svg>
        <span>${item.label}</span>
      </a>
    </li>`).join('');

  return /* html */ `
  <!-- 1. VERSION DESKTOP (Sidebar Classique) -->
  <aside class="hidden lg:block w-64 flex-shrink-0 liquid-glass-card rounded-2xl p-6 space-y-8 sticky top-24 h-fit"
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
      ${generateLinks()}
    </ul>
  </aside>

  <!-- 2. VERSION MOBILE (Header + Tiroir) -->
  <div class="lg:hidden w-full mb-6">
    
    <!-- BARRE HEADER PROFIL MOBILE -->
    <div class="liquid-glass-card p-4 rounded-xl flex items-center justify-between border border-white/10">
        <div class="flex items-center gap-3">
            <img src="${avatar}" class="w-10 h-10 rounded-full ring-2 ring-white/10 object-cover">
            <div>
                <p class="font-bold text-white text-sm truncate w-32">${username}</p>
                <p class="text-[10px] text-gray-400">Menu Profil</p>
            </div>
        </div>
        <button onclick="toggleProfileMenu()" class="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors border border-white/10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>

    <!-- TIROIR (DRAWER) CACHÉ PAR DÉFAUT -->
    <div id="mobile-profile-drawer" class="fixed inset-0 z-[60] hidden">
        <!-- Overlay sombre (click to close) -->
        <div id="mobile-profile-overlay" onclick="toggleProfileMenu()" class="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
        
        <!-- Contenu Tiroir (Slide depuis la gauche) -->
        <div id="mobile-profile-content" class="absolute top-0 left-0 h-full w-4/5 max-w-xs bg-[#0a0a0a] border-r border-white/10 p-6 transform -translate-x-full transition-transform duration-300 ease-out shadow-2xl">
            
            <div class="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h3 class="text-xl font-black text-white tracking-wider">MENU</h3>
                <button onclick="toggleProfileMenu()" class="text-gray-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Info User Rapide -->
            <div class="mb-8 flex items-center gap-3">
                 <img src="${avatar}" class="w-12 h-12 rounded-full ring-2 ring-white/10 object-cover">
                 <div>
                    <p class="font-bold text-white text-sm truncate w-40">${username}</p>
                    <p class="text-xs text-gray-500">En ligne</p>
                 </div>
            </div>

            <ul class="space-y-2 text-sm">
                ${generateLinks()}
            </ul>

            <div class="absolute bottom-8 left-6 right-6">
                <p class="text-xs text-center text-gray-600 uppercase tracking-widest">DraftPrime Mobile</p>
            </div>
        </div>
    </div>

  </div>
  `
}