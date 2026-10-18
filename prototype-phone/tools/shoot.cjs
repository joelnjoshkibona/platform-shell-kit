const { chromium } = require('../../tools/prototype-shots/node_modules/playwright');
const OUT = process.argv[2] || __dirname + '/../screenshots'; const FILE = 'file:///mnt/d5708eaa-a593-474f-9a9e-1f8b1f35d20b/PROJECTS/PHP/DEV_BUSINESS_PROJECT/platform-shell-kit/prototype-phone/index.html';
const only = process.argv[3] ? process.argv[3].split(',') : null;
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 220)); }); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(FILE); await p.waitForTimeout(1500);
  const set = (fn, arg) => p.evaluate(fn, arg);
  const shot = async (n) => { await p.waitForTimeout(550); await p.locator('.app').screenshot({ path: OUT + '/' + n + '.png' }); };
  const reset = () => set(() => { S.stack = []; S.drawer = false; S.sheet = null; S.dialog = null; S.search = false; S.cartOpen = false; S.toast = ''; S.list = 'data'; });
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
    'home-dark': () => set(() => { S.role = 'owner'; S.route = 'home'; S.dark = true; }),
    'till-dark': () => set(() => { S.route = 'till'; S.dark = true; }),
    'sale-dark': () => set(() => { S.route = 'sale'; S.saleId = 'S-1304'; S.dark = true; })
  };
  for (const [n, fn] of Object.entries(steps)) { if (only && !only.includes(n)) continue; await reset(); await fn(); await shot(n); }
  console.log('errors:', JSON.stringify(errs)); await b.close();
})();
