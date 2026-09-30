import { describe, it, expect } from 'vitest'
import { assertPublicSiteUrl } from '../site-url.js'

describe('URL pública do site (Open Graph / JSON-LD)', () => {
  it('aceita um domínio https', () => {
    expect(() => assertPublicSiteUrl('https://viacaojuina.com.br')).not.toThrow()
  })

  it('recusa valor ausente', () => {
    expect(() => assertPublicSiteUrl(undefined)).toThrow(/VITE_SITE_URL/)
    expect(() => assertPublicSiteUrl('')).toThrow(/VITE_SITE_URL/)
  })

  it('recusa localhost e 127.0.0.1', () => {
    expect(() => assertPublicSiteUrl('http://localhost:4173')).toThrow(/localhost/)
    expect(() => assertPublicSiteUrl('http://127.0.0.1:4173')).toThrow(/localhost/)
  })

  it('recusa barra no final (geraria // nas URLs)', () => {
    expect(() => assertPublicSiteUrl('https://viacaojuina.com.br/')).toThrow(/barra/)
  })
})
