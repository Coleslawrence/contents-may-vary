# Contents May Vary

A phone-first mimic idle game. Lure visitors, stick to them, swallow them, and become what you eat.

## Play on iPhone

1. Open the game's GitHub Pages address in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open it from the new icon. It runs full screen and works offline.

Your save lives on the device. To move it, open **Settings → Back up your save**, copy the code, then use **Restore from a code** on the other device. The Home Screen app and Safari keep separate saves, so back up before switching.

## Project layout

| Path | What it is |
| --- | --- |
| `src/engine.js` | Game rules and data, no screen code |
| `src/helpers.js` | Odds, advice, self-managing stomach, timers |
| `src/ui.js`, `src/art.js`, `src/style.css` | Screens and drawing |
| `src/sw.js` | Offline support |
| `build.py` | Builds `dist/` (the app) and `preview.html` (a Claude artifact preview) |
| `tools/pace.js` | Simulates days of play and checks the balance targets |
| `tools/fit.js`, `tools/cut.js` | Check every screen fits phones and no text is cut off |
| `tools/pwa.js` | Checks install files, offline play and save codes |

## Build and test

```
python3 build.py
node tools/pace.js 24 18
(cd dist && python3 -m http.server 8765) &
node tools/fit.js && node tools/cut.js && node tools/pwa.js
```

The tests use Playwright with Chromium.

## Credits

See `CREDITS.md`.
