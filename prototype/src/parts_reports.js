
  /* ================================================================ P96: REPORTS AND THE CHART BUILDER (kit 1.16.0)
     A report is a definition over a module's data. The viewer: filters, paged or all rows, columns the person shows, hides,
     orders and pins, a header and pinned columns that stay put while the table scrolls both ways, totals of the rows shown in
     a footer, an aggregate strip over EVERY filtered row (ignoring pages; the server computes it in the app), group by with
     subtotals, saved views (mine or shared), exports as background jobs (P95: Excel, CSV, PDF made by the server), and a chart
     builder on HIGHCHARTS ONLY (owner, 2026-11-07): type, X axis, measures with their aggregate, series, top N; chart images
     (PNG, SVG, PDF) and the chart's data are made in the browser by Highcharts' offline exporting.
     Highcharts needs a licence for commercial use: each product records it in its decision log (P96). */
  const HC_VER = '11.4.8';
  let hcPromise = null;
  function loadHighcharts() {
    if (window.Highcharts && window.Highcharts.exportChartLocal !== undefined) return Promise.resolve(window.Highcharts);
    if (hcPromise) return hcPromise;
    const base = 'https://cdn.jsdelivr.net/npm/highcharts@' + HC_VER + '/';
    const files = ['highcharts.js', 'modules/exporting.js', 'modules/offline-exporting.js', 'modules/export-data.js', 'modules/accessibility.js'];
    hcPromise = files.reduce((p, f) => p.then(() => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = base + f; s.onload = ok; s.onerror = () => bad(new Error('Could not load ' + f)); document.head.appendChild(s); })), Promise.resolve()).then(() => window.Highcharts);
    hcPromise.catch(() => { hcPromise = null; });
    return hcPromise;
  }

  /* ---- demo data: one month of sales lines across the branches (deterministic) */
  const RP_BRANCH = ['Arusha Branch', 'Mwanza Branch', 'Kariakoo Branch', 'Dodoma Branch', 'Mbeya Branch'];
  const RP_PRODUCT = [['Solar lantern', 'Solar', 45000], ['Solar panel 100W', 'Solar', 210000], ['Phone charger', 'Accessories', 12000], ['Power bank', 'Accessories', 38000], ['Radio', 'Electronics', 52000], ['LED bulb', 'Lighting', 4500], ['Extension cable', 'Accessories', 15000], ['Inverter 500W', 'Solar', 340000]];
  const RP_PAY = ['Cash', 'M-Pesa', 'Card', 'Credit'];
  const RP_CASHIER = ['Rehema Mrema', 'Baraka Mushi', 'Hamisi Swai', 'Neema Kimaro'];
  const SALES_ROWS = (() => { let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const out = [];
    for (let i = 0; i < 240; i++) { const d = 1 + Math.floor(rnd() * 31); const pr = RP_PRODUCT[Math.floor(rnd() * RP_PRODUCT.length)]; const qty = 1 + Math.floor(rnd() * (pr[2] > 100000 ? 2 : 8));
      out.push({ id: 'S-' + String(4100 + i), date: '2026-10-' + String(d).padStart(2, '0'), branch: RP_BRANCH[Math.floor(rnd() * RP_BRANCH.length)], product: pr[0], category: pr[1], qty, price: pr[2], total: qty * pr[2], pay: RP_PAY[Math.floor(rnd() * RP_PAY.length)], cashier: RP_CASHIER[Math.floor(rnd() * RP_CASHIER.length)] }); }
    return out.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0); })();
  const RP_MONEY = (n) => 'TZS ' + Math.round(n).toLocaleString('en-US');
  const REPORTS = reactive([
    { id: 'sales', name: 'Sales lines', module: 'Sales', desc: 'Every item sold, with its branch, product, payment and cashier.', rows: () => SALES_ROWS,
      fields: [
        { key: 'id', label: 'Sale', type: 'text', w: 104 }, { key: 'date', label: 'Date', type: 'date', w: 112, group: true },
        { key: 'branch', label: 'Branch', type: 'text', w: 160, group: true }, { key: 'product', label: 'Product', type: 'text', w: 170, group: true },
        { key: 'category', label: 'Category', type: 'text', w: 128, group: true }, { key: 'qty', label: 'Qty', type: 'number', w: 80, agg: 'sum' },
        { key: 'price', label: 'Unit price', type: 'money', w: 136, agg: 'avg' }, { key: 'total', label: 'Total', type: 'money', w: 150, agg: 'sum' },
        { key: 'pay', label: 'Payment', type: 'text', w: 112, group: true }, { key: 'cashier', label: 'Cashier', type: 'text', w: 150, group: true },
      ],
      views: [
        { id: 'v1', name: 'All sales', owner: 'Amina Juma', shared: 'Everyone', def: true, cols: ['id', 'date', 'branch', 'product', 'qty', 'price', 'total', 'pay', 'cashier'], pinned: ['id'], groupBy: '', chart: { type: 'column', x: 'branch', bucket: 'month', ys: [{ key: 'total', agg: 'sum' }], series: '', top: 0, labels: false } },
        { id: 'v2', name: 'Solar by branch', owner: 'Neema Kimaro', shared: 'Branch supervisors', cols: ['date', 'branch', 'product', 'qty', 'total'], pinned: ['date'], groupBy: 'branch', chart: { type: 'bar', x: 'branch', bucket: 'month', ys: [{ key: 'total', agg: 'sum' }], series: 'category', top: 0, labels: true } },
        { id: 'v3', name: 'Daily takings', owner: 'Amina Juma', shared: 'Just me', cols: ['date', 'branch', 'total', 'pay'], pinned: ['date'], groupBy: 'date', chart: { type: 'line', x: 'date', bucket: 'day', ys: [{ key: 'total', agg: 'sum' }], series: '', top: 0, labels: false } },
      ] },
    { id: 'staff', name: 'Sales by cashier', module: 'Sales', desc: 'Who sold what, for commissions and coaching.', rows: () => SALES_ROWS,
      fields: [{ key: 'cashier', label: 'Cashier', type: 'text', w: 160, group: true }, { key: 'branch', label: 'Branch', type: 'text', w: 160, group: true }, { key: 'date', label: 'Date', type: 'date', w: 112, group: true }, { key: 'qty', label: 'Qty', type: 'number', w: 80, agg: 'sum' }, { key: 'total', label: 'Total', type: 'money', w: 150, agg: 'sum' }],
      views: [{ id: 'v1', name: 'By cashier', owner: 'Amina Juma', shared: 'Everyone', def: true, cols: ['cashier', 'branch', 'date', 'qty', 'total'], pinned: ['cashier'], groupBy: 'cashier', chart: { type: 'pie', x: 'cashier', bucket: 'month', ys: [{ key: 'total', agg: 'sum' }], series: '', top: 0, labels: true } }] },
  ]);
  const AGG = { sum: ['Sum', a => a.reduce((s, v) => s + v, 0)], avg: ['Average', a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0], count: ['Count', a => a.length], min: ['Min', a => a.length ? Math.min(...a) : 0], max: ['Max', a => a.length ? Math.max(...a) : 0] };
  const rpFmt = (f, v) => v == null || v === '' ? '–' : f.type === 'money' ? RP_MONEY(v) : f.type === 'number' ? Math.round(v * 100) / 100 + '' : f.type === 'date' ? fmtDay(v) : v;
  const rpBucket = (iso, b) => { if (b === 'day') return iso; const d = new Date(iso); if (b === 'week') { const t = new Date(d); t.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return 'Week of ' + t.toISOString().slice(5, 10); } return iso.slice(0, 7); };
  function openReport(id) { G.reportId = id; nav('report'); }
  if (!G.reportId) G.reportId = 'sales';

  /* ---------------------------------------------------------------- the list of reports */
  const ReportsPage = {
    setup() {
      const LS = useList({ noun: 'reports', rows: () => REPORTS, search: (r, s) => (r.name + ' ' + r.desc + ' ' + r.module).toLowerCase().includes(s), sorts: [{ value: 'name', label: 'Name', get: r => r.name }], fields: () => [{ key: 'module', label: 'Module', type: 'select', options: [...new Set(REPORTS.map(r => r.module))].map(m => ({ value: m, label: m })), get: r => r.module }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const cols = [{ key: 'name', label: 'Report', identity: true, priority: 1, min: 240, text: r => r.name }, { key: 'module', label: 'Module', priority: 4, min: 100, fold: 'badge', text: r => r.module, variant: () => 'outline' }, { key: 'views', label: 'Saved views', priority: 2, min: 120, fold: 'meta', text: r => r.views.length + (r.views.length === 1 ? ' view' : ' views') }, { key: 'rows', label: 'Rows', priority: 3, min: 100, fold: 'meta', text: r => r.rows().length.toLocaleString() + ' rows' }];
      return { G, LS, cols, openReport };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Reports</h2><p class="text-sm text-muted-foreground">Shape the numbers yourself: columns, totals, grouping and charts. Save a view for yourself or your team.</p></div>
      <ListCard :list="LS"><ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="r => r.id" :base-meta="r => r.desc" empty="No reports match." @open="r => openReport(r.id)">
        <template #icon><span class="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="ChartColumn" :size="16"/></span></template></ListRows></ListCard>
    </div>`
  };

  /* ---------------------------------------------------------------- the report viewer */
  const ReportPage = {
    setup() {
      const rep = computed(() => REPORTS.find(r => r.id === G.reportId) || REPORTS[0]);
      const F = (k) => rep.value.fields.find(f => f.key === k);
      const R = reactive({ viewId: '', cols: [], pinned: [], groupBy: '', aggs: {}, footer: true, strip: false, all: false, page: 1, size: 25, q: '', branch: '', pay: '', range: 'all', collapsed: {}, chooser: false, groupOpen: false, groupPick: '', groupFolded: false, save: false, saveName: '', saveShare: 'me',
        chart: { type: 'column', x: 'branch', bucket: 'month', ys: [{ key: 'total', agg: 'sum' }], series: '', top: 0, labels: false }, chartErr: '', chartReady: false });
      function applyView(v) { R.viewId = v.id; R.cols = v.cols.slice(); R.pinned = v.pinned.slice(); R.groupBy = v.groupBy; R.chart = JSON.parse(JSON.stringify(v.chart)); R.page = 1; R.collapsed = {};
        R.aggs = Object.fromEntries(rep.value.fields.filter(f => f.agg).map(f => [f.key, f.agg])); }
      watch(() => rep.value.id, () => applyView(rep.value.views.find(v => v.def) || rep.value.views[0]), { immediate: true });
      const view = computed(() => rep.value.views.find(v => v.id === R.viewId));
      const viewOpts = computed(() => rep.value.views.map(v => ({ value: v.id, label: v.name + (v.shared === 'Just me' ? ' (mine)' : ' · ' + v.shared) })));
      /* filters (the list contract's in the app) */
      /* the list page design: the list contract's filters (simple and advanced), sort, quick tabs by payment, search, chips (P24, P39, P40, P87) */
      const LS = useList({ noun: 'rows', rows: () => rep.value.rows(), query: () => R.q, search: (r, q) => Object.values(r).join(' ').toLowerCase().includes(q), dir: 'desc',
        sorts: [{ value: 'date', label: 'Date', get: r => r.date }, { value: 'total', label: 'Total', get: r => r.total || 0 }, { value: 'qty', label: 'Qty', get: r => r.qty || 0 }],
        fields: () => rep.value.fields.filter(f => f.key !== 'id').map(f => f.type === 'date' ? { key: f.key, label: f.label, type: 'date', get: r => r[f.key] } : ['number', 'money'].includes(f.type) ? { key: f.key, label: f.label, type: 'number', get: r => r[f.key] } : { key: f.key, label: f.label, type: 'select', options: [...new Set(rep.value.rows().map(r => r[f.key]))].sort().map(v => ({ value: v, label: v })), get: r => r[f.key] }) });
      registerUrlList(LS, { get: () => R.q, set: (v) => { R.q = v; } });
      const quick = computed({ get: () => { const f = LS.S.filters.pay; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('pay', v === 'all' ? null : { op: 'in', value: [v] }) });
      const payTabs = computed(() => [{ value: 'all', label: 'All', count: rep.value.rows().length }, ...RP_PAY.map(p => ({ value: p, label: p, count: rep.value.rows().filter(r => r.pay === p).length }))]);
      const filtered = computed(() => LS.rows.value);   /* the list page design (owner, 2026-11-07): the list contract filters the report */
      const shown = computed(() => R.cols.map(F).filter(Boolean));
      const ordered = computed(() => [...shown.value.filter(f => R.pinned.includes(f.key)), ...shown.value.filter(f => !R.pinned.includes(f.key))]);
      const left = computed(() => { let x = 0; const o = {}; ordered.value.forEach(f => { if (R.pinned.includes(f.key)) { o[f.key] = x; x += f.w; } }); return o; });
      const tableW = computed(() => ordered.value.reduce((s, f) => s + f.w, 0));
      const aggOf = (rows, f) => { const a = R.aggs[f.key]; if (!a || !['number', 'money'].includes(f.type)) return null; return AGG[a][1](rows.map(r => r[f.key])); };
      /* groups or pages */
      const groups = computed(() => { if (!R.groupBy) return null; const m = new Map(); filtered.value.forEach(r => { const k = r[R.groupBy]; if (!m.has(k)) m.set(k, []); m.get(k).push(r); }); return [...m.entries()].map(([k, rows]) => ({ k, rows })).sort((a, b) => R.groupBy === 'date' ? (a.k < b.k ? 1 : -1) : b.rows.length - a.rows.length); });
      const pages = computed(() => R.all ? 1 : Math.max(1, Math.ceil((groups.value ? groups.value.length : filtered.value.length) / R.size)));
      const pageRows = computed(() => { const s = (R.page - 1) * R.size; return R.all ? filtered.value : filtered.value.slice(s, s + R.size); });
      const pageGroups = computed(() => { if (!groups.value) return null; const s = (R.page - 1) * R.size; return R.all ? groups.value : groups.value.slice(s, s + R.size); });
      const visibleRows = computed(() => pageGroups.value ? pageGroups.value.flatMap(g => g.rows) : pageRows.value);
      watch(() => [filtered.value.length, R.q, R.groupBy, R.all], () => { R.page = 1; });
      const numFields = computed(() => rep.value.fields.filter(f => ['number', 'money'].includes(f.type)));
      const groupFields = computed(() => rep.value.fields.filter(f => f.group));
      /* the column chooser */
      const toggleCol = (k) => { const i = R.cols.indexOf(k); if (i >= 0) { if (R.cols.length > 1) R.cols.splice(i, 1); R.pinned = R.pinned.filter(x => x !== k); } else R.cols.push(k); };
      const moveCol = (k, d) => { const i = R.cols.indexOf(k), j = i + d; if (i < 0 || j < 0 || j >= R.cols.length) return; R.cols.splice(j, 0, R.cols.splice(i, 1)[0]); };
      const togglePin = (k) => { if (R.pinned.includes(k)) R.pinned = R.pinned.filter(x => x !== k); else if (R.cols.includes(k)) R.pinned.push(k); };
      const openGroup = () => { R.groupPick = R.groupBy; R.groupOpen = true; };
      const applyGroup = () => { R.groupBy = R.groupPick; R.collapsed = {}; if (R.groupBy && R.groupFolded) [...new Set(filtered.value.map(x => x[R.groupBy]))].forEach(k => { R.collapsed[k] = true; }); R.groupOpen = false; };
      const chooserList = computed(() => [...R.cols.map(F), ...rep.value.fields.filter(f => !R.cols.includes(f.key))].filter(Boolean));
      /* views */
      const saveView = () => { if (!R.saveName.trim()) return; const v = { id: ulid('v'), name: R.saveName.trim(), owner: ME.name, shared: R.saveShare === 'me' ? 'Just me' : 'Everyone', cols: R.cols.slice(), pinned: R.pinned.slice(), groupBy: R.groupBy, chart: JSON.parse(JSON.stringify(R.chart)) };
        rep.value.views.push(v); R.viewId = v.id; R.save = false; toast('View saved', v.name + ' · ' + v.shared, 'Bookmark'); R.saveName = ''; };
      /* exports of the table: the server makes them over every filtered row, as a background job (P95) */
      const exportItems = [{ id: 'xlsx', label: 'Excel (.xlsx)', icon: 'Sheet' }, { id: 'csv', label: 'CSV', icon: 'FileText' }, { id: 'pdf', label: 'PDF', icon: 'FileDown' }];
      const exportTable = (it) => startJobRun({ kind: 'report', title: rep.value.name + (view.value ? ': ' + view.value.name : ''), format: { xlsx: 'Excel', csv: 'CSV', pdf: 'PDF' }[it.id], rows: filtered.value.length,
        columns: ordered.value.slice(0, 4).map(f => f.label), preview: filtered.value.slice(0, 4).map(r => ordered.value.slice(0, 4).map(f => String(rpFmt(f, r[f.key])))),
        params: [['Report', rep.value.name], ['View', view.value ? view.value.name : 'Unsaved'], ['Filters', (LS.chips().map(c => c.text).join(' · ') || 'None') + (R.q ? ' · search "' + R.q + '"' : '')], ['Columns', ordered.value.map(f => f.label).join(', ')], ['Grouping', R.groupBy ? F(R.groupBy).label : 'None'], ['Totals', Object.entries(R.aggs).filter(([, a]) => a).map(([k, a]) => AGG[a][0] + ' of ' + F(k).label).join(', ') || 'None']] });
      /* the chart builder (Highcharts) */
      const chartEl = ref(null); let chart = null;
      const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      function chartData() {
        const c = R.chart, xf = F(c.x); if (!xf) return { cats: [], series: [] };
        const key = (r) => xf.type === 'date' ? rpBucket(r[c.x], c.bucket) : r[c.x];
        const cats = [...new Set(filtered.value.map(key))]; if (xf.type === 'date') cats.sort();
        const series = [];
        if (c.series) { const sv = [...new Set(filtered.value.map(r => r[c.series]))]; const y = c.ys[0]; sv.forEach(s => series.push({ name: s, data: cats.map(k => AGG[y.agg][1](filtered.value.filter(r => key(r) === k && r[c.series] === s).map(r => r[y.key]))) })); }
        else c.ys.forEach(y => series.push({ name: AGG[y.agg][0] + ' of ' + F(y.key).label, data: cats.map(k => AGG[y.agg][1](filtered.value.filter(r => key(r) === k).map(r => r[y.key]))) }));
        let order = cats.map((_, i) => i);
        if (xf.type !== 'date') { const tot = cats.map((_, i) => series.reduce((s, x) => s + x.data[i], 0)); order.sort((a, b) => tot[b] - tot[a]); if (c.top) order = order.slice(0, c.top); }
        return { cats: order.map(i => cats[i]), series: series.map(s => ({ ...s, data: order.map(i => Math.round(s.data[i] * 100) / 100) })) };
      }
      async function draw() {
        if (!chartEl.value) return;
        let H; try { H = await loadHighcharts(); } catch (e) { R.chartErr = 'The chart library could not load. Check the connection and try again.'; return; }
        R.chartErr = ''; R.chartReady = true;
        const fg = getComputedStyle(document.body).color, muted = css('--muted-foreground') ? 'hsl(' + css('--muted-foreground') + ')' : fg, grid = css('--border') ? 'hsl(' + css('--border') + ')' : '#e5e7eb';
        const colors = ['--c1', '--c2', '--c3', '--c4', '--c5'].map(css).filter(Boolean);
        const { cats, series } = chartData(); const c = R.chart; const money = c.ys.some(y => F(y.key).type === 'money');
        const kpi = c.type === 'kpi';
        const opts = { chart: { type: c.type === 'kpi' ? 'column' : c.type, backgroundColor: 'transparent', style: { fontFamily: 'inherit' }, height: 320, animation: false },
          colors, title: { text: kpi ? null : (series[0] ? series[0].name : '') + ' by ' + F(c.x).label.toLowerCase() + (c.series ? ', split by ' + F(c.series).label.toLowerCase() : ''), style: { color: fg, fontSize: '13px', fontWeight: '600' } },
          credits: { enabled: false }, legend: { enabled: series.length > 1 || c.type === 'pie', itemStyle: { color: fg, fontWeight: '500' } },
          xAxis: { categories: cats, labels: { style: { color: muted } }, lineColor: grid, tickColor: grid },
          yAxis: { title: { text: null }, gridLineColor: grid, labels: { style: { color: muted }, formatter() { return money ? (this.value >= 1e6 ? (this.value / 1e6) + 'M' : this.value >= 1e3 ? (this.value / 1e3) + 'k' : this.value) : this.value; } } },
          tooltip: { valuePrefix: money ? 'TZS ' : '', valueDecimals: 0 },
          plotOptions: { series: { animation: false, dataLabels: { enabled: !!c.labels, style: { color: fg, textOutline: 'none', fontWeight: '500' } }, stacking: c.series && ['column', 'bar', 'area'].includes(c.type) ? 'normal' : undefined }, pie: { dataLabels: { enabled: true, style: { color: fg, textOutline: 'none' } } } },
          series: c.type === 'pie' ? [{ name: series[0] ? series[0].name : '', data: cats.map((k, i) => ({ name: String(k), y: series[0] ? series[0].data[i] : 0 })) }] : c.type === 'scatter' ? series.map(s => ({ ...s, data: s.data.map((v, i) => [i, v]) })) : series,
          exporting: { enabled: false, fallbackToExportServer: false, filename: rep.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }, accessibility: { enabled: true } };
        if (kpi) { R.kpi = series[0] ? series[0].data.reduce((s, v) => s + v, 0) : 0; if (chart) { chart.destroy(); chart = null; } return; }
        if (chart) chart.destroy(); chart = H.chart(chartEl.value, opts);
      }
      watch(() => [JSON.stringify(R.chart), filtered.value.length, G.theme], () => nextTick(draw));
      onMounted(() => nextTick(draw)); onBeforeUnmount(() => { if (chart) { chart.destroy(); chart = null; } });
      const chartItems = [{ id: 'png', label: 'Picture (PNG)', icon: 'Image' }, { id: 'svg', label: 'Vector (SVG)', icon: 'PenTool' }, { id: 'pdf', label: 'PDF', icon: 'FileDown' }, { separator: true }, { id: 'csv', label: 'The chart\'s data (CSV)', icon: 'FileText' }];
      const exportChart = (it) => { if (!chart) return; if (it.id === 'csv') chart.downloadCSV(); else chart.exportChartLocal({ type: { png: 'image/png', svg: 'image/svg+xml', pdf: 'application/pdf' }[it.id] }); toast('Chart downloaded', { png: 'PNG', svg: 'SVG', pdf: 'PDF', csv: 'CSV' }[it.id] + ', made in your browser.', 'Download'); };
      const addY = () => { const f = numFields.value.find(n => !R.chart.ys.some(y => y.key === n.key)) || numFields.value[0]; R.chart.ys.push({ key: f.key, agg: 'sum' }); R.chart.series = ''; };
      const types = [['column', 'Column', 'ChartColumn'], ['bar', 'Bar', 'ChartBar'], ['line', 'Line', 'ChartLine'], ['area', 'Area', 'ChartArea'], ['pie', 'Pie', 'ChartPie'], ['scatter', 'Scatter', 'ChartScatter'], ['kpi', 'Number', 'Hash']];
      const saveChart = () => { if (view.value) { view.value.chart = JSON.parse(JSON.stringify(R.chart)); toast('Chart saved with the view', view.value.name, 'Bookmark'); } else R.save = true; };
      return { G, R, rep, view, viewOpts, F, filtered, shown, ordered, left, tableW, aggOf, groups, pages, pageRows, pageGroups, visibleRows, numFields, groupFields, toggleCol, moveCol, togglePin, chooserList, saveView, applyView,
        exportItems, exportTable, openGroup, applyGroup, LS, quick, payTabs, chartEl, chartItems, exportChart, addY, types, saveChart, rpFmt, AGG, RP_BRANCH, RP_PAY, nav, RP_MONEY };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb"><BackButton/><button type="button" class="hover:text-foreground" @click="nav('reports')">Reports</button><Icon name="ChevronRight" :size="12"/><span class="text-foreground">{{ rep.name }}</span></nav>
      <div class="flex flex-wrap items-start gap-3"><div class="min-w-0 flex-1"><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ rep.name }}</h2><p class="text-sm text-muted-foreground">{{ rep.desc }}</p></div>
        <div class="flex w-full flex-wrap gap-2 sm:w-auto"><Select class="min-w-0 flex-1 sm:w-64 sm:flex-none" :model-value="R.viewId" @update:model-value="id => applyView(rep.views.find(v => v.id === id))" :options="viewOpts"/>
          <Button variant="outline" @click="R.save = true"><Icon name="Bookmark" :size="15"/>Save view</Button>
          </div></div>
      <Card class="min-w-0"><div class="grid gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]" data-testid="chart-builder"><div class="grid content-start gap-3">
          <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold">Chart</h3><div class="flex gap-1"><Button variant="ghost" size="sm" @click="saveChart"><Icon name="Bookmark" :size="14"/>Save</Button>
            <DropdownMenu :items="chartItems" @select="exportChart"><template #trigger><Button variant="outline" size="sm" :disabled="R.chart.type==='kpi'"><Icon name="Download" :size="14"/>Download</Button></template></DropdownMenu></div></div>
          <div class="flex flex-wrap gap-1" role="radiogroup" aria-label="Chart type"><button v-for="t in types" :key="t[0]" type="button" role="radio" :aria-checked="R.chart.type===t[0]" @click="R.chart.type = t[0]" :class="['inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium', R.chart.type===t[0] ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent']"><Icon :name="t[2]" :size="13"/>{{ t[1] }}</button></div>
          <div class="grid grid-cols-2 gap-2 text-sm"><label class="grid gap-1"><span class="text-xs text-muted-foreground">{{ R.chart.type==='pie' ? 'Slices' : 'X axis' }}</span><Select size="sm" v-model="R.chart.x" :options="groupFields.map(f => ({ value: f.key, label: f.label }))"/></label>
            <label v-if="F(R.chart.x) && F(R.chart.x).type==='date'" class="grid gap-1"><span class="text-xs text-muted-foreground">By</span><Select size="sm" v-model="R.chart.bucket" :options="[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]"/></label>
            <label v-else class="grid gap-1"><span class="text-xs text-muted-foreground">Show</span><Select size="sm" :model-value="String(R.chart.top)" @update:model-value="v => R.chart.top = +v" :options="[{ value: '0', label: 'All' }, { value: '5', label: 'Top 5' }, { value: '10', label: 'Top 10' }]"/></label></div>
          <div class="grid gap-1.5"><span class="text-xs text-muted-foreground">{{ R.chart.type==='pie' || R.chart.type==='kpi' ? 'Measure' : 'Y axis: measures' }}</span>
            <div v-for="(y, i) in R.chart.ys" :key="i" class="flex items-center gap-2"><Select class="flex-1" size="sm" v-model="y.agg" :options="Object.entries(AGG).map(([k, v]) => ({ value: k, label: v[0] }))"/><span class="text-xs text-muted-foreground">of</span><Select class="flex-1" size="sm" v-model="y.key" :options="numFields.map(f => ({ value: f.key, label: f.label }))"/><Button v-if="R.chart.ys.length > 1" variant="ghost" size="icon-sm" aria-label="Remove measure" @click="R.chart.ys.splice(i, 1)"><Icon name="X" :size="14"/></Button></div>
            <Button v-if="!['pie','kpi'].includes(R.chart.type) && !R.chart.series && R.chart.ys.length < numFields.length" variant="ghost" size="sm" class="justify-self-start" @click="addY"><Icon name="Plus" :size="14"/>Add a measure</Button></div>
          <div v-if="!['pie','kpi','scatter'].includes(R.chart.type)" class="grid grid-cols-2 gap-2 text-sm"><label class="grid gap-1"><span class="text-xs text-muted-foreground">Split by (series)</span><Select size="sm" :model-value="R.chart.series" @update:model-value="v => { R.chart.series = v; if (v) R.chart.ys.splice(1) }" :options="[{ value: '', label: 'Nothing' }, ...groupFields.filter(f => f.key !== R.chart.x && f.type !== 'date').map(f => ({ value: f.key, label: f.label }))]"/></label>
            <label class="flex items-end gap-2 pb-1.5"><Switch v-model="R.chart.labels" aria-label="Show values"/><span class="text-sm">Values</span></label></div>
          </div><div class="grid min-w-0 content-start gap-2">
          <p v-if="R.chartErr" class="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{{ R.chartErr }}</p>
          <div v-if="R.chart.type==='kpi'" class="grid place-items-center rounded-lg border bg-muted/30 py-10 text-center"><p class="text-xs text-muted-foreground">{{ AGG[R.chart.ys[0].agg][0] }} of {{ F(R.chart.ys[0].key).label.toLowerCase() }}</p><p class="mt-1 text-3xl font-semibold tnum">{{ rpFmt(F(R.chart.ys[0].key), R.kpi || 0) }}</p></div>
          <div v-show="R.chart.type!=='kpi'" ref="chartEl" class="min-h-[320px]" data-testid="chart" aria-label="Chart"></div>
          <p class="text-[11px] text-muted-foreground">Charts use Highcharts; pictures and the chart's data are made in your browser.</p></div></div></Card>
      <ListCard :list="LS" :tabs="payTabs" :quick="quick" :search="R.q" placeholder="Search the report" @update:quick="v => quick = v" @update:search="v => R.q = v">
        <template #tools><Button variant="ghost" size="sm" @click="openGroup" :aria-label="'Group rows' + (R.groupBy ? ': by ' + F(R.groupBy).label : '')"><Icon name="Layers" :size="15"/><span class="hidden sm:inline">Group</span><Badge v-if="R.groupBy" variant="secondary" class="ml-0.5">{{ F(R.groupBy).label }}</Badge></Button><Button variant="ghost" size="sm" @click="R.chooser = true"><Icon name="Columns3" :size="15"/><span class="hidden sm:inline">Columns · {{ R.cols.length }}</span></Button></template>
        <template #actions><DropdownMenu :items="exportItems" @select="exportTable"><template #trigger><Button size="sm"><Icon name="FileDown" :size="15"/><span class="hidden sm:inline">Export</span></Button></template></DropdownMenu></template>
        <template #summary><div class="grid gap-3 px-3 py-2.5 sm:px-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><span class="tnum text-muted-foreground">{{ filtered.length.toLocaleString() }} of {{ rep.rows().length.toLocaleString() }} rows</span>
            <label class="flex items-center gap-2"><Switch v-model="R.strip" aria-label="Totals of every filtered row"/><span>Totals of all rows</span></label><label class="flex items-center gap-2"><Switch v-model="R.footer" aria-label="Totals row under the table"/><span>Totals row</span></label><label class="flex items-center gap-2"><Switch v-model="R.all" aria-label="Show all rows on one page"/><span>All rows</span></label></div>
          <div v-if="R.strip" class="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Totals of every filtered row" data-testid="agg-strip">
            <div class="rounded-lg border bg-background p-2.5"><p class="text-xs text-muted-foreground">Rows matching</p><p class="text-lg font-semibold tnum">{{ filtered.length.toLocaleString() }}</p></div>
            <div v-for="f in numFields.filter(n => R.aggs[n.key])" :key="f.key" class="rounded-lg border bg-background p-2.5"><p class="text-xs text-muted-foreground">{{ AGG[R.aggs[f.key]][0] }} of {{ f.label.toLowerCase() }}</p><p class="truncate text-lg font-semibold tnum">{{ rpFmt(f, aggOf(filtered, f)) }}</p></div></div></div></template>
        <div class="max-h-[560px] overflow-auto" data-testid="report-scroll" tabindex="0" aria-label="Report table">
          <table class="border-separate border-spacing-0 text-sm" :style="{ width: tableW + 'px', minWidth: '100%' }">
            <thead><tr><th v-for="f in ordered" :key="f.key" scope="col" :style="{ width: f.w + 'px', minWidth: f.w + 'px', left: R.pinned.includes(f.key) ? left[f.key] + 'px' : null }"
              :class="['sticky top-0 border-b bg-muted px-3 py-2 text-left text-xs font-medium text-muted-foreground', R.pinned.includes(f.key) ? 'z-30' : 'z-20', ['number','money'].includes(f.type) && 'text-right']"><span class="inline-flex items-center gap-1"><Icon v-if="R.pinned.includes(f.key)" name="Pin" :size="11"/>{{ f.label }}</span></th></tr></thead>
            <tbody>
              <template v-if="pageGroups"><template v-for="g in pageGroups" :key="g.k">
                <tr class="cursor-pointer" @click="R.collapsed[g.k] = !R.collapsed[g.k]"><td v-for="(f, i) in ordered" :key="f.key" :style="{ left: R.pinned.includes(f.key) ? left[f.key] + 'px' : null }" :class="['border-b bg-accent px-3 py-2 font-medium', R.pinned.includes(f.key) && 'sticky z-10', ['number','money'].includes(f.type) && 'text-right tnum']">
                  <template v-if="i === 0"><span class="inline-flex items-center gap-1.5 whitespace-nowrap"><Icon :name="R.collapsed[g.k] ? 'ChevronRight' : 'ChevronDown'" :size="14"/>{{ rpFmt(F(R.groupBy), g.k) }} <span class="text-xs font-normal text-muted-foreground">· {{ g.rows.length }}</span></span></template>
                  <template v-else-if="aggOf(g.rows, f) !== null">{{ rpFmt(f, aggOf(g.rows, f)) }}</template></td></tr>
                <template v-if="!R.collapsed[g.k]"><tr v-for="r in g.rows" :key="r.id" class="hover:[&>td]:bg-accent/50"><td v-for="f in ordered" :key="f.key" :style="{ left: R.pinned.includes(f.key) ? left[f.key] + 'px' : null }" :class="['border-b bg-card px-3 py-1.5', R.pinned.includes(f.key) && 'sticky z-10', ['number','money'].includes(f.type) && 'text-right tnum']">{{ rpFmt(f, r[f.key]) }}</td></tr></template>
              </template></template>
              <tr v-else v-for="r in pageRows" :key="r.id" class="hover:[&>td]:bg-accent/50"><td v-for="f in ordered" :key="f.key" :style="{ left: R.pinned.includes(f.key) ? left[f.key] + 'px' : null }" :class="['border-b bg-card px-3 py-1.5', R.pinned.includes(f.key) && 'sticky z-10', ['number','money'].includes(f.type) && 'text-right tnum', f.key==='id' && 'font-mono text-xs']">{{ rpFmt(f, r[f.key]) }}</td></tr>
              <tr v-if="!filtered.length"><td :colspan="ordered.length" class="px-3 py-10 text-center text-muted-foreground">No rows match these filters.</td></tr>
            </tbody>
            <tfoot v-if="R.footer && filtered.length"><tr><td v-for="(f, i) in ordered" :key="f.key" :style="{ left: R.pinned.includes(f.key) ? left[f.key] + 'px' : null }" :class="['sticky bottom-0 border-t-2 bg-muted px-3 py-2 font-semibold', R.pinned.includes(f.key) ? 'z-30' : 'z-20', ['number','money'].includes(f.type) && 'text-right tnum']">
              <template v-if="i === 0"><span class="text-xs font-medium text-muted-foreground">{{ R.all ? 'All rows' : 'This page' }}</span></template><template v-else-if="aggOf(visibleRows, f) !== null">{{ rpFmt(f, aggOf(visibleRows, f)) }}</template></td></tr></tfoot>
          </table></div>
          <div v-if="!R.all && pages > 1" class="flex items-center justify-between gap-2 border-t px-3 py-2 text-sm"><span class="text-muted-foreground tnum">Page {{ R.page }} of {{ pages }} · {{ filtered.length.toLocaleString() }} rows</span>
            <span class="flex gap-1"><Button variant="outline" size="sm" :disabled="R.page <= 1" @click="R.page--" aria-label="Previous page"><Icon name="ChevronLeft" :size="15"/></Button><Button variant="outline" size="sm" :disabled="R.page >= pages" @click="R.page++" aria-label="Next page"><Icon name="ChevronRight" :size="15"/></Button></span></div></ListCard>
      <Dialog :open="R.chooser" @update:open="v => R.chooser = v"><div class="flex max-h-[85vh] min-h-0 min-w-0 flex-col" data-testid="columns-dialog">
        <div class="border-b p-5 pr-12"><h2 class="text-lg font-semibold">Columns</h2><p class="text-sm text-muted-foreground">Tick the columns to show, move them up or down, pin them to the left (pinned columns stay while you scroll) and choose the total each number column shows.</p></div>
        <ul class="grid min-h-0 min-w-0 gap-1 overflow-y-auto p-3"><li v-for="f in chooserList" :key="f.key" class="flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2">
          <Checkbox :model-value="R.cols.includes(f.key)" @update:model-value="toggleCol(f.key)" :aria-label="'Show ' + f.label"/><span class="min-w-0 flex-1 truncate text-sm">{{ f.label }}</span>
          <Select v-if="['number','money'].includes(f.type)" class="w-[6.25rem] shrink-0 sm:w-[7.5rem]" size="sm" :model-value="R.aggs[f.key] || ''" @update:model-value="v => R.aggs[f.key] = v" :options="[{ value: '', label: 'No total' }, ...Object.entries(AGG).map(([k, v]) => ({ value: k, label: v[0] }))]"/>
          <Button variant="ghost" size="icon-sm" :aria-label="(R.pinned.includes(f.key) ? 'Unpin ' : 'Pin ') + f.label" :disabled="!R.cols.includes(f.key)" @click="togglePin(f.key)"><Icon :name="R.pinned.includes(f.key) ? 'PinOff' : 'Pin'" :size="14" :class="R.pinned.includes(f.key) && 'text-primary'"/></Button>
          <Button variant="ghost" size="icon-sm" :aria-label="'Move ' + f.label + ' up'" :disabled="!R.cols.includes(f.key)" @click="moveCol(f.key, -1)"><Icon name="ArrowUp" :size="14"/></Button>
          <Button variant="ghost" size="icon-sm" :aria-label="'Move ' + f.label + ' down'" :disabled="!R.cols.includes(f.key)" @click="moveCol(f.key, 1)"><Icon name="ArrowDown" :size="14"/></Button></li></ul>
        <div class="flex justify-end gap-2 border-t p-4"><Button @click="R.chooser = false">Done</Button></div></div></Dialog>
      <Dialog :open="R.groupOpen" @update:open="v => R.groupOpen = v"><div class="grid gap-4 p-5 sm:p-6" data-testid="group-dialog">
        <div><h2 class="text-lg font-semibold">Group rows</h2><p class="text-sm text-muted-foreground">Rows with the same value are gathered under one row that shows how many there are and their subtotals. Grouping does not hide rows; filters do.</p></div>
        <div class="grid gap-1.5" role="radiogroup" aria-label="Group by"><button type="button" role="radio" :aria-checked="!R.groupPick" @click="R.groupPick = ''" :class="['flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm', !R.groupPick ? 'border-primary bg-primary/5' : 'hover:bg-accent']"><span :class="['grid h-4 w-4 place-items-center rounded-full border', !R.groupPick ? 'border-primary' : 'border-input']"><span v-if="!R.groupPick" class="h-2 w-2 rounded-full bg-primary"></span></span>No grouping<span class="ml-auto text-xs text-muted-foreground">one row per sale</span></button>
          <button v-for="f in groupFields" :key="f.key" type="button" role="radio" :aria-checked="R.groupPick===f.key" @click="R.groupPick = f.key" :class="['flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm', R.groupPick===f.key ? 'border-primary bg-primary/5' : 'hover:bg-accent']"><span :class="['grid h-4 w-4 place-items-center rounded-full border', R.groupPick===f.key ? 'border-primary' : 'border-input']"><span v-if="R.groupPick===f.key" class="h-2 w-2 rounded-full bg-primary"></span></span>By {{ f.label.toLowerCase() }}<span class="ml-auto text-xs text-muted-foreground tnum">{{ new Set(filtered.map(x => x[f.key])).size }} groups</span></button></div>
        <label v-if="R.groupPick" class="flex items-center gap-2 text-sm"><Switch v-model="R.groupFolded" aria-label="Start with the groups folded"/>Start with the groups folded (only their subtotals)</label>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R.groupOpen = false">Cancel</Button><Button @click="applyGroup">{{ R.groupPick ? 'Group by ' + F(R.groupPick).label.toLowerCase() : 'Show every row' }}</Button></div></div></Dialog>
      <Dialog :open="R.save" @update:open="v => R.save = v"><div class="grid gap-4 p-5 sm:p-6"><div><h2 class="text-lg font-semibold">Save this view</h2><p class="text-sm text-muted-foreground">The columns, pins, grouping, totals and chart, under a name.</p></div>
        <div class="grid gap-1.5"><Label>Name</Label><Input v-model="R.saveName" placeholder="Solar this month"/></div>
        <div class="flex gap-2"><Button size="sm" :variant="R.saveShare==='me' ? 'default' : 'outline'" @click="R.saveShare='me'">Just me</Button><Button size="sm" :variant="R.saveShare==='all' ? 'default' : 'outline'" @click="R.saveShare='all'">Share with everyone</Button></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R.save = false">Cancel</Button><Button :disabled="!R.saveName.trim()" @click="saveView"><Icon name="Bookmark" :size="15"/>Save view</Button></div></div></Dialog>
    </div>`
  };
