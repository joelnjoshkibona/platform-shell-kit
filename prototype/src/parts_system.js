
  /* ================================================================ P97: THE SYSTEM SCREENS (kit 1.14.0)
     Logs (activity, sign-ins, errors, requests) · Queue · Scheduled tasks · Trash · Notifications (inbox, my settings, rules,
     announcements: Broadcasts folded in) · Permissions. Designed from SYSTEM_SHELL's backend (app/Project/Logs, Queue,
     ScheduledTasks; Modules/Core/Trash, Notifications) with the kit's list and details patterns (P24, P26, P39, P40).
     Demo data lives in SYS; the app reads the same shapes from the API. */
  const SYS = reactive({
    signins: [
      { id: 's1', who: 'Amina Juma', when: 'Today 08:12', ip: '41.59.12.8', where: 'Dar es Salaam', device: 'Chrome on Windows', result: 'ok' },
      { id: 's2', who: 'Baraka Mushi', when: 'Today 07:58', ip: '197.250.4.21', where: 'Mwanza', device: 'Phone app, Android 12', result: 'ok' },
      { id: 's3', who: 'unknown (hamisi.s@…)', when: 'Today 03:41', ip: '185.220.101.4', where: 'Unknown', device: 'curl', result: 'failed' },
      { id: 's4', who: 'Neema Kimaro', when: 'Yesterday 17:20', ip: '41.59.12.8', where: 'Dar es Salaam', device: 'Safari on iPhone', result: '2fa' },
      { id: 's5', who: 'Hamisi Swai', when: 'Yesterday 09:03', ip: '197.250.9.77', where: 'Arusha', device: 'Firefox on Linux', result: 'ok' },
      { id: 's6', who: 'unknown (admin@…)', when: '2 days ago', ip: '45.155.205.3', where: 'Unknown', device: 'python-requests', result: 'failed' },
    ],
    errors: [
      { id: 'e1', kind: 'QueryException', message: 'Deadlock found when trying to get lock; try restarting transaction', where: 'app/Modules/Core/Locations/Services/LocationsMoveService.php:88', count: 3, first: '3 days ago', last: 'Today 06:12', level: 'error', trace: ['LocationsMoveService::process()', 'BaseService::execute()', 'LocationsController::move()'] },
      { id: 'e2', kind: 'MailTransportException', message: 'Connection to smtp.mailgun.org:587 timed out', where: 'vendor/symfony/mailer', count: 14, first: 'Yesterday', last: 'Today 09:40', level: 'warning', trace: ['SendNotificationJob::handle()', 'Mailer::send()'] },
      { id: 'e3', kind: 'ValidationException', message: 'The phone field format is invalid.', where: 'app/Modules/Core/Users/Services/UsersCreateService.php:41', count: 1, first: 'Today 10:02', last: 'Today 10:02', level: 'info', trace: ['UsersCreateService::validateData()'] },
    ],
    requests: [
      { id: 'r1', method: 'GET', path: '/api/reports/sales-by-branch/run', status: 200, ms: 4820, who: 'Amina Juma', when: 'Today 10:14' },
      { id: 'r2', method: 'POST', path: '/api/locations/aru/move', status: 500, ms: 312, who: 'Neema Kimaro', when: 'Today 06:12' },
      { id: 'r3', method: 'GET', path: '/api/forms/list', status: 200, ms: 2310, who: 'Baraka Mushi', when: 'Yesterday 15:40' },
      { id: 'r4', method: 'POST', path: '/api/users/create', status: 422, ms: 88, who: 'Amina Juma', when: 'Today 10:02' },
    ],
    jobs: [
      { id: 'j1', name: 'Export responses', detail: 'Customer Feedback: Mwanza, 2,340 rows to Excel', queue: 'exports', status: 'running', progress: 64, tries: 1, by: 'Amina Juma', when: 'Started 2 min ago' },
      { id: 'j2', name: 'Send notification', detail: 'Approval needed: RQ-2026-0013 to 3 people', queue: 'notifications', status: 'waiting', progress: 0, tries: 0, by: 'System', when: 'Queued just now' },
      { id: 'j3', name: 'Send notification', detail: 'Daily digest to 41 people', queue: 'notifications', status: 'failed', progress: 0, tries: 3, by: 'Scheduled task', when: 'Failed 09:40', error: 'Connection to smtp.mailgun.org:587 timed out (3 tries)' },
      { id: 'j4', name: 'Run report', detail: 'Sales by branch, October', queue: 'reports', status: 'done', progress: 100, tries: 1, by: 'Amina Juma', when: 'Finished 10:14', took: '4.8 s' },
      { id: 'j5', name: 'Import users', detail: 'staff-arusha.csv, 18 rows', queue: 'imports', status: 'failed', progress: 0, tries: 1, by: 'Neema Kimaro', when: 'Failed yesterday', error: 'Row 7: the email anna@ is not valid. Nothing was imported.' },
      { id: 'j6', name: 'Deliver webhook', detail: 'response.submitted to hooks.kilima.co.tz', queue: 'webhooks', status: 'waiting', progress: 0, tries: 2, by: 'System', when: 'Retry in 4 min' },
    ],
    tasks: [
      { id: 't1', name: 'Close forms past their closing date', cmd: 'forms:close-scheduled', every: 'Every minute', last: 'ok', lastAt: '10:41', took: '0.2 s', next: '10:42', on: true, runs: [['10:41', 'ok', '0.2 s'], ['10:40', 'ok', '0.2 s'], ['10:39', 'ok', '0.3 s']] },
      { id: 't2', name: 'Send the daily digest', cmd: 'notifications:daily-digest', every: 'Every day at 07:00', last: 'failed', lastAt: 'Today 07:00', took: '31 s', next: 'Tomorrow 07:00', on: true, runs: [['Today 07:00', 'failed', '31 s'], ['Yesterday 07:00', 'ok', '12 s'], ['5 Nov 07:00', 'ok', '11 s']] },
      { id: 't3', name: 'Empty trash older than 30 days', cmd: 'trash:purge', every: 'Every day at 02:00', last: 'ok', lastAt: 'Today 02:00', took: '1.1 s', next: 'Tomorrow 02:00', on: true, runs: [['Today 02:00', 'ok', '1.1 s'], ['Yesterday 02:00', 'ok', '0.9 s']] },
      { id: 't4', name: 'Delete expired export files', cmd: 'jobs:expire-results', every: 'Every hour', last: 'ok', lastAt: '10:00', took: '0.4 s', next: '11:00', on: true, runs: [['10:00', 'ok', '0.4 s'], ['09:00', 'ok', '0.4 s']] },
      { id: 't5', name: 'Remind approvers of waiting requests', cmd: 'approvals:remind', every: 'Every weekday at 09:00', last: 'ok', lastAt: 'Today 09:00', took: '2.3 s', next: 'Monday 09:00', on: false, runs: [['Today 09:00', 'ok', '2.3 s']] },
    ],
    trash: [
      { id: 'x1', label: 'Staff Satisfaction Survey 2025', module: 'Forms', by: 'Baraka Mushi', when: '3 days ago', left: 27, deps: ['142 responses', '2 approval requests'] },
      { id: 'x2', label: 'Dodoma Branch', module: 'Locations', by: 'Amina Juma', when: '12 days ago', left: 18, deps: ['1 person assigned'] },
      { id: 'x3', label: 'Seasonal staff', module: 'Roles', by: 'Neema Kimaro', when: '25 days ago', left: 5, deps: [] },
      { id: 'x4', label: 'logo-old.png', module: 'Media', by: 'Amina Juma', when: '28 days ago', left: 2, deps: [] },
      { id: 'x5', label: 'Product Training: Solar (draft)', module: 'Forms', by: 'Hamisi Swai', when: 'Yesterday', left: 29, deps: [] },
    ],
    inbox: [
      { id: 'n1', unread: true, icon: 'Stamp', title: 'RQ-2026-0013 needs your approval', body: 'Export: Staff Satisfaction Survey 2026, requested by Rehema Mrema.', when: '26 min ago' },
      { id: 'n2', unread: true, icon: 'FileDown', title: 'Your export is ready', body: 'Customer Feedback: Mwanza responses · 2,340 rows. Open it to download it.', when: '1 h ago', job: 'jr41' },
      { id: 'n3', unread: false, icon: 'Megaphone', title: 'System update on Saturday', body: 'The system is read-only on Saturday from 22:00 to 23:00.', when: 'Yesterday' },
      { id: 'n4', unread: false, icon: 'TriangleAlert', title: 'The daily digest failed', body: 'Mail could not be sent. Queue › failed jobs has the details.', when: 'Today 07:01' },
    ],
    kinds: [
      { key: 'approvals', label: 'Approvals waiting for me', app: true, email: true, sms: false, push: true },
      { key: 'decisions', label: 'Decisions on my requests', app: true, email: true, sms: false, push: true },
      { key: 'jobs', label: 'My exports, reports and imports', app: true, email: false, sms: false, push: true },
      { key: 'announcements', label: 'Announcements', app: true, email: true, sms: false, push: false },
      { key: 'system', label: 'System problems (admins)', app: true, email: true, sms: true, push: false },
    ],
    quiet: { on: true, from: '22:00', to: '06:00' },
    rules: [
      { id: 'u1', event: 'An approval request is waiting', who: 'The step\'s approvers', channels: ['In app', 'Email', 'Push'], on: true },
      { id: 'u2', event: 'A request was decided', who: 'The requester', channels: ['In app', 'Email'], on: true },
      { id: 'u3', event: 'An export, report or import finished', who: 'The person who started it', channels: ['In app', 'Push'], on: true },
      { id: 'u4', event: 'A scheduled task failed', who: 'Owners and admins', channels: ['In app', 'Email', 'SMS'], on: true },
      { id: 'u5', event: 'A form was published', who: 'Location heads in its scope', channels: ['In app'], on: false },
    ],
    announcements: [
      { id: 'a1', title: 'System update on Saturday', to: 'Everyone', channels: ['In app', 'Email'], status: 'sent', when: 'Yesterday 16:00', by: 'Amina Juma', reach: 41 },
      { id: 'a2', title: 'New expense rules from November', to: 'Branch supervisors · Northern Zone', channels: ['In app', 'Email', 'SMS'], status: 'scheduled', when: 'Mon 10 Nov 08:00', by: 'Neema Kimaro', reach: 9 },
    ],
  });
  const SYS_JOB = { waiting: ['Waiting', 'secondary'], running: ['Running', 'default'], done: ['Done', 'success'], failed: ['Failed', 'destructive'] };
  const SYS_SIGNIN = { ok: ['Signed in', 'success'], '2fa': ['Two-step passed', 'secondary'], failed: ['Failed', 'destructive'] };
  const sysCan = (p) => myPerms.value.includes(p);

  /* a page-level tab strip with the tab in ?tab= (P26, P39) */
  function useSysTab(first) {
    const tab = ref(G.pendingTab || first);
    if (G.pendingTab) G.pendingTab = null;
    watch(tab, v => { G.tab = v === first ? null : v; }, { immediate: true });
    watch(() => G.pendingTab, v => { if (v) { tab.value = v; G.pendingTab = null; } });
    return tab;
  }
  const SysHead = { props: { title: String, sub: String }, template: `<div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ title }}</h2><p class="text-sm text-muted-foreground">{{ sub }}</p></div>` };
  const SysKpi = { props: { label: String, value: [String, Number], icon: String, tone: String, sub: String },
    template: `<div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between gap-2"><p class="truncate text-xs font-medium text-muted-foreground">{{ label }}</p><span :class="['grid h-6 w-6 place-items-center rounded-md', tone === 'bad' ? 'bg-destructive/10 text-destructive' : tone === 'warn' ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary']"><Icon :name="icon" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ value }}</p><p v-if="sub" class="mt-0.5 truncate text-[11px] text-muted-foreground">{{ sub }}</p></div>` };

  /* ---------------------------------------------------------------- Logs */
  const LogsPage = {
    setup() {
      const tab = useSysTab('activity');
      const q = reactive({ activity: '', signins: '', errors: '', requests: '' });
      const act = computed(() => ACTIVITY[G.org.id] || []);
      const L = {
        activity: useList({ noun: 'entries', rows: () => act.value, query: () => q.activity, search: (e, s) => (e.text + ' ' + e.what + ' ' + e.who).toLowerCase().includes(s), sorts: [{ value: 'when', label: 'Newest first', get: e => -act.value.indexOf(e) }],
          fields: () => [{ key: 'who', label: 'Who', type: 'select', options: [...new Set(act.value.map(e => e.who))].map(w => ({ value: w, label: w })), get: e => e.who }] }),
        signins: useList({ noun: 'sign-ins', rows: () => SYS.signins, query: () => q.signins, search: (e, s) => (e.who + ' ' + e.ip + ' ' + e.where + ' ' + e.device).toLowerCase().includes(s), sorts: [{ value: 'when', label: 'Newest first', get: e => SYS.signins.indexOf(e) }],
          fields: () => [{ key: 'result', label: 'Result', type: 'select', options: Object.entries(SYS_SIGNIN).map(([k, v]) => ({ value: k, label: v[0] })), get: e => e.result }] }),
        errors: useList({ noun: 'errors', rows: () => SYS.errors, query: () => q.errors, search: (e, s) => (e.kind + ' ' + e.message + ' ' + e.where).toLowerCase().includes(s), sorts: [{ value: 'count', label: 'Most frequent', get: e => -e.count }],
          fields: () => [{ key: 'level', label: 'Level', type: 'select', options: ['error', 'warning', 'info'].map(v => ({ value: v, label: v })), get: e => e.level }] }),
        requests: useList({ noun: 'requests', rows: () => SYS.requests, query: () => q.requests, search: (e, s) => (e.method + ' ' + e.path + ' ' + e.who).toLowerCase().includes(s), sorts: [{ value: 'ms', label: 'Slowest first', get: e => -e.ms }],
          fields: () => [{ key: 'status', label: 'Status', type: 'number', get: e => e.status }] }),
      };
      Object.entries(L).forEach(([k, LS]) => registerUrlList(LS, { get: () => q[k], set: v => { q[k] = v; } }, () => tab.value === k));
      const tabs = computed(() => [{ value: 'activity', label: 'Activity', count: act.value.length }, { value: 'signins', label: 'Sign-ins', count: SYS.signins.filter(s => s.result === 'failed').length || undefined }, { value: 'errors', label: 'Errors', count: SYS.errors.length }, { value: 'requests', label: 'Requests' }]);
      const err = ref(null);
      const cols = {
        activity: [{ key: 'text', label: 'What happened', identity: true, priority: 1, min: 260, text: e => e.text }, { key: 'who', label: 'Who', priority: 2, min: 150, fold: 'meta', text: e => e.who }, { key: 'loc', label: 'Location', priority: 4, min: 160, fold: 'meta', text: e => e.loc ? ((locById(e.loc) || {}).name || '') : '' }, { key: 'when', label: 'When', priority: 3, min: 110, fold: 'meta', text: e => e.when }],
        signins: [{ key: 'who', label: 'Person', identity: true, priority: 1, min: 220, text: e => e.who }, { key: 'result', label: 'Result', status: true, priority: 2, min: 130, text: e => SYS_SIGNIN[e.result][0], variant: e => SYS_SIGNIN[e.result][1] }, { key: 'device', label: 'Device', priority: 4, min: 170, fold: 'meta', text: e => e.device }, { key: 'where', label: 'From', priority: 3, min: 170, fold: 'meta', text: e => e.where + ' · ' + e.ip }, { key: 'when', label: 'When', priority: 2, min: 120, fold: 'meta', text: e => e.when }],
        errors: [{ key: 'message', label: 'Error', identity: true, priority: 1, min: 280, text: e => e.message }, { key: 'kind', label: 'Kind', priority: 5, min: 120, fold: 'badge', mono: true, text: e => e.kind }, { key: 'level', label: 'Level', status: true, priority: 2, min: 90, text: e => e.level, variant: e => e.level === 'error' ? 'destructive' : e.level === 'warning' ? 'warning' : 'secondary' }, { key: 'count', label: 'Times', hero: true, priority: 1, min: 70, text: e => e.count + '×' }, { key: 'last', label: 'Last seen', priority: 3, min: 120, fold: 'meta', text: e => 'Last ' + e.last }],
        requests: [{ key: 'path', label: 'Request', identity: true, mono: true, priority: 1, min: 300, text: e => e.method + ' ' + e.path }, { key: 'status', label: 'Status', status: true, priority: 2, min: 80, text: e => String(e.status), variant: e => e.status >= 500 ? 'destructive' : e.status >= 400 ? 'warning' : 'success' }, { key: 'ms', label: 'Time', hero: true, priority: 1, min: 80, text: e => (e.ms / 1000).toFixed(1) + ' s' }, { key: 'who', label: 'Who', priority: 3, min: 140, fold: 'meta', text: e => e.who + ' · ' + e.when }],
      };
      const exportTab = () => startJobRun({ kind: 'export', title: 'Logs: ' + { activity: 'activity', signins: 'sign-ins', errors: 'errors', requests: 'requests' }[tab.value], format: 'Excel', rows: L[tab.value].rows.value.length, params: [['Module', 'Logs'], ['Tab', tab.value], ['Search', q[tab.value] || 'None'], ['Format', 'Excel (.xlsx)']] });
      return { G, tab, tabs, L, q, cols, err, exportTab, locById, nouns: { activity: 'activity', signins: 'sign-ins', errors: 'errors', requests: 'requests' } };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Logs" sub="Who did what and when, who signed in, what went wrong. Kept for 90 days."/>
      <div class="-mx-1 overflow-x-auto px-1"><Tabs v-model="tab" :items="tabs"/></div>
      <template v-for="k in ['activity','signins','errors','requests']" :key="k">
        <ListCard v-if="tab===k" :list="L[k]" :search="q[k]" @update:search="v => q[k] = v" :placeholder="'Search ' + nouns[k]">
          <template #actions><Button size="sm" variant="outline" @click="exportTab"><Icon name="FileDown" :size="15"/><span class="hidden sm:inline">Export</span></Button></template>
          <ListRows :list="L[k]" :rows="L[k].rows.value" :columns="cols[k]" :row-key="r => r.id || (r.text + r.when)" :clickable="k==='errors'" :base-meta="r => k==='activity' ? r.what : k==='errors' ? r.where : ''" empty="Nothing matches. Clear the search or a filter." @open="r => err = r">
            <template #icon="{ row: r }"><span :class="['grid h-9 w-9 place-items-center rounded-lg', k==='errors' || (k==='signins' && r.result==='failed') ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground']"><Icon :name="k==='activity' ? (r.icon || 'Activity') : k==='signins' ? (r.result==='failed' ? 'ShieldAlert' : 'LogIn') : k==='errors' ? 'Bug' : 'Gauge'" :size="16"/></span></template>
            <template #cell-loc="{ row: r }"><RecordLink v-if="r.loc" module="Locations" :id="r.loc"/><span v-else class="text-muted-foreground">–</span></template>
          </ListRows>
        </ListCard>
      </template>
      <Sheet :open="!!err" @update:open="v => { if (!v) err = null }"><div v-if="err" class="flex h-full min-h-0 flex-col">
        <div class="border-b p-4 pr-12"><p class="font-mono text-xs text-muted-foreground">{{ err.kind }}</p><h2 class="mt-0.5 font-semibold [overflow-wrap:anywhere]">{{ err.message }}</h2><div class="mt-2 flex gap-2"><Badge :variant="err.level==='error' ? 'destructive' : err.level==='warning' ? 'warning' : 'secondary'">{{ err.level }}</Badge><Badge variant="outline">{{ err.count }} times</Badge></div></div>
        <div class="grid gap-3 overflow-y-auto p-4 text-sm"><dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2"><dt class="text-muted-foreground">Where</dt><dd class="font-mono text-xs [overflow-wrap:anywhere]">{{ err.where }}</dd><dt class="text-muted-foreground">First seen</dt><dd>{{ err.first }}</dd><dt class="text-muted-foreground">Last seen</dt><dd>{{ err.last }}</dd></dl>
          <div><p class="mb-1.5 text-xs font-medium text-muted-foreground">Call stack (newest first)</p><ol class="grid gap-1 rounded-lg border bg-muted/40 p-3 font-mono text-xs"><li v-for="(t, i) in err.trace" :key="i">{{ i + 1 }}. {{ t }}</li></ol></div>
          <p class="text-xs text-muted-foreground">Nothing personal is written to this log: no passwords, tokens or form answers.</p></div></div></Sheet>
    </div>`
  };

  /* ---------------------------------------------------------------- Queue */
  const QueuePage = {
    setup() {
      const LS = useList({ noun: 'jobs', rows: () => SYS.jobs, search: (j, s) => (j.name + ' ' + j.detail + ' ' + j.queue + ' ' + j.by).toLowerCase().includes(s), sorts: [{ value: 'status', label: 'Failed first', get: j => ['failed', 'running', 'waiting', 'done'].indexOf(j.status) }],
        fields: () => [{ key: 'status', label: 'Status', type: 'select', options: Object.entries(SYS_JOB).map(([k, v]) => ({ value: k, label: v[0] })), get: j => j.status }, { key: 'queue', label: 'Queue', type: 'select', options: [...new Set(SYS.jobs.map(j => j.queue))].map(v => ({ value: v, label: v })), get: j => j.queue }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const quick = computed({ get: () => { const f = LS.S.filters.status; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('status', v === 'all' ? null : { op: 'in', value: [v] }) });
      const tabs = computed(() => [{ value: 'all', label: 'All', count: SYS.jobs.length }, ...['failed', 'running', 'waiting', 'done'].map(k => ({ value: k, label: SYS_JOB[k][0], count: SYS.jobs.filter(j => j.status === k).length }))]);
      const kpi = computed(() => ({ waiting: SYS.jobs.filter(j => j.status === 'waiting').length, running: SYS.jobs.filter(j => j.status === 'running').length, failed: SYS.jobs.filter(j => j.status === 'failed').length, done: SYS.jobs.filter(j => j.status === 'done').length }));
      const open = ref(null);
      const can = () => sysCan('Queue.retry');
      const retry = (j) => { j.status = 'waiting'; j.tries++; j.when = 'Queued just now'; j.error = ''; toast('Sent back to the queue', j.name + ': ' + j.detail, 'RotateCw'); };
      const cancel = (j) => { const i = SYS.jobs.indexOf(j); if (i >= 0) SYS.jobs.splice(i, 1); open.value = null; toast('Cancelled', j.name, 'CircleX'); };
      const menu = (j) => [{ id: 'open', label: 'Details', icon: 'PanelRightOpen' }, ...(can() && j.status === 'failed' ? [{ id: 'retry', label: 'Retry', icon: 'RotateCw' }] : []), ...(can() && ['waiting', 'running'].includes(j.status) ? [{ id: 'cancel', label: 'Cancel', icon: 'CircleX' }] : []), ...(can() && ['failed', 'done'].includes(j.status) ? [{ separator: true }, { id: 'cancel', label: 'Delete', icon: 'Trash2' }] : [])];
      const onMenu = (j, it) => { if (it.id === 'open') open.value = j; if (it.id === 'retry') retry(j); if (it.id === 'cancel') cancel(j); };
      const retryAll = () => SYS.jobs.filter(j => j.status === 'failed').forEach(retry);
      const cols = [{ key: 'name', label: 'Job', identity: true, priority: 1, min: 240, text: j => j.name }, { key: 'status', label: 'Status', status: true, priority: 2, min: 100, text: j => SYS_JOB[j.status][0], variant: j => SYS_JOB[j.status][1] }, { key: 'queue', label: 'Queue', priority: 5, min: 110, fold: 'badge', mono: true, text: j => j.queue }, { key: 'by', label: 'Started by', priority: 4, min: 140, fold: 'meta', text: j => j.by }, { key: 'when', label: 'When', priority: 3, min: 130, fold: 'meta', text: j => j.when }, { key: 'tries', label: 'Tries', priority: 6, min: 70, fold: 'meta', text: j => j.tries + (j.tries === 1 ? ' try' : ' tries') }];
      return { G, LS, quick, tabs, kpi, open, can, retry, cancel, menu, onMenu, retryAll, cols, SYS_JOB, openJob };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Queue" sub="Work that runs in the background: exports, reports, imports, notifications, webhooks."/>
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0"><SysKpi label="Failed" :value="kpi.failed" icon="CircleAlert" tone="bad" sub="Need a retry or a fix"/><SysKpi label="Running" :value="kpi.running" icon="Loader" sub="Right now"/><SysKpi label="Waiting" :value="kpi.waiting" icon="Hourglass" tone="warn" sub="In line"/><SysKpi label="Done today" :value="kpi.done" icon="CircleCheck" sub="Kept for 7 days"/></div>
      <ListCard :list="LS" :tabs="tabs" v-model:quick="quick">
        <template #actions><Button v-if="can() && kpi.failed" size="sm" variant="outline" @click="retryAll"><Icon name="RotateCw" :size="15"/>Retry failed</Button></template>
        <ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="j => j.id" :base-meta="j => j.detail" empty="No jobs here." @open="j => open = j">
          <template #icon="{ row: j }"><span :class="['grid h-9 w-9 place-items-center rounded-lg', j.status==='failed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground']"><Icon :name="j.status==='running' ? 'Loader' : j.status==='failed' ? 'CircleAlert' : j.status==='done' ? 'CircleCheck' : 'Hourglass'" :size="16"/></span></template>
          <template #cell-status="{ row: j }"><span class="inline-flex items-center gap-2"><Badge :variant="SYS_JOB[j.status][1]">{{ SYS_JOB[j.status][0] }}</Badge><span v-if="j.status==='running'" class="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block"><span class="block h-full rounded-full bg-primary" :style="{ width: j.progress + '%' }"></span></span></span></template>
          <template #actions="{ row: j }"><DropdownMenu :items="menu(j)" @select="it => onMenu(j, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + j.name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></template>
        </ListRows>
      </ListCard>
      <Sheet :open="!!open" @update:open="v => { if (!v) open = null }"><div v-if="open" class="flex h-full min-h-0 flex-col">
        <div class="border-b p-4 pr-12"><p class="font-mono text-xs text-muted-foreground">{{ open.queue }}</p><h2 class="mt-0.5 font-semibold">{{ open.name }}</h2><p class="text-sm text-muted-foreground">{{ open.detail }}</p>
          <div class="mt-3 flex flex-wrap gap-2"><Badge :variant="SYS_JOB[open.status][1]">{{ SYS_JOB[open.status][0] }}</Badge><Button v-if="can() && open.status==='failed'" size="sm" @click="retry(open)"><Icon name="RotateCw" :size="14"/>Retry</Button><Button v-if="can() && ['waiting','running'].includes(open.status)" size="sm" variant="outline" @click="cancel(open)"><Icon name="CircleX" :size="14"/>Cancel</Button><Button v-if="open.run" size="sm" variant="outline" @click="openJob(open.run)"><Icon name="ArrowUpRight" :size="14"/>Open its page</Button></div></div>
        <div class="grid gap-3 overflow-y-auto p-4 text-sm">
          <div v-if="open.status==='running'"><div class="flex justify-between text-xs"><span class="text-muted-foreground">Progress</span><span class="tnum">{{ open.progress }}%</span></div><div class="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-primary" :style="{ width: open.progress + '%' }"></div></div></div>
          <p v-if="open.error" class="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">{{ open.error }}</p>
          <dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2"><dt class="text-muted-foreground">Started by</dt><dd>{{ open.by }}</dd><dt class="text-muted-foreground">When</dt><dd>{{ open.when }}</dd><dt class="text-muted-foreground">Tries</dt><dd class="tnum">{{ open.tries }} of 3</dd><template v-if="open.took"><dt class="text-muted-foreground">Took</dt><dd>{{ open.took }}</dd></template></dl></div></div></Sheet>
    </div>`
  };

  /* ---------------------------------------------------------------- Scheduled tasks */
  const ScheduledTasksPage = {
    setup() {
      const LS = useList({ noun: 'tasks', rows: () => SYS.tasks, search: (t, s) => (t.name + ' ' + t.cmd).toLowerCase().includes(s), sorts: [{ value: 'name', label: 'Name', get: t => t.name.toLowerCase() }],
        fields: () => [{ key: 'last', label: 'Last run', type: 'select', options: [{ value: 'ok', label: 'Worked' }, { value: 'failed', label: 'Failed' }], get: t => t.last }, { key: 'on', label: 'State', type: 'select', options: [{ value: 'on', label: 'On' }, { value: 'off', label: 'Paused' }], get: t => t.on ? 'on' : 'off' }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const open = ref(null); const can = () => sysCan('ScheduledTasks.manage');
      const runNow = (t) => { t.runs.unshift(['Just now', 'ok', '0.5 s']); t.last = 'ok'; t.lastAt = 'Just now'; toast('Ran: ' + t.name, 'It worked in 0.5 s.', 'Play'); };
      const toggle = (t) => { t.on = !t.on; toast(t.on ? 'Resumed' : 'Paused', t.name, t.on ? 'Play' : 'Pause'); };
      const failing = computed(() => SYS.tasks.filter(t => t.last === 'failed').length);
      const cols = [{ key: 'name', label: 'Task', identity: true, priority: 1, min: 260, text: t => t.name }, { key: 'every', label: 'How often', priority: 3, min: 170, fold: 'meta', text: t => t.every }, { key: 'last', label: 'Last run', status: true, priority: 2, min: 210, text: t => (t.last === 'ok' ? 'Worked' : 'Failed'), variant: t => t.last === 'ok' ? 'success' : 'destructive' }, { key: 'next', label: 'Next run', priority: 4, min: 140, fold: 'meta', text: t => t.on ? 'Next ' + t.next : 'Paused' }];
      return { G, LS, open, can, runNow, toggle, failing, cols };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Scheduled tasks" sub="Work the system does on its own on a timetable (cron). Each run is kept for 30 days."/>
      <div v-if="failing" class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"><Icon name="CircleAlert" :size="15"/>{{ failing }} task failed on its last run. Open it to see why.</div>
      <ListCard :list="LS">
        <ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="t => t.id" :base-meta="t => t.cmd" :actions-width="44" empty="No tasks match." @open="t => open = t">
          <template #icon="{ row: t }"><span :class="['grid h-9 w-9 place-items-center rounded-lg', !t.on ? 'bg-muted text-muted-foreground' : t.last==='failed' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary']"><Icon :name="t.on ? 'CalendarClock' : 'Pause'" :size="16"/></span></template>
          <template #cell-last="{ row: t }"><span class="inline-flex items-center gap-1.5 whitespace-nowrap"><Badge :variant="t.last==='ok' ? 'success' : 'destructive'">{{ t.last==='ok' ? 'Worked' : 'Failed' }}</Badge><span class="text-xs text-muted-foreground tnum">{{ t.lastAt }} · {{ t.took }}</span></span></template>
          <template #actions="{ row: t }"><div v-if="can()" class="flex items-center gap-1"><Tooltip content="Run now"><Button variant="ghost" size="icon-sm" :aria-label="'Run now: ' + t.name" @click="runNow(t)"><Icon name="Play" :size="15"/></Button></Tooltip></div></template>
        </ListRows>
      </ListCard>
      <Sheet :open="!!open" @update:open="v => { if (!v) open = null }"><div v-if="open" class="flex h-full min-h-0 flex-col">
        <div class="border-b p-4 pr-12"><p class="font-mono text-xs text-muted-foreground">{{ open.cmd }}</p><h2 class="mt-0.5 font-semibold">{{ open.name }}</h2><p class="text-sm text-muted-foreground">{{ open.every }} · {{ open.on ? 'next ' + open.next : 'paused' }}</p>
          <div v-if="can()" class="mt-3 flex flex-wrap items-center gap-3"><Button size="sm" @click="runNow(open)"><Icon name="Play" :size="14"/>Run now</Button><label class="flex items-center gap-2 text-sm"><Switch :model-value="open.on" @update:model-value="toggle(open)"/>{{ open.on ? 'On' : 'Paused' }}</label></div></div>
        <div class="overflow-y-auto p-4 text-sm"><p class="mb-2 text-xs font-medium text-muted-foreground">Recent runs</p>
          <ol class="divide-y rounded-lg border"><li v-for="(r, i) in open.runs" :key="i" class="flex items-center gap-3 px-3 py-2"><Icon :name="r[1]==='ok' ? 'CircleCheck' : 'CircleAlert'" :size="15" :class="r[1]==='ok' ? 'text-success' : 'text-destructive'"/><span class="flex-1">{{ r[0] }}</span><span class="text-xs text-muted-foreground tnum">{{ r[2] }}</span></li></ol></div></div></Sheet>
    </div>`
  };

  /* ---------------------------------------------------------------- Trash */
  const TrashPage = {
    setup() {
      const mods = computed(() => [...new Set(SYS.trash.map(x => x.module))]);
      const LS = useList({ noun: 'deleted records', rows: () => SYS.trash, search: (x, s) => (x.label + ' ' + x.module + ' ' + x.by).toLowerCase().includes(s), sorts: [{ value: 'left', label: 'Goes for good soonest', get: x => x.left }],
        fields: () => [{ key: 'module', label: 'Module', type: 'select', options: mods.value.map(m => ({ value: m, label: m })), get: x => x.module }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const quick = computed({ get: () => { const f = LS.S.filters.module; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('module', v === 'all' ? null : { op: 'in', value: [v] }) });
      const tabs = computed(() => [{ value: 'all', label: 'All', count: SYS.trash.length }, ...mods.value.map(m => ({ value: m, label: m, count: SYS.trash.filter(x => x.module === m).length }))]);
      const D = reactive({ open: false, x: null, all: false });
      const canRestore = () => sysCan('Trash.restore'), canPurge = () => sysCan('Trash.purge');
      const restore = (x) => { SYS.trash.splice(SYS.trash.indexOf(x), 1); toast('Restored: ' + x.label, x.deps.length ? 'With ' + x.deps.join(', ') + '.' : 'It is back where it was.', 'Undo2'); };
      const askPurge = (x) => { D.x = x; D.all = false; D.open = true; };
      const askEmpty = () => { D.x = null; D.all = true; D.open = true; };
      const purge = () => { if (D.all) { const n = SYS.trash.length; SYS.trash.splice(0); toast('Trash emptied', n + ' records deleted for good.', 'Trash2'); } else { SYS.trash.splice(SYS.trash.indexOf(D.x), 1); toast('Deleted for good', D.x.label, 'Trash2'); } D.open = false; };
      const menu = () => [...(canRestore() ? [{ id: 'restore', label: 'Restore', icon: 'Undo2' }] : []), ...(canPurge() ? [{ separator: true }, { id: 'purge', label: 'Delete for good', icon: 'Trash2' }] : [])];
      const onMenu = (x, it) => { if (it.id === 'restore') restore(x); if (it.id === 'purge') askPurge(x); };
      const cols = [{ key: 'label', label: 'Record', identity: true, priority: 1, min: 260, text: x => x.label }, { key: 'module', label: 'Module', priority: 4, min: 110, fold: 'badge', text: x => x.module, variant: () => 'outline' }, { key: 'by', label: 'Deleted by', priority: 3, min: 170, fold: 'meta', text: x => 'By ' + x.by + ' · ' + x.when }, { key: 'left', label: 'Goes for good', status: true, priority: 2, min: 140, text: x => 'In ' + x.left + (x.left === 1 ? ' day' : ' days'), variant: x => x.left <= 7 ? 'warning' : 'secondary' }];
      return { G, LS, quick, tabs, D, canRestore, canPurge, restore, askPurge, askEmpty, purge, menu, onMenu, cols };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Trash" sub="Deleted records stay here for 30 days, with what was deleted with them. Restore puts everything back."/>
      <ListCard :list="LS" :tabs="tabs" v-model:quick="quick">
        <template #actions><Button v-if="canPurge() && LS.rows.value.length" size="sm" variant="outline" class="text-destructive" @click="askEmpty"><Icon name="Trash2" :size="15"/><span class="hidden sm:inline">Empty trash</span></Button></template>
        <ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="x => x.id" :clickable="false" :actions-width="132" :base-meta="x => x.deps.length ? 'With ' + x.deps.join(', ') : ''" empty="The trash is empty.">
          <template #icon="{ row: x }"><span class="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon name="Trash2" :size="16"/></span></template>
          <template #actions="{ row: x }"><div class="flex items-center gap-1"><Button v-if="canRestore()" variant="outline" size="sm" class="hidden h-8 sm:inline-flex" @click="restore(x)"><Icon name="Undo2" :size="14"/>Restore</Button><DropdownMenu :items="menu(x)" @select="it => onMenu(x, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + x.label"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></div></template>
        </ListRows>
      </ListCard>
      <DeleteDialog v-model:open="D.open" :title="D.all ? 'Empty the trash?' : 'Delete for good?'" :name="D.all ? 'every record in the trash' : (D.x ? D.x.label : '')" :deps="D.all ? [] : (D.x ? D.x.deps : [])" @confirm="purge"/>
    </div>`
  };

  /* ---------------------------------------------------------------- Notifications: inbox, my settings, rules, announcements */
  const NotificationsPage = {
    setup() {
      const tab = useSysTab('inbox');
      const tabs = computed(() => [{ value: 'inbox', label: 'Inbox', count: SYS.inbox.filter(n => n.unread).length || undefined }, { value: 'settings', label: 'My settings' }, ...(sysCan('Notifications.manage') ? [{ value: 'rules', label: 'Rules' }] : []), ...(sysCan('Notifications.announce') ? [{ value: 'announcements', label: 'Announcements' }] : [])]);
      const readAll = () => { SYS.inbox.forEach(n => n.unread = false); toast('All marked as read', '', 'CheckCheck'); };
      const A = reactive({ open: false, title: '', body: '', to: 'everyone', roles: [], when: 'now', at: '', email: true, sms: false, push: false });
      const audience = computed(() => A.to === 'everyone' ? MEMBERS.length : MEMBERS.filter(m => A.roles.includes(m.role)).length);
      const send = () => { if (!A.title.trim() || !A.body.trim()) return; const ch = ['In app', ...(A.email ? ['Email'] : []), ...(A.sms ? ['SMS'] : []), ...(A.push ? ['Push'] : [])];
        SYS.announcements.unshift({ id: ulid('a'), title: A.title.trim(), to: A.to === 'everyone' ? 'Everyone' : A.roles.map(r => (roleById(r) || {}).name).join(', '), channels: ch, status: A.when === 'now' ? 'sent' : 'scheduled', when: A.when === 'now' ? 'Just now' : A.at || 'Later', by: ME.name, reach: audience.value });
        A.open = false; toast(A.when === 'now' ? 'Announcement sent' : 'Announcement scheduled', audience.value + ' people · ' + ch.join(', '), 'Megaphone'); Object.assign(A, { title: '', body: '', roles: [], when: 'now' }); };
      const roleOpts = computed(() => ROLES.map(r => ({ id: r.id, name: r.name })));
      const toggleRole = (id) => { const i = A.roles.indexOf(id); if (i >= 0) A.roles.splice(i, 1); else A.roles.push(id); };
      return { G, SYS, tab, tabs, readAll, A, audience, send, roleOpts, toggleRole, openJob };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Notifications" sub="What reaches you and how; for admins, who is told about what, and announcements to many people."/>
      <div class="-mx-1 overflow-x-auto px-1"><Tabs v-model="tab" :items="tabs"/></div>
      <Card v-if="tab==='inbox'"><div class="flex items-center justify-between border-b px-4 py-2.5"><p class="text-sm font-medium">Inbox</p><Button variant="ghost" size="sm" @click="readAll"><Icon name="CheckCheck" :size="15"/>Mark all read</Button></div>
        <ul class="divide-y"><li v-for="n in SYS.inbox" :key="n.id"><button type="button" :class="['flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/60', n.unread ? 'bg-primary/[.04]' : '']" @click="n.unread = false; if (n.job) openJob(n.job)">
          <span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-lg', n.icon==='TriangleAlert' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary']"><Icon :name="n.icon" :size="16"/></span>
          <span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ n.title }}</span><span class="block text-sm text-muted-foreground">{{ n.body }}</span><span class="mt-0.5 block text-xs text-muted-foreground">{{ n.when }}</span></span><span v-if="n.unread" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread"></span></button></li></ul></Card>
      <Card v-else-if="tab==='settings'">
        <ul class="divide-y sm:hidden" aria-label="Notification channels"><li v-for="k in SYS.kinds" :key="'m' + k.key" class="px-4 py-3"><p class="text-sm font-medium">{{ k.label }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><label class="flex items-center gap-2"><Switch v-model="k.email" :aria-label="k.label + ': email'"/>Email</label><label class="flex items-center gap-2"><Switch v-model="k.sms" :aria-label="k.label + ': SMS'"/>SMS</label><label class="flex items-center gap-2"><Switch v-model="k.push" :aria-label="k.label + ': push'"/>Push</label></div></li></ul>
        <div class="hidden overflow-x-auto sm:block"><table class="w-full min-w-[520px] text-sm"><thead><tr class="border-b text-xs text-muted-foreground"><th class="px-4 py-2.5 text-left font-medium">Tell me about</th><th class="px-2 font-medium">In app</th><th class="px-2 font-medium">Email</th><th class="px-2 font-medium">SMS</th><th class="px-2 font-medium">Push</th></tr></thead>
        <tbody class="divide-y"><tr v-for="k in SYS.kinds" :key="k.key"><td class="px-4 py-2.5">{{ k.label }}</td><td class="px-2 text-center"><Switch :model-value="true" disabled :aria-label="k.label + ': in the app (always on)'"/></td><td class="px-2 text-center"><Switch v-model="k.email" :aria-label="k.label + ': email'"/></td><td class="px-2 text-center"><Switch v-model="k.sms" :aria-label="k.label + ': SMS'"/></td><td class="px-2 text-center"><Switch v-model="k.push" :aria-label="k.label + ': push'"/></td></tr></tbody></table></div>
        <div class="flex flex-wrap items-center gap-3 border-t px-4 py-3 text-sm"><Switch v-model="SYS.quiet.on" aria-label="Quiet hours"/><span>Quiet hours: no SMS or push from <b class="tnum">{{ SYS.quiet.from }}</b> to <b class="tnum">{{ SYS.quiet.to }}</b></span><span class="text-xs text-muted-foreground">In app is always on.</span></div></Card>
      <Card v-else-if="tab==='rules'"><ul class="divide-y"><li v-for="r in SYS.rules" :key="r.id" class="flex flex-wrap items-center gap-3 px-4 py-3"><span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ r.event }}</span><span class="block text-xs text-muted-foreground">Tells {{ r.who }}</span></span>
        <span class="flex flex-wrap gap-1"><Badge v-for="c in r.channels" :key="c" variant="outline">{{ c }}</Badge></span><Switch v-model="r.on" :aria-label="'Rule on: ' + r.event"/></li></ul></Card>
      <template v-else-if="tab==='announcements'"><div class="flex justify-end"><Button size="sm" @click="A.open = true"><Icon name="Megaphone" :size="15"/>Send an announcement</Button></div>
        <Card><ul class="divide-y"><li v-for="a in SYS.announcements" :key="a.id" class="flex flex-wrap items-start gap-3 px-4 py-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="Megaphone" :size="16"/></span>
          <span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ a.title }}</span><span class="block text-xs text-muted-foreground">To {{ a.to }} · {{ a.reach }} people · {{ a.channels.join(', ') }} · by {{ a.by }}</span></span><span class="text-right"><Badge :variant="a.status==='sent' ? 'success' : 'secondary'">{{ a.status==='sent' ? 'Sent' : 'Scheduled' }}</Badge><span class="mt-1 block text-xs text-muted-foreground">{{ a.when }}</span></span></li></ul></Card></template>
      <Dialog :open="A.open" @update:open="v => A.open = v"><div class="grid gap-4 p-5 sm:p-6">
        <div><h2 class="text-lg font-semibold">Send an announcement</h2><p class="text-sm text-muted-foreground">Everyone chosen gets it as a notification, by the channels you pick (quiet hours apply).</p></div>
        <div class="grid gap-1.5"><Label>Title</Label><Input v-model="A.title" placeholder="System update on Saturday"/></div>
        <div class="grid gap-1.5"><Label>Message</Label><Textarea v-model="A.body" rows="3" placeholder="What people need to know"/></div>
        <div class="grid gap-1.5"><Label>Who</Label><div class="flex gap-2"><Button size="sm" :variant="A.to==='everyone' ? 'default' : 'outline'" @click="A.to='everyone'">Everyone</Button><Button size="sm" :variant="A.to==='roles' ? 'default' : 'outline'" @click="A.to='roles'">By role</Button></div>
          <div v-if="A.to==='roles'" class="flex flex-wrap gap-1.5"><button v-for="r in roleOpts" :key="r.id" type="button" @click="toggleRole(r.id)" :class="['h-8 rounded-md border px-2.5 text-xs font-medium', A.roles.includes(r.id) ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground']">{{ r.name }}</button></div>
          <p class="text-xs text-muted-foreground">{{ audience }} people</p></div>
        <div class="flex flex-wrap gap-4 text-sm"><span class="text-muted-foreground">In app always ·</span><label class="flex items-center gap-2"><Switch v-model="A.email" aria-label="Send by email"/>Email</label><label class="flex items-center gap-2"><Switch v-model="A.sms" aria-label="Send by SMS"/>SMS</label><label class="flex items-center gap-2"><Switch v-model="A.push" aria-label="Send by push"/>Push</label></div>
        <div class="flex gap-2"><Button size="sm" :variant="A.when==='now' ? 'default' : 'outline'" @click="A.when='now'">Send now</Button><Button size="sm" :variant="A.when==='later' ? 'default' : 'outline'" @click="A.when='later'">Schedule</Button><Input v-if="A.when==='later'" v-model="A.at" class="h-8" placeholder="Mon 10 Nov 08:00"/></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="A.open = false">Cancel</Button><Button :disabled="!A.title.trim() || !A.body.trim() || !audience" @click="send"><Icon name="Send" :size="15"/>{{ A.when==='now' ? 'Send to ' + audience + ' people' : 'Schedule' }}</Button></div></div></Dialog>
    </div>`
  };

  /* ---------------------------------------------------------------- Permissions: every permission, who has it and why */
  const PermissionsPage = {
    setup() {
      const rolesWith = (p) => ROLES.filter(r => r.perms.includes(p.name));
      const peopleWith = (p) => MEMBERS.filter(m => !m.invited && (roleById(m.role) || { perms: [] }).perms.includes(p.name));
      const mods = [...new Set(PERMS.map(p => p.module))];
      const LS = useList({ noun: 'permissions', rows: () => PERMS, search: (p, s) => (p.name + ' ' + p.label + ' ' + p.module).toLowerCase().includes(s), sorts: [{ value: 'module', label: 'By module', get: p => p.module + p.name }, { value: 'roles', label: 'Fewest roles', get: p => rolesWith(p).length }],
        fields: () => [{ key: 'module', label: 'Module', type: 'select', options: mods.map(m => ({ value: m, label: m })), get: p => p.module }] });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });
      const open = ref(null);
      const cols = [{ key: 'label', label: 'Permission', identity: true, priority: 1, min: 240, text: p => p.label }, { key: 'name', label: 'Name', priority: 4, min: 170, fold: 'badge', mono: true, text: p => p.name }, { key: 'module', label: 'Module', priority: 5, min: 140, fold: 'meta', text: p => p.module }, { key: 'roles', label: 'Roles', priority: 2, min: 90, fold: 'meta', text: p => rolesWith(p).length + ' roles' }, { key: 'people', label: 'People', priority: 3, min: 90, fold: 'meta', text: p => peopleWith(p).length + ' people' }];
      return { G, LS, cols, open, rolesWith, peopleWith, PERMS, roleById };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <SysHead title="Permissions" sub="Every permission in words, the roles that grant it, and the people who have it. Grant them through roles."/>
      <ListCard :list="LS">
        <ListRows :list="LS" :rows="LS.rows.value" :columns="cols" :row-key="p => p.name" empty="No permissions match." @open="p => open = p">
          <template #icon="{ row: p }"><span class="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="KeyRound" :size="16"/></span></template>
        </ListRows>
      </ListCard>
      <Sheet :open="!!open" @update:open="v => { if (!v) open = null }"><div v-if="open" class="flex h-full min-h-0 flex-col">
        <div class="border-b p-4 pr-12"><p class="font-mono text-xs text-muted-foreground">{{ open.name }}</p><h2 class="mt-0.5 font-semibold">{{ open.label }}</h2><p class="text-sm text-muted-foreground">{{ open.module }}</p></div>
        <div class="grid gap-4 overflow-y-auto p-4 text-sm">
          <div><p class="mb-1.5 text-xs font-medium text-muted-foreground">Roles that grant it ({{ rolesWith(open).length }})</p><ul class="grid gap-1.5"><li v-for="r in rolesWith(open)" :key="r.id"><RecordLink module="Roles" :id="r.id"/></li><li v-if="!rolesWith(open).length" class="text-muted-foreground">No role grants it yet.</li></ul></div>
          <div><p class="mb-1.5 text-xs font-medium text-muted-foreground">People with it through their main role ({{ peopleWith(open).length }})</p><ul class="divide-y rounded-lg border"><li v-for="m in peopleWith(open)" :key="m.email" class="flex items-center justify-between gap-2 px-3 py-2"><span class="min-w-0 truncate">{{ m.name }}</span><span class="shrink-0 text-xs text-muted-foreground">{{ (roleById(m.role) || {}).name }}</span></li></ul>
            <p class="mt-1.5 text-xs text-muted-foreground">People may also have it at some locations through a custom role: open their user page to see where.</p></div></div></div></Sheet>
    </div>`
  };
