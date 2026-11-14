/* ============================================================ P115 on a phone: Add a line picks from the catalogue
   ItemCatalogue (the step itself: sticky search, category chips, price, stock, the quantity already in the document) → a tap opens QtySheet
   (large quantity, − / +, +10 … +100, the line total, Add / Update / Remove; limits by stock and by a money ceiling) → CartBar opens the lines.
   The lines, the draft, the save and the server rules are P115's. Drawn here as a customer order (a document with lines), next to the till,
   which keeps its own tap-to-add pattern. */
const CATEGORY = { p1: 'Drinks', p3: 'Drinks', p2: 'Snacks', p4: 'Snacks', p5: 'Groceries', p6: 'Household' };
const DOC = reactive({ c: 'c2', pay: 'cash', lines: [], step: 0, dir: 'step-next', q: '', cat: 'All', qtyId: null, qtyStart: null });
const docQty = (id) => (DOC.lines.find(l => l.id === id) || { q: 0 }).q;
const docTotal = computed(() => DOC.lines.reduce((t, l) => t + prod(l.id).price * l.q, 0));
const docUnits = computed(() => DOC.lines.reduce((t, l) => t + l.q, 0));
function docSet(id, q) { const l = DOC.lines.find(x => x.id === id); if (q <= 0) { if (l) DOC.lines.splice(DOC.lines.indexOf(l), 1); return; } if (l) l.q = q; else DOC.lines.push({ id, q }); }
function docReset(c = 'c2', pay = 'cash') { Object.assign(DOC, { c, pay, lines: [], step: 0, dir: 'step-next', q: '', cat: 'All', qtyId: null, qtyStart: null }); }
/* the money ceiling: on credit, what is left of the customer's limit after what they owe and the other lines */
const docRoom = (exceptId) => { const c = cust(DOC.c); if (DOC.pay !== 'credit' || !c.limit) return null; return c.limit - c.owes - DOC.lines.filter(l => l.id !== exceptId).reduce((t, l) => t + prod(l.id).price * l.q, 0); };

/* QtySheet */
const QtySheet = { components: { Sheet, Icon, Btn, Tile },
  setup() {
    const p = computed(() => prod(DOC.qtyId)); const had = computed(() => docQty(DOC.qtyId));
    const q = ref(0); watch(() => DOC.qtyId, (id) => { if (id) q.value = DOC.qtyStart != null ? DOC.qtyStart : (docQty(id) || prod(id).step); }, { immediate: true });
    const max = computed(() => p.value ? p.value.stock : 0);
    const room = computed(() => DOC.qtyId ? docRoom(DOC.qtyId) : null);
    const total = computed(() => p.value ? p.value.price * q.value : 0);
    const overStock = computed(() => q.value > max.value); const atStock = computed(() => q.value === max.value);
    const overRoom = computed(() => room.value != null && total.value > room.value);
    const set = (v) => { q.value = Math.max(0, Math.min(max.value, Math.round(v))); };
    const ok = computed(() => q.value > 0 && !overStock.value && !overRoom.value);
    const save = () => { docSet(DOC.qtyId, q.value); S.sheet = null; DOC.qtyStart = null; };
    const remove = () => { docSet(DOC.qtyId, 0); S.sheet = null; DOC.qtyStart = null; };
    return { S, DOC, p, had, q, max, room, total, overStock, atStock, overRoom, set, ok, save, remove, money, num };
  },
  template: `<Sheet :open="S.sheet === 'qty' && !!p" :title="p ? p.name : ''" :sub="p ? money(p.price) + ' per ' + p.unit + ' · ' + p.stock + ' ' + p.units + ' in stock' : ''" @close="S.sheet = null">
    <div v-if="p" class="space-y-4 px-5 pb-3">
      <div class="flex items-center gap-3"><button type="button" class="press grid h-14 w-14 shrink-0 place-items-center rounded-xl border text-2xl" aria-label="One less" @click="set(q - p.step)"><Icon name="Minus" :size="22"/></button>
        <input :value="q" inputmode="numeric" aria-label="Quantity" class="h-14 min-w-0 flex-1 rounded-xl border border-input bg-background text-center text-3xl font-bold tnum outline-none focus:border-primary" @input="e => set(+e.target.value.replace(/\\D/g, '') || 0)">
        <button type="button" :disabled="q + p.step > max" class="press grid h-14 w-14 shrink-0 place-items-center rounded-xl border text-2xl disabled:opacity-35" aria-label="One more" @click="set(q + p.step)"><Icon name="Plus" :size="22"/></button></div>
      <div class="grid grid-cols-4 gap-2"><button v-for="n in [10, 20, 50, 100]" :key="n" type="button" :disabled="q >= max" class="press h-10 rounded-lg bg-muted text-sm font-semibold disabled:opacity-40" @click="set(q + n)">+{{ n }}</button></div>
      <p v-if="atStock" class="flex gap-2 rounded-lg bg-warning/10 p-2.5 text-xs text-warning"><Icon name="PackageMinus" :size="15"/>That is all {{ max }} {{ p.units }} in stock.</p>
      <p v-if="overRoom" class="flex gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive"><Icon name="CircleAlert" :size="15"/>Only {{ money(Math.max(0, room)) }} of the credit limit is left. Lower the quantity or take cash.</p>
      <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3.5 py-2.5 text-sm"><span class="text-muted-foreground">{{ num(q) }} × {{ money(p.price) }}</span><span class="text-base font-bold tnum">{{ money(total) }}</span></div></div>
    <template #footer><div :class="['grid gap-2', had ? 'grid-cols-[auto_1fr]' : '']"><Btn v-if="had" v="destructive-outline" class="h-12 px-4" aria-label="Remove the line" @click="remove"><Icon name="Trash2" :size="18"/></Btn><Btn full class="h-12" :disabled="!ok" @click="save">{{ had ? 'Update' : 'Add' }} · {{ money(total) }}</Btn></div></template></Sheet>` };

