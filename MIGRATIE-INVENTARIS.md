# Spel migratie-inventaris (2026-04-02)

## Verhuisd naar pm-spel

- Broncode: `src/pages/Spel/**` (inclusief `components`, `categorize`, `parsers`, `export`, `__tests__`)
- Extra asset buiten Spel-map:
  - `src/assets/plusminlogo.png`
- Publieke resources:
  - `public/docs/spel/Spel.md`
  - `public/docs/spel/Spel.pdf`
  - `public/docs/spel/genereer.sh`
  - `public/docs/spel/toc-naar-nieuwe-pagina.tex`
  - `public/docs/spel/images/**`
  - `public/docs/spel/voorbeelden/**`
- Build-helper script:
  - `build-spel-pdf.sh` (aangepast naar `pm-spel` pad)

## In pm-spel nieuw ingericht

- Zelfstandige Vite + React + TypeScript setup
- Router:
  - `/` -> `Spel`
  - `/help` -> `SpelHelp`
- Tailwind + MUI basisstyling voor bestaande componenten
- Vitest setup (`src/test/setup.ts`)

## Niet meeverhuisd (bewust)

- PM-frontend integraties:
  - Routes/lazy imports in `pm-frontend/src/App.tsx`
  - Sidebar menu-item in `pm-frontend/src/components/AppSidebar.tsx`
  - i18n labels in `pm-frontend/src/i18n.ts`
- Superpowers documentatie/plannen in `pm-frontend/docs/superpowers/**`

## Validatie

- `npm install`: geslaagd
- `npm run build`: geslaagd
- `npm test`: 2 bestaande testfouten in `exportPdf.test.ts` (overgenomen uit gemigreerde codebase)
