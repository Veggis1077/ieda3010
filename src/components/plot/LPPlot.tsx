import { PointerEvent as RPE, ReactNode, useMemo, useRef, useState } from 'react';
import { Analysis2D, Constraint2D, Model2D, Pt, clippedRegion, feasible, allConstraints } from '../../math/lp2d';
import { fmtNum } from '../../math/format';

export interface View {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export const CON_COLORS = ['#2563eb', '#0d9488', '#9333ea', '#ca8a04', '#db2777', '#0891b2', '#65a30d', '#7c3aed'];
export const conColor = (i: number) => CON_COLORS[i % CON_COLORS.length];

export interface PlotOptions {
  vertices?: boolean;
  vertexLabels?: boolean;
  constraintLabels?: boolean;
  isoquant?: boolean;
  isoFamily?: boolean;
  gradient?: boolean;
  optimum?: boolean;
  halfPlanes?: boolean;
  grid?: boolean;
  intGrid?: boolean;
  intercepts?: boolean;
  binding?: boolean;
}

export const defaultOptions: PlotOptions = {
  vertices: true,
  vertexLabels: true,
  constraintLabels: true,
  isoquant: true,
  isoFamily: false,
  gradient: true,
  optimum: true,
  halfPlanes: false,
  grid: true,
  intGrid: false,
  intercepts: true,
  binding: true,
};

interface Props {
  model: Model2D;
  analysis: Analysis2D;
  view: View;
  options?: PlotOptions;
  objLevel?: number | null;
  onObjLevel?: (L: number) => void;
  onConstraint?: (id: string, patch: Partial<Constraint2D>) => void;
  onObjective?: (c1: number, c2: number) => void;
  snap?: number;
  height?: number;
  /** extra decorations in data coordinates */
  points?: { p: Pt; color?: string; label?: string; ring?: boolean; r?: number; onClick?: () => void; title?: string }[];
  onPlotClick?: (p: Pt) => void;
  onConstraintClick?: (id: string) => void;
  highlightConstraints?: string[];
  ghostConstraints?: Constraint2D[];
  hideOptimumUntil?: boolean;
  segments?: { a: Pt; b: Pt; color: string; width?: number; dash?: string }[];
  children?: (helpers: { sx: (x: number) => number; sy: (y: number) => number }) => ReactNode;
  axisNames?: [string, string];
  labelFor?: (c: Constraint2D, i: number) => string;
}

const W = 600;
const H = 480;
const PAD = { l: 46, r: 16, t: 14, b: 36 };

export function niceStep(range: number, target = 8) {
  const raw = range / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  const s = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10;
  return s * p;
}

/** clip infinite line a1 x + a2 y = b to view box; returns segment or null */
export function lineInView(a1: number, a2: number, b: number, v: View): [Pt, Pt] | null {
  const pts: Pt[] = [];
  const add = (p: Pt) => {
    if (p[0] >= v.x0 - 1e-9 && p[0] <= v.x1 + 1e-9 && p[1] >= v.y0 - 1e-9 && p[1] <= v.y1 + 1e-9)
      if (!pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-9)) pts.push(p);
  };
  if (Math.abs(a2) > 1e-12) {
    add([v.x0, (b - a1 * v.x0) / a2]);
    add([v.x1, (b - a1 * v.x1) / a2]);
  }
  if (Math.abs(a1) > 1e-12) {
    add([(b - a2 * v.y0) / a1, v.y0]);
    add([(b - a2 * v.y1) / a1, v.y1]);
  }
  if (pts.length < 2) return null;
  return [pts[0], pts[1]];
}

