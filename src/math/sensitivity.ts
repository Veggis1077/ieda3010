/**
 * Sensitivity analysis by exact re-solving (no tableau bookkeeping):
 *  - rhsRange: interval of b_i on which the optimal value is affine with
 *    slope = current shadow price (binding set unchanged, course definition).
 *  - costRange: interval of c_j on which the current optimal solution
 *    remains optimal.
 * Both sets are intervals (concavity/convexity of the value function and
 * convexity of optimality cones), so expansion + bisection is exact up to
 * floating-point tolerance.
 */
import { LP, LPResult, solveLP, clean } from './simplex';

const CAP = 1e7;

function findInterval(t0: number, ok: (t: number) => boolean): [number, number] {
  const side = (dir: 1 | -1) => {
    let good = t0;
    let step = 1e-3 * (1 + Math.abs(t0));
    let bad: number | null = null;
    while (Math.abs(good - t0) < CAP) {
      const t = t0 + dir * step;
      if (ok(t)) {
        good = t;
        step *= 2;
      } else {
        bad = t;
        break;
      }
    }
    if (bad === null) return dir * Infinity;
    let b: number = bad;
    for (let k = 0; k < 80; k++) {
      const mid: number = (good + b) / 2;
      if (ok(mid)) good = mid;
      else b = mid;
    }
    return snap(good);
  };
  return [side(-1), side(1)];
}

/** snap to nearby simple fraction (denominator <= 64) */
export function snap(v: number): number {
  if (!isFinite(v)) return v;
  for (let d = 1; d <= 64; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-7 * (1 + Math.abs(v))) return n / d;
  }
  return clean(v);
}

export function withRhs(lp: LP, i: number, t: number): LP {
  return { ...lp, cons: lp.cons.map((c, k) => (k === i ? { ...c, b: t } : c)) };
}

export function withCost(lp: LP, j: number, t: number): LP {
  return { ...lp, c: lp.c.map((cj, k) => (k === j ? t : cj)) };
}

export interface RhsRange {
  shadow: number;
  lo: number;
  hi: number;
  /** current rhs */
  b0: number;
}

export function rhsRange(lp: LP, i: number, base?: LPResult): RhsRange | null {
  const r0 = base ?? solveLP(lp);
  if (r0.status !== 'optimal') return null;
  const b0 = lp.cons[i].b;
  const y = r0.duals[i];
  const ok = (t: number) => {
    const r = solveLP(withRhs(lp, i, t));
    if (r.status !== 'optimal') return false;
    const pred = r0.z + y * (t - b0);
    return Math.abs(r.z - pred) <= 1e-10 * (1 + Math.abs(pred));
  };
  const [lo, hi] = findInterval(b0, ok);
  return { shadow: snap(y), lo, hi, b0 };
}

export interface CostRange {
  lo: number;
  hi: number;
  c0: number;
}

export function costRange(lp: LP, j: number, base?: LPResult): CostRange | null {
  const r0 = base ?? solveLP(lp);
  if (r0.status !== 'optimal') return null;
  const x = r0.x;
  const c0 = lp.c[j];
  const ok = (t: number) => {
    const lp2 = withCost(lp, j, t);
    const r = solveLP(lp2);
    if (r.status !== 'optimal') return false;
    const val = lp2.c.reduce((s, c, k) => s + c * x[k], 0);
    return Math.abs(r.z - val) <= 1e-10 * (1 + Math.abs(val));
  };
  const [lo, hi] = findInterval(c0, ok);
  return { lo, hi, c0 };
}

export interface ParamPoint {
  t: number;
  z: number | null; // null = infeasible
  unbounded?: boolean;
  x?: number[];
}

export function parametricRhs(lp: LP, i: number, t0: number, t1: number, n = 241): ParamPoint[] {
  const out: ParamPoint[] = [];
  for (let k = 0; k < n; k++) {
    const t = t0 + ((t1 - t0) * k) / (n - 1);
    const r = solveLP(withRhs(lp, i, t));
    out.push({
      t,
      z: r.status === 'optimal' ? r.z : null,
      unbounded: r.status === 'unbounded',
      x: r.status === 'optimal' ? r.x : undefined,
    });
  }
  return out;
}

/** breakpoints of z*(b_i) in [t0,t1]: points where slope changes */
export function rhsBreakpoints(lp: LP, i: number, t0: number, t1: number): number[] {
  const pts: number[] = [];
  let t = t0;
  let guard = 0;
  while (t < t1 && guard++ < 50) {
    const r = solveLP(withRhs(lp, i, t + 1e-9));
    if (r.status !== 'optimal') {
      // jump to feasibility start
      const samples = parametricRhs(lp, i, t, t1, 400);
      const firstFeas = samples.find((s) => s.z !== null);
      if (!firstFeas || firstFeas.t <= t) break;
      // bisect transition
      let a = t;
      let b = firstFeas.t;
      for (let k = 0; k < 60; k++) {
        const mid = (a + b) / 2;
        if (solveLP(withRhs(lp, i, mid)).status === 'optimal') b = mid;
        else a = mid;
      }
      t = snap(b);
      pts.push(t);
      continue;
    }
    const rr = rhsRange(withRhs(lp, i, t + 1e-6 * (1 + Math.abs(t))), i);
    if (!rr || !isFinite(rr.hi) || rr.hi >= t1) break;
    if (rr.hi <= t + 1e-9) {
      t += 1e-4 * (1 + Math.abs(t));
      continue;
    }
    pts.push(rr.hi);
    t = rr.hi;
  }
  return pts.filter((p, k) => k === 0 || Math.abs(p - pts[k - 1]) > 1e-7);
}
