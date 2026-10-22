import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EXAMS, ExamPart, Exam } from '../content/exams';
import { useProgress, ExamSession as Session, ExamPartResult } from '../store/progress';
import { Rich, M } from '../components/Math';
import { Badge, ProgressBar } from '../components/ui';
import { checkFormulation } from '../math/linparse';
import { parseNumber } from '../math/linparse';
import { TOPIC_LABEL } from '../content/topics';

function autoFraction(part: ExamPart, answers: Record<string, unknown>): number | null {
  const a = part.auto;
  if (!a) return null;
  if (a.kind === 'formulation') return checkFormulation(String(answers[part.id] ?? ''), a.expected).score;
  if (a.kind === 'numeric') {
    let ok = 0;
    a.fields.forEach((f, k) => {
      const raw = String(answers[`${part.id}:n${k}`] ?? '');
      if (f.allowInfinity && /^(inf|∞|unbounded|ubegrenset)/i.test(raw.trim())) {
        if (!isFinite(f.answer)) ok++;
        return;
      }
      const v = parseNumber(raw);
      if (v !== null && Math.abs(v - f.answer) <= (f.tol ?? 1e-3 * (1 + Math.abs(f.answer)))) ok++;
    });
    return ok / a.fields.length;
  }
  let ok = 0;
  a.statements.forEach((s, k) => answers[`${part.id}:tf${k}`] === s.answer && ok++);
  return ok / a.statements.length;
}

