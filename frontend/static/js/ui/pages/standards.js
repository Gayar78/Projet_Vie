/* frontend/static/js/ui/pages/standards.js */

export default function standardsPage() {
  return /* html */`
  <section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 text-gray-100">
    
    <div class="max-w-4xl mx-auto mt-12 liquid-glass-card rounded-2xl p-8 md:p-12 animate-spring-in">
      
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-black mb-4 text-white">Standards de Validation</h1>
        <p class="text-gray-400 text-lg">
          Pour que votre performance soit approuvée et compte pour le classement, 
          elle doit respecter strictement les critères suivants.
        </p>
      </div>

      <div class="space-y-12">

        <!-- 1. RÈGLES GÉNÉRALES -->
        <div class="border-l-4 border-pink-500 pl-6">
          <h2 class="text-2xl font-bold text-white mb-4">🎥 Règles Vidéo Globales</h2>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li><strong class="text-white">Non coupée :</strong> La vidéo doit être continue du début à la fin de l'exercice.</li>
            <li><strong class="text-white">Visibilité :</strong> L'athlète et la charge doivent être entièrement visibles.</li>
            <li><strong class="text-white">Pesée (Optionnelle) :</strong> Pour les records du monde, la pesée des poids est recommandée dans la même vidéo.</li>
          </ul>
        </div>

        <hr class="border-white/10">

        <!-- 2. MUSCULATION -->
        <div>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">🏋️‍♂️</span> Musculation (Powerlifting)
          </h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Bench -->
            <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-pink-400 mb-2">Bench Press</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Fesses en contact avec le banc.</li>
                <li>• Barre touche la poitrine (pause marquée non obligatoire mais préférée).</li>
                <li>• Extension complète des bras en fin de mouvement.</li>
              </ul>
            </div>

            <!-- Squat -->
            <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-pink-400 mb-2">Squat</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Profondeur : Le creux de la hanche doit passer sous le sommet du genou.</li>
                <li>• Remontée : Extension complète des hanches et genoux.</li>
              </ul>
            </div>

            <!-- Deadlift -->
            <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-pink-400 mb-2">Deadlift</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Pas de "ramping" (barre reposant sur les cuisses).</li>
                <li>• Verrouillage complet : Épaules en arrière, hanches avancées.</li>
                <li>• Contrôle de la descente (ne pas lâcher la barre du haut).</li>
              </ul>
            </div>
             <!-- OHP -->
             <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-pink-400 mb-2">Overhead Press</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Départ barre sur les clavicules/menton.</li>
                <li>• Pas d'impulsion des jambes (Military Press strict).</li>
                <li>• Bras tendus au dessus de la tête, corps aligné.</li>
              </ul>
            </div>
          </div>
        </div>

        <hr class="border-white/10">

        <!-- 3. STREET WORKOUT -->
        <div>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">🤸</span> Street Workout
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Pullups -->
            <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-blue-400 mb-2">Weighted Pull-up</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Départ bras tendus (déverrouillés).</li>
                <li>• Menton passe <strong>clairement</strong> au-dessus de la barre.</li>
                <li>• Pas de kipping (élan des jambes).</li>
              </ul>
            </div>

            <!-- Dips -->
            <div class="bg-black/30 p-5 rounded-xl border border-white/5">
              <h3 class="font-bold text-lg text-blue-400 mb-2">Weighted Dip</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Descente : Épaule sous le coude (90°).</li>
                <li>• Remontée : Bras tendus complets.</li>
              </ul>
            </div>

             <!-- Statics -->
             <div class="bg-black/30 p-5 rounded-xl border border-white/5 md:col-span-2">
              <h3 class="font-bold text-lg text-blue-400 mb-2">Statique (Front Lever, Planche...)</h3>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• Corps parfaitement aligné (pas de bananing).</li>
                <li>• Tenue minimale : <strong>3 secondes</strong> pour validation.</li>
                <li>• Bras tendus (verrouillés).</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-center">
            <a href="/profile/contrib" data-link class="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition shadow-lg">
                J'ai compris, poster une perf
            </a>
        </div>

      </div>
    </div>
  </section>
  `;
}