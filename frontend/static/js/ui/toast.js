/* frontend/static/js/ui/toast.js */

// Crée le conteneur au chargement
let container;
function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    } else {
        container = document.querySelector('.toast-container');
    }
}

export function showToast(message, type = 'info') {
    initToastContainer();

    // Configuration des couleurs/icônes
    const types = {
        success: { color: 'text-green-400', icon: '✓', border: 'border-green-500/30' },
        error:   { color: 'text-red-400',   icon: '✕', border: 'border-red-500/30' },
        info:    { color: 'text-blue-400',  icon: 'ℹ', border: 'border-blue-500/30' }
    };
    const style = types[type] || types.info;

    // Création du Toast HTML
    const el = document.createElement('div');
    el.className = `toast ${style.border}`;
    el.innerHTML = `
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${style.color} font-bold">
            ${style.icon}
        </div>
        <p class="text-sm font-medium text-gray-100">${message}</p>
    `;

    container.appendChild(el);

    // Suppression automatique
    setTimeout(() => {
        el.classList.add('hiding');
        el.addEventListener('transitionend', () => el.remove());
    }, 3000);
}