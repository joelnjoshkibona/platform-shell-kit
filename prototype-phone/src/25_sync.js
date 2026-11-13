/* ============================================================ P102: the phone app's data modes (connected · on the phone · sync)
   One app, the same screens; only the data layer changes (list / view / save / delete / action), so no screen knows the mode.
   connected  the API is the truth; no signal = read-only on the last data (P57, P59); a write is never repeated (P60).
   phone      the phone's own Laravel and SQLite are the backend: no server, no sign-in; backups to a file.
   sync       a working copy on the phone + a queue of changes waiting; each change carries a key the server remembers, so a
              repeat does nothing (P60 amended for this mode only); GET /sync/changes?since= brings the server's changes back;
              a changed-on-both-sides record answers 409 with the server's copy: mine and theirs side by side. */
const SYNCS = reactive({
  mode: 'connected', last: '5 min ago', running: false, first: 0,
  waiting: [
    { id: 'q1', icon: 'Receipt', what: 'Sale S-1305 · TZS 4,000', when: '10:42' },
    { id: 'q2', icon: 'Wallet', what: 'Payment from Neema Kimaro · TZS 2,000', when: '10:44' },
    { id: 'q3', icon: 'UserPlus', what: 'New customer: Juma Ally', when: '10:51' },
  ],
  failed: [{ id: 'f1', icon: 'Coins', what: 'Expense EXP-0036 · TZS 15,000', why: 'You can no longer add expenses at Office Shop.' }],
  keep: [['Sales and payments', 'your shop, last 90 days'], ['Customers', 'all of Office Shop'], ['Products and stock', 'all of Office Shop'], ['Expenses', 'yours, last 30 days']],
  backup: 'Yesterday 18:00',
});
const MODE_LABEL = { connected: 'Connected to the server', phone: 'All data on this phone', sync: 'Works without signal, syncs when it can' };
function syncNow() {
  if (SYNCS.running) return; if (S.net === 'offline') { toast('No signal. Your changes wait and go when it is back.'); return; }
  SYNCS.running = true; setTimeout(() => { SYNCS.running = false; SYNCS.waiting.splice(0); SYNCS.last = 'just now'; toast('Synced. 3 changes sent, 5 came in.'); }, 1300);
}
function firstSync() {
  SYNCS.first = 1; const t = setInterval(() => { SYNCS.first = Math.min(100, SYNCS.first + 9); if (SYNCS.first >= 100) { clearInterval(t); setTimeout(() => { SYNCS.first = 0; SYNCS.last = 'just now'; toast('Your shop is on this phone'); }, 400); } }, 220);
}

/* a short line under the greeting on Home: where the data is, and how fresh it is */
const SyncLine = { components: { Icon }, setup() { return { S, SYNCS, go, syncNow }; },
  template: `<button v-if="SYNCS.mode !== 'connected'" type="button" class="press rise mt-3 flex w-full items-center gap-3 rounded-xl border bg-card px-3.5 py-2.5 text-left" @click="go('sync')" data-testid="sync-line">
    <span :class="['grid h-8 w-8 shrink-0 place-items-center rounded-md', SYNCS.waiting.length || SYNCS.failed.length ? 'bg-warning/15 text-warning' : 'bg-primary/10 text-primary']"><Icon :name="SYNCS.mode === 'phone' ? 'Smartphone' : SYNCS.running ? 'RefreshCw' : 'Cloud'" :size="17" :class="SYNCS.running && 'animate-spin'"/></span>
    <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ SYNCS.mode === 'phone' ? 'All data is on this phone' : SYNCS.running ? 'Syncing…' : 'Last synced ' + SYNCS.last }}</span>
      <span class="block truncate text-xs text-muted-foreground">{{ SYNCS.mode === 'phone' ? 'Last backup ' + SYNCS.backup : (SYNCS.waiting.length ? SYNCS.waiting.length + ' changes waiting' : 'Nothing waiting') + (SYNCS.failed.length ? ' · ' + SYNCS.failed.length + " couldn't be sent" : '') }}</span></span>
    <Icon name="ChevronRight" :size="18" class="text-muted-foreground"/></button>` };

