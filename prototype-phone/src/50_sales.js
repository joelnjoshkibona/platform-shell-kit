/* ============================================================ Sales */
const itemsText = (s) => saleLine(s.lines[0]) + (s.lines.length > 1 ? ' +' + (s.lines.length - 1) + ' more' : '');
const paidOf = (s) => s.pay === 'paid' ? saleTotal(s) : s.pay === 'part' ? (s.paid || 0) : 0;

const FilterSheet = { props: { open: Boolean }, components: { Sheet, Btn },
  setup() {
    const l = reactive({ status: 'all', range: 'all', who: 'all' });
    watch(() => S.sheet, (v) => { if (v === 'filter') Object.assign(l, S.salesFilter); });
    const apply = () => { Object.assign(S.salesFilter, l); S.sheet = null; S.shown = 6; };
    const reset = () => Object.assign(l, { status: 'all', range: 'all', who: 'all' });
    return { S, l, apply, reset, st: [['all', 'All'], ['unpaid', 'Unpaid'], ['part', 'Part paid'], ['paid', 'Paid'], ['undone', 'Undone']], rg: [['all', 'All time'], ['today', 'Today'], ['week', 'This week'], ['month', 'This month']], who: [['all', 'Everyone'], ['Rehema', 'Rehema'], ['Amina', 'Amina']] };
  },
  template: `<Sheet :open="S.sheet === 'filter'" title="Filters" @close="S.sheet = null"><div class="px-5 pb-4">
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p><div class="flex flex-wrap gap-2"><button v-for="o in st" :key="o[0]" type="button" @click="l.status = o[0]" :class="['press h-9 rounded-md px-4 text-sm font-medium', l.status === o[0] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ o[1] }}</button></div>
      <p class="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sold by</p><div class="flex flex-wrap gap-2"><button v-for="o in who" :key="o[0]" type="button" @click="l.who = o[0]" :class="['press h-9 rounded-md px-4 text-sm font-medium', l.who === o[0] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ o[1] }}</button></div>
      <p class="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p><div class="grid grid-cols-2 gap-2"><button v-for="o in rg" :key="o[0]" type="button" @click="l.range = o[0]" :class="['press h-9 rounded-md text-sm font-medium', l.range === o[0] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ o[1] }}</button></div></div>
    <template #footer><div class="grid grid-cols-[1fr_2fr] gap-2"><Btn v="outline" @click="reset">Reset</Btn><Btn @click="apply">Show sales</Btn></div></template></Sheet>` };

