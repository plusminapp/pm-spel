import type { IndexBestand, IndexBestandItem } from './types'
import { INDEX_BESTAND_SOORT, INDEX_SCHEMA_VERSIE } from './types'

export type IndexGenerationInput = Array<{
  pad: string
  naam: string
  taal: string
  context: string
  beschrijving: string
  niveau: number
  lastModified?: number
}>

/**
 * Generate a stable hash from file metadata
 * Ensures same input always produces same hash
 */
function berekenDirectoryHash(bestanden: IndexGenerationInput): string {
  // Sort by pad to ensure stability
  const sorted = [...bestanden].sort((a, b) => a.pad.localeCompare(b.pad))

  // Create stable input for hash: filename + lastModified timestamp
  const hashInput = sorted.map((b) => `${b.pad}|${b.lastModified || 0}`).join('\n')

  // Simple deterministic hash using character codes
  // In production, use crypto.subtle.digest('SHA-256', ...) or import tweetnacl
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Return as hex string
  return Math.abs(hash).toString(16).padStart(16, '0')
}

/**
 * Generate complete index.pms from scanned files
 */
export function genereeerIndex(input: IndexGenerationInput): IndexBestand {
  const bestanden: IndexBestandItem[] = input.map((bestand) => ({
    pad: bestand.pad,
    metadata: {
      naam: bestand.naam,
      taal: bestand.taal,
      context: bestand.context,
      beschrijving: bestand.beschrijving,
      niveau: bestand.niveau,
    },
  }))

  return {
    soort: INDEX_BESTAND_SOORT,
    schemaVersie: INDEX_SCHEMA_VERSIE,
    bijgewerktOp: new Date().toISOString(),
    directoryHash: berekenDirectoryHash(input),
    bestanden,
  }
}

/**
 * Export index as JSON string
 */
export function serializeIndex(index: IndexBestand): string {
  return JSON.stringify(index, null, 2)
}

/**
 * Create downloadable Blob for index.pms
 */
export function createIndexBlob(index: IndexBestand): Blob {
  const json = serializeIndex(index)
  return new Blob([json], { type: 'application/json' })
}

/**
 * Export index.pms and trigger download
 */
export function downloadIndex(index: IndexBestand): void {
  const blob = createIndexBlob(index)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'index.pms'
  link.click()
  URL.revokeObjectURL(url)
}
