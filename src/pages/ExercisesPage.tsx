import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EXERCISES } from '../content/exercises';
import { TOPICS } from '../content/topics';
import { CHAPTERS } from '../content/course';
import { KIND_LABEL, ExerciseKind } from '../content/types';
import { ExerciseCard } from '../components/ExerciseCard';
import { PageHeader } from '../components/ui';
import { useProgress } from '../store/progress';

const PAGE = 8;

export default function ExercisesPage() {
  const [params, setParams] = useSearchParams();
  const exercises = useProgress((s) => s.exercises);
  const chapter = params.get('kapittel') ?? '';
  const topic = params.get('tema') ?? '';
  const kind = params.get('type') ?? '';
  const source = params.get('kilde') ?? '';
  const status = params.get('status') ?? '';
  const [page, setPage] = useState(0);
  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
    setPage(0);
  };
  const list = useMemo(
    () =>
      EXERCISES.filter((e) => {
        if (chapter && e.chapter !== chapter) return false;
        if (topic && !e.topics.includes(topic)) return false;
        if (kind && e.kind !== kind) return false;
        if (source && (source === 'official' ? e.source.kind === 'original' : e.source.kind !== 'original')) return false;
        const r = exercises[e.id];
        if (status === 'unsolved' && r?.solved) return false;
        if (status === 'solved' && !r?.solved) return false;
        if (status === 'wrong' && !(r && r.attempts.length > 0 && !r.solved)) return false;
        if (status === 'new' && r && r.attempts.length > 0) return false;
        return true;
      }),
    [chapter, topic, kind, source, status, exercises],
  );
  const pages = Math.ceil(list.length / PAGE);
  const shown = list.slice(page * PAGE, page * PAGE + PAGE);
  const kinds = [...new Set(EXERCISES.map((e) => e.kind))] as ExerciseKind[];
  return (
    <div>
      <PageHeader kicker="Øvingsbank" title="Oppgaver">
        {EXERCISES.length} oppgaver: offisielle oppgaver fra kursmateriellet (markert oransje), tilpassede oppgaver og nye oppgaver. Bruk hintene i rekkefølge – full løsning vises først når du har prøvd.
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <select className="input" value={chapter} onChange={(e) => set('kapittel', e.target.value)} aria-label="Kapittel">
          <option value="">Alle kapitler</option>
          {CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select className="input" value={topic} onChange={(e) => set('tema', e.target.value)} aria-label="Tema">
          <option value="">Alle temaer</option>
          {TOPICS.filter((t) => !chapter || t.chapter === chapter).map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select className="input" value={kind} onChange={(e) => set('type', e.target.value)} aria-label="Oppgavetype">
          <option value="">Alle typer</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <select className="input" value={source} onChange={(e) => set('kilde', e.target.value)} aria-label="Kilde">
          <option value="">Alle kilder</option>
          <option value="official">Fra kursmateriellet</option>
          <option value="original">Nye oppgaver</option>
        </select>
        <select className="input" value={status} onChange={(e) => set('status', e.target.value)} aria-label="Status">
          <option value="">Alle</option>
          <option value="new">Ikke prøvd</option>
          <option value="wrong">Prøvd, ikke løst</option>
          <option value="unsolved">Ikke løst</option>
          <option value="solved">Løst</option>
        </select>
        <span className="self-center text-mute">{list.length} treff</span>
      </div>
      <div className="space-y-4">
        {shown.map((e) => (
          <ExerciseCard key={e.id} ex={e} />
        ))}
        {list.length === 0 && <p className="text-mute">Ingen oppgaver passer filteret.</p>}
      </div>
      {pages > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-1">
          {Array.from({ length: pages }, (_, k) => (
            <button
              key={k}
              className={`btn px-2.5 ${k === page ? 'border-accent bg-accent/10' : ''}`}
              onClick={() => {
                setPage(k);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={k === page}
            >
              {k + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
