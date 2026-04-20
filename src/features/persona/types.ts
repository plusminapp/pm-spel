export const PERSONA_BESTAND_SOORT = 'plusmin-persona' as const
export const PERSONA_SCHEMA_VERSIE = 1 as const
export const INDEX_BESTAND_SOORT = 'plusmin-index' as const
export const INDEX_SCHEMA_VERSIE = 1 as const

export type BronModus = 'curated' | 'open'
export type VasteMutatieType = 'inkomsten' | 'uitgave'
export type KansKaartSoort = 'plus' | 'min'

export type DobbelWaarden = {
  euro: number
  tweeEuro: number
  drieEuro: number
}

export type LeefgeldPotjes = {
  boodschappen: number
  vervoer: number
  fun: number
  overig: number
}

export type VasteMutatie = {
  naam: string
  type: VasteMutatieType
  bedrag: number
  betaaldag: number
}

export type KansKaart = {
  tekst: string
  soort: KansKaartSoort
  gevolg: number
}

export type PlusMinKaart = {
  tekst: string
  keuzeTekst1: string
  gevolg1: number
  keuzeTekst2: string
  gevolg2: number
  geenKeuzeTekst: string
  gevolgGeenKeuze: number
}

export type Persona = {
  naam: string
  taal: string
  context: string
  beschrijving: string
  niveau: number
  startsaldo: number
  dobbelWaarden: DobbelWaarden
  leefgeld: LeefgeldPotjes
  vasteMutaties: VasteMutatie[]
  kansKaarten: KansKaart[]
  plusMinKaarten: PlusMinKaart[]
}

export type PersonaBestand = {
  soort: typeof PERSONA_BESTAND_SOORT
  schemaVersie: typeof PERSONA_SCHEMA_VERSIE
  persona: Persona
}

export type PersonaMetadata = {
  naam: string
  taal: string
  context: string
  beschrijving: string
  niveau: number
}

export type IndexBestandItem = {
  pad: string
  metadata: PersonaMetadata
}

export type IndexBestand = {
  soort: typeof INDEX_BESTAND_SOORT
  schemaVersie: typeof INDEX_SCHEMA_VERSIE
  bijgewerktOp: string
  directoryHash: string
  bestanden: IndexBestandItem[]
}

export type PersonaFilter = {
  context?: string
  taal?: string
  niveau?: string
  beschrijving?: string
}

export type GeimporteerdePersona = {
  id: string
  bestand: PersonaBestand
  metadata: PersonaMetadata
  bronType: 'lokaal' | 'url'
  bronLabel: string
}