import { Concept, Step, T, Ex } from '../../components/LessonBlocks';

const r = String.raw;

const LEVELS = [
  { level: 'Preskriptiv', items: ['Stochastic optimization – «How can we achieve the best outcome including the effects of variability?»', 'Optimization – «How can we achieve the best outcome?»'], cls: 'border-opt/60 bg-opt/5' },
  { level: 'Prediktiv', items: ['Predictive modeling – «What will happen next if …?»', 'Forecasting – «What if these trends continue?»', 'Simulation – «What could happen …?»'], cls: 'border-obj/60 bg-obj/5' },
  { level: 'Deskriptiv', items: ['Alerts – «What actions are needed?»', 'Query/drill down – «What exactly is the problem?»', 'Ad hoc reporting – «How many, how often, where?»', 'Standard reporting – «What happened?»'], cls: 'border-feas/60 bg-feas/5' },
];

export default function Intro1() {
  return (
    <div className="space-y-10">
      <Concept id="maturity" title="Modenhetskurven for analytics">
        <Step kind="intuition">
          <T>{r`Tenk deg en butikkjede. Først vil ledelsen vite **hva som skjedde** forrige måned (salgstall). Deretter vil de vite **hva som kommer til å skje** (prognoser). Til slutt vil de vite **hva de bør gjøre** – hvor mye de skal bestille, hvilken pris de skal sette. Jo høyere opp, jo mer kompleks analyse, og jo større konkurransefortrinn.`}</T>
        </Step>
        <Step kind="definition">
          <T>{r`**Data analytics** er vitenskapen om å analysere rådata for å trekke konklusjoner (Investopedia). **Business analytics** er ferdigheter, teknologier og praksiser for iterativ utforsking av tidligere forretningsresultater for å gi innsikt og drive planlegging (Wikipedia). Modenhetskurven (*the analytics maturity curve*, Davenport & Harris 2007) deler analyse i tre nivåer:`}</T>
          <div className="mt-2 space-y-2">
            {LEVELS.map((l) => (
              <div key={l.level} className={`rounded-md border-l-4 px-3 py-2 ${l.cls}`}>
                <div className="text-sm font-semibold">{l.level}</div>
                <ul className="ml-4 list-disc text-sm text-mute">
                  {l.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-mute">Kurvens akser: «degree of complexity» (vannrett) mot «competitive advantage» (loddrett).</p>
        </Step>
        <Step kind="example" title="Target-eksempelet fra forelesningen">
          <T>{r`En far klaget på at datteren fikk kuponger for babyklær. Butikkens **prediktive** modell hadde fra handlemønsteret forutsagt at hun var gravid – før faren visste det. Eksempelet viser kraften (og de etiske utfordringene) i prediktiv analyse. Det **preskriptive** steget ville vært å bestemme *hvilke* tilbud som skal sendes til *hvem* for å maksimere forventet salg.`}</T>
        </Step>
        <Step kind="guided">
          <Ex id="in-1" />
        </Step>
        <Step kind="exam">
          <Ex id="in-2" />
        </Step>
        <Step kind="pitfalls">
          <T>{r`- «Prediktiv» betyr ikke «anbefalende». En prognose sier hva som vil skje, ikke hva du bør gjøre.
- Preskriptiv analyse **bygger på** deskriptiv og prediktiv analyse – den erstatter dem ikke.
- Optimering er kjernen i preskriptiv analyse, men stokastisk optimering (usikkerhet) er det øverste nivået.`}</T>
        </Step>
      </Concept>

      <Concept id="prescriptive" title="Preskriptiv analyse">
        <Step kind="definition">
          <T>{r`**Preskriptiv analyse** (prescriptive analytics) anvender matematikk og beregningsvitenskap og foreslår beslutninger som utnytter resultatene fra deskriptiv og prediktiv analyse (Wikipedia). Den søker å gi **optimale anbefalinger** i en beslutningsprosess – og bestemmer hvordan forretningsprosesser bør endres (Techopedia). Fellesnevner: *«search for optimality»*.`}</T>
        </Step>
        <Step kind="intuition" title="Ferdigheter">
          <T>{r`Faget krever **tekniske ferdigheter** (matematikk, sannsynlighet og statistikk, økonomi og finans, informatikk) og **kommunikasjonsferdigheter**: OR-team arbeider rådgivende og må gi forståelige konklusjoner til ledere uten teknisk bakgrunn. Kurset dekker operasjonsanalyse (lineær, diskret, ikke-lineær optimering, nettverk, dynamisk programmering, beslutningsanalyse) og programmering i Python.`}</T>
        </Step>
        <Step kind="summary">
          <T>{r`- Deskriptiv: hva skjedde? Prediktiv: hva vil skje? Preskriptiv: hva bør vi gjøre?
- Preskriptiv analyse = optimering (+ usikkerhet) for å finne beste beslutning.
- Midtveiseksamen dekker: introduksjon, lineær optimering, diskret optimering.`}</T>
        </Step>
      </Concept>

      <Concept id="history" title="Historie og anvendelser">
        <Step kind="text">
          <T>{r`**Andre verdenskrig:** OR oppsto for å fordele knappe ressurser til militære operasjoner (radar, bombing, ubåtjakt, logistikk). **Etter krigen** ble store organisasjoner komplekse, med problemer av samme natur. To grunner til rask vekst: (1) dyktige forskere utviklet lineær programmering, dynamisk programmering, køteori og lagerteori; (2) **datarevolusjonen** gjorde store beregninger mulige.

Anvendelser (lysbilde 15): forsyningskjeder (Dell, Walmart, Amazon), kundevalg og lojalitet (Harrah's, Capital One), **prising** (Progressive, Marriott), human capital (New England Patriots, Oakland A's), kvalitet (Honda, Intel), finansielle resultater, FoU (Novartis). Forelesningen viser også lagerstyring, dynamisk prising, porteføljevalg (Markowitz), innholdsanbefaling (Amazon, TikTok), matlevering for eldre (HKCS) og store språkmodeller.`}</T>
        </Step>
        <Step kind="exam">
          <Ex id="in-11" />
        </Step>
      </Concept>
    </div>
  );
}
