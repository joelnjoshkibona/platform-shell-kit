#!/usr/bin/env bash
# P92: a change to the code must carry its plan step, its tracker row and its guide chapter, and the guide page must be rebuilt.
# Usage: tools/guide/check.sh [base-ref]   (default origin/main). Run in CI on every pull request, and before you open one.
set -euo pipefail
cd "$(dirname "$0")/../.."
BASE="${1:-origin/main}"
CHANGED="$(git diff --name-only "$BASE"...HEAD; git diff --name-only; git diff --name-only --cached; git ls-files --others --exclude-standard)"
code=$(printf '%s\n' "$CHANGED" | grep -E '^(api|web|mobile|packages)/' | sort -u || true)
fail=0
if [ -n "$code" ]; then
  for need in "docs/PROGRESS.md|the progress tracker row (docs/PROGRESS.md)" "docs/IMPLEMENTATION_PLAN.md|the implementation plan step (docs/IMPLEMENTATION_PLAN.md)" "docs/guide/chapters/|the guide chapter that explains it (docs/guide/chapters/)"; do
    path="${need%%|*}"; what="${need#*|}"
    if ! printf '%s\n' "$CHANGED" | grep -q "^$path"; then echo "✗ Code changed but not $what"; fail=1; fi
  done
fi
# the HTML page must match its chapters
tmp="$(mktemp)"; cp docs/guide/index.html "$tmp" 2>/dev/null || true
python3 tools/guide/build.py >/dev/null   # reads tools/guide/build.args when the product has one
if ! cmp -s "$tmp" docs/guide/index.html; then echo "✗ docs/guide/index.html was out of date; it is rebuilt now: commit it"; fail=1; fi
rm -f "$tmp"
if [ "$fail" = 0 ]; then echo "✓ Plan, tracker and guide move with the code (P92)"; fi
exit $fail
