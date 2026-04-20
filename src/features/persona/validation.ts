import { PersonaValidatieFout } from './errors'
import { sanitiseerTekst } from './sanitize'
import {
  INDEX_BESTAND_SOORT,
  INDEX_SCHEMA_VERSIE,
  PERSONA_BESTAND_SOORT,
  PERSONA_SCHEMA_VERSIE,
  type IndexBestand,
  type IndexBestandItem,
  type KansKaart,
  type PersonaBestand,
  type PlusMinKaart,
  type VasteMutatie,
  type VasteMutatieType,
} from './types'

type JsonObject = Record<string, unknown>

function isObject(waarde: unknown): waarde is JsonObject {
  return typeof waarde === 'object' && waarde !== null && !Array.isArray(waarde)
}

function formatPad(pad: string, sleutel: string): string {
  return pad ? `${pad}.${sleutel}` : sleutel
}

function controleerOnbekendeVelden(object: JsonObject, toegestaan: string[], pad: string, fouten: string[]) {
  for (const sleutel of Object.keys(object)) {
    if (!toegestaan.includes(sleutel)) {
      fouten.push(`${formatPad(pad, sleutel)} is geen toegestaan veld.`)
    }
  }
}

function leesObject(bron: JsonObject, sleutel: string, pad: string, fouten: string[]): JsonObject | null {
  const waarde = bron[sleutel]
  if (!isObject(waarde)) {
    fouten.push(`${formatPad(pad, sleutel)} moet een object zijn.`)
    return null
  }
  return waarde
}

function leesArray(bron: JsonObject, sleutel: string, pad: string, fouten: string[]): unknown[] | null {
  const waarde = bron[sleutel]
  if (!Array.isArray(waarde)) {
    fouten.push(`${formatPad(pad, sleutel)} moet een lijst zijn.`)
    return null
  }
  return waarde
}

function leesTekst(bron: JsonObject, sleutel: string, pad: string, fouten: string[]): string | null {
  const waarde = bron[sleutel]
  if (typeof waarde !== 'string') {
    fouten.push(`${formatPad(pad, sleutel)} moet tekst zijn.`)
    return null
  }

  const gesanitiseerd = sanitiseerTekst(waarde)
  if (!gesanitiseerd) {
    fouten.push(`${formatPad(pad, sleutel)} mag niet leeg zijn.`)
    return null
  }

  return gesanitiseerd
}

function leesGetal(bron: JsonObject, sleutel: string, pad: string, fouten: string[]): number | null {
  const waarde = bron[sleutel]
  if (typeof waarde !== 'number' || !Number.isFinite(waarde)) {
    fouten.push(`${formatPad(pad, sleutel)} moet een geldig getal zijn.`)
    return null
  }
  return waarde
}

function leesInteger(bron: JsonObject, sleutel: string, pad: string, fouten: string[]): number | null {
  const waarde = leesGetal(bron, sleutel, pad, fouten)
  if (waarde === null) return null
  if (!Number.isInteger(waarde)) {
    fouten.push(`${formatPad(pad, sleutel)} moet een geheel getal zijn.`)
    return null
  }
  return waarde
}

function normaliseerVasteMutatieType(waarde: string): VasteMutatieType | null {
  const genormaliseerd = waarde.toLocaleLowerCase()
  if (['inkomsten', 'in', 'income'].includes(genormaliseerd)) return 'inkomsten'
  if (['uitgave', 'uit', 'expense'].includes(genormaliseerd)) return 'uitgave'
  return null
}

