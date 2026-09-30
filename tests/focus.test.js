import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fromRoot } from './load-html.js'

describe('foco visível', () => {
  const css = readFileSync(fromRoot('src', 'input.css'), 'utf8')
  const rule = css.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? ''

  it('contorno azul-marinho (contraste ≥ 3:1 sobre fundos claros)', () => {
    expect(rule).toMatch(/outline:\s*3px solid var\(--color-juina-navy\)/)
  })

  it('anel branco junto ao contorno para aparecer também sobre fundos azul-marinho', () => {
    expect(rule).toMatch(/box-shadow:\s*0 0 0 \d+px #fff/)
  })
})
