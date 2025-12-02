/* frontend/static/js/ui/pages/standards.js */

export default function standardsPage() {
  return /* html */`
  <section class="page-enter relative min-h-[calc(100vh-160px)] px-6 pb-20 text-gray-100">
    
    <div class="max-w-6xl mx-auto mt-12 liquid-glass-card rounded-2xl p-10 md:p-16 animate-spring-in"
         data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.00">
      
      <!-- HEADER -->
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Standards Officiels</span>
        </h1>
        <!-- Barre décorative simple à la place du texte supprimé -->
        <div class="h-1 w-24 bg-pink-500 mx-auto mt-6 rounded-full opacity-80"></div>
      </div>

      <div class="space-y-20">

        <!-- 1. PROTOCOLE DE TOURNAGE -->
        <section>
            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                    <!-- Icone Caméra -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <h2 class="text-3xl font-bold text-white">Protocole de Tournage</h2>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-black/30 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <h3 class="text-pink-400 font-bold mb-2 uppercase text-xs tracking-widest">01. Continuité</h3>
                    <p class="text-sm text-gray-300 leading-relaxed">
                        La vidéo doit être <strong>brute et sans coupure</strong> (uncut). Elle doit commencer avant la mise en place et se terminer après la fin de l'effort. Tout montage entraînera un rejet immédiat.
                    </p>
                </div>
                <div class="bg-black/30 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <h3 class="text-pink-400 font-bold mb-2 uppercase text-xs tracking-widest">02. Cadrage</h3>
                    <p class="text-sm text-gray-300 leading-relaxed">
                        L'athlète doit être visible <strong>en entier</strong>. La charge (poids) doit être clairement identifiable. Pour le cardio, l'écran du tapis/vélo ou le GPS doit être lisible.
                    </p>
                </div>
                <div class="bg-black/30 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <h3 class="text-pink-400 font-bold mb-2 uppercase text-xs tracking-widest">03. Preuve</h3>
                    <p class="text-sm text-gray-300 leading-relaxed">
                        Pour les performances "Elite" ou les records, filmez les poids en gros plan avant ou après le lift. Si vous utilisez votre poids de corps (Street), une pesée récente peut être demandée.
                    </p>
                </div>
            </div>
        </section>

        <hr class="border-white/5" />

        <!-- 2. MUSCULATION (8 EXERCICES) -->
        <section>
            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <!-- Icone Haltère -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-white">Musculation</h2>
                    <p class="text-xs text-blue-400 font-mono uppercase tracking-widest">8 Exercices • Force & Hypertrophie</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Développé Couché -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">1. Bench Press</h4>
                    <p class="text-xs text-gray-400">Fesses en contact permanent avec le banc. La barre doit toucher la poitrine. Extension complète des bras obligatoire.</p>
                </div>
                <!-- Développé Militaire -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">2. Overhead Press</h4>
                    <p class="text-xs text-gray-400">Strict (pas d'impulsion des jambes). Départ clavicules, arrivée bras tendus au-dessus de la tête.</p>
                </div>
                <!-- Développé Haltères -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">3. Dumbbell Press</h4>
                    <p class="text-xs text-gray-400">Haltères touchent les épaules en bas. Bras tendus en haut. Banc à plat ou légèrement incliné.</p>
                </div>
                <!-- Squat -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">4. Squat</h4>
                    <p class="text-xs text-gray-400">Profondeur valide : le creux de la hanche doit passer sous le sommet du genou. Extension complète en haut.</p>
                </div>
                <!-- Deadlift -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">5. Deadlift</h4>
                    <p class="text-xs text-gray-400">Départ du sol. Pas de "ramping". Verrouillage complet (épaules arrière, hanches avant). Ne pas lâcher la barre.</p>
                </div>
                <!-- Tirage Vertical -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">6. Tirage Vertical</h4>
                    <p class="text-xs text-gray-400">Lat Pulldown ou Tractions strictes. La barre/poignée doit descendre sous le menton. Bras tendus en haut.</p>
                </div>
                <!-- Tirage Horizontal -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">7. Tirage Horizontal</h4>
                    <p class="text-xs text-gray-400">Rowing barre ou machine. Contact avec l'abdomen obligatoire. Pas d'élan excessif du buste.</p>
                </div>
                <!-- Curls -->
                <div class="bg-white/5 p-5 rounded-lg border-l-2 border-blue-500">
                    <h4 class="font-bold text-white mb-1">8. Curls</h4>
                    <p class="text-xs text-gray-400">Barre ou Haltères. Dos droit. Extension complète du bras en bas à chaque répétition.</p>
                </div>
            </div>
        </section>

        <hr class="border-white/5" />

        <!-- 3. STREET WORKOUT (5 EXERCICES) -->
        <section>
            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
                    <!-- Icone Muscle -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-white">Street Workout</h2>
                    <p class="text-xs text-pink-400 font-mono uppercase tracking-widest">5 Exercices • Lesté & Statique</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Traction Lestée -->
                <div class="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-pink-500/30">
                    <h4 class="font-bold text-white mb-2 text-lg">1. Traction Lestée</h4>
                    <p class="text-sm text-gray-400 mb-2">Le menton doit passer <strong>entièrement</strong> au-dessus de la barre. Départ bras déverrouillés (morts). Pas de kipping.</p>
                    <span class="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-1 rounded uppercase font-bold">Poids ajouté</span>
                </div>

                <!-- Dips Lestés -->
                <div class="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-pink-500/30">
                    <h4 class="font-bold text-white mb-2 text-lg">2. Dips Lestés</h4>
                    <p class="text-sm text-gray-400 mb-2">L'épaule doit descendre sous le coude (angle < 90°). Remontée jusqu'à verrouillage complet des coudes.</p>
                    <span class="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-1 rounded uppercase font-bold">Poids ajouté</span>
                </div>

                <!-- Front Lever -->
                <div class="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-pink-500/30">
                    <h4 class="font-bold text-white mb-2 text-lg">3. Front Lever</h4>
                    <p class="text-sm text-gray-400 mb-2">Corps horizontal et aligné (épaules, hanches, chevilles). Bras verrouillés. Tenue min: <strong>3 sec</strong>.</p>
                    <span class="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded uppercase font-bold">Statique</span>
                </div>

                <!-- Full Planche -->
                <div class="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-pink-500/30">
                    <h4 class="font-bold text-white mb-2 text-lg">4. Full Planche</h4>
                    <p class="text-sm text-gray-400 mb-2">Corps parallèle au sol. Bras tendus. Pas de cambrure excessive. Tenue min: <strong>3 sec</strong>.</p>
                    <span class="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded uppercase font-bold">Statique</span>
                </div>

                <!-- Human Flag -->
                <div class="bg-white/5 p-6 rounded-xl border border-white/5 hover:border-pink-500/30">
                    <h4 class="font-bold text-white mb-2 text-lg">5. Human Flag</h4>
                    <p class="text-sm text-gray-400 mb-2">Corps perpendiculaire au poteau. Pas de pliure aux hanches. Tenue min: <strong>3 sec</strong>.</p>
                    <span class="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded uppercase font-bold">Statique</span>
                </div>
            </div>
        </section>

        <hr class="border-white/5" />

        <!-- 4. CARDIO (3 EXERCICES) -->
        <section>
            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20">
                    <!-- Icone Cardio -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <div>
                    <h2 class="text-3xl font-bold text-white">Cardio</h2>
                    <p class="text-xs text-yellow-400 font-mono uppercase tracking-widest">3 Exercices • Endurance</p>
                </div>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-white/5 p-6 rounded-xl border-t-2 border-yellow-500">
                    <h4 class="font-bold text-white mb-2">1. Course à pied</h4>
                    <p class="text-sm text-gray-400">
                        Extérieur (GPS obligatoire : Strava/Garmin) ou Tapis (Filmer l'écran en continu). 
                        Le score est calculé sur la vitesse moyenne.
                    </p>
                </div>
                
                <div class="bg-white/5 p-6 rounded-xl border-t-2 border-yellow-500">
                    <h4 class="font-bold text-white mb-2">2. Vélo</h4>
                    <p class="text-sm text-gray-400">
                        Route ou Appartement. Preuve de distance et de temps obligatoire via compteur ou application.
                    </p>
                </div>

                <div class="bg-white/5 p-6 rounded-xl border-t-2 border-yellow-500">
                    <h4 class="font-bold text-white mb-2">3. Corde à sauter</h4>
                    <p class="text-sm text-gray-400">
                        L'athlète doit être visible en entier. Le comptage se fait sur la vidéo. 
                        Indiquez le nombre de sauts total et le temps.
                    </p>
                </div>
            </div>
        </section>
        
        <div class="mt-20 text-center">
            <a href="/profile/contrib" data-link 
               class="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black uppercase tracking-wide hover:scale-105 transition-transform shadow-lg shadow-pink-500/30">
                <span>J'ai compris, poster une perf</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        </div>

      </div>
    </div>
  </section>
  `;
}