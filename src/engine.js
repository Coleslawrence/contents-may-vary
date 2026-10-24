// ===== Contents May Vary — rules and data (no DOM) =====
'use strict';
const VERSION = 1;
let RNG = Math.random;
const rnd = () => RNG();
const ri = n => Math.floor(rnd() * n);
const pick = a => a[ri(a.length)];
function wpick(items, ws) { let t = 0; ws.forEach(w => t += w); let x = rnd() * t; for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; } return items[items.length - 1]; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const die = n => 1 + ri(n);
function parseExpr(e) { const m = String(e).match(/^(\d+)d(\d+)([+-]\d+)?$/); return m ? { n: +m[1], s: +m[2], b: +(m[3] || 0) } : { n: 0, s: 0, b: +e || 0 }; }
function roll(e, crit) { const p = parseExpr(e); let t = p.b; const n = crit ? p.n * 2 : p.n; for (let i = 0; i < n; i++) t += die(p.s); return Math.max(0, t); }
function avg(e) { const p = parseExpr(e); return p.n * (p.s + 1) / 2 + p.b; }
// mode: >0 advantage, <0 disadvantage
function d20(mode) { const a = die(20), b = die(20); if (mode > 0) return { r: Math.max(a, b), a, b, mode: 1 }; if (mode < 0) return { r: Math.min(a, b), a, b, mode: -1 }; return { r: a, a, mode: 0 }; }
const sgn = n => (n >= 0 ? '+' : '−') + Math.abs(n);

