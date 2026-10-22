import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LABS, CHAPTERS } from '../content/course';
import { PageHeader } from '../components/ui';

const HELP: Record<string, string> = {
  lp: 'Klassifiseringen (entydig, flere optima, ubegrenset, ikke tillatt) beregnes eksakt med en to-fase simpleksløser – ikke ut fra plottvinduet. Hjørner med mer enn to aktive restriksjoner markeres som degenererte.',
  sensitivity: 'Skyggepris og sensitivitetsområde beregnes ved å løse LP-et på nytt for mange verdier av bᵢ / cⱼ. Båndet viser hvor den opprinnelige skyggeprisen (eller løsningen) gjelder.',
  duality: 'Dualen konstrueres automatisk fra primalen (standardform: max/≤ → min/≥). Endre koeffisientene og se dualen oppdateres.',
  ip: 'Heltallsoptimum finnes ved fullstendig oppramsing av gitterpunktene i det (begrensede) området.',
  bnb: 'Algoritmen følger forelesningen: LP-relaksering som grense, tre fathoming-tester og nodevalg «sist opprettet».',
  binary: 'Test logiske formuleringer mot sannhetstabeller og se hvordan big M slår restriksjoner av og på.',
  bip: 'Slå beslutninger av og på og se hvilke restriksjoner som brytes. Optimum finnes ved å telle opp alle 2ⁿ kombinasjoner.',
  lego: 'Lego-spillet fra første LO-forelesning.',
  pricing: 'Markedssegmenteringseksempelet fra introduksjonsforelesningen.',
};

export default function LabPage() {
  const { labId } = useParams();
  const lab = LABS.find((l) => l.id === labId);
  if (!lab) return <p>Fant ikke laboratoriet.</p>;
  const ch = CHAPTERS.find((c) => c.id === lab.chapter)!;
  const Comp = lab.component;
  return (
    <div>
      <PageHeader
        kicker={
          <Link to={`/kapittel/${ch.id}`} className="hover:text-ink">
            {ch.title} · Laboratorium
          </Link>
        }
        title={lab.title}
      >
        {lab.summary} {HELP[lab.id]}
      </PageHeader>
      <Suspense fallback={<p className="text-sm text-mute">Laster …</p>}>
        <Comp />
      </Suspense>
    </div>
  );
}
