# Landing page Viação Juina Cuiabá — Design

Data: 2026-09-29
Fonte do briefing: `projeto landing page de uma agencia.txt`, `rotas.png`, `usar na landingpage - troque Total por Juina.png`, `logomarca.png`

## 1. Objetivo

Landing page de página única para a **Viação Juina Cuiabá** (passagens de ônibus). O único canal de compra é o **WhatsApp**: toda chamada para ação leva ao atendimento via `https://wa.me/5565999662141?text=<mensagem>`. Sucesso = visitante chega pelo celular, encontra a rota e abre o WhatsApp com a mensagem já preenchida.

Fora do escopo: busca de passagens, venda online, integração com queropassagem, conteúdo real do blog (será planejado depois).

## 2. Decisões

| Tema | Decisão |
|---|---|
| Canal de compra | Somente WhatsApp (65 99966-2141) |
| Hospedagem | Site estático (Netlify, Vercel ou GitHub Pages) |
| Stack | HTML + Tailwind CSS v4 + JavaScript puro, com Vite para dev e build |
| Imagens | Fotos gratuitas (Unsplash/Pexels) como provisórias, nomeadas para troca fácil |
| Idioma | Português (pt-BR) |

## 3. Estrutura do projeto

```
lpviacaojuina/
├─ index.html            ← a página (HTML com classes Tailwind)
├─ src/
│  ├─ input.css          ← @import "tailwindcss" + @theme com cores da marca
│  ├─ data.js            ← listas de destinos, diferenciais e dúvidas
│  └─ main.js            ← monta cards a partir de data.js, menu mobile, header ao rolar
├─ public/img/           ← logo, hero, destinos, diferenciais (WebP)
├─ dist/                 ← saída do build (publicada)
└─ package.json          ← scripts: dev, build, preview
```

- `index.html` fica na raiz porque é o ponto de entrada padrão do Vite.
- Dados (`data.js`) ficam separados da lógica (`main.js`): adicionar uma rota = adicionar um objeto em `data.js`.
- Dependências de desenvolvimento: `vite`, `tailwindcss`, `@tailwindcss/vite`.

### Cores da marca (tokens em `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `juina-navy` | `#1B2A6B` | faixas, títulos, rodapé, overlay do hero |
| `juina-sky` | `#2E9BE0` | detalhes, arcos decorativos |
| `juina-orange` | `#F28C1E` | botões, selo, destaques sobre fundo escuro |
| `juina-orange-dark` | `#C2610A` | textos laranja sobre fundo claro (contraste AA) |
| `juina-yellow` | `#FFC72C` | degradês |
| `juina-ice` | `#EEF5FD` | fundo da seção Diferenciais |
| `whatsapp` | `#25D366` | botão flutuante |

## 4. Seções (de cima para baixo)

### 4.1 Cabeçalho (fixo)
- Logo à esquerda (link para o topo); à direita: Destinos (`#destinos`), Dúvidas (`#duvidas`), Contato (`#contato`), Pega essa dica (`#blog`).
- Mobile (< 768px): botão hambúrguer abre gaveta com os links; fecha ao clicar num link ou em Esc.
- Fundo branco; ganha sombra quando `scrollY > 0`.
- Rolagem suave com `scroll-margin-top` para compensar a altura do cabeçalho.

### 4.2 Hero
- Imagem de fundo de ônibus moderno ocupando a largura, com overlay em degradê `juina-navy`.
- `h1`: **Viaje mais, pague menos.**
- Subtítulo: *Encontre passagens de ônibus para os destinos que você ama, com praticidade e economia.*
- Botão principal laranja **Comprar pelo WhatsApp** → mensagem "Olá! Quero comprar uma passagem."
- Botão secundário (contorno branco) **Ver destinos** → `#destinos`.
- Detalhe gráfico: arcos em `juina-sky`/`juina-navy` na borda inferior, remetendo à logo (SVG inline).

### 4.3 Principais Destinos (`#destinos`)
- Título: "Principais destinos da Viação Juina".
- Card (referência `rotas.png`): foto da cidade no topo; abaixo, origem (ícone ○, texto cinza) ligada por linha vertical ao destino (ícone de pino, texto em negrito). Nome longo é cortado com reticências.
- Card inteiro é um link para o WhatsApp com a mensagem: `Olá! Quero comprar passagem de {origem} para {destino}.`
- Rotas iniciais (em `data.js`):
  1. Cuiabá → Tangará da Serra
  2. Tangará da Serra → Cuiabá
  3. Cuiabá → Campo Novo do Parecis
  4. Campo Novo do Parecis → Cuiabá
  5. Cuiabá → Pontes e Lacerda
