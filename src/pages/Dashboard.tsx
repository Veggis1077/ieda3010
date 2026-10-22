import { Link } from 'react-router-dom';
import { CHAPTERS, LESSONS, LABS, LESSON_BY_ID } from '../content/course';
import { useProgress } from '../store/progress';
import { useTopicStats, dueCards, overall } from '../store/analytics';
import { ProgressBar } from '../components/ui';
import { useCountdown } from '../components/Layout';
import { EXERCISES } from '../content/exercises';
import { EXAMS } from '../content/exams';

export default function Dashboard() {
  const lessonsDone = useProgress((s) => s.lessonsDone);
  const visited = useProgress((s) => s.lessonsVisited);
  const exercises = useProgress((s) => s.exercises);
  const cards = useProgress((s) => s.cards);
  const exams = useProgress((s) => s.exams);
  const lastPath = useProgress((s) => s.lastPath);
  const examDate = useProgress((s) => s.examDate);
  const stats = useTopicStats();
  const ov = overall(lessonsDone, exercises);
  const cd = useCountdown(examDate);
  const due = dueCards(cards);
  const nextLesson = LESSONS.find((l) => !lessonsDone[l.id]);
  const weak = [...stats].filter((s) => s.attempted > 0).sort((a, b) => b.weakness - a.weakness).slice(0, 5);
  const untouched = stats.filter((s) => s.attempted === 0);
  const finished = exams.filter((e) => e.results).slice(-4).reverse();
  const lastLabel = (() => {
    if (!lastPath) return null;
    const m = lastPath.match(/^\/leksjon\/(.+)$/);
    if (m) return LESSON_BY_ID[m[1]]?.title;
    const l = lastPath.match(/^\/lab\/(.+)$/);
    if (l) return LABS.find((x) => x.id === l[1])?.title;
    return null;
  })();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="label mb-1">HKUST · IEDA3010 Prescriptive Analytics</div>
          <h1 className="text-[1.9rem] font-semibold leading-tight tracking-tight">Midtveiseksamen 4. november</h1>
          <p className="mt-2 max-w-xl text-mute">
            Pensum: introduksjon, lineær optimering og diskret optimering. 2 timer, ett dobbeltsidig A4-ark og kalkulator. Python testes ikke.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lastPath && lastLabel ? (
              <Link to={lastPath} className="btn-primary">
                Fortsett: {lastLabel} →
              </Link>
            ) : nextLesson ? (
              <Link to={`/leksjon/${nextLesson.id}`} className="btn-primary">
                Start: {nextLesson.title} →
              </Link>
            ) : null}
            {nextLesson && lastPath && (
              <Link to={`/leksjon/${nextLesson.id}`} className="btn">
                Neste uferdige leksjon
              </Link>
            )}
            <Link to="/eksamen" className="btn">
              Eksamenssimulator
            </Link>
          </div>
        </div>
        <div className="card flex flex-col justify-between p-4">
          <div className="label">Nedtelling</div>
          {cd.ms > 0 ? (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tabular-nums tracking-tight">{cd.days}</span>
              <span className="text-mute">dager</span>
              <span className="text-2xl font-semibold tabular-nums">{cd.hours}</span>
              <span className="text-mute">timer</span>
            </div>
          ) : (
            <div className="mt-1 text-lg">Eksamensdagen er passert.</div>
          )}
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xl font-semibold tabular-nums">
                {ov.lessonsDone}/{ov.totalLessons}
              </div>
              <div className="text-xs text-mute">leksjoner fullført</div>
            </div>
            <div>
              <div className="text-xl font-semibold tabular-nums">
                {ov.solved}/{ov.totalEx}
              </div>
              <div className="text-xs text-mute">oppgaver løst</div>
            </div>
            <div>
              <div className="text-xl font-semibold tabular-nums">{due.length}</div>
              <div className="text-xs text-mute">kort å repetere</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Kapitler</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {CHAPTERS.map((ch) => {
            const ls = LESSONS.filter((l) => l.chapter === ch.id);
            const done = ls.filter((l) => lessonsDone[l.id]).length;
            const exs = EXERCISES.filter((e) => e.chapter === ch.id);
            const solved = exs.filter((e) => exercises[e.id]?.solved).length;
            return (
              <Link key={ch.id} to={`/kapittel/${ch.id}`} className="card block p-4 transition-colors hover:border-accent/60">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{ch.title}</h3>
                  <span className="text-xs text-mute">{ch.english}</span>
                </div>
                <p className="mt-1 text-sm text-mute">{ch.blurb}</p>
                <div className="mt-3 space-y-1.5 text-xs text-mute">
                  <div className="flex justify-between">
                    <span>Leksjoner</span>
                    <span>
                      {done}/{ls.length}
                    </span>
                  </div>
                  <ProgressBar value={done / ls.length} />
                  <div className="flex justify-between pt-1">
                    <span>Oppgaver løst</span>
                    <span>
                      {solved}/{exs.length}
                    </span>
                  </div>
                  <ProgressBar value={solved / Math.max(1, exs.length)} tone="good" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Svake temaer</h2>
            <Link to="/fremgang" className="text-xs text-accent hover:underline">
              Alle temaer →
            </Link>
          </div>
          {weak.length === 0 ? (
            <p className="text-sm text-mute">Løs noen oppgaver, så viser plattformen hvilke temaer du bør øve mer på. Ingen tall her er oppdiktet – alt beregnes fra dine egne forsøk.</p>
          ) : (
            <ul className="space-y-2">
              {weak.map((w) => (
                <li key={w.id} className="flex items-center gap-3 text-sm">
                  <span className="w-44 truncate">{w.label}</span>
                  <ProgressBar value={w.accuracy ?? 0} tone={(w.accuracy ?? 0) > 0.75 ? 'good' : (w.accuracy ?? 0) > 0.4 ? 'warn' : 'bad'} />
                  <span className="w-10 text-right tabular-nums text-mute">{w.accuracy !== null ? Math.round(w.accuracy * 100) + '%' : '–'}</span>
                  <Link to={`/oppgaver?tema=${w.id}`} className="whitespace-nowrap text-xs text-accent hover:underline">
                    Øv →
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {untouched.length > 0 && (
            <p className="mt-3 text-xs text-mute">
              Ikke øvd ennå: {untouched.slice(0, 6).map((u) => u.label).join(', ')}
              {untouched.length > 6 ? ` og ${untouched.length - 6} til` : ''}.
            </p>
          )}
        </div>
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Eksamensforsøk</h2>
            <Link to="/eksamen" className="text-xs text-accent hover:underline">
              Simulator →
            </Link>
          </div>
          {finished.length === 0 ? (
            <p className="text-sm text-mute">Ingen fullførte prøveeksamener ennå. Ta den offisielle øvingseksamenen under tidspress (120 min).</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {finished.map((s) => {
                const ex = EXAMS.find((e) => e.id === s.examId);
                const got = s.results!.reduce((a, p) => a + p.score, 0);
                const max = s.results!.reduce((a, p) => a + p.max, 0);
                return (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <Link to={`/eksamen/${s.id}`} className="truncate hover:underline">
                      {ex?.title ?? s.examId}
                    </Link>
                    <span className="text-xs text-mute">{new Date(s.startedAt).toLocaleDateString('nb-NO')}</span>
                    <span className="font-semibold tabular-nums">
                      {Math.round(got)}/{max}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between rounded-md bg-sunk px-3 py-2 text-sm">
            <span>{due.length} flashcards forfaller i dag</span>
            <Link to="/repetisjon" className="btn">
              Repeter
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Laboratorier</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map((l) => (
            <Link key={l.id} to={`/lab/${l.id}`} className="card block p-3 transition-colors hover:border-obj/60">
              <div className="text-sm font-semibold">
                <span className="text-obj">◆</span> {l.title}
              </div>
              <p className="mt-0.5 text-xs text-mute">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>
      {Object.keys(visited).length === 0 && (
        <p className="text-xs text-mute">Fremgangen lagres lokalt i nettleseren din (localStorage). Du kan eksportere den under «Fremgang».</p>
      )}
    </div>
  );
}
