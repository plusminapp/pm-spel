import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDirtyState, createEmptyPersona } from '@/features/developer/editorState'
import type { Persona } from '@/features/persona/types'

describe('editorState', () => {
  const createTestPersona = (overrides?: Partial<Persona>): Persona => ({
    naam: 'Test Persona',
    taal: 'nl',
    context: 'test',
    beschrijving: 'A test persona',
    niveau: 1,
    startsaldo: 100,
    dobbelWaarden: {
      euro: 1,
      tweeEuro: 2,
      drieEuro: 3,
    },
    leefgeld: {
      boodschappen: 100,
      vervoer: 50,
      fun: 30,
      overig: 20,
    },
    vasteMutaties: [],
    kansKaarten: [],
    plusMinKaarten: [],
    ...overrides,
  })

  describe('useDirtyState', () => {
    it('initialiseert met isDirty = false', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      expect(result.current.isDirty).toBe(false)
    })

    it('detecteert wijzigingen in persona velden', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          naam: 'Gewijzigde Naam',
        }))
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('trackingNaam wijzigingen', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          naam: 'Nieuw',
        }))
      })

      expect(result.current.editingPersona?.naam).toBe('Nieuw')
      expect(result.current.isDirty).toBe(true)
    })

    it('detecteert wijzigingen in geneste velden (dobbelWaarden)', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          dobbelWaarden: {
            ...p.dobbelWaarden,
            euro: 5,
          },
        }))
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('markClean zet isDirty terug naar false', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          naam: 'Gewijzigd',
        }))
      })

      expect(result.current.isDirty).toBe(true)

      act(() => {
        result.current.markClean()
      })

      expect(result.current.isDirty).toBe(false)
    })

    it('reset zet editing terug naar original', () => {
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          naam: 'Gewijzigd',
        }))
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.editingPersona?.naam).toBe('Test Persona')
      expect(result.current.isDirty).toBe(false)
    })

    it('update van original persona stelt editing opnieuw in', () => {
      const persona1 = createTestPersona({ naam: 'Persona 1' })
      const { result, rerender } = renderHook(({ p }) => useDirtyState(p), {
        initialProps: { p: persona1 },
      })

      const persona2 = createTestPersona({ naam: 'Persona 2' })
      rerender({ p: persona2 })

      expect(result.current.editingPersona?.naam).toBe('Persona 2')
      expect(result.current.isDirty).toBe(false)
    })

    it('null original stelt editingPersona ook op null', () => {
      const { result } = renderHook(() => useDirtyState(null))

      expect(result.current.editingPersona).toBe(null)
    })

    it('detecteert array wijzigingen (vasteMutaties)', () => {
      const persona = createTestPersona({
        vasteMutaties: [
          { naam: 'Huur', type: 'uitgave', bedrag: 500, betaaldag: 1 },
        ],
      })
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          vasteMutaties: [
            ...p.vasteMutaties,
            { naam: 'Nieuw', type: 'inkomsten', bedrag: 100, betaaldag: 15 },
          ],
        }))
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('beforeunload event listener wordt geregistreerd bij isDirty', () => {
      const addListenerSpy = vi.spyOn(window, 'addEventListener')
      const persona = createTestPersona()
      const { result } = renderHook(() => useDirtyState(persona))

      act(() => {
        result.current.updatePersona((p) => ({
          ...p,
          naam: 'Gewijzigd',
        }))
      })

      expect(addListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

      addListenerSpy.mockRestore()
    })
  })

  describe('createEmptyPersona', () => {
    it('maakt een lege persona met defaults', () => {
      const persona = createEmptyPersona()

      expect(persona.naam).toBe('')
      expect(persona.taal).toBe('')
      expect(persona.context).toBe('')
      expect(persona.beschrijving).toBe('')
      expect(persona.niveau).toBe(1)
      expect(persona.startsaldo).toBe(0)
    })

    it('initialiseert lege arrays', () => {
      const persona = createEmptyPersona()

      expect(persona.vasteMutaties).toEqual([])
      expect(persona.kansKaarten).toEqual([])
      expect(persona.plusMinKaarten).toEqual([])
    })

    it('initialiseert nulbedragen', () => {
      const persona = createEmptyPersona()

      expect(persona.dobbelWaarden.euro).toBe(0)
      expect(persona.leefgeld.boodschappen).toBe(0)
    })
  })
})
