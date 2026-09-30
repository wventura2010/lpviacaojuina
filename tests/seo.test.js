import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'

describe('SEO', () => {
  const doc = loadIndex()
  const meta = (sel) => doc.querySelector(sel)?.getAttribute('content')

  it('tem título e descrição focados em passagem de ônibus', () => {
    expect(doc.title).toBe('Viação Juina Cuiabá | Passagens de ônibus em Mato Grosso')
    const description = meta('meta[name="description"]')
    expect(description).toContain('Passagens de ônibus')
    expect(description.length).toBeLessThanOrEqual(160)
  })

  it('tem Open Graph completo', () => {
    expect(meta('meta[property="og:type"]')).toBe('website')
    expect(meta('meta[property="og:locale"]')).toBe('pt_BR')
    expect(meta('meta[property="og:title"]')).toBeTruthy()
    expect(meta('meta[property="og:description"]')).toBeTruthy()
    expect(meta('meta[property="og:url"]')).toBe('%VITE_SITE_URL%/')
    expect(meta('meta[property="og:image"]')).toBe('%VITE_SITE_URL%/img/og.jpg')
  })

  it('tem favicon e cor do tema', () => {
    expect(doc.querySelector('link[rel="icon"]').getAttribute('href')).toBe('/img/favicon-32.png')
    expect(doc.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')).toBe('/img/apple-touch-icon.png')
    expect(meta('meta[name="theme-color"]')).toBe('#1b2a6b')
  })

  it('tem JSON-LD TravelAgency com endereço e telefone', () => {
    const raw = doc.querySelector('script[type="application/ld+json"]').textContent
    const data = JSON.parse(raw.replaceAll('%VITE_SITE_URL%', 'https://exemplo.com.br'))
    expect(data['@type']).toBe('TravelAgency')
    expect(data.name).toBe('Viação Juina Cuiabá')
    expect(data.telephone).toBe('+55-65-3316-2900')
    expect(data.address).toMatchObject({
      streetAddress: 'Av. Miguel Sutil, 7034 - Despraiado',
      addressLocality: 'Cuiabá',
      addressRegion: 'MT',
      postalCode: '78040-000',
      addressCountry: 'BR',
    })
  })
})
