# ScrollWise — Product Blueprint

## 1. Product summary
ScrollWise is a mobile-first, vertical feed of 20–60 second knowledge cards for a busy technical-support leader and people manager. Each card teaches **one** idea and always ends in something usable: an example, a question, a small action, and a link to a related idea. The feed is personalised by a transparent, editable scoring model and has a built-in stopping point once the daily target is met.

**Positioning line:** *Scroll like social media, finish like a good book chapter.*

### Name options (kept ScrollWise)
| Name | Why it might be stronger |
|---|---|
| **ScrollWise** (current) | Clear, says the behaviour and the outcome. Kept. |
| Margin | Reading-journal feel; "learning in the margins of your day". Hard to search. |
| Daily Dose of Ideas / Kindling | Warmer, but less distinctive. |

Recommendation: keep **ScrollWise** — no clear advantage from renaming at prototype stage.

## 2. Key differentiation
1. **Intentional stopping point** — the feed pauses at the daily target and offers *finish / review / check / reflect / continue knowingly*.
2. **Transparent personalisation** — every card shows *Why am I seeing this?* with the exact scoring reasons; all signals are viewable and resettable.
3. **Active learning, not passive reading** — Decision Gym (choose before you learn), Explain It Back, Idea Collision, knowledge checks.
4. **Anti-filter-bubble by design** — fixed serendipity share, Serendipity Mode, Connect-the-Dots cards.
5. **Honest content** — structured sources, review status, evidence-balance labels on contested topics, flagged disputed findings.

## 3. Information architecture
```
Welcome ─► Onboarding (8 steps) ─► First 5-step session
Primary nav (bottom bar on mobile, rail on desktop)
├── Feed            (modes: For you · Serendipity · Contrarian · Connect the dots; filters)
│    └── Card detail / Explore deeper ─► related, contrast, Explain It Back, save to collection
├── Session         (5-minute session; recommended "gap" session)
├── Gym             (Decision Gym list ─► scenario flow)
├── Shelf           (collections ─► collection detail)
└── You             (profile hub)
     ├── Weekly Knowledge Map
     ├── Learning history
     ├── Personalisation settings
     ├── Topic explorer
     ├── Idea Collision
     └── About & educational disclaimer
Search (header, all screens) · Daily completion (/complete)
```

## 4. User flows (implemented)
1. **First-time**: Welcome → interests → rank top 5 → depth per topic → daily target → content style → goals → unfamiliar-topic frequency → personalisation on/off → 5-step session.
2. **Discovery**: Feed → like/skip/save → Explore deeper → related card → save to collection.
3. **Decision Gym**: scenario → choose → optional reasoning → trade-offs for every option → principle → "would you change?" reflection.
4. **Search**: query → results grouped by topic → difficulty/format filters → open card → related.
5. **Daily completion**: target met → inline guardrail + /complete → reflection → finish or continue knowingly (banner stays visible).
6. **Weekly review**: Map → time, topic distribution, saved, gaps → start recommended gap session.
7. **Library**: Shelf → collections → move cards, create/rename/delete → revisit → mark understood.

## 5. Screen inventory
Welcome · Onboarding · Feed · Session · Card detail · Search · Topic explorer (+ topic page) · Decision Gym (list + scenario) · Knowledge Shelf · Collection detail · Weekly Knowledge Map · Daily completion · Profile · Personalisation settings · Learning history · Idea Collision · About/disclaimer · Not-found / empty / error states.

## 6. Component architecture
```
src/
  components/
    cards/        KnowledgeCard, CardActions, WhyThisCard, ContrarianBlock, BridgeBlock, CardMeta, SaveToCollection
    feed/         FeedView, FeedModeTabs, FeedFilters, FeedCheckpoint, GuardrailPanel, TargetMetBanner
    onboarding/   OnboardingWizard + one component per step
    navigation/   AppShell, BottomNav, SideRail, Header
    library/      CollectionList, CollectionCard
    decision-gym/ ScenarioRunner, ScenarioList
    knowledge-map/TopicBars, TopicGraph
    common/       Button, Chip, Segmented, ProgressBar, EmptyState, ErrorBoundary, PageHeader
  pages/          one file per route
  services/       content, recommendation, progress, search, session, knowledgeMap, explainBack, share
  store/          useAppStore (zustand + persist), selectors
  data/           topics.ts, formats.ts, cards/*.json, scenarios.json, collisions.json
  types/          domain types
  utils/          rng, text, date
  tests/          vitest suites
```
Business logic lives in `services/` as pure functions (unit-tested); components read state through the store and call services.

## 7. Data model
See `src/types/index.ts`. Core entities: `UserProfile`, `KnowledgeCard`, `UserInteraction`, `Collection`, `LearningSession`, `DecisionScenario`, `IdeaCollision`, `GymResult`, `Reflection`.

## 8. Recommendation approach
Transparent additive score per card (weights in `src/services/recommendation.ts → WEIGHTS`) + seeded jitter, then a bucketed mix (50% high-interest · 20% adjacent · 15% serendipity · 10% review · 5% experimental) with a no-repeat-topic interleave. Details: `docs/personalization-logic.md`.

## 9. Implementation plan
1. Foundation (Vite, TS, Tailwind v4, router, zustand persist, theme, error boundary, Vitest) ✔
2. Core: onboarding, feed, card, interactions, search, filters, library ✔
3. Differentiated: Gym, session, modes, map, completion, collision, Explain It Back ✔
4. Content: 12 seed cards → validator → 60+ cards ✔
5. Tests, build, browser smoke test, docs ✔
