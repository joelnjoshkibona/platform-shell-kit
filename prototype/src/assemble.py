"""Platform shell kit: assemble prototype/src/* into prototype/index.html. Run from anywhere: python3 prototype/src/assemble.py"""
import os, re as _re0
ROOT = os.path.dirname(os.path.abspath(__file__))              # prototype/src
KIT = os.path.abspath(os.path.join(ROOT, '..', '..'))           # kit root
_prod = open(os.path.join(ROOT, 'product.js')).read()
PNAME = _re0.search(r"name:\s*'([^']+)'", _prod).group(1)
PTAG = _re0.search(r"tagline:\s*'([^']+)'", _prod).group(1)
PKEY = _re0.search(r"storageKey:\s*'([^']+)'", _prod).group(1)
import re
SP = ROOT + '/'
B = open(os.path.join(ROOT, 'builder.html')).read()
head = B[:B.index('<div id="app" v-cloak></div>')]
helpers = open(SP + 'product.js').read() + '\n' + open(SP + 'parts_helpers.js').read()
atoms = open(SP + 'parts_atoms.js').read()
resp = open(SP + 'parts_resp.js').read()
respd = open(SP + 'parts_app.js').read()
shell = open(SP + 'parts_shell.js').read()
loc = open(SP + 'parts_loc.js').read()
loc += open(SP + 'parts_list.js').read()
loc += open(SP + 'parts_listcard.js').read()   # P39: ListCard, ListShare, LockedField, exportList
loc += open(SP + 'parts_comp.js').read()
loc += open(SP + 'parts_appr.js').read()
loc += open(SP + 'parts_links.js').read()   # P39: every view has an address (keep last)
# ---- Rules tab: FRONTEND_RULES.md -> sections of HTML (one source, D27)
import html as _h, json as _j
def _inline(t):
    t=_h.escape(t, quote=False)
    t=re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t=re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    return t
def _md(lines):
    out=[]; i=0
    while i<len(lines):
        l=lines[i]
        if not l.strip(): i+=1; continue
        if l.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'): rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i+=1
            head=rows[0]; body=[r for r in rows[2:]]
            out.append('<div class="rules-table"><table><thead><tr>'+''.join('<th>'+_inline(c)+'</th>' for c in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+_inline(c)+'</td>' for c in r)+'</tr>' for r in body)+'</tbody></table></div>'); continue
        if re.match(r'^(- |\d+\. )', l):
            ordered=bool(re.match(r'^\d+\. ', l)); items=[]
            while i<len(lines) and re.match(r'^(- |\d+\. )', lines[i]):
                it=re.sub(r'^(- |\d+\. )','',lines[i]); chk=it.startswith('[ ] ')
                items.append(('<li class="chk">' if chk else '<li>')+_inline(it[4:] if chk else it)+'</li>'); i+=1
            tag='ol' if ordered else 'ul'; out.append('<%s>%s</%s>'%(tag,''.join(items),tag)); continue
        if l.startswith('> '): i+=1; continue
        out.append('<p>'+_inline(l)+'</p>'); i+=1
    return ''.join(out)
_rmd=open(os.path.join(KIT, 'docs', 'FRONTEND_RULES.md')).read().split('\n')
_secs=[]; _cur=None
for _l in _rmd:
    if _l.startswith('## '):
        _cur={'title':_l[3:].strip(),'lines':[]}; _secs.append(_cur)
    elif _cur is not None: _cur['lines'].append(_l)
RULES=[{'id':re.sub(r'[^a-z0-9]+','-',x['title'].lower()).strip('-'),'title':x['title'],'html':_md(x['lines']),'text':re.sub(r'[`*|]','',' '.join(x['lines']))} for x in _secs]
shell = 'const RULES = ' + _j.dumps(RULES).replace('</','<\\/') + ';\n' + shell
_api=_j.load(open(os.path.join(KIT, 'docs', 'components_api.json')))
shell = 'const COMPONENT_API = ' + _j.dumps(_api).replace('</','<\\/') + ';\n' + shell
# COMPONENTS.md = inventory specs (prototype) + API contracts (json), one generated file
import subprocess as _sp
_inv=_j.loads(_sp.check_output(['node', SP + 'extract_ds.js', SP + 'parts_shell.js']))
_md=['# ' + PNAME + ' component library','','> Generated from the prototype Design system page (specs) and components_api.json (API). Do not edit by hand; change the source and rebuild. Read with FRONTEND_RULES.md.','',
     'Use these components; never hand-roll a control that exists here. Missing one? Add it to the library first (spec + API + demo), then use it.','']
