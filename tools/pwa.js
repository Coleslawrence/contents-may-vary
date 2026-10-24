const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/'); await p.waitForTimeout(800);
  const man = await p.evaluate(async () => { const r = await fetch('manifest.webmanifest'); return { ok: r.ok, json: (await r.json()).name }; });
  const sw = await p.evaluate(async () => { const reg = await navigator.serviceWorker.ready; return !!reg.active; });
  await p.tap('[data-act=begin]'); await p.evaluate(() => { S.grid[1] = mkItem('rope'); save(); });
  const code = await p.evaluate(() => saveCode());
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(500);
  const offline = await p.evaluate(() => !!document.querySelector('[data-act=wait]') && S && S.name);
  await ctx.setOffline(false);
  // save code round trip in a fresh context (like a new device)
  const ctx2 = await b.newContext({ ...devices['iPhone 13'] }); const p2 = await ctx2.newPage(); await p2.goto('http://localhost:8765/'); await p2.waitForTimeout(400);
  await p2.tap('.linkbtn[data-s=import]'); await p2.fill('#imp', code); await p2.tap('[data-act=restore]'); await p2.waitForTimeout(200);
  const restored = await p2.evaluate(() => S && S.name + ' ' + S.grid.filter(Boolean).map(c => c.id).join(','));
  await p2.evaluate(() => { ui.sheet = { t: 'import' }; render(); }); await p2.fill('#imp', 'nonsense'); await p2.tap('[data-act=restore]'); const err = await p2.textContent('#imperr');
  console.log(JSON.stringify({ manifest: man, serviceWorker: sw, worksOffline: offline, restored, badCodeMessage: err, errors: errs }));
  await b.close();
})();