// ---------- Core tables ----------
const ABILS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const ABIL_NAME = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' };
const ABIL_USE = { STR: 'Bite, grapple, swallow DC', DEX: 'Stealth disguises, initiative', CON: 'Hit points, belly, acid', INT: 'Spotting fakes, item use', WIS: 'Insight into visitors', CHA: 'Deception disguises, lures' };
const SIZES = { T: { n: 0, name: 'Tiny', belly: 1 }, S: { n: 1, name: 'Small', belly: 2 }, M: { n: 2, name: 'Medium', belly: 4 }, L: { n: 3, name: 'Large', belly: 8 } };
const SIZE_BY_N = ['T', 'S', 'M', 'L'];
const CR_XP = { '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700 };
const XP_AT = [0, 0, 80, 300, 900, 2200, 4500, 8000, 13500, 21500, 32000]; // total XP to reach level n
const MAX_LVL = 10;
const profFor = l => 2 + Math.floor((l - 1) / 4);
const ASI_LVLS = [4, 8];

const TYPES = ['beast', 'humanoid', 'undead', 'fiend', 'celestial', 'construct', 'dragon', 'fey', 'elemental', 'giant', 'ooze', 'plant', 'aberration', 'monstrosity'];
const TYPE_NAME = { beast: 'Beast', humanoid: 'Humanoid', undead: 'Undead', fiend: 'Fiend', celestial: 'Celestial', construct: 'Construct', dragon: 'Dragon', fey: 'Fey', elemental: 'Elemental', giant: 'Giant', ooze: 'Ooze', plant: 'Plant', aberration: 'Aberration', monstrosity: 'Monstrosity' };
const SPEAKERS = ['humanoid', 'fiend', 'celestial', 'dragon', 'fey'];
const ESS_AT = [3, 8];
const ESSENCE = {
  beast: { name: 'Feral Bite', i: '+1 bite damage and +1 initiative.', ii: '+2 bite damage and +2 initiative.' },
  humanoid: { name: 'Learned Tongue', i: 'You can Sweet Talk visitors who speak (+3 to the lure).', ii: 'Sweet Talk gives +5, and your Charisma rises by 2.' },
  undead: { name: 'Grave Gut', i: 'Swallowed visitors take an extra 1d4 necrotic each turn.', ii: 'Swallowed visitors take an extra 1d8 necrotic each turn. You learn the Coffin form.' },
  fiend: { name: 'Hellfire Belly', i: 'You can breathe fire: 2d6, Dexterity save for half, recharge 5–6.', ii: 'Your fire breath deals 3d6.' },
  celestial: { name: 'Blessed Hinges', i: 'Heal 1d4 at the start of each of your turns in a fight.', ii: 'Heal 1d8 at the start of each of your turns in a fight.' },
  construct: { name: 'Clockwork Jaw', i: '+1 AC, and your bite crits on 19–20.', ii: '+2 AC, and your bite crits on 18–20.' },
  dragon: { name: 'Hoard Sense', i: "You see a visitor's loot before you lure them, and gold bait is +1.", ii: 'Gold bait is +2.' },
  fey: { name: 'Glamour Lid', i: '+2 to every disguise.', ii: 'Advantage on every disguise roll.' },
  elemental: { name: 'Elemental Core', i: 'You take half damage from fire.', ii: 'You take half damage from fire and acid, and your bite deals +1d4 fire.' },
  giant: { name: 'Colossal Lid', i: '+5 max HP and +2 belly.', ii: '+12 max HP and +4 belly.' },
  ooze: { name: 'Acid Lining', i: 'Your acid deals +1d6, and you digest items twice as fast.', ii: 'Your acid deals +2d6, and you digest items three times as fast.' },
  plant: { name: 'Root Tongue', i: '+2 to Tongue Lash, and advantage on bites against visitors who flee.', ii: '+4 to Tongue Lash, and +2 to your escape DC.' },
  aberration: { name: 'Many-Mouthed', i: 'A second mouth bites for 1d4 every turn.', ii: 'The second mouth bites for 1d8.' },
  monstrosity: { name: 'Apex Predator', i: 'Your bites deal +1d6 to visitors below half HP.', ii: 'Your bites deal +2d6 to visitors below half HP.' },
};

// ---------- Evolution ----------
const TIERS = {
  lesser: { name: 'Lesser Mimic', size: 'S', swallow: 0, grid: [3, 3], ac: 12, acid: '1d6', belly: 0, desc: 'A small, hungry box. You can swallow Tiny creatures.' },
  chest: { name: 'Chest Mimic', size: 'M', swallow: 1, grid: [4, 4], ac: 13, acid: '2d6', belly: 2, desc: 'A proper chest. You can swallow Small creatures, and you learn the Barrel form.' },
  vault: { name: 'Vault Mimic', size: 'L', swallow: 2, grid: [5, 4], ac: 16, acid: '3d6', belly: 4, branch: true, desc: 'Armoured and patient. AC 16, +2 HP per level, and your grip is +3 harder to escape.' },
  wardrobe: { name: 'Wardrobe Mimic', size: 'L', swallow: 2, grid: [5, 4], ac: 14, acid: '3d6', belly: 4, branch: true, desc: 'A shapeshifter. +2 to every disguise, Play Dead has advantage, and you learn the Wardrobe and Coffin forms.' },
  doorway: { name: 'Doorway Mimic', size: 'L', swallow: 2, grid: [5, 4], ac: 14, acid: '3d6', belly: 4, branch: true, desc: 'A door that goes one way. Once per fight, swallow without grappling first. You learn the Door form, and moving costs nothing.' },
  barrel: { name: 'Barrel Mimic', size: 'L', swallow: 2, grid: [5, 4], ac: 14, acid: '3d6', belly: 4, branch: true, desc: 'A chaser. Bite twice per action, and visitors who flee must escape your grip to get away.' },
};
const BRANCHES = ['vault', 'wardrobe', 'doorway', 'barrel'];

// ---------- Forms ----------
const FORMS = {
  chest: { name: 'Treasure Chest', skill: 'Deception', bonus: 2, attract: ['gold'], note: 'Everybody loves a large chest. Thieves look closer.' },
  barrel: { name: 'Barrel', skill: 'Stealth', bonus: 2, attract: ['food', 'rest'], note: 'Nobody suspects a barrel. Nobody.' },
  bookshelf: { name: 'Bookshelf', skill: 'Deception', bonus: 3, attract: ['knowledge', 'magic'], note: 'Scholars reach in. Scholars do not reach out.' },
  door: { name: 'Door', skill: 'Stealth', bonus: 4, attract: ['travel', 'curiosity'], note: 'Everyone has to go through a door eventually.' },
  wardrobe: { name: 'Wardrobe', skill: 'Deception', bonus: 3, attract: ['curiosity', 'rest'], note: 'Step inside. There is definitely another world in here.' },
  coffin: { name: 'Coffin', skill: 'Stealth', bonus: 3, attract: ['holy', 'gold'], note: 'Grave robbers, priests and necromancers all want to look inside.' },
};
const WANTS = { gold: 'Treasure', magic: 'Magic', knowledge: 'Knowledge', food: 'Food', rest: 'Rest', holy: 'Holy things', travel: 'A way through', curiosity: 'Curiosity' };
const TAG_WANT = { gold: 'gold', dragon: 'gold', arcane: 'magic', paper: 'knowledge', food: 'food', holy: 'holy', music: 'curiosity', cloth: 'rest', blade: 'gold', potion: 'magic' };

// ---------- Items ----------
const RARITY = ['common', 'uncommon', 'rare'];
const DIGEST_MIN = { common: 2, uncommon: 6, rare: 15 };
const ITEMS = {
  copper: { name: 'Copper Coins', tags: ['gold'], r: 'common', fuse: 'silver', bait: 1, desc: 'Bait +1 for anyone who wants treasure.' },
  silver: { name: 'Silver Hoard', tags: ['gold'], r: 'uncommon', fuse: 'goldhoard', bait: 2, desc: 'Bait +2 for anyone who wants treasure.' },
  goldhoard: { name: 'Gold Hoard', tags: ['gold', 'dragon'], r: 'rare', bait: 4, desc: 'Bait +4. Dragons can smell it from three floors away.' },
  gold_ring: { name: 'Gold Ring', tags: ['gold'], r: 'uncommon', bait: 2, desc: 'Bait +2. Shiny, small, irresistible.' },
  rusty_dagger: { name: 'Rusty Dagger', tags: ['blade', 'metal'], r: 'common', weapon: '1d4', fuse: 'gut_blade', desc: 'Tongue-wield it: 1d4. +1 damage for each adjacent blade.' },
  gut_blade: { name: 'Gut-Forged Blade', tags: ['blade', 'metal'], r: 'uncommon', weapon: '1d10', desc: 'Three daggers, one blade, forged by acid. 1d10.' },
  shortsword: { name: 'Shortsword', tags: ['blade', 'metal'], r: 'common', weapon: '1d6', desc: 'Tongue-wield it: 1d6. +1 damage for each adjacent blade.' },
  longsword: { name: 'Longsword', tags: ['blade', 'metal'], r: 'common', weapon: '1d8', desc: 'Tongue-wield it: 1d8. +1 damage for each adjacent blade.' },
  big_club: { name: 'Ogre Club', tags: ['blunt'], r: 'common', weapon: '2d4', hit: -1, desc: 'Too big for you. You use it anyway. 2d4, −1 to hit.' },
  mimic_tooth: { name: 'Rival Mimic Tooth', tags: ['blade', 'monstrosity'], r: 'rare', weapon: '1d12', desc: 'A tooth from your own kind. 1d12.' },
  hesk_crowbar: { name: "Hesk's Crowbar", tags: ['blunt', 'metal'], r: 'rare', attune: true, weapon: '1d8+2', hit: 2, guard: 3, desc: 'Attuned: tongue-wield for 1d8+2 at +2, and investigators lose their advantage on you.' },
  leather: { name: 'Leather Armour', tags: ['armor', 'cloth'], r: 'common', ac: 1, desc: '+1 AC. You wear it on the inside.' },
  knight_plate: { name: "Knight's Plate", tags: ['armor', 'metal'], r: 'uncommon', ac: 3, clank: 2, desc: '+3 AC, but −2 to Stealth disguises. You clank.' },
  bone: { name: 'Bone', tags: ['bone'], r: 'common', fuse: 'bone_cage', desc: '+1 AC for each pair of adjacent bones (up to +3).' },
  bone_cage: { name: 'Bone Cage', tags: ['bone', 'armor'], r: 'uncommon', ac: 2, desc: '+2 AC. A ribcage inside a box.' },
  rope: { name: 'Rope', tags: ['tool'], r: 'common', grip: 2, desc: '+2 to the DC to escape your grapple.' },
  lockpicks: { name: 'Lockpicks', tags: ['tool'], r: 'common', guard: 3, desc: '+3 against Investigation. You know how they pick.' },
  map_scrap: { name: 'Map Scrap', tags: ['paper'], r: 'common', fuse: 'treasure_map', desc: 'Part of a map. Three of them might make a whole one.' },
  treasure_map: { name: 'Treasure Map', tags: ['paper'], r: 'uncommon', unlock: 'vault', desc: 'Shows the way to the Hidden Vault.' },
  bread: { name: 'Stale Bread', tags: ['food'], r: 'common', use: 'eat', belly: 1, desc: 'Eat it: +1 belly.' },
  glowcap: { name: 'Glowcap', tags: ['food', 'arcane'], r: 'common', use: 'eat', belly: 1, heal: '1d4', desc: 'Eat it: +1 belly and heal 1d4.' },
  healing_potion: { name: 'Potion of Healing', tags: ['potion'], r: 'common', use: 'heal', heal: '2d4+2', desc: 'Drink it in a fight: heal 2d4+2.' },
  spellbook: { name: 'Spellbook', tags: ['paper', 'arcane'], r: 'common', desc: 'Fire breath +1d6 if next to an Ember Wand. Digest it to learn the Bookshelf form.' },
  ember_wand: { name: 'Ember Wand', tags: ['arcane', 'fire'], r: 'uncommon', attune: true, desc: 'Attuned: breathe fire for 2d6 (Dexterity save for half, recharge 5–6).' },
  ember_core: { name: 'Ember Core', tags: ['fire', 'elemental'], r: 'common', desc: 'Fire breath +1d4 if next to an Ember Wand.' },
  holy_symbol: { name: 'Holy Symbol', tags: ['holy'], r: 'common', desc: 'Bites deal +1d4 radiant to undead and fiends.' },
  halo: { name: "Cherub's Halo", tags: ['holy'], r: 'uncommon', attune: true, desc: 'Attuned: +1 to saving throws and heal 1 at the start of each of your turns.' },
  lute: { name: 'Lute', tags: ['music'], r: 'common', use: 'charm', desc: 'Play it in a fight (once): a Charisma check to charm the visitor for a turn.' },
  pixie_dust: { name: 'Pixie Dust', tags: ['arcane'], r: 'common', use: 'blind', desc: 'Sneeze it in a fight: the visitor is blinded for 2 turns.' },
  gear: { name: 'Clockwork Gear', tags: ['tool', 'construct'], r: 'common', init: 1, fuse: 'clockwork_jaw', desc: '+1 initiative. Ticks.' },
  clockwork_jaw: { name: 'Clockwork Jaw', tags: ['construct', 'metal'], r: 'uncommon', extraBite: '1d4', desc: 'Your bites deal +1d4.' },
  dragon_scale: { name: 'Dragon Scale', tags: ['dragon', 'armor'], r: 'uncommon', ac: 1, fireRes: true, desc: '+1 AC and half damage from fire.' },
  contract: { name: 'Infernal Contract', tags: ['arcane', 'cursed'], r: 'uncommon', cursed: true, str: 2, cha: -1, desc: '+2 Strength, −1 Charisma. You have no hands. It still counts. Cursed: digest it to get rid of it.' },
  bag: { name: 'Bag of Holding', tags: ['cloth', 'arcane'], r: 'rare', rows: 1, noDigest: true, desc: 'Your stomach gains a row. You are now bigger on the inside.' },
  ring_prot: { name: 'Ring of Protection', tags: ['gold', 'arcane'], r: 'rare', attune: true, ac: 1, saves: 1, desc: 'Attuned: +1 AC and +1 to saving throws.' },
  cloak: { name: 'Cloak of Elvenkind', tags: ['cloth', 'arcane'], r: 'uncommon', attune: true, stealth: 3, desc: 'Attuned: +3 to Stealth disguises.' },
  salt: { name: "Hunter's Salt", tags: ['junk', 'cursed'], r: 'common', cursed: true, saltPen: true, desc: 'Your acid deals −1d6 while this is inside you. Cursed: digest it.' },
  wet_sock: { name: 'Wet Sock', tags: ['junk'], r: 'common', desc: 'It does nothing. It has always done nothing.' },
};
const DIGEST_TAGS = {
  blade: { name: 'Serrated Teeth', each: '+1 bite damage', max: 3 },
  armor: { name: 'Thick Lid', each: '+1 AC', max: 2 },
  bone: { name: 'Calcified Hinges', each: '+1 AC', max: 1 },
  gold: { name: 'Gilded', each: '+1 to Deception disguises', max: 2 },
  arcane: { name: 'Arcane Lining', each: '+1 breath damage and save DC', max: 2 },
  holy: { name: 'Sanctified', each: '+1 to saving throws', max: 2 },
  food: { name: 'Stretchy Gut', each: '+2 belly', max: 2 },
  tool: { name: 'Strong Grip', each: '+1 to your escape DC', max: 2 },
  paper: { name: 'Well Read', each: '+1 to Insight', max: 2 },
  fire: { name: 'Ember Gut', each: '+1 fire damage on bites', max: 2 },
  music: { name: 'Hums Along', each: '+1 to Deception disguises', max: 1 },
  metal: { name: 'Iron Stomach', each: '+1 acid damage', max: 2 },
  cloth: { name: 'Soft Lining', each: '+3 max HP', max: 2 },
  potion: { name: 'Alchemical Gut', each: 'healing items heal +2', max: 1 },
};

// ---------- Visitors ----------
const VISITORS = {};
function V(id, name, type, size, cr, o) { VISITORS[id] = Object.assign({ id, name, type, size, cr, xp: CR_XP[cr], dex: 0, esc: 0, wis: 0, multi: 1, flee: 0.3, loot: [], wants: [], inv: null, specials: [] }, o); }
V('rat', 'Cave Rat', 'beast', 'T', '0', { ac: 10, hp: 3, atk: ['Nibble', 2, '1d2'], pp: 10, wants: ['food'], flee: 0.6, line: 'A rat sniffs at your keyhole.', eat: 'Crunchy. Mostly tail.' });
V('goblin', 'Goblin Scavenger', 'humanoid', 'S', '1/4', { ac: 13, hp: 7, atk: ['Shiv', 4, '1d6+2'], pp: 9, dex: 2, esc: 2, wants: ['gold', 'food'], loot: [['rusty_dagger', .5], ['copper', .5], ['bread', .3]], line: 'A goblin is muttering about "finders keepers".', eat: 'Finders keepers.' });
V('kobold', 'Kobold Trapper', 'humanoid', 'S', '1/8', { ac: 12, hp: 5, atk: ['Dagger', 4, '1d4+2'], pp: 8, inv: 3, dex: 2, esc: 0, wants: ['gold'], loot: [['rope', .35], ['copper', .4], ['map_scrap', .35], ['rusty_dagger', .2]], line: 'A kobold taps the floor ahead with a stick. It knows traps.', eat: 'It knew traps. It did not know you.' });
V('sprout', 'Mushroom Sprout', 'plant', 'S', '0', { ac: 10, hp: 4, atk: ['Bonk', 1, '1d4'], pp: 8, wants: ['rest'], flee: 0.2, loot: [['glowcap', .7]], line: 'A mushroom waddles in, looking for somewhere damp to sit.', eat: 'Earthy. A little spongy.' });
V('recruit', 'Hopeful Recruit', 'humanoid', 'M', '1/4', { ac: 12, hp: 9, atk: ['Training Sword', 3, '1d6+1'], pp: 10, dex: 1, esc: 1, wants: ['gold', 'magic', 'travel'], loot: [['shortsword', .3], ['healing_potion', .4], ['copper', .5], ['wet_sock', .15]], line: 'A fresh recruit is trying to reach Level 5. They look at you with hope.', eat: 'They did not reach Level 5.' });
V('pixie', 'Pixie', 'fey', 'T', '1/4', { ac: 15, hp: 3, atk: ['Pinch', 4, '1d2'], pp: 14, dex: 4, esc: 4, wants: ['magic', 'curiosity'], flee: 0.8, loot: [['pixie_dust', .7]], line: 'A pixie flits around you, giggling.', eat: 'Fizzy. Your teeth sparkle now.' });
V('eye', 'Floating Eye', 'aberration', 'T', '1/8', { ac: 12, hp: 5, atk: ['Stare', 2, '1d4'], pp: 15, wants: ['curiosity'], flee: 0.4, line: 'Something that is mostly eye floats in.', eat: 'It watched the whole time.' });
V('bandit', 'Bandit', 'humanoid', 'M', '1/8', { ac: 12, hp: 11, atk: ['Scimitar', 3, '1d6+1'], pp: 10, dex: 1, esc: 1, wants: ['gold'], loot: [['shortsword', .3], ['copper', .6], ['leather', .3], ['rusty_dagger', .3]], line: 'A bandit is counting what is left of their share.', eat: 'You took their share.' });
V('skeleton', 'Skeleton', 'undead', 'M', '1/4', { ac: 13, hp: 13, atk: ['Rusty Blade', 4, '1d6+2'], pp: 9, dex: 2, esc: 0, wants: ['gold'], flee: 0, loot: [['bone', .8], ['bone', .4], ['shortsword', .25]], line: 'A skeleton rattles past. Old habits: it checks every chest.', eat: 'Calcium.' });
V('thief', 'Halfling Thief', 'humanoid', 'S', '1/2', { ac: 14, hp: 13, atk: ['Short Blade', 4, '1d6+2'], pp: 13, inv: 5, chestAdv: true, dex: 4, esc: 3, wants: ['gold', 'magic'], flee: 0.4, loot: [['lockpicks', .4], ['copper', .6], ['gold_ring', .25], ['cloak', .1], ['map_scrap', .3]], line: 'A halfling thief cracks their knuckles. Chests are their speciality.', eat: 'Professional hazard.' });
V('apprentice', 'Apprentice Wizard', 'humanoid', 'M', '1/4', { ac: 11, hp: 9, atk: ['Fire Bolt', 4, '1d10', 'fire'], pp: 10, inv: 4, wants: ['knowledge', 'magic'], loot: [['spellbook', .5], ['ember_wand', .2], ['pixie_dust', .2], ['glowcap', .2]], line: 'An apprentice wizard is looking for "primary sources".', eat: 'You absorbed some primary sources.' });
V('acolyte', 'Acolyte', 'humanoid', 'M', '1/4', { ac: 10, hp: 9, atk: ['Mace', 2, '1d6'], pp: 12, wis: 2, wants: ['holy', 'rest'], heal: '1d8+2', specials: [{ n: 'Sacred Flame', chance: .5, save: 'DEX', dc: 12, dmg: '1d8', kind: 'radiant' }], loot: [['holy_symbol', .5], ['healing_potion', .5], ['bread', .3]], line: 'An acolyte murmurs a prayer for anyone lost down here.', eat: 'The prayer went unanswered.' });
V('imp', 'Imp', 'fiend', 'T', '1', { ac: 13, hp: 10, atk: ['Sting', 5, '1d4+3'], pp: 11, dex: 3, esc: 3, wants: ['magic', 'curiosity'], flee: 0.5, invis: true, loot: [['contract', .35], ['ember_core', .3]], line: 'An imp lounges on the air, looking for a soul to bargain with.', eat: 'Spicy. Something just signed you up for a newsletter.' });
V('darkmantle', 'Darkmantle', 'monstrosity', 'S', '1/2', { ac: 11, hp: 22, atk: ['Crush', 5, '1d6+3'], pp: 10, dex: 1, esc: 3, wants: ['food'], aggressive: true, flee: 0.2, specials: [{ n: 'Darkness', chance: .3, once: true, effect: 'dark' }], loot: [['bone', .3]], line: 'A darkmantle hangs from the ceiling. Another ambush predator. Awkward.', eat: 'Professional courtesy, briefly considered.' });
V('ooze', 'Gray Ooze', 'ooze', 'M', '1/2', { ac: 8, hp: 22, atk: ['Pseudopod', 3, '2d6+1', 'acid'], pp: 8, dex: -2, esc: 1, wants: ['food'], aggressive: true, flee: 0, corrode: true, loot: [['wet_sock', .1]], line: 'A gray ooze slides along the floor, dissolving the grout.', eat: 'Eating a stomach is a strange experience.' });
V('pseudo', 'Pseudodragon', 'dragon', 'T', '1/4', { ac: 13, hp: 7, atk: ['Bite', 4, '1d4+2'], pp: 13, dex: 2, esc: 2, wants: ['gold'], flee: 0.5, specials: [{ n: 'Sting', chance: .35, save: 'CON', dc: 11, dmg: '0', effect: 'poison' }], loot: [['dragon_scale', .35], ['copper', .4]], line: 'A pseudodragon circles you. It can smell treasure.', eat: 'Tastes like a very small dragon.' });
V('clockwork', 'Clockwork Scout', 'construct', 'S', '1/4', { ac: 14, hp: 10, atk: ['Spring Blade', 4, '1d6+2'], pp: 12, dex: 2, esc: 1, wants: ['knowledge'], flee: 0, loot: [['gear', .7], ['gear', .3]], line: 'A clockwork scout is mapping the dungeon, one tick at a time.', eat: 'Crunchy. Your stomach now ticks.' });
V('cherub', 'Lost Cherub', 'celestial', 'T', '1/2', { ac: 13, hp: 9, atk: ['Radiant Touch', 4, '1d6+2', 'radiant'], pp: 13, dex: 3, esc: 2, wis: 3, wants: ['holy'], flee: 0.5, loot: [['halo', .3], ['holy_symbol', .3]], line: 'A small, chubby angel is very lost.', eat: 'Angel food.' });
V('mephit', 'Magma Mephit', 'elemental', 'S', '1/2', { ac: 11, hp: 22, atk: ['Claws', 3, '1d4+1', 'fire'], pp: 10, dex: 1, esc: 1, wants: ['magic'], specials: [{ n: 'Fire Breath', chance: .3, save: 'DEX', dc: 11, dmg: '2d6', kind: 'fire', half: true }], loot: [['ember_core', .6]], line: 'A magma mephit drips across the floor, humming.', eat: 'Hot. Very hot. Worth it.' });
V('ogre', 'Ogre', 'giant', 'L', '2', { ac: 11, hp: 59, atk: ['Greatclub', 6, '2d8+4'], pp: 8, dex: -1, esc: 4, wants: ['food'], aggressive: true, flee: 0.15, loot: [['big_club', .6], ['copper', .6], ['copper', .6], ['bone', .5], ['bread', .5]], line: 'An ogre is looking for a snack. So are you.', eat: 'Far too big. That has never stopped you.' });
V('knight', 'Knight', 'humanoid', 'M', '3', { ac: 18, hp: 52, atk: ['Greatsword', 5, '2d6+3'], multi: 2, pp: 10, dex: 0, esc: 3, wis: 2, wants: ['holy', 'gold', 'travel'], flee: 0.1, loot: [['knight_plate', .5], ['longsword', .6], ['ring_prot', .15], ['healing_potion', .5]], line: 'A knight in full plate is checking the corners. Thoroughly.', eat: 'Heavy metal.' });
V('wolf', 'Wolf', 'beast', 'M', '1/4', { ac: 13, hp: 11, atk: ['Bite', 4, '2d4+2'], pp: 13, dex: 2, esc: 2, wants: ['food'], aggressive: true, flee: 0.3, loot: [['bone', .3]], line: 'A wolf has your scent. You do not have a scent. It has it anyway.', eat: 'Who is the big bad now.' });
V('merchant', 'Travelling Merchant', 'humanoid', 'M', '0', { ac: 10, hp: 6, atk: ['Walking Stick', 2, '1d4'], pp: 11, inv: 2, wants: ['gold', 'travel'], flee: 0.7, loot: [['copper', .8], ['copper', .5], ['gold_ring', .3], ['bag', .08], ['bread', .4], ['map_scrap', .3]], line: 'A merchant is looking for somewhere to store their stock.', eat: 'No refunds.' });
V('bard', 'Wandering Bard', 'humanoid', 'M', '1/4', { ac: 12, hp: 14, atk: ['Rapier', 4, '1d8+2'], pp: 11, dex: 2, esc: 2, wis: 1, wants: ['curiosity', 'rest'], specials: [{ n: 'Vicious Mockery', chance: .4, save: 'WIS', dc: 12, dmg: '1d4', kind: 'psychic', effect: 'mock' }], loot: [['lute', .6], ['copper', .5]], line: 'A bard is composing a ballad about a chest. Coincidence.', eat: 'The song, unfortunately, remains.' });
V('hesk', 'Sister Hesk, Mimic Hunter', 'humanoid', 'M', '3', { ac: 15, hp: 45, atk: ['Crowbar', 5, '1d8+3'], multi: 2, pp: 14, inv: 5, alwaysAdv: true, dex: 2, esc: 3, wis: 3, wants: ['gold'], flee: 0, boss: true, specials: [{ n: 'Salt Bomb', chance: .35, save: 'DEX', dc: 13, dmg: '2d6', effect: 'salt' }], loot: [['hesk_crowbar', 1], ['healing_potion', 1]], line: 'A woman with a ten-foot pole and a bandolier of salt is poking every chest in the room. She is getting closer.', eat: 'The hunter is hunted.' });
V('rival', 'Rival Mimic', 'monstrosity', 'M', '2', { ac: 12, hp: 58, atk: ['Bite', 5, '2d8+3'], pp: 12, dex: 1, esc: 3, wants: ['gold'], aggressive: true, rival: true, flee: 0, loot: [['mimic_tooth', 1], ['goldhoard', .3], ['gold_ring', .5]], line: 'Across the vault sits another chest. It is breathing.', eat: 'You are what you eat. Hm.' });

// ---------- Regions ----------
const REGIONS = {
  f1: { name: 'The Gutter Halls', sub: 'Dungeon, floor 1', lvl: 1, special: ['map_scrap', 'glowcap'], known: 'map scraps for the Hidden Vault', w: { rat: 5, goblin: 4, kobold: 4, sprout: 3, recruit: 4, pixie: 2, eye: 2, bandit: 1 } },
  f2: { name: 'The Bone Gallery', sub: 'Dungeon, floor 2', lvl: 2, special: ['spellbook', 'holy_symbol', 'ember_wand'], known: 'spellbooks, holy symbols and wands', w: { skeleton: 4, thief: 3, apprentice: 3, acolyte: 3, imp: 2, darkmantle: 2, ooze: 2, pseudo: 2, rat: 2, recruit: 2 } },
  road: { name: 'The Forest Road', sub: 'Outside the dungeon', lvl: 3, tier: 'chest', special: ['gold_ring', 'lute', 'bag'], known: 'rings, lutes and the odd Bag of Holding', w: { wolf: 3, merchant: 4, bard: 3, bandit: 4, pixie: 2, recruit: 2, cherub: 1, knight: 1, thief: 2 } },
  f3: { name: 'The Sunken Treasury', sub: 'Dungeon, floor 3', lvl: 4, special: ['knight_plate', 'ring_prot', 'silver'], known: 'plate armour, protective rings and silver', w: { knight: 2, mephit: 3, clockwork: 3, cherub: 2, ogre: 2, thief: 3, bandit: 2, apprentice: 2, skeleton: 2 } },
  vault: { name: 'The Hidden Vault', sub: 'Behind the map', lvl: 1, secret: true, loot: 1.5, special: ['goldhoard', 'mimic_tooth'], known: 'gold hoards and a rival mimic', w: { rival: 2, pseudo: 3, mephit: 2, knight: 2, thief: 3, clockwork: 2, imp: 2 } },
};
const REGION_ORDER = ['f1', 'f2', 'road', 'f3', 'vault'];

const FEATS = {
  glutton: { name: 'Glutton', desc: '+4 belly, and you get hungry more slowly.' },
  gilded: { name: 'Gilded Lid', desc: '+1 AC and +1 to every disguise.' },
  silver: { name: 'Silver Tongue', desc: 'You can talk. Sweet Talk anyone who speaks (+3), and Insight always succeeds.' },
  ironstomach: { name: 'Iron Stomach', desc: 'Half damage from acid and poison, and curses inside you do nothing.' },
  patient: { name: 'Patient Predator', desc: 'While you are away you catch twice as often and keep more XP.' },
  lockjaw: { name: 'Lockjaw', desc: '+3 to your escape DC, and advantage on bites against grappled visitors.' },
};

const TITLES = {
  first_bite: { name: 'First Bite', desc: 'Eat your first visitor.' },
  box_office: { name: 'Box Office Hit', desc: 'Eat 25 visitors.' },
  off_key: { name: 'Off-Key', desc: 'Eat a bard.' },
  angel_food: { name: 'Angel Food', desc: 'Eat a celestial.' },
  heavy_metal: { name: 'Heavy Metal', desc: 'Swallow a knight whole.' },
  hunter_hunted: { name: 'The Hunter Hunted', desc: 'Defeat Sister Hesk.' },
  cannibal: { name: 'Professional Courtesy', desc: 'Eat another mimic.' },
  trust_issues: { name: 'Trust Issues', desc: 'Eat the one person who trusted you.' },
  whats_in: { name: "What's in the Box", desc: 'Survive your death saves.' },
  splinters: { name: 'Splinters', desc: 'Shatter, and pull yourself back together.' },
  gourmand: { name: 'Gourmand', desc: 'Get Gorged three times.' },
  bigger: { name: 'Bigger on the Inside', desc: 'Swallow a Bag of Holding.' },
  omnivore: { name: 'Omnivore', desc: 'Eat one of every creature type.' },
};

// ---------- State ----------
let S = null;
function newGame(name) {
  const now = Date.now();
  S = {
    v: VERSION, name: name || 'Lid', born: now, lastSeen: now, lastTick: now,
    lvl: 1, xp: 0, abil: { STR: 14, DEX: 12, CON: 14, INT: 8, WIS: 10, CHA: 13 },
    tier: 'lesser', feats: [], pending: [],
    hp: 0, belly: 3, bellyAcc: 0, notoriety: 0, notAcc: 0,
    region: 'f1', form: 'chest', forms: ['chest'], bait: null, regions: ['f1'],
    grid: new Array(9).fill(null), attuned: [], tray: [], uid: 1,
    digest: null, essence: {}, dtraits: {},
    titles: {}, kills: {}, eaten: 0, gorged: 0, wasGorged: false,
    queue: [], log: [], companion: null, flags: {}, cracked: 0, lootCut: 0,
    naps: 3, napAt: now, restAt: 0, enc: null, stats: { fights: 0, fled: 0, deaths: 0 },
  };
  TYPES.forEach(t => S.essence[t] = 0);
  S.hp = maxHp();
  // a starting bait so the first lure has something to glint with
  const c = mkItem('copper'); S.grid[4] = c; S.bait = c.uid;
  sys('[Object has achieved sentience. Species: Lesser Mimic. Level 1.]');
  sys('[Congratulations. You are a box.]');
  return S;
}
function mkItem(id) { return { id, uid: S.uid++ }; }
function sys(text, cls) { S.log.unshift({ t: Date.now(), text, cls: cls || 'sys' }); if (S.log.length > 120) S.log.length = 120; }

// ---------- Derived stats ----------
const T = () => TIERS[S.tier];
const gridCols = () => T().grid[0];
const gridRows = () => T().grid[1] + bagRows();
function bagRows() { return S.grid.some(c => c && c.id === 'bag') || S.flags.bag ? 1 : 0; }
function cellCount() { return gridCols() * gridRows(); }
function fitGrid() { const n = cellCount(); while (S.grid.length < n) S.grid.push(null); }
function gridItems() { return S.grid.filter(Boolean); }
function hasItem(id) { return S.grid.some(c => c && c.id === id); }
function isAttuned(uid) { return S.attuned.includes(uid); }
function activeItems() { return S.grid.filter(c => c && (!ITEMS[c.id].attune || isAttuned(c.uid))); }
function activeHas(id) { return activeItems().some(c => c.id === id); }
function feat(k) { return S.feats.includes(k); }
function ess(t) { const n = S.essence[t] || 0; return n >= ESS_AT[1] ? 2 : n >= ESS_AT[0] ? 1 : 0; }
function dt(tag) { return S.dtraits[tag] || 0; }
function cursedOn() { return !feat('ironstomach'); }
function score(k) {
  let v = S.abil[k];
  if (k === 'STR' && hasItem('contract')) v += 2;
  if (k === 'CHA' && hasItem('contract') && cursedOn()) v -= 1;
  if (k === 'CHA' && ess('humanoid') >= 2) v += 2;
  return clamp(v, 1, 24);
}
const mod = k => Math.floor((score(k) - 10) / 2);
const prof = () => profFor(S.lvl);
function maxHp() {
  const con = mod('CON'); let hp = 8 + con + (S.lvl - 1) * (5 + con);
  if (S.tier === 'vault') hp += 2 * S.lvl;
  hp += [0, 5, 12][ess('giant')] + 3 * dt('cloth');
  return Math.max(4, hp);
}
function bellyCap() { return 4 + 2 * Math.max(0, mod('CON')) + T().belly + (feat('glutton') ? 4 : 0) + 2 * dt('food') + [0, 2, 4][ess('giant')]; }
function gorged() { return S.belly >= bellyCap(); }
function starving() { return S.belly <= 0; }
function neighbours(i) { const c = gridCols(), out = []; const x = i % c, y = Math.floor(i / c); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < c && ny >= 0 && ny < gridRows()) out.push(ny * c + nx); }); return out; }
function adjCount(i, pred) { return neighbours(i).filter(j => S.grid[j] && pred(ITEMS[S.grid[j].id], S.grid[j])).length; }
function bonePairs() { let n = 0; S.grid.forEach((c, i) => { if (c && c.id === 'bone') neighbours(i).forEach(j => { if (j > i && S.grid[j] && S.grid[j].id === 'bone') n++; }); }); return Math.min(3, n); }
function ac() {
  let a = T().ac;
  activeItems().forEach(c => { a += ITEMS[c.id].ac || 0; });
  a += bonePairs() + dt('armor') + dt('bone') + [0, 1, 2][ess('construct')] + (feat('gilded') ? 1 : 0);
  if (S.cracked > 0) a -= 2;
  return a;
}
function saveBonus(k) { let b = mod(k) + dt('holy'); activeItems().forEach(c => b += ITEMS[c.id].saves || 0); return b; }
function initBonus() { let b = mod('DEX') + [0, 1, 2][ess('beast')]; activeItems().forEach(c => b += ITEMS[c.id].init || 0); if (gorged()) b -= 2; return b; }
function insightBonus() { return mod('WIS') + prof() + dt('paper'); }
function disguiseMod(formKey) {
  const f = FORMS[formKey]; let m = (f.skill === 'Stealth' ? mod('DEX') : mod('CHA')) + prof() + f.bonus;
  if (f.skill === 'Deception') m += dt('gold') + dt('music');
  if (f.skill === 'Stealth') { activeItems().forEach(c => { m += ITEMS[c.id].stealth || 0; m -= ITEMS[c.id].clank || 0; }); if (gorged()) m -= 3; }
  if (ess('fey') >= 1) m += 2;
  if (feat('gilded')) m += 1;
  if (S.tier === 'wardrobe') m += 2;
  if (S.companion && S.companion.path === 'pet') m -= 1;
  return m;
}
function guardMod() { let g = 0; activeItems().forEach(c => g += ITEMS[c.id].guard || 0); return g; }
function escapeDC() { let dc = 8 + prof() + mod('STR') + dt('tool'); activeItems().forEach(c => dc += ITEMS[c.id].grip || 0); if (S.tier === 'vault') dc += 3; if (feat('lockjaw')) dc += 3; if (ess('plant') >= 2) dc += 2; return dc; }
function swallowDC() { return 8 + prof() + mod('STR') + dt('tool'); }
function biteHit() { return prof() + mod('STR'); }
function biteBase() { return '1d8'; }
function acidExpr() { const p = parseExpr(T().acid); let n = p.n + [0, 1, 2][ess('ooze')]; if (hasItem('salt') && cursedOn()) n = Math.max(0, n - 1); return { n, b: dt('metal') + Math.max(0, mod('CON')) }; }
function acidRoll() { const a = acidExpr(); let t = a.b; for (let i = 0; i < a.n; i++) t += die(6); return t; }
function acidAvg() { const a = acidExpr(); return a.n * 3.5 + a.b; }
function bestWeapon() {
  let best = null;
  S.grid.forEach((c, i) => {
    if (!c) return; const it = ITEMS[c.id]; if (!it.weapon) return; if (it.attune && !isAttuned(c.uid)) return;
    const adj = it.tags.includes('blade') ? adjCount(i, x => x.tags.includes('blade')) : 0;
    const a = avg(it.weapon) + adj; if (!best || a > best.avg) best = { c, i, it, adj, avg: a };
  });
  return best;
}
function breathInfo() {
  const wand = S.grid.findIndex(c => c && c.id === 'ember_wand' && isAttuned(c.uid));
  const f = ess('fiend'); if (wand < 0 && !f) return null;
  let dice = f === 2 ? 3 : 2, extra = []; if (wand >= 0) { if (adjCount(wand, (x, c) => c.id === 'spellbook')) extra.push('1d6'); if (adjCount(wand, (x, c) => c.id === 'ember_core')) extra.push('1d4'); }
  return { expr: dice + 'd6', extra, flat: dt('arcane'), dc: 8 + prof() + mod('CON') + dt('arcane') };
}
function fireRes() { return activeHas('dragon_scale') || ess('elemental') >= 1; }
function digestSpeed() { return [1, 2, 3][ess('ooze')]; }
function notTier() { const n = S.notoriety; return n >= 80 ? 3 : n >= 50 ? 2 : n >= 25 ? 1 : 0; }
const NOT_NAMES = ['Rumour', 'Wanted', 'Hunted', 'Legend'];
function swallowMax() { return T().swallow; }
function canSwallowSize(sz) { return SIZES[sz].n <= swallowMax(); }
function cutThreshold() { return Math.max(10, Math.floor(maxHp() / 3)); }
function xpToNext() { return S.lvl >= MAX_LVL ? 0 : XP_AT[S.lvl + 1]; }

