/* ================================================================ SHELL MODULE: auth, sidebar, forms list, templates, members, workspace */
const ShellMod = (() => {
  const T = reactive({ toasts: [] });
  function toast(title, desc = '', icon = 'CircleCheck') { if (G.route === 'responses' && G.respToast) return G.respToast(title, desc, icon); const t = { id: ulid('t'), title, desc, icon }; T.toasts.push(t); setTimeout(() => { T.toasts = T.toasts.filter(x => x.id !== t.id) }, 3400); }
  G.toast = toast;

  /* ---------- mock forms (example data) */
  const sp = (a) => a;
  const FORMS = reactive([
    { id: 'f1', title: 'Customer Service Assessment Q4', status: 'live', responses: 142, spark: sp([8, 14, 11, 19, 16, 22, 12, 15, 13, 10]), closes: 'Closes 31 Oct', accent: 'teal', timed: true, priv: false, sections: 3, questions: 9, owner: 'Amina Juma', edited: '2h ago', flagged: 38, sample: true },
    { id: 'f2', title: 'Staff Satisfaction Survey 2026', status: 'live', responses: 318, spark: sp([30, 42, 38, 25, 31, 29, 40, 33, 22, 28]), closes: 'Closes 15 Nov', accent: 'violet', timed: false, priv: true, sections: 4, questions: 22, owner: 'Neema Kimaro', edited: 'Yesterday', flagged: 0 },
    { id: 'f3', loc: 'nz', inc: true, title: 'Product Training: Solar Home Systems', status: 'live', responses: 87, spark: sp([0, 4, 9, 12, 8, 14, 11, 10, 9, 10]), closes: 'Closes 20 Oct', accent: 'amber', timed: true, priv: true, sections: 2, questions: 12, owner: 'Amina Juma', edited: '3 days ago', flagged: 6 },
    { id: 'f4', loc: 'mwz', title: 'Customer Feedback: Mwanza Branch', status: 'live', responses: 56, spark: sp([3, 5, 6, 4, 7, 5, 6, 8, 5, 7]), closes: 'No close date', accent: 'blue', timed: false, priv: false, sections: 1, questions: 6, owner: 'Baraka Mushi', edited: '5 days ago', flagged: 0 },
    { id: 'f5', loc: 'aru', title: 'Branch Opening Checklist: Arusha', status: 'draft', responses: 0, spark: null, closes: 'Not published', accent: 'blue', timed: false, priv: true, sections: 3, questions: 18, owner: 'Baraka Mushi', edited: '20 min ago', flagged: 0 },
    { id: 'f6', loc: 'ho', title: 'Fire Safety Drill Quiz', status: 'draft', responses: 0, spark: null, closes: 'Not published', accent: 'rose', timed: true, priv: false, sections: 2, questions: 10, owner: 'Amina Juma', edited: '1 day ago', flagged: 0 },
    { id: 'f7', loc: 'ho', title: 'Supplier Evaluation Q3', status: 'closed', responses: 46, spark: sp([6, 8, 5, 7, 4, 6, 5, 3, 2, 0]), closes: 'Closed 30 Sep', accent: 'slate', timed: false, priv: true, sections: 2, questions: 14, owner: 'Neema Kimaro', edited: '2 weeks ago', flagged: 0 },
    { id: 'f8', loc: 'cz', inc: true, title: 'Cashier Certification Test', status: 'closed', responses: 64, spark: sp([9, 12, 10, 8, 7, 6, 5, 4, 3, 0]), closes: 'Closed 25 Sep', accent: 'teal', timed: true, priv: true, sections: 4, questions: 30, owner: 'Amina Juma', edited: '3 weeks ago', flagged: 11 },
    { id: 'f9', title: 'Holiday Roster Preferences 2025', status: 'archived', responses: 52, spark: null, closes: 'Archived', accent: 'blue', timed: false, priv: false, sections: 1, questions: 4, owner: 'Neema Kimaro', edited: 'Jan 2026', flagged: 0 },
  ]);
  const STAT = {
    live: { label: 'Live', cls: 'bg-c1/15 text-foreground', dot: 'bg-c1 animate-pulse' },
    draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
    closed: { label: 'Closed', cls: 'bg-warning/15 text-warning', dot: 'bg-warning' },
    archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/50' },
  };
  const MEMBERS = reactive([
    { name: 'Amina Juma', email: 'amina.juma@kilimaretail.co.tz', phone: '+255 712 345 678', username: 'amina.j', role: 'owner', twofa: true, active: 'Now' },
    { name: 'Neema Kimaro', email: 'neema.kimaro@kilimaretail.co.tz', phone: '+255 754 220 913', username: 'neema.k', role: 'admin', twofa: true, active: '1h ago' },
    { name: 'Baraka Mushi', email: 'baraka.mushi@kilimaretail.co.tz', phone: '+255 689 401 118', username: 'baraka', role: 'editor', twofa: true, active: 'Today' },
    { name: 'Rehema Mrema', email: 'rehema.mrema@kilimaretail.co.tz', phone: '+255 765 900 431', username: 'rehema.m', role: 'editor', twofa: false, active: '3 days ago' },
    { name: 'Hamisi Swai', email: 'hamisi.swai@kilimaretail.co.tz', phone: '+255 713 004 562', username: 'hswai', role: 'viewer', twofa: false, active: 'Last week' },
    { name: 'Upendo Lyimo', email: 'upendo.lyimo@kilimaretail.co.tz', phone: '', username: '', role: 'viewer', twofa: false, active: 'Invited', invited: true },
  ]);
  const TEMPLATES = [
    { name: 'Staff assessment', desc: 'Timed sections, no going back, integrity rules on.', icon: 'GraduationCap', tags: ['Timed', '3 sections', '12 questions'], system: true, accent: 'teal' },
    { name: 'Customer satisfaction', desc: 'Rating, linear scale and a few choice questions.', icon: 'Smile', tags: ['1 section', '7 questions'], system: true, accent: 'blue' },
    { name: 'Quiz with branching', desc: 'Answers send people to different sections.', icon: 'Split', tags: ['Branching', '4 sections'], system: true, accent: 'violet' },
    { name: 'Supplier evaluation', desc: 'Grids to score suppliers on delivery, quality and price.', icon: 'Truck', tags: ['Grids', '2 sections'], system: true, accent: 'amber' },
    { name: 'Event registration', desc: 'Sessions, dietary choice and shirt size.', icon: 'CalendarCheck', tags: ['1 section', '6 questions'], system: true, accent: 'rose' },
    { name: 'Kilima monthly branch audit', desc: 'Our branch checklist for supervisors. Made by Neema.', icon: 'ClipboardCheck', tags: ['Kilima Retail', '5 sections', '28 questions'], system: false, accent: 'teal' },
  ];

  const ME = { name: 'Amina Juma', email: 'amina.juma@kilimaretail.co.tz', phone: '+255 712 345 678', username: 'amina.j', twofa: true, active: 'Now' };
  const ORGS = reactive([
    { id: 'k', name: 'Kilima Retail', slug: 'kilima-retail', initial: 'K', accent: 'teal', role: 'owner', require2fa: true, viewDefaults: {}, lastUsed: 'Today', forms: null, members: null },
    { id: 'w', name: 'Kilima Wholesale', slug: 'kilima-wholesale', initial: 'W', accent: 'amber', role: 'admin', require2fa: false, viewDefaults: {}, lastUsed: 'Yesterday',
      forms: [
        { id: 'w1', title: 'Distributor Credit Application Review', status: 'live', responses: 34, spark: [2, 3, 5, 4, 3, 6, 4, 3, 2, 2], closes: 'No close date', accent: 'amber', timed: false, priv: true, sections: 3, questions: 16, owner: 'Juma Mrema', edited: 'Today', flagged: 0 },
        { id: 'w2', loc: 'wdc', title: 'Warehouse Safety Inspection', status: 'live', responses: 21, spark: [1, 2, 2, 3, 2, 1, 3, 2, 3, 2], closes: 'Closes 30 Nov', accent: 'blue', timed: false, priv: true, sections: 5, questions: 24, owner: 'Amina Juma', edited: '2 days ago', flagged: 0 },
        { id: 'w3', title: 'Truck Driver Induction Quiz', status: 'draft', responses: 0, spark: null, closes: 'Not published', accent: 'rose', timed: true, priv: false, sections: 2, questions: 15, owner: 'Juma Mrema', edited: '1 hour ago', flagged: 0 },
        { id: 'w4', title: 'Quarterly Stock Count Sign-off', status: 'closed', responses: 12, spark: [0, 1, 2, 3, 2, 2, 1, 1, 0, 0], closes: 'Closed 5 Oct', accent: 'slate', timed: false, priv: true, sections: 1, questions: 8, owner: 'Amina Juma', edited: 'Last week', flagged: 0 },
      ],
      members: [
        { name: 'Juma Mrema', email: 'juma@kilimawholesale.co.tz', phone: '+255 784 113 920', username: 'juma.m', role: 'owner', twofa: true, active: 'Now' },
        { ...ME, email: 'amina.juma@kilimaretail.co.tz', role: 'admin' },
        { name: 'Saidi Ngowi', email: 'saidi@kilimawholesale.co.tz', phone: '', username: 'saidi', role: 'editor', twofa: false, active: '2 days ago' },
        { name: 'Asha Temba', email: 'asha@kilimawholesale.co.tz', phone: '+255 655 210 004', username: '', role: 'viewer', twofa: true, active: 'Last week' },
      ] },
    { id: 'p', name: 'Pwani Agro Dealers', slug: 'pwani-agro', initial: 'P', accent: 'blue', role: 'viewer', require2fa: true, viewDefaults: {}, lastUsed: '3 weeks ago',
      forms: [
        { id: 'p1', loc: 'pbg', title: 'Farmer Training: Tractor Safety', status: 'live', responses: 128, spark: [9, 14, 12, 16, 13, 11, 15, 12, 14, 12], closes: 'Closes 12 Nov', accent: 'blue', timed: true, priv: false, sections: 3, questions: 14, owner: 'Godfrey Laizer', edited: '4 days ago', flagged: 9 },
        { id: 'p2', title: 'Dealer Satisfaction 2026', status: 'closed', responses: 77, spark: [8, 9, 11, 7, 8, 9, 7, 6, 3, 0], closes: 'Closed 30 Sep', accent: 'violet', timed: false, priv: true, sections: 2, questions: 11, owner: 'Godfrey Laizer', edited: '2 weeks ago', flagged: 0 },
      ],
      members: [
        { name: 'Godfrey Laizer', email: 'godfrey@pwaniagro.co.tz', phone: '+255 767 448 120', username: 'glaizer', role: 'owner', twofa: true, active: 'Today' },
        { name: 'Happiness Minja', email: 'happiness@pwaniagro.co.tz', phone: '', username: '', role: 'editor', twofa: true, active: 'Yesterday' },
        { ...ME, role: 'viewer', active: 'Now' },
      ] },
  ]);
  ORGS[0].forms = [...FORMS]; ORGS[0].members = [...MEMBERS];
  ORGS.forEach(o => { o.logo = o.id === 'k' ? 'm2' : ''; o.footer = o.id === 'k' ? '<p>Kilima Retail Ltd · Samora Avenue, Dar es Salaam</p><p>Questions? Write to <a href="mailto:hr@kilimaretail.co.tz">hr@kilimaretail.co.tz</a> or call <strong>+255 22 211 0400</strong>.</p>' : ''; });
  G.org = ORGS[0];
  const ROLE = { owner: 'Owner', admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
  const canEdit = () => !G.viewAs && G.org.role !== 'viewer';
  const canManage = () => !G.viewAs && ['owner', 'admin'].includes(G.org.role);
  const formCount = (o) => (o === G.org ? FORMS : o.forms).filter(f => f.status !== 'archived').length;
  function loadOrg(o) { FORMS.splice(0, FORMS.length, ...o.forms); MEMBERS.splice(0, MEMBERS.length, ...o.members); G.org = o; G.search = ''; }
  function switchOrg(id, opts = {}) {
    const o = ORGS.find(x => x.id === id); if (!o) return;
    if (o === G.org) { if (opts.go) nav('dashboard'); return; }
    if (G.viewAs) { const l = assignsOf(); const i = l.findIndex(x => x.email === PREVIEW_EMAIL); if (i >= 0) l.splice(i, 1); } G.viewAs = null; if (G.route === 'location') G.route = 'locations';
    G.org.forms = [...FORMS]; G.org.members = [...MEMBERS];
    if (opts.instant) { loadOrg(o); return; }
    G.switching = true;
    if (!G.isShell(G.route)) G.route = 'dashboard';
    setTimeout(() => { loadOrg(o); o.lastUsed = 'Now'; G.switching = false;
      toast(`Switched to ${o.name}`, `You are ${o.role === 'admin' || o.role === 'owner' ? 'an' : 'a'} ${ROLE[o.role].toLowerCase()} here.${o.role === 'viewer' ? ' You can see results but not edit.' : ''}`, 'ArrowLeftRight'); }, 450);
  }
  function createOrg({ name, slug, accent }) {
    const o = reactive({ logo: '', footer: '', id: ulid('o'), name, slug, initial: name.trim()[0].toUpperCase(), accent, role: 'owner', require2fa: true, viewDefaults: {}, lastUsed: 'Now', forms: [], members: [{ ...ME, role: 'owner' }] });
    ORGS.push(o); switchOrg(o.id);
    setTimeout(() => toast(`${name} created`, 'You are the owner. Invite your team from Members.', 'Building2'), 500);
  }
  G.switchOrg = switchOrg;
  G.locId = 'aru'; G.viewAs = null; G.viewAsPick = false; G.assignEdit = null; G.newLoc = false;
  watchEffect(() => { G.navRoute = G.route === 'location' ? 'locations' : G.route === 'request' ? 'approvals' : G.route === 'role' ? 'roles' : G.route; });
  const sidebarNav = computed(() => [
    { id: 'forms', label: 'Forms', icon: 'ClipboardList', count: FORMS.filter(f => f.status !== 'archived').length },
    { id: 'templates', label: 'Templates', icon: 'LayoutTemplate' },
    { id: 'members', label: 'Members', icon: 'Users', count: MEMBERS.length },
    { id: 'workspace', label: 'Workspace settings', icon: 'Settings' },
  ]);
  function openForm(f) {
    if (!canEdit()) { nav('responses'); toast('Viewers see results only', 'Opening the sample results for this prototype.', 'Eye'); return; }
    if (f.sample) { nav('builder'); return; }
    nav('builder'); toast('Prototype opens the sample form', 'Every form in this prototype opens Customer Service Assessment Q4.', 'Info');
  }

  /* ---------- Spark (shared mini line) */
  const Spark = {
    props: { data: Array, color: { default: 'var(--c1)' } },
    computed: { p() { const m = Math.max(1, ...this.data), n = this.data.length; const pts = this.data.map((v, i) => [(i / (n - 1)) * 100, 28 - (v / m) * 24]); return { line: 'M' + pts.map(x => x.join(',')).join(' L'), area: 'M0,30 L' + pts.map(x => x.join(',')).join(' L') + ' L100,30 Z' }; } },
    template: `<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="overflow-visible" aria-hidden="true"><path :d="p.area" :fill="color" opacity=".12"/><path :d="p.line" fill="none" :stroke="color" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" class="spark"/></svg>`
  };

  /* ---------- Auth */
  const AuthView = {
    setup() {
      const A = reactive({ rememberOrg: true, id: '', pw: '', show: false, remember: true, err: '', busy: false, caps: false, code: ['', '', '', '', '', ''], codeErr: '', recovery: false, rec: '', trust: true, sent: false, fid: '' });
      const idIcon = computed(() => A.id.includes('@') ? 'Mail' : /^[+\d][\d\s]*$/.test(A.id.trim()) && A.id.trim() ? 'Phone' : 'User');
      const idKind = computed(() => ({ Mail: 'email', Phone: 'phone number', User: 'username' })[idIcon.value]);
      function signIn() {
        if (!A.id.trim()) { A.err = 'Enter your email, phone number or username.'; return; }
        if (A.pw.length < 6) { A.err = `That ${idKind.value} and password do not match. 4 tries left before a 15-minute lock.`; return; }
        A.err = ''; A.busy = true; setTimeout(() => { A.busy = false; G.route = 'twofa'; }, 800);
      }
      const refs = ref([]);
      const focus = (i) => nextTick(() => refs.value[i]?.focus());
      function onInput(e, i) { const v = e.target.value.replace(/\D/g, ''); if (v.length > 1) { v.slice(0, 6).split('').forEach((d, k) => A.code[k] = d); } else { A.code[i] = v; if (v && i < 5) focus(i + 1); } A.codeErr = ''; if (A.code.every(Boolean)) verify(); }
      function onKey(e, i) { if (e.key === 'Backspace' && !A.code[i] && i > 0) { A.code[i - 1] = ''; focus(i - 1); } }
      function verify() {
        A.busy = true;
        setTimeout(() => {
          A.busy = false;
          const ok = A.recovery ? /^[a-z0-9]{4}-?[a-z0-9]{4}$/i.test(A.rec.trim()) : A.code.join('') === '123456';
          if (!ok) { A.codeErr = A.recovery ? 'That recovery code is not valid or was already used.' : 'That code is not right. Codes change every 30 seconds.'; A.code = ['', '', '', '', '', '']; focus(0); return; }
          G.route = 'orgpick';
        }, 700);
      }
      watch(() => G.route, (r) => { if (r === 'twofa') { A.code = ['', '', '', '', '', '']; A.codeErr = ''; setTimeout(() => refs.value[0]?.focus(), 360); } });
      function capsCheck(e) { A.caps = e.getModifierState && e.getModifierState('CapsLock'); }
      const mask = computed(() => { const v = A.fid || A.id || 'amina.juma@kilimaretail.co.tz'; return v.includes('@') ? v[0] + '•••@' + v.split('@')[1] : v.length > 4 ? v.slice(0, 4) + '•••' + v.slice(-2) : v; });
      function pickOrg(o) { switchOrg(o.id, { instant: true }); o.lastUsed = 'Now'; nav('dashboard'); G.toast('Welcome back, Amina', `Signed in to ${o.name}${A.trust ? '. This device is remembered for 30 days.' : '.'}`, 'LogIn'); }
      return { G, A, idIcon, signIn, refs, onInput, onKey, verify, capsCheck, mask, ORGS, ROLE, formCount, pickOrg };
    },
    template: `
    <div class="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <!-- brand panel -->
      <aside class="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div class="flex items-center gap-2.5"><span class="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15"><Icon :name="PRODUCT.icon" :size="18"/></span><span class="text-lg font-semibold tracking-tight">{{ PRODUCT.name }}</span></div>
        <div class="relative">
          <!-- mini product mock -->
          <div class="pointer-events-none relative mx-auto h-64 max-w-sm select-none" aria-hidden="true">
            <div class="absolute left-8 right-0 top-0 rotate-[4deg] rounded-xl bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15"><div class="h-2 w-24 rounded bg-primary-foreground/30"></div><div class="mt-3 grid grid-cols-5 items-end gap-1.5 h-20"><span class="rounded-t bg-primary-foreground/40" style="height:30%"></span><span class="rounded-t bg-primary-foreground/40" style="height:55%"></span><span class="rounded-t bg-primary-foreground/40" style="height:40%"></span><span class="rounded-t bg-primary-foreground/80" style="height:95%"></span><span class="rounded-t bg-primary-foreground/40" style="height:62%"></span></div></div>
            <div class="absolute left-0 right-10 top-24 -rotate-[2deg] rounded-xl bg-background p-4 text-foreground shadow-2xl"><div class="flex items-center justify-between"><div class="h-2 w-32 rounded bg-foreground/20"></div><span class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning"><Icon name="Timer" :size="10"/>4:12</span></div>
              <div class="mt-3 grid gap-2"><div class="flex items-center gap-2 text-xs"><span class="h-3.5 w-3.5 rounded-full border-2 border-primary grid place-items-center"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span></span>M-Pesa</div><div class="flex items-center gap-2 text-xs text-muted-foreground"><span class="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40"></span>Tigo Pesa</div><div class="flex items-center gap-2 text-xs text-muted-foreground"><span class="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40"></span>Airtel Money</div></div></div>
          </div>
          <h2 class="mt-6 max-w-md text-3xl font-semibold leading-tight tracking-tight" style="text-wrap:balance">Assessments and surveys your teams can trust.</h2>
          <ul class="mt-5 grid gap-2.5 text-sm text-primary-foreground/85">
            <li class="flex items-center gap-2.5"><Icon name="Timer" :size="16"/>Timed sections the server keeps honest</li>
            <li class="flex items-center gap-2.5"><Icon name="ShieldCheck" :size="16"/>Full screen, one tab, no copy and paste</li>
            <li class="flex items-center gap-2.5"><Icon name="ChartBarBig" :size="16"/>Live results, filters and Excel export</li>
          </ul>
        </div>
        <p class="text-xs text-primary-foreground/60">© 2026 {{ PRODUCT.name }} · {{ PRODUCT.city }}</p>
      </aside>

      <!-- form side -->
      <main class="flex flex-col px-4 py-8 sm:px-8">
        <div class="flex items-center justify-between"><div class="flex items-center gap-2 lg:invisible"><span class="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon :name="PRODUCT.icon" :size="16"/></span><span class="font-semibold">{{ PRODUCT.name }}</span></div>
          <DropdownMenu :items="['light','dark','system'].map(id=>({id,label:id[0].toUpperCase()+id.slice(1),icon:{light:'Sun',dark:'Moon',system:'Laptop'}[id],checked:G.theme===id}))" @select="it=>G.theme=it.id"><template #trigger><Button variant="ghost" size="icon-sm" aria-label="Theme"><Icon :name="G.theme==='dark'?'Moon':G.theme==='light'?'Sun':'Laptop'"/></Button></template></DropdownMenu></div>
        <div class="mx-auto my-auto w-full max-w-sm py-10">
          <Transition name="fade" mode="out-in">
          <!-- SIGN IN -->
          <form v-if="G.view==='login'" key="l" @submit.prevent="signIn" novalidate class="grid gap-5">
            <div><h1 class="text-2xl font-semibold tracking-tight">Sign in</h1><p class="mt-1 text-sm text-muted-foreground">Use your email, phone number or username.</p></div>
            <div class="grid gap-1.5"><label for="li-id" class="text-sm font-medium">Email, phone or username</label>
              <div class="relative"><Icon :name="idIcon" :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input id="li-id" class="!h-10 pl-9" v-model="A.id" autocomplete="username" placeholder="amina.juma@kilimaretail.co.tz"/></div></div>
            <div class="grid gap-1.5"><div class="flex items-center justify-between"><label for="li-pw" class="text-sm font-medium">Password</label><button type="button" class="text-xs font-medium text-primary underline-offset-4 hover:underline" @click="A.fid=A.id; A.sent=false; G.route='forgot'">Forgot password?</button></div>
              <div class="relative"><Input id="li-pw" class="!h-10 pr-10" :type="A.show ? 'text' : 'password'" v-model="A.pw" autocomplete="current-password" @keydown="capsCheck" @keyup="capsCheck"/>
                <button type="button" class="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground" @click="A.show=!A.show" :aria-label="A.show ? 'Hide password' : 'Show password'"><Icon :name="A.show ? 'EyeOff' : 'Eye'" :size="16"/></button></div>
              <p v-if="A.caps" class="flex items-center gap-1.5 text-xs text-warning"><Icon name="ArrowBigUp" :size="13"/>Caps Lock is on</p></div>
            <label class="flex items-center gap-2 text-sm"><Checkbox v-model="A.remember"/>Keep me signed in</label>
            <p v-if="A.err" class="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert"><Icon name="CircleAlert" :size="15" class="mt-0.5"/>{{ A.err }}</p>
            <Button type="submit" class="!h-10" :disabled="A.busy"><Icon v-if="A.busy" name="LoaderCircle" class="animate-spin"/>{{ A.busy ? 'Signing in…' : 'Sign in' }}</Button>
            <p class="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">Prototype: any username, password <span class="font-mono font-medium text-foreground">demo1234</span>, then code <span class="font-mono font-medium text-foreground">123456</span>.</p>
          </form>

          <!-- TWO-STEP -->
          <form v-else-if="G.view==='twofa'" key="t" @submit.prevent="verify" class="grid gap-5">
            <div><span class="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="ShieldCheck" :size="20"/></span>
              <h1 class="mt-4 text-2xl font-semibold tracking-tight">Two-step verification</h1>
              <p class="mt-1 text-sm text-muted-foreground">{{ A.recovery ? 'Enter one of the recovery codes you saved when you set up two-step verification.' : 'Enter the 6-digit code from your authenticator app.' }}</p></div>
            <div v-if="!A.recovery" class="flex justify-between gap-1.5">
              <input v-for="(d, i) in A.code" :key="i" :ref="el => refs[i] = el" :value="d" @input="onInput($event, i)" @keydown="onKey($event, i)" inputmode="numeric" :autocomplete="i===0 ? 'one-time-code' : 'off'" maxlength="6" :aria-label="'Digit ' + (i+1)" :disabled="A.busy"
                :class="['h-12 w-12 rounded-md border bg-background text-center text-lg font-semibold tnum shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50', A.codeErr ? 'border-destructive' : 'border-input']">
            </div>
            <div v-else class="grid gap-1.5"><label for="rc" class="text-sm font-medium">Recovery code</label><Input id="rc" class="!h-10 font-mono uppercase tracking-widest" v-model="A.rec" placeholder="XXXX-XXXX"/></div>
            <p v-if="A.codeErr" class="flex items-center gap-1.5 text-sm text-destructive" role="alert"><Icon name="CircleAlert" :size="14"/>{{ A.codeErr }}</p>
            <label class="flex items-center gap-2 text-sm"><Checkbox v-model="A.trust"/>Remember this device for 30 days</label>
            <Button type="submit" class="!h-10" :disabled="A.busy"><Icon v-if="A.busy" name="LoaderCircle" class="animate-spin"/>{{ A.busy ? 'Checking…' : 'Verify' }}</Button>
            <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
              <button type="button" class="font-medium text-primary underline-offset-4 hover:underline" @click="A.recovery=!A.recovery; A.codeErr=''">{{ A.recovery ? 'Use authenticator code' : 'Use a recovery code' }}</button>
              <button type="button" class="text-muted-foreground hover:text-foreground" @click="G.route='login'">Back to sign in</button></div>
          </form>

          <!-- ORG PICKER -->
          <div v-else-if="G.view==='orgpick'" key="o" class="grid gap-5">
            <div><h1 class="text-2xl font-semibold tracking-tight">Choose an organisation</h1><p class="mt-1 text-sm text-muted-foreground">You belong to {{ ORGS.length }}. You can switch any time from the menu.</p></div>
            <div class="grid gap-2">
              <button v-for="(o, i) in ORGS" :key="o.id" type="button" @click="pickOrg(o)" class="kpi group flex items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :style="{ animationDelay: (i*60)+'ms' }">
                <OrgAvatar :org="o" size="lg"/>
                <span class="min-w-0 flex-1"><span class="block truncate font-medium">{{ o.name }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ ROLE[o.role] }} · {{ formCount(o) }} forms · used {{ o.lastUsed.toLowerCase() }}</span></span>
                <Icon name="ChevronRight" :size="16" class="text-muted-foreground transition-transform group-hover:translate-x-0.5"/></button>
            </div>
            <label class="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox v-model="A.rememberOrg"/>Open the last one I used next time</label>
          </div>

          <!-- FORGOT -->
          <div v-else key="f" class="grid gap-5">
            <template v-if="!A.sent">
              <div><h1 class="text-2xl font-semibold tracking-tight">Reset your password</h1><p class="mt-1 text-sm text-muted-foreground">We send a reset link by email, or a code by SMS if you use your phone number.</p></div>
              <div class="grid gap-1.5"><label for="fp" class="text-sm font-medium">Email, phone or username</label><Input id="fp" class="!h-10" v-model="A.fid"/></div>
              <Button class="!h-10" @click="A.sent = true" :disabled="!A.fid.trim()">Send reset instructions</Button>
            </template>
            <template v-else>
              <span class="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="MailCheck" :size="20"/></span>
              <div><h1 class="text-2xl font-semibold tracking-tight">Check your inbox</h1><p class="mt-1 text-sm text-muted-foreground">If an account matches <span class="font-medium text-foreground">{{ mask }}</span>, instructions are on the way. The link expires in 60 minutes.</p></div>
            </template>
            <button type="button" class="justify-self-start text-sm font-medium text-primary underline-offset-4 hover:underline" @click="G.route='login'"><Icon name="ArrowLeft" :size="14" class="mr-1 inline"/>Back to sign in</button>
          </div>
          </Transition>
        </div>
        <p class="text-center text-xs text-muted-foreground">Protected by rate limits and two-step verification.</p>
      </main>
    </div>`
  };

  /* ---------- Organisation switcher */
  const OrgAvatar = {
    props: { org: Object, size: { default: 'md' } },
    setup() { return { ACCENTS }; },
    template: `<span :class="['form-theme grid shrink-0 place-items-center rounded-md bg-fa font-bold text-fa-fg', size==='sm' ? 'h-6 w-6 text-[11px]' : size==='lg' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-sm']" :style="{ '--fa-l': ACCENTS[org.accent].l, '--fa-d': ACCENTS[org.accent].d }">{{ org.initial }}</span>`
  };
  const OrgSwitcher = {
    props: { collapsed: Boolean },
    setup(props) {
      /* D9: portalled to <body>, fixed-positioned, kept inside the viewport (was absolute inside the sidebar and slid under page content) */
      const open = ref(false), root = ref(null), panel = ref(null), q = ref(''), pos = ref({});
      function place() {
        const t = root.value && root.value.getBoundingClientRect(), el = panel.value; if (!t || !el) return;
        const vw = window.innerWidth, vh = window.innerHeight, pad = 8, w = Math.min(288, vw - pad * 2), h = el.offsetHeight;
        let left = props.collapsed ? t.right + 8 : t.left, top = props.collapsed ? t.top : t.bottom + 4;
        left = Math.max(pad, Math.min(left, vw - pad - w));
        if (top + h > vh - pad) top = Math.max(pad, (props.collapsed ? vh - pad : t.top - 4) - h);
        pos.value = { left: left + 'px', top: top + 'px', width: w + 'px' };
      }
      watch(open, (v) => { if (v) { pos.value = { left: '-9999px', top: '0px', width: '288px' }; nextTick(place); } });
      const inside = (e) => (root.value && root.value.contains(e.target)) || (panel.value && panel.value.contains(e.target));
      const onDoc = (e) => { if (open.value && !inside(e)) open.value = false; };
      const onKey = (e) => { if (e.key === 'Escape') open.value = false; };
      const onMove = (e) => { if (open.value && !(panel.value && panel.value.contains(e.target))) place(); };
      onMounted(() => { document.addEventListener('pointerdown', onDoc); document.addEventListener('keydown', onKey); window.addEventListener('scroll', onMove, true); window.addEventListener('resize', onMove); });
      onBeforeUnmount(() => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onMove, true); window.removeEventListener('resize', onMove); });
      const list = computed(() => ORGS.filter(o => !q.value || o.name.toLowerCase().includes(q.value.toLowerCase())));
      function pick(o) { open.value = false; q.value = ''; switchOrg(o.id); G.mobileNav = false; }
      function create() { open.value = false; G.mobileNav = false; G.newOrg = true; }
      return { G, open, root, panel, pos, q, list, pick, create, ROLE, formCount, ORGS };
    },
    template: `<div ref="root" class="relative">
      <button type="button" @click="open=!open" :aria-expanded="open" aria-haspopup="listbox" :aria-label="'Organisation: ' + G.org.name + '. Switch organisation'"
        :class="['flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', collapsed && 'justify-center', open && 'bg-accent']">
        <OrgAvatar :org="G.org"/>
        <span v-if="!collapsed" class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ G.org.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ ROLE[G.org.role] }} · {{ PRODUCT.domain }}/{{ G.org.slug }}</span></span>
        <Icon v-if="!collapsed" name="ChevronsUpDown" :size="14" class="text-muted-foreground"/></button>
      <Teleport to="body"><div v-if="open" ref="panel" :style="pos" class="pop fixed z-[95] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-xl" role="listbox" aria-label="Organisations">
        <div v-if="ORGS.length > 4" class="relative mb-1"><Icon name="Search" :size="13" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"/><input v-model="q" placeholder="Find organisation" class="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-ring"></div>
        <p class="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your organisations</p>
        <button v-for="(o, i) in list" :key="o.id" type="button" role="option" :aria-selected="o===G.org" @click="pick(o)" class="flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none">
          <OrgAvatar :org="o"/>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ o.name }}</span><span class="block truncate text-xs text-muted-foreground tnum">{{ ROLE[o.role] }} · {{ formCount(o) }} forms</span></span>
          <Icon v-if="o===G.org" name="Check" :size="15" class="text-primary"/><kbd v-else-if="i < 9" class="hidden rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground sm:inline">⌥{{ i+1 }}</kbd></button>
        <div class="-mx-1.5 my-1 h-px bg-border"></div>
        <button type="button" @click="create" class="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm hover:bg-accent"><span class="grid h-8 w-8 place-items-center rounded-md border border-dashed text-muted-foreground"><Icon name="Plus" :size="15"/></span>Create organisation</button>
      </div></Teleport></div>`
  };

  /* ---------- Menu config (mirrors a menu_items table: display mode + animation per menu) */
  const MENU = reactive([
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', route: 'dashboard', visible: true },
    { id: 'forms', label: 'Forms', icon: 'ClipboardList', route: 'forms', perm: 'Forms.list', visible: true },
    { id: 'templates', label: 'Templates', icon: 'LayoutTemplate', route: 'templates', perm: 'Templates.list', visible: true },
    { id: 'access', label: 'Users and access', icon: 'ShieldCheck', mode: 'dropdown', anim: 'default', visible: true,
      groups: [{ label: '', items: [{ id: 'members', label: 'Users', icon: 'Users', route: 'members', perm: 'Users.list' }, { id: 'roles', label: 'Roles', icon: 'Shield', route: 'roles', perm: 'Roles.list' }, { id: 'permissions', label: 'Permissions', icon: 'KeyRound', route: 'permissions', perm: 'Permissions.list' }] }] },
    { id: 'geo', label: 'Locations', icon: 'MapPin', mode: 'dropdown', anim: 'default', visible: true,
      groups: [{ label: '', items: [{ id: 'locations', label: 'Locations', icon: 'MapPin', route: 'locations', perm: 'Locations.list' }, { id: 'countries', label: 'Countries', icon: 'Globe', route: 'countries', perm: 'Countries.list' }] }] },
    { id: 'approvals-menu', label: 'Approvals', icon: 'Stamp', mode: 'dropdown', anim: 'default', visible: true,
      groups: [{ label: '', items: [{ id: 'approvals', label: 'Inbox', icon: 'Inbox', route: 'approvals', perm: 'Requests.list' }, { id: 'delegations', label: 'Delegations', icon: 'Forward', route: 'delegations', perm: 'Delegations.list' }] }] },
    { id: 'mobile', label: 'Mobile Releases', icon: 'Smartphone', route: 'mobile', perm: 'MobileReleases.list', visible: true },
    { id: 'reports', label: 'Reports', icon: 'ChartColumn', route: 'reports', perm: 'Reports.list', visible: true },
    { id: 'system', label: 'System', icon: 'Server', mode: 'panel', anim: 'default', visible: true,
      groups: [
        { label: 'Monitoring', items: [{ id: 'logs', label: 'Logs', icon: 'History', route: 'logs', perm: 'Logs.list' }, { id: 'queue', label: 'Queue', icon: 'ListOrdered', route: 'queue', badge: '3', perm: 'Queue.list' }, { id: 'tasks', label: 'Scheduled Tasks', icon: 'CalendarClock', route: 'tasks', perm: 'ScheduledTasks.list' }] },
        { label: 'Messaging', items: [{ id: 'notifications', label: 'Notifications', icon: 'Bell', route: 'notifications', perm: 'Notifications.list' }, { id: 'notif-settings', label: 'Notification settings', icon: 'Settings2', route: 'notif-settings', perm: 'NotificationSettings.manage' }, { id: 'broadcasts', label: 'Broadcasts', icon: 'Megaphone', route: 'broadcasts', perm: 'Broadcasts.send' }] },
        { label: 'Content', items: [{ id: 'media', label: 'Media', icon: 'FolderOpen', route: 'media', perm: 'Media.list' }] },
      ] },
    { id: 'config', label: 'Configuration', icon: 'SlidersHorizontal', mode: 'panel', anim: 'default', visible: true,
      groups: [{ label: '', items: [{ id: 'workspace', label: 'Settings', icon: 'Settings', route: 'workspace', perm: 'Settings.manage' }, { id: 'menus', label: 'Menu Management', icon: 'ListTree', route: 'menus', perm: 'Menus.manage' }, { id: 'request-types', label: 'Approval workflows', icon: 'Workflow', route: 'request-types', perm: 'RequestTypes.list' }] }] },
  ]);
  const MODES = { dropdown: { label: 'Dropdown', icon: 'ChevronsUpDown', def: 'stagger' }, panel: { label: 'Panel', icon: 'PanelLeftOpen', def: 'slide' }, section: { label: 'Section', icon: 'Heading', def: 'none' } };
  const ANIMS = { stagger: 'Expand + stagger', fade: 'Fade + scale', slide: 'Slide panel', none: 'None' };
  const ANIMS_FOR = { dropdown: ['stagger', 'fade', 'none'], panel: ['slide', 'fade', 'none'], section: ['none'] };
  const animOf = (m) => m.anim === 'default' || !ANIMS_FOR[m.mode].includes(m.anim) ? MODES[m.mode].def : m.anim;
  const leaves = (m) => m.groups ? m.groups.flatMap(g => g.items) : [m];
  const ALL_LEAVES = computed(() => MENU.flatMap(leaves));
  const findLeaf = (route) => ALL_LEAVES.value.find(l => l.route === route);
  const parentOf = (route) => MENU.find(m => m.groups && leaves(m).some(l => l.route === route));
  const isShell = (r) => r === 'design' || r === 'location' || r === 'request' || r === 'role' || ALL_LEAVES.value.some(l => l.route === r);
  G.isShell = isShell;

  /* ---------- Access: permission catalogue, roles, OR rule (spatie-style) */
  const PERMS = [
    { name: 'Forms.list', label: 'See forms', module: 'Forms' }, { name: 'Forms.create', label: 'Create and edit forms', module: 'Forms' }, { name: 'Forms.publish', label: 'Publish and close forms', module: 'Forms' }, { name: 'Forms.delete', label: 'Archive and delete forms', module: 'Forms' },
    { name: 'Templates.list', label: 'See templates', module: 'Forms' },
    { name: 'Responses.list', label: 'See results', module: 'Results' }, { name: 'Responses.export', label: 'Export results', module: 'Results' }, { name: 'Responses.void', label: 'Void responses and reset people', module: 'Results' },
    { name: 'Users.list', label: 'See users', module: 'Users and access' }, { name: 'Users.invite', label: 'Invite and remove users', module: 'Users and access' }, { name: 'Roles.list', label: 'See roles', module: 'Users and access' }, { name: 'Roles.manage', label: 'Create and edit roles', module: 'Users and access' }, { name: 'Permissions.list', label: 'See permission catalogue', module: 'Users and access' }, { name: 'Users.impersonate', label: 'View as another person', module: 'Users and access' },
    { name: 'Locations.list', label: 'See locations', module: 'Locations' }, { name: 'Locations.manage', label: 'Create and edit locations', module: 'Locations' }, { name: 'Locations.assign', label: 'Assign people and location roles', module: 'Locations' }, { name: 'Countries.list', label: 'See countries', module: 'Locations' },
    { name: 'MobileReleases.list', label: 'See mobile releases', module: 'Mobile and reports' }, { name: 'MobileReleases.publish', label: 'Publish mobile releases', module: 'Mobile and reports' }, { name: 'Reports.list', label: 'See reports', module: 'Mobile and reports' },
    { name: 'Logs.list', label: 'See logs', module: 'System' }, { name: 'Queue.list', label: 'See queue', module: 'System' }, { name: 'Queue.retry', label: 'Retry failed jobs', module: 'System' }, { name: 'ScheduledTasks.list', label: 'See scheduled tasks', module: 'System' },
    { name: 'Notifications.list', label: 'See notifications', module: 'System' }, { name: 'NotificationSettings.manage', label: 'Manage notification settings', module: 'System' }, { name: 'Broadcasts.send', label: 'Send broadcasts', module: 'System' }, { name: 'Media.list', label: 'See media library', module: 'System' },
    { name: 'Requests.list', label: 'See approval requests', module: 'Approvals' }, { name: 'Requests.create', label: 'Send requests for approval', module: 'Approvals' }, { name: 'Requests.manage', label: 'See and cancel all requests', module: 'Approvals' }, { name: 'Delegations.list', label: 'See and set delegations', module: 'Approvals' }, { name: 'RequestTypes.list', label: 'See approval workflows', module: 'Approvals' }, { name: 'RequestTypes.manage', label: 'Edit approval workflows', module: 'Approvals' },
    { name: 'Settings.manage', label: 'Manage workspace settings', module: 'Configuration' }, { name: 'Menus.manage', label: 'Manage menus', module: 'Configuration' },
  ];
  const P = (...names) => names;
  const ALLP = PERMS.map(p => p.name);
  const ROLES = reactive([
    { id: 'owner', name: 'Owner', desc: 'Everything, including billing and deleting the organisation.', system: true, locked: true, perms: [...ALLP] },
    { id: 'admin', name: 'Admin', desc: 'Runs the workspace: users, roles, settings and system pages.', system: true, perms: ALLP.filter(n => !['Forms.delete'].includes(n)) },
    { id: 'editor', name: 'Editor', desc: 'Builds forms and works with results.', system: true, perms: P('Forms.list', 'Forms.create', 'Forms.publish', 'Templates.list', 'Responses.list', 'Responses.export', 'Users.list', 'Locations.list', 'Countries.list', 'Reports.list', 'Media.list', 'Notifications.list', 'Requests.list', 'Requests.create', 'Delegations.list') },
    { id: 'viewer', name: 'Viewer', desc: 'Reads results and reports only.', system: true, perms: P('Forms.list', 'Responses.list', 'Reports.list', 'Notifications.list', 'Requests.list') },
    { id: 'supervisor', name: 'Branch supervisor', desc: 'Custom role for branch heads: results and their locations.', system: false, perms: P('Forms.list', 'Responses.list', 'Responses.export', 'Locations.list', 'Reports.list', 'Notifications.list', 'Requests.list', 'Requests.create', 'Delegations.list') },
    { id: 'zone_manager', name: 'Zone manager', desc: 'Custom role: runs a zone, its branches and their forms.', system: false, perms: P('Forms.list', 'Forms.create', 'Forms.publish', 'Templates.list', 'Responses.list', 'Responses.export', 'Responses.void', 'Locations.list', 'Locations.assign', 'Users.list', 'Reports.list', 'Notifications.list', 'Requests.list', 'Requests.create', 'Delegations.list') },
    { id: 'auditor', name: 'Branch auditor', desc: 'Custom role: reads results and exports them for audits.', system: false, perms: P('Forms.list', 'Responses.list', 'Responses.export', 'Reports.list') },
  ]);
  const DIRECT = reactive({}); // email -> [perm]
  const roleById = (id) => ROLES.find(r => r.id === id);
  const permsOfSubject = (sub) => !sub ? [] : sub.kind === 'role' ? roleById(sub.id).perms : (() => { const m = MEMBERS.find(x => x.email + x.phone === sub.id); if (!m) return []; return [...new Set([...(roleById(m.role) || { perms: [] }).perms, ...(DIRECT[m.email + m.phone] || [])])]; })();
  const leafVisible = (leaf, perms) => !leaf.perm || perms.includes(leaf.perm);
  const menuVisibleFor = (m, perms) => m.visible !== false && (m.groups ? leaves(m).some(l => leafVisible(l, perms)) : leafVisible(m, perms)); // OR rule
  const myPerms = computed(() => G.viewAs ? viewAsPerms(G.viewAs.email) : (roleById(G.org.role) || { perms: ALLP }).perms);
  const holdersOf = (perm) => ROLES.filter(r => r.perms.includes(perm));
  const permLabel = (n) => (PERMS.find(p => p.name === n) || { label: n }).label;
  const GRANT = reactive({ open: false, subject: null, perms: [], picked: [], target: 'role', reason: '', title: '' });
  function askGrant(subject, permsMissing, title) { Object.assign(GRANT, { open: true, subject, perms: permsMissing, picked: [...permsMissing], target: 'role', reason: '', title }); }
  G.askGrant = askGrant;

  const NAV = reactive({ open: null, panel: null, dir: 'push', q: '', flyout: null, flyPos: {} });
  watch(() => G.navRoute, (r) => { const p = parentOf(r); if (p && p.mode === 'dropdown') NAV.open = p.id; });
  function countFor(id) { if (id === 'approvals' || id === 'approvals-menu') return waitingForMe.value.length || null; return id === 'forms' ? FORMS.filter(f => f.status !== 'archived' && formVisible(f)).length : id === 'members' ? MEMBERS.length : null; }

  /* height animation hooks for dropdowns */
  const expandHooks = {
    onEnter(el, done) { el.style.height = '0px'; el.style.overflow = 'hidden'; requestAnimationFrame(() => { el.style.transition = 'height 240ms cubic-bezier(.2,.8,.2,1)'; el.style.height = el.scrollHeight + 'px'; }); setTimeout(() => { el.style.height = ''; el.style.overflow = ''; el.style.transition = ''; done(); }, 260); },
    onLeave(el, done) { el.style.height = el.scrollHeight + 'px'; el.style.overflow = 'hidden'; requestAnimationFrame(() => { el.style.transition = 'height 200ms cubic-bezier(.4,0,.2,1)'; el.style.height = '0px'; }); setTimeout(done, 210); },
  };

  /* ---------- Sidebar contents (shared by rail, expanded, and phone sheet) */
  const SideNav = {
    props: { collapsed: Boolean },
    setup(props) {
      function go(route) { if (route === G.route) { G.mobileNav = false; return; } nav(route); NAV.flyout = null; }
      function toggle(m) {
        if (m.mode === 'panel') { NAV.dir = 'push'; NAV.q = ''; NAV.panel = m.id; return; }
        NAV.open = NAV.open === m.id ? null : m.id; // always accordion
      }
      function back() { NAV.dir = 'pop'; NAV.panel = null; }
      const panelMenu = computed(() => MENU.find(m => m.id === NAV.panel));
      const panelGroups = computed(() => { const m = panelMenu.value; if (!m) return []; const q = NAV.q.trim().toLowerCase(); return m.groups.map(g => ({ ...g, items: g.items.filter(i => leafVisible(i, myPerms.value) && (!q || i.label.toLowerCase().includes(q))) })).filter(g => g.items.length); });
      const active = (m) => m.route ? G.navRoute === m.route : leaves(m).some(l => l.route === G.navRoute);
      const viewName = computed(() => { const m = panelMenu.value || MENU.find(x => x.id === NAV.lastPanel); const a = m ? animOf(m) : 'slide'; return a === 'none' ? 'nav-none' : a === 'fade' ? 'nav-fade' : 'nav-' + NAV.dir; });
      watch(() => NAV.panel, (v, o) => { if (o) NAV.lastPanel = o; if (v) NAV.lastPanel = v; });
      function openFlyout(e, m) {
        if (NAV.flyout === m.id) { NAV.flyout = null; return; }
        const r = e.currentTarget.getBoundingClientRect();
        NAV.flyPos = { left: (r.right + 8) + 'px', top: Math.min(r.top, window.innerHeight - 40 - leaves(m).length * 36 - m.groups.length * 26) + 'px' };
        NAV.flyout = m.id;
      }
      const flyMenu = computed(() => MENU.find(m => m.id === NAV.flyout));
      const onDoc = (e) => { if (NAV.flyout && !e.target.closest('[data-flyout]') && !e.target.closest('[data-flytrigger]')) NAV.flyout = null; };
      onMounted(() => document.addEventListener('pointerdown', onDoc));
      onBeforeUnmount(() => document.removeEventListener('pointerdown', onDoc));
      watch(() => props.collapsed, () => { NAV.flyout = null; });
      function ddEnter(m, el, done) { animOf(m) === 'stagger' ? expandHooks.onEnter(el, done) : animOf(m) === 'fade' ? setTimeout(done, 170) : done(); }
      function ddLeave(m, el, done) { animOf(m) === 'stagger' ? expandHooks.onLeave(el, done) : animOf(m) === 'fade' ? setTimeout(done, 170) : done(); }
      const shown = computed(() => MENU.filter(m => menuVisibleFor(m, myPerms.value)));
      const visLeaves = (m) => leaves(m).filter(l => leafVisible(l, myPerms.value));
      return { leafVisible, myPerms, shown, visLeaves, G, NAV, MENU, go, toggle, back, ddEnter, ddLeave, panelMenu, panelGroups, active, animOf, viewName, openFlyout, flyMenu, expandHooks, countFor, FORMS, openForm, leaves };
    },
    template: `<div class="flex h-full flex-col p-2">
      <div class="mb-2"><OrgSwitcher :collapsed="collapsed"/></div>

      <!-- RAIL (collapsed): icons + flyouts -->
      <nav v-if="collapsed" class="grid gap-1" aria-label="Main">
        <template v-for="m in shown" :key="m.id">
          <Tooltip v-if="m.route" :content="m.label" side="right" class="w-full"><button type="button" @click="go(m.route)" :aria-label="m.label" :class="['grid h-9 w-full place-items-center rounded-md', active(m) ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']"><Icon :name="m.icon" :size="18"/></button></Tooltip>
          <button v-else type="button" data-flytrigger @click="openFlyout($event, m)" :aria-label="m.label" :aria-expanded="NAV.flyout===m.id" :class="['relative grid h-9 w-full place-items-center rounded-md', active(m) || NAV.flyout===m.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']"><Icon :name="m.icon" :size="18"/><span class="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-muted-foreground/60"></span></button>
        </template>
        <Teleport to="body"><Transition name="nav-fly"><div v-if="flyMenu" data-flyout class="fixed z-[96] w-60 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-xl" :style="NAV.flyPos" role="menu">
          <p class="px-2 pb-1 pt-1 text-xs font-semibold">{{ flyMenu.label }}</p>
          <template v-for="g in flyMenu.groups.map(g=>({...g, items: g.items.filter(i=>leafVisible(i, myPerms))})).filter(g=>g.items.length)" :key="g.label"><p v-if="g.label" class="px-2 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ g.label }}</p>
            <button v-for="it in g.items" :key="it.id" type="button" role="menuitem" @click="go(it.route)" :class="['flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm', G.navRoute===it.route ? 'bg-accent font-medium' : 'hover:bg-accent']"><Icon :name="it.icon" :size="15" class="text-muted-foreground"/>{{ it.label }}</button></template>
        </div></Transition></Teleport>
      </nav>

      <!-- EXPANDED: main list <-> panel -->
      <div v-else class="relative min-h-0 flex-1 overflow-hidden">
        <Transition :name="viewName">
          <!-- PANEL VIEW -->
          <div v-if="panelMenu" key="panel" class="absolute inset-0 flex flex-col overflow-y-auto">
            <button type="button" @click="back" class="flex h-9 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Icon name="ArrowLeft" :size="16"/>Main menu</button>
            <div class="flex items-center gap-2.5 px-2.5 pb-2 pt-3"><span class="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><Icon :name="panelMenu.icon" :size="16"/></span><p class="font-semibold">{{ panelMenu.label }}</p></div>
            <div v-if="leaves(panelMenu).length > 4" class="relative mx-0.5 mb-2"><Icon name="Search" :size="13" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"/><input v-model="NAV.q" :placeholder="'Search ' + panelMenu.label.toLowerCase()" class="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-ring"></div>
            <template v-for="(g, gi) in panelGroups" :key="g.label + gi">
              <p v-if="g.label" class="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ g.label }}</p>
              <button v-for="(it, i) in g.items" :key="it.id" type="button" @click="go(it.route)" :class="['nav-item flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm', G.navRoute===it.route ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']" :style="{ animationDelay: (60 + (gi*3+i)*30) + 'ms' }">
                <Icon :name="it.icon" :size="16"/><span class="flex-1 text-left">{{ it.label }}</span><span v-if="it.badge" class="rounded-full bg-warning/15 px-1.5 text-[11px] font-medium text-warning tnum">{{ it.badge }}</span></button>
            </template>
            <p v-if="!panelGroups.length" class="px-2.5 py-4 text-sm text-muted-foreground">Nothing matches "{{ NAV.q }}".</p>
          </div>

          <!-- MAIN VIEW -->
          <div v-else key="main" class="absolute inset-0 flex flex-col overflow-y-auto">
            <template v-for="m in shown" :key="m.id">
              <!-- link -->
              <button v-if="m.route" type="button" @click="go(m.route)" :class="['flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm', active(m) ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']">
                <Icon :name="m.icon" :size="16"/><span class="flex-1 text-left">{{ m.label }}</span><span v-if="countFor(m.id)" class="text-xs tnum text-muted-foreground">{{ countFor(m.id) }}</span></button>
              <!-- section: always open, header only -->
              <template v-else-if="m.mode==='section'">
                <p class="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ m.label }}</p>
                <button v-for="it in visLeaves(m)" :key="it.id" type="button" @click="go(it.route)" :class="['flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm', G.navRoute===it.route ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']"><Icon :name="it.icon" :size="16"/><span class="flex-1 text-left">{{ it.label }}</span></button>
              </template>
              <!-- dropdown / panel trigger -->
              <template v-else>
                <button type="button" @click="toggle(m)" :aria-expanded="m.mode==='dropdown' ? NAV.open===m.id : undefined"
                  :class="['flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm', active(m) ? 'font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground', active(m) && m.mode==='panel' ? 'bg-accent' : '']">
                  <Icon :name="m.icon" :size="16"/><span class="flex-1 text-left">{{ m.label }}</span>
                  <Icon v-if="m.mode==='dropdown'" name="ChevronDown" :size="15" :class="['text-muted-foreground', animOf(m)==='none' ? '' : 'transition-transform duration-200', NAV.open===m.id ? 'rotate-180' : '']"/>
                  <Icon v-else name="ChevronRight" :size="15" class="text-muted-foreground"/></button>
                <Transition v-if="m.mode==='dropdown'" :css="animOf(m)==='fade'" name="nav-dd-fade" @enter="(el, done) => ddEnter(m, el, done)" @leave="(el, done) => ddLeave(m, el, done)">
                  <div v-if="NAV.open===m.id" class="ml-[18px] border-l pl-2" :class="animOf(m)==='stagger' ? 'dd-stagger' : ''">
                    <button v-for="(it, i) in visLeaves(m)" :key="it.id" type="button" @click="go(it.route)" :class="['nav-sub mt-0.5 flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm', G.navRoute===it.route ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']" :style="{ animationDelay: (i*40) + 'ms' }">
                      <Icon :name="it.icon" :size="15"/><span class="flex-1 text-left">{{ it.label }}</span><span v-if="countFor(it.id)" class="text-xs tnum text-muted-foreground">{{ countFor(it.id) }}</span></button>
                  </div>
                </Transition>
              </template>
            </template>
            <p class="mt-5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</p>
            <button v-for="f in FORMS.slice(0,3)" :key="f.id" type="button" @click="openForm(f)" class="flex h-8 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <span class="form-theme h-2 w-2 shrink-0 rounded-full bg-fa" :style="{ '--fa-l': ACCENTS[f.accent].l, '--fa-d': ACCENTS[f.accent].d }"></span><span class="truncate">{{ f.title }}</span></button>
          </div>
        </Transition>
      </div>

      <div :class="collapsed ? 'mt-auto' : 'mt-1 border-t pt-1'">
        <Tooltip v-if="collapsed" content="Help and guides" side="right" class="w-full"><button type="button" class="grid h-9 w-full place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Help"><Icon name="LifeBuoy" :size="18"/></button></Tooltip>
        <button v-else type="button" class="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><Icon name="LifeBuoy" :size="16"/>Help and guides</button>
        <Tooltip v-if="collapsed" content="Design system" side="right" class="w-full"><button type="button" @click="go('design')" :class="['grid h-9 w-full place-items-center rounded-md', G.route==='design' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent']" aria-label="Design system"><Icon name="Palette" :size="18"/></button></Tooltip>
        <button v-else type="button" @click="go('design')" :class="['flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm', G.route==='design' ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground']"><Icon name="Palette" :size="16"/>Design system</button>
      </div></div>`
  };

  /* ---------- Menu Management: information rows (draggable tree) + gear popup to configure (D16) */
  const ICON_CHOICES = ['ClipboardList', 'LayoutTemplate', 'ShieldCheck', 'Users', 'Shield', 'KeyRound', 'MapPin', 'Globe', 'Smartphone', 'ChartColumn', 'Server', 'History', 'ListOrdered', 'CalendarClock', 'Bell', 'Settings2', 'Megaphone', 'FolderOpen', 'SlidersHorizontal', 'Settings', 'ListTree', 'Truck', 'Store', 'Wallet', 'Package', 'FileText', 'Building2', 'Tractor'];
  const MENU_DRAG = reactive({ key: null, armed: null });
  function locateItem(id) {
    for (let i = 0; i < MENU.length; i++) {
      if (MENU[i].id === id) return { top: true, i, item: MENU[i] };
      const m = MENU[i]; if (!m.groups) continue;
      for (const g of m.groups) { const j = g.items.findIndex(x => x.id === id); if (j > -1) return { top: false, parent: m, group: g, j, item: g.items[j] }; }
    }
    return null;
  }
  function moveChildTo(id, parentId, groupLabel, index) {
    const from = locateItem(id); if (!from) return;
    const item = from.top ? MENU.splice(from.i, 1)[0] : from.group.items.splice(from.j, 1)[0];
    if (!from.top && !from.group.items.length) from.parent.groups.splice(from.parent.groups.indexOf(from.group), 1);
    if (!parentId) { delete item._group; MENU.splice(index == null ? MENU.length : index, 0, item); if (item.visible == null) item.visible = true; return; }
    const p = MENU.find(m => m.id === parentId);
    let g = p.groups.find(x => x.label === (groupLabel || '')); if (!g) { g = { label: groupLabel || '', items: [] }; p.groups.push(g); }
    g.items.splice(index == null ? g.items.length : index, 0, item);
  }
  const MenusPage = {
    setup() {
      const C = reactive({ subject: '', collapsed: {}, edit: null, draft: null, newGroup: '' });
      const subjectOpts = computed(() => [{ value: '', label: 'Nobody (just show settings)' }, { group: 'Roles' }, ...ROLES.map(r => ({ value: 'role:' + r.id, label: r.name, icon: 'Shield' })), { group: 'Users' }, ...MEMBERS.map(m => ({ value: 'user:' + m.email + m.phone, label: m.name + ' · ' + m.role, icon: 'UserRound' }))]);
      const subject = computed(() => { if (!C.subject) return null; const [kind, ...rest] = C.subject.split(':'); const id = rest.join(':'); return { kind, id, name: kind === 'role' ? roleById(id).name : (MEMBERS.find(m => m.email + m.phone === id) || {}).name }; });
      const sp = computed(() => permsOfSubject(subject.value));
      const flat = (m) => m.groups ? m.groups.flatMap(g => g.items.map(it => ({ it, group: g.label }))) : [];
      const typeText = (m) => m.groups ? MODES[m.mode].label + (m.mode === 'section' ? '' : ' · ' + ANIMS[animOf(m)]) : 'Link';
      const rolesWith = (perm) => holdersOf(perm).map(r => r.name);
      const childPerms = (m) => leaves(m).map(l => l.perm);
      const rolesSeeingParent = (m) => ROLES.filter(r => menuVisibleFor(m, r.perms)).map(r => r.name);
      /* drag & drop: top-level among top-level, children among children (any parent) */
      function dStart(e, id) { MENU_DRAG.key = id; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', id); } catch (_) {} }
      function dOverTop(e, targetId) {
        const src = locateItem(MENU_DRAG.key); if (!src) return; e.preventDefault();
        const tgt = locateItem(targetId);
        if (src.top) { if (src.item.id === targetId) return; const r = e.currentTarget.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2; const from = src.i; let to = tgt.i + (after ? 1 : 0); if (from < to) to--; if (to === from) return; MENU.splice(to, 0, MENU.splice(from, 1)[0]); }
        else if (tgt.item.groups && src.parent !== tgt.item) { const g = tgt.item.groups[tgt.item.groups.length - 1]; moveChildTo(src.item.id, tgt.item.id, g.label, g.items.length); C.collapsed[tgt.item.id] = false; }
      }
      function dOverChild(e, targetId) {
        const src = locateItem(MENU_DRAG.key); if (!src || src.top || src.item.id === targetId) return; e.preventDefault(); e.stopPropagation();
        const tgt = locateItem(targetId); const r = e.currentTarget.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2;
        let idx = tgt.j + (after ? 1 : 0); if (src.group === tgt.group && src.j < idx) idx--;
        if (src.group === tgt.group && src.j === idx) return;
        moveChildTo(src.item.id, tgt.parent.id, tgt.group.label, idx);
      }
      function dEnd() { if (MENU_DRAG.key) G.toast('Menu order saved', 'The sidebar uses the new order.', 'GripVertical'); MENU_DRAG.key = null; MENU_DRAG.armed = null; }
      /* gear popup: edit a draft, apply on save */
      function openEdit(item) {
        const loc = locateItem(item.id);
        C.newGroup = ''; C.edit = item.id;
        C.draft = { label: item.label, icon: item.icon, perm: item.perm || '', visible: item.visible !== false, mode: item.mode || 'dropdown', anim: item.anim || 'default',
          parent: loc.top ? '' : loc.parent.id, group: loc.top ? '' : loc.group.label, isParent: !!item.groups, route: item.route, index: loc.top ? loc.i : loc.j };
      }
      const editItem = computed(() => C.edit && locateItem(C.edit));
      const parentOpts = computed(() => [{ value: '', label: 'Top level (no parent)' }, ...MENU.filter(m => m.groups && m.id !== C.edit).map(m => ({ value: m.id, label: m.label, icon: m.icon }))]);
      const groupOpts = computed(() => { const p = MENU.find(m => m.id === C.draft.parent); if (!p) return []; const labels = [...new Set(p.groups.map(g => g.label))]; return [...labels.map(l => ({ value: l, label: l || 'No group heading' })), { value: '__new', label: 'New group…' }]; });
      const positionOpts = computed(() => { const list = C.draft.parent ? (MENU.find(m => m.id === C.draft.parent).groups.find(g => g.label === C.draft.group) || { items: [] }).items : MENU; const n = list.filter(x => x.id !== C.edit).length; return Array.from({ length: n + 1 }, (_, i) => ({ value: i, label: i === 0 ? 'First' : i === n ? 'Last' : 'Position ' + (i + 1) })); });
      watch(() => [C.edit, C.draft && C.draft.parent], ([e, v], [oe, o]) => {
        if (!C.draft || e !== oe) return; // a newly opened popup is not a parent change
        const opts = groupOpts.value; C.draft.group = opts.length ? opts[0].value : '';
        nextTick(() => { const po = positionOpts.value; C.draft.index = po.length ? po[po.length - 1].value : 0; });
      });
      watch(() => [C.edit, C.draft && C.draft.group], ([e, g], [oe, og]) => { if (!C.draft || e !== oe || g === og) return; nextTick(() => { const po = positionOpts.value; C.draft.index = po.length ? po[po.length - 1].value : 0; }); });
      const iconOpts = ICON_CHOICES.map(n => ({ value: n, label: n.replace(/([a-z])([A-Z0-9])/g, '$1 $2'), icon: n }));
      const permOpts = PERMS.map(p => ({ value: p.name, label: p.name }));
      const modeOpts = Object.entries(MODES).map(([v, m]) => ({ value: v, label: m.label, icon: m.icon }));
      const animOpts = computed(() => [{ value: 'default', label: 'Default (' + ANIMS[MODES[C.draft.mode].def] + ')' }, ...ANIMS_FOR[C.draft.mode].map(a => ({ value: a, label: ANIMS[a] }))]);
      const locked = computed(() => ['forms', 'config'].includes(C.edit));
      const draftErr = computed(() => { const d = C.draft; if (!d) return ''; if (d.label.trim().length < 2) return 'Give the menu a name.'; if (!d.isParent && !d.perm) return 'Pick the permission that shows this menu.'; if (d.group === '__new' && !C.newGroup.trim()) return 'Name the new group or pick an existing one.'; if (!d.isParent && !d.parent && !d.route) return 'This item has no page, so it needs a parent.'; return ''; });
      function save() {
        if (draftErr.value) return;
        const d = C.draft, item = editItem.value.item;
        Object.assign(item, { label: d.label.trim(), icon: d.icon, visible: d.visible });
        if (d.isParent) Object.assign(item, { mode: d.mode, anim: d.anim }); else item.perm = d.perm;
        const grp = d.group === '__new' ? C.newGroup.trim() : d.group;
        const loc = locateItem(item.id), curParent = loc.top ? '' : loc.parent.id, curGroup = loc.top ? '' : loc.group.label, curIdx = loc.top ? loc.i : loc.j;
        if (!d.isParent && (d.parent !== curParent || grp !== curGroup || d.index !== curIdx)) moveChildTo(item.id, d.parent, grp, Math.min(d.index, 9999));
        else if (d.isParent && d.index !== curIdx) { MENU.splice(Math.min(d.index, MENU.length - 1), 0, MENU.splice(curIdx, 1)[0]); }
        G.toast('Menu saved', item.label + ' is updated in the sidebar.', 'Settings'); C.edit = null;
      }
      function grantFromPopup() { const it = editItem.value.item; const miss = (it.groups ? leaves(it).map(l => l.perm) : [C.draft.perm]).filter(p => !sp.value.includes(p)); C.edit = null; setTimeout(() => askGrant(subject.value, miss, it.label), 180); }
      const visibleTo = (m) => menuVisibleFor(m, sp.value);
      return { G, MENU, MENU_DRAG, C, subjectOpts, subject, sp, flat, typeText, rolesWith, childPerms, rolesSeeingParent, leaves, leafVisible, visibleTo, dStart, dOverTop, dOverChild, dEnd,
        openEdit, editItem, parentOpts, groupOpts, positionOpts, iconOpts, permOpts, modeOpts, animOpts, locked, draftErr, save, grantFromPopup, ANIMS, MODES, animOf, permLabel };
    },
    template: `<div class="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,1fr)] gap-3">
      <div class="flex flex-wrap items-end justify-between gap-3"><div><h2 class="text-xl font-semibold tracking-tight">Menu Management</h2><p class="text-sm text-muted-foreground">Drag rows to reorder. Use the gear to change a menu.</p></div>
        <div class="grid w-full gap-1 sm:w-72"><span class="text-xs font-medium text-muted-foreground">Check access for</span><Select v-model="C.subject" :options="subjectOpts" align="end"/></div></div>

      <div class="kpi flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
        <span class="flex items-center gap-1.5 font-medium text-foreground"><Icon name="Info" :size="14" class="text-primary"/>How access works</span>
        <span class="flex items-center gap-1.5"><Icon name="KeyRound" :size="13"/>Each child needs one permission</span>
        <span class="flex items-center gap-1.5"><Icon name="GitMerge" :size="13"/>A parent shows if <b class="text-foreground">any</b> child shows</span>
        <span class="flex items-center gap-1.5"><Icon name="EyeOff" :size="13"/>No visible children = parent hidden</span>
      </div>
      <div v-if="subject" class="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
        <Icon :name="subject.kind==='role' ? 'Shield' : 'UserRound'" class="text-primary"/><span class="min-w-0 flex-1"><b>{{ subject.name }}</b> sees <span class="tnum">{{ MENU.filter(visibleTo).length }} of {{ MENU.length }}</span> top-level menus. Open a menu's gear to grant what's missing.</span>
        <Button size="sm" variant="ghost" @click="C.subject=''"><Icon name="X" :size="14"/>Stop checking</Button></div>

      <!-- information tree -->
      <div class="kpi overflow-hidden rounded-xl border bg-card shadow-sm" style="animation-delay:60ms">
        <div class="hidden grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_5rem_2.25rem] items-center gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid"><span></span><span>Menu</span><span>Opens as</span><span>Who sees it</span><span>Status</span><span></span></div>
        <TransitionGroup name="q" tag="ul" class="divide-y">
          <li v-for="m in MENU" :key="m.id" :class="MENU_DRAG.key===m.id && 'drag-ghost'">
            <!-- top-level row -->
            <div :draggable="MENU_DRAG.armed===m.id" @dragstart="dStart($event, m.id)" @dragover="dOverTop($event, m.id)" @dragend="dEnd"
              class="grid grid-cols-[1.5rem_minmax(0,1fr)_2.25rem] items-center gap-x-3 gap-y-1 px-3 py-2.5 md:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_5rem_2.25rem]">
              <span class="grid h-7 w-6 cursor-grab place-items-center rounded text-muted-foreground/70 hover:bg-accent hover:text-foreground active:cursor-grabbing" @pointerdown="MENU_DRAG.armed=m.id" @pointerup="MENU_DRAG.armed=null" title="Drag to reorder" aria-label="Drag to reorder"><Icon name="GripVertical" :size="15"/></span>
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Icon :name="m.icon" :size="16"/></span>
                <div class="min-w-0"><p class="flex items-center gap-1.5 text-sm font-medium"><span class="truncate">{{ m.label }}</span>
                  <button v-if="m.groups" type="button" @click="C.collapsed[m.id]=!C.collapsed[m.id]" class="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent" :aria-label="(C.collapsed[m.id] ? 'Show' : 'Hide') + ' children of ' + m.label"><Icon name="ChevronDown" :size="13" :class="['transition-transform', C.collapsed[m.id] && '-rotate-90']"/></button></p>
                  <p class="truncate text-xs text-muted-foreground"><template v-if="m.groups">{{ leaves(m).length }} children · shown if any is</template><template v-else><code class="font-mono">{{ m.perm }}</code></template></p></div>
              </div>
              <p class="col-start-2 text-xs text-muted-foreground md:col-start-auto md:text-sm"><span class="md:hidden">Opens as: </span>{{ typeText(m) }}</p>
              <p class="col-start-2 truncate text-xs text-muted-foreground md:col-start-auto md:text-sm" :title="(m.groups ? rolesSeeingParent(m) : rolesWith(m.perm)).join(', ')"><span class="md:hidden">Who: </span>{{ (m.groups ? rolesSeeingParent(m) : rolesWith(m.perm)).join(', ') || 'Nobody' }}</p>
              <div class="col-start-2 flex flex-wrap gap-1 md:col-start-auto">
                <span v-if="m.visible===false" class="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"><Icon name="EyeOff" :size="11"/>Off</span>
                <template v-else-if="subject"><span v-if="visibleTo(m)" class="inline-flex items-center gap-1 rounded-full bg-c1/15 px-1.5 py-0.5 text-[11px] font-medium"><Icon name="Eye" :size="11"/>Sees</span><span v-else class="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"><Icon name="Lock" :size="11"/>Hidden</span></template>
                <span v-else class="inline-flex items-center gap-1 rounded-full bg-c1/15 px-1.5 py-0.5 text-[11px] font-medium"><Icon name="Eye" :size="11"/>On</span>
              </div>
              <Button variant="ghost" size="icon-sm" class="col-start-3 row-start-1 md:col-start-auto md:row-start-auto" @click="openEdit(m)" :aria-label="'Configure ' + m.label"><Icon name="Settings" :size="16"/></Button>
            </div>
            <!-- children -->
            <TransitionGroup v-if="m.groups && !C.collapsed[m.id]" name="q" tag="ul" class="pb-1.5">
              <template v-for="(c, ci) in flat(m)" :key="c.it.id">
                <li v-if="c.group && (ci===0 || flat(m)[ci-1].group!==c.group)" :key="'g-' + m.id + c.group" class="pl-[4.6rem] pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ c.group }}</li>
                <li :key="c.it.id" :draggable="MENU_DRAG.armed===c.it.id" @dragstart.stop="dStart($event, c.it.id)" @dragover="dOverChild($event, c.it.id)" @dragend="dEnd" :class="['relative grid grid-cols-[1.5rem_minmax(0,1fr)_2.25rem] items-center gap-x-3 gap-y-1 py-1.5 pl-9 pr-3 md:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_5rem_2.25rem]', MENU_DRAG.key===c.it.id && 'drag-ghost']">
                  <span class="absolute left-[1.55rem] top-0 h-full w-px bg-border" :class="ci===flat(m).length-1 && '!h-1/2'"></span><span class="absolute left-[1.55rem] top-1/2 h-px w-3 bg-border"></span>
                  <span class="grid h-7 w-6 cursor-grab place-items-center rounded text-muted-foreground/70 hover:bg-accent hover:text-foreground active:cursor-grabbing" @pointerdown="MENU_DRAG.armed=c.it.id" @pointerup="MENU_DRAG.armed=null" aria-label="Drag to reorder"><Icon name="GripVertical" :size="14"/></span>
                  <div class="flex min-w-0 items-center gap-2.5"><Icon :name="c.it.icon" :size="15" class="shrink-0 text-muted-foreground"/>
                    <div class="min-w-0"><p class="truncate text-sm">{{ c.it.label }}</p><p class="truncate font-mono text-[11px] text-muted-foreground">{{ c.it.perm }}</p></div></div>
                  <p class="col-start-2 text-xs text-muted-foreground md:col-start-auto md:text-sm">Page<span v-if="c.group"> · {{ c.group }}</span></p>
                  <p class="col-start-2 truncate text-xs text-muted-foreground md:col-start-auto md:text-sm" :title="rolesWith(c.it.perm).join(', ')"><span class="md:hidden">Who: </span>{{ rolesWith(c.it.perm).join(', ') || 'Nobody' }}</p>
                  <div class="col-start-2 md:col-start-auto"><template v-if="subject"><span v-if="leafVisible(c.it, sp)" class="inline-flex items-center gap-1 rounded-full bg-c1/15 px-1.5 py-0.5 text-[11px] font-medium"><Icon name="Eye" :size="11"/>Sees</span><span v-else class="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"><Icon name="Lock" :size="11"/>Hidden</span></template></div>
                  <Button variant="ghost" size="icon-sm" class="col-start-3 row-start-1 md:col-start-auto md:row-start-auto" @click="openEdit(c.it)" :aria-label="'Configure ' + c.it.label"><Icon name="Settings" :size="15"/></Button>
                </li>
              </template>
            </TransitionGroup>
          </li>
        </TransitionGroup>
      </div>
      <p class="text-xs text-muted-foreground">Drag a child onto another parent to move it there. On phones, use the gear to change parent and position.</p>

      <!-- GEAR POPUP -->
      <Dialog :open="!!C.edit" @update:open="v => { if(!v) C.edit = null }">
        <template v-if="C.draft && editItem">
          <div class="flex items-center gap-3 pr-6"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="C.draft.icon" :size="18"/></span>
            <div class="min-w-0"><h2 class="truncate text-lg font-semibold leading-tight">Configure {{ editItem.item.label }}</h2><p class="text-xs text-muted-foreground">{{ C.draft.isParent ? 'Parent menu' : editItem.top ? 'Top-level link' : 'Child of ' + editItem.parent.label }}</p></div></div>
          <div class="grid gap-4">
            <section class="grid gap-3"><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basics</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="grid gap-1.5"><label for="mc-l" class="text-sm font-medium">Name</label><Input id="mc-l" v-model="C.draft.label"/></div>
                <div class="grid gap-1.5"><span class="text-sm font-medium">Icon</span><Select v-model="C.draft.icon" :options="iconOpts"/></div></div>
              <label class="flex items-center justify-between gap-3 rounded-lg border p-3"><span><span class="block text-sm font-medium">Show in sidebar</span><span class="block text-xs text-muted-foreground">{{ locked ? "Can't be hidden, so nobody locks themselves out." : 'Off hides it from everyone, whatever their permissions.' }}</span></span><Switch v-model="C.draft.visible" :disabled="locked"/></label>
            </section>
            <section class="grid gap-3"><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placement</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="grid gap-1.5"><span class="text-sm font-medium">Parent</span><Select v-model="C.draft.parent" :options="parentOpts" :disabled="C.draft.isParent"/>
                  <p v-if="C.draft.isParent" class="text-xs text-muted-foreground">Parents stay at the top level.</p></div>
                <div class="grid gap-1.5"><span class="text-sm font-medium">Position</span><Select v-model="C.draft.index" :options="positionOpts"/></div>
                <div v-if="C.draft.parent" class="grid gap-1.5 sm:col-span-2"><span class="text-sm font-medium">Group heading</span><Select v-model="C.draft.group" :options="groupOpts"/>
                  <Input v-if="C.draft.group==='__new'" v-model="C.newGroup" placeholder="e.g. Monitoring"/><p class="text-xs text-muted-foreground">Headings show inside panels, like Monitoring under System.</p></div>
              </div>
            </section>
            <section v-if="C.draft.isParent" class="grid gap-3"><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Behaviour</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="grid gap-1.5"><span class="text-sm font-medium">Opens as</span><Select v-model="C.draft.mode" :options="modeOpts"/></div>
                <div class="grid gap-1.5"><span class="text-sm font-medium">Animation</span><Select v-model="C.draft.anim" :options="animOpts" :disabled="C.draft.mode==='section'"/></div></div>
              <p class="text-xs text-muted-foreground">{{ C.draft.mode==='dropdown' ? 'Opens in place. One dropdown open at a time.' : C.draft.mode==='panel' ? 'The sidebar slides to a sub-page with Back and search.' : 'A heading with its items always showing.' }}</p>
            </section>
            <section class="grid gap-3"><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Access</p>
              <template v-if="C.draft.isParent">
                <p class="text-sm text-muted-foreground">Shown when the user can see <b class="text-foreground">any</b> of these children:</p>
                <ul class="flex flex-wrap gap-1.5"><li v-for="l in leaves(editItem.item)" :key="l.id" class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"><Icon :name="l.icon" :size="12"/>{{ l.label }} <code class="font-mono text-[10px] text-muted-foreground">{{ l.perm }}</code></li></ul>
              </template>
              <div v-else class="grid gap-1.5"><span class="text-sm font-medium">Required permission</span><Select v-model="C.draft.perm" :options="permOpts"/>
                <p class="text-xs text-muted-foreground">{{ permLabel(C.draft.perm) }} · held by {{ rolesWith(C.draft.perm).join(', ') || 'no role yet' }}</p></div>
              <div v-if="subject" class="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm">
                <Icon :name="(C.draft.isParent ? visibleTo(editItem.item) : sp.includes(C.draft.perm)) ? 'Eye' : 'Lock'" :size="15" :class="(C.draft.isParent ? visibleTo(editItem.item) : sp.includes(C.draft.perm)) ? 'text-c1' : 'text-muted-foreground'"/>
                <span class="min-w-0 flex-1">{{ subject.name }} {{ (C.draft.isParent ? visibleTo(editItem.item) : sp.includes(C.draft.perm)) ? 'can see this.' : "can't see this." }}</span>
                <Button v-if="C.draft.isParent ? leaves(editItem.item).some(l => !sp.includes(l.perm)) : !sp.includes(C.draft.perm)" size="sm" variant="outline" @click="grantFromPopup"><Icon name="KeyRound" :size="13"/>Grant access</Button></div>
            </section>
          </div>
          <p v-if="draftErr" class="flex items-center gap-1.5 text-sm text-destructive"><Icon name="CircleAlert" :size="14"/>{{ draftErr }}</p>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="C.edit=null">Cancel</Button><Button :disabled="!!draftErr" @click="save"><Icon name="Check" :size="14"/>Save changes</Button></div>
        </template>
      </Dialog>
    </div>`
  };

  /* ---------- Grant popup: role first, user as exception */
  const GrantDialog = {
    setup() {
      const member = computed(() => GRANT.subject && GRANT.subject.kind === 'user' ? MEMBERS.find(m => m.email + m.phone === GRANT.subject.id) : null);
      const role = computed(() => GRANT.subject ? (GRANT.subject.kind === 'role' ? roleById(GRANT.subject.id) : roleById(member.value && member.value.role)) : null);
      const roleCount = computed(() => role.value ? MEMBERS.filter(m => m.role === role.value.id).length : 0);
      function toggle(pn) { const i = GRANT.picked.indexOf(pn); i > -1 ? GRANT.picked.splice(i, 1) : GRANT.picked.push(pn); }
      function confirm() {
        if (!GRANT.picked.length) return;
        if (GRANT.target === 'role' && role.value && !role.value.locked) { GRANT.picked.forEach(pn => { if (!role.value.perms.includes(pn)) role.value.perms.push(pn); }); G.toast(`Added to ${role.value.name}`, `${GRANT.picked.length} permission${GRANT.picked.length > 1 ? 's' : ''}. ${roleCount.value} ${roleCount.value === 1 ? 'person' : 'people'} with this role now see it.`, 'Shield'); }
        else if (member.value) { const k = member.value.email + member.value.phone; DIRECT[k] = [...new Set([...(DIRECT[k] || []), ...GRANT.picked])]; G.toast(`Given to ${member.value.name} only`, 'Shown as a direct permission on their profile.', 'UserRound'); }
        GRANT.open = false;
      }
      const ownerLocked = computed(() => role.value && role.value.locked);
      return { GRANT, member, role, roleCount, toggle, confirm, permLabel, holdersOf, ownerLocked };
    },
    template: `<Dialog :open="GRANT.open" @update:open="v => GRANT.open = v">
      <div v-if="GRANT.subject" class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Give access to {{ GRANT.title }}</h2>
        <p class="text-sm text-muted-foreground">{{ GRANT.subject.name }} is missing {{ GRANT.perms.length===1 ? 'this permission' : 'these permissions' }}. A parent menu appears as soon as any child is allowed.</p></div>
      <ul class="grid gap-1.5">
        <li v-for="pn in GRANT.perms" :key="pn"><label class="flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 hover:bg-muted/50">
          <Checkbox :model-value="GRANT.picked.includes(pn)" @update:model-value="toggle(pn)" class="mt-0.5"/>
          <span class="min-w-0 flex-1"><span class="block text-sm font-medium">{{ permLabel(pn) }}</span><span class="block font-mono text-xs text-muted-foreground">{{ pn }}</span>
            <span class="mt-1 block text-[11px] text-muted-foreground">Already in: {{ holdersOf(pn).map(r=>r.name).join(', ') || 'no role' }}</span></span></label></li>
      </ul>
      <div class="grid gap-2" role="radiogroup" aria-label="Where to add it">
        <p class="text-sm font-medium">Where to add {{ GRANT.picked.length===1 ? 'it' : 'them' }}</p>
        <label :class="['flex cursor-pointer items-start gap-3 rounded-lg border p-3', GRANT.target==='role' ? 'border-primary bg-primary/5 ring-1 ring-primary' : '', ownerLocked && 'opacity-50']">
          <RadioGroupItem :checked="GRANT.target==='role'" :disabled="ownerLocked" @select="GRANT.target='role'" class="mt-0.5"/>
          <span class="min-w-0"><span class="flex items-center gap-2 text-sm font-medium">Add to the {{ role && role.name }} role<Badge variant="secondary">Recommended</Badge></span>
            <span class="mt-0.5 block text-xs text-muted-foreground">Everyone with this role gets it ({{ roleCount }} {{ roleCount===1 ? 'person' : 'people' }}). Easier to audit.</span></span></label>
        <label v-if="member" :class="['flex cursor-pointer items-start gap-3 rounded-lg border p-3', GRANT.target==='user' ? 'border-warning bg-warning/5 ring-1 ring-warning' : '']">
          <RadioGroupItem :checked="GRANT.target==='user'" @select="GRANT.target='user'" class="mt-0.5"/>
          <span class="min-w-0 flex-1"><span class="block text-sm font-medium">Give only {{ member.name }}</span>
            <span class="mt-0.5 block text-xs text-muted-foreground">An exception. It stays with them even if their role changes.</span>
            <Input v-if="GRANT.target==='user'" v-model="GRANT.reason" class="mt-2" placeholder="Reason, e.g. covering for Neema until 31 Oct"/></span></label>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="GRANT.open=false">Cancel</Button>
        <Button :disabled="!GRANT.picked.length || (GRANT.target==='role' && ownerLocked)" @click="confirm"><Icon name="KeyRound" :size="14"/>Grant {{ GRANT.picked.length }} permission{{ GRANT.picked.length===1 ? '' : 's' }}</Button></div>
    </Dialog>`
  };

  /* ---------- Roles: list page + details page (D39). Main roles = one per person org-wide; custom roles are given at a location and add to the main role (D21). */
  function openRole(id, tab) { G.roleId = id; nav('role', tab); }
  G.roleId = 'editor';
  /* who holds a role: main roles from users, custom roles from location assignments (one row per person, with their locations) */
  function roleHolders(id) {
    const r = roleById(id); if (!r) return [];
    if (r.system) return MEMBERS.filter(m => m.role === id && m.email !== PREVIEW_EMAIL).map(m => ({ key: m.email + m.phone, m, locs: [] }));
    const by = new Map();
    assignsOf().filter(a => a.email !== PREVIEW_EMAIL && a.roles.includes(id)).forEach(a => { const m = memberByEmail(a.email); if (!m) return; const k = m.email + m.phone; if (!by.has(k)) by.set(k, { key: k, m, locs: [] }); by.get(k).locs.push(a.loc); });
    return [...by.values()];
  }
  const roleIcon = (r) => r.locked ? 'Crown' : r.system ? 'Shield' : 'ShieldPlus';
  const menusFor = (r) => MENU.filter(m => menuVisibleFor(m, r.perms)).length;
  const canEditRole = () => canManage() && myPerms.value.includes('Roles.manage');
  const NEWROLE = reactive({ open: false, name: '', desc: '', from: '' });

  const NewRoleDialog = {
    setup() {
      const fromOpts = computed(() => [{ value: '', label: 'Start empty (only "See forms")' }, ...ROLES.filter(r => !r.locked).map(r => ({ value: r.id, label: r.name + ' · ' + r.perms.length + ' permissions', icon: roleIcon(r) }))]);
      const taken = computed(() => ROLES.some(r => r.name.toLowerCase() === NEWROLE.name.trim().toLowerCase()));
      function create() {
        const id = ulid('r'); const src = roleById(NEWROLE.from);
        ROLES.push({ id, name: NEWROLE.name.trim(), desc: NEWROLE.desc.trim() || 'Custom role.', system: false, perms: src ? [...src.perms] : ['Forms.list'], createdAt: 'Today', createdBy: ME.name, updatedAt: 'Today', updatedBy: ME.name });
        NEWROLE.open = false; G.toast('Role created', src ? 'Copied ' + src.perms.length + ' permissions from ' + src.name + '.' : 'Starts with "See forms". Add what it needs.', 'ShieldPlus');
        openRole(id, 'perms');
      }
      return { NEWROLE, fromOpts, taken, create };
    },
    template: `<Dialog :open="NEWROLE.open" @update:open="v => NEWROLE.open = v">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">New custom role</h2><p class="text-sm text-muted-foreground">Custom roles are given to people at a location, on top of their main role.</p></div>
      <div class="grid gap-3">
        <div class="grid gap-1.5"><label for="nr-name" class="text-sm font-medium">Role name <span class="text-destructive">*</span></label><Input id="nr-name" v-model="NEWROLE.name" placeholder="Regional manager" :aria-invalid="taken"/><p v-if="taken" class="text-xs text-destructive">A role with this name already exists.</p></div>
        <div class="grid gap-1.5"><label for="nr-desc" class="text-sm font-medium">Description</label><Textarea id="nr-desc" v-model="NEWROLE.desc" rows="2" placeholder="Who gets it and what it is for"/></div>
        <div class="grid gap-1.5"><span class="text-sm font-medium">Start from</span><Select v-model="NEWROLE.from" :options="fromOpts" aria-label="Start from"/><p class="text-xs text-muted-foreground">Copies the permissions once. Later changes to that role don't flow here.</p></div>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="NEWROLE.open=false">Cancel</Button><Button :disabled="NEWROLE.name.trim().length < 2 || taken" @click="create"><Icon name="ShieldPlus" :size="14"/>Create role</Button></div>
    </Dialog>`
  };
  function newRole() { if (G.viewAs) return readOnly(); Object.assign(NEWROLE, { open: true, name: '', desc: '', from: '' }); }

  const RolesPage = {
    setup() {
      const LS = useList({ noun: 'roles', rows: () => ROLES, search: (r, q) => (r.name + ' ' + r.desc).toLowerCase().includes(q), sort: 'rank',
        sorts: [{ value: 'rank', label: 'Default order', get: r => ROLES.indexOf(r) }, { value: 'name', label: 'Name', get: r => r.name.toLowerCase() }, { value: 'perms', label: 'Permissions', get: r => r.perms.length }, { value: 'people', label: 'People', get: r => roleHolders(r.id).length }],
        fields: () => [
          { key: 'type', label: 'Type', type: 'select', options: [{ value: 'main', label: 'Main role' }, { value: 'custom', label: 'Custom (location) role' }], get: r => r.system ? 'main' : 'custom' },
          { key: 'people', label: 'People', type: 'number', get: r => roleHolders(r.id).length },
          { key: 'perms', label: 'Permissions', type: 'number', get: r => r.perms.length },
        ] });
      const typeTabs = computed(() => [{ value: 'all', label: 'All', count: ROLES.length }, { value: 'main', label: 'Main', count: ROLES.filter(r => r.system).length }, { value: 'custom', label: 'Custom', count: ROLES.filter(r => !r.system).length }]);
      const quick = computed({ get: () => { const f = LS.S.filters.type; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('type', v === 'all' ? null : { op: 'in', value: [v] }) });
      watchEffect(() => { if (G.view === 'roles') listCount.value = (G.search || '').trim().length >= 2 ? LS.rows.value.length : null; });
      const kpi = computed(() => { const custom = ROLES.filter(r => !r.system); const holders = new Set(); custom.forEach(r => roleHolders(r.id).forEach(h => holders.add(h.key))); return { total: ROLES.length, custom: custom.length, people: MEMBERS.filter(m => m.email !== PREVIEW_EMAIL).length, located: holders.size, direct: Object.values(DIRECT).filter(a => a.length).length, perms: PERMS.length }; });
      const menu = (r) => [{ id: 'open', label: 'Open', icon: 'ArrowUpRight' }, { id: 'perms', label: 'Permissions', icon: 'KeyRound' }, { id: 'people', label: 'People', icon: 'Users' },
        ...(canViewAs() && !r.locked ? [{ id: 'preview', label: 'Preview this role', icon: 'ScanEye' }] : []),
        ...(canEditRole() ? [{ separator: true }, { id: 'dup', label: 'Duplicate', icon: 'Copy' }] : [])];
      function onMenu(r, it) {
        if (['open', 'perms', 'people'].includes(it.id)) openRole(r.id, it.id === 'open' ? null : it.id);
        if (it.id === 'preview') G.viewAsPick = { role: r.id };
        if (it.id === 'dup') duplicateRole(r);
      }
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });   // P39: search, sort and filters live in the link
      return { G, LS, typeTabs, quick, kpi, menu, onMenu, openRole, roleHolders, roleIcon, menusFor, PERMS, MENU, canEditRole, newRole, initials };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Roles</h2><p class="text-sm text-muted-foreground">Bundles of permissions. Everyone has one main role; custom roles are given at a location and add to it.</p></div>
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Roles</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Shield" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.total }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ kpi.total - kpi.custom }} main · {{ kpi.custom }} custom</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">People</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Users" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.people }}</p><p class="mt-1 text-[11px] text-muted-foreground">Each holds one main role</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">With a custom role</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="MapPin" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.located }}</p><p class="mt-1 text-[11px] text-muted-foreground">Given at one or more locations</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Direct grants</p><span class="grid h-6 w-6 place-items-center rounded-md bg-warning/15 text-warning"><Icon name="UserRound" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.direct }}</p><p class="mt-1 text-[11px] text-muted-foreground">People with exceptions outside a role</p></div>
      </div>
      <ListCard :list="LS" :tabs="typeTabs" v-model:quick="quick">
        <template #actions><Button v-if="canEditRole()" size="sm" @click="newRole"><Icon name="Plus" :size="15"/>New<span class="hidden sm:inline"> role</span></Button></template>
        <div v-if="LS.rows.value.length" style="animation-delay:120ms">
          <div class="hidden overflow-x-auto sm:block"><table class="w-full min-w-[760px] text-sm">
            <thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Role</th><th class="px-3 py-2.5 font-medium">Type</th><th class="w-56 px-3 py-2.5 font-medium">Permissions</th><th class="px-3 py-2.5 text-right font-medium">Menus</th><th class="px-3 py-2.5 font-medium">People</th><th class="w-10"></th></tr></thead>
            <tbody><tr v-for="r in LS.rows.value" :key="r.id" class="cursor-pointer border-b last:border-0 hover:bg-muted/50" @click="openRole(r.id)">
              <td class="py-2.5 pl-4 pr-3"><div class="flex items-center gap-2.5"><span :class="['grid h-8 w-8 shrink-0 place-items-center rounded-md', r.locked ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary']"><Icon :name="roleIcon(r)" :size="15"/></span>
                <div class="min-w-0"><p class="flex items-center gap-1.5 truncate font-medium">{{ r.name }}<Icon v-if="r.locked" name="Lock" :size="11" class="text-muted-foreground" aria-label="Locked"/></p><p class="max-w-[22rem] truncate text-xs text-muted-foreground">{{ r.desc }}</p></div></div></td>
              <td class="px-3 py-2.5"><Badge :variant="r.system ? 'secondary' : 'outline'">{{ r.system ? 'Main' : 'Custom' }}</Badge></td>
              <td class="px-3 py-2.5"><div class="flex items-center gap-2"><div class="h-1.5 flex-1 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full rounded-full bg-c1 transition-[width] duration-500" :style="{ width: (r.perms.length / PERMS.length * 100) + '%' }"></div></div><span class="w-12 shrink-0 text-right text-xs tnum text-muted-foreground">{{ r.perms.length }}/{{ PERMS.length }}</span></div></td>
              <td class="px-3 py-2.5 text-right tnum">{{ menusFor(r) }}<span class="text-muted-foreground">/{{ MENU.length }}</span></td>
              <td class="px-3 py-2.5"><div v-if="roleHolders(r.id).length" class="flex items-center"><span v-for="h in roleHolders(r.id).slice(0, 3)" :key="h.key" class="-ml-1.5 grid h-6 w-6 place-items-center rounded-full bg-muted text-[9px] font-semibold uppercase ring-2 ring-card first:ml-0" :title="h.m.name">{{ initials(h.m.name) }}</span><span class="ml-1.5 text-xs tnum text-muted-foreground">{{ roleHolders(r.id).length }}</span></div><span v-else class="text-muted-foreground">–</span></td>
              <td class="px-2" @click.stop><DropdownMenu :items="menu(r)" @select="it => onMenu(r, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + r.name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></td>
            </tr></tbody></table></div>
          <ul class="divide-y sm:hidden"><li v-for="r in LS.rows.value" :key="r.id" class="relative flex items-center gap-3 py-3 pl-3 pr-2">
            <span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-md', r.locked ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary']"><Icon :name="roleIcon(r)" :size="16"/></span>
            <button type="button" class="min-w-0 flex-1 text-left after:absolute after:inset-0 after:content-['']" @click="openRole(r.id)">
              <p class="flex items-center gap-1.5 text-sm font-medium"><span class="truncate">{{ r.name }}</span><Badge :variant="r.system ? 'secondary' : 'outline'" class="shrink-0">{{ r.system ? 'Main' : 'Custom' }}</Badge></p>
              <div class="mt-1.5 h-1 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full rounded-full bg-c1" :style="{ width: (r.perms.length / PERMS.length * 100) + '%' }"></div></div>
              <p class="mt-1 text-xs tnum text-muted-foreground">{{ r.perms.length }} permissions · {{ roleHolders(r.id).length }} {{ roleHolders(r.id).length===1 ? 'person' : 'people' }}</p></button>
            <DropdownMenu class="relative z-10" :items="menu(r)" @select="it => onMenu(r, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + r.name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu>
          </li></ul>
        </div>
        <div v-else class="grid place-items-center p-10 text-center"><Icon name="ShieldOff" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">No roles match</p><p class="text-sm text-muted-foreground">Try other filters, or clear the search.</p><Button class="mt-3" variant="outline" size="sm" @click="G.search=''; LS.clearAll()">Clear search and filters</Button></div>
      </ListCard>
      <NewRoleDialog/>
    </div>`
  };

  function duplicateRole(r) {
    if (G.viewAs) return readOnly();
    let name = r.name + ' (copy)', n = 2; while (ROLES.some(x => x.name === name)) name = r.name + ' (copy ' + n++ + ')';
    const id = ulid('r'); ROLES.push({ id, name, desc: r.desc, system: false, perms: [...r.perms], createdAt: 'Today', createdBy: ME.name, updatedAt: 'Today', updatedBy: ME.name });
    G.toast('Role duplicated', name + ' is a custom role. Rename it and adjust.', 'Copy'); openRole(id);
  }

  const RolePage = {
    setup() {
      const R2 = reactive({ draft: [], leave: null, tab: G.pendingTab || 'overview', filter: 'all', q: '', loading: false, updatedAt: Date.now(), edit: false, name: '', desc: '', copy: false, from: '', del: false, shown: 6, hLoading: false });
      const role = computed(() => roleById(G.roleId));
      /* D42: ticks are staged in a draft; a save bar shows the diff and who it affects */
      const reseed = () => { R2.draft = role.value ? [...role.value.perms] : []; };
      reseed();
      watch(() => G.roleId, () => { reseed(); R2.tab = 'overview'; R2.filter = 'all'; R2.q = ''; window.scrollTo({ top: 0 }); });
      const diff = computed(() => { if (!role.value) return { add: [], remove: [] }; const saved = role.value.perms; return { add: R2.draft.filter(p => !saved.includes(p)), remove: saved.filter(p => !R2.draft.includes(p)) }; });
      const dirty = computed(() => diff.value.add.length + diff.value.remove.length > 0);
      function saveDraft() { const n = holders.value.length; role.value.perms.splice(0, role.value.perms.length, ...R2.draft); Object.assign(role.value, { updatedAt: 'Today', updatedBy: ME.name }); G.toast('Role saved', n ? 'Applies to ' + n + (n === 1 ? ' person' : ' people') + ' on their next request.' : 'Nobody holds it yet.', 'Shield'); }
      function discardDraft() { reseed(); }
      /* leaving with unsaved changes asks first (sidebar, breadcrumb, search, anything that uses nav) */
      G.leaveGuard = (route, sub) => { if (!dirty.value) return false; R2.leave = { route, sub }; return true; };
      function leaveAnyway() { const l = R2.leave; R2.leave = null; reseed(); nav(l.route, l.sub); }
      const onUnload = (e) => { if (dirty.value) { e.preventDefault(); e.returnValue = ''; } };
      onMounted(() => window.addEventListener('beforeunload', onUnload));
      onBeforeUnmount(() => { G.leaveGuard = null; window.removeEventListener('beforeunload', onUnload); });
      watch(() => G.pendingTab, (v) => { if (v) R2.tab = v; });
      watch(() => R2.tab, (t) => { G.tab = t; }, { immediate: true });   // P39: the tab is part of the link
      const ro = computed(() => !role.value || role.value.locked || !canEditRole());
      const modules = computed(() => { const out = {}; PERMS.forEach(p => (out[p.module] = out[p.module] || []).push(p)); return Object.entries(out); });
      const has = (pn) => R2.draft.includes(pn);
      function togglePerm(pn) { if (ro.value) return; const a = R2.draft, i = a.indexOf(pn); i > -1 ? a.splice(i, 1) : a.push(pn); }
      function toggleModule(list) { if (ro.value) return; const all = list.every(p => has(p.name)); list.forEach(p => { const i = R2.draft.indexOf(p.name); if (all && i > -1) R2.draft.splice(i, 1); if (!all && i < 0) R2.draft.push(p.name); }); }
      const modState = (list) => { const n = list.filter(p => has(p.name)).length; return n === 0 ? 'none' : n === list.length ? 'all' : 'some'; };
      const filtered = (list) => list.filter(p => (R2.filter === 'all' || (R2.filter === 'applied') === has(p.name)) && (!R2.q || (p.label + p.name + p.module).toLowerCase().includes(R2.q.toLowerCase())));
      const menuOf = (pn) => ALL_LEAVES.value.find(l => l.perm === pn);
      const applied = computed(() => R2.draft.length);
      function toggleLeaf(l) { togglePerm(l.perm); }
      function toggleParent(m) { if (ro.value) return; const ls = leaves(m); const all = ls.every(l => has(l.perm)); ls.forEach(l => { const i = R2.draft.indexOf(l.perm); if (all && i > -1) R2.draft.splice(i, 1); if (!all && i < 0) R2.draft.push(l.perm); }); }
      const pState = (m) => { const ls = leaves(m), n = ls.filter(l => has(l.perm)).length; return n === 0 ? 'none' : n === ls.length ? 'all' : 'some'; };
      const holders = computed(() => role.value ? roleHolders(role.value.id) : []);
      const directOf = (m) => DIRECT[m.email + m.phone] || [];
      const byModule = computed(() => modules.value.map(([mod, list], i) => { const n = list.filter(p => has(p.name)).length; return { mod, n, total: list.length, pct: Math.round(n / list.length * 100), color: 'var(--c' + ((i % 5) + 1) + ')' }; }));
      const kpi = computed(() => { const r = role.value; const locs = new Set(holders.value.flatMap(h => h.locs)); return { pct: Math.round(applied.value / PERMS.length * 100), menus: MENU.filter(m => menuVisibleFor(m, R2.draft)).length, people: holders.value.length, locs: locs.size, direct: holders.value.filter(h => directOf(h.m).length).length }; });
      const tabs = computed(() => [{ value: 'overview', label: 'Overview' }, { value: 'perms', label: 'Permissions', count: applied.value }, { value: 'menus', label: 'Menus' }, { value: 'people', label: 'People', count: holders.value.length }, { value: 'history', label: 'History' }]);
      function goModule(mod) { R2.filter = 'all'; R2.q = mod; R2.tab = 'perms'; }
      function refresh() { if (R2.loading) return; R2.loading = true; setTimeout(() => { R2.loading = false; R2.updatedAt = Date.now(); }, 700); }
      /* edit name + description (custom roles; main role names are fixed) */
      function startEdit() { if (G.viewAs) return readOnly(); Object.assign(R2, { edit: true, name: role.value.name, desc: role.value.desc }); }
      const nameTaken = computed(() => ROLES.some(r => r !== role.value && r.name.toLowerCase() === R2.name.trim().toLowerCase()));
      function saveEdit() { if (!role.value.system) role.value.name = R2.name.trim(); role.value.desc = R2.desc.trim(); role.value.updatedAt = 'Today'; role.value.updatedBy = ME.name; R2.edit = false; G.toast('Role saved', 'Change written to the activity log.', 'Shield'); }
      /* copy permissions from another role */
      const copyOpts = computed(() => ROLES.filter(r => role.value && r.id !== role.value.id).map(r => ({ value: r.id, label: r.name + ' · ' + r.perms.length + ' permissions', icon: roleIcon(r) })));
      const copyDiff = computed(() => { const src = roleById(R2.from); if (!src || !role.value) return null; return { add: src.perms.filter(p => !has(p)).length, remove: role.value.perms.filter(p => !src.perms.includes(p)).length }; });
      function doCopy() { const src = roleById(R2.from); R2.draft = [...src.perms]; R2.copy = false; R2.tab = 'perms'; G.toast('Copied, not saved yet', 'Review the changes from ' + src.name + ', then Save.', 'Copy'); }
      /* delete: custom roles only, blocked while anyone holds it */
      const deps = computed(() => { const n = holders.value.length; const out = []; if (n) out.push({ icon: 'Users', label: n + ' person' + (n > 1 ? 's hold' : ' holds') + ' it at ' + kpi.value.locs + ' location' + (kpi.value.locs > 1 ? 's' : '') }); return out; });
      function doDelete() { const i = ROLES.indexOf(role.value); const nm = role.value.name; ROLES.splice(i, 1); R2.del = false; G.toast('Role deleted', nm + ' is gone. Kept in the audit log.', 'Trash2'); nav('roles'); }
      const moreItems = computed(() => !role.value ? [] : [{ id: 'link', label: 'Copy link', icon: 'Link' },
        ...(canEditRole() && !role.value.locked ? [{ id: 'copy', label: 'Copy permissions from…', icon: 'CopyPlus' }] : []),
        ...(canEditRole() ? [{ id: 'dup', label: 'Duplicate', icon: 'Copy' }] : []),
        { id: 'hist', label: 'History', icon: 'History' },
        ...(canEditRole() && !role.value.system ? [{ separator: true }, { id: 'del', label: 'Delete role', icon: 'Trash2', destructive: true }] : [])]);
      function onMore(it) {
        if (it.id === 'link') G.toast('Link copied', PRODUCT.domain + '/' + G.org.slug + '/roles/' + role.value.id + '?tab=' + R2.tab, 'Link');
        if (it.id === 'copy') { if (G.viewAs) return readOnly(); R2.from = (ROLES.find(r => !r.locked && r.id !== role.value.id) || {}).id || ''; R2.copy = true; }
        if (it.id === 'dup') duplicateRole(role.value);
        if (it.id === 'hist') R2.tab = 'history';
        if (it.id === 'del') { if (G.viewAs) return readOnly(); R2.del = true; }
      }
      const peopleMenu = (h) => [{ id: 'user', label: role.value.system ? 'Change main role in Users' : 'Open in Users', icon: 'UserRound' },
        ...(h.locs.length ? [{ id: 'loc', label: 'Open ' + (locById(h.locs[0]) || {}).name, icon: 'MapPin' }] : []),
        ...(canViewAs() && h.m.email !== ME.email ? [{ id: 'as', label: 'View as', icon: 'Eye' }] : [])];
      function onPeople(h, it) { if (it.id === 'user') nav('members'); if (it.id === 'loc') openLoc(h.locs[0], 'users'); if (it.id === 'as') startViewAs(h.m.email, h.locs[0]); }
      const HIST = computed(() => { const n = role.value ? role.value.name : ''; return [
        { icon: 'KeyRound', who: 'Amina Juma', what: 'applied Responses.export', detail: 'Export responses', when: '6 Oct 2026, 11:02' },
        { icon: 'ListTree', who: 'Amina Juma', what: 'made Reports visible', detail: 'Ticked Reports.list in Menus', when: '6 Oct 2026, 11:01' },
        { icon: 'KeyRound', who: 'Neema Kimaro', what: 'removed Forms.delete', detail: 'Delete forms', when: '21 Sep 2026, 15:48' },
        { icon: 'ScanEye', who: 'Amina Juma', what: 'previewed the app as ' + n, detail: 'Audit: 4 minutes, read-only', when: '18 Sep 2026, 09:12' },
        { icon: 'Pencil', who: 'Neema Kimaro', what: 'changed the description', detail: '', when: '2 Aug 2026, 10:30' },
        { icon: 'Copy', who: 'Neema Kimaro', what: 'copied permissions from Viewer', detail: '5 permissions', when: '2 Aug 2026, 10:28' },
        { icon: 'CirclePlus', who: 'Amina Juma', what: 'created ' + n, detail: '', when: '12 Mar 2025, 15:30' },
      ]; });
      function moreHist() { R2.hLoading = true; setTimeout(() => { R2.shown += 6; R2.hLoading = false; }, 500); }
      return { diff, dirty, saveDraft, discardDraft, leaveAnyway, G, R2, role, ro, modules, has, togglePerm, toggleModule, modState, filtered, menuOf, applied, toggleLeaf, toggleParent, pState, holders, directOf, byModule, kpi, tabs, goModule, refresh, startEdit, nameTaken, saveEdit, copyOpts, copyDiff, doCopy, deps, doDelete, moreItems, onMore, peopleMenu, onPeople, HIST, moreHist,
        PERMS, MENU, leaves, menuVisibleFor, leafVisible, permLabel, roleIcon, canViewAs, canEditRole, initials, locById, openLoc, nav, ROLES };
    },
    template: `<div v-if="!role" class="mx-auto grid max-w-md place-items-center gap-2 py-16 text-center"><span class="grid h-12 w-12 place-items-center rounded-full bg-muted"><Icon name="ShieldOff" :size="22" class="text-muted-foreground"/></span><h2 class="text-lg font-semibold">Role not found</h2><p class="text-sm text-muted-foreground">It may have been deleted.</p><Button class="mt-2" variant="outline" @click="nav('roles')"><Icon name="ArrowLeft" :size="14"/>All roles</Button></div>
    <div v-else class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb"><button type="button" class="hover:text-foreground" @click="nav('roles')">Roles</button><Icon name="ChevronRight" :size="12"/><span class="font-medium text-foreground">{{ role.name }}</span></nav>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3"><span :class="['grid h-11 w-11 shrink-0 place-items-center rounded-lg', role.locked ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary']"><Icon :name="roleIcon(role)" :size="20"/></span>
          <div class="min-w-0"><h2 class="truncate text-xl font-semibold tracking-tight sm:text-2xl">{{ role.name }}</h2><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><Badge :variant="role.system ? 'secondary' : 'outline'">{{ role.system ? 'Main role' : 'Custom role' }}</Badge><Badge v-if="role.locked" variant="secondary"><Icon name="Lock" :size="11"/>Locked</Badge><span class="tnum">{{ applied }} of {{ PERMS.length }} permissions</span></p></div></div>
        <div class="flex gap-1.5"><RefreshButton :loading="R2.loading" :updated-at="R2.updatedAt" @refresh="refresh"/>
          <Button v-if="canViewAs() && !role.locked" variant="outline" @click="G.viewAsPick = { role: role.id }"><Icon name="ScanEye" :size="14"/><span class="hidden sm:inline">Preview this role</span><span class="sm:hidden">Preview</span></Button>
          <Button v-if="canEditRole() && !role.locked" variant="outline" aria-label="Edit role" @click="startEdit"><Icon name="Pencil" :size="14"/><span class="hidden sm:inline">Edit</span></Button>
          <DropdownMenu :items="moreItems" @select="onMore"><template #trigger><Button variant="outline" size="icon" aria-label="More actions"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></div>
      </div>
      <div class="max-w-full overflow-x-auto"><Tabs v-model="R2.tab" :items="tabs"/></div>
      <div :class="['grid grid-cols-[minmax(0,1fr)] gap-4 transition-opacity', R2.loading && 'pointer-events-none opacity-60']">

      <!-- OVERVIEW -->
      <template v-if="R2.tab==='overview'">
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Permissions</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="KeyRound" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ applied }}<span class="text-sm font-normal text-muted-foreground">/{{ PERMS.length }}</span></p><div class="mt-2 h-1.5 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full rounded-full bg-c1 transition-[width] duration-700" :style="{ width: kpi.pct + '%' }"></div></div></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Menus visible</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="ListTree" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.menus }}<span class="text-sm font-normal text-muted-foreground">/{{ MENU.length }}</span></p><p class="mt-1 text-[11px] text-muted-foreground">Top-level menus in the sidebar</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">People</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Users" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.people }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ role.system ? 'As their main role' : 'At ' + kpi.locs + ' location' + (kpi.locs===1 ? '' : 's') }}</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">With direct grants</p><span class="grid h-6 w-6 place-items-center rounded-md bg-warning/15 text-warning"><Icon name="UserRound" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.direct }}</p><p class="mt-1 text-[11px] text-muted-foreground">Holders with exceptions</p></div>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
          <Card class="kpi lg:col-span-2" style="animation-delay:200ms"><div class="p-4">
            <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold">Permissions by module</h3><Button variant="ghost" size="sm" class="-mr-2 h-7" @click="R2.tab='perms'">Edit<Icon name="ChevronRight" :size="13"/></Button></div>
            <div class="mt-3 grid gap-2.5">
              <div v-for="(b, i) in byModule" :key="b.mod" role="link" tabindex="0" @click="goModule(b.mod)" @keydown.enter="goModule(b.mod)" class="group grid cursor-pointer gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div class="flex items-center justify-between gap-3 text-xs"><span class="truncate font-medium group-hover:underline">{{ b.mod }}</span><span class="tnum text-muted-foreground">{{ b.n }}/{{ b.total }}</span></div>
                <div class="h-2 overflow-hidden rounded-full bg-muted"><div class="bar-grow h-full rounded-full" :style="{ width: b.pct + '%', background: b.color, animationDelay: (i*70)+'ms' }"></div></div></div></div></div></Card>
          <Card class="kpi" style="animation-delay:260ms"><div class="p-4">
            <h3 class="text-sm font-semibold">About this role</h3>
            <p class="mt-2 text-sm">{{ role.desc }}</p>
            <div class="mt-3 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground"><p v-if="role.locked" class="flex gap-2"><Icon name="Lock" :size="13" class="mt-px shrink-0"/>Always has every permission. It can't be edited, previewed or deleted.</p>
              <p v-else-if="role.system" class="flex gap-2"><Icon name="Shield" :size="13" class="mt-px shrink-0"/>A main role. Every person has exactly one, set in Users. Applies across the whole organisation.</p>
              <p v-else class="flex gap-2"><Icon name="MapPin" :size="13" class="mt-px shrink-0"/>A custom role. Given at a location and everything under it, on top of the person's main role.</p></div>
            <dl class="mt-3 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t pt-3 text-xs"><dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="CalendarPlus" :size="12"/>Created</dt><dd class="tnum">{{ role.createdAt || '12 Mar 2025' }}</dd><dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="UserRound" :size="12"/>Created by</dt><dd class="truncate">{{ role.createdBy || (role.system ? 'System' : 'Amina Juma') }}</dd><dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="CalendarClock" :size="12"/>Updated</dt><dd class="tnum">{{ role.updatedAt || '6 Oct 2026' }}</dd><dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="UserRound" :size="12"/>Updated by</dt><dd class="truncate">{{ role.updatedBy || 'Amina Juma' }}</dd></dl>
            <div class="mt-3 flex items-center justify-between border-t pt-3"><h3 class="text-sm font-semibold">People</h3><Button variant="ghost" size="sm" class="-mr-2 h-7" @click="R2.tab='people'">All<Icon name="ChevronRight" :size="13"/></Button></div>
            <ul v-if="holders.length" class="mt-2 grid gap-2"><li v-for="h in holders.slice(0,4)" :key="h.key" class="flex items-center gap-2.5"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold uppercase text-primary">{{ initials(h.m.name) }}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ h.m.name }}</p><p class="truncate text-xs text-muted-foreground">{{ h.locs.length ? h.locs.map(l => (locById(l)||{}).name).join(', ') : (h.m.email || h.m.phone) }}</p></div></li></ul>
            <p v-else class="mt-2 text-sm text-muted-foreground">Nobody holds this role yet.</p></div></Card>
        </div>
      </template>

      <!-- PERMISSIONS -->
      <Card v-if="R2.tab==='perms'" class="kpi"><div class="p-4">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <div class="inline-flex rounded-md bg-muted p-0.5 text-xs" role="radiogroup" aria-label="Show">
            <button v-for="f in [['all','All'],['applied','Applied'],['not','Not applied']]" :key="f[0]" type="button" role="radio" :aria-checked="R2.filter===f[0]" @click="R2.filter=f[0]" :class="['h-7 rounded px-2.5 font-medium', R2.filter===f[0] ? 'bg-background shadow' : 'text-muted-foreground']">{{ f[1] }}</button></div>
          <div class="relative min-w-0 flex-1 basis-48"><Icon name="Search" :size="13" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="!h-8 pl-8 pr-8" v-model="R2.q" placeholder="Search permissions"/><button v-if="R2.q" type="button" class="absolute right-1.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent" aria-label="Clear search" @click="R2.q=''"><Icon name="X" :size="12"/></button></div>
          <span class="text-xs tnum text-muted-foreground"><b class="text-foreground">{{ applied }}</b> applied · {{ PERMS.length - applied }} not</span>
        </div>
        <p v-if="role.locked" class="mb-3 flex items-center gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground"><Icon name="Lock" :size="13"/>The Owner role always has every permission.</p>
        <p v-else-if="ro" class="mb-3 flex items-center gap-2 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground"><Icon name="Eye" :size="13"/>Read-only. You need "Create and edit roles" to change this.</p>
        <p v-else class="mb-3 text-xs text-muted-foreground">Ticks are staged. Save applies them to everyone holding this role on their next request.</p>
        <div class="grid gap-3">
          <section v-for="[mod, list] in modules" :key="mod" v-show="filtered(list).length" class="rounded-lg border">
            <button type="button" @click="toggleModule(list)" :disabled="ro" class="flex w-full items-center gap-3 border-b bg-muted/30 px-3 py-2 text-left disabled:cursor-default">
              <span :class="['grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-primary', modState(list)!=='none' ? 'bg-primary text-primary-foreground' : '']"><Icon v-if="modState(list)==='all'" name="Check" :size="12" stroke-width="3"/><Icon v-else-if="modState(list)==='some'" name="Minus" :size="12" stroke-width="3"/></span>
              <span class="flex-1 text-sm font-medium">{{ mod }}</span><span class="text-xs text-muted-foreground tnum">{{ list.filter(p=>has(p.name)).length }}/{{ list.length }}</span></button>
            <ul class="divide-y">
              <li v-for="p in filtered(list)" :key="p.name"><label :class="['flex items-center gap-3 px-3 py-2', ro ? '' : 'cursor-pointer hover:bg-muted/40']">
                <Checkbox :model-value="has(p.name)" @update:model-value="togglePerm(p.name)" :disabled="ro"/>
                <span class="min-w-0 flex-1"><span class="block text-sm">{{ p.label }}</span><span class="block font-mono text-[11px] text-muted-foreground">{{ p.name }}</span></span>
                <span v-if="menuOf(p.name)" class="hidden items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-flex"><Icon :name="menuOf(p.name).icon" :size="11"/>Shows {{ menuOf(p.name).label }}</span>
                <span :class="['shrink-0 text-[11px] font-medium', has(p.name) ? 'text-c1' : 'text-muted-foreground']">{{ has(p.name) ? 'Applied' : 'Not applied' }}</span></label></li>
            </ul></section>
          <p v-if="modules.every(([m, l]) => !filtered(l).length)" class="py-8 text-center text-sm text-muted-foreground">No permissions match.</p>
        </div></div></Card>

      <!-- MENUS -->
      <Card v-if="R2.tab==='menus'" class="kpi"><div class="p-4">
        <p class="mb-3 text-xs text-muted-foreground">Tick a child to grant its permission. Its parent shows as soon as one child is ticked. Ticking a parent ticks every child.</p>
        <ul class="grid gap-1.5">
          <li v-for="m in MENU" :key="m.id" class="rounded-lg border">
            <div class="flex items-center gap-3 px-3 py-2">
              <button type="button" :disabled="ro" @click="m.groups ? toggleParent(m) : toggleLeaf(m)" :aria-label="'Toggle ' + m.label" :class="['grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-primary disabled:opacity-60', (m.groups ? pState(m)!=='none' : leafVisible(m, R2.draft)) ? 'bg-primary text-primary-foreground' : '']">
                <Icon v-if="m.groups ? pState(m)==='all' : leafVisible(m, R2.draft)" name="Check" :size="12" stroke-width="3"/><Icon v-else-if="m.groups && pState(m)==='some'" name="Minus" :size="12" stroke-width="3"/></button>
              <Icon :name="m.icon" :size="16" class="text-muted-foreground"/><span class="flex-1 text-sm font-medium">{{ m.label }}</span>
              <span v-if="menuVisibleFor(m, R2.draft)" class="inline-flex items-center gap-1 rounded-full bg-c1/15 px-2 py-0.5 text-[11px] font-medium"><Icon name="Eye" :size="11"/>Visible</span>
              <span v-else class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"><Icon name="EyeOff" :size="11"/>Hidden</span>
            </div>
            <ul v-if="m.groups" class="border-t py-1">
              <li v-for="l in leaves(m)" :key="l.id" class="relative flex items-center gap-3 py-1.5 pl-10 pr-3">
                <span class="absolute left-[1.15rem] top-0 h-full w-px bg-border"></span><span class="absolute left-[1.15rem] top-1/2 h-px w-3 bg-border"></span>
                <Checkbox :model-value="leafVisible(l, R2.draft)" @update:model-value="toggleLeaf(l)" :disabled="ro"/>
                <Icon :name="l.icon" :size="14" class="text-muted-foreground"/><span class="flex-1 text-sm">{{ l.label }}</span>
                <code class="hidden font-mono text-[11px] text-muted-foreground sm:inline">{{ l.perm }}</code>
                <Icon :name="leafVisible(l, R2.draft) ? 'Eye' : 'EyeOff'" :size="13" :class="leafVisible(l, R2.draft) ? 'text-c1' : 'text-muted-foreground'"/></li>
            </ul>
          </li>
        </ul></div></Card>

      <!-- PEOPLE -->
      <Card v-if="R2.tab==='people'" class="kpi"><div class="p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2"><p class="text-xs text-muted-foreground">{{ role.system ? 'People whose main role is ' + role.name + '.' : 'People given ' + role.name + ' at a location. It covers that location and everything under it.' }}</p>
          <Button variant="outline" size="sm" @click="role.system ? nav('members') : nav('locations')"><Icon :name="role.system ? 'Users' : 'MapPin'" :size="14"/>{{ role.system ? 'Manage in Users' : 'Assign at a location' }}</Button></div>
        <div v-if="!holders.length" class="grid place-items-center rounded-lg border border-dashed p-8 text-center"><Icon name="UserRoundX" :size="20" class="text-muted-foreground"/><p class="mt-2 text-sm font-medium">Nobody holds this role yet</p><p class="text-xs text-muted-foreground">{{ role.system ? "Change someone's main role in Users." : 'Open a location, then People, to give it to someone there.' }}</p></div>
        <ul v-else class="divide-y rounded-lg border">
          <li v-for="h in holders" :key="h.key" class="flex flex-wrap items-center gap-3 p-3">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ initials(h.m.name) }}</span>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ h.m.name }}</p><p class="truncate text-xs text-muted-foreground">{{ h.m.email || h.m.phone }}</p></div>
            <DropdownMenu :items="peopleMenu(h)" @select="it => onPeople(h, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + h.m.name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu>
            <div v-if="h.locs.length || directOf(h.m).length" class="flex w-full flex-wrap gap-1 pl-11">
              <button v-for="l in h.locs" :key="l" type="button" class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary hover:underline" @click="openLoc(l, 'users')"><Icon name="MapPin" :size="11"/>{{ (locById(l) || {}).name }}</button>
              <span v-for="d in directOf(h.m)" :key="d" class="inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning" :title="permLabel(d)"><Icon name="UserRound" :size="11"/>+ {{ d }}</span></div>
          </li>
        </ul>
        <p v-if="holders.some(h => directOf(h.m).length)" class="mt-2 text-xs text-muted-foreground">Amber tags are direct grants: exceptions given to one person outside their role.</p>
      </div></Card>

      <!-- HISTORY -->
      <Card v-if="R2.tab==='history'" class="kpi"><div class="p-4">
        <ol class="grid gap-4"><li v-for="(e, i) in HIST.slice(0, R2.shown)" :key="i" class="flex gap-3"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="e.icon" :size="14"/></span><div class="min-w-0 text-sm"><p><span class="font-medium">{{ e.who }}</span> {{ e.what }}</p><p v-if="e.detail" class="text-xs text-muted-foreground">{{ e.detail }}</p><p class="text-xs text-muted-foreground tnum">{{ e.when }}</p></div></li></ol>
        <div v-if="R2.shown < HIST.length" class="mt-4 flex justify-center"><Button variant="outline" size="sm" :disabled="R2.hLoading" @click="moreHist"><Icon v-if="R2.hLoading" name="LoaderCircle" :size="14" class="animate-spin"/>Load more</Button></div>
      </div></Card>
      </div>

      <Dialog v-model:open="R2.edit">
        <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Edit role</h2><p class="text-sm text-muted-foreground">{{ role.system ? 'Main role names are fixed. You can change the description.' : 'Renaming keeps every assignment.' }}</p></div>
        <div class="grid gap-3"><div class="grid gap-1.5"><label for="er-name" class="text-sm font-medium">Role name</label><Input id="er-name" v-model="R2.name" :disabled="role.system" :aria-invalid="nameTaken"/><p v-if="nameTaken" class="text-xs text-destructive">A role with this name already exists.</p></div>
          <div class="grid gap-1.5"><label for="er-desc" class="text-sm font-medium">Description</label><Textarea id="er-desc" v-model="R2.desc" rows="3"/></div></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R2.edit=false">Cancel</Button><Button :disabled="R2.name.trim().length < 2 || nameTaken" @click="saveEdit">Save</Button></div>
      </Dialog>
      <Dialog v-model:open="R2.copy">
        <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Copy permissions</h2><p class="text-sm text-muted-foreground">Replaces every tick on {{ role.name }} with the other role's set. Nothing is saved until you press Save.</p></div>
        <div class="grid gap-1.5"><span class="text-sm font-medium">Copy from</span><Select v-model="R2.from" :options="copyOpts" aria-label="Copy from"/></div>
        <div v-if="copyDiff" class="flex flex-wrap gap-2 text-xs"><span class="inline-flex items-center gap-1 rounded-md bg-c1/15 px-2 py-1 font-medium tnum"><Icon name="Plus" :size="12"/>{{ copyDiff.add }} added</span><span class="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 font-medium text-destructive tnum"><Icon name="Minus" :size="12"/>{{ copyDiff.remove }} removed</span></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R2.copy=false">Cancel</Button><Button :disabled="!R2.from" @click="doCopy"><Icon name="CopyPlus" :size="14"/>Stage changes</Button></div>
      </Dialog>
      <Transition name="fade"><div v-if="dirty" class="sticky bottom-3 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-popover p-2.5 pl-3.5 text-sm shadow-lg" role="region" aria-label="Unsaved changes">
        <span class="h-2 w-2 shrink-0 animate-pulse rounded-full bg-warning"></span>
        <span class="font-medium">Unsaved changes</span>
        <span class="inline-flex items-center gap-1 rounded-md bg-c1/15 px-1.5 py-0.5 text-xs font-medium tnum" :title="diff.add.join(', ')"><Icon name="Plus" :size="11"/>{{ diff.add.length }}</span>
        <span class="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-xs font-medium tnum text-destructive" :title="diff.remove.join(', ')"><Icon name="Minus" :size="11"/>{{ diff.remove.length }}</span>
        <span class="hidden text-xs text-muted-foreground sm:inline">Affects {{ holders.length }} {{ holders.length===1 ? 'person' : 'people' }}</span>
        <span class="flex flex-1 justify-end gap-2"><Button variant="ghost" size="sm" @click="discardDraft">Discard</Button><Button size="sm" @click="saveDraft"><Icon name="Check" :size="14"/>Save changes</Button></span>
      </div></Transition>
      <Dialog :open="!!R2.leave" @update:open="v => { if (!v) R2.leave = null }">
        <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Leave without saving?</h2><p class="text-sm text-muted-foreground">{{ role.name }} has {{ diff.add.length }} added and {{ diff.remove.length }} removed permissions that are not saved.</p></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R2.leave=null">Stay</Button><Button variant="outline" class="text-destructive" @click="leaveAnyway">Discard and leave</Button><Button @click="saveDraft(); leaveAnyway()"><Icon name="Check" :size="14"/>Save and leave</Button></div>
      </Dialog>
      <DeleteDialog v-model:open="R2.del" :name="role.name" :deps="deps" :blocking="holders.length > 0" @confirm="doDelete"/>
    </div>`
  };

  /* ---------- Design system: foundations, components inventory, layout rules */
  const DS_TOKENS = [
    { name: 'background', use: 'Page and input surfaces' }, { name: 'foreground', use: 'Primary text' }, { name: 'canvas', use: 'App ground behind cards' },
    { name: 'card', use: 'Cards, table containers' }, { name: 'popover', use: 'Menus, selects, toasts' }, { name: 'primary', use: 'Brand teal: primary buttons, active states, focus' },
    { name: 'primary-foreground', use: 'Text on primary' }, { name: 'secondary', use: 'Secondary buttons, soft badges' }, { name: 'muted', use: 'Subtle fills, skeletons, tab track' },
    { name: 'muted-foreground', use: 'Secondary text, labels, icons' }, { name: 'accent', use: 'Hover rows, active menu item' }, { name: 'destructive', use: 'Delete, errors, voided' },
    { name: 'warning', use: 'Timers, violations, unpublished' }, { name: 'border', use: 'Card and divider lines' }, { name: 'input', use: 'Input borders, switch track' }, { name: 'ring', use: 'Focus ring' },
  ];
  const DS_TYPE = [
    { role: 'Display', cls: 'text-2xl font-semibold tracking-tight', px: '24 / 32', w: 600, use: 'Sign-in heading, form title', sample: 'Customer Service Assessment' },
    { role: 'Page title', cls: 'text-xl font-semibold tracking-tight', px: '20 / 28', w: 600, use: 'Top of each admin page', sample: 'Kilima Retail forms' },
    { role: 'Section title', cls: 'text-lg font-semibold', px: '18 / 28', w: 600, use: 'Section headers, dialog titles', sample: 'Product knowledge' },
    { role: 'Card title', cls: 'text-sm font-semibold', px: '14 / 20', w: 600, use: 'Card and table headings', sample: 'Responses this week' },
    { role: 'Body', cls: 'text-sm', px: '14 / 20', w: 400, use: 'Default text, inputs, menu items', sample: 'Answer from memory. You cannot return to this section.' },
    { role: 'Small', cls: 'text-xs', px: '12 / 16', w: 400, use: 'Helper text, meta lines, table subtext', sample: 'Edited 2h ago · Closes 31 Oct' },
    { role: 'Label', cls: 'text-[11px] font-semibold uppercase tracking-wider', px: '11 / 16', w: 600, use: 'Group headings, column labels', sample: 'Monitoring' },
    { role: 'KPI number', cls: 'text-2xl font-semibold tracking-tight tabular-nums', px: '24 / 32', w: 600, use: 'Stat cards (tabular figures)', sample: '1,284' },
    { role: 'Mono', cls: 'font-mono text-xs', px: '12 / 16', w: 400, use: 'Permission codes, references, keys', sample: 'Logs.list · 01JA2K7XH9' },
  ];
  const DS_SPACE = [[0.5, 2], [1, 4], [1.5, 6], [2, 8], [2.5, 10], [3, 12], [3.5, 14], [4, 16], [5, 20], [6, 24], [8, 32], [10, 40], [14, 56]];
  const DS_RADIUS = [['rounded-sm', 'calc(var(--radius) - 4px)', '~6px', 'Checkbox, small chips'], ['rounded-md', 'calc(var(--radius) - 2px)', '~8px', 'Buttons, inputs, menu items'], ['rounded-lg', 'var(--radius)', '~10px', 'Dialogs, tab track, popovers'], ['rounded-xl', 'calc(var(--radius) + 4px)', '~14px', 'Cards, KPI tiles'], ['rounded-full', '9999px', 'pill', 'Status pills, avatars, switch']];
  const DS_SHADOW = [['shadow-sm', 'Cards at rest, inputs, buttons'], ['shadow-md', 'Hovered or active card'], ['shadow-lg', 'Menus, toasts, sheets'], ['shadow-xl', 'Dialogs, flyouts, phone frame']];
  const DS_MOTION = [
    ['Popover / menu open', 120, 'ease-out', 'pop'], ['Card activate', 160, 'ease-out', 'expand'], ['List reorder (FLIP)', 180, 'cubic-bezier(.2,.8,.2,1)', 'move'],
    ['Sheet slide', 220, 'cubic-bezier(.2,.8,.2,1)', 'sheet'], ['Dropdown expand', 240, 'cubic-bezier(.2,.8,.2,1)', 'expand'], ['Sidebar panel push', 280, 'cubic-bezier(.2,.8,.2,1)', 'push'],
    ['Card rise-in (stagger 40–60ms)', 420, 'cubic-bezier(.2,.8,.2,1)', 'rise'], ['Bars / meters grow', 700, 'cubic-bezier(.2,.8,.2,1)', 'grow'], ['Curtain close / open', '440 / 600', 'cubic-bezier(.7,0,.3,1)', 'curtain'],
  ];
  const DS_BP = [['Base', '< 640', 'Phone: one column, bottom action bars, tables become card lists, tabs full width on their own row, menu in a slide-out sheet'], ['sm', '≥ 640', 'Two-column card grids, table/card toggle appears, header shows more icons'], ['md', '≥ 768', 'Tables replace card lists in Responses, Members and Menu Management'], ['lg', '≥ 1024', 'Persistent sidebar (240px, 64px collapsed), builder tool rail, tabs centred in header'], ['xl', '≥ 1280', 'Three-column form cards, 2-column chart grid, 5 KPI tiles']];
  const DS_Z = [['Sticky page header', 30], ['App header / sidebar', 40], ['Screens pill', 45], ['Dialogs, sheets', 50], ['Toasts', 60], ['Phone frame', 80], ['Chart tooltip', 90], ['Menus, selects (portal)', 95], ['Sidebar flyout', 96], ['Page curtain', 120]];
  const DS_ICON = [[12, 'Inside badges and pills'], [14, 'Small buttons, meta lines'], [16, 'Default: buttons, menu items, inputs'], [18, 'Collapsed sidebar rail, tool rail'], [20, 'Page title tiles, empty states'], [24, 'Hero empty states, status circles']];

  const DS_COMPONENTS = [
    { name: 'Button', ui: 'Button', tag: 'Actions', specs: [['Heights', 'default 36 · sm 32 · lg 40 · icon 36×36 · icon-sm 32×32'], ['Padding', 'default 16px x · sm 12px x · lg 32px x'], ['Font', '14px / 500 (sm: 12px)'], ['Radius', 'rounded-md'], ['Icon gap', '8px']], variants: 'default, secondary, outline, ghost, destructive, link', used: 'Everywhere. One primary (default) button per view.',
      demo: `<div class="flex flex-wrap items-center gap-2"><Button>Publish</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Delete</Button><Button variant="link">Link</Button><Button size="sm"><Icon name="Plus" :size="14"/>Small</Button><Button size="icon" variant="outline" aria-label="Settings"><Icon name="Settings"/></Button></div>` },
    { name: 'Input', ui: 'Input', tag: 'Forms', specs: [['Height', '36px (auth screens 40px)'], ['Padding', '12px x, 4px y; 32px left with a leading icon'], ['Font', '14px'], ['Border', '1px input token, focus ring 1px ring token'], ['Radius', 'rounded-md']], variants: 'with leading icon, with trailing button, line-input (builder titles)', used: 'Settings, search, sign-in, builder.',
      demo: `<div class="grid max-w-sm gap-2"><Input v-model="s.text" placeholder="Search forms"/><div class="relative"><Icon name="Mail" :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-9" placeholder="name@company.co.tz"/></div><input class="line-input text-sm" placeholder="Line input (builder question title)"></div>` },
    { name: 'Select', ui: 'Select', tag: 'Forms', specs: [['Trigger', '36px (sm 32px), 12px x padding, chevron 16px at 50% opacity'], ['Content', 'portal, min-width 12rem, max-height 18rem, 4px padding, collisionPadding 8'], ['Item', '6px y · 8px left · 32px right (check)'], ['Radius', 'rounded-md']], variants: 'default, sm, with icons, grouped', used: 'Question type, permissions, filters, roles.',
      demo: `<div class="grid max-w-xs gap-2"><Select v-model="s.sel" :options="[{value:'single_choice',label:'Multiple choice',icon:'CircleDot'},{value:'multi_choice',label:'Checkboxes',icon:'SquareCheck'},{value:'rating',label:'Rating',icon:'Star'}]"/><Select size="sm" v-model="s.sel2" :options="[{value:'a',label:'Last edited'},{value:'b',label:'Most responses'}]"/></div>` },
    { name: 'Checkbox · Switch · Radio', ui: 'Checkbox, Switch, RadioGroup', tag: 'Forms', specs: [['Checkbox', '16×16, rounded-sm, 1px primary border, check 12px stroke 3'], ['Switch', '36×20 track, 16px thumb, moves 16px'], ['Radio', '16×16 circle, 8px dot'], ['Hit area', 'wrap in a label row ≥ 36px tall (44px on respondent forms)']], variants: 'checked, unchecked, indeterminate (tree parents), disabled', used: 'Permissions, settings, grant dialog, respondent answers.',
      demo: `<div class="flex flex-wrap items-center gap-5"><label class="flex items-center gap-2 text-sm"><Checkbox v-model="s.cb"/>Checkbox</label><label class="flex items-center gap-2 text-sm"><Switch v-model="s.sw"/>Switch</label><label class="flex items-center gap-2 text-sm"><RadioGroupItem :checked="s.rd==='a'" @select="s.rd='a'"/>Radio A</label><label class="flex items-center gap-2 text-sm"><RadioGroupItem :checked="s.rd==='b'" @select="s.rd='b'"/>Radio B</label><span class="flex items-center gap-2 text-sm"><span class="grid h-4 w-4 place-items-center rounded-sm border border-primary bg-primary text-primary-foreground"><Icon name="Minus" :size="12" stroke-width="3"/></span>Indeterminate</span></div>` },
    { name: 'Badge · Status pill', ui: 'Badge', tag: 'Display', specs: [['Badge', '12px / 600, 8px x · 2px y, rounded-md'], ['Pill', '11px / 500, 8px x · 2px y, rounded-full, 6px dot'], ['Colour', 'state colour at 15% fill, text in text token (never series colour)']], variants: 'default, secondary, outline, destructive, warning; Live/Draft/Closed/Archived pills', used: 'Form status, invite status, roles, violations.',
      demo: `<div class="flex flex-wrap items-center gap-2"><Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="warning"><Icon name="Timer" :size="12"/>Timed</Badge><Badge variant="destructive">Voided</Badge><span class="inline-flex items-center gap-1.5 rounded-full bg-c1/15 px-2 py-0.5 text-[11px] font-medium"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-c1"></span>Live</span><span class="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning"><span class="h-1.5 w-1.5 rounded-full bg-warning"></span>Closed</span></div>` },
    { name: 'Tabs', ui: 'Tabs, TabsList, TabsTrigger', tag: 'Navigation', specs: [['Track', '36px, muted fill, 4px padding, rounded-lg'], ['Trigger', '12px x, 4px y, 14px / 500, active = background + shadow'], ['Count', '11px pill inside the trigger'], ['Overflow', 'wrapper scrolls sideways on phones']], variants: 'inline, full width (phone header row)', used: 'Builder tabs, results sub-tabs, roles detail, status filters.',
      demo: `<Tabs v-model="s.tab" :items="[{value:'q',label:'Questions'},{value:'r',label:'Responses',count:142},{value:'s',label:'Settings'}]"/>` },
    { name: 'Card · KPI tile', ui: 'Card (+ app pattern)', tag: 'Display', specs: [['Card', 'rounded-xl, 1px border, card fill, shadow-sm; padding 16px (sm: 20px)'], ['KPI tile', '14px padding, label 12px/500, value 24px/600 tabular, icon chip 24×24 rounded-md'], ['Gap', '8px between tiles, 12px between cards'], ['Motion', 'rise-in 420ms, stagger 60ms, count-up 700ms']], variants: 'plain, with top accent strip (4px), KPI with sparkline or meter', used: 'All dashboards and lists.',
      demo: `<div class="grid max-w-md grid-cols-2 gap-2"><div class="rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Responses</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Inbox" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tabular-nums">140</p><p class="mt-1 text-[11px] text-muted-foreground">Daily, since 1 Oct</p></div><div class="rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Completed</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="CircleCheck" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tabular-nums">92.1%</p><div class="mt-2 h-1.5 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full w-[92%] rounded-full bg-c1"></div></div></div></div>` },
    { name: 'DropdownMenu', ui: 'DropdownMenu, DropdownMenuContent, DropdownMenuItem', tag: 'Overlays', specs: [['Content', 'portal, min-width 13rem, 4px padding, rounded-md, shadow-md, collisionPadding 8'], ['Item', '8px x · 6px y, 14px, icon 16px at 70%'], ['Label', '14px / 600'], ['Motion', '120ms pop']], variants: 'items, checked items, destructive item, separator, label', used: 'Row actions (⋮), theme, user menu, create menu.',
      demo: `<DropdownMenu :items="[{id:'e',label:'Edit',icon:'Pencil'},{id:'d',label:'Duplicate',icon:'Copy'},{separator:true},{id:'a',label:'Archive',icon:'Archive',destructive:true}]" label="Actions" align="start" @select="it => G.toast('Clicked ' + it.label,'','MousePointerClick')"><template #trigger><Button variant="outline"><Icon name="EllipsisVertical"/>Open menu</Button></template></DropdownMenu>` },
    { name: 'Dialog · Sheet', ui: 'Dialog, Sheet', tag: 'Overlays', specs: [['Dialog', 'max-width 512px, 24px padding, 16px gap, rounded-xl (bottom sheet on phones), max-height 100dvh − 2rem, scrolls'], ['Overlay', 'black 70%'], ['Sheet', 'right: full width → 512px; left (nav): 300px; 220ms slide'], ['Footer', 'buttons right-aligned; stacked reversed on phones']], variants: 'confirm, form, destructive confirm; sheet right/left', used: 'Publish, grant access, gear popup, response detail, mobile nav.',
      demo: `<div class="flex flex-wrap gap-2"><Button variant="outline" @click="s.dlg=true">Open dialog</Button><Button variant="outline" @click="s.sheet=true">Open sheet</Button></div>
        <Dialog v-model:open="s.dlg"><div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Publish version 4</h2><p class="text-sm text-muted-foreground">People mid-attempt finish on the version they started.</p></div><div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="s.dlg=false">Cancel</Button><Button @click="s.dlg=false">Publish</Button></div></Dialog>
        <Sheet v-model:open="s.sheet"><div class="border-b p-5 pr-12"><h2 class="font-semibold">Response detail</h2><p class="mt-1 text-sm text-muted-foreground">Sheets hold long detail without leaving the page.</p></div><div class="p-5 text-sm text-muted-foreground">Content scrolls here.</div></Sheet>` },
    { name: 'Tooltip · Toast', ui: 'Tooltip, Sonner', tag: 'Feedback', specs: [['Tooltip', 'primary fill, 12px text, 12px x · 6px y, 300ms delay, portal'], ['Toast', 'max-width 384px, 14px padding, title 14px/500, description 12px, icon 16px, 3.4s'], ['Position', 'toasts bottom-centre on phones, bottom-right from lg']], variants: 'default, danger (timer)', used: 'Icon buttons, confirmations after every action.',
      demo: `<div class="flex flex-wrap items-center gap-2"><Tooltip content="Copy responder link"><Button variant="outline" size="icon" aria-label="Copy link"><Icon name="Link"/></Button></Tooltip><Button variant="outline" @click="G.toast('Link copied','https://' + PRODUCT.domain + '/f/cs-assessment-q4','Link')">Show toast</Button></div>` },
    { name: 'List rows', ui: 'ListRows inside ListCard (P40)', tag: 'Data', specs: [['Grid', 'one CSS grid per row; identity minmax(40% of card, 1fr), other columns at their min, 16px gaps, chevron column 16px'], ['Header', '12px / 500 muted, 36px tall, bottom border; unfolded columns only; sortable headers clickable'], ['Row', '16px x · 8px y, min 56px, hover accent/60, whole row clickable; identity cell = 40px icon tile + title line + meta line'], ['Numbers', 'hero right-aligned, 600, tabular; one-word sub-label when not tight'], ['Folding', 'by the card\'s own width (ResizeObserver), highest priority number first: status → badge over the hero; identity badges → title line; meta → meta line (two lines) then +N more'], ['Tight', 'identity minmax(0,1fr), hero max-content, title wraps, identity cell top-aligned, toolbar icon-only']], variants: 'full table, partly folded, folded row, expanded (+N more strip), empty state', used: 'Every list that shows rows: Users, Roles, Locations, Approvals, product modules. Not Logs or Queue (report tables).',
      demo: `<div class="overflow-hidden rounded-xl border bg-card"><table class="w-full text-sm"><thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Respondent</th><th class="px-3 py-2.5 text-right font-medium">Duration</th><th class="px-4 py-2.5 font-medium">Status</th></tr></thead><tbody><tr class="border-b hover:bg-muted/50"><td class="px-4 py-2.5">Amina Juma</td><td class="px-3 py-2.5 text-right tabular-nums">12m 04s</td><td class="px-4 py-2.5"><Badge variant="secondary">Submitted</Badge></td></tr><tr class="hover:bg-muted/50"><td class="px-4 py-2.5">Baraka Mushi</td><td class="px-3 py-2.5 text-right tabular-nums">15m 00s</td><td class="px-4 py-2.5"><Badge variant="warning">Auto-submitted</Badge></td></tr></tbody></table></div>` },
    { name: 'Charts', ui: 'Chart card (app pattern, SVG/HTML)', tag: 'Data', specs: [['Bars', '≤ 20px thick, 4px rounded end, square at baseline, 700ms grow, 40ms stagger'], ['Palette', 'c1 teal, c2 amber, c3 blue, c4 rose, c5 violet; max 5 then grey "Other" (validated)'], ['Text', 'labels and values in text tokens, never series colour'], ['Hover', 'tooltip on every mark; table view always available']], variants: 'bars, donut, columns, 100% stacked, heatmap, rating summary, table', used: 'Results summary, sparklines in KPI tiles and form cards.',
      demo: `<div class="grid max-w-md gap-2"><div v-for="(r, i) in [['M-Pesa',93],['Cash',99],['Bank card',65],['Cheque',10]]" :key="r[0]" class="grid grid-cols-[6rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm"><span class="truncate text-muted-foreground">{{ r[0] }}</span><span class="relative h-5 rounded-r bg-muted/50"><span class="absolute inset-y-0 left-0 rounded-r-[4px] bg-c1 transition-[width] duration-700" :style="{ width: (s.grow ? r[1] : 0) + '%', transitionDelay: (i*40)+'ms' }"></span></span><span class="text-right tabular-nums">{{ r[1] }}%</span></div><Button size="sm" variant="ghost" class="justify-self-start" @click="s.grow=false; setTimeout(()=>s.grow=true, 60)"><Icon name="RotateCcw" :size="13"/>Replay</Button></div>` },
    { name: 'Sidebar item', ui: 'Sidebar, SidebarMenuButton, SidebarMenuSub', tag: 'Navigation', specs: [['Width', '240px expanded, 64px rail'], ['Item', '36px tall, 10px x, 10px icon gap, icon 16px; sub-item 32px'], ['Active', 'accent fill + 500 weight'], ['Group label', '11px / 600 uppercase, 16px above']], variants: 'link, dropdown (accordion), panel (push), section, rail + flyout', used: 'Main navigation, configured in Menu Management.',
      demo: `<div class="w-60 rounded-xl border bg-background p-2"><button class="flex h-9 w-full items-center gap-2.5 rounded-md bg-accent px-2.5 text-sm font-medium"><Icon name="ClipboardList" :size="16"/>Forms<span class="ml-auto text-xs text-muted-foreground">8</span></button><button class="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent"><Icon name="ShieldCheck" :size="16"/>Users and access<Icon name="ChevronDown" :size="15" class="ml-auto rotate-180"/></button><div class="ml-[18px] border-l pl-2"><button class="mt-0.5 flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent"><Icon name="Users" :size="15"/>Users</button><button class="mt-0.5 flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent"><Icon name="Shield" :size="15"/>Roles</button></div><button class="flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-accent"><Icon name="Server" :size="16"/>System<Icon name="ChevronRight" :size="15" class="ml-auto"/></button></div>` },
    { name: 'Pin input (OTP)', ui: 'PinInput', tag: 'Forms', specs: [['Box', '48×48 (44 wide on phones), 18px / 600 tabular, rounded-md'], ['Focus', 'accent border + 2px ring at 30%'], ['Behaviour', 'auto-advance, backspace goes back, paste fills all, submit on 6th digit']], variants: 'respondent email code (form accent), admin 2FA (primary)', used: 'Respondent verification, two-step sign-in.',
      demo: `<div class="flex gap-1.5"><input v-for="i in 6" :key="i" maxlength="1" inputmode="numeric" :aria-label="'Digit ' + i" class="h-12 w-11 rounded-md border border-input bg-background text-center text-lg font-semibold tabular-nums shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"></div>` },
    { name: 'Empty · Skeleton · No access', ui: 'Skeleton (+ patterns)', tag: 'Feedback', specs: [['Empty', 'dashed border, 40–56px y padding, 48px icon circle, title 18px/600, one primary action'], ['Skeleton', 'muted/70 fill, pulse, same radius as the real element'], ['No access', 'lock circle, names the missing permission, Request access']], variants: 'empty list, filtered empty, loading, 403', used: 'New organisation, search with no results, org switching, hidden pages.',
      demo: `<div class="grid gap-2 sm:grid-cols-2"><div class="grid place-items-center rounded-xl border border-dashed bg-card/50 px-4 py-6 text-center"><span class="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="ClipboardPlus" :size="18"/></span><p class="mt-2 text-sm font-semibold">No forms yet</p><Button size="sm" class="mt-2"><Icon name="Plus" :size="14"/>New form</Button></div><div class="grid gap-2 rounded-xl border bg-card p-3"><div class="h-3 w-24 animate-pulse rounded bg-muted"></div><div class="h-6 w-16 animate-pulse rounded bg-muted"></div><div class="h-16 animate-pulse rounded-lg bg-muted/70"></div></div></div>` },
    { name: 'List toolbar · Filters', ui: 'ListToolbar, FiltersDialog, RefreshButton (app pattern)', tag: 'Data', specs: [['Order', 'Refresh · Filters (n) · Clear n · Sort … grid/list toggle (card grids only) · New'], ['Bar', 'card, 6px padding, rounded-xl; buttons ghost sm'], ['Filters', 'Simple = natural operator; Advanced = operator per field; one request on Apply'], ['Chips', 'one chip per active filter + the search, each removable'], ['Phone', 'icons with counts; dialog becomes a bottom sheet']], variants: 'with quick-filter tabs above · with layout toggle', used: 'Card grids: Forms (cards view), Media, Delegations (lists that show rows use List card, P39)',
      demo: `<div class="grid gap-3"><ListToolbar :list="s.list"><Button size="sm"><Icon name="Plus" :size="15"/>New</Button></ListToolbar><p class="text-xs text-muted-foreground">{{ s.list.rows.value.length }} of 6 sample rows match. Try Filters and Sort.</p></div>` },
    { name: 'List card', ui: 'ListCard + ListRows, ListShare (P39, P40)', tag: 'Data', specs: [['Rows', 'toolbar (filters, clear, sort | actions) · quick tabs (own scrollable row, only when declared) · search (own row) · chips · summary · header · rows · footer, in that order at every width (P40)'], ['Card', 'one card for controls and rows; rounded-xl, border, shadow-sm'], ['Width', 'one row shape; columns fold by priority as the card narrows (its own width, not the screen), see List rows (P40)'], ['Search', 'own search box when scoped or on page-level tabs; otherwise the top bar (P22) shows as a chip'], ['Scoped', 'parent filter, column and search removed; no Refresh (page header has it); create opens the form with the parent locked']], variants: 'list page · scoped details tab · page-level tab · with summary strip', used: 'Roles, Users, Approvals, Locations, Location › Users',
      demo: `<ListCard :list="s.list2" :tabs="[{ value: 'all', label: 'All' }, { value: 'a', label: 'Kind A' }, { value: 'b', label: 'Kind B' }, { value: 'c', label: 'Kind C' }]" :quick="s.lq" @update:quick="v => { s.lq = v; s.list2.S.filters = v === 'all' ? {} : { k: { op: 'in', value: [v] } }; }" v-model:search="s.q2" :refresh="false" placeholder="Search samples"><template #actions><ListShare :export-fn="() => exportList(s.list2, [['Name', r => r.n], ['Kind', r => r.k], ['Value', r => r.v]], 'samples', 'Demo')"/><Button size="sm"><Icon name="Plus" :size="15"/>New</Button></template><div v-if="s.list2.rows.value.length" class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Name</th><th class="px-3 py-2.5 font-medium">Kind</th><th class="px-3 py-2.5 text-right font-medium">Value</th></tr></thead><tbody><tr v-for="r in s.list2.rows.value" :key="r.n" class="border-b last:border-0"><td class="px-4 py-2">{{ r.n }}</td><td class="px-3 py-2 uppercase text-muted-foreground">{{ r.k }}</td><td class="px-3 py-2 text-right tnum">{{ r.v }}</td></tr></tbody></table></div><p v-else class="p-8 text-center text-sm text-muted-foreground">No samples match.</p></ListCard>` },
    { name: 'Locked field', ui: 'LockedField (P39)', tag: 'Forms', specs: [['Use', 'a parent value set by the page you came from (create from a scoped tab)'], ['Look', 'muted box, value + optional sub line, lock icon; not focusable, not editable'], ['Label', 'same label as the field it replaces']], variants: 'with sub line · without', used: 'Create from a details tab (DevBiz: New sale, Take payment, Receive stock, Move money)',
      demo: `<div class="grid max-w-sm gap-4"><LockedField label="Location" value="Head Office" sub="HO · set by the page you came from"/><LockedField label="Customer" value="Peter Ngowi"/></div>` },
    { name: 'File picker · Media library', ui: 'FilePicker, MediaLibraryDialog (app pattern)', tag: 'Forms', specs: [['Sources', 'Upload (drop, browse, paste, camera on phones) or Media library'], ['Limits', 'types, max size and max files shown before choosing'], ['Row', 'thumb 40px, name, type · size, progress bar 6px, Cancel / Retry + reason'], ['Value', 'media ids; uploads land in Media at once'], ['Library', 'searchable grid, type chips, single or multi select']], variants: 'single · multiple · image only · PDF only', used: 'Location photo, workspace logo, Media page',
      demo: `<div class="grid max-w-md gap-4"><FilePicker v-model="s.file1" accept="image" :max-size="2" label="Logo"/><FilePicker v-model="s.files" multiple :max-files="3" label="Attachments" help="Try a file over 10 MB to see the error."/></div>` },
    { name: 'API select', ui: 'ApiSelect (Combobox + server search)', tag: 'Forms', specs: [['Paging', 'page numbers for small tables, cursor (after=) for big or busy ones; 20 per page; has_more, no totals'], ['Load more', 'invisible marker 120px before the end triggers the next page; "Loading more…" row; Retry on failure'], ['Search', 'from 2 letters, 300ms after typing stops; new search cancels the old request; exact → starts with → contains'], ['Selected label', 'a) record sends { id, label, sub } · b) one batched ids[] lookup per module per tick · c) shared label store'], ['Pinned', 'current choices first under "Selected", left out of later pages'], ['Stale', 'archived = greyed + (archived); restricted = lock + "Restricted record"; deleted = "Deleted record"; warning under the field; never cleared silently'], ['Cache', 'same module + filters + search reopens instantly, refreshes in the background (60s)'], ['Phone', 'bottom sheet with Done']], variants: 'single · multiple · cursor · with labels from the record · stale values', used: 'Location parent and ward, invite locations, delegations, new request',
      demo: `<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div class="grid gap-4"><ApiSelect v-model="s.api1" module="locations" label="Parent location" help="Page-numbered (12 locations)."/><ApiSelect v-model="s.api2" module="locations" multiple label="Locations"/><ApiSelect v-model="s.ward" module="wards" label="Ward" placeholder="Search 100 wards" help="Cursor paging: scroll the list."/><ApiSelect model-value="nz" module="locations" label="With labels from the record" :selected-options="[{ value: 'nz', label: 'Northern Zone', sub: 'Zone · NZ' }]" help="No lookup request: the record carried the label."/>
        <div class="flex flex-wrap items-center gap-3"><Button size="sm" variant="outline" @click="s.loadRecord()"><Icon name="RotateCw" :size="13"/>Load a record with 5 linked values</Button><label class="flex items-center gap-2 text-xs text-muted-foreground"><Switch v-model="s.fail"/>Simulate a network error</label></div></div>
        <div class="min-w-0 rounded-lg border bg-muted/30 p-2"><p class="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Requests the client sends</p><ol class="grid gap-1"><li v-for="r in s.log" :key="r.id" class="flex items-start gap-2 rounded-md bg-background px-2 py-1.5 font-mono text-[11px]"><span :class="['mt-1 h-1.5 w-1.5 shrink-0 rounded-full', r.state==='ok' ? 'bg-c1' : r.state==='failed' ? 'bg-destructive' : 'bg-warning animate-pulse']"></span><span class="min-w-0 flex-1 break-all">GET {{ r.url }}</span><span class="shrink-0 text-muted-foreground">{{ r.state==='pending' ? '…' : r.state==='failed' ? 'failed' : r.n + ' rows · ' + r.ms + 'ms' }}</span></li><li v-if="!s.log.length" class="px-2 py-3 text-center text-xs text-muted-foreground">Open a select or load the record.</li></ol></div></div>` },
    { name: 'Rich text', ui: 'RichText (Tiptap in the build)', tag: 'Forms', specs: [['Toolbar', 'B I U · H2 H3 quote · lists · link · clear; 32px buttons, sticky, scrolls on phones'], ['Shortcuts', '"- " list, "1. " numbered, "> " quote, "## " heading, Ctrl+K link'], ['Paste', 'cleaned to the allowlist'], ['Output', 'HTML, sanitised again on the server'], ['Limit', 'counter turns red past the limit']], variants: 'with limit · without', used: 'Location directions, invitation footer',
      demo: `<div class="grid max-w-lg gap-2"><RichText v-model="s.rich" label="Directions" :max="300"/><details class="text-xs text-muted-foreground"><summary class="cursor-pointer">Saved HTML</summary><code class="mt-1 block whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono">{{ s.rich }}</code></details></div>` },
    { name: 'Date picker', ui: 'DatePicker (Popover + Calendar)', tag: 'Forms', specs: [['Trigger', 'looks like an input with a calendar icon and clear X'], ['Header', 'inside the card: ‹ · Month ▾ · Year ▾ · ›; switchers swap the day grid for a 3×4 month or year grid in the same width'], ['Calendar', 'Monday first, today bold, selected filled, 32px cells (40px in the phone modal)'], ['Keys', 'arrows move a day/week, PageUp/PageDown a month, Enter picks, Esc backs out'], ['Surface', 'popover 288px on desktop; bottom-sheet modal on phones'], ['Footer', 'Today · Clear']], variants: 'single · range (two pickers) · min/max', used: 'Filters, schedules',
      demo: `<div class="grid max-w-xs gap-2"><DatePicker v-model="s.date" label="Due date"/><p class="text-xs text-muted-foreground">Selected: {{ s.date || 'none' }}</p></div>` },
    { name: 'Drafts', ui: 'DraftBanner, DraftStatus, My drafts (useFormDraft)', tag: 'Feedback', specs: [['Autosave', '4s after the last change, to the server'], ['Footer', 'Saving… / Draft saved 12:41 / Unsaved changes + Save draft'], ['Create', '"You have 2 drafts" → picker: Resume, Delete'], ['Edit', 'warning banner: unsaved changes from 2 hours ago · Discard · Restore'], ['Never', 'secrets, one-shot dialogs, wizards']], variants: 'create · edit', used: 'New location, location details; every create/edit form',
      demo: `<div class="grid max-w-lg gap-3"><div class="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm"><Icon name="History" :size="15" class="text-muted-foreground"/><span class="flex-1">You have 2 drafts for this form.</span><Button size="sm" variant="outline" class="h-7">View drafts</Button></div><div class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm"><Icon name="History" :size="15" class="text-warning"/><span class="flex-1">You have unsaved changes from 2 hours ago.</span><Button size="sm" variant="outline" class="h-7 bg-background">Discard</Button><Button size="sm" class="h-7">Restore</Button></div><div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span class="flex items-center gap-1.5"><Icon name="LoaderCircle" :size="13" class="animate-spin"/>Saving draft…</span><span class="flex items-center gap-1.5"><Icon name="Check" :size="13" class="text-c1"/>Draft saved 12:41</span><Button variant="outline" size="sm" @click="G.myDrafts=true"><Icon name="FilePen" :size="14"/>Open My drafts</Button></div></div>` },
    { name: 'Core module page', ui: 'Details header, DetailsTabs, Overview cards, RelatedLink, DeleteDialog', tag: 'Navigation', specs: [['Header', 'breadcrumb · icon tile 44px · title 24px · code + type + status'], ['Buttons', 'Refresh · Edit · primary action · More (⋮); delete lives in More'], ['Tabs', 'Overview first, History last; state in ?tab='], ['Overview', 'icon + label + value grids in cards; Timeline card with created/updated and by whom'], ['Related', 'link opens the target panel in a sheet with View full page'], ['Delete', 'dependency check, then type YES']], variants: 'full page · embedded preview', used: 'Locations (reference), every core module',
      demo: `<div class="grid gap-3 rounded-xl border bg-background p-3 text-sm"><p class="text-xs text-muted-foreground">Locations › Northern Zone › <span class="text-foreground">Arusha Branch</span></p><div class="flex flex-wrap items-center justify-between gap-2"><div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon name="Store" :size="20"/></span><div><p class="text-lg font-semibold leading-tight">Arusha Branch</p><p class="text-xs text-muted-foreground"><span class="font-mono">ARU-01</span> · Branch · Active</p></div></div><div class="flex gap-1.5"><Button variant="ghost" size="sm"><Icon name="RefreshCw" :size="15"/>Refresh</Button><Button variant="outline" size="sm"><Icon name="Pencil" :size="14"/>Edit</Button><Button variant="outline" size="icon-sm" aria-label="More"><Icon name="EllipsisVertical" :size="15"/></Button></div></div><Tabs model-value="o" :items="[{value:'o',label:'Overview'},{value:'d',label:'Details'},{value:'u',label:'Users',count:2},{value:'h',label:'History'}]"/><div class="flex flex-wrap gap-2"><Button size="sm" variant="outline" @click="G.locId='aru'; G.route='location'">Open the real page</Button><Button size="sm" variant="destructive" @click="s.del=true"><Icon name="Trash2" :size="14"/>Delete gate</Button></div><DeleteDialog v-model:open="s.del" name="Kibaha Shop" :deps="[{icon:'Users',label:'1 person assigned here (assignments are removed)'}]" @confirm="s.del=false; G.toast('Deleted (demo)','','Trash2')"/></div>` },
    { name: 'Top-bar search', ui: 'HeaderSearch (Combobox + portal)', tag: 'Navigation', specs: [['Box', 'max 384px, 36px, scope chip on the right (Forms, Users…)'], ['List mode', 'filters the list in place; strip shows the match count + Search everywhere'], ['Parent mode', 'details pages: top matches of the parent module'], ['Global', 'Dashboard: groups of 5 with See all'], ['Phone', 'icon → full-width bar; global results full screen'], ['Keys', '↑ ↓ Enter Esc, Ctrl/⌘K']], variants: 'list · parent · global · phone', used: 'Top bar on every searchable page',
      demo: `<div class="grid max-w-md gap-2 text-sm"><div class="relative"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><div class="flex h-9 items-center rounded-md border border-input pl-8 pr-2 text-muted-foreground shadow-sm">Search forms<span class="ml-auto rounded border bg-muted px-1.5 text-[10px]">Forms</span></div></div><div class="rounded-lg border p-1.5 shadow-sm"><p class="px-2 py-1 text-xs text-muted-foreground">3 forms match "staff" · shown below</p><div class="-mx-1.5 my-1 h-px bg-border"></div><p class="flex items-center gap-2 rounded-md bg-accent px-2 py-2"><Icon name="Globe" :size="15" class="text-muted-foreground"/>Search everywhere for "staff"</p></div></div>` },
    { name: 'Organisation switcher', ui: 'OrgSwitcher (Popover)', tag: 'Navigation', specs: [['Trigger', 'avatar 32px, name 14/600, role · address 12px'], ['Popover', '288px, portalled, opens right of the rail when collapsed'], ['Row', 'avatar, name, role · form count, check or ⌥n shortcut'], ['Footer', 'Create organisation']], variants: 'expanded · rail', used: 'Sidebar top',
      demo: `<div class="w-64 rounded-lg border bg-popover p-1.5 shadow-md"><p class="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your organisations</p><div class="flex items-center gap-2.5 rounded-md bg-accent p-2"><span class="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">K</span><span class="min-w-0 flex-1"><span class="block text-sm font-medium">Kilima Retail</span><span class="block text-xs text-muted-foreground">Owner · 8 forms</span></span><Icon name="Check" :size="15" class="text-primary"/></div></div>` },
    { name: 'View as banner', ui: 'ViewAsBanner, ViewAsDialog', tag: 'Feedback', specs: [['Banner', 'warning tint, 36px, eye icon, who · role · location · read-only, Exit'], ['Header', 'Exit view button stays visible while scrolling'], ['Dialog', 'person list with role and primary location, start location select, audit note']], variants: '—', used: 'Everywhere while viewing as',
      demo: `<div class="flex flex-wrap items-center gap-3 rounded-md border border-warning/40 bg-warning/15 px-3 py-2 text-sm"><Icon name="Eye" :size="16" class="text-warning"/><p class="min-w-0 flex-1"><span class="font-semibold">Viewing as Hamisi Swai</span><span class="text-muted-foreground"> · Viewer · Branch supervisor at Arusha Branch · read-only</span></p><Button size="sm" variant="outline" class="h-7 bg-background"><Icon name="LogOut" :size="13"/>Exit</Button></div>` },
    { name: 'Approval steps', ui: 'ApprovalSteps, ApproveDialog', tag: 'Data', specs: [['Step', '32px state circle (done teal, waiting amber, rejected red), name 14/500, rule 12px muted'], ['Approvers', 'chips with initials + why (role at which location)'], ['Escalation', 'amber chip when nobody holds the role at the location chain'], ['Decision', 'tinted card: who, decision, delegated-by note, quoted comment'], ['Compact', 'row dots, 20×6px each']], variants: 'full timeline · compact dots', used: 'Approvals inbox and request page',
      demo: `<div class="grid gap-4"><ApprovalSteps :req="s.req" compact/><ApprovalSteps :req="s.req"/></div>` },
  ];

  const DesignPage = {
    setup() {
      const D = reactive({ tab: 'foundations', q: '', tag: 'All', play: {}, vals: {}, rq: '' });
      const rulesShown = computed(() => { const q = D.rq.trim().toLowerCase(); return !q ? RULES : RULES.filter(r => (r.title + ' ' + r.text).toLowerCase().includes(q)); });
      function goRule(id) { const el = document.getElementById('rule-' + id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      function readTokens() { const cs = getComputedStyle(document.documentElement); DS_TOKENS.forEach(t => D.vals[t.name] = cs.getPropertyValue('--' + t.name).trim()); }
      onMounted(readTokens); watch(() => G.theme, () => nextTick(readTokens));
      const mq = window.matchMedia('(prefers-color-scheme: dark)'); const onMq = () => readTokens(); mq.addEventListener('change', onMq); onBeforeUnmount(() => mq.removeEventListener('change', onMq));
      const tags = ['All', ...new Set(DS_COMPONENTS.map(c => c.tag))];
      const comps = computed(() => DS_COMPONENTS.filter(c => (D.tag === 'All' || c.tag === D.tag) && (!D.q || (c.name + c.ui + c.used).toLowerCase().includes(D.q.toLowerCase()))));
      const demoState = reactive({ text: '', sel: 'single_choice', sel2: 'a', cb: true, sw: true, rd: 'a', tab: 'r', dlg: false, sheet: false, grow: true, files: [], file1: 'm2', api1: 'aru', api2: ['kko', 'mlc'], ward: 'Kati', rich: '<p>Entrance faces <strong>Sokoine Road</strong>.</p><ul><li>Parking behind the building</li></ul>', date: '2026-10-10', del: false, fail: false, req: REQS.k[0], log: SELECT_LOG,
        loadRecord() { ['mwz', 'kko', 'shy', 'zz9'].forEach(id => delete LABELS[lkey('locations', id)]); delete LABELS[lkey('wards', 'Mawenzi')]; demoState.api1 = ''; demoState.api2 = []; demoState.ward = ''; setTimeout(() => { demoState.api1 = 'mwz'; demoState.api2 = ['kko', 'shy', 'zz9']; demoState.ward = 'Mawenzi'; }, 50); },
        list: markRaw(useList({ noun: 'samples', rows: () => [{ n: 'Alpha', k: 'a', v: 12 }, { n: 'Bravo', k: 'b', v: 40 }, { n: 'Charlie', k: 'a', v: 7 }, { n: 'Delta', k: 'c', v: 88 }, { n: 'Echo', k: 'b', v: 23 }, { n: 'Foxtrot', k: 'c', v: 61 }], search: (r, q) => r.n.toLowerCase().includes(q), sorts: [{ value: 'n', label: 'Name', get: r => r.n }, { value: 'v', label: 'Value', get: r => r.v }], fields: [{ key: 'k', label: 'Kind', type: 'select', options: [{ value: 'a', label: 'Kind A' }, { value: 'b', label: 'Kind B' }, { value: 'c', label: 'Kind C' }], get: r => r.k }, { key: 'v', label: 'Value', type: 'number', get: r => r.v }] })),
        q2: '', lq: 'all', list2: markRaw(useList({ noun: 'samples', query: () => demoState.q2, rows: () => [{ n: 'Alpha', k: 'a', v: 12 }, { n: 'Bravo', k: 'b', v: 40 }, { n: 'Charlie', k: 'a', v: 7 }, { n: 'Delta', k: 'c', v: 88 }, { n: 'Echo', k: 'b', v: 23 }, { n: 'Foxtrot', k: 'c', v: 61 }], search: (r, q) => r.n.toLowerCase().includes(q), sorts: [{ value: 'n', label: 'Name', get: r => r.n }, { value: 'v', label: 'Value', get: r => r.v }], fields: [{ key: 'k', label: 'Kind', type: 'select', options: [{ value: 'a', label: 'Kind A' }, { value: 'b', label: 'Kind B' }, { value: 'c', label: 'Kind C' }], get: r => r.k }, { key: 'v', label: 'Value', type: 'number', get: r => r.v }] })) });
      watch(() => demoState.fail, v => { API_FAIL.value = v; });
      const demos = Object.fromEntries(DS_COMPONENTS.map(c => [c.name, markRaw({ template: c.demo, setup() { return { s: demoState, G, exportList, setTimeout: (f, t) => setTimeout(f, t) }; } })]));
      function play(k) { D.play[k] = false; requestAnimationFrame(() => requestAnimationFrame(() => D.play[k] = true)); }
      const hslToHex = (v) => { const m = (v || '').match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/); if (!m) return ''; const h = +m[1], s = m[2] / 100, l = m[3] / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
      const isDark = computed(() => G.theme === 'dark' || (G.theme === 'system' && mq.matches));
      return { API: COMPONENT_API, RULES, rulesShown, goRule, D, G, tags, comps, demos, play, hslToHex, isDark, ACCENTS, DS_TOKENS, DS_TYPE, DS_SPACE, DS_RADIUS, DS_SHADOW, DS_MOTION, DS_BP, DS_Z, DS_ICON };
    },
    template: `<div class="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3"><div><h2 class="text-xl font-semibold tracking-tight">Design system</h2><p class="text-sm text-muted-foreground">Tokens, type, spacing and components behind every screen. Values match shadcn-vue + Tailwind.</p></div>
        <div class="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground"><Icon :name="isDark ? 'Moon' : 'Sun'" :size="13"/>Showing {{ isDark ? 'dark' : 'light' }} theme values<Button variant="ghost" size="sm" class="h-7" @click="G.theme = isDark ? 'light' : 'dark'">Switch</Button></div></div>
      <div class="-mx-1 overflow-x-auto px-1"><Tabs v-model="D.tab" :items="[{value:'foundations',label:'Foundations'},{value:'components',label:'Components',count:comps.length},{value:'layout',label:'Layout rules'},{value:'rules',label:'Rules',count:RULES.length}]"/></div>

      <!-- FOUNDATIONS -->
      <template v-if="D.tab==='foundations'">
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <h3 class="font-semibold">Colour tokens</h3><p class="text-sm text-muted-foreground">HSL CSS variables. Light and dark are separate steps of the same palette.</p>
          <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="t in DS_TOKENS" :key="t.name" class="flex items-center gap-3 rounded-lg border p-2">
              <span class="h-10 w-10 shrink-0 rounded-md border" :style="{ background: 'hsl(var(--' + t.name + '))' }"></span>
              <div class="min-w-0"><p class="truncate font-mono text-xs font-medium">--{{ t.name }}</p><p class="truncate font-mono text-[11px] text-muted-foreground">{{ D.vals[t.name] }} · {{ hslToHex(D.vals[t.name]) }}</p><p class="truncate text-[11px] text-muted-foreground">{{ t.use }}</p></div>
            </div></div>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <div><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form accents (per form, respondent view)</p>
              <div class="mt-2 flex flex-wrap gap-2"><div v-for="(a, k) in ACCENTS" :key="k" class="form-theme flex items-center gap-2 rounded-lg border p-1.5 pr-3 text-xs" :style="{ '--fa-l': a.l, '--fa-d': a.d }"><span class="h-7 w-7 rounded-md bg-fa"></span>{{ a.label }}</div></div></div>
            <div><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chart palette (fixed order, validated)</p>
              <div class="mt-2 flex flex-wrap gap-2"><div v-for="(c, i) in ['c1','c2','c3','c4','c5','c-other']" :key="c" class="flex items-center gap-2 rounded-lg border p-1.5 pr-3 text-xs"><span class="h-7 w-7 rounded-md" :style="{ background: 'var(--' + c + ')' }"></span>{{ ['1 Teal','2 Amber','3 Blue','4 Rose','5 Violet','Other'][i] }}</div></div>
              <p class="mt-2 text-[11px] text-muted-foreground">Passes colour-blind separation and 3:1 contrast in both themes. Max 5 series, then "Other".</p></div>
          </div>
        </section>

        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:60ms">
          <h3 class="font-semibold">Typography</h3><p class="text-sm text-muted-foreground">Geist for everything, Geist Mono for codes. Headings use text-wrap: balance; numbers in columns use tabular figures.</p>
          <div class="mt-4 divide-y rounded-lg border">
            <div v-for="t in DS_TYPE" :key="t.role" class="grid gap-1 p-3 md:grid-cols-[9rem_minmax(0,1fr)_12rem] md:items-center md:gap-4">
              <div><p class="text-sm font-medium">{{ t.role }}</p><p class="text-[11px] text-muted-foreground tabular-nums">{{ t.px }}px · {{ t.w }}</p></div>
              <p :class="[t.cls, 'min-w-0 truncate']">{{ t.sample }}</p>
              <div class="min-w-0"><code class="block truncate font-mono text-[11px] text-muted-foreground">{{ t.cls }}</code><p class="truncate text-[11px] text-muted-foreground">{{ t.use }}</p></div>
            </div></div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:120ms">
            <h3 class="font-semibold">Spacing</h3><p class="text-sm text-muted-foreground">4px base (Tailwind scale). Use gap on flex/grid, not margins.</p>
            <div class="mt-4 grid gap-1.5">
              <div v-for="sp in DS_SPACE" :key="sp[0]" class="grid grid-cols-[3rem_3rem_minmax(0,1fr)] items-center gap-3 text-xs"><code class="font-mono text-muted-foreground">{{ sp[0] }}</code><span class="tabular-nums">{{ sp[1] }}px</span><span class="h-3 rounded-sm bg-primary/70" :style="{ width: sp[1] * 2 + 'px', maxWidth: '100%' }"></span></div>
            </div>
          </section>
          <section class="kpi grid content-start gap-5 rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:150ms">
            <div><h3 class="font-semibold">Radius</h3><p class="text-sm text-muted-foreground">Base --radius: 0.6rem.</p>
              <div class="mt-3 grid grid-cols-5 gap-2"><div v-for="r in DS_RADIUS" :key="r[0]" class="text-center"><div class="mx-auto h-12 w-full max-w-[3.5rem] border-2 border-primary/60 bg-primary/10" :class="r[0]"></div><p class="mt-1 font-mono text-[10px]">{{ r[0].replace('rounded-','') }}</p><p class="text-[10px] text-muted-foreground">{{ r[2] }}</p></div></div>
              <ul class="mt-2 grid gap-0.5 text-[11px] text-muted-foreground"><li v-for="r in DS_RADIUS" :key="'u'+r[0]"><code class="font-mono">{{ r[0] }}</code>: {{ r[3] }}</li></ul></div>
            <div><h3 class="font-semibold">Shadows</h3>
              <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div v-for="sh in DS_SHADOW" :key="sh[0]" class="rounded-lg border bg-background p-3 text-center" :class="sh[0]"><p class="font-mono text-[11px]">{{ sh[0] }}</p><p class="mt-1 text-[10px] text-muted-foreground">{{ sh[1] }}</p></div></div></div>
            <div><h3 class="font-semibold">Icons</h3><p class="text-sm text-muted-foreground">lucide-vue-next, 2px stroke, round caps.</p>
              <div class="mt-3 flex flex-wrap items-end gap-4"><div v-for="ic in DS_ICON" :key="ic[0]" class="text-center"><Icon name="ClipboardList" :size="ic[0]" class="mx-auto"/><p class="mt-1 text-[11px] tabular-nums">{{ ic[0] }}</p></div></div>
              <ul class="mt-2 grid gap-0.5 text-[11px] text-muted-foreground"><li v-for="ic in DS_ICON" :key="'i'+ic[0]"><span class="tabular-nums">{{ ic[0] }}px</span>: {{ ic[1] }}</li></ul></div>
          </section>
        </div>

        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:180ms">
          <h3 class="font-semibold">Motion</h3><p class="text-sm text-muted-foreground">All motion turns off with prefers-reduced-motion. Press play to preview.</p>
          <div class="mt-4 divide-y rounded-lg border">
            <div v-for="m in DS_MOTION" :key="m[0]" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3 md:grid-cols-[minmax(0,1fr)_6rem_12rem_9rem]">
              <p class="text-sm">{{ m[0] }}</p>
              <p class="hidden text-xs tabular-nums md:block">{{ m[1] }} ms</p>
              <code class="hidden truncate font-mono text-[11px] text-muted-foreground md:block">{{ m[2] }}</code>
              <div class="flex items-center justify-end gap-2">
                <span class="relative h-6 w-20 overflow-hidden rounded bg-muted">
                  <span class="absolute inset-y-1 left-1 w-4 rounded-sm bg-primary" :style="{ transform: D.play[m[0]] ? 'translateX(56px)' : 'none', transition: D.play[m[0]] ? 'transform ' + String(m[1]).split(' ')[0] + 'ms ' + m[2] : 'none' }"></span></span>
                <Button variant="ghost" size="icon-sm" @click="play(m[0])" :aria-label="'Play ' + m[0]"><Icon name="Play" :size="14"/></Button></div>
            </div></div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:210ms">
            <h3 class="font-semibold">Breakpoints</h3><p class="text-sm text-muted-foreground">Mobile first. Container queries inside respondent forms (560px).</p>
            <ul class="mt-3 grid gap-2"><li v-for="b in DS_BP" :key="b[0]" class="grid grid-cols-[3.5rem_4.5rem_minmax(0,1fr)] gap-3 text-sm"><code class="font-mono text-xs">{{ b[0] }}</code><span class="text-xs tabular-nums text-muted-foreground">{{ b[1] }}</span><span class="text-xs">{{ b[2] }}</span></li></ul>
          </section>
          <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:240ms">
            <h3 class="font-semibold">Layers (z-index)</h3><p class="text-sm text-muted-foreground">Overlays always portal to the body (D9).</p>
            <ul class="mt-3 grid gap-1.5"><li v-for="z in DS_Z" :key="z[0]" class="flex items-center gap-3 text-sm"><span class="h-2 rounded-full bg-primary/60" :style="{ width: (z[1] / 120 * 100) + 'px' }"></span><span class="flex-1">{{ z[0] }}</span><code class="font-mono text-xs tabular-nums text-muted-foreground">z-{{ z[1] }}</code></li></ul>
          </section>
        </div>
      </template>

      <!-- COMPONENTS -->
      <template v-else-if="D.tab==='components'">
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative min-w-0 flex-1 basis-56"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-8" v-model="D.q" placeholder="Search components"/></div>
          <div class="-mx-1 max-w-full overflow-x-auto px-1"><div class="inline-flex rounded-md bg-muted p-0.5 text-xs" role="radiogroup" aria-label="Category"><button v-for="t in tags" :key="t" type="button" role="radio" :aria-checked="D.tag===t" @click="D.tag=t" :class="['h-7 whitespace-nowrap rounded px-2.5 font-medium', D.tag===t ? 'bg-background shadow' : 'text-muted-foreground']">{{ t }}</button></div></div>
        </div>
        <div class="grid grid-cols-[minmax(0,1fr)] gap-3 xl:grid-cols-2">
          <article v-for="(c, i) in comps" :key="c.name" :class="['kpi min-w-0 rounded-xl border bg-card shadow-sm', ['API select', 'Core module page', 'List toolbar · Filters'].includes(c.name) && 'xl:col-span-2']" :style="{ animationDelay: (i*40)+'ms' }">
            <header class="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3"><div class="min-w-0"><h3 class="text-sm font-semibold">{{ c.name }}</h3><code class="font-mono text-[11px] text-muted-foreground">{{ c.ui }}</code></div><Badge variant="outline">{{ c.tag }}</Badge></header>
            <div class="border-b bg-canvas/60 px-4 py-5"><component :is="demos[c.name]"/></div>
            <dl class="grid gap-1.5 px-4 py-3 text-xs">
              <div v-for="sp in c.specs" :key="sp[0]" class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt class="text-muted-foreground">{{ sp[0] }}</dt><dd>{{ sp[1] }}</dd></div>
              <div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt class="text-muted-foreground">Variants</dt><dd>{{ c.variants }}</dd></div>
              <div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt class="text-muted-foreground">Used in</dt><dd>{{ c.used }}</dd></div>
            </dl>
            <details v-if="API[c.name]" class="group border-t text-xs">
              <summary class="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 font-medium hover:bg-muted/40"><Icon name="Code" :size="13" class="text-muted-foreground"/>API and usage rules<span class="ml-auto font-mono text-[11px] text-muted-foreground">{{ API[c.name].file.split(' ')[0] }}</span><Icon name="ChevronDown" :size="13" class="transition-transform group-open:rotate-180"/></summary>
              <div class="grid gap-3 px-4 pb-4">
                <div v-if="API[c.name].props.length" class="overflow-x-auto rounded-md border"><table class="w-full min-w-[460px]"><thead><tr class="border-b text-left text-muted-foreground"><th class="px-2 py-1.5 font-medium">Prop</th><th class="px-2 py-1.5 font-medium">Type</th><th class="px-2 py-1.5 font-medium">Default</th><th class="px-2 py-1.5 font-medium">Notes</th></tr></thead>
                  <tbody><tr v-for="pr in API[c.name].props" :key="pr[0]" class="border-b last:border-0 align-top"><td class="px-2 py-1.5 font-mono">{{ pr[0] }}</td><td class="px-2 py-1.5 font-mono text-muted-foreground">{{ pr[1] }}</td><td class="px-2 py-1.5 font-mono">{{ pr[2] || '–' }}</td><td class="px-2 py-1.5 text-muted-foreground">{{ pr[3] }}</td></tr></tbody></table></div>
                <dl class="grid gap-1.5">
                  <div v-if="API[c.name].emits.length" class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt class="text-muted-foreground">Emits</dt><dd><span v-for="e in API[c.name].emits" :key="e[0]" class="mr-2 inline-block"><code class="font-mono">{{ e[0] }}</code><span v-if="e[1]" class="text-muted-foreground"> ({{ e[1] }})</span></span></dd></div>
                  <div v-if="API[c.name].slots.length" class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt class="text-muted-foreground">Slots</dt><dd><span v-for="sl in API[c.name].slots" :key="sl[0]" class="mr-2 inline-block"><code class="font-mono">#{{ sl[0] }}</code><span v-if="sl[1]" class="text-muted-foreground"> {{ sl[1] }}</span></span></dd></div></dl>
                <div class="grid gap-2 sm:grid-cols-2"><ul class="grid gap-1"><li v-for="d in API[c.name].do" :key="d" class="flex gap-1.5"><Icon name="Check" :size="13" class="mt-0.5 shrink-0 text-c1"/>{{ d }}</li></ul><ul class="grid gap-1"><li v-for="d in API[c.name].dont" :key="d" class="flex gap-1.5"><Icon name="X" :size="13" class="mt-0.5 shrink-0 text-destructive"/>{{ d }}</li></ul></div>
              </div></details>
          </article>
        </div>
        <p v-if="!comps.length" class="py-8 text-center text-sm text-muted-foreground">No components match "{{ D.q }}".</p>
      </template>

      <!-- LAYOUT RULES -->
      <template v-else-if="D.tab==='layout'">
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <h3 class="font-semibold">Page layout</h3>
          <div class="mt-4 overflow-x-auto"><table class="w-full min-w-[560px] text-sm"><thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="py-2 pr-3 font-medium">Element</th><th class="py-2 pr-3 font-medium">Phone</th><th class="py-2 pr-3 font-medium">≥ 640</th><th class="py-2 font-medium">Classes</th></tr></thead>
            <tbody class="divide-y">
              <tr v-for="r in [['Page gutter','12px','20px','px-3 sm:px-5'],['Page top / bottom','16px / 96px (clears bottom bar)','16px / 40px','pt-4 pb-24 lg:pb-10'],['Content max width','100%','1040–1200px admin · 720px builder · 680px respondent','max-w-[1200px] mx-auto'],['Header height','56px','56px','h-14'],['Card padding','16px','20px','p-4 sm:p-5'],['KPI tile padding','14px','14px','p-3.5'],['Gap between cards','8–12px','12px','gap-2 / gap-3'],['Gap inside a card','12px','16px','gap-3 sm:gap-4'],['Form field: label to input','6px','6px','gap-1.5'],['Section heading to content','12–16px','16px','mt-3 / mt-4'],['Touch target (respondent)','44px min','44px min','min-h-11'],['Touch target (admin)','36px','36px','h-9']]" :key="r[0]">
                <td class="py-2 pr-3 font-medium">{{ r[0] }}</td><td class="py-2 pr-3 text-muted-foreground">{{ r[1] }}</td><td class="py-2 pr-3 text-muted-foreground">{{ r[2] }}</td><td class="py-2"><code class="font-mono text-[11px]">{{ r[3] }}</code></td></tr></tbody></table></div>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:60ms">
          <h3 class="font-semibold">Anatomy of a card</h3><p class="text-sm text-muted-foreground">Measurements of the standard admin card.</p>
          <div class="mt-4 flex flex-col items-start gap-6 md:flex-row">
            <div class="relative w-full max-w-sm rounded-xl border bg-card shadow-sm" style="background-image:repeating-linear-gradient(0deg,transparent,transparent 19px,hsl(var(--border)/.5) 20px)">
              <div class="m-0 border-2 border-dashed border-primary/50 p-4 sm:p-5"><div class="grid gap-3 border-2 border-dashed border-warning/60 bg-card"><p class="text-sm font-semibold">Card title · 14/600</p><p class="text-xs text-muted-foreground">Meta line · 12/400 muted</p><div class="h-10 rounded-md bg-muted"></div><div class="flex justify-end gap-2"><span class="h-8 w-16 rounded-md bg-muted"></span><span class="h-8 w-20 rounded-md bg-primary"></span></div></div></div>
            </div>
            <ul class="grid gap-2 text-sm">
              <li class="flex items-center gap-2"><span class="h-3 w-3 border-2 border-dashed border-primary/60"></span>Padding 16px, 20px from 640px</li>
              <li class="flex items-center gap-2"><span class="h-3 w-3 border-2 border-dashed border-warning/70"></span>Content stack, 12px gap</li>
              <li class="flex items-center gap-2"><Icon name="Square" :size="13" class="text-muted-foreground"/>Radius xl (~14px), 1px border, shadow-sm</li>
              <li class="flex items-center gap-2"><Icon name="MousePointerClick" :size="13" class="text-muted-foreground"/>Actions bottom-right, primary last</li>
              <li class="flex items-center gap-2"><Icon name="Layers" :size="13" class="text-muted-foreground"/>Hover: shadow-md, lift −2px (clickable cards only)</li>
            </ul>
          </div>
        </section>
        <section class="kpi rounded-xl border bg-card p-4 shadow-sm sm:p-5" style="animation-delay:120ms">
          <h3 class="font-semibold">Writing and content</h3>
          <ul class="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>Buttons say what happens: "Publish", "Grant 5 permissions", then a toast confirms.</li>
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>Errors say what went wrong and how to fix it, no apologies.</li>
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>Sentence case everywhere; uppercase only for 11px group labels.</li>
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>Dates as "10 Oct 2026, 16:48" (en-GB), East Africa Time.</li>
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>State shown with an icon + word, never colour alone.</li>
            <li class="flex gap-2"><Icon name="Check" :size="15" class="mt-0.5 text-c1"/>Name things the way users know them: "Users", not "organization_users".</li>
          </ul>
        </section>
      </template>

      <!-- RULES (generated from FRONTEND_RULES.md at build time, D27) -->
      <template v-if="D.tab==='rules'">
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative w-full sm:w-72"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-8" v-model="D.rq" placeholder="Find a rule"/></div>
          <p class="text-xs text-muted-foreground">Same text as FRONTEND_RULES.md and the rules doc. Change all three together.</p>
        </div>
        <div class="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] [&>*]:min-w-0">
          <nav class="hidden lg:block" aria-label="Rule sections"><div class="sticky top-20 grid gap-0.5">
            <a v-for="r in RULES" :key="r.id" :href="'#rule-' + r.id" @click.prevent="goRule(r.id)" class="truncate rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">{{ r.title }}</a></div></nav>
          <div class="grid grid-cols-[minmax(0,1fr)] gap-3">
            <section v-for="(r, i) in rulesShown" :key="r.id" :id="'rule-' + r.id" class="kpi min-w-0 scroll-mt-20 rounded-xl border bg-card p-4 shadow-sm sm:p-5" :style="{ animationDelay: (i*40)+'ms' }">
              <h3 class="flex items-center gap-2 font-semibold"><span :class="['rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', r.title.startsWith('Locked') ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground']">{{ r.title.startsWith('Locked') ? 'Locked' : r.title.startsWith('Constrained') ? 'Tiers' : 'Guide' }}</span>{{ r.title.replace(/^Locked: /, '') }}</h3>
              <div class="rules-prose mt-2" v-html="r.html"></div>
            </section>
            <p v-if="!rulesShown.length" class="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No rule mentions "{{ D.rq }}".</p>
          </div>
        </div>
      </template>
    </div>`
  };

  /* ---------- No access (D12: server returns 403 when the menu's permission is missing) */
  const NoAccessPage = {
    setup() {
      const leaf = computed(() => findLeaf(G.view));
      const sent = ref(false);
      function request() { sent.value = true; G.toast('Access requested', 'Owners and admins of ' + G.org.name + ' get a notification.', 'Send'); }
      return { leaf, sent, request, G, permLabel };
    },
    template: `<div class="mx-auto grid max-w-lg place-items-center py-16 text-center">
      <span class="kpi grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground"><Icon name="Lock" :size="24"/></span>
      <h2 class="mt-5 text-xl font-semibold tracking-tight">You don't have access to {{ leaf ? leaf.label : 'this page' }}</h2>
      <p class="mt-2 text-sm text-muted-foreground">It needs the permission <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{{ leaf && leaf.perm }}</code> ({{ leaf && permLabel(leaf.perm) }}). Your role in {{ G.org.name }} doesn't include it.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-2"><Button :disabled="sent" @click="request"><Icon :name="sent ? 'Check' : 'Send'" :size="14"/>{{ sent ? 'Request sent' : 'Request access' }}</Button><Button variant="outline" @click="nav('forms')">Go to forms</Button></div>
      <p class="mt-6 text-xs text-muted-foreground">Error 403 · the server checks the same permission as the menu.</p>
    </div>`
  };

  /* ---------- Placeholder page for menu items not designed yet */
  const PlaceholderPage = {
    setup() {
      const leaf = computed(() => findLeaf(G.view));
      const parent = computed(() => parentOf(G.view));
      const group = computed(() => parent.value && parent.value.groups.find(g => g.items.includes(leaf.value)));
      return { leaf, parent, group };
    },
    template: `<div v-if="leaf" class="mx-auto grid max-w-[980px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb"><template v-if="parent"><span>{{ parent.label }}</span><Icon name="ChevronRight" :size="12"/><template v-if="group && group.label"><span>{{ group.label }}</span><Icon name="ChevronRight" :size="12"/></template></template><span class="font-medium text-foreground">{{ leaf.label }}</span></nav>
      <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="leaf.icon" :size="20"/></span><h2 class="text-xl font-semibold tracking-tight">{{ leaf.label }}</h2></div>
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4"><div v-for="n in 4" :key="n" class="kpi h-20 rounded-xl border bg-card" :style="{ animationDelay: (n*50)+'ms' }"></div></div>
      <div class="kpi grid place-items-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center" style="animation-delay:200ms">
        <Icon :name="leaf.icon" :size="24" class="text-muted-foreground"/><p class="mt-3 font-medium">{{ leaf.label }} is a placeholder</p>
        <p class="mt-1 max-w-sm text-sm text-muted-foreground">This screen exists to show navigation. Its design comes in a later iteration.</p></div>
    </div>`
  };

  /* ---------- Shell frame */
  const ShellView = {
    setup() {
      const notifBase = [{ label: 'Export ready: Supplier Evaluation Q3 (xlsx)', icon: 'FileSpreadsheet' }, { label: '12 new responses on Customer Service Assessment Q4', icon: 'Inbox' }, { label: 'Rehema has not turned on two-step verification', icon: 'ShieldAlert' }];
      const notif = computed(() => [...G.appNotifs.slice(0, 5).map(n => ({ id: n.id, label: n.label, icon: n.icon, req: n.req })), ...(G.appNotifs.length ? [{ separator: true }] : []), ...notifBase]);
      function onNotif(it) { if (it.req) { const x = G.appNotifs.find(n => n.id === it.id); if (x) x.read = true; G.openReq(it.req); } else G.toast(it.label, '', it.icon); }
      const unread = computed(() => G.appNotifs.filter(n => !n.read).length + 3);
      const userItems = computed(() => [{ id: 'p', label: 'Profile', icon: 'UserRound' }, { id: 'notifs', label: 'Notification settings', icon: 'BellRing' }, { id: 'drafts', label: 'My drafts' + (DRAFTS.filter(d => d.org === G.org.id).length ? ' (' + DRAFTS.filter(d => d.org === G.org.id).length + ')' : ''), icon: 'FilePen' }, { id: '2fa', label: 'Two-step verification: on', icon: 'ShieldCheck' }, { id: 'dev', label: 'Trusted devices (2)', icon: 'MonitorSmartphone' }, { separator: true }, { id: 'out', label: 'Sign out', icon: 'LogOut', destructive: true }]);
      function onUser(it) { if (it.id === 'notifs') { G.myNotifs = true; return; } if (it.id === 'drafts') { G.myDrafts = true; return; } if (it.id === 'out') { G.route = 'login'; G.toast('Signed out', '', 'LogOut'); } else G.toast(it.label, 'Profile screens come later.', 'Info'); }
      function toggleMenu() { if (window.matchMedia('(min-width: 1024px)').matches) G.navCollapsed = !G.navCollapsed; else G.mobileNav = true; }
      const titles = new Proxy({}, { get: (_, r) => r === 'design' ? 'Design system' : r === 'workspace' ? 'Settings' : r === 'members' ? 'Users' : r === 'location' ? ((locById(G.locId) || {}).name || 'Location') : r === 'request' ? ((reqById(G.reqId) || {}).no || 'Request') : r === 'role' ? ((roleById(G.roleId) || {}).name || 'Role') : r === 'approvals' ? 'Approvals' : (findLeaf(r) || {}).label || '' });
      const onKey = (e) => { if (e.altKey && /^Digit[1-9]$/.test(e.code)) { const o = ORGS[+e.code.slice(5) - 1]; if (o) { e.preventDefault(); switchOrg(o.id); } } };
      onMounted(() => document.addEventListener('keydown', onKey));
      onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
      const allowed = computed(() => { const l = findLeaf(G.view === 'location' ? 'locations' : G.view === 'request' ? 'approvals' : G.view === 'role' ? 'roles' : G.view); return !l || !l.perm || myPerms.value.includes(l.perm); });
      return { allowed, G, T, notif, onNotif, unread, userItems, onUser, toggleMenu, titles, canViewAs, exitViewAs, SEARCH_SCOPE };
    },
    template: `
    <div class="flex min-h-screen">
      <!-- desktop sidebar -->
      <aside :class="['sticky top-0 hidden h-screen shrink-0 border-r bg-background transition-[width] duration-200 lg:block', G.navCollapsed ? 'w-16' : 'w-60']" aria-label="Main navigation">
        <div class="flex h-14 items-center gap-2 border-b px-4"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Icon :name="PRODUCT.icon" :size="14"/></span><span v-if="!G.navCollapsed" class="font-semibold tracking-tight">{{ PRODUCT.name }}</span></div>
        <div class="h-[calc(100vh-3.5rem)]"><SideNav :collapsed="G.navCollapsed"/></div>
      </aside>
      <!-- phone sidebar -->
      <Sheet v-model:open="G.mobileNav" side="left">
        <div class="flex h-14 items-center gap-2 border-b px-4"><span class="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground"><Icon :name="PRODUCT.icon" :size="14"/></span><span class="font-semibold">{{ PRODUCT.name }}</span></div>
        <div class="flex-1 overflow-auto"><SideNav/></div>
      </Sheet>

      <div class="flex min-w-0 flex-1 flex-col">
        <ViewAsBanner/>
        <header class="sticky z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur sm:px-3" style="top:env(safe-area-inset-top,0px)">
          <button type="button" @click="toggleMenu" class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :aria-expanded="!G.navCollapsed" aria-label="Menu">
            <Icon name="Menu" :size="20"/><span class="mt-0.5 text-[10px] font-medium leading-none text-muted-foreground">Menu</span></button>
          <h1 class="min-w-0 truncate text-sm font-semibold sm:text-base">{{ titles[G.view] }}</h1>
          <div v-if="SEARCH_SCOPE[G.view]" class="ml-auto hidden w-full max-w-sm md:block"><HeaderSearch :key="G.view"/></div>
          <div v-if="G.mSearch && SEARCH_SCOPE[G.view]" class="absolute inset-0 z-10 flex items-center bg-background px-2 md:hidden"><HeaderSearch phone :key="'m' + G.view"/></div>
          <div class="ml-auto flex items-center gap-1 md:ml-2">
            <Button v-if="SEARCH_SCOPE[G.view]" variant="ghost" size="icon" class="md:hidden" :aria-label="SEARCH_SCOPE[G.view].ph" @click="G.mSearch = true"><Icon name="Search"/></Button>
            <Tooltip v-if="canViewAs()" content="View as a person or role" side="bottom"><Button variant="ghost" size="icon" aria-label="View as someone" @click="G.viewAsPick = true"><Icon name="Eye"/></Button></Tooltip>
            <Button v-if="G.viewAs" variant="outline" size="sm" class="h-8 border-warning/50 text-warning" @click="exitViewAs" :aria-label="'Exit viewing as ' + G.viewAs.name"><Icon name="EyeOff" :size="14"/><span class="hidden sm:inline">Exit view</span></Button>
            <DropdownMenu :items="['light','dark','system'].map(id=>({id,label:id[0].toUpperCase()+id.slice(1),icon:{light:'Sun',dark:'Moon',system:'Laptop'}[id],checked:G.theme===id}))" @select="it=>G.theme=it.id" label="Theme"><template #trigger><Button variant="ghost" size="icon" aria-label="Theme"><Icon :name="G.theme==='dark'?'Moon':G.theme==='light'?'Sun':'Laptop'"/></Button></template></DropdownMenu>
            <DropdownMenu :items="notif" label="Notifications" @select="onNotif"><template #trigger><Button variant="ghost" size="icon" class="relative" :aria-label="'Notifications, ' + unread + ' new'"><Icon name="Bell"/><span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-c1 ring-2 ring-background"></span></Button></template></DropdownMenu>
            <DropdownMenu :items="userItems" @select="onUser" label="Amina Juma">
              <template #trigger><button type="button" class="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account">AJ</button></template></DropdownMenu>
          </div>
        </header>
        <main class="flex-1 px-3 pb-24 pt-4 sm:px-5 lg:pb-10">
          <div v-if="G.switching" class="mx-auto grid max-w-[1200px] gap-4" aria-busy="true" aria-label="Loading organisation">
            <div class="flex items-center gap-3"><div class="h-10 w-10 animate-pulse rounded-md bg-muted"></div><div class="grid gap-2"><div class="h-3 w-24 animate-pulse rounded bg-muted"></div><div class="h-5 w-56 animate-pulse rounded bg-muted"></div></div></div>
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-4"><div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-xl bg-muted/70"></div></div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"><div v-for="n in 6" :key="n" class="h-40 animate-pulse rounded-xl bg-muted/70"></div></div>
          </div>
          <NoAccessPage v-else-if="!allowed"/>
          <DashboardPage v-else-if="G.view==='dashboard'"/>
          <MediaPage v-else-if="G.view==='media'"/>
          <ApprovalsPage v-else-if="G.view==='approvals'"/>
          <RequestPage v-else-if="G.view==='request'"/>
          <RequestTypesPage v-else-if="G.view==='request-types'"/>
          <DelegationsPage v-else-if="G.view==='delegations'"/>
          <FormsList v-else-if="G.view==='forms'"/>
          <TemplatesPage v-else-if="G.view==='templates'"/>
          <MembersPage v-else-if="G.view==='members'"/>
          <WorkspacePage v-else-if="G.view==='workspace'"/>
          <MenusPage v-else-if="G.view==='menus'"/>
          <DesignPage v-else-if="G.view==='design'"/>
          <RolesPage v-else-if="G.view==='roles'"/>
          <RolePage v-else-if="G.view==='role'"/>
          <LocationsPage v-else-if="G.view==='locations'"/>
          <LocationPage v-else-if="G.view==='location'"/>
          <PlaceholderPage v-else/>
        </main>
      </div>
      <NewOrgDialog/>
      <GrantDialog/>
      <ViewAsDialog/>
      <MyDraftsSheet/>
      <NotifPrefsSheet/>
      <NewRequestDialog/>
      <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-3 lg:left-auto lg:right-4 lg:items-end" aria-live="polite">
        <TransitionGroup name="toast"><div v-for="t in T.toasts" :key="t.id" class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-popover p-3.5 text-popover-foreground shadow-lg"><Icon :name="t.icon" class="mt-0.5 text-primary"/><div class="min-w-0"><p class="text-sm font-medium">{{ t.title }}</p><p v-if="t.desc" class="text-xs text-muted-foreground">{{ t.desc }}</p></div></div></TransitionGroup>
      </div>
    </div>`
  };

  const NewOrgDialog = {
    setup() {
      const N = reactive({ name: '', slug: '', touched: false, accent: 'teal' });
      const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      watch(() => N.name, v => { if (!N.touched) N.slug = slugify(v); });
      const taken = computed(() => ORGS.some(o => o.slug === N.slug));
      const ok = computed(() => N.name.trim().length > 1 && N.slug && !taken.value);
      function submit() { if (!ok.value) return; createOrg({ name: N.name.trim(), slug: N.slug, accent: N.accent }); G.newOrg = false; Object.assign(N, { name: '', slug: '', touched: false, accent: 'teal' }); }
      return { G, N, taken, ok, submit, ACCENTS, slugify };
    },
    template: `<Dialog :open="G.newOrg" @update:open="v => G.newOrg = v">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Create an organisation</h2><p class="text-sm text-muted-foreground">A separate workspace with its own forms, members and settings. You become its owner.</p></div>
      <form class="grid gap-4" @submit.prevent="submit">
        <div class="grid gap-1.5"><label for="no-n" class="text-sm font-medium">Name</label><Input id="no-n" v-model="N.name" placeholder="Kilima Logistics"/></div>
        <div class="grid gap-1.5"><label for="no-s" class="text-sm font-medium">Address</label>
          <div :class="['flex h-9 items-center overflow-hidden rounded-md border text-sm shadow-sm', taken ? 'border-destructive' : 'border-input']"><span class="border-r bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">{{ PRODUCT.domain }}/</span><input id="no-s" :value="N.slug" @input="N.touched=true; N.slug=slugify($event.target.value)" class="h-full min-w-0 flex-1 bg-transparent px-2 outline-none"></div>
          <p v-if="taken" class="text-xs text-destructive">That address is already used. Try another.</p></div>
        <div class="grid gap-2"><span class="text-sm font-medium">Brand colour</span><div class="flex flex-wrap gap-2.5">
          <button v-for="(a, k) in ACCENTS" :key="k" type="button" @click="N.accent=k" :aria-label="a.label" :aria-pressed="N.accent===k" class="form-theme grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-background" :class="N.accent===k ? 'ring-2 ring-foreground' : ''" :style="{ '--fa-l': a.l, '--fa-d': a.d, background: 'hsl(var(--form-accent))' }"><Icon v-if="N.accent===k" name="Check" :size="14" class="text-fa-fg"/></button></div></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="G.newOrg=false">Cancel</Button><Button type="submit" :disabled="!ok"><Icon name="Building2" :size="14"/>Create organisation</Button></div>
      </form></Dialog>`
  };

  /* ---------- Forms list */
  const FormsList = {
    setup() {
      const L = reactive({ status: 'all', sort: 'edited', view: 'grid' });
      try { const v = localStorage.getItem(PRODUCT.storageKey + '-forms-view'); if (v) L.view = v; } catch (e) {}
      watch(() => L.view, v => { try { localStorage.setItem(PRODUCT.storageKey + '-forms-view', v) } catch (e) {} });
      const VF = computed(() => FORMS.filter(formVisible));
      const counts = computed(() => ({ all: VF.value.length, live: VF.value.filter(f => f.status === 'live').length, draft: VF.value.filter(f => f.status === 'draft').length, closed: VF.value.filter(f => f.status === 'closed').length, archived: VF.value.filter(f => f.status === 'archived').length }));
      const tabs = computed(() => [{ value: 'all', label: 'All', count: counts.value.all }, { value: 'live', label: 'Live', count: counts.value.live }, { value: 'draft', label: 'Drafts', count: counts.value.draft }, { value: 'closed', label: 'Closed', count: counts.value.closed }, { value: 'archived', label: 'Archived', count: counts.value.archived }]);
      /* D31: toolbar + Filters (simple/advanced) + Sort; status tabs are quick filters kept in sync */
      const STATUS_OPTS = [{ value: 'live', label: 'Live' }, { value: 'draft', label: 'Draft' }, { value: 'closed', label: 'Closed' }, { value: 'archived', label: 'Archived' }];
      const LS = useList({ noun: 'forms', rows: () => VF.value, search: (f, q) => f.title.toLowerCase().includes(q), sort: 'edited', dir: 'desc',
        sorts: [{ value: 'edited', label: 'Last edited', get: f => relToIso(f.edited) }, { value: 'responses', label: 'Responses', get: f => f.responses }, { value: 'name', label: 'Name', get: f => f.title.toLowerCase() }],
        fields: () => [
          { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTS, get: f => f.status },
          { key: 'owner', label: 'Owner', type: 'select_paginated', module: 'members', get: f => (MEMBERS.find(m => m.name === f.owner) || {}).email || f.owner },
          { key: 'loc', label: 'Location', type: 'select_paginated', module: 'locations', get: f => f.loc || '' },
          { key: 'orgwide', label: 'Organisation-wide', type: 'boolean', get: f => f.loc ? 'no' : 'yes' },
          { key: 'audience', label: 'Who can answer', type: 'select', options: [{ value: 'public', label: 'Anyone with the link' }, { value: 'private', label: 'Invited / location only' }], get: f => f.priv ? 'private' : 'public' },
          { key: 'timed', label: 'Timed', type: 'boolean', get: f => f.timed ? 'yes' : 'no' },
          { key: 'responses', label: 'Responses', type: 'number', get: f => f.responses },
          { key: 'edited', label: 'Last edited', type: 'date', get: f => relToIso(f.edited) },
        ] });
      const quick = computed({
        get: () => { const f = LS.S.filters.status; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; },
        set: (v) => LS.setFilter('status', v === 'all' ? null : { op: 'in', value: [v] }),
      });
      const list = computed(() => LS.rows.value);
      watchEffect(() => { if (G.view === 'forms') listCount.value = (G.search || '').trim().length >= 2 ? list.value.length : null; });
      const live = computed(() => VF.value.filter(f => f.status === 'live'));
      const mq = window.matchMedia('(max-width: 639px)'); const isPhone = ref(mq.matches);
      const onMq = (e) => { isPhone.value = e.matches; }; mq.addEventListener('change', onMq); onBeforeUnmount(() => mq.removeEventListener('change', onMq));
      const week = computed(() => { const out = Array(7).fill(0); VF.value.forEach(f => (f.spark || []).slice(-7).forEach((v, i) => out[i] += v)); return out; });
      const flagged = computed(() => VF.value.reduce((a, f) => a + (f.flagged || 0), 0));
      const menu = (f) => !canEdit() ? [
        ...(f.responses ? [{ id: 'res', label: 'Results', icon: 'ChartBarBig' }] : []),
        ...(f.status === 'live' ? [{ id: 'link', label: 'Copy link', icon: 'Link' }, { id: 'live', label: 'Open live form', icon: 'ExternalLink' }] : []),
      ] : [
        { id: 'open', label: f.status === 'draft' ? 'Edit' : 'Open', icon: 'Pencil' },
        ...(f.responses ? [{ id: 'res', label: 'Results', icon: 'ChartBarBig' }] : []),
        ...(f.status === 'live' ? [{ id: 'link', label: 'Copy link', icon: 'Link' }, { id: 'live', label: 'Open live form', icon: 'ExternalLink' }] : []),
        ...(f.status === 'draft' && typeNeeded('Forms.publish', f) ? [{ id: 'reqpub', label: 'Request to publish', icon: 'Stamp' }] : []),
        { id: 'dup', label: 'Duplicate', icon: 'Copy' }, { separator: true },
        { id: 'arch', label: f.status === 'archived' ? 'Restore' : 'Archive', icon: f.status === 'archived' ? 'ArchiveRestore' : 'Archive' },
      ];
      function onMenu(f, it) {
        if (it.id === 'reqpub') newRequest({ type: typeNeeded('Forms.publish', f).id, form: f.id });
        if (it.id === 'open') openForm(f);
        if (it.id === 'res') { nav('responses'); if (!f.sample) G.toast('Prototype opens the sample results', '', 'Info'); }
        if (it.id === 'live') nav('respondent');
        if (it.id === 'link') G.toast('Link copied', 'https://' + PRODUCT.domain + '/f/' + f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30), 'Link');
        if (it.id === 'dup') { FORMS.splice(FORMS.indexOf(f) + 1, 0, { ...f, id: ulid('f'), title: f.title + ' (copy)', status: 'draft', responses: 0, spark: null, closes: 'Not published', edited: 'Just now', sample: false }); G.toast('Form duplicated', 'Saved as a draft.', 'Copy'); }
        if (it.id === 'arch') { f.status = f.status === 'archived' ? 'draft' : 'archived'; G.toast(f.status === 'archived' ? 'Form archived' : 'Form restored', f.title, 'Archive'); }
      }
      const newItems = [{ id: 'blank', label: 'Blank form', icon: 'FilePlus' }, { id: 'tpl', label: 'From a template', icon: 'LayoutTemplate' }];
      function onNew(it) { if (it.id === 'tpl') G.route = 'templates'; else { nav('builder'); G.toast('Prototype opens the sample form', 'A real blank form starts with one empty question.', 'Info'); } }
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });   // P39: search, sort and filters live in the link
      return { isPhone, G, L, tabs, quick, LS, list, STAT, ACCENTS, live, week, flagged, menu, onMenu, newItems, onNew, openForm, FORMS: VF, canEdit, ROLE, locName };
    },
    template: `
    <div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex items-center gap-3"><OrgAvatar :org="G.org" size="lg"/><div><p class="text-sm text-muted-foreground">{{ G.viewAs ? 'As ' + G.viewAs.name + ' sees it' : 'Good afternoon, Amina · ' + ROLE[G.org.role] }}</p><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ G.org.name }} forms</h2></div></div>
        <p v-if="!canEdit()" class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground"><Icon name="Eye" :size="13"/>View only: you can see results but not edit</p>
      </div>

      <!-- overview strip -->
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Live forms</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Radio" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ live.length }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ FORMS.filter(f=>f.status==='draft').length }} drafts waiting</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Responses this week</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Inbox" :size="13"/></span></div><div class="mt-1.5 flex items-end justify-between gap-2"><p class="text-2xl font-semibold tnum">{{ week.reduce((a,b)=>a+b,0) }}</p><Spark v-if="week.some(Boolean)" :data="week" class="h-7 w-20"/></div><p class="mt-1 text-[11px] text-muted-foreground">Across live forms</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Completed normally</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="CircleCheck" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ FORMS.some(f=>f.responses) ? '93.4%' : '–' }}</p><div class="mt-2 h-1.5 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full rounded-full bg-c1 transition-[width] duration-700" :style="{ width: FORMS.some(f=>f.responses) ? '93.4%' : '0%' }"></div></div></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">To review</p><span class="grid h-6 w-6 place-items-center rounded-md bg-warning/15 text-warning"><Icon name="TriangleAlert" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ flagged }}</p><p class="mt-1 text-[11px] text-muted-foreground">Responses with violations</p></div>
      </div>

      <!-- quick filters + toolbar (D31) -->
      <div class="-mb-1 max-w-full overflow-x-auto"><Tabs v-model="quick" :items="tabs"/></div>
      <ListToolbar :list="LS">
        <div class="hidden rounded-md border bg-background p-0.5 sm:inline-flex" role="radiogroup" aria-label="Layout">
          <Tooltip content="Cards" side="bottom"><button type="button" role="radio" :aria-checked="L.view==='grid'" @click="L.view='grid'" aria-label="Cards" :class="['grid h-7 w-7 place-items-center rounded', L.view==='grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground']"><Icon name="LayoutGrid" :size="15"/></button></Tooltip>
          <Tooltip content="Table" side="bottom"><button type="button" role="radio" :aria-checked="L.view==='table'" @click="L.view='table'" aria-label="Table" :class="['grid h-7 w-7 place-items-center rounded', L.view==='table' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground']"><Icon name="Rows3" :size="15"/></button></Tooltip>
        </div>
        <DropdownMenu v-if="canEdit()" :items="newItems" @select="onNew" label="Create"><template #trigger><Button size="sm"><Icon name="Plus" :size="15"/>New form</Button></template></DropdownMenu>
      </ListToolbar>

      <!-- grid -->
      <TransitionGroup v-if="(L.view==='grid' || isPhone) && list.length" name="q" tag="div" :class="['grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0', LS.S.loading && 'pointer-events-none opacity-60']">
        <article v-for="(f, i) in list" :key="f.id" class="kpi form-theme group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" :style="{ '--fa-l': ACCENTS[f.accent].l, '--fa-d': ACCENTS[f.accent].d, animationDelay: (i*40)+'ms' }">
          <div class="h-1 bg-fa"></div>
          <div class="flex flex-1 flex-col p-3.5">
            <div class="relative z-10 flex items-center gap-1.5">
              <span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', STAT[f.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', STAT[f.status].dot]"></span>{{ STAT[f.status].label }}</span>
              <Tooltip v-if="f.timed" content="Timed" side="bottom"><span class="grid h-5 w-5 place-items-center text-muted-foreground"><Icon name="Timer" :size="13"/></span></Tooltip>
              <Tooltip v-if="f.priv" content="Invited only" side="bottom"><span class="grid h-5 w-5 place-items-center text-muted-foreground"><Icon name="Lock" :size="13"/></span></Tooltip>
              <span class="flex-1"></span>
              <DropdownMenu :items="menu(f)" @select="it => onMenu(f, it)"><template #trigger><Button variant="ghost" size="icon-sm" class="-mr-1.5 h-7 w-7" :aria-label="'Actions for ' + f.title"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu>
            </div>
            <button type="button" class="mt-2 text-left after:absolute after:inset-0 after:content-['']" @click="openForm(f)"><h3 class="line-clamp-2 text-sm font-semibold leading-snug" style="text-wrap:balance">{{ f.title }}</h3></button>
            <p class="mt-0.5 truncate text-xs text-muted-foreground tnum">{{ f.sections }} {{ f.sections===1 ? 'section' : 'sections' }} · {{ f.questions }} questions<template v-if="f.loc"> · <Icon name="MapPin" :size="11" class="-mt-0.5 inline"/> {{ locName(f) }}</template></p>
            <div class="mt-3 flex items-end justify-between gap-3">
              <div><p class="text-xl font-semibold leading-none tnum">{{ f.responses }}</p><p class="mt-1 text-[11px] text-muted-foreground">responses<template v-if="f.flagged"> · <span class="text-warning">{{ f.flagged }} flagged</span></template></p></div>
              <Spark v-if="f.spark" :data="f.spark" color="hsl(var(--form-accent))" class="h-8 w-24"/>
            </div>
            <div class="mt-3 flex items-center gap-2 border-t pt-2.5 text-[11px] text-muted-foreground">
              <span class="grid h-5 w-5 place-items-center rounded-full bg-muted text-[9px] font-semibold uppercase text-foreground">{{ f.owner.split(' ').map(x=>x[0]).join('') }}</span>
              <span class="truncate">Edited {{ f.edited }}</span><span class="ml-auto shrink-0">{{ f.closes }}</span>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <!-- table -->
      <div v-else-if="list.length" :class="['kpi overflow-hidden rounded-xl border bg-card shadow-sm transition-opacity', LS.S.loading && 'pointer-events-none opacity-60']">
        <div class="overflow-x-auto"><table class="w-full min-w-[720px] text-sm">
          <thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Form</th><th class="px-3 py-2.5 font-medium">Status</th><th class="px-3 py-2.5 text-right font-medium">Responses</th><th class="px-3 py-2.5 font-medium">Last 10 days</th><th class="px-3 py-2.5 font-medium">Schedule</th><th class="px-3 py-2.5 font-medium">Owner</th><th class="w-10"></th></tr></thead>
          <tbody><tr v-for="f in list" :key="f.id" class="form-theme cursor-pointer border-b last:border-0 hover:bg-muted/50" :style="{ '--fa-l': ACCENTS[f.accent].l, '--fa-d': ACCENTS[f.accent].d }" @click="openForm(f)">
            <td class="px-4 py-2.5"><div class="flex items-center gap-2.5"><span class="h-8 w-1 shrink-0 rounded-full bg-fa"></span><div class="min-w-0"><p class="truncate font-medium">{{ f.title }}</p><p class="text-xs text-muted-foreground">{{ f.questions }} questions<template v-if="f.loc"> · {{ locName(f) }}</template><template v-if="f.timed"> · Timed</template><template v-if="f.priv"> · Invited only</template></p></div></div></td>
            <td class="px-3 py-2.5"><span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', STAT[f.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', STAT[f.status].dot]"></span>{{ STAT[f.status].label }}</span></td>
            <td class="px-3 py-2.5 text-right tnum">{{ f.responses }}<span v-if="f.flagged" class="ml-1 text-xs text-warning">({{ f.flagged }})</span></td>
            <td class="px-3 py-2.5"><Spark v-if="f.spark" :data="f.spark" color="hsl(var(--form-accent))" class="h-6 w-20"/><span v-else class="text-muted-foreground">–</span></td>
            <td class="px-3 py-2.5 text-muted-foreground">{{ f.closes }}</td>
            <td class="px-3 py-2.5 text-muted-foreground">{{ f.owner }}</td>
            <td class="px-2" @click.stop><DropdownMenu :items="menu(f)" @select="it => onMenu(f, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + f.title"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></td>
          </tr></tbody></table></div>
      </div>

      <div v-else-if="!FORMS.length" class="kpi grid place-items-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center">
        <span class="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="ClipboardPlus" :size="22"/></span>
        <h3 class="mt-4 text-lg font-semibold">Create the first form for {{ G.org.name }}</h3>
        <p class="mt-1 max-w-sm text-sm text-muted-foreground">Start blank or from a template. Timers, integrity rules and sharing are set per form.</p>
        <div class="mt-5 flex flex-wrap justify-center gap-2"><Button @click="onNew({id:'blank'})"><Icon name="Plus"/>Blank form</Button><Button variant="outline" @click="G.route='templates'"><Icon name="LayoutTemplate"/>Browse templates</Button></div>
      </div>
      <div v-else class="grid place-items-center rounded-xl border border-dashed p-10 text-center"><Icon name="SearchX" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">No forms match</p><p class="text-sm text-muted-foreground">Try another status or clear the search.</p><Button class="mt-3" variant="outline" size="sm" @click="G.search=''; LS.clearAll()">Clear search and filters</Button></div>
    </div>`
  };

  const TemplatesPage = {
    setup() { function use(t) { nav('builder'); G.toast('Template applied', t.name + ' (prototype opens the sample form).', 'LayoutTemplate'); } const shown = computed(() => { const q = (G.search || '').trim().toLowerCase(); return TEMPLATES.filter(t => !q || (t.name + ' ' + t.desc).toLowerCase().includes(q)); }); watchEffect(() => { if (G.view === 'templates') listCount.value = (G.search || '').trim().length >= 2 ? shown.value.length : null; }); return { TEMPLATES: shown, ACCENTS, use, G }; },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight">Templates</h2><p class="text-sm text-muted-foreground">Start from a proven layout. Settings like timers and integrity rules come with the template.</p></div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
        <p v-if="!TEMPLATES.length" class="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No templates match "{{ G.search }}".</p>
        <article v-for="(t, i) in TEMPLATES" :key="t.name" class="kpi form-theme flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md" :style="{ '--fa-l': ACCENTS[t.accent].l, '--fa-d': ACCENTS[t.accent].d, animationDelay: (i*40)+'ms' }">
          <div class="flex items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-fa/15 text-fa"><Icon :name="t.icon" :size="18"/></span>
            <div class="min-w-0 flex-1"><h3 class="text-sm font-semibold">{{ t.name }}</h3><p class="mt-0.5 text-xs text-muted-foreground">{{ t.desc }}</p></div>
            <Badge v-if="!t.system" variant="outline" class="shrink-0">Yours</Badge></div>
          <div class="mt-3 flex flex-wrap gap-1"><span v-for="g in t.tags" :key="g" class="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{{ g }}</span></div>
          <div class="mt-4 flex gap-2 pt-1"><Button size="sm" class="flex-1" @click="use(t)">Use template</Button><Button size="sm" variant="outline" @click="use(t)"><Icon name="Eye" :size="14"/></Button></div>
        </article></div></div>`
  };

  const MembersPage = {
    setup() {
      const roles = computed(() => ROLES.filter(r => r.system).map(r => ({ value: r.id, label: r.name, disabled: r.locked })));  // D19: main roles only
      const directOf = (m) => DIRECT[m.email + m.phone] || [];
      const M = reactive({ invite: false, who: '', role: 'editor', locs: [] });
      function invite() { if (!M.who.trim()) return; (M.locs || []).forEach((l, i) => assignsOf().push({ id: ulid('ul'), email: M.who.includes('@') ? M.who : '', loc: l, roles: [], primary: i === 0, granted: [], denied: [], since: 'Today' })); M.locs = []; MEMBERS.push({ name: M.who.split('@')[0], email: M.who.includes('@') ? M.who : '', phone: M.who.includes('@') ? '' : M.who, username: '', role: M.role, twofa: false, active: 'Invited', invited: true }); M.invite = false; M.who = ''; G.toast('Invitation sent', 'They set a password and turn on two-step verification on first sign-in.', 'Send'); }
      const RANK = { owner: 0, admin: 1, editor: 2, viewer: 3 };
      const LS = useList({ noun: 'users', rows: () => MEMBERS, search: (m, q) => (m.name + ' ' + m.email + ' ' + (m.username || '') + ' ' + (m.phone || '')).toLowerCase().includes(q), sort: 'name',
        sorts: [{ value: 'name', label: 'Name', get: m => m.name.toLowerCase() }, { value: 'role', label: 'Main role', get: m => RANK[m.role] }, { value: 'active', label: 'Last active', get: m => m.invited ? '0' : relToIso(m.active) }],
        fields: () => [
          { key: 'role', label: 'Main role', type: 'select', options: ['owner', 'admin', 'editor', 'viewer'].map(r => ({ value: r, label: ROLE[r] })), get: m => m.role },
          { key: 'state', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'invited', label: 'Invited' }], get: m => m.invited ? 'invited' : 'active' },
          { key: 'loc', label: 'Primary location', type: 'select_paginated', module: 'locations', get: m => (primaryOf(m.email) || {}).id || '' },
          { key: 'twofa', label: 'Two-step verification', type: 'boolean', get: m => m.twofa ? 'yes' : 'no' },
          { key: 'active', label: 'Last active', type: 'date', get: m => m.invited ? '' : relToIso(m.active) },
        ] });
      watchEffect(() => { if (G.view === 'members') listCount.value = (G.search || '').trim().length >= 2 ? LS.rows.value.length : null; });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });   // P39: search, sort and filters live in the link
      return { LS, openLoc, MEMBERS, roles, M, invite, G, canManage, directOf, primaryOf, canViewAs, startViewAs, ME };
    },
    template: `<div class="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3"><div><h2 class="text-xl font-semibold tracking-tight">Users</h2><p class="text-sm text-muted-foreground">People who can build forms and see results in {{ G.org.name }}.</p></div></div>
      <ListCard :list="LS">
        <template #actions><Button v-if="canManage()" size="sm" @click="M.invite=true"><Icon name="UserPlus" :size="15"/>Invite</Button></template>
        <p v-if="!LS.rows.value.length" class="grid h-32 place-items-center text-sm text-muted-foreground">No users match.</p>
        <div v-else>
          <div class="hidden overflow-x-auto md:block"><table class="w-full text-sm">
            <thead><tr class="border-b text-left text-xs text-muted-foreground"><th class="px-4 py-2.5 font-medium">Member</th><th class="px-3 py-2.5 font-medium">Sign-in IDs</th><th class="px-3 py-2.5 font-medium">Two-step</th><th class="px-3 py-2.5 font-medium">Primary location</th><th class="px-3 py-2.5 font-medium">Last active</th><th class="px-4 py-2.5 font-medium">Main role</th><th class="w-10"></th></tr></thead>
            <tbody><tr v-for="m in LS.rows.value" :key="m.email + m.phone" class="border-b last:border-0">
              <td class="px-4 py-2.5"><div class="flex items-center gap-2.5"><span class="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ m.name.split(' ').map(x=>x[0]).join('').slice(0,2) }}</span><div class="min-w-0"><p class="truncate font-medium">{{ m.name }}</p><p class="truncate text-xs text-muted-foreground">{{ m.email || m.phone }}</p></div></div></td>
              <td class="px-3 py-2.5 text-xs text-muted-foreground"><p v-if="m.username" class="flex items-center gap-1"><Icon name="User" :size="11"/>{{ m.username }}</p><p v-if="m.phone" class="flex items-center gap-1 tnum"><Icon name="Phone" :size="11"/>{{ m.phone }}</p><p v-if="!m.username && !m.phone">Email only</p></td>
              <td class="px-3 py-2.5"><Badge v-if="m.twofa" variant="secondary"><Icon name="ShieldCheck" :size="11"/>On</Badge><Badge v-else-if="m.invited" variant="outline">Pending</Badge><Badge v-else variant="warning"><Icon name="ShieldAlert" :size="11"/>Off</Badge></td>
              <td class="px-3 py-2.5"><button v-if="primaryOf(m.email)" type="button" class="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline" @click="openLoc(primaryOf(m.email).id, 'users')"><Icon name="MapPin" :size="12"/>{{ primaryOf(m.email).name }}</button><span v-else class="text-muted-foreground">–</span></td>
              <td class="px-3 py-2.5 text-muted-foreground">{{ m.active }}<span v-if="directOf(m).length" class="ml-2 inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning" :title="directOf(m).join(', ')"><Icon name="UserRound" :size="11"/>+{{ directOf(m).length }} direct</span></td>
              <td class="px-4 py-2.5"><Select size="sm" class="w-28" v-model="m.role" :options="roles.filter(r => ['owner','admin','editor','viewer'].includes(r.value))" :disabled="m.role==='owner' || !canManage()" align="end"/></td>
              <td class="px-2"><Tooltip v-if="canViewAs() && m.email !== ME.email && !m.invited" content="View as" side="left"><Button variant="ghost" size="icon-sm" @click="startViewAs(m.email)" :aria-label="'View as ' + m.name"><Icon name="Eye" :size="15"/></Button></Tooltip></td>
            </tr></tbody></table></div>
          <ul class="divide-y md:hidden"><li v-for="m in LS.rows.value" :key="m.email + m.phone" class="flex items-center gap-3 p-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ m.name.split(' ').map(x=>x[0]).join('').slice(0,2) }}</span>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ m.name }}</p><p class="truncate text-xs text-muted-foreground">{{ m.role[0].toUpperCase()+m.role.slice(1) }} · {{ m.active }}</p></div>
            <Icon :name="m.twofa ? 'ShieldCheck' : 'ShieldAlert'" :size="16" :class="m.twofa ? 'text-c1' : 'text-warning'" :aria-label="m.twofa ? 'Two-step on' : 'Two-step off'"/></li></ul>
        </div>
      </ListCard>
      <Dialog v-model:open="M.invite">
        <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Invite a member</h2><p class="text-sm text-muted-foreground">Send an invite by email or SMS.</p></div>
        <div class="grid gap-3"><div class="grid gap-1.5"><label for="iv" class="text-sm font-medium">Email or phone</label><Input id="iv" v-model="M.who" placeholder="name@kilimaretail.co.tz or +255 7…"/></div>
          <div class="grid gap-1.5"><span class="text-sm font-medium">Main role</span><Select v-model="M.role" :options="roles.filter(r=>!r.disabled)"/></div>
          <ApiSelect v-model="M.locs" module="locations" multiple label="Locations" placeholder="Pick where they work" help="Their custom roles at each location are set from the location's Users tab."/>
          <p class="text-xs text-muted-foreground">Editors build forms and see results. Viewers see results only. Admins also manage members and settings.</p></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="M.invite=false">Cancel</Button><Button @click="invite" :disabled="!M.who.trim()"><Icon name="Send" :size="14"/>Send invite</Button></div>
      </Dialog></div>`
  };

  const WorkspacePage = {
    setup() {
      const tz = [{ value: 'Africa/Dar_es_Salaam', label: 'East Africa Time (Dar es Salaam)' }, { value: 'Africa/Nairobi', label: 'East Africa Time (Nairobi)' }, { value: 'UTC', label: 'UTC' }];
      const timeout = [{ value: '30', label: '30 minutes' }, { value: '120', label: '2 hours' }, { value: '480', label: '8 hours' }];
      const W = reactive({ tz: 'Africa/Dar_es_Salaam', timeout: '120' });
      watch(() => G.org, o => { if (!o.quiet) o.quiet = reactive({ on: true, from: '20:00', to: '07:00' }); }, { immediate: true });
      const HOURS = Array.from({ length: 24 }, (_, h) => ({ value: String(h).padStart(2, '0') + ':00', label: String(h).padStart(2, '0') + ':00' }));
      const types = TYPES.map(t => ({ ...t, opts: TYPE_VIEWS[t.value].map((v, i) => ({ value: v, label: VIEWS[v].label + (i === 0 ? ' (built-in)' : ''), icon: VIEWS[v].icon })) }));
      const viewOf = (t) => G.org.viewDefaults[t] || TYPE_VIEWS[t][0];
      function setView(t, v) { if (v === TYPE_VIEWS[t][0]) delete G.org.viewDefaults[t]; else G.org.viewDefaults[t] = v; G.toast('Default view saved', 'Applies to every form without its own choice for that question.', 'ChartBarBig'); }
      const changed = computed(() => Object.keys(G.org.viewDefaults).length);
      function resetViews() { Object.keys(G.org.viewDefaults).forEach(k => delete G.org.viewDefaults[k]); G.toast('Chart views reset', 'Every type uses its built-in default.', 'RotateCcw'); }
      return { HOURS, G, W, tz, timeout, types, viewOf, setView, changed, resetViews, ACCENTS, canManage };
    },
    template: `<div class="mx-auto grid max-w-[820px] grid-cols-[minmax(0,1fr)] gap-3">
      <div><h2 class="text-xl font-semibold tracking-tight">Workspace settings</h2><p class="text-sm text-muted-foreground">Applies to everyone in {{ G.org.name }}.</p></div>
      <p v-if="!canManage()" class="flex items-center gap-2 rounded-lg border bg-muted/60 p-3 text-sm text-muted-foreground"><Icon name="Lock" :size="15"/>Only owners and admins can change these settings.</p>
      <fieldset :disabled="!canManage()" class="grid gap-3 disabled:opacity-70">
      <Card class="kpi"><div class="grid gap-4 p-4 sm:p-5"><h3 class="font-semibold">General</h3>
        <div class="grid gap-3 sm:grid-cols-2"><div class="grid gap-1.5"><label for="w-n" class="text-sm font-medium">Organisation name</label><Input id="w-n" v-model="G.org.name"/></div>
          <div class="grid gap-1.5"><label for="w-s" class="text-sm font-medium">Address</label><div class="flex h-9 items-center rounded-md border border-input text-sm shadow-sm"><span class="border-r bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">{{ PRODUCT.domain }}/</span><input id="w-s" v-model="G.org.slug" class="h-full min-w-0 flex-1 bg-transparent px-2 outline-none"></div></div>
          <div class="grid gap-1.5 sm:col-span-2"><span class="text-sm font-medium">Time zone</span><Select v-model="W.tz" :options="tz"/></div></div></div></Card>
      <Card class="kpi" style="animation-delay:40ms"><div class="grid gap-4 p-4 sm:p-5"><div><h3 class="font-semibold">Branding</h3><p class="text-sm text-muted-foreground">Shown on sign-in, invitations and public forms.</p></div>
        <FilePicker v-model="G.org.logo" accept="image" :max-size="2" label="Logo" help="Square PNG or SVG works best, at least 256 × 256 px."/>
        <RichText v-model="G.org.footer" label="Invitation email footer" :max="400" placeholder="Contact details, office hours, a short note…" help="Added under every invitation and reminder email."/></div></Card>
      <Card class="kpi" style="animation-delay:60ms"><div class="p-4 sm:p-5"><h3 class="font-semibold">Brand colour</h3><p class="text-sm text-muted-foreground">Default accent for new forms. Each form can still pick its own.</p>
        <div class="mt-3 flex flex-wrap gap-3"><button v-for="(a, k) in ACCENTS" :key="k" type="button" @click="G.org.accent=k" :aria-label="a.label" :aria-pressed="G.org.accent===k" class="form-theme grid h-9 w-9 place-items-center rounded-full ring-offset-2 ring-offset-background" :class="G.org.accent===k ? 'ring-2 ring-foreground' : ''" :style="{ '--fa-l': a.l, '--fa-d': a.d, background: 'hsl(var(--form-accent))' }"><Icon v-if="G.org.accent===k" name="Check" :size="16" class="text-fa-fg"/></button></div></div></Card>
      <Card class="kpi" style="animation-delay:120ms"><div class="p-4 sm:p-5">
        <div class="flex flex-wrap items-start justify-between gap-2"><div><h3 class="font-semibold">Result chart defaults</h3><p class="text-sm text-muted-foreground">How each question type is charted in Results. Someone can still change the view on a single question; that choice wins for that form.</p></div>
          <Button v-if="changed" variant="ghost" size="sm" @click="resetViews"><Icon name="RotateCcw" :size="14"/>Reset {{ changed }}</Button></div>
        <ol class="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground" aria-label="Which view wins"><li class="rounded-md bg-muted px-2 py-1">Built-in default</li><Icon name="ChevronRight" :size="12"/><li class="rounded-md bg-primary/10 px-2 py-1 font-medium text-foreground">Workspace default (here)</li><Icon name="ChevronRight" :size="12"/><li class="rounded-md bg-muted px-2 py-1">Per question on a form</li></ol>
        <div class="mt-3 divide-y rounded-lg border">
          <div v-for="t in types" :key="t.value" class="flex flex-wrap items-center gap-3 px-3 py-2.5">
            <span class="flex min-w-0 flex-1 items-center gap-2 text-sm"><Icon :name="t.icon" :size="15" class="text-muted-foreground"/>{{ t.label }}<Badge v-if="G.org.viewDefaults[t.value]" variant="outline" class="ml-1">Changed</Badge></span>
            <Select size="sm" class="w-48" :model-value="viewOf(t.value)" @update:model-value="v => setView(t.value, v)" :options="t.opts" align="end" :disabled="t.opts.length < 2"/>
          </div></div></div></Card>
      <Card class="kpi" style="animation-delay:180ms"><div class="p-4 sm:p-5"><h3 class="font-semibold">Security</h3>
        <div class="mt-1 divide-y">
          <div class="flex items-start justify-between gap-6 py-3"><div><label for="w-2fa" class="text-sm font-medium">Require two-step verification</label><p class="mt-1 text-sm text-muted-foreground">Members without it are asked to set it up before they can continue. 2 members still need to.</p></div><Switch id="w-2fa" v-model="G.org.require2fa"/></div>
          <div class="flex items-start justify-between gap-6 py-3"><div><span class="text-sm font-medium">Sign out after inactivity</span><p class="mt-1 text-sm text-muted-foreground">Applies to builder and results, not to respondents.</p></div><Select size="sm" class="w-36" v-model="W.timeout" :options="timeout" align="end"/></div>
          <div class="grid gap-3 py-3"><div class="flex items-start justify-between gap-6"><div><label for="w-quiet" class="text-sm font-medium">Quiet hours for SMS and push</label><p class="mt-1 text-sm text-muted-foreground">Approval texts and push notifications wait until the window ends. In-app and email still go. Steps marked required ignore this.</p></div><Switch id="w-quiet" v-model="G.org.quiet.on"/></div>
            <div v-if="G.org.quiet.on" class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">From<Select size="sm" class="w-24" v-model="G.org.quiet.from" :options="HOURS" aria-label="Quiet from"/>to<Select size="sm" class="w-24" v-model="G.org.quiet.to" :options="HOURS" aria-label="Quiet until"/><span>{{ W.tz === 'UTC' ? 'UTC' : 'EAT' }}</span></div></div>
        </div></div></Card>
      </fieldset>
    </div>`
  };

  return { AuthView, ShellView, comps: { NotifPrefsSheet, ApprovalSteps, NewRequestDialog, ApprovalsPage, ApproveDialog, RequestPage, RequestTypesPage, DelegationsPage, MediaThumb, FilePicker, MediaLibraryDialog, MediaPage, ApiSelect, RichText, DraftBanner, DraftStatus, MyDraftsSheet, DeleteDialog, RelatedLink, DatePicker, RefreshButton, ListToolbar, FiltersDialog, HeaderSearch, DashboardPage, DesignPage, SideNav, MenusPage, RolesPage, RolePage, NewRoleDialog, GrantDialog, PlaceholderPage, NoAccessPage, FormsList, TemplatesPage, MembersPage, WorkspacePage, Spark, OrgAvatar, OrgSwitcher, NewOrgDialog } };
})();
