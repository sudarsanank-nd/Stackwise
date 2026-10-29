import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLLISIONS, ALL_CARDS, SCENARIOS } from '../services/content';
import { IdeaCollisionView } from '../components/cards/IdeaCollisionView';
import { Button, LinkButton, PageHeader, Panel, Section, EmptyState } from '../components/common/ui';
import { LogoMark, Wordmark } from '../components/brand/Logo';
import { CoverArt } from '../components/cards/CoverArt';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { TOPICS } from '../data/topics';

const WELCOME_CARDS = ['pm-one-on-ones', 'agent-compounding-errors', 'bf-loss-aversion-panic'];

export function WelcomePage() {
  const cards = WELCOME_CARDS.map((id) => ALL_CARDS.find((c) => c.id === id)).filter((c) => !!c);
  const fan = ['left-0 top-8 -rotate-[8deg]', 'right-0 top-6 rotate-[7deg]', 'left-1/2 top-12 -translate-x-1/2'];
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-6 pt-6 pb-8">
      <div className="flex items-center gap-1.5 text-[22px]">
        <LogoMark size={32} /> <Wordmark />
      </div>
      <div aria-hidden className="relative mx-auto mt-6 h-[300px] w-full max-w-[360px]">
        {cards.map((c, i) => (
          <div key={c.id} className={`absolute w-[180px] overflow-hidden rounded-3xl bg-surface shadow-[0_20px_44px_rgb(20_33_61/0.2)] ${fan[i]}`}>
            <CoverArt card={c} height={150} />
            <p className="px-3.5 pt-2.5 pb-4 font-display text-[17px] leading-[1.1] font-extrabold tracking-[-0.02em]">{c.title}</p>
          </div>
        ))}
      </div>
      <h1 className="mt-6 font-display text-[38px] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-[46px]">
        Scroll like social. Finish like a good book.
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
        One useful idea at a time, told as a one-minute story with an example, a question worth sitting with and one small thing to try. A clear stopping point every day.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2 text-[13px] font-semibold">
        {[`${ALL_CARDS.length} ideas · ${TOPICS.length} topics`, `${SCENARIOS.length} decision drills`, 'Works offline', 'Data stays on this device'].map((t) => (
          <li key={t} className="rounded-full border border-line bg-surface px-3 py-2">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <LinkButton to="/onboarding" variant="primary" className="min-h-14 w-full !rounded-[18px] !bg-navy text-[17px] !text-white dark:!bg-brand dark:!text-brand-ink">
          Set up my feed — about 2 minutes
        </LinkButton>
        <p className="mt-4 text-center text-[13px] text-ink-2">
          Educational content only. <Link to="/about" className="underline">About & disclaimer</Link>
        </p>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  return (
    <div className="min-h-dvh bg-bg px-4 py-10">
      <OnboardingWizard />
    </div>
  );
}

export function CollidePage() {
  const [i, setI] = useState(0);
  if (COLLISIONS.length === 0) return <EmptyState title="No collisions available" />;
  const c = COLLISIONS[i % COLLISIONS.length];
  return (
    <div>
      <PageHeader title="Idea collisions" subtitle="Two ideas from different worlds. Find the link before you see ours." back="/profile" />
      <IdeaCollisionView key={c.id} collision={c} />
      <div className="mt-4 flex justify-between text-[14px] text-ink-2">
        <span>
          {(i % COLLISIONS.length) + 1} of {COLLISIONS.length}
        </span>
        <Button variant="ghost" onClick={() => setI((x) => x + 1)}>
          Next collision →
        </Button>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div>
      <PageHeader title="About Stackwise" back="/profile" />
      <Section title="What this is">
        <Panel>
          <p className="text-[16px] leading-relaxed">
            Stackwise is a prototype micro-learning feed. Cards are original summaries written to teach one idea each. Where a card relies on outside research, the source is listed; cards still awaiting source verification are labelled. Illustrative examples are marked as such, and contested findings carry a note.
          </p>
        </Panel>
      </Section>
      <Section title="Educational disclaimer">
        <Panel className="border-[color-mix(in_srgb,var(--warn)_50%,transparent)]">
          <p className="text-[16px] leading-relaxed">
            Investing and personal-finance content is for general education only. It is <strong>not</strong> financial, investment, tax or legal advice, does not consider your circumstances, and does not recommend any security, fund or strategy. Markets carry risk, past performance does not predict future results, and nothing here promises or predicts returns. Consult a SEBI-registered investment adviser or other qualified professional before making financial decisions.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed">
            Psychology and management content describes general research and practice. It is not medical, psychological or HR advice.
          </p>
        </Panel>
      </Section>
      <Section title="Privacy">
        <Panel>
          <p className="text-[16px] leading-relaxed">
            Everything — your profile, saved cards, reading history and reflections — is stored in this browser only. Nothing is sent to a server. Stackwise never infers sensitive personal information; personalisation uses only the topics you choose and how you interact with cards. You can review, reset or delete it from Personalisation settings.
          </p>
        </Panel>
      </Section>
      <Section title="Designed to let you stop">
        <Panel>
          <p className="text-[16px] leading-relaxed">
            No engagement counts, no notifications, no autoplay, no streak warnings. The feed pauses at your daily target and every batch ends in a checkpoint rather than loading forever.
          </p>
        </Panel>
      </Section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found" action={<LinkButton to="/feed" variant="primary">Go to feed</LinkButton>}>
      That link doesn't lead anywhere in Stackwise.
    </EmptyState>
  );
}
