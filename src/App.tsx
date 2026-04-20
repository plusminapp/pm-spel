import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import './App.css'
import { PersonaRuntimeProvider } from './features/persona/runtime'
import { SpelHelp } from './pages/Spel/Help'
import { DeveloperModePage } from './pages/DeveloperModePage'
import { GameModePage } from './pages/GameModePage'

export default function App() {
  return (
    <PersonaRuntimeProvider>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand-block">
            <h1>PlusMin Spel</h1>
            <p>Fase 5: remote discovery, delen via URL en QR, Curated/Open mode en PWA app-shell.</p>
          </div>
          <nav className="main-nav" aria-label="Hoofdnavigatie">
            <NavLink to="/" end>Spelmodus</NavLink>
            <NavLink to="/ontwikkelaar">Ontwikkelaar-modus</NavLink>
            <NavLink to="/help">Help</NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<GameModePage />} />
            <Route path="/ontwikkelaar" element={<DeveloperModePage />} />
            <Route path="/help" element={<SpelHelp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </PersonaRuntimeProvider>
  )
}
