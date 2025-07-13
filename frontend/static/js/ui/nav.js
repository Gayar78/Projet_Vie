/*****************************************************************
 *  Barre de navigation flottante + logique auth + menu account
 *****************************************************************/
import { bindForms }  from './forms.js'
import { api }        from '../core/api.js'   // pour récupérer le profil

/* ---------- 1. HTML complet de la nav ----------------------- */
const NAV_HTML = /* html */ `
<nav id="main-nav"
     class="fixed top-4 left-1/2 -translate-x-1/2 z-30
            backdrop-blur-md bg-white/10 border border-white/10
            rounded-full px-8 py-2 flex items-center shadow-lg">

  <!-- BLOC CENTRÉ : logo + liens -->
  <div class="flex items-center gap-10 mx-auto">
    <!-- Logo + nom -->
    <a href="/" data-link class="flex items-center gap-2 font-semibold">
      <img src="/static/images/logo.png" alt="DraftPrime logo"
           class="w-12 h-12 select-none" />
      <span>DraftPrime</span>
    </a>

    <!-- Liens principaux -->
    <ul class="flex items-center gap-8 text-sm">
      <li><a href="/leaderboard" data-link class="hover:text-pink-400">Leaderboard</a></li>
      <!--<li><a href="/market"      data-link class="hover:text-pink-400">Boutique</a></li>-->
      <li><a href="https://github.com/" target="_blank" rel="noopener"
             class="hover:text-pink-400">GitHub&nbsp;↗︎</a></li>
    </ul>
  </div>

  <!-- Zone dynamique (login / menu account) -->
  <div id="nav-right" class="flex items-center gap-4 ml-6"></div>
</nav>`
/* ------------------------------------------------------------ */

/* ---------- 2. Injection one-shot --------------------------- */
function mountNavOnce () {
  if (!document.getElementById('main-nav')) {
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML)
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
      <a href="/login"    data-link class="hover:text-pink-400">Log&nbsp;In</a>
      <a href="/register" data-link
         class="px-5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600
                hover:opacity-90 text-sm font-semibold shadow-pink-500/30 shadow">
         Sign&nbsp;Up
      </a>`
    return
  }

  /* ---- Utilisateur connecté (capsule + dropdown) ------------ */
let username = localStorage.getItem('username')
if (!username) {
  try {
    const u = await api('/profile', null, 'GET')
    username = u.username || u.email || 'Account'
    localStorage.setItem('username', username)
  } catch { username = 'Account' }
}

navRight.innerHTML = `
  <div id="account-wrapper" class="relative">
    <!-- CAPSULE -------------------------------------------------->
    <button id="account-btn"
            class="flex items-center gap-3 pl-5 pr-4 py-1.5 rounded-full
                   bg-white/5 hover:bg-white/10 border border-white/20
                   transition">
      <span class="font-semibold">${username}</span>
      <svg class="w-4 h-4 opacity-70 transition-transform"
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.08l3.71-3.85a.75.75 0 1 1
                 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1
                 .02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- DROPDOWN ------------------------------------------------->
    <div id="account-menu"
         class="absolute right-0 mt-3 w-52 origin-top-right
                rounded-lg bg-[#20202e] border border-white/15
                shadow-lg opacity-0 scale-95 pointer-events-none
                transition-[opacity,transform] duration-150 ease-out">
      <a href="/profile" data-link
         class="block px-5 py-3 text-sm hover:bg-white/5 rounded-t-lg">
         Profile
      </a>
      <a href="/" id="logout"
         class="block px-5 py-3 text-sm text-red-400 hover:bg-red-600/20 rounded-b-lg">
         Déconnexion
      </a>
    </div>
  </div>`

  /* ---- Animation du menu ---------------------------------- */
  const btn  = navRight.querySelector('#account-btn')
  const menu = navRight.querySelector('#account-menu')

  const hide = () => {
    menu.classList.remove('opacity-100', 'scale-100')
    menu.classList.add   ('opacity-0',   'scale-95', 'pointer-events-none')
    document.removeEventListener('click', clickAway)
  }
  const clickAway = e => {
    if (!menu.contains(e.target) && e.target !== btn) hide()
  }

  btn.addEventListener('click', () => {
    const open = menu.classList.contains('opacity-100')
    if (open) { hide(); return }
    menu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none')
    menu.classList.add   ('opacity-100', 'scale-100')
    setTimeout(() => document.addEventListener('click', clickAway), 0)
  })

  /* ---- Logout --------------------------------------------- */
  navRight.querySelector('#logout')?.addEventListener('click', e => {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    updateNavHTML()
    history.pushState(null, '', '/')
    dispatchEvent(new PopStateEvent('popstate'))
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
