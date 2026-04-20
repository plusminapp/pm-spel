import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import './App.css'
import { BudgetScannerHelp } from './pages/BudgetScanner/Help'
import { DeveloperModePage } from './pages/DeveloperModePage'
import { GameModePage } from './pages/GameModePage'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <h1>PlusMin Spel</h1>
          <p>Fase 1 skeleton: spelmodus standaard, ontwikkelaar-modus en help beschikbaar.</p>
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
          <Route path="/help" element={<BudgetScannerHelp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
