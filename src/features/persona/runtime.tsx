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

export function PersonaRuntimeProvider({ children }: { children: ReactNode }) {
  const [modus, setModus] = useState<BronModus>('curated')
  const [personas, setPersonas] = useState<GeimporteerdePersona[]>([])
  const [geselecteerdePersonaId, setGeselecteerdePersonaId] = useState<string | null>(null)

  const waarde = useMemo<PersonaRuntimeWaarde>(() => ({
    modus,
    setModus,
    personas,
    voegPersonasToe: (nieuwePersonas) => {
      setPersonas((huidig) => {
        const volgende = [...nieuwePersonas, ...huidig]
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