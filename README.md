# Stackwise

A calm, mobile-first micro-learning feed: 20–60 second knowledge cards, personalised by a transparent scoring model, with a built-in stopping point.

- **93 cards** across 16 topics and all 20 card formats · **8 Decision Gym scenarios** · **8 Idea Collisions**
- Onboarding, personalised feed (4 modes), search, filters, Knowledge Shelf, 5-minute sessions, Decision Gym, Explain It Back, Weekly Knowledge Map, daily guardrail, light/dark mode
- Everything is stored locally in the browser (no backend)

## Run it

Requires Node 20+ (built with Node 22).

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | All unit/component tests (Vitest, 148 tests incl. content validation) |
| `npm run validate:content` | Validate card / scenario / collision JSON only |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | oxlint |
| `npm run build` | Production build → `dist/` |
| `npm run build:artifact` | Single self-contained HTML → `dist-artifact/index.html` (open directly, no server) |
| `npm run smoke` | Browser smoke test of critical flows (needs `npm run dev` running and Playwright) |
| `npm run a11y` | axe-core audit of 16 screens in light + dark (needs dev server + Playwright) |

> `npm test` clears `node_modules/.vitest-cache` first: Vitest 5's module cache does not notice new JSON files matched by `import.meta.glob`.

## Keyboard (feed)
`j` / `k` next / previous card · `l` like · `s` save · `x` skip. All controls are reachable with Tab; focus is always visible.

## Project layout
```
src/
  components/  cards · feed · onboarding · navigation · library · decision-gym · common
  pages/       one module per route group
  services/    pure logic: recommendation, signals, progress, search, session, knowledgeMap, explainBack, knowledgeCheck, onboarding, share, content
  store/       zustand store persisted to localStorage (key stackwise:v1)
  data/        topics.ts, feedModes.ts, cards/*.json, scenarios.json, collisions.json
  types/       domain types
  utils/ hooks/ tests/
scripts/       smoke.mjs, a11y.mjs
docs/          blueprint, personalisation logic, content guidelines, testing checklist, roadmap, limitations, checkpoints, decision log, changelog
```

## Adding content
See `docs/content-guidelines.md`. Add cards to any JSON file in `src/data/cards/`, then run `npm run validate:content`.

## Restore a checkpoint
Each milestone is a local git commit — see `docs/checkpoints.md`. `git log --oneline`, then `git checkout <hash>` (or `git switch -c restore <hash>`), `npm install`, `npm run dev`.

## Disclaimer
Investing content is educational only and not financial advice. See the in-app About page.
