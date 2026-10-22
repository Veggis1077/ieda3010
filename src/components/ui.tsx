import { ReactNode, useEffect, useState } from 'react';
import { parseNumber } from '../math/linparse';

export function NumberInput({
  value,
  onChange,
  className = '',
  width = 'w-16',
  ariaLabel,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  width?: string;
  ariaLabel?: string;
  step?: number;
}) {
  const [txt, setTxt] = useState(String(value));
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    if (!focus) setTxt(String(+value.toFixed(6)));
  }, [value, focus]);
  const commit = (s: string) => {
    const v = parseNumber(s);
    if (v !== null && isFinite(v)) onChange(v);
    else setTxt(String(value));
  };
  return (
    <input
      aria-label={ariaLabel}
      className={`input ${width} px-1.5 py-0.5 text-right font-mono text-[13px] ${className}`}
      value={txt}
      inputMode="decimal"
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        setFocus(false);
        commit(e.target.value);
      }}
      onChange={(e) => {
        setTxt(e.target.value);
        const v = parseNumber(e.target.value);
        if (v !== null && isFinite(v)) onChange(v);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (step && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          onChange(+(value + (e.key === 'ArrowUp' ? step : -step)).toFixed(6));
        }
      }}
    />
  );
}

export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  className = '',
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      className={`w-full ${className}`}
      min={min}
      max={max}
      step={step}
      value={Math.min(max, Math.max(min, value))}
      onChange={(e) => onChange(+e.target.value)}
    />
  );
}

export function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-sm text-ink">
      <input type="checkbox" className="h-3.5 w-3.5 accent-[rgb(var(--accent))]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, size = 'sm' }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; size?: 'sm' | 'xs' }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-sunk p-0.5" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded px-2.5 ${size === 'xs' ? 'py-0.5 text-xs' : 'py-1 text-sm'} font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            value === o.value ? 'bg-panel text-ink shadow-sm' : 'text-mute hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Panel({ title, children, actions, className = '' }: { title?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`card min-w-0 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="flex items-center gap-1">{actions}</div>
        </header>
      )}
      <div className="min-w-0 overflow-x-auto p-3">{children}</div>
    </section>
  );
}

export function Badge({ tone = 'mute', children }: { tone?: 'mute' | 'good' | 'bad' | 'warn' | 'accent' | 'opt' | 'obj' | 'dual'; children: ReactNode }) {
  const cls: Record<string, string> = {
    mute: 'bg-sunk text-mute border-line',
    good: 'bg-good/10 text-good border-good/30',
    bad: 'bg-bad/10 text-bad border-bad/30',
    warn: 'bg-warn/10 text-warn border-warn/30',
    accent: 'bg-accent/10 text-accent border-accent/30',
    opt: 'bg-opt/10 text-opt border-opt/30',
    obj: 'bg-obj/10 text-obj border-obj/30',
    dual: 'bg-dual/10 text-dual border-dual/30',
  };
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${cls[tone]}`}>{children}</span>;
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: ReactNode }[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            value === t.id ? 'border-accent text-ink' : 'border-transparent text-mute hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, className = '', tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'good' | 'warn' | 'bad' }) {
  const c = { accent: 'bg-accent', good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad' }[tone];
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-sunk ${className}`} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${c} transition-[width] duration-500`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6">
      {kicker && <div className="label mb-1">{kicker}</div>}
      <h1 className="text-2xl font-semibold tracking-tight md:text-[1.7rem]">{title}</h1>
      {children && <div className="mt-2 max-w-3xl text-[0.95rem] text-mute">{children}</div>}
    </header>
  );
}
