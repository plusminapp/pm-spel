import type { IndexBestand, IndexBestandItem, PersonaMetadata } from './types'

/**
 * Rappresentation of a single file in a directory scan
 */
export type ScannedFile = {
  pad: string
  metadata: PersonaMetadata
  lastModified?: number // timestamp in ms
}

/**
 * Diff report between directory scan and existing index
 */
export type IndexDiffReport = {
  nieuweBestanden: ScannedFile[]
  verwijderdeBestanden: IndexBestandItem[]
  gewijzigdeBestanden: Array<{
    pad: string
    oud: IndexBestandItem
    nieuw: ScannedFile
    wijzigingen: string[] // e.g. ['naam', 'beschrijving', 'lastModified']
  }>
  ongewijzigdeBestanden: Array<{
    pad: string
    item: IndexBestandItem
  }>
}

/**
 * Compare scanned files with existing index
 * Returns detailed diff report
 */
export function vergelijkIndexMetScan(scan: ScannedFile[], bestaandeIndex: IndexBestand | null): IndexDiffReport {
  if (!bestaandeIndex || bestaandeIndex.bestanden.length === 0) {
    // No existing index, all files are new
    return {
      nieuweBestanden: scan,
      verwijderdeBestanden: [],
      gewijzigdeBestanden: [],
      ongewijzigdeBestanden: [],
    }
  }

  const scanMap = new Map(scan.map((f) => [f.pad, f]))
  const indexMap = new Map(bestaandeIndex.bestanden.map((item) => [item.pad, item]))

  const report: IndexDiffReport = {
    nieuweBestanden: [],
    verwijderdeBestanden: [],
    gewijzigdeBestanden: [],
    ongewijzigdeBestanden: [],
  }

  // Find new files and check for changes
  for (const [pad, scannedFile] of scanMap) {
    const indexItem = indexMap.get(pad)
    if (!indexItem) {
      report.nieuweBestanden.push(scannedFile)
    } else {
      const wijzigingen = detectMetadataChanges(indexItem.metadata, scannedFile.metadata)
      if (wijzigingen.length > 0) {
        report.gewijzigdeBestanden.push({
          pad,
          oud: indexItem,
          nieuw: scannedFile,
          wijzigingen,
        })
      } else {
        report.ongewijzigdeBestanden.push({
          pad,
          item: indexItem,
        })
      }
    }
  }

  // Find deleted files
  for (const [pad, indexItem] of indexMap) {
    if (!scanMap.has(pad)) {
      report.verwijderdeBestanden.push(indexItem)
    }
  }

  return report
}

/**
 * Detect changes in metadata between two PersonaMetadata objects
 */
function detectMetadataChanges(oud: PersonaMetadata, nieuw: PersonaMetadata): string[] {
  const wijzigingen: string[] = []

  if (oud.naam !== nieuw.naam) wijzigingen.push('naam')
  if (oud.taal !== nieuw.taal) wijzigingen.push('taal')
  if (oud.context !== nieuw.context) wijzigingen.push('context')
  if (oud.beschrijving !== nieuw.beschrijving) wijzigingen.push('beschrijving')
  if (oud.niveau !== nieuw.niveau) wijzigingen.push('niveau')

  return wijzigingen
}

/**
 * Format diff report as human-readable summary
 */
export function formateerDiffReport(report: IndexDiffReport): string {
  const regels: string[] = []

  if (report.nieuweBestanden.length > 0) {
    regels.push(`🆕 Nieuwe bestanden (${report.nieuweBestanden.length}):`)
    for (const bestand of report.nieuweBestanden) {
      regels.push(`   • ${bestand.pad} — ${bestand.metadata.naam}`)
    }
  }

  if (report.verwijderdeBestanden.length > 0) {
    regels.push(`🗑️  Verwijderde bestanden (${report.verwijderdeBestanden.length}):`)
    for (const bestand of report.verwijderdeBestanden) {
      regels.push(`   • ${bestand.pad} — ${bestand.metadata.naam}`)
    }
  }

  if (report.gewijzigdeBestanden.length > 0) {
    regels.push(`✏️  Gewijzigde bestanden (${report.gewijzigdeBestanden.length}):`)
    for (const wijziging of report.gewijzigdeBestanden) {
      regels.push(`   • ${wijziging.pad} — ${wijziging.oud.metadata.naam}`)
      regels.push(`     Veranderingen: ${wijziging.wijzigingen.join(', ')}`)
    }
  }

  if (report.ongewijzigdeBestanden.length > 0) {
    regels.push(`✓ Ongewijzigde bestanden (${report.ongewijzigdeBestanden.length}):`)
  }

  return regels.join('\n')
}
