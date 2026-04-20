# PlusMin Spel-app

Release-kandidaat webapp voor het PlusMin budgetspel.

## Kernfunctionaliteit
- Spelmodus met kaartengine (Plus, Min, PlusMin en dobbelwaarden)
- Ontwikkelaar-modus voor volledige persona-bewerking
- Import/export van `.pms` (JSON) bestanden
- Index-workflow (`index.pms`) met scan, compare, generate en download
- Remote discovery via `index.pms`: metadata eerst, volledige persona pas na selectie
- Delen van remote persona via URL en QR
- Curated/Open mode met domeinbeleid
- PWA app-shell (manifest + service worker)

## Technische principes
- Stateless runtime: geen `localStorage`, `sessionStorage` of `IndexedDB` voor state
- Fail-closed validatie op alle inkomende JSON (`.pms` en `index.pms`)
- Sanitization van tekstvelden bij validatie
- Geen backend/database; bestanden zijn het systeem van record

## Projectstructuur
- `src/pages/GameModePage.tsx`: spelerflow, remote discovery, delen, kaartspel
- `src/pages/DeveloperModePage.tsx`: persona-editor, dirty-state, index workflow
- `src/features/persona/*`: validatie, serialisatie, import, source-mode, index-tools
- `src/features/game/engine.ts`: pure game engine
- `src/features/pwa/register.ts`: service worker registratie
- `public/manifest.webmanifest`, `public/sw.js`: PWA assets

## Run / Build / Test
1. Installeer dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Productiebuild:
   - `npm run build`
4. Testsuite:
   - `npm test`

## Curated allowlist configuratie
De curated domeinallowlist is configureerbaar via:
- `VITE_CURATED_ALLOWLIST=https://domein1.tld,https://domein2.tld`

De app accepteert in curated mode:
- dezelfde origin
- domeinen uit de allowlist

Open mode accepteert alle geldige HTTPS-bronnen, met duidelijke risicouitleg in de UI.

## Security hardening
Nginx-configuraties bevatten strikte headers:
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

Zie:
- `conf/nginx/conf.d/lcl.default.conf`
- `conf/nginx/conf.d/stg.default.conf`

## Offline gedrag
- App-shell en same-origin assets worden gecachet door de service worker.
- Offline spelen werkt met al beschikbare/lokaal geimporteerde data.
- Remote third-party bronnen blijven afhankelijk van netwerk/CORS/CSP.

## Beperkingen
- Geen automatische opslag van spelstatus
- Geen backend upload/publicatieproces
- Lokale (niet-URL) persona's zijn niet via deeplink reproduceerbaar deelbaar

## Aanvullende documentatie
- `docs/Publicatiehandleiding.md`
- `docs/requirements-traceability.md`
- `docs/release-checklist.md`
