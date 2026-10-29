#!/bin/bash
# Stop hook: when Claude finishes with uncommitted site changes, run tests and
# the production build. Exit 2 sends failures back so Claude keeps working
# (no sound); otherwise play the finished sound.
# ponytail: runs every turn while changes are uncommitted; add a stamp file if the build is too slow.
[ "$(jq -r '.stop_hook_active // false')" = true ] && { "$(dirname "$0")/sound.sh" Hero "Task finished"; exit 0; }
cd "$CLAUDE_PROJECT_DIR" || exit 0

if [ -n "$(git status --porcelain src astro.config.mjs 2>/dev/null)" ]; then
  for cmd in "npm test --silent" "npm run build --silent"; do
    if ! out=$($cmd 2>&1); then
      echo "'$cmd' failed:" >&2
      echo "$out" | tail -40 >&2
      exit 2
    fi
  done
fi
"$(dirname "$0")/sound.sh" Hero "Task finished"
