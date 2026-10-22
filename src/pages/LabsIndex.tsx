import { Link } from 'react-router-dom';
import { LABS, CHAPTERS } from '../content/course';
import { PageHeader } from '../components/ui';

export default function LabsIndex() {
  return (
    <div>
      <PageHeader title="Laboratorier">Interaktive matematiske simulatorer for alle kapitlene.</PageHeader>
      {CHAPTERS.map((ch) => (
        <section key={ch.id} className="mb-6">
          <h2 className="label mb-2">{ch.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {LABS.filter((l) => l.chapter === ch.id).map((l) => (
              <Link key={l.id} to={`/lab/${l.id}`} className="card block p-4 hover:border-obj/60">
                <div className="font-semibold">{l.title}</div>
                <p className="text-sm text-mute">{l.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
