#!/usr/bin/env python3
"""Builds the build guide (P91): Markdown chapters -> one self-contained HTML page (contents, search, light/dark, print).
No dependencies. Copy this file into a product as tools/guide/build.py.

  python3 tools/guide/build.py                       # kit defaults (docs/guide/chapters -> docs/guide/index.html)
  python3 tools/guide/build.py --title "Shelui Tasks: build guide" \
      --chapters docs/guide/chapters --page "Implementation plan=docs/IMPLEMENTATION_PLAN.md" \
      --page "Progress=docs/PROGRESS.md" --out docs/guide/index.html

Markdown it understands: # to #### headings, paragraphs, - and 1. lists (nested by two spaces), ``` code fences ```,
| tables |, > quotes (a quote starting with **Note**, **Tip** or **Watch out** becomes a coloured box), **bold**,
*italic*, `code`, [links](url), --- rules. The first # heading of a chapter is its title.
"""
import argparse, glob, html, os, re

ap = argparse.ArgumentParser()
ap.add_argument('--root', default=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
ap.add_argument('--title', default='Building a product on the platform kit')
ap.add_argument('--chapters', default='docs/guide/chapters')
ap.add_argument('--page', action='append', default=[], help='Title=path/to/file.md, added after the chapters')
ap.add_argument('--out', default='docs/guide/index.html')
a = ap.parse_args()
R = lambda p: os.path.join(a.root, p)

def slug(t, used):
    s = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-') or 'section'; b, i = s, 2
    while s in used: s = b + '-' + str(i); i += 1
    used.add(s); return s

def inline(t):
    codes = []
    def keep(m): codes.append('<code>' + html.escape(m.group(1)) + '</code>'); return '\x00' + str(len(codes) - 1) + '\x00'
    t = re.sub(r'`([^`]+)`', keep, t)
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: '<a href="' + html.escape(m.group(2)) + '">' + m.group(1) + '</a>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![*\w])\*([^*\n]+)\*(?![*\w])', r'<em>\1</em>', t)
    return re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], t)

