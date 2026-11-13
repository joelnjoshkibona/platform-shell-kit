  /* ================================================================ P100/P101: AppDialog — the one dialog component, in a stack
     openDialog({ kind, title, size, fullscreen, fullPage, closeLabel, actions, status, beforeClose, confirmText, component, props })
       kind        'confirm' | 'form' | 'record' | 'info' — a preset for size, full screen and the footer (DLG_KINDS)
       size        'sm' 420 · 'md' 560 · 'lg' 760 · 'xl' 1100 — from what the dialog holds, never from how deep it is
       fullscreen  shows ⤢ (form, record); the person's choice is remembered per kind of dialog (prefKey)
       fullPage    () => void, where "Open full page" goes; without it the button is not shown
       actions     [{ label, run(d), primary?, danger?, keepOpen? }] — the right of the footer: the main one furthest right,
                   one more beside it, the rest under More
       beforeClose async (d) => false to stay open — runs on Close, Esc, Back, a trail step and Open full page
       confirmText a word to type before the main action works (YES for deletes, P26)
     Fixed for every dialog: the footer (Close left · status · actions right); no × and clicking outside does nothing; Esc and
     the phone's Back close the top dialog only; dialogs stack, each at its own size; on a phone every dialog is full screen.
     P101 opens another record's tab with openRecordTab(module, id, tab). Forms with a context (openForm) come with P100. */
  const DIALOGS = reactive([]);
  const DLG_W = { sm: 'sm:max-w-[420px]', md: 'sm:max-w-[560px]', lg: 'sm:max-w-[760px]', xl: 'sm:max-w-[1100px]' };
  const DLG_KINDS = { confirm: { size: 'sm', fullscreen: false, closeLabel: 'Cancel' }, form: { size: 'md', fullscreen: true }, record: { size: 'xl', fullscreen: true }, info: { size: 'md', fullscreen: false } };
  const dlgPrefs = (() => { try { return JSON.parse(localStorage.getItem('kit.dialogFull') || '{}'); } catch (e) { return {}; } })();   // on the person's account in the app
  let dlgSeq = 0;
  function openDialog(o) {
    const k = DLG_KINDS[o.kind || 'form'] || DLG_KINDS.form;
    const d = reactive({ closeLabel: k.closeLabel || 'Close', actions: [], status: '', ...o, id: ++dlgSeq, kind: o.kind || 'form', size: o.size || k.size,
      canFull: o.fullscreen != null ? o.fullscreen : k.fullscreen, prefKey: o.prefKey || (o.kind || 'form') + ':' + (o.module || o.title || ''), component: o.component ? markRaw(o.component) : null,
      full: false, typed: '', busy: false, leaving: false, tabs: null, tab: o.tab || null, sub: o.sub || '' });
    d.full = !!(d.canFull && dlgPrefs[d.prefKey]);
    DIALOGS.push(d); return d;
  }
  async function closeDialog(d, force) {
    if (d.leaving) return true;
    if (!force && d.beforeClose) { try { if ((await d.beforeClose(d)) === false) return false; } catch (e) { return false; } }
    /* motion: the dialog plays its way out (120ms; 200ms sliding down on a phone) before it leaves the stack */
    const out = motionMs(window.innerWidth < 640 ? 200 : 120); if (out) { d.leaving = true; await wait(out); }
    const i = DIALOGS.indexOf(d); if (i > -1) DIALOGS.splice(i, 1); return true;
  }
  async function closeDialogsAbove(j) { while (DIALOGS.length - 1 > j) { if (!(await closeDialog(DIALOGS[DIALOGS.length - 1]))) return false; } return true; }
  const closeTopDialog = () => DIALOGS.length ? closeDialog(DIALOGS[DIALOGS.length - 1]) : Promise.resolve(false);
  G.dialogs = DIALOGS; G.closeTopDialog = closeTopDialog;

  /* P101: another record's tab, in a dialog. The module's page draws only that tab (embed mode); the tabs sit in the header. */
  const tabLabelOf = (m, key) => { const t = ((MODULES[m] || {}).tabs || []).find(x => x.key === key); return t ? t.label : key; };
  function openRecordTab(module, id, tab) {
    const m = MODULES[module]; if (!m || !m.page) { if (m) m.open(id, tab); return; }
    const rec = m.find ? m.find(id) : null; if (m.find && !rec) { toast('That record no longer exists', String(id), 'TriangleAlert'); return; }
    return openDialog({ kind: 'record', module, title: rec ? rec.label : String(id), sub: m.label, component: RecordTabView, props: { module, id }, tab: tab || 'overview', link: { module, id },
      fullPage: (d) => m.open(id, d.tab) });
  }
  G.openRecordTab = openRecordTab;
  const RecordTabView = {
    props: { module: String, id: [String, Number], dialog: Object },
    setup(p) { const m = MODULES[p.module]; return { page: m.page, onTabs: (t) => { p.dialog.tabs = t; } }; },
    template: `<component :is="page" :embed-id="id" :embed-tab="dialog.tab" @update:embed-tab="v => dialog.tab = v" @tabs="onTabs"/>`
  };

  /* one layer of the stack */
  const DialogLayer = {
    props: { d: Object, i: Number },
    setup(p) {
      const below = computed(() => DIALOGS.slice(0, p.i));
      const isTop = computed(() => DIALOGS[DIALOGS.length - 1] === p.d);
      const labelOf = (x) => x.title + (x.tabs && x.tab ? ' · ' + ((x.tabs.find(t => t.value === x.tab) || {}).label || x.tab) : '');
      const sorted = computed(() => { const a = [...(p.d.actions || [])]; return [...a.filter(x => !x.primary), ...a.filter(x => x.primary)]; });
      const shown = computed(() => sorted.value.slice(-2)); const extra = computed(() => sorted.value.slice(0, -2));
      const locked = (a) => a.primary && p.d.confirmText && p.d.typed.trim().toUpperCase() !== p.d.confirmText.toUpperCase();
      async function run(a) {
        if (p.d.busy || locked(a)) return; p.d.busy = true;
        try { const r = await a.run(p.d); if (r === false) motionInvalid(root.value); else if (!a.keepOpen) await closeDialog(p.d, true); } finally { p.d.busy = false; }
      }
      async function full() { const go = p.d.fullPage; const d = p.d; d.goingFull = true; if (!(await closeDialogsAbove(-1))) { d.goingFull = false; return; } go(d); }
      function toggleFull() { p.d.full = !p.d.full; dlgPrefs[p.d.prefKey] = p.d.full; try { localStorage.setItem('kit.dialogFull', JSON.stringify(dlgPrefs)); } catch (e) {} }
      const id = Symbol('dialog');
      const onKey = (e) => { if (e.key !== 'Escape' || e.__popClosed || e.defaultPrevented || OVERLAYS[OVERLAYS.length - 1] !== id) return; e.preventDefault(); closeDialog(p.d); };
      const root = ref(null);
      onMounted(() => { OVERLAYS.push(id); window.addEventListener('keydown', onKey); nextTick(() => { const el = root.value && root.value.querySelector('[data-autofocus], h2'); if (el) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); } }); });
      onBeforeUnmount(() => { const k = OVERLAYS.indexOf(id); if (k > -1) OVERLAYS.splice(k, 1); window.removeEventListener('keydown', onKey); });
      return { below, isTop, labelOf, shown, extra, locked, run, full, toggleFull, root, closeDialog, closeDialogsAbove, DLG_W };
    },
    template: `<Teleport to="body"><div class="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4" :style="{ zIndex: 50 + i }">
      <div :class="['dlg-ov absolute inset-0', i === 0 ? 'bg-black/70' : 'bg-black/45', d.leaving && 'dlg-out']" aria-hidden="true"></div>
      <div ref="root" role="dialog" aria-modal="true" :aria-label="labelOf(d)" data-testid="app-dialog" :data-kind="d.kind" :data-size="d.full ? 'full' : d.size"
        :class="['dlg-panel relative flex w-full flex-col overflow-hidden border bg-background shadow-2xl', d.leaving && 'dlg-out', d.full ? 'h-[100dvh] sm:h-[calc(100dvh-2rem)] sm:max-w-[calc(100vw-2rem)] sm:rounded-xl' : 'h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl ' + DLG_W[d.size]]" style="padding-top:env(safe-area-inset-top,0px)">
        <header class="shrink-0 border-b px-4 pt-3 sm:px-5" :class="d.tabs ? 'pb-2' : 'pb-3'">
          <button v-if="below.length" type="button" class="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:hidden" @click="closeDialog(d)"><Icon name="ArrowLeft" :size="13"/>{{ labelOf(below[below.length - 1]) }}</button>
          <nav v-if="below.length" class="mb-1 hidden min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground sm:flex" aria-label="Open dialogs" data-testid="dialog-trail">
            <template v-for="(x, j) in below" :key="x.id"><button type="button" class="max-w-[16rem] truncate hover:text-foreground hover:underline" @click="closeDialogsAbove(j)">{{ labelOf(x) }}</button><Icon name="ChevronRight" :size="12" class="shrink-0"/></template>
            <span class="truncate text-foreground">{{ labelOf(d) }}</span></nav>
          <div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p v-if="d.sub" class="text-xs font-medium text-muted-foreground">{{ d.sub }}</p><h2 class="truncate text-lg font-semibold tracking-tight outline-none">{{ d.title }}</h2></div>
            <Tooltip v-if="d.canFull" :content="d.full ? 'Back to its size' : 'Full screen'" side="bottom" class="hidden sm:block"><Button variant="ghost" size="icon" class="h-8 w-8" :aria-label="d.full ? 'Leave full screen' : 'Full screen'" :aria-pressed="d.full" @click="toggleFull"><Icon :name="d.full ? 'Minimize2' : 'Maximize2'" :size="15"/></Button></Tooltip></div>
          <div v-if="d.tabs" class="mt-2"><Tabs v-model="d.tab" :items="d.tabs"/></div>
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5" data-testid="dialog-body"><component v-if="d.component" :is="d.component" v-bind="d.props" :dialog="d"/><p v-else-if="d.text" class="text-sm text-muted-foreground">{{ d.text }}</p>
          <label v-if="d.confirmText" class="mt-4 grid gap-1.5 text-sm"><span>Type <b>{{ d.confirmText }}</b> to confirm</span><Input v-model="d.typed" :aria-label="'Type ' + d.confirmText + ' to confirm'" autocomplete="off" data-autofocus/></label></div>
        <div v-if="d.saveFailed" class="flex flex-wrap items-center gap-2 border-t bg-destructive/10 px-4 py-2.5 text-sm sm:px-5" role="alert" data-testid="draft-failed"><Icon name="CloudOff" :size="15" class="text-destructive"/><span class="mr-auto">Couldn't save the draft, so the form stays open.</span><Button size="sm" variant="outline" @click="d.saveFailed = false; closeDialog(d)">Try again</Button><Button size="sm" variant="ghost" class="text-destructive" @click="closeDialog(d, true)">Close without saving</Button></div>
        <footer class="shrink-0 border-t bg-background px-4 pt-3 sm:px-5" style="padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))" data-testid="dialog-footer">
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div class="flex gap-2"><Button variant="outline" class="flex-1 sm:flex-none" :disabled="d.busy" @click="closeDialog(d)">{{ d.closeLabel }}</Button><Button v-if="d.fullPage" variant="ghost" class="flex-1 sm:flex-none" :disabled="d.busy" @click="full">Open full page<Icon name="ArrowUpRight" :size="14"/></Button></div>
            <p v-if="d.status" class="text-xs text-muted-foreground sm:ml-1" role="status">{{ d.status }}</p>
            <div v-if="shown.length" class="flex flex-wrap items-center gap-2 sm:ml-auto sm:flex-nowrap">
              <DropdownMenu v-if="extra.length" :items="extra.map((a, k) => ({ id: k, label: a.label }))" @select="it => run(extra[it.id])"><template #trigger><Button variant="outline" :disabled="d.busy">More<Icon name="ChevronDown" :size="14"/></Button></template></DropdownMenu>
              <Button v-for="a in shown" :key="a.label" :variant="a.primary ? (a.danger ? 'destructive' : 'default') : 'outline'" class="flex-1 sm:flex-none" :disabled="d.busy || locked(a)" @click="run(a)"><Icon v-if="d.busy && a.primary" name="LoaderCircle" :size="14" class="animate-spin"/>{{ a.label }}</Button></div>
          </div></footer>
      </div></div></Teleport>`
  };
  const DialogStack = { setup() { return { DIALOGS }; }, template: `<DialogLayer v-for="(d, i) in DIALOGS" :key="d.id" :d="d" :i="i"/>` };

  /* P101: a tab the person may not see, or that does not exist, opens the first tab instead and says why */
  function guardTab(get, set, tabs, module) {
    watch(() => [get(), tabs.value.map(t => t.value).join()], () => {
      const t = get(); if (!t || !tabs.value.length || tabs.value.some(x => x.value === t)) return;
      set(tabs.value[0].value); toast("You can't see " + tabLabelOf(module, t) + ' on this record', 'Showing ' + tabs.value[0].label + ' instead.', 'EyeOff');
    }, { immediate: true });
  }

  /* ================================================================ P100: opening a form with settings (form context)
     defineForm(module, { title, size, component, labels, splash(ctx) -> { refused } })   a module's create form
     openForm(module, { mode: 'create', prefill, lock, hide, disable: { field: reason }, title, after: 'stay' | 'open' | 'back', draft })
       prefill  filled, can be changed · lock  shown with its value, fixed (LockedField) · hide  not shown, value fixed
       disable  shown greyed with the reason · after  what Save does next · draft  a draft key to resume
     The server checks the context first (splash: a lock to a record the person can't see is refused) and again on save
     (a locked or hidden field sent with another value is a 422), so editing the link changes nothing.
     The form is written once: in a dialog its actions go to the dialog's footer (useDialogFooter); as a page (Open full page)
     the same actions sit in the page's sticky save bar. Closing a changed form saves its draft at once (keepDraftOnClose). */
  var FORM_DEFS;   // var, not const: parts loaded before this one (parts_loc.js) register their forms too
  function defineForm(module, f) { (FORM_DEFS || (FORM_DEFS = {}))[module] = f; return f; }
  function ctxClean(ctx) { const c = ctx || {}; return { mode: c.mode || 'create', prefill: c.prefill || {}, lock: c.lock || {}, hide: c.hide || {}, disable: c.disable || {}, title: c.title || '', after: c.after || '', draft: c.draft || '' }; }
  function openForm(module, ctx0) {
    const f = (FORM_DEFS || {})[module]; if (!f) return null; let ctx = ctxClean(ctx0);
    const r = f.splash ? f.splash(ctx) : null;
    if (r && r.refused) { toast("That form's settings were refused", r.refused, 'ShieldAlert'); ctx = ctxClean({ title: '' }); }
    return openDialog({ kind: 'form', module, size: f.size || 'md', title: ctx.title || f.title, component: f.component, props: { ctx }, formLink: { module, ctx }, prefKey: 'form:' + module,
      fullPage: (d) => { G.formPage = { module, ctx: { ...ctx, draft: d.draftKey || '' } }; nav('form'); } });
  }
  G.openForm = openForm;
  /* the server's check on save (in the app: the API's 422) */
  function checkContext(module, ctx, payload) {
    const f = (FORM_DEFS || {})[module] || {}; const name = (k) => (f.labels || {})[k] || k;
    for (const [k, v] of Object.entries({ ...ctx.lock, ...ctx.hide })) if (String(payload[k]) !== String(v)) return name(k) + ' is fixed for this form and can\'t be changed.';
    return '';
  }
  G.checkFormContext = checkContext;
  /* a form hands its status and actions to whatever hosts it: a dialog's footer, or a page's save bar */
  function useDialogFooter(host, o) {
    if (!host) return;
    watchEffect(() => { host.status = o.status ? o.status() : ''; host.actions = o.actions ? o.actions() : []; });
  }
  const draftLine = (draft) => draft.D.state === 'saving' ? 'Saving draft…' : draft.D.state === 'failed' ? "Couldn't save the draft" : draft.D.state === 'saved' && draft.D.savedAt ? 'Draft saved ' + new Date(draft.D.savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : draft.D.state === 'dirty' ? 'Unsaved changes' : '';
  /* every close of a changed form saves its draft at once; if it can't, the form stays open and says so */
  function keepDraftOnClose(draft, host) {
    host.beforeClose = async (d) => {
      if (!draft.changed()) { draft.saveNow(); return true; }
      if (!draft.saveNow()) { d.saveFailed = true; return false; }
      d.draftKey = draft.D.key; d.saveFailed = false;
      if (!d.goingFull) toast('Kept as a draft', 'Find it again in this form or in My drafts.', 'History');
      return true;
    };
  }
  /* the form as a full page: the same component, its actions in a sticky save bar */
  const FormPage = {
    setup() {
      const host = reactive({ kind: 'form', status: '', actions: [], busy: false });
      const f = computed(() => G.formPage && (FORM_DEFS || {})[G.formPage.module]);
      const run = async (a) => { if (host.busy) return; host.busy = true; try { const r = await a.run(host); if (r === false) motionInvalid('main'); else if (!a.keepOpen) goBack(); } finally { host.busy = false; } };
      const sorted = computed(() => { const a = [...host.actions]; return [...a.filter(x => !x.primary), ...a.filter(x => x.primary)]; });
      onBeforeUnmount(() => { if (host.beforeClose) host.beforeClose(host); });
      return { G, host, f, run, sorted, goBack };
    },
    template: `<div v-if="f" class="mx-auto grid max-w-[760px] grid-cols-[minmax(0,1fr)] gap-4 pb-24">
      <nav class="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb"><BackButton/><span class="truncate">{{ G.formPage.ctx.title || f.title }}</span></nav>
      <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ G.formPage.ctx.title || f.title }}</h2>
      <Card class="p-4 sm:p-6"><component :is="f.component" :ctx="G.formPage.ctx" :dialog="host" page/></Card>
      <div class="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur lg:left-[240px]" style="padding-bottom:calc(.75rem + env(safe-area-inset-bottom,0px))" data-testid="form-savebar">
        <div class="mx-auto flex max-w-[760px] flex-wrap items-center gap-2"><p class="mr-auto text-xs text-muted-foreground" role="status">{{ host.status }}</p>
          <Button v-for="a in sorted" :key="a.label" :variant="a.primary ? 'default' : 'outline'" :disabled="host.busy" @click="run(a)">{{ a.label }}</Button></div></div>
    </div>`
  };
  /* the old "G.newLoc = …" callers keep working: they open the Locations form with its context */
  watch(() => G.newLoc, (v) => { if (!v) return; G.newLoc = false; openForm('Locations', typeof v === 'string' ? { lock: { parent: v }, title: 'New location under ' + ((locById(v) || {}).name || '') } : v && v.draft ? { draft: v.draft } : {}); });
