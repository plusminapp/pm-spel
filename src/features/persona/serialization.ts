import type { PersonaBestand } from './types'
import { valideerEnNormaliseerPersonaBestand } from './validation'

export function parsePersonaJson(inhoud: string): PersonaBestand {
  let waarde: unknown
  try {
    waarde = JSON.parse(inhoud)
  } catch (error) {
    throw new Error(`Ongeldige JSON: ${(error as Error).message}`)
  }

  return valideerEnNormaliseerPersonaBestand(waarde)
}

export function serializePersonaBestand(bestand: PersonaBestand): string {
  const genormaliseerd = valideerEnNormaliseerPersonaBestand(bestand)
  return `${JSON.stringify(genormaliseerd, null, 2)}\n`
}