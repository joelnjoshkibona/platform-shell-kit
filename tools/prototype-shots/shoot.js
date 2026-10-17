/*
 * Screenshots of the design prototype — the visual source of truth.
 *
 *   npm install && npm run shots                 # every screen + key states into ../../docs/design/screenshots
 *   node shoot.js --out out --only forms,roles   # a subset, somewhere else
 *
 * The prototype loads Vue, lucide and the Tailwind play CDN from the internet. This script serves them
 * from node_modules and a locally compiled Tailwind file instead, so it works offline and is deterministic.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const OUT = path.resolve(__dirname, opt('out', '../../screenshots'));
const ONLY = (opt('only', '') || '').split(',').filter(Boolean);
const HTML = fs.readFileSync(path.resolve(__dirname, '../../prototype/index.html'), 'utf8');
// The prototype loads Geist from Google Fonts; serve the same files from @fontsource (the apps bundle these),
// so the screenshots render the same font on any machine, offline.
const FONT_DIRS = ['geist', 'geist-mono'].map(n => path.dirname(require.resolve(`@fontsource/${n}/package.json`)));
const FONTS_CSS = FONT_DIRS.flatMap(dir => ['400', '500', '600', '700'].map(w => path.join(dir, w + '.css')))
  .filter(f => fs.existsSync(f))
  .map(f => fs.readFileSync(f, 'utf8').replace(/url\(\.\/files\/([^)]+)\)/g, (m, file) => `url(http://fonts.local/${path.basename(path.dirname(f))}/${file})`))
  .join('\n');
const CSS = fs.readFileSync(path.resolve(__dirname, '.tw.css'), 'utf8');

const COMBOS = {
  'desktop-light': { viewport: { width: 1280, height: 900 }, colorScheme: 'light' },
  'desktop-dark': { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' },
  'phone-light': { viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  'phone-dark': { viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
};
const ALL = Object.keys(COMBOS);
const KEY = ['desktop-light', 'phone-dark'];

const row = (name) => `main [role=link]:visible:has-text("${name}")`;   // P40: ListRows rows are links at every width
const scen = async (p, label) => { await p.click('button:has-text("Prototype states")'); await p.waitForTimeout(300); await p.locator('[role=dialog] button:has-text("' + label + '")').first().click(); };
const tab = (p, label) => p.locator(`main [role=tab]:has-text("${label}")`).first().click();

/* Every screen in the prototype (ScreensPill). `full` = full-page capture. */
const SCREENS = [
  ['login', 'Sign in'], ['twofa', 'Two-step verification'], ['orgpick', 'Choose organisation'],
  ['dashboard', 'Dashboard', { full: true }], ['forms', 'Forms list', { full: true }], ['templates', 'Templates', { full: true }],
  ['members', 'Users', { full: true }], ['roles', 'Roles list', { full: true }], ['role', 'Role details (Editor)', { full: true }],
  ['locations', 'Locations list', { full: true }], ['location', 'Location details (Arusha)', { full: true }],
  ['approvals', 'Approvals inbox', { full: true }], ['request-types', 'Approval workflows', { full: true }],
  ['delegations', 'Delegations', { full: true }], ['media', 'Media library', { full: true }], ['workspace', 'Settings', { full: true }],
  ['menus', 'Menu management', { full: true }], ['design', 'Design system (tokens, components, rules)', { full: true }],
  ['builder', 'Form builder'], ['responses', 'Results and responses', { full: true }], ['respondent', 'Respondent (live form)'],
].map(([route, title, o = {}]) => ({ name: route, route, title, combos: ALL, ...o }));

