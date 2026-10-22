import { Model2D } from '../../math/lp2d';

export const r = String.raw;

let n = 0;
export function mk(sense: 'max' | 'min', c1: number, c2: number, cons: [number, number, '<=' | '>=' | '=', number][], nonneg = true): Model2D {
  return {
    sense,
    c1,
    c2,
    nonneg,
    constraints: cons.map(([a1, a2, op, b]) => ({ id: `e${n++}`, a1, a2, op, b })),
  };
}
