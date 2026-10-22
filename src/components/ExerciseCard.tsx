import { useMemo, useState } from 'react';
import { Exercise, KIND_LABEL } from '../content/types';
import { Rich, M } from './Math';
import { Badge } from './ui';
import { useProgress } from '../store/progress';
import { parseNumber, parseRelation, parseExpr, relationsEquivalent, polysEquivalent, checkFormulation, FormulationFeedback, ParseError } from '../math/linparse';
import { analyze, feasible, Pt } from '../math/lp2d';
import { LPPlot, autoView } from './plot/LPPlot';
import { fmtNum } from '../math/format';
import { TOPIC_LABEL } from '../content/topics';

type Fb = { score: number; items: { ok: boolean; msg: string }[]; formulation?: FormulationFeedback } | null;

export function sourceBadge(src: Exercise['source']) {
  if (src.kind === 'official') return <Badge tone="obj">Offisiell oppgave{src.ref ? ` · ${src.ref}` : ''}</Badge>;
  if (src.kind === 'official-adapted') return <Badge tone="warn">Tilpasset fra kursmateriell{src.ref ? ` · ${src.ref}` : ''}</Badge>;
  return <Badge tone="mute">Ny oppgave (generert){src.ref ? ` · ${src.ref}` : ''}</Badge>;
}

