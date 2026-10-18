/* ============================================================ receipts (D204-D208): the sale-done screen, the paper, the owner's Receipt settings */
const SHOP = { name: 'Office Shop', phone: '+255 754 000 111', lipa: '5551234 (Office Shop)' };
const RT = reactive({
  logo: true, address: 'Mwenge, Dar es Salaam', tin: '123-456-789', header: 'Karibu! Open 7:00 to 20:00', footer: 'Asante, karibu tena',
  blocks: { logo: true, shop: true, contact: true, header: true, meta: true, payment: true, how: true, footer: true }
});
const RBLOCKS = [
  ['logo', 'Logo', 'Image'], ['shop', 'Shop name', 'Store'], ['contact', 'Address, phone and TIN', 'MapPin'], ['header', 'Header line', 'Type'],
  ['meta', 'Number, date, cashier and customer', 'Hash'], ['items', 'Items', 'ShoppingCart', true], ['totals', 'Total', 'Sigma', true],
  ['payment', 'Paid, or on credit with the balance', 'Wallet'], ['how', 'How to pay', 'Smartphone'], ['footer', 'Footer line', 'MessageSquareText']
];
const FILLINS = ['{shop}', '{phone}', '{lipa}', '{customer}', '{balance}'];

/* the logo twice: as the owner uploaded it, and as the printer gets it (black and white, 384 dots wide, D206) */
const LOGO = (() => {
  try {
    const c = document.createElement('canvas'); c.width = 384; c.height = 120; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, 384, 120);
    x.fillStyle = '#2f6fe0'; x.beginPath(); x.roundRect(8, 8, 104, 104, 22); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 54px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OS', 60, 62);
    x.fillStyle = '#1d2a44'; x.textAlign = 'left'; x.font = 'bold 40px sans-serif'; x.fillText('Office', 130, 42); x.fillText('Shop', 130, 84);
    x.fillStyle = '#e9a23b'; x.fillRect(130, 106, 150, 6);
    const color = c.toDataURL();
    const d = x.getImageData(0, 0, 384, 120);
    for (let i = 0; i < d.data.length; i += 4) { const v = .299 * d.data[i] + .587 * d.data[i + 1] + .114 * d.data[i + 2] < 140 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; }
    x.putImageData(d, 0, 0);
    return { color, bw: c.toDataURL() };
  } catch (e) { return { color: '', bw: '' }; }
})();

const WIDTH = 32;
const rdate = (day) => day === 'Today' ? '18 Oct 2026' : day === 'Yesterday' ? '17 Oct 2026' : day;
const wrapText = (t, w = WIDTH) => { const out = []; let cur = ''; String(t).split(/\s+/).filter(Boolean).forEach(word => { if ((cur + ' ' + word).trim().length > w) { if (cur) out.push(cur); cur = word; } else cur = (cur + ' ' + word).trim(); }); if (cur) out.push(cur); return out; };
const centre = (t) => ' '.repeat(Math.max(0, Math.floor((WIDTH - t.length) / 2))) + t;
const leftRight = (l, r) => l + ' '.repeat(Math.max(1, WIDTH - l.length - r.length)) + r;
const fillIn = (t, d) => String(t || '').replace(/\{(\w+)\}/g, (m, k) => ({ shop: SHOP.name, phone: SHOP.phone, lipa: SHOP.lipa, address: RT.address, tin: RT.tin, number: d.number, date: rdate(d.day), cashier: d.by, customer: d.cust || 'Walk-in customer', balance: d.balText })[k] ?? m);

