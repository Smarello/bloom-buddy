# Bloom Buddy — Consigli Visivi di Posizionamento — PRD #3

**Author:** AIRchetipo
**Date:** 2026-03-30
**Version:** 1.0

---

## Elevator Pitch

> Per **utenti di Bloom Buddy che ricevono una diagnosi di pianta sofferente**, che hanno il problema di **non riuscire a visualizzare concretamente dove e come posizionare la pianta**, questa funzionalità aggiunge un **collage di scenari illustrati** che **mostra visivamente il posizionamento ideale per luce, ambiente e vaso**. A differenza di **consigli solo testuali**, il collage **comunica in modo immediato e intuitivo cosa fare, senza richiedere conoscenze botaniche**.

---

## Vision

Trasformare i consigli di cura da testo da leggere a guida visiva da seguire — un colpo d'occhio vale più di un paragrafo.

### Product Differentiator

Il collage viene composto dinamicamente dall'AI in base alla pianta e al problema specifico. Non è un'illustrazione generica: è un consiglio visivo personalizzato costruito combinando template illustrati selezionati da Gemini durante l'analisi.

---

## User Personas

### Persona 1: Giulia

**Contesto d'uso di questa feature:**
Giulia ha appena fotografato la sua Pothos con foglie ingiallite. Bloom Buddy le dice "troppa luce diretta, sposta in zona con luce indiretta brillante, vaso attuale adeguato". Con il collage, Giulia *vede* esattamente cosa significa: una card con la pianta vicino a una finestra con tenda filtrante, un'altra con la posizione "vicino alla finestra" nel soggiorno. Non deve interpretare il testo — guarda e capisce.

**Pain point risolto:** "Mi dicono 'luce indiretta' ma non so cosa vuol dire in pratica."

### Persona 2: Marco

**Contesto d'uso di questa feature:**
Marco fotografa il basilico con foglie gialle sul balcone esposto a sud. Il collage gli mostra: card "sole del mattino" (esposizione est), card "balcone riparato", card "fioriera da balcone" con dimensioni consigliate. Può mostrare le card ai figli: "Guarda, dobbiamo spostarlo qui."

**Pain point risolto:** "Non so se il problema è il sole, il vaso o la posizione — con le immagini capisco subito."

---

## Brainstorming Insights

> Scoperte chiave emerse durante la sessione di inception.

### Assumptions Challenged

1. **"Serve l'image generation AI per mostrare consigli visivi"** — No. Un sistema a template SVG/React composti dinamicamente offre risultati più coerenti, più economici (zero costi API aggiuntivi) e più veloci (rendering istantaneo) rispetto a DALL-E o Gemini image generation.

2. **"Bastano pochi scenari generici"** — No. L'analisi botanica ha rivelato 29 scenari distinti e realistici. Ridurre troppo significherebbe dare consigli vaghi — l'opposto dell'obiettivo.

3. **"Il collage deve apparire sempre"** — No. Mostrarlo solo quando la pianta ha bisogno di cure evita rumore visivo e rende il consiglio più incisivo: "Hai un problema? Ecco cosa fare."

### New Directions Discovered

- **Template come sistema di design**: I 29 template illustrati diventano un linguaggio visivo riutilizzabile in altre parti dell'app (es. scheda pianta, promemoria di cura).
- **Selezione AI-driven**: Gemini non genera le immagini, ma *seleziona* gli scenari giusti tra quelli disponibili — un approccio più affidabile e controllabile.

---

## Product Scope

### Funzionalità completa

- **Collage dinamico** nella pagina analisi, visibile solo quando la pianta necessita cure
- **34 template illustrati** SVG organizzati in 3 categorie (luce, ambiente, vaso)
- **Selezione AI** degli scenari rilevanti tramite estensione del prompt Gemini
- **Layout responsive** del collage (grid adattivo mobile/desktop)
- **Card interattive** con illustrazione + label + breve descrizione del consiglio

---

