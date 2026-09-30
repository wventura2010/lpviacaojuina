import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'
import { whatsappUrl } from '../src/whatsapp.js'

describe('dúvidas, blog, rodapé e CTA', () => {
  const doc = loadIndex()

  it('dúvidas são 6 <details> nativos (funcionam sem JS)', () => {
    const items = doc.querySelectorAll('section#duvidas details')
    expect(items).toHaveLength(6)
    for (const d of items) expect(d.querySelector('summary').textContent.trim()).not.toBe('')
    expect(items[0].querySelector('summary').firstChild.textContent.trim()).toBe('Como compro minha passagem?')
    expect(items[0].querySelector('a[data-whatsapp]')).not.toBeNull()
  })

  it('blog tem 3 cards "Em breve" sem links', () => {
    const cards = doc.querySelectorAll('section#blog article')
    expect(cards).toHaveLength(3)
    for (const c of cards) {
      expect(c.textContent).toContain('Em breve')
      expect(c.querySelector('a')).toBeNull()
    }
  })

  it('rodapé tem endereço, mapa, telefone e WhatsApp', () => {
    const footer = doc.querySelector('footer#contato')
    expect(footer.textContent).toContain('Av. Miguel Sutil, 7034 – Despraiado, Cuiabá-MT, 78040-000')
    expect(footer.querySelector('a[href^="https://www.google.com/maps/search/"]')).not.toBeNull()
    const tel = footer.querySelector('a[href="tel:+556533162900"]')
    // espaço e hífen não separáveis: o número não quebra em duas linhas
    expect(tel.textContent).toBe('(65) 3316‑2900')
    expect(footer.querySelector('a[data-whatsapp]')).not.toBeNull()
    expect(footer.textContent).toContain('© 2026 Viação Juina Cuiabá')
  })

  it('rodapé reserva espaço para o botão flutuante não cobrir o conteúdo', () => {
    expect(doc.querySelector('footer#contato').classList.contains('pb-28')).toBe(true)
  })

  it('CTA flutuante é fixo, acessível e aponta para o WhatsApp', () => {
    const cta = doc.querySelector('a[data-cta-flutuante]')
    expect(cta.getAttribute('href')).toBe(whatsappUrl())
    expect(cta.hasAttribute('data-whatsapp')).toBe(true)
    expect(cta.classList.contains('fixed')).toBe(true)
    expect(cta.getAttribute('aria-label')).toBe('Compre pelo WhatsApp (abre em nova janela)')
    expect(cta.classList.contains('text-juina-navy')).toBe(true)
  })
})
