import { describe, it, expect } from 'vitest'
import { genereeerIndex, serializeIndex } from '@/features/persona/indexGenerate'
import type { IndexGenerationInput } from '@/features/persona/indexGenerate'

describe('indexGenerate', () => {
  const createInput = (count: number): IndexGenerationInput => {
    return Array.from({ length: count }, (_, i) => ({
      pad: `persona${i + 1}.pms`,
      naam: `Persona ${i + 1}`,
      taal: 'nl',
      context: 'test',
      beschrijving: `Test persona ${i + 1}`,
      niveau: 1,
      lastModified: 1000000000 + i * 1000,
    }))
  }

  it('genereert index met alle verplichte velden', () => {
    const input = createInput(2)
    const index = genereeerIndex(input)

    expect(index.soort).toBe('plusmin-index')
    expect(index.schemaVersie).toBe(1)
    expect(index.bijgewerktOp).toBeDefined()
    expect(index.directoryHash).toBeDefined()
    expect(index.bestanden).toHaveLength(2)
  })

  it('stelt bijgewerktOp in als ISO timestamp', () => {
    const input = createInput(1)
    const index = genereeerIndex(input)

    const timestamp = new Date(index.bijgewerktOp)
    expect(timestamp.getTime()).toBeGreaterThan(0)
    expect(index.bijgewerktOp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('berekent stabiele hash (zelfde input = zelfde hash)', () => {
    const input = createInput(2)

    const index1 = genereeerIndex(input)
    const index2 = genereeerIndex(input)

    expect(index1.directoryHash).toBe(index2.directoryHash)
  })

  it('hash verandert bij gewijzigde bestanden', () => {
    const input1 = createInput(1)
    const input2 = [{ ...input1[0], lastModified: 2000000000 }]

    const index1 = genereeerIndex(input1)
    const index2 = genereeerIndex(input2)

    expect(index1.directoryHash).not.toBe(index2.directoryHash)
  })

  it('bewaart metadata in bestanden', () => {
    const input = createInput(1)
    const index = genereeerIndex(input)

    const item = index.bestanden[0]
    expect(item.pad).toBe('persona1.pms')
    expect(item.metadata.naam).toBe('Persona 1')
    expect(item.metadata.taal).toBe('nl')
    expect(item.metadata.context).toBe('test')
    expect(item.metadata.beschrijving).toContain('Test persona 1')
    expect(item.metadata.niveau).toBe(1)
  })

  it('serialiseert index als valid JSON', () => {
    const input = createInput(1)
    const index = genereeerIndex(input)
    const json = serializeIndex(index)

    const parsed = JSON.parse(json)
    expect(parsed.soort).toBe('plusmin-index')
    expect(parsed.bestanden).toHaveLength(1)
  })

  it('sorteert bestanden op pad voor stabiele hash', () => {
    // Input in willekeurige volgorde
    const input: IndexGenerationInput = [
      {
        pad: 'z.pms',
        naam: 'Z Persona',
        taal: 'nl',
        context: 'test',
        beschrijving: 'Z',
        niveau: 1,
      },
      {
        pad: 'a.pms',
        naam: 'A Persona',
        taal: 'nl',
        context: 'test',
        beschrijving: 'A',
        niveau: 1,
      },
    ]

    const input2 = [...input].reverse() // Omgekeerde volgorde

    const index1 = genereeerIndex(input)
    const index2 = genereeerIndex(input2)

    expect(index1.directoryHash).toBe(index2.directoryHash)
  })
})
