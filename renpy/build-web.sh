#!/usr/bin/env bash
# Builds the Ren'Py edition into docs/renpy/ (used by the GitHub Action).
# Downloads Ren'Py, creates a 1920x1080 project around renpy/game, runs
# Ren'Py's lint check, then makes the web build.
set -u -o pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/build"
PROJECT="$WORK/ContentsMayVary"
OUT="$ROOT/docs/renpy"
mkdir -p "$WORK"
cd "$WORK"

echo "== Ren'Py web build report, $(date -u)"

step() { echo; echo "== $(date -u +%H:%M:%S) $*"; }

# Run a command with a time limit, killing everything it started if it overruns.
limited() {
  local t=$1; shift
  setsid "$@" &
  local pid=$!
  ( sleep "$t"; echo "(timed out after ${t}s)"; kill -TERM -"$pid" 2>/dev/null; sleep 5; kill -KILL -"$pid" 2>/dev/null ) &
  local watch=$!
  wait "$pid"; local rc=$?
  kill "$watch" 2>/dev/null; wait "$watch" 2>/dev/null
  return $rc
}
fail() { echo; echo "BUILD FAILED: $*"; exit 1; }

step "Choosing a Ren'Py version"
if [ -z "${RENPY_VERSION:-}" ]; then
  # Newest stable version listed on renpy.org/dl that also has web support.
  CANDIDATES=$(curl -fsSL https://www.renpy.org/dl/ | grep -oE 'href="[0-9]+\.[0-9]+\.[0-9]+/' | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | sort -t. -k1,1nr -k2,2nr -k3,3nr | uniq | head -12)
  echo "Recent versions: $(echo $CANDIDATES)"
  for V in $CANDIDATES; do
    if curl -fsIL "https://www.renpy.org/dl/$V/renpy-$V-web.zip" >/dev/null 2>&1 && \
       curl -fsIL "https://www.renpy.org/dl/$V/renpy-$V-sdk.tar.bz2" >/dev/null 2>&1; then
      RENPY_VERSION="$V"; break
    fi
  done
fi
[ -n "${RENPY_VERSION:-}" ] || fail "couldn't find a Ren'Py version with web support"
V="$RENPY_VERSION"
echo "Using Ren'Py $V"

step "Downloading Ren'Py $V"
curl -fsSL -o sdk.tar.bz2 "https://www.renpy.org/dl/$V/renpy-$V-sdk.tar.bz2" || fail "SDK download"
tar xjf sdk.tar.bz2 || fail "SDK unpack"
SDK="$WORK/renpy-$V-sdk"
[ -x "$SDK/renpy.sh" ] || fail "no renpy.sh in $SDK"
curl -fsSL -o web.zip "https://www.renpy.org/dl/$V/renpy-$V-web.zip" || fail "web support download"
rm -rf webtmp && unzip -q web.zip -d webtmp || fail "web support unpack"
HASH=$(find webtmp -name hash.txt | grep '/web/hash.txt$' | head -1)
[ -n "$HASH" ] || { find webtmp -maxdepth 3 | head -30; fail "couldn't find web/ in the web support zip"; }
rm -rf "$SDK/web" && mv "$(dirname "$HASH")" "$SDK/web"
echo "SDK ready: $(ls "$SDK" | tr '\n' ' ')"

step "Creating the project"
rm -rf "$PROJECT" && mkdir -p "$PROJECT/game"
# The template's fixed images (menu buttons, bars, sliders, scrollbars) are
# copied by the launcher when it makes a new project; generate_gui on its own
# doesn't. If this SDK's template has none yet, let it generate them first.
if [ ! -f "$SDK/gui/game/gui/button/idle_background.png" ]; then
  echo "Template has no button images yet; generating them."
  limited 300 "$SDK/renpy.sh" "$SDK/gui" lint > /dev/null 2>&1
fi
cp -r "$SDK/gui/game/gui" "$PROJECT/game/gui"
"$SDK/renpy.sh" "$SDK/launcher" generate_gui "$PROJECT" --start \
  --width 1920 --height 1080 --accent "#d9a441" --template "$SDK/gui" || fail "generate_gui"
cp -r "$ROOT/renpy/game/." "$PROJECT/game/"
cp "$ROOT/renpy/web-smoke-test.rpy" "$PROJECT/game/testcases.rpy"
MISSING=""
for f in button/idle_background.png button/hover_background.png bar/left.png bar/right.png \
         slider/horizontal_idle_bar.png scrollbar/vertical_idle_bar.png button/choice_idle_background.png; do
  [ -f "$PROJECT/game/gui/$f" ] || MISSING="$MISSING $f"
done
echo "GUI images: $(cd "$PROJECT/game/gui" && find . -name '*.png' | wc -l) files"
[ -z "$MISSING" ] || fail "GUI images missing:$MISSING"
sed -i 's/^define config.name = .*/define config.name = _("Contents May Vary")/' "$PROJECT/game/options.rpy"
sed -i 's/^define build.name = .*/define build.name = "ContentsMayVary"/' "$PROJECT/game/options.rpy"
echo "Project files: $(ls "$PROJECT/game" | tr '\n' ' ')"

step "Ren'Py lint"
limited 300 "$SDK/renpy.sh" "$PROJECT" lint "$WORK/lint.txt"
LINT=$?
[ -f "$WORK/lint.txt" ] && cat "$WORK/lint.txt"
echo "lint exit code: $LINT"
if [ -f "$PROJECT/traceback.txt" ]; then echo "-- traceback.txt"; cat "$PROJECT/traceback.txt"; fi
if [ -f "$PROJECT/errors.txt" ]; then echo "-- errors.txt"; cat "$PROJECT/errors.txt"; fi
[ $LINT -eq 0 ] || fail "lint found errors"

step "Web build"
rm -rf "$OUT"
limited 900 "$SDK/renpy.sh" "$SDK/launcher" web_build "$PROJECT" --destination "$OUT" > "$WORK/web.txt" 2>&1
WEB=$?
tr '\r' '\n' < "$WORK/web.txt" | grep -vE ' - [0-9]+ of [0-9]+$'
[ $WEB -eq 0 ] || fail "web_build"
[ -f "$OUT/index.html" ] || fail "web build produced no index.html"
echo "Built: $(du -sh "$OUT" | cut -f1) in $OUT"
ls "$OUT"

step "Smoke test: playing the opening on a virtual screen"
# Ren'Py needs real graphics to play, so give it a virtual X display.
# The web build above is published whatever happens here; a failure is
# reported at the end of this file.
rm -f "$PROJECT/traceback.txt"
SMOKE="passed"
( unset SDL_VIDEODRIVER
  limited 300 xvfb-run -a -s "-screen 0 1920x1080x24" "$SDK/renpy.sh" "$PROJECT" test --report-detailed ) > "$WORK/test.txt" 2>&1
TEST=$?
tr '\r' '\n' < "$WORK/test.txt" | tail -80
echo "test exit code: $TEST"
if [ -f "$PROJECT/traceback.txt" ]; then echo "-- traceback.txt"; cat "$PROJECT/traceback.txt"; SMOKE="CRASHED"; fi
[ $TEST -eq 0 ] || [ "$SMOKE" != "passed" ] || SMOKE="FAILED (exit $TEST)"
echo "Smoke test: $SMOKE"

if [ "$SMOKE" = "passed" ]; then echo; echo "BUILD OK"; else echo; echo "BUILD PUBLISHED, BUT SMOKE TEST $SMOKE"; exit 2; fi
