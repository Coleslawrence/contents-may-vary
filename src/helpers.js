// ===== Streamlined helpers: odds, advice, auto-management, timers =====
function pAtLeast(need, mode, attack) { let p = clamp((21 - need) / 20, 0, 1); if (attack) p = clamp(p, 0.05, 0.95); if (mode > 0) p = 1 - (1 - p) * (1 - p); else if (mode < 0) p = p * p; return p; }
const pct = p => Math.round(p * 100) + '%';
function canSweetFor(d) { return SPEAKERS.includes(d.type) && (ess('humanoid') >= 1 || feat('silver') || (S.companion && S.companion.path === 'reformer')); }
function lureOdds(id) {
  const d = VISITORS[id]; const notes = [];
  if (d.rival) return { p: 0, notes: [{ ok: false, t: 'Another mimic cannot be fooled. It will fight you.' }] };
  const bb = baitBonus(d), sw = canSweetFor(d) ? sweetBonus() : 0, part = S.companion && S.companion.path === 'partner' ? 2 : 0;
  const mode = (ess('fey') >= 2 ? 1 : 0) + (gorged() && FORMS[S.form].skill === 'Stealth' ? -1 : 0);
  const m = disguiseMod(S.form) + bb + sw + part; const pp = d.pp + (d.type === 'humanoid' ? notTier() : 0);
  let p = pAtLeast(pp - m, mode);
  notes.push({ ok: true, t: `Your ${FORMS[S.form].name.toLowerCase()} disguise (+${disguiseMod(S.form)})` });
  if (bb) notes.push({ ok: true, t: `They want your bait (+${bb})` });
  else if (baitItem()) notes.push({ ok: false, t: 'They do not care about your bait' });
  else notes.push({ ok: false, t: 'You have no bait out' });
  if (sw) notes.push({ ok: true, t: `You can sweet talk them (+${sw})` });
  if (part) notes.push({ ok: true, t: 'Wren is helping (+2)' });
  if (d.pp >= 13) notes.push({ ok: false, t: 'They have sharp eyes' });
  if (d.type === 'humanoid' && notTier()) notes.push({ ok: false, t: 'People are on the lookout for you' });
  if (mode < 0) notes.push({ ok: false, t: 'You are too full to stay still' });
  if (d.inv != null) {
    const adv = ((d.chestAdv && S.form === 'chest') || d.alwaysAdv) && !activeHas('hesk_crowbar');
    const det = pAtLeast(10 + disguiseMod(S.form) + guardMod() - d.inv, adv ? 1 : 0); p *= (1 - det);
    notes.push({ ok: false, t: d.alwaysAdv ? 'She pokes every chest with a ten-foot pole' : d.chestAdv && S.form === 'chest' ? 'Thieves check chests extra carefully' : 'They check things carefully before touching' });
  }
  if (d.aggressive) notes.push({ ok: false, t: 'If they spot you, they attack' });
  return { p, notes };
}
function danger(id) {
  const d = VISITORS[id];
  const theirHit = pAtLeast(ac() - d.atk[1], 0, true), theirDPR = theirHit * avg(d.atk[2]) * d.multi;
  const myHit = pAtLeast(d.ac - biteHit(), 0, true); let myDPR = myHit * (4.5 + mod('STR') + biteFlat()) * (S.tier === 'barrel' ? 2 : 1);
  if (canSwallowSize(d.size)) myDPR = Math.max(myDPR, acidAvg() * 0.8 + myDPR * 0.5);
  const r = (d.hp / Math.max(1, myDPR)) / (Math.max(1, S.hp) / Math.max(0.5, theirDPR));
  return r < 0.35 ? { k: 'easy', name: 'Easy' } : r < 0.7 ? { k: 'fair', name: 'Fair fight' } : r < 1.1 ? { k: 'hard', name: 'Hard' } : { k: 'deadly', name: 'Deadly' };
}
function expBite() { let x = 4.5 + mod('STR') + biteFlat(); activeItems().forEach(c => { if (ITEMS[c.id].extraBite) x += avg(ITEMS[c.id].extraBite); }); return x * (S.tier === 'barrel' ? 2 : 1); }
function simpleActions() {
  const e = S.enc, v = e.v, d = vdef(), out = []; if (e.phase !== 'combat') return out;
  const mode = bitesAgainst(v);
  if (v.swallowed) {
    out.push({ k: 'clench', icon: 'squeeze', label: 'Squeeze', sub: `About ${Math.round(acidAvg())} acid damage` });
    out.push({ k: 'brace', icon: 'shield', label: 'Brace', sub: 'Halve the damage they do from inside' });
    out.push({ k: 'spit', icon: 'spit', label: 'Spit out', sub: 'Let them go. They will run' });
    out[0].best = true; return out;
  }
  const w = bestWeapon(); const biteP = pAtLeast(d.ac - biteHit() + (e.poisoned ? 2 : 0), mode, true);
  const wHit = w ? biteHit() + (w.it.hit || 0) : 0, wP = w ? pAtLeast(d.ac - wHit + (e.poisoned ? 2 : 0), mode, true) : 0, wExp = w ? avg(w.it.weapon) + mod('STR') + w.adj : 0;
  const useW = w && wP * wExp > biteP * expBite();
  const atk = useW ? { k: 'weapon', icon: 'sword', label: `Swing the ${w.it.name}`, chance: wP, sub: `About ${Math.round(wExp)} damage` } : { k: 'bite', icon: 'teeth', label: S.tier === 'barrel' ? 'Bite twice' : 'Bite', chance: biteP, sub: `About ${Math.round(expBite() / (S.tier === 'barrel' ? 2 : 1))} damage${S.tier === 'barrel' ? ' each' : ''}` };
  if (globalThis.cmvDetailed) atk.sub += ` · ${sgn(useW ? wHit : biteHit())} vs AC ${d.ac}`;
  out.push(atk);
  const fits = canSwallowSize(d.size);
  const gulp = S.tier === 'doorway' && !e.gulpUsed && !v.grappled;
  if (v.grappled || gulp) {
    const p = 1 - pAtLeast(swallowDC() - d.dex, 0);
    out.push({ k: 'swallow', icon: 'gulp', label: gulp && !v.grappled ? 'Doorway gulp' : 'Swallow', chance: fits && !gorged() ? p : null, sub: !fits ? `Too big for you (${SIZES[d.size].name})` : gorged() ? 'You are too full' : 'Digest them from the inside', disabled: !fits || gorged() });
  }
  if (!v.grappled) out.push({ k: 'tongue', icon: 'tongue', label: 'Grab', chance: pAtLeast(d.ac - biteHit() - [0, 2, 4][ess('plant')], mode, true), sub: fits ? 'Stick them to you, then swallow' : 'Stick them to you so they can\'t run' });
  const b = breathInfo();
  if (b) { const ex = avg(b.expr) + b.flat + b.extra.reduce((a, x) => a + avg(x), 0); out.push({ k: 'breath', icon: 'flame', label: 'Breathe fire', sub: e.breathReady ? `About ${Math.round(ex)} damage, never misses` : 'Recharging. Roll a 5 or 6 each turn', disabled: !e.breathReady, exp: ex }); }
  const pot = S.grid.findIndex(c => c && ITEMS[c.id].use === 'heal');
  if (pot >= 0) { const n = S.grid.filter(c => c && ITEMS[c.id].use === 'heal').length; out.push({ k: 'potion', cell: pot, icon: 'potion', label: 'Drink a potion', sub: `Heal about ${Math.round(avg(ITEMS[S.grid[pot].id].heal))} · ${n} left` }); }
  const dust = S.grid.findIndex(c => c && ITEMS[c.id].use === 'blind'); if (dust >= 0) out.push({ k: 'dust', cell: dust, icon: 'sparkle', label: 'Sneeze pixie dust', sub: 'They miss more for 2 turns' });
  const lute = S.grid.findIndex(c => c && ITEMS[c.id].use === 'charm'); if (lute >= 0 && !e.used.lute) out.push({ k: 'lute', cell: lute, icon: 'note', label: 'Play the lute', chance: pAtLeast(10 + d.wis - mod('CHA') - prof(), 0), sub: 'They lose a turn' });
  out.push({ k: 'retreat', icon: 'lock', label: 'Slam shut', sub: 'Escape the fight. They tell people' });
  // advice
  let best = null; const by = k => out.find(a => a.k === k && !a.disabled);
  if (pot >= 0 && S.hp <= maxHp() * 0.3) best = by('potion');
  if (!best && v.grappled && fits) best = by('swallow');
  if (!best && b && e.breathReady && (by('breath') || {}).exp > atk.chance * expBite()) best = by('breath');
  if (!best && !v.grappled && fits && !gorged()) best = by('tongue');
  if (!best && S.hp <= maxHp() * 0.25 && pot < 0 && ['hard', 'deadly'].includes(danger(e.vid).k)) best = by('retreat');
  if (!best) best = out[0];
  if (best) best.best = true;
  return out;
}

