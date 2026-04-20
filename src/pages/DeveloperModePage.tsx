import { useState, useCallback } from 'react'
import { usePersonaRuntime } from '@/features/persona/runtime'
import { downloadPersonaBestand, importeerPersonaBestandenVanFiles } from '@/features/persona/io'
import { serializePersonaBestand } from '@/features/persona/serialization'
import { useDirtyState, createEmptyPersona } from '@/features/developer/editorState'
import { genereeerIndex, downloadIndex } from '@/features/persona/indexGenerate'
import { vergelijkIndexMetScan, formateerDiffReport } from '@/features/persona/indexDiff'
import type { Persona, VasteMutatie, KansKaart, PlusMinKaart, PersonaBestand } from '@/features/persona/types'

type EditorTab = 'editor' | 'index'

/**
 * Check if persona has minimum required fields for serialization
 */
function isPersonaValid(persona: Persona): boolean {
  return !!(persona.naam.trim() && persona.taal.trim() && persona.context.trim() && persona.beschrijving.trim())
}

export function DeveloperModePage() {
  const { personas, geselecteerdePersonaId } = usePersonaRuntime()
  const geselecteerdePersona = personas.find((item) => item.id === geselecteerdePersonaId) ?? personas[0] ?? null

  const [activeTab, setActiveTab] = useState<EditorTab>('editor')
  const [showDirtyWarning, setShowDirtyWarning] = useState(false)

  const { editingPersona, updatePersona, isDirty, markClean, reset } = useDirtyState(
    geselecteerdePersona?.bestand.persona ?? null,
  )

  const handleExport = useCallback(() => {
    if (!editingPersona || !isPersonaValid(editingPersona)) {
      alert('Vul minimaal naam, taal, context en beschrijving in voordat je kunt exporteren.')
      return
    }
    const bestand: PersonaBestand = {
      soort: 'plusmin-persona',
      schemaVersie: 1,
      persona: editingPersona,
    }
    downloadPersonaBestand(bestand)
    markClean()
  }, [editingPersona, markClean])

  const handleNew = useCallback(() => {
    if (isDirty) {
      if (!isPersonaValid(editingPersona!)) {
        alert('Je hebt een onvolledig persona geopend. Dit kan niet worden opgeslagen.\nKlik "Wijzigingen verwerpen" om opnieuw te beginnen.')
        return
      }
      setShowDirtyWarning(true)
      return
    }
    updatePersona(() => createEmptyPersona())
  }, [isDirty, editingPersona, updatePersona])

  const handleImport = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (isDirty) {
      setShowDirtyWarning(true)
      return
    }

    try {
      const imported = await importeerPersonaBestandenVanFiles(Array.from(files))
      if (imported.length > 0) {
        updatePersona(() => imported[0].bestand.persona)
      }
    } catch (error) {
      alert(`Fout bij importeren: ${(error as Error).message}`)
    }
  }, [isDirty, updatePersona])

  if (!editingPersona) {
    return (
      <div className="page-stack">
        <section className="mode-card paneel-stack">
          <h2>Ontwikkelaar-modus</h2>
          <p>Klik op "Nieuwe Persona" of importeer een .pms bestand om te starten.</p>
          <div className="button-row">
            <button type="button" className="action-button" onClick={handleNew}>
              Nieuwe Persona
            </button>
            <label className="action-button" style={{ cursor: 'pointer', margin: 0 }}>
              Importeer .pms
              <input
                type="file"
                accept=".pms"
                multiple
                onChange={(e) => handleImport(e.currentTarget.files)}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-stack developer-mode-page">
      {isDirty && (
        <div className="dirty-warning-banner">
          ⚠️ Je hebt niet-opgeslagen wijzigingen. Deze gaan verloren als je navigeert zonder te exporteren.
        </div>
      )}

      {showDirtyWarning && (
        <div className="modal-overlay" onClick={() => setShowDirtyWarning(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Niet-opgeslagen wijzigingen</h3>
            <p>Je hebt wijzigingen gemaakt die niet zijn opgeslagen. Wat wil je doen?</p>
            <div className="button-row">
              <button type="button" onClick={() => setShowDirtyWarning(false)}>
                Annuleer
              </button>
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  reset()
                  setShowDirtyWarning(false)
                }}
              >
                Wijzigingen verwerpen
              </button>
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  handleExport()
                  setShowDirtyWarning(false)
                }}
              >
                Eerst exporteren
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mode-card paneel-stack">
        <div className="tab-bar">
          <button
            type="button"
            className={activeTab === 'editor' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('editor')}
          >
            ✏️ Editor
          </button>
          <button
            type="button"
            className={activeTab === 'index' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('index')}
          >
            📑 Index Workflow
          </button>
        </div>
      </section>

      {activeTab === 'editor' && (
        <EditorTab
          persona={editingPersona}
          onUpdatePersona={updatePersona}
          isDirty={isDirty}
          onExport={handleExport}
          onNew={handleNew}
          onImport={handleImport}
          onReset={reset}
        />
      )}

      {activeTab === 'index' && <IndexWorkflowTab />}
    </div>
  )
}

