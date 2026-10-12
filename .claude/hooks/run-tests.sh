#!/bin/bash
# PostToolUse hook: run the unit tests after Claude edits code in src/.
# On failure, exit 2 so the test output goes back to Claude to fix.
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */src/*.ts|*/src/*.astro|*/src/*.js|*/src/*.mjs) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out=$(npm test --silent 2>&1); then
  echo "Unit tests failed after editing $file:" >&2
  echo "$out" | tail -40 >&2
  exit 2
fi
exit 0
