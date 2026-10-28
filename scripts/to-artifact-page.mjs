// Turns dist-artifact/index.html into a body-only page (no doctype/html/head/body tags)
// for hosts that supply their own document skeleton. Usage: node scripts/to-artifact-page.mjs <out>
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-artifact/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const keepHead = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .replace(/<meta name="theme-color"[^>]*>/gi, '');
const title = keepHead.match(/<title>[\s\S]*?<\/title>/)[0];
const rest = keepHead.replace(title, '');
// Scripts move after the root element so the module finds #root.
const scripts = [...rest.matchAll(/<script\b[\s\S]*?<\/script>/g)].map((m) => m[0]);
const nonScript = scripts.reduce((s, sc) => s.replace(sc, ''), rest);
writeFileSync(process.argv[2], `${title}\n${nonScript.trim()}\n${body.trim()}\n${scripts.join('\n')}\n`);
console.log('wrote', process.argv[2]);
