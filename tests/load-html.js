import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Caminho a partir da raiz do projeto: no ambiente jsdom o URL global não é aceito pelo fs do Node.
export const fromRoot = (...parts) => resolve(process.cwd(), ...parts)

export function loadIndex() {
  const html = readFileSync(fromRoot('index.html'), 'utf8')
  return new DOMParser().parseFromString(html, 'text/html')
}