_tags={}
for c in _inv: _tags.setdefault(c['tag'],[]).append(c)
_md.append('## Index'); _md.append('')
for t,cs in _tags.items(): _md.append('- **'+t+'**: '+', '.join(c['name'] for c in cs))
for t,cs in _tags.items():
    _md.append(''); _md.append('## '+t)
    for c in cs:
        a=_api.get(c['name'],{})
        _md += ['', '### '+c['name'], '', '`'+(a.get('file') or c['ui'])+'`', '']
        _md += ['| Spec | Value |','| --- | --- |'] + ['| '+k+' | '+v.replace('|','/')+' |' for k,v in c['specs']] + ['| Variants | '+c['variants']+' |','| Used in | '+c['used']+' |']
        if a.get('props'): _md += ['', '| Prop | Type | Default | Notes |','| --- | --- | --- | --- |'] + ['| `'+p[0]+'` | `'+p[1].replace('|','\\|')+'` | '+('`'+p[2]+'`' if p[2] else '–')+' | '+p[3]+' |' for p in a['props']]
        if a.get('emits'): _md += ['', '**Emits:** '+', '.join('`'+e[0]+'`'+(' ('+e[1]+')' if e[1] else '') for e in a['emits'])]
        if a.get('slots'): _md += ['', '**Slots:** '+', '.join('`#'+x[0]+'`'+(' '+x[1] if x[1] else '') for x in a['slots'])]
        if a.get('do'): _md += [''] + ['- Do: '+d for d in a['do']]
        if a.get('dont'): _md += ['- Don\'t: '+d for d in a['dont']]
open(os.path.join(KIT, 'docs', 'COMPONENTS.md'),'w').write('\n'.join(_md)+'\n')
shell = shell.replace('  return { AuthView, ShellView, comps: {', loc + '\n  return { AuthView, ShellView, comps: { ListCard, ListRows, ListShare, LockedField, BackButton, LocationsPage, LocationPage, AssignSheet, ViewAsDialog, ViewAsBanner, NewLocationDialog,', 1)

def rep(s, a, b, count=1):
    assert s.count(a) >= 1, ('missing', a[:80])
    return s.replace(a, b) if count == 0 else s.replace(a, b, count)

