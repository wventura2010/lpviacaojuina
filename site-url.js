// Garante que o build de produção não publique URLs de localhost no Open Graph e no JSON-LD.
export function assertPublicSiteUrl(url) {
  if (!url) {
    throw new Error('VITE_SITE_URL não definida. Crie .env.production com VITE_SITE_URL=https://seu-dominio (sem barra no final).')
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)) {
    throw new Error(`VITE_SITE_URL aponta para localhost (${url}). Use o domínio público em .env.production, ou "npm run build:local" para testes.`)
  }
  if (url.endsWith('/')) {
    throw new Error(`VITE_SITE_URL não pode terminar com barra (${url}).`)
  }
}
