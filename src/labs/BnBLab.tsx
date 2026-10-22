import { useMemo, useState } from 'react';
import { BBNode, BBState, IPModel, branch, branchCandidates, defaultBranchVar, fmt, initBB, isDone, selectNode, autoStep, solveAll } from '../math/bnb';
import { Panel, Toggle, Badge } from '../components/ui';
import { M, MB } from '../components/Math';
import { texLinear, opTex, texNum } from '../math/format';
import { analyze, Model2D, Constraint2D } from '../math/lp2d';
import { LPPlot, autoView } from '../components/plot/LPPlot';

interface BBPreset {
  id: string;
  name: string;
  source: string;
  model: IPModel;
}

const bin = (n: number) => new Array(n).fill(true);

export const BB_PRESETS: BBPreset[] = [
  {
    id: 'lecture-bip',
    name: 'Forelesning: BIP-eksempel (4 binære)',
    source: 'Forelesning DO2, s. 9–23',
    model: {
      lp: {
        sense: 'max',
        c: [9, 5, 6, 4],
        cons: [
          { a: [6, 3, 5, 2], op: '<=', b: 10 },
          { a: [0, 0, 1, 1], op: '<=', b: 1 },
          { a: [-1, 0, 1, 0], op: '<=', b: 0 },
          { a: [0, -1, 0, 1], op: '<=', b: 0 },
        ],
      },
      integer: bin(4),
      binary: bin(4),
    },
  },
  {
    id: 'lecture-mip',
    name: 'Forelesning: MIP-eksempel',
    source: 'Forelesning DO2, s. 25–32',
    model: {
      lp: {
        sense: 'max',
        c: [4, -2, 7, -1],
        cons: [
          { a: [1, 0, 5, 0], op: '<=', b: 10 },
          { a: [1, 1, -1, 0], op: '<=', b: 1 },
          { a: [6, -5, 0, 0], op: '<=', b: 0 },
          { a: [-1, 0, 2, -2], op: '<=', b: 3 },
        ],
      },
      integer: [true, true, true, false],
      binary: [false, false, false, false],
    },
  },
  {
    id: 'practice-4',
    name: 'DO Practice 4 (5 binære)',
    source: 'Discrete Optimization practice, Problem 4',
    model: {
      lp: {
        sense: 'max',
        c: [2, -1, 5, -3, 4],
        cons: [
          { a: [3, -2, 7, -5, 4], op: '<=', b: 6 },
          { a: [1, -1, 2, -4, 2], op: '<=', b: 0 },
        ],
      },
      integer: bin(5),
      binary: bin(5),
    },
  },
  {
    id: 'vincent',
    name: 'Vincent Cardoza (2 heltall)',
    source: 'Discrete Optimization practice, Problem 2',
    model: {
      lp: { sense: 'max', c: [130, 150], cons: [{ a: [3.2, 2.4], op: '<=', b: 16 }, { a: [2, 3], op: '<=', b: 15 }] },
      integer: [true, true],
      binary: [false, false],
    },
  },
  {
    id: 'capital',
    name: 'Kapitalbudsjettering (7 binære)',
    source: 'Forelesning DO1, Example 1 (beløp i $1000)',
    model: {
      lp: { sense: 'max', c: [16, 8, 10, 19.5, 22, 12, 7.5], cons: [{ a: [5, 2.5, 3.5, 6, 7, 4.5, 3], op: '<=', b: 15 }] },
      integer: bin(7),
      binary: bin(7),
    },
  },
  {
    id: 'clay',
    name: 'Geometri for MIP: B, M heltall',
    source: 'Forelesning DO1, s. 53–55',
    model: {
      lp: { sense: 'max', c: [40, 50], cons: [{ a: [1, 2], op: '<=', b: 40 }, { a: [4, 3], op: '<=', b: 120 }] },
      integer: [true, true],
      binary: [false, false],
    },
  },
];

const NODE_W = 172;
const NODE_H = 74;
const GAP_X = 16;
const GAP_Y = 46;

