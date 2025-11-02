/* Background Vanta.HALO — Global, clair, et liquide */
let vanta;

// Helper pour charger les scripts
function loadScript(src) {
  return new Promise((ok, fail) => {
    // Ne pas re-charger un script s'il est déjà là
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = Object.assign(document.createElement('script'), { src });
    s.onload = ok;
    s.onerror = () => fail(new Error(`Erreur de chargement du script: ${src}`));
    document.head.appendChild(s);
  });
}

export async function initBackground() {
  /* Cible le conteneur global créé dans index.html */
  const box = document.getElementById('vanta-bg');
  if (!box) {
    console.log("Conteneur #vanta-bg non trouvé, le fond ne sera pas lancé.");
    return;
  }

  /* Détruit l'instance précédente si on re-rend la page (navigation SPA) */
  vanta?.destroy?.();

  try {
    /* Charge Three.js puis Vanta.HALO */
    await loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.halo.min.js');
  
    if (window.VANTA) {
      vanta = VANTA.HALO({
        el: box,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        
        // --- Configuration du style "Futuriste / Liquide Clair" ---
        
        // Couleurs dominantes: blanc et bleu ciel
        backgroundColor: 0xf0f4f8, // Fond (le même que le bg-gray-100)
        baseColor: 0xadd8e6,       // Bleu ciel
        highlightColor: 0xffffff,  // Reflets blancs
        
        // Ajustements pour un look "liquide" et doux
        amplitudeFactor: 2.00,
        size: 1.50, // Un peu plus dézoomé
        xOffset: 0.20,
        yOffset: 0.10
      });
    } else {
      console.error('Erreur: Objet VANTA introuvable après chargement.');
    }
  } catch (error) {
    console.error(error);
  }
}
