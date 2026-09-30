import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'

describe('index.html', () => {
  it('declara idioma pt-BR e carrega main.js como módulo', () => {
    const doc = loadIndex()
    expect(doc.documentElement.lang).toBe('pt-BR')
    expect(doc.querySelector('script[type="module"][src="/src/main.js"]')).not.toBeNull()
  })
})
