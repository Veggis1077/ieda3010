/**
 * Small symbolic parser for checking typed answers by mathematical
 * equivalence rather than string matching.
 *
 * Expressions are normalised to polynomials (map monomial -> coefficient),
 * so "3x1 + 2x2 <= 18 + M y1", "3*x_1+2*x_2-M*y_1<=18" and
 * "6x1 + 4x2 - 2My1 <= 36" are recognised as the same constraint.
 */

export type Poly = Map<string, number>;
export type RelOp = '<=' | '>=' | '=';

export class ParseError extends Error {}

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function normalizeText(s: string) {
  return s
    .replace(/[−–—]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/≤|⩽|=</g, '<=')
    .replace(/≥|⩾|=>/g, '>=')
    .replace(/\\le(q)?/g, '<=')
    .replace(/\\ge(q)?/g, '>=')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '(($1)/($2))')
    .replace(/[{}]/g, (m) => (m === '{' ? '' : ''))
    .replace(/\\left|\\right/g, '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));
}

function tokenize(src: string, known?: string[]): Tok[] {
  const s = normalizeText(src);
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = parseFloat(s.slice(i, j));
      if (isNaN(v)) throw new ParseError(`Ugyldig tall ved «${s.slice(i, j)}»`);
      toks.push({ t: 'num', v });
      i = j;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      const raw = s.slice(i, j).replace(/_/g, '');
      for (const id of splitIdent(raw, known)) toks.push({ t: 'id', v: id });
      i = j;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (two === '<=' || two === '>=' || two === '==') {
      toks.push({ t: 'op', v: two === '==' ? '=' : two });
      i += 2;
      continue;
    }
    if ('+-*/()=<>,'.includes(ch)) {
      toks.push({ t: 'op', v: ch === '<' ? '<=' : ch === '>' ? '>=' : ch });
      i++;
      continue;
    }
    throw new ParseError(`Ukjent tegn «${ch}»`);
  }
  return toks;
}

function splitIdent(raw: string, known?: string[]): string[] {
  if (!known || known.length === 0 || known.includes(raw)) return [raw];
  const sorted = [...known].sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let rest = raw;
  while (rest.length) {
    const k = sorted.find((name) => rest.startsWith(name));
    if (!k) return [raw]; // unknown symbol, keep whole
    out.push(k);
    rest = rest.slice(k.length);
  }
  return out;
}

const key = (syms: string[]) => [...syms].sort().join('*');

function add(a: Poly, b: Poly, sign = 1): Poly {
  const r = new Map(a);
  b.forEach((v, k) => r.set(k, (r.get(k) ?? 0) + sign * v));
  return prune(r);
}
function mul(a: Poly, b: Poly): Poly {
  const r: Poly = new Map();
  a.forEach((va, ka) =>
    b.forEach((vb, kb) => {
      const k = key([...(ka ? ka.split('*') : []), ...(kb ? kb.split('*') : [])]);
      r.set(k, (r.get(k) ?? 0) + va * vb);
    }),
  );
  return prune(r);
}
function prune(p: Poly): Poly {
  const r: Poly = new Map();
  p.forEach((v, k) => {
    if (Math.abs(v) > 1e-12) r.set(k, v);
  });
  return r;
}
const constPoly = (v: number): Poly => prune(new Map([['', v]]));

