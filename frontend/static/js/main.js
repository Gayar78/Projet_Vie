/******************************************************************
 *  SPA ProjetVie  —  main.js
 *  Tailwind CSS uniquement  ·  Proxy “/api” -> FastAPI backend
 ******************************************************************/

/* ======== Helper API (proxy via /api) ========================= */
async function api (path, body = null, method = 'POST') {
  const r = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: localStorage.getItem('token') || ''
    },
    body: body ? JSON.stringify(body) : null
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

/* ======== Nav dynamique ====================================== */
function updateNav () {
  const nav = document.getElementById('nav-right')
  if (!nav) return
  const logged = !!localStorage.getItem('token')
  nav.innerHTML = logged
    ? `<a href="/profile" data-link class="hover:text-pink-400">Profile</a>
       <a href="/" id="logout" class="hover:text-pink-400">Logout</a>`
    : `<a href="/login" data-link class="hover:text-pink-400">Login</a>
       <a href="/register" data-link
          class="px-4 py-1 rounded-full bg-pink-500 hover:bg-pink-600">Sign Up</a>`
}

/* ======== Composant sidebar profile ========================== */
const sideBar = (active) => `
<nav class="w-56 flex-shrink-0 bg-white/5 rounded-2xl border border-white/10
            backdrop-blur-md p-6 space-y-6">
  <div class="text-center">
    <div class="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center
                justify-center text-3xl">🏋️‍♂️</div>
    <p class="mt-4 font-semibold">Athlete</p>
    <a href="/leaderboard" data-link
       class="text-sm bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text
              text-transparent font-semibold">View Leaderboard</a>
  </div>

  <ul class="space-y-2 text-sm">
  ${[
    ['dashboard',        'Dashboard',         '📊'],
    ['contrib',          'My Contributions',  '🎁'],
    ['activity',         'My Activity',       '⚡'],
    ['refer',            'Refer a Friend',    '🎉'],
    ['settings',         'Settings',          '⚙️']
  ].map(([k,l,ico])=>`
    <li>
      <a href="/profile/${k}" data-link
         class="flex items-center gap-3 py-2 px-3 rounded-lg
                ${active===k?'bg-pink-500/20 text-white':'hover:bg-white/10'}">
        <span>${ico}</span><span>${l}</span>
      </a>
    </li>`).join('')}
  </ul>
</nav>`