function valideerVasteMutatie(item: unknown, index: number, fouten: string[]): VasteMutatie | null {
  const pad = `persona.vasteMutaties[${index}]`
  if (!isObject(item)) {
    fouten.push(`${pad} moet een object zijn.`)
    return null
  }

  controleerOnbekendeVelden(item, ['naam', 'type', 'bedrag', 'betaaldag'], pad, fouten)

  const naam = leesTekst(item, 'naam', pad, fouten)
  const typeWaarde = leesTekst(item, 'type', pad, fouten)
  const bedrag = leesGetal(item, 'bedrag', pad, fouten)
  const betaaldag = leesInteger(item, 'betaaldag', pad, fouten)

  if (betaaldag !== null && (betaaldag < 1 || betaaldag > 28)) {
    fouten.push(`${pad}.betaaldag moet tussen 1 en 28 liggen.`)
  }

  const type = typeWaarde ? normaliseerVasteMutatieType(typeWaarde) : null
  if (typeWaarde && !type) {
    fouten.push(`${pad}.type moet inkomsten of uitgave zijn.`)
  }

  if (!naam || !type || bedrag === null || betaaldag === null || betaaldag < 1 || betaaldag > 28) {
    return null
  }

  return { naam, type, bedrag, betaaldag }
}

function valideerKansKaart(item: unknown, index: number, fouten: string[]): KansKaart | null {
  const pad = `persona.kansKaarten[${index}]`
  if (!isObject(item)) {
    fouten.push(`${pad} moet een object zijn.`)
    return null
  }

  controleerOnbekendeVelden(item, ['tekst', 'soort', 'gevolg'], pad, fouten)

  const tekst = leesTekst(item, 'tekst', pad, fouten)
  const soortWaarde = leesTekst(item, 'soort', pad, fouten)
  const gevolg = leesGetal(item, 'gevolg', pad, fouten)
  const soort = soortWaarde
    ? soortWaarde === '+' || soortWaarde.toLocaleLowerCase() === 'plus'
      ? 'plus'
      : soortWaarde === '-' || soortWaarde.toLocaleLowerCase() === 'min'
        ? 'min'
        : null
    : null

  if (soortWaarde && !soort) {
    fouten.push(`${pad}.soort moet plus of min zijn.`)
  }

  if (!tekst || !soort || gevolg === null) {
    return null
  }

  return { tekst, soort, gevolg }
}

function valideerPlusMinKaart(item: unknown, index: number, fouten: string[]): PlusMinKaart | null {
  const pad = `persona.plusMinKaarten[${index}]`
  if (!isObject(item)) {
    fouten.push(`${pad} moet een object zijn.`)
    return null
  }

  controleerOnbekendeVelden(
    item,
    ['tekst', 'keuzeTekst1', 'gevolg1', 'keuzeTekst2', 'gevolg2', 'geenKeuzeTekst', 'gevolgGeenKeuze'],
    pad,
    fouten,
  )

  const tekst = leesTekst(item, 'tekst', pad, fouten)
  const keuzeTekst1 = leesTekst(item, 'keuzeTekst1', pad, fouten)
  const gevolg1 = leesGetal(item, 'gevolg1', pad, fouten)
  const keuzeTekst2 = leesTekst(item, 'keuzeTekst2', pad, fouten)
  const gevolg2 = leesGetal(item, 'gevolg2', pad, fouten)
  const geenKeuzeTekst = leesTekst(item, 'geenKeuzeTekst', pad, fouten)
  const gevolgGeenKeuze = leesGetal(item, 'gevolgGeenKeuze', pad, fouten)

  if (!tekst || !keuzeTekst1 || gevolg1 === null || !keuzeTekst2 || gevolg2 === null || !geenKeuzeTekst || gevolgGeenKeuze === null) {
    return null
  }

  return {
    tekst,
    keuzeTekst1,
    gevolg1,
    keuzeTekst2,
    gevolg2,
    geenKeuzeTekst,
    gevolgGeenKeuze,
  }
}

