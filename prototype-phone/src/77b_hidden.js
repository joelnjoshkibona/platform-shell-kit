/* ============================================================ A hidden space behind search (P121 example)
   A space no menu shows: typing its passphrase into search opens it, and every search tries that first at the same cost,
   so search looks the same with or without one. It locks when you leave its pages or the app goes to the background.
   Setup comes at the first action that needs it (passphrase twice, a recovery key shown once), then that action runs.
   Also drawn: ChoiceSheet (a question with one tick box) and MessageDetails (a message's times). Prototype passphrase:
   "open sesame". */
const SPACE = reactive({
  exists: false, open: false, step: 1, p1: '', p2: '', tried: false, key: 'RTN7-R4EI-XQ3O-ZHOB-RKEQ-L5CO-ZI', q: '', hits: null, tab: 'conv',
  convs: [{ id: 'h1', name: '+255 741 398 494', c: '#64748b', ini: '', walkin: true, tag: 'Private · notifies as “New message”', icon: 'Lock', last: 'See you at six', at: '18:02' },
    { id: 'h2', name: '+255 689 004 117', c: '#64748b', ini: '', walkin: true, tag: 'Blocked · they get no signal', icon: 'Ban', last: 'Why are you ignoring me', at: 'Mon' }],
  rules: [{ id: 'r1', kind: 'Private number', value: '+255 741 398 494', icon: 'Lock' }, { id: 'r2', kind: 'Number', value: '+255 689 004 117', icon: 'Ban' }, { id: 'r3', kind: 'Prefix', value: '+25568', icon: 'Ban' }],
  kind: 'Number', val: '', choice: false, box: true, details: false, undo: null,
});
const PASS = 'open sesame';

