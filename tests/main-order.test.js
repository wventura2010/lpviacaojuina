import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fromRoot } from './load-html.js'

describe('main.js', () => {
  it('ativa o menu antes de renderizar os cards (erro na renderização não mata o menu)', () => {
    const src = readFileSync(fromRoot('src', 'main.js'), 'utf8')
    expect(src.indexOf('initMenu(')).toBeGreaterThan(-1)
    expect(src.indexOf('initMenu(')).toBeLessThan(src.indexOf('renderList('))
  })
})
