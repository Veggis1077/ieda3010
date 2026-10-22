import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BIPExplorer } from '../../labs/BIPExplorer';

const r = String.raw;

export default function DO4() {
  return (
    <div className="space-y-10">
      <Concept id="textile" title="Tekstilproduksjon: tre formuleringer">
        <Step kind="example">
          <T>{r`Fem produkter (skjorter, shorts, bukser, skjørt, jakker) lages på maskiner som leies per uke. 4000 arbeidstimer og 4500 kvadratyard stoff per uke.

| Produkt | Leie $r_i$ | Timer $h_i$ | Stoff $a_i$ | Pris | Var. kost | Profitt $p_i$ |
|---|---|---|---|---|---|---|
| Skjorter | 1500 | 2 | 3.0 | 35 | 20 | 15 |
| Shorts | 1200 | 1 | 2.5 | 40 | 10 | 30 |
| Bukser | 1600 | 6 | 4.0 | 65 | 25 | 40 |
| Skjørt | 1500 | 4 | 4.5 | 70 | 30 | 40 |
| Jakker | 1600 | 8 | 5.5 | 110 | 35 | 75 |

Variabler: $y_i$ = leie maskin $i$ (av/på), $x_i$ = mengde.
- **Formulering 1:** $\max \sum p_ix_i - \sum r_iy_i$ s.t. $\sum h_ix_i \le 4000$, $\sum a_ix_i \le 4500$ – **feil**: ingen kobling, man kan produsere uten å leie.
- **Formulering 2:** $\max \sum p_ix_iy_i - \sum r_iy_i$ s.t. $\sum h_ix_iy_i \le 4000$, … – riktig logikk, men **ikke-lineær** ($x_iy_i$).
- **Formulering 3:** formulering 1 + $x_i \le My_i$ – lineær og korrekt. «How to choose M? Any sufficiently large number» (f.eks. $M_i = \min(4000/h_i, 4500/a_i)$).`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="do-m9" />
        </Step>
      </Concept>

      <Concept id="cover" title="Set covering: hub-lokalisering (Western Airlines)">
        <Step kind="definition">
          <T>{r`**Set covering:** finn færrest mulig elementer fra mengde 2 (kandidatsett) som til sammen dekker alle elementene i mengde 1. Western Airlines: 12 byer; en hub dekker byer innen 1000 miles; finn minste antall hubber.
$$\min \sum_{j=1}^{12} x_j\quad \text{s.t.}\quad \sum_{j} a_{ij}x_j \ge 1\ \ \forall \text{ by } i,\qquad x_j\in\{0,1\},$$
der $a_{ij} = 1$ hvis by $i$ dekkes av hub $j$. Eksempel: Denver dekkes bare av DE og SL ⇒ $x_{DE} + x_{SL} \ge 1$.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg «Hub-lokalisering». Klikk byer for å gjøre dem til hubber; røde restriksjoner er byer som ikke er dekket.">
            <BIPExplorer presetId="hub" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-m6" />
        </Step>
      </Concept>

      <Concept id="facility" title="Fabrikk- og lagerlokalisering">
        <Step kind="example" title="Example 6 (DO1 s. 41–43)">
          <T>{r`| Beslutning | Variabel | NPV | Kapital |
|---|---|---|---|
| Fabrikk i A? | $x_1$ | 9 | 6 |
| Fabrikk i B? | $x_2$ | 5 | 3 |
| Lager i A? | $x_3$ | 6 | 5 |
| Lager i B? | $x_4$ | 4 | 2 |

$$\max 9x_1 + 5x_2 + 6x_3 + 4x_4\ \text{s.t.}\ 6x_1 + 3x_2 + 5x_3 + 2x_4 \le 10,\ x_3 + x_4 \le 1,\ -x_1 + x_3 \le 0,\ -x_2 + x_4 \le 0,\ x_j\in\{0,1\}.$$
- $x_3 + x_4 \le 1$: **gjensidig utelukkende** alternativer (høyst ett lager).
- $x_3 \le x_1$, $x_4 \le x_2$: **betingede** beslutninger (lager bare der det bygges fabrikk).
Optimum: begge fabrikker, $Z = 14$. Dette er BIP-eksemplet i branch-and-bound-forelesningen.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="do-m7" />
        </Step>
      </Concept>

      <Concept id="network" title="Nettverksdesign (Example 7)">
        <Step kind="definition">
          <T>{r`Tre mulige fabrikker (Brasil, Filippinene, Mexico) med oppstartskostnad 500, 400, 600, variabel kostnad 10, 12, 16 og kapasitet 30, 25, 35. Fire kunder med etterspørsel 18, 15, 20, 12. Variabler: $y_i$ (åpne), $x_i$ (produksjon), $t_{ij}$ (transport).
$$\begin{aligned}\min\ & 500y_B + 400y_P + 600y_M + 10x_B + 12x_P + 16x_M + \textstyle\sum c_{ij}t_{ij}\\ \text{s.t.}\ & x_i = t_{iC} + t_{iU} + t_{iE} + t_{iS}\quad (i = B,P,M)\quad\text{(alt produsert sendes ut)}\\ & t_{BC} + t_{PC} + t_{MC} = 18,\ \dots\quad\text{(etterspørsel)}\\ & x_B \le 30y_B,\ x_P \le 25y_P,\ x_M \le 35y_M\quad\text{(kapasitet bare hvis åpen)}\\ & x, t \ge 0,\ y\ \text{binær}\end{aligned}$$
Transportkostnader: Brasil → C/U/E/S: 9, 9, 7, 5; Filippinene: 7, 7, 4, 6; Mexico: 3, 4, 7, 9.`}</T>
        </Step>
        <Step kind="exam" title="Midtveis-øving Q3 (hele i eksamenssimulatoren)">
          <T>{r`Q3(a) kombinerer heltallsproduksjon med **utviklingskostnad** (fast kostnad): $\max \sum r_jx_j - \sum d_jy_j$, materialer $\sum a_jx_j \le 500\,000$, $x_j \le My_j$. Q3(b) legger til budsjett, «høyst fire», «4 bare hvis 1 eller 2», «5 bare hvis 2 eller 3» og halve enheter ($x_j = 0.5z_j$, $z_j$ heltall). Q3(c) er en BIP med produksjonsnivåer: $y_{jk}$ binær, $\sum_k y_{jk} \le 1$, $\sum_{j,k} k\,y_{jk} \le 6$. Løs hele oppgaven under «Eksamenssimulator».`}</T>
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Glemme koblingen mellom produksjon og åpning (som i tekstil-formulering 1).
- Bruke produkter av variabler ($x_iy_i$) – ikke-lineært.
- Set covering bruker $\ge 1$, ikke $= 1$.
- Bland ikke «gjensidig utelukkende» ($\le 1$) og «betinget» ($x_3 \le x_1$).`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Kobling: $x_i \le My_i$ eller $x_i \le u_iy_i$.
- Set covering: $\min\sum x_j$, $\sum_j a_{ij}x_j \ge 1$.
- Lokalisering: gjensidig utelukkende + betingede beslutninger.
- Nettverksdesign: oppstart + variabel + transport, flytbalanse, kapasitet koblet til åpning.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
