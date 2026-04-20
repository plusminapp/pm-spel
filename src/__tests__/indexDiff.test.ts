import { describe, it, expect } from 'vitest'
import { vergelijkIndexMetScan, formateerDiffReport } from '@/features/persona/indexDiff'
import type { IndexBestand } from '@/features/persona/types'

describe('indexDiff', () => {
  const createMetadata = (naam: string, context = 'test') => ({
    naam,
    taal: 'nl',
    context,
    beschrijving: `Beschrijving van ${naam}`,
    niveau: 1,
  })

  it('detecteert nieuwe bestanden', () => {
    const scan = [
      {
        pad: 'persona1.pms',
        metadata: createMetadata('Persona 1'),
      },
      {
        pad: 'persona2.pms',
        metadata: createMetadata('Persona 2'),
      },
    ]

    const diff = vergelijkIndexMetScan(scan, null)

    expect(diff.nieuweBestanden).toHaveLength(2)
    expect(diff.verwijderdeBestanden).toHaveLength(0)
    expect(diff.gewijzigdeBestanden).toHaveLength(0)
  })

  it('detecteert verwijderde bestanden', () => {
    const index: IndexBestand = {
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: new Date().toISOString(),
      directoryHash: 'abc123',
      bestanden: [
        {
          pad: 'persona1.pms',
          metadata: createMetadata('Persona 1'),
        },
      ],
    }

    const scan = [] // Geen bestanden

    const diff = vergelijkIndexMetScan(scan, index)

    expect(diff.nieuweBestanden).toHaveLength(0)
    expect(diff.verwijderdeBestanden).toHaveLength(1)
    expect(diff.verwijderdeBestanden[0].pad).toBe('persona1.pms')
  })

  it('detecteert gewijzigde metadata', () => {
    const index: IndexBestand = {
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: new Date().toISOString(),
      directoryHash: 'abc123',
      bestanden: [
        {
          pad: 'persona1.pms',
          metadata: {
            naam: 'Persona 1 - Oud',
            taal: 'nl',
            context: 'test',
            beschrijving: 'Oude beschrijving',
            niveau: 1,
          },
        },
      ],
    }

    const scan = [
      {
        pad: 'persona1.pms',
        metadata: {
          naam: 'Persona 1 - Nieuw', // wijziging
          taal: 'nl',
          context: 'test',
          beschrijving: 'Oude beschrijving',
          niveau: 1,
        },
      },
    ]

    const diff = vergelijkIndexMetScan(scan, index)

    expect(diff.gewijzigdeBestanden).toHaveLength(1)
    expect(diff.gewijzigdeBestanden[0].wijzigingen).toContain('naam')
  })

  it('detecteert ongewijzigde bestanden', () => {
    const metadata = createMetadata('Persona 1')
    const index: IndexBestand = {
      soort: 'plusmin-index',
      schemaVersie: 1,
      bijgewerktOp: new Date().toISOString(),
      directoryHash: 'abc123',
      bestanden: [
        {
          pad: 'persona1.pms',
          metadata,
        },
      ],
    }

    const scan = [
      {
        pad: 'persona1.pms',
        metadata,
      },
    ]

    const diff = vergelijkIndexMetScan(scan, index)

    expect(diff.ongewijzigdeBestanden).toHaveLength(1)
    expect(diff.gewijzigdeBestanden).toHaveLength(0)
  })

  it('formatteert diff report als leesbare tekst', () => {
    const scan = [
      {
        pad: 'nieuwe.pms',
        metadata: createMetadata('Nieuwe Persona'),
      },
    ]

    const diff = vergelijkIndexMetScan(scan, null)
    const formatted = formateerDiffReport(diff)

    expect(formatted).toContain('🆕 Nieuwe bestanden')
    expect(formatted).toContain('Nieuwe Persona')
    expect(formatted).toContain('nieuwe.pms')
  })
})
