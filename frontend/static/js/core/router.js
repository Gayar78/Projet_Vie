/* static/js/core/router.js ---------------------------------- */
import { pages }      from '../ui/pages/_index.js';
import { renderPage } from '../ui/nav.js';
import { sideBar }    from '../ui/sidebar.js';
import { api }        from './api.js';
import { initBackground } from '../ui/background.js';

const ROOT_SEL = '#app';

export function initRouter () {
  const app = document.querySelector(ROOT_SEL);

  // Fonction qui gère la transition de SORTIE
  const animateExit = async () => {
    const currentView = document.getElementById('router-view');
    
    if (currentView) {
        // 1. On fige la hauteur pour éviter que le footer remonte pendant l'anim
        currentView.style.height = currentView.offsetHeight + 'px';
        currentView.style.overflow = 'hidden';
        
        // 2. On lance l'animation CSS
        currentView.classList.remove('page-enter');
        currentView.classList.add('page-exit');
        
        // 3. On attend exactement la durée de l'animation CSS (300ms)
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Reset du scroll
    window.scrollTo(0, 0);
  };

  async function render (path) {
    let newHTML = '';

    /* 1. PRÉPARATION DU CONTENU (SANS L'INJECTER ENCORE) */
    
    // --- Routes Profile ---
    if (path.startsWith('/profile')) {
      const tab = path.split('/')[2] || 'dashboard';
      if (!localStorage.getItem('token')) { history.replaceState(null, '', '/login'); return render('/login'); }

      // On lance l'animation de sortie PENDANT qu'on charge les données
      const exitPromise = animateExit();
      
      let user = {}; 
      try { user = await api('/profile', null, 'GET'); } catch {}
      
      const pageMod  = await import(`../ui/pages/profile/${tab}.js`);
      const contentHTML = pageMod.default(user);

      newHTML = /* html */ `
        <section class="relative min-h-[calc(100vh-160px)] pt-28 px-6 pb-20 flex flex-col lg:flex-row gap-10">
          <div class="lg:fixed lg:left-8 lg:top-1/2 lg:-translate-y-1/2 lg:w-64">${sideBar(tab, user)}</div>
          <div class="flex-1 lg:pl-72">${contentHTML}</div>
        </section>`;
      
      // On s'assure que l'animation de sortie est finie avant d'injecter
      await exitPromise;
      
      injectAndAnimate(newHTML);
      if (pageMod.mount) pageMod.mount(user);
      finishRender(path);
      return;
    }

    // --- Route User Public ---
    if (path.startsWith('/user/')) {
        const userId = path.split('/')[2];
        const myId = localStorage.getItem('userId');
        if (userId && myId && userId === myId) { history.replaceState(null, '', '/profile/dashboard'); return render('/profile/dashboard'); }
        
        if (!userId) { await animateExit(); injectAndAnimate(pages['/']()); finishRender(path); return; }

        const exitPromise = animateExit();
        const token = localStorage.getItem('token');
        const headers = token ? {'Authorization': token} : {};

        try {
            const r = await fetch(`/api/public_profile/${userId}`, { headers });
            if (!r.ok) throw new Error(await r.text());
            const userData = await r.json(); userData.id = userId;
            
            const pageMod = await import('../ui/pages/user_profile.js');
            newHTML = pageMod.default(userData);
            
            await exitPromise;
            injectAndAnimate(newHTML);
            if (pageMod.mount) pageMod.mount(userData);
            finishRender(path);

        } catch (error) {
            await exitPromise;
            injectAndAnimate(`<section class="min-h-[calc(100vh-160px)] pt-40 text-center px-6"><h1 class="text-3xl font-bold text-red-500">Erreur</h1><a href="/" data-link class="text-pink-400 mt-6 inline-block">Retour</a></section>`);
            finishRender(path);
        }
        return;
    }

    // --- Pages Simples (Home, Login...) ---
    await animateExit();
    
    const pageFn = pages[path] || pages['/'];
    newHTML = pageFn();
    
    injectAndAnimate(newHTML);

    if (path === '/leaderboard') {
      const { loadLeaderboard, loadActivity, initLeaderboardFilters } = await import('../ui/pages/leaderboard.js');
      requestAnimationFrame(initLeaderboardFilters);
      loadLeaderboard();
      loadActivity();
    }

    finishRender(path);
  }

  // --- Helper: Injection Propre dans le Wrapper ---
  function injectAndAnimate(htmlContent) {
      // On injecte dans une DIV wrapper unique
      app.innerHTML = `<div id="router-view" class="page-enter w-full">${htmlContent}</div>`;
  }

  function finishRender(path) {
    renderPage(path);
    initBackground();
    
    requestAnimationFrame(() => {
        if (window.VanillaTilt) {
            document.querySelectorAll('.liquid-glass-card').forEach(el => el.vanillaTilt?.destroy());
            window.VanillaTilt.init(document.querySelectorAll(".liquid-glass-card"), {
                max: 2, speed: 1000, perspective: 2000, glare: true, "max-glare": 0.05, scale: 1.005, gyroscope: false
            });
        }
    });
  }

  document.addEventListener('click', (e) => {
    const search = document.getElementById('search-container');
    const results = document.getElementById('navbar-search-results');
    if (search && !search.contains(e.target) && results) {
        results.classList.add('opacity-0', 'scale-95', 'pointer-events-none'); 
    }
    const link = e.target.closest('[data-link]');
    if (!link) return;
    e.preventDefault();
    history.pushState(null, '', link.getAttribute('href'));
    render(location.pathname);
  });
  window.addEventListener('popstate', () => render(location.pathname));
  render(location.pathname);
}