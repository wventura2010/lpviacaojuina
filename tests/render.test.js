import { describe, it, expect } from 'vitest'
import { destinos, diferenciais } from '../src/data.js'
import { destinoCard, diferencialCard, renderList } from '../src/render.js'
import { whatsappUrl, routeMessage } from '../src/whatsapp.js'

describe('data', () => {
  it('tem as 5 rotas da spec, na ordem', () => {
    expect(destinos.map((d) => `${d.origem} → ${d.destino}`)).toEqual([
      'Cuiabá → Tangará da Serra',
      'Tangará da Serra → Cuiabá',
      'Cuiabá → Campo Novo do Parecis',
      'Campo Novo do Parecis → Cuiabá',
      'Cuiabá → Pontes e Lacerda',
    ])
  })

  it('tem os 3 diferenciais da spec', () => {
    expect(diferenciais.map((d) => [d.linha1, d.linha2])).toEqual([
      ['Conforto e', 'Segurança'],
      ['Qualidade nos serviços', 'e bons profissionais'],
      ['Melhor preço de', 'Passagem'],
    ])
  })

  it('aponta imagens para /img/*.webp', () => {
    for (const item of [...destinos, ...diferenciais]) {
      expect(item.imagem).toMatch(/^\/img\/[a-z0-9-]+\.webp$/)
    }
  })
})

describe('destinoCard', () => {
  const item = { origem: 'Cuiabá', destino: 'Campo Novo do Parecis', imagem: '/img/x.webp' }

  it('é um link para o WhatsApp com a mensagem da rota', () => {
    const card = destinoCard(item)
    expect(card.tagName).toBe('A')
    expect(card.href).toBe(whatsappUrl(routeMessage('Cuiabá', 'Campo Novo do Parecis')))
    expect(card.target).toBe('_blank')
    expect(card.rel).toBe('noopener')
    expect(card.getAttribute('aria-label')).toBe(
      'Comprar passagem de Cuiabá para Campo Novo do Parecis pelo WhatsApp (abre em nova janela)'
    )
  })

  it('mostra origem e destino, com destino longo truncado e com title', () => {
    const card = destinoCard(item)
    expect(card.querySelector('[data-origem]').textContent).toBe('Cuiabá')
    const destino = card.querySelector('[data-destino]')
    expect(destino.textContent).toBe('Campo Novo do Parecis')
    expect(destino.classList.contains('truncate')).toBe(true)
    expect(destino.title).toBe('Campo Novo do Parecis')
  })

  it('usa imagem decorativa com carregamento tardio', () => {
    const img = destinoCard(item).querySelector('img')
    expect(img.getAttribute('src')).toBe('/img/x.webp')
    expect(img.getAttribute('alt')).toBe('')
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('não interpreta HTML vindo dos dados', () => {
    const card = destinoCard({ ...item, destino: '<b>X</b>' })
    expect(card.querySelector('[data-destino]').textContent).toBe('<b>X</b>')
    expect(card.querySelector('b')).toBeNull()
  })
})

describe('diferencialCard', () => {
  it('mostra as duas linhas, a segunda em laranja', () => {
    const card = diferencialCard({ linha1: 'Conforto e', linha2: 'Segurança', imagem: '/img/y.webp' })
    expect(card.tagName).toBe('ARTICLE')
    const [l1, l2] = card.querySelectorAll('h3 > span')
    expect(l1.textContent).toBe('Conforto e')
    expect(l2.textContent).toBe('Segurança')
    expect(l2.classList.contains('text-juina-orange')).toBe(true)
    expect(card.querySelector('img').getAttribute('alt')).toBe('')
  })
})

describe('renderList', () => {
  it('substitui o conteúdo do container pelos cards', () => {
    const container = document.createElement('div')
    container.innerHTML = '<p>antigo</p>'
    renderList(container, destinos, destinoCard)
    expect(container.querySelectorAll('a')).toHaveLength(5)
    expect(container.querySelector('p[data-origem]')).not.toBeNull()
    expect(container.textContent).not.toContain('antigo')
  })
})
