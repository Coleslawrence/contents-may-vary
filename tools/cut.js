// Finds text that is cut off: ellipsis, clamped, or hidden by an overflow:hidden parent
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const out = []; const errs = [];
  for (const [w, h, big] of [[390, 670, 0], [375, 600, 0], [360, 560, 0], [375, 600, 1]]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(big => localStorage.setItem('cmv-app-prefs-1', JSON.stringify({ text: big ? 'large' : 'normal', motion: 'reduced' })), big);
    await p.goto('http://localhost:8765/'); await p.tap('[data-act=begin]');
    await p.evaluate(() => { S.lvl = 6; S.tier = 'chest'; S.xp = 1300; fitGrid(); ['healing_potion', 'pixie_dust', 'lute', 'ember_wand', 'copper', 'gold_ring', 'bone', 'spellbook', 'shortsword', 'leather', 'rope', 'lockpicks', 'glowcap', 'contract', 'gear'].forEach(id => S.tray.push(mkItem(id))); S.essence.fiend = 3; S.essence.humanoid = 1; autoManage(); for (let i = 0; i < 30; i++) sys('[Message ' + i + ': the System has a lot to say today, and some of it is long enough to wrap onto several lines.]'); S.pending = []; render(); });
    const scan = async (name) => {
      await p.waitForTimeout(30);
      const r = await p.evaluate(() => {
        const bad = []; const vis = el => el.offsetParent && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
        document.querySelectorAll('#app b, #app small, #app span, #app p, #app h2, #app h3, #app em, #app li').forEach(el => {
          if (!vis(el) || !el.textContent.trim() || el.closest('.slist') || el.closest('.tok') || el.closest('[aria-hidden]')) return;
          const cs = getComputedStyle(el);
          if ((cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) bad.push('clipped: ' + el.textContent.trim().slice(0, 40));
          let a = el.parentElement; const r = el.getBoundingClientRect();
          while (a && a.id !== 'app') { const ac = getComputedStyle(a); if (ac.overflowY !== 'visible' && ac.overflowY !== 'auto' && ac.overflowY !== 'scroll') { const ar = a.getBoundingClientRect(); if (r.bottom > ar.bottom + 1 && r.top < ar.bottom) { bad.push('hidden below: ' + el.textContent.trim().slice(0, 40)); break; } } a = a.parentElement; }
        });
        if (document.documentElement.scrollHeight > innerHeight + 1) bad.push('page scrolls');
        return [...new Set(bad)];
      });
      if (r.length) out.push(`${w}x${h}${big ? 'L' : ''} ${name}: ${r.slice(0, 4).join(' | ')}`);
    };
    await scan('home');
    for (const id of ['kobold', 'hesk']) { await p.evaluate(id => { startEncounter(id); render(); }, id); await scan('approach ' + id); await p.evaluate(() => { const e = S.enc; e.phase = 'combat'; e.v.grappled = true; render(); }); await scan('combat ' + id); await p.evaluate(() => { S.enc.v.hp = 0; win(); render(); }); await scan('result ' + id); await p.evaluate(() => { closeEncounter(); S.pending = []; render(); }); }
    for (const v of ['stomach', 'journal']) { await p.evaluate(v => { ui.view = v; render(); }, v); await scan(v); }
    for (const sub of ['stats', 'traits', 'forms', 'titles']) { await p.evaluate(sub => { ui.view = 'self'; ui.sub = sub; render(); }, sub); await scan('mimic ' + sub); }
    for (const s of ['settings', 'howto', 'disguise', 'move', 'evo_branch', 'asi', 'companion', 'timers']) { await p.evaluate(s => { ui.sheet = { t: s }; render(); }, s); await scan('sheet ' + s); }
    await p.evaluate(() => { ui.sheet = { t: 'item', i: S.grid.findIndex(c => c && c.id === 'contract') }; render(); }); await scan('item');
    // pager density: how full is page 1 of the journal?
    const dens = await p.evaluate(() => { ui.sheet = null; ui.view = 'journal'; render(); const box = document.querySelector('.pg-items'); const last = box.lastElementChild; return Math.round(100 * (last.offsetTop + last.offsetHeight - box.firstElementChild.offsetTop) / box.clientHeight); });
    out.push(`${w}x${h}${big ? 'L' : ''} journal page 1 uses ${dens}% of its space`);
    if (w === 375 && !big) { for (const [n, f] of [['approach', () => { ui.view = 'home'; startEncounter('kobold'); render(); }], ['titles', () => { closeEncounter(); ui.view = 'self'; ui.sub = 'titles'; render(); }], ['journal', () => { ui.view = 'journal'; render(); }], ['home', () => { ui.view = 'home'; render(); }]]) { await p.evaluate(f); await p.waitForTimeout(50); await p.screenshot({ path: `Q-${n}.png` }); } }
    await ctx.close();
  }
  console.log(out.join('\n') || 'nothing cut'); console.log('errors', JSON.stringify(errs)); await b.close();
})();
