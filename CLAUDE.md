# Stackwise — notes for Claude Code

Mobile-first micro-learning feed. React 19 + TypeScript 7 + Vite 8 + Tailwind CSS 4 + zustand (persisted to localStorage). No backend.

## Commands
- `npm install` then `npm run dev` (http://localhost:5173)
- `npm test` — Vitest (148 tests, includes content validation). Clears `node_modules/.vitest-cache` first because Vitest 5 caches `import.meta.glob` results.
- `npm run validate:content` — content JSON only
- `npm run typecheck`, `npm run lint` (oxlint), `npm run build`
- `npm run build:artifact` — single-file HTML in `dist-artifact/`; `npm run build:page` also writes a body-only `dist-artifact/page.html` for hosted pages
- `npm run smoke` / `npm run a11y` — Playwright browser checks; need the dev server running

## Layout
- `src/services/` — pure logic (recommendation, signals, progress, search, session, knowledgeMap, explainBack, knowledgeCheck, onboarding, content). Keep business logic here, not in components.
- `src/store/useAppStore.ts` — single zustand store, localStorage key `stackwise:v1`. Selectors must return stable values (no new arrays/Sets inside `useAppStore(...)`; derive with `useMemo`).
- `src/data/cards/*.json` — knowledge cards; schema in `src/types/index.ts`; rules in `docs/content-guidelines.md`.
- `src/pages/`, `src/components/` — UI. Router is HashRouter in dev/prod builds, MemoryRouter in the `artifact` build mode.

## Conventions
- Recommendation weights and feed mix live in `WEIGHTS` / `MIX` in `src/services/recommendation.ts`; document changes in `docs/personalization-logic.md`.
- Investing content is educational only: no return promises, predictions, stock picks or invented statistics. Never fabricate sources; flag uncertain ones as `needs-source-check`.
- Colours come from CSS tokens in `src/index.css` (light + `.dark`); topic accents use `--accent-l` / `--accent-d`.
- Touch targets ≥ 44px (`min-h-11`), visible focus, labelled controls — `npm run a11y` should stay clean.
- Record notable decisions in `docs/decision-log.md` and milestones in `docs/checkpoints.md`.

## Suggested next work
See `docs/roadmap.md`: source verification of flagged cards, LLM-backed Explain It Back (implement `ExplainBackEvaluator`), PWA/offline.
