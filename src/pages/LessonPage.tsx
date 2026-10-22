import { Suspense, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LESSONS, LESSON_BY_ID, CHAPTERS } from '../content/course';
import { useProgress } from '../store/progress';
import { EXERCISES } from '../content/exercises';
import { TOPIC_LABEL } from '../content/topics';

export default function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? LESSON_BY_ID[lessonId] : undefined;
  const visit = useProgress((s) => s.visitLesson);
  const done = useProgress((s) => s.lessonsDone);
  const toggle = useProgress((s) => s.toggleLessonDone);
  const exercises = useProgress((s) => s.exercises);
  useEffect(() => {
    if (lesson) visit(lesson.id);
  }, [lesson, visit]);
  if (!lesson) return <p>Fant ikke leksjonen.</p>;
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const ch = CHAPTERS.find((c) => c.id === lesson.chapter)!;
  const Comp = lesson.component;
  const related = EXERCISES.filter((e) => e.topics.some((t) => lesson.topics.includes(t)));
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-8">
      <article className="min-w-0">
        <header className="mb-8">
          <div className="label mb-1">
            <Link to={`/kapittel/${ch.id}`} className="hover:text-ink">
              {ch.title}
            </Link>{' '}
            · Leksjon {LESSONS.filter((l) => l.chapter === ch.id).indexOf(lesson) + 1}
          </div>
          <h1 className="text-[1.8rem] font-semibold leading-tight tracking-tight">{lesson.title}</h1>
          <p className="mt-2 text-mute">{lesson.summary}</p>
          <p className="mt-2 text-xs text-mute">Kilde i kursmateriellet: {lesson.sources}</p>
        </header>
        <Suspense fallback={<p className="text-sm text-mute">Laster leksjon …</p>}>
          <Comp />
        </Suspense>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {prev ? (
            <Link to={`/leksjon/${prev.id}`} className="btn">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <button className={done[lesson.id] ? 'btn' : 'btn-primary'} onClick={() => toggle(lesson.id)}>
            {done[lesson.id] ? '✓ Fullført (angre)' : 'Marker som fullført'}
          </button>
          {next ? (
            <Link to={`/leksjon/${next.id}`} className="btn">
              {next.title} →
            </Link>
          ) : (
            <Link to="/eksamen" className="btn">
              Til eksamensforberedelse →
            </Link>
          )}
        </div>
      </article>
      <aside className="no-print hidden lg:block">
        <div className="sticky top-16 space-y-5 text-sm">
          <div>
            <div className="label mb-1.5">I denne leksjonen</div>
            <ul className="space-y-1">
              {lesson.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                  }} className="text-mute hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label mb-1.5">Temaer</div>
            {lesson.topics.map((t) => (
              <Link key={t} to={`/oppgaver?tema=${t}`} className="block text-mute hover:text-ink">
                {TOPIC_LABEL[t]}
              </Link>
            ))}
          </div>
          <div className="text-xs text-mute">
            {related.filter((e) => exercises[e.id]?.solved).length}/{related.length} relaterte oppgaver løst.{' '}
            <Link to={`/oppgaver?tema=${lesson.topics[0]}`} className="text-accent hover:underline">
              Øv mer →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
