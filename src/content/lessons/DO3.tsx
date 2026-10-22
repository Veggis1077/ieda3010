import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { BinaryLab } from '../../labs/BinaryLab';

const r = String.raw;

export default function DO3() {
  return (
    <div className="space-y-10">
      <Concept id="eitheror" title="Enten–eller-restriksjoner">
        <Step kind="intuition">
          <T>{r`I et LP må **alle** restriksjoner holde. Men noen ganger er kravet at **minst én** av to restriksjoner holder. Den tillatte mengden blir da en **union** av to polyedre – ikke konveks – og kan ikke skrives med lineære restriksjoner alene. Løsning: en binær variabel som «slår av» én restriksjon ved å legge en stor konstant $M$ til høyresiden.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Eksempel (DO1 s. 17–19): en kjemisk fabrikk vil begrense **minst én** av to forurensninger:
$$3x_1 + 2x_2 \le 18 \quad\text{eller}\quad x_1 + 4x_2 \le 16.$$
Med binær $y$ og stor $M$:
$$3x_1 + 2x_2 \le 18 + My,\qquad x_1 + 4x_2 \le 16 + M(1-y),\qquad y\in\{0,1\}.$$
$y = 0$: første håndheves, andre blir redundant. $y = 1$: omvendt. «Adding $M$ effectively makes the constraint redundant.»`}</T>
        </Step>
        <Step kind="geometry">
          <Lab caption="Slå y av og på, og senk M for å se hva som skjer når M er for liten. Oransje stiplet: den ønskede (ikke-konvekse) unionen.">
            <BinaryLab initial="bigm" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-b1" />
        </Step>
        <Step kind="exam">
          <Ex id="do-b4" />
        </Step>
      </Concept>

      <Concept id="kofn" title="K av N restriksjoner må holde">
        <Step kind="definition">
          <T>{r`Av $N$ mulige restriksjoner $f_i(x) \le d_i$ skal minst $K$ holde ($K < N$). Innfør $y_i$ binær ($y_i = 1$ ⇒ restriksjon $i$ slås av):
$$f_i(x) \le d_i + My_i\quad (i = 1,\dots,N),\qquad \sum_{i=1}^N y_i = N - K,\qquad y_i\in\{0,1\}.$$
Eksempel (DO1 s. 20–22): tre forurensninger, minst to skal begrenses:
$3x_1 + 2x_2 \le 18 + My_1$, $x_1 + 4x_2 \le 16 + My_2$, $4x_1 + 3x_2 \le 24 + My_3$, $y_1 + y_2 + y_3 = 1$.

Varianten $\sum y_i \le N - K$ (som i DO Practice 1.2) er også korrekt: da er det lov å håndheve flere enn $K$.`}</T>
          <div className="text-xs text-mute">
            Merk: lysbilde 22 skriver 5x₁ + 3x₂ ≤ 24 + My₃, mens tabellen på lysbilde 20–21 gir 4x₁ + 3x₂ ≤ 24. Plattformen bruker tabellverdien.
          </div>
        </Step>
        <Step kind="exam">
          <Ex id="do-b2" />
        </Step>
      </Concept>

      <Concept id="nvalues" title="Funksjoner med N mulige verdier">
        <Step kind="definition">
          <T>{r`En funksjon skal ta én av $N$ gitte verdier: $f(x) \in \{d_1, \dots, d_N\}$:
$$f(x) = \sum_{i=1}^N d_iy_i,\qquad \sum_{i=1}^N y_i = 1,\qquad y_i \in \{0,1\}.$$
Eksempel (DO1 s. 24–25): produktene skal fylle nøyaktig 1, 2 eller 3 lastebiler (100 enheter plass hver; produkt 1 tar 2, produkt 2 tar 4): $2x_1 + 4x_2 = 100y_1 + 200y_2 + 300y_3$, $y_1 + y_2 + y_3 = 1$.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="do-b3" />
        </Step>
      </Concept>

      <Concept id="fixed" title="Fast kostnad (fixed charge)">
        <Step kind="intuition">
          <T>{r`En engangsavgift (patent, oppstart) påløper bare **hvis** vi produserer. Profittfunksjonen har et hopp i 0 og bryter proporsjonalitet. Binærvariabelen $y$ svarer på «produserer vi i det hele tatt?», og $x \le My$ tvinger $y = 1$ når $x > 0$.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`Eksempel (DO1 s. 26–30): enhetsprofitt 3 og 5, patentavgift 100 og 200.
$$f_1(x_1) = \begin{cases}3x_1 - 100 & x_1 > 0\\ 0 & x_1 = 0\end{cases}\qquad f_2(x_2) = \begin{cases}5x_2 - 200 & x_2 > 0\\ 0 & x_2 = 0\end{cases}$$
$$\begin{aligned}\max\ & 3x_1 + 5x_2 - 100y_1 - 200y_2\\ \text{s.t.}\ & 3x_1 + 2x_2 \le 1800,\quad x_1 + 4x_2 \le 1600\\ & x_1 - My_1 \le 0,\quad x_2 - My_2 \le 0\\ & x_1, x_2 \ge 0,\ y_1, y_2 \in\{0,1\}\end{aligned}$$
**Hva om $x_i = 0$?** Da kan $y_i$ formelt være 0 eller 1, men maksimeringen gjør det alltid bedre å velge $y_i = 0$ (sparer avgiften).`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Prøv de fire kombinasjonene av (y₁, y₂).">
            <BinaryLab initial="fixed" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="do-f1" />
        </Step>
      </Concept>

      <Concept id="binexp" title="Binær representasjon av heltallsvariabler">
        <Step kind="definition">
          <T>{r`Har modellen mest binære og noen få heltallsvariabler, kan vi erstatte hver heltallsvariabel med binære for å bruke effektive BIP-algoritmer:
$$0 \le x \le u,\quad 2^N \le u < 2^{N+1} \ \Longrightarrow\ x = \sum_{i=0}^{N} 2^iy_i,\ y_i \in\{0,1\}.$$
Eksempel: $x_1 \le 5$ ⇒ $x_1 = y_0 + 2y_1 + 4y_2$ (pluss fortsatt $x_1 \le 5$); $2x_1 + 3x_2 \le 30$ gir $x_2 \le 10$ ⇒ $x_2 = y_3 + 2y_4 + 4y_5 + 8y_6$.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="do-f2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- For liten $M$ kutter bort lovlige løsninger; for stor $M$ gir svak LP-relaksering (og numeriske problemer). Velg $M$ = største mulige verdi av venstresiden minus høyresiden.
- Enten–eller: én restriksjon får $My$, den andre $M(1-y)$ – ikke begge $My$.
- Glem ikke $\sum y_i = 1$ ved «N mulige verdier».
- Fast kostnad: trekk $Ky$ fra i målet **og** koble $x \le My$.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Enten–eller: $f_1 \le b_1 + My$, $f_2 \le b_2 + M(1-y)$.
- K av N: $f_i \le b_i + My_i$, $\sum y_i = N-K$.
- N verdier: $f = \sum d_iy_i$, $\sum y_i = 1$.
- Fast kostnad: $\max \dots - Ky$, $x \le My$.
- Binær ekspansjon: $x = \sum_{i=0}^N 2^iy_i$.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
