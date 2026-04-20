import { useId, useState } from 'react'

import { importeerPersonaBestandenVanFiles, importeerPersonaBestandVanUrl } from '@/features/persona/io'
import { usePersonaRuntime } from '@/features/persona/runtime'
import { beschrijfBronmodus } from '@/features/persona/sourceMode'

type PersonaImportPaneProps = {
  titel: string
  beschrijving: string
}

export function PersonaImportPane({ titel, beschrijving }: PersonaImportPaneProps) {
  const invoerId = useId()
  const { modus, setModus, voegPersonasToe } = usePersonaRuntime()
  const [url, setUrl] = useState('')
  const [foutmelding, setFoutmelding] = useState<string | null>(null)
  const [statusmelding, setStatusmelding] = useState<string | null>(null)
  const [bezig, setBezig] = useState(false)

  async function verwerkBestanden(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    setBezig(true)
    setFoutmelding(null)
    setStatusmelding(null)

    try {
      const geimporteerd = await importeerPersonaBestandenVanFiles(Array.from(files))
      voegPersonasToe(geimporteerd)
      setStatusmelding(`${geimporteerd.length} persona-bestand(en) geladen.`)
    } catch (error) {
      setFoutmelding((error as Error).message)
    } finally {
      setBezig(false)
    }
  }

  async function importeerVanUrl() {
    if (!url.trim()) {
      setFoutmelding('Voer eerst een URL in.')
      return
    }

    setBezig(true)
    setFoutmelding(null)
    setStatusmelding(null)

    try {
      const persona = await importeerPersonaBestandVanUrl(url, {
        modus,
        huidigeOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      voegPersonasToe([persona])
      setStatusmelding(`Persona geladen vanaf ${persona.bronLabel}.`)
      setUrl('')
    } catch (error) {
      setFoutmelding((error as Error).message)
    } finally {
      setBezig(false)
    }
  }

  return (
    <section className="mode-card paneel-stack" aria-labelledby={invoerId}>
      <div>
        <h3 id={invoerId}>{titel}</h3>
        <p>{beschrijving}</p>
      </div>

      <div className="mode-toggle-group" role="group" aria-label="Bronmodus">
        <button type="button" className={modus === 'curated' ? 'pill-button active' : 'pill-button'} onClick={() => setModus('curated')}>
          Curated mode
        </button>
        <button type="button" className={modus === 'open' ? 'pill-button active' : 'pill-button'} onClick={() => setModus('open')}>
          Open mode
        </button>
      </div>

      <p className="support-text">
        {beschrijfBronmodus(modus)}
      </p>

      <div className="paneel-grid">
        <label className="file-input-card" htmlFor={`${invoerId}-file`}>
          <span className="file-input-title">Importeer lokale .pms bestanden</span>
          <span className="support-text">Meerdere persona-bestanden tegelijk laden in het runtime-geheugen.</span>
          <input
            id={`${invoerId}-file`}
            type="file"
            accept=".pms,application/json"
            multiple
            disabled={bezig}
            onChange={(event) => void verwerkBestanden(event.target.files)}
          />
        </label>

        <div className="url-import-card">
          <label className="field-stack" htmlFor={`${invoerId}-url`}>
            <span className="file-input-title">Importeer via URL</span>
            <input
              id={`${invoerId}-url`}
              className="text-input"
              inputMode="url"
              placeholder="https://voorbeeld.nl/persona.pms"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={bezig}
            />
          </label>
          <button type="button" className="action-button" onClick={() => void importeerVanUrl()} disabled={bezig}>
            {bezig ? 'Bezig...' : 'Laad URL'}
          </button>
        </div>
      </div>

      {foutmelding && <p className="feedback-message error">{foutmelding}</p>}
      {statusmelding && <p className="feedback-message success">{statusmelding}</p>}
    </section>
  )
}