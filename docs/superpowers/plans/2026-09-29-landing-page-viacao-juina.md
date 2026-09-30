# Landing page Viação Juina — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Landing page estática de página única para a Viação Juina Cuiabá, em que toda chamada para ação abre o WhatsApp (65 99966-2141) com mensagem pronta.

**Architecture:** Um `index.html` com as seções estáticas (cabeçalho, hero, dúvidas, blog, rodapé, CTA flutuante), estilizado com Tailwind v4. Os cards de Destinos e Diferenciais são montados em JS puro a partir de listas em `src/data.js`. Os links de WhatsApp saem de uma única função (`whatsappUrl`); os links fixos no HTML já têm o `href` pronto e funcionam sem JS. O Vite serve em dev e gera `dist/`.

**Tech Stack:** Node 24, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest + jsdom (testes), html-validate, sharp (imagens), Lighthouse (verificação final).

**Spec:** `docs/superpowers/specs/2026-09-29-landing-page-viacao-juina-design.md`

## Global Constraints

- Idioma da página: `lang="pt-BR"`; todo texto visível em português.
- Número do WhatsApp: `5565999662141`. URL base: `https://wa.me/5565999662141?text=` + `encodeURIComponent(mensagem)`.
- Mensagem padrão: `Olá! Quero comprar uma passagem.`
- Mensagem de rota: `Olá! Quero comprar passagem de {origem} para {destino}.`
- Todo link de WhatsApp: `target="_blank" rel="noopener"` e aviso acessível "(abre em nova janela)".
- Telefone fixo: exibido `(65) 3316-2900`, link `tel:+556533162900`.
- Endereço: `Av. Miguel Sutil, 7034 – Despraiado, Cuiabá-MT, 78040-000`.
- Cores (tokens `@theme`): `juina-navy #1b2a6b`, `juina-sky #2e9be0`, `juina-orange #f28c1e`, `juina-orange-dark #a8520a`, `juina-yellow #ffc72c`, `juina-ice #eef5fd`, `whatsapp #25d366`.
- Contraste: botões com fundo `juina-orange` ou `whatsapp` usam texto `text-juina-navy`, nunca branco.
- Um único `h1` na página: `Viaje mais, pague menos.`
- Texto inserido por JS usa `textContent`, nunca `innerHTML` com dados.
- Imagens de conteúdo são decorativas (o texto ao lado ou o `aria-label` do link carrega o significado) → `alt=""`. A logo tem `alt="Viação Juina"`.
- Imagens em `public/img/`, referenciadas como `/img/<arquivo>` no HTML e via `import.meta.env.BASE_URL` no JS. Publicação na raiz do domínio (Netlify/Vercel); subpasta do GitHub Pages não é suportada sem ajustar `base`.
- Comandos rodam na raiz do projeto: `c:\temp\WILSON\git\lpviacaojuina`.

## Review Focus

1. **Nome de cidade com acento na mensagem** (Cuiabá, Tangará) — o link precisa abrir o WhatsApp com o texto correto, não com caracteres quebrados. Teste: Task 2, `routeMessage`/`whatsappUrl` com acentos.
2. **JS desativado ou com erro** — os botões de compra do hero, do rodapé e o flutuante precisam continuar funcionando, e as Dúvidas precisam abrir. Testes: Task 5 e Task 6 conferem `href` completo nos links `[data-whatsapp]` do HTML e que as dúvidas são `<details>`.
3. **Menu mobile pelo teclado** — Esc fecha o menu e devolve o foco ao botão; tocar num link fecha o menu. Teste: Task 4.
4. **Nome de destino longo** ("Campo Novo do Parecis") em card estreito — não pode estourar o card; o nome completo fica acessível. Teste: Task 3 confere `truncate` e `title`.
5. **CTA flutuante cobrindo o fim do rodapé** no celular — o rodapé precisa de espaço inferior. Teste: Task 6 confere `pb-28` no rodapé.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `package.json` | dependências e scripts (`dev`, `build`, `preview`, `test`, `validate`, `images`) |
| `vite.config.js` | plugin Tailwind + ambiente jsdom do Vitest |
| `.env` | `VITE_SITE_URL` (URL pública, usada em Open Graph e JSON-LD) |
| `.htmlvalidate.json` | regras do validador de HTML |
| `.gitignore` | `node_modules`, `dist`, relatórios do Lighthouse, capturas |
| `index.html` | toda a marcação estática da página |
| `src/input.css` | `@import "tailwindcss"`, tokens de cor, estilos base |
| `src/whatsapp.js` | `whatsappUrl`, `routeMessage`, constantes |
| `src/data.js` | listas `destinos` e `diferenciais` |
| `src/render.js` | `destinoCard`, `diferencialCard`, `renderList` |
| `src/menu.js` | `initMenu`, `initHeaderShadow` |
| `src/main.js` | ponto de entrada: importa CSS e liga tudo |
| `scripts/optimize-images.mjs` | converte `assets-src/*` em WebP/PNG/JPG para `public/img/` |
| `assets-src/` | fotos originais baixadas + `CREDITOS.md` |
| `public/img/` | imagens otimizadas servidas pelo site |
| `tests/load-html.js` | helper: lê e faz parse do `index.html` |
| `tests/*.test.js` | testes Vitest |

---

### Task 1: Base do projeto (Vite + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `.gitignore`, `.htmlvalidate.json`, `index.html`, `src/input.css`, `src/main.js`, `tests/load-html.js`, `tests/index-html.test.js`

**Interfaces:**
- Produces: `loadIndex(): Document` em `tests/load-html.js`; marcadores de seção em `index.html` (`<!-- HEADER -->`, `<!-- HERO_DESTINOS_DIFERENCIAIS -->`, `<!-- DUVIDAS_BLOG -->`, `<!-- RODAPE_CTA -->`, `<!-- SEO -->`) que as Tasks 4–8 substituem; classes Tailwind das cores (`bg-juina-navy`, `text-juina-orange` etc.).

- [ ] **Step 1: Criar package.json e instalar dependências**

