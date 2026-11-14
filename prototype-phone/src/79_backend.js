/* ============================================================ P117: the phone on a backend it did not come with
   In the app every remote call goes through one adapter (`backend()`); the kit's API is the default and a product writes its own in product
   code. The Picker's Backend switch draws "another" backend whose capabilities differ: sign-in by username, a 4-digit code by SMS after the
   password, a password reset by code, one organisation (no picker or switcher), the menu built from the permissions, and no notifications
   (no Alerts tab, no Notifications in the menu). Screens are the same; only what the adapter declares changes. */
const BACKEND = reactive({
  kind: 'kit', user: 'rehema.k', codeErr: false, wait: 0,
  caps: () => BACKEND.kind === 'kit'
    ? { organizations: true, serverMenus: true, notifications: true, forgotPassword: 'link', twoFactor: 'totp' }
    : { organizations: false, serverMenus: false, notifications: false, forgotPassword: 'code', twoFactor: 'sms_code' }
});
let backendTick;
function codeCountdown(n) { BACKEND.wait = n; clearInterval(backendTick); backendTick = setInterval(() => { if (BACKEND.wait > 0) BACKEND.wait--; else clearInterval(backendTick); }, 1000); }

/* CodeBoxes: four boxes over one real input (inputmode numeric, autocomplete one-time-code, so the phone offers the SMS code).
   It emits `full` with the fourth digit; a wrong code shakes the boxes once (P116's refused-submit shake) and clears them. */
const CodeBoxes = { props: { modelValue: String, bad: Boolean },
  template: `<label :class="['relative mx-auto grid w-full max-w-[272px] grid-cols-4 gap-3', bad ? 'shake' : '']" aria-label="The 4-digit code">
    <input :value="modelValue" inputmode="numeric" autocomplete="one-time-code" maxlength="4" class="absolute inset-0 z-[1] h-full w-full opacity-0" @input="e => { const v = e.target.value.replace(/\\D/g, '').slice(0, 4); $emit('update:modelValue', v); if (v.length === 4) $emit('full', v); }">
    <span v-for="n in 4" :key="n" :class="['relative grid h-14 place-items-center rounded-lg border-2 text-2xl font-bold tnum transition-colors', bad ? 'border-destructive/60 bg-destructive/5 text-destructive' : (modelValue || '').length === n - 1 ? 'border-primary bg-primary/5' : 'border-input bg-card']">{{ (modelValue || '')[n - 1] || '' }}<span v-if="(modelValue || '').length === n - 1 && !bad" class="caret absolute h-6 w-0.5 rounded bg-primary"></span></span></label>` };

const fieldCls = 'flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

/* sign-in on another backend: a username, then the code step */
const OtherSignIn = { components: { AuthShell, Btn, Icon },
  setup() { const busy = ref(false); const go_ = () => { busy.value = true; setTimeout(() => { busy.value = false; BACKEND.codeErr = false; codeCountdown(60); S.nav = 'push'; S.route = 'othercode'; }, 600); };
    return { BACKEND, busy, go_, S, fieldCls }; },
  template: `<AuthShell title="Bootbox" sub="Sign in with your own account"><form class="grid gap-4" @submit.prevent="go_">
    <label class="grid gap-1.5 text-sm font-medium">Username<input v-model="BACKEND.user" autocomplete="username" :class="fieldCls"></label>
    <label class="grid gap-1.5 text-sm font-medium">Password<input type="password" value="password" autocomplete="current-password" :class="fieldCls"></label>
    <Btn full class="h-11" @click="go_">{{ busy ? 'Checking…' : 'Sign in' }}</Btn>
    <button type="button" class="justify-self-center text-sm font-medium text-primary" @click="S.nav = 'push'; S.route = 'otherforgot'">Forgot password?</button>
    <p class="flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground"><Icon name="MessageSquareLock" :size="16" class="shrink-0"/>Next we send a 4-digit code by SMS to the phone number on your account.</p></form></AuthShell>` };

/* the code step: one screen for every kind; it says where the code went; resend after a countdown */
const OtherCode = { components: { AuthShell, CodeBoxes, Btn, Icon },
  setup() { const code = ref(''); const busy = ref(false);
    const check = (v) => { busy.value = true; BACKEND.codeErr = false; setTimeout(() => { busy.value = false; if (v === '0000') { BACKEND.codeErr = true; code.value = ''; return; } tab('home'); }, 600); };
    const resend = () => { codeCountdown(60); toast('A new code is on its way'); };
    return { BACKEND, code, busy, check, resend }; },
  template: `<AuthShell title="Enter the code" sub="We sent 4 digits by SMS to the phone ending in 908.">
    <div class="grid gap-5"><CodeBoxes v-model="code" :bad="BACKEND.codeErr" @full="check"/>
      <p v-if="BACKEND.codeErr" class="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><Icon name="CircleAlert" :size="18" class="shrink-0"/>That code is not right, or it is more than 10 minutes old. Try again or send a new one.</p>
      <p v-else-if="busy" class="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Icon name="LoaderCircle" :size="16" class="animate-spin"/>Checking the code</p>
      <div class="text-center"><button v-if="!BACKEND.wait" type="button" class="h-10 px-3 text-sm font-semibold text-primary" @click="resend">Send a new code</button>
        <p v-else class="flex h-10 items-center justify-center text-sm text-muted-foreground tnum">Send a new code in 0:{{ String(BACKEND.wait).padStart(2, '0') }}</p></div></div></AuthShell>` };

/* password reset by code (the forgotPassword capability) */
const OtherForgot = { components: { AuthShell, Btn },
  setup() { const busy = ref(false); const send = () => { busy.value = true; setTimeout(() => { busy.value = false; codeCountdown(60); S.nav = 'push'; S.route = 'otherreset'; }, 600); }; return { BACKEND, busy, send, fieldCls }; },
  template: `<AuthShell title="Forgot your password?" sub="We send a code to your phone. Then you choose a new password."><form class="grid gap-4" @submit.prevent="send">
    <label class="grid gap-1.5 text-sm font-medium">Username<input v-model="BACKEND.user" autocomplete="username" :class="fieldCls"></label>
    <Btn full class="h-11" @click="send">{{ busy ? 'Sending…' : 'Send me a code' }}</Btn></form></AuthShell>` };
const OtherReset = { components: { AuthShell, CodeBoxes, Btn },
  setup() { const code = ref(''); const p1 = ref(''); const p2 = ref(''); const tried = ref(false);
    const err = computed(() => !tried.value ? '' : code.value.length < 4 ? 'Type the 4-digit code.' : p1.value.length < 6 ? 'Use at least 6 characters.' : p1.value !== p2.value ? 'The two passwords are not the same.' : '');
    const save = () => { tried.value = true; if (err.value) return; S.nav = 'pop'; S.route = 'othersignin'; toast('Password changed. Sign in with the new one.'); };
    return { code, p1, p2, err, save, fieldCls }; },
  template: `<AuthShell title="Choose a new password" sub="Type the code we sent to the phone ending in 908, then the new password twice."><form class="grid gap-4" @submit.prevent="save">
    <CodeBoxes v-model="code"/>
    <label class="grid gap-1.5 text-sm font-medium">New password<input v-model="p1" type="password" autocomplete="new-password" :class="fieldCls"></label>
    <label class="grid gap-1.5 text-sm font-medium">The same again<input v-model="p2" type="password" autocomplete="new-password" :class="fieldCls"></label>
    <p v-if="err" class="text-sm text-destructive">{{ err }}</p>
    <Btn full class="h-11" @click="save">Save the new password</Btn></form></AuthShell>` };
