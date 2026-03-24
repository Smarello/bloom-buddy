# Bloom Buddy — Product Requirements Document

**Author:** AIRchetipo
**Date:** 2026-03-24
**Version:** 1.0

---

## Elevator Pitch

> Per **persone che vogliono avere piante in casa ma non riescono a mantenerle in vita**, che hanno il problema di **non saper riconoscere le piante né capire di cosa hanno bisogno**, **Bloom Buddy** è una **web app di plant care assistita da intelligenza artificiale** che **identifica le piante da una foto, ne valuta lo stato di salute e fornisce consigli personalizzati di cura**. A differenza di **app generiche di giardinaggio o guide statiche online**, il nostro prodotto **offre un'analisi visiva istantanea e consigli contestuali basati sulle condizioni reali della pianta**.

---

## Vision

Ogni casa può essere un giardino rigoglioso — basta la guida giusta al momento giusto. Bloom Buddy democratizza la cura delle piante rendendo accessibile a chiunque la conoscenza botanica, attraverso la semplicità di una foto.

### Product Differentiator

Bloom Buddy combina in un unico flusso — una foto — tre funzionalità che oggi richiedono app o ricerche separate: identificazione della specie, diagnosi dello stato di salute e piano di cura personalizzato. Nessuna conoscenza botanica richiesta. L'approccio è empatico e incoraggiante, non tecnico o giudicante.

---

## User Personas

### Persona 1: Giulia

**Role:** Lavoratrice da remoto, appassionata di interior design
**Age:** 31 | **Background:** Copywriter freelance, vive in un bilocale in città. Ama gli ambienti curati e accoglienti, segue account Instagram di home decor. Ha comprato diverse piante negli ultimi anni ma la maggior parte non è sopravvissuta. Si sente frustrata e "negata" con le piante.

**Goals:**
- Avere un appartamento verde e accogliente
- Capire perché le sue piante soffrono e come salvarle
- Imparare gradualmente a prendersi cura delle piante senza sentirsi sopraffatta

**Pain Points:**
- Non sa distinguere una pianta dall'altra e quindi non sa cosa cercaresu internet
- Le guide online sono generiche e non tengono conto delle condizioni specifiche della pianta
- Si dimentica di annaffiare o annaffia troppo, non sapendo la frequenza corretta
- Si sente in colpa quando una pianta muore

**Behaviors & Tools:**
- Usa lo smartphone per tutto, naviga quasi esclusivamente da mobile
- Cerca consigli su Google, Pinterest e TikTok ma si perde tra informazioni contraddittorie
- Scatta molte foto al suo appartamento e alle piante per i social

**Motivations:** Vuole un ambiente domestico che rifletta la sua personalità: curato, verde, profumato. Le piante sono parte dell'estetica e del benessere della sua casa.
**Tech Savviness:** Media — usa app quotidianamente, sa caricare foto, ma non è tecnica.

#### Customer Journey — Giulia

| Phase | Action | Thought | Emotion | Opportunity |
|---|---|---|---|---|
| Awareness | Un'amica le condivide Bloom Buddy dopo aver salvato una pianta | "Magari funziona anche per me?" | Curiosità mista a scetticismo | Onboarding caldo: mostrare subito un risultato concreto |
| Consideration | Visita il sito, vede l'interfaccia pulita e la promessa "scatta una foto" | "Sembra semplice, non devo sapere nulla di botanica" | Sollievo, interesse | CTA chiara, nessuna registrazione richiesta per il primo uso |
| First Use | Scatta una foto alla sua Pothos sofferente, riceve diagnosi e consigli | "Wow, ha capito cos'è e mi dice che la sto annaffiando troppo!" | Sorpresa, entusiasmo | Risultato immediato e consigli actionable |
| Regular Use | Fotografa ogni pianta di casa, segue i consigli di cura | "Le mie piante stanno meglio, mi sento più sicura" | Soddisfazione, fiducia | Costruire la collezione personale di piante |
| Advocacy | Consiglia Bloom Buddy a colleghe e amiche | "Dovete provarlo, ha salvato il mio ficus!" | Orgoglio | Facilitare la condivisione dei risultati |

---

### Persona 2: Marco

**Role:** Padre, impiegato, appassionato di balcone e piccolo orto urbano
**Age:** 44 | **Background:** Lavora in ufficio, vive in un appartamento con balcone ampio. Ha iniziato a coltivare piante aromatiche e qualche fiore per rendere il balcone più vivibile. I suoi figli (8 e 11 anni) sono curiosi ma lui non sa sempre rispondere alle loro domande sulle piante.