def md(text, used, heads, chap):
    lines = text.replace('\r', '').split('\n'); out = []; i = 0
    def para(buf):
        if buf: out.append('<p>' + inline(' '.join(x.strip() for x in buf)) + '</p>')
    buf = []
    while i < len(lines):
        L = lines[i]
        if L.startswith('```'):
            para(buf); buf = []; lang = L[3:].strip(); code = []; i += 1
            while i < len(lines) and not lines[i].startswith('```'): code.append(lines[i]); i += 1
            out.append('<div class="code"><span class="lang">' + html.escape(lang) + '</span><button class="copy" type="button" aria-label="Copy">Copy</button><pre><code>' + html.escape('\n'.join(code)) + '</code></pre></div>'); i += 1; continue
        m = re.match(r'^(#{1,4})\s+(.*)$', L)
        if m:
            para(buf); buf = []; n = len(m.group(1)); t = m.group(2).strip(); sid = slug(chap + '-' + t if n > 1 else chap, used)
            if n == 1: out.append('<h1 id="' + sid + '">' + inline(t) + '</h1>'); heads.append((1, t, sid))
            else: out.append('<h' + str(n) + ' id="' + sid + '"><a class="anchor" href="#' + sid + '" aria-hidden="true">#</a>' + inline(t) + '</h' + str(n) + '>');
            if n == 2: heads.append((2, t, sid))
            i += 1; continue
        if re.match(r'^\s*---+\s*$', L): para(buf); buf = []; out.append('<hr>'); i += 1; continue
        if L.startswith('|'):
            para(buf); buf = []; rows = []
            while i < len(lines) and lines[i].startswith('|'): rows.append(lines[i]); i += 1
            cells = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
            hdr = cells(rows[0]); body = [cells(r) for r in rows[2:]] if len(rows) > 1 and re.match(r'^\|[\s:|-]+\|?$', rows[1]) else [cells(r) for r in rows[1:]]
            out.append('<div class="table"><table><thead><tr>' + ''.join('<th>' + inline(c) + '</th>' for c in hdr) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>' + inline(c) + '</td>' for c in r) + '</tr>' for r in body) + '</tbody></table></div>'); continue
        if L.startswith('>'):
            para(buf); buf = []; q = []
            while i < len(lines) and lines[i].startswith('>'): q.append(lines[i][1:].strip()); i += 1
            body = ' '.join(q); kind = 'note'
            mm = re.match(r'^\*\*(Note|Tip|Watch out|Why)\*\*:?\s*(.*)$', body)
            if mm: kind = {'Note': 'note', 'Tip': 'tip', 'Watch out': 'warn', 'Why': 'why'}[mm.group(1)]; body = '<strong>' + mm.group(1) + '.</strong> ' + inline(mm.group(2))
            else: body = inline(body)
            out.append('<aside class="box ' + kind + '">' + body + '</aside>'); continue
        if re.match(r'^\s*([-*]|\d+\.)\s+', L):
            para(buf); buf = []; items = []
            while i < len(lines) and (re.match(r'^\s*([-*]|\d+\.)\s+', lines[i]) or (items and lines[i].startswith('  ') and lines[i].strip())):
                mm = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)$', lines[i])
                if mm: items.append([len(mm.group(1)) // 2, 'ol' if mm.group(2)[0].isdigit() else 'ul', mm.group(3)])
                else: items[-1][2] += ' ' + lines[i].strip()
                i += 1
            def render(k, depth):
                tag = items[k][1]; o = ['<' + tag + '>']
                while k < len(items) and items[k][0] >= depth:
                    if items[k][0] == depth and items[k][1] != tag: break
                    if items[k][0] > depth: sub, k = render(k, items[k][0]); o[-1] = o[-1][:-5] + sub + '</li>'; continue
                    o.append('<li>' + inline(items[k][2]) + '</li>'); k += 1
                o.append('</' + tag + '>'); return ''.join(o), k
            k = 0
            while k < len(items): h, k = render(k, items[k][0]); out.append(h)
            continue
        if not L.strip(): para(buf); buf = []; i += 1; continue
        buf.append(L); i += 1
    para(buf)
    return '\n'.join(out)

used = set(); chapters = []
files = sorted(glob.glob(os.path.join(R(a.chapters), '*.md')))
pages = [(None, f) for f in files] + [(p.split('=', 1)[0], R(p.split('=', 1)[1])) for p in a.page]
for title, f in pages:
    if not os.path.exists(f): continue
    txt = open(f, encoding='utf-8').read(); heads = []
    key = re.sub(r'^\d+-', '', os.path.splitext(os.path.basename(f))[0])
    if title and not re.match(r'^#\s', txt.lstrip()): txt = '# ' + title + '\n\n' + txt
    body = md(txt, used, heads, key)
    t = next((x[1] for x in heads if x[0] == 1), title or key)
    chapters.append({'title': t, 'id': next((x[2] for x in heads if x[0] == 1), key), 'heads': [x for x in heads if x[0] == 2], 'html': body, 'extra': bool(title), 'src': os.path.relpath(f, a.root)})

nav = []; cnum = 0
for c in chapters:
    label = c['title'] if c['extra'] else (str(cnum) + '. ' + c['title'] if cnum else c['title']); cnum += 0 if c['extra'] else 1
    nav.append('<li><a href="#' + c['id'] + '" class="ch">' + html.escape(label) + '</a>' + ('<ul>' + ''.join('<li><a href="#' + h[2] + '">' + html.escape(h[1]) + '</a></li>' for h in c['heads']) + '</ul>' if c['heads'] else '') + '</li>')
main = '\n'.join('<section class="chapter" data-src="' + html.escape(c['src']) + '">' + c['html'] + '<p class="src">Source: <code>' + html.escape(c['src']) + '</code></p></section>' for c in chapters)
CSS = r"""
:root{--bg:#fbfbfa;--panel:#ffffff;--fg:#1c1d21;--muted:#62646c;--line:#e6e6e3;--accent:#1d5fd1;--accent-bg:#eaf1fd;--code:#f3f3f1;--note:#eaf1fd;--tip:#e8f6ef;--tip-fg:#13724a;--warn:#fdf2e3;--warn-fg:#9a5b06;--why:#f1edfb;--why-fg:#5b3fb5;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111214;--panel:#17181b;--fg:#ececee;--muted:#a0a2aa;--line:#2a2c31;--accent:#7aa7f5;--accent-bg:#1b2638;--code:#1d1f23;--note:#1b2638;--tip:#15271f;--tip-fg:#6fd3a1;--warn:#2c2215;--warn-fg:#f0b45e;--why:#231d33;--why-fg:#b9a3f5;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#111214;--panel:#17181b;--fg:#ececee;--muted:#a0a2aa;--line:#2a2c31;--accent:#7aa7f5;--accent-bg:#1b2638;--code:#1d1f23;--note:#1b2638;--tip:#15271f;--tip-fg:#6fd3a1;--warn:#2c2215;--warn-fg:#f0b45e;--why:#231d33;--why-fg:#b9a3f5;color-scheme:dark}
*{box-sizing:border-box}html{scroll-padding-top:16px}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}code{font:0.88em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--code);padding:.1em .35em;border-radius:5px}
.wrap{display:grid;grid-template-columns:300px minmax(0,1fr);min-height:100vh}
nav.side{position:sticky;top:0;height:100vh;overflow:auto;border-right:1px solid var(--line);background:var(--panel);padding:20px 16px}
nav.side h1{font-size:15px;line-height:1.3;margin:0 0 4px}nav.side .meta{color:var(--muted);font-size:12px;margin:0 0 14px}
nav.side input{width:100%;height:36px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg);padding:0 10px;font:inherit;font-size:14px}
nav.side ul{list-style:none;margin:0;padding:0}nav.side>ul{margin-top:14px}nav.side li{margin:1px 0}nav.side a{display:block;text-decoration:none;color:var(--fg);font-size:14px;padding:4px 8px;border-radius:6px}
nav.side a:hover{background:var(--accent-bg)}nav.side a.ch{font-weight:600}nav.side li ul a{color:var(--muted);font-size:13px;padding-left:18px}nav.side a.on{background:var(--accent-bg);color:var(--accent)}
.tools{display:flex;gap:6px;margin-top:10px}.tools button{flex:1;height:30px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:7px;font:inherit;font-size:12px;cursor:pointer}
main{padding:40px clamp(16px,5vw,64px) 80px;max-width:900px}
.chapter{padding-bottom:40px;margin-bottom:40px;border-bottom:1px solid var(--line)}
h1{font-size:32px;line-height:1.2;letter-spacing:-.02em;margin:0 0 16px;text-wrap:balance}h2{font-size:22px;margin:36px 0 10px;letter-spacing:-.01em}h3{font-size:18px;margin:26px 0 8px}h4{font-size:16px;margin:20px 0 6px}
h2 .anchor,h3 .anchor,h4 .anchor{opacity:0;margin-left:-1em;padding-right:.25em;text-decoration:none;color:var(--muted)}h2:hover .anchor,h3:hover .anchor,h4:hover .anchor{opacity:1}
p,li{max-width:72ch}p,li,td,th,.box{overflow-wrap:anywhere}main{min-width:0}ul,ol{padding-left:1.4em}li{margin:4px 0}hr{border:0;border-top:1px solid var(--line);margin:28px 0}
.code{position:relative;margin:14px 0;border:1px solid var(--line);border-radius:10px;background:var(--code)}.code pre{margin:0;overflow:auto;padding:14px 16px;font-size:13.5px;line-height:1.55}.code code{background:none;padding:0}
.code .lang{position:absolute;top:6px;right:62px;font:11px ui-monospace,monospace;color:var(--muted)}.code .copy{position:absolute;top:5px;right:6px;height:24px;border:1px solid var(--line);background:var(--panel);color:var(--fg);border-radius:6px;font-size:11px;cursor:pointer}
.table{overflow:auto;margin:14px 0;border:1px solid var(--line);border-radius:10px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid var(--line)}th{background:var(--code);font-weight:600}tr:last-child td{border-bottom:0}
.box{margin:16px 0;padding:12px 16px;border-radius:10px;background:var(--note);font-size:15px}.box.tip{background:var(--tip)}.box.tip strong{color:var(--tip-fg)}.box.warn{background:var(--warn)}.box.warn strong{color:var(--warn-fg)}.box.why{background:var(--why)}.box.why strong{color:var(--why-fg)}
.src{color:var(--muted);font-size:12px;margin-top:28px}mark{background:#ffe58a;color:#1c1d21;border-radius:3px}
.menu{display:none}
@media (max-width:860px){.wrap{display:block}nav.side{position:fixed;inset:0 auto 0 0;width:min(320px,88vw);z-index:20;transform:translateX(-100%);transition:transform .2s}nav.side.open{transform:none;box-shadow:0 0 40px rgba(0,0,0,.3)}
.menu{display:inline-flex;position:sticky;top:0;z-index:10;margin:0;width:100%;height:48px;align-items:center;gap:8px;padding:0 16px;border:0;border-bottom:1px solid var(--line);background:var(--panel);color:var(--fg);font:inherit;font-weight:600}main{padding-top:20px}h1{font-size:26px}}
@media print{nav.side,.menu,.code .copy{display:none}.wrap{display:block}main{max-width:none;padding:0}.chapter{break-after:page;border:0}a{color:inherit}}
"""
JS = r"""
const side=document.querySelector('nav.side'),links=[...side.querySelectorAll('a')],secs=[...document.querySelectorAll('main [id]')];
document.querySelector('.menu').onclick=()=>side.classList.toggle('open');side.addEventListener('click',e=>{if(e.target.tagName==='A')side.classList.remove('open')});
const spy=()=>{let cur=secs[0];for(const s of secs){if(s.getBoundingClientRect().top<120)cur=s}links.forEach(a=>a.classList.toggle('on',cur&&a.getAttribute('href')==='#'+cur.id))};addEventListener('scroll',spy,{passive:true});spy();
document.querySelectorAll('.code .copy').forEach(b=>b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(b.parentNode.querySelector('code').innerText);b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1400)});
const q=document.getElementById('q');q.oninput=()=>{const v=q.value.trim().toLowerCase();document.querySelectorAll('main mark').forEach(m=>m.replaceWith(m.textContent));
 side.querySelectorAll(':scope>ul>li').forEach((li,i)=>{const sec=document.querySelectorAll('main .chapter')[i];const hit=!v||sec.textContent.toLowerCase().includes(v);li.style.display=hit?'':'none'});};
q.onkeydown=e=>{if(e.key==='Enter'){const v=q.value.trim().toLowerCase();if(!v)return;const el=[...document.querySelectorAll('main p,main li,main td,main h2,main h3')].find(x=>x.textContent.toLowerCase().includes(v));if(el)el.scrollIntoView({block:'center'})}};
const t=document.getElementById('theme');const set=m=>{if(m)document.documentElement.setAttribute('data-theme',m);else document.documentElement.removeAttribute('data-theme');try{localStorage.setItem('guide-theme',m||'')}catch(e){}};try{set(localStorage.getItem('guide-theme')||'')}catch(e){}
t.onclick=()=>{const c=document.documentElement.getAttribute('data-theme');set(c==='dark'?'light':c==='light'?'':'dark')};document.getElementById('print').onclick=()=>print();
"""
doc = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + html.escape(a.title) + '</title><style>' + CSS + '</style></head><body>'
       '<button class="menu" type="button" aria-label="Contents">☰ Contents</button><div class="wrap"><nav class="side" aria-label="Contents"><h1>' + html.escape(a.title) + '</h1><p class="meta">' + str(len(chapters)) + ' chapters · rebuilt by tools/guide/build.py</p>'
       '<input id="q" type="search" placeholder="Search the guide (Enter jumps)" aria-label="Search the guide"><div class="tools"><button id="theme" type="button">Light / dark</button><button id="print" type="button">Print</button></div><ul>' + ''.join(nav) + '</ul></nav>'
       '<main>' + main + '</main></div><script>' + JS + '</script></body></html>')
os.makedirs(os.path.dirname(R(a.out)), exist_ok=True)
open(R(a.out), 'w', encoding='utf-8').write(doc)
print('ok', a.out, len(chapters), 'chapters', os.path.getsize(R(a.out)), 'bytes')
