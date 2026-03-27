# Bloom Buddy — Diagnosi Intelligenti

**Author:** AIRchetipo
**Date:** 2026-03-27
**Version:** 1.0

---

## Elevator Pitch

> Per **persone che si prendono cura di piante in casa o sul balcone**, che hanno il problema di **ricevere consigli generici e banali che potrebbero trovare con una semplice ricerca online**, **Bloom Buddy Diagnosi Intelligenti** è un'**evoluzione del sistema di analisi basato su AI** che **trasforma i consigli superficiali in diagnosi botaniche approfondite, con spiegazioni visive e piani d'azione concreti**. A differenza dei **consigli generici attuali ("togli le foglie secche", "annaffia di più")**, il nuovo sistema **identifica problemi specifici dalla foto, li spiega in modo comprensibile e guida l'utente passo passo nella cura**.

---

## Vision

Passare da "lista di consigli generici" a "consulenza botanica personalizzata": ogni analisi deve dare all'utente qualcosa che non potrebbe trovare con una ricerca Google, perché basata su ciò che l'AI osserva nella sua specifica foto.

### Product Differentiator

Il salto qualitativo sta nel modello diagnostico: non più tip brevi e intercambiabili, ma diagnosi strutturate che collegano ciò che l'utente vede nella foto a una spiegazione causale e un piano d'azione. L'utente capisce il *perché* e sa *esattamente cosa fare*.

---

## User Personas

Le personas di riferimento sono le stesse del PRD principale (docs/PRD.md): **Giulia** (31 anni, lavoratrice da remoto, vuole un appartamento verde ma si sente "negata") e **Marco** (44 anni, padre con balcone, vuole coinvolgere i figli).

### Impatto su Giulia

Oggi Giulia riceve "annaffia meno" e non sa quanto meno. Con le diagnosi intelligenti riceve: "Le punte marroni che vedi sulle foglie della tua Pothos indicano eccesso d'acqua — le radici probabilmente stanno soffrendo. Salta la prossima annaffiatura, riprendi solo quando i primi 3 cm di terra sono asciutti al tatto. In 10-14 giorni le nuove foglie dovrebbero crescere sane." Giulia si sente *guidata*, non giudicata.

### Impatto su Marco

Oggi Marco non distingue una malattia fungina da una carenza nutritiva. Con le diagnosi intelligenti riceve una spiegazione chiara del problema specifico, può mostrarlo ai figli come momento educativo, e sa come intervenire senza leggere lunghi articoli.

---

## Brainstorming Insights

> Scoperte chiave e direzioni alternative esplorate durante la sessione di inception.

### Assunzioni sfidati

- **"Servono più dati dall'utente per dare consigli migliori"** — Falso. La foto contiene già molte informazioni che oggi non sfruttiamo. Il problema è nel prompt, non nei dati in input.
- **"3-5 consigli brevi sono il formato giusto"** — Sfidato. Pochi consigli approfonditi valgono più di molti generici. La struttura stessa del consiglio comunica l'importanza.
- **"La priorità alta/media/bassa è sufficiente"** — Insufficiente. Serve una categorizzazione semantica (critico/attenzione/ottimizzazione) che comunichi il *tipo* di intervento, non solo l'urgenza.

### Nuove direzioni scoperte

- **Da consigli a diagnosi:** il reframing da "tip di cura" a "consulenza botanica" cambia radicalmente il valore percepito dall'utente.
- **Riferimenti visivi descrittivi:** collegare ogni osservazione a qualcosa di visibile nella foto ("le macchie che vedi su...") senza necessità di overlay grafici complessi.
- **Struttura a 4 sezioni:** cosa vedo → cosa significa → cosa fare → cosa aspettarsi, applicata solo a problemi critici e di attenzione.

---

## Product Scope

### MVP — Minimum Viable Product

- Nuovo prompt AI che genera diagnosi strutturate invece di tip generici
- Tre categorie semantiche: `critico`, `attenzione`, `ottimizzazione`
- Formato esteso a 4 sezioni (cosaVedo, cosaSignifica, cosaFare, cosaAspettarsi) per `critico` e `attenzione`
- Formato breve ma specifico e contestuale alla foto per `ottimizzazione`
- Riferimenti visivi descrittivi nel testo delle diagnosi
- UI che distingue visivamente le tre categorie
- Aggiornamento tipi TypeScript, validazione risposta AI e test

### Growth Features (Post-MVP)

- Evidenziazione visiva sulla foto (overlay/bounding box sulle aree problematiche)
- Piano di recupero temporalizzato ("giorno 1... settimana 1... mese 1...")
- Confronto con analisi precedenti della stessa pianta ("rispetto all'ultima foto, l'oidio è migliorato")

### Vision (Future)