// ---------- Items: placing, fusing, digesting ----------
function firstEmpty() { return S.grid.findIndex(c => !c); }
function addLoot(id, msgs) {
  if (id === 'bag') { award('bigger', msgs); }
  if (S.tray.length >= 6) { msgs && msgs.push({ text: `[No room. ${ITEMS[id].name} falls out of you.]`, cls: 'bad' }); return false; }
  S.tray.push(mkItem(id)); return true;
}
function placeFromTray(trayIdx, cell) {
  const it = S.tray[trayIdx]; if (!it) return false; fitGrid();
  if (cell == null || cell < 0) cell = firstEmpty(); if (cell < 0 || cell >= cellCount()) return false;
  const prev = S.grid[cell]; S.grid[cell] = it; S.tray.splice(trayIdx, 1);
  if (prev) S.tray.push(prev);
  onGridChange(); return true;
}
function moveCell(a, b) { const t = S.grid[a]; S.grid[a] = S.grid[b]; S.grid[b] = t; onGridChange(); }
function onGridChange() {
  if (hasItem('bag')) S.flags.bag = true;
  fitGrid();
  // unlock regions from maps
  if (hasItem('treasure_map') && !S.regions.includes('vault')) { S.regions.push('vault'); sys('[The Treasure Map shows a way into the Hidden Vault. It is now on your map.]', 'level'); }
  S.attuned = S.attuned.filter(u => S.grid.some(c => c && c.uid === u));
  if (S.bait && !S.grid.some(c => c && c.uid === S.bait)) S.bait = null;
}
function spitOut(cell) { const c = S.grid[cell]; if (!c) return false; if (ITEMS[c.id].cursed && cursedOn()) return false; S.grid[cell] = null; if (S.bait === c.uid) S.bait = null; S.attuned = S.attuned.filter(u => u !== c.uid); onGridChange(); return true; }
function toggleAttune(cell) { const c = S.grid[cell]; if (!c || !ITEMS[c.id].attune) return false; if (isAttuned(c.uid)) S.attuned = S.attuned.filter(u => u !== c.uid); else { if (S.attuned.length >= 3) return false; S.attuned.push(c.uid); if (S.bait === c.uid) S.bait = null; } return true; }
function fusable() {
  const counts = {};
  S.grid.concat(S.tray).forEach(c => { if (c && ITEMS[c.id].fuse) counts[c.id] = (counts[c.id] || 0) + 1; });
  return Object.keys(counts).filter(k => counts[k] >= 3);
}
function fuse(id, msgs) {
  let need = 3; const into = ITEMS[id].fuse;
  for (let i = S.tray.length - 1; i >= 0 && need; i--) if (S.tray[i].id === id) { S.tray.splice(i, 1); need--; }
  let cell = -1;
  for (let i = 0; i < S.grid.length && need; i++) if (S.grid[i] && S.grid[i].id === id) { if (cell < 0) cell = i; if (S.bait === S.grid[i].uid) S.bait = null; S.grid[i] = null; need--; }
  const n = mkItem(into);
  if (cell >= 0) S.grid[cell] = n; else S.tray.push(n);
  onGridChange();
  msgs && msgs.push({ text: `[Fusion! Three ${ITEMS[id].name} become ${ITEMS[into].name}.]`, cls: 'level' });
  return n;
}
function eatItem(cell, msgs) {
  const c = S.grid[cell]; if (!c) return false; const it = ITEMS[c.id]; if (it.use !== 'eat') return false;
  S.grid[cell] = null; S.belly = Math.min(bellyCap() + 2, S.belly + (it.belly || 1));
  if (it.heal) S.hp = Math.min(maxHp(), S.hp + roll(it.heal) + 2 * dt('potion'));
  onGridChange(); msgs && msgs.push({ text: `[You eat the ${it.name}. Delicious, technically.]` });
  return true;
}
function startDigest(cell) {
  if (S.digest) return false; const c = S.grid[cell]; if (!c) return false; const it = ITEMS[c.id]; if (it.noDigest) return false;
  S.grid[cell] = null; S.attuned = S.attuned.filter(u => u !== c.uid); if (S.bait === c.uid) S.bait = null;
  const dur = DIGEST_MIN[it.r] * 60000 / digestSpeed();
  S.digest = { item: c, start: Date.now(), left: dur, dur };
  onGridChange(); return true;
}
function finishDigest(msgs) {
  const it = ITEMS[S.digest.item.id]; const id = S.digest.item.id; S.digest = null;
  const gained = [];
  it.tags.forEach(tag => {
    const D = DIGEST_TAGS[tag];
    if (D && dt(tag) < D.max) { S.dtraits[tag] = dt(tag) + 1; gained.push(`${D.name} (${D.each})`); }
    if (TYPES.includes(tag)) { addEssence(tag, 1, msgs); gained.push(`${TYPE_NAME[tag]} essence`); }
  });
  if (id === 'spellbook' && !S.forms.includes('bookshelf')) { S.forms.push('bookshelf'); gained.push('the Bookshelf form'); }
  if (id === 'treasure_map' && !S.regions.includes('vault')) S.regions.push('vault');
  const line = gained.length ? `[Digested: ${it.name}. You gained ${gained.join(', ')}.]` : (it.tags.includes('junk') ? `[Digested: ${it.name}. You gained nothing. You knew that.]` : `[Digested: ${it.name}. Your traits from it are already maxed.]`);
  msgs ? msgs.push({ text: line, cls: 'level' }) : null; sys(line, 'level');
}
function addEssence(type, n, msgs) {
  const before = ess(type); S.essence[type] = (S.essence[type] || 0) + n; const after = ess(type);
  if (after > before) {
    const E = ESSENCE[type]; const txt = `[${TYPE_NAME[type]} trait ${after === 1 ? 'awakened' : 'deepened'}: ${E.name}. ${after === 1 ? E.i : E.ii}]`;
    msgs && msgs.push({ text: txt, cls: 'level' }); sys(txt, 'level');
    if (type === 'undead' && after === 2 && !S.forms.includes('coffin')) S.forms.push('coffin');
    if (type === 'giant') S.hp += after === 1 ? 5 : 7;
  }
  if (TYPES.every(t => (S.essence[t] || 0) > 0)) award('omnivore', msgs);
}
function award(id, msgs) {
  if (S.titles[id]) return; S.titles[id] = Date.now();
  const txt = `[Title earned: ${TITLES[id].name}. ${TITLES[id].desc}]`;
  msgs && msgs.push({ text: txt, cls: 'title' }); sys(txt, 'title');
}

