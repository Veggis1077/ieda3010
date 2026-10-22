import { Link } from 'react-router-dom';
import { INVENTORY } from '../content/inventory';
import { LESSON_BY_ID, LABS } from '../content/course';
import { EXERCISE_BY_ID } from '../content/exercises';
import { PageHeader, Badge } from '../components/ui';

export default function Inventory() {
  return (
    <div>
      <PageHeader kicker="Pensumkart" title="Kildeoversikt">
        Hver kildefil i kursmappen, hvilke deler den inneholder og hvor de dekkes her. Kildefilene er autoriteten for pensum, notasjon og nivå. Innhold utenfor forelesningsnotatene er merket «supplerende» i leksjonene.
      </PageHeader>
      <div className="mb-6 rounded-md border-l-4 border-accent/60 bg-accent/5 px-4 py-3 text-sm">
        <strong>Midtveis-pensum:</strong> Introduction, Linear Optimization, Discrete Optimization. Python testes ikke. 2 timer, ett dobbeltsidig A4-ark og en vanlig (ikke-finansiell) kalkulator. Alle 11 PDF-er ble lest; ingen filer var uleselige. «Note»-PDF-ene har tomme felter som fylles ut i forelesningen – der innhold mangler, er det rekonstruert fra lysbildedata og læreboka og merket.
      </div>
      <div className="space-y-6">
        {INVENTORY.map((f) => (
          <section key={f.file} className="card overflow-hidden">
            <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
              <h2 className="mr-auto font-mono text-sm font-semibold">{f.file}</h2>
              <Badge>{f.pages} sider</Badge>
              <Badge tone={f.examinable === 'ja' ? 'good' : f.examinable === 'delvis' ? 'warn' : 'mute'}>eksamensrelevant: {f.examinable}</Badge>
            </header>
            <p className="px-4 pt-2 text-xs text-mute">{f.status}</p>
            <div className="overflow-x-auto px-4 pb-3">
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-mute">
                    <th className="py-1 pr-3 font-medium">Del</th>
                    <th className="py-1 pr-3 font-medium">Leksjon</th>
                    <th className="py-1 pr-3 font-medium">Lab</th>
                    <th className="py-1 font-medium">Oppgaver</th>
                  </tr>
                </thead>
                <tbody>
                  {f.rows.map((r, i) => (
                    <tr key={i} className="border-t border-line/60 align-top">
                      <td className="py-1.5 pr-3">
                        {r.part}
                        {r.note && <div className="text-xs text-mute">{r.note}</div>}
                      </td>
                      <td className="py-1.5 pr-3">
                        {r.lessons.map((l) => (
                          <Link key={l} to={`/leksjon/${l}`} className="block text-accent hover:underline">
                            {LESSON_BY_ID[l]?.title}
                          </Link>
                        ))}
                      </td>
                      <td className="py-1.5 pr-3">
                        {r.labs?.map((l) => (
                          <Link key={l} to={`/lab/${l}`} className="block text-obj hover:underline">
                            {LABS.find((x) => x.id === l)?.title}
                          </Link>
                        ))}
                      </td>
                      <td className="py-1.5">
                        {r.exercises?.map((e) => (
                          <span key={e} className="mr-1.5 inline-block text-xs text-mute" title={EXERCISE_BY_ID[e]?.title}>
                            {e}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