**Goals:**
- Mantenere il balcone fiorito e produttivo tutto l'anno
- Coinvolgere i figli nella cura delle piante come attività educativa
- Capire quando e come intervenire su piante che mostrano segni di sofferenza

**Pain Points:**
- Non distingue malattie fungine da carenze nutritive
- Le piante aromatiche gli muoiono d'inverno e non sa come proteggerle
- Vorrebbe risposte rapide, non ha tempo di leggere lunghi articoli
- I consigli che trova online spesso non sono adatti al clima della sua zona

**Behaviors & Tools:**
- Usa il PC in ufficio e lo smartphone a casa
- Cerca su Google quando una pianta ha problemi, ma raramente trova risposte chiare
- Gli piacerebbe un'app semplice da usare anche con i figli

**Motivations:** Il balcone verde è il suo angolo di pace. Vuole che sia bello e che diventi un progetto familiare.
**Tech Savviness:** Media-bassa — usa le app basilari, preferisce interfacce semplici e intuitive.

#### Customer Journey — Marco

| Phase | Action | Thought | Emotion | Opportunity |
|---|---|---|---|---|
| Awareness | Cerca "perché il basilico ha le foglie gialle" e trova un link a Bloom Buddy | "Forse questo sito mi dà una risposta rapida" | Frustrazione, speranza | SEO su query di plant care comuni |
| Consideration | Vede che può caricare una foto direttamente | "Non devo descrivere il problema a parole, ottimo" | Pragmatismo | Zero friction: upload immediato senza registrazione |
| First Use | Fotografa il basilico, riceve diagnosi di eccesso di sole e consigli di riposizionamento | "Chiaro e semplice, lo capisco anche io" | Soddisfazione | Linguaggio semplice, consigli pratici e immediati |
| Regular Use | Usa Bloom Buddy ogni volta che nota un problema su una pianta del balcone, ci gioca con i figli | "È diventato il nostro gioco del weekend" | Divertimento, appartenenza | Gamification leggera per coinvolgere i bambini |
| Advocacy | Ne parla ai colleghi che hanno il balcone | "Provate questo sito, funziona davvero" | Entusiasmo | Condivisione facile dei risultati |

---

## Brainstorming Insights

> Scoperte chiave e direzioni alternative esplorate durante la sessione di inception.

### Assumptions Challenged

1. **"Serve per forza un database di piante proprietario"** — No. Un modello multimodale (LLM con vision) può identificare piante e dare consigli senza un database botanico dedicato, almeno per l'MVP. La qualità è sorprendentemente alta per le specie comuni da appartamento.

2. **"L'utente vuole informazioni enciclopediche sulla pianta"** — No. L'utente vuole sapere *cosa fare adesso*, non la tassonomia completa. I consigli devono essere actionable e contestuali ("sposta dalla finestra", "annaffia meno"), non accademici.

3. **"Serve un'app nativa per accedere alla fotocamera"** — No. Le web app moderne accedono alla fotocamera del dispositivo via browser. Una PWA responsive copre il 95% dei casi d'uso senza i costi di sviluppo e distribuzione di un'app nativa.

### New Directions Discovered

- **Aspetto emotivo**: L'app non deve solo informare ma *incoraggiare*. Il tono dei consigli è fondamentale — l'utente si sente già "negato", non va giudicato.
- **Dimensione sociale**: La condivisione dei risultati ("Guarda, il mio ficus sta meglio!") potrebbe essere un driver di crescita organica potente.
- **Stagionalità**: I consigli devono tenere conto del periodo dell'anno. Una pianta che perde foglie in autunno potrebbe essere perfettamente sana.
- **Uso educativo/familiare**: L'app può diventare uno strumento per avvicinare i bambini alla natura — direzione da esplorare in fase Growth.

---

## Product Scope

### MVP — Minimum Viable Product

- **Upload foto**: L'utente carica una foto di una pianta (da galleria o scatto diretto via browser)
- **Identificazione pianta**: Il sistema identifica la specie a partire dall'immagine
- **Valutazione stato di salute**: Analisi visiva delle condizioni (foglie ingiallite, secche, macchie, parassiti visibili, ecc.)
- **Consigli di cura personalizzati**: Suggerimenti pratici e immediati basati sulla specie e sulle condizioni osservate
- **Scheda pianta**: Pagina di risultato con nome, foto, diagnosi e piano di cura
- **Design responsive mobile-first**: Esperienza ottimale su smartphone, funzionale su desktop
- **Nessuna registrazione richiesta**: Accesso immediato, zero friction

