# Contents May Vary — Ren'Py edition

A story game about a mimic. You wake up as a box, lure visitors with bait and disguises, stick to them, swallow them, and become what you eat. Same rules as the web game (D&D-style d20 rolls, evolutions, essence, digesting items, Wren's four paths, Sister Hesk, the Rival Mimic), told in chapters with five endings.

## Set it up (about 5 minutes, on a computer)

1. Install **Ren'Py 8** from renpy.org (8.3 or newer).
2. Open the Ren'Py launcher and choose **Create New Project**.
   - Name it `Contents May Vary`.
   - Pick **1920×1080** for the resolution.
   - Pick any colour scheme (a gold or brown one suits the art).
3. In the launcher, click **game** under "Open Directory" to open the new project's `game` folder.
4. Copy everything from this download's `game` folder into it. Say **yes** to replacing `script.rpy` and the three pictures in `gui/` (the title screen, menu background and window icon).
5. Back in the launcher, click **Launch Project**.

Other resolutions work too (everything scales), but the art was drawn for 1920×1080.

## How to play

- **Wait for a visitor** to start an encounter. Each wait makes you a little hungrier and lets you heal a bit.
- Before a visitor reaches you: **Read them** (learn what they want), pick a **disguise** and **bait** that match, then **Lure them in**. Beat their Perception and they touch you: surprise round, and they're stuck to you.
- In a fight: **Tongue Lash** grabs them, **Swallow** puts them inside you (if they're small enough), then **Clench** each turn while your acid works. Bigger evolutions swallow bigger things.
- The panel on the left is you (HP, Belly, XP, Notoriety). Tap **Inside** to see your stomach: set bait, attune items, eat food, digest items for permanent traits, fuse three of a kind. Tap **Sheet** for your full stats.
- The panels on the right are the visitor and your last dice roll.
- Lose a story fight (Sister Hesk, the Rival Mimic) and you simply try again. Shatter in an ordinary fight and you choose: retry, or accept the loss and carry on.

## Play in a browser (including iPhone)

https://coleslawrence.github.io/contents-may-vary/renpy/

A GitHub Action (`.github/workflows/renpy-web.yml`) rebuilds this web version whenever anything in `renpy/` changes. It also runs Ren'Py's lint check and saves the result to `docs/renpy-build-report.txt`. In Safari, Share → Add to Home Screen to open it like an app.

## What's in `game/`

| File | What it is |
| --- | --- |
| `script.rpy` | The story: prologue, Pell, Wren, evolutions, Sister Hesk, the Hidden Vault, endings |
| `cmv_play.rpy` | The hub between visitors and the encounter loop |
| `cmv_engine.rpy` | Game rules: the mimic, rolls, combat, items, growth |
| `cmv_data.rpy` | Tables: visitors, items, forms, evolutions, regions, titles |
| `cmv_screens.rpy` | Panels, dice, stomach, character sheet, ending card |
| `cmv_style.rpy` | Characters, positions, animations, image definitions |
| `cmv_overrides.rpy` | Small tweaks to the standard Ren'Py menus and fonts |
| `images/`, `fonts/`, `gui/` | Art and fonts |

Numbers worth tweaking live at the top of `cmv_data.rpy`: `XP_MULT`, `XP_AT` (level thresholds) and `ESS_AT` (how much eating unlocks a trait).

See `CREDITS.md` for licences.
