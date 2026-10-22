import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { DualityLab } from '../../labs/DualityLab';

const r = String.raw;

export default function LO7() {
  return (
    <div className="space-y-10">
      <Concept id="dual" title="Dualproblemet">
        <Step kind="intuition">
          <T>{r`Hvorfor dualitet? Sensitivitetsanalyse ved «brute force» (endre parametere og løse på nytt) er tungvint. **Dualitetsteori** gir skyggeprisene direkte, gir grenser for optimal verdi uten å løse problemet, og noen ganger er dualen enklere å løse (f.eks. når primalen har to restriksjoner men mange variabler – da har dualen bare to variabler og kan løses grafisk!).`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Til hvert LP hører et annet LP – **dualen**. Er primalen maksimering, er dualen minimering. **Samme parametere, men på andre plasser.**
$$\text{(P)}\ \max Z = \sum_{j=1}^n c_jx_j\ \text{s.t.}\ \sum_{j=1}^n a_{ij}x_j \le b_i\ (i=1..m),\ x_j \ge 0 \qquad \text{(D)}\ \min W = \sum_{i=1}^m b_iy_i\ \text{s.t.}\ \sum_{i=1}^m a_{ij}y_i \ge c_j\ (j=1..n),\ y_i \ge 0$$
I matriseform: (P) $\max c^\top x$, $Ax \le b$, $x\ge0$; (D) $\min b^\top y$, $A^\top y \ge c$, $y \ge 0$.

**Oppskrift:** én dualvariabel $y_i$ per primalrestriksjon; én dualrestriksjon per primalvariabel $x_j$, med koeffisientene fra **kolonne** $j$ i $A$ og høyreside $c_j$; dualens målkoeffisienter er $b_i$.`}</T>
        </Step>
        <Step kind="example" title="Wyndor (LO3 s. 24)">
          <T>{r`$$\begin{aligned}&\text{(P)}\ \max 3x_1 + 5x_2 && \text{(D)}\ \min 4y_1 + 12y_2 + 18y_3\\ &\ \ x_1 \le 4 && \ \ y_1 + 3y_3 \ge 3\\ &\ \ 2x_2 \le 12 && \ \ 2y_2 + 2y_3 \ge 5\\ &\ \ 3x_1 + 2x_2 \le 18 && \ \ y_1, y_2, y_3 \ge 0\\ &\ \ x_1, x_2\ge 0 &&\end{aligned}$$
Primal–dual-tabellen («The essence of duality theory»): radene er $y_i$, kolonnene $x_j$; les primalrestriksjonene radvis og dualrestriksjonene kolonnevis.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Endre en koeffisient i primalen og se dualen, løsningene, komplementær slakkhet og grafene oppdateres. Velg «Midtveis-øving Q2» for å se dualen løst grafisk.">
            <DualityLab />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-d1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-d2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Å glemme å **transponere**: koeffisientene i dualrestriksjon $j$ er kolonne $j$ i $A$, ikke rad $j$.
- Feil retning på ulikhetene: max/$\le$ ⇒ min/$\ge$.
- For andre former (min, $\ge$, $=$, frie variabler) gjelder andre fortegnsregler – laboratoriet viser dem, men forelesningen fokuserer på standardform. Sikrest: skriv om til standardform først.`}</T>
        </Step>
      </Concept>

      <Concept id="econ" title="Økonomisk tolkning og skyggepriser">
        <Step kind="intuition">
          <T>{r`Et annet selskap vil kjøpe **all produksjonstid** i Wyndors tre anlegg. La $y_i$ være prisen per time i anlegg $i$. Selskapet vil **minimere** total betaling $4y_1 + 12y_2 + 18y_3$. Men prisen må være høy nok til at Wyndor vil selge: tiden ett parti dører bruker (1 t i anlegg 1, 3 t i anlegg 3) må være verdt minst profitten 3: $y_1 + 3y_3 \ge 3$. Tilsvarende for vinduer: $2y_2 + 2y_3 \ge 5$. Det er dualen!`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Optimal dualløsning $y^* = (y_1^*, \dots, y_m^*)$ kalles **skyggeprisene**. $y_i^*$ måler **marginalverdien** av ressurs $i$. Wyndor: $y^* = (0, \tfrac32, 1)$:
- Én time ekstra i anlegg 2 øker profitten med \$1500 per uke (innenfor sensitivitetsområdet).
- $y_1^* = 0$: restriksjonen $x_1 \le 4$ er ikke bindende i $(2,6)$; det er overskudd av ressursen, så mer av den gir ingenting.
- Anlegg 2 og 3 er bindende: knappheten holder $Z$ nede.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-d9" />
        </Step>
      </Concept>

      <Concept id="weakstrong" title="Svak og sterk dualitet, dualitetsteoremet">
        <Step kind="definition">
          <T>{r`**Svak dualitet:** hvis $x$ er primal tillatt og $y$ dual tillatt, så er $\sum_j c_jx_j \le \sum_i b_iy_i$.

*Bevis (supplerende, én linje):* $c^\top x \le (A^\top y)^\top x = y^\top(Ax) \le y^\top b$, fordi $x \ge 0$, $A^\top y \ge c$, $y \ge 0$, $Ax \le b$.

**Sterk dualitet:** hvis $x^*$ og $y^*$ er optimale, så er $\sum_j c_jx_j^* = \sum_i b_iy_i^*$.

**Dualitetsteoremet** – de eneste mulige relasjonene:
1. Hvis én har tillatte løsninger og begrenset mål (optimum), så har den andre også det; svak og sterk dualitet gjelder.
2. Hvis én er tillatt og ubegrenset, er den andre **ikke tillatt**.
3. Hvis én ikke er tillatt, er den andre enten ikke tillatt eller ubegrenset.`}</T>
        </Step>
        <Step kind="example">
          <T>{r`Wyndor: $x = (3,3)$ er primal tillatt med $Z = 24$; $y = (1,1,2)$ er dual tillatt med $W = 52$. Uten å løse noe vet vi $24 \le Z^* \le 52$. Optimalt: $Z^* = 36 = W^*$ med $x^* = (2,6)$ og $y^* = (0, \tfrac32, 1)$.

LO Practice 7: primalen er ikke tillatt, og dualen $\min -2y_1 + 4y_2$ s.t. $-y_1 + 4y_2 \ge 1$, $y_1 + y_2 \ge 2$ er ubegrenset – i tråd med punkt 3.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-d4" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-d5" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-d8" />
        </Step>
      </Concept>

      <Concept id="cs" title="Komplementær slakkhet">
        <Step kind="definition">
          <T>{r`La $x$ være primal tillatt og $y$ dual tillatt. Da er $x$ og $y$ optimale **hvis og bare hvis**
$$\Big(b_i - \sum_{j=1}^n a_{ij}x_j\Big)\, y_i = 0\quad (i = 1,\dots,m) \qquad\text{og}\qquad \Big(c_j - \sum_{i=1}^m a_{ij}y_i\Big)\, x_j = 0\quad (j = 1,\dots,n).$$
Totalt $m + n$ ligninger. I ord: **hvis en primalrestriksjon ikke er bindende, er tilhørende dualvariabel 0**; og hvis $x_j > 0$, holder dualrestriksjon $j$ med likhet.`}</T>
        </Step>
        <Step kind="example" title="Finn y* fra x* (LO3 s. 37)">
          <T>{r`Wyndor, $x^* = (2,6)$:
- $x_1^*, x_2^* > 0$ ⇒ $3 - (y_1 + 3y_3) = 0$ og $5 - (2y_2 + 2y_3) = 0$.
- $x_1 = 2 < 4$: restriksjon 1 ikke bindende ⇒ $y_1^* = 0$.
- Løs: $y_3^* = 1$, $y_2^* = \tfrac32$. Sjekk: $W = 18 + 18 = 36 = Z^*$ ✓.`}</T>
        </Step>
        <Step kind="example" title="Omvendt: finn x* fra y* (midtveis Q2-typen)">
          <T>{r`Når primalen har to restriksjoner og mange variabler, har dualen to variabler:
1. Løs dualen grafisk (min, ofte ubegrenset område oppover).
2. $y_i^* > 0$ ⇒ primalrestriksjon $i$ er bindende.
3. Dualrestriksjoner med overskudd i $y^*$ ⇒ tilhørende $x_j^* = 0$.
4. Løs det gjenstående ligningssystemet for de positive $x_j$, og sjekk $Z^* = W^*$.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-d6" />
        </Step>
        <Step kind="exam" title="Midtveis-øving Q2(b)">
          <Ex id="lo-d3" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-d7" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-d10" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- CS gir **ikke** at en bindende restriksjon har positiv skyggepris (degenerasjon).
- Glem ikke å sjekke dual tillatthet: en $y$ som oppfyller CS-ligningene men har negative komponenter er ikke optimal.
- Antall CS-ligninger er $m + n$ (midtveis Q4d).`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- (P) $\max c^\top x$, $Ax\le b$, $x\ge0$ ⇔ (D) $\min b^\top y$, $A^\top y \ge c$, $y \ge 0$. Dualen til dualen er primalen.
- $y_i^*$ = skyggepris = marginalverdi av ressurs $i$.
- Svak: $c^\top x \le b^\top y$. Sterk: likhet i optimum.
- Teoremet: (opt, opt), (ubegrenset, ikke tillatt), (ikke tillatt, ubegrenset/ikke tillatt).
- CS: slakk·$y$ = 0 og overskudd·$x$ = 0.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
