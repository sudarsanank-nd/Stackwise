# Known limitations

- **Local-only data.** Everything lives in this browser's localStorage. Clearing site data, private windows, or another device means a fresh start. No export/import yet.
- **Explain It Back is keyword matching.** It checks for key-concept terms, so a correct explanation in unusual words can be under-credited, and keyword-stuffing can be over-credited. The UI says it is a rough guide.
- **Reading time is estimated** from word count (230 wpm); completion uses dwell time ≥ 40% of that estimate, so very fast readers may not get cards counted until they linger.
- **Source verification.** 8 cards are flagged `needs-source-check` (shown on the card). Cards marked `verified` were written from well-known sources but have not been checked line-by-line against the originals.
- **Content was AI-drafted** to the guidelines in `content-guidelines.md`, then validated by schema tests and spot-checked; a human editorial review is still recommended before wider use.
- **Knowledge check** builds multiple-choice questions from cards read today; distractors are other cards' summaries, so some questions are easy.
- **Share** uses the Web Share API where available, otherwise copies text; there are no shareable deep links outside the app.
- **Fonts** load from Google Fonts; offline, the app falls back to system serif/sans fonts.
- **Single bundle** (~650 kB, ~210 kB gzipped) because all content is bundled; fine at this size.
- **Vitest cache**: Vitest 5 caches `import.meta.glob` results; `npm test` clears the cache first.
- **No notifications or reminders** by design.
