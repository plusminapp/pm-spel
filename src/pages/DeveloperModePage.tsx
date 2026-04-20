import { PersonaImportPane } from '@/components/PersonaImportPane'
import { downloadPersonaBestand } from '@/features/persona/io'
import { usePersonaRuntime } from '@/features/persona/runtime'
import { serializePersonaBestand } from '@/features/persona/serialization'

export function DeveloperModePage() {
  const { personas, geselecteerdePersonaId, selecteerPersona } = usePersonaRuntime()
  const geselecteerdePersona = personas.find((item) => item.id === geselecteerdePersonaId) ?? personas[0] ?? null

  return (
    <div className="page-stack">
      <section className="mode-card paneel-stack" aria-labelledby="ontwikkelaar-title">
        <h2 id="ontwikkelaar-title">Ontwikkelaar-modus</h2>
        <p>
          In deze fase staat de bestandslaag centraal: .pms importeren, valideren, sanitizen en weer exporteren zonder persistente opslag.
        </p>
      </section>

      <PersonaImportPane
        titel="Persona's inlezen voor ontwikkeling"
        beschrijving="Gebruik deze importflow om een persona als basis te laden. In latere fases komt hier de volledige editor bovenop."
      />

      <section className="mode-card paneel-stack" aria-labelledby="export-title">
        <h3 id="export-title">Export en validatie</h3>
        {personas.length === 0 ? (
          <p>Er is nog geen persona geladen om te exporteren.</p>
        ) : (
          <>
            <div className="list-stack compact">
              {personas.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === geselecteerdePersona?.id ? 'list-card active' : 'list-card'}
                  onClick={() => selecteerPersona(item.id)}
                >
                  <strong>{item.metadata.naam}</strong>
                  <span>{item.bronLabel}</span>
                </button>
              ))}
            </div>

            {geselecteerdePersona && (
              <>
                <div className="button-row">
                  <button type="button" className="action-button" onClick={() => downloadPersonaBestand(geselecteerdePersona.bestand)}>
                    Download .pms
                  </button>
                </div>
                <pre className="json-preview">{serializePersonaBestand(geselecteerdePersona.bestand)}</pre>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
