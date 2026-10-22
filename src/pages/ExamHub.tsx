import { Link, useNavigate } from 'react-router-dom';
import { EXAMS } from '../content/exams';
import { useProgress } from '../store/progress';
import { PageHeader, Badge } from '../components/ui';
import { Rich } from '../components/Math';

export default function ExamHub() {
  const exams = useProgress((s) => s.exams);
  const start = useProgress((s) => s.startExam);
  const del = useProgress((s) => s.deleteExam);
  const nav = useNavigate();
  const begin = (id: string, minutes: number) => {
    const sid = start(id, minutes);
    nav(`/eksamen/${sid}`);
  };
  return (
    <div>
      <PageHeader kicker="Midtveiseksamen" title="Eksamenssimulator">
        Eksamen varer 2 timer. Tillatt: ett dobbeltsidig A4-ark og kalkulator. Svar lagres fortløpende i nettleseren. Delspørsmål rettes automatisk der det er mulig; resten vurderer du selv med rettemal etter innlevering.
      </PageHeader>
      <div className="space-y-4">
        {EXAMS.map((ex) => {
          const sessions = exams.filter((s) => s.examId === ex.id);
          const active = sessions.find((s) => !s.results);
          const total = ex.questions.reduce((a, q) => a + q.parts.reduce((b, p) => b + p.points, 0), 0);
          return (
            <section key={ex.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-auto text-lg font-semibold">{ex.title}</h2>
                {ex.kind === 'official' ? <Badge tone="obj">Offisiell øvingseksamen</Badge> : <Badge tone="mute">Generert av plattformen</Badge>}
                <Badge>{total} poeng</Badge>
              </div>
              <Rich text={ex.description} className="mt-1 text-[0.95rem] text-mute" />
              <div className="mt-2 text-sm text-mute">{ex.questions.map((q) => q.title).join(' · ')}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {active ? (
                  <Link to={`/eksamen/${active.id}`} className="btn-primary">
                    Fortsett pågående forsøk
                  </Link>
                ) : (
                  <button className="btn-primary" onClick={() => begin(ex.id, ex.durationMin)}>
                    Start med tid ({ex.durationMin} min)
                  </button>
                )}
                <button className="btn" onClick={() => begin(ex.id, 0)}>
                  Øv uten tidsbegrensning
                </button>
              </div>
              {sessions.length > 0 && (
                <div className="mt-3 border-t border-line pt-2">
                  <div className="label mb-1">Tidligere forsøk</div>
                  <ul className="space-y-1 text-sm">
                    {sessions
                      .slice()
                      .reverse()
                      .map((s) => {
                        const got = s.results?.reduce((a, p) => a + p.score, 0);
                        return (
                          <li key={s.id} className="flex flex-wrap items-center gap-2">
                            <Link to={`/eksamen/${s.id}`} className="hover:underline">
                              {new Date(s.startedAt).toLocaleString('nb-NO')}
                            </Link>
                            <span className="text-mute">{s.durationMin ? `${s.durationMin} min` : 'uten tid'}</span>
                            {s.results ? <Badge tone="accent">{Math.round(got! * 10) / 10} / {total}</Badge> : <Badge tone="warn">pågår</Badge>}
                            <button className="ml-auto text-xs text-mute hover:text-bad" onClick={() => confirm('Slette dette forsøket?') && del(s.id)}>
                              slett
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-mute">
        Flere offisielle øvingsoppgaver (LO Practice og DO Practice med offisielle løsninger) finnes i{' '}
        <Link to="/oppgaver?kilde=official" className="text-accent hover:underline">
          oppgavebanken
        </Link>
        .
      </p>
    </div>
  );
}
