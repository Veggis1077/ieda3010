import { useMemo, useState } from 'react';
import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { LPPlot, View } from '../../components/plot/LPPlot';
import { analyze, Model2D } from '../../math/lp2d';
import { M } from '../../components/Math';
import { Slider } from '../../components/ui';
import { LPLab } from '../../labs/LPLab';

const r = String.raw;

const STEPS: { title: string; tex: string; model: Model2D }[] = [
  { title: 'x₁ ≥ 0', tex: 'x_1 \\ge 0', model: { sense: 'max', c1: 1, c2: 1, nonneg: false, constraints: [{ id: 'a', a1: 1, a2: 0, op: '>=', b: 0 }] } },
  { title: '+ x₂ ≥ 0', tex: 'x_1, x_2 \\ge 0', model: { sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: [] } },
  { title: '+ x₁ + 2x₂ ≤ 3', tex: 'x_1 + 2x_2 \\le 3', model: { sense: 'max', c1: 1, c2: 1, nonneg: true, constraints: [{ id: 'c1', a1: 1, a2: 2, op: '<=', b: 3 }] } },
  {
    title: '+ 2x₁ + x₂ ≤ 3',
    tex: '2x_1 + x_2 \\le 3',
    model: {
      sense: 'max',
      c1: 1,
      c2: 1,
      nonneg: true,
      constraints: [
        { id: 'c1', a1: 1, a2: 2, op: '<=', b: 3 },
        { id: 'c2', a1: 2, a2: 1, op: '<=', b: 3 },
      ],
    },
  },
];