export function autoView(model: Model2D, extraPts: Pt[] = []): View {
  const cons = allConstraints(model);
  const xs: number[] = [0];
  const ys: number[] = [0];
  for (const c of cons) {
    if (c.a1 !== 0 && c.a2 === 0) xs.push(c.b / c.a1);
    else if (c.a2 !== 0 && c.a1 === 0) ys.push(c.b / c.a2);
    else {
      if (c.a1 !== 0) xs.push(c.b / c.a1);
      if (c.a2 !== 0) ys.push(c.b / c.a2);
    }
  }
  for (const p of extraPts) {
    xs.push(p[0]);
    ys.push(p[1]);
  }
  const fin = (a: number[]) => a.filter((v) => isFinite(v) && Math.abs(v) < 1e6);
  const mx = Math.max(...fin(xs).map(Math.abs), 1);
  const my = Math.max(...fin(ys).map(Math.abs), 1);
  const nx = Math.min(...fin(xs), 0);
  const ny = Math.min(...fin(ys), 0);
  const m = Math.max(mx, my);
  // keep roughly equal scale when ranges are comparable
  const X = Math.max(...fin(xs), 1) * 1.15;
  const Y = Math.max(...fin(ys), 1) * 1.15;
  const ratio = X / Y;
  const useX = ratio > 3 || ratio < 1 / 3 ? X : Math.max(X, Y);
  const useY = ratio > 3 || ratio < 1 / 3 ? Y : Math.max(X, Y);
  void m;
  return {
    x0: nx < 0 ? nx * 1.15 : -useX * 0.04,
    x1: useX,
    y0: ny < 0 ? ny * 1.15 : -useY * 0.04,
    y1: useY,
  };
}

