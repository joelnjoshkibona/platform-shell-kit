/* ============================================================ Customers */
const CustomersList = { components: { Header, Icon, Av, Pill, Seg, Empty, AgeChip, Balance },
  setup() {
    const real = CUSTOMERS.filter(c => !c.walkin);
    const tabs = computed(() => [{ id: 'all', label: 'All', count: real.length }, { id: 'owe', label: 'Owing', count: real.filter(c => c.owes > 0).length }, { id: 'ok', label: 'Settled' }]);
    const rows = computed(() => real.filter(c => (S.custTab === 'all' || (S.custTab === 'owe' ? c.owes > 0 : c.owes <= 0)) && (c.name + c.phone + c.no).toLowerCase().includes(S.custQ.trim().toLowerCase())).sort((a, b) => b.owes - a.owes || a.name.localeCompare(b.name)));
    const owedAll = real.reduce((t, c) => t + Math.max(0, c.owes), 0);
    return { S, tabs, rows, owedAll, money, go, toast };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header title="Customers"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="sticky top-0 z-10 space-y-2.5 border-b bg-background px-3 py-2.5">
        <label class="flex h-9 items-center gap-2.5 rounded-md border bg-muted/50 px-3.5"><Icon name="Search" :size="18" class="text-muted-foreground"/><input v-model="S.custQ" type="search" placeholder="Name, phone or customer no." aria-label="Find a customer" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"></label>
        <Seg v-model="S.custTab" :tabs="tabs"/></div>
      <div class="px-3 pb-24 pt-3">
        <div class="mb-3 flex items-center justify-between rounded-xl bg-warning/10 px-4 py-3"><span class="text-sm text-muted-foreground">Owed to you</span><b class="text-base text-warning tnum">{{ money(owedAll) }}</b></div>
        <Empty v-if="!rows.length" icon="Users" title="No customers found" text="Try a different name or number."/>
        <div v-else class="overflow-hidden rounded-xl border bg-card"><button v-for="(c, i) in rows" :key="c.id" type="button" :class="['press flex w-full items-center gap-3 px-3.5 py-3 text-left', i ? 'border-t' : '']" @click="go('customer', c.id)">
          <Av :c="c" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ c.name }}</span><span class="mt-0.5 flex items-center gap-1.5"><AgeChip v-if="c.owes > 0" :days="c.days"/><span v-else class="truncate text-xs text-muted-foreground">{{ c.phone || 'No phone' }}</span></span></span><Balance :b="c.owes"/></button></div></div></div>
    <button type="button" class="press absolute right-4 z-30 grid h-9 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg" :style="{ bottom: '16px' }" aria-label="New customer" @click="toast('New customer: name and phone')"><Icon name="UserPlus" :size="23"/></button></div>` };

const Customer = { components: { Header, Icon, Av, Pill, Btn, Seg, Card, Row, AgeChip, SaleStatus, Sheet, FooterBar },
  setup() {
    const c = computed(() => cust(S.cid));
    const sales = computed(() => SALES.filter(s => s.c === S.cid));
    const unpaid = computed(() => sales.value.filter(s => s.pay === 'unpaid' || s.pay === 'part'));
    const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'sales', label: 'Sales' }, { id: 'payments', label: 'Payments' }];
    const amt = ref(0); const method = ref('Cash');
    watch(() => S.sheet, (v) => { if (v === 'cpay') { amt.value = Math.max(0, c.value.owes); method.value = 'Cash'; } });
    const record = () => { const a = Math.min(+amt.value || 0, 1e9); if (!a) return; c.value.owes -= a; c.value.paid = (c.value.paid || 0) + a; S.sheet = null; newPayment(c.value.id, a, 'Cash', []); };
    const pays = computed(() => [['P-0052', '19 Sept, 17:22', 3000, 'Cash drawer'], ['P-0030', '11 Sept, 10:59', 1000, 'Cash drawer']]);
    const limitPct = computed(() => c.value.limit ? Math.min(100, Math.max(0, c.value.owes) / c.value.limit * 100) : 0);
    return { S, c, sales, unpaid, tabs, amt, method, record, pays, limitPct, saleTotal, itemsText, paidOf, money, go, toast };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="c.name" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-3 p-3 pb-6">
      <section class="rise rounded-xl border bg-card p-4"><div class="flex items-center gap-3.5"><Av :c="c" :size="44"/><div class="min-w-0"><h2 class="truncate text-xl font-semibold leading-tight tracking-tight">{{ c.name }}</h2><p class="font-mono text-xs text-muted-foreground">{{ c.no }}</p>
          <button v-if="c.phone" type="button" class="press -ml-1 flex h-9 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-primary" @click="S.callTo = c; S.sheet = 'call'"><Icon name="Phone" :size="15"/>{{ c.phone }}</button><p v-else class="text-sm text-muted-foreground">No phone number</p></div></div>
        <div class="mt-4 grid grid-cols-2 gap-3"><div class="rounded-md bg-muted/60 p-3"><p class="text-xs text-muted-foreground">{{ c.owes < 0 ? 'Prepaid' : 'Owes you' }}</p><p :class="['text-xl font-bold tnum', c.owes > 0 ? 'text-warning' : c.owes < 0 ? 'text-success' : '']">{{ money(Math.abs(c.owes)) }}</p><p class="text-xs text-muted-foreground">{{ c.owes > 0 ? 'oldest unpaid ' + c.days + ' days' : 'nothing to collect' }}</p></div>
          <div class="rounded-md bg-muted/60 p-3"><p class="text-xs text-muted-foreground">Bought</p><p class="text-xl font-bold tnum">{{ money(c.bought) }}</p><p class="text-xs text-muted-foreground">since {{ c.since }}</p></div></div></section>
      <Seg v-model="S.custPane" :tabs="tabs"/>
      <template v-if="S.custPane === 'overview'">
        <Card v-if="unpaid.length" title="Unpaid sales" icon="HandCoins"><p class="pb-1 text-xs text-muted-foreground">Oldest first. The next payment pays the top one first.</p>
          <div v-for="(s, i) in unpaid" :key="s.id" class="mb-2 flex items-center gap-3 rounded-md border p-3"><span class="min-w-0 flex-1"><span class="flex flex-wrap items-center gap-1.5"><span class="font-mono text-xs font-medium">{{ s.id }}</span><Pill v-if="i === 0" tone="primary">Paid next</Pill><SaleStatus :s="s.pay"/></span><span class="mt-1 block text-xs text-muted-foreground">{{ s.day }} · {{ itemsText(s) }}</span></span><span class="text-sm font-semibold tnum">{{ money(saleTotal(s) - paidOf(s)) }}</span></div></Card>
        <Card title="Credit" icon="Gauge"><div class="py-3"><div class="flex items-baseline justify-between"><span class="text-sm text-muted-foreground">Limit {{ money(c.limit) }}</span><b class="text-sm tnum">{{ money(Math.max(0, c.limit - Math.max(0, c.owes))) }} left</b></div>
          <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"><div :class="['h-full rounded-full', limitPct > 85 ? 'bg-destructive' : limitPct > 60 ? 'bg-warning' : 'bg-primary']" :style="{ width: limitPct + '%' }"></div></div></div></Card>
        <Card title="Contact" icon="Contact"><Row k="Phone" :v="c.phone || '—'"/><Row k="Customer no." :v="c.no" mono/><Row k="Customer since" :v="c.since"/><Row k="Last payment" :v="c.last || '—'"/></Card></template>
      <template v-else-if="S.custPane === 'sales'"><div v-if="sales.length" class="overflow-hidden rounded-xl border bg-card"><button v-for="(s, i) in sales" :key="s.id" type="button" :class="['press flex w-full items-center gap-3 px-4 py-3 text-left', i ? 'border-t' : '']" @click="go('sale', s.id)"><span class="min-w-0 flex-1"><span class="block font-mono text-xs font-medium">{{ s.id }}</span><span class="block truncate text-xs text-muted-foreground">{{ s.day }}, {{ s.time }} · {{ itemsText(s) }}</span></span><span class="flex flex-col items-end gap-1"><span class="text-sm font-semibold tnum">{{ money(saleTotal(s)) }}</span><SaleStatus :s="s.pay"/></span></button></div>
        <p v-else class="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">No sales yet.</p></template>
      <template v-else><div class="overflow-hidden rounded-xl border bg-card"><div v-for="(p, i) in pays" :key="p[0]" :class="['flex items-center gap-3 px-4 py-3', i ? 'border-t' : '']"><span class="grid h-9 w-9 place-items-center rounded-md bg-success/15 text-success"><Icon name="Wallet" :size="18"/></span><span class="min-w-0 flex-1"><span class="block font-mono text-xs font-medium">{{ p[0] }}</span><span class="block truncate text-xs text-muted-foreground">{{ p[1] }} · {{ p[3] }}</span></span><span class="text-sm font-semibold text-success tnum">{{ money(p[2]) }}</span></div></div></template>
    </div></div>
    <FooterBar><div class="grid grid-cols-[1fr_auto] gap-2"><Btn :disabled="c.owes <= 0" @click="S.sheet = 'cpay'"><Icon name="Wallet" :size="18"/>Take payment</Btn><Btn v="outline" :disabled="!c.phone" @click="S.callTo = c; S.sheet = 'call'" aria-label="Call or message"><Icon name="Phone" :size="18"/></Btn></div></FooterBar>
    <Sheet :open="S.sheet === 'cpay'" title="Take payment" :sub="c.name + ' owes ' + money(c.owes)" @close="S.sheet = null"><div class="px-5 pb-4">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</p><label class="mt-2 flex h-16 items-center gap-2 rounded-xl border-2 border-primary px-4"><span class="text-sm text-muted-foreground">TZS</span><input v-model.number="amt" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Amount" class="min-w-0 flex-1 bg-transparent text-right text-2xl font-bold tnum outline-none"></label>
      <p class="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Icon name="Info" :size="14"/>It pays the oldest unpaid sale first.</p>
      <p class="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Paid with</p><div class="flex flex-wrap gap-2"><button v-for="m in ['Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank']" :key="m" type="button" @click="method = m" :class="['press h-9 rounded-md px-4 text-sm font-medium', method === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">{{ m }}</button></div></div>
      <template #footer><Btn full :disabled="!amt" @click="record">Record {{ money(amt || 0) }}</Btn></template></Sheet></div>` };
