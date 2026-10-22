import { Model2D } from '../math/lp2d';

export interface Preset {
  id: string;
  name: string;
  source: string;
  note?: string;
  model: Model2D;
  axisNames?: [string, string];
  labels?: string[];
}

let k = 0;
const con = (a1: number, a2: number, op: '<=' | '>=' | '=', b: number, label?: string) => ({ id: `k${k++}`, a1, a2, op, b, label });

export const PRESETS: Preset[] = [
  {
    id: 'wyndor',
    name: 'Wyndor Glass Co.',
    source: 'Forelesning LO1/LO2/LO3 (Wyndor-eksempelet)',
    model: { sense: 'max', c1: 3, c2: 5, nonneg: true, constraints: [con(1, 0, '<=', 4, 'Anlegg 1'), con(0, 2, '<=', 12, 'Anlegg 2'), con(3, 2, '<=', 18, 'Anlegg 3')] },
  },
  {
    id: 'lego',
    name: 'Lego-spillet (stoler og bord)',
    source: 'Forelesning LO1 og LO3 (The Lego Game)',
    axisNames: ['C', 'T'],
    model: { sense: 'max', c1: 40, c2: 50, nonneg: true, constraints: [con(1, 2, '<=', 10, 'Store klosser'), con(4, 3, '<=', 30, 'Små klosser')] },
  },
  {
    id: 'mid-q1',
    name: 'Midtveis-øving Q1 (montering/testing)',
    source: 'Midterm Exam Practice, Question 1',
    model: { sense: 'max', c1: 2, c2: 5, nonneg: true, constraints: [con(1, 2, '<=', 80, 'Montering'), con(1, 3, '<=', 90, 'Testing')] },
  },
  {
    id: 'hw1-p4',
    name: 'HW1 Problem 4 (maskin/etterbehandling)',
    source: 'IEDA3010 HW1, Problem 4',
    model: { sense: 'max', c1: 50, c2: 40, nonneg: true, constraints: [con(2, 1, '<=', 100, 'Maskintid'), con(1, 2, '<=', 80, 'Etterbehandling')] },
  },
  {
    id: 'hw1-p3',
    name: 'HW1 Problem 3 (parameter θ)',
    source: 'IEDA3010 HW1, Problem 3 (θ = 1 som start)',
    note: 'Endre c₂ (= θ) og se hvordan optimum hopper mellom hjørnene.',
    model: { sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: [con(1, 1, '<=', 7), con(2, 1, '<=', 10), con(0, 1, '<=', 5)] },
  },
  {
    id: 'multi',
    name: 'Flere optimale løsninger',
    source: 'Forelesning LO2, s. 27 (max 2x₁ + x₂)',
    model: { sense: 'max', c1: 2, c2: 1, nonneg: true, constraints: [con(1, 2, '<=', 3), con(2, 1, '<=', 3)] },
  },
  {
    id: 'unbounded',
    name: 'Ubegrenset problem',
    source: 'Forelesning LO2, s. 28',
    model: { sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: [con(-1, 2, '<=', 2), con(1, -2, '<=', 2)] },
  },
  {
    id: 'p3',
    name: 'Ubegrenset område, endelig optimum',
    source: 'LO Practice, Problem 3(b)',
    model: { sense: 'max', c1: -1, c2: 1, nonneg: true, constraints: [con(-1, 3, '<=', 30), con(-3, 1, '<=', 30)] },
  },
  {
    id: 'infeasible',
    name: 'Ingen tillatt løsning',
    source: 'LO Practice, Problem 7',
    model: { sense: 'max', c1: 1, c2: 2, nonneg: true, constraints: [con(-1, 1, '<=', -2), con(4, 1, '<=', 4)] },
  },
  {
    id: 'min-p4',
    name: 'Minimering med ≥ (kost)',
    source: 'LO Practice, Problem 4',
    model: { sense: 'min', c1: 40, c2: 50, nonneg: true, constraints: [con(2, 3, '>=', 30), con(1, 1, '>=', 12), con(2, 1, '>=', 20)] },
  },
  {
    id: 'degenerate',
    name: 'Degenerasjon og redundans',
    source: 'Wyndor + ekstra restriksjon x₁ + x₂ ≤ 8 (konstruert)',
    model: { sense: 'max', c1: 3, c2: 5, nonneg: true, constraints: [con(1, 0, '<=', 4), con(0, 2, '<=', 12), con(3, 2, '<=', 18), con(1, 1, '<=', 8)] },
  },
  {
    id: 'radiation',
    name: 'Strålebehandling (likhetsrestriksjon)',
    source: 'Forelesning LO1, Example 2 (Mary)',
    model: {
      sense: 'min',
      c1: 0.4,
      c2: 0.5,
      nonneg: true,
      constraints: [con(0.3, 0.1, '<=', 2.7, 'Kritisk vev'), con(0.5, 0.5, '=', 6, 'Svulst'), con(0.6, 0.4, '>=', 6, 'Senter')],
    },
  },
  {
    id: 'p5',
    name: 'Parametrisk c₁, c₂',
    source: 'LO Practice, Problem 5',
    model: { sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: [con(2, 1, '<=', 11), con(-1, 2, '<=', 2)] },
  },
  {
    id: 'vincent',
    name: 'Vincent Cardoza (IP)',
    source: 'DO Practice, Problem 2',
    axisNames: ['T', 'S'],
    model: { sense: 'max', c1: 130, c2: 150, nonneg: true, constraints: [con(3.2, 2.4, '<=', 16, 'Maskin 1'), con(2, 3, '<=', 15, 'Maskin 2')] },
  },
  {
    id: 'clay',
    name: 'Geometri for MIP (B, M)',
    source: 'Forelesning DO1, s. 53–55',
    axisNames: ['B', 'M'],
    model: { sense: 'max', c1: 40, c2: 50, nonneg: true, constraints: [con(1, 2, '<=', 40, 'Arbeid'), con(4, 3, '<=', 120, 'Leire')] },
  },
  {
    id: 'rounding1',
    name: 'Avrunding gir ikke-tillatt løsning',
    source: 'Forelesning DO2, s. 3–4',
    model: { sense: 'max', c1: 0, c2: 1, nonneg: true, constraints: [con(-1, 1, '<=', 0.5), con(1, 1, '<=', 3.5)] },
  },
  {
    id: 'rounding2',
    name: 'Avrunding langt fra optimum',
    source: 'Forelesning DO2, s. 5–6',
    model: { sense: 'max', c1: 1, c2: 5, nonneg: true, constraints: [con(1, 10, '<=', 20), con(1, 0, '<=', 2)] },
  },
];

export function getPreset(id: string): Preset {
  const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0];
  return structuredClone(p);
}

let uid = 1000;
export const newConId = () => `u${uid++}`;
