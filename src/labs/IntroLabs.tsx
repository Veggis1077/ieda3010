import { useState } from 'react';
import { Panel, Badge, ProgressBar, NumberInput } from '../components/ui';
import { M } from '../components/Math';

export function LegoLab() {
  const [C, setC] = useState(0);
  const [T, setT] = useState(0);
  const [pc, setPc] = useState(40);
  const [pt, setPt] = useState(50);
  const [smallPerChair, setSmallPerChair] = useState(4);
  const big = C + 2 * T;
  const small = smallPerChair * C + 3 * T;
  const ok = big <= 10 && small <= 30;
  const profit = pc * C + pt * T;
  const [best, setBest] = useState<number | null>(null);
  const stepper = (v: number, set: (n: number) => void, label: string) => (
    <div className="flex items-center gap-2">
      <span className="w-14 text-sm">{label}</span>
      <button className="btn px-2" onClick={() => set(Math.max(0, v - 1))} aria-label={`færre ${label}`}>
        −
      </button>
      <span className="w-6 text-center font-mono text-lg">{v}</span>
      <button className="btn px-2" onClick={() => set(v + 1)} aria-label={`flere ${label}`}>
        +
      </button>
    </div>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="Bygg møbler">
        <div className="space-y-2">
          {stepper(C, setC, 'Stoler')}
          {stepper(T, setT, 'Bord')}
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <div className="flex justify-between">
              <span>Store klosser (2×4)</span>
              <span className={`font-mono ${big > 10 ? 'text-bad' : ''}`}>{big} / 10</span>
            </div>
            <ProgressBar value={big / 10} tone={big > 10 ? 'bad' : 'accent'} />
          </div>
          <div>
            <div className="flex justify-between">
              <span>Små klosser (2×2)</span>
              <span className={`font-mono ${small > 30 ? 'text-bad' : ''}`}>{small} / 30</span>
            </div>
            <ProgressBar value={small / 30} tone={small > 30 ? 'bad' : 'accent'} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md bg-sunk px-3 py-2">
          <span>Profitt</span>
          <span className="font-mono text-lg">${profit}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {ok ? <Badge tone="good">tillatt plan</Badge> : <Badge tone="bad">ikke nok klosser</Badge>}
          <button className="btn-ghost" onClick={() => ok && setBest((b) => Math.max(b ?? 0, profit))}>
            Lagre som beste forsøk
          </button>
          {best !== null && <span className="text-xs text-mute">Beste: ${best}</span>}
        </div>
      </Panel>
      <Panel title="Hva hvis …? (spørsmål fra forelesningen)">
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            Pris stol <NumberInput value={pc} onChange={setPc} width="w-16" /> pris bord <NumberInput value={pt} onChange={setPt} width="w-16" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            Små klosser per stol <NumberInput value={smallPerChair} onChange={setSmallPerChair} width="w-14" />
          </div>
          <div className="rounded-md bg-sunk px-3 py-2">
            <M>{`\\max\\ ${pc}C + ${pt}T \\quad\\text{s.t.}\\quad C + 2T \\le 10,\\ ${smallPerChair}C + 3T \\le 30,\\ C,T\\ge 0`}</M>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-mute">
            <li>Hvilken logikk brukte du for å finne løsningen? Hvordan vet du at den er optimal?</li>
            <li>Prøv bordpris $100, eller stolpris $100. Endres planen?</li>
            <li>Er det alltid optimalt å bruke opp alle klossene?</li>
            <li>Er det alltid bare én optimal løsning?</li>
          </ul>
          <p>Svaret (6 stoler, 2 bord, $340) finner du – og kan bevise – i det grafiske LP-laboratoriet.</p>
        </div>
      </Panel>
    </div>
  );
}

const WTP = [5000, 4000, 3000, 2000, 1000];
const NAMES = ['A', 'B', 'C', 'D', 'E'];

export function SegmentationLab() {
  const [seats, setSeats] = useState(4);
  const [price, setPrice] = useState(3000);
  const [split, setSplit] = useState(2); // high segment = first `split` customers
  const [pHigh, setPHigh] = useState(4000);
  const [pLow, setPLow] = useState(3000);
  const single = (p: number) => {
    const buyers = WTP.filter((w) => w >= p).length;
    return { buyers, rev: Math.min(buyers, seats) * p };
  };
  const seg = () => {
    const hi = WTP.slice(0, split).filter((w) => w >= pHigh).length;
    const lo = WTP.slice(split).filter((w) => w >= pLow).length;
    const hiSold = Math.min(hi, seats);
    const loSold = Math.min(lo, seats - hiSold);
    return { hi, lo, hiSold, loSold, rev: hiSold * pHigh + loSold * pLow };
  };
  const s = seg();
  const bestSingle = Math.max(...WTP.map((p) => single(p).rev));
  const bestSeg = (() => {
    let b = 0;
    for (let k = 1; k < 5; k++)
      for (const ph of WTP)
        for (const pl of WTP) {
          const hi = Math.min(WTP.slice(0, k).filter((w) => w >= ph).length, seats);
          const lo = Math.min(WTP.slice(k).filter((w) => w >= pl).length, seats - hi);
          b = Math.max(b, hi * ph + lo * pl);
        }
    return b;
  })();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="Én pris for alle">
        <div className="flex items-center gap-2 text-sm">
          Pris <NumberInput value={price} onChange={setPrice} width="w-20" step={1000} /> Seter <NumberInput value={seats} onChange={setSeats} width="w-14" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {WTP.map((w, i) => (
            <div key={i} className={`flex-1 rounded-md border px-1 py-2 text-center text-xs ${w >= price ? 'border-good bg-good/10' : 'border-line opacity-60'}`}>
              <div className="font-semibold">{NAMES[i]}</div>
              <div className="font-mono">${w}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          {single(price).buyers} vil kjøpe, {Math.min(single(price).buyers, seats)} får sete. Inntekt: <strong>${single(price).rev}</strong> (beste enkeltpris: ${bestSingle})
        </p>
      </Panel>
      <Panel title="To segmenter (prisdiskriminering)">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Høy-segment = de {split} første
          <input type="range" min={1} max={4} value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="segmentgrense" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          Pris høy <NumberInput value={pHigh} onChange={setPHigh} width="w-20" step={1000} /> pris lav <NumberInput value={pLow} onChange={setPLow} width="w-20" step={1000} />
        </div>
        <div className="mt-3 flex gap-1.5">
          {WTP.map((w, i) => {
            const hiSeg = i < split;
            const buys = hiSeg ? w >= pHigh : w >= pLow;
            return (
              <div key={i} className={`flex-1 rounded-md border px-1 py-2 text-center text-xs ${buys ? (hiSeg ? 'border-obj bg-obj/10' : 'border-good bg-good/10') : 'border-line opacity-60'}`}>
                <div className="font-semibold">{NAMES[i]}</div>
                <div className="font-mono">${w}</div>
                <div className="text-[10px] text-mute">{hiSeg ? 'høy' : 'lav'}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm">
          Inntekt: <strong>${s.rev}</strong> (beste med to segmenter: ${bestSeg}). Forelesningen: segmentering mellom B og C gir $12 000 mot $9 000 med én pris.
        </p>
      </Panel>
    </div>
  );
}
