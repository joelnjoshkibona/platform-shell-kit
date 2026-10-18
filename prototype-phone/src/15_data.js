/* ============================================================ the rest of the shop's data (payments, stock, suppliers, money) */
const ACCOUNTS = [
  { id: 'a1', name: 'Cash drawer', kind: 'Cash', icon: 'Banknote', c: 'var(--c1)', bal: 41500, rec: '9 Oct', gap: -500 },
  { id: 'a2', name: 'Lipa Namba', kind: 'Mobile money', icon: 'Smartphone', c: 'var(--c3)', bal: 128000, rec: '9 Oct', gap: 0 },
  { id: 'a3', name: 'M-Pesa wallet', kind: 'Mobile money', icon: 'Wallet', c: 'var(--c5)', bal: 36200, rec: '5 Oct', gap: 0 },
  { id: 'a4', name: 'CRDB bank', kind: 'Bank', icon: 'Landmark', c: 'var(--c2)', bal: 250000, rec: '1 Oct', gap: 0 }
];
const acct = (n) => ACCOUNTS.find(a => a.name === n) || ACCOUNTS[0];

const PAYMENTS = [
  { id: 'P-0090', c: 'c1', amt: 3000, acct: 'Cash drawer', method: 'Cash', day: 'Today', time: '10:48', by: 'Rehema', sales: ['S-1227'] },
  { id: 'P-0089', c: 'c2', amt: 5000, acct: 'Lipa Namba', method: 'M-Pesa', day: 'Today', time: '09:40', by: 'Rehema', sales: ['S-1250', 'S-1262'] },
  { id: 'P-0088', c: 'c23', amt: 6000, acct: 'Cash drawer', method: 'Cash', day: 'Yesterday', time: '16:12', by: 'Amina', sales: ['S-1244'] },
  { id: 'P-0087', c: 'c4', amt: 6000, acct: 'Cash drawer', method: 'Cash', day: 'Yesterday', time: '12:31', by: 'Rehema', sales: ['S-1241'], note: 'Typed 6,000, customer paid 5,000', changeAsked: true },
  { id: 'P-0086', c: 'c3', amt: 2000, acct: 'Lipa Namba', method: 'Airtel Money', day: 'Yesterday', time: '09:02', by: 'Rehema', sales: ['S-1236'] },
  { id: 'P-0052', c: 'c1', amt: 3000, acct: 'Cash drawer', method: 'Cash', day: '19 Sept', time: '17:22', by: 'Amina', sales: ['S-1054'] }
];

const BATCHES = [
  { id: 'B-0007', pid: 'p1', del: 'DEL-0007', date: '28 Sept', qty: 60, left: 31, cost: 620 },
  { id: 'B-0008', pid: 'p1', del: 'DEL-0009', date: '8 Oct', qty: 60, left: 60, cost: 640 },
  { id: 'B-0003', pid: 'p2', del: 'DEL-0003', date: '2 Sept', qty: 28, left: 4, cost: 150 },
  { id: 'B-0009', pid: 'p3', del: 'DEL-0009', date: '8 Oct', qty: 48, left: 48, cost: 480 },
  { id: 'B-0006', pid: 'p4', del: 'DEL-0006', date: '24 Sept', qty: 40, left: 30, cost: 350 }
];
const MTYPE = {
  receive: { label: 'Received', icon: 'PackagePlus', tone: 'success' }, sale: { label: 'Sale', icon: 'ShoppingCart', tone: 'muted' },
  undo: { label: 'Sale undone', icon: 'Undo2', tone: 'primary' }, count: { label: 'Count gap', icon: 'ClipboardCheck', tone: 'warning' },
  adjust: { label: 'Adjustment', icon: 'SlidersHorizontal', tone: 'warning' }, return: { label: 'Returned', icon: 'PackageMinus', tone: 'destructive' }
};
const MOVES = [
  { id: 1, t: 'sale', pid: 'p1', q: -1, ref: 'S-1304', day: 'Today', time: '10:37' }, { id: 2, t: 'sale', pid: 'p2', q: -2, ref: 'S-1303', day: 'Today', time: '10:25' },
  { id: 3, t: 'sale', pid: 'p2', q: -2, ref: 'S-1302', day: 'Today', time: '10:11' }, { id: 4, t: 'sale', pid: 'p1', q: -1, ref: 'S-1301', day: 'Today', time: '09:58' },
  { id: 5, t: 'undo', pid: 'p1', q: 1, ref: 'S-1262', day: 'Yesterday', time: '20:40' }, { id: 6, t: 'receive', pid: 'p3', q: 48, ref: 'DEL-0009', day: '8 Oct', time: '14:10' },
  { id: 7, t: 'receive', pid: 'p1', q: 60, ref: 'DEL-0009', day: '8 Oct', time: '14:10' }, { id: 8, t: 'return', pid: 'p2', q: -2, ref: 'RET-0001', day: '9 Oct', time: '12:10' },
  { id: 9, t: 'adjust', pid: 'p1', q: -1, ref: 'ADJ-0001', day: '9 Oct', time: '08:05' }
];

