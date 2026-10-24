## Contents May Vary — game screens.
## HUD (you), foe panel (them), dice panel (the last roll), stomach, sheet,
## and the ending card. Everything is sized with cpx() so it fits any
## resolution, and nothing scrolls except the big lists inside a panel.

style cmv_tile is button:
    background Frame("images/ui/tile.png", 12, 12)
    hover_background Frame("images/ui/tile_hover.png", 12, 12)
    selected_background Frame("images/ui/tile_sel.png", 12, 12)
    padding (cpx(4), cpx(4))

style cmv_tile_text is cmv_small:
    size cpx(11)
    color "#f2ead8"
    xalign 0.5
    text_align 0.5


init -5 python:

    def cmv_short(name, n=14):
        return name if len(name) <= n else name[:n - 1] + "…"

    def cmv_digest_preview(mm, iid):
        it = ITEMS[iid]
        out = []
        for tag in it["tags"]:
            if tag in DIGEST_TAGS:
                nm, each, mx = DIGEST_TAGS[tag]
                if mm.dt(tag) >= mx:
                    out.append("{} (maxed)".format(nm))
                else:
                    out.append("{} ({})".format(nm, each))
            if tag in TYPES:
                out.append(TYPE_NAME[tag] + " essence")
        if iid == "spellbook" and "bookshelf" not in mm.forms:
            out.append("the Bookshelf form")
        if it.get("no_digest"):
            return "Can't be digested."
        if not out:
            return "Digesting it gives you nothing."
        return "Digesting it gives: " + ", ".join(out) + "."

    def cmv_belly_word(mm):
        if mm.gorged():
            return "Gorged"
        if mm.starving():
            return "Starving"
        if mm.belly <= 1:
            return "Hungry"
        return ""

    def cmv_foe_status(e):
        v = e.v
        out = []
        if v["swallowed"]:
            out.append("Inside you")
        elif v["grappled"]:
            out.append("Grappled")
        if v["blind"]:
            out.append("Blinded")
        if v["charmed"]:
            out.append("Charmed")
        return ", ".join(out)


## ------------------------------------------------------------ HUD
screen hud():
    zorder 20
    if m is not None:
        frame style "cmv_panel" xpos cpx(8) ypos cpx(8) xsize cpx(250):
            vbox spacing cpx(3):
                hbox xfill True:
                    text m.name style "cmv_label"
                    text "Level [m.lvl]" style "cmv_label" xalign 1.0
                text "{} · {}".format(TIERS[m.tier]["name"], FORMS[m.form]["name"]) style "cmv_small"

                hbox spacing cpx(6):
                    text "HP" style "cmv_small" min_width cpx(42) yalign 0.5
                    bar value StaticValue(max(0, m.hp), m.max_hp()) style "cmv_bar" xsize cpx(115) yalign 0.5
                    text "{}/{}".format(max(0, m.hp), m.max_hp()) style "cmv_small" yalign 0.5

                hbox spacing cpx(6):
                    text "Belly" style "cmv_small" min_width cpx(42) yalign 0.5
                    bar value StaticValue(min(m.belly, m.belly_cap()), m.belly_cap()) style "cmv_bar_belly" xsize cpx(115) yalign 0.5
                    text "{}/{} {}".format(m.belly, m.belly_cap(), cmv_belly_word(m)) style "cmv_small" yalign 0.5

                hbox spacing cpx(6):
                    text "XP" style "cmv_small" min_width cpx(42) yalign 0.5
                    bar value StaticValue(m.xp_frac(), 1.0) style "cmv_bar_xp" xsize cpx(115) yalign 0.5
                    if m.lvl < MAX_LVL:
                        text "{}/{}".format(m.xp, m.xp_next()) style "cmv_small" yalign 0.5
                    else:
                        text "max" style "cmv_small" yalign 0.5

                text "Notoriety: {} ({})".format(m.not_name(), m.notoriety) style "cmv_small"
                if m.digest:
                    text "Digesting {}: {} wait{} left".format(ITEMS[m.digest["id"]]["name"], m.digest["left"], "" if m.digest["left"] == 1 else "s") style "cmv_small"
                if m.cracked:
                    text "Cracked Lid: -2 AC for {} more fight{}".format(m.cracked, "" if m.cracked == 1 else "s") style "cmv_small" color "#ff8f8f"

                hbox spacing cpx(6) xfill True:
                    textbutton "Inside" style "cmv_button" xsize cpx(110) action Show("stomach", from_hud=True)
                    textbutton "Sheet" style "cmv_button" xsize cpx(110) xalign 1.0 action Show("sheet", from_hud=True)