/* LinesSheet: the lines (P115's DocLines in a sheet): change opens the quantity sheet, the bin removes */
const LinesSheet = { props: { title: { type: String, default: 'The order' } }, components: { Sheet, Icon, Tile, Btn },
  setup() { const open = (id) => { DOC.qtyId = id; S.sheet = 'qty'; }; return { S, DOC, prod, money, num, docTotal, docUnits, docSet, open }; },
  template: `<Sheet :open="S.sheet === 'doclines'" :title="title" :sub="DOC.lines.length + ' lines · ' + docUnits + ' units'" @close="S.sheet = null"><div class="px-4 pb-2">
    <div v-for="l in DOC.lines" :key="l.id" class="flex items-center gap-3 border-b py-3"><Tile :p="prod(l.id)" :size="40"/><button type="button" class="press min-w-0 flex-1 text-left" @click="open(l.id)"><span class="block truncate text-sm font-semibold">{{ prod(l.id).name }}</span><span class="block text-xs text-muted-foreground tnum">{{ num(l.q) }} × {{ money(prod(l.id).price) }}</span></button>
      <span class="text-sm font-semibold tnum">{{ money(l.q * prod(l.id).price) }}</span><button type="button" class="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground" :aria-label="'Remove ' + prod(l.id).name" @click="docSet(l.id, 0)"><Icon name="Trash2" :size="17"/></button></div></div>
    <template #footer><div class="flex items-center justify-between pb-1"><span class="text-sm text-muted-foreground">Total</span><span class="text-lg font-bold tnum">{{ money(docTotal) }}</span></div></template></Sheet>` };

/* CartBar: sticky at the bottom of the catalogue */
const CartBar = { components: { Icon }, setup() { return { S, DOC, money, docTotal, docUnits }; },
  template: `<transition name="pop"><button v-if="DOC.lines.length" type="button" class="press sticky bottom-3 z-10 mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground shadow-lg" @click="S.sheet = 'doclines'">
    <span class="grid h-9 w-9 place-items-center rounded-full bg-white/20"><Icon name="ShoppingBag" :size="18"/></span><span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ DOC.lines.length }} lines · {{ docUnits }} units</span><span class="block text-xs opacity-80">Tap to see the lines</span></span><span class="text-base font-bold tnum">{{ money(docTotal) }}</span></button></transition>` };

