import { describe, expect, it } from 'vitest'

import { bepaalToegestaneUrl, beschrijfBronmodus } from '@/features/persona/sourceMode'

describe('sourceMode', () => {
  it('laat dezelfde origin toe in curated mode', () => {
    const url = bepaalToegestaneUrl('/docs/index.pms', {
      modus: 'curated',
      huidigeOrigin: 'https://spel.plusmin.nl',
    })

    expect(url.toString()).toBe('https://spel.plusmin.nl/docs/index.pms')
  })

  it('blokkeert niet-gewhiteliste domeinen in curated mode', () => {
    expect(() =>
      bepaalToegestaneUrl('https://evil.example/index.pms', {
        modus: 'curated',
        huidigeOrigin: 'https://spel.plusmin.nl',
      }),
    ).toThrow(/curated mode/i)
  })

  it('laat allowlist domeinen toe in curated mode', () => {
    const url = bepaalToegestaneUrl('https://partner.example/index.pms', {
      modus: 'curated',
      huidigeOrigin: 'https://spel.plusmin.nl',
      allowlist: ['https://partner.example'],
    })

    expect(url.origin).toBe('https://partner.example')
  })

  it('laat alle https bronnen toe in open mode', () => {
    const url = bepaalToegestaneUrl('https://open.example/index.pms', {
      modus: 'open',
      huidigeOrigin: 'https://spel.plusmin.nl',
    })

    expect(url.origin).toBe('https://open.example')
  })

  it('geeft duidelijke modus-uitleg terug', () => {
    expect(beschrijfBronmodus('curated')).toMatch(/zelfde origin/i)
    expect(beschrijfBronmodus('open')).toMatch(/vertrouwt/i)
  })
})