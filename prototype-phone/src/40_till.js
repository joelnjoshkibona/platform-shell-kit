/* ============================================================ Till (full screen, no tab bar) */
const Stepper = { props: { q: Number, step: { type: Number, default: 1 }, max: Number, size: { type: String, default: 'md' }, full: Boolean }, components: { Icon },
  template: `<div :class="['items-center rounded-md border bg-background', full ? 'flex w-full justify-between' : 'inline-flex shrink-0', size === 'sm' ? 'h-9' : 'h-9']"><button type="button" class="press grid h-full w-12 place-items-center" aria-label="One less" @click="$emit('sub')"><Icon name="Minus" :size="17"/></button>
    <span class="min-w-9 text-center text-sm font-semibold tnum" aria-live="polite">{{ q }}</span><button type="button" :disabled="q + step > max" :class="['press grid h-full w-12 place-items-center', q + step > max ? 'opacity-35' : '']" aria-label="One more" @click="$emit('add')"><Icon name="Plus" :size="17"/></button></div>` };

const qtyOf = (id) => (S.cart.find(l => l.id === id) || { q: 0 }).q;
function addP(p) {
  const l = S.cart.find(x => x.id === p.id);
  if (l) { if (l.q + p.step > p.stock) return toast('Only ' + p.stock + ' ' + p.units + ' left'); l.q += p.step; }
  else { if (p.stock < p.step) return toast(p.stock ? 'Sold in steps of ' + p.step : p.name + ' is out of stock'); S.cart.push({ id: p.id, q: p.step }); }
}
function subP(p) { const l = S.cart.find(x => x.id === p.id); if (!l) return; l.q -= p.step; if (l.q <= 0) S.cart.splice(S.cart.indexOf(l), 1); }
const cartTotal = computed(() => S.cart.reduce((t, l) => t + prod(l.id).price * l.q, 0));
const cartUnits = computed(() => S.cart.reduce((t, l) => t + l.q, 0));
const payNow = computed(() => S.pay === 'cash' ? cartTotal.value : (S.part ? Math.min(cartTotal.value, S.partAmt || 0) : 0));
const owesAfter = computed(() => cust(S.customer).owes + cartTotal.value - payNow.value);
const overLimit = computed(() => S.pay === 'credit' && !cust(S.customer).walkin && cust(S.customer).limit > 0 && owesAfter.value > cust(S.customer).limit);
const canCharge = computed(() => cartTotal.value > 0 && !(S.pay === 'credit' && cust(S.customer).walkin));
S.partAmt = 0;
let nextSale = 1305;
function charge() {
  const lines = S.cart.map(l => [l.id, l.q]);
  const paid = payNow.value, total = cartTotal.value;
  const sale = { id: 'S-' + (nextSale++), c: S.customer, day: 'Today', time: '11:02', lines, pay: paid >= total ? 'paid' : paid > 0 ? 'part' : 'unpaid', method: S.pay === 'cash' ? 'Cash' : 'Credit', by: ME.value.name, paid, fresh: true };
  SALES.unshift(sale); if (sale.pay !== 'paid') cust(S.customer).owes += total - paid;
  S.receipt = sale; S.cart = []; S.cartOpen = false; S.partAmt = 0; S.part = false; S.pay = 'cash';
  S.route = 'receipt';
}