/* what a receipt is made of: one structure from a sale or a payment, drawn three ways (print, PDF, text) */
function recData() {
  const src = S.recSrc;
  let d;
  if (src && src.kind === 'payment') {
    const p = PAYMENTS.find(x => x.id === src.id) || PAYMENTS[0], c = cust(p.c);
    d = { kind: 'payment', number: p.id, day: p.day, time: p.time, by: p.by, cust: c.walkin ? '' : c.name, method: p.method, total: p.amt, paid: p.amt, balance: c.owes, copy: !!src.copy, cancelled: false,
      lines: p.sales.map(id => ({ name: 'Pays ' + id, total: p.amt / p.sales.length })) };
  } else {
    const s = (src && src.kind === 'sale' ? SALES.find(x => x.id === src.id) : null) || S.receipt || SALES[0], c = cust(s.c), total = saleTotal(s);
    const paid = s.pay === 'undone' ? 0 : s.paid != null ? s.paid : (s.pay === 'paid' ? total : 0);
    d = { kind: 'sale', number: s.id, day: s.day, time: s.time, by: s.by, cust: c.walkin ? '' : c.name, method: s.method, total, paid, balance: c.owes, copy: !!(src && src.copy), cancelled: s.pay === 'undone',
      lines: s.lines.map(l => ({ name: prod(l[0]).name, qty: l[1], unit: prod(l[0]).price, total: prod(l[0]).price * l[1] })) };
  }
  d.balText = d.balance > 0 ? money(d.balance) : d.balance < 0 ? money(-d.balance) + ' in credit' : 'TZS 0';
  d.file = 'Receipt-' + d.number + '.pdf';
  return d;
}

/* the 58 mm paper, 32 letters across: exactly what the printer is sent (D207) */
function printLines(d) {
  const B = RT.blocks, o = [], rule = { t: '-'.repeat(WIDTH) }, add = (t, b) => o.push({ t, b });
  if (d.cancelled) o.push({ banner: 'CANCELLED' });
  if (B.logo && RT.logo) o.push({ logo: true });
  if (B.shop) wrapText(SHOP.name.toUpperCase()).forEach(t => add(centre(t), true));
  if (B.contact) { wrapText(RT.address).forEach(t => add(centre(t))); add(centre(SHOP.phone)); if (RT.tin) add(centre('TIN ' + RT.tin)); }
  if (B.header && RT.header) wrapText(fillIn(RT.header, d)).forEach(t => add(centre(t)));
  o.push(rule);
  if (B.meta) { add((d.kind === 'payment' ? 'Payment ' : 'Receipt ') + d.number, true); add(rdate(d.day) + '  ' + d.time); add('Served by ' + d.by); if (d.cust) wrapText('Customer ' + d.cust).forEach(t => add(t)); o.push(rule); }
  if (d.copy) { o.push({ banner: 'COPY' }); add(centre('Printed again 18 Oct 2026 11:05')); o.push(rule); }
  add(leftRight('ITEM', 'TZS'), true);
  d.lines.forEach(l => { if (l.qty) { wrapText(l.name).forEach(t => add(t)); add(leftRight('  ' + l.qty + ' x ' + num(l.unit), num(l.total))); } else add(leftRight(l.name, num(l.total))); });
  o.push(rule);
  add(leftRight(d.kind === 'payment' ? 'RECEIVED' : 'TOTAL', num(d.total)), true);
  if (B.payment && !d.cancelled) {
    if (d.kind === 'payment') add(leftRight('Paid by ' + d.method, num(d.paid)));
    else if (d.paid >= d.total) add(leftRight('Paid (' + d.method + ')', num(d.paid)));
    else { if (d.paid > 0) add(leftRight('Paid', num(d.paid))); add(leftRight('On credit', num(d.total - d.paid)), true); }
    if (d.cust && d.balance !== 0) add(leftRight('Balance owed', num(d.balance)));
  }
  if (B.how && d.balance > 0 && !d.cancelled) { o.push(rule); add(centre('Pay by Lipa Namba')); add(centre(SHOP.lipa.split(' ')[0])); }
  if (B.footer && RT.footer) { o.push(rule); wrapText(fillIn(RT.footer, d)).forEach(t => add(centre(t))); }
  return o;
}

