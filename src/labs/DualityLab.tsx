import { useMemo, useState } from 'react';
import { LP, LinCon, Op, solveLP, satisfies } from '../math/simplex';
import { buildDual } from '../math/dual';
import { analyze, Model2D } from '../math/lp2d';
import { LPPlot, autoView } from '../components/plot/LPPlot';
import { NumberInput, Panel, Segmented, Badge } from '../components/ui';
import { M, MB, Rich } from '../components/Math';
import { texNum, texLinear, opTex, fmtNum } from '../math/format';

interface DPreset {
  id: string;
  name: string;
  source: string;
  lp: LP;
  econ?: string;
  trial?: { x: number[]; y: number[] };
}

const DPRESETS: DPreset[] = [
  {
    id: 'wyndor',
    name: 'Wyndor Glass Co.',
    source: 'Forelesning LO3, s. 24–37',
    lp: { sense: 'max', c: [3, 5], cons: [{ a: [1, 0], op: '<=', b: 4 }, { a: [0, 2], op: '<=', b: 12 }, { a: [3, 2], op: '<=', b: 18 }] },
    econ: '$y_i$ = pris per time produksjonstid i anlegg $i$ som et annet selskap betaler. Dualrestriksjon $j$ sier: tiden ett parti av produkt $j$ bruker må være verdt minst profitten $c_j$ (ellers vil Wyndor heller produsere selv). Selskapet minimerer total kjøpesum $4y_1 + 12y_2 + 18y_3$.',
    trial: { x: [3, 3], y: [1, 1, 2] },
  },
  {
    id: 'lego',
    name: 'Lego-spillet',
    source: 'Forelesning LO1/LO3',
    lp: { sense: 'max', c: [40, 50], cons: [{ a: [1, 2], op: '<=', b: 10 }, { a: [4, 3], op: '<=', b: 30 }] },
    econ: '$y_1, y_2$ = verdien av én stor og én liten kloss. En stol (1 stor + 4 små) må være verdt minst 40, et bord (2 store + 3 små) minst 50.',
    trial: { x: [2, 2], y: [20, 10] },
  },
  {
    id: 'bank',
    name: 'Midtveis-øving Q2 (bank, 4 tjenester)',
    source: 'Midterm Exam Practice, Question 2',
    lp: {
      sense: 'max',
      c: [360, 180, 120, 40],
      cons: [
        { a: [60, 10, 20, 10], op: '<=', b: 1000 },
        { a: [30, 20, 20, 5], op: '<=', b: 800 },
      ],
    },
    econ: '$y_1$ = verdien av ett minutt fra skrankeansatt, $y_2$ = verdien av ett minutt skrivertid. Dualen har bare to variabler og kan derfor løses grafisk!',
    trial: { x: [5, 10, 5, 10], y: [5, 10] },
  },
  {
    id: 'hw4',
    name: 'HW1 Problem 4',
    source: 'IEDA3010 HW1, Problem 4',
    lp: { sense: 'max', c: [50, 40], cons: [{ a: [2, 1], op: '<=', b: 100 }, { a: [1, 2], op: '<=', b: 80 }] },
    econ: '$y_1$ = marginalverdi av én maskintime, $y_2$ = marginalverdi av én time etterbehandling.',
  },
  {
    id: 'p7',
    name: 'Ikke-tillatt primal (LO Practice 7)',
    source: 'LO Practice, Problem 7',
    lp: { sense: 'max', c: [1, 2], cons: [{ a: [-1, 1], op: '<=', b: -2 }, { a: [4, 1], op: '<=', b: 4 }] },
  },
  {
    id: 'minp4',
    name: 'Minimering med ≥ (LO Practice 4)',
    source: 'LO Practice, Problem 4 – generelle fortegnsregler (supplerende)',
    lp: { sense: 'min', c: [40, 50], cons: [{ a: [2, 3], op: '>=', b: 30 }, { a: [1, 1], op: '>=', b: 12 }, { a: [2, 1], op: '>=', b: 20 }] },
  },
];

