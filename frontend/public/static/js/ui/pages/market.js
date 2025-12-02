/* frontend/static/js/ui/pages/market.js */

// --- MOCK DATA (FAUX COURS POUR L'EXEMPLE) ---
const COURSES = [
    {
        id: 1,
        title: "Bench Press Mastery : +20kg en 8 semaines",
        author: "Thomas L.",
        author_rank: "Challenger",
        rating: 4.9,
        reviews: 128,
        price: 500,
        category: "Musculation",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: true
    },
    {
        id: 2,
        title: "Front Lever : Le guide ultime étape par étape",
        author: "Sarah Fit",
        author_rank: "Grand Maître",
        rating: 4.8,
        reviews: 85,
        price: 350,
        category: "Street Workout",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: false
    },
    {
        id: 3,
        title: "Marathon Ready : Plan 12 semaines",
        author: "Coach Mike",
        author_rank: "Maître",
        rating: 4.7,
        reviews: 42,
        price: 200,
        category: "Cardio",
        image: "https://images.unsplash.com/photo-1552674605-469523f5405c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: false
    },
    {
        id: 4,
        title: "Squat & Deadlift : Technique Parfaite",
        author: "PowerHouse",
        author_rank: "Diamant",
        rating: 4.9,
        reviews: 210,
        price: 600,
        category: "Musculation",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: true
    },
    {
        id: 5,
        title: "Muscle Up : Débloquez votre premier MU",
        author: "StreetKing",
        author_rank: "Platine",
        rating: 4.6,
        reviews: 30,
        price: 150,
        category: "Street Workout",
        image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: false
    },
    {
        id: 6,
        title: "Nutrition Sportive & Perte de Gras",
        author: "Dr. Nutri",
        author_rank: "Or",
        rating: 4.5,
        reviews: 55,
        price: 100,
        category: "Santé",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        isBestSeller: false
    }
];

export default function marketPage() {
  return /* html */`
  <section class="page-enter relative min-h-[calc(100vh-160px)] px-6 pb-20">
    
    <!-- HERO BANNER TYPE UDEMY -->
    <div class="max-w-7xl mx-auto mt-24 mb-12">
        <div class="liquid-glass-card rounded-3xl overflow-hidden relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 animate-spring-in"
             data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.005">
             
             <div class="flex-1 space-y-6 z-10">
                 <span class="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold uppercase tracking-widest">Marketplace</span>
                 <h1 class="text-4xl md:text-6xl font-black text-white leading-tight">
                    Apprenez des <br/>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Meilleurs Athlètes</span>
                 </h1>
                 <p class="text-gray-400 text-lg max-w-lg">
                    Accédez à des programmes d'entraînement exclusifs créés par les champions du classement. Payez en Coins ou en Euros.
                 </p>
                 <div class="flex gap-4 pt-2">
                    <button class="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition shadow-lg shadow-white/10">Explorer</button>
                    <button class="px-8 py-3 rounded-full bg-black/30 border border-white/20 text-white font-bold hover:bg-white/10 transition">Vendre un cours</button>
                 </div>
             </div>

             <!-- ILLUSTRATION DROITE -->
             <div class="relative w-full md:w-1/3 aspect-square md:aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div class="absolute bottom-4 left-4">
                    <p class="font-bold text-white">Programme Elite</p>
                    <p class="text-xs text-gray-400">Par Top Challenger</p>
                </div>
             </div>
        </div>
    </div>

    <!-- FILTRES CATEGORIES -->
    <div class="max-w-7xl mx-auto mb-10 overflow-x-auto scrollbar-hide">
        <div class="flex gap-4 min-w-max px-2">
            ${['Tout', 'Musculation', 'Street Workout', 'Cardio', 'Santé', 'Mental', 'Souplesse'].map((cat, i) => `
                <button class="px-6 py-2 rounded-full border border-white/10 text-sm font-bold transition-all
                               ${i === 0 ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-black/30 text-gray-400 hover:text-white hover:bg-white/10'}">
                    ${cat}
                </button>
            `).join('')}
        </div>
    </div>

    <!-- GRILLE DES COURS -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${COURSES.map(course => `
            <div class="group liquid-glass-card rounded-xl overflow-hidden hover:border-pink-500/30 transition-all duration-300 flex flex-col h-full"
                 data-tilt data-tilt-glare data-tilt-max-glare="0.1" data-tilt-scale="1.02">
                
                <!-- IMAGE -->
                <div class="relative h-40 overflow-hidden">
                    <img src="${course.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    ${course.isBestSeller ? `<span class="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-md">BESTSELLER</span>` : ''}
                </div>

                <!-- CONTENU -->
                <div class="p-4 flex flex-col flex-1">
                    <h3 class="font-bold text-white text-lg leading-snug mb-1 group-hover:text-pink-400 transition-colors line-clamp-2">${course.title}</h3>
                    
                    <p class="text-xs text-gray-400 mb-2">Par <span class="text-gray-200">${course.author}</span></p>
                    
                    <!-- RATING -->
                    <div class="flex items-center gap-1 mb-2">
                        <span class="font-bold text-yellow-500 text-sm">${course.rating}</span>
                        <div class="flex text-yellow-500 text-xs">★★★★★</div>
                        <span class="text-xs text-gray-500">(${course.reviews})</span>
                    </div>

                    <div class="flex-1"></div> <!-- Spacer -->

                    <!-- PRIX & ACTION -->
                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div class="flex items-center gap-1">
                            <img src="/static/images/Coin.png" class="w-5 h-5">
                            <span class="font-bold text-white text-lg">${course.price}</span>
                        </div>
                        <button class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-pink-600 text-white text-xs font-bold transition-colors uppercase tracking-wide">
                            Voir
                        </button>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <!-- PAGINATION MOCKUP -->
    <div class="flex justify-center mt-12 gap-2">
        <button class="w-10 h-10 rounded-lg bg-pink-600 text-white font-bold flex items-center justify-center">1</button>
        <button class="w-10 h-10 rounded-lg bg-black/30 border border-white/10 text-gray-400 hover:text-white font-bold flex items-center justify-center">2</button>
        <button class="w-10 h-10 rounded-lg bg-black/30 border border-white/10 text-gray-400 hover:text-white font-bold flex items-center justify-center">></button>
    </div>

  </section>
  `;
}