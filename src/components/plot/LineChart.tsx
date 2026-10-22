import { useRef } from 'react';
import { niceStep } from './LPPlot';

export interface Series {
  pts: { x: number; y: number | null }[];
  color: string;
  width?: number;
  dash?: string;
  label?: string;
}

interface Props {
  series: Series[];
  xLabel: string;
  yLabel: string;
  current?: { x: number; y: number | null };
  band?: { from: number; to: number; label?: string };
  breakpoints?: number[];
  onPick?: (x: number) => void;
  xDomain?: [number, number];
  height?: number;
  dashedLine?: { x0: number; y0: number; x1: number; y1: number; color: string; label?: string };
}

const W = 600;
const H = 260;
const P = { l: 52, r: 14, t: 14, b: 34 };

export function LineChart({ series, xLabel, yLabel, current, band, breakpoints, onPick, xDomain, height, dashedLine }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const xs = series.flatMap((s) => s.pts.map((p) => p.x));
  const ys = series.flatMap((s) => s.pts.map((p) => p.y).filter((y): y is number => y !== null && isFinite(y)));
  if (dashedLine) ys.push(dashedLine.y0, dashedLine.y1);
  const x0 = xDomain ? xDomain[0] : Math.min(...xs);
  const x1 = xDomain ? xDomain[1] : Math.max(...xs);
  let y0 = Math.min(...ys, 0);
  let y1 = Math.max(...ys, 1);
  const padY = (y1 - y0) * 0.08 || 1;
  y0 -= y0 < 0 ? padY : 0;
  y1 += padY;
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  const sx = (x: number) => P.l + ((x - x0) / (x1 - x0 || 1)) * iw;
  const sy = (y: number) => P.t + ih - ((y - y0) / (y1 - y0 || 1)) * ih;
  const stx = niceStep(x1 - x0, 8);
  const sty = niceStep(y1 - y0, 5);
  const tx: number[] = [];
  for (let t = Math.ceil(x0 / stx) * stx; t <= x1 + 1e-9; t += stx) tx.push(+t.toFixed(8));
  const ty: number[] = [];
  for (let t = Math.ceil(y0 / sty) * sty; t <= y1 + 1e-9; t += sty) ty.push(+t.toFixed(8));
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onPick || !ref.current) return;
    const pt = ref.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(ref.current.getScreenCTM()!.inverse());
    const x = x0 + ((q.x - P.l) / iw) * (x1 - x0);
    onPick(Math.min(x1, Math.max(x0, x)));
  };
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="svg-plot block w-full touch-none select-none"
      style={height ? { height } : undefined}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => e.buttons && pick(e)}
      role="img"
      aria-label={`${yLabel} som funksjon av ${xLabel}`}
    >
      <rect x={P.l} y={P.t} width={iw} height={ih} fill="rgb(var(--panel))" />
      {band && (
        <rect
          x={sx(Math.max(x0, band.from))}
          y={P.t}
          width={Math.max(0, sx(Math.min(x1, band.to)) - sx(Math.max(x0, band.from)))}
          height={ih}
          fill="rgb(var(--dual))"
          opacity={0.1}
        />
      )}
      {tx.map((t) => (
        <g key={'x' + t}>
          <line x1={sx(t)} x2={sx(t)} y1={P.t} y2={P.t + ih} stroke="rgb(var(--line))" strokeWidth={0.7} />
          <text x={sx(t)} y={P.t + ih + 14} fontSize={11} fill="rgb(var(--mute))" textAnchor="middle">
            {+t.toFixed(4)}
          </text>
        </g>
      ))}
      {ty.map((t) => (
        <g key={'y' + t}>
          <line y1={sy(t)} y2={sy(t)} x1={P.l} x2={P.l + iw} stroke="rgb(var(--line))" strokeWidth={0.7} />
          <text x={P.l - 6} y={sy(t) + 4} fontSize={11} fill="rgb(var(--mute))" textAnchor="end">
            {+t.toFixed(4)}
          </text>
        </g>
      ))}
      {breakpoints?.map((b) =>
        b >= x0 && b <= x1 ? <line key={'bp' + b} x1={sx(b)} x2={sx(b)} y1={P.t} y2={P.t + ih} stroke="rgb(var(--warn))" strokeDasharray="4 3" strokeWidth={1.2} /> : null,
      )}
      {dashedLine && (
        <line x1={sx(dashedLine.x0)} y1={sy(dashedLine.y0)} x2={sx(dashedLine.x1)} y2={sy(dashedLine.y1)} stroke={dashedLine.color} strokeDasharray="6 4" strokeWidth={1.5} />
      )}
      {series.map((s, k) => {
        let d = '';
        let pen = false;
        for (const p of s.pts) {
          if (p.y === null || !isFinite(p.y)) {
            pen = false;
            continue;
          }
          d += `${pen ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`;
          pen = true;
        }
        return <path key={k} d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash} strokeLinejoin="round" />;
      })}
      {current && (
        <g>
          <line x1={sx(current.x)} x2={sx(current.x)} y1={P.t} y2={P.t + ih} stroke="rgb(var(--ink))" strokeWidth={1} opacity={0.5} />
          {current.y !== null && <circle cx={sx(current.x)} cy={sy(current.y)} r={5.5} fill="rgb(var(--opt))" stroke="rgb(var(--panel))" strokeWidth={1.5} />}
        </g>
      )}
      <line x1={P.l} x2={P.l + iw} y1={P.t + ih} y2={P.t + ih} stroke="rgb(var(--mute))" />
      <line x1={P.l} x2={P.l} y1={P.t} y2={P.t + ih} stroke="rgb(var(--mute))" />
      <text x={P.l + iw} y={H - 4} fontSize={12} textAnchor="end" fill="rgb(var(--ink))">
        {xLabel}
      </text>
      <text x={8} y={P.t + 4} fontSize={12} fill="rgb(var(--ink))" transform={`rotate(-90 8 ${P.t + 4})`} textAnchor="end">
        {yLabel}
      </text>
    </svg>
  );
}
