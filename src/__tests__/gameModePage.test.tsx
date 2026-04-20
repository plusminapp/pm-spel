import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PersonaRuntimeProvider } from '@/features/persona/runtime'
import type { GeimporteerdePersona } from '@/features/persona/types'
import { GameModePage } from '@/pages/GameModePage'

function maakGeimporteerdePersona(): GeimporteerdePersona {
  return {
    id: 'persona-1',
    bronLabel: 'test.pms',
    bronType: 'lokaal',
    metadata: {
      naam: 'Amina',
      taal: 'nl',
      context: 'nieuwkomers',
      beschrijving: 'Demo persona',
      niveau: 2,
    },
    bestand: {
      soort: 'plusmin-persona',
      schemaVersie: 1,
      persona: {
        naam: 'Amina',
        taal: 'nl',
        context: 'nieuwkomers',
        beschrijving: 'Demo persona',
        niveau: 2,
        startsaldo: 100,
        dobbelWaarden: {
          euro: 8,
          tweeEuro: 15,
          drieEuro: 22,
        },
        leefgeld: {
          boodschappen: 168,
          vervoer: 42,
          fun: 35,
          overig: 28,
        },
        vasteMutaties: [],
        kansKaarten: [
          { tekst: 'Meevaller', soort: 'plus', gevolg: 10 },
        ],
        plusMinKaarten: [
          {
            tekst: 'Keuze kaart',
            keuzeTekst1: 'Ja',
            gevolg1: 5,
            keuzeTekst2: 'Nee',
            gevolg2: -5,
            geenKeuzeTekst: 'Geen reactie',
            gevolgGeenKeuze: -2,
          },
        ],
      },
    },
  }
}

describe('GameModePage', () => {
  it('laat persona kiezen en toont kaartresultaat na dobbelactie', async () => {
    const user = userEvent.setup()

    render(
      <PersonaRuntimeProvider initialPersonas={[maakGeimporteerdePersona()]}>
        <GameModePage randomSource={() => 0} />
      </PersonaRuntimeProvider>,
    )

    await user.click(screen.getByRole('button', { name: /amina/i }))
    await user.click(screen.getByRole('button', { name: 'Plus' }))

    expect(screen.getByText('Plus-kaart')).toBeInTheDocument()
    expect(screen.getByText('Meevaller')).toBeInTheDocument()
  })
})