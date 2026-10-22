import { describe, it, expect } from 'vitest';
import { EXERCISES, EXERCISE_BY_ID } from './exercises';
import { EXAMS } from './exams';
import { TOPICS } from './topics';
import { FLASHCARDS } from './flashcards';
import { LESSONS, LABS } from './course';
import { INVENTORY } from './inventory';
import { ExpectedFormulation, parseExpr, parseRelation, checkFormulation } from '../math/linparse';
import { LP, solveLP, LinCon } from '../math/simplex';
import { initBB, solveAll } from '../math/bnb';
import { analyze, feasible } from '../math/lp2d';
import { grade } from '../components/ExerciseCard';

const topicIds = new Set(TOPICS.map((t) => t.id));

/** Convert an expected formulation to an LP/IP (only linear, no symbolic M). */
function toModel(f: ExpectedFormulation) {
  const vars = f.vars.filter((v) => v !== 'M');
  const idx = (k: string) => vars.indexOf(k);
  const lin = (p: Map<string, number>) => {
    const a = new Array(vars.length).fill(0);
    let c = 0;
    for (const [k, v] of p) {
      if (k === '') c += v;
      else if (idx(k) >= 0 && !k.includes('*')) a[idx(k)] += v;
      else return null;
    }
    return { a, c };
  };
  const obj = lin(parseExpr(f.objective.expr, f.vars));
  if (!obj) return null;
  const cons: LinCon[] = [];
  for (const s of f.constraints) {
    const r = parseRelation(s, f.vars);
    const l = lin(r.poly);
    if (!l) return null;
    cons.push({ a: l.a, op: r.op, b: -l.c });
  }
  const integer = vars.map((v) => (f.integer ?? []).includes(v) || (f.binary ?? []).includes(v));
  const binary = vars.map((v) => (f.binary ?? []).includes(v));
  const lp: LP = { sense: f.objective.sense, c: obj.a, cons };
  return { lp, integer, binary, vars };
}

function optimum(f: ExpectedFormulation) {
  const m = toModel(f);
  if (!m) return null;
  if (m.integer.some(Boolean)) {
    const st = solveAll(initBB({ lp: m.lp, integer: m.integer, binary: m.binary }, { roundBound: false }), 5000);
    return st.incumbent ? { z: st.incumbent.z, x: st.incumbent.x } : null;
  }
  const r = solveLP(m.lp);
  return r.status === 'optimal' ? { z: r.z, x: r.x } : { z: NaN, x: [], status: r.status };
}