/* ItemCatalogue: the catalogue is the step itself */
const ItemCatalogue = { components: { Icon, Tile, Pill, CartBar },
  setup() {
    const cats = ['All', ...new Set(Object.values(CATEGORY))];
    const list = computed(() => PRODUCTS.filter(p => (DOC.cat === 'All' || CATEGORY[p.id] === DOC.cat) && p.name.toLowerCase().includes(DOC.q.trim().toLowerCase())));
    const tap = (p) => { if (p.stock <= 0) return toast(p.name + ' is out of stock: receive a delivery first'); DOC.qtyId = p.id; DOC.qtyStart = null; S.sheet = 'qty'; };
    return { S, DOC, cats, list, tap, docQty, money, stockText, level };
  },
  template: `<div>
    <div class="sticky top-0 z-10 space-y-2 border-b bg-background px-3 pb-2.5 pt-3"><div class="relative"><Icon name="Search" :size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input v-model="DOC.q" placeholder="Name, SKU or barcode" aria-label="Search items" class="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-11 text-sm outline-none focus:border-primary"><button type="button" class="press absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground" aria-label="Scan a barcode" @click="toast('The camera opens to scan (P64)')"><Icon name="ScanLine" :size="18"/></button></div>
      <div class="scroll -mx-3 flex gap-1.5 overflow-x-auto px-3"><button v-for="c in cats" :key="c" type="button" :class="['press h-8 shrink-0 rounded-full border px-3 text-xs font-medium', DOC.cat === c ? 'border-primary bg-primary/10 text-primary' : '']" @click="DOC.cat = c">{{ c }}</button></div></div>
    <slot/>
    <div class="space-y-2 p-3"><button v-for="p in list" :key="p.id" type="button" :class="['press flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left', p.stock <= 0 ? 'opacity-60' : '', docQty(p.id) ? 'border-primary/50 bg-primary/5' : '']" @click="tap(p)">
      <span class="relative"><Tile :p="p" :size="44"/><span v-if="docQty(p.id)" class="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground tnum">{{ docQty(p.id) }}</span></span>
      <span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ p.name }}</span><span :class="['block text-xs', level(p) === 'out' ? 'text-destructive' : level(p) === 'low' ? 'text-warning' : 'text-muted-foreground']">{{ stockText(p) }}</span></span>
      <span class="text-right"><span class="block text-sm font-semibold tnum">{{ money(p.price) }}</span><span class="block text-[11px] text-muted-foreground">per {{ p.unit }}</span></span></button>
      <p v-if="!list.length" class="py-8 text-center text-sm text-muted-foreground">No item matches “{{ DOC.q }}”</p></div>
    <CartBar/></div>` };

