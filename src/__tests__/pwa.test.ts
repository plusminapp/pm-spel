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

  it('registreert de service worker op /sw.js in productie', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const getRegistrations = vi.fn().mockResolvedValue([])
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      configurable: true,
      value: { register, getRegistrations },
    })

    await registreerServiceWorker(true)

    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('deregistreert bestaande service workers in development', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const unregister = vi.fn().mockResolvedValue(true)
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }])
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      configurable: true,
      value: { register, getRegistrations },
    })

    await registreerServiceWorker(false)

    expect(getRegistrations).toHaveBeenCalled()
    expect(unregister).toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
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