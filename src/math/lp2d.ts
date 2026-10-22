/**
 * Geometry of two-variable LPs: vertices (extreme points), drawable feasible
 * polygon, classification (unique / multiple / unbounded / infeasible),
 * binding constraints, degeneracy and redundancy.
 *
 * Classification never depends on the plotting window: boundedness and
 * optimality are decided by the simplex solver on the exact model.
 */
import { LP, LinCon, Op, Sense, solveLP, satisfies, lhs, clean } from './simplex';

export type Pt = [number, number];

export interface Constraint2D {
  id: string;
  a1: number;
  a2: number;
  op: Op;
  b: number;
  label?: string;
}

export interface Model2D {
  sense: Sense;
  c1: number;
  c2: number;
  constraints: Constraint2D[];
  /** include x1 >= 0, x2 >= 0 */
  nonneg: boolean;
}

export interface Vertex {
  p: Pt;
  /** ids of constraints (incl. 'x1>=0','x2>=0') active at p */
  active: string[];
  z: number;
}

export type Classification =
  | 'unique'
  | 'multiple-edge'
  | 'multiple-ray'
  | 'all-feasible'
  | 'unbounded'
  | 'infeasible';

export interface Analysis2D {
  status: 'optimal' | 'infeasible' | 'unbounded';
  classification: Classification;
  allCons: Constraint2D[];
  vertices: Vertex[];
  regionBounded: boolean;
  /** an optimal point (simplex) */
  xStar?: Pt;
  zStar?: number;
  /** optimal set: segment endpoints (edge), or start + direction for a ray */
  optimalVertices: Vertex[];
  optimalRay?: { from: Pt; dir: Pt };
  binding: string[];
  slack: Record<string, number>;
  duals: Record<string, number>;
  redundant: string[];
  degenerateVertices: Vertex[];
  unboundedDir?: Pt;
}

export const NONNEG: Constraint2D[] = [
  { id: 'x1>=0', a1: 1, a2: 0, op: '>=', b: 0, label: 'x_1 \\ge 0' },
  { id: 'x2>=0', a1: 0, a2: 1, op: '>=', b: 0, label: 'x_2 \\ge 0' },
];

export function allConstraints(m: Model2D): Constraint2D[] {
  return m.nonneg ? [...m.constraints, ...NONNEG] : m.constraints;
}

const toLin = (c: Constraint2D): LinCon => ({ a: [c.a1, c.a2], op: c.op, b: c.b });

export function toLP(m: Model2D, extra: LinCon[] = []): LP {
  return {
    sense: m.sense,
    c: [m.c1, m.c2],
    cons: [...allConstraints(m).map(toLin), ...extra],
    free: [true, true],
  };
}

export function intersect(c: Constraint2D, d: Constraint2D): Pt | null {
  const det = c.a1 * d.a2 - c.a2 * d.a1;
  const scale = Math.hypot(c.a1, c.a2) * Math.hypot(d.a1, d.a2);
  if (scale === 0 || Math.abs(det) < 1e-12 * scale) return null;
  const x = (c.b * d.a2 - c.a2 * d.b) / det;
  const y = (c.a1 * d.b - c.b * d.a1) / det;
  return [clean(x), clean(y)];
}

export function isActive(c: Constraint2D, p: Pt, tol = 1e-7) {
  const v = c.a1 * p[0] + c.a2 * p[1];
  return Math.abs(v - c.b) <= tol * (1 + Math.abs(c.b) + Math.hypot(c.a1, c.a2) * Math.hypot(p[0], p[1]));
}

export function feasible(cons: Constraint2D[], p: Pt, tol = 1e-7) {
  return cons.every((c) => {
    if (c.a1 === 0 && c.a2 === 0) return satisfies(toLin(c), p, tol);
    const scale = Math.hypot(c.a1, c.a2);
    const v = (c.a1 * p[0] + c.a2 * p[1] - c.b) / scale;
    const t = tol * (1 + Math.abs(c.b) / scale + Math.hypot(p[0], p[1]));
    if (c.op === '<=') return v <= t;
    if (c.op === '>=') return v >= -t;
    return Math.abs(v) <= t;
  });
}

export function computeVertices(cons: Constraint2D[], c1: number, c2: number): Vertex[] {
  const out: Vertex[] = [];
  for (let i = 0; i < cons.length; i++)
    for (let j = i + 1; j < cons.length; j++) {
      const p = intersect(cons[i], cons[j]);
      if (!p || !feasible(cons, p)) continue;
      if (out.some((v) => Math.hypot(v.p[0] - p[0], v.p[1] - p[1]) < 1e-7 * (1 + Math.hypot(p[0], p[1])))) continue;
      const active = cons.filter((c) => isActive(c, p)).map((c) => c.id);
      out.push({ p, active, z: clean(c1 * p[0] + c2 * p[1]) });
    }
  return out;
}

/** Sutherland–Hodgman clip of a polygon by a half-plane a.x <= b */
function clipHalf(poly: Pt[], a1: number, a2: number, b: number): Pt[] {
  if (poly.length === 0) return poly;
  const out: Pt[] = [];
  const inside = (p: Pt) => a1 * p[0] + a2 * p[1] <= b + 1e-9 * (1 + Math.abs(b));
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i];
    const Q = poly[(i + 1) % poly.length];
    const pin = inside(P);
    const qin = inside(Q);
    if (pin) out.push(P);
    if (pin !== qin) {
      const fp = a1 * P[0] + a2 * P[1] - b;
      const fq = a1 * Q[0] + a2 * Q[1] - b;
      const t = fp / (fp - fq);
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
    }
  }
  return out;
}

