/*
 * Browser checks for the decisions' "Tests (kit check)" sections (docs/platform/P1xx-*.md), run against the built prototype.
 * What a shared file must not name is checked in the source by tools/kit-check.py.
 *
 *   npm run css && node decisions.test.js      # every check
 *   node decisions.test.js --only P107,P111    # some of them
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { routeProto } = require('./serve');
const L = require('./layout');

const args = process.argv.slice(2);
const ONLY = args.includes('--only') ? (args[args.indexOf('--only') + 1] || '').split(',').filter(Boolean) : [];
let failed = 0, passed = 0;
const fail = (m) => { failed++; console.log('FAIL', m); };
const ok = (cond, m) => cond ? passed++ : fail(m);

async function open(b, route, o = {}) {
  const ctx = await b.newContext({ viewport: { width: o.w || 1280, height: o.h || 900 }, colorScheme: o.dark ? 'dark' : 'light', isMobile: !!o.mobile, hasTouch: !!o.mobile, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { window.__SLOW_PAGE = false; });
  await routeProto(ctx, route);
  if (o.html) {   // the prototype with a change (P110: another product registry); same page shell as serve.js
    const css = fs.readFileSync(path.resolve(__dirname, '.tw.css'), 'utf8'), html = o.html(fs.readFileSync(L.HTML, 'utf8'));
    await ctx.route('http://proto/', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>' + css + '</style></head><body><script>window.__INIT_ROUTE=' + JSON.stringify(route) + '</script>' + html + '</body></html>' }));
  }
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://proto/'); await p.waitForTimeout(1500);
  await p.evaluate(() => { G.curtainOn = false; });
  return { ctx, p, errs, done: async (tag) => { errs.forEach(e => fail(`${tag}: page error ${e}`)); await ctx.close(); } };
}
const go = async (p, fn, arg) => { await p.evaluate(fn, arg); await p.waitForTimeout(700); };
async function decide(p, id, mode) {
  await go(p, (id) => G.openReq(id), id);
  const label = mode === 'approve' ? 'Approve' : 'Reject';
  await p.locator(`main button:has-text("${label}")`).first().click(); await p.waitForTimeout(300);
  const dlg = p.locator('[role=dialog]').last();
  if (mode !== 'approve') await dlg.locator('textarea').fill('Not this time');
  await dlg.locator(`button:has-text("${label}")`).last().click(); await p.waitForTimeout(500);
}

const TESTS = {
  /* P107: the action's own apply / reject run once, when the request is decided */
  async P107(b) {
    const { p, done } = await open(b, 'approvals');
    await p.evaluate(() => { window.__fx = { apply: 0, reject: 0 }; for (const a of Object.values(G.approvalActions)) { const ap = a.apply; a.apply = (r) => { __fx.apply++; if (ap) ap(r); }; a.reject = () => { __fx.reject++; }; } });
    await decide(p, 'rq14', 'approve');   // Publish a form, its last step
    let fx = await p.evaluate(() => ({ ...__fx }));
    ok(fx.apply === 1 && fx.reject === 0, `P107: approving the last step ran apply ${fx.apply}×, reject ${fx.reject}× (want 1, 0)`);
    await go(p, () => nav('forms'));
    ok((await p.locator('main').innerText()).includes('No close date'), 'P107: the approved form did not go live (Fomu\'s apply)');
    await decide(p, 'rq13', 'reject');    // Export responses, step 1
    fx = await p.evaluate(() => ({ ...__fx }));
    ok(fx.apply === 1 && fx.reject === 1, `P107: rejecting ran apply ${fx.apply}×, reject ${fx.reject}× in all (want 1, 1)`);
    await done('P107');
  },
  /* P108: the subject brings its own location (and a note); New request picks from the action's own source */
  async P108(b) {
    const { p, done } = await open(b, 'approvals');
    const need = await p.evaluate(() => [G.approvalNeeded('Forms.publish', 'aru'), G.approvalNeeded('Forms.publish', undefined), G.approvalNeeded('Responses.export', 'aru'), G.approvalNeeded('Responses.export', undefined)]);
    ok(need.join() === 'true,false,true,true', `P108: approvalNeeded by location gave ${need} (want a location-scoped workflow only with a location; an all-records one always)`);
    await p.evaluate(() => { window.__ran = 0; G.approvalGate('Forms.publish', { kind: 'form', id: 'f6', label: 'Fire Safety Drill Quiz', loc: 'aru', note: 'Before the drill on Friday' }, () => __ran++); }); await p.waitForTimeout(400);
    const d = p.locator('[role=dialog]').last();
    ok((await d.locator('textarea').inputValue()) === 'Before the drill on Friday', 'P108: the gate did not prefill the note');
    ok((await d.innerText()).includes('Location: Arusha Branch'), 'P108: the route preview is not at the record\'s location');
    await d.locator('button:has-text("Send for approval")').click(); await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const r = G.openRequestFor('Forms.publish', { kind: 'form', id: 'f6' }); return r && { loc: r.loc, note: r.note, ran: __ran }; });
    ok(r && r.loc === 'aru' && r.note === 'Before the drill on Friday' && r.ran === 0, `P108: the request was not made at the record's location with its note (${JSON.stringify(r)})`);
    await p.evaluate(() => G.approvalGate('Forms.publish', { kind: 'form', id: 'f1', label: 'Customer Service Assessment Q4' }, () => __ran++)); await p.waitForTimeout(200);
    ok(await p.evaluate(() => __ran) === 1, 'P108: a record with no location should not need the location-scoped workflow');
    // New request: the action's pick source, the picked record's location
    await go(p, () => nav('approvals'));
    await p.locator('main button:has-text("New request")').first().click(); await p.waitForTimeout(400);
    const d2 = p.locator('[role=dialog]').last();
    await d2.locator('button:has-text("Choose a form")').first().click(); await p.waitForTimeout(1600);
    await p.locator('[role=option]:has-text("Branch Opening Checklist")').first().click(); await p.waitForTimeout(300);
    ok((await d2.innerText()).includes('Location: Arusha Branch'), 'P108: New request does not route at the picked record\'s location');
    await d2.locator('button:has-text("Send for approval")').click(); await p.waitForTimeout(800);
    ok(await p.locator('main dd button:has-text("Branch Opening Checklist")').count() === 1, 'P108: the new request\'s About is not a link to the record (pick.open)');
    await done('P108');
  },
  /* P109: a report declares its quick tabs and sorts */
  async P109(b) {
    const { p, done } = await open(b, 'report');
    await p.waitForTimeout(1500);
    const tabs = (await p.locator('main .lc-tabs [role=tab]').allInnerTexts()).map(t => t.split('\n')[0]);
    ok(tabs.join() === 'All,Cash,M-Pesa,Card,Credit', `P109: the demo report's quick tabs are ${tabs} (want All, Cash, M-Pesa, Card, Credit)`);
    const sorts = async () => { await p.locator('main button:has-text("Sort")').first().click(); await p.waitForTimeout(250); const t = await p.locator('[role=menu]').last().innerText(); await p.keyboard.press('Escape'); await p.waitForTimeout(150); return t.split('\n').filter(x => x && !['Sort by', 'Ascending', 'Descending'].includes(x)); };
    ok((await sorts()).join() === 'Date,Total,Qty', 'P109: the demo report\'s declared sorts are not offered');
    await p.evaluate(() => { G.reports.push({ id: 'p109', name: 'Plain', module: 'Test', desc: '', rows: () => [{ id: 'a', n: 2, d: '2026-10-01', s: 'Open' }, { id: 'b', n: 1, d: '2026-10-02', s: 'Done' }, { id: 'c', n: 5, d: '2026-10-03', s: 'Open' }],
      fields: [{ key: 'id', label: 'Id', type: 'text' }, { key: 's', label: 'Status', type: 'text', group: true }, { key: 'd', label: 'Day', type: 'date' }, { key: 'n', label: 'Count', type: 'number', agg: 'sum' }],
      views: [{ id: 'v', name: 'All', owner: 'Amina Juma', shared: 'Everyone', def: true, cols: ['id', 's', 'd', 'n'], pinned: [], groupBy: '', chart: { type: 'column', x: 's', bucket: 'month', ys: [{ key: 'n', agg: 'sum' }], series: '', top: 0, labels: false } }] }); G.reportId = 'p109'; });
    await p.waitForTimeout(900);
    ok(await p.locator('main .lc-tabs').count() === 0, 'P109: a report without quick shows quick tabs');
    ok((await sorts()).join() === 'Day,Count', 'P109: a report without sorts does not sort by its date and number fields');
    await p.evaluate(() => { G.reports.find(r => r.id === 'p109').quick = 's'; G.reportId = 'sales'; }); await p.waitForTimeout(300);
    await p.evaluate(() => { G.reportId = 'p109'; }); await p.waitForTimeout(900);
    const qt = (await p.locator('main .lc-tabs [role=tab]').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
    ok(qt.join() === 'All 3,Done 1,Open 2', `P109: quick: 's' gave tabs ${qt} (want All 3, Done 1, Open 2)`);
    await done('P109');
  },
  /* P110: the product registry feeds the shell's permissions, roles, route check and page titles */
  async P110(b) {
    const registry = (body) => (h) => { const i = h.indexOf('const PRODUCT_REGISTRY = {'), j = h.indexOf('\n  };\n', i); if (i < 0 || j < 0) throw new Error('no PRODUCT_REGISTRY in the prototype'); return h.slice(0, i) + 'const PRODUCT_REGISTRY = ' + body + ';' + h.slice(j + 5); };
    // an empty registry: the shell runs with the core modules only
    let s = await open(b, 'permissions', { html: registry('{ permissions: [], roles: {}, detailRoutes: [] }') });
    let t = await s.p.locator('main').innerText();
    ok(t.includes('Users.list') && !t.includes('Forms.list'), 'P110: with an empty registry the catalogue is not the core one');
    await go(s.p, () => nav('dashboard'));
    ok(!(await s.p.locator('aside').first().innerText()).includes('Forms'), 'P110: with an empty registry the product\'s menu still shows (no role gets Forms.list)');
    await s.done('P110 empty registry');
    // Fomu's registry: its catalogue and role defaults
    s = await open(b, 'roles');
    t = await s.p.locator('main').innerText();
    ok(t.includes('Reads results and reports only.'), 'P110: the registry\'s role description is not used');
    await s.done('P110 Fomu');
    // a detail route: inside the shell with its title and its parent's menu item; one not listed is not
    s = await open(b, 'members', { html: registry("{ permissions: [], roles: {}, detailRoutes: [{ route: 'thing', title: () => 'Thing T-1', parent: 'members' }] }") });
    const r = await s.p.evaluate(() => [G.isShell('thing'), G.isShell('nothing')]);
    ok(r.join() === 'true,false', `P110: isShell for a listed / an unlisted route gave ${r}`);
    await go(s.p, () => nav('thing'));
    ok((await s.p.locator('header, main').first().innerText()).includes('Thing T-1') || (await s.p.title()).includes('Thing T-1') || (await s.p.locator('body').innerText()).includes('Thing T-1'), 'P110: a detail route does not get its title');
    ok(await s.p.evaluate(() => G.navRoute) === 'members', 'P110: a detail route does not highlight its parent menu item');
    await s.done('P110 detail route');
  },
  /* P111: a plain click on a RecordLink opens the record's details page in the record dialog; the sheet only without a page */
  async P111(b) {
    const { ctx, p, done } = await open(b, 'approvals');
    const dialogs = () => p.locator('[data-testid=app-dialog]');
    const sheets = () => p.locator('[role=dialog]:not([data-testid=app-dialog])');
    await go(p, () => G.openReq('rq14'));
    await p.locator('main a[aria-label="Open Arusha Branch"]').click(); await p.waitForTimeout(600);
    ok(await dialogs().count() === 1 && await sheets().count() === 0, 'P111: a plain click on a location link did not open one record dialog (and no sheet)');
    ok((await dialogs().last().locator('[role=tab][aria-selected=true]').allInnerTexts()).join() === 'Overview', 'P111: the record dialog did not open on Overview');
    await dialogs().last().locator('[data-testid=dialog-footer] button:has-text("Close")').click(); await p.waitForTimeout(400);
    await p.locator('main a[aria-label="Open Its people"]').click(); await p.waitForTimeout(600);
    ok((await dialogs().last().locator('[role=tab][aria-selected=true]').allInnerTexts()).join().startsWith('Users'), 'P111: a link with tab did not open that tab');
    await dialogs().last().locator('[data-testid=dialog-footer] button:has-text("Close")').click(); await p.waitForTimeout(400);
    // Ctrl/Cmd-click is the browser's (a new tab), not ours
    const popup = ctx.waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await p.locator('main a[aria-label="Open Arusha Branch"]').click({ modifiers: ['ControlOrMeta'] });
    const np = await popup; await p.waitForTimeout(300);
    ok(await dialogs().count() === 0 && !!np, 'P111: Ctrl/Cmd-click was intercepted (want a new tab and no dialog)');
    if (np) await np.close();
    // a module with no page keeps the sheet preview (Requests, on the Design system page)
    await go(p, () => nav('design'));
    await p.locator('main [role=tab]:has-text("Components")').first().click(); await p.waitForTimeout(300);
    await p.locator('main input[placeholder="Search components"]').fill('Record link'); await p.waitForTimeout(400);
    const req = p.locator('main a[aria-label="Preview RQ-2026-0014"]').first();
    await req.scrollIntoViewIfNeeded(); await req.click(); await p.waitForTimeout(600);
    ok(await dialogs().count() === 0 && await p.locator('[role=dialog]:has-text("View full page")').count() === 1, 'P111: a link to a module with no page did not open its sheet preview');
    await done('P111');
  },
  /* P112: on a narrow list whose titles would not fit beside the status / hero, they sit under the title */
  async P112(b) {
    for (const w of [360, 390, 430, 1280]) {
      const { p, done } = await open(b, 'scheduled-tasks', { w, h: 844, mobile: w < 500 });
      const stacked = await p.locator('main [data-testid=lr-stack]').count(), rows = await p.locator('main [role=link]').count();
      if (w <= 390) {
        ok(rows > 0 && stacked === rows, `P112 ${w}px: Scheduled tasks stacked ${stacked} of ${rows} rows (want all)`);
        const right = await p.locator('main [role=link]').first().evaluate(r => getComputedStyle(r).gridTemplateColumns.split(' ').length);
        ok(right === 2, `P112 ${w}px: a stacked row still has a right-hand column (${right} grid columns, want title + chevron)`);
      }
      if (w === 1280) ok(stacked === 0, 'P112 1280px: a wide list stacked');
      if (w === 390) { await go(p, () => nav('queue')); ok(await p.locator('main [data-testid=lr-stack]').count() === 0, 'P112 390px: Queue, whose titles fit, stacked'); }
      for (const r of ['scheduled-tasks', 'locations', 'approvals', 'members', 'queue', 'trash', 'my-jobs']) {
        await go(p, (r) => nav(r), r);
        const sx = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        ok(sx <= 0, `P112 ${w}px: ${r} scrolls sideways by ${sx}px`);
      }
      await done('P112 ' + w);
    }
  },
};

(async () => {
  const b = await chromium.launch();
  for (const [k, t] of Object.entries(TESTS)) if (!ONLY.length || ONLY.includes(k)) { try { await t(b); } catch (e) { fail(`${k}: ${e.message.split('\n')[0]}`); } }
  await b.close();
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
