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
};

(async () => {
  const b = await chromium.launch();
  for (const [k, t] of Object.entries(TESTS)) if (!ONLY.length || ONLY.includes(k)) { try { await t(b); } catch (e) { fail(`${k}: ${e.message.split('\n')[0]}`); } }
  await b.close();
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
