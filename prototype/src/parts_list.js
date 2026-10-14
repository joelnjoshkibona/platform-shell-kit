
  /* ================================================================ LISTS, REFRESH, SEARCH, DASHBOARD (D29–D32) */
  const TODAY = new Date('2026-10-10T12:00:00');
  const isoDay = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const daysAgo = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() - n); return isoDay(d); };
  /* the mock data carries "2h ago"-style strings; turn them into dates so date filters have something real to compare */
  function relToIso(s) {
    s = (s || '').toLowerCase(); let m;
    if (/now|min ago|h ago|hour ago|today/.test(s)) return daysAgo(0);
    if (s === 'yesterday') return daysAgo(1);
    if ((m = s.match(/(\d+) days? ago/))) return daysAgo(+m[1]);
    if (s === 'last week') return daysAgo(7);
    if ((m = s.match(/(\d+) weeks? ago/))) return daysAgo(+m[1] * 7);
    if ((m = s.match(/^([a-z]{3}) (\d{4})$/))) return m[2] + '-' + String('janfebmaraprmayjunjulaugsepoctnovdec'.indexOf(m[1]) / 3 + 1).padStart(2, '0') + '-15';
    return daysAgo(30);
  }
  const fmtDay = (iso) => { if (!iso) return ''; const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const nowTick = ref(Date.now()); setInterval(() => { nowTick.value = Date.now(); }, 20000);
  const ago = (t) => { const s = Math.max(0, Math.round((nowTick.value - t) / 1000)); return s < 45 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : Math.round(s / 3600) + ' h ago'; };

  /* ---------- operators (mirrors Cobley's lib/operators.ts) */
  const OPS = {
    text: ['contains', 'eq', 'neq', 'begins', 'ends', 'null', 'not_null'],
    number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'null', 'not_null'],
    date: ['eq', 'gt', 'lt', 'between', 'null', 'not_null'],
    select: ['in', 'nin', 'eq', 'neq', 'null', 'not_null'],
    select_paginated: ['in', 'nin', 'null', 'not_null'],
    boolean: ['eq'],
  };
  const OP_LABEL = { contains: 'contains', eq: 'is', neq: 'is not', begins: 'begins with', ends: 'ends with', gt: 'greater than', gte: 'at least', lt: 'less than', lte: 'at most', between: 'between', in: 'is any of', nin: 'is none of', null: 'is empty', not_null: 'is not empty' };
  const opLabel = (type, op) => type === 'date' ? ({ gt: 'after', lt: 'before', eq: 'on' }[op] || OP_LABEL[op]) : OP_LABEL[op];
  const defaultOp = (type) => (type === 'select' || type === 'select_paginated') ? 'in' : ['boolean', 'date', 'number'].includes(type) ? 'eq' : 'contains';
  const noValue = (op) => op === 'null' || op === 'not_null';
  const emptyFor = (op) => op === 'between' ? ['', ''] : (op === 'in' || op === 'nin') ? [] : '';
  function matchOne(v, f) {
    const { op, value } = f; const empty = v === null || v === undefined || v === '';
    if (op === 'null') return empty; if (op === 'not_null') return !empty; if (empty) return false;
    const s = String(v).toLowerCase(), q = String(value).toLowerCase();
    switch (op) {
      case 'contains': return s.includes(q); case 'begins': return s.startsWith(q); case 'ends': return s.endsWith(q);
      case 'eq': return typeof v === 'number' ? v === +value : s === q; case 'neq': return typeof v === 'number' ? v !== +value : s !== q;
      case 'gt': return v > (typeof v === 'number' ? +value : value); case 'gte': return v >= +value; case 'lt': return v < (typeof v === 'number' ? +value : value); case 'lte': return v <= +value;
      case 'between': return typeof v === 'number' ? v >= +value[0] && v <= +value[1] : v >= value[0] && v <= value[1];
      case 'in': return value.includes(v); case 'nin': return !value.includes(v);
    }
    return true;
  }

  /* ---------- useList: client-side stand-in for Cobley's useServerTable + useListFilters + useListSort */
  function useList(o) {
    const S = reactive({ _defSort: { sort: o.sort || o.sorts[0].value, dir: o.dir || 'asc' }, filters: {}, sort: o.sort || o.sorts[0].value, dir: o.dir || 'asc', loading: false, first: true, updatedAt: Date.now(), open: false, mode: 'simple', draft: {} });
    setTimeout(() => { S.first = false; }, 0);
    // P39: o.scope() = { fieldKey: parentId } (locked pre-filter, that field leaves the filters); o.query() = the list's own search text
    const allFields = computed(() => typeof o.fields === 'function' ? o.fields() : o.fields);
    const scopeOf = () => (o.scope && o.scope()) || {};
    const fields = computed(() => allFields.value.filter(f => !(f.key in scopeOf())));
    const activeCount = computed(() => Object.keys(S.filters).length);
    const rows = computed(() => {
      const q = ((o.query ? o.query() : G.search) || '').trim().toLowerCase();
      const sc = Object.entries(scopeOf()).map(([k, v]) => [allFields.value.find(x => x.key === k), v]).filter(x => x[0]);
      const eff = Object.entries(S.filters).map(([k, f]) => { const fd = fields.value.find(x => x.key === k); return [fd, fd.type === 'select_paginated' && fd.module === 'locations' && f.below && Array.isArray(f.value) ? { ...f, value: [...new Set(f.value.flatMap(id => subtreeIds(id)))] } : f]; });
      let r = o.rows().filter(x => sc.every(([fd, v]) => { const g = fd.get(x); return Array.isArray(g) ? g.includes(v) : g === v; }) && (!q || o.search(x, q)) && eff.every(([fd, f]) => matchOne(fd.get(x), f)));
      const sd = o.sorts.find(s => s.value === S.sort); if (sd) { r = [...r].sort((a, b) => { const A = sd.get(a), B = sd.get(b); return (A > B ? 1 : A < B ? -1 : 0) * (S.dir === 'asc' ? 1 : -1); }); }
      return r;
    });
    function refresh() { if (S.loading) return; S.loading = true; setTimeout(() => { S.loading = false; S.updatedAt = Date.now(); }, 700); }
    function openFilters() {
      const d = {}; let adv = false;
      fields.value.forEach(f => { const ex = S.filters[f.key]; const def = defaultOp(f.type); if (ex) { d[f.key] = { op: ex.op, value: JSON.parse(JSON.stringify(ex.value)), below: ex.below !== false }; if (ex.op !== def) adv = true; } else d[f.key] = { op: def, value: emptyFor(def), below: true }; });
      S.draft = d; S.mode = adv ? 'advanced' : 'simple'; S.open = true;
    }
    function setMode(adv) { if (!adv) fields.value.forEach(f => { const def = defaultOp(f.type); if (S.draft[f.key].op !== def) S.draft[f.key] = { op: def, value: emptyFor(def) }; }); S.mode = adv ? 'advanced' : 'simple'; }
    function setOp(k, op) { S.draft[k] = { op, value: emptyFor(op), below: S.draft[k] ? S.draft[k].below : true }; }
    const canApply = computed(() => Object.values(S.draft).every(d => d.op !== 'between' || (!!d.value[0] === !!d.value[1])));
    function apply() {
      const out = {};
      Object.entries(S.draft).forEach(([k, d]) => {
        if (noValue(d.op)) out[k] = { op: d.op, value: '' };
        else if (d.op === 'between') { if (d.value[0] && d.value[1]) out[k] = { op: d.op, value: [...d.value] }; }
        else if (Array.isArray(d.value)) { if (d.value.length) out[k] = { op: d.op, value: [...d.value], below: d.below }; }
        else if (d.value !== '' && d.value !== null && d.value !== undefined) out[k] = { op: d.op, value: d.value };
      });
      S.filters = out; S.open = false; refresh();
    }
    function clearAll() { S.filters = {}; S.draft = {}; S.mode = 'simple'; refresh(); }
    function setFilter(k, f) { if (f) S.filters[k] = f; else delete S.filters[k]; refresh(); }
    function chips() { return Object.entries(S.filters).map(([k, f]) => { const fd = fields.value.find(x => x.key === k); const val = noValue(f.op) ? '' : f.op === 'between' ? f.value.map(v => fd.type === 'date' ? fmtDay(v) : v).join(' – ') : Array.isArray(f.value) ? f.value.map(v => fd.type === 'select_paginated' ? ((LABELS[lkey(fd.module, v)] || {}).label || v) : (fd.options.find(op => op.value === v) || { label: v }).label).join(', ') + (fd.type === 'select_paginated' && fd.module === 'locations' && f.below ? ' and below' : '') : fd.type === 'date' ? fmtDay(f.value) : fd.type === 'boolean' ? (f.value === 'yes' ? 'Yes' : 'No') : '"' + f.value + '"'; return { key: k, text: fd.label + ' ' + opLabel(fd.type, f.op) + (val ? ' ' + val : '') }; }); }
    return { S, rows, fields, scoped: computed(() => Object.keys(scopeOf()).length > 0), sorts: o.sorts, activeCount, refresh, openFilters, setMode, setOp, canApply, apply, clearAll, setFilter, chips, noun: o.noun || 'records' };
  }

  /* ---------- Date picker (no native pickers, rules): month + year switchers inside the calendar card; popover on desktop, modal on phones */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DatePicker = {
    props: { modelValue: String, placeholder: { default: 'Pick a date' }, size: { default: 'default' }, align: { default: 'start' }, label: String, min: String, max: String },
    emits: ['update:modelValue'],
    setup(p, { emit }) {
      const pop = usePopover(() => p.align);
      const modal = ref(false);
      const V = reactive({ y: 2026, m: 9, mode: 'days', yStart: 2020, focus: '' });
      function seed() { const d = new Date((p.modelValue || isoDay(TODAY)) + 'T12:00:00'); V.y = d.getFullYear(); V.m = d.getMonth(); V.mode = 'days'; V.yStart = V.y - (V.y % 12); V.focus = p.modelValue || isoDay(TODAY); }
      watch(pop.open, v => { if (v) seed(); });
      watch(modal, v => { if (v) seed(); });
      const isOpen = computed(() => pop.open.value || modal.value);
      function openIt() { if (isPhoneNow()) modal.value = true; else pop.open.value = !pop.open.value; }
      function close() { pop.open.value = false; modal.value = false; }
      const cells = computed(() => { const first = new Date(V.y, V.m, 1); const start = (first.getDay() + 6) % 7; const out = []; for (let i = 0; i < 42; i++) { const d = new Date(V.y, V.m, 1 - start + i); out.push({ iso: isoDay(d), day: d.getDate(), out: d.getMonth() !== V.m }); } return out; });
      const off = (iso) => (p.min && iso < p.min) || (p.max && iso > p.max);
      function shift(n) {
        if (V.mode === 'days') { const d = new Date(V.y, V.m + n, 1); V.y = d.getFullYear(); V.m = d.getMonth(); }
        else if (V.mode === 'months') V.y += n;
        else V.yStart += 12 * n;
      }
      function pick(iso) { if (off(iso)) return; emit('update:modelValue', iso); close(); }
      function pickMonth(m) { V.m = m; V.mode = 'days'; }
      function pickYear(y) { V.y = y; V.mode = 'months'; }
      function toggle(mode) { V.mode = V.mode === mode ? 'days' : mode; if (mode === 'years') V.yStart = V.y - (V.y % 12); }
      function onKey(e) {
        if (V.mode !== 'days') { if (e.key === 'Escape') { e.preventDefault(); V.mode = 'days'; } return; }
        const d = new Date(V.focus + 'T12:00:00'); const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (step) { e.preventDefault(); d.setDate(d.getDate() + step); V.focus = isoDay(d); V.y = d.getFullYear(); V.m = d.getMonth(); }
        if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); shift(e.key === 'PageUp' ? -1 : 1); }
        if (e.key === 'Enter') { e.preventDefault(); pick(V.focus); }
        if (e.key === 'Escape') close();
      }
      const years = computed(() => Array.from({ length: 12 }, (_, i) => V.yStart + i));
      const title = computed(() => V.mode === 'years' ? V.yStart + ' – ' + (V.yStart + 11) : '');
      return { ...pop, modal, V, isOpen, openIt, close, cells, shift, pick, pickMonth, pickYear, toggle, onKey, years, title, off, MONTHS, today: isoDay(TODAY), fmtDay, curY: TODAY.getFullYear(), curM: TODAY.getMonth() };
    },
    template: `<div class="relative" ref="root">
      <button type="button" @click="openIt" :aria-expanded="isOpen" aria-haspopup="dialog" :aria-label="(label ? label + ': ' : '') + (modelValue ? fmtDay(modelValue) : placeholder)" :class="['flex w-full items-center gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring', size==='sm' ? 'h-8 text-xs' : 'h-9']">
        <Icon name="CalendarDays" :size="15" class="shrink-0 text-muted-foreground"/><span :class="['flex-1 truncate', !modelValue && 'text-muted-foreground']">{{ modelValue ? fmtDay(modelValue) : placeholder }}</span>
        <span v-if="modelValue" role="button" tabindex="0" aria-label="Clear date" @click.stop="$emit('update:modelValue','')" class="text-muted-foreground hover:text-foreground"><Icon name="X" :size="14"/></span></button>
      <Teleport to="body">
        <Transition name="fade"><div v-if="modal" class="fixed inset-0 z-[95] bg-black/70" @click="close"></div></Transition>
        <div v-if="open || modal" ref="panel" :style="modal ? null : pos" @keydown="onKey" role="dialog" aria-modal="true" aria-label="Choose a date"
          :class="['pop z-[96] border bg-popover text-popover-foreground shadow-lg', modal ? 'fixed inset-x-0 bottom-0 rounded-t-xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]' : 'fixed w-[18rem] rounded-lg p-3']">
          <div v-if="modal" class="mb-3 flex items-center justify-between"><p class="font-semibold">{{ label || 'Select date' }}</p><Button variant="ghost" size="icon-sm" aria-label="Close" @click="close"><Icon name="X" :size="16"/></Button></div>
          <div :class="['mx-auto', modal ? 'max-w-sm' : '']">
            <!-- header: prev · [Month ▾][Year ▾] · next, all inside the card -->
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" :aria-label="V.mode==='days' ? 'Previous month' : V.mode==='months' ? 'Previous year' : 'Previous years'" @click="shift(-1)"><Icon name="ChevronLeft" :size="15"/></Button>
              <div class="flex min-w-0 flex-1 items-center justify-center gap-1">
                <template v-if="V.mode==='years'"><span class="text-sm font-medium tnum">{{ title }}</span></template>
                <template v-else>
                  <button type="button" @click="toggle('months')" :aria-expanded="V.mode==='months'" :class="['inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium hover:bg-accent', V.mode==='months' && 'bg-accent']">{{ MONTHS[V.m] }}<Icon name="ChevronDown" :size="13" :class="['text-muted-foreground transition-transform', V.mode==='months' && 'rotate-180']"/></button>
                  <button type="button" @click="toggle('years')" :aria-expanded="V.mode==='years'" class="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium tnum hover:bg-accent">{{ V.y }}<Icon name="ChevronDown" :size="13" class="text-muted-foreground"/></button>
                </template>
              </div>
              <Button variant="ghost" size="icon-sm" :aria-label="V.mode==='days' ? 'Next month' : V.mode==='months' ? 'Next year' : 'Next years'" @click="shift(1)"><Icon name="ChevronRight" :size="15"/></Button>
            </div>
            <div :class="modal ? 'min-h-[17.75rem]' : 'min-h-[14.5rem]'"><!-- fixed height: switching to months/years never resizes the card -->
            <!-- days -->
            <template v-if="V.mode==='days'">
              <div class="mt-2 grid grid-cols-7 text-center text-[11px] text-muted-foreground"><span v-for="d in ['Mo','Tu','We','Th','Fr','Sa','Su']" :key="d" class="py-1">{{ d }}</span></div>
              <div class="grid grid-cols-7 gap-0.5" role="grid">
                <button v-for="c in cells" :key="c.iso" type="button" @click="pick(c.iso)" :disabled="off(c.iso)" :tabindex="c.iso===V.focus ? 0 : -1" :aria-label="fmtDay(c.iso)" :aria-pressed="c.iso===modelValue"
                  :class="['rounded-md text-sm tnum disabled:pointer-events-none disabled:opacity-30', modal ? 'h-10' : 'h-8', c.iso===modelValue ? 'bg-primary text-primary-foreground' : c.iso===today ? 'bg-accent font-semibold' : 'hover:bg-accent', c.out && c.iso!==modelValue ? 'text-muted-foreground/50' : '', c.iso===V.focus && c.iso!==modelValue ? 'ring-1 ring-ring' : '']">{{ c.day }}</button></div>
            </template>
            <!-- months -->
            <div v-else-if="V.mode==='months'" class="mt-2 grid grid-cols-3 gap-1.5" role="listbox" aria-label="Month">
              <button v-for="(mn, i) in MONTHS" :key="mn" type="button" role="option" :aria-selected="i===V.m" @click="pickMonth(i)" :class="['rounded-md text-sm', modal ? 'h-12' : 'h-10', i===V.m ? 'bg-primary text-primary-foreground' : (i===curM && V.y===curY) ? 'bg-accent font-semibold' : 'hover:bg-accent']">{{ mn.slice(0, 3) }}</button></div>
            <!-- years -->
            <div v-else class="mt-2 grid grid-cols-3 gap-1.5" role="listbox" aria-label="Year">
              <button v-for="y in years" :key="y" type="button" role="option" :aria-selected="y===V.y" @click="pickYear(y)" :class="['rounded-md text-sm tnum', modal ? 'h-12' : 'h-10', y===V.y ? 'bg-primary text-primary-foreground' : y===curY ? 'bg-accent font-semibold' : 'hover:bg-accent']">{{ y }}</button></div>
            </div>
            <div class="mt-2 flex justify-between border-t pt-2"><Button variant="ghost" size="sm" class="h-8" @click="pick(today)">Today</Button><Button variant="ghost" size="sm" class="h-8" @click="$emit('update:modelValue',''); close()">Clear</Button></div>
          </div>
        </div>
      </Teleport></div>`
  };

  /* ---------- Refresh button (D32) */
  const RefreshButton = {
    props: { loading: Boolean, updatedAt: Number, iconOnly: Boolean },
    emits: ['refresh'],
    setup() { return { ago }; },
    template: `<Tooltip :content="'Updated ' + ago(updatedAt)" side="bottom"><Button variant="ghost" size="sm" :class="['gap-1.5', iconOnly ? 'w-8 px-0' : 'max-sm:w-8 max-sm:px-0']" :disabled="loading" @click="$emit('refresh')" :aria-label="'Refresh, updated ' + ago(updatedAt)">
      <Icon name="RefreshCw" :size="15" :class="loading && 'animate-spin'"/><span v-if="!iconOnly" class="hidden sm:inline">Refresh</span></Button></Tooltip>`
  };

  /* ---------- List toolbar: Refresh · Filters (n) · Clear · Sort  …  [slot: toggle, New] (D31) */
  const ListToolbar = {
    props: { list: Object },
    setup(p) {
      const sortItems = computed(() => [...p.list.sorts.map(s => ({ id: s.value, label: s.label, checked: p.list.S.sort === s.value })), { separator: true }, { id: '__asc', label: 'Ascending', icon: 'ArrowUpNarrowWide', checked: p.list.S.dir === 'asc' }, { id: '__desc', label: 'Descending', icon: 'ArrowDownWideNarrow', checked: p.list.S.dir === 'desc' }]);
      function onSort(it) { if (it.id === '__asc' || it.id === '__desc') p.list.S.dir = it.id.slice(2); else p.list.S.sort = it.id; p.list.refresh(); }
      const sortLabel = computed(() => (p.list.sorts.find(s => s.value === p.list.S.sort) || {}).label);
      return { sortItems, onSort, sortLabel, G };
    },
    template: `<div class="flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1.5 shadow-sm">
      <RefreshButton :loading="list.S.loading" :updated-at="list.S.updatedAt" @refresh="list.refresh()"/>
      <Button variant="ghost" size="sm" class="gap-1.5 max-sm:px-2" @click="list.openFilters()" data-testid="filter-trigger-btn" :aria-label="'Filters' + (list.activeCount.value ? ', ' + list.activeCount.value + ' active' : '')"><Icon name="ListFilter" :size="15"/><span class="hidden sm:inline">Filters</span><span v-if="list.activeCount.value" class="tnum rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-4 text-primary-foreground">{{ list.activeCount.value }}</span></Button>
      <Button v-if="list.activeCount.value" variant="ghost" size="sm" class="gap-1.5 text-muted-foreground max-sm:px-2" @click="list.clearAll()" :aria-label="'Clear ' + list.activeCount.value + ' filters'"><Icon name="X" :size="15"/><span class="hidden sm:inline">Clear {{ list.activeCount.value }}</span></Button>
      <DropdownMenu :items="sortItems" @select="onSort" label="Sort by" align="start"><template #trigger><Button variant="ghost" size="sm" class="gap-1.5 max-sm:px-2" :aria-label="'Sort: ' + sortLabel + ', ' + (list.S.dir==='asc' ? 'ascending' : 'descending')"><Icon name="ArrowDownUp" :size="15"/><span class="hidden sm:inline">Sort: {{ sortLabel }}</span><span class="text-muted-foreground">{{ list.S.dir==='asc' ? '↑' : '↓' }}</span></Button></template></DropdownMenu>
      <span class="flex-1"></span>
      <slot/>
    </div>
    <div v-if="list.activeCount.value || (G.search || '').trim()" class="-mt-2 flex flex-wrap gap-1.5" aria-label="Active filters">
      <span v-if="(G.search || '').trim()" class="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/5 py-0.5 pl-2.5 pr-1 text-xs"><Icon name="Search" :size="11" class="text-primary"/><span class="truncate">Search "{{ G.search.trim() }}"</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Clear search" @click="G.search=''"><Icon name="X" :size="12"/></button></span>
      <span v-for="c in list.chips()" :key="c.key" class="inline-flex max-w-full items-center gap-1 rounded-full border bg-card py-0.5 pl-2.5 pr-1 text-xs"><span class="truncate">{{ c.text }}</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" :aria-label="'Remove filter ' + c.text" @click="list.setFilter(c.key, null)"><Icon name="X" :size="12"/></button></span></div>
    <FiltersDialog :list="list"/>`
  };

  /* ---------- Filters dialog: Simple / Advanced (mirrors Cobley's ListFiltersDialog) */
  const FiltersDialog = {
    props: { list: Object },
    setup() { return { OPS, opLabel, noValue, defaultOp }; },
    template: `<Dialog :open="list.S.open" @update:open="v => list.S.open = v">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Filters</h2><p class="text-sm text-muted-foreground">Show only {{ list.noun }} that match every filter below.</p></div>
      <div class="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-3"><div><p class="text-sm font-medium">Advanced</p><p class="text-xs text-muted-foreground">Choose how each field matches: between, before, is empty and more.</p></div><Switch :model-value="list.S.mode==='advanced'" @update:model-value="list.setMode" data-testid="filter-advanced-toggle"/></div>
      <div class="grid gap-4">
        <div v-for="f in list.fields.value" :key="f.key" class="grid gap-1.5">
          <div class="flex flex-wrap items-center justify-between gap-2"><span class="text-sm font-medium">{{ f.label }}</span>
            <Select v-if="list.S.mode==='advanced' && OPS[f.type].length > 1" size="sm" class="w-40" :model-value="list.S.draft[f.key].op" @update:model-value="op => list.setOp(f.key, op)" :options="OPS[f.type].map(op => ({ value: op, label: opLabel(f.type, op) }))" align="end"/>
            <span v-else class="text-xs text-muted-foreground">{{ opLabel(f.type, list.S.draft[f.key].op) }}</span></div>
          <template v-if="!noValue(list.S.draft[f.key].op)">
            <Input v-if="f.type==='text'" v-model="list.S.draft[f.key].value" :placeholder="'Any ' + f.label.toLowerCase()"/>
            <div v-else-if="f.type==='number' && list.S.draft[f.key].op==='between'" class="grid grid-cols-2 gap-2"><Input type="number" v-model="list.S.draft[f.key].value[0]" placeholder="From"/><Input type="number" v-model="list.S.draft[f.key].value[1]" placeholder="To"/></div>
            <Input v-else-if="f.type==='number'" type="number" v-model="list.S.draft[f.key].value" placeholder="Any"/>
            <div v-else-if="f.type==='date' && list.S.draft[f.key].op==='between'" class="grid grid-cols-2 gap-2"><DatePicker v-model="list.S.draft[f.key].value[0]" placeholder="From"/><DatePicker v-model="list.S.draft[f.key].value[1]" placeholder="To" align="end"/></div>
            <DatePicker v-else-if="f.type==='date'" v-model="list.S.draft[f.key].value" placeholder="Any date"/>
            <template v-else-if="f.type==='select_paginated'">
              <ApiSelect v-model="list.S.draft[f.key].value" :module="f.module" multiple :placeholder="'Any ' + f.label.toLowerCase()"/>
              <label v-if="f.module==='locations'" class="flex items-center gap-2 text-xs text-muted-foreground"><Switch v-model="list.S.draft[f.key].below"/>Include locations under them</label>
            </template>
            <div v-else-if="f.type==='select'" class="flex flex-wrap gap-1.5" role="group" :aria-label="f.label">
              <button v-for="o in f.options" :key="o.value" type="button" :aria-pressed="Array.isArray(list.S.draft[f.key].value) ? list.S.draft[f.key].value.includes(o.value) : list.S.draft[f.key].value===o.value"
                @click="Array.isArray(list.S.draft[f.key].value) ? (list.S.draft[f.key].value.includes(o.value) ? list.S.draft[f.key].value.splice(list.S.draft[f.key].value.indexOf(o.value),1) : list.S.draft[f.key].value.push(o.value)) : (list.S.draft[f.key].value = list.S.draft[f.key].value===o.value ? '' : o.value)"
                :class="['inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors', (Array.isArray(list.S.draft[f.key].value) ? list.S.draft[f.key].value.includes(o.value) : list.S.draft[f.key].value===o.value) ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']">
                <Icon v-if="Array.isArray(list.S.draft[f.key].value) ? list.S.draft[f.key].value.includes(o.value) : list.S.draft[f.key].value===o.value" name="Check" :size="12"/>{{ o.label }}</button></div>
            <div v-else-if="f.type==='boolean'" class="inline-flex w-fit rounded-md border bg-muted/40 p-0.5" role="radiogroup" :aria-label="f.label">
              <button v-for="o in [['','Any'],['yes','Yes'],['no','No']]" :key="o[0]" type="button" role="radio" :aria-checked="list.S.draft[f.key].value===o[0]" @click="list.S.draft[f.key].value=o[0]" :class="['h-7 rounded px-3 text-xs font-medium', list.S.draft[f.key].value===o[0] ? 'bg-background shadow' : 'text-muted-foreground']">{{ o[1] }}</button></div>
          </template>
        </div>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center"><Button variant="ghost" class="sm:mr-auto" @click="list.clearAll(); list.S.open=false">Clear all</Button><Button variant="outline" @click="list.S.open=false">Cancel</Button><Button :disabled="!list.canApply.value" @click="list.apply()"><Icon name="Check" :size="14"/>Apply filters</Button></div>
    </Dialog>`
  };

  /* ---------- Contextual search (D29, D30) */
  const SEARCH_SCOPE = {
    dashboard: { mode: 'global', ph: 'Search everything', label: 'Everything' },
    forms: { mode: 'list', ph: 'Search forms', label: 'Forms', noun: 'forms' },
    templates: { mode: 'list', ph: 'Search templates', label: 'Templates', noun: 'templates' },
    members: { mode: 'list', ph: 'Search users', label: 'Users', noun: 'users' },
    locations: { mode: 'list', ph: 'Search locations', label: 'Locations', noun: 'locations' },
    media: { mode: 'list', ph: 'Search files', label: 'Media', noun: 'files' },
    approvals: { mode: 'list', ph: 'Search requests', label: 'Approvals', noun: 'requests' },
    delegations: { mode: 'list', ph: 'Search delegations', label: 'Delegations', noun: 'delegations' },
    request: { mode: 'parent', parent: 'approvals', ph: 'Search requests', label: 'Approvals', noun: 'requests' },
    location: { mode: 'parent', parent: 'locations', ph: 'Search locations', label: 'Locations', noun: 'locations' },
    roles: { mode: 'list', ph: 'Search roles', label: 'Roles', noun: 'roles' },
    role: { mode: 'parent', parent: 'roles', ph: 'Search roles', label: 'Roles', noun: 'roles' },
  };
  const searchMem = {};
  watch(() => G.route, (r, old) => { if (old) searchMem[old] = G.search; G.search = searchMem[r] || ''; G.mSearch = false; });
  const RECENT_KEY = PRODUCT.storageKey + '-recent-searches';
  const recent = ref((() => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } })());
  function remember(q) { q = q.trim(); if (q.length < 2) return; recent.value = [q, ...recent.value.filter(x => x !== q)].slice(0, 6); try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value)); } catch (e) {} }
  const respList = () => (typeof ResponsesMod !== 'undefined' && G.org.id === 'k') ? ResponsesMod.RESP : [];
  const GROUPS = [
    { key: 'forms', label: 'Forms', icon: 'ClipboardList', perm: 'Forms.list', route: 'forms', rows: () => FORMS.filter(formVisible), match: (f, q) => f.title.toLowerCase().includes(q), title: f => f.title, sub: f => (STAT[f.status] || {}).label + ' · ' + f.responses + ' responses', go: f => openForm(f) },
    { key: 'responses', label: 'Responses', icon: 'Inbox', perm: 'Responses.list', route: 'responses', rows: respList, match: (r, q) => (r.name + ' ' + r.email).toLowerCase().includes(q), title: r => r.name, sub: r => r.email + ' · Customer Service Assessment Q4', go: () => nav('responses') },
    { key: 'members', label: 'Users', icon: 'Users', perm: 'Users.list', route: 'members', rows: () => MEMBERS, match: (m, q) => (m.name + ' ' + m.email + ' ' + (m.username || '')).toLowerCase().includes(q), title: m => m.name, sub: m => ROLE[m.role] + ' · ' + (m.email || m.phone), go: m => { searchMem.members = m.name; nav('members'); } },
    { key: 'locations', label: 'Locations', icon: 'MapPin', perm: 'Locations.list', route: 'locations', rows: () => locsOf().filter(l => inScope(l.id)), match: (l, q) => (l.name + ' ' + l.code + ' ' + (l.region || '')).toLowerCase().includes(q), title: l => l.name, sub: l => LTYPES[l.type].label + ' · ' + l.code, go: l => openLoc(l.id) },
    { key: 'approvals', label: 'Approvals', icon: 'Stamp', perm: 'Requests.list', route: 'approvals', rows: () => reqsOf(), match: (r, q) => (r.no + ' ' + r.subject.label + ' ' + nameOf(r.requester)).toLowerCase().includes(q), title: r => r.no + ' · ' + r.subject.label, sub: r => rtById(r.type).name + ' · ' + RQ_STATUS[r.status].label, go: r => openReq(r.id) },
    { key: 'roles', label: 'Roles', icon: 'Shield', perm: 'Roles.list', route: 'roles', rows: () => ROLES, match: (r, q) => (r.name + ' ' + r.desc).toLowerCase().includes(q), title: r => r.name, sub: r => (r.system ? 'Main role' : 'Custom role') + ' · ' + r.perms.length + ' permissions', go: r => openRole(r.id) },
    { key: 'templates', label: 'Templates', icon: 'LayoutTemplate', perm: 'Templates.list', route: 'templates', rows: () => TEMPLATES, match: (t, q) => (t.name + ' ' + t.desc).toLowerCase().includes(q), title: t => t.name, sub: t => t.desc, go: t => { searchMem.templates = t.name; nav('templates'); } },
  ];
  function searchGroups(q, only) {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    return GROUPS.filter(g => (!only || g.key === only) && myPerms.value.includes(g.perm)).map(g => { const all = g.rows().filter(r => g.match(r, q)); return { ...g, total: all.length, items: all.slice(0, 5) }; }).filter(g => g.total);
  }
  const listCount = ref(null); // list pages report how many rows match the search, for the dropdown summary
  const HeaderSearch = {
    props: { phone: Boolean },
    setup(p) {
      const root = ref(null), panel = ref(null), input = ref(null), pos = ref({}), focus = ref(false), hi = ref(0);
      const scope = computed(() => SEARCH_SCOPE[G.view]);
      const q = computed({ get: () => G.search, set: v => { G.search = v; hi.value = 0; } });
      const groups = computed(() => !scope.value ? [] : scope.value.mode === 'global' ? searchGroups(q.value) : scope.value.mode === 'parent' ? searchGroups(q.value, scope.value.parent) : []);
      const flat = computed(() => { const out = []; groups.value.forEach(g => { g.items.forEach(it => out.push({ g, it })); out.push({ g, all: true }); }); if (scope.value && scope.value.mode !== 'global' && q.value.trim().length >= 2) out.push({ everywhere: true }); return out; });
      const showPanel = computed(() => !!scope.value && (p.phone ? scope.value.mode !== 'list' || q.value.trim().length >= 2 : focus.value && (q.value.trim().length >= 2 || (scope.value.mode === 'global' && recent.value.length))));
      function place() { if (p.phone) return; const r = root.value && root.value.getBoundingClientRect(); if (!r) return; const w = Math.max(r.width, scope.value && scope.value.mode === 'list' ? r.width : 420); pos.value = { top: (r.bottom + 6) + 'px', left: Math.max(8, Math.min(r.right - w, window.innerWidth - 8 - w)) + 'px', width: w + 'px' }; }
      watch(showPanel, v => { if (v) nextTick(place); });
      const onResize = () => showPanel.value && place();
      const onDoc = (e) => { if (!p.phone && focus.value && root.value && !root.value.contains(e.target) && !(panel.value && panel.value.contains(e.target))) focus.value = false; };
      const onKeyG = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && scope.value) { e.preventDefault(); if (window.matchMedia('(max-width: 767px)').matches) G.mSearch = true; else nextTick(() => input.value && input.value.focus()); } };
      onMounted(() => { window.addEventListener('resize', onResize); document.addEventListener('pointerdown', onDoc); if (!p.phone) document.addEventListener('keydown', onKeyG); if (p.phone) nextTick(() => input.value && input.value.focus()); });
      onBeforeUnmount(() => { window.removeEventListener('resize', onResize); document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKeyG); });
      function pick(x) {
        remember(q.value);
        if (x.everywhere) { searchMem.dashboard = q.value.trim(); focus.value = false; G.mSearch = false; nav('dashboard'); setTimeout(() => { if (!p.phone && window.matchMedia('(min-width: 768px)').matches) G.searchFocus = Date.now(); else G.mSearch = true; }, 900); return; }
        if (x.all) { searchMem[x.g.route] = q.value.trim(); focus.value = false; G.mSearch = false; nav(x.g.route); return; }
        focus.value = false; G.mSearch = false; x.g.go(x.it);
      }
      function onKey(e) {
        if (e.key === 'Escape') { if (q.value) q.value = ''; else { focus.value = false; G.mSearch = false; input.value && input.value.blur(); } return; }
        if (!flat.value.length) { if (e.key === 'Enter') remember(q.value); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); hi.value = (hi.value + 1) % flat.value.length; }
        if (e.key === 'ArrowUp') { e.preventDefault(); hi.value = (hi.value - 1 + flat.value.length) % flat.value.length; }
        if (e.key === 'Enter') { e.preventDefault(); if (scope.value.mode === 'parent' && hi.value === 0 && q.value.trim()) { pick({ all: true, g: { route: scope.value.parent } }); return; } pick(flat.value[hi.value]); }
      }
      watch(() => G.searchFocus, () => nextTick(() => { input.value && input.value.focus(); focus.value = true; }));
      const idx = (x) => flat.value.indexOf(x);
      const mark = (s) => { const t = q.value.trim(); if (t.length < 2) return [s]; const i = s.toLowerCase().indexOf(t.toLowerCase()); return i < 0 ? [s] : [s.slice(0, i), s.slice(i, i + t.length), s.slice(i + t.length)]; };
      return { G, root, panel, input, pos, focus, hi, scope, q, groups, flat, showPanel, pick, onKey, idx, mark, recent, listCount };
    },
    template: `<div ref="root" :class="phone ? 'flex min-w-0 flex-1 items-center gap-1' : 'relative w-full'">
      <Button v-if="phone" variant="ghost" size="icon" aria-label="Close search" @click="G.mSearch=false; G.search=''"><Icon name="ArrowLeft"/></Button>
      <div class="relative min-w-0 flex-1"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input ref="input" v-model="q" @focus="focus=true" @keydown="onKey" :placeholder="scope ? scope.ph : 'Search'" role="combobox" :aria-expanded="showPanel" aria-autocomplete="list" :aria-label="scope ? scope.ph : 'Search'"
          class="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-14 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring">
        <button v-if="q" type="button" class="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground" aria-label="Clear search" @click="q=''; input.focus()"><Icon name="X" :size="14"/></button>
        <span v-else-if="scope && !phone" class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">{{ scope.label }}</span></div>
      <Teleport to="body"><div v-if="showPanel" ref="panel" :style="phone ? {} : pos" :class="['pop z-[94] overflow-y-auto overscroll-contain bg-popover text-popover-foreground', phone ? (scope.mode==='list' ? 'fixed inset-x-0 top-14 border-b p-1.5 shadow-lg' : 'fixed inset-x-0 bottom-0 top-14 border-t p-2') : 'fixed max-h-[70vh] rounded-lg border p-1.5 shadow-xl']" role="listbox" :aria-label="'Results for ' + q">
        <template v-if="scope.mode==='list'">
          <p class="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground"><Icon name="ListFilter" :size="13"/><span>{{ listCount === null ? 'Filtering' : listCount === 0 ? 'No ' + scope.noun + ' match' : listCount + ' ' + (listCount === 1 ? scope.noun.replace(/s$/, '') + ' matches' : scope.noun + ' match') }} "{{ q.trim() }}" · shown below</span></p>
        </template>
        <template v-else-if="scope.mode==='global' && q.trim().length < 2">
          <p class="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent searches</p>
          <button v-for="r in recent" :key="r" type="button" class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-accent" @click="q=r"><Icon name="History" :size="15" class="text-muted-foreground"/>{{ r }}</button>
          <p v-if="!recent.length" class="px-2 py-6 text-center text-sm text-muted-foreground">Search forms, responses, users, locations and templates.</p>
        </template>
        <template v-else>
          <template v-for="g in groups" :key="g.key">
            <p class="flex items-center justify-between px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><span>{{ g.label }}</span><span class="tnum normal-case tracking-normal">{{ g.total }}</span></p>
            <button v-for="it in g.items" :key="g.key + g.title(it)" type="button" role="option" :aria-selected="hi===idx(flat.find(x => x.it===it))" @mouseenter="hi=idx(flat.find(x => x.it===it))" @click="pick({ g, it })" :class="['flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left', hi===idx(flat.find(x => x.it===it)) ? 'bg-accent' : '']">
              <span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Icon :name="g.icon" :size="14"/></span>
              <span class="min-w-0 flex-1"><span class="block truncate text-sm"><template v-for="(part, pi) in mark(g.title(it))" :key="pi"><mark v-if="pi===1" class="rounded-sm bg-primary/15 text-foreground">{{ part }}</mark><template v-else>{{ part }}</template></template></span><span class="block truncate text-xs text-muted-foreground">{{ g.sub(it) }}</span></span></button>
            <button type="button" @mouseenter="hi=idx(flat.find(x => x.all && x.g.key===g.key))" @click="pick({ all: true, g })" :class="['flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-primary', hi===idx(flat.find(x => x.all && x.g.key===g.key)) ? 'bg-accent' : '']">See all {{ g.total }} in {{ g.label }}<Icon name="ArrowRight" :size="13"/></button>
          </template>
          <p v-if="!groups.length" class="px-2 py-6 text-center text-sm text-muted-foreground"><Icon name="SearchX" :size="20" class="mx-auto mb-2 text-muted-foreground/60"/>Nothing matches "{{ q.trim() }}"{{ scope.mode==='global' ? '' : ' in ' + scope.label }}.</p>
        </template>
        <template v-if="scope.mode!=='global' && q.trim().length >= 2">
          <div class="-mx-1.5 my-1 h-px bg-border"></div>
          <button type="button" @mouseenter="hi=flat.length-1" @click="pick({ everywhere: true })" :class="['flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm', hi===flat.length-1 ? 'bg-accent' : 'hover:bg-accent']"><Icon name="Globe" :size="15" class="text-muted-foreground"/>Search everywhere for "{{ q.trim() }}"<Icon name="CornerDownLeft" :size="13" class="ml-auto text-muted-foreground"/></button>
        </template>
      </div></Teleport>
    </div>`
  };

  /* ---------- Dashboard (D30): the new home */
  const DashboardPage = {
    setup() {
      const R = reactive({ loading: false, updatedAt: Date.now() });
      function refresh() { if (R.loading) return; R.loading = true; setTimeout(() => { R.loading = false; R.updatedAt = Date.now(); }, 700); }
      const VF = computed(() => FORMS.filter(formVisible));
      const live = computed(() => VF.value.filter(f => f.status === 'live'));
      const week = computed(() => { const out = Array(7).fill(0); VF.value.forEach(f => (f.spark || []).slice(-7).forEach((v, i) => out[i] += v)); return out; });
      const root = computed(() => locsOf().find(l => !l.parent));
      const scopeRoots = computed(() => { const vis = locsOf().filter(l => inScope(l.id)); return vis.filter(l => !l.parent || !inScope(l.parent)); });
      const byLoc = computed(() => { const base = scopeRoots.value.length === 1 ? childrenOf(scopeRoots.value[0].id).filter(c => inScope(c.id)) : scopeRoots.value; const list = (base.length ? base : scopeRoots.value).map(l => ({ id: l.id, label: l.name, v: respOf(l.id) })).sort((a, b) => b.v - a.v); const max = Math.max(1, ...list.map(x => x.v)); return list.map((x, i) => ({ ...x, pct: Math.round(x.v / max * 100), color: 'var(--c' + ((i % 5) + 1) + ')' })); });
      const closing = computed(() => live.value.filter(f => /Closes/.test(f.closes)).slice(0, 4));
      const attention = computed(() => { const out = []; const wq = waitingForMe.value.length; if (wq) out.push({ icon: 'Stamp', tone: 'warning', text: wq + ' request' + (wq > 1 ? 's' : '') + ' waiting for your approval', go: () => nav('approvals') }); const fl = VF.value.reduce((a, f) => a + (f.flagged || 0), 0); if (fl) out.push({ icon: 'TriangleAlert', tone: 'warning', text: fl + ' responses with violations to review', go: () => nav('responses') }); const dr = VF.value.filter(f => f.status === 'draft').length; if (dr) out.push({ icon: 'FilePen', tone: 'muted', text: dr + ' draft forms not published yet', go: () => nav('forms') }); const no2 = MEMBERS.filter(m => !m.twofa && !m.invited).length; if (no2 && !G.viewAs) out.push({ icon: 'ShieldAlert', tone: 'warning', text: no2 + ' people without two-step verification', go: () => nav('members') }); const inact = locsOf().filter(l => l.status === 'inactive' && inScope(l.id)).length; if (inact) out.push({ icon: 'MapPinOff', tone: 'muted', text: inact + ' inactive location' + (inact > 1 ? 's' : ''), go: () => nav('locations') }); return out; });
      const hour = TODAY.getHours();
      const peopleCount = computed(() => { if (!G.viewAs) return MEMBERS.length; const ids = new Set(locsOf().filter(l => inScope(l.id)).map(l => l.id)); return new Set(assignsOf().filter(a => ids.has(a.loc) && a.email !== PREVIEW_EMAIL).map(a => a.email)).size; });
      return { ACCENTS, peopleCount, G, R, refresh, VF, live, week, byLoc, closing, attention, ACTIVITY, openForm, openLoc, nav, ROLE, root, greeting: hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening', respList };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex items-center gap-3"><OrgAvatar :org="G.org" size="lg"/><div><p class="text-sm text-muted-foreground">{{ G.viewAs ? 'As ' + G.viewAs.name + ' sees it' : greeting + ', Amina · ' + ROLE[G.org.role] }}</p><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ G.org.name }}</h2></div></div>
        <div class="flex items-center gap-1"><RefreshButton :loading="R.loading" :updated-at="R.updatedAt" @refresh="refresh"/><Button v-if="!G.viewAs && G.org.role!=='viewer'" @click="nav('forms')"><Icon name="ClipboardList" :size="15"/>Go to forms</Button></div>
      </div>
      <div :class="['grid gap-4 transition-opacity', R.loading && 'pointer-events-none opacity-60']">
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Live forms</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Radio" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ live.length }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ VF.filter(f=>f.status==='draft').length }} drafts waiting</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Responses this week</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Inbox" :size="13"/></span></div><div class="mt-1.5 flex items-end justify-between gap-2"><p class="text-2xl font-semibold tnum">{{ week.reduce((a,b)=>a+b,0) }}</p><Spark v-if="week.some(Boolean)" :data="week" class="h-7 w-20"/></div><p class="mt-1 text-[11px] text-muted-foreground">Across live forms</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Locations</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="MapPin" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ byLoc.length }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ G.viewAs ? 'In their scope' : 'Reporting to ' + (root ? root.name : 'you') }}</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">People</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Users" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ peopleCount }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ G.viewAs ? 'Assigned in their scope' : 'Members of ' + G.org.name }}</p></div>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
          <Card class="kpi lg:col-span-2" style="animation-delay:200ms"><div class="p-4">
            <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold">Responses by location</h3><span class="text-xs text-muted-foreground">Last 30 days</span></div>
            <div v-if="byLoc.length" class="mt-3 grid gap-2.5">
              <div v-for="(b, i) in byLoc" :key="b.id" role="link" tabindex="0" @click="openLoc(b.id)" @keydown.enter="openLoc(b.id)" class="group grid cursor-pointer gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div class="flex items-center justify-between gap-3 text-xs"><span class="truncate font-medium group-hover:underline">{{ b.label }}</span><span class="tnum text-muted-foreground">{{ b.v }}</span></div>
                <div class="h-2 overflow-hidden rounded-full bg-muted"><div class="bar-grow h-full rounded-full" :style="{ width: b.pct + '%', background: b.color, animationDelay: (i*70)+'ms' }"></div></div></div></div>
            <p v-else class="mt-6 pb-4 text-center text-sm text-muted-foreground">No locations yet.</p></div></Card>
          <Card class="kpi" style="animation-delay:260ms"><div class="p-4"><h3 class="text-sm font-semibold">Needs attention</h3>
            <ul v-if="attention.length" class="mt-2 grid gap-1"><li v-for="a in attention" :key="a.text"><button type="button" @click="a.go()" class="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm hover:bg-accent"><span :class="['grid h-7 w-7 shrink-0 place-items-center rounded-md', a.tone==='warning' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground']"><Icon :name="a.icon" :size="14"/></span><span class="min-w-0 flex-1">{{ a.text }}</span><Icon name="ChevronRight" :size="14" class="text-muted-foreground"/></button></li></ul>
            <p v-else class="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Icon name="CircleCheck" :size="15" class="text-c1"/>Nothing needs you right now.</p></div></Card>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <Card class="kpi" style="animation-delay:300ms"><div class="p-4"><div class="flex items-center justify-between"><h3 class="text-sm font-semibold">Closing soon</h3><Button variant="ghost" size="sm" class="-mr-2 h-7" @click="nav('forms')">All forms<Icon name="ChevronRight" :size="13"/></Button></div>
            <ul v-if="closing.length" class="mt-2 divide-y"><li v-for="f in closing" :key="f.id"><button type="button" @click="openForm(f)" class="flex w-full items-center gap-3 py-2 text-left hover:bg-muted/40"><span class="form-theme h-8 w-1 shrink-0 rounded-full bg-fa" :style="{ '--fa-l': ACCENTS[f.accent].l, '--fa-d': ACCENTS[f.accent].d }"></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ f.title }}</span><span class="block text-xs text-muted-foreground tnum">{{ f.responses }} responses · {{ f.closes }}</span></span><Spark v-if="f.spark" :data="f.spark" class="h-6 w-16"/></button></li></ul>
            <p v-else class="mt-4 text-sm text-muted-foreground">No live forms with a close date.</p></div></Card>
          <Card class="kpi" style="animation-delay:340ms"><div class="p-4"><h3 class="text-sm font-semibold">Recent activity</h3>
            <ol class="mt-2 grid gap-3"><li v-for="(e, i) in ACTIVITY" :key="i" class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="e.icon" :size="13"/></span><div class="min-w-0 text-sm"><p><span class="font-medium">{{ e.text }}</span><span v-if="e.what" class="text-muted-foreground"> · {{ e.what }}</span></p><p class="text-xs text-muted-foreground">{{ e.who }} · {{ e.when }}</p></div></li></ol></div></Card>
        </div>
      </div>
    </div>`
  };
