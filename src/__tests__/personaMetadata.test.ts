import { describe, expect, it } from 'vitest'

import { parseIndexJson } from '@/features/persona/indexFile'
import { filterPersonaMetadata, maakPersonaMetadata } from '@/features/persona/metadata'
import type { PersonaBestand } from '@/features/persona/types'

const bestand: PersonaBestand = {
  soort: 'plusmin-persona',
  schemaVersie: 1,
  persona: {
    naam: 'Noah',
    taal: 'nl',
    context: 'jongeren',
    beschrijving: 'Leert budgetteren via spel',
    niveau: 2,
    startsaldo: 45,
    dobbelWaarden: { euro: 7, tweeEuro: 12, drieEuro: 18 },
    leefgeld: { boodschappen: 168, vervoer: 42, fun: 35, overig: 21 },
    vasteMutaties: [],
    kansKaarten: [],
    plusMinKaarten: [],
  },
}

describe('metadata en index basis', () => {
  it('extraheert filterbare metadata uit een persona-bestand', () => {
    const metadata = maakPersonaMetadata(bestand)

    expect(metadata).toEqual({
      naam: 'Noah',
      taal: 'nl',
      context: 'jongeren',
      beschrijving: 'Leert budgetteren via spel',
      niveau: 2,
    })

    expect(filterPersonaMetadata([metadata], { context: 'jong', taal: 'nl', niveau: '2' })).toHaveLength(1)
    expect(filterPersonaMetadata([metadata], { beschrijving: 'nieuwkomers' })).toHaveLength(0)
  })

  it('kan een geldige index.pms basis inlezen', () => {
    const index = parseIndexJson(JSON.stringify({
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: '2026-04-20T12:00:00.000Z',
      directoryHash: 'abc123',
      bestanden: [
        {
          pad: 'standaard/noah.pms',
          metadata: maakPersonaMetadata(bestand),
        },
      ],
    }))

    expect(index.bestanden[0].metadata.naam).toBe('Noah')
  })
})