#!/bin/bash
# PostToolUse hook: run the unit tests after Claude edits code in src/.
# On failure, exit 2 so the test output goes back to Claude to fix.
# On pass, if the edit was visual (.astro/.css/image), screenshot the home page
# into snapshots/, keeping only the last two.
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */src/*.ts|*/src/*.js|*/src/*.mjs) visual=0 ;;
  */src/*.astro|*/src/*.css|*/src/assets/*) visual=1 ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out=$(npm test --silent 2>&1); then
  echo "Unit tests failed after editing $file:" >&2
  echo "$out" | tail -40 >&2
  exit 2
fi
[ "$visual" = 1 ] || exit 0

chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$chrome" ] || exit 0

url=$(npx astro dev status 2>/dev/null | grep -o 'http://localhost:[0-9]*')
if [ -z "$url" ]; then
  npx astro dev --background >/dev/null 2>&1
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 1
    url=$(npx astro dev status 2>/dev/null | grep -o 'http://localhost:[0-9]*') && break
  done
fi
[ -n "$url" ] || exit 0

mkdir -p snapshots
shot="snapshots/$(date +%Y%m%d-%H%M%S)-$(basename "$file" | tr . -).png"
"$chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --virtual-time-budget=3000 --screenshot="$PWD/$shot" "$url/" >/dev/null 2>&1
ls -t snapshots/*.png 2>/dev/null | tail -n +3 | xargs rm -f
echo "Tests passed; screenshot saved to $shot"
exit 0
