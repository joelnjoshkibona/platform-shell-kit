/* ============================================================ Home */
const Section = { props: { title: String, link: String }, components: { Icon },
  template: `<div class="mb-2 mt-6 flex items-center justify-between px-1"><h2 class="text-base font-semibold">{{ title }}</h2><button v-if="link" type="button" class="press -mr-2 flex h-8 items-center gap-0.5 rounded-lg px-2 text-sm font-medium text-primary" @click="$emit('link')">{{ link }}<Icon name="ChevronRight" :size="16"/></button></div>` };

const Kpi = { props: { label: String, icon: String, tone: { type: String, default: 'primary' }, value: String, hint: String }, components: { Icon },
  template: `<div class="rise rounded-xl border bg-card p-4"><div class="flex items-start justify-between"><p class="text-xs text-muted-foreground">{{ label }}</p>
    <span :class="['grid h-8 w-8 place-items-center rounded-lg', { primary: 'bg-primary/10 text-primary', warning: 'bg-warning/15 text-warning', success: 'bg-success/15 text-success' }[tone]]"><Icon :name="icon" :size="16"/></span></div>
    <p class="mt-2 text-2xl font-bold leading-tight tracking-tight tnum">{{ value }}</p><p class="mt-0.5 truncate text-xs text-muted-foreground">{{ hint }}</p></div>` };

