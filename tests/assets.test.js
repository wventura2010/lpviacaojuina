import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { destinos, diferenciais } from '../src/data.js'
import { loadIndex, fromRoot } from './load-html.js'

const inPublic = (path) => existsSync(fromRoot('public', path.replace(/^\//, '')))

describe('imagens', () => {
  it('toda imagem dos dados existe em public/', () => {
    for (const { imagem } of [...destinos, ...diferenciais]) expect(inPublic(imagem), imagem).toBe(true)
  })

  it('toda imagem e ícone referenciados no index.html existem em public/', () => {
    const doc = loadIndex()
    const refs = [
      ...[...doc.querySelectorAll('img')].map((i) => i.getAttribute('src')),
      ...[...doc.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) => l.getAttribute('href')),
    ]
    expect(refs.length).toBeGreaterThan(0)
    for (const ref of refs) expect(inPublic(ref), ref).toBe(true)
  })

  it('créditos das fotos estão registrados', () => {
    expect(existsSync(fromRoot('assets-src', 'CREDITOS.md'))).toBe(true)
  })
})
