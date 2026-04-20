import { describe, expect, it, vi } from 'vitest'

import { importeerIndexVanUrl, laadPersonaVanCatalogusItem } from '@/features/persona/remoteCatalog'

const GELDIGE_INDEX = JSON.stringify({
  soort: 'plusmin-index',
  schemaVersie: 1,
  bijgewerktOp: '2026-04-20T10:00:00.000Z',
  directoryHash: 'abc123',
  bestanden: [
    {
      pad: 'personas/amina.pms',
      metadata: {
        naam: 'Amina',
        taal: 'nl',
        context: 'nieuwkomers',
        beschrijving: 'Demo persona',
        niveau: 2,
      },
    },
  ],
})

const GELDIGE_PERSONA = JSON.stringify({
  soort: 'plusmin-persona',
  schemaVersie: 1,
  persona: {
    naam: 'Amina',
    taal: 'nl',
    context: 'nieuwkomers',
    beschrijving: 'Demo persona',
    niveau: 2,
    startsaldo: 50,
    dobbelWaarden: { euro: 5, tweeEuro: 10, drieEuro: 15 },
    leefgeld: { boodschappen: 120, vervoer: 40, fun: 20, overig: 30 },
    vasteMutaties: [],
    kansKaarten: [],
    plusMinKaarten: [],
  },
})

describe('remoteCatalog', () => {
  it('laadt en normaliseert een remote index', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(GELDIGE_INDEX, { status: 200 }))

    const catalogus = await importeerIndexVanUrl('https://partner.example/index.pms', {
      modus: 'open',
      fetcher,
    })

    expect(catalogus.items).toHaveLength(1)
    expect(catalogus.items[0].personaUrl).toBe('https://partner.example/personas/amina.pms')
  })

  it('wijst een ongeldige index fail-closed af', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{"foo":"bar"}', { status: 200 }))

    await expect(
      importeerIndexVanUrl('https://partner.example/index.pms', {
        modus: 'open',
        fetcher,
      }),
    ).rejects.toThrow(/soort moet plusmin-index zijn/i)
  })

  it('geeft netwerk- of CORS-fouten duidelijk terug', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Failed to fetch'))

    await expect(
      importeerIndexVanUrl('https://partner.example/index.pms', {
        modus: 'open',
        fetcher,
      }),
    ).rejects.toThrow(/netwerk-, cors- of csp-probleem/i)
  })

  it('laadt pas de gekozen persona uit de catalogus', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(GELDIGE_PERSONA, { status: 200 }))

    const persona = await laadPersonaVanCatalogusItem(
      {
        pad: 'personas/amina.pms',
        personaUrl: 'https://partner.example/personas/amina.pms',
        metadata: {
          naam: 'Amina',
          taal: 'nl',
          context: 'nieuwkomers',
          beschrijving: 'Demo persona',
          niveau: 2,
        },
      },
      {
        modus: 'open',
        fetcher,
      },
    )

    expect(persona.bestand.persona.naam).toBe('Amina')
    expect(persona.bronUrl).toBe('https://partner.example/personas/amina.pms')
  })
})