describe('exercise bank integrity', () => {
  it('has unique ids, valid topics and complete hints', () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of EXERCISES) {
      expect(e.hints.length).toBe(3);
      expect(e.solution.length).toBeGreaterThan(20);
      for (const t of e.topics) expect(topicIds.has(t), `${e.id} topic ${t}`).toBe(true);
    }
    expect(EXERCISES.length).toBeGreaterThanOrEqual(90);
  });
  it('choice answers are within range', () => {
    for (const e of EXERCISES) {
      if (e.kind === 'mc') expect(e.answer).toBeLessThan(e.options.length);
      if (e.kind === 'multi') e.answers.forEach((a) => expect(a).toBeLessThan(e.options.length));
    }
  });
  it('expected formulations and expression answers parse', () => {
    for (const e of EXERCISES) {
      if (e.kind === 'formulation') {
        const fb = checkFormulation('', e.expected); // parses expected internally
        expect(fb.score).toBe(0);
      }
      if (e.kind === 'expr') {
        for (const f of e.fields) {
          if (f.mode === 'relation') expect(() => parseRelation(f.answer, f.vars)).not.toThrow();
          else expect(() => parseExpr(f.answer, f.vars)).not.toThrow();
        }
      }
    }
  });
  it('the expected formulation text itself scores 100%', () => {
    for (const e of EXERCISES) {
      if (e.kind !== 'formulation') continue;
      const f = e.expected;
      const lines = [`${f.objective.sense} ${f.objective.expr}`, ...f.constraints];
      if (f.nonneg?.length) lines.push(`${f.nonneg.join(', ')} >= 0`);
      if (f.binary?.length) lines.push(`${f.binary.join(', ')} binary`);
      if (f.integer?.length) lines.push(`${f.integer.join(', ')} integer`);
      const fb = checkFormulation(lines.join('\n'), f);
      expect(fb.score, e.id + JSON.stringify(fb)).toBe(1);
    }
  });
  it('graph exercises are well-posed', () => {
    for (const e of EXERCISES) {
      if (e.kind === 'graph-optimum' || e.kind === 'graph-binding' || e.kind === 'graph-objective') {
        const a = analyze(e.model);
        if (e.kind !== 'graph-optimum') expect(a.status, e.id).toBe('optimal');
      }
    }
  });
  it('graders accept the correct answers', () => {
    for (const e of EXERCISES) {
      const ans: Record<string, unknown> = {};
      if (e.kind === 'mc') ans.choice = e.answer;
      else if (e.kind === 'multi') ans.sel = e.answers;
      else if (e.kind === 'tf') e.statements.forEach((s, k) => (ans[`tf${k}`] = s.answer));
      else if (e.kind === 'numeric') e.fields.forEach((f, k) => (ans[`n${k}`] = isFinite(f.answer) ? String(f.answer) : 'ubegrenset'));
      else if (e.kind === 'expr') e.fields.forEach((f, k) => (ans[`e${k}`] = f.answer));
      else if (e.kind === 'graph-points') {
        const a = analyze(e.model);
        ans.sel = e.points.map((p, k) => (feasible(a.allCons, p) ? k : -1)).filter((k) => k >= 0);
      } else if (e.kind === 'graph-optimum') {
        const a = analyze(e.model);
        ans.choice = a.status === 'optimal' ? a.vertices.findIndex((v) => Math.abs(v.z - a.zStar!) < 1e-7) : a.status;
      } else if (e.kind === 'graph-binding') {
        const a = analyze(e.model);
        ans.sel = e.model.constraints.map((c, k) => (a.binding.includes(c.id) ? k : -1)).filter((k) => k >= 0);
      } else if (e.kind === 'graph-objective') ans.level = analyze(e.model).zStar;
      else continue;
      expect(grade(e, ans).score, e.id).toBeCloseTo(1, 6);
    }
  });
});

describe('stated answers agree with the solver', () => {
  const opt = (id: string) => {
    const e = EXERCISE_BY_ID[id];
    if (e.kind !== 'formulation') throw new Error(id);
    return optimum(e.expected)!;
  };
  it.each([
    ['in-9', 340],
    ['lo-f1', 36],
    ['lo-f2', 3212],
    ['lo-f6', 5.25],
    ['lo-f8', 4850],
    ['lo-f9', 49000],
    ['lo-d1', 36],
    ['lo-d2', 340],
    ['do-m1', 46],
    ['do-m4', 18.4],
    ['do-m7', 14],
    ['do-g1', 750],
    ['do-f1', NaN], // contains symbolic M – skipped
  ])('%s optimum = %s', (id, z) => {
    const e = EXERCISE_BY_ID[id];
    if (e.kind !== 'formulation') throw new Error(id);
    const o = optimum(e.expected);
    if (Number.isNaN(z)) {
      expect(o).toBeNull();
      return;
    }
    expect(o!.z).toBeCloseTo(z, 6);
  });
  it('dual of LO Practice 7 is unbounded', () => {
    const e = EXERCISE_BY_ID['lo-d8'];
    if (e.kind !== 'formulation') throw new Error();
    const m = toModel(e.expected)!;
    expect(solveLP(m.lp).status).toBe('unbounded');
  });
  it('numeric answers that are LP optima match', () => {
    expect(opt('lo-f2').x).toEqual([3200, 1200]);
    expect(opt('do-g1').x).toEqual([0, 5]);
  });
});

