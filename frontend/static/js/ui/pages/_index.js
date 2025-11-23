/* frontend/static/js/ui/pages/_index.js */
import home, { mount as mountHome } from './home.js'
import register     from './register.js'
import leaderboard  from './leaderboard.js'
import loginPage, { setupLogin } from './login.js'
import standardsPage from './standards.js'
import marketPage from './market.js' // AJOUT IMPORT

export const pages = {
  '/': () => {
    const html = home()
    requestAnimationFrame(mountHome)
    return html
  },
  '/login': () => {
    const html = loginPage()
    requestAnimationFrame(setupLogin)
    return html
  },
  '/register':  register,
  '/leaderboard': leaderboard,
  '/standards': standardsPage,
  '/market': marketPage,
}