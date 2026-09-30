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