function HalfPlaneStepper() {
  const [k, setK] = useState(0);
  const [L, setL] = useState(1);
  const model = STEPS[k].model;
  const a = useMemo(() => analyze(model), [model]);
  const view: View = { x0: -1.2, x1: 3.4, y0: -1.2, y1: 3.4 };
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-1.5 border-b border-line p-2">
        {STEPS.map((s, i) => (
          <button key={i} className={`btn ${i === k ? 'border-accent bg-accent/10' : ''}`} onClick={() => setK(i)}>
            {s.title}
          </button>
        ))}
      </div>
      <LPPlot
        model={model}
        analysis={a}
        view={view}
        objLevel={k === 3 ? L : null}
        options={{ vertices: k >= 2, vertexLabels: true, optimum: k === 3 && L >= 2 - 1e-9, isoquant: k === 3, gradient: k === 3, halfPlanes: true, grid: true, constraintLabels: true, binding: false }}
      />
      <div className="border-t border-line px-3 py-2 text-sm">
        {k < 3 ? (
          <span className="text-mute">
            Skravert = den delen av planet som <strong>ikke</strong> oppfyller restriksjonene. Det hvite/blå området er snittet av halvplanene så langt.
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-obj">
              <M>{`x_1 + x_2 = ${L.toFixed(2)}`}</M>
            </span>
            <Slider value={L} min={0} max={3} step={0.05} onChange={setL} label="isokvantnivå" />
            <span className="whitespace-nowrap text-xs text-mute">{L > 2 + 1e-9 ? 'Utenfor området!' : L >= 2 - 1e-9 ? 'Optimum (1, 1)' : 'Kan økes'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LO4() {
  return (
    <div className="space-y-10">
      <Concept id="halfplanes" title="Restriksjoner som halvplan">
        <Step kind="intuition">
          <T>{r`Med $n$ beslutningsvariabler lever vi i et $n$-dimensjonalt rom; hver løsning er et **punkt**. Med to variabler kan vi tegne alt. En lineær ulikhet deler planet i to: den ene siden er lov, den andre ikke. Det tillatte området er det som overlever **alle** delingene.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`- Hver **ulikhetsrestriksjon** definerer et **halvrom** (half-space; halvplan i 2D), avgrenset av linjen der den holder med likhet.
- Hver **likhetsrestriksjon** definerer et **hyperplan** (en linje i 2D).
- **Tillatt område** (feasible region): mengden av alle tillatte løsninger – snittet av alle restriksjonene; i 2D en polygon.
- **Hjørnepunkter** (extreme points / corner-point feasible, CPF): hjørner på randen av det tillatte området.
- **Ikke-tillatt problem** (infeasible): tomt tillatt område.
- **Redundant restriksjon**: å legge til eller fjerne den endrer ikke det tillatte området.`}</T>
        </Step>
        <Step kind="geometry" title="Bygg området fra lysbildene (LO2 s. 16–21)">
          <Lab caption="Klikk deg gjennom restriksjonene i forelesningens eksempel. Til slutt: flytt isokvanten x₁ + x₂ = k.">
            <HalfPlaneStepper />
          </Lab>
        </Step>
        <Step kind="example">
          <T>{r`Eksemplet $\max x_1 + x_2$ s.t. $x_1 + 2x_2 \le 3$, $2x_1 + x_2 \le 3$, $x\ge0$ har hjørnene $(0,0)$, $(1.5,0)$, $(0,1.5)$ og $(1,1)$. For å tegne en restriksjon: finn skjæringspunktene med aksene ($x_1 + 2x_2 = 3$ gir $(3,0)$ og $(0,1.5)$), og test origo: $0 \le 3$ ✓ ⇒ origo-siden er tillatt.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-g1" />
        </Step>
      </Concept>

      <Concept id="objective" title="Isokvanter og optimal løsning">
        <Step kind="definition">
          <T>{r`En **isokvant** (isoquant) er en linje der alle punkter har samme objektivverdi: $c_1x_1 + c_2x_2 = k$. Ulike $k$ gir **parallelle** linjer. Vektoren $(c_1, c_2)$ peker i retningen der $Z$ øker raskest (normalvektoren til isokvantene).

**Optimal løsning**: den beste tillatte løsningen. For å finne den geometrisk: skyv isokvanten i retningen definert av målfunksjonen (for max: langs $c$; for min: langs $-c$) til den bare så vidt berører det tillatte området.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Dra den oransje stiplede isokvanten, eller bruk «Skyv til optimum». Prøv også å rotere målfunksjonen ved å dra pilspissen.">
            <LPLab presetId="wyndor" compact showPresets={false} />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-g6" />
        </Step>
      </Concept>

      <Concept id="binding" title="Bindende restriksjoner og slakk">
        <Step kind="definition">
          <T>{r`- **Bindende** (active) restriksjon: oppfylt med **likhet** i optimal løsning. Alle likhetsrestriksjoner er bindende per definisjon.
- **Ikke-bindende** (inactive): oppfylt med streng ulikhet.
- **Slakk** (slack) = RHS − LHS (for $\le$); bindende restriksjoner har slakk 0.
- Geometrisk: bindende restriksjoner er de som **går gjennom** optimum.

Forelesningens eksempel, optimum $(1,1)$:

| Restriksjon | Bindende? | Slakk |
|---|---|---|
| $x_1 + 2x_2 \le 3$ | ja | 0 |
| $2x_1 + x_2 \le 3$ | ja | 0 |
| $x_1 \ge 0$ | nei | 1 |
| $x_2 \ge 0$ | nei | 1 |

Hvorfor viktig? Bindende restriksjoner er de som **holder Z tilbake** – det er disse som har verdi å slakke på (skyggepris > 0, se LO3).`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-g5" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-g8" />
        </Step>
      </Concept>

      <Concept id="extreme" title="Hjørnepunktteoremet">
        <Step kind="definition">
          <T>{r`**Teorem (LO2 s. 26).** For ethvert tillatt LP med endelig optimal løsning finnes det en optimal løsning som er et hjørnepunkt.

Konsekvens (LO2 s. 34): uendelig mange tillatte løsninger, men bare et **endelig** antall hjørnepunkter – høyst $\binom{n+m}{m}$ for $n$ variabler og $m$ funksjonelle restriksjoner. Derfor kan vi lete blant hjørnene. Simpleksmetoden (Dantzig) gjør nettopp dette smart.`}</T>
        </Step>
        <Step kind="geometry">
          <T>{r`I to dimensjoner er et hjørne snittet av **to** restriksjonsgrenser som er tillatt. Ikke alle skjæringspunkter er hjørner: Wyndor har skjæringene $(0,9)$, $(4,6)$, $(6,0)$ som **ikke er tillatte** (corner-point infeasible).

Hvis flere enn $n$ restriksjoner er aktive i samme hjørne, kalles hjørnet **degenerert** (supplerende begrep). Prøv preset «Degenerasjon og redundans» i laboratoriet: $x_1 + x_2 \le 8$ går gjennom $(2,6)$, er redundant og gjør hjørnet degenerert.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-s4" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Å evaluere $Z$ i et skjæringspunkt uten å sjekke at det er tillatt.
- Å tro at alle optimale løsninger er hjørner (flere optima: hele kanten).
- Å glemme ikke-negativitetsrestriksjonene som «linjer» – aksene gir også hjørner.
- Å tegne halvplanet på feil side: test alltid et punkt (f.eks. origo).`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Variabel ↔ dimensjon; løsning ↔ punkt.
- Ulikhet ↔ halvrom; likhet ↔ hyperplan; alle sammen ↔ tillatt område (konveks polygon).
- Isokvanter $c^\top x = k$ er parallelle; skyv i retning $c$ (max).
- Bindende = går gjennom optimum, slakk 0.
- Finnes endelig optimum ⇒ et hjørne er optimalt. #hjørner $\le \binom{n+m}{m}$.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
