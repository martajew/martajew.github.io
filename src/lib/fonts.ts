import type { AllSettingsMap } from './content'

const DEFAULT_SANS_FAMILY = 'Road Rage'
const DEFAULT_MONO_FAMILY = 'JetBrains Mono'

const SANS_WEIGHTS = [400, 600, 700] // fixed defaults
const MONO_WEIGHTS = [400, 600, 700] // fixed defaults

const SANS_FALLBACK = 'system-ui, sans-serif'
const MONO_FALLBACK = 'ui-monospace, monospace'

const NORMALIZE_REGEX = /\s+/g

function sanitizeFamily(input: string | undefined, fallback: string): string {
  const value = input?.trim()
  return value && value.length > 0 ? value : fallback
}

function familyParam(family: string, weights: number[]): string {
  const normalizedFamily = family.replace(NORMALIZE_REGEX, '+')
  const normalizedWeights = [...new Set(weights)].sort((a, b) => a - b).join(';')
  return `family=${normalizedFamily}:wght@${normalizedWeights}`
}

export function getGoogleFontConfig(layout: AllSettingsMap['layout']) {
  const sansFamily = sanitizeFamily(layout.fontSansFamily, DEFAULT_SANS_FAMILY)
  const monoFamily = sanitizeFamily(layout.fontMonoFamily, DEFAULT_MONO_FAMILY)

  const familyParams = [
    familyParam(sansFamily, SANS_WEIGHTS),
    familyParam(monoFamily, MONO_WEIGHTS),
  ].join('&')

  return {
    href: `https://fonts.googleapis.com/css2?${familyParams}&display=swap`,
    sansVar: `"${sansFamily}", ${SANS_FALLBACK}`,
    monoVar: `"${monoFamily}", ${MONO_FALLBACK}`,
  }
}
