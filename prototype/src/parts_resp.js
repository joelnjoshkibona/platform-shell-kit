/* ---------------------------------------------------------------- mock responses (seeded, example data) */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = rng(20261010);
const pickW = (items, w) => { let r = rnd() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };
const SECS = [sec1, sec2, sec3];
const Q = Object.fromEntries(SECS.flatMap(s => s.questions.map(q => [q.key, Object.assign(q, { _sec: s.key })])));
const [qTenure, qBranch, qRole] = sec1.questions, [qPay, qTF, qConf] = sec2.questions, [qScale, qRate, qShift] = sec3.questions;
const FIRST = ['Amina', 'Baraka', 'Neema', 'Juma', 'Rehema', 'Hamisi', 'Zawadi', 'Daudi', 'Upendo', 'Saidi', 'Faraja', 'Mussa', 'Grace', 'Emmanuel', 'Halima', 'Joseph', 'Mwanaidi', 'Peter', 'Asha', 'Godfrey', 'Tumaini', 'Salma', 'Elia', 'Happiness'];
const LAST = ['Juma', 'Mushi', 'Kimaro', 'Mrema', 'Mwakyusa', 'Swai', 'Lyimo', 'Massawe', 'Mollel', 'Ngowi', 'Shirima', 'Temba', 'Urio', 'Kweka', 'Minja', 'Laizer'];
const RESP = [];
const start = new Date('2026-10-01T08:00:00+03:00').getTime();
for (let i = 0; i < 142; i++) {
  const fn = FIRST[Math.floor(rnd() * FIRST.length)], ln = LAST[Math.floor(rnd() * LAST.length)];
  const email = `${fn}.${ln}${i % 7 === 0 ? i : ''}`.toLowerCase() + '@kilimaretail.co.tz';
  const a = {}, visited = [sec1.key];
  const ten = pickW(qTenure.options, [14, 38, 48]); a[qTenure.key] = ten.key;
  a[qBranch.key] = pickW(qBranch.options, [30, 46, 22, 26]).key;
  a[qRole.key] = pickW(qRole.options, [40, 52, 14, 18]).key;
  const skip = ten.go_to === sec3.key;
  const exp = ten.label.startsWith('More') ? 1 : 0;
  if (!skip) {
    visited.push(sec2.key);
    a[qPay.key] = qPay.options.filter((o, k) => rnd() < [0.98, 0.93, 0.71, 0.66, 0.48 + exp * 0.2, 0.09][k]).map(o => o.key);
    if (!a[qPay.key].length) a[qPay.key] = [qPay.options[0].key];
    a[qTF.key] = rnd() < 0.31 - exp * 0.12 ? qTF.options[0].key : qTF.options[1].key;
    a[qConf.key] = Object.fromEntries(qConf.rows.map((r, k) => [r.key, pickW(qConf.columns, [[18, 44, 38], [26, 46, 28], [34, 41, 25]][k].map((w, j) => w + (j === 2 ? exp * 18 : 0))).key]));
  }
  visited.push(sec3.key);
  a[qScale.key] = pickW([1, 2, 3, 4, 5], [4, 9, 24, 41, 22]);
  if (rnd() < 0.88) a[qRate.key] = pickW([1, 2, 3, 4, 5], [2, 6, 21, 44, 27]);
  if (rnd() < 0.8) a[qShift.key] = Object.fromEntries(qShift.rows.map((r, k) => [r.key, qShift.columns.filter((c, j) => rnd() < (k === 0 ? [0.72, 0.7, 0.68, 0.66, 0.74, 0.58] : [0.42, 0.4, 0.45, 0.47, 0.6, 0.81])[j]).map(c => c.key)]));
  const t = start + Math.floor(Math.pow(rnd(), 0.8) * 9.4 * 86400000);
  let status = 'submitted', reason = 'manual', violations = rnd() < 0.82 ? 0 : rnd() < 0.6 ? 1 : 2;
  if (i % 23 === 5) { status = 'auto'; reason = 'timer_expired'; }
  if (i % 31 === 9) { status = 'auto'; reason = 'violation_limit'; violations = 3; }
  if (i === 17 || i === 88) { status = 'voided'; reason = 'violation'; violations = 1; }
  const dur = Math.round((skip ? 360 : 540) + rnd() * 420 + (status === 'auto' && reason === 'timer_expired' ? 300 : 0));
  const events = [];
  for (let v = 0; v < violations; v++) events.push({ type: pickW(['tab_hidden', 'fullscreen_exit', 'copy_attempt'], [5, 3, 2]), at: Math.round(dur * (0.2 + rnd() * 0.7)) });
  events.sort((x, y) => x.at - y.at);
  RESP.push({ id: '01JA' + (1000 + i).toString(36).toUpperCase() + Math.floor(rnd() * 1e8).toString(36).toUpperCase(), email, name: fn + ' ' + ln, at: new Date(t), duration: dur, status, reason, violations, events, answers: a, visited, reset: false });
}
RESP.sort((x, y) => y.at - x.at);

