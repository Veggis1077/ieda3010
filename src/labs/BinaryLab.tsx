import { useMemo, useState } from 'react';
import { Panel, Tabs, Badge, Slider, Toggle, Segmented } from '../components/ui';
import { M, MB } from '../components/Math';
import { analyze, clippedRegion, Model2D, Pt, toLP } from '../math/lp2d';
import { solveLP } from '../math/simplex';
import { LPPlot, View } from '../components/plot/LPPlot';
import { fmtNum, texNum } from '../math/format';

interface Relation {
  id: string;
  name: string;
  source: string;
  vars: string[];
  logic: (b: number[]) => boolean;
  logicText: string;
  forms: { tex: string; check: (b: number[]) => boolean; correct: boolean; why: string }[];
}

const s = (b: number[]) => b.reduce((a, v) => a + v, 0);

const RELATIONS: Relation[] = [
  {
    id: 'atmost',
    name: 'Høyst én av tre hendelser',
    source: 'DO1, s. 13 (At most one event among 3)',
    vars: ['x_1', 'x_2', 'x_3'],
    logic: (b) => s(b) <= 1,
    logicText: 'Høyst én av hendelsene kan inntreffe (det er lov at ingen inntreffer).',
    forms: [
      { tex: 'x_1 + x_2 + x_3 \\le 1', check: (b) => s(b) <= 1, correct: true, why: 'Summen teller antall valgte; ≤ 1 tillater 0 eller 1.' },
      { tex: 'x_1 + x_2 + x_3 = 1', check: (b) => s(b) === 1, correct: false, why: 'For streng: krever nøyaktig én, utelukker «ingen».' },
      { tex: 'x_1 + x_2 + x_3 \\ge 1', check: (b) => s(b) >= 1, correct: false, why: 'Dette er «minst én».' },
    ],
  },
  {
    id: 'eitheror',
    name: 'Enten–eller (ikke begge), to kandidater',
    source: 'DO1, s. 13 (either-or, not both)',
    vars: ['x_1', 'x_2'],
    logic: (b) => s(b) === 1,
    logicText: 'Nøyaktig én av de to må velges.',
    forms: [
      { tex: 'x_1 + x_2 = 1', check: (b) => s(b) === 1, correct: true, why: 'Nøyaktig én er valgt.' },
      { tex: 'x_1 + x_2 \\le 1', check: (b) => s(b) <= 1, correct: false, why: 'Tillater at ingen velges.' },
      { tex: 'x_1 = x_2', check: (b) => b[0] === b[1], correct: false, why: 'Dette er alt-eller-ingenting.' },
    ],
  },
  {
    id: 'allornothing',
    name: 'Alt eller ingenting (tre hendelser)',
    source: 'DO1, s. 14 (all or nothing)',
    vars: ['x_1', 'x_2', 'x_3'],
    logic: (b) => s(b) === 0 || s(b) === 3,
    logicText: 'Enten skjer alle tre, eller ingen.',
    forms: [
      { tex: 'x_1 = x_2,\\ x_2 = x_3', check: (b) => b[0] === b[1] && b[1] === b[2], correct: true, why: 'Alle er like: (0,0,0) eller (1,1,1).' },
      { tex: 'x_1 + x_2 + x_3 = 3', check: (b) => s(b) === 3, correct: false, why: 'Tvinger alle til 1 – «ingenting» blir umulig.' },
      { tex: 'x_1 = x_2', check: (b) => b[0] === b[1], correct: false, why: 'x₃ er ikke koblet til de andre.' },
    ],
  },
  {
    id: 'conditional',
    name: 'Betinget: hendelse 1 må skje hvis hendelse 2 skjer',
    source: 'DO1, s. 15 (conditional)',
    vars: ['x_1', 'x_2'],
    logic: (b) => !(b[1] === 1 && b[0] === 0),
    logicText: 'x₂ = 1 ⇒ x₁ = 1. Hendelse 1 kan skje uten hendelse 2.',
    forms: [
      { tex: 'x_2 \\le x_1', check: (b) => b[1] <= b[0], correct: true, why: 'Hvis x₂ = 1 må x₁ ≥ 1. Hvis x₂ = 0 er x₁ fri.' },
      { tex: 'x_1 \\le x_2', check: (b) => b[0] <= b[1], correct: false, why: 'Feil retning: dette sier x₁ = 1 ⇒ x₂ = 1.' },
      { tex: 'x_1 = x_2', check: (b) => b[0] === b[1], correct: false, why: 'For streng: forbyr at hendelse 1 skjer alene.' },
    ],
  },
  {
    id: 'onlyifeither',
    name: 'Produkt 4 kun hvis produkt 1 eller 2',
    source: 'Midterm Exam Practice Q3(b)-type',
    vars: ['y_1', 'y_2', 'y_4'],
    logic: (b) => !(b[2] === 1 && b[0] === 0 && b[1] === 0),
    logicText: 'y₄ = 1 krever at minst én av y₁, y₂ er 1.',
    forms: [
      { tex: 'y_4 \\le y_1 + y_2', check: (b) => b[2] <= b[0] + b[1], correct: true, why: 'Hvis y₄ = 1 må y₁ + y₂ ≥ 1.' },
      { tex: 'y_4 \\le y_1,\\ y_4 \\le y_2', check: (b) => b[2] <= b[0] && b[2] <= b[1], correct: false, why: 'Krever både 1 og 2 («og», ikke «eller»).' },
      { tex: 'y_1 + y_2 \\le y_4', check: (b) => b[0] + b[1] <= b[2], correct: false, why: 'Feil retning.' },
      { tex: '2y_4 \\le y_1 + y_2', check: (b) => 2 * b[2] <= b[0] + b[1], correct: false, why: 'Krever begge (2 ≤ y₁ + y₂).' },
    ],
  },
  {
    id: 'kofn',
    name: 'Minst to av tre hendelser',
    source: 'Generalisering (K av N)',
    vars: ['x_1', 'x_2', 'x_3'],
    logic: (b) => s(b) >= 2,
    logicText: 'Minst to av de tre må skje.',
    forms: [
      { tex: 'x_1 + x_2 + x_3 \\ge 2', check: (b) => s(b) >= 2, correct: true, why: 'Teller antall.' },
      { tex: 'x_1 + x_2 + x_3 = 2', check: (b) => s(b) === 2, correct: false, why: 'Forbyr at alle tre skjer.' },
    ],
  },
];

