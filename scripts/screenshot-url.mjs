// Uso: node scripts/screenshot-url.mjs <url> <outDir> <name> [width]
import { chromium } from 'playwright';
const [url, out, name, w = '390'] = process.argv.slice(2);
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: +w, height: 844 }, deviceScaleFactor: 1 });
await pg.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await pg.waitForTimeout(1500);
await pg.screenshot({ path: `${out}/${name}.png`, fullPage: true });
console.log(await pg.title(), '|', pg.url());
const links = await pg.locator('a[href]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))].slice(0, 40));
console.log(links.join(' '));
await b.close();
