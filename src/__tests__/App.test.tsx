import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, vi } from 'vitest'

import App from '../App'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App shell routes', () => {
  it('shows spelmodus by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /spelmodus/i })).toBeInTheDocument()
  })

  it('opens help route and renders help loading state', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>(() => undefined)
    )

    render(
      <MemoryRouter initialEntries={['/help']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/handleiding wordt geladen/i)).toBeInTheDocument()
  })
})
