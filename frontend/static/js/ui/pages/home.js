/* frontend/static/js/ui/pages/home.js */
import { api } from '../../core/api.js';
import { rankFromPoints, getRankColor } from './leaderboard.js';

export default function home () {
  const isLogged = !!localStorage.getItem('token');

  // BOUTON HERO (Différent si connecté ou pas)
  const ctaButton = isLogged 
    ? `<a href="/profile/dashboard" data-link class="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition backdrop-blur-md">Mon Tableau de Bord</a>`
    : `<a href="/register" data-link class="px-10 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform duration-150 shadow-lg shadow-pink-500/30 animate-spring-in" style="animation-delay: 0.2s">Je rejoins la compétition</a>`;

  return /* html */ `
  
  <!-- 1. HERO SECTION -->
  <section class="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden min-h-[60vh]">

    
    <!-- Titre -->
    <h1 class="text-6xl md:text-8xl font-black leading-tight mb-6 text-white tracking-tighter animate-spring-in" style="animation-delay: 0.1s">
      DRAFT<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">PRIME</span>
    </h1>
    
    <!-- Sous-titre -->
    <p class="max-w-2xl mx-auto text-gray-400 mb-10 text-center text-base md:text-lg leading-relaxed animate-spring-in font-light" style="animation-delay: 0.2s">
      Une plateforme unique pour mesurer votre force, votre endurance et votre technique face au monde entier.
      <span class="text-white font-medium">Validez vos records, grimpez les échelons, devenez une légende.</span>
    </p>
    
    <!-- CTA -->
    <div class="animate-spring-in" style="animation-delay: 0.3s">
        ${ctaButton}
    </div>
  </section>


  <!-- 2. LEADERBOARD PREVIEW (Podium) -->
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center liquid-glass-card rounded-3xl p-12 border border-white/5 bg-black/40"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.005">
      
      <!-- Texte Gauche -->
      <div class="text-center lg:text-left space-y-8">
        <div>
            <h2 class="text-4xl font-black text-white leading-tight mb-4">
                Les Titans du<br/>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Classement Général</span>
            </h2>
            <p class="text-gray-400 text-lg">
                Ils sont les plus complets, les plus forts, les plus endurants. Voici le podium actuel de la saison.
            </p>
        </div>

        <!-- Stats rapides -->
        <div class="flex gap-8 justify-center lg:justify-start border-t border-white/10 pt-6">
            <div>
                <p class="text-3xl font-bold text-white">10k</p>
                <p class="text-xs text-gray-500 uppercase tracking-widest">Points Max</p>
            </div>
            <div class="w-px bg-white/10 h-10"></div>
            <div>
                <p class="text-3xl font-bold text-white">10</p>
                <p class="text-xs text-gray-500 uppercase tracking-widest">Rangs</p>
            </div>
        </div>

        <!-- Lien vers Leaderboard Complet -->
        <div>
            <a href="/leaderboard" data-link 
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-pink-600 text-white font-bold transition-all group">
                Voir le classement complet
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
        </div>
      </div>

      <!-- Liste Droite (Top 3) -->
      <div id="home-leaderboard-preview" class="flex flex-col gap-3">
         <!-- Chargé par JS -->
         <div class="space-y-3">
            ${Array(3).fill(0).map(() => `
                <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div class="skeleton w-8 h-8 rounded-lg"></div>
                    <div class="skeleton w-10 h-10 rounded-full"></div>
                    <div class="flex-1 space-y-2"><div class="skeleton w-24 h-3 rounded"></div><div class="skeleton w-16 h-2 rounded"></div></div>
                    <div class="skeleton w-16 h-4 rounded"></div>
                </div>
            `).join('')}
         </div>
      </div>
    </div>
  </section>

  <!-- 3. RANGS PREVIEW -->
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto text-center">
      <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-12">Échelle de progression</p>
      <div class="flex flex-wrap justify-center gap-8 md:gap-16">
        ${['fer', 'bronze', 'argent', 'or', 'platine', 'emeraude', 'diamant', 'master', 'grandmaster', 'challenger'].map(
          (slug) => {
            const color = getRankColor(slug);
            return `
            <div class="relative group flex flex-col items-center">
                <!-- LIGHT/GLOW DERRIÈRE L'IMAGE -->
                <div class="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-300" 
                     style="background-color: ${color};"></div>
                
                <!-- IMAGE SANS FILTRE GRIS -->
                <img src="/static/images/ranks/${slug}.png" 
                     class="relative w-12 h-12 md:w-16 md:h-16 object-contain transform transition-transform duration-300 group-hover:scale-125 drop-shadow-lg" 
                     title="${slug.charAt(0).toUpperCase() + slug.slice(1)}" />
            </div>`;
          }
        ).join('')}
      </div>
    </div>
  </section>


  <!-- 4. COMMENT ÇA MARCHE -->
  <section class="py-24 px-6 bg-black/20 border-y border-white/5">
    <div class="max-w-6xl mx-auto text-center">
    <h2 class="text-3xl font-bold mb-16 text-white">La route vers le sommet</h2>
      
      <div class="grid md:grid-cols-3 gap-12 relative">
        <!-- Ligne de connexion (Desktop) -->
        <div class="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <!-- Etape 1 -->
        <div class="relative group">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-pink-500/50 transition-colors shadow-xl">
            <svg class="w-8 h-8 text-gray-300 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">1. Filmez</h3>
          <p class="text-gray-500 text-sm leading-relaxed px-4">Enregistrez votre performance en respectant strictement les standards vidéo.</p>
        </div>
        
        <!-- Etape 2 -->
        <div class="relative group">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-pink-500/50 transition-colors shadow-xl">
            <svg class="w-8 h-8 text-gray-300 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">2. Validez</h3>
          <p class="text-gray-500 text-sm leading-relaxed px-4">Nos experts analysent votre vidéo. Si elle est conforme, vos points sont crédités.</p>
        </div>
        
        <!-- Etape 3 -->
        <div class="relative group">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:border-pink-500/50 transition-colors shadow-xl">
            <svg class="w-8 h-8 text-gray-300 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">3. Dominez</h3>
          <p class="text-gray-500 text-sm leading-relaxed px-4">Grimpez au classement mondial et débloquez des grades légendaires.</p>
        </div>
      </div>
    </div>
  </section>

  

  <!-- 5. FOOTER SIMPLE -->
  <footer class="border-t border-white/5 bg-black/40 py-8 text-center">
    <p class="text-xs text-gray-600 uppercase tracking-widest">&copy; 2025 DraftPrime</p>
  </footer>
  `;
}