## Catalogo Completo degli Scenari

### Categoria 1: Esposizione alla Luce (6 scenari)

#### `luce-diretta`
- **Label:** Luce solare diretta
- **Quando si applica:** Piante che richiedono almeno 6 ore di sole diretto. Succulente, cactus, gerani, rosmarino, lavanda, bouganville, hibiscus.
- **Illustrazione:** Finestra spalancata con raggi solari dritti e intensi che colpiscono direttamente la pianta.

#### `luce-indiretta-brillante`
- **Label:** Luce indiretta brillante
- **Quando si applica:** Maggior parte delle piante tropicali da appartamento. Monstera, Pothos, Ficus elastica, Calathea, Spathiphyllum, Philodendron.
- **Illustrazione:** Finestra con tenda leggera/velata che filtra la luce. Raggi diffusi e morbidi.

#### `luce-indiretta-media`
- **Label:** Luce media
- **Quando si applica:** Piante tolleranti a luminosità moderata. Pothos, Dracaena, Aglaonema, Dieffenbachia, Peperomia. Posizione a 1-2 metri dalla finestra.
- **Illustrazione:** Stanza con finestra sullo sfondo, pianta a distanza. Luce ambientale presente ma non intensa.

#### `luce-scarsa`
- **Label:** Luce scarsa (ombra)
- **Quando si applica:** Piante che sopravvivono in angoli poco illuminati. Sansevieria, Zamioculcas, Aspidistra, Pothos.
- **Illustrazione:** Angolo di stanza in penombra con luce soffusa laterale.

#### `luce-diretta-mattutina`
- **Label:** Sole del mattino
- **Quando si applica:** Piante che beneficiano di sole delicato mattutino ma soffrono quello pomeridiano. Felci da balcone, Begonie, Ciclamini, Ortensie. Esposizione Est.
- **Illustrazione:** Finestra rivolta a est con sole basso all'orizzonte, raggi caldi color oro. Indicatore "EST" o alba stilizzata.

#### `luce-filtrata-chioma`
- **Label:** Luce filtrata
- **Quando si applica:** Piante da sottobosco tropicale. Felci, Calathea, Maranta, Orchidee Phalaenopsis.
- **Illustrazione:** Luce che filtra attraverso foglie di piante più grandi o pergola/graticcio. Effetto chiazzato.

---

### Categoria 2: Ambiente e Posizionamento (16 scenari)

#### `davanzale-interno`
- **Label:** Davanzale interno
- **Quando si applica:** Piante compatte che amano massima luminosità indoor. Succulente piccole, cactus, erbe aromatiche, Saintpaulia, mini Orchidee.
- **Illustrazione:** Davanzale visto di profilo con piante in fila, finestra chiusa dietro.

#### `vicino-finestra`
- **Label:** Vicino alla finestra
- **Quando si applica:** Piante di media dimensione che necessitano buona luce. Ficus, Monstera, Dracaena, Schefflera. Entro 50-80 cm dal vetro.
- **Illustrazione:** Pianta su supporto accanto a finestra. Freccia/indicatore di prossimità al vetro.

#### `centro-stanza`
- **Label:** Centro stanza
- **Quando si applica:** Piante grandi e decorative tolleranti alla luce media. Ficus lyrata, Monstera matura, Strelitzia, Kentia.
- **Illustrazione:** Pianta grande su piedistallo al centro di stanza luminosa.

#### `angolo-stanza`
- **Label:** Angolo della stanza
- **Quando si applica:** Piante che tollerano ombra parziale. Sansevieria alta, Zamioculcas, Dracaena marginata, Aspidistra.
- **Illustrazione:** Angolo tra due pareti con pianta alta nell'incrocio, luce laterale.

#### `bagno`
- **Label:** Bagno
- **Quando si applica:** Piante che amano umidità alta e costante. Felci, Tillandsia, Orchidee, Calathea, Maranta, Spathiphyllum.
- **Illustrazione:** Ambiente bagno stilizzato con piastrelle e vapore/goccioline nell'aria.

