import { Model2D, Pt } from '../math/lp2d';
import { ExpectedFormulation } from '../math/linparse';

export type ChapterId = 'intro' | 'lo' | 'do';

export interface Source {
  kind: 'official' | 'official-adapted' | 'original';
  /** e.g. "LO Practice, Problem 4" */
  ref?: string;
  /** official solution exists in the course material */
  officialSolution?: boolean;
}

interface Base {
  id: string;
  chapter: ChapterId;
  topics: string[];
  title: string;
  difficulty: 1 | 2 | 3;
  source: Source;
  prompt: string;
  /** conceptual clue, suggested method, first mathematical step */
  hints: [string, string, string];
  solution: string;
  /** optional mini-rubric for strict grading */
  rubric?: string[];
}

export interface NumField {
  label: string; // tex
  answer: number;
  tol?: number; // absolute tolerance (default 1e-3 * (1+|answer|))
  /** accept "unbounded"/"infinite" text for ±∞ answers */
  allowInfinity?: boolean;
}

export interface ExprField {
  label: string;
  answer: string;
  vars: string[];
  mode: 'relation' | 'expr';
  /** allow any positive multiple (relation always allows) */
  scale?: boolean;
}

export type Exercise = Base &
  (
    | { kind: 'mc'; options: string[]; answer: number; explain?: string[] }
    | { kind: 'multi'; options: string[]; answers: number[]; explain?: string[] }
    | { kind: 'tf'; statements: { text: string; answer: boolean; why: string }[] }
    | { kind: 'numeric'; fields: NumField[] }
    | { kind: 'expr'; fields: ExprField[] }
    | { kind: 'formulation'; expected: ExpectedFormulation; placeholder?: string }
    | { kind: 'graph-points'; model: Model2D; points: Pt[]; axisNames?: [string, string] }
    | { kind: 'graph-optimum'; model: Model2D; axisNames?: [string, string] }
    | { kind: 'graph-binding'; model: Model2D; axisNames?: [string, string] }
    | { kind: 'graph-objective'; model: Model2D; axisNames?: [string, string] }
  );

export type ExerciseKind = Exercise['kind'];

export const KIND_LABEL: Record<ExerciseKind, string> = {
  mc: 'Flervalg',
  multi: 'Velg alle riktige',
  tf: 'Sant/usant',
  numeric: 'Numerisk',
  expr: 'Matematisk uttrykk',
  formulation: 'Formulering',
  'graph-points': 'Graf: tillatte punkter',
  'graph-optimum': 'Graf: finn optimum',
  'graph-binding': 'Graf: bindende restriksjoner',
  'graph-objective': 'Graf: dra objektivlinjen',
};

export interface Flashcard {
  id: string;
  topic: string;
  kind: 'definisjon' | 'dualitet' | 'vanlig feil' | 'teori' | 'metode';
  front: string;
  back: string;
}
