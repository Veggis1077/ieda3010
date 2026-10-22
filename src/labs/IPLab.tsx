import { useMemo, useState } from 'react';
import { analyze, feasible, Model2D, Pt, toLP, Constraint2D } from '../math/lp2d';
import { solveLP } from '../math/simplex';
import { LPPlot, autoView } from '../components/plot/LPPlot';
import { NumberInput, Panel, Segmented, Badge, Toggle } from '../components/ui';
import { M } from '../components/Math';
import { getPreset } from '../content/presets';
import { fmtNum, texNum } from '../math/format';
import { conTex } from './LPLab';

const IP_PRESETS = ['vincent', 'clay', 'rounding1', 'rounding2', 'lego', 'mid-q1'];

type Mode = 'lp' | 'mip1' | 'ip';

export function bestIntegerPoint(m: Model2D, mode: Mode): { p: Pt; z: number } | null | 'unbounded' {
  const lp = toLP(m);
  const bounds: number[] = [];
  for (const c of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const r = solveLP({ ...lp, sense: 'max', c });
    if (r.status === 'infeasible') return null;
    if (r.status === 'unbounded') return 'unbounded';
    bounds.push(r.z);
  }
  const [xmax, xminNeg, ymax, yminNeg] = bounds;
  const better = (a: number, b: number) => (m.sense === 'max' ? a > b + 1e-9 : a < b - 1e-9);
  let best: { p: Pt; z: number } | null = null;
  const cons = m.nonneg ? [...m.constraints] : m.constraints;
  for (let x = Math.ceil(-xminNeg - 1e-9); x <= Math.floor(xmax + 1e-9); x++) {
    if (mode === 'mip1') {
      const fixed: Constraint2D = { id: 'fix', a1: 1, a2: 0, op: '=', b: x };
      const r = solveLP(toLP({ ...m, constraints: [...m.constraints, fixed] }));
      if (r.status === 'optimal' && (!best || better(r.z, best.z))) best = { p: [r.x[0], r.x[1]], z: r.z };
      continue;
    }
    for (let y = Math.ceil(-yminNeg - 1e-9); y <= Math.floor(ymax + 1e-9); y++) {
      if (!feasible([...cons, ...(m.nonneg ? [{ id: 'a', a1: 1, a2: 0, op: '>=' as const, b: 0 }, { id: 'b', a1: 0, a2: 1, op: '>=' as const, b: 0 }] : [])], [x, y])) continue;
      const z = m.c1 * x + m.c2 * y;
      if (!best || better(z, best.z)) best = { p: [x, y], z };
    }
  }
  return best;
}