/** Feasible region clipped to a (drawing) box. Equalities give a segment. */
export function clippedRegion(cons: Constraint2D[], box: { x0: number; x1: number; y0: number; y1: number }): Pt[] {
  let poly: Pt[] = [
    [box.x0, box.y0],
    [box.x1, box.y0],
    [box.x1, box.y1],
    [box.x0, box.y1],
  ];
  for (const c of cons) {
    if (c.op === '<=' || c.op === '=') poly = clipHalf(poly, c.a1, c.a2, c.b);
    if (c.op === '>=' || c.op === '=') poly = clipHalf(poly, -c.a1, -c.a2, -c.b);
    if (poly.length === 0) break;
  }
  return poly;
}

export function analyze(m: Model2D): Analysis2D {
  const cons = allConstraints(m);
  const lp = toLP(m);
  const r = solveLP(lp);
  const vertices = computeVertices(cons, m.c1, m.c2);
  const regionBounded = isRegionBounded(m);
  const base: Analysis2D = {
    status: r.status,
    classification: r.status === 'optimal' ? 'unique' : r.status,
    allCons: cons,
    vertices,
    regionBounded,
    optimalVertices: [],
    binding: [],
    slack: {},
    duals: {},
    redundant: [],
    degenerateVertices: vertices.filter((v) => v.active.length > 2),
  };
  if (r.status === 'infeasible') return base;
  base.redundant = findRedundant(m);
  if (r.status === 'unbounded') {
    base.unboundedDir = r.ray ? [r.ray[0], r.ray[1]] : undefined;
    return base;
  }
  const xStar: Pt = [r.x[0], r.x[1]];
  base.xStar = xStar;
  base.zStar = r.z;
  cons.forEach((c, i) => {
    base.slack[c.id] = r.slack[i];
    base.duals[c.id] = r.duals[i];
  });
  base.binding = cons.filter((c) => isActive(c, xStar)).map((c) => c.id);

  if (m.c1 === 0 && m.c2 === 0) {
    base.classification = 'all-feasible';
    base.optimalVertices = vertices;
    return base;
  }
  // optimal face: {x in P : c.x = z*}; explore along d = (-c2, c1)
  const face: LinCon = { a: [m.c1, m.c2], op: '=', b: r.z };
  const d: Pt = [-m.c2, m.c1];
  const hi = solveLP({ ...toLP(m, [face]), sense: 'max', c: d });
  const lo = solveLP({ ...toLP(m, [face]), sense: 'min', c: d });
  const tol = 1e-7 * (1 + Math.abs(r.z));
  const optV = vertices.filter((v) => Math.abs(v.z - r.z) <= tol);
  base.optimalVertices = optV;
  if (hi.status === 'unbounded' || lo.status === 'unbounded') {
    base.classification = 'multiple-ray';
    const from: Pt =
      hi.status === 'unbounded' ? (lo.status === 'optimal' ? [lo.x[0], lo.x[1]] : xStar) : [hi.x[0], hi.x[1]];
    const dir: Pt = hi.status === 'unbounded' ? d : [-d[0], -d[1]];
    base.optimalRay = { from, dir };
  } else if (hi.status === 'optimal' && lo.status === 'optimal' && Math.abs(hi.z - lo.z) > 1e-7 * (1 + Math.abs(hi.z))) {
    base.classification = 'multiple-edge';
    const pA: Pt = [lo.x[0], lo.x[1]];
    const pB: Pt = [hi.x[0], hi.x[1]];
    const pick = (p: Pt) =>
      optV.find((v) => Math.hypot(v.p[0] - p[0], v.p[1] - p[1]) < 1e-6 * (1 + Math.hypot(p[0], p[1]))) ?? {
        p,
        active: cons.filter((c) => isActive(c, p)).map((c) => c.id),
        z: r.z,
      };
    base.optimalVertices = [pick(pA), pick(pB)];
  }
  return base;
}

export function isRegionBounded(m: Model2D): boolean {
  const lp = toLP(m);
  for (const c of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const r = solveLP({ ...lp, sense: 'max', c });
    if (r.status === 'unbounded') return false;
    if (r.status === 'infeasible') return true;
  }
  return true;
}

/** constraint is redundant if removing it does not change the feasible region */
export function findRedundant(m: Model2D): string[] {
  const cons = allConstraints(m);
  const out: string[] = [];
  cons.forEach((c, i) => {
    const others = cons.filter((_, k) => k !== i);
    const lp: LP = { sense: 'max', c: [c.a1, c.a2], cons: others.map(toLin), free: [true, true] };
    const tol = 1e-7 * (1 + Math.abs(c.b));
    let red = true;
    if (c.op === '<=' || c.op === '=') {
      const r = solveLP(lp);
      if (r.status !== 'optimal' || r.z > c.b + tol) red = false;
    }
    if (red && (c.op === '>=' || c.op === '=')) {
      const r = solveLP({ ...lp, sense: 'min' });
      if (r.status !== 'optimal' || r.z < c.b - tol) red = false;
    }
    if (red) out.push(c.id);
  });
  return out;
}

export function objectiveAt(m: Model2D, p: Pt) {
  return m.c1 * p[0] + m.c2 * p[1];
}

export function conLhs(c: Constraint2D, p: Pt) {
  return lhs(toLin(c), p);
}
