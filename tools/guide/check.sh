#!/usr/bin/env bash
# P92: a change to the code must carry its plan step, its tracker row and its guide chapter, and the guide page must be rebuilt.
# P98: a change to a screen must carry its help articles, and the help articles' markers must still find their elements.
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
# P98: a change to a screen carries its help articles, and every article's markers still find their elements
screens=$(printf '%s\n' "$CHANGED" | grep -E '^(web/src/modules/[^/]+/pages/|mobile/resources/spa/src/modules/[^/]+/(screens|sheets)/)' | sort -u || true)
if [ -n "$screens" ] && ! printf '%s\n' "$CHANGED" | grep -q '^docs/help/' && ! git log --format=%B "$BASE"..HEAD 2>/dev/null | grep -qi '^help: no change'; then
  echo "✗ Screens changed but not their help articles (docs/help/): update them, or say why not with a line \"Help: no change\" in the commit message"; fail=1
fi
if [ -d docs/help/articles ] && { [ -n "$screens" ] || printf '%s\n' "$CHANGED" | grep -qE '^(docs/help/|tools/help/|prototype/src/|docs/design/prototype/)'; }; then
  if [ -d tools/prototype-shots/node_modules ]; then
    node tools/help/build.js --check || fail=1
  else echo "✗ Help articles need checking: run npm ci in tools/prototype-shots, then this check again"; fail=1; fi
fi
# the HTML page must match its chapters
tmp="$(mktemp)"; cp docs/guide/index.html "$tmp" 2>/dev/null || true
python3 tools/guide/build.py >/dev/null   # reads tools/guide/build.args when the product has one
if ! cmp -s "$tmp" docs/guide/index.html; then echo "✗ docs/guide/index.html was out of date; it is rebuilt now: commit it"; fail=1; fi
rm -f "$tmp"
if [ "$fail" = 0 ]; then echo "✓ Plan, tracker, guide and help move with the code (P92, P98)"; fi
exit $fail
