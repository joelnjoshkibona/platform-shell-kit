/* ============================================================ Alerts (notifications), Profile, and the phone's own sheets */
const Alerts = { components: { Header, Icon, Seg, Empty, Pill, Btn },
  setup() {
    const tabs = computed(() => [{ id: 'unread', label: 'Unread', count: unread.value }, { id: 'all', label: 'All' }]);
    const rows = computed(() => NOTIFS.filter(n => S.notifTab === 'all' || n.unread));
    const tap = (n) => { S.expanded = S.expanded === n.id ? null : n.id; n.unread = false; };
    const open = (n) => { n.unread = false; const o = n.open; if (o.startsWith('S-')) go('sale', o); else if (o === 'Product') { S.pid = 'p2'; go('product'); } else if (o === 'Count') go('count'); else if (o.startsWith('DEL-')) { S.delId = o; go('delivery'); } else if (o.startsWith('P-')) { S.payId = o; go('payment'); } };
    const readAll = () => { NOTIFS.forEach(n => (n.unread = false)); toast('All marked as read'); };
    return { S, tabs, rows, tap, open, readAll, unread };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Alerts"><template #right><button v-if="unread" type="button" class="press mr-1 h-8 rounded-lg px-3 text-sm font-semibold text-primary" @click="readAll">Read all</button></template></Header>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="sticky top-0 z-10 border-b bg-background px-3 py-2.5"><Seg v-model="S.notifTab" :tabs="tabs"/></div>
      <div class="space-y-2 p-3 pb-6"><Empty v-if="!rows.length" icon="BellOff" :title="S.notifTab === 'unread' ? 'You are all caught up' : 'No alerts yet'" text="Low stock, requests and late deliveries show up here."/>
        <div v-for="n in rows" :key="n.id" class="rise overflow-hidden rounded-xl border bg-card"><button type="button" class="press flex w-full items-start gap-3 p-4 text-left" :aria-expanded="S.expanded === n.id" @click="tap(n)">
          <span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-md', n.tone === 'warning' ? 'bg-warning/15 text-warning' : n.tone === 'success' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground']"><Icon :name="n.icon" :size="19"/></span>
          <span class="min-w-0 flex-1"><span class="flex items-start gap-2"><span :class="['flex-1 text-sm leading-snug', n.unread ? 'font-bold' : 'font-medium']">{{ n.title }}</span><span v-if="n.unread" class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread"></span></span>
            <span :class="['mt-0.5 block text-sm text-muted-foreground', S.expanded === n.id ? '' : 'line-clamp-2']">{{ n.body }}</span><span class="mt-1 block text-xs text-muted-foreground/80">{{ n.when }}</span></span></button>
          <div v-if="S.expanded === n.id" class="border-t px-4 pb-4 pt-3"><div class="mb-3 flex flex-wrap gap-1.5"><Pill v-for="c in n.chan" :key="c" tone="muted">{{ c }}</Pill></div><Btn v="soft" size="md" @click="open(n)">Open {{ n.open }}</Btn></div></div></div></div></div>` };

const SetRow = { props: { icon: String, title: String, sub: String, value: String, danger: Boolean, noChev: Boolean }, components: { Icon },
  template: `<button type="button" :class="['press flex min-h-[48px] w-full items-center gap-3.5 px-4 py-2.5 text-left', danger ? 'text-destructive' : '']"><span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-lg', danger ? 'bg-destructive/10' : 'bg-muted']"><Icon :name="icon" :size="18" :class="danger ? '' : 'text-muted-foreground'"/></span>
    <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ title }}</span><span v-if="sub" class="block truncate text-xs text-muted-foreground">{{ sub }}</span></span><slot><span v-if="value" class="text-sm text-muted-foreground">{{ value }}</span><Icon v-if="!noChev && !danger" name="ChevronRight" :size="18" class="text-muted-foreground/60"/></slot></button>` };
const Profile = { components: { Header, Icon, Av, Pill, Seg, SetRow, Toggle, Btn },
  setup() {
    const themes = [{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }, { id: 'system', label: 'System' }];
    const setTheme = (m) => { S.themeMode = m; S.dark = m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); };
    const check = () => { S.checking = true; S.upToDate = false; setTimeout(() => { S.checking = false; S.upToDate = true; }, 1300); };
    const viewAs = () => { S.dialog = { title: S.role === 'owner' ? 'View as Rehema?' : 'Back to Amina?', text: S.role === 'owner' ? 'You see the shop as she does. Nothing you do is saved as hers.' : 'Leave Rehema’s view.', action: S.role === 'owner' ? 'View as Rehema' : 'Go back', cancel: 'Cancel', ok: () => { S.role = S.role === 'owner' ? 'cashier' : 'owner'; toast(S.role === 'cashier' ? 'Viewing as Rehema' : 'Back to Amina'); } }; };
    const signOut = () => signOutAsk();
    const healthSub = computed(() => { const n = (HEALTH.exact ? 0 : 1) + (HEALTH.autostart === 'confirmed' || HEALTH.autostart === 'proven' ? 0 : 1); return n ? n + (n === 1 ? ' thing needs' : ' things need') + ' attention' : 'Bootbox works with the app closed'; });
    return { S, ME, themes, setTheme, check, viewAs, signOut, unread, go, toast, UPD, REL, healthSub };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Profile" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-4 p-3 pb-8">
      <section class="rise flex items-center gap-4 rounded-xl border bg-card p-4"><span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{{ ME.ini }}</span>
        <div class="min-w-0"><p class="truncate text-xl font-bold leading-tight">{{ ME.full }}</p><p class="truncate text-sm text-muted-foreground">{{ ME.email }}</p><div class="mt-1.5 flex gap-1.5"><Pill tone="primary">{{ ME.role }}</Pill><Pill>Office Shop</Pill></div></div></section>

      <div><p class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alerts</p><div class="divide-y overflow-hidden rounded-xl border bg-card">
        <SetRow icon="Bell" title="Notifications" :sub="unread ? unread + ' new' : 'All read'" @click="go('alerts')"/><SetRow icon="BellRing" title="Alerts and reminders" sub="What reaches you, and how" @click="go('alertsettings')"/></div></div>

      <div><p class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Look</p><div class="rounded-xl border bg-card p-4"><p class="mb-2.5 flex items-center gap-2 text-sm font-medium"><Icon name="SunMoon" :size="18" class="text-muted-foreground"/>Theme</p><Seg :model-value="S.themeMode" :tabs="themes" @update:model-value="setTheme"/></div>
        <div class="mt-2 overflow-hidden rounded-xl border bg-card"><SetRow icon="Languages" title="Language" value="English"/></div></div>

      <div><p class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Security</p><div class="divide-y overflow-hidden rounded-xl border bg-card">
        <SetRow icon="Lock" title="Lock the app" :sub="S.lock ? 'After ' + S.lockAfter + ' away' : 'Off'" no-chev @click="S.lock = !S.lock"><Toggle :model-value="S.lock" label="Lock the app"/></SetRow>
        <SetRow icon="ShieldCheck" title="Two-step verification" value="On"/><SetRow icon="Smartphone" title="Trusted devices" value="2"/></div></div>

      <div><p class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This phone</p><div class="divide-y overflow-hidden rounded-xl border bg-card">
        <SetRow icon="Printer" title="Receipt printer" :sub="S.printFail === 'none' ? 'No printer chosen' : S.printer + ' · paired'" @click="S.sheet = 'printer'"/>
        <SetRow icon="Info" title="App version" value="1.0.2 (3)" no-chev/>
        <SetRow icon="CloudDownload" title="Check for updates" :sub="UPD.step === 'current' ? 'You are on the latest version' : REL.name + ' is ready'" @click="go('update')"><span v-if="UPD.step !== 'current'" class="h-2 w-2 rounded-full bg-primary" aria-label="An update is ready"></span><Icon name="ChevronRight" :size="18" class="text-muted-foreground/60"/></SetRow>
        <SetRow icon="ShieldCheck" title="Background health" :sub="healthSub" @click="go('health')"/></div></div>

      <div class="divide-y overflow-hidden rounded-xl border bg-card"><SetRow v-if="ME.role === 'Owner' || S.role === 'cashier'" icon="Eye" :title="S.role === 'owner' ? 'View as Rehema' : 'Back to Amina'" sub="See the shop as she does" @click="viewAs"/>
        <SetRow icon="LogOut" title="Sign out" danger no-chev @click="signOut"/></div></div></div></div>` };

