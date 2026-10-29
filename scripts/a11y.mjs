// Runs axe-core against key screens (light + dark). Usage: node scripts/a11y.mjs [baseUrl]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSrc = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.argv[2] ?? 'http://localhost:5173/';
const profile = { state: { profile: { id: 'u1', displayName: 'A11y', interests: ['investing', 'leadership', 'ai'], rankedInterests: ['investing', 'leadership', 'ai'], topicDifficulty: {}, learningGoals: ['manager'], dailyTargetMinutes: 15, preferredStyles: ['mixed'], serendipityFrequency: 'sometimes', personalizationEnabled: true, theme: 'light', createdAt: 'x', updatedAt: 'x' }, theme: 'light', interactions: [], likedIds: [], collections: [{ id: 'col-default-0', name: 'Investing Playbook', description: '', cardIds: ['bf-loss-aversion-panic'], isDefault: true, createdAt: 'x', updatedAt: 'x' }], sessions: [], searchHistory: [], gymResults: [], reflections: [], continuedDays: [], finishedDays: [] }, version: 1 };
const pages = ['#/welcome', '#/feed', '#/card/inv-active-vs-passive', '#/search?q=risk', '#/gym/gym-market-drop', '#/shelf', '#/shelf/col-default-0', '#/map', '#/complete', '#/settings', '#/history', '#/session', '#/collide', '#/topics', '#/about', '#/onboarding'];
const browser = await chromium.launch();
let total = 0;
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route(/fonts\./, (r) => r.abort());
  await page.goto(base);
  for (const p of pages) {
    const state = p === '#/welcome' || p === '#/onboarding' ? { ...profile, state: { ...profile.state, profile: null, theme } } : { ...profile, state: { ...profile.state, theme } };
    await page.evaluate((s) => localStorage.setItem('stackwise:v1', JSON.stringify(s)), state);
    await page.goto(base + p);
    await page.reload();
    await page.waitForTimeout(400);
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] }));
    const v = res.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical' || x.id === 'color-contrast');
    total += v.length;
    console.log(`${theme.padEnd(5)} ${p.padEnd(32)} [${res.passes.length} rules passed] ${v.length ? v.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0].target}`).join('; ') : 'ok'}`);
  }
  await page.close();
}
await browser.close();
console.log(total ? `\n${total} issue groups` : '\nNo serious accessibility violations');
process.exit(total ? 1 : 0);
