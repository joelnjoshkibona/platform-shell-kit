/* ============================================================ shared list pieces, Payments */
const Chips = { props: { modelValue: String, items: Array }, template: `<div class="scroll -mx-3 flex gap-1.5 overflow-x-auto px-3"><button v-for="i in items" :key="i[0]" type="button" :aria-pressed="modelValue === i[0]" @click="$emit('update:modelValue', i[0])" :class="['press h-8 shrink-0 whitespace-nowrap rounded-md px-3 text-sm font-medium', modelValue === i[0] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ i[1] }}</button></div>` };
const SearchBar = { props: { modelValue: String, placeholder: String }, components: { Icon },
  template: `<label class="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm"><Icon name="Search" :size="15" class="text-muted-foreground"/><input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" type="search" :placeholder="placeholder" :aria-label="placeholder" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"></label>` };
const StickyBar = { template: `<div class="sticky top-0 z-10 space-y-2 border-b bg-background px-3 py-2.5"><slot/></div>` };
const DayHead = { props: { day: String, note: String }, template: `<div class="mb-1.5 mt-4 flex items-baseline justify-between px-1 first:mt-0"><h3 class="text-sm font-semibold">{{ day }}</h3><span class="text-xs text-muted-foreground tnum">{{ note }}</span></div>` };
const RowsCard = { template: `<div class="overflow-hidden rounded-xl border bg-card"><slot/></div>` };
const IconTile = { props: { icon: String, tone: { type: String, default: 'muted' } }, components: { Icon },
  template: `<span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-md', { muted: 'bg-muted text-muted-foreground', primary: 'bg-primary/10 text-primary', success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', destructive: 'bg-destructive/10 text-destructive' }[tone]]"><Icon :name="icon" :size="16"/></span>` };
const Fab = { props: { icon: { type: String, default: 'Plus' }, label: String }, components: { Icon },
  template: `<button type="button" class="press absolute bottom-4 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg" :aria-label="label"><Icon :name="icon" :size="20"/></button>` };
const AmountSheet = { props: { open: Boolean, title: String, sub: String, max: Number, init: Number, action: String, methods: Array, note: String }, components: { Sheet, Btn },
  setup(p, { emit }) { const amt = ref(0), m = ref(''); watch(() => p.open, (v) => { if (v) { amt.value = p.init != null ? p.init : (p.max || 0); m.value = (p.methods || [])[0] || ''; } });
    return { amt, m, money, ok: () => { const a = Math.min(+amt.value || 0, p.max || 1e12); if (a > 0) emit('confirm', a, m.value); } }; },
  template: `<Sheet :open="open" :title="title" :sub="sub" @close="$emit('close')"><div class="px-4 pb-4">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</p><label class="mt-1.5 flex h-12 items-center gap-2 rounded-md border-2 border-primary px-3"><span class="text-sm text-muted-foreground">TZS</span><input v-model.number="amt" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Amount" class="min-w-0 flex-1 bg-transparent text-right text-xl font-semibold tnum outline-none"></label>
      <div v-if="max" class="mt-2 flex gap-2"><button type="button" class="press h-8 rounded-md border px-3 text-sm font-medium" @click="amt = max">All {{ money(max) }}</button><button v-if="max > 1000" type="button" class="press h-8 rounded-md border px-3 text-sm font-medium" @click="amt = Math.round(max / 2)">Half</button></div>
      <template v-if="methods"><p class="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ methods.label || 'Paid with' }}</p><div class="flex flex-wrap gap-2"><button v-for="x in methods" :key="x" type="button" @click="m = x" :class="['press h-8 rounded-md px-3 text-sm font-medium', m === x ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ x }}</button></div></template>
      <p v-if="note" class="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground"><span>{{ note }}</span></p></div>
    <template #footer><Btn full :disabled="!amt" @click="ok">{{ action || 'Save' }} {{ money(Math.min(amt || 0, max || 1e12)) }}</Btn></template></Sheet>` };

