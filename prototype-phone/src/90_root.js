/* ============================================================ the phone, and the picker beside it (prototype only) */
const SCREENS = {
  home: Home, sales: SalesList, customers: CustomersList, alerts: Alerts, till: Till, receipt: Receipt, sale: SalePage, customer: Customer, profile: Profile, waiting: Waiting, design: DesignPage
};
const Screen = { components: { ...SCREENS, Placeholder },
  setup() { const ph = computed(() => S.route.startsWith('ph:') ? S.route.slice(3) : ''); return { S, ph, SCREENS }; },
  template: `<Placeholder v-if="ph" :name="ph"/><component :is="S.route" v-else/>` };

const Picker = { components: { Icon },
  setup() {
    const screens = [['home', 'Home', 'House'], ['waiting', 'Waiting for you', 'Hourglass'], ['till', 'Till', 'ShoppingCart'], ['receipt', 'Receipt', 'CircleCheck'], ['sales', 'Sales', 'Receipt'], ['sale', 'Sale page', 'FileText'], ['customers', 'Customers', 'Users'], ['customer', 'Customer page', 'User'], ['alerts', 'Alerts', 'Bell'], ['profile', 'Profile', 'CircleUser'], ['design', 'Design system', 'Palette']];
    const to = (r) => { S.stack = []; S.drawer = false; S.sheet = null; S.dialog = null; S.search = false; S.cartOpen = false; if (r === 'till' && !S.cart.length) { addP(PRODUCTS[0]); addP(PRODUCTS[1]); } if (r === 'receipt' && !S.receipt) S.receipt = SALES[0]; S.route = r; };
    const over = {
      drawer: () => { S.sheet = null; S.drawer = true; }, search: () => { S.drawer = false; S.search = true; },
      cart: () => { to('till'); S.cartOpen = true; }, credit: () => { to('till'); S.cartOpen = true; S.customer = 'c1'; S.pay = 'credit'; addP(PRODUCTS[0]); addP(PRODUCTS[0]); S.part = true; S.partAmt = 1000; },
      filter: () => { to('sales'); S.sheet = 'filter'; }, who: () => { to('till'); S.sheet = 'cust'; }, pay: () => { S.route = 'sale'; S.saleId = 'S-1304'; S.sheet = 'takepay'; },
      call: () => { S.route = 'customer'; S.cid = 'c1'; S.sheet = 'call'; }, printer: () => { S.route = 'profile'; S.sheet = 'printer'; },
      undo: () => { S.route = 'sale'; S.saleId = 'S-1299'; S.dialog = { title: 'Undo S-1299?', text: 'The stock goes back on the shelf and Neema Kimaro’s balance changes.', action: 'Undo the sale', tone: 'destructive', cancel: 'Keep the sale' }; }
    };
    const states = [['data', 'Data'], ['loading', 'Loading'], ['empty', 'Empty'], ['error', 'Error']];
    return { S, screens, to, over, states, tab, ME };
  },
  template: `<div class="space-y-5 text-sm">
    <div><p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">Signed in as</p><div class="grid grid-cols-2 gap-1 rounded-lg bg-[hsl(var(--canvas))] p-1 ring-1 ring-black/10"><button v-for="r in [['owner','Amina (owner)'],['cashier','Rehema (cashier)']]" :key="r[0]" type="button" @click="S.role = r[0]" :class="['h-8 rounded-md text-xs font-medium', S.role === r[0] ? 'bg-white text-black shadow dark:bg-neutral-700 dark:text-white' : 'opacity-60']">{{ r[1] }}</button></div></div>
    <div><p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">Theme</p><div class="grid grid-cols-2 gap-1 rounded-lg bg-[hsl(var(--canvas))] p-1 ring-1 ring-black/10"><button type="button" @click="S.dark = false; S.themeMode = 'light'" :class="['h-8 rounded-md text-xs font-medium', !S.dark ? 'bg-white text-black shadow' : 'opacity-60']">Light</button><button type="button" @click="S.dark = true; S.themeMode = 'dark'" :class="['h-8 rounded-md text-xs font-medium', S.dark ? 'bg-neutral-700 text-white shadow' : 'opacity-60']">Dark</button></div></div>
    <div><p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">Screens</p><div class="grid gap-0.5"><button v-for="s in screens" :key="s[0]" type="button" @click="to(s[0])" :class="['flex h-9 items-center gap-2 rounded-md px-2 text-left', S.route === s[0] ? 'bg-black/10 font-medium dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10']"><Icon :name="s[2]" :size="15" class="opacity-60"/>{{ s[1] }}</button></div></div>
    <div><p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">Open on top</p><div class="grid grid-cols-2 gap-1"><button v-for="o in [['drawer','Drawer'],['search','Search'],['cart','Cart'],['credit','Credit, part paid'],['filter','Filters'],['who','Who is buying'],['pay','Take payment'],['call','Call sheet'],['printer','Printer'],['undo','Confirm undo']]" :key="o[0]" type="button" @click="over[o[0]]()" class="h-9 rounded-md px-2 text-left text-xs hover:bg-black/5 dark:hover:bg-white/10">{{ o[1] }}</button></div></div>
    <div><p class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">List state</p><div class="grid grid-cols-4 gap-1 rounded-lg bg-[hsl(var(--canvas))] p-1 ring-1 ring-black/10"><button v-for="s in states" :key="s[0]" type="button" @click="S.list = s[0]; if (S.route !== 'sales') to('sales')" :class="['h-8 rounded-md text-[11px] font-medium', S.list === s[0] ? 'bg-white text-black shadow dark:bg-neutral-700 dark:text-white' : 'opacity-60']">{{ s[1] }}</button></div></div></div>` };

