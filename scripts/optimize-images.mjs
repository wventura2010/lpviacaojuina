import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SRC = 'assets-src'
const OUT = 'public/img'

// [nome, largura, espelhar]
const photos = [
  ['hero-onibus', 1920, true],
  ['destino-tangara-da-serra', 640],
  ['destino-cuiaba', 640],
  ['destino-campo-novo-do-parecis', 640],
  ['destino-pontes-e-lacerda', 640],
  ['diferencial-conforto', 800],
  ['diferencial-profissionais', 800],
  ['diferencial-preco', 800],
]

const load = (name, flop) => {
  const img = sharp(`${SRC}/${name}.jpg`)
  return flop ? img.flop() : img
}

await mkdir(OUT, { recursive: true })

for (const [name, width, flop] of photos) {
  await load(name, flop)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`${OUT}/${name}.webp`)
  console.log(`ok ${name}.webp`)
}

await load('hero-onibus', true)
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

for (const width of [768, 1280]) {
  await load('hero-onibus', true).resize({ width }).webp({ quality: 75 }).toFile(`${OUT}/hero-onibus-${width}.webp`)
}

const { width: logoW, height: logoH } = await sharp(`${OUT}/logo.png`).metadata()
console.log(`ok logo (${logoW}x${logoH}), favicon, og, hero 768/1280`)
