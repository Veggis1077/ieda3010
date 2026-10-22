/**
 * Two-phase primal simplex (dense tableau, Bland's rule) for small LPs.
 *
 * Supports: max/min, constraints with <=, >=, =, and per-variable sign
 * (nonnegative or free). Returns status, primal solution, objective value
 * and dual values y_i = dZ/db_i (marginal change of the optimal objective
 * per unit increase of the right-hand side, in the problem's own sense).
 */

export type Op = '<=' | '>=' | '=';
export type Sense = 'max' | 'min';

export interface LinCon {
  a: number[];
  op: Op;
  b: number;
}

export interface LP {
  sense: Sense;
  c: number[];
  cons: LinCon[];
  /** default: all variables nonnegative */
  free?: boolean[];
}

export type LPStatus = 'optimal' | 'infeasible' | 'unbounded';

export interface LPResult {
  status: LPStatus;
  x: number[];
  z: number;
  /** dZ/db_i for each constraint (only when optimal) */
  duals: number[];
  /** b_i - a_i x for <=, a_i x - b_i for >=, 0 for = */
  slack: number[];
  /** recession direction certifying unboundedness (original variables) */
  ray?: number[];
  iterations: number;
}

export const EPS = 1e-9;

function solveLinear(M: number[][], rhs: number[]): number[] | null {
  const n = M.length;
  const A = M.map((r, i) => [...r, rhs[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    if (Math.abs(A[piv][col]) < 1e-12) return null;
    [A[col], A[piv]] = [A[piv], A[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      if (f === 0) continue;
      for (let k = col; k <= n; k++) A[r][k] -= f * A[col][k];
    }
  }
  return A.map((r, i) => r[n] / r[i]);
}

export function solveLinearSystem(M: number[][], rhs: number[]) {
  return solveLinear(M, rhs);
}

export function solveLP(lp: LP): LPResult {
  const n = lp.c.length;
  const m = lp.cons.length;
  const free = lp.free ?? new Array(n).fill(false);
  // Column mapping: each original var -> one or two std columns
  const colOf: { pos: number; neg: number }[] = [];
  let nc = 0;
  for (let j = 0; j < n; j++) {
    const pos = nc++;
    const neg = free[j] ? nc++ : -1;
    colOf.push({ pos, neg });
  }
  const nStructural = nc;
  // normalize rows so b >= 0
  const rows = lp.cons.map((con) => {
    const flip = con.b < 0;
    const a = new Array(nStructural).fill(0);
    for (let j = 0; j < n; j++) {
      const v = (con.a[j] ?? 0) * (flip ? -1 : 1);
      a[colOf[j].pos] = v;
      if (colOf[j].neg >= 0) a[colOf[j].neg] = -v;
    }
    let op = con.op;
    if (flip && op !== '=') op = op === '<=' ? '>=' : '<=';
    return { a, op, b: Math.abs(con.b), flip };
  });
  // slack / surplus columns
  const slackCol: number[] = [];
  for (let i = 0; i < m; i++) slackCol.push(rows[i].op === '=' ? -1 : nc++);
  const artCol: number[] = [];
  for (let i = 0; i < m; i++) artCol.push(rows[i].op === '<=' ? -1 : nc++);
  const N = nc;
  const T: number[][] = rows.map((r, i) => {
    const row = new Array(N + 1).fill(0);
    for (let j = 0; j < nStructural; j++) row[j] = r.a[j];
    if (slackCol[i] >= 0) row[slackCol[i]] = r.op === '<=' ? 1 : -1;
    if (artCol[i] >= 0) row[artCol[i]] = 1;
    row[N] = r.b;
    return row;
  });
  const basis: number[] = rows.map((r, i) => (r.op === '<=' ? slackCol[i] : artCol[i]));
  const isArt = new Array(N).fill(false);
  artCol.forEach((c) => c >= 0 && (isArt[c] = true));

  // internal objective: maximize cmax . x
  const cStd = new Array(N).fill(0);
  const sgn = lp.sense === 'max' ? 1 : -1;
  for (let j = 0; j < n; j++) {
    cStd[colOf[j].pos] = sgn * lp.c[j];
    if (colOf[j].neg >= 0) cStd[colOf[j].neg] = -sgn * lp.c[j];
  }

  let iterations = 0;
  const pivot = (r: number, col: number) => {
    const p = T[r][col];
    for (let k = 0; k <= N; k++) T[r][k] /= p;
    for (let i = 0; i < m; i++) {
      if (i === r) continue;
      const f = T[i][col];
      if (Math.abs(f) < 1e-15) continue;
      for (let k = 0; k <= N; k++) T[i][k] -= f * T[r][k];
    }
    basis[r] = col;
    iterations++;
  };

  // run simplex maximizing obj (array over std columns); allowed(col) filters entering
  const run = (obj: number[], allowed: (c: number) => boolean): 'optimal' | { unboundedCol: number } => {
    for (let guard = 0; guard < 5000; guard++) {
      // reduced costs: obj_j - obj_B B^-1 A_j  (tableau already holds B^-1 A)
      let enter = -1;
      for (let j = 0; j < N; j++) {
        if (!allowed(j) || basis.includes(j)) continue;
        let rc = obj[j];
        for (let i = 0; i < m; i++) rc -= obj[basis[i]] * T[i][j];
        if (rc > 1e-9) {
          enter = j; // Bland: smallest index
          break;
        }
      }
      if (enter < 0) return 'optimal';
      let leave = -1;
      let best = Infinity;
      for (let i = 0; i < m; i++) {
        if (T[i][enter] > 1e-9) {
          const ratio = T[i][N] / T[i][enter];
          if (ratio < best - 1e-12 || (Math.abs(ratio - best) <= 1e-12 && basis[i] < basis[leave])) {
            best = ratio;
            leave = i;
          }
        }
      }
      if (leave < 0) return { unboundedCol: enter };
      pivot(leave, enter);
    }
    return 'optimal';
  };

  // Phase 1
  const hasArt = artCol.some((c) => c >= 0);
  if (hasArt) {
    const obj1 = new Array(N).fill(0);
    for (let j = 0; j < N; j++) if (isArt[j]) obj1[j] = -1;
    run(obj1, () => true);
    let infeas = 0;
    for (let i = 0; i < m; i++) if (isArt[basis[i]]) infeas += T[i][N];
    if (infeas > 1e-7) {
      return { status: 'infeasible', x: new Array(n).fill(NaN), z: NaN, duals: [], slack: [], iterations };
    }
    // drive artificials out of basis where possible
    for (let i = 0; i < m; i++) {
      if (!isArt[basis[i]]) continue;
      for (let j = 0; j < N; j++) {
        if (!isArt[j] && Math.abs(T[i][j]) > 1e-9) {
          pivot(i, j);
          break;
        }
      }
    }
  }
  // Phase 2
  const res = run(cStd, (j) => !isArt[j]);
  const xStd = new Array(N).fill(0);
  for (let i = 0; i < m; i++) xStd[basis[i]] = T[i][N];
  const x = colOf.map(({ pos, neg }) => clean(xStd[pos] - (neg >= 0 ? xStd[neg] : 0)));
  if (res !== 'optimal') {
    const e = res.unboundedCol;
    const dStd = new Array(N).fill(0);
    dStd[e] = 1;
    for (let i = 0; i < m; i++) dStd[basis[i]] = -T[i][e];
    const ray = colOf.map(({ pos, neg }) => dStd[pos] - (neg >= 0 ? dStd[neg] : 0));
    return { status: 'unbounded', x, z: lp.sense === 'max' ? Infinity : -Infinity, duals: [], slack: [], ray, iterations };
  }
  const z = clean(lp.c.reduce((s, cj, j) => s + cj * x[j], 0));
  // duals from final basis: B^T y = c_B (in normalized rows, max form)
  const B = Array.from({ length: m }, (_, r) => basis.map((col) => origColumn(r, col)));
  function origColumn(r: number, col: number) {
    if (col < nStructural) return rows[r].a[col];
    const si = slackCol.indexOf(col);
    if (si >= 0) return si === r ? (rows[r].op === '<=' ? 1 : -1) : 0;
    const ai = artCol.indexOf(col);
    return ai === r ? 1 : 0;
  }
  const BT = B[0] ? B[0].map((_, j) => B.map((row) => row[j])) : [];
  const cB = basis.map((col) => (isArt[col] ? 0 : cStd[col]));
  const y = m > 0 ? solveLinear(BT, cB) ?? new Array(m).fill(0) : [];
  const duals = y.map((yi, i) => clean(sgn * yi * (rows[i].flip ? -1 : 1)));
  const slack = lp.cons.map((con) => {
    const lhs = con.a.reduce((s, a, j) => s + a * x[j], 0);
    return clean(con.op === '<=' ? con.b - lhs : con.op === '>=' ? lhs - con.b : 0);
  });
  return { status: 'optimal', x, z, duals, slack, iterations };
}

export function clean(v: number) {
  if (!isFinite(v)) return v;
  const r = Math.round(v);
  if (Math.abs(v - r) < 1e-9) return r === 0 ? 0 : r;
  return Math.abs(v) < 1e-12 ? 0 : v;
}

export function lhs(con: LinCon, x: number[]) {
  return con.a.reduce((s, a, j) => s + a * (x[j] ?? 0), 0);
}

export function satisfies(con: LinCon, x: number[], tol = 1e-7) {
  const v = lhs(con, x);
  const t = tol * (1 + Math.abs(con.b));
  if (con.op === '<=') return v <= con.b + t;
  if (con.op === '>=') return v >= con.b - t;
  return Math.abs(v - con.b) <= t;
}
