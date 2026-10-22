import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BnBLab } from '../../labs/BnBLab';

const r = String.raw;

export default function DO7() {
  return (
    <div className="space-y-10">
      <Concept id="changes" title="Fra BIP til MIP: fire endringer">
        <Step kind="intuition">
          <T>{r`Med generelle heltallsvariabler kan vi ikke fiksere til 0 eller 1. I stedet **kutter** vi bort en stripe rundt den fraksjonelle verdien: hvis $x_1 = 1\tfrac14$ i LP-løsningen, finnes ingen heltallsløsning med $1 < x_1 < 2$, så vi deler i $x_1 \le 1$ og $x_1 \ge 2$. Kontinuerlige variabler forgrenes aldri.`}</T>
        </Step>
        <Step kind="definition" title="DO2 s. 24 og 33">
          <T>{r`1. **Valg av forgreningsvariabel:** før: neste variabel i naturlig rekkefølge. Nå: bare de **heltallsbegrensede** variablene – den første som har ikke-heltallig verdi i LP-løsningen.
2. **Verdier for forgreningsvariabelen:** før: fiksert til 0 eller 1. Nå: to **intervaller**, $x_j \le \lfloor x_j^*\rfloor$ og $x_j \ge \lceil x_j^*\rceil$.
3. **Bounding:** før: rund ned $Z$. Nå: avrunding er **ikke nødvendigvis** gyldig (kontinuerlige variabler kan gi brøk i $Z$).
4. **Fathoming-test 1:** før: hele LP-løsningen heltallig. Nå: bare de **heltallsbegrensede** variablene må være heltall.

Test 2 (bound ≤ $Z^*$) og test 3 (ikke tillatt) er uendret.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="do-bb4" />
        </Step>
        <Step kind="exam">
          <Ex id="do-bb5" />
        </Step>
      </Concept>

      <Concept id="example" title="MIP-eksemplet (DO2 s. 25–32)">
        <Step kind="example">
          <T>{r`$\max 4x_1 - 2x_2 + 7x_3 - x_4$ s.t. $x_1 + 5x_3 \le 10$, $x_1 + x_2 - x_3 \le 1$, $6x_1 - 5x_2 \le 0$, $-x_1 + 2x_3 - 2x_4 \le 3$, $x\ge0$, $x_1, x_2, x_3$ heltall.

**Rot:** $(1\tfrac14, 1\tfrac12, 1\tfrac34, 0)$, $Z = 14\tfrac14$.
**Iterasjon 1** (forgren $x_1$): Sub1 ($x_1 \le 1$): $(1, 1\tfrac15, 1\tfrac45, 0)$, $14\tfrac15$. Sub2 ($x_1 \ge 2$): ikke tillatt (F3).
**Iterasjon 2** (Sub1, forgren $x_2$): Sub3 ($x_2 \le 1$): $(\tfrac56, 1, 1\tfrac56, 0)$, $14\tfrac16$. Sub4 ($x_2 \ge 2$): $(\tfrac56, 2, 1\tfrac56, 0)$, $12\tfrac16$.
**Iterasjon 3** (Sub3 – størst grense blant de sist opprettede; forgren $x_1 = \tfrac56$): Sub5 ($x_1 \le 0$): $(0,0,2,\tfrac12)$, $Z = 13\tfrac12$ – heltallige variabler er heltall ⇒ incumbent (F1). Sub6 ($x_1 \ge 1$): ikke tillatt (F3). Sub4 fathomes ved test 2 ($12\tfrac16 \le 13\tfrac12$).
**Optimum:** $x^* = (0, 0, 2, \tfrac12)$, $Z^* = 13\tfrac12$. Legg merke til at $x_4 = \tfrac12$ er helt i orden – den er kontinuerlig.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg «Forelesning: MIP-eksempel» (forhåndsvalgt). Avrunding av grensen er slått av for MIP.">
            <BnBLab presetId="lecture-mip" />
          </Lab>
        </Step>
        <Step kind="exam">
          <Ex id="do-bb6" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Forgrene på en kontinuerlig variabel.
- Skrive $x_1 = 1$ / $x_1 = 2$ i stedet for $x_1 \le 1$ / $x_1 \ge 2$ (da går løsninger tapt).
- Runde ned en grense i MIP når kontinuerlige variabler påvirker $Z$.
- Kreve at kontinuerlige variabler er heltall i test 1.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Forgren bare heltallsvariabler med brøkverdi: $x_j \le \lfloor v\rfloor$ / $x_j \ge \lceil v\rceil$.
- Ingen avrunding av grensen i generell MIP.
- Test 1: bare heltallsvariablene må være heltall.
- Lærdom fra eksemplet: optimum $(0,0,2,\tfrac12)$, $13\tfrac12$ – langt fra den avrundede rotløsningen.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
