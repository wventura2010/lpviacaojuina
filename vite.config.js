import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { assertPublicSiteUrl } from './site-url.js'

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') {
    assertPublicSiteUrl(loadEnv(mode, process.cwd()).VITE_SITE_URL)
  }
  return {
    plugins: [tailwindcss()],
    test: { environment: 'jsdom' },
  }
})
