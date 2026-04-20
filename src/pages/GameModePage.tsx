import { useEffect, useMemo, useRef, useState } from 'react'

import { PersonaImportPane } from '@/components/PersonaImportPane'
import { ShareQrCard } from '@/components/ShareQrCard'
import { initialiseerSpelStatus, verwerkPlusMinKeuze, voerDobbelActieUit, type DobbelSymbool } from '@/features/game/engine'
import { filterPersonaMetadata } from '@/features/persona/metadata'
import { importeerIndexVanUrl, laadPersonaVanCatalogusItem, type RemoteCatalogus, type RemoteCatalogusItem } from '@/features/persona/remoteCatalog'
import { usePersonaRuntime } from '@/features/persona/runtime'
import { beschrijfBronmodus } from '@/features/persona/sourceMode'
import { leesPersonaDeelLink, maakPersonaDeelUrl } from '@/features/persona/share'

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

function maakMetadataSleutel(item: { naam: string; taal: string; context: string; niveau: number; beschrijving: string }) {
  return `${item.naam}|${item.taal}|${item.context}|${item.niveau}|${item.beschrijving}`
}

export function GameModePage({ randomSource = Math.random }: GameModePageProps) {
  const { personas, geselecteerdePersonaId, selecteerPersona, voegPersonasToe, modus, setModus } = usePersonaRuntime()
  const [contextFilter, setContextFilter] = useState('')
  const [taalFilter, setTaalFilter] = useState('')
  const [niveauFilter, setNiveauFilter] = useState('')
  const [beschrijvingFilter, setBeschrijvingFilter] = useState('')
  const [spelStatus, setSpelStatus] = useState<ReturnType<typeof initialiseerSpelStatus> | null>(null)
  const [indexUrl, setIndexUrl] = useState('')
  const [catalogus, setCatalogus] = useState<RemoteCatalogus | null>(null)
  const [catalogusBezig, setCatalogusBezig] = useState(false)
  const [catalogusFout, setCatalogusFout] = useState<string | null>(null)
  const [catalogusStatus, setCatalogusStatus] = useState<string | null>(null)
  const [delenStatus, setDelenStatus] = useState<string | null>(null)
  const shareLinkVerwerkt = useRef(false)

  const filter = useMemo(
    () => ({
      context: contextFilter,
      taal: taalFilter,
      niveau: niveauFilter,
      beschrijving: beschrijvingFilter,
    }),
    [beschrijvingFilter, contextFilter, niveauFilter, taalFilter],
  )

  const gefilterdeIds = useMemo(() => {
    const metadata = filterPersonaMetadata(
      personas.map((item) => item.metadata),
      filter,
    )
    const sleutelSet = new Set(metadata.map((item) => maakMetadataSleutel(item)))
    return personas.filter((item) => sleutelSet.has(maakMetadataSleutel(item.metadata))).map((item) => item.id)
  }, [filter, personas])

  const gefilterdeCatalogusItems = useMemo(() => {
    if (!catalogus) {
      return []
    }

    const metadata = filterPersonaMetadata(catalogus.items.map((item) => item.metadata), filter)
    const sleutelSet = new Set(metadata.map((item) => maakMetadataSleutel(item)))
    return catalogus.items.filter((item) => sleutelSet.has(maakMetadataSleutel(item.metadata)))
  }, [catalogus, filter])

  const zichtbarePersonas = personas.filter((item) => gefilterdeIds.includes(item.id))
  const geselecteerdePersona = personas.find((item) => item.id === geselecteerdePersonaId) ?? zichtbarePersonas[0] ?? null
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !geselecteerdePersona?.bronUrl) {
      return null
    }

    return maakPersonaDeelUrl(geselecteerdePersona.bronUrl, `${window.location.origin}${window.location.pathname}`, modus)
  }, [geselecteerdePersona?.bronUrl, modus])

  useEffect(() => {
    if (!geselecteerdePersona) {
      setSpelStatus(null)
      return
    }

    setSpelStatus(initialiseerSpelStatus(geselecteerdePersona.bestand.persona, randomSource))
  }, [geselecteerdePersona, randomSource])

  useEffect(() => {
    if (shareLinkVerwerkt.current || typeof window === 'undefined') {
      return
    }

    shareLinkVerwerkt.current = true
    const { personaUrl, modus: gedeeldeModus } = leesPersonaDeelLink(window.location.href)

    if (!personaUrl) {
      return
    }

    const effectieveModus = gedeeldeModus ?? modus
    if (gedeeldeModus) {
      setModus(gedeeldeModus)
    }

    setDelenStatus('De gedeelde persona wordt geladen...')
    void laadPersonaVanDeelLink(personaUrl, effectieveModus)
  }, [modus, setModus])

  async function laadPersonaVanDeelLink(personaUrl: string, bronModus: 'curated' | 'open') {
    try {
      const bestaand = personas.find((item) => item.bronUrl === personaUrl)
      if (bestaand) {
        selecteerPersona(bestaand.id)
        setDelenStatus(`Gedeelde persona geopend: ${bestaand.metadata.naam}.`)
        return
      }

      const persona = await laadPersonaVanCatalogusItem(
        {
          pad: new URL(personaUrl).pathname.split('/').pop() ?? 'persona.pms',
          personaUrl,
          metadata: {
            naam: 'Gedeelde persona',
            taal: 'onbekend',
            context: 'gedeeld',
            beschrijving: 'Wordt geladen via deel-link.',
            niveau: 1,
          },
        },
        {
          modus: bronModus,
          huidigeOrigin: window.location.origin,
        },
      )

      voegPersonasToe([persona])
      selecteerPersona(persona.id)
      setDelenStatus(`Gedeelde persona geladen: ${persona.metadata.naam}.`)
    } catch (error) {
      setDelenStatus((error as Error).message)
    }
  }

  async function laadRemoteIndex() {
    if (!indexUrl.trim()) {
      setCatalogusFout('Voer eerst de URL van een index.pms bestand in.')
      return
    }

    setCatalogusBezig(true)
    setCatalogusFout(null)
    setCatalogusStatus(null)

    try {
      const geladenCatalogus = await importeerIndexVanUrl(indexUrl.trim(), {
        modus,
        huidigeOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      setCatalogus(geladenCatalogus)
      setCatalogusStatus(`Index geladen: ${geladenCatalogus.items.length} persona's gevonden.`)
    } catch (error) {
      setCatalogus(null)
      setCatalogusFout((error as Error).message)
    } finally {
      setCatalogusBezig(false)
    }
  }

  async function laadRemotePersona(item: RemoteCatalogusItem) {
    setCatalogusBezig(true)
    setCatalogusFout(null)
    setCatalogusStatus(null)

    try {
      const bestaand = personas.find((persona) => persona.bronUrl === item.personaUrl)
      if (bestaand) {
        selecteerPersona(bestaand.id)
        setCatalogusStatus(`Persona al geladen: ${bestaand.metadata.naam}.`)
        return
      }

      const persona = await laadPersonaVanCatalogusItem(item, {
        modus,
        huidigeOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      voegPersonasToe([persona])
      selecteerPersona(persona.id)
      setCatalogusStatus(`Persona geladen vanuit remote index: ${persona.metadata.naam}.`)
    } catch (error) {
      setCatalogusFout((error as Error).message)
    } finally {
      setCatalogusBezig(false)
    }
  }

  async function kopieerDeelUrl() {
    if (!shareUrl || typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(shareUrl)
    setDelenStatus('Deel-URL gekopieerd naar het klembord.')
  }

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
          Ontdek persona&apos;s via een remote index, filter eerst op metadata en laad pas daarna de gekozen .pms volledig in het
          runtime-geheugen. Lokale import, directe URL-import en deel-links blijven daarnaast beschikbaar.
        </p>
      </section>

      <section className={modus === 'open' ? 'mode-card paneel-stack risk-card' : 'mode-card paneel-stack'} aria-labelledby="mode-title">
        <h3 id="mode-title">Bronmodus</h3>
        <div className="mode-toggle-group" role="group" aria-label="Bronmodus">
          <button type="button" className={modus === 'curated' ? 'pill-button active' : 'pill-button'} onClick={() => setModus('curated')}>
            Curated mode
          </button>
          <button type="button" className={modus === 'open' ? 'pill-button active' : 'pill-button'} onClick={() => setModus('open')}>
            Open mode
          </button>
        </div>
        <p className="support-text">{beschrijfBronmodus(modus)}</p>
      </section>

      <PersonaImportPane
        titel="Persona's laden voor spelers"
        beschrijving="Importeer lokale .pms bestanden of laad direct een bekende persona-URL. Deze flow blijft volledig stateless: alleen het runtime-geheugen wordt bijgewerkt."
      />

      <section className="mode-card paneel-stack" aria-labelledby="remote-title">
        <h3 id="remote-title">Remote discovery via index.pms</h3>
        <div className="paneel-grid remote-grid">
          <label className="field-stack field-stack-wide" htmlFor="index-url-input">
            <span>Index URL</span>
            <input
              id="index-url-input"
              className="text-input"
              inputMode="url"
              placeholder="https://voorbeeld.nl/personas/index.pms"
              value={indexUrl}
              onChange={(event) => setIndexUrl(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button type="button" className="action-button" disabled={catalogusBezig} onClick={() => void laadRemoteIndex()}>
              {catalogusBezig ? 'Index laden...' : 'Laad index.pms'}
            </button>
          </div>
        </div>

        {catalogus && (
          <div className="catalog-summary">
            <span>Bijgewerkt: {catalogus.bijgewerktOp}</span>
            <span>Hash: {catalogus.directoryHash}</span>
            <span>Index: {catalogus.indexUrl}</span>
          </div>
        )}

        {catalogusFout && <p className="feedback-message error">{catalogusFout}</p>}
        {catalogusStatus && <p className="feedback-message success">{catalogusStatus}</p>}
      </section>

      <section className="mode-card paneel-stack" aria-labelledby="filter-title">
        <h3 id="filter-title">Filter op metadata</h3>
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
      </section>

      <section className="mode-card paneel-stack" aria-labelledby="catalog-title">
        <h3 id="catalog-title">Remote catalogus</h3>
        {!catalogus ? (
          <p>Laad eerst een index.pms bron om remote persona&apos;s te ontdekken.</p>
        ) : gefilterdeCatalogusItems.length === 0 ? (
          <p>Geen remote persona&apos;s gevonden voor het huidige filter.</p>
        ) : (
          <div className="list-stack">
            {gefilterdeCatalogusItems.map((item) => (
              <div key={item.personaUrl} className="list-card split-card">
                <div>
                  <strong>{item.metadata.naam}</strong>
                  <span>{item.metadata.context} · {item.metadata.taal} · niveau {item.metadata.niveau}</span>
                  <span>{item.metadata.beschrijving}</span>
                  <span>{item.pad}</span>
                </div>
                <button type="button" className="action-button" disabled={catalogusBezig} onClick={() => void laadRemotePersona(item)}>
                  Laad persona
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mode-card paneel-stack" aria-labelledby="loaded-title">
        <h3 id="loaded-title">Geladen persona&apos;s in runtime</h3>
        {zichtbarePersonas.length === 0 ? (
          <p>Er zijn nog geen geladen persona&apos;s die aan het huidige filter voldoen.</p>
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

      {shareUrl ? (
        <section className="mode-card paneel-stack" aria-labelledby="share-actions-title">
          <div className="split-heading">
            <h3 id="share-actions-title">Delen</h3>
            <button type="button" className="pill-button" onClick={() => void kopieerDeelUrl()}>
              Kopieer deel-URL
            </button>
          </div>
          {delenStatus && <p className="feedback-message success">{delenStatus}</p>}
          <ShareQrCard shareUrl={shareUrl} />
        </section>
      ) : geselecteerdePersona ? (
        <section className="mode-card paneel-stack">
          <h3>Delen</h3>
          <p>Deze persona heeft geen remote bron-URL. Delen via URL en QR werkt alleen voor persona&apos;s die vanaf een URL zijn geladen.</p>
          {delenStatus && <p className="feedback-message success">{delenStatus}</p>}
        </section>
      ) : null}

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