/* the phone's own sheets: call and message, share, receipt printer */
const PhoneSheets = { components: { Sheet, Icon, Btn },
  setup() {
    const c = computed(() => S.callTo || cust(S.cid));
    const act = (m) => { S.sheet = null; toast(m); };
    const printers = [['RPP02N', '66:12:8A:0B:7C:41', true], ['MTP-II', '00:11:22:33:AA:BB', false]];
    const sel = ref(S.printer); const rec = computed(() => recData());
    return { S, c, act, printers, sel, toast, rec };
  },
  template: `<div>
    <Sheet :open="S.sheet === 'call'" :title="c.name" :sub="c.phone" @close="S.sheet = null"><div class="px-3 pb-3"><button v-for="a in [['Call','Phone','Calling ' + c.phone],['WhatsApp','MessageCircle','Opening WhatsApp'],['Send SMS','MessageSquare','Opening messages'],['Copy number','Copy','Number copied']]" :key="a[0]" type="button" class="press flex py-2 w-full items-center gap-3.5 rounded-md px-2 text-left" @click="act(a[2])">
      <span class="grid h-9 w-9 place-items-center rounded-md bg-muted"><Icon :name="a[1]" :size="19"/></span><span class="text-sm font-medium">{{ a[0] }}</span></button></div></Sheet>
    <Sheet :open="S.sheet === 'share'" title="Share receipt" @close="S.sheet = null"><div class="px-4 pb-4">
      <div class="flex items-center gap-3 rounded-xl border bg-muted/40 px-3.5 py-3"><span class="grid h-10 w-10 place-items-center rounded-md bg-destructive/10 text-destructive"><Icon name="FileText" :size="20"/></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ rec.file }}</span><span class="block text-xs text-muted-foreground">PDF · 1 page · 38 KB</span></span></div>
      <p class="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Send with</p>
      <div class="grid grid-cols-4 gap-1"><button v-for="a in [['WhatsApp','MessageCircle'],['Messages','MessageSquare'],['Gmail','Mail'],['Bluetooth','Bluetooth'],['Drive','Cloud'],['Save','Download'],['Nearby','Radio'],['More','Ellipsis']]" :key="a[0]" type="button" class="press flex flex-col items-center gap-1.5 rounded-md py-2.5" @click="act(rec.file + ' sent with ' + a[0])"><span class="grid h-11 w-11 place-items-center rounded-full bg-muted"><Icon :name="a[1]" :size="20"/></span><span class="text-xs">{{ a[0] }}</span></button></div>
      <p class="mt-3 text-center text-xs text-muted-foreground">This list is Android's own: it shows the apps on this phone.</p></div></Sheet>
    <Sheet :open="S.sheet === 'printer'" title="Receipt printer" sub="Kept on this phone only" @close="S.sheet = null"><div class="px-4 pb-4">
      <div v-if="S.printFail === 'bt'" class="flex flex-col items-center py-6 text-center"><span class="grid h-14 w-14 place-items-center rounded-full bg-muted"><Icon name="BluetoothOff" :size="26" class="text-muted-foreground"/></span><p class="mt-3 text-sm font-semibold">Bluetooth is off</p><p class="mt-1 text-xs text-muted-foreground">Turn it on to see the printers paired with this phone.</p><Btn class="mt-4" size="md" @click="S.printFail = null">Turn on Bluetooth</Btn></div>
      <template v-else><p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Paired printers</p>
      <button v-for="p in printers" :key="p[0]" type="button" :class="['press mb-2 flex w-full py-2 items-center gap-3 rounded-xl border px-3.5 text-left', sel === p[0] ? 'border-primary bg-primary/10' : '']" @click="sel = p[0]"><span class="grid h-9 w-9 place-items-center rounded-md bg-muted"><Icon name="Printer" :size="19"/></span>
        <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">{{ p[0] }}</span><span class="block font-mono text-xs text-muted-foreground">{{ p[1] }}</span></span><Icon v-if="sel === p[0]" name="CircleCheck" :size="22" class="text-primary"/></button>
      <p class="mb-3 mt-1 text-xs text-muted-foreground">Not here? Pair it first in Android's Bluetooth settings. Paper: 58 mm, 32 letters across.</p>
      <div class="grid grid-cols-2 gap-2"><Btn v="outline" size="md" @click="toast('Test page sent to ' + sel)"><Icon name="FileText" :size="16"/>Test print</Btn><Btn size="md" @click="S.printer = sel; S.sheet = null; if (S.printFail === 'none') S.printFail = null; toast(sel + ' is your printer')">Use this printer</Btn></div></template></div></Sheet></div>` };
