/* ============================================================ the phone itself: its status (P76) and where it was (P77), drawn with no real map and no real sensors */
Object.assign(S, { map: 'path', phoneNet: 'wifi' });

/* the last 24 hours, one reading per hour: battery %, and what the network was (w Wi-Fi, m mobile, x none) */
const PH_HOURS = [[0, 96, 'w'], [1, 95, 'w'], [2, 94, 'w'], [3, 93, 'w'], [4, 92, 'w'], [5, 91, 'w'], [6, 90, 'w'], [7, 88, 'm'], [8, 84, 'm'], [9, 79, 'm'], [10, 74, 'm'], [11, 70, 'm'], [12, 65, 'm'], [13, 60, 'x'], [14, 57, 'm'], [15, 52, 'm'], [16, 47, 'm'], [17, 42, 'm'], [18, 38, 'w'], [19, 34, 'w'], [20, 30, 'w'], [21, 52, 'w'], [22, 74, 'w'], [23, 92, 'w']];
const PH_NET = { w: ['Wi-Fi', 'bg-success'], m: ['Mobile data', 'bg-primary'], x: ['No signal', 'bg-warning'] };

const Bars = { props: { level: { type: Number, default: 0 }, label: String },
  template: `<span class="inline-flex h-4 items-end gap-0.5" role="img" :aria-label="label || ('Signal ' + level + ' of 4')"><span v-for="i in 4" :key="i" :class="['w-1 rounded-sm', i <= level ? 'bg-foreground' : 'bg-muted-foreground/30']" :style="{ height: (i * 25) + '%' }"></span></span>` };

