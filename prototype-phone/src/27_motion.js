/* ============================================================ P118 phone motion: SplashOpen, PageTransition (in Screen, 90_root.js), DoneMoment
   One token set (P116, in 00_head.html). The navigation chooses the page motion (S.nav: go = push, back = pop, tab = fade); a screen never does.
   Nothing waits for an animation: a tap during a slide lands on the new screen. Reduced motion (the system, or the Picker's switch) turns it all off. */

/* An example P114 boot loader: one colour (currentColor), CSS motion only. It builds a generic mark (three bars, then the roof) while the
   curtain is closed; at most 150px wide. A product passes its own. */
const BootMark = { props: { size: { type: Number, default: 112 } },
  template: `<svg class="boot-mark" :width="size" :height="size" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
    <path class="roof" d="M10 26 L32 12 L54 26 Z" opacity=".95"/>
    <rect class="b1" x="14" y="34" width="9" height="18" rx="2" opacity=".7"/><rect class="b2" x="27.5" y="28" width="9" height="24" rx="2" opacity=".85"/><rect class="b3" x="41" y="22" width="9" height="30" rx="2"/></svg>` };

/* SplashOpen: the native splash (P55) is the closed curtain; the first web frame matches it. When the app is ready the curtain opens:
   a circle closes into the mark, at most 520ms. It never holds a ready app. Reduced motion: a 120ms fade. */
let splashT = [];
function splashPlay(auto = true) {
  splashT.forEach(clearTimeout); splashT = []; S.splash = 'closed';
  if (auto) { splashT.push(setTimeout(() => (S.splash = 'opening'), 1100)); splashT.push(setTimeout(() => (S.splash = null), 1100 + 540)); }   /* 1100ms stands in for "the app is ready" */
}
const SplashOpen = { components: { BootMark },
  setup() { return { S }; },
  template: `<div v-if="S.splash" :class="['splash', S.splash === 'opening' ? 'opening' : '']" role="status" aria-label="Opening Bootbox">
    <div class="flex flex-col items-center"><BootMark :size="112"/><p class="mt-5 text-sm font-medium opacity-80">Loading Bootbox…</p></div></div>` };

/* DoneMoment: after a write that matters (a record to hand over, goods out, stock received, a payment) instead of the toast. The ring and
   the tick draw (420ms), a soft burst; then the title, the number, what happens next, the facts and the next actions. */
function done(d) { S.done = d; }
const DoneMoment = { components: { Icon, Btn },
  setup() { const act = (a) => { S.done = null; a && a[1] && a[1](); }; return { S, act }; },
  template: `<transition name="fade"><div v-if="S.done" class="absolute inset-0 z-[85] flex flex-col bg-background" role="status">
    <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center" :style="{ paddingTop: 'var(--sa-top)' }">
      <div class="relative grid h-32 w-32 place-items-center"><span class="ok-burst absolute inset-4 rounded-full bg-success/25"></span>
        <svg viewBox="0 0 72 72" class="relative h-28 w-28"><circle cx="36" cy="36" r="30" fill="none" stroke="hsl(var(--success))" stroke-width="4" class="ok-ring" stroke-linecap="round" transform="rotate(-90 36 36)"/><path d="M23 37 l9 9 l17 -19" fill="none" stroke="hsl(var(--success))" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="ok-tick"/></svg></div>
      <h2 class="rise-late mt-4 text-[22px] font-bold tracking-tight" style="--i: 0">{{ S.done.title }}</h2>
      <p v-if="S.done.ref" class="rise-late mt-1 font-mono text-sm font-semibold text-primary" style="--i: 1">{{ S.done.ref }}</p>
      <p class="rise-late mt-2 text-sm text-muted-foreground" style="--i: 2">{{ S.done.text }}</p>
      <div v-if="S.done.facts" class="rise-late mt-5 w-full overflow-hidden rounded-xl border bg-card text-left" style="--i: 3"><div v-for="f in S.done.facts" :key="f[0]" class="flex justify-between border-t px-4 py-2.5 text-sm first:border-t-0"><span class="text-muted-foreground">{{ f[0] }}</span><span class="font-semibold tnum">{{ f[1] }}</span></div></div></div>
    <div class="grid gap-2 px-4 pt-3" :style="{ paddingBottom: 'calc(14px + var(--sa-bottom))' }">
      <Btn v-if="S.done.primary" full class="h-12" @click="act(S.done.primary)"><Icon :name="S.done.primary[2]" :size="17"/>{{ S.done.primary[0] }}</Btn>
      <Btn v-if="S.done.secondary" v="outline" full class="h-12" @click="act(S.done.secondary)"><Icon :name="S.done.secondary[2]" :size="17"/>{{ S.done.secondary[0] }}</Btn>
      <Btn v="ghost" full class="h-11" @click="act(null)">Close</Btn></div></div></transition>` };
