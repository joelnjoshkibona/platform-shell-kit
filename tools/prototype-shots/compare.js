/*
 * Side-by-side review page: prototype screenshot vs the real app's screenshot of the same screen.
 *
 *   node compare.js --app ../../web/tests/visual/__screenshots__ --out out/compare.html
 *
 * The app's screenshots must use the same file names as docs/design/screenshots (e.g. roles__desktop-light.png).
 * Missing files are listed so nothing is silently skipped. Open the HTML and review every pair before a phase PR.
 */
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const PROTO = path.resolve(__dirname, '../../screenshots');
const APP = path.resolve(opt('app', '../../web/tests/visual/__screenshots__'));
const OUT = path.resolve(opt('out', 'out/compare.html'));
const index = JSON.parse(fs.readFileSync(path.join(PROTO, 'index.json'), 'utf8'));
const rel = (f) => path.relative(path.dirname(OUT), f).split(path.sep).join('/');
let missing = [];
const rows = index.map(x => {
  const a = path.join(APP, x.file); const has = fs.existsSync(a); if (!has) missing.push(x.file);
  return `<section><h2>${x.title} <small>${x.combo} · ${x.file}</small></h2><div class="pair"><figure><figcaption>Prototype</figcaption><img src="${rel(path.join(PROTO, x.file))}"></figure><figure><figcaption>App</figcaption>${has ? `<img src="${rel(a)}">` : '<p class="miss">Missing</p>'}</figure></div></section>`;
}).join('\n');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `<!doctype html><meta charset=utf-8><title>Prototype vs app</title><style>body{font:14px system-ui;margin:16px;background:#f4f4f5}section{background:#fff;border:1px solid #e4e4e7;border-radius:10px;padding:12px;margin:0 0 16px}h2{font-size:15px;margin:0 0 8px}small{color:#71717a;font-weight:400}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}img{max-width:100%;border:1px solid #e4e4e7}.miss{color:#b91c1c}</style><h1>Prototype vs app (${index.length - missing.length}/${index.length})</h1>${missing.length ? '<p class="miss">Missing: ' + missing.join(', ') + '</p>' : ''}${rows}`);
console.log('wrote', OUT, missing.length ? `(${missing.length} missing)` : '');
