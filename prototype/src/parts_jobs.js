
  /* ================================================================ P95: BACKGROUND WORK AND ITS RESULTS (kit 1.15.0)
     Anything that may take more than a few seconds (an export, a report run, an import, a big bulk action) runs as a job.
     The button says so and the person keeps working. Done or failed sends a notification that opens the JOB PAGE: what was
     asked, progress, the result (Download, a preview, the row count, when it expires), errors in plain words, Run again.
     My exports and reports (avatar menu) lists a person's runs; admins see all jobs in Queue (P97).
     startJobRun({ kind, title, detail, format, params, rows, columns, preview, download, fail }) is the one entry point. */
  const JOB_KIND = { export: ['Export', 'FileDown'], report: ['Report', 'ChartColumn'], import: ['Import', 'FileUp'], bulk: ['Bulk action', 'ListChecks'] };
  const JOB_ST = { waiting: ['Waiting', 'secondary'], running: ['Running', 'default'], done: ['Ready', 'success'], failed: ['Failed', 'destructive'], cancelled: ['Cancelled', 'outline'], expired: ['Expired', 'outline'] };
  const JOBRUNS = reactive([
    { id: 'jr41', no: 'JOB-0041', kind: 'export', title: 'Customer Feedback: Mwanza responses', format: 'Excel', status: 'done', progress: 100, by: 'Amina Juma', started: 'Today 09:12', finished: 'Today 09:13', took: '48 s', expires: 6, rows: 2340, size: '412 KB', file: 'customer-feedback-mwanza.xlsx',
      params: [['Module', 'Responses'], ['Filters', 'Form is Customer Feedback: Mwanza · Submitted in October'], ['Columns', 'Submitted, Respondent, Score, Branch, 14 answers'], ['Format', 'Excel (.xlsx)']],
      columns: ['Submitted', 'Respondent', 'Score', 'Branch'], preview: [['31 Oct 17:42', 'Anna Mollel', '86%', 'Mwanza'], ['31 Oct 16:05', 'J. Massawe', '72%', 'Mwanza'], ['31 Oct 11:20', 'Grace Lyimo', '91%', 'Mwanza'], ['30 Oct 18:02', 'Peter Mushi', '64%', 'Mwanza']] },
    { id: 'jr42', no: 'JOB-0042', kind: 'report', title: 'Sales by branch, October', format: 'PDF', status: 'running', progress: 40, by: 'Amina Juma', started: 'Just now', params: [['Report', 'Sales by branch'], ['Filters', 'October 2026 · All branches'], ['Grouping', 'Branch, then week'], ['Format', 'PDF']] },
    { id: 'jr39', no: 'JOB-0039', kind: 'import', title: 'Import users: staff-arusha.csv', format: 'CSV', status: 'failed', progress: 0, by: 'Amina Juma', started: 'Yesterday 15:30', finished: 'Yesterday 15:30', took: '2 s', rows: 18,
      params: [['Module', 'Users'], ['File', 'staff-arusha.csv (18 rows)'], ['If a person exists', 'Skip them']],
      summary: 'Nothing was imported. Fix these rows in the file and run it again.', errors: [['Row 7', 'The email "anna@" is not a valid email address.'], ['Row 12', 'The phone "+255 71" is too short.'], ['Row 15', 'The role "Cashier" does not exist. Roles: Owner, Admin, Editor, Viewer, Branch supervisor.']] },
    { id: 'jr31', no: 'JOB-0031', kind: 'export', title: 'Roles', format: 'CSV', status: 'expired', progress: 100, by: 'Amina Juma', started: '27 Oct 10:02', finished: '27 Oct 10:02', took: '1 s', rows: 9, file: 'roles.csv', expiredOn: '3 Nov',
      params: [['Module', 'Roles'], ['Filters', 'None'], ['Format', 'CSV']] },
  ]);
  let jobNo = 43;
  const jobById = (id) => JOBRUNS.find(j => j.id === id);
  function openJob(id) { G.jobId = id; nav('job'); }
  /* the one entry point: create a run, put it in the queue, let the person work, tell them when it is done */
  function startJobRun(o) {
    const run = reactive({ id: ulid('jr'), no: 'JOB-' + String(jobNo++).padStart(4, '0'), kind: o.kind || 'export', title: o.title, format: o.format || 'CSV', status: 'waiting', progress: 0, by: ME.name, started: 'Just now',
      params: o.params || [], rows: o.rows, columns: o.columns, preview: o.preview, file: o.file, download: o.download ? markRaw(o.download) : null, fail: o.fail });
    JOBRUNS.unshift(run);
    const q = reactive({ id: ulid('j'), name: JOB_KIND[run.kind][0], detail: run.title, queue: run.kind + 's', status: 'waiting', progress: 0, tries: 0, by: ME.name, when: 'Queued just now', run: run.id });
    if (typeof SYS !== 'undefined') SYS.jobs.unshift(q);
    toast(JOB_KIND[run.kind][0] + ' started', 'We\'ll let you know when it is ready. Keep working.', 'Hourglass');
    let t = null;
    setTimeout(() => { if (run.status !== 'waiting') return; run.status = 'running'; q.status = 'running'; q.tries = 1; q.when = 'Started just now';
      t = setInterval(() => {
        if (run.status !== 'running') { clearInterval(t); return; }
        run.progress = Math.min(100, run.progress + 25); q.progress = run.progress;
        if (run.progress < 100) return;
        clearInterval(t);
        if (run.fail) { run.status = 'failed'; q.status = 'failed'; q.error = run.fail; run.summary = 'It stopped before the end. Nothing was changed.'; run.errors = [['', run.fail]]; }
        else { run.status = 'done'; q.status = 'done'; run.expires = 7; run.size = run.size || '18 KB'; }
        run.finished = 'Just now'; run.took = '3 s'; q.when = 'Finished just now';
        const ok = run.status === 'done';
        if (typeof SYS !== 'undefined') SYS.inbox.unshift({ id: ulid('n'), unread: true, icon: ok ? JOB_KIND[run.kind][1] : 'TriangleAlert', title: ok ? (run.kind === 'import' ? 'Your import is done' : 'Your ' + JOB_KIND[run.kind][0].toLowerCase() + ' is ready') : 'Your ' + JOB_KIND[run.kind][0].toLowerCase() + ' failed', body: run.title + (ok && run.rows ? ' · ' + run.rows + ' rows' : '') + '. Open it to ' + (ok ? 'download it.' : 'see why.'), when: 'Just now', job: run.id });
        toast(ok ? 'Ready: ' + run.title : 'Failed: ' + run.title, ok ? 'Open it from the notification, or My exports and reports.' : 'Open it to see why.', ok ? 'CircleCheck' : 'TriangleAlert');
      }, 600);
    }, 500);
    return run;
  }
  function rerunJob(j) { const n = startJobRun({ kind: j.kind, title: j.title, format: j.format, params: j.params, rows: j.rows, columns: j.columns, preview: j.preview, file: j.file, download: j.download }); openJob(n.id); }
  function cancelJob(j) { j.status = 'cancelled'; j.finished = 'Just now'; if (typeof SYS !== 'undefined') { const q = SYS.jobs.find(x => x.run === j.id); if (q) SYS.jobs.splice(SYS.jobs.indexOf(q), 1); } toast('Cancelled', j.title, 'CircleX'); }
  function downloadJob(j) { if (j.download) j.download(); else toast('Downloading ' + (j.file || 'the file'), j.size ? j.size + ' · ' + (j.rows || 0) + ' rows' : '', 'Download'); }

  const JobProgress = { props: { value: Number },
    template: `<div class="grid gap-1"><div class="flex justify-between text-xs"><span class="text-muted-foreground">Working on it</span><span class="tnum">{{ value }}%</span></div><div class="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100"><Meter :value="value" class="rounded-full bg-primary"/></div></div>` };
  const JobPreview = { props: { id: String },   /* what a RecordLink to a job opens (P85) */
    setup(p) { return { j: computed(() => jobById(p.id)), JOB_ST, JOB_KIND }; },
    template: `<div v-if="j" class="grid gap-3 text-sm"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="JOB_KIND[j.kind][1]" :size="18"/></span><div class="min-w-0"><p class="font-mono text-xs text-muted-foreground">{{ j.no }}</p><h2 class="truncate font-semibold">{{ j.title }}</h2></div><span class="ml-auto"><Badge :variant="JOB_ST[j.status][1]">{{ JOB_ST[j.status][0] }}</Badge></span></div>
      <JobProgress v-if="j.status==='running'" :value="j.progress"/><dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2"><template v-for="p in j.params" :key="p[0]"><dt class="text-muted-foreground">{{ p[0] }}</dt><dd>{{ p[1] }}</dd></template></dl></div>`
  };

  /* ---------------------------------------------------------------- My exports and reports */
  const MyJobsPage = {
    setup() {
      const mine = () => JOBRUNS.filter(j => j.by === ME.name);
      const LS = useList({ noun: 'runs', rows: mine, search: (j, s) => (j.title + ' ' + j.no + ' ' + j.kind).toLowerCase().includes(s), sorts: [{ value: 'new', label: 'Newest first', get: j => JOBRUNS.indexOf(j) }],
        fields: () => [{ key: 'status', label: 'Status', type: 'select', options: Object.entries(JOB_ST).map(([k, v]) => ({ value: k, label: v[0] })), get: j => j.status }, { key: 'kind', label: 'Kind', type: 'select', options: Object.entries(JOB_KIND).map(([k, v]) => ({ value: k, label: v[0] })), get: j => j.kind }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const quick = computed({ get: () => { const f = LS.S.filters.status; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('status', v === 'all' ? null : { op: 'in', value: [v] }) });
      const tabs = computed(() => [{ value: 'all', label: 'All', count: mine().length }, ...['running', 'done', 'failed'].map(k => ({ value: k, label: JOB_ST[k][0], count: mine().filter(j => j.status === k).length }))]);
      const cols = [{ key: 'title', label: 'What', identity: true, priority: 1, min: 260, text: j => j.title }, { key: 'status', label: 'Status', status: true, priority: 2, min: 180, text: j => JOB_ST[j.status][0], variant: j => JOB_ST[j.status][1] }, { key: 'kind', label: 'Kind', priority: 5, min: 100, fold: 'badge', text: j => JOB_KIND[j.kind][0], variant: () => 'outline' }, { key: 'when', label: 'Started', priority: 3, min: 140, fold: 'meta', text: j => j.started }, { key: 'result', label: 'Result', priority: 4, min: 170, fold: 'meta', text: j => j.status === 'done' ? (j.rows ? j.rows.toLocaleString() + ' rows · ' : '') + 'kept ' + j.expires + ' more days' : j.status === 'expired' ? 'File expired ' + j.expiredOn : j.status === 'failed' ? (j.errors || []).length + ' problems' : '' }];
      return { G, LS, quick, tabs, cols, openJob, downloadJob, JOB_ST, JOB_KIND };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">My exports and reports</h2><p class="text-sm text-muted-foreground">Everything you started that runs in the background. Files are kept for 7 days.</p></div>
      <ListCard :list="LS" :tabs="tabs" v-model:quick="quick">
        <ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="j => j.id" :base-meta="j => j.no + ' · ' + j.format" empty="Nothing yet. Exports, reports and imports you start show up here." @open="j => openJob(j.id)">
          <template #icon="{ row: j }"><span :class="['grid h-9 w-9 place-items-center rounded-lg', j.status==='failed' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary']"><Icon :name="JOB_KIND[j.kind][1]" :size="16"/></span></template>
          <template #cell-status="{ row: j }"><span class="inline-flex items-center gap-2"><Badge :variant="JOB_ST[j.status][1]">{{ JOB_ST[j.status][0] }}</Badge><span v-if="j.status==='running'" class="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted sm:block"><Meter :value="j.progress" class="rounded-full bg-primary"/></span></span></template>
          <template #actions="{ row: j }"><Tooltip v-if="j.status==='done'" content="Download"><Button variant="ghost" size="icon-sm" :aria-label="'Download ' + j.title" @click="downloadJob(j)"><Icon name="Download" :size="15"/></Button></Tooltip></template>
        </ListRows>
      </ListCard>
    </div>`
  };

  /* ---------------------------------------------------------------- the job page: what was asked, progress, the result, the errors */
  const JobPage = {
    setup() {
      const j = computed(() => jobById(G.jobId));
      return { G, j, JOB_ST, JOB_KIND, rerunJob, cancelJob, downloadJob, nav };
    },
    template: `<div class="mx-auto grid max-w-[900px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb"><BackButton/><button type="button" class="hover:text-foreground" @click="nav('my-jobs')">My exports and reports</button><Icon name="ChevronRight" :size="12"/><span class="font-mono text-foreground">{{ j ? j.no : '' }}</span></nav>
      <div v-if="!j" class="grid place-items-center rounded-xl border bg-card p-10 text-center"><Icon name="SearchX" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">That job no longer exists</p><Button class="mt-3" variant="outline" @click="nav('my-jobs')">My exports and reports</Button></div>
      <template v-else>
        <div class="flex flex-wrap items-start gap-3"><span :class="['grid h-11 w-11 shrink-0 place-items-center rounded-lg', j.status==='failed' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary']"><Icon :name="JOB_KIND[j.kind][1]" :size="20"/></span>
          <div class="min-w-0 flex-1"><h2 class="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">{{ j.title }}</h2><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span class="font-mono text-xs">{{ j.no }}</span><span>·</span><span>{{ JOB_KIND[j.kind][0] }}, {{ j.format }}</span><span>·</span><Badge :variant="JOB_ST[j.status][1]">{{ JOB_ST[j.status][0] }}</Badge></p></div>
          <div class="flex w-full gap-2 sm:w-auto"><Button v-if="['waiting','running'].includes(j.status)" variant="outline" @click="cancelJob(j)"><Icon name="CircleX" :size="15"/>Cancel</Button><Button v-if="['done','failed','expired','cancelled'].includes(j.status)" :variant="j.status==='done' ? 'outline' : 'default'" @click="rerunJob(j)"><Icon name="RotateCw" :size="15"/>Run again</Button></div></div>
        <Card v-if="['waiting','running'].includes(j.status)"><div class="grid gap-3 p-4"><JobProgress :value="j.progress"/><p class="text-sm text-muted-foreground">You can leave this page. You'll get a notification when it is {{ j.kind==='import' ? 'done' : 'ready' }}.</p></div></Card>
        <Card v-if="j.status==='done'"><div class="grid gap-3 p-4">
          <div class="flex flex-wrap items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-lg bg-success/15 text-success"><Icon name="FileCheck2" :size="18"/></span><div class="min-w-0 flex-1"><p class="truncate font-medium">{{ j.file || (j.title + '.' + j.format.toLowerCase()) }}</p><p class="text-xs text-muted-foreground"><span v-if="j.rows">{{ j.rows.toLocaleString() }} rows · </span>{{ j.size }} · kept {{ j.expires }} more days</p></div><Button size="sm" @click="downloadJob(j)"><Icon name="Download" :size="14"/>Download</Button></div>
          <div v-if="j.preview" class="overflow-x-auto rounded-lg border"><p class="border-b bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">The first rows</p><table class="w-full min-w-[420px] text-sm"><thead><tr class="border-b text-left text-xs text-muted-foreground"><th v-for="c in j.columns" :key="c" class="px-3 py-2 font-medium">{{ c }}</th></tr></thead><tbody class="divide-y"><tr v-for="(r, i) in j.preview" :key="i"><td v-for="(v, k) in r" :key="k" class="px-3 py-2">{{ v }}</td></tr></tbody></table></div></div></Card>
        <Card v-if="j.status==='failed'"><div class="grid gap-3 p-4"><p class="flex items-start gap-2 text-sm font-medium text-destructive"><Icon name="TriangleAlert" :size="16" class="mt-0.5"/>{{ j.summary }}</p>
          <ul class="divide-y rounded-lg border"><li v-for="(e, i) in j.errors" :key="i" class="flex gap-3 px-3 py-2 text-sm"><span v-if="e[0]" class="shrink-0 font-mono text-xs text-muted-foreground">{{ e[0] }}</span><span>{{ e[1] }}</span></li></ul></div></Card>
        <Card v-if="j.status==='expired'"><div class="flex items-center gap-3 p-4 text-sm"><Icon name="Clock" :size="16" class="text-muted-foreground"/><span class="flex-1">The file expired on {{ j.expiredOn }}. Run it again to get a fresh one with today's data.</span></div></Card>
        <Card><div class="p-4"><h3 class="text-sm font-semibold">What was asked</h3><dl class="mt-3 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm"><template v-for="p in j.params" :key="p[0]"><dt class="text-muted-foreground">{{ p[0] }}</dt><dd>{{ p[1] }}</dd></template><dt class="text-muted-foreground">Started by</dt><dd>{{ j.by }}, {{ j.started }}</dd><template v-if="j.finished"><dt class="text-muted-foreground">Finished</dt><dd>{{ j.finished }}<span v-if="j.took"> (took {{ j.took }})</span></dd></template></dl></div></Card>
      </template>
    </div>`
  };
  if (!G.jobId) G.jobId = 'jr41';