#### `cucina`
- **Label:** Cucina
- **Quando si applica:** Erbe aromatiche e piante che tollerano sbalzi di temperatura. Basilico, rosmarino, menta, Pothos, Chlorophytum.
- **Illustrazione:** Piano cucina stilizzato con finestra, vasetti di erbe sul davanzale.

#### `balcone-riparato`
- **Label:** Balcone riparato
- **Quando si applica:** Piante da esterno che necessitano protezione da vento e sole cocente. Fucsia, Begonie, Impatiens, felci, Ortensie.
- **Illustrazione:** Balcone con ringhiera e tettoia/copertura parziale.

#### `balcone-esposto`
- **Label:** Balcone soleggiato
- **Quando si applica:** Piante che amano pieno sole e tollerano vento. Gerani, Petunie, Lavanda, Rosmarino, piante grasse, piccoli agrumi.
- **Illustrazione:** Balcone aperto con sole pieno, fioriere sulla ringhiera, cielo sereno.

#### `mensola-alta`
- **Label:** Mensola o ripiano alto
- **Quando si applica:** Piante ricadenti o compatte da posizionare in alto. Pothos, Tradescantia, Senecio rowleyanus, Ceropegia woodii, Hoya.
- **Illustrazione:** Mensola a muro con pianta dai rami ricadenti. Vista laterale che enfatizza la cascata.

#### `lontano-termosifone`
- **Label:** Lontano da fonti di calore
- **Quando si applica:** Critico per piante sensibili all'aria secca. Felci, Calathea, Orchidee, Ficus benjamin.
- **Illustrazione:** Termosifone/condizionatore con simbolo distanza e freccia. Zona rossa vicino alla fonte, zona verde dove sta la pianta.

#### `lontano-correnti`
- **Label:** Al riparo dalle correnti d'aria
- **Quando si applica:** Piante tropicali sensibili a sbalzi termici. Ficus benjamin, Calathea, Croton, Orchidee, Dieffenbachia.
- **Illustrazione:** Porta/finestra aperta con linee di vento stilizzate e simbolo "no". Pianta in posizione riparata.

#### `giardino-pieno-sole`
- **Label:** Giardino in pieno sole
- **Quando si applica:** Piante da esterno che necessitano esposizione totale. Rosmarino, lavanda, oleandro, bouganville, rose, agrumi. Aiuole esposte a sud/ovest.
- **Illustrazione:** Giardino aperto con sole pieno, pianta a terra in aiuola ben esposta. Cielo sereno, nessuna ombra.

#### `giardino-mezz-ombra`
- **Label:** Giardino in mezz'ombra
- **Quando si applica:** Piante che preferiscono sole parziale o filtrato da alberi. Ortensie, camelie, azalee, felci da giardino, hosta. Sotto chioma di alberi decidui.
- **Illustrazione:** Giardino con albero che proietta ombra parziale sulla pianta. Gioco di luce e ombra sul terreno.

#### `giardino-ombra`
- **Label:** Giardino in ombra
- **Quando si applica:** Piante da sottobosco che vivono bene in ombra piena. Edera, pervinca, aspidistra da esterno, felci rustiche. Zone a nord, sotto sempreverdi.
- **Illustrazione:** Zona ombreggiata sotto alberi fitti o a ridosso di un muro alto. Atmosfera fresca e riparata.

#### `aiuola-bordura`
- **Label:** Aiuola o bordura
- **Quando si applica:** Piante perenni o stagionali in piena terra lungo vialetti o recinzioni. Lavanda, salvia, gerani rustici, bulbose stagionali.
- **Illustrazione:** Bordura fiorita lungo un vialetto o recinzione, piante in fila ordinata a terra.