// ---------- XP, levels, evolution ----------
function gainXp(n, msgs) {
  if (S.lvl >= MAX_LVL) return;
  S.xp += Math.round(n);
  while (S.lvl < MAX_LVL && S.xp >= XP_AT[S.lvl + 1]) {
    const before = maxHp(); S.lvl++; S.hp += maxHp() - before;
    const txt = levelLine(S.lvl); msgs && msgs.push({ text: txt, cls: 'level' }); sys(txt, 'level');
    if (ASI_LVLS.includes(S.lvl)) S.pending.push('asi');
    if (S.lvl === 3 && S.tier === 'lesser') S.pending.push('evo_chest');
    if (S.lvl === 6 && S.tier === 'chest') S.pending.push('evo_branch');
    if (S.lvl === MAX_LVL) S.pending.push('max');
  }
}
const LEVEL_LINES = ['', '', '[Level 2. You are now slightly more box.]', '[Level 3. Something is happening to your hinges.]', '[Level 4. You may improve yourself. Please improve your manners.]', '[Level 5. You have reached Level 5. Several adventurers who were trying to have not.]', '[Level 6. You are outgrowing the room.]', '[Level 7. The dungeon has started to notice you.]', '[Level 8. Improve yourself again. The System has given up on your manners.]', '[Level 9. There are fewer adventurers than there used to be. Correlation is not causation.]', '[Level 10. You have reached the end of this prototype. The System is relieved.]'];
function levelLine(l) { return LEVEL_LINES[l] || `[Level ${l}.]`; }
function evolveTo(tier, msgs) {
  const before = maxHp(); S.tier = tier; fitGrid(); S.hp += Math.max(0, maxHp() - before);
  if (tier === 'chest' && !S.forms.includes('barrel')) S.forms.push('barrel');
  if (tier === 'wardrobe') ['wardrobe', 'coffin'].forEach(f => { if (!S.forms.includes(f)) S.forms.push(f); });
  if (tier === 'doorway' && !S.forms.includes('door')) S.forms.push('door');
  if (tier === 'chest' && !S.regions.includes('road')) S.regions.push('road');
  const txt = `[Evolution complete: ${TIERS[tier].name}. ${TIERS[tier].desc}]`;
  msgs && msgs.push({ text: txt, cls: 'level' }); sys(txt, 'level');
}
function applyAsi(choice) {
  if (ABILS.includes(choice)) { const b = maxHp(); S.abil[choice] = Math.min(20, S.abil[choice] + 2); if (choice === 'CON') S.hp += maxHp() - b; sys(`[${ABIL_NAME[choice]} +2.]`, 'level'); }
  else if (FEATS[choice] && !feat(choice)) { S.feats.push(choice); sys(`[Feat learned: ${FEATS[choice].name}. ${FEATS[choice].desc}]`, 'level'); }
}
function unlockRegions() { REGION_ORDER.forEach(k => { const R = REGIONS[k]; if (R.secret) return; if (S.lvl >= R.lvl && (!R.tier || S.tier !== 'lesser') && !S.regions.includes(k)) { S.regions.push(k); sys(`[New area reachable: ${R.name}.]`, 'level'); } }); }

