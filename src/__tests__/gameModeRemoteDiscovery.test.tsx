import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PersonaRuntimeProvider } from '@/features/persona/runtime'
import { GameModePage } from '@/pages/GameModePage'

const INDEX_RESPONSE = JSON.stringify({
  soort: 'plusmin-index',
  schemaVersie: 1,
  bijgewerktOp: '2026-04-20T10:00:00.000Z',
  directoryHash: 'hash-123',
  bestanden: [
    {
      pad: 'amina.pms',
      metadata: {
        naam: 'Amina',
        taal: 'nl',
        context: 'nieuwkomers',
        beschrijving: 'Eerste remote persona',
        niveau: 2,
      },
    },
    {
      pad: 'noah.pms',
      metadata: {
        naam: 'Noah',
        taal: 'nl',
        context: 'jongeren',
        beschrijving: 'Tweede remote persona',
        niveau: 1,
      },
    },
  ],
})

const PERSONA_RESPONSE = JSON.stringify({
  soort: 'plusmin-persona',
  schemaVersie: 1,
  persona: {
    naam: 'Amina',
    taal: 'nl',
    context: 'nieuwkomers',
    beschrijving: 'Eerste remote persona',
    niveau: 2,
    startsaldo: 80,
    dobbelWaarden: { euro: 7, tweeEuro: 14, drieEuro: 21 },
    leefgeld: { boodschappen: 140, vervoer: 50, fun: 30, overig: 20 },
    vasteMutaties: [],
    kansKaarten: [{ tekst: 'Meevaller', soort: 'plus', gevolg: 10 }],
    plusMinKaarten: [],
  },
})

describe('GameModePage remote discovery', () => {
  it('laadt remote index, filtert metadata en haalt pas na selectie de persona op', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/index.pms')) {
        return new Response(INDEX_RESPONSE, { status: 200 })
      }

      if (url.endsWith('/amina.pms')) {
        return new Response(PERSONA_RESPONSE, { status: 200 })
      }

      return new Response('not found', { status: 404 })
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <PersonaRuntimeProvider>
        <GameModePage randomSource={() => 0} />
      </PersonaRuntimeProvider>,
    )

    await user.click(screen.getAllByRole('button', { name: /open mode/i })[0])
    await user.type(screen.getByLabelText(/index url/i), 'https://partner.example/index.pms')
    await user.click(screen.getByRole('button', { name: /laad index.pms/i }))

    expect(await screen.findByText(/index geladen: 2 persona's gevonden/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.type(screen.getByLabelText(/^context$/i), 'nieuwkomers')

    await waitFor(() => {
      expect(screen.getByText('Amina')).toBeInTheDocument()
      expect(screen.queryByText('Noah')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /laad persona/i }))

    expect(await screen.findByText(/persona geladen vanuit remote index: Amina/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('Startsaldo')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })
})