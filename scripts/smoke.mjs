// Browser smoke test of the critical flows. Usage: node scripts/smoke.mjs [baseUrl] [shotDir]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] ?? 'http://localhost:5173/';
const shots = process.argv[3] ?? './smoke-shots';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(10000);
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text()) && errors.push('console: ' + m.text()));
// The load screen (#splash) stays up for ~1s after each full page load; wait it out before capturing.
const shot = async (n) => { await page.waitForSelector('#splash', { state: 'detached' }); await page.screenshot({ path: `${shots}/${n}.png` }); };
const step = async (name, fn) => { try { await fn(); console.log('✓', name); } catch (e) { console.log('✗', name, e.message.split('\n')[0]); errors.push(name); } };

await page.goto(base);
await step('welcome', async () => { await page.getByRole('link', { name: /Set up my feed/ }).waitFor(); await shot('01-welcome'); });
await step('onboarding', async () => {
  await page.getByRole('link', { name: /Set up my feed/ }).click();
  await page.getByLabel(/What should we call you/).fill('Sudarsanan');
  for (const t of ['Investing', 'People management', 'Leadership', 'Artificial intelligence', 'Customer-support leadership', 'Behavioral finance']) await page.getByRole('button', { name: t, exact: true }).click();
  await shot('02-interests');
  await page.getByRole('button', { name: 'Continue' }).click(); // rank
  await page.getByRole('button', { name: /Move Leadership up/ }).click();
  await shot('03-rank');
  await page.getByRole('button', { name: 'Continue' }).click(); // depth
  await page.getByRole('radio', { name: 'Intermediate' }).first().click();
  await page.getByRole('button', { name: 'Continue' }).click(); // target
  await page.getByRole('radio', { name: /^15 min/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // style
  await page.getByRole('button', { name: /Practical/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // goals
  await page.getByRole('button', { name: 'Become a stronger manager' }).click();
  await page.getByRole('button', { name: 'Lead support operations more effectively' }).click();
  await page.getByRole('button', { name: 'Continue' }).click(); // serendipity
  await page.getByRole('button', { name: 'Continue' }).click(); // personalisation
  await shot('04-personalisation');
  await page.getByRole('button', { name: 'Start my first session' }).click();
  await page.getByText('Your first session').waitFor();
  await shot('05-session-step1');
});
await step('first session', async () => {
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('What would you do?').waitFor();
  await page.locator('input[type=radio]').first().check();
  await page.getByRole('button', { name: 'Lock in my choice' }).click();
  await page.getByRole('button', { name: 'Show the trade-offs' }).click();
  await page.getByRole('button', { name: 'What principles apply?' }).click();
  await page.getByRole('button', { name: 'Reflect' }).click();
  await shot('06-gym-reflect');
  await page.getByRole('radio', { name: 'Not sure' }).check();
  await page.getByRole('button', { name: 'Complete scenario' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('textbox').fill('Check the process before blaming a person.');
  await page.getByRole('button', { name: 'Complete session' }).click();
  await page.getByRole('heading', { name: 'Session complete' }).waitFor();
  await shot('07-session-done');
});
await step('feed', async () => {
  await page.getByRole('link', { name: 'Go to feed' }).click();
  await page.locator('[data-card-id]').first().waitFor();
  await shot('08-feed');
  const n = await page.locator('[data-card-id]').count();
  console.log('  cards in first batch:', n);
});
await step('like/save/skip/why', async () => {
  const first = page.locator('[data-card-id]').first();
  await first.getByRole('button', { name: 'Like' }).click();
  await first.getByRole('button', { name: 'Save' }).click();
  await first.getByRole('button', { name: 'Why am I seeing this?' }).click();
  await shot('09-why');
  await first.getByRole('button', { name: 'Skip' }).click();
});
await step('explore deeper', async () => {
  await page.locator('[data-card-id]').nth(1).getByRole('link', { name: 'Deeper' }).click();
  await page.getByText('Explain it back').waitFor();
  await page.getByLabel('Your explanation').fill('Losses feel bigger than gains, so people sell in a decline. Writing a plan in advance helps you hold.');
  await page.getByRole('button', { name: 'Check my explanation' }).click();
  await shot('10-detail');
});
await step('search', async () => {
  await page.goto(base + '#/search?q=loss%20aversion');
  await page.getByText(/results? for/).waitFor();
  await shot('11-search');
});
await step('shelf & collections', async () => {
  await page.goto(base + '#/shelf');
  await page.getByPlaceholder('New collection name').fill('For my team');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('link', { name: /For my team/ }).waitFor();
  await shot('12-shelf');
});
await step('map', async () => { await page.goto(base + '#/map'); await page.getByRole('heading', { name: 'Weekly knowledge map' }).waitFor(); await shot('13-map'); });
await step('gym list', async () => { await page.goto(base + '#/gym'); await page.getByRole('heading', { name: 'Decision Gym' }).waitFor(); });
await step('settings', async () => { await page.goto(base + '#/settings'); await page.getByText('How scoring works').waitFor(); await shot('14-settings'); });
await step('complete page', async () => { await page.goto(base + '#/complete'); await page.getByText('One question to sit with').waitFor(); await shot('15-complete'); });
await step('collide', async () => { await page.goto(base + '#/collide'); await page.getByRole('button', { name: /Reveal/ }).click(); await shot('16-collide'); });
await step('persistence after reload', async () => {
  await page.reload();
  await page.goto(base + '#/profile');
  await page.getByRole('heading', { name: 'Sudarsanan' }).waitFor();
});
await step('dark mode', async () => {
  await page.goto(base + '#/feed');
  await page.getByRole('button', { name: /Switch to dark mode/ }).click();
  await page.reload();
  const dark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (!dark) throw new Error('dark not persisted');
  await page.locator('[data-card-id]').first().waitFor();
  await shot('17-feed-dark');
});
await step('desktop layout', async () => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto(base + '#/feed');
  await page.locator('[data-card-id]').first().waitFor();
  await shot('18-desktop');
});
await step('daily guardrail', async () => {
  await page.goto(base + '#/settings');
  await page.getByRole('radio', { name: '5 min', exact: true }).click();
  await page.goto(base + '#/feed');
  await page.getByRole('heading', { name: /reached today's target/ }).waitFor();
  await shot('19-guardrail');
  await page.getByRole('button', { name: 'Continue intentionally' }).click();
  await page.getByText('Daily target complete.').waitFor();
  await page.locator('[data-card-id]').first().waitFor();
  await shot('20-continued');
});
await browser.close();
console.log(errors.length ? `\nERRORS:\n${errors.join('\n')}` : '\nNo runtime errors');
process.exit(errors.length ? 1 : 0);
