/* static/js/core/router.js */
import { pages }      from '../ui/pages/_index.js';
import { renderPage } from '../ui/nav.js';
import { sideBar }    from '../ui/sidebar.js';
import { api }        from './api.js';

const ROOT_SEL = '#app';

export function initRouter () {
  const app = document.querySelector(ROOT_SEL);

  const animateExit = async () => {
    const currentView = document.getElementById('router-view');
    if (currentView) {
        currentView.style.height = getComputedStyle(currentView).height;
        currentView.style.overflow = 'hidden';
        currentView.classList.remove('page-enter');
        currentView.classList.add('page-exit');
        await new Promise(r => setTimeout(r, 300));
    }
    window.scrollTo(0, 0);
  };

  const injectView = (html) => {
      // CORRECTION 1 : Ajout de 'pb-24 lg:pb-0' pour éviter que la Bottom Bar mobile cache le contenu
      app.innerHTML = `<div id="router-view" class="page-enter w-full min-h-screen pb-24 lg:pb-0">${html}</div>`;
      
      renderPage(location.pathname);
      
      requestAnimationFrame(() => {
          if (window.VanillaTilt) {
              document.querySelectorAll('.liquid-glass-card').forEach(el => el.vanillaTilt?.destroy());
              window.VanillaTilt.init(document.querySelectorAll(".liquid-glass-card"), {
                  max: 2, speed: 1000, perspective: 2000, glare: true, "max-glare": 0.05, scale: 1.005, gyroscope: false
              });
          }
      });
  };

  async function render (path) {
    /* 1. ROUTES PROFILE (Interne) */
    if (path.startsWith('/profile')) {
      const tab = path.split('/')[2] || 'dashboard';
      if (!localStorage.getItem('token')) { history.replaceState(null, '', '/login'); return render('/login'); }

      const exitPromise = animateExit();
      let user = {}; try { user = await api('/profile', null, 'GET'); } catch {}
      
      const pageMod  = await import(`../ui/pages/profile/${tab}.js`);
      const contentHTML = pageMod.default(user);

      // Layout Responsive : Sidebar cachée sur mobile (gérée par le composant sideBar lui-même)
      const finalHTML = /* html */ `
        <section class="relative min-h-[calc(100vh-160px)] pt-6 lg:pt-28 px-4 lg:px-6 flex flex-col lg:flex-row lg:gap-10 max-w-7xl mx-auto">
          ${sideBar(tab, user)}
          <div class="flex-1 w-full">${contentHTML}</div>
        </section>`;
      
      await exitPromise;
      injectView(finalHTML);
      if (pageMod.mount) pageMod.mount(user);
      return;
    }

    /* 2. ROUTE PROFIL PUBLIC (/user/:uid) */
    if (path.startsWith('/user/')) {
        const userId = path.split('/')[2];
        const myId = localStorage.getItem('userId');
        if (userId && myId && userId === myId) { history.replaceState(null, '', '/profile/dashboard'); return render('/profile/dashboard'); }
        
        const exitPromise = animateExit();
        if (!userId) { await exitPromise; injectView(pages['/']()); return; }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? {'Authorization': token} : {};
            const r = await fetch(`/api/public_profile/${userId}`, { headers });
            
            if (r.status === 404) throw new Error("Utilisateur introuvable (404)");
            if (!r.ok) throw new Error("Erreur serveur (" + r.status + ")");
            
            const userData = await r.json(); 
            userData.id = userId;
            
            const pageMod = await import('../ui/pages/user_profile.js');
            const htmlContent = pageMod.default(userData);
            
            await exitPromise;
            injectView(htmlContent);
            if (pageMod.mount) pageMod.mount(userData);

        } catch (error) {
            console.error(error);
            await exitPromise;
            injectView(`<section class="min-h-[calc(100vh-160px)] pt-40 text-center px-6">
                <h1 class="text-4xl font-black text-red-500 mb-4">Oups !</h1>
                <p class="text-gray-300 mb-2">Une erreur est survenue :</p>
                <code class="block bg-black/30 p-4 rounded text-red-400 text-sm font-mono mb-6 max-w-md mx-auto">${error.message}</code>
                <a href="/" data-link class="text-pink-400 font-bold hover:underline">Retour à l'accueil</a>
            </section>`);
        }
        return;
    }

    /* 3. PAGES SIMPLES (Home, Login, Register, Market...) */
    const pageFn = pages[path] || pages['/'];
    const exitPromise = animateExit();
    const htmlContent = pageFn();
    
    await exitPromise;
    injectView(htmlContent);

    // CORRECTION 2 : Gestion spécifique des scripts de page
    
    // Leaderboard
    if (path === '/leaderboard') {
      const { loadLeaderboard, loadActivity, initLeaderboardFilters } = await import('../ui/pages/leaderboard.js');
      requestAnimationFrame(() => { initLeaderboardFilters(); loadLeaderboard(); loadActivity(); });
    }
    
    // Home (Pour le Feed et le Preview Rank)
    if (path === '/') {
         const { mount } = await import('../ui/pages/home.js');
         requestAnimationFrame(mount);
    }
  }

  document.addEventListener('click', (e) => {
    const search = document.getElementById('search-container');
    const results = document.getElementById('navbar-search-results');
    if (search && !search.contains(e.target) && results) results.classList.add('opacity-0', 'scale-95', 'pointer-events-none'); 
    const link = e.target.closest('[data-link]');
    if (!link) return;
    e.preventDefault();
    history.pushState(null, '', link.getAttribute('href'));
    render(location.pathname);
  });
  window.addEventListener('popstate', () => render(location.pathname));
  render(location.pathname);
}