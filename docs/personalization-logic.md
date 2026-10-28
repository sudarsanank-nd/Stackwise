# Personalisation logic

Code: `src/services/recommendation.ts` (scoring + mix), `src/services/signals.ts` (signal folding). Tests: `src/tests/recommendation.test.ts`.

## 1. Signals (all local)
Folded from the interaction log: likes/unlikes, skips, saves, deeper reads (explore), more/less-like-this, completions (dwell ≥ 40% of reading time, or like/save), "understood", plus the last 5 searches and the last 8 cards shown. Nothing sensitive is inferred; only topics and card formats are counted.

## 2. Score per card (`WEIGHTS`)
| Rule | Weight |
|---|---|
| Primary topic is a selected interest | +5 |
| Primary topic is in the top five | +4 |
| A secondary topic is an interest (when primary isn't) | +2 |
| User liked cards in this topic | +3 |
| Related to a saved card (either direction) | +3 |
| User explored this topic in depth | +3 |
| Difficulty matches the per-topic setting | +2 (−1 if two levels away) |
| Topic is adjacent to an interest | +1 |
| Topic supports a selected learning goal | +1 |
| Format matches preferred content style | +1 |
| Matches a recent search | +2 |
| More / less like this (topic) | +2 / −3 |
| Topic over-exposed (≥3 of last 8 shown) | −3 |
| Topic repeatedly skipped (≥3 skips, more than likes+saves) | −4 |
| Card already completed | −5 |
| Random jitter (seeded) | 0 – 2.5 |

Every rule that fires adds a plain-English reason; the card's **Why am I seeing this?** panel lists them.

## 3. Buckets and mix (`MIX`)
- **high-interest** – primary topic is an interest
- **adjacent** – not an interest but linked by a secondary topic or topic adjacency
- **serendipity** – neither (explanation names the interests it connects to)
- **review** – saved/liked and read before, not yet marked understood
- **experimental** – a format the user hasn't read yet

| "Unfamiliar topics" setting | interest | adjacent | serendipity | review | experimental |
|---|---|---|---|---|---|
| Rarely | 60% | 20% | 5% | 10% | 5% |
| Sometimes (default) | 50% | 20% | 15% | 10% | 5% |
| Often | 40% | 20% | 25% | 10% | 5% |

Short buckets are back-filled by overall score. Buckets are spread evenly through the batch and neighbouring cards are swapped to avoid same-topic runs.

## 4. Modes
For you (mix above) · Serendipity (non-interest topics only) · Contrarian (two-viewpoint, myth vs reality, counterintuitive) · Connect the dots (bridge cards). Filters (topic, difficulty, format) apply in all modes.

## 5. Personalisation off
Balanced round-robin across topics, no behavioural signals; reason shown: "Personalisation is off".

## 6. User controls
Settings → toggle personalisation, edit interests/rank/depth/target/discovery, see per-topic signal table, see the weights and current mix, clear searches, **Reset recommendations** (clears like/skip/explore/more/less/share + searches, keeps saves and reading progress), **Remove activity history**, **Start over**. History → remove individual cards.

## 7. Feed pacing
Batches of 10 → checkpoint ("Load 10 more" / "I'm done"). After the daily target is met the feed stops after the current card and shows the guardrail (finish · review saved · knowledge check · reflect · continue intentionally). Continuing shows a persistent "target complete" banner.

## 8. Changing behaviour
Edit `WEIGHTS`, `MIX`, `OVEREXPOSURE_*`, `SKIP_THRESHOLD` in `recommendation.ts`, or `COMPLETION_DWELL_SHARE`, `STREAK_MIN_CARDS`, `GYM_SECONDS` in `progress.ts`. Tests cover the expected behaviour.
