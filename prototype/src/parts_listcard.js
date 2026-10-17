
  /* ================================================================ P39: SCOPED LISTS, ONE-CARD LISTS, LINKABLE VIEWS
     ListCard   one card per list (P40 stack): [filters, clear, sort | actions] / [quick tabs, own scrollable row] / [search, own row]
                / chips / summary / rows. Rows are ListRows (priority columns): one shape at every width, no table/cards switch.
                search: pass a string for the list's own search box (scoped lists, page-level tabs); leave it out to follow
                the top bar (P22). refresh: false inside details tabs (the page header refreshes).
                Card grids (forms, media, delegations) keep ListToolbar: cards inside a card read badly.
     ListShare  Export CSV + Copy link, in the ListCard actions slot.
     LockedField a parent value set by the page you came from: shown, locked, not editable (create from a scoped tab).
     exportList CSV of exactly the rows the list shows; the parent goes into the file name.
     A details tab that shows records is the module's own list with useList({ scope: () => ({ fieldKey: parentId }) }). */

  const ListCard = {
    props: { list: Object, tabs: Array, quick: String, search: { type: String, default: undefined }, placeholder: { type: String, default: 'Search' }, refresh: { type: Boolean, default: true } },
    emits: ['update:quick', 'update:search'],
    setup(p) {
      const sortItems = computed(() => [...p.list.sorts.map(s => ({ id: s.value, label: s.label, checked: p.list.S.sort === s.value })), { separator: true }, { id: '__asc', label: 'Ascending', icon: 'ArrowUpNarrowWide', checked: p.list.S.dir === 'asc' }, { id: '__desc', label: 'Descending', icon: 'ArrowDownWideNarrow', checked: p.list.S.dir === 'desc' }]);
      function onSort(it) { if (it.id === '__asc' || it.id === '__desc') p.list.S.dir = it.id.slice(2); else p.list.S.sort = it.id; p.list.refresh(); }
      const sortLabel = computed(() => (p.list.sorts.find(s => s.value === p.list.S.sort) || {}).label);
      const own = computed(() => p.search !== undefined);
      const topQ = computed(() => own.value ? '' : (G.search || '').trim());
      return { sortItems, onSort, sortLabel, own, topQ, G };
    },
    template: `<section class="kpi min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm" data-list-card>
      <div class="grid grid-cols-[minmax(0,1fr)] gap-2 border-b p-2 sm:px-3">
        <div class="flex flex-wrap items-center gap-x-1 gap-y-2">
          <div class="flex items-center gap-1">
            <RefreshButton v-if="refresh" :loading="list.S.loading" :updated-at="list.S.updatedAt" @refresh="list.refresh()"/>
            <Button variant="ghost" size="sm" class="gap-1.5 max-sm:px-2" @click="list.openFilters()" data-testid="filter-trigger-btn" :aria-label="'Filters' + (list.activeCount.value ? ', ' + list.activeCount.value + ' active' : '')"><Icon name="ListFilter" :size="15"/><span class="hidden sm:inline">Filters</span><span v-if="list.activeCount.value" class="tnum rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-4 text-primary-foreground">{{ list.activeCount.value }}</span></Button>
            <Button v-if="list.activeCount.value" variant="ghost" size="sm" class="gap-1.5 text-muted-foreground max-sm:px-2" @click="list.clearAll()" :aria-label="'Clear ' + list.activeCount.value + ' filters'"><Icon name="X" :size="15"/><span class="hidden sm:inline">Clear {{ list.activeCount.value }}</span></Button>
            <DropdownMenu :items="sortItems" @select="onSort" label="Sort by" align="start"><template #trigger><Button variant="ghost" size="sm" class="gap-1.5 max-sm:px-2" :aria-label="'Sort: ' + sortLabel + ', ' + (list.S.dir==='asc' ? 'ascending' : 'descending')"><Icon name="ArrowDownUp" :size="15"/><span class="hidden sm:inline">Sort: {{ sortLabel }}</span><span class="text-muted-foreground">{{ list.S.dir==='asc' ? '↑' : '↓' }}</span></Button></template></DropdownMenu>
            <slot name="tools"/>
          </div>
          <div v-if="$slots.actions" class="ml-auto flex items-center gap-1.5"><slot name="actions"/></div>
        </div>
        <div v-if="tabs" class="lc-tabs -mx-2 min-w-0 overflow-x-auto px-2 sm:-mx-3 sm:px-3"><Tabs :model-value="quick" @update:model-value="v => $emit('update:quick', v)" :items="tabs"/></div>
        <div v-if="own" class="relative min-w-0"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input :value="search" @input="$emit('update:search', $event.target.value)" :placeholder="placeholder" :aria-label="placeholder" class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <button v-if="search" type="button" class="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent" aria-label="Clear search" @click="$emit('update:search', '')"><Icon name="X" :size="13"/></button></div>
        <div v-if="list.activeCount.value || topQ" class="flex flex-wrap gap-1.5" aria-label="Active filters">
          <span v-if="topQ" class="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/5 py-0.5 pl-2.5 pr-1 text-xs"><Icon name="Search" :size="11" class="text-primary"/><span class="truncate">Search "{{ topQ }}"</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Clear search" @click="G.search=''"><Icon name="X" :size="12"/></button></span>
          <span v-for="c in list.chips()" :key="c.key" class="inline-flex max-w-full items-center gap-1 rounded-full border bg-background py-0.5 pl-2.5 pr-1 text-xs"><span class="truncate">{{ c.text }}</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" :aria-label="'Remove filter ' + c.text" @click="list.setFilter(c.key, null)"><Icon name="X" :size="12"/></button></span></div>
      </div>
      <div v-if="$slots.summary" class="border-b"><slot name="summary"/></div>
      <div :class="['transition-opacity', list.S.loading && 'pointer-events-none opacity-60']"><slot/></div>
    </section>
    <FiltersDialog :list="list"/>`
  };

  /* ================================================================ P40: PRIORITY COLUMNS
     ListRows   the rows of a ListCard: one CSS grid per row, driven by the module's columns. The card measures its own width
                (ResizeObserver) and folds columns instead of switching layouts (no table/cards switch, no view toggle).
     column     { key, label, short?, identity?, hero?, status?, priority, fold: 'badge'|'meta', min, sort?, text(row),
                  variant?(row) (badge/status tone), mono?, sub? (hero sub-label), indent?(row) (tree lists, px) }
                identity (exactly one) and hero (at most one) never fold; the highest priority number folds first.
                status folds right: badge level with the title, the hero directly under it. fold:'badge' -> title line.
                fold:'meta' -> the meta line after baseMeta(row), while it fits on two lines; the rest -> "+N more" strip.
     slots      #icon="{ row }" (40px tile), #cell-<key>="{ row }" (grid cell when unfolded), #actions="{ row }" (own column; on tight rows in the chevron's place, P50)
     emits      open(row): the whole row and the chevron open the record. Reference: docs/platform/p40-priority-columns.html */
  const LR_GAP = 16, LR_PADX = 32, LR_CHEV = 16;
  let _lrCtx = null;
  function lrMeasure(t) { try { if (!_lrCtx) { _lrCtx = document.createElement('canvas').getContext('2d'); _lrCtx.font = '12px Geist, ui-sans-serif, system-ui, sans-serif'; } return _lrCtx.measureText(t).width; } catch (e) { return t.length * 6.3; } }
  const ListRows = {
    props: { list: Object, rows: Array, columns: Array, rowKey: { type: Function, default: (r) => r.id }, baseMeta: { type: Function, default: () => '' }, actionsWidth: { type: Number, default: 40 }, empty: { type: String, default: '' }, clickable: { type: Boolean, default: true }, rowClass: { type: Function, default: () => '' } },
    emits: ['open'],
    setup(p, { slots, emit }) {
      const root = ref(null); const W = ref(1024); let ro = null;
      onMounted(() => { const w0 = root.value && root.value.clientWidth; if (w0) W.value = w0; try { ro = new ResizeObserver((es) => { const w = Math.round(es[0].contentRect.width); if (w > 0) W.value = w; }); ro.observe(root.value); } catch (e) {} });
      onBeforeUnmount(() => { if (ro) ro.disconnect(); });
      const open = reactive({});
      const P = computed(() => {
        const w = W.value, cols = p.columns, live = new Set(cols.map(c => c.key));
        const idc = cols.find(c => c.identity) || cols[0]; const floor = Math.round(w * 0.4);
        const actW = slots.actions ? p.actionsWidth + LR_GAP : 0;
        const minOf = (c) => c.min || (c.identity ? 200 : 100);
        const need = () => LR_PADX + LR_CHEV + LR_GAP + actW + cols.filter(c => live.has(c.key)).reduce((s, c) => s + (c.identity ? Math.max(minOf(c), floor) : minOf(c)), 0) + (live.size - 1) * LR_GAP;
        while (need() > w) { const cand = cols.filter(c => live.has(c.key) && !c.identity && !c.hero).sort((a, b) => b.priority - a.priority)[0]; if (!cand) break; live.delete(cand.key); }
        const liveCols = cols.filter(c => live.has(c.key)); const folded = cols.filter(c => !live.has(c.key)).sort((a, b) => a.priority - b.priority);
        const others = liveCols.filter(c => !c.identity).reduce((s, c) => s + minOf(c), 0) + (liveCols.length - 1) * LR_GAP + LR_PADX + LR_CHEV + LR_GAP + actW;
        const tight = w - others < minOf(idc);
        const actCol = !!slots.actions && !tight;
        const actTop = !!slots.actions && tight;   // P50: tight rows put their actions where the chevron was, level with the title; no extra line
        const hero = liveCols.find(c => c.hero); const statusF = folded.find(c => c.status);
        const tpl = liveCols.map(c => c.identity ? (tight ? 'minmax(0,1fr)' : 'minmax(' + Math.max(minOf(c), floor) + 'px,1fr)') : (c.hero && tight ? 'max-content' : minOf(c) + 'px'));
        if (statusF && !hero) tpl.push('max-content');
        if (actCol) tpl.push(p.actionsWidth + 'px');   // fixed: each row is its own grid, so rows with and without actions line up
        tpl.push(actTop ? 'max-content' : LR_CHEV + 'px');
        const heroW = hero ? (tight ? 110 : minOf(hero)) : 0;
        const identW = tight ? w - LR_PADX - (actTop ? p.actionsWidth : LR_CHEV) - LR_GAP * 2 - (hero || statusF ? 110 : 0) : w - (others - (hero ? minOf(hero) - heroW : 0));
        return { actCol, actTop, liveCols, folded, tight, hero, statusF, badgeF: folded.filter(c => c.fold === 'badge' && !c.status), metaF: folded.filter(c => c.fold !== 'badge' && !c.status), tpl: tpl.join(' '), cap: Math.max(80, (identW - 52) * 2 - 76) };
      });
      // greedy meta fill: folded meta columns join the meta line in priority order while two lines hold them
      function meta(r) {
        const base = p.baseMeta(r) || ''; const shown = []; const rest = []; let line = base;
        for (const c of P.value.metaF) { const t = c.text(r); if (t === '' || t == null) continue; const nx = line ? line + ' · ' + t : t; if (!rest.length && lrMeasure(nx) <= P.value.cap) { shown.push(t); line = nx; } else rest.push(c); }
        const k = p.rowKey(r); const isOpen = rest.length > 0 && !!open[k];
        return { parts: isOpen ? [base].filter(Boolean) : [base, ...shown].filter(Boolean), rest, isOpen, k };
      }
      function toggle(k) { open[k] = !open[k]; }
      function onRow(e, r) { if (!p.clickable) return; if (e.target.closest('button,a,input,select,textarea,label,[role=combobox],[data-stop]')) return; emit('open', r); }
      function sortBy(c) { const L = p.list; if (!L || !c.sort) return; if (L.S.sort === c.sort) L.S.dir = L.S.dir === 'asc' ? 'desc' : 'asc'; else { L.S.sort = c.sort; L.S.dir = 'asc'; } L.refresh(); }
      return { root, P, meta, toggle, onRow, sortBy, slots };
    },
    template: `<div ref="root" class="min-w-0" :class="P.tight && 'lr-tight'">
      <div class="grid h-9 items-center gap-x-4 border-b px-4 text-xs font-medium text-muted-foreground" :style="{ gridTemplateColumns: P.tpl }">
        <template v-for="c in P.liveCols" :key="c.key">
          <button v-if="c.sort && list" type="button" :class="['flex min-w-0 items-center gap-1 truncate hover:text-foreground', c.hero && 'justify-end']" @click="sortBy(c)" :aria-label="'Sort by ' + c.label">
            <span class="truncate">{{ P.tight && c.short ? c.short : c.label }}</span><Icon v-if="list.S.sort === c.sort" :name="list.S.dir === 'asc' ? 'ChevronUp' : 'ChevronDown'" :size="12"/></button>
          <span v-else :class="['truncate', c.hero && 'text-right']">{{ P.tight && c.short ? c.short : c.label }}</span>
        </template>
        <span v-if="P.statusF && !P.hero"></span><span v-if="P.actCol"></span><span></span>
      </div>
      <p v-if="!rows.length" class="grid h-32 place-items-center px-4 text-center text-sm text-muted-foreground">{{ empty || 'Nothing matches.' }}</p>
      <template v-for="r in rows" :key="rowKey(r)">
        <div v-for="m in [meta(r)]" :key="m.k" :role="clickable ? 'link' : null" :tabindex="clickable ? 0 : null" :aria-label="clickable && P.liveCols[0] ? P.liveCols[0].text(r) : null"
          :class="['grid min-h-14 gap-x-4', clickable && 'cursor-pointer', ' border-b px-4 py-2 outline-none transition-colors last:border-0 hover:bg-accent/60 focus-visible:bg-accent/60', P.tight ? 'items-start' : 'items-center', m.isOpen && 'border-b-0 bg-accent/60', rowClass(r)]"
          :style="{ gridTemplateColumns: P.tpl }" @click="onRow($event, r)" @keydown.enter="onRow($event, r)">
          <template v-for="c in P.liveCols" :key="c.key">
            <div v-if="c.identity" :class="['flex min-w-0 gap-3', P.tight ? 'items-start' : 'items-center']" :style="c.indent ? { paddingLeft: c.indent(r) + 'px' } : null">
              <div v-if="slots.icon" class="mt-px shrink-0"><slot name="icon" :row="r"/></div>
              <div class="min-w-0 flex-1">
                <div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span :class="['min-w-0 font-medium', P.tight ? 'break-words' : 'truncate', c.mono && 'font-mono text-[13px]']"><slot :name="'cell-' + c.key" :row="r">{{ c.text(r) }}</slot></span>
                  <template v-for="b in P.badgeF" :key="b.key"><Badge v-if="b.text(r)" :variant="b.variant ? b.variant(r) : 'outline'" :class="b.mono && 'font-mono font-medium'">{{ b.text(r) }}</Badge></template>
                </div>
                <p v-if="m.parts.length || m.rest.length" class="lr-meta mt-0.5 text-xs leading-[1.5] text-muted-foreground [overflow-wrap:anywhere]"><span v-for="(t, i) in m.parts" :key="i"><span v-if="i" class="text-muted-foreground/60"> · </span>{{ t }}</span>
                  <button v-if="m.rest.length" type="button" class="relative z-10 ml-1.5 inline-flex min-h-[22px] items-center rounded-full border bg-card px-2 text-[11px] font-medium text-foreground hover:bg-accent" :aria-expanded="m.isOpen" @click.stop="toggle(m.k)">{{ m.isOpen ? 'Show less' : '+' + m.rest.length + ' more' }}</button></p>
              </div>
            </div>
            <div v-else-if="c.hero" class="min-w-0 text-right">
              <div v-if="P.statusF && P.statusF.text(r)" class="mb-1"><slot :name="'cell-' + P.statusF.key" :row="r"><Badge :variant="P.statusF.variant ? P.statusF.variant(r) : 'secondary'">{{ P.statusF.text(r) }}</Badge></slot></div>
              <p class="tnum truncate text-sm font-semibold"><slot :name="'cell-' + c.key" :row="r">{{ c.text(r) }}</slot></p>
              <p v-if="c.sub && !P.tight && !P.statusF" class="truncate text-[11px] text-muted-foreground">{{ c.sub }}</p>
            </div>
            <div v-else-if="c.status || c.fold === 'badge'" class="min-w-0"><slot :name="'cell-' + c.key" :row="r"><Badge v-if="c.text(r)" :variant="c.variant ? c.variant(r) : (c.status ? 'secondary' : 'outline')" :class="c.mono && 'font-mono font-medium'">{{ c.text(r) }}</Badge></slot></div>
            <div v-else :class="['min-w-0 truncate text-sm', c.right && 'tnum text-right', c.mono && 'font-mono text-xs', c.muted && 'text-muted-foreground']"><slot :name="'cell-' + c.key" :row="r">{{ c.text(r) }}</slot></div>
          </template>
          <div v-if="P.statusF && !P.hero" class="text-right"><slot :name="'cell-' + P.statusF.key" :row="r"><Badge v-if="P.statusF.text(r)" :variant="P.statusF.variant ? P.statusF.variant(r) : 'secondary'">{{ P.statusF.text(r) }}</Badge></slot></div>
          <div v-if="P.actCol" class="relative z-10 flex items-center justify-end gap-1" data-stop><slot name="actions" :row="r"/></div>
          <div v-if="P.actTop" class="relative z-10 -mr-2 -mt-1 flex items-center justify-end gap-1" data-stop><slot name="actions" :row="r"/></div>
          <Icon v-else-if="clickable" name="ChevronRight" :size="16" :class="['justify-self-end text-muted-foreground/70', P.tight && 'mt-3']"/><span v-else></span>
        </div>
        <div v-if="meta(r).isOpen" class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-6 border-b bg-accent/60 px-4 pb-3 pt-1 text-xs last:border-0" :class="!P.tight && slots.icon && 'pl-[68px]'">
          <div v-for="c in meta(r).rest" :key="c.key" class="flex min-w-0 justify-between gap-3 border-b border-dashed py-1"><span class="text-muted-foreground">{{ c.label }}</span><span class="tnum min-w-0 truncate text-right">{{ c.text(r) }}</span></div>
        </div>
      </template>
    </div>`
  };

  /* Export + Copy link, placed in the list toolbar */
  const ListShare = {
    props: { exportFn: Function },
    setup() { return { copyLink }; },
    template: `<span class="inline-flex gap-1.5"><Button v-if="exportFn" size="sm" variant="outline" @click="exportFn()" aria-label="Export CSV"><Icon name="Download" :size="15"/><span class="hidden xl:inline">Export</span></Button><Button size="sm" variant="outline" @click="copyLink()" aria-label="Copy link to this view"><Icon name="Link" :size="15"/><span class="hidden xl:inline">Copy link</span></Button></span>`
  };

  /* a parent value set by the page you came from: shown, locked, not editable */
  const LockedField = {
    props: { label: String, value: String, sub: String, icon: { type: String, default: 'Lock' } },
    template: `<div class="grid gap-1.5"><span class="text-sm font-medium">{{ label }}</span>
      <div class="flex min-h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"><span class="min-w-0 flex-1"><span class="block truncate font-medium">{{ value }}</span><span v-if="sub" class="block truncate text-[11px] text-muted-foreground">{{ sub }}</span></span><Icon name="Lock" :size="13" class="shrink-0 text-muted-foreground" aria-label="Set by the page you came from"/></div></div>`
  };

  /* CSV of exactly what a list shows; the parent goes into the file name */
  function exportList(LS, cols, base, scopeName) {
    const stamp = isoDay(TODAY);
    const name = ((scopeName ? scopeName + ' - ' : '') + base + ' - ' + stamp).replace(/[^\w .-]+/g, '').replace(/\s+/g, ' ').trim() + '.csv';
    downloadCsv(name, [cols.map(c => c[0]), ...LS.rows.value.map(r => cols.map(c => { const v = c[1](r); return v === null || v === undefined ? '' : v; }))]);
  }

  /* clipboard + CSV download (artifact downloads capability when present, plain link otherwise) */
  function copyText(t, title) { try { navigator.clipboard.writeText(t).then(() => toast(title || 'Copied', t.length > 80 ? t.slice(0, 80) + '…' : t, 'ClipboardCheck'), () => toast('Copy not allowed here', t, 'TriangleAlert')); } catch (e) { toast('Copy not allowed here', t, 'TriangleAlert'); } }
  async function downloadCsv(name, rows) {
    const esc = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename: name, data: csv }); toast('File saved', name, 'Download'); } catch (e) { if (e && e.code === 'declined') return; toast('Download not available here', 'Open the page in a browser to save it.', 'TriangleAlert'); } return; }
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast('File saved', name, 'Download'); } catch (e) { toast('Download not available here', name, 'TriangleAlert'); }
  }
