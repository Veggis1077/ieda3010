/**
 * Course-content inventory: every source file, its parts, and where it is
 * covered on the platform. Based on a full read of the PDFs (text extraction
 * + visual inspection of formula/figure slides).
 */
export interface InventoryRow {
  part: string;
  lessons: string[];
  labs?: string[];
  exercises?: string[];
  note?: string;
}

export interface SourceFile {
  file: string;
  pages: number;
  status: string;
  examinable: 'ja' | 'delvis' | 'nei';
  rows: InventoryRow[];
}

export const INVENTORY: SourceFile[] = [
  {
    file: 'Introduction/Introduction_note.pdf',
    pages: 34,
    status: 'Lest fullt (tekst + bilder).',
    examinable: 'ja',
    rows: [
      { part: 's. 2–10: Analytics, modenhetskurven, preskriptiv analyse', lessons: ['intro-1'], exercises: ['in-1', 'in-2'] },
      { part: 's. 11–15: Ferdigheter, temaer, historie, anvendelser', lessons: ['intro-1'], exercises: ['in-11'] },
      { part: 's. 16–22: Metodikken (5 steg), modellkomponenter', lessons: ['intro-2'], exercises: ['in-3', 'in-4', 'in-5', 'in-8'] },
      { part: 's. 23–27: Lager, prising/segmentering, portefølje', lessons: ['intro-2'], labs: ['pricing'], exercises: ['in-6', 'in-7', 'in-10'] },
      { part: 's. 28–33: Anbefaling, eldreomsorg (HKCS), LLM', lessons: ['intro-1'], note: 'Kun illustrative eksempler (bilder); ingen formell metode å eksaminere.' },
    ],
  },
  {
    file: 'Linear_Optimization/Linear Optimization_1_Introduction_note.pdf',
    pages: 45,
    status: 'Lest fullt. «Note»-versjonen har tomme felt (fylles ut i forelesning) – formuleringene er rekonstruert fra lysbildedata og læreboka (Hillier & Lieberman) og markert.',
    examinable: 'ja',
    rows: [
      { part: 's. 2–9: Lego-spillet', lessons: ['lo-1'], labs: ['lego', 'lp'], exercises: ['in-9', 'lo-n1'] },
      { part: 's. 10–11: Wyndor Glass Co.', lessons: ['lo-1'], labs: ['lp'], exercises: ['lo-f1'] },
      { part: 's. 12–17: Optimering, Dantzig, nøkkelkomponenter', lessons: ['lo-1'] },
      { part: 's. 19–25: Transportproblem (Xbox)', lessons: ['lo-2'], exercises: ['lo-f5'] },
      { part: 's. 26–29: Strålebehandling', lessons: ['lo-2'], exercises: ['lo-f6'] },
      { part: 's. 30–35: Luftforurensning (Nori & Leets)', lessons: ['lo-2'], note: 'Krav til utslippsreduksjon (60/150/125) står ikke i notatversjonen; hentet fra læreboka og markert.' },
      { part: 's. 36–39: Personalplanlegging (Union Airways)', lessons: ['lo-2'], exercises: ['lo-f7'] },
      { part: 's. 40–43: Distribusjonsnettverk', lessons: ['lo-2'], exercises: ['lo-f9'] },
      { part: 's. 44: Formuleringsretningslinjer', lessons: ['lo-1'] },
    ],
  },
  {
    file: 'Linear_Optimization/Linear Optimization_2_Geometry_note.pdf',
    pages: 35,
    status: 'Lest fullt.',
    examinable: 'ja',
    rows: [
      { part: 's. 2–10: Antakelsene (proporsjonalitet, additivitet, delbarhet, sikkerhet)', lessons: ['lo-3'], exercises: ['lo-a1', 'lo-a2'] },
      { part: 's. 12–13: Standardform og andre former', lessons: ['lo-3'], exercises: ['lo-a3'] },
      { part: 's. 14–25: Halvplan, tillatt område, hjørner, isokvanter', lessons: ['lo-4'], labs: ['lp'], exercises: ['lo-g1', 'lo-g6'] },
      { part: 's. 26–29: Optimum, flere optima, ubegrenset, spesialtilfeller', lessons: ['lo-5'], labs: ['lp'], exercises: ['lo-g3', 'lo-s1', 'lo-s3'] },
      { part: 's. 30–35: Bindende restriksjoner, slakk, antall hjørner', lessons: ['lo-4'], exercises: ['lo-g5', 'lo-s4'] },
    ],
  },
  {
    file: 'Linear_Optimization/Linear Optimization_3_Sensitivity Analysis_note.pdf',
    pages: 40,
    status: 'Lest fullt.',
    examinable: 'ja',
    rows: [
      { part: 's. 2–9: Endring i cⱼ (Lego)', lessons: ['lo-6'], labs: ['sensitivity'], exercises: ['lo-c1', 'lo-c2'] },
      { part: 's. 10–16: Endring i bᵢ, sensitivitetsområde, skyggepris', lessons: ['lo-6'], labs: ['sensitivity'], exercises: ['lo-b1', 'lo-b2', 'lo-b4'] },
      { part: 's. 17–18: Endring i aᵢⱼ, oppsummering', lessons: ['lo-6'], labs: ['lp'], exercises: ['lo-b5'] },
      { part: 's. 19–25: Dualproblemet, primal–dual-tabell', lessons: ['lo-7'], labs: ['duality'], exercises: ['lo-d1', 'lo-d2'] },
      { part: 's. 26–30: Økonomisk tolkning, skyggepriser', lessons: ['lo-7'], labs: ['duality'], exercises: ['lo-d9'] },
      { part: 's. 31–34: Svak/sterk dualitet, dualitetsteoremet', lessons: ['lo-7'], exercises: ['lo-d4', 'lo-d5'] },
      { part: 's. 35–38: Komplementær slakkhet, anvendelser', lessons: ['lo-7'], labs: ['duality'], exercises: ['lo-d6', 'lo-d7', 'lo-d10'] },
    ],
  },
  {
    file: 'Linear_Optimization/Linear Optimization_4_Algorithm and Extension_note.pdf',
    pages: 24,
    status: 'Lest fullt.',
    examinable: 'ja',
    rows: [
      { part: 's. 2–8: Simpleksmetodens geometri (CPF, nabohjørner, optimalitetstest)', lessons: ['lo-8'], labs: ['lp'], exercises: ['lo-x1', 'lo-x2'] },
      { part: 's. 9–10: Ellipsoidemetoden', lessons: ['lo-8'] },
      { part: 's. 11–13: Linearisering (max, |·|, brøker)', lessons: ['lo-8'], exercises: ['lo-x3', 'lo-x4'] },
      { part: 's. 14–24: Usikkerhet og robust optimering', lessons: ['lo-8'], exercises: ['lo-x5', 'lo-x6'], note: 'Budsjettvarianten (Γ) er HW1 P5; dekket som supplement.' },
    ],
  },
  {
    file: 'Linear_Optimization/Linear Optimization_Practice.pdf',
    pages: 9,
    status: 'Lest fullt, inkludert offisielle løsninger (minustegn kontrollert visuelt).',
    examinable: 'ja',
    rows: [
      { part: 'Problem 1 (Weenies and Buns)', lessons: ['lo-2'], exercises: ['lo-f2', 'lo-n2'] },
      { part: 'Problem 2 (diett)', lessons: ['lo-2'], exercises: ['lo-f4'], note: 'Offisiell løsning skriver «max C»; trolig trykkfeil (minimering).' },
      { part: 'Problem 3 (ubegrenset område)', lessons: ['lo-5'], exercises: ['lo-s2'] },
      { part: 'Problem 4 (min med ≥)', lessons: ['lo-5'], exercises: ['lo-g4', 'lo-n3'] },
      { part: 'Problem 5 (parametrisk c₁, c₂)', lessons: ['lo-5'], exercises: ['lo-p2'] },
      { part: 'Problem 6 (parameter a, b)', lessons: ['lo-5', 'lo-6'], note: 'Gjennomgått i leksjonen. Den offisielle teksten oppgir Z* = 4a (a) og Z* = 0 (b, b ≤ 0); innsetting gir 10a og 4b – markert i leksjonen.' },
      { part: 'Problem 7 (ikke tillatt / dual ubegrenset)', lessons: ['lo-5', 'lo-7'], exercises: ['lo-g7', 'lo-d8'] },
    ],
  },
  {
    file: 'DiscreteOptimization/Discrete Optimization_1_Introduction_note.pdf',
    pages: 56,
    status: 'Lest fullt (formler fra bilder kontrollert visuelt).',
    examinable: 'ja',
    rows: [
      { part: 's. 1–4: Hvorfor heltall, taksonomi IP/BIP/MIP', lessons: ['do-1'], exercises: ['do-t1', 'do-t2'] },
      { part: 's. 5–8: Kapitalbudsjettering', lessons: ['do-1'], labs: ['bip'], exercises: ['do-m1', 'do-m2'] },
      { part: 's. 9: Knapsack', lessons: ['do-1'] },
      { part: 's. 10–12: Dantzigs tilordningsproblem', lessons: ['do-1'], exercises: ['do-m5'] },
      { part: 's. 13–16: Vanlige binære relasjoner', lessons: ['do-2'], labs: ['binary'], exercises: ['do-m3'] },
      { part: 's. 17–23: Enten–eller, K av N', lessons: ['do-3'], labs: ['binary'], exercises: ['do-b1', 'do-b2', 'do-b4'], note: 'Lysbilde 22 skriver 5x₁ + 3x₂ ≤ 24 + My₃, mens tabellen (s. 20–21) gir 4x₁ + 3x₂ ≤ 24 – plattformen bruker tabellverdien.' },
      { part: 's. 24–25: Funksjoner med N verdier', lessons: ['do-3'], labs: ['binary'], exercises: ['do-b3'] },
      { part: 's. 26–30: Fast kostnad', lessons: ['do-3'], labs: ['binary'], exercises: ['do-f1'] },
      { part: 's. 31: Binær ekspansjon', lessons: ['do-3'], exercises: ['do-f2'] },
      { part: 's. 32–35: Tekstilproduksjon (3 formuleringer)', lessons: ['do-4'], exercises: ['do-m9'] },
      { part: 's. 36–40: Set covering (Western Airlines)', lessons: ['do-4'], labs: ['bip'], exercises: ['do-m6'] },
      { part: 's. 41–43: Fabrikklokalisering', lessons: ['do-4'], labs: ['bip'], exercises: ['do-m7'] },
      { part: 's. 44–51: Nettverksdesign', lessons: ['do-4'], exercises: ['do-m8'] },
      { part: 's. 52–56: Generell MIP, geometri', lessons: ['do-5'], labs: ['ip'], exercises: ['do-g5'] },
    ],
  },
  {
    file: 'DiscreteOptimization/Discrete Optimization_2_Algorithm_note.pdf',
    pages: 33,
    status: 'Lest fullt (trediagrammer kontrollert visuelt; plattformens B&B gjenskaper begge eksemplene).',
    examinable: 'ja',
    rows: [
      { part: 's. 2–7: LP-relaksering, avrunding, oppramsing', lessons: ['do-5'], labs: ['ip'], exercises: ['do-g3', 'do-g4'] },
      { part: 's. 8–23: B&B for BIP (eksempel, fathoming, algoritme)', lessons: ['do-6'], labs: ['bnb'], exercises: ['do-bb1', 'do-bb2', 'do-bb7'] },
      { part: 's. 24–33: B&B for MIP', lessons: ['do-7'], labs: ['bnb'], exercises: ['do-bb4', 'do-bb5', 'do-bb6'] },
    ],
  },
  {
    file: 'DiscreteOptimization/Discrete Optimization_practice.pdf',
    pages: 4,
    status: 'Lest fullt, inkludert offisielle løsninger.',
    examinable: 'ja',
    rows: [
      { part: 'Problem 1 (enten–eller, 2 av 3, |x₁ − x₂|)', lessons: ['do-3'], exercises: ['do-b1', 'do-b2', 'do-b3'] },
      { part: 'Problem 2 (Vincent Cardoza)', lessons: ['do-5'], labs: ['ip', 'bnb'], exercises: ['do-g1', 'do-g2'] },
      { part: 'Problem 3 (husarbeid)', lessons: ['do-4'], labs: ['bip'], exercises: ['do-m4'] },
      { part: 'Problem 4 (BIP B&B)', lessons: ['do-6'], labs: ['bnb'], exercises: ['do-bb3'] },
    ],
  },
  {
    file: 'IEDA3010_HW_1.pdf',
    pages: 5,
    status: 'Lest fullt. Ingen løsninger i materialet – plattformens løsningsforslag er markert som ikke-offisielle.',
    examinable: 'delvis',
    rows: [
      { part: 'Problem 1 (utslippsreduksjon)', lessons: ['lo-2'], exercises: ['lo-f3'] },
      { part: 'Problem 2 (distribusjon med Python/COPT)', lessons: ['lo-2'], exercises: ['lo-f8'], note: 'Programmeringsdelen (b) testes ikke på midtveis; formulering og tolkning er relevant. Python/COPT behandles som supplement.' },
      { part: 'Problem 3 (parameter θ)', lessons: ['lo-5'], labs: ['lp'], exercises: ['lo-p1'] },
      { part: 'Problem 4 (dualitet og sensitivitet)', lessons: ['lo-6', 'lo-7'], labs: ['sensitivity', 'duality'], exercises: ['lo-g8', 'lo-b3'] },
      { part: 'Problem 5 (robust motpart med budsjett Γ)', lessons: ['lo-8'], exercises: ['lo-x5'], note: 'Avansert; dekket i leksjonen om robust optimering.' },
    ],
  },
  {
    file: 'Midterm Exam Practice.pdf',
    pages: 4,
    status: 'Lest fullt (tabeller i Q3 lest fra bilder). Ingen offisielle løsninger i materialet.',
    examinable: 'ja',
    rows: [
      { part: 'Q1 (LP, grafisk, flere optima, område for c₂)', lessons: ['lo-5', 'lo-6'], exercises: ['lo-g2', 'lo-c2'], note: 'Hele eksamen i simulatoren.' },
      { part: 'Q2 (bank: LP og dual)', lessons: ['lo-7'], labs: ['duality'], exercises: ['lo-d3'] },
      { part: 'Q3 (IP: faste kostnader, logikk, produksjonsnivåer)', lessons: ['do-3', 'do-4'] },
      { part: 'Q4 (sant/usant)', lessons: ['lo-5', 'lo-7', 'do-1'], exercises: ['lo-b6', 'lo-d7', 'do-t2', 'lo-d5'] },
    ],
  },
];