const SalesList = { components: { Header, Icon, Av, Pill, Seg, Empty, FilterBar, SaleStatus, FilterSheet },
  setup() {
    const tabs = computed(() => [{ id: 'all', label: 'All' }, { id: 'unpaid', label: 'Unpaid', count: SALES.filter(s => s.pay === 'unpaid').length }, { id: 'part', label: 'Part paid', count: SALES.filter(s => s.pay === 'part').length }]);
    const rows = computed(() => SALES.filter(s => {
      const f = S.salesFilter; const st = f.status !== 'all' ? f.status : S.salesTab;
      return (st === 'all' || s.pay === st || (st === 'undone' && s.undone)) && (f.who === 'all' || s.by === f.who) && (f.range === 'all' || f.range === 'week' || f.range === 'month' || s.day === 'Today')
        && (!S.salesQ || (s.id + cust(s.c).name).toLowerCase().includes(S.salesQ.toLowerCase()));
    }));
    const groups = computed(() => { const g = []; rows.value.slice(0, S.shown).forEach(s => { let x = g.find(y => y.day === s.day); if (!x) g.push(x = { day: s.day, rows: [] }); x.rows.push(s); }); return g; });
    const dayTotal = (g) => money(g.rows.reduce((t, s) => t + saleTotal(s), 0));
    const active = computed(() => S.salesFilter.status !== 'all' || S.salesFilter.who !== 'all' || S.salesFilter.range !== 'all');
    const summary = computed(() => { const p = []; const f = S.salesFilter; if (f.status !== 'all') p.push({ unpaid: 'Unpaid', part: 'Part paid', paid: 'Paid', undone: 'Undone' }[f.status]); if (f.who !== 'all') p.push(f.who); if (f.range !== 'all') p.push({ today: 'Today', week: 'This week', month: 'This month' }[f.range]); return p.length ? 'Filter · ' + p.join(' · ') : 'All sales · filter'; });
    const refresh = () => { S.list = 'loading'; setTimeout(() => { if (S.list === 'loading') S.list = 'data'; }, 900); };
    return { S, tabs, rows, groups, dayTotal, active, summary, refresh, waitingN, ME, cust, saleTotal, itemsText, money, go, tab };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Sales"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto">
      <FilterBar :summary="summary" :active="active" :loading="S.list === 'loading'" @refresh="refresh" @open="S.sheet = 'filter'"/>
      <div class="space-y-3 px-3 pb-6 pt-3">
        <button v-if="ME.role === 'Owner' && waitingN" type="button" class="press flex w-full items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-left" @click="go('waiting')"><Icon name="Undo2" :size="20" class="text-warning"/><span class="flex-1 text-sm"><b>2 undo requests</b> wait for you. Stock and balances change after you approve.</span><Icon name="ChevronRight" :size="18" class="text-muted-foreground"/></button>
        <Seg v-model="S.salesTab" :tabs="tabs"/>
        <template v-if="S.list === 'loading'"><div v-for="i in 5" :key="i" class="skel h-[60px] rounded-xl"></div></template>
        <div v-else-if="S.list === 'error'" class="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><span>Could not load sales.</span><button class="press h-8 px-2 font-semibold underline" @click="S.list = 'data'">Retry</button></div>
        <Empty v-else-if="S.list === 'empty' || !rows.length" icon="Receipt" title="No sales found" text="Try another filter, or open the till to make one."/>
        <template v-else><div v-for="g in groups" :key="g.day"><div class="mb-1.5 flex items-baseline justify-between px-1"><h3 class="text-sm font-semibold">{{ g.day }}</h3><span class="text-xs text-muted-foreground tnum">{{ g.rows.length }} sales · {{ dayTotal(g) }}</span></div>
          <div class="overflow-hidden rounded-xl border bg-card"><button v-for="(s, i) in g.rows" :key="s.id" type="button" :class="['press flex w-full items-center gap-3 px-3.5 py-3 text-left', i ? 'border-t' : '']" @click="go('sale', s.id)">
            <Av :c="cust(s.c)" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ cust(s.c).name }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ s.id }} · {{ s.time }} · {{ itemsText(s) }}</span>
              <span v-if="s.undoAsked" class="mt-0.5 flex items-center gap-1 text-xs font-medium text-warning"><Icon name="Undo2" :size="12"/>Undo asked</span></span>
            <span class="flex flex-col items-end gap-1"><span class="text-sm font-semibold tnum">{{ money(saleTotal(s)) }}</span><SaleStatus :s="s.pay"/></span></button></div></div>
          <button v-if="rows.length > S.shown" type="button" class="press h-9 w-full rounded-md border bg-card text-sm font-semibold" @click="S.shown += 6">Show more</button></template></div></div>
    <FilterSheet/></div>` };

const Row = { props: { k: String, v: String, mono: Boolean }, template: `<div class="flex items-center justify-between gap-4 py-2.5 text-sm"><span class="text-muted-foreground">{{ k }}</span><span :class="['text-right font-medium', mono ? 'font-mono text-sm' : '']"><slot>{{ v }}</slot></span></div>` };
const Card = { props: { title: String, icon: String }, components: { Icon },
  template: `<section class="rise rounded-xl border bg-card"><h3 v-if="title" class="flex items-center gap-2 px-4 pt-3.5 text-sm font-semibold"><Icon v-if="icon" :name="icon" :size="17" class="text-muted-foreground"/>{{ title }}</h3><div class="px-4 pb-2"><slot/></div></section>` };

const SalePage = { components: { Header, Icon, Av, Pill, Btn, Card, Row, SaleStatus, Sheet, FooterBar },
  setup() {
    const s = computed(() => SALES.find(x => x.id === S.saleId) || SALES[0]);
    const c = computed(() => cust(s.value.c));
    const total = computed(() => saleTotal(s.value));
    const left = computed(() => s.value.pay === 'undone' ? 0 : total.value - paidOf(s.value));
    const owner = computed(() => ME.value.role === 'Owner');
    const amt = ref(0); const method = ref('Cash');
    watch(() => S.sheet, (v) => { if (v === 'takepay') { amt.value = left.value; method.value = 'Cash'; } });
    const askUndo = () => { S.dialog = { title: owner.value ? 'Undo ' + s.value.id + '?' : 'Ask Amina to undo ' + s.value.id + '?', text: owner.value ? 'The stock goes back on the shelf and ' + c.value.name + "'s balance changes." : 'Nothing changes until she approves. She sees your request in Waiting for you.', action: owner.value ? 'Undo the sale' : 'Send the request', tone: owner.value ? 'destructive' : 'primary', cancel: 'Keep the sale',
      ok: () => { if (owner.value) { s.value.pay = 'undone'; s.value.undone = true; if (c.value.owes > 0) c.value.owes = Math.max(0, c.value.owes - left.value); toast(s.value.id + ' undone'); } else { s.value.undoAsked = true; toast('Sent to Amina'); } } }; };
    const record = () => { const a = Math.min(Math.max(+amt.value || 0, 0), left.value); if (!a) return; s.value.paid = paidOf(s.value) + a; s.value.pay = s.value.paid >= total.value ? 'paid' : 'part'; c.value.owes = Math.max(0, c.value.owes - a); S.sheet = null; newPayment(c.value.id, a, method.value, [s.value.id]); };
    const openReceipt = () => { S.recSrc = { kind: 'sale', id: s.value.id, copy: true }; S.print = 'idle'; go('receipt'); };
    return { S, s, c, total, left, owner, amt, method, askUndo, record, openReceipt, prod, money, go, paidOf, tint };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="s.id" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-3 p-3 pb-6">
      <section class="rise rounded-xl border bg-card p-4"><button type="button" class="press -m-1 flex w-[calc(100%+8px)] items-center gap-3 rounded-md p-1 text-left" @click="!c.walkin && go('customer', c.id)"><Av :c="c" :size="36"/>
          <span class="min-w-0 flex-1"><span class="block truncate text-base font-semibold">{{ c.name }}</span><span class="block text-xs text-muted-foreground">{{ s.day }}, {{ s.time }} · sold by {{ s.by }}</span></span><Icon v-if="!c.walkin" name="ChevronRight" :size="18" class="text-muted-foreground"/></button>
        <div class="mt-4 flex items-end justify-between"><div><p class="text-xs text-muted-foreground">Sale total</p><p class="text-2xl font-bold leading-tight tracking-tight tnum">{{ money(total) }}</p></div><SaleStatus :s="s.pay"/></div>
        <div v-if="s.pay === 'unpaid' || s.pay === 'part'" class="mt-3 flex items-center justify-between rounded-md bg-warning/10 px-3.5 py-2.5 text-sm"><span class="text-warning">Left to pay</span><b class="text-warning tnum">{{ money(left) }}</b></div></section>
      <Card title="Items" icon="ShoppingCart"><div v-for="l in s.lines" :key="l[0]" class="flex items-center justify-between border-b py-3 last:border-0"><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ prod(l[0]).name }}</span><span class="block text-xs text-muted-foreground tnum">{{ l[1] }} × {{ money(prod(l[0]).price) }} · oldest batch</span></span><span class="text-sm font-semibold tnum">{{ money(prod(l[0]).price * l[1]) }}</span></div></Card>
      <Card title="Payment" icon="Wallet"><Row k="Method" :v="s.method"/><Row k="Paid" :v="money(paidOf(s))"/><Row k="Left to pay" :v="money(left)"/></Card>
      <button type="button" class="press flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left" @click="openReceipt"><span class="grid h-9 w-9 place-items-center rounded-md bg-muted"><Icon name="ReceiptText" :size="19"/></span><span class="min-w-0 flex-1"><span class="block text-sm font-semibold">Receipt</span><span class="block text-xs text-muted-foreground">Print it or share it again</span></span><Icon name="ChevronRight" :size="18" class="text-muted-foreground"/></button>
      <Card title="What happened" icon="History"><ol class="py-2"><li v-for="(e, i) in [s.undone ? ['Undone', s.day + ', 11:20', 'Amina approved'] : null, s.undoAsked ? ['Undo asked', s.day + ', 11:05', 'Rehema: wrong customer'] : null, s.pay !== 'unpaid' && !s.undone ? ['Payment', s.day + ', ' + s.time, money(paidOf(s)) + ' · ' + s.method] : null, ['Sold', s.day + ', ' + s.time, 'by ' + s.by]].filter(Boolean)" :key="i" class="relative flex gap-3 pb-4 last:pb-0">
          <span class="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"><span class="absolute left-1/2 top-3 h-[calc(100%+22px)] w-px -translate-x-1/2 bg-border"></span></span><span class="min-w-0"><span class="block text-sm font-medium">{{ e[0] }}</span><span class="block text-xs text-muted-foreground">{{ e[1] }} · {{ e[2] }}</span></span></li></ol></Card></div></div>
    <FooterBar><p v-if="s.undone" class="py-2 text-center text-sm text-muted-foreground">This sale was undone.</p>
      <p v-else-if="s.undoAsked && !owner" class="flex h-9 items-center justify-center gap-2 text-sm text-warning"><Icon name="Hourglass" :size="17"/>Waiting for Amina to approve the undo</p>
      <div v-else class="grid gap-2" :class="left > 0 ? 'grid-cols-2' : 'grid-cols-1'"><Btn :v="owner ? 'destructive-outline' : 'outline'" @click="askUndo">{{ owner ? 'Undo sale' : 'Ask to undo' }}</Btn><Btn v-if="left > 0" @click="S.sheet = 'takepay'">Take payment</Btn></div></FooterBar>
    <Sheet :open="S.sheet === 'takepay'" title="Take payment" :sub="c.name + ' · ' + s.id" @close="S.sheet = null"><div class="px-5 pb-4">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</p><label class="mt-2 flex h-16 items-center gap-2 rounded-xl border-2 border-primary px-4"><span class="text-sm text-muted-foreground">TZS</span><input v-model.number="amt" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Amount" class="min-w-0 flex-1 bg-transparent text-right text-2xl font-bold tnum outline-none"></label>
      <div class="mt-2 flex gap-2"><button type="button" class="press h-8 rounded-full border px-4 text-sm font-medium" @click="amt = left">All {{ money(left) }}</button><button v-if="left > 1000" type="button" class="press h-8 rounded-full border px-4 text-sm font-medium" @click="amt = Math.round(left / 2)">Half</button></div>
      <p class="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Paid with</p><div class="flex flex-wrap gap-2"><button v-for="m in ['Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank']" :key="m" type="button" @click="method = m" :class="['press h-9 rounded-md px-4 text-sm font-medium', method === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ m }}</button></div></div>
      <template #footer><Btn full :disabled="!amt" @click="record">Record {{ money(Math.min(amt || 0, left)) }}</Btn></template></Sheet></div>` };
