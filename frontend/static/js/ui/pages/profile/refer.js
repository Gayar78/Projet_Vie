// frontend/static/js/ui/pages/profile/refer.js

// ------------------------------------------------------------------
// 1. Le HTML de la page
// ------------------------------------------------------------------
export default user => `
  <!-- MODIFIÉ : Panneau "Liquid Glass" unifié -->
  <div class="space-y-6 liquid-glass-card rounded-2xl p-6">

    <h2 class="text-3xl font-bold text-gray-900">Parrainer un Ami</h2>
    
    <section>
      <p class="text-gray-700 mb-4">
        Invitez vos amis à rejoindre DraftPrime ! Partagez votre lien unique.
        (Cette fonctionnalité est en cours de développement.)
      </p>
      
      <label class="block">
        <span class="font-semibold text-gray-900">Votre lien de parrainage</span>
        <input 
          type="text" 
          readonly 
          value="https://draftprime.com/register?ref=${user.uid || '12345'}"
          class="mt-2 w-full px-3 py-2 rounded-lg bg-white/70 border-0 ring-1 ring-black/10 shadow-inner"
        >
      </label>
    </section>

  </div> <!-- Fin du panneau "Liquid Glass" -->
`;
