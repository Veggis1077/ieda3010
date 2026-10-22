import { Rich } from '../components/Math';
import { PageHeader } from '../components/ui';

const r = String.raw;

function B({ title, children }: { title: string; children: string }) {
  return (
    <section className="aid-block mb-[2.2mm] break-inside-avoid">
      <h3 className="aid-h">{title}</h3>
      <Rich text={children} className="aid-body" />
    </section>
  );
}

export default function AidSheet() {
  return (
    <div>
      <div className="no-print">
        <PageHeader kicker="Midtveiseksamen" title="Formelark (ett dobbeltsidig A4-ark)">
          Konsentrert oppsummering av pensum fra forelesningsnotatene. Trykk «Skriv ut / lagre som PDF» og velg A4, skala 100 %, marger «standard» eller «ingen», og slå på «bakgrunnsgrafikk». Arket er laget for nøyaktig to sider.
        </PageHeader>
        <button className="btn-primary mb-6" onClick={() => window.print()}>
          Skriv ut / lagre som PDF
        </button>
      </div>
      <div className="aid-sheet">
        {/* ------------------------------ PAGE 1 ------------------------------ */}
        <div className="aid-page">
          <div className="aid-title">IEDA3010 Midterm aid sheet · side 1: Linear optimization</div>
          <div className="aid-cols">
            <B title="Modelling (formulation)">{r`Decision variables (what is decided, units!) · objective (max/min, function of variables) · constraints (resources ≤, requirements ≥, balance =) · parameters $c_j, a_{ij}, b_i$. Check: sensible? all data used? nonnegativity/integer? Methodology: problem → model → solve → analyze (sensitivity) → implement.`}</B>
            <B title="Standard form & assumptions">{r`$\max Z = \sum_j c_jx_j$ s.t. $\sum_j a_{ij}x_j \le b_i$, $x_j\ge 0$. Other forms: min, $\ge$, $=$, free variable. Assumptions: **proportionality** (no setup cost / economies of scale), **additivity** (no $x_1x_2$), **divisibility** (non-integer OK), **certainty** (known data ⇒ do sensitivity analysis).`}</B>
            <B title="Geometry">{r`Each inequality = half-space, equality = line (hyperplane). Feasible region = intersection (convex polygon). **Extreme point / CPF** = feasible intersection of $n$ boundaries. #CPF $\le \binom{n+m}{m}$. Isoquant: $c^\top x = k$. **Theorem:** finite optimum ⇒ some extreme point optimal. Binding (active) = equality at $x^*$, slack $= b_i - a_i x^* = 0$. Redundant: removing it doesn't change region. Degenerate vertex: > $n$ active constraints.`}</B>
            <B title="Graphical method">{r`1. Draw each constraint line via intercepts $(b/a_1,0)$, $(0,b/a_2)$; test origin for side. 2. Shade intersection. 3. List corners: solve pairs of binding lines, **check feasibility**. 4. Evaluate $Z$ at corners (or slide isoquant in direction $c$ for max, $-c$ for min). 5. Unbounded? check ray directions $d$ with $Ad \le 0$, $c^\top d > 0$.`}</B>
            <B title="Special cases">{r`| Case | Sign | Meaning |
|---|---|---|
| Infeasible | empty region | too many restrictions |
| Multiple optima | isoquant ∥ binding edge | ∞ many: $\lambda x + (1-\lambda) y$ |
| Unbounded | $Z\to\pm\infty$ | too few constraints / wrong objective |

Unbounded **region** ≠ unbounded **problem**.`}</B>
            <B title="Sensitivity: objective cⱼ">{r`Changing $c_j$ rotates isoquant. Corner stays optimal iff slope $-c_1/c_2$ lies between slopes $-a_{i1}/a_{i2}$ of the two binding lines. Equal slope ⇒ whole edge optimal. Example Lego: $-\tfrac43 \le -c_1/50 \le -\tfrac12 \Rightarrow 25 \le c_1 \le 66\tfrac23$. Inside range: $x^*$ fixed, $Z^* = c^\top x^*$ changes.`}</B>
            <B title="Sensitivity: RHS bᵢ, shadow price">{r`Changing $b_i$ shifts the line in parallel. **Shadow price** $y_i$ = $\Delta Z^*$ per unit of $b_i$, valid on the **sensitivity range** (same binding set). Procedure: solve binding $2\times2$ system with $b_i = t$: $x(t)$; range = $t$ with $x(t)$ feasible; $Z(t) = Z^* + y_i(t - b_i)$. Nonbinding ⇒ $y_i = 0$, range $[\text{LHS}, \infty)$ for ≤. Max problem: resource ↑ ⇒ $Z$ ↑ or =; requirement (≥) ↑ ⇒ $Z$ ↓ or =. Outside the range: re-solve (HW1 P4: $R=190$ ⇒ 4000, not 4600). $a_{ij}$ change rotates constraint: everything may change.`}</B>
            <B title="Duality (standard form)">{r`(P) $\max c^\top x$, $Ax\le b$, $x\ge0$ ⇔ (D) $\min b^\top y$, $A^\top y \ge c$, $y\ge0$. Row $i$ ↔ $y_i$; column $j$ ↔ dual constraint $j$; $b$ ↔ costs; $c$ ↔ RHS. Dual of dual = primal. *General (suppl.)*, max-primal: ≤ ⇒ $y\ge0$, ≥ ⇒ $y \le 0$, = ⇒ free; $x\ge0$ ⇒ dual ≥, free ⇒ dual =.`}</B>
            <B title="Duality theorems">{r`**Weak:** feasible $x,y$ ⇒ $c^\top x \le b^\top y$. **Strong:** optimal ⇒ $c^\top x^* = b^\top y^*$. Possible pairs: (opt,opt), (unbdd, infeas), (infeas, unbdd), (infeas, infeas). Wyndor: $x=(3,3)$: 24 ≤ $Z^*$=36 ≤ 52 from $y=(1,1,2)$.`}</B>
            <B title="Complementary slackness (m + n eqs)">{r`$\big(b_i - \sum_j a_{ij}x_j\big)y_i = 0\ \forall i$, $\big(c_j - \sum_i a_{ij}y_i\big)x_j = 0\ \forall j$. Use: $x_j^* > 0$ ⇒ dual constraint $j$ tight; primal slack > 0 ⇒ $y_i^* = 0$; $y_i^*>0$ ⇒ primal $i$ binding; dual surplus ⇒ $x_j^* = 0$. (Binding does **not** imply $y_i > 0$.) Wyndor: $x^*=(2,6)$ ⇒ $y_1=0$, $y_1+3y_3=3$, $2y_2+2y_3=5$ ⇒ $y^*=(0,\tfrac32,1)$.`}</B>
            <B title="Economic interpretation">{r`$y_i$ = fair unit price of resource $i$ (another company buying plant time); dual constraint: resources used by product $j$ worth ≥ profit $c_j$; minimize total payment. $y_i^*$ = marginal value = shadow price.`}</B>
            <B title="Two-variable dual trick (Midterm Q2 type)">{r`Primal with 2 constraints, many vars ⇒ dual has 2 vars: solve dual graphically (min, region unbounded upward), then CS: positive $y_i$ ⇒ primal $i$ binding; dual constraints with surplus ⇒ $x_j=0$; solve remaining system. Check $Z^* = W^*$.`}</B>
            <B title="Algorithms (LO4)">{r`Simplex (Dantzig 1947): walks adjacent CPFs (share $n-1$ boundaries); optimality test: no better neighbor ⇒ optimal; good in practice, bad in theory. Ellipsoid (Khachiyan 1979): first polynomial, bad in practice. Interior point (Karmarkar 1984): good in both.`}</B>
            <B title="Linearization & robust">{r`$\min \max_k(d_k^\top x + c_k)$ ⇒ $\min t$, $t \ge d_k^\top x + c_k$. $\min \sum c_j|x_j|$ ($c\ge0$) ⇒ $t_j \ge \pm x_j$. Ratio $\frac{f(x)}{g(x)} \le 1$ with $g > 0$ ⇒ $f \le g$ (sign of $g$ must be known). Robust box: $a^\top x \le b\ \forall |a_j - \bar a_j| \le \Delta a_j$ ⇔ $\bar a^\top x + \sum \Delta a_j|x_j| \le b$ ⇔ $(r-s)^\top \bar a + (r+s)^\top\Delta a \le b$, $x = r - s$, $r,s\ge0$. Budget $\Gamma$ (HW1 P5): dualize inner max ⇒ $\bar a^\top x + \Gamma p + \sum q_j \le b$, $p + q_j \ge \Delta a_j u_j$, $u_j \ge \pm x_j$, $p,q\ge0$.`}</B>
          </div>
        </div>
        {/* ------------------------------ PAGE 2 ------------------------------ */}
        <div className="aid-page">
          <div className="aid-title">IEDA3010 Midterm aid sheet · side 2: Discrete optimization + checklists</div>
          <div className="aid-cols">
            <B title="Taxonomy & relaxation">{r`IP: all integer. BIP: all binary. MIP: some integer/binary. LP relaxation: drop integrality; max: $Z_{IP}^* \le Z_{LP}^*$ (bound). Rounding LP optimum may be **infeasible** or **far from optimal**; IP optimum need not be a corner. Bounded pure IP ⇒ finitely many solutions (unbounded ⇒ maybe ∞). MIP geometry: only $x_1$ integer ⇒ parallel segments; all integer ⇒ lattice points.`}</B>
            <B title="Binary relationships">{r`| Requirement | Constraint |
|---|---|
| at most one of 3 | $x_1+x_2+x_3 \le 1$ |
| exactly one (either-or) | $x_1 + x_2 = 1$ |
| all or nothing | $x_1 = x_2 (= x_3)$ |
| 1 must occur if 2 occurs | $x_2 \le x_1$ |
| 1 and 2 not both | $x_1 + x_2 \le 1$ |
| 4 only if 1 **or** 2 | $y_4 \le y_1 + y_2$ |
| 4 only if 1 **and** 2 | $y_4 \le y_1,\ y_4 \le y_2$ |
| at least K of N events | $\sum x_i \ge K$ |
| at most K products | $\sum y_j \le K$ |
| cond. range | $0 \le y \le Mx$ |`}</B>
            <B title="Either-or constraints (big M)">{r`At least one of $f_1(x)\le b_1$, $f_2(x)\le b_2$: $f_1 \le b_1 + My$, $f_2 \le b_2 + M(1-y)$, $y\in\{0,1\}$. $M$ must make the relaxed constraint redundant: $M \ge \max f_1 - b_1$ over relevant region (pollution ex: $M\ge 30$). Feasible set = union (non-convex).`}</B>
            <B title="K out of N constraints">{r`$f_i(x) \le b_i + My_i$ ($i=1..N$), $\sum_i y_i = N-K$ (or $\le N-K$), $y_i$ binary ⇒ N extra binaries. DO Pr.1.2: three constraints, $y_1+y_2+y_3\le1$.`}</B>
            <B title="N possible values">{r`$f(x) \in \{d_1,\dots,d_N\}$: $f(x) = \sum_i d_iy_i$, $\sum y_i = 1$. Trucks: $2x_1+4x_2 = 100y_1+200y_2+300y_3$. $|x_1-x_2|\in\{0,3,6\}$: $x_1-x_2 = 0y_1+3y_2-3y_3+6y_4-6y_5$, $\sum y=1$.`}</B>
            <B title="Fixed charge">{r`$f(x) = c x - K$ if $x>0$, 0 if $x=0$ ⇒ $\max cx - Ky$, $x \le My$, $y$ binary (max makes $y=0$ when $x=0$). Capacity link: $x_i \le u_iy_i$ (production only if open, network design). Patent ex.: $\max 3x_1+5x_2-100y_1-200y_2$, $x_i - My_i \le 0$. Product $x_iy_i$ is **nonlinear** – use big M instead (textile formulation 3).`}</B>
            <B title="Binary expansion">{r`$0 \le x \le u$ integer, $2^N \le u < 2^{N+1}$: $x = \sum_{i=0}^N 2^iy_i$ ($N+1$ binaries; keep $x\le u$). $u=5$: 3 binaries; $u=10$: 4.`}</B>
            <B title="Classic models">{r`**Knapsack/capital budgeting:** $\max \sum v_jx_j$, $\sum a_jx_j \le b$, binary. **Assignment:** $\sum_j x_{ij}=1\ \forall i$, $\sum_i x_{ij} = 1\ \forall j$ ($70\times70$: 4900 vars, 140 eqs). **Set covering:** $\min\sum x_j$, $\sum_j a_{ij}x_j \ge 1\ \forall i$. **Facility:** mutually exclusive $x_3+x_4\le1$; contingent $x_3 \le x_1$. **Network design:** setup + variable + transport costs; supply $x_i = \sum_j t_{ij}$; demand $\sum_i t_{ij} = d_j$; $x_i \le u_iy_i$. **Production levels (Q3c):** $y_{jk}$ binary, $\sum_k y_{jk}\le 1$, $\sum_{j,k} k\,y_{jk} \le$ cap.`}</B>
            <B title="Branch & bound (BIP)">{r`Init $Z^* = -\infty$. **Branch:** most recently created unfathomed subproblem (tie: larger bound); fix next variable in natural order to 0 / 1. **Bound:** LP relaxation; round down if all $c_j$ integer ($16\tfrac12 \to 16$). **Fathom:** (1) LP solution integer ⇒ candidate incumbent; (2) bound $\le Z^*$; (3) LP infeasible. When incumbent improves, re-test open nodes with (2). **Stop** when no subproblems remain ⇒ incumbent optimal. Lecture ex.: root $(\tfrac56,1,0,1)$, 16 → optimum $(1,1,0,0)$, $Z^*=14$.`}</B>
            <B title="B&B for MIP (4 changes)">{r`1) branch only on integer-restricted vars (first fractional); 2) two ranges $x_j \le \lfloor v\rfloor$ / $x_j \ge \lceil v\rceil$; 3) no rounding of bound in general; 4) test 1: only integer-restricted vars integer. Lecture: root $(1\tfrac14,1\tfrac12,1\tfrac34,0)$, $14\tfrac14$ → optimum $(0,0,2,\tfrac12)$, $13\tfrac12$.`}</B>
            <B title="Exam checklist">{r`- Define variables with units; write "s.t."; include $\ge 0$ / integer / binary.
- Graph: label axes, lines, intercepts, region, corners with coordinates, isoquant & direction.
- Corner check: substitute into **all** constraints.
- Multiple optima: give the **set** (segment / $\lambda$-form) and $Z^*$.
- Range questions: compare slopes; include endpoints (edge optimal there).
- Dual: one $y$ per constraint; signs; transpose $A$; verify $Z^*=W^*$.
- B&B: draw tree, LP sol + bound per node, mark F(1)/F(2)/F(3), incumbent.`}</B>
            <B title="True/false facts">{r`LP can have multiple optima (T). Two optima ⇒ ∞ many (T). $x^*$ always changes when $b_i$ changes (F – nonbinding). CS has $m+n$ equations (T). Dual of dual = primal (T). MIP: all variables integer (F). K of N: add N binaries (T). IP has finitely many feasible solutions (F – unbounded). Primal unbounded ⇒ dual infeasible (T). Primal infeasible ⇒ dual unbounded (F – maybe infeasible).`}</B>
            <B title="Key numbers (course examples)">{r`Wyndor: $x^*=(2,6)$, $Z^*=36$, $y^*=(0,\tfrac32,1)$. Lego: $(6,2)$, 340, $y=(16,6)$, $b_2\in[15,40]$, $c_1\in[25,66\tfrac23]$. Midterm Q1: $(60,10)$, 170; $c_2\in[4,6]$. HW1 P4: $(40,20)$, 2800, $y=(20,10)$, $R\in[40,160]$. Vincent IP: $(0,5)$, 750 (LP 825).`}</B>
          </div>
        </div>
      </div>
    </div>
  );
}
