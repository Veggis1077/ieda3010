import { describe, it, expect } from 'vitest';
import { solveLP, LP } from './simplex';
import { analyze, Model2D } from './lp2d';
import { rhsRange, costRange } from './sensitivity';
import { buildDual } from './dual';
import { initBB, solveAll, enumerateIP, IPModel, fmt } from './bnb';
import { parseRelation, relationsEquivalent, parseNumber, checkFormulation } from './linparse';

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

const wyndor: LP = {
  sense: 'max',
  c: [3, 5],
  cons: [
    { a: [1, 0], op: '<=', b: 4 },
    { a: [0, 2], op: '<=', b: 12 },
    { a: [3, 2], op: '<=', b: 18 },
  ],
};
const lego: LP = {
  sense: 'max',
  c: [40, 50],
  cons: [
    { a: [1, 2], op: '<=', b: 10 },
    { a: [4, 3], op: '<=', b: 30 },
  ],
};

const m2 = (sense: 'max' | 'min', c1: number, c2: number, cons: [number, number, '<=' | '>=' | '=', number][], nonneg = true): Model2D => ({
  sense,
  c1,
  c2,
  nonneg,
  constraints: cons.map(([a1, a2, op, b], i) => ({ id: `c${i + 1}`, a1, a2, op, b })),
});

describe('simplex', () => {
  it('solves Wyndor with course shadow prices', () => {
    const r = solveLP(wyndor);
    expect(r.status).toBe('optimal');
    expect(r.x).toEqual([2, 6]);
    expect(r.z).toBe(36);
    expect(r.duals).toEqual([0, 1.5, 1]);
  });
  it('solves the Lego game (6,2), profit 340, shadow prices 16 and 6', () => {
    const r = solveLP(lego);
    expect(r.x).toEqual([6, 2]);
    expect(r.z).toBe(340);
    expect(r.duals).toEqual([16, 6]);
  });
  it('handles min with >= (LO practice 4)', () => {
    const p: LP = {
      sense: 'min',
      c: [40, 50],
      cons: [
        { a: [2, 3], op: '>=', b: 30 },
        { a: [1, 1], op: '>=', b: 12 },
        { a: [2, 1], op: '>=', b: 20 },
      ],
    };
    const r = solveLP(p);
    close(r.x[0], 7.5);
    close(r.x[1], 5);
    close(r.z, 550);
    expect(solveLP({ ...p, c: [40, 70] }).z).toBe(600);
    const r3 = solveLP({ ...p, cons: [p.cons[0], p.cons[1], { a: [2, 1], op: '>=', b: 15 }] });
    expect(r3.x).toEqual([6, 6]);
    expect(r3.z).toBe(540);
    // min problem: increasing a >= requirement raises cost -> dual >= 0 in dZ/db sense
    expect(r.duals.every((y) => y >= -1e-9)).toBe(true);
  });
  it('detects infeasibility (LO practice 7) and dual unboundedness', () => {
    const p: LP = {
      sense: 'max',
      c: [1, 2],
      cons: [
        { a: [-1, 1], op: '<=', b: -2 },
        { a: [4, 1], op: '<=', b: 4 },
      ],
    };
    expect(solveLP(p).status).toBe('infeasible');
    const d = buildDual(p);
    expect(d.lp.sense).toBe('min');
    expect(d.lp.c).toEqual([-2, 4]);
    expect(solveLP(d.lp).status).toBe('unbounded');
  });
  it('detects unboundedness (LO practice 3c) and optimum (3b)', () => {
    const cons = [
      { a: [-1, 3], op: '<=' as const, b: 30 },
      { a: [-3, 1], op: '<=' as const, b: 30 },
    ];
    const b = solveLP({ sense: 'max', c: [-1, 1], cons });
    expect(b.status).toBe('optimal');
    expect(b.x).toEqual([0, 10]);
    expect(b.z).toBe(10);
    expect(solveLP({ sense: 'max', c: [1, -1], cons }).status).toBe('unbounded');
  });
  it('handles equality and free variables', () => {
    const r = solveLP({ sense: 'min', c: [1, 1], cons: [{ a: [1, -1], op: '=', b: 3 }], free: [true, true] });
    expect(r.status).toBe('unbounded');
    const r2 = solveLP({
      sense: 'min',
      c: [0.4, 0.5],
      cons: [
        { a: [0.3, 0.1], op: '<=', b: 2.7 },
        { a: [0.5, 0.5], op: '=', b: 6 },
        { a: [0.6, 0.4], op: '>=', b: 6 },
      ],
    });
    // Radiation therapy (Hillier & Lieberman): x = (7.5, 4.5), Z = 5.25
    close(r2.x[0], 7.5);
    close(r2.x[1], 4.5);
    close(r2.z, 5.25);
  });
  it('midterm Q2 primal and dual have equal optimal values', () => {
    const p: LP = {
      sense: 'max',
      c: [360, 180, 120, 40],
      cons: [
        { a: [60, 10, 20, 10], op: '<=', b: 1000 },
        { a: [30, 20, 20, 5], op: '<=', b: 800 },
      ],
    };
    const r = solveLP(p);
    const d = solveLP(buildDual(p).lp);
    close(r.z, d.z);
    close(r.z, 8400);
    close(d.x[0], 2);
    close(d.x[1], 8);
  });
});

