## Contents May Vary — the story.
## A mimic wakes up, learns to eat, meets Wren, is hunted, and goes looking
## for the thing in the Hidden Vault.

label start:
    $ m = None
    $ enc = None
    scene black
    with fade

    "For a long time, you are furniture."
    "Then, one damp Tuesday, you are not."

    sy "[[Object has achieved sentience.]"
    sy "[[Species: Lesser Mimic. Level 1.]"
    sy "[[Congratulations. You are a box.]"

    "You take stock. You have a lid. You have hinges. You have, it turns out, teeth, which is new."
    "You also have a voice in your head that speaks in square brackets. You decide not to think about that yet."

    sy "[[Please designate a name. Boxes are not normally asked. This is a courtesy.]"

    $ pick_value = renpy.input("What are you called?", default="Lid", length=16)
    $ m = Mimic(cmv_clean_name(pick_value))

    sy "[[Name accepted: [m.name]. The System will try to remember it.]"

    scene bg gutter
    show mimic at mimic_home, breathe
    with fade
    show screen hud

    "You are sitting against the wall of a long, wet corridor. Water runs down a channel in the middle. Somewhere, something drips with real commitment."
    sy "[[Location: The Gutter Halls. Dungeon, floor 1.]"
    "Inside you is a small pile of copper coins. You don't remember swallowing them. You don't remember anything. Fair enough."
    "You are also hungry. Not for copper."
    sy "[[The panel in the corner shows your HP, Belly and XP. Waiting makes you hungry. Eating visitors fills you up.]"
    sy "[[Tap {b}Inside{/b} on the panel any time to see what you are carrying.]"

    "Something small skitters down the corridor toward you."
    sy "[[Visitor approaching. Tutorial mode: the System will explain things once. Only once. Please pay attention.]"
    sy "[[{b}Lure them in{/b}: you roll a d20 and add your disguise bonus. Beat their Perception and they come close enough to touch you. They will not enjoy what happens next.]"
    sy "[[{b}Read them{/b} first if you like. Insight tells you what they want, so you can pick the right bait.]"

    call encounter("rat")

    "Well. That was a rat."
    sy "[[Small enough? {b}Tongue Lash{/b} to grab them, then {b}Swallow{/b}. Inside you, your acid does the work each turn. Lesser Mimics can only swallow Tiny things. Evolve to swallow bigger.]"

    "Footsteps, heavier than a rat's. Somebody is muttering."
    sy "[[Bait helps. Every visitor wants something. Copper Coins draw anyone who wants treasure, and your bait is already set to them.]"

    call encounter("goblin")

    "You feel larger. Not physically. Spiritually. Also physically, a little."
    sy "[[You now know enough to be dangerous. The System is required to say: please be careful.]"
    sy "[[From here, {b}wait for visitors{/b} whenever you like. {b}Rest{/b} when you're hurt. Each wait makes you a little hungrier, so keep eating.]"
    $ m.flags["tutorial_done"] = True
    jump hub


## ------------------------------------------------------------ Pell
label ev_recruit:
    $ m.flags["recruit_done"] = True
    $ vis_id = "recruit"
    show visitor at visitor_right
    with moveinright

    "A young human with a wooden practice sword and a very new backpack walks right up to you and sits down. On you."
    pell "Okay. Okay okay okay. Floor one. You can do floor one, Pell."
    "You hold very still. Being sat on is a new experience. You are not sure you hate it."
    pell "Wren said it's easy if you check every chest. Wren's never been down here. But Wren reads a lot."
    pell "Level five. That's all I need. Level five and the Guild takes you on properly. Steady pay. Dental."
    "Pell pats your lid without looking."
    pell "You're a nice chest. I'm going to check you in a minute. Just... let me sit."

    menu:
        "Pell is sitting on you. Close enough to touch."

        "Wait until they open you, then strike":
            pell "Right. Up. Let's see what's in you."
            "Pell stands, turns around, and reaches for your lid."
            hide visitor
            call encounter("recruit")
            if last_result in ("eaten", "digested"):
                $ m.flags["pell_eaten"] = True
                "Inside you, among the coins, is a wooden practice sword."
                "You try not to think about the word {i}Dental{/i}."
            else:
                $ m.flags["pell_spared"] = True

        "Stay perfectly still until they leave":
            "You hold still. Pell eats half a sandwich, tells you “good chest” twice, and wanders deeper into the dungeon."
            "They forget to check you. You're not sure whether that's a win."
            $ m.flags["pell_spared"] = True
            $ m.passes += 1
            $ m.gain_xp(25)
            sy "[[Restraint. +25 XP. The System is... surprised.]"
            hide visitor
            with moveoutright

    call show_msgs
    jump hub


