import { lazy, LazyExoticComponent, ComponentType } from 'react';
import { ChapterId } from './types';

export interface LessonMeta {
  id: string;
  chapter: ChapterId;
  title: string;
  summary: string;
  sources: string;
  topics: string[];
  minutes: number;
  component: LazyExoticComponent<ComponentType>;
  sections: { id: string; title: string }[];
}

export interface LabMeta {
  id: string;
  chapter: ChapterId;
  title: string;
  summary: string;
  component: LazyExoticComponent<ComponentType>;
}

export interface Chapter {
  id: ChapterId;
  title: string;
  english: string;
  blurb: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'intro', title: 'Introduksjon', english: 'Introduction', blurb: 'Analytics, preskriptiv analyse og hvordan virkelige problemer blir matematiske modeller.' },
  { id: 'lo', title: 'Lineær optimering', english: 'Linear Optimization', blurb: 'Formulering, geometri, grafisk løsning, sensitivitet, dualitet og algoritmer.' },
  { id: 'do', title: 'Diskret optimering', english: 'Discrete Optimization', blurb: 'Heltalls- og binærmodeller, logiske relasjoner, big M og branch-and-bound.' },
];

const L = (f: () => Promise<{ default: ComponentType }>) => lazy(f);

export const LESSONS: LessonMeta[] = [
  {
    id: 'intro-1',
    chapter: 'intro',
    title: 'Analytics og preskriptiv analyse',
    summary: 'Deskriptiv → prediktiv → preskriptiv. Hva optimering tilfører, og hvor OR kommer fra.',
    sources: 'Introduction_note.pdf s. 2–15',
    topics: ['intro.analytics'],
    minutes: 20,
    component: L(() => import('./lessons/Intro1')),
    sections: [
      { id: 'maturity', title: 'Modenhetskurven' },
      { id: 'prescriptive', title: 'Preskriptiv analyse' },
      { id: 'history', title: 'Historie og anvendelser' },
    ],
  },
  {
    id: 'intro-2',
    chapter: 'intro',
    title: 'Fra virkelighet til modell',
    summary: 'De fem stegene i metodikken, modellkomponenter og eksempler (lager, prising, portefølje, helse).',
    sources: 'Introduction_note.pdf s. 16–34',
    topics: ['intro.process', 'intro.components'],
    minutes: 35,
    component: L(() => import('./lessons/Intro2')),
    sections: [
      { id: 'method', title: 'Metodikken' },
      { id: 'components', title: 'Modellkomponenter' },
      { id: 'pricing', title: 'Eksempel: prisdiskriminering' },
    ],
  },
  {
    id: 'lo-1',
    chapter: 'lo',
    title: 'Hva er lineær optimering?',
    summary: 'Lego-spillet, Wyndor Glass og de tre nøkkelkomponentene. Formuleringsretningslinjer.',
    sources: 'LO1 s. 2–17, 44–45',
    topics: ['lo.formulation'],
    minutes: 35,
    component: L(() => import('./lessons/LO1')),
    sections: [
      { id: 'lego', title: 'Lego-spillet' },
      { id: 'components', title: 'Nøkkelkomponenter' },
      { id: 'wyndor', title: 'Wyndor Glass Co.' },
      { id: 'guidelines', title: 'Formuleringsretningslinjer' },
    ],
  },
  {
    id: 'lo-2',
    chapter: 'lo',
    title: 'Formuleringseksempler',
    summary: 'Transport, strålebehandling, luftforurensning, personalplanlegging og distribusjonsnettverk.',
    sources: 'LO1 s. 18–43',
    topics: ['lo.formulation'],
    minutes: 50,
    component: L(() => import('./lessons/LO2')),
    sections: [
      { id: 'transport', title: 'Transportproblemet' },
      { id: 'radiation', title: 'Strålebehandling' },
      { id: 'pollution', title: 'Luftforurensning' },
      { id: 'scheduling', title: 'Personalplanlegging' },
      { id: 'network', title: 'Distribusjonsnettverk' },
    ],
  },
  {
    id: 'lo-3',
    chapter: 'lo',
    title: 'LP-antakelser og standardform',
    summary: 'Proporsjonalitet, additivitet, delbarhet, sikkerhet. Standardform og andre former.',
    sources: 'LO2 s. 2–13',
    topics: ['lo.assumptions', 'lo.forms'],
    minutes: 25,
    component: L(() => import('./lessons/LO3')),
    sections: [
      { id: 'assumptions', title: 'De fire antakelsene' },
      { id: 'standard', title: 'Standardform' },
    ],
  },
  {
    id: 'lo-4',
    chapter: 'lo',
    title: 'LP-geometri',
    summary: 'Halvplan, tillatt område, hjørnepunkter, isokvanter, bindende restriksjoner og slakk.',
    sources: 'LO2 s. 14–35',
    topics: ['lo.geometry'],
    minutes: 40,
    component: L(() => import('./lessons/LO4')),
    sections: [
      { id: 'halfplanes', title: 'Restriksjoner som halvplan' },
      { id: 'objective', title: 'Isokvanter og optimum' },
      { id: 'binding', title: 'Bindende restriksjoner og slakk' },
      { id: 'extreme', title: 'Hjørnepunktteoremet' },
    ],
  },
  {
    id: 'lo-5',
    chapter: 'lo',
    title: 'Grafisk metode og spesialtilfeller',
    summary: 'Steg-for-steg grafisk løsning, flere optima, ubegrensethet, ikke-tillatte problemer og parametrisk analyse.',
    sources: 'LO2 s. 26–29, LO Practice 3–7, HW1 P3',
    topics: ['lo.graphical', 'lo.special'],
    minutes: 45,
    component: L(() => import('./lessons/LO5')),
    sections: [
      { id: 'method', title: 'Grafisk metode' },
      { id: 'special', title: 'Spesialtilfeller' },
      { id: 'parametric', title: 'Parametrisk målfunksjon' },
    ],
  },
  {
    id: 'lo-6',
    chapter: 'lo',
    title: 'Sensitivitetsanalyse',
    summary: 'Endringer i cⱼ, bᵢ og aᵢⱼ. Optimalitetsområder, skyggepriser og når de slutter å gjelde.',
    sources: 'LO3 s. 1–18',
    topics: ['lo.sens-c', 'lo.sens-b', 'lo.sens-a'],
    minutes: 50,
    component: L(() => import('./lessons/LO6')),
    sections: [
      { id: 'cj', title: 'Endring i cⱼ' },
      { id: 'bi', title: 'Endring i bᵢ og skyggepris' },
      { id: 'aij', title: 'Endring i aᵢⱼ' },
    ],
  },
  {
    id: 'lo-7',
    chapter: 'lo',
    title: 'Dualitet',
    summary: 'Dualproblemet, økonomisk tolkning, svak og sterk dualitet, dualitetsteoremet, komplementær slakkhet.',
    sources: 'LO3 s. 19–40',
    topics: ['lo.dual', 'lo.duality-thm', 'lo.cs'],
    minutes: 55,
    component: L(() => import('./lessons/LO7')),
    sections: [
      { id: 'dual', title: 'Dualproblemet' },
      { id: 'econ', title: 'Økonomisk tolkning' },
      { id: 'weakstrong', title: 'Svak og sterk dualitet' },
      { id: 'cs', title: 'Komplementær slakkhet' },
    ],
  },
  {
    id: 'lo-8',
    chapter: 'lo',
    title: 'Algoritmer og utvidelser',
    summary: 'Simpleksmetodens geometri, ellipsoide- og indrepunktmetoder, linearisering og robust optimering.',
    sources: 'LO4 s. 1–24',
    topics: ['lo.simplex', 'lo.linearize', 'lo.robust'],
    minutes: 35,
    component: L(() => import('./lessons/LO8')),
    sections: [
      { id: 'simplex', title: 'Simpleksmetodens geometri' },
      { id: 'algos', title: 'Ellipsoide og indrepunkt' },
      { id: 'linearize', title: 'Linearisering' },
      { id: 'robust', title: 'Robust optimering' },
    ],
  },
  {
    id: 'do-1',
    chapter: 'do',
    title: 'Diskret optimering: hvorfor og hvordan',
    summary: 'IP/BIP/MIP, kapitalbudsjettering, knapsack og tilordningsproblemet.',
    sources: 'DO1 s. 1–11',
    topics: ['do.intro', 'do.models'],
    minutes: 30,
    component: L(() => import('./lessons/DO1')),
    sections: [
      { id: 'why', title: 'Hvorfor heltall?' },
      { id: 'capital', title: 'Kapitalbudsjettering og knapsack' },
      { id: 'assignment', title: 'Tilordningsproblemet' },
    ],
  },
  {
    id: 'do-2',
    chapter: 'do',
    title: 'Binære variabler og logiske relasjoner',
    summary: 'Høyst én, enten–eller, alt eller ingenting, betinget, betinget område.',
    sources: 'DO1 s. 12–16',
    topics: ['do.logic'],
    minutes: 30,
    component: L(() => import('./lessons/DO2')),
    sections: [
      { id: 'logic', title: 'Logikk med binære variabler' },
      { id: 'range', title: 'Betinget område' },
    ],
  },
  {
    id: 'do-3',
    chapter: 'do',
    title: 'Big M-teknikker',
    summary: 'Enten–eller-restriksjoner, K av N, funksjoner med N verdier, fast kostnad og binær ekspansjon.',
    sources: 'DO1 s. 17–31',
    topics: ['do.bigm', 'do.nvalues', 'do.fixed', 'do.binexp'],
    minutes: 50,
    component: L(() => import('./lessons/DO3')),
    sections: [
      { id: 'eitheror', title: 'Enten–eller-restriksjoner' },
      { id: 'kofn', title: 'K av N' },
      { id: 'nvalues', title: 'N mulige verdier' },
      { id: 'fixed', title: 'Fast kostnad' },
      { id: 'binexp', title: 'Binær ekspansjon' },
    ],
  },
  {
    id: 'do-4',
    chapter: 'do',
    title: 'Modelleringseksempler',
    summary: 'Tekstilproduksjon, set covering (hub-lokalisering), fabrikklokalisering og nettverksdesign.',
    sources: 'DO1 s. 32–52',
    topics: ['do.models', 'do.fixed'],
    minutes: 45,
    component: L(() => import('./lessons/DO4')),
    sections: [
      { id: 'textile', title: 'Tekstilproduksjon' },
      { id: 'cover', title: 'Set covering' },
      { id: 'facility', title: 'Fabrikklokalisering' },
      { id: 'network', title: 'Nettverksdesign' },
    ],
  },
  {
    id: 'do-5',
    chapter: 'do',
    title: 'MIP-geometri, relaksering og avrunding',
    summary: 'Tillatte mengder for IP/MIP, LP-relaksering, integralitetsgap og hvorfor avrunding feiler.',
    sources: 'DO1 s. 52–56, DO2 s. 2–7',
    topics: ['do.geometry'],
    minutes: 30,
    component: L(() => import('./lessons/DO5')),
    sections: [
      { id: 'geometry', title: 'Geometri for MIP' },
      { id: 'rounding', title: 'Relaksering og avrunding' },
    ],
  },
  {
    id: 'do-6',
    chapter: 'do',
    title: 'Branch-and-bound for BIP',
    summary: 'Forgrening, grenser, de tre fathoming-testene og hele forelesningseksemplet steg for steg.',
    sources: 'DO2 s. 8–23',
    topics: ['do.bnb'],
    minutes: 50,
    component: L(() => import('./lessons/DO6')),
    sections: [
      { id: 'idea', title: 'Del og hersk' },
      { id: 'fathom', title: 'Fathoming' },
      { id: 'walk', title: 'Forelesningseksemplet' },
    ],
  },
  {
    id: 'do-7',
    chapter: 'do',
    title: 'Branch-and-bound for MIP',
    summary: 'De fire endringene fra BIP, forgrening i intervaller og MIP-eksemplet.',
    sources: 'DO2 s. 24–33',
    topics: ['do.mipbnb'],
    minutes: 35,
    component: L(() => import('./lessons/DO7')),
    sections: [
      { id: 'changes', title: 'Fire endringer' },
      { id: 'example', title: 'MIP-eksemplet' },
    ],
  },
];