/* Sync (or Backups, on the phone): status, Sync now, what waits, what failed and why, what is kept */
const SyncPage = { components: { Header, Icon, Btn },
  setup() {
    const retry = (f) => { const i = SYNCS.failed.indexOf(f); SYNCS.failed.splice(i, 1); toast('Sent again. The server still says no: it is in the list again.'); setTimeout(() => SYNCS.failed.splice(i, 0, f), 900); };
    const drop = (f) => { S.dialog = { title: 'Throw this change away?', text: f.what + ' was never saved on the server. It will be gone.', action: 'Throw it away', tone: 'destructive', cancel: 'Keep it', ok: () => { SYNCS.failed.splice(SYNCS.failed.indexOf(f), 1); toast('Thrown away'); } }; };
    const backup = () => { SYNCS.backup = 'just now'; toast('Backup saved to Downloads/bootbox-backup.zip'); };
    return { S, SYNCS, MODE_LABEL, syncNow, retry, drop, backup, toast };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header :title="SYNCS.mode === 'phone' ? 'Data and backups' : 'Sync'" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4" data-testid="sync-page">
      <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">How this app keeps its data</p><p class="mt-0.5 text-sm font-semibold">{{ MODE_LABEL[SYNCS.mode] }}</p>
        <template v-if="SYNCS.mode === 'sync'"><p class="mt-3 text-2xl font-bold tracking-tight tnum">{{ SYNCS.running ? 'Syncing…' : 'Synced ' + SYNCS.last }}</p><p class="text-xs text-muted-foreground">{{ S.net === 'offline' ? 'No signal now. Keep working; changes wait here.' : 'It syncs by itself when there is signal.' }}</p>
          <div class="mt-3"><Btn full :disabled="SYNCS.running" @click="syncNow">{{ SYNCS.running ? 'Syncing…' : 'Sync now' }}</Btn></div></template>
        <template v-else-if="SYNCS.mode === 'phone'"><p class="mt-2 text-sm text-muted-foreground">There is no server: this phone is the shop's only copy. Back it up to a file and keep the file somewhere safe.</p>
          <p class="mt-3 text-sm">Last backup: <b>{{ SYNCS.backup }}</b></p><div class="mt-3 grid gap-2"><Btn full @click="backup">Back up now</Btn><Btn full v="outline" @click="toast('Choose a backup file to restore from')">Restore from a file</Btn></div></template>
      </div>
      <template v-if="SYNCS.mode === 'sync'">
        <h2 class="mb-2 mt-6 px-1 text-base font-semibold">Waiting to be sent ({{ SYNCS.waiting.length }})</h2>
        <p v-if="!SYNCS.waiting.length" class="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Nothing is waiting. Everything you did is on the server.</p>
        <ul v-else class="divide-y rounded-xl border bg-card" data-testid="sync-waiting"><li v-for="q in SYNCS.waiting" :key="q.id" class="flex items-center gap-3 px-4 py-3"><Icon :name="q.icon" :size="17" class="shrink-0 text-muted-foreground"/><span class="min-w-0 flex-1 truncate text-sm">{{ q.what }}</span><span class="text-xs text-muted-foreground tnum">{{ q.when }}</span></li></ul>
        <template v-if="SYNCS.failed.length"><h2 class="mb-2 mt-6 px-1 text-base font-semibold text-destructive">Couldn't be sent ({{ SYNCS.failed.length }})</h2>
          <ul class="divide-y rounded-xl border border-destructive/30 bg-card" data-testid="sync-failed"><li v-for="f in SYNCS.failed" :key="f.id" class="px-4 py-3"><div class="flex items-center gap-3"><Icon :name="f.icon" :size="17" class="shrink-0 text-destructive"/><span class="min-w-0 flex-1 truncate text-sm font-medium">{{ f.what }}</span></div>
            <p class="mt-1 pl-8 text-xs text-muted-foreground">{{ f.why }}</p><div class="mt-2 flex gap-2 pl-8"><Btn size="sm" v="outline" @click="retry(f)">Send again</Btn><Btn size="sm" v="ghost" @click="drop(f)">Throw it away</Btn></div></li></ul></template>
        <h2 class="mb-2 mt-6 px-1 text-base font-semibold">Kept on this phone</h2>
        <ul class="divide-y rounded-xl border bg-card"><li v-for="k in SYNCS.keep" :key="k[0]" class="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span>{{ k[0] }}</span><span class="text-right text-xs text-muted-foreground">{{ k[1] }}</span></li></ul>
        <p class="mt-3 px-1 text-xs text-muted-foreground">The server checks every change again when it arrives. A change you are no longer allowed to make is listed above, with why.</p>
      </template>
    </div></div>` };

/* the same record changed here and on the server: mine and theirs, side by side; my version waits as a draft until I choose */
const CONFLICT = { what: 'Customer: Neema Kimaro', who: 'Amina Mushi', when: 'today 10:40', fields: [['Phone', '+255 713 111 222', '+255 713 999 000'], ['Credit limit', 'TZS 50,000', 'TZS 80,000'], ['Area', 'Mbezi', 'Mbezi']] };
const ConflictPage = { components: { Header, Icon, Btn },
  setup() {
    const changed = CONFLICT.fields.filter(f => f[1] !== f[2]);
    const keepMine = () => { toast('Your version was sent again, on top of Amina’s'); back(); };
    const useTheirs = () => { toast('Using Amina’s version. Yours is thrown away.'); back(); };
    return { CONFLICT, changed, keepMine, useTheirs };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header title="Changed in two places" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4" data-testid="conflict">
      <div class="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"><Icon name="GitCompare" :size="20" class="mt-0.5 shrink-0 text-warning"/><div class="min-w-0"><p class="text-sm font-semibold">{{ CONFLICT.what }}</p><p class="mt-0.5 text-xs text-muted-foreground">{{ CONFLICT.who }} changed it on the server {{ CONFLICT.when }}, while you changed it here. Nothing was overwritten. Your version waits as a draft until you choose.</p></div></div>
      <div class="mt-4 overflow-hidden rounded-xl border bg-card"><div class="grid grid-cols-[6.5rem_1fr_1fr] gap-2 border-b bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><span></span><span>Yours</span><span>{{ CONFLICT.who.split(' ')[0] }}’s</span></div>
        <div v-for="f in CONFLICT.fields" :key="f[0]" class="grid grid-cols-[6.5rem_1fr_1fr] gap-2 border-b px-3 py-3 text-sm last:border-0"><span class="text-xs text-muted-foreground">{{ f[0] }}</span>
          <span :class="['min-w-0 break-words', f[1] !== f[2] && 'font-semibold text-primary']">{{ f[1] }}</span><span :class="['min-w-0 break-words', f[1] !== f[2] && 'font-semibold']">{{ f[2] }}</span></div></div>
      <p class="mt-2 px-1 text-xs text-muted-foreground">{{ changed.length }} of {{ CONFLICT.fields.length }} fields differ; they are in bold.</p>
    </div>
    <div class="shrink-0 border-t bg-background px-4 pt-3" style="padding-bottom:calc(12px + var(--sa-bottom, 0px))"><div class="grid grid-cols-2 gap-2"><Btn v="outline" @click="useTheirs">Use theirs</Btn><Btn @click="keepMine">Keep mine</Btn></div></div></div>` };

/* the first sync after signing in, in sync mode: the shop comes down to the phone, with progress */
const FirstSync = { components: { Icon }, setup() { return { SYNCS }; },
  template: `<div v-if="SYNCS.first" class="absolute inset-0 z-[105] flex flex-col items-center justify-center bg-background px-8 text-center" data-testid="first-sync"><span class="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon name="CloudDownload" :size="24"/></span>
    <h2 class="mt-4 text-xl font-semibold">Getting your shop ready</h2><p class="mt-1 text-sm text-muted-foreground">Copying what you work with to this phone, so it works without signal.</p>
    <div class="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-primary transition-all" :style="{ width: SYNCS.first + '%' }"></div></div>
    <p class="mt-2 text-xs text-muted-foreground tnum">{{ SYNCS.first < 35 ? 'Products and stock' : SYNCS.first < 70 ? 'Customers' : 'Sales and payments' }} · {{ SYNCS.first }}%</p>
    <p class="mt-6 text-xs text-muted-foreground">Keep the app open. If the signal drops, it carries on where it stopped.</p></div>` };

/* signing out: in sync mode with changes still waiting, ask first, because they would be lost */
function signOutAsk() {
  const n = SYNCS.mode === 'sync' ? SYNCS.waiting.length : 0;
  if (n) S.dialog = { title: n + (n === 1 ? ' change has' : ' changes have') + ' not been sent', text: 'Signing out removes them from this phone, and they were never saved on the server. Send them first with Sync now, or sign out and lose them.', action: 'Sign out anyway', tone: 'destructive', cancel: 'Stay signed in', ok: () => { SYNCS.waiting.splice(0); toast('Signed out. The changes were thrown away.'); } };
  else S.dialog = { title: 'Sign out?', text: 'This clears the cart and drafts on this phone. Sales you saved stay.', action: 'Sign out', tone: 'destructive', cancel: 'Stay signed in', ok: () => toast('Signed out. The sign-in screen comes in the next pass.') };
}
