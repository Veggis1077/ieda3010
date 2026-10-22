# IEDA3010 Prescriptive Analytics – interaktiv læringsplattform

Statisk React/TypeScript-app for midtveiseksamen i IEDA3010 (HKUST): leksjoner på norsk bokmål med engelske fagtermer, interaktive optimeringslaboratorier, en oppgavebank med automatisk retting, eksamenssimulator, spaced repetition og et utskrivbart formelark (A4).

## Kjøre lokalt

```bash
npm install
npm run dev        # utviklingsserver på http://localhost:5173
npm test           # 55 tester: LP-/IP-motor + validering av alt innhold
npm run build      # produksjonsbygg i dist/
npm run preview    # server dist/ på http://localhost:4173
```

Krever Node 18+ (testet med Node 26).

## Publisere på GitHub Pages

1. Opprett et GitHub-repo og push denne mappen (`ieda3010/`) som roten i repoet:
   ```bash
   git init && git add . && git commit -m "IEDA3010 platform"
   git branch -M main
   git remote add origin https://github.com/<bruker>/<repo>.git
   git push -u origin main
   ```
2. På GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Workflowen `.github/workflows/deploy.yml` kjører tester, bygger og publiserer ved hver push til `main`.

Appen bruker `HashRouter` og `base: './'`, så den fungerer under en hvilken som helst understi (`https://<bruker>.github.io/<repo>/`) uten ekstra konfigurasjon. Kursets PDF-er ligger utenfor denne mappen og blir **ikke** publisert.

## Arkitektur

```
src/
  math/            LP/IP-motor (ingen avhengigheter)
    simplex.ts       to-fase simpleks (Bland), frie variabler, ≤/≥/=, dualverdier
    lp2d.ts          2D-geometri: hjørner, klipping, klassifisering, redundans, degenerasjon
    sensitivity.ts   skyggepris- og optimalitetsområder ved eksakt re-løsning
    dual.ts          konstruksjon av dualen (standardform + generelle fortegnsregler)
    bnb.ts           branch-and-bound som i forelesningen (BIP/MIP, F1–F3)
    linparse.ts      symbolsk parser: ekvivalenssjekk av restriksjoner og formuleringer
  components/      LPPlot (SVG), LineChart, ExerciseCard, Math (KaTeX), Layout, UI
  labs/            LP, sensitivitet, dualitet, heltallsgeometri, B&B, binær/big M, BIP, intro
  content/
    lessons/         17 leksjoner (TSX)
    exercises/       oppgavebank (intro.ts, lo.ts, do.ts)
    exams.ts         offisiell øvingseksamen + to genererte eksamener
    flashcards.ts    kort for spaced repetition
    inventory.ts     kildeoversikt: PDF-del → leksjon/lab/oppgaver
    topics.ts        temaer (brukes til svake-tema-analyse)
    course.ts        kapitler, leksjoner, laboratorier
  store/           zustand + localStorage (fremgang, forsøk, kort, eksamener)
  pages/           dashbord, kapittel, leksjon, lab, oppgaver, eksamen, repetisjon, formelark …
```

Klassifisering (entydig / flere optima / ubegrenset / ikke tillatt) avgjøres av simpleksløseren, aldri av plottvinduet.

## Legge til nytt kursmateriell

1. **Leksjon:** lag `src/content/lessons/NyLeksjon.tsx` med blokkene `Concept`, `Step` (intuition, definition, geometry, example, experiment, guided, exam, pitfalls, summary), `T` (tekst med `$…$`-LaTeX, `**fet**`, lister, tabeller) og `Ex id="…"` (innebygd oppgave). Registrer den i `LESSONS` i `src/content/course.ts` og knytt temaer i `topics.ts`.
2. **Oppgave:** legg et objekt i `src/content/exercises/*.ts`. Typer: `mc`, `multi`, `tf`, `numeric`, `expr` (relasjon/uttrykk, sjekkes for ekvivalens), `formulation` (hele LP/IP-modeller), `graph-points`, `graph-optimum`, `graph-binding`, `graph-objective`. Marker kilde med `source.kind`: `official`, `official-adapted` eller `original`. Bruk ``r`…` `` (String.raw) for LaTeX og `\$` for dollartegn.
3. **Eksamen:** legg til i `EXAMS` i `src/content/exams.ts`; deler kan rettes automatisk (`auto`) eller med rettemal (`rubric`, poeng må summere til delens poeng).
4. **Kildeoversikt:** oppdater `src/content/inventory.ts`.
5. Kjør `npm test` – innholdstestene sjekker at ID-er er unike, at forventede formuleringer gir 100 %, at riktige svar godtas av retteren og at oppgitte optimalverdier stemmer med løseren.

## Kjente begrensninger

- Fremgang lagres bare i nettleseren (localStorage); bruk eksport/import under «Fremgang» for å flytte den.
- Fritekstsvar på eksamen (utledninger, figurer) vurderes med rettemal (selvvurdering); bare tall, sant/usant og formuleringer rettes automatisk.
- Formuleringssjekken forventer variabelnavnene som oppgis i oppgaven; svært uvanlige men korrekte omformuleringer (f.eks. substituerte variabler) kan bli vurdert som feil – full løsning vises alltid etter et forsøk.
- Det grafiske laboratoriet er todimensjonalt; dualitetsutforskeren og B&B håndterer flere variabler (inntil 5).
- Eksamenstidspunktet er satt til 4. november 2026 kl. 09:00 (HKT) som standard; justeres under «Fremgang».
