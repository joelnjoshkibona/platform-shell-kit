/* ============================================================ Messages (P120 example: a module that owns the first screen)
   The kit's messaging pieces, drawn on the shop's texts with customers: SwipeRow (swipe sideways to one action, the same
   action in the long-press menu), the toast with Undo, MessageBubble (one state per sent message, Retry), Composer
   (characters and SMS parts, the SIM chip on a two-SIM phone) and FirstRun (one step at a time). In a product whose
   module says home: true, the conversations are the first screen and the drawer leads with its folders. */
const MSG = reactive({
  threads: [
    { id: 't1', name: 'Neema Kimaro', c: '#d97706', ini: 'NK', unread: 2, pinned: true, at: '14:22', last: 'Saturday works better for us too', out: false, failed: false, folder: 'inbox',
      msgs: [{ id: 'a', dir: 'in', body: 'Do you have Trident in stock?', time: '14:10', day: 'Today' }, { id: 'b', dir: 'out', body: 'Yes, 12 packs. Shall I keep two?', time: '14:12', st: 'delivered' }, { id: 'c', dir: 'in', body: 'Saturday works better for us too', time: '14:22' }] },
    { id: 't2', name: 'Omari Juma', c: '#2563eb', ini: 'OJ', unread: 0, at: '11:53', last: 'Sending the invoice tonight', out: true, failed: true, folder: 'inbox',
      msgs: [{ id: 'd', dir: 'in', body: 'Did the order go out?', time: '11:40', day: 'Today' }, { id: 'e', dir: 'out', body: 'It did. 2 boxes, delivery Monday', time: '11:52', st: 'delivered' }, { id: 'f', dir: 'out', body: 'Sending the invoice tonight', time: '11:53', st: 'failed' }] },
    { id: 't3', name: '+255 713 448 120', c: '#64748b', ini: '', walkin: true, unread: 0, muted: true, at: 'Mon', last: 'Thanks, received', out: false, failed: false, folder: 'inbox', msgs: [{ id: 'g', dir: 'in', body: 'Thanks, received', time: '09:15', day: 'Monday' }] },
  ],
  open: 't2', text: '', sims: true, sim: 1, menu: null, undo: null, step: 0, note: '',
});
const msgParts = (t) => { const u = [...t].some(ch => ch.charCodeAt(0) > 127); const n = t.length; if (!n) return ''; const one = u ? 70 : 160, many = u ? 67 : 153; return `${n} · ${n <= one ? 1 : Math.ceil(n / many)} SMS`; };
const msgUndo = (text, run) => { clearTimeout(msgUndo.t); MSG.undo = { text, run }; msgUndo.t = setTimeout(() => (MSG.undo = null), 5000); };

const SwipeRowP = { props: { label: String, icon: String }, emits: ['swipe', 'open', 'menu'], components: { Icon },
  setup(p, { emit }) {
    const dx = ref(0); let x0 = null, t = null, long = false;
    const down = (e) => { x0 = e.clientX; long = false; t = setTimeout(() => { long = true; emit('menu'); }, 480); };
    const move = (e) => { if (x0 == null) return; const d = e.clientX - x0; if (Math.abs(d) > 8) clearTimeout(t); dx.value = d; };
    const up = () => { clearTimeout(t); if (x0 == null) return; const d = dx.value; x0 = null; if (Math.abs(d) > 96) { dx.value = d > 0 ? 400 : -400; setTimeout(() => { emit('swipe'); dx.value = 0; }, 180); } else { dx.value = 0; if (!long && Math.abs(d) < 8) emit('open'); } };
    return { dx, down, move, up };
  },
  template: `<div class="relative select-none overflow-hidden" style="touch-action: pan-y">
    <div v-if="dx" class="absolute inset-0 flex items-center justify-between bg-primary/15 px-6 text-sm font-semibold text-primary"><span class="flex items-center gap-2" :class="Math.abs(dx) > 96 ? 'scale-110' : ''"><Icon :name="icon" :size="18"/>{{ label }}</span><span class="flex items-center gap-2" :class="Math.abs(dx) > 96 ? 'scale-110' : ''">{{ label }}<Icon :name="icon" :size="18"/></span></div>
    <div class="relative bg-background" :style="{ transform: dx ? 'translateX(' + dx + 'px)' : '', transition: Math.abs(dx) === 400 || !dx ? 'transform 200ms cubic-bezier(.2,.8,.2,1)' : '' }" @pointerdown="down" @pointermove="move" @pointerup="up" @pointerleave="up"><slot/></div></div>` };

