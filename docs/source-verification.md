# Source verification pass (roadmap item #1)

Date: 2026-10-29. Scope: every card in `src/data/cards/*.json` with `reviewStatus` `needs-source-check` (8) or `verified` (52). `original-synthesis` cards were not reviewed.

**How it was checked:** web search, one or two queries per card. Direct page fetches were blocked by this session's network policy for most hosts (sre.google, meity.gov.in, quoteinvestigator.com and others), so these checks rely on bibliographic records and publisher listings in the search index, not on reading the full text. A URL was added only when the search index showed that exact URL (or DOI) for the right work, or when it is a well-known canonical location (Berkshire letters archive). Where a DOI could not be confirmed, no URL was added.

**Totals:** 8 promoted to `verified` · 3 verified cards fixed · 0 downgraded · 0 still flagged · 23 URLs added.

## Previously flagged cards (`needs-source-check`)

| Card id | Source | Outcome | What changed | URL added |
|---|---|---|---|---|
| inv-margin-of-safety | Graham, *The Intelligent Investor*, 1949 | verified | None. The 1949 date is correct, and "margin of safety" is the book's closing chapter motto. The quote note already says chapter numbering varies by edition. | none (a book) |
| mm-inversion | Munger, speech to the Harvard School, 1986 | fixed, verified | The source was "original synthesis" and is now Munger's June 1986 Harvard School speech, where he credits "invert, always invert" to Jacobi. The attribution now says the exact Jacobi wording is not well documented. "It works" is softened to "It often works". | none |
| prod-eisenhower-matrix | Covey, *The 7 Habits of Highly Effective People*, 1989 | fixed, verified | The attribution now names the event: Eisenhower's August 1954 address to the World Council of Churches at Northwestern University, where he credited the line to an unnamed "former college president". The card's "myth vs reality" framing holds up. | none |
| sup-incident-handoffs | Beyer et al. (eds.), *Site Reliability Engineering*, 2016, ch. 14 "Managing Incidents" | fixed, verified | The title now names chapter 14. The chapter says the outgoing incident commander should hand off explicitly and stay on the call until the new one firmly acknowledges it, which supports the card's claim. The "Flagged for source check" sentence is replaced with that summary. | https://sre.google/sre-book/managing-incidents/ |
| ops-five-whys-limits | Ohno, *Toyota Production System: Beyond Large-Scale Production*, Productivity Press, 1988 | fixed, verified | The machine example (blown fuse → bearing → lubrication pump → worn shaft → missing strainer) is on p. 17 of the English edition, as the Lean Enterprise Institute lexicon confirms. The "Flagged" sentence is replaced with the page reference. | https://www.routledge.com/9780915299140 (publisher page, ISBN 0-915299-14-3) |
| pm-conflict-task-vs-relationship | De Dreu & Weingart, 2003, *Journal of Applied Psychology* 88(4), 741–749 | fixed, verified | The metadata was already correct, and the card's claims match the abstract. Both conflict types relate negatively to performance and satisfaction, and the two are strongly correlated. The "later work" sentence now names de Wit, Greer & Jehn (2012). | https://doi.org/10.1037/0021-9010.88.4.741 |
| comm-curse-of-knowledge | Heath & Heath, *Made to Stick*, 2007 | fixed, verified | The term "curse of knowledge" is now credited to Camerer, Loewenstein & Weber (1989, *JPE*, doi:10.1086/261651). Newton's study is now described as her 1990 Stanford dissertation. The numbers stay qualitative ("about half" vs "very few"), which matches the Heaths' account (50% predicted, 3 of 120 guessed). | none (book stays the source) |
| ai-data-privacy | Government of India, *Digital Personal Data Protection Act, 2023* (No. 22 of 2023) | fixed, verified | The title now includes the Act number. The Act received assent on 11 Aug 2023, and its Rules were notified on 13 Nov 2025 with phased commencement. The card's general claim ("sets duties for handling personal data") holds. | https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf (MeitY copy of the gazette text). Alternative: https://egazette.gov.in/WriteReadData/2023/248045.pdf |

