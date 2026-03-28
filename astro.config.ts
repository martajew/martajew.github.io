import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { getFonts } from './src/lib/fonts.ts'

// https://astro.build/config
export default defineConfig({
  fonts: getFonts(),
  integrations: [sitemap()],
  site: 'https://martajew.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
})
