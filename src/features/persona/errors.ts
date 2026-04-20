export class PersonaValidatieFout extends Error {
  readonly fouten: string[]

  constructor(fouten: string[] | string) {
    const lijst = Array.isArray(fouten) ? fouten : [fouten]
    super(lijst.join('\n'))
    this.name = 'PersonaValidatieFout'
    this.fouten = lijst
  }
}

export class PersonaImportFout extends Error {
  readonly oorzaak?: unknown

  constructor(message: string, oorzaak?: unknown) {
    super(message)
    this.name = 'PersonaImportFout'
    this.oorzaak = oorzaak
  }
}