/**
 * Branch-and-bound for (mixed) integer LPs, following the course (Hillier &
 * Lieberman style) algorithm:
 *   - Bounding: LP relaxation; optionally round the bound down when all
 *     objective coefficients are integer and all variables are integer (BIP).
 *   - Fathoming: test 1 (LP solution integral), test 2 (bound <= Z*),
 *     test 3 (LP infeasible).
 *   - Branching variable: 'natural' (next unfixed variable in natural order,
 *     used for BIP in the lecture) or 'firstFractional' (MIP lecture rule).
 *   - Node selection: most recently created, ties -> larger bound.
 * Supports maximization (minimization is converted internally).
 */
import { LP, LinCon, solveLP, clean } from './simplex';

export interface IPModel {
  lp: LP; // sense, c, cons (variables nonnegative)
  integer: boolean[];
  binary: boolean[];
}

export type Fathom = 'F1' | 'F2' | 'F3';

export interface BBNode {
  id: number;
  parent: number | null;
  label: string; // e.g. "x1 = 0" or "x2 ≤ 1"
  depth: number;
  lower: number[];
  upper: number[];
  lpStatus: 'optimal' | 'infeasible' | 'unbounded';
  x: number[];
  lpValue: number;
  bound: number;
  state: 'open' | 'branched' | Fathom;
  incumbentHere?: boolean;
  createdAt: number;
  children: number[];
  branchVar?: number;
}

export interface BBState {
  model: IPModel;
  nodes: BBNode[];
  incumbent: { x: number[]; z: number; node: number } | null;
  log: string[];
  roundBound: boolean;
  rule: 'natural' | 'firstFractional';
  counter: number;
}

const isInt = (v: number) => Math.abs(v - Math.round(v)) < 1e-7;

export function fmt(v: number): string {
  if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
  for (let d = 1; d <= 12; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-7) {
      if (d === 1) return String(n);
      const w = Math.trunc(n / d);
      const r = Math.abs(n % d);
      return w !== 0 ? `${w < 0 || n < 0 ? '−' : ''}${Math.abs(w)} ${r}/${d}` : `${n < 0 ? '−' : ''}${r}/${d}`;
    }
  }
  return (Math.round(v * 1000) / 1000).toString();
}

function solveNode(model: IPModel, lower: number[], upper: number[]) {
  const n = model.lp.c.length;
  const extra: LinCon[] = [];
  for (let j = 0; j < n; j++) {
    if (upper[j] < Infinity) extra.push({ a: unit(n, j), op: '<=', b: upper[j] });
    if (lower[j] > 0) extra.push({ a: unit(n, j), op: '>=', b: lower[j] });
  }
  // contradictory bounds
  for (let j = 0; j < n; j++) if (lower[j] > upper[j] + 1e-9) return { status: 'infeasible' as const, x: [], z: NaN };
  const r = solveLP({ ...model.lp, cons: [...model.lp.cons, ...extra] });
  return { status: r.status, x: r.x.map(clean), z: r.z };
}

function unit(n: number, j: number) {
  const a = new Array(n).fill(0);
  a[j] = 1;
  return a;
}

const sgn = (m: IPModel) => (m.lp.sense === 'max' ? 1 : -1);

function computeBound(state: BBState, z: number) {
  const s = sgn(state.model);
  if (!state.roundBound) return z;
  const integralObj = state.model.lp.c.every((c, j) => (c === 0 || state.model.integer[j] || state.model.binary[j]) && isInt(c));
  if (!integralObj) return z;
  // max: round down ; min: round up
  return s > 0 ? Math.floor(z + 1e-9) : Math.ceil(z - 1e-9);
}

/** is a better than b in the problem's sense */
const better = (m: IPModel, a: number, b: number) => (sgn(m) > 0 ? a > b + 1e-9 : a < b - 1e-9);
const notBetter = (m: IPModel, a: number, b: number) => !better(m, a, b);

