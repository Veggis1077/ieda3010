import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BinaryLab } from '../../labs/BinaryLab';

const r = String.raw;

export default function DO2() {
  return (
    <div className="space-y-10">
      <Concept id="logic" title="Logikk med binære variabler">
        <Step kind="intuition">
          <T>{r`En binær variabel er en lysbryter: 1 = hendelsen skjer, 0 = den skjer ikke. Lineære restriksjoner på bryterne kan uttrykke «høyst», «nøyaktig», «hvis–så» og «alt eller ingenting». Trikset er å tenke i **sannhetstabeller**: hvilke kombinasjoner skal være lov, og hvilken lineær ulikhet utelukker akkurat de andre?`}</T>
        </Step>
        <Step kind="definition" title="Vanlige bruksområder (DO1 s. 13–16)">
          <T>{r`| Krav | Formulering |
|---|---|
| Høyst én av tre hendelser | $x_1 + x_2 + x_3 \le 1$ |
| Enten–eller (ikke begge) for to kandidater | $x_1 + x_2 = 1$ |
| Alt eller ingenting (to hendelser) | $x_1 = x_2$ |
| Alt eller ingenting (tre hendelser) | $x_1 = x_2 = x_3$ (dvs. $x_1 = x_2$, $x_2 = x_3$) |
| Hendelse 1 må skje hvis hendelse 2 skjer | $x_2 \le x_1$ |
| Betinget område: $y = 0$ hvis $x = 0$, ellers $0 \le y \le M$ | $0 \le y \le Mx$ |

Merk ved betinget: hendelse 1 **kan** skje uten hendelse 2 – derfor $\le$, ikke $=$.`}</T>
        </Step>
        <Step kind="example" title="«Kun hvis én av to» (midtveis-øving Q3b)">
          <T>{r`«Vi kan produsere produkt 4 bare hvis vi har produsert produkt 1 eller 2.» Med $y_j = 1$ hvis produkt $j$ produseres: forbudt kombinasjon er $y_4 = 1$, $y_1 = y_2 = 0$. Ulikheten $y_4 \le y_1 + y_2$ utelukker akkurat den. Sjekk: $y_4 = 1$ ⇒ $y_1 + y_2 \ge 1$ ✓; $y_4 = 0$ ⇒ ingen begrensning ✓. (Krever man **både** 1 og 2: $y_4 \le y_1$ og $y_4 \le y_2$.)`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg en relasjon og test formuleringer. Røde rader er kombinasjoner der formuleringen tillater noe logikken forbyr (eller omvendt).">
            <BinaryLab initial="logic" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-m3" />
        </Step>
      </Concept>

      <Concept id="range" title="Betinget område">
        <Step kind="definition">
          <T>{r`«Hvis hendelse $x$ ikke skjer, er $y = 0$; hvis den skjer, er $0 \le y \le M$.» Eksempel: produksjonsflyten er 0 hvis anlegget stenges. Formulering: $0 \le y \le Mx$, $x\in\{0,1\}$. Når $M$ er en reell kapasitet (f.eks. 30 enheter), kombinerer restriksjonen to krav i én: $x_B \le 30y_B$ (nettverksdesign, DO1 s. 50).`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="do-m8" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Feil retning i betingelser: «1 hvis 2» er $x_2 \le x_1$, ikke $x_1 \le x_2$.
- «Enten–eller» i forelesningen betyr **nøyaktig én** ($=1$); «ikke begge» alene er $\le 1$.
- «Eller» (minst én) gir en sum; «og» gir to separate ulikheter.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- $\sum x_i \le 1$ (høyst én), $x_1 + x_2 = 1$ (nøyaktig én), $x_1 = x_2$ (alt/ingenting), $x_2 \le x_1$ (2 ⇒ 1), $y_4 \le y_1 + y_2$ (4 ⇒ 1 eller 2), $0 \le y \le Mx$ (betinget område).
- Verifiser alltid med sannhetstabell.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
