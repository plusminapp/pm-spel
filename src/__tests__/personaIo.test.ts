import { describe, expect, it } from 'vitest'

import { importeerPersonaBestandenVanFiles } from '@/features/persona/io'
import { serializePersonaBestand } from '@/features/persona/serialization'
import type { PersonaBestand } from '@/features/persona/types'

const voorbeeldBestand: PersonaBestand = {
  soort: 'plusmin-persona',
  schemaVersie: 1,
  persona: {
    naam: 'Amina',
    taal: 'nl',
    context: 'nieuwkomers',
    beschrijving: 'Persona voor roundtrip test',
    niveau: 3,
    startsaldo: 85,
    dobbelWaarden: {
      euro: 9,
      tweeEuro: 16,
      drieEuro: 24,
    },
    leefgeld: {
      boodschappen: 175,
      vervoer: 40,
      fun: 30,
      overig: 20,
    },
    vasteMutaties: [
      {
        naam: 'Uitkering',
        type: 'inkomsten',
        bedrag: 980,
        betaaldag: 21,
      },
    ],
    kansKaarten: [
      {
        tekst: 'Fietsband lek',
        soort: 'min',
        gevolg: -15,
      },
    ],
    plusMinKaarten: [
      {
        tekst: 'Koop je een cadeautje?',
        keuzeTekst1: 'Ja',
        gevolg1: -12,
        keuzeTekst2: 'Nee',
        gevolg2: 0,
        geenKeuzeTekst: 'Je twijfelt te lang',
        gevolgGeenKeuze: -3,
      },
    ],
  },
}

describe('import/export roundtrip', () => {
  it('kan een geëxporteerd bestand opnieuw importeren zonder dataverlies', async () => {
    const json = serializePersonaBestand(voorbeeldBestand)
    const file = new File([json], 'amina.pms', { type: 'application/json' })
    const [geimporteerd] = await importeerPersonaBestandenVanFiles([file])

    expect(geimporteerd.bestand).toEqual(voorbeeldBestand)
    expect(geimporteerd.metadata.naam).toBe('Amina')
  })
})