/* frontend/static/js/ui/pages/profile/refer.js */

export default user => `
  <div class="liquid-glass-card rounded-2xl p-8 space-y-8 animate-spring-in"
       data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">

    <h2 class="text-2xl font-bold text-white flex items-center gap-3">
        <span class="bg-yellow-500 w-2 h-8 rounded-full"></span> Parrainage
    </h2>
    
    <section class="space-y-4">
      <p class="text-gray-300 leading-relaxed">
        Invitez vos amis à rejoindre <strong class="text-white">DraftPrime</strong> et gagnez des bonus exclusifs lors de leur première contribution validée.
      </p>
      
      <div class="bg-black/30 p-6 rounded-xl border border-white/5">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Votre lien unique</label>
        <div class="flex gap-2">
            <input 
              type="text" 
              readonly 
              value="https://draftprime.com/register?ref=${user.uid || '12345'}"
              class="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-gray-300 font-mono text-sm focus:ring-0"
            >
            <button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
                Copier
            </button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="bg-white/5 p-4 rounded-lg border border-white/5 text-center">
            <p class="text-2xl font-bold text-white">0</p>
            <p class="text-xs text-gray-500 uppercase">Amis invités</p>
        </div>
        <div class="bg-white/5 p-4 rounded-lg border border-white/5 text-center">
            <p class="text-2xl font-bold text-pink-500">0</p>
            <p class="text-xs text-gray-500 uppercase">Bonus (pts)</p>
        </div>
      </div>

    </section>

  </div>
`;