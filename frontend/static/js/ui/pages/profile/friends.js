/* frontend/static/js/ui/pages/profile/friends.js */
import { api } from '../../../core/api.js';

function userCard(user, actionsHtml = '') {
    return `
    <div class="bg-white/5 hover:bg-white/10 border border-white/10 shadow-lg p-4 rounded-xl flex items-center gap-4 transition-all duration-200" 
         data-uid="${user.id}">
        
        <a href="/user/${user.id}" data-link class="flex items-center gap-4 flex-1 group">
            <img src="${user.photoURL || '/static/images/ranks/rank.png'}" 
                 class="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-pink-500/50 transition-all">
            <div>
                <p class="font-bold text-gray-100 group-hover:text-pink-400 transition-colors">${user.displayName}</p>
                <p class="text-xs text-gray-500">Voir le profil</p>
            </div>
        </a>

        <div class="flex items-center gap-2">${actionsHtml}</div>

    </div>`;
}

export function mount(user) {
    const requestsContainer = document.getElementById('friend-requests-list');
    const friendsContainer = document.getElementById('friends-list');
    const pageContainer = document.getElementById('friends-page-container');

    if (!pageContainer) return;

    const loadFriends = async () => {
        try {
            const { accepted, pending_received } = await api('/profile/friends', null, 'GET');

            // Demandes
            if (pending_received && pending_received.length > 0) {
                requestsContainer.innerHTML = pending_received.map(u => userCard(u, `
                    <button data-action="accept" class="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-900/20 transition-all">Accepter</button>
                    <button data-action="reject" class="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-semibold transition-all">Refuser</button>
                `)).join('');
            } else {
                requestsContainer.innerHTML = '<p class="text-gray-500 text-sm p-4 text-center italic border border-white/5 rounded-lg bg-black/20">Aucune demande en attente.</p>';
            }

            // Amis
            if (accepted && accepted.length > 0) {
                friendsContainer.innerHTML = accepted.map(u => userCard(u, `
                    <button data-action="remove" class="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Retirer des amis">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                `)).join('');
            } else {
                friendsContainer.innerHTML = '<p class="text-gray-500 text-sm p-8 text-center italic">Votre liste d\'amis est vide pour le moment.</p>';
            }

        } catch (e) {
            console.error(e);
            requestsContainer.innerHTML = '<p class="text-red-400 p-4 text-center">Erreur de chargement.</p>';
        }
    };
    
    pageContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const card = button.closest('[data-uid]');
        const uid = card?.dataset.uid;
        const action = button.dataset.action;

        if(!uid) return;

        button.disabled = true;
        button.style.opacity = "0.5";
        
        try {
            if (action === 'accept') await api(`/friends/accept/${uid}`, null, 'POST');
            else if (action === 'reject') await api(`/friends/reject/${uid}`, null, 'POST');
            else if (action === 'remove') await api(`/friends/remove/${uid}`, null, 'POST');
            
            loadFriends();
        } catch (err) {
            console.error(err);
            loadFriends();
        }
    });

    loadFriends();
}

export default user => `
  <div id="friends-page-container" 
       class="space-y-8 liquid-glass-card rounded-2xl p-8 animate-spring-in"
       data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
    
    <section>
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="bg-pink-500 w-2 h-8 rounded-full"></span> Demandes d'amis
        </h2>
        <div id="friend-requests-list" class="space-y-3 min-h-[60px]">
            <p class="text-gray-500 animate-pulse">Chargement...</p>
        </div>
    </section>
    
    <hr class="border-white/10" />

    <section>
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="bg-blue-500 w-2 h-8 rounded-full"></span> Mes Amis
        </h2>
        <div id="friends-list" class="space-y-3 min-h-[100px]">
            <p class="text-gray-500 animate-pulse">Chargement...</p>
        </div>
    </section>

  </div>
`;