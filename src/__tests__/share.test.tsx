import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('qrcode', () => ({
  default: {
    toString: vi.fn().mockResolvedValue('<svg role="img" aria-label="QR"><rect width="10" height="10" /></svg>'),
  },
}))

import { ShareQrCard } from '@/components/ShareQrCard'
import { leesPersonaDeelLink, maakPersonaDeelUrl } from '@/features/persona/share'

describe('share flow', () => {
  it('maakt een reproduceerbare deel-url', () => {
    const shareUrl = maakPersonaDeelUrl('https://partner.example/personas/amina.pms', 'https://spel.plusmin.nl/', 'curated')

    expect(shareUrl).toContain('personaUrl=https%3A%2F%2Fpartner.example%2Fpersonas%2Famina.pms')
    expect(shareUrl).toContain('mode=curated')
  })

  it('leest de deel-url weer correct terug', () => {
    const result = leesPersonaDeelLink(
      'https://spel.plusmin.nl/?personaUrl=https%3A%2F%2Fpartner.example%2Fpersonas%2Famina.pms&mode=open',
    )

    expect(result.personaUrl).toBe('https://partner.example/personas/amina.pms')
    expect(result.modus).toBe('open')
  })

  it('triggert QR-rendering voor de share component', async () => {
    render(<ShareQrCard shareUrl="https://spel.plusmin.nl/?personaUrl=test&mode=curated" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/persona qr-code/i)).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue(/personaUrl=test/i)).toBeInTheDocument()
  })
})