// --- stomach looks after itself ---
const GROUP_ORDER = ['blade', 'blunt', 'monstrosity', 'arcane', 'fire', 'elemental', 'gold', 'dragon', 'bone', 'armor', 'construct', 'tool', 'holy', 'food', 'potion', 'music', 'paper', 'cloth', 'junk', 'cursed'];
const FIRE_ORDER = { ember_core: 0, ember_wand: 1, spellbook: 2 };
function groupOf(id) { if (id in FIRE_ORDER) return 'arcane'; const t = ITEMS[id].tags; for (const g of GROUP_ORDER) if (t.includes(g)) return g; return 'junk'; }
function autoArrange() {
  fitGrid(); const items = S.grid.filter(Boolean);
  items.sort((a, b) => GROUP_ORDER.indexOf(groupOf(a.id)) - GROUP_ORDER.indexOf(groupOf(b.id)) || ((FIRE_ORDER[a.id] ?? 9) - (FIRE_ORDER[b.id] ?? 9)) || a.id.localeCompare(b.id));
  S.grid = new Array(cellCount()).fill(null); items.forEach((c, i) => S.grid[i] = c);
}
function autoManage(msgs) {
  msgs = msgs || [];
  let guard = 0; while (fusable().length && guard++ < 10) fuse(fusable()[0], msgs);
  fitGrid(); while (S.tray.length && firstEmpty() >= 0) placeFromTray(0, firstEmpty());
  S.grid.forEach(c => { if (c && ITEMS[c.id].attune && !isAttuned(c.uid) && S.attuned.length < 3) { S.attuned.push(c.uid); msgs.push({ text: `[Attuned: ${ITEMS[c.id].name}. It is working now.]`, cls: 'level' }); if (S.bait === c.uid) S.bait = null; } });
  if (!globalThis.cmvDetailed) autoArrange(); onGridChange();
  if (!S.bait) { const cands = S.grid.filter(c => c && !isAttuned(c.uid) && ITEMS[c.id].tags.some(t => TAG_WANT[t])); cands.sort((a, b) => (ITEMS[b.id].bait || 0) - (ITEMS[a.id].bait || 0)); if (cands[0]) S.bait = cands[0].uid; }
  msgs.forEach(m => sys(m.text, m.cls));
  return msgs;
}

