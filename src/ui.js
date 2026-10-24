// ===== Contents May Vary: Snack Size — interface =====
const app = document.getElementById('app');
const SAVE_KEY = 'cmv-app-save-1', PREF_KEY = 'cmv-app-prefs-1';
const ui = { view: 'home', sheet: null, anim: null, keepScroll: false, pages: {}, breaks: {}, bsig: {}, bh: {} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const prefs = Object.assign({ text: 'normal', motion: 'full', depth: 'simple', theme: 'system', layout: 'fit' }, lsGet(PREF_KEY) || {}); prefs.layout = 'fit';
const LAYOUTS = { fit: ['One screen', 'Nothing scrolls while you play. The scene shrinks to make room, timers become chips, and extra moves tuck into a sheet.'], scroll: ['Scrolling page', 'Everything is one long page that scrolls together. Your stats stay pinned to the top.'], drawer: ['Pull-up drawer', 'The scene fills the screen and your controls sit in a drawer. Drag the handle up for more, down to see the scene.'] };
function applyPrefs() { const r = document.documentElement; prefs.dice = prefs.depth === 'detailed' ? 'detailed' : 'simple'; globalThis.cmvDetailed = prefs.depth === 'detailed'; ['fit', 'scroll', 'drawer'].forEach(l => r.classList.toggle('lay-' + l, prefs.layout === l)); r.classList.toggle('big', prefs.text === 'large'); r.classList.toggle('calm', prefs.motion === 'reduced'); if (prefs.theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', prefs.theme); }
applyPrefs();

/*ART*/

// ---------- Icons: one stroke style, 24px grid ----------
const IP = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  belly: '<path d="M15.5 4.5a4.5 4.5 0 0 1 2 8.6L10 20.5a2.5 2.5 0 0 1-3.5-3.5l7.4-7.5a4.5 4.5 0 0 1 1.6-5z"/><path d="M6.5 17 4 19.5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  teeth: '<path d="M3 8h18v4H3zM3 12l2.25 4 2.25-4 2.25 4 2.25-4 2.25 4 2.25-4 2.25 4L21 12M3 8l2.25-3 2.25 3 2.25-3 2.25 3 2.25-3 2.25 3 2.25-3L21 8"/>',
  tongue: '<path d="M4 8h16M9 8v5a3 3 0 0 0 6 0V8"/><path d="M12 8v4"/>',
  gulp: '<path d="M4 10a8 5 0 0 0 16 0"/><path d="M12 2v9m-3-3 3 3 3-3"/><path d="M7 17a5 4 0 0 0 10 0"/>',
  squeeze: '<path d="M7 4v16M17 4v16M10 9l-3 3 3 3M14 9l3 3-3 3"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.8 7.5 9.5 4.3-1.7 7.5-4.9 7.5-9.5V6z"/>',
  spit: '<path d="M3 12h10M9 8l4 4-4 4"/><circle cx="17" cy="9" r="1.2"/><circle cx="20" cy="13" r="1.2"/><circle cx="17" cy="16" r="1.2"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.4 2.6-5 3.5-8.5 1.6 1.4 2.4 3 2.4 4.6 1-1 1.6-2.2 1.8-3.8 2.5 2 5.3 4.8 5.3 7.7 0 3.4-2.6 6-6.5 6z"/>',
  potion: '<path d="M9.5 3h5M10 3v5L5.5 16.5A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.7-4.5L14 8V3"/><path d="M7.5 14h9"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  note: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.6"/>',
  mask: '<path d="M3 7c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0 0 7-3 11-6 11-1.4 0-2.2-1.5-3-3-.8 1.5-1.6 3-3 3-3 0-6-4-6-11z"/><path d="M7 11h2.5M14.5 11H17"/>',
  map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M9.5 9.5h3.7a1.6 1.6 0 0 1 0 3.2h-2.4a1.6 1.6 0 0 0 0 3.2h3.7"/>',
  sword: '<path d="M14.5 3H21v6.5L10 20.5 3.5 14z"/><path d="m6.5 13.5 4 4M3 21l2.5-2.5"/>',
  bone: '<path d="M7.5 4.5a2.5 2.5 0 0 0-2 4l10 10a2.5 2.5 0 1 0 4-2 2.5 2.5 0 1 0-2-4l-10-10a2.5 2.5 0 0 0-4 2"/>',
  scroll: '<path d="M7 4h11a2 2 0 0 1 2 2v1h-3M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7"/><path d="M9 9h6M9 13h6M9 17h4"/>',
  cloth: '<path d="M8 3 3.5 6.5 6 10l2-1v12h8V9l2 1 2.5-3.5L16 3c-.8 1.5-2.2 2.5-4 2.5S8.8 4.5 8 3z"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-6 4 4 0 0 1 0 4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  skull: '<path d="M12 3a7.5 7.5 0 0 0-5 13v3h10v-3a7.5 7.5 0 0 0-5-13z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10.5 19v-2M13.5 19v-2"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5V14"/><circle cx="12" cy="17" r=".6"/>',
  scale: '<path d="M12 3c4 2 6 5 6 9s-2.5 7-6 9c-3.5-2-6-5-6-9s2-7 6-9z"/><path d="M8.5 9.5 12 12l3.5-2.5M8 14l4 3 4-3"/>',
  tooth: '<path d="M7 3c-2 0-3.5 1.6-3.5 4 0 3 1.5 4 2 7 .5 3.5 1 7 2.5 7s1.5-4 4-4 2.5 4 4 4 2-3.5 2.5-7c.5-3 2-4 2-7 0-2.4-1.5-4-3.5-4-2 0-3 1.2-5 1.2S9 3 7 3z"/>',
  door: '<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M3 21h18"/><circle cx="15" cy="12.5" r="1"/>',
  bag: '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  chest: '<path d="M3 10a9 5 0 0 1 18 0v10H3z"/><path d="M3 12h18"/><rect x="10" y="10.5" width="4" height="4" rx="1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  up: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  run: '<circle cx="14" cy="4.5" r="1.8"/><path d="m6 21 3.5-5 3 2V13l-3-3-3 2M12.5 13l3 1.5 3-1M9.5 10l3-1.5 2 3"/>',
  gut: '<path d="M8 3c-3 1-4 4-3 6.5S9 12 8.5 15s1.5 6 5 6 5.5-3 4-5.5-4.5-2-4-5S17 7 16 4.5"/>',
  warn: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".6"/>',
  drop: '<path d="M6 6h12M9 6V4h6v2M7 6l1 14h8l1-14"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  hourglass: '<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5 9 5 9 9s-9 4-9 9M16.5 3c0 5-9 5-9 9s9 4 9 9"/>',
};
const icon = (k, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[k] || IP.question}</svg>`;
function itemIcon(id) { const t = ITEMS[id].tags; const m = [['cursed', 'skull'], ['potion', 'potion'], ['food', 'belly'], ['fire', 'flame'], ['blade', 'sword'], ['blunt', 'wrench'], ['gold', 'coin'], ['bone', 'bone'], ['armor', 'shield'], ['holy', 'sun'], ['music', 'note'], ['paper', 'scroll'], ['construct', 'gear'], ['tool', 'wrench'], ['dragon', 'scale'], ['cloth', 'cloth'], ['arcane', 'sparkle'], ['monstrosity', 'tooth'], ['junk', 'question']]; if (id === 'bag') return 'bag'; for (const [tg, ic] of m) if (t.includes(tg)) return ic; return 'question'; }

// ---------- Header ----------
function headerHTML() {
  const mh = maxHp(), cap = bellyCap(), nt = notTier();
  const xpNow = Math.max(0, S.xp - XP_AT[S.lvl]), xpNeed = S.lvl >= MAX_LVL ? 1 : XP_AT[S.lvl + 1] - XP_AT[S.lvl];
  const bellyTxt = gorged() ? 'Full' : starving() ? 'Empty' : `${S.belly}/${cap}`;
  const xpPct = S.lvl >= MAX_LVL ? 100 : clamp(Math.round(100 * xpNow / xpNeed), 0, 100);
  const st = (cls, ic, label, val, w, col, short) => `<div class="stat" role="img" aria-label="${label}: ${val}"><span class="sl ${cls}">${icon(ic, 'sm')}${short}</span><span class="sv"><b>${val}</b></span><div class="meter"><i style="width:${clamp(w, 0, 100)}%;background:var(${col})"></i></div></div>`;
  return `<header class="hdr gut">
    <div class="hrow"><div class="grow"><div class="nm">${esc(S.name)} <span class="lv">Lv ${S.lvl}</span></div><div class="tier">${esc(T().name)} · ${esc(REGIONS[S.region].name.replace(/^The /, ''))}</div></div>
      <button class="iconbtn" data-act="sheet" data-s="settings" aria-label="Settings">${icon('gear')}</button></div>
    <div class="stats">
      ${st('hpc', 'heart', 'Health', `${Math.max(0, S.hp)}/${mh}`, 100 * S.hp / mh, '--hp', 'HP')}
      ${st('bec', 'belly', 'Belly', bellyTxt, 100 * S.belly / cap, '--belly', 'Belly')}
      ${st('xpc', 'star', 'Progress to next level', S.lvl >= MAX_LVL ? 'Max' : xpPct + '%', xpPct, '--xp', 'Next lv')}
      ${st('eyc', 'eye', 'Fame', NOT_NAMES[nt], S.notoriety, '--eye', 'Fame')}
    </div></header>`;
}
function navHTML() {
  if (S.enc) return '';
  const extra = S.tray.length;
  const t = (k, ic, label, dot) => `<button class="${ui.view === k ? 'on' : ''}" data-act="view" data-v="${k}" aria-current="${ui.view === k ? 'page' : 'false'}">${icon(ic)}${label}${dot ? `<span class="dot">${dot}</span>` : ''}</button>`;
  return `<nav class="tabs" aria-label="Main">${t('home', 'home', 'Lair')}${t('stomach', 'gut', 'Stomach', extra || '')}${t('self', 'chest', 'Mimic')}${t('journal', 'list', 'Journal')}</nav>`;
}

// ---------- Scene ----------
function tokenHTML(d, cls, label) { const w = d.name.replace(/,.*$/, '').split(/\s+/).filter(x => !['The', 'of', 'Sister'].includes(x)); const ini = (w.length > 1 ? w[0][0] + w[w.length - 1][0] : w[0].slice(0, 2)).toUpperCase(); return `<div class="tok sz-${d.size} ${cls || ''}" style="--tc:var(--t-${d.type}, #e9c79c)" aria-hidden="true"><div class="disc">${esc(ini)}</div>${label ? `<span class="lab">${esc(label)}</span>` : ''}</div>`; }
function sceneHTML() {
  const R = REGIONS[S.region], e = S.enc; let mc = 'idle', tok = '';
  if (e) {
    const d = VISITORS[e.vid], v = e.v;
    mc = e.phase === 'approach' || e.phase === 'missed' ? 'hold' : 'open';
    if (v.swallowed && e.phase === 'combat') mc = 'open full';
    if (ui.anim === 'chomp') mc += ' chomp'; if (ui.anim === 'hurt') mc += ' hurt';
    if (e.phase === 'done' && ['eaten', 'digested'].includes(e.result)) mc = 'open lick';
    let tc = v.grappled ? 'stuck' : ''; if (e.phase === 'done') tc = ['eaten', 'digested'].includes(e.result) ? 'eaten' : 'gone';
    if (!(v.swallowed && e.phase !== 'done')) tok = tokenHTML(d, tc, v.grappled ? 'Stuck to you' : d.name.split(',')[0]);
  } else if (ui.anim === 'lick') mc = 'open lick';
  return `<section class="scene ${e ? 'enc' : ''}" id="scene"><div class="torch"></div>${!e && S.queue.length ? `<div class="qbadge">${S.queue.length} waiting</div>` : ''}${mimicSVG(S.form, mc)}${tok}</section>`;
}

// ---------- Timers ----------
function timersHTML() {
  const now = Date.now(); const list = timersList(now);
  if (!list.length) return '';
  return `<div class="card" aria-label="Timers"><h3>${icon('hourglass')}Timers</h3>${list.map(t => `<div class="timer ${t.warn ? 'warn' : ''}">${icon(t.icon)}<div class="lbl">${esc(t.label)}${t.sub ? `<small data-sub="${t.id}">${esc(t.sub)}</small>` : ''}</div><div class="clock" data-tid="${t.id}" aria-label="${esc(t.label)} in ${fmtDur(t.left)}">${t.warn ? 'Now' : fmtDur(t.left)}</div><div class="meter"><i data-tbar="${t.id}" style="width:${t.warn ? 100 : clamp(100 - 100 * t.left / t.total, 0, 100)}%;background:var(--accent)"></i></div></div>`).join('')}
    <p class="sub">While you're away, a small visitor wanders in about every ${feat('patient') ? 6 : 12} minutes. Bigger ones wait for you.</p></div>`;
}
function timerStrip() {
  const all = timersList(Date.now()); if (!all.length) return ''; const list = all.slice(0, all.length > 3 ? 2 : 3);
  return `<div class="tstrip" data-opt="2" role="group" aria-label="Timers">${list.map(t => `<button class="tchip ${t.warn ? 'warn' : ''}" data-act="sheet" data-s="timers" aria-label="${esc(t.label)}: ${t.warn ? 'now' : fmtDur(t.left)}. Show all timers">${icon(t.icon, 'sm')}<span class="tcl">${esc(t.short)}</span><span data-tid="${t.id}">${t.warn ? 'Now' : fmtDur(t.left)}</span></button>`).join('')}${all.length > list.length ? `<button class="tchip" data-act="sheet" data-s="timers">${icon('hourglass', 'sm')}<span class="tcl">More</span><span>+${all.length - list.length}</span></button>` : ''}</div>`;
}
function tickTimers() {
  if (!S) return; const now = Date.now();
  timersList(now).forEach(t => { document.querySelectorAll(`[data-tid="${t.id}"]`).forEach(c => { if (!t.warn) c.textContent = fmtDur(t.left); }); document.querySelectorAll(`[data-tbar="${t.id}"]`).forEach(b => { if (!t.warn) b.style.width = clamp(100 - 100 * t.left / t.total, 0, 100) + '%'; }); if (t.id === 'belly') { const s = document.querySelector('[data-sub="belly"]'); if (s) s.textContent = t.sub; } });
  const dg = document.querySelector('[data-tid="sdig"]'); if (dg && S.digest) dg.textContent = fmtDur(S.digest.left - (now - S.lastTick));
}

// ---------- Home ----------
function homePanel() {
  const last = S.log[0]; const b = baitItem(); const R = REGIONS[S.region];
  const waitSub = S.queue.length ? `${S.queue.length} visitor${S.queue.length > 1 ? 's' : ''} waiting outside` : gorged() ? 'You are too full to swallow anyone' : 'Sit still and see who comes';
  const comp = S.companion ? companionLine() : '';
  return `<section class="panel gut">${handleHTML()}
    ${gorged() ? `<button class="big-btn" disabled>${icon('belly')}<span>Too full to hunt<small>Belly drops in <span data-tid="belly">${fmtDur((timersList(Date.now()).find(t => t.id === 'belly') || { left: 0 }).left)}</span> · Rest makes room now</small></span></button>` : `<button class="big-btn" data-act="wait">${icon('eye')}<span>Wait for a visitor<small>${esc(waitSub)}</small></span></button>`}
    <div class="tiles">
      <button class="tile" data-act="rest" ${S.hp >= maxHp() || S.belly < 1 ? 'disabled' : ''}>${icon('bed')}<b>Rest</b><small>${S.hp >= maxHp() ? 'Healthy' : '−1 belly'}</small></button>
      <button class="tile" data-act="nap" ${S.naps <= 0 ? 'disabled' : ''}>${icon('moon')}<b>Nap</b><small>30 min · ${S.naps} left</small></button>
      <button class="tile" data-act="sheet" data-s="disguise">${icon('mask')}<b>Disguise</b><small>${esc(FORMS[S.form].name.replace('Treasure ', ''))}</small></button>
      <button class="tile" data-act="sheet" data-s="move">${icon('map')}<b>Move</b><small>${S.regions.length} areas</small></button>
    </div>
    ${prefs.layout === 'fit' ? timerStrip() : timersHTML()}
    ${last ? `<div class="sysbox ${last.cls === 'bad' ? 'bad' : ''}" data-opt="1" data-act="view" data-v="journal" role="button" aria-label="Latest message. Open journal">${esc(last.text)}</div>` : ''}
    ${prefs.layout === 'fit' ? '' : comp}
  </section>`;
}
function companionLine() { const c = S.companion; const L = { partner: 'Wren is practising her "lost traveller" face nearby.', pet: 'Wren is sitting on your lid, humming.', reformer: 'Wren is reading you a book about ethics. Out loud.', snack: '[The System has not forgotten Wren.]' }[c.path]; return `<p class="sub">${esc(L)}</p>`; }

// ---------- Encounter ----------
function rollLine(x) {
  if (!x) return '';
  const r = x.r, need = x.vs - x.mod;
  const adv = r.mode ? ` (${r.mode > 0 ? 'advantage' : 'disadvantage'}: ${r.a} and ${r.b})` : '';
  const verdict = x.crit ? '<span class="c">Critical!</span>' : x.them ? (x.ok ? '<span class="y">Good for you</span>' : '<span class="n">Bad for you</span>') : (x.ok ? '<span class="y">Success</span>' : '<span class="n">Miss</span>');
  if (prefs.dice === 'detailed') return `<p class="roll" data-opt="1">${esc(x.label)}: d20 ${r.r}${adv} ${sgn(x.mod)} = ${x.total} vs ${esc(x.vsLabel)} ${x.vs}. ${verdict}</p>`;
  return `<p class="roll" data-opt="1">${x.them ? 'They' : 'You'} rolled ${r.r}${r.mode ? (r.mode > 0 ? ' (best of two)' : ' (worst of two)') : ''}, needed ${Math.max(1, need)}+. ${verdict}</p>`;
}
function ringHTML(p) { const c = 2 * Math.PI * 30, col = p >= 0.65 ? 'var(--good)' : p >= 0.4 ? 'var(--warn)' : 'var(--bad)'; return `<div class="ring" role="img" aria-label="${pct(p)} chance"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="30" fill="none" stroke="var(--card2)" stroke-width="9"/><circle cx="38" cy="38" r="30" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * p} ${c}"/></svg><b>${pct(p)}</b></div>`; }
function encPanel() {
  const e = S.enc, d = VISITORS[e.vid], v = e.v;
  if (e.phase === 'done') return `<section class="panel gut">${handleHTML()}${resultHTML()}</section>`;
  const dz = danger(e.vid);
  const head = `<div class="vcard card"><div class="vhead"><div><h2>${esc(d.name)}</h2><div class="meta">${SIZES[d.size].name} ${TYPE_NAME[d.type].toLowerCase()} · worth ${d.xp} XP</div></div><span class="pill d-${dz.k}">${icon(dz.k === 'easy' ? 'check' : 'warn', 'sm')}${dz.name}</span></div>
    <div class="hpline" data-opt="5">${icon('heart', 'sm')}<div class="meter"><i style="width:${clamp(100 * v.hp / v.maxHp, 0, 100)}%;background:var(--bad)"></i></div><span>${Math.max(0, v.hp)}/${v.maxHp}</span></div>
    ${e.phase === 'approach' ? `<p class="sub" data-opt="2">Wants: ${esc(d.wants.map(w => WANTS[w].toLowerCase()).join(', '))}${!canSwallowSize(d.size) ? ` · <b>too big to swallow</b>` : ''}${ess('dragon') && d.loot.length ? ` · carrying ${esc([...new Set(d.loot.map(l => ITEMS[l[0]].name))].join(', '))}` : ''}</p>` : ''}</div>`;
  const lastL = e.log[e.log.length - 1];
  const ev = lastL ? `<div aria-live="polite"><p data-opt="3" class="event ${lastL.cls === 'bad' || lastL.cls === 'foe' ? 'bad' : lastL.cls === 'good' || lastL.cls === 'title' ? 'good' : ''}">${esc(lastL.text)}</p>${rollLine(e.dice2)}${rollLine(e.dice)}</div>` : '';
  const recent = e.log.length > 1 ? `<div class="recent">${e.log.slice(-4, -1).reverse().map(l => `<p>${esc(l.text)}</p>`).join('')}</div>` : '';
  let body = '';
  if (e.phase === 'approach') {
    const o = lureOdds(e.vid);
    body = `<div class="card"><div class="odds">${ringHTML(o.p)}<div><div class="oddsh"><b>Chance to trap them</b><button class="mini" data-act="sheet" data-s="disguise">${icon('mask', 'sm')}Change</button></div><ul class="why" data-opt="4">${o.notes.map(n => `<li class="${n.ok ? 'ok' : 'no'}">${icon(n.ok ? 'check' : 'cross', 'sm')}<span>${esc(n.t)}</span></li>`).join('')}</ul></div></div></div>
      <div class="acts"><button class="act go" data-act="lure">${icon('chest')}<b>Lure them in</b><small>Spring the trap</small></button><button class="act" data-act="pass">${icon('moon')}<b>Let them pass</b><small>${S.companion && S.companion.path === 'reformer' ? 'Wren approves' : 'No risk'}</small></button>
      <button class="act wide" data-act="sheet" data-s="disguise">${icon('mask')}<b>Change disguise first</b><small>${esc(FORMS[S.form].name)}${baitItem() ? ' with ' + esc(ITEMS[baitItem().id].name) : ', no bait'}</small></button></div>`;
  } else if (e.phase === 'missed') {
    body = `<div class="acts"><button class="act" data-act="lunge">${icon('teeth')}<b>Lunge at them</b><small>Fight without surprise</small></button><button class="act" data-act="letgo">${icon('moon')}<b>Let them go</b><small>They never knew</small></button></div>`;
  } else {
    let A = simpleActions(); let more = [];
    if (prefs.layout === 'fit' && A.length > 4) { const bi = A.findIndex(a => a.best); if (bi > 2) { const [x] = A.splice(bi, 1); A.splice(2, 0, x); } more = A.slice(3); A = A.slice(0, 3); ui.more = more; }
    const ds = e.deathRolls ? `<div class="dsv">Death saves: ${e.deathRolls.map(r => `<i class="${r === 20 ? 'n20' : r >= 10 ? 's' : 'f'}">${r}</i>`).join('')}</div>` : '';
    body = `${ds}<div class="acts">${A.map(a => `<button class="act ${a.best ? 'best' : ''} ${a.chance != null ? 'hasc' : ''}" data-act="do" data-k="${a.k}" ${a.cell != null ? `data-c="${a.cell}"` : ''} ${a.disabled ? 'disabled' : ''}>${icon(a.icon)}<b>${esc(a.label)}</b><small>${esc(a.sub)}</small>${a.chance != null ? `<span class="chance" aria-label="${pct(a.chance)} chance">${pct(a.chance)}</span>` : ''}</button>`).join('').replace(/class="act /g, 'class="act ')}${more.length ? `<button class="act" data-act="sheet" data-s="moves">${icon('list')}<b>More moves</b><small>${more.length} more option${more.length > 1 ? 's' : ''}</small></button>` : ''}</div>`;
  }
  return `<section class="panel gut">${handleHTML()}${head}${ev}${body}${recent}</section>`;
}
const RESULT = { retreat: ['You slammed shut', 'bad'], digested: ['Digested!', ''], eaten: ['Eaten!', ''], fled: ['They got away', 'bad'], passed: ['You let them pass', ''], missed: ['They walked off', ''], stable: ['You survived', 'bad'], shattered: ['You shattered', 'bad'] };
function resultHTML() {
  const e = S.enc, d = VISITORS[e.vid]; const [t, c] = RESULT[e.result] || ['Done', ''];
  const g = [];
  if (['eaten', 'digested'].includes(e.result)) { g.push(['star', `+${d.xp} XP`]); g.push(['up', `+${e.result === 'digested' ? 2 : 1} ${TYPE_NAME[d.type]} essence`]); (e.loot || []).forEach(id => g.push([itemIcon(id), `Swallowed: ${ITEMS[id].name}`, 3])); }
  if (e.result === 'fled') g.push(['eye', 'They will tell people about you']);
  const msgs = (e.resMsgs || []).map(m => `<p>${esc(m.text)}</p>`).join('');
  const lastL = e.log[e.log.length - 1];
  return `<div class="res card"><h2 class="${c}">${t}</h2>${lastL ? `<p data-opt="2">${esc(lastL.text)}</p>` : ''}${g.length ? `<ul class="gains">${g.map(([ic, tx, o]) => `<li ${o ? `data-opt="${o}"` : ''}>${icon(ic)}${esc(tx)}</li>`).join('')}</ul>` : ''}${e.deathRolls ? `<div class="dsv">Death saves: ${e.deathRolls.map(r => `<i class="${r === 20 ? 'n20' : r >= 10 ? 's' : 'f'}">${r}</i>`).join('')}</div>` : ''}</div>
    ${msgs ? `<div class="sysbox" data-opt="1">${msgs}</div>` : ''}
    <button class="big-btn" data-act="close-enc">${icon('home')}<span>Back to the lair${e.loot && e.loot.length ? '<small data-opt="1">New items go straight into your stomach</small>' : ''}</span></button>`;
}

// ---------- Pager: lists are cut into pages that exactly fit the space they're given ----------
function pager(key, items, opts) {
  opts = opts || {};
  const br = ui.breaks[key]; const ready = br && ui.bsig[key] === items.length;
  if (!ready) // measuring pass: everything laid out once so real heights can be read
    return `<div class="pg ${opts.cls || ''}" data-pg="${key}" data-n="${items.length}" data-measure="1"><div class="pg-items ${opts.grid ? 'pg-grid' : ''}">${items.join('') || `<p class="sub">${esc(opts.empty || 'Nothing here yet.')}</p>`}</div>
      <div class="pgnav off"><button class="pgb" disabled>${icon('left')}</button><span class="pgn">Page 1 of 1</span><button class="pgb" disabled>${icon('right')}</button></div></div>`;
  const pages = br.length; const pg = Math.min(ui.pages[key] || 0, pages - 1); ui.pages[key] = pg;
  const slice = items.slice(br[pg], pg + 1 < pages ? br[pg + 1] : items.length);
  return `<div class="pg ${opts.cls || ''}" data-pg="${key}" data-n="${items.length}"><div class="pg-items ${opts.grid ? 'pg-grid' : ''}">${slice.join('') || `<p class="sub">${esc(opts.empty || 'Nothing here yet.')}</p>`}</div>
    <div class="pgnav ${pages > 1 ? '' : 'off'}"><button class="pgb" data-act="page" data-k="${key}" data-d="-1" ${pg === 0 ? 'disabled' : ''} aria-label="Previous page">${icon('left')}</button><span class="pgn" aria-live="polite">Page ${pg + 1} of ${pages}</span><button class="pgb" data-act="page" data-k="${key}" data-d="1" ${pg >= pages - 1 ? 'disabled' : ''} aria-label="Next page">${icon('right')}</button></div></div>`;
}
function measurePagers() {
  let changed = false;
  document.querySelectorAll('.pg[data-pg]').forEach(pg => {
    const key = pg.dataset.pg, box = pg.querySelector('.pg-items'); if (!box) return;
    const h = box.clientHeight;
    if (!pg.dataset.measure) { if (ui.bh[key] && Math.abs(ui.bh[key] - h) > 2) { delete ui.breaks[key]; changed = true; } return; }
    const kids = [...box.children].filter(k => k.tagName !== 'P'); const breaks = [0];
    let top = kids.length ? kids[0].offsetTop : 0;
    kids.forEach((k, i) => { if (i > breaks[breaks.length - 1] && k.offsetTop + k.offsetHeight - top > h - 1) { breaks.push(i); top = k.offsetTop; } });
    ui.breaks[key] = breaks; ui.bsig[key] = +pg.dataset.n; ui.bh[key] = h; changed = true;
  });
  return changed;
}
function fitOptional() {
  document.querySelectorAll('main .panel, .vbody, .sh-b, .view').forEach(c => {
    if (!c.offsetParent) return;
    const opts = [...c.querySelectorAll('[data-opt]')].sort((a, b) => +a.dataset.opt - +b.dataset.opt);
    const over = () => { const cb = c.getBoundingClientRect().bottom; return [...c.children].some(ch => ch.offsetParent && getComputedStyle(ch).position !== 'absolute' && ch.getBoundingClientRect().bottom > cb + 1); };
    let i = 0; while (i < opts.length && over()) opts[i++].style.display = 'none';
  });
}
function remeasure() { ui.breaks = {}; ui.bsig = {}; ui.bh = {}; }
const row = (ic, title, sub, attrs, cls) => `<${attrs ? 'button' : 'div'} class="pi ${cls || ''}" ${attrs || ''}>${icon(ic)}<span><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></${attrs ? 'button' : 'div'}>`;

// ---------- Stomach ----------
const SHORT = { healing_potion: 'Potion', ring_prot: 'Ring', cloak: 'Cloak', contract: 'Contract', hesk_crowbar: 'Crowbar', mimic_tooth: 'Mimic Tooth', clockwork_jaw: 'Clock Jaw', gut_blade: 'Gut Blade', treasure_map: 'Map', knight_plate: 'Plate', dragon_scale: 'Scale', pixie_dust: 'Pixie Dust', gold_ring: 'Gold Ring', bag: 'Bag', rusty_dagger: 'Dagger', copper: 'Coins', silver: 'Silver', goldhoard: 'Gold Hoard', bone_cage: 'Bone Cage', map_scrap: 'Map Scrap', holy_symbol: 'Holy Symbol', ember_wand: 'Wand', ember_core: 'Ember', big_club: 'Club', leather: 'Leather', bread: 'Bread', glowcap: 'Glowcap', lockpicks: 'Picks', wet_sock: 'Sock', salt: 'Salt', halo: 'Halo', gear: 'Gear', spellbook: 'Book', shortsword: 'Sword', longsword: 'Longsword' };
function stomachView() {
  fitGrid(); const cols = gridCols(), rows = gridRows(), n = cellCount(); let cells = '';
  for (let i = 0; i < n; i++) {
    const c = S.grid[i];
    if (!c) { cells += ui.moving != null ? `<button class="cell target" data-act="cell" data-i="${i}" aria-label="Move here"></button>` : `<div class="cell" aria-label="Empty space"></div>`; continue; }
    const it = ITEMS[c.id];
    const flag = S.bait === c.uid ? '<span class="flag">BAIT</span>' : it.attune && isAttuned(c.uid) ? '<span class="flag att">ON</span>' : it.cursed && cursedOn() ? '<span class="flag cur">CURSED</span>' : '';
    cells += `<button class="cell it r-${it.r} ${ui.moving === i ? 'moving' : ''}" data-act="${ui.moving != null ? 'cell' : 'item'}" data-i="${i}" aria-label="${esc(it.name)}${S.bait === c.uid ? ', bait' : ''}">${flag}${icon(itemIcon(c.id))}<span>${esc(SHORT[c.id] || it.name)}</span></button>`;
  }
  const line = ui.moving != null ? `<button class="strip warn" data-act="move-cancel">${icon('map', 'sm')}<span>Moving ${esc(ITEMS[S.grid[ui.moving].id].name)}: tap a space. Tap here to cancel.</span></button>` : S.tray.length ? `<button class="strip warn" data-act="sheet" data-s="full">${icon('warn', 'sm')}<span>No room for ${S.tray.length} item${S.tray.length > 1 ? 's' : ''}. Tap to see.</span></button>`
    : S.digest ? `<div class="strip">${icon('gut', 'sm')}<span>Digesting ${esc(ITEMS[S.digest.item.id].name)}</span><b data-tid="digest">${fmtDur(S.digest.left)}</b></div>`
    : `<div class="strip">${icon('gut', 'sm')}<span>Tap an item to use or digest it.</span></div>`;
  return `<section class="view gut"><div class="vh"><h2>Stomach</h2><span class="sub">${gridItems().length}/${n} full</span></div>${line}
    <div class="gridwrap"><div class="grid" style="--cols:${cols};--rows:${rows}">${cells}</div></div></section>`;
}
function itemSheet(i) {
  const c = S.grid[i]; if (!c) return '';
  const it = ITEMS[c.id]; const o = [];
  if (!it.attune || !isAttuned(c.uid)) o.push(row('coin', S.bait === c.uid ? 'Stop using as bait' : 'Use as bait', baitWantsFor(c.id), `data-act="setbait" data-i="${i}"`, S.bait === c.uid ? 'on' : ''));
  if (it.use === 'eat') o.push(row('belly', 'Eat it now', `+${it.belly} belly${it.heal ? ', heal a little' : ''}`, `data-act="eat" data-i="${i}"`));
  if (!it.noDigest) o.push(row('gut', `Digest · ${Math.round(DIGEST_MIN[it.r] / digestSpeed())} min`, S.digest ? 'Already digesting something' : 'Becomes: ' + digestGain(c.id), `data-act="digest" data-i="${i}" ${S.digest ? 'disabled' : ''}`));
  if (it.attune) o.push(row('sparkle', isAttuned(c.uid) ? 'Switch off' : 'Switch on', `${S.attuned.length}/3 magic items on`, `data-act="attune" data-i="${i}"`));
  if (globalThis.cmvDetailed) o.push(row('map', 'Move it', 'Pick a new space. Neighbours boost each other', `data-act="move" data-i="${i}"`));
  o.push(row('drop', 'Drop it', it.cursed && cursedOn() ? 'Cursed: it will not come out' : 'Gone for good', `data-act="spit" data-i="${i}" ${it.cursed && cursedOn() ? 'disabled' : ''}`));
  return sheetWrap(it.name, `<p class="desc">${esc(it.r[0].toUpperCase() + it.r.slice(1))}${it.attune ? ' magic item' : ''}. ${esc(it.desc)}</p>${pager('item', o)}`);
}
function baitWantsFor(id) { const ws = [...new Set(ITEMS[id].tags.map(t => TAG_WANT[t]).filter(Boolean))]; return ws.length ? 'Attracts visitors who want ' + ws.map(w => WANTS[w].toLowerCase()).join(' or ') : 'Nobody wants this'; }

// ---------- Mimic ----------
const PLAIN = { STR: 'Bite, grip', DEX: 'Sneaky forms', CON: 'Health, belly', INT: 'Using items', WIS: 'Reading visitors', CHA: 'Charm, bait' };
const FORM_UNLOCK = { chest: '', barrel: 'Become a Chest Mimic (level 3).', bookshelf: 'Digest a Spellbook.', door: 'Become a Doorway Mimic (level 6).', wardrobe: 'Become a Wardrobe Mimic (level 6).', coffin: 'Wardrobe Mimic, or eat 8 undead.' };
function selfView() {
  const sub = ui.sub || 'stats';
  const tabs = [['stats', 'Stats'], ['traits', 'Traits'], ['forms', 'Forms'], ['titles', 'Titles']];
  let body = '';
  if (sub === 'stats') {
    body = `<div class="abil">${ABILS.map(k => `<div><small>${ABIL_NAME[k]}</small><b>${score(k)}</b><small data-opt="2">${esc(PLAIN[k])}</small></div>`).join('')}</div>
      <div class="kv2">${[['Armour', ac(), 9], ['Bite', `~${Math.round(expBite())}`, 8], ['Swallows', SIZES[SIZE_BY_N[swallowMax()]].name, 7], ['Acid', `~${Math.round(acidAvg())}/turn`, 4], ['Belly', bellyCap(), 3], ['Prof.', sgn(prof()), 1]].map(([k, v, o]) => `<div data-opt="${o}"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>`;
  } else if (sub === 'traits') {
    const items = [];
    TYPES.filter(t => ess(t)).forEach(t => items.push(row('up', `${ESSENCE[t].name} ${ess(t) === 2 ? 'II' : 'I'}`, ess(t) === 2 ? ESSENCE[t].ii : ESSENCE[t].i, '', 'on')));
    Object.keys(DIGEST_TAGS).filter(t => dt(t)).forEach(t => items.push(row('gut', `${DIGEST_TAGS[t].name} ×${dt(t)}`, `${DIGEST_TAGS[t].each} each`)));
    TYPES.filter(t => ess(t) < 2).map(t => ({ t, n: S.essence[t] || 0, need: ESS_AT[ess(t)] })).sort((a, b) => (a.need - a.n) - (b.need - b.n))
      .forEach(x => items.push(row('hourglass', `${ESSENCE[x.t].name}${ess(x.t) ? ' II' : ''} · ${x.n}/${x.need}`, `Eat ${x.need - x.n} more ${TYPE_NAME[x.t].toLowerCase()}`, '', 'off')));
    body = `<div class="slist">${items.join('')}</div>`;
  } else if (sub === 'forms') {
    body = '<div class="slist">' + (Object.keys(FORMS).map(k => row(k === 'door' ? 'door' : 'mask', FORMS[k].name, S.forms.includes(k) ? 'Attracts visitors who want ' + FORMS[k].attract.map(w => WANTS[w].toLowerCase()).join(' or ') : FORM_UNLOCK[k], '', S.forms.includes(k) ? '' : 'off')).join('')) + '</div>';
  } else {
    const ks = Object.keys(TITLES).sort((a, b) => (S.titles[b] ? 1 : 0) - (S.titles[a] ? 1 : 0));
    body = `<div class="slist">${ks.map(k => row('star', S.titles[k] ? TITLES[k].name : '???', TITLES[k].desc, '', S.titles[k] ? '' : 'off')).join('')}</div>`;
  }
  return `<section class="view gut"><div class="vh"><h2>${esc(S.name)}</h2><span class="sub">Level ${S.lvl} ${esc(T().name)}</span></div>
    <div class="seg" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${sub === k}" class="${sub === k ? 'on' : ''}" data-act="sub" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="vbody">${body}</div></section>`;
}
function journalView() { return `<section class="view gut"><div class="vh"><h2>Journal</h2><span class="sub">Newest first</span></div><div class="vbody">${pager('log', S.log.map(l => `<div class="pi log ${l.cls === 'bad' ? 'bad' : ''}"><span>${esc(l.text)}</span></div>`))}</div></section>`; }

// ---------- Sheets: full pages with a close button, never scrolling ----------
function sheetWrap(title, body, foot, locked) {
  return `<div class="ov"><div class="sheet gut" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sh-h"><h2>${esc(title)}</h2>${locked ? '' : `<button class="iconbtn" data-act="close" aria-label="Close">${icon('cross')}</button>`}</div><div class="sh-b">${body}</div>${foot ? `<div class="sh-f">${foot}</div>` : ''}</div></div>`;
}
function sheetHTML() {
  const s = ui.sheet; if (!s) return '';
  if (s.t === 'intro') return `<div class="ov"><div class="sheet gut" role="dialog" aria-label="Start"><div class="sh-b intro"><div class="title-art">${mimicSVG('chest', 'idle')}<div class="big-t">Contents May Vary</div></div>
    <div class="sysbox">[Object has achieved sentience. You are a Lesser Mimic. Please choose a name.]</div>
    <label for="nm"><b>Your name</b></label><input class="inp" id="nm" maxlength="24" value="Lid" autocomplete="off">
    <p class="sub">Pretend to be furniture. Lure visitors in. Eat them. Grow while you're away.</p></div>
    <div class="sh-f"><button class="big-btn" data-act="begin">${icon('eye')}<span>Open your eyes</span></button><button class="linkbtn" data-act="sheet" data-s="import">I have a save code</button></div></div></div>`;
  if (s.t === 'item') return itemSheet(s.i);
  if (s.t === 'full') return sheetWrap('No room', `<p class="desc">These can't fit in your stomach. Digest or drop something to make space and they'll go in.</p>${pager('full', S.tray.map(c => row(itemIcon(c.id), ITEMS[c.id].name, ITEMS[c.id].desc)))}`);
  if (s.t === 'timers') return sheetWrap('Timers', pager('timers', timersList(Date.now()).map(t => `<div class="pi">${icon(t.icon)}<span><b>${esc(t.label)}</b><small>${esc(t.sub || '')}</small></span><em data-tid="${t.id}">${t.warn ? 'Now' : fmtDur(t.left)}</em></div>`), { empty: 'Nothing is counting down right now.' }));
  if (s.t === 'moves') { const M = (ui.more || []).filter(() => S.enc); return sheetWrap('More moves', pager('moves', M.map(a => `<button class="act ${a.chance != null ? 'hasc' : ''}" data-act="do" data-k="${a.k}" ${a.cell != null ? `data-c="${a.cell}"` : ''} ${a.disabled ? 'disabled' : ''}>${icon(a.icon)}<b>${esc(a.label)}</b><small>${esc(a.sub)}</small>${a.chance != null ? `<span class="chance">${pct(a.chance)}</span>` : ''}</button>`), { grid: true })); }
  if (s.t === 'settings') {
    const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button class="${prefs[key] === v ? 'on' : ''}" data-act="pref" data-k="${key}" data-v="${v}" aria-pressed="${prefs[key] === v}">${l}</button>`).join('')}</div>`;
    return sheetWrap('Settings', `<div class="setrow"><b>Detail</b>${seg('depth', [['simple', 'Simple'], ['detailed', 'Detailed']])}</div><div class="setrow"><b>Text size</b>${seg('text', [['normal', 'Normal'], ['large', 'Large']])}</div><div class="setrow"><b>Motion</b>${seg('motion', [['full', 'Full'], ['reduced', 'Reduced']])}</div><div class="setrow"><b>Theme</b>${seg('theme', [['system', 'Device'], ['light', 'Light'], ['dark', 'Dark']])}</div>
      ${pager('set', [row('save', 'Back up your save', 'Get a code to keep or move to another device', 'data-act="sheet" data-s="export"'), row('up', 'Restore from a code', 'Replace this mimic with a saved one', 'data-act="sheet" data-s="import"'), row('question', 'How to play', 'Eight quick pages', 'data-act="sheet" data-s="howto"'), row('scroll', 'About and credits', 'Version, inspirations and licences', 'data-act="sheet" data-s="about"'), row('drop', 'Start over', 'Erase this mimic', 'data-act="sheet" data-s="reset"', 'danger')])}`);
  }
  if (s.t === 'export') { const code = saveCode(); return sheetWrap('Back up your save', `<p class="desc">Copy this code somewhere safe, like your Notes app. Paste it into Restore on any device to bring ${esc(S.name)} back.</p><textarea class="inp code" id="exp" readonly aria-label="Save code">${esc(code)}</textarea><p class="sub" id="copied" aria-live="polite"></p>`, `<button class="big-btn" data-act="copy">${icon('save')}<span>Copy code</span></button>`); }
  if (s.t === 'import') return sheetWrap('Restore from a code', `<p class="desc">Paste a save code. This replaces ${S ? esc(S.name) : 'any current mimic'} on this device.</p><textarea class="inp code" id="imp" aria-label="Paste save code" placeholder="CMV1:…"></textarea><p class="sub bad" id="imperr" aria-live="polite">${esc(ui.importErr || '')}</p>`, `<button class="big-btn" data-act="restore">${icon('up')}<span>Restore</span></button>`);
  if (s.t === 'about') return sheetWrap('About', pager('about', [row('chest', 'Contents May Vary', 'Version ' + APP_VERSION + '. A mimic idle game.'), row('star', 'Inspired by', 'LitRPG mimic stories, auto-battlers, tactics games and tabletop roleplaying. All characters and names here are original.'), row('scroll', 'SRD 5.1 attribution', 'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.'), row('eye', 'Not affiliated', 'Not affiliated with or endorsed by Wizards of the Coast.')]));
  if (s.t === 'howto') return sheetWrap('How to play', pager('howto', [
    row('mask', '1. Disguise', 'Pick a form and some bait. The ring shows your chance to trick each visitor.'),
    row('chest', '2. Lure', 'If they open you, they stick to you and you strike first.'),
    row('gulp', '3. Grab and swallow', 'Anything your size or smaller can be swallowed. Acid does the rest.'),
    row('teeth', '4. Best move', 'Every button shows its chance. The best one is marked.'),
    row('gut', '5. Stomach', 'Loot goes inside you and helps you fight. Digest items for upgrades.'),
    row('up', '6. Grow', 'Eat 3 of a creature type to gain its trait. Levels 3 and 6 evolve you.'),
    row('hourglass', '7. Come back later', 'Belly empties, digestion finishes and visitors wander in while you are away.'),
    row('eye', '8. Fame', 'Escaped witnesses make you famous. Too famous and a hunter comes. Moving cools it.')]));
  if (s.t === 'disguise') {
    const tab = ui.dtab || 'form';
    const items = S.grid.map((c, i) => [c, i]).filter(([c]) => c && !(ITEMS[c.id].attune && isAttuned(c.uid)));
    const list = tab === 'form'
      ? Object.keys(FORMS).filter(k => S.forms.includes(k)).map(k => row(k === 'door' ? 'door' : 'mask', `${FORMS[k].name} · +${disguiseMod(k)}`, 'Attracts visitors who want ' + FORMS[k].attract.map(w => WANTS[w].toLowerCase()).join(' or '), `data-act="setform" data-k="${k}"`, S.form === k ? 'on' : ''))
      : [row('cross', 'No bait', 'Just a box', 'data-act="pickbait" data-i="-1"', !S.bait ? 'on' : '')].concat(items.map(([c, i]) => row(itemIcon(c.id), ITEMS[c.id].name, baitWantsFor(c.id), `data-act="pickbait" data-i="${i}"`, S.bait === c.uid ? 'on' : '')));
    return sheetWrap('Disguise', `<div class="seg" role="tablist"><button class="${tab === 'form' ? 'on' : ''}" data-act="dtab" data-k="form">Form</button><button class="${tab === 'bait' ? 'on' : ''}" data-act="dtab" data-k="bait">Bait</button></div>${pager('dis-' + tab, list)}`);
  }
  if (s.t === 'move') return sheetWrap('Move', `<p class="desc">Moving cools your fame${S.tier === 'doorway' ? ' and is free' : ' and costs 1 belly'}. Waiting visitors leave.</p>${pager('move', REGION_ORDER.filter(k => !REGIONS[k].secret || S.regions.includes(k)).map(k => { const R = REGIONS[k], on = S.regions.includes(k); const why = R.tier && S.tier === 'lesser' ? 'Reach level 3 to leave the dungeon' : `Reach level ${R.lvl}`; return row(on ? 'map' : 'cross', R.name + (S.region === k ? ' · here' : ''), on ? 'Known for ' + R.known : why, `data-act="moveto" data-k="${k}" ${on && S.region !== k && (S.belly >= 1 || S.tier === 'doorway') ? '' : 'disabled'}`, S.region === k ? 'on' : ''); }))}`);
  if (s.t === 'asi') { const tab = ui.atab || 'abil'; const list = tab === 'abil' ? ABILS.map(k => row('up', `${ABIL_NAME[k]} +2`, PLAIN[k], `data-act="asi" data-k="${k}" ${S.abil[k] >= 20 ? 'disabled' : ''}`)) : Object.keys(FEATS).filter(f => !feat(f)).map(f => row('star', FEATS[f].name, FEATS[f].desc, `data-act="asi" data-k="${f}"`));
    return sheetWrap(`Level ${S.lvl}: pick one`, `<div class="seg" role="tablist"><button class="${tab === 'abil' ? 'on' : ''}" data-act="atab" data-k="abil">Abilities</button><button class="${tab === 'feat' ? 'on' : ''}" data-act="atab" data-k="feat">Feats</button></div>${pager('asi-' + tab, list)}`, '', true); }
  if (s.t === 'evo_chest') return sheetWrap('You are evolving', `<div class="title-art sm">${mimicSVG('chest', 'idle')}</div>${pager('evo1', [row('gulp', 'Swallow Small creatures', 'Goblins, kobolds, halflings'), row('gut', 'Bigger stomach', '4 × 4 spaces'), row('mask', 'New form: Barrel', 'A sneaky disguise'), row('map', 'Leave the dungeon', 'The Forest Road opens')])}`, `<button class="big-btn" data-act="evo" data-k="chest">${icon('up')}<span>Evolve</span></button>`, true);
  if (s.t === 'evo_branch') return sheetWrap('Choose your evolution', `<p class="desc">All four make you Large, so you can swallow knights.</p>${pager('evo2', BRANCHES.map(k => row({ vault: 'shield', wardrobe: 'mask', doorway: 'door', barrel: 'run' }[k], TIERS[k].name, TIERS[k].desc, `data-act="evo" data-k="${k}"`)), { cls: 'tall' })}`, '', true);
  if (s.t === 'max') return sheetWrap('Level 10', `<div class="sysbox">[You have reached the end of this prototype. Next: Mimic Room.]</div>`, `<button class="big-btn" data-act="close">${icon('check')}<span>Keep eating</span></button>`);
  if (s.t === 'report') { const r = s.r; const counts = {}; r.caught.forEach(id => counts[id] = (counts[id] || 0) + 1); const rows = []; const hrs = r.minutes >= 60 ? `${Math.floor(r.minutes / 60)}h ${Math.round(r.minutes % 60)}m` : `${Math.round(r.minutes)} min`;
    rows.push(row('chest', `You ate ${r.caught.length || 'nobody'}`, Object.entries(counts).map(([id, n]) => `${n > 1 ? n + ' × ' : ''}${VISITORS[id].name}`).join(', ') || 'Nobody wandered in. Rude.'));
    if (r.xp) rows.push(row('star', `+${Math.round(r.xp)} XP`, 'From what you ate'));
    if (r.escaped) rows.push(row('eye', `${r.escaped} got away`, 'They told people about you'));
    if (r.hurt) rows.push(row('heart', `You took ${r.hurt} damage`, 'Some fought back'));
    if (r.tooFull) rows.push(row('belly', `Too full to eat ${r.tooFull}`, 'Tragic'));
    if (r.digested) rows.push(row('gut', 'Digestion finished', ITEMS[r.digested].name));
    if (r.arrivals.length) rows.push(row('hourglass', `${r.arrivals.length} waiting outside`, r.arrivals.map(id => VISITORS[id] ? VISITORS[id].name : 'someone').join(', ')));
    r.lines.forEach(l => rows.push(`<div class="pi log"><span>${esc(l.text)}</span></div>`));
    return sheetWrap(`Away for ${hrs}`, pager('report', rows), `<button class="big-btn" data-act="close">${icon('eye')}<span>Open your eyes</span></button>`); }
  if (s.t === 'companion') return sheetWrap('Someone opens you', `<p class="desc">Wren, a scrawny adventurer, sees your teeth and doesn't scream. "Want to work together?"</p>${pager('comp', Object.keys(COMPANION_PATHS).map(k => row({ partner: 'coin', pet: 'heart', reformer: 'sun', snack: 'teeth' }[k], COMPANION_PATHS[k].name, COMPANION_PATHS[k].desc, `data-act="comp" data-k="${k}"`, k === 'snack' ? 'danger' : '')), { cls: 'tall' })}`, '', true);
  if (s.t === 'reset') return sheetWrap('Start over?', `<p class="desc">This erases ${esc(S.name)} for good.</p>`, `<button class="big-btn danger" data-act="reset-yes">${icon('drop')}<span>Erase and start again</span></button>`);
  return '';
}

// ---------- Render ----------
function buildHTML() {
  let main;
  if (S.enc) main = sceneHTML() + encPanel();
  else if (ui.view === 'stomach') main = stomachView();
  else if (ui.view === 'self') main = selfView();
  else if (ui.view === 'journal') main = journalView();
  else main = sceneHTML() + homePanel();
  return `<main class="${!!S.enc || ui.view === 'home' ? 'stage-on' : 'list-on'}">${headerHTML()}${main}</main>` + navHTML() + sheetHTML();
}
function render() {
  if (!S) { app.innerHTML = sheetHTML(); let g = 0; while (measurePagers() && g++ < 3) app.innerHTML = sheetHTML(); return; }
  app.innerHTML = buildHTML();
  let guard = 0; while (measurePagers() && guard++ < 3) app.innerHTML = buildHTML();
  fitOptional();
  floats(); ui.anim = null;
  if (ui.focus) { const f = document.querySelector(ui.focus); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { } } ui.focus = null; }
}
function floats() { const e = S.enc; if (!e || !e.fx || !e.fx.length) return; const sc = document.getElementById('scene'); if (!sc) return; e.fx.forEach((f, i) => { const el = document.createElement('div'); el.className = 'float ' + (f.on === 'me' ? 'me' : 'v'); el.textContent = '−' + f.n; el.style.left = f.on === 'me' ? '30%' : '72%'; el.style.top = (28 + i * 10) + '%'; el.style.animationDelay = (i * 0.12) + 's'; sc.appendChild(el); }); e.fx = []; }
function nextSheet() { if (ui.sheet || !S || S.enc) return; const p = S.pending[0]; if (p) ui.sheet = { t: p }; }

// ---------- Drawer handle ----------
function handleHTML() { return ''; return `<button class="handle" data-act="drawer" aria-label="${ui.drawer === 'full' ? 'Lower the panel' : 'Raise the panel'}" aria-expanded="${ui.drawer === 'full'}"><i></i></button>`; }
let drag = null;
app.addEventListener('pointerdown', ev => {
  if (prefs.layout !== 'drawer') return; const h = ev.target.closest('.handle'); if (!h) return;
  const m = app.querySelector('main'), p = app.querySelector('main .panel'); if (!m || !p) return;
  drag = { y: ev.clientY, h: p.offsetHeight, mh: m.clientHeight, m, moved: false }; h.setPointerCapture(ev.pointerId);
});
app.addEventListener('pointermove', ev => {
  if (!drag) return; const dy = ev.clientY - drag.y; if (Math.abs(dy) > 6) drag.moved = true; if (!drag.moved) return;
  const hh = (app.querySelector('main .hdr') || {}).offsetHeight || 0; const nh = clamp(drag.h - dy, drag.mh * 0.25, drag.mh - hh); drag.m.classList.add('dragging'); drag.m.style.setProperty('--dh', nh + 'px');
});
app.addEventListener('pointerup', ev => {
  if (!drag) return; const d = drag; drag = null; if (!d.moved) return;
  const p = app.querySelector('main .panel'); const hh = (app.querySelector('main .hdr') || {}).offsetHeight || 0; const ratio = p.offsetHeight / (d.mh - hh); ui.drawer = ratio > 0.76 ? 'full' : 'peek'; d.m.classList.remove('dragging'); d.m.style.removeProperty('--dh');
  ui.keepScroll = true; ui.dragged = true; render();
});

// ---------- Actions ----------
app.addEventListener('click', ev => { if (ui.dragged) { ui.dragged = false; return; } const el = ev.target.closest('[data-act]'); if (!el || el.disabled) return; if (el.dataset.act === 'ov' && ev.target.closest('[data-stop]')) return; act(el.dataset.act, el.dataset); });
function act(a, d) {
  const e = S && S.enc;
  switch (a) {
    case 'begin': { const nm = (document.getElementById('nm').value || 'Lid').trim().slice(0, 24) || 'Lid'; newGame(nm); ui.sheet = null; ui.view = 'home'; break; }
    case 'view': ui.view = d.v; ui.pages = {}; break;
    case 'sheet': ui.sheet = { t: d.s }; ui.pages = {}; ui.dtab = 'form'; ui.atab = 'abil'; break;
    case 'move': ui.moving = +d.i; ui.sheet = null; break;
    case 'move-cancel': ui.moving = null; break;
    case 'copy': { const t = document.getElementById('exp'); const done = () => { const c = document.getElementById('copied'); if (c) c.textContent = 'Copied.'; }; try { navigator.clipboard.writeText(t.value).then(done, () => { t.select(); }); } catch (e) { t.select(); } return; }
    case 'restore': { const v = (document.getElementById('imp') || {}).value || ''; const r = loadCode(v); if (r !== true) { ui.importErr = r; break; } ui.importErr = ''; ui.sheet = null; ui.view = 'home'; sys('[Save restored. Welcome back.]'); catchUp(); break; }
    case 'page': ui.pages[d.k] = Math.max(0, (ui.pages[d.k] || 0) + (+d.d)); break;
    case 'sub': ui.sub = d.k; ui.pages = {}; break;
    case 'dtab': ui.dtab = d.k; break;
    case 'atab': ui.atab = d.k; break;
    case 'close': case 'ov': ui.sheet = S ? null : { t: 'intro' }; ui.importErr = ''; break;
    case 'pref': prefs[d.k] = d.v; lsSet(PREF_KEY, prefs); applyPrefs(); remeasure(); break;
    case 'drawer': ui.drawer = ui.drawer === 'full' ? 'peek' : 'full'; break;
    case 'wait': { ui.drawer = 'full'; const r = startEncounter(nextArrival()); if (r && r.companion) ui.sheet = { t: 'companion' }; ui.focus = '.act.go'; break; }
    case 'rest': if (rest()) sys('[You close your lid and rest. Fully healed.]'); break;
    case 'nap': { const r = nap(); if (r) { autoManage(); ui.sheet = { t: 'report', r }; } break; }
    case 'setform': S.form = d.k; ui.keepScroll = true; break;
    case 'pickbait': { const i = +d.i; S.bait = i < 0 ? null : S.grid[i] && S.grid[i].uid; ui.keepScroll = true; break; }
    case 'moveto': if (moveTo(d.k)) ui.sheet = null; break;
    case 'lure': actLure(); if (S.enc.phase === 'combat') ui.anim = 'chomp'; ui.focus = '.act.best, .act'; break;
    case 'pass': actLetPass(); ui.focus = '[data-act=close-enc]'; break;
    case 'lunge': actLunge(); break;
    case 'letgo': elog(`You let ${VISITORS[e.vid].name} walk away.`); finish('missed'); break;
    case 'do': if (d.k === 'retreat') { retreat(); ui.focus = '[data-act=close-enc]'; break; } { if (ui.sheet && ui.sheet.t === 'moves') ui.sheet = null; const hp0 = S.hp; playerAction(d.k, d.c != null ? +d.c : undefined); ui.anim = ['bite', 'weapon', 'clench'].includes(d.k) ? 'chomp' : S.hp < hp0 ? 'hurt' : null; if (S.enc && S.enc.phase === 'done') ui.focus = '[data-act=close-enc]'; else ui.focus = '.act.best'; break; }
    case 'close-enc': { ui.drawer = 'peek'; closeEncounter(); autoManage(); ui.anim = 'lick'; ui.focus = '[data-act=wait]'; break; }
    case 'asi': applyAsi(d.k); S.pending.shift(); ui.sheet = null; break;
    case 'evo': evolveTo(d.k); S.pending.shift(); autoManage(); ui.sheet = null; break;
    case 'comp': chooseCompanion(d.k, []); ui.sheet = null; if (d.k === 'snack') ui.anim = 'lick'; break;
    case 'reset-yes': lsSet(SAVE_KEY, null); S = null; ui.sheet = { t: 'intro' }; render(); return;
    case 'item': ui.sheet = { t: 'item', i: +d.i }; ui.pages = {}; break;
    case 'cell': if (ui.moving != null) { moveCell(ui.moving, +d.i); ui.moving = null; } break;
    case 'setbait': { const c = S.grid[+d.i]; S.bait = S.bait === c.uid ? null : c.uid; ui.sheet = null; ui.keepScroll = true; break; }
    case 'eat': { const m = []; eatItem(+d.i, m); m.forEach(x => sys(x.text)); autoManage(); ui.sheet = null; ui.keepScroll = true; break; }
    case 'digest': if (startDigest(+d.i)) { sys('[Digestion started. Please do not shake the box.]'); autoManage(); } ui.sheet = null; ui.keepScroll = true; break;
    case 'attune': if (!toggleAttune(+d.i)) sys('[Only 3 magic items can be switched on at once.]', 'bad'); ui.sheet = null; ui.keepScroll = true; break;
    case 'spit': if (spitOut(+d.i)) autoManage(); ui.sheet = null; ui.keepScroll = true; break;
  }
  if (S) { nextSheet(); save(); }
  render();
}
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && ui.sheet && ['settings', 'howto', 'disguise', 'move', 'item', 'report', 'reset', 'max'].includes(ui.sheet.t)) { ui.sheet = null; render(); } });

