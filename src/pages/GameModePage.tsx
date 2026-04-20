import { useEffect, useMemo, useState } from 'react'

import { PersonaImportPane } from '@/components/PersonaImportPane'
import { initialiseerSpelStatus, verwerkPlusMinKeuze, voerDobbelActieUit, type DobbelSymbool } from '@/features/game/engine'
import { filterPersonaMetadata } from '@/features/persona/metadata'
import { usePersonaRuntime } from '@/features/persona/runtime'

type GameModePageProps = {
  randomSource?: () => number
}

const DOBBEL_SYMBOLEN: Array<{ symbool: DobbelSymbool; label: string }> = [
  { symbool: '?', label: '?' },
  { symbool: '??', label: '??' },
  { symbool: '???', label: '???' },
  { symbool: 'PLUS', label: 'Plus' },
  { symbool: 'PLUSMIN', label: 'PlusMin' },
  { symbool: 'MIN', label: 'Min' },
]

export function GameModePage({ randomSource = Math.random }: GameModePageProps) {
  const { personas, geselecteerdePersonaId, selecteerPersona } = usePersonaRuntime()
  const [contextFilter, setContextFilter] = useState('')
  const [taalFilter, setTaalFilter] = useState('')
  const [niveauFilter, setNiveauFilter] = useState('')
  const [beschrijvingFilter, setBeschrijvingFilter] = useState('')
  const [spelStatus, setSpelStatus] = useState<ReturnType<typeof initialiseerSpelStatus> | null>(null)

  const gefilterdeIds = useMemo(() => {
    const metadata = filterPersonaMetadata(
      personas.map((item) => item.metadata),
      {
        context: contextFilter,
        taal: taalFilter,
        niveau: niveauFilter,
        beschrijving: beschrijvingFilter,
      },
    )
    const sleutelSet = new Set(metadata.map((item) => `${item.naam}|${item.taal}|${item.context}|${item.niveau}|${item.beschrijving}`))
    return personas
      .filter((item) => sleutelSet.has(`${item.metadata.naam}|${item.metadata.taal}|${item.metadata.context}|${item.metadata.niveau}|${item.metadata.beschrijving}`))
      .map((item) => item.id)
  }, [beschrijvingFilter, contextFilter, niveauFilter, personas, taalFilter])

  const zichtbarePersonas = personas.filter((item) => gefilterdeIds.includes(item.id))
  const geselecteerdePersona = personas.find((item) => item.id === geselecteerdePersonaId) ?? zichtbarePersonas[0] ?? null

  useEffect(() => {
    if (!geselecteerdePersona) {
      setSpelStatus(null)
      return
    }
    setSpelStatus(initialiseerSpelStatus(geselecteerdePersona.bestand.persona, randomSource))
  }, [geselecteerdePersona, randomSource])

  function handelDobbelClick(symbool: DobbelSymbool) {
    if (!geselecteerdePersona || !spelStatus) {
      return
    }

    setSpelStatus((huidig) => {
      if (!huidig) return huidig
      return voerDobbelActieUit(huidig, geselecteerdePersona.bestand.persona, symbool, randomSource)
    })
  }

  function handelPlusMinKeuze(keuze: 'keuze1' | 'keuze2' | 'geenkeuze') {
    setSpelStatus((huidig) => {
      if (!huidig) return huidig
      return verwerkPlusMinKeuze(huidig, keuze)
    })
  }

  return (
    <div className="page-stack">
      <section className="mode-card paneel-stack" aria-labelledby="spelmodus-title">
        <h2 id="spelmodus-title">Spelmodus</h2>
        <p>
          Laad persona-bestanden in het runtime-geheugen en filter de metadata op context, taal, niveau en beschrijving.
          De spelmechanica volgt in Fase 3; nu staat de spelerselectie-datalaag klaar.
        </p>
      </section>

      <PersonaImportPane
        titel="Persona's laden voor spelers"
        beschrijving="Importeer lokale of remote .pms bestanden. Alleen metadata wordt hieronder gefilterd; de volledige persona blijft beschikbaar in het geheugen."
      />

      <section className="mode-card paneel-stack" aria-labelledby="filter-title">
        <h3 id="filter-title">Filterbare metadata</h3>
        <div className="filter-grid">
          <label className="field-stack">
            <span>Context</span>
            <input className="text-input" value={contextFilter} onChange={(event) => setContextFilter(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Taal</span>
            <input className="text-input" value={taalFilter} onChange={(event) => setTaalFilter(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Niveau</span>
            <input className="text-input" inputMode="numeric" value={niveauFilter} onChange={(event) => setNiveauFilter(event.target.value)} />
          </label>
          <label className="field-stack field-stack-wide">
            <span>Beschrijving</span>
            <input className="text-input" value={beschrijvingFilter} onChange={(event) => setBeschrijvingFilter(event.target.value)} />
          </label>
        </div>

        {zichtbarePersonas.length === 0 ? (
          <p>Er zijn nog geen persona's die aan het huidige filter voldoen.</p>
        ) : (
          <div className="list-stack">
            {zichtbarePersonas.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === geselecteerdePersona?.id ? 'list-card active' : 'list-card'}
                onClick={() => selecteerPersona(item.id)}
              >
                <strong>{item.metadata.naam}</strong>
                <span>{item.metadata.context} · {item.metadata.taal} · niveau {item.metadata.niveau}</span>
                <span>{item.metadata.beschrijving}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mode-card paneel-stack" aria-labelledby="selectie-title">
        <h3 id="selectie-title">Geselecteerde persona</h3>
        {geselecteerdePersona ? (
          <div className="detail-grid">
            <div>
              <strong>{geselecteerdePersona.bestand.persona.naam}</strong>
              <p>{geselecteerdePersona.bestand.persona.beschrijving}</p>
            </div>
            <dl className="detail-list">
              <div><dt>Taal</dt><dd>{geselecteerdePersona.bestand.persona.taal}</dd></div>
              <div><dt>Context</dt><dd>{geselecteerdePersona.bestand.persona.context}</dd></div>
              <div><dt>Niveau</dt><dd>{geselecteerdePersona.bestand.persona.niveau}</dd></div>
              <div><dt>Bron</dt><dd>{geselecteerdePersona.bronLabel}</dd></div>
              <div><dt>Startsaldo</dt><dd>{geselecteerdePersona.bestand.persona.startsaldo}</dd></div>
              <div><dt>Kanskaarten</dt><dd>{geselecteerdePersona.bestand.persona.kansKaarten.length}</dd></div>
              <div><dt>PlusMin-kaarten</dt><dd>{geselecteerdePersona.bestand.persona.plusMinKaarten.length}</dd></div>
            </dl>
          </div>
        ) : (
          <p>Kies of importeer eerst een persona om metadata en inhoud te bekijken.</p>
        )}
      </section>

      <section className="mode-card paneel-stack" aria-labelledby="kaart-title">
        <h3 id="kaart-title">Dobbel en trek kaarten</h3>
        {!geselecteerdePersona || !spelStatus ? (
          <p>Kies eerst een persona. Daarna kun je met de dobbelsteen-symbolen direct een kaart of boodschappenactie trekken.</p>
        ) : (
          <>
            <div className="dice-grid" role="group" aria-label="Dobbelsteen symbolen">
              {DOBBEL_SYMBOLEN.map((item) => (
                <button
                  key={item.symbool}
                  type="button"
                  className="dice-button"
                  onClick={() => handelDobbelClick(item.symbool)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="result-card" aria-live="polite">
              {spelStatus.laatsteResultaat ? (
                <>
                  <strong>{spelStatus.laatsteResultaat.titel}</strong>
                  <p>{spelStatus.laatsteResultaat.tekst}</p>
                  <p className={spelStatus.laatsteResultaat.bedrag >= 0 ? 'amount amount-plus' : 'amount amount-min'}>
                    Gevolg: {spelStatus.laatsteResultaat.bedrag}
                  </p>
                </>
              ) : (
                <p>Dobbel om je eerste actie van deze beurt te starten.</p>
              )}
            </div>
          </>
        )}
      </section>

      {spelStatus?.wachtOpPlusMinKeuze && (
        <section className="choice-overlay" aria-live="assertive" aria-labelledby="plusmin-keuze-title">
          <div className="choice-panel">
            <h3 id="plusmin-keuze-title">PlusMin keuze</h3>
            <p>{spelStatus.wachtOpPlusMinKeuze.tekst}</p>
            <div className="choice-buttons">
              <button type="button" className="choice-button" onClick={() => handelPlusMinKeuze('keuze1')}>
                {spelStatus.wachtOpPlusMinKeuze.keuzeTekst1}
                <span>Gevolg: {spelStatus.wachtOpPlusMinKeuze.gevolg1}</span>
              </button>
              <button type="button" className="choice-button" onClick={() => handelPlusMinKeuze('keuze2')}>
                {spelStatus.wachtOpPlusMinKeuze.keuzeTekst2}
                <span>Gevolg: {spelStatus.wachtOpPlusMinKeuze.gevolg2}</span>
              </button>
              <button type="button" className="choice-button secondary" onClick={() => handelPlusMinKeuze('geenkeuze')}>
                {spelStatus.wachtOpPlusMinKeuze.geenKeuzeTekst}
                <span>Gevolg: {spelStatus.wachtOpPlusMinKeuze.gevolgGeenKeuze}</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
