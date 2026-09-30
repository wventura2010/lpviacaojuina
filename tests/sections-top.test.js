import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'
import { whatsappUrl } from '../src/whatsapp.js'

describe('hero, destinos e diferenciais', () => {
  const doc = loadIndex()

  it('tem um único h1 com o título do briefing', () => {
    const h1s = doc.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent.trim()).toBe('Viaje mais, pague menos.')
    expect(doc.querySelector('#inicio').textContent).toContain(
      'Encontre passagens de ônibus para os destinos que você ama, com praticidade e economia.'
    )
  })

  it('imagem do hero é prioritária e decorativa', () => {
    const img = doc.querySelector('#inicio img')
    expect(img.getAttribute('src')).toBe('/img/hero-onibus.webp')
    expect(img.getAttribute('fetchpriority')).toBe('high')
    expect(img.getAttribute('alt')).toBe('')
  })

  it('botão "Ver destinos" leva à seção', () => {
    const link = [...doc.querySelectorAll('#inicio a')].find((a) => a.textContent.includes('Ver destinos'))
    expect(link.getAttribute('href')).toBe('#destinos')
  })

  it('links estáticos de WhatsApp funcionam sem JS', () => {
    const links = doc.querySelectorAll('a[data-whatsapp]')
    expect(links.length).toBeGreaterThanOrEqual(1)
    for (const a of links) {
      expect(a.getAttribute('href')).toBe(whatsappUrl())
      expect(a.getAttribute('target')).toBe('_blank')
      expect(a.getAttribute('rel')).toBe('noopener')
      const accessibleName = a.getAttribute('aria-label') ?? a.textContent
      expect(accessibleName).toContain('abre em nova janela')
    }
  })

  it('tem os containers de destinos e diferenciais', () => {
    expect(doc.querySelector('section#destinos [data-destinos]')).not.toBeNull()
    expect(doc.querySelector('section#destinos h2').textContent).toBe('Principais destinos da Viação Juina')
    expect(doc.querySelector('section#diferenciais [data-diferenciais]')).not.toBeNull()
    expect(doc.querySelector('section#diferenciais h2').textContent).toBe('Diferenciais Viação Juina')
    expect(doc.querySelector('section#diferenciais').textContent).toContain('Promocional')
  })

  it('seções com âncora compensam o cabeçalho fixo', () => {
    expect(doc.querySelector('#destinos').classList.contains('scroll-mt-20')).toBe(true)
  })
})
