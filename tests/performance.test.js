import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { loadIndex, fromRoot } from './load-html.js'

describe('desempenho e rastreamento', () => {
  const doc = loadIndex()

  it('hero oferece versões menores para o celular via srcset', () => {
    const img = doc.querySelector('#inicio img')
    const candidates = img.getAttribute('srcset').split(',').map((c) => c.trim().split(/\s+/))
    expect(candidates.map(([, w]) => w)).toEqual(['768w', '1280w', '1920w'])
    expect(img.getAttribute('sizes')).toBe('100vw')
    for (const [url] of candidates) expect(existsSync(fromRoot('public', url.replace(/^\//, ''))), url).toBe(true)
  })

  it('logos têm largura e altura para não deslocar o layout', () => {
    for (const img of doc.querySelectorAll('img[alt="Viação Juina"]')) {
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0)
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0)
    }
  })

  it('tem robots.txt liberando o site', () => {
    const path = fromRoot('public', 'robots.txt')
    expect(existsSync(path)).toBe(true)
    expect(readFileSync(path, 'utf8')).toMatch(/User-agent: \*\s+Allow: \//)
  })
})
