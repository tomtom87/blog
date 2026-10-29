#!/bin/bash
# PreToolUse hook, "the bouncer": runs before every Read/Edit/Write/Bash/Grep
# call. Exit 2 blocks the call and hands the stderr message to Claude.
# Blocks .env files (any route, including `cat .env`), recursive force-deletes,
# and skipping git hooks with --no-verify.
INPUT=$(cat)
# Check every field a tool might use to reach a file
TARGET=$(echo "$INPUT" | jq -r '[.tool_input.file_path, .tool_input.path, .tool_input.command, .tool_input.pattern] | map(select(. != null)) | join(" ")')

if echo "$TARGET" | grep -qE '(^|[/ "'\''])\.env(\.|$|[ "'\''])'; then
  echo "Blocked: .env files are off-limits. Do not try another way to read them. Ask the user for the value you need." >&2
  exit 2
fi
if echo "$TARGET" | grep -qE 'rm +-[a-zA-Z]*(rf|fr)'; then
  echo "Blocked: recursive force-delete. Delete specific files instead, or ask the user." >&2
  exit 2
fi
if echo "$TARGET" | grep -qE -- '--no-verify|git commit -n( |$)'; then
  echo "Blocked: don't bypass git hooks. Fix the failure they report instead." >&2
  exit 2
fi
exit 0
