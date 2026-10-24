## Contents May Vary — how a turn plays: the hub between visitors, the
## encounter loop, and the small menus they share.

init -5 python:

    class UIText(object):
        """Plain strings for menus. Ren'Py text can show attributes like [cui.lure]
        on every Ren'Py version, so everything a menu needs is worked out here first."""

        def __init__(self):
            self.prompt = ""
            self.lure = ""
            self.sweet = ""
            self.form = ""
            self.bait = ""
            self.bite = ""
            self.tongue = ""
            self.swallow = ""
            self.weapon = ""
            self.breath = ""
            self.acid = ""
            self.rest = ""
            self.region = ""
            self.goal = ""
            self.parley = ""

        def refresh(self):
            mm = store.m
            if mm is None:
                return
            e = store.enc
            self.form = FORMS[mm.form]["name"]
            b = mm.bait_item()
            self.bait = ITEMS[b["id"]]["name"] if b else "none"
            self.bite = mm.bite_text()
            self.tongue = "{} to hit".format(sgn(mm.bite_hit() + [0, 2, 4][mm.ess("plant")]))
            self.acid = mm.acid_text()
            self.rest = "heal fully, belly -1"
            self.region = REGIONS[mm.region]["name"]
            self.goal = cmv_goal()
            if e is None:
                self.prompt = "{b}" + self.region + "{/b}. " + self.goal
                line = cmv_wren_line()
                if line:
                    self.prompt += "\n" + line
                return
            d = e.d()
            self.lure = e.lure_chance_text()
            self.sweet = str(e.sweet_bonus())
            self.swallow = e.swallow_text()
            self.weapon = e.weapon_text()
            self.breath = e.breath_text()
            if e.phase == "approach":
                p = "{b}" + d["name"] + "{/b}, a " + SIZES[d["size"]]["name"].lower() + " " + d["type"] + "."
                if e.insight:
                    p += " Wants " + e.wants_text() + "."
                p += " Their Perception: " + str(e.visitor_pp()) + "."
                self.prompt = p
            elif e.phase == "missed":
                self.prompt = "The " + d["name"] + " is backing away, eyeing you."
            else:
                v = e.v
                bits = []
                if v["swallowed"]:
                    bits.append("They are inside you.")
                elif v["grappled"]:
                    blocked = e.swallow_blocked()
                    bits.append("They are stuck to your tongue." + (" ({})".format(blocked.capitalize()) if blocked else " You can swallow them."))
                if v["blind"]:
                    bits.append("They are blinded.")
                if e.salted:
                    bits.append("You are salted: no acid.")
                if e.poisoned:
                    bits.append("You are poisoned.")
                if e.dark:
                    bits.append("Magical darkness.")
                if e.surprise or e.play_dead:
                    bits.append("Your next attack has advantage.")
                self.prompt = " ".join(bits) if bits else "What do you do?"


    def cmv_goal():
        mm = store.m
        mf = mm.flags
        if mm.tier == "lesser":
            return "Goal: reach Level 3 to evolve."
        if mm.tier == "chest":
            return "Goal: reach Level 6 for your next evolution."
        if not mf.get("hesk_done"):
            return "Goal: stay alive. Someone is asking about you."
        if not mf.get("rival_done"):
            if "vault" in mm.regions:
                return "Goal: travel to the Hidden Vault."
            return "Goal: find the way to the Hidden Vault."
        return "Goal: none. You are a box. Enjoy it."

    def cmv_wren_line():
        c = store.m.companion
        return {
            "partner": "Wren is practising her “lost traveller” face nearby.",
            "pet": "Wren is sitting on your lid, humming.",
            "reformer": "Wren is reading you a book about ethics. Out loud.",
            "snack": "{color=#8ff0ff}The System has not forgotten Wren.{/color}",
        }.get(c, "")

    def cmv_show_bg():
        renpy.scene()
        renpy.show(REGIONS[store.m.region]["bg"])
        if store.m.companion in ("partner", "pet", "reformer"):
            renpy.show("wren", at_list=[store.wren_side])

    def cmv_apply_help(e, kind):
        """Story help in boss fights, depending on what Wren is to you."""
        if not kind:
            return
        if kind == "partner":
            e.pp_mod = -3
            e.no_inv_adv = True
            e.log("Wren jingles a purse on the far side of the room. Sister Hesk's eyes flick to it. Just for a moment. (Her Perception -3, and she loses her advantage on checking you.)", "good")
        elif kind == "pet":
            e.skip_enemy = 1
            if e.m.add_item("healing_potion", quiet=True):
                e.log("Wren drops a Potion of Healing into your lid and plants herself in front of you. Hesk will have to go around her first. (Potion added. Hesk loses her first turn.)", "good")
            else:
                e.log("Wren plants herself in front of you. Hesk will have to go around her first. (Hesk loses her first turn.)", "good")
        elif kind == "reformer":
            e.v["blind"] = 2
            e.log("Wren throws a handful of pixie dust in Hesk's face and shouts an apology at the same time. (Hesk is blinded for 2 turns.)", "good")

    def cmv_bait_menu_items():
        mm = store.m
        out = [("No bait", "none")]
        for c in mm.items:
            if mm.can_bait(c["uid"]):
                it = ITEMS[c["id"]]
                ws = sorted(set(TAG_WANT[t] for t in it["tags"] if t in TAG_WANT))
                lab = "{} (draws anyone who wants {})".format(it["name"], " or ".join(WANTS[w] for w in ws))
                if c["uid"] == mm.bait:
                    lab += " (current)"
                out.append((lab, c["uid"]))
        return out

    def cmv_form_menu_items():
        mm = store.m
        out = []
        for f in mm.forms:
            F = FORMS[f]
            lab = "{} ({} {}, draws {})".format(F["name"], F["skill"], sgn(mm.disguise_mod(f)), " and ".join(WANTS[w] for w in F["attract"]))
            if f == mm.form:
                lab += " (current)"
            out.append((lab, f))
        return out

    def cmv_travel_menu_items():
        mm = store.m
        out = []
        for k in REGION_ORDER:
            if k in mm.regions and k != mm.region:
                R = REGIONS[k]
                cost = mm.travel_cost()
                lab = "{} ({}{})".format(R["name"], R["sub"], ", belly -1" if cost else "")
                if k == "vault" and mm.tier not in BRANCHES:
                    lab = "{} (the way in is too heavy for you to open yet: evolve again first)".format(R["name"])
                elif mm.belly < cost:
                    lab = "{} (too hungry to travel)".format(R["name"])
                out.append((lab, k if mm.can_travel(k) else None))
        out.append(("Stay here", "stay"))
        return out

    def cmv_asi_items():
        mm = store.m
        out = []
        for a in ("STR", "DEX", "CON", "WIS", "CHA"):
            out.append(("{} +2 (now {}: {})".format(ABIL_NAME[a], mm.abil[a], ABIL_USE[a]), a))
        for k, (nm, desc) in FEATS.items():
            if not mm.feat(k):
                out.append(("Feat: {}. {}".format(nm, desc), k))
        return out

    def cmv_item_menu_items():
        e = store.enc
        out = [(e.item_label(c), c["uid"]) for c in e.usable_items()]
        out.append(("Never mind", "back"))
        return out


