import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { LPLab } from '../../labs/LPLab';

const r = String.raw;

export default function LO8() {
  return (
    <div className="space-y-10">
      <Concept id="simplex" title="Simpleksmetodens geometri">
        <Step kind="intuition">
          <T>{r`Hjørnepunktteoremet sier at vi bare trenger å se på hjørner. Simpleksmetoden starter i et hjørne og **går langs kantene til et bedre nabohjørne**, helt til ingen nabo er bedre. Da er vi ferdige – takket være konveksitet er et lokalt optimum også globalt.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`- Hver restriksjon har en **restriksjonsgrense** (linjen der den holder med likhet). Skjæringer av grenser er **hjørnepunktløsninger** (corner-point solutions); tillatte kalles **CPF** (corner-point feasible). Wyndor: CPF $(0,0), (0,6), (2,6), (4,3), (4,0)$; ikke tillatte hjørnepunkter $(0,9), (4,6), (6,0)$.
- I $n$ dimensjoner er et hjørnepunkt snittet av $n$ grenser.
- **Nabo-CPF** (adjacent): deler $n-1$ grenser og er forbundet med et linjestykke på den felles grensen – en **kant** av området.
- **Optimalitetstest:** hvis et CPF ikke har noen bedre nabo-CPF, er det optimalt (gitt at optimum finnes). «If you're better than your neighbors, then you're the best in your class.»`}</T>
        </Step>
        <Step kind="example" title="Wyndor (LO4 s. 7–8)">
          <T>{r`Start i $(0,0)$ med $Z = 0$. Naboer: $(0,6)$ med $Z = 30$ og $(4,0)$ med $Z = 12$ ⇒ gå til $(0,6)$. Naboer til $(0,6)$: $(0,0)$ og $(2,6)$ med $Z = 36$ ⇒ gå til $(2,6)$. Naboer til $(2,6)$: $(0,6)$: 30 og $(4,3)$: 27 – ingen er bedre ⇒ **optimal** etter bare tre CPF-er.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Slå på «Simpleks-sti»: plattformen går fra origo til den beste naboen i hvert steg (samme sti som lysbilde 8 for Wyndor).">
            <LPLab presetId="wyndor" compact showPresets={false} />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-x2" />
        </Step>
      </Concept>

      <Concept id="algos" title="Ellipsoide- og indrepunktmetoder">
        <Step kind="definition">
          <T>{r`| Algoritme | År | Teori | Praksis |
|---|---|---|---|
| Simpleks (Dantzig) | 1947 | dårlig (eksponentiell i verste fall) | god |
| Ellipsoide (Khachiyan) | 1979 | god (første polynomiske) | dårlig |
| Indrepunkt (Karmarkar) | 1984 | god | god |

**Ellipsoidemetoden:** lag en følge av stadig mindre ellipsoider som alle inneholder det tillatte området $F$. I iterasjon $k$ er $c_k$ sentrum av $E_k$; hvis $c_k \notin F$, finn den mest brutte restriksjonen $a_k$ og lag den minste ellipsoiden som inneholder halvdelen av $E_k$ på riktig side. Til slutt havner sentrum i $F$.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-x1" />
        </Step>
      </Concept>

      <Concept id="linearize" title="Fra ikke-lineært til lineært">
        <Step kind="definition">
          <T>{r`- **Maks av lineære funksjoner:** $\min f(x) = \max_k (d_k^\top x + c_k)$ s.t. $Ax \ge b$ ⇔ $\min t$ s.t. $t \ge d_k^\top x + c_k\ \forall k$, $Ax \ge b$.
- **Absoluttverdi:** $|x| = \max\{-x, x\}$. $\min \sum_j c_j|x_j|$ ($c_j \ge 0$) ⇔ $\min \sum_j c_jt_j$ s.t. $t_j \ge x_j$, $t_j \ge -x_j$.
- **Brøker:** $\dfrac{x_1 + 2x_2 + x_3}{2x_1 + 3x_2 + 1} \le 1$ med $x \ge 0$: nevneren er positiv ⇒ $x_1 + 2x_2 + x_3 \le 2x_1 + 3x_2 + 1 \iff -x_1 - x_2 + x_3 \le 1$. Med $x \le 0$ og nevner $2x_1 + 3x_2 - 1 < 0$ snus ulikheten. Hvis nevneren kan ha **begge** fortegn ($2x_1 + 3x_2$), går det ikke: «No way to convert! Too bad!»`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-x3" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-x4" />
        </Step>
      </Concept>

      <Concept id="robust" title="Usikkerhet og robust optimering">
        <Step kind="intuition">
          <T>{r`Data er nesten aldri eksakte: **estimeringsfeil**, **prediksjonsfeil** (fremtidig etterspørsel finnes ikke ennå) og **implementeringsfeil** (optimal lengde 3,2514265343 m kan ikke kuttes eksakt). I NETLIB-problemet PILOT4 kan en perturbasjon på bare 0,1 % i koeffisientene gjøre en restriksjon kraftig brutt. «In real-world applications of LP, one cannot ignore the possibility that a small uncertainty in the data can make the usual optimal solution completely meaningless» (Ben-Tal & Nemirovski 2000).`}</T>
        </Step>
        <Step kind="definition" title="Robust motpart (robust counterpart)">
          <T>{r`Verste-fall-tilnærming (ambiguity aversion): $\min c^\top x$ s.t. $Ax \ge b$ **for alle** $(A, b) \in \mathcal U$.

**Boks-usikkerhet:** $a^\top x \le b$ for alle $a \in \mathcal W = \{a : \bar a_j - \Delta a_j \le a_j \le \bar a_j + \Delta a_j\}$
$$\iff \max_{a\in\mathcal W} a^\top x \le b \iff \min_{r - s = x,\ r,s\ge0} (r-s)^\top\bar a + (r+s)^\top \Delta a \le b \iff \exists r,s\ge0:\ r - s = x,\ (r-s)^\top\bar a + (r+s)^\top\Delta a \le b.$$
Verste fall velger $a_j = \bar a_j + \Delta a_j\,\text{sign}(x_j)$, så $\max a^\top x = \bar a^\top x + \sum_j \Delta a_j|x_j|$.

**Budsjett-usikkerhet** (LO4 s. 24, HW1 P5): $\mathcal W_\Gamma = \{a : |a_j - \bar a_j| \le \Delta a_j,\ \sum_j |a_j - \bar a_j|/\Delta a_j \le \Gamma\}$ – høyst $\Gamma$ koeffisienter avviker fullt. Ved å skrive den indre maksimeringen som et LP og ta dualen får man (supplerende utledning): $\bar a^\top x + \Gamma p + \sum_j q_j \le b$, $p + q_j \ge \Delta a_j u_j$, $-u_j \le x_j \le u_j$, $p, q \ge 0$.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-x5" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-x6" />
        </Step>
        <Step kind="summary">
          <T>{r`- CPF, nabo-CPF ($n-1$ felles grenser), optimalitetstest: bedre enn alle naboer ⇒ optimal.
- Simpleks 1947 / ellipsoide 1979 / indrepunkt 1984.
- $\max$, $|\cdot|$ og brøker med kjent fortegn på nevneren kan lineariseres.
- Robust motpart: verste fall over usikkerhetsmengden; boks ⇒ $\bar a^\top x + \sum\Delta a_j|x_j| \le b$.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
