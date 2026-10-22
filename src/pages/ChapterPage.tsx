import { Link, useParams } from 'react-router-dom';
import { CHAPTERS, LESSONS, LABS } from '../content/course';
import { useProgress } from '../store/progress';
import { EXERCISES } from '../content/exercises';
import { PageHeader, Badge } from '../components/ui';
import { TOPIC_LABEL } from '../content/topics';

export default function ChapterPage() {
  const { chapterId } = useParams();
  const ch = CHAPTERS.find((c) => c.id === chapterId);
  const done = useProgress((s) => s.lessonsDone);
  const exercises = useProgress((s) => s.exercises);
  if (!ch) return <p>Ukjent kapittel.</p>;
  const lessons = LESSONS.filter((l) => l.chapter === ch.id);
  const labs = LABS.filter((l) => l.chapter === ch.id);
  const exs = EXERCISES.filter((e) => e.chapter === ch.id);
  return (
    <div>
      <PageHeader kicker={ch.english} title={ch.title}>
        {ch.blurb}
      </PageHeader>
      <h2 className="label mb-2">Leksjoner</h2>
      <ol className="space-y-2">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <Link to={`/leksjon/${l.id}`} className="card flex items-start gap-4 p-4 transition-colors hover:border-accent/60">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${done[l.id] ? 'border-good bg-good/10 text-good' : 'border-line text-mute'}`}>
                {done[l.id] ? '✓' : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-semibold">{l.title}</h3>
                  <span className="text-xs text-mute">ca. {l.minutes} min</span>
                </div>
                <p className="mt-0.5 text-sm text-mute">{l.summary}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="chip normal-case">Kilde: {l.sources}</span>
                  {l.topics.map((t) => (
                    <span key={t} className="chip normal-case">
                      {TOPIC_LABEL[t]}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      {labs.length > 0 && (
        <>
          <h2 className="label mb-2 mt-8">Interaktive laboratorier</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {labs.map((l) => (
              <Link key={l.id} to={`/lab/${l.id}`} className="card block p-4 transition-colors hover:border-obj/60">
                <div className="font-semibold">
                  <span className="text-obj">◆</span> {l.title}
                </div>
                <p className="mt-0.5 text-sm text-mute">{l.summary}</p>
              </Link>
            ))}
          </div>
        </>
      )}
      <h2 className="label mb-2 mt-8">Oppgaver</h2>
      <Link to={`/oppgaver?kapittel=${ch.id}`} className="card flex items-center justify-between p-4 hover:border-dual/60">
        <span>
          {exs.length} oppgaver ({exs.filter((e) => e.source.kind === 'official').length} offisielle fra kursmateriellet)
        </span>
        <Badge tone="good">{exs.filter((e) => exercises[e.id]?.solved).length} løst</Badge>
      </Link>
    </div>
  );
}
