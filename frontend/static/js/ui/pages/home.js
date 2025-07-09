// static/js/ui/pages/home.js
export default function home () {
  return /* html */ `
  <!-- HERO -------------------------------------------------- -->
  <section
    class="relative flex flex-col items-center justify-center text-center
           px-6 pb-32 overflow-hidden
           min-h-[calc(100vh-160px)]"
  >
    <!-- Canvas Vanta couvrant tout le viewport -->
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>

    <!-- HEADLINE + SLOGAN -->
    <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-center">
      Rise, Record,<br />
      <span class="bg-gradient-to-r from-pink-500 to-purple-500
                   bg-clip-text text-transparent">
        Draft&nbsp;Prime.
      </span>
    </h1>

    <p class="max-w-2xl mx-auto text-gray-300 mb-10 text-center">
      La première plateforme communautaire où chaque performance compte&nbsp;:
      partage tes exploits, grimpe au classement et gagne des récompenses
      réelles tous les&nbsp;6&nbsp;mois.
    </p>

    <a
      href="/register"
      data-link
      class="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600
             hover:opacity-90 font-semibold text-white shadow-lg
             shadow-pink-500/30"
    >
      Créer mon compte
    </a>
  </section>

  <!-- LEADERBOARD PREVIEW ----------------------------------- -->
  <section class="py-24 px-6 bg-[#0d0818] border-t border-white/10">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-bold mb-4">Classements en temps réel</h2>
        <p class="text-gray-400 mb-6">
          Valide ta performance en vidéo, gagne des points et vois immédiatement
          ta position mondiale.<br />
          Niveaux de <strong>Fer</strong> à
          <strong>Grand&nbsp;Master</strong>.
        </p>
        <a
          href="/leaderboard"
          data-link
          class="inline-flex items-center gap-2 text-pink-400 font-semibold hover:underline"
        >
          Voir le leaderboard&nbsp;→
        </a>
      </div>

      <div
        class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
      >
        <p class="text-center text-gray-400">Extrait en direct</p>
        <div id="home-leaderboard" class="mt-4 text-sm text-gray-300"></div>
      </div>
    </div>
  </section>

    <!-- RANKS --------------------------------------------------- -->
<section class="py-24 px-6 bg-[#0b0614] border-t border-white/10">
  <div class="max-w-6xl mx-auto text-center mb-12">
    <h2 class="text-3xl font-bold mb-4">Système de Rangs</h2>
    <p class="text-gray-400 max-w-2xl mx-auto">
      Chaque effort compte. Gagne des points, monte en grade et affiche fièrement ton rang.
    </p>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
    ${[
      { name: 'Fer', img: 'iron.png' },
      { name: 'Bronze', img: 'bronze.png' },
      { name: 'Argent', img: 'silver.png' },
      { name: 'Or', img: 'gold.png' },
      { name: 'Platine', img: 'platinium.png' },
      { name: 'Émeraude', img: 'emeraude.png' },
      { name: 'Diamant', img: 'diamond.png' },
      { name: 'Maître', img: 'master.png' },
      { name: 'Grand Maître', img: 'grandmaster.png' },
      { name: 'Challenger', img: 'challenger.png' },
    ].map(
      (rank) => `
      <div class="flex flex-col items-center">
        <img src="/static/images/ranks/${rank.img}" alt="${rank.name}" class="w-24 h-24 object-contain mb-2" />
        <p class="text-sm text-gray-300">${rank.name}</p>
      </div>
    `
    ).join('')}
  </div>
</section>

  <!-- MARKETPLACE ------------------------------------------- -->
  <section class="py-24 px-6 bg-[#0b0614]">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div class="order-2 lg:order-1">
        <h2 class="text-3xl font-bold mb-4">Marketplace de programmes</h2>
        <p class="text-gray-400 mb-6">
          Achète ou vends des routines premium. Les coachs fixent leur prix&nbsp;;
          la communauté évalue.&nbsp;💸
        </p>
        <a
          href="/programs"
          data-link
          class="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:underline"
        >
          Découvrir les programmes&nbsp;→
        </a>
      </div>

      <div
        class="order-1 lg:order-2 bg-gradient-to-br from-purple-600/30 to-pink-500/10
               p-8 rounded-2xl border border-white/10"
      >
        <p class="text-center text-gray-300">Mock-up cartes programme (à venir)</p>
      </div>
    </div>
  </section>

    <!-- REWARDS ------------------------------------------------ -->
  <section class="py-24 px-6 bg-[#0d0818] border-t border-white/10">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-bold mb-4">Système de récompenses</h2>
        <p class="text-gray-400 mb-6">
          Gagne des <strong>DraftCoins</strong> en montant dans le classement&nbsp;:
          chaque <strong>10 points = 1 coin</strong>. Utilise-les pour obtenir des
          <span class="text-yellow-400 font-semibold">équipements exclusifs</span>,
          des <span class="text-yellow-400 font-semibold">crédits boutique</span> ou même des <span class="text-yellow-400 font-semibold">boosts de rang</span>.
        </p>
        <p class="text-gray-500 italic mb-6">
          Les coins sont réinitialisés à chaque nouvelle saison, mais tes stats restent visibles dans ton profil.
        </p>
        <a
          href="/rewards"
          data-link
          class="inline-flex items-center gap-2 text-yellow-400 font-semibold hover:underline"
        >
          Voir les récompenses&nbsp;→
        </a>
      </div>

      <div class="flex justify-center lg:justify-end">
        <img
          src="/static/images/coin.png"
          alt="Pièce DraftPrime"
          class="w-40 h-40 md:w-52 md:h-52 object-contain"
        />
      </div>
    </div>
  </section>


  <!-- FAQ ---------------------------------------------------- -->
  <section class="py-24 px-6 bg-[#0b0614]">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">Foire aux questions</h2>
      <div class="space-y-6 text-gray-300">
        <details class="border border-white/10 rounded-lg p-4">
          <summary class="font-semibold cursor-pointer">
            Comment mes performances sont-elles validées&nbsp;?
          </summary>
          <p class="mt-2">
            Tu uploades une vidéo de 2-3 minutes. Un admin vérifie la forme,
            l’exécution et l’authenticité avant d’attribuer tes points.
          </p>
        </details>

        <details class="border border-white/10 rounded-lg p-4">
          <summary class="font-semibold cursor-pointer">
            Puis-je vendre mon propre programme&nbsp;?
          </summary>
          <p class="mt-2">
            Oui&nbsp;! Une fois ton profil coach approuvé, tu peux publier et
            monétiser tes routines. Nous prenons une petite commission.
          </p>
        </details>

        <details class="border border-white/10 rounded-lg p-4">
          <summary class="font-semibold cursor-pointer">
            Que deviennent mes points après chaque saison&nbsp;?
          </summary>
          <p class="mt-2">
            Les compteurs publics repartent à zéro, mais ton historique reste
            disponible dans ton espace personnel.
          </p>
        </details>
      </div>
    </div>
  </section>

  <!-- CTA FINAL --------------------------------------------- -->
  <section class="py-24 px-6 bg-[#0d0818] border-t border-white/10 text-center">
    <h2 class="text-4xl font-extrabold mb-6">
      Prêt à marquer l’histoire&nbsp;?
    </h2>
    <a
      href="/register"
      data-link
      class="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600
             hover:opacity-90 font-semibold shadow-lg shadow-purple-600/30"
    >
      Je rejoins la compétition
    </a>
  </section>
  `;
}