#### `piena-terra-orto`
- **Label:** Orto in piena terra
- **Quando si applica:** Piante orticole e aromatiche coltivate a terra. Pomodori, zucchine, basilico, prezzemolo, peperoncini. Terreno lavorato con buon drenaggio.
- **Illustrazione:** Filare di orto con terreno lavorato, piante in file ordinate. Contesto di piccolo orto domestico.

---

### Categoria 3: Vaso (12 scenari)

#### `vaso-piccolo`
- **Label:** Vaso piccolo (8-14 cm)
- **Quando si applica:** Piante giovani, talee, succulente singole, mini cactus, piccole Peperomia.
- **Illustrazione:** Vaso piccolo con indicatore dimensionale (mano accanto per scala).

#### `vaso-medio`
- **Label:** Vaso medio (16-22 cm)
- **Quando si applica:** Misura standard per piante da appartamento. Pothos, Spathiphyllum, Calathea, Philodendron, Anthurium.
- **Illustrazione:** Vaso di dimensione intermedia, proporzionato alla pianta. Indicatore diametro.

#### `vaso-grande`
- **Label:** Vaso grande (24-35 cm)
- **Quando si applica:** Piante mature medio-grandi. Monstera, Ficus lyrata, Strelitzia, Dracaena, Kentia.
- **Illustrazione:** Vaso grande a terra con pianta alta.

#### `vaso-molto-grande`
- **Label:** Vaso extra large (40+ cm)
- **Quando si applica:** Piante molto grandi da pavimento o esterno. Ficus benjamin maturo, Olivo, Agrumi, palme, Bougainvillea.
- **Illustrazione:** Vaso imponente a terra, pianta che domina lo spazio verticale.

#### `vaso-terracotta`
- **Label:** Vaso in terracotta
- **Quando si applica:** Piante che necessitano buon drenaggio e asciugatura del substrato. Succulente, cactus, Sansevieria, Lavanda, Rosmarino.
- **Illustrazione:** Vaso classico terracotta con texture porosa. Frecce di traspirazione laterale.

#### `vaso-plastica-resina`
- **Label:** Vaso in plastica o resina
- **Quando si applica:** Piante che preferiscono substrato umido più a lungo. Felci, Calathea, Spathiphyllum. Pratico per piante grandi e balconi.
- **Illustrazione:** Vaso liscio e moderno. Icona goccia d'acqua per indicare ritenzione umidità.

#### `vaso-ceramica-coprivaso`
- **Label:** Coprivaso in ceramica
- **Quando si applica:** Uso decorativo: vaso interno in plastica con foro + coprivaso senza foro. Importante svuotare l'acqua residua dopo l'annaffiatura.
- **Illustrazione:** Sezione che mostra vaso interno dentro coprivaso decorativo. Freccia per lo spazio tra i due.

#### `vaso-fori-drenaggio`
- **Label:** Con fori di drenaggio
- **Quando si applica:** Essenziale per quasi tutte le piante, critico per succulente, cactus, Sansevieria, Orchidee.
- **Illustrazione:** Vista dal basso del vaso con fori visibili. Gocce d'acqua in uscita. Strato di argilla espansa sul fondo.

#### `vaso-orchidea-trasparente`
- **Label:** Vaso trasparente per orchidee
- **Quando si applica:** Orchidee Phalaenopsis e altre epifite. Le radici fanno fotosintesi e necessitano luce.
- **Illustrazione:** Vaso trasparente con radici verdi/argentate e substrato di corteccia visibili. Raggi di luce che penetrano.

#### `vaso-sospeso`
- **Label:** Vaso sospeso (hanging)
- **Quando si applica:** Piante ricadenti appese. Pothos, Tradescantia, Ceropegia woodii, Senecio rowleyanus, Hoya, Chlorophytum.
- **Illustrazione:** Vaso con gancio o macrame appeso, rami e foglie che cascano.

#### `fioriera-balcone`
- **Label:** Fioriera da balcone
- **Quando si applica:** Piante da balcone in cassette rettangolari. Gerani, Petunie, Surfinie, erbe aromatiche, Impatiens.
- **Illustrazione:** Cassetta rettangolare agganciata a ringhiera. Più piante affiancate.