```json
{
  "name": "lp-viacao-juina",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "validate": "html-validate dist/index.html",
    "images": "node scripts/optimize-images.mjs"
  }
}
```

Run: `npm install -D vite tailwindcss @tailwindcss/vite vitest jsdom html-validate sharp`
Expected: instala sem erros; `node_modules/` criado.

- [ ] **Step 2: Criar configs**

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  test: { environment: 'jsdom' },
})
```

`.gitignore`:
```
node_modules/
dist/
lighthouse-*.json
shot-*.png
```

`.htmlvalidate.json`:
```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-trailing-whitespace": "off"
  }
}
```

- [ ] **Step 3: Escrever o teste que falha**

`tests/load-html.js`:
```js
import { readFileSync } from 'node:fs'

export function loadIndex() {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  return new DOMParser().parseFromString(html, 'text/html')
}
```

`tests/index-html.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'

describe('index.html', () => {
  it('declara idioma pt-BR e carrega main.js como módulo', () => {
    const doc = loadIndex()
    expect(doc.documentElement.lang).toBe('pt-BR')
    expect(doc.querySelector('script[type="module"][src="/src/main.js"]')).not.toBeNull()
  })
})
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL com `ENOENT` (index.html não existe).

- [ ] **Step 5: Criar index.html, CSS e main.js**

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Viação Juina Cuiabá</title>
  <!-- SEO -->
  <script type="module" src="/src/main.js"></script>
</head>
<body class="bg-white text-slate-800 antialiased">
  <!-- HEADER -->
  <main>
    <!-- HERO_DESTINOS_DIFERENCIAIS -->
    <!-- DUVIDAS_BLOG -->
  </main>
  <!-- RODAPE_CTA -->
</body>
</html>
```

`src/input.css`:
```css
@import "tailwindcss";

