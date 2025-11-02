/*****************************************************************
 * Barre de navigation flottante + logique auth + menu account
 *****************************************************************/
import { bindForms } from './forms.js'
import { api }       from '../core/api.js'   // pour récupérer le profil

/* ---------- 1. HTML complet de la nav ----------------------- */
const NAV_HTML = /* html */ `
<nav id="main-nav"
     class="fixed top-4 left-1/2 -translate-x-1/2 z-30
            bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/20
            rounded-full px-8 py-2 flex items-center shadow-lg">

  <div class="flex items-center gap-10 mx-auto">
    <a href="/" data-link class="flex items-center gap-2 font-semibold">
      <img src="/static/images/logo.png" alt="DraftPrime logo"
           class="w-12 h-12 select-none" />
      <span>DraftPrime</span>
    </a>

    <ul class="flex items-center gap-8 text-sm">
      <li><a href="/leaderboard" data-link class="hover:text-pink-400">Leaderboard</a></li>
      <li><a href="https://github.com/" target="_blank" rel="noopener"
             class="hover:text-pink-400">GitHub&nbsp;↗︎</a></li>
    </ul>
  </div>

  <div id="nav-right" class="flex items-center gap-4 ml-6"></div>
</nav>`
/* ------------------------------------------------------------ */

/* NOUVEAU : HTML pour le module de recherche séparé
/* ------------------------------------------------------------ */
const SEARCH_BAR_HTML = /* html */`
<!-- MODIFIÉ : "transition-all" et "w-64" retirés du conteneur parent -->
<div id="search-container" class="fixed top-4 right-4 z-30">
  <div class="relative">
    <input type="search" id="navbar-search"
           placeholder="Chercher un athlète..."
           autocomplete="off"
           /* MODIFIÉ : "w-64" est maintenant sur l'input lui-même */
           class="w-64 px-4 py-1.5 rounded-full bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl 
                  border border-white/20 shadow-lg
                  text-sm focus:ring-pink-500 focus:border-pink-500
                  placeholder-gray-500 text-gray-900" />
    
    <div id="navbar-search-results"
         /* MODIFIÉ : "w-full" (largeur complète) remplacé par "w-64" (largeur fixe) */
         /* AJOUTÉ : max-h-60 (hauteur max) et overflow-y-auto (scroll) */
         class="absolute right-0 mt-3 w-64 origin-top-right
                rounded-lg bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl ring-1 ring-black/5 shadow-lg
                opacity-0 scale-95 pointer-events-none
                max-h-60 overflow-y-auto
                transition-[opacity,transform] duration-150 ease-out">
      <!-- Les résultats s'afficheront ici -->
    </div>
  </div>
</div>
`;
/* ------------------------------------------------------------ */


/* ---------- 2. Injection one-shot --------------------------- */
function mountNavOnce () {
  // Injecte la barre de nav
  if (!document.getElementById('main-nav')) {
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  }
  // Injecte la barre de recherche
  if (!document.getElementById('search-container')) {
    document.body.insertAdjacentHTML('beforeend', SEARCH_BAR_HTML);
  }

  /* -------------------------------------------------- */
  /* Logique de la barre de recherche (maintenant qu'elle existe)
  /* -------------------------------------------------- */
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('navbar-search');
  const resultsDiv = document.getElementById('navbar-search-results');

  if (searchInput) {
      
      // Fonction "debounce" pour ne pas spammer l'API à chaque touche
      let searchTimeout;
      const debouncedSearch = (term) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(async () => {
              if (term.length < 2) {
                  resultsDiv.innerHTML = '';
                  // Utilise les nouvelles classes pour cacher
                  resultsDiv.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                  return;
              }

              // Appelle le nouvel endpoint backend (pas besoin de token)
              const resp = await fetch(`/api/search_users?term=${term}`);
              const users = await resp.json();

              if (users.length > 0) {
                  resultsDiv.innerHTML = users.map(user => 
                      `<a href="/user/${user.id}" data-link
                          class="block px-5 py-3 text-sm text-gray-900 hover:bg-white/50 rounded-lg">
                          ${user.displayName}
                       </a>`
                  ).join('');
                  // Utilise les nouvelles classes pour montrer
                  resultsDiv.classList.remove('opacity-0', 'scale-95', 'pointer-events-none'); 
                  resultsDiv.classList.add('animate-spring-in');
                  // SUPPRIMÉ : searchContainer.classList.add('w-96');
              } else {
                  // MODIFIÉ : text-gray-600 pour meilleure lisibilité
                  resultsDiv.innerHTML = `<p class="px-5 py-3 text-sm text-gray-600">Aucun résultat</p>`;
                  // Utilise les nouvelles classes pour montrer
                  resultsDiv.classList.remove('opacity-0', 'scale-95', 'pointer-events-none'); 
                  resultsDiv.classList.add('animate-spring-in');
                  // SUPPRIMÉ : searchContainer.classList.add('w-96');
              }
          }, 300); // Attend 300ms après la dernière frappe
      };

      // Écoute l'événement "input"
      searchInput.addEventListener('input', (e) => {
          debouncedSearch(e.target.value);
      });
      
      // Note : La logique pour "cacher en cliquant à l'extérieur"
      // est maintenant déplacée dans router.js pour mieux fonctionner
  }
}