- Monitoraggio attivo con notifiche ("è ora di ricontrollare la pianta trattata")
- Knowledge base proprietaria di patologie che affina il modello nel tempo

---

## Technical Architecture

> **Proposta da:** Leonardo (Architect)

### System Architecture

L'architettura esistente non cambia. L'evoluzione è interamente nel layer applicativo: prompt AI, tipi, validazione e componenti UI.

**Pattern architetturale:** invariato — Next.js App Router con API routes, Gemini API per l'analisi, Prisma + PostgreSQL per la persistenza.

**Componenti impattati:**

| File | Tipo di modifica |
|---|---|
| `src/lib/ai/prompts.ts` | Riscrittura del prompt con struttura diagnostica |
| `src/types/analysis.ts` | Nuovi tipi per diagnosi dettagliata e ottimizzazione |
| `src/lib/ai/parse-response.ts` | Aggiornamento validazione per nuovo schema JSON |
| `src/components/analysis-result.tsx` | UI per formato esteso e breve |
| `src/components/care-tips-list.tsx` | Adattamento o sostituzione per nuove categorie |
| `prisma/schema.prisma` | Nessuna modifica (datiAnalisi è già JSON libero) |
| Test esistenti | Aggiornamento per nuova struttura |

### Technology Stack

Nessuna nuova dipendenza. Stack invariato:

| Layer | Technology | Rationale |
|---|---|---|
| Frontend/Backend | Next.js (App Router) | Già in uso |
| AI | Google Gemini API | Già in uso, supporta già analisi multimodale |
| Database | PostgreSQL + Prisma | Già in uso, campo JSON flessibile |
| Testing | Vitest | Già in uso |

### Rischio tecnico

**Basso.** Il cambiamento principale è nel prompt engineering e nei tipi TypeScript. Nessuna migrazione DB necessaria (reset completo del database accettabile, non ci sono utenti reali). Nessuna nuova integrazione. Il campo `datiAnalisi` in Prisma è già `Json`, quindi accetta qualsiasi struttura.

---

## Functional Requirements

### Categorizzazione e struttura

- **FR1** — L'AI classifica ogni osservazione in una di tre categorie: `critico`, `attenzione`, `ottimizzazione`
- **FR2** — Le osservazioni `critico` e `attenzione` usano il formato esteso con quattro sezioni: cosaVedo, cosaSignifica, cosaFare, cosaAspettarsi
- **FR3** — Le osservazioni `ottimizzazione` usano il formato breve: titolo + descrizione, contestualizzata a ciò che l'AI osserva nella foto
- **FR4** — Ogni analisi produce 1-2 diagnosi dettagliate (se ci sono problemi visibili) e 0-3 ottimizzazioni

### Qualita delle diagnosi

- **FR5** — L'AI fornisce riferimenti visivi descrittivi ("le macchie giallastre visibili sulle foglie inferiori indicano...")
- **FR6** — Le diagnosi identificano problemi specifici (malattie, parassiti, carenze, eccessi) e non si limitano a osservazioni ovvie
- **FR7** — Il campo "cosaFare" contiene istruzioni pratiche e specifiche, non generiche
- **FR8** — Il campo "cosaAspettarsi" indica tempi realistici di recupero o miglioramento
- **FR9** — Se la pianta è in ottime condizioni, l'analisi contiene solo ottimizzazioni senza diagnosi dettagliate

### Presentazione UI

- **FR10** — La UI distingue visivamente le tre categorie con stile, icona e colore diversi
- **FR11** — Le diagnosi critiche sono mostrate in evidenza prima delle altre

### Tono e linguaggio

- **FR12** — Il tono resta empatico e incoraggiante, mai giudicante, anche per diagnosi critiche

### Invarianti

- **FR13** — Le informazioni generali (annaffiatura, luce, temperatura, umidita) restano invariate
- **FR14** — I tipi TypeScript riflettono la nuova struttura con interfacce separate per diagnosi dettagliata e ottimizzazione
- **FR15** — La validazione della risposta AI gestisce il nuovo schema JSON e applica fallback coerenti

---

## Non-Functional Requirements

### Security

Nessun requisito aggiuntivo. Il modello di autenticazione e autorizzazione non cambia.

### Integrations

Gemini API — nessuna nuova integrazione. Evoluzione del prompt e dello schema JSON di risposta all'interno dell'integrazione esistente.

---

## Next Steps

1. **Backlog** — Decomporre i requisiti funzionali in user stories implementabili
2. **Prompt design** — Iterare sul prompt AI con test qualitativi sulle risposte
3. **UI design** — Definire il layout visivo per diagnosi estese vs ottimizzazioni brevi
4. **Implementazione** — Sviluppo incrementale: tipi → prompt → validazione → UI → test

---

_PRD generato via AIRchetipo Product Inception — 2026-03-27_
_Sessione condotta da: Simone con il team AIRchetipo_
