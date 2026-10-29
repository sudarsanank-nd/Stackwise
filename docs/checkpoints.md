# Checkpoints

Restore any checkpoint: `git log --oneline` → `git switch -c restore-<n> <hash>` → `npm install` → `npm run dev`.

| # | Date (IST) | Commit | Features | Key files | Tests | Known issues |
|---|---|---|---|---|---|---|
| 1 | 2026-10-28 | `1ec7574` | Initial setup: Vite/React/TS/Tailwind/Vitest, domain types, topics, 12 seed cards, content validator | `src/types`, `src/data/topics.ts`, `src/data/cards/seed.json`, `src/tests/content.test.ts` | content schema (seed only) | — |
| 2 | 2026-10-28 | `a0d2ce8` | Content expanded to 93 cards, 8 scenarios, 8 collisions | `src/data/**` | content suite ✅ | 8 cards need source check |
| 3–6 | 2026-10-28 | `c77b131` | Navigation, onboarding & preferences, functional feed, library & search, advanced features (Gym, sessions, modes, map, guardrail, collisions, Explain It Back) | `src/services/*`, `src/store/*`, `src/pages/*`, `src/components/*` | 148 unit/component ✅, smoke ✅, axe ✅ | see known-limitations |
| 7 | 2026-10-28 | see `git log` (“Final tested build”) | Docs, final verification, builds | `README.md`, `docs/*` | full suite ✅, build ✅ | — |
| 8 | 2026-10-29 | see `git log` (“Story view and motion explainers”) | PWA, source verification, brand revamp (logo, palette, fonts, load screen), cover art, story view, 20 motion explainers | `src/components/brand`, `src/components/cards/CoverArt.tsx`, `src/components/explainer`, `src/pages/StoryPage.tsx`, `src/data/explainers.json` | 170 unit/content ✅, smoke ✅, axe ✅, offline ✅ | — |

Checkpoints 3–6 were developed together and verified as one commit because the services and screens were built against the same store contract; each milestone was verified in the browser smoke test before moving on.
