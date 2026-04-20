import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { BronModus, GeimporteerdePersona } from './types'

type PersonaRuntimeWaarde = {
  modus: BronModus
  setModus: (modus: BronModus) => void
  personas: GeimporteerdePersona[]
  voegPersonasToe: (personas: GeimporteerdePersona[]) => void
  geselecteerdePersonaId: string | null
  selecteerPersona: (id: string) => void
}

const PersonaRuntimeContext = createContext<PersonaRuntimeWaarde | null>(null)

type PersonaRuntimeProviderProps = {
  children: ReactNode
  initialPersonas?: GeimporteerdePersona[]
}

function maakDedupSleutel(persona: GeimporteerdePersona): string {
  if (persona.bronUrl) {
    return `url:${persona.bronUrl}`
  }

  const meta = persona.metadata
  return `meta:${meta.naam}|${meta.taal}|${meta.context}|${meta.niveau}|${meta.beschrijving}`
}

export function PersonaRuntimeProvider({ children, initialPersonas = [] }: PersonaRuntimeProviderProps) {
  const [modus, setModus] = useState<BronModus>('curated')
  const [personas, setPersonas] = useState<GeimporteerdePersona[]>(initialPersonas)
  const [geselecteerdePersonaId, setGeselecteerdePersonaId] = useState<string | null>(initialPersonas[0]?.id ?? null)

  const waarde = useMemo<PersonaRuntimeWaarde>(() => ({
    modus,
    setModus,
    personas,
    voegPersonasToe: (nieuwePersonas) => {
      setPersonas((huidig) => {
        const bestaand = new Set(huidig.map(maakDedupSleutel))
        const uniekeNieuwe = nieuwePersonas.filter((item) => !bestaand.has(maakDedupSleutel(item)))
        const volgende = [...uniekeNieuwe, ...huidig]
        if (!geselecteerdePersonaId && volgende[0]) {
          setGeselecteerdePersonaId(volgende[0].id)
        }
        return volgende
      })
    },
    geselecteerdePersonaId,
    selecteerPersona: setGeselecteerdePersonaId,
  }), [geselecteerdePersonaId, modus, personas])

  return <PersonaRuntimeContext.Provider value={waarde}>{children}</PersonaRuntimeContext.Provider>
}

export function usePersonaRuntime() {
  const context = useContext(PersonaRuntimeContext)
  if (!context) {
    throw new Error('usePersonaRuntime moet binnen PersonaRuntimeProvider gebruikt worden.')
  }
  return context
}