#### `vaso-autoirrigante`
- **Label:** Vaso autoirrigante
- **Quando si applica:** Piante che necessitano umidità costante, per chi viaggia o dimentica di annaffiare. Spathiphyllum, Calathea, erbe aromatiche.
- **Illustrazione:** Sezione del vaso con doppio fondo, riserva d'acqua e sistema capillare. Indicatore livello acqua.

---

## Technical Architecture

> **Proposed by:** Leonardo (Architect)

### System Architecture

La funzionalità si integra nell'architettura monolitica Next.js esistente senza introdurre nuovi servizi. L'approccio è **template-driven**: Gemini seleziona gli scenari, il frontend li renderizza.

**Flusso dati:**
1. L'utente carica la foto (flusso esistente)
2. Il prompt Gemini viene esteso per restituire anche un campo `consigliPosizionamento` con gli ID degli scenari rilevanti
3. La pagina analisi riceve gli scenari e, se la pianta necessita cure, renderizza il collage
4. Il collage è composto da componenti React che mappano gli ID ai template SVG corrispondenti

**Architectural Pattern:** Estensione del monolite esistente — nessun nuovo servizio

### Componenti Nuovi

| Componente | Tipo | Responsabilita |
|---|---|---|
| `ScenarioCollagePosizionamento` | React component | Container grid responsivo che impagina le card degli scenari selezionati |
| `ScenarioCardLuce` | React component | Card per scenari categoria luce con illustrazione SVG, label e descrizione |
| `ScenarioCardAmbiente` | React component | Card per scenari categoria ambiente/posizionamento |
| `ScenarioCardVaso` | React component | Card per scenari categoria vaso |
| `illustrazioni/luce/*.svg` | Asset SVG | 6 illustrazioni per gli scenari luce |
| `illustrazioni/ambiente/*.svg` | Asset SVG | 11 illustrazioni per gli scenari ambiente |
| `illustrazioni/vaso/*.svg` | Asset SVG | 12 illustrazioni per gli scenari vaso |
| Estensione `analysis.ts` | TypeScript types | Tipo `ConsiglioPosizionamento` con categorie e ID scenari |
| Estensione `prompts.ts` | Prompt template | Istruzioni aggiuntive per Gemini per selezionare gli scenari |

### Technology Stack (estensioni)

Nessuna nuova dipendenza. Si utilizzano:
- **SVG inline** o componenti React per le illustrazioni (zero dipendenze aggiuntive)
- **Tailwind CSS** per il layout grid responsivo del collage
- **Gemini API** (già integrata) con prompt esteso

### Project Structure (nuovi file)

```
src/
├── components/
│   ├── posizionamento/
│   │   ├── scenario-collage-posizionamento.tsx
│   │   ├── scenario-card-luce.tsx
│   │   ├── scenario-card-ambiente.tsx
│   │   ├── scenario-card-vaso.tsx
│   │   └── illustrazioni/
│   │       ├── luce/
│   │       │   ├── luce-diretta.svg
│   │       │   ├── luce-indiretta-brillante.svg
│   │       │   ├── luce-indiretta-media.svg
│   │       │   ├── luce-scarsa.svg
│   │       │   ├── luce-diretta-mattutina.svg
│   │       │   └── luce-filtrata-chioma.svg
│   │       ├── ambiente/
│   │       │   ├── davanzale-interno.svg
│   │       │   ├── vicino-finestra.svg
│   │       │   ├── centro-stanza.svg
│   │       │   ├── angolo-stanza.svg
│   │       │   ├── bagno.svg
│   │       │   ├── cucina.svg
│   │       │   ├── balcone-riparato.svg
│   │       │   ├── balcone-esposto.svg
│   │       │   ├── mensola-alta.svg
│   │       │   ├── lontano-termosifone.svg
│   │       │   ├── lontano-correnti.svg
│   │       │   ├── giardino-pieno-sole.svg
│   │       │   ├── giardino-mezz-ombra.svg
│   │       │   ├── giardino-ombra.svg
│   │       │   ├── aiuola-bordura.svg
│   │       │   └── piena-terra-orto.svg
│   │       └── vaso/
│   │           ├── vaso-piccolo.svg
│   │           ├── vaso-medio.svg
│   │           ├── vaso-grande.svg
│   │           ├── vaso-molto-grande.svg
│   │           ├── vaso-terracotta.svg
│   │           ├── vaso-plastica-resina.svg
│   │           ├── vaso-ceramica-coprivaso.svg
│   │           ├── vaso-fori-drenaggio.svg
│   │           ├── vaso-orchidea-trasparente.svg
│   │           ├── vaso-sospeso.svg
│   │           ├── fioriera-balcone.svg
│   │           └── vaso-autoirrigante.svg
├── types/
│   └── analysis.ts  (esteso con ConsiglioPosizionamento)
├── lib/
│   └── ai/
│       └── prompts.ts  (esteso con istruzioni selezione scenari)
```

