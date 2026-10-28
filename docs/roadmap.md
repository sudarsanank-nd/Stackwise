# Roadmap

## Next (recommended order)
1. **Source verification pass** — review the 8 cards flagged `needs-source-check` and spot-check `verified` citations against primary sources; add DOIs/URLs.
2. **LLM-backed Explain It Back** — implement `ExplainBackEvaluator` with a model call behind a small API route (key in env vars); keep keyword matcher as offline fallback.
3. **Installable PWA** — manifest + service worker for offline reading and home-screen launch on phones.

## Later
- Spaced repetition: schedule "review" bucket cards by last-seen + understood status (SM-2-style intervals).
- Content pipeline: JSON-schema file + CLI for cheaper-model batch generation, with a human review queue using `reviewStatus`.
- Sync across devices (optional account; export/import JSON as a first step).
- Richer knowledge map: month view, concept-level graph using `relatedCardIds`.
- Team mode: share a collection with direct reports as a reading list for 1:1s.
- More Decision Gym scenarios per topic; branching follow-ups.
- Localisation (Hindi / Tamil UI strings).
- Code-split pages and lazy-load content by topic once content grows past ~300 cards.