/* ---------------------------------------------------------------- store */
const VIEWS = {
  bars: { label: 'Bars', icon: 'ChartBarBig' }, donut: { label: 'Donut', icon: 'ChartPie' }, columns: { label: 'Columns', icon: 'ChartColumn' },
  summary: { label: 'Average', icon: 'Star' }, stacked: { label: '100% stacked', icon: 'ChartBarStacked' }, heatmap: { label: 'Heatmap', icon: 'Grid3x3' }, table: { label: 'Table', icon: 'Table2' },
};
const TYPE_VIEWS = {
  single_choice: ['bars', 'donut', 'table'], dropdown: ['bars', 'donut', 'table'], true_false: ['donut', 'bars', 'table'],
  multi_choice: ['bars', 'table'], linear_scale: ['columns', 'bars', 'table'], rating: ['summary', 'columns', 'table'],
  choice_grid: ['stacked', 'heatmap', 'table'], checkbox_grid: ['heatmap', 'table'],
};
const S = reactive({
  sub: 'summary', accepting: true, views: {}, filters: [], range: 'all', search: '', statusF: 'all', page: 1,
  open: null, confirmVoid: false, theme: 'system', toasts: [], tip: null, exportBusy: false, savedHint: false, addFilter: { q: null },
});
function toast(title, desc = '', icon = 'CircleCheck') { const t = { id: ulid('t'), title, desc, icon }; S.toasts.push(t); setTimeout(() => { S.toasts = S.toasts.filter(x => x.id !== t.id) }, 3400); }
G.respToast = toast;
function applyTheme(mode) { const r = document.documentElement; if (mode === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', mode); }

const fmtDur = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
const fmtDate = (d) => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;
const compact = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K' : String(n);
const optLabel = (q, k) => (q.options.find(o => o.key === k) || {}).label || '';

/* filtering */
const RANGES = [{ value: 'all', label: 'All time' }, { value: '7', label: 'Last 7 days' }, { value: '3', label: 'Last 3 days' }];
const NOW = new Date('2026-10-10T15:00:00+03:00').getTime();
const filtered = computed(() => RESP.filter(r => {
  if (S.range !== 'all' && r.at.getTime() < NOW - (+S.range) * 86400000) return false;
  return S.filters.every(f => { const v = r.answers[f.q]; return Array.isArray(v) ? v.includes(f.o) : v === f.o; });
}));
const counted = computed(() => filtered.value.filter(r => r.status !== 'voided'));

/* stats per question */
function statsFor(q) {
  const rs = counted.value;
  const seen = rs.filter(r => r.visited.includes(q._sec));
  const ans = seen.filter(r => { const v = r.answers[q.key]; return v != null && !(Array.isArray(v) && !v.length); });
  const base = { seen: seen.length, answered: ans.length, total: rs.length };
  if (TYPE[q.type].choice) {
    const rows = q.options.map(o => { const c = ans.filter(r => { const v = r.answers[q.key]; return Array.isArray(v) ? v.includes(o.key) : v === o.key; }).length; return { key: o.key, label: o.label, count: c, pct: pct(c, ans.length) }; });
    return { ...base, rows };
  }
  if (q.type === 'linear_scale' || q.type === 'rating') {
    const lo = q.type === 'rating' ? 1 : q.scale.min, hi = q.type === 'rating' ? q.rating.max : q.scale.max;
    const rows = []; for (let n = lo; n <= hi; n++) { const c = ans.filter(r => r.answers[q.key] === n).length; rows.push({ key: String(n), label: String(n), count: c, pct: pct(c, ans.length) }); }
    const mean = ans.length ? ans.reduce((a, r) => a + r.answers[q.key], 0) / ans.length : 0;
    return { ...base, rows, mean, lo, hi };
  }
  const grid = q.rows.map(rw => ({ key: rw.key, label: rw.label, cells: q.columns.map(c => { const n = ans.filter(r => { const v = (r.answers[q.key] || {})[rw.key]; return Array.isArray(v) ? v.includes(c.key) : v === c.key; }).length; return { key: c.key, label: c.label, count: n, pct: pct(n, ans.length) }; }) }));
  return { ...base, grid, columns: q.columns };
}

/* tooltip */
function tip(e, title, lines) { S.tip = { x: e.clientX, y: e.clientY, title, lines }; }
function untip() { S.tip = null; }

/* ---------------------------------------------------------------- chart atoms */
const useGrow = () => { const ready = ref(false); onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => ready.value = true))); return ready; };

const BarsView = {
  props: { rows: Array, denom: Number, unit: { default: 'respondents' } },
  setup() { return { ready: useGrow(), tip, untip }; },
  computed: { max() { return Math.max(1, ...this.rows.map(r => r.pct)); } },
  template: `<div class="grid gap-2">
    <div v-for="(r, i) in rows" :key="r.key" class="group grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_5rem]"
      @mousemove="tip($event, r.label, [r.count + ' ' + unit, r.pct + '% of ' + denom])" @mouseleave="untip">
      <span class="truncate text-muted-foreground group-hover:text-foreground" :title="r.label">{{ r.label }}</span>
      <span class="relative h-5 rounded-r bg-muted/50"><span class="absolute inset-y-0 left-0 rounded-r-[4px] bg-c1 transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:brightness-110" :style="{ width: (ready ? (r.pct / max) * 100 : 0) + '%', transitionDelay: (i * 40) + 'ms' }"></span></span>
      <span class="text-right tnum"><span class="font-medium">{{ r.pct }}%</span> <span class="text-xs text-muted-foreground">{{ r.count }}</span></span>
    </div></div>`
};

const DonutView = {
  props: { rows: Array, denom: Number },
  setup(p) {
    const ready = useGrow();
    const R = 40, C = 2 * Math.PI * R;
    const segs = computed(() => {
      let rows = [...p.rows];
      if (rows.length > 5) { const rest = rows.slice(4); rows = rows.slice(0, 4).concat([{ key: 'other', label: 'Other', count: rest.reduce((a, r) => a + r.count, 0), pct: Math.round(rest.reduce((a, r) => a + r.pct, 0) * 10) / 10, other: true }]); }
      const total = rows.reduce((a, r) => a + r.count, 0) || 1; let acc = 0;
      return rows.map((r, i) => { const len = (r.count / total) * C; const s = { ...r, color: r.other ? 'var(--c-other)' : `var(--c${i + 1})`, len: Math.max(0, len - 2), off: -acc }; acc += len; return s; });
    });
    return { ready, R, C, segs, tip, untip };
  },
  template: `<div class="flex flex-col items-center gap-5 sm:flex-row">
    <svg viewBox="0 0 100 100" class="h-36 w-36 shrink-0 -rotate-90" role="img" :aria-label="'Donut chart, ' + denom + ' answers'">
      <circle cx="50" cy="50" :r="R" fill="none" stroke="hsl(var(--muted))" stroke-width="14"/>
      <circle v-for="(s, i) in segs" :key="s.key" cx="50" cy="50" :r="R" fill="none" :stroke="s.color" stroke-width="14"
        :stroke-dasharray="(ready ? s.len : 0) + ' ' + C" :stroke-dashoffset="s.off" class="cursor-pointer transition-[stroke-dasharray] duration-700 ease-out hover:opacity-80"
        :style="{ transitionDelay: (i * 90) + 'ms' }" @mousemove="tip($event, s.label, [s.count + ' respondents', s.pct + '%'])" @mouseleave="untip"/>
      <text x="50" y="50" transform="rotate(90 50 50)" text-anchor="middle" dominant-baseline="central" class="fill-foreground text-[15px] font-semibold tnum">{{ denom }}</text>
    </svg>
    <ul class="grid w-full gap-1.5 text-sm">
      <li v-for="s in segs" :key="s.key" class="flex items-center gap-2"><span class="h-2.5 w-2.5 shrink-0 rounded-sm" :style="{ background: s.color }"></span><span class="min-w-0 flex-1 truncate text-muted-foreground">{{ s.label }}</span><span class="font-medium tnum">{{ s.pct }}%</span><span class="w-8 text-right text-xs text-muted-foreground tnum">{{ s.count }}</span></li>
    </ul></div>`
};

