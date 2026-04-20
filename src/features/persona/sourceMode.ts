import { PersonaImportFout } from './errors'
import type { BronModus } from './types'

export const CURATED_ALLOWLIST: readonly string[] = []

type UrlRegelOpties = {
  modus: BronModus
  allowlist?: readonly string[]
  huidigeOrigin?: string
}

function isLokaleOntwikkelUrl(url: URL): boolean {
  return ['localhost', '127.0.0.1'].includes(url.hostname)
}

export function bepaalToegestaneUrl(urlInvoer: string, opties: UrlRegelOpties): URL {
  let url: URL

  try {
    url = new URL(urlInvoer, opties.huidigeOrigin)
  } catch {
    throw new PersonaImportFout('De opgegeven URL is ongeldig.')
  }

  const huidigeOrigin = opties.huidigeOrigin ? new URL(opties.huidigeOrigin).origin : undefined
  const isZelfdeOrigin = Boolean(huidigeOrigin) && url.origin === huidigeOrigin

  if (url.protocol !== 'https:' && !isZelfdeOrigin && !isLokaleOntwikkelUrl(url)) {
    throw new PersonaImportFout('Alleen HTTPS-bronnen zijn toegestaan buiten de lokale ontwikkelomgeving.')
  }

  if (opties.modus === 'open') {
    return url
  }

  const allowlist = new Set([...(opties.allowlist ?? CURATED_ALLOWLIST), ...(huidigeOrigin ? [huidigeOrigin] : [])])

  if (!allowlist.has(url.origin) && !isLokaleOntwikkelUrl(url)) {
    throw new PersonaImportFout('Deze URL is niet toegestaan in Curated mode.')
  }

  return url
}