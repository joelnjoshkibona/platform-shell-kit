#!/usr/bin/env node
/*
 * P98 · The user guide: articles in Markdown → marked screenshots → the in-app Help data, help.json and an HTML page.
 *
 *   node tools/help/build.js                 everything: screenshots, help.json, index.html, the prototype's parts_help_data.js
 *   node tools/help/build.js --text          only the text outputs (no browser), e.g. after fixing a typo
 *   node tools/help/build.js --only a,b      screenshots of these articles only (text outputs are always rebuilt)
 *   node tools/help/build.js --check         fail if a marker's element is missing, a marker is off screen, a screenshot
 *                                            file is missing, or an output is out of date. Writes nothing. Run in CI.
 *   --articles DIR --out DIR --data FILE     other folders (the tool's own test uses these)
 *
 * Needs tools/prototype-shots installed (npm ci there): it serves the prototype the same way the screenshot tool does.
 *
 * An article (docs/help/articles/<lang>/<id>.md):
 *
 *   ---
 *   id: restore-from-trash                 the file name without .md, and the link: #/help/restore-from-trash
 *   title: Bring back something you deleted
 *   module: Trash                          the group on the Help page
 *   screens: trash                         routes whose "How do I…" button lists this article (comma separated)
 *   who: People with "Restore from trash"  the permission, in words
 *   related: find-records-in-a-list        other article ids (comma separated)
 *   order: 1                               place within its module (optional)
 *   ---
 *   Text in Markdown: ## headings, paragraphs, 1. and - lists, **bold**, `code`, > notes, [text](help:other-id) links.
 *   Write ① ② ③ in the text where the reader should look; they match the numbers drawn on the screenshot.
 *
 *   ::: shot route=trash                   route, or a link such as route=#/locations/ARU-01?tab=users
 *   > click main button:has-text("Group")  optional steps before the picture: click SEL · waitfor SEL · wait MS · hash #/…
 *   1 = main input[type=search]  Search what was deleted
 *   2 = main button:has-text("Restore")  Bring it back
 *   :::
 *
 *   Marker lines are "N = <Playwright selector><two or more spaces><what it is>". Options on the ::: line:
 *   phone=no (desktop only), desktop=no (phone only), phone-route=… (another route on a phone).
 *   A selector may differ on a phone: "1 = <desktop selector> || <phone selector>  Text".
 */
const fs = require('fs');
const path = require('path');

const SH = path.resolve(__dirname, '../prototype-shots');
const L = require(path.join(SH, 'layout.js'));
const args = process.argv.slice(2);
const has = k => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const ART = path.resolve(opt('articles', path.join(L.ROOT, 'docs/help/articles')));
const OUT = path.resolve(opt('out', path.join(L.ROOT, 'docs/help')));
const DATA = path.resolve(opt('data', path.join(L.SRC, 'parts_help_data.js')));
const ONLY = (opt('only', '') || '').split(',').filter(Boolean);
const CHECK = has('check'), TEXT = has('text');
const COMBOS = { desktop: { viewport: { width: 1280, height: 900 }, colorScheme: 'light', minH: 420 }, phone: { viewport: { width: 390, height: 844 }, colorScheme: 'dark', minH: 560 } };
const CIRCLED = '①②③④⑤⑥⑦⑧⑨';

/* ------------------------------------------------------------------ reading articles */
function readArticles() {
  if (!fs.existsSync(ART)) return [];
  const out = [];
  for (const lang of fs.readdirSync(ART).filter(d => fs.statSync(path.join(ART, d)).isDirectory()).sort()) {
    for (const f of fs.readdirSync(path.join(ART, lang)).filter(f => f.endsWith('.md')).sort()) {
      const file = path.join(ART, lang, f), src = fs.readFileSync(file, 'utf8');
      const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!m) throw new Error(`${rel(file)}: starts with a --- front matter block`);
      const meta = Object.fromEntries(m[1].split('\n').filter(Boolean).map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
      const list = v => (v || '').split(',').map(s => s.trim()).filter(Boolean);
      const id = meta.id || f.slice(0, -3);
      if (id !== f.slice(0, -3)) throw new Error(`${rel(file)}: id "${id}" must match the file name`);
      for (const k of ['title', 'module', 'who']) if (!meta[k]) throw new Error(`${rel(file)}: front matter needs "${k}"`);
      const a = { id, lang, file, title: meta.title, module: meta.module, who: meta.who, screens: list(meta.screens), related: list(meta.related), order: +meta.order || 99, shots: [] };
      a.body = parseShots(a, m[2]);
      out.push(a);
    }
  }
  const ids = new Set(out.map(a => a.lang + '/' + a.id));
  for (const a of out) for (const r of a.related) if (!ids.has(a.lang + '/' + r)) throw new Error(`${rel(a.file)}: related "${r}" is not an article`);
  return out.sort((x, y) => x.lang.localeCompare(y.lang) || x.module.localeCompare(y.module) || x.order - y.order || x.title.localeCompare(y.title));
}
const rel = f => path.relative(L.ROOT, f);

