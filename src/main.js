import './input.css'
import { destinos, diferenciais } from './data.js'
import { destinoCard, diferencialCard, renderList } from './render.js'
import { initMenu, initHeaderShadow } from './menu.js'

renderList(document.querySelector('[data-destinos]'), destinos, destinoCard)
renderList(document.querySelector('[data-diferenciais]'), diferenciais, diferencialCard)
initMenu(document.querySelector('[data-menu-button]'), document.querySelector('[data-menu-drawer]'))
initHeaderShadow(document.querySelector('[data-header]'))
