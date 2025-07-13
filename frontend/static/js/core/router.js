/* static/js/core/router.js ---------------------------------- */
import { pages }      from '../ui/pages/_index.js'
import { renderPage } from '../ui/nav.js'
import { sideBar }    from '../ui/sidebar.js'
import { api }        from './api.js'
import { initBackground } from '../ui/background.js'

export function initRouter () {
  const app = document.getElementById('app')

  async function render (path) {
    /* ===== routes /profile/* ================================= */
    if (path.startsWith('/profile')) {
      const tab = path.split('/')[2] || 'dashboard'

      /* redirige vers /login si non connecté */
      if (!localStorage.getItem('token')) {
        history.replaceState(null, '', '/login')
        return render('/login')
      }

      /* charge data utilisateur + module correspondant */
      let user = {}
      try { user = await api('/profile', null, 'GET') } catch {}
      const pageMod = await import(`../ui/pages/profile/${tab}.js`)

      /* injecte le markup */
      app.innerHTML = /* html */ `
        <section
          class="relative min-h-[calc(100vh-160px)] pt-28
                     px-6 pb-20 flex flex-col lg:flex-row gap-10">

          <!-- Sidebar fixe à gauche sur desktop -->
          <div class="lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:w-64">
            ${sideBar(tab, user)}
          </div>

          <!-- Contenu (on laisse la place à la sidebar) -->
          <div class="flex-1 lg:pl-72">
            ${pageMod.default(user)}
          </div>
        </section>`

      renderPage(path)          // nav + bindForms
      initBackground()
      return
    }

    /* ===== pages simples ===================================== */
    const pageFn = pages[path] || pages['/']
    app.innerHTML = pageFn()
    renderPage(path)            // nav + bindForms
    initBackground()

    /* ===== leaderboard live preview ========================== */
    if (path === '/leaderboard') {
      const { loadLeaderboard, loadActivity, initLeaderboardFilters } =
        await import('../ui/pages/leaderboard.js')
      requestAnimationFrame(initLeaderboardFilters)
      loadLeaderboard()
      loadActivity()
    }

    /* --- plus rien à faire pour /register :
       bindForms() s’en occupe via renderPage(path) -------------- */
  }

  /* ===== navigation interne (SPA) =========================== */
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]')
    if (!link) return
    e.preventDefault()
    history.pushState(null, '', link.getAttribute('href'))
    render(location.pathname)
  })

  window.addEventListener('popstate', () => render(location.pathname))

  render(location.pathname)      // premier affichage
}