// ---------- Notoriety ----------
function addNotoriety(n, msgs) {
  const before = notTier(); S.notoriety = clamp(S.notoriety + n, 0, 100); const after = notTier();
  if (after > before) { const t = ['', '[Notoriety: Wanted. Posters with a crude drawing of a box have appeared. People look closer.]', '[Notoriety: Hunted. The Mimic Hunters have heard of you.]', '[Notoriety: Legend. Someone has started leaving offerings in front of you.]'][after]; msgs && msgs.push({ text: t, cls: 'bad' }); sys(t, 'bad'); }
}

// ---------- Visitors and encounters ----------
function baitItem() { return S.bait ? S.grid.find(c => c && c.uid === S.bait) : null; }
function baitWants() { const b = baitItem(); if (!b) return []; return [...new Set(ITEMS[b.id].tags.map(t => TAG_WANT[t]).filter(Boolean))]; }
function baitBonus(v) {
  const b = baitItem(); if (!b) return 0; const ws = baitWants(); if (!v.wants.some(w => ws.includes(w))) return 0;
  const it = ITEMS[b.id]; let n = 2 + (it.bait || 0);
  if (ws.includes('gold')) { const cell = S.grid.findIndex(c => c && c.uid === b.uid); n += adjCount(cell, x => x.tags.includes('gold')); n += [0, 1, 2][ess('dragon')]; }
  return n;
}
function spawnWeights(regionKey) {
  const R = REGIONS[regionKey]; const ws = baitWants(); const fa = FORMS[S.form].attract;
  const ids = Object.keys(R.w);
  return { ids, w: ids.map(id => { const v = VISITORS[id]; let w = R.w[id]; if (v.wants.some(x => ws.includes(x))) w *= 2.5; if (v.wants.some(x => fa.includes(x))) w *= 1.8; return w; }) };
}
function rollVisitorId(regionKey) { const { ids, w } = spawnWeights(regionKey || S.region); return wpick(ids, w); }
function mkVisitor(id) { const d = VISITORS[id]; return { id, hp: d.hp, maxHp: d.hp, grappled: false, swallowed: false, blind: 0, charmed: 0, poisoned: 0, healed: false, specUsed: {} }; }

// waiting queue: 'companion' | 'hunter' | visitor id
function nextArrival() {
  if (S.lvl >= 3 && !S.flags.compSeen && !S.queue.includes('companion')) return 'companion';
  if (S.queue.length) return S.queue.shift();
  if (S.notoriety >= 35 && S.lvl >= 4 && !S.flags.heskDone && !S.flags.heskSeen && rnd() < 0.35) { S.flags.heskSeen = true; return 'hesk'; }
  return rollVisitorId();
}
function startEncounter(id) {
  if (id === 'companion') { S.queue = S.queue.filter(q => q !== 'companion'); S.flags.compSeen = true; return { companion: true }; }
  const d = VISITORS[id];
  S.enc = { vid: id, v: mkVisitor(id), phase: 'approach', insight: true, sweet: false, surprise: false, turn: 0, log: [], dice: null, breathReady: true, used: {}, lucky: 0, stun: 0, mocked: 0, dark: 0, poisoned: 0, salted: 0, braced: false, gulpUsed: false, playDead: false, result: null };
  elog(d.line, 'sys');
  if (d.rival) { elog('[Warning: You are not the only mimic in this dungeon.]', 'bad'); }
  if (d.boss) { elog('[Warning: This visitor is carrying a ten-foot pole. That is a professional.]', 'bad'); }
  return S.enc;
}
function elog(text, cls) { S.enc.log.push({ text, cls: cls || '' }); if (S.enc.log.length > 40) S.enc.log.shift(); }
function vdef() { return VISITORS[S.enc.vid]; }
function visitorPP() { const d = vdef(); return d.pp + (d.type === 'humanoid' ? notTier() : 0); }
function canSweetTalk() { const d = vdef(); return SPEAKERS.includes(d.type) && (ess('humanoid') >= 1 || feat('silver') || (S.companion && S.companion.path === 'reformer')) && !S.enc.sweet; }
function sweetBonus() { return ess('humanoid') >= 2 ? 5 : 3; }

