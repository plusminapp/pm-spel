# **Prompt PlusMin Spel-app**

### **Inleiding**

Stichting PlusMin heeft een concept ontwikkeld voor een spel waarmee de PlusMin-budgetteermethode (met potjes) op een speelse manier wordt aangeleerd. Het spel bestaat o.a. uit een oprolbaar spelbord (een doek van 45x45 cm) en een bestickerde dobbelsteen. Het spelbord is opgebouwd als een ganzenbord met vier kanten, elk voorstellende ��n week, wat neerkomt op 28 dagen. 

De (zeskantige) dobbelsteen heeft de volgende symbolen: 

* ? , ?? en ???: Bepalen het bedrag voor de boodschappen dat de speler die beurt moet doen.
* (Plus), � (PlusMin) en \- (Min): Een Plus-kaart staat voor een meevaller (je krijgt geld). Een Min-kaart staat voor een tegenvaller (je moet betalen). Een PlusMin-kaart stelt een dilemma voor. Hierbij moet de speler een keuze maken. De gevolgen van deze keuze kunnen positief of negatief zijn en zijn soms verrassend.

In het spel maken we gebruik van verschillende persona's. Voorafgaand aan de start wordt een persona gekozen (of elke speler kiest een eigen persona). Deze keuze bepaalt:

* Het startsaldo op de rekening.  
* Het periodieke inkomen en de vaste lasten (datum en bedrag).  
* De waarden voor de symbolen ?, ?? en ???.  
* Per 'Leefgeld-potje' (boodschappen, vervoer, fun en overig) een richtbedrag. Omdat deze richtbedragen deelbaar zijn door 28, is het dagbedrag eenvoudig te berekenen.  
* De specifieke Plus/Min/PlusMin-kaarten die in dit spel worden gebruikt.

Om kosten te besparen en flexibiliteit te vergroten, willen we de persona's en de Plus/Min/PlusMin-kaarten via een webapp aanbieden. In dit document worden de requirements voor deze app beschreven.

### **Gebruikers**

We onderscheiden twee rollen in de app: de **spelontwikkelaar** (die ook de ontwikkelde persona?s, buiten de app om, kan publiceren) en de **speler**.

**De spelontwikkelaar:** Deze gebruiker cre�ert nieuwe persona's met alle bijbehorende informatie. De primaire behoefte is een scherm om persona's en kaarten in te lezen, te wijzigen en te exporteren. 

**De speler:** Deze gebruiker speelt het spel. De speler wil een persona kunnen kiezen, de informatie over die persona delen met medespelers door de URL van de persona als QR code te tonen, en tijdens het spel de Plus-, Min- en PlusMin-kaarten trekken (inclusief de gevolgen van de keuzes bij een PlusMin-kaart). We verwachten dat de speler primair een telefoon/tablet gebruikt. 

De gebruiker hoeft niet in te loggen. Bij het starten van de app start deze direct in **Spelmodus** (en dus met de rol speler). De gebruiker moet kunnen wisselen naar de **Spelontwikkelaar-modus** (of vice versa).

### **Overzicht**

Het doel van de spel app is dat iedereen zelf een persona kan ontwikkelen en/of met een (eventueel door een ander ontwikkelde) persona het spel kan spelen. PlusMin zal zelf een aantal standaard persona's publiceren. Anderen kunnen een persona-bestand importeren, wijzigen, exporteren en verspreiden. Een speler kan dit aangepaste bestand vervolgens laden en ermee spelen.

Dit stelt vertegenwoordigers en hulpverleners van specifieke doelgroepen in staat om hun eigen problematiek in het spel te verwerken. Denk hierbij aan jongeren, nieuwkomers in Nederland, of specifieke groepen binnen de allochtone gemeenschap. In dit document verwijzen we naar zo'n specifieke doelgroep met de term **context**.

### **Datamodel**

Het datamodel is eenvoudig: 

* Centrale entiteit is de Persona  
  * naam: string  
  * taal: string (of enum?)  
  * context: string  
  * beschrijving: string  
  * niveau: integer  
  * startsaldo: bedrag (?)  
  * waarde ?, ?? en ???: 3x bedrag (?)  
  * boodschappen, vervoer, fun en overig: bedrag (?)  
* De persona heeft meerdere inkomsten en vaste lasten (Vast In/Uit)  
  * naam: string  
  * in/uit: string/enum  
  * bedrag: bedrag (?)  
  * betaaldag: integer 1-28, dag in de maand  
