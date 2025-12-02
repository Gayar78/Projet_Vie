/* frontend/static/js/ui/background.js */
let vantaEffect = null;

// URLs des scripts
const SCRIPTS = {
  THREE: 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js',
  FOG:   'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js'
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Erreur load: ${src}`));
    document.head.appendChild(s);
  });
}

export async function initBackground() {
  const box = document.getElementById('vanta-bg');
  if (!box) return;

  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

  try {
    await loadScript(SCRIPTS.THREE);
    await loadScript(SCRIPTS.FOG);
    
    if (window.VANTA) {
        vantaEffect = VANTA.FOG({
          el: box,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0xec4899, // Rose Néon
          midtoneColor: 0x3b82f6,   // Bleu électrique
          lowlightColor: 0x0f172a,  // Très sombre
          baseColor: 0x020617,      // Noir quasi total
          blurFactor: 0.6,
          speed: 1.2,
          zoom: 0.8
        });
    }
  } catch (error) {
    console.error("Erreur Vanta:", error);
  }
}