function actInsight() {
  const e = S.enc; if (e.insight !== null) return;
  if (feat('silver')) { e.insight = true; return; }
  const r = d20(0), tot = r.r + insightBonus(); const ok = tot >= 12;
  e.dice = { label: 'Insight', r, mod: insightBonus(), total: tot, vs: 12, vsLabel: 'DC', ok };
  e.insight = ok; elog(ok ? `You read them. They want ${vdef().wants.map(w => WANTS[w].toLowerCase()).join(' and ')}.` : 'You cannot read them. They are a mystery wrapped in a visitor.', ok ? 'good' : '');
}
function actSweetTalk() {
  const e = S.enc; if (!canSweetTalk()) return; e.sweet = true;
  elog(pick(['"Psst. Free loot. Totally free."', '"Hello, traveller. I am a perfectly normal chest. Open me."', '"Oh no. I am so heavy and full of gold. If only someone would open me."']), 'me');
}
function actLetPass(msgs) {
  const e = S.enc; const d = vdef();
  if (S.companion && S.companion.path === 'reformer') { const xp = d.xp * 0.25; gainXp(xp, e.resMsgs = e.resMsgs || []); elog(`Wren smiles at you. (+${Math.round(xp)} XP)`, 'good'); if (rnd() < 0.2 && d.loot.length) { const it = pick(d.loot)[0]; addLoot(it, e.resMsgs); elog(`The visitor leaves something by you on the way out: ${ITEMS[it].name}.`, 'good'); } }
  else elog('You hold very, very still. They walk on by.');
  finish('passed');
}
function actLure() {
  const e = S.enc, d = vdef();
  if (d.rival) { elog('The other chest opens its lid. So do you. Neither of you is fooled.', 'bad'); return beginCombat(false, true); }
  if (!e.sweet && typeof canSweetFor === 'function' && canSweetFor(d)) { e.sweet = true; elog(pick(['"Psst. Free loot. Totally free."', '"Hello, traveller. I am a perfectly normal chest. Open me."', '"Oh no. I am so heavy and full of gold. If only someone would open me."']), 'me'); }
  const bb = baitBonus(d), sw = e.sweet ? sweetBonus() : 0, part = S.companion && S.companion.path === 'partner' ? 2 : 0;
  const mode = (ess('fey') >= 2 ? 1 : 0) + (gorged() && FORMS[S.form].skill === 'Stealth' ? -1 : 0);
  const m = disguiseMod(S.form) + bb + sw + part;
  const r = d20(mode), tot = r.r + m, pp = visitorPP(); const ok = tot >= pp;
  e.dice = { label: FORMS[S.form].skill, r, mod: m, total: tot, vs: pp, vsLabel: 'Passive Perception', ok, parts: [['disguise', disguiseMod(S.form)], ['bait', bb], ['sweet talk', sw], ['Wren', part]].filter(p => p[1]) };
  if (!ok) {
    elog(`${d.name} isn't fooled.`, 'bad');
    if (d.aggressive) { elog(`${d.name} attacks!`, 'bad'); return beginCombat(false); }
    e.phase = 'missed'; return;
  }
  elog(bb ? `The bait works. ${d.name} comes closer.` : `${d.name} comes closer.`, 'good');
  // investigation step
  if (d.inv != null) {
    const adv = (d.chestAdv && S.form === 'chest') || d.alwaysAdv;
    const guard = guardMod(); const noAdv = activeHas('hesk_crowbar');
    const r2 = d20(adv && !noAdv ? 1 : 0), t2 = r2.r + d.inv, dc = 10 + disguiseMod(S.form) + guard;
    const spotted = t2 >= dc;
    e.dice2 = { label: `${d.name}: Investigation`, r: r2, mod: d.inv, total: t2, vs: dc, vsLabel: 'your disguise', ok: !spotted, them: true };
    if (spotted) {
      elog(d.alwaysAdv ? 'She pokes you with the ten-foot pole. You flinch. She smiles.' : `${d.name} checks you carefully and spots a tooth.`, 'bad');
      if (d.flee >= 0.6 && !d.aggressive) { e.phase = 'combat'; e.turn = 1; S.stats.fights++; return tryFleeNow(); }
      return beginCombat(false);
    }
    elog(`${d.name} checks you over and finds nothing wrong.`, 'good');
  }
  touched();
}
function touched() {
  const e = S.enc, d = vdef();
  elog(`${d.name} opens your lid.`, '');
  elog('[Adhesive: they are stuck to you.]', 'sys');
  e.v.grappled = true; e.surprise = true; e.skipEnemy = 1;
  beginCombat(true);
}
function actLunge() { elog('You lunge.', 'me'); beginCombat(false); }
function beginCombat(surprise, rival) {
  const e = S.enc; e.phase = 'combat'; e.turn = 1; S.stats.fights++;
  if (surprise) { elog('[Surprise round. You attack with advantage.]', 'sys'); return; }
  const me = d20(gorged() ? -1 : 0), them = d20(0); const mi = me.r + initBonus(), ti = them.r + vdef().dex;
  e.dice = { label: 'Initiative', r: me, mod: initBonus(), total: mi, vs: ti, vsLabel: `${vdef().name}'s initiative`, ok: mi >= ti };
  if (mi < ti) { elog(`${vdef().name} acts first.`, 'bad'); enemyTurn(); }
  else elog('You act first.', 'good');
}
function vAlive() { return S.enc && S.enc.v.hp > 0; }