export function valideerEnNormaliseerPersonaBestand(waarde: unknown): PersonaBestand {
  const fouten: string[] = []

  if (!isObject(waarde)) {
    throw new PersonaValidatieFout('Het persona-bestand moet een JSON-object bevatten.')
  }

  controleerOnbekendeVelden(waarde, ['soort', 'schemaVersie', 'persona'], '', fouten)

  if (waarde.soort !== PERSONA_BESTAND_SOORT) {
    fouten.push(`soort moet ${PERSONA_BESTAND_SOORT} zijn.`)
  }

  if (waarde.schemaVersie !== PERSONA_SCHEMA_VERSIE) {
    fouten.push(`schemaVersie moet ${PERSONA_SCHEMA_VERSIE} zijn.`)
  }

  const persona = leesObject(waarde, 'persona', '', fouten)
  if (!persona) {
    throw new PersonaValidatieFout(fouten)
  }

  controleerOnbekendeVelden(
    persona,
    ['naam', 'taal', 'context', 'beschrijving', 'niveau', 'startsaldo', 'dobbelWaarden', 'leefgeld', 'vasteMutaties', 'kansKaarten', 'plusMinKaarten'],
    'persona',
    fouten,
  )

  const naam = leesTekst(persona, 'naam', 'persona', fouten)
  const taal = leesTekst(persona, 'taal', 'persona', fouten)
  const context = leesTekst(persona, 'context', 'persona', fouten)
  const beschrijving = leesTekst(persona, 'beschrijving', 'persona', fouten)
  const niveau = leesInteger(persona, 'niveau', 'persona', fouten)
  const startsaldo = leesGetal(persona, 'startsaldo', 'persona', fouten)
  const dobbelWaarden = leesObject(persona, 'dobbelWaarden', 'persona', fouten)
  const leefgeld = leesObject(persona, 'leefgeld', 'persona', fouten)
  const vasteMutatiesRuw = leesArray(persona, 'vasteMutaties', 'persona', fouten)
  const kansKaartenRuw = leesArray(persona, 'kansKaarten', 'persona', fouten)
  const plusMinKaartenRuw = leesArray(persona, 'plusMinKaarten', 'persona', fouten)

  let euro: number | null = null
  let tweeEuro: number | null = null
  let drieEuro: number | null = null
  if (dobbelWaarden) {
    controleerOnbekendeVelden(dobbelWaarden, ['euro', 'tweeEuro', 'drieEuro'], 'persona.dobbelWaarden', fouten)
    euro = leesGetal(dobbelWaarden, 'euro', 'persona.dobbelWaarden', fouten)
    tweeEuro = leesGetal(dobbelWaarden, 'tweeEuro', 'persona.dobbelWaarden', fouten)
    drieEuro = leesGetal(dobbelWaarden, 'drieEuro', 'persona.dobbelWaarden', fouten)
  }

  let boodschappen: number | null = null
  let vervoer: number | null = null
  let fun: number | null = null
  let overig: number | null = null
  if (leefgeld) {
    controleerOnbekendeVelden(leefgeld, ['boodschappen', 'vervoer', 'fun', 'overig'], 'persona.leefgeld', fouten)
    boodschappen = leesGetal(leefgeld, 'boodschappen', 'persona.leefgeld', fouten)
    vervoer = leesGetal(leefgeld, 'vervoer', 'persona.leefgeld', fouten)
    fun = leesGetal(leefgeld, 'fun', 'persona.leefgeld', fouten)
    overig = leesGetal(leefgeld, 'overig', 'persona.leefgeld', fouten)
  }

  const vasteMutaties = (vasteMutatiesRuw ?? [])
    .map((item, index) => valideerVasteMutatie(item, index, fouten))
    .filter((item): item is VasteMutatie => item !== null)
  const kansKaarten = (kansKaartenRuw ?? [])
    .map((item, index) => valideerKansKaart(item, index, fouten))
    .filter((item): item is KansKaart => item !== null)
  const plusMinKaarten = (plusMinKaartenRuw ?? [])
    .map((item, index) => valideerPlusMinKaart(item, index, fouten))
    .filter((item): item is PlusMinKaart => item !== null)

  if (niveau !== null && niveau < 1) {
    fouten.push('persona.niveau moet minimaal 1 zijn.')
  }

  if (fouten.length > 0) {
    throw new PersonaValidatieFout(fouten)
  }

  return {
    soort: PERSONA_BESTAND_SOORT,
    schemaVersie: PERSONA_SCHEMA_VERSIE,
    persona: {
      naam: naam!,
      taal: taal!,
      context: context!,
      beschrijving: beschrijving!,
      niveau: niveau!,
      startsaldo: startsaldo!,
      dobbelWaarden: {
        euro: euro!,
        tweeEuro: tweeEuro!,
        drieEuro: drieEuro!,
      },
      leefgeld: {
        boodschappen: boodschappen!,
        vervoer: vervoer!,
        fun: fun!,
        overig: overig!,
      },
      vasteMutaties,
      kansKaarten,
      plusMinKaarten,
    },
  }
}