/* the paper, for the receipt screen and the settings preview: 'print' is the thermal roll, 'pdf' is the A6 page */
const Paper = { props: { d: Object, mode: { type: String, default: 'print' } },
  setup(p) { const lines = computed(() => printLines(p.d)); const B = RT.blocks;
    return { lines, RT, B, LOGO, SHOP, rdate, num, money, fillIn }; },
  template: `<div class="mx-auto" :class="mode === 'print' ? 'w-[264px]' : 'w-[300px]'">
    <div v-if="mode === 'print'" class="paper px-[18px] pb-3 pt-5 font-mono text-[12px] leading-[16px]" aria-label="Receipt on the printer's paper">
      <template v-for="(l, i) in lines" :key="i">
        <img v-if="l.logo" :src="LOGO.bw" alt="Shop logo as the printer prints it" class="mx-auto mb-1 block w-full" style="image-rendering: pixelated">
        <div v-else-if="l.banner" class="my-1 bg-neutral-900 py-0.5 text-center font-bold tracking-[.3em] text-white">{{ l.banner }}</div>
        <div v-else :class="['whitespace-pre', l.b ? 'font-bold' : '']">{{ l.t || ' ' }}</div></template></div>
    <div v-else class="paper px-6 pb-6 pt-6 font-sans text-[12px] leading-[17px]" aria-label="Receipt as a PDF">
      <div v-if="d.cancelled" class="mb-3 rounded border-2 border-red-600 py-1 text-center text-sm font-bold tracking-widest text-red-600">CANCELLED</div>
      <div class="text-center"><img v-if="B.logo && RT.logo" :src="LOGO.color" alt="Shop logo" class="mx-auto mb-2 h-12 w-auto">
        <p v-if="B.shop" class="text-base font-bold">{{ SHOP.name }}</p>
        <template v-if="B.contact"><p class="text-neutral-600">{{ RT.address }}</p><p class="text-neutral-600">{{ SHOP.phone }}<template v-if="RT.tin"> · TIN {{ RT.tin }}</template></p></template>
        <p v-if="B.header && RT.header" class="mt-1 italic text-neutral-600">{{ fillIn(RT.header, d) }}</p></div>
      <div v-if="B.meta" class="mt-4 grid grid-cols-2 gap-x-3 gap-y-0.5 border-y border-neutral-200 py-2"><span class="text-neutral-500">{{ d.kind === 'payment' ? 'Payment' : 'Receipt' }}</span><span class="text-right font-semibold">{{ d.number }}</span><span class="text-neutral-500">Date</span><span class="text-right">{{ rdate(d.day) }} {{ d.time }}</span><span class="text-neutral-500">Served by</span><span class="text-right">{{ d.by }}</span><template v-if="d.cust"><span class="text-neutral-500">Customer</span><span class="text-right">{{ d.cust }}</span></template></div>
      <div v-if="d.copy" class="mt-3 rounded border border-neutral-400 py-0.5 text-center text-[11px] font-bold tracking-widest text-neutral-600">COPY · printed again 18 Oct 2026 11:05</div>
      <table class="mt-3 w-full text-[12px]"><thead><tr class="border-b border-neutral-200 text-left text-[11px] uppercase tracking-wide text-neutral-500"><th class="pb-1 font-medium">Item</th><th class="pb-1 text-right font-medium">TZS</th></tr></thead>
        <tbody><tr v-for="(l, i) in d.lines" :key="i" class="align-top"><td class="py-1">{{ l.name }}<span v-if="l.qty" class="block text-[11px] text-neutral-500">{{ l.qty }} × {{ num(l.unit) }}</span></td><td class="py-1 text-right tabular-nums">{{ num(l.total) }}</td></tr></tbody></table>
      <div class="mt-2 flex items-baseline justify-between border-t border-neutral-900 pt-2 text-sm font-bold"><span>{{ d.kind === 'payment' ? 'Received' : 'Total' }}</span><span class="tabular-nums">{{ money(d.total) }}</span></div>
      <template v-if="B.payment"><div v-if="d.paid >= d.total" class="mt-1 flex justify-between text-neutral-600"><span>Paid ({{ d.method }})</span><span class="tabular-nums">{{ num(d.paid) }}</span></div>
        <div v-else class="mt-1 flex justify-between font-semibold"><span>On credit</span><span class="tabular-nums">{{ num(d.total - d.paid) }}</span></div>
        <div v-if="d.cust && d.balance !== 0" class="flex justify-between text-neutral-600"><span>Balance owed</span><span class="tabular-nums">{{ num(d.balance) }}</span></div></template>
      <p v-if="B.how && d.balance > 0" class="mt-3 text-center text-neutral-600">Pay by Lipa Namba {{ SHOP.lipa }}</p>
      <p v-if="B.footer && RT.footer" class="mt-4 text-center font-medium">{{ fillIn(RT.footer, d) }}</p></div>
    <div class="tear"></div></div>` };