export const LABS: LabMeta[] = [
  { id: 'lp', chapter: 'lo', title: 'Interaktivt LP-laboratorium', summary: 'Dra restriksjoner, roter målfunksjonen, se hjørner, optimum og spesialtilfeller.', component: L(() => import('../pages/labs/LPLabPage')) },
  { id: 'sensitivity', chapter: 'lo', title: 'Sensitivitetslaboratorium', summary: 'Endre bᵢ og cⱼ og se skyggepriser, områder og Z*-kurven.', component: L(() => import('../pages/labs/SensitivityLabPage')) },
  { id: 'duality', chapter: 'lo', title: 'Dualitetsutforsker', summary: 'Synkronisert primal/dual, komplementær slakkhet og svak dualitet.', component: L(() => import('../pages/labs/DualityLabPage')) },
  { id: 'ip', chapter: 'do', title: 'Heltallsgeometri', summary: 'LP-relaksering vs. heltallsoptimum, avrunding og integralitetsgap.', component: L(() => import('../pages/labs/IPLabPage')) },
  { id: 'bnb', chapter: 'do', title: 'Branch-and-bound', summary: 'Bygg B&B-treet steg for steg, velg noder og forgreningsvariabler.', component: L(() => import('../pages/labs/BnBLabPage')) },
  { id: 'binary', chapter: 'do', title: 'Binære variabler og big M', summary: 'Sannhetstabeller, enten–eller-geometri, K av N, fast kostnad.', component: L(() => import('../pages/labs/BinaryLabPage')) },
  { id: 'bip', chapter: 'do', title: 'BIP-utforsker', summary: 'Kapitalbudsjettering, lokalisering, tilordning og set covering.', component: L(() => import('../pages/labs/BIPLabPage')) },
  { id: 'lego', chapter: 'intro', title: 'Lego-spillet', summary: 'Bygg stoler og bord og finn den beste planen.', component: L(() => import('../pages/labs/LegoLabPage')) },
  { id: 'pricing', chapter: 'intro', title: 'Prisdiskriminering', summary: 'Markedssegmentering fra introduksjonsforelesningen.', component: L(() => import('../pages/labs/PricingLabPage')) },
];

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const MIDTERM_DATE_DEFAULT = '2026-11-04T09:00:00+08:00';
