import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BnBLab } from '../../labs/BnBLab';

const r = String.raw;

export default function DO6() {
  return (
    <div className="space-y-10">
      <Concept id="idea" title="Del og hersk (divide and conquer)">
        <Step kind="intuition">
          <T>{r`I stedet for å se på alle $2^n$ kombinasjoner, deler vi problemet i mindre delproblemer (**branching**), beregner hvor godt det **beste** i hvert delproblem kan bli (**bounding**), og kaster delproblemer som umulig kan inneholde en bedre løsning (**fathoming**). Mesteparten av treet blir aldri utforsket.`}</T>
        </Step>
        <Step kind="definition" title="Tre ingredienser (BIP)">
          <T>{r`- **Branching:** velg en forgreningsvariabel $x_j$ og lag to delproblemer: $x_j = 0$ og $x_j = 1$.
- **Bounding:** løs LP-relakseringen ($0 \le x_j \le 1$) av delproblemet. Hvis alle $c_j$ er heltall, er $Z$ heltall for alle heltallsløsninger, så grensen kan **rundes ned**: LP-verdi $16\tfrac12$ ⇒ grense $Z \le 16$.
- **Fathoming:** forkast delproblemet hvis det ikke kan gi noe bedre (se neste seksjon).

**Incumbent:** den beste tillatte (heltallige) løsningen funnet så langt; $Z^*$ er verdien. Start: $Z^* = -\infty$.`}</T>
        </Step>
      </Concept>

      <Concept id="fathom" title="Fathoming-testene og algoritmen">
        <Step kind="definition">
          <T>{r`Et delproblem fathomes (forkastes fra videre vurdering) hvis:
1. **Test 1:** LP-relakseringens optimale løsning er **heltallig**. Den er da optimal for delproblemet; hvis den er bedre enn incumbent, blir den ny incumbent (og andre delproblemer testes på nytt med test 2).
2. **Test 2:** grensen er **ikke bedre** enn incumbent: $\text{bound} \le Z^*$.
3. **Test 3:** LP-relakseringen har **ingen tillatte løsninger**.

**Algoritmen** (DO2 s. 23): Initialisering $Z^* = -\infty$, løs LP-relakseringen av hele problemet. I hver iterasjon:
1. *Branching:* blant ufathomede delproblemer, velg det **sist opprettede** (ved likhet: størst grense) og del det i to.
2. *Bounding:* løs LP-relakseringen av hvert nytt delproblem.
3. *Fathoming:* anvend de tre testene.

**Optimalitetstest:** stopp når det ikke er flere delproblemer; incumbent er optimal.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="do-bb2" />
        </Step>
        <Step kind="exam">
          <Ex id="do-bb7" />
        </Step>
      </Concept>

      <Concept id="walk" title="Forelesningseksemplet steg for steg">
        <Step kind="example">
          <T>{r`$\max 9x_1 + 5x_2 + 6x_3 + 4x_4$ s.t. $6x_1 + 3x_2 + 5x_3 + 2x_4 \le 10$, $x_3 + x_4 \le 1$, $-x_1 + x_3 \le 0$, $-x_2 + x_4 \le 0$, $x_j$ binær.

**Rot:** LP $(\tfrac56, 1, 0, 1)$, $Z = 16\tfrac12$ ⇒ grense 16.
**Iterasjon 1** (forgren $x_1$): Sub1 ($x_1 = 0$): $(0,1,0,1)$, $Z = 9$ – heltallig ⇒ incumbent $Z^* = 9$ (F1). Sub2 ($x_1 = 1$): $(1, \tfrac45, 0, \tfrac45)$, $Z = 16\tfrac15$ ⇒ grense 16.
**Iterasjon 2** (Sub2, forgren $x_2$): Sub3 ($x_2 = 0$): $(1, 0, \tfrac45, 0)$, $13\tfrac45$ ⇒ grense 13. Sub4 ($x_2 = 1$): $(1,1,0,\tfrac12)$, 16.
**Iterasjon 3** (Sub4 – sist opprettet, størst grense; forgren $x_3$): Sub5 ($x_3 = 0$): $(1,1,0,\tfrac12)$, 16. Sub6 ($x_3 = 1$): ikke tillatt (F3).
**Iterasjon 4** (Sub5, forgren $x_4$): $x_4 = 0$: $(1,1,0,0)$, $Z = 14$ – heltallig og bedre ⇒ ny incumbent $Z^* = 14$ (F1); Sub3 fathomes nå ved test 2 ($13 \le 14$). $x_4 = 1$: ikke tillatt (F3).
**Ingen delproblemer igjen** ⇒ optimum $x^* = (1,1,0,0)$, $Z^* = 14$.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Trykk «Neste iterasjon» for å følge kursregelen, eller klikk på en node og velg forgreningsvariabel selv. Treet, grensene og incumbent oppdateres.">
            <BnBLab presetId="lecture-bip" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-bb1" />
        </Step>
        <Step kind="exam" title="DO Practice 4 (offisiell)">
          <Ex id="do-bb3" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Test 2 bruker $\le$: en grense **lik** incumbent fathomes også.
- Etter ny incumbent: gå tilbake og test alle åpne delproblemer med test 2.
- Avrunding av grensen er bare gyldig når objektivverdien må være heltall (heltallige $c_j$ og heltallige variabler).
- Ikke glem å markere hvorfor hver node er fathomed (F1/F2/F3) – det gir poeng.
- I BIP-eksemplet forgrenes variablene i naturlig rekkefølge selv om verdien allerede er heltall ($x_3 = 0$ i Sub4).`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Branch: $x_j = 0$ / $x_j = 1$. Bound: LP-relaksering (rund ned ved heltallige $c_j$). Fathom: heltallig / bound ≤ $Z^*$ / ikke tillatt.
- Velg sist opprettede delproblem (likhet: størst grense).
- Stopp når ingen delproblemer gjenstår ⇒ incumbent optimal.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