/* ---------- 3. Met à jour la zone droite ------------------- */
export async function updateNavHTML () {
  const navRight = document.getElementById('nav-right')
  if (!navRight) return

  const logged = !!localStorage.getItem('token')

  /* ---- Visiteur (non connecté) ---------------------------- */
  if (!logged) {
    navRight.innerHTML = `
      <a href="/login"     data-link class="font-semibold hover:text-pink-500">Log&nbsp;In</a>
      <!-- MODIFIÉ : Bouton "Rose/Violet" -->
      <a href="/register" data-link
         class="px-5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white
                font-semibold shadow-lg shadow-pink-500/30 btn-liquid-press">
         Sign&nbsp;Up
      </a>`
    return
  }

/* ---- Utilisateur connecté (capsule + dropdown) ------------ */
  let displayName = localStorage.getItem('displayName')

  if (!displayName) {
    try {
      const u = await api('/profile', null, 'GET')

      displayName = (u.displayName && u.displayName.trim()) || ''

      if (!displayName) {
        const localPart = (u.email || '').split('@')[0]     // "john.doe"
        const raw       = localPart.split('.')[0] || u.email // johnn */
        displayName = raw.charAt(0).toUpperCase() + raw.slice(1)
        // On met à jour le profil avec le nouveau displayName et sa version lowercase
        await api('/profile', { 
            displayName: displayName, 
            displayName_lowercase: displayName.toLowerCase() 
        }, 'POST');
      }

      localStorage.setItem('displayName', displayName)
    } catch {
      displayName = 'Account'
    }
  }

navRight.innerHTML = `
  <div id="account-wrapper" class="relative">
    <button id="account-btn"
            class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                   bg-white/70 backdrop-blur-lg border border-white/30 shadow-md 
                   hover:bg-white/90 transition">
      <span class="font-semibold text-gray-900">${displayName}</span>
      <svg class="w-4 h-4 opacity-70 transition-transform"
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.08l3.71-3.85a.75.75 0 1 1
                 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1
                 .02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- MODIFIÉ : Menu blanc opaque -->
    <div id="account-menu"
         class="absolute right-0 mt-3 w-52 origin-top-right
                rounded-lg bg-white ring-1 ring-black/10 shadow-xl
                opacity-0 scale-95 pointer-events-none
                transition-[opacity,transform] duration-150 ease-out">
      <!-- MODIFIÉ : Lien "Profile" pour fond opaque -->
      <a href="/profile" data-link
         class="block px-5 py-3 text-sm text-gray-900 hover:bg-gray-100 rounded-t-lg">
         Profile
      </a>
      <a href="/" id="logout"
         class="block px-5 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-b-lg">
         Déconnexion
      </a>
    </div>
  </div>`

  /* ---- Animation du menu ---------------------------------- */
  const btn  = navRight.querySelector('#account-btn')
  const menu = navRight.querySelector('#account-menu')

  const hide = () => {
    menu.classList.remove('opacity-100', 'scale-100', 'animate-spring-in')
    menu.classList.add   ('opacity-0',   'scale-95', 'pointer-events-none')
    document.removeEventListener('click', clickAway)
  }
  const clickAway = e => {
    // MODIFIÉ : on vérifie aussi le bouton
    if (!menu.contains(e.target) && !btn.contains(e.target)) hide()
  }

  btn.addEventListener('click', () => {
    const open = menu.classList.contains('opacity-100')
    if (open) { 
      hide(); 
      return 
    }
    menu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none')
    menu.classList.add('opacity-100', 'scale-100', 'animate-spring-in');
    setTimeout(() => document.addEventListener('click', clickAway), 0)
  })

  /* ---- Logout --------------------------------------------- */
  navRight.querySelector('#logout')?.addEventListener('click', e => {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('displayName')
    updateNavHTML() // Met à jour la nav
    history.pushState(null, '', '/') // Retourne à l'accueil
    dispatchEvent(new PopStateEvent('popstate')) // Déclenche le routeur
  })
}

/* ---------- 4. Appelé après chaque render ------------------ */
export function renderPage (path) {
  mountNavOnce()
  updateNavHTML()
  bindForms(path)
}

/* ---------- 5. Utilitaire boot ----------------------------- */
export function mountNavAtStartup () {
  mountNavOnce()
  updateNavHTML()
}