// --- player actions ---
function availableActions() {
  const e = S.enc, v = e.v, d = vdef(), out = [];
  if (e.phase !== 'combat') return out;
  if (v.swallowed) {
    out.push({ k: 'clench', label: 'Clench', sub: `Acid ${acidExpr().n}d6+${acidExpr().b}` });
    out.push({ k: 'brace', label: 'Brace', sub: 'Halve their damage from inside' });
    out.push({ k: 'spit', label: 'Spit them out', sub: 'They will run' });
    return out;
  }
  out.push({ k: 'bite', label: S.tier === 'barrel' ? 'Bite ×2' : 'Bite', sub: `${sgn(biteHit())} · 1d8${sgn(mod('STR') + biteFlat())}` });
  if (!v.grappled) out.push({ k: 'tongue', label: 'Tongue Lash', sub: `${sgn(biteHit() + [0, 2, 4][ess('plant')])} · grapple` });
  const canGulp = S.tier === 'doorway' && !e.gulpUsed && !v.grappled;
  if (v.grappled || canGulp) {
    const ok = canSwallowSize(d.size) && !gorged();
    out.push({ k: 'swallow', label: canGulp && !v.grappled ? 'Doorway Gulp' : 'Swallow', sub: !canSwallowSize(d.size) ? `Too big (${SIZES[d.size].name})` : gorged() ? 'Too full' : `DC ${swallowDC()} Dex save`, disabled: !ok });
  }
  const w = bestWeapon(); if (w) out.push({ k: 'weapon', label: w.it.name, sub: `${sgn(biteHit() + (w.it.hit || 0))} · ${w.it.weapon}+${mod('STR') + w.adj}` });
  const b = breathInfo(); if (b) out.push({ k: 'breath', label: 'Fire Breath', sub: e.breathReady ? `${b.expr} · DC ${b.dc}` : 'Recharging (5–6)', disabled: !e.breathReady });
  S.grid.forEach((c, i) => { if (!c) return; const it = ITEMS[c.id]; if (it.use === 'heal') out.push({ k: 'potion', cell: i, label: it.name, sub: `Heal ${it.heal}` }); if (it.use === 'blind') out.push({ k: 'dust', cell: i, label: it.name, sub: 'Blind 2 turns' }); if (it.use === 'charm' && !e.used.lute) out.push({ k: 'lute', cell: i, label: 'Play the Lute', sub: `Charm · DC ${10 + d.wis}` }); });
  if (!v.grappled) out.push({ k: 'dead', label: 'Play Dead', sub: 'Deception vs Perception' });
  // dedupe items
  const seen = {}; return out.filter(a => { const key = a.k + (a.k === 'potion' || a.k === 'dust' ? '' : a.label); if (seen[key]) return false; seen[key] = 1; return true; });
}
function biteFlat() { let f = dt('blade') + [0, 1, 2][ess('beast')] + dt('fire'); return f; }
function attackRoll(bonus, mode) { return d20(mode); }
function bitesAgainst(v) {
  const e = S.enc, d = vdef();
  let mode = 0; if (e.surprise) mode = 1; if (e.playDead) mode = 1; if (feat('lockjaw') && v.grappled) mode = 1; if (e.mocked) mode -= 1; if (e.dark) mode -= 1;
  return clamp(mode, -1, 1);
}
function critOn() { return 20 - [0, 1, 2][ess('construct')]; }
function doBite(label) {
  const e = S.enc, v = e.v, d = vdef();
  const mode = bitesAgainst(v); const r = d20(mode); const hitB = biteHit() - (e.poisoned ? 2 : 0); const tot = r.r + hitB;
  const crit = r.r >= critOn(), hit = crit || (r.r !== 1 && tot >= d.ac);
  e.dice = { label: label || 'Bite', r, mod: hitB, total: tot, vs: d.ac, vsLabel: 'AC', ok: hit, crit };
  if (!hit) { elog(`${label || 'Bite'} misses.`, ''); return 0; }
  let dmg = roll('1d8', crit) + mod('STR') + biteFlat();
  activeItems().forEach(c => { const it = ITEMS[c.id]; if (it.extraBite) dmg += roll(it.extraBite, crit); });
  if (hasItem('holy_symbol') && (d.type === 'undead' || d.type === 'fiend')) dmg += roll('1d4', crit);
  if (ess('elemental') >= 2) dmg += roll('1d4', crit);
  if (ess('monstrosity') && v.hp <= v.maxHp / 2) dmg += roll(ess('monstrosity') === 2 ? '2d6' : '1d6', crit);
  dmg = Math.max(1, dmg);
  hurtV(dmg, crit ? `CRITICAL! ${label || 'Bite'}` : (label || 'Bite'));
  return dmg;
}
function hurtV(n, what) { const e = S.enc; e.v.hp -= n; e.lastHitV = n; elog(`${what}: ${n} damage.`, 'me'); e.fx = (e.fx || []).concat({ on: 'v', n }); }
function hurtMe(n, what, kind) {
  const e = S.enc;
  if (kind === 'fire' && fireRes()) n = Math.floor(n / 2);
  if (kind === 'acid' && (feat('ironstomach') || ess('elemental') >= 2)) n = Math.floor(n / 2);
  if (kind === 'poison' && feat('ironstomach')) n = Math.floor(n / 2);
  n = Math.max(0, n); S.hp -= n; elog(`${what}: ${n} damage to you.`, 'foe'); e.fx = (e.fx || []).concat({ on: 'me', n });
  return n;
}
function playerAction(k, cell) {
  const e = S.enc; if (!e || e.phase !== 'combat') return;
  const v = e.v, d = vdef();
  e.fx = [];
  if (k === 'bite') { doBite(); if (S.tier === 'barrel' && vAlive()) doBite('Second bite'); }
  else if (k === 'tongue') {
    const mode = bitesAgainst(v); const r = d20(mode); const b = biteHit() + [0, 2, 4][ess('plant')]; const tot = r.r + b; const hit = r.r === 20 || (r.r !== 1 && tot >= d.ac);
    e.dice = { label: 'Tongue Lash', r, mod: b, total: tot, vs: d.ac, vsLabel: 'AC', ok: hit };
    if (hit) { v.grappled = true; elog(`Your tongue wraps around ${d.name}. Grappled.`, 'me'); } else elog('Your tongue slaps the floor.', '');
  }
  else if (k === 'swallow') {
    const gulp = !v.grappled && S.tier === 'doorway'; if (gulp) e.gulpUsed = true;
    if (!canSwallowSize(d.size) || gorged()) return;
    const r = d20(0), tot = r.r + d.dex, dc = swallowDC(); const saved = tot >= dc;
    e.dice = { label: `${d.name}: Dexterity save`, r, mod: d.dex, total: tot, vs: dc, vsLabel: 'your swallow DC', ok: !saved, them: true };
    if (saved) elog(`${d.name} braces against your jaws and stays outside.`, 'bad');
    else { v.swallowed = true; v.grappled = true; elog(`[Swallowed. ${d.name} is inside you now.]`, 'sys'); }
  }
  else if (k === 'clench') { hurtV(Math.max(1, acidRoll()), 'You clench'); }
  else if (k === 'brace') { e.braced = true; elog('You brace your insides.', 'me'); }
  else if (k === 'spit') { v.swallowed = false; v.grappled = false; elog(`You spit ${d.name} out.`, 'me'); tryFleeNow(); return; }
  else if (k === 'weapon') {
    const w = bestWeapon(); if (!w) return; const mode = bitesAgainst(v); const r = d20(mode); const b = biteHit() + (w.it.hit || 0) - (e.poisoned ? 2 : 0); const tot = r.r + b; const crit = r.r >= 20; const hit = crit || (r.r !== 1 && tot >= d.ac);
    e.dice = { label: w.it.name, r, mod: b, total: tot, vs: d.ac, vsLabel: 'AC', ok: hit, crit };
    if (hit) hurtV(Math.max(1, roll(w.it.weapon, crit) + mod('STR') + w.adj), `${crit ? 'CRITICAL! ' : ''}You swing the ${w.it.name} with your tongue`); else elog(`The ${w.it.name} whiffs.`, '');
  }
  else if (k === 'breath') {
    const b = breathInfo(); if (!b || !e.breathReady) return; e.breathReady = false;
    let dmg = roll(b.expr) + b.flat; b.extra.forEach(x => dmg += roll(x));
    const r = d20(0), tot = r.r + d.dex, saved = tot >= b.dc; e.dice = { label: `${d.name}: Dexterity save`, r, mod: d.dex, total: tot, vs: b.dc, vsLabel: 'your breath DC', ok: !saved, them: true };
    hurtV(saved ? Math.floor(dmg / 2) : dmg, saved ? 'Fire breath (half)' : 'Fire breath');
  }
  else if (k === 'potion') { const c = S.grid[cell]; if (!c) return; const h = roll(ITEMS[c.id].heal) + 2 * dt('potion'); S.grid[cell] = null; onGridChange(); S.hp = Math.min(maxHp(), S.hp + h); elog(`You drink the potion from the inside. +${h} HP.`, 'good'); }
  else if (k === 'dust') { const c = S.grid[cell]; if (!c) return; S.grid[cell] = null; onGridChange(); v.blind = 2; elog(`You sneeze glittering dust. ${d.name} is blinded.`, 'me'); }
  else if (k === 'lute') {
    e.used.lute = true; const r = d20(0), b = mod('CHA') + prof(), tot = r.r + b, dc = 10 + d.wis; const ok = tot >= dc;
    e.dice = { label: 'Performance', r, mod: b, total: tot, vs: dc, vsLabel: 'DC', ok };
    if (ok) { v.charmed = 1; elog(`You play the lute with your tongue. ${d.name} is charmed. Mostly confused.`, 'me'); } else elog('You play the lute with your tongue. It sounds exactly like that.', '');
  }
  else if (k === 'dead') {
    const mode = S.tier === 'wardrobe' ? 1 : 0; const r = d20(mode), m = disguiseMod(S.form), tot = r.r + m, pp = visitorPP(); const ok = tot >= pp;
    e.dice = { label: 'Play Dead', r, mod: m, total: tot, vs: pp, vsLabel: 'Passive Perception', ok };
    if (ok) { e.playDead = true; elog(`You go limp. ${d.name} leans in to check... and touches you.`, 'good'); elog('[Adhesive: they are stuck to you.]', 'sys'); v.grappled = true; v.charmed = 1; }
    else elog('You go limp. Nobody believes you.', 'bad');
  }
  // reset one-shot advantages after an attack
  if (['bite', 'tongue', 'weapon'].includes(k)) { e.surprise = false; e.playDead = false; if (e.mocked) e.mocked = 0; }
  // second mouth
  if (ess('aberration') && vAlive() && !v.swallowed && ['bite', 'tongue', 'weapon', 'breath', 'swallow'].includes(k)) { const n = roll(ess('aberration') === 2 ? '1d8' : '1d4'); hurtV(n, 'Your second mouth'); }
  afterPlayer();
}
function afterPlayer() {
  const e = S.enc;
  if (!vAlive()) return win();
  if (!e.v.grappled && e.v._fled) return;
  enemyTurn();
}
function tryFleeNow() {
  const e = S.enc, d = vdef(), v = e.v; if (e.phase !== 'combat') return true;
  if (S.tier === 'barrel') {
    const r = d20(0), tot = r.r + Math.max(d.dex, d.esc), dc = escapeDC();
    e.dice = { label: `${d.name}: escape`, r, mod: Math.max(d.dex, d.esc), total: tot, vs: dc, vsLabel: 'you roll after them', ok: tot < dc, them: true };
    if (tot < dc) { elog(`${d.name} runs. You roll after them and cut them off.`, 'good'); return false; }
  }
  // opportunity bite
  elog(`${d.name} turns to run!`, 'bad');
  const mode = ess('plant') >= 1 ? 1 : 0; const r = d20(mode), tot = r.r + biteHit(); const hit = r.r === 20 || (r.r !== 1 && tot >= d.ac);
  e.dice = { label: 'Opportunity bite', r, mod: biteHit(), total: tot, vs: d.ac, vsLabel: 'AC', ok: hit };
  if (hit) { const dmg = roll('1d8') + mod('STR') + biteFlat() + (ess('monstrosity') ? roll(ess('monstrosity') === 2 ? '2d6' : '1d6') : 0); hurtV(Math.max(1, dmg), 'Opportunity bite'); }
  if (!vAlive()) { win(); return true; }
  if (d.invis) elog(`${d.name} turns invisible and is gone.`, 'bad');
  v._fled = true; finish('fled'); return true;
}
function enemyTurn() {
  const e = S.enc, v = e.v, d = vdef(); if (!vAlive() || e.phase !== 'combat') return;
  e.turn++;
  // inside you
  if (v.swallowed) {
    let a = acidRoll() + [0, roll('1d4'), roll('1d8')][ess('undead')];
    if (e.salted) a = 0;
    if (a > 0) hurtV(a, 'Your stomach acid');
    if (!vAlive()) return win();
    let total = 0; for (let i = 0; i < d.multi; i++) total += roll(d.atk[2]);
    if (e.braced) total = Math.floor(total / 2);
    total = hurtMe(total, `${d.name} hacks at you from inside`, d.atk[3]);
    if (d.corrode) { hurtMe(roll('1d6'), 'The ooze digests you back', 'acid'); }
    e.braced = false;
    if (total >= cutThreshold() && S.hp > 0) { v.swallowed = false; v.grappled = false; e.stun = 1; elog(`${d.name} cuts their way out! Your lid is jammed for a turn.`, 'bad'); }
    return endEnemy();
  }
  if (e.skipEnemy) { e.skipEnemy--; elog(`${d.name} is still stuck to you, flailing.`, 'good'); return endEnemy(); }
  if (v.charmed) { v.charmed--; elog(`${d.name} is too charmed to act.`, 'good'); return endEnemy(); }
  // flee?
  if (!v.grappled && v.hp <= v.maxHp * 0.5 && rnd() < d.flee) { if (tryFleeNow()) return; }
  // heal
  if (d.heal && !v.healed && v.hp <= v.maxHp / 2) { v.healed = true; const h = roll(d.heal); v.hp = Math.min(v.maxHp, v.hp + h); elog(`${d.name} heals ${h}.`, 'foe'); return endEnemy(); }
  // grappled: try to escape
  if (v.grappled && rnd() < 0.5) {
    const r = d20(0), m = Math.max(d.esc, d.dex), tot = r.r + m, dc = escapeDC(); const ok = tot >= dc;
    e.dice = { label: `${d.name}: escape`, r, mod: m, total: tot, vs: dc, vsLabel: 'your escape DC', ok: !ok, them: true };
    if (ok) { v.grappled = false; elog(`${d.name} pulls free of your tongue.`, 'bad'); if (d.flee >= 0.5 && rnd() < d.flee) { if (tryFleeNow()) return; } }
    else elog(`${d.name} struggles, but you hold on.`, 'good');
    return endEnemy();
  }
  // special
  const sp = d.specials.find(s => !(s.once && v.specUsed[s.n]) && rnd() < s.chance);
  if (sp) { v.specUsed[sp.n] = true; doSpecial(sp); return endEnemy(); }
  for (let i = 0; i < d.multi && S.hp > 0; i++) enemyAttack();
  endEnemy();
}
function enemyAttack() {
  const e = S.enc, v = e.v, d = vdef();
  const mode = v.blind ? -1 : 0; const r = d20(mode), tot = r.r + d.atk[1], myAC = ac(); const crit = r.r === 20, hit = crit || (r.r !== 1 && tot >= myAC);
  e.dice = { label: `${d.name}: ${d.atk[0]}`, r, mod: d.atk[1], total: tot, vs: myAC, vsLabel: 'your AC', ok: !hit, them: true, crit };
  if (!hit) { elog(`${d.name}'s ${d.atk[0]} bounces off your lid.`, 'good'); return; }
  hurtMe(roll(d.atk[2], crit), `${crit ? 'CRITICAL! ' : ''}${d.name}'s ${d.atk[0]}`, d.atk[3]);
  if (d.corrode && rnd() < 0.25) { const metal = S.grid.findIndex(c => c && ITEMS[c.id].tags.includes('metal') && !ITEMS[c.id].attune); if (metal >= 0) { elog(`[The ooze's acid eats your ${ITEMS[S.grid[metal].id].name}.]`, 'bad'); S.grid[metal] = null; onGridChange(); } }
}
function doSpecial(sp) {
  const e = S.enc, d = vdef();
  if (sp.effect === 'dark') { e.dark = 2; elog(`${d.name} fills the room with magical darkness. Your attacks have disadvantage.`, 'foe'); return; }
  const r = d20(0), sb = saveBonus(sp.save), tot = r.r + sb; const saved = tot >= sp.dc;
  e.dice = { label: `${sp.n}: your ${sp.save} save`, r, mod: sb, total: tot, vs: sp.dc, vsLabel: 'DC', ok: saved };
  let dmg = sp.dmg && sp.dmg !== '0' ? roll(sp.dmg) : 0; if (saved && sp.half) dmg = Math.floor(dmg / 2); else if (saved) dmg = 0;
  if (dmg) hurtMe(dmg, sp.n, sp.kind);
  if (!saved) {
    if (sp.effect === 'salt') { e.salted = 2; elog('[Salted. Your acid stops working for 2 turns. Some salt got inside you.]', 'bad'); addLoot('salt'); }
    if (sp.effect === 'mock') { e.mocked = 1; elog(`${d.name} insults your craftsmanship. Your next attack has disadvantage.`, 'foe'); }
    if (sp.effect === 'poison') { if (!feat('ironstomach')) { e.poisoned = 2; elog('You are poisoned: −2 to hit for 2 turns.', 'foe'); } }
  } else elog(`You resist the ${sp.n}.`, 'good');
}
function endEnemy() {
  const e = S.enc, v = e.v;
  if (S.hp <= 0) return deathSaves();
  if (v.blind) v.blind--; if (e.dark) e.dark--; if (e.poisoned) e.poisoned--; if (e.salted) e.salted--;
  // start of your turn
  if (e.stun) { e.stun--; elog('Your lid is jammed. You lose your turn.', 'bad'); return enemyTurn(); }
  if (e.v.swallowed === false) e.braced = false;
  e.breathReady = e.breathReady || die(6) >= 5;
  const cel = ess('celestial'); if (cel) { const h = roll(cel === 2 ? '1d8' : '1d4'); S.hp = Math.min(maxHp(), S.hp + h); }
  if (activeHas('halo')) S.hp = Math.min(maxHp(), S.hp + 1);
}
function deathSaves() {
  const e = S.enc, d = vdef(); S.hp = 0; e.phase = 'dying';
  elog('[Your lid slams shut. You are at 0 HP. Death saving throws.]', 'bad');
  let s = 0, f = 0; const rolls = [];
  while (s < 3 && f < 3) { const r = die(20); rolls.push(r); if (r === 20) { s = 99; break; } if (r === 1) f += 2; else if (r >= 10) s++; else f++; }
  e.deathRolls = rolls;
  if (s === 99) {
    S.hp = 1; e.phase = 'combat'; e.surprise = true; e.v.swallowed = false; e.v.grappled = true;
    elog('[Natural 20. You are not dead. They are holding your lid open to look inside.]', 'title');
    return;
  }
  if (s >= 3) {
    S.hp = 1; award('whats_in', e.resMsgs = e.resMsgs || []);
    const takeable = S.grid.map((c, i) => [c, i]).filter(([c]) => c && !isAttuned(c.uid) && !(ITEMS[c.id].cursed && cursedOn()));
    if (takeable.length) { const [c, i] = pick(takeable); S.grid[i] = null; onGridChange(); elog(`${d.name} decides you're just a broken chest and takes your ${ITEMS[c.id].name}.`, 'bad'); }
    else elog(`${d.name} decides you're just a broken chest and leaves.`, 'bad');
    addNotoriety(3); return finish('stable');
  }
  // shattered
  S.stats.deaths++; award('splinters', e.resMsgs = e.resMsgs || []);
  S.grid = S.grid.map(c => (c && (isAttuned(c.uid) || (ITEMS[c.id].cursed && cursedOn()))) ? c : null); S.tray = []; onGridChange();
  S.belly = 0; S.notoriety = 0; S.cracked = 3; S.hp = maxHp(); S.xp = XP_AT[S.lvl];
  elog('[You shatter. Splinters everywhere. Some time later, they pull themselves back together.]', 'bad');
  elog('[You lost everything you were holding, except what you were attuned to. Cracked Lid: −2 AC for 3 fights. Your progress toward the next level is gone.]', 'bad');
  finish('shattered');
}
function win() {
  const e = S.enc, d = vdef(), v = e.v; const msgs = e.resMsgs = e.resMsgs || [];
  const inside = v.swallowed; const kind = inside ? 'digested' : 'eaten';
  elog(inside ? `[${d.name} has been digested. ${d.eat}]` : `[${d.name} is defeated. You eat what you can. ${d.eat}]`, 'title');
  gainXp(d.xp, msgs);
  const sz = SIZES[d.size];
  addEssence(d.type, inside ? 2 : 1, msgs);
  const bellyGain = inside ? sz.belly : (canSwallowSize(SIZE_BY_N[Math.max(0, sz.n - 1)]) ? Math.max(1, sz.belly - 1) : 1);
  S.belly += bellyGain;
  if (S.belly >= bellyCap() && !S.wasGorged) { S.wasGorged = true; S.gorged++; msgs.push({ text: '[Gorged. You are too full to swallow anything else. Stealth disguises −3.]', cls: 'bad' }); if (S.gorged >= 3) award('gourmand', msgs); }
  // loot
  const mult = REGIONS[S.region].loot || 1; const got = [];
  d.loot.forEach(([id, ch]) => { if (rnd() < Math.min(0.95, ch * mult)) { if (S.companion && S.companion.path === 'partner' && ITEMS[id].tags.includes('gold') && (S.lootCut = (S.lootCut || 0) + 1) % 3 === 0) { msgs.push({ text: `Wren takes her cut: ${ITEMS[id].name}.`, cls: '' }); return; } if (addLoot(id, msgs)) got.push(id); } });
  const Rg = REGIONS[S.region]; if (Rg.special && rnd() < 0.15) { const sp = pick(Rg.special); if (addLoot(sp, msgs)) { got.push(sp); msgs.push({ text: `[Local find: ${ITEMS[sp].name}. ${Rg.name} is known for these.]`, cls: 'level' }); } }
  e.loot = got;
  // records
  S.kills[d.id] = (S.kills[d.id] || 0) + 1; S.eaten++;
  award('first_bite', msgs); if (S.eaten >= 25) award('box_office', msgs);
  if (d.id === 'bard') award('off_key', msgs); if (d.type === 'celestial') award('angel_food', msgs); if (d.id === 'knight' && inside) award('heavy_metal', msgs); if (d.rival) award('cannibal', msgs);
  if (d.boss) { S.flags.heskDone = true; award('hunter_hunted', msgs); addNotoriety(-20); }
  if (d.type === 'humanoid') { const n = S.companion && S.companion.path === 'reformer' ? 2 : 1; addNotoriety(n); if (n === 2) msgs.push({ text: 'Wren looks at you for a long time. She does not say anything.', cls: '' }); }
  if (S.cracked > 0) S.cracked--;
  finish(kind);
}
function finish(result) {
  const e = S.enc; e.phase = 'done'; e.result = result; const d = vdef();
  if (result === 'fled') { S.stats.fled++; addNotoriety((d.type === 'humanoid' ? 6 : 2) + (CR_XP[d.cr] >= 200 ? 3 : 0), e.resMsgs = e.resMsgs || []); const b = baitItem(); if (b && rnd() < 0.3) { const i = S.grid.findIndex(c => c && c.uid === b.uid); S.grid[i] = null; onGridChange(); elog(`They grabbed your bait on the way out: ${ITEMS[b.id].name}.`, 'bad'); } }
  if (result === 'missed' || result === 'passed') { }
  unlockRegions();
}
function retreat() {
  const e = S.enc; if (!e || e.phase !== 'combat' || e.v.swallowed) return; const d = vdef();
  elog(`You slam your lid shut and refuse to open. ${d.name} gives up and leaves, telling everyone about the box that bit.`, 'bad');
  finish('retreat'); addNotoriety(d.type === 'humanoid' ? 4 : 2, e.resMsgs = e.resMsgs || []);
}
function closeEncounter() { const out = S.enc ? (S.enc.resMsgs || []) : []; S.enc = null; return out; }

