export const WHATSAPP_NUMBER = '5565999662141'
export const DEFAULT_MESSAGE = 'Olá! Quero comprar uma passagem.'

export function whatsappUrl(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function routeMessage(origem, destino) {
  return `Olá! Quero comprar passagem de ${origem} para ${destino}.`
}