# ---------------- head
head = rep(head, '<title>Form Builder Prototype</title>', '<title>' + PNAME + ' Prototype</title>')
head = re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="' + PNAME + ': ' + PTAG + '. Prototype in one clickable prototype.">', head)
head = rep(head, "fa: { DEFAULT:", "c1: 'color-mix(in oklab, var(--c1) calc(<alpha-value> * 100%), transparent)', c2: 'color-mix(in oklab, var(--c2) calc(<alpha-value> * 100%), transparent)', c3: 'color-mix(in oklab, var(--c3) calc(<alpha-value> * 100%), transparent)', c4: 'color-mix(in oklab, var(--c4) calc(<alpha-value> * 100%), transparent)', c5: 'color-mix(in oklab, var(--c5) calc(<alpha-value> * 100%), transparent)',\n      fa: { DEFAULT:")
extra_css = '''
/* chart palette: accent family stepped for charts, validated (CVD + contrast) in both modes; max 5 series then "Other" */
:root{ --c1:#14937f; --c2:#d06d0a; --c3:#2f6fe0; --c4:#d6456a; --c5:#7c5ad8; --c-other:#94a3b8 }
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ --c1:#1f9e89; --c2:#c97514; --c3:#4c82e8; --c4:#dc5577; --c5:#8f73e3; --c-other:#64748b } }
:root[data-theme="dark"]{ --c1:#1f9e89; --c2:#c97514; --c3:#4c82e8; --c4:#dc5577; --c5:#8f73e3; --c-other:#64748b }
.kpi{animation:rise 420ms cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:.001;transform:translateY(6px)}to{opacity:1;transform:none}}
.spark{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 900ms 200ms ease-out forwards}
@keyframes draw{to{stroke-dashoffset:0}}
/* P46: anything drawn in an organisation's accent outside the primary tokens (org badge, swatches) */
.acc-chip{background:hsl(var(--a-l));color:hsl(var(--a-lfg))}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]) .acc-chip{background:hsl(var(--a-d));color:hsl(var(--a-dfg))} }
:root[data-theme="dark"] .acc-chip{background:hsl(var(--a-d));color:hsl(var(--a-dfg))}
/* page transition curtain: the product default here; the organisation's accent overrides it (P41, P46) */
:root{ --curtain:170 62% 46%; --curtain-fg:174 80% 8% }
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ --curtain:166 58% 13%; --curtain-fg:166 40% 92% } }
:root[data-theme="dark"]{ --curtain:166 58% 13%; --curtain-fg:166 40% 92% }
.curtain .half{position:absolute;top:0;bottom:0;width:50.5%;background:hsl(var(--curtain));transition:transform 600ms cubic-bezier(.7,0,.3,1)}
.curtain .half-l{left:0;transform:translateX(-101%);background:linear-gradient(90deg,hsl(var(--curtain)) 0%,hsl(var(--curtain)) 92%,color-mix(in oklab,hsl(var(--curtain)) 80%,black) 100%)}
.curtain .half-r{right:0;transform:translateX(101%);background:linear-gradient(270deg,hsl(var(--curtain)) 0%,hsl(var(--curtain)) 92%,color-mix(in oklab,hsl(var(--curtain)) 80%,black) 100%)}
.curtain[data-state=closing] .half,.curtain[data-state=closed] .half{transform:none;transition-duration:440ms}
.curtain[data-state=closed] .half-l{background:hsl(var(--curtain))}.curtain[data-state=closed] .half-r{background:hsl(var(--curtain))}
.curtain-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transform:scale(.92);transition:opacity 180ms ease,transform 220ms ease}
.curtain[data-state=closed] .curtain-loader{opacity:1;transform:none;transition-delay:300ms}
.boot-spin{position:absolute;inset:0;border-radius:9999px;border:2px solid hsl(var(--curtain-fg) / .25);border-top-color:hsl(var(--curtain-fg));animation:bootspin .8s linear infinite}
@keyframes bootspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#boot-curtain{display:none}}
.anim-paused .kpi,.anim-paused .spark,.anim-paused .pop,.anim-paused .expand{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.curtain{display:none}}
/* sidebar navigation animations */
.nav-push-enter-active,.nav-push-leave-active,.nav-pop-enter-active,.nav-pop-leave-active{transition:transform 280ms cubic-bezier(.2,.8,.2,1),opacity 280ms ease}
.nav-push-enter-from{transform:translateX(100%)}.nav-push-leave-to{transform:translateX(-30%);opacity:0}
.nav-pop-enter-from{transform:translateX(-30%);opacity:0}.nav-pop-leave-to{transform:translateX(100%)}
.nav-fade-enter-active,.nav-fade-leave-active{transition:opacity 180ms ease,transform 180ms ease}.nav-fade-enter-from,.nav-fade-leave-to{opacity:0;transform:scale(.98)}
.nav-fade-leave-active{position:absolute}
.nav-none-enter-active,.nav-none-leave-active{transition:none}
.nav-push-enter-active .nav-item{animation:navin 260ms cubic-bezier(.2,.8,.2,1) both}
@keyframes navin{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
.dd-stagger .nav-sub{animation:navin 220ms cubic-bezier(.2,.8,.2,1) both}
.nav-dd-fade-enter-active,.nav-dd-fade-leave-active{transition:opacity 160ms ease,transform 160ms ease;transform-origin:top}
.nav-dd-fade-enter-from,.nav-dd-fade-leave-to{opacity:0;transform:scaleY(.96)}
.nav-fly-enter-active,.nav-fly-leave-active{transition:opacity 140ms ease,transform 140ms ease}.nav-fly-enter-from,.nav-fly-leave-to{opacity:0;transform:translateX(-4px) scale(.98)}
.rules-prose{font-size:.875rem;line-height:1.6}.rules-prose p{margin:.5rem 0}.rules-prose strong{font-weight:600}
.rules-prose ul,.rules-prose ol{margin:.35rem 0 .75rem;padding-left:1.15rem;display:grid;gap:.3rem}.rules-prose ul{list-style:disc}.rules-prose ol{list-style:decimal}
.rules-prose li::marker{color:hsl(var(--muted-foreground))}.rules-prose li.chk{list-style:none;margin-left:-1.15rem;padding-left:1.6rem;position:relative}
.rules-prose li.chk::before{content:"";position:absolute;left:0;top:.3rem;width:.9rem;height:.9rem;border:1.5px solid hsl(var(--primary));border-radius:4px}
.rules-prose code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.75rem;background:hsl(var(--muted));padding:.05rem .3rem;border-radius:4px;overflow-wrap:anywhere}
.rules-table{overflow-x:auto;margin:.5rem 0;border:1px solid hsl(var(--border));border-radius:.6rem}.rules-table table{width:100%;min-width:560px;border-collapse:collapse;font-size:.8125rem}
.rules-table th{text-align:left;font-weight:500;color:hsl(var(--muted-foreground));font-size:.75rem;padding:.55rem .75rem;border-bottom:1px solid hsl(var(--border))}.rules-table td{padding:.55rem .75rem;border-bottom:1px solid hsl(var(--border));vertical-align:top}.rules-table tr:last-child td{border-bottom:0}
.rt-body{line-height:1.6}.rt-body p{margin:.25rem 0}.rt-body h2{font-size:1.05rem;font-weight:600;margin:.6rem 0 .25rem}.rt-body h3{font-size:.95rem;font-weight:600;margin:.5rem 0 .2rem}
.rt-body ul{list-style:disc;padding-left:1.25rem;margin:.3rem 0}.rt-body ol{list-style:decimal;padding-left:1.25rem;margin:.3rem 0}.rt-body blockquote{border-left:3px solid hsl(var(--border));padding-left:.75rem;color:hsl(var(--muted-foreground));margin:.4rem 0}
.rt-body a{color:hsl(var(--primary));text-decoration:underline;text-underline-offset:3px}.rt-body[contenteditable]:empty:before{content:attr(data-placeholder);color:hsl(var(--muted-foreground));pointer-events:none}
.bar-grow{transform-origin:left;animation:growx 700ms cubic-bezier(.2,.8,.2,1) both}
@keyframes growx{from{transform:scaleX(0)}}
.sheetl-enter-active,.sheetl-leave-active{transition:transform 220ms cubic-bezier(.2,.8,.2,1)}
.sheetl-enter-from,.sheetl-leave-to{transform:translateX(-100%)}
</style>'''
i = head.rindex('</style>'); head = head[:i] + extra_css + head[i + len('</style>'):]