## ------------------------------------------------------------ first evolution
label ev_evolve_chest:
    "Your hinges ache. Your lid feels too small for your thoughts."
    sy "[[Level 3 reached. Evolution available: Chest Mimic.]"
    sy "[[Chest Mimic: a proper chest. Swallow Small creatures. Learn the Barrel form. Your stomach grows from 9 slots to 16.]"

    menu:
        "Evolve?"

        "Accept":
            pass

        "Accept, but enthusiastically":
            "You rattle your lid with excitement. A distant goblin hears it and decides to go home."

    "You grow. It feels like stretching after a long sleep, if you were made of wood and the sleep had lasted eighty years."
    $ m.evolve_to("chest")
    with evoflash
    call show_msgs
    "You are a proper chest now. Brass corners. A keyhole with opinions."
    jump hub


## ------------------------------------------------------------ Wren
label ev_wren:
    show wren at visitor_right
    with moveinright

    "Someone is walking toward you with a lantern held up high and a notebook held up higher."
    "She's scrawny and red-haired, in a coat with more patches than coat. She reads from the notebook as she walks."
    w "“Chest, brass-cornered, damp corridor. Suspected trap: no. Suspected treasure: yes.”"
    w "That's you. Hello, chest."
    "She kneels in front of you and, before you can decide anything, opens your lid."
    $ m.mouth = "open"
    show mimic at mimic_home, breathe
    "She is looking directly at your teeth."
    "She does not scream."
    w "Oh. Oh, you're a mimic. You're a {i}real{/i} mimic."
    w "I've read about you. Well, not you. Your family. Your genre."
    "Her hand is resting on your tongue. Adhesive. If you wanted to, you could just..."
    w "I'm Wren. I failed the Guild exam twice. My friend Pell came down here alone this morning because I wouldn't stop studying, so I came after them."

    if m.flags.get("pell_eaten"):
        "You think about the wooden practice sword inside you."
        "You hold very, very still."
    elif m.flags.get("pell_spared"):
        "You remember a recruit with a sandwich, sitting on your lid. They went deeper. They seemed fine. Mostly fine."

    w "Do you want to work together? I think you'd be good at this. Honestly, I think you'd be better at it than me."

    sy "[[A companion is offering to join you. Decide what Wren is to you. This choice is permanent.]"

    menu:
        "What is Wren to you?"

        "Partner: she lures for you (+2 to every lure) and takes a cut of the gold":
            $ m.mouth = "closed"
            $ m.choose_companion("partner")
            w "Partners! Okay. I'll do the talking. You do the... the other part."
            w "I get one coin in three. That's fair. That's practically charity, for a dungeon."

        "Pet: she feeds you and talks to you (no hunger from waiting, faster healing, -1 to disguises)":
            $ m.mouth = "closed"
            $ m.choose_companion("pet")
            "You close your lid very gently, so as not to catch her fingers."
            w "Oh! You're shy. That's fine. I'll stay. I'll bring you snacks."
            "She sits down on your lid and starts humming. You find you don't mind."

        "Reformer: she asks you not to eat people (passing visitors by earns XP, and she teaches you Sweet Talk)":
            $ m.mouth = "closed"
            $ m.choose_companion("reformer")
            w "Here's my idea. What if you just... didn't eat people?"
            "You consider this. It is the strangest idea you have ever heard."
            w "Rats are fine. Slimes are fine. I'm not a monster. But people, maybe not? I'll teach you how to talk to them. You'll see."
            if m.flags.get("pell_eaten"):
                "You think about Pell. Wren doesn't know."
                "You decide she never will."

        "Snack: eat her":
            "Her hand is already on your tongue."
            "You close your lid."
            hide wren
            with dissolve
            $ m.mouth = "closed"
            $ m.choose_companion("snack")
            "It is very quiet in the corridor after that."
            "Inside you, among the coins, there is a notebook. The last entry is wet. It says: “Chest, brass-cornered. Friendly?”"

    call show_msgs
    if m.companion != "snack":
        show wren at wren_side
        with move
        sy "[[Wren will stay with you now. She'll show up in the corner of the screen when she's around.]"
    jump hub


