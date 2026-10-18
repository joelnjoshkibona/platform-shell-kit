/* ============================================================ small pieces */
const TONE = { success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', destructive: 'bg-destructive/10 text-destructive', muted: 'bg-muted text-muted-foreground', primary: 'bg-primary/10 text-primary' };
const Pill = { props: { tone: { type: String, default: 'muted' }, dot: Boolean, round: Boolean }, setup() { return { TONE }; },
  template: `<span :class="['inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium', round ? 'rounded-full px-2' : 'rounded-md', TONE[tone]]"><span v-if="dot" class="h-1.5 w-1.5 rounded-full bg-current"></span><slot/></span>` };

const Av = { props: { c: Object, size: { type: Number, default: 40 } }, components: { Icon },
  template: `<span class="grid shrink-0 place-items-center rounded-full font-semibold text-white" :style="{ width: size + 'px', height: size + 'px', background: c.c, fontSize: Math.round(size * .36) + 'px' }"><Icon v-if="c.walkin" name="User" :size="Math.round(size * .5)"/><template v-else>{{ c.ini }}</template></span>` };

const Tile = { props: { p: Object, size: { type: Number, default: 40 } },
  template: `<span class="grid shrink-0 place-items-center rounded-md text-xs font-semibold" :style="{ width: size + 'px', height: size + 'px', background: 'color-mix(in srgb, ' + p.c + ' 16%, transparent)', color: p.c }">{{ p.ini }}</span>` };

const AgeChip = { props: { days: Number }, components: { Pill },
  template: `<Pill v-if="days > 0" round :tone="days > 30 ? 'destructive' : days > 7 ? 'warning' : 'muted'">{{ days > 7 ? days + ' days' : 'This week' }}</Pill>` };
const SaleStatus = { props: { s: String }, components: { Pill },
  template: `<Pill :tone="s === 'paid' ? 'success' : s === 'part' ? 'warning' : s === 'undone' ? 'muted' : 'destructive'">{{ { paid: 'Paid', part: 'Part paid', unpaid: 'Unpaid', undone: 'Undone' }[s] }}</Pill>` };
const LevelBadge = { props: { p: Object }, components: { Pill },
  setup(pr) { return { lv: computed(() => level(pr.p)) }; },
  template: `<Pill :tone="lv === 'out' ? 'destructive' : lv === 'low' ? 'warning' : 'success'" dot>{{ lv === 'out' ? 'Out' : lv === 'low' ? 'Low' : 'In stock' }}</Pill>` };
const Balance = { props: { b: Number, big: Boolean }, setup() { return { money }; },
  template: `<div class="text-right leading-tight"><p :class="['font-semibold tnum', big ? 'text-2xl' : 'text-sm']">{{ b === 0 ? 'Settled' : money(Math.abs(b)) }}</p>
    <p :class="['text-xs', b > 0 ? 'text-warning' : b < 0 ? 'text-success' : 'text-muted-foreground']">{{ b > 0 ? 'Owes you' : b < 0 ? 'Prepaid' : '' }}</p></div>` };

const Seg = { props: { modelValue: String, tabs: Array },
  template: `<div class="grid gap-1 rounded-lg bg-muted p-1" :style="{ gridTemplateColumns: 'repeat(' + tabs.length + ', minmax(0, 1fr))' }" role="tablist">
    <button v-for="t in tabs" :key="t.id" type="button" role="tab" :aria-selected="modelValue === t.id" @click="$emit('update:modelValue', t.id)" :class="['press flex h-7 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium', modelValue === t.id ? 'bg-background shadow' : 'text-muted-foreground']">
      <span class="truncate">{{ t.label }}</span><span v-if="t.count" :class="['grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold', modelValue === t.id ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground']">{{ t.count }}</span></button></div>` };

const Empty = { props: { icon: { type: String, default: 'Inbox' }, title: String, text: String }, components: { Icon },
  template: `<div class="flex flex-col items-center px-8 py-14 text-center"><span class="grid h-16 w-16 place-items-center rounded-full bg-muted"><Icon :name="icon" :size="28" class="text-muted-foreground"/></span>
    <p class="mt-4 text-base font-semibold">{{ title }}</p><p v-if="text" class="mt-1 text-sm text-muted-foreground">{{ text }}</p><slot/></div>` };

const Btn = { props: { v: { type: String, default: 'primary' }, size: { type: String, default: 'lg' }, disabled: Boolean, full: Boolean },
  setup(p) { const cls = computed(() => [{ primary: 'bg-primary text-primary-foreground shadow-sm', outline: 'border border-input bg-background shadow-sm', ghost: '', destructive: 'bg-destructive text-white shadow-sm', 'destructive-outline': 'border border-destructive/40 text-destructive bg-background', soft: 'bg-primary/10 text-primary' }[p.v], p.size === 'lg' ? 'h-9 px-4 text-sm' : 'h-8 px-3 text-xs', p.full ? 'w-full' : '', p.disabled ? 'opacity-50 pointer-events-none' : '']); return { cls }; },
  template: `<button type="button" :disabled="disabled" :class="['press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium', cls]"><slot/></button>` };

const Toggle = { props: { modelValue: Boolean, label: String, locked: Boolean },
  template: `<button type="button" role="switch" :aria-checked="modelValue" :aria-label="label" :disabled="locked" :class="['relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors', modelValue ? 'bg-primary' : 'bg-input', locked ? 'opacity-50' : '']" @click.stop="$emit('update:modelValue', !modelValue)"><span :class="['block h-4 w-4 rounded-full bg-background shadow transition-transform', modelValue ? 'translate-x-4' : '']"></span></button>` };


/* ============================================================ the shell: header, bottom bar, drawer */
const Header = { props: { title: String, pushed: Boolean, hideSearch: Boolean }, components: { Icon },
  setup() { return { S, back, go, ME }; },
  template: `<header class="relative z-20 flex shrink-0 items-center gap-1 border-b bg-background px-2" :style="{ paddingTop: 'var(--sa-top)', height: 'calc(56px + var(--sa-top))' }">
    <button v-if="!pushed" type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Open menu" @click="S.drawer = true"><Icon name="Menu" :size="22"/></button>
    <button v-else type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Back" @click="back()"><Icon name="ChevronLeft" :size="24"/></button>
    <h1 class="min-w-0 flex-1 truncate px-1 text-base font-semibold tracking-tight">{{ title }}</h1>
    <slot name="right"/>
    <button v-if="!hideSearch" type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Search" @click="S.search = true"><Icon name="Search" :size="21"/></button>
    <button type="button" class="press ml-0.5 mr-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-label="Your profile" @click="go('profile')">{{ ME.ini }}</button></header>` };

const TabBar = { components: { Icon },
  setup() { const items = [['home', 'Home', 'House'], ['sales', 'Sales', 'Receipt'], ['sell', 'Sell', 'ShoppingCart'], ['customers', 'Customers', 'Users'], ['alerts', 'Alerts', 'Bell']];
    return { S, items, unread, tab, go }; },
  template: `<nav class="relative z-20 flex shrink-0 items-end border-t bg-background px-1" :style="{ paddingBottom: 'var(--sa-bottom)', height: 'calc(56px + var(--sa-bottom))' }" aria-label="Main">
    <template v-for="it in items" :key="it[0]">
      <button v-if="it[0] === 'sell'" type="button" class="press relative flex flex-1 flex-col items-center pb-1.5" aria-label="Sell: open the till" @click="go('till')">
        <span class="-mt-4 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background"><Icon name="ShoppingCart" :size="22"/></span>
        <span class="mt-1 text-[11px] font-medium text-primary">Sell</span></button>
      <button v-else type="button" class="press flex h-14 flex-1 flex-col items-center justify-center gap-0.5" :aria-current="S.route === it[0] || (it[0] === 'alerts' && S.route === 'alerts') ? 'page' : undefined" @click="tab(it[0])">
        <span :class="['relative grid h-7 w-12 place-items-center rounded-full transition-colors', S.route === it[0] ? 'bg-primary/10 text-primary' : 'text-muted-foreground']"><Icon :name="it[2]" :size="20"/>
          <span v-if="it[0] === 'alerts' && unread" class="absolute right-3 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">{{ unread }}</span></span>
        <span :class="['text-[11px]', S.route === it[0] ? 'font-semibold text-primary' : 'font-medium text-muted-foreground']">{{ it[1] }}</span></button></template></nav>` };

const ROOTS = ['payments', 'products', 'movements', 'deliveries', 'count', 'accounts', 'expenses', 'suppliers', 'users', 'settings', 'alertsettings'];
const MENU = [
  { label: 'Sell', items: [['Till', 'ShoppingCart', 'till'], ['Sales', 'Receipt', 'sales'], ['Payments', 'Wallet', 'payments']] },
  { label: 'People', items: [['Customers', 'Users', 'customers'], ['Suppliers', 'Truck', 'suppliers', 'owner']] },
  { label: 'Stock', items: [['Products', 'Package', 'products'], ['Stock movements', 'ArrowLeftRight', 'movements'], ['Deliveries', 'PackagePlus', 'deliveries', 'owner'], ['End-of-day count', 'ClipboardCheck', 'count']] },
  { label: 'Money', owner: true, items: [['Accounts', 'Landmark', 'accounts'], ['Expenses', 'Coins', 'expenses']] },
  { label: 'Shop', owner: true, items: [['Waiting for you', 'Hourglass', 'waiting', 'badge'], ['Users', 'UserCog', 'users'], ['Settings', 'Settings', 'settings']] },
  { label: 'You', items: [['Notifications', 'Bell', 'alerts', 'unread'], ['Alerts and reminders', 'BellRing', 'alertsettings'], ['Profile', 'CircleUser', 'profile']] }
];
const Drawer = { components: { Icon },
  setup() {
    const groups = computed(() => MENU.filter(g => !g.owner || S.role === 'owner').map(g => ({ label: g.label, items: g.items.filter(i => i[3] !== 'owner' || S.role === 'owner') })));
    const cur = (t) => (t === S.route) || (t === 'till' && S.route === 'till');
    const open = (t) => { if (TABS.includes(t)) return tab(t); if (ROOTS.includes(t)) { S.stack = []; S.drawer = false; S.sheet = null; S.route = t; return; } go(t); };
    return { S, ME, groups, cur, open, unread, waitingN };
  },
  template: `<div v-if="S.drawer" class="absolute inset-0 z-[60]"><transition name="fade" appear><div class="absolute inset-0 bg-black/50" @click="S.drawer = false"></div></transition>
    <transition name="drawer" appear><aside class="absolute inset-y-0 left-0 flex w-[304px] max-w-[88%] flex-col bg-background shadow-2xl" aria-label="Menu">
      <div class="shrink-0 bg-primary px-5 pb-5 text-primary-foreground" :style="{ paddingTop: 'calc(20px + var(--sa-top))' }">
        <div class="flex items-center gap-3"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 text-base font-bold">{{ ME.ini }}</span>
          <div class="min-w-0"><p class="truncate text-base font-bold leading-tight">{{ ME.full }}</p><p class="truncate text-xs opacity-75">{{ ME.email }}</p></div></div>
        <div class="mt-3 flex flex-wrap gap-1.5"><span class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">{{ ME.role }}</span><span class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">Office Shop</span></div></div>
      <nav class="scroll min-h-0 flex-1 overflow-y-auto px-3 py-2" :style="{ paddingBottom: 'calc(12px + var(--sa-bottom))' }">
        <div v-for="g in groups" :key="g.label" class="py-1.5"><p class="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ g.label }}</p>
          <button v-for="it in g.items" :key="it[0]" type="button" @click="open(it[2])" :class="['press flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm', cur(it[2]) ? 'bg-primary/10 font-semibold text-primary' : '']">
            <Icon :name="it[1]" :size="16" :class="cur(it[2]) ? '' : 'text-muted-foreground'"/><span class="flex-1 truncate">{{ it[0] }}</span>
            <span v-if="it[3] === 'badge' && waitingN" class="grid h-6 min-w-6 place-items-center rounded-full bg-warning/20 px-1.5 text-xs font-bold text-warning">{{ waitingN }}</span>
            <span v-else-if="it[3] === 'unread' && unread" class="grid h-6 min-w-6 place-items-center rounded-full bg-destructive px-1.5 text-xs font-bold text-white">{{ unread }}</span></button></div></nav></aside></transition></div>` };

/* ============================================================ sheets, dialog, toast */
const Sheet = { props: { open: Boolean, title: String, sub: String, tall: Boolean }, components: { Icon },
  template: `<div v-if="open" class="absolute inset-0 z-[70]"><transition name="fade" appear><div class="absolute inset-0 bg-black/45" @click="$emit('close')"></div></transition>
    <transition name="sheet" appear><section :class="['absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl bg-background shadow-2xl', tall ? 'top-10' : 'max-h-[86%]']" role="dialog" :aria-label="title">
      <div class="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"></div>
      <div class="flex shrink-0 items-center gap-2 px-5 pb-2 pt-3"><div class="min-w-0 flex-1"><h2 class="truncate text-base font-semibold">{{ title }}</h2><p v-if="sub" class="truncate text-xs text-muted-foreground">{{ sub }}</p></div>
        <button type="button" class="press grid h-8 w-8 place-items-center rounded-full bg-muted" aria-label="Close" @click="$emit('close')"><Icon name="X" :size="18"/></button></div>
      <div class="scroll min-h-0 flex-1 overflow-y-auto"><slot/></div>
      <div v-if="$slots.footer" class="shrink-0 border-t px-4 pt-3" :style="{ paddingBottom: 'calc(12px + var(--sa-bottom))' }"><slot name="footer"/></div>
      <div v-else :style="{ height: 'var(--sa-bottom)' }" class="shrink-0"></div></section></transition></div>` };

const Confirm = { components: { Btn },
  setup() { return { S }; },
  template: `<div v-if="S.dialog" class="absolute inset-0 z-[80] grid place-items-center bg-black/50 px-6" @click.self="S.dialog = null"><transition name="pop" appear><div class="w-full rounded-xl bg-background p-5 shadow-2xl" role="alertdialog">
    <h2 class="text-base font-semibold">{{ S.dialog.title }}</h2><p class="mt-1.5 text-sm text-muted-foreground">{{ S.dialog.text }}</p>
    <div class="mt-5 grid grid-cols-2 gap-2"><Btn v-if="S.dialog.cancel !== false" v="outline" @click="S.dialog = null">{{ S.dialog.cancel || 'Keep it' }}</Btn><Btn :v="S.dialog.tone || 'primary'" @click="S.dialog.ok && S.dialog.ok(); S.dialog = null">{{ S.dialog.action }}</Btn></div></div></transition></div>` };

const Toast = { components: { Icon }, setup() { return { S }; },
  template: `<transition name="pop"><div v-if="S.toast" :key="S.toastKey" class="pointer-events-none absolute inset-x-4 z-[90] flex justify-center" :style="{ bottom: 'calc(80px + var(--sa-bottom))' }" role="status"><p class="flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl"><Icon name="Check" :size="16"/>{{ S.toast }}</p></div></transition>` };

const FooterBar = { template: `<div class="relative z-10 shrink-0 border-t bg-background px-4 pt-3" :style="{ paddingBottom: 'calc(12px + var(--sa-bottom))' }"><slot/></div>` };

/* the bar every list starts with (from Agrovet and Jumla: Refresh and one pill that says what is filtered) */
const FilterBar = { props: { summary: String, active: Boolean, loading: Boolean, placeholder: String }, components: { Icon },
  template: `<div class="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-3 py-2.5">
    <button type="button" class="press grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-muted/50" aria-label="Refresh" @click="$emit('refresh')"><Icon name="RefreshCw" :size="18" :class="loading ? 'animate-spin' : ''"/></button>
    <button type="button" class="press flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md border bg-muted/50 px-3 text-left text-sm" @click="$emit('open')"><Icon name="SlidersHorizontal" :size="17" class="shrink-0 text-muted-foreground"/>
      <span :class="['min-w-0 flex-1 truncate', active ? 'font-medium' : 'text-muted-foreground']">{{ summary }}</span><span v-if="active" class="h-2 w-2 shrink-0 rounded-full bg-primary"></span></button></div>` };

const Placeholder = { components: { Empty, Header, Icon }, props: { name: String },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="name" pushed hide-search/><div class="scroll min-h-0 flex-1 overflow-y-auto"><Empty icon="PencilRuler" title="Drawn in the next pass" text="This menu entry is in the app. The first pass covers Home, Till, Sales, Customers, Alerts and Profile."/></div></div>` };

/* full-screen search (every list's magnifier opens this) */
const SearchView = { components: { Icon, Av, Tile, Pill },
  setup() {
    const q = computed(() => S.searchQ.trim().toLowerCase());
    const cs = computed(() => !q.value ? [] : CUSTOMERS.filter(c => !c.walkin && (c.name + c.phone + c.no).toLowerCase().includes(q.value)).slice(0, 4));
    const ps = computed(() => !q.value ? [] : PRODUCTS.filter(p => p.name.toLowerCase().includes(q.value)).slice(0, 4));
    const ss = computed(() => !q.value ? [] : SALES.filter(s => (s.id + cust(s.c).name).toLowerCase().includes(q.value)).slice(0, 4));
    const pick = (r, a) => { S.search = false; S.searchQ = ''; go(r, a); };
    return { S, q, cs, ps, ss, pick, go, money, cust, saleTotal };
  },
  template: `<div v-if="S.search" class="absolute inset-0 z-[65] flex flex-col bg-background" role="search">
    <div class="flex shrink-0 items-center gap-2 border-b px-2" :style="{ paddingTop: 'var(--sa-top)', height: 'calc(56px + var(--sa-top))' }">
      <button type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Close search" @click="S.search = false"><Icon name="ChevronLeft" :size="24"/></button>
      <input v-model="S.searchQ" type="search" placeholder="Customers, products, sales" aria-label="Search" class="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"></div>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <template v-if="!q"><p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</p><div class="flex flex-wrap gap-2"><button v-for="r in S.recent" :key="r" type="button" class="press h-10 rounded-full border bg-muted/50 px-4 text-sm" @click="S.searchQ = r">{{ r }}</button></div></template>
      <template v-else><p v-if="!cs.length && !ps.length && !ss.length" class="py-10 text-center text-sm text-muted-foreground">Nothing matches "{{ S.searchQ }}"</p>
        <template v-if="cs.length"><p class="mb-1 mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customers</p>
          <button v-for="c in cs" :key="c.id" type="button" class="press flex w-full py-2 items-center gap-3 text-left" @click="pick('customer', c.id)"><Av :c="c"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ c.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ c.no }} {{ c.phone }}</span></span></button></template>
        <template v-if="ps.length"><p class="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Products</p>
          <button v-for="p in ps" :key="p.id" type="button" class="press flex w-full py-2 items-center gap-3 text-left" @click="S.pid = p.id; pick('product')"><Tile :p="p"/><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ p.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ money(p.price) }} · {{ p.stock }} left</span></span></button></template>
        <template v-if="ss.length"><p class="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sales</p>
          <button v-for="s in ss" :key="s.id" type="button" class="press flex w-full py-2 items-center gap-3 text-left" @click="pick('sale', s.id)"><span class="grid h-8 w-8 place-items-center rounded-md bg-muted"><Icon name="Receipt" :size="18" class="text-muted-foreground"/></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ s.id }} · {{ cust(s.c).name }}</span><span class="block truncate text-xs text-muted-foreground">{{ s.day }}, {{ s.time }} · {{ money(saleTotal(s)) }}</span></span></button></template></template></div></div>` };
