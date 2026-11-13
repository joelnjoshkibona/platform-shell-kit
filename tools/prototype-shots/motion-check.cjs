// Drives each motion on the Design system's Motion tab: motion on (light 1280, dark 390), then reduced motion.
const { chromium } = require('playwright'); const { routeProto } = require('./serve');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const results = [];
  for (const [label, w, h, scheme, rm] of [['desktop-light', 1280, 900, 'light', 'no-preference'], ['phone-dark', 390, 844, 'dark', 'no-preference'], ['reduced', 1280, 900, 'light', 'reduce']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: rm, isMobile: w < 500, hasTouch: w < 500 });
    const p = await ctx.newPage(); const errs = [], warns = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); if (m.type() === 'warning') warns.push(m.text().slice(0, 200)); });
    await routeProto(ctx, 'design'); await p.goto('http://proto/'); await p.waitForTimeout(1800);
    await p.locator('main [role=tab]:has-text("Motion")').first().click(); await p.waitForTimeout(900);
    const R = {}; const t = (k, v) => { R[k] = v; };
    const shot = (n) => p.screenshot({ path: `${OUT}/${label}-${n}.png` });
    const dialogs = () => p.locator('[role=dialog]').count();
    // 1. atom dialog
    await p.click('[data-testid=m-dialog]'); await p.waitForTimeout(70);
    t('dialog.inAnimating', await p.evaluate(() => { const d = document.querySelector('.dlg-panel'); return d ? d.getAnimations().length > 0 : 'none'; }));
    if (label !== 'reduced') await shot('dialog-opening');
    await p.waitForTimeout(400);
    await p.click('[data-testid=m-dialog-close]'); await p.waitForTimeout(40);
    t('dialog.stillInDomMidExit', await dialogs() > 0); await p.waitForTimeout(400); t('dialog.goneAfter', await dialogs() === 0);
    // AppDialog (stack)
    await p.click('[data-testid=m-appdialog]'); await p.waitForTimeout(450);
    await p.locator('[data-testid=dialog-footer] button:has-text("Close")').first().click(); await p.waitForTimeout(40);
    t('appdialog.midExit', await p.evaluate(() => !!document.querySelector('[data-testid=app-dialog].dlg-out')));
    if (label === 'phone-dark') { await p.waitForTimeout(40); await shot('appdialog-sliding-down'); }
    await p.waitForTimeout(400); t('appdialog.gone', await p.locator('[data-testid=app-dialog]').count() === 0);
    // sheet
    await p.click('[data-testid=m-sheet]'); await p.waitForTimeout(450); await p.locator('[role=dialog] button[aria-label=Close]').last().click(); await p.waitForTimeout(60);
    t('sheet.midExit', await dialogs() > 0); await p.waitForTimeout(400); t('sheet.gone', await dialogs() === 0);
    // 2. list
    const list = p.locator('[data-demo=list]'); const items = () => list.locator('[data-lr-item]').count();
    await p.click('[data-testid=m-list-replay]'); await p.waitForTimeout(30);
    t('list.firstLoadRise', await list.locator('.lr-rise').count());
    await p.waitForTimeout(900);
    const n0 = await items(); await p.click('[data-testid=m-list-add]'); await p.waitForTimeout(60);
    t('list.newHighlighted', await list.locator('.lr-new').count()); await p.waitForTimeout(1500);
    await p.click('[data-testid=m-list-change]'); await p.waitForTimeout(60); t('list.changedFlash', await list.locator('.lr-changed').count()); await p.waitForTimeout(1200);
    const n1 = await items(); await p.click('[data-testid=m-list-delete]'); await p.waitForTimeout(70);
    t('list.deleteMidCount', (await items()) + ' of ' + n1);
    if (label === 'desktop-light') await list.screenshot({ path: `${OUT}/${label}-list-deleting.png` });
    await p.waitForTimeout(500); t('list.afterDelete', (await items()) + ' (was ' + n1 + ', added from ' + n0 + ')');
    // 3. tabs
    const tabs = p.locator('[data-demo=tabs]');
    const indL = () => tabs.locator('.tab-ind').evaluate(e => e.style.left).catch(() => 'no indicator');
    const l0 = await indL(); await tabs.locator('[role=tab]:has-text("History")').click(); await p.waitForTimeout(60);
    t('tabs.indicatorMoves', l0 + ' -> ' + await indL()); t('tabs.panelFade', await tabs.locator('.tab-in').count());
    // 4. save bar
    const sb = p.locator('[data-demo=savebar]');
    await sb.locator('[data-testid=m-dirty]').click(); await p.waitForTimeout(120);
    if (label === 'desktop-light') await sb.screenshot({ path: `${OUT}/${label}-savebar-rising.png` });
    await p.waitForTimeout(300); t('savebar.shown', await sb.locator('[data-testid=m-savebar]').count());
    await sb.locator('[data-testid=m-save]').click(); await p.waitForTimeout(150); t('savebar.savedState', await sb.locator('[role=status]:has-text("Saved")').count());
    await p.waitForTimeout(1300); t('savebar.goneAfterSave', await sb.locator('[data-testid=m-savebar]').count() === 0);
    // 5. validation
    const vf = p.locator('[data-demo=validation]');
    await vf.locator('[data-testid=m-submit]').click(); await p.waitForTimeout(80);
    t('validation.errorShown', await vf.locator('p.text-destructive').count());
    t('validation.shaking', await p.evaluate(() => { const i = document.getElementById('m-name'); const f = i.closest('.grid'); return f.getAnimations().length > 0; }));
    t('validation.focused', await p.evaluate(() => document.activeElement && document.activeElement.id));
    // 6. numbers
    const num = p.locator('[data-demo=numbers] [data-num]').first();
    const before = await num.textContent(); await p.click('[data-testid=m-bump]'); await p.waitForTimeout(150); const mid = await num.textContent(); await p.waitForTimeout(600); const end = await num.textContent();
    t('numbers.tween', before + ' -> ' + mid + ' -> ' + end);
    // 7. skeleton + collapse
    await p.click('[data-testid=m-reload]'); await p.waitForTimeout(300); t('skeleton.shown', await p.locator('[data-demo=skeleton] [aria-busy=true]').count());
    await p.waitForTimeout(1100); t('skeleton.content', await p.locator('[data-demo=skeleton] :text("Arusha Branch")').count());
    await p.click('[data-testid=m-collapse]'); await p.waitForTimeout(70);
    t('collapse.midHeight', await p.locator('[data-testid=m-collapsible]').evaluate(e => Math.round(e.getBoundingClientRect().height) + 'px of ' + e.scrollHeight));
    await p.waitForTimeout(400); await p.click('[data-testid=m-collapse]'); await p.waitForTimeout(50);
    t('collapse.midClose', await p.locator('[data-testid=m-collapsible]').count()); await p.waitForTimeout(400); t('collapse.closed', await p.locator('[data-testid=m-collapsible]').count() === 0);
    // 8. press
    const btn = p.locator('[data-demo=press] button').first(); await btn.scrollIntoViewIfNeeded(); const bb = await btn.boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(150);
    t('press.transform', await btn.evaluate(e => getComputedStyle(e).transform)); await p.mouse.up();
    t('sideways', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    results.push({ label, R, errs, warns: warns.length });
    await ctx.close();
  }
  await b.close();
  console.log(JSON.stringify(results, null, 1));
})();