export function LPPlot({
  model,
  analysis,
  view,
  options = defaultOptions,
  objLevel,
  onObjLevel,
  onConstraint,
  onObjective,
  snap = 0.5,
  height,
  points,
  onPlotClick,
  onConstraintClick,
  highlightConstraints,
  ghostConstraints,
  hideOptimumUntil,
  segments,
  children,
  axisNames = ['x_1', 'x_2'],
  labelFor,
}: Props) {
  const o = { ...defaultOptions, ...options };
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<null | { kind: 'line' | 'ix' | 'iy' | 'iso' | 'grad'; id?: string }>(null);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const sx = (x: number) => PAD.l + ((x - view.x0) / (view.x1 - view.x0)) * iw;
  const sy = (y: number) => PAD.t + ih - ((y - view.y0) / (view.y1 - view.y0)) * ih;
  const toData = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const q = pt.matrixTransform(m.inverse());
    return [view.x0 + ((q.x - PAD.l) / iw) * (view.x1 - view.x0), view.y0 + ((PAD.t + ih - q.y) / ih) * (view.y1 - view.y0)];
  };
  const sn = (v: number) => (snap > 0 ? Math.round(v / snap) * snap : v);

  const cons = analysis.allCons;
  const userCons = model.constraints;
  const big: View = {
    x0: view.x0 - (view.x1 - view.x0) * 2,
    x1: view.x1 + (view.x1 - view.x0) * 2,
    y0: view.y0 - (view.y1 - view.y0) * 2,
    y1: view.y1 + (view.y1 - view.y0) * 2,
  };
  const region = useMemo(() => clippedRegion(cons, big), [cons, big.x0, big.x1, big.y0, big.y1]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = niceStep(Math.max(view.x1 - view.x0, view.y1 - view.y0));
  const ticksX: number[] = [];
  for (let t = Math.ceil(view.x0 / step) * step; t <= view.x1 + 1e-9; t += step) ticksX.push(+t.toFixed(10));
  const ticksY: number[] = [];
  for (let t = Math.ceil(view.y0 / step) * step; t <= view.y1 + 1e-9; t += step) ticksY.push(+t.toFixed(10));

  const onMove = (e: RPE<SVGSVGElement>) => {
    if (!drag) return;
    const p = toData(e);
    if (drag.kind === 'iso' && onObjLevel) {
      onObjLevel(model.c1 * p[0] + model.c2 * p[1]);
      return;
    }
    if (drag.kind === 'grad' && onObjective) {
      const anchor = gradAnchor;
      const dx = p[0] - anchor[0];
      const dy = p[1] - anchor[1];
      const ang = Math.atan2(dy / (view.y1 - view.y0), dx / (view.x1 - view.x0));
      const mag = Math.hypot(model.c1, model.c2) || 1;
      // direction in data space
      const ux = Math.cos(ang) * (view.x1 - view.x0);
      const uy = Math.sin(ang) * (view.y1 - view.y0);
      const n = Math.hypot(ux, uy);
      const r = (v: number) => Math.round(v * 10) / 10;
      // the arrow shows the improving direction: for min it is -c
      onObjective(r(improving * (ux / n) * mag), r(improving * (uy / n) * mag));
      return;
    }
    const c = userCons.find((k) => k.id === drag.id);
    if (!c || !onConstraint) return;
    if (drag.kind === 'line') {
      onConstraint(c.id, { b: +sn(c.a1 * p[0] + c.a2 * p[1]).toFixed(6) });
    } else if (drag.kind === 'ix') {
      const u = sn(p[0]);
      if (Math.abs(u) > 1e-9 && c.b !== 0) onConstraint(c.id, { a1: +(c.b / u).toFixed(4) });
    } else if (drag.kind === 'iy') {
      const v = sn(p[1]);
      if (Math.abs(v) > 1e-9 && c.b !== 0) onConstraint(c.id, { a2: +(c.b / v).toFixed(4) });
    }
  };

  const regionPath = region.length >= 3 ? 'M' + region.map((p) => `${sx(p[0])},${sy(p[1])}`).join('L') + 'Z' : '';
  const regionIsSegment = region.length >= 2 && analysis.status !== 'infeasible' && polyArea(region) < 1e-9 * (big.x1 - big.x0) * (big.y1 - big.y0);

  const cx = (view.x0 + view.x1) / 2;
  const cy = (view.y0 + view.y1) / 2;
  const gradAnchor: Pt = analysis.xStar && inView(analysis.xStar, view) ? analysis.xStar : [view.x0 + (view.x1 - view.x0) * 0.12, view.y0 + (view.y1 - view.y0) * 0.12];
  const gradLen = 0.14;
  const cmag = Math.hypot(model.c1 / (view.x1 - view.x0), model.c2 / (view.y1 - view.y0));
  const gTip: Pt =
    cmag > 0
      ? [gradAnchor[0] + ((model.c1 / (view.x1 - view.x0)) / cmag) * gradLen * (view.x1 - view.x0), gradAnchor[1] + ((model.c2 / (view.y1 - view.y0)) / cmag) * gradLen * (view.y1 - view.y0)]
      : gradAnchor;
  const improving = model.sense === 'max' ? 1 : -1;

  const isoLines: number[] = [];
  if (o.isoFamily && (model.c1 !== 0 || model.c2 !== 0)) {
    const corners: Pt[] = [
      [view.x0, view.y0],
      [view.x1, view.y0],
      [view.x0, view.y1],
      [view.x1, view.y1],
    ];
    const vals = corners.map((p) => model.c1 * p[0] + model.c2 * p[1]);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const st = niceStep(hi - lo, 10);
    for (let L = Math.ceil(lo / st) * st; L <= hi; L += st) isoLines.push(L);
  }

  const showOpt = o.optimum && !hideOptimumUntil && analysis.status === 'optimal';
  const optSeg =
    showOpt && analysis.classification === 'multiple-edge' && analysis.optimalVertices.length >= 2
      ? [analysis.optimalVertices[0].p, analysis.optimalVertices[1].p]
      : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="svg-plot block w-full touch-none select-none"
      style={height ? { height } : undefined}
      onPointerMove={onMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      onClick={(e) => {
        if (onPlotClick && !drag) onPlotClick(toData(e));
      }}
      role="img"
      aria-label="Grafisk fremstilling av LP-modellen"
    >
      <defs>
        <clipPath id="plotclip">
          <rect x={PAD.l} y={PAD.t} width={iw} height={ih} />
        </clipPath>
        <marker id="arrow-obj" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="rgb(var(--obj))" />
        </marker>
        <marker id="arrow-opt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="rgb(var(--opt))" />
        </marker>
        <marker id="arrow-ax" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="rgb(var(--mute))" />
        </marker>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgb(var(--mute))" strokeWidth="1" opacity="0.35" />
        </pattern>
      </defs>
      <rect x={PAD.l} y={PAD.t} width={iw} height={ih} fill="rgb(var(--panel))" />
      {/* grid */}
      <g clipPath="url(#plotclip)">
        {o.grid &&
          ticksX.map((t) => <line key={'gx' + t} x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={PAD.t + ih} stroke="rgb(var(--line))" strokeWidth={t === 0 ? 0 : 0.7} />)}
        {o.grid &&
          ticksY.map((t) => <line key={'gy' + t} y1={sy(t)} y2={sy(t)} x1={PAD.l} x2={PAD.l + iw} stroke="rgb(var(--line))" strokeWidth={t === 0 ? 0 : 0.7} />)}
        {/* half-planes (infeasible side) */}
        {o.halfPlanes &&
          cons.map((c) => {
            if (c.op === '=') return null;
            const poly = clippedRegion([{ ...c, op: c.op === '<=' ? '>=' : '<=' }], big);
            if (poly.length < 3) return null;
            return <path key={'hp' + c.id} d={'M' + poly.map((p) => `${sx(p[0])},${sy(p[1])}`).join('L') + 'Z'} fill="url(#hatch)" />;
          })}
        {/* feasible region */}
        {regionPath && !regionIsSegment && <path d={regionPath} fill="rgb(var(--feas))" fillOpacity={0.16} stroke="rgb(var(--feas))" strokeOpacity={0.5} strokeWidth={1} />}
        {regionIsSegment && region.length >= 2 && (
          <SegmentFromPoly poly={region} sx={sx} sy={sy} />
        )}
        {/* iso family */}
        {isoLines.map((L) => {
          const seg = lineInView(model.c1, model.c2, L, view);
          if (!seg) return null;
          return (
            <g key={'iso' + L}>
              <line x1={sx(seg[0][0])} y1={sy(seg[0][1])} x2={sx(seg[1][0])} y2={sy(seg[1][1])} stroke="rgb(var(--obj))" strokeOpacity={0.28} strokeWidth={1} />
            </g>
          );
        })}
        {/* ghost constraints (e.g. previous position) */}
        {ghostConstraints?.map((c) => {
          const seg = lineInView(c.a1, c.a2, c.b, view);
          if (!seg) return null;
          return <line key={'gh' + c.id} x1={sx(seg[0][0])} y1={sy(seg[0][1])} x2={sx(seg[1][0])} y2={sy(seg[1][1])} stroke="rgb(var(--mute))" strokeDasharray="3 4" strokeWidth={1.2} />;
        })}
        {/* constraints */}
        {userCons.map((c, i) => {
          const seg = lineInView(c.a1, c.a2, c.b, view);
          if (!seg) return null;
          const binding = o.binding && analysis.status === 'optimal' && analysis.binding.includes(c.id);
          const hl = highlightConstraints?.includes(c.id);
          const col = conColor(i);
          return (
            <g key={c.id}>
              <line
                x1={sx(seg[0][0])}
                y1={sy(seg[0][1])}
                x2={sx(seg[1][0])}
                y2={sy(seg[1][1])}
                stroke={col}
                strokeWidth={hl ? 4 : binding ? 2.6 : 1.8}
                strokeDasharray={o.binding && analysis.status === 'optimal' && !binding ? '7 5' : undefined}
              />
              {(onConstraint || onConstraintClick) && (
                <line
                  x1={sx(seg[0][0])}
                  y1={sy(seg[0][1])}
                  x2={sx(seg[1][0])}
                  y2={sy(seg[1][1])}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: onConstraint ? 'grab' : 'pointer' }}
                  onPointerDown={(e) => {
                    if (!onConstraint) return;
                    e.stopPropagation();
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                    setDrag({ kind: 'line', id: c.id });
                  }}
                  onClick={(e) => {
                    if (onConstraintClick) {
                      e.stopPropagation();
                      onConstraintClick(c.id);
                    }
                  }}
                >
                  <title>{onConstraint ? 'Dra for å endre høyresiden b' : 'Klikk for å velge'}</title>
                </line>
              )}
            </g>
          );
        })}
        {/* nonnegativity axes highlight when binding */}
        {/* objective isoquant */}
        {o.isoquant && objLevel !== null && objLevel !== undefined && (model.c1 !== 0 || model.c2 !== 0) && (() => {
          const seg = lineInView(model.c1, model.c2, objLevel, view);
          if (!seg) return null;
          return (
            <g>
              <line x1={sx(seg[0][0])} y1={sy(seg[0][1])} x2={sx(seg[1][0])} y2={sy(seg[1][1])} stroke="rgb(var(--obj))" strokeWidth={2.4} strokeDasharray="10 4" />
              {onObjLevel && (
                <line
                  x1={sx(seg[0][0])}
                  y1={sy(seg[0][1])}
                  x2={sx(seg[1][0])}
                  y2={sy(seg[1][1])}
                  stroke="transparent"
                  strokeWidth={18}
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDrag({ kind: 'iso' });
                  }}
                >
                  <title>Dra objektivlinjen (isokvant)</title>
                </line>
              )}
            </g>
          );
        })()}
        {/* optimal set */}
        {showOpt && optSeg && (
          <line x1={sx(optSeg[0][0])} y1={sy(optSeg[0][1])} x2={sx(optSeg[1][0])} y2={sy(optSeg[1][1])} stroke="rgb(var(--opt))" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        )}
        {showOpt && analysis.classification === 'multiple-ray' && analysis.optimalRay && (() => {
          const { from, dir } = analysis.optimalRay;
          const far = 4 * Math.max(view.x1 - view.x0, view.y1 - view.y0);
          const n = Math.hypot(dir[0], dir[1]) || 1;
          const to: Pt = [from[0] + (dir[0] / n) * far, from[1] + (dir[1] / n) * far];
          return <line x1={sx(from[0])} y1={sy(from[1])} x2={sx(to[0])} y2={sy(to[1])} stroke="rgb(var(--opt))" strokeWidth={6} strokeLinecap="round" opacity={0.85} />;
        })()}
        {analysis.status === 'unbounded' && o.optimum && analysis.unboundedDir && (() => {
          const d = analysis.unboundedDir;
          const n = Math.hypot(d[0] / (view.x1 - view.x0), d[1] / (view.y1 - view.y0)) || 1;
          const start: Pt = analysis.vertices[0]?.p ?? [cx, cy];
          const L = 0.3;
          const to: Pt = [start[0] + (d[0] / n) * L, start[1] + (d[1] / n) * L];
          return (
            <line x1={sx(start[0])} y1={sy(start[1])} x2={sx(to[0])} y2={sy(to[1])} stroke="rgb(var(--opt))" strokeWidth={3} markerEnd="url(#arrow-opt)" strokeDasharray="6 4" />
          );
        })()}
        {segments?.map((s, k) => (
          <line key={'seg' + k} x1={sx(s.a[0])} y1={sy(s.a[1])} x2={sx(s.b[0])} y2={sy(s.b[1])} stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dash} />
        ))}
        {/* integer lattice */}
        {o.intGrid && <IntGrid view={view} sx={sx} sy={sy} cons={cons} />}
      </g>
      {/* axes */}
      {view.y0 <= 0 && view.y1 >= 0 && <line x1={PAD.l} x2={PAD.l + iw + 6} y1={sy(0)} y2={sy(0)} stroke="rgb(var(--mute))" strokeWidth={1.2} markerEnd="url(#arrow-ax)" />}
      {view.x0 <= 0 && view.x1 >= 0 && <line y1={PAD.t + ih} y2={PAD.t - 6} x1={sx(0)} x2={sx(0)} stroke="rgb(var(--mute))" strokeWidth={1.2} markerEnd="url(#arrow-ax)" />}
      {ticksX.map((t) => (
        <text key={'tx' + t} x={sx(t)} y={PAD.t + ih + 16} fontSize={11} textAnchor="middle" fill="rgb(var(--mute))">
          {fmtTick(t)}
        </text>
      ))}
      {ticksY.map((t) => (
        <text key={'ty' + t} x={PAD.l - 6} y={sy(t) + 4} fontSize={11} textAnchor="end" fill="rgb(var(--mute))">
          {fmtTick(t)}
        </text>
      ))}
      <text x={PAD.l + iw - 4} y={PAD.t + ih + 30} fontSize={13} textAnchor="end" fill="rgb(var(--ink))" fontStyle="italic">
        {subName(axisNames[0])}
      </text>
      <text x={PAD.l + 6} y={PAD.t + 12} fontSize={13} fill="rgb(var(--ink))" fontStyle="italic">
        {subName(axisNames[1])}
      </text>
      {/* constraint labels and intercept handles */}
      <g clipPath="url(#plotclip)">
        {o.constraintLabels &&
          userCons.map((c, i) => {
            const seg = lineInView(c.a1, c.a2, c.b, view);
            if (!seg) return null;
            const t = 0.82;
            const p: Pt = [seg[0][0] + (seg[1][0] - seg[0][0]) * t, seg[0][1] + (seg[1][1] - seg[0][1]) * t];
            const lp: Pt = [sx(p[0]), sy(p[1])];
            const lbl = labelFor ? labelFor(c, i) : `(${i + 1})`;
            return (
              <g key={'lbl' + c.id}>
                <rect x={lp[0] - 3} y={lp[1] - 13} width={lbl.length * 7 + 6} height={16} rx={3} fill="rgb(var(--panel))" opacity={0.85} />
                <text x={lp[0]} y={lp[1]} fontSize={12} fontWeight={600} fill={conColor(i)}>
                  {lbl}
                </text>
              </g>
            );
          })}
        {o.intercepts &&
          onConstraint &&
          userCons.map((c, i) => {
            const hs: ReactNode[] = [];
            if (c.a1 !== 0 && c.b !== 0) {
              const u = c.b / c.a1;
              if (u >= view.x0 && u <= view.x1 && 0 >= view.y0 && 0 <= view.y1)
                hs.push(
                  <Handle key="ix" x={sx(u)} y={sy(0)} color={conColor(i)} title={`x₁-skjæringspunkt (${fmtNum(u)}, 0): dra for å endre a₁`} onDown={() => setDrag({ kind: 'ix', id: c.id })} />,
                );
            }
            if (c.a2 !== 0 && c.b !== 0) {
              const v = c.b / c.a2;
              if (v >= view.y0 && v <= view.y1 && 0 >= view.x0 && 0 <= view.x1)
                hs.push(
                  <Handle key="iy" x={sx(0)} y={sy(v)} color={conColor(i)} title={`x₂-skjæringspunkt (0, ${fmtNum(v)}): dra for å endre a₂`} onDown={() => setDrag({ kind: 'iy', id: c.id })} />,
                );
            }
            return <g key={'h' + c.id}>{hs}</g>;
          })}
        {/* vertices */}
        {o.vertices &&
          analysis.status !== 'infeasible' &&
          analysis.vertices.map((v, k) => {
            const isOpt = showOpt && analysis.optimalVertices.some((w) => w.p[0] === v.p[0] && w.p[1] === v.p[1]);
            const degenerate = v.active.length > 2;
            return (
              <g key={'v' + k}>
                <circle cx={sx(v.p[0])} cy={sy(v.p[1])} r={isOpt ? 6.5 : 4.2} fill={isOpt ? 'rgb(var(--opt))' : 'rgb(var(--panel))'} stroke={isOpt ? 'rgb(var(--opt))' : 'rgb(var(--ink))'} strokeWidth={1.6} />
                {degenerate && <circle cx={sx(v.p[0])} cy={sy(v.p[1])} r={10} fill="none" stroke="rgb(var(--warn))" strokeWidth={1.4} strokeDasharray="2 2" />}
                {o.vertexLabels && (
                  <text x={sx(v.p[0]) + 7} y={sy(v.p[1]) - 7} fontSize={11} fill="rgb(var(--ink))" opacity={0.85}>
                    ({fmtNum(v.p[0])}, {fmtNum(v.p[1])})
                  </text>
                )}
              </g>
            );
          })}
        {showOpt && analysis.xStar && analysis.classification === 'unique' && !analysis.vertices.some((v) => v.p[0] === analysis.xStar![0] && v.p[1] === analysis.xStar![1]) && (
          <circle cx={sx(analysis.xStar[0])} cy={sy(analysis.xStar[1])} r={6.5} fill="rgb(var(--opt))" />
        )}
        {points?.map((pt, k) => (
          <g key={'pt' + k} style={{ cursor: pt.onClick ? 'pointer' : undefined }} onClick={(e) => {
            if (pt.onClick) {
              e.stopPropagation();
              pt.onClick();
            }
          }}>
            {pt.ring && <circle cx={sx(pt.p[0])} cy={sy(pt.p[1])} r={(pt.r ?? 5) + 4} fill="none" stroke={pt.color ?? 'rgb(var(--ink))'} strokeWidth={2} />}
            <circle cx={sx(pt.p[0])} cy={sy(pt.p[1])} r={pt.r ?? 5} fill={pt.color ?? 'rgb(var(--ink))'} stroke="rgb(var(--panel))" strokeWidth={1.2} />
            {pt.onClick && <circle cx={sx(pt.p[0])} cy={sy(pt.p[1])} r={12} fill="transparent" />}
            {pt.label && (
              <text x={sx(pt.p[0]) + 8} y={sy(pt.p[1]) + 14} fontSize={11} fontWeight={600} fill={pt.color ?? 'rgb(var(--ink))'}>
                {pt.label}
              </text>
            )}
            {pt.title && <title>{pt.title}</title>}
          </g>
        ))}
        {/* gradient arrow */}
        {o.gradient && (model.c1 !== 0 || model.c2 !== 0) && (
          <g>
            <line
              x1={sx(gradAnchor[0])}
              y1={sy(gradAnchor[1])}
              x2={sx(gradAnchor[0] + improving * (gTip[0] - gradAnchor[0]))}
              y2={sy(gradAnchor[1] + improving * (gTip[1] - gradAnchor[1]))}
              stroke="rgb(var(--obj))"
              strokeWidth={2.4}
              markerEnd="url(#arrow-obj)"
            />
            {onObjective && (
              <circle
                cx={sx(gradAnchor[0] + improving * (gTip[0] - gradAnchor[0]))}
                cy={sy(gradAnchor[1] + improving * (gTip[1] - gradAnchor[1]))}
                r={9}
                fill="rgb(var(--obj))"
                fillOpacity={0.18}
                stroke="rgb(var(--obj))"
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setDrag({ kind: 'grad' });
                }}
              >
                <title>Dra for å rotere målfunksjonens retning (forbedringsretning)</title>
              </circle>
            )}
          </g>
        )}
        {children?.({ sx, sy })}
      </g>
    </svg>
  );
}