// LOGIQUE MOUNT (UNIQUEMENT LEADERBOARD PREVIEW)
export async function mount() {
    const lbContainer = document.getElementById('home-leaderboard-preview');
    
    if (lbContainer) {
        try {
            const { list } = await api('/leaderboard?cat=general&metric=general&limit=3', null, 'GET');
            
            if (!list || list.length === 0) { 
                lbContainer.innerHTML = '<div class="p-6 text-center text-gray-500 border border-white/5 rounded-xl italic">Le classement est vide pour le moment.</div>'; 
            } else {
                lbContainer.innerHTML = list.map((user, i) => {
                    const rankName = rankFromPoints(user.points);
                    const rankColor = getRankColor(rankName);
                    let rankSlug = rankName.toLowerCase().replace(/ /g, '').replace('é', 'e').replace('ê', 'e').replace('î', 'i');
                    if(rankSlug.includes('grand')) rankSlug = 'grandmaster';
                    else if(rankSlug.includes('maitre')) rankSlug = 'master';
                    
                    return `
                  <a href="/user/${user.id}" data-link class="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all group border border-white/5 shadow-lg">
                    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm shadow-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white'}">${i + 1}</div>
                    <img src="${user.photoURL || '/static/images/ranks/rank.png'}" class="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/20 transition-all" />
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-white text-base truncate group-hover:text-pink-400 transition-colors">${user.displayName || 'Athlète'}</p>
                        <div class="flex items-center gap-1.5 mt-1">
                            <img src="/static/images/ranks/${rankSlug}.png" class="w-4 h-4 object-contain" style="filter: drop-shadow(0 0 5px ${rankColor});">
                            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wide" style="color:${rankColor}">${rankName}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-white font-mono text-base">${user.points.toLocaleString()}</p>
                        <p class="text-[10px] text-gray-600 uppercase">PTS</p>
                    </div>
                  </a>`;
                }).join('');
            }
        } catch (e) { 
            console.error(e);
            lbContainer.innerHTML = '<p class="text-red-400 text-center text-sm py-4">Erreur chargement.</p>'; 
        }
    }
}