@theme {
  --color-juina-navy: #1b2a6b;
  --color-juina-sky: #2e9be0;
  --color-juina-orange: #f28c1e;
  --color-juina-orange-dark: #a8520a;
  --color-juina-yellow: #ffc72c;
  --color-juina-ice: #eef5fd;
  --color-whatsapp: #25d366;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }

  :focus-visible {
    outline: 3px solid var(--color-juina-orange);
    outline-offset: 2px;
  }
}
```

`src/main.js`:
```js
import './input.css'
```

- [ ] **Step 6: Rodar testes e build**

Run: `npm test`
Expected: PASS (1 teste).

Run: `npm run build`
Expected: termina sem erros; `dist/index.html` e `dist/assets/*.css` gerados.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore .htmlvalidate.json index.html src tests
git commit -m "chore: base do projeto com Vite, Tailwind v4 e Vitest"
```

---

### Task 2: Links do WhatsApp

**Files:**
- Create: `src/whatsapp.js`, `tests/whatsapp.test.js`

**Interfaces:**
- Produces:
  - `WHATSAPP_NUMBER: string` = `'5565999662141'`
  - `DEFAULT_MESSAGE: string` = `'Olá! Quero comprar uma passagem.'`
  - `whatsappUrl(message?: string): string` — padrão `DEFAULT_MESSAGE`
  - `routeMessage(origem: string, destino: string): string`

- [ ] **Step 1: Escrever os testes que falham**

`tests/whatsapp.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/whatsapp.test.js`
Expected: FAIL com "Failed to resolve import ../src/whatsapp.js".

- [ ] **Step 3: Implementar**

`src/whatsapp.js`:
```js
export const WHATSAPP_NUMBER = '5565999662141'
export const DEFAULT_MESSAGE = 'Olá! Quero comprar uma passagem.'

export function whatsappUrl(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function routeMessage(origem, destino) {
  return `Olá! Quero comprar passagem de ${origem} para ${destino}.`
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/whatsapp.test.js`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/whatsapp.js tests/whatsapp.test.js
git commit -m "feat: gerador de links do WhatsApp"
```

---

### Task 3: Dados e cards de Destinos e Diferenciais

**Files:**
- Create: `src/data.js`, `src/render.js`, `tests/render.test.js`

**Interfaces:**
- Consumes: `whatsappUrl`, `routeMessage` de `src/whatsapp.js`.
- Produces:
  - `destinos: Array<{ origem: string, destino: string, imagem: string }>` (5 itens)
  - `diferenciais: Array<{ linha1: string, linha2: string, imagem: string }>` (3 itens)
  - `destinoCard(item): HTMLAnchorElement`
  - `diferencialCard(item): HTMLElement` (`<article>`)
  - `renderList(container: Element, items: Array, factory: (item) => Element): void`

- [ ] **Step 1: Escrever os testes que falham**

`tests/render.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/render.test.js`
Expected: FAIL com "Failed to resolve import ../src/data.js".

- [ ] **Step 3: Implementar dados**

`src/data.js`:
```js
const img = (file) => `${import.meta.env.BASE_URL}img/${file}`

export const destinos = [
  { origem: 'Cuiabá', destino: 'Tangará da Serra', imagem: img('destino-tangara-da-serra.webp') },
  { origem: 'Tangará da Serra', destino: 'Cuiabá', imagem: img('destino-cuiaba.webp') },
  { origem: 'Cuiabá', destino: 'Campo Novo do Parecis', imagem: img('destino-campo-novo-do-parecis.webp') },
  { origem: 'Campo Novo do Parecis', destino: 'Cuiabá', imagem: img('destino-cuiaba.webp') },
  { origem: 'Cuiabá', destino: 'Pontes e Lacerda', imagem: img('destino-pontes-e-lacerda.webp') },
]

export const diferenciais = [
  { linha1: 'Conforto e', linha2: 'Segurança', imagem: img('diferencial-conforto.webp') },
  { linha1: 'Qualidade nos serviços', linha2: 'e bons profissionais', imagem: img('diferencial-profissionais.webp') },
  { linha1: 'Melhor preço de', linha2: 'Passagem', imagem: img('diferencial-preco.webp') },
]
```

- [ ] **Step 4: Implementar cards**

`src/render.js`:
```js
import { whatsappUrl, routeMessage } from './whatsapp.js'

const PIN_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-juina-orange-dark" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function decorativeImage(src, className) {
  const img = el('img', className)
  img.src = src
  img.alt = ''
  img.loading = 'lazy'
  img.decoding = 'async'
  return img
}

export function destinoCard({ origem, destino, imagem }) {
  const card = el(
    'a',
    'group block w-4/5 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-2/5 md:w-auto'
  )
  card.href = whatsappUrl(routeMessage(origem, destino))
  card.target = '_blank'
  card.rel = 'noopener'
  card.setAttribute('aria-label', `Comprar passagem de ${origem} para ${destino} pelo WhatsApp (abre em nova janela)`)

  const body = el('div', 'p-4')

  const origemLine = el('p', 'flex items-center gap-2 text-sm text-slate-500')
  origemLine.append(el('span', 'h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-500'), el('span', '', origem))
  origemLine.dataset.origem = ''

  const connector = el('span', 'ml-[6px] block h-3 w-0.5 bg-slate-400')

  const destinoLine = el('p', 'flex items-center gap-2 font-bold text-slate-900')
  destinoLine.insertAdjacentHTML('afterbegin', PIN_ICON)
  const destinoText = el('span', 'truncate', destino)
  destinoText.title = destino
  destinoText.dataset.destino = ''
  destinoLine.append(destinoText)

  body.append(origemLine, connector, destinoLine)
  card.append(decorativeImage(imagem, 'aspect-[4/3] w-full object-cover'), body)
  return card
}

export function diferencialCard({ linha1, linha2, imagem }) {
  const card = el('article', 'overflow-hidden rounded-xl bg-juina-navy shadow-md')
  const title = el('h3', 'px-6 py-5 text-center text-xl font-bold leading-tight sm:text-2xl')
  title.append(el('span', 'block text-white', linha1), el('span', 'block text-juina-orange', linha2))
  card.append(decorativeImage(imagem, 'aspect-[4/3] w-full object-cover'), title)
  return card
}

export function renderList(container, items, factory) {
  container.replaceChildren(...items.map(factory))
}
```

Nota: o atributo `data-origem` fica no `<p>` da origem, cujo `textContent` é só o nome (o círculo é um `span` vazio) — por isso os testes usam tanto `[data-origem]` quanto `p[data-origem]`.

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- tests/render.test.js`
Expected: PASS (9 testes).

- [ ] **Step 6: Commit**

```bash
git add src/data.js src/render.js tests/render.test.js
git commit -m "feat: dados e cards de destinos e diferenciais"
```

---

### Task 4: Cabeçalho e menu mobile

**Files:**
- Create: `src/menu.js`, `tests/menu.test.js`, `tests/header.test.js`
- Modify: `index.html` (substituir `<!-- HEADER -->`), `src/main.js`

**Interfaces:**
- Produces:
  - `initMenu(button: HTMLButtonElement, drawer: HTMLElement): { setOpen(open: boolean): void }`
  - `initHeaderShadow(header: HTMLElement): void`
  - No HTML: `header[data-header]`, `button[data-menu-button]`, `nav#menu-mobile[data-menu-drawer]`

- [ ] **Step 1: Escrever os testes que falham**

`tests/header.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'

const LINKS = [
  ['#destinos', 'Destinos'],
  ['#duvidas', 'Dúvidas'],
  ['#contato', 'Contato'],
  ['#blog', 'Pega essa dica'],
]

describe('cabeçalho', () => {
  const doc = loadIndex()

  it('tem logo com alt', () => {
    expect(doc.querySelector('header[data-header] img[alt="Viação Juina"]')).not.toBeNull()
  })

  it('tem os 4 links no menu desktop e no mobile', () => {
    for (const nav of doc.querySelectorAll('header nav')) {
      const links = [...nav.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.textContent.trim()])
      expect(links).toEqual(LINKS)
    }
    expect(doc.querySelectorAll('header nav')).toHaveLength(2)
  })

  it('botão do menu controla a gaveta, que começa fechada', () => {
    const button = doc.querySelector('[data-menu-button]')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    const drawer = doc.getElementById(button.getAttribute('aria-controls'))
    expect(drawer).not.toBeNull()
    expect(drawer.hasAttribute('data-menu-drawer')).toBe(true)
    expect(drawer.hidden).toBe(true)
  })
})
```

`tests/menu.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/header.test.js tests/menu.test.js`
Expected: FAIL (seletores retornam `null`; import de `../src/menu.js` não resolve).

- [ ] **Step 3: Implementar o menu**

`src/menu.js`:
```js
export function initMenu(button, drawer) {
  const label = button.querySelector('.sr-only')

  function setOpen(open) {
    drawer.hidden = !open
    button.setAttribute('aria-expanded', String(open))
    label.textContent = open ? 'Fechar menu' : 'Abrir menu'
  }

  button.addEventListener('click', () => setOpen(drawer.hidden))
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) {
      setOpen(false)
      button.focus()
    }
  })
  window.matchMedia?.('(min-width: 768px)')?.addEventListener('change', (event) => {
    if (event.matches) setOpen(false)
  })

  return { setOpen }
}

export function initHeaderShadow(header) {
  const update = () => header.classList.toggle('shadow-md', window.scrollY > 0)
  window.addEventListener('scroll', update, { passive: true })
  update()
}
```

- [ ] **Step 4: Substituir `<!-- HEADER -->` no index.html**

```html
  <header data-header class="fixed inset-x-0 top-0 z-40 bg-white transition-shadow">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
      <a href="#inicio" class="flex items-center">
        <img src="/img/logo.png" alt="Viação Juina" class="h-12 w-auto">
      </a>
      <nav aria-label="Principal" class="hidden md:block">
        <ul class="flex gap-8 font-semibold text-juina-navy">
          <li><a href="#destinos" class="hover:text-juina-orange-dark">Destinos</a></li>
          <li><a href="#duvidas" class="hover:text-juina-orange-dark">Dúvidas</a></li>
          <li><a href="#contato" class="hover:text-juina-orange-dark">Contato</a></li>
          <li><a href="#blog" class="hover:text-juina-orange-dark">Pega essa dica</a></li>
        </ul>
      </nav>
      <button type="button" data-menu-button aria-expanded="false" aria-controls="menu-mobile" class="rounded-md p-2 text-juina-navy md:hidden">
        <span class="sr-only">Abrir menu</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-7 w-7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <nav id="menu-mobile" data-menu-drawer aria-label="Principal (celular)" hidden class="border-t border-slate-200 bg-white md:hidden">
      <ul class="flex flex-col px-4 py-2 font-semibold text-juina-navy">
        <li><a href="#destinos" class="block py-3">Destinos</a></li>
        <li><a href="#duvidas" class="block py-3">Dúvidas</a></li>
        <li><a href="#contato" class="block py-3">Contato</a></li>
        <li><a href="#blog" class="block py-3">Pega essa dica</a></li>
      </ul>
    </nav>
  </header>
```

Nota: o teste de `button.textContent` em `tests/menu.test.js` usa um botão só com o `span.sr-only`; no HTML real o botão também tem o SVG, que não tem texto, então o comportamento é o mesmo.

- [ ] **Step 5: Ligar em main.js**

`src/main.js`:
```js
import './input.css'
import { initMenu, initHeaderShadow } from './menu.js'

initMenu(document.querySelector('[data-menu-button]'), document.querySelector('[data-menu-drawer]'))
initHeaderShadow(document.querySelector('[data-header]'))
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npm test`
Expected: PASS (todos os testes, inclusive os das Tasks 1–3).

- [ ] **Step 7: Commit**

```bash
git add index.html src/menu.js src/main.js tests/header.test.js tests/menu.test.js
git commit -m "feat: cabeçalho fixo com menu mobile"
```

---

### Task 5: Hero, Destinos e Diferenciais

**Files:**
- Create: `tests/sections-top.test.js`
- Modify: `index.html` (substituir `<!-- HERO_DESTINOS_DIFERENCIAIS -->`), `src/main.js`

**Interfaces:**
- Consumes: `whatsappUrl()` (para conferir o `href` estático), `destinos`, `diferenciais`, `destinoCard`, `diferencialCard`, `renderList`.
- Produces: `section#inicio`, `section#destinos` com `[data-destinos]`, `section#diferenciais` com `[data-diferenciais]`; atributo `data-whatsapp` em todo link estático de compra (as Tasks 6 e 9 contam com isso).

- [ ] **Step 1: Escrever os testes que falham**

`tests/sections-top.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'
import { whatsappUrl } from '../src/whatsapp.js'

describe('hero, destinos e diferenciais', () => {
  const doc = loadIndex()

  it('tem um único h1 com o título do briefing', () => {
    const h1s = doc.querySelectorAll('h1')
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent.trim()).toBe('Viaje mais, pague menos.')
    expect(doc.querySelector('#inicio').textContent).toContain(
      'Encontre passagens de ônibus para os destinos que você ama, com praticidade e economia.'
    )
  })

  it('imagem do hero é prioritária e decorativa', () => {
    const img = doc.querySelector('#inicio img')
    expect(img.getAttribute('src')).toBe('/img/hero-onibus.webp')
    expect(img.getAttribute('fetchpriority')).toBe('high')
    expect(img.getAttribute('alt')).toBe('')
  })

  it('botão "Ver destinos" leva à seção', () => {
    const link = [...doc.querySelectorAll('#inicio a')].find((a) => a.textContent.includes('Ver destinos'))
    expect(link.getAttribute('href')).toBe('#destinos')
  })

  it('links estáticos de WhatsApp funcionam sem JS', () => {
    const links = doc.querySelectorAll('a[data-whatsapp]')
    expect(links.length).toBeGreaterThanOrEqual(1)
    for (const a of links) {
      expect(a.getAttribute('href')).toBe(whatsappUrl())
      expect(a.getAttribute('target')).toBe('_blank')
      expect(a.getAttribute('rel')).toBe('noopener')
      const accessibleName = a.getAttribute('aria-label') ?? a.textContent
      expect(accessibleName).toContain('abre em nova janela')
    }
  })

  it('tem os containers de destinos e diferenciais', () => {
    expect(doc.querySelector('section#destinos [data-destinos]')).not.toBeNull()
    expect(doc.querySelector('section#destinos h2').textContent).toBe('Principais destinos da Viação Juina')
    expect(doc.querySelector('section#diferenciais [data-diferenciais]')).not.toBeNull()
    expect(doc.querySelector('section#diferenciais h2').textContent).toBe('Diferenciais Viação Juina')
    expect(doc.querySelector('section#diferenciais').textContent).toContain('Promocional')
  })

  it('seções com âncora compensam o cabeçalho fixo', () => {
    expect(doc.querySelector('#destinos').classList.contains('scroll-mt-20')).toBe(true)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/sections-top.test.js`
Expected: FAIL (nenhum `h1`).

- [ ] **Step 3: Substituir `<!-- HERO_DESTINOS_DIFERENCIAIS -->` no index.html**

```html
    <section id="inicio" class="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-16">
      <img src="/img/hero-onibus.webp" alt="" fetchpriority="high" class="absolute inset-0 -z-20 h-full w-full object-cover">
      <div class="absolute inset-0 -z-10 bg-linear-to-r from-juina-navy/95 via-juina-navy/75 to-juina-navy/30"></div>
      <div class="relative mx-auto w-full max-w-7xl px-4 pb-32 pt-20">
        <div class="max-w-xl text-white">
          <h1 class="text-4xl font-extrabold leading-tight sm:text-6xl">Viaje mais, pague menos.</h1>
          <p class="mt-4 text-lg text-white/90 sm:text-xl">Encontre passagens de ônibus para os destinos que você ama, com praticidade e economia.</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <a data-whatsapp href="https://wa.me/5565999662141?text=Ol%C3%A1!%20Quero%20comprar%20uma%20passagem." target="_blank" rel="noopener" class="rounded-full bg-juina-orange px-7 py-3.5 font-bold text-juina-navy shadow-lg transition hover:bg-juina-yellow">Comprar pelo WhatsApp<span class="sr-only"> (abre em nova janela)</span></a>
            <a href="#destinos" class="rounded-full border-2 border-white px-7 py-3 font-bold text-white transition hover:bg-white hover:text-juina-navy">Ver destinos</a>
          </div>
        </div>
      </div>
      <svg class="absolute inset-x-0 bottom-0 h-16 w-full sm:h-24" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 64 C 360 8 1080 8 1440 64" class="fill-none stroke-juina-sky" stroke-width="8"/>
        <path d="M0 96 V 80 C 360 24 1080 24 1440 80 V 96 Z" class="fill-white"/>
      </svg>
    </section>

    <section id="destinos" class="scroll-mt-20 py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4">
        <h2 class="text-3xl font-extrabold text-juina-navy sm:text-4xl">Principais destinos da Viação Juina</h2>
        <p class="mt-2 text-slate-600">Toque na rota e fale direto com a gente no WhatsApp.</p>
        <div data-destinos class="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 xl:grid-cols-5"></div>
      </div>
    </section>

    <section id="diferenciais" class="scroll-mt-20 bg-juina-ice py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 text-center">
        <h2 class="text-3xl font-extrabold text-juina-navy sm:text-4xl">Diferenciais Viação Juina</h2>
        <span class="mt-4 inline-block rounded-full bg-juina-orange px-5 py-2 font-bold text-juina-navy">Promocional</span>
        <div data-diferenciais class="mt-10 grid gap-6 md:grid-cols-3"></div>
      </div>
    </section>
```

- [ ] **Step 4: Ligar a renderização em main.js**

`src/main.js`:
```js
import './input.css'
import { destinos, diferenciais } from './data.js'
import { destinoCard, diferencialCard, renderList } from './render.js'
import { initMenu, initHeaderShadow } from './menu.js'

renderList(document.querySelector('[data-destinos]'), destinos, destinoCard)
renderList(document.querySelector('[data-diferenciais]'), diferenciais, diferencialCard)
initMenu(document.querySelector('[data-menu-button]'), document.querySelector('[data-menu-drawer]'))
initHeaderShadow(document.querySelector('[data-header]'))
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: PASS (todos).

- [ ] **Step 6: Conferir no navegador**

Run: `npm run dev` (em segundo plano) e abrir `http://localhost:5173`.
Expected: hero com título e botões; 5 cards de destino e 3 de diferenciais aparecem (imagens ainda quebradas até a Task 7); em 375px os destinos rolam de lado sem criar rolagem horizontal na página.

- [ ] **Step 7: Commit**

```bash
git add index.html src/main.js tests/sections-top.test.js
git commit -m "feat: hero, destinos e diferenciais"
```

---

### Task 6: Dúvidas, Blog, Rodapé e CTA flutuante

**Files:**
- Create: `tests/sections-bottom.test.js`
- Modify: `index.html` (substituir `<!-- DUVIDAS_BLOG -->` e `<!-- RODAPE_CTA -->`)

**Interfaces:**
- Consumes: `whatsappUrl()`; convenção `data-whatsapp` da Task 5.
- Produces: `section#duvidas`, `section#blog`, `footer#contato`, `a[data-cta-flutuante]`.

- [ ] **Step 1: Escrever os testes que falham**

`tests/sections-bottom.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { loadIndex } from './load-html.js'
import { whatsappUrl } from '../src/whatsapp.js'

describe('dúvidas, blog, rodapé e CTA', () => {
  const doc = loadIndex()

  it('dúvidas são 6 <details> nativos (funcionam sem JS)', () => {
    const items = doc.querySelectorAll('section#duvidas details')
    expect(items).toHaveLength(6)
    for (const d of items) expect(d.querySelector('summary').textContent.trim()).not.toBe('')
    expect(items[0].querySelector('summary').textContent.trim()).toBe('Como compro minha passagem?')
    expect(items[0].querySelector('a[data-whatsapp]')).not.toBeNull()
  })

  it('blog tem 3 cards "Em breve" sem links', () => {
    const cards = doc.querySelectorAll('section#blog article')
    expect(cards).toHaveLength(3)
    for (const c of cards) {
      expect(c.textContent).toContain('Em breve')
      expect(c.querySelector('a')).toBeNull()
    }
  })

  it('rodapé tem endereço, mapa, telefone e WhatsApp', () => {
    const footer = doc.querySelector('footer#contato')
    expect(footer.textContent).toContain('Av. Miguel Sutil, 7034 – Despraiado, Cuiabá-MT, 78040-000')
    expect(footer.querySelector('a[href^="https://www.google.com/maps/search/"]')).not.toBeNull()
    const tel = footer.querySelector('a[href="tel:+556533162900"]')
    expect(tel.textContent).toContain('(65) 3316-2900')
    expect(footer.querySelector('a[data-whatsapp]')).not.toBeNull()
    expect(footer.textContent).toContain('© 2026 Viação Juina Cuiabá')
  })

  it('rodapé reserva espaço para o botão flutuante não cobrir o conteúdo', () => {
    expect(doc.querySelector('footer#contato').classList.contains('pb-28')).toBe(true)
  })

  it('CTA flutuante é fixo, acessível e aponta para o WhatsApp', () => {
    const cta = doc.querySelector('a[data-cta-flutuante]')
    expect(cta.getAttribute('href')).toBe(whatsappUrl())
    expect(cta.hasAttribute('data-whatsapp')).toBe(true)
    expect(cta.classList.contains('fixed')).toBe(true)
    expect(cta.getAttribute('aria-label')).toBe('Compre pelo WhatsApp (abre em nova janela)')
    expect(cta.classList.contains('text-juina-navy')).toBe(true)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/sections-bottom.test.js`
Expected: FAIL (`section#duvidas` não existe).

- [ ] **Step 3: Substituir `<!-- DUVIDAS_BLOG -->`**

```html
    <section id="duvidas" class="scroll-mt-20 py-16 sm:py-20">
      <div class="mx-auto max-w-3xl px-4">
        <h2 class="text-center text-3xl font-extrabold text-juina-navy sm:text-4xl">Dúvidas frequentes</h2>
        <div class="mt-10 divide-y divide-slate-200 rounded-xl border border-slate-200">
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Como compro minha passagem?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <p class="mt-3 text-slate-600">É só chamar a gente no <a data-whatsapp href="https://wa.me/5565999662141?text=Ol%C3%A1!%20Quero%20comprar%20uma%20passagem." target="_blank" rel="noopener" class="font-semibold text-juina-orange-dark underline">WhatsApp (65) 99966-2141<span class="sr-only"> (abre em nova janela)</span></a>. Informe origem, destino e data da viagem, e nossa equipe confirma horários, valores e forma de pagamento.</p>
          </details>
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Quais documentos preciso para embarcar?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <!-- RASCUNHO: validar com a empresa -->
            <p class="mt-3 text-slate-600">Documento oficial com foto (RG, CNH ou passaporte), físico ou digital. Menores de 16 anos viajando sem os pais precisam de autorização, conforme a lei.</p>
          </details>
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Criança paga passagem?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <!-- RASCUNHO: validar com a empresa -->
            <p class="mt-3 text-slate-600">Crianças de até 5 anos podem viajar no colo do responsável sem pagar, uma por adulto. Para ocupar uma poltrona, é preciso comprar passagem.</p>
          </details>
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Posso levar bagagem? Qual o limite?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <!-- RASCUNHO: validar com a empresa -->
            <p class="mt-3 text-slate-600">Sim. Você pode levar até 30 kg no bagageiro e até 5 kg de bagagem de mão.</p>
          </details>
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Como remarco ou cancelo minha passagem?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <!-- RASCUNHO: validar com a empresa -->
            <p class="mt-3 text-slate-600">Fale com a gente pelo WhatsApp com pelo menos 3 horas de antecedência do embarque para remarcar ou pedir o reembolso.</p>
          </details>
          <details class="group p-5">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-juina-navy">Onde fica o ponto de embarque em Cuiabá?<span class="text-2xl text-juina-orange-dark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
            <!-- RASCUNHO: validar com a empresa -->
            <p class="mt-3 text-slate-600">Nossa agência fica na Av. Miguel Sutil, 7034 – Despraiado. Confirme o local de embarque da sua viagem pelo WhatsApp.</p>
          </details>
        </div>
      </div>
    </section>

    <section id="blog" class="scroll-mt-20 bg-juina-ice py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4">
        <h2 class="text-3xl font-extrabold text-juina-navy sm:text-4xl">Pega essa dica</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-3">
          <article class="overflow-hidden rounded-xl bg-white shadow-sm">
            <div class="aspect-[16/9] bg-linear-to-br from-juina-sky to-juina-navy"></div>
            <div class="p-5">
              <span class="inline-block rounded-full bg-juina-orange px-3 py-1 text-xs font-bold text-juina-navy">Em breve</span>
              <h3 class="mt-3 text-lg font-bold text-juina-navy">Dicas para sua primeira viagem de ônibus</h3>
              <p class="mt-1 text-slate-600">Conteúdo em preparação.</p>
            </div>
          </article>
          <article class="overflow-hidden rounded-xl bg-white shadow-sm">
            <div class="aspect-[16/9] bg-linear-to-br from-juina-orange to-juina-yellow"></div>
            <div class="p-5">
              <span class="inline-block rounded-full bg-juina-orange px-3 py-1 text-xs font-bold text-juina-navy">Em breve</span>
              <h3 class="mt-3 text-lg font-bold text-juina-navy">O que levar na bagagem de mão</h3>
              <p class="mt-1 text-slate-600">Conteúdo em preparação.</p>
            </div>
          </article>
          <article class="overflow-hidden rounded-xl bg-white shadow-sm">
            <div class="aspect-[16/9] bg-linear-to-br from-juina-navy to-juina-sky"></div>
            <div class="p-5">
              <span class="inline-block rounded-full bg-juina-orange px-3 py-1 text-xs font-bold text-juina-navy">Em breve</span>
              <h3 class="mt-3 text-lg font-bold text-juina-navy">Destinos para conhecer em Mato Grosso</h3>
              <p class="mt-1 text-slate-600">Conteúdo em preparação.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Substituir `<!-- RODAPE_CTA -->`**

```html
  <footer id="contato" class="scroll-mt-20 bg-juina-navy pb-28 pt-14 text-white">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-3">
      <div>
        <div class="inline-block rounded-xl bg-white p-3">
          <img src="/img/logo.png" alt="Viação Juina" class="h-14 w-auto" loading="lazy">
        </div>
      </div>
      <div>
        <h2 class="text-lg font-bold text-juina-orange">Contato</h2>
        <address class="not-italic">
        <p class="mt-3">
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Av.%20Miguel%20Sutil%2C%207034%20-%20Despraiado%2C%20Cuiab%C3%A1%20-%20MT%2C%2078040-000" target="_blank" rel="noopener" class="hover:underline">Av. Miguel Sutil, 7034 – Despraiado, Cuiabá-MT, 78040-000<span class="sr-only"> (abre o mapa em nova janela)</span></a>
        </p>
        <p class="mt-2">Fone: <a href="tel:+556533162900" class="font-semibold hover:underline">(65) 3316-2900</a></p>
        </address>
      </div>
      <div>
        <h2 class="text-lg font-bold text-juina-orange">Compre sua passagem</h2>
        <a data-whatsapp href="https://wa.me/5565999662141?text=Ol%C3%A1!%20Quero%20comprar%20uma%20passagem." target="_blank" rel="noopener" class="mt-4 inline-block rounded-full bg-juina-orange px-6 py-3 font-bold text-juina-navy transition hover:bg-juina-yellow">Comprar pelo WhatsApp<span class="sr-only"> (abre em nova janela)</span></a>
      </div>
    </div>
    <p class="mx-auto mt-12 max-w-7xl border-t border-white/20 px-4 pt-6 text-sm text-white/80">© 2026 Viação Juina Cuiabá</p>
  </footer>

  <a data-whatsapp data-cta-flutuante href="https://wa.me/5565999662141?text=Ol%C3%A1!%20Quero%20comprar%20uma%20passagem." target="_blank" rel="noopener" aria-label="Compre pelo WhatsApp (abre em nova janela)" class="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-whatsapp p-4 font-bold text-juina-navy shadow-xl transition hover:scale-105 sm:px-6 sm:py-3.5">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    <span class="hidden sm:inline" aria-hidden="true">Compre pelo WhatsApp</span>
  </a>
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: PASS (todos).

- [ ] **Step 6: Commit**

```bash
git add index.html tests/sections-bottom.test.js
git commit -m "feat: dúvidas, blog, rodapé e CTA flutuante"
```

---

### Task 7: Imagens (fotos, logo, favicon, OG)

**Files:**
- Create: `scripts/optimize-images.mjs`, `assets-src/CREDITOS.md`, `assets-src/*.jpg`, `public/img/*`, `tests/assets.test.js`

**Interfaces:**
- Consumes: caminhos em `src/data.js` e em `index.html`.
- Produces: `public/img/` com `hero-onibus.webp`, `destino-*.webp` (4), `diferencial-*.webp` (3), `logo.png`, `favicon-32.png`, `apple-touch-icon.png`, `og.jpg` (usados na Task 8).

- [ ] **Step 1: Escrever o teste que falha**

`tests/assets.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { destinos, diferenciais } from '../src/data.js'
import { loadIndex } from './load-html.js'

const inPublic = (path) => existsSync(new URL(`../public${path}`, import.meta.url))

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
    expect(existsSync(new URL('../assets-src/CREDITOS.md', import.meta.url))).toBe(true)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/assets.test.js`
Expected: FAIL (arquivos em `public/img/` não existem).

- [ ] **Step 3: Baixar as fotos para `assets-src/`**

Baixe de Unsplash (unsplash.com) ou Pexels (pexels.com) — ambos com licença de uso comercial gratuita, sem necessidade de atribuição — em JPG, largura mínima indicada, com exatamente estes nomes:

| Arquivo | Busca sugerida | Largura mín. |
|---|---|---|
| `hero-onibus.jpg` | "modern coach bus highway" (ônibus rodoviário moderno, visto de frente/lado, horizontal) | 1920 |
| `destino-tangara-da-serra.jpg` | "waterfall cerrado brazil" (cachoeira, remete à Serra de Tapirapuã) | 800 |
| `destino-cuiaba.jpg` | "cuiaba" ou "brazil city aerial" | 800 |
| `destino-campo-novo-do-parecis.jpg` | "soybean field brazil" / "mato grosso farm" | 800 |
| `destino-pontes-e-lacerda.jpg` | "river brazil aerial" / "guapore river" | 800 |
| `diferencial-conforto.jpg` | "bus passenger seat smiling" | 1000 |
| `diferencial-profissionais.jpg` | "bus driver smiling" | 1000 |
| `diferencial-preco.jpg` | "woman phone laptop sofa" | 1000 |

Não use fotos do `rotas.png` nem do print da Viação Total (sem direito de uso).

Crie `assets-src/CREDITOS.md` com uma linha por foto:
```markdown
# Créditos das fotos (provisórias — substituir por fotos próprias)

| Arquivo | Autor | URL de origem | Licença |
|---|---|---|---|
| hero-onibus.jpg | <nome do autor> | <url da página da foto> | Unsplash License |
```
(preencha uma linha para cada um dos 8 arquivos com os dados reais da foto baixada).

- [ ] **Step 4: Escrever o script de otimização**

`scripts/optimize-images.mjs`:
```js
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'assets-src'
const OUT = 'public/img'

const photos = [
  ['hero-onibus', 1920],
  ['destino-tangara-da-serra', 640],
  ['destino-cuiaba', 640],
  ['destino-campo-novo-do-parecis', 640],
  ['destino-pontes-e-lacerda', 640],
  ['diferencial-conforto', 800],
  ['diferencial-profissionais', 800],
  ['diferencial-preco', 800],
]

await mkdir(OUT, { recursive: true })

for (const [name, width] of photos) {
  await sharp(`${SRC}/${name}.jpg`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(`ok ${name}.webp`)
}

await sharp(`${SRC}/hero-onibus.jpg`)
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toFile(`${OUT}/og.jpg`)

const logo = sharp('logomarca.png').trim()
await logo.clone().resize({ height: 136 }).png().toFile(`${OUT}/logo.png`)

const icon = (size) =>
  logo
    .clone()
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .png()
    .toFile(`${OUT}/${size === 32 ? 'favicon-32' : 'apple-touch-icon'}.png`)
await icon(32)
await icon(180)

console.log('ok logo, favicon, og')
```

- [ ] **Step 5: Gerar as imagens**

Run: `npm run images`
Expected: 8 linhas `ok ...webp` e `ok logo, favicon, og`; arquivos em `public/img/`.

- [ ] **Step 6: Rodar os testes**

Run: `npm test -- tests/assets.test.js`
Expected: os 2 testes de dados/créditos passam. O de `index.html` também passa (favicon ainda não está no HTML; a Task 8 o adiciona e o teste passa a cobri-lo).

- [ ] **Step 7: Conferir visualmente**

Run: `npm run dev` e abrir `http://localhost:5173`.
Expected: hero com ônibus, cards com fotos, logo nítida no cabeçalho e no rodapé.

- [ ] **Step 8: Commit**

```bash
git add scripts/optimize-images.mjs assets-src public/img tests/assets.test.js
git commit -m "feat: imagens provisórias otimizadas, logo e ícones"
```

---

### Task 8: SEO, Open Graph e dados estruturados

**Files:**
- Create: `.env`, `tests/seo.test.js`
- Modify: `index.html` (`<title>` e `<!-- SEO -->`)

**Interfaces:**
- Consumes: `public/img/favicon-32.png`, `apple-touch-icon.png`, `og.jpg` (Task 7).
- Produces: variável `VITE_SITE_URL` usada como `%VITE_SITE_URL%` no HTML (Vite substitui no dev e no build).

- [ ] **Step 1: Escrever os testes que falham**

`tests/seo.test.js`:
```js
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/seo.test.js`
Expected: FAIL (título é "Viação Juina Cuiabá").

- [ ] **Step 3: Criar `.env`**

```
# URL pública do site, sem barra no final. Trocar pelo domínio definitivo antes de publicar.
VITE_SITE_URL=http://localhost:4173
```

- [ ] **Step 4: Atualizar o `<head>`**

Troque `<title>Viação Juina Cuiabá</title>` e `<!-- SEO -->` por:
```html
  <title>Viação Juina Cuiabá | Passagens de ônibus em Mato Grosso</title>
  <meta name="description" content="Passagens de ônibus de Cuiabá para Tangará da Serra, Campo Novo do Parecis, Pontes e Lacerda e mais. Compre pelo WhatsApp com praticidade.">
  <meta name="theme-color" content="#1b2a6b">
  <link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="Viação Juina Cuiabá — Viaje mais, pague menos.">
  <meta property="og:description" content="Passagens de ônibus para os destinos que você ama. Compre pelo WhatsApp.">
  <meta property="og:url" content="%VITE_SITE_URL%/">
  <meta property="og:image" content="%VITE_SITE_URL%/img/og.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Viação Juina Cuiabá",
    "url": "%VITE_SITE_URL%/",
    "image": "%VITE_SITE_URL%/img/og.jpg",
    "telephone": "+55-65-3316-2900",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Miguel Sutil, 7034 - Despraiado",
      "addressLocality": "Cuiabá",
      "addressRegion": "MT",
      "postalCode": "78040-000",
      "addressCountry": "BR"
    }
  }
  </script>
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: PASS (todos, inclusive `tests/assets.test.js`, que agora confere os ícones).

- [ ] **Step 6: Conferir a substituição no build**

Run: `npm run build` e depois `grep -c "%VITE_SITE_URL%" dist/index.html`
Expected: build sem erros; o grep imprime `0` (todas as ocorrências substituídas por `http://localhost:4173`).

- [ ] **Step 7: Commit**

```bash
git add .env index.html tests/seo.test.js
git commit -m "feat: SEO, Open Graph e JSON-LD"
```

---

### Task 9: Verificação final (build, HTML, Lighthouse, larguras)

**Files:**
- Modify: apenas arquivos que precisarem de correção pelos achados abaixo.

- [ ] **Step 1: Testes e build**

Run: `npm test && npm run build`
Expected: todos os testes PASS; build sem erros nem avisos.

- [ ] **Step 2: Validar o HTML**

Run: `npm run validate`
Expected: sem erros. Corrija o que aparecer no `index.html` (não desligue regras sem motivo registrado em `.htmlvalidate.json`). Depois, cole o `dist/index.html` em https://validator.w3.org/#validate_by_input (validador W3C pedido na spec) e confirme "No errors".

- [ ] **Step 3: Lighthouse no celular e no desktop**

Run (em segundo plano): `npm run preview`
Run:
```bash
npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse-mobile.json --chrome-flags="--headless=new" --quiet
npx lighthouse http://localhost:4173 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse-desktop.json --chrome-flags="--headless=new" --quiet
node -e "for (const f of ['mobile','desktop']) { const r = require('./lighthouse-' + f + '.json'); console.log(f, Object.values(r.categories).map(c => c.id + '=' + Math.round(c.score*100)).join(' ')) }"
```
Expected (celular): `performance>=90 accessibility>=95 best-practices>=95 seo>=95`. Se ficar abaixo, abra o relatório (`--output=html`) e corrija os itens apontados. Se o Chrome não estiver instalado, rode `winget install Google.Chrome` antes.

- [ ] **Step 4: Capturas em 375, 768 e 1280px**

Run (com o preview ainda rodando):
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
for w in 375 768 1280; do "$CHROME" --headless=new --hide-scrollbars --window-size=$w,5000 --screenshot=shot-$w.png http://localhost:4173; done
```
Expected: abrir as três imagens e conferir que nada sai da largura da tela (sem faixa branca à direita, nenhum texto cortado), que os destinos aparecem em carrossel (375), 3 colunas (768) e 5 colunas (1280), e que o botão flutuante não cobre o © no fim do rodapé.

- [ ] **Step 5: Conferir os links do WhatsApp à mão**

No navegador (`http://localhost:4173`), clique em: botão do hero, cada um dos 5 cards de destino, link na primeira dúvida, botão do rodapé e botão flutuante.
Expected: todos abrem `wa.me/5565999662141` em nova aba; os cards mostram "Olá! Quero comprar passagem de {origem} para {destino}." com acentos corretos; os demais mostram "Olá! Quero comprar uma passagem.".

- [ ] **Step 6: Teclado e sem JS**

- Em 375px: Tab até o botão do menu → Enter abre → Esc fecha e o foco volta ao botão; tocar num link fecha o menu.
- Tab até as dúvidas → Enter abre e fecha cada uma.
- DevTools → Configurações → "Disable JavaScript", recarregar: hero, dúvidas, rodapé e botão flutuante continuam funcionando.

- [ ] **Step 7: Commit das correções (se houver)**

```bash
git add -A
git commit -m "fix: ajustes da verificação final"
```

---

## Pendências fora deste plano (da spec, seção 8)

- Respostas oficiais das Dúvidas (os comentários `RASCUNHO` marcam onde trocar).
- Fotos próprias: substituir os arquivos em `assets-src/` com os mesmos nomes e rodar `npm run images`.
- Logo em alta resolução ou vetor.
- Domínio: trocar `VITE_SITE_URL` no `.env` antes de publicar.
