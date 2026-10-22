import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { LPLab } from '../../labs/LPLab';

const r = String.raw;

export default function LO5() {
  return (
    <div className="space-y-10">
      <Concept id="method" title="Den grafiske metoden steg for steg">
        <Step kind="intuition">
          <T>{r`På eksamen skal du kunne løse to-variabel-LP «by hand». Metoden er mekanisk og gir full uttelling når hvert steg er synlig: tegn – skraver – finn hjørner – evaluer (eller skyv isokvanten) – konkluder.`}</T>
        </Step>
        <Step kind="definition" title="Oppskrift">
          <T>{r`1. **Akser:** $x_1$ vannrett, $x_2$ loddrett; velg skala etter skjæringspunktene.
2. **Restriksjonslinjer:** for $a_1x_1 + a_2x_2 = b$: skjæringer $(b/a_1, 0)$ og $(0, b/a_2)$. Test origo for å finne riktig side.
3. **Tillatt område:** skraver snittet (husk $x\ge0$).
4. **Hjørner:** løs $2\times2$-systemer for nabo-linjer; **sjekk at punktet oppfyller alle restriksjonene**.
5. **Optimum:** evaluer $Z$ i alle hjørner – eller tegn en isokvant og skyv den i retning $(c_1,c_2)$ (max) / $-(c_1,c_2)$ (min).
6. **Konklusjon:** oppgi $x^*$, $Z^*$, bindende restriksjoner – og spesialtilfelle hvis det oppstår.`}</T>
        </Step>
        <Step kind="example" title="Midtveis-øving Q1(b)">
          <T>{r`$\max 2x_1 + 5x_2$ s.t. $x_1 + 2x_2 \le 80$ (montering), $x_1 + 3x_2 \le 90$ (testing).
- Montering: $(80,0)$ og $(0,40)$. Testing: $(90,0)$ og $(0,30)$.
- Hjørner: $(0,0)$; $(80,0)$ [montering ∩ $x_2 = 0$; testing: $80 \le 90$ ✓]; $(0,30)$ [testing ∩ $x_1=0$; montering $60 \le 80$ ✓]; skjæringen: trekk ligningene fra hverandre: $x_2 = 10$, $x_1 = 60$.
- $Z$: 0, 160, 150, **170**. Optimum $(60,10)$, $Z^* = 170$ HKD per dag; begge restriksjoner bindende.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Velg andre eksempler i nedtrekksmenyen: alle spesialtilfellene fra forelesningen og øvingene finnes som presets.">
            <LPLab presetId="mid-q1" />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="lo-g2" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-g4" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-n3" />
        </Step>
        <Step kind="exam" title="Offisiell oppgave">
          <Ex id="lo-n2" />
        </Step>
      </Concept>

      <Concept id="special" title="Spesialtilfeller">
        <Step kind="definition">
          <T>{r`| Tilfelle | Grafisk | Ledelsesimplikasjon |
|---|---|---|
| **Inkonsistent** (infeasible) | tomt tillatt område | for mange restriksjoner |
| **Flere optima** (multiple optimal solutions) | objektivlinjen har samme stigning som en bindende restriksjon | uendelig mange like gode løsninger – valgfrihet |
| **Ubegrenset** (unbounded) | $Z$ kan økes uten grense | feil formulert: for få restriksjoner eller feil målfunksjon |

**Hvordan oppdage flere optima?** To nabohjørner gir samme $Z^*$, eller objektivlinjens stigning $-c_1/c_2$ er lik stigningen $-a_{i1}/a_{i2}$ til en bindende restriksjon. Da er **hele kanten** optimal: $\{\lambda x^A + (1-\lambda)x^B : 0 \le \lambda \le 1\}$.`}</T>
        </Step>
        <Step kind="geometry">
          <T>{r`**Ubegrenset område ≠ ubegrenset problem.** Et område kan strekke seg uendelig langt, men hvis forbedringsretningen peker «inn mot» den begrensede delen, finnes det likevel et optimum (LO Practice 3b). Problemet er ubegrenset bare hvis det finnes en retning $d$ som (i) holder seg i området, og (ii) forbedrer målet ($c^\top d > 0$ for max). Laboratoriet avgjør dette eksakt med simpleks – ikke ved å se på plottvinduet.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="lo-s1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-g3" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-s2" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-g7" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-s3" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Ved flere optima: oppgi **mengden** av løsninger (linjestykke eller stråle), ikke bare ett hjørne.
- «Ubegrenset» og «ikke tillatt» er forskjellige: ubegrenset krever at det finnes tillatte løsninger.
- Ved minimering skyves isokvanten **mot** origo (for positive $c_j$).
- Om ubegrensethet: ikke konkluder ut fra at «tegningen slutter».`}</T>
        </Step>
      </Concept>

      <Concept id="parametric" title="Parametrisk målfunksjon">
        <Step kind="intuition">
          <T>{r`Hvis en objektivkoeffisient er en parameter ($\theta$, $c_1$, $a$ …), roterer isokvanten når parameteren endres. Optimum hopper fra hjørne til hjørne nøyaktig når isokvanten blir **parallell** med en kant. Mellom overgangene er løsningen den samme, og $Z^*$ er lineær i parameteren.`}</T>
        </Step>
        <Step kind="example" title="LO Practice 6 (offisiell oppgave, kontrollert)">
          <T>{r`$\max Z = ax_1 - 8x_2$ s.t. $x_1 - 2x_2 \le b$, $x \ge 0$.

**(a) $b = 10$.** Langs kanten $x_1 - 2x_2 = 10$ er $x_2 = (x_1 - 10)/2$ og $Z = ax_1 - 4(x_1 - 10) = (a - 4)x_1 + 40$.
- $a < 0$: $x^* = (0,0)$, $Z^* = 0$.
- $a = 0$: $x_1^*\in[0,10]$, $x_2^* = 0$, $Z^* = 0$.
- $0 < a < 4$: $x^* = (10, 0)$, $Z^* = 10a$.
- $a = 4$: alle $(t, \tfrac{t-10}{2})$, $t \ge 10$ (en optimal **stråle**), $Z^* = 40$.
- $a > 4$: ubegrenset.

**(b) $a = 3$.** $b \ge 0$: $x^* = (b, 0)$, $Z^* = 3b$. $b \le 0$: $x^* = (0, -b/2)$, $Z^* = -8\cdot(-b/2) = 4b$.

**(c) $a = 3, b = 10$, koeffisient $p$ i stedet for 1:** $p < \tfrac34$ ubegrenset; $p = \tfrac34$: stråle med $Z^* = 40$; $p > \tfrac34$: $x^* = (10/p, 0)$, $Z^* = 30/p$.`}</T>
          <div className="mt-1 rounded-md border border-warn/40 bg-warn/5 px-3 py-2 text-xs">
            Merk: den offisielle løsningsteksten oppgir <em>Z* = 4a</em> i (a) tilfelle 3 og <em>Z* = 0</em> i (b) for b ≤ 0. Innsetting gir 10a og 4b (som stemmer med Z* = 40 for a = 4 og med Z* = 0 bare når b = 0). Plattformen viser de kontrollerte verdiene.
          </div>
        </Step>
        <Step kind="experiment" title="HW1 P3: endre c₂ = θ">
          <Lab caption="Sett c₂ (θ) til 0.3, 0.5, 0.75, 1 og 2. Ved θ = 0.5 og θ = 1 markeres en hel optimal kant.">
            <LPLab presetId="hw1-p3" compact showPresets={false} />
          </Lab>
        </Step>
        <Step kind="exam">
          <Ex id="lo-p1" />
        </Step>
        <Step kind="exam">
          <Ex id="lo-p2" />
        </Step>
        <Step kind="summary">
          <T>{r`- Grafisk metode: linjer → område → hjørner (sjekk!) → evaluer → konkluder.
- Spesialtilfeller: ikke tillatt, flere optima (oppgi hele mengden), ubegrenset.
- Ubegrenset område ⇏ ubegrenset problem.
- Parametrisk: overgang når $-c_1/c_2$ = stigning til en kant; mellom overgangene er $x^*$ fast og $Z^*$ lineær.`}</T>
        </Step>
      </Concept>
    </div>
  );
}