const SUPPLIERS = [
  { id: 's1', name: 'Kariakoo wholesaler', ini: 'KW', c: 'var(--c2)', phone: '+255 713 220 540', owes: 4420, bought: 31800, credit: 0, due: '7 Oct', late: 3 },
  { id: 's2', name: 'Pwani water depot', ini: 'PW', c: 'var(--c3)', phone: '+255 765 110 884', owes: 0, bought: 18400, credit: 2000, due: '', late: 0 },
  { id: 's3', name: 'Mama Neema foods', ini: 'MN', c: 'var(--c1)', phone: '+255 754 330 912', owes: 1500, bought: 7000, credit: 0, due: '20 Oct', late: 0 }
];
const sup = (id) => SUPPLIERS.find(s => s.id === id);
const DELIVERIES = [
  { id: 'DEL-0010', s: 's2', date: '12 Oct', lines: [['p1', 60]], total: 38400, paid: 0, status: 'waiting', due: '26 Oct' },
  { id: 'DEL-0009', s: 's1', date: '8 Oct', lines: [['p1', 60], ['p3', 48]], total: 61440, paid: 57020, status: 'overdue', due: '7 Oct' },
  { id: 'DEL-0008', s: 's3', date: '6 Oct', lines: [['p4', 40]], total: 14000, paid: 12500, status: 'part', due: '20 Oct' },
  { id: 'DEL-0006', s: 's3', date: '24 Sept', lines: [['p4', 40]], total: 14000, paid: 14000, status: 'paid', due: '8 Oct' },
  { id: 'DEL-0003', s: 's1', date: '2 Sept', lines: [['p2', 28]], total: 4200, paid: 4200, status: 'paid', due: '16 Sept' }
];
const DSTAT = { paid: ['Paid', 'success'], part: ['Part paid', 'warning'], unpaid: ['Unpaid', 'destructive'], overdue: ['Overdue', 'destructive'], waiting: ['Waiting to check', 'primary'], rejected: ['Rejected', 'muted'] };

const EXP_CATS = [['Transport', 'Truck'], ['Bank and mobile charges', 'Landmark'], ['Rent and utilities', 'House'], ['Wages', 'Users'], ['Other', 'Coins']];
const EXPENSES = [
  { id: 'EXP-0036', cat: 'Other', note: 'Night guard tip', amt: 2000, acct: 'Cash drawer', day: 'Today', by: 'Rehema', st: 'waiting' },
  { id: 'EXP-0035', cat: 'Transport', note: 'Water crates from the depot', amt: 5000, acct: 'Cash drawer', day: 'Today', by: 'Rehema', st: 'waiting' },
  { id: 'EXP-0034', cat: 'Bank and mobile charges', note: 'Charges on TRF-0053, Airtel Money', amt: 115, acct: 'Lipa Namba', day: 'Yesterday', by: 'Amina', st: 'ok' },
  { id: 'EXP-0033', cat: 'Rent and utilities', note: 'Shop electricity, October', amt: 28000, acct: 'CRDB bank', day: '9 Oct', by: 'Amina', st: 'ok' }
];
const COUNTS = [
  { id: 'CNT-0009', day: '9 Oct 2026', by: 'Rehema', gaps: 'Drawer 500 short · 1 Trident pack missing', st: 'waiting' },
  { id: 'CNT-0008', day: '8 Oct 2026', by: 'Rehema', gaps: 'No gaps', st: 'ok' },
  { id: 'CNT-0007', day: '7 Oct 2026', by: 'Amina', gaps: 'Water 1 short (approved)', st: 'ok' }
];
const USERS = [
  { id: 'u1', name: 'Amina Mushi', email: 'amina@devbiz.app', role: 'Owner', ini: 'AM', c: 'var(--c3)', seen: 'Active now', st: 'ok' },
  { id: 'u2', name: 'Rehema Kileo', email: 'rehema@devbiz.app', role: 'Cashier', ini: 'RK', c: 'var(--c1)', seen: 'Active 10 min ago', st: 'ok' },
  { id: 'u3', name: 'Joyce Mrema', email: 'joyce@example.com', role: 'Cashier', ini: 'JM', c: 'var(--c4)', seen: 'Invited 2 days ago', st: 'invited' }
];
Object.assign(S, { recSrc: null, print: 'idle', printFail: null, printer: 'RPP02N', net: 'online', update: null, tabP: 'overview', pid: 'p1', prodQ: '', prodTab: 'overview', moveType: 'all', delId: 'DEL-0009', delTab: 'all', supId: 's1', supTab: 'overview', payId: 'P-0090',
  countStep: 0, counted: { p1: 91, p2: 4, p3: 48, p4: 30, p5: 0, p6: 120 }, cashCounted: 41000, countNote: '', countPane: 'count', expCat: 'all', accId: 'a1', accTab: 'history', expOpen: null,
  rec: { sup: 's1', lines: [{ pid: 'p1', packs: 5 }], paidNow: false, due: '26 Oct' }, newExp: { amt: 0, cat: 'Transport', acct: 'Cash drawer', note: '' }, quiet: true, ch: { low: [1, 0], undo: [1, 0], gaps: [1, 1], late: [1, 1], cust: [0, 0] }, tmpl: 'Hello {name}, you owe {amount} at Office Shop. Please pay when you can. Asante!' });
const money0 = (n) => (n < 0 ? '−' : '') + 'TZS ' + Math.abs(Math.round(n)).toLocaleString('en-US');
const prodMoves = (pid) => MOVES.filter(m => m.pid === pid);
const onHand = (p) => p.stock;
