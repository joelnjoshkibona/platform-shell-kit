/* ---------------------------------------------------------------- respondent store */
const FORM = {
  org: 'Kilima Retail',
  title: 'Customer Service Assessment Q4',
  description: 'A short assessment for all branch staff. It takes about 15 minutes and must be finished in one sitting.',
  sections: [sec1, sec2, sec3],
  confirmation: 'Thank you. Your answers were recorded. Your supervisor will share results after the assessment closes.',
  accent: 'teal', opens: '13 Oct 2026, 08:00', closes: '31 Oct 2026, 17:00',
};
const CODE = '482913';
const R = reactive({
  scenario: 'normal',
  stage: 'verify',          // verify | code | rules | running | done | voided | gate
  gate: null,
  email: '', emailErr: '', human: 'checking', sending: false,
  code: ['', '', '', '', '', ''], codeErr: '', codeTries: 0, resendIn: 0, verifying: false,
  si: 0, path: [], answers: {}, errors: {}, locked: [],
  secLeft: 0, warned: false, saving: false,
  violations: 0, overlay: null, submitReason: 'manual', confirm: false,
  fsEntered: false, fsAvailable: true,
  settings: { timer_mode: 'per_section', time_limit_minutes: 20, violation_policy: 'auto_submit', violation_limit: 3, require_fullscreen: true, single_tab: true, block_copy_paste: true, one_response: true },
  dev: false, theme: 'system', toasts: [], submittedAt: '', ref: '',
});
function toast(title, desc = '', icon = 'Info', tone = 'default') {
  const t = { id: ulid('t'), title, desc, icon, tone };
  R.toasts.push(t); setTimeout(() => { R.toasts = R.toasts.filter(x => x.id !== t.id) }, 3800);
}
function applyTheme(mode) { const r = document.documentElement; if (mode === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', mode); }
const maskEmail = (e) => { const [u, d] = e.split('@'); return (u ? u[0] : '') + '•••@' + (d || ''); };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const now = () => new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ---------------------------------------------------------------- timers */
let tick = null, resendT = null, humanT = null;
function startHumanCheck() { R.human = 'checking'; clearTimeout(humanT); humanT = setTimeout(() => R.human = 'ok', 1400); }
function startResend() { R.resendIn = 60; clearInterval(resendT); resendT = setInterval(() => { R.resendIn = Math.max(0, R.resendIn - 1); if (!R.resendIn) clearInterval(resendT); }, 1000); }
function sectionLimit() { return R.settings.timer_mode === 'per_section' ? FORM.sections[R.si].time_limit_minutes * 60 : R.settings.time_limit_minutes * 60; }
function runClock() {
  clearInterval(tick);
  if (R.settings.timer_mode === 'off') return;
  tick = setInterval(() => {
    if (R.overlay && R.overlay.type === 'paused') return;
    R.secLeft = Math.max(0, R.secLeft - 1);
    if (R.secLeft === 60 && !R.warned) { R.warned = true; toast('1 minute left', R.settings.timer_mode === 'per_section' ? 'This section ends automatically. Answers are saved.' : 'Your answers submit automatically at 0:00.', 'Timer', 'danger'); }
    if (R.secLeft === 0) timeUp();
  }, 1000);
}
function timeUp() {
  if (R.settings.timer_mode === 'whole_form' || isLastSection()) { submit('timer_expired'); return; }
  const n = R.si + 1;
  R.locked.push(FORM.sections[R.si].key);
  goTo(nextTarget(), true);
  toast(`Time is up for section ${n}`, 'Your answers were saved. You cannot go back to it.', 'Timer', 'danger');
}

/* ---------------------------------------------------------------- navigation */
function nextTarget() {
  const sec = FORM.sections[R.si];
  for (const q of sec.questions) {
    if (q.logic && R.answers[q.key]) { const o = q.options.find(o => o.key === R.answers[q.key]); if (o && o.go_to !== 'next') return o.go_to; }
  }
  if (sec.next && sec.next !== 'auto') return sec.next;
  return R.si + 1 >= FORM.sections.length ? 'submit' : FORM.sections[R.si + 1].key;
}
const isLastSection = () => nextTarget() === 'submit';
function answered(q) {
  const a = R.answers[q.key];
  if (TYPE[q.type].grid) return a && q.rows.every(r => q.type === 'choice_grid' ? a[r.key] : (a[r.key] || []).length);
  if (q.type === 'multi_choice') return a && a.length >= Math.max(1, q.validation.enabled ? (q.validation.min || 1) : 1);
  return a != null && a !== '';
}
function validate() {
  R.errors = {};
  FORM.sections[R.si].questions.forEach(q => { if (q.required && !answered(q)) R.errors[q.key] = TYPE[q.type].grid ? 'Answer every row.' : 'This question is required.'; });
  return !Object.keys(R.errors).length;
}
function goTo(target, forced = false) {
  if (target === 'submit') { if (forced) submit('timer_expired'); else R.confirm = true; return; }
  R.path.push(R.si); R.si = FORM.sections.findIndex(s => s.key === target); R.errors = {}; R.warned = false;
  if (R.settings.timer_mode === 'per_section') { R.secLeft = sectionLimit(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function next() {
  if (!validate()) { nextTick(() => document.querySelector('[data-err]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })); return; }
  goTo(nextTarget());
}
function back() { if (R.settings.timer_mode === 'per_section' || !R.path.length) return; R.si = R.path.pop(); R.errors = {}; }
const canBack = () => R.settings.timer_mode !== 'per_section' && R.path.length > 0;

/* ---------------------------------------------------------------- start / submit */
async function enterFullscreen() {
  if (!R.settings.require_fullscreen) return true;
  try { await document.documentElement.requestFullscreen(); R.fsEntered = true; return true; }
  catch (e) { R.fsAvailable = false; return false; }
}
async function startAttempt() {
  const ok = await enterFullscreen();
  if (!ok && R.settings.require_fullscreen) toast('Full screen is not available here', 'This preview continues without it. The live form requires it.', 'Maximize');
  R.stage = 'running'; R.si = 0; R.path = []; R.answers = {}; R.errors = {}; R.locked = []; R.violations = 0; R.warned = false;
  R.secLeft = sectionLimit(); runClock();
}
function submit(reason = 'manual') {
  clearInterval(tick); R.confirm = false; R.overlay = null; R.submitReason = reason;
  R.submittedAt = now(); R.ref = ulid('R').slice(2, 16);
  R.stage = 'done';
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  window.scrollTo({ top: 0 });
}

/* ---------------------------------------------------------------- integrity */
const VIOLATION = {
  tab_hidden:      { icon: 'AppWindow', title: 'You left this tab', body: 'Switching tabs or apps counts as a violation.' },
  fullscreen_exit: { icon: 'Minimize',  title: 'You left full screen', body: 'This form must stay in full screen until you submit.' },
  copy_attempt:    { icon: 'ClipboardX', title: 'Copy and paste are turned off', body: 'Copying, pasting and right-click are blocked on this form.' },
};
function violation(type) {
  if (R.stage !== 'running' || R.overlay) return;
  R.violations++;
  const p = R.settings.violation_policy;
  if (p === 'void') { clearInterval(tick); R.overlay = null; R.stage = 'voided'; R.lastViolation = type; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); return; }
  if (p === 'auto_submit' && R.violations >= R.settings.violation_limit) { R.lastViolation = type; submit('violation_limit'); return; }
  R.overlay = { type };
}
async function resolveOverlay() {
  if (R.overlay && R.overlay.type === 'fullscreen_exit') await enterFullscreen();
  R.overlay = null;
}
function onVisibility() { if (document.hidden && R.settings.single_tab) violation('tab_hidden'); }
function onFs() { if (!document.fullscreenElement && R.fsEntered && R.stage === 'running') { R.fsEntered = false; violation('fullscreen_exit'); } }
function onClip(e) { if (R.stage === 'running' && R.settings.block_copy_paste) { e.preventDefault(); violation('copy_attempt'); } }

/* ---------------------------------------------------------------- scenarios */
const GATES = {
  not_open:   { icon: 'CalendarClock', tone: 'muted', title: 'This form opens soon', body: `It opens on ${FORM.opens} East Africa Time. Come back then using the same link.` },
  closed:     { icon: 'Lock', tone: 'muted', title: 'This form is closed', body: `It stopped accepting responses on ${FORM.closes}. Contact ${FORM.org} if you think this is a mistake.` },
  max:        { icon: 'Inbox', tone: 'muted', title: 'Response limit reached', body: 'This form has received the maximum number of responses and is no longer accepting new ones.' },
  responded:  { icon: 'CircleCheck', tone: 'ok', title: 'You already responded', body: 'Only one response per email is allowed on this form.', meta: [['Email', 'amina.juma@kilimaretail.co.tz'], ['Submitted', '9 Oct 2026, 10:14']] },
  voided:     { icon: 'Ban', tone: 'danger', title: 'Your earlier attempt was cancelled', body: 'It was cancelled because a form rule was broken, and that used your one response. Ask the form owner to reset your attempt if you need another try.', meta: [['Email', 'baraka.mushi@kilimaretail.co.tz'], ['Cancelled', '9 Oct 2026, 11:02'], ['Reason', 'Left full screen']] },
  not_invited:{ icon: 'MailX', tone: 'danger', title: 'This email is not on the invite list', body: 'This form only accepts people who were invited. Use the email address your invitation was sent to.', meta: [['You entered', 'neema@gmail.com']], action: 'Use a different email' },
  device:     { icon: 'Smartphone', tone: 'muted', title: 'Open this form on another device', body: 'This form needs full screen, which Safari on iPhone and iPad does not support. Open the link on a computer or an Android phone.', copy: true },
  second_tab: { icon: 'Copy', tone: 'warn', title: 'This form is open somewhere else', body: 'Your attempt is active in another tab or device. Continue there, or use this tab instead. The other tab will stop and your saved answers move here.', action: 'Use this tab' },
  resume:     { icon: 'History', tone: 'warn', title: 'Welcome back', body: 'Your attempt is still running. The timer kept going while you were away. Your answers up to now are saved.', meta: [['Section', '2 of 3 · Product knowledge'], ['Time left', '6:42'], ['Violations', '1 of 3']], action: 'Resume now' },
  left_submitted: { icon: 'Send', tone: 'muted', title: 'Your attempt was submitted', body: 'You left the form while it was timed, so the answers you had given were submitted automatically. This form does not allow another attempt.', meta: [['Submitted', '10 Oct 2026, 13:58'], ['Reason', 'Tab closed during a timed attempt']] },
};
function setScenario(id) {
  clearInterval(tick); R.overlay = null; R.confirm = false; R.scenario = id; R.dev = false;
  R.code = ['', '', '', '', '', '']; R.codeErr = ''; R.codeTries = 0;
  if (id === 'normal') { R.stage = 'verify'; R.gate = null; R.email = ''; startHumanCheck(); return; }
  if (id === 'running') { R.email = 'amina.juma@kilimaretail.co.tz'; startAttempt(); return; }
  R.stage = 'gate'; R.gate = id;
}
function gateAction() {
  if (R.gate === 'not_invited') { R.stage = 'verify'; R.gate = null; R.email = ''; startHumanCheck(); }
  else if (R.gate === 'second_tab') { R.gate = 'resume'; toast('The other tab was stopped', 'This tab now holds your attempt.', 'AppWindow'); }
  else if (R.gate === 'resume') { R.email = 'baraka.mushi@kilimaretail.co.tz'; startAttempt().then(() => { R.si = 1; R.path = [0]; R.secLeft = 402; R.violations = 1; }); }
}

/* ---------------------------------------------------------------- components */
const QuestionField = {
  props: { q: Object },
  setup(p) {
    const a = computed(() => R.answers[p.q.key]);
    function setGrid(r, c, multi) {
      const cur = R.answers[p.q.key] || (R.answers[p.q.key] = {});
      if (multi) { const arr = cur[r] || (cur[r] = []); const i = arr.indexOf(c); i > -1 ? arr.splice(i, 1) : arr.push(c); } else cur[r] = c;
      delete R.errors[p.q.key];
    }
    function toggle(k) { const cur = R.answers[p.q.key] || (R.answers[p.q.key] = []); const i = cur.indexOf(k); i > -1 ? cur.splice(i, 1) : cur.push(k); delete R.errors[p.q.key]; }
    function set(v) { R.answers[p.q.key] = v; delete R.errors[p.q.key]; }
    const gridOn = (r, c) => p.q.type === 'checkbox_grid' ? ((a.value || {})[r] || []).includes(c) : (a.value || {})[r] === c;
    return { R, a, setGrid, toggle, set, gridOn, range: (x, y) => Array.from({ length: y - x + 1 }, (_, i) => x + i) };
  },
  template: `
  <fieldset :data-err="R.errors[q.key] ? '' : null" :class="['rounded-xl border bg-card p-4 shadow-sm transition-colors sm:p-5', R.errors[q.key] ? 'border-destructive/60' : '']">
    <legend class="float-left w-full text-sm font-medium leading-snug">{{ q.title }}<span v-if="q.required" class="ml-0.5 text-destructive" aria-label="required">*</span></legend>
    <p v-if="q.showDescription && q.description" class="clear-left pt-1 text-sm text-muted-foreground">{{ q.description }}</p>
    <div class="clear-left pt-3">
      <div v-if="q.type==='single_choice' || q.type==='true_false'" class="grid gap-0.5" role="radiogroup">
        <label v-for="o in q.options" :key="o.key" :class="['flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm transition-colors', a===o.key ? 'bg-fa/10' : 'hover:bg-muted/60']">
          <input type="radio" class="peer sr-only" :name="q.key" :checked="a===o.key" @change="set(o.key)">
          <span :class="['grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fa/40', a===o.key ? 'border-fa' : 'border-muted-foreground/50']"><span v-if="a===o.key" class="pop h-2.5 w-2.5 rounded-full bg-fa"></span></span>{{ o.label }}</label>
      </div>
      <div v-else-if="q.type==='multi_choice'" class="grid gap-0.5">
        <label v-for="o in q.options" :key="o.key" :class="['flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm transition-colors', (a||[]).includes(o.key) ? 'bg-fa/10' : 'hover:bg-muted/60']">
          <input type="checkbox" class="peer sr-only" :checked="(a||[]).includes(o.key)" @change="toggle(o.key)">
          <span :class="['grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fa/40', (a||[]).includes(o.key) ? 'border-fa bg-fa text-fa-fg' : 'border-muted-foreground/50']"><Icon v-if="(a||[]).includes(o.key)" name="Check" :size="13" stroke-width="3"/></span>{{ o.label }}</label>
        <p v-if="q.validation.enabled && q.validation.min > 1" class="px-2 pt-1 text-xs text-muted-foreground">Select at least {{ q.validation.min }}.</p>
      </div>
      <Select v-else-if="q.type==='dropdown'" class="max-w-sm" :model-value="a" @update:model-value="set" :options="q.options.map(o=>({value:o.key,label:o.label}))" placeholder="Choose"/>
      <div v-else-if="q.type==='linear_scale'">
        <div class="flex flex-wrap gap-1.5">
          <button v-for="n in range(q.scale.min, q.scale.max)" :key="n" type="button" @click="set(n)" :aria-pressed="a===n"
            :class="['grid h-11 min-w-11 flex-1 place-items-center rounded-lg border text-sm font-medium transition-colors tnum', a===n ? 'border-fa bg-fa text-fa-fg' : 'hover:bg-muted']">{{ n }}</button>
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted-foreground"><span>{{ q.scale.min_label }}</span><span>{{ q.scale.max_label }}</span></div>
      </div>
      <div v-else-if="q.type==='rating'" class="flex flex-wrap gap-0.5">
        <button v-for="n in q.rating.max" :key="n" type="button" @click="set(n)" :aria-label="n + ' of ' + q.rating.max" class="grid h-11 w-11 place-items-center rounded-lg transition-transform hover:bg-muted active:scale-90">
          <Icon name="Star" :size="26" :class="(a||0) >= n ? 'text-fa' : 'text-muted-foreground/50'" :fill="(a||0) >= n ? 'currentColor' : 'none'"/></button>
      </div>
      <template v-else>
        <div class="grid-table overflow-x-auto"><table class="w-full text-sm">
          <thead><tr><th class="w-2/5"></th><th v-for="c in q.columns" :key="c.key" class="px-1 pb-2 text-center text-xs font-medium text-muted-foreground">{{ c.label }}</th></tr></thead>
          <tbody><tr v-for="r in q.rows" :key="r.key" class="border-t"><td class="py-3 pr-3">{{ r.label }}</td>
            <td v-for="c in q.columns" :key="c.key" class="text-center"><button type="button" @click="setGrid(r.key, c.key, q.type==='checkbox_grid')" :aria-label="r.label + ': ' + c.label" :aria-pressed="gridOn(r.key, c.key)"
              :class="['inline-grid h-6 w-6 place-items-center border-2 transition-colors', q.type==='checkbox_grid' ? 'rounded' : 'rounded-full', gridOn(r.key, c.key) ? 'border-fa bg-fa text-fa-fg' : 'border-muted-foreground/50 hover:border-fa/60']"><Icon v-if="gridOn(r.key, c.key) && q.type==='checkbox_grid'" name="Check" :size="13" stroke-width="3"/><span v-else-if="gridOn(r.key, c.key)" class="h-2 w-2 rounded-full bg-fa-fg"></span></button></td></tr></tbody>
        </table></div>
        <div class="grid-stack flex-col gap-3">
          <div v-for="r in q.rows" :key="r.key" class="rounded-lg border p-3"><p class="text-sm font-medium">{{ r.label }}</p>
            <div class="mt-2 flex flex-wrap gap-2"><button v-for="c in q.columns" :key="c.key" type="button" @click="setGrid(r.key, c.key, q.type==='checkbox_grid')" :aria-pressed="gridOn(r.key, c.key)"
              :class="['min-h-9 rounded-full border px-3 text-sm transition-colors', gridOn(r.key, c.key) ? 'border-fa bg-fa text-fa-fg' : 'hover:bg-muted']">{{ c.label }}</button></div></div>
        </div>
      </template>
    </div>
    <p v-if="R.errors[q.key]" class="mt-3 flex items-center gap-1.5 text-sm text-destructive"><Icon name="CircleAlert" :size="14"/>{{ R.errors[q.key] }}</p>
  </fieldset>`
};

const OtpInput = {
  setup() {
    const refs = ref([]);
    function focus(i) { nextTick(() => refs.value[i]?.focus()); }
    function onInput(e, i) {
      const v = e.target.value.replace(/\D/g, '');
      if (v.length > 1) { fill(v); return; }
      R.code[i] = v; R.codeErr = '';
      if (v && i < 5) focus(i + 1);
      if (R.code.every(Boolean)) verify();
    }
    function fill(v) { v.slice(0, 6).split('').forEach((d, k) => R.code[k] = d); focus(Math.min(5, v.length)); if (R.code.every(Boolean)) verify(); }
    function onKey(e, i) {
      if (e.key === 'Backspace' && !R.code[i] && i > 0) { R.code[i - 1] = ''; focus(i - 1); }
      if (e.key === 'ArrowLeft' && i > 0) focus(i - 1);
      if (e.key === 'ArrowRight' && i < 5) focus(i + 1);
    }
    function onPaste(e) { e.preventDefault(); fill((e.clipboardData.getData('text') || '').replace(/\D/g, '')); }
    function verify() {
      R.verifying = true;
      setTimeout(() => {
        R.verifying = false;
        if (R.code.join('') === CODE) { R.stage = 'rules'; return; }
        R.codeTries++; R.code = ['', '', '', '', '', ''];
        R.codeErr = R.codeTries >= 5 ? 'Too many wrong codes. Request a new code.' : `That code is not right. ${5 - R.codeTries} ${5 - R.codeTries === 1 ? 'try' : 'tries'} left.`;
        focus(0);
      }, 700);
    }
    onMounted(() => focus(0));
    return { R, refs, onInput, onKey, onPaste };
  },
  template: `<div class="flex justify-between gap-1.5 sm:justify-start sm:gap-2" @paste="onPaste">
    <template v-for="(d, i) in R.code" :key="i">
      <input :ref="el => refs[i] = el" :value="d" @input="onInput($event, i)" @keydown="onKey($event, i)" inputmode="numeric" :autocomplete="i===0 ? 'one-time-code' : 'off'" maxlength="6" :aria-label="'Digit ' + (i+1)"
        :disabled="R.verifying || R.codeTries >= 5"
        :class="['h-12 w-11 rounded-md border bg-background text-center text-lg font-semibold tnum shadow-sm outline-none transition-all focus:border-fa focus:ring-2 focus:ring-fa/30 disabled:opacity-50 sm:w-12', R.codeErr ? 'border-destructive' : 'border-input']">
      <span v-if="i===2" class="hidden self-center text-muted-foreground sm:block" aria-hidden="true">–</span>
    </template></div>`
};

const App = {
  setup() {
    const sec = computed(() => FORM.sections[R.si]);
    const accent = computed(() => ACCENTS[FORM.accent]);
    const totalQ = FORM.sections.reduce((a, s) => a + s.questions.length, 0);
    const answeredCount = computed(() => FORM.sections.flatMap(s => s.questions).filter(q => answered(q)).length);
    const progress = computed(() => Math.round((R.si / FORM.sections.length) * 100));
    const timerTone = computed(() => R.secLeft <= 60 ? 'danger' : R.secLeft <= 120 ? 'warn' : 'normal');
    const timerPct = computed(() => { const t = sectionLimit(); return t ? Math.round((R.secLeft / t) * 100) : 0; });
    function sendCode() {
      const e = R.email.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { R.emailErr = 'Enter a valid email address, like name@company.co.tz.'; return; }
      if (R.human !== 'ok') { R.emailErr = 'Wait for the human check to finish.'; return; }
      R.emailErr = ''; R.sending = true;
      setTimeout(() => { R.sending = false; R.stage = 'code'; startResend(); }, 900);
    }
    function resend() { if (R.resendIn) return; R.codeTries = 0; R.codeErr = ''; R.code = ['', '', '', '', '', '']; startResend(); toast('New code sent', maskEmail(R.email), 'Mail'); }
    function changeEmail() { R.stage = 'verify'; R.code = ['', '', '', '', '', '']; R.codeErr = ''; R.codeTries = 0; }
    // autosave indicator
    let saveT = null;
    watch(() => R.answers, () => { if (R.stage !== 'running') return; R.saving = true; clearTimeout(saveT); saveT = setTimeout(() => R.saving = false, 700); }, { deep: true });
    watch(() => R.theme, applyTheme, { immediate: true });
    onMounted(() => {
      startHumanCheck();
      document.addEventListener('visibilitychange', onVisibility);
      document.addEventListener('fullscreenchange', onFs);
      ['copy', 'cut', 'paste', 'contextmenu'].forEach(ev => document.addEventListener(ev, onClip));
    });
    const themeItems = computed(() => [
      { id: 'light', label: 'Light', icon: 'Sun', checked: R.theme === 'light' },
      { id: 'dark', label: 'Dark', icon: 'Moon', checked: R.theme === 'dark' },
      { id: 'system', label: 'System', icon: 'Laptop', checked: R.theme === 'system' },
    ]);
    const scenarios = [
      { group: 'Happy path' }, { id: 'normal', label: 'Verify email → rules → answer', icon: 'Mail' }, { id: 'running', label: 'Skip to answering', icon: 'FastForward' },
      { group: 'Before starting' }, { id: 'not_open', label: 'Not open yet', icon: 'CalendarClock' }, { id: 'closed', label: 'Closed', icon: 'Lock' }, { id: 'max', label: 'Response limit reached', icon: 'Inbox' },
      { id: 'responded', label: 'Already responded', icon: 'CircleCheck' }, { id: 'voided', label: 'Already responded (voided)', icon: 'Ban' },
      { id: 'not_invited', label: 'Not invited (private form)', icon: 'MailX' }, { id: 'device', label: 'Device blocked (iPhone)', icon: 'Smartphone' },
      { group: 'Coming back' }, { id: 'second_tab', label: 'Open in another tab', icon: 'Copy' }, { id: 'resume', label: 'Resume timed attempt', icon: 'History' }, { id: 'left_submitted', label: 'Left tab, auto-submitted', icon: 'Send' },
    ];
    const timerOpts = [{ value: 'off', label: 'No timer' }, { value: 'whole_form', label: 'Whole form (20 min)' }, { value: 'per_section', label: 'Per section' }];
    const policyOpts = [{ value: 'warn_log', label: 'Warn and log' }, { value: 'auto_submit', label: 'Auto-submit after limit' }, { value: 'void', label: 'Void attempt' }];
    function sim(type) { R.dev = false; setTimeout(() => violation(type), 250); }
    function jump(s) { R.dev = false; R.secLeft = s; R.warned = s <= 60; if (s > 60) R.warned = false; }
    const gate = computed(() => GATES[R.gate]);
    const reasonText = computed(() => ({ manual: null, timer_expired: 'Submitted automatically because time ran out.', violation_limit: `Submitted automatically after ${R.settings.violation_limit} rule violations.` }[R.submitReason]));
    function copyLink() { const t = 'https://forms.app/f/cs-assessment-q4'; try { navigator.clipboard.writeText(t).then(() => toast('Link copied', t, 'Link'), () => toast('Copy this link', t, 'Link')); } catch (e) { toast('Copy this link', t, 'Link'); } }
    return { R, FORM, sec, accent, totalQ, answeredCount, progress, timerTone, timerPct, fmt, maskEmail, sendCode, resend, changeEmail, OtpInput, themeItems, scenarios, setScenario, timerOpts, policyOpts, sim, jump, gate, gateAction, reasonText, next, back, canBack, isLastSection, startAttempt, submit, resolveOverlay, VIOLATION, copyLink, CODE };
  },
  template: `
  <div class="form-theme flex min-h-screen flex-col" :style="{ '--fa-l': accent.l, '--fa-d': accent.d }" :class="R.stage==='running' && R.settings.block_copy_paste ? 'select-none' : ''">

    <!-- RUNNING TOP BAR -->
    <header v-if="R.stage==='running'" class="sticky z-30 border-b bg-background/95 backdrop-blur" style="top:env(safe-area-inset-top,0px)">
      <div class="mx-auto flex h-14 max-w-[680px] items-center gap-3 px-4">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">{{ FORM.title }}</p>
          <p class="flex items-center gap-1.5 text-xs text-muted-foreground tnum" aria-live="polite">Section {{ R.si+1 }} of {{ FORM.sections.length }}
            <span aria-hidden="true">·</span><template v-if="R.saving"><Icon name="LoaderCircle" :size="11" class="animate-spin"/>Saving</template><template v-else><Icon name="Check" :size="11"/>Saved</template></p>
        </div>
        <span v-if="R.settings.violation_policy!=='void' && R.violations" class="hidden items-center gap-1 rounded-full bg-warning/15 px-2 py-1 text-xs font-medium text-warning sm:inline-flex tnum"><Icon name="TriangleAlert" :size="12"/>{{ R.violations }}<template v-if="R.settings.violation_policy==='auto_submit'">/{{ R.settings.violation_limit }}</template></span>
        <div v-if="R.settings.timer_mode!=='off'" role="timer" :aria-label="'Time left ' + fmt(R.secLeft)"
          :class="['relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1.5 text-sm font-semibold tnum transition-colors',
            timerTone==='danger' ? 'border-destructive/50 bg-destructive/10 text-destructive animate-[pulse_1.6s_ease-in-out_infinite]' : timerTone==='warn' ? 'border-warning/40 bg-warning/10 text-warning' : 'bg-card']">
          <Icon name="Timer" :size="15"/>{{ fmt(R.secLeft) }}
          <span class="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-40 transition-[width] duration-1000 ease-linear" :style="{ width: timerPct + '%' }"></span>
        </div>
      </div>
      <div class="h-1 bg-muted"><div class="h-full bg-fa transition-all duration-500" :style="{ width: progress + '%' }"></div></div>
    </header>

    <main class="flex-1 px-3 py-6 sm:px-4 sm:py-10">
      <div class="mx-auto max-w-[680px]">

        <!-- BRAND STRIP (not running) -->
        <div v-if="R.stage!=='running'" class="mb-4 flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2"><div class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-fa text-xs font-bold text-fa-fg">K</div><span class="truncate text-sm font-medium">{{ FORM.org }}</span></div>
          <DropdownMenu :items="themeItems" @select="it => R.theme = it.id" label="Theme"><template #trigger><Button variant="ghost" size="icon-sm" aria-label="Theme"><Icon :name="R.theme==='dark' ? 'Moon' : R.theme==='light' ? 'Sun' : 'Laptop'"/></Button></template></DropdownMenu>
        </div>

        <!-- VERIFY + CODE (single card, 2 steps) -->
        <div v-if="R.stage==='verify' || R.stage==='code'" class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div class="h-2 bg-fa"></div>
          <div class="p-5 sm:p-7">
            <h1 class="text-xl font-semibold tracking-tight sm:text-2xl" style="text-wrap:balance">{{ FORM.title }}</h1>
            <p class="mt-1.5 text-sm text-muted-foreground">{{ FORM.description }}</p>
            <ol class="mt-5 flex items-center gap-2 text-xs font-medium" aria-label="Steps">
              <li :class="['flex items-center gap-1.5', R.stage==='verify' ? 'text-foreground' : 'text-muted-foreground']"><span :class="['grid h-5 w-5 place-items-center rounded-full text-[11px]', R.stage==='verify' ? 'bg-fa text-fa-fg' : 'bg-fa/15 text-fa']"><Icon v-if="R.stage==='code'" name="Check" :size="12" stroke-width="3"/><template v-else>1</template></span>Email</li>
              <li class="h-px w-6 bg-border" aria-hidden="true"></li>
              <li :class="['flex items-center gap-1.5', R.stage==='code' ? 'text-foreground' : 'text-muted-foreground']"><span :class="['grid h-5 w-5 place-items-center rounded-full text-[11px]', R.stage==='code' ? 'bg-fa text-fa-fg' : 'bg-muted']">2</span>Code</li>
              <li class="h-px w-6 bg-border" aria-hidden="true"></li>
              <li class="flex items-center gap-1.5 text-muted-foreground"><span class="grid h-5 w-5 place-items-center rounded-full bg-muted text-[11px]">3</span>Start</li>
            </ol>
            <Transition name="fade" mode="out-in">
              <form v-if="R.stage==='verify'" key="e" class="mt-5 grid gap-3" @submit.prevent="sendCode" novalidate>
                <div class="grid gap-1.5"><label for="em" class="text-sm font-medium">Your email</label>
                  <Input id="em" type="email" autocomplete="email" inputmode="email" v-model="R.email" placeholder="name@company.co.tz" :class="R.emailErr && 'border-destructive'"/>
                  <p v-if="R.emailErr" class="text-sm text-destructive">{{ R.emailErr }}</p>
                  <p v-else class="text-xs text-muted-foreground">We send a 6-digit code to confirm it is you. Your email is shared with {{ FORM.org }}.</p></div>
                <div class="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm" aria-live="polite">
                  <Icon v-if="R.human==='checking'" name="LoaderCircle" class="animate-spin text-muted-foreground"/><Icon v-else name="ShieldCheck" class="text-fa"/>
                  <span class="flex-1">{{ R.human==='checking' ? 'Checking that you are human…' : 'Human check passed' }}</span><span class="text-[11px] text-muted-foreground">Turnstile</span></div>
                <Button type="submit" class="!h-10 w-full !bg-fa !text-fa-fg hover:opacity-90" :disabled="R.sending"><Icon v-if="R.sending" name="LoaderCircle" class="animate-spin"/>{{ R.sending ? 'Sending code…' : 'Send code' }}</Button>
              </form>
              <div v-else key="c" class="mt-5 grid gap-3">
                <div><p class="text-sm font-medium">Enter the 6-digit code</p><p class="mt-0.5 text-sm text-muted-foreground">Sent to <span class="font-medium text-foreground">{{ maskEmail(R.email) }}</span>. It expires in 10 minutes.</p></div>
                <component :is="OtpInput"/>
                <p v-if="R.verifying" class="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="LoaderCircle" class="animate-spin"/>Checking code…</p>
                <p v-else-if="R.codeErr" class="flex items-center gap-1.5 text-sm text-destructive" role="alert"><Icon name="CircleAlert" :size="14"/>{{ R.codeErr }}</p>
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
                  <button type="button" class="font-medium text-fa underline-offset-4 hover:underline" @click="changeEmail">Use a different email</button>
                  <button type="button" :disabled="R.resendIn>0" @click="resend" class="font-medium text-fa underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline tnum">{{ R.resendIn ? 'Resend in ' + fmt(R.resendIn) : 'Resend code' }}</button>
                </div>
                <p class="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">Prototype: the code is <span class="font-mono font-medium text-foreground">{{ CODE }}</span>. Paste works too.</p>
              </div>
            </Transition>
          </div>
        </div>

        <!-- RULES / START -->
        <div v-else-if="R.stage==='rules'" class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div class="h-2 bg-fa"></div>
          <div class="p-5 sm:p-7">
            <p class="inline-flex items-center gap-1.5 rounded-full bg-fa/10 px-2.5 py-1 text-xs font-medium text-fa"><Icon name="BadgeCheck" :size="13"/>{{ R.email }}</p>
            <h1 class="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">Before you start</h1>
            <p class="mt-1 text-sm text-muted-foreground">{{ FORM.title }}</p>
            <ul class="mt-5 grid gap-2.5 text-sm">
              <li class="flex gap-3 rounded-lg border p-3"><Icon name="Rows3" class="mt-0.5 text-fa"/><span><span class="font-medium">{{ FORM.sections.length }} sections, {{ totalQ }} questions.</span> Some sections may be skipped based on your answers.</span></li>
              <li v-if="R.settings.timer_mode==='per_section'" class="flex gap-3 rounded-lg border p-3"><Icon name="Timer" class="mt-0.5 text-warning"/><span><span class="font-medium">Each section is timed</span> ({{ FORM.sections.map(s=>s.time_limit_minutes+' min').join(', ') }}). When time runs out you move on and cannot go back.</span></li>
              <li v-if="R.settings.timer_mode==='whole_form'" class="flex gap-3 rounded-lg border p-3"><Icon name="Timer" class="mt-0.5 text-warning"/><span><span class="font-medium">{{ R.settings.time_limit_minutes }} minutes in total.</span> Your answers submit automatically when time runs out.</span></li>
              <li v-if="R.settings.require_fullscreen" class="flex gap-3 rounded-lg border p-3"><Icon name="Maximize" class="mt-0.5 text-fa"/><span><span class="font-medium">Full screen.</span> The form opens in full screen and must stay that way.</span></li>
              <li v-if="R.settings.single_tab" class="flex gap-3 rounded-lg border p-3"><Icon name="AppWindow" class="mt-0.5 text-fa"/><span><span class="font-medium">Stay on this tab.</span> Switching tabs, apps or devices is recorded.</span></li>
              <li v-if="R.settings.block_copy_paste" class="flex gap-3 rounded-lg border p-3"><Icon name="ClipboardX" class="mt-0.5 text-fa"/><span><span class="font-medium">No copy or paste.</span> Right-click is also off.</span></li>
              <li v-if="R.settings.violation_policy!=='warn_log'" class="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"><Icon name="TriangleAlert" class="mt-0.5 text-destructive"/><span v-if="R.settings.violation_policy==='auto_submit'">After <span class="font-medium">{{ R.settings.violation_limit }} violations</span> your answers are submitted automatically.</span><span v-else>Breaking <span class="font-medium">any rule once</span> cancels your attempt, and you cannot try again.</span></li>
            </ul>
            <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-xs text-muted-foreground">Your answers save as you go.</p>
              <Button class="!h-11 !bg-fa px-6 !text-fa-fg hover:opacity-90" @click="startAttempt"><Icon :name="R.settings.require_fullscreen ? 'Maximize' : 'ArrowRight'"/>{{ R.settings.require_fullscreen ? 'Start in full screen' : 'Start' }}</Button>
            </div>
          </div>
        </div>

        <!-- RUNNING -->
        <template v-else-if="R.stage==='running'">
          <Transition name="q" mode="out-in">
            <div :key="sec.key" class="space-y-2">
              <div class="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div class="h-1.5 bg-fa"></div>
                <div class="px-4 py-4 sm:px-5"><p class="text-xs font-medium uppercase tracking-wider text-fa">Section {{ R.si+1 }}<template v-if="R.settings.timer_mode==='per_section'"> · {{ sec.time_limit_minutes }} min</template></p>
                  <h2 class="mt-1 text-lg font-semibold">{{ sec.title }}</h2><p v-if="sec.description" class="mt-0.5 text-sm text-muted-foreground">{{ sec.description }}</p></div>
              </div>
              <QuestionField v-for="q in sec.questions" :key="q.key" :q="q"/>
            </div>
          </Transition>
          <div class="sticky bottom-0 -mx-3 mt-4 border-t bg-canvas/95 px-3 pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0" style="padding-bottom:calc(0.75rem + env(safe-area-inset-bottom,0px))">
            <div class="flex items-center justify-between gap-3">
              <Button v-if="canBack()" variant="outline" class="!h-11" @click="back"><Icon name="ArrowLeft"/>Back</Button>
              <span v-else class="text-xs text-muted-foreground">{{ R.settings.timer_mode==='per_section' ? 'Going back is off for timed sections.' : '' }}</span>
              <Button class="!h-11 !bg-fa px-6 !text-fa-fg hover:opacity-90" @click="next">{{ isLastSection() ? 'Submit' : 'Next section' }}<Icon :name="isLastSection() ? 'Send' : 'ArrowRight'"/></Button>
            </div>
          </div>
        </template>

        <!-- DONE -->
        <div v-else-if="R.stage==='done'" class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div class="h-2 bg-fa"></div>
          <div class="p-6 text-center sm:p-8">
            <div class="pop mx-auto grid h-14 w-14 place-items-center rounded-full bg-fa/15 text-fa"><Icon name="CircleCheck" :size="30"/></div>
            <h1 class="mt-4 text-xl font-semibold">Response recorded</h1>
            <p v-if="reasonText" class="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning"><Icon :name="R.submitReason==='timer_expired' ? 'Timer' : 'TriangleAlert'" :size="13"/>{{ reasonText }}</p>
            <p class="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{{ FORM.confirmation }}</p>
            <dl class="mx-auto mt-6 grid max-w-sm gap-2 rounded-lg border p-3 text-left text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted-foreground">Email</dt><dd class="truncate font-medium">{{ R.email || 'amina.juma@kilimaretail.co.tz' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted-foreground">Submitted</dt><dd class="font-medium tnum">{{ R.submittedAt }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted-foreground">Reference</dt><dd class="font-mono text-xs font-medium">{{ R.ref }}</dd></div>
            </dl>
            <p class="mt-6 text-xs text-muted-foreground">You can close this tab now.</p>
          </div>
        </div>

        <!-- VOIDED -->
        <div v-else-if="R.stage==='voided'" class="overflow-hidden rounded-xl border border-destructive/40 bg-card shadow-sm">
          <div class="h-2 bg-destructive"></div>
          <div class="p-6 text-center sm:p-8">
            <div class="pop mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive"><Icon name="Ban" :size="28"/></div>
            <h1 class="mt-4 text-xl font-semibold">Attempt cancelled</h1>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{{ VIOLATION[R.lastViolation]?.title }}. This form cancels the attempt on any rule break, and this used your one response.</p>
            <p class="mx-auto mt-3 max-w-md text-sm">If this was a mistake, ask <span class="font-medium">{{ FORM.org }}</span> to reset your attempt.</p>
          </div>
        </div>

        <!-- GATE SCREENS -->
        <div v-else-if="R.stage==='gate' && gate" class="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div :class="['h-2', gate.tone==='danger' ? 'bg-destructive' : gate.tone==='warn' ? 'bg-warning' : 'bg-fa']"></div>
          <div class="p-6 sm:p-8">
            <div :class="['pop grid h-12 w-12 place-items-center rounded-full', gate.tone==='danger' ? 'bg-destructive/10 text-destructive' : gate.tone==='warn' ? 'bg-warning/15 text-warning' : gate.tone==='ok' ? 'bg-fa/15 text-fa' : 'bg-muted text-muted-foreground']"><Icon :name="gate.icon" :size="24"/></div>
            <p class="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ FORM.title }}</p>
            <h1 class="mt-1 text-xl font-semibold tracking-tight">{{ gate.title }}</h1>
            <p class="mt-2 max-w-prose text-sm text-muted-foreground">{{ gate.body }}</p>
            <dl v-if="gate.meta" class="mt-5 grid gap-2 rounded-lg border p-3 text-sm">
              <div v-for="m in gate.meta" :key="m[0]" class="flex justify-between gap-4"><dt class="text-muted-foreground">{{ m[0] }}</dt><dd class="truncate font-medium tnum">{{ m[1] }}</dd></div>
            </dl>
            <div v-if="gate.action || gate.copy" class="mt-6 flex flex-wrap gap-2">
              <Button v-if="gate.action" class="!h-10 !bg-fa !text-fa-fg hover:opacity-90" @click="gateAction">{{ gate.action }}<Icon name="ArrowRight"/></Button>
              <Button v-if="gate.copy" variant="outline" class="!h-10" @click="copyLink"><Icon name="Copy"/>Copy form link</Button>
            </div>
          </div>
        </div>

        <p v-if="R.stage!=='running'" class="mt-6 text-center text-xs text-muted-foreground">{{ FORM.org }} · Never share your email code with anyone.</p>
      </div>
    </main>

    <!-- VIOLATION OVERLAY (blocking) -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="R.overlay" class="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="v-title">
        <div class="pop form-theme w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-2xl" :style="{ '--fa-l': accent.l, '--fa-d': accent.d }">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning/15 text-warning"><Icon :name="VIOLATION[R.overlay.type].icon" :size="26"/></div>
          <h2 id="v-title" class="mt-4 text-lg font-semibold">{{ VIOLATION[R.overlay.type].title }}</h2>
          <p class="mt-1.5 text-sm text-muted-foreground">{{ VIOLATION[R.overlay.type].body }} It has been recorded.</p>
          <div v-if="R.settings.violation_policy==='auto_submit'" class="mt-5">
            <div class="flex justify-center gap-1.5" aria-hidden="true"><span v-for="n in R.settings.violation_limit" :key="n" :class="['h-2 w-8 rounded-full transition-colors', n <= R.violations ? 'bg-warning' : 'bg-muted']"></span></div>
            <p class="mt-2 text-sm font-medium tnum">Violation {{ R.violations }} of {{ R.settings.violation_limit }}</p>
            <p class="text-xs text-muted-foreground">At {{ R.settings.violation_limit }} your answers are submitted automatically.</p>
          </div>
          <p v-else class="mt-4 text-sm font-medium tnum">{{ R.violations }} {{ R.violations===1 ? 'violation' : 'violations' }} recorded</p>
          <p v-if="R.settings.timer_mode!=='off'" class="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground tnum"><Icon name="Timer" :size="12"/>The timer is still running · {{ fmt(R.secLeft) }} left</p>
          <Button class="mt-5 !h-11 w-full !bg-fa !text-fa-fg hover:opacity-90" @click="resolveOverlay"><Icon :name="R.overlay.type==='fullscreen_exit' ? 'Maximize' : 'ArrowRight'"/>{{ R.overlay.type==='fullscreen_exit' ? 'Return to full screen' : 'Back to the form' }}</Button>
        </div>
      </div>
    </Transition></Teleport>

    <!-- SUBMIT CONFIRM -->
    <Dialog v-model:open="R.confirm">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Submit your answers?</h2>
        <p class="text-sm text-muted-foreground">You answered <span class="font-medium text-foreground tnum">{{ answeredCount }} of {{ totalQ }}</span> questions. Questions in skipped sections do not count. You cannot change answers after submitting.</p></div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="R.confirm=false">Keep answering</Button><Button class="!bg-fa !text-fa-fg hover:opacity-90" @click="submit('manual')"><Icon name="Send" :size="14"/>Submit</Button></div>
    </Dialog>

    <!-- PROTOTYPE PANEL -->
    <button type="button" @click="R.dev=true" class="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg hover:bg-accent" :class="R.stage==='running' ? 'bottom-24 sm:bottom-4' : ''" style="margin-bottom:env(safe-area-inset-bottom,0px)"><Icon name="FlaskConical" :size="14"/>Prototype states</button>
    <Sheet v-model:open="R.dev">
      <div class="border-b p-5 pr-12"><h2 class="font-semibold">Prototype states</h2><p class="mt-1 text-sm text-muted-foreground">Jump to any screen, simulate rule breaks, or change the form settings. Not part of the product.</p></div>
      <div class="flex-1 space-y-6 overflow-auto p-5 text-sm">
        <section>
          <template v-for="s in scenarios" :key="s.id || s.group">
            <p v-if="s.group" class="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">{{ s.group }}</p>
            <button v-else type="button" @click="setScenario(s.id)" :class="['flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent', (R.gate===s.id || (s.id==='normal' && (R.stage==='verify'||R.stage==='code'))) ? 'bg-accent font-medium' : '']"><Icon :name="s.icon" class="text-muted-foreground"/>{{ s.label }}</button>
          </template>
        </section>
        <section><p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Simulate while answering</p>
          <div class="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" :disabled="R.stage!=='running'" @click="sim('tab_hidden')"><Icon name="AppWindow" :size="14"/>Switch tab</Button>
            <Button variant="outline" size="sm" :disabled="R.stage!=='running'" @click="sim('fullscreen_exit')"><Icon name="Minimize" :size="14"/>Exit full screen</Button>
            <Button variant="outline" size="sm" :disabled="R.stage!=='running'" @click="sim('copy_attempt')"><Icon name="ClipboardX" :size="14"/>Copy attempt</Button>
            <Button variant="outline" size="sm" :disabled="R.stage!=='running' || R.settings.timer_mode==='off'" @click="jump(125)"><Icon name="Timer" :size="14"/>Timer to 2:05</Button>
            <Button variant="outline" size="sm" :disabled="R.stage!=='running' || R.settings.timer_mode==='off'" @click="jump(65)"><Icon name="Timer" :size="14"/>Timer to 1:05</Button>
            <Button variant="outline" size="sm" :disabled="R.stage!=='running' || R.settings.timer_mode==='off'" @click="jump(5)"><Icon name="TimerOff" :size="14"/>Timer to 0:05</Button>
          </div></section>
        <section class="grid gap-3"><p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form settings</p>
          <div class="grid gap-1.5"><span class="text-sm">Timer</span><Select v-model="R.settings.timer_mode" :options="timerOpts"/></div>
          <div class="grid gap-1.5"><span class="text-sm">When a rule is broken</span><Select v-model="R.settings.violation_policy" :options="policyOpts"/></div>
          <label class="flex items-center justify-between gap-3">Full screen<Switch v-model="R.settings.require_fullscreen"/></label>
          <label class="flex items-center justify-between gap-3">One tab only<Switch v-model="R.settings.single_tab"/></label>
          <label class="flex items-center justify-between gap-3">Block copy and paste<Switch v-model="R.settings.block_copy_paste"/></label>
          <p class="text-xs text-muted-foreground">Settings apply from the next start.</p>
        </section>
      </div>
    </Sheet>

    <!-- TOASTS -->
    <div class="pointer-events-none fixed inset-x-0 top-16 z-[80] flex flex-col items-center gap-2 px-3" aria-live="assertive">
      <TransitionGroup name="toast">
        <div v-for="t in R.toasts" :key="t.id" :class="['pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-3.5 shadow-lg', t.tone==='danger' ? 'border-destructive/40 bg-destructive text-destructive-foreground' : 'bg-popover text-popover-foreground']">
          <Icon :name="t.icon" class="mt-0.5" :class="t.tone==='danger' ? '' : 'text-fa'"/>
          <div class="min-w-0"><p class="text-sm font-medium">{{ t.title }}</p><p v-if="t.desc" class="text-xs opacity-80">{{ t.desc }}</p></div>
        </div>
      </TransitionGroup>
    </div>
  </div>`
};

const app = createApp(App);
Object.entries({ Icon, Button, Input, Textarea, Label, Switch, Checkbox, RadioGroupItem, Badge, Card, Separator, Select, DropdownMenu, Tooltip, Dialog, Sheet, Tabs, QuestionField })
  .forEach(([n, c]) => app.component(n, c));
app.mount('#app');
</script>