const PaymentsList = { components: { Header, Icon, Av, Pill, Empty, Chips, SearchBar, StickyBar, DayHead, RowsCard },
  setup() {
    const f = ref('all'), q = ref('');
    const rows = computed(() => PAYMENTS.filter(p => (f.value === 'all' || (f.value === 'cash' ? p.method === 'Cash' : f.value === 'mobile' ? ['M-Pesa', 'Airtel Money', 'Tigo Pesa'].includes(p.method) : p.method === 'Bank')) && (cust(p.c).name + p.id).toLowerCase().includes(q.value.toLowerCase())));
    const groups = computed(() => { const g = []; rows.value.forEach(p => { let x = g.find(y => y.day === p.day); if (!x) g.push(x = { day: p.day, rows: [] }); x.rows.push(p); }); return g; });
    return { f, q, rows, groups, cust, money, go, S, total: PAYMENTS.filter(p => p.day === 'Today').reduce((t, p) => t + p.amt, 0) };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Payments"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><StickyBar><SearchBar v-model="q" placeholder="Customer or payment no."/><Chips v-model="f" :items="[['all', 'All'], ['cash', 'Cash'], ['mobile', 'Mobile money'], ['bank', 'Bank']]"/></StickyBar>
      <div class="p-3 pb-6"><div class="mb-3 flex items-center justify-between rounded-xl bg-success/10 px-4 py-3"><span class="text-sm text-muted-foreground">Collected today</span><b class="text-base text-success tnum">{{ money(total) }}</b></div>
        <Empty v-if="!rows.length" icon="Wallet" title="No payments found" text="Try another name or number."/>
        <div v-for="g in groups" :key="g.day"><DayHead :day="g.day" :note="g.rows.length + (g.rows.length === 1 ? ' payment · ' : ' payments · ') + money(g.rows.reduce((t, p) => t + p.amt, 0))"/>
          <RowsCard><button v-for="(p, i) in g.rows" :key="p.id" type="button" :class="['press flex w-full items-center gap-3 px-3.5 py-2.5 text-left', i ? 'border-t' : '']" @click="go('payment', p.id)">
            <Av :c="cust(p.c)" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ cust(p.c).name }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ p.id }} · {{ p.time }} · {{ p.acct }}</span><Pill v-if="p.changeAsked" tone="warning">Change asked</Pill></span>
            <span class="text-right"><span class="block text-sm font-semibold text-success tnum">{{ money(p.amt) }}</span><span class="block text-xs text-muted-foreground">{{ p.method }}</span></span></button></RowsCard></div></div></div></div>` };

const PaymentPage = { components: { Header, Icon, Av, Pill, Btn, Card, Row, FooterBar, AmountSheet },
  setup() {
    const p = computed(() => PAYMENTS.find(x => x.id === S.payId) || PAYMENTS[0]); const c = computed(() => cust(p.value.c)); const owner = computed(() => S.role === 'owner');
    const del = () => { S.dialog = { title: owner.value ? 'Delete ' + p.value.id + '?' : 'Ask Amina to delete ' + p.value.id + '?', text: owner.value ? c.value.name + "'s balance goes back up by " + money(p.value.amt) + '.' : 'Nothing changes until she approves.', action: owner.value ? 'Delete the payment' : 'Send the request', tone: owner.value ? 'destructive' : 'primary', cancel: 'Keep it', ok: () => { toast(owner.value ? p.value.id + ' deleted' : 'Sent to Amina'); if (owner.value) back(); } }; };
    const change = (a) => { S.sheet = null; if (owner.value) { p.value.amt = a; p.value.changeAsked = false; toast(p.value.id + ' is now ' + money(a)); } else { p.value.changeAsked = true; p.value.note = 'Rehema asks for ' + money(a); toast('Sent to Amina'); } };
    const decide = (yes) => { p.value.changeAsked = false; toast(yes ? 'Change approved' : 'Change declined'); };
    return { S, p, c, owner, del, change, decide, money, go, cust, SALES, saleTotal };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="p.id" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-3 p-3 pb-6">
      <section class="rise rounded-xl border bg-card p-4"><button type="button" class="press -m-1 flex w-[calc(100%+8px)] items-center gap-3 rounded-md p-1 text-left" @click="go('customer', c.id)"><Av :c="c" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ c.name }}</span><span class="block text-xs text-muted-foreground">{{ p.day }}, {{ p.time }} · recorded by {{ p.by }}</span></span><Icon name="ChevronRight" :size="16" class="text-muted-foreground"/></button>
        <p class="mt-4 text-xs text-muted-foreground">Amount received</p><p class="text-2xl font-semibold text-success tnum">{{ money(p.amt) }}</p><p class="mt-0.5 text-xs text-muted-foreground">{{ p.method }} · into {{ p.acct }}</p></section>
      <section v-if="p.changeAsked" class="rounded-xl border border-warning/40 bg-warning/10 p-4"><p class="flex items-center gap-2 text-sm font-semibold text-warning"><Icon name="Hourglass" :size="16"/>{{ owner ? 'Rehema asks to change this' : 'Waiting for Amina' }}</p><p class="mt-1 text-sm text-muted-foreground">{{ p.note }}</p></section>
      <Card title="It paid" icon="Receipt"><div v-for="id in p.sales" :key="id" class="flex items-center justify-between border-b py-2.5 last:border-0"><span><span class="block font-mono text-xs font-medium">{{ id }}</span><span class="block text-xs text-muted-foreground">Oldest unpaid first</span></span><span class="text-sm font-semibold tnum">{{ money(p.amt / p.sales.length) }}</span></div></Card>
      <Card title="What happened" icon="History"><ol class="py-2"><li class="relative flex gap-3"><span class="relative mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"></span><span><span class="block text-sm font-medium">Recorded</span><span class="block text-xs text-muted-foreground">{{ p.day }}, {{ p.time }} · by {{ p.by }} · {{ p.acct }}</span></span></li></ol></Card></div></div>
    <FooterBar><div v-if="p.changeAsked && owner" class="grid grid-cols-2 gap-2"><Btn v="outline" @click="decide(false)">Decline</Btn><Btn @click="decide(true)">Approve change</Btn></div>
      <div v-else class="grid grid-cols-2 gap-2"><Btn :v="owner ? 'destructive-outline' : 'outline'" @click="del">{{ owner ? 'Delete' : 'Ask to delete' }}</Btn><Btn @click="S.sheet = 'paychange'">{{ owner ? 'Change amount' : 'Ask to change' }}</Btn></div></FooterBar>
    <AmountSheet :open="S.sheet === 'paychange'" title="Change the amount" :sub="p.id + ' · ' + c.name" :init="p.amt" action="Set to" :note="owner ? 'Their balance is worked out again.' : 'Nothing changes until Amina approves.'" @close="S.sheet = null" @confirm="change"/></div>` };