### Growth Features (Post-MVP)

- **Collezione personale**: L'utente crea un account e salva le sue piante con storico delle analisi
- **Promemoria di cura**: Notifiche per annaffiatura, concimazione, rinvaso basate sulla specie
- **Calendario stagionale**: Consigli proattivi in base al periodo dell'anno
- **Cronologia e progressi**: Confronto foto nel tempo per vedere i miglioramenti
- **Multi-lingua**: Supporto italiano e inglese (e altre lingue in futuro)
- **Monetizzazione leggera**: Affiliazioni per acquisto piante, vasi, terricci e attrezzi

### Vision (Future)

- **App nativa** (iOS/Android) con notifiche push
- **Integrazione sensori IoT**: Collegamento con sensori di umidità del terreno, luce, temperatura
- **Condivisione social**: Condividere i risultati dell'analisi sui social o con amici
- **AR overlay**: Inquadra la pianta con la fotocamera e vedi in tempo reale le informazioni sovrapposte
- **Riconoscimento malattie avanzato**: Modello ML specializzato per patologie e parassiti
- **Marketplace**: Acquisto diretto di piante e prodotti per la cura

---

## Technical Architecture

> **Proposed by:** Leonardo (Architect)

### System Architecture

L'applicazione segue un'architettura **monolitica modulare** basata su Next.js con App Router. Il frontend e il backend coesistono nello stesso progetto: le pagine React gestiscono l'interfaccia utente, mentre le Route Handlers di Next.js fungono da API layer per comunicare con i servizi esterni (LLM multimodale per l'analisi delle immagini).

Per l'MVP non è previsto un database: l'analisi è stateless — l'utente carica una foto, riceve il risultato, fine. Il database verrà introdotto in fase Growth quando servirà persistenza (account utente, collezione piante, storico).

**Architectural Pattern:** Monolite Modulare (Next.js Full-Stack)

**Main Components:**
- **Frontend Layer**: React 19 con Next.js App Router, componenti server e client
- **API Layer**: Next.js Route Handlers per orchestrare le chiamate ai servizi esterni
- **AI Service**: Google Gemini API (modello multimodale) per identificazione pianta, diagnosi e generazione consigli
- **Asset Handling**: Upload immagini gestito client-side con compressione prima dell'invio, nessuno storage permanente nell'MVP

### Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety, DX eccellente, standard de facto per progetti React/Next |
| Backend Framework | Next.js (App Router) | 15.x | Full-stack in un solo progetto, SSR/SSG, Route Handlers come API, deploy su Vercel zero-config |
| Frontend Framework | React | 19.x | Incluso in Next.js 15, Server Components per performance |
| Styling | Tailwind CSS | 4.x | Utility-first, rapid prototyping, ottimo per design responsive mobile-first |
| UI Components | shadcn/ui | latest | Componenti accessibili e personalizzabili, non è una dipendenza ma codice copiato nel progetto |
| AI/ML | Google Gemini API | gemini-2.0-flash | Multimodale (vision + text), identifica piante e genera consigli in una sola chiamata. Tier gratuito generoso, ottimo rapporto qualità/costo |
| Image Processing | browser-image-compression | latest | Compressione client-side prima dell'upload per ridurre latenza e costi API |
| Testing | Vitest + React Testing Library | latest | Veloce, compatibile con l'ecosistema Vite/Next |
| Linting | ESLint + Prettier | latest | Standard di progetto |

### Project Structure

**Organizational pattern:** Feature-based con separazione chiara tra UI, API e servizi