const ColumnsView = {
  props: { rows: Array, denom: Number, mean: Number, lo: Number, hi: Number, minLabel: String, maxLabel: String },
  setup() { return { ready: useGrow(), tip, untip }; },
  computed: { max() { return Math.max(1, ...this.rows.map(r => r.count)); }, meanPos() { return ((this.mean - this.lo) / Math.max(1, this.hi - this.lo)) * 100; } },
  template: `<div>
    <div class="relative flex h-36 items-end gap-1.5 border-b px-1 sm:gap-2">
      <div v-for="(r, i) in rows" :key="r.key" class="group relative flex h-full flex-1 flex-col items-center justify-end" @mousemove="tip($event, 'Score ' + r.label, [r.count + ' respondents', r.pct + '%'])" @mouseleave="untip">
        <span class="mb-1 text-[11px] font-medium tnum text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" :class="r.count===max && 'opacity-100 text-foreground'">{{ r.pct }}%</span>
        <span class="w-full max-w-6 rounded-t-[4px] bg-c1 transition-[height] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:brightness-110" :style="{ height: (ready ? (r.count / max) * 82 : 0) + '%', transitionDelay: (i * 50) + 'ms' }"></span>
      </div>
    </div>
    <div class="flex gap-1.5 px-1 pt-1.5 sm:gap-2"><span v-for="r in rows" :key="r.key" class="flex-1 text-center text-xs text-muted-foreground tnum">{{ r.label }}</span></div>
    <div class="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>{{ minLabel }}</span><span>{{ maxLabel }}</span></div>
  </div>`
};

const RatingSummary = {
  props: { rows: Array, denom: Number, mean: Number, hi: Number },
  setup() { return { ready: useGrow(), tip, untip }; },
  computed: { rev() { return [...this.rows].reverse(); }, max() { return Math.max(1, ...this.rows.map(r => r.count)); } },
  template: `<div class="flex flex-col gap-5 sm:flex-row sm:items-center">
    <div class="shrink-0 text-center sm:w-32">
      <p class="text-4xl font-semibold tracking-tight tnum">{{ mean.toFixed(1) }}</p>
      <div class="mt-1 flex justify-center gap-0.5 text-c1"><Icon v-for="n in hi" :key="n" name="Star" :size="14" :fill="n <= Math.round(mean) ? 'currentColor' : 'none'" :class="n > Math.round(mean) && 'text-muted-foreground/40'"/></div>
      <p class="mt-1 text-xs text-muted-foreground tnum">{{ denom }} ratings</p>
    </div>
    <div class="grid flex-1 gap-1.5">
      <div v-for="(r, i) in rev" :key="r.key" class="group grid grid-cols-[1.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs" @mousemove="tip($event, r.label + ' stars', [r.count + ' ratings', r.pct + '%'])" @mouseleave="untip">
        <span class="flex items-center gap-0.5 text-muted-foreground tnum">{{ r.label }}<Icon name="Star" :size="10"/></span>
        <span class="relative h-2.5 rounded-full bg-muted/70"><span class="absolute inset-y-0 left-0 rounded-full bg-c1 transition-[width] duration-700 ease-out" :style="{ width: (ready ? (r.count / max) * 100 : 0) + '%', transitionDelay: (i * 50) + 'ms' }"></span></span>
        <span class="text-right tnum text-muted-foreground">{{ r.pct }}%</span>
      </div></div></div>`
};

const StackedView = {
  props: { grid: Array, columns: Array, denom: Number },
  setup() { return { ready: useGrow(), tip, untip }; },
  template: `<div>
    <ul class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><li v-for="(c, i) in columns" :key="c.key" class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: 'var(--c' + (i+1) + ')' }"></span>{{ c.label }}</li></ul>
    <div class="grid gap-3">
      <div v-for="(r, ri) in grid" :key="r.key" class="grid gap-1 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-center sm:gap-3">
        <span class="truncate text-sm text-muted-foreground" :title="r.label">{{ r.label }}</span>
        <div class="flex h-6 gap-[2px] overflow-hidden rounded-[4px]">
          <span v-for="(c, ci) in r.cells" :key="c.key" class="grid h-full place-items-center overflow-hidden text-[11px] font-medium text-white transition-[flex-grow] duration-700 ease-out hover:brightness-110 tnum"
            :style="{ flexGrow: ready ? c.count : (ci===0 ? 1 : 0), flexBasis: 0, background: 'var(--c' + (ci+1) + ')', transitionDelay: (ri * 80) + 'ms' }"
            @mousemove="tip($event, r.label, [c.label + ': ' + c.count, c.pct + '%'])" @mouseleave="untip"><span v-if="c.pct >= 14">{{ Math.round(c.pct) }}%</span></span>
        </div></div></div></div>`
};

const HeatmapView = {
  props: { grid: Array, columns: Array, denom: Number },
  setup() { return { ready: useGrow(), tip, untip }; },
  template: `<div class="overflow-x-auto"><table class="w-full border-separate text-xs" style="border-spacing:2px">
    <thead><tr><th class="w-2/5"></th><th v-for="c in columns" :key="c.key" class="pb-1 text-center font-medium text-muted-foreground">{{ c.label }}</th></tr></thead>
    <tbody><tr v-for="(r, ri) in grid" :key="r.key"><td class="truncate pr-2 text-sm text-muted-foreground">{{ r.label }}</td>
      <td v-for="(c, ci) in r.cells" :key="c.key" class="h-10 min-w-11 rounded-[4px] text-center font-medium tnum transition-[background-color,opacity] duration-500"
        :style="{ background: 'color-mix(in oklab, var(--c1) ' + (8 + c.pct * 0.9) + '%, hsl(var(--card)))', opacity: ready ? 1 : 0, transitionDelay: ((ri * r.cells.length + ci) * 25) + 'ms', color: c.pct > 52 ? '#fff' : 'hsl(var(--foreground))' }"
        @mousemove="tip($event, r.label + ' · ' + c.label, [c.count + ' respondents', c.pct + '%'])" @mouseleave="untip">{{ Math.round(c.pct) }}%</td></tr></tbody>
    </table>
    <div class="mt-2 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">0%<span class="h-2 w-24 rounded-full" style="background:linear-gradient(90deg,color-mix(in oklab,var(--c1) 8%,hsl(var(--card))),var(--c1))"></span>100%</div></div>`
};