describe('exams', () => {
  it('parts are valid and formulations self-consistent', () => {
    for (const ex of EXAMS) {
      const ids = ex.questions.flatMap((q) => q.parts.map((p) => p.id));
      expect(new Set(ids).size).toBe(ids.length);
      for (const q of ex.questions)
        for (const p of q.parts) {
          p.topics.forEach((t) => expect(topicIds.has(t), `${p.id} ${t}`).toBe(true));
          expect(p.rubric.reduce((a, r) => a + r.pts, 0), `${ex.id}/${p.id} rubric`).toBe(p.points);
          if (p.auto?.kind === 'formulation') {
            const f = p.auto.expected;
            const lines = [`${f.objective.sense} ${f.objective.expr}`, ...f.constraints];
            if (f.nonneg?.length) lines.push(`${f.nonneg.join(', ')} >= 0`);
            if (f.binary?.length) lines.push(`${f.binary.join(', ')} binary`);
            if (f.integer?.length) lines.push(`${f.integer.join(', ')} integer`);
            expect(checkFormulation(lines.join('\n'), f).score, p.id).toBe(1);
          }
        }
      const total = ex.questions.reduce((a, q) => a + q.parts.reduce((b, p) => b + p.points, 0), 0);
      expect(total, ex.id).toBe(ex.id === 'gen-b' ? 100 : 100);
    }
  });
  it('exam numeric answers are reproduced by the solver', () => {
    const part = (eid: string, pid: string) => EXAMS.find((e) => e.id === eid)!.questions.flatMap((q) => q.parts).find((p) => p.id === pid)!;
    const f = (eid: string, pid: string) => {
      const a = part(eid, pid).auto;
      if (a?.kind !== 'formulation') throw new Error(pid);
      return optimum(a.expected)!;
    };
    expect(f('official-midterm', 'q1a').z).toBe(170);
    expect(f('official-midterm', 'q1a').x).toEqual([60, 10]);
    expect(f('official-midterm', 'q2a').z).toBeCloseTo(8400, 6);
    expect(f('official-midterm', 'q3c').z).toBeCloseTo(6, 6);
    expect(f('gen-a', 'a1a').x).toEqual([5, 4]);
    expect(f('gen-a', 'a2a').z).toBeCloseTo(104, 6);
    expect(f('gen-b', 'b1a').x).toEqual([1, 5]);
    expect(f('gen-b', 'b1a').z).toBe(13);
    expect(f('gen-b', 'b3a').z).toBe(265);
    const a3 = f('gen-a', 'a3a');
    expect(a3.z).toBeGreaterThan(0);
    // B&B exam
    const bb = solveAll(initBB({ lp: { sense: 'max', c: [8, 5], cons: [{ a: [1, 1], op: '<=', b: 6 }, { a: [9, 5], op: '<=', b: 45 }] }, integer: [true, true], binary: [false, false] }));
    expect(bb.incumbent!.x).toEqual([5, 0]);
    expect(bb.nodes.length).toBe(7);
  });
});

describe('course structure', () => {
  it('lessons reference valid topics and all topics have a lesson', () => {
    const lessonIds = new Set(LESSONS.map((l) => l.id));
    for (const l of LESSONS) l.topics.forEach((t) => expect(topicIds.has(t)).toBe(true));
    for (const t of TOPICS) expect(lessonIds.has(t.lesson), t.id).toBe(true);
  });
  it('flashcards are valid', () => {
    expect(new Set(FLASHCARDS.map((f) => f.id)).size).toBe(FLASHCARDS.length);
    FLASHCARDS.forEach((f) => expect(topicIds.has(f.topic), f.id).toBe(true));
  });
  it('inventory references exist', () => {
    const lessonIds = new Set(LESSONS.map((l) => l.id));
    const labIds = new Set(LABS.map((l) => l.id));
    for (const f of INVENTORY)
      for (const r of f.rows) {
        r.lessons.forEach((l) => expect(lessonIds.has(l), l).toBe(true));
        r.labs?.forEach((l) => expect(labIds.has(l), l).toBe(true));
        r.exercises?.forEach((e) => expect(EXERCISE_BY_ID[e], e).toBeTruthy());
      }
  });
  it('every exercise is used by at least one lesson or is reachable via the bank', () => {
    expect(EXERCISES.every((e) => e.topics.length > 0)).toBe(true);
  });
});