## ------------------------------------------------------------ new places
label ev_arrive:
    $ m.flags["arrived_" + m.region] = True

    if m.region == "f2":
        "The stairs down are long and lined with skulls in little alcoves. Someone has labelled them. Someone has strong feelings about alphabetising."
        sy "[[Location: The Bone Gallery. Dungeon, floor 2. Known for spellbooks, holy symbols and wands.]"
        "The things that live down here are hungrier. So are you."
        if m.companion in ("partner", "pet", "reformer"):
            w "It smells like a library that died. I love it."

    elif m.region == "road":
        "For the first time, you are outside. There is no ceiling. You did not know a ceiling was optional."
        sy "[[Location: The Forest Road. Outside the dungeon. Known for rings, lutes, and the odd Bag of Holding.]"
        "A wooden sign says {i}MIND THE WOLVES{/i}. Underneath, someone has scratched {i}AND THE CHESTS{/i}."
        if m.companion in ("partner", "pet", "reformer"):
            w "Merchants come through here. Merchants carry {i}bags{/i}. Bags carry {i}things{/i}."

    elif m.region == "f3":
        "The third floor is half underwater. Coins glitter under the surface like a rumour."
        sy "[[Location: The Sunken Treasury. Dungeon, floor 3. Known for plate armour, protective rings and silver.]"
        "Somewhere beyond a waterfall, something big is breathing. You decide that's a problem for later."

    jump hub


## ------------------------------------------------------------ second evolution
label ev_evolve_branch:
    "You are outgrowing the room. Literally: a shelf above you has started to crack."
    sy "[[Level 6. Evolution available. Choose your path. This is permanent, and all four can swallow Medium creatures.]"

    menu:
        "What do you become?"

        "Vault Mimic: armour and patience (AC 16, +2 HP per level, a grip that's hard to escape)":
            $ m.evolve_to("vault")
            with evoflash
            "Iron bands creep across your planks. Your keyhole grows a second keyhole. You feel very, very safe."

        "Wardrobe Mimic: a shapeshifter (+2 to every disguise, better Play Dead, Wardrobe and Coffin forms)":
            $ m.evolve_to("wardrobe")
            with evoflash
            "You stretch upward, grow doors, and discover you have opinions about coat hangers."

        "Doorway Mimic: a door that goes one way (swallow without grabbing once a fight, free travel, Door form)":
            $ m.evolve_to("doorway")
            with evoflash
            "You flatten, stand up straight, and become something everyone has to walk through eventually."

        "Barrel Mimic: a chaser (bite twice each turn, and visitors who run have to get past you)":
            $ m.evolve_to("barrel")
            with evoflash
            "You go round. You go fast. Somewhere, a goblin starts having nightmares about rolling."

    $ m.flags["branch_wait"] = m.waits
    call show_msgs
    "Somewhere in the dungeon, someone pins a new poster to a wall."
    jump hub