## ------------------------------------------------------------ the visitor
screen foe_panel():
    zorder 20
    if enc is not None:
        $ fd = enc.d()
        frame style "cmv_panel" xalign 1.0 xoffset cpx(-8) ypos cpx(8) xsize cpx(250):
            vbox spacing cpx(3):
                text fd["name"] style "cmv_label"
                text "{} {} · AC {} · Perception {}".format(SIZES[fd["size"]]["name"], fd["type"], fd["ac"], enc.visitor_pp()) style "cmv_small"
                hbox spacing cpx(6):
                    text "HP" style "cmv_small" min_width cpx(42) yalign 0.5
                    bar value StaticValue(max(0, enc.v["hp"]), enc.v["max"]) style "cmv_bar_foe" xsize cpx(115) yalign 0.5
                    text "{}/{}".format(max(0, enc.v["hp"]), enc.v["max"]) style "cmv_small" yalign 0.5
                if cmv_foe_status(enc):
                    text cmv_foe_status(enc) style "cmv_small" color "#ffd98a"


## ------------------------------------------------------------ the last roll
screen dice_panel():
    zorder 21
    if enc is not None and enc.dice is not None:
        $ dd = enc.dice
        $ dcol = "#9be89b" if dd["ok"] else "#ff8f8f"
        frame style "cmv_panel" xalign 1.0 xoffset cpx(-8) ypos cpx(130) xsize cpx(250):
            vbox spacing cpx(4):
                text dd["label"] style "cmv_small"
                hbox spacing cpx(10):
                    fixed xysize (cpx(60), cpx(60)):
                        add "images/ui/d20.png" xysize (cpx(60), cpx(60))
                        text str(dd["r"]) style "cmv_title" color "#1b1209" xalign 0.5 yalign 0.55
                    vbox yalign 0.5:
                        if dd["mode"] and dd["b"] is not None:
                            text "{} of {} and {}".format("Best" if dd["mode"] > 0 else "Worst", dd["a"], dd["b"]) style "cmv_small"
                        text "{} {} = {}".format(dd["r"], sgn(dd["mod"]), dd["total"]) style "cmv_text"
                        text "vs {} {}".format(dd["vs_label"], dd["vs"]) style "cmv_small"
                for pname, pval in dd["parts"]:
                    text "{} {}".format(pname, sgn(pval)) style "cmv_small" size cpx(11)
                text dd["word"] style "cmv_label" color dcol


