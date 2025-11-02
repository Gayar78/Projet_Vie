// frontend/static/js/ui/pages/profile/settings.js
import { api } from '../../../core/api.js';

// ------------------------------------------------------------------
// 1. Logique (sera appelée par le routeur après l'affichage)
// ------------------------------------------------------------------
export function mount(user) {
    const toggle = document.getElementById('public-profile-toggle');
    const msg = document.getElementById('settings-msg');
    if (!toggle) return;

    // Met le toggle dans le bon état au chargement
    toggle.checked = user.isPublic || false;

    toggle.addEventListener('change', async () => {
        const isChecked = toggle.checked;
        try {
            // Affiche un message de chargement
            msg.textContent = 'Mise à jour...';
            msg.className = 'text-gray-400 text-sm mt-2';

            await api('/profile', { isPublic: isChecked });

            // Affiche un message de succès
            msg.textContent = 'Paramètres enregistrés !';
            msg.className = 'text-green-400 text-sm mt-2';

        } catch (e) {
            console.error(e);
            // Remet le toggle à son état précédent en cas d'erreur
            toggle.checked = !isChecked;
            msg.textContent = 'Erreur lors de la mise à jour.';
            msg.className = 'text-red-500 text-sm mt-2';
        }
    });

    //LOGIQUE POUR LA BIO
    const bioForm = document.getElementById('bio-form');
    const bioText = document.getElementById('bio-textarea');
    const bioMsg = document.getElementById('bio-msg');

    bioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bioContent = bioText.value;
        bioMsg.textContent = 'Enregistrement...';
        bioMsg.className = 'text-gray-400 text-sm mt-2';

        try {
            // On appelle le même endpoint /profile
            await api('/profile', { bio: bioContent });
            bioMsg.textContent = 'Biographie mise à jour !';
            bioMsg.className = 'text-green-400 text-sm mt-2';
        } catch (err) {
            bioMsg.textContent = 'Erreur lors de la mise à jour.';
            bioMsg.className = 'text-red-500 text-sm mt-2';
        }
    });

    // LOGIQUE POUR L'AVATAR
    const avatarForm = document.getElementById('avatar-form');
    const avatarInput = document.getElementById('avatar-input');
    const avatarMsg = document.getElementById('avatar-msg');
    const avatarPreview = document.getElementById('avatar-preview');

    // Optionnel : Prévisualise l'image avant l'upload
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            avatarPreview.src = URL.createObjectURL(file);
        }
    });

    avatarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = avatarInput.files[0];
        if (!file) {
            avatarMsg.textContent = 'Veuillez choisir un fichier.';
            avatarMsg.className = 'text-red-500 text-sm mt-2';
            return;
        }

        // On prépare un FormData (nécessaire pour les fichiers)
        const fd = new FormData();
        fd.append('file', file);

        avatarMsg.textContent = 'Téléchargement...';
        avatarMsg.className = 'text-gray-400 text-sm mt-2';

        try {
            // On appelle le nouvel endpoint /upload_avatar
            // NOTE: On ne peut pas utiliser notre helper `api()` car il
            // est configuré pour 'application/json', pas pour 'FormData'.
            // On utilise 'fetch' directement.

            const res = await fetch('/api/upload_avatar', {
                method: 'POST',
                headers: {
                    // Pas de 'Content-Type', le navigateur le gère
                    'Authorization': localStorage.getItem('token') || ''
                },
                body: fd
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            // Met à jour la preview avec la nouvelle URL de Storage
            avatarPreview.src = data.photoURL; 
            avatarMsg.textContent = 'Photo mise à jour !';
            avatarMsg.className = 'text-green-400 text-sm mt-2';

            // On force un re-rendu du routeur pour voir la photo
            // dans la sidebar immédiatement
            window.dispatchEvent(new PopStateEvent('popstate'));

        } catch (err) {
            avatarMsg.textContent = 'Erreur: ' + err.message;
            avatarMsg.className = 'text-red-500 text-sm mt-2';
        }
    });
}

// ------------------------------------------------------------------
// 2. Le HTML de la page
// ------------------------------------------------------------------
export default user => `
  <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
    <h3 class="text-lg font-semibold mb-4">Paramètres du profil</h3>

    <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div>
        <label for="public-profile-toggle" class="font-medium cursor-pointer">Profil Public</label>
        <p class="text-sm text-gray-400 mt-1">
          Permet aux autres utilisateurs de voir votre profil et vos scores.
        </p>
      </div>
      <div class="relative inline-block w-10 mr-2 align-middle select-none">
        <input 
          type="checkbox" 
          name="public-profile-toggle" 
          id="public-profile-toggle" 
          class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          ${(user.isPublic || false) ? 'checked' : ''}
        />
        <label 
          for="public-profile-toggle" 
          class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer">
        </label>
      </div>
    </div>
      <p id="settings-msg" class="text-sm mt-2"></p>
      <p id="settings-msg" class="text-sm mt-2"></p>
    </div>

    <form id="bio-form" class="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
    <h3 class="text-lg font-semibold mb-4">Ma biographie</h3>
    <textarea
        id="bio-textarea"
        rows="4"
        class="w-full p-2 rounded bg-[#20202e] border border-white/10"
        placeholder="Coach sportif, passionné de street workout..."
    >${user.bio || ''}</textarea>

    <button type="submit" class="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-semibold">
        Enregistrer la biographie
    </button>
    <p id="bio-msg" class="text-sm mt-2"></p>
    </form>
    <p id="bio-msg" class="text-sm mt-2"></p>
</form>

<form id="avatar-form" class="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
  <h3 class="text-lg font-semibold mb-4">Ma photo de profil</h3>

  <img 
    id="avatar-preview"
    src="${user.photoURL || '/static/images/ranks/rank.png'}" 
    alt="Avatar actuel"
    class="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-white/20"
  >

  <label class="block">
    <span class="font-semibold">Changer la photo (.jpg, .png)</span>
    <input 
      type="file" 
      id="avatar-input" 
      accept="image/png, image/jpeg" 
      class="mt-1 w-full text-sm" 
      required
    >
  </label>

  <button type="submit" class="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-semibold">
    Mettre à jour la photo
  </button>
  <p id="avatar-msg" class="text-sm mt-2"></p>
</form>

  </div>

  <style>
    /* Petite astuce CSS pour un beau toggle */
    .toggle-checkbox:checked {
      right: 0;
      border-color: #ec4899; /* pink-500 */
    }
    .toggle-checkbox:checked + .toggle-label {
      background-color: #ec4899; /* pink-500 */
    }
  </style>
`;