default m = None
default enc = None
default m_checkpoint = None
default cui = UIText()
default vis_id = "rat"
default vname = ""
default enc_retry = False
default msg_is_sys = False
default msg_text = ""
default pick_value = None
default last_result = None
default parley_dice = None
default ending_name = ""


## Show every queued message: System lines in the System box, the rest as
## narration, a few lines at a time.
label show_msgs:
    while m is not None and m.msgs:
        $ msg_is_sys, msg_text = cmv_take_msgs(m)
        if msg_is_sys:
            sy "[msg_text]"
        else:
            "[msg_text]"
    return


## ---------------------------------------------------------------- the hub
label hub:
    $ enc = None
    $ cmv_show_bg()
    show mimic at mimic_home, breathe
    with dissolve
    call show_msgs

    while True:
        $ mf = m.flags

        ## Story events, in order of priority. Each one jumps back to hub.
        if "asi" in m.pending:
            jump ev_asi
        if m.region == "f1" and m.waits >= 2 and not mf.get("recruit_done"):
            jump ev_recruit
        if m.tier == "lesser" and m.lvl >= 3:
            jump ev_evolve_chest
        if m.tier != "lesser" and m.companion is None:
            jump ev_wren
        if m.region not in ("f1", "vault") and not mf.get("arrived_" + m.region):
            jump ev_arrive
        if m.tier == "chest" and m.lvl >= 6:
            jump ev_evolve_branch
        if m.tier in BRANCHES and not mf.get("hesk_done") and (m.notoriety >= 20 or m.waits - mf.get("branch_wait", 0) >= 2):
            jump ev_hesk
        if "vault" in m.regions and not mf.get("vault_told"):
            jump ev_map
        if m.region == "vault" and not mf.get("rival_done"):
            jump ev_rival
        if mf.get("rival_done") and mf.get("hesk_done") and not mf.get("ended"):
            jump ev_ending

        $ cui.refresh()
        menu:
            "[cui.prompt]"

            "Wait for a visitor":
                $ m.wait()
                call show_msgs
                call encounter(m.next_visitor())

            "Rest ([cui.rest])" if m.can_rest():
                $ m.rest()
                call show_msgs

            "Change disguise (now: [cui.form])" if len(m.forms) > 1:
                call choose_form

            "Choose your bait (now: [cui.bait])":
                call choose_bait

            "Look inside yourself":
                call screen stomach
                call show_msgs

            "Character sheet":
                call screen sheet

            "Travel somewhere else" if len(m.regions) > 1:
                call travel_menu
                if pick_value not in (None, "stay"):
                    $ m.travel(pick_value)
                    $ cmv_show_bg()
                    show mimic at mimic_home, breathe
                    with fade
                    call show_msgs


label choose_form:
    $ narrator("What do you look like today?", interact=False)
    $ pick_value = renpy.display_menu(cmv_form_menu_items())
    $ m.set_form(pick_value)
    return