const Home = { components: { Header, Icon, Section, Kpi, Av, Tile, Pill, AgeChip, LevelBadge, Balance, SyncLine },
  setup() {
    const owner = computed(() => S.role === 'owner');
    const hour = 'Good afternoon';
    const owing = computed(() => CUSTOMERS.filter(c => c.owes > 0).sort((a, b) => b.owes - a.owes).slice(0, 3));
    const low = computed(() => PRODUCTS.filter(p => level(p) !== 'ok'));
    const actions = computed(() => owner.value
      ? [['Sell', 'Open the till', 'ShoppingCart', () => go('till')], ['Receive stock', 'A new batch came in', 'PackagePlus', () => go('receive')], ['Take payment', 'Pays the oldest first', 'Wallet', () => tab('customers')], ['Close the day', 'Count stock and cash', 'ClipboardCheck', () => tab('count')]]
      : [['Sell', 'Open the till', 'ShoppingCart', () => go('till')], ['Take payment', 'Pays the oldest first', 'Wallet', () => tab('customers')], ['Add expense', 'Waits for Amina', 'Coins', () => tab('expenses')], ['Count stock', 'End of the day', 'ClipboardCheck', () => tab('count')]]);
    return { S, ME, owner, hour, owing, low, actions, waitingN, WAITING, SALES, cust, saleTotal, saleLine, money, go, tab, tint };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Home"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <p class="text-xs text-muted-foreground">Office Shop · Tue 13 Oct 2026</p>
      <h2 class="text-xl font-bold leading-tight tracking-tight">{{ hour }}, {{ ME.name }}</h2>
      <SyncLine/>

      <button v-if="owner && waitingN" type="button" class="press rise mt-4 flex w-full items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-left" @click="go('waiting')">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-warning/20 text-warning"><Icon name="Hourglass" :size="22"/></span>
        <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ waitingN }} things wait for you</span><span class="block truncate text-xs text-muted-foreground">{{ WAITING[0].title }}</span></span><Icon name="ChevronRight" :size="20" class="text-muted-foreground"/></button>
      <div v-else-if="!owner" class="rise mt-4 flex items-center gap-3 rounded-xl border bg-card p-4"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted"><Icon name="Hourglass" :size="22" class="text-muted-foreground"/></span>
        <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">2 requests wait for Amina</span><span class="block truncate text-xs text-muted-foreground">Undo S-1290 · Expense EXP-0035</span></span></div>

      <div class="mt-4 grid grid-cols-2 gap-3"><button v-for="a in actions" :key="a[0]" type="button" class="press rise flex min-h-[80px] flex-col items-start justify-between rounded-xl border bg-card p-4 text-left" @click="a[3]()">
        <span class="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground"><Icon :name="a[2]" :size="20"/></span>
        <span><span class="block text-sm font-semibold leading-tight">{{ a[0] }}</span><span class="block text-xs text-muted-foreground">{{ a[1] }}</span></span></button></div>

      <div class="mt-3 grid grid-cols-2 gap-3">
        <Kpi label="Sales today" icon="ShoppingCart" value="TZS 8,500" hint="9 sales · 13 units"/>
        <Kpi label="Owed to you" icon="HandCoins" tone="warning" value="TZS 75,000" hint="by 27 customers"/>
        <Kpi v-if="owner" label="Stock value" icon="Package" value="TZS 80,480" hint="what you paid for it"/>
        <Kpi label="Low or out" icon="TriangleAlert" tone="warning" value="1" hint="Trident"/></div>

      <Section title="Who owes the most" link="All customers" @link="tab('customers')"/>
      <div class="overflow-hidden rounded-xl border bg-card"><button v-for="(c, i) in owing" :key="c.id" type="button" :class="['press flex w-full py-2.5 items-center gap-3 px-4 text-left', i ? 'border-t' : '']" @click="go('customer', c.id)">
        <Av :c="c" :size="36"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ c.name }}</span><AgeChip :days="c.days"/></span><Balance :b="c.owes"/></button></div>

      <Section title="Needs restocking" link="Products" @link="tab('products')"/>
      <div v-for="p in low" :key="p.id" class="flex items-center gap-3 rounded-xl border bg-card p-4"><Tile :p="p" :size="36"/>
        <span class="min-w-0 flex-1"><span class="flex items-center gap-2"><span class="truncate text-sm font-medium">{{ p.name }}</span><LevelBadge :p="p"/></span><span class="block truncate text-xs text-muted-foreground">{{ p.stock }} {{ p.units }} left · warn at {{ p.reorder }}</span></span>
        <button type="button" class="press h-9 shrink-0 rounded-md border px-3.5 text-sm font-semibold" @click="go('receive')">Receive</button></div>

      <Section title="Latest sales" link="All sales" @link="tab('sales')"/>
      <div class="overflow-hidden rounded-xl border bg-card"><button v-for="(s, i) in SALES.slice(0, 4)" :key="s.id" type="button" :class="['press flex w-full py-2 items-center gap-3 px-4 text-left', i ? 'border-t' : '']" @click="go('sale', s.id)">
        <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ cust(s.c).name }}</span><span class="block truncate text-xs text-muted-foreground">{{ s.id }} · {{ s.time }} · {{ saleLine(s.lines[0]) }}</span></span>
        <span class="text-sm font-semibold tnum">{{ money(saleTotal(s)) }}</span></button></div>
    </div></div>` };

/* what waits for the owner: each card is decided on the spot */
const Waiting = { components: { Header, Icon, Pill, Btn, Empty },
  setup() { const items = computed(() => WAITING.filter(w => !S.waitingDone.includes(w.id)));
    const decide = (w, yes) => { S.waitingDone.push(w.id); toast(yes ? 'Approved: ' + w.title.split(' · ')[0] : 'Declined: ' + w.title.split(' · ')[0]); };
    return { items, decide, S }; },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Waiting for you" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <Empty v-if="!items.length" icon="CircleCheck" title="Nothing is waiting" text="Rehema's requests show up here the moment she sends them."/>
      <div v-for="w in items" :key="w.id" class="rise mb-3 rounded-xl border bg-card p-4">
        <div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-warning/15 text-warning"><Icon :name="w.icon" :size="20"/></span>
          <div class="min-w-0 flex-1"><Pill tone="warning">{{ w.kind }}</Pill><p class="mt-1.5 text-sm font-semibold leading-snug">{{ w.title }}</p><p class="mt-0.5 text-sm text-muted-foreground">{{ w.sub }}</p></div></div>
        <div class="mt-4 grid grid-cols-2 gap-2"><Btn v="outline" size="md" @click="decide(w, false)">Decline</Btn><Btn size="md" @click="decide(w, true)">Approve</Btn></div></div></div></div>` };
