// Simulates players checking in over real days. Usage: node tools/pace.js [runs] [days]
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync('src/engine.js', 'utf8') + '\n' + fs.readFileSync('src/helpers.js', 'utf8') +
  '\n;globalThis.E = { get S() { return S }, newGame, nextArrival, startEncounter, actLure, actLetPass, actLunge, finish, closeEncounter, simulate, chooseCompanion, applyAsi, evolveTo, autoManage, startDigest, eatItem, rest, moveTo, retreat, simpleActions, playerAction, danger, gorged, maxHp, bellyCap, BRANCHES, VISITORS, ITEMS, REGIONS, XP_AT, tickNaps, nap };';
const ctx = { console, Math, JSON, Date: { now: () => ctx.NOW }, globalThis: null }; ctx.globalThis = ctx; ctx.NOW = 0;
vm.createContext(ctx); vm.runInContext(src, ctx); const E = ctx.E;
const runs = +process.argv[2] || 30, days = +process.argv[3] || 16;
const SESS = [8 * 60, 12.5 * 60, 18 * 60, 22 * 60]; // minutes past midnight
const agg = { reach: {}, deaths: 0, fights: 0, wins: 0, retreats: 0, byRegion: {}, perDay: [] };
for (let g = 0; g < runs; g++) {
  ctx.NOW = Date.UTC(2026, 0, 1, 8); E.newGame('Bot'); let S = E.S; let last = ctx.NOW;
  for (let day = 0; day < days; day++) for (const m of SESS) {
    const t = Date.UTC(2026, 0, 1) + day * 864e5 + m * 6e4; if (t <= last) continue;
    const away = Math.min(480, (t - last) / 6e4); ctx.NOW = t; S = E.S; E.tickNaps(t);
    E.simulate(away, true); E.autoManage();
    // a session: up to 25 minutes of play
    const end = t + 25 * 6e4; let fights = 0;
    while (ctx.NOW < end && fights < 15) {
      while (S.pending.length) { const p = S.pending.shift(); if (p === 'asi') E.applyAsi(['STR', 'CON', 'CHA', 'DEX'][S.lvl % 4]); if (p === 'evo_chest') E.evolveTo('chest'); if (p === 'evo_branch') E.evolveTo(E.BRANCHES[g % 4]); }
      if (!S.digest) { const i = S.grid.findIndex(c => c && ['wet_sock', 'salt', 'contract', 'spellbook', 'bone', 'rusty_dagger', 'map_scrap', 'leather'].includes(c.id)); if (i >= 0) E.startDigest(i); }
      if (S.hp < E.maxHp() * 0.5 && S.belly >= 1) E.rest();
      if (E.gorged()) { if (S.naps > 0) { E.nap(); E.autoManage(); ctx.NOW += 6e4; continue; } break; }
      const best = S.regions.filter(r => r !== 'vault' && S.lvl >= E.REGIONS[r].lvl + 1).slice(-1)[0] || 'f1'; if (best !== S.region && S.belly >= 1) E.moveTo(best);
      const id = E.nextArrival(); const enc = E.startEncounter(id); ctx.NOW += 6e4;
      if (enc.companion) { E.chooseCompanion(['partner', 'pet', 'reformer', 'partner'][g % 4]); continue; }
      const dz = E.danger(id).k;
      if (dz === 'deadly') { E.actLetPass(); E.closeEncounter(); continue; }
      E.actLure(); if (S.enc.phase === 'missed') { if (dz === 'easy') E.actLunge(); else { E.finish('missed'); } }
      let guard = 0;
      while (S.enc.phase === 'combat' && guard++ < 60) { const A = E.simpleActions().filter(a => !a.disabled); const a = A.find(x => x.best) || A[0]; if (a.k === 'retreat') { E.retreat(); agg.retreats++; break; } E.playerAction(a.k, a.cell); }
      fights++; agg.fights++; const r = S.enc.result; if (r === 'eaten' || r === 'digested') agg.wins++; if (r === 'shattered') agg.deaths++;
      const br = agg.byRegion[S.region] = agg.byRegion[S.region] || { n: 0, w: 0 }; br.n++; if (r === 'eaten' || r === 'digested') br.w++;
      E.closeEncounter(); E.autoManage();
    }
    last = ctx.NOW;
    for (let l = 2; l <= S.lvl; l++) { const k = 'L' + l; if (!(agg.reach[k] && agg.reach[k][g] != null)) { agg.reach[k] = agg.reach[k] || []; agg.reach[k][g] = day + m / 1440; } }
  }
}
const med = a => { const v = a.filter(x => x != null).sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)].toFixed(1) : '-'; };
console.log('Median day reached (of', runs, 'players, 4 check-ins a day):');
console.log(Object.keys(agg.reach).sort((a, b) => +a.slice(1) - +b.slice(1)).map(k => `${k} day ${med(agg.reach[k])} (${agg.reach[k].filter(x => x != null).length}/${runs})`).join('  '));
console.log(`fights ${agg.fights} (${(agg.fights / runs / days).toFixed(1)} a day), win ${Math.round(100 * agg.wins / agg.fights)}%, shattered ${agg.deaths}, retreats ${agg.retreats}`);
console.log('win rate by area', JSON.stringify(Object.fromEntries(Object.entries(agg.byRegion).map(([k, v]) => [k, Math.round(100 * v.w / v.n) + '% of ' + v.n]))));
// ---- balance targets: the build fails if these drift ----
const day = k => +med(agg.reach[k] || []);
const T = [
  ['Level 3 on day 1', day('L3') <= 1],
  ['Tier 3 evolution (level 6) on days 2 to 5', day('L6') >= 2 && day('L6') <= 5],
  ['Level 10 in 7 to 14 days', day('L10') >= 7 && day('L10') <= 14],
  ['10 to 25 fights a day', agg.fights / runs / days >= 10 && agg.fights / runs / days <= 25],
  ['Win rate 85% to 98%', agg.wins / agg.fights >= 0.85 && agg.wins / agg.fights <= 0.985],
  ['Under 1 shatter per player per week', agg.deaths / runs / (days / 7) < 1],
  ['Every visited area wins at least 75%', Object.values(agg.byRegion).every(v => v.n < 20 || v.w / v.n >= 0.75)],
];
T.forEach(([n, ok]) => console.log((ok ? 'PASS ' : 'FAIL ') + n));
process.exitCode = T.every(t => t[1]) ? 0 : 1;
