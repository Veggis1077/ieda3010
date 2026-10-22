import { ReactNode } from 'react';
import { Rich } from './Math';
import { ExerciseCard } from './ExerciseCard';
import { EXERCISE_BY_ID } from '../content/exercises';

export type StepKind = 'intuition' | 'definition' | 'geometry' | 'example' | 'experiment' | 'guided' | 'exam' | 'pitfalls' | 'summary' | 'text';

const KIND: Record<StepKind, { label: string; color: string }> = {
  intuition: { label: 'Intuisjon', color: 'text-accent' },
  definition: { label: 'Formell definisjon', color: 'text-accent' },
  geometry: { label: 'Geometrisk bilde', color: 'text-feas' },
  example: { label: 'Gjennomregnet eksempel', color: 'text-good' },
  experiment: { label: 'Eksperimenter', color: 'text-obj' },
  guided: { label: 'Veiledet oppgave', color: 'text-dual' },
  exam: { label: 'Eksamensoppgave', color: 'text-opt' },
  pitfalls: { label: 'Vanlige misforståelser', color: 'text-bad' },
  summary: { label: 'Oppsummering for repetisjon', color: 'text-ink' },
  text: { label: '', color: 'text-ink' },
};

export function Concept({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-8 first:border-t-0 first:pt-0">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Step({ kind, title, children }: { kind: StepKind; title?: string; children: ReactNode }) {
  const k = KIND[kind];
  return (
    <div className="relative">
      {kind !== 'text' && (
        <div className={`label mb-1.5 flex items-center gap-2 ${k.color}`}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {k.label}
          {title && <span className="normal-case tracking-normal text-mute">· {title}</span>}
        </div>
      )}
      <div className={kind === 'summary' ? 'rounded-md border border-line bg-sunk/60 px-4 py-1' : ''}>{children}</div>
    </div>
  );
}

/** Rich text block */
export function T({ children, className }: { children: string; className?: string }) {
  return <Rich text={children} className={className} />;
}

export function Ex({ id }: { id: string }) {
  const ex = EXERCISE_BY_ID[id];
  if (!ex) return <div className="text-bad">Mangler oppgave {id}</div>;
  return <ExerciseCard ex={ex} />;
}

export function Lab({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="-mx-1 my-2">
      {children}
      {caption && <figcaption className="mt-1.5 px-1 text-xs text-mute">{caption}</figcaption>}
    </figure>
  );
}

export function Sources({ children }: { children: string }) {
  return <p className="mt-2 text-xs text-mute">Kilde i kursmateriellet: {children}</p>;
}