/* ======== Templates pages profile ============================ */
const profilePages = {
  dashboard: u => `
    <h2 class="text-2xl font-bold mb-6">Welcome,
        <span class="bg-gradient-to-r from-pink-500 to-purple-500
                    bg-clip-text text-transparent">
        ${u.username || 'Athlete'}
        </span></h2>

    <div class="grid lg:grid-cols-3 gap-6 mb-10">
        <div class="col-span-1 lg:col-span-2">
        <div class="grid sm:grid-cols-3 gap-6">

            <div class="sm:col-span-2 p-6 rounded-2xl bg-gradient-to-r
                        from-pink-500 to-purple-600 text-3xl font-extrabold">
            <p class="text-sm mb-1 opacity-80">Total Points</p>
            ${u.points ?? 0}&nbsp;pts
            </div>

            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p class="text-sm opacity-60 mb-1">Global Rank</p>
            <span id="global-rank" class="text-3xl font-bold">-</span>
            </div>

            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p class="text-sm opacity-60 mb-1">Contributions</p>
            <span class="text-3xl font-bold">${u.contrib ?? 0}</span>
            </div>

        </div>
        </div>

        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 class="font-semibold mb-2">Claim Your Rewards</h3>
        <p class="text-sm opacity-60 mb-4">Link your wallet in Settings.</p>
        <button disabled
            class="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500
                to-purple-600 opacity-40 cursor-not-allowed">
            Claim Rewards
        </button>
        </div>
    </div>

    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 class="font-semibold mb-4">Earnings History</h3>
        <p class="text-center py-14 text-gray-400">No earnings data yet.</p>
    </div>`,


  contrib   : () => `
    <h2 class="text-2xl font-bold mb-6">My Contributions</h2>
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      ${['Variety is power 💪','Consistency is rewarded 🏅','Share knowledge 📚']
        .map(t=>`<div class="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm">${t}</div>`).join('')}
    </div>
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 class="font-semibold mb-4">History</h3>
      <p class="text-center py-14 text-gray-400">
        No contributions yet.<br>
        <a href="#" class="text-cyan-400 underline">Learn how to contribute</a>
      </p>
    </div>`,

  activity  : () => `
    <h2 class="text-2xl font-bold mb-6">My Activity</h2>
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p class="text-center py-14 text-gray-400">
        No activity yet.<br>
        <a href="#" class="text-cyan-400 underline">Start your first workout</a>
      </p>
    </div>`,

  refer     : () => `
    <div class="flex flex-col items-center text-center p-10 rounded-2xl
                bg-white/5 border border-white/10 w-full">
      <h2 class="text-3xl font-extrabold mb-4 leading-tight">
        Grow the Community.<br>
        <span class="bg-gradient-to-r from-purple-500 to-cyan-400
                     bg-clip-text text-transparent">Grow Your Gains.</span>
      </h2>
      <p class="text-gray-400 max-w-md mb-6">
        Referral program coming soon – invite friends and earn a share
        of their points forever!
      </p>
      <button disabled
        class="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500
               to-purple-600 opacity-40 cursor-not-allowed">
        Notify&nbsp;Me&nbsp;When&nbsp;Ready
      </button>
    </div>`,

  settings  : u => `
    <h2 class="text-2xl font-bold mb-6">Settings</h2>
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h3 class="font-semibold">Profile Information</h3>
        <div>
          <label class="block text-sm mb-1">Display Name</label>
          <input value="${u.username||''}" name="username"
                 class="w-full px-3 py-2 rounded-lg bg-gray-800">
        </div>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" class="accent-pink-500" checked>
          Show my rank publicly
        </label>
        <button id="save-username"
        class="w-full py-2 rounded-lg bg-gradient-to-r
               from-pink-500 to-purple-600 hover:opacity-90">
            Save Changes
        </button>

      </div>

      <div class="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <h3 class="font-semibold mb-2">Linked Accounts</h3>
        <div id="link-instagram"  class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2"></div>
        <div id="link-meta"       class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2"></div>
        <div id="link-youtube"    class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2"></div>
    </div>


      <div class="lg:col-span-2 p-6 rounded-2xl bg-red-900/20 border
                  border-red-500/40 text-center">
        <h3 class="font-semibold mb-4 text-red-400">Danger Zone</h3>
        <button
          class="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>`
}

/* ======== Pages non-profil (home/login/register/leaderboard) == */
const homePage = () => `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
    <div class="text-center">
      <h1 class="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
        Build&nbsp;Your <span class="text-pink-400">Strength</span><br>
        Share&nbsp;Your&nbsp;Journey
      </h1>
      <p class="text-gray-300 mb-10 max-w-xl mx-auto">
        Track workouts, climb the leaderboard, inspire others.
      </p>
      <a href="/register" data-link
         class="px-8 py-3 rounded-full bg-gradient-to-r
                from-pink-500 to-purple-600 hover:opacity-90 font-semibold">
        Get Started
      </a>
    </div>
  </section>`

const loginPage = () => `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Welcome<br>Back.</h1>
        <p class="text-gray-400">Sign in to access your dashboard.</p>
      </div>
      <form id="login-form"
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-6 text-center">Sign In</h2>
        <label class="block mb-2">Email</label>
        <input name="email" type="email" class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800">
        <label class="block mb-2">Password</label>
        <input name="password" type="password" class="w-full mb-6 px-3 py-2 rounded-lg bg-gray-800">
        <button class="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold">Sign In</button>
        <p class="text-center text-sm text-gray-400 mt-4">
          Don’t have an account?
          <a href="/register" data-link class="text-pink-400">Create one</a>
        </p>
      </form>
    </div>
  </section>`