export function IPLab({ presetId = 'vincent' }: { presetId?: string }) {
  const [pid, setPid] = useState(presetId);
  const preset = useMemo(() => getPreset(pid), [pid]);
  const [model, setModel] = useState<Model2D>(preset.model);
  const [mode, setMode] = useState<Mode>('ip');
  const [showRounding, setShowRounding] = useState(true);
  const [reveal, setReveal] = useState(true);
  const [picked, setPicked] = useState<Pt | null>(null);
  const names = (preset.axisNames ?? ['x_1', 'x_2']) as [string, string];
  const choose = (id: string) => {
    setPid(id);
    const p = getPreset(id);
    setModel(p.model);
    setPicked(null);
  };
  const a = useMemo(() => analyze(model), [model]);
  const view = useMemo(() => autoView(model), [model]);
  const best = useMemo(() => (mode === 'lp' ? null : bestIntegerPoint(model, mode)), [model, mode]);
  const lpOpt = a.status === 'optimal' ? a.xStar! : null;
  const rounds: { p: Pt; ok: boolean; z: number }[] = useMemo(() => {
    if (!lpOpt) return [];
    const xs = [...new Set([Math.floor(lpOpt[0] + 1e-9), Math.ceil(lpOpt[0] - 1e-9)])];
    const ys = mode === 'mip1' ? [lpOpt[1]] : [...new Set([Math.floor(lpOpt[1] + 1e-9), Math.ceil(lpOpt[1] - 1e-9)])];
    const out: { p: Pt; ok: boolean; z: number }[] = [];
    for (const x of xs) for (const y of ys) out.push({ p: [x, y], ok: feasible(a.allCons, [x, y]), z: model.c1 * x + model.c2 * y });
    return out;
  }, [lpOpt, a.allCons, model, mode]);
  const intOpt = best && best !== 'unbounded' ? best : null;
  const gap = intOpt && a.zStar !== undefined ? a.zStar - intOpt.z : null;

  const mipSegments = useMemo(() => {
    if (mode !== 'mip1') return [];
    const segs: { a: Pt; b: Pt; color: string; width: number }[] = [];
    for (let x = Math.ceil(view.x0); x <= view.x1; x++) {
      const fixed: Constraint2D = { id: 'fix', a1: 1, a2: 0, op: '=', b: x };
      const lo = solveLP({ ...toLP({ ...model, constraints: [...model.constraints, fixed] }), sense: 'min', c: [0, 1] });
      const hi = solveLP({ ...toLP({ ...model, constraints: [...model.constraints, fixed] }), sense: 'max', c: [0, 1] });
      if (lo.status === 'optimal')
        segs.push({ a: [x, lo.x[1]], b: [x, hi.status === 'optimal' ? hi.x[1] : view.y1 * 2], color: 'rgb(var(--feas))', width: 3 });
    }
    return segs;
  }, [mode, model, view]);

  const points = [
    ...(showRounding ? rounds.map((r) => ({ p: r.p, color: r.ok ? 'rgb(var(--good))' : 'rgb(var(--bad))', r: 4.5, ring: true, title: `Avrundet (${fmtNum(r.p[0])}, ${fmtNum(r.p[1])}): ${r.ok ? `tillatt, Z = ${fmtNum(r.z)}` : 'ikke tillatt'}` })) : []),
    ...(reveal && intOpt ? [{ p: intOpt.p, color: 'rgb(var(--obj))', r: 7, label: 'IP*' }] : []),
    ...(picked ? [{ p: picked, color: 'rgb(var(--accent))', r: 5, ring: true, label: 'ditt valg' }] : []),
  ];

  const pickedInfo = picked
    ? { ok: feasible(a.allCons, picked) && (mode === 'lp' || (Number.isInteger(picked[0]) && (mode === 'mip1' || Number.isInteger(picked[1])))), z: model.c1 * picked[0] + model.c2 * picked[1] }
    : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="card overflow-hidden">
          <LPPlot
            model={model}
            analysis={a}
            view={view}
            axisNames={names}
            objLevel={reveal && intOpt ? intOpt.z : (a.zStar ?? null)}
            options={{ vertices: true, vertexLabels: true, optimum: true, isoquant: true, gradient: true, grid: true, intGrid: mode === 'ip', constraintLabels: true, binding: false }}
            points={points}
            segments={mipSegments}
            onPlotClick={(p) => setPicked([Math.round(p[0]), mode === 'mip1' ? +p[1].toFixed(2) : Math.round(p[1])])}
          />
          <div className="border-t border-line px-3 py-2 text-xs text-mute">
            Klikk i diagrammet for å velge et heltallspunkt og se om det er tillatt. Rødt hjørne = LP-optimum. Ringer = avrundinger av LP-optimum (grønn: tillatt, rød: ikke tillatt). Oransje IP* = heltallsoptimum. Isokvanten går gjennom {reveal && intOpt ? 'IP*' : 'LP-optimum'}.
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Panel title="Problem">
          <select className="input mb-2 w-full" value={pid} onChange={(e) => choose(e.target.value)} aria-label="Velg problem">
            {IP_PRESETS.map((id) => (
              <option key={id} value={id}>
                {getPreset(id).name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-serif italic">{model.sense} Z =</span>
            <NumberInput value={model.c1} onChange={(v) => setModel({ ...model, c1: v })} width="w-14" />
            <M>{names[0]}</M> +
            <NumberInput value={model.c2} onChange={(v) => setModel({ ...model, c2: v })} width="w-14" />
            <M>{names[1]}</M>
          </div>
          <div className="mt-2 space-y-1">
            {model.constraints.map((c, i) => (
              <div key={c.id} className="flex flex-wrap items-center gap-1 text-sm">
                <NumberInput value={c.a1} onChange={(v) => setModel({ ...model, constraints: model.constraints.map((k, l) => (l === i ? { ...k, a1: v } : k)) })} width="w-14" />
                <M>{names[0]}</M> +
                <NumberInput value={c.a2} onChange={(v) => setModel({ ...model, constraints: model.constraints.map((k, l) => (l === i ? { ...k, a2: v } : k)) })} width="w-14" />
                <M>{names[1]}</M> <M>{c.op === '<=' ? '\\le' : c.op === '>=' ? '\\ge' : '='}</M>
                <NumberInput value={c.b} onChange={(v) => setModel({ ...model, constraints: model.constraints.map((k, l) => (l === i ? { ...k, b: v } : k)) })} width="w-14" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Segmented
              size="xs"
              value={mode}
              onChange={(v) => {
                setMode(v);
                setPicked(null);
              }}
              options={[
                { value: 'lp', label: 'LP (kontinuerlig)' },
                { value: 'mip1', label: `MIP: kun ${names[0].replace('_', '')} heltall` },
                { value: 'ip', label: 'IP: begge heltall' },
              ]}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Toggle checked={showRounding} onChange={setShowRounding}>
              Vis avrundinger
            </Toggle>
            <Toggle checked={reveal} onChange={setReveal}>
              Vis heltallsoptimum
            </Toggle>
          </div>
        </Panel>
        <Panel title="Sammenligning">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-sunk px-3 py-2">
              <span>LP-relaksering</span>
              {a.status === 'optimal' ? (
                <M>{`(${texNum(a.xStar![0])}, ${texNum(a.xStar![1])}),\\ Z_{LP} = ${texNum(a.zStar!)}`}</M>
              ) : (
                <Badge tone="warn">{a.status === 'unbounded' ? 'ubegrenset' : 'ikke tillatt'}</Badge>
              )}
            </div>
            {mode !== 'lp' && (
              <div className="flex items-center justify-between rounded-md bg-sunk px-3 py-2">
                <span>{mode === 'ip' ? 'Heltallsoptimum' : 'MIP-optimum'}</span>
                {!reveal ? (
                  <span className="text-mute">skjult</span>
                ) : best === 'unbounded' ? (
                  <Badge tone="warn">område ubegrenset – kan ikke telles opp</Badge>
                ) : intOpt ? (
                  <M>{`(${texNum(intOpt.p[0])}, ${texNum(intOpt.p[1])}),\\ Z_{IP} = ${texNum(intOpt.z)}`}</M>
                ) : (
                  <Badge tone="bad">ingen heltallsløsning</Badge>
                )}
              </div>
            )}
            {reveal && gap !== null && mode !== 'lp' && (
              <div className="flex items-center justify-between rounded-md bg-sunk px-3 py-2">
                <span>Integralitetsgap (integrality gap)</span>
                <M>{`|Z_{LP} - Z_{IP}| = ${texNum(Math.abs(gap))}`}</M>
              </div>
            )}
            {showRounding && rounds.length > 0 && (
              <div>
                <div className="label mb-1">Avrunding av LP-løsningen</div>
                {rounds.map((r, k) => (
                  <div key={k} className="flex items-center justify-between border-t border-line/60 py-1">
                    <M>{`(${texNum(r.p[0])}, ${texNum(r.p[1])})`}</M>
                    {r.ok ? <Badge tone="good">tillatt, Z = {fmtNum(r.z)}</Badge> : <Badge tone="bad">ikke tillatt</Badge>}
                  </div>
                ))}
                {reveal && intOpt && rounds.every((r) => !r.ok || Math.abs(r.z - intOpt.z) > 1e-9) && (
                  <p className="mt-1 text-xs text-warn">Ingen avrunding gir heltallsoptimum her – derfor trenger vi branch-and-bound eller oppramsing.</p>
                )}
              </div>
            )}
            {pickedInfo && picked && (
              <div className="rounded-md border border-accent/40 px-3 py-2">
                Ditt punkt <M>{`(${texNum(picked[0])}, ${texNum(picked[1])})`}</M>: {pickedInfo.ok ? <Badge tone="good">tillatt, Z = {fmtNum(pickedInfo.z)}</Badge> : <Badge tone="bad">ikke tillatt</Badge>}
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-mute">
            {model.constraints.map((c) => (
              <div key={c.id}>
                <M>{conTex(c, names)}</M>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