export function scoreSession(exam: Exam, s: Session): ExamPartResult[] {
  return exam.questions.flatMap((q) =>
    q.parts.map((p) => {
      const f = autoFraction(p, s.answers);
      let score: number;
      if (f !== null) score = f * p.points;
      else {
        const checked = s.selfGrades[p.id] ?? [];
        score = Math.min(p.points, checked.reduce((a, i) => a + (p.rubric[i]?.pts ?? 0), 0));
      }
      return { partId: p.id, score: Math.round(score * 100) / 100, max: p.points, topics: p.topics };
    }),
  );
}

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export default function ExamSessionPage() {
  const { sessionId } = useParams();
  const session = useProgress((s) => s.exams.find((e) => e.id === sessionId));
  const save = useProgress((s) => s.saveExamAnswer);
  const finish = useProgress((s) => s.finishExam);
  const selfGrade = useProgress((s) => s.saveSelfGrade);
  const start = useProgress((s) => s.startExam);
  const nav = useNavigate();
  const exam = EXAMS.find((e) => e.id === session?.examId);
  const finished = !!session?.results;
  const now = useNow(!finished);
  const [qi, setQi] = useState(0);
  const deadline = session && session.durationMin ? session.startedAt + session.durationMin * 60000 : null;
  const remaining = deadline ? deadline - now : null;

  const submit = () => {
    if (!session || !exam) return;
    finish(session.id, scoreSession(exam, session));
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !finished) submit();
  }, [remaining, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => (session && exam && finished ? scoreSession(exam, session) : null), [session, exam, finished]);
  // keep stored results in sync with self-grading
  useEffect(() => {
    if (session && exam && finished && results) {
      const a = JSON.stringify(results);
      if (a !== JSON.stringify(session.results)) finish(session.id, results);
    }
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session || !exam) return <p>Fant ikke eksamensforsøket.</p>;
  const total = exam.questions.reduce((a, q) => a + q.parts.reduce((b, p) => b + p.points, 0), 0);
  const q = exam.questions[qi];
  const got = results?.reduce((a, r) => a + r.score, 0) ?? 0;
  const mmss = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="no-print sticky top-12 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <Link to="/eksamen" className="btn-ghost">
          ← Oversikt
        </Link>
        <span className="font-semibold">{exam.title}</span>
        {exam.kind === 'official' ? <Badge tone="obj">offisiell</Badge> : <Badge>generert</Badge>}
        <div className="ml-auto flex items-center gap-2">
          {!finished && remaining !== null && (
            <span className={`rounded-md px-2 py-1 font-mono text-sm tabular-nums ${remaining < 10 * 60000 ? 'bg-bad/10 text-bad' : 'bg-sunk'}`} role="timer" aria-live="off">
              ⏱ {mmss(remaining)}
            </span>
          )}
          {!finished && remaining === null && <span className="text-sm text-mute">Uten tidsbegrensning</span>}
          {!finished ? (
            <button className="btn-primary" onClick={() => confirm('Levere eksamen? Du kan ikke endre svarene etterpå.') && submit()}>
              Lever
            </button>
          ) : (
            <>
              <Badge tone="accent">
                {Math.round(got * 10) / 10} / {total} poeng
              </Badge>
              <button
                className="btn"
                onClick={() => {
                  const sid = start(exam.id, session.durationMin);
                  nav(`/eksamen/${sid}`);
                  setQi(0);
                }}
              >
                Ta på nytt
              </button>
            </>
          )}
        </div>
      </div>

      {finished && results && <ResultSummary exam={exam} results={results} total={total} />}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {exam.questions.map((qq, k) => (
          <button key={qq.id} className={`btn ${k === qi ? 'border-accent bg-accent/10' : ''}`} onClick={() => setQi(k)}>
            {qq.title.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <section className="card p-4 md:p-6">
        <h2 className="text-lg font-semibold">{q.title}</h2>
        <Rich text={q.intro} className="mt-2" />
        <div className="mt-6 space-y-8">
          {q.parts.map((p) => (
            <PartView
              key={p.id}
              part={p}
              session={session}
              finished={finished}
              onAnswer={(k, v) => save(session.id, k, v)}
              onSelfGrade={(idx) => selfGrade(session.id, p.id, idx)}
              result={results?.find((r) => r.partId === p.id)}
            />
          ))}
        </div>
      </section>
      <div className="mt-4 flex justify-between">
        <button className="btn" disabled={qi === 0} onClick={() => setQi(qi - 1)}>
          ← Forrige
        </button>
        <button className="btn" disabled={qi === exam.questions.length - 1} onClick={() => setQi(qi + 1)}>
          Neste →
        </button>
      </div>
    </div>
  );
}

function ResultSummary({ exam, results, total }: { exam: Exam; results: ExamPartResult[]; total: number }) {
  const got = results.reduce((a, r) => a + r.score, 0);
  const byTopic = new Map<string, { s: number; m: number }>();
  results.forEach((r) =>
    r.topics.forEach((t) => {
      const v = byTopic.get(t) ?? { s: 0, m: 0 };
      v.s += r.score / r.topics.length;
      v.m += r.max / r.topics.length;
      byTopic.set(t, v);
    }),
  );
  const weak = [...byTopic.entries()].map(([t, v]) => ({ t, frac: v.s / v.m })).sort((a, b) => a.frac - b.frac);
  return (
    <section className="card mb-6 p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-lg font-semibold">Resultat</h2>
        <span className="text-3xl font-semibold tabular-nums">{Math.round(got * 10) / 10}</span>
        <span className="text-mute">av {total} poeng ({Math.round((got / total) * 100)} %)</span>
      </div>
      <p className="mt-1 text-sm text-mute">
        Automatisk rettede deler er ferdig vurdert. For deler uten automatisk retting: kryss av i rettemalen under hver oppgave – poengsummen oppdateres. Løsningsforslagene er nå synlige{exam.kind === 'official' ? ' (laget av plattformen; ingen offisiell fasit finnes)' : ''}.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {weak.map((w) => (
          <div key={w.t} className="flex items-center gap-2 text-sm">
            <span className="w-48 truncate">{TOPIC_LABEL[w.t]}</span>
            <ProgressBar value={w.frac} tone={w.frac > 0.75 ? 'good' : w.frac > 0.4 ? 'warn' : 'bad'} />
            <Link to={`/oppgaver?tema=${w.t}`} className="whitespace-nowrap text-xs text-accent hover:underline">
              øv
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function PartView({
  part,
  session,
  finished,
  onAnswer,
  onSelfGrade,
  result,
}: {
  part: ExamPart;
  session: Session;
  finished: boolean;
  onAnswer: (k: string, v: unknown) => void;
  onSelfGrade: (idx: number[]) => void;
  result?: ExamPartResult;
}) {
  const a = session.answers;
  const auto = part.auto;
  const checked = session.selfGrades[part.id] ?? [];
  const [showSol, setShowSol] = useState(false);
  const fb = finished && auto?.kind === 'formulation' ? checkFormulation(String(a[part.id] ?? ''), auto.expected) : null;
  return (
    <div className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-semibold">{part.label}</span>
        <span className="text-sm text-mute">({part.points} poeng)</span>
        {result && (
          <Badge tone={result.score >= result.max - 1e-9 ? 'good' : result.score > 0 ? 'warn' : 'bad'}>
            {result.score} / {result.max}
          </Badge>
        )}
      </div>
      <Rich text={part.prompt} className="mt-1" />
      <div className="mt-3">
        {auto?.kind === 'formulation' && (
          <textarea
            className="input min-h-[9rem] w-full font-mono text-[13px]"
            value={String(a[part.id] ?? '')}
            onChange={(e) => onAnswer(part.id, e.target.value)}
            disabled={finished}
            placeholder={auto.placeholder ?? 'max ...\ns.t. ...\nx1, x2 >= 0'}
            spellCheck={false}
          />
        )}
        {auto?.kind === 'numeric' && (
          <div className="grid gap-2 sm:grid-cols-2">
            {auto.fields.map((f, k) => {
              const raw = String(a[`${part.id}:n${k}`] ?? '');
              const v = parseNumber(raw);
              const ok = v !== null && Math.abs(v - f.answer) <= (f.tol ?? 1e-3 * (1 + Math.abs(f.answer)));
              return (
                <label key={k} className="flex items-center gap-2">
                  <span className="min-w-[5rem] text-right">
                    <M>{f.label}</M>
                  </span>
                  <input className={`input w-full font-mono ${finished ? (ok ? 'border-good' : 'border-bad') : ''}`} value={raw} disabled={finished} onChange={(e) => onAnswer(`${part.id}:n${k}`, e.target.value)} />
                  {finished && !ok && <span className="whitespace-nowrap font-mono text-xs text-good">{+f.answer.toFixed(4)}</span>}
                </label>
              );
            })}
          </div>
        )}
        {auto?.kind === 'tf' && (
          <div className="space-y-2">
            {auto.statements.map((st, k) => {
              const v = a[`${part.id}:tf${k}`] as boolean | undefined;
              return (
                <div key={k} className="flex flex-wrap items-start gap-3 rounded-md border border-line px-3 py-2">
                  <span className="mt-0.5 font-mono text-xs text-mute">({String.fromCharCode(97 + k)})</span>
                  <Rich text={st.text} className="min-w-0 flex-1 text-[0.97rem] [&_p]:my-0" />
                  <div className="flex gap-1">
                    {[true, false].map((b) => (
                      <button key={String(b)} disabled={finished} className={`rounded border px-2.5 py-0.5 text-sm font-semibold ${v === b ? 'border-accent bg-accent/15 text-accent' : 'border-line text-mute'}`} onClick={() => onAnswer(`${part.id}:tf${k}`, b)}>
                        {b ? 'T' : 'F'}
                      </button>
                    ))}
                  </div>
                  {finished && (
                    <div className={`w-full text-xs ${v === st.answer ? 'text-good' : 'text-bad'}`}>
                      {v === st.answer ? '✓' : '✗'} {st.answer ? 'T' : 'F'} – {st.why}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <textarea
          className="input mt-2 min-h-[4rem] w-full text-sm"
          placeholder={auto ? 'Notater / mellomregninger (valgfritt)' : 'Skriv svaret ditt her (eller på papir). Vurderes med rettemalen etter innlevering.'}
          value={String(a[`${part.id}:notes`] ?? '')}
          onChange={(e) => onAnswer(`${part.id}:notes`, e.target.value)}
          disabled={finished}
        />
      </div>
      {fb && (
        <div className="mt-2 space-y-0.5 rounded-md border border-line px-3 py-2 text-sm">
          <div className={fb.objectiveOk ? 'text-good' : 'text-bad'}>{fb.objectiveMsg}</div>
          <div className={fb.missing.length ? 'text-bad' : 'text-good'}>
            {fb.matched.length} av {fb.matched.length + fb.missing.length} restriksjoner funnet{fb.extra.length ? `, ${fb.extra.length} ukjente/feil` : ''}.
          </div>
          {fb.nonnegMissing.length + fb.binaryMissing.length + fb.integerMissing.length > 0 && <div className="text-bad">Mangler domene-/fortegnskrav.</div>}
        </div>
      )}
      {finished && (
        <div className="mt-3 rounded-md border border-line bg-sunk/60 px-3 py-2">
          <div className="label mb-1">Rettemal {auto ? '(veiledende – delen er rettet automatisk)' : '(kryss av for det du fikk til)'}</div>
          <ul className="space-y-1 text-sm">
            {part.rubric.map((rb, i) => (
              <li key={i}>
                <label className="flex items-start gap-2">
                  {!auto && (
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked.includes(i)}
                      onChange={(e) => onSelfGrade(e.target.checked ? [...checked, i] : checked.filter((x) => x !== i))}
                    />
                  )}
                  <span className="flex-1">
                    <Rich text={rb.text} className="text-sm [&_p]:my-0" />
                  </span>
                  <span className="text-xs text-mute">{rb.pts} p</span>
                </label>
              </li>
            ))}
          </ul>
          <button className="btn mt-2" onClick={() => setShowSol((s) => !s)}>
            {showSol ? 'Skjul løsningsforslag' : 'Vis løsningsforslag'}
          </button>
          {showSol && (
            <div className="mt-2 rounded-md border border-good/40 bg-panel px-3 py-1">
              <Rich text={part.solution} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
