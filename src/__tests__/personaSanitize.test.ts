import { describe, expect, it } from 'vitest'

import { valideerEnNormaliseerPersonaBestand } from '@/features/persona/validation'

describe('sanitization', () => {
  it('verwijdert html en onveilige protocollen uit tekstvelden', () => {
    const resultaat = valideerEnNormaliseerPersonaBestand({
      soort: 'plusmin-persona',
      schemaVersie: 1,
      persona: {
        naam: '<script>alert(1)</script> Sam',
        taal: 'nl',
        context: 'nieuwkomers',
        beschrijving: 'Klik javascript:alert(1) niet aan',
        niveau: 1,
        startsaldo: 0,
        dobbelWaarden: { euro: 5, tweeEuro: 10, drieEuro: 15 },
        leefgeld: { boodschappen: 140, vervoer: 35, fun: 20, overig: 15 },
        vasteMutaties: [],
        kansKaarten: [{ tekst: '<b>Bonus</b>', soort: '+', gevolg: 10 }],
        plusMinKaarten: [{
          tekst: '<img src=x onerror=alert(1)> Kies',
          keuzeTekst1: 'Ja',
          gevolg1: 1,
          keuzeTekst2: 'Nee',
          gevolg2: -1,
          geenKeuzeTekst: 'Niets',
          gevolgGeenKeuze: 0,
        }],
      },
    })

    expect(resultaat.persona.naam).toBe('alert(1) Sam')
    expect(resultaat.persona.beschrijving).not.toMatch(/javascript:/i)
    expect(resultaat.persona.kansKaarten[0].tekst).toBe('Bonus')
    expect(resultaat.persona.plusMinKaarten[0].tekst).toBe('Kies')
  })
})