function layout(nodes: BBNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pos = new Map<number, { x: number; y: number }>();
  let leaf = 0;
  const walk = (id: number): number => {
    const n = byId.get(id)!;
    if (!n.children.length) {
      const x = leaf++ * (NODE_W + GAP_X);
      pos.set(id, { x, y: n.depth * (NODE_H + GAP_Y) });
      return x;
    }
    const xs = n.children.map(walk);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    pos.set(id, { x, y: n.depth * (NODE_H + GAP_Y) });
    return x;
  };
  walk(0);
  const maxX = Math.max(...[...pos.values()].map((p) => p.x)) + NODE_W;
  const maxY = Math.max(...[...pos.values()].map((p) => p.y)) + NODE_H;
  return { pos, w: maxX, h: maxY };
}

export function BnBLab({ presetId = 'lecture-bip' }: { presetId?: string }) {
  const [pid, setPid] = useState(presetId);
  const preset = BB_PRESETS.find((p) => p.id === pid)!;
  const allBinary = preset.model.binary.every(Boolean);
  const [roundBound, setRoundBound] = useState(allBinary);
  const [st, setSt] = useState<BBState>(() => initBB(preset.model, { roundBound: allBinary }));
  const [sel, setSel] = useState<number>(0);
  const reset = (id = pid, rb = roundBound) => {
    const p = BB_PRESETS.find((q) => q.id === id)!;
    setSt(initBB(p.model, { roundBound: rb }));
    setSel(0);
  };
  const { pos, w, h } = useMemo(() => layout(st.nodes), [st]);
  const next = selectNode(st);
  const selNode = st.nodes.find((n) => n.id === sel) ?? st.nodes[0];
  const cands = branchCandidates(st, selNode.id);
  const n = preset.model.lp.c.length;
  const vn = Array.from({ length: n }, (_, j) => `x_{${j + 1}}`);
  const done = isDone(st);

  const modelTex = `\\begin{aligned}\\${preset.model.lp.sense}\\quad & Z = ${texLinear(preset.model.lp.c, vn)} \\\\ \\text{s.t.}\\quad ${preset.model.lp.cons
    .map((c) => `& ${texLinear(c.a, vn)} ${opTex(c.op)} ${texNum(c.b)}`)
    .join('\\\\ \\quad ')} \\\\ & ${allBinary ? 'x_j \\in \\{0,1\\}' : preset.model.integer.map((b, j) => (b ? `x_{${j + 1}}` : null)).filter(Boolean).join(', ') + '\\in \\mathbb{Z}_{\\ge 0}' + (preset.model.integer.some((b) => !b) ? `,\\ ${preset.model.integer.map((b, j) => (!b ? `x_{${j + 1}}` : null)).filter(Boolean).join(', ')} \\ge 0` : '')}\\end{aligned}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Problem">
          <select
            className="input mb-2 w-full"
            value={pid}
            onChange={(e) => {
              const id = e.target.value;
              const p = BB_PRESETS.find((q) => q.id === id)!;
              const rb = p.model.binary.every(Boolean);
              setPid(id);
              setRoundBound(rb);
              reset(id, rb);
            }}
            aria-label="Velg problem"
          >
            {BB_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-mute">Kilde: {preset.source}</p>
          <MB>{modelTex}</MB>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle
              checked={roundBound}
              onChange={(v) => {
                setRoundBound(v);
                reset(pid, v);
              }}
            >
              Rund ned grensen (heltallige <M>c_j</M>, som i BIP-forelesningen)
            </Toggle>
          </div>
          <p className="mt-2 text-xs text-mute">
            Forgreningsregel: {st.rule === 'natural' ? 'neste ufikserte variabel i naturlig rekkefølge (BIP-forelesningen)' : 'første heltallsvariabel med ikke-heltallig verdi (MIP-forelesningen)'}. Nodevalg: sist opprettede ufathomede node (ved likhet: størst grense).
          </p>
        </Panel>
        <Panel title="Status">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-sunk px-3 py-2">
              <div className="label">Incumbent</div>
              {st.incumbent ? (
                <M>{`(${st.incumbent.x.map((v) => texNum(v)).join(', ')})`}</M>
              ) : (
                <span className="text-mute">ingen ennå</span>
              )}
            </div>
            <div className="rounded-md bg-sunk px-3 py-2">
              <div className="label">Z*</div>
              <M>{st.incumbent ? texNum(st.incumbent.z) : st.model.lp.sense === 'max' ? '-\\infty' : '+\\infty'}</M>
            </div>
            <div className="col-span-2 rounded-md bg-sunk px-3 py-2">
              <div className="label">Beste gjenstående grense / optimalitetsgap</div>
              {(() => {
                const open = st.nodes.filter((x) => x.state === 'open' && x.lpStatus === 'optimal');
                if (!open.length) return <span>{done ? 'Ingen åpne noder – incumbent er optimal.' : '–'}</span>;
                const best = st.model.lp.sense === 'max' ? Math.max(...open.map((x) => x.bound)) : Math.min(...open.map((x) => x.bound));
                return (
                  <span>
                    grense {fmt(best)}
                    {st.incumbent && <> · gap {fmt(Math.abs(best - st.incumbent.z))}</>}
                  </span>
                );
              })()}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary" disabled={done} onClick={() => setSt((s) => autoStep(s))}>
              Neste iterasjon (kursregel)
            </button>
            <button className="btn" disabled={done} onClick={() => setSt((s) => solveAll(s))}>
              Løs alt
            </button>
            <button className="btn" onClick={() => reset()}>
              Start på nytt
            </button>
          </div>
          {next && !done && (
            <p className="mt-2 text-xs text-mute">
              Kursregelen ville forgrene node {next.id} ({next.label}) på x{(defaultBranchVar(st, next.id) ?? 0) + 1}.
            </p>
          )}
          {done && st.incumbent && (
            <p className="mt-2 text-sm">
              <Badge tone="good">Optimal</Badge> <M>{`x^* = (${st.incumbent.x.map((v) => texNum(v)).join(', ')}),\\ Z^* = ${texNum(st.incumbent.z)}`}</M>
            </p>
          )}
        </Panel>
      </div>

      <Panel title="Branch-and-bound-tre" actions={<span className="text-xs text-mute">Klikk en node for å velge den</span>}>
        <div className="overflow-x-auto">
          <svg width={Math.max(w + 20, 300)} height={h + 20} className="svg-plot block" role="img" aria-label="Branch and bound-tre">
            <g transform="translate(10,10)">
              {st.nodes.map((nd) =>
                nd.children.map((cid) => {
                  const a = pos.get(nd.id)!;
                  const b = pos.get(cid)!;
                  const child = st.nodes.find((x) => x.id === cid)!;
                  return (
                    <g key={`${nd.id}-${cid}`}>
                      <path d={`M${a.x + NODE_W / 2},${a.y + NODE_H} C${a.x + NODE_W / 2},${a.y + NODE_H + GAP_Y / 2} ${b.x + NODE_W / 2},${b.y - GAP_Y / 2} ${b.x + NODE_W / 2},${b.y}`} fill="none" stroke="rgb(var(--mute))" strokeWidth={1.2} />
                      <text x={(a.x + b.x) / 2 + NODE_W / 2} y={(a.y + NODE_H + b.y) / 2 + 4} fontSize={11.5} textAnchor="middle" fill="rgb(var(--ink))" fontWeight={600} paintOrder="stroke" stroke="rgb(var(--panel))" strokeWidth={4}>
                        {child.label}
                      </text>
                    </g>
                  );
                }),
              )}
              {st.nodes.map((nd) => {
                const p = pos.get(nd.id)!;
                const isSel = nd.id === sel;
                const isNext = next?.id === nd.id && !done;
                const col =
                  nd.incumbentHere ? 'rgb(var(--obj))' : nd.state === 'F1' ? 'rgb(var(--good))' : nd.state === 'F2' ? 'rgb(var(--mute))' : nd.state === 'F3' ? 'rgb(var(--bad))' : nd.state === 'branched' ? 'rgb(var(--line))' : 'rgb(var(--accent))';
                return (
                  <g key={nd.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }} onClick={() => setSel(nd.id)} tabIndex={0} role="button" aria-label={`Node ${nd.id}`} onKeyDown={(e) => e.key === 'Enter' && setSel(nd.id)}>
                    <rect width={NODE_W} height={NODE_H} rx={7} fill="rgb(var(--panel))" stroke={isSel ? 'rgb(var(--ink))' : col} strokeWidth={isSel ? 2.4 : 1.6} strokeDasharray={nd.state === 'open' ? '5 3' : undefined} />
                    {isNext && <rect x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8} rx={10} fill="none" stroke="rgb(var(--accent))" strokeWidth={1.2} opacity={0.6} />}
                    <text x={8} y={16} fontSize={11.5} fontWeight={700} fill="rgb(var(--ink))">
                      {nd.id === 0 ? 'Alle' : `Sub ${nd.id}`}
                    </text>
                    <text x={NODE_W - 8} y={16} fontSize={11} fontWeight={700} textAnchor="end" fill={col}>
                      {nd.incumbentHere ? 'incumbent' : nd.state === 'open' ? 'åpen' : nd.state === 'branched' ? '' : nd.state === 'F1' ? 'F(1)' : nd.state === 'F2' ? 'F(2)' : 'F(3)'}
                    </text>
                    {nd.lpStatus === 'optimal' ? (
                      <>
                        <text x={8} y={35} fontSize={11} fill="rgb(var(--ink))" fontFamily="JetBrains Mono, monospace">
                          ({nd.x.map(fmt).join(', ')})
                        </text>
                        <text x={8} y={53} fontSize={11} fill="rgb(var(--mute))">
                          Z_LP = {fmt(nd.lpValue)}
                        </text>
                        <text x={8} y={67} fontSize={11} fill="rgb(var(--ink))" fontWeight={600}>
                          grense {fmt(nd.bound)}
                        </text>
                      </>
                    ) : (
                      <text x={8} y={42} fontSize={11} fill="rgb(var(--bad))">
                        {nd.lpStatus === 'infeasible' ? 'ingen tillatt løsning' : 'ubegrenset'}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Badge tone="accent">stiplet = åpen</Badge>
          <Badge tone="good">F(1): heltallig LP-løsning</Badge>
          <Badge tone="mute">F(2): grense ≤ Z*</Badge>
          <Badge tone="bad">F(3): ikke tillatt</Badge>
          <Badge tone="obj">incumbent</Badge>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Valgt node: ${selNode.id === 0 ? 'Alle' : 'Sub ' + selNode.id}`}>
          <div className="space-y-2 text-sm">
            <div>
              Tilleggsrestriksjoner:{' '}
              <M>
                {(() => {
                  const parts: string[] = [];
                  selNode.lower.forEach((lo, j) => {
                    const up = selNode.upper[j];
                    const base = preset.model.binary[j] ? [0, 1] : [0, Infinity];
                    if (lo === up && preset.model.binary[j]) parts.push(`x_{${j + 1}} = ${lo}`);
                    else {
                      if (lo > base[0]) parts.push(`x_{${j + 1}} \\ge ${lo}`);
                      if (up < base[1]) parts.push(`x_{${j + 1}} \\le ${up}`);
                    }
                  });
                  return parts.length ? parts.join(',\\ ') : '\\text{ingen (hele problemet)}';
                })()}
              </M>
            </div>
            <div>
              LP-relaksering:{' '}
              {selNode.lpStatus === 'optimal' ? (
                <M>{`x = (${selNode.x.map((v) => texNum(v)).join(', ')}),\\ Z = ${texNum(selNode.lpValue)},\\ \\text{grense } Z \\le ${texNum(selNode.bound)}`}</M>
              ) : (
                <Badge tone="bad">ingen tillatt løsning</Badge>
              )}
            </div>
            {selNode.state === 'open' && cands.length > 0 && (
              <div>
                <div className="label mb-1">Forgren på</div>
                <div className="flex flex-wrap gap-1.5">
                  {cands.map((j) => (
                    <button
                      key={j}
                      className={`btn ${defaultBranchVar(st, selNode.id) === j ? 'border-accent' : ''}`}
                      onClick={() => {
                        setSt((s) => branch(s, selNode.id, j));
                      }}
                    >
                      <M>{`x_{${j + 1}}`}</M>
                      <span className="text-xs text-mute">= {fmt(selNode.x[j])}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-mute">
                  Du kan velge en annen node eller variabel enn kursregelen – algoritmen er fortsatt korrekt, men treet kan bli større eller mindre.
                </p>
              </div>
            )}
            {selNode.state === 'F1' && <p className="text-good">Fathomed ved test 1: LP-løsningen er heltallig{selNode.incumbentHere ? ' og ble incumbent.' : '.'}</p>}
            {selNode.state === 'F2' && <p className="text-mute">Fathomed ved test 2: grensen {fmt(selNode.bound)} kan ikke slå Z* = {st.incumbent ? fmt(st.incumbent.z) : '–'}.</p>}
            {selNode.state === 'F3' && <p className="text-bad">Fathomed ved test 3: delproblemet har ingen tillatte løsninger.</p>}
          </div>
        </Panel>
        <Panel title="Logg">
          <ol className="max-h-72 space-y-1 overflow-y-auto font-mono text-[12px] leading-snug">
            {st.log.map((l, k) => (
              <li key={k} className={l.startsWith('Forgrener') ? 'mt-1 font-semibold text-ink' : 'text-mute'}>
                {l}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
      {n === 2 && <BBRegion preset={preset} node={selNode} st={st} />}
    </div>
  );
}

function BBRegion({ preset, node, st }: { preset: BBPreset; node: BBNode; st: BBState }) {
  const lp = preset.model.lp;
  const extra: Constraint2D[] = [];
  node.lower.forEach((lo, j) => {
    if (lo > 0) extra.push({ id: `lo${j}`, a1: j === 0 ? 1 : 0, a2: j === 1 ? 1 : 0, op: '>=', b: lo });
  });
  node.upper.forEach((up, j) => {
    if (up < Infinity) extra.push({ id: `up${j}`, a1: j === 0 ? 1 : 0, a2: j === 1 ? 1 : 0, op: '<=', b: up });
  });
  const base: Model2D = { sense: lp.sense, c1: lp.c[0], c2: lp.c[1], nonneg: true, constraints: lp.cons.map((c, i) => ({ id: `c${i}`, a1: c.a[0], a2: c.a[1], op: c.op, b: c.b })) };
  const model: Model2D = { ...base, constraints: [...base.constraints, ...extra] };
  const a = analyze(model);
  const view = autoView(base);
  return (
    <Panel title="Delproblemets område (2 variabler)">
      <LPPlot
        model={model}
        analysis={a}
        view={view}
        objLevel={a.zStar ?? null}
        options={{ intGrid: true, vertices: true, vertexLabels: true, optimum: true, isoquant: true, gradient: false, grid: true, constraintLabels: false, binding: false }}
        ghostConstraints={base.constraints}
        points={st.incumbent ? [{ p: [st.incumbent.x[0], st.incumbent.x[1]], color: 'rgb(var(--obj))', r: 6, label: 'incumbent' }] : []}
      />
      <p className="text-xs text-mute">
        Forgreningen legger til <M>{'x_j \\le \\lfloor v \\rfloor'}</M> eller <M>{'x_j \\ge \\lceil v \\rceil'}</M> og kutter bort en stripe uten heltallspunkter. Ingen heltallsløsning går tapt.
      </p>
    </Panel>
  );
}
