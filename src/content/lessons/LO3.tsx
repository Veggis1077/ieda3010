import { Concept, Step, T, Ex } from '../../components/LessonBlocks';
import { useState } from 'react';
import { Segmented } from '../../components/ui';
import { M } from '../../components/Math';

const r = String.raw;

type Case = 'ok' | 'startup' | 'increasing' | 'decreasing';
const PROFIT: Record<Case, number[]> = {
  ok: [0, 3, 6, 9, 12],
  startup: [0, 2, 5, 8, 11],
  increasing: [0, 3, 7, 12, 18],
  decreasing: [0, 3, 5, 6, 6],
};
const LABEL: Record<Case, string> = { ok: 'Proporsjonal', startup: 'Oppstartskostnad', increasing: 'Økende marginalavkastning', decreasing: 'Avtakende marginalavkastning' };

function ProportionalityViz() {
  const [c, setC] = useState<Case>('startup');
  const W = 320;
  const H = 180;
  const sx = (x: number) => 30 + x * 65;
  const sy = (y: number) => H - 20 - y * 8;
  return (
    <div className="card p-3">
      <Segmented
        size="xs"
        value={c}
        onChange={setC}
        options={(Object.keys(LABEL) as Case[]).map((k) => ({ value: k, label: LABEL[k] }))}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full max-w-md">
        <line x1={30} y1={H - 20} x2={W - 10} y2={H - 20} stroke="rgb(var(--mute))" />
        <line x1={30} y1={10} x2={30} y2={H - 20} stroke="rgb(var(--mute))" />
        <polyline points={PROFIT.ok.map((y, x) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke="rgb(var(--mute))" strokeDasharray="4 3" />
        <polyline points={PROFIT[c].map((y, x) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke="rgb(var(--obj))" strokeWidth={2.5} />
        {PROFIT[c].map((y, x) => (
          <circle key={x} cx={sx(x)} cy={sy(y)} r={3.5} fill="rgb(var(--obj))" />
        ))}
        <text x={W - 12} y={H - 6} fontSize={11} textAnchor="end" fill="rgb(var(--ink))">
          x₁
        </text>
        <text x={34} y={18} fontSize={11} fill="rgb(var(--ink))">
          profitt fra produkt 1 ($1000/uke)
        </text>
      </svg>
      <p className="text-xs text-mute">
        Data fra LO2 s. 2 (Wyndor). Stiplet: proporsjonal <M>{'3x_1'}</M>. {c === 'ok' ? 'Antakelsen holder.' : 'Den heltrukne kurven bryter proporsjonalitet.'}
      </p>
    </div>
  );
}

export default function LO3() {
  return (
    <div className="space-y-10">
      <Concept id="assumptions" title="De fire LP-antakelsene">
        <Step kind="intuition">
          <T>{r`Et LP er en modell – og modellen er bare så god som antakelsene. Fire antakelser gjør at problemet blir **lineært**. Når de brytes, trenger vi andre verktøy (heltallsprogrammering, ikke-lineær optimering, robust optimering).`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`1. **Proporsjonalitet** (proportionality): bidraget fra aktivitet $j$ til målet og til hver restriksjon er proporsjonalt med aktivitetsnivået $x_j$ ($c_jx_j$, $a_{ij}x_j$).
2. **Additivitet** (additivity): hver funksjon er summen av bidragene fra de enkelte aktivitetene (ingen kryssledd).
3. **Delbarhet** (divisibility): variablene kan ta ikke-heltallige verdier.
4. **Sikkerhet** (certainty): alle parametere er kjente konstanter. Sjelden helt oppfylt ⇒ **sensitivitetsanalyse** etter at optimum er funnet.`}</T>
        </Step>
        <Step kind="experiment" title="Brudd på proporsjonalitet">
          <ProportionalityViz />
        </Step>
        <Step kind="example" title="Brudd på additivitet (LO2 s. 7–8)">
          <T>{r`- $Z = 3x_1 + 5x_2 + x_1x_2$: komplementære produkter (f.eks. felles reklamekampanje) øker felles profitt.
- $Z = 3x_1 + 5x_2 - x_1x_2$: konkurrerende produkter (f.eks. omstillingskostnader) reduserer felles profitt.

I begge tilfeller er kryssleddet $x_1x_2$ det som bryter additiviteten.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-a1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-a2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Oppstartskostnad er **proporsjonalitets**brudd, ikke additivitet.
- «Heltall» er brudd på **delbarhet** – løses med IP (diskret optimering).
- Usikre parametere bryter **sikkerhet** – sensitivitetsanalyse eller robust optimering (LO4).`}</T>
        </Step>
      </Concept>

      <Concept id="standard" title="Standardform og andre former">
        <Step kind="definition">
          <T>{r`Forelesningens **standardform** (LO2 s. 12):
$$\begin{aligned}\max\ & Z = c_1x_1 + c_2x_2 + \dots + c_nx_n\\ \text{s.t.}\ & a_{i1}x_1 + a_{i2}x_2 + \dots + a_{in}x_n \le b_i,\quad i = 1,\dots,m \quad\text{(funksjonelle restriksjoner)}\\ & x_1, x_2, \dots, x_n \ge 0 \quad\text{(ikke-negativitet)}\end{aligned}$$
Tolkning: $Z$ = samlet ytelsesmål, $x_j$ = nivå på aktivitet $j$, $c_j$ = økning i $Z$ per enhet av aktivitet $j$, $b_i$ = tilgjengelig mengde av ressurs $i$, $a_{ij}$ = mengde av ressurs $i$ brukt per enhet av aktivitet $j$.

**Andre former** (LO2 s. 13): minimering; funksjonelle restriksjoner med $\ge$; likhetsrestriksjoner; variabler som er frie i fortegn.`}</T>
        </Step>
        <Step kind="example" title="Omforming (supplerende)">
          <T>{r`Alle former kan skrives om til standardform: $\min Z \iff \max(-Z)$; $a^\top x \ge b \iff -a^\top x \le -b$; $a^\top x = b \iff a^\top x \le b$ og $a^\top x \ge b$; fri $x_j = x_j^+ - x_j^-$ med $x_j^\pm \ge 0$. Dette er nyttig når du skal lage dualen til et problem som ikke er på standardform.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-a3" />
        </Step>
        <Step kind="summary">
          <T>{r`- Antakelser: proporsjonalitet, additivitet, delbarhet, sikkerhet.
- Standardform: max, $\le$, $x \ge 0$. Andre former: min, $\ge$, $=$, fri variabel.
- Parametere: $c_j$ (bidrag), $b_i$ (ressurs), $a_{ij}$ (forbruk).`}</T>
        </Step>
      </Concept>
    </div>
  );
}
