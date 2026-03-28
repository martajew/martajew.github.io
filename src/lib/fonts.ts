import path from 'node:path'
import process from 'node:process'
import { fontProviders } from 'astro/config'
import matter from 'gray-matter'

export const DEFAULT_SANS_FAMILY = 'Road Rage'
export const DEFAULT_MONO_FAMILY = 'JetBrains Mono'
const LAYOUT_SETTINGS_PATH = path.join(process.cwd(), 'content/settings/layout.md')

function sanitizeFamily(input: string | undefined, fallback: string): string {
  const value = input?.trim()
  return value && value.length > 0 ? value : fallback
}

function getLayoutFontFamilies() {
  try {
    const settings = matter.read(LAYOUT_SETTINGS_PATH)
    const frontmatter = settings.data
    return {
      sans: sanitizeFamily(frontmatter.fontSansFamily, DEFAULT_SANS_FAMILY),
      mono: sanitizeFamily(frontmatter.fontMonoFamily, DEFAULT_MONO_FAMILY),
    }
  }
  catch {
    return {
      sans: DEFAULT_SANS_FAMILY,
      mono: DEFAULT_MONO_FAMILY,
    }
  }
}

export function getFonts() {
  const families = getLayoutFontFamilies()

  return [
    {
      provider: fontProviders.google(),
      name: families.sans,
      cssVariable: '--font-sans',
      fallbacks: ['ui-sans-serif', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: families.mono,
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ]
}
