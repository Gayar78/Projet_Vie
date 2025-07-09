/* Background Vanta.NET — limité au bloc Hero */
let vanta, colorLoopId

function loadScript (src) {
  return new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok()
    const s = Object.assign(document.createElement('script'), { src })
    s.onload = ok
    s.onerror = () => fail(new Error('⨂ ' + src))
    document.head.appendChild(s)
  })
}

export async function initBackground () {
  /* ne relance pas si #hero-bg absent */
  const box = document.getElementById('hero-bg')
  if (!box) return

  /* détruit l’instance précédente si on re-rend la page */
  vanta?.destroy?.()
  cancelAnimationFrame(colorLoopId)

  /* charge Three puis Vanta (jsDelivr = fiable) */
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js')

  if (!window.VANTA) { console.error('VANTA introuvable'); return }

  vanta = VANTA.NET({
    el: box,
    backgroundColor: 0x0b0614,
    color: 0x1565ff,
    points: 10,
    maxDistance: 25,
    spacing: 18,
    mouseControls: false,
    gyroControls: false
  })

  /* cycle bleu ↔ rouge */
  const BLUE = 0x1565ff, RED = 0xff2640
  const lerp = (a,b,t)=>Math.round(a+(b-a)*t)
  const lerpHex = (c1,c2,t)=>((lerp((c1>>16)&255,(c2>>16)&255,t)<<16)|
                               (lerp((c1>>8)&255 ,(c2>>8)&255 ,t)<<8) |
                                lerp(c1&255,c2&255,t))
  const loop = t => {
    vanta.setOptions({ color: lerpHex(BLUE, RED, (Math.sin(t/4000)+1)/2) })
    colorLoopId = requestAnimationFrame(loop)
  }
  colorLoopId = requestAnimationFrame(loop)
}

