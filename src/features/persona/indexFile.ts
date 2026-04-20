import { valideerIndexBestand } from './validation'
import type { IndexBestand } from './types'

export function parseIndexJson(inhoud: string): IndexBestand {
  let waarde: unknown
  try {
    waarde = JSON.parse(inhoud)
  } catch (error) {
    throw new Error(`Ongeldige JSON: ${(error as Error).message}`)
  }

  return valideerIndexBestand(waarde)
}