describe('2D geometry', () => {
  it('unique optimum and binding constraints (midterm Q1)', () => {
    const a = analyze(m2('max', 2, 5, [[1, 2, '<=', 80], [1, 3, '<=', 90]]));
    expect(a.classification).toBe('unique');
    expect(a.xStar).toEqual([60, 10]);
    expect(a.zStar).toBe(170);
    expect(a.binding.sort()).toEqual(['c1', 'c2']);
    expect(a.vertices.length).toBe(4);
  });
  it('multiple optima along an edge (midterm Q1c)', () => {
    const a = analyze(m2('max', 2, 4, [[1, 2, '<=', 80], [1, 3, '<=', 90]]));
    expect(a.classification).toBe('multiple-edge');
    const pts = a.optimalVertices.map((v) => v.p).sort((p, q) => p[0] - q[0]);
    expect(pts).toEqual([
      [60, 10],
      [80, 0],
    ]);
    expect(a.zStar).toBe(160);
  });
  it('slide example max 2x1+x2 has multiple optima', () => {
    const a = analyze(m2('max', 2, 1, [[1, 2, '<=', 3], [2, 1, '<=', 3]]));
    expect(a.classification).toBe('multiple-edge');
  });
  it('unbounded problem is not misclassified by plot window', () => {
    const a = analyze(m2('max', 1, 1, [[-1, 2, '<=', 2], [1, -2, '<=', 2]]));
    expect(a.status).toBe('unbounded');
    expect(a.regionBounded).toBe(false);
  });
  it('unbounded region but finite optimum', () => {
    const a = analyze(m2('max', -1, 1, [[-1, 3, '<=', 30], [-3, 1, '<=', 30]]));
    expect(a.classification).toBe('unique');
    expect(a.regionBounded).toBe(false);
  });
  it('optimal ray', () => {
    const a = analyze(m2('max', -1, 1, [[-1, 1, '<=', 1]]));
    expect(a.classification).toBe('multiple-ray');
    expect(a.zStar).toBe(1);
  });
  it('infeasible', () => {
    const a = analyze(m2('max', 1, 2, [[-1, 1, '<=', -2], [4, 1, '<=', 4]]));
    expect(a.status).toBe('infeasible');
  });
  it('degeneracy and redundancy', () => {
    const a = analyze(m2('max', 3, 5, [[1, 0, '<=', 4], [0, 2, '<=', 12], [3, 2, '<=', 18], [1, 1, '<=', 8]]));
    expect(a.degenerateVertices.some((v) => v.p[0] === 2 && v.p[1] === 6)).toBe(true);
    expect(a.redundant).toContain('c4');
    const b = analyze(m2('max', 40, 50, [[1, 2, '<=', 10], [4, 3, '<=', 30], [1, 0, '<=', 100]]));
    expect(b.redundant).toEqual(['c3']);
  });
  it('equality constraint gives segment feasible set', () => {
    const a = analyze(m2('max', 1, 0, [[1, 1, '=', 4]]));
    expect(a.xStar).toEqual([4, 0]);
  });
});

describe('sensitivity', () => {
  it('Lego: small brick shadow price 6 valid on [15, 40]', () => {
    const r = rhsRange(lego, 1)!;
    expect(r.shadow).toBe(6);
    close(r.lo, 15);
    close(r.hi, 40);
  });
  it('Lego: chair price range [25, 66 2/3]', () => {
    const c = costRange(lego, 0)!;
    close(c.lo, 25);
    close(c.hi, 200 / 3);
  });
  it('Midterm Q1d: c2 in [4, 6]', () => {
    const p: LP = { sense: 'max', c: [2, 5], cons: [{ a: [1, 2], op: '<=', b: 80 }, { a: [1, 3], op: '<=', b: 90 }] };
    const c = costRange(p, 1)!;
    close(c.lo, 4);
    close(c.hi, 6);
  });
  it('HW1 P4: machine time range [40,160], shadow price 20', () => {
    const p: LP = { sense: 'max', c: [50, 40], cons: [{ a: [2, 1], op: '<=', b: 100 }, { a: [1, 2], op: '<=', b: 80 }] };
    const r = rhsRange(p, 0)!;
    expect(r.shadow).toBe(20);
    close(r.lo, 40);
    close(r.hi, 160);
    const at190 = solveLP({ ...p, cons: [{ a: [2, 1], op: '<=', b: 190 }, p.cons[1]] });
    expect(at190.x).toEqual([80, 0]);
    expect(at190.z).toBe(4000);
  });
  it('nonbinding constraint has zero shadow price and range [lhs, inf)', () => {
    const r = rhsRange(wyndor, 0)!;
    expect(r.shadow).toBe(0);
    close(r.lo, 2);
    expect(r.hi).toBe(Infinity);
  });
});

