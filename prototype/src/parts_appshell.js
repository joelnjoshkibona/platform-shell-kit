
  /* ================================================================ THE PHONE APP (P51–P55)
     The same shell inside a product's Android app (NativePHP web view, online only). These states exist only there.
     The Screens pill's "Phone app" group opens each one; inside the phone frame the app is always on. */
  const APP = reactive({ on: IN_PHONE, conn: null, checking: false, update: null, later: false, askNotifs: false, notifs: false, hint: false, closed: false, splash: false, perm: null, expired: false, locked: false, sheet: null, scan: false, printers: null, stale: null, kbd: false });
  G.app = APP;

  /* P51: no answer from the server. 'page': the page never loaded, so it says so instead of empty lists and zero
     totals; 'banner': the page loaded, its figures stay under a note. Retry asks the server; any answer ends it. */
  function appRetry() { APP.checking = true; setTimeout(() => { APP.checking = false; APP.conn = null; }, 900); }
  const ConnectionNotice = {
    props: { variant: { type: String, default: 'page' } },
    setup() { return { APP, appRetry }; },
    template: `<div v-if="variant==='page'" class="mx-auto grid max-w-md place-items-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center" role="alert">
      <span class="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"><Icon name="WifiOff" :size="22"/></span>
      <h3 class="mt-4 text-lg font-semibold">No connection</h3>
      <p class="mt-1 max-w-sm text-sm text-muted-foreground">Check the phone's data or Wi-Fi. This page opens by itself when the connection is back.</p>
      <Button class="mt-5" variant="outline" :disabled="APP.checking" @click="appRetry"><Icon name="RotateCw" :class="APP.checking && 'animate-spin'"/>Try again</Button></div>
    <div v-else class="mx-auto mb-3 flex max-w-[1200px] items-center gap-2 rounded-lg border bg-muted/60 px-3 py-2 text-xs" role="status">
      <Icon name="WifiOff" :size="14" class="shrink-0 text-muted-foreground"/><p class="min-w-0 flex-1">No connection. What you see may be out of date, and nothing can be saved until it is back.</p>
      <button type="button" class="shrink-0 font-medium text-primary disabled:opacity-50" :disabled="APP.checking" @click="appRetry">Try again</button></div>`
  };

  /* P53: a newer version. Available: a banner that can wait (Later hides it until the next version). Required (the
     server says this version no longer works with it): the whole app waits for the update. */
  function appUpdate() { G.toast('Opening the store', 'The app updates and opens again where you were.', 'Download'); }
  const AppUpdateBanner = {
    setup() { return { APP, PRODUCT, appUpdate }; },
    template: `<div v-if="APP.update==='available' && !APP.later" class="mx-auto mb-3 flex max-w-[1200px] items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm" role="status">
      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Download" :size="15"/></span>
      <div class="min-w-0 flex-1"><p class="font-medium">A new version of {{ PRODUCT.name }} is ready</p><p class="text-xs text-muted-foreground">Fixes and improvements. It takes a minute.</p></div>
      <Button size="sm" variant="ghost" @click="APP.later=true">Later</Button><Button size="sm" @click="appUpdate">Update</Button></div>`
  };
  const AppUpdateRequired = {
    setup() { return { APP, PRODUCT, appUpdate }; },
    template: `<Teleport to="body"><div v-if="APP.update==='required'" class="fixed inset-0 z-[110] grid place-items-center bg-background px-6" role="alertdialog" aria-modal="true" aria-labelledby="upd-title" style="padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)">
      <div class="grid max-w-sm justify-items-center text-center">
        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><BrandMark :size="26"/></span>
        <h2 id="upd-title" class="mt-5 text-xl font-semibold tracking-tight">Update {{ PRODUCT.name }} to keep going</h2>
        <p class="mt-2 text-sm text-muted-foreground">This version no longer works with the server. The update takes a minute; nothing you saved is lost.</p>
        <Button size="lg" class="mt-6 w-full" @click="appUpdate"><Icon name="Download" :size="16"/>Update now</Button>
        <p class="mt-3 text-xs text-muted-foreground">Version 1.4.2 · needs 1.5.0 or newer</p></div></div></Teleport>`
  };

  /* P54: explain first, then ask. After the first sign-in in the app, one card says what will arrive; Android's own
     prompt follows only Turn on. Not now leaves it in Notification settings (On this phone). */
  function notifsOn() { APP.askNotifs = false; APP.notifs = true; G.toast('Notifications on', 'This phone gets approvals and alerts as they happen.', 'BellRing'); }
  const AppNotifsAsk = {
    setup() { return { APP, PRODUCT, notifsOn }; },
    template: `<Dialog :open="APP.askNotifs" @update:open="v => APP.askNotifs = v">
      <div class="grid justify-items-center p-6 text-center">
        <span class="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="BellRing" :size="22"/></span>
        <h2 class="mt-4 text-lg font-semibold">Turn on notifications?</h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ PRODUCT.name }} tells you when something needs you, even with the app closed:</p>
        <ul class="mt-4 grid w-full gap-2 text-left text-sm">
          <li class="flex items-start gap-2.5 rounded-lg border p-3"><Icon name="CheckCheck" :size="16" class="mt-0.5 shrink-0 text-primary"/>A request you sent is approved or rejected</li>
          <li class="flex items-start gap-2.5 rounded-lg border p-3"><Icon name="Inbox" :size="16" class="mt-0.5 shrink-0 text-primary"/>Something waits for your approval</li>
          <li class="flex items-start gap-2.5 rounded-lg border p-3"><Icon name="TriangleAlert" :size="16" class="mt-0.5 shrink-0 text-primary"/>An alert you follow, like low stock</li></ul>
        <p class="mt-3 text-xs text-muted-foreground">Quiet hours still hold them overnight. You can change this any time in Notification settings.</p>
        <div class="mt-5 grid w-full gap-2"><Button size="lg" @click="notifsOn">Turn on</Button><Button size="lg" variant="ghost" @click="APP.askNotifs=false">Not now</Button></div>
      </div></Dialog>`
  };
  const AppNotifsRow = {
    setup() { return { APP, PRODUCT, notifsOn }; },
    template: `<div v-if="APP.on" class="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="Smartphone" :size="16"/></span>
      <div class="min-w-0 flex-1"><p class="text-sm font-medium">On this phone</p><p class="text-xs text-muted-foreground">{{ APP.notifs ? 'Notifications are on for ' + PRODUCT.name + '.' : 'Notifications are off. Push reaches you only when they are on.' }}</p></div>
      <Button v-if="!APP.notifs" size="sm" @click="notifsOn">Turn on</Button><Badge v-else variant="secondary">On</Badge></div>`
  };

  /* P52: the phone's Back closes the open layer first, then follows the trail (P49). On the first screen (no trail,
     no list above it) the first press says "Press back again to leave"; a second press within 2 seconds leaves. */
  let backAt = 0, hintT = null;
  function phoneBack() {
    if (APP.closed) return;
    if (APP.askNotifs) { APP.askNotifs = false; return; }
    if (G.dialogs && G.dialogs.length) { G.closeTopDialog(); return; }   // P100/P101: Back closes the top dialog only
    if (G.mobileNav) { G.mobileNav = false; return; }
    if (TRAIL.length || BACK_PARENT[G.route]) { goBack(); return; }
    const now = Date.now();
    if (now - backAt < 2000) { APP.closed = true; APP.hint = false; return; }
    backAt = now; APP.hint = true; clearTimeout(hintT); hintT = setTimeout(() => { APP.hint = false; }, 2000);
  }
  G.phoneBack = phoneBack;
  const AppBackHint = {
    setup() { return { APP, PRODUCT }; },
    template: `<Teleport to="body"><div v-if="APP.hint" class="pop pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4" role="status"><p class="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">Press back again to leave</p></div>
    <div v-if="APP.closed" class="fixed inset-0 z-[115] grid place-items-center bg-muted/95 px-6 text-center"><div class="grid justify-items-center gap-3"><p class="text-sm text-muted-foreground">{{ PRODUCT.name }} closed (the phone shows its home screen).</p><Button variant="outline" @click="APP.closed=false">Open the app again</Button></div></div></Teleport>`
  };

  /* P55: the app's icon is the product mark on its default brand colour; the splash is the closed boot curtain (P8),
     so the first frame, the splash and the web view's first paint are the same picture. */
  const AppSplash = {
    setup() { return { APP, PRODUCT }; },
    template: `<Teleport to="body"><div v-if="APP.splash" class="fixed inset-0 z-[118] grid place-items-center" style="background:hsl(var(--curtain));color:hsl(var(--curtain-fg))" role="status" @click="APP.splash=false">
      <div class="grid justify-items-center"><span class="grid h-16 w-16 place-items-center rounded-2xl" style="background:hsl(var(--curtain-fg) / .15)"><BrandMark :size="30"/></span>
      <p class="mt-4 text-sm font-medium">Loading {{ PRODUCT.name }}…</p></div></div></Teleport>`
  };
  const AppIcon = {
    props: { size: { type: Number, default: 96 } },
    setup() { return { PRODUCT }; },
    template: `<span class="grid shrink-0 place-items-center bg-primary text-primary-foreground shadow-sm" :style="{ width: size + 'px', height: size + 'px', borderRadius: (size * 0.22) + 'px' }" :aria-label="PRODUCT.name + ' app icon'"><BrandMark :size="Math.round(size * 0.46)"/></span>`
  };

  /* ================================================================ THE PHONE KIT (P56–P70): what a phone is and how it moves
     Pieces the phone app needs that the web shell does not. In the app they sit over the page (fixed); in the Design system
     page `inline` draws them inside a phone mock. Each answers one movement of the phone (docs/mobile/PHONE_MODEL.md). */
  const PhoneMock = {   /* prototype-only: a phone outline for the Design system demos */
    template: `<div class="relative mx-auto h-[520px] w-[262px] shrink-0 overflow-hidden rounded-[28px] border-[5px] border-foreground/80 bg-background text-foreground shadow-lg">
      <div class="pointer-events-none absolute inset-x-0 top-0 z-[2] flex h-6 items-center justify-between px-4 text-[10px] font-medium tnum"><span>9:41</span><span class="flex items-center gap-1"><Icon name="Wifi" :size="10"/><Icon name="BatteryFull" :size="11"/></span></div>
      <slot/><div class="pointer-events-none absolute inset-x-0 bottom-0 z-[2] grid h-5 place-items-center"><span class="h-1 w-20 rounded-full bg-foreground/40"></span></div></div>`
  };

  /* P65: the lock. Away longer than the owner's setting, the app asks again (fingerprint, else PIN); signing out is always there. */
  const LockScreen = {
    props: { inline: Boolean, mode: { type: String, default: 'bio' } }, emits: ['unlock'],
    setup(p, { emit }) {
      const L = reactive({ mode: p.mode, pin: '' });
      const key = (d) => { if (L.pin.length < 4) L.pin += d; if (L.pin.length === 4) setTimeout(() => { L.pin = ''; emit('unlock'); }, 250); };
      return { L, key, PRODUCT };
    },
    template: `<div :class="[inline ? 'absolute' : 'fixed', 'inset-0 z-[112] grid grid-rows-[1fr_auto] bg-background px-6']" style="padding-top:calc(env(safe-area-inset-top,0px) + 2.5rem);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 1.5rem)" role="alertdialog" aria-modal="true" aria-label="Locked">
      <div class="grid content-center justify-items-center text-center"><span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><BrandMark :size="26"/></span>
        <h2 class="mt-5 text-xl font-semibold tracking-tight">{{ PRODUCT.name }} is locked</h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ L.mode==='bio' ? 'Use your fingerprint to open it.' : 'Enter your PIN.' }}</p>
        <div v-if="L.mode==='pin'" class="mt-5 flex gap-3" aria-hidden="true"><span v-for="n in 4" :key="n" :class="['h-3 w-3 rounded-full border', L.pin.length >= n ? 'border-primary bg-primary' : 'border-muted-foreground/50']"></span></div></div>
      <div class="grid gap-3">
        <template v-if="L.mode==='bio'"><Button size="lg" class="h-12 w-full" @click="$emit('unlock')"><Icon name="Fingerprint" :size="18"/>Use fingerprint</Button><Button variant="ghost" class="w-full" @click="L.mode='pin'">Use PIN instead</Button></template>
        <template v-else><div class="mx-auto grid w-full max-w-[15rem] grid-cols-3 gap-2"><button v-for="d in ['1','2','3','4','5','6','7','8','9','','0','<']" :key="d" type="button" :disabled="!d" :aria-label="d==='<' ? 'Delete' : d" class="grid h-12 place-items-center rounded-full border text-lg font-medium tnum hover:bg-accent disabled:invisible" @click="d==='<' ? L.pin = L.pin.slice(0, -1) : key(d)"><Icon v-if="d==='<'" name="Delete" :size="18"/><template v-else>{{ d }}</template></button></div><Button variant="ghost" class="w-full" @click="L.mode='bio'; L.pin=''">Use fingerprint</Button></template>
        <button type="button" class="justify-self-center text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">Sign out</button></div></div>`
  };

  /* P57: the server ended the session (not the signal). What the person had open stays on the phone for this account. */
  const SessionExpired = {
    props: { inline: Boolean }, emits: ['signin'],
    setup() { return { PRODUCT }; },
    template: `<div :class="[inline ? 'absolute' : 'fixed', 'inset-0 z-[111] grid place-items-center bg-background px-6']" style="padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)" role="alertdialog" aria-modal="true" aria-labelledby="se-title">
      <div class="grid max-w-sm justify-items-center text-center"><span class="grid h-14 w-14 place-items-center rounded-full bg-warning/15 text-warning"><Icon name="LockKeyhole" :size="26"/></span>
        <h2 id="se-title" class="mt-5 text-xl font-semibold tracking-tight">You were signed out</h2>
        <p class="mt-2 text-sm text-muted-foreground">For safety, {{ PRODUCT.name }} asks you to sign in again. What you had open is kept on this phone for this account.</p>
        <Button size="lg" class="mt-6 h-12 w-full" @click="$emit('signin')"><Icon name="LogIn" :size="16"/>Sign in again</Button></div></div>`
  };

  /* P63: a permission is asked at the moment of need, with the reason first and what stops without it. Denied for good: Settings. */
  const PERM = {
    camera: { icon: 'Camera', ask: 'Allow the camera?', why: 'To scan a product barcode and to photograph a receipt. Photos are not kept on the phone.', without: 'Without it you can type the code instead.', off: 'The camera is off for' },
    bluetooth: { icon: 'Printer', ask: 'Allow Bluetooth?', why: 'To find your receipt printer and print on it.', without: 'Without it a receipt can be shared as text instead.', off: 'Bluetooth is off for' },
    notifications: { icon: 'BellRing', ask: 'Turn on notifications?', why: 'To tell you when something needs you, even with the app closed.', without: 'Without them you see alerts only when you open the app.', off: 'Notifications are off for' },
  };
  const PermissionCard = {
    props: { kind: { type: String, default: 'camera' }, state: { type: String, default: 'ask' } }, emits: ['allow', 'later', 'settings'],
    setup(p) { return { PERM, PRODUCT }; },
    template: `<div class="grid justify-items-center p-6 text-center">
      <span :class="['grid h-12 w-12 place-items-center rounded-full', state==='forever' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary']"><Icon :name="state==='forever' ? 'ShieldOff' : PERM[kind].icon" :size="22"/></span>
      <h2 class="mt-4 text-lg font-semibold">{{ state==='forever' ? PERM[kind].off + ' ' + PRODUCT.name : PERM[kind].ask }}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{{ state==='forever' ? 'Android will not ask again. You can turn it on in Settings.' : PERM[kind].why }}</p>
      <p class="mt-3 flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground"><Icon name="Info" :size="14" class="mt-0.5 shrink-0"/>{{ PERM[kind].without }}</p>
      <div class="mt-5 grid w-full gap-2"><Button v-if="state==='ask'" size="lg" @click="$emit('allow')">Allow</Button><Button v-else size="lg" @click="$emit('settings')"><Icon name="Settings" :size="16"/>Open Settings</Button><Button size="lg" variant="ghost" @click="$emit('later')">Not now</Button></div></div>`
  };

  /* P64: the actions a phone has that a desktop does not: call, SMS, WhatsApp, copy. A bottom sheet, 52px rows, Cancel last. */
  const ActionSheet = {
    props: { open: Boolean, inline: Boolean, title: String, sub: String, actions: Array }, emits: ['update:open', 'pick'],
    setup(p, { emit }) { useOverlayEsc(p, emit); },
    template: `<Teleport to="body" :disabled="inline"><Transition name="fade"><div v-if="open" :class="[inline ? 'absolute' : 'fixed', 'inset-0 z-[96] flex items-end']"><div class="absolute inset-0 bg-black/60" @click="$emit('update:open', false)"></div>
      <div role="dialog" aria-modal="true" :aria-label="title" class="pop relative w-full rounded-t-2xl border-t bg-background px-3 pt-2 shadow-lg" style="padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))">
        <span class="mx-auto mb-2 block h-1 w-9 rounded-full bg-muted-foreground/30" aria-hidden="true"></span>
        <div class="px-2 pb-2"><p class="text-sm font-semibold">{{ title }}</p><p v-if="sub" class="text-xs text-muted-foreground tnum">{{ sub }}</p></div>
        <button v-for="a in actions" :key="a.id" type="button" class="flex h-[52px] w-full items-center gap-3 rounded-lg px-2 text-left text-sm font-medium hover:bg-accent" @click="$emit('pick', a); $emit('update:open', false)"><span class="grid h-9 w-9 place-items-center rounded-lg bg-muted"><Icon :name="a.icon" :size="17"/></span><span class="flex-1">{{ a.label }}</span><span v-if="a.hint" class="text-xs font-normal text-muted-foreground">{{ a.hint }}</span></button>
        <Button variant="outline" size="lg" class="mt-1 h-11 w-full" @click="$emit('update:open', false)">Cancel</Button></div></div></Transition></Teleport>`
  };

  /* P64: scan a barcode. Dark, full screen; the code can always be typed instead (no camera permission, or a worn label). */
  const ScanView = {
    props: { inline: Boolean, mode: { type: String, default: 'single' }, count: { type: Number, default: 0 } }, emits: ['close', 'type', 'done'],
    setup() { const S = reactive({ torch: false }); return { S }; },
    template: `<div :class="[inline ? 'absolute' : 'fixed', 'inset-0 z-[108] flex flex-col bg-black text-white']" role="dialog" aria-modal="true" aria-label="Scan a barcode" style="padding-top:env(safe-area-inset-top,0px)">
      <div class="flex h-14 items-center justify-between px-2"><button type="button" class="grid h-10 w-10 place-items-center rounded-full bg-white/15" aria-label="Close" @click="$emit('close')"><Icon name="X" :size="18"/></button><p class="text-sm font-medium">Scan a barcode</p>
        <button type="button" :aria-pressed="S.torch" aria-label="Light" :class="['grid h-10 w-10 place-items-center rounded-full', S.torch ? 'bg-white text-black' : 'bg-white/15']" @click="S.torch = !S.torch"><Icon name="Flashlight" :size="17"/></button></div>
      <div class="grid flex-1 place-items-center px-6"><div class="relative h-36 w-full max-w-[17rem]"><span class="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-white"></span><span class="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-white"></span><span class="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-white"></span><span class="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-white"></span>
        <span class="absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary shadow-[0_0_12px_hsl(var(--primary))]"></span></div></div>
      <p class="px-6 pb-3 text-center text-sm text-white/80">{{ mode==='multi' ? 'Keep scanning: each code is added.' : 'Point at the barcode. It reads by itself.' }}</p>
      <div class="grid gap-2 px-4" style="padding-bottom:calc(1rem + env(safe-area-inset-bottom,0px))"><Button v-if="mode==='multi'" size="lg" class="h-12 w-full" @click="$emit('done')"><Icon name="Check" :size="16"/>Done · {{ count }} scanned</Button>
        <Button size="lg" variant="secondary" class="h-12 w-full" @click="$emit('type')"><Icon name="Keyboard" :size="16"/>Type the code instead</Button></div></div>`
  };

  /* P64: choose the receipt printer. Bonded printers only; the choice is remembered; each failure says what to do. */
  const PrinterCard = {
    props: { state: { type: String, default: 'list' } }, emits: ['use', 'test', 'settings'],
    setup() { const R = reactive({ sel: 'rpp', remember: true }); const list = [{ id: 'rpp', name: 'RPP02N', mac: '66:12:8A:0B:7C:41', last: true }, { id: 'mtp', name: 'MTP-II', mac: '00:11:22:33:AA:BB' }]; return { R, list }; },
    template: `<div class="grid gap-3 p-5">
      <div><h2 class="text-lg font-semibold">Receipt printer</h2><p class="text-sm text-muted-foreground">{{ state==='list' ? 'Printers paired with this phone.' : state==='off' ? 'Bluetooth is off.' : 'No printer is paired yet.' }}</p></div>
      <template v-if="state==='list'"><div class="grid gap-1.5" role="radiogroup" aria-label="Printer"><button v-for="p in list" :key="p.id" type="button" role="radio" :aria-checked="R.sel===p.id" :class="['flex h-14 items-center gap-3 rounded-lg border px-3 text-left', R.sel===p.id ? 'border-primary bg-primary/5' : 'hover:bg-accent']" @click="R.sel = p.id"><span class="grid h-9 w-9 place-items-center rounded-lg bg-muted"><Icon name="Printer" :size="17"/></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ p.name }}</span><span class="block font-mono text-[11px] text-muted-foreground">{{ p.mac }}</span></span><Badge v-if="p.last" variant="secondary">Last used</Badge><Icon v-if="R.sel===p.id" name="CircleCheck" :size="18" class="text-primary"/></button></div>
        <label class="flex items-center justify-between gap-3 text-sm"><span>Remember this printer</span><Switch v-model="R.remember" aria-label="Remember this printer"/></label>
        <div class="grid grid-cols-2 gap-2"><Button variant="outline" size="lg" @click="$emit('test')"><Icon name="FileText" :size="15"/>Test print</Button><Button size="lg" @click="$emit('use')">Use this printer</Button></div></template>
      <div v-else class="grid justify-items-center gap-3 rounded-xl border border-dashed p-6 text-center"><span class="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="state==='off' ? 'BluetoothOff' : 'Printer'" :size="20"/></span>
        <p class="text-sm text-muted-foreground">{{ state==='off' ? 'Turn Bluetooth on to find your printer.' : 'Pair it in Android’s Bluetooth settings first, then come back here.' }}</p><Button size="lg" variant="outline" @click="$emit('settings')"><Icon name="Settings" :size="15"/>{{ state==='off' ? 'Turn Bluetooth on' : 'Open Bluetooth settings' }}</Button></div></div>`
  };

  /* P58/P59: how old what is on screen is. After a return it says "Updated just now"; with no signal, how old the data is. */
  const StaleStamp = {
    props: { ago: { type: String, default: 'just now' }, offline: Boolean }, emits: ['refresh'],
    template: `<p class="flex items-center gap-2 text-xs text-muted-foreground tnum" role="status"><span :class="['h-1.5 w-1.5 shrink-0 rounded-full', offline ? 'bg-warning' : 'bg-c1']"></span><span class="min-w-0 flex-1 truncate">{{ offline ? 'Offline · showing data from ' + ago : 'Updated ' + ago }}</span><button type="button" class="inline-flex h-10 items-center gap-1 px-2 font-medium text-primary" @click="$emit('refresh')"><Icon name="RotateCw" :size="12"/>Refresh</button></p>`
  };

  /* P62: the primary action stays above the keyboard and the gesture bar. */
  const BottomBar = {
    props: { note: String },
    template: `<div class="sticky bottom-0 z-10 -mx-3 border-t bg-background/95 px-3 pt-2.5 backdrop-blur" style="padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))"><p v-if="note" class="mb-1.5 text-xs text-muted-foreground tnum">{{ note }}</p><div class="flex gap-2"><slot/></div></div>`
  };

  /* prototype-only: a stand-in for the Android keyboard, so the Phone movements can show the field and the action above it */
  const KeyboardSim = {
    template: `<div class="fixed inset-x-0 bottom-0 z-[130] grid h-[270px] content-center gap-2 border-t bg-muted px-2 pb-2 pt-3 text-center text-xs text-muted-foreground" aria-hidden="true"><div v-for="r in 4" :key="r" class="grid grid-cols-10 gap-1.5"><span v-for="c in (r===4 ? 5 : 10)" :key="c" :class="['h-9 rounded-md bg-background shadow-sm', r===4 && c===3 && 'col-span-5']"></span></div><p class="pt-1">Keyboard (prototype stand-in)</p></div>`
  };

  /* the overlays the phone states open; mounted once in ShellView */
  const PhoneOverlays = {
    setup() {
      const actions = [{ id: 'call', icon: 'Phone', label: 'Call', hint: '+255 754 112 908' }, { id: 'wa', icon: 'MessageCircle', label: 'WhatsApp' }, { id: 'sms', icon: 'MessageSquare', label: 'Send SMS' }, { id: 'copy', icon: 'Copy', label: 'Copy number' }];
      const pick = (a) => G.toast(a.id === 'copy' ? 'Number copied' : a.label, a.id === 'copy' ? '+255 754 112 908' : 'Opening the ' + a.label.toLowerCase() + ' app…', a.icon);
      /* P62: Android resizes the view when the keyboard opens; the prototype stand-in does it with --kbd, which the dialog and the sticky bottom bar honour */
      watch(() => APP.kbd, (on) => { document.documentElement.style.setProperty('--kbd', on ? '270px' : '0px'); }, { immediate: true });
      return { APP, G, actions, pick };
    },
    template: `<div>
      <LockScreen v-if="APP.locked" @unlock="APP.locked = false; G.toast('Unlocked', '', 'LockOpen')"/>
      <SessionExpired v-if="APP.expired" @signin="APP.expired = false; G.toast('Signed in', 'Back where you were', 'LogIn')"/>
      <ScanView v-if="APP.scan" :mode="APP.scan" :count="APP.scan==='multi' ? 3 : 0" @close="APP.scan = false" @type="APP.scan = false; G.toast('Type the code', 'The field is ready', 'Keyboard')" @done="APP.scan = false; G.toast('3 products added', '', 'Check')"/>
      <Dialog :open="!!APP.perm" @update:open="v => { if (!v) APP.perm = null }"><PermissionCard v-if="APP.perm" :kind="APP.perm.kind" :state="APP.perm.state" @allow="APP.perm = null; G.toast('Allowed', '', 'Check')" @later="APP.perm = null" @settings="APP.perm = null; G.toast('Opening Settings', 'Turn it on, then come back', 'Settings')"/></Dialog>
      <Dialog :open="!!APP.printers" @update:open="v => { if (!v) APP.printers = null }"><PrinterCard v-if="APP.printers" :state="APP.printers" @use="APP.printers = null; G.toast('Printer chosen', 'RPP02N is remembered', 'Printer')" @test="G.toast('Test page sent', 'RPP02N', 'FileText')" @settings="APP.printers = null; G.toast('Opening Settings', '', 'Settings')"/></Dialog>
      <ActionSheet :open="APP.sheet==='phone'" @update:open="v => { if (!v) APP.sheet = null }" title="Peter Ngowi" sub="+255 754 112 908" :actions="actions" @pick="pick"/>
      <KeyboardSim v-if="APP.kbd"/></div>`
  };

  /* The Screens pill's "Phone app" group: each state on a page where it belongs. */
  function appState(k) {
    Object.assign(APP, { on: true, conn: null, checking: false, update: null, later: false, askNotifs: false, hint: false, closed: false, splash: false, perm: null, expired: false, locked: false, sheet: null, scan: false, printers: null, stale: null, kbd: false }); G.newOrg = false;
    const home = () => { if (!G.isShell(G.route) || G.route === 'design') nav('dashboard'); };
    if (k === 'conn-page') { nav('members'); setTimeout(() => { APP.conn = 'page'; }, 50); }
    else if (k === 'conn-banner') { home(); APP.conn = 'banner'; }
    else if (k === 'update') { home(); APP.update = 'available'; }
    else if (k === 'update-required') { home(); APP.update = 'required'; }
    else if (k === 'notifs') { home(); APP.askNotifs = true; }
    else if (k === 'notifs-settings') { home(); G.myNotifs = true; }
    else if (k === 'back') { nav('dashboard'); setTimeout(() => { TRAIL.length = 0; backAt = 0; phoneBack(); }, 50); }
    else if (k === 'splash') { APP.splash = true; }
    /* the Phone movements (docs/mobile/PHONE_MODEL.md): each one is what the phone does, and what the app does about it */
    else if (k === 'sig-lost') { home(); APP.conn = 'banner'; APP.stale = 'offline'; }
    else if (k === 'sig-back') { home(); G.toast('Back online', 'What is on screen was refreshed', 'Wifi'); APP.stale = 'fresh'; }
    else if (k === 'resume') { home(); APP.stale = 'fresh'; G.toast('Welcome back', 'Refreshed what was on screen · session checked', 'RotateCw'); }
    else if (k === 'kill') { APP.splash = true; setTimeout(() => { APP.splash = false; home(); G.toast('Back where you were', 'Your cart and drafts are back', 'History'); }, 1500); }
    else if (k === 'expired') { home(); APP.expired = true; }
    else if (k === 'lock') { home(); APP.locked = true; }
    else if (k === 'perm-camera') { home(); APP.perm = { kind: 'camera', state: 'ask' }; }
    else if (k === 'perm-denied') { home(); APP.perm = { kind: 'camera', state: 'forever' }; }
    else if (k === 'scan') { home(); APP.scan = 'single'; }
    else if (k === 'scan-multi') { home(); APP.scan = 'multi'; }
    else if (k === 'printers') { home(); APP.printers = 'list'; }
    else if (k === 'printers-none') { home(); APP.printers = 'none'; }
    else if (k === 'printers-off') { home(); APP.printers = 'off'; }
    else if (k === 'actions') { nav('members'); setTimeout(() => { APP.sheet = 'phone'; }, 60); }
    else if (k === 'keyboard') { home(); G.newOrg = true; setTimeout(() => { APP.kbd = true; }, 80); }
  }
  G.appState = appState;