function lpTex(lp: LP, v: string, free?: boolean[], signs?: string[]) {
  const n = lp.c.length;
  const names = Array.from({ length: n }, (_, j) => `${v}_{${j + 1}}`);
  const rows = lp.cons
    .filter((c) => !(c.a.filter((x) => x !== 0).length === 1 && c.b === 0 && c.op === '<=' && signs))
    .map((c) => `& ${texLinear(c.a, names)} ${opTex(c.op)} ${texNum(c.b)}`);
  let signLine: string;
  if (signs) signLine = signs.map((s, i) => `${v}_{${i + 1}} ${s === '>=0' ? '\\ge 0' : s === '<=0' ? '\\le 0' : '\\text{ fri}'}`).join(',\\; ');
  else signLine = names.map((nm, j) => (free?.[j] ? `${nm}\\text{ fri}` : `${nm} \\ge 0`)).join(',\\; ');
  return `\\begin{aligned} \\${lp.sense} \\quad & ${lp.sense === 'max' ? 'Z' : 'W'} = ${texLinear(lp.c, names)} \\\\ \\text{s.t.}\\quad ${rows.join(' \\\\ \\quad ')} \\\\ & ${signLine} \\end{aligned}`;
}

export function DualityLab({ presetId = 'wyndor' }: { presetId?: string }) {
  const [pid, setPid] = useState(presetId);
  const preset = DPRESETS.find((p) => p.id === pid)!;
  const [lp, setLp] = useState<LP>(structuredClone(preset.lp));
  const [trialX, setTrialX] = useState<number[]>(preset.trial?.x ?? preset.lp.c.map(() => 0));
  const [trialY, setTrialY] = useState<number[]>(preset.trial?.y ?? preset.lp.cons.map(() => 0));
  const pick = (id: string) => {
    const p = DPRESETS.find((q) => q.id === id)!;
    setPid(id);
    setLp(structuredClone(p.lp));
    setTrialX(p.trial?.x ?? p.lp.c.map(() => 0));
    setTrialY(p.trial?.y ?? p.lp.cons.map(() => 0));
  };
  const n = lp.c.length;
  const m = lp.cons.length;
  const dual = useMemo(() => buildDual(lp), [lp]);
  const pr = useMemo(() => solveLP(lp), [lp]);
  const dr = useMemo(() => solveLP(dual.lp), [dual]);
  const standard = lp.sense === 'max' && lp.cons.every((c) => c.op === '<=');

  const setA = (i: number, j: number, v: number) => setLp((p) => ({ ...p, cons: p.cons.map((c, k) => (k === i ? { ...c, a: c.a.map((x, l) => (l === j ? v : x)) } : c)) }));
  const setB = (i: number, v: number) => setLp((p) => ({ ...p, cons: p.cons.map((c, k) => (k === i ? { ...c, b: v } : c)) }));
  const setOp = (i: number, op: Op) => setLp((p) => ({ ...p, cons: p.cons.map((c, k) => (k === i ? { ...c, op } : c)) }));
  const setC = (j: number, v: number) => setLp((p) => ({ ...p, c: p.c.map((x, l) => (l === j ? v : x)) }));
  const addVar = () => {
    if (n >= 5) return;
    setLp((p) => ({ ...p, c: [...p.c, 1], cons: p.cons.map((c) => ({ ...c, a: [...c.a, 1] })) }));
    setTrialX((x) => [...x, 0]);
  };
  const addCon = () => {
    if (m >= 5) return;
    setLp((p) => ({ ...p, cons: [...p.cons, { a: p.c.map(() => 1), op: p.sense === 'max' ? '<=' : '>=', b: 10 }] }));
    setTrialY((y) => [...y, 0]);
  };
  const delVar = (j: number) => {
    if (n <= 1) return;
    setLp((p) => ({ ...p, c: p.c.filter((_, l) => l !== j), cons: p.cons.map((c) => ({ ...c, a: c.a.filter((_, l) => l !== j) })) }));
    setTrialX((x) => x.filter((_, l) => l !== j));
  };
  const delCon = (i: number) => {
    if (m <= 1) return;
    setLp((p) => ({ ...p, cons: p.cons.filter((_, k) => k !== i) }));
    setTrialY((y) => y.filter((_, k) => k !== i));
  };

  // duality theorem cell
  const cell = `${pr.status}/${dr.status}`;

  // weak duality playground
  const xFeas = lp.cons.every((c) => satisfies(c, trialX)) && trialX.every((v) => v >= -1e-9);
  const yFeas = dual.lp.cons.every((c) => satisfies(c, trialY)) && trialY.every((v, i) => (dual.varSigns[i] === '>=0' ? v >= -1e-9 : true));
  const Ztrial = lp.c.reduce((s, c, j) => s + c * (trialX[j] ?? 0), 0);
  const Wtrial = lp.cons.reduce((s, c, i) => s + c.b * (trialY[i] ?? 0), 0);

  // graphical views
  const primal2D: Model2D | null =
    n === 2 ? { sense: lp.sense, c1: lp.c[0], c2: lp.c[1], nonneg: true, constraints: lp.cons.map((c, i) => ({ id: `p${i}`, a1: c.a[0], a2: c.a[1], op: c.op, b: c.b })) } : null;
  const dual2D: Model2D | null =
    m === 2 && dual.varSigns.every((s) => s === '>=0')
      ? { sense: dual.lp.sense, c1: dual.lp.c[0], c2: dual.lp.c[1], nonneg: true, constraints: dual.lp.cons.map((c, j) => ({ id: `d${j}`, a1: c.a[0], a2: c.a[1], op: c.op, b: c.b })) }
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select className="input" value={pid} onChange={(e) => pick(e.target.value)} aria-label="Velg eksempel">
          {DPRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-mute">Kilde: {preset.source}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title={<span>Primal (P)</span>}
          actions={
            <>
              <button className="btn-ghost" onClick={addVar} disabled={n >= 5}>
                + variabel
              </button>
              <button className="btn-ghost" onClick={addCon} disabled={m >= 5}>
                + restriksjon
              </button>
            </>
          }
        >
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm">
            <Segmented
              size="xs"
              value={lp.sense}
              onChange={(s) => setLp({ ...lp, sense: s })}
              options={[
                { value: 'max', label: 'max' },
                { value: 'min', label: 'min' },
              ]}
            />
            {lp.c.map((c, j) => (
              <span key={j} className="inline-flex items-center gap-0.5">
                {j > 0 && <span className="mx-0.5">+</span>}
                <NumberInput value={c} onChange={(v) => setC(j, v)} width="w-14" />
                <M>{`x_{${j + 1}}`}</M>
                <button className="ml-0.5 text-xs text-mute hover:text-bad" onClick={() => delVar(j)} aria-label={`fjern x${j + 1}`} title="Fjern variabel">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {lp.cons.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1 text-sm">
                <span className="w-6 text-xs font-semibold text-dual">y{i + 1}</span>
                {c.a.map((a, j) => (
                  <span key={j} className="inline-flex items-center gap-0.5">
                    {j > 0 && <span className="mx-0.5">+</span>}
                    <NumberInput value={a} onChange={(v) => setA(i, j, v)} width="w-12" />
                    <M>{`x_{${j + 1}}`}</M>
                  </span>
                ))}
                <select className="input px-1 py-0.5" value={c.op} onChange={(e) => setOp(i, e.target.value as Op)} aria-label="relasjon">
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                  <option value="=">=</option>
                </select>
                <NumberInput value={c.b} onChange={(v) => setB(i, v)} width="w-16" />
                <button className="text-xs text-mute hover:text-bad" onClick={() => delCon(i)} aria-label={`fjern restriksjon ${i + 1}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-sunk px-2">
            <MB>{lpTex(lp, 'x')}</MB>
          </div>
        </Panel>
        <Panel title={<span>Dual (D)</span>}>
          <div className="rounded-md bg-sunk px-2">
            <MB>{lpTex(dual.lp, 'y', undefined, dual.varSigns)}</MB>
          </div>
          <ul className="mt-2 space-y-0.5 text-xs text-mute">
            {dual.signReason.map((r, i) => (
              <li key={'s' + i}>{r}</li>
            ))}
            {dual.consReason.map((r, i) => (
              <li key={'c' + i}>{r}</li>
            ))}
          </ul>
          {!standard && (
            <p className="mt-2 text-xs text-warn">
              Forelesningen behandler standardformen (max, ≤, x ≥ 0). Fortegnsreglene for andre former er supplerende pensum (Hillier & Lieberman, tabell 6.14).
            </p>
          )}
          <p className="mt-2 text-xs text-mute">
            Samme parametere, nye plasser: <M>c</M> blir høyreside, <M>b</M> blir objektivkoeffisienter, og koeffisientmatrisen transponeres (rad <M>i</M> i primal ↔ kolonne <M>i</M> i dual).
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Løsninger og sterk dualitet">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-sunk px-3 py-2">
              <div className="label">Primal</div>
              {pr.status === 'optimal' ? (
                <>
                  <M>{`x^* = (${pr.x.map(texNum).join(', ')})`}</M>
                  <br />
                  <M>{`Z^* = ${texNum(pr.z)}`}</M>
                </>
              ) : (
                <Badge tone="warn">{pr.status === 'infeasible' ? 'ikke tillatt' : 'ubegrenset'}</Badge>
              )}
            </div>
            <div className="rounded-md bg-sunk px-3 py-2">
              <div className="label">Dual</div>
              {dr.status === 'optimal' ? (
                <>
                  <M>{`y^* = (${dr.x.map(texNum).join(', ')})`}</M>
                  <br />
                  <M>{`W^* = ${texNum(dr.z)}`}</M>
                </>
              ) : (
                <Badge tone="warn">{dr.status === 'infeasible' ? 'ikke tillatt' : 'ubegrenset'}</Badge>
              )}
            </div>
          </div>
          {pr.status === 'optimal' && dr.status === 'optimal' && (
            <p className="mt-2 text-sm">
              <Badge tone="good">Sterk dualitet</Badge> <M>{`Z^* = ${texNum(pr.z)} = W^*`}</M>. Dualløsningen er skyggeprisene: <M>{`y_i^*`}</M> = endring i <M>Z^*</M> per ekstra enhet av <M>b_i</M>.
            </p>
          )}
          <div className="mt-3">
            <div className="label mb-1">Dualitetsteoremet – mulige kombinasjoner</div>
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left font-medium text-mute">Dual \ Primal</th>
                  <th className="p-1 font-medium">optimum</th>
                  <th className="p-1 font-medium">ubegrenset</th>
                  <th className="p-1 font-medium">ikke tillatt</th>
                </tr>
              </thead>
              <tbody>
                {(['optimal', 'unbounded', 'infeasible'] as const).map((d) => (
                  <tr key={d} className="border-t border-line/60">
                    <td className="p-1 text-left font-medium">{d === 'optimal' ? 'optimum' : d === 'unbounded' ? 'ubegrenset' : 'ikke tillatt'}</td>
                    {(['optimal', 'unbounded', 'infeasible'] as const).map((p) => {
                      const possible = (p === 'optimal' && d === 'optimal') || (p === 'unbounded' && d === 'infeasible') || (p === 'infeasible' && d !== 'optimal');
                      const here = cell === `${p}/${d}`;
                      return (
                        <td key={p} className={`p-1 ${here ? 'rounded bg-accent/15 font-semibold text-accent' : possible ? '' : 'text-mute/50'}`}>
                          {possible ? '✓' : '—'}
                          {here && ' ◀'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Komplementær slakkhet (complementary slackness)">
          {pr.status === 'optimal' && dr.status === 'optimal' ? (
            <CSPanel lp={lp} x={pr.x} y={dr.x} dualCons={dual.lp.cons.slice(0, n)} />
          ) : (
            <p className="text-sm text-mute">Krever at begge problemene har optimale løsninger.</p>
          )}
        </Panel>
      </div>

      <Panel title="Svak dualitet – prøv selv">
        <p className="mb-2 text-sm text-mute">
          Velg en hvilken som helst tillatt primalløsning <M>x</M> og tillatt dualløsning <M>y</M>. Svak dualitet sier at <M>{lp.sense === 'max' ? '\\sum_j c_j x_j \\le \\sum_i b_i y_i' : '\\sum_j c_j x_j \\ge \\sum_i b_i y_i'}</M> – en dual løsning gir en grense for primalverdien.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <M>x =</M> (
            {trialX.map((v, j) => (
              <NumberInput key={j} value={v} onChange={(nv) => setTrialX((x) => x.map((q, l) => (l === j ? nv : q)))} width="w-14" />
            ))}
            ) {xFeas ? <Badge tone="good">tillatt</Badge> : <Badge tone="bad">ikke tillatt</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <M>y =</M> (
            {trialY.map((v, i) => (
              <NumberInput key={i} value={v} onChange={(nv) => setTrialY((y) => y.map((q, l) => (l === i ? nv : q)))} width="w-14" />
            ))}
            ) {yFeas ? <Badge tone="good">tillatt</Badge> : <Badge tone="bad">ikke tillatt</Badge>}
          </div>
        </div>
        <div className="mt-2 text-sm">
          <M>{`Z(x) = ${texNum(+Ztrial.toFixed(4))},\\quad W(y) = ${texNum(+Wtrial.toFixed(4))}`}</M>
          {xFeas && yFeas && (
            <span className="ml-2">
              {lp.sense === 'max' ? (Ztrial <= Wtrial + 1e-9 ? <Badge tone="good">Z ≤ W ✓ (gap {fmtNum(Wtrial - Ztrial)})</Badge> : <Badge tone="bad">brudd?!</Badge>) : Ztrial >= Wtrial - 1e-9 ? <Badge tone="good">Z ≥ W ✓ (gap {fmtNum(Ztrial - Wtrial)})</Badge> : <Badge tone="bad">brudd?!</Badge>}
              {Math.abs(Ztrial - Wtrial) < 1e-7 && <Badge tone="accent">gap = 0 ⇒ begge er optimale</Badge>}
            </span>
          )}
        </div>
      </Panel>

      {preset.econ && (
        <Panel title="Økonomisk tolkning">
          <Rich text={preset.econ} className="text-[0.98rem]" />
        </Panel>
      )}

      {(primal2D || dual2D) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {primal2D && <MiniGraph title="Primal grafisk" model={primal2D} names={['x_1', 'x_2']} />}
          {dual2D && <MiniGraph title="Dual grafisk (to dualvariabler)" model={dual2D} names={['y_1', 'y_2']} />}
        </div>
      )}
    </div>
  );
}

function MiniGraph({ title, model, names }: { title: string; model: Model2D; names: [string, string] }) {
  const a = useMemo(() => analyze(model), [model]);
  const view = useMemo(() => {
    const v = autoView(model, a.vertices.map((q) => q.p));
    return v;
  }, [model, a]);
  return (
    <Panel title={title}>
      <LPPlot model={model} analysis={a} view={view} objLevel={a.zStar ?? null} axisNames={names} options={{ vertices: true, vertexLabels: true, optimum: true, isoquant: true, gradient: true, grid: true, constraintLabels: true, binding: true }} />
      <div className="mt-1 text-sm">
        {a.status === 'optimal' ? (
          <M>{`(${names[0]}^*, ${names[1]}^*) = (${texNum(a.xStar![0])}, ${texNum(a.xStar![1])}),\\ \\text{verdi } ${texNum(a.zStar!)}`}</M>
        ) : (
          <Badge tone="warn">{a.status === 'infeasible' ? 'ikke tillatt' : 'ubegrenset'}</Badge>
        )}
      </div>
    </Panel>
  );
}

function CSPanel({ lp, x, y, dualCons }: { lp: LP; x: number[]; y: number[]; dualCons: LinCon[] }) {
  const rows = lp.cons.map((c, i) => {
    const lhs = c.a.reduce((s, a, j) => s + a * x[j], 0);
    const slack = c.b - lhs;
    return { i, slack, y: y[i], prod: slack * y[i] };
  });
  const cols = dualCons.map((c, j) => {
    const lhs = c.a.reduce((s, a, i) => s + a * y[i], 0);
    const sur = lp.c[j] - lhs;
    return { j, sur, x: x[j], prod: sur * x[j] };
  });
  // derivation like slide 37
  const eqs: string[] = [];
  cols.forEach(({ j, x: xj }) => {
    if (Math.abs(xj) > 1e-9) eqs.push(`x_{${j + 1}}^* = ${texNum(xj)} > 0 \\Rightarrow ${texLinear(dualCons[j].a, y.map((_, i) => `y_{${i + 1}}`))} = ${texNum(lp.c[j])}`);
  });
  rows.forEach(({ i, slack }) => {
    if (Math.abs(slack) > 1e-9) eqs.push(`\\text{restriksjon } ${i + 1} \\text{ ikke bindende (slakk } ${texNum(slack)}) \\Rightarrow y_{${i + 1}}^* = 0`);
  });
  return (
    <div className="text-sm">
      <MB>{`\\Big(b_i - \\sum_j a_{ij}x_j\\Big)\\, y_i = 0 \\;\\; \\forall i, \\qquad \\Big(c_j - \\sum_i a_{ij}y_i\\Big)\\, x_j = 0 \\;\\; \\forall j`}</MB>
      <div className="grid gap-2 sm:grid-cols-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-mute">
              <th className="text-left font-medium">i</th>
              <th className="font-medium">slakk</th>
              <th className="font-medium">yᵢ*</th>
              <th className="font-medium">produkt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.i} className="border-t border-line/60 text-center font-mono">
                <td className="text-left">{r.i + 1}</td>
                <td>{fmtNum(r.slack)}</td>
                <td className="text-dual">{fmtNum(r.y)}</td>
                <td className={Math.abs(r.prod) < 1e-7 ? 'text-good' : 'text-bad'}>{fmtNum(r.prod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-mute">
              <th className="text-left font-medium">j</th>
              <th className="font-medium">overskudd</th>
              <th className="font-medium">xⱼ*</th>
              <th className="font-medium">produkt</th>
            </tr>
          </thead>
          <tbody>
            {cols.map((r) => (
              <tr key={r.j} className="border-t border-line/60 text-center font-mono">
                <td className="text-left">{r.j + 1}</td>
                <td>{fmtNum(r.sur)}</td>
                <td>{fmtNum(r.x)}</td>
                <td className={Math.abs(r.prod) < 1e-7 ? 'text-good' : 'text-bad'}>{fmtNum(r.prod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-mute">
        Antall CS-ligninger = m + n = {lp.cons.length} + {lp.c.length} = {lp.cons.length + lp.c.length}. Alle produktene er 0 ⇒ x* og y* er optimale.
      </p>
      {eqs.length > 0 && (
        <div className="mt-2 rounded-md bg-sunk px-2 py-1">
          <div className="label mt-1">Finn y* fra x* (som på forelesningen)</div>
          {eqs.map((e, k) => (
            <MB key={k}>{e}</MB>
          ))}
          <MB>{`\\Rightarrow y^* = (${y.map(texNum).join(', ')})`}</MB>
        </div>
      )}
    </div>
  );
}
