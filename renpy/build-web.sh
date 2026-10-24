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

step() { echo; echo "== $*"; }
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
"$SDK/renpy.sh" "$SDK/launcher" generate_gui "$PROJECT" --start \
  --width 1920 --height 1080 --accent "#d9a441" --template "$SDK/gui" || fail "generate_gui"
cp -r "$ROOT/renpy/game/." "$PROJECT/game/"
sed -i 's/^define config.name = .*/define config.name = _("Contents May Vary")/' "$PROJECT/game/options.rpy"
sed -i 's/^define build.name = .*/define build.name = "ContentsMayVary"/' "$PROJECT/game/options.rpy"
echo "Project files: $(ls "$PROJECT/game" | tr '\n' ' ')"

step "Ren'Py lint"
"$SDK/renpy.sh" "$PROJECT" lint "$WORK/lint.txt"
LINT=$?
[ -f "$WORK/lint.txt" ] && cat "$WORK/lint.txt"
echo "lint exit code: $LINT"
if [ -f "$PROJECT/traceback.txt" ]; then echo "-- traceback.txt"; cat "$PROJECT/traceback.txt"; fi
if [ -f "$PROJECT/errors.txt" ]; then echo "-- errors.txt"; cat "$PROJECT/errors.txt"; fi
[ $LINT -eq 0 ] || fail "lint found errors"

step "Web build"
rm -rf "$OUT"
"$SDK/renpy.sh" "$SDK/launcher" web_build "$PROJECT" --destination "$OUT" || fail "web_build"
[ -f "$OUT/index.html" ] || fail "web build produced no index.html"
echo "Built: $(du -sh "$OUT" | cut -f1) in $OUT"
ls "$OUT"

echo; echo "BUILD OK"
