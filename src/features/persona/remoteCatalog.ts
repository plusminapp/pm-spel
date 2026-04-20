import { PersonaImportFout } from './errors'
import { importeerPersonaBestandVanUrl } from './io'
import { parseIndexJson } from './indexFile'
import { bepaalToegestaneUrl } from './sourceMode'
import type { BronModus, GeimporteerdePersona, IndexBestand } from './types'

type RemoteCatalogOpties = {
  modus: BronModus
  huidigeOrigin?: string
  allowlist?: readonly string[]
  fetcher?: typeof fetch
}

export type RemoteCatalogusItem = {
  pad: string
  personaUrl: string
  metadata: IndexBestand['bestanden'][number]['metadata']
}

export type RemoteCatalogus = {
  indexUrl: string
  bijgewerktOp: string
  directoryHash: string
  items: RemoteCatalogusItem[]
}

export async function importeerIndexVanUrl(urlInvoer: string, opties: RemoteCatalogOpties): Promise<RemoteCatalogus> {
  const url = bepaalToegestaneUrl(urlInvoer, {
    modus: opties.modus,
    huidigeOrigin: opties.huidigeOrigin,
    allowlist: opties.allowlist,
  })

  const fetcher = opties.fetcher ?? fetch
  let response: Response

  try {
    response = await fetcher(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      },
    })
  } catch (error) {
    throw new PersonaImportFout(`Index ophalen mislukt door netwerk-, CORS- of CSP-probleem: ${(error as Error).message}`)
  }

  if (!response.ok) {
    throw new PersonaImportFout(`Index ophalen mislukt (${response.status}).`)
  }

  const inhoud = await response.text()
  const index = parseIndexJson(inhoud)
  return maakRemoteCatalogus(index, url.toString())
}

export function maakRemoteCatalogus(index: IndexBestand, indexUrl: string): RemoteCatalogus {
  return {
    indexUrl,
    bijgewerktOp: index.bijgewerktOp,
    directoryHash: index.directoryHash,
    items: index.bestanden.map((item) => ({
      pad: item.pad,
      personaUrl: new URL(item.pad, indexUrl).toString(),
      metadata: item.metadata,
    })),
  }
}

export async function laadPersonaVanCatalogusItem(item: RemoteCatalogusItem, opties: RemoteCatalogOpties): Promise<GeimporteerdePersona> {
  return importeerPersonaBestandVanUrl(item.personaUrl, opties)
}