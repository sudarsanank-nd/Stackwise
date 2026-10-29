# Roadmap

## Next (recommended order)
1. Swipe gestures in the story view.
2. In-app research results (serverless function + Claude API with web search) instead of the hand-off to claude.ai — shares the backend with LLM Explain It Back.

## Backlog (revisit later)
- **LLM-backed Explain It Back** — implement `ExplainBackEvaluator` with a model call behind a small API route (key in env vars); keep keyword matcher as offline fallback. Needs a serverless function, since GitHub Pages is static.

## Done
- **Explainers for every card, idea symbols on cover art, research on demand** (2026-10-29).
- **UI revamp** (2026-10-29) — new logo, palette and fonts, load screen, cover art for every card, story view, 20 motion explainers.
- **Source verification pass** (2026-10-29) — all 8 flagged cards reviewed, 52 verified cards spot-checked, 23 DOIs/URLs added. Report and human follow-ups: `docs/source-verification.md`.
- **Installable PWA** (2026-10-29) — manifest, icons, service worker; works offline and installs to the home screen.

## Later
- Spaced repetition: schedule "review" bucket cards by last-seen + understood status (SM-2-style intervals).
- Content pipeline: JSON-schema file + CLI for cheaper-model batch generation, with a human review queue using `reviewStatus`.
- Sync across devices (optional account; export/import JSON as a first step).
- Richer knowledge map: month view, concept-level graph using `relatedCardIds`.
- Team mode: share a collection with direct reports as a reading list for 1:1s.
- More Decision Gym scenarios per topic; branching follow-ups.
- Localisation (Hindi / Tamil UI strings).
- Code-split pages and lazy-load content by topic once content grows past ~300 cards.
