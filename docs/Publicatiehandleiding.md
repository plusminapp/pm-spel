# Publicatiehandleiding: `.pms` en `index.pms`

## Doel
Deze handleiding beschrijft hoe je persona-bestanden beheert en publiceert voor spelers.

## 1. Persona's maken of aanpassen
1. Open Ontwikkelaar-modus.
2. Maak een nieuwe persona of importeer een bestaande `.pms`.
3. Werk velden, mutaties en kaarten bij.
4. Exporteer als `.pms`.

Belangrijk:
- Zonder expliciete export gaan wijzigingen verloren.

## 2. Index genereren
1. Open in Ontwikkelaar-modus de tab `Index Workflow`.
2. Selecteer alle `.pms` bestanden uit je map.
3. Selecteer optioneel de bestaande `index.pms` voor vergelijking.
4. Controleer verschillen.
5. Klik `Genereer & Download index.pms`.

Gegenereerde index bevat alleen metadata:
- naam
- taal
- context
- beschrijving
- niveau
- pad
- timestamp
- directory hash

## 3. Publiceren
Plaats op je publicatielocatie:
- alle relevante `.pms` bestanden
- de nieuwste `index.pms`

Publicatielocatie moet via HTTPS bereikbaar zijn.

## 4. Curated/Open gedrag
- Curated mode: alleen same-origin + allowlist domeinen.
- Open mode: alle HTTPS-domeinen toegestaan.

Aanbeveling:
- Gebruik curated als standaard publicatiekanaal.

## 5. Validatie en foutafhandeling
Bij ongeldige JSON of schema-afwijkingen:
- import wordt geweigerd
- gebruiker krijgt duidelijke foutmelding

Dit voorkomt dat corrupte data in runtime terechtkomt.

## 6. Release-tip
Na publicatie:
1. Laad de `index.pms` in Spelmodus.
2. Filter op context/taal/niveau.
3. Laad minimaal een persona en test kaartflow.
4. Verifieer deel-URL + QR.