const TableView = {
  props: { st: Object, q: Object },
  template: `<div class="overflow-x-auto"><table class="w-full text-sm">
    <template v-if="st.grid">
      <thead><tr class="border-b text-xs text-muted-foreground"><th class="py-2 pr-3 text-left font-medium">Row</th><th v-for="c in st.columns" :key="c.key" class="px-2 py-2 text-right font-medium">{{ c.label }}</th></tr></thead>
      <tbody><tr v-for="r in st.grid" :key="r.key" class="border-b last:border-0"><td class="py-2 pr-3">{{ r.label }}</td><td v-for="c in r.cells" :key="c.key" class="px-2 py-2 text-right tnum">{{ c.count }} <span class="text-xs text-muted-foreground">{{ Math.round(c.pct) }}%</span></td></tr></tbody>
    </template>
    <template v-else>
      <thead><tr class="border-b text-xs text-muted-foreground"><th class="py-2 pr-3 text-left font-medium">Answer</th><th class="py-2 text-right font-medium">Count</th><th class="py-2 pl-3 text-right font-medium">Share</th></tr></thead>
      <tbody><tr v-for="r in st.rows" :key="r.key" class="border-b last:border-0"><td class="py-2 pr-3">{{ r.label }}</td><td class="py-2 text-right tnum">{{ r.count }}</td><td class="py-2 pl-3 text-right tnum">{{ r.pct }}%</td></tr></tbody>
    </template></table></div>`
};

/* ---------------------------------------------------------------- cards */
const KpiCard = {
  props: { label: String, value: Number, decimals: { default: 0 }, suffix: { default: '' }, format: Function, sub: String, icon: String, tone: { default: 'default' }, spark: Array, meter: Number, delay: { default: 0 } },
  setup(p) {
    const shown = ref(0); let raf = null;
    function animate(to) { cancelAnimationFrame(raf); const from = shown.value, t0 = performance.now(), d = 700;
      const step = (t) => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); shown.value = from + (to - from) * e; if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
    onMounted(() => setTimeout(() => animate(p.value), p.delay)); watch(() => p.value, animate);
    const text = computed(() => p.format ? p.format(shown.value) : shown.value.toFixed(p.decimals) + p.suffix);
    const path = computed(() => { if (!p.spark) return null; const m = Math.max(1, ...p.spark), n = p.spark.length; const pts = p.spark.map((v, i) => [(i / (n - 1)) * 100, 28 - (v / m) * 24]); return { line: 'M' + pts.map(x => x.join(',')).join(' L'), area: 'M0,30 L' + pts.map(x => x.join(',')).join(' L') + ' L100,30 Z', end: pts[n - 1] }; });
    return { text, path, ready: useGrow() };
  },
  template: `<div class="kpi rounded-xl border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md" :style="{ animationDelay: delay + 'ms' }">
    <div class="flex items-center justify-between gap-2"><p class="truncate text-xs font-medium text-muted-foreground">{{ label }}</p>
      <span :class="['grid h-6 w-6 shrink-0 place-items-center rounded-md', tone==='warn' ? 'bg-warning/15 text-warning' : tone==='danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary']"><Icon :name="icon" :size="13"/></span></div>
    <p class="mt-1.5 text-2xl font-semibold tracking-tight tnum">{{ text }}</p>
    <div class="mt-1 flex min-h-[28px] items-end justify-between gap-2">
      <p class="text-[11px] leading-tight text-muted-foreground">{{ sub }}</p>
      <svg v-if="path" viewBox="0 0 100 30" class="h-7 w-20 shrink-0 overflow-visible" preserveAspectRatio="none" aria-hidden="true">
        <path :d="path.area" fill="var(--c1)" opacity=".12"/><path :d="path.line" fill="none" stroke="var(--c1)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" class="spark"/>
      </svg>
      <span v-else-if="meter != null" class="mb-1 h-1.5 w-20 shrink-0 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><span class="block h-full rounded-full bg-c1 transition-[width] duration-700 ease-out" :style="{ width: (ready ? meter : 0) + '%' }"></span></span>
    </div></div>`
};

const ChartCard = {
  props: { q: Object, idx: Number },
  setup(p) {
    const st = computed(() => statsFor(p.q));
    const views = TYPE_VIEWS[p.q.type];
    const view = computed(() => S.views[p.q.key] || views[0]);
    const isDefault = computed(() => !S.views[p.q.key]);
    function setView(v) {
      if (v === views[0]) delete S.views[p.q.key]; else S.views[p.q.key] = v;
      if (!S.savedHint) { S.savedHint = true; toast('View saved for this form', 'Everyone who opens these results sees the same view.', 'ChartBarBig'); }
    }
    const denom = computed(() => st.value.answered);
    const t = TYPE[p.q.type];
    const secIndex = SECS.findIndex(s => s.key === p.q._sec) + 1;
    const wide = ['choice_grid', 'checkbox_grid'].includes(p.q.type);
    return { S, st, views, view, isDefault, setView, denom, t, VIEWS, secIndex, wide };
  },
  template: `<article :class="['kpi rounded-xl border bg-card shadow-sm', wide ? 'xl:col-span-2' : '']" :style="{ animationDelay: (120 + idx * 50) + 'ms' }">
    <header class="flex items-start gap-3 border-b px-4 py-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium leading-snug">{{ q.title }}</h3>
        <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground tnum">
          <span class="inline-flex items-center gap-1"><Icon :name="t.icon" :size="11"/>{{ t.label }}</span><span aria-hidden="true">·</span>
          <span>{{ denom }} answered</span>
          <template v-if="st.seen < st.total"><span aria-hidden="true">·</span><span class="inline-flex items-center gap-1"><Icon name="Split" :size="11"/>Section {{ secIndex }} skipped by {{ st.total - st.seen }}</span></template>
          <template v-else-if="st.answered < st.seen"><span aria-hidden="true">·</span><span>{{ st.seen - st.answered }} left blank</span></template>
        </p>
      </div>
      <div class="flex shrink-0 items-center rounded-md border bg-muted/40 p-0.5" role="radiogroup" :aria-label="'Chart view for ' + q.title">
        <Tooltip v-for="v in views" :key="v" :content="VIEWS[v].label + (v===views[0] ? ' (default)' : '')" side="bottom">
          <button type="button" role="radio" :aria-checked="view===v" @click="setView(v)" :aria-label="VIEWS[v].label"
            :class="['grid h-6 w-7 place-items-center rounded transition-colors', view===v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"><Icon :name="VIEWS[v].icon" :size="14"/></button>
        </Tooltip>
      </div>
    </header>
    <div class="px-4 py-4">
      <div v-if="!denom" class="grid place-items-center py-8 text-center text-sm text-muted-foreground"><Icon name="ListFilter" :size="20"/><p class="mt-2">No answers match the current filters.</p></div>
      <Transition v-else name="fade" mode="out-in">
        <div :key="view + S.filters.length + S.range">
          <BarsView v-if="view==='bars'" :rows="st.rows" :denom="denom"/>
          <DonutView v-else-if="view==='donut'" :rows="st.rows" :denom="denom"/>
          <ColumnsView v-else-if="view==='columns'" :rows="st.rows" :denom="denom" :mean="st.mean" :lo="st.lo" :hi="st.hi" :min-label="q.scale && q.scale.min_label" :max-label="q.scale && q.scale.max_label"/>
          <RatingSummary v-else-if="view==='summary'" :rows="st.rows" :denom="denom" :mean="st.mean" :hi="st.hi"/>
          <StackedView v-else-if="view==='stacked'" :grid="st.grid" :columns="st.columns" :denom="denom"/>
          <HeatmapView v-else-if="view==='heatmap'" :grid="st.grid" :columns="st.columns" :denom="denom"/>
          <TableView v-else :st="st" :q="q"/>
        </div>
      </Transition>
      <p v-if="q.type==='multi_choice' && denom" class="mt-3 text-[11px] text-muted-foreground">Respondents could pick more than one, so shares add up to more than 100%.</p>
      <p v-if="q.type==='linear_scale' && view!=='table' && denom" class="mt-2 text-xs text-muted-foreground tnum">Average <span class="font-medium text-foreground">{{ st.mean.toFixed(2) }}</span> of {{ st.hi }}</p>
    </div></article>`
};

