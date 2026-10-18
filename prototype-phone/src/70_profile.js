/* ============================================================ Alerts (notifications), Profile, and the phone's own sheets */
const Alerts = { components: { Header, Icon, Seg, Empty, Pill, Btn },
  setup() {
    const tabs = computed(() => [{ id: 'unread', label: 'Unread', count: unread.value }, { id: 'all', label: 'All' }]);
    const rows = computed(() => NOTIFS.filter(n => S.notifTab === 'all' || n.unread));
    const tap = (n) => { S.expanded = S.expanded === n.id ? null : n.id; n.unread = false; };
    const open = (n) => { n.unread = false; if (n.open.startsWith('S-')) go('sale', n.open); else go('ph:' + n.open); };
    const readAll = () => { NOTIFS.forEach(n => (n.unread = false)); toast('All marked as read'); };
    return { S, tabs, rows, tap, open, readAll, unread };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Alerts"><template #right><button v-if="unread" type="button" class="press mr-1 h-10 rounded-lg px-3 text-[14px] font-semibold text-primary" @click="readAll">Read all</button></template></Header>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="sticky top-0 z-10 border-b bg-background px-3 py-2.5"><Seg v-model="S.notifTab" :tabs="tabs"/></div>
      <div class="space-y-2 p-3 pb-6"><Empty v-if="!rows.length" icon="BellOff" :title="S.notifTab === 'unread' ? 'You are all caught up' : 'No alerts yet'" text="Low stock, requests and late deliveries show up here."/>
        <div v-for="n in rows" :key="n.id" class="rise overflow-hidden rounded-2xl border bg-card"><button type="button" class="press flex w-full items-start gap-3 p-4 text-left" :aria-expanded="S.expanded === n.id" @click="tap(n)">
          <span :class="['grid h-10 w-10 shrink-0 place-items-center rounded-xl', n.tone === 'warning' ? 'bg-warning/15 text-warning' : n.tone === 'success' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground']"><Icon :name="n.icon" :size="19"/></span>
          <span class="min-w-0 flex-1"><span class="flex items-start gap-2"><span :class="['flex-1 text-[15px] leading-snug', n.unread ? 'font-bold' : 'font-medium']">{{ n.title }}</span><span v-if="n.unread" class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread"></span></span>
            <span :class="['mt-0.5 block text-[14px] text-muted-foreground', S.expanded === n.id ? '' : 'line-clamp-2']">{{ n.body }}</span><span class="mt-1 block text-[12px] text-muted-foreground/80">{{ n.when }}</span></span></button>
          <div v-if="S.expanded === n.id" class="border-t px-4 pb-4 pt-3"><div class="mb-3 flex flex-wrap gap-1.5"><Pill v-for="c in n.chan" :key="c" tone="muted">{{ c }}</Pill></div><Btn v="soft" size="md" @click="open(n)">Open {{ n.open }}</Btn></div></div></div></div></div>` };

const SetRow = { props: { icon: String, title: String, sub: String, value: String, danger: Boolean, noChev: Boolean }, components: { Icon },
  template: `<button type="button" :class="['press flex min-h-[60px] w-full items-center gap-3.5 px-4 py-2.5 text-left', danger ? 'text-destructive' : '']"><span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-lg', danger ? 'bg-destructive/10' : 'bg-muted']"><Icon :name="icon" :size="18" :class="danger ? '' : 'text-muted-foreground'"/></span>
    <span class="min-w-0 flex-1"><span class="block truncate text-[15px] font-medium">{{ title }}</span><span v-if="sub" class="block truncate text-[13px] text-muted-foreground">{{ sub }}</span></span><slot><span v-if="value" class="text-[14px] text-muted-foreground">{{ value }}</span><Icon v-if="!noChev && !danger" name="ChevronRight" :size="18" class="text-muted-foreground/60"/></slot></button>` };
const Switch = { props: { modelValue: Boolean, label: String },
  template: `<span role="switch" :aria-checked="modelValue" :aria-label="label" :class="['relative inline-block h-8 w-14 shrink-0 rounded-full transition-colors', modelValue ? 'bg-primary' : 'bg-muted-foreground/30']"><span :class="['absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all', modelValue ? 'left-7' : 'left-1']"></span></span>` };

const Profile = { components: { Header, Icon, Av, Pill, Seg, SetRow, Switch, Btn },
  setup() {
    const themes = [{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }, { id: 'system', label: 'System' }];
    const setTheme = (m) => { S.themeMode = m; S.dark = m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); };
    const check = () => { S.checking = true; S.upToDate = false; setTimeout(() => { S.checking = false; S.upToDate = true; }, 1300); };
    const viewAs = () => { S.dialog = { title: S.role === 'owner' ? 'View as Rehema?' : 'Back to Amina?', text: S.role === 'owner' ? 'You see the shop as she does. Nothing you do is saved as hers.' : 'Leave Rehema’s view.', action: S.role === 'owner' ? 'View as Rehema' : 'Go back', cancel: 'Cancel', ok: () => { S.role = S.role === 'owner' ? 'cashier' : 'owner'; toast(S.role === 'cashier' ? 'Viewing as Rehema' : 'Back to Amina'); } }; };
    const signOut = () => { S.dialog = { title: 'Sign out?', text: 'This clears the cart and drafts on this phone. Sales you saved stay.', action: 'Sign out', tone: 'destructive', cancel: 'Stay signed in', ok: () => toast('Signed out. The sign-in screen comes in the next pass.') }; };
    return { S, ME, themes, setTheme, check, viewAs, signOut, unread, go, toast };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Profile" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-4 p-3 pb-8">
      <section class="rise flex items-center gap-4 rounded-2xl border bg-card p-4"><span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-[22px] font-bold text-primary-foreground">{{ ME.ini }}</span>
        <div class="min-w-0"><p class="truncate text-[20px] font-bold leading-tight">{{ ME.full }}</p><p class="truncate text-[14px] text-muted-foreground">{{ ME.email }}</p><div class="mt-1.5 flex gap-1.5"><Pill tone="primary">{{ ME.role }}</Pill><Pill>Office Shop</Pill></div></div></section>

      <div><p class="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Alerts</p><div class="divide-y overflow-hidden rounded-2xl border bg-card">
        <SetRow icon="Bell" title="Notifications" :sub="unread ? unread + ' new' : 'All read'" @click="go('alerts')"/><SetRow icon="BellRing" title="Alerts and reminders" sub="What reaches you, and how" @click="go('ph:Alerts and reminders')"/></div></div>

      <div><p class="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Look</p><div class="rounded-2xl border bg-card p-4"><p class="mb-2.5 flex items-center gap-2 text-[15px] font-medium"><Icon name="SunMoon" :size="18" class="text-muted-foreground"/>Theme</p><Seg :model-value="S.themeMode" :tabs="themes" @update:model-value="setTheme"/></div>
        <div class="mt-2 overflow-hidden rounded-2xl border bg-card"><SetRow icon="Languages" title="Language" value="English"/></div></div>

      <div><p class="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Security</p><div class="divide-y overflow-hidden rounded-2xl border bg-card">
        <SetRow icon="Lock" title="Lock the app" :sub="S.lock ? 'After ' + S.lockAfter + ' away' : 'Off'" no-chev @click="S.lock = !S.lock"><Switch :model-value="S.lock" label="Lock the app"/></SetRow>
        <SetRow icon="ShieldCheck" title="Two-step verification" value="On"/><SetRow icon="Smartphone" title="Trusted devices" value="2"/></div></div>

      <div><p class="mb-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">This phone</p><div class="divide-y overflow-hidden rounded-2xl border bg-card">
        <SetRow icon="Printer" title="Receipt printer" sub="RPP02N · connected" @click="S.sheet = 'printer'"/>
        <SetRow icon="Info" title="App version" value="1.0.2 (3)" no-chev/>
        <SetRow :icon="S.checking ? 'Loader2' : 'CloudDownload'" title="Check for updates" :sub="S.checking ? 'Checking…' : S.upToDate ? 'You are on the latest version' : 'Tap to check'" no-chev @click="check"/></div></div>

      <div class="divide-y overflow-hidden rounded-2xl border bg-card"><SetRow v-if="ME.role === 'Owner' || S.role === 'cashier'" icon="Eye" :title="S.role === 'owner' ? 'View as Rehema' : 'Back to Amina'" sub="See the shop as she does" @click="viewAs"/>
        <SetRow icon="LogOut" title="Sign out" danger no-chev @click="signOut"/></div></div></div></div>` };

/* the phone's own sheets: call and message, share, receipt printer */
const PhoneSheets = { components: { Sheet, Icon, Btn },
  setup() {
    const c = computed(() => cust(S.cid));
    const act = (m) => { S.sheet = null; toast(m); };
    const printers = [['RPP02N', '66:12:8A:0B:7C:41', true], ['MTP-II', '00:11:22:33:AA:BB', false]];
    const sel = ref('RPP02N');
    return { S, c, act, printers, sel, toast };
  },
  template: `<div>
    <Sheet :open="S.sheet === 'call'" :title="c.name" :sub="c.phone" @close="S.sheet = null"><div class="px-3 pb-3"><button v-for="a in [['Call','Phone','Calling ' + c.phone],['WhatsApp','MessageCircle','Opening WhatsApp'],['Send SMS','MessageSquare','Opening messages'],['Copy number','Copy','Number copied']]" :key="a[0]" type="button" class="press flex h-[56px] w-full items-center gap-3.5 rounded-xl px-2 text-left" @click="act(a[2])">
      <span class="grid h-10 w-10 place-items-center rounded-xl bg-muted"><Icon :name="a[1]" :size="19"/></span><span class="text-[16px] font-medium">{{ a[0] }}</span></button></div></Sheet>
    <Sheet :open="S.sheet === 'share'" title="Share the receipt" @close="S.sheet = null"><div class="px-3 pb-3"><button v-for="a in [['WhatsApp','MessageCircle','Receipt sent to WhatsApp'],['SMS','MessageSquare','Receipt sent by SMS'],['Copy as text','Copy','Receipt copied'],['Other apps','Share2','Opening the share list']]" :key="a[0]" type="button" class="press flex h-[56px] w-full items-center gap-3.5 rounded-xl px-2 text-left" @click="act(a[2])">
      <span class="grid h-10 w-10 place-items-center rounded-xl bg-muted"><Icon :name="a[1]" :size="19"/></span><span class="text-[16px] font-medium">{{ a[0] }}</span></button></div></Sheet>
    <Sheet :open="S.sheet === 'printer'" title="Receipt printer" sub="Printers paired in Android's Bluetooth settings" @close="S.sheet = null"><div class="px-4 pb-4"><button v-for="p in printers" :key="p[0]" type="button" :class="['press mb-2 flex h-16 w-full items-center gap-3 rounded-2xl border px-3.5 text-left', sel === p[0] ? 'border-primary bg-primary/10' : '']" @click="sel = p[0]"><span class="grid h-10 w-10 place-items-center rounded-xl bg-muted"><Icon name="Printer" :size="19"/></span>
      <span class="min-w-0 flex-1"><span class="block text-[15px] font-semibold">{{ p[0] }}</span><span class="block font-mono text-[12px] text-muted-foreground">{{ p[1] }}</span></span><Icon v-if="sel === p[0]" name="CircleCheck" :size="22" class="text-primary"/></button>
      <div class="mt-3 grid grid-cols-2 gap-2"><Btn v="outline" size="md" @click="toast('Test page sent to ' + sel)"><Icon name="FileText" :size="16"/>Test print</Btn><Btn size="md" @click="S.sheet = null; toast(sel + ' is your printer')">Use this printer</Btn></div></div></Sheet></div>` };
