
  /* ================================================================ P39: SCOPED LISTS, ONE-CARD LISTS, LINKABLE VIEWS
     ListCard   one card per list: [search + quick tabs] / [filters, clear, sort | actions] / chips / summary / rows.
                Search + tabs share a row only when they fit (search flex 1 1 16rem, justify-between: a wrapped line of tabs sits left).
                The card picks table or row cards by its own width (container query in builder.html: < 700px cards).
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
        <div v-if="own || tabs" class="flex flex-wrap items-center justify-between gap-2">
          <div v-if="own" class="relative min-w-0 flex-1 basis-64"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input :value="search" @input="$emit('update:search', $event.target.value)" :placeholder="placeholder" :aria-label="placeholder" class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <button v-if="search" type="button" class="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent" aria-label="Clear search" @click="$emit('update:search', '')"><Icon name="X" :size="13"/></button></div>
          <div v-if="tabs" class="min-w-0 max-w-full overflow-x-auto"><Tabs :model-value="quick" @update:model-value="v => $emit('update:quick', v)" :items="tabs"/></div>
        </div>
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
        <div v-if="list.activeCount.value || topQ" class="flex flex-wrap gap-1.5" aria-label="Active filters">
          <span v-if="topQ" class="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/40 bg-primary/5 py-0.5 pl-2.5 pr-1 text-xs"><Icon name="Search" :size="11" class="text-primary"/><span class="truncate">Search "{{ topQ }}"</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Clear search" @click="G.search=''"><Icon name="X" :size="12"/></button></span>
          <span v-for="c in list.chips()" :key="c.key" class="inline-flex max-w-full items-center gap-1 rounded-full border bg-background py-0.5 pl-2.5 pr-1 text-xs"><span class="truncate">{{ c.text }}</span><button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" :aria-label="'Remove filter ' + c.text" @click="list.setFilter(c.key, null)"><Icon name="X" :size="12"/></button></span></div>
      </div>
      <div v-if="$slots.summary" class="border-b"><slot name="summary"/></div>
      <div :class="['transition-opacity', list.S.loading && 'pointer-events-none opacity-60']"><slot/></div>
    </section>
    <FiltersDialog :list="list"/>`
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
