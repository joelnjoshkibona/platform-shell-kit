
  /* ================================================================ motion (prototype for review): the Design system's Motion tab
     The tokens, then each motion live with a Replay. The demos use the same pieces the screens use (parts_motion.js). */
  const MOTION_TOKENS = [
    ['--dur-fast', '120ms', 'Exits, small swaps, a tab\'s content, press'],
    ['--dur-base', '180ms', 'Most entrances: error lines, collapsibles, the tab pill, skeleton → content'],
    ['--dur-slow', '280ms', 'Things that travel: sheets, a dialog sliding up on a phone, the save bar'],
    ['--ease-standard', 'cubic-bezier(.2,.8,.2,1)', 'Entrances and moves: fast start, soft landing'],
    ['--ease-exit', 'cubic-bezier(.4,0,1,1)', 'Exits: gathers speed and goes'],
  ];
  const MOTION_LIST = [
    ['Dialog and sheet', 'In 160ms (scale .96 → 1 + fade); out 120ms. Under 640px the dialog slides up (280ms) and down (200ms). Sheets 280 in / 200 out. The overlay fades both ways.'],
    ['List rows', 'First load: rows rise 6px, 30ms apart, the first 8 only. A new row is tinted once (1.2s); a deleted row collapses (180ms); a row whose data changed flashes once. Filtering, sorting and searching move nothing.'],
    ['Tabs', 'The active pill slides to the chosen tab (180ms); the tab\'s content fades in (120ms).'],
    ['Save bar', 'Slides up while there are unsaved changes (280ms); Save shows Saved, then the bar slides away (200ms).'],
    ['Validation', 'A refused submit shakes the first field with an error once (6px, 300ms) and focuses it; the error line slides down (180ms).'],
    ['Numbers', 'Totals, KPIs and counts run to their new value (400ms, ease-out, tabular figures). The first render does not count up.'],
    ['Skeleton and collapsibles', 'The skeleton fades out (100ms) and the content in (180ms); a collapsible section opens by height (180ms) and closes (135ms).'],
    ['Press', 'Buttons give to 98% while pressed (80ms); clickable rows to 99.5%.'],
    ['Data draws in', 'Bars fill from 0 (600ms), columns grow from the baseline 40ms apart (at most 12), lines draw (700ms), donut segments sweep (700ms), numbers count up (700ms). Each draws once, when it first comes into view, and again only when its value really changes. Charts below the fold wait until they are scrolled to.'],
  ];

  const DemoDonut = {
    props: { parts: Array },
    setup(p) {
      const seen = useDrawIn(); const R = 38, C = 2 * Math.PI * R;
      const segs = computed(() => { const t = p.parts.reduce((a, x) => a + x, 0) || 1; let acc = 0; return p.parts.map((v, i) => { const len = (v / t) * C; const s = { len: Math.max(0, len - 2), off: -acc, color: 'var(--c' + (i + 1) + ')' }; acc += len; return s; }); });
      return { seen, R, C, segs };
    },
    template: `<svg viewBox="0 0 100 100" class="h-28 w-28 -rotate-90" aria-hidden="true" data-donut><circle cx="50" cy="50" :r="R" fill="none" stroke="hsl(var(--muted))" stroke-width="14"/>
      <circle v-for="(g, i) in segs" :key="i" cx="50" cy="50" :r="R" fill="none" :stroke="g.color" stroke-width="14" :stroke-dasharray="(seen ? g.len : 0) + ' ' + C" :stroke-dashoffset="g.off"
        :style="{ transition: 'stroke-dasharray 700ms var(--ease-standard) ' + (Math.min(i, 12) * 90) + 'ms' }"/></svg>`
  };
  const MotionLab = {
    setup() {
      const S = reactive({ dlg: false, sheet: false, tab: 'a', dirty: false, saved: false, name: '', tried: false, n: 1284, total: 245600, loading: false, open: false, listKey: 0 });
      let seq = 7;
      const ROWS = reactive([{ id: 'r1', n: 'Alpha', k: 'a', v: 12 }, { id: 'r2', n: 'Bravo', k: 'b', v: 40 }, { id: 'r3', n: 'Charlie', k: 'a', v: 7 }, { id: 'r4', n: 'Delta', k: 'c', v: 88 }, { id: 'r5', n: 'Echo', k: 'b', v: 23 }, { id: 'r6', n: 'Foxtrot', k: 'c', v: 61 }]);
      const NAMES = ['Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa'];
      const list = useList({ noun: 'samples', rows: () => ROWS, search: (r, q) => r.n.toLowerCase().includes(q), query: () => '', sorts: [{ value: 'none', label: 'As added', get: r => 0 }], fields: [] });
      const cols = [{ key: 'n', label: 'Name', identity: true, priority: 1, min: 160, text: r => r.n }, { key: 'k', label: 'Kind', priority: 3, min: 90, fold: 'badge', text: r => 'Kind ' + r.k.toUpperCase() }, { key: 'v', label: 'Value', priority: 2, min: 80, right: true, text: r => String(r.v) }];
      const addRow = () => { ROWS.unshift({ id: 'r' + (++seq), n: NAMES[seq % NAMES.length], k: 'abc'[seq % 3], v: Math.round(Math.random() * 99) }); };
      const delRow = () => { if (ROWS.length) ROWS.splice(Math.min(1, ROWS.length - 1), 1); };
      const changeRow = () => { if (!ROWS.length) return; const r = ROWS[Math.floor(Math.random() * ROWS.length)]; r.v = Math.round(Math.random() * 99); };
      const replayList = () => { S.listKey++; };
      const save = () => { S.saved = true; S.dirty = false; setTimeout(() => { S.saved = false; }, 900); };
      const submit = () => { S.tried = true; if (S.name.trim().length < 2) { motionInvalid('[data-motion-form]'); return; } toast('Saved', S.name, 'Check'); S.tried = false; S.name = ''; };
      const bump = () => { S.n = Math.round(800 + Math.random() * 1600); S.total = Math.round(100000 + Math.random() * 400000); };
      const reload = () => { S.loading = true; setTimeout(() => { S.loading = false; }, 900); };
      const money = (n) => Math.round(+n || 0).toLocaleString('en-US');
      const stacked = () => openDialog({ kind: 'info', title: 'A dialog from the stack', text: 'Close it to see it leave: 120ms, or sliding down on a phone.' });
      const DATA = reactive({ k: 0, meter: 64, cols: [12, 30, 22, 41, 35, 52, 47], line: [4, 9, 6, 12, 10, 15, 13, 18], parts: [46, 28, 16, 10] });
      const rnd = (n) => Math.round(5 + Math.random() * n);
      const replayData = () => { DATA.k++; };
      const newData = () => { DATA.meter = rnd(90); DATA.cols = DATA.cols.map(() => rnd(50)); DATA.line = DATA.line.map(() => rnd(14)); DATA.parts = DATA.parts.map(() => rnd(40)); };
      const colMax = computed(() => Math.max(1, ...DATA.cols));
      return { DATA, replayData, newData, colMax, S, ROWS, list, cols, toast, addRow, delRow, changeRow, replayList, save, submit, bump, reload, money, stacked, MOTION_TOKENS, MOTION_LIST };
    },
    template: `<div class="grid grid-cols-[minmax(0,1fr)] gap-4" data-motion-lab>
      <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <h3 class="font-semibold">Motion tokens</h3><p class="text-sm text-muted-foreground">Motion explains a change: something arrives, leaves, moves, changes or was refused. Nothing loops except spinners, nothing moves on hover, and prefers-reduced-motion turns all of it off: values jump, nothing shakes, staggers or slides.</p>
        <div class="mt-3 divide-y rounded-lg border">
          <div v-for="t in MOTION_TOKENS" :key="t[0]" class="grid gap-1 p-3 sm:grid-cols-[11rem_13rem_minmax(0,1fr)] sm:items-center sm:gap-3"><code class="font-mono text-xs">{{ t[0] }}</code><code class="font-mono text-xs text-muted-foreground">{{ t[1] }}</code><p class="text-sm">{{ t[2] }}</p></div>
        </div>
      </section>
      <div class="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="dialog">
          <h3 class="font-semibold">{{ MOTION_LIST[0][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[0][1] }}</p>
          <div class="mt-3 flex flex-wrap gap-2"><Button size="sm" @click="S.dlg=true" data-testid="m-dialog">Dialog</Button><Button size="sm" variant="outline" @click="S.sheet=true" data-testid="m-sheet">Sheet</Button><Button size="sm" variant="outline" @click="stacked" data-testid="m-appdialog">Stacked dialog</Button></div>
          <Dialog v-model:open="S.dlg"><div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">A dialog</h2><p class="text-sm text-muted-foreground">Close it (Esc, Close or the overlay) to see it leave.</p></div>
            <div class="flex justify-end"><Button variant="outline" @click="S.dlg=false" data-testid="m-dialog-close">Close</Button></div></Dialog>
          <Sheet v-model:open="S.sheet"><div class="grid gap-2 p-6 pt-12"><h3 class="font-semibold">A sheet</h3><p class="text-sm text-muted-foreground">It slides in (280ms) and out (200ms).</p></div></Sheet>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="tabs">
          <h3 class="font-semibold">{{ MOTION_LIST[2][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[2][1] }}</p>
          <div class="mt-3"><Tabs v-model="S.tab" :items="[{ value: 'a', label: 'Overview' }, { value: 'b', label: 'Lines', count: ROWS.length }, { value: 'c', label: 'History' }]"/></div>
          <TabPanel :name="S.tab" cls="mt-3 grid gap-2"><div class="rounded-lg border bg-muted/30 p-3 text-sm">{{ S.tab==='a' ? 'Overview: the summary of the record.' : S.tab==='b' ? 'Lines: ' + ROWS.length + ' rows.' : 'History: who changed what, and when.' }}</div></TabPanel>
        </section>
      </div>
      <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="list">
        <div class="flex flex-wrap items-start justify-between gap-2"><div class="min-w-0"><h3 class="font-semibold">{{ MOTION_LIST[1][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[1][1] }}</p></div>
          <div class="flex flex-wrap gap-1.5"><Button size="sm" variant="outline" @click="replayList" data-testid="m-list-replay"><Icon name="RotateCcw" :size="14"/>First load</Button><Button size="sm" variant="outline" @click="addRow" data-testid="m-list-add"><Icon name="Plus" :size="14"/>Add</Button><Button size="sm" variant="outline" @click="changeRow" data-testid="m-list-change"><Icon name="RefreshCw" :size="14"/>Change one</Button><Button size="sm" variant="outline" @click="delRow" data-testid="m-list-delete"><Icon name="Trash2" :size="14"/>Delete</Button></div></div>
        <div class="mt-3 overflow-hidden rounded-lg border"><ListRows :key="S.listKey" :list="list" :rows="list.rows.value" :columns="cols" :clickable="true" @open="r => toast('Opens ' + r.n, '', 'ArrowUpRight')"/></div>
      </section>
      <div class="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="savebar">
          <h3 class="font-semibold">{{ MOTION_LIST[3][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[3][1] }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-3"><label class="flex items-center gap-2 text-sm"><Switch v-model="S.dirty" aria-label="Make a change" data-testid="m-dirty"/>Make a change</label></div>
          <div class="relative mt-3 h-20 overflow-hidden rounded-lg border bg-muted/30">
            <Transition name="savebar"><div v-if="S.dirty || S.saved" class="absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-popover p-2 pl-3 text-sm shadow-lg" data-testid="m-savebar">
              <template v-if="S.dirty"><span class="h-2 w-2 shrink-0 rounded-full bg-warning"></span><span class="font-medium">Unsaved changes</span><span class="flex flex-1 justify-end gap-2"><Button variant="ghost" size="sm" @click="S.dirty=false">Discard</Button><Button size="sm" @click="save" data-testid="m-save"><Icon name="Check" :size="14"/>Save</Button></span></template>
              <template v-else><span class="grid h-5 w-5 place-items-center rounded-full bg-c1/15 text-c1"><Icon name="Check" :size="13"/></span><span class="font-medium" role="status">Saved</span><span class="min-h-8"></span></template>
            </div></Transition></div>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="validation">
          <h3 class="font-semibold">{{ MOTION_LIST[4][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[4][1] }}</p>
          <form class="mt-3 grid gap-3" @submit.prevent="submit" novalidate data-motion-form>
            <div class="grid gap-1.5"><label for="m-name" class="text-sm font-medium after:ml-0.5 after:text-destructive after:content-['*']">Name</label><Input id="m-name" v-model="S.name" placeholder="Leave it empty and submit"/><p v-if="S.tried && S.name.trim().length < 2" class="text-xs text-destructive">Give it a name.</p></div>
            <div class="flex justify-end"><Button type="submit" data-testid="m-submit">Submit</Button></div></form>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="numbers">
          <h3 class="font-semibold">{{ MOTION_LIST[5][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[5][1] }}</p>
          <div class="mt-3 grid grid-cols-2 gap-2"><div class="rounded-xl border bg-card p-3.5"><p class="text-xs font-medium text-muted-foreground">Responses</p><p class="mt-1.5 text-2xl font-semibold tnum"><Num count :value="S.n"/></p></div>
            <div class="rounded-xl border bg-card p-3.5"><p class="text-xs font-medium text-muted-foreground">Total</p><p class="mt-1.5 text-2xl font-semibold tnum"><Num count :value="S.total" :format="money"/></p></div></div>
          <div class="mt-3"><Button size="sm" variant="outline" @click="bump" data-testid="m-bump"><Icon name="RotateCcw" :size="14"/>New values</Button></div>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="skeleton">
          <h3 class="font-semibold">{{ MOTION_LIST[6][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[6][1] }}</p>
          <div class="mt-3 h-24"><Transition name="xfade" mode="out-in">
            <div v-if="S.loading" key="sk" class="grid gap-2" aria-busy="true"><div class="h-4 w-1/2 animate-pulse rounded bg-muted"></div><div class="h-3 w-3/4 animate-pulse rounded bg-muted/70"></div><div class="h-3 w-2/3 animate-pulse rounded bg-muted/70"></div></div>
            <div v-else key="c" class="grid gap-1"><p class="text-sm font-semibold">Arusha Branch</p><p class="text-sm text-muted-foreground">12 people · 3 roles · updated today</p></div></Transition></div>
          <div class="flex flex-wrap gap-2"><Button size="sm" variant="outline" @click="reload" data-testid="m-reload"><Icon name="RotateCcw" :size="14"/>Load again</Button><Button size="sm" variant="outline" :aria-expanded="S.open" @click="S.open=!S.open" data-testid="m-collapse"><Icon :name="S.open ? 'ChevronUp' : 'ChevronDown'" :size="14"/>{{ S.open ? 'Fewer filters' : 'More filters' }}</Button></div>
          <Collapse><div v-if="S.open" class="mt-3 grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm" data-testid="m-collapsible"><p>Created between…</p><p>Type is…</p><p>Location includes the ones under it</p></div></Collapse>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm lg:col-span-2" data-demo="data">
          <div class="flex flex-wrap items-start justify-between gap-2"><div class="min-w-0"><h3 class="font-semibold">{{ MOTION_LIST[8][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[8][1] }}</p></div>
            <div class="flex flex-wrap gap-1.5"><Button size="sm" variant="outline" @click="replayData" data-testid="m-data-replay"><Icon name="RotateCcw" :size="14"/>Replay</Button><Button size="sm" variant="outline" @click="newData" data-testid="m-data-new"><Icon name="RefreshCw" :size="14"/>New values</Button></div></div>
          <div :key="DATA.k" class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
            <div class="grid content-start gap-2 rounded-lg border p-3" data-demo-part="meter"><p class="text-xs font-medium text-muted-foreground">Meter</p><p class="text-xl font-semibold tnum"><Num count :value="DATA.meter"/>%</p>
              <div class="h-2 overflow-hidden rounded-full bg-muted"><Meter :value="DATA.meter" class="rounded-full bg-c1"/></div></div>
            <div class="grid content-start gap-2 rounded-lg border p-3" data-demo-part="columns"><p class="text-xs font-medium text-muted-foreground">Columns</p>
              <div class="flex h-24 items-end gap-1.5"><div v-for="(v, i) in DATA.cols" :key="i" class="flex h-full flex-1 items-end"><Meter axis="y" :value="v / colMax * 100" :duration="700" :delay="Math.min(i, 12) * 40" class="rounded-t-[3px] bg-c1"/></div></div></div>
            <div class="grid content-start gap-2 rounded-lg border p-3" data-demo-part="line"><p class="text-xs font-medium text-muted-foreground">Line</p><Spark :data="DATA.line" class="h-24 w-full"/></div>
            <div class="grid content-start justify-items-center gap-2 rounded-lg border p-3" data-demo-part="donut"><p class="justify-self-start text-xs font-medium text-muted-foreground">Donut</p><DemoDonut :parts="DATA.parts"/></div>
          </div>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm" data-demo="press">
          <h3 class="font-semibold">{{ MOTION_LIST[7][0] }}</h3><p class="mt-1 text-xs text-muted-foreground">{{ MOTION_LIST[7][1] }}</p>
          <div class="mt-3 grid gap-2"><div class="flex flex-wrap gap-2"><Button size="sm">Press and hold</Button><Button size="sm" variant="outline">Outline</Button></div>
            <div class="press-row flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm hover:bg-accent/60" role="button" tabindex="0">A clickable row<Icon name="ChevronRight" :size="16" class="text-muted-foreground"/></div></div>
        </section>
      </div>
    </div>`
  };
