import { describe, it, expect } from 'vitest'
import { whatsappUrl, routeMessage, DEFAULT_MESSAGE, WHATSAPP_NUMBER } from '../src/whatsapp.js'

describe('whatsapp', () => {
  it('usa o número da empresa', () => {
    expect(WHATSAPP_NUMBER).toBe('5565999662141')
  })

  it('gera a URL com a mensagem padrão', () => {
    expect(whatsappUrl()).toBe(
      'https://wa.me/5565999662141?text=Ol%C3%A1!%20Quero%20comprar%20uma%20passagem.'
    )
    expect(DEFAULT_MESSAGE).toBe('Olá! Quero comprar uma passagem.')
  })

  it('monta a mensagem de rota', () => {
    expect(routeMessage('Cuiabá', 'Tangará da Serra')).toBe(
      'Olá! Quero comprar passagem de Cuiabá para Tangará da Serra.'
    )
  })

  it('codifica acentos e espaços e o texto volta intacto', () => {
    const url = whatsappUrl(routeMessage('Cuiabá', 'Tangará da Serra'))
    expect(url).not.toMatch(/[ áã]/)
    const text = new URL(url).searchParams.get('text')
    expect(text).toBe('Olá! Quero comprar passagem de Cuiabá para Tangará da Serra.')
  })

  it('codifica caracteres reservados como & e ?', () => {
    const text = new URL(whatsappUrl('A & B?')).searchParams.get('text')
    expect(text).toBe('A & B?')
  })
})