export function initBB(model: IPModel, opts?: { roundBound?: boolean; rule?: 'natural' | 'firstFractional' }): BBState {
  const n = model.lp.c.length;
  const lower = new Array(n).fill(0);
  const upper = model.binary.map((b) => (b ? 1 : Infinity));
  const st: BBState = {
    model,
    nodes: [],
    incumbent: null,
    log: [],
    roundBound: opts?.roundBound ?? model.binary.every(Boolean),
    rule: opts?.rule ?? (model.binary.every(Boolean) ? 'natural' : 'firstFractional'),
    counter: 0,
  };
  const node = makeNode(st, null, 'Alle', 0, lower, upper);
  st.nodes.push(node);
  st.log.push(`Initialisering: Z* = ${sgn(model) > 0 ? '−∞' : '+∞'}. LP-relaksering gir ${describe(node)}.`);
  evaluate(st, node);
  return st;
}

function describe(node: BBNode) {
  if (node.lpStatus === 'infeasible') return 'ingen tillatt løsning';
  if (node.lpStatus === 'unbounded') return 'ubegrenset LP';
  return `x = (${node.x.map(fmt).join(', ')}), Z = ${fmt(node.lpValue)}`;
}

function makeNode(st: BBState, parent: number | null, label: string, depth: number, lower: number[], upper: number[]): BBNode {
  const r = solveNode(st.model, lower, upper);
  const id = st.counter++;
  return {
    id,
    parent,
    label,
    depth,
    lower,
    upper,
    lpStatus: r.status,
    x: r.status === 'optimal' ? r.x : [],
    lpValue: r.status === 'optimal' ? r.z : NaN,
    bound: r.status === 'optimal' ? computeBound(st, r.z) : NaN,
    state: 'open',
    createdAt: id,
    children: [],
  };
}

function integralFor(st: BBState, x: number[]) {
  return x.every((v, j) => !(st.model.integer[j] || st.model.binary[j]) || isInt(v));
}

/** apply fathoming tests to a single (open) node */
function evaluate(st: BBState, node: BBNode) {
  if (node.lpStatus === 'infeasible') {
    node.state = 'F3';
    st.log.push(`Node ${node.id} (${node.label}): LP-relakseringen er ikke tillatt → fathomed ved test 3.`);
    return;
  }
  if (node.lpStatus === 'unbounded') {
    st.log.push(`Node ${node.id}: LP-relakseringen er ubegrenset; B&B kan ikke gi en grense her.`);
    return;
  }
  if (st.incumbent && notBetter(st.model, node.bound, st.incumbent.z)) {
    node.state = 'F2';
    st.log.push(`Node ${node.id} (${node.label}): grense ${fmt(node.bound)} ≤ Z* = ${fmt(st.incumbent.z)} → fathomed ved test 2.`);
    return;
  }
  if (integralFor(st, node.x)) {
    node.state = 'F1';
    const z = node.lpValue;
    if (!st.incumbent || better(st.model, z, st.incumbent.z)) {
      st.incumbent = { x: node.x, z, node: node.id };
      node.incumbentHere = true;
      st.log.push(`Node ${node.id} (${node.label}): heltallig LP-løsning ${describe(node)} → ny incumbent, Z* = ${fmt(z)} (test 1).`);
      // re-check other open nodes against new incumbent (test 2)
      for (const other of st.nodes) {
        if (other.state === 'open' && other.id !== node.id && other.lpStatus === 'optimal' && notBetter(st.model, other.bound, z)) {
          other.state = 'F2';
          st.log.push(`Node ${other.id} (${other.label}): grense ${fmt(other.bound)} ≤ Z* = ${fmt(z)} → fathomed ved test 2.`);
        }
      }
    } else {
      st.log.push(`Node ${node.id} (${node.label}): heltallig, men ikke bedre enn incumbent → fathomed ved test 1.`);
    }
  }
}

export function branchCandidates(st: BBState, nodeId: number): number[] {
  const node = st.nodes.find((n) => n.id === nodeId);
  if (!node || node.state !== 'open' || node.lpStatus !== 'optimal') return [];
  const out: number[] = [];
  node.x.forEach((v, j) => {
    const intVar = st.model.integer[j] || st.model.binary[j];
    if (!intVar) return;
    if (st.model.binary[j]) {
      if (node.lower[j] !== node.upper[j]) out.push(j);
    } else if (!isInt(v)) out.push(j);
  });
  return out;
}

