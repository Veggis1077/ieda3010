import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BIPExplorer } from '../../labs/BIPExplorer';

const r = String.raw;

export default function DO1() {
  return (
    <div className="space-y-10">
      <Concept id="why" title="Hvorfor diskret optimering?">
        <Step kind="intuition">
          <T>{r`Mange beslutninger er ikke delbare: antall arbeidere, biler, maskiner – eller **ja/nei**: bygge fabrikken eller ikke, velge prosjektet eller ikke. I tillegg vil vi modellere **logiske** krav («hvis A, så B») og gjøre noen ikke-lineære krav lineære. CPLEX rapporterer at over 90 % av kundenes problemer er MIP – heltallsmodellering er et svært kraftig verktøy (selv Sudoku kan formuleres som et IP).`}</T>
        </Step>
        <Step kind="definition" title="Taksonomi (DO1 s. 4)">
          <T>{r`**Diskret optimering**: noen eller alle variabler må være heltall.
- **IP** (integer programming): lineær optimering der **alle** variabler er heltall.
- **BIP** (binary): alle variabler er binære $\{0,1\}$.
- **MIP** (mixed integer): **noen** variabler er heltall eller binære.

Generell MIP (DO1 s. 52): $\min/\max\ c^\top x$ s.t. likheter, $\le$- og $\ge$-restriksjoner, $x\ge 0$, og $x_1,\dots,x_k$ heltall.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="do-t1" />
        </Step>
        <Step kind="exam">
          <Ex id="do-t2" />
        </Step>
      </Concept>

      <Concept id="capital" title="Kapitalbudsjettering og knapsack">
        <Step kind="example" title="Example 1 (DO1 s. 5–8)">
          <T>{r`\$15 000 til 7 investeringer; ingen delvise investeringer.

| Inv. | Kontanter | NPV |
|---|---|---|
| 1 | 5 000 | 16 000 |
| 2 | 2 500 | 8 000 |
| 3 | 3 500 | 10 000 |
| 4 | 6 000 | 19 500 |
| 5 | 7 000 | 22 000 |
| 6 | 4 500 | 12 000 |
| 7 | 3 000 | 7 500 |

$x_j = 1$ hvis investering $j$ velges. $\max\sum_j v_jx_j$ s.t. $\sum_j a_jx_j \le 15\,000$, $x_j \in\{0,1\}$. Optimum: investering 1, 2 og 5 (NPV \$46 000, bruker \$14 500). Tilleggsspørsmål: høyst én investering ($\sum x_j \le 1$); 1 og 2 ikke sammen ($x_1 + x_2 \le 1$); 5 bare hvis 1 ($x_5 \le x_1$).`}</T>
        </Step>
        <Step kind="definition" title="Knapsack (DO1 s. 9)">
          <T>{r`$n$ «skatter»; sekken tåler vekt/volum $b$; skatt $j$ har verdi og vekt; $x_j$ = om skatt $j$ velges. $\max \sum_j (\text{verdi}_j) x_j$ s.t. $\sum_j (\text{vekt}_j) x_j \le b$, $x_j\in\{0,1\}$. Kapitalbudsjettering er et knapsack-problem. (Merk: lysbildet bruker $a_j$ for verdi og $c_j$ for vekt – motsatt av kapitalbudsjetteringstabellen. Les alltid definisjonene i oppgaven.)`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg investeringer, slå på tilleggskravene og sammenlign med optimum og LP-relaksering (som gir en brøkdel av investering 5).">
            <BIPExplorer presetId="capital" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-m1" />
        </Step>
        <Step kind="exam">
          <Ex id="do-m2" />
        </Step>
      </Concept>

      <Concept id="assignment" title="Dantzigs tilordningsproblem">
        <Step kind="definition">
          <T>{r`70 arbeidere, 70 jobber; $p_{ij}$ = ytelsen til arbeider $i$ i jobb $j$. $x_{ij} = 1$ hvis arbeider $i$ får jobb $j$.
$$\max \sum_{i=1}^{70}\sum_{j=1}^{70} p_{ij}x_{ij}\quad\text{s.t.}\quad \sum_{j} x_{ij} = 1\ \forall i,\qquad \sum_i x_{ij} = 1\ \forall j,\qquad x_{ij}\ \text{binær}.$$
$70\times70 = 4900$ binære variabler og $70 + 70 + 4900 = 5040$ restriksjoner (inkl. binærkravene). Løst på 0,09 s med Gurobi – mot $70!$ alternativer ved brute force.`}</T>
        </Step>
        <Step kind="example" title="Husarbeid (DO Practice 3) – en variant">
          <T>{r`Hver person tar **to** oppgaver ($\sum_j x_{ij} = 2$), hver oppgave gjøres av én ($\sum_i x_{ij} = 1$). Prøv i BIP-utforskeren (problem «Husarbeid»).`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="do-m5" />
        </Step>
        <Step kind="exam">
          <Ex id="do-m4" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- MIP betyr ikke at alle variabler er heltall.
- LP-løsningen kan ikke bare avrundes (se DO5).
- Antall tillatte løsninger i et IP er endelig **bare** når området er begrenset.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- IP: alle heltall; BIP: alle binære; MIP: noen heltall/binære.
- Knapsack/kapitalbudsjett: $\max v^\top x$, $a^\top x \le b$, $x$ binær.
- Tilordning: rad- og kolonnesummer = 1 (eller antall oppgaver per person).`}</T>
        </Step>
      </Concept>
    </div>
  );
}