// --- timers: everything time-based, as ms left and a total ---
function timersList(now) {
  const since = (now - (S.lastTick || now)) / 60000; const out = [];
  if (S.digest) out.push({ id: 'digest', short: 'Digest', icon: 'gut', label: `Digesting ${ITEMS[S.digest.item.id].name}`, left: S.digest.left - since * 60000, total: S.digest.dur, sub: `Becomes: ${digestGain(S.digest.item.id)}` });
  const rate = feat('glutton') ? 22 : 15;
  if (S.belly > 0) { const next = Math.max(0, ((1 - S.bellyAcc) * rate - since) * 60000); out.push({ id: 'belly', short: 'Hungry', icon: 'belly', label: 'Belly goes down by 1', left: next, total: rate * 60000, sub: `Empty in ${fmtDur(next + (S.belly - 1) * rate * 60000)}` }); }
  else out.push({ id: 'belly', short: 'Starving', icon: 'belly', label: 'Starving', left: 0, total: 1, sub: 'You heal at half speed. Eat something.', warn: true });
  const mh = maxHp();
  if (S.hp < mh) { const regen = (S.companion && S.companion.path === 'pet' ? 2 : 1) * (starving() ? 0.5 : 1); const perMin = mh * 0.02 * regen; const need = mh - S.hp - (S.hpAcc || 0); const left = Math.max(0, (need / perMin - since) * 60000); out.push({ id: 'hp', short: 'Healed', icon: 'heart', label: 'Fully healed', left, total: (mh / perMin) * 60000, sub: 'Or Rest now for 1 belly' }); }
  if (S.naps < 3) { const left = Math.max(0, 20 * 60000 - (now - S.napAt)); out.push({ id: 'nap', short: 'Nap', icon: 'moon', label: `Next nap (${S.naps}/3 ready)`, left, total: 20 * 60000 }); }
  if (S.notoriety > 0) { const nt = notTier(), thr = [0, 25, 50, 80][nt]; const next = Math.max(0, ((1 - S.notAcc) * 30 - since) * 60000); const pts = nt > 0 ? S.notoriety - thr : S.notoriety - 1; out.push({ id: 'not', short: 'Fame', icon: 'eye', label: nt > 0 ? `Cools down to ${NOT_NAMES[nt - 1]}` : 'Forgotten completely', left: next + Math.max(0, pts) * 30 * 60000, total: (Math.max(0, pts) + 1) * 30 * 60000, sub: `Notoriety ${S.notoriety}. Moving somewhere new cools it faster.` }); }
  return out;
}
function digestGain(id) { const it = ITEMS[id]; const g = it.tags.map(t => DIGEST_TAGS[t] && dt(t) < DIGEST_TAGS[t].max ? `${DIGEST_TAGS[t].name} (${DIGEST_TAGS[t].each})` : TYPES.includes(t) ? `${TYPE_NAME[t]} essence` : null).filter(Boolean); if (id === 'spellbook' && !S.forms.includes('bookshelf')) g.push('the Bookshelf form'); return g.length ? g.join(', ') : it.tags.includes('junk') ? 'nothing at all' : 'nothing new (already maxed)'; }
function fmtDur(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(x).padStart(2, '0')}`; }
