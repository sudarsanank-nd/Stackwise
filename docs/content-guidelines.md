# Content guidelines

Cards live in `src/data/cards/*.json` (one file per domain batch). Scenarios in `src/data/scenarios.json`, idea collisions in `src/data/collisions.json`. The schema is `KnowledgeCard` in `src/types/index.ts`; `src/data/cards/seed.json` holds 12 reference cards — match their quality and shape.

Validate with: `npx vitest run src/tests/content.test.ts`

## Every card
- Teaches **one** identifiable idea. No two cards may teach the same insight under different titles.
- `title`: a hook-style headline, ≤ 60 characters, not clickbait.
- `hook`: one sentence that creates curiosity.
- `coreIdea`: **50–120 words**, plain conversational English. No buzzwords ("leverage", "synergy", "unlock", "game-changer"), no AI filler ("In today's fast-paced world", "It's important to note").
- `whyItMatters`: 1 sentence on the practical stake.
- `example`: concrete. Set `exampleType`: `illustrative` (invented scenario — say "Illustrative:" or make it obviously hypothetical), `historical` or `documented` (real, verifiable events/studies only).
- `reflectionQuestion`: one specific question, not "What do you think?".
- `suggestedAction`: one small thing doable this week.
- Total card reads in ~20–60 s (the validator caps at 80 s). Vary length and format.
- `keyConcepts`: 2–4 concepts used by Explain It Back. `terms` are lowercase words/stems/short phrases a person would plausibly write when explaining; `minMatches` defaults to 1.
- `simpleExplanation`: one sentence a 12-year-old would understand.
- `deeper`: 60–110 words of extra nuance (limits, how to apply, common misuse).
- Optional `misconceptions`: trigger phrases + correcting note.
- Use Indian rupee examples (₹, lakh/crore OK) where money appears; keep concepts global.

## Honesty rules (strict)
1. **Never fabricate** studies, statistics, quotes, dates, or sources. If unsure of a detail, leave it out or phrase generally.
2. Use only well-established, real sources (author, title, year). Add `url` only if you are confident it is correct (DOI or official page); otherwise omit `url`.
3. `reviewStatus`: `verified` (real, well-known source you are confident about), `needs-source-check` (externally sourced claim you are less sure of), `original-synthesis` (original explanation/framework with no external claim).
4. Contested findings (ego depletion, Dunning-Kruger interpretation, power posing, Hawthorne, Zeigarnik, marshmallow etc.) get a `disputed` note and must not be presented as settled.
5. Quotes: only short, accurately attributed quotes; add a `note` when attribution is commonly confused.
6. Investing: educational only. No return promises, no market predictions, no stock picks, no advice tailored to assumed personal circumstances, no invented performance numbers. Illustrative numbers must be labelled as illustration.
7. Distinguish fact / interpretation / opinion. In `two-viewpoints` cards the `contrarian` block must be honest about `evidenceBalance` — do not manufacture false balance.

## Format-specific requirements
| format | required extra field |
|---|---|
| `two-viewpoints` | `contrarian` block (established facts, two positions with evidence + interpretation, optional labelled opinion, unresolved questions, evidenceBalance + balanceNote) |
| `connect-domains` | `bridge` {from, to, insight} |
| `checklist` | `checklist` (3–6 items) |
| `quote-interpretation` | `quote` {text, by, note?} |

The 20 formats: big-idea, mental-model, counterintuitive, myth-vs-reality, case-study, experiment, leadership-situation, investment-mistake, ai-explained, what-would-you-do, quote-interpretation, framework, checklist, historical-lesson, two-viewpoints, self-assessment, common-mistake, comparison, explain-beginner, connect-domains.

For `self-assessment`, put 5 short yes/no questions in `checklist`. For `what-would-you-do`, the `example` holds the situation and the `coreIdea` the principle.

## Links
- `relatedCardIds`: 1–3 ids of genuinely related cards. `contrastingCardIds`: ids of cards that pull in the opposite direction (often empty).
- Only link to ids that exist (the validator fails otherwise).

## IDs
Kebab-case with a domain prefix: `inv-`, `pf-`, `bf-`, `psy-`, `pm-`, `lead-`, `comm-`, `neg-`, `ai-`, `agent-`, `tech-`, `dm-`, `mm-`, `prod-`, `sup-`, `ops-`, `connect-`.

## Adding content later (cheaper model workflow)
1. Copy a card from `seed.json` as a template.
2. Write the new card in an existing or new JSON file under `src/data/cards/`.
3. Run the validator; fix every failure for your ids.
4. Set `reviewStatus` honestly; flag anything you could not verify as `needs-source-check`.
