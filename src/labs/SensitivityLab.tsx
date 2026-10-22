import { useMemo, useState } from 'react';
import { analyze, Model2D, toLP } from '../math/lp2d';
import { solveLP } from '../math/simplex';
import { rhsRange, costRange, parametricRhs, rhsBreakpoints, withCost } from '../math/sensitivity';
import { LPPlot, autoView, conColor } from '../components/plot/LPPlot';
import { LineChart } from '../components/plot/LineChart';
import { NumberInput, Panel, Segmented, Slider, Badge, Tabs } from '../components/ui';
import { M } from '../components/Math';
import { getPreset } from '../content/presets';
import { fmtNum, texNum } from '../math/format';
import { conTex } from './LPLab';

const SENS_PRESETS = ['lego', 'wyndor', 'hw1-p4', 'mid-q1', 'min-p4'];

export function SensitivityLab({ presetId = 'lego', initialTab = 'rhs' }: { presetId?: string; initialTab?: 'rhs' | 'cost' }) {
  const [pid, setPid] = useState(presetId);
  const [tab, setTab] = useState<'rhs' | 'cost'>(initialTab);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select className="input" value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Velg modell">
          {SENS_PRESETS.map((id) => (
            <option key={id} value={id}>
              {getPreset(id).name}
            </option>
          ))}
        </select>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'rhs', label: 'Høyreside bᵢ · skyggepris' },
            { id: 'cost', label: 'Objektivkoeffisient cⱼ' },
          ]}
        />
      </div>
      {tab === 'rhs' ? <RhsLab key={pid} presetId={pid} /> : <CostLab key={pid} presetId={pid} />}
    </div>
  );
}

