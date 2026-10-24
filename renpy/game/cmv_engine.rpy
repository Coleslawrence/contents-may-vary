## Contents May Vary — rules engine (no screens, no story).
## Everything that rolls dice or changes the mimic lives here so the story
## scripts stay readable.

init -10 python:

    import copy
    import math

    # ---------- Dice ----------
    def cmv_rnd():
        return renpy.random.random()

    def die(n):
        return renpy.random.randint(1, n)

    def pick(seq):
        return seq[renpy.random.randint(0, len(seq) - 1)]

    def wpick(items, weights):
        total = sum(weights)
        x = cmv_rnd() * total
        for item, w in zip(items, weights):
            x -= w
            if x <= 0:
                return item
        return items[-1]

    def clamp(v, a, b):
        return max(a, min(b, v))

    def parse_expr(e):
        e = str(e)
        if "d" not in e:
            try:
                return 0, 0, int(e)
            except ValueError:
                return 0, 0, 0
        n, rest = e.split("d", 1)
        bonus = 0
        for sign in ("+", "-"):
            if sign in rest:
                s, b = rest.split(sign, 1)
                bonus = int(b) if sign == "+" else -int(b)
                rest = s
                break
        return int(n), int(rest), bonus

    def dice_roll(e, crit=False):
        n, s, b = parse_expr(e)
        if crit:
            n *= 2
        total = b
        for _i in range(n):
            total += die(s)
        return max(0, total)

    def dice_avg(e):
        n, s, b = parse_expr(e)
        return n * (s + 1) / 2.0 + b

    def roll_d20(mode=0):
        """mode > 0 advantage, < 0 disadvantage. Returns (result, first, second or None, mode)."""
        a, b = die(20), die(20)
        if mode > 0:
            return {"r": max(a, b), "a": a, "b": b, "mode": 1}
        if mode < 0:
            return {"r": min(a, b), "a": a, "b": b, "mode": -1}
        return {"r": a, "a": a, "b": None, "mode": 0}

    def sgn(n):
        return ("+" if n >= 0 else "-") + str(abs(n))

    # ---------- The mimic ----------
    class Mimic(object):

        def __init__(self, name="Lid"):
            self.name = name
            self.lvl = 1
            self.xp = 0
            self.abil = {"STR": 14, "DEX": 12, "CON": 14, "INT": 8, "WIS": 10, "CHA": 13}
            self.tier = "lesser"
            self.feats = []
            self.pending = []
            self.belly = 3
            self.hunger_skip = False
            self.notoriety = 0
            self.region = "f1"
            self.form = "chest"
            self.forms = ["chest"]
            self.regions = ["f1"]
            self.items = []
            self.attuned = []
            self.uid = 1
            self.bait = None
            self.digest = None
            self.essence = {t: 0 for t in TYPES}
            self.dtraits = {}
            self.titles = {}
            self.kills = {}
            self.eaten = 0
            self.gorged_count = 0
            self.was_gorged = False
            self.companion = None
            self.flags = {}
            self.met = []
            self.cracked = 0
            self.loot_cut = 0
            self.waits = 0
            self.passes = 0
            self.deaths = 0
            self.fled = 0
            self.mouth = "closed"
            self.msgs = []
            self.hp = self.max_hp()
            c = self.add_item("copper", quiet=True)
            self.bait = c["uid"]

        # ----- messages -----
        def say(self, text, cls=""):
            self.msgs.append((cls, text))

        def sysmsg(self, text, cls="sys"):
            self.msgs.append((cls, text))

        # ----- small lookups -----
        def tierdef(self):
            return TIERS[self.tier]

        def feat(self, k):
            return k in self.feats

        def ess(self, t):
            n = self.essence.get(t, 0)
            if n >= ESS_AT[1]:
                return 2
            if n >= ESS_AT[0]:
                return 1
            return 0

        def dt(self, tag):
            return self.dtraits.get(tag, 0)

        def cursed_on(self):
            return not self.feat("ironstomach")

        def has(self, iid):
            return any(c["id"] == iid for c in self.items)

        def count(self, iid):
            return sum(1 for c in self.items if c["id"] == iid)

        def find(self, uid):
            for c in self.items:
                if c["uid"] == uid:
                    return c
            return None

        def is_attuned(self, uid):
            return uid in self.attuned

        def active_items(self):
            return [c for c in self.items if not ITEMS[c["id"]].get("attune") or c["uid"] in self.attuned]

        def active_has(self, iid):
            return any(c["id"] == iid for c in self.active_items())

        # ----- abilities and derived numbers -----
        def score(self, k):
            v = self.abil[k]
            if k == "STR" and self.has("contract"):
                v += 2
            if k == "CHA" and self.has("contract") and self.cursed_on():
                v -= 1
            if k == "CHA" and self.ess("humanoid") >= 2:
                v += 2
            return clamp(v, 1, 24)

        def mod(self, k):
            return (self.score(k) - 10) // 2

        def prof(self):
            return 2 + (self.lvl - 1) // 4

        def max_hp(self):
            con = self.mod("CON")
            hp = 8 + con + (self.lvl - 1) * (5 + con)
            if self.tier == "vault":
                hp += 2 * self.lvl
            hp += [0, 5, 12][self.ess("giant")] + 3 * self.dt("cloth")
            return max(4, hp)

        def belly_cap(self):
            return (4 + 2 * max(0, self.mod("CON")) + self.tierdef()["belly"] + (4 if self.feat("glutton") else 0)
                    + 2 * self.dt("food") + [0, 2, 4][self.ess("giant")])

        def gorged(self):
            return self.belly >= self.belly_cap()

        def starving(self):
            return self.belly <= 0

        def capacity(self):
            return self.tierdef()["slots"] + (5 if self.flags.get("bag") else 0)

        def bone_pairs(self):
            return min(3, self.count("bone") // 2)

        def ac(self):
            a = self.tierdef()["ac"]
            for c in self.active_items():
                a += ITEMS[c["id"]].get("ac", 0)
            a += self.bone_pairs() + self.dt("armor") + self.dt("bone") + [0, 1, 2][self.ess("construct")]
            if self.feat("gilded"):
                a += 1
            if self.cracked > 0:
                a -= 2
            return a

        def save_bonus(self, k):
            b = self.mod(k) + self.dt("holy")
            for c in self.active_items():
                b += ITEMS[c["id"]].get("saves", 0)
            return b

        def init_bonus(self):
            b = self.mod("DEX") + [0, 1, 2][self.ess("beast")]
            for c in self.active_items():
                b += ITEMS[c["id"]].get("init", 0)
            if self.gorged():
                b -= 2
            return b

        def insight_bonus(self):
            return self.mod("WIS") + self.prof() + self.dt("paper")

        def disguise_mod(self, form=None):
            f = FORMS[form or self.form]
            m = (self.mod("DEX") if f["skill"] == "Stealth" else self.mod("CHA")) + self.prof() + f["bonus"]
            if f["skill"] == "Deception":
                m += self.dt("gold") + self.dt("music")
            else:
                for c in self.active_items():
                    m += ITEMS[c["id"]].get("stealth", 0) - ITEMS[c["id"]].get("clank", 0)
                if self.gorged():
                    m -= 3
            if self.ess("fey") >= 1:
                m += 2
            if self.feat("gilded"):
                m += 1
            if self.tier == "wardrobe":
                m += 2
            if self.companion == "pet":
                m -= 1
            return m

        def guard_mod(self):
            return sum(ITEMS[c["id"]].get("guard", 0) for c in self.active_items())

        def escape_dc(self):
            dc = 8 + self.prof() + self.mod("STR") + self.dt("tool")
            dc += sum(ITEMS[c["id"]].get("grip", 0) for c in self.active_items())
            if self.tier == "vault":
                dc += 3
            if self.feat("lockjaw"):
                dc += 3
            if self.ess("plant") >= 2:
                dc += 2
            return dc

        def swallow_dc(self):
            return 8 + self.prof() + self.mod("STR") + self.dt("tool")

        def bite_hit(self):
            return self.prof() + self.mod("STR")

        def bite_flat(self):
            return self.dt("blade") + [0, 1, 2][self.ess("beast")] + self.dt("fire")

        def bite_text(self):
            return "{} to hit, 1d8{}".format(sgn(self.bite_hit()), sgn(self.mod("STR") + self.bite_flat()))

        def acid_parts(self):
            n = self.tierdef()["acid"] + [0, 1, 2][self.ess("ooze")]
            if self.has("salt") and self.cursed_on():
                n = max(0, n - 1)
            return n, self.dt("metal") + max(0, self.mod("CON"))

        def acid_text(self):
            n, b = self.acid_parts()
            return "{}d6{}".format(n, sgn(b))

        def acid_roll(self):
            n, b = self.acid_parts()
            return b + sum(die(6) for _i in range(n))

        def best_weapon(self):
            best = None
            blades = sum(1 for c in self.items if "blade" in ITEMS[c["id"]]["tags"])
            for c in self.active_items():
                it = ITEMS[c["id"]]
                if not it.get("weapon"):
                    continue
                adj = min(2, blades - 1) if "blade" in it["tags"] else 0
                a = dice_avg(it["weapon"]) + adj
                if best is None or a > best["avg"]:
                    best = {"c": c, "it": it, "adj": adj, "avg": a}
            return best

        def breath_info(self):
            wand = any(c["id"] == "ember_wand" and c["uid"] in self.attuned for c in self.items)
            f = self.ess("fiend")
            if not wand and not f:
                return None
            extra = []
            if wand:
                if self.has("spellbook"):
                    extra.append("1d6")
                if self.has("ember_core"):
                    extra.append("1d4")
            return {"expr": ("3d6" if f == 2 else "2d6"), "extra": extra, "flat": self.dt("arcane"),
                    "dc": 8 + self.prof() + self.mod("CON") + self.dt("arcane")}

        def fire_res(self):
            return self.active_has("dragon_scale") or self.ess("elemental") >= 1

        def not_tier(self):
            n = self.notoriety
            return 3 if n >= 80 else 2 if n >= 50 else 1 if n >= 25 else 0

        def not_name(self):
            return NOT_NAMES[self.not_tier()]

        def can_swallow_size(self, sz):
            return SIZES[sz]["n"] <= self.tierdef()["swallow"]

        def swallow_size_name(self):
            return SIZES[SIZE_BY_N[self.tierdef()["swallow"]]]["name"]

        def cut_threshold(self):
            return max(10, self.max_hp() // 3)

        def xp_next(self):
            return 0 if self.lvl >= MAX_LVL else XP_AT[self.lvl + 1]

        def xp_frac(self):
            if self.lvl >= MAX_LVL:
                return 1.0
            lo, hi = XP_AT[self.lvl], XP_AT[self.lvl + 1]
            return clamp((self.xp - lo) / float(hi - lo), 0.0, 1.0)

        # ----- items -----
        def add_item(self, iid, quiet=False):
            it = ITEMS[iid]
            if len(self.items) >= self.capacity():
                if not quiet:
                    self.say("No room inside you. The {} falls out.".format(it["name"]), "bad")
                return None
            c = {"id": iid, "uid": self.uid}
            self.uid += 1
            self.items.append(c)
            if iid == "bag":
                self.flags["bag"] = True
                self.award("bigger")
            if it.get("attune") and len(self.attuned) < 3:
                self.attuned.append(c["uid"])
            if iid == "treasure_map" and "vault" not in self.regions:
                self.regions.append("vault")
                self.sysmsg("The Treasure Map shows a way into the Hidden Vault. It is now on your map.", "level")
            return c

        def remove_item(self, uid):
            c = self.find(uid)
            if c is None:
                return None
            self.items.remove(c)
            if uid in self.attuned:
                self.attuned.remove(uid)
            if self.bait == uid:
                self.bait = None
            return c

        def can_spit(self, uid):
            c = self.find(uid)
            return c is not None and not (ITEMS[c["id"]].get("cursed") and self.cursed_on())

        def spit_out(self, uid):
            if self.can_spit(uid):
                c = self.remove_item(uid)
                self.say("You spit out the {}. It skitters across the floor.".format(ITEMS[c["id"]]["name"]))

        def toggle_attune(self, uid):
            c = self.find(uid)
            if c is None or not ITEMS[c["id"]].get("attune"):
                return
            if uid in self.attuned:
                self.attuned.remove(uid)
            elif len(self.attuned) < 3:
                self.attuned.append(uid)
                if self.bait == uid:
                    self.bait = None

        def can_bait(self, uid):
            c = self.find(uid)
            if c is None or uid in self.attuned:
                return False
            return any(TAG_WANT.get(t) for t in ITEMS[c["id"]]["tags"])

        def set_bait(self, uid):
            self.bait = None if self.bait == uid else uid

        def fusable(self):
            out = []
            for c in self.items:
                f = ITEMS[c["id"]].get("fuse")
                if f and self.count(c["id"]) >= 3 and c["id"] not in out:
                    out.append(c["id"])
            return out

        def fuse(self, iid):
            into = ITEMS[iid]["fuse"]
            removed = 0
            for c in list(self.items):
                if c["id"] == iid and removed < 3:
                    self.remove_item(c["uid"])
                    removed += 1
            self.add_item(into, quiet=True)
            self.sysmsg("Fusion! Three {} become one {}.".format(ITEMS[iid]["name"], ITEMS[into]["name"]), "level")
            self.award("fusion")

        def can_eat(self, uid):
            c = self.find(uid)
            return c is not None and ITEMS[c["id"]].get("use") == "eat"

        def eat_item(self, uid):
            if not self.can_eat(uid):
                return
            c = self.remove_item(uid)
            it = ITEMS[c["id"]]
            self.belly = min(self.belly_cap() + 2, self.belly + it.get("belly", 1))
            if it.get("heal"):
                self.hp = min(self.max_hp(), self.hp + dice_roll(it["heal"]) + 2 * self.dt("potion"))
            self.say("You eat the {}. Delicious, technically.".format(it["name"]), "good")

        def can_digest(self, uid):
            c = self.find(uid)
            return self.digest is None and c is not None and not ITEMS[c["id"]].get("no_digest")

        def digest_waits(self, iid):
            base = DIGEST_WAITS[ITEMS[iid]["r"]]
            return max(1, int(math.ceil(base / float([1, 2, 3][self.ess("ooze")]))))

        def start_digest(self, uid):
            if not self.can_digest(uid):
                return
            c = self.remove_item(uid)
            n = self.digest_waits(c["id"])
            self.digest = {"id": c["id"], "left": n, "total": n}
            self.say("You start digesting the {}. Done in {} wait{}.".format(ITEMS[c["id"]]["name"], n, "" if n == 1 else "s"))

        def tick_digest(self):
            if not self.digest:
                return
            self.digest["left"] -= 1
            if self.digest["left"] <= 0:
                self.finish_digest()

        def finish_digest(self):
            iid = self.digest["id"]
            it = ITEMS[iid]
            self.digest = None
            gained = []
            for tag in it["tags"]:
                if tag in DIGEST_TAGS:
                    name, each, mx = DIGEST_TAGS[tag]
                    if self.dt(tag) < mx:
                        self.dtraits[tag] = self.dt(tag) + 1
                        gained.append("{} ({})".format(name, each))
                if tag in TYPES:
                    self.add_essence(tag, 1)
                    gained.append(TYPE_NAME[tag] + " essence")
            if iid == "spellbook" and "bookshelf" not in self.forms:
                self.forms.append("bookshelf")
                gained.append("the Bookshelf form")
            if gained:
                line = "Digested: {}. You gained {}.".format(it["name"], ", ".join(gained))
            elif "junk" in it["tags"]:
                line = "Digested: {}. You gained nothing. You knew that.".format(it["name"])
            else:
                line = "Digested: {}. Your traits from it are already maxed.".format(it["name"])
            self.sysmsg(line, "level")

        # ----- growth -----
        def add_essence(self, t, n):
            before = self.ess(t)
            self.essence[t] = self.essence.get(t, 0) + n
            after = self.ess(t)
            if after > before:
                name, i, ii = ESSENCE[t]
                self.sysmsg("{} trait {}: {}. {}".format(TYPE_NAME[t], "awakened" if after == 1 else "deepened", name, i if after == 1 else ii), "level")
                if t == "undead" and after == 2 and "coffin" not in self.forms:
                    self.forms.append("coffin")
                if t == "giant":
                    self.hp += 5 if after == 1 else 7
            if sum(1 for x in TYPES if self.essence.get(x, 0) > 0) >= 10:
                self.award("omnivore")

        def award(self, tid):
            if tid in self.titles:
                return
            self.titles[tid] = True
            name, desc = TITLES[tid]
            self.sysmsg("Title earned: {}. {}".format(name, desc), "title")

        def gain_xp(self, n):
            if self.lvl >= MAX_LVL:
                return
            self.xp += int(round(n))
            while self.lvl < MAX_LVL and self.xp >= XP_AT[self.lvl + 1]:
                before = self.max_hp()
                self.lvl += 1
                self.hp += self.max_hp() - before
                self.sysmsg(LEVEL_LINES[self.lvl], "level")
                if self.lvl in ASI_LVLS:
                    self.pending.append("asi")

        def ensure_level(self, lvl):
            if self.lvl < lvl:
                self.gain_xp(XP_AT[lvl] - self.xp)

        def evolve_to(self, tier):
            before = self.max_hp()
            self.tier = tier
            self.hp += max(0, self.max_hp() - before)
            if tier == "chest" and "barrel" not in self.forms:
                self.forms.append("barrel")
            if tier == "barrel":
                self.form = "barrel"
            if tier == "wardrobe":
                for f in ("wardrobe", "coffin"):
                    if f not in self.forms:
                        self.forms.append(f)
                self.form = "wardrobe"
            if tier == "doorway":
                if "door" not in self.forms:
                    self.forms.append("door")
                self.form = "door"
            if tier == "vault":
                self.form = "chest"
            self.sysmsg("Evolution complete: {}. {}".format(TIERS[tier]["name"], TIERS[tier]["desc"]), "level")
            self.unlock_regions()

        def apply_asi(self, choice):
            if choice in ABILS:
                before = self.max_hp()
                self.abil[choice] = min(20, self.abil[choice] + 2)
                if choice == "CON":
                    self.hp += self.max_hp() - before
                self.sysmsg("{} +2.".format(ABIL_NAME[choice]), "level")
            elif choice in FEATS and not self.feat(choice):
                self.feats.append(choice)
                self.sysmsg("Feat learned: {}. {}".format(FEATS[choice][0], FEATS[choice][1]), "level")
            if "asi" in self.pending:
                self.pending.remove("asi")

        def region_open(self, k):
            R = REGIONS[k]
            if R.get("secret"):
                return False
            if k == "road" and self.tier == "lesser":
                return False
            return self.lvl >= R["lvl"]

        def unlock_regions(self):
            for k in REGION_ORDER:
                if k not in self.regions and self.region_open(k):
                    self.regions.append(k)
                    self.sysmsg("New area reachable: {}.".format(REGIONS[k]["name"]), "level")

        def add_notoriety(self, n):
            before = self.not_tier()
            self.notoriety = clamp(self.notoriety + n, 0, 100)
            after = self.not_tier()
            if after > before:
                self.sysmsg([
                    "",
                    "Notoriety: Wanted. Posters with a crude drawing of a box have appeared. People look closer.",
                    "Notoriety: Hunted. The Mimic Hunters have heard of you.",
                    "Notoriety: Legend. Someone has started leaving offerings in front of you.",
                ][after], "bad")

        # ----- bait and visitors -----
        def bait_item(self):
            return self.find(self.bait) if self.bait else None

        def bait_wants(self):
            b = self.bait_item()
            if not b:
                return []
            out = []
            for t in ITEMS[b["id"]]["tags"]:
                w = TAG_WANT.get(t)
                if w and w not in out:
                    out.append(w)
            return out

        def bait_bonus(self, d):
            b = self.bait_item()
            if not b:
                return 0
            ws = self.bait_wants()
            if not any(w in ws for w in d["wants"]):
                return 0
            n = 2 + ITEMS[b["id"]].get("bait", 0)
            if "gold" in ws:
                others = sum(1 for c in self.items if c["uid"] != b["uid"] and "gold" in ITEMS[c["id"]]["tags"])
                n += min(2, others) + [0, 1, 2][self.ess("dragon")]
            return n

        def spawn_weights(self, region=None):
            R = REGIONS[region or self.region]
            ws = self.bait_wants()
            fa = FORMS[self.form]["attract"]
            ids = list(R["w"].keys())
            weights = []
            for vid in ids:
                v = VISITORS[vid]
                w = R["w"][vid]
                if any(x in ws for x in v["wants"]):
                    w *= 2.5
                if any(x in fa for x in v["wants"]):
                    w *= 1.8
                weights.append(w)
            return ids, weights

        def next_visitor(self):
            for vid in REGIONS[self.region]["first"]:
                if vid not in self.met:
                    return vid
            ids, w = self.spawn_weights()
            return wpick(ids, w)

        # ----- waiting, resting, travel -----
        def wait(self):
            """One stretch of waiting in the dark before the next visitor."""
            self.waits += 1
            if self.feat("glutton"):
                self.hunger_skip = not self.hunger_skip
                if not self.hunger_skip:
                    self.belly = max(0, self.belly - 1)
            else:
                self.belly = max(0, self.belly - 1)
            if self.companion == "pet":
                self.belly = min(self.belly_cap(), self.belly + 1)
            if self.belly < self.belly_cap():
                self.was_gorged = False
            if not self.starving():
                rate = 0.2 if self.companion == "pet" else 0.1
                self.hp = min(self.max_hp(), self.hp + max(1, int(self.max_hp() * rate)))
            self.notoriety = max(0, self.notoriety - 4)
            self.tick_digest()
            if self.not_tier() >= 3 and cmv_rnd() < 0.5:
                gift = pick(["copper", "bread", "holy_symbol", "glowcap"])
                if self.add_item(gift, quiet=True):
                    self.say("Someone left an offering in front of you: {}.".format(ITEMS[gift]["name"]), "good")

        def can_rest(self):
            return self.belly >= 1 and self.hp < self.max_hp()

        def rest(self):
            if not self.can_rest():
                return
            self.belly -= 1
            self.hp = self.max_hp()
            self.tick_digest()
            self.say("You close your lid and rest. Your hinges stop aching. (Belly -1, HP full.)", "good")

        def travel_cost(self):
            return 0 if self.tier == "doorway" else 1

        def can_travel(self, k):
            if k == "vault" and self.tier not in BRANCHES:
                return False
            return k in self.regions and k != self.region and self.belly >= self.travel_cost()

        def travel(self, k):
            if not self.can_travel(k):
                return
            self.belly -= self.travel_cost()
            self.region = k
            self.notoriety = max(0, self.notoriety - (15 if self.tier == "doorway" else 8))
            self.say("You scuttle through the dark to {}. Nobody sees a chest walk. Nobody ever does.".format(REGIONS[k]["name"]))

        def set_form(self, f):
            if f in self.forms:
                self.form = f

        # ----- Wren -----
        def choose_companion(self, path):
            self.companion = path
            if path == "snack":
                self.gain_xp(150)
                self.add_essence("humanoid", 3)
                self.belly += 4
                self.add_notoriety(2)
                self.award("trust_issues")
                self.sysmsg("You ate Wren. She had trusted you. The System has made a note.", "bad")
            else:
                self.sysmsg("Companion: Wren, {}. {}".format(COMPANION_PATHS[path][0], COMPANION_PATHS[path][1]), "level")

        def parley(self):
            """Wren talks Sister Hesk down. Returns the dice record."""
            r = roll_d20(0)
            humanoids = sum(n for vid, n in self.kills.items() if VISITORS[vid]["type"] == "humanoid" and vid != "hesk")
            dc = 12 + 2 * self.not_tier() + min(4, humanoids // 2)
            mod = self.mod("CHA") + self.prof() + 2
            ok = r["r"] + mod >= dc
            word = "SUCCESS" if ok else "FAIL"
            return {"label": "Persuasion (Wren helps, +2)", "r": r["r"], "a": r["a"], "b": None, "mode": 0, "mod": mod,
                    "total": r["r"] + mod, "vs": dc, "vs_label": "DC", "ok": ok, "crit": False, "them": False,
                    "parts": [], "word": word}

        # ----- image -----
        def sprite(self):
            f = self.form
            if f == "chest" and self.tier == "vault":
                f = "vault"
            return "images/mimic/{}_{}.png".format(f, "open" if self.mouth == "open" else "closed")

        def sprite_zoom(self):
            return 0.72 if self.tier == "lesser" else 1.0


    # ---------- An encounter with one visitor ----------
    class Encounter(object):

        def __init__(self, mim, vid):
            self.m = mim
            self.vid = vid
            d = VISITORS[vid]
            self.v = {"hp": d["hp"], "max": d["hp"], "grappled": False, "swallowed": False, "blind": 0,
                      "charmed": 0, "healed": False, "spec_used": [], "fled": False}
            self.phase = "approach"
            self.insight = None
            self.sweet = False
            self.surprise = False
            self.skip_enemy = 0
            self.turn = 0
            self.dice = None
            self.dice2 = None
            self.dice_n = 0
            self.breath_ready = True
            self.used = []
            self.stun = 0
            self.mocked = 0
            self.dark = 0
            self.poisoned = 0
            self.salted = 0
            self.braced = False
            self.gulp_used = False
            self.play_dead = False
            self.result = None
            self.loot = []
            self.death_rolls = []
            self.hurt_me = False
            self.hurt_v = False
            self.pp_mod = 0
            self.no_inv_adv = False
            if vid not in mim.met:
                mim.met.append(vid)
            mim.mouth = "closed"
            self.log(d["line"])
            if d["rival"]:
                self.log("Warning: you are not the only mimic in this dungeon.", "sys")
            if d["boss"]:
                self.log("Warning: this visitor is carrying a ten-foot pole. That is a professional.", "sys")

        # ----- helpers -----
        def d(self):
            return VISITORS[self.vid]

        def name(self):
            return self.d()["name"]

        def log(self, text, cls=""):
            self.m.msgs.append((cls, text))

        def set_dice(self, label, r, mod, vs, vs_label, ok, crit=False, them=False, parts=None):
            if crit and ok:
                word = "CRITICAL!"
            elif crit:
                word = "CRITICAL HIT ON YOU"
            elif them:
                word = "THEY FAIL" if ok else "THEY SUCCEED"
            else:
                word = "SUCCESS" if ok else "FAIL"
            self.dice = {"label": label, "r": r["r"], "a": r["a"], "b": r["b"], "mode": r["mode"], "mod": mod,
                         "total": r["r"] + mod, "vs": vs, "vs_label": vs_label, "ok": ok, "crit": crit, "them": them,
                         "parts": parts or [], "word": word}
            self.dice_n += 1

        def alive(self):
            return self.v["hp"] > 0

        def visitor_pp(self):
            d = self.d()
            return d["pp"] + self.pp_mod + (self.m.not_tier() if d["type"] == "humanoid" else 0)

        def wants_text(self):
            return " and ".join(WANTS[w] for w in self.d()["wants"])

        def can_sweet(self):
            m = self.m
            return (self.d()["type"] in SPEAKERS and not self.sweet
                    and (m.ess("humanoid") >= 1 or m.feat("silver") or m.companion == "reformer"))

        def sweet_bonus(self):
            return 5 if self.m.ess("humanoid") >= 2 else 3

        def lure_chance_text(self):
            m, d = self.m, self.d()
            mod = m.disguise_mod() + m.bait_bonus(d) + (self.sweet_bonus() if self.sweet else 0) + (2 if m.companion == "partner" else 0)
            need = self.visitor_pp() - mod
            pct = clamp(21 - need, 1, 20) * 5
            return "{}%".format(pct)

        # ----- approach -----
        def act_insight(self):
            m = self.m
            if self.insight is not None:
                return
            if m.feat("silver"):
                self.insight = True
            else:
                r = roll_d20(0)
                ok = r["r"] + m.insight_bonus() >= 12
                self.set_dice("Insight", r, m.insight_bonus(), 12, "DC", ok)
                self.insight = ok
            if self.insight:
                d = self.d()
                extra = " They look ready for a fight." if d["aggressive"] else ""
                if d["inv"] is not None:
                    extra += " They check things carefully before touching them."
                self.log("You read them. They want {}.{}".format(self.wants_text(), extra), "good")
            else:
                self.log("You cannot read them. They are a mystery wrapped in a visitor.")

        def act_sweet(self):
            if not self.can_sweet():
                return
            self.sweet = True
            self.log(pick(['"Psst. Free loot. Totally free."',
                           '"Hello, traveller. I am a perfectly normal chest. Open me."',
                           '"Oh no. I am so heavy and full of gold. If only someone would open me."']), "me")

        def act_lure(self):
            m, d = self.m, self.d()
            if d["rival"]:
                self.log("The other chest opens its lid. So do you. Neither of you is fooled.", "bad")
                return self.begin_combat(False)
            bb = m.bait_bonus(d)
            sw = self.sweet_bonus() if self.sweet else 0
            part = 2 if m.companion == "partner" else 0
            mode = (1 if m.ess("fey") >= 2 else 0) + (-1 if m.gorged() and FORMS[m.form]["skill"] == "Stealth" else 0)
            dm = m.disguise_mod()
            mod = dm + bb + sw + part
            r = roll_d20(mode)
            pp = self.visitor_pp()
            ok = r["r"] + mod >= pp
            parts = [p for p in [("disguise", dm), ("bait", bb), ("sweet talk", sw), ("Wren", part)] if p[1]]
            self.set_dice(FORMS[m.form]["skill"], r, mod, pp, "Passive Perception", ok, parts=parts)
            if not ok:
                self.log("{} isn't fooled.".format(d["name"]), "bad")
                if d["aggressive"] or d["boss"]:
                    self.log("{} attacks!".format(d["name"]), "bad")
                    return self.begin_combat(False)
                self.phase = "missed"
                return
            self.log("The bait works. {} comes closer.".format(d["name"]) if bb else "{} comes closer.".format(d["name"]), "good")
            if d["inv"] is not None:
                adv = (d["chest_adv"] and m.form == "chest") or d["always_adv"]
                no_adv = m.active_has("hesk_crowbar") or self.no_inv_adv
                r2 = roll_d20(1 if adv and not no_adv else 0)
                dc = 10 + m.disguise_mod() + m.guard_mod()
                spotted = r2["r"] + d["inv"] >= dc
                self.dice2 = self.dice
                self.set_dice("{}: Investigation".format(d["name"]), r2, d["inv"], dc, "your disguise", not spotted, them=True)
                if spotted:
                    if d["always_adv"]:
                        self.log("She pokes you with the ten-foot pole. You flinch. She smiles.", "bad")
                    else:
                        self.log("{} checks you carefully and spots a tooth.".format(d["name"]), "bad")
                    if d["flee"] >= 0.6 and not d["aggressive"]:
                        self.phase = "combat"
                        self.turn = 1
                        return self.try_flee_now()
                    return self.begin_combat(False)
                self.log("{} checks you over and finds nothing wrong.".format(d["name"]), "good")
            self.touched()

        def touched(self):
            d = self.d()
            self.log("{} opens your lid.".format(d["name"]))
            self.log("Adhesive: they are stuck to you.", "sys")
            self.v["grappled"] = True
            self.surprise = True
            self.skip_enemy = 1
            self.begin_combat(True)

        def act_lunge(self):
            self.log("You lunge.", "me")
            self.begin_combat(False)

        def act_pass(self):
            m, d = self.m, self.d()
            if m.companion == "reformer":
                xp = d["xp"] * 0.25
                m.gain_xp(xp)
                self.log("Wren smiles at you. (+{} XP)".format(int(round(xp))), "good")
                if cmv_rnd() < 0.25 and d["loot"]:
                    iid = pick(d["loot"])[0]
                    if m.add_item(iid):
                        self.log("The visitor leaves something by you on the way out: {}.".format(ITEMS[iid]["name"]), "good")
            else:
                self.log("You hold very, very still. They walk on by.")
            m.passes += 1
            if m.passes >= 5:
                m.award("pacifist")
            self.finish("passed")

        def begin_combat(self, surprise):
            m, d = self.m, self.d()
            self.phase = "combat"
            self.turn = 1
            m.mouth = "open"
            if surprise:
                self.log("Surprise round. You attack with advantage.", "sys")
                return
            me = roll_d20(-1 if m.gorged() else 0)
            them = roll_d20(0)
            mi, ti = me["r"] + m.init_bonus(), them["r"] + d["dex"]
            self.set_dice("Initiative", me, m.init_bonus(), ti, "{}'s initiative".format(d["name"]), mi >= ti)
            if mi < ti:
                self.log("{} acts first.".format(d["name"]), "bad")
                self.enemy_turn()
            else:
                self.log("You act first.", "good")

        # ----- combat actions -----
        def can(self, k):
            if self.phase != "combat":
                return False
            m, v, d = self.m, self.v, self.d()
            sw = v["swallowed"]
            if k in ("clench", "brace", "spit"):
                return sw
            if sw:
                return False
            if k == "bite":
                return True
            if k == "tongue":
                return not v["grappled"]
            if k == "swallow":
                gulp = m.tier == "doorway" and not self.gulp_used
                return v["grappled"] or gulp
            if k == "weapon":
                return m.best_weapon() is not None
            if k == "breath":
                return m.breath_info() is not None
            if k == "items":
                return len(self.usable_items()) > 0
            if k == "dead":
                return not v["grappled"]
            if k == "retreat":
                return not d["boss"] and not d["rival"]
            return False

        def swallow_blocked(self):
            m, d = self.m, self.d()
            if not m.can_swallow_size(d["size"]):
                return "too big: {}".format(SIZES[d["size"]]["name"])
            if m.gorged():
                return "too full"
            return None

        def swallow_text(self):
            b = self.swallow_blocked()
            if b:
                return b
            lab = "DC {} Dex save".format(self.m.swallow_dc())
            if not self.v["grappled"]:
                lab = "Doorway Gulp, " + lab
            return lab

        def weapon_text(self):
            w = self.m.best_weapon()
            if not w:
                return ""
            return "{}, {} to hit, {}{}".format(w["it"]["name"], sgn(self.m.bite_hit() + w["it"].get("hit", 0)), w["it"]["weapon"], sgn(self.m.mod("STR") + w["adj"]))

        def breath_text(self):
            b = self.m.breath_info()
            if not b:
                return ""
            return "{}, DC {}".format(b["expr"], b["dc"]) if self.breath_ready else "recharging"

        def usable_items(self):
            out = []
            seen = []
            for c in self.m.items:
                it = ITEMS[c["id"]]
                u = it.get("use")
                if u in ("heal", "blind") or (u == "charm" and "lute" not in self.used):
                    if c["id"] not in seen:
                        seen.append(c["id"])
                        out.append(c)
            return out

        def item_label(self, c):
            it = ITEMS[c["id"]]
            u = it.get("use")
            if u == "heal":
                return "{} (heal {})".format(it["name"], it["heal"])
            if u == "blind":
                return "{} (blind them for 2 turns)".format(it["name"])
            return "Play the Lute (charm, DC {})".format(10 + self.d()["wis"])

        def bite_mode(self):
            mode = 0
            if self.surprise or self.play_dead:
                mode = 1
            if self.m.feat("lockjaw") and self.v["grappled"]:
                mode = 1
            if self.mocked:
                mode -= 1
            if self.dark:
                mode -= 1
            return clamp(mode, -1, 1)

        def crit_on(self):
            return 20 - [0, 1, 2][self.m.ess("construct")]

        def do_bite(self, label="Bite"):
            m, v, d = self.m, self.v, self.d()
            r = roll_d20(self.bite_mode())
            hit_b = m.bite_hit() - (2 if self.poisoned else 0)
            crit = r["r"] >= self.crit_on()
            hit = crit or (r["r"] != 1 and r["r"] + hit_b >= d["ac"])
            self.set_dice(label, r, hit_b, d["ac"], "AC", hit, crit=crit)
            if not hit:
                self.log("{} misses.".format(label))
                return 0
            dmg = dice_roll("1d8", crit) + m.mod("STR") + m.bite_flat()
            for c in m.active_items():
                eb = ITEMS[c["id"]].get("extra_bite")
                if eb:
                    dmg += dice_roll(eb, crit)
            if m.has("holy_symbol") and d["type"] in ("undead", "fiend"):
                dmg += dice_roll("1d4", crit)
            if m.ess("elemental") >= 2:
                dmg += dice_roll("1d4", crit)
            if m.ess("monstrosity") and v["hp"] <= v["max"] / 2.0:
                dmg += dice_roll("2d6" if m.ess("monstrosity") == 2 else "1d6", crit)
            dmg = max(1, dmg)
            self.hurt_visitor(dmg, ("CRITICAL! " if crit else "") + label)
            return dmg

        def hurt_visitor(self, n, what):
            self.v["hp"] -= n
            self.hurt_v = True
            self.log("{}: {} damage.".format(what, n), "me")

        def hurt_mimic(self, n, what, kind=None):
            m = self.m
            if kind == "fire" and m.fire_res():
                n //= 2
            if kind == "acid" and (m.feat("ironstomach") or m.ess("elemental") >= 2):
                n //= 2
            if kind == "poison" and m.feat("ironstomach"):
                n //= 2
            n = max(0, n)
            m.hp -= n
            if n:
                self.hurt_me = True
            self.log("{}: {} damage to you.".format(what, n), "foe")
            return n

        def act(self, k, uid=None):
            if self.phase != "combat":
                return
            m, v, d = self.m, self.v, self.d()
            self.hurt_me = False
            self.hurt_v = False
            if k == "bite":
                self.do_bite()
                if m.tier == "barrel" and self.alive():
                    self.do_bite("Second bite")
            elif k == "tongue":
                r = roll_d20(self.bite_mode())
                b = m.bite_hit() + [0, 2, 4][m.ess("plant")]
                hit = r["r"] == 20 or (r["r"] != 1 and r["r"] + b >= d["ac"])
                self.set_dice("Tongue Lash", r, b, d["ac"], "AC", hit)
                if hit:
                    v["grappled"] = True
                    self.log("Your tongue wraps around the {}. Grappled.".format(d["name"]), "me")
                else:
                    self.log("Your tongue slaps the floor.")
            elif k == "swallow":
                if self.swallow_blocked():
                    return
                if not v["grappled"]:
                    self.gulp_used = True
                r = roll_d20(0)
                dc = m.swallow_dc()
                saved = r["r"] + d["dex"] >= dc
                self.set_dice("{}: Dexterity save".format(d["name"]), r, d["dex"], dc, "your swallow DC", not saved, them=True)
                if saved:
                    self.log("The {} braces against your jaws and stays outside.".format(d["name"]), "bad")
                else:
                    v["swallowed"] = True
                    v["grappled"] = True
                    self.log("Swallowed. The {} is inside you now.".format(d["name"]), "sys")
            elif k == "clench":
                self.hurt_visitor(max(1, m.acid_roll()), "You clench")
            elif k == "brace":
                self.braced = True
                self.log("You brace your insides.", "me")
            elif k == "spit":
                v["swallowed"] = False
                v["grappled"] = False
                self.log("You spit the {} out.".format(d["name"]), "me")
                self.try_flee_now()
                return
            elif k == "weapon":
                w = m.best_weapon()
                if not w:
                    return
                r = roll_d20(self.bite_mode())
                b = m.bite_hit() + w["it"].get("hit", 0) - (2 if self.poisoned else 0)
                crit = r["r"] >= 20
                hit = crit or (r["r"] != 1 and r["r"] + b >= d["ac"])
                self.set_dice(w["it"]["name"], r, b, d["ac"], "AC", hit, crit=crit)
                if hit:
                    self.hurt_visitor(max(1, dice_roll(w["it"]["weapon"], crit) + m.mod("STR") + w["adj"]),
                                      "{}You swing the {} with your tongue".format("CRITICAL! " if crit else "", w["it"]["name"]))
                else:
                    self.log("The {} whiffs.".format(w["it"]["name"]))
            elif k == "breath":
                b = m.breath_info()
                if not b or not self.breath_ready:
                    return
                self.breath_ready = False
                dmg = dice_roll(b["expr"]) + b["flat"] + sum(dice_roll(x) for x in b["extra"])
                r = roll_d20(0)
                saved = r["r"] + d["dex"] >= b["dc"]
                self.set_dice("{}: Dexterity save".format(d["name"]), r, d["dex"], b["dc"], "your breath DC", not saved, them=True)
                self.hurt_visitor(dmg // 2 if saved else dmg, "Fire breath (half)" if saved else "Fire breath")
            elif k == "item":
                c = m.find(uid)
                if c is None:
                    return
                it = ITEMS[c["id"]]
                u = it.get("use")
                if u == "heal":
                    h = dice_roll(it["heal"]) + 2 * m.dt("potion")
                    m.remove_item(uid)
                    m.hp = min(m.max_hp(), m.hp + h)
                    self.log("You drink the potion from the inside. +{} HP.".format(h), "good")
                elif u == "blind":
                    m.remove_item(uid)
                    v["blind"] = 2
                    self.log("You sneeze glittering dust. The {} is blinded.".format(d["name"]), "me")
                elif u == "charm":
                    self.used.append("lute")
                    r = roll_d20(0)
                    b = m.mod("CHA") + m.prof()
                    dc = 10 + d["wis"]
                    ok = r["r"] + b >= dc
                    self.set_dice("Performance", r, b, dc, "DC", ok)
                    if ok:
                        v["charmed"] = 1
                        self.log("You play the lute with your tongue. The {} is charmed. Mostly confused.".format(d["name"]), "me")
                    else:
                        self.log("You play the lute with your tongue. It sounds exactly like that.")
            elif k == "dead":
                r = roll_d20(1 if m.tier == "wardrobe" else 0)
                mod = m.disguise_mod()
                pp = self.visitor_pp()
                ok = r["r"] + mod >= pp
                self.set_dice("Play Dead", r, mod, pp, "Passive Perception", ok)
                if ok:
                    self.play_dead = True
                    self.log("You go limp. The {} leans in to check... and touches you.".format(d["name"]), "good")
                    self.log("Adhesive: they are stuck to you.", "sys")
                    v["grappled"] = True
                    v["charmed"] = 1
                else:
                    self.log("You go limp. Nobody believes you.", "bad")
            elif k == "retreat":
                return self.retreat()
            if k in ("bite", "tongue", "weapon"):
                self.surprise = False
                self.play_dead = False
                self.mocked = 0
            if m.ess("aberration") and self.alive() and not v["swallowed"] and k in ("bite", "tongue", "weapon", "breath", "swallow"):
                self.hurt_visitor(dice_roll("1d8" if m.ess("aberration") == 2 else "1d4"), "Your second mouth")
            self.after_player()

        def after_player(self):
            if not self.alive():
                return self.win()
            if self.v["fled"] or self.phase != "combat":
                return
            self.enemy_turn()

        def try_flee_now(self):
            m, d, v = self.m, self.d(), self.v
            if self.phase != "combat":
                return True
            if m.tier == "barrel":
                r = roll_d20(0)
                mod = max(d["dex"], d["esc"])
                dc = m.escape_dc()
                caught = r["r"] + mod < dc
                self.set_dice("{}: escape".format(d["name"]), r, mod, dc, "you roll after them", caught, them=True)
                if caught:
                    self.log("The {} runs. You roll after them and cut them off.".format(d["name"]), "good")
                    return False
            self.log("The {} turns to run!".format(d["name"]), "bad")
            r = roll_d20(1 if m.ess("plant") >= 1 else 0)
            hit = r["r"] == 20 or (r["r"] != 1 and r["r"] + m.bite_hit() >= d["ac"])
            self.set_dice("Opportunity bite", r, m.bite_hit(), d["ac"], "AC", hit)
            if hit:
                dmg = dice_roll("1d8") + m.mod("STR") + m.bite_flat()
                if m.ess("monstrosity"):
                    dmg += dice_roll("2d6" if m.ess("monstrosity") == 2 else "1d6")
                self.hurt_visitor(max(1, dmg), "Opportunity bite")
            if not self.alive():
                self.win()
                return True
            if d["invis"]:
                self.log("The {} turns invisible and is gone.".format(d["name"]), "bad")
            v["fled"] = True
            self.finish("fled")
            return True

        def enemy_turn(self):
            m, v, d = self.m, self.v, self.d()
            if not self.alive() or self.phase != "combat":
                return
            self.turn += 1
            if v["swallowed"]:
                a = m.acid_roll() + [0, dice_roll("1d4"), dice_roll("1d8")][m.ess("undead")]
                if self.salted:
                    a = 0
                if a > 0:
                    self.hurt_visitor(a, "Your stomach acid")
                if not self.alive():
                    return self.win()
                total = sum(dice_roll(d["atk"][2]) for _i in range(d["multi"]))
                if self.braced:
                    total //= 2
                total = self.hurt_mimic(total, "The {} hacks at you from inside".format(d["name"]), d["atk"][3])
                if d["corrode"]:
                    self.hurt_mimic(dice_roll("1d6"), "The ooze digests you back", "acid")
                self.braced = False
                if total >= m.cut_threshold() and m.hp > 0:
                    v["swallowed"] = False
                    v["grappled"] = False
                    self.stun = 1
                    self.log("The {} cuts their way out! Your lid is jammed for a turn.".format(d["name"]), "bad")
                return self.end_enemy()
            if self.skip_enemy:
                self.skip_enemy -= 1
                self.log("The {} is still stuck to you, flailing.".format(d["name"]), "good")
                return self.end_enemy()
            if v["charmed"]:
                v["charmed"] -= 1
                self.log("The {} is too charmed to act.".format(d["name"]), "good")
                return self.end_enemy()
            if not v["grappled"] and v["hp"] <= v["max"] * 0.5 and cmv_rnd() < d["flee"]:
                if self.try_flee_now():
                    return
            if d["heal"] and not v["healed"] and v["hp"] <= v["max"] / 2.0:
                v["healed"] = True
                h = dice_roll(d["heal"])
                v["hp"] = min(v["max"], v["hp"] + h)
                self.log("The {} heals {}.".format(d["name"], h), "foe")
                return self.end_enemy()
            if v["grappled"] and cmv_rnd() < 0.5:
                r = roll_d20(0)
                mod = max(d["esc"], d["dex"])
                dc = m.escape_dc()
                freed = r["r"] + mod >= dc
                self.set_dice("{}: escape".format(d["name"]), r, mod, dc, "your escape DC", not freed, them=True)
                if freed:
                    v["grappled"] = False
                    self.log("The {} pulls free of your tongue.".format(d["name"]), "bad")
                    if d["flee"] >= 0.5 and cmv_rnd() < d["flee"]:
                        if self.try_flee_now():
                            return
                else:
                    self.log("The {} struggles, but you hold on.".format(d["name"]), "good")
                return self.end_enemy()
            for sp in d["specials"]:
                if sp.get("once") and sp["n"] in v["spec_used"]:
                    continue
                if cmv_rnd() < sp["chance"]:
                    v["spec_used"].append(sp["n"])
                    self.do_special(sp)
                    return self.end_enemy()
            for _i in range(d["multi"]):
                if m.hp > 0:
                    self.enemy_attack()
            self.end_enemy()

        def enemy_attack(self):
            m, v, d = self.m, self.v, self.d()
            r = roll_d20(-1 if v["blind"] else 0)
            my_ac = m.ac()
            crit = r["r"] == 20
            hit = crit or (r["r"] != 1 and r["r"] + d["atk"][1] >= my_ac)
            self.set_dice("{}: {}".format(d["name"], d["atk"][0]), r, d["atk"][1], my_ac, "your AC", not hit, crit=crit, them=True)
            if not hit:
                self.log("The {}'s {} bounces off your lid.".format(d["name"], d["atk"][0].lower()), "good")
                return
            self.hurt_mimic(dice_roll(d["atk"][2], crit), "{}The {}'s {}".format("CRITICAL! " if crit else "", d["name"], d["atk"][0].lower()), d["atk"][3])
            if d["corrode"] and cmv_rnd() < 0.25:
                for c in m.items:
                    it = ITEMS[c["id"]]
                    if "metal" in it["tags"] and not it.get("attune"):
                        self.log("The ooze's acid eats your {}.".format(it["name"]), "bad")
                        m.remove_item(c["uid"])
                        break

        def do_special(self, sp):
            m, d = self.m, self.d()
            if sp.get("effect") == "dark":
                self.dark = 2
                self.log("The {} fills the room with magical darkness. Your attacks have disadvantage.".format(d["name"]), "foe")
                return
            r = roll_d20(0)
            sb = m.save_bonus(sp["save"])
            saved = r["r"] + sb >= sp["dc"]
            self.set_dice("{}: your {} save".format(sp["n"], sp["save"]), r, sb, sp["dc"], "DC", saved)
            dmg = dice_roll(sp["dmg"]) if sp.get("dmg") and sp["dmg"] != "0" else 0
            if saved:
                dmg = dmg // 2 if sp.get("half") else 0
            if dmg:
                self.hurt_mimic(dmg, sp["n"], sp.get("kind"))
            if saved:
                self.log("You resist the {}.".format(sp["n"]), "good")
                return
            eff = sp.get("effect")
            if eff == "salt":
                self.salted = 2
                self.log("Salted. Your acid stops working for 2 turns. Some salt got inside you.", "bad")
                m.add_item("salt", quiet=True)
            elif eff == "mock":
                self.mocked = 1
                self.log("The {} insults your craftsmanship. Your next attack has disadvantage.".format(d["name"]), "foe")
            elif eff == "poison":
                if not m.feat("ironstomach"):
                    self.poisoned = 2
                    self.log("You are poisoned: -2 to hit for 2 turns.", "foe")
            elif eff == "stuck":
                self.stun = 1
                self.log("Its lid clamps onto yours. You lose your next turn prying free.", "foe")

        def end_enemy(self):
            m, v = self.m, self.v
            if m.hp <= 0:
                return self.death_saves()
            if v["blind"]:
                v["blind"] -= 1
            for k in ("dark", "poisoned", "salted"):
                if getattr(self, k):
                    setattr(self, k, getattr(self, k) - 1)
            if self.stun:
                self.stun -= 1
                self.log("Your lid is jammed. You lose your turn.", "bad")
                return self.enemy_turn()
            if not v["swallowed"]:
                self.braced = False
            self.breath_ready = self.breath_ready or die(6) >= 5
            cel = m.ess("celestial")
            if cel:
                m.hp = min(m.max_hp(), m.hp + dice_roll("1d8" if cel == 2 else "1d4"))
            if m.active_has("halo"):
                m.hp = min(m.max_hp(), m.hp + 1)

        def death_saves(self):
            m, d = self.m, self.d()
            m.hp = 0
            self.phase = "dying"
            m.mouth = "closed"
            self.log("Your lid slams shut. You are at 0 HP. Death saving throws.", "bad")
            s = f = 0
            rolls = []
            nat20 = False
            while s < 3 and f < 3:
                r = die(20)
                rolls.append(r)
                if r == 20:
                    nat20 = True
                    break
                if r == 1:
                    f += 2
                elif r >= 10:
                    s += 1
                else:
                    f += 1
            self.death_rolls = rolls
            self.log("Death saves: {}.".format(", ".join(str(x) for x in rolls)), "sys")
            if nat20:
                m.hp = 1
                self.phase = "combat"
                m.mouth = "open"
                self.surprise = True
                self.v["swallowed"] = False
                self.v["grappled"] = True
                self.log("Natural 20. You are not dead. They are holding your lid open to look inside.", "title")
                return
            if d["boss"] or d["rival"]:
                # Story fights don't take your things: you get to try again.
                self.result = "lost"
                self.phase = "done"
                return
            if s >= 3:
                m.hp = 1
                m.award("whats_in")
                takeable = [c for c in m.items if c["uid"] not in m.attuned and not (ITEMS[c["id"]].get("cursed") and m.cursed_on())]
                if takeable:
                    c = pick(takeable)
                    m.remove_item(c["uid"])
                    self.log("The {} decides you're just a broken chest and takes your {}.".format(d["name"], ITEMS[c["id"]]["name"]), "bad")
                else:
                    self.log("The {} decides you're just a broken chest and leaves.".format(d["name"]), "bad")
                m.add_notoriety(3)
                return self.finish("stable")
            self.result = "shattered"
            self.phase = "done"

        def shatter(self):
            """Apply the full penalty for shattering (only if the player chooses not to retry)."""
            m = self.m
            m.deaths += 1
            m.award("splinters")
            m.items = [c for c in m.items if c["uid"] in m.attuned or (ITEMS[c["id"]].get("cursed") and m.cursed_on())]
            m.bait = None
            m.belly = 1
            m.notoriety = 0
            m.cracked = 3
            m.hp = m.max_hp()
            m.xp = XP_AT[m.lvl]
            m.mouth = "closed"
            m.sysmsg("You shatter. Splinters everywhere. Some time later, they pull themselves back together.", "bad")
            m.sysmsg("You lost everything you weren't attuned to. Cracked Lid: -2 AC for 3 fights. Your progress toward the next level is gone.", "bad")

        def win(self):
            m, d, v = self.m, self.d(), self.v
            inside = v["swallowed"]
            if inside:
                self.log("{} has been digested. {}".format(d["name"], d["eat"]), "title")
            else:
                self.log("{} is defeated. You eat what you can. {}".format(d["name"], d["eat"]), "title")
            m.gain_xp(d["xp"])
            sz = SIZES[d["size"]]
            m.add_essence(d["type"], 2 if inside else 1)
            if inside:
                gain = sz["belly"]
            elif m.can_swallow_size(SIZE_BY_N[max(0, sz["n"] - 1)]):
                gain = max(1, sz["belly"] - 1)
            else:
                gain = 1
            m.belly += gain
            if m.belly >= m.belly_cap() and not m.was_gorged:
                m.was_gorged = True
                m.gorged_count += 1
                self.log("Gorged. You are too full to swallow anything else. Stealth disguises -3.", "bad")
                if m.gorged_count >= 3:
                    m.award("gourmand")
            mult = REGIONS[m.region].get("loot", 1)
            got = []
            for iid, ch in d["loot"]:
                if cmv_rnd() < min(1.0 if ch >= 1 else 0.95, ch * mult):
                    if m.companion == "partner" and "gold" in ITEMS[iid]["tags"]:
                        m.loot_cut += 1
                        if m.loot_cut % 3 == 0:
                            self.log("Wren takes her cut: {}.".format(ITEMS[iid]["name"]))
                            continue
                    if m.add_item(iid):
                        got.append(iid)
            R = REGIONS[m.region]
            if R.get("special") and cmv_rnd() < 0.15:
                sp = pick(R["special"])
                if m.add_item(sp):
                    got.append(sp)
                    self.log("Local find: {}. {} is known for these.".format(ITEMS[sp]["name"], R["name"]), "level")
            self.loot = got
            if got:
                self.log("Inside you now: {}.".format(", ".join(ITEMS[i]["name"] for i in got)), "good")
            m.kills[d["id"]] = m.kills.get(d["id"], 0) + 1
            m.eaten += 1
            m.award("first_bite")
            if m.eaten >= 15:
                m.award("box_office")
            if d["id"] == "bard":
                m.award("off_key")
            if d["type"] == "celestial":
                m.award("angel_food")
            if d["id"] == "knight" and inside:
                m.award("heavy_metal")
            if d["rival"]:
                m.award("cannibal")
            if d["boss"]:
                m.award("hunter_hunted")
                m.add_notoriety(-20)
            elif d["type"] == "humanoid":
                if m.companion == "reformer":
                    m.add_notoriety(6)
                    self.log("Wren looks at you for a long time. She does not say anything.")
                else:
                    m.add_notoriety(3)
            if m.cracked > 0:
                m.cracked -= 1
            self.finish("digested" if inside else "eaten")

        def finish(self, result):
            m, d = self.m, self.d()
            self.phase = "done"
            self.result = result
            m.mouth = "closed"
            if result == "fled":
                m.fled += 1
                m.add_notoriety((6 if d["type"] == "humanoid" else 2) + (3 if d["xp"] >= 400 else 0))
                b = m.bait_item()
                if b and cmv_rnd() < 0.3:
                    m.remove_item(b["uid"])
                    self.log("They grabbed your bait on the way out: {}.".format(ITEMS[b["id"]]["name"]), "bad")
            m.unlock_regions()

        def retreat(self):
            d = self.d()
            if self.phase != "combat" or self.v["swallowed"]:
                return
            self.log("You slam your lid shut and refuse to open. The {} gives up and leaves, telling everyone about the box that bit.".format(d["name"]), "bad")
            self.finish("retreat")
            self.m.add_notoriety(4 if d["type"] == "humanoid" else 2)

        def missed_leave(self):
            self.log("You hold still. The {} shrugs and wanders off, keeping an eye on you.".format(self.name()))
            self.m.add_notoriety(1)
            self.finish("missed")


    # ---------- Text helpers for the story scripts ----------
    MSG_COLOR = {"good": "#9be89b", "bad": "#ff8f8f", "me": "#ffd98a", "foe": "#ffb3c1", "": "#ffffff"}
    SYS_CLASSES = ("sys", "level", "title")

    def cmv_take_msgs(m, limit=4):
        """Pop the next block of messages: either one System line, or up to `limit` story lines.
        Returns (is_system, text)."""
        if not m.msgs:
            return None, ""
        cls, text = m.msgs[0]
        if cls in SYS_CLASSES:
            m.msgs.pop(0)
            return True, text
        lines = []
        while m.msgs and m.msgs[0][0] not in SYS_CLASSES and len(lines) < limit:
            cls, text = m.msgs.pop(0)
            lines.append("{{color={}}}{}{{/color}}".format(MSG_COLOR.get(cls, "#ffffff"), text))
        return False, "\n".join(lines)

    def cmv_dice_line(dd):
        if not dd:
            return ""
        if dd["mode"] and dd["b"] is not None:
            roll = "{} ({} {} and {})".format(dd["r"], "best of" if dd["mode"] > 0 else "worst of", dd["a"], dd["b"])
        else:
            roll = str(dd["r"])
        return "{} {} = {} vs {} {}".format(roll, sgn(dd["mod"]), dd["total"], dd["vs_label"], dd["vs"])

    def cmv_clean_name(s):
        s = "".join(ch for ch in (s or "") if ch.isalnum() or ch in " '-.")
        s = s.strip()[:16]
        return s or "Lid"