const Till = { components: { Icon, Tile, Av, Pill, Btn, Stepper, Sheet, FooterBar, Toggle },
  setup() {
    const shown = computed(() => PRODUCTS.filter(p => p.name.toLowerCase().includes(S.tillQ.trim().toLowerCase())));
    const c = computed(() => cust(S.customer));
    const lines = computed(() => S.cart.map(l => ({ p: prod(l.id), q: l.q })));
    const picks = computed(() => CUSTOMERS.filter(x => (x.name + x.phone).toLowerCase().includes(S.custQ.trim().toLowerCase())));
    const pickCustomer = (id) => { S.customer = id; if (cust(id).walkin) { S.pay = 'cash'; S.part = false; } S.sheet = null; S.cartOpen = true; };
    const canPay = computed(() => ME.value.role === 'Owner');
    return { S, ME, shown, c, lines, picks, pickCustomer, canPay, cartTotal, cartUnits, payNow, owesAfter, overLimit, canCharge, charge, qtyOf, addP, subP, level, perText, stockText, money, num, cust, go, back, toast, tint };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col">
    <header class="flex shrink-0 items-center gap-2 border-b bg-background px-2" :style="{ paddingTop: 'var(--sa-top)', height: 'calc(56px + var(--sa-top))' }">
      <button type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Leave the till (the cart is kept)" @click="back()"><Icon name="X" :size="22"/></button>
      <div class="min-w-0 flex-1 px-1"><h1 class="text-base font-semibold leading-tight">Till</h1><p class="truncate text-xs leading-tight text-muted-foreground">Office Shop · {{ ME.name }}</p></div>
      <button type="button" class="press flex h-9 max-w-[170px] items-center gap-2 rounded-full border bg-muted/50 py-1 pl-1.5 pr-3" aria-label="Choose the customer" @click="S.sheet = 'cust'"><Av :c="c" :size="36"/><span class="truncate text-sm font-medium">{{ c.walkin ? 'Walk-in' : c.name.split(' ')[0] }}</span><Icon name="ChevronDown" :size="14" class="shrink-0 text-muted-foreground"/></button></header>

    <div class="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2.5"><label class="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md border bg-muted/50 px-3.5"><Icon name="Search" :size="18" class="text-muted-foreground"/>
      <input v-model="S.tillQ" type="search" placeholder="Find a product" aria-label="Find a product" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"></label>
      <button type="button" class="press grid h-9 w-11 shrink-0 place-items-center rounded-md border bg-muted/50" aria-label="Scan a barcode" @click="toast('Scan opens the camera, and you can type the code')"><Icon name="ScanBarcode" :size="22"/></button></div>

    <div class="scroll min-h-0 flex-1 overflow-y-auto p-3"><div class="grid grid-cols-2 gap-3">
      <div v-for="p in shown" :key="p.id" :class="['relative overflow-hidden rounded-xl border bg-card', p.stock <= 0 ? 'opacity-55' : '', qtyOf(p.id) ? 'ring-2 ring-primary' : '']">
        <div class="h-1" :style="{ background: p.c }"></div>
        <button type="button" class="press block w-full p-3.5 text-left" :disabled="p.stock <= 0" :aria-label="'Add ' + p.name" @click="addP(p)">
          <span class="flex items-start justify-between"><Tile :p="p" :size="36"/><span v-if="qtyOf(p.id)" class="grid h-7 min-w-7 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tnum">{{ qtyOf(p.id) }}</span></span>
          <span class="mt-2.5 block truncate text-sm font-semibold">{{ p.name }}</span>
          <span class="block text-base font-bold tnum">{{ perText(p) }}</span>
          <span :class="['mt-0.5 block text-xs', level(p) === 'ok' ? 'text-muted-foreground' : level(p) === 'low' ? 'font-medium text-warning' : 'font-medium text-destructive']">{{ stockText(p) }}</span></button>
        <div v-if="qtyOf(p.id)" class="border-t p-2"><Stepper full size="sm" :q="qtyOf(p.id)" :step="p.step" :max="p.stock" @sub="subP(p)" @add="addP(p)"/></div></div></div>
      <p v-if="!shown.length" class="py-12 text-center text-sm text-muted-foreground">No product matches "{{ S.tillQ }}"</p></div>

    <FooterBar><button v-if="cartUnits" type="button" class="press flex w-full py-2.5 items-center gap-3 rounded-xl bg-primary px-4 text-primary-foreground" @click="S.cartOpen = true">
        <span class="relative grid h-9 w-9 place-items-center rounded-full bg-white/20"><Icon name="ShoppingCart" :size="19"/><span class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-primary">{{ S.cart.length }}</span></span>
        <span class="min-w-0 flex-1 text-left"><span class="block truncate text-sm font-medium opacity-90">{{ c.walkin ? 'Walk-in customer' : c.name }}</span></span><span class="text-base font-bold tnum">{{ money(cartTotal) }}</span><Icon name="ChevronUp" :size="20"/></button>
      <p v-else class="grid h-9 place-items-center rounded-xl bg-muted text-sm text-muted-foreground">Tap a product to start a sale</p></FooterBar>

    <Sheet :open="S.cartOpen && !S.sheet" tall title="Cart" :sub="(c.walkin ? 'Walk-in customer' : c.name) + ' · ' + cartUnits + ' items'" @close="S.cartOpen = false">
      <div class="px-4 pb-4">
        <button type="button" class="press mb-3 flex w-full py-2.5 items-center gap-3 rounded-xl border bg-muted/40 px-3 text-left" @click="S.sheet = 'cust'"><Av :c="c" :size="36"/>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ c.walkin ? 'Walk-in customer' : c.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ c.walkin ? 'Pays now, no account' : (c.owes > 0 ? 'Owes ' + money(c.owes) : 'Settled') + ' · limit ' + money(c.limit) }}</span></span><span class="text-sm font-semibold text-primary">Change</span></button>
        <div class="divide-y rounded-xl border bg-card"><div v-for="l in lines" :key="l.p.id" class="flex items-center gap-3 p-3"><Tile :p="l.p" :size="36"/>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ l.p.name }}</p><p class="text-xs text-muted-foreground tnum">{{ perText(l.p) }} · oldest batch first</p></div>
          <div class="flex flex-col items-end gap-1.5"><span class="text-sm font-semibold tnum">{{ money(l.p.price * l.q) }}</span><Stepper size="sm" :q="l.q" :step="l.p.step" :max="l.p.stock" @sub="subP(l.p)" @add="addP(l.p)"/></div></div></div>

        <p class="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">How is it paid</p>
        <div class="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"><button v-for="m in [['cash','Cash now'],['credit','On credit']]" :key="m[0]" type="button" :class="['press h-9 rounded-md text-sm font-semibold', S.pay === m[0] ? 'bg-background shadow-sm' : 'text-muted-foreground']" @click="S.pay = m[0]; if (m[0] === 'cash') S.part = false">{{ m[1] }}</button></div>
        <p v-if="S.pay === 'credit' && c.walkin" class="mt-3 flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm text-warning"><Icon name="Info" :size="18" class="mt-0.5"/><span>Walk-in customers pay now. Choose a customer to sell on credit.</span></p>
        <template v-if="S.pay === 'credit' && !c.walkin">
          <p v-if="overLimit" class="mt-3 flex items-start gap-2 rounded-md bg-warning/10 p-3 text-sm text-warning"><Icon name="TriangleAlert" :size="18" class="mt-0.5"/><span>{{ c.name.split(' ')[0] }} would owe {{ money(owesAfter) }}, over the limit of {{ money(c.limit) }}. You can still go on.</span></p>
          <div class="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"><span class="text-sm font-medium">Pays part now</span><Toggle :model-value="S.part" label="Pays part now" @update:model-value="S.part = $event"/></div>
          <label v-if="S.part" class="mt-2 flex py-2.5 items-center gap-2 rounded-xl border px-4"><span class="text-sm text-muted-foreground">TZS</span><input v-model.number="S.partAmt" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Amount paid now" placeholder="0" class="min-w-0 flex-1 bg-transparent text-right text-xl font-semibold tnum outline-none"></label></template>

        <div class="mt-4 flex py-2.5 items-center gap-3 rounded-xl border px-4"><Icon name="Landmark" :size="20" class="text-muted-foreground"/><span class="flex-1"><span class="block text-xs text-muted-foreground">Paid into</span><span class="block text-sm font-medium">{{ S.account }}</span></span>
          <Pill v-if="!canPay" tone="muted"><Icon name="Lock" :size="12"/>Drawer</Pill><button v-else type="button" class="press text-sm font-semibold text-primary" @click="S.sheet = 'acct'">Change</button></div>

        <div class="mt-4 space-y-1.5 rounded-xl bg-muted/50 p-4 tnum"><div class="flex justify-between text-sm text-muted-foreground"><span>{{ S.cart.length }} {{ S.cart.length === 1 ? 'line' : 'lines' }} · {{ cartUnits }} {{ cartUnits === 1 ? 'item' : 'items' }}</span><span>{{ money(cartTotal) }}</span></div>
          <div v-if="S.pay === 'credit'" class="flex justify-between text-sm"><span class="text-muted-foreground">Paid now</span><span class="font-medium">{{ money(payNow) }}</span></div>
          <div class="flex items-baseline justify-between pt-1"><span class="text-sm font-semibold">{{ S.pay === 'credit' ? 'Goes on credit' : 'Total' }}</span><span class="text-2xl font-bold">{{ money(cartTotal - payNow || cartTotal) }}</span></div></div></div>
      <template #footer><Btn full :disabled="!canCharge" @click="charge()">{{ S.pay === 'cash' ? 'Charge ' + money(cartTotal) : 'Sell on credit' }}</Btn></template></Sheet>

    <Sheet :open="S.sheet === 'cust'" title="Who is buying?" @close="S.sheet = null">
      <div class="px-4 pb-4"><label class="flex h-9 items-center gap-2.5 rounded-md border bg-muted/50 px-3.5"><Icon name="Search" :size="18" class="text-muted-foreground"/><input v-model="S.custQ" type="search" placeholder="Name or phone" aria-label="Find a customer" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"></label>
        <button type="button" class="press mt-2 flex w-full py-2.5 items-center gap-3 text-left text-primary" @click="toast('New customer: name and phone, then back here')"><span class="grid h-9 w-9 place-items-center rounded-full bg-primary/10"><Icon name="UserPlus" :size="19"/></span><span class="text-sm font-semibold">Add a new customer</span></button>
        <button v-for="x in picks" :key="x.id" type="button" :class="['press flex w-full py-2 items-center gap-3 rounded-md px-1 text-left', S.customer === x.id ? 'bg-primary/10' : '']" @click="pickCustomer(x.id)"><Av :c="x" :size="36"/>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ x.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ x.walkin ? 'Pays now' : (x.phone || 'No phone') }}</span></span>
          <span v-if="S.customer === x.id" class="mr-1 text-primary"><Icon name="Check" :size="20"/></span><span v-else-if="x.owes > 0" class="mr-1 text-xs font-medium text-warning tnum">Owes {{ num(x.owes) }}</span></button></div></Sheet>

    <Sheet :open="S.sheet === 'acct'" title="Paid into" @close="S.sheet = null"><div class="px-4 pb-4"><button v-for="a in [['Cash drawer','Banknote'],['Lipa Namba','Smartphone'],['M-Pesa wallet','Wallet'],['CRDB bank','Landmark']]" :key="a[0]" type="button" class="press flex w-full py-2.5 items-center gap-3 text-left" @click="S.account = a[0]; S.sheet = null">
      <span class="grid h-9 w-9 place-items-center rounded-md bg-muted"><Icon :name="a[1]" :size="19"/></span><span class="flex-1 text-sm font-medium">{{ a[0] }}</span><Icon v-if="S.account === a[0]" name="Check" :size="20" class="text-primary"/></button></div></Sheet>
  </div>` };

/* the sale is done: print it, share it, or start the next one */
const Receipt = { components: { Icon, Btn, Pill, FooterBar },
  setup() { const s = computed(() => S.receipt || SALES[0]); const c = computed(() => cust(s.value.c));
    const left = computed(() => saleTotal(s.value) - (s.value.paid != null ? s.value.paid : (s.value.pay === 'paid' ? saleTotal(s.value) : 0)));
    return { S, s, c, left, saleTotal, prod, money, back, go, tab, toast }; },
  template: `<div class="flex min-h-0 flex-1 flex-col"><div class="scroll min-h-0 flex-1 overflow-y-auto px-5" :style="{ paddingTop: 'calc(40px + var(--sa-top))' }">
      <div class="flex flex-col items-center text-center"><span class="rise grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success"><Icon name="Check" :size="40"/></span>
        <h1 class="mt-4 text-2xl font-bold">Sale done</h1><p class="text-sm text-muted-foreground">{{ s.id }} · {{ c.walkin ? 'Walk-in customer' : c.name }}</p>
        <p class="mt-3 text-3xl font-bold tracking-tight tnum">{{ money(saleTotal(s)) }}</p><Pill :tone="left > 0 ? 'warning' : 'success'">{{ left > 0 ? money(left) + ' goes on credit' : 'Paid · ' + s.method }}</Pill></div>
      <div class="mt-6 divide-y rounded-xl border bg-card"><div v-for="l in s.lines" :key="l[0]" class="flex items-center justify-between px-4 py-3"><span class="text-sm">{{ prod(l[0]).name }} <span class="text-muted-foreground">× {{ l[1] }}</span></span><span class="text-sm font-medium tnum">{{ money(prod(l[0]).price * l[1]) }}</span></div></div>
      <button type="button" class="press mt-3 flex w-full py-2.5 items-center gap-3 rounded-xl border bg-muted/40 px-4 text-left" @click="toast('Receipt sent to RPP02N')"><Icon name="Printer" :size="20"/><span class="flex-1"><span class="block text-sm font-semibold">Print receipt</span><span class="block text-xs text-success">RPP02N · connected</span></span><Icon name="ChevronRight" :size="18" class="text-muted-foreground"/></button>
      <button type="button" class="press mt-2 flex w-full py-2.5 items-center gap-3 rounded-xl border bg-muted/40 px-4 text-left" @click="S.sheet = 'share'"><Icon name="Share2" :size="20"/><span class="flex-1 text-sm font-semibold">Share the receipt</span><Icon name="ChevronRight" :size="18" class="text-muted-foreground"/></button><div class="h-4"></div></div>
    <FooterBar><div class="grid grid-cols-2 gap-2"><Btn v="outline" @click="tab('home')">Done</Btn><Btn @click="S.route = 'till'">New sale</Btn></div></FooterBar></div>` };