# ---------------- atoms: Sheet gets a side prop
sheet_new = r'''const Sheet = {
  props: { open: Boolean, side: { default: 'right' } }, emits: ['update:open'],
  template: `<Teleport to="body"><Transition name="fade"><div v-if="open" class="fixed inset-0 z-50 bg-black/60" @click="$emit('update:open', false)"></div></Transition>
    <Transition :name="side==='left' ? 'sheetl' : 'sheet'"><div v-if="open" role="dialog" aria-modal="true" :class="['fixed inset-y-0 z-50 flex h-full w-full flex-col bg-background shadow-lg', side==='left' ? 'left-0 max-w-[300px] border-r' : 'right-0 border-l sm:max-w-lg']" style="padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)">
      <button type="button" class="absolute right-4 top-4 z-10 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style="margin-top:env(safe-area-inset-top,0px)" @click="$emit('update:open', false)" aria-label="Close"><Icon name="X" :size="16"/></button>
      <slot/></div></Transition></Teleport>`
};'''
atoms = re.sub(r'const Sheet = \{.*?\n\};', lambda m: sheet_new, atoms, count=1, flags=re.S)

# ---------------- shared global store (after helpers)
views_block = re.search(r'const VIEWS = \{.*?\n\};\nconst TYPE_VIEWS = \{.*?\n\};\n', resp, re.S).group(0)
resp = resp.replace(views_block, '')
shared = '''
/* ================================================================ GLOBAL: router, theme, organisation */
const __SRC = document.documentElement.outerHTML;
const IN_PHONE = !!window.__PHONE;
let storedTheme = 'system'; try { storedTheme = localStorage.getItem(PRODUCT.storageKey + '-theme') || 'system'; } catch (e) {}
const G = reactive({ isShell: () => false, route: window.__INIT_ROUTE || 'login', theme: storedTheme, navCollapsed: false, mobileNav: false, switching: false, newOrg: false, phone: false, view: window.__INIT_ROUTE || 'login', curtain: (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'idle' : 'closed', booting: true, curtainOn: true, search: '', pendingTab: null, responseCount: 0,
  org: { name: 'Kilima Retail', accent: 'teal', require2fa: true, viewDefaults: {} }, toast: () => {} });
function nav(route, sub) { if (G.leaveGuard && G.leaveGuard(route, sub)) return; G.pendingTab = sub || null; G.route = route; G.mobileNav = false; }
/* page transition: two halves close, loader, halves open, then page animations run */
const AREA = (r) => ['login', 'twofa', 'orgpick', 'forgot'].includes(r) ? 'auth' : r; // D13 (revised): every page change outside sign-in plays the curtain, sidebar included
const wait = (ms) => new Promise(r => setTimeout(r, ms));
let curtainBusy = false;
async function runCurtain() {
  if (curtainBusy) return; curtainBusy = true;
  do {
    G.curtain = 'closing'; await wait(440);
    G.curtain = 'closed'; window.scrollTo({ top: 0 }); await wait(window.__SLOW_PAGE === false ? 120 : 620); // prototype simulates a slow page so the loader (shown after 300ms, D13) is visible
    G.view = G.route; await nextTick(); await wait(90);
    G.curtain = 'opening'; await wait(600);
  } while (G.view !== G.route);
  G.curtain = 'idle'; curtainBusy = false;
}
watch(() => G.route, (to, from) => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!G.curtainOn || reduce || AREA(to) === AREA(from)) { if (!curtainBusy) { G.view = to; window.scrollTo({ top: 0 }); } return; }
  runCurtain();
});
function applyGlobalTheme(mode) { const r = document.documentElement; if (mode === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', mode); try { localStorage.setItem(PRODUCT.storageKey + '-theme', mode) } catch (e) {} }
''' + views_block

THEME_GET = "get theme() { return G.theme }, set theme(v) { G.theme = v },"