### Architecture Decision Records (ADR)

**ADR-006: Template SVG vs Image Generation AI**
Scelto l'approccio a template SVG composti dinamicamente anziché image generation AI (DALL-E, Gemini image gen, Stable Diffusion). Motivazioni:
- Costo API aggiuntivo: zero (vs 0.02-0.04$ per immagine generata)
- Latenza: istantanea (vs 2-5 secondi)
- Coerenza visiva: garantita (vs variabile e imprevedibile)
- Controllo brand: totale (vs nessuno)
- Trade-off: richiede la creazione di 34 illustrazioni SVG, ma è un costo una tantum

**ADR-007: Selezione scenari tramite Gemini esistente**
Gli scenari vengono selezionati estendendo il prompt dell'analisi Gemini già in uso, non con una chiamata API separata. Gemini riceve la lista degli ID disponibili e restituisce quelli pertinenti alla pianta analizzata. Una sola chiamata API per analisi + selezione scenari.

**ADR-008: Collage condizionale**
Il collage appare solo quando la pianta ha bisogno di cure (stato di salute non ottimale). Se la pianta sta bene, non viene mostrato — evita rumore visivo e rende il consiglio più incisivo quando serve.

---

## Functional Requirements

### Area: Selezione Scenari AI

**FR-P1 — Estensione prompt Gemini per scenari di posizionamento**
Il prompt di analisi viene esteso per chiedere a Gemini di selezionare, tra i 34 scenari disponibili, quelli rilevanti per la pianta analizzata. Gemini restituisce un array di ID scenari organizzati per categoria.

**FR-P2 — Validazione scenari restituiti**
Il sistema valida che gli ID restituiti da Gemini corrispondano a scenari esistenti nel catalogo. ID non riconosciuti vengono ignorati silenziosamente.

**FR-P3 — Selezione contestuale basata su problema**
Gli scenari selezionati devono essere pertinenti al problema specifico rilevato (es. se il problema è eccesso di luce, lo scenario suggerito sarà una luce meno intensa, non la conferma della luce attuale).

### Area: Visualizzazione Collage

**FR-P4 — Collage condizionale**
Il collage di posizionamento appare nella pagina analisi solo quando lo stato di salute della pianta non è ottimale (la pianta necessita cure).

**FR-P5 — Layout collage responsivo**
Il collage si adatta al dispositivo: su mobile le card si impilano verticalmente, su tablet 2 colonne, su desktop fino a 3 colonne affiancate.

**FR-P6 — Card scenario con illustrazione**
Ogni card mostra: illustrazione SVG dello scenario, label testuale, breve descrizione del consiglio (1-2 frasi).

**FR-P7 — Raggruppamento per categoria**
Le card nel collage sono raggruppate visivamente per categoria (Luce, Ambiente, Vaso) con intestazione di sezione.

