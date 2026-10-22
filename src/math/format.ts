/** Number formatting helpers (fractions for exam-style answers). */

export function toFrac(v: number, maxDen = 64): { n: number; d: number } | null {
  if (!isFinite(v)) return null;
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-7 * (1 + Math.abs(v))) return { n, d };
  }
  return null;
}

/** plain text: 16.5 -> "33/2", 3 -> "3", 0.3333 -> "1/3"; else 3 decimals */
export function fmtNum(v: number, digits = 3): string {
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  if (Number.isNaN(v)) return '–';
  const f = toFrac(v);
  if (f && f.d === 1) return neg(f.n);
  if (f && f.d <= 12) return `${f.n < 0 ? '−' : ''}${Math.abs(f.n)}/${f.d}`;
  return neg(+v.toFixed(digits));
}

function neg(v: number) {
  return v < 0 ? `−${Math.abs(v)}` : String(v);
}

/** LaTeX number: fractions as \tfrac */
export function texNum(v: number): string {
  if (v === Infinity) return '\\infty';
  if (v === -Infinity) return '-\\infty';
  if (Number.isNaN(v)) return '\\text{–}';
  const f = toFrac(v);
  if (f && f.d === 1) return String(f.n);
  if (f && f.d <= 12) return `${f.n < 0 ? '-' : ''}\\tfrac{${Math.abs(f.n)}}{${f.d}}`;
  return String(+v.toFixed(3));
}

export function fmtDec(v: number, digits = 2) {
  if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
  return neg(+v.toFixed(digits));
}

/** LaTeX for a linear expression sum c_j x_j */
export function texLinear(coefs: number[], names: string[] = coefs.map((_, j) => `x_{${j + 1}}`)): string {
  let s = '';
  coefs.forEach((c, j) => {
    if (Math.abs(c) < 1e-12) return;
    const abs = Math.abs(c);
    const cs = abs === 1 ? '' : texNum(abs);
    if (!s) s = (c < 0 ? '-' : '') + cs + names[j];
    else s += (c < 0 ? ' - ' : ' + ') + cs + names[j];
  });
  return s || '0';
}

export const opTex = (op: '<=' | '>=' | '=') => (op === '<=' ? '\\le' : op === '>=' ? '\\ge' : '=');