label choose_bait:
    $ narrator("What do you leave glinting in your open lid?", interact=False)
    $ pick_value = renpy.display_menu(cmv_bait_menu_items())
    if pick_value == "none":
        $ m.bait = None
    else:
        $ m.bait = pick_value
    return

label travel_menu:
    $ narrator("Where to? Moving makes the locals forget you a little.", interact=False)
    $ pick_value = renpy.display_menu(cmv_travel_menu_items())
    return


## ------------------------------------------------------------ encounters
label encounter(vid, assist=None):
    $ m_checkpoint = copy.deepcopy(m)
    $ enc_retry = True

    while enc_retry:
        $ enc_retry = False
        $ m.msgs = []
        $ enc = Encounter(m, vid)
        $ vis_id = vid
        $ vname = enc.name()
        $ cmv_apply_help(enc, assist)
        show mimic at mimic_left, breathe
        show visitor at visitor_right
        with moveinright
        show screen foe_panel
        show screen dice_panel
        call show_msgs

        while enc.phase in ("approach", "missed", "combat"):
            $ cui.refresh()

            if enc.phase == "approach":
                menu:
                    "[cui.prompt]"

                    "Read them (Insight, DC 12)" if enc.insight is None:
                        $ enc.act_insight()

                    "Sweet Talk them (+[cui.sweet] to the lure)" if enc.can_sweet():
                        $ enc.act_sweet()

                    "Change disguise (now: [cui.form])" if len(m.forms) > 1 and not enc.d()["rival"]:
                        call choose_form

                    "Choose your bait (now: [cui.bait])" if not enc.d()["rival"]:
                        call choose_bait

                    "Lure them in ([cui.lure] chance)":
                        $ enc.act_lure()

                    "Lunge at them":
                        $ enc.act_lunge()

                    "Let them pass" if not enc.d()["boss"] and not enc.d()["rival"]:
                        $ enc.act_pass()

            elif enc.phase == "missed":
                menu:
                    "[cui.prompt]"

                    "Lunge at them anyway":
                        $ enc.act_lunge()

                    "Hold still and let them go":
                        $ enc.missed_leave()

            else:
                menu:
                    "[cui.prompt]"

                    "Bite ([cui.bite])" if enc.can("bite"):
                        $ enc.act("bite")

                    "Tongue Lash: grab them ([cui.tongue])" if enc.can("tongue"):
                        $ enc.act("tongue")

                    "Swallow them ([cui.swallow])" if enc.can("swallow") and not enc.swallow_blocked():
                        $ enc.act("swallow")

                    "Clench (acid [cui.acid])" if enc.can("clench"):
                        $ enc.act("clench")

                    "Brace (halve their damage from inside)" if enc.can("brace"):
                        $ enc.act("brace")

                    "Swing a weapon: [cui.weapon]" if enc.can("weapon"):
                        $ enc.act("weapon")

                    "Fire Breath ([cui.breath])" if enc.can("breath") and enc.breath_ready:
                        $ enc.act("breath")

                    "Use something inside you" if enc.can("items"):
                        $ narrator("Use what?", interact=False)
                        $ pick_value = renpy.display_menu(cmv_item_menu_items())
                        if pick_value != "back":
                            $ enc.act("item", pick_value)

                    "Play Dead (fool them into touching you)" if enc.can("dead"):
                        $ enc.act("dead")

                    "Spit them out (they will run)" if enc.can("spit"):
                        $ enc.act("spit")

                    "Slam your lid shut and wait them out" if enc.can("retreat"):
                        $ enc.act("retreat")

            call enc_feedback

        ## The fight is over one way or another.
        if enc.result == "lost":
            hide screen dice_panel
            sy "[[You were defeated. This fight matters, so the System is letting you try again.]"
            $ m = copy.deepcopy(m_checkpoint)
            $ enc_retry = True
        elif enc.result == "shattered":
            hide screen dice_panel
            sy "[[You shatter. Your death saves failed. Splinters everywhere.]"
            menu:
                "The System offers you a choice. It is feeling generous."

                "Pull yourself together and try this fight again":
                    $ m = copy.deepcopy(m_checkpoint)
                    $ enc_retry = True

                "Accept it: lose what you carried and some XP, then carry on":
                    $ enc.shatter()

    hide screen foe_panel
    hide screen dice_panel
    hide visitor
    show mimic at mimic_home, breathe
    with dissolve
    call show_msgs
    $ last_result = enc.result
    $ enc = None
    return


## After each choice: shake the screen if you got hurt, then show the log.
label enc_feedback:
    if enc.hurt_me:
        with hpunch
    elif enc.hurt_v:
        show visitor at visitor_right, flinch
    $ enc.hurt_me = False
    $ enc.hurt_v = False
    call show_msgs
    return


## ------------------------------------------------------- level-up choices
label ev_asi:
    sy "[[Ability Score Improvement available. Choose one ability to raise by 2, or learn a feat.]"
    $ narrator("How do you want to improve?", interact=False)
    $ pick_value = renpy.display_menu(cmv_asi_items())
    $ m.apply_asi(pick_value)
    call show_msgs
    jump hub
