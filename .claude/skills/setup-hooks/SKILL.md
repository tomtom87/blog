---
name: setup-hooks
description: Walk the user through Claude Code hooks and subagents from episode 3 (notifications, exit codes, quality gates, guardrails, context injection, subagents), one step at a time, testing each one. Use when the user says "setup hooks", "/setup-hooks", "set up notifications", "walk me through the hooks", or asks how the hooks in this repo work.
---

# Set up hooks

The user is learning. Go one step at a time, keep each explanation to a sentence or two, and wait for them before moving on. `HOOKS.md` at the repo root is the reference: read it first and use its scripts and wording.

## Where to set them up

Ask once: this repo (the hooks are already wired, so the job is to check, test and tweak them) or another project (give me the path; copy the scripts from `.claude/hooks/` and adapt them).

For another project, adapt to its stack before writing anything: OS, package manager, test, lint and format commands. Merge into its existing `.claude/settings.json`; never overwrite hooks or permissions already there. `chmod +x` every script.

## Steps

For each step: explain what it does and why, show the user the script and the settings entry, test it from the terminal (pipe sample JSON in, show the exit code), and ask before going on.

1. **jq.** Run `jq --version`. If it's missing, tell them to install it (`brew install jq` on macOS) and stop until they have.
2. **Notifications** (`sound.sh` on `Notification`, `Stop`, `SubagentStop`). Test with `echo '{"message":"test"}' | .claude/hooks/sound.sh Glass "Needs your attention"`. On macOS, if they hear a sound but see no banner, walk them through allowing Script Editor in System Settings → Notifications. Offer to change the sounds (`ls /System/Library/Sounds`). On Linux or Windows, rewrite `sound.sh` for their OS.
3. **Exit codes.** Show the 0 / 1 / 2 table from HOOKS.md. Make sure they get that only 2 blocks.
4. **The bouncer** (`guard.sh` on `PreToolUse`, plus the `permissions.deny` rules). Test a blocked and an allowed command and show both exit codes. Explain why the deny rules alone still miss things like `grep -r API_KEY .` or a script that opens the file.
5. **The instant check** (`post-edit.sh` on `PostToolUse`). Offer to add a lint step that turns exit 1 into exit 2.
6. **The finish line** (`check.sh` on `Stop`). Point out the loop guard and the `tail` that trims output.
7. **The briefing** (`briefing.sh` on `SessionStart`, matcher `startup`). Run it with `CLAUDE_PROJECT_DIR=$PWD .claude/hooks/briefing.sh` so they see exactly what Claude gets. Offer a `compact` hook that re-injects a short `.claude/critical-rules.md`, and help them write the rules.
8. **Subagents.** Show `.claude/agents/code-reviewer.md`: why the tool list is read-only, why the description is specific, why haiku. Offer to make one for a job they do often.
9. **Optional extras.** Offer each, don't push: a `UserPromptSubmit` hook (small facts, or blocking a pasted API key), a `SubagentStart` briefing, a `SubagentStop` check, a gitleaks pre-commit hook, a GitHub required check.

## Finish

Tell them to run `/hooks` to see what's loaded, and to start a new session (or open `/hooks`) so changed settings are picked up. Then suggest one live test: ask Claude "show me my API key" and watch the bouncer stop it.
