import type { KansKaart, Persona, PlusMinKaart } from '@/features/persona/types'

export type DobbelSymbool = '?' | '??' | '???' | 'PLUS' | 'MIN' | 'PLUSMIN'
export type PlusMinKeuze = 'keuze1' | 'keuze2' | 'geenkeuze'

type RandomSource = () => number

type Deck<T> = {
  kaarten: T[]
  resterende: number[]
}

export type SpelResultaat = {
  soort: 'boodschappen' | 'plus' | 'min' | 'plusmin' | 'wacht-op-keuze'
  titel: string
  tekst: string
  bedrag: number
}

export type SpelStatus = {
  plusDeck: Deck<KansKaart>
  minDeck: Deck<KansKaart>
  plusMinDeck: Deck<PlusMinKaart>
  wachtOpPlusMinKeuze: PlusMinKaart | null
  laatsteResultaat: SpelResultaat | null
}

function shuffleIndices(aantal: number, random: RandomSource): number[] {
  const indices = Array.from({ length: aantal }, (_, index) => index)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function maakDeck<T>(kaarten: T[], random: RandomSource): Deck<T> {
  return {
    kaarten,
    resterende: shuffleIndices(kaarten.length, random),
  }
}

function trekUitDeck<T>(deck: Deck<T>, random: RandomSource): { kaart: T | null; deck: Deck<T> } {
  if (deck.kaarten.length === 0) {
    return { kaart: null, deck }
  }

  if (deck.resterende.length === 0) {
    const herstart = shuffleIndices(deck.kaarten.length, random)
    const [eerste, ...rest] = herstart
    return {
      kaart: deck.kaarten[eerste],
      deck: {
        kaarten: deck.kaarten,
        resterende: rest,
      },
    }
  }

  const [eerste, ...rest] = deck.resterende
  return {
    kaart: deck.kaarten[eerste],
    deck: {
      kaarten: deck.kaarten,
      resterende: rest,
    },
  }
}

export function initialiseerSpelStatus(persona: Persona, random: RandomSource = Math.random): SpelStatus {
  return {
    plusDeck: maakDeck(persona.kansKaarten.filter((kaart) => kaart.soort === 'plus'), random),
    minDeck: maakDeck(persona.kansKaarten.filter((kaart) => kaart.soort === 'min'), random),
    plusMinDeck: maakDeck(persona.plusMinKaarten, random),
    wachtOpPlusMinKeuze: null,
    laatsteResultaat: null,
  }
}

export function voerDobbelActieUit(
  status: SpelStatus,
  persona: Persona,
  symbool: DobbelSymbool,
  random: RandomSource = Math.random,
): SpelStatus {
  if (status.wachtOpPlusMinKeuze) {
    return {
      ...status,
      laatsteResultaat: {
        soort: 'wacht-op-keuze',
        titel: 'Maak eerst je PlusMin-keuze',
        tekst: 'Kies eerst een uitkomst of gebruik de knop Geen keuze.',
        bedrag: 0,
      },
    }
  }

  if (symbool === '?' || symbool === '??' || symbool === '???') {
    const bedrag = symbool === '?'
      ? persona.dobbelWaarden.euro
      : symbool === '??'
        ? persona.dobbelWaarden.tweeEuro
        : persona.dobbelWaarden.drieEuro

    return {
      ...status,
      laatsteResultaat: {
        soort: 'boodschappen',
        titel: `Boodschappen met ${symbool}`,
        tekst: `Deze beurt besteed je ${bedrag} aan boodschappen.`,
        bedrag: -Math.abs(bedrag),
      },
    }
  }

  if (symbool === 'PLUS') {
    const { kaart, deck } = trekUitDeck(status.plusDeck, random)
    if (!kaart) {
      return {
        ...status,
        plusDeck: deck,
        laatsteResultaat: {
          soort: 'plus',
          titel: 'Geen Plus-kaarten beschikbaar',
          tekst: 'De gekozen persona bevat geen Plus-kaarten.',
          bedrag: 0,
        },
      }
    }

    return {
      ...status,
      plusDeck: deck,
      laatsteResultaat: {
        soort: 'plus',
        titel: 'Plus-kaart',
        tekst: kaart.tekst,
        bedrag: kaart.gevolg,
      },
    }
  }

  if (symbool === 'MIN') {
    const { kaart, deck } = trekUitDeck(status.minDeck, random)
    if (!kaart) {
      return {
        ...status,
        minDeck: deck,
        laatsteResultaat: {
          soort: 'min',
          titel: 'Geen Min-kaarten beschikbaar',
          tekst: 'De gekozen persona bevat geen Min-kaarten.',
          bedrag: 0,
        },
      }
    }

    return {
      ...status,
      minDeck: deck,
      laatsteResultaat: {
        soort: 'min',
        titel: 'Min-kaart',
        tekst: kaart.tekst,
        bedrag: kaart.gevolg,
      },
    }
  }

  const { kaart, deck } = trekUitDeck(status.plusMinDeck, random)
  if (!kaart) {
    return {
      ...status,
      plusMinDeck: deck,
      laatsteResultaat: {
        soort: 'plusmin',
        titel: 'Geen PlusMin-kaarten beschikbaar',
        tekst: 'De gekozen persona bevat geen PlusMin-kaarten.',
        bedrag: 0,
      },
    }
  }

  return {
    ...status,
    plusMinDeck: deck,
    wachtOpPlusMinKeuze: kaart,
    laatsteResultaat: {
      soort: 'plusmin',
      titel: 'PlusMin-kaart',
      tekst: kaart.tekst,
      bedrag: 0,
    },
  }
}

export function verwerkPlusMinKeuze(status: SpelStatus, keuze: PlusMinKeuze): SpelStatus {
  if (!status.wachtOpPlusMinKeuze) {
    return {
      ...status,
      laatsteResultaat: {
        soort: 'wacht-op-keuze',
        titel: 'Geen actieve PlusMin-kaart',
        tekst: 'Er is op dit moment geen PlusMin-kaart om op te reageren.',
        bedrag: 0,
      },
    }
  }

  const kaart = status.wachtOpPlusMinKeuze
  const uitkomst = keuze === 'keuze1'
    ? { tekst: kaart.keuzeTekst1, bedrag: kaart.gevolg1 }
    : keuze === 'keuze2'
      ? { tekst: kaart.keuzeTekst2, bedrag: kaart.gevolg2 }
      : { tekst: kaart.geenKeuzeTekst, bedrag: kaart.gevolgGeenKeuze }

  return {
    ...status,
    wachtOpPlusMinKeuze: null,
    laatsteResultaat: {
      soort: 'plusmin',
      titel: keuze === 'geenkeuze' ? 'Geen keuze gemaakt' : 'PlusMin keuze verwerkt',
      tekst: uitkomst.tekst,
      bedrag: uitkomst.bedrag,
    },
  }
}