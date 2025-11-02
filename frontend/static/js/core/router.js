/* static/js/core/router.js ---------------------------------- */
import { pages }      from '../ui/pages/_index.js';
import { renderPage } from '../ui/nav.js';
import { sideBar }    from '../ui/sidebar.js';
import { api }        from './api.js';
import { initBackground } from '../ui/background.js';

const ROOT_SEL = '#app';            // conteneur principal

export function initRouter () {
  const app = document.querySelector(ROOT_SEL);

  async function render (path) {
    /* ============= routes /profile/* ====================== */
    if (path.startsWith('/profile')) {
      const tab = path.split('/')[2] || 'dashboard';

      /* redirige vers /login si non connecté */
      if (!localStorage.getItem('token')) {
        history.replaceState(null, '', '/login');
        return render('/login');
      }

      /* charge data utilisateur + module correspondant */
      let user = {};
      try { user = await api('/profile', null, 'GET'); } catch {}
      const pageMod  = await import(`../ui/pages/profile/${tab}.js`);
      const pageHTML = pageMod.default(user);            // tjrs une fonction

      /* injecte le markup */
      app.innerHTML = /* html */ `
        <section
          class="relative min-h-[calc(100vh-160px)] pt-28
                     px-6 pb-20 flex flex-col lg:flex-row gap-10">

          <!-- Sidebar fixe à gauche -->
          <div class="lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:w-64">
            ${sideBar(tab, user)}
          </div>

          <!-- Contenu -->
          <div class="flex-1 lg:pl-72">
            ${pageHTML}
          </div>
        </section>`;

      /* hook JS optionnel (ex.: contrib.mount()) */
      if (tab === 'contrib' || tab === 'settings') {
          // Ces modules ont une fonction 'mount' qui attend l'objet 'user'
          pageMod.mount?.(user);
      } else if (tab === 'dashboard') {
          // Le dashboard a une logique post-rendu dans 'setupDashboard'
          pageMod.setupDashboard?.();
      } else {
          // Pour les autres pages (activity, refer...)
          pageMod.mount?.();
      }

      renderPage(path);     // nav, forms…
      initBackground();
      return;
    }

/* ============= routes /user/:uid =================== */
    if (path.startsWith('/user/')) {
        const userId = path.split('/')[2];

        // Si l'ID est manquant, on retourne à l'accueil
        if (!userId) {
            app.innerHTML = pages['/'](); // Retour accueil
            renderPage(path);
            initBackground();
            return;
        }

        try {
            // 1. Charger le module de la page de profil public
            const pageMod = await import('../ui/pages/user_profile.js');

            // 2. Appeler le backend pour les données publiques (sans token)
            const r = await fetch(`/api/public_profile/${userId}`);
            if (!r.ok) {
                throw new Error(await r.text());
            }
            const userData = await r.json();

            // 3. Rendre le HTML avec les données de l'utilisateur
            app.innerHTML = pageMod.default(userData);

            // 4. Rendre la nav, etc.
            renderPage(path);
            initBackground();

        } catch (error) {
            console.error('Failed to load public profile:', error);
            // Affiche une page d'erreur
            app.innerHTML = `<section class="min-h-[calc(100vh-160px)] pt-40 text-center px-6">
                <h1 class="text-3xl font-bold text-red-500">Erreur</h1>
                <p class="text-gray-400 mt-4">Impossible de charger ce profil. Il est peut-être privé ou n'existe pas.</p>
                <a href="/" data-link class="text-pink-400 mt-6 inline-block">Retour à l'accueil</a>
            </section>`;
            renderPage(path);
            initBackground();
        }
        return; // Important : on arrête la fonction render ici
    }

    /* ============= pages simples ========================== */
    const pageFn = pages[path] || pages['/'];
    app.innerHTML = pageFn();
    renderPage(path);
    initBackground();

    /* ============= leaderboard live preview =============== */
    if (path === '/leaderboard') {
      const { loadLeaderboard, loadActivity, initLeaderboardFilters } =
        await import('../ui/pages/leaderboard.js');
      requestAnimationFrame(initLeaderboardFilters);
      loadLeaderboard();
      loadActivity();
    }
  }

  /* navigation interne (SPA) */
  document.addEventListener('click', (e) => {

    // NOUVEAU: Logique pour cacher la recherche au "clic extérieur"
    const searchContainer = document.getElementById('search-container');
    const resultsDiv = document.getElementById('navbar-search-results');

    if (searchContainer && !searchContainer.contains(e.target)) {
      if (resultsDiv) {
        resultsDiv.classList.add('opacity-0', 'scale-95', 'pointer-events-none'); 
        resultsDiv.classList.remove('animate-spring-in');
        searchContainer.classList.remove('w-96');
      }
    }

    // Logique du routeur (existante)
    const link = e.target.closest('[data-link]');
    if (!link) return; // Si ce n'est pas un lien, on s'arrête ici

    e.preventDefault();
    history.pushState(null, '', link.getAttribute('href'));
    render(location.pathname);

    // NOUVEAU: Cache aussi les résultats lors d'une navigation
    if (resultsDiv) {
      resultsDiv.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
      resultsDiv.classList.remove('animate-spring-in');
      searchContainer.classList.remove('w-96');
    }
  });

  window.addEventListener('popstate', () => render(location.pathname));

  render(location.pathname);      // premier affichage
}
