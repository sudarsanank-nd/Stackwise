import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { ScenarioRunner } from '../components/decision-gym/ScenarioRunner';
import { KnowledgeCardView } from '../components/cards/KnowledgeCard';
import { useAppStore } from '../store/useAppStore';
import { SCENARIOS, CARD_INDEX } from '../services/content';

beforeEach(() => useAppStore.getState().resetAll());

describe('onboarding UI', () => {
  it('walks all eight steps and starts the first session', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/session" element={<p>session page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    const next = () => user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    for (const t of ['Investing', 'Leadership', 'Agentic AI']) await user.click(screen.getByRole('button', { name: t }));
    await next(); // rank
    await user.click(screen.getByRole('button', { name: 'Move Leadership up' }));
    await next(); // depth
    await next(); // target
    await user.click(screen.getByRole('radio', { name: /^15 min/ }));
    await next(); // style
    await next(); // goals (needs one)
    await user.click(screen.getByRole('button', { name: 'Understand AI' }));
    await next(); // serendipity
    await next(); // personalisation
    await user.click(screen.getByRole('button', { name: 'Start my first session' }));
    expect(screen.getByText('session page')).toBeInTheDocument();
    const st = useAppStore.getState();
    expect(st.profile!.rankedInterests[0]).toBe('leadership');
    expect(st.profile!.dailyTargetMinutes).toBe(15);
    expect(st.sessions[0].steps).toHaveLength(5);
    expect(st.sessions[0].steps.map((s) => s.kind)).toEqual(['card', 'card', 'card', 'gym', 'reflection']);
  });
});

describe('Decision Gym UI', () => {
  it('completes a scenario and stores the result', async () => {
    const user = userEvent.setup();
    const sc = SCENARIOS[0];
    render(
      <MemoryRouter>
        <ScenarioRunner scenario={sc} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('radio', { name: sc.choices[1].label }));
    await user.click(screen.getByRole('button', { name: 'Lock in my choice' }));
    await user.type(screen.getByRole('textbox'), 'Want evidence first');
    await user.click(screen.getByRole('button', { name: 'Show the trade-offs' }));
    expect(screen.getByText('Your pick')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'What principles apply?' }));
    await user.click(screen.getByRole('button', { name: 'Reflect' }));
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Complete scenario' }));
    expect(screen.getByRole('status')).toHaveTextContent('Scenario complete');
    const r = useAppStore.getState().gymResults[0];
    expect(r).toMatchObject({ scenarioId: sc.id, choiceId: sc.choices[1].id, reasoning: 'Want evidence first', wouldChange: 'no' });
  });
});

describe('Knowledge card UI', () => {
  it('likes, saves and explains why', async () => {
    const user = userEvent.setup();
    const card = CARD_INDEX.get('bf-loss-aversion-panic')!;
    render(
      <MemoryRouter>
        <KnowledgeCardView card={card} reasons={['You chose Investing as an interest']} />
      </MemoryRouter>,
    );
    const actions = screen.getByRole('group', { name: 'Card actions' });
    await user.click(within(actions).getByRole('button', { name: 'Like' }));
    expect(within(actions).getByRole('button', { name: 'Liked' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(actions).getByRole('button', { name: 'Save' }));
    expect(useAppStore.getState().isSaved(card.id)).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Why am I seeing this?' }));
    expect(screen.getByText('You chose Investing as an interest')).toBeInTheDocument();
    expect(screen.getByText(/not financial advice/)).toBeInTheDocument();
  });
});
