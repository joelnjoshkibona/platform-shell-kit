/* ---------------------------------------------------------------- motion (prototype for review): the shared pieces
   Tokens are CSS (assemble.py): --dur-fast 120ms · --dur-base 180ms · --dur-slow 280ms · --ease-standard · --ease-exit.
   Motion explains a change: something arrives, leaves, moves, changes or was refused. Nothing loops (spinners aside),
   nothing moves on hover. Under prefers-reduced-motion everything here is off: values jump, nothing shakes or staggers,
   dialogs and rows appear and go at once.
     motionMs(ms)          ms, or 0 under reduced motion (for waits that hold an element on screen while it leaves)
     motionShake(el)       one 6px shake, 300ms (a refused value)
     motionInvalid(root)   after a refused submit: focus the first field that shows an error and shake it once
     <Num :value :format>  a number that tweens to its new value (400ms, ease-out, tabular figures); first render does not count up
     <Collapse>            wraps one v-if child: height + fade in (180ms) and out (135ms)
     <TabPanel :name>      a tab's content: a 120ms fade when the tab changes (not on first render)
     useListMotion(...)    ListRows: first-load rise stagger, new-row highlight, changed-row flash, deleted-row collapse */
const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionMs = (ms) => (reducedMotion() ? 0 : ms);
const EASE_STD = 'cubic-bezier(.2,.8,.2,1)', EASE_EXIT = 'cubic-bezier(.4,0,1,1)';

function motionShake(el) {
  if (!el || !el.animate || reducedMotion()) return;
  el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
    { duration: 300, easing: 'ease-in-out' });
}
function motionInvalid(root) {
  nextTick(() => {
    const r = typeof root === 'string' ? document.querySelector(root) : root; if (!r) return;
    const msgs = [...r.querySelectorAll('p.text-destructive, [data-field-error]')].filter(x => !x.matches('[role=alert]') && x.offsetParent !== null);
    const msg = msgs[0]; if (!msg) return;
    const field = msg.closest('.grid') || msg.parentElement;
    const input = field && field.querySelector('input:not([type=hidden]):not([disabled]), textarea, select, button[role=combobox], [contenteditable=true]');
    if (input) input.focus({ preventScroll: false });
    motionShake(field);
  });
}

const Num = {
  props: { value: [Number, String], format: { type: Function, default: null } },
  setup(p) {
    const shown = ref(p.value); let raf = 0;
    const isNum = (v) => typeof v === 'number' && isFinite(v);
    watch(() => p.value, (to, from) => {
      cancelAnimationFrame(raf);
      if (!isNum(to) || !isNum(from) || to === from || reducedMotion()) { shown.value = to; return; }
      const t0 = performance.now(), d = 400, whole = Number.isInteger(to) && Number.isInteger(from);
      const step = (now) => {
        const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3), v = from + (to - from) * e;
        shown.value = k < 1 ? (whole ? Math.round(v) : Math.round(v * 100) / 100) : to;
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    onBeforeUnmount(() => cancelAnimationFrame(raf));
    const text = computed(() => (p.format ? p.format(shown.value) : shown.value));
    return { text };
  },
  template: `<span class="tnum" data-num>{{ text }}</span>`
};

/* height + fade for one v-if child; the box's own padding and margins collapse with it */
function heightKeys(el) { const cs = getComputedStyle(el); return { height: el.scrollHeight + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, marginBottom: cs.marginBottom, opacity: 1 }; }
const ZERO_H = { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', marginBottom: '0px', opacity: 0 };
function collapseIn(el, done, ms = 180) {
  if (reducedMotion() || !el.animate) return done();
  const full = heightKeys(el); el.style.overflow = 'hidden';
  const a = el.animate([ZERO_H, full], { duration: ms, easing: EASE_STD });
  a.onfinish = a.oncancel = () => { el.style.overflow = ''; done(); };
}
function collapseOut(el, done, ms = 135) {
  if (reducedMotion() || !el.animate) return done();
  const cs = getComputedStyle(el);
  const full = { height: el.offsetHeight + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, marginBottom: cs.marginBottom, opacity: 1 };
  el.style.overflow = 'hidden';
  const a = el.animate([full, ZERO_H], { duration: ms, easing: EASE_EXIT, fill: 'forwards' });
  a.onfinish = a.oncancel = () => done();
}
const Collapse = {
  props: { duration: { type: Number, default: 180 } },
  setup(p) { return { enter: (el, done) => collapseIn(el, done, p.duration), leave: (el, done) => collapseOut(el, done, Math.round(p.duration * 0.75)) }; },
  template: `<Transition :css="false" @enter="enter" @leave="leave"><slot/></Transition>`
};

const TabPanel = {
  props: { name: String, cls: { type: String, default: 'grid grid-cols-[minmax(0,1fr)] gap-4' } },
  setup(p) { const switched = ref(false); watch(() => p.name, () => { switched.value = true; }); return { switched }; },
  template: `<div :key="name" :class="[cls, switched && 'tab-in']" data-tabpanel><slot/></div>`
};

/* ListRows: what changed between two renders of the same query decides the motion.
   Same query (filters, sort, search, scope) and only rows added → highlight them; only rows removed → they collapse;
   same rows with different data → they flash once. A changed query (filtering, sorting, searching) moves nothing. */
function useListMotion(rows, keyOf, sigOf) {
  const M = reactive({ first: true, live: false, flash: {} });
  const timers = {};
  const hash = (r) => { try { return JSON.stringify(r); } catch (e) { return ''; } };
  const snap = () => rows().slice(0, 200).map(r => [keyOf(r), hash(r)]);
  let prev = snap(), prevSig = sigOf();   // the rows as first drawn: the first change is compared with them
  function mark(k, kind) {
    clearTimeout(timers[k]); delete M.flash[k];
    nextTick(() => { M.flash[k] = kind; timers[k] = setTimeout(() => { delete M.flash[k]; }, 1300); });
  }
  watch(() => [snap(), sigOf()], ([now, sig]) => {
    const before = new Map(prev), after = new Map(now);
    const added = now.filter(([k]) => !before.has(k)).map(([k]) => k), removed = prev.filter(([k]) => !after.has(k)).map(([k]) => k);
    M.live = !reducedMotion() && sig === prevSig && !(added.length && removed.length) && added.length <= 5 && removed.length <= 20;
    if (M.live && prev.length) {
      added.forEach(k => mark(k, 'new'));
      if (!added.length && !removed.length) now.forEach(([k, h]) => { if (before.has(k) && before.get(k) !== h) mark(k, 'changed'); });
    }
    prev = now; prevSig = sig;
  }, { flush: 'pre' });
  let firstT = null;
  onMounted(() => { if (reducedMotion()) { M.first = false; return; } firstT = setTimeout(() => { M.first = false; }, 8 * 30 + 450); });
  onBeforeUnmount(() => { clearTimeout(firstT); Object.values(timers).forEach(clearTimeout); });
  const itemClass = (r, i) => [M.first && i < 8 && 'lr-rise', M.flash[keyOf(r)] === 'new' && 'lr-new', M.flash[keyOf(r)] === 'changed' && 'lr-changed'];
  const itemStyle = (i) => (M.first && i < 8 ? { animationDelay: i * 30 + 'ms' } : null);
  const leave = (el, done) => (M.live ? collapseOut(el, done, 180) : done());
  return { M, itemClass, itemStyle, leave, mark };
}