/* ---------------------------------------------------------------- response sheet */
const EVT = { tab_hidden: { icon: 'AppWindow', label: 'Left the tab' }, fullscreen_exit: { icon: 'Minimize', label: 'Exited full screen' }, copy_attempt: { icon: 'ClipboardX', label: 'Tried to copy or paste' } };
const STATUS = {
  submitted: { label: 'Submitted', variant: 'secondary', icon: 'CircleCheck' },
  auto: { label: 'Auto-submitted', variant: 'warning', icon: 'Timer' },
  voided: { label: 'Voided', variant: 'destructive', icon: 'Ban' },
};
const ResponseSheet = {
  setup() {
    const r = computed(() => S.open);
    const tab = ref('answers');
    watch(() => S.open, () => tab.value = 'answers');
    function answerText(q, v) {
      if (v == null || (Array.isArray(v) && !v.length)) return null;
      if (TYPE[q.type].grid) return q.rows.map(rw => ({ row: rw.label, val: [].concat(v[rw.key] || []).map(k => (q.columns.find(c => c.key === k) || {}).label).join(', ') || '—' }));
      if (Array.isArray(v)) return v.map(k => optLabel(q, k)).join(', ');
      if (typeof v === 'number') return q.type === 'rating' ? '★'.repeat(v) + ' (' + v + ' of ' + q.rating.max + ')' : v + ' of ' + q.scale.max;
      return optLabel(q, v);
    }
    const timeline = computed(() => {
      if (!r.value) return [];
      const x = r.value, out = [{ icon: 'Play', label: 'Started in full screen', at: 0 }];
      x.events.forEach(e => out.push({ ...EVT[e.type], at: e.at, warn: true }));
      if (!x.visited.includes(sec2.key)) out.push({ icon: 'Split', label: 'Skipped section 2 by answer', at: Math.round(x.duration * 0.15) });
      out.push(x.status === 'voided' ? { icon: 'Ban', label: 'Attempt voided after a violation', at: x.duration, danger: true }
        : x.reason === 'timer_expired' ? { icon: 'Timer', label: 'Submitted automatically: time ran out', at: x.duration, warn: true }
        : x.reason === 'violation_limit' ? { icon: 'TriangleAlert', label: 'Submitted automatically after 3 violations', at: x.duration, danger: true }
        : { icon: 'Send', label: 'Submitted', at: x.duration });
      return out.sort((a, b) => a.at - b.at);
    });
    const subjectOf = (x) => ({ kind: 'respondent', id: x.id, form: 'f1', label: x.email + ' on Customer Service Assessment Q4' });
    function reset() { const x = r.value; G.approvalGate('Responses.void', subjectOf(x), () => { x.reset = true; toast('Respondent can try again', x.email + ' may start a new attempt.', 'RotateCcw'); }); }
    const pending = computed(() => r.value && G.openRequestFor ? G.openRequestFor('Responses.void', subjectOf(r.value)) : null);
    const needsOk = computed(() => G.approvalNeeded && G.approvalNeeded('Responses.void', 'f1'));
    function openPending() { S.open = null; G.openReq(pending.value.id); }
    return { S, r, tab, answerText, timeline, SECS, STATUS, fmtDur, fmtDate, reset, pending, needsOk, openPending };
  },
  template: `<Sheet :open="!!S.open" @update:open="v => { if(!v) S.open = null }">
    <template v-if="r">
      <div class="border-b p-5 pr-12">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">{{ r.name.split(' ').map(x=>x[0]).join('') }}</span>
          <div class="min-w-0"><p class="truncate font-semibold">{{ r.name }}</p><p class="truncate text-sm text-muted-foreground">{{ r.email }}</p></div></div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div class="rounded-lg border p-2"><p class="text-muted-foreground">Submitted</p><p class="mt-0.5 font-medium tnum">{{ fmtDate(r.at) }}</p></div>
          <div class="rounded-lg border p-2"><p class="text-muted-foreground">Duration</p><p class="mt-0.5 font-medium tnum">{{ fmtDur(r.duration) }}</p></div>
          <div class="rounded-lg border p-2"><p class="text-muted-foreground">Violations</p><p class="mt-0.5 font-medium tnum" :class="r.violations ? 'text-warning' : ''">{{ r.violations }}</p></div>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Badge :variant="STATUS[r.status].variant"><Icon :name="STATUS[r.status].icon" :size="12"/>{{ STATUS[r.status].label }}</Badge>
          <Badge v-if="r.reset" variant="outline"><Icon name="RotateCcw" :size="12"/>Can try again</Badge>
          <span class="flex-1"></span>
          <Button v-if="r.status!=='voided'" variant="outline" size="sm" class="text-destructive" @click="S.confirmVoid=true"><Icon name="Ban" :size="14"/>Void</Button>
          <Button v-else-if="!r.reset && pending" variant="outline" size="sm" @click="openPending"><Icon name="Hourglass" :size="14" class="text-warning"/>Reset requested · {{ pending.no.slice(-7) }}</Button>
          <Button v-else-if="!r.reset" variant="outline" size="sm" @click="reset"><Icon :name="needsOk ? 'Stamp' : 'RotateCcw'" :size="14"/>{{ needsOk ? 'Request another attempt' : 'Allow another attempt' }}</Button>
        </div>
      </div>
      <div class="border-b px-5 py-2"><Tabs v-model="tab" :items="[{value:'answers',label:'Answers'},{value:'log',label:'Integrity log',count:r.violations}]"/></div>
      <div class="flex-1 overflow-auto p-5">
        <div v-if="tab==='answers'" class="space-y-5">
          <section v-for="(s, si) in SECS" :key="s.key">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section {{ si+1 }} · {{ s.title }}</p>
            <p v-if="!r.visited.includes(s.key)" class="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"><Icon name="Split" :size="14" class="mr-1 inline"/>Skipped by an earlier answer.</p>
            <dl v-else class="divide-y rounded-lg border">
              <div v-for="q in s.questions" :key="q.key" class="p-3"><dt class="text-xs text-muted-foreground">{{ q.title }}</dt>
                <dd class="mt-1 text-sm font-medium">
                  <template v-if="Array.isArray(answerText(q, r.answers[q.key]))"><div v-for="g in answerText(q, r.answers[q.key])" :key="g.row" class="flex justify-between gap-3 font-normal"><span class="text-muted-foreground">{{ g.row }}</span><span class="text-right font-medium">{{ g.val }}</span></div></template>
                  <template v-else-if="answerText(q, r.answers[q.key])">{{ answerText(q, r.answers[q.key]) }}</template>
                  <span v-else class="font-normal italic text-muted-foreground">No answer</span></dd></div>
            </dl>
          </section>
        </div>
        <ol v-else class="relative ml-3 border-l pl-5">
          <li v-for="(e, i) in timeline" :key="i" class="relative pb-5 last:pb-0">
            <span :class="['absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border-2 border-background', e.danger ? 'bg-destructive text-destructive-foreground' : e.warn ? 'bg-warning text-white' : 'bg-muted text-muted-foreground']"><Icon :name="e.icon" :size="12"/></span>
            <p class="text-sm font-medium">{{ e.label }}</p><p class="text-xs text-muted-foreground tnum">{{ fmtDur(e.at) }} after start</p>
          </li>
        </ol>
      </div>
    </template>
  </Sheet>`
};