const registerPage = () => `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Create<br>Account.</h1>
        <p class="text-gray-400">Join the community today.</p>
      </div>
      <form id="register-form"
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-6 text-center">Create Account</h2>
        <label class="block mb-2">Email</label>
        <input name="email" type="email" class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800">
        <label class="block mb-2">Password</label>
        <input name="password" type="password" class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800">
        <label class="block mb-2">Confirm</label>
        <input name="confirm" type="password" class="w-full mb-6 px-3 py-2 rounded-lg bg-gray-800">
        <button class="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold">Create Account</button>
      </form>
    </div>
  </section>`

const leaderboardPage = () => `
  <section class="relative min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col items-center
                   text-white bg-[url('/static/images/bg-dark-grid.png')] bg-cover bg-center">

    <h1 class="mt-24 text-5xl md:text-6xl font-extrabold text-center">
      <span class="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Network&nbsp;Hub
      </span>
    </h1>
    <p class="mt-4 mb-12 text-center text-gray-300 max-w-2xl">
      Follow the strongest athletes and latest community feats in real time.
    </p>

    <div class="w-full max-w-6xl grid md:grid-cols-[1fr_340px] gap-10">
      <table class="w-full text-left backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <thead class="uppercase text-xs text-gray-400 tracking-wider">
          <tr class="border-b border-white/10">
            <th class="py-4 pl-6">Rank</th><th>Athlete</th>
            <th class="pr-6 text-right">Points</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body"></tbody>
      </table>

      <div class="relative">
        <div class="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10
                    before:content-[''] before:absolute before:inset-0 before:rounded-2xl
                    before:bg-gradient-to-br before:from-pink-500 before:to-purple-600
                    before:opacity-20 before:-z-10">
          <h3 class="text-lg font-semibold">Recent Activity</h3>
          <div id="activity-feed" class="space-y-2 text-sm text-gray-300"></div>
        </div>
      </div>
    </div>
  </section>`

/* ======== Router map ========================================= */
const routes = {
  '/':              homePage,
  '/login':         loginPage,
  '/register':      registerPage,
  '/leaderboard':   leaderboardPage,
}

/* ======== Render ============================================ */
const app = document.getElementById('app')

async function render (path) {
  if (path.startsWith('/profile')) {
    const tab = path.split('/')[2] || 'dashboard'
    if (!localStorage.getItem('token')) {
      history.replaceState(null, '', '/login')
      return render('/login')
    }
    let user = {}; try { user = await api('/profile', null, 'GET') } catch {}
    app.innerHTML = `
      <section class="min-h-[calc(100vh-160px)] px-6 pb-20 flex flex-col
                      lg:flex-row gap-10">
        ${sideBar(tab)}
        <div class="flex-1">${profilePages[tab](user)}</div>
      </section>`
    updateNav()
    bindForms()
    loadProfile()
    return
  }

  /* -------- pages simples ---------------------------------------- */
  app.innerHTML = (routes[path] || homePage)()
  updateNav()
  bindForms()
  if (path === '/leaderboard') { fetchLeaderboard(); loadActivity() }
}


/* ======== Forms & events ==================================== */