function LogicTab() {
  const [rid, setRid] = useState('conditional');
  const rel = RELATIONS.find((r) => r.id === rid)!;
  const [fi, setFi] = useState(0);
  const form = rel.forms[Math.min(fi, rel.forms.length - 1)];
  const combos = useMemo(() => {
    const n = rel.vars.length;
    return Array.from({ length: 1 << n }, (_, k) => Array.from({ length: n }, (_, j) => (k >> (n - 1 - j)) & 1));
  }, [rel]);
  const mismatches = combos.filter((b) => rel.logic(b) !== form.check(b)).length;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Velg logisk relasjon">
        <div className="space-y-1.5">
          {RELATIONS.map((r) => (
            <label key={r.id} className={`flex cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-sm ${rid === r.id ? 'border-accent bg-accent/5' : 'border-line'}`}>
              <input
                type="radio"
                name="rel"
                className="mt-1"
                checked={rid === r.id}
                onChange={() => {
                  setRid(r.id);
                  setFi(1);
                }}
              />
              <span>
                <span className="font-medium">{r.name}</span>
                <span className="block text-xs text-mute">{r.source}</span>
              </span>
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Test en formulering">
        <p className="text-sm">{rel.logicText}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rel.forms.map((f, k) => (
            <button key={k} className={`btn ${k === fi ? 'border-accent bg-accent/10' : ''}`} onClick={() => setFi(k)}>
              <M>{f.tex}</M>
            </button>
          ))}
        </div>
        <table className="mt-3 w-full text-center text-sm">
          <thead>
            <tr className="text-xs text-mute">
              {rel.vars.map((v) => (
                <th key={v} className="font-medium">
                  <M>{v}</M>
                </th>
              ))}
              <th className="font-medium">Logikken tillater</th>
              <th className="font-medium">Formuleringen tillater</th>
            </tr>
          </thead>
          <tbody>
            {combos.map((b, k) => {
              const want = rel.logic(b);
              const got = form.check(b);
              return (
                <tr key={k} className={`border-t border-line/60 font-mono ${want !== got ? 'bg-bad/10' : ''}`}>
                  {b.map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                  <td>{want ? '✓' : '✗'}</td>
                  <td className={want !== got ? 'font-bold text-bad' : ''}>{got ? '✓' : '✗'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-2 text-sm">
          {mismatches === 0 ? <Badge tone="good">Korrekt formulering</Badge> : <Badge tone="bad">{mismatches} kombinasjon(er) behandles feil</Badge>} <span className="text-mute">{form.why}</span>
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
const POLL = [
  { a1: 3, a2: 2, b: 18 },
  { a1: 1, a2: 4, b: 16 },
  { a1: 4, a2: 3, b: 24 },
];

function BigMTab() {
  const [mode, setMode] = useState<'either' | 'kofn'>('either');
  const [Mv, setMv] = useState(100);
  const [y, setY] = useState<number[]>([0, 1, 0]);
  const [showUnion, setShowUnion] = useState(true);
  const N = mode === 'either' ? 2 : 3;
  const need = mode === 'either' ? 1 : 2; // number of enforced constraints
  const cons = POLL.slice(0, N);
  const ys = y.slice(0, N);
  const relaxedCount = ys.reduce((a, v) => a + v, 0);
  const yValid = mode === 'either' ? true : relaxedCount <= N - need;
  const model: Model2D = {
    sense: 'max',
    c1: 1,
    c2: 1,
    nonneg: true,
    constraints: cons.map((c, i) => ({ id: `p${i}`, a1: c.a1, a2: c.a2, op: '<=' as const, b: c.b + Mv * ys[i] })),
  };
  const shown: Model2D = mode === 'either' ? { ...model, constraints: [{ ...model.constraints[0], b: cons[0].b + Mv * ys[0] }, { ...model.constraints[1], b: cons[1].b + Mv * (1 - ys[0]) }] } : model;
  const a = analyze(shown);
  const view: View = { x0: -0.6, x1: 19, y0: -0.6, y1: 13 };
  // union of disjunctive regions
  const combos: number[][] =
    mode === 'either'
      ? [[0], [1]]
      : [
          [0, 1],
          [0, 2],
          [1, 2],
        ];
  const unionPolys = combos.map((idx) =>
    clippedRegion(
      [...idx.map((i) => ({ id: `u${i}`, a1: cons[i].a1, a2: cons[i].a2, op: '<=' as const, b: cons[i].b })), { id: 'nx', a1: 1, a2: 0, op: '>=', b: 0 }, { id: 'ny', a1: 0, a2: 1, op: '>=', b: 0 }],
      { x0: -1, x1: 40, y0: -1, y1: 40 },
    ),
  );
  const tooSmall = cons.some((c) => {
    // is relaxed constraint still cutting the union? check max of a.x over union ≥ b + M
    let mx = 0;
    unionPolys.forEach((p) => p.forEach((q) => (mx = Math.max(mx, c.a1 * q[0] + c.a2 * q[1]))));
    return c.b + Mv < mx - 1e-9;
  });
  const opt = useMemo(() => {
    let best: { z: number; x: number[]; idx: number[] } | null = null;
    combos.forEach((idx) => {
      const r = solveLP(toLP({ sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: idx.map((i) => ({ id: `o${i}`, a1: cons[i].a1, a2: cons[i].a2, op: '<=' as const, b: cons[i].b })) }));
      if (r.status === 'optimal' && (!best || r.z > best.z)) best = { z: r.z, x: r.x, idx };
    });
    return best as { z: number; x: number[]; idx: number[] } | null;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="card overflow-hidden">
        <LPPlot model={shown} analysis={a} view={view} objLevel={null} options={{ vertices: false, optimum: false, isoquant: false, gradient: false, grid: true, constraintLabels: true, binding: false }}>
          {({ sx, sy }) =>
            showUnion ? (
              <g>
                {unionPolys.map((p, k) =>
                  p.length >= 3 ? (
                    <path key={k} d={'M' + p.map((q: Pt) => `${sx(q[0])},${sy(q[1])}`).join('L') + 'Z'} fill="rgb(var(--obj))" fillOpacity={0.1} stroke="rgb(var(--obj))" strokeDasharray="4 3" strokeWidth={1.4} />
                  ) : null,
                )}
                {opt && <circle cx={sx(opt.x[0])} cy={sy(opt.x[1])} r={6} fill="rgb(var(--opt))" />}
              </g>
            ) : null
          }
        </LPPlot>
        <p className="border-t border-line px-3 py-2 text-xs text-mute">
          Blått område: det tillatte området for de valgte verdiene av <M>y</M>. Oransje stiplet: den ønskede (ikke-konvekse!) unionen. Rød prikk: optimum for <M>{'\\max x_1 + x_2'}</M> over unionen.
        </p>
      </div>
      <div className="space-y-3">
        <Panel title="Oppsett (forurensningseksempelet, DO1)">
          <Segmented
            value={mode}
            onChange={(v) => {
              setMode(v);
              setY(v === 'either' ? [0, 1, 0] : [0, 0, 1]);
            }}
            options={[
              { value: 'either', label: 'Enten–eller (1 av 2)' },
              { value: 'kofn', label: 'K = 2 av N = 3' },
            ]}
          />
          {mode === 'either' ? (
            <MB>{`\\begin{aligned} 3x_1 + 2x_2 &\\le 18 + My \\\\ x_1 + 4x_2 &\\le 16 + M(1-y) \\\\ y &\\in\\{0,1\\}\\end{aligned}`}</MB>
          ) : (
            <MB>{`\\begin{aligned} 3x_1 + 2x_2 &\\le 18 + My_1 \\\\ x_1 + 4x_2 &\\le 16 + My_2 \\\\ 4x_1 + 3x_2 &\\le 24 + My_3 \\\\ y_1 + y_2 + y_3 &= N - K = 1\\end{aligned}`}</MB>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {(mode === 'either' ? [0] : [0, 1, 2]).map((i) => (
              <Segmented
                key={i}
                size="xs"
                value={String(y[i]) as '0' | '1'}
                onChange={(v) => setY((q) => q.map((x, k) => (k === i ? +v : x)))}
                options={[
                  { value: '0', label: <M>{mode === 'either' ? 'y=0' : `y_${i + 1}=0`}</M> },
                  { value: '1', label: <M>{mode === 'either' ? 'y=1' : `y_${i + 1}=1`}</M> },
                ]}
              />
            ))}
          </div>
          {mode === 'kofn' && !yValid && <p className="mt-1 text-xs text-bad">Brudd: summen av y må være 1 – du har slått av for mange restriksjoner.</p>}
          {mode === 'kofn' && yValid && relaxedCount < 1 && <p className="mt-1 text-xs text-warn">Med y₁+y₂+y₃ = 0 er alle tre håndhevet – lovlig etter «≤ 1»-varianten, men ikke etter «= 1».</p>}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <M>M =</M>
            <span className="w-12 font-mono">{Mv}</span>
            <Slider value={Mv} min={0} max={120} step={1} onChange={setMv} label="M" />
          </div>
          {tooSmall ? (
            <p className="mt-1 text-xs text-bad">M er for liten: den «avslåtte» restriksjonen kutter fortsatt bort lovlige punkter. M må være minst så stor at restriksjonen blir redundant.</p>
          ) : (
            <p className="mt-1 text-xs text-good">M er stor nok: restriksjonen med y = 1 blir redundant.</p>
          )}
          <div className="mt-2">
            <Toggle checked={showUnion} onChange={setShowUnion}>
              Vis ønsket union
            </Toggle>
          </div>
        </Panel>
        <Panel title="Hvorfor fungerer det?">
          <p className="prose-body text-[0.97rem]">
            Når <M>y_i = 0</M> står restriksjonen uendret. Når <M>y_i = 1</M> blir høyresiden <M>b_i + M</M>, som er så stor at restriksjonen aldri binder (redundant). Den binære variabelen «slår av» restriksjonen. Mengden vi vil modellere er en union av polyedre – ikke konveks – og kan derfor ikke beskrives med lineære restriksjoner alene.
          </p>
          {opt && (
            <p className="mt-2 text-sm">
              Optimum over unionen: <M>{`(${texNum(opt.x[0])}, ${texNum(opt.x[1])})`}</M>, <M>{`Z = ${texNum(opt.z)}`}</M> (håndhever restriksjon {opt.idx.map((i) => i + 1).join(' og ')}).
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function FixedChargeTab() {
  const [y, setY] = useState<[number, number]>([1, 1]);
  const solveFor = (y1: number, y2: number) => {
    const r = solveLP({
      sense: 'max',
      c: [3, 5],
      cons: [
        { a: [3, 2], op: '<=', b: 1800 },
        { a: [1, 4], op: '<=', b: 1600 },
        { a: [1, 0], op: '<=', b: y1 ? 1e9 : 0 },
        { a: [0, 1], op: '<=', b: y2 ? 1e9 : 0 },
      ],
    });
    return { x: r.x, z: r.z - 100 * y1 - 200 * y2, gross: r.z };
  };
  const combos = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([a, b]) => ({ y: [a, b], ...solveFor(a, b) }));
  const best = combos.reduce((b, c) => (c.z > b.z ? c : b), combos[0]);
  const cur = solveFor(y[0], y[1]);
  const xs = Array.from({ length: 61 }, (_, k) => k * 10);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Fast kostnad (fixed charge) – forelesningseksempel">
        <MB>{`f_1(x_1) = \\begin{cases} 3x_1 - 100 & x_1 > 0 \\\\ 0 & x_1 = 0\\end{cases}\\qquad f_2(x_2) = \\begin{cases} 5x_2 - 200 & x_2 > 0 \\\\ 0 & x_2 = 0\\end{cases}`}</MB>
        <MB>{`\\begin{aligned}\\max\\ & 3x_1 + 5x_2 - 100y_1 - 200y_2 \\\\ \\text{s.t. } & 3x_1 + 2x_2 \\le 1800,\\quad x_1 + 4x_2 \\le 1600 \\\\ & x_1 - My_1 \\le 0,\\quad x_2 - My_2 \\le 0 \\\\ & x_1,x_2 \\ge 0,\\ y_1,y_2 \\in\\{0,1\\}\\end{aligned}`}</MB>
        <svg viewBox="0 0 320 140" className="mt-2 w-full">
          <line x1="30" y1="110" x2="310" y2="110" stroke="rgb(var(--mute))" />
          <line x1="30" y1="10" x2="30" y2="130" stroke="rgb(var(--mute))" />
          <polyline fill="none" stroke="rgb(var(--obj))" strokeWidth="2" points={xs.filter((x) => x > 0).map((x) => `${30 + x / 2.2},${110 - (3 * x - 100) / 20}`).join(' ')} />
          <circle cx="30" cy="110" r="3.5" fill="rgb(var(--obj))" />
          <circle cx="30" cy={110 + 100 / 20} r="3.5" fill="rgb(var(--panel))" stroke="rgb(var(--obj))" />
          <text x="36" y="128" fontSize="10" fill="rgb(var(--mute))">
            f₁(x₁): hopp ved 0 bryter proporsjonalitet
          </text>
        </svg>
      </Panel>
      <Panel title="Prøv kombinasjonene">
        <div className="flex gap-2">
          {[0, 1].map((i) => (
            <Segmented
              key={i}
              size="xs"
              value={String(y[i]) as '0' | '1'}
              onChange={(v) => setY((q) => (i === 0 ? [+v, q[1]] : [q[0], +v]))}
              options={[
                { value: '0', label: <M>{`y_${i + 1}=0`}</M> },
                { value: '1', label: <M>{`y_${i + 1}=1`}</M> },
              ]}
            />
          ))}
        </div>
        <p className="mt-2 text-sm">
          Beste LP gitt <M>y</M>: <M>{`x = (${texNum(cur.x[0])}, ${texNum(cur.x[1])})`}</M>, bruttoprofitt {fmtNum(cur.gross)}, netto <strong>{fmtNum(cur.z)}</strong>.
        </p>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-mute">
              <th className="font-medium">(y₁, y₂)</th>
              <th className="font-medium">x*</th>
              <th className="font-medium">netto</th>
            </tr>
          </thead>
          <tbody>
            {combos.map((c, k) => (
              <tr key={k} className={`border-t border-line/60 ${c === best ? 'font-semibold text-opt' : ''}`}>
                <td className="font-mono">({c.y.join(', ')})</td>
                <td className="font-mono">
                  ({fmtNum(c.x[0])}, {fmtNum(c.x[1])})
                </td>
                <td className="font-mono">{fmtNum(c.z)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-mute">
          Hvorfor ikke en restriksjon for <M>{'x_i = 0 \\Rightarrow y_i = 0'}</M>? Maksimeringen gjør det: hvis <M>x_i = 0</M> er det alltid bedre å velge <M>y_i = 0</M> og spare den faste kostnaden.
        </p>
      </Panel>
    </div>
  );
}

function NValuesTab() {
  const [k, setK] = useState(1);
  const vals = [100, 200, 300];
  const view: View = { x0: -2, x1: 160, y0: -2, y1: 80 };
  const model: Model2D = { sense: 'max', c1: 0, c2: 0, nonneg: true, constraints: [{ id: 'n', a1: 2, a2: 4, op: '=', b: vals[k] }] };
  const a = analyze(model);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="card overflow-hidden">
        <LPPlot model={model} analysis={a} view={view} objLevel={null} ghostConstraints={vals.map((v, i) => ({ id: `g${i}`, a1: 2, a2: 4, op: '=' as const, b: v }))} options={{ vertices: true, vertexLabels: true, optimum: false, gradient: false, isoquant: false, grid: true, constraintLabels: false }} />
      </div>
      <Panel title="Funksjon med N mulige verdier (lastebiler)">
        <MB>{`2x_1 + 4x_2 \\in \\{100, 200, 300\\}`}</MB>
        <MB>{`\\begin{aligned} 2x_1 + 4x_2 &= 100y_1 + 200y_2 + 300y_3 \\\\ y_1 + y_2 + y_3 &= 1,\\quad y_i \\in \\{0,1\\}\\end{aligned}`}</MB>
        <div className="mt-2 flex gap-2">
          {vals.map((v, i) => (
            <button key={v} className={`btn ${k === i ? 'border-accent bg-accent/10' : ''}`} onClick={() => setK(i)}>
              <M>{`y_${i + 1} = 1`}</M>
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-mute">
          Nøyaktig én <M>y_i</M> er 1, så venstresiden må være lik én av verdiene. Tillatt mengde = tre parallelle linjestykker (her: <M>{`2x_1 + 4x_2 = ${vals[k]}`}</M> er aktiv).
        </p>
        <p className="mt-2 text-sm text-mute">
          Samme idé i DO-øving 1(3): <M>{'|x_1 - x_2| \\in \\{0,3,6\\}'}</M> blir <M>{'x_1 - x_2 = 0y_1 + 3y_2 - 3y_3 + 6y_4 - 6y_5'}</M> med <M>{'\\sum y_i = 1'}</M>.
        </p>
      </Panel>
    </div>
  );
}

export function BinaryLab({ initial = 'logic' }: { initial?: 'logic' | 'bigm' | 'fixed' | 'nvals' }) {
  const [tab, setTab] = useState(initial);
  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'logic', label: 'Logiske relasjoner' },
          { id: 'bigm', label: 'Enten–eller / K av N (big M)' },
          { id: 'fixed', label: 'Fast kostnad' },
          { id: 'nvals', label: 'N mulige verdier' },
        ]}
      />
      {tab === 'logic' && <LogicTab />}
      {tab === 'bigm' && <BigMTab />}
      {tab === 'fixed' && <FixedChargeTab />}
      {tab === 'nvals' && <NValuesTab />}
    </div>
  );
}
