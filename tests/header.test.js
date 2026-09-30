import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'

const LINKS = [
  ['#destinos', 'Destinos'],
  ['#duvidas', 'Dúvidas'],
  ['#contato', 'Contato'],
  ['#blog', 'Pega essa dica'],
]

describe('cabeçalho', () => {
  const doc = loadIndex()

  it('tem logo com alt', () => {
    expect(doc.querySelector('header[data-header] img[alt="Viação Juina"]')).not.toBeNull()
  })

  it('tem os 4 links no menu desktop e no mobile', () => {
    for (const nav of doc.querySelectorAll('header nav')) {
      const links = [...nav.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.textContent.trim()])
      expect(links).toEqual(LINKS)
    }
    expect(doc.querySelectorAll('header nav')).toHaveLength(2)
  })

  it('botão do menu controla a gaveta, que começa fechada', () => {
    const button = doc.querySelector('[data-menu-button]')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    const drawer = doc.getElementById(button.getAttribute('aria-controls'))
    expect(drawer).not.toBeNull()
    expect(drawer.hasAttribute('data-menu-drawer')).toBe(true)
    expect(drawer.hidden).toBe(true)
  })
})
