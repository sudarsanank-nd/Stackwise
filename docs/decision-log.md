# Decision log

| # | Decision | Reason |
|---|---|---|
| 1 | Workspace was empty → new project in `scrollwise/` (later renamed) | No existing work to preserve. |
| 2 | Stack: Vite 8 + React 19 + TypeScript 7 + Tailwind CSS 4 + Vitest 5 | Matches spec; latest stable versions from `create-vite`. |
| 3 | Lint with **oxlint** (create-vite default) instead of ESLint | Already scaffolded, zero-config, fast; avoids extra dependencies. |
| 4 | State: **zustand** with `persist` → localStorage | Tiny, typed, testable outside React; localStorage is enough for the data volume (interactions capped). |
| 5 | Routing: `react-router-dom` **HashRouter** | Works from `file://`, static hosting and single-file builds without server rewrites. |
| 6 | Content as JSON files per domain + a validator test | Lets cheaper models / editors extend content without touching code; schema enforced by `content.test.ts`. |
| 7 | Reading time is computed from word count at load time | Keeps the stored field honest when card text is edited. |
| 8 | Streak day = ≥3 cards completed **or** a session completed | Gentle definition for short sessions; no loss warnings. |
| 9 | Card "completed" = visible ≥ 40% of its reading time, or liked/saved/explored | Avoids counting fast flicks as learning. |
| 10 | Feed uses `scroll-snap-type: y proximity` with natural-height cards | Cards can be longer than the screen on small phones; mandatory snap would trap text. |
| 11 | Explain It Back uses keyword/concept matching behind an `Evaluator` interface | Spec asks for local matching now, LLM-ready later. |
| 12 | Extra `artifact` build mode (single-file HTML) | Lets the prototype be opened on a phone without running a dev server. |
| 13 | Renamed app ScrollWise → **Stackwise**; storage key `stackwise:v1` with a one-time fallback read of `scrollwise:v1` | Owner's naming choice; keeps existing progress. |
| 14 | Hosted on **GitHub Pages** via Actions (`.github/workflows/deploy-pages.yml`), redeploying on every push to `main` | Free static hosting; the existing `base: './'` + HashRouter build works under the `/Stackwise/` subpath unchanged. Tests gate the deploy. |
| 15 | **Installable PWA** via `vite-plugin-pwa` (generateSW), hosted build only; service worker registered manually from `src/registerServiceWorker.ts` | Precaches the app shell and all content so cards read offline; Google Fonts cached at runtime. Manual `./sw.js` registration avoids the plugin's virtual module, so the single-file `artifact` build is unaffected. |
| 16 | Source verification pass promoted all 8 `needs-source-check` cards to `verified` and added 23 DOIs/URLs | Checked via web search (the build container's network blocks most publisher sites); see `docs/source-verification.md` for what was checked and the remaining human follow-ups. |
| 17 | **Brand revamp** from the owner's logo concept: simplified LogoMark for icons, full lockup for the load screen; navy / emerald / cream / marigold palette; Bricolage Grotesque + Figtree + Instrument Serif, self-hosted with `@fontsource` | The detailed 3D logo blurs below 64 px, so the icon drops the chart, sparks and leaf. Self-hosting fonts keeps the PWA fully offline and avoids a Google Fonts dependency. Emerald for text/buttons is darkened to `#1A7A50` for 4.5:1 contrast. |
| 18 | **Cover art is procedural SVG** (`CoverArt.tsx`), one of three motifs per topic family, seeded by card id | Every card gets art with zero assets, offline, consistent with the brand; no stock photos or invented imagery. |
| 19 | **Story view + motion explainers**: `/story/:id` tap-through slides; ~1 in 5 cards has an animated explainer in `src/data/explainers/*.json` | Explainers never autoplay (keeps the "no autoplay" promise), play muted with captions, and only restate the card. Built from 8 reusable animated visuals rather than video files, so they cost nothing to host and work offline. |