/* ---------------------------------------------------------------- App */
const App = {
  setup() {
    watch(() => S.theme, applyTheme, { immediate: true });
    const tabs = [{ value: 'questions', label: 'Questions' }, { value: 'responses', label: 'Responses', count: RESP.length }, { value: 'settings', label: 'Settings' }];
    const subTabs = computed(() => [{ value: 'summary', label: 'Summary' }, { value: 'individual', label: 'Individual', count: filtered.value.length }]);
    const themeItems = computed(() => ['light', 'dark', 'system'].map(id => ({ id, label: id[0].toUpperCase() + id.slice(1), icon: { light: 'Sun', dark: 'Moon', system: 'Laptop' }[id], checked: S.theme === id })));
    function onTab(v) { if (v !== 'responses') toast('Open the builder prototype', 'Questions and Settings live in iteration 1.', 'Info'); }

    const kpi = computed(() => {
      const all = filtered.value, c = counted.value;
      const days = Array.from({ length: 10 }, (_, i) => c.filter(r => Math.floor((r.at.getTime() - start) / 86400000) === i).length);
      const complete = c.filter(r => r.status === 'submitted').length;
      const avg = c.length ? c.reduce((a, r) => a + r.duration, 0) / c.length : 0;
      return { total: c.length, days, completion: pct(complete, c.length), auto: c.filter(r => r.status === 'auto').length, avg, flagged: all.filter(r => r.violations > 0).length, voided: all.filter(r => r.status === 'voided').length };
    });

    const choiceQs = Object.values(Q).filter(q => TYPE[q.type].choice && q.type !== 'multi_choice' || q.type === 'multi_choice');
    const filterQ = computed(() => choiceQs.map(q => ({ value: q.key, label: q.title })));
    const filterO = computed(() => S.addFilter.q ? Q[S.addFilter.q].options.map(o => ({ value: o.key, label: o.label })) : []);
    function addFilter(o) { if (!S.filters.some(f => f.q === S.addFilter.q && f.o === o)) S.filters.push({ q: S.addFilter.q, o }); S.addFilter.q = null; S.page = 1; }
    const chipLabel = (f) => optLabel(Q[f.q], f.o);
    const chipQ = (f) => { const t = Q[f.q].title; return t.length > 28 ? t.slice(0, 26) + '…' : t; };

    function exportAs(it) {
      const meta = it.label + ' · ' + counted.value.length + ' responses' + (S.filters.length ? ', filtered' : '');
      G.approvalGate('Responses.export', { kind: 'form', id: 'f1', label: 'Customer Service Assessment Q4', meta }, () => runExport(it));
    }
    function runExport(it) {
      S.exportBusy = true; toast(`Preparing ${it.label}`, `${counted.value.length} responses${S.filters.length ? ', filtered' : ''}. We will notify you when it is ready.`, 'Hourglass');
      setTimeout(() => { S.exportBusy = false; toast(`${it.label} ready`, 'Download link valid for 24 hours. Also emailed to you.', 'FileSpreadsheet'); }, 2200);
    }
    const exportNeedsOk = computed(() => G.approvalNeeded && G.approvalNeeded('Responses.export', 'f1'));
    const exportItems = computed(() => [...(exportNeedsOk.value ? [{ id: '__h', label: 'Needs approval first', icon: 'Stamp', disabled: true }, { separator: true }] : []), { id: 'xlsx', label: 'Excel (.xlsx)', icon: 'FileSpreadsheet' }, { id: 'csv', label: 'CSV (.csv)', icon: 'FileText' }]);

    const statusOpts = [{ value: 'all', label: 'All statuses' }, { value: 'submitted', label: 'Submitted' }, { value: 'auto', label: 'Auto-submitted' }, { value: 'voided', label: 'Voided' }, { value: 'flagged', label: 'Has violations' }];
    const rows = computed(() => {
      const q = S.search.trim().toLowerCase();
      return filtered.value.filter(r => (!q || r.email.includes(q) || r.name.toLowerCase().includes(q)) && (S.statusF === 'all' || (S.statusF === 'flagged' ? r.violations > 0 : r.status === S.statusF)));
    });
    const PER = 12;
    const pageRows = computed(() => rows.value.slice((S.page - 1) * PER, S.page * PER));
    const pages = computed(() => Math.max(1, Math.ceil(rows.value.length / PER)));
    watch(() => [S.search, S.statusF], () => S.page = 1);

    function confirmVoid() { S.open.status = 'voided'; S.open.reason = 'owner'; S.confirmVoid = false; toast('Response voided', 'It no longer counts in the summary or exports.', 'Ban'); }
    watch(() => S.accepting, v => toast(v ? 'Accepting responses' : 'Form closed', v ? 'The link works again.' : 'New visitors see "This form is closed".', v ? 'LockOpen' : 'Lock'));

    const RF = reactive({ loading: false, updatedAt: Date.now() });
    function refresh() { if (RF.loading) return; RF.loading = true; setTimeout(() => { RF.loading = false; RF.updatedAt = Date.now(); G.toast('Results up to date', '', 'RefreshCw'); }, 800); }
    return { RF, refresh, S, tabs, subTabs, themeItems, onTab, kpi, filterQ, filterO, addFilter, chipLabel, chipQ, exportAs, exportItems, RANGES, statusOpts, rows, pageRows, pages, PER, confirmVoid, Q, fmtDur, fmtDate, STATUS, compact, counted, filtered, qBranch, optLabel };
  },
  template: `
  <div class="flex min-h-screen flex-col">
    <header class="sticky z-40 border-b bg-background/95 backdrop-blur" style="top:env(safe-area-inset-top,0px)">
      <div class="flex h-14 items-center gap-2 px-3 sm:px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Back to all forms"><Icon name="ChevronLeft"/></Button>
          <div class="hidden h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground sm:grid"><Icon name="ClipboardList" :size="16"/></div>
          <div class="min-w-0"><p class="truncate text-sm font-semibold leading-tight">Customer Service Assessment Q4</p><p class="truncate text-xs text-muted-foreground">Kilima Retail · version 3 live</p></div>
        </div>
        <Tabs class="hidden lg:inline-flex" model-value="responses" @update:model-value="onTab" :items="tabs"/>
        <div class="flex items-center justify-end gap-1">
          <RefreshButton :loading="RF.loading" :updated-at="RF.updatedAt" @refresh="refresh"/>
          <DropdownMenu :items="themeItems" @select="it => S.theme = it.id" label="Theme"><template #trigger><Button variant="ghost" size="icon" aria-label="Theme"><Icon :name="S.theme==='dark' ? 'Moon' : S.theme==='light' ? 'Sun' : 'Laptop'"/></Button></template></DropdownMenu>
          <Button size="sm" variant="outline" class="hidden sm:inline-flex"><Icon name="Eye" :size="14"/>View form</Button>
        </div>
      </div>
      <div class="border-t px-3 py-2 lg:hidden"><Tabs full model-value="responses" @update:model-value="onTab" :items="tabs"/></div>
    </header>

    <main :class="['flex-1 px-3 pb-16 pt-4 transition-opacity sm:px-4', RF.loading && 'pointer-events-none opacity-60']">
      <div class="mx-auto grid max-w-[1120px] gap-3">
        <!-- toolbar -->
        <div class="flex flex-wrap items-center gap-2">
          <Tabs v-model="S.sub" :items="subTabs"/>
          <span class="flex-1"></span>
          <label class="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm shadow-sm" for="acc">
            <span :class="['h-2 w-2 rounded-full', S.accepting ? 'bg-c1 animate-pulse' : 'bg-muted-foreground']"></span><span class="hidden sm:inline">{{ S.accepting ? 'Accepting responses' : 'Closed' }}</span><span class="sm:hidden">{{ S.accepting ? 'Open' : 'Closed' }}</span><Switch id="acc" v-model="S.accepting"/></label>
          <Select class="w-36" v-model="S.range" :options="RANGES"/>
          <DropdownMenu :items="exportItems" @select="exportAs" label="Export responses">
            <template #trigger><Button variant="outline" :disabled="S.exportBusy"><Icon :name="S.exportBusy ? 'LoaderCircle' : 'Download'" :class="S.exportBusy && 'animate-spin'"/><span class="hidden sm:inline">Export</span></Button></template>
          </DropdownMenu>
        </div>

        <!-- filters -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-1.5 rounded-md border border-dashed bg-card/60 p-1 pl-2 text-sm">
            <Icon name="ListFilter" :size="14" class="text-muted-foreground"/>
            <Select size="sm" class="w-52 max-w-[48vw]" :model-value="S.addFilter.q" @update:model-value="v => S.addFilter.q = v" :options="filterQ" placeholder="Filter by an answer"/>
            <Select v-if="S.addFilter.q" size="sm" class="w-44 max-w-[40vw]" :model-value="null" @update:model-value="addFilter" :options="filterO" placeholder="Choose answer"/>
          </div>
          <TransitionGroup name="q">
            <span v-for="(f, i) in S.filters" :key="f.q + f.o" class="inline-flex h-8 items-center gap-1.5 rounded-full border bg-primary/10 pl-3 pr-1 text-xs">
              <span class="text-muted-foreground">{{ chipQ(f) }}</span><span class="font-medium">{{ chipLabel(f) }}</span>
              <button type="button" class="grid h-6 w-6 place-items-center rounded-full hover:bg-background" @click="S.filters.splice(i,1)" :aria-label="'Remove filter ' + chipLabel(f)"><Icon name="X" :size="12"/></button></span>
          </TransitionGroup>
          <button v-if="S.filters.length" type="button" class="text-xs font-medium text-primary underline-offset-4 hover:underline" @click="S.filters=[]">Clear all</button>
          <span v-if="S.filters.length || S.range!=='all'" class="text-xs text-muted-foreground tnum">Showing {{ counted.length }} of {{ RESP.filter(r=>r.status!=='voided').length }}</span>
        </div>

        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard label="Responses" :value="kpi.total" icon="Inbox" :spark="kpi.days" sub="Daily, since 1 Oct" :delay="0"/>
          <KpiCard label="Completed normally" :value="kpi.completion" :decimals="1" suffix="%" icon="CircleCheck" :meter="kpi.completion" :sub="kpi.auto + ' auto-submitted'" :delay="60"/>
          <KpiCard label="Average time" :value="kpi.avg" :format="v => fmtDur(Math.round(v))" icon="Clock" sub="Limit 15 min total" :delay="120"/>
          <KpiCard label="With violations" :value="kpi.flagged" icon="TriangleAlert" tone="warn" sub="Review in Individual" :delay="180"/>
          <KpiCard label="Voided" :value="kpi.voided" icon="Ban" tone="danger" sub="Excluded from summary" :delay="240" class="col-span-2 md:col-span-1"/>
        </div>

        <!-- SUMMARY -->
        <div v-if="S.sub==='summary'" class="grid gap-3 xl:grid-cols-2">
          <ChartCard v-for="(q, i) in Object.values(Q)" :key="q.key" :q="q" :idx="i"/>
        </div>

        <!-- INDIVIDUAL -->
        <div v-else class="kpi rounded-xl border bg-card shadow-sm">
          <div class="flex flex-wrap items-center gap-2 border-b p-3">
            <div class="relative min-w-0 flex-1 basis-56"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-8" v-model="S.search" placeholder="Search name or email"/></div>
            <Select class="w-44" v-model="S.statusF" :options="statusOpts"/>
          </div>
          <!-- table (md+) -->
          <div class="hidden overflow-x-auto md:block"><table class="w-full text-sm">
            <thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Respondent</th><th class="px-3 py-2.5 font-medium">Branch</th><th class="px-3 py-2.5 font-medium">Submitted</th><th class="px-3 py-2.5 text-right font-medium">Duration</th><th class="px-3 py-2.5 text-center font-medium">Violations</th><th class="px-4 py-2.5 font-medium">Status</th></tr></thead>
            <TransitionGroup tag="tbody" name="q">
              <tr v-for="r in pageRows" :key="r.id" @click="S.open = r" tabindex="0" @keydown.enter="S.open = r" class="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
                <td class="px-4 py-2.5"><p class="font-medium">{{ r.name }}</p><p class="text-xs text-muted-foreground">{{ r.email }}</p></td>
                <td class="px-3 py-2.5 text-muted-foreground">{{ optLabel(qBranch, r.answers[qBranch.key]) }}</td>
                <td class="px-3 py-2.5 tnum text-muted-foreground">{{ fmtDate(r.at) }}</td>
                <td class="px-3 py-2.5 text-right tnum">{{ fmtDur(r.duration) }}</td>
                <td class="px-3 py-2.5 text-center"><span v-if="r.violations" class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning tnum"><Icon name="TriangleAlert" :size="11"/>{{ r.violations }}</span><span v-else class="text-muted-foreground">–</span></td>
                <td class="px-4 py-2.5"><Badge :variant="STATUS[r.status].variant"><Icon :name="STATUS[r.status].icon" :size="11"/>{{ STATUS[r.status].label }}</Badge></td>
              </tr>
            </TransitionGroup>
          </table></div>
          <!-- cards (phones) -->
          <ul class="divide-y md:hidden">
            <li v-for="r in pageRows" :key="r.id"><button type="button" @click="S.open = r" class="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50">
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ r.name }}</p><p class="truncate text-xs text-muted-foreground tnum">{{ optLabel(qBranch, r.answers[qBranch.key]) }} · {{ fmtDate(r.at) }} · {{ fmtDur(r.duration) }}</p></div>
              <span v-if="r.violations" class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning tnum"><Icon name="TriangleAlert" :size="11"/>{{ r.violations }}</span>
              <Badge :variant="STATUS[r.status].variant" class="shrink-0"><Icon :name="STATUS[r.status].icon" :size="11"/><span class="hidden min-[400px]:inline">{{ STATUS[r.status].label }}</span></Badge>
              <Icon name="ChevronRight" :size="16" class="text-muted-foreground"/></button></li>
          </ul>
          <p v-if="!rows.length" class="p-8 text-center text-sm text-muted-foreground">No responses match. Clear the search or filters.</p>
          <div class="flex items-center justify-between gap-3 border-t px-4 py-2.5 text-xs text-muted-foreground tnum">
            <span>{{ rows.length ? ((S.page-1)*PER+1) + '–' + Math.min(S.page*PER, rows.length) : 0 }} of {{ rows.length }}</span>
            <div class="flex items-center gap-1"><Button variant="outline" size="icon-sm" :disabled="S.page<=1" @click="S.page--" aria-label="Previous page"><Icon name="ChevronLeft" :size="15"/></Button><span class="px-2">Page {{ S.page }} of {{ pages }}</span><Button variant="outline" size="icon-sm" :disabled="S.page>=pages" @click="S.page++" aria-label="Next page"><Icon name="ChevronRight" :size="15"/></Button></div>
          </div>
        </div>
      </div>
    </main>

    <ResponseSheet/>
    <Dialog v-model:open="S.confirmVoid">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Void this response?</h2>
        <p class="text-sm text-muted-foreground">It stops counting in the summary and exports. The answers and integrity log are kept. The person still cannot respond again unless you allow another attempt.</p></div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="S.confirmVoid=false">Cancel</Button><Button variant="destructive" @click="confirmVoid">Void response</Button></div>
    </Dialog>

    <!-- tooltip -->
    <div v-if="S.tip" class="pointer-events-none fixed z-[90] rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg" :style="{ left: Math.min(S.tip.x + 12, (typeof window!=='undefined' ? window.innerWidth : 9999) - 190) + 'px', top: (S.tip.y + 14) + 'px' }">
      <p class="font-medium">{{ S.tip.title }}</p><p v-for="l in S.tip.lines" :key="l" class="text-muted-foreground tnum">{{ l }}</p></div>

    <NewRequestDialog/>
    <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-3 lg:left-auto lg:right-4 lg:items-end" style="margin-bottom:env(safe-area-inset-bottom,0px)" aria-live="polite">
      <TransitionGroup name="toast"><div v-for="t in S.toasts" :key="t.id" class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-popover p-3.5 text-popover-foreground shadow-lg"><Icon :name="t.icon" class="mt-0.5 text-primary"/><div class="min-w-0"><p class="text-sm font-medium">{{ t.title }}</p><p v-if="t.desc" class="text-xs text-muted-foreground">{{ t.desc }}</p></div></div></TransitionGroup>
    </div>
  </div>`
};

const app = createApp(App);
app.config.globalProperties.RESP = RESP;
Object.entries({ Icon, Button, Input, Textarea, Label, Switch, Checkbox, RadioGroupItem, Badge, Card, Separator, Select, DropdownMenu, Tooltip, Dialog, Sheet, Tabs, BarsView, DonutView, ColumnsView, RatingSummary, StackedView, HeatmapView, TableView, KpiCard, ChartCard, ResponseSheet })
  .forEach(([n, c]) => app.component(n, c));
app.mount('#app');
</script>