/**
 * Editor Tab: Full persona editing interface
 */
function EditorTab({
  persona,
  onUpdatePersona,
  isDirty,
  onExport,
  onNew,
  onImport,
  onReset,
}: {
  persona: Persona
  onUpdatePersona: (updater: (prev: Persona) => Persona) => void
  isDirty: boolean
  onExport: () => void
  onNew: () => void
  onImport: (files: FileList | null) => void
  onReset: () => void
}) {
  return (
    <>
      {/* File Operations Bar */}
      <section className="mode-card paneel-stack">
        <h3>Bestandsbeheer</h3>
        <div className="button-row">
          <button type="button" className="action-button" onClick={onNew}>
            ➕ Nieuwe Persona
          </button>
          <label className="action-button" style={{ cursor: 'pointer', margin: 0 }}>
            📥 Importeer .pms
            <input
              type="file"
              accept=".pms"
              multiple
              onChange={(e) => onImport(e.currentTarget.files)}
              style={{ display: 'none' }}
            />
          </label>
          <button type="button" className="action-button" onClick={onExport} disabled={!isDirty || !isPersonaValid(persona)}>
            💾 Exporteer
          </button>
          {isDirty && (
            <button type="button" className="secondary-button" onClick={onReset}>
              ↺ Wijzigingen verwerpen
            </button>
          )}
        </div>
      </section>

      {/* Basic Info Section */}
      <section className="mode-card paneel-stack">
        <h3>Basisgegevens</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="naam">Naam *</label>
            <input
              id="naam"
              type="text"
              value={persona.naam}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, naam: e.target.value }))}
              placeholder="Naam van de persona"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="taal">Taal *</label>
            <input
              id="taal"
              type="text"
              value={persona.taal}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, taal: e.target.value }))}
              placeholder="bijv. nl, en, ar"
            />
          </div>

          <div className="form-group">
            <label htmlFor="context">Context *</label>
            <input
              id="context"
              type="text"
              value={persona.context}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, context: e.target.value }))}
              placeholder="bijv. jongeren, nieuwkomers"
            />
          </div>

          <div className="form-group">
            <label htmlFor="niveau">Niveau (1-5) *</label>
            <input
              id="niveau"
              type="number"
              min="1"
              max="5"
              value={persona.niveau}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, niveau: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="beschrijving">Beschrijving *</label>
            <textarea
              id="beschrijving"
              value={persona.beschrijving}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, beschrijving: e.target.value }))}
              placeholder="Beschrijving van deze persona"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startsaldo">Startsaldo (€) *</label>
            <input
              id="startsaldo"
              type="number"
              step="0.01"
              value={persona.startsaldo}
              onChange={(e) => onUpdatePersona((p) => ({ ...p, startsaldo: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </section>

      {/* Dobbelwaarden */}
      <section className="mode-card paneel-stack">
        <h3>Dobbelwaardes</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="euro">? (€) *</label>
            <input
              id="euro"
              type="number"
              step="0.01"
              value={persona.dobbelWaarden.euro}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  dobbelWaarden: { ...p.dobbelWaarden, euro: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="tweeEuro">?? (€) *</label>
            <input
              id="tweeEuro"
              type="number"
              step="0.01"
              value={persona.dobbelWaarden.tweeEuro}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  dobbelWaarden: { ...p.dobbelWaarden, tweeEuro: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="drieEuro">??? (€) *</label>
            <input
              id="drieEuro"
              type="number"
              step="0.01"
              value={persona.dobbelWaarden.drieEuro}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  dobbelWaarden: { ...p.dobbelWaarden, drieEuro: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>
        </div>
      </section>

      {/* Leefgeldpotjes */}
      <section className="mode-card paneel-stack">
        <h3>Leefgeldpotjes (maandbudget)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="boodschappen">Boodschappen (€) *</label>
            <input
              id="boodschappen"
              type="number"
              step="0.01"
              value={persona.leefgeld.boodschappen}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  leefgeld: { ...p.leefgeld, boodschappen: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="vervoer">Vervoer (€) *</label>
            <input
              id="vervoer"
              type="number"
              step="0.01"
              value={persona.leefgeld.vervoer}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  leefgeld: { ...p.leefgeld, vervoer: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="fun">Fun (€) *</label>
            <input
              id="fun"
              type="number"
              step="0.01"
              value={persona.leefgeld.fun}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  leefgeld: { ...p.leefgeld, fun: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="overig">Overig (€) *</label>
            <input
              id="overig"
              type="number"
              step="0.01"
              value={persona.leefgeld.overig}
              onChange={(e) =>
                onUpdatePersona((p) => ({
                  ...p,
                  leefgeld: { ...p.leefgeld, overig: parseFloat(e.target.value) || 0 },
                }))
              }
            />
          </div>
        </div>
      </section>

      {/* Vaste Mutaties */}
      <VasteMutatiesEditor persona={persona} onUpdatePersona={onUpdatePersona} />

      {/* Kans Kaarten */}
      <KansKaartenEditor persona={persona} onUpdatePersona={onUpdatePersona} />

      {/* PlusMin Kaarten */}
      <PlusMinKaartenEditor persona={persona} onUpdatePersona={onUpdatePersona} />

      {/* JSON Preview */}
      <section className="mode-card paneel-stack">
        <h3>JSON Preview</h3>
        {isPersonaValid(persona) ? (
          <pre className="json-preview">{serializePersonaBestand({ soort: 'plusmin-persona', schemaVersie: 1, persona })}</pre>
        ) : (
          <p className="empty-state">Vul minimaal naam, taal, context en beschrijving in om een preview te zien.</p>
        )}
      </section>
    </>
  )
}

/**
 * VasteMutaties Editor
 */
function VasteMutatiesEditor({
  persona,
  onUpdatePersona,
}: {
  persona: Persona
  onUpdatePersona: (updater: (prev: Persona) => Persona) => void
}) {
  const handleAdd = () => {
    onUpdatePersona((p) => ({
      ...p,
      vasteMutaties: [
        ...p.vasteMutaties,
        {
          naam: '',
          type: 'inkomsten',
          bedrag: 0,
          betaaldag: 1,
        },
      ],
    }))
  }

  const handleDelete = (index: number) => {
    onUpdatePersona((p) => ({
      ...p,
      vasteMutaties: p.vasteMutaties.filter((_, i) => i !== index),
    }))
  }

  const handleUpdate = (index: number, updates: Partial<VasteMutatie>) => {
    onUpdatePersona((p) => ({
      ...p,
      vasteMutaties: p.vasteMutaties.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }))
  }

  return (
    <section className="mode-card paneel-stack">
      <div className="section-header">
        <h3>Vaste Mutaties (inkomsten & uitgaven)</h3>
        <button type="button" className="mini-button" onClick={handleAdd}>
          ➕ Toevoegen
        </button>
      </div>

      {persona.vasteMutaties.length === 0 ? (
        <p className="empty-state">Geen vaste mutaties. Klik op "Toevoegen" om er een aan te maken.</p>
      ) : (
        <div className="items-list">
          {persona.vasteMutaties.map((mutatie, index) => (
            <div key={index} className="item-row">
              <div className="form-grid compact">
                <div className="form-group">
                  <label>Naam</label>
                  <input
                    type="text"
                    value={mutatie.naam}
                    onChange={(e) => handleUpdate(index, { naam: e.target.value })}
                    placeholder="bijv. Huur"
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={mutatie.type}
                    onChange={(e) => handleUpdate(index, { type: e.target.value as 'inkomsten' | 'uitgave' })}
                  >
                    <option value="inkomsten">Inkomsten</option>
                    <option value="uitgave">Uitgave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Bedrag (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mutatie.bedrag}
                    onChange={(e) => handleUpdate(index, { bedrag: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Betaaldag (1-28)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={mutatie.betaaldag}
                    onChange={(e) => handleUpdate(index, { betaaldag: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <button type="button" className="mini-button danger" onClick={() => handleDelete(index)}>
                🗑️ Verwijder
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Kans Kaarten Editor
 */
function KansKaartenEditor({
  persona,
  onUpdatePersona,
}: {
  persona: Persona
  onUpdatePersona: (updater: (prev: Persona) => Persona) => void
}) {
  const handleAdd = () => {
    onUpdatePersona((p) => ({
      ...p,
      kansKaarten: [
        ...p.kansKaarten,
        {
          tekst: '',
          soort: 'plus',
          gevolg: 0,
        },
      ],
    }))
  }

  const handleDelete = (index: number) => {
    onUpdatePersona((p) => ({
      ...p,
      kansKaarten: p.kansKaarten.filter((_, i) => i !== index),
    }))
  }

  const handleUpdate = (index: number, updates: Partial<KansKaart>) => {
    onUpdatePersona((p) => ({
      ...p,
      kansKaarten: p.kansKaarten.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }))
  }

  return (
    <section className="mode-card paneel-stack">
      <div className="section-header">
        <h3>Kanskaarten (Plus/Min)</h3>
        <button type="button" className="mini-button" onClick={handleAdd}>
          ➕ Toevoegen
        </button>
      </div>

      {persona.kansKaarten.length === 0 ? (
        <p className="empty-state">Geen kanskaarten. Klik op "Toevoegen" om er een aan te maken.</p>
      ) : (
        <div className="items-list">
          {persona.kansKaarten.map((kaart, index) => (
            <div key={index} className="item-row">
              <div className="form-grid compact">
                <div className="form-group full-width">
                  <label>Tekst</label>
                  <textarea
                    value={kaart.tekst}
                    onChange={(e) => handleUpdate(index, { tekst: e.target.value })}
                    placeholder="Kaart tekst"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Soort</label>
                  <select
                    value={kaart.soort}
                    onChange={(e) => handleUpdate(index, { soort: e.target.value as 'plus' | 'min' })}
                  >
                    <option value="plus">➕ Plus (meevaller)</option>
                    <option value="min">➖ Min (tegenvaller)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gevolg (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={kaart.gevolg}
                    onChange={(e) => handleUpdate(index, { gevolg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <button type="button" className="mini-button danger" onClick={() => handleDelete(index)}>
                🗑️ Verwijder
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * PlusMin Kaarten Editor
 */
function PlusMinKaartenEditor({
  persona,
  onUpdatePersona,
}: {
  persona: Persona
  onUpdatePersona: (updater: (prev: Persona) => Persona) => void
}) {
  const handleAdd = () => {
    onUpdatePersona((p) => ({
      ...p,
      plusMinKaarten: [
        ...p.plusMinKaarten,
        {
          tekst: '',
          keuzeTekst1: '',
          gevolg1: 0,
          keuzeTekst2: '',
          gevolg2: 0,
          geenKeuzeTekst: '',
          gevolgGeenKeuze: 0,
        },
      ],
    }))
  }

  const handleDelete = (index: number) => {
    onUpdatePersona((p) => ({
      ...p,
      plusMinKaarten: p.plusMinKaarten.filter((_, i) => i !== index),
    }))
  }

  const handleUpdate = (index: number, updates: Partial<PlusMinKaart>) => {
    onUpdatePersona((p) => ({
      ...p,
      plusMinKaarten: p.plusMinKaarten.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }))
  }

  return (
    <section className="mode-card paneel-stack">
      <div className="section-header">
        <h3>PlusMin Kaarten (dilemma's)</h3>
        <button type="button" className="mini-button" onClick={handleAdd}>
          ➕ Toevoegen
        </button>
      </div>

      {persona.plusMinKaarten.length === 0 ? (
        <p className="empty-state">Geen PlusMin kaarten. Klik op "Toevoegen" om er een aan te maken.</p>
      ) : (
        <div className="items-list">
          {persona.plusMinKaarten.map((kaart, index) => (
            <div key={index} className="item-row">
              <div className="form-grid compact">
                <div className="form-group full-width">
                  <label>Kaart Tekst</label>
                  <textarea
                    value={kaart.tekst}
                    onChange={(e) => handleUpdate(index, { tekst: e.target.value })}
                    placeholder="Beschrijving van het dilemma"
                    rows={2}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Keuze 1 (tekst)</label>
                  <input
                    type="text"
                    value={kaart.keuzeTekst1}
                    onChange={(e) => handleUpdate(index, { keuzeTekst1: e.target.value })}
                    placeholder="Eerste keuze"
                  />
                </div>

                <div className="form-group">
                  <label>Gevolg 1 (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={kaart.gevolg1}
                    onChange={(e) => handleUpdate(index, { gevolg1: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Keuze 2 (tekst)</label>
                  <input
                    type="text"
                    value={kaart.keuzeTekst2}
                    onChange={(e) => handleUpdate(index, { keuzeTekst2: e.target.value })}
                    placeholder="Tweede keuze"
                  />
                </div>

                <div className="form-group">
                  <label>Gevolg 2 (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={kaart.gevolg2}
                    onChange={(e) => handleUpdate(index, { gevolg2: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Geen Keuze (tekst)</label>
                  <input
                    type="text"
                    value={kaart.geenKeuzeTekst}
                    onChange={(e) => handleUpdate(index, { geenKeuzeTekst: e.target.value })}
                    placeholder="Als geen keuze gemaakt"
                  />
                </div>

                <div className="form-group">
                  <label>Gevolg Geen Keuze (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={kaart.gevolgGeenKeuze}
                    onChange={(e) => handleUpdate(index, { gevolgGeenKeuze: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <button type="button" className="mini-button danger" onClick={() => handleDelete(index)}>
                🗑️ Verwijder
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Index Workflow Tab: Scan, compare, generate, download
 */
function IndexWorkflowTab() {
  const [scannedFiles, setScannedFiles] = useState<Array<{ pad: string; naam: string; taal: string; context: string; beschrijving: string; niveau: number }>>([])
  const [scanMessage, setScanMessage] = useState<string>('')

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return

    const pmsFiles: typeof scannedFiles = []
    let indexContent: any = null

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.name === 'index.pms') {
        const text = await file.text()
        try {
          indexContent = JSON.parse(text)
        } catch {
          setScanMessage(`Fout bij parsen van index.pms: ${file.name}`)
          return
        }
      } else if (file.name.endsWith('.pms')) {
        const text = await file.text()
        try {
          const data = JSON.parse(text)
          const persona = data.persona
          pmsFiles.push({
            pad: file.name,
            naam: persona.naam,
            taal: persona.taal,
            context: persona.context,
            beschrijving: persona.beschrijving,
            niveau: persona.niveau,
          })
        } catch {
          setScanMessage(`Fout bij parsen van ${file.name}`)
          return
        }
      }
    }

    setScannedFiles(pmsFiles)

    // Compare with index if available
    if (indexContent) {
      const scanWithMetadata = pmsFiles.map(f => ({
        ...f,
        metadata: {
          naam: f.naam,
          taal: f.taal,
          context: f.context,
          beschrijving: f.beschrijving,
          niveau: f.niveau,
        },
        lastModified: Date.now(),
      }))
      const diff = vergelijkIndexMetScan(scanWithMetadata, indexContent)
      setScanMessage(formateerDiffReport(diff))
    } else {
      setScanMessage(`${pmsFiles.length} .pms bestanden gevonden. Geen bestaande index.pms gevonden.`)
    }
  }

  const handleGenerateIndex = () => {
    const index = genereeerIndex(scannedFiles.map(f => ({
      ...f,
      lastModified: Date.now(),
    })))
    downloadIndex(index)
    setScanMessage('Index gegenereerd en gedownload als index.pms')
  }

  return (
    <>
      <section className="mode-card paneel-stack">
        <h3>📑 Index Workflow</h3>
        <p>Selecteer .pms bestanden uit je map. Optioneel ook een bestaande index.pms om verschillen te zien.</p>

        <label className="action-button" style={{ cursor: 'pointer', margin: '0' }}>
          📂 Selecteer .pms bestanden
          <input
            type="file"
            accept=".pms"
            multiple
            onChange={(e) => handleFilesSelected(e.currentTarget.files)}
            style={{ display: 'none' }}
          />
        </label>

        {scanMessage && (
          <div className="message-box">
            <pre>{scanMessage}</pre>
          </div>
        )}
      </section>

      {scannedFiles.length > 0 && (
        <>
          <section className="mode-card paneel-stack">
            <h3>📋 Gescande Bestanden ({scannedFiles.length})</h3>
            <div className="items-list">
              {scannedFiles.map((file, index) => (
                <div key={index} className="item-row">
                  <div>
                    <strong>{file.naam}</strong>
                    <div className="meta">
                      {file.pad} • {file.context} • {file.taal} • Niveau {file.niveau}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mode-card paneel-stack">
            <h3>✅ Index genereren & downloaden</h3>
            <button type="button" className="action-button" onClick={handleGenerateIndex}>
              ⬇️ Genereer & Download index.pms
            </button>
          </section>
        </>
      )}
    </>
  )
}
