import { mountNavAtStartup } from './ui/nav.js'
import { initRouter }        from './core/router.js'

mountNavAtStartup()  // injecte la barre + état Log In / Log Out
initRouter()         // démarre le router SPA