- Layout: 5 colunas ≥ 1280px; 3 colunas ≥ 768px; abaixo disso, carrossel horizontal com `scroll-snap` (cards com ~80% da largura, para mostrar que há mais).

### 4.4 Diferenciais Viação Juina
- Fundo `juina-ice`. Título "Diferenciais Viação Juina" e selo laranja "Promocional".
- Três cards (referência do print): foto no topo, faixa `juina-navy` embaixo com linha 1 em branco e linha 2 em `juina-orange`:
  1. Conforto e / **Segurança**
  2. Qualidade nos serviços / **e bons profissionais**
  3. Melhor preço de / **Passagem**
- 3 colunas ≥ 768px; empilhados no mobile.

### 4.5 Dúvidas (`#duvidas`)
- Acordeão com `<details>`/`<summary>` nativos (acessível sem JS).
- Perguntas iniciais, com respostas **rascunho a validar pela empresa**:
  1. Como compro minha passagem? → pelo WhatsApp (link).
  2. Quais documentos preciso para embarcar?
  3. Criança paga passagem?
  4. Posso levar bagagem? Qual o limite?
  5. Como remarco ou cancelo minha passagem?
  6. Onde fica o ponto de embarque em Cuiabá?
- Cada resposta rascunho recebe o comentário HTML `<!-- RASCUNHO: validar com a empresa -->`.

### 4.6 Pega essa dica — blog (`#blog`)
- Título "Pega essa dica" e três cards placeholder (imagem, título, resumo) com a etiqueta "Em breve". Sem links.

### 4.7 Rodapé / Contato (`#contato`)
- Fundo `juina-navy`, texto branco.
- Logo; endereço "Av. Miguel Sutil, 7034 – Despraiado, Cuiabá-MT, 78040-000" com link para o Google Maps; telefone "(65) 3316-2900" como `tel:+556533162900`; botão WhatsApp.
- Linha final: "© 2026 Viação Juina Cuiabá".

### 4.8 CTA flutuante
- Fixo no canto inferior direito, verde `whatsapp`, ícone + "Compre pelo WhatsApp"; em < 640px mostra só o ícone redondo (com `aria-label`).
- Mensagem: "Olá! Quero comprar uma passagem."

## 5. Links do WhatsApp

- Base: `https://wa.me/5565999662141?text=` + `encodeURIComponent(mensagem)`.
- Gerados por uma única função `whatsappUrl(mensagem)` em `main.js`; os links fixos no HTML têm o href já pronto (funcionam sem JS).
- Todos com `target="_blank" rel="noopener"` e indicação acessível de que abrem em nova janela.

## 6. Qualidade

**Acessibilidade:** `alt` em todas as imagens; hierarquia de títulos correta (um `h1`); foco visível; menu e acordeão operáveis por teclado; contraste WCAG AA (laranja sobre fundo claro usa `juina-orange-dark`); `lang="pt-BR"`.

**SEO:** `<title>` e `meta description` focados em "passagem de ônibus Cuiabá"; JSON-LD `BusCompany`/`LocalBusiness` com nome, endereço e telefone; Open Graph (título, descrição, imagem); favicon gerado da logo.

**Desempenho:** imagens em WebP redimensionadas; hero com `fetchpriority="high"`; demais com `loading="lazy"`; CSS apenas das classes usadas (Tailwind no build).

**Degradação sem JS:** se `main.js` falhar, os destinos e diferenciais não aparecem, mas cabeçalho, hero, dúvidas, rodapé e CTA flutuante continuam funcionando.

## 7. Testes / critérios de aceite

1. `npm run build` termina sem erros.
2. Lighthouse mobile: Desempenho ≥ 90, Acessibilidade ≥ 95, SEO ≥ 95, Boas práticas ≥ 95.
3. Sem rolagem horizontal da página em 375px, 768px e 1280px.
4. Cada card de destino abre o WhatsApp no número 5565999662141 com a mensagem da rota correta; hero, rodapé e botão flutuante abrem com a mensagem padrão.
5. Menu mobile abre e fecha (clique, link, Esc); acordeão abre e fecha pelo teclado.
6. HTML válido no validador W3C.

## 8. Pendências para a empresa (não bloqueiam a implementação)

- Respostas oficiais das Dúvidas.
- Fotos próprias (frota, equipe, cidades) para substituir as de banco de imagem.
- Logo em alta resolução ou vetor (o PNG atual é pequeno).
- Domínio onde o site será publicado.
