import { useMemo, useState } from 'react';
import { Panel, Badge, Toggle } from '../components/ui';
import { M } from '../components/Math';
import { texLinear, opTex, texNum, fmtNum } from '../math/format';
import { solveLP } from '../math/simplex';

interface BCon {
  a: number[];
  op: '<=' | '>=' | '=';
  b: number;
  label: string;
  optional?: boolean;
}

interface BIP {
  id: string;
  name: string;
  source: string;
  sense: 'max' | 'min';
  vars: string[]; // tex names
  varLabels: string[];
  c: number[];
  cons: BCon[];
  unit?: string;
  matrix?: { rows: string[]; cols: string[]; cell: (r: number, c: number) => number };
}

const CITIES = ['AT', 'BO', 'CH', 'DE', 'HO', 'LA', 'NO', 'NY', 'PI', 'SL', 'SF', 'SE'];
const COVER: Record<string, string[]> = {
  AT: ['AT', 'CH', 'HO', 'NO', 'NY', 'PI'],
  BO: ['BO', 'NY', 'PI'],
  CH: ['AT', 'CH', 'NY', 'NO', 'PI'],
  DE: ['DE', 'SL'],
  HO: ['AT', 'HO', 'NO'],
  LA: ['LA', 'SL', 'SF'],
  NO: ['AT', 'CH', 'HO', 'NO'],
  NY: ['AT', 'BO', 'CH', 'NY', 'PI'],
  PI: ['AT', 'BO', 'CH', 'NY', 'PI'],
  SL: ['DE', 'LA', 'SL', 'SF', 'SE'],
  SF: ['LA', 'SL', 'SF', 'SE'],
  SE: ['SL', 'SF', 'SE'],
};

export const BIPS: BIP[] = [
  {
    id: 'capital',
    name: 'Kapitalbudsjettering',
    source: 'Forelesning DO1, Example 1 (i $1000)',
    sense: 'max',
    vars: ['x_1', 'x_2', 'x_3', 'x_4', 'x_5', 'x_6', 'x_7'],
    varLabels: ['Inv. 1', 'Inv. 2', 'Inv. 3', 'Inv. 4', 'Inv. 5', 'Inv. 6', 'Inv. 7'],
    c: [16, 8, 10, 19.5, 22, 12, 7.5],
    unit: 'NPV ($1000)',
    cons: [
      { a: [5, 2.5, 3.5, 6, 7, 4.5, 3], op: '<=', b: 15, label: 'Kontanter' },
      { a: [1, 1, 1, 1, 1, 1, 1], op: '<=', b: 1, label: 'Høyst én investering', optional: true },
      { a: [1, 1, 0, 0, 0, 0, 0], op: '<=', b: 1, label: 'Inv. 1 og 2 ikke begge', optional: true },
      { a: [-1, 0, 0, 0, 1, 0, 0], op: '<=', b: 0, label: 'Inv. 5 bare hvis inv. 1 (x₅ ≤ x₁)', optional: true },
    ],
  },
  {
    id: 'facility',
    name: 'Fabrikk- og lagerlokalisering',
    source: 'Forelesning DO1, Example 6',
    sense: 'max',
    vars: ['x_1', 'x_2', 'x_3', 'x_4'],
    varLabels: ['Fabrikk A', 'Fabrikk B', 'Lager A', 'Lager B'],
    c: [9, 5, 6, 4],
    unit: 'NPV (mill. RMB)',
    cons: [
      { a: [6, 3, 5, 2], op: '<=', b: 10, label: 'Kapital' },
      { a: [0, 0, 1, 1], op: '<=', b: 1, label: 'Høyst ett lager' },
      { a: [-1, 0, 1, 0], op: '<=', b: 0, label: 'Lager A bare med fabrikk A' },
      { a: [0, -1, 0, 1], op: '<=', b: 0, label: 'Lager B bare med fabrikk B' },
    ],
  },
  {
    id: 'chores',
    name: 'Husarbeid (Eve og Steven)',
    source: 'DO Practice, Problem 3',
    sense: 'min',
    vars: ['M_E', 'C_E', 'D_E', 'L_E', 'M_S', 'C_S', 'D_S', 'L_S'],
    varLabels: ['Eve: handle', 'Eve: lage mat', 'Eve: oppvask', 'Eve: klesvask', 'Steven: handle', 'Steven: lage mat', 'Steven: oppvask', 'Steven: klesvask'],
    c: [4.5, 7.8, 3.6, 2.9, 4.9, 7.2, 4.3, 3.1],
    unit: 'timer',
    cons: [
      { a: [1, 1, 1, 1, 0, 0, 0, 0], op: '=', b: 2, label: 'Eve tar to oppgaver' },
      { a: [0, 0, 0, 0, 1, 1, 1, 1], op: '=', b: 2, label: 'Steven tar to oppgaver' },
      { a: [1, 0, 0, 0, 1, 0, 0, 0], op: '=', b: 1, label: 'Handling gjøres av én' },
      { a: [0, 1, 0, 0, 0, 1, 0, 0], op: '=', b: 1, label: 'Matlaging gjøres av én' },
      { a: [0, 0, 1, 0, 0, 0, 1, 0], op: '=', b: 1, label: 'Oppvask gjøres av én' },
      { a: [0, 0, 0, 1, 0, 0, 0, 1], op: '=', b: 1, label: 'Klesvask gjøres av én' },
    ],
    matrix: { rows: ['Eve', 'Steven'], cols: ['Handle', 'Mat', 'Oppvask', 'Klesvask'], cell: (r, c) => r * 4 + c },
  },
  {
    id: 'hub',
    name: 'Hub-lokalisering (set covering)',
    source: 'Forelesning DO1, Example 5 (Western Airlines)',
    sense: 'min',
    vars: CITIES.map((c) => `x_{\\text{${c}}}`),
    varLabels: CITIES,
    c: CITIES.map(() => 1),
    unit: 'antall hubber',
    cons: CITIES.map((city) => ({
      a: CITIES.map((h) => (COVER[city].includes(h) ? 1 : 0)),
      op: '>=' as const,
      b: 1,
      label: `${city} dekkes`,
    })),
  },
];

