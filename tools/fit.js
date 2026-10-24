const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = []; const fails = [];
  for (const [w, h, big] of [[390, 670, 0], [375, 600, 0], [360, 560, 0], [390, 670, 1], [375, 600, 1]]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(big => localStorage.setItem('cmv-app-prefs-1', JSON.stringify({ text: big ? 'large' : 'normal', motion: 'reduced' })), big);
    await p.goto('http://localhost:8765/'); await p.waitForTimeout(100);
    const tag = `${w}x${h}${big ? 'L' : ''}`;
    const check = async (name) => {
      await p.waitForTimeout(40);
      const r = await p.evaluate(() => {
        const bad = [];
        if (document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1) bad.push('page scrolls');
        document.querySelectorAll('#app, main, main .panel, .view, .vbody, .sheet, .sh-b, .pg-items, .pg, .sh-f').forEach(c => {
          if (!c.offsetParent && c.id !== 'app') return; const cr = c.getBoundingClientRect();
          [...c.children].forEach(ch => { if (!ch.offsetParent || getComputedStyle(ch).position === 'absolute' || getComputedStyle(ch).position === 'fixed') return; const r = ch.getBoundingClientRect(); if (r.height && r.bottom > cr.bottom + 1.5) bad.push(`${(c.className || c.id).toString().split(' ')[0]} > ${(ch.className || ch.tagName).toString().split(' ').slice(0, 2).join('.')} spills ${Math.round(r.bottom - cr.bottom)}px`); });
        });
        return bad;
      });
      if (r.length) fails.push(`${tag} ${name}: ${[...new Set(r)].join('; ')}`);
    };
    await check('intro');
    await p.tap('[data-act=begin]');
    await p.evaluate(() => {
      S.lvl = 6; S.tier = 'chest'; S.xp = 1300; fitGrid();
      ['healing_potion', 'pixie_dust', 'lute', 'ember_wand', 'copper', 'gold_ring', 'bone', 'bone', 'spellbook', 'shortsword', 'leather', 'rope', 'lockpicks', 'glowcap', 'contract', 'gear', 'map_scrap'].forEach(id => S.tray.push(mkItem(id)));
      S.essence.fiend = 3; S.essence.beast = 9; S.essence.undead = 4; S.dtraits.blade = 2; autoManage();
      for (let i = 0; i < 4; i++) S.tray.push(mkItem('wet_sock'));
      for (let i = 0; i < 40; i++) sys('[Test message number ' + i + '. The System has a lot to say today, as usual, and some of it is quite long so it wraps.]', i % 5 ? 'sys' : 'bad');
      S.digest = { item: mkItem('bone'), start: Date.now(), left: 90000, dur: 120000 }; S.hp = 20; S.notoriety = 40; S.naps = 1; S.napAt = Date.now() - 60000; S.titles.first_bite = 1;
      S.pending = []; render();
    });
    await check('home');
    for (const s of ['settings', 'howto', 'disguise', 'move', 'timers', 'full', 'reset', 'max', 'evo_chest', 'evo_branch', 'asi', 'companion']) {
      await p.evaluate(s => { ui.sheet = { t: s }; ui.pages = {}; render(); }, s); await check('sheet ' + s);
    }
    await p.evaluate(() => { ui.sheet = { t: 'disguise' }; ui.dtab = 'bait'; render(); }); await check('disguise bait');
    await p.evaluate(() => { ui.sheet = { t: 'asi' }; ui.atab = 'feat'; render(); }); await check('asi feats');
    await p.evaluate(() => { const r = simulate(300, true); ui.sheet = { t: 'report', r }; render(); }); await check('report');
    await p.evaluate(() => { ui.sheet = { t: 'item', i: S.grid.findIndex(c => c && c.id === 'ember_wand') }; render(); }); await check('item');
    await p.evaluate(() => { ui.sheet = null; ui.view = 'stomach'; render(); }); await check('stomach');
    for (const sub of ['stats', 'traits', 'forms', 'titles']) { await p.evaluate(sub => { ui.view = 'self'; ui.sub = sub; render(); }, sub); await check('mimic ' + sub); }
    await p.evaluate(() => { ui.view = 'journal'; render(); }); await check('journal');
    const pages = await p.evaluate(() => document.querySelector('.pgn') && document.querySelector('.pgn').textContent);
    if (await p.$('.pgb[data-d="1"]:not([disabled])')) { await p.tap('.pgb[data-d="1"]'); await check('journal p2'); }
    await p.evaluate(() => { ui.view = 'home'; render(); });
    for (const id of ['hesk', 'goblin', 'ogre']) {
      await p.evaluate(id => { startEncounter(id); render(); }, id); await check('approach ' + id);
      await p.evaluate(() => { const e = S.enc; e.phase = 'combat'; e.v.grappled = true; e.log.push({ text: '[Surprise round. You attack with advantage.]', cls: 'sys' }); e.dice = { label: 'Bite', r: { r: 15, mode: 1, a: 15, b: 3 }, mod: 4, total: 19, vs: 13, vsLabel: 'AC', ok: true }; e.dice2 = e.dice; render(); }); await check('combat ' + id);
      await p.evaluate(() => { ui.sheet = { t: 'moves' }; render(); }); await check('moves ' + id); await p.evaluate(() => { ui.sheet = null; });
      await p.evaluate(() => { S.enc.v.hp = 0; win(); render(); }); await check('result ' + id);
      await p.evaluate(() => { closeEncounter(); S.pending = []; render(); });
    }
    if (w === 375 && !big) for (const [nm, fn] of [['home', () => { ui.view = 'home'; render(); }], ['stomach', () => { ui.view = 'stomach'; render(); }], ['journal', () => { ui.view = 'journal'; render(); }], ['bait', () => { ui.sheet = { t: 'disguise' }; ui.dtab = 'bait'; render(); }], ['combat', () => { ui.sheet = null; ui.view = 'home'; startEncounter('goblin'); S.enc.phase = 'combat'; S.enc.v.grappled = true; render(); }]]) { await p.evaluate(fn); await p.waitForTimeout(60); await p.screenshot({ path: `P-${nm}.png` }); }
    await ctx.close();
  }
  console.log(fails.length ? fails.join('\n') : 'NO OVERFLOW ANYWHERE'); console.log('errors', JSON.stringify([...new Set(errs)]));
  await b.close();
})();