* De persona heeft meerdere kanskaarten (de Plus- en Min-kaarten)  
  * tekst: string  
  * soort: string/enum (+ of \-)  
  * gevolg: bedrag (?)  
* De persona heeft meerdere PlusMin-kaarten  
  * tekst: string  
  * keuzetekst1: string  
  * gevolg1: bedrag (?)  
  * keuzetekst2: string  
  * gevolg2: bedrag (?)  
  * geenkeuzetekst: string  
  * gevolggeenkeuze: bedrag (?)

Het datamodel moet zodanig worden ge�mplementeerd dat een volledige persona kan worden geserialiseerd naar ��n JSON-bestand.

**Bestandsformaat en Extensie:**

* Alle persona-bestanden hebben de extensie **.pms**.  
* Technisch gezien zijn dit **JSON-bestanden**.  
* De bestanden moeten zelfbeschrijvend en compleet zijn, zodat ze onafhankelijk van de applicatie kunnen worden gelezen, gedeeld en bewerkt.

### **Indexering (index.pms)**

Op de publicatielocatie (de server of map waar de bestanden staan) **MOET** een bestand genaamd **index.pms** aanwezig zijn. Dit bestand fungeert als de centrale catalogus voor de app.

* **Inhoud van de index:**
  * **Laatste Update**: Een verplichte timestamp (datum en tijd) van de laatste keer dat de index is gegenereerd.
  * **Bestandslijst**: Voor elk `.pms` bestand in de folder (en subfolders) bevat de index:
    * Het pad vanaf de geopende folder.
    * De metadata uit elk bestand: **Naam**, **Taal**, **Context**, **Beschrijving** en **Niveau** (niet de volledige data zoals vaste lasten of kaarten).
    * Een **hash-code** van de namen en de laatste wijzigingsdatum/tijd van alle bestanden in de directory.

* **Workflow voor de Spelontwikkelaar:**
  De ontwikkelaar is verantwoordelijk voor het accuraat houden van de catalogus via de volgende stappen:
  1.  **Map Scannen**: De ontwikkelaar opent een lokale map met `.pms` bestanden in de app.
  2.  **Vergelijken**: De app scant de inhoud van de map en vergelijkt deze met de huidige `index.pms`.
  3.  **Verschillen Markeren**: De app markeert visueel de verschillen (bijv. "Bestand X ontbreekt", "Persona Y is nieuw" of "Inhoud van Z is gewijzigd").
  4.  **Genereren & Downloaden**: De ontwikkelaar klikt op de actie **"Genereer & Download Index"**. De app maakt een nieuw `index.pms` bestand aan inclusief de actuele metadata en de huidige tijdstempel.
  5.  **Publiceren**: De nieuwe `index.pms` wordt samen met de (nieuwe/gewijzigde) persona-bestanden naar de server ge�pload.

* **Doel voor de Speler:**
  De `index.pms` wordt gebruikt om de speler in staat te stellen te zoeken en te filteren in de beschikbare `.pms` bestanden (op context, taal, niveau) voordat ze een bestand volledig in het geheugen laden. Als de speler een `.pms` bestand heeft gekozen haalt de app dat bestand op.

### **User Stories**

**Spelontwikkelaar** 

* Als spelontwikkelaar wil ik een nieuwe persona kunnen opvoeren, zodat ik een nieuw spel kan ontwikkelen.   
* Als spelontwikkelaar wil ik een persona kunnen importeren vanuit een bestand (.pms), zodat ik een bestaande persona kan wijzigen.
* Als spelontwikkelaar wil ik een gepubliceerde persona kunnen gebruiken als startpunt voor een nieuwe persona, zodat ik kan voortborduren op het werk van anderen ('opslaan als').
* Als spelontwikkelaar wil ik een persona kunnen exporteren naar een bestand (.pms), zodat ik deze kan bewaren.   
* Als spelontwikkelaar wil ik teksten in mijn eigen taal kunnen invoeren, zodat ik taalspecifieke versies kan maken.   
* Als spelontwikkelaar wil ik van een folder met .pms bestanden een index.pms kunnen genereren om de folder van de juiste index te voorzien  

**Speler** 