# ---------------- builder module
bjs = B[B.index('/* ---------------------------------------------------------------- store */'):B.index('const app = createApp(App);')]
bjs = rep(bjs, "  theme: 'system',\n", "  " + THEME_GET + "\n")
bjs = rep(bjs, "try { const t = localStorage.getItem('fb-theme'); if (t) { S.theme = t; } } catch (e) {}", '')
bjs = rep(bjs, "    watch(() => S.theme, applyTheme, { immediate: true });\n", '')
bjs = rep(bjs, 'const App = {\n  setup() {\n    const savedAgo', "const BuilderView = {\n  setup() {\n    if (G.pendingTab) { S.tab = G.pendingTab; G.pendingTab = null; }\n    const savedAgo")
bjs = rep(bjs, "{ value: 'responses', label: 'Responses', count: 0 }", "{ value: 'responses', label: 'Responses', count: G.responseCount }")
bjs = rep(bjs, '<Tabs class="hidden lg:inline-flex" v-model="S.tab" :items="tabs"/>', '<Tabs class="hidden lg:inline-flex" :model-value="S.tab" @update:model-value="setTab" :items="tabs"/>')
bjs = rep(bjs, '<Tabs full v-model="S.tab" :items="tabs"/>', '<Tabs full :model-value="S.tab" @update:model-value="setTab" :items="tabs"/>')
bjs = rep(bjs, '<Tooltip content="All forms" side="bottom"><Button variant="ghost" size="icon" aria-label="Back to all forms">', '<Tooltip content="All forms" side="bottom"><Button variant="ghost" size="icon" aria-label="Back to all forms" @click="nav(\'forms\')">')
bjs = rep(bjs, "    return { S, savedAgo, tabs,", "    const setTab = (v) => v === 'responses' ? nav('responses') : (S.tab = v);\n    return { S, setTab, savedAgo, tabs,")
builder_mod = "/* ================================================================ BUILDER MODULE (iteration 1) */\nconst BuilderMod = (() => {\n" + bjs + "\nreturn { BuilderView, comps: { QuestionCard, SectionHeader, FormRenderer, SettingRow, ChoiceCard, SettingsTab } };\n})();\n"

# ---------------- respondent module
rjs = respd[:respd.index('const app = createApp(App);')]
rjs = rep(rjs, "dev: false, theme: 'system',", "dev: false, " + THEME_GET)
rjs = rep(rjs, "    watch(() => R.theme, applyTheme, { immediate: true });\n", '')
rjs = rep(rjs, "const App = {\n  setup() {\n    const sec = computed", "const RespondentView = {\n  setup() {\n    const sec = computed")
rjs = rep(rjs, "    onMounted(() => {\n      startHumanCheck();", "    onBeforeUnmount(() => { clearInterval(tick); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); setScenario('normal'); });\n    onMounted(() => {\n      startHumanCheck();")
rjs = rep(rjs, '<div class="border-b p-5 pr-12"><h2 class="font-semibold">Prototype states</h2><p class="mt-1 text-sm text-muted-foreground">Jump to any screen, simulate rule breaks, or change the form settings. Not part of the product.</p></div>',
          '<div class="border-b p-5 pr-12"><h2 class="font-semibold">Prototype states</h2><p class="mt-1 text-sm text-muted-foreground">Jump to any screen, simulate rule breaks, or change the form settings. Not part of the product.</p><Button size="sm" variant="outline" class="mt-3" @click="R.dev=false; nav(\'responses\')"><Icon name="ArrowLeft" :size="14"/>Back to admin</Button></div>')
respondent_mod = "/* ================================================================ RESPONDENT MODULE (iteration 2) */\nconst RespondentMod = (() => {\n" + rjs + "\nreturn { RespondentView, comps: { QuestionField } };\n})();\n"