/* ---- the sale is done (or a receipt asked for again): print it, share it, or start the next one */
const Receipt = { components: { Header, Icon, Btn, Pill, FooterBar, Paper },
  setup() {
    const d = computed(() => recData());
    const fresh = computed(() => !d.value.copy);
    const reason = computed(() => ({ off: S.printer + ' is off. Switch it on, then try again.', bt: 'Bluetooth is off on this phone. Turn it on, then try again.', none: 'No printer is chosen on this phone yet.' })[S.printFail]);
    const run = () => { S.print = 'printing'; setTimeout(() => { S.print = S.printFail ? 'failed' : 'done'; }, 1100); };
    const text = computed(() => printLines(d.value).filter(l => l.t !== undefined).map(l => l.t.trim()).filter(Boolean).join('\n'));
    watch(() => S.route, () => { S.print = 'idle'; });
    const left = computed(() => d.value.total - d.value.paid);
    return { S, d, fresh, reason, run, back, tab, toast, money, left, text };
  },
  template: `<div class="flex min-h-0 flex-1 flex-col"><Header v-if="!fresh" :title="d.kind === 'payment' ? 'Payment receipt' : 'Receipt'" pushed hide-search/>
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6" :style="fresh ? { paddingTop: 'calc(24px + var(--sa-top))' } : { paddingTop: '16px' }">
      <div v-if="fresh" class="flex items-center gap-3"><span class="rise grid h-12 w-12 shrink-0 place-items-center rounded-full bg-success/15 text-success"><Icon name="Check" :size="26"/></span>
        <div class="min-w-0 flex-1"><h1 class="text-xl font-semibold">{{ d.kind === 'payment' ? 'Payment taken' : 'Sale done' }}</h1><p class="truncate text-sm text-muted-foreground">{{ d.number }} · {{ d.cust || 'Walk-in customer' }}</p></div>
        <div class="text-right"><p class="text-xl font-bold tracking-tight tnum">{{ money(d.total) }}</p><Pill :tone="d.kind === 'sale' && left > 0 ? 'warning' : 'success'">{{ d.kind === 'sale' && left > 0 ? money(left) + ' on credit' : 'Paid · ' + d.method }}</Pill></div></div>
      <p v-else class="text-sm text-muted-foreground">A copy of {{ d.number }}. It says COPY, so it cannot pass for the first.</p>
      <div v-if="S.print === 'failed'" class="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5" role="alert"><p class="flex items-center gap-2 text-sm font-semibold text-destructive"><Icon name="TriangleAlert" :size="16"/>It did not print</p><p class="mt-1 text-sm text-muted-foreground">{{ reason }} The sale is saved.</p>
        <div class="mt-3 grid grid-cols-2 gap-2"><Btn v-if="S.printFail === 'none'" size="md" @click="S.sheet = 'printer'">Choose a printer</Btn><Btn v-else size="md" @click="run">Try again</Btn><Btn v="outline" size="md" @click="S.sheet = 'share'">Share instead</Btn></div></div>
      <p v-if="S.print === 'done'" class="mt-4 flex items-center justify-center gap-2 rounded-xl bg-success/10 py-2.5 text-sm font-medium text-success" role="status"><Icon name="CircleCheck" :size="17"/>Printed on {{ S.printer }}</p>
      <div class="mt-4"><Paper :d="d" mode="print"/></div>
</div>
    <FooterBar><div class="grid grid-cols-2 gap-2"><Btn :disabled="S.print === 'printing'" @click="run"><Icon name="Printer" :size="17"/>{{ S.print === 'printing' ? 'Printing…' : 'Print' }}</Btn><Btn v="outline" @click="S.sheet = 'share'"><Icon name="Share2" :size="17"/>Share PDF</Btn></div>
      <div class="mt-2 grid gap-2" :class="fresh ? 'grid-cols-3' : 'grid-cols-2'"><Btn v="ghost" size="md" @click="toast('Receipt copied as text')"><Icon name="Copy" :size="15"/>Copy text</Btn><Btn v="ghost" size="md" @click="S.sheet = 'printer'"><Icon name="Printer" :size="15"/>Printer</Btn>
        <template v-if="fresh"><Btn v="ghost" size="md" @click="d.kind === 'payment' ? back() : S.route = 'till'">{{ d.kind === 'payment' ? 'Done' : 'New sale' }}</Btn></template></div></FooterBar></div>` };

