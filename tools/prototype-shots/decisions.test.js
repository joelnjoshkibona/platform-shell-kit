/*
 * Browser checks for the decisions' "Tests (kit check)" sections (docs/platform/P1xx-*.md), run against the built prototype.
 * What a shared file must not name is checked in the source by tools/kit-check.py.
 *
 *   npm run css && node decisions.test.js      # every check
 *   node decisions.test.js --only P107,P111    # some of them
 */
const { chromium } = require('playwright');
const { routeProto } = require('./serve');

const args = process.argv.slice(2);
const ONLY = args.includes('--only') ? (args[args.indexOf('--only') + 1] || '').split(',').filter(Boolean) : [];
let failed = 0, passed = 0;
const fail = (m) => { failed++; console.log('FAIL', m); };
const ok = (cond, m) => cond ? passed++ : fail(m);

async function open(b, route, o = {}) {
  const ctx = await b.newContext({ viewport: { width: o.w || 1280, height: o.h || 900 }, colorScheme: o.dark ? 'dark' : 'light', isMobile: !!o.mobile, hasTouch: !!o.mobile, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { window.__SLOW_PAGE = false; });
  await routeProto(ctx, route);
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
};

(async () => {
  const b = await chromium.launch();
  for (const [k, t] of Object.entries(TESTS)) if (!ONLY.length || ONLY.includes(k)) { try { await t(b); } catch (e) { fail(`${k}: ${e.message.split('\n')[0]}`); } }
  await b.close();
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
