import './input.css'
import { initMenu, initHeaderShadow } from './menu.js'

initMenu(document.querySelector('[data-menu-button]'), document.querySelector('[data-menu-drawer]'))
initHeaderShadow(document.querySelector('[data-header]'))
