import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  site: 'https://martajew.github.io',
  vite: {
    // @ts-expect-error - suppress TS2322: Type Plugin<any>[] is not assignable to type PluginOption
    plugins: [tailwindcss()],
  },
})
