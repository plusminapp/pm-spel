import type { BronModus } from './types'

export function maakPersonaDeelUrl(personaUrl: string, appUrl: string, modus: BronModus): string {
  const shareUrl = new URL(appUrl)
  shareUrl.pathname = '/'
  shareUrl.searchParams.set('personaUrl', personaUrl)
  shareUrl.searchParams.set('mode', modus)
  return shareUrl.toString()
}

export function leesPersonaDeelLink(appUrl: string): { personaUrl: string | null; modus: BronModus | null } {
  const url = new URL(appUrl)
  const personaUrl = url.searchParams.get('personaUrl')
  const modus = url.searchParams.get('mode')

  if (modus !== 'curated' && modus !== 'open') {
    return { personaUrl, modus: null }
  }

  return { personaUrl, modus }
}