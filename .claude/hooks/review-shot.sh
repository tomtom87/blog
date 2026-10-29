#!/bin/bash
# Ask Jev (TypeSafe System One) to compare a new screenshot with the previous
# one of the same file. Prints one line, or nothing on any failure.
# Needs TYPESAFE_API_KEY in the environment. Sends both screenshots to api.typesafe.ai.
# usage: review-shot.sh <new.png> <name>
new=$1
prev=$(ls -t snapshots/*-"$2".png 2>/dev/null | sed -n 2p)
[ -n "$TYPESAFE_API_KEY" ] && [ -n "$prev" ] || exit 0

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
base64 -i "$prev" | tr -d '\n' >"$tmp/before"
base64 -i "$new" | tr -d '\n' >"$tmp/after"

body=$(jq -n --rawfile b "$tmp/before" --rawfile a "$tmp/after" '{
  model: "jev-latest",
  state: {before: "ref-before-9c1e", after: "ref-after-4d7a"},
  assets: {
    "ref-before-9c1e": {type: "image", format: "png", data_base64: $b},
    "ref-after-4d7a": {type: "image", format: "png", data_base64: $a}
  },
  questions: {
    change: {type: "choice",
      instructions: "How different does `after` look from `before`? Both are screenshots of the same web page.",
      criteria: {none: "Visually identical or nearly so.", subtle: "Small differences in spacing, color or type.", major: "Layout, imagery or overall look clearly changed."}},
    broken: {type: "noul",
      instructions: "Does `after` look broken compared to `before`: overlapping or clipped content, missing sections, or text that is hard to read?"}
  }}')

resp=$(curl -s --max-time 25 https://api.typesafe.ai/v1/systemone \
  -H "authorization: Bearer $TYPESAFE_API_KEY" -H 'content-type: application/json' \
  -H 'TypeSafe-Danger-Zone-Images: true' -d "$body") || exit 0
echo "$resp" | jq -r '.answers | "Jev review vs previous screenshot: change=\(.change.choice), broken=\((.broken.noul * 100 | round))%"' 2>/dev/null \
  || echo "$resp" | head -c 300 >&2
