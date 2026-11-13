  /* ================================================================ P115: DOCUMENTS WITH LINES
     DocLines   the lines of a document as a list: one row per line (columns when there is room, a card per line when not),
                with View, Edit and Delete on each row; the row itself opens View. Changes happen in a modal, never in the list:
                Add and Edit share one form (item picker by name / SKU / barcode, quantity, unit price resolved from the
                product's price source and overridable only with permission, discount %, VAT %, the line total live); Delete
                asks once in a small dialog (the line is part of the document's unsaved changes, so no YES gate: the
                document's own Save keeps or drops it). Totals sit under the list.
                One component for every document kind:
                  kind 'sale'      prices out, VAT, discount
                  kind 'purchase'  cost prices, VAT, no discount
                  kind 'stock'     quantities only; no money
                lots: true adds lot picking inside the line's form: oldest first (FIFO) fills it, the person may change it.
                Read-only shows the same list with View only.
     DocFlow    the document's lifecycle as a stepper: the path it takes, the step it is on, the side exits (cancelled, expired).
     DocTrail   the chain a document belongs to (offer → order → delivery / invoice → payment), each a RecordLink.
     The kit names no product record: items, prices and lots come from props (itemOf, priceOf, lotsOf); the item picker is an
     ApiSelect module (itemModule). The Design system page's demos use the example catalogue below. */
  const money = (n) => Math.round(+n || 0).toLocaleString('en-US');
  const DL_VAT = 18;
  function lineCalc(l) { const qty = +l.qty || 0, price = +l.price || 0, disc = +l.disc || 0, vat = l.vat == null || l.vat === '' ? DL_VAT : +l.vat; const gross0 = qty * price; const net = gross0 * (1 - disc / 100); const tax = net * vat / 100; return { qty, price, disc: gross0 - net, net, tax, total: net + tax }; }
  function linesTotals(lines) { return (lines || []).reduce((t, l) => { const c = lineCalc(l); t.qty += c.qty; t.disc += c.disc; t.net += c.net; t.tax += c.tax; t.total += c.total; t.lines += 1; return t; }, { qty: 0, disc: 0, net: 0, tax: 0, total: 0, lines: 0 }); }
  const lotsPicked = (l) => (l.lots || []).reduce((a, x) => a + (+x.qty || 0), 0);
  function fifoLots(lots, need) { let left = +need || 0; const out = []; [...lots].sort((a, b) => (a.at > b.at ? 1 : -1)).forEach(x => { if (left <= 0) return; const q = Math.min(left, x.qty); if (q > 0) { out.push({ lot: x.id, qty: q }); left -= q; } }); return out; }

  const DocLines = {
    props: { modelValue: { type: Array, default: () => [] }, kind: { default: 'sale' }, readonly: Boolean, itemModule: { default: 'items' },
      itemOf: { type: Function, default: (id) => ({ name: String(id) }) }, priceOf: { type: Function, default: null }, canOverridePrice: { type: Boolean, default: true },
      lots: Boolean, lotsOf: { type: Function, default: () => [] }, limitOf: { type: Function, default: null }, errors: { type: Object, default: () => ({}) }, error: String,
      totals: { type: Boolean, default: true }, currency: { default: '' },
      emptyText: { default: 'No lines yet. Add the first one: search by name, SKU or barcode.' }, addLabel: { default: 'Add a line' } },
    emits: ['update:modelValue', 'open-item'],
    setup(p, { emit }) {
      /* the list measures its own width (like ListRows, P40): columns when there is room, a card per line when not */
      const root = ref(null); const W = ref(1024); let ro = null;
      onMounted(() => { const w0 = root.value && root.value.clientWidth; if (w0) W.value = w0; try { ro = new ResizeObserver((es) => { const w = Math.round(es[0].contentRect.width); if (w > 0) W.value = w; }); ro.observe(root.value); } catch (e) {} });
      onBeforeUnmount(() => { if (ro) ro.disconnect(); });
      const money_ = computed(() => p.kind !== 'stock');
      const wide = computed(() => W.value >= (money_.value ? (p.kind === 'sale' ? 720 : 620) : 480));
      const actW = computed(() => (p.readonly ? '2.25rem' : '6.75rem'));
      const tpl = computed(() => (p.kind === 'sale' ? '1.5rem minmax(0,1fr) 4.5rem 6.5rem 3.5rem 3.5rem 7rem ' : p.kind === 'purchase' ? '1.5rem minmax(0,1fr) 4.5rem 6.5rem 3.5rem 7rem ' : '1.5rem minmax(0,1fr) 5rem ' + (p.lots ? '8rem ' : '')) + actW.value);
      const T = computed(() => linesTotals(p.modelValue));
      const cur = (n) => (p.currency ? p.currency + ' ' : '') + money(n);
      const set = (lines) => emit('update:modelValue', lines);
      const nameOf = (l) => p.itemOf(l.item).name;
      const limit = (l) => (p.limitOf ? p.limitOf(l) : null);
      const lineErr = (l) => p.errors[l.id] || (limit(l) && limit(l).max != null && +l.qty > limit(l).max ? 'More than ' + limit(l).label : '');
      const overridden = (l) => { if (!p.priceOf || p.kind !== 'sale') return false; const pr = p.priceOf(l.item); return pr && +l.price !== +pr.price; };
      const lotState = (l) => { const n = lotsPicked(l), q = +l.qty || 0; return n === q && q > 0 ? 'ok' : n > q ? 'over' : 'short'; };

      /* one modal for a line: view (read), edit (change), add (new). Changes are staged on the document; its Save keeps them. */
      const M = reactive({ open: false, mode: 'view', line: null, d: {}, err: {}, lots: [] });
      const priceLocked = computed(() => !p.canOverridePrice && p.kind === 'sale');
      const lotRows = (item, picked) => { const m = Object.fromEntries((picked || []).map(x => [x.lot, x.qty])); return [...p.lotsOf(item)].sort((a, b) => (a.at > b.at ? 1 : -1)).map(x => ({ ...x, take: m[x.id] || 0 })); };
      function open(mode, l) {
        M.mode = mode; M.line = l || null; M.err = {};
        M.d = l ? { item: l.item, qty: l.qty, price: l.price, list: l.list, disc: l.disc, vat: l.vat } : { item: '', qty: 1, price: 0, list: '', disc: 0, vat: money_.value ? DL_VAT : 0 };
        M.lots = l && p.lots ? lotRows(l.item, l.lots) : [];
        M.open = true;
      }
      const view = (l) => open('view', l);
      const edit = (l) => { if (!p.readonly) open('edit', l); };
      const addLine = () => open('add');
      /* picking the item in Add fills its price and, for lots, the oldest-first pick */
      watch(() => M.d.item, (id, old) => {
        if (M.mode !== 'add' || !id || id === old) return;
        const pr = p.priceOf ? p.priceOf(id) : null; if (pr) { M.d.price = pr.price; M.d.list = pr.list; }
        if (p.lots) { M.lots = lotRows(id, []); const f = fifoLots(M.lots, M.d.qty); M.lots.forEach(r => { r.take = (f.find(x => x.lot === r.id) || { qty: 0 }).qty; }); }
      });
      const same = computed(() => (M.mode === 'add' && M.d.item && !p.lots ? p.modelValue.findIndex(x => x.item === M.d.item) : -1));
      const mLimit = computed(() => (M.d.item ? limit({ ...M.d, id: M.line && M.line.id }) : null));
      const mCalc = computed(() => lineCalc(M.d));
      const mPicked = computed(() => M.lots.reduce((a, r) => a + (+r.take || 0), 0));
      function fifo() { const f = fifoLots(M.lots, M.d.qty); M.lots.forEach(r => { r.take = (f.find(x => x.lot === r.id) || { qty: 0 }).qty; }); }
      function save() {
        const e = {};
        if (!M.d.item) e.item = 'Choose the item.';
        if (!(+M.d.qty > 0)) e.qty = 'Enter a quantity above 0.';
        if (money_.value && !(+M.d.price >= 0)) e.price = 'Enter a price of 0 or more.';
        if (p.kind === 'sale' && (+M.d.disc < 0 || +M.d.disc > 100)) e.disc = 'Discount is between 0 and 100.';
        M.err = e; if (Object.keys(e).length) return;
        const vals = { qty: +M.d.qty, price: +M.d.price || 0, list: M.d.list || '', disc: +M.d.disc || 0, vat: money_.value ? +M.d.vat || 0 : 0 };
        if (p.lots) vals.lots = M.lots.filter(r => +r.take > 0).map(r => ({ lot: r.id, qty: Math.min(+r.take, r.qty) }));
        if (M.mode === 'edit') { set(p.modelValue.map(x => (x === M.line ? { ...x, ...vals } : x))); toast('Line updated', p.itemOf(M.line.item).name, 'Pencil'); }
        else if (same.value > -1) { const s = p.modelValue[same.value]; set(p.modelValue.map(x => (x === s ? { ...x, qty: (+x.qty || 0) + vals.qty } : x))); toast('Added to line ' + (same.value + 1), p.itemOf(s.item).name + ' · quantity ' + ((+s.qty || 0) + vals.qty), 'Plus'); }
        else { set([...p.modelValue, { id: ulid('ln'), item: M.d.item, lots: [], ...vals }]); toast('Line added', p.itemOf(M.d.item).name, 'Plus'); }
        M.open = false;
      }
      /* delete: a short confirm (the line is part of the document's unsaved changes, not a record of its own) */
      const D = reactive({ open: false, line: null });
      const askDelete = (l) => { if (p.readonly) return; D.line = l; D.open = true; };
      function doDelete() { const l = D.line; set(p.modelValue.filter(x => x !== l)); D.open = false; if (M.open && M.line === l) M.open = false; toast('Line removed', nameOf(l), 'Trash2'); }
      const idx = (l) => p.modelValue.indexOf(l) + 1;
      return { root, wide, tpl, T, money_, cur, nameOf, limit, lineErr, overridden, lotState, lotsPicked, M, view, edit, addLine, priceLocked, same, mLimit, mCalc, mPicked, fifo, save, D, askDelete, doDelete, idx, lineCalc, money, fmtDay };
    },
    template: `<div ref="root" class="grid min-w-0 gap-2" data-doclines>
      <p v-if="error" class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{{ error }}</p>
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-muted-foreground tnum">{{ modelValue.length }} line{{ modelValue.length===1 ? '' : 's' }}<template v-if="!money_ && modelValue.length"> · {{ T.qty }} units</template></p>
        <Button v-if="!readonly" size="sm" variant="outline" @click="addLine" data-doclines-add><Icon name="Plus" :size="14"/>{{ addLabel }}</Button></div>
      <div class="min-w-0 overflow-hidden rounded-lg border">
        <!-- wide: one row per line, columns -->
        <template v-if="wide && modelValue.length">
          <div class="grid h-9 items-center gap-x-3 border-b bg-muted/40 px-3 text-xs font-medium text-muted-foreground" :style="{ gridTemplateColumns: tpl }">
            <span class="text-right">#</span><span>Item</span><span class="text-right">Qty</span>
            <template v-if="money_"><span class="text-right">Unit price</span><span v-if="kind==='sale'" class="text-right">Disc %</span><span class="text-right">VAT %</span><span class="text-right">Total</span></template>
            <span v-else-if="lots">Lots</span><span class="sr-only">Actions</span></div>
          <div v-for="(l, i) in modelValue" :key="l.id" :class="['relative grid items-center gap-x-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/40', lineErr(l) && 'bg-destructive/5']" :style="{ gridTemplateColumns: tpl }" data-line>
            <button type="button" class="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" :aria-label="'View line ' + (i+1) + ', ' + nameOf(l)" @click="view(l)"></button>
            <span class="text-right text-xs text-muted-foreground tnum">{{ i + 1 }}</span>
            <div class="min-w-0"><p class="truncate text-sm font-medium">{{ nameOf(l) }}</p>
              <p class="truncate text-xs text-muted-foreground"><span class="font-mono">{{ itemOf(l.item).sku }}</span><span v-if="l.list"> · {{ l.list }}</span><span v-if="overridden(l)" class="text-warning"> · price changed</span><template v-if="limit(l)"> · {{ limit(l).label }}</template></p>
              <p v-if="lineErr(l)" class="text-xs text-destructive">{{ lineErr(l) }}</p></div>
            <span class="text-right text-sm tnum">{{ l.qty }}<span class="ml-1 text-xs text-muted-foreground">{{ itemOf(l.item).unit || '' }}</span></span>
            <template v-if="money_"><span class="text-right text-sm tnum">{{ money(l.price) }}</span><span v-if="kind==='sale'" class="text-right text-sm tnum text-muted-foreground">{{ +l.disc ? l.disc : '–' }}</span>
              <span class="text-right text-sm tnum text-muted-foreground">{{ l.vat }}</span><span class="text-right text-sm font-medium tnum">{{ money(lineCalc(l).total) }}</span></template>
            <span v-else-if="lots" :class="['inline-flex items-center gap-1 text-xs tnum', lotState(l)==='ok' ? 'text-muted-foreground' : 'text-warning']"><Icon :name="lotState(l)==='ok' ? 'CircleCheck' : 'TriangleAlert'" :size="12"/>{{ lotsPicked(l) }} of {{ l.qty }} picked</span>
            <div class="relative z-10 flex justify-end gap-0.5">
              <Button variant="ghost" size="icon-sm" :aria-label="'View line ' + (i+1)" @click="view(l)"><Icon name="Eye" :size="14"/></Button>
              <template v-if="!readonly"><Button variant="ghost" size="icon-sm" :aria-label="'Edit line ' + (i+1)" @click="edit(l)"><Icon name="Pencil" :size="14"/></Button>
                <Button variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="'Delete line ' + (i+1)" @click="askDelete(l)"><Icon name="Trash2" :size="14"/></Button></template></div>
          </div>
        </template>
        <!-- narrow: a card per line; the card opens the line, its buttons edit and delete -->
        <template v-else-if="modelValue.length">
          <div v-for="(l, i) in modelValue" :key="l.id" :class="['relative grid gap-1 border-b px-3 py-2.5 last:border-b-0', lineErr(l) && 'bg-destructive/5']" data-line>
            <button type="button" class="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" :aria-label="'View line ' + (i+1) + ', ' + nameOf(l)" @click="view(l)"></button>
            <div class="flex items-start gap-2"><span class="mt-0.5 w-4 shrink-0 text-right text-xs text-muted-foreground tnum">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ nameOf(l) }}</p><p class="truncate text-xs text-muted-foreground"><span class="font-mono">{{ itemOf(l.item).sku }}</span><template v-if="limit(l)"> · {{ limit(l).label }}</template></p></div>
              <span v-if="money_" class="shrink-0 text-sm font-medium tnum">{{ money(lineCalc(l).total) }}</span></div>
            <div class="flex items-center gap-2 pl-6">
              <p class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tnum"><span>{{ l.qty }} {{ itemOf(l.item).unit || '' }}<template v-if="money_"> × {{ money(l.price) }}</template></span><span v-if="kind==='sale' && +l.disc">− {{ l.disc }}%</span><span v-if="money_">VAT {{ l.vat }}%</span><span v-if="overridden(l)" class="text-warning">price changed</span>
                <span v-if="lots" :class="['inline-flex items-center gap-1', lotState(l)==='ok' ? '' : 'text-warning']"><Icon :name="lotState(l)==='ok' ? 'CircleCheck' : 'TriangleAlert'" :size="11"/>{{ lotsPicked(l) }} of {{ l.qty }} picked</span></p>
              <div v-if="!readonly" class="relative z-10 -mr-1 flex shrink-0 gap-0.5"><Button variant="ghost" size="icon-sm" :aria-label="'Edit line ' + (i+1)" @click="edit(l)"><Icon name="Pencil" :size="14"/></Button>
                <Button variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="'Delete line ' + (i+1)" @click="askDelete(l)"><Icon name="Trash2" :size="14"/></Button></div></div>
            <p v-if="lineErr(l)" class="pl-6 text-xs text-destructive">{{ lineErr(l) }}</p>
          </div>
        </template>
        <div v-if="!modelValue.length" class="grid justify-items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground"><Icon name="PackageOpen" :size="20"/><span>{{ readonly ? 'No lines.' : emptyText }}</span>
          <Button v-if="!readonly" size="sm" @click="addLine"><Icon name="Plus" :size="14"/>{{ addLabel }}</Button></div>
      </div>
      <!-- totals -->
      <div v-if="totals && money_ && modelValue.length" class="ml-auto grid w-full max-w-xs gap-1 text-sm tnum" data-doclines-totals>
        <div class="flex justify-between gap-4 text-muted-foreground"><span>Subtotal</span><span>{{ money(T.net + T.disc) }}</span></div>
        <div v-if="T.disc" class="flex justify-between gap-4 text-muted-foreground"><span>Discount</span><span>− {{ money(T.disc) }}</span></div>
        <div class="flex justify-between gap-4 text-muted-foreground"><span>VAT</span><span>{{ money(T.tax) }}</span></div>
        <div class="flex justify-between gap-4 border-t pt-1.5 text-base font-semibold"><span>Total</span><span>{{ cur(T.total) }}</span></div></div>

      <!-- the line: view, edit or add -->
      <Dialog v-model:open="M.open"><div class="grid gap-4" data-doclines-modal>
        <div class="pr-6"><p class="text-xs text-muted-foreground">{{ M.mode==='add' ? 'New line' : 'Line ' + idx(M.line) }}</p>
          <h2 class="text-lg font-semibold leading-tight">{{ M.mode==='add' ? addLabel : itemOf(M.d.item).name }}</h2>
          <p v-if="M.mode!=='add'" class="font-mono text-xs text-muted-foreground">{{ itemOf(M.d.item).sku }}</p></div>
        <!-- view -->
        <template v-if="M.mode==='view'">
          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
            <dt class="text-muted-foreground">Quantity</dt><dd class="text-right tnum">{{ M.d.qty }} {{ itemOf(M.d.item).unit || '' }}</dd>
            <template v-if="mLimit"><dt class="text-muted-foreground">Limit</dt><dd class="text-right">{{ mLimit.label }}</dd></template>
            <template v-if="money_"><dt class="text-muted-foreground">Unit price</dt><dd class="text-right tnum">{{ money(M.d.price) }}<span v-if="M.d.list" class="block text-xs text-muted-foreground">{{ M.d.list }}</span></dd>
              <template v-if="kind==='sale'"><dt class="text-muted-foreground">Discount</dt><dd class="text-right tnum">{{ +M.d.disc ? M.d.disc + '% · − ' + money(mCalc.disc) : 'None' }}</dd></template>
              <dt class="text-muted-foreground">Net</dt><dd class="text-right tnum">{{ money(mCalc.net) }}</dd>
              <dt class="text-muted-foreground">VAT {{ M.d.vat }}%</dt><dd class="text-right tnum">{{ money(mCalc.tax) }}</dd></template></dl>
          <p v-if="money_" class="-mt-2 flex justify-between border-t pt-2 text-sm font-semibold tnum"><span>Line total</span><span>{{ cur(mCalc.total) }}</span></p>
          <div v-if="lots" class="grid gap-1.5"><p class="text-sm font-medium">Lots</p>
            <div v-for="r in M.lots.filter(x => +x.take > 0)" :key="r.id" class="flex justify-between rounded-md border px-3 py-2 text-sm"><span class="font-mono">{{ r.code }}</span><span class="tnum">{{ r.take }}</span></div>
            <p v-if="!M.lots.some(x => +x.take > 0)" class="text-sm text-muted-foreground">No lots picked yet.</p></div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button variant="ghost" class="sm:mr-auto" @click="$emit('open-item', M.d.item)"><Icon name="ExternalLink" :size="14"/>Open item</Button>
            <template v-if="!readonly"><Button variant="outline" class="text-destructive hover:text-destructive" @click="askDelete(M.line)"><Icon name="Trash2" :size="14"/>Delete</Button>
              <Button @click="M.mode='edit'"><Icon name="Pencil" :size="14"/>Edit</Button></template>
            <Button v-else variant="outline" @click="M.open=false">Close</Button></div>
        </template>
        <!-- edit / add -->
        <form v-else class="grid gap-4" @submit.prevent="save" novalidate>
          <div v-if="M.mode==='add'" class="grid gap-1.5"><label class="text-sm font-medium">Item <span class="text-destructive">*</span></label><ApiSelect v-model="M.d.item" :module="itemModule" placeholder="Search by name, SKU or barcode" aria-label="Item"/>
            <p v-if="M.err.item" class="text-xs text-destructive">{{ M.err.item }}</p>
            <p v-else-if="same > -1" class="text-xs text-muted-foreground">Already on line {{ same + 1 }}: saving adds this quantity to it.</p></div>
          <div class="grid gap-1.5"><label class="text-sm font-medium" for="dl-qty">Quantity <span class="text-destructive">*</span></label><Input id="dl-qty" v-model="M.d.qty" inputmode="decimal" class="tnum"/>
            <p v-if="M.err.qty" class="text-xs text-destructive">{{ M.err.qty }}</p><p v-else-if="mLimit" class="text-xs text-muted-foreground">{{ mLimit.label }}</p></div>
          <template v-if="money_">
            <div class="grid gap-1.5"><label class="text-sm font-medium" for="dl-price">Unit price{{ currency ? ' (' + currency + ', excl. VAT)' : ' (excl. VAT)' }} <span class="text-destructive">*</span></label><Input id="dl-price" v-model="M.d.price" inputmode="decimal" class="tnum" :disabled="priceLocked"/>
              <p v-if="M.err.price" class="text-xs text-destructive">{{ M.err.price }}</p><p v-else-if="priceLocked" class="text-xs text-muted-foreground">Changing a price needs permission to override prices.</p><p v-else-if="M.d.list" class="text-xs text-muted-foreground">From {{ M.d.list }}</p></div>
            <div class="grid grid-cols-2 gap-3"><div v-if="kind==='sale'" class="grid gap-1.5"><label class="text-sm font-medium" for="dl-disc">Discount %</label><Input id="dl-disc" v-model="M.d.disc" inputmode="decimal" class="tnum"/><p v-if="M.err.disc" class="text-xs text-destructive">{{ M.err.disc }}</p></div>
              <div class="grid gap-1.5"><label class="text-sm font-medium" for="dl-vat">VAT %</label><Input id="dl-vat" v-model="M.d.vat" inputmode="decimal" class="tnum"/></div></div>
            <p class="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm tnum"><span class="text-muted-foreground">Line total incl. VAT</span><span class="font-semibold">{{ cur(mCalc.total) }}</span></p></template>
          <div v-if="lots && M.d.item" class="grid gap-1.5"><div class="flex items-center justify-between gap-2"><p class="text-sm font-medium">Lots</p><Button type="button" variant="ghost" size="sm" @click="fifo"><Icon name="ListOrdered" :size="14"/>Oldest first</Button></div>
            <div class="grid max-h-56 gap-1.5 overflow-y-auto">
              <div v-for="r in M.lots" :key="r.id" class="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 rounded-md border px-3 py-2"><div class="min-w-0"><p class="truncate font-mono text-sm">{{ r.code }}</p><p class="text-xs text-muted-foreground tnum">Received {{ fmtDay(r.at) }} · {{ r.qty }} available</p></div>
                <Input v-model="r.take" inputmode="decimal" class="h-8 text-right tnum" :aria-label="'Take from ' + r.code"/></div>
              <p v-if="!M.lots.length" class="py-4 text-center text-sm text-muted-foreground">No stock of this item at the sending holder.</p></div>
            <p :class="['text-xs tnum', mPicked===+M.d.qty ? 'text-muted-foreground' : 'text-warning']">{{ mPicked }} of {{ +M.d.qty || 0 }} picked</p></div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" @click="M.line && M.mode==='edit' ? (M.mode='view') : (M.open=false)">Cancel</Button>
            <Button type="submit"><Icon name="Check" :size="14"/>{{ M.mode==='add' ? 'Add line' : 'Save line' }}</Button></div>
        </form>
      </div></Dialog>
      <!-- delete -->
      <Dialog v-model:open="D.open"><div v-if="D.line" class="grid gap-4">
        <div class="pr-6"><h2 class="text-lg font-semibold leading-tight">Delete line {{ idx(D.line) }}?</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ nameOf(D.line) }} · {{ D.line.qty }} {{ itemOf(D.line.item).unit || '' }}<template v-if="money_"> · {{ cur(lineCalc(D.line).total) }}</template>. It leaves the document when you save it.</p></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="D.open=false">Keep it</Button><Button variant="destructive" @click="doDelete"><Icon name="Trash2" :size="14"/>Delete line</Button></div></div></Dialog>
    </div>`
  };

  /* DocFlow: the lifecycle as steps. path = [code…] the main road; exits = codes that end it early (shown when reached) */
  const DocFlow = {
    props: { workflow: String, code: String, path: Array, exits: { type: Array, default: () => [] } },
    setup(p) {
      const at = computed(() => p.path.indexOf(p.code));
      const exit = computed(() => p.exits.includes(p.code));
      const steps = computed(() => p.path.map((c, i) => ({ c, s: statusOf(p.workflow, c), state: exit.value ? (i === 0 ? 'done' : 'off') : i < at.value ? 'done' : i === at.value ? 'now' : 'next' })));
      return { steps, exit, s: computed(() => statusOf(p.workflow, p.code)) };
    },
    template: `<ol class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-2 text-xs" aria-label="Where this document is">
      <template v-for="(st, i) in steps" :key="st.c"><li v-if="i" aria-hidden="true" class="h-px w-4 bg-border"></li>
        <li :class="['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1', st.state==='now' ? 'border-primary bg-primary/10 font-medium text-foreground' : st.state==='done' ? 'text-foreground' : 'text-muted-foreground', st.state==='off' && 'opacity-50']" :aria-current="st.state==='now' ? 'step' : null">
          <Icon :name="st.state==='done' ? 'CircleCheck' : st.state==='now' ? 'CircleDot' : 'Circle'" :size="12" :class="st.state==='done' ? 'text-c1' : st.state==='now' ? 'text-primary' : ''"/>{{ st.s.label }}</li></template>
      <template v-if="exit"><li aria-hidden="true" class="h-px w-4 bg-border"></li><li><StatusPill :workflow="workflow" :code="code"/></li></template>
    </ol>`
  };

  /* DocTrail: the documents this one came from and led to, in order; the current one is not a link */
  const DocTrail = {
    props: { items: Array },   // [{ module, id, label, sub, current? }]
    template: `<ol class="grid gap-1.5" aria-label="Document trail">
      <li v-for="(d, i) in items" :key="d.module + d.id" class="flex min-w-0 items-center gap-2 text-sm">
        <span :class="['grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold', d.current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ i + 1 }}</span>
        <span v-if="d.current" class="truncate font-medium">{{ d.label }}</span><RecordLink v-else :module="d.module" :id="d.id"/>
        <span v-if="d.sub" class="ml-auto shrink-0 text-xs text-muted-foreground">{{ d.sub }}</span></li>
      <li v-if="!items.length" class="text-sm text-muted-foreground">Nothing linked yet.</li></ol>`
  };

  /* ---- Example content for the Design system page only (a product brings its own items, prices and lots).
     A small office-supplies catalogue, picker module 'catalogue', prices without a currency. */
  const DL_ITEMS = [
    { id: 'ci1', name: 'Printer paper A4, 500 sheets', sku: 'PAP-A4-500', unit: 'ream', price: 12500 },
    { id: 'ci2', name: 'Ballpoint pens, box of 50', sku: 'PEN-BLU-50', unit: 'box', price: 18000 },
    { id: 'ci3', name: 'Toner cartridge, black', sku: 'TON-BLK-26A', unit: 'pc', price: 145000 },
    { id: 'ci4', name: 'Box files, pack of 10', sku: 'FIL-BOX-10', unit: 'pack', price: 32000 },
    { id: 'ci5', name: 'Stapler, heavy duty', sku: 'STP-HD-100', unit: 'pc', price: 27500 },
    { id: 'ci6', name: 'Notebook A5, ruled', sku: 'NBK-A5-RUL', unit: 'pc', price: 4500 },
  ];
  const DL_LOTS = {
    ci1: [{ id: 'lt1', code: 'L-2026-0101', qty: 40, at: '2026-08-04' }, { id: 'lt2', code: 'L-2026-0118', qty: 60, at: '2026-09-15' }],
    ci3: [{ id: 'lt3', code: 'L-2026-0097', qty: 3, at: '2026-07-22' }, { id: 'lt4', code: 'L-2026-0124', qty: 8, at: '2026-10-02' }],
    ci6: [{ id: 'lt5', code: 'L-2026-0110', qty: 120, at: '2026-08-30' }],
  };
  SELECT_SOURCES.catalogue = { noun: 'items', paging: 'page', all: () => DL_ITEMS.map(i => ({ value: i.id, label: i.name, sub: i.sku + ' · ' + money(i.price) + ' per ' + i.unit, status: 'active' })) };
  const DL_DEMO = {
    itemOf: (id) => { const i = DL_ITEMS.find(x => x.id === id); return i ? { name: i.name, sku: i.sku, unit: i.unit } : { name: String(id) }; },
    priceOf: (id) => { const i = DL_ITEMS.find(x => x.id === id); return i ? { price: i.price, list: 'Standard prices' } : null; },
    lotsOf: (id) => DL_LOTS[id] || [],
    sale: () => [{ id: 'dl1', item: 'ci1', qty: 4, price: 12500, list: 'Standard prices', disc: 0, vat: 18 }, { id: 'dl2', item: 'ci3', qty: 1, price: 145000, list: 'Standard prices', disc: 5, vat: 18 }, { id: 'dl3', item: 'ci2', qty: 2, price: 18000, list: 'Standard prices', disc: 0, vat: 18 }],
    stock: () => [{ id: 'ds1', item: 'ci1', qty: 50, lots: [{ lot: 'lt1', qty: 40 }, { lot: 'lt2', qty: 10 }] }, { id: 'ds2', item: 'ci3', qty: 4, lots: [{ lot: 'lt3', qty: 3 }] }],
  };