## ------------------------------------------------------------ the stomach
screen stomach(from_hud=False):
    modal True
    zorder 100
    default sel = None
    $ can_edit = enc is None
    $ cols = 5
    $ cells = max(m.capacity(), len(m.items))
    $ rows = (cells + cols - 1) // cols
    $ tile = cpx(84)
    $ empty = rows * cols - len(m.items)
    $ selc = m.find(sel) if sel is not None else None

    add Solid("#000000c0")

    frame style "cmv_panel" xalign 0.5 yalign 0.5 xsize int(config.screen_width * 0.9) ysize int(config.screen_height * 0.88):
        vbox spacing cpx(8):
            hbox xfill True:
                text "Inside [m.name]" style "cmv_title"
                textbutton "Close" style "cmv_button" xalign 1.0 action (Hide("stomach") if from_hud else Return())

            text "{} of {} slots used · Bait: {} · Attuned: {} of 3".format(len(m.items), m.capacity(), ITEMS[m.bait_item()["id"]]["name"] if m.bait_item() else "none", len(m.attuned)) style "cmv_small"
            if m.digest:
                text "Digesting {}: done in {} more wait{}.".format(ITEMS[m.digest["id"]]["name"], m.digest["left"], "" if m.digest["left"] == 1 else "s") style "cmv_small" color "#ffd98a"
            if not can_edit:
                text "You're in a fight: you can look, but not rearrange." style "cmv_small" color "#ff8f8f"

            if can_edit and m.fusable():
                hbox spacing cpx(8):
                    for fid in m.fusable():
                        textbutton "Fuse 3 {} into {}".format(ITEMS[fid]["name"], ITEMS[ITEMS[fid]["fuse"]]["name"]) style "cmv_button" action [Function(m.fuse, fid), SetScreenVariable("sel", None)]

            hbox spacing cpx(14):
                ## The slots.
                viewport:
                    xsize cols * (tile + cpx(6)) + cpx(14)
                    ysize int(config.screen_height * 0.62)
                    mousewheel True
                    draggable True
                    scrollbars "vertical"
                    grid cols rows spacing cpx(6):
                        for c in m.items:
                            button style "cmv_tile" xysize (tile, tile):
                                action SetScreenVariable("sel", c["uid"])
                                selected sel == c["uid"]
                                fixed:
                                    vbox xalign 0.5 yalign 0.5 spacing 0:
                                        add "images/icons/{}.png".format(c["id"]) xysize (cpx(46), cpx(46)) xalign 0.5
                                        text cmv_short(ITEMS[c["id"]]["name"], 11) style "cmv_tile_text"
                                    if m.bait == c["uid"]:
                                        text "BAIT" style "cmv_tile_text" color "#ffd98a" size cpx(10) xalign 1.0 yalign 0.0
                                    if c["uid"] in m.attuned:
                                        text "ATTUNED" style "cmv_tile_text" color "#9ff3ff" size cpx(10) xalign 0.0 yalign 0.0
                        for i in range(empty):
                            add Frame("images/ui/tile_empty.png", 12, 12) xysize (tile, tile)

                ## Details for the selected item.
                vbox spacing cpx(8) xfill True:
                    if selc is None:
                        text "Tap an item to see what it does." style "cmv_text"
                        text "Bait draws visitors who want it. Attuned items work while attuned (up to 3). Digesting an item takes a few waits and gives you a permanent trait. Three of some items fuse into something better." style "cmv_small"
                    else:
                        $ it = ITEMS[selc["id"]]
                        hbox spacing cpx(12):
                            add "images/icons/{}.png".format(selc["id"]) xysize (cpx(72), cpx(72))
                            vbox yalign 0.5:
                                text it["name"] style "cmv_title"
                                text "{} · {}".format(it["r"].capitalize(), ", ".join(t for t in it["tags"])) style "cmv_small"
                        text it["desc"] style "cmv_text"
                        text cmv_digest_preview(m, selc["id"]) style "cmv_small"
                        if it.get("cursed") and m.cursed_on():
                            text "Cursed: you can't spit this out. Digest it instead." style "cmv_small" color "#ff8f8f"

                        if can_edit:
                            vbox spacing cpx(6):
                                if m.can_bait(selc["uid"]):
                                    textbutton ("Stop using as bait" if m.bait == selc["uid"] else "Use as bait") style "cmv_button" xsize cpx(280) action Function(m.set_bait, selc["uid"])
                                if it.get("attune"):
                                    textbutton ("Stop attuning" if selc["uid"] in m.attuned else "Attune (uses 1 of 3)") style "cmv_button" xsize cpx(280) sensitive (selc["uid"] in m.attuned or len(m.attuned) < 3) action Function(m.toggle_attune, selc["uid"])
                                if m.can_eat(selc["uid"]):
                                    textbutton "Eat it" style "cmv_button" xsize cpx(280) action [Function(m.eat_item, selc["uid"]), SetScreenVariable("sel", None)]
                                if not it.get("no_digest"):
                                    textbutton ("Digest it ({} wait{})".format(m.digest_waits(selc["id"]), "" if m.digest_waits(selc["id"]) == 1 else "s") if m.digest is None else "Already digesting something") style "cmv_button" xsize cpx(280) sensitive m.can_digest(selc["uid"]) action [Function(m.start_digest, selc["uid"]), SetScreenVariable("sel", None)]
                                textbutton "Spit it out" style "cmv_button" xsize cpx(280) sensitive m.can_spit(selc["uid"]) action [Function(m.spit_out, selc["uid"]), SetScreenVariable("sel", None)]


