// Uso: node scripts/screenshot-stories.mjs storybook-static <outDir> "<storyId>|<globals>|<width>" ...
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.argv[2], out = process.argv[3], ids = process.argv.slice(4);
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.json':'application/json', '.svg':'image/svg+xml' };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html'); if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(6107);
const b = await chromium.launch();
const requests = new Set();
for (const spec of ids) {
  const [id, globals = '', w = '1280'] = spec.split('|');
  const pg = await b.newPage({ viewport: { width: +w, height: 900 } });
  pg.on('request', (rq) => requests.add(new URL(rq.url()).host));
  pg.on('pageerror', (e) => console.log('PAGEERROR', id, e.message));
  await pg.goto(`http://localhost:6107/iframe.html?id=${id}&viewMode=story${globals ? '&globals=' + globals : ''}`);
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${out}/${id}${globals ? '-' + globals.replace(/[:;]/g, '_') : ''}-${w}.png`, fullPage: true });
  await pg.close();
}
console.log('hosts:', [...requests].join(', '));
await b.close(); srv.close();
