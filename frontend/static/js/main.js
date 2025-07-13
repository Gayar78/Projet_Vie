import { mountNavAtStartup } from './ui/nav.js'
import { initBackground }    from './ui/background.js'
import { initRouter }        from './core/router.js'

mountNavAtStartup()  // injecte la barre + état Log In / Log Out
initBackground()     // crée l’unique instance Vanta
initRouter()         // démarre le router SPA

