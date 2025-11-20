/* static/js/ui/nav.js */
import { bindForms } from './forms.js'
import { api }       from '../core/api.js'

const NAV_HTML = /* html */ `
<nav id="main-nav"
     class="fixed top-4 left-1/2 -translate-x-1/2 z-30
            bg-gray-900/70 backdrop-blur-xl border border-white/10
            rounded-full px-8 py-2 flex items-center shadow-xl shadow-black/20">

  <div class="flex items-center gap-10 mx-auto">
    <a href="/" data-link class="flex items-center gap-2 font-semibold text-white hover:text-pink-400 transition">
      <img src="/static/images/logo.png" alt="DraftPrime logo" class="w-10 h-10 select-none" />
      <span class="tracking-wide">DraftPrime</span>
    </a>

    <ul class="flex items-center gap-8 text-sm font-medium text-gray-300">
      <li><a href="/leaderboard" data-link class="hover:text-white transition">Leaderboard</a></li>
      <li><a href="https://github.com/" target="_blank" rel="noopener" class="hover:text-white transition">GitHub&nbsp;↗︎</a></li>
    </ul>
  </div>
  <div id="nav-right" class="flex items-center gap-4 ml-6"></div>
</nav>`

const SEARCH_BAR_HTML = /* html */`
<div id="search-container" class="fixed top-4 right-4 z-30">
  <div class="relative">
    <input type="search" id="navbar-search"
           placeholder="Chercher un athlète..."
           autocomplete="off"
           class="w-64 px-4 py-1.5 rounded-full bg-gray-900/70 backdrop-blur-xl 
                  border border-white/10 shadow-lg text-sm text-white placeholder-gray-400
                  focus:ring-pink-500 focus:border-pink-500" />
    
    <div id="navbar-search-results"
         class="absolute right-0 mt-3 w-64 origin-top-right
                rounded-xl bg-gray-900/90 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl
                opacity-0 scale-95 pointer-events-none
                max-h-60 overflow-y-auto
                transition-all duration-200 ease-out">
    </div>
  </div>
</div>`;

function mountNavOnce () {
  if (!document.getElementById('main-nav')) document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  if (!document.getElementById('search-container')) document.body.insertAdjacentHTML('beforeend', SEARCH_BAR_HTML);

  const searchInput = document.getElementById('navbar-search');
  const resultsDiv = document.getElementById('navbar-search-results');

  if (searchInput) {
      let searchTimeout;
      const debouncedSearch = (term) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(async () => {
              const searchTerm = term.toLowerCase().trim();
              if (searchTerm.length < 1) {
                  resultsDiv.innerHTML = '';
                  resultsDiv.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                  return;
              }
              const resp = await fetch(`/api/search_users?term=${searchTerm}`);
              const candidateUsers = await resp.json();
              const filteredUsers = candidateUsers.filter(user => 
                  user.displayName_lowercase.includes(searchTerm)
              );

              if (filteredUsers.length > 0) {
                  resultsDiv.innerHTML = filteredUsers.map(user => 
                      `<a href="/user/${user.id}" data-link
                          class="block px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white border-b border-white/5 last:border-0">
                          ${user.displayName}
                       </a>`
                  ).join('');
                  resultsDiv.classList.remove('opacity-0', 'scale-95', 'pointer-events-none'); 
                  resultsDiv.classList.add('animate-spring-in');
              } else {
                  resultsDiv.innerHTML = `<p class="px-4 py-3 text-sm text-gray-500">Aucun résultat</p>`;
                  resultsDiv.classList.remove('opacity-0', 'scale-95', 'pointer-events-none'); 
                  resultsDiv.classList.add('animate-spring-in');
              }
          }, 250);
      };
      searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
  }
}

export async function updateNavHTML () {
  const navRight = document.getElementById('nav-right')
  if (!navRight) return
  const logged = !!localStorage.getItem('token')

  if (!logged) {
    navRight.innerHTML = `
      <a href="/login" data-link class="font-semibold text-gray-300 hover:text-white transition">Log&nbsp;In</a>
      <a href="/register" data-link
         class="px-5 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white
                font-semibold shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-transform">
         Sign&nbsp;Up
      </a>`
    return
  }

  let displayName = localStorage.getItem('displayName') || 'Account'

  navRight.innerHTML = `
  <div id="account-wrapper" class="relative">
    <button id="account-btn"
            class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                   bg-gray-800/50 hover:bg-gray-800 border border-white/10 transition">
      <span class="font-semibold text-gray-100">${displayName}</span>
      <svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.08l3.71-3.85a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div id="account-menu"
         class="absolute right-0 mt-3 w-48 origin-top-right
                rounded-xl bg-gray-900/95 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl
                opacity-0 scale-95 pointer-events-none
                transition-all duration-200 ease-out">
      <a href="/profile" data-link
         class="block px-5 py-3 text-sm text-gray-200 hover:bg-white/10 rounded-t-xl">
         Profile
      </a>
      <a href="/" id="logout"
         class="block px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">
         Déconnexion
      </a>
    </div>
  </div>`

  const btn  = navRight.querySelector('#account-btn')
  const menu = navRight.querySelector('#account-menu')
  const hide = () => {
    menu.classList.remove('opacity-100', 'scale-100', 'animate-spring-in')
    menu.classList.add   ('opacity-0',   'scale-95', 'pointer-events-none')
    document.removeEventListener('click', clickAway)
  }
  const clickAway = e => { if (!menu.contains(e.target) && !btn.contains(e.target)) hide() }

  btn.addEventListener('click', () => {
    const open = menu.classList.contains('opacity-100')
    if (open) { hide(); return }
    menu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none')
    menu.classList.add('opacity-100', 'scale-100', 'animate-spring-in');
    setTimeout(() => document.addEventListener('click', clickAway), 0)
  })

  navRight.querySelector('#logout')?.addEventListener('click', e => {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('displayName')
    updateNavHTML()
    history.pushState(null, '', '/')
    dispatchEvent(new PopStateEvent('popstate'))
  })
}

export function renderPage (path) { mountNavOnce(); updateNavHTML(); bindForms(path); }
export function mountNavAtStartup () { mountNavOnce(); updateNavHTML(); }