function parseShots(a, body) {
  return body.replace(/^::: shot ?(.*)\n([\s\S]*?)^:::[ \t]*$/gm, (all, head, inner) => {
    const o = Object.fromEntries((head.match(/[\w-]+=\S+/g) || []).map(kv => kv.split(/=(.*)/s).slice(0, 2)));
    if (!o.route) throw new Error(`${rel(a.file)}: a shot needs route=`);
    const shot = { k: a.shots.length + 1, route: o.route, phoneRoute: o['phone-route'] || o.route, steps: [], marks: [], combos: Object.keys(COMBOS).filter(c => o[c] !== 'no') };
    for (const line of inner.split('\n').map(l => l.trim()).filter(Boolean)) {
      let s;
      if ((s = line.match(/^>\s*(click|waitfor|wait|hash)\s+(.+)$/))) shot.steps.push({ act: s[1], arg: s[2] });
      else if ((s = line.match(/^(\d)\s*=\s*(.+?)\s{2,}(\S.*)$/))) { const [d, p] = s[2].split(/\s*\|\|\s*/); shot.marks.push({ n: +s[1], sel: { desktop: d, phone: p || d }, text: s[3] }); }
      else throw new Error(`${rel(a.file)} shot ${shot.k}: cannot read "${line}"`);
    }
    if (!shot.marks.length) throw new Error(`${rel(a.file)} shot ${shot.k}: no markers`);
    shot.marks.forEach((m, i) => { if (m.n !== i + 1) throw new Error(`${rel(a.file)} shot ${shot.k}: markers must be numbered 1, 2, 3… in order`); });
    a.shots.push(shot);
    return `\n\u0000SHOT${shot.k}\n`;
  });
}