function valideerIndexItem(item: unknown, index: number, fouten: string[]): IndexBestandItem | null {
  const pad = `bestanden[${index}]`
  if (!isObject(item)) {
    fouten.push(`${pad} moet een object zijn.`)
    return null
  }

  controleerOnbekendeVelden(item, ['pad', 'metadata'], pad, fouten)
  const metadata = leesObject(item, 'metadata', pad, fouten)
  const bestandsPad = leesTekst(item, 'pad', pad, fouten)

  if (!metadata || !bestandsPad) {
    return null
  }

  controleerOnbekendeVelden(metadata, ['naam', 'taal', 'context', 'beschrijving', 'niveau'], `${pad}.metadata`, fouten)
  const naam = leesTekst(metadata, 'naam', `${pad}.metadata`, fouten)
  const taal = leesTekst(metadata, 'taal', `${pad}.metadata`, fouten)
  const context = leesTekst(metadata, 'context', `${pad}.metadata`, fouten)
  const beschrijving = leesTekst(metadata, 'beschrijving', `${pad}.metadata`, fouten)
  const niveau = leesInteger(metadata, 'niveau', `${pad}.metadata`, fouten)

  if (!naam || !taal || !context || !beschrijving || niveau === null) {
    return null
  }

  return {
    pad: bestandsPad,
    metadata: {
      naam,
      taal,
      context,
      beschrijving,
      niveau,
    },
  }
}

export function valideerIndexBestand(waarde: unknown): IndexBestand {
  const fouten: string[] = []

  if (!isObject(waarde)) {
    throw new PersonaValidatieFout('Het index-bestand moet een JSON-object bevatten.')
  }

  controleerOnbekendeVelden(waarde, ['soort', 'schemaVersie', 'bijgewerktOp', 'directoryHash', 'bestanden'], '', fouten)

  if (waarde.soort !== INDEX_BESTAND_SOORT) {
    fouten.push(`soort moet ${INDEX_BESTAND_SOORT} zijn.`)
  }

  if (waarde.schemaVersie !== INDEX_SCHEMA_VERSIE) {
    fouten.push(`schemaVersie moet ${INDEX_SCHEMA_VERSIE} zijn.`)
  }

  const bijgewerktOp = leesTekst(waarde, 'bijgewerktOp', '', fouten)
  const directoryHash = leesTekst(waarde, 'directoryHash', '', fouten)
  const bestanden = leesArray(waarde, 'bestanden', '', fouten)
  const gevalideerdeBestanden = (bestanden ?? [])
    .map((item, index) => valideerIndexItem(item, index, fouten))
    .filter((item): item is IndexBestandItem => item !== null)

  if (bijgewerktOp && Number.isNaN(Date.parse(bijgewerktOp))) {
    fouten.push('bijgewerktOp moet een geldige ISO timestamp zijn.')
  }

  if (fouten.length > 0) {
    throw new PersonaValidatieFout(fouten)
  }

  return {
    soort: INDEX_BESTAND_SOORT,
    schemaVersie: INDEX_SCHEMA_VERSIE,
    bijgewerktOp: bijgewerktOp!,
    directoryHash: directoryHash!,
    bestanden: gevalideerdeBestanden,
  }
}