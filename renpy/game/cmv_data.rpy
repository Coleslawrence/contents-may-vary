## Contents May Vary — data tables.
## Adapted from the web game's engine.js. Numbers are tuned for a story-paced
## game: fewer, bigger fights instead of hours of idle catching.

init -20 python:

    def cpx(n):
        """Scale a size designed for a 720-pixel-tall screen to the real screen.
        Phones get things a little bigger so they stay readable."""
        f = config.screen_height / 720.0
        if renpy.variant("small"):
            f *= 1.2
        return int(round(n * f))

    # ---------- Core tables ----------
    ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
    ABIL_NAME = {"STR": "Strength", "DEX": "Dexterity", "CON": "Constitution",
                 "INT": "Intelligence", "WIS": "Wisdom", "CHA": "Charisma"}
    ABIL_USE = {"STR": "Bite, grapple, swallow", "DEX": "Stealth disguises, initiative",
                "CON": "Hit points, belly, acid", "INT": "Spotting fakes",
                "WIS": "Reading visitors", "CHA": "Deception disguises, lures"}

    SIZES = {"T": {"n": 0, "name": "Tiny", "belly": 1}, "S": {"n": 1, "name": "Small", "belly": 2},
             "M": {"n": 2, "name": "Medium", "belly": 4}, "L": {"n": 3, "name": "Large", "belly": 8}}
    SIZE_BY_N = ["T", "S", "M", "L"]

    CR_XP = {"0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700}
    XP_MULT = 2
    XP_AT = [0, 0, 60, 200, 450, 800, 1250, 1800, 2500, 3400, 4500]
    MAX_LVL = 10
    ASI_LVLS = [4, 8]

    TYPES = ["beast", "humanoid", "undead", "fiend", "celestial", "construct", "dragon", "fey",
             "elemental", "giant", "ooze", "plant", "aberration", "monstrosity"]
    TYPE_NAME = {t: t.capitalize() for t in TYPES}
    SPEAKERS = ["humanoid", "fiend", "celestial", "dragon", "fey"]
    ESS_AT = [2, 5]

    ESSENCE = {
        "beast": ("Feral Bite", "+1 bite damage and +1 initiative.", "+2 bite damage and +2 initiative."),
        "humanoid": ("Learned Tongue", "You can Sweet Talk visitors who speak (+3 to the lure).", "Sweet Talk gives +5, and your Charisma rises by 2."),
        "undead": ("Grave Gut", "Swallowed visitors take an extra 1d4 necrotic each turn.", "Swallowed visitors take an extra 1d8 necrotic each turn. You learn the Coffin form."),
        "fiend": ("Hellfire Belly", "You can breathe fire: 2d6, Dexterity save for half, recharge 5-6.", "Your fire breath deals 3d6."),
        "celestial": ("Blessed Hinges", "Heal 1d4 at the start of each of your turns in a fight.", "Heal 1d8 at the start of each of your turns in a fight."),
        "construct": ("Clockwork Jaw", "+1 AC, and your bite crits on 19-20.", "+2 AC, and your bite crits on 18-20."),
        "dragon": ("Hoard Sense", "Gold bait is +1.", "Gold bait is +2."),
        "fey": ("Glamour Lid", "+2 to every disguise.", "Advantage on every lure."),
        "elemental": ("Elemental Core", "You take half damage from fire.", "Half damage from fire and acid, and your bite deals +1d4 fire."),
        "giant": ("Colossal Lid", "+5 max HP and +2 belly.", "+12 max HP and +4 belly."),
        "ooze": ("Acid Lining", "Your acid deals +1d6, and you digest items faster.", "Your acid deals +2d6, and you digest items much faster."),
        "plant": ("Root Tongue", "+2 to Tongue Lash, and advantage on bites against visitors who flee.", "+4 to Tongue Lash, and +2 to your escape DC."),
        "aberration": ("Many-Mouthed", "A second mouth bites for 1d4 every turn.", "The second mouth bites for 1d8."),
        "monstrosity": ("Apex Predator", "Your bites deal +1d6 to visitors below half HP.", "Your bites deal +2d6 to visitors below half HP."),
    }

    # ---------- Evolution ----------
    TIERS = {
        "lesser": {"name": "Lesser Mimic", "size": "S", "swallow": 0, "slots": 9, "ac": 12, "acid": 1, "belly": 0,
                   "desc": "A small, hungry box. You can swallow Tiny creatures."},
        "chest": {"name": "Chest Mimic", "size": "M", "swallow": 1, "slots": 16, "ac": 13, "acid": 2, "belly": 2,
                  "desc": "A proper chest. You can swallow Small creatures, and you learn the Barrel form."},
        "vault": {"name": "Vault Mimic", "size": "L", "swallow": 2, "slots": 20, "ac": 16, "acid": 3, "belly": 4,
                  "desc": "Armoured and patient. AC 16, +2 HP per level, and your grip is +3 harder to escape."},
        "wardrobe": {"name": "Wardrobe Mimic", "size": "L", "swallow": 2, "slots": 20, "ac": 14, "acid": 3, "belly": 4,
                     "desc": "A shapeshifter. +2 to every disguise, Play Dead has advantage, and you learn the Wardrobe and Coffin forms."},
        "doorway": {"name": "Doorway Mimic", "size": "L", "swallow": 2, "slots": 20, "ac": 14, "acid": 3, "belly": 4,
                    "desc": "A door that goes one way. Once per fight, swallow without grappling first. You learn the Door form, and travel is free."},
        "barrel": {"name": "Barrel Mimic", "size": "L", "swallow": 2, "slots": 20, "ac": 14, "acid": 3, "belly": 4,
                   "desc": "A chaser. Bite twice per action, and visitors who run must get past you first."},
    }
    BRANCHES = ["vault", "wardrobe", "doorway", "barrel"]

    # ---------- Forms (disguises) ----------
    FORMS = {
        "chest": {"name": "Treasure Chest", "skill": "Deception", "bonus": 2, "attract": ["gold"], "note": "Everybody loves a large chest. Thieves look closer."},
        "barrel": {"name": "Barrel", "skill": "Stealth", "bonus": 2, "attract": ["food", "rest"], "note": "Nobody suspects a barrel. Nobody."},
        "bookshelf": {"name": "Bookshelf", "skill": "Deception", "bonus": 3, "attract": ["knowledge", "magic"], "note": "Scholars reach in. Scholars do not reach out."},
        "door": {"name": "Door", "skill": "Stealth", "bonus": 4, "attract": ["travel", "curiosity"], "note": "Everyone has to go through a door eventually."},
        "wardrobe": {"name": "Wardrobe", "skill": "Deception", "bonus": 3, "attract": ["curiosity", "rest"], "note": "Step inside. There is definitely another world in here."},
        "coffin": {"name": "Coffin", "skill": "Stealth", "bonus": 3, "attract": ["holy", "gold"], "note": "Grave robbers, priests and necromancers all want to look inside."},
    }
    WANTS = {"gold": "treasure", "magic": "magic", "knowledge": "knowledge", "food": "food", "rest": "rest",
             "holy": "holy things", "travel": "a way through", "curiosity": "curiosity"}
    TAG_WANT = {"gold": "gold", "dragon": "gold", "arcane": "magic", "paper": "knowledge", "food": "food",
                "holy": "holy", "music": "curiosity", "cloth": "rest", "blade": "gold", "potion": "magic"}

    # ---------- Items ----------
    DIGEST_WAITS = {"common": 1, "uncommon": 2, "rare": 3}
    ITEMS = {
        "copper": {"name": "Copper Coins", "tags": ["gold"], "r": "common", "fuse": "silver", "bait": 1, "desc": "Bait +1 for anyone who wants treasure."},
        "silver": {"name": "Silver Hoard", "tags": ["gold"], "r": "uncommon", "fuse": "goldhoard", "bait": 2, "desc": "Bait +2 for anyone who wants treasure."},
        "goldhoard": {"name": "Gold Hoard", "tags": ["gold", "dragon"], "r": "rare", "bait": 4, "desc": "Bait +4. Dragons can smell it from three floors away."},
        "gold_ring": {"name": "Gold Ring", "tags": ["gold"], "r": "uncommon", "bait": 2, "desc": "Bait +2. Shiny, small, irresistible."},
        "rusty_dagger": {"name": "Rusty Dagger", "tags": ["blade", "metal"], "r": "common", "weapon": "1d4", "fuse": "gut_blade", "desc": "Tongue-wield it: 1d4, +1 for each other blade inside you."},
        "gut_blade": {"name": "Gut-Forged Blade", "tags": ["blade", "metal"], "r": "uncommon", "weapon": "1d10", "desc": "Three daggers, one blade, forged by acid. 1d10."},
        "shortsword": {"name": "Shortsword", "tags": ["blade", "metal"], "r": "common", "weapon": "1d6", "desc": "Tongue-wield it: 1d6, +1 for each other blade inside you."},
        "longsword": {"name": "Longsword", "tags": ["blade", "metal"], "r": "common", "weapon": "1d8", "desc": "Tongue-wield it: 1d8, +1 for each other blade inside you."},
        "big_club": {"name": "Ogre Club", "tags": ["blunt"], "r": "common", "weapon": "2d4", "hit": -1, "desc": "Too big for you. You use it anyway. 2d4, -1 to hit."},
        "mimic_tooth": {"name": "Rival Mimic Tooth", "tags": ["blade", "monstrosity"], "r": "rare", "weapon": "1d12", "desc": "A tooth from your own kind. 1d12."},
        "hesk_crowbar": {"name": "Hesk's Crowbar", "tags": ["blunt", "metal"], "r": "rare", "attune": True, "weapon": "1d8+2", "hit": 2, "guard": 3, "desc": "Attuned: tongue-wield for 1d8+2 at +2, and investigators lose their advantage on you."},
        "leather": {"name": "Leather Armour", "tags": ["armor", "cloth"], "r": "common", "ac": 1, "desc": "+1 AC. You wear it on the inside."},
        "knight_plate": {"name": "Knight's Plate", "tags": ["armor", "metal"], "r": "uncommon", "ac": 3, "clank": 2, "desc": "+3 AC, but -2 to Stealth disguises. You clank."},
        "bone": {"name": "Bone", "tags": ["bone"], "r": "common", "fuse": "bone_cage", "desc": "+1 AC for each pair of bones inside you (up to +3)."},
        "bone_cage": {"name": "Bone Cage", "tags": ["bone", "armor"], "r": "uncommon", "ac": 2, "desc": "+2 AC. A ribcage inside a box."},
        "rope": {"name": "Rope", "tags": ["tool"], "r": "common", "grip": 2, "desc": "+2 to the DC to escape your grapple."},
        "lockpicks": {"name": "Lockpicks", "tags": ["tool"], "r": "common", "guard": 3, "desc": "+3 against Investigation. You know how they pick."},
        "map_scrap": {"name": "Map Scrap", "tags": ["paper"], "r": "common", "fuse": "treasure_map", "desc": "Part of a map. Three of them might make a whole one."},
        "treasure_map": {"name": "Treasure Map", "tags": ["paper"], "r": "uncommon", "unlock": "vault", "desc": "Shows the way to the Hidden Vault."},
        "bread": {"name": "Stale Bread", "tags": ["food"], "r": "common", "use": "eat", "belly": 1, "desc": "Eat it: +1 belly."},
        "glowcap": {"name": "Glowcap", "tags": ["food", "arcane"], "r": "common", "use": "eat", "belly": 1, "heal": "1d4", "desc": "Eat it: +1 belly and heal 1d4."},
        "healing_potion": {"name": "Potion of Healing", "tags": ["potion"], "r": "common", "use": "heal", "heal": "2d4+2", "desc": "Drink it in a fight: heal 2d4+2."},
        "spellbook": {"name": "Spellbook", "tags": ["paper", "arcane"], "r": "common", "desc": "Fire breath +1d6 while you carry an Ember Wand. Digest it to learn the Bookshelf form."},
        "ember_wand": {"name": "Ember Wand", "tags": ["arcane", "fire"], "r": "uncommon", "attune": True, "desc": "Attuned: breathe fire for 2d6 (Dexterity save for half, recharge 5-6)."},
        "ember_core": {"name": "Ember Core", "tags": ["fire", "elemental"], "r": "common", "desc": "Fire breath +1d4 while you carry an Ember Wand."},
        "holy_symbol": {"name": "Holy Symbol", "tags": ["holy"], "r": "common", "desc": "Bites deal +1d4 radiant to undead and fiends."},
        "halo": {"name": "Cherub's Halo", "tags": ["holy"], "r": "uncommon", "attune": True, "desc": "Attuned: +1 to saving throws and heal 1 at the start of each of your turns."},
        "lute": {"name": "Lute", "tags": ["music"], "r": "common", "use": "charm", "desc": "Play it in a fight (once): a Charisma check to charm the visitor for a turn."},
        "pixie_dust": {"name": "Pixie Dust", "tags": ["arcane"], "r": "common", "use": "blind", "desc": "Sneeze it in a fight: the visitor is blinded for 2 turns."},
        "gear": {"name": "Clockwork Gear", "tags": ["tool", "construct"], "r": "common", "init": 1, "fuse": "clockwork_jaw", "desc": "+1 initiative. Ticks."},
        "clockwork_jaw": {"name": "Clockwork Jaw", "tags": ["construct", "metal"], "r": "uncommon", "extra_bite": "1d4", "desc": "Your bites deal +1d4."},
        "dragon_scale": {"name": "Dragon Scale", "tags": ["dragon", "armor"], "r": "uncommon", "ac": 1, "fire_res": True, "desc": "+1 AC and half damage from fire."},
        "contract": {"name": "Infernal Contract", "tags": ["arcane", "cursed"], "r": "uncommon", "cursed": True, "desc": "+2 Strength, -1 Charisma. You have no hands. It still counts. Cursed: digest it to get rid of it."},
        "bag": {"name": "Bag of Holding", "tags": ["cloth", "arcane"], "r": "rare", "rows": 1, "no_digest": True, "desc": "Your stomach gains five slots. You are now bigger on the inside."},
        "ring_prot": {"name": "Ring of Protection", "tags": ["gold", "arcane"], "r": "rare", "attune": True, "ac": 1, "saves": 1, "desc": "Attuned: +1 AC and +1 to saving throws."},
        "cloak": {"name": "Cloak of Elvenkind", "tags": ["cloth", "arcane"], "r": "uncommon", "attune": True, "stealth": 3, "desc": "Attuned: +3 to Stealth disguises."},
        "salt": {"name": "Hunter's Salt", "tags": ["junk", "cursed"], "r": "common", "cursed": True, "salt": True, "desc": "Your acid deals -1d6 while this is inside you. Cursed: digest it."},
        "wet_sock": {"name": "Wet Sock", "tags": ["junk"], "r": "common", "desc": "It does nothing. It has always done nothing."},
    }

    DIGEST_TAGS = {
        "blade": ("Serrated Teeth", "+1 bite damage", 3),
        "armor": ("Thick Lid", "+1 AC", 2),
        "bone": ("Calcified Hinges", "+1 AC", 1),
        "gold": ("Gilded", "+1 to Deception disguises", 2),
        "arcane": ("Arcane Lining", "+1 breath damage and save DC", 2),
        "holy": ("Sanctified", "+1 to saving throws", 2),
        "food": ("Stretchy Gut", "+2 belly", 2),
        "tool": ("Strong Grip", "+1 to your escape DC", 2),
        "paper": ("Well Read", "+1 to Insight", 2),
        "fire": ("Ember Gut", "+1 fire damage on bites", 2),
        "music": ("Hums Along", "+1 to Deception disguises", 1),
        "metal": ("Iron Stomach", "+1 acid damage", 2),
        "cloth": ("Soft Lining", "+3 max HP", 2),
        "potion": ("Alchemical Gut", "healing items heal +2", 1),
    }

    # ---------- Visitors ----------
    VISITORS = {}

    def _visitor(vid, name, vtype, size, cr, **o):
        d = {"id": vid, "name": name, "type": vtype, "size": size, "cr": cr, "xp": CR_XP[cr] * XP_MULT,
             "dex": 0, "esc": 0, "wis": 0, "multi": 1, "flee": 0.3, "loot": [], "wants": [], "inv": None,
             "specials": [], "aggressive": False, "boss": False, "rival": False, "chest_adv": False,
             "always_adv": False, "invis": False, "corrode": False, "heal": None}
        d.update(o)
        VISITORS[vid] = d

    _visitor("rat", "Cave Rat", "beast", "T", "0", ac=10, hp=3, atk=("Nibble", 2, "1d2", None), pp=10, wants=["food"], flee=0.6,
             line="A rat sniffs at your keyhole.", eat="Crunchy. Mostly tail.")
    _visitor("goblin", "Goblin Scavenger", "humanoid", "S", "1/4", ac=13, hp=7, atk=("Shiv", 4, "1d6+2", None), pp=9, dex=2, esc=2,
             wants=["gold", "food"], loot=[("rusty_dagger", .5), ("copper", .5), ("bread", .3)],
             line="A goblin is muttering about \"finders keepers\".", eat="Finders keepers.")
    _visitor("kobold", "Kobold Trapper", "humanoid", "S", "1/8", ac=12, hp=5, atk=("Dagger", 4, "1d4+2", None), pp=8, inv=3, dex=2,
             wants=["gold"], loot=[("rope", .35), ("copper", .4), ("map_scrap", .5), ("rusty_dagger", .2)],
             line="A kobold taps the floor ahead with a stick. It knows traps.", eat="It knew traps. It did not know you.")
    _visitor("sprout", "Mushroom Sprout", "plant", "S", "0", ac=10, hp=4, atk=("Bonk", 1, "1d4", None), pp=8, wants=["rest"], flee=0.2,
             loot=[("glowcap", .7)], line="A mushroom waddles in, looking for somewhere damp to sit.", eat="Earthy. A little spongy.")
    _visitor("recruit", "Hopeful Recruit", "humanoid", "M", "1/4", ac=12, hp=9, atk=("Training Sword", 3, "1d6+1", None), pp=10, dex=1, esc=1,
             wants=["gold", "magic", "travel"], loot=[("shortsword", .3), ("healing_potion", .4), ("copper", .5), ("wet_sock", .15)],
             line="A fresh recruit is trying to reach Level 5. They look at you with hope.", eat="They did not reach Level 5.")
    _visitor("pixie", "Pixie", "fey", "T", "1/4", ac=15, hp=3, atk=("Pinch", 4, "1d2", None), pp=14, dex=4, esc=4,
             wants=["magic", "curiosity"], flee=0.8, loot=[("pixie_dust", .7)],
             line="A pixie flits around you, giggling.", eat="Fizzy. Your teeth sparkle now.")
    _visitor("eye", "Floating Eye", "aberration", "T", "1/8", ac=12, hp=5, atk=("Stare", 2, "1d4", None), pp=15, wants=["curiosity"], flee=0.4,
             line="Something that is mostly eye floats in.", eat="It watched the whole time.")
    _visitor("bandit", "Bandit", "humanoid", "M", "1/8", ac=12, hp=11, atk=("Scimitar", 3, "1d6+1", None), pp=10, dex=1, esc=1,
             wants=["gold"], loot=[("shortsword", .3), ("copper", .6), ("leather", .3), ("rusty_dagger", .3)],
             line="A bandit is counting what is left of their share.", eat="You took their share.")
    _visitor("skeleton", "Skeleton", "undead", "M", "1/4", ac=13, hp=13, atk=("Rusty Blade", 4, "1d6+2", None), pp=9, dex=2,
             wants=["gold"], flee=0, loot=[("bone", .8), ("bone", .4), ("shortsword", .25)],
             line="A skeleton rattles past. Old habits: it checks every chest.", eat="Calcium.")
    _visitor("thief", "Halfling Thief", "humanoid", "S", "1/2", ac=14, hp=13, atk=("Short Blade", 4, "1d6+2", None), pp=13, inv=5,
             chest_adv=True, dex=4, esc=3, wants=["gold", "magic"], flee=0.4,
             loot=[("lockpicks", .4), ("copper", .6), ("gold_ring", .25), ("cloak", .15), ("map_scrap", .4)],
             line="A halfling thief cracks their knuckles. Chests are their speciality.", eat="Professional hazard.")
    _visitor("apprentice", "Apprentice Wizard", "humanoid", "M", "1/4", ac=11, hp=9, atk=("Fire Bolt", 4, "1d10", "fire"), pp=10, inv=4,
             wants=["knowledge", "magic"], loot=[("spellbook", .6), ("ember_wand", .25), ("pixie_dust", .2), ("glowcap", .2)],
             line="An apprentice wizard is looking for \"primary sources\".", eat="You absorbed some primary sources.")
    _visitor("acolyte", "Acolyte", "humanoid", "M", "1/4", ac=10, hp=9, atk=("Mace", 2, "1d6", None), pp=12, wis=2,
             wants=["holy", "rest"], heal="1d8+2",
             specials=[{"n": "Sacred Flame", "chance": .5, "save": "DEX", "dc": 12, "dmg": "1d8", "kind": "radiant"}],
             loot=[("holy_symbol", .5), ("healing_potion", .5), ("bread", .3)],
             line="An acolyte murmurs a prayer for anyone lost down here.", eat="The prayer went unanswered.")
    _visitor("imp", "Imp", "fiend", "T", "1", ac=13, hp=10, atk=("Sting", 5, "1d4+3", None), pp=11, dex=3, esc=3,
             wants=["magic", "curiosity"], flee=0.5, invis=True, loot=[("contract", .35), ("ember_core", .3)],
             line="An imp lounges on the air, looking for a soul to bargain with.", eat="Spicy. Something just signed you up for a newsletter.")
    _visitor("darkmantle", "Darkmantle", "monstrosity", "S", "1/2", ac=11, hp=22, atk=("Crush", 5, "1d6+3", None), pp=10, dex=1, esc=3,
             wants=["food"], aggressive=True, flee=0.2, specials=[{"n": "Darkness", "chance": .3, "once": True, "effect": "dark"}],
             loot=[("bone", .3)], line="A darkmantle hangs from the ceiling. Another ambush predator. Awkward.",
             eat="Professional courtesy, briefly considered.")
    _visitor("ooze", "Gray Ooze", "ooze", "M", "1/2", ac=8, hp=22, atk=("Pseudopod", 3, "2d6+1", "acid"), pp=8, dex=-2, esc=1,
             wants=["food"], aggressive=True, flee=0, corrode=True, loot=[("wet_sock", .1)],
             line="A gray ooze slides along the floor, dissolving the grout.", eat="Eating a stomach is a strange experience.")
    _visitor("pseudo", "Pseudodragon", "dragon", "T", "1/4", ac=13, hp=7, atk=("Bite", 4, "1d4+2", None), pp=13, dex=2, esc=2,
             wants=["gold"], flee=0.5, specials=[{"n": "Sting", "chance": .35, "save": "CON", "dc": 11, "dmg": "0", "effect": "poison"}],
             loot=[("dragon_scale", .35), ("copper", .4)], line="A pseudodragon circles you. It can smell treasure.",
             eat="Tastes like a very small dragon.")
    _visitor("clockwork", "Clockwork Scout", "construct", "S", "1/4", ac=14, hp=10, atk=("Spring Blade", 4, "1d6+2", None), pp=12, dex=2, esc=1,
             wants=["knowledge"], flee=0, loot=[("gear", .7), ("gear", .3)],
             line="A clockwork scout is mapping the dungeon, one tick at a time.", eat="Crunchy. Your stomach now ticks.")
    _visitor("cherub", "Lost Cherub", "celestial", "T", "1/2", ac=13, hp=9, atk=("Radiant Touch", 4, "1d6+2", "radiant"), pp=13, dex=3, esc=2, wis=3,
             wants=["holy"], flee=0.5, loot=[("halo", .4), ("holy_symbol", .3)],
             line="A small, chubby angel is very lost.", eat="Angel food.")
    _visitor("mephit", "Magma Mephit", "elemental", "S", "1/2", ac=11, hp=22, atk=("Claws", 3, "1d4+1", "fire"), pp=10, dex=1, esc=1,
             wants=["magic"], specials=[{"n": "Fire Breath", "chance": .3, "save": "DEX", "dc": 11, "dmg": "2d6", "kind": "fire", "half": True}],
             loot=[("ember_core", .6)], line="A magma mephit drips across the floor, humming.", eat="Hot. Very hot. Worth it.")
    _visitor("ogre", "Ogre", "giant", "L", "2", ac=11, hp=59, atk=("Greatclub", 6, "2d8+4", None), pp=8, dex=-1, esc=4,
             wants=["food"], aggressive=True, flee=0.15,
             loot=[("big_club", .6), ("copper", .6), ("copper", .6), ("bone", .5), ("bread", .5)],
             line="An ogre is looking for a snack. So are you.", eat="Far too big. That has never stopped you.")
    _visitor("knight", "Knight", "humanoid", "M", "3", ac=17, hp=40, atk=("Greatsword", 5, "2d6+1", None), multi=2, pp=10, esc=3, wis=2,
             wants=["holy", "gold", "travel"], flee=0.1,
             loot=[("knight_plate", .5), ("longsword", .6), ("ring_prot", .2), ("healing_potion", .5)],
             line="A knight in full plate is checking the corners. Thoroughly.", eat="Heavy metal.")
    _visitor("wolf", "Wolf", "beast", "M", "1/4", ac=13, hp=11, atk=("Bite", 4, "2d4+2", None), pp=13, dex=2, esc=2,
             wants=["food"], aggressive=True, flee=0.3, loot=[("bone", .3)],
             line="A wolf has your scent. You do not have a scent. It has it anyway.", eat="Who is the big bad now.")
    _visitor("merchant", "Travelling Merchant", "humanoid", "M", "0", ac=10, hp=6, atk=("Walking Stick", 2, "1d4", None), pp=11, inv=2,
             wants=["gold", "travel"], flee=0.7,
             loot=[("copper", .8), ("copper", .5), ("gold_ring", .3), ("bag", .12), ("bread", .4), ("map_scrap", .4)],
             line="A merchant is looking for somewhere to store their stock.", eat="No refunds.")
    _visitor("bard", "Wandering Bard", "humanoid", "M", "1/4", ac=12, hp=14, atk=("Rapier", 4, "1d8+2", None), pp=11, dex=2, esc=2, wis=1,
             wants=["curiosity", "rest"],
             specials=[{"n": "Vicious Mockery", "chance": .4, "save": "WIS", "dc": 12, "dmg": "1d4", "kind": "psychic", "effect": "mock"}],
             loot=[("lute", .6), ("copper", .5)], line="A bard is composing a ballad about a chest. Coincidence.",
             eat="The song, unfortunately, remains.")
    _visitor("hesk", "Sister Hesk", "humanoid", "M", "3", ac=14, hp=34, atk=("Crowbar", 5, "1d8+2", None), multi=2, pp=14, inv=5,
             always_adv=True, dex=2, esc=3, wis=3, wants=["gold"], flee=0, boss=True,
             specials=[{"n": "Salt Bomb", "chance": .3, "save": "DEX", "dc": 13, "dmg": "2d6", "effect": "salt"}],
             loot=[("hesk_crowbar", 1), ("healing_potion", 1), ("treasure_map", 1)],
             line="A woman with a ten-foot pole and a bandolier of salt is poking every chest in the room. She is getting closer.",
             eat="The hunter is hunted.")
    _visitor("rival", "Rival Mimic", "monstrosity", "M", "2", ac=13, hp=50, atk=("Bite", 5, "2d8+3", None), pp=12, dex=1, esc=3,
             wants=["gold"], aggressive=True, rival=True, flee=0,
             specials=[{"n": "Adhesive Lid", "chance": .25, "save": "STR", "dc": 13, "dmg": "1d6", "effect": "stuck"}],
             loot=[("mimic_tooth", 1), ("goldhoard", .5), ("gold_ring", .5)],
             line="Across the vault sits another chest. It is breathing.", eat="You are what you eat. Hm.")

    # ---------- Regions ----------
    REGIONS = {
        "f1": {"name": "The Gutter Halls", "sub": "Dungeon, floor 1", "lvl": 1, "bg": "bg gutter",
               "special": ["map_scrap", "glowcap"], "first": ["kobold", "sprout"],
               "w": {"rat": 4, "goblin": 4, "kobold": 4, "sprout": 3, "recruit": 3, "pixie": 2, "eye": 2, "bandit": 2}},
        "f2": {"name": "The Bone Gallery", "sub": "Dungeon, floor 2", "lvl": 3, "bg": "bg bone",
               "special": ["spellbook", "holy_symbol", "ember_wand"], "first": ["skeleton", "thief", "apprentice"],
               "w": {"skeleton": 4, "thief": 3, "apprentice": 3, "acolyte": 3, "imp": 2, "darkmantle": 2, "ooze": 2, "pseudo": 2, "goblin": 1}},
        "road": {"name": "The Forest Road", "sub": "Outside the dungeon", "lvl": 4, "bg": "bg road",
                 "special": ["gold_ring", "lute", "bag"], "first": ["merchant", "bard"],
                 "w": {"wolf": 3, "merchant": 4, "bard": 3, "bandit": 4, "pixie": 2, "cherub": 2, "thief": 2}},
        "f3": {"name": "The Sunken Treasury", "sub": "Dungeon, floor 3", "lvl": 6, "bg": "bg treasury",
               "special": ["knight_plate", "ring_prot", "silver"], "first": ["clockwork", "knight"],
               "w": {"knight": 2, "mephit": 3, "clockwork": 3, "cherub": 2, "ogre": 2, "thief": 3, "bandit": 2, "apprentice": 2, "skeleton": 2}},
        "vault": {"name": "The Hidden Vault", "sub": "Behind the map", "lvl": 1, "secret": True, "loot": 1.5, "bg": "bg vault",
                  "special": ["goldhoard", "mimic_tooth"], "first": ["rival"],
                  "w": {"pseudo": 3, "mephit": 2, "knight": 2, "thief": 3, "clockwork": 2, "imp": 2}},
    }
    REGION_ORDER = ["f1", "f2", "road", "f3", "vault"]

    FEATS = {
        "glutton": ("Glutton", "+4 belly, and waiting makes you hungry less often."),
        "gilded": ("Gilded Lid", "+1 AC and +1 to every disguise."),
        "silver": ("Silver Tongue", "You can talk. Sweet Talk anyone who speaks (+3), and Insight always succeeds."),
        "ironstomach": ("Iron Stomach", "Half damage from acid and poison, and curses inside you do nothing."),
        "lockjaw": ("Lockjaw", "+3 to your escape DC, and advantage on bites against grappled visitors."),
    }

    TITLES = {
        "first_bite": ("First Bite", "Eat your first visitor."),
        "box_office": ("Box Office Hit", "Eat 15 visitors."),
        "off_key": ("Off-Key", "Eat a bard."),
        "angel_food": ("Angel Food", "Eat a celestial."),
        "heavy_metal": ("Heavy Metal", "Swallow a knight whole."),
        "hunter_hunted": ("The Hunter Hunted", "Defeat Sister Hesk."),
        "cannibal": ("Professional Courtesy", "Eat another mimic."),
        "trust_issues": ("Trust Issues", "Eat the one person who trusted you."),
        "whats_in": ("What's in the Box", "Survive your death saves."),
        "splinters": ("Splinters", "Shatter, and pull yourself back together."),
        "gourmand": ("Gourmand", "Get Gorged three times."),
        "bigger": ("Bigger on the Inside", "Swallow a Bag of Holding."),
        "fusion": ("Some Assembly Required", "Fuse three items into one."),
        "pacifist": ("Just a Chest", "Let five visitors walk past."),
        "parley": ("Terms and Conditions", "Talk a mimic hunter out of hunting you."),
        "omnivore": ("Omnivore", "Eat ten different kinds of creature."),
    }

    COMPANION_PATHS = {
        "partner": ("Partner", "Wren lures for you: +2 to every lure. She takes a cut of the gold."),
        "pet": ("Pet", "Wren feeds you scraps and talks to you. +1 belly after every wait and faster healing, but -1 to disguises."),
        "reformer": ("Reformer", "Wren asks you not to eat people. Letting visitors pass earns XP and gifts, she teaches you to Sweet Talk, and eating humanoids makes you more notorious."),
        "snack": ("Snack", "Eat her. The System will remember."),
    }

    LEVEL_LINES = ["", "", "Level 2. You are now slightly more box.",
                   "Level 3. Something is happening to your hinges.",
                   "Level 4. You may improve yourself. Please improve your manners.",
                   "Level 5. You have reached Level 5. Several adventurers who were trying to have not.",
                   "Level 6. You are outgrowing the room.",
                   "Level 7. The dungeon has started to notice you.",
                   "Level 8. Improve yourself again. The System has given up on your manners.",
                   "Level 9. There are fewer adventurers than there used to be. Correlation is not causation.",
                   "Level 10. You have reached the top. The System is relieved."]
    NOT_NAMES = ["Rumour", "Wanted", "Hunted", "Legend"]
