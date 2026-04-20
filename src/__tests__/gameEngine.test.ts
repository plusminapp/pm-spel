import { describe, expect, it } from 'vitest'

import { initialiseerSpelStatus, verwerkPlusMinKeuze, voerDobbelActieUit } from '@/features/game/engine'
import type { Persona } from '@/features/persona/types'

function maakPersona(): Persona {
  return {
    naam: 'Test',
    taal: 'nl',
    context: 'jongeren',
    beschrijving: 'Engine test persona',
    niveau: 1,
    startsaldo: 10,
    dobbelWaarden: {
      euro: 7,
      tweeEuro: 12,
      drieEuro: 20,
    },
    leefgeld: {
      boodschappen: 140,
      vervoer: 35,
      fun: 20,
      overig: 15,
    },
    vasteMutaties: [],
    kansKaarten: [
      { tekst: 'Plus A', soort: 'plus', gevolg: 5 },
      { tekst: 'Plus B', soort: 'plus', gevolg: 9 },
      { tekst: 'Min A', soort: 'min', gevolg: -8 },
    ],
    plusMinKaarten: [
      {
        tekst: 'PlusMin test',
        keuzeTekst1: 'Optie 1',
        gevolg1: 11,
        keuzeTekst2: 'Optie 2',
        gevolg2: -6,
        geenKeuzeTekst: 'Geen keuze',
        gevolgGeenKeuze: -2,
      },
    ],
  }
}

describe('game engine', () => {
  it('trekt zonder teruglegging en reset deck als het op is', () => {
    const persona = maakPersona()
    const random = () => 0
    let status = initialiseerSpelStatus(persona, random)

    status = voerDobbelActieUit(status, persona, 'PLUS', random)
    const eerste = status.laatsteResultaat?.tekst

    status = voerDobbelActieUit(status, persona, 'PLUS', random)
    const tweede = status.laatsteResultaat?.tekst

    status = voerDobbelActieUit(status, persona, 'PLUS', random)
    const derde = status.laatsteResultaat?.tekst

    expect(eerste).not.toBe(tweede)
    expect(derde).toBe(eerste)
  })

  it('verwerkt PlusMin keuze en geen-keuze pad', () => {
    const persona = maakPersona()
    const random = () => 0
    let status = initialiseerSpelStatus(persona, random)

    status = voerDobbelActieUit(status, persona, 'PLUSMIN', random)
    expect(status.wachtOpPlusMinKeuze?.tekst).toBe('PlusMin test')

    status = verwerkPlusMinKeuze(status, 'keuze2')
    expect(status.wachtOpPlusMinKeuze).toBeNull()
    expect(status.laatsteResultaat?.bedrag).toBe(-6)

    status = voerDobbelActieUit(status, persona, 'PLUSMIN', random)
    status = verwerkPlusMinKeuze(status, 'geenkeuze')
    expect(status.laatsteResultaat?.tekst).toBe('Geen keuze')
    expect(status.laatsteResultaat?.bedrag).toBe(-2)
  })

  it('koppelt dobbelsteen-symbolen aan juiste acties', () => {
    const persona = maakPersona()
    const random = () => 0
    let status = initialiseerSpelStatus(persona, random)

    status = voerDobbelActieUit(status, persona, '?', random)
    expect(status.laatsteResultaat?.soort).toBe('boodschappen')
    expect(status.laatsteResultaat?.bedrag).toBe(-7)

    status = voerDobbelActieUit(status, persona, 'MIN', random)
    expect(status.laatsteResultaat?.soort).toBe('min')
    expect(status.laatsteResultaat?.tekst).toBe('Min A')
  })

  it('blokkeert nieuwe dobbelactie totdat plusmin keuze is verwerkt', () => {
    const persona = maakPersona()
    const random = () => 0
    const start = initialiseerSpelStatus(persona, random)
    const metPlusMin = voerDobbelActieUit(start, persona, 'PLUSMIN', random)
    const blokResultaat = voerDobbelActieUit(metPlusMin, persona, 'PLUS', random)

    expect(blokResultaat.laatsteResultaat?.soort).toBe('wacht-op-keuze')
    expect(blokResultaat.laatsteResultaat?.tekst).toMatch(/kies eerst/i)
  })

  it('toont duidelijk resultaat als er geen plus kaarten zijn', () => {
    const persona: Persona = {
      ...maakPersona(),
      kansKaarten: [
        { tekst: 'Alleen min', soort: 'min', gevolg: -4 },
      ],
    }
    const random = () => 0
    const start = initialiseerSpelStatus(persona, random)
    const resultaat = voerDobbelActieUit(start, persona, 'PLUS', random)

    expect(resultaat.laatsteResultaat?.titel).toMatch(/geen plus-kaarten/i)
    expect(resultaat.laatsteResultaat?.bedrag).toBe(0)
  })
})