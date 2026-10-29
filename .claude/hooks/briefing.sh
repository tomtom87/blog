#!/bin/bash
# SessionStart hook (startup): print where we left off. Whatever this prints
# on stdout is added to Claude's context before your first message.
cd "$CLAUDE_PROJECT_DIR" || exit 0
echo "## Where we left off"
echo "Branch: $(git branch --show-current)"
echo "Uncommitted:"; git status --short | head -10
echo "Last commits:"; git log --oneline -5
echo "Drafts:"; grep -l '^draft: true' src/content/blog/*.md 2>/dev/null | head -5
exit 0