## Verified cards (spot-check)

| Card id | Source | Outcome | What changed | URL added |
|---|---|---|---|---|
| inv-diversification-markowitz | Markowitz 1952, *J. Finance* 7(1) | verified | — | doi:10.1111/j.1540-6261.1952.tb01525.x |
| inv-mr-market-cycles | Graham, *Intelligent Investor*, 1949 | verified | — | — |
| inv-circle-of-competence | Buffett, 1996 Berkshire letter | verified | — | berkshirehathaway.com/letters/1996.html |
| inv-risk-adjusted-returns | Sharpe 1966, *J. Business* 39 | verified | — | — (DOI not confirmed) |
| pf-inflation-real-returns | RBI flexible inflation targeting (4% ±2%) | verified | — | — (no official page found in search) |
| bf-confirmation-bias-thesis | Nickerson 1998, *Rev. Gen. Psych.* | verified | — | doi:10.1037/1089-2680.2.2.175 |
| bf-survivorship-bias-wald | Mangel & Samaniego 1984, *JASA* 79(386) | verified | — | doi:10.2307/2288257 |
| bf-anchoring-purchase-price | Tversky & Kahneman 1974, *Science* | verified | — | doi:10.1126/science.185.4157.1124 |
| bf-mental-accounting | Thaler 1985, *Marketing Science* | verified | — | doi:10.1287/mksc.4.3.199 |
| bf-herding-fomo | Banerjee 1992, *QJE* 107(3) | verified | — | doi:10.2307/2118364 |
| dm-one-way-two-way-doors | Bezos, 2015 shareholder letter | verified | — | — |
| dm-second-order-thinking | Marks, *The Most Important Thing*, 2011 | verified | — | — |
| dm-base-rates | Kahneman & Tversky 1973, *Psych. Review* | verified | — | doi:10.1037/h0034747 |
| mm-chestertons-fence | Chesterton, *The Thing*, 1929 | verified | — | — |
| mm-map-territory | Korzybski, *Science and Sanity*, 1933 | verified | — | — |
| prod-maker-manager-schedule | Graham 2009 | verified | — | (already had URL) |
| prod-parkinsons-law | Parkinson, *The Economist*, 1955 | verified | — | — |
| sup-case-prioritization | ITIL Service Operation, 2011 | verified | — | — |
| sup-signal-vs-noise | Shewhart 1931 | verified | — | — |
| sup-psych-safety-escalations | Edmondson 1999 | verified | — | (already had DOI) |
| ops-swiss-cheese-model | Reason, *Human Error*, 1990 | **fixed** | "from Human Error (1990)" is now "which grew out of his book Human Error (1990)". The 1990 book has the layered-defences diagram, but the "Swiss cheese" form was set out more fully later (1997 book; 2000 *BMJ* paper). | — |
| ops-littles-law | Little 1961, *Operations Research* 9(3) | verified | — | doi:10.1287/opre.9.3.383 |
| pm-sbi-feedback | Center for Creative Leadership | verified | — | — (no ccl.org page found) |
| pm-burnout-signals | WHO, 28 May 2019 | verified | — | who.int news item |
| lead-loss-aversion-change | Kahneman & Tversky 1979, *Econometrica* | verified | — | doi:10.2307/1914185 |
| lead-disagree-and-commit | Amazon Leadership Principles | verified | — | amazon.jobs leadership-principles page |
| lead-commanders-intent-ambiguity | Military doctrine (no author) | verified | — | — |
| lead-fix-process-not-person | Deming, *Out of the Crisis* | **fixed** | Year changed from 1982 to 1986. 1982 is the MIT-CAES precursor, *Quality, Productivity, and Competitive Position*; *Out of the Crisis* is © 1986. | — |
| psy-anchoring-wheel | Tversky & Kahneman 1974 | verified | — | (already had DOI) |
| psy-asch-conformity | Asch 1956, *Psych. Monographs* 70(9) | verified | — | — (DOI not confirmed) |
| psy-ikea-effect | Norton, Mochon & Ariely 2012, *JCP* 22(3) | verified | — | doi:10.1016/j.jcps.2011.08.002 |
| psy-peak-end-rule | Kahneman et al. 1993, *Psych. Science* 4(6) | verified | — | doi:10.1111/j.1467-9280.1993.tb00589.x |
| psy-ego-depletion-debate | Hagger et al. 2016, *PPS* 11(4) | verified | 23 labs and an effect near zero both confirmed | doi:10.1177/1745691616652873 |
| psy-fundamental-attribution-error | Ross 1977, *Adv. Exp. Soc. Psych.* 10 | verified | — | — (DOI not confirmed) |
| comm-bluf-pyramid | Minto, *The Pyramid Principle*, 1987 | verified | — (see follow-ups) | — |
| neg-batna | Fisher & Ury 1981 | verified | — | — |
| neg-interests-vs-positions | Fisher & Ury 1981 | verified | — | — |
| bf-loss-aversion-panic | Kahneman & Tversky 1979 | verified | — | doi:10.2307/1914185 |
| pm-psych-safety-edmondson | Edmondson 1999 | verified | — | (already had DOI) |
| ai-rag-vs-finetune | Lewis et al. 2020 | verified | — | (already had arXiv) |
| dm-premortem | Klein 2007, HBR | verified | — | (already had URL) |
| sup-goodhart-sla | Strathern 1997, *European Review* 5(3) | verified | — | Cambridge Core article page |
| inv-active-vs-passive | SPIVA (S&P DJI) | verified | — | (already had URL) |
| psy-marshmallow-myth | Watts, Duncan & Quan 2018 | verified | — | (already had DOI) |
| agent-hitl-checkpoints | Parasuraman & Riley 1997 | verified | — | (already had DOI) |
| ai-llm-next-token | Vaswani et al. 2017 | verified | — | (already had arXiv) |
| ai-context-window-lost-middle | Liu et al. 2023 | verified | — | (already had arXiv) |
| ai-automation-bias | Parasuraman & Riley 1997 | verified | — | (already had DOI) |
| agent-workflow-vs-agent | Anthropic, "Building effective agents", 2024 | verified | — | anthropic.com/research/building-effective-agents |
| tech-technical-debt | Cunningham, OOPSLA '92 experience report | verified | — | — (DOI not confirmed) |
| tech-observability | Beyer et al. (eds.), *SRE*, 2016 | **fixed** | The title now names ch. 6 "Monitoring Distributed Systems", where the four golden signals come from. | sre.google/sre-book/monitoring-distributed-systems/ |
| tech-conways-law | Conway 1968, *Datamation* 14(4) | verified | — | — (melconway.com page not confirmed) |

## Still flagged

None. All 8 cards were promoted.

## Follow-ups for a human (low risk, optional)

- **Read the pages behind the new URLs.** The sre.google, meity.gov.in and routledge.com links were confirmed through the search index, not opened, because those hosts are blocked in this environment.
- **comm-bluf-pyramid:** the first-edition year of *The Pyramid Principle* is inconsistent across sources (1985 vs 1987; a 1978 date is also sometimes cited). 1987 is kept because it is a real edition year. Check a library catalogue if an exact first-edition date matters.
- **prod-eisenhower-matrix:** the exact 1954 wording was taken from Quote Investigator's account. The full transcript is on the American Presidency Project ("Address at the Second Assembly of the World Council of Churches", 19 Aug 1954) and should be read before the line is ever shown as a direct quote.
- **inv-margin-of-safety:** the quote is the chapter title as it appears in the later revised editions. Its numbering in the 1949 edition was not confirmed, and the card's note already says so.
- **DOIs that could not be confirmed and were left out:** Sharpe 1966, Asch 1956, Ross 1977 and Cunningham 1992. Add them if someone checks them on Crossref.
