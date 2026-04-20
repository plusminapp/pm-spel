import { useEffect, useState } from 'react'
import type { Persona } from '../persona/types'

/**
 * Hook to track dirty state (unsaved changes) in persona editor
 * Returns state and operations to manage dirty state
 */
export function useDirtyState(originalPersona: Persona | null) {
  const [editingPersona, setEditingPersona] = useState<Persona | null>(originalPersona)
  const [isDirty, setIsDirty] = useState(false)

  // Update when original changes
  useEffect(() => {
    setEditingPersona(originalPersona)
    setIsDirty(false)
  }, [originalPersona])

  // Setup beforeunload warning when dirty
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const updatePersona = (updater: (prev: Persona) => Persona) => {
    setEditingPersona((prev) => {
      const updated = updater(prev || createEmptyPersona())
      setIsDirty(hasChanges(originalPersona, updated))
      return updated
    })
  }

  const markClean = () => {
    setEditingPersona(originalPersona)
    setIsDirty(false)
  }

  const reset = () => {
    setEditingPersona(originalPersona)
    setIsDirty(false)
  }

  return {
    editingPersona,
    updatePersona,
    isDirty,
    markClean,
    reset,
  }
}

/**
 * Check if two personas have substantive differences
 */
function hasChanges(original: Persona | null, current: Persona | null): boolean {
  if (original === null || current === null) {
    return original !== current
  }

  // Deep comparison of all persona fields
  return (
    original.naam !== current.naam ||
    original.taal !== current.taal ||
    original.context !== current.context ||
    original.beschrijving !== current.beschrijving ||
    original.niveau !== current.niveau ||
    original.startsaldo !== current.startsaldo ||
    original.dobbelWaarden.euro !== current.dobbelWaarden.euro ||
    original.dobbelWaarden.tweeEuro !== current.dobbelWaarden.tweeEuro ||
    original.dobbelWaarden.drieEuro !== current.dobbelWaarden.drieEuro ||
    original.leefgeld.boodschappen !== current.leefgeld.boodschappen ||
    original.leefgeld.vervoer !== current.leefgeld.vervoer ||
    original.leefgeld.fun !== current.leefgeld.fun ||
    original.leefgeld.overig !== current.leefgeld.overig ||
    !arrayEquals(original.vasteMutaties, current.vasteMutaties) ||
    !arrayEquals(original.kansKaarten, current.kansKaarten) ||
    !arrayEquals(original.plusMinKaarten, current.plusMinKaarten)
  )
}

/**
 * Check if two arrays are deeply equal
 */
function arrayEquals<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, index) => JSON.stringify(item) === JSON.stringify(b[index]))
}

/**
 * Create an empty persona for new entries
 */
export function createEmptyPersona(): Persona {
  return {
    naam: '',
    taal: '',
    context: '',
    beschrijving: '',
    niveau: 1,
    startsaldo: 0,
    dobbelWaarden: {
      euro: 0,
      tweeEuro: 0,
      drieEuro: 0,
    },
    leefgeld: {
      boodschappen: 0,
      vervoer: 0,
      fun: 0,
      overig: 0,
    },
    vasteMutaties: [],
    kansKaarten: [],
    plusMinKaarten: [],
  }
}