function SegmentFromPoly({ poly, sx, sy }: { poly: Pt[]; sx: (x: number) => number; sy: (y: number) => number }) {
  // farthest pair
  let best: [Pt, Pt] = [poly[0], poly[0]];
  let d = -1;
  for (const p of poly)
    for (const q of poly) {
      const dd = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (dd > d) {
        d = dd;
        best = [p, q];
      }
    }
  return <line x1={sx(best[0][0])} y1={sy(best[0][1])} x2={sx(best[1][0])} y2={sy(best[1][1])} stroke="rgb(var(--feas))" strokeWidth={7} strokeOpacity={0.45} strokeLinecap="round" />;
}

function IntGrid({ view, sx, sy, cons }: { view: View; sx: (x: number) => number; sy: (y: number) => number; cons: Constraint2D[] }) {
  const pts: ReactNode[] = [];
  const span = Math.max(view.x1 - view.x0, view.y1 - view.y0);
  if (span > 60) return null;
  for (let x = Math.ceil(view.x0); x <= view.x1; x++)
    for (let y = Math.ceil(view.y0); y <= view.y1; y++) {
      const f = feasible(cons, [x, y]);
      pts.push(<circle key={`${x},${y}`} cx={sx(x)} cy={sy(y)} r={f ? 3.2 : 1.6} fill={f ? 'rgb(var(--feas))' : 'rgb(var(--mute))'} opacity={f ? 0.95 : 0.45} />);
    }
  return <g>{pts}</g>;
}

function Handle({ x, y, color, title, onDown }: { x: number; y: number; color: string; title: string; onDown: () => void }) {
  return (
    <g style={{ cursor: 'grab' }} onPointerDown={(e) => {
      e.stopPropagation();
      onDown();
    }}>
      <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill="rgb(var(--panel))" stroke={color} strokeWidth={2} />
      <circle cx={x} cy={y} r={14} fill="transparent" />
      <title>{title}</title>
    </g>
  );
}

function fmtTick(t: number) {
  if (Math.abs(t) >= 1000) return String(+t.toPrecision(4));
  return String(+t.toFixed(4));
}

function inView(p: Pt, v: View) {
  return p[0] >= v.x0 && p[0] <= v.x1 && p[1] >= v.y0 && p[1] <= v.y1;
}

function polyArea(poly: Pt[]) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
}

function subName(n: string) {
  return n.replace(/_\{?(\d+)\}?/g, (_, d: string) => d.split('').map((c) => '₀₁₂₃₄₅₆₇₈₉'[+c]).join(''));
}
