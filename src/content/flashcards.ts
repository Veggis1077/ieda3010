import { Flashcard } from './types';

const r = String.raw;

export const FLASHCARDS: Flashcard[] = [
  // Introduction
  { id: 'fc-1', topic: 'intro.analytics', kind: 'definisjon', front: 'Preskriptiv analyse (prescriptive analytics)', back: 'Analyse som gir **optimale anbefalinger** i en beslutningsprosess – «How can we achieve the best outcome?». Bygger på deskriptiv og prediktiv analyse.' },
  { id: 'fc-2', topic: 'intro.process', kind: 'metode', front: 'De fem stegene i OR-metodikken', back: '1. Problem description 2. Model construction 3. Model solution 4. Analyzing results (tolkning + sensitivitet) 5. Implementation.' },
  { id: 'fc-3', topic: 'intro.components', kind: 'definisjon', front: 'Tre nøkkelkomponenter i en optimeringsmodell', back: '**Beslutningsvariabler** (hva vi bestemmer), **målfunksjon** (hva vi maks./min.), **restriksjoner** (hva som begrenser). Pluss **parametere** = gitte data.' },
  { id: 'fc-4', topic: 'lo.formulation', kind: 'metode', front: 'Tre spørsmål ved formulering (LO1 s. 44)', back: '(i) Hva må bestemmes? (ii) Hvilket mål sammenligner alternativer? (iii) Hvilke restriksjoner begrenser valgene? Sjekk til slutt: gir det mening, er alle data brukt?' },
  // LP basics
  { id: 'fc-5', topic: 'lo.assumptions', kind: 'definisjon', front: 'De fire LP-antakelsene', back: '**Proporsjonalitet** (bidrag $c_jx_j$), **additivitet** (ingen kryssledd), **delbarhet** (ikke-heltall tillatt), **sikkerhet** (kjente parametere).' },
  { id: 'fc-6', topic: 'lo.assumptions', kind: 'vanlig feil', front: 'Oppstartskostnad bryter …?', back: '**Proporsjonalitet** (ikke additivitet). Kryssledd $x_1x_2$ bryter additivitet.' },
  { id: 'fc-7', topic: 'lo.forms', kind: 'definisjon', front: 'Standardform (forelesningen)', back: r`$\max \sum_j c_jx_j$ s.t. $\sum_j a_{ij}x_j \le b_i$, $x_j \ge 0$. Andre former: min, $\ge$, $=$, fri variabel.` },
  { id: 'fc-8', topic: 'lo.geometry', kind: 'definisjon', front: 'Hjørnepunkt (extreme point / CPF-løsning)', back: 'Hjørne på randen av det tillatte området; i 2D snittet av to restriksjonsgrenser som er tillatt.' },
  { id: 'fc-9', topic: 'lo.geometry', kind: 'teori', front: 'Hjørnepunktteoremet', back: 'Hvis et LP er tillatt og har endelig optimum, finnes en optimal løsning i et hjørnepunkt.' },
  { id: 'fc-10', topic: 'lo.geometry', kind: 'definisjon', front: 'Isokvant (isoquant)', back: 'Linje der alle punkter har samme objektivverdi: $c_1x_1 + c_2x_2 = k$. Parallelle for ulike $k$.' },
  { id: 'fc-11', topic: 'lo.geometry', kind: 'definisjon', front: 'Bindende (aktiv) restriksjon og slakk', back: 'Bindende: oppfylt med likhet i optimum (slakk 0). Slakk = RHS − LHS for $\\le$. Likhetsrestriksjoner er alltid bindende.' },
  { id: 'fc-12', topic: 'lo.geometry', kind: 'definisjon', front: 'Redundant restriksjon', back: 'Å fjerne/legge til restriksjonen endrer ikke det tillatte området.' },
  { id: 'fc-13', topic: 'lo.special', kind: 'teori', front: 'Tre spesialtilfeller og deres tolkning', back: '**Ikke tillatt**: for mange restriksjoner. **Flere optima**: objektivlinjen parallell med en bindende kant. **Ubegrenset**: for få restriksjoner eller feil målfunksjon.' },
  { id: 'fc-14', topic: 'lo.special', kind: 'vanlig feil', front: 'Ubegrenset område ⇒ ubegrenset problem?', back: '**Nei.** Hvis forbedringsretningen peker «innover», kan optimum være endelig (LO Practice 3b).' },
  { id: 'fc-15', topic: 'lo.special', kind: 'teori', front: 'To ulike optimale løsninger ⇒ ?', back: 'Uendelig mange: alle konvekse kombinasjoner $\\lambda x + (1-\\lambda)y$ er tillatte og optimale.' },
  { id: 'fc-16', topic: 'lo.geometry', kind: 'teori', front: 'Øvre grense på antall hjørnepunkter', back: r`$\binom{n+m}{m}$ for $n$ variabler og $m$ funksjonelle restriksjoner.` },
  // Sensitivity
  { id: 'fc-17', topic: 'lo.sens-c', kind: 'definisjon', front: 'Sensitivitetsområde for $c_j$', back: 'Verdiene av $c_j$ der **nåværende optimale løsning** forblir optimal. Objektivverdien endres likevel.' },
  { id: 'fc-18', topic: 'lo.sens-c', kind: 'metode', front: 'Grafisk optimalitetsbetingelse i 2D', back: r`Hjørnet er optimalt når $-c_1/c_2$ ligger mellom stigningstallene $-a_{i1}/a_{i2}$ til de to bindende restriksjonene.` },
  { id: 'fc-19', topic: 'lo.sens-b', kind: 'definisjon', front: 'Skyggepris (shadow price / dual value)', back: 'Marginal endring i optimal verdi per ekstra enhet av ressurs/krav $b_i$. Gyldig kun innenfor sensitivitetsområdet.' },
  { id: 'fc-20', topic: 'lo.sens-b', kind: 'definisjon', front: 'Sensitivitetsområde for $b_i$', back: 'Verdiene av $b_i$ der de **samme restriksjonene forblir bindende** (samme skyggepris).' },
  { id: 'fc-21', topic: 'lo.sens-b', kind: 'vanlig feil', front: 'Skyggepris for ikke-bindende restriksjon?', back: '**0** – det er overskudd av ressursen, mer av den hjelper ikke (Wyndor: $y_1^* = 0$).' },
  { id: 'fc-22', topic: 'lo.sens-b', kind: 'vanlig feil', front: 'Bruke skyggeprisen for store endringer', back: 'Feil utenfor området. HW1 P4: $R = 190$ gir 4000, ikke $2800 + 20\\cdot90 = 4600$.' },
  { id: 'fc-23', topic: 'lo.sens-a', kind: 'teori', front: 'Geometrisk effekt av å endre $c_j$, $b_i$, $a_{ij}$', back: '$c_j$: roterer isokvanten. $b_i$: parallellforskyver restriksjonen. $a_{ij}$: roterer restriksjonen (alt kan endres).' },
  // Duality
  { id: 'fc-24', topic: 'lo.dual', kind: 'dualitet', front: 'Dualen til standardform', back: r`Primal: $\max c^\top x$, $Ax \le b$, $x\ge0$. Dual: $\min b^\top y$, $A^\top y \ge c$, $y \ge 0$.` },
  { id: 'fc-25', topic: 'lo.dual', kind: 'dualitet', front: 'Korrespondanser primal ↔ dual', back: 'Restriksjon $i$ ↔ dualvariabel $y_i$; variabel $x_j$ ↔ dualrestriksjon $j$; $b$ ↔ objektivkoeffisienter; $c$ ↔ høyresider; $A$ ↔ $A^\\top$.' },
  { id: 'fc-26', topic: 'lo.duality-thm', kind: 'dualitet', front: 'Svak dualitet', back: r`For tillatte $x$, $y$: $\sum_j c_jx_j \le \sum_i b_iy_i$ (max-primal). Enhver dual løsning gir øvre grense.` },
  { id: 'fc-27', topic: 'lo.duality-thm', kind: 'dualitet', front: 'Sterk dualitet', back: r`Hvis $x^*$ og $y^*$ er optimale: $\sum_j c_jx_j^* = \sum_i b_iy_i^*$.` },
  { id: 'fc-28', topic: 'lo.duality-thm', kind: 'dualitet', front: 'Mulige (primal, dual)-kombinasjoner', back: '(optimum, optimum), (ubegrenset, ikke tillatt), (ikke tillatt, ubegrenset), (ikke tillatt, ikke tillatt).' },
  { id: 'fc-29', topic: 'lo.cs', kind: 'dualitet', front: 'Komplementær slakkhet', back: r`$\big(b_i - \sum_j a_{ij}x_j\big)y_i = 0$ og $\big(c_j - \sum_i a_{ij}y_i\big)x_j = 0$. Totalt $m+n$ ligninger.` },
  { id: 'fc-30', topic: 'lo.cs', kind: 'vanlig feil', front: 'Bindende primalrestriksjon ⇒ $y_i > 0$?', back: '**Nei.** CS gir bare: slakk > 0 ⇒ $y_i = 0$, og $y_i > 0$ ⇒ bindende. Begge kan være 0 (degenerasjon).' },
  { id: 'fc-31', topic: 'lo.dual', kind: 'dualitet', front: 'Økonomisk tolkning av $y_i$ (Wyndor)', back: 'Prisen per time produksjonstid i anlegg $i$ som et annet selskap betaler; dualrestriksjonene sikrer at Wyndor vil selge. $y_i^*$ = marginalverdi = skyggepris.' },
  { id: 'fc-32', topic: 'lo.dual', kind: 'teori', front: 'Dualen til dualen', back: 'Er primalproblemet.' },
  // LO4
  { id: 'fc-33', topic: 'lo.simplex', kind: 'teori', front: 'Optimalitetstest for CPF-løsninger', back: '«If you’re better than your neighbors, you’re the best»: et CPF uten bedre nabo-CPF er optimalt (gitt at optimum finnes).' },
  { id: 'fc-34', topic: 'lo.simplex', kind: 'definisjon', front: 'Nabohjørner (adjacent CPF) i n dimensjoner', back: 'Deler $n-1$ restriksjonsgrenser og er forbundet med en kant av det tillatte området.' },
  { id: 'fc-35', topic: 'lo.simplex', kind: 'teori', front: 'Simpleks vs. ellipsoide vs. indrepunkt', back: 'Simpleks (1947): god i praksis, dårlig i teori. Ellipsoide (1979): god i teori, dårlig i praksis. Indrepunkt (1984): god i begge.' },
  { id: 'fc-36', topic: 'lo.linearize', kind: 'metode', front: 'Linearisere $\\min \\max_k(d_k^\\top x + c_k)$', back: r`$\min t$ s.t. $t \ge d_k^\top x + c_k$ for alle $k$. Tilsvarende $|x| = \max\{x,-x\}$.` },
  { id: 'fc-37', topic: 'lo.robust', kind: 'metode', front: 'Robust motpart, boks-usikkerhet', back: r`$a^\top x \le b\ \forall a$: $\bar a^\top x + \sum_j \Delta a_j|x_j| \le b$; lineært med $x = r - s$, $r,s\ge0$.` },
  // DO
  { id: 'fc-38', topic: 'do.intro', kind: 'definisjon', front: 'IP, BIP, MIP', back: 'IP: alle variabler heltall. BIP: alle binære. MIP: noen heltall/binære, andre kontinuerlige.' },
  { id: 'fc-39', topic: 'do.logic', kind: 'metode', front: 'Binære relasjoner (oversikt)', back: r`Høyst én: $\sum x_i \le 1$. Enten–eller: $x_1 + x_2 = 1$. Alt-eller-ingenting: $x_1 = x_2$. 1 hvis 2: $x_2 \le x_1$. Betinget område: $0 \le y \le Mx$.` },
  { id: 'fc-40', topic: 'do.bigm', kind: 'metode', front: 'Enten–eller-restriksjoner', back: r`$f_1(x) \le b_1 + My$, $f_2(x) \le b_2 + M(1-y)$, $y\in\{0,1\}$.` },
  { id: 'fc-41', topic: 'do.bigm', kind: 'metode', front: 'K av N restriksjoner må holde', back: r`$f_i(x) \le b_i + My_i$, $\sum_{i=1}^N y_i = N - K$, $y_i \in\{0,1\}$.` },
  { id: 'fc-42', topic: 'do.nvalues', kind: 'metode', front: 'Funksjon med N mulige verdier', back: r`$f(x) = \sum_{i=1}^N d_iy_i$, $\sum y_i = 1$, $y_i\in\{0,1\}$.` },
  { id: 'fc-43', topic: 'do.fixed', kind: 'metode', front: 'Fast kostnad (fixed charge)', back: r`$\min/\max \dots \pm K y$ med $x \le My$, $y\in\{0,1\}$. Hvis $x = 0$ velger optimeringen selv $y = 0$.` },
  { id: 'fc-44', topic: 'do.binexp', kind: 'metode', front: 'Binær ekspansjon av $0 \\le x \\le u$', back: r`$x = \sum_{i=0}^N 2^i y_i$ med $2^N \le u < 2^{N+1}$ ($N+1$ binære).` },
  { id: 'fc-45', topic: 'do.geometry', kind: 'vanlig feil', front: 'Avrunde LP-løsningen?', back: 'Kan gi **ikke-tillatt** punkt, eller et tillatt punkt **langt fra** IP-optimum. IP-optimum er ikke nødvendigvis et hjørne.' },
  { id: 'fc-46', topic: 'do.geometry', kind: 'definisjon', front: 'LP-relaksering', back: 'IP-et uten heltallskrav. Gir grense: $Z_{IP}^* \\le Z_{LP}^*$ (max).' },
  { id: 'fc-47', topic: 'do.bnb', kind: 'metode', front: 'Tre fathoming-tester', back: '1) LP-løsningen er heltallig (ev. ny incumbent). 2) Grense ≤ $Z^*$. 3) LP-relaksering ikke tillatt.' },
  { id: 'fc-48', topic: 'do.bnb', kind: 'metode', front: 'Kursets nodevalg i B&B', back: 'Sist opprettede ufathomede delproblem; ved likhet størst grense. Stopp når ingen gjenstår – incumbent er optimal.' },
  { id: 'fc-49', topic: 'do.mipbnb', kind: 'teori', front: 'Fire endringer fra BIP til MIP B&B', back: '1) Forgren bare på heltallsvariabler. 2) To intervaller $\\le\\lfloor v\\rfloor$ / $\\ge\\lceil v\\rceil$. 3) Ikke nødvendigvis avrunde grensen. 4) Test 1: bare heltallsvariablene må være heltall.' },
  { id: 'fc-50', topic: 'do.intro', kind: 'vanlig feil', front: 'Antall tillatte løsninger i IP er alltid endelig?', back: '**Nei** – bare hvis området er begrenset.' },
];
