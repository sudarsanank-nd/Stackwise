import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLLISIONS, ALL_CARDS, SCENARIOS } from '../services/content';
import { IdeaCollisionView } from '../components/cards/IdeaCollisionView';
import { Button, LinkButton, PageHeader, Panel, Section, EmptyState } from '../components/common/ui';
import { Logo } from '../components/navigation/AppShell';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { TOPICS } from '../data/topics';

export function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-12">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="font-serif text-xl font-semibold">ScrollWise</span>
      </div>
      <h1 className="mt-10 font-serif text-[40px] leading-[1.08] font-semibold tracking-tight sm:text-[48px]">
        Scroll like social media.
        <br />
        Finish like a good book chapter.
      </h1>
      <p className="mt-5 text-[18px] leading-relaxed text-ink-2">
        One useful idea at a time — each with an example, a question worth sitting with, and something small to try. Personalised to what you care about, with a clear stopping point every day.
      </p>
      <ul className="mt-8 space-y-3 text-[16px]">
        {[
          `${ALL_CARDS.length} ideas across ${TOPICS.length} topics, from investing to agentic AI`,
          `${SCENARIOS.length} Decision Gym scenarios — decide first, learn second`,
          'Every card explains why you are seeing it',
          'Your data stays on this device',
        ].map((t) => (
          <li key={t} className="flex gap-3">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>
      <LinkButton to="/onboarding" variant="primary" className="mt-10 min-h-13 text-[17px]">
        Set up my feed — about 2 minutes
      </LinkButton>
      <p className="mt-4 text-center text-[13px] text-ink-2">
        Educational content only. <Link to="/about" className="underline">About & disclaimer</Link>
      </p>
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
      <PageHeader title="About ScrollWise" back="/profile" />
      <Section title="What this is">
        <Panel>
          <p className="text-[16px] leading-relaxed">
            ScrollWise is a prototype micro-learning feed. Cards are original summaries written to teach one idea each. Where a card relies on outside research, the source is listed; cards still awaiting source verification are labelled. Illustrative examples are marked as such, and contested findings carry a note.
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
            Everything — your profile, saved cards, reading history and reflections — is stored in this browser only. Nothing is sent to a server. ScrollWise never infers sensitive personal information; personalisation uses only the topics you choose and how you interact with cards. You can review, reset or delete it from Personalisation settings.
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
      That link doesn't lead anywhere in ScrollWise.
    </EmptyState>
  );
}
