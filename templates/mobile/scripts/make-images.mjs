// Draws the app icon and the splash (P55, kit 1.7.0) into public/, where NativePHP picks them up on native:run:
//   icon.png         1024 × 1024, opaque: the Store mark (the shell's brand mark) at 46% on {{PRODUCT_NAME}} blue (D13), corner 22%
//                    (Android masks it into its own shape; NativePHP makes every launcher size from it);
//   splash.png       1280 × 1920: the closed boot curtain (web/index.html #boot-curtain, light / dark) as a still frame,
//   splash-dark.png  so the splash, the app's first frame and the web view's first paint are one picture (P55).
// Run from mobile/: node scripts/make-images.mjs (uses Playwright from ../web/node_modules).
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const MOBILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(path.join(MOBILE, '../web/package.json'))
const { chromium } = require('@playwright/test')
// The web's own Geist (500), so "Loading {{PRODUCT_NAME}}…" is drawn in the app's font.
const GEIST = readFileSync(require.resolve('@fontsource/geist/files/geist-latin-500-normal.woff2')).toString('base64')
const FONT = `<style>@font-face{font-family:Geist;font-weight:500;src:url(data:font/woff2;base64,${GEIST}) format('woff2')}</style>`

// Lucide "Store", as in web/index.html's boot curtain and the shell's brand tile.
const MARK = (size, colour) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>`

// Blue (web/src/components/app/accent-swatches/accents.ts): primary 221 83% 45% on white; curtain light / dark pairs.
const BLUE = 'hsl(221 83% 45%)'
const CURTAIN = { light: ['hsl(217 91% 64%)', '221 80% 8%'], dark: ['hsl(217 58% 13%)', '217 40% 92%'] }

// The icon fills the canvas: Android's adaptive mask rounds it; NativePHP scales the foreground into the safe zone.
const icon = `<body style="margin:0;width:1024px;height:1024px;display:grid;place-items:center;background:${BLUE}">${MARK(Math.round(1024 * 0.46), '#fff')}</body>`

// The web's boot curtain (web/index.html #boot-curtain) as one still frame: a 64px ring (2px, its top quarter solid), a
// 44px tile (radius 12) with the 20px mark, "Loading {{PRODUCT_NAME}}…" 14px, 16px below. Android fills the screen with the image
// and crops the sides, so its height is the phone's: 1920 px ≈ 914 CSS px (a 20:9 phone, 411 wide) → k ≈ 2.1.
const k = 1920 / 914
const splash = ([bg, fg]) => `${FONT}<body style="margin:0;width:1280px;height:1920px;display:grid;place-items:center;background:${bg};color:hsl(${fg})">
  <div style="display:grid;justify-items:center">
    <div style="position:relative;display:grid;place-items:center;width:${64 * k}px;height:${64 * k}px">
      <span style="position:absolute;inset:0;border-radius:9999px;border:${2 * k}px solid hsl(${fg} / .25);border-top-color:hsl(${fg})"></span>
      <span style="display:grid;place-items:center;width:${44 * k}px;height:${44 * k}px;border-radius:${12 * k}px;background:hsl(${fg} / .15)">${MARK(Math.round(20 * k), `hsl(${fg})`)}</span>
    </div>
    <p style="margin:${16 * k}px 0 0;font:500 ${14 * k}px/1.4 Geist, system-ui, sans-serif">Loading {{PRODUCT_NAME}}…</p>
  </div></body>`

const browser = await chromium.launch()
const shoot = async (html, width, height, file) => {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(MOBILE, 'public', file), omitBackground: false })
  await page.close()
  console.log(`public/${file}`)
}
await shoot(icon, 1024, 1024, 'icon.png')
await shoot(splash(CURTAIN.light), 1280, 1920, 'splash.png')
await shoot(splash(CURTAIN.dark), 1280, 1920, 'splash-dark.png')
await browser.close()
