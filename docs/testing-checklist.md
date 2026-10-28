# Testing checklist

Last full run: 2026-10-28.

## Automated
| Check | Command | Result |
|---|---|---|
| Type check | `npm run typecheck` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ 0 warnings |
| Unit + component tests | `npm test` | ✅ 148 / 148 (7 files) |
| Production build | `npm run build` | ✅ |
| Single-file build | `npm run build:artifact` | ✅ (≈706 kB, 217 kB gzip) |
| Browser smoke (Playwright, 390×844 + 1280×860) | `npm run smoke` | ✅ 18 / 18 flows, 0 console errors |
| Accessibility (axe-core, 16 screens × light/dark) | `npm run a11y` | ✅ 0 serious/critical, 0 contrast issues |

### Required test coverage → where
| # | Requirement | Test |
|---|---|---|
| 1 | Onboarding completion | `ui.test.tsx` (8-step walk-through), `store.test.ts` |
| 2 | Preference persistence | `store.test.ts › persists preference updates`; smoke "persistence after reload" |
| 3 | Feed personalisation | `recommendation.test.ts › is personalised / changes when interests change` |
| 4 | Save / unsave | `store.test.ts`, `ui.test.tsx` |
| 5 | Like / skip | `store.test.ts`, `ui.test.tsx` |
| 6 | Collection creation (+rename/move/delete) | `store.test.ts › collections` |
| 7 | Search | `search.test.ts` |
| 8 | Topic filtering | `recommendation.test.ts`, `search.test.ts` |
| 9 | Difficulty filtering | `recommendation.test.ts`, `search.test.ts` |
| 10 | Daily goal calculation | `progress.test.ts › daily goal` |
| 11 | Streak calculation | `progress.test.ts › streaks` (incl. month boundary) |
| 12 | Decision Gym completion | `ui.test.tsx › Decision Gym UI` |
| 13 | Recommendation scoring | `recommendation.test.ts › recommendation scoring` |
| 14 | Reset personalisation | `store.test.ts › reset recommendations` |
| 15 | Dark-mode persistence | `store.test.ts`; smoke "dark mode" (reload) |
| — | Feed variety over 20 cards | `recommendation.test.ts › stays varied over 20 cards` (5 seeds) |
| — | Content schema & distribution | `content.test.ts` (per-card) |
| — | Explain It Back matching | `explainBack.test.ts` |

## Manual critical-flow review (via smoke screenshots)
- [x] Welcome → onboarding → first 5-step session → completion
- [x] Feed: like, save (auto-filed, toast), skip (scrolls on), Why am I seeing this, more/less like this
- [x] Explore deeper → related ideas → Explain It Back → save to collection → mark understood
- [x] Search (grouped by topic, filters)
- [x] Shelf: create collection; collection detail: rename, move, remove, delete (non-default)
- [x] Weekly map with data and empty state; recommended gap session
- [x] Daily guardrail appears when target met; "Continue intentionally" shows banner
- [x] Light/dark, mobile bottom bar / desktop rail

## Accessibility checklist
- [x] Keyboard navigation: all controls are buttons/links/inputs; feed shortcuts j/k/l/s/x; skip-to-content link
- [x] Visible focus ring (`:focus-visible`, 3px)
- [x] Semantic headings (one h1 per page; cards are `article` with h2, h1 on detail)
- [x] Button labels (icon-only buttons have `aria-label`; toggles use `aria-pressed`)
- [x] Form labels on every input/textarea/select (visible or `sr-only`)
- [x] Colour contrast checked by axe in both themes; topic accents have separate light/dark values
- [x] Screen-reader text for reading time, bridge arrows, progress bars (`role=progressbar`), charts (`role=img` + label)
- [x] Reduced motion: `prefers-reduced-motion` disables animation and smooth scroll
- [x] Logical tab order (DOM order matches visual order)
- [x] Error messaging: error boundary per route with recovery; empty states on every list
- [x] Touch targets ≥ 44px (`min-h-11`) for primary controls
- [x] Mobile text: 16–18px body, inputs 16px (no iOS zoom)
