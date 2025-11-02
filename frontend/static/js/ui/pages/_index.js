import home, { mount as mountHome } from './home.js'
import register     from './register.js'
import leaderboard  from './leaderboard.js'
import loginPage, { setupLogin } from './login.js'

export const pages = {
  // MODIFIÉ : '/' est maintenant une fonction qui appelle 'mountHome'
  '/': () => {
    const html = home()
    requestAnimationFrame(mountHome) // On appelle la logique JS après le rendu
    return html
  },

  /* wrapper qui rend ET branche le JS */
  '/login': () => {
    const html = loginPage()
    requestAnimationFrame(setupLogin)
    return html
  },

  '/register':  register,
  '/leaderboard': leaderboard,
  // les /profile/* sont gérés dans router.js
  // les /user/* sont gérés dans router.js
}
