#!/usr/bin/env python3
"""Kit version check (README › Versioning).

    python3 tools/kit-check.py                    # kit.json agrees with PLATFORM_DECISIONS.md
    python3 tools/kit-check.py --base origin/main # ...and this branch bumps kit_version the way its changes require

Fails (exit 1) when:
  - kit.json's platform_decisions is not the highest P number in docs/PLATFORM_DECISIONS.md, or a P number repeats;
  - kit_version is not MAJOR.MINOR.PATCH;
  - with --base: a P row was added or changed but kit_version did not get at least a minor bump,
    or anything else changed but kit_version did not move at all.
"""
import json, re, subprocess, sys, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
KJ, PD = 'prototype/src/kit.json', 'docs/PLATFORM_DECISIONS.md'

def read(path, ref=None):
    if ref is None:
        return open(os.path.join(ROOT, path), encoding='utf-8').read()
    return subprocess.run(['git', '-C', ROOT, 'show', f'{ref}:{path}'], capture_output=True, text=True, check=True).stdout

def rows(text):
    return {int(m.group(1)): line for line in text.splitlines() if (m := re.match(r'\| P(\d+) \|', line))}

def ver(v):
    m = re.fullmatch(r'(\d+)\.(\d+)\.(\d+)', v or '')
    return tuple(map(int, m.groups())) if m else None

errors = []
kit, dec = json.loads(read(KJ)), read(PD)
now = rows(dec)
nums = [int(n) for n in re.findall(r'^\| P(\d+) \|', dec, re.M)]
if len(nums) != len(set(nums)): errors.append('a P number appears twice in PLATFORM_DECISIONS.md')
if kit.get('platform_decisions') != max(now): errors.append(f"kit.json platform_decisions is {kit.get('platform_decisions')}, highest P is {max(now)}")
v = ver(kit.get('kit_version'))
if not v: errors.append(f"kit_version {kit.get('kit_version')!r} is not MAJOR.MINOR.PATCH")

if '--base' in sys.argv and v:
    base = sys.argv[sys.argv.index('--base') + 1]
    bkit = json.loads(read(KJ, base)); bv = ver(bkit.get('kit_version')); before = rows(read(PD, base))
    decided = sorted(n for n in set(now) | set(before) if now.get(n) != before.get(n))
    changed = subprocess.run(['git', '-C', ROOT, 'diff', '--name-only', base, '--'], capture_output=True, text=True).stdout.split()
    if decided and not (v[0] > bv[0] or (v[0] == bv[0] and v[1] > bv[1])):
        errors.append(f"P{', P'.join(map(str, decided))} added or changed: kit_version needs a minor bump from {bkit['kit_version']} (or major, if products must change code)")
    elif changed and v <= bv:
        errors.append(f"files changed but kit_version is still {kit['kit_version']} (patch bump for fixes without a decision)")
    if not errors: print(f"base {bkit['kit_version']} -> {kit['kit_version']}; decisions changed: {decided or 'none'}")

if errors:
    print('\n'.join('kit-check: ' + e for e in errors)); sys.exit(1)
print(f"kit-check ok: {kit['kit_version']}, P1–P{max(now)} ({len(now)} rows)")
