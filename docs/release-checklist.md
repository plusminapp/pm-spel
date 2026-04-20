# Release Checklist (Fase 6)

## Build & test
- [x] `npm run build` groen
- [x] `npm test` groen
- [x] Regressietests voor kritieke flows aanwezig

## Functioneel
- [x] Spelmodus werkt
- [x] Ontwikkelaar-modus werkt
- [x] Import/export `.pms` werkt
- [x] Index scan/compare/generate werkt
- [x] Remote discovery via index + selectieflow werkt
- [x] Kaartengine (Plus/Min/PlusMin) werkt
- [x] Delen via URL + QR werkt (remote persona)

## Security & mode
- [x] Curated mode is default
- [x] Curated mode blokkeert niet-whitelist domeinen
- [x] Open mode laat HTTPS bronnen toe met duidelijke waarschuwing
- [x] Fail-closed bij ongeldige JSON / netwerk / CORS / CSP fouten
- [x] CSP/security headers toegevoegd in Nginx configuraties

## PWA
- [x] Manifest aanwezig
- [x] Service worker registratie aanwezig
- [x] Offline app-shell gedrag bevestigd

## Overig
- [x] Help-pagina werkt
- [x] Geen verboden browser storage voor state
- [x] Documentatie bijgewerkt (README + publicatiehandleiding + traceability)

## Handmatige validatie (aanbevolen laatste check)
1. Laad remote `index.pms` in curated mode (toegestane en geblokkeerde domeinen)
2. Schakel naar open mode en herhaal
3. Laad persona, speel kaarten, test PlusMin-keuze
4. Kopieer deel-URL en open in nieuw tabblad
5. Installeer PWA vanuit browser prompt
6. Simuleer offline en controleer app-shell + eerder beschikbare data
