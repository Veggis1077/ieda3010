import { Concept, Step, T, Ex, Lab } from '../../components/LessonBlocks';
import { SegmentationLab } from '../../labs/IntroLabs';

const r = String.raw;

const STEPS = [
  ['1. Problem description', 'Finn riktige mål fra ledelsen for hele organisasjonen; samle data.'],
  ['2. Model construction', 'Identifiser beslutningsvariabler, målfunksjon, restriksjoner og parametere.'],
  ['3. Model solution', 'Modeller er tilnærminger; lineær/heltall/ikke-lineær, deterministisk/stokastisk – ulike modeller krever ulike algoritmer.'],
  ['4. Analyzing results', 'Tolk løsningen (managerial insights) og gjør sensitivitetsanalyse.'],
  ['5. Implementation', 'Prosedyrer for å ta systemet i bruk; ledelsen lærer opp personell.'],
];

export default function Intro2() {
  return (
    <div className="space-y-10">
      <Concept id="method" title="Metodikken: fra virkelighet til beslutning">
        <Step kind="intuition">
          <T>{r`Lederen står i en **virkelig situasjon**. Vi **abstraherer** den til en symbolsk modell, **analyserer** modellen og får resultater, **tolker** resultatene tilbake til virkeligheten – og kombinerer dem med **ledelsens skjønn og intuisjon** før beslutningen tas (lysbilde 16). Optimering erstatter ikke dømmekraft; den informerer den.`}</T>
        </Step>
        <Step kind="definition" title="De fem stegene (lysbilde 17–22)">
          <ol className="space-y-1.5">
            {STEPS.map(([a, b]) => (
              <li key={a} className="rounded-md border border-line px-3 py-2 text-sm">
                <span className="font-semibold">{a}</span> — <span className="text-mute">{b}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-mute">Syklusen går fra «real world» via stegene og tilbake til den virkelige verden.</p>
        </Step>
        <Step kind="guided">
          <Ex id="in-3" />
        </Step>
        <Step kind="exam">
          <Ex id="in-4" />
        </Step>
      </Concept>

      <Concept id="components" title="Modellkomponenter">
        <Step kind="definition">
          <T>{r`- **Beslutningsvariabler** (decision variables): de kontrollerbare størrelsene, f.eks. hvor mange agenter som ansettes, hvor mye tid som brukes på en oppgave. De skal **fullstendig beskrive** beslutningene.
- **Målfunksjon** (objective function): måler ytelse som en funksjon av beslutningsvariablene – maksimer profitt eller minimer kostnad.
- **Restriksjoner** (constraints): begrenser beslutningene – minimum akseptabel profitt, maksimalt tilgjengelige ressurser.
- **Parametere** (parameters): kjente konstanter i modellen (priser, kapasiteter, forbruk per enhet).
- En beslutning er **tillatt** (feasible) hvis den oppfyller alle restriksjonene, og **optimal** hvis den er tillatt og ingen annen tillatt beslutning har bedre målfunksjonsverdi.`}</T>
        </Step>
        <Step kind="example" title="Lager, prising, portefølje">
          <T>{r`- **Lagerstyring** (Example 1): etterspørselen er tilfeldig. Høyt lager ⇒ lagerkostnad og svinn; lavt lager ⇒ tapte kunder og omdømme. Beslutning: lagernivå. Modellvalg avhenger av antakelser: én periode? ett produkt? ferskvare?
- **Prising** (Example 2): differensiert prising (segmentering) og dynamisk prising (fly, hotell).
- **Portefølje** (Example 3): fordel kapital mellom aktiva for å balansere risiko og avkastning (Markowitz, Nobelpris 1990).`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="in-5" />
        </Step>
        <Step kind="exam">
          <Ex id="in-9" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- Å gjøre en **parameter** til en variabel (f.eks. «prisen» når prisen er gitt).
- Glemme ikke-negativitet eller at variablene skal være heltall/binære.
- En målfunksjon som ikke er uttrykt i beslutningsvariablene (f.eks. «maksimer kundetilfredshet» uten modell).`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="in-8" />
        </Step>
        <Step kind="exam">
          <Ex id="in-10" />
        </Step>
      </Concept>

      <Concept id="pricing" title="Eksempel: markedssegmentering (prisdiskriminering)">
        <Step kind="example">
          <T>{r`Fem kunder (A–E) med betalingsvilje \$5000 … \$1000 for HK–Singapore, 4 ledige seter. Med én pris er beste inntekt \$9000 (pris \$3000). Kan vi dele markedet mellom B og C og sette ulike priser, får vi \$8000 (høy, pris \$4000) + \$4000 (lav, pris \$2000) = **\$12 000**. Prisdiskriminering henter ut mer av betalingsviljen – et klassisk preskriptivt spørsmål.`}</T>
        </Step>
        <Step kind="experiment">
          <Lab caption="Endre pris, antall seter og segmentgrense. Plattformen viser også beste mulige inntekt ved fullstendig oppramsing.">
            <SegmentationLab />
          </Lab>
        </Step>
        <Step kind="guided">
          <Ex id="in-6" />
        </Step>
        <Step kind="exam">
          <Ex id="in-7" />
        </Step>
        <Step kind="summary">
          <T>{r`- Fem steg: problembeskrivelse → modellbygging → løsning → analyse (tolkning + sensitivitet) → implementering.
- Modell = beslutningsvariabler + målfunksjon + restriksjoner (+ parametere).
- Modeller er tilnærminger: behold de viktigste faktorene.
- Prisdiskriminering: segmentering øker inntekt (9000 → 12 000 i eksempelet).`}</T>
        </Step>
      </Concept>
    </div>
  );
}