describe('branch and bound', () => {
  it('reproduces lecture BIP example', () => {
    const model: IPModel = {
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
      integer: [true, true, true, true],
      binary: [true, true, true, true],
    };
    const st = initBB(model);
    expect(st.nodes[0].x.map(fmt)).toEqual(['5/6', '1', '0', '1']);
    expect(st.nodes[0].lpValue).toBe(16.5);
    expect(st.nodes[0].bound).toBe(16);
    const done = solveAll(st);
    expect(done.incumbent!.x).toEqual([1, 1, 0, 0]);
    expect(done.incumbent!.z).toBe(14);
    // lecture tree: All, Sub1..Sub6 and the two children of Sub5 (iteration 4)
    expect(done.nodes.length).toBe(9);
  });
  it('reproduces lecture MIP example', () => {
    const model: IPModel = {
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
    };
    const st = initBB(model);
    close(st.nodes[0].lpValue, 14.25);
    const done = solveAll(st);
    expect(done.incumbent!.x.map((v) => +v.toFixed(6))).toEqual([0, 0, 2, 0.5]);
    close(done.incumbent!.z, 13.5);
    expect(done.nodes.length).toBe(7);
  });
  it('DO practice 4 optimum (0,0,1,1,1) Z=6', () => {
    const model: IPModel = {
      lp: {
        sense: 'max',
        c: [2, -1, 5, -3, 4],
        cons: [
          { a: [3, -2, 7, -5, 4], op: '<=', b: 6 },
          { a: [1, -1, 2, -4, 2], op: '<=', b: 0 },
        ],
      },
      integer: new Array(5).fill(true),
      binary: new Array(5).fill(true),
    };
    const st = initBB(model, { roundBound: false });
    close(st.nodes[0].lpValue, 19 / 3);
    const done = solveAll(st);
    expect(done.incumbent!.z).toBe(6);
    expect(done.incumbent!.x).toEqual([0, 0, 1, 1, 1]);
  });
  it('Vincent (DO practice 2): (0,5), 750 matches enumeration', () => {
    const model: IPModel = {
      lp: {
        sense: 'max',
        c: [130, 150],
        cons: [
          { a: [3.2, 2.4], op: '<=', b: 16 },
          { a: [2, 3], op: '<=', b: 15 },
        ],
      },
      integer: [true, true],
      binary: [false, false],
    };
    const done = solveAll(initBB(model));
    expect(done.incumbent!.z).toBe(750);
    expect(enumerateIP(model, [10, 10])!.z).toBe(750);
  });
});

describe('expression checking', () => {
  it('recognises equivalent constraints', () => {
    const a = parseRelation('3x1 + 2x2 <= 18 + M y1', ['x1', 'x2', 'y1', 'M']);
    const b = parseRelation('6x_1+4x_2-2My1 ≤ 36', ['x1', 'x2', 'y1', 'M']);
    expect(relationsEquivalent(a, b)).toBe(true);
    const c = parseRelation('-3x1 - 2x2 >= -18 - M*y1', ['x1', 'x2', 'y1', 'M']);
    expect(relationsEquivalent(a, c)).toBe(true);
    const d = parseRelation('3x1 + 2x2 >= 18 + M y1', ['x1', 'x2', 'y1', 'M']);
    expect(relationsEquivalent(a, d)).toBe(false);
    const e = parseRelation('x3 <= x1', ['x1', 'x3']);
    const f = parseRelation('-x1 + x3 <= 0', ['x1', 'x3']);
    expect(relationsEquivalent(e, f)).toBe(true);
  });
  it('parses numbers', () => {
    expect(parseNumber('16 1/2')).toBe(16.5);
    expect(parseNumber('33/2')).toBe(16.5);
    expect(parseNumber('−2/3')).toBeCloseTo(-2 / 3);
    expect(parseNumber('1,000')).toBe(1000);
    expect(parseNumber('2.5')).toBe(2.5);
    expect(parseNumber('abc')).toBe(null);
  });
  it('checks a formulation', () => {
    const fb = checkFormulation('max Z = 2x1 + 5x2\ns.t. x1 + 2x2 <= 80\n x1+3x2<=90\n x1, x2 >= 0', {
      vars: ['x1', 'x2'],
      objective: { sense: 'max', expr: '2x1+5x2' },
      constraints: ['x1+2x2<=80', 'x1+3x2<=90'],
      nonneg: ['x1', 'x2'],
    });
    expect(fb.objectiveOk).toBe(true);
    expect(fb.missing).toEqual([]);
    expect(fb.score).toBe(1);
    const fb2 = checkFormulation('max 2x1 + 5x2\nx1 + 2x2 >= 80', {
      vars: ['x1', 'x2'],
      objective: { sense: 'max', expr: '2x1+5x2' },
      constraints: ['x1+2x2<=80', 'x1+3x2<=90'],
      nonneg: ['x1', 'x2'],
    });
    expect(fb2.missing).toEqual([0, 1]);
    expect(fb2.extra.length).toBe(1);
  });
});
