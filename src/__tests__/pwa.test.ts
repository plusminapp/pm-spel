import { describe, expect, it, vi } from 'vitest'

import { kanServiceWorkerRegistreren, registreerServiceWorker } from '@/features/pwa/register'

describe('pwa registration', () => {
  it('detecteert service worker ondersteuning', () => {
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      configurable: true,
      value: { register: vi.fn() },
    })

    expect(kanServiceWorkerRegistreren()).toBe(true)
  })

  it('registreert de service worker op /sw.js', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    await registreerServiceWorker()

    expect(register).toHaveBeenCalledWith('/sw.js')
  })
})