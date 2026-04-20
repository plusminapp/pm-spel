import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

  it('manifest bevat installeerbare basisvelden', () => {
    const pad = resolve(process.cwd(), 'public/manifest.webmanifest')
    const inhoud = readFileSync(pad, 'utf-8')
    const manifest = JSON.parse(inhoud) as Record<string, unknown>

    expect(manifest.name).toBe('PlusMin Spel')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(Array.isArray(manifest.icons)).toBe(true)
  })
})