/* Key interaction states. Selectors match the prototype markup. */
const STATES = [
  { name: 'forms--filters-dialog', route: 'forms', title: 'List filters (simple/advanced)', run: async p => { await p.click('main [data-testid=filter-trigger-btn]'); } },
  { name: 'dashboard--global-search', route: 'dashboard', title: 'Global search results', run: async (p, c) => { if (c.startsWith('phone')) { await p.click('header button[aria-label="Search everything"]'); } else { await p.click('header input'); } await p.keyboard.type('ar'); } },
  { name: 'roles--zone-manager-overview', route: 'roles', title: 'Role details overview', run: async p => { await p.locator(row('Zone manager')).first().click(); } },
  { name: 'role--save-bar', route: 'roles', title: 'Staged permission edits + save bar (D42)', run: async p => { await p.locator(row('Zone manager')).first().click(); await p.waitForTimeout(1100); await tab(p, 'Permissions'); await p.waitForTimeout(300); await p.locator('main li:has-text("Forms.delete") [role=checkbox]').first().click(); } },
  { name: 'role--leave-guard', route: 'roles', title: 'Leave without saving dialog', run: async p => { await p.locator(row('Zone manager')).first().click(); await p.waitForTimeout(1100); await tab(p, 'Permissions'); await p.waitForTimeout(300); await p.locator('main li:has-text("Forms.delete") [role=checkbox]').first().click(); await p.locator('nav[aria-label=Breadcrumb] button').first().click(); } },
  { name: 'workspace--custom-accent', route: 'workspace', title: 'Brand colour: a custom colour, adjusted for readability, with the light and dark preview (P42)', combos: ['desktop-light', 'desktop-dark', 'phone-light'], run: async p => { await p.click('main [aria-label="Custom colour"]'); await p.fill('#w-acc-hex', '#ffd400'); await p.locator('main h3:has-text("Brand colour")').scrollIntoViewIfNeeded(); } },
  { name: 'location--users', route: 'location', title: 'Location users tab', run: async p => { await tab(p, 'Users'); } },
  { name: 'location--users-scoped', route: 'location', title: 'Location users tab as a scoped list card: own search + quick tab in the link (P39)', run: async p => { await tab(p, 'Users'); await p.waitForTimeout(500); await p.locator('main section[data-list-card] [role=tab]:has-text("Here")').click(); await p.fill('main input[aria-label="Search people or roles"]', 'a'); } },
  { name: 'location--details', route: 'location', title: 'Location details tab', full: true, run: async p => { await tab(p, 'Details'); } },
  { name: 'request-types--editor', route: 'request-types', title: 'Workflow editor with notifications + capacity error (D40, D43)', run: async p => { await p.locator('main article:has-text("Reset a respondent") button.flex-1').click(); } },
  { name: 'request--details', route: 'approvals', title: 'Request details (two-step publish)', full: true, combos: ALL, run: async p => { await p.locator('main [role=tab]:text-is("All")').first().click(); await p.waitForTimeout(900); await p.locator('main :text("RQ-2026-0014")').first().click(); } },
  { name: 'request--notifications', route: 'approvals', title: 'Request notifications tab (D43)', run: async p => { await p.locator('main [role=tab]:text-is("All")').first().click(); await p.waitForTimeout(900); await p.locator('main :text("RQ-2026-0012")').first().click(); await p.waitForTimeout(1100); await tab(p, 'Notifications'); } },
  { name: 'request--short-step', route: 'approvals', title: 'Short step, Owner completes (D40)', run: async p => { await p.locator('main [role=tab]:text-is("All")').first().click(); await p.waitForTimeout(900); await p.locator('main :text("RQ-2026-0012")').first().click(); } },
  { name: 'responses--export-needs-approval', route: 'responses', title: 'Export behind approval (D41)', run: async p => { await p.locator('button:has-text("Export")').first().click(); await p.waitForTimeout(300); await p.locator('[role=menuitem]:has-text("Excel")').click(); } },
  { name: 'user-menu--notification-settings', route: 'dashboard', title: 'Personal notification settings (D43)', run: async p => { await p.locator('header button:has-text("AJ")').last().click(); await p.waitForTimeout(300); await p.locator('[role=menuitem]:has-text("Notification settings")').click(); } },
  { name: 'builder--settings', route: 'builder', title: 'Builder settings tab', full: true, run: async p => { await p.locator('[role=tab]:visible:has-text("Settings")').first().click(); } },
  { name: 'responses--individual', route: 'responses', title: 'Individual responses table', full: true, run: async p => { await p.locator('[role=tab]:visible:has-text("Individual")').first().click(); } },
  { name: 'responses--response-sheet', route: 'responses', title: 'One response in a side sheet', run: async p => { await p.locator('[role=tab]:visible:has-text("Individual")').first().click(); await p.waitForTimeout(500); await p.locator('tbody tr:visible, li > button.w-full:visible').first().click(); } },
  ...[['running', 'Skip to answering', 'Answering (timer pill, section)'], ['not_open', 'Not open yet', 'Gate: not open yet'], ['closed', 'Closed', 'Gate: closed'], ['max', 'Response limit reached', 'Gate: response limit'],
    ['responded', 'Already responded', 'Gate: already responded'], ['voided', 'Already responded (voided)', 'Gate: earlier attempt voided'], ['not_invited', 'Not invited (private form)', 'Gate: not invited'],
    ['device', 'Device blocked (iPhone)', 'Gate: device blocked'], ['second_tab', 'Open in another tab', 'Gate: open in another tab'], ['resume', 'Resume timed attempt', 'Gate: resume timed attempt'], ['left_submitted', 'Left tab, auto-submitted', 'Gate: left tab, auto-submitted']]
    .map(([id, label, title]) => ({ name: 'respondent--' + id, route: 'respondent', title: 'Respondent ' + title, run: async p => { await scen(p, label); } })),
  ...[['tab_hidden', 'Switch tab'], ['fullscreen_exit', 'Exit full screen'], ['copy_attempt', 'Copy attempt']]
    .map(([id, label]) => ({ name: 'respondent--violation-' + id, route: 'respondent', title: 'Violation overlay: ' + label, run: async p => { await scen(p, 'Skip to answering'); await p.waitForTimeout(600); await p.click('button:has-text("Prototype states")'); await p.waitForTimeout(300); await p.locator('[role=dialog] button:has-text("' + label + '")').click(); await p.waitForTimeout(500); } })),
  { name: 'respondent--timer-warning', route: 'respondent', title: 'Timer under one minute', run: async p => { await scen(p, 'Skip to answering'); await p.waitForTimeout(600); await p.click('button:has-text("Prototype states")'); await p.waitForTimeout(300); await p.locator('[role=dialog] button:has-text("Timer to 0:05")').click(); await p.waitForTimeout(400); } },
].map(s => ({ combos: KEY, ...s }));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const list = [...SCREENS, ...STATES].filter(s => !ONLY.length || ONLY.includes(s.name) || ONLY.includes(s.route));
  const index = [];
  for (const s of list) for (const c of s.combos) {
    const ctx = await b.newContext({ ...COMBOS[c], reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await ctx.route('**/*', r => {
      const u = r.request().url();
      if (u.includes('cdn.tailwindcss.com')) return r.fulfill({ body: 'window.tailwind={};', contentType: 'text/javascript' });
      if (u.includes('vue.global')) return r.fulfill({ path: require.resolve('vue/dist/vue.global.prod.js') });
      if (u.includes('lucide')) return r.fulfill({ path: require.resolve('lucide/dist/umd/lucide.min.js') });
      if (u.includes('fonts.googleapis.com')) return r.fulfill({ body: FONTS_CSS, contentType: 'text/css' });
      if (u.startsWith('http://fonts.local/')) {
        const [pkg, file] = u.slice('http://fonts.local/'.length).split('/');
        const dir = FONT_DIRS.find(d => path.basename(d) === pkg);
        return dir ? r.fulfill({ path: path.join(dir, 'files', file) }) : r.abort();
      }
      if (u.startsWith('http://proto/')) return r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>' + CSS + '</style></head><body><script>window.__INIT_ROUTE=' + JSON.stringify(s.route) + '</script>' + HTML + '</body></html>' });
      return r.abort();
    });
    await p.goto('http://proto/'); await p.waitForTimeout(1000);
    try { if (s.run) { await s.run(p, c); await p.waitForTimeout(700); } }
    catch (e) { errs.push('state step failed: ' + e.message.split('\n')[0]); }
    const file = `${s.name}__${c}.png`;
    await p.screenshot({ path: path.join(OUT, file), fullPage: !!s.full });
    index.push({ name: s.name, route: s.route, title: s.title, combo: c, file });
    console.log(file, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'ok');
    await ctx.close();
  }
  await b.close();
  if (!ONLY.length) fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
})();