function enumerate(bip: BIP, active: boolean[]) {
  const n = bip.vars.length;
  let best: { x: number[]; z: number } | null = null;
  let count = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    const x = Array.from({ length: n }, (_, j) => (mask >> j) & 1);
    const ok = bip.cons.every((c, i) => !active[i] || check(c, x));
    if (!ok) continue;
    count++;
    const z = bip.c.reduce((s, cj, j) => s + cj * x[j], 0);
    if (!best || (bip.sense === 'max' ? z > best.z + 1e-9 : z < best.z - 1e-9)) best = { x, z };
  }
  return { best, count };
}

function check(c: BCon, x: number[]) {
  const v = c.a.reduce((s, a, j) => s + a * x[j], 0);
  return c.op === '<=' ? v <= c.b + 1e-9 : c.op === '>=' ? v >= c.b - 1e-9 : Math.abs(v - c.b) < 1e-9;
}

export function BIPExplorer({ presetId = 'capital' }: { presetId?: string }) {
  const [pid, setPid] = useState(presetId);
  const bip = BIPS.find((b) => b.id === pid)!;
  const [x, setX] = useState<number[]>(bip.vars.map(() => 0));
  const [active, setActive] = useState<boolean[]>(bip.cons.map((c) => !c.optional));
  const [reveal, setReveal] = useState(false);
  const pick = (id: string) => {
    const b = BIPS.find((q) => q.id === id)!;
    setPid(id);
    setX(b.vars.map(() => 0));
    setActive(b.cons.map((c) => !c.optional));
    setReveal(false);
  };
  const z = bip.c.reduce((s, cj, j) => s + cj * x[j], 0);
  const status = bip.cons.map((c) => ({ ok: check(c, x), v: c.a.reduce((s, a, j) => s + a * x[j], 0) }));
  const feasibleNow = status.every((st, i) => !active[i] || st.ok);
  const { best, count } = useMemo(() => enumerate(bip, active), [bip, active]);
  const relax = useMemo(() => {
    const r = solveLP({
      sense: bip.sense,
      c: bip.c,
      cons: [...bip.cons.filter((_, i) => active[i]).map((c) => ({ a: c.a, op: c.op, b: c.b })), ...bip.vars.map((_, j) => ({ a: bip.vars.map((_, k) => (k === j ? 1 : 0)), op: '<=' as const, b: 1 }))],
    });
    return r;
  }, [bip, active]);
  const toggle = (j: number) => setX((q) => q.map((v, k) => (k === j ? 1 - v : v)));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <Panel title="Problem">
          <select className="input w-full" value={pid} onChange={(e) => pick(e.target.value)} aria-label="Velg problem">
            {BIPS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-mute">Kilde: {bip.source}</p>
          <div className="mt-2 overflow-x-auto text-sm">
            <M>{`\\${bip.sense}\\ ${texLinear(bip.c, bip.vars)}`}</M>
          </div>
        </Panel>
        <Panel title="Dine beslutninger (klikk for å slå av/på)">
          {bip.matrix ? (
            <table className="w-full text-center text-sm">
              <thead>
                <tr>
                  <th />
                  {bip.matrix.cols.map((c) => (
                    <th key={c} className="px-1 py-1 text-xs font-medium text-mute">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bip.matrix.rows.map((r, ri) => (
                  <tr key={r}>
                    <td className="pr-2 text-left text-xs font-medium">{r}</td>
                    {bip.matrix!.cols.map((_, ci) => {
                      const j = bip.matrix!.cell(ri, ci);
                      return (
                        <td key={ci} className="p-1">
                          <button className={`w-full rounded-md border px-2 py-2 font-mono text-xs ${x[j] ? 'border-accent bg-accent/15 text-accent' : 'border-line'}`} onClick={() => toggle(j)} aria-pressed={!!x[j]}>
                            {fmtNum(bip.c[j])} t
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {bip.vars.map((v, j) => (
                <button key={j} className={`rounded-md border px-2 py-1.5 text-left text-xs ${x[j] ? 'border-accent bg-accent/15' : 'border-line'}`} onClick={() => toggle(j)} aria-pressed={!!x[j]}>
                  <div className="font-medium">{bip.varLabels[j]}</div>
                  <div className="font-mono text-mute">
                    <M>{`${v} = ${x[j]}`}</M>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-md bg-sunk px-3 py-2 text-sm">
            <span>
              {bip.unit}: <strong>{fmtNum(z)}</strong>
            </span>
            {feasibleNow ? <Badge tone="good">tillatt</Badge> : <Badge tone="bad">bryter restriksjoner</Badge>}
          </div>
        </Panel>
      </div>
      <div className="space-y-3">
        <Panel title="Restriksjoner">
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {bip.cons.map((c, i) => (
              <div key={i} className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm ${active[i] && !status[i].ok ? 'bg-bad/10' : ''} ${!active[i] ? 'opacity-50' : ''}`}>
                <div className="min-w-0">
                  {c.optional ? (
                    <Toggle checked={active[i]} onChange={(v) => setActive((q) => q.map((a, k) => (k === i ? v : a)))}>
                      <span className="text-xs">{c.label}</span>
                    </Toggle>
                  ) : (
                    <span className="text-xs text-mute">{c.label}</span>
                  )}
                  <div className="overflow-x-auto">
                    <M>{`${texLinear(c.a, bip.vars)} ${opTex(c.op)} ${texNum(c.b)}`}</M>
                  </div>
                </div>
                <span className="whitespace-nowrap font-mono text-xs">
                  {fmtNum(status[i].v)} {status[i].ok ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Optimum">
          <Toggle checked={reveal} onChange={setReveal}>
            Vis optimal løsning (fullstendig oppramsing av {1 << bip.vars.length} kombinasjoner)
          </Toggle>
          {reveal && (
            <div className="mt-2 space-y-1 text-sm">
              {best ? (
                <>
                  <div>
                    Optimum: {best.x.map((v, j) => (v ? bip.varLabels[j] : null)).filter(Boolean).join(', ') || 'ingen valgt'} — <strong>{fmtNum(best.z)}</strong> {bip.unit}
                  </div>
                  <div className="text-xs text-mute">{count} tillatte kombinasjoner.</div>
                </>
              ) : (
                <Badge tone="bad">Ingen tillatt kombinasjon</Badge>
              )}
              {relax.status === 'optimal' && (
                <div className="text-xs text-mute">
                  LP-relaksering (<M>{'0 \\le x_j \\le 1'}</M>): Z = {fmtNum(relax.z)}, x = ({relax.x.map((v) => fmtNum(v)).join(', ')}).
                </div>
              )}
              <button className="btn mt-1" onClick={() => best && setX(best.x)}>
                Sett mine beslutninger lik optimum
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
