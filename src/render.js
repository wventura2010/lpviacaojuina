import { whatsappUrl, routeMessage } from './whatsapp.js'

const PIN_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-juina-orange-dark" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function decorativeImage(src, className) {
  const img = el('img', className)
  img.src = src
  img.alt = ''
  img.setAttribute('loading', 'lazy')
  img.setAttribute('decoding', 'async')
  return img
}

export function destinoCard({ origem, destino, imagem }) {
  const card = el(
    'a',
    'group block w-4/5 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-2/5 md:w-auto'
  )
  card.href = whatsappUrl(routeMessage(origem, destino))
  card.target = '_blank'
  card.rel = 'noopener'
  card.setAttribute('aria-label', `Comprar passagem de ${origem} para ${destino} pelo WhatsApp (abre em nova janela)`)

  const body = el('div', 'p-4')

  const origemLine = el('p', 'flex items-center gap-2 text-sm text-slate-500')
  origemLine.append(el('span', 'h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-500'), el('span', '', origem))
  origemLine.dataset.origem = ''

  const connector = el('span', 'ml-[6px] block h-3 w-0.5 bg-slate-400')

  const destinoLine = el('p', 'flex items-center gap-2 font-bold text-slate-900')
  destinoLine.insertAdjacentHTML('afterbegin', PIN_ICON)
  const destinoText = el('span', 'truncate', destino)
  destinoText.title = destino
  destinoText.dataset.destino = ''
  destinoLine.append(destinoText)

  body.append(origemLine, connector, destinoLine)
  card.append(decorativeImage(imagem, 'aspect-[4/3] w-full object-cover'), body)
  return card
}

export function diferencialCard({ linha1, linha2, imagem }) {
  const card = el('article', 'overflow-hidden rounded-xl bg-juina-navy shadow-md')
  const title = el('h3', 'px-6 py-5 text-center text-xl font-bold leading-tight sm:text-2xl')
  title.append(el('span', 'block text-white', linha1), el('span', 'block text-juina-orange', linha2))
  card.append(decorativeImage(imagem, 'aspect-[4/3] w-full object-cover'), title)
  return card
}

export function renderList(container, items, factory) {
  container.replaceChildren(...items.map(factory))
}
