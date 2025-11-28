/* frontend/static/js/ui/pages/profile/friends.js */
import { api } from '../../../core/api.js';

// --- COMPOSANTS HTML ---

function userCard(user, actionsHtml = '') {
    return `
    <div class="bg-white/5 hover:bg-white/10 border border-white/10 shadow-lg p-4 rounded-xl flex items-center gap-4 transition-all duration-200" 
         data-uid="${user.id}">
        <a href="/user/${user.id}" data-link class="flex items-center gap-4 flex-1 group">
            <img src="${user.photoURL || '/static/images/ranks/rank.png'}" 
                 class="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-pink-500/50 transition-all">
            <div>
                <p class="font-bold text-gray-100 group-hover:text-pink-400 transition-colors text-sm">${user.displayName}</p>
            </div>
        </a>
        <div class="flex items-center gap-2">${actionsHtml}</div>
    </div>`;
}

// --- MODALE CRÉATION (SIMPLE) ---
async function openCreateGroupModal(myFriends) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-spring-in';
    
    const friendsListHtml = myFriends.map(f => `
        <label class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input type="checkbox" value="${f.id}" class="form-checkbox text-pink-500 rounded bg-black/50 border-white/20 focus:ring-pink-500">
            <img src="${f.photoURL || '/static/images/ranks/rank.png'}" class="w-8 h-8 rounded-full object-cover">
            <span class="text-sm font-bold text-gray-200">${f.displayName}</span>
        </label>
    `).join('');

    modal.innerHTML = `
        <div class="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div class="p-6 border-b border-white/10">
                <h2 class="text-xl font-black text-white uppercase tracking-wider">Nouveau Groupe</h2>
            </div>
            <div class="p-6 overflow-y-auto space-y-6">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nom du groupe</label>
                    <input type="text" id="group-name" placeholder="ex: Les Spartiates" class="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:ring-pink-500 placeholder-gray-600">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Sélectionner des amis</label>
                    <div class="space-y-2">
                        ${friendsListHtml || '<p class="text-gray-500 italic text-sm">Ajoutez d\'abord des amis !</p>'}
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-white/10 flex gap-3">
                <button id="cancel-group" class="flex-1 py-3 rounded-lg bg-white/5 text-gray-300 font-bold hover:bg-white/10 transition">Annuler</button>
                <button id="confirm-group" class="flex-1 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold hover:scale-105 transition-transform shadow-lg">Créer</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return new Promise((resolve) => {
        document.getElementById('cancel-group').onclick = () => { modal.remove(); resolve(false); };
        document.getElementById('confirm-group').onclick = async () => {
            const name = document.getElementById('group-name').value.trim();
            if (!name) return alert("Donnez un nom au groupe !");
            const selected = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            await api('/groups/create', { name, members: selected });
            modal.remove();
            resolve(true);
        };
    });
}

// --- MODALE INSPECTION / GESTION (COMPLÈTE) ---
async function openInspectGroupModal(group, myFriends, isOwner) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-spring-in';

    // 1. Liste des membres actuels (Pour affichage et Kick)
    // Note: Dans l'objet group renvoyé par /groups, on n'a que les UIDs dans 'members'.
    // Il faudrait idéalement que le backend renvoie les détails. 
    // Pour ce MVP, on va comparer avec 'myFriends' pour afficher les noms, ou afficher "Utilisateur" par défaut.
    // Astuce : On peut récupérer les infos manquantes via l'API publique si besoin, mais ici on fait simple.
    
    // Pour l'affichage propre, on va assumer que 'myFriends' contient les infos. 
    // Si un membre n'est pas mon ami, on ne verra pas son nom (limite actuelle).
    // Amélioration possible : Modifier le backend /groups pour renvoyer {uid, displayName, photo} dans members.
    
    let membersHtml = '';
    
    // On triche un peu : on ne peut afficher que les amis ou soi-même pour l'instant sans appel API supplémentaire
    // On va faire un appel API pour récupérer les infos de chaque membre du groupe pour être propre.
    const membersDetails = [];
    for (const uid of group.members) {
        try {
            const u = await api(`/public_profile/${uid}`, null, 'GET'); // Récupère infos basiques
            membersDetails.push({ id: uid, ...u });
        } catch (e) {}
    }

    membersHtml = membersDetails.map(m => `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div class="flex items-center gap-3">
                <img src="${m.photoURL || '/static/images/ranks/rank.png'}" class="w-8 h-8 rounded-full object-cover">
                <span class="text-sm text-white font-bold">${m.displayName}</span>
            </div>
            ${isOwner && m.id !== group.admin_uid ? `
                <button class="kick-btn text-red-500 hover:text-red-400 p-2 bg-red-500/10 hover:bg-red-500/20 rounded" data-uid="${m.id}" title="Exclure">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>` 
            : (m.id === group.admin_uid ? '<span class="text-[10px] text-purple-400 font-bold uppercase border border-purple-500/30 px-2 py-1 rounded">Admin</span>' : '')}
        </div>
    `).join('');

    // 2. Liste des amis PAS ENCORE dans le groupe (Pour ajout)
    const potentialMembers = myFriends.filter(f => !group.members.includes(f.id) && !group.invited.includes(f.id));
    const addMembersHtml = potentialMembers.map(f => `
        <label class="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input type="checkbox" value="${f.id}" class="add-member-cb form-checkbox text-purple-500 rounded bg-black/50 border-white/20">
            <span class="text-sm text-gray-200">${f.displayName}</span>
        </label>
    `).join('');


    modal.innerHTML = `
        <div class="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <!-- Header -->
            <div class="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10 rounded-t-2xl">
                <h2 class="text-xl font-black text-white uppercase tracking-wider">Gestion du Groupe</h2>
                <button id="close-inspect" class="text-gray-400 hover:text-white">&times;</button>
            </div>
            
            <div class="p-6 overflow-y-auto space-y-8">
                
                <!-- 1. Renommer (Admin Only) -->
                ${isOwner ? `
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nom du groupe</label>
                    <div class="flex gap-2">
                        <input type="text" id="edit-group-name" value="${group.name}" class="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:ring-purple-500">
                        <button id="save-name-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-bold uppercase">Sauver</button>
                    </div>
                </div>` : `
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-white">${group.name}</h3>
                    <p class="text-xs text-gray-500 uppercase tracking-widest">Membres : ${group.members.length}</p>
                </div>
                `}

                <!-- 2. Liste des membres -->
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-3">Membres actuels</label>
                    <div class="space-y-2">
                        ${membersHtml}
                    </div>
                </div>

                <!-- 3. Ajouter des membres (Admin Only) -->
                ${isOwner && potentialMembers.length > 0 ? `
                <div class="border-t border-white/10 pt-6">
                    <label class="block text-xs font-bold text-green-400 uppercase mb-3">Ajouter des amis</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar mb-3">
                        ${addMembersHtml}
                    </div>
                    <button id="btn-add-selected" class="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition">Envoyer les invitations</button>
                </div>
                ` : ''}

                <!-- 4. Zone Danger (Admin: Supprimer, Membre: Quitter) -->
                <div class="border-t border-white/10 pt-6">
                    ${isOwner ? `
                        <button id="delete-group-btn" class="w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-bold uppercase tracking-wide transition">Supprimer le groupe</button>
                    ` : `
                         <button id="leave-group-btn" class="w-full py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-bold uppercase tracking-wide transition">Quitter le groupe</button>
                    `}
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return new Promise((resolve) => {
        const close = () => { modal.remove(); resolve(true); };
        document.getElementById('close-inspect').onclick = close;

        // Renommer
        if(isOwner) {
            document.getElementById('save-name-btn').onclick = async () => {
                const newName = document.getElementById('edit-group-name').value;
                if(newName) await api(`/groups/rename/${group.id}`, { new_name: newName }, 'POST');
                close();
            };
            
            document.getElementById('delete-group-btn').onclick = async () => {
                if(confirm("Supprimer définitivement ce groupe ?")) {
                    await api(`/groups/delete/${group.id}`, null, 'POST');
                    close();
                }
            };

            // Ajouter Membres
            const addBtn = document.getElementById('btn-add-selected');
            if(addBtn) {
                addBtn.onclick = async () => {
                    const uids = Array.from(modal.querySelectorAll('.add-member-cb:checked')).map(cb => cb.value);
                    if(uids.length) await api(`/groups/add_members/${group.id}`, { members: uids }, 'POST');
                    close();
                };
            }

            // Kick Membres
            modal.querySelectorAll('.kick-btn').forEach(btn => {
                btn.onclick = async () => {
                    if(confirm("Retirer ce membre ?")) {
                        await api(`/groups/kick/${group.id}`, { member_uid: btn.dataset.uid }, 'POST');
                        close(); // On ferme pour forcer le refresh
                    }
                };
            });
        } else {
            // Quitter
            document.getElementById('leave-group-btn').onclick = async () => {
                if(confirm("Quitter ce groupe ?")) {
                    await api(`/groups/leave/${group.id}`, null, 'POST');
                    close();
                }
            }
        }
    });
}


