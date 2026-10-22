import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { IPLab } from '../../labs/IPLab';

const r = String.raw;

export default function DO5() {
  return (
    <div className="space-y-10">
      <Concept id="geometry" title="Geometri for MIP">
        <Step kind="intuition">
          <T>{r`Et IP er «LP + heltallskrav». Det tillatte området i LP-et er en polygon; heltallskravet plukker ut bare noen av punktene. Det er dette som gjør IP vanskelig: vi mister konveksiteten, og optimum er ikke nødvendigvis et hjørne av polygonen.`}</T>
        </Step>
        <Step kind="definition" title="Eksemplet fra DO1 s. 53–55">
          <T>{r`$\max 40B + 50M$ s.t. $B + 2M \le 40$ (arbeid), $4B + 3M \le 120$ (leire), $B, M\ge 0$. LP-optimum $(24, 8)$.
- **Bare $B$ heltall:** tillatt mengde = parallelle (vertikale) linjestykker inne i LP-området.
- **Både $B$ og $M$ heltall:** tillatt mengde = gitterpunktene (prikkene) inne i LP-området.

**LP-relaksering:** IP-et uten heltallskrav. Siden relakseringens område inneholder IP-ets område, gir den en **grense**: $Z_{IP}^* \le Z_{LP}^*$ (max).`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Bytt mellom LP, MIP og IP. Klikk i diagrammet for å teste egne heltallspunkter.">
            <IPLab presetId="clay" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-g5" />
        </Step>
      </Concept>

      <Concept id="rounding" title="Relaksering og avrunding – og hvorfor det ikke holder">
        <Step kind="definition">
          <T>{r`To «naturlige» løsningsideer (DO2 s. 2):
1. Løs LP-relakseringen og **rund av** til heltall.
2. **Oppramsing** – et rent IP med begrenset område har endelig mange tillatte løsninger.

Problemer:
- Avrundet LP-løsning kan være **ikke tillatt**: $\max x_2$ s.t. $-x_1 + x_2 \le \tfrac12$, $x_1 + x_2 \le 3\tfrac12$ gir LP-optimum $(\tfrac32, 2)$; både $(1,2)$ og $(2,2)$ er ikke tillatte.
- Selv om avrundingen er tillatt, kan den være **langt fra optimum**: $\max x_1 + 5x_2$ s.t. $x_1 + 10x_2 \le 20$, $x_1 \le 2$: LP $(2, 1.8)$, avrundet $(2,1)$ gir 7, men optimum er $(0,2)$ med 10.
- Oppramsing: antallet løsninger vokser eksponentielt, og (i motsetning til LP) er optimum ikke nødvendigvis et hjørne.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg «Avrunding gir ikke-tillatt løsning» og «Avrunding langt fra optimum». Ringene viser de fire avrundingene av LP-optimum.">
            <IPLab presetId="rounding1" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-g3" />
        </Step>
        <Step kind="exam">
          <Ex id="do-g4" />
        </Step>
        <Step kind="exam" title="DO Practice 2 (offisiell)">
          <Ex id="do-g1" />
        </Step>
        <Step kind="exam">
          <Ex id="do-g2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- «Rund av LP-svaret» er aldri en gyldig IP-løsningsmetode på eksamen uten videre begrunnelse.
- Integralitetsgapet $Z_{LP}^* - Z_{IP}^*$ kan være stort.
- Et IP med ubegrenset område kan ha uendelig mange tillatte løsninger.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- MIP-mengder: linjestykker (noen heltall) eller gitterpunkter (alle heltall).
- LP-relaksering gir grense: $Z_{IP}^* \le Z_{LP}^*$ (max).
- Avrunding kan gi ikke-tillatte eller dårlige løsninger; oppramsing er for dyrt ⇒ branch-and-bound.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
