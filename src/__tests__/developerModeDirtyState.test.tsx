import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PersonaRuntimeProvider } from '@/features/persona/runtime'
import type { GeimporteerdePersona } from '@/features/persona/types'
import { DeveloperModePage } from '@/pages/DeveloperModePage'

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
        dobbelWaarden: { euro: 8, tweeEuro: 15, drieEuro: 22 },
        leefgeld: { boodschappen: 168, vervoer: 42, fun: 35, overig: 28 },
        vasteMutaties: [],
        kansKaarten: [],
        plusMinKaarten: [],
      },
    },
  }
}

describe('DeveloperMode dirty state', () => {
  it('toont waarschuwing bij nieuwe persona met onopgeslagen wijzigingen', async () => {
    const user = userEvent.setup()

    render(
      <PersonaRuntimeProvider initialPersonas={[maakGeimporteerdePersona()]}>
        <DeveloperModePage />
      </PersonaRuntimeProvider>,
    )

    const naamInput = screen.getByLabelText(/naam/i)
    await user.clear(naamInput)
    await user.type(naamInput, 'Amina Nieuw')

    await user.click(screen.getByRole('button', { name: /nieuwe persona/i }))

    expect(screen.getByRole('heading', { name: /niet-opgeslagen wijzigingen/i })).toBeInTheDocument()
  })
})