// --- LOGIQUE PRINCIPALE ---
export function mount(user) {
    const container = document.getElementById('friends-page-container');
    if (!container) return;

    const loadAll = async () => {
        try {
            const friendsData = await api('/profile/friends', null, 'GET');
            const groupsData = await api('/groups', null, 'GET');

            // RENDER GROUPES
            const groupList = document.getElementById('groups-list');
            const groupInvites = document.getElementById('group-invites-list');

            // Invitations
            if (groupsData.invited.length) {
                groupInvites.innerHTML = groupsData.invited.map(g => `
                    <div class="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-center justify-between animate-spring-in">
                        <div><p class="font-bold text-white">${g.name}</p><p class="text-xs text-purple-300">Invité par ${g.admin_name}</p></div>
                        <div class="flex gap-2">
                            <button data-action="group-join" data-gid="${g.id}" class="px-3 py-1 bg-purple-600 rounded text-xs font-bold text-white hover:bg-purple-500">Rejoindre</button>
                            <button data-action="group-leave" data-gid="${g.id}" class="px-3 py-1 bg-white/10 rounded text-xs font-bold text-gray-300 hover:bg-white/20">Refuser</button>
                        </div>
                    </div>
                `).join('');
                groupInvites.parentElement.classList.remove('hidden');
            } else groupInvites.parentElement.classList.add('hidden');

            // Liste Membres
            if (groupsData.member.length) {
                groupList.innerHTML = groupsData.member.map(g => {
                    const isAdmin = g.admin_uid === user.uid;
                    return `
                    <div class="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-pink-500/30 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">${g.name.charAt(0).toUpperCase()}</div>
                            <div><p class="font-bold text-white">${g.name}</p><p class="text-xs text-gray-500">${g.members.length} membres</p></div>
                        </div>
                        <div class="flex gap-2 items-center">
                             <a href="/leaderboard?group=${g.id}" data-link class="px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors">Voir</a>
                             <button data-action="group-inspect" data-gid="${g.id}" class="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold border border-white/10">Inspecter</button>
                        </div>
                    </div>
                `;
                }).join('');
            } else {
                groupList.innerHTML = '<div class="p-6 text-center border border-white/5 border-dashed rounded-xl"><p class="text-gray-500 text-sm">Créez un groupe pour défier vos potes !</p></div>';
            }

            // RENDER AMIS
            const reqList = document.getElementById('friend-requests-list');
            const friendList = document.getElementById('friends-list');
            
            if (friendsData.pending_received.length) {
                reqList.innerHTML = friendsData.pending_received.map(u => userCard(u, `<button data-action="friend-accept" data-uid="${u.id}" class="px-3 py-1 bg-green-600 rounded text-xs font-bold text-white">Accepter</button>`)).join('');
            } else reqList.innerHTML = '';
            
            if (friendsData.accepted.length) {
                friendList.innerHTML = friendsData.accepted.map(u => userCard(u, `<button data-action="friend-remove" data-uid="${u.id}" class="p-2 text-gray-500 hover:text-red-500 bg-white/5 rounded-lg hover:bg-red-500/10 transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`)).join('');
            } else {
                friendList.innerHTML = '<p class="text-gray-500 italic text-sm text-center py-4">Pas encore d\'amis.</p>';
            }

            // GESTIONNAIRE DE CLICS CENTRALISÉ
            container.onclick = async (e) => {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                
                const action = btn.dataset.action;
                const uid = btn.dataset.uid;
                const gid = btn.dataset.gid;
                
                // Actions Amis
                if (action === 'friend-accept') { await api(`/friends/accept/${uid}`, null, 'POST'); loadAll(); }
                if (action === 'friend-remove') { 
                    if(confirm("Retirer cet ami ?")) { await api(`/friends/remove/${uid}`, null, 'POST'); loadAll(); }
                }

                // Actions Groupes
                if (action === 'group-join') { await api(`/groups/join/${gid}`, null, 'POST'); loadAll(); }
                if (action === 'group-leave') { await api(`/groups/leave/${gid}`, null, 'POST'); loadAll(); }
                
                if (action === 'group-inspect') {
                    const group = groupsData.member.find(g => g.id === gid);
                    if(group) {
                        const isOwner = group.admin_uid === user.uid;
                        const updated = await openInspectGroupModal(group, friendsData.accepted, isOwner);
                        if(updated) loadAll();
                    }
                }
            };
            
            // Création
            const createBtn = document.getElementById('create-group-btn');
            // On retire les anciens listeners pour éviter les doublons
            const newCreateBtn = createBtn.cloneNode(true);
            createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
            newCreateBtn.onclick = async () => {
                const created = await openCreateGroupModal(friendsData.accepted);
                if (created) loadAll();
            };

        } catch (e) { console.error(e); }
    };

    loadAll();
}

export default user => `
  <div id="friends-page-container" class="space-y-10 liquid-glass-card rounded-2xl p-8 animate-spring-in" data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">
    <section>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white flex items-center gap-3"><span class="bg-pink-500 w-1.5 h-8 rounded-full"></span> Groupes</h2>
            <button id="create-group-btn" class="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase tracking-wide shadow-lg transition-transform active:scale-95 flex items-center gap-2"><span>+</span> Créer</button>
        </div>
        <div class="hidden mb-6 space-y-3"><p class="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Invitations reçues</p><div id="group-invites-list" class="space-y-2"></div></div>
        <div id="groups-list" class="space-y-3"><p class="text-gray-500 animate-pulse text-sm">Chargement...</p></div>
    </section>
    <hr class="border-white/10" />
    <section>
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3"><span class="bg-blue-500 w-1.5 h-8 rounded-full"></span> Amis</h2>
        <div id="friend-requests-list" class="space-y-3 mb-6 empty:hidden"></div>
        <div id="friends-list" class="space-y-3 min-h-[60px]"><p class="text-gray-500 animate-pulse text-sm">Chargement...</p></div>
    </section>
  </div>
`;