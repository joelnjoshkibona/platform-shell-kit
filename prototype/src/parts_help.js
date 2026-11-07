  /* ================================================================ P98: the user guide (Help and guides)
     The articles live in docs/help/articles/<lang>/*.md; tools/help/build.js turns them into HELP (parts_help_data.js),
     marked screenshots (docs/help/shots) and an HTML page (docs/help/index.html). Nothing here is written by hand
     per article: add an article, run the tool, and it shows on the Help page and under "How do I…" on its screens.
     EXTENSION POINT: an article's `screens:` lists the routes whose "How do I…" button offers it. */
  (() => { const st = document.createElement('style'); st.textContent = `
    .help-body{line-height:1.65}.help-body h2{font-size:1.125rem;font-weight:600;margin:1.25rem 0 .4rem}.help-body h3{font-weight:600;margin:1rem 0 .3rem}
    .help-body p{margin:.5rem 0}.help-body ol{list-style:decimal;padding-left:1.4rem;margin:.5rem 0}.help-body ul{list-style:disc;padding-left:1.4rem;margin:.5rem 0}.help-body li{margin:.25rem 0}
    .help-body a{color:hsl(var(--primary));text-decoration:underline;text-underline-offset:2px}.help-body code{font-family:var(--font-mono,ui-monospace);font-size:.8125rem;background:hsl(var(--muted));border-radius:4px;padding:1px 4px}
    .help-body .note{border-left:3px solid hsl(var(--primary));background:hsl(var(--muted)/.6);padding:.5rem .75rem;border-radius:6px;font-size:.875rem}
    .help-body .mk{display:inline-grid;place-items:center;width:21px;height:21px;border-radius:9999px;background:#ea580c;color:#fff;font-size:11px;font-weight:700;vertical-align:1px;margin:0 2px}
    .help-body .help-shot{margin:1rem 0;border:1px solid hsl(var(--border));border-radius:12px;overflow:hidden;background:hsl(var(--muted)/.4)}
    .help-body .help-shot img{display:block;width:100%;height:auto;min-height:120px;background:hsl(var(--muted))}
    .help-body .help-marks{list-style:none;padding:.6rem .85rem;margin:0;display:grid;gap:.35rem;border-top:1px solid hsl(var(--border));font-size:.875rem}.help-body .help-marks li{display:flex;gap:.5rem;align-items:flex-start;margin:0}`;
    document.head.appendChild(st); })();
  const helpLang = () => 'en';   /* the person's language once the product has more than one (docs/help/articles/<lang>) */
  const helpArts = () => HELP.filter(a => a.lang === helpLang());
  const helpById = (id) => helpArts().find(a => a.id === id);
  const helpFor = (route) => helpArts().filter(a => a.screens.includes(route));
  const helpHtml = (a) => a.html.replace(/@help\//g, HELP_BASE);
  function openHelp(id) { G.helpId = id; G.howDoI = false; nav('help-article'); }
  if (!G.helpId && HELP.length) G.helpId = HELP[0].id;

  /* ---------------------------------------------------------------- Help and guides: search, by module */
  const HelpPage = {
    setup() {
      const q = ref('');
      const shown = computed(() => { const w = q.value.toLowerCase().split(/\s+/).filter(Boolean); return helpArts().filter(a => w.every(x => (a.title + ' ' + a.module + ' ' + a.text).toLowerCase().includes(x))); });
      const groups = computed(() => [...new Set(shown.value.map(a => a.module))].map(m => ({ m, items: shown.value.filter(a => a.module === m) })));
      return { q, shown, groups, openHelp };
    },
    template: `<div class="mx-auto grid max-w-[960px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Help and guides</h2><p class="text-sm text-muted-foreground">How to do each thing, step by step. The numbers on each picture match the steps.</p></div>
      <div class="relative"><Icon name="Search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input v-model="q" type="search" class="pl-9" placeholder="What do you want to do?" aria-label="Search the guides"/></div>
      <p v-if="!shown.length" class="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No guide matches "{{ q }}". Try fewer words.</p>
      <Card v-for="g in groups" :key="g.m" class="overflow-hidden"><div class="border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ g.m }}</div>
        <ul class="divide-y"><li v-for="a in g.items" :key="a.id"><button type="button" class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/60" @click="openHelp(a.id)" :data-help-row="a.id">
          <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="BookOpen" :size="15"/></span>
          <span class="min-w-0 flex-1"><span class="block font-medium">{{ a.title }}</span><span class="line-clamp-2 block text-sm text-muted-foreground">{{ a.summary }}</span></span><Icon name="ChevronRight" :size="16" class="mt-2 shrink-0 text-muted-foreground"/></button></li></ul></Card>
      <p class="text-xs text-muted-foreground">Also as one page to share or print: docs/help/index.html.</p>
    </div>`
  };

  /* ---------------------------------------------------------------- one article */
  const HelpArticlePage = {
    setup() {
      const a = computed(() => helpById(G.helpId) || helpArts()[0]);
      const onClick = (e) => { const l = e.target.closest('[data-help]'); if (l) { e.preventDefault(); openHelp(l.dataset.help); } };
      return { G, a, helpHtml, helpById, openHelp, onClick, nav };
    },
    template: `<div v-if="a" class="mx-auto grid max-w-[860px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex min-w-0 items-center gap-2 text-sm" aria-label="Breadcrumb"><Button variant="outline" size="sm" @click="nav('help')"><Icon name="ArrowLeft" :size="14"/>Back</Button><button type="button" class="hidden shrink-0 text-muted-foreground hover:text-foreground sm:inline" @click="nav('help')">Help and guides</button><Icon name="ChevronRight" :size="14" class="hidden shrink-0 text-muted-foreground sm:block"/><span class="truncate font-medium">{{ a.title }}</span></nav>
      <Card><article class="p-4 sm:p-6" data-testid="help-article">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">{{ a.module }}</p>
        <h2 class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{{ a.title }}</h2>
        <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Icon name="ShieldCheck" :size="14"/>Who can do this: {{ a.who }}</p>
        <div class="help-body mt-3 text-[15px]" v-html="helpHtml(a)" @click="onClick"></div>
        <div v-if="a.related.length" class="mt-6 border-t pt-4"><p class="mb-2 text-sm font-medium">See also</p><div class="flex flex-wrap gap-2"><Button v-for="r in a.related.filter(helpById)" :key="r" variant="outline" size="sm" @click="openHelp(r)"><Icon name="BookOpen" :size="14"/>{{ helpById(r).title }}</Button></div></div>
      </article></Card>
    </div>`
  };

  /* ---------------------------------------------------------------- "How do I…" on every screen (top bar) */
  const HowDoI = {
    setup() {
      const list = computed(() => helpFor(G.view));
      return { G, list, openHelp, nav };
    },
    template: `<Tooltip content="How do I…" side="bottom"><Button variant="ghost" size="icon" aria-label="How do I… (help for this screen)" @click="G.howDoI = true"><Icon name="CircleHelp"/></Button></Tooltip>
      <Sheet :open="!!G.howDoI" @update:open="v => G.howDoI = v"><div class="flex h-full min-h-0 flex-col" data-testid="how-do-i">
        <div class="border-b p-4 pr-12"><h2 class="font-semibold">How do I…</h2><p class="text-sm text-muted-foreground">Guides for this screen.</p></div>
        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <p v-if="!list.length" class="p-3 text-sm text-muted-foreground">No guide for this screen yet.</p>
          <button v-for="a in list" :key="a.id" type="button" class="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent" @click="openHelp(a.id)"><Icon name="BookOpen" :size="15" class="mt-1 shrink-0 text-primary"/><span class="min-w-0"><span class="block text-sm font-medium">{{ a.title }}</span><span class="line-clamp-2 block text-xs text-muted-foreground">{{ a.summary }}</span></span></button>
        </div>
        <div class="border-t p-3"><Button variant="outline" class="w-full" @click="G.howDoI = false; nav('help')"><Icon name="LifeBuoy" :size="15"/>All help and guides</Button></div></div></Sheet>`
  };
