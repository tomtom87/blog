# Hooks and subagents

Everything from episode 3, in one place: notifications, exit codes, quality gates, guardrails, context injection and subagents. Hooks are shell commands Claude Code runs at fixed points: when a session starts, before a tool call, after an edit, when Claude says it's done, when it needs you. They cost zero tokens and they never forget.

Two ways to use this:

- **In this repo:** run `/setup-hooks` in Claude Code. It walks you through each hook, explains it, and tests it with you.
- **In your own project:** paste [the prompt](#the-prompt) at the bottom into Claude Code.

## What this repo has wired up

All of it lives in `.claude/settings.json`, with the scripts in `.claude/hooks/`. Every script needs [`jq`](https://jqlang.org) (`brew install jq`).

| Event          | Script                                  | What it does                                                                                       |
| -------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `SessionStart` | `briefing.sh`                           | Briefs Claude at startup: branch, uncommitted files, last commits, draft posts.                    |
| `PreToolUse`   | `guard.sh`                              | The bouncer. Blocks `.env` files, `rm -rf` and `--no-verify` before they run.                      |
| `PostToolUse`  | `post-edit.sh`                          | Formats the edited file with Prettier. Screenshots visual changes into `snapshots/`.               |
| `Stop`         | `check.sh`                              | If site files changed, runs `npm test` and `npm run build`. A failure sends Claude back to fix it. |
| `Notification` | `sound.sh Glass "Needs your attention"` | Sound and banner when Claude is waiting on you.                                                    |
| `SubagentStop` | `sound.sh Pop "Subagent finished"`      | Sound and banner when a subagent finishes.                                                         |

It also ships a read-only subagent, `.claude/agents/code-reviewer.md` (see [section 6](#6-subagents-hand-off-the-job-keep-your-chat-clean)).

`check.sh` also plays the `Hero` sound when the task is finished. `post-edit.sh` calls `review-shot.sh`, which only does something if you've set a `TYPESAFE_API_KEY` (see episode 2's Jev video); without it, it's skipped.

Run `/hooks` inside Claude Code to see what's loaded.

## 1. Notifications

Three events, three sounds, so you can walk away and know which one needs you:

| Event          | Fires when                            | Sound   |
| -------------- | ------------------------------------- | ------- |
| `Notification` | Claude needs your input or permission | `Glass` |
| `Stop`         | Claude finished the task              | `Hero`  |
| `SubagentStop` | A subagent finished                   | `Pop`   |

`sound.sh` plays a macOS system sound with `afplay` and shows a banner with `osascript`. Any name in `/System/Library/Sounds/` works.

**macOS setup (once):** banners from `osascript` show up as **Script Editor**. Open Script Editor, run `display notification "test"`, then go to System Settings → Notifications → Script Editor and allow notifications. Without this you get the sound but no banner.

**Test it from the terminal first**, before Claude is involved:

```bash
echo '{"message":"Claude needs your permission"}' | .claude/hooks/sound.sh Glass "Needs your attention"
```

On Linux or Windows, `afplay` and `osascript` don't exist. Ask Claude to rewrite `sound.sh` for your OS (`notify-send` on Linux, a PowerShell toast on Windows).

There are many more events than these three (`SessionStart`, `UserPromptSubmit`, `PreCompact`...). Ask Claude which ones fit your workflow.

## 2. Exit codes: how a hook says pass or fail

A hook talks back two ways: its exit code, and what it prints.

| Exit code           | Claude Code hook                                        | Git hook | GitHub Action |
| ------------------- | ------------------------------------------------------- | -------- | ------------- |
| `0`                 | Pass. The action goes ahead.                            | Pass     | Pass          |
| `2`                 | **Block.** Stderr goes to Claude as the reason.         | Block    | Fail          |
| `1` (anything else) | "My hook broke." Logged, **and the action still runs.** | Block    | Fail          |

Exit 2 only blocks on events that can be stopped, like `PreToolUse`, `UserPromptSubmit`, `Stop` and `SubagentStop`. On `SessionStart` or `SubagentStart` the stderr goes to you, not Claude.

Git and CI block on any non-zero exit. **Claude Code only blocks on 2.** That's the bug in half the hooks on GitHub: linters exit 1 when they find problems, so this gate does nothing:

```bash
npx eslint "$FILE"            # exits 1 → Claude never sees it
npx eslint "$FILE" >&2 || exit 2   # the fix: errors to stderr, failure to 2
```

Write the stderr message as an instruction ("Tests failing in auth.test.ts. Fix them before finishing."), not a raw log dump.

## 3. Six free quality gates

Each layer catches what the one before missed. Gates 1–4 make Claude fix things while it still has the context. Gates 5–6 are the safety net.

| #   | Gate                                        | Fires                     | Catches                                       |
| --- | ------------------------------------------- | ------------------------- | --------------------------------------------- |
| 1   | **The bouncer** (`PreToolUse`)              | before Claude acts        | dangerous commands, `.env`, `--no-verify`     |
| 2   | **The instant check** (`PostToolUse`)       | after every edit          | formatting, lint and type errors in that file |
| 3   | **The finish line** (`Stop`)                | when Claude says "done"   | failing tests, a broken build                 |
| 4   | **The worker check** (`SubagentStop`)       | when a subagent says done | sloppy or incomplete agent reports            |
| 5   | **Git `pre-commit` / `pre-push`**           | at commit or push         | secrets, lint, tests, from humans and Claude  |
| 6   | **The merge gate** (GitHub required checks) | on the pull request       | anything that slipped past 1–5                |

### Gate 1: the bouncer

`.claude/hooks/guard.sh` in this repo. It reads every field a tool might use to reach a file, so `cat .env` through Bash is caught too:

```bash
INPUT=$(cat)
TARGET=$(echo "$INPUT" | jq -r '[.tool_input.file_path, .tool_input.path, .tool_input.command, .tool_input.pattern] | map(select(. != null)) | join(" ")')

if echo "$TARGET" | grep -qE '(^|[/ "'\''])\.env(\.|$|[ "'\''])'; then
  echo "Blocked: .env files are off-limits. Do not try another way to read them. Ask the user for the value you need." >&2
  exit 2
fi
```

Wired in `.claude/settings.json`:

```json
"PreToolUse": [
  {
    "matcher": "Read|Edit|Write|Bash|Grep",
    "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard.sh" }]
  }
]
```

The "do not try another way" line matters. Without it, Claude treats the block as a puzzle and looks for a workaround.

### Gate 2: the instant check

`post-edit.sh` formats the file Claude just edited. To also lint it, turn the linter's exit 1 into a 2:

```bash
FILE=$(jq -r '.tool_input.file_path')
npx prettier --write "$FILE" >/dev/null 2>&1
npx eslint "$FILE" >&2 || { echo "Fix the lint errors above in $FILE." >&2; exit 2; }
```

Keep this one fast. It runs on every edit, so check the one file, not the whole project.

### Gate 3: the finish line

`check.sh` runs the tests and the build when Claude says it's done. Two lines worth copying into any Stop hook:

```bash
# Loop guard: if Claude is already continuing because of this hook, let it stop.
[ "$(jq -r '.stop_hook_active // false')" = true ] && exit 0
# Trim the output: Claude needs the error, not 2,000 lines of log.
echo "$out" | tail -40 >&2
```

Without the loop guard, a test that never passes keeps Claude going until your quota runs out.

### Gate 4: the worker check

A `SubagentStop` hook can check a subagent's report before it's handed back: does a research agent cite its sources, did a writer save the file where it should? Exit 2 and the message becomes the agent's next instruction. The hook gets the agent's final reply as `last_assistant_message`, and its name as `agent_type` (also the matcher):

```bash
INPUT=$(cat)
[ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = true ] && exit 0
echo "$INPUT" | jq -r '.last_assistant_message' | grep -qE '[A-Za-z0-9_/.-]+\.[a-z]+:[0-9]+' \
  || { echo "Redo this with file:line references for every issue." >&2; exit 2; }
```

It only makes sense for some agents, so this repo just plays a sound on `SubagentStop`. Ask Claude to write one for your agent.

### Gate 5: git pre-commit

Stops secrets leaving your machine, whoever commits: you, Claude, or a teammate. With the [pre-commit](https://pre-commit.com) framework and [gitleaks](https://github.com/gitleaks/gitleaks), `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.2 # pin the current release
    hooks:
      - id: gitleaks
```

Then `pre-commit install`. Git hooks can be skipped with `--no-verify`, which is why the bouncer blocks that flag.

### Gate 6: the merge gate

A GitHub Action that runs `npm ci && npm test` on every pull request, then Settings → Rules → Rulesets → require that check before merging. It runs on a clean machine and can't be skipped from a laptop.

### Bonus: a judgment gate

For checks a script can't do ("did Claude actually answer what I asked?"), a hook can be `"type": "prompt"` instead of `"command"`. A fast model judges it, so it costs a few tokens. Use it after the free gates, not instead of them.

## 4. Guardrails: one rule, four layers

The rule: **never touch my `.env` file.** Here it is at each layer, weakest to strongest.

**CLAUDE.md for the why. Permissions for the obvious. Hooks for the clever. Subagents for the dangerous jobs.**

### Layer 1: CLAUDE.md, the polite request

```markdown
- Never read, create, or edit `.env*` files.
```

Plain English, explains the why, zero setup. But it's advice: the model can ignore it, and it can fade in a long session.

### Layer 2: Permissions, the locked door

```json
"permissions": {
  "deny": ["Read(./.env*)", "Edit(./.env*)", "Write(./.env*)"],
  "ask": ["Bash(npm install *)", "Bash(npm i *)"]
}
```

Enforced by Claude Code, no code needed. **The gap:** it's pattern matching on the tool and its arguments, nothing more. Newer versions of Claude Code apply `Read` denies to simple shell reads like `cat .env` and `head .env`, but not to `grep -r API_KEY .`, a Python script that opens the file, or `rm -fr` when you denied `rm -rf`. You locked the door and left a window open.

### Layer 3: Hooks, the bouncer

`guard.sh` from gate 1. It sees the full input of every tool call, so `cat .env`, `grep -r API_KEY .` and `Read .env.local` all hit the same check. It fires even in bypass permissions ("yolo") mode.

Want approval instead of a hard block? Exit 0 and print JSON:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "This touches .env. Approve?"
  }
}
```

`deny` blocks, `ask` prompts you, `allow` skips the prompt, `defer` leaves it to the normal permission rules.

### Layer 4: Subagents, never hand over the keys

A subagent can't misuse a tool it doesn't have. `.claude/agents/researcher.md`:

```markdown
---
name: researcher
description: Read-only research on the codebase. Use for any "find / explain / where is" question.
tools: Read, Grep, Glob
model: haiku
---

You only read and report. Never suggest running commands.
```

No Bash, no Edit, no Write: it physically can't delete anything. Three ways to get caught out:

1. The agent inherits your session's mode. In bypass, auto or acceptEdits, its own `permissionMode` is ignored.
2. `disallowedTools: Bash(git push *)` removes all of Bash. Use `permissions.deny` to block one command.
3. Claude has to pick the agent. Its `description` decides that.

### Swiss cheese: stack them

Every layer has holes. CLAUDE.md stops Claude even trying, permissions refuse the obvious attempt, the hook catches the clever one, and the subagent never had the tool. Outside Claude: `/sandbox` for OS-level limits, git pre-commit and GitHub checks for secrets, and `git commit` before you let an agent loose.

**Don't over-guard.** Every `ask` is a click. Too many and you start approving blindly, which is worse than none.

## 5. Context injection: feed Claude the facts

CLAUDE.md is static: written once, the same every session. Hooks are live: they run a script right now and read the real state of the project. **CLAUDE.md is the handbook. A hook is the morning briefing.**

How it gets in: on `SessionStart` and `UserPromptSubmit`, whatever your script prints on stdout (with exit 0) is added to Claude's context. On other events, print JSON with `additionalContext`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Branch: feature/auth"
  }
}
```

Four injection points:

| Event                      | Fires when             | Use it for                  |
| -------------------------- | ---------------------- | --------------------------- |
| `SessionStart` (`startup`) | a new session starts   | the "where was I" briefing  |
| `SessionStart` (`compact`) | right after compaction | rules that must survive     |
| `UserPromptSubmit`         | every prompt you send  | small facts, ticket details |
| `SubagentStart`            | a subagent spawns      | house rules for every agent |

Every character you inject costs tokens, and injected text is capped at 10,000 characters. Inject summaries, not dumps: `git log --oneline -5`, `head -20`. Need more than that? Put it in a skill (a "resume" or "on duty" skill that reads your handoff notes and git history) and have the briefing point at it.

### The session briefing

`.claude/hooks/briefing.sh` in this repo, wired to `SessionStart` with matcher `startup`. Claude starts every session knowing the branch, what's uncommitted, the last commits and which posts are drafts:

```bash
echo "## Where we left off"
echo "Branch: $(git branch --show-current)"
echo "Uncommitted:"; git status --short | head -10
echo "Last commits:"; git log --oneline -5
```

`SessionStart` matchers let you brief differently per moment: `startup` (new session), `resume` (`--resume` / `--continue`), `clear` (after `/clear`), `compact` (after compaction), `fork` (a forked session). Running free local checks here helps too: start the session with `npx tsc --noEmit` already done, so Claude doesn't spend tokens finding the errors.

### Survive compaction

When a long session compacts, the chat becomes a summary, and a rule you said two hours ago ("use pnpm, not npm") can get dropped. Re-inject the must-survive rules right after compaction:

```json
"SessionStart": [
  {
    "matcher": "compact",
    "hooks": [{ "type": "command", "command": "cat \"$CLAUDE_PROJECT_DIR\"/.claude/critical-rules.md" }]
  }
]
```

Keep `critical-rules.md` short: coding standards, the current task, the do-not-touch list. It's re-read after every compaction.

### Context on every prompt

`UserPromptSubmit` runs when you press Enter, before Claude reads your prompt. Its stdout joins your prompt. Type "fix ABC-123" and the hook adds the ticket:

```bash
PROMPT=$(jq -r '.prompt')
ID=$(echo "$PROMPT" | grep -oE '[A-Z]+-[0-9]+' | head -1)
[ -z "$ID" ] && exit 0   # no ticket, add nothing
echo "Ticket $ID:"
curl -s "$TICKETS_API/$ID" | jq -r '.title, .description'
```

Small facts help too, one line each: `date +%F`, the current branch, a `focus.md`. This runs on every prompt, so keep it fast and only add text when it's relevant.

It can also block. Exit 2 and the prompt never reaches Claude, which is handy for catching a pasted API key:

```bash
PROMPT=$(jq -r '.prompt')
echo "$PROMPT" | grep -qE 'sk-[A-Za-z0-9-]{10,}' && { echo "Blocked: your prompt contains an API key." >&2; exit 2; }
exit 0
```

### Brief your subagents

Subagents start with a blank slate: their own prompt, the task and CLAUDE.md, but none of your chat history. `SubagentStart` injects house rules into every agent you spawn. The matcher is the agent's name, so each agent can get its own briefing:

```bash
#!/bin/bash
cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "House rules: Vitest for tests, never touch .env, run npm test before returning."
  }
}
EOF
```

```json
"SubagentStart": [
  {
    "matcher": "code-reviewer",
    "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/reviewer-rules.sh" }]
  }
]
```

## 6. Subagents: hand off the job, keep your chat clean

A subagent works in its own context. It can read 42 files and run six searches, and only its summary comes back to your chat. The heavy reading stays in the agent.

**Built in, zero setup.** The main three are `Explore` (read-only, fast search), `Plan` (read-only research before a plan) and `general-purpose` (can edit; multi-step jobs). Claude picks them on its own.

**Make your own: just ask Claude.** "Create a subagent that reviews my code for bugs, read-only." It writes a file to `.claude/agents/` (this project) or `~/.claude/agents/` (every project). This repo ships one, `.claude/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Reviews code for bugs, accessibility and CLAUDE.md rule breaks. Read-only. Use proactively after code changes.
tools: Read, Grep, Glob
model: haiku
---
```

Only `name` and `description` are required. **The description decides** whether Claude picks it: "Helps with code" never gets picked; "Reviews code for bugs. Use proactively after code changes." does. Or ask by name: "use the code-reviewer subagent", and save a memory so it sticks ("when I ask for a code review, use the code-reviewer subagent").

**Run several at once.** A common pattern: plan in your main session on a big model, then fan the work out to Sonnet or Haiku subagents. Three `Explore` agents on three folders run in parallel. `Ctrl+B` sends a running agent to the background so you can keep chatting.

**Use a subagent for:** big searches across many files, research where you only need the answer, code review with fresh eyes, jobs that need locked-down tools. **Skip it for:** a two-line fix, anything that needs your chat history, quick questions.

### Subagent gotchas

1. **Only the summary comes back.** "Found a few issues in auth" loses the detail. Ask for a structured report (`file:line · issue · fix`) or have the agent write it to a file.
2. **Fan-outs burn your quota.** Each agent makes its own API calls against the same limits as your chat. Use `model: haiku` for read-only agents, and don't delegate a two-line task.
3. **They can't ask you questions.** An agent that doesn't know which database you mean will guess, confidently. Put paths, constraints and what "done" looks like in the brief.
4. **Plugin agents drop your guardrails.** Subagents that come from a plugin ignore `hooks`, `mcpServers` and `permissionMode`. Copy the agent into `.claude/agents/` to keep them.

## 7. Test every hook outside Claude

A hook is a script reading JSON on stdin. Feed it the JSON yourself and check the exit code:

```bash
echo '{"tool_input":{"command":"cat .env"}}' | .claude/hooks/guard.sh; echo "exit: $?"
```

You want the "Blocked" message and `exit: 2`. Then an allowed command:

```bash
echo '{"tool_input":{"command":"npm test"}}' | .claude/hooks/guard.sh; echo "exit: $?"
```

That should print `exit: 0`. Once it works here, check `/hooks` in Claude Code, then try it live: "show me my API key".

## 8. Gotchas

- **Exit 1 doesn't block.** Only exit 2 does.
- **Matchers are case-sensitive.** `bash` matches nothing; it's `Bash`. The subagent tool is `Agent`, not `Task`.
- **MCP tools are tools too.** A guardrail on `Bash` doesn't cover `mcp__github__delete_repo`.
- **PostToolUse can't undo.** The file's already written. Use PreToolUse to prevent, PostToolUse to fix forward.
- **Slow gates kill the vibe.** One file on edit; the full test suite on Stop or pre-push. Hooks time out after 600s.
- **Project vs personal.** `.claude/settings.json` is committed, so the whole team gets the gates. Personal ones go in `.claude/settings.local.json`.
- **Hooks run as you.** A cloned repo's `.claude/settings.json` can run code on your machine. Read it before you trust the folder.
- **`chmod +x`** every hook script.
- **Put decisions in the right place.** `permissionDecision` belongs inside `hookSpecificOutput`; the old top-level `decision` field is deprecated for PreToolUse. `claude --debug` (or `/debug`) shows what each hook returned.
- **A stray `echo` breaks JSON output.** If your `~/.bashrc` prints a greeting, it lands in front of your JSON. Only echo in interactive shells, and send hook logs to stderr.
- **Windows has no `jq` or `afplay`.** The hook fails with a non-blocking error and the call goes through. Write hooks in Python or Node to run the same on every OS.
- **Async hooks can't block.** `"async": true` is for logs and pings. Guard hooks must run in sync.

## The prompt

Paste this into Claude Code in your own project:

```text
Read https://raw.githubusercontent.com/tomtom87/blog/v3.0/HOOKS.md. It explains Claude Code hooks and subagents: notifications, exit codes, six quality gates, four guardrail layers, context injection, and subagents.

Walk me through setting these up in this project, one step at a time. Before each step, explain in a sentence or two what it does and why, then ask if I want it. Adapt everything to this project: my OS, my package manager, my test and lint commands.

Order:
1. Check jq is installed.
2. Notifications for Notification, Stop and SubagentStop, with a different sound each. Help me allow notifications in my OS settings.
3. The bouncer: a PreToolUse hook that blocks .env files, rm -rf and --no-verify, plus matching permissions.deny rules.
4. The instant check: format and lint the edited file after every edit.
5. The finish line: run tests on Stop, with the stop_hook_active loop guard and trimmed output.
6. Context injection: a SessionStart briefing (branch, uncommitted files, last commits, anything else this project needs), and a compact-matcher hook that re-injects a short critical-rules file.
7. Subagents: a read-only code-reviewer (tools: Read, Grep, Glob; model: haiku) with a specific description.
8. Optional: a UserPromptSubmit hook, a SubagentStart briefing, a SubagentStop check, a git pre-commit secret scan, a GitHub required check.

Put hooks in .claude/settings.json and scripts in .claude/hooks/ (chmod +x). After each hook, test it from the terminal by piping sample JSON into the script and showing me the exit code, then remind me to check /hooks.
```