## ------------------------------------------------------------ character sheet
screen sheet(from_hud=False):
    modal True
    zorder 100
    add Solid("#000000c0")

    frame style "cmv_panel" xalign 0.5 yalign 0.5 xsize int(config.screen_width * 0.9) ysize int(config.screen_height * 0.88):
        vbox spacing cpx(8):
            hbox xfill True:
                text "[m.name], {} · Level {}".format(TIERS[m.tier]["name"], m.lvl) style "cmv_title"
                textbutton "Close" style "cmv_button" xalign 1.0 action (Hide("sheet") if from_hud else Return())

            viewport:
                mousewheel True
                draggable True
                scrollbars "vertical"
                ysize int(config.screen_height * 0.74)

                hbox spacing cpx(30):
                    vbox spacing cpx(5) xsize int(config.screen_width * 0.4):
                        text "Abilities" style "cmv_label"
                        for a in ABILS:
                            hbox spacing cpx(8):
                                text "{} {} ({})".format(a, m.score(a), sgn(m.mod(a))) style "cmv_text" min_width cpx(120)
                                text ABIL_USE[a] style "cmv_small" yalign 0.5

                        null height cpx(6)
                        text "Fighting" style "cmv_label"
                        text "AC {} · HP {}/{} · Proficiency {}".format(m.ac(), m.hp, m.max_hp(), sgn(m.prof())) style "cmv_text"
                        text "Bite: {}".format(m.bite_text()) style "cmv_text"
                        text "Acid (swallowed visitors, each turn): {}".format(m.acid_text()) style "cmv_text"
                        text "Swallow: {} or smaller, DC {} · Escape DC {}".format(m.swallow_size_name(), m.swallow_dc(), m.escape_dc()) style "cmv_text"
                        text "Initiative {} · Insight {}".format(sgn(m.init_bonus()), sgn(m.insight_bonus())) style "cmv_text"
                        if m.best_weapon():
                            text "Best weapon: {} ({})".format(m.best_weapon()["it"]["name"], m.best_weapon()["it"]["weapon"]) style "cmv_text"
                        if m.breath_info():
                            text "Fire breath: {}, DC {}".format(m.breath_info()["expr"], m.breath_info()["dc"]) style "cmv_text"

                        null height cpx(6)
                        text "Disguises" style "cmv_label"
                        for fk in m.forms:
                            text "{}{}: {} {}. Draws {}.".format(FORMS[fk]["name"], " (current)" if fk == m.form else "", FORMS[fk]["skill"], sgn(m.disguise_mod(fk)), " and ".join(WANTS[x] for x in FORMS[fk]["attract"])) style "cmv_small"

                    vbox spacing cpx(5) xsize int(config.screen_width * 0.4):
                        text "Wren" style "cmv_label"
                        if m.companion:
                            text "{}: {}".format(COMPANION_PATHS[m.companion][0], COMPANION_PATHS[m.companion][1]) style "cmv_small"
                        else:
                            text "You haven't met her yet." style "cmv_small"

                        null height cpx(6)
                        text "Essence (what you've eaten)" style "cmv_label"
                        $ ess_list = [t for t in TYPES if m.essence.get(t, 0) > 0]
                        for t in ess_list:
                            $ lv = m.ess(t)
                            text "{} {}/{}: {}".format(TYPE_NAME[t], m.essence[t], ESS_AT[1] if lv else ESS_AT[0], (ESSENCE[t][0] + ". " + ESSENCE[t][lv]) if lv else "no trait yet") style "cmv_small"
                        if not ess_list:
                            text "Nothing yet. Eat something." style "cmv_small"

                        null height cpx(6)
                        text "Digested traits" style "cmv_label"
                        if m.dtraits:
                            for tag, n in m.dtraits.items():
                                text "{} x{}: {} each".format(DIGEST_TAGS[tag][0], n, DIGEST_TAGS[tag][1]) style "cmv_small"
                        else:
                            text "None yet. Digest items from your stomach." style "cmv_small"

                        if m.feats:
                            null height cpx(6)
                            text "Feats" style "cmv_label"
                            for fk in m.feats:
                                text "{}: {}".format(FEATS[fk][0], FEATS[fk][1]) style "cmv_small"

                        null height cpx(6)
                        text "Titles ({} of {})".format(len(m.titles), len(TITLES)) style "cmv_label"
                        for tk in TITLES:
                            if tk in m.titles:
                                text "{}: {}".format(TITLES[tk][0], TITLES[tk][1]) style "cmv_small" color "#ffd98a"

                        null height cpx(6)
                        text "Visitors eaten: {} · Let past: {} · Got away: {}".format(m.eaten, m.passes, m.fled) style "cmv_small"


## ------------------------------------------------------------ the end
screen ending_card():
    modal True
    add Solid("#0b0806")
    frame style "cmv_panel" xalign 0.5 yalign 0.5 xsize int(config.screen_width * 0.6):
        vbox spacing cpx(8) xalign 0.5:
            text "[ending_name]" style "cmv_title" xalign 0.5
            text "[m.name], {} · Level {}".format(TIERS[m.tier]["name"], m.lvl) style "cmv_text" xalign 0.5
            text "Visitors eaten: {} · Let past: {} · Shattered: {}".format(m.eaten, m.passes, m.deaths) style "cmv_small" xalign 0.5
            null height cpx(6)
            text "Titles earned: {} of {}".format(len(m.titles), len(TITLES)) style "cmv_label" xalign 0.5
            for tk in TITLES:
                if tk in m.titles:
                    text "{}: {}".format(TITLES[tk][0], TITLES[tk][1]) style "cmv_small" xalign 0.5
            null height cpx(10)
            textbutton "Continue" style "cmv_button" xalign 0.5 action Return()