function bindForms () {
  /* ---------- LOGIN ----------------------------------------------- */
  const login = document.getElementById('login-form')
  if (login) login.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password } = Object.fromEntries(new FormData(login))
    try {
      const d = await api('/login', { email, password })
      localStorage.setItem('token', d.idToken)
      history.pushState(null, '', '/profile')
      render('/profile')
    } catch { alert('Login failed') }
  })

  /* ---------- REGISTER -------------------------------------------- */
  const reg = document.getElementById('register-form')
  if (reg) reg.addEventListener('submit', async e => {
    e.preventDefault()
    const { email, password, confirm } = Object.fromEntries(new FormData(reg))
    if (password !== confirm) return alert('Passwords differ')
    try {
      await api('/register', { email, password })
      alert('Account created. Log in!')
      history.pushState(null, '', '/login')
      render('/login')
    } catch { alert('Register failed') }
  })

  /* ---------- PROFILE save (sport, goal, etc.) -------------------- */
  const profile = document.getElementById('profile-form')
  if (profile) profile.addEventListener('submit', async e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(profile))
    try {
      await api('/profile', data, 'POST')
      alert('Profile updated')
    } catch { alert('Update failed') }
  })

  /* ---------- Save Display-Name bouton ---------------------------- */
  const saveName = document.getElementById('save-username')
  if (saveName) saveName.addEventListener('click', async () => {
    const nameInput = document.querySelector('[name="username"]')
    const username  = nameInput.value.trim()
    if (!username) return alert('Enter a name')
    try {
      await api('/profile', { username }, 'POST')
      alert('Name updated!')
      loadProfile()          // rafraîchit le tableau + sidebar
    } catch { alert('Update failed') }
  })

  /* ---------- Boutons “Connect” réseaux sociaux ------------------- */
  document.querySelectorAll('[data-connect]').forEach(btn => {
    btn.addEventListener('click', async e => {
      const provider = e.currentTarget.dataset.connect        // instagram / meta / youtube
      alert(`TODO: OAuth redirect for ${provider}`)

      /* Exemple provisoire : on marque comme connecté côté BD
         (à enlever lorsque l’OAuth réel sera branché) */
      try {
        await api('/profile', { [provider]: true }, 'POST')
        loadProfile()
      } catch {/* silencieux */}
    })
  })
}


/* ======== Loaders =========================================== */
function fetchLeaderboard () {
  api('/leaderboard', null, 'GET').then(list => {
    const tbody = document.getElementById('leaderboard-body')
    tbody.innerHTML = list.map((u, i) => `
      <tr class="group border-b border-white/10 hover:bg-white/5">
        <td class="py-3 pl-6">
          <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                      ${i===0?'bg-yellow-400 text-black':i===1?'bg-gray-300 text-black':
                        i===2?'bg-orange-500':'bg-white/10'}">${i+1}</div>
        </td>
        <td class="font-medium">${u.username||u.email}</td>
        <td class="pr-6 text-right font-semibold text-pink-400">
          ${u.points.toLocaleString()} pts
        </td>
      </tr>`).join('')
  })
}
function loadActivity () {
  const box = document.getElementById('activity-feed')
  if (box)
    box.innerHTML = `
      <p><span class="text-white font-medium">Coach&nbsp;Lucy</span>
         posted a new <span class="text-pink-400 font-semibold">HIIT&nbsp;Plan</span></p>
      <p><span class="text-white font-medium">Gayar</span>
         hit <span class="text-pink-400 font-semibold">+50&nbsp;pts</span> on deadlifts</p>`
}

async function loadProfile () {
  try {
    const [user, board] = await Promise.all([
      api('/profile', null, 'GET'),
      api('/leaderboard', null, 'GET')
    ])

    console.log("DEBUG user.uid", user.uid)
    console.log("DEBUG board uids", board.map(u => u.uid))

    const pos = board.findIndex(u =>
      (user.uid && u.uid === user.uid) ||
      (user.email && u.email === user.email)
    )
    console.log("DEBUG rank pos =", pos)

    const rankEl = document.getElementById('global-rank')
    if (rankEl) rankEl.textContent = pos === -1 ? '-' : '#' + (pos + 1)

    /* … le reste (linked accounts) … */
  } catch (err) {
    console.error("loadProfile error", err)
  }
}



/* ======== Navigation (links) ================================= */
function navigate (e) {
  const link = e.target.closest('[data-link]')
  if (!link) return
  e.preventDefault()
  history.pushState(null, '', link.getAttribute('href'))
  render(location.pathname)
}

/* ======== Global listeners & init =========================== */
document.addEventListener('click', e => {
  if (e.target.id === 'logout') {
    e.preventDefault()
    localStorage.removeItem('token')
    updateNav()
    history.pushState(null, '', '/')
    render('/')
  }
  navigate(e)
})
window.addEventListener('popstate', () => render(location.pathname))
render(location.pathname)
updateNav()
