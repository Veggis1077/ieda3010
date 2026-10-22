import { useEffect, useMemo, useState } from 'react';
import { FLASHCARDS } from '../content/flashcards';
import { useProgress, BOX_DAYS } from '../store/progress';
import { Rich } from '../components/Math';
import { PageHeader, Segmented, Badge } from '../components/ui';
import { TOPIC_LABEL } from '../content/topics';

type Mode = 'due' | 'all';

export default function ReviewPage() {
  const cards = useProgress((s) => s.cards);
  const review = useProgress((s) => s.reviewCard);
  const [mode, setMode] = useState<Mode>('due');
  const [kind, setKind] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sessionDone, setSessionDone] = useState(0);
  // snapshot of the queue so grading doesn't reshuffle under the user
  const [queueKey, setQueueKey] = useState(0);
  const queue = useMemo(() => {
    const now = Date.now();
    return FLASHCARDS.filter((c) => (!kind || c.kind === kind) && (mode === 'all' || !cards[c.id] || cards[c.id].due <= now)).sort(
      (a, b) => (cards[a.id]?.box ?? -1) - (cards[b.id]?.box ?? -1),
    );
  }, [mode, kind, queueKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = queue[idx];
  const grade = (g: 'again' | 'hard' | 'good' | 'easy') => {
    if (!card) return;
    review(card.id, g);
    setFlipped(false);
    setSessionDone((n) => n + 1);
    setIdx((i) => i + 1);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade((['again', 'hard', 'good', 'easy'] as const)[+e.key - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const boxes = [0, 1, 2, 3, 4, 5].map((b) => FLASHCARDS.filter((c) => (cards[c.id]?.box ?? 0) === b && cards[c.id]).length);
  const neverSeen = FLASHCARDS.filter((c) => !cards[c.id]).length;
  return (
    <div>
      <PageHeader kicker="Spaced repetition" title="Repetisjon">
        Definisjoner, dualitetsrelasjoner, vanlige feil og teori. Leitner-system: riktige kort flyttes til en høyere boks og vises igjen etter {BOX_DAYS.slice(1).join(', ')} dager. «Igjen» sender kortet tilbake til boks 0.
      </PageHeader>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m);
            setIdx(0);
            setQueueKey((k) => k + 1);
          }}
          options={[
            { value: 'due', label: 'Forfalte kort' },
            { value: 'all', label: 'Alle kort' },
          ]}
        />
        <select
          className="input"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setIdx(0);
            setQueueKey((k) => k + 1);
          }}
          aria-label="Korttype"
        >
          <option value="">Alle typer</option>
          {['definisjon', 'dualitet', 'vanlig feil', 'teori', 'metode'].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <span className="text-sm text-mute">
          {Math.max(0, queue.length - idx)} igjen i økten · {sessionDone} repetert
        </span>
      </div>
      {card ? (
        <div className="mx-auto max-w-2xl">
          <button
            className="card block min-h-[16rem] w-full p-6 text-left transition-colors hover:border-accent/50"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Vis forside' : 'Vis svar'}
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Badge tone="accent">{card.kind}</Badge>
              <span className="chip normal-case">{TOPIC_LABEL[card.topic]}</span>
              {cards[card.id] && <span className="chip">boks {cards[card.id].box}</span>}
            </div>
            <Rich text={card.front} className="text-lg font-semibold" />
            {flipped ? (
              <div className="mt-4 border-t border-line pt-4 fade-in">
                <Rich text={card.back} />
              </div>
            ) : (
              <p className="mt-6 text-sm text-mute">Tenk gjennom svaret, og klikk (eller trykk mellomrom) for å snu kortet.</p>
            )}
          </button>
          {flipped && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(
                [
                  ['again', 'Igjen', 'border-bad/50 text-bad'],
                  ['hard', 'Vanskelig', 'border-warn/50 text-warn'],
                  ['good', 'Bra', 'border-good/50 text-good'],
                  ['easy', 'Lett', 'border-accent/50 text-accent'],
                ] as const
              ).map(([g, l, c], k) => (
                <button key={g} className={`btn justify-center ${c}`} onClick={() => grade(g)}>
                  {l} <span className="kbd">{k + 1}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card mx-auto max-w-2xl p-6 text-center">
          <p className="font-semibold">Ingen kort igjen i denne økten.</p>
          <p className="mt-1 text-sm text-mute">{mode === 'due' ? 'Alle forfalte kort er repetert. Kom tilbake senere, eller øv på alle kort.' : 'Du har gått gjennom alle kortene.'}</p>
          <button
            className="btn mt-3"
            onClick={() => {
              setIdx(0);
              setQueueKey((k) => k + 1);
            }}
          >
            Last inn på nytt
          </button>
        </div>
      )}
      <div className="mx-auto mt-8 max-w-2xl">
        <div className="label mb-2">Fordeling</div>
        <div className="flex items-end gap-2">
          <div className="flex-1 text-center">
            <div className="mx-auto w-8 rounded-t bg-line" style={{ height: 4 + neverSeen * 2 }} />
            <div className="mt-1 text-xs text-mute">nye ({neverSeen})</div>
          </div>
          {boxes.map((n, b) => (
            <div key={b} className="flex-1 text-center">
              <div className="mx-auto w-8 rounded-t bg-accent/70" style={{ height: 4 + n * 2 }} />
              <div className="mt-1 text-xs text-mute">
                boks {b} ({n})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