/* a payment taken ends on its receipt as a sale does (D204) */
function newPayment(cid, amt, method, ids) {
  const n = 'P-00' + (91 + PAYMENTS.filter(p => p.fresh).length);
  const sales = ids.length ? ids : SALES.filter(s => s.c === cid && (s.pay === 'unpaid' || s.pay === 'part')).map(s => s.id).slice(0, 1);
  PAYMENTS.unshift({ id: n, c: cid, amt, acct: method === 'Cash' ? 'Cash drawer' : 'Lipa Namba', method, day: 'Today', time: '11:02', by: ME.value.name, sales: sales.length ? sales : ['S-1304'], fresh: true });
  S.recSrc = { kind: 'payment', id: n, copy: false }; S.print = 'idle'; S.stack.push(S.route); S.route = 'receipt';
}

/* ---- the owner's Receipt settings: what shows, the logo, the words, and the paper as it will be */
const ReceiptSettings = { components: { Header, Icon, Btn, Toggle, Seg, Sheet, FooterBar, Empty, Paper },
  setup() {
    const sample = computed(() => { const s = SALES.find(x => x.id === 'S-1288'); const c = cust(s.c), total = saleTotal(s);
      return { kind: 'sale', number: s.id, day: s.day, time: s.time, by: s.by, cust: c.name, method: s.method, total, paid: s.paid, balance: c.owes, balText: money(c.owes), copy: false, cancelled: false, file: 'Receipt-' + s.id + '.pdf',
        lines: s.lines.map(l => ({ name: prod(l[0]).name, qty: l[1], unit: prod(l[0]).price, total: prod(l[0]).price * l[1] })) }; });
    const mode = ref('print'), focus = ref('footer'), owner = computed(() => S.role === 'owner');
    const insert = (f) => { const k = focus.value === 'header' ? 'header' : 'footer'; RT[k] = ((RT[k] || '') + (RT[k] ? ' ' : '') + f).slice(0, k === 'header' ? 48 : 96); };
    const setLogo = (on) => { RT.logo = on; toast(on ? 'Logo saved. The printer copy is made.' : 'Logo removed'); };
    const input = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';
    return { S, RT, RBLOCKS, FILLINS, LOGO, d: sample, mode, focus, owner, insert, setLogo, input, toast, back };
  },
  template: `<div class="relative flex min-h-0 flex-1 flex-col"><Header title="Receipt" :pushed="S.stack.length > 0" hide-search/>
    <div v-if="!owner" class="scroll min-h-0 flex-1 overflow-y-auto"><Empty icon="Lock" title="Only Amina can change the receipt" text="You can print and share a receipt from any sale."/></div>
    <template v-else><div class="scroll min-h-0 flex-1 overflow-y-auto"><div class="space-y-4 p-3 pb-8">
      <section class="rounded-xl border bg-card p-3.5"><div class="flex items-center justify-between"><div class="min-w-0"><h2 class="text-sm font-semibold">Preview</h2><p class="text-xs text-muted-foreground">With sale {{ d.number }}</p></div>
          <button type="button" class="press inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-sm font-medium shadow-sm" @click="S.sheet = 'rpreview'"><Icon name="Maximize2" :size="14"/>Full size</button></div>
        <div class="relative mt-3 max-h-[236px] overflow-hidden rounded-lg bg-muted/60 p-3"><div class="origin-top scale-[.86]"><Paper :d="d" mode="print"/></div><div class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-muted/90 to-transparent"></div></div></section>
      <section class="rounded-xl border bg-card p-3.5"><h2 class="text-sm font-semibold">Logo</h2>
        <div v-if="RT.logo"><div class="mt-3 grid grid-cols-2 gap-2"><div><p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your logo</p><div class="grid h-[72px] place-items-center rounded-lg border bg-white p-1"><img :src="LOGO.color" alt="Your logo" class="max-h-full w-auto"></div></div>
          <div><p class="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Printed as</p><div class="grid h-[72px] place-items-center rounded-lg border bg-white p-1"><img :src="LOGO.bw" alt="The logo as the printer prints it" class="max-h-full w-auto" style="image-rendering: pixelated"></div></div></div>
          <p class="mt-2.5 flex gap-2 text-xs text-muted-foreground"><Icon name="Info" :size="14" class="mt-0.5"/>Printers print black and white only. Light colours disappear, and photos turn into smudges. A bold, simple logo prints best.</p>
          <div class="mt-3 grid grid-cols-2 gap-2"><Btn v="outline" size="md" @click="setLogo(true)"><Icon name="Upload" :size="15"/>Change logo</Btn><Btn v="destructive-outline" size="md" @click="setLogo(false)">Remove</Btn></div></div>
        <div v-else class="mt-2 flex items-center gap-3"><span class="grid h-12 w-12 place-items-center rounded-lg border border-dashed text-muted-foreground"><Icon name="Image" :size="22"/></span><p class="min-w-0 flex-1 text-xs text-muted-foreground">No logo. The receipt starts with the shop's name. PNG or JPG, up to 2 MB.</p><Btn size="md" @click="setLogo(true)"><Icon name="Upload" :size="15"/>Add</Btn></div></section>
      <section class="rounded-xl border bg-card p-3.5"><h2 class="text-sm font-semibold">What shows</h2><p class="text-xs text-muted-foreground">The order is fixed. Items and the total always show.</p>
        <ul class="mt-1 divide-y"><li v-for="b in RBLOCKS" :key="b[0]" class="flex items-center gap-3 py-2.5"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted"><Icon :name="b[2]" :size="16"/></span><span class="min-w-0 flex-1 text-sm">{{ b[1] }}</span>
          <span v-if="b[3]" class="text-xs text-muted-foreground">Always</span><Toggle v-else-if="b[0] === 'logo'" :model-value="RT.blocks.logo && RT.logo" :label="b[1]" :locked="!RT.logo" @update:model-value="RT.blocks.logo = $event"/><Toggle v-else v-model="RT.blocks[b[0]]" :label="b[1]"/></li></ul></section>
      <section class="rounded-xl border bg-card p-3.5"><h2 class="text-sm font-semibold">Your words</h2>
        <div class="mt-3 space-y-3"><label class="block text-sm font-medium">Address<input v-model="RT.address" :class="input" maxlength="64" @focus="focus = 'address'"></label>
          <label class="block text-sm font-medium">TIN <span class="font-normal text-muted-foreground">(optional)</span><input v-model="RT.tin" :class="input" maxlength="20" inputmode="numeric" @focus="focus = 'tin'"></label>
          <label class="block text-sm font-medium"><span class="flex justify-between">Header line<span class="font-normal text-muted-foreground tnum">{{ RT.header.length }}/48</span></span><input v-model="RT.header" :class="input" maxlength="48" @focus="focus = 'header'"></label>
          <label class="block text-sm font-medium"><span class="flex justify-between">Footer line<span class="font-normal text-muted-foreground tnum">{{ RT.footer.length }}/96</span></span><input v-model="RT.footer" :class="input" maxlength="96" @focus="focus = 'footer'"></label></div>
        <p class="mb-1.5 mt-3 text-xs text-muted-foreground">Tap to add to the header or the footer. They fill in by themselves.</p>
        <div class="flex flex-wrap gap-1.5"><button v-for="f in FILLINS" :key="f" type="button" class="press h-8 rounded-md border bg-background px-2.5 font-mono text-xs shadow-sm" @click="insert(f)">{{ f }}</button></div>
        <p class="mt-3 flex gap-2 text-xs text-muted-foreground"><Icon name="Info" :size="14" class="mt-0.5"/>This is a sales receipt, not a tax (TRA) receipt. The TIN is only printed.</p></section></div></div>
      <FooterBar><Btn full @click="toast('Receipt saved')">Save receipt</Btn></FooterBar>
      <Sheet :open="S.sheet === 'rpreview'" title="Preview" :sub="'With sale ' + d.number" tall @close="S.sheet = null"><div class="px-4 pb-6"><Seg v-model="mode" :tabs="[{ id: 'print', label: 'Printer, 58 mm' }, { id: 'pdf', label: 'PDF' }]"/><div class="mt-4"><Paper :d="d" :mode="mode"/></div></div></Sheet></template></div>` };