const Root = { components: { Screen, TabBar, Drawer, SearchView, PhoneSheets, Confirm, Toast, Picker, Icon },
  setup() {
    const scale = ref(1), narrow = ref(false), menu = ref(false);
    const fit = () => { narrow.value = innerWidth < 900; scale.value = narrow.value ? 1 : Math.min(1, (innerHeight - 32) / 844); };
    onMounted(() => { fit(); addEventListener('resize', fit); });
    onBeforeUnmount(() => removeEventListener('resize', fit));
    const clock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    watch(() => S.dark, (d) => document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light'), { immediate: true });
    const bar = computed(() => TABS.includes(S.route));
    return { S, scale, narrow, menu, clock, bar };
  },
  template: `<div :class="narrow ? '' : 'flex min-h-screen items-center justify-center gap-10 p-4'" :style="narrow ? 'height:100dvh' : ''">
    <aside v-if="!narrow" class="w-64 shrink-0 rounded-2xl bg-[hsl(var(--canvas))] p-4 text-[hsl(240_10%_20%)] ring-1 ring-black/10 dark:text-neutral-200 dark:ring-white/10"><h1 class="mb-1 text-base font-semibold">DevBiz Phone</h1><p class="mb-5 text-xs opacity-70">The shop drawn for a phone only. Everything is clickable. This panel is not part of the app.</p><Picker/></aside>
    <div :style="narrow ? '' : { width: (390 * scale) + 'px', height: (844 * scale) + 'px' }" :class="narrow ? 'h-full w-full' : 'shrink-0'"><div :class="narrow ? 'h-full w-full' : 'origin-top-left'" :style="narrow ? '' : { transform: 'scale(' + scale + ')', width: '390px', height: '844px' }">
      <div :class="['app relative flex flex-col overflow-hidden', S.dark ? 'dark' : '', narrow ? 'h-full w-full' : 'h-[844px] w-[390px] rounded-[44px] border-[10px] border-[#18181b] shadow-2xl ring-1 ring-black/10']">
        <div v-if="!narrow" class="pointer-events-none absolute inset-x-0 top-0 z-[100] flex h-[30px] items-center justify-between px-7 text-[12px] font-semibold"><span>{{ clock }}</span><span class="absolute left-1/2 top-1.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#18181b]"></span><span class="flex items-center gap-1"><Icon name="Signal" :size="12"/><Icon name="Wifi" :size="12"/><Icon name="BatteryFull" :size="14"/></span></div>
        <Screen/><TabBar v-if="bar"/><Drawer/><SearchView/><PhoneSheets/><Confirm/><Toast/></div></div></div>
    <template v-if="narrow"><button v-if="!S.sheet && !S.drawer && !S.dialog" type="button" class="fixed left-3 z-[200] flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-xs font-medium text-black shadow-lg" style="bottom: calc(86px + env(safe-area-inset-bottom, 0px))" @click="menu = !menu"><Icon name="Map" :size="14"/>States</button>
      <div v-if="menu" class="fixed inset-x-3 bottom-32 z-[200] max-h-[70dvh] overflow-y-auto rounded-2xl bg-white p-4 text-black shadow-2xl"><Picker/></div></template></div>`
};
createApp(Root).mount('#root');
