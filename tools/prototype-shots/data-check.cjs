// Motion 9: data draws in. The Design system's Data demo, the dashboard, a report chart; motion on (light 1280, dark 390) and reduced.
const { chromium } = require('playwright'); const { routeProto } = require('./serve');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const [label, w, h, scheme, rm] of [['desktop-light', 1280, 900, 'light', 'no-preference'], ['phone-dark', 390, 844, 'dark', 'no-preference'], ['reduced', 1280, 900, 'light', 'reduce']]) {
    const R = {}, errs = [];
    const page = async (route) => { const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: rm, isMobile: w < 500, hasTouch: w < 500 }); const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(route + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(route + ' ' + m.type() + ': ' + m.text().slice(0, 160)); });
      await routeProto(ctx, route); await p.goto('http://proto/'); return [ctx, p]; };
    const widths = (p, sel) => p.$$eval(sel, els => els.map(e => Math.round(parseFloat(getComputedStyle(e).width) / e.parentElement.getBoundingClientRect().width * 100)));
    // dashboard: mid-way and settled
    let [c, p] = await page('dashboard'); await p.waitForFunction(() => document.querySelector('main [data-meter]') && (G.curtain === 'opening' || G.curtain === 'idle')); await p.waitForTimeout(rm === 'reduce' ? 50 : 300);
    R.curtainAtMid = await p.evaluate(() => G.curtain);
    R.dashMidNums = await p.$$eval('main [data-num]', els => els.map(e => e.textContent.trim()).join(' '));
    R.dashMidBars = (await widths(p, 'main [data-meter]')).join(',');
    if (label !== 'reduced') await p.screenshot({ path: `${OUT}/${label}-dashboard-mid.png` });
    await p.waitForTimeout(1200);
    R.dashEndNums = await p.$$eval('main [data-num]', els => els.map(e => e.textContent.trim()).join(' '));
    R.dashEndBars = (await widths(p, 'main [data-meter]')).join(',');
    R.sparkDrawn = await p.$$eval('main path.spark', els => els.map(e => getComputedStyle(e).strokeDashoffset).join(','));
    R.dashSideways = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await c.close();
    // the Data demo: below the fold until scrolled to
    [c, p] = await page('design'); await p.waitForTimeout(1800);
    await p.locator('main [role=tab]:has-text("Motion")').first().click(); await p.waitForTimeout(700);
    const sec = p.locator('[data-demo=data]');
    R.belowFoldBeforeScroll = (await widths(p, '[data-demo=data] [data-demo-part=meter] [data-meter]')).join(',');
    await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(rm === 'reduce' ? 60 : 260);
    R.dataMid = { meter: (await widths(p, '[data-demo=data] [data-demo-part=meter] [data-meter]')).join(','), line: await p.$eval('[data-demo=data] path.spark, [data-demo=data] path.spark-wait', e => getComputedStyle(e).strokeDashoffset) };
    if (label !== 'reduced') await sec.screenshot({ path: `${OUT}/${label}-data-mid.png` });
    await p.waitForTimeout(1200); if (label !== 'reduced') await sec.screenshot({ path: `${OUT}/${label}-data-end.png` });
    R.dataEnd = (await widths(p, '[data-demo=data] [data-demo-part=meter] [data-meter]')).join(',');
    await p.click('[data-testid=m-data-new]'); await p.waitForTimeout(rm === 'reduce' ? 60 : 200);
    R.newMid = (await widths(p, '[data-demo=data] [data-demo-part=meter] [data-meter]')).join(','); await p.waitForTimeout(900);
    R.newEnd = (await widths(p, '[data-demo=data] [data-demo-part=meter] [data-meter]')).join(',');
    const rerender = await p.$eval('[data-demo=data] [data-demo-part=meter] [data-meter]', e => e.style.width);
    await p.locator('main [role=tab]:has-text("Motion")').first().click(); await p.waitForTimeout(50);
    R.noReplayOnRerender = rerender === await p.$eval('[data-demo=data] [data-demo-part=meter] [data-meter]', e => e.style.width);
    await c.close();
    // a report chart: shared option set, draws when in view, updates in place
    [c, p] = await page('report'); await p.waitForTimeout(2500);
    R.chartOpts = await p.evaluate(() => { const H = window.Highcharts; if (!H) return 'no Highcharts'; const o = H.getOptions(); return JSON.stringify({ chart: o.chart.animation && o.chart.animation.duration !== undefined ? o.chart.animation.duration : o.chart.animation, series: o.plotOptions.series.animation && o.plotOptions.series.animation.duration !== undefined ? o.plotOptions.series.animation.duration : o.plotOptions.series.animation }); });
    R.chartDrawn = await p.locator('[data-testid=chart] .highcharts-series').count();
    out.push({ label, R, errs }); await c.close();
  }
  await b.close(); console.log(JSON.stringify(out, null, 1));
})();
