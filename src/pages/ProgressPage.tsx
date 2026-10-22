import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../store/progress';
import { useTopicStats } from '../store/analytics';
import { EXERCISES } from '../content/exercises';
import { LESSON_BY_ID } from '../content/course';
import { PageHeader, ProgressBar, Badge } from '../components/ui';

export default function ProgressPage() {
  const stats = useTopicStats();
  const state = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const sorted = [...stats].sort((a, b) => b.weakness - a.weakness);
  const recs = sorted.slice(0, 4).map((t) => {
    const next = EXERCISES.find((e) => e.topics.includes(t.id) && !state.exercises[e.id]?.solved);
    return { t, next };
  });
  const exportJson = () => {
    const data = JSON.stringify({ lessonsVisited: state.lessonsVisited, lessonsDone: state.lessonsDone, exercises: state.exercises, cards: state.cards, exams: state.exams }, null, 1);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ieda3010-fremgang-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div>
      <PageHeader kicker="Adaptiv læring" title="Fremgang og svake temaer">
        Nøyaktighet per tema beregnes fra siste forsøk på hver oppgave og fra eksamensdeler. Svakhetsscoren vekter lav nøyaktighet, lav dekning og lav selvrapportert sikkerhet.
      </PageHeader>
      <section className="mb-8">
        <h2 className="label mb-2">Anbefalt neste steg</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {recs.map(({ t, next }) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.label}</span>
                <Badge tone={t.accuracy === null ? 'mute' : t.accuracy > 0.75 ? 'good' : t.accuracy > 0.4 ? 'warn' : 'bad'}>
                  {t.accuracy === null ? 'ikke øvd' : `${Math.round(t.accuracy * 100)} %`}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <Link to={`/leksjon/${t.lesson}`} className="btn">
                  Les: {LESSON_BY_ID[t.lesson]?.title}
                </Link>
                {next && (
                  <Link to={`/oppgaver?tema=${t.id}&status=unsolved`} className="btn">
                    Øv ({t.total - t.solved} uløste)
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-8 overflow-x-auto">
        <h2 className="label mb-2">Alle temaer</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-mute">
              <th className="py-1 font-medium">Tema</th>
              <th className="py-1 font-medium">Oppgaver</th>
              <th className="py-1 font-medium">Nøyaktighet</th>
              <th className="py-1 font-medium">Eksamen</th>
              <th className="py-1 font-medium">Sikkerhet</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((t) => (
              <tr key={t.id} className="border-t border-line/60">
                <td className="py-1.5 pr-2">
                  <Link to={`/oppgaver?tema=${t.id}`} className="hover:underline">
                    {t.label}
                  </Link>
                </td>
                <td className="py-1.5 pr-2 tabular-nums text-mute">
                  {t.solved}/{t.total} løst ({t.attempted} prøvd)
                </td>
                <td className="w-40 py-1.5 pr-2">
                  {t.accuracy === null ? <span className="text-mute">–</span> : <ProgressBar value={t.accuracy} tone={t.accuracy > 0.75 ? 'good' : t.accuracy > 0.4 ? 'warn' : 'bad'} />}
                </td>
                <td className="py-1.5 pr-2 tabular-nums">{t.examScore === null ? '–' : `${Math.round(t.examScore * 100)} %`}</td>
                <td className="py-1.5 tabular-nums">{t.confidence === null ? '–' : ['', 'gjettet', 'usikker', 'sikker'][Math.round(t.confidence)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card p-4">
        <h2 className="mb-2 font-semibold">Data</h2>
        <p className="text-sm text-mute">All fremgang lagres lokalt i denne nettleseren (localStorage). Eksporter for å ta sikkerhetskopi eller flytte til en annen maskin.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn" onClick={exportJson}>
            Eksporter fremgang (JSON)
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importer …
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const ok = state.importState(await f.text());
              setMsg(ok ? 'Fremgang importert.' : 'Kunne ikke lese filen.');
            }}
          />
          <button className="btn text-bad" onClick={() => confirm('Slette all fremgang? Dette kan ikke angres.') && state.resetAll()}>
            Nullstill alt
          </button>
          {msg && <span className="text-sm text-mute">{msg}</span>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span>Eksamenstidspunkt:</span>
          <input
            type="datetime-local"
            className="input"
            value={toLocal(state.examDate)}
            onChange={(e) => e.target.value && state.setExamDate(new Date(e.target.value).toISOString())}
          />
          <span className="text-xs text-mute">(standard 4. november 2026 kl. 09:00 – endre hvis tidspunktet er et annet)</span>
        </div>
      </section>
    </div>
  );
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
