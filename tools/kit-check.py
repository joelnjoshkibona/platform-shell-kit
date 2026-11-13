#!/usr/bin/env python3
"""Kit version check (README › Versioning).

    python3 tools/kit-check.py                    # kit.json agrees with PLATFORM_DECISIONS.md
    python3 tools/kit-check.py --base origin/main # ...and this branch bumps kit_version the way its changes require

Fails (exit 1) when:
  - kit.json's platform_decisions is not the highest P number in docs/PLATFORM_DECISIONS.md, or a P number repeats;
  - kit_version is not MAJOR.MINOR.PATCH;
  - with --base: a P row was added or changed but kit_version did not get at least a minor bump,
    or anything else changed but kit_version did not move at all.
    A row marked "Withdrawn:" on a number that was never decided (or was already withdrawn), and a note in another
    row about such a number in parentheses, need only a patch: nothing changes for products. Withdrawing a decided
    P still needs a minor bump.
  - a tracked text file names a product listed in tools/product-names.txt (README › Rules of the kit: speak in kit
    terms; the list's header says what is allowed);
  - a decision's source check fails (below, "Source checks"): what a decision says the shared files must not
    name, read from the prototype's source. Its browser checks are tools/prototype-shots/decisions.test.js.
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

def withdrawn(line):
    return bool(line) and line.split('|')[2].strip().startswith('Withdrawn:')

def plain(line, gone):
    # A row without its parenthetical notes about withdrawn numbers, e.g. "(P38 is reserved for ...)".
    return re.sub(r' \(P(\d+) [^)]*\)', lambda m: '' if int(m.group(1)) in gone else m.group(0), line or '')

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
    gone = {n for n in now if withdrawn(now[n]) and (n not in before or withdrawn(before[n]))}
    decided = sorted(n for n in set(now) | set(before)
                     if n not in gone and plain(now.get(n), gone) != plain(before.get(n), gone))
    changed = subprocess.run(['git', '-C', ROOT, 'diff', '--name-only', base, '--'], capture_output=True, text=True).stdout.split()
    if decided and not (v[0] > bv[0] or (v[0] == bv[0] and v[1] > bv[1])):
        errors.append(f"P{', P'.join(map(str, decided))} added or changed: kit_version needs a minor bump from {bkit['kit_version']} (or major, if products must change code)")
    elif changed and v <= bv:
        errors.append(f"files changed but kit_version is still {kit['kit_version']} (patch bump for fixes without a decision)")
    if not errors: print(f"base {bkit['kit_version']} -> {kit['kit_version']}; decisions changed: {decided or 'none'}")

# ---- Source checks: what a decision says a shared file must not name (P107–P110)
def src(name):
    f = os.path.join(ROOT, 'prototype', 'src', name)
    return open(f, encoding='utf-8').read() if os.path.exists(f) else ''
def part(text, start, end):
    i = text.find(start); j = text.find(end, i + 1) if i > -1 else -1
    return text[i:j] if i > -1 and j > -1 else None
checked = []
def names_none(where, text, words):
    checked.append(where.split(':')[0])
    if text is None: errors.append(f'{where}: not found in the source (the check needs updating)'); return
    hit = [w for w in words if re.search(w, text)]
    if hit: errors.append(f"{where} names {', '.join(hit)}")
appr = src('parts_appr.js')
if appr:
    names_none('P107: the approvals engine\'s decision code (decide … applyEffect)', part(appr, 'function decide(', 'function openReq('), [r'FORMS', r'Responses', r"'form'"])
    names_none('P108: parts_appr.js', appr, [r'\bFORMS\b'])
reports = src('parts_reports.js')
if reports:
    i = reports.find('const ReportsPage = {')
    names_none('P109: the report page code (ReportsPage, ReportPage)', reports[i:] if i > -1 else None, [r'\bpay\b', r'RP_PAY'])
shell = src('parts_shell.js')
if shell:
    reg = src('parts_product.js')
    mods = sorted(set(re.findall(r"name: '(\w+)\.\w+'", reg)))   # the product's permission modules (the example: Forms, Responses, Templates)
    words = [r"'%s\." % m for m in mods] or [r'(?!)']
    names_none('P110: the shell\'s permission catalogue and roles (parts_shell.js)', part(shell, 'const PERMS = [', 'const DIRECT = '), words)
    names_none('P110: the shell\'s route check and page titles (parts_shell.js)', (part(shell, 'const isShell = ', '\n') or '') + (part(shell, 'const titles = new Proxy', '\n') or '') if 'const isShell = ' in shell else None,
               [r"r === '%s'" % d for d in re.findall(r"route: '([\w-]+)'", reg)] + words or [r'(?!)'])
    asm = src('assemble.py')
    if asm and not re.search(r"'const ShellMod = \(\(\) => \{\\n' \+ open\(SP \+ 'parts_product.js'\)", asm): errors.append('P110: assemble.py does not load parts_product.js first, inside the shell module')

# ---- Speak in kit terms: no tracked text file names a product (tools/product-names.txt)
NAMES_FILE = 'tools/product-names.txt'
SWAHILI = {'fomu', 'jumla', 'ongeza'}   # kit-terms: allow (also Swahili words: form, total, add; allowed in Swahili locale files)
names = [l.strip() for l in read(NAMES_FILE).splitlines() if l.strip() and not l.lstrip().startswith('#')]
name_re = re.compile(r'(?i)(?<![a-z])(' + '|'.join(re.escape(n).replace(r'\ ', r'[\s_-]?') for n in names) + ')') if names else None
skip = (NAMES_FILE,)
named = []
if name_re:
    files = subprocess.run(['git', '-C', ROOT, 'ls-files', '-z'], capture_output=True, text=True).stdout.split('\0')
    for f in files:
        if not f or f in skip or f.endswith(('.lock', 'package-lock.json')) or '/screenshots/' in '/' + f: continue
        try: text = open(os.path.join(ROOT, f), encoding='utf-8').read()
        except (UnicodeDecodeError, FileNotFoundError, IsADirectoryError): continue
        swahili = '/sw/' in '/' + f or f.endswith('sw.json')
        for i, line in enumerate(text.splitlines(), 1):
            if 'kit-terms: allow' in line: continue
            for m in name_re.finditer(line):
                if swahili and m.group(1).lower() in SWAHILI: continue
                named.append(f'{f}:{i} ({m.group(1)})')
    if named:
        errors.append(f"{len(named)} line(s) name a product (speak in kit terms; tools/product-names.txt): " + ', '.join(named[:20]) + (' …' if len(named) > 20 else ''))

if errors:
    print('\n'.join('kit-check: ' + e for e in errors)); sys.exit(1)
print(f"kit-check ok: {kit['kit_version']}, P1–P{max(now)} ({len(now)} rows)" + (f"; source checks: {len(checked)} ({', '.join(sorted(set(checked)))})" if checked else ''))