```
bloom-buddy/
├── public/                     # Asset statici (icone, immagini placeholder)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Layout root (font, metadata, theme)
│   │   ├── page.tsx            # Homepage con upload
│   │   ├── analysis/
│   │   │   └── page.tsx        # Pagina risultati analisi
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts    # Route Handler: riceve immagine, chiama Gemini, ritorna risultato
│   ├── components/
│   │   ├── ui/                 # Componenti shadcn/ui
│   │   ├── photo-upload.tsx    # Componente upload foto (drag & drop + camera)
│   │   ├── analysis-result.tsx # Visualizzazione risultato analisi
│   │   ├── plant-card.tsx      # Card con info pianta
│   │   └── care-tips.tsx       # Lista consigli di cura
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts       # Client Google Gemini configurato
│   │   │   ├── prompts.ts      # System prompt e template per l'analisi
│   │   │   └── parse-response.ts # Parsing della risposta AI in struttura tipizzata
│   │   ├── image/
│   │   │   └── compress.ts     # Utility compressione immagine client-side
│   │   └── utils.ts            # Utility generiche
│   └── types/
│       └── analysis.ts         # Tipi TypeScript per il dominio (PlantAnalysis, CareTip, etc.)
├── tests/
│   ├── components/             # Test componenti React
│   └── api/                    # Test Route Handlers
├── .env.local                  # Variabili d'ambiente (GOOGLE_GEMINI_API_KEY)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Development Environment

Ambiente di sviluppo locale con Node.js e npm. Next.js fornisce hot reload, error overlay e dev tools integrati.

**Required tools:**
- Node.js 20.x LTS
- npm 10.x
- Git
- Un account Google Cloud / Google AI Studio con API key per Gemini

### CI/CD & Deployment

**Build tool:** Next.js built-in (basato su Turbopack in dev, Webpack in prod)

**Pipeline:**
1. Push su branch → GitHub Actions esegue lint + type check + test
2. PR verso main → Preview deploy automatico su Vercel
3. Merge su main → Deploy automatico in produzione su Vercel

**Deployment:** Vercel (piattaforma nativa per Next.js)

**Target infrastructure:** Vercel Serverless — zero ops, scaling automatico, HTTPS incluso, edge network globale. Il piano gratuito di Vercel è più che sufficiente per l'MVP.

### Architecture Decision Records (ADR)

1. **ADR-001: Next.js monolite vs frontend + backend separati** — Scelto il monolite Next.js perché per l'MVP non c'è necessità di scalare frontend e backend indipendentemente. Un unico progetto riduce la complessità operativa, semplifica il deploy e accelera lo sviluppo. Quando e se servisse un backend dedicato, le Route Handlers possono essere estratte in un servizio separato.

2. **ADR-002: Gemini API vs Plant.id + LLM separato** — Scelto Google Gemini multimodale come unico servizio AI. Un modello multimodale moderno può identificare piante comuni con buona accuratezza e, nella stessa chiamata, valutare le condizioni e generare consigli. Questo elimina la necessità di integrare e pagare un servizio di identificazione separato. Gemini offre un tier gratuito generoso (ideale per un progetto personale) e un'eccellente capacità di comprensione delle immagini. Se l'accuratezza di identificazione si rivelasse insufficiente, si potrà aggiungere Plant.id come fallback in futuro.

3. **ADR-003: Nessun database nell'MVP** — L'MVP è stateless by design. L'utente carica una foto, riceve il risultato, fine. Non serve persistenza. Il database (PostgreSQL + Prisma) verrà introdotto in fase Growth per account utente, collezione piante e storico analisi.

4. **ADR-004: Vercel per il deploy** — Vercel è la piattaforma nativa di Next.js. Offre deploy zero-config, preview per ogni PR, HTTPS automatico e un piano gratuito generoso. Per un progetto personale/amatoriale è la scelta ottimale.

5. **ADR-005: Compressione immagini client-side** — Le immagini vengono compresse nel browser prima dell'invio per ridurre la latenza di upload e il consumo di token API. La qualità viene ridotta a un livello comunque sufficiente per l'identificazione e la diagnosi.

---

## Functional Requirements

### Area: Upload e Acquisizione Immagine

**FR1 — Upload foto da galleria**
L'utente può selezionare un'immagine dalla galleria del proprio dispositivo tramite file picker nativo del browser.

**FR2 — Scatto foto da fotocamera**
L'utente può scattare una foto direttamente dalla fotocamera del dispositivo (su mobile) tramite l'attributo `capture` dell'input file.

**FR3 — Drag & drop (desktop)**
Su dispositivi desktop, l'utente può trascinare un'immagine nell'area di upload.

**FR4 — Compressione immagine client-side**
L'immagine viene automaticamente ridimensionata e compressa nel browser prima dell'invio al server, per ridurre i tempi di upload e i costi API.

**FR5 — Validazione immagine**
Il sistema valida che il file sia un'immagine nei formati supportati (JPEG, PNG, WebP) e che non superi le dimensioni massime consentite. In caso di errore, mostra un messaggio chiaro all'utente.

### Area: Analisi e Identificazione

**FR6 — Identificazione della specie**
Il sistema identifica la specie della pianta a partire dall'immagine caricata, restituendo nome comune e nome scientifico.

**FR7 — Valutazione dello stato di salute**
Il sistema analizza visivamente le condizioni della pianta (colore foglie, segni di sofferenza, parassiti visibili, stato generale) e restituisce una valutazione sintetica dello stato di salute.

**FR8 — Generazione consigli di cura**
Il sistema genera consigli di cura personalizzati basati sulla specie identificata e sulle condizioni osservate. I consigli sono pratici, immediati e formulati in linguaggio semplice e incoraggiante.

**FR9 — Livello di confidenza**
Il sistema indica il livello di confidenza dell'identificazione. Se basso, lo comunica all'utente suggerendo di provare con una foto migliore.

### Area: Presentazione Risultati

**FR10 — Scheda risultato analisi**
Il risultato viene presentato in una scheda strutturata contenente: immagine caricata, nome della pianta (comune e scientifico), stato di salute con indicatore visivo, lista di consigli di cura.

**FR11 — Indicatore visivo stato di salute**
Lo stato di salute è rappresentato con un indicatore visivo intuitivo (es. scala colore verde/giallo/rosso o icone) accompagnato da una descrizione testuale.

**FR12 — Informazioni generali sulla pianta**
Oltre alla diagnosi, il risultato include informazioni generali di cura della specie: frequenza di annaffiatura, esposizione alla luce ideale, temperatura, umidità.

### Area: Esperienza Utente

**FR13 — Stato di caricamento**
Durante l'analisi (upload + chiamata AI), l'utente vede un indicatore di progresso con messaggi contestuali incoraggianti (es. "Sto osservando la tua pianta...").

**FR14 — Gestione errori user-friendly**
In caso di errore (rete, API non disponibile, immagine non riconoscibile), il sistema mostra un messaggio chiaro e non tecnico con suggerimenti su come procedere.

**FR15 — Nuova analisi**
Dalla pagina dei risultati, l'utente può avviare una nuova analisi con un'altra foto con un singolo tap/click.

**FR16 — Design responsive mobile-first**
L'interfaccia è progettata mobile-first e si adatta fluidamente a schermi di qualsiasi dimensione (smartphone, tablet, desktop).

---

## Non-Functional Requirements

### Security

- **NFR-SEC-1**: La API key di Google Gemini è conservata esclusivamente server-side nelle variabili d'ambiente, mai esposta al client.
- **NFR-SEC-2**: Le immagini caricate non vengono persistite su disco o cloud storage. Sono processate in memoria e scartate dopo l'analisi.
- **NFR-SEC-3**: Le Route Handlers implementano rate limiting base per prevenire abusi (es. max 10 richieste/minuto per IP).
- **NFR-SEC-4**: Validazione server-side del tipo e della dimensione del file per prevenire upload malevoli.
- **NFR-SEC-5**: Headers di sicurezza configurati (CSP, X-Frame-Options, etc.) tramite next.config.

### Accessibility

- **NFR-A11Y-1**: L'applicazione deve essere utilizzabile da tastiera per tutte le funzionalità principali.
- **NFR-A11Y-2**: I componenti devono avere attributi ARIA appropriati e contrasto colori conforme a WCAG 2.1 AA.

### Integrations

- **NFR-INT-1**: Integrazione con Google Gemini API (gemini-2.0-flash) per l'analisi multimodale delle immagini.
- **NFR-INT-2**: Integrazione con Vercel per deploy automatico da GitHub.
- **NFR-INT-3**: Integrazione con GitHub Actions per CI (lint, type check, test).

---

## Next Steps

1. **UX Design** — Definire i flussi di interazione dettagliati e i wireframe per le funzionalità MVP
2. **Detailed Architecture** — Approfondire le decisioni tecniche sulle aree critiche (prompt engineering per l'analisi, gestione errori AI)
3. **Backlog** — Scomporre i requisiti funzionali in epic e user story
4. **Validation** — Testare l'accuratezza dell'identificazione piante con Gemini su un campione di immagini reali

---

_PRD generated via AIRchetipo Product Inception — 2026-03-24_
_Session conducted by: smare with the AIRchetipo team_