const PhoneStatus = { components: { Header, Icon, Btn, Bars },
  setup() {
    const W = 336, Ht = 110;
    const x = (h) => 8 + h * ((W - 16) / 23), y = (p) => 8 + (100 - p) * ((Ht - 16) / 100);
    const line = PH_HOURS.map(r => x(r[0]).toFixed(1) + ',' + y(r[1]).toFixed(1)).join(' ');
    const area = '8,' + (Ht - 8) + ' ' + line + ' ' + x(23).toFixed(1) + ',' + (Ht - 8);
    const off = computed(() => S.phoneNet === 'none');
    const wipe = () => { S.dialog = { title: 'Delete the trail?', text: 'This removes every place point and every status reading kept on this phone. It cannot be undone.', action: 'Delete', tone: 'destructive', cancel: 'Keep it', ok: () => toast('Trail deleted') }; };
    return { S, W, Ht, line, area, PH_HOURS, PH_NET, off, wipe, go, x };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="This phone" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-4 p-3 pb-8">
      <div><p class="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Now</p>
        <div class="rounded-xl border bg-card p-4">
          <div class="flex items-center gap-3"><span class="relative inline-block h-6 w-11 rounded-md border-2 border-foreground/70 p-0.5" aria-hidden="true"><span class="block h-full rounded-sm bg-success" style="width: 62%"></span><span class="absolute -right-1.5 top-1.5 h-2 w-1 rounded-r-sm bg-foreground/70"></span></span>
            <span class="min-w-0 flex-1"><span class="block text-2xl font-semibold tnum leading-none">62%</span><span class="mt-1 block text-xs text-muted-foreground">Not charging · power saving off</span></span></div>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-md bg-muted p-3"><p class="text-[11px] uppercase tracking-wider text-muted-foreground">Network</p><p class="mt-1 flex items-center gap-2 font-medium"><Icon :name="off ? 'WifiOff' : (S.phoneNet === 'wifi' ? 'Wifi' : 'Signal')" :size="16"/>{{ off ? 'None' : (S.phoneNet === 'wifi' ? 'Wi-Fi' : 'Mobile data') }}</p></div>
            <div class="rounded-md bg-muted p-3"><p class="text-[11px] uppercase tracking-wider text-muted-foreground">Signal</p><p class="mt-1 flex items-center gap-2 font-medium"><Bars :level="off ? 0 : 3"/>{{ off ? '0 of 4' : '3 of 4' }}</p></div>
            <div class="rounded-md bg-muted p-3"><p class="text-[11px] uppercase tracking-wider text-muted-foreground">Generation</p><p class="mt-1 font-medium">Not shown</p><p class="text-[11px] text-muted-foreground">Android 11 and up keeps it behind a permission the app does not ask for</p></div>
            <div class="rounded-md bg-muted p-3"><p class="text-[11px] uppercase tracking-wider text-muted-foreground">Storage</p><p class="mt-1 font-medium">15 GB free</p><p class="text-[11px] text-muted-foreground">of 22 GB</p></div>
          </div>
          <dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm"><dt class="text-muted-foreground">Android</dt><dd class="text-right font-medium">12 (API 31)</dd><dt class="text-muted-foreground">Model</dt><dd class="text-right font-medium">Telpo M1K</dd></dl></div></div>
      <div><p class="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last 24 hours</p>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-xs text-muted-foreground">Battery</p>
          <svg :viewBox="'0 0 ' + W + ' ' + Ht" class="mt-1 w-full" role="img" aria-label="Battery over the last 24 hours, from 96 percent down to 30 and charged back to 92"><g stroke="hsl(var(--border))" stroke-width="1"><line v-for="p in [25, 50, 75]" :key="p" :x1="8" :x2="W - 8" :y1="8 + (100 - p) * ((Ht - 16) / 100)" :y2="8 + (100 - p) * ((Ht - 16) / 100)"/></g>
            <polygon :points="area" fill="hsl(var(--primary) / 0.12)"/><polyline :points="line" fill="none" stroke="hsl(var(--primary))" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/></svg>
          <div class="mt-1 flex justify-between text-[11px] text-muted-foreground tnum"><span>24 h ago</span><span>12 h</span><span>now</span></div>
          <p class="mt-4 text-xs text-muted-foreground">Network</p>
          <div class="mt-1 flex h-3 overflow-hidden rounded-full" role="img" aria-label="Wi-Fi until 07:00, then mobile data, one hour with no signal at 13:00, Wi-Fi from 18:00"><span v-for="r in PH_HOURS" :key="r[0]" :class="['h-full flex-1', PH_NET[r[2]][1]]"></span></div>
          <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span v-for="(v, k) in PH_NET" :key="k" class="inline-flex items-center gap-1.5"><span :class="['h-2 w-2 rounded-full', v[1]]"></span>{{ v[0] }}</span></div></div></div>
      <div><p class="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kept on this phone</p>
        <div class="rounded-xl border bg-card p-4"><p class="text-sm">214 readings and 612 place points, since 3 November.</p>
          <p class="mt-1 text-xs text-muted-foreground">A reading is kept with each place point, even with the app closed, and when the app opens. Wi-Fi names, phone numbers and SIM details are never read.</p>
          <div class="mt-3 grid grid-cols-2 gap-2"><Btn v="outline" @click="go('trailmap')"><Icon name="MapPin" :size="16"/>Map and trail</Btn><Btn v="destructive-outline" @click="wipe">Delete the trail</Btn></div></div></div>
    </div></div></div>` };

/* ---- the map. The real one is Leaflet with OpenStreetMap pictures; this draws the same parts with no network */
const TRAIL = [[24, 232], [48, 214], [74, 206], [102, 196], [128, 170], [150, 150], [176, 138], [204, 126], [226, 98], [250, 84], [282, 78], [312, 64]];
const STOPS = [['Home', 38, 224, '06:40 to 08:10'], ['Mlimani City', 176, 138, '09:05 to 11:30'], ['Office', 282, 78, '12:15 to 16:45']];
const TrailMap = { components: { Header, Icon, Btn, Empty },
  setup() {
    const day = ref(0), pts = TRAIL.map(p => p.join(',')).join(' ');
    const label = computed(() => day.value === 0 ? 'Today' : day.value === 1 ? 'Yesterday' : day.value + ' days ago');
    const wipe = () => { S.dialog = { title: 'Delete the trail?', text: 'This removes every place point and every status reading kept on this phone. It cannot be undone.', action: 'Delete', tone: 'destructive', cancel: 'Keep it', ok: () => toast('Trail deleted') }; };
    const empty = computed(() => S.map === 'none' || day.value > 2);
    return { S, day, label, pts, TRAIL, STOPS, wipe, empty, go };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Where this phone was" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-3 p-3 pb-8">
      <div class="flex items-center justify-between rounded-xl border bg-card px-1.5 py-1"><button type="button" class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Previous day" @click="day++"><Icon name="ChevronLeft" :size="20"/></button>
        <div class="text-center"><p class="text-sm font-semibold">{{ label }}</p><p class="text-xs text-muted-foreground">{{ empty ? 'No points' : '12.4 km · 3 stops' }}</p></div>
        <button type="button" class="press grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label="Next day" :disabled="day === 0" @click="day--"><Icon name="ChevronRight" :size="20"/></button></div>
      <div class="relative overflow-hidden rounded-xl border bg-muted" style="height: 300px">
        <svg viewBox="0 0 336 300" class="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map with the path walked today, three stops and the last point">
          <g v-if="S.map !== 'tiles'"><path d="M0 252 C80 240 120 270 200 258 S300 226 336 232 L336 300 L0 300 Z" fill="hsl(var(--primary) / 0.10)"/>
            <g stroke="hsl(var(--border))" stroke-width="7" stroke-linecap="round" fill="none"><path d="M0 120 L336 150"/><path d="M96 0 L120 300"/><path d="M230 0 L204 300"/><path d="M0 40 L336 20"/></g>
            <g stroke="hsl(var(--card))" stroke-width="4" stroke-linecap="round" fill="none"><path d="M0 120 L336 150"/><path d="M96 0 L120 300"/><path d="M230 0 L204 300"/><path d="M0 40 L336 20"/></g></g>
          <g v-if="!empty"><polyline :points="pts" fill="none" stroke="hsl(var(--primary))" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
            <g v-for="s in STOPS" :key="s[0]"><circle :cx="s[1]" :cy="s[2]" r="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="3"/><circle :cx="s[1]" :cy="s[2]" r="3.5" fill="hsl(var(--primary))"/></g>
            <circle :cx="TRAIL[11][0]" :cy="TRAIL[11][1]" r="16" fill="hsl(var(--primary) / 0.2)"/><circle :cx="TRAIL[11][0]" :cy="TRAIL[11][1]" r="6" fill="hsl(var(--primary))" stroke="hsl(var(--background))" stroke-width="2.5"/></g></svg>
        <div v-if="empty" class="absolute inset-0 grid place-items-center bg-background/70 px-8 text-center"><div><span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted"><Icon name="Route" :size="22" class="text-muted-foreground"/></span><p class="mt-3 text-sm font-semibold">No trail yet</p><p class="mt-1 text-xs text-muted-foreground">Turn on place tracking and carry the phone. Points appear here after the first few minutes outdoors.</p></div></div>
        <div v-if="S.map === 'tiles'" class="absolute inset-x-2 top-2 flex items-center gap-2 rounded-md bg-warning/15 px-2.5 py-1.5 text-xs text-warning" role="status"><Icon name="WifiOff" :size="14"/>Map pictures need a network. The path is still drawn.</div>
        <button type="button" class="press absolute bottom-8 right-2 grid h-9 w-9 place-items-center rounded-full border bg-background shadow" aria-label="Centre on the last point"><Icon name="LocateFixed" :size="18"/></button>
        <p class="absolute bottom-0 right-0 rounded-tl-md bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">© OpenStreetMap contributors</p></div>
      <div v-if="!empty"><p class="mb-1.5 mt-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Stops</p>
        <div class="overflow-hidden rounded-xl border bg-card"><div v-for="(s, i) in STOPS" :key="s[0]" :class="['flex items-center gap-3 px-3.5 py-2.5', i ? 'border-t' : '']"><span class="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary"><Icon :name="i === 0 ? 'House' : i === 1 ? 'ShoppingBag' : 'Building2'" :size="16"/></span><span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ s[0] }}</span><span class="block text-xs text-muted-foreground tnum">{{ s[3] }}</span></span></div></div></div>
      <p class="px-1 text-xs text-muted-foreground">Positions stay on this phone. Only the map pictures come from the internet.</p>
      <Btn full v="destructive-outline" @click="wipe">Delete the trail</Btn>
    </div></div></div>` };