function RhsLab({ presetId }: { presetId: string }) {
  const preset = useMemo(() => getPreset(presetId), [presetId]);
  const base = preset.model;
  const names = (preset.axisNames ?? ['x_1', 'x_2']) as [string, string];
  const [i, setI] = useState(Math.min(1, base.constraints.length - 1));
  const b0 = base.constraints[i].b;
  const [t, setT] = useState(b0);
  const model: Model2D = useMemo(() => ({ ...base, constraints: base.constraints.map((c, k) => (k === i ? { ...c, b: t } : c)) }), [base, i, t]);
  const a = useMemo(() => analyze(model), [model]);
  const baseLP = useMemo(() => toLP(base), [base]);
  const baseRes = useMemo(() => solveLP(baseLP), [baseLP]);
  const baseRange = useMemo(() => rhsRange(baseLP, i, baseRes), [baseLP, i, baseRes]);
  const curRange = useMemo(() => (a.status === 'optimal' ? rhsRange(toLP(model), i) : null), [model, i, a.status]);
  const span = Math.max(Math.abs(b0) * 1.6, 10);
  let lo = Math.min(0, b0 - span);
  let hi = b0 + span;
  if (baseRange) {
    if (isFinite(baseRange.hi)) hi = Math.max(hi, baseRange.hi * 1.25 + 1);
    if (isFinite(baseRange.lo)) lo = Math.min(lo, baseRange.lo - 0.1 * span);
  }
  if (base.constraints[i].op !== '=' && b0 >= 0) lo = Math.max(lo, Math.min(0, b0 - span));
  const samples = useMemo(() => parametricRhs(baseLP, i, lo, hi, 301), [baseLP, i, lo, hi]);
  const bps = useMemo(() => rhsBreakpoints(baseLP, i, lo, hi), [baseLP, i, lo, hi]);
  const view = useMemo(() => autoView({ ...base, constraints: base.constraints.map((c, k) => (k === i ? { ...c, b: Math.max(b0, t) } : c)) }), [base, i, b0, t]);
  const trail = samples.filter((s) => s.x).map((s) => s.x!);
  const predicted = baseRange && baseRes.status === 'optimal' ? baseRes.z + baseRange.shadow * (t - b0) : null;
  const inRange = baseRange ? t >= baseRange.lo - 1e-9 && t <= baseRange.hi + 1e-9 : false;
  const opWord = base.constraints[i].op === '>=' ? 'krav' : 'ressurs';

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="card overflow-hidden">
          <LPPlot
            model={model}
            analysis={a}
            view={view}
            options={{ isoquant: true, gradient: true, vertexLabels: true, constraintLabels: true, binding: true, optimum: true, vertices: true, grid: true }}
            objLevel={a.zStar ?? null}
            ghostConstraints={t !== b0 ? [{ ...base.constraints[i], id: 'ghost' }] : []}
            axisNames={names}
            segments={trail.slice(1).map((p, k) => ({ a: [trail[k][0], trail[k][1]], b: [p[0], p[1]], color: 'rgb(var(--dual))', width: 2, dash: '2 3' }))}
          />
          <div className="border-t border-line px-3 py-2 text-xs text-mute">
            Grå stiplet linje: opprinnelig posisjon. Turkis stiplet sti: hvordan optimum <M>{'x^*(b_i)'}</M> beveger seg når <M>b_i</M> varierer.
          </div>
        </div>
        <Panel title={<span>Optimal verdi som funksjon av høyresiden</span>}>
          <LineChart
            series={[{ pts: samples.map((s) => ({ x: s.t, y: s.z })), color: 'rgb(var(--opt))', width: 2.5 }]}
            xLabel={`b${i + 1}`}
            yLabel="Z*"
            current={{ x: t, y: a.status === 'optimal' ? a.zStar! : null }}
            band={baseRange ? { from: baseRange.lo, to: baseRange.hi } : undefined}
            breakpoints={bps}
            onPick={(x) => setT(+x.toFixed(2))}
            dashedLine={
              baseRange && baseRes.status === 'optimal'
                ? { x0: lo, y0: baseRes.z + baseRange.shadow * (lo - b0), x1: hi, y1: baseRes.z + baseRange.shadow * (hi - b0), color: 'rgb(var(--dual))' }
                : undefined
            }
          />
          <p className="mt-1 text-xs text-mute">
            Turkis bånd: området der den opprinnelige skyggeprisen gjelder. Turkis stiplet linje: lineær prediksjon <M>{'Z^*_0 + y_i(b_i - b_i^0)'}</M>. Oransje stiplet: knekkpunkter (basis/bindende sett endres). Klikk eller dra i grafen for å velge <M>b_i</M>.
          </p>
        </Panel>
      </div>
      <div className="space-y-3">
        <Panel title="Velg restriksjon">
          <div className="space-y-1.5">
            {base.constraints.map((c, k) => (
              <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm ${k === i ? 'border-accent bg-accent/5' : 'border-line'}`}>
                <input
                  type="radio"
                  name="rhs"
                  checked={k === i}
                  onChange={() => {
                    setI(k);
                    setT(c.b);
                  }}
                />
                <span className="font-semibold" style={{ color: conColor(k) }}>
                  ({k + 1})
                </span>
                <M>{conTex(c, names)}</M>
                {c.label && <span className="text-xs text-mute">{c.label}</span>}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <M>{`b_{${i + 1}} =`}</M>
            <NumberInput value={t} onChange={setT} step={1} />
            <Slider value={t} min={lo} max={hi} step={(hi - lo) / 600} onChange={(v) => setT(+v.toFixed(2))} label="høyreside" />
            <button className="btn-ghost" onClick={() => setT(b0)}>
              Nullstill
            </button>
          </div>
        </Panel>
        <Panel title="Skyggepris (shadow price)">
          {baseRange ? (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-sunk px-3 py-2">
                  <div className="label">Skyggepris i opprinnelig modell</div>
                  <div className="text-lg text-dual">
                    <M>{`y_{${i + 1}}^* = ${texNum(baseRange.shadow)}`}</M>
                  </div>
                </div>
                <div className="rounded-md bg-sunk px-3 py-2">
                  <div className="label">Gyldig for</div>
                  <M>{`${texNum(baseRange.lo)} \\le b_{${i + 1}} \\le ${texNum(baseRange.hi)}`}</M>
                </div>
              </div>
              <p className="text-mute">
                Én ekstra enhet av {opWord}en endrer optimal verdi med <strong className="text-dual">{fmtNum(baseRange.shadow)}</strong>, så lenge <M>{`b_{${i + 1}}`}</M> holder seg i intervallet (sensitivitetsområdet). Der forblir de samme restriksjonene bindende.
              </p>
              <div className="rounded-md border border-line p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Prediksjon: <M>{`${texNum(baseRes.z)} + ${texNum(baseRange.shadow)}\\cdot(${texNum(+t.toFixed(4))} - ${texNum(b0)}) = ${texNum(+(predicted ?? 0).toFixed(4))}`}</M>
                  </span>
                  <span>
                    Faktisk: <M>{a.status === 'optimal' ? `Z^* = ${texNum(a.zStar!)}` : a.status === 'infeasible' ? '\\text{ikke tillatt}' : '\\text{ubegrenset}'}</M>
                  </span>
                </div>
                <div className="mt-1">
                  {inRange ? (
                    <Badge tone="good">Innenfor området – skyggeprisen gir eksakt svar</Badge>
                  ) : (
                    <Badge tone="warn">Utenfor området – skyggeprisen gjelder ikke lenger for hele endringen</Badge>
                  )}
                </div>
              </div>
              {curRange && Math.abs(curRange.shadow - baseRange.shadow) > 1e-9 && (
                <p className="text-sm">
                  Ved nåværende <M>{`b_{${i + 1}} = ${texNum(+t.toFixed(3))}`}</M> er skyggeprisen <strong className="text-dual">{fmtNum(curRange.shadow)}</strong>, gyldig på{' '}
                  <M>{`[${texNum(curRange.lo)}, ${texNum(curRange.hi)}]`}</M>.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-mute">Den opprinnelige modellen har ikke et endelig optimum.</p>
          )}
        </Panel>
        <Panel title="Nåværende optimum">
          {a.status === 'optimal' ? (
            <div className="text-sm">
              <M>{`(${names[0]}^*, ${names[1]}^*) = (${texNum(a.xStar![0])}, ${texNum(a.xStar![1])}),\\quad Z^* = ${texNum(a.zStar!)}`}</M>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-mute">
                    <th className="font-medium">#</th>
                    <th className="font-medium">Slakk</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">Skyggepris</th>
                  </tr>
                </thead>
                <tbody>
                  {model.constraints.map((c, k) => (
                    <tr key={c.id} className="border-t border-line/60">
                      <td className="py-1 font-semibold" style={{ color: conColor(k) }}>
                        ({k + 1})
                      </td>
                      <td className="py-1 font-mono text-[13px]">{fmtNum(a.slack[c.id])}</td>
                      <td className="py-1">{a.binding.includes(c.id) ? <Badge tone="opt">bindende</Badge> : <Badge>ikke-bindende</Badge>}</td>
                      <td className="py-1 font-mono text-[13px] text-dual">{fmtNum(a.duals[c.id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {a.degenerateVertices.some((v) => v.p[0] === a.xStar![0] && v.p[1] === a.xStar![1]) && (
                <p className="mt-2 text-xs text-warn">Du står i et knekkpunkt (degenerert hjørne): skyggeprisen til venstre og høyre er forskjellig.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-bad">{a.status === 'infeasible' ? 'Ingen tillatt løsning for denne høyresiden.' : 'Problemet er ubegrenset.'}</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function CostLab({ presetId }: { presetId: string }) {
  const preset = useMemo(() => getPreset(presetId), [presetId]);
  const base = preset.model;
  const names = (preset.axisNames ?? ['x_1', 'x_2']) as [string, string];
  const [j, setJ] = useState<0 | 1>(0);
  const c0 = j === 0 ? base.c1 : base.c2;
  const [t, setT] = useState(c0);
  const model: Model2D = useMemo(() => (j === 0 ? { ...base, c1: t } : { ...base, c2: t }), [base, j, t]);
  const a = useMemo(() => analyze(model), [model]);
  const baseLP = useMemo(() => toLP(base), [base]);
  const range = useMemo(() => costRange(baseLP, j), [baseLP, j]);
  const curRange = useMemo(() => (a.status === 'optimal' && a.classification === 'unique' ? costRange(toLP(model), j) : null), [model, j, a]);
  const span = Math.max(Math.abs(c0) * 2, 10);
  const lo = Math.min(c0 - span, range && isFinite(range.lo) ? range.lo - span * 0.2 : Infinity);
  const hi = Math.max(c0 + span, range && isFinite(range.hi) ? range.hi + span * 0.2 : -Infinity);
  const samples = useMemo(() => {
    const out: { x: number; y: number | null }[] = [];
    for (let k = 0; k <= 240; k++) {
      const x = lo + ((hi - lo) * k) / 240;
      const r = solveLP(withCost(baseLP, j, x));
      out.push({ x, y: r.status === 'optimal' ? r.z : null });
    }
    return out;
  }, [baseLP, j, lo, hi]);
  const view = useMemo(() => autoView(base), [base]);
  const other = j === 0 ? base.c2 : base.c1;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="card overflow-hidden">
          <LPPlot model={model} analysis={a} view={view} objLevel={a.zStar ?? null} options={{ isoquant: true, gradient: true, vertices: true, vertexLabels: true, optimum: true, binding: true, grid: true, constraintLabels: true }} axisNames={names} />
        </div>
        <Panel title="Optimal verdi som funksjon av objektivkoeffisienten">
          <LineChart
            series={[{ pts: samples, color: 'rgb(var(--opt))', width: 2.5 }]}
            xLabel={`c${j + 1}`}
            yLabel="Z*"
            current={{ x: t, y: a.status === 'optimal' ? a.zStar! : null }}
            band={range ? { from: range.lo, to: range.hi } : undefined}
            onPick={(x) => setT(+x.toFixed(2))}
          />
          <p className="mt-1 text-xs text-mute">
            Innenfor båndet er den opprinnelige løsningen optimal, og <M>Z^*</M> er lineær i <M>c_j</M> med stigningstall <M>x_j^*</M>. I knekkpunktene er objektivlinjen parallell med en bindende restriksjon (flere optima).
          </p>
        </Panel>
      </div>
      <div className="space-y-3">
        <Panel title="Velg koeffisient">
          <Segmented
            value={String(j) as '0' | '1'}
            onChange={(v) => {
              const jj = (+v as 0 | 1);
              setJ(jj);
              setT(jj === 0 ? base.c1 : base.c2);
            }}
            options={[
              { value: '0', label: <M>c_1</M> },
              { value: '1', label: <M>c_2</M> },
            ]}
          />
          <div className="mt-3 flex items-center gap-2">
            <M>{`c_{${j + 1}} =`}</M>
            <NumberInput value={t} onChange={setT} step={1} />
            <Slider value={t} min={lo} max={hi} step={(hi - lo) / 600} onChange={(v) => setT(+v.toFixed(2))} label="koeffisient" />
            <button className="btn-ghost" onClick={() => setT(c0)}>
              Nullstill
            </button>
          </div>
          <div className="mt-2 text-sm">
            <M>{`\\${model.sense}\\; Z = ${j === 0 ? texNum(+t.toFixed(3)) : texNum(other)}${names[0]} + ${j === 1 ? texNum(+t.toFixed(3)) : texNum(other)}${names[1]}`}</M>
          </div>
        </Panel>
        <Panel title="Optimalitetsområde (range of optimality)">
          {range ? (
            <div className="space-y-2 text-sm">
              <div className="rounded-md bg-sunk px-3 py-2">
                Den opprinnelige løsningen <M>{`(${texNum(solveLP(baseLP).x[0])}, ${texNum(solveLP(baseLP).x[1])})`}</M> er optimal for{' '}
                <M>{`${texNum(range.lo)} \\le c_{${j + 1}} \\le ${texNum(range.hi)}`}</M>
              </div>
              <p className="text-mute">
                Grafisk: objektivlinjen roterer. Så lenge stigningstallet <M>{'-c_1/c_2'}</M> ligger mellom stigningstallene til de bindende restriksjonene, er hjørnet fortsatt best. I endepunktene er hele kanten optimal.
              </p>
              <div>
                Nå:{' '}
                {a.status === 'optimal' ? (
                  a.classification === 'multiple-edge' ? (
                    <Badge tone="accent">flere optima – hele kanten</Badge>
                  ) : (
                    <Badge tone={t >= range.lo && t <= range.hi ? 'good' : 'warn'}>
                      x* = ({fmtNum(a.xStar![0])}, {fmtNum(a.xStar![1])}), Z* = {fmtNum(a.zStar!)}
                    </Badge>
                  )
                ) : (
                  <Badge tone="warn">{a.status === 'unbounded' ? 'ubegrenset' : 'ikke tillatt'}</Badge>
                )}
              </div>
              {curRange && (Math.abs(curRange.lo - range.lo) > 1e-9 || Math.abs(curRange.hi - range.hi) > 1e-9) && (
                <p>
                  Nåværende løsning er optimal for <M>{`c_{${j + 1}} \\in [${texNum(curRange.lo)}, ${texNum(curRange.hi)}]`}</M>.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-mute">Ingen endelig optimal løsning i grunnmodellen.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