export function ExerciseCard({ ex, compact = false, onDone }: { ex: Exercise; compact?: boolean; onDone?: (score: number) => void }) {
  const rec = useProgress((s) => s.exercises[ex.id]);
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const markHint = useProgress((s) => s.useHint);
  const reveal = useProgress((s) => s.reveal);
  const setConfidence = useProgress((s) => s.setConfidence);
  const [hints, setHints] = useState(0);
  const [showSol, setShowSol] = useState(false);
  const [fb, setFb] = useState<Fb>(null);
  const [ans, setAns] = useState<Record<string, unknown>>({});
  const [confirmReveal, setConfirmReveal] = useState(false);
  const attempts = rec?.attempts.length ?? 0;
  const lastScore = rec ? rec.attempts[rec.attempts.length - 1]?.score : undefined;

  const set = (k: string, v: unknown) => setAns((a) => ({ ...a, [k]: v }));

  const submit = () => {
    const r = grade(ex, ans);
    setFb(r);
    recordAttempt(ex.id, r.score);
    onDone?.(r.score);
  };

  return (
    <article className="card fade-in" id={ex.id}>
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <h3 className="mr-auto text-[0.98rem] font-semibold">{ex.title}</h3>
        <span className="chip">{KIND_LABEL[ex.kind]}</span>
        <span className="chip" title="Vanskelighetsgrad">
          {'●'.repeat(ex.difficulty)}
          {'○'.repeat(3 - ex.difficulty)}
        </span>
        {rec?.solved ? <Badge tone="good">løst</Badge> : attempts > 0 ? <Badge tone="warn">{Math.round((lastScore ?? 0) * 100)} %</Badge> : null}
      </header>
      <div className="px-4 py-3">
        {!compact && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {sourceBadge(ex.source)}
            {ex.topics.map((t) => (
              <span key={t} className="chip normal-case">
                {TOPIC_LABEL[t] ?? t}
              </span>
            ))}
          </div>
        )}
        <Rich text={ex.prompt} />
        <div className="mt-3">
          <Inputs ex={ex} ans={ans} set={set} fb={fb} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={submit}>
            Sjekk svar
          </button>
          {hints < 3 && (
            <button
              className="btn"
              onClick={() => {
                setHints((h) => h + 1);
                markHint(ex.id);
              }}
            >
              {['Hint 1: idé', 'Hint 2: metode', 'Hint 3: første steg'][hints]}
            </button>
          )}
          {!showSol &&
            (attempts > 0 || confirmReveal ? (
              <button
                className="btn"
                onClick={() => {
                  setShowSol(true);
                  reveal(ex.id);
                }}
              >
                Vis full løsning
              </button>
            ) : (
              <button className="btn-ghost" onClick={() => setConfirmReveal(true)} title="Prøv selv først!">
                Gi opp?
              </button>
            ))}
          {fb && (
            <button
              className="btn-ghost"
              onClick={() => {
                setFb(null);
                setAns({});
              }}
            >
              Prøv igjen
            </button>
          )}
        </div>
        {confirmReveal && !showSol && attempts === 0 && <p className="mt-1 text-xs text-mute">Du har ikke prøvd ennå. Klikk «Vis full løsning» hvis du virkelig vil se den.</p>}
        {hints > 0 && (
          <div className="mt-3 space-y-2">
            {ex.hints.slice(0, hints).map((h, k) => (
              <div key={k} className="rounded-md border-l-4 border-accent/50 bg-accent/5 px-3 py-1.5">
                <div className="label">Hint {k + 1}</div>
                <Rich text={h} className="text-[0.97rem]" />
              </div>
            ))}
          </div>
        )}
        {fb && <FeedbackView fb={fb} />}
        {fb && (
          <div className="mt-3 flex items-center gap-2 text-xs text-mute">
            Hvor sikker var du?
            {(['Gjettet', 'Usikker', 'Sikker'] as const).map((l, k) => (
              <button key={l} className={`rounded border px-2 py-0.5 ${rec?.confidence === k + 1 ? 'border-accent bg-accent/10 text-ink' : 'border-line'}`} onClick={() => setConfidence(ex.id, (k + 1) as 1 | 2 | 3)}>
                {l}
              </button>
            ))}
          </div>
        )}
        {showSol && (
          <div className="mt-4 rounded-md border border-good/40 bg-good/5 px-4 py-2">
            <div className="label mb-1">Fullstendig løsning</div>
            <Rich text={ex.solution} />
            {ex.rubric && (
              <div className="mt-2">
                <div className="label">Vurderingskriterier</div>
                <ul className="ml-5 list-disc text-sm">
                  {ex.rubric.map((r, k) => (
                    <li key={k}>
                      <Rich text={r} className="text-sm" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function FeedbackView({ fb }: { fb: NonNullable<Fb> }) {
  const tone = fb.score >= 0.999 ? 'good' : fb.score > 0 ? 'warn' : 'bad';
  return (
    <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${tone === 'good' ? 'border-good/40 bg-good/5' : tone === 'warn' ? 'border-warn/40 bg-warn/5' : 'border-bad/40 bg-bad/5'}`} role="status">
      <div className="font-semibold">{tone === 'good' ? 'Riktig!' : tone === 'warn' ? `Delvis riktig (${Math.round(fb.score * 100)} %)` : 'Ikke riktig ennå'}</div>
      {fb.items.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {fb.items.map((it, k) => (
            <li key={k} className={it.ok ? 'text-good' : 'text-bad'}>
              {it.ok ? '✓' : '✗'} <span className="text-ink">{renderInlineTex(it.msg)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function renderInlineTex(s: string) {
  const parts = s.split(/(\$[^$]+\$)/g);
  return parts.map((p, k) => (p.startsWith('$') ? <M key={k}>{p.slice(1, -1)}</M> : <span key={k}>{p}</span>));
}

function Inputs({ ex, ans, set, fb }: { ex: Exercise; ans: Record<string, unknown>; set: (k: string, v: unknown) => void; fb: Fb }) {
  switch (ex.kind) {
    case 'mc':
      return (
        <div className="space-y-1.5" role="radiogroup">
          {ex.options.map((o, k) => {
            const chosen = ans.choice === k;
            const show = fb !== null;
            return (
              <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 ${chosen ? 'border-accent bg-accent/5' : 'border-line'} ${show && k === ex.answer ? 'border-good' : ''}`}>
                <input type="radio" className="mt-1.5" checked={chosen} onChange={() => set('choice', k)} />
                <div className="min-w-0 flex-1">
                  <Rich text={o} className="text-[0.98rem] [&_p]:my-0" />
                  {show && chosen && ex.explain?.[k] && <div className="mt-1 text-xs text-mute">{renderInlineTex(ex.explain[k])}</div>}
                </div>
              </label>
            );
          })}
        </div>
      );
    case 'multi': {
      const sel = (ans.sel as number[]) ?? [];
      return (
        <div className="space-y-1.5">
          {ex.options.map((o, k) => (
            <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 ${sel.includes(k) ? 'border-accent bg-accent/5' : 'border-line'}`}>
              <input type="checkbox" className="mt-1.5" checked={sel.includes(k)} onChange={(e) => set('sel', e.target.checked ? [...sel, k] : sel.filter((x) => x !== k))} />
              <div className="min-w-0 flex-1">
                <Rich text={o} className="text-[0.98rem] [&_p]:my-0" />
                {fb && ex.explain?.[k] && <div className="mt-1 text-xs text-mute">{renderInlineTex(ex.explain[k])}</div>}
              </div>
            </label>
          ))}
          <p className="text-xs text-mute">Velg alle som er riktige.</p>
        </div>
      );
    }
    case 'tf':
      return (
        <div className="space-y-2">
          {ex.statements.map((st, k) => {
            const v = (ans[`tf${k}`] as boolean | undefined) ?? null;
            return (
              <div key={k} className="rounded-md border border-line px-3 py-2">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs text-mute">({String.fromCharCode(97 + k)})</span>
                  <Rich text={st.text} className="min-w-0 flex-1 text-[0.98rem] [&_p]:my-0" />
                  <div className="flex gap-1">
                    {[true, false].map((b) => (
                      <button key={String(b)} className={`rounded border px-2.5 py-0.5 text-sm font-semibold ${v === b ? 'border-accent bg-accent/15 text-accent' : 'border-line text-mute'}`} onClick={() => set(`tf${k}`, b)} aria-pressed={v === b}>
                        {b ? 'T' : 'F'}
                      </button>
                    ))}
                  </div>
                </div>
                {fb && (
                  <div className={`mt-1 text-xs ${v === st.answer ? 'text-good' : 'text-bad'}`}>
                    {v === st.answer ? '✓' : '✗'} Riktig svar: {st.answer ? 'Sant' : 'Usant'}. <span className="text-mute">{renderInlineTex(st.why)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    case 'numeric':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {ex.fields.map((f, k) => (
            <label key={k} className="flex items-center gap-2">
              <span className="min-w-[4rem] text-right">
                <M>{f.label}</M>
              </span>
              <input className="input w-full font-mono" value={(ans[`n${k}`] as string) ?? ''} onChange={(e) => set(`n${k}`, e.target.value)} placeholder="f.eks. 16.5 eller 33/2" onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
            </label>
          ))}
        </div>
      );
    case 'expr':
      return (
        <div className="space-y-2">
          {ex.fields.map((f, k) => (
            <label key={k} className="block">
              <span className="text-sm">
                <M>{f.label}</M>
              </span>
              <input className="input mt-1 w-full font-mono" value={(ans[`e${k}`] as string) ?? ''} onChange={(e) => set(`e${k}`, e.target.value)} placeholder={f.mode === 'relation' ? 'f.eks. 3x1 + 2x2 <= 18 + M*y1' : 'f.eks. 3x1 + 5x2'} />
            </label>
          ))}
          <p className="text-xs text-mute">Skriv x1 eller x_1, ≤ som &lt;=. Ekvivalente omskrivinger (flytting av ledd, positiv skalering) godtas.</p>
        </div>
      );
    case 'formulation':
      return (
        <div>
          <textarea
            className="input min-h-[10rem] w-full font-mono text-[13px] leading-relaxed"
            value={(ans.text as string) ?? ''}
            onChange={(e) => set('text', e.target.value)}
            placeholder={ex.placeholder ?? 'max 3x1 + 5x2\ns.t. x1 <= 4\n2x2 <= 12\n3x1 + 2x2 <= 18\nx1, x2 >= 0'}
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-mute">
            Én restriksjon per linje. Variabler: {ex.expected.vars.join(', ')}. Bruk «max»/«min» for målfunksjonen, «x1, x2 &gt;= 0» for ikke-negativitet og «y1, y2 binary» / «x1 integer» for heltallskrav.
          </p>
          {fb?.formulation && <FormulationFb fb={fb.formulation} ex={ex} />}
        </div>
      );
    case 'graph-points':
    case 'graph-optimum':
    case 'graph-binding':
    case 'graph-objective':
      return <GraphInput ex={ex} ans={ans} set={set} submitted={!!fb} />;
  }
}

function FormulationFb({ fb, ex }: { fb: FormulationFeedback; ex: Extract<Exercise, { kind: 'formulation' }> }) {
  return (
    <div className="mt-2 space-y-1 rounded-md border border-line px-3 py-2 text-sm">
      <div className={fb.objectiveOk ? 'text-good' : 'text-bad'}>
        {fb.objectiveOk ? '✓' : '✗'} {fb.objectiveMsg}
      </div>
      {ex.expected.constraints.map((_, i) => (
        <div key={i} className={fb.matched.includes(i) ? 'text-good' : 'text-bad'}>
          {fb.matched.includes(i) ? '✓ Restriksjon funnet' : '✗ Mangler en restriksjon'} ({i + 1} av {ex.expected.constraints.length}){!fb.matched.includes(i) && hintFor(ex, i)}
        </div>
      ))}
      {fb.extra.map((e, k) => (
        <div key={k} className="text-warn">
          ⚠ Ukjent/feil restriksjon: <code className="font-mono">{e}</code>
        </div>
      ))}
      {fb.nonnegMissing.length > 0 && <div className="text-bad">✗ Mangler ikke-negativitet for {fb.nonnegMissing.join(', ')}</div>}
      {fb.binaryMissing.length > 0 && <div className="text-bad">✗ Mangler binærkrav for {fb.binaryMissing.join(', ')}</div>}
      {fb.integerMissing.length > 0 && <div className="text-bad">✗ Mangler heltallskrav for {fb.integerMissing.join(', ')}</div>}
      {fb.parseErrors.map((p, k) => (
        <div key={k} className="text-bad">
          Kunne ikke tolke «{p.line}»: {p.msg}
        </div>
      ))}
    </div>
  );
}

function hintFor(ex: Extract<Exercise, { kind: 'formulation' }>, i: number) {
  const s = ex.expected.constraints[i];
  // give the variables involved, not the constraint itself
  const vars = ex.expected.vars.filter((v) => new RegExp(`(^|[^A-Za-z0-9])${v}(?![0-9])`).test(s.replace(/_/g, '')));
  return vars.length ? ` – involverer ${vars.join(', ')}` : '';
}

function GraphInput({ ex, ans, set, submitted }: { ex: Extract<Exercise, { kind: 'graph-points' | 'graph-optimum' | 'graph-binding' | 'graph-objective' }>; ans: Record<string, unknown>; set: (k: string, v: unknown) => void; submitted: boolean }) {
  const a = useMemo(() => analyze(ex.model), [ex.model]);
  const view = useMemo(() => autoView(ex.model, a.vertices.map((v) => v.p)), [ex.model, a]);
  const sel = (ans.sel as number[]) ?? [];
  const names = ex.axisNames ?? ['x_1', 'x_2'];
  if (ex.kind === 'graph-points') {
    return (
      <div className="max-w-xl">
        <LPPlot
          model={ex.model}
          analysis={a}
          view={view}
          axisNames={names}
          options={{ vertices: false, optimum: false, isoquant: false, gradient: false, grid: true, constraintLabels: true, binding: false }}
          points={ex.points.map((p, k) => {
            const chosen = sel.includes(k);
            const truth = feasible(a.allCons, p);
            return {
              p,
              r: 6,
              ring: chosen,
              color: submitted ? (truth ? 'rgb(var(--good))' : 'rgb(var(--bad))') : chosen ? 'rgb(var(--accent))' : 'rgb(var(--mute))',
              label: String.fromCharCode(65 + k),
              onClick: () => set('sel', chosen ? sel.filter((x) => x !== k) : [...sel, k]),
              title: `(${fmtNum(p[0])}, ${fmtNum(p[1])})`,
            };
          })}
        />
        <p className="text-xs text-mute">Klikk på alle punktene som er tillatte (feasible). Valgte: {sel.map((k) => String.fromCharCode(65 + k)).sort().join(', ') || 'ingen'}</p>
      </div>
    );
  }
  if (ex.kind === 'graph-optimum') {
    const choice = ans.choice as number | string | undefined;
    return (
      <div className="max-w-xl">
        <LPPlot
          model={ex.model}
          analysis={a}
          view={view}
          axisNames={names}
          objLevel={null}
          hideOptimumUntil={!submitted}
          options={{ vertices: true, vertexLabels: true, optimum: submitted, isoquant: false, gradient: true, grid: true, constraintLabels: true, binding: false }}
          points={a.vertices.map((v, k) => ({ p: v.p, r: choice === k ? 7 : 5, ring: choice === k, color: choice === k ? 'rgb(var(--accent))' : 'transparent', onClick: () => set('choice', k), title: 'Velg dette hjørnet' }))}
        />
        <div className="mt-1 flex flex-wrap gap-2 text-sm">
          <span className="text-mute">Klikk på det optimale hjørnet, eller:</span>
          <button className={`btn ${choice === 'unbounded' ? 'border-accent' : ''}`} onClick={() => set('choice', 'unbounded')}>
            Ubegrenset
          </button>
          <button className={`btn ${choice === 'infeasible' ? 'border-accent' : ''}`} onClick={() => set('choice', 'infeasible')}>
            Ingen tillatt løsning
          </button>
        </div>
      </div>
    );
  }
  if (ex.kind === 'graph-binding') {
    return (
      <div className="max-w-xl">
        <LPPlot
          model={ex.model}
          analysis={a}
          view={view}
          axisNames={names}
          objLevel={a.zStar ?? null}
          options={{ vertices: true, vertexLabels: true, optimum: true, isoquant: true, gradient: true, grid: true, constraintLabels: true, binding: submitted }}
          highlightConstraints={ex.model.constraints.filter((_, k) => sel.includes(k)).map((c) => c.id)}
          onConstraintClick={(id) => {
            const k = ex.model.constraints.findIndex((c) => c.id === id);
            set('sel', sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k]);
          }}
        />
        <p className="text-xs text-mute">Klikk på restriksjonslinjene som er bindende i optimum. Valgte: {sel.map((k) => `(${k + 1})`).join(', ') || 'ingen'}</p>
      </div>
    );
  }
  // objective drag
  const L = (ans.level as number) ?? 0;
  return (
    <div className="max-w-xl">
      <LPPlot
        model={ex.model}
        analysis={a}
        view={view}
        axisNames={names}
        objLevel={L}
        onObjLevel={(v) => set('level', v)}
        hideOptimumUntil={!submitted}
        options={{ vertices: true, vertexLabels: false, optimum: submitted, isoquant: true, gradient: true, grid: true, constraintLabels: true, binding: false }}
      />
      <p className="text-xs text-mute">
        Dra den oransje stiplede isokvanten til den akkurat berører optimum (siste punkt i det tillatte området i forbedringsretningen). Nå: <M>{`Z = ${+L.toFixed(2)}`}</M>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function grade(ex: Exercise, ans: Record<string, unknown>): NonNullable<Fb> {
  switch (ex.kind) {
    case 'mc': {
      const ok = ans.choice === ex.answer;
      return { score: ok ? 1 : 0, items: ans.choice === undefined ? [{ ok: false, msg: 'Velg et alternativ.' }] : [] };
    }
    case 'multi': {
      const sel = new Set((ans.sel as number[]) ?? []);
      let right = 0;
      const items: { ok: boolean; msg: string }[] = [];
      ex.options.forEach((_, k) => {
        const should = ex.answers.includes(k);
        if (should === sel.has(k)) right++;
        else items.push({ ok: false, msg: `Alternativ ${k + 1} skulle ${should ? '' : 'ikke '}vært valgt.` });
      });
      return { score: right === ex.options.length ? 1 : Math.max(0, (right - (ex.options.length - right)) / ex.options.length), items };
    }
    case 'tf': {
      const n = ex.statements.length;
      const right = ex.statements.filter((s, k) => ans[`tf${k}`] === s.answer).length;
      return { score: right / n, items: [{ ok: right === n, msg: `${right} av ${n} riktige.` }] };
    }
    case 'numeric': {
      const items = ex.fields.map((f, k) => {
        const raw = String(ans[`n${k}`] ?? '').trim();
        if (f.allowInfinity && /^(inf|∞|unbounded|ubegrenset|uendelig)/i.test(raw)) {
          const ok = !isFinite(f.answer);
          return { ok, msg: ok ? `$${f.label}$ riktig.` : `$${f.label}$ er endelig.` };
        }
        const v = parseNumber(raw);
        if (v === null) return { ok: false, msg: `$${f.label}$: kunne ikke tolke «${raw}».` };
        const tol = f.tol ?? 1e-3 * (1 + Math.abs(f.answer));
        const ok = Math.abs(v - f.answer) <= tol;
        return { ok, msg: ok ? `$${f.label}$ = ${fmtNum(v)} er riktig.` : `$${f.label}$ = ${fmtNum(v)} er ikke riktig.` };
      });
      return { score: items.filter((i) => i.ok).length / items.length, items };
    }
    case 'expr': {
      const items = ex.fields.map((f, k) => {
        const raw = String(ans[`e${k}`] ?? '');
        try {
          if (f.mode === 'relation') {
            const ok = relationsEquivalent(parseRelation(raw, f.vars), parseRelation(f.answer, f.vars));
            return { ok, msg: ok ? 'Ekvivalent med forventet svar.' : 'Ikke ekvivalent med forventet relasjon (sjekk fortegn, retning på ulikheten og koeffisienter).' };
          }
          const ok = polysEquivalent(parseExpr(raw, f.vars), parseExpr(f.answer, f.vars), !!f.scale);
          return { ok, msg: ok ? 'Riktig uttrykk.' : 'Uttrykket stemmer ikke.' };
        } catch (e) {
          return { ok: false, msg: e instanceof ParseError ? `Tolkningsfeil: ${e.message}` : 'Kunne ikke tolke svaret.' };
        }
      });
      return { score: items.filter((i) => i.ok).length / items.length, items };
    }
    case 'formulation': {
      const f = checkFormulation(String(ans.text ?? ''), ex.expected);
      return { score: f.score, items: [], formulation: f };
    }
    case 'graph-points': {
      const a = analyze(ex.model);
      const sel = new Set((ans.sel as number[]) ?? []);
      const items = ex.points.map((p, k) => {
        const truth = feasible(a.allCons, p);
        const ok = truth === sel.has(k);
        return { ok, msg: `${String.fromCharCode(65 + k)} (${fmtNum(p[0])}, ${fmtNum(p[1])}) er ${truth ? 'tillatt' : 'ikke tillatt'}.` };
      });
      return { score: items.filter((i) => i.ok).length / items.length, items };
    }
    case 'graph-optimum': {
      const a = analyze(ex.model);
      const c = ans.choice;
      if (a.status !== 'optimal') {
        const ok = c === a.status;
        return { score: ok ? 1 : 0, items: [{ ok, msg: a.status === 'unbounded' ? 'Problemet er ubegrenset.' : 'Problemet har ingen tillatt løsning.' }] };
      }
      if (typeof c !== 'number') return { score: 0, items: [{ ok: false, msg: 'Problemet har en endelig optimal løsning.' }] };
      const v = a.vertices[c];
      const ok = Math.abs(v.z - a.zStar!) < 1e-7 * (1 + Math.abs(a.zStar!));
      return {
        score: ok ? 1 : 0,
        items: [
          {
            ok,
            msg: ok
              ? `(${fmtNum(v.p[0])}, ${fmtNum(v.p[1])}) er optimalt med Z = ${fmtNum(v.z)}${a.classification === 'multiple-edge' ? ' (flere optima finnes)' : ''}.`
              : `(${fmtNum(v.p[0])}, ${fmtNum(v.p[1])}) gir Z = ${fmtNum(v.z)}, men optimum er Z* = ${fmtNum(a.zStar!)}.`,
          },
        ],
      };
    }
    case 'graph-binding': {
      const a = analyze(ex.model);
      const sel = new Set((ans.sel as number[]) ?? []);
      const items = ex.model.constraints.map((c, k) => {
        const truth = a.binding.includes(c.id);
        return { ok: truth === sel.has(k), msg: `Restriksjon (${k + 1}) er ${truth ? 'bindende' : 'ikke bindende'} (slakk ${fmtNum(a.slack[c.id])}).` };
      });
      return { score: items.every((i) => i.ok) ? 1 : items.filter((i) => i.ok).length / items.length / 2, items };
    }
    case 'graph-objective': {
      const a = analyze(ex.model);
      const L = (ans.level as number) ?? NaN;
      if (a.status !== 'optimal') return { score: 0, items: [{ ok: false, msg: 'Problemet har ikke endelig optimum.' }] };
      const range = Math.max(1, ...a.vertices.map((v) => Math.abs(v.z)));
      const ok = Math.abs(L - a.zStar!) <= 0.025 * range;
      return { score: ok ? 1 : 0, items: [{ ok, msg: ok ? `Riktig: Z* = ${fmtNum(a.zStar!)} ved (${fmtNum(a.xStar![0])}, ${fmtNum(a.xStar![1])}).` : `Isokvanten står på Z = ${fmtNum(+L.toFixed(2))}. Den skal berøre det siste punktet i området.` }] };
    }
  }
}

export type { Pt };