const MessagesList = { components: { Header, Icon, Av, Empty, Sheet, SwipeRowP },
  setup() {
    const rows = computed(() => MSG.threads.filter(t => t.folder === 'inbox').sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
    const archive = (t) => { MSG.menu = null; t.folder = 'archive'; msgUndo('Archived', () => (t.folder = 'inbox')); };
    const open = (t) => { MSG.open = t.id; t.unread = 0; go('thread'); };
    return { S, MSG, rows, archive, open };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header title="Messages"/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto">
      <Empty v-if="!rows.length" icon="MessageSquare" title="No conversations" text="Texts you send and receive appear here."/>
      <ul class="divide-y"><li v-for="t in rows" :key="t.id"><SwipeRowP label="Archive" icon="Archive" @swipe="archive(t)" @open="open(t)" @menu="MSG.menu = t">
        <div class="flex min-h-[72px] items-center gap-3 px-4 py-2.5"><Av :c="t" :size="44"/>
          <div class="min-w-0 flex-1"><div class="flex items-baseline gap-2"><b :class="['min-w-0 flex-1 truncate text-[15px]', t.unread ? 'font-semibold' : 'font-medium']">{{ t.name }}</b><Icon v-if="t.muted" name="BellOff" :size="13" class="text-muted-foreground"/><Icon v-if="t.pinned" name="Pin" :size="13" class="text-muted-foreground"/><time :class="['text-xs tnum', t.unread ? 'font-semibold text-primary' : 'text-muted-foreground']">{{ t.at }}</time></div>
            <div class="flex items-center gap-2"><p v-if="t.failed" class="flex min-w-0 flex-1 items-center gap-1 truncate text-sm font-medium text-destructive"><Icon name="CircleAlert" :size="14"/>Not sent · tap to retry</p><p v-else :class="['min-w-0 flex-1 truncate text-sm', t.unread ? 'font-semibold' : 'text-muted-foreground']">{{ t.out ? 'You: ' : '' }}{{ t.last }}</p><span v-if="t.unread" class="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">{{ t.unread }}</span></div></div></div>
      </SwipeRowP></li></ul><div class="h-24"></div></div>
    <button type="button" class="press absolute bottom-5 right-4 z-30 flex h-14 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg" @click="go('thread')"><Icon name="PenLine" :size="18"/>Start chat</button>
    <Sheet :open="!!MSG.menu" :title="MSG.menu ? MSG.menu.name : ''" @close="MSG.menu = null"><div v-if="MSG.menu" class="px-2 pb-3">
      <button type="button" class="press flex h-12 w-full items-center gap-4 rounded-lg px-3 text-left text-sm" @click="MSG.menu.pinned = !MSG.menu.pinned; MSG.menu = null"><Icon name="Pin" :size="18" class="text-muted-foreground"/>{{ MSG.menu.pinned ? 'Unpin' : 'Pin' }}</button>
      <button type="button" class="press flex h-12 w-full items-center gap-4 rounded-lg px-3 text-left text-sm" @click="MSG.menu.muted = !MSG.menu.muted; MSG.menu = null"><Icon name="BellOff" :size="18" class="text-muted-foreground"/>{{ MSG.menu.muted ? 'Unmute' : 'Mute' }}</button>
      <button type="button" class="press flex h-12 w-full items-center gap-4 rounded-lg px-3 text-left text-sm" @click="archive(MSG.menu)"><Icon name="Archive" :size="18" class="text-muted-foreground"/>Archive (the same as the swipe)</button></div></Sheet>
    <div v-if="MSG.undo" class="absolute inset-x-3 bottom-24 z-40 flex items-center gap-3 overflow-hidden rounded-lg border bg-popover p-3.5 shadow-lg"><Icon name="Archive" class="text-primary"/><span class="flex-1 text-sm font-medium">{{ MSG.undo.text }}</span><button type="button" class="press px-3 text-sm font-semibold text-primary" @click="MSG.undo.run(); MSG.undo = null">Undo</button><span class="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary/60" style="animation: msg-drain 5s linear forwards"></span></div>
  </div>` };

const MessageThread = { components: { Header, Icon, Av, Sheet },
  setup() {
    const t = computed(() => MSG.threads.find(x => x.id === MSG.open));
    const st = { sending: ['Clock', 'Sending'], sent: ['Check', 'Sent'], delivered: ['CheckCheck', 'Delivered'], failed: ['CircleAlert', 'Not sent'] };
    const send = (body) => { const m = { id: 'n' + Date.now(), dir: 'out', body, time: '14:30', st: 'sending' }; t.value.msgs.push(m); MSG.text = ''; setTimeout(() => (m.st = 'sent'), 650); setTimeout(() => (m.st = 'delivered'), 1950); };
    const retry = (m) => { t.value.msgs = t.value.msgs.filter(x => x !== m); t.value.failed = false; send(m.body); };
    return { S, MSG, t, st, send, retry, msgParts };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header :title="t ? t.name : 'New conversation'" pushed hideSearch/>
    <div class="scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2 pt-3"><template v-for="m in (t ? t.msgs : [])" :key="m.id">
      <p v-if="m.day" class="self-center pb-2 pt-3 text-xs font-medium text-muted-foreground">{{ m.day }}</p>
      <div :class="['flex max-w-[80%] flex-col', m.dir === 'out' ? 'items-end self-end' : 'items-start self-start']"><div :class="['whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[15px] leading-snug', m.dir === 'out' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted']">{{ m.body }}</div>
        <div :class="['flex min-h-5 items-center gap-1 px-1.5 pb-1.5 pt-0.5 text-[11px] text-muted-foreground tnum', m.st === 'failed' ? 'font-semibold text-destructive' : '']"><span v-if="m.st !== 'failed' && m.st !== 'sending'">{{ m.time }}</span><template v-if="m.dir === 'out'"><Icon :name="st[m.st][0]" :size="13"/>{{ st[m.st][1] }}<button v-if="m.st === 'failed'" type="button" class="press ml-1 underline" @click="retry(m)">Retry</button></template></div></div></template></div>
    <div class="flex shrink-0 items-end gap-1.5 px-2 pb-3 pt-2"><div class="flex min-w-0 flex-1 flex-col rounded-3xl bg-muted px-4 pb-1 pt-1"><textarea v-model="MSG.text" rows="1" placeholder="Text message" class="min-h-[40px] resize-none bg-transparent py-2.5 text-[15px] outline-none"></textarea>
      <div class="flex justify-between pb-1 text-[11px] text-muted-foreground tnum"><button v-if="MSG.sims" type="button" class="press rounded-md border px-1.5 font-mono" @click="MSG.sim = MSG.sim === 1 ? 2 : 1">SIM {{ MSG.sim }}</button><span v-else></span><span>{{ msgParts(MSG.text) }}</span></div></div>
      <button type="button" :disabled="!MSG.text.trim()" class="press grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground" aria-label="Send" @click="send(MSG.text)"><Icon name="SendHorizontal" :size="20"/></button></div></div>` };

const FirstRunDemo = { components: { Icon },
  setup() {
    const steps = [['MessageSquare', 'Make this your SMS app', 'Android only lets the default SMS app send, receive and block texts.', 'Set as default', false],
      ['UserRound', 'Show names, not numbers', 'Contacts turn numbers into the people you know.', 'Allow contacts', true],
      ['Bell', 'Know when a text arrives', 'Notifications show new messages and let you reply from the shade.', 'Allow notifications', true]];
    const act = () => { MSG.note = ''; if (MSG.step + 1 < steps.length) MSG.step++; else { MSG.step = 0; S.nav = 'tab'; S.route = 'messages'; } };
    const no = () => (MSG.note = 'New texts will arrive silently. You can turn notifications on later in Settings.');
    return { MSG, steps, act, no };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col bg-background px-6 pb-5" style="padding-top: calc(24px + var(--sa-top))">
    <div class="flex gap-1.5"><i v-for="(s, i) in steps" :key="i" :class="['h-1 flex-1 rounded-full', i <= MSG.step ? 'bg-primary' : 'bg-muted']"></i></div>
    <div class="mt-14 grid h-[72px] w-[72px] place-items-center rounded-2xl bg-primary/10 text-primary"><Icon :name="steps[MSG.step][0]" :size="34"/></div>
    <h2 class="mt-6 text-2xl font-semibold tracking-tight">{{ steps[MSG.step][1] }}</h2><p class="mt-2 text-sm text-muted-foreground">{{ steps[MSG.step][2] }}</p>
    <p v-if="MSG.note" class="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{{ MSG.note }}</p><div class="flex-1"></div>
    <div class="flex flex-col gap-2"><button type="button" class="press h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground" @click="act">{{ steps[MSG.step][3] }}</button>
      <button v-if="steps[MSG.step][4]" type="button" class="press h-9 rounded-md text-sm font-medium" @click="act">Not now</button>
      <button v-if="MSG.step === 2" type="button" class="press h-8 text-xs text-muted-foreground underline" @click="no">(prototype: say no)</button></div></div>` };
