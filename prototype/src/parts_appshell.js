
  /* ================================================================ THE PHONE APP (P51–P55)
     The same shell inside a product's Android app (NativePHP web view, online only). These states exist only there.
     The Screens pill's "Phone app" group opens each one; inside the phone frame the app is always on. */
  const APP = reactive({ on: IN_PHONE, conn: null, checking: false, update: null, later: false, askNotifs: false, notifs: false, hint: false, closed: false, splash: false });
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

  /* The Screens pill's "Phone app" group: each state on a page where it belongs. */
  function appState(k) {
    Object.assign(APP, { on: true, conn: null, checking: false, update: null, later: false, askNotifs: false, hint: false, closed: false, splash: false });
    const home = () => { if (!G.isShell(G.route) || G.route === 'design') nav('dashboard'); };
    if (k === 'conn-page') { nav('members'); setTimeout(() => { APP.conn = 'page'; }, 50); }
    else if (k === 'conn-banner') { home(); APP.conn = 'banner'; }
    else if (k === 'update') { home(); APP.update = 'available'; }
    else if (k === 'update-required') { home(); APP.update = 'required'; }
    else if (k === 'notifs') { home(); APP.askNotifs = true; }
    else if (k === 'notifs-settings') { home(); G.myNotifs = true; }
    else if (k === 'back') { nav('dashboard'); setTimeout(() => { TRAIL.length = 0; backAt = 0; phoneBack(); }, 50); }
    else if (k === 'splash') { APP.splash = true; }
  }
  G.appState = appState;
