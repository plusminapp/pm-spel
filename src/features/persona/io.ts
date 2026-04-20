import { maakPersonaMetadata } from './metadata'
import { sanitiseerBestandsNaam } from './sanitize'
import { bepaalToegestaneUrl } from './sourceMode'
import { parsePersonaJson, serializePersonaBestand } from './serialization'
import type { BronModus, GeimporteerdePersona, PersonaBestand } from './types'

type UrlImportOpties = {
  modus: BronModus
  huidigeOrigin?: string
  allowlist?: readonly string[]
  fetcher?: typeof fetch
}

function maakImportId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function maakGeimporteerdePersona(bestand: PersonaBestand, bronType: 'lokaal' | 'url', bronLabel: string): GeimporteerdePersona {
  return {
    id: maakImportId(),
    bestand,
    metadata: maakPersonaMetadata(bestand),
    bronType,
    bronLabel,
  }
}

export async function importeerPersonaBestandenVanFiles(files: File[]): Promise<GeimporteerdePersona[]> {
  const resultaten: GeimporteerdePersona[] = []

  for (const file of files) {
    const inhoud = await file.text()
    const bestand = parsePersonaJson(inhoud)
    resultaten.push(maakGeimporteerdePersona(bestand, 'lokaal', file.name))
  }

  return resultaten
}

export async function importeerPersonaBestandVanUrl(urlInvoer: string, opties: UrlImportOpties): Promise<GeimporteerdePersona> {
  const url = bepaalToegestaneUrl(urlInvoer, {
    modus: opties.modus,
    huidigeOrigin: opties.huidigeOrigin,
    allowlist: opties.allowlist,
  })

  const fetcher = opties.fetcher ?? fetch
  const response = await fetcher(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Download mislukt (${response.status}).`)
  }

  const inhoud = await response.text()
  const bestand = parsePersonaJson(inhoud)
  return maakGeimporteerdePersona(bestand, 'url', url.toString())
}

export function maakDownloadBestandsNaam(bestand: PersonaBestand): string {
  return `${sanitiseerBestandsNaam(bestand.persona.naam)}.pms`
}

export function downloadPersonaBestand(bestand: PersonaBestand): void {
  const inhoud = serializePersonaBestand(bestand)
  const blob = new Blob([inhoud], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = maakDownloadBestandsNaam(bestand)
  anchor.click()
  URL.revokeObjectURL(url)
}