class Parser {
  i = 0;
  constructor(private toks: Tok[]) {}
  peek() {
    return this.toks[this.i];
  }
  eat(v?: string) {
    const t = this.toks[this.i];
    if (v !== undefined && (!t || t.t !== 'op' || t.v !== v)) throw new ParseError(`Forventet «${v}»`);
    this.i++;
    return t;
  }
  atEnd() {
    return this.i >= this.toks.length;
  }
  expr(): Poly {
    let p = this.term();
    for (;;) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
        this.eat();
        p = add(p, this.term(), t.v === '+' ? 1 : -1);
      } else return p;
    }
  }
  term(): Poly {
    let p = this.factor();
    for (;;) {
      const t = this.peek();
      if (!t) return p;
      if (t.t === 'op' && t.v === '*') {
        this.eat();
        p = mul(p, this.factor());
      } else if (t.t === 'op' && t.v === '/') {
        this.eat();
        const d = this.factor();
        const c = d.size === 0 ? 0 : d.size === 1 && d.has('') ? d.get('')! : NaN;
        if (!c || isNaN(c)) throw new ParseError('Kan bare dele på konstanter');
        p = mul(p, constPoly(1 / c));
      } else if (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '(')) {
        p = mul(p, this.factor()); // implicit multiplication
      } else return p;
    }
  }
  factor(): Poly {
    const t = this.peek();
    if (!t) throw new ParseError('Uttrykket slutter for tidlig');
    if (t.t === 'op' && (t.v === '-' || t.v === '+')) {
      this.eat();
      const f = this.factor();
      return t.v === '-' ? mul(constPoly(-1), f) : f;
    }
    if (t.t === 'num') {
      this.eat();
      return constPoly(t.v);
    }
    if (t.t === 'id') {
      this.eat();
      return new Map([[t.v, 1]]);
    }
    if (t.t === 'op' && t.v === '(') {
      this.eat();
      const p = this.expr();
      this.eat(')');
      return p;
    }
    throw new ParseError(`Uventet «${t.v}»`);
  }
}

export function parseExpr(src: string, known?: string[]): Poly {
  const toks = tokenize(src, known);
  if (!toks.length) throw new ParseError('Tomt uttrykk');
  const p = new Parser(toks);
  const r = p.expr();
  if (!p.atEnd()) throw new ParseError(`Uventet «${String(p.peek()!.v)}»`);
  return r;
}

export interface Relation {
  /** normalized: poly op 0 */
  poly: Poly;
  op: RelOp;
}

export function parseRelation(src: string, known?: string[]): Relation {
  const toks = tokenize(src, known);
  const idx = toks.findIndex((t) => t.t === 'op' && (t.v === '<=' || t.v === '>=' || t.v === '='));
  if (idx < 0) throw new ParseError('Mangler relasjon (≤, ≥ eller =)');
  const op = toks[idx].v as RelOp;
  const L = new Parser(toks.slice(0, idx));
  const R = new Parser(toks.slice(idx + 1));
  if (idx === 0 || idx === toks.length - 1) throw new ParseError('Relasjonen mangler en side');
  const l = L.expr();
  if (!L.atEnd()) throw new ParseError('Kunne ikke tolke venstre side');
  const r = R.expr();
  if (!R.atEnd()) throw new ParseError('Kunne ikke tolke høyre side (bare én relasjon per linje)');
  let poly = add(l, r, -1);
  let o: RelOp = op;
  if (op === '>=') {
    poly = mul(constPoly(-1), poly);
    o = '<=';
  }
  return { poly, op: o };
}

/** returns positive/any lambda with a = lambda * b, or null */
function proportional(a: Poly, b: Poly): number | null {
  if (a.size !== b.size) return null;
  if (a.size === 0) return 1;
  let lambda: number | null = null;
  for (const [k, va] of a) {
    const vb = b.get(k);
    if (vb === undefined) return null;
    const l = va / vb;
    if (lambda === null) lambda = l;
    else if (Math.abs(l - lambda) > 1e-9 * (1 + Math.abs(lambda))) return null;
  }
  return lambda;
}

export function relationsEquivalent(a: Relation, b: Relation): boolean {
  if (a.op !== b.op) return false;
  const l = proportional(a.poly, b.poly);
  if (l === null) return false;
  return a.op === '=' ? Math.abs(l) > 1e-12 : l > 0;
}

export function polysEquivalent(a: Poly, b: Poly, allowPositiveScale = false) {
  const l = proportional(a, b);
  if (l === null) return false;
  return allowPositiveScale ? l > 0 : Math.abs(l - 1) < 1e-9;
}

