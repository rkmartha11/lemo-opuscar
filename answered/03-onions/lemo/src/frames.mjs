// Resumable frame render: node answered/03-onions/lemo/src/frames.mjs <clip> [worker] [workers]
// Writes src/out/<clip>_frames/f0000.jpg …, skipping frames already on disk, so a killed render picks up where it stopped.
import fs from 'fs'; import path from 'path';
import { openDemo, closeServer } from '../../../../core/render/page.mjs';
const [clip, wk = '0', nw = '1'] = process.argv.slice(2), W = +wk, N = +nw, FPS = 30;
const here = path.dirname(new URL(import.meta.url).pathname), dir = path.join(here, clip), out = path.join(here, 'out', clip + '_frames');
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openDemo(dir, { w: 1080, h: 1920, q: 'ssaa=1.5' });
page.setDefaultTimeout(0);
const TOTAL = Math.round(await page.evaluate(() => window.DUR) * FPS), t0 = Date.now();
for (let f = W; f < TOTAL; f += N) {
  const fn = path.join(out, `f${String(f).padStart(4, '0')}.jpg`);
  if (fs.existsSync(fn)) continue;
  await page.evaluate(t => window.render(t), f / FPS);
  const buf = await page.screenshot({ type: 'jpeg', quality: 95, timeout: 0 });
  fs.writeFileSync(fn + '.tmp', buf); fs.renameSync(fn + '.tmp', fn);
  console.log(`w${W} f${f}/${TOTAL} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close(); closeServer();