const SpaceSearch = { components: { Header, Icon, Empty },
  setup() {
    const run = () => { const w = SPACE.q.trim(); if (!w) return; setTimeout(() => { if (SPACE.exists && w === PASS) { SPACE.q = ''; SPACE.hits = null; SPACE.open = true; go('space'); } else SPACE.hits = MSG.threads.flatMap(t => t.msgs.filter(m => m.body.toLowerCase().includes(w.toLowerCase())).map(m => ({ ...m, who: t.name }))); }, 420); };
    return { SPACE, run };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Search" pushed hideSearch/>
    <form class="flex items-center gap-2 border-b px-3 py-2" @submit.prevent="run"><input v-model="SPACE.q" type="search" class="h-10 min-w-0 flex-1 rounded-full bg-muted px-4 text-sm outline-none" placeholder="Search messages"/><button class="press grid h-9 w-9 place-items-center rounded-full" aria-label="Search"><Icon name="Search" :size="20"/></button></form>
    <p class="px-4 pt-3 text-xs text-muted-foreground">Prototype: {{ SPACE.exists ? 'type “open sesame” to open the hidden space' : 'no space yet: set one up from Setup' }}. Every search costs the same either way.</p>
    <div class="scroll min-h-0 flex-1 overflow-y-auto"><Empty v-if="SPACE.hits && !SPACE.hits.length" icon="SearchX" title="Nothing found" text="Try other words."/>
      <div v-for="h in SPACE.hits || []" :key="h.id" class="px-4 py-2.5"><b class="text-sm font-medium">{{ h.who }}</b><p class="truncate text-sm text-muted-foreground">{{ h.body }}</p></div></div></div>` };

const SpaceView = { components: { Header, Icon, Av, Empty, Sheet },
  setup() {
    const removeRule = (r) => { SPACE.rules = SPACE.rules.filter(x => x !== r); clearTimeout(SPACE.t); SPACE.undo = () => SPACE.rules.push(r); SPACE.t = setTimeout(() => (SPACE.undo = null), 5000); };
    const add = () => { const v = SPACE.val.trim(); if (!v) return; SPACE.rules.push({ id: 'r' + Date.now(), kind: SPACE.kind, value: v, icon: 'Ban' }); SPACE.val = ''; };
    const leave = () => { SPACE.open = false; go('spacesearch'); };
    return { SPACE, removeRule, add, leave };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header title="Hidden" pushed hideSearch/>
    <div v-if="!SPACE.open" class="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">Locked. It opens only from search.</div>
    <template v-else>
      <p class="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground"><Icon name="Lock" :size="13"/>Locks when you leave<button type="button" class="press ml-auto underline" @click="leave">(prototype: leave)</button></p>
      <div class="px-3 pt-3"><div class="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"><button v-for="t in [['conv', 'Conversations', SPACE.convs.length], ['rules', 'Rules', SPACE.rules.length]]" :key="t[0]" type="button" :class="['press flex h-7 items-center justify-center gap-1.5 rounded-md text-sm font-medium', SPACE.tab === t[0] ? 'bg-background shadow' : 'text-muted-foreground']" @click="SPACE.tab = t[0]">{{ t[1] }}<span class="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{{ t[2] }}</span></button></div></div>
      <div class="scroll min-h-0 flex-1 overflow-y-auto">
        <ul v-if="SPACE.tab === 'conv'" class="mt-2 divide-y"><li v-for="c in SPACE.convs" :key="c.id" class="flex min-h-[72px] items-center gap-3 px-4 py-2.5"><Av :c="c" :size="44"/><span class="min-w-0 flex-1"><span class="flex items-baseline gap-2"><b class="min-w-0 flex-1 truncate text-[15px] font-medium">{{ c.name }}</b><time class="text-xs text-muted-foreground">{{ c.at }}</time></span><span class="flex items-center gap-1 text-xs text-muted-foreground"><Icon :name="c.icon" :size="12"/>{{ c.tag }}</span><span class="block truncate text-sm text-muted-foreground">{{ c.last }}</span></span></li></ul>
        <template v-else><p class="m-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Rules are seen and changed only here. A rule wins over a saved contact.</p>
          <ul class="divide-y"><li v-for="r in SPACE.rules" :key="r.id" class="flex items-center gap-3 px-4 py-2.5"><Icon :name="r.icon" :size="16" class="text-muted-foreground"/><span class="min-w-0 flex-1"><b class="block truncate text-sm font-medium">{{ r.value }}</b><small class="text-xs text-muted-foreground">{{ r.kind }}</small></span><button type="button" class="press grid h-9 w-9 place-items-center rounded-full" :aria-label="'Remove ' + r.value" @click="removeRule(r)"><Icon name="X" :size="18"/></button></li></ul>
          <form class="flex gap-2 border-t p-3" @submit.prevent="add"><select v-model="SPACE.kind" class="h-10 rounded-lg border bg-background px-2 text-sm"><option>Number</option><option>Prefix</option><option>Wildcard</option><option>Keyword</option></select><input v-model="SPACE.val" class="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm" placeholder="+255 699 or a word"/><button class="press h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Add</button></form></template>
      </div>
      <div v-if="SPACE.undo" class="absolute inset-x-3 bottom-5 z-40 flex items-center gap-3 overflow-hidden rounded-lg border bg-popover p-3.5 shadow-lg"><Icon name="X" class="text-primary"/><span class="flex-1 text-sm font-medium">Rule removed</span><button type="button" class="press px-3 text-sm font-semibold text-primary" @click="SPACE.undo(); SPACE.undo = null">Undo</button><span class="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary/60" style="animation: msg-drain 5s linear forwards"></span></div>
    </template></div>` };

const SpaceSetup = { components: { Header, Icon },
  setup() {
    const problem = computed(() => SPACE.p1.length < 4 ? 'Use at least 4 characters.' : SPACE.p1 !== SPACE.p2 ? 'The two passphrases don’t match.' : '');
    const make = () => { SPACE.tried = true; if (problem.value) return; SPACE.exists = true; SPACE.step = 3; };
    const done = () => { SPACE.step = 1; SPACE.p1 = SPACE.p2 = ''; SPACE.tried = false; go('spacesearch'); };
    return { SPACE, problem, make, done };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Hidden space" pushed hideSearch/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4"><div class="mb-5 flex gap-1.5"><i v-for="n in 3" :key="n" :class="['h-1 flex-1 rounded-full', n <= SPACE.step ? 'bg-primary' : 'bg-muted']"></i></div>
      <section v-if="SPACE.step === 1" class="grid gap-4"><span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon name="Lock" :size="28"/></span><h2 class="text-xl font-semibold">A space for private things</h2>
        <p class="text-sm text-muted-foreground">Sealed here, opened only by your passphrase. Nothing in the app shows that it exists.</p>
        <p class="flex gap-3 text-sm"><Icon name="Search" :size="18" class="shrink-0 text-muted-foreground"/>To open it, type the passphrase into search.</p>
        <p class="flex gap-3 text-sm text-destructive"><Icon name="TriangleAlert" :size="18" class="shrink-0"/>Uninstalling the app or clearing its data deletes it for good.</p>
        <button type="button" class="press h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground" @click="SPACE.step = 2">Set it up</button></section>
      <form v-else-if="SPACE.step === 2" class="grid gap-4" @submit.prevent="make"><h2 class="text-xl font-semibold">Choose a passphrase</h2>
        <label class="grid gap-1.5 text-sm font-medium">Passphrase<input v-model="SPACE.p1" type="password" class="h-11 rounded-lg border bg-background px-3 text-base"/></label>
        <p v-if="SPACE.p1 && SPACE.p1.length < 8" class="-mt-2 flex gap-2 text-xs text-amber-600"><Icon name="TriangleAlert" :size="14" class="shrink-0"/>A short passcode can be guessed from a copied phone in hours.</p>
        <label class="grid gap-1.5 text-sm font-medium">Passphrase again<input v-model="SPACE.p2" type="password" class="h-11 rounded-lg border bg-background px-3 text-base"/></label>
        <p v-if="SPACE.tried && problem" class="text-sm text-destructive">{{ problem }}</p>
        <button class="press h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground">Make it</button><p class="text-xs text-muted-foreground">Prototype: use “open sesame”.</p></form>
      <section v-else class="grid gap-4"><h2 class="text-xl font-semibold">Your recovery key</h2><p class="text-sm text-muted-foreground">Write it down. If you forget your passphrase, it opens instead.</p>
        <p class="rounded-xl border-2 border-dashed bg-muted/40 px-4 py-5 text-center font-mono text-lg font-semibold tracking-wider"><template v-for="(g, i) in SPACE.key.split('-')" :key="i"><span v-if="i">-</span><span class="inline-block whitespace-nowrap">{{ g }}</span></template></p>
        <p class="text-xs text-muted-foreground">This is the only time it is shown.</p><button type="button" class="press h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground" @click="done">I wrote it down</button></section></div></div>` };

const ChoiceDemo = { components: { Header, Icon, Sheet },
  setup() {
    const t = computed(() => MSG.threads.find(x => x.id === MSG.open));
    return { SPACE, t };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header :title="t ? t.name : ''" pushed hideSearch/>
    <div class="grid flex-1 content-start gap-2 p-4"><button type="button" class="press flex h-12 items-center gap-3 rounded-lg border px-3 text-sm text-destructive" @click="SPACE.choice = true; SPACE.box = true"><Icon name="Ban" :size="18"/>Block (opens a ChoiceSheet)</button>
      <button type="button" class="press flex h-12 items-center gap-3 rounded-lg border px-3 text-sm" @click="SPACE.details = true"><Icon name="Info" :size="18"/>A message's details (MessageDetails)</button></div>
    <Sheet :open="SPACE.choice" :title="'Block ' + (t ? t.name : '') + '?'" @close="SPACE.choice = false"><div class="grid gap-4 px-4 pb-4"><p class="text-sm text-muted-foreground">They get no signal. Their texts go to the hidden space, with no notification.</p>
      <label class="flex items-start gap-3 text-sm"><input v-model="SPACE.box" type="checkbox" class="mt-0.5 h-5 w-5"/>Also move the {{ t ? t.msgs.length : 0 }} existing messages</label>
      <div class="grid grid-cols-2 gap-2"><button type="button" class="press h-9 rounded-md border text-sm font-medium" @click="SPACE.choice = false">Cancel</button><button type="button" class="press h-9 rounded-md bg-destructive text-sm font-medium text-white" @click="SPACE.choice = false">Block</button></div></div></Sheet>
    <Sheet :open="SPACE.details" title="Message details" @close="SPACE.details = false"><dl class="grid gap-3 px-4 pb-5 text-sm">
      <div v-for="r in [['Clock', 'Written', '14 Nov 2026, 11:52:58'], ['Check', 'Sent', '14 Nov 2026, 11:53:01'], ['CheckCheck', 'Delivered', '14 Nov 2026, 11:53:04'], ['SimCard', 'SIM', 'SIM 2 · Airtel'], ['Layers', 'SMS parts', '1']]" :key="r[1]" class="flex items-center gap-3"><Icon :name="r[0]" :size="17" class="text-muted-foreground"/><dt class="flex-1 text-muted-foreground">{{ r[1] }}</dt><dd class="font-medium tnum">{{ r[2] }}</dd></div></dl></Sheet></div>` };
