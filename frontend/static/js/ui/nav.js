/* frontend/static/js/ui/nav.js */
import { bindForms } from './forms.js'
import { api }       from '../core/api.js'

/* --- 1. TOP NAV (DESKTOP ONLY) --- */
const DESKTOP_NAV = /* html */ `
<nav id="desktop-nav"
     class="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-40
            bg-gray-900/70 backdrop-blur-xl border border-white/10
            rounded-full px-8 py-2 items-center shadow-xl shadow-black/20 transition-all duration-300 hover:bg-gray-900/90">
  <div class="flex items-center gap-10 mx-auto">
    <a href="/" data-link class="flex items-center gap-2 font-semibold text-white hover:text-pink-400 transition">
      <img src="/static/images/logo.png" alt="Logo" class="w-8 h-8 select-none" />
      <span class="tracking-wide">DraftPrime</span>
    </a>
    <ul class="flex items-center gap-6 text-sm font-medium text-gray-300">
      <li><a href="/market" data-link class="hover:text-white transition">Market</a></li>
      <li><a href="/leaderboard" data-link class="hover:text-white transition">Classement</a></li>
      <li><a href="/standards" data-link class="hover:text-white transition">Règles</a></li>
    </ul>
  </div>
  <div id="nav-right-desktop" class="flex items-center gap-4 ml-6"></div>
</nav>`;

/* --- 2. BOTTOM NAV (MOBILE ONLY) --- */
const MOBILE_NAV = /* html */`
<nav id="mobile-nav" 
     class="md:hidden fixed bottom-0 left-0 w-full z-50 
            bg-gray-900/90 backdrop-blur-xl border-t border-white/10 
            flex justify-around items-center py-3 px-2 shadow-2xl pb-safe">
    
    <a href="/" data-link class="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500 transition p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span class="text-[10px] font-medium">Home</span>
    </a>

    <a href="/leaderboard" data-link class="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500 transition p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        <span class="text-[10px] font-medium">Rank</span>
    </a>

    <!-- Gros bouton Central (+) -->
    <a href="/profile/contrib" data-link class="relative -top-5 bg-pink-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-pink-600/40 border-4 border-gray-900 transform transition-transform active:scale-95">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    </a>

    <a href="/market" data-link class="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500 transition p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        <span class="text-[10px] font-medium">Market</span>
    </a>

    <a href="/profile/dashboard" data-link class="flex flex-col items-center gap-1 text-gray-400 hover:text-pink-500 transition p-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <span class="text-[10px] font-medium">Profil</span>
    </a>
</nav>
`;

const SEARCH_BAR_HTML = /* html */`
<div id="search-container" class="fixed top-4 right-4 z-40 hidden md:block"> <!-- Caché sur mobile -->
  <div class="relative">
    <input type="search" id="navbar-search" placeholder="Chercher un athlète..." autocomplete="off" class="w-64 px-4 py-1.5 rounded-full bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-lg text-sm text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500" />
    <div id="navbar-search-results" class="absolute right-0 mt-3 w-64 origin-top-right rounded-xl bg-gray-900/90 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl opacity-0 scale-95 pointer-events-none max-h-60 overflow-y-auto transition-all duration-200 ease-out"></div>
  </div>
</div>`;

function mountNavOnce () {
  if (!document.getElementById('desktop-nav')) document.body.insertAdjacentHTML('afterbegin', DESKTOP_NAV);
  if (!document.getElementById('mobile-nav')) document.body.insertAdjacentHTML('beforeend', MOBILE_NAV);
  if (!document.getElementById('search-container')) document.body.insertAdjacentHTML('beforeend', SEARCH_BAR_HTML);

  // Search Logic (inchangé)
  const searchInput = document.getElementById('navbar-search');
  const resultsDiv = document.getElementById('navbar-search-results');
  if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(async () => {
              const term = e.target.value.toLowerCase().trim();
              if (term.length < 1) { resultsDiv.innerHTML = ''; resultsDiv.classList.add('opacity-0', 'pointer-events-none'); return; }
              const resp = await fetch(`/api/search_users?term=${term}`);
              const users = await resp.json();
              resultsDiv.innerHTML = users.length ? users.map(u => `<a href="/user/${u.id}" data-link class="block px-4 py-3 text-sm text-gray-200 hover:bg-white/10">${u.displayName}</a>`).join('') : '<p class="px-4 py-3 text-sm text-gray-500">Aucun résultat</p>';
              resultsDiv.classList.remove('opacity-0', 'pointer-events-none');
          }, 250);
      });
  }
}

export async function updateNavHTML () {
  const navRight = document.getElementById('nav-right-desktop');
  if (!navRight) return;
  const logged = !!localStorage.getItem('token');

  if (!logged) {
    navRight.innerHTML = `<a href="/login" data-link class="font-semibold text-gray-300 hover:text-white transition">Log&nbsp;In</a>`;
    return;
  }

  const displayName = localStorage.getItem('displayName') || 'Account';
  navRight.innerHTML = `
  <div id="account-wrapper" class="relative">
    <button id="account-btn" class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-white/10 transition">
      <span class="font-semibold text-gray-100">${displayName}</span>
    </button>
    <div id="account-menu" class="absolute right-0 mt-3 w-48 origin-top-right rounded-xl bg-gray-900/95 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl opacity-0 scale-95 pointer-events-none transition-all duration-200 ease-out">
      <a href="/profile" data-link class="block px-5 py-3 text-sm text-gray-200 hover:bg-white/10 rounded-t-xl">Profile</a>
      <a href="/" id="logout" class="block px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Déconnexion</a>
    </div>
  </div>`;
  
  // Logout Logic Desktop
  const btn = navRight.querySelector('#account-btn');
  const menu = navRight.querySelector('#account-menu');
  if(btn) btn.onclick = () => { menu.classList.toggle('opacity-0'); menu.classList.toggle('pointer-events-none'); };
  navRight.querySelector('#logout')?.addEventListener('click', e => { e.preventDefault(); localStorage.removeItem('token'); updateNavHTML(); history.pushState(null, '', '/'); dispatchEvent(new PopStateEvent('popstate')); });
}

export function renderPage (path) { mountNavOnce(); updateNavHTML(); bindForms(path); }
export function mountNavAtStartup () { mountNavOnce(); updateNavHTML(); }