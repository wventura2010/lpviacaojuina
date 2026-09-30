import { describe, it, expect, beforeEach } from 'vitest'
import { initMenu, initHeaderShadow } from '../src/menu.js'

function setup() {
  document.body.innerHTML = `
    <header data-header>
      <button data-menu-button aria-expanded="false" aria-controls="menu-mobile"><span class="sr-only">Abrir menu</span></button>
      <nav id="menu-mobile" data-menu-drawer hidden><a href="#destinos">Destinos</a></nav>
    </header>`
  const button = document.querySelector('[data-menu-button]')
  const drawer = document.querySelector('[data-menu-drawer]')
  initMenu(button, drawer)
  return { button, drawer }
}

describe('menu mobile', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('abre e fecha pelo botão', () => {
    const { button, drawer } = setup()
    button.click()
    expect(drawer.hidden).toBe(false)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.textContent).toBe('Fechar menu')
    button.click()
    expect(drawer.hidden).toBe(true)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.textContent).toBe('Abrir menu')
  })

  it('fecha ao clicar num link', () => {
    const { button, drawer } = setup()
    button.click()
    drawer.querySelector('a').click()
    expect(drawer.hidden).toBe(true)
  })

  it('fecha com Esc e devolve o foco ao botão', () => {
    const { button, drawer } = setup()
    button.click()
    drawer.querySelector('a').focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(drawer.hidden).toBe(true)
    expect(document.activeElement).toBe(button)
  })

  it('Esc com menu fechado não rouba o foco', () => {
    const { button } = setup()
    const outside = document.createElement('input')
    document.body.append(outside)
    outside.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(document.activeElement).toBe(outside)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('sombra do cabeçalho', () => {
  it('aparece só depois de rolar', () => {
    document.body.innerHTML = '<header data-header></header>'
    const header = document.querySelector('header')
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    initHeaderShadow(header)
    expect(header.classList.contains('shadow-md')).toBe(false)
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    expect(header.classList.contains('shadow-md')).toBe(true)
  })
})

describe('ativação do menu', () => {
  it('initMenu revela o botão', () => {
    document.body.innerHTML = `
      <button data-menu-button hidden aria-expanded="false"><span class="sr-only">Abrir menu</span></button>
      <nav data-menu-drawer hidden></nav>`
    initMenu(document.querySelector('[data-menu-button]'), document.querySelector('[data-menu-drawer]'))
    expect(document.querySelector('[data-menu-button]').hidden).toBe(false)
  })
})