// ---------- Save, time, sync ----------
const cloud = { db: null, uid: null, t: null };
function save() { if (!S) return; S.lastSeen = Date.now(); S.savedAt = Date.now(); lsSet(SAVE_KEY, S); if (cloud.db) { clearTimeout(cloud.t); cloud.t = setTimeout(pushCloud, 2500); } }
async function pushCloud() { try { await cloud.db.doc('data/users/' + cloud.uid + '/save').set(JSON.parse(JSON.stringify({ s: S, savedAt: S.savedAt }))); } catch (e) { } }
async function cloudInit() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  try {
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); if (!db || !user) return;
    const uid = await user.id(); if (!uid) return; cloud.db = db; cloud.uid = uid;
    const snap = await db.doc('data/users/' + uid + '/save').get(); const r = snap.exists ? snap.data() : null;
    if (r && r.s && (r.savedAt || 0) > ((S && S.savedAt) || 0) && !(S && S.enc)) { if (migrate(r.s)) { lsSet(SAVE_KEY, S); ui.sheet = null; catchUp(); render(); } }
    else if (S) pushCloud();
  } catch (e) { }
}
function catchUp() {
  const now = Date.now(); tickNaps(now);
  const mins = Math.min(480, (now - (S.lastSeen || now)) / 60000);
  if (mins >= 2 && !S.enc) { const r = simulate(mins, true); autoManage(); if (!ui.sheet) ui.sheet = { t: 'report', r }; }
  else if (mins > 0) simulate(mins, false);
  S.lastTick = now; save();
}
setInterval(() => {
  if (!S) return; const now = Date.now(); const mins = (now - (S.lastTick || now)) / 60000;
  if (mins >= 1) { S.lastTick = now; const before = JSON.stringify([S.belly, S.hp, !!S.digest, S.naps, S.notoriety]); simulate(mins, false); tickNaps(now); save(); if (before !== JSON.stringify([S.belly, S.hp, !!S.digest, S.naps, S.notoriety]) && !document.querySelector('.ov')) { ui.keepScroll = true; render(); } else tickTimers(); return; }
  tickTimers();
}, 1000);
document.addEventListener('visibilitychange', () => { if (!S) return; if (document.hidden) save(); else { catchUp(); nextSheet(); render(); } });
let rsT = null;
window.addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { remeasure(); if (S || ui.sheet) render(); }, 150); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { remeasure(); if (S || ui.sheet) render(); });
const APP_VERSION = '0.5.0';
function saveCode() { return 'CMV1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function loadCode(code) {
  code = String(code || '').trim().replace(/\s+/g, '');
  if (!code.startsWith('CMV1:')) return 'That does not look like a save code. It should start with CMV1:';
  let data; try { data = JSON.parse(decodeURIComponent(escape(atob(code.slice(5))))); } catch (e) { return 'That code is damaged or incomplete. Check you copied all of it.'; }
  const prev = S; if (!migrate(data)) { S = prev; return 'That save is from a version this game cannot read.'; }
  S.lastSeen = Date.now(); S.enc = null; lsSet(SAVE_KEY, S); return true;
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !/claude|anthropic/.test(location.host)) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { }); }); }
function start(hot) {
  const loaded = hot && hot.s ? hot.s : lsGet(SAVE_KEY);
  if (loaded && migrate(loaded)) { if (hot && hot.view) ui.view = hot.view; catchUp(); nextSheet(); render(); }
  else { ui.sheet = { t: 'intro' }; render(); }
  cloudInit();
}
if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ s: S, view: ui.view }));
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start); else start((window.claude && window.claude.hot && window.claude.hot.data) || {});