**FR-P8 — Numero variabile di card**
Il collage mostra da 2 a 6 card, in base a quanti scenari Gemini ritiene rilevanti. Non c'è un numero fisso.

### Area: Template Illustrati

**FR-P9 — Catalogo completo illustrazioni luce**
Il sistema include 6 illustrazioni SVG per la categoria luce: `luce-diretta`, `luce-indiretta-brillante`, `luce-indiretta-media`, `luce-scarsa`, `luce-diretta-mattutina`, `luce-filtrata-chioma`.

**FR-P10 — Catalogo completo illustrazioni ambiente**
Il sistema include 16 illustrazioni SVG per la categoria ambiente: `davanzale-interno`, `vicino-finestra`, `centro-stanza`, `angolo-stanza`, `bagno`, `cucina`, `balcone-riparato`, `balcone-esposto`, `mensola-alta`, `lontano-termosifone`, `lontano-correnti`, `giardino-pieno-sole`, `giardino-mezz-ombra`, `giardino-ombra`, `aiuola-bordura`, `piena-terra-orto`.

**FR-P11 — Catalogo completo illustrazioni vaso**
Il sistema include 12 illustrazioni SVG per la categoria vaso: `vaso-piccolo`, `vaso-medio`, `vaso-grande`, `vaso-molto-grande`, `vaso-terracotta`, `vaso-plastica-resina`, `vaso-ceramica-coprivaso`, `vaso-fori-drenaggio`, `vaso-orchidea-trasparente`, `vaso-sospeso`, `fioriera-balcone`, `vaso-autoirrigante`.

**FR-P12 — Coerenza stilistica illustrazioni**
Tutte le 34 illustrazioni SVG seguono lo stesso stile grafico coerente con il brand Bloom Buddy: palette colori consistente, tratto uniforme, livello di dettaglio omogeneo.

### Area: Integrazione con flusso esistente

**FR-P13 — Nessun impatto sul flusso base**
L'aggiunta del collage non modifica il flusso di analisi esistente. L'upload, l'identificazione, la diagnosi e i consigli testuali continuano a funzionare come prima.

**FR-P14 — Tasto per mostrare/nascondere il collage**
L'utente può espandere o comprimere il collage con un tap/click, per non appesantire la pagina se non interessato ai consigli visivi.

**FR-P15 — Fallback senza scenari**
Se Gemini non restituisce scenari di posizionamento (es. errore di parsing, risposta incompleta), la pagina analisi funziona normalmente senza il collage. Nessun errore visibile all'utente.

---

## Non-Functional Requirements

### Accessibilita

- **NFR-P-A11Y-1**: Ogni illustrazione SVG ha un attributo `aria-label` descrittivo e un `role="img"`.
- **NFR-P-A11Y-2**: Le card sono navigabili da tastiera e il collage è collassabile/espandibile con tastiera.
- **NFR-P-A11Y-3**: I colori nelle illustrazioni mantengono contrasto sufficiente (WCAG 2.1 AA) e non usano il solo colore per comunicare informazioni.

### Manutenibilita

- **NFR-P-MAINT-1**: Aggiungere un nuovo scenario richiede solo: creare il file SVG, aggiungere l'ID al catalogo TypeScript, aggiornare il prompt Gemini. Nessuna modifica ai componenti React.

---

## Next Steps

1. **Design illustrazioni** — Definire lo stile grafico e produrre le 29 illustrazioni SVG
2. **Backlog** — Scomporre i requisiti in user stories implementabili
3. **Estensione prompt** — Progettare e testare il prompt Gemini esteso con la selezione scenari
4. **Implementazione componenti** — Sviluppare i componenti React per il collage
5. **Testing** — Verificare la selezione scenari su un campione di piante con problemi diversi

---

_PRD #3 generated via AIRchetipo Product Inception — 2026-03-30_
_Session conducted by: smare with the AIRchetipo team_
