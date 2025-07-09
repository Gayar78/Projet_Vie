/* pages/_index.js ---------------------------------------------------- */
import home         from './home.js'
import register     from './register.js'
import leaderboard  from './leaderboard.js'

import loginPage, { setupLogin } from './login.js'   // <- UNE seule import

export const pages = {
  '/':          home,

  /* wrapper qui rend ET branche le JS */
  '/login': () => {
    const html = loginPage()          // ① on génère le markup
    // ② on attend le prochain “tick” pour que #login-form existe
    requestAnimationFrame(setupLogin)
    return html
  },

  '/register':   register,
  '/leaderboard': leaderboard,
  // les /profile/* sont gérés dans router.js
}
