/* frontend/static/js/ui/pages/profile/settings.js */
import { api } from '../../../core/api.js';

export function mount(user) {
    // 1. Toggle Public/Privé
    const toggle = document.getElementById('public-profile-toggle');
    const msg = document.getElementById('settings-msg');
    
    if (toggle) {
        toggle.checked = user.isPublic || false;
        toggle.addEventListener('change', async () => {
            const isChecked = toggle.checked;
            try {
                msg.textContent = 'Sauvegarde...'; msg.className = 'text-gray-500 text-xs mt-2';
                await api('/profile', { isPublic: isChecked });
                msg.textContent = 'Enregistré.'; msg.className = 'text-green-400 text-xs mt-2';
            } catch (e) {
                toggle.checked = !isChecked;
                msg.textContent = 'Erreur.'; msg.className = 'text-red-400 text-xs mt-2';
            }
        });
    }

    // 2. Helper générique pour les formulaires simples
    const setupForm = (id, field, successMsg) => {
        const form = document.getElementById(id);
        if(!form) return;
        const feedback = form.querySelector('.status-msg');
        
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const val = form.querySelector('input, textarea').value;
            
            // Petit feedback visuel sur le bouton
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = '...';
            btn.disabled = true;

            try {
                const payload = {}; payload[field] = val;
                await api('/profile', payload, 'POST');
                
                // Mise à jour locale du nom si c'est le pseudo (pour la navbar)
                if (field === 'displayName') {
                    localStorage.setItem('displayName', val);
                    // On pourrait forcer un rafraichissement de la nav ici si on voulait
                }

                feedback.textContent = successMsg; 
                feedback.className = 'status-msg text-green-400 text-xs mt-2';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 500);

            } catch {
                feedback.textContent = 'Erreur.'; 
                feedback.className = 'status-msg text-red-400 text-xs mt-2';
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    };

    // 3. Initialisation des formulaires
    setupForm('pseudo-form', 'displayName', 'Pseudo modifié avec succès.');
    setupForm('insta-form', 'instagram', 'Instagram mis à jour.');
    setupForm('bio-form', 'bio', 'Biographie mise à jour.');

    // 4. Gestion Avatar
    const avatarForm = document.getElementById('avatar-form');
    if (avatarForm) {
        const input = document.getElementById('avatar-input');
        const feedback = document.getElementById('avatar-msg');
        const preview = document.getElementById('avatar-preview');

        input.addEventListener('change', () => { if(input.files[0]) preview.src = URL.createObjectURL(input.files[0]); });

        avatarForm.addEventListener('submit', async e => {
            e.preventDefault();
            if (!input.files[0]) return;
            const fd = new FormData(); fd.append('file', input.files[0]);
            feedback.textContent = 'Upload...';
            try {
                const res = await fetch('/api/upload_avatar', { method: 'POST', headers: { 'Authorization': localStorage.getItem('token')||'' }, body: fd });
                if (!res.ok) throw new Error();
                const d = await res.json();
                preview.src = d.photoURL;
                feedback.textContent = 'Avatar mis à jour.'; feedback.className = 'text-green-400 text-xs mt-2';
                window.dispatchEvent(new PopStateEvent('popstate'));
            } catch {
                feedback.textContent = 'Erreur upload.'; feedback.className = 'text-red-400 text-xs mt-2';
            }
        });
    }
}

export default user => `
  <div class="liquid-glass-card rounded-2xl p-8 space-y-8 animate-spring-in"
       data-tilt data-tilt-glare data-tilt-max-glare="0.05" data-tilt-scale="1.01">

    <!-- 1. PSEUDO (Identité) -->
    <form id="pseudo-form">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-blue-400">👤</span> Identité
        </h3>
        <div class="flex gap-4">
            <input name="displayName" type="text" placeholder="Votre Pseudo" value="${user.displayName || ''}"
                class="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-blue-500 w-full font-bold" />
            <button class="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">Sauver</button>
        </div>
        <p class="status-msg text-xs mt-2 h-4"></p>
    </form>

    <hr class="border-white/10" />

    <!-- 2. Public/Privé -->
    <section>
        <h3 class="text-lg font-bold text-white mb-4">Confidentialité</h3>
        <div class="bg-white/5 p-5 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
                <p class="font-bold text-gray-200">Profil Public</p>
                <p class="text-xs text-gray-500 mt-1">Rend vos stats visibles dans la recherche et pour vos amis.</p>
            </div>
            <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="public-profile-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-900 appearance-none cursor-pointer transition-all duration-300"/>
                <label for="public-profile-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer border border-white/10"></label>
            </div>
        </div>
        <p id="settings-msg" class="text-xs mt-2 h-4"></p>
    </section>

    <hr class="border-white/10" />

    <!-- 3. Instagram -->
    <form id="insta-form">
        <h3 class="text-lg font-bold text-white mb-4">Social</h3>
        <div class="flex gap-4">
            <input name="instagram" type="text" placeholder="Pseudo Instagram (sans @)" value="${user.instagram || ''}"
                class="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500 w-full" />
            <button class="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">Sauver</button>
        </div>
        <p class="status-msg text-xs mt-2 h-4"></p>
    </form>

    <hr class="border-white/10" />

    <!-- 4. Bio -->
    <form id="bio-form">
      <h3 class="text-lg font-bold text-white mb-4">Biographie</h3>
      <textarea id="bio-textarea" rows="3"
        class="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white focus:ring-pink-500"
        placeholder="Votre parcours, vos objectifs..."
      >${user.bio || ''}</textarea>
      <div class="flex justify-end mt-3">
          <button type="submit" class="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">Sauver</button>
      </div>
      <p class="status-msg text-xs mt-2 h-4"></p>
    </form>

    <hr class="border-white/10" />

    <!-- 5. Avatar -->
    <form id="avatar-form">
      <h3 class="text-lg font-bold text-white mb-4">Avatar</h3>
      <div class="flex items-center gap-6">
          <img id="avatar-preview" src="${user.photoURL || '/static/images/ranks/rank.png'}" class="w-20 h-20 rounded-full object-cover ring-2 ring-white/20 bg-black/50">
          <div class="flex-1">
              <label class="block">
                <input type="file" id="avatar-input" accept="image/png, image/jpeg" 
                  class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer">
              </label>
              <button type="submit" class="mt-3 px-4 py-1.5 rounded text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors">Uploader</button>
              <p id="avatar-msg" class="text-xs mt-2 h-4"></p>
          </div>
      </div>
    </form>

  </div>

  <style>
    .toggle-checkbox:checked { right: 0; border-color: #db2777; }
    .toggle-checkbox:checked + .toggle-label { background-color: #db2777; }
  </style>
`;