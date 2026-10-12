
  /* ================================================================ APPROVALS (Cobley core, D25): request types + steps, requests, approvals, delegations */
  const RQ_STATUS = {
    draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
    submitted: { label: 'Submitted', cls: 'bg-c3/15 text-foreground', dot: 'bg-c3' },
    in_review: { label: 'In review', cls: 'bg-warning/15 text-warning', dot: 'bg-warning animate-pulse' },
    approved: { label: 'Approved', cls: 'bg-c1/15 text-foreground', dot: 'bg-c1' },
    rejected: { label: 'Rejected', cls: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
    cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60' },
  };
  const OPEN_RQ = ['submitted', 'in_review'];
  const ACTIONS = { 'Forms.publish': { label: 'Publish a form', icon: 'Send', effect: 'The form goes live and starts accepting responses.' }, 'Responses.export': { label: 'Export responses', icon: 'FileSpreadsheet', effect: 'The export is generated and the requester gets a download link valid for 24 hours.' }, 'Responses.void': { label: 'Reset a respondent', icon: 'RotateCcw', effect: 'The respondent can answer the form again; their old response is voided.' }, 'Locations.manage': { label: 'Deactivate a location', icon: 'MapPinOff', effect: 'The location is deactivated and its forms stop accepting responses.' } };
  const hAgo = (h) => Date.now() - h * 3600e3;
  const RTYPES = reactive({
    k: [
      { id: 'rt_pub', name: 'Publish a form', action: 'Forms.publish', active: true, scope: 'location', desc: 'Forms owned by a branch or zone are checked before they go live.', steps: [
        { id: 's1', name: 'Location head', approvers: [{ kind: 'role', id: 'supervisor' }, { kind: 'role', id: 'zone_manager' }], combinator: 'or', required: 1 },
        { id: 's2', name: 'Admin sign-off', approvers: [{ kind: 'main', id: 'admin' }, { kind: 'main', id: 'owner' }], combinator: 'or', required: 1 }] },
      { id: 'rt_exp', name: 'Export responses', action: 'Responses.export', active: true, scope: 'all', desc: 'Raw exports contain respondents’ emails, so a zone manager agrees first.', steps: [
        { id: 's1', name: 'Zone manager', approvers: [{ kind: 'role', id: 'zone_manager' }], combinator: 'or', required: 1 }] },
      { id: 'rt_reset', name: 'Reset a respondent', action: 'Responses.void', active: true, scope: 'all', desc: 'Lets someone answer again. Two people must agree.', steps: [
        { id: 's1', name: 'Two admins', approvers: [{ kind: 'main', id: 'admin' }, { kind: 'main', id: 'owner' }], combinator: 'or', required: 2 }] },
      { id: 'rt_loc', name: 'Deactivate a location', action: 'Locations.manage', active: false, scope: 'all', desc: 'Not switched on yet.', steps: [
        { id: 's1', name: 'Owner', approvers: [{ kind: 'main', id: 'owner' }], combinator: 'or', required: 1 }] },
    ],
  });
  const E = { amina: 'amina.juma@kilimaretail.co.tz', neema: 'neema.kimaro@kilimaretail.co.tz', baraka: 'baraka.mushi@kilimaretail.co.tz', rehema: 'rehema.mrema@kilimaretail.co.tz', hamisi: 'hamisi.swai@kilimaretail.co.tz', upendo: 'upendo.lyimo@kilimaretail.co.tz' };
  const REQS = reactive({
    k: [
      { id: 'rq14', no: 'RQ-2026-0014', type: 'rt_pub', status: 'in_review', step: 1, requester: E.baraka, loc: 'aru', subject: { kind: 'form', id: 'f5', label: 'Branch Opening Checklist: Arusha' }, note: 'Needed for the opening walk-through on 1 November.', at: hAgo(5), approvals: [{ step: 0, by: E.hamisi, decision: 'approved', comment: 'Went through it with the team. Good to go.', at: hAgo(2) }] },
      { id: 'rq13', no: 'RQ-2026-0013', type: 'rt_exp', status: 'submitted', step: 0, requester: E.rehema, loc: 'ho', subject: { kind: 'form', id: 'f2', label: 'Staff Satisfaction Survey 2026' }, note: 'For the HR quarterly review pack.', at: hAgo(26), approvals: [] },
      { id: 'rq12', no: 'RQ-2026-0012', type: 'rt_reset', status: 'in_review', step: 0, requester: E.neema, loc: 'kko', subject: { kind: 'respondent', id: 'r1', label: 'amina.k@gmail.com on Customer Service Assessment Q4' }, note: 'Browser crashed during the timed section; she has a screenshot.', at: hAgo(30), approvals: [{ step: 0, by: E.amina, decision: 'approved', comment: '', at: hAgo(20) }] },
      { id: 'rq11', no: 'RQ-2026-0011', type: 'rt_pub', status: 'approved', step: 2, requester: E.amina, loc: 'ho', subject: { kind: 'form', id: 'f6', label: 'Fire Safety Drill Quiz' }, note: '', at: hAgo(72), approvals: [{ step: 0, by: E.neema, decision: 'approved', comment: 'Escalated to me: Head Office has no location head.', at: hAgo(70) }, { step: 1, by: E.neema, decision: 'approved', comment: '', at: hAgo(69) }] },
      { id: 'rq10', no: 'RQ-2026-0010', type: 'rt_exp', status: 'rejected', step: 0, requester: E.hamisi, loc: 'aru', subject: { kind: 'form', id: 'f1', label: 'Customer Service Assessment Q4' }, note: 'Want to share results with the team.', at: hAgo(96), approvals: [{ step: 0, by: E.baraka, decision: 'rejected', comment: 'Use the dashboard for the team; the raw export has personal data.', at: hAgo(90) }] },
      { id: 'rq9', no: 'RQ-2026-0009', type: 'rt_pub', status: 'cancelled', step: 0, requester: E.rehema, loc: 'mwz', subject: { kind: 'form', id: 'f4', label: 'Customer Feedback: Mwanza Branch' }, note: '', at: hAgo(200), approvals: [] },
    ],
  });
  const DELEG = reactive({
    k: [
      { id: 'dg1', from: E.baraka, to: E.hamisi, types: ['rt_exp'], start: daysAgo(1), end: (() => { const d = new Date(TODAY); d.setDate(d.getDate() + 10); return isoDay(d); })(), reason: 'Annual leave', created: daysAgo(2) },
      { id: 'dg2', from: E.neema, to: E.amina, types: [], start: daysAgo(40), end: daysAgo(30), reason: 'Training in Nairobi', created: daysAgo(41) },
    ],
  });
  /* ---------- D43: approval notifications. Workflow sets channels + events; a step may override channels and mark them required (ignores personal opt-out). In-app always goes. */
  const CHANNELS = { inapp: { label: 'In-app', icon: 'Bell' }, email: { label: 'Email', icon: 'Mail' }, sms: { label: 'SMS (NJIWA)', icon: 'MessageSquare' }, push: { label: 'Push', icon: 'Smartphone' } };
  const NEVENTS = { waiting: { label: 'Step waiting for them', who: 'Approvers of the step', icon: 'Hourglass' }, remind: { label: 'Reminder if no action', who: 'Approvers who have not acted', icon: 'AlarmClock' }, escalate: { label: 'Escalation or short step', who: 'The Owner', icon: 'ArrowUp' }, decision: { label: 'Decision', who: 'The requester', icon: 'CircleCheck' } };
  const defaultNotify = () => ({ channels: ['inapp', 'email'], events: { waiting: true, remind: true, escalate: true, decision: true }, remindHours: 24, remindMax: 3 });
  RTYPES.k.forEach(t => { t.notify = defaultNotify(); t.steps.forEach(st => { st.notify = null; }); });
  RTYPES.k.find(t => t.id === 'rt_pub').steps[1].notify = { channels: ['inapp', 'email', 'push'], required: false };
  RTYPES.k.find(t => t.id === 'rt_reset').steps[0].notify = { channels: ['inapp', 'email', 'sms'], required: true };
  /* personal opt-outs (profile › Notification settings); in-app can't be turned off */
  const NPREFS = reactive({ [E.hamisi]: { email: true, sms: false, push: true }, [E.neema]: { email: true, sms: true, push: false } });
  const prefsOf = (e) => NPREFS[e] || (NPREFS[e] = { email: true, sms: true, push: true });
  const APP_USERS = new Set([E.baraka, E.hamisi, E.amina]);
  const stepChannels = (t, st) => (st && st.notify ? st.notify.channels : t.notify.channels);
  /* in-app items for the signed-in person feed the bell */
  G.appNotifs = reactive([]);
  function dispatch(req, event, emails, st, at = Date.now()) {
    const t = rtById(req.type); if (!t || !t.notify || !t.notify.events[event]) return;
    if (!req.log) req.log = reactive([]);
    const chans = stepChannels(t, st); const required = !!(st && st.notify && st.notify.required);
    [...new Set(emails)].forEach(e => { const m = memberByEmail(e) || {}; chans.forEach(c => {
      let status = 'sent', why = '';
      if (c !== 'inapp' && !required && prefsOf(e)[c] === false) { status = 'skipped'; why = 'turned off by them'; }
      else if (c === 'sms' && !m.phone) { status = 'skipped'; why = 'no phone number'; }
      else if (c === 'push' && !APP_USERS.has(e)) { status = 'skipped'; why = 'no mobile app'; }
      else if (c === 'email' && !m.email) { status = 'skipped'; why = 'no email'; }
      else if ((c === 'sms' || c === 'push') && !required && inQuiet(at) && at > Date.now() - 12 * 3600e3) { status = 'held'; why = 'quiet hours, sends at ' + quietOf().to; }
      else if ((c === 'sms' || c === 'push') && !required && inQuiet(at)) { why = 'held for quiet hours, sent at ' + quietOf().to; }
      req.log.push({ at, event, to: e, channel: c, status, why, step: st ? st.name : '' });
      if (c === 'inapp' && e === ME.email) G.appNotifs.unshift({ id: ulid('n'), req: req.id, label: req.no + ': ' + NEVENTS[event].label.toLowerCase() + ' · ' + req.subject.label, icon: NEVENTS[event].icon, at });
    }); });
  }
  /* D44: org quiet hours hold SMS + push (EAT); required steps and in-app/email are not held */
  const quietOf = () => G.org.quiet || (G.org.quiet = reactive({ on: true, from: '20:00', to: '07:00' }));
  const inQuiet = (at) => { const q = quietOf(); if (!q.on) return false; const h = new Date(at).getUTCHours() + 3, hr = h % 24; const f = +q.from.slice(0, 2), t = +q.to.slice(0, 2); return f > t ? (hr >= f || hr < t) : (hr >= f && hr < t); };
  const ownersOf = (req) => MEMBERS.filter(m => m.role === 'owner' && !m.invited && m.email !== req.requester).map(m => m.email);
  function notifyStep(req, at) {
    const t = rtById(req.type); const st = t && t.steps[req.step]; if (!st) return;
    const res = resolveStep(st, req); const done = req.approvals.filter(a => a.step === req.step).map(a => a.by);
    dispatch(req, 'waiting', res.people.map(p => p.email).filter(e => !done.includes(e)), st, at);
    if (res.escalated || res.short) dispatch(req, 'escalate', ownersOf(req), st, at);
  }
  /* seeded requests get the log they would have produced (submit, reminders so far, decisions) */
  function seedLog(req) {
    if (req.log) return; req.log = reactive([]);
    const t = rtById(req.type); if (!t) return; const save = G.appNotifs.length;
    for (let i = 0; i <= Math.min(req.step, t.steps.length - 1); i++) { const st = t.steps[i]; const fake = { ...req, step: i, approvals: req.approvals.filter(a => a.step < i) }; const res = resolveStep(st, fake);
      const start = i === 0 ? req.at : (req.approvals.filter(a => a.step === i - 1).slice(-1)[0] || {}).at || req.at;
      dispatch(req, 'waiting', res.people.map(p => p.email), st, start);
      if (res.escalated || res.short) dispatch(req, 'escalate', ownersOf(req), st, start);
      if (OPEN_RQ.includes(req.status) && i === req.step && t.notify.events.remind) { const n = Math.min(t.notify.remindMax, Math.floor((Date.now() - start) / (t.notify.remindHours * 3600e3))); const done = req.approvals.filter(a => a.step === i).map(a => a.by);
        for (let k = 1; k <= n; k++) dispatch(req, 'remind', res.people.map(p => p.email).filter(e => !done.includes(e)), st, start + k * t.notify.remindHours * 3600e3); } }
    if (['approved', 'rejected'].includes(req.status)) dispatch(req, 'decision', [req.requester], null, (req.approvals.slice(-1)[0] || {}).at || req.at);
    G.appNotifs.splice(0, G.appNotifs.length - save);
  }
  const rtypesOf = () => RTYPES[G.org.id] || (RTYPES[G.org.id] = []);
  const reqsOf = () => REQS[G.org.id] || (REQS[G.org.id] = []);
  const delegOf = () => DELEG[G.org.id] || (DELEG[G.org.id] = []);
  const rtById = (id) => rtypesOf().find(t => t.id === id);
  const reqById = (id) => reqsOf().find(r => r.id === id);
  const nameOf = (e) => (memberByEmail(e) || { name: e }).name;
  const delegState = (d) => d.end < isoDay(TODAY) ? 'expired' : d.start > isoDay(TODAY) ? 'upcoming' : 'active';
  const approverText = (a) => a.kind === 'role' ? (roleById(a.id) || {}).name : a.kind === 'main' ? ROLE[a.id] + ' (main role)' : a.kind === 'perm' ? 'Anyone with ' + a.id : nameOf(a.id);
  const ruleText = (st, scopeLoc) => { const who = st.approvers.map(approverText).join(st.combinator === 'or' ? ' or ' : ' and '); const any = st.approvers.some(a => a.kind === 'role'); return (st.required > 1 ? st.required + ' people: ' : 'Any 1: ') + who + (any && scopeLoc ? ' at ' + scopeLoc + ' or above' : ''); };
  /* approvers of a step for a request: roles held at the request's location or any ancestor; requester excluded; nobody found → escalate to owners and admins */
  function resolveStep(st, req) {
    const chain = [...ancestorsOf(req.loc).map(l => l.id), req.loc];
    const match = (m, a) => a.kind === 'main' ? m.role === a.id : a.kind === 'user' ? m.email === a.id : a.kind === 'perm' ? effectiveAt(m.email, req.loc).perms.includes(a.id) : assignsOf().some(x => x.email === m.email && chain.includes(x.loc) && x.roles.includes(a.id));
    let people = MEMBERS.filter(m => !m.invited && m.email !== req.requester && (st.combinator === 'or' ? st.approvers.some(a => match(m, a)) : st.approvers.every(a => match(m, a))));
    let escalated = false;
    if (!people.length) { people = MEMBERS.filter(m => ['owner', 'admin'].includes(m.role) && m.email !== req.requester); escalated = true; }
    /* D40: still fewer people than the step needs → the Owner joins, and the step needs only as many as can approve */
    let short = false;
    if (people.length < st.required) { short = true; MEMBERS.filter(m => m.role === 'owner' && !m.invited && m.email !== req.requester && !people.includes(m)).forEach(m => people.push(m)); }
    const need = Math.min(st.required, Math.max(1, people.length));
    const why = (m) => { const a = st.approvers.find(x => match(m, x)); if (!a) return 'Escalated: ' + ROLE[m.role]; if (a.kind === 'role') { const at = assignsOf().find(x => x.email === m.email && chain.includes(x.loc) && x.roles.includes(a.id)); return (roleById(a.id) || {}).name + ' at ' + (locById(at.loc) || {}).name; } return approverText(a); };
    return { people: people.map(m => ({ email: m.email, name: m.name, why: why(m) })), escalated, short, need };
  }
  /* D40 setup rule: how many people could ever approve a step (anywhere in the org) and whether the step can be met.
     The requester never approves their own request, so a step needing 2+ approvals needs at least one spare person. */
  function stepCapacity(st) {
    const any = (m, a) => a.kind === 'main' ? m.role === a.id : a.kind === 'user' ? m.email === a.id : a.kind === 'perm' ? ((roleById(m.role) || { perms: [] }).perms.includes(a.id) || assignsOf().some(x => x.email === m.email && x.roles.some(r => (roleById(r) || { perms: [] }).perms.includes(a.id)))) : assignsOf().some(x => x.email === m.email && x.roles.includes(a.id));
    const n = MEMBERS.filter(m => !m.invited && m.email !== PREVIEW_EMAIL && (st.combinator === 'or' ? st.approvers.some(a => any(m, a)) : st.approvers.every(a => any(m, a)))).length;
    const min = st.required > 1 ? st.required + 1 : 1;
    return { n, min, ok: n >= min };
  }
  const workflowOk = (t) => t.steps.every(st => stepCapacity(st).ok);
  /* can `email` act on the request's current step, directly or under an active delegation? */
  function actingFor(req, email = ME.email) {
    if (!OPEN_RQ.includes(req.status) || req.requester === email) return null;
    const t = rtById(req.type); const st = t && t.steps[req.step]; if (!st) return null;
    const done = req.approvals.filter(a => a.step === req.step).map(a => a.by);
    const { people } = resolveStep(st, req);
    if (people.some(p => p.email === email) && !done.includes(email)) return { self: true };
    const dg = delegOf().find(d => d.to === email && delegState(d) === 'active' && (!d.types.length || d.types.includes(req.type)) && people.some(p => p.email === d.from) && !done.includes(d.from));
    return dg ? { self: false, for: dg.from, until: dg.end } : null;
  }
  const waitingForMe = computed(() => G.viewAs ? reqsOf().filter(r => actingFor(r, G.viewAs.email)) : reqsOf().filter(r => actingFor(r)));
  function decide(req, decision, comment) {
    if (G.viewAs) return readOnly();
    const act = actingFor(req); if (!act) return;
    const by = act.self ? ME.email : act.for;
    req.approvals.push({ step: req.step, by, actedBy: act.self ? null : ME.email, decision, comment, at: Date.now() });
    const t = rtById(req.type);
    if (decision === 'rejected') { req.status = 'rejected'; dispatch(req, 'decision', [req.requester], null); toast('Request rejected', req.no + ' · ' + nameOf(req.requester) + ' is told why.', 'CircleX'); return; }
    const n = req.approvals.filter(a => a.step === req.step && a.decision === 'approved').length;
    if (n >= resolveStep(t.steps[req.step], req).need) {
      req.step++;
      if (req.step >= t.steps.length) { req.status = 'approved'; applyEffect(req); dispatch(req, 'decision', [req.requester], null); toast('Approved', req.no + ': ' + ACTIONS[t.action].effect, 'CircleCheck'); }
      else { req.status = 'in_review'; notifyStep(req); toast('Approved, moved to ' + t.steps[req.step].name, req.no + ' · its approvers are notified.', 'CircleCheck'); }
    } else { req.status = 'in_review'; toast('Approval recorded', (resolveStep(t.steps[req.step], req).need - n) + ' more needed on this step.', 'CircleCheck'); }
  }
  /* a short step that already has enough approvals (it started before the Owner joined) is completed by the Owner */
  const canComplete = (req) => { if (!req || !OPEN_RQ.includes(req.status) || G.viewAs || G.org.role !== 'owner') return false; const t = rtById(req.type); const st = t && t.steps[req.step]; if (!st) return false; const res = resolveStep(st, req); return res.short && req.approvals.filter(a => a.step === req.step && a.decision === 'approved').length >= res.need; };
  function completeStep(req) {
    const t = rtById(req.type); req.approvals.push({ step: req.step, by: ME.email, decision: 'approved', comment: 'Completed by the Owner: not enough people can approve this step.', at: Date.now(), override: true });
    req.step++;
    if (req.step >= t.steps.length) { req.status = 'approved'; applyEffect(req); dispatch(req, 'decision', [req.requester], null); toast('Approved', req.no + ': ' + ACTIONS[t.action].effect, 'CircleCheck'); }
    else { req.status = 'in_review'; notifyStep(req); toast('Step completed', req.no + ' moved to ' + t.steps[req.step].name, 'CircleCheck'); }
  }
  function applyEffect(req) {
    const t0 = rtById(req.type);
    if (t0 && t0.action === 'Responses.void' && req.subject.kind === 'respondent' && typeof ResponsesMod !== 'undefined') { const r = ResponsesMod.RESP.find(x => x.id === req.subject.id); if (r) r.reset = true; }
    if (t0 && t0.action === 'Responses.export') setTimeout(() => toast('Export ready for ' + nameOf(req.requester), (req.subject.meta || 'Excel') + '. Download link valid for 24 hours, also emailed.', 'FileSpreadsheet'), 900);
    if (req.subject.kind === 'form') { const f = FORMS.find(x => x.id === req.subject.id); const t = rtById(req.type); if (f && t.action === 'Forms.publish') { f.status = 'live'; f.closes = 'No close date'; } } }
  function openReq(id, tab) { G.reqId = id; nav('request', tab); }
  const NR = reactive({ open: false, type: 'rt_pub', form: '', note: '', subject: null, loc: '', onSent: null });
  function newRequest(prefill = {}) { if (G.viewAs) return readOnly(); Object.assign(NR, { open: true, type: 'rt_pub', form: '', note: '', subject: null, loc: '', onSent: null }, prefill); }
  /* D41: actions with an active workflow ask for approval instead of running. subject = { kind, id, label, form?, meta? } */
  const openRequestFor = (action, subject) => reqsOf().find(r => OPEN_RQ.includes(r.status) && (rtById(r.type) || {}).action === action && r.subject.kind === subject.kind && r.subject.id === subject.id && (r.subject.meta || '') === (subject.meta || ''));
  function approvalGate(action, subject, run) {
    const f = FORMS.find(x => x.id === (subject.form || subject.id)) || {};
    const t = typeNeeded(action, f); if (!t) return run();
    if (G.viewAs) return readOnly();
    const open = openRequestFor(action, subject);
    if (open) { toast('Already waiting for approval', open.no + ' · ' + RQ_STATUS[open.status].label + '. Open Approvals to follow it.', 'Stamp'); return; }
    newRequest({ type: t.id, subject, loc: f.loc || 'ho' });
  }
  Object.assign(G, { approvalGate, openRequestFor, openReq: (id) => openReq(id), approvalNeeded: (action, formId) => !!typeNeeded(action, FORMS.find(x => x.id === formId) || {}) });
  const typeNeeded = (action, f) => rtypesOf().find(t => t.active && t.action === action && (t.scope === 'all' || !!f.loc));

  /* ---------- step timeline (used by the list rows in compact mode and the request page) */
  const ApprovalSteps = {
    props: { req: Object, compact: Boolean },
    setup(p) {
      const t = computed(() => rtById(p.req.type));
      const steps = computed(() => t.value ? t.value.steps.map((st, i) => {
        const acts = p.req.approvals.filter(a => a.step === i);
        const rej = acts.find(a => a.decision === 'rejected');
        const state = rej ? 'rejected' : i < p.req.step || p.req.status === 'approved' ? 'done' : i === p.req.step && OPEN_RQ.includes(p.req.status) ? 'current' : p.req.status === 'cancelled' && i === p.req.step ? 'cancelled' : 'waiting';
        const res = resolveStep(st, p.req);
        return { st, i, acts, state, res, need: res.need, got: acts.filter(a => a.decision === 'approved').length };
      }) : []);
      const loc = computed(() => (locById(p.req.loc) || {}).name);
      return { t, steps, nameOf, initials, ruleText, loc, agoLong };
    },
    template: `<div v-if="compact" class="flex items-center gap-1" :aria-label="'Step ' + Math.min(req.step + 1, steps.length) + ' of ' + steps.length">
        <span v-for="s in steps" :key="s.i" :title="s.st.name" :class="['h-1.5 w-5 rounded-full', s.state==='done' ? 'bg-c1' : s.state==='current' ? 'bg-warning' : s.state==='rejected' ? 'bg-destructive' : 'bg-muted-foreground/25']"></span></div>
      <ol v-else class="relative grid gap-5 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border">
        <li v-for="s in steps" :key="s.i" class="relative flex gap-3">
          <span :class="['relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 bg-card', s.state==='done' ? 'border-c1 text-c1' : s.state==='current' ? 'border-warning text-warning' : s.state==='rejected' ? 'border-destructive text-destructive' : 'border-border text-muted-foreground']">
            <Icon :name="s.state==='done' ? 'Check' : s.state==='current' ? 'Hourglass' : s.state==='rejected' ? 'X' : 'Circle'" :size="14"/></span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1"><p class="font-medium">Step {{ s.i + 1 }} · {{ s.st.name }}</p>
              <span v-if="s.state==='current'" class="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">Waiting · {{ s.got }} of {{ s.need }}</span>
              <span v-else-if="s.state==='done'" class="rounded-full bg-c1/15 px-2 py-0.5 text-[11px] font-medium">Done</span></div>
            <p class="text-xs text-muted-foreground">{{ ruleText(s.st, loc) }}</p>
            <div v-if="s.state==='current' || s.state==='waiting'" class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="text-xs text-muted-foreground">{{ s.state==='current' ? 'Can approve:' : 'Will go to:' }}</span>
              <span v-for="pp in s.res.people" :key="pp.email" class="inline-flex items-center gap-1.5 rounded-full border bg-background py-0.5 pl-0.5 pr-2 text-xs" :title="pp.why"><span class="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[9px] font-semibold uppercase text-primary">{{ initials(pp.name) }}</span>{{ pp.name }}<span class="hidden text-muted-foreground sm:inline">· {{ pp.why }}</span></span>
              <span v-if="s.res.escalated" class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning"><Icon name="ArrowUp" :size="11"/>Escalated: nobody holds this role here</span>
              <span v-if="s.res.short" class="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"><Icon name="UserRoundX" :size="11"/>Only {{ s.res.need }} can approve, {{ s.st.required }} set · Owner completes it</span></div>
            <ul v-if="s.acts.length" class="mt-2 grid gap-2">
              <li v-for="(a, ai) in s.acts" :key="ai" :class="['rounded-lg border p-2.5 text-sm', a.decision==='rejected' ? 'border-destructive/30 bg-destructive/5' : 'bg-muted/30']">
                <p><span class="font-medium">{{ nameOf(a.by) }}</span> {{ a.decision }}<template v-if="a.actedBy"> <span class="text-muted-foreground">(by {{ nameOf(a.actedBy) }}, delegated)</span></template> <span class="text-xs text-muted-foreground">· {{ agoLong(a.at) }}</span></p>
                <p v-if="a.comment" class="mt-0.5 text-muted-foreground">“{{ a.comment }}”</p></li></ul>
          </div></li></ol>`
  };

  /* ---------- New request dialog */
  const NewRequestDialog = {
    setup() {
      const types = computed(() => rtypesOf().filter(t => t.active).map(t => ({ value: t.id, label: t.name, icon: ACTIONS[t.action].icon })));
      const form = computed(() => FORMS.find(f => f.id === NR.form));
      const t = computed(() => rtById(NR.type));
      const tried = ref(false);
      watch(() => NR.open, v => { if (v) tried.value = false; });
      const reqLoc = computed(() => NR.subject ? NR.loc : form.value ? (form.value.loc || 'ho') : '');
      const preview = computed(() => { if (!t.value || !reqLoc.value) return []; const req = { loc: reqLoc.value, requester: ME.email }; return t.value.steps.map(st => ({ st, ...resolveStep(st, req) })); });
      function submit() {
        tried.value = true; if (!NR.subject && !NR.form) return;
        const f = form.value; const no = 'RQ-2026-' + String(Math.max(0, ...reqsOf().map(r => +r.no.slice(-4))) + 1).padStart(4, '0');
        const r = reactive({ id: ulid('rq'), no, type: NR.type, status: 'submitted', step: 0, requester: ME.email, loc: reqLoc.value, subject: NR.subject ? { ...NR.subject } : { kind: 'form', id: f.id, label: f.title }, note: NR.note.trim(), at: Date.now(), approvals: [] });
        r.log = reactive([]); reqsOf().unshift(r); notifyStep(r); NR.open = false; toast('Request sent', no + ' goes to ' + preview.value[0].people.map(p => p.name).join(', ') + '. You can keep working; we notify you when it is decided.', 'Send');
        if (!NR.subject) openReq(r.id);
      }
      return { NR, types, t, form, preview, submit, tried, ruleText, ACTIONS, locName, reqLoc, locById };
    },
    template: `<Dialog :open="NR.open" @update:open="v => NR.open = v">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">{{ NR.subject ? 'This needs approval' : 'New request' }}</h2><p class="text-sm text-muted-foreground">{{ NR.subject ? 'A workflow is on for this action. Send it for sign-off; it runs by itself once approved.' : 'Ask for sign-off on an action that needs approval.' }}</p></div>
      <div class="grid grid-cols-[minmax(0,1fr)] gap-3">
        <div v-if="NR.subject" class="flex items-start gap-3 rounded-lg border p-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="ACTIONS[t.action].icon" :size="16"/></span><div class="min-w-0 text-sm"><p class="font-medium">{{ t.name }}</p><p class="text-muted-foreground">{{ NR.subject.label }}</p><p v-if="NR.subject.meta" class="text-xs text-muted-foreground">{{ NR.subject.meta }}</p></div></div>
        <template v-else>
        <div class="grid gap-1.5"><span class="text-sm font-medium">What for</span><Select v-model="NR.type" :options="types"/></div>
        <ApiSelect v-model="NR.form" module="forms" label="Form" required placeholder="Choose a form" :error="tried && !NR.form ? 'Choose the form this is about.' : ''"/></template>
        <div class="grid gap-1.5"><label for="nr-note" class="text-sm font-medium">Note for approvers</label><Textarea id="nr-note" v-model="NR.note" :rows="3" placeholder="Why, and by when"/></div>
        <div v-if="preview.length" class="rounded-lg border bg-muted/30 p-3 text-sm"><p class="font-medium">Route</p><p class="text-xs text-muted-foreground">Location: {{ reqLoc === 'ho' ? 'Head Office (organisation-wide)' : (locById(reqLoc) || {}).name }}</p>
          <ol class="mt-2 grid gap-1.5"><li v-for="(p, i) in preview" :key="i" class="flex gap-2"><span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-background text-[11px] font-semibold tnum ring-1 ring-border">{{ i + 1 }}</span><span class="min-w-0"><span class="font-medium">{{ p.st.name }}</span> → {{ p.people.map(x => x.name).join(', ') }}<span v-if="p.escalated" class="text-warning"> (escalated)</span><span v-if="p.short" class="text-warning"> (short: Owner joins)</span></span></li></ol>
          <p class="mt-2 text-xs text-muted-foreground">When approved: {{ ACTIONS[t.action].effect }}</p></div>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="NR.open=false">Cancel</Button><Button @click="submit"><Icon name="Send" :size="14"/>Send for approval</Button></div>
    </Dialog>`
  };

  /* ---------- Approvals inbox */
  const ApprovalsPage = {
    setup() {
      const me = () => G.viewAs ? G.viewAs.email : ME.email;
      const seeAll = computed(() => !G.viewAs && ['owner', 'admin'].includes(G.org.role));
      const Q = reactive({ tab: waitingForMe.value.length ? 'mine' : 'sent' });
      const base = computed(() => Q.tab === 'mine' ? waitingForMe.value : Q.tab === 'sent' ? reqsOf().filter(r => r.requester === me()) : reqsOf().filter(r => seeAll.value || r.requester === me() || inScope(r.loc)));
      const LS = useList({ noun: 'requests', rows: () => base.value, search: (r, q) => (r.no + ' ' + r.subject.label + ' ' + nameOf(r.requester)).toLowerCase().includes(q), sort: 'at', dir: 'desc',
        sorts: [{ value: 'at', label: 'Submitted', get: r => r.at }, { value: 'no', label: 'Number', get: r => r.no }],
        fields: () => [
          { key: 'status', label: 'Status', type: 'select', options: Object.entries(RQ_STATUS).filter(([k]) => k !== 'draft').map(([value, s]) => ({ value, label: s.label })), get: r => r.status },
          { key: 'type', label: 'Type', type: 'select', options: rtypesOf().map(t => ({ value: t.id, label: t.name })), get: r => r.type },
          { key: 'loc', label: 'Location', type: 'select_paginated', module: 'locations', get: r => r.loc },
          { key: 'requester', label: 'Requested by', type: 'select_paginated', module: 'members', get: r => r.requester },
          { key: 'at', label: 'Submitted', type: 'date', get: r => isoDay(new Date(r.at)) },
        ] });
      watchEffect(() => { if (G.view === 'approvals') listCount.value = (G.search || '').trim().length >= 2 ? LS.rows.value.length : null; });
      const tabs = computed(() => [{ value: 'mine', label: 'Waiting for me', count: waitingForMe.value.length }, { value: 'sent', label: 'My requests', count: reqsOf().filter(r => r.requester === me()).length }, { value: 'all', label: seeAll.value ? 'All' : 'My locations' }]);
      const D = reactive({ req: null, mode: 'approve', comment: '' });
      function quick(r, mode) { D.req = r; D.mode = mode; D.comment = ''; }
      function confirm() { if (D.mode === 'reject' && !D.comment.trim()) return; decide(D.req, D.mode === 'approve' ? 'approved' : 'rejected', D.comment.trim()); D.req = null; }
      const canCreate = () => !G.viewAs && myPerms.value.includes('Requests.create');
      return { G, Q, LS, tabs, RQ_STATUS, ACTIONS, rtById, nameOf, initials, locById, openReq, actingFor, agoLong, D, quick, confirm, newRequest, canCreate, waitingForMe };
    },
    template: `<div class="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Approvals</h2><p class="text-sm text-muted-foreground">Requests that need sign-off before they take effect. Approvers come from roles at the request's location and above.</p></div>
      <div class="-mb-1 max-w-full overflow-x-auto"><Tabs v-model="Q.tab" :items="tabs"/></div>
      <ListToolbar :list="LS"><Button v-if="canCreate()" size="sm" @click="newRequest()"><Icon name="Plus" :size="15"/>New request</Button></ListToolbar>
      <div v-if="LS.rows.value.length" :class="['kpi overflow-hidden rounded-xl border bg-card shadow-sm transition-opacity', LS.S.loading && 'pointer-events-none opacity-60']">
        <ul class="divide-y"><li v-for="r in LS.rows.value" :key="r.id" class="relative flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 hover:bg-muted/40 sm:flex-nowrap sm:px-4">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="ACTIONS[rtById(r.type).action].icon" :size="16"/></span>
          <button type="button" class="min-w-0 flex-1 basis-[calc(100%-3.5rem)] text-left after:absolute after:inset-0 after:content-[''] sm:basis-auto" @click="openReq(r.id)">
            <p class="flex items-center gap-2"><span class="truncate text-sm font-medium">{{ rtById(r.type).name }}: {{ r.subject.label }}</span></p>
            <p class="truncate text-xs text-muted-foreground"><span class="font-mono">{{ r.no }}</span> · {{ nameOf(r.requester) }} · {{ (locById(r.loc) || {}).name }} · {{ agoLong(r.at) }}</p></button>
          <ApprovalSteps :req="r" compact class="hidden md:flex"/>
          <span :class="['ml-12 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:ml-0', RQ_STATUS[r.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', RQ_STATUS[r.status].dot]"></span>{{ RQ_STATUS[r.status].label }}</span>
          <div v-if="actingFor(r) && !G.viewAs" class="relative z-10 ml-auto flex gap-1.5 sm:ml-0"><Button size="sm" variant="outline" class="h-8" @click="quick(r, 'reject')">Reject</Button><Button size="sm" class="h-8" @click="quick(r, 'approve')"><Icon name="Check" :size="14"/>Approve</Button></div>
          <Icon v-else name="ChevronRight" :size="16" class="hidden shrink-0 text-muted-foreground sm:block"/>
        </li></ul></div>
      <div v-else class="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 text-center"><Icon name="Stamp" :size="24" class="text-muted-foreground/60"/><p class="text-sm text-muted-foreground">{{ Q.tab==='mine' ? 'Nothing is waiting for you.' : 'No requests match.' }}</p></div>
      <ApproveDialog :state="D" @confirm="confirm"/>
    </div>`
  };
  const ApproveDialog = {
    props: { state: Object }, emits: ['confirm'],
    setup(p) { const act = computed(() => p.state.req && actingFor(p.state.req)); return { act, rtById, nameOf }; },
    template: `<Dialog :open="!!state.req" @update:open="v => { if (!v) state.req = null }">
      <template v-if="state.req"><div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">{{ state.mode==='approve' ? 'Approve' : 'Reject' }} {{ state.req.no }}?</h2><p class="text-sm text-muted-foreground">{{ rtById(state.req.type).name }}: {{ state.req.subject.label }}</p></div>
        <p v-if="act && !act.self" class="flex items-center gap-2 rounded-lg border border-c3/30 bg-c3/10 px-3 py-2 text-sm"><Icon name="Forward" :size="15"/>You are acting for {{ nameOf(act.for) }} (delegated until {{ act.until }}).</p>
        <div class="grid gap-1.5"><label for="ap-c" :class="['text-sm font-medium', state.mode==='reject' && 'after:ml-0.5 after:text-destructive after:content-[\\'*\\']']">{{ state.mode==='approve' ? 'Comment (optional)' : 'Reason' }}</label><Textarea id="ap-c" v-model="state.comment" :rows="3" :placeholder="state.mode==='approve' ? 'Anything the requester should know' : 'Tell them what to change'"/><p v-if="state.mode==='reject'" class="text-xs text-muted-foreground">The requester sees this reason.</p></div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="state.req=null">Cancel</Button><Button :variant="state.mode==='reject' ? 'destructive' : 'default'" :disabled="state.mode==='reject' && !state.comment.trim()" @click="$emit('confirm')"><Icon :name="state.mode==='approve' ? 'Check' : 'X'" :size="14"/>{{ state.mode==='approve' ? 'Approve' : 'Reject' }}</Button></div></template>
    </Dialog>`
  };

  /* ---------- Request detail */
  const RequestPage = {
    setup() {
      const req = computed(() => reqById(G.reqId));
      const T = reactive({ tab: G.pendingTab || 'overview', loading: false, updatedAt: Date.now() });
      watch(() => G.reqId, () => { T.tab = 'overview'; });
      watch(req, r => { if (r) seedLog(r); }, { immediate: true });
      const log = computed(() => req.value && req.value.log ? [...req.value.log].sort((a, b) => b.at - a.at) : []);
      const logGroups = computed(() => { const out = []; log.value.forEach(x => { const k = x.at + x.event + x.to; let g = out.find(o => o.k === k); if (!g) { g = { k, at: x.at, event: x.event, to: x.to, step: x.step, items: [] }; out.push(g); } g.items.push(x); }); return out; });
      const nextReminder = computed(() => { const r = req.value; if (!r || !OPEN_RQ.includes(r.status)) return null; const t = rtById(r.type); if (!t.notify.events.remind) return null; const stp = t.steps[r.step]; const doneBy = r.approvals.filter(a => a.step === r.step).map(a => a.by); if (!stp || !resolveStep(stp, r).people.some(p => !doneBy.includes(p.email))) return null; const sent = (r.log || []).filter(x => x.event === 'remind' && x.step === (t.steps[r.step] || {}).name && x.channel === 'inapp'); const rounds = new Set(sent.map(x => x.at)).size; if (rounds >= t.notify.remindMax) return { done: true, max: t.notify.remindMax }; const last = Math.max(...(r.log || []).filter(x => x.step === (t.steps[r.step] || {}).name).map(x => x.at), r.at); return { inH: Math.max(1, Math.round((last + t.notify.remindHours * 3600e3 - Date.now()) / 3600e3)), n: rounds + 1, max: t.notify.remindMax }; });
      function nudge() { const r = req.value; const t = rtById(r.type); const st = t.steps[r.step]; const done = r.approvals.filter(a => a.step === r.step).map(a => a.by); dispatch(r, 'remind', resolveStep(st, r).people.map(p => p.email).filter(e => !done.includes(e)), st); toast('Reminder sent', 'On ' + stepChannels(t, st).map(c => CHANNELS[c].label).join(', ') + '.', 'AlarmClock'); T.tab = 'notifications'; }
      const t = computed(() => req.value && rtById(req.value.type));
      const act = computed(() => req.value && actingFor(req.value));
      const D = reactive({ req: null, mode: 'approve', comment: '' });
      function open(mode) { if (G.viewAs) return readOnly(); D.req = req.value; D.mode = mode; D.comment = ''; }
      function confirm() { if (D.mode === 'reject' && !D.comment.trim()) return; decide(D.req, D.mode === 'approve' ? 'approved' : 'rejected', D.comment.trim()); D.req = null; }
      function refresh() { if (T.loading) return; T.loading = true; setTimeout(() => { T.loading = false; T.updatedAt = Date.now(); }, 700); }
      const isMine = computed(() => req.value && req.value.requester === ME.email && OPEN_RQ.includes(req.value.status) && !G.viewAs);
      const moreItems = computed(() => [{ id: 'copy', label: 'Copy link', icon: 'Link' }, ...(req.value && OPEN_RQ.includes(req.value.status) && (isMine.value || canManage()) ? [{ id: 'nudge', label: 'Send a reminder now', icon: 'AlarmClock' }] : []), ...(isMine.value ? [{ separator: true }, { id: 'cancel', label: 'Cancel request', icon: 'Ban', destructive: true }] : [])]);
      function onMore(it) { if (it.id === 'nudge') return nudge(); if (it.id === 'copy') toast('Link copied', PRODUCT.domain + '/' + G.org.slug + '/approvals/' + req.value.no, 'Link'); if (it.id === 'cancel') { req.value.status = 'cancelled'; toast('Request cancelled', req.value.no, 'Ban'); } }
      const banner = computed(() => { const r = req.value; if (!r) return null; const last = r.approvals[r.approvals.length - 1];
        if (r.status === 'approved') return { tone: 'ok', icon: 'CircleCheck', text: 'Approved' + (last ? ' by ' + nameOf(last.by) + ' ' + agoLong(last.at) : '') + '. ' + ACTIONS[t.value.action].effect + ' It is read-only now.' };
        if (r.status === 'rejected') return { tone: 'bad', icon: 'CircleX', text: 'Rejected by ' + nameOf(last.by) + ': “' + last.comment + '” It is read-only; send a new request after changes.' };
        if (r.status === 'cancelled') return { tone: 'muted', icon: 'Ban', text: 'Cancelled by ' + nameOf(r.requester) + '. It is read-only.' }; return null; });
      const hist = computed(() => { const r = req.value; if (!r) return []; return [...r.approvals.map(a => ({ icon: a.decision === 'approved' ? 'Check' : 'X', text: nameOf(a.by) + ' ' + a.decision + ' step ' + (a.step + 1) + (a.actedBy ? ' (by ' + nameOf(a.actedBy) + ', delegated)' : ''), at: a.at })).reverse(), { icon: 'Send', text: nameOf(r.requester) + ' submitted the request', at: r.at }]; });
      const completable = computed(() => canComplete(req.value));
      return { log, logGroups, nextReminder, CHANNELS, NEVENTS, completable, completeStep, G, req, t, T, act, D, open, confirm, refresh, moreItems, onMore, banner, hist, RQ_STATUS, ACTIONS, nameOf, initials, nav, agoLong, openForm, FORMS, isMine, memberByEmail, ROLE };
    },
    template: `<div v-if="!req" class="mx-auto grid max-w-md place-items-center gap-2 py-16 text-center"><Icon name="SearchX" :size="24" class="text-muted-foreground/60"/><p class="font-medium">Request not found</p><Button variant="outline" @click="nav('approvals')"><Icon name="ArrowLeft" :size="14"/>Approvals</Button></div>
    <div v-else class="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb"><button type="button" class="hover:text-foreground" @click="nav('approvals')">Approvals</button><Icon name="ChevronRight" :size="12"/><span class="font-mono font-medium text-foreground">{{ req.no }}</span></nav>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="ACTIONS[t.action].icon" :size="20"/></span>
          <div class="min-w-0"><h2 class="text-xl font-semibold tracking-tight sm:text-2xl" style="text-wrap:balance">{{ t.name }}: {{ req.subject.label }}</h2><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span class="font-mono text-xs">{{ req.no }}</span><span>·</span><span>{{ agoLong(req.at) }}</span><span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', RQ_STATUS[req.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', RQ_STATUS[req.status].dot]"></span>{{ RQ_STATUS[req.status].label }}</span></p></div></div>
        <div class="flex flex-wrap gap-1.5"><RefreshButton :loading="T.loading" :updated-at="T.updatedAt" @refresh="refresh"/><Button v-if="completable && !act" @click="completeStep(req)"><Icon name="CheckCheck" :size="14"/>Complete step as Owner</Button><template v-if="act && !G.viewAs"><Button variant="outline" @click="open('reject')"><Icon name="X" :size="14"/>Reject</Button><Button @click="open('approve')"><Icon name="Check" :size="14"/>Approve</Button></template><DropdownMenu :items="moreItems" @select="onMore"><template #trigger><Button variant="outline" size="icon" aria-label="More actions"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></div>
      </div>
      <div v-if="banner" :class="['flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm', banner.tone==='ok' ? 'border-c1/30 bg-c1/10' : banner.tone==='bad' ? 'border-destructive/30 bg-destructive/5' : 'bg-muted/50']"><Icon :name="banner.icon" :size="16" :class="['mt-0.5 shrink-0', banner.tone==='ok' ? 'text-c1' : banner.tone==='bad' ? 'text-destructive' : 'text-muted-foreground']"/><p>{{ banner.text }}</p></div>
      <p v-else-if="act && !act.self" class="flex items-center gap-2 rounded-lg border border-c3/30 bg-c3/10 px-3 py-2 text-sm"><Icon name="Forward" :size="15"/>{{ nameOf(act.for) }} delegated this to you until {{ act.until }}.</p>
      <p v-if="completable" class="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm"><Icon name="TriangleAlert" :size="15" class="mt-0.5 shrink-0 text-warning"/><span>This step asks for more approvals than people who can give them (the requester can't approve their own request). It has every approval it can get, so as Owner you complete it. The workflow is flagged in Approval workflows until it is fixed.</span></p>
      <div class="max-w-full overflow-x-auto"><Tabs v-model="T.tab" :items="[{value:'overview',label:'Overview'},{value:'notifications',label:'Notifications',count:logGroups.length},{value:'history',label:'History'}]"/></div>
      <div :class="['grid grid-cols-1 gap-3 transition-opacity lg:grid-cols-[minmax(0,1fr)_20rem] [&>*]:min-w-0', T.loading && 'pointer-events-none opacity-60']">
        <template v-if="T.tab==='overview'">
          <Card class="kpi"><div class="p-4"><h3 class="text-sm font-semibold">Approval steps</h3><div class="mt-3"><ApprovalSteps :req="req"/></div></div></Card>
          <div class="grid content-start gap-3">
            <Card class="kpi" style="animation-delay:60ms"><div class="p-4"><h3 class="text-sm font-semibold">Request</h3>
              <dl class="mt-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
                <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="UserPlus" :size="13"/>By</dt><dd class="flex items-center gap-1.5"><span class="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[9px] font-semibold uppercase text-primary">{{ initials(nameOf(req.requester)) }}</span>{{ nameOf(req.requester) }}</dd>
                <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="MapPin" :size="13"/>Location</dt><dd><RelatedLink :loc-id="req.loc"/></dd>
                <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="ClipboardList" :size="13"/>About</dt><dd><button v-if="req.subject.kind==='form'" type="button" class="text-left text-primary underline-offset-4 hover:underline" @click="openForm(FORMS.find(f => f.id===req.subject.id) || {})">{{ req.subject.label }}</button><span v-else>{{ req.subject.label }}</span></dd>
                <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="AlignLeft" :size="13"/>Note</dt><dd>{{ req.note || '–' }}</dd></dl></div></Card>
            <Card class="kpi" style="animation-delay:120ms"><div class="p-4"><h3 class="text-sm font-semibold">When approved</h3><p class="mt-1 text-sm text-muted-foreground">{{ ACTIONS[t.action].effect }}</p></div></Card>
          </div>
        </template>
        <Card v-else-if="T.tab==='notifications'" class="kpi lg:col-span-2"><div class="p-4">
          <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="text-sm font-semibold">Who was told, and how</h3>
            <p v-if="nextReminder" class="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon name="AlarmClock" :size="13"/>{{ nextReminder.done ? 'All ' + nextReminder.max + ' reminders sent' : 'Reminder ' + nextReminder.n + ' of ' + nextReminder.max + ' in about ' + nextReminder.inH + 'h' }}</p></div>
          <ol v-if="logGroups.length" class="mt-3 divide-y rounded-lg border">
            <li v-for="g in logGroups" :key="g.k" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 p-3">
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="NEVENTS[g.event].icon" :size="14"/></span>
              <div class="min-w-0 flex-1"><p class="text-sm"><span class="font-medium">{{ nameOf(g.to) }}</span> <span class="text-muted-foreground">· {{ NEVENTS[g.event].label }}<template v-if="g.step"> · {{ g.step }}</template></span></p><p class="text-xs text-muted-foreground">{{ agoLong(g.at) }}</p></div>
              <div class="flex w-full flex-wrap gap-1 pl-11 sm:w-auto sm:pl-0"><span v-for="x in g.items" :key="x.channel" :title="x.why" :class="['inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium', x.status==='sent' ? 'bg-c1/15' : x.status==='held' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground line-through decoration-muted-foreground/60']"><Icon :name="x.status==='held' ? 'Moon' : CHANNELS[x.channel].icon" :size="11"/>{{ CHANNELS[x.channel].label }}<span v-if="x.why" class="no-underline">· {{ x.why }}</span></span></div>
            </li></ol>
          <p v-else class="mt-4 text-sm text-muted-foreground">Nothing sent yet.</p>
          <p class="mt-2 text-xs text-muted-foreground">Crossed out = skipped, amber = held for quiet hours. In-app always goes; people can turn off the others unless the step marks them required. Emails link to this page; deciding needs sign-in.</p></div></Card>
        <Card v-else class="kpi lg:col-span-2"><div class="p-4"><ol class="grid gap-3"><li v-for="(h, i) in hist" :key="i" class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="h.icon" :size="13"/></span><div class="text-sm"><p>{{ h.text }}</p><p class="text-xs text-muted-foreground">{{ agoLong(h.at) }}</p></div></li></ol></div></Card>
      </div>
      <ApproveDialog :state="D" @confirm="confirm"/>
    </div>`
  };

  /* ---------- Personal notification settings (D43): opt out of email / SMS / push; in-app stays on */
  const NotifPrefsSheet = {
    setup() { const p = computed(() => prefsOf(ME.email)); const me = computed(() => MEMBERS.find(m => m.email === ME.email) || ME); return { G, p, CHANNELS, me, APP_USERS, ME }; },
    template: `<Sheet :open="!!G.myNotifs" @update:open="v => G.myNotifs = v">
      <div class="border-b p-4 pr-12"><h2 class="font-semibold">Notification settings</h2><p class="text-sm text-muted-foreground">How approval requests reach you. In-app always stays on.</p></div>
      <div class="grid content-start gap-3 overflow-y-auto p-4">
        <div v-for="(c, k) in CHANNELS" :key="k" class="flex items-center gap-3 rounded-lg border p-3">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="c.icon" :size="16"/></span>
          <div class="min-w-0 flex-1"><p class="text-sm font-medium">{{ c.label }}</p><p class="truncate text-xs text-muted-foreground">{{ k==='inapp' ? 'Bell and Approvals badge' : k==='email' ? me.email : k==='sms' ? (me.phone || 'Add a phone number first') : (APP_USERS.has(ME.email) ? 'Fomu app on your phone' : 'Install the app to get push') }}</p></div>
          <Switch v-if="k!=='inapp'" v-model="p[k]" :aria-label="c.label"/><Icon v-else name="Lock" :size="14" class="text-muted-foreground" aria-label="Always on"/></div>
        <p class="text-xs text-muted-foreground">Some workflow steps mark their channels as required; those still reach you so urgent sign-offs are not missed.</p>
      </div></Sheet>`
  };

  /* ---------- Approval workflows (request types + steps editor) */
  const RequestTypesPage = {
    setup() {
      const ED = reactive({ open: false, t: null, preview: 'aru' });
      function edit(t) { ED.t = JSON.parse(JSON.stringify(t)); ED.open = true; }
      function addStep() { ED.t.steps.push({ id: ulid('s'), name: 'Step ' + (ED.t.steps.length + 1), approvers: [{ kind: 'main', id: 'admin' }], combinator: 'or', required: 1, notify: null }); }
      const toggleChan = (arr, k) => { if (k === 'inapp') return; const i = arr.indexOf(k); i > -1 ? arr.splice(i, 1) : arr.push(k); };
      function move(i, d) { const s = ED.t.steps; const [x] = s.splice(i, 1); s.splice(i + d, 0, x); }
      const addOpts = computed(() => [{ group: 'Custom roles (at the location or above)', value: '__g1' }, ...ROLES.filter(r => !r.system).map(r => ({ value: 'role:' + r.id, label: r.name })), { group: 'Main roles', value: '__g2' }, ...['owner', 'admin', 'editor'].map(r => ({ value: 'main:' + r, label: ROLE[r] })), { group: 'Permission', value: '__g3' }, ...['Responses.export', 'Forms.publish', 'Locations.manage'].map(p => ({ value: 'perm:' + p, label: 'Anyone with ' + p })), { group: 'Person', value: '__g4' }, ...MEMBERS.filter(m => !m.invited).map(m => ({ value: 'user:' + m.email, label: m.name }))]);
      function addApprover(st, v) { const [kind, id] = v.split(/:(.+)/); if (!st.approvers.some(a => a.kind === kind && a.id === id)) st.approvers.push({ kind, id }); }
      const actionOpts = Object.entries(ACTIONS).map(([value, a]) => ({ value, label: a.label + ' (' + value + ')', icon: a.icon }));
      const locOpts = computed(() => locsOf().filter(l => l.parent).map(l => ({ value: l.id, label: l.name })));
      const previewFor = (st) => resolveStep(st, { loc: ED.preview, requester: '' });
      const valid = computed(() => ED.t && ED.t.name.trim() && ED.t.steps.length && ED.t.steps.every(s => s.name.trim() && s.approvers.length && s.required >= 1 && stepCapacity(s).ok));
      function save() { const i = rtypesOf().findIndex(x => x.id === ED.t.id); if (i >= 0) rtypesOf().splice(i, 1, ED.t); else rtypesOf().push(ED.t); ED.open = false; toast('Workflow saved', 'Open requests keep the steps they started with.', 'Workflow'); }
      function create() { edit({ id: ulid('rt'), name: '', action: 'Forms.publish', active: true, scope: 'all', desc: '', steps: [], notify: defaultNotify() }); addStep(); }
      const openCount = (t) => reqsOf().filter(r => r.type === t.id && OPEN_RQ.includes(r.status)).length;
      function toggleActive(t, v) { if (v && !workflowOk(t)) { t.active = false; toast('Fix the workflow first', 'A step needs more approvers than can give them. Open it to see which.', 'TriangleAlert'); return; } toast(v ? 'Workflow on' : 'Workflow off', t.name, 'Workflow'); }
      return { G, ED, edit, addStep, move, addOpts, addApprover, actionOpts, locOpts, previewFor, valid, save, create, rtypesOf, ACTIONS, approverText, openCount, canManage, toast, stepCapacity, workflowOk, toggleActive, CHANNELS, NEVENTS, toggleChan, stepChannels, quiet: quietOf, nav };
    },
    template: `<div class="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3"><div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Approval workflows</h2><p class="text-sm text-muted-foreground">Which actions need sign-off, and who signs at each step.</p></div><Button v-if="canManage()" @click="create"><Icon name="Plus" :size="15"/>New workflow</Button></div>
      <div class="grid gap-3">
        <article v-for="(t, i) in rtypesOf()" :key="t.id" class="kpi relative rounded-xl border bg-card p-4 shadow-sm" :style="{ animationDelay: (i*50)+'ms' }">
          <div class="flex flex-wrap items-start gap-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="ACTIONS[t.action].icon" :size="17"/></span>
            <button type="button" class="min-w-0 flex-1 text-left after:absolute after:inset-0 after:content-['']" @click="edit(t)"><p class="font-semibold">{{ t.name }}</p><p class="text-sm text-muted-foreground">{{ t.desc }}</p><p class="mt-0.5 font-mono text-[11px] text-muted-foreground">{{ t.action }} · {{ t.scope==='location' ? 'location-owned only' : 'everywhere' }}</p></button>
            <div class="relative z-10 flex items-center gap-2"><span v-if="!workflowOk(t)" class="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"><Icon name="TriangleAlert" :size="11"/>Can't be met</span><span v-if="openCount(t)" class="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">{{ openCount(t) }} open</span><Switch v-model="t.active" :disabled="!canManage()" :aria-label="(t.active ? 'Turn off ' : 'Turn on ') + t.name" @update:model-value="v => toggleActive(t, v)"/></div></div>
          <p v-if="!workflowOk(t) && t.active" class="relative z-10 mt-2 flex items-start gap-2 rounded-md bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive"><Icon name="TriangleAlert" :size="13" class="mt-px shrink-0"/>A step needs more approvers than can give them. Requests escalate to the Owner until you fix it; it can't be saved as it is.</p>
          <ol class="mt-3 flex flex-wrap items-center gap-1.5 text-xs"><template v-for="(s, si) in t.steps" :key="s.id"><li class="rounded-md border bg-muted/40 px-2 py-1"><span class="font-medium">{{ si + 1 }}. {{ s.name }}</span><span class="text-muted-foreground"> · {{ s.required > 1 ? s.required + ' of ' : 'any of ' }}{{ s.approvers.map(approverText).join(', ') }}</span><span class="ml-1.5 inline-flex translate-y-0.5 items-center gap-0.5 text-muted-foreground" :aria-label="'Notifies on ' + stepChannels(t, s).map(c => CHANNELS[c].label).join(', ')"><Icon v-for="c in stepChannels(t, s)" :key="c" :name="CHANNELS[c].icon" :size="11"/><Icon v-if="s.notify && s.notify.required" name="Asterisk" :size="10" class="text-warning"/></span></li><Icon v-if="si < t.steps.length - 1" name="ChevronRight" :size="13" class="text-muted-foreground"/></template></ol>
        </article></div>
      <Sheet :open="ED.open" @update:open="v => ED.open = v"><template v-if="ED.t">
        <div class="border-b p-4 pr-12"><h2 class="font-semibold">{{ ED.t.name || 'New workflow' }}</h2><p class="text-sm text-muted-foreground">Steps run in order. Each step needs its count of approvals before the next starts.</p></div>
        <div class="flex-1 overflow-y-auto overscroll-contain p-4"><div class="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div class="grid gap-1.5"><label for="rt-n" class="text-sm font-medium after:ml-0.5 after:text-destructive after:content-['*']">Name</label><Input id="rt-n" v-model="ED.t.name" placeholder="Publish a form"/></div>
          <div class="grid gap-1.5"><span class="text-sm font-medium">Action that needs approval</span><Select v-model="ED.t.action" :options="actionOpts"/></div>
          <div class="grid gap-1.5"><span class="text-sm font-medium">Applies to</span><div class="inline-flex w-fit rounded-md border bg-muted/40 p-0.5" role="radiogroup" aria-label="Applies to"><button v-for="o in [['all','Everything'],['location','Location-owned only']]" :key="o[0]" type="button" role="radio" :aria-checked="ED.t.scope===o[0]" @click="ED.t.scope=o[0]" :class="['h-7 rounded px-3 text-xs font-medium', ED.t.scope===o[0] ? 'bg-background shadow' : 'text-muted-foreground']">{{ o[1] }}</button></div></div>
          <div class="grid gap-3 rounded-lg border p-3">
            <div><h3 class="text-sm font-semibold">Notifications</h3><p class="text-xs text-muted-foreground">Default channels for every step. A step can override them below. Emails link to the request; approvers sign in to decide.</p></div>
            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Default channels"><button v-for="(c, k) in CHANNELS" :key="k" type="button" :disabled="k==='inapp'" :aria-pressed="ED.t.notify.channels.includes(k)" @click="toggleChan(ED.t.notify.channels, k)" :class="['inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:cursor-default', ED.t.notify.channels.includes(k) ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-accent']"><Icon :name="ED.t.notify.channels.includes(k) ? 'Check' : c.icon" :size="13"/>{{ c.label }}<Icon v-if="k==='inapp'" name="Lock" :size="11" class="text-muted-foreground"/></button></div>
            <ul class="divide-y rounded-md border">
              <li v-for="(e, k) in NEVENTS" :key="k" class="grid gap-2 px-3 py-2">
                <label class="flex items-center gap-3"><Icon :name="e.icon" :size="15" class="text-muted-foreground"/><span class="min-w-0 flex-1"><span class="block text-sm">{{ e.label }}</span><span class="block text-[11px] text-muted-foreground">To {{ e.who.toLowerCase() }}</span></span><Switch v-model="ED.t.notify.events[k]" :aria-label="e.label"/></label>
                <div v-if="k==='remind' && ED.t.notify.events.remind" class="flex flex-wrap items-center gap-2 pl-7 text-xs text-muted-foreground">Every<Select size="sm" class="w-28" :model-value="String(ED.t.notify.remindHours)" @update:model-value="v => ED.t.notify.remindHours = +v" :options="[4,8,12,24,48].map(h => ({ value: String(h), label: h + ' hours' }))"/>up to<Select size="sm" class="w-24" :model-value="String(ED.t.notify.remindMax)" @update:model-value="v => ED.t.notify.remindMax = +v" :options="[1,2,3,5].map(n => ({ value: String(n), label: n + (n===1 ? ' time' : ' times') }))"/></div>
              </li></ul>
            <p class="flex items-start gap-1.5 text-xs text-muted-foreground"><Icon name="Moon" :size="13" class="mt-px shrink-0"/><span>SMS and push wait for quiet hours ({{ quiet().on ? quiet().from + '–' + quiet().to + ' EAT' : 'off' }}) unless the step is required. <button type="button" class="text-primary underline-offset-4 hover:underline" @click="ED.open=false; nav('workspace')">Change in Settings</button></span></p>
          </div>
          <div class="flex items-center justify-between gap-3"><h3 class="text-sm font-semibold">Steps</h3><div class="flex items-center gap-2 text-xs text-muted-foreground"><span class="hidden sm:inline">Preview at</span><Select size="sm" class="w-40" v-model="ED.preview" :options="locOpts" align="end"/></div></div>
          <div v-for="(s, i) in ED.t.steps" :key="s.id" class="grid gap-3 rounded-lg border p-3">
            <div class="flex items-center gap-2"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{{ i + 1 }}</span><Input v-model="s.name" class="h-8" :aria-label="'Step ' + (i+1) + ' name'"/>
              <Button variant="ghost" size="icon-sm" :disabled="i===0" :aria-label="'Move step ' + (i+1) + ' up'" @click="move(i,-1)"><Icon name="ArrowUp" :size="14"/></Button><Button variant="ghost" size="icon-sm" :disabled="i===ED.t.steps.length-1" :aria-label="'Move step ' + (i+1) + ' down'" @click="move(i,1)"><Icon name="ArrowDown" :size="14"/></Button><Button variant="ghost" size="icon-sm" class="text-destructive" :aria-label="'Remove step ' + (i+1)" @click="ED.t.steps.splice(i,1)"><Icon name="Trash2" :size="14"/></Button></div>
            <div class="grid gap-1.5"><span class="text-xs font-medium text-muted-foreground">Who can approve</span>
              <div class="flex flex-wrap gap-1.5"><span v-for="(a, ai) in s.approvers" :key="a.kind + a.id" class="inline-flex items-center gap-1 rounded-full border bg-background py-0.5 pl-2.5 pr-1 text-xs">{{ approverText(a) }}<button type="button" class="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-accent" :aria-label="'Remove ' + approverText(a)" @click="s.approvers.splice(ai,1)"><Icon name="X" :size="11"/></button></span>
                <Select size="sm" class="w-40" :model-value="''" placeholder="Add approver" :options="addOpts" @update:model-value="v => addApprover(s, v)"/></div></div>
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <div class="inline-flex rounded-md border bg-muted/40 p-0.5" role="radiogroup" :aria-label="'Step ' + (i+1) + ' match'"><button v-for="o in [['or','Any of these'],['and','All of these']]" :key="o[0]" type="button" role="radio" :aria-checked="s.combinator===o[0]" @click="s.combinator=o[0]" :class="['h-7 rounded px-2.5 text-xs font-medium', s.combinator===o[0] ? 'bg-background shadow' : 'text-muted-foreground']">{{ o[1] }}</button></div>
              <span class="flex items-center gap-1.5 text-xs text-muted-foreground">Approvals needed<span class="inline-flex items-center rounded-md border"><button type="button" class="grid h-7 w-7 place-items-center" aria-label="Fewer" :disabled="s.required<=1" @click="s.required--"><Icon name="Minus" :size="12"/></button><span class="w-6 text-center text-sm font-medium tnum text-foreground">{{ s.required }}</span><button type="button" class="grid h-7 w-7 place-items-center" aria-label="More" @click="s.required++"><Icon name="Plus" :size="12"/></button></span></span></div>
            <div class="grid gap-2 rounded-md border border-dashed p-2.5">
              <div class="flex flex-wrap items-center gap-2 text-xs"><Icon name="BellRing" :size="13" class="text-muted-foreground"/><span class="font-medium">Notify on</span>
                <span v-if="!s.notify" class="text-muted-foreground">{{ ED.t.notify.channels.map(c => CHANNELS[c].label).join(', ') }} (workflow default)</span>
                <span class="flex-1"></span><Button variant="ghost" size="sm" class="h-7 text-xs" @click="s.notify = s.notify ? null : { channels: [...ED.t.notify.channels], required: false }">{{ s.notify ? 'Use workflow default' : 'Override for this step' }}</Button></div>
              <template v-if="s.notify"><div class="flex flex-wrap gap-1.5" role="group" :aria-label="'Step ' + (i+1) + ' channels'"><button v-for="(c, k) in CHANNELS" :key="k" type="button" :disabled="k==='inapp'" :aria-pressed="s.notify.channels.includes(k)" @click="toggleChan(s.notify.channels, k)" :class="['inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium disabled:cursor-default', s.notify.channels.includes(k) ? 'border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent']"><Icon :name="s.notify.channels.includes(k) ? 'Check' : c.icon" :size="12"/>{{ c.label }}</button></div>
                <label class="flex items-center gap-2 text-xs"><Switch v-model="s.notify.required" :aria-label="'Required channels for step ' + (i+1)"/><span>Required: send even to people who turned these channels off</span></label></template>
            </div>
            <p class="rounded-md bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground"><span class="font-medium text-foreground">Would go to:</span> {{ previewFor(s).people.map(p => p.name).join(', ') || 'nobody' }}<span v-if="previewFor(s).escalated" class="text-warning"> · escalated to owners and admins</span></p>
            <p v-if="!stepCapacity(s).ok" class="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive" role="alert"><Icon name="TriangleAlert" :size="13" class="mt-px shrink-0"/><span>{{ stepCapacity(s).n }} {{ stepCapacity(s).n===1 ? 'person' : 'people' }} can approve this step; it needs at least {{ stepCapacity(s).min }}<template v-if="s.required > 1"> ({{ s.required }} approvals + 1, because the requester can't approve their own request)</template>. Add approvers or lower the count.</span></p>
          </div>
          <Button variant="outline" @click="addStep"><Icon name="Plus" :size="14"/>Add step</Button>
        </div></div>
        <div class="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end"><Button variant="outline" @click="ED.open=false">Cancel</Button><Button :disabled="!valid || !canManage()" @click="save"><Icon name="Check" :size="14"/>Save workflow</Button></div>
      </template></Sheet>
    </div>`
  };

  /* ---------- Delegations */
  const DelegationsPage = {
    setup() {
      const LS = useList({ noun: 'delegations', rows: () => delegOf(), search: (d, q) => (nameOf(d.from) + ' ' + nameOf(d.to) + ' ' + d.reason).toLowerCase().includes(q), sort: 'start', dir: 'desc',
        sorts: [{ value: 'start', label: 'Starts', get: d => d.start }, { value: 'end', label: 'Ends', get: d => d.end }],
        fields: () => [{ key: 'state', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'expired', label: 'Expired' }], get: d => delegState(d) }, { key: 'from', label: 'From', type: 'select_paginated', module: 'members', get: d => d.from }, { key: 'start', label: 'Starts', type: 'date', get: d => d.start }] });
      watchEffect(() => { if (G.view === 'delegations') listCount.value = (G.search || '').trim().length >= 2 ? LS.rows.value.length : null; });
      const N = reactive({ open: false, from: '', to: '', types: [], start: '', end: '', reason: '', tried: false });
      const admin = computed(() => !G.viewAs && ['owner', 'admin'].includes(G.org.role));
      function openNew() { if (G.viewAs) return readOnly(); Object.assign(N, { open: true, from: ME.email, to: '', types: [], start: isoDay(TODAY), end: '', reason: '', tried: false }); }
      const errs = computed(() => ({ to: !N.to ? 'Choose who approves for you.' : N.to === N.from ? 'Pick someone else.' : '', end: !N.end ? 'Choose an end date.' : N.end < N.start ? 'Ends before it starts.' : '' }));
      function save() { N.tried = true; if (errs.value.to || errs.value.end) return; delegOf().unshift({ id: ulid('dg'), from: N.from, to: N.to, types: [...N.types], start: N.start, end: N.end, reason: N.reason.trim(), created: isoDay(TODAY) }); N.open = false; toast('Delegation saved', nameOf(N.to) + ' can approve for ' + nameOf(N.from) + ' until ' + fmtDay(N.end) + '.', 'Forward'); }
      function endNow(d) { if (G.viewAs) return readOnly(); d.end = daysAgo(1); toast('Delegation ended', '', 'Ban'); }
      const ST = { active: { label: 'Active', cls: 'bg-c1/15', dot: 'bg-c1' }, upcoming: { label: 'Upcoming', cls: 'bg-c3/15', dot: 'bg-c3' }, expired: { label: 'Expired', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60' } };
      return { G, LS, N, admin, openNew, errs, save, endNow, ST, delegState, nameOf, initials, rtById, rtypesOf, fmtDay, ME };
    },
    template: `<div class="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Delegations</h2><p class="text-sm text-muted-foreground">While someone is away, another person approves for them. Every decision shows both names.</p></div>
      <ListToolbar :list="LS"><Button size="sm" @click="openNew"><Icon name="Plus" :size="15"/>New delegation</Button></ListToolbar>
      <div v-if="LS.rows.value.length" :class="['grid gap-3 transition-opacity', LS.S.loading && 'pointer-events-none opacity-60']">
        <article v-for="(d, i) in LS.rows.value" :key="d.id" class="kpi flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm" :style="{ animationDelay: (i*50)+'ms' }">
          <div class="flex items-center gap-2"><span class="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ initials(nameOf(d.from)) }}</span><Icon name="ArrowRight" :size="15" class="text-muted-foreground"/><span class="grid h-9 w-9 place-items-center rounded-full bg-c3/15 text-xs font-semibold uppercase">{{ initials(nameOf(d.to)) }}</span></div>
          <div class="min-w-0 flex-1"><p class="text-sm"><span class="font-medium">{{ nameOf(d.to) }}</span> approves for <span class="font-medium">{{ nameOf(d.from) }}</span></p><p class="text-xs text-muted-foreground">{{ d.types.length ? d.types.map(t => (rtById(t)||{}).name).join(', ') : 'All request types' }} · {{ fmtDay(d.start) }} → {{ fmtDay(d.end) }}<template v-if="d.reason"> · {{ d.reason }}</template></p></div>
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', ST[delegState(d)].cls]"><span :class="['h-1.5 w-1.5 rounded-full', ST[delegState(d)].dot]"></span>{{ ST[delegState(d)].label }}</span>
          <Button v-if="delegState(d)!=='expired' && (admin || d.from===ME.email)" variant="ghost" size="sm" @click="endNow(d)">End now</Button>
        </article></div>
      <div v-else class="flex h-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center"><Icon name="Forward" :size="24" class="text-muted-foreground/60"/><p class="text-sm text-muted-foreground">No delegations match.</p></div>
      <Dialog v-model:open="N.open">
        <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">New delegation</h2><p class="text-sm text-muted-foreground">They approve with their own name, marked as acting for you.</p></div>
        <div class="grid grid-cols-[minmax(0,1fr)] gap-3">
          <ApiSelect v-if="admin" v-model="N.from" module="members" label="Approvals of" required/>
          <ApiSelect v-model="N.to" module="members" label="Go to" required :exclude="[N.from]" :error="N.tried ? errs.to : ''"/>
          <div class="grid gap-1.5"><span class="text-sm font-medium">For</span><div class="flex flex-wrap gap-1.5"><button type="button" :aria-pressed="!N.types.length" @click="N.types=[]" :class="['h-8 rounded-full border px-3 text-xs font-medium', !N.types.length ? 'border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent']">All request types</button><button v-for="t in rtypesOf().filter(x => x.active)" :key="t.id" type="button" :aria-pressed="N.types.includes(t.id)" @click="N.types.includes(t.id) ? N.types.splice(N.types.indexOf(t.id),1) : N.types.push(t.id)" :class="['h-8 rounded-full border px-3 text-xs font-medium', N.types.includes(t.id) ? 'border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent']">{{ t.name }}</button></div></div>
          <div class="grid grid-cols-2 gap-2"><div class="grid gap-1.5"><span class="text-sm font-medium">From</span><DatePicker v-model="N.start"/></div><div class="grid gap-1.5"><span class="text-sm font-medium after:ml-0.5 after:text-destructive after:content-['*']">Until</span><DatePicker v-model="N.end" align="end"/><p v-if="N.tried && errs.end" class="text-xs text-destructive">{{ errs.end }}</p></div></div>
          <div class="grid gap-1.5"><label for="dg-r" class="text-sm font-medium">Reason</label><Input id="dg-r" v-model="N.reason" placeholder="Annual leave"/></div>
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="N.open=false">Cancel</Button><Button @click="save"><Icon name="Check" :size="14"/>Save delegation</Button></div>
      </Dialog>
    </div>`
  };
