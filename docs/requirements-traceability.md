# Requirements Traceability (prompt.md)

Legenda:
- voldaan
- deels voldaan
- open

## User stories: Spelontwikkelaar
1. Nieuwe persona opvoeren
- Status: voldaan
- Bewijs: volledige editor in Ontwikkelaar-modus

2. Persona importeren vanuit `.pms`
- Status: voldaan
- Bewijs: lokale importflow en validatie

3. Gepubliceerde persona gebruiken als startpunt (`opslaan als`)
- Status: deels voldaan
- Reden: import + aanpassen + export kan, maar expliciete `Opslaan als`-actie/naamgeving is niet apart uitgewerkt
- Vervolg: aparte `Opslaan als...` interactie met bestandsnaam suggestie toevoegen

4. Persona exporteren naar `.pms`
- Status: voldaan
- Bewijs: exportknop, validatie vooraf

5. Teksten in eigen taal invoeren
- Status: voldaan
- Bewijs: vrije tekstvelden blijven unicode-safe en zonder forced locale mapping

6. Van folder met `.pms` een `index.pms` genereren
- Status: voldaan
- Bewijs: scan/compare/generate/download workflow

## User stories: Speler
1. Gepubliceerde persona's filteren via `index.pms`
- Status: voldaan
- Bewijs: remote index-load + metadata filtering in Spelmodus

2. Een of meerdere persona-bestanden importeren (lokaal of URL)
- Status: voldaan
- Bewijs: lokale multi-file import + URL import met mode-regels

3. Persona kiezen om mee te spelen
- Status: voldaan
- Bewijs: selectie uit geladen runtime lijst

4. Gekozen persona delen met andere spelers
- Status: deels voldaan
- Reden: deel-URL + QR werken voor remote geladen persona's; lokale-only persona's hebben geen reproduceerbare bron-URL
- Vervolg: optionele gedeelde statische hosting-flow/documentatiestap verduidelijken of signed payload-link introduceren (zonder persistente state)

5. Plus/Min/PlusMin kaarten trekken met random zonder teruglegging en reset per soort
- Status: voldaan
- Bewijs: game engine tests voor without-replacement + reset + keuzeflow

6. Gevolgen van keuze of geen keuze lezen
- Status: voldaan
- Bewijs: resultaatkaart en keuze-overlay tonen uitkomsttekst + bedrag

## Technische constraints trace
1. Geen database / geen browser persistence voor state
- Status: voldaan
- Bewijs: geen local/session/indexedDB gebruik in src

2. Strikte validatie + sanitization van inkomende bestanden
- Status: voldaan
- Bewijs: parse/validation pipelines voor persona en index

3. Curated/Open mode policy
- Status: voldaan
- Bewijs: enforced in URL policy helper en import/remote catalog flow

4. PWA installeerbaar en offline app-shell
- Status: voldaan
- Bewijs: manifest + service worker + registratie

## Samenvatting
- Kritieke stories: voldaan
- Deels voldaan items: 2 (opslaan-als UX, delen van lokale-only persona)
- Open blockers: geen
