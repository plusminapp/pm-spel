import { describe, expect, it } from 'vitest'

import { parseIndexJson } from '@/features/persona/indexFile'

describe('index validation edge cases', () => {
  it('wijst index af met ongeldige timestamp', () => {
    const index = JSON.stringify({
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: 'geen-datum',
      directoryHash: 'abc',
      bestanden: [],
    })

    expect(() => parseIndexJson(index)).toThrow(/geldige ISO timestamp/i)
  })

  it('wijst index af met lege metadata velden', () => {
    const index = JSON.stringify({
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: '2026-04-20T10:00:00.000Z',
      directoryHash: 'abc',
      bestanden: [
        {
          pad: 'a.pms',
          metadata: {
            naam: '',
            taal: 'nl',
            context: 'x',
            beschrijving: 'x',
            niveau: 1,
          },
        },
      ],
    })

    expect(() => parseIndexJson(index)).toThrow(/mag niet leeg zijn/i)
  })
})
