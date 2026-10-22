import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { SensitivityLab } from '../../labs/SensitivityLab';
import { LPLab } from '../../labs/LPLab';

const r = String.raw;

export default function LO6() {
  return (
    <div className="space-y-10">
      <Concept id="cj" title="Endring i objektivkoeffisient cⱼ">
        <Step kind="intuition">
          <T>{r`Sikkerhetsantakelsen holder sjelden: priser endres. Sensitivitetsanalyse spør: hvor mye kan en parameter endres før anbefalingen endres? Lego: hvis stolprisen øker, bør vi lage flere stoler? Ikke nødvendigvis – optimum hopper først når isokvanten har rotert forbi en kant.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Endring i $c_j$ **roterer** isokvanten. **Sensitivitetsområdet** (range of optimality) for $c_j$ er verdiene der **nåværende optimale løsning forblir optimal**. Objektivverdien endres likevel: $Z^* = \sum_j c_jx_j^*$.

**To-variabel-regel:** et hjørne med bindende restriksjoner $i$ og $k$ er optimalt (max) når objektivlinjens stigning ligger mellom restriksjonenes stigninger:
$$\min\Big(-\tfrac{a_{i1}}{a_{i2}}, -\tfrac{a_{k1}}{a_{k2}}\Big) \;\le\; -\frac{c_1}{c_2} \;\le\; \max\Big(-\tfrac{a_{i1}}{a_{i2}}, -\tfrac{a_{k1}}{a_{k2}}\Big).$$
Alternativ (alltid gyldig): krev at hjørnet er minst like godt som hvert nabohjørne.`}</T>
        </Step>
        <Step kind="example" title="Lego (LO3 s. 5–9)">
          <T>{r`$\max c_1C + 50T$, bindende: $C + 2T \le 10$ (stigning $-\tfrac12$) og $4C + 3T \le 30$ (stigning $-\tfrac43$). Krav: $-\tfrac43 \le -\tfrac{c_1}{50} \le -\tfrac12 \iff 25 \le c_1 \le 66\tfrac23$.
- $c_1 = 50$: fortsatt $(6,2)$, $Z = 400$.
- $c_1 = 66\tfrac23$: isokvanten parallell med småkloss-linjen ⇒ hele kanten $(6,2)$–$(7.5, 0)$ optimal.
- $c_1 > 66\tfrac23$: optimum hopper til $(7.5, 0)$. $c_1 < 25$: til $(0,5)$.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg fanen «Objektivkoeffisient cⱼ». Båndet i grafen er optimalitetsområdet; Z* er stykkevis lineær og konveks i cⱼ.">
            <SensitivityLab presetId="lego" initialTab="cost" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-c1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-c2" />
        </Step>
      </Concept>

      <Concept id="bi" title="Endring i høyreside bᵢ og skyggepris">
        <Step kind="intuition">
          <T>{r`«Hvis jeg har én ekstra liten kloss på auksjon – hvor mye vil du by?» Svaret er hvor mye profitten øker med én kloss til. Det er **skyggeprisen**. Endringen i $b_i$ **parallellforskyver** restriksjonen; optimum glir langs den andre bindende linjen – helt til en ny restriksjon blir bindende.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`- Optimal løsning endres alltid når $b_i$ til en **bindende** restriksjon endres (ikke-degenerert tilfelle).
- **Sensitivitetsområdet for $b_i$**: verdiene der de **bindende restriksjonene forblir bindende**.
- **Skyggepris** (shadow price, dual value) $y_i$: marginal endring i optimal verdi per ekstra enhet av ressursen/kravet. **Gjelder bare innenfor sensitivitetsområdet.**
- For maks-problemer: $\le$-ressurs ↑ ⇒ $Z^*$ ↑ eller uendret ($y_i \ge 0$); $\ge$-krav ↑ ⇒ $Z^*$ ↓ eller uendret.
- Ikke-bindende restriksjon: $y_i = 0$ (overskudd av ressursen).`}</T>
        </Step>
        <Step kind="example" title="Lego: små klosser (LO3 s. 10–16)">
          <T>{r`Med begge restriksjoner bindende og $b_2 = t$: løs $C + 2T = 10$, $4C + 3T = t$:
$$T = \frac{40 - t}{5},\qquad C = \frac{2t - 30}{5},\qquad Z = 40C + 50T = 6t + 160.$$
- Skyggepris $y_2 = \dfrac{dZ}{dt} = 6$.
- Gyldig så lenge $C \ge 0$ og $T \ge 0$: $15 \le t \le 40$.
- $t = 25$: $(4,3)$, $Z = 310$ ✓ (lysbilde 11). $t = 15$: $(0,5)$. $t = 40$: $(10,0)$.
- $t > 40$: små klosser er ikke lenger knappe; $Z^* = 400$ uansett. Skyggeprisen faller til 0.

**Tolkning:** «If the shadow price of Small bricks is 6, then as long as $b_2 \in [15, 40]$, one extra unit of Small will improve profit by \$6; losing 6 units reduces profit by \$36.»`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Dra i grafen nederst eller bruk glidebryteren. Følg hvordan optimum (rød) glir langs den turkise stien, og når prediksjonen med skyggeprisen slutter å stemme.">
            <SensitivityLab presetId="lego" initialTab="rhs" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-b1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-b2" />
        </Step>
        <Step kind="exam" title="HW1 Problem 4(c)(d)">
          <Ex id="lo-b3" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-b4" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-b6" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Å bruke skyggeprisen langt utenfor området (HW1 P4: 4600 i stedet for 4000).
- Å tro at optimal **løsning** er uendret innenfor området for $b_i$ – det er de **bindende restriksjonene** som er uendret; løsningen flytter seg.
- Fortegn: for $\ge$-krav i et maks-problem er skyggeprisen $\le 0$.
- Ikke-bindende restriksjoner har skyggepris 0 – ikke «ukjent».`}</T>
        </Step>
      </Concept>

      <Concept id="aij" title="Endring i restriksjonskoeffisient aᵢⱼ">
        <Step kind="definition">
          <T>{r`Endring i $a_{ij}$ **roterer** restriksjonen rundt sitt skjæringspunkt med en akse. Både tillatt område, optimal løsning og objektivverdi kan endres – «everything will change». Lego (LO3 s. 17): hvis en stol trenger $a_{11} = 0$ store klosser, blir restriksjonen $2T \le 10$; ved $a_{11} = 4$: $4C + 2T \le 10$.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Dra de firkantede håndtakene på aksene for å endre a₁ og a₂ i en restriksjon (b holdes fast).">
            <LPLab presetId="lego" compact showPresets={false} />
          </Lab>
        </Step>
        <Step kind="exam">
          <Ex id="lo-b5" />
        </Step>
        <Step kind="summary">
          <T>{r`- $c_j$: roterer isokvanten. Innenfor området: samme $x^*$, ny $Z^*$. Regel: $-c_1/c_2$ mellom stigningene til de bindende linjene.
- $b_i$: parallellforskyver restriksjonen. Innenfor området: samme bindende sett, $Z^* = Z_0 + y_i\Delta b_i$. Bindende ⇒ $x^*$ endres.
- Skyggepris = marginalverdi; 0 for ikke-bindende; gyldig kun i området.
- $a_{ij}$: roterer restriksjonen; alt kan endres.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