export function defaultBranchVar(st: BBState, nodeId: number): number | null {
  const node = st.nodes.find((n) => n.id === nodeId)!;
  const cands = branchCandidates(st, nodeId);
  if (cands.length === 0) return null;
  if (st.rule === 'natural') return cands[0];
  const frac = cands.filter((j) => !isInt(node.x[j]));
  return frac[0] ?? cands[0];
}

export function branch(st: BBState, nodeId: number, j: number): BBState {
  const s: BBState = { ...st, nodes: st.nodes.map((n) => ({ ...n, children: [...n.children] })), log: [...st.log] };
  const node = s.nodes.find((n) => n.id === nodeId)!;
  if (node.state !== 'open') return st;
  const v = node.x[j];
  const name = `x${j + 1}`;
  let specs: { label: string; lower: number[]; upper: number[] }[];
  if (s.model.binary[j]) {
    specs = [0, 1].map((val) => {
      const lower = [...node.lower];
      const upper = [...node.upper];
      lower[j] = val;
      upper[j] = val;
      return { label: `${name} = ${val}`, lower, upper };
    });
  } else {
    const fl = Math.floor(v + 1e-9);
    const lowU = [...node.upper];
    lowU[j] = Math.min(lowU[j], fl);
    const hiL = [...node.lower];
    hiL[j] = Math.max(hiL[j], fl + 1);
    specs = [
      { label: `${name} ≤ ${fl}`, lower: [...node.lower], upper: lowU },
      { label: `${name} ≥ ${fl + 1}`, lower: hiL, upper: [...node.upper] },
    ];
  }
  node.state = 'branched';
  node.branchVar = j;
  s.log.push(`Forgrener node ${node.id} på ${name} (verdi ${fmt(v)}).`);
  const kids = specs.map((sp) => makeNode(s, node.id, sp.label, node.depth + 1, sp.lower, sp.upper));
  for (const k of kids) {
    s.nodes.push(k);
    node.children.push(k.id);
    s.log.push(`  Node ${k.id} (${k.label}): ${describe(k)}${k.lpStatus === 'optimal' ? `, grense ${fmt(k.bound)}` : ''}.`);
  }
  for (const k of kids) evaluate(s, k);
  return s;
}

export function openNodes(st: BBState) {
  return st.nodes.filter((n) => n.state === 'open' && n.lpStatus === 'optimal');
}

/** course rule: most recently created; ties by larger bound */
export function selectNode(st: BBState): BBNode | null {
  const open = openNodes(st);
  if (!open.length) return null;
  // nodes created in the same branching share a parent; pick latest parent group
  const latestParent = open.reduce((best, n) => (n.createdAt > best.createdAt ? n : best), open[0]).parent;
  const group = open.filter((n) => n.parent === latestParent);
  return group.reduce((b, n) => (better(st.model, n.bound, b.bound) ? n : b), group[0]);
}

export function autoStep(st: BBState): BBState {
  const node = selectNode(st);
  if (!node) return st;
  const j = defaultBranchVar(st, node.id);
  if (j === null) return st;
  return branch(st, node.id, j);
}

export function solveAll(st: BBState, maxSteps = 500): BBState {
  let s = st;
  for (let k = 0; k < maxSteps; k++) {
    const next = autoStep(s);
    if (next === s) break;
    s = next;
  }
  return s;
}

export function isDone(st: BBState) {
  return openNodes(st).length === 0;
}

/** brute-force check for small pure-integer problems with bounded variables */
export function enumerateIP(model: IPModel, ub: number[]): { x: number[]; z: number } | null {
  const n = model.lp.c.length;
  let best: { x: number[]; z: number } | null = null;
  const x = new Array(n).fill(0);
  const rec = (j: number) => {
    if (j === n) {
      const ok = model.lp.cons.every((c) => {
        const v = c.a.reduce((s, a, k) => s + a * x[k], 0);
        return c.op === '<=' ? v <= c.b + 1e-9 : c.op === '>=' ? v >= c.b - 1e-9 : Math.abs(v - c.b) < 1e-9;
      });
      if (!ok) return;
      const z = model.lp.c.reduce((s, c, k) => s + c * x[k], 0);
      if (!best || better(model, z, best.z)) best = { x: [...x], z };
      return;
    }
    for (let v = 0; v <= ub[j]; v++) {
      x[j] = v;
      rec(j + 1);
    }
  };
  rec(0);
  return best;
}