/* NewOrder: a document with lines, three steps; the steps slide by direction (PageTransition 'step-next' / 'step-back'); it ends in the done moment */
/* the sheets sit on the screen, not inside the scrolling step, so the app is their frame */
const NewOrder = { components: { Header, Icon, Av, Btn, FooterBar, ItemCatalogue, Seg, Tile, QtySheet, LinesSheet },
  setup() {
    const steps = ['Customer', 'Lines', 'Check'];
    const people = CUSTOMERS.filter(c => !c.walkin);
    const room = computed(() => docRoom(null));
    const ok = computed(() => [!!DOC.c, DOC.lines.length > 0 && !(room.value != null && room.value < 0), true][DOC.step]);
    const next = () => { if (DOC.step < 2) { DOC.dir = 'step-next'; DOC.step++; return; }
      const c = cust(DOC.c), total = docTotal.value, units = docUnits.value, n = DOC.lines.length; const ref = 'SO-0042';
      S.stack = ['home']; S.nav = 'tab'; S.route = 'home';
      done({ title: 'Order made', ref, text: DOC.pay === 'credit' ? 'On credit: ' + c.name + ' owes ' + money(c.owes + total) + ' now.' : c.name + ' pays when the goods are picked up.',
        facts: [['Customer', c.name], ['Lines', n + ' lines · ' + units + ' units'], ['Total', money(total)]],
        primary: ['Print the order', () => toast('Printing SO-0042'), 'Printer'], secondary: ['Make another order', () => { docReset(); go('neworder'); }, 'Plus'] });
      docReset(); };
    const prev = () => { DOC.dir = 'step-back'; DOC.step--; };
    return { S, DOC, steps, people, room, ok, next, prev, cust, money, num, prod, docTotal, docUnits, pinLeaving };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="New order" pushed hide-search/>
    <div class="shrink-0 border-b px-4 py-2.5"><div class="flex items-center gap-2"><template v-for="(s, i) in steps" :key="s"><span :class="['grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold', i < DOC.step ? 'bg-success text-white' : i === DOC.step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']"><Icon v-if="i < DOC.step" name="Check" :size="13"/><template v-else>{{ i + 1 }}</template></span><span :class="['text-xs', i === DOC.step ? 'font-semibold' : 'text-muted-foreground']">{{ s }}</span><span v-if="i < 2" class="h-px flex-1 bg-border"></span></template></div></div>
    <div class="scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"><transition :name="'pg-' + DOC.dir" @before-leave="pinLeaving"><div :key="DOC.step">
      <div v-if="DOC.step === 0" class="space-y-3 p-3"><Seg v-model="DOC.pay" :tabs="[{ id: 'cash', label: 'Cash' }, { id: 'credit', label: 'Credit' }]"/>
        <button v-for="c in people" :key="c.id" type="button" :class="['press flex w-full items-center gap-3 rounded-xl border p-3 text-left', DOC.c === c.id ? 'border-primary bg-primary/5' : 'bg-card']" @click="DOC.c = c.id"><Av :c="c" :size="40"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ c.name }}</span><span class="block text-xs text-muted-foreground">{{ c.limit ? 'Credit limit ' + money(c.limit) + (c.owes > 0 ? ' · owes ' + money(c.owes) : '') : 'No credit' }}</span></span><Icon v-if="DOC.c === c.id" name="CircleCheck" :size="20" class="text-primary"/></button></div>
      <ItemCatalogue v-else-if="DOC.step === 1"><div v-if="room != null" :class="['mx-3 mt-3 rounded-xl border p-3 text-xs', room < 0 ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'bg-card text-muted-foreground']">Credit left for this order: <span class="font-semibold tnum">{{ money(Math.max(0, room)) }}</span> of {{ money(cust(DOC.c).limit) }}</div></ItemCatalogue>
      <div v-else class="space-y-3 p-3"><div class="rounded-xl border bg-card"><div class="flex justify-between px-4 py-2.5 text-sm"><span class="text-muted-foreground">Customer</span><span class="font-medium">{{ cust(DOC.c).name }}</span></div><div class="flex justify-between border-t px-4 py-2.5 text-sm"><span class="text-muted-foreground">Payment</span><span class="font-medium">{{ DOC.pay === 'credit' ? 'Credit' : 'Cash' }}</span></div></div>
        <div class="rounded-xl border bg-card"><div v-for="l in DOC.lines" :key="l.id" class="flex items-center gap-3 border-t px-4 py-2.5 first:border-t-0"><Tile :p="prod(l.id)" :size="34"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ prod(l.id).name }}</span><span class="block text-xs text-muted-foreground tnum">{{ num(l.q) }} × {{ money(prod(l.id).price) }}</span></span><span class="text-sm font-semibold tnum">{{ money(l.q * prod(l.id).price) }}</span></div></div>
        <div class="flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-primary-foreground"><span class="text-sm opacity-80">Total · {{ docUnits }} units</span><span class="text-xl font-bold tnum">{{ money(docTotal) }}</span></div></div></div></transition></div>
    <FooterBar><div :class="['grid gap-2', DOC.step ? 'grid-cols-[auto_1fr]' : '']"><Btn v-if="DOC.step" v="outline" class="h-12 px-4" @click="prev"><Icon name="ArrowLeft" :size="17"/>Back</Btn><Btn full class="h-12" :disabled="!ok" @click="next">{{ DOC.step === 2 ? 'Make the order' : 'Next' }}</Btn></div></FooterBar><QtySheet/><LinesSheet/></div>` };