/** parse plain numeric answers: 16.5, 33/2, "16 1/2", -2/3, 1e3 */
export function parseNumber(src: string): number | null {
  const s = normalizeText(src).trim().replace(/,(?=\d{3}\b)/g, '').replace(',', '.');
  if (!s) return null;
  const mixed = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const v = parseInt(mixed[2]) + parseInt(mixed[3]) / parseInt(mixed[4]);
    return mixed[1] ? -v : v;
  }
  if (/^[-+]?\d*\.?\d+e[-+]?\d+$/i.test(s)) return parseFloat(s);
  try {
    const p = parseExpr(s.replace(/\$|HKD|hkd|kr/g, ''));
    if (p.size === 0) return 0;
    if (p.size === 1 && p.has('')) return p.get('')!;
    return null;
  } catch {
    return null;
  }
}

export function polyToString(p: Poly): string {
  const parts: string[] = [];
  const keys = [...p.keys()].sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, undefined, { numeric: true })));
  for (const k of keys) {
    const v = p.get(k)!;
    const abs = Math.abs(v);
    const coef = k === '' ? String(+abs.toFixed(6)) : abs === 1 ? '' : String(+abs.toFixed(6));
    const term = coef + (k ? k.replace(/\*/g, '') : '');
    parts.push((v < 0 ? '- ' : parts.length ? '+ ' : '') + term);
  }
  return parts.join(' ') || '0';
}

// ---------------------------------------------------------------------------
// Formulation checking
// ---------------------------------------------------------------------------

export interface ExpectedFormulation {
  vars: string[];
  objective: { sense: 'max' | 'min'; expr: string };
  constraints: string[];
  /** variables required to be >= 0 */
  nonneg?: string[];
  binary?: string[];
  integer?: string[];
  /** alternative acceptable constraints that may replace an expected one */
  alternatives?: Record<number, string[]>;
}

export interface FormulationFeedback {
  objectiveOk: boolean;
  objectiveMsg: string;
  matched: number[];
  missing: number[];
  extra: string[];
  parseErrors: { line: string; msg: string }[];
  nonnegMissing: string[];
  binaryMissing: string[];
  integerMissing: string[];
  score: number; // 0..1
}

