const { chromium } = require('../../tools/prototype-shots/node_modules/playwright');
const OUT = process.argv[2] || __dirname + '/../screenshots'; const FILE = 'file://' + require('path').resolve(__dirname, '../index.html');
const only = process.argv[3] ? process.argv[3].split(',') : null;
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 220)); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(FILE); await p.waitForTimeout(1500);
  const set = (fn, arg) => p.evaluate(fn, arg);
  const shot = async (n) => { await p.waitForTimeout(550); await p.locator('.app').screenshot({ path: OUT + '/' + n + '.png' }); };
  const reset = () => set(() => { S.stack = []; S.drawer = false; S.sheet = null; S.dialog = null; S.search = false; S.cartOpen = false; S.toast = ''; S.list = 'data'; S.net = 'online'; S.update = null; S.dark = false; S.role = 'owner'; });
  const steps = {
    home: () => set(() => { S.route = 'home'; }),
    'home-drawer': () => set(() => { S.route = 'home'; S.drawer = true; }),
    'home-cashier': () => set(() => { S.role = 'cashier'; S.route = 'home'; }),
    waiting: () => set(() => { S.role = 'owner'; S.route = 'waiting'; }),
    till: () => set(() => { S.cart.splice(0); S.customer = 'c0'; S.pay = 'cash'; S.route = 'till'; addP(PRODUCTS[0]); addP(PRODUCTS[0]); addP(PRODUCTS[1]); }),
    'till-empty': () => set(() => { S.cart.splice(0); S.route = 'till'; }),
    'till-cart': () => set(() => { S.cart.splice(0); S.customer = 'c0'; S.route = 'till'; addP(PRODUCTS[0]); addP(PRODUCTS[1]); S.cartOpen = true; }),
    'till-credit': () => set(() => { S.cart.splice(0); S.customer = 'c1'; S.pay = 'credit'; S.part = true; S.partAmt = 1000; S.route = 'till'; for (let i = 0; i < 9; i++) addP(PRODUCTS[0]); S.cartOpen = true; }),
    'till-who': () => set(() => { S.route = 'till'; S.sheet = 'cust'; }),
    receipt: () => set(() => { S.receipt = SALES[2]; S.route = 'receipt'; }),
    sales: () => set(() => { S.route = 'sales'; }),
    'sales-filter': () => set(() => { S.route = 'sales'; S.sheet = 'filter'; }),
    'sales-loading': () => set(() => { S.route = 'sales'; S.list = 'loading'; }),
    sale: () => set(() => { S.route = 'sale'; S.saleId = 'S-1304'; }),
    'sale-pay': () => set(() => { S.route = 'sale'; S.saleId = 'S-1304'; S.sheet = 'takepay'; }),
    customers: () => set(() => { S.route = 'customers'; }),
    customer: () => set(() => { S.route = 'customer'; S.cid = 'c1'; S.custPane = 'overview'; }),
    'customer-call': () => set(() => { S.route = 'customer'; S.cid = 'c1'; S.sheet = 'call'; }),
    alerts: () => set(() => { S.route = 'alerts'; S.expanded = 1; }),
    profile: () => set(() => { S.route = 'profile'; }),
    design: () => set(() => { S.route = 'design'; }),
    payments: () => set(() => { S.route = 'payments'; }), payment: () => set(() => { S.route = 'payment'; S.payId = 'P-0090'; }), 'payment-asked': () => set(() => { S.route = 'payment'; S.payId = 'P-0087'; }),
    products: () => set(() => { S.route = 'products'; }), product: () => set(() => { S.route = 'product'; S.pid = 'p1'; S.prodTab = 'overview'; }), 'product-batches': () => set(() => { S.route = 'product'; S.pid = 'p1'; S.prodTab = 'batches'; }),
    movements: () => set(() => { S.route = 'movements'; }), deliveries: () => set(() => { S.route = 'deliveries'; }), delivery: () => set(() => { S.route = 'delivery'; S.delId = 'DEL-0009'; }), 'delivery-check': () => set(() => { S.route = 'delivery'; S.delId = 'DEL-0010'; S.sheet = 'check'; }),
    receive: () => set(() => { S.route = 'receive'; }), suppliers: () => set(() => { S.route = 'suppliers'; }), supplier: () => set(() => { S.route = 'supplier'; S.supId = 's1'; S.supTab = 'overview'; }),
    count: () => set(() => { S.route = 'count'; S.countStep = 0; S.countPane = 'count'; }), 'count-cash': () => set(() => { S.route = 'count'; S.countStep = 1; S.countPane = 'count'; }), 'count-send': () => set(() => { S.route = 'count'; S.countStep = 2; S.countPane = 'count'; S.counted.p2 = 3; }),
    expenses: () => set(() => { S.route = 'expenses'; }), 'expense-new': () => set(() => { S.route = 'expenses'; S.sheet = 'newexp'; }), accounts: () => set(() => { S.route = 'accounts'; }), account: () => set(() => { S.route = 'account'; S.accId = 'a1'; S.accTab = 'history'; }),
    alertsettings: () => set(() => { S.route = 'alertsettings'; }), users: () => set(() => { S.route = 'users'; }), settings: () => set(() => { S.route = 'settings'; }),
    login: () => set(() => { S.route = 'login'; }), twofa: () => set(() => { S.route = 'twofa'; }), lock: () => set(() => { S.route = 'lock'; }), ended: () => set(() => { S.route = 'ended'; }),
    offline: () => set(() => { S.route = 'home'; S.net = 'offline'; }), 'update-bar': () => set(() => { S.route = 'sales'; S.update = 'available'; }), 'update-required': () => set(() => { S.update = 'required'; }),
    'count-dark': () => set(() => { S.route = 'count'; S.countStep = 2; S.countPane = 'count'; S.counted.p2 = 3; S.dark = true; }), 'deliveries-dark': () => set(() => { S.route = 'deliveries'; S.dark = true; }), 'product-dark': () => set(() => { S.route = 'product'; S.pid = 'p2'; S.dark = true; }), 'accounts-dark': () => set(() => { S.route = 'accounts'; S.dark = true; }),
    'home-dark': () => set(() => { S.role = 'owner'; S.route = 'home'; S.dark = true; }),
    'till-dark': () => set(() => { S.route = 'till'; S.dark = true; }),
    'sale-dark': () => set(() => { S.route = 'sale'; S.saleId = 'S-1304'; S.dark = true; })
  };
  for (const [n, fn] of Object.entries(steps)) { if (only && !only.includes(n)) continue; await reset(); await fn(); await shot(n); }
  console.log('errors:', JSON.stringify(errs)); await b.close();
})();