/* ------------------------------------------------------------------ Markdown (the small subset articles use) */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mk = n => `<span class="mk">${n}</span>`;
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(help:([\w-]+)\)/g, '<a href="#/help/$2" data-help="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(new RegExp('[' + CIRCLED + ']', 'g'), c => mk(CIRCLED.indexOf(c) + 1));
}
const shotFile = (a, s, c) => `shots/${a.lang === 'en' ? '' : a.lang + '-'}${a.id}-${s.k}__${c}.png`;
function figure(a, s) {
  const alt = esc(`${a.title}: the screen with markers 1 to ${s.marks.length}`);
  const src = c => '@help/' + shotFile(a, s, c);
  const pic = s.combos.length === 2 ? `<picture><source media="(max-width: 640px)" srcset="${src('phone')}"><img src="${src('desktop')}" alt="${alt}" loading="lazy"></picture>` : `<img src="${src(s.combos[0])}" alt="${alt}" loading="lazy">`;
  return `<figure class="help-shot">${pic}<ol class="help-marks">${s.marks.map(m => `<li>${mk(m.n)}<span>${inline(m.text)}</span></li>`).join('')}</ol></figure>`;
}
function render(a) {
  const html = [], para = [];
  let list = null;
  const flushP = () => { if (para.length) html.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; };
  const flushL = () => { if (list) html.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; };
  for (const raw of a.body.split('\n')) {
    const line = raw.trimEnd(); let m;
    if (!line.trim()) { flushP(); flushL(); continue; }
    if ((m = line.match(/^\u0000SHOT(\d+)$/))) { flushP(); flushL(); html.push(figure(a, a.shots[+m[1] - 1])); continue; }
    if ((m = line.match(/^(#{2,3}) (.+)$/))) { flushP(); flushL(); html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if ((m = line.match(/^> ?(.*)$/))) { flushP(); flushL(); html.push(`<p class="note">${inline(m[1])}</p>`); continue; }
    if ((m = line.match(/^(\d+)\. (.+)$/)) || (m = line.match(/^(-) (.+)$/))) {
      flushP(); const tag = m[1] === '-' ? 'ul' : 'ol';
      if (!list || list.tag !== tag) { flushL(); list = { tag, items: [] }; }
      list.items.push(m[2]); continue;
    }
    if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += ' ' + line.trim(); continue; }
    flushL(); para.push(line.trim());
  }
  flushP(); flushL();
  return html.join('\n');
}
const plain = s => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ outputs */
function outputs(arts) {
  const json = arts.map(a => { const html = render(a); return { id: a.id, lang: a.lang, title: a.title, module: a.module, who: a.who, screens: a.screens, related: a.related, summary: plain(html.split('</p>')[0] || ''), html, text: plain(html) }; });
  const helpDir = path.relative(L.ROOT, OUT).split(path.sep).join('/') + '/';
  const rootFromProto = (path.relative(path.dirname(DATA), L.ROOT).split(path.sep).join('/') || '.') + '/';
  const data = `  /* GENERATED by tools/help/build.js from ${path.relative(L.ROOT, ART).split(path.sep).join('/')}/ — do not edit; edit the articles and run the tool (P98). */
  const HELP_BASE = (window.__HELP_BASE || ${JSON.stringify(rootFromProto)}) + ${JSON.stringify(helpDir)};
  const HELP = ${JSON.stringify(json)};
`;
  return { 'help.json': JSON.stringify(json, null, 1) + '\n', 'index.html': page(json), [DATA]: data };
}

function page(json) {
  const langs = [...new Set(json.map(a => a.lang))];
  const mods = [...new Set(json.filter(a => a.lang === langs[0]).map(a => a.module))];
  const toc = langs.map(lang => `<nav class="toc" data-lang="${lang}">${langs.length > 1 ? `<h2>${lang}</h2>` : ''}${[...new Set(json.filter(a => a.lang === lang).map(a => a.module))].map(m => `<div><h3>${esc(m)}</h3><ul>${json.filter(a => a.lang === lang && a.module === m).map(a => `<li data-art="${a.lang}/${a.id}"><a href="#${a.lang}-${a.id}">${esc(a.title)}</a></li>`).join('')}</ul></div>`).join('')}</nav>`).join('');
  const arts = json.map(a => `<article id="${a.lang}-${a.id}" data-art="${a.lang}/${a.id}" data-text="${esc((a.title + ' ' + a.module + ' ' + a.text).toLowerCase())}"><p class="mod">${esc(a.module)}</p><h2>${esc(a.title)}</h2><p class="who">Who can do this: ${esc(a.who)}</p>${a.html.replace(/@help\//g, '').replace(/href="#\/help\/([\w-]+)" data-help="[\w-]+"/g, `href="#${a.lang}-$1"`)}${a.related.length ? `<p class="related">See also: ${a.related.map(r => { const t = json.find(x => x.id === r && x.lang === a.lang); return `<a href="#${a.lang}-${r}">${esc(t.title)}</a>`; }).join(' · ')}</p>` : ''}</article>`).join('\n');
  return `<!doctype html>
<html lang="${langs[0] || 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Help and guides</title>
<!-- GENERATED by tools/help/build.js (P98). Edit docs/help/articles and run the tool. -->
<style>
:root{--bg:#fff;--fg:#0a0a0a;--muted:#6b7280;--card:#fafafa;--border:#e5e7eb;--accent:#0f766e;--mk:#ea580c}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#f5f5f5;--muted:#a1a1aa;--card:#131316;--border:#27272a;--accent:#2dd4bf}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--border);padding:12px 16px}
header .in{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
header h1{font-size:18px;margin:0;flex:1 1 auto}
input[type=search]{flex:1 1 260px;max-width:420px;font:inherit;padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--fg)}
.wrap{max-width:1100px;margin:0 auto;padding:16px;display:grid;gap:24px}
@media (min-width:900px){.wrap{grid-template-columns:260px minmax(0,1fr)}.toc{position:sticky;top:76px;align-self:start;max-height:calc(100vh - 96px);overflow:auto}}
.toc h3{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:16px 0 4px}.toc ul{list-style:none;margin:0;padding:0}.toc a{display:block;padding:4px 0;color:var(--fg);text-decoration:none}.toc a:hover{color:var(--accent)}
article{border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:24px;background:var(--bg);min-width:0}
article h2{margin:0 0 4px;font-size:22px}article h3{font-size:17px;margin:20px 0 6px}.mod{margin:0;color:var(--accent);font-size:13px;font-weight:600}.who{margin:0 0 12px;color:var(--muted);font-size:14px}
.note{border-left:3px solid var(--accent);background:var(--card);padding:8px 12px;border-radius:6px}
code{font:13px/1.4 ui-monospace,Menlo,monospace;background:var(--card);border:1px solid var(--border);border-radius:4px;padding:1px 4px}
a{color:var(--accent)}.related{font-size:14px;color:var(--muted)}
.mk{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--mk);color:#fff;font-size:12px;font-weight:700;vertical-align:1px;margin:0 2px}
.help-shot{margin:16px 0;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--card)}
.help-shot img{display:block;width:100%;height:auto}
.help-marks{list-style:none;margin:0;padding:10px 14px;display:grid;gap:6px;border-top:1px solid var(--border);font-size:14px}.help-marks li{display:flex;gap:8px;align-items:flex-start}
.empty{color:var(--muted)}
</style></head><body>
<header><div class="in"><h1>Help and guides</h1><input type="search" placeholder="Search the guides" aria-label="Search the guides"></div></header>
<div class="wrap">${toc}<main>${arts}<p class="empty" hidden>No guide matches. Try fewer words.</p></main></div>
<script>
const q=document.querySelector('input[type=search]');
q.addEventListener('input',()=>{const w=q.value.toLowerCase().split(/\\s+/).filter(Boolean);let n=0;
document.querySelectorAll('article').forEach(a=>{const on=w.every(x=>a.dataset.text.includes(x));a.hidden=!on;n+=on;document.querySelectorAll('.toc li[data-art="'+a.dataset.art+'"]').forEach(l=>l.hidden=!on)});
document.querySelector('.empty').hidden=n>0});
</script></body></html>
`;
}

/* ------------------------------------------------------------------ screenshots with numbered markers */
async function shoot(arts) {
  const { chromium } = require(path.join(SH, 'node_modules/playwright'));
  const { routeProto } = require(path.join(SH, 'serve.js'));
  const b = await chromium.launch(); const errors = [];
  for (const a of arts) for (const s of a.shots) for (const c of s.combos) {
    const where = `${rel(a.file)} shot ${s.k} (${c})`;
    const ctx = await b.newContext({ viewport: COMBOS[c].viewport, colorScheme: COMBOS[c].colorScheme, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const pageErrs = [];
    p.on('pageerror', e => pageErrs.push(e.message));
    const route = c === 'phone' ? s.phoneRoute : s.route;
    await routeProto(ctx, route.startsWith('#') ? 'dashboard' : route);
    await p.goto('http://proto/'); await p.waitForTimeout(900);
    try {
      if (route.startsWith('#')) { await p.evaluate(h => { location.hash = h; }, route); await p.waitForTimeout(1000); }
      for (const st of s.steps) {
        if (st.act === 'click') await p.locator(st.arg).filter({ visible: true }).first().click({ timeout: 4000 });
        else if (st.act === 'waitfor') await p.waitForSelector(st.arg, { timeout: 8000 });
        else if (st.act === 'wait') await p.waitForTimeout(+st.arg);
        else if (st.act === 'hash') await p.evaluate(h => { location.hash = h; }, st.arg);
        await p.waitForTimeout(450);
      }
    } catch (e) { errors.push(`${where}: a step failed: ${e.message.split('\n')[0]}`); await ctx.close(); continue; }
    const locs = s.marks.map(m => p.locator(m.sel[c]).filter({ visible: true }).first());
    let ok = true;
    for (const [i, l] of locs.entries()) if (!(await l.count())) { errors.push(`${where}: marker ${i + 1} "${s.marks[i].sel[c]}" matches nothing on the screen`); ok = false; }
    if (!ok) { await ctx.close(); continue; }
    const vp = COMBOS[c].viewport;
    const boxes = async () => Promise.all(locs.map(l => l.boundingBox()));
    const inView = bs => bs.every(r => r && r.y >= 0 && r.y + r.height <= vp.height && r.x >= -1 && r.x < vp.width - 20);   // wider than the screen (a tab strip that scrolls) is fine: the ring is clipped
    await locs[0].scrollIntoViewIfNeeded(); await p.waitForTimeout(250);
    let bs = await boxes();
    if (!inView(bs)) { await locs[0].evaluate(e => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(250); bs = await boxes(); }
    if (!inView(bs)) { errors.push(`${where}: the markers do not fit on one screen; split the shot in two`); await ctx.close(); continue; }
    if (pageErrs.length) errors.push(`${where}: the page had errors: ${pageErrs.join(' | ')}`);
    if (!CHECK) {
      await p.evaluate(list => {
        document.querySelectorAll('[data-proto-only]').forEach(e => { e.style.visibility = 'hidden'; });   // the prototype's own Screens button is not part of the product
        const root = document.createElement('div'); root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
        for (const b of list) {
          const ring = document.createElement('div');
          const l = Math.max(2, b.x - 4), w = Math.min(innerWidth - 2, b.x + b.width + 4) - l;
          ring.style.cssText = `position:absolute;left:${l}px;top:${b.y - 4}px;width:${w}px;height:${b.height + 8}px;border:2.5px solid #ea580c;border-radius:9px;box-shadow:0 0 0 2px rgba(255,255,255,.9)`;
          const dot = document.createElement('div'); dot.textContent = b.n;
          dot.style.cssText = `position:absolute;left:${Math.max(2, Math.min(innerWidth - 30, b.x - 22))}px;top:${Math.max(2, Math.min(innerHeight - 30, b.y - 22))}px;width:26px;height:26px;border-radius:50%;background:#ea580c;color:#fff;font:700 14px/26px Geist,system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px #fff,0 2px 6px rgba(0,0,0,.35)`;
          root.append(ring, dot);
        }
        document.body.appendChild(root);
      }, bs.map((r, i) => ({ ...r, n: i + 1 })));
      const top = Math.min(...bs.map(r => r.y)), bottom = Math.max(...bs.map(r => r.y + r.height));
      let y0 = Math.max(0, top - 90), y1 = Math.min(vp.height, bottom + 90);
      const minH = COMBOS[c].minH; if (y1 - y0 < minH) { const grow = minH - (y1 - y0); y0 = Math.max(0, y0 - grow / 2); y1 = Math.min(vp.height, y0 + minH); y0 = Math.max(0, y1 - minH); }
      const file = path.join(OUT, shotFile(a, s, c));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await p.screenshot({ path: file, clip: { x: 0, y: Math.round(y0), width: vp.width, height: Math.round(y1 - y0) } });
      console.log('shot', path.relative(OUT, file));
    }
    await ctx.close();
  }
  await b.close();
  return errors;
}

/* ------------------------------------------------------------------ main */
(async () => {
  let arts;
  try { arts = readArticles(); } catch (e) { console.error('✗ ' + e.message); process.exit(1); }
  const outs = outputs(arts);
  const errors = [];
  if (CHECK) {
    for (const [name, body] of Object.entries(outs)) {
      const f = path.isAbsolute(name) ? name : path.join(OUT, name);
      if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== body) errors.push(`${rel(f)} is out of date: run node tools/help/build.js --text`);
    }
    for (const a of arts) for (const s of a.shots) for (const c of s.combos) if (!fs.existsSync(path.join(OUT, shotFile(a, s, c)))) errors.push(`${rel(a.file)} shot ${s.k} (${c}): no screenshot yet: run node tools/help/build.js --only ${a.id}`);
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, body] of Object.entries(outs)) fs.writeFileSync(path.isAbsolute(name) ? name : path.join(OUT, name), body);
  }
  if (!TEXT) errors.push(...await shoot(arts.filter(a => !ONLY.length || ONLY.includes(a.id))));
  if (errors.length) { errors.forEach(e => console.error('✗ ' + e)); process.exit(1); }
  console.log(`✓ ${arts.length} help articles, ${arts.reduce((n, a) => n + a.shots.length, 0)} marked shots${CHECK ? ': every marker found, outputs up to date' : ''} (P98)`);
})();