# ---------------- responses module
pjs = resp[:resp.index('const app = createApp(App);')]
pjs = rep(pjs, "open: null, confirmVoid: false, theme: 'system',", "open: null, confirmVoid: false, " + THEME_GET)
pjs = rep(pjs, "    watch(() => S.theme, applyTheme, { immediate: true });\n", '')
pjs = rep(pjs, "const App = {\n  setup() {\n    const tabs", "const ResponsesView = {\n  setup() {\n    const tabs")
pjs = rep(pjs, "function onTab(v) { if (v !== 'responses') toast('Open the builder prototype', 'Questions and Settings live in iteration 1.', 'Info'); }", "function onTab(v) { if (v !== 'responses') nav('builder', v); }")
pjs = rep(pjs, '<Button variant="ghost" size="icon" aria-label="Back to all forms"><Icon name="ChevronLeft"/></Button>', '<Button variant="ghost" size="icon" aria-label="Back to all forms" @click="nav(\'forms\')"><Icon name="ChevronLeft"/></Button>')
pjs = rep(pjs, '<Button size="sm" variant="outline" class="hidden sm:inline-flex"><Icon name="Eye" :size="14"/>View form</Button>', '<Button size="sm" variant="outline" class="hidden sm:inline-flex" @click="nav(\'respondent\')"><Icon name="Eye" :size="14"/>View form</Button>')
pjs = rep(pjs, "    const view = computed(() => S.views[p.q.key] || views[0]);", "    const def = computed(() => G.org.viewDefaults[p.q.type] || views[0]);\n    const view = computed(() => S.views[p.q.key] || def.value);")
pjs = rep(pjs, "if (v === views[0]) delete S.views[p.q.key];", "if (v === def.value) delete S.views[p.q.key];")
pjs = rep(pjs, "(v===views[0] ? ' (default)' : '')", "(v===def ? ' (default)' : '')")
pjs = rep(pjs, "    return { S, st, views, view, isDefault,", "    return { S, st, views, view, def, isDefault,")
for a_, b_ in [('<div class="mx-auto grid max-w-[1120px] gap-3">','<div class="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-3">'),
    ('<div v-if="S.sub===\'summary\'" class="grid gap-3 xl:grid-cols-2">','<div v-if="S.sub===\'summary\'" class="grid grid-cols-[minmax(0,1fr)] gap-3 xl:grid-cols-2">'),
    ("<article :class=\"['kpi rounded-xl border bg-card shadow-sm',","<article :class=\"['kpi min-w-0 rounded-xl border bg-card shadow-sm',"),
    ('<div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">','<div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5 [&>*]:min-w-0">')]:
    pjs = rep(pjs, a_, b_)
responses_mod = "/* ================================================================ RESPONSES MODULE (iteration 3) */\nconst ResponsesMod = (() => {\n" + pjs + "\nG.responseCount = RESP.length;\nreturn { ResponsesView, RESP, comps: { BarsView, DonutView, ColumnsView, RatingSummary, StackedView, HeatmapView, TableView, KpiCard, ChartCard, ResponseSheet } };\n})();\n"