export function checkFormulation(text: string, exp: ExpectedFormulation): FormulationFeedback {
  const lines = text
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  const fb: FormulationFeedback = {
    objectiveOk: false,
    objectiveMsg: 'Fant ingen målfunksjon (start en linje med «max» eller «min»).',
    matched: [],
    missing: [],
    extra: [],
    parseErrors: [],
    nonnegMissing: [],
    binaryMissing: [],
    integerMissing: [],
    score: 0,
  };
  const nonneg = new Set<string>();
  const bin = new Set<string>();
  const int = new Set<string>();
  const rels: { line: string; rel: Relation }[] = [];
  const expObj = parseExpr(exp.objective.expr, exp.vars);
  for (let raw of lines) {
    raw = raw.replace(/^(s\.?\s*t\.?|subject to|slik at|u\.?\s*b\.?)\s*:?\s*/i, '');
    if (!raw) continue;
    const objM = raw.match(/^(max(imize|imer)?|min(imize|imer)?)\b\s*:?\s*(.*)$/i);
    if (objM) {
      const sense = objM[1].toLowerCase().startsWith('max') ? 'max' : 'min';
      const body = objM[4].replace(/^[A-Za-z]\s*=\s*/, '');
      try {
        let p = parseExpr(body, exp.vars);
        let s = sense;
        if (s !== exp.objective.sense) {
          p = mul(constPoly(-1), p);
          s = exp.objective.sense;
        }
        if (polysEquivalent(p, expObj)) {
          fb.objectiveOk = true;
          fb.objectiveMsg = sense === exp.objective.sense ? 'Målfunksjonen er korrekt.' : 'Korrekt (ekvivalent omskriving med motsatt retning).';
        } else if (polysEquivalent(p, expObj, true)) {
          fb.objectiveOk = true;
          fb.objectiveMsg = 'Målfunksjonen er et positivt multiplum av den forventede – gir samme optimale løsning, men verdien Z blir skalert.';
        } else {
          fb.objectiveMsg = `Målfunksjonen stemmer ikke. Du skrev ${sense} ${polyToString(p)}.`;
        }
      } catch (e) {
        fb.parseErrors.push({ line: raw, msg: (e as Error).message });
      }
      continue;
    }
    const domM = raw.match(/^(.*?)\s*(binary|binære?|binær|∈\s*\{\s*0\s*,\s*1\s*\}|in\s*\{0,1\}|integers?|heltall(ig)?e?|ints?)\s*$/i);
    if (domM) {
      const names = expandNames(domM[1], exp.vars);
      const kind = domM[2].toLowerCase();
      const target = /bin|0/.test(kind) ? bin : int;
      names.forEach((n) => target.add(n));
      // "x >= 0 integers"
      if (/>=|≥/.test(domM[1])) expandNames(domM[1].split(/>=|≥/)[0], exp.vars).forEach((n) => nonneg.add(n));
      continue;
    }
    const nnM = raw.match(/^([A-Za-z0-9_,\s{}]+?)\s*(>=|≥)\s*0\s*$/);
    if (nnM && nnM[1].includes(',')) {
      expandNames(nnM[1], exp.vars).forEach((n) => nonneg.add(n));
      continue;
    }
    try {
      const rel = parseRelation(raw, exp.vars);
      // single variable >= 0
      if (rel.op === '<=' && rel.poly.size === 1) {
        const [[k, v]] = [...rel.poly];
        if (k !== '' && !k.includes('*') && v < 0) {
          nonneg.add(k);
          continue;
        }
      }
      rels.push({ line: raw, rel });
    } catch (e) {
      fb.parseErrors.push({ line: raw, msg: (e as Error).message });
    }
  }
  const expRels = exp.constraints.map((c, i) => [c, ...(exp.alternatives?.[i] ?? [])].map((s) => parseRelation(s, exp.vars)));
  const used = new Set<number>();
  expRels.forEach((alts, i) => {
    const k = rels.findIndex((r, idx) => !used.has(idx) && alts.some((a) => relationsEquivalent(r.rel, a)));
    if (k >= 0) {
      used.add(k);
      fb.matched.push(i);
    } else fb.missing.push(i);
  });
  rels.forEach((r, idx) => !used.has(idx) && fb.extra.push(r.line));
  fb.nonnegMissing = (exp.nonneg ?? []).filter((v) => !nonneg.has(v) && !bin.has(v));
  fb.binaryMissing = (exp.binary ?? []).filter((v) => !bin.has(v));
  fb.integerMissing = (exp.integer ?? []).filter((v) => !int.has(v));
  const total = 1 + exp.constraints.length + ((exp.nonneg?.length ?? 0) > 0 ? 1 : 0) + ((exp.binary?.length ?? 0) + (exp.integer?.length ?? 0) > 0 ? 1 : 0);
  let got = (fb.objectiveOk ? 1 : 0) + fb.matched.length;
  if ((exp.nonneg?.length ?? 0) > 0 && fb.nonnegMissing.length === 0) got++;
  if ((exp.binary?.length ?? 0) + (exp.integer?.length ?? 0) > 0 && fb.binaryMissing.length + fb.integerMissing.length === 0) got++;
  fb.score = Math.max(0, got - fb.extra.length * 0.5) / total;
  return fb;
}

function expandNames(s: string, vars: string[]): string[] {
  const parts = normalizeText(s)
    .split(/[,\s]+/)
    .map((p) => p.replace(/_/g, '').trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    // ranges like x1..x5 or x1-x5 not supported beyond simple "all"
    if (/^(all|alle)$/i.test(p)) out.push(...vars);
    else if (vars.includes(p)) out.push(p);
    else {
      // prefix match e.g. "y" meaning all y_i
      const pref = vars.filter((v) => v.replace(/\d+$/, '') === p || v.startsWith(p + ''));
      if (pref.length && /^[A-Za-z]+$/.test(p)) out.push(...pref.filter((v) => v.replace(/[0-9]+$/, '') === p));
    }
  }
  return out;
}