/* ============================================================ Products and stock movements */
const prodCode = (p) => p.ini + '-00' + (PRODUCTS.indexOf(p) + 1);
const ProductsList = { components: { Header, Icon, Tile, Empty, Chips, SearchBar, StickyBar, RowsCard, LevelBadge, Fab },
  setup() {
    const f = ref('all'), q = ref('');
    const rows = computed(() => PRODUCTS.filter(p => (f.value === 'all' || (f.value === 'low' ? level(p) !== 'ok' : level(p) === 'ok')) && p.name.toLowerCase().includes(q.value.toLowerCase())));
    return { f, q, rows, PRODUCTS, level, perText, stockText, prodCode, go, toast, S };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header title="Products"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><StickyBar><SearchBar v-model="q" placeholder="Find a product"/><Chips v-model="f" :items="[['all', 'All ' + PRODUCTS.length], ['low', 'Low or out'], ['ok', 'In stock']]"/></StickyBar>
      <div class="p-3 pb-20"><Empty v-if="!rows.length" icon="Package" title="No products found"/>
        <RowsCard v-else><button v-for="(p, i) in rows" :key="p.id" type="button" :class="['press flex w-full items-center gap-3 px-3.5 py-2.5 text-left', i ? 'border-t' : '']" @click="S.pid = p.id; go('product')">
          <Tile :p="p" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ p.name }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ prodCode(p) }} · {{ perText(p) }}</span></span>
          <span class="flex flex-col items-end gap-1"><span :class="['text-xs tnum', level(p) === 'ok' ? 'text-muted-foreground' : level(p) === 'low' ? 'font-medium text-warning' : 'font-medium text-destructive']">{{ stockText(p) }}</span><LevelBadge :p="p"/></span></button></RowsCard></div></div>
    <Fab label="New product" @click="toast('New product: name, unit, price, packs')"/></div>` };

const ProductPage = { components: { Header, Icon, Tile, Pill, Btn, Seg, Card, Row, FooterBar, LevelBadge, Sheet, Stepper },
  setup() {
    const p = computed(() => prod(S.pid) || PRODUCTS[0]); const owner = computed(() => S.role === 'owner');
    const bs = computed(() => BATCHES.filter(b => b.pid === p.value.id)); const ms = computed(() => prodMoves(p.value.id));
    const tabs = computed(() => [{ id: 'overview', label: 'Overview' }, { id: 'batches', label: 'Batches', count: bs.value.length }, { id: 'moves', label: 'Movements' }]);
    const bars = [3, 5, 2, 6, 4, 7, 5]; const adj = ref(0); const why = ref('Damaged');
    const sendAdj = () => { S.sheet = null; toast(owner.value ? 'Stock adjusted' : 'Sent to Amina'); };
    return { S, p, owner, bs, ms, tabs, bars, adj, why, sendAdj, level, perText, stockText, money, prodCode, MTYPE, go };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="p.name" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-3 p-3 pb-6">
      <section class="rise rounded-xl border bg-card p-4"><div class="flex items-center gap-3"><Tile :p="p" :size="44"/><div class="min-w-0 flex-1"><h2 class="truncate text-xl font-semibold leading-tight">{{ p.name }}</h2><p class="font-mono text-xs text-muted-foreground">{{ prodCode(p) }}</p></div><LevelBadge :p="p"/></div>
        <div class="mt-4 grid grid-cols-2 gap-3"><div class="rounded-md bg-muted/60 p-3"><p class="text-xs text-muted-foreground">On hand</p><p class="text-xl font-semibold tnum">{{ p.stock }}</p><p class="text-xs text-muted-foreground">{{ p.units }}</p></div>
          <div class="rounded-md bg-muted/60 p-3"><p class="text-xs text-muted-foreground">Sells for</p><p class="text-xl font-semibold tnum">{{ money(p.price * p.step) }}</p><p class="text-xs text-muted-foreground">{{ p.step > 1 ? 'per ' + p.step : 'each' }}</p></div></div></section>
      <Seg v-model="S.prodTab" :tabs="tabs"/>
      <template v-if="S.prodTab === 'overview'"><Card title="Details" icon="Info"><Row k="Sells in steps of" :v="p.step + (p.step > 1 ? ' ' + p.units : ' ' + p.unit)"/><Row k="Bought as" :v="p.pack"/><Row k="Warn when below" :v="p.reorder + ' ' + p.units"/><Row k="Cost of oldest batch" :v="bs.length ? money(bs[0].cost) : '—'"/></Card>
        <Card title="Sold per day" icon="ChartColumn"><div class="flex h-24 items-end gap-2 pb-2 pt-4"><div v-for="(b, i) in bars" :key="i" class="flex flex-1 flex-col items-center gap-1"><div class="w-full rounded-sm bg-primary/70" :style="{ height: b * 10 + 'px' }"></div><span class="text-[10px] text-muted-foreground">{{ ['M','T','W','T','F','S','S'][i] }}</span></div></div></Card></template>
      <template v-else-if="S.prodTab === 'batches'"><p class="px-1 text-xs text-muted-foreground">Oldest first. Sales take from the top one unless you pick a batch.</p>
        <div v-for="(b, i) in bs" :key="b.id" class="rise rounded-xl border bg-card p-3.5"><div class="flex items-center justify-between"><span class="flex items-center gap-2"><span class="font-mono text-xs font-medium">{{ b.id }}</span><Pill v-if="i === 0" tone="primary">Sells first</Pill></span><span class="text-xs text-muted-foreground">{{ b.date }} · {{ b.del }}</span></div>
          <div class="mt-2 flex items-baseline justify-between"><span class="text-sm"><b class="tnum">{{ b.left }}</b> of {{ b.qty }} left</span><span class="text-xs text-muted-foreground tnum">cost {{ money(b.cost) }} each</span></div><div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-primary" :style="{ width: b.left / b.qty * 100 + '%' }"></div></div></div></template>
      <template v-else><div class="overflow-hidden rounded-xl border bg-card"><div v-for="(m, i) in ms" :key="m.id" :class="['flex items-center gap-3 px-3.5 py-2.5', i ? 'border-t' : '']"><span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-md', { success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', muted: 'bg-muted text-muted-foreground', primary: 'bg-primary/10 text-primary', destructive: 'bg-destructive/10 text-destructive' }[MTYPE[m.t].tone]]"><Icon :name="MTYPE[m.t].icon" :size="16"/></span>
        <span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ MTYPE[m.t].label }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ m.ref }} · {{ m.day }}, {{ m.time }}</span></span><span :class="['text-sm font-semibold tnum', m.q > 0 ? 'text-success' : '']">{{ m.q > 0 ? '+' : '−' }}{{ Math.abs(m.q) }}</span></div></div></template></div></div>
    <FooterBar><div class="grid gap-2" :class="owner ? 'grid-cols-2' : 'grid-cols-1'"><Btn v="outline" @click="S.sheet = 'adjust'">{{ owner ? 'Adjust stock' : 'Ask to adjust stock' }}</Btn><Btn v-if="owner" @click="go('receive')">Receive stock</Btn></div></FooterBar>
    <Sheet :open="S.sheet === 'adjust'" title="Adjust stock" :sub="p.name + ' · ' + p.stock + ' ' + p.units + ' on hand'" @close="S.sheet = null"><div class="px-4 pb-4"><p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Take out or put back</p>
      <div class="mt-2 flex justify-center"><Stepper :q="adj" :step="1" :max="9999" @sub="adj--" @add="adj++"/></div><p class="mt-2 text-center text-xs text-muted-foreground">{{ adj === 0 ? 'No change' : adj < 0 ? 'Takes out ' + Math.abs(adj) : 'Puts back ' + adj }}</p>
      <p class="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Why</p><div class="flex flex-wrap gap-2"><button v-for="w in ['Damaged', 'Expired', 'Found', 'Own use', 'Other']" :key="w" type="button" @click="why = w" :class="['press h-8 rounded-md px-3 text-sm font-medium', why === w ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ w }}</button></div>
      <p v-if="!owner" class="mt-3 text-xs text-muted-foreground">Stock changes only after Amina approves.</p></div><template #footer><Btn full :disabled="adj === 0" @click="sendAdj">{{ owner ? 'Adjust stock' : 'Send to Amina' }}</Btn></template></Sheet></div>` };

