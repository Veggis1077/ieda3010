import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { LegoLab } from '../../labs/IntroLabs';
import { LPLab } from '../../labs/LPLab';

const r = String.raw;

export default function LO1() {
  return (
    <div className="space-y-10">
      <Concept id="lego" title="Lego-spillet: din første lineære optimering">
        <Step kind="intuition">
          <T>{r`Du har **10 store** (2×4) og **30 små** (2×2) Lego-klosser. En **stol** krever 1 stor + 4 små og selges for \$40. Et **bord** krever 2 store + 3 små og selges for \$50. Hvor mange av hver bør du lage? Prøv selv før du leser videre – forelesningen spør nettopp: *Hvilken logikk brukte du? Hvordan vet du at løsningen er optimal?*`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Øk og reduser antall stoler og bord. Søylene viser klossforbruket; rødt betyr at planen ikke er gjennomførbar.">
            <LegoLab />
          </Lab>
        </Step>
        <Step kind="definition" title="Formuleringen (LO1 s. 8)">
          <T>{r`- **Beslutningsvariabler:** $C$ = antall stoler, $T$ = antall bord.
- **Mål:** maksimer inntekt $40C + 50T$.
- **Restriksjoner:** store klosser $C + 2T \le 10$, små klosser $4C + 3T \le 30$, ikke-negativitet $C, T \ge 0$.

$$\begin{aligned}\max\ & Z = 40C + 50T\\ \text{s.t.}\ & C + 2T \le 10\\ & 4C + 3T \le 30\\ & C, T \ge 0\end{aligned}$$`}</T>
        </Step>
        <Step kind="geometry">
          <T>{r`Hvert par $(C,T)$ er et punkt i planet. Hver restriksjon er et halvplan; snittet er det **tillatte området**. Målfunksjonen gir parallelle **isokvanter** $40C + 50T = k$. Skyv isokvanten i pilens retning til den forlater området – det siste punktet er optimum. Prøv «Skyv til optimum» nedenfor.`}</T>
          <Lab caption="LP-laboratoriet med Lego-modellen. Dra linjene, håndtakene og isokvanten.">
            <LPLab presetId="lego" compact showPresets={false} />
          </Lab>
        </Step>
        <Step kind="example" title="Løsning for hånd">
          <T>{r`Hjørnene er $(0,0)$, $(7.5, 0)$, $(0, 5)$ og skjæringen av de to linjene: $C = 10 - 2T \Rightarrow 4(10 - 2T) + 3T = 30 \Rightarrow T = 2,\ C = 6$.

| Hjørne | $Z = 40C + 50T$ |
|---|---|
| $(0,0)$ | 0 |
| $(7.5,0)$ | 300 |
| $(0,5)$ | 250 |
| $(6,2)$ | **340** |

Optimum: **6 stoler og 2 bord, \$340**, og alle klossene brukes. Med bare 9 store klosser blir LP-løsningen $(6.6,\ 1.2)$ – brøk! Hvordan håndtere det? Det er temaet for diskret optimering.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-n1" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- «Lag mest av det dyreste produktet» er ikke en algoritme: bord gir mer per stykk, men bruker mange store klosser.
- Det er **ikke** alltid optimalt å bruke opp alle ressursene (se Wyndor, anlegg 1).
- Optimum er ikke alltid unikt (prøv bordpris \$80 i laboratoriet: da er objektivlinjen parallell med $C + 2T = 10$).`}</T>
        </Step>
      </Concept>

      <Concept id="components" title="Nøkkelkomponenter i optimering">
        <Step kind="definition">
          <T>{r`**Optimering** er valg av et beste element fra en mengde tilgjengelige alternativer – den beste løsningen på et beslutningsproblem gitt visse restriksjoner (LO1 s. 12). Startet med George B. Dantzig på 1940-tallet.

- **Beslutningsvariabler**: de kontrollerbare variablene; de skal fullstendig beskrive beslutningene.
- **Mål** (objective): beslutningstakeren vil maksimere (ofte inntekt/profitt) eller minimere (ofte kostnad) en funksjon av beslutningsvariablene – **målfunksjonen**.
- **Restriksjoner** (constraints): begrensninger på én eller flere beslutningsvariabler.

**Lineær optimering** = målfunksjonen og alle restriksjonene er lineære i variablene: «allocate resources to activities».`}</T>
        </Step>
        <Step kind="intuition" title="Hvorfor algoritmer?">
          <T>{r`Dantzigs opprinnelige problem: tilordne 70 personer til 70 jobber. Brute force krever $70! \approx 10^{100}$ alternativer – med datamaskiner fra Big Bang og til sola slukner er det fortsatt umulig. Med moderne optimeringsprogramvare tar det under ett sekund. Struktur (linearitet, konveksitet) er nøkkelen.`}</T>
        </Step>
      </Concept>

      <Concept id="wyndor" title="Wyndor Glass Co.">
        <Step kind="example">
          <T>{r`Wyndor lager dører (produkt 1, metallramme) og vinduer (produkt 2, treramme). Anlegg 1 lager metallrammer, anlegg 2 trerammer, anlegg 3 glass og montering.

| Anlegg | Produkt 1 (t/parti) | Produkt 2 (t/parti) | Tilgjengelig (t/uke) |
|---|---|---|---|
| 1 | 1 | 0 | 4 |
| 2 | 0 | 2 | 12 |
| 3 | 3 | 2 | 18 |
| Profitt/parti | \$3K | \$5K | |

$$\max Z = 3x_1 + 5x_2\ \text{s.t.}\ x_1 \le 4,\ 2x_2 \le 12,\ 3x_1 + 2x_2 \le 18,\ x_1, x_2 \ge 0.$$
Optimum $(2,6)$ med $Z = 36$ (\$36 000/uke). Anlegg 1 har 2 timer ubrukt kapasitet.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-f1" />
        </Step>
      </Concept>

      <Concept id="guidelines" title="Formuleringsretningslinjer (LO1 s. 44)">
        <Step kind="definition">
          <T>{r`**Formulering** (modellering) er å oversette en verbal beskrivelse av et problem til en matematisk beskrivelse.
1. Forstå problemet.
2. Still tre spørsmål: (i) **Hva må bestemmes?** → beslutningsvariabler. (ii) **Hvilket mål** sammenligner alternative beslutninger? → målfunksjon. (iii) **Hvilke restriksjoner** begrenser valgene?
3. Skriv målfunksjonen i beslutningsvariablene.
4. Skriv restriksjonene i beslutningsvariablene.
5. **Sjekk formuleringen:** gir den mening? Er det data du ikke har brukt?`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-f2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- **Enheter**: «5 ansatte à 40 timer» og «3 minutter per pølse» – gjør om til samme enhet (12 000 minutter).
- Glemme ikke-negativitet.
- Definere variabler vagt («x = produksjon») i stedet for «$x_1$ = antall partier dører per uke».
- Bruke $\ge$ der teksten sier «høyst», eller $\le$ der det står «minst».`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Tre komponenter: variabler, mål, restriksjoner (+ parametere).
- Lego: $\max 40C + 50T$, $C + 2T\le 10$, $4C + 3T \le 30$ ⇒ $(6,2)$, \$340.
- Wyndor: $\max 3x_1 + 5x_2$, $x_1\le4$, $2x_2\le12$, $3x_1+2x_2\le18$ ⇒ $(2,6)$, 36.
- Retningslinjer: tre spørsmål + sjekk (mening, alle data brukt).`}</T>
        </Step>
      </Concept>
    </div>
  );
}