# ---------------- root
root = r'''
/* ================================================================ ROOT */
const ScreensPill = {
  setup() {
    const open = ref(false), root = ref(null);
    const groups = [
      { label: 'Admin', items: [['login', 'Sign in', 'LogIn'], ['twofa', 'Two-step verification', 'ShieldCheck'], ['orgpick', 'Choose organisation', 'Building2'], ['dashboard', 'Dashboard', 'LayoutDashboard'], ['forms', 'Forms list', 'ClipboardList'], ['templates', 'Templates', 'LayoutTemplate'], ['members', 'Users', 'Users'], ['locations', 'Locations', 'MapPin'], ['approvals', 'Approvals inbox', 'Stamp'], ['request-types', 'Approval workflows', 'Workflow'], ['location', 'Location detail', 'Store'], ['roles', 'Roles', 'Shield'], ['role', 'Role detail', 'ShieldCheck'], ['workspace', 'Settings', 'Settings'], ['menus', 'Menu Management', 'ListTree'], ['design', 'Design system', 'Palette']] },
      { label: 'Inside a form', items: [['builder', 'Builder: questions and settings', 'PencilRuler'], ['responses', 'Results and responses', 'ChartBarBig']] },
      { label: 'Respondent', items: [['respondent', 'Live form (respondent flow)', 'Smartphone']] },
    ];
    const onDoc = (e) => { if (open.value && root.value && !root.value.contains(e.target)) open.value = false; };
    onMounted(() => document.addEventListener('pointerdown', onDoc));
    onBeforeUnmount(() => document.removeEventListener('pointerdown', onDoc));
    function go(r) { open.value = false; nav(r); }
    function phone(v) { open.value = false; G.phone = v; }
    return { open, root, groups, go, G, phone, IN_PHONE };
  },
  template: `<div ref="root" :class="['fixed z-[45]', G.route==='builder' ? 'bottom-20 lg:bottom-4' : 'bottom-4', G.isShell(G.route) ? (G.navCollapsed ? 'left-3 lg:left-[76px]' : 'left-3 lg:left-[252px]') : 'left-3']" style="margin-bottom:env(safe-area-inset-bottom,0px)">
    <div v-if="open" class="pop absolute bottom-full left-0 mb-2 w-72 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-xl" role="menu">
      <div v-if="!IN_PHONE" class="hidden p-1 sm:block"><div class="grid grid-cols-2 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="View as">
        <button type="button" role="radio" :aria-checked="!G.phone" @click="phone(false)" :class="['flex h-7 items-center justify-center gap-1.5 rounded text-xs font-medium', !G.phone ? 'bg-background shadow' : 'text-muted-foreground']"><Icon name="Monitor" :size="13"/>Desktop</button>
        <button type="button" role="radio" :aria-checked="G.phone" @click="phone(true)" :class="['flex h-7 items-center justify-center gap-1.5 rounded text-xs font-medium', G.phone ? 'bg-background shadow' : 'text-muted-foreground']"><Icon name="Smartphone" :size="13"/>Phone</button></div></div>
      <label class="mx-1 mt-1 flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent"><span class="flex items-center gap-2"><Icon name="Columns2" :size="15" class="text-muted-foreground"/>Page transition</span><Switch v-model="G.curtainOn"/></label>
      <p class="px-2 pb-1 pt-1.5 text-xs text-muted-foreground">Jump to any screen in the prototype.</p>
      <template v-for="g in groups" :key="g.label"><p class="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ g.label }}</p>
        <button v-for="it in g.items" :key="it[0]" type="button" role="menuitem" @click="go(it[0])" :class="['flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent', G.route===it[0] ? 'bg-accent font-medium' : '']"><Icon :name="it[2]" :size="15" class="text-muted-foreground"/>{{ it[1] }}</button></template>
    </div>
    <button type="button" @click="open=!open" :aria-expanded="open" class="inline-flex items-center gap-2 rounded-full border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg hover:bg-accent"><Icon name="Map" :size="14"/>Screens</button>
  </div>`
};
const ROUTE_LABEL = new Proxy({ login: 'Sign in', twofa: 'Sign in', orgpick: 'Organisations', forgot: 'Sign in', forms: 'Forms', templates: 'Templates', members: 'Users', workspace: 'Settings', menus: 'Menu Management', design: 'Design system', builder: 'Builder', responses: 'Results', respondent: 'Live form' }, { get: (t, k) => t[k] || (typeof k === 'string' ? k.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()) : undefined) });
const Curtain = {
  setup() { return { G, ROUTE_LABEL, PRODUCT }; },
  template: `<div class="curtain pointer-events-none fixed inset-0 z-[120]" :data-state="G.curtain" aria-hidden="true" :class="G.curtain!=='idle' && 'pointer-events-auto'">
    <div class="half half-l"></div><div class="half half-r"></div>
    <div class="curtain-loader" role="status" :aria-hidden="G.curtain!=='closed'">
      <div class="relative grid h-16 w-16 place-items-center">
        <span class="absolute inset-0 animate-spin rounded-full border-2" style="animation-duration:.8s;border-color:hsl(var(--curtain-fg) / .25);border-top-color:hsl(var(--curtain-fg))"></span>
        <span class="grid h-11 w-11 place-items-center rounded-xl" style="background:hsl(var(--curtain-fg) / .15);color:hsl(var(--curtain-fg))"><BrandMark :size="20"/></span>
      </div>
      <p class="mt-4 text-sm font-medium" style="color:hsl(var(--curtain-fg))">{{ G.booting ? 'Loading ' + PRODUCT.name + '…' : 'Opening ' + (ROUTE_LABEL[G.route] || 'page') + '…' }}</p>
    </div></div>`
};
const PhoneFrame = {
  setup() {
    const scale = ref(1);
    const fit = () => { scale.value = Math.min(1, (window.innerHeight - 96) / 880, (window.innerWidth - 32) / 414); };
    onMounted(() => { fit(); window.addEventListener('resize', fit); });
    onBeforeUnmount(() => window.removeEventListener('resize', fit));
    const doc = __SRC.replace(/<head([^>]*)>/i, (m) => m + '<script>window.__PHONE=true;window.__INIT_ROUTE=' + JSON.stringify(G.route) + ';<\/script>');
    const clock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return { G, scale, doc, clock, PRODUCT };
  },
  template: `<div class="fixed inset-0 z-[80] flex flex-col items-center overflow-auto bg-canvas px-4 py-4">
    <div class="mb-3 flex w-full max-w-md items-center justify-between gap-3">
      <p class="text-sm font-medium">Phone view <span class="font-normal text-muted-foreground">· 390 × 844</span></p>
      <Button size="sm" variant="outline" @click="G.phone=false"><Icon name="Monitor" :size="14"/>Back to desktop</Button></div>
    <div :style="{ width: (414*scale)+'px', height: (880*scale)+'px' }" class="shrink-0">
      <div class="origin-top-left" :style="{ transform: 'scale(' + scale + ')', width: '414px', height: '880px' }">
        <div class="relative flex h-[880px] w-[414px] flex-col overflow-hidden rounded-[56px] border-[12px] border-[#18181b] bg-background shadow-2xl ring-1 ring-black/10">
          <div class="relative flex h-11 shrink-0 items-center justify-between bg-background px-7 text-[13px] font-semibold tnum"><span>{{ clock }}</span>
            <span class="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-[#18181b]" aria-hidden="true"></span>
            <span class="flex items-center gap-1"><Icon name="Signal" :size="14"/><Icon name="Wifi" :size="14"/><Icon name="BatteryFull" :size="16"/></span></div>
          <iframe :srcdoc="doc" :title="PRODUCT.name + ' on a phone'" class="block w-full flex-1 border-0 bg-background"></iframe>
          <div class="flex h-6 shrink-0 items-center justify-center bg-background"><span class="h-1 w-32 rounded-full bg-foreground/80"></span></div>
        </div></div></div>
    <p class="mt-3 max-w-md text-center text-xs text-muted-foreground">The phone runs its own copy of the prototype. Use its Screens button to move around.</p>
  </div>`
};
const RootApp = {
  setup() {
    watch(() => G.theme, applyGlobalTheme, { immediate: true });
    // P46: the organisation's accent applies once someone is signed in (sign-in, switch, first load); sign-in keeps the last one this browser saw
    watch(() => [G.org && G.org.accent, AREA(G.view) === 'auth'], ([a, auth]) => { if (!auth && a) applyAccent(a); }, { immediate: true });
    // initial load: curtain starts closed (also in the static HTML), opens once the app is ready (D13)
    onMounted(async () => {
      const pre = document.getElementById('boot-curtain'); if (pre) pre.remove();
      if (G.curtain !== 'closed') { G.booting = false; return; }
      await (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve());
      await wait(500);
      G.curtain = 'opening'; await wait(600); G.curtain = 'idle'; G.booting = false;
    });
    return { G };
  },
  template: `<PhoneFrame v-if="G.phone"/>
    <div v-else :class="(G.curtain==='closing' || G.curtain==='closed') ? 'anim-paused' : ''">
    <AuthView v-if="['login','twofa','orgpick','forgot'].includes(G.view)"/>
    <ShellView v-else-if="G.isShell(G.view)"/>
    <BuilderView v-else-if="G.view==='builder'"/>
    <ResponsesView v-else-if="G.view==='responses'"/>
    <RespondentView v-else/>
    <ScreensPill v-if="G.view!=='respondent'"/>
    </div>
    <Curtain/>`
};
const app = createApp(RootApp);
app.config.globalProperties.nav = nav;
app.config.globalProperties.G = G;
app.config.globalProperties.ACCENTS = ACCENTS;
app.config.globalProperties.RESP = ResponsesMod.RESP;
app.config.globalProperties.PRODUCT = PRODUCT;
Object.entries(Object.assign(
  { Icon, Button, Input, Textarea, Label, Switch, Checkbox, RadioGroupItem, Badge, Card, Separator, Select, DropdownMenu, Tooltip, Dialog, Sheet, Tabs, ScreensPill, PhoneFrame, Curtain,
    BuilderView: BuilderMod.BuilderView, RespondentView: RespondentMod.RespondentView, ResponsesView: ResponsesMod.ResponsesView, AuthView: ShellMod.AuthView, ShellView: ShellMod.ShellView },
  BuilderMod.comps, RespondentMod.comps, ResponsesMod.comps, ShellMod.comps)).forEach(([n, c]) => app.component(n, c));
app.mount('#app');
</script>
'''