const Movements = { components: { Header, Icon, Empty, Chips, StickyBar, DayHead, RowsCard },
  setup() {
    const f = ref('all'); const map = { sales: ['sale', 'undo'], received: ['receive'], adjust: ['adjust'], counts: ['count'], returns: ['return'] };
    const rows = computed(() => MOVES.filter(m => f.value === 'all' || map[f.value].includes(m.t)));
    const groups = computed(() => { const g = []; rows.value.forEach(m => { let x = g.find(y => y.day === m.day); if (!x) g.push(x = { day: m.day, rows: [] }); x.rows.push(m); }); return g; });
    return { f, groups, rows, MTYPE, prod, S };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Stock movements"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><StickyBar><Chips v-model="f" :items="[['all', 'All'], ['sales', 'Sales'], ['received', 'Received'], ['adjust', 'Adjustments'], ['counts', 'Counts'], ['returns', 'Returns']]"/></StickyBar>
      <div class="p-3 pb-6"><p class="mb-2 px-1 text-xs text-muted-foreground">What is on the shelf is the sum of these. Nothing is typed in as a total.</p><Empty v-if="!rows.length" icon="ArrowLeftRight" title="No movements"/>
        <div v-for="g in groups" :key="g.day"><DayHead :day="g.day" :note="g.rows.length + (g.rows.length === 1 ? ' movement' : ' movements')"/><RowsCard><div v-for="(m, i) in g.rows" :key="m.id" :class="['flex items-center gap-3 px-3.5 py-2.5', i ? 'border-t' : '']">
          <span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-md', { success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', muted: 'bg-muted text-muted-foreground', primary: 'bg-primary/10 text-primary', destructive: 'bg-destructive/10 text-destructive' }[MTYPE[m.t].tone]]"><Icon :name="MTYPE[m.t].icon" :size="16"/></span>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ prod(m.pid).name }} · {{ MTYPE[m.t].label }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ m.ref }} · {{ m.time }}</span></span><span :class="['text-sm font-semibold tnum', m.q > 0 ? 'text-success' : '']">{{ m.q > 0 ? '+' : '−' }}{{ Math.abs(m.q) }}</span></div></RowsCard></div></div></div></div>` };
