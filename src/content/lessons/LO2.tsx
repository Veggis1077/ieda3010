import { Concept, Step, T, Ex } from '../../components/LessonBlocks';

const r = String.raw;

export default function LO2() {
  return (
    <div className="space-y-10">
      <Concept id="transport" title="Transportproblemet (Microsoft Xbox)">
        <Step kind="intuition">
          <T>{r`Varer skal fra **fabrikker** (tilbud) til **utsalg** (etterspørsel). Hver rute har en enhetskostnad. Spørsmålet er *hvor mye* som sendes på hver rute. Variablene er **dobbelt indeksert**: $x_{ij}$ = antall enheter fra fabrikk $i$ til utsalg $j$.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Med tilbud $s_i$, etterspørsel $d_j$ og kostnad $c_{ij}$:
$$\min \sum_{i=1}^{3}\sum_{j=A}^{D} c_{ij}x_{ij}\quad \text{s.t.}\quad \sum_{i=1}^3 x_{ij} = d_j\ \ (j = A,\dots,D),\qquad \sum_{j=A}^D x_{ij} \le s_i\ \ (i = 1,2,3),\qquad x_{ij}\ge0.$$
Data: kapasitet 1700, 2000, 1700; ordre 1700, 1000, 1500, 1200; kostnader i tabellen i oppgaven nedenfor.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-f5" />
        </Step>
        <Step kind="exam" title="HW1 Problem 2 – transport med ekstra betingelser">
          <Ex id="lo-f8" />
        </Step>
      </Concept>

      <Concept id="radiation" title="Strålebehandling (Mary)">
        <Step kind="intuition">
          <T>{r`To stråler med intensitet (dose) $x_1, x_2$ (kilorad). Strålingen skader både frisk og syk vev. Vi vil minimere dosen til **friskt vev**, men kritisk vev har en øvre grense, svulsten skal få nøyaktig 6 og senteret av svulsten minst 6. Alle tre relasjonstypene opptrer.`}</T>
        </Step>
        <Step kind="example">
          <T>{r`$$\begin{aligned}\min\ & 0.4x_1 + 0.5x_2\\ \text{s.t.}\ & 0.3x_1 + 0.1x_2 \le 2.7 \quad\text{(kritisk vev)}\\ & 0.5x_1 + 0.5x_2 = 6 \quad\text{(svulst)}\\ & 0.6x_1 + 0.4x_2 \ge 6 \quad\text{(senter)}\\ & x_1, x_2 \ge 0\end{aligned}$$
Det tillatte området er et **linjestykke** (pga. likheten). Optimum: $(7.5,\ 4.5)$ med $Z = 5.25$. Se preset «Strålebehandling» i LP-laboratoriet.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-f6" />
        </Step>
      </Concept>

      <Concept id="pollution" title="Luftforurensning (Nori & Leets Co.)">
        <Step kind="example">
          <T>{r`To forurensningskilder (masovner og martinovner), tre metoder (høyere skorsteiner, filtre, bedre brensel). Hver metode kan brukes med en **andel** av sin teknologiske grense; effekt og kostnad skaleres proporsjonalt.

**Variabler:** $x_1,\dots,x_6$ = andel av maks bruk (skorstein: $x_1$ masovn, $x_2$ martinovn; filtre: $x_3, x_4$; brensel: $x_5, x_6$).

**Mål:** $\min\ 8x_1 + 10x_2 + 7x_3 + 6x_4 + 11x_5 + 9x_6$ (mill. \$/år).

**Utslippsreduksjon** (millioner pund/år, fra lysbilde 32):
$$\begin{aligned} 12x_1 + 9x_2 + 25x_3 + 20x_4 + 17x_5 + 13x_6 &\ge 60 \quad\text{(partikler)}\\ 35x_1 + 42x_2 + 18x_3 + 31x_4 + 56x_5 + 49x_6 &\ge 150 \quad\text{(svoveloksider)}\\ 37x_1 + 53x_2 + 28x_3 + 24x_4 + 29x_5 + 20x_6 &\ge 125 \quad\text{(hydrokarboner)}\end{aligned}$$
**Teknologisk grense:** $x_j \le 1$. **Ikke-negativitet:** $x_j \ge 0$.`}</T>
          <div className="text-xs text-mute">
            Kravene 60/150/125 står ikke i notatversjonen av lysbildene (tomme felt); de er hentet fra læreboka (Hillier &amp; Lieberman), som eksempelet er basert på.
          </div>
        </Step>
        <Step kind="exam" title="Samme struktur: HW1 Problem 1">
          <Ex id="lo-f3" />
        </Step>
      </Concept>

      <Concept id="scheduling" title="Personalplanlegging (Union Airways)">
        <Step kind="intuition">
          <T>{r`Hver agent jobber ett 8-timers skift. En tidsperiode dekkes av alle skift som overlapper den. Variablene er **antall agenter per skift**, og hver tidsperiode gir en $\ge$-restriksjon. Metode: lag en tabell (periode × skift) med kryss, og les av restriksjonene radvis.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-f7" />
        </Step>
      </Concept>

      <Concept id="network" title="Distribusjonsnettverk (Distribution Unlimited)">
        <Step kind="definition" title="Netto strøm (flow conservation)">
          <T>{r`For hver node: $\text{(strøm ut)} - \text{(strøm inn)} = \text{netto forsyning}$. Fabrikker har positiv forsyning (50, 40), distribusjonssenteret 0 (omlastning), lagrene negativ (−30, −60). Kanter med kapasitet gir øvre grenser ($x_{F1F2} \le 10$, $x_{DC,W2} \le 80$).`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="lo-f9" />
        </Step>
        <Step kind="example" title="Flere offisielle formuleringsoppgaver">
          <Ex id="lo-f4" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- I transportproblemer: blande $\le$ (kapasitet) og $=$ (etterspørsel) feil vei.
- Netto strøm: fortegnskonvensjonen må være konsistent for **alle** noder.
- Prosentkrav («høyst 30 % av kaloriene fra fett») er lineære: skriv $\text{fett} \le 0.3\cdot\text{totalt}$ – ikke en brøk.
- Andelsvariabler (fraksjoner) trenger øvre grense 1.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Transport: $\min\sum c_{ij}x_{ij}$, tilbud $\le$, etterspørsel $=$.
- Strålebehandling: blanding av $\le$, $=$, $\ge$.
- Forurensning: andelsvariabler $0 \le x_j \le 1$, krav $\ge$.
- Personal: dekningsrestriksjoner per periode.
- Nettverk: netto strøm per node + kapasitet per kant.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
