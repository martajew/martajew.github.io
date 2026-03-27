import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  site: 'https://martajew.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
})
