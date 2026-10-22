import { useState } from 'react';
import { switchUser } from '../store/user';

const PEOPLE = ['Vegard', 'Henrick', 'Martin'];

export default function UserPicker() {
  const [martin, setMartin] = useState(false);

  if (martin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Din feite faen</h1>
        <button className="btn-ghost mt-10" onClick={() => setMartin(false)}>
          ← tilbake
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
      <div className="label mb-2">IEDA3010 · Prescriptive Analytics</div>
      <h1 className="text-3xl font-semibold tracking-tight">Hvem er pålogget?</h1>
      <div className="mt-8 grid w-full max-w-md gap-3">
        {PEOPLE.map((p) => (
          <button
            key={p}
            className="card flex items-center gap-4 px-5 py-4 text-left text-lg font-medium transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            onClick={() => (p === 'Martin' ? setMartin(true) : switchUser(p))}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">{p[0]}</span>
            {p}
          </button>
        ))}
      </div>
      <p className="mt-6 text-xs text-mute">Hver bruker har sin egen fremgang, lagret i denne nettleseren.</p>
    </div>
  );
}
