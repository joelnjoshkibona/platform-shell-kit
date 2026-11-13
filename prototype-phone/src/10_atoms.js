const { createApp, reactive, ref, computed, h, watch, onMounted, onBeforeUnmount, nextTick } = Vue;

/* ============================================================ atoms and the shop's data */
const Icon = { name: 'Icon', props: { name: String, size: { type: [Number, String], default: 18 } },
  setup(p) { return () => { const n = window.lucide && window.lucide.icons && window.lucide.icons[p.name]; const kids = n ? (n[0] === 'svg' ? n[2] : n) : [];
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: p.size, height: p.size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', class: 'shrink-0' }, kids.map(([t, a]) => h(t, a))); }; } };

const money = (n) => 'TZS ' + Math.round(n).toLocaleString('en-US');
const num = (n) => Math.round(n).toLocaleString('en-US');
const tint = (c, a) => ({ background: 'color-mix(in srgb, ' + c + ' ' + (a || 15) + '%, transparent)' });

/* ---- the shop (Office Shop): two people, two real products and a few more so lists have a shape */
const PRODUCTS = [
  { id: 'p1', name: 'Water', ini: 'WA', c: 'var(--c3)', price: 1000, step: 1, unit: 'bottle', units: 'bottles', stock: 91, reorder: 12, pack: 'Pack of 6' },
  { id: 'p2', name: 'Trident', ini: 'TR', c: 'var(--c5)', price: 250, step: 2, unit: 'piece', units: 'pieces', stock: 4, reorder: 20, pack: 'Box of 14' },
  { id: 'p3', name: 'Soda 500 ml', ini: 'SO', c: 'var(--c4)', price: 700, step: 1, unit: 'bottle', units: 'bottles', stock: 48, reorder: 12, pack: 'Crate of 24' },
  { id: 'p4', name: 'Biscuits', ini: 'BI', c: 'var(--c2)', price: 500, step: 1, unit: 'pack', units: 'packs', stock: 30, reorder: 10, pack: 'Carton of 20' },
  { id: 'p5', name: 'Sugar 1 kg', ini: 'SU', c: 'var(--c1)', price: 3200, step: 1, unit: 'bag', units: 'bags', stock: 0, reorder: 6, pack: 'Sack of 20' },
  { id: 'p6', name: 'Matches', ini: 'MA', c: 'var(--c-other)', price: 200, step: 1, unit: 'box', units: 'boxes', stock: 120, reorder: 30, pack: 'Dozen' }
];
const prod = (id) => PRODUCTS.find(p => p.id === id);
const perText = (p) => 'TZS ' + num(p.price * p.step) + (p.step > 1 ? ' per ' + p.step : '');
const level = (p) => p.stock <= 0 ? 'out' : p.stock <= p.reorder ? 'low' : 'ok';
const stockText = (p) => p.stock <= 0 ? 'Out of stock' : p.stock + ' ' + (p.stock === 1 ? p.unit : p.units) + ' left';

const CUSTOMERS = [
  { id: 'c0', no: 'C-0000', name: 'Walk-in customer', ini: '', c: 'var(--c-other)', phone: '', owes: 0, days: 0, limit: 0, bought: 0, walkin: true },
  { id: 'c1', no: 'C-0001', name: 'Neema Kimaro', ini: 'NK', c: 'var(--c1)', phone: '+255 754 112 908', owes: 2000, days: 13, limit: 10000, bought: 6000, paid: 4000, since: '30 Aug 2026', last: '19 Sept 2026' },
  { id: 'c2', no: 'C-0002', name: 'Baraka Mushi', ini: 'BM', c: 'var(--c2)', phone: '+255 713 440 218', owes: 0, days: 0, limit: 20000, bought: 18500, paid: 18500, since: '2 Sept 2026', last: '8 Oct 2026' },
  { id: 'c3', no: 'C-0003', name: 'Joseph Kweka', ini: 'JK', c: 'var(--c3)', phone: '', owes: 4500, days: 21, limit: 5000, bought: 9000, paid: 4500, since: '4 Sept 2026', last: '2 Oct 2026' },
  { id: 'c9', no: 'C-0009', name: 'Peter Ngowi', ini: 'PN', c: 'var(--c4)', phone: '', owes: 8000, days: 42, limit: 8000, bought: 15000, paid: 7000, since: '1 Sept 2026', last: '28 Aug 2026' },
  { id: 'c5', no: 'C-0005', name: 'Pendo Lyimo', ini: 'PL', c: 'var(--c5)', phone: '+255 689 001 244', owes: -5000, days: 0, limit: 0, bought: 3000, paid: 8000, since: '9 Sept 2026', last: '5 Oct 2026' },
  { id: 'c23', no: 'C-0023', name: 'Mary Tarimo', ini: 'MT', c: 'var(--c1)', phone: '+255 754 990 041', owes: 8000, days: 17, limit: 10000, bought: 22000, paid: 14000, since: '12 Sept 2026', last: '6 Oct 2026' },
  { id: 'c21', no: 'C-0021', name: 'Brian Urassa', ini: 'BU', c: 'var(--c2)', phone: '', owes: 5000, days: 11, limit: 6000, bought: 11000, paid: 6000, since: '14 Sept 2026', last: '1 Oct 2026' },
  { id: 'c4', no: 'C-0004', name: 'Hellen Massawe', ini: 'HM', c: 'var(--c3)', phone: '+255 765 230 117', owes: 0, days: 0, limit: 10000, bought: 7500, paid: 7500, since: '6 Sept 2026', last: '9 Oct 2026' }
];
const cust = (id) => CUSTOMERS.find(c => c.id === id);

const SALES = [
  { id: 'S-1304', c: 'c23', day: 'Today', time: '10:37', lines: [['p1', 1]], pay: 'unpaid', method: 'Credit', by: 'Rehema' },
  { id: 'S-1303', c: 'c0', day: 'Today', time: '10:25', lines: [['p2', 2]], pay: 'paid', method: 'Cash', by: 'Rehema' },
  { id: 'S-1302', c: 'c3', day: 'Today', time: '10:11', lines: [['p2', 2]], pay: 'paid', method: 'M-Pesa', by: 'Rehema' },
  { id: 'S-1301', c: 'c21', day: 'Today', time: '09:58', lines: [['p1', 1]], pay: 'unpaid', method: 'Credit', by: 'Rehema' },
  { id: 'S-1299', c: 'c1', day: 'Today', time: '09:23', lines: [['p1', 1]], pay: 'unpaid', method: 'Credit', by: 'Rehema' },
  { id: 'S-1296', c: 'c0', day: 'Today', time: '08:41', lines: [['p3', 1]], pay: 'undone', method: 'Cash', by: 'Rehema', undone: true },
  { id: 'S-1297', c: 'c0', day: 'Today', time: '08:54', lines: [['p1', 1], ['p4', 1]], pay: 'paid', method: 'Cash', by: 'Rehema', undo: true },
  { id: 'S-1290', c: 'c9', day: 'Yesterday', time: '11:09', lines: [['p1', 1]], pay: 'unpaid', method: 'Credit', by: 'Rehema', undoAsked: true },
  { id: 'S-1288', c: 'c23', day: 'Yesterday', time: '10:04', lines: [['p1', 1], ['p3', 2]], pay: 'part', method: 'Credit', by: 'Amina', paid: 1000 },
  { id: 'S-1287', c: 'c2', day: 'Yesterday', time: '08:14', lines: [['p2', 4]], pay: 'paid', method: 'Cash', by: 'Amina' }
];
const saleTotal = (s) => s.lines.reduce((t, l) => t + prod(l[0]).price * l[1], 0);
const saleLine = (l) => (prod(l[0]).name + ' × ' + l[1]);

const NOTIFS = [
  { id: 1, unread: true, icon: 'Undo2', tone: 'warning', title: 'Rehema asks to undo S-1290', body: 'Wrong customer: was Baraka, not Steve. Stock and balances change only after you approve.', when: '10 min ago', open: 'S-1290', chan: ['In app', 'SMS sent'] },
  { id: 2, unread: true, icon: 'PackageMinus', tone: 'warning', title: 'Trident is low', body: '4 pieces left, you want 20. Receive a delivery or change the warning level.', when: '1 h ago', open: 'Product', chan: ['In app'] },
  { id: 3, unread: true, icon: 'ClipboardCheck', tone: 'warning', title: 'Count for 9 Oct has gaps', body: 'Drawer 500 short, one Trident pack missing. Rehema is waiting for you to approve it.', when: 'Yesterday', open: 'Count', chan: ['In app', 'SMS held (quiet hours)'] },
  { id: 4, unread: false, icon: 'Wallet', tone: 'success', title: 'Payment P-0052 received', body: 'TZS 3,000 from Neema Kimaro, paid into the cash drawer.', when: '19 Sept', open: 'P-0052', chan: ['In app'] },
  { id: 5, unread: false, icon: 'Truck', tone: 'muted', title: 'Delivery DEL-0008 is 3 days late', body: 'Kariakoo wholesaler: TZS 4,420 was due 7 Oct 2026.', when: '10 Oct', open: 'DEL-0008', chan: ['In app', 'Email sent'] }
];
const WAITING = [
  { id: 'w1', icon: 'Undo2', title: 'Undo S-1290 · Peter Ngowi', sub: 'Rehema: "Wrong customer: was Baraka, not Steve"', kind: 'Undo a sale' },
  { id: 'w2', icon: 'Undo2', title: 'Undo S-1297 · Nancy Temu', sub: 'Rehema: "Customer changed their mind"', kind: 'Undo a sale' },
  { id: 'w3', icon: 'FilePen', title: 'Change P-0087 · Eliza Mollel', sub: 'Rehema: "Typed 6,000, customer paid 5,000"', kind: 'Change a payment' },
  { id: 'w4', icon: 'Receipt', title: 'EXP-0035 · Transport TZS 5,000', sub: 'Water crates from the depot · Cash drawer', kind: 'Expense' },
  { id: 'w5', icon: 'ClipboardCheck', title: 'Count for 9 Oct has gaps', sub: 'Drawer 500 short, one Trident pack missing', kind: 'Count gap' }
];

/* ---- the one store */
const S = reactive({
  dark: false, themeMode: 'light', role: 'owner', route: 'home', stack: [], drawer: false, sheet: null, dialog: null, toast: '', toastKey: 0,
  cart: [], customer: 'c0', pay: 'cash', part: false, account: 'Cash drawer', cartOpen: false, receipt: null, tillQ: '',
  salesTab: 'all', salesQ: '', salesFilter: { status: 'all', range: 'all', who: 'all' }, shown: 6, list: 'data',
  custQ: '', custTab: 'all', cid: 'c1', custPane: 'overview', saleId: 'S-1304',
  notifTab: 'unread', expanded: null, lock: true, lockAfter: '5 min', checking: false, upToDate: false, search: false, searchQ: '', recent: ['Water', 'Neema', 'S-1290'],
  waitingDone: []
});
const ME = computed(() => S.role === 'owner' ? { name: 'Amina', full: 'Amina Mushi', ini: 'AM', role: 'Owner', email: 'amina@bootbox.app' } : { name: 'Rehema', full: 'Rehema Kileo', ini: 'RK', role: 'Cashier', email: 'rehema@bootbox.app' });
const unread = computed(() => NOTIFS.filter(n => n.unread).length);
const waitingN = computed(() => WAITING.length - S.waitingDone.length);

let toastT;
function toast(msg) { S.toast = msg; S.toastKey++; clearTimeout(toastT); toastT = setTimeout(() => (S.toast = ''), 2400); }
const TABS = ['home', 'sales', 'customers', 'alerts'];
function tab(r) { S.stack = []; S.drawer = false; S.sheet = null; S.search = false; S.route = r; }
function go(r, arg) { S.drawer = false; S.sheet = null; S.search = false; S.stack.push(S.route); if (r === 'sale' && arg) S.saleId = arg; if (r === 'customer' && arg) { S.cid = arg; S.custPane = 'overview'; } S.route = r; }
function back() {
  if (S.dialog) { S.dialog = null; return; } if (S.sheet) { S.sheet = null; return; } if (S.drawer) { S.drawer = false; return; } if (S.search) { S.search = false; return; }
  if (S.cartOpen) { S.cartOpen = false; return; }
  S.route = S.stack.pop() || 'home';
}
