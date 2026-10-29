#!/bin/bash
# Play a macOS system sound and show a banner: sound.sh Glass "Title"
# The hook's stdin JSON may carry a .message (Notification events).
msg=$(jq -r '.message // empty' 2>/dev/null)
afplay "/System/Library/Sounds/$1.aiff" >/dev/null 2>&1 &
osascript -e 'on run a' -e 'display notification (item 2 of a) with title (item 1 of a)' -e 'end run' \
  "${2:-Claude Code}" "${msg:-Claude Code}" >/dev/null 2>&1 &