// ---------- Companion ----------
const COMPANION_PATHS = {
  partner: { name: 'Partner', desc: 'Wren lures for you: +2 to every lure. She takes a cut of the gold.' },
  pet: { name: 'Pet', desc: 'Wren feeds you scraps while you are away and talks to you. +1 belly an hour, faster healing, but −1 to disguises.' },
  reformer: { name: 'Reformer', desc: 'Wren asks you not to eat people. Letting visitors pass earns XP and gifts, she teaches you to Sweet Talk, and eating humanoids makes you more notorious.' },
  snack: { name: 'Snack', desc: 'Eat her. The System will remember.' },
};
function chooseCompanion(path, msgs) {
  S.companion = { path, at: Date.now() };
  if (path === 'snack') {
    S.companion = { path: 'snack', at: Date.now() };
    gainXp(200, msgs); addEssence('humanoid', 3, msgs); award('trust_issues', msgs); S.belly += 4; addNotoriety(2, msgs);
    sys('[You ate Wren. She had trusted you. The System has made a note.]', 'bad');
  } else sys(`[Companion: Wren, ${COMPANION_PATHS[path].name}.]`, 'level');
}

// ---------- Time ----------
// minutes of real time pass. away=true also simulates catches and arrivals.
function simulate(minutes, away) {
  const rep = { minutes, caught: [], escaped: 0, hurt: 0, xp: 0, digested: null, arrivals: [], tooFull: 0, lines: [] };
  if (minutes <= 0) return rep;
  // hunger
  const rate = feat('glutton') ? 1 / 22 : 1 / 15; S.bellyAcc += minutes * rate;
  if (S.companion && S.companion.path === 'pet' && away) S.bellyAcc -= minutes / 60;
  const drop = Math.floor(S.bellyAcc); if (drop !== 0) { S.belly = Math.max(0, S.belly - drop); S.bellyAcc -= drop; }
  if (S.belly < bellyCap()) S.wasGorged = false;
  // healing
  const regen = (S.companion && S.companion.path === 'pet' ? 2 : 1) * (starving() ? 0.5 : 1);
  S.hpAcc = (S.hpAcc || 0) + maxHp() * 0.02 * minutes * regen; const hh = Math.floor(S.hpAcc); if (hh) { S.hp = Math.min(maxHp(), S.hp + hh); S.hpAcc -= hh; }
  // notoriety
  S.notAcc += minutes / 30; const nd = Math.floor(S.notAcc); if (nd) { S.notoriety = Math.max(0, S.notoriety - nd); S.notAcc -= nd; }
  // digestion
  if (S.digest) { S.digest.left -= minutes * 60000; if (S.digest.left <= 0) { rep.digested = S.digest.item.id; finishDigest(null); } }
  if (away) {
    const per = feat('patient') ? 6 : 12; const tries = Math.min(40, Math.floor(minutes / per)); const keep = feat('patient') ? 0.75 : 0.5;
    const R = REGIONS[S.region]; const small = Object.keys(R.w).filter(id => { const d = VISITORS[id]; return CR_XP[d.cr] <= 50 + S.lvl * 25 && !d.boss && !d.rival && SIZES[d.size].n <= 2; });
    for (let i = 0; i < tries; i++) {
      if (!small.length) break;
      if (S.belly >= Math.floor(bellyCap() * 0.6)) { rep.tooFull++; continue; } // leave room for the player
      const id = pick(small), d = VISITORS[id];
      const p = clamp(0.3 + 0.05 * (disguiseMod(S.form) - d.pp + 5) + 0.03 * S.lvl, 0.1, 0.9);
      if (rnd() < p) {
        const xp = d.xp * keep; rep.xp += xp; gainXp(xp, rep.lines); addEssence(d.type, 1, rep.lines); S.belly += Math.max(1, SIZES[d.size].belly - (canSwallowSize(d.size) ? 0 : 1));
        S.kills[id] = (S.kills[id] || 0) + 1; S.eaten++; rep.caught.push(id);
        if (d.type === 'humanoid') S.notoriety = Math.min(100, S.notoriety + 1);
        if (d.loot.length && rnd() < 0.35 && S.tray.length < 6) { const [lid, ch] = pick(d.loot); if (rnd() < Math.max(ch, 0.4)) addLoot(lid); }
      } else if (rnd() < 0.5) { rep.escaped++; S.notoriety = Math.min(100, S.notoriety + (d.type === 'humanoid' ? 2 : 1)); }
      else { const h = Math.min(S.hp - 1, die(4) + 1); S.hp -= Math.max(0, h); rep.hurt += Math.max(0, h); }
    }
    if (rep.caught.length) { award('first_bite', rep.lines); if (S.eaten >= 25) award('box_office', rep.lines); }
    // arrivals that wait for you
    const hours = Math.floor(minutes / 60) + (rnd() < (minutes % 60) / 60 ? 1 : 0);
    for (let h = 0; h < hours && S.queue.length < 3; h++) {
      if (rnd() > 0.55) continue;
      let q;
      if (S.notoriety >= 35 && S.lvl >= 4 && !S.flags.heskDone && !S.queue.includes('hesk')) q = 'hesk';
      else { const R2 = REGIONS[S.region]; const big = Object.keys(R2.w).filter(id => CR_XP[VISITORS[id].cr] >= 100); q = big.length ? pick(big) : rollVisitorId(); }
      S.queue.push(q); rep.arrivals.push(q);
    }
    if (S.notoriety >= 80 && rnd() < 0.5 && S.tray.length < 6) { const gift = pick(['copper', 'bread', 'holy_symbol', 'glowcap']); addLoot(gift); rep.lines.push({ text: `Someone left an offering in front of you: ${ITEMS[gift].name}.`, cls: 'good' }); }
    if (S.belly < bellyCap()) S.wasGorged = false;
  }
  unlockRegions();
  return rep;
}
function tickNaps(now) { while (S.naps < 3 && now - S.napAt >= 20 * 60000) { S.naps++; S.napAt += 20 * 60000; } if (S.naps >= 3) S.napAt = now; }
function nap() { if (S.naps <= 0) return null; S.naps--; if (S.naps === 2) S.napAt = Date.now(); return simulate(30, true); }
function rest() { if (S.belly < 1 || S.hp >= maxHp()) return false; S.belly -= 1; S.hp = maxHp(); return true; }
function moveTo(region) {
  if (!S.regions.includes(region) || region === S.region) return false;
  if (S.tier !== 'doorway') { if (S.belly < 1) return false; S.belly -= 1; }
  S.region = region; S.notoriety = Math.max(0, S.notoriety - (S.tier === 'doorway' ? 15 : 8)); S.queue = [];
  sys(`[You scuttle through the dark to ${REGIONS[region].name}. Nobody sees a chest walk. Nobody ever does.]`);
  return true;
}
function migrate(s) { if (!s || s.v !== VERSION) return null; S = s; TYPES.forEach(t => { if (S.essence[t] == null) S.essence[t] = 0; }); fitGrid(); return S; }