* Als speler wil ik de beschikbare, gepubliceerde persona's kunnen filteren op context, taal, niveau en beschrijving (via de index.pms), zodat ik een specifieke persona kan kiezen.   
* Als speler wil ik een of meerdere persona-bestanden (.pms) kunnen importeren (lokaal of via URL), zodat ik met een niet-gepubliceerde persona('s) kan spelen.   
* Als speler wil ik een persona kunnen kiezen om mee te spelen.   
* Als speler wil ik de gekozen persona kunnen delen met andere spelers, zodat iedereen kan deelnemen.   
* Als speler wil ik een Plus-, PlusMin- of Min-kaart kunnen trekken wanneer er wordt gedobbeld. De kaarten moeten random, zonder teruglegging worden aangeboden. Als alle kaarten (van een soort) zijn gebruikt worden alle kaarten (van die soort) weer in het spel gebracht. Als speler wil ik bij een PlusMin-kaart de keuze kunnen maken.  De keuzeknoppen voor de kaarten zijn op mobiel schermvullend
* Als speler wil ik bij een keuze de gevolgen daarvan (of van het niet kiezen) kunnen lezen.


### **Technische Constraints en Architectuur**

**Opslag en Persistentie** Opslag is niet in een database maar zijn JSON-bestanden op het filesysteem. Er wordt ook geen gebruik gemaakt van sessionStorage, localStorage of IndexedDB in de browser. De applicatie is volledig stateless: data bestaat uitsluitend in het werkgeheugen (RAM) tijdens de actieve sessie. De enige vorm van persistentie is het expliciet downloaden of lokaal opslaan van een .pms bestand door de gebruiker. 

Naast opslag op het lokale file systeem van de gebruiker is remote opslag nodig om de persona?s van het internet te kunnen downloaden. Dit zijn een statische bestandslocaties (folder/filesysteem, S3 bucket, of webdirectory) die via HTTPS benaderbaar zijn. Het bevat de .pms bestanden en een index.pms.

**De beheerder van een remote locatie** plaatst bestanden direct in deze folder (via FTP, S3 console, of git deploy). Er is geen aparte admin-interface nodig in de app voor dit proces.

**Lokale werkwijze (speler en ontwikkelaar):** De applicatie laadt een persona door een .pms bestand te importeren (via file picker, drag-and-drop, of URL). Alle verdere acties (spelen, bewerken, kaarten trekken) vinden plaats in het werkgeheugen. Opslag gebeurt uitsluitend door de gebruiker expliciet een .pms bestand te laten bewaren op het eigen bestandssysteem. Er is geen automatische opslag.

**Security en Content Security Policy (CSP)**  PlusMin publiceert de .pms bestanden op **dezelfde server** (zelfde origin) als waar de webapp zelf staat. Andere spelontwikkelaars kunnen op een ander domein publiceren. Dit moet, met maximale restricties, worden toegestaan. De gebruiker kiest in de UI: "Curated Mode" of "Open Mode". In Curated mode worden alleen domeinen, die door PlusMin op een whitelist zijn gezet, geaccepteerd. In Open mode worden alle domeinen geaccepteerd. De app start altijd in Curated mode. Bij het importeren van een .pms bestand moet de structuur streng worden gevalideerd en gesanitised tegen het verwachte datamodel, voordat de data in het werkgeheugen wordt geladen. Corrupte of ongeldige bestanden moeten worden geweigerd met een duidelijke foutmelding. 

**Gebruiksflow en UX**  Omdat er geen automatische opslag is, moet de applicatie de spelontwikkelaar waarschuwen bij het verlaten of sluiten van de pagina als er niet-opgeslagen wijzigingen zijn. De UX moet het de gebruiker duidelijk maken dat het bewaren van het bestand de enige manier is om voortgang te bewaren.

De applicatie moet werken als een **Progressive Web App (PWA)** zodat deze op telefoons en tablets kan worden ge�nstalleerd en een app-achtige ervaring biedt, ook offline (mits de bestanden lokaal zijn gedownload).

**Navigatie:** De app start standaard in de **Spelmodus**. Een duidelijke navigatie (bijv. klikken op het logo) schakelt over naar de **Ontwikkelaar-modus**

### Referentie architectuur

Op ../pm-spel staat een applicatie met vergelijkbare architectuur: state management uitsluitend door het importeren/exporteren van bestanden en een stricte CSP. Maak een clone van dat project en kleed het helemaal uit tot alleen het framework nog staat; laat voor toekomstige gebruik de help pagina functionaliteit intact