## ------------------------------------------------------------ Sister Hesk
label ev_hesk:
    show hesk at visitor_right
    with moveinright

    "There's a poster on the wall across from you. It shows a box with teeth. It is not a good drawing. It is, unfortunately, recognisable."
    "A woman walks in, reading it. Grey habit, sleeves rolled up, a ten-foot pole over one shoulder and a bandolier of salt across her chest."
    h "Mimic. Probably brass-cornered. Eats adventurers. Answers to..."
    "She squints at the poster."
    h "“The Box.” Creative."
    "She starts tapping every chest, barrel and cupboard in the room with the pole. Methodically. Tap. Tap. Tap."

    if m.flags.get("rival_done"):
        h "My order was twelve sisters, once. The thing in the deep vault ate eight of us in a night."
        h "Somebody ate {i}it{/i} last week. I'd like to shake their hand."
        "Tap. Tap."
        h "Then salt them. Professional standards."
    else:
        h "My order was twelve sisters, once. The thing in the deep vault ate eight of us in a night."
        h "So now I check every box. Every single one."

    $ pick_value = None

    if m.companion == "partner":
        "Wren leans close to your keyhole."
        w "I'll distract her. When she looks away, you do the thing."
        $ pick_value = "partner"

    elif m.companion == "pet":
        "Wren gets up off your lid and stands in front of you."
        w "She's not hurting you. I won't let her."
        h "Step away from the box, girl."
        w "No."
        $ pick_value = "pet"

    elif m.companion == "reformer":
        "Wren steps out between you and the pole."
        w "Sister, wait! This one doesn't eat people any more. Mostly. It's learning."
        h "They don't learn. They wait."
        w "Then let it show you. Please. Just listen."

        menu:
            "Hesk lowers the pole an inch. Only an inch."

            "Let Wren talk, and do your best to look harmless (Persuasion)":
                $ parley_dice = m.parley()
                $ cui.parley = "Persuasion: rolled " + cmv_dice_line(parley_dice) + ". " + parley_dice["word"] + "."
                sy "[[[cui.parley]]"
                if parley_dice["ok"]:
                    jump hesk_parley
                "Hesk listens to all of it. Then she shakes her head."
                h "I'm sorry, girl. I've heard it before. Usually from the inside of one."
                $ pick_value = "reformer"

            "There's no talking to a woman with a ten-foot pole":
                $ pick_value = "reformer"

    elif m.companion == "snack":
        h "I'm looking for a girl, too. Red hair. A coat that's mostly patches. Carries a notebook everywhere. Name of Wren."
        "Tap. The pole rests on your lid."
        h "You wouldn't have seen her. Would you."
        sy "[[The System notes that you are alone.]"

    hide hesk
    call encounter("hesk", assist=pick_value)
    $ m.flags["hesk_done"] = True
    $ m.flags["hesk_eaten"] = True
    call hesk_map
    if m.companion in ("partner", "pet", "reformer"):
        show wren at wren_side
        w "Is she... is she in there?"
        "You don't answer. You can't. Your stomach answers for you, in a long, low gurgle."
        if m.companion == "reformer":
            w "...Right. Okay. She did start it."
    jump hub


label hesk_parley:
    $ m.flags["hesk_done"] = True
    $ m.flags["hesk_spared"] = True
    $ m.award("parley")
    $ m.gain_xp(700)
    "Wren talks. She talks for a long time. About Pell, and the Guild exam, and a box that let five visitors walk past it without so much as a nibble."
    "Hesk looks at you for the whole of it. You do your very best impression of furniture with a conscience."
    h "...Eight sisters."
    h "It's in the vault behind the waterfall, on the third floor. Older than you. Bigger than you. Hungrier than you."
    "She takes a folded map from her habit and drops it into your lid."
    h "Eat {i}that{/i} one, and we'll call it even."
    hide hesk
    with moveoutright
    if not m.has("treasure_map"):
        $ m.add_item("treasure_map", quiet=True)
    call hesk_map
    w "We did it! You did it! I mostly did it. We did it!"
    jump hub


label hesk_map:
    if "vault" not in m.regions:
        $ m.regions.append("vault")
        sy "[[A map lands next to you. It shows the way into the Hidden Vault.]"
    call show_msgs
    return


label ev_map:
    $ m.flags["vault_told"] = True
    "You unfold the map with your tongue. This takes a while."
    "It's drawn on the back of a wanted poster. Your wanted poster. On the other side, someone has sketched the third floor: a waterfall, a door behind it, and a room full of little triangles that mean {i}gold{/i}."
    "In the middle of the room, someone has drawn a second box. With teeth."
    sy "[[New area: The Hidden Vault. The way in is through the Sunken Treasury. You'll need to be a fully evolved mimic to open it.]"
    if m.companion in ("partner", "pet", "reformer"):
        w "Another mimic? Like you? Do you think it's friendly?"
        "You think about the teeth in the drawing."
        w "Right. No. Probably not."
    jump hub