_logo = _re0.search(r"logo:\s*'(<svg[^']*)'", _prod)
BOOT_MARK = _logo.group(1).replace('<svg', '<svg width="20" height="20" aria-hidden="true"', 1) if _logo else PNAME[0]   # P48: the product's mark, else its initial
BOOT = '''<div id="boot-curtain" class="curtain" data-state="closed" aria-hidden="true" style="position:fixed;inset:0;z-index:121">
  <div class="half half-l"></div><div class="half half-r"></div>
  <div class="curtain-loader" style="opacity:1;transform:none;transition:none">
    <div style="position:relative;width:64px;height:64px;display:grid;place-items:center">
      <span class="boot-spin"></span>
      <span style="display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:hsl(var(--curtain-fg) / .15);color:hsl(var(--curtain-fg));font:600 18px/1 Geist,system-ui,sans-serif">' + BOOT_MARK + '</span>
    </div>
    <p style="margin-top:16px;font:500 14px/1.4 Geist,system-ui,sans-serif;color:hsl(var(--curtain-fg))">Loading ' + PNAME + '…</p>
  </div></div>'''.replace("' + BOOT_MARK + '", BOOT_MARK).replace("' + PNAME + '", PNAME)   # the boot curtain is plain HTML: fill the product's mark and name
BOOT_ACCENT = '<script>/* P46: last accent this browser saw, before anything paints */try{var __a=localStorage.getItem(' + repr(PKEY + '-accent') + ');if(__a){var __s=document.createElement("style");__s.id="org-accent";__s.textContent=__a;document.head.appendChild(__s)}}catch(e){}</script>\n'
out = head + BOOT_ACCENT + BOOT + '<div id="app"></div>\n<script>\n' + helpers + shared + atoms + builder_mod + respondent_mod + responses_mod + shell + root
open(os.path.join(KIT, 'prototype', 'index.html'), 'w').write(out)
print('ok', len(out))
