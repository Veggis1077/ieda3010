/**
 * Construct the dual of an LP (variables nonnegative or free).
 * Course: max {c'x : Ax <= b, x >= 0}  <->  min {b'y : A'y >= c, y >= 0}.
 * General sign rules (supplementary, "SOB"-table) are applied for other forms.
 */
import { LP, Op } from './simplex';

export type VarSign = '>=0' | '<=0' | 'free';

export interface DualLP {
  lp: LP; // with all dual variables represented; sign handled via cons + free
  varSigns: VarSign[];
  /** explanation of each dual variable sign */
  signReason: string[];
  consReason: string[];
}

export function buildDual(p: LP): DualLP {
  const m = p.cons.length;
  const n = p.c.length;
  const free = p.free ?? new Array(n).fill(false);
  const isMax = p.sense === 'max';
  const varSigns: VarSign[] = p.cons.map((c) => {
    if (c.op === '=') return 'free';
    // max: <= -> y>=0 ; >= -> y<=0.  min: >= -> y>=0 ; <= -> y<=0
    if (isMax) return c.op === '<=' ? '>=0' : '<=0';
    return c.op === '>=' ? '>=0' : '<=0';
  });
  const signReason = p.cons.map((c, i) => {
    const s = varSigns[i];
    return `Primal ${isMax ? 'max' : 'min'}, restriksjon ${i + 1} er «${c.op === '<=' ? '≤' : c.op === '>=' ? '≥' : '='}» ⇒ y${i + 1} ${s === 'free' ? 'fri (ubegrenset i fortegn)' : s === '>=0' ? '≥ 0' : '≤ 0'}`;
  });
  const consOps: Op[] = free.map((f) => (f ? '=' : isMax ? '>=' : '<='));
  const consReason = free.map(
    (f, j) => `x${j + 1} ${f ? 'fri' : '≥ 0'} ⇒ dual restriksjon ${j + 1} er «${consOps[j] === '=' ? '=' : consOps[j] === '>=' ? '≥' : '≤'}»`,
  );
  // represent y<=0 by substituting nothing: we keep y as variables with explicit sign constraints
  const cons = Array.from({ length: n }, (_, j) => ({
    a: p.cons.map((c) => c.a[j] ?? 0),
    op: consOps[j],
    b: p.c[j],
  }));
  const signCons = varSigns.flatMap((s, i) =>
    s === '<=0' ? [{ a: unitVec(m, i), op: '<=' as Op, b: 0 }] : [],
  );
  return {
    lp: {
      sense: isMax ? 'min' : 'max',
      c: p.cons.map((c) => c.b),
      cons: [...cons, ...signCons],
      free: varSigns.map((s) => s !== '>=0'),
    },
    varSigns,
    signReason,
    consReason,
  };
}

function unitVec(m: number, i: number) {
  const a = new Array(m).fill(0);
  a[i] = 1;
  return a;
}
