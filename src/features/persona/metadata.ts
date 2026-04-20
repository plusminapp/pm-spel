import type { PersonaBestand, PersonaFilter, PersonaMetadata } from './types'

export function maakPersonaMetadata(bestand: PersonaBestand): PersonaMetadata {
  return {
    naam: bestand.persona.naam,
    taal: bestand.persona.taal,
    context: bestand.persona.context,
    beschrijving: bestand.persona.beschrijving,
    niveau: bestand.persona.niveau,
  }
}

function bevatZoekterm(waarde: string, filter?: string): boolean {
  if (!filter) return true
  return waarde.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase())
}

export function filterPersonaMetadata(items: PersonaMetadata[], filter: PersonaFilter): PersonaMetadata[] {
  return items.filter((item) => {
    const niveauFilter = filter.niveau?.trim()
    return (
      bevatZoekterm(item.context, filter.context) &&
      bevatZoekterm(item.taal, filter.taal) &&
      bevatZoekterm(item.beschrijving, filter.beschrijving) &&
      (!niveauFilter || String(item.niveau) === niveauFilter)
    )
  })
}