## ------------------------------------------------------------ the rival
label ev_rival:
    $ vis_id = "rival"
    "Behind the waterfall, the vault is dry and warm and full of gold. Real gold, in piles, like a dragon's bedroom."
    "In the middle of it all sits a chest."
    "It is a very good chest. Better than you. Older. The brass is real brass. The wood is the kind of dark that takes a hundred years."
    show visitor at visitor_right
    with dissolve
    "It is breathing."
    "Its lid opens a crack. Rows of teeth. Inside, the glint of eight holy symbols."
    "It looks at you the way you look at a rat."

    if m.companion == "partner":
        w "Okay. I'm going to stand over there. Very far over there."
    elif m.companion == "pet":
        w "...You can take it. I know you can. You're the best box."
    elif m.companion == "reformer":
        w "I don't think we can talk this one out."
        if m.flags.get("hesk_spared"):
            w "For the sisters, then."
    else:
        sy "[[The System notes, again, that you are alone.]"

    hide visitor
    call encounter("rival")
    $ m.flags["rival_done"] = True
    "The other chest is gone. The vault is very quiet."
    "You are what you eat. You feel older. You feel like the kind of dark wood that takes a hundred years."
    if not m.flags.get("hesk_done"):
        "Somewhere far above, a woman with a ten-foot pole is reading a poster with your face on it."
    jump hub


## ------------------------------------------------------------ endings
label ev_ending:
    $ m.flags["ended"] = True
    scene bg vault
    show mimic at mimic_home, breathe
    with fade

    if m.companion == "partner":
        $ ending_name = "Contents May Vary, Ltd."
        show wren at wren_side
        "A month later, a sign hangs outside the waterfall. It says {i}GUIDED VAULT TOURS. GOLD GUARANTEED.{/i}"
        "Wren sells real maps to real adventurers. Most of them leave richer. The rude ones don't leave."
        w "One coin in three. Still practically charity."
        if m.flags.get("pell_spared"):
            "One morning Pell turns up, sword and all. Level five. Dental."
            pell "Wren! You're alive! And you're... running a business with a chest?"
            w "Partner. It's a partner."

    elif m.companion == "pet":
        $ ending_name = "Good Box"
        show wren at wren_side
        "Wren moves into the vault. She brings a blanket, a lamp, and forty-one books."
        "Every night she sits on your lid and reads to you. You don't understand most of it. You understand the voice."
        w "Good box."
        "You have eaten a great many things. None of them felt like this."
        if m.flags.get("pell_spared"):
            "Sometimes Pell visits. They bring sandwiches. You let them sit on you."

    elif m.companion == "reformer" and m.flags.get("hesk_spared"):
        $ ending_name = "The Honest Chest"
        show wren at wren_side
        "Sister Hesk comes down to the vault with four sisters and a great deal of salt. She uses none of it."
        "They take the eight holy symbols home. They leave a sign by the waterfall: {i}A CHEST LIVES HERE. BE POLITE.{/i}"
        "Most visitors are polite. You let them pass. Wren keeps count."
        w "That's three hundred and twelve. You're basically a saint."
        "The rude ones... well. You're mostly reformed."

    elif m.companion == "reformer":
        $ ending_name = "Mostly Reformed"
        show wren at wren_side
        "Wren stays. She doesn't read you the ethics book any more."
        "One morning she asks if you'd like to see the sea. You don't know what the sea is. You go anyway."
        "On the Forest Road, you let every traveller pass. Every single one. Wren doesn't say anything. She doesn't have to."

    else:
        $ ending_name = "Apex"
        "The vault is yours. The gold is yours. The quiet is yours."
        sy "[[Title held: Trust Issues.]"
        "Weeks later, footsteps. A young voice, echoing off the gold."
        if m.flags.get("pell_spared"):
            pell "Wren? Wren, are you down here? I made Level five. I came back for you."
        else:
            "A recruit with a brand-new backpack, calling a name you recognise. They have a notebook just like hers."
        "You open your lid, just a crack. Glinting. Inviting."
        "Everybody loves a large chest."

    call show_msgs
    hide screen hud
    scene black
    with fade
    centered "{size=+18}{color=#ffd98a}Ending: [ending_name]{/color}{/size}"
    call screen ending_card
    centered "{size=+10}Thank you for playing.{/size}\n\n{color=#9ff3ff}[[The System is relieved.]{/color}"
    return
