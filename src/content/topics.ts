import { ChapterId } from './types';

export const TOPICS: { id: string; label: string; chapter: ChapterId; lesson: string }[] = [
  { id: 'intro.analytics', label: 'Analytics og preskriptiv analyse', chapter: 'intro', lesson: 'intro-1' },
  { id: 'intro.process', label: 'Modelleringsprosessen', chapter: 'intro', lesson: 'intro-2' },
  { id: 'intro.components', label: 'Modellkomponenter', chapter: 'intro', lesson: 'intro-2' },
  { id: 'lo.formulation', label: 'LP-formulering', chapter: 'lo', lesson: 'lo-2' },
  { id: 'lo.assumptions', label: 'LP-antakelser', chapter: 'lo', lesson: 'lo-3' },
  { id: 'lo.forms', label: 'Standardform', chapter: 'lo', lesson: 'lo-3' },
  { id: 'lo.geometry', label: 'LP-geometri', chapter: 'lo', lesson: 'lo-4' },
  { id: 'lo.graphical', label: 'Grafisk metode', chapter: 'lo', lesson: 'lo-5' },
  { id: 'lo.special', label: 'Spesialtilfeller', chapter: 'lo', lesson: 'lo-5' },
  { id: 'lo.sens-c', label: 'Sensitivitet: cⱼ', chapter: 'lo', lesson: 'lo-6' },
  { id: 'lo.sens-b', label: 'Sensitivitet: bᵢ og skyggepris', chapter: 'lo', lesson: 'lo-6' },
  { id: 'lo.sens-a', label: 'Sensitivitet: aᵢⱼ', chapter: 'lo', lesson: 'lo-6' },
  { id: 'lo.dual', label: 'Dualproblemet', chapter: 'lo', lesson: 'lo-7' },
  { id: 'lo.duality-thm', label: 'Svak/sterk dualitet', chapter: 'lo', lesson: 'lo-7' },
  { id: 'lo.cs', label: 'Komplementær slakkhet', chapter: 'lo', lesson: 'lo-7' },
  { id: 'lo.simplex', label: 'Simpleksgeometri og algoritmer', chapter: 'lo', lesson: 'lo-8' },
  { id: 'lo.linearize', label: 'Linearisering', chapter: 'lo', lesson: 'lo-8' },
  { id: 'lo.robust', label: 'Robust optimering', chapter: 'lo', lesson: 'lo-8' },
  { id: 'do.intro', label: 'IP / BIP / MIP', chapter: 'do', lesson: 'do-1' },
  { id: 'do.logic', label: 'Binære logiske relasjoner', chapter: 'do', lesson: 'do-2' },
  { id: 'do.bigm', label: 'Enten–eller, K av N', chapter: 'do', lesson: 'do-3' },
  { id: 'do.nvalues', label: 'N mulige verdier', chapter: 'do', lesson: 'do-3' },
  { id: 'do.fixed', label: 'Fast kostnad', chapter: 'do', lesson: 'do-3' },
  { id: 'do.binexp', label: 'Binær ekspansjon', chapter: 'do', lesson: 'do-3' },
  { id: 'do.models', label: 'Klassiske IP-modeller', chapter: 'do', lesson: 'do-4' },
  { id: 'do.geometry', label: 'MIP-geometri og avrunding', chapter: 'do', lesson: 'do-5' },
  { id: 'do.bnb', label: 'Branch-and-bound (BIP)', chapter: 'do', lesson: 'do-6' },
  { id: 'do.mipbnb', label: 'Branch-and-bound (MIP)', chapter: 'do', lesson: 'do-7' },
];

export const TOPIC_LABEL: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.label]));
