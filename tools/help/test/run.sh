#!/usr/bin/env bash
# The help tool's own test (P98): an article that marks a missing element must fail the build, and say which marker.
set -uo pipefail
cd "$(dirname "$0")"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
out="$(node ../build.js --articles articles --out "$tmp" --data "$tmp/data.js" 2>&1)"; code=$?
if [ "$code" = 0 ]; then echo "✗ a missing marker did not fail the build"; exit 1; fi
if ! grep -qF 'marker 2 "main button:has-text("A button that was removed")" matches nothing' <<<"$out"; then echo "✗ the failure does not name the missing marker:"; echo "$out"; exit 1; fi
if grep -q 'marker 1' <<<"$out"; then echo "✗ marker 1 exists but was reported:"; echo "$out"; exit 1; fi
echo "✓ a missing marker fails the build and is named (P98)"
