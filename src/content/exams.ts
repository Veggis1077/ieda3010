import { ExpectedFormulation } from '../math/linparse';
import { NumField } from './types';

const r = String.raw;

export type ExamAuto =
  | { kind: 'formulation'; expected: ExpectedFormulation; placeholder?: string }
  | { kind: 'numeric'; fields: NumField[] }
  | { kind: 'tf'; statements: { text: string; answer: boolean; why: string }[] };

export interface ExamPart {
  id: string;
  label: string;
  points: number;
  topics: string[];
  prompt: string;
  auto?: ExamAuto;
  /** rubric for self-grading (used when no auto) or as guidance */
  rubric: { text: string; pts: number }[];
  solution: string;
}

export interface ExamQuestion {
  id: string;
  title: string;
  intro: string;
  parts: ExamPart[];
}

export interface Exam {
  id: string;
  title: string;
  kind: 'official' | 'generated';
  description: string;
  durationMin: number;
  questions: ExamQuestion[];
}

const P5 = ['x1', 'x2', 'x3', 'x4', 'x5'];
const Y5 = ['y1', 'y2', 'y3', 'y4', 'y5'];

export const EXAMS: Exam[] = [
  {
    id: 'official-midterm',
    title: 'Midterm Exam Practice (offisiell øvingseksamen)',
    kind: 'official',
    description:
      'Oppgavene er hentet ordrett fra «Midterm Exam Practice.pdf». Kursmateriellet inneholder **ingen offisielle løsninger** til denne eksamenen; løsningsforslagene her er laget av plattformen og verifisert med plattformens LP/IP-løser der det er mulig.',
    durationMin: 120,
    questions: [
      {
        id: 'q1',
        title: 'Question 1 (30 points)',
        intro: r`A company produces two kinds of products. A product of the first type requires 1 hour of assembly labor, 1 hour of testing. A product of the second type requires 2 hours of assembly, 3 hours of testing. Given the company's current personnel, there can be at most 80 hours of assembly labor and 90 hours of testing daily. Products of the first and second type have a profit of 2 HKD and 5 HKD respectively.`,
        parts: [
          {
            id: 'q1a',
            label: '(a)',
            points: 10,
            topics: ['lo.formulation'],
            prompt: r`Formulate a linear programming problem that can be used to maximize the daily profit of the company. (Use $x_1, x_2$.)`,
            auto: { kind: 'formulation', expected: { vars: ['x1', 'x2'], objective: { sense: 'max', expr: '2x1 + 5x2' }, constraints: ['x1 + 2x2 <= 80', 'x1 + 3x2 <= 90'], nonneg: ['x1', 'x2'] } },
            rubric: [
              { text: 'Beslutningsvariabler definert med enheter (antall per dag)', pts: 2 },
              { text: 'Korrekt målfunksjon', pts: 2 },
              { text: 'Monteringsrestriksjon', pts: 2 },
              { text: 'Testrestriksjon', pts: 2 },
              { text: 'Ikke-negativitet', pts: 2 },
            ],
            solution: r`$x_1, x_2$ = antall produkter av type 1 og 2 per dag.
$$\begin{aligned}\max\ & Z = 2x_1 + 5x_2\\ \text{s.t.}\ & x_1 + 2x_2 \le 80 \quad\text{(assembly)}\\ & x_1 + 3x_2 \le 90 \quad\text{(testing)}\\ & x_1, x_2 \ge 0\end{aligned}$$`,
          },
          {
            id: 'q1b',
            label: '(b)',
            points: 8,
            topics: ['lo.graphical'],
            prompt: r`Use the graphical method by hand to solve the problem. Report $x_1^*, x_2^*$ and $Z^*$.`,
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'x_1^*', answer: 60 },
                { label: 'x_2^*', answer: 10 },
                { label: 'Z^*', answer: 170 },
              ],
            },
            rubric: [
              { text: 'Korrekt tegnet tillatt område med akser og restriksjonslinjer', pts: 3 },
              { text: 'Hjørnepunktene identifisert: (0,0), (80,0), (60,10), (0,30)', pts: 2 },
              { text: 'Isokvant/evaluering av hjørner, riktig optimum', pts: 3 },
            ],
            solution: r`Hjørner: $(0,0)$: 0; $(80,0)$: 160; $(0,30)$: 150; skjæringen $x_1 + 2x_2 = 80$, $x_1 + 3x_2 = 90$ ⇒ $x_2 = 10$, $x_1 = 60$: $Z = 170$. **Optimum $(60,10)$, $Z^* = 170$ HKD/dag.** Begge restriksjoner er bindende.`,
          },
          {
            id: 'q1c',
            label: '(c)',
            points: 6,
            topics: ['lo.sens-c', 'lo.special'],
            prompt: r`The profit for the second type drops from 5 HKD to 4 HKD. What are the optimal solutions? Report the optimal value, and describe the set of optimal solutions in the text box of your own notes.`,
            auto: { kind: 'numeric', fields: [{ label: 'Z^*', answer: 160 }] },
            rubric: [
              { text: 'Ser at objektivlinjen nå er parallell med monteringsrestriksjonen', pts: 2 },
              { text: 'Angir at alle punkter på linjestykket mellom (60,10) og (80,0) er optimale', pts: 3 },
              { text: 'Z* = 160', pts: 1 },
            ],
            solution: r`$Z = 2x_1 + 4x_2 = 2(x_1 + 2x_2)$ er parallell med monteringsrestriksjonen. $(80,0)$: 160, $(60,10)$: 160, $(0,30)$: 120. **Flere optimale løsninger:** $\{(x_1,x_2): x_1 + 2x_2 = 80,\ 60 \le x_1 \le 80\}$, dvs. $\lambda(60,10) + (1-\lambda)(80,0)$, $\lambda\in[0,1]$, med $Z^* = 160$.`,
          },
          {
            id: 'q1d',
            label: '(d)',
            points: 6,
            topics: ['lo.sens-c'],
            prompt: r`The profit for the first type remains unchanged while the profit for the second type changes from 5 HKD to $x$ HKD. Determine the range of $x$ such that the solution from (b) is still optimal.`,
            auto: {
              kind: 'numeric',
              fields: [
                { label: r`x_{\min}`, answer: 4 },
                { label: r`x_{\max}`, answer: 6 },
              ],
            },
            rubric: [
              { text: 'Bruker stigningstall (eller nabohjørner) korrekt', pts: 3 },
              { text: 'Riktig intervall 4 ≤ x ≤ 6 inkludert endepunkter', pts: 3 },
            ],
            solution: r`$(60,10)$ forblir optimal så lenge objektivlinjens stigningstall $-2/x$ ligger mellom stigningstallene til de bindende restriksjonene: $-\tfrac12$ (montering) og $-\tfrac13$ (testing): $-\tfrac12 \le -\tfrac2x \le -\tfrac13 \iff 4 \le x \le 6$. Alternativt: $Z(60,10) \ge Z(80,0)$ gir $120 + 10x \ge 160 \Rightarrow x \ge 4$; $Z(60,10) \ge Z(0,30)$ gir $120 + 10x \ge 30x \Rightarrow x \le 6$.`,
          },
        ],
      },
      {
        id: 'q2',
        title: 'Question 2 (20 points)',
        intro: r`Bank at HKUST with four services: account opening ($x_1$), credit card application ($x_2$), money saving/retrieving ($x_3$), general inquiries ($x_4$). Front desk clerk minutes per case: 60, 10, 20, 10 (1000 available per day). Printer minutes: 30, 20, 20, 5 (800 available). Profit per case: \$360, \$180, \$120, \$40.`,
        parts: [
          {
            id: 'q2a',
            label: '(a)',
            points: 7,
            topics: ['lo.formulation'],
            prompt: r`Formulate an LP model for this problem.`,
            auto: {
              kind: 'formulation',
              expected: { vars: ['x1', 'x2', 'x3', 'x4'], objective: { sense: 'max', expr: '360x1 + 180x2 + 120x3 + 40x4' }, constraints: ['60x1 + 10x2 + 20x3 + 10x4 <= 1000', '30x1 + 20x2 + 20x3 + 5x4 <= 800'], nonneg: ['x1', 'x2', 'x3', 'x4'] },
            },
            rubric: [
              { text: 'Variabler definert', pts: 1 },
              { text: 'Målfunksjon', pts: 2 },
              { text: 'Skranke- og skriverrestriksjon', pts: 3 },
              { text: 'Ikke-negativitet', pts: 1 },
            ],
            solution: r`$$\max 360x_1 + 180x_2 + 120x_3 + 40x_4\ \text{s.t.}\ 60x_1 + 10x_2 + 20x_3 + 10x_4 \le 1000,\ 30x_1 + 20x_2 + 20x_3 + 5x_4 \le 800,\ x \ge 0.$$`,
          },
          {
            id: 'q2b',
            label: '(b)',
            points: 13,
            topics: ['lo.dual', 'lo.cs', 'lo.duality-thm'],
            prompt: r`Construct its dual problem. Find the optimal solutions for both the primal and dual problems.`,
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'y_1^*', answer: 2 },
                { label: 'y_2^*', answer: 8 },
                { label: 'x_1^*', answer: 40 / 3 },
                { label: 'x_2^*', answer: 20 },
                { label: 'x_3^*', answer: 0 },
                { label: 'x_4^*', answer: 0 },
                { label: 'Z^* = W^*', answer: 8400 },
              ],
            },
            rubric: [
              { text: 'Korrekt dual: min 1000y₁ + 800y₂ med fire ≥-restriksjoner og y ≥ 0', pts: 4 },
              { text: 'Dual løst grafisk (hjørner vurdert)', pts: 4 },
              { text: 'Komplementær slakkhet brukt for å finne primalløsningen', pts: 4 },
              { text: 'Sterk dualitet verifisert (Z* = W* = 8400)', pts: 1 },
            ],
            solution: r`**Dual:** $\min W = 1000y_1 + 800y_2$ s.t. $60y_1 + 30y_2 \ge 360$, $10y_1 + 20y_2 \ge 180$, $20y_1 + 20y_2 \ge 120$, $10y_1 + 5y_2 \ge 40$, $y_1, y_2 \ge 0$.
**Grafisk:** hjørner av det ubegrensede dualområdet: $(0,12)$: $W = 9600$; $(2,8)$ [skjæring av rest. 1 og 2]: $W = 8400$; $(18,0)$: $W = 18000$. Optimum $y^* = (2,8)$, $W^* = 8400$.
**CS:** $y_1^*, y_2^* > 0$ ⇒ begge primalrestriksjoner bindende. Dualrestriksjon 3: $40 + 160 = 200 > 120$ og 4: $20 + 40 = 60 > 40$ ⇒ $x_3^* = x_4^* = 0$. Løs $60x_1 + 10x_2 = 1000$, $30x_1 + 20x_2 = 800$ ⇒ $x_1^* = \tfrac{40}{3}$, $x_2^* = 20$. $Z^* = 4800 + 3600 = 8400 = W^*$.
Tolkning: ett ekstra minutt skranketid er verdt \$2, ett ekstra skriverminutt \$8.`,
          },
        ],
      },
      {
        id: 'q3',
        title: 'Question 3 (30 points)',
        intro: r`Five new nutritious foods.

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Developing cost | \$40,000 | \$35,000 | \$45,000 | \$60,000 | \$55,000 |
| Materials required | 40 units | 20 units | 50 units | 70 units | 60 units |
| Revenue per unit | \$60 | \$40 | \$75 | \$120 | \$100 |`,
        parts: [
          {
            id: 'q3a',
            label: '(a)',
            points: 8,
            topics: ['do.fixed', 'do.models'],
            prompt: r`We only have 500,000 units of materials. The production amount should be an integer. Formulate an IP model. (Use $x_j$ = units of food $j$, $y_j$ = 1 if food $j$ is developed, and $M$ for a big constant.)`,
            auto: {
              kind: 'formulation',
              expected: {
                vars: [...P5, ...Y5, 'M'],
                objective: { sense: 'max', expr: '60x1 + 40x2 + 75x3 + 120x4 + 100x5 - 40000y1 - 35000y2 - 45000y3 - 60000y4 - 55000y5' },
                constraints: ['40x1 + 20x2 + 50x3 + 70x4 + 60x5 <= 500000', 'x1 <= M*y1', 'x2 <= M*y2', 'x3 <= M*y3', 'x4 <= M*y4', 'x5 <= M*y5'],
                alternatives: { 1: ['x1 <= 12500y1'], 2: ['x2 <= 25000y2'], 3: ['x3 <= 10000y3'], 4: ['x4 <= 7142y4'], 5: ['x5 <= 8333y5'] },
                nonneg: P5,
                integer: P5,
                binary: Y5,
              },
              placeholder: 'max ...\n40x1 + ... <= 500000\nx1 <= M*y1\n...\nx1, x2, x3, x4, x5 >= 0\nx1, x2, x3, x4, x5 integer\ny1, y2, y3, y4, y5 binary',
            },
            rubric: [
              { text: 'Heltallige produksjonsvariabler og binære utviklingsvariabler definert', pts: 2 },
              { text: 'Målfunksjon: inntekt minus faste utviklingskostnader', pts: 2 },
              { text: 'Materialrestriksjon', pts: 2 },
              { text: 'Koblingsrestriksjoner xⱼ ≤ Myⱼ', pts: 2 },
            ],
            solution: r`**Tolkning:** «developing cost (set-up cost)» er en fast kostnad som påløper bare hvis produktet utvikles/produseres ⇒ fixed charge.
$$\begin{aligned}\max\ & 60x_1 + 40x_2 + 75x_3 + 120x_4 + 100x_5 - (40000y_1 + 35000y_2 + 45000y_3 + 60000y_4 + 55000y_5)\\ \text{s.t.}\ & 40x_1 + 20x_2 + 50x_3 + 70x_4 + 60x_5 \le 500\,000\\ & x_j \le My_j,\quad j = 1,\dots,5\\ & x_j \ge 0 \text{ heltall},\ y_j \in\{0,1\}\end{aligned}$$
$M$ kan velges som $\lfloor 500000/a_j\rfloor$ (12500, 25000, 10000, 7142, 8333). (Plattformens løsningsforslag – ingen offisiell fasit.)`,
          },
          {
            id: 'q3b',
            label: '(b)',
            points: 12,
            topics: ['do.logic', 'do.fixed', 'do.binexp'],
            prompt: r`Restrictions: total development cost at most \$200,000; at most four products; product 4 only if product 1 or 2; product 5 only if product 2 or 3; production amounts must be integer multiples of 0.5. Reformulate the IP model. (Selvvurdering – skriv modellen i notatfeltet eller på papir.)`,
            rubric: [
              { text: 'Utviklingsbudsjett: 40000y₁ + 35000y₂ + 45000y₃ + 60000y₄ + 55000y₅ ≤ 200000', pts: 2 },
              { text: 'Høyst fire produkter: Σ yⱼ ≤ 4', pts: 2 },
              { text: 'y₄ ≤ y₁ + y₂', pts: 2 },
              { text: 'y₅ ≤ y₂ + y₃', pts: 2 },
              { text: 'Halve enheter: xⱼ = 0.5zⱼ med zⱼ ≥ 0 heltall (og xⱼ kontinuerlig), eller tilsvarende', pts: 3 },
              { text: 'Resten av modellen fra (a) beholdt (materialer, kobling, målfunksjon)', pts: 1 },
            ],
            solution: r`Behold (a) og legg til:
$$\begin{aligned} & 40000y_1 + 35000y_2 + 45000y_3 + 60000y_4 + 55000y_5 \le 200\,000\\ & y_1 + y_2 + y_3 + y_4 + y_5 \le 4\\ & y_4 \le y_1 + y_2,\qquad y_5 \le y_2 + y_3\\ & x_j = 0.5\,z_j,\ z_j \in \mathbb{Z}_{\ge 0},\ j = 1,\dots,5\end{aligned}$$
og fjern heltallskravet på $x_j$ (det er nå $z_j$ som er heltall). Inntekten er fortsatt $\sum r_jx_j$ fordi en halv enhet gir halv inntekt. Merk: alle fem produktene koster til sammen $235\,000 > 200\,000$, så budsjettet utelukker allerede fem produkter – «høyst fire» er derfor redundant gitt budsjettet, men skal likevel tas med fordi oppgaven ber om det (og modellen blir robust mot endringer i budsjettet).`,
          },
          {
            id: 'q3c',
            label: '(c)',
            points: 10,
            topics: ['do.nvalues', 'do.models'],
            prompt: r`Ignore costs/revenues/restrictions above. Profit (in million) by production level (in thousand):

| Level | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 1 | −1 | −0.5 | −1.5 | 1 | 0.5 |
| 2 | 2 | 1 | 1 | 1.5 | 1 |
| 3 | – | 2.5 | 3 | – | 2 |

At most 6 thousand units in total. Formulate a BIP model. Use $y_{jk} = 1$ if food $j$ is produced at level $k$ (variables y11, y12, y21, y22, y23, y31, y32, y33, y41, y42, y51, y52, y53).`,
            auto: {
              kind: 'formulation',
              expected: {
                vars: ['y11', 'y12', 'y21', 'y22', 'y23', 'y31', 'y32', 'y33', 'y41', 'y42', 'y51', 'y52', 'y53'],
                objective: { sense: 'max', expr: '-y11 + 2y12 - 0.5y21 + y22 + 2.5y23 - 1.5y31 + y32 + 3y33 + y41 + 1.5y42 + 0.5y51 + y52 + 2y53' },
                constraints: ['y11 + y12 <= 1', 'y21 + y22 + y23 <= 1', 'y31 + y32 + y33 <= 1', 'y41 + y42 <= 1', 'y51 + y52 + y53 <= 1', 'y11 + 2y12 + y21 + 2y22 + 3y23 + y31 + 2y32 + 3y33 + y41 + 2y42 + y51 + 2y52 + 3y53 <= 6'],
                binary: ['y11', 'y12', 'y21', 'y22', 'y23', 'y31', 'y32', 'y33', 'y41', 'y42', 'y51', 'y52', 'y53'],
              },
              placeholder: 'max -y11 + 2y12 ...\ny11 + y12 <= 1\n...\ny11, y12, ... binary',
            },
            rubric: [
              { text: 'Binære variabler per (produkt, nivå) definert', pts: 2 },
              { text: 'Målfunksjon fra tabellen', pts: 3 },
              { text: 'Høyst ett nivå per produkt', pts: 3 },
              { text: 'Kapasitet: Σ k·yⱼₖ ≤ 6', pts: 2 },
            ],
            solution: r`$y_{jk} = 1$ hvis mat $j$ produseres på nivå $k$ (tusen enheter). Nivå 0 betyr at alle $y_{jk} = 0$ for produktet.
$$\begin{aligned}\max\ & -y_{11} + 2y_{12} - 0.5y_{21} + y_{22} + 2.5y_{23} - 1.5y_{31} + y_{32} + 3y_{33} + y_{41} + 1.5y_{42} + 0.5y_{51} + y_{52} + 2y_{53}\\ \text{s.t.}\ & \textstyle\sum_k y_{jk} \le 1 \quad j = 1,\dots,5\\ & \textstyle\sum_j\sum_k k\,y_{jk} \le 6\\ & y_{jk}\in\{0,1\}\end{aligned}$$
Optimum (plattformens oppramsing): produkt 1 på nivå 2, produkt 3 på nivå 3, produkt 4 på nivå 1: profitt 6 millioner. (Ikke offisiell.)`,
          },
        ],
      },
      {
        id: 'q4',
        title: 'Question 4 (20 points)',
        intro: r`True or false (2.5 points each).`,
        parts: [
          {
            id: 'q4',
            label: '(a)–(h)',
            points: 20,
            topics: ['lo.special', 'lo.sens-b', 'lo.cs', 'lo.duality-thm', 'do.intro', 'do.bigm'],
            prompt: r`Mark each statement T or F.`,
            auto: {
              kind: 'tf',
              statements: [
                { text: 'Linear programming problems can have multiple optimal solutions.', answer: true, why: 'Objektivlinjen parallell med en bindende kant.' },
                { text: 'If a linear programming problem has two different optimal solutions, it must have infinitely many optimal solutions.', answer: true, why: 'Alle konvekse kombinasjoner er optimale.' },
                { text: r`The optimal solution always changes when the constraint quantity ($b_i$) changes.`, answer: false, why: 'Ikke for ikke-bindende restriksjoner (innenfor slakken).' },
                { text: 'For a standard-form LP with n decision variables and m constraints, there are m + n equations in complementary slackness.', answer: true, why: 'm for restriksjonene, n for variablene.' },
                { text: 'The dual of the dual problem is the original primal problem.', answer: true, why: 'Symmetri.' },
                { text: 'All the decision variables of a mixed integer programming problem are integer or binary-valued.', answer: false, why: 'Noen er kontinuerlige.' },
                { text: 'To represent the “K out of N constraints must hold” relationship, we can add N extra binary variables.', answer: true, why: 'Én yᵢ per restriksjon med Σyᵢ = N − K.' },
                { text: 'The number of feasible solutions to an integer programming problem must be finite.', answer: false, why: 'Ikke hvis området er ubegrenset.' },
              ],
            },
            rubric: [{ text: '2.5 poeng per riktig svar', pts: 20 }],
            solution: r`(a) T, (b) T, (c) F, (d) T, (e) T, (f) F, (g) T, (h) F. (Plattformens fasit – ingen offisiell fasit følger med.)`,
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'gen-a',
    title: 'Generert øvingseksamen A',
    kind: 'generated',
    description: 'Nye oppgaver laget av plattformen i samme format og vanskelighetsgrad som øvingseksamenen. Alle tallsvar er verifisert med plattformens løser.',
    durationMin: 120,
    questions: [
      {
        id: 'a1',
        title: 'Oppgave 1 (30 poeng) – Treleker',
        intro: r`Et verksted lager lastebiler ($x_1$) og tog ($x_2$) i tre. Hver lastebil krever 1 time snekring og 2 timer maling; hvert tog 1 time snekring og 1 time maling. Det er 9 timer snekring og 14 timer maling per dag, og man kan selge høyst 7 tog per dag. Profitten er 3 og 2 (HK\$100) per enhet.`,
        parts: [
          {
            id: 'a1a',
            label: '(a)',
            points: 8,
            topics: ['lo.formulation'],
            prompt: 'Formuler LP-modellen.',
            auto: { kind: 'formulation', expected: { vars: ['x1', 'x2'], objective: { sense: 'max', expr: '3x1 + 2x2' }, constraints: ['x1 + x2 <= 9', '2x1 + x2 <= 14', 'x2 <= 7'], nonneg: ['x1', 'x2'] } },
            rubric: [
              { text: 'Målfunksjon', pts: 2 },
              { text: 'Snekring og maling', pts: 4 },
              { text: 'Markedsbegrensning og ikke-negativitet', pts: 2 },
            ],
            solution: r`$\max 3x_1 + 2x_2$ s.t. $x_1 + x_2 \le 9$, $2x_1 + x_2 \le 14$, $x_2 \le 7$, $x \ge 0$.`,
          },
          {
            id: 'a1b',
            label: '(b)',
            points: 8,
            topics: ['lo.graphical'],
            prompt: 'Løs grafisk. Oppgi optimal løsning og verdi.',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'x_1^*', answer: 5 },
                { label: 'x_2^*', answer: 4 },
                { label: 'Z^*', answer: 23 },
              ],
            },
            rubric: [
              { text: 'Korrekt område og hjørner', pts: 4 },
              { text: 'Riktig optimum med begrunnelse', pts: 4 },
            ],
            solution: r`Hjørner: $(0,0)$: 0, $(7,0)$: 21, $(5,4)$: 23, $(2,7)$: 20, $(0,7)$: 14. Optimum $(5,4)$, $Z^* = 23$ (HK\$2300). Bindende: snekring og maling.`,
          },
          {
            id: 'a1c',
            label: '(c)',
            points: 7,
            topics: ['lo.sens-b'],
            prompt: 'Finn skyggeprisen for snekretimer og intervallet for antall snekretimer der den gjelder.',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'y_1', answer: 1 },
                { label: r`b_1^{\min}`, answer: 7 },
                { label: r`b_1^{\max}`, answer: 10.5 },
              ],
            },
            rubric: [
              { text: 'Skyggepris fra dual/CS eller ved å flytte restriksjonen', pts: 3 },
              { text: 'Riktig intervall med begrunnelse (hvilken restriksjon som stopper)', pts: 4 },
            ],
            solution: r`Med snekring $= t$: $x_1 = 14 - t$, $x_2 = 2t - 14$. $Z = 3(14 - t) + 2(2t - 14) = 14 + t$ ⇒ skyggepris 1. Gyldig når $x_2 \ge 0$ ($t \ge 7$), $x_1 \ge 0$ ($t \le 14$) og $x_2 \le 7$ ($t \le 10.5$): $[7,\ 10.5]$. Dualt: $y_1 + 2y_2 = 3$, $y_1 + y_2 = 2$ ⇒ $y = (1, 1, 0)$.`,
          },
          {
            id: 'a1d',
            label: '(d)',
            points: 7,
            topics: ['lo.sens-c'],
            prompt: 'For hvilke verdier av profitten per lastebil (nå 3) forblir $(5,4)$ optimal?',
            auto: {
              kind: 'numeric',
              fields: [
                { label: r`c_1^{\min}`, answer: 2 },
                { label: r`c_1^{\max}`, answer: 4 },
              ],
            },
            rubric: [
              { text: 'Sammenligner −c₁/2 med stigningene −1 og −2', pts: 4 },
              { text: 'Riktig intervall [2, 4]', pts: 3 },
            ],
            solution: r`$-2 \le -c_1/2 \le -1 \iff 2 \le c_1 \le 4$. I endepunktene er en hel kant optimal.`,
          },
        ],
      },
      {
        id: 'a2',
        title: 'Oppgave 2 (20 poeng) – Dualitet',
        intro: r`$\max Z = 10x_1 + 6x_2 + 8x_3$ s.t. $2x_1 + x_2 + 2x_3 \le 20$, $x_1 + x_2 + x_3 \le 12$, $x_1, x_2, x_3 \ge 0$.`,
        parts: [
          {
            id: 'a2a',
            label: '(a)',
            points: 6,
            topics: ['lo.dual'],
            prompt: 'Skriv dualproblemet (variabler $y_1, y_2$).',
            auto: { kind: 'formulation', expected: { vars: ['y1', 'y2'], objective: { sense: 'min', expr: '20y1 + 12y2' }, constraints: ['2y1 + y2 >= 10', 'y1 + y2 >= 6', '2y1 + y2 >= 8'], nonneg: ['y1', 'y2'] } },
            rubric: [{ text: 'Korrekt dual', pts: 6 }],
            solution: r`$\min 20y_1 + 12y_2$ s.t. $2y_1 + y_2 \ge 10$, $y_1 + y_2 \ge 6$, $2y_1 + y_2 \ge 8$, $y \ge 0$.`,
          },
          {
            id: 'a2b',
            label: '(b)',
            points: 14,
            topics: ['lo.dual', 'lo.cs'],
            prompt: 'Løs dualen grafisk, og bruk komplementær slakkhet til å finne primalløsningen.',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'y_1^*', answer: 4 },
                { label: 'y_2^*', answer: 2 },
                { label: 'x_1^*', answer: 8 },
                { label: 'x_2^*', answer: 4 },
                { label: 'x_3^*', answer: 0 },
                { label: 'Z^*', answer: 104 },
              ],
            },
            rubric: [
              { text: 'Grafisk dual med hjørner (0,10), (4,2), (6,0)', pts: 5 },
              { text: 'CS-resonnement (x₃ = 0, begge primalrestriksjoner bindende)', pts: 6 },
              { text: 'Verifisering Z* = W*', pts: 3 },
            ],
            solution: r`Dualhjørner: $(0,10)$: 120; $(4,2)$ [fra $2y_1 + y_2 = 10$, $y_1 + y_2 = 6$]: $80 + 24 = 104$; $(6,0)$: 120. ($2y_1 + y_2 \ge 8$ er redundant.) $y^* = (4,2)$, $W^* = 104$. CS: dualrestriksjon 3 har overskudd ($10 > 8$) ⇒ $x_3 = 0$; $y_1, y_2 > 0$ ⇒ $2x_1 + x_2 = 20$, $x_1 + x_2 = 12$ ⇒ $x^* = (8, 4, 0)$, $Z^* = 80 + 24 = 104$ ✓.`,
          },
        ],
      },
      {
        id: 'a3',
        title: 'Oppgave 3 (30 poeng) – Prosjektvalg',
        intro: r`En by vurderer fem prosjekter. Kostnad (mill.): 4, 3, 5, 2, 6. Nytte: 10, 7, 12, 4, 13. Budsjett: 12 mill. Bruk binære $x_1,\dots,x_5$.`,
        parts: [
          {
            id: 'a3a',
            label: '(a)',
            points: 8,
            topics: ['do.models'],
            prompt: 'Formuler BIP-modellen som maksimerer nytten.',
            auto: { kind: 'formulation', expected: { vars: P5, objective: { sense: 'max', expr: '10x1 + 7x2 + 12x3 + 4x4 + 13x5' }, constraints: ['4x1 + 3x2 + 5x3 + 2x4 + 6x5 <= 12'], binary: P5 } },
            rubric: [{ text: 'Målfunksjon, budsjett, binærkrav', pts: 8 }],
            solution: r`$\max 10x_1 + 7x_2 + 12x_3 + 4x_4 + 13x_5$ s.t. $4x_1 + 3x_2 + 5x_3 + 2x_4 + 6x_5 \le 12$, $x_j\in\{0,1\}$.`,
          },
          {
            id: 'a3b',
            label: '(b)',
            points: 12,
            topics: ['do.logic'],
            prompt: r`Legg til: (i) høyst tre prosjekter; (ii) prosjekt 3 kan bare velges hvis prosjekt 1 velges; (iii) nøyaktig ett av prosjekt 4 og 5; (iv) prosjekt 1 og 2 velges sammen eller ikke i det hele tatt. (Selvvurdering.)`,
            rubric: [
              { text: '(i) x₁ + x₂ + x₃ + x₄ + x₅ ≤ 3', pts: 3 },
              { text: '(ii) x₃ ≤ x₁', pts: 3 },
              { text: '(iii) x₄ + x₅ = 1', pts: 3 },
              { text: '(iv) x₁ = x₂', pts: 3 },
            ],
            solution: r`(i) $\sum_j x_j \le 3$. (ii) $x_3 \le x_1$. (iii) $x_4 + x_5 = 1$. (iv) $x_1 = x_2$.`,
          },
          {
            id: 'a3c',
            label: '(c)',
            points: 10,
            topics: ['do.bigm'],
            prompt: r`To restriksjoner $3x_1 + 2x_2 \le 18$ og $x_1 + 4x_2 \le 16$ (nå med kontinuerlige $x_1, x_2 \ge 0$) skal ikke begge håndheves; **minst én** må holde. Skriv en formulering med binær $y$ og big $M$, og angi minste gyldige $M$ dersom $x_1 \le 10$ og $x_2 \le 10$. (Selvvurdering.)`,
            rubric: [
              { text: 'To restriksjoner med +My og +M(1 − y)', pts: 5 },
              { text: 'y binær', pts: 1 },
              { text: 'Minste M: max(3·10 + 2·10 − 18, 10 + 40 − 16) = max(32, 34) = 34', pts: 4 },
            ],
            solution: r`$3x_1 + 2x_2 \le 18 + My$, $x_1 + 4x_2 \le 16 + M(1-y)$, $y\in\{0,1\}$. Med $x_1, x_2 \le 10$: venstresidene er høyst $50$ og $50$, så vi trenger $M \ge 50 - 18 = 32$ og $M \ge 50 - 16 = 34$: minste felles $M = 34$.`,
          },
        ],
      },
      {
        id: 'a4',
        title: 'Oppgave 4 (20 poeng) – Sant/usant',
        intro: '2.5 poeng per riktig svar.',
        parts: [
          {
            id: 'a4',
            label: '(a)–(h)',
            points: 20,
            topics: ['lo.geometry', 'lo.sens-b', 'lo.duality-thm', 'do.geometry', 'do.bnb', 'lo.assumptions'],
            prompt: 'Merk hver påstand T eller F.',
            auto: {
              kind: 'tf',
              statements: [
                { text: 'En ikke-bindende ≤-restriksjon har skyggepris 0.', answer: true, why: 'Komplementær slakkhet.' },
                { text: 'Hvis primal er ubegrenset, er dualen ubegrenset.', answer: false, why: 'Dual er ikke tillatt.' },
                { text: 'Å avrunde LP-optimum til nærmeste heltall gir alltid en tillatt heltallsløsning.', answer: false, why: 'DO2 s. 3–4.' },
                { text: 'I et maksimeringsproblem er LP-relakseringens verdi en øvre grense for IP-optimum.', answer: true, why: 'Relakseringen har større tillatt område.' },
                { text: 'En fast oppstartskostnad bryter additivitetsantakelsen.', answer: false, why: 'Den bryter proporsjonalitet.' },
                { text: 'I B&B kan et delproblem med grense lik incumbent-verdien forkastes.', answer: true, why: 'Test 2: bound ≤ Z*.' },
                { text: 'Et LP med ubegrenset tillatt område kan ha en entydig optimal løsning.', answer: true, why: 'F.eks. LO Practice 3(b).' },
                { text: 'Skyggeprisen gjelder for enhver endring av høyresiden.', answer: false, why: 'Bare innenfor sensitivitetsområdet.' },
              ],
            },
            rubric: [{ text: '2.5 poeng per riktig', pts: 20 }],
            solution: r`(a) T (b) F (c) F (d) T (e) F (f) T (g) T (h) F.`,
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'gen-b',
    title: 'Generert øvingseksamen B',
    kind: 'generated',
    description: 'Ny eksamen med minimeringsproblem, branch-and-bound for heltall og MIP-modellering. Tallsvar verifisert med plattformens løser.',
    durationMin: 120,
    questions: [
      {
        id: 'b1',
        title: 'Oppgave 1 (30 poeng) – Fôrblanding',
        intro: r`En gård blander fôr A ($x_1$ kg) og B ($x_2$ kg), som koster 3 og 2 per kg. Blandingen må gi minst 6 enheter energi ($x_1 + x_2$), minst 12 enheter protein ($x_1 + 3x_2$) og minst 8 enheter fiber ($3x_1 + x_2$).`,
        parts: [
          {
            id: 'b1a',
            label: '(a)',
            points: 8,
            topics: ['lo.formulation'],
            prompt: 'Formuler LP som minimerer kostnaden.',
            auto: { kind: 'formulation', expected: { vars: ['x1', 'x2'], objective: { sense: 'min', expr: '3x1 + 2x2' }, constraints: ['x1 + x2 >= 6', 'x1 + 3x2 >= 12', '3x1 + x2 >= 8'], nonneg: ['x1', 'x2'] } },
            rubric: [{ text: 'Mål, tre krav, ikke-negativitet', pts: 8 }],
            solution: r`$\min 3x_1 + 2x_2$ s.t. $x_1 + x_2 \ge 6$, $x_1 + 3x_2 \ge 12$, $3x_1 + x_2 \ge 8$, $x \ge 0$.`,
          },
          {
            id: 'b1b',
            label: '(b)',
            points: 10,
            topics: ['lo.graphical', 'lo.geometry'],
            prompt: 'Løs grafisk. Hvilke restriksjoner er bindende?',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'x_1^*', answer: 1 },
                { label: 'x_2^*', answer: 5 },
                { label: 'Z^*', answer: 13 },
              ],
            },
            rubric: [
              { text: 'Ubegrenset område tegnet korrekt', pts: 3 },
              { text: 'Hjørner (0,8), (1,5), (3,3), (12,0) og evaluering', pts: 4 },
              { text: 'Bindende: energi og fiber; protein har overskudd 4', pts: 3 },
            ],
            solution: r`Hjørner: $(0,8)$: 16; $(1,5)$ [energi ∩ fiber]: 13; $(3,3)$ [energi ∩ protein]: 15; $(12,0)$: 36. Optimum $(1,5)$, $Z^* = 13$. Bindende: energi og fiber. Protein: $1 + 15 = 16 \ge 12$ (overskudd 4).`,
          },
          {
            id: 'b1c',
            label: '(c)',
            points: 12,
            topics: ['lo.sens-b', 'lo.sens-c'],
            prompt: 'Finn skyggeprisene for de tre kravene, intervallet for energikravet der skyggeprisen gjelder, og intervallet for kostnaden til fôr A der løsningen forblir optimal.',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'y_1', answer: 1.5 },
                { label: 'y_2', answer: 0 },
                { label: 'y_3', answer: 0.5 },
                { label: r`b_1^{\min}`, answer: 5 },
                { label: r`b_1^{\max}`, answer: 8 },
                { label: r`c_1^{\min}`, answer: 2 },
                { label: r`c_1^{\max}`, answer: 6 },
              ],
            },
            rubric: [
              { text: 'Skyggepriser via CS/dual (y₂ = 0 fordi protein ikke binder)', pts: 4 },
              { text: 'Intervall for energikravet', pts: 4 },
              { text: 'Intervall for c₁ via stigningstall', pts: 4 },
            ],
            solution: r`Dual (min-primal med ≥): $\max 6y_1 + 12y_2 + 8y_3$ s.t. $y_1 + y_2 + 3y_3 \le 3$, $y_1 + 3y_2 + y_3 \le 2$, $y \ge 0$. CS: $y_2 = 0$; $x_1, x_2 > 0$ ⇒ $y_1 + 3y_3 = 3$, $y_1 + y_3 = 2$ ⇒ $y_3 = \tfrac12$, $y_1 = \tfrac32$. Energi $= t$: $x_1 = (8 - t)/2$, $x_2 = (3t - 8)/2$; protein $x_1 + 3x_2 = 4t - 8 \ge 12 \Rightarrow t \ge 5$; $x_1 \ge 0 \Rightarrow t \le 8$: $[5, 8]$. Kostnad: $-3 \le -c_1/2 \le -1 \iff 2 \le c_1 \le 6$.`,
          },
        ],
      },
      {
        id: 'b2',
        title: 'Oppgave 2 (25 poeng) – Branch-and-bound',
        intro: r`$\max Z = 8x_1 + 5x_2$ s.t. $x_1 + x_2 \le 6$, $9x_1 + 5x_2 \le 45$, $x_1, x_2 \ge 0$ heltall. Bruk B&B (forgren på første variabel med brøkverdi, velg sist opprettede node, ikke avrund grensen).`,
        parts: [
          {
            id: 'b2a',
            label: '(a)',
            points: 8,
            topics: ['do.geometry', 'do.mipbnb'],
            prompt: 'Løs LP-relakseringen.',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'x_1', answer: 3.75 },
                { label: 'x_2', answer: 2.25 },
                { label: 'Z_{LP}', answer: 41.25 },
              ],
            },
            rubric: [{ text: 'Riktig LP-optimum', pts: 8 }],
            solution: r`Skjæring $x_1 + x_2 = 6$, $9x_1 + 5x_2 = 45$: $4x_1 = 15 \Rightarrow x_1 = 3.75$, $x_2 = 2.25$, $Z = 30 + 11.25 = 41.25$.`,
          },
          {
            id: 'b2b',
            label: '(b)',
            points: 17,
            topics: ['do.mipbnb', 'do.bnb'],
            prompt: 'Gjennomfør branch-and-bound. Oppgi optimal løsning og antall noder i treet (inkludert roten).',
            auto: {
              kind: 'numeric',
              fields: [
                { label: 'x_1^*', answer: 5 },
                { label: 'x_2^*', answer: 0 },
                { label: 'Z^*', answer: 40 },
                { label: r`\#\text{noder}`, answer: 7 },
              ],
            },
            rubric: [
              { text: 'Forgrening x₁ ≤ 3 / x₁ ≥ 4 med riktige LP-løsninger', pts: 5 },
              { text: 'Incumbent (3,3) med Z = 39 funnet og senere forbedret', pts: 4 },
              { text: 'Videre forgrening x₂ ≤ 1 / x₂ ≥ 2 (ikke tillatt), x₁ ≤ 4 / x₁ ≥ 5', pts: 5 },
              { text: 'Korrekt bruk av fathoming-testene og konklusjon', pts: 3 },
            ],
            solution: r`Rot: $(3.75, 2.25)$, 41.25. Forgren $x_1$:
- $x_1 \le 3$: $(3,3)$, $Z = 39$ – heltallig ⇒ incumbent (test 1).
- $x_1 \ge 4$: $(4, 1.8)$, $Z = 41$. Forgren $x_2$:
  - $x_2 \le 1$: $(4\tfrac49, 1)$, $Z = 40\tfrac59$. Forgren $x_1$: $x_1 \le 4$: $(4,1)$, $Z = 37 \le 39$ ⇒ test 2; $x_1 \ge 5$: $(5,0)$, $Z = 40 > 39$ ⇒ ny incumbent (test 1).
  - $x_2 \ge 2$: ikke tillatt (test 3).

Optimum $(5,0)$, $Z^* = 40$; 7 noder. Sjekk i B&B-laboratoriet (sett opp modellen der).`,
          },
        ],
      },
      {
        id: 'b3',
        title: 'Oppgave 3 (25 poeng) – Lokalisering med faste kostnader',
        intro: r`To mulige lagre $i = 1, 2$ med fast åpningskostnad 100 og 80 og kapasitet 50 og 40 enheter. Kunder $j = A, B$ trenger 30 og 25 enheter. Transportkostnad per enhet: lager 1 → A: 2, → B: 4; lager 2 → A: 3, → B: 1. Bruk $y_1, y_2$ (åpne) og $t_{1A}, t_{1B}, t_{2A}, t_{2B}$.`,
        parts: [
          {
            id: 'b3a',
            label: '(a)',
            points: 15,
            topics: ['do.fixed', 'do.models'],
            prompt: 'Formuler MIP-modellen som minimerer total kostnad.',
            auto: {
              kind: 'formulation',
              expected: {
                vars: ['y1', 'y2', 't1A', 't1B', 't2A', 't2B'],
                objective: { sense: 'min', expr: '100y1 + 80y2 + 2t1A + 4t1B + 3t2A + t2B' },
                constraints: ['t1A + t2A = 30', 't1B + t2B = 25', 't1A + t1B <= 50y1', 't2A + t2B <= 40y2'],
                alternatives: { 0: ['t1A + t2A >= 30'], 1: ['t1B + t2B >= 25'] },
                nonneg: ['t1A', 't1B', 't2A', 't2B'],
                binary: ['y1', 'y2'],
              },
            },
            rubric: [
              { text: 'Faste og variable kostnader i målfunksjonen', pts: 5 },
              { text: 'Etterspørsel', pts: 4 },
              { text: 'Kapasitet koblet til åpning (≤ kapasitet·y)', pts: 5 },
              { text: 'Domener', pts: 1 },
            ],
            solution: r`$$\begin{aligned}\min\ & 100y_1 + 80y_2 + 2t_{1A} + 4t_{1B} + 3t_{2A} + t_{2B}\\ \text{s.t.}\ & t_{1A} + t_{2A} = 30,\quad t_{1B} + t_{2B} = 25\\ & t_{1A} + t_{1B} \le 50y_1,\quad t_{2A} + t_{2B} \le 40y_2\\ & t \ge 0,\ y\in\{0,1\}\end{aligned}$$`,
          },
          {
            id: 'b3b',
            label: '(b)',
            points: 10,
            topics: ['do.fixed'],
            prompt: 'Finn optimal kostnad ved å sjekke de fire kombinasjonene av $(y_1, y_2)$.',
            auto: { kind: 'numeric', fields: [{ label: 'Z^*', answer: 265 }] },
            rubric: [
              { text: 'Ser at total etterspørsel er 55, så ett lager alene (50 eller 40) ikke holder', pts: 4 },
              { text: 'Med begge åpne: billigste rute per kunde (A fra 1, B fra 2) innenfor kapasitet', pts: 4 },
              { text: 'Konklusjon Z* = 180 + 60 + 25 = 265', pts: 2 },
            ],
            solution: r`Total etterspørsel er $30 + 25 = 55$. $(y_1,y_2) = (0,0)$, $(1,0)$ (kapasitet 50) og $(0,1)$ (kapasitet 40) er derfor **ikke tillatte**. Bare $(1,1)$ gjenstår: faste kostnader $180$; send A fra lager 1 (2 < 3) og B fra lager 2 (1 < 4), som er innenfor kapasitetene (30 ≤ 50, 25 ≤ 40). Transport $2\cdot30 + 1\cdot25 = 85$. **$Z^* = 265$**.`,
          },
        ],
      },
      {
        id: 'b4',
        title: 'Oppgave 4 (20 poeng) – Sant/usant',
        intro: '2.5 poeng per riktig svar.',
        parts: [
          {
            id: 'b4',
            label: '(a)–(h)',
            points: 20,
            topics: ['lo.forms', 'lo.dual', 'lo.cs', 'do.bnb', 'do.mipbnb', 'do.logic', 'lo.simplex'],
            prompt: 'Merk hver påstand T eller F.',
            auto: {
              kind: 'tf',
              statements: [
                { text: 'Et minimeringsproblem med ≥-restriksjoner er på forelesningens standardform.', answer: false, why: 'Standardform er max med ≤.' },
                { text: 'Hver primalrestriksjon svarer til én dualvariabel.', answer: true, why: 'Og hver primalvariabel til én dualrestriksjon.' },
                { text: r`Hvis $x_j^* > 0$, holder dualrestriksjon $j$ med likhet.`, answer: true, why: 'Komplementær slakkhet.' },
                { text: 'I BIP branch-and-bound fikseres forgreningsvariabelen til 0 eller 1.', answer: true, why: 'DO2.' },
                { text: 'En node hvis LP-relaksering har heltallig løsning, må alltid forgrenes videre.', answer: false, why: 'Fathomed ved test 1.' },
                { text: r`«Prosjekt 2 kan bare velges hvis prosjekt 1 velges» modelleres med $x_1 \le x_2$.`, answer: false, why: 'Riktig er x₂ ≤ x₁.' },
                { text: 'Simpleksmetoden beveger seg mellom nabohjørner.', answer: true, why: 'Adjacent CPF-løsninger langs kanter.' },
                { text: 'Et heltallsprogram er alltid lettere å løse enn LP-relakseringen.', answer: false, why: 'Vanligvis mye vanskeligere.' },
              ],
            },
            rubric: [{ text: '2.5 poeng per riktig', pts: 20 }],
            solution: r`(a) F (b) T (c) T (d) T (e) F (f) F (g) T (h) F.`,
          },
        ],
      },
    ],
  },
];
