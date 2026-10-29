#!/bin/bash
# PostToolUse hook: format the edited file with Prettier. If the edit was
# visual (.astro/.css/asset), screenshot the edited page into snapshots/ so
# design changes can be compared against earlier versions (last 10 per file).
file=$(jq -r '.tool_input.file_path // empty')
cd "$CLAUDE_PROJECT_DIR" || exit 0

case "$file" in
  */src/*.ts|*/src/*.js|*/src/*.mjs|*/src/*.astro|*/src/*.css|*/src/*.md) npx prettier --write "$file" >/dev/null 2>&1 ;;
esac

case "$file" in
  */src/*.astro|*/src/*.css|*/src/assets/*) ;;
  *) exit 0 ;;
esac

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

# Screenshot the edited page itself; components, layouts, CSS and dynamic
# routes fall back to the home page.
# ponytail: dynamic routes ([slug]) shot as home, map to a real post if needed
path=/
case "$file" in
  */src/pages/*\[*) ;;
  */src/pages/*.astro)
    path=${file#*/src/pages}
    path=${path%.astro}
    path=${path%index} ;;
esac

mkdir -p snapshots
name=$(basename "$file" | tr . -)
shot="snapshots/$(date +%Y%m%d-%H%M%S)-$name.png"
"$chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --virtual-time-budget=3000 --screenshot="$PWD/$shot" "$url$path" >/dev/null 2>&1
[ -f "$shot" ] || exit 0
ls -t snapshots/*-"$name".png | tail -n +11 | xargs rm -f

review=$("$(dirname "$0")/review-shot.sh" "$shot" "$name")
jq -n --arg m "Screenshot of $path saved to $shot (earlier versions are in snapshots/). $review" \
  '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
