#!/usr/bin/env node
// P79: writes the product's public download page (index.html, icon.png, favicon.png) into a folder, from
// download-page/index.html, the product's colours and its app icon. latest.json is the release script's; this never touches it.
//
//   node scripts/make-download-page.mjs <out-dir>
//
// Reads from mobile/.env: APP_NAME, APP_TAGLINE (one line under the name) and APP_DATA_KEPT (what an update keeps).
// Colours: download-page/colours.json ({ "light": {…}, "dark": {…} }, the shell's token names) when the product has one, else the
// kit's default blue (P41). The icon is public/icon.png, drawn by scripts/make-images.mjs (P55).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MOBILE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = process.argv[2]
if (!out) {
  console.error('Usage: node scripts/make-download-page.mjs <out-dir>')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(join(MOBILE, '.env'), 'utf8')
    .split('\n')
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '')]),
)
const name = env.APP_NAME || 'App'
const tagline = env.APP_TAGLINE || 'Android only.'
const kept = env.APP_DATA_KEPT || 'Your data stays.'

// The shell's tokens as colours (the phone interface's :root, light and .dark): background, card, foreground, muted-foreground,
// border, primary, primary-foreground.
const KIT = {
  light: { background: 'hsl(0 0% 100%)', card: 'hsl(0 0% 100%)', foreground: 'hsl(240 10% 3.9%)', 'muted-foreground': 'hsl(240 3.8% 42%)', border: 'hsl(240 5.9% 90%)', primary: 'hsl(221 83% 45%)', 'primary-foreground': 'hsl(0 0% 98%)' },
  dark: { background: 'hsl(240 10% 3.9%)', card: 'hsl(240 6% 8.5%)', foreground: 'hsl(0 0% 96%)', 'muted-foreground': 'hsl(240 5% 64.9%)', border: 'hsl(240 3.7% 17%)', primary: 'hsl(217 91% 64%)', 'primary-foreground': 'hsl(222 47% 8%)' },
}
const own = join(MOBILE, 'download-page', 'colours.json')
const theme = existsSync(own) ? { ...KIT, ...JSON.parse(readFileSync(own, 'utf8')) } : KIT
const icon = join(MOBILE, 'public', 'icon.png')
if (!existsSync(icon)) throw new Error('public/icon.png is missing: run node scripts/make-images.mjs first (P55)')
const vars = (c) =>
  Object.entries({ bg: c.background, card: c.card, fg: c.foreground, muted: c['muted-foreground'], line: c.border, pri: c.primary, on: c['primary-foreground'] })
    .map(([k, v]) => `--${k}:${v}`)
    .join(';')

const html = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])
const page = readFileSync(join(MOBILE, 'download-page', 'index.html'), 'utf8')
  .replaceAll('{{LIGHT}}', vars(theme.light))
  .replaceAll('{{DARK}}', vars(theme.dark))
  .replaceAll('{{NAME}}', html(name))
  .replaceAll('{{TAGLINE}}', html(tagline))
  .replaceAll('{{KEPT}}', html(kept))
if (/\{\{[A-Z]+\}\}/.test(page)) throw new Error('download-page/index.html has a placeholder this script does not fill')

mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'index.html'), page)
copyFileSync(icon, join(out, 'icon.png'))
copyFileSync(icon, join(out, 'favicon.png'))
console.log(`Download page for ${name} written to ${out}`)
