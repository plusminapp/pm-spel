import { describe, expect, it } from 'vitest'

import { PersonaValidatieFout } from '@/features/persona/errors'
import { valideerEnNormaliseerPersonaBestand } from '@/features/persona/validation'

function maakGeldigBestand() {
  return {
    soort: 'plusmin-persona',
    schemaVersie: 1,
    persona: {
      naam: 'Starter',
      taal: 'nl',
      context: 'jongeren',
      beschrijving: 'Basispersona voor tests',
      niveau: 2,
      startsaldo: 125,
      dobbelWaarden: {
        euro: 10,
        tweeEuro: 20,
        drieEuro: 35,
      },
      leefgeld: {
        boodschappen: 210,
        vervoer: 60,
        fun: 45,
        overig: 35,
      },
      vasteMutaties: [
        {
          naam: 'Salaris',
          type: 'inkomsten',
          bedrag: 1450,
          betaaldag: 25,
        },
      ],
      kansKaarten: [
        {
          tekst: 'Meevaller',
          soort: 'plus',
          gevolg: 25,
        },
      ],
      plusMinKaarten: [
        {
          tekst: 'Je vriend vraagt hulp',
          keuzeTekst1: 'Leen geld uit',
          gevolg1: -20,
          keuzeTekst2: 'Leg uit dat het niet kan',
          gevolg2: 5,
          geenKeuzeTekst: 'Je reageert niet',
          gevolgGeenKeuze: -10,
        },
      ],
    },
  }
}

describe('valideerEnNormaliseerPersonaBestand', () => {
  it('normaliseert een geldig persona-bestand', () => {
    const resultaat = valideerEnNormaliseerPersonaBestand(maakGeldigBestand())

    expect(resultaat.persona.naam).toBe('Starter')
    expect(resultaat.persona.vasteMutaties[0].type).toBe('inkomsten')
  })

  it('weigert ongeldige betaaldagen', () => {
    const invoer = maakGeldigBestand()
    invoer.persona.vasteMutaties[0].betaaldag = 40

    expect(() => valideerEnNormaliseerPersonaBestand(invoer)).toThrow(PersonaValidatieFout)
    expect(() => valideerEnNormaliseerPersonaBestand(invoer)).toThrow(/betaaldag moet tussen 1 en 28 liggen/i)
  })
})