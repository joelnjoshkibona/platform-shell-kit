const { markRaw, watchEffect, createApp, reactive, ref, computed, watch, nextTick, h, onMounted, onBeforeUnmount } = Vue;

/* ---------------------------------------------------------------- helpers */
const ulid = (p) => p + '_' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toUpperCase();
const cn = (...a) => a.flat().filter(Boolean).join(' ');

const TYPES = [
  { value: 'single_choice', label: 'Multiple choice', icon: 'CircleDot', logic: true, choice: true },
  { value: 'multi_choice', label: 'Checkboxes', icon: 'SquareCheck', choice: true },
  { value: 'true_false', label: 'True / False', icon: 'ToggleLeft', logic: true, choice: true },
  { value: 'dropdown', label: 'Dropdown', icon: 'SquareChevronDown', logic: true, choice: true },
  { value: 'linear_scale', label: 'Linear scale', icon: 'SlidersHorizontal' },
  { value: 'rating', label: 'Rating', icon: 'Star' },
  { value: 'choice_grid', label: 'Multiple choice grid', icon: 'Grid3x3', grid: true },
  { value: 'checkbox_grid', label: 'Checkbox grid', icon: 'LayoutGrid', grid: true },
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.value, t]));

const ACCENTS = {   // P41 presets: primary light/dark, dark-theme foreground where it differs, curtain pairs (all pass the P46 checks)
  teal:   { label: 'Teal',   l: '174 72% 26%', d: '170 62% 46%', cl: '170 62% 46%', clfg: '174 80% 8%', cd: '166 58% 13%', cdfg: '166 40% 92%' },
  blue:   { label: 'Blue',   l: '221 83% 45%', d: '217 91% 64%', dfg: '222 47% 8%', cl: '217 91% 64%', clfg: '221 80% 8%', cd: '217 58% 13%', cdfg: '217 40% 92%' },
  violet: { label: 'Violet', l: '262 62% 50%', d: '262 80% 72%', cl: '262 80% 72%', clfg: '262 80% 8%', cd: '262 58% 13%', cdfg: '262 40% 92%' },
  rose:   { label: 'Rose',   l: '346 72% 44%', d: '346 80% 66%', cl: '346 80% 66%', clfg: '346 80% 8%', cd: '346 58% 13%', cdfg: '346 40% 92%' },
  amber:  { label: 'Amber',  l: '28 90% 36%',  d: '38 92% 56%',  cl: '38 92% 56%',  clfg: '28 80% 8%',  cd: '38 58% 13%',  cdfg: '38 40% 92%' },
  slate:  { label: 'Slate',  l: '215 25% 27%', d: '215 20% 72%', cl: '215 20% 72%', clfg: '215 80% 8%', cd: '215 25% 15%', cdfg: '215 20% 92%' },
};

/* ---------------------------------------------------------------- P46: the organisation's accent (any colour, contrast enforced)
   One input (a preset key or #rrggbb) -> every token, both themes. The server runs the same derivation (docs/platform/p46-accent-vectors.json)
   and stores the result; the web only derives for the live preview. ACCENT-CORE-START */
const ACC_PAGE = { l: [0, 0, 100], d: [240, 10, 3.9] };            // --background per theme
const ACC_INK = { light: [0, 0, 98], dark: [240, 10, 4] };          // button text: near-white (light theme), near-black (dark theme)
const ACC_MIN = { text: 4.5, ui: 3, curtain: 6 };
const accParse = (t) => String(t).trim().split(/\s+/).map(parseFloat);
const accStr = ([h, s, l]) => Math.round(h) + ' ' + Math.round(s) + '% ' + (Math.round(l * 10) / 10) + '%';
function accRgb([h, s, l]) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return [0, 8, 4].map(n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))); }
function accLum(c) { return accRgb(c).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)).reduce((t, v, i) => t + v * [0.2126, 0.7152, 0.0722][i], 0); }
function accContrast(a, b) { const x = accLum(typeof a === 'string' ? accParse(a) : a), y = accLum(typeof b === 'string' ? accParse(b) : b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function accHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return null;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1)), h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}
function accToHex(c) { return '#' + accRgb(typeof c === 'string' ? accParse(c) : c).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); }
const accIsHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''));
const accValid = (v) => !!ACCENTS[v] || accIsHex(v);
function deriveAccent(value) {
  if (ACCENTS[value]) { const a = ACCENTS[value]; return { value, preset: true, l: a.l, lfg: a.lfg || accStr(ACC_INK.light), d: a.d, dfg: a.dfg || accStr(ACC_INK.dark), cl: a.cl, clfg: a.clfg, cd: a.cd, cdfg: a.cdfg, adjusted: null }; }
  const base = accHex(value); if (!base) return null;
  const [h0, s0, l0] = base, h = Math.round(h0), s = Math.round(s0), sd = Math.min(s, 85), sc = Math.min(s, 58);
  const r = (x) => Math.round(x * 10) / 10, C = (a, b) => accContrast(a.map(r), b);
  let l = r(Math.min(l0, 60)); while (l > 4 && C([h, s, l], ACC_INK.light) < ACC_MIN.text) l = r(l - 0.5);              // light: white text on it, which also clears the page
  let d = r(Math.min(Math.max(l0 + 20, 46), 80)); while (d < 96 && C([h, sd, d], ACC_INK.dark) < ACC_MIN.text) d = r(d + 0.5); // dark: near-black text on it
  let cl = d; const clfg = [h, Math.min(80, s), 8]; while (cl < 97 && C([h, sd, cl], clfg) < ACC_MIN.curtain) cl = r(cl + 0.5);
  let cd = 13; const cdfg = [h, Math.min(40, s), 92]; while (cd > 3 && C([h, sc, cd], cdfg) < ACC_MIN.curtain) cd = r(cd - 0.5);
  const out = { value: value.toLowerCase(), preset: false, l: accStr([h, s, l]), lfg: accStr(ACC_INK.light), d: accStr([h, sd, d]), dfg: accStr(ACC_INK.dark), cl: accStr([h, sd, cl]), clfg: accStr(clfg), cd: accStr([h, sc, cd]), cdfg: accStr(cdfg) };
  out.adjusted = Math.abs(l - l0) > 0.5 ? { from: value.toLowerCase(), to: accToHex(out.l) } : null;
  return out;
}
function accentChecks(t) {   // the five rules; tests and the picker both read this
  const c = (a, b) => Math.round(accContrast(a, b) * 10) / 10;
  return [
    { theme: 'light', what: 'Button text', ratio: c(t.lfg, t.l), min: ACC_MIN.text },
    { theme: 'light', what: 'Against the page', ratio: c(t.l, ACC_PAGE.l), min: ACC_MIN.ui },
    { theme: 'light', what: 'Curtain text', ratio: c(t.clfg, t.cl), min: ACC_MIN.curtain },
    { theme: 'dark', what: 'Button text', ratio: c(t.dfg, t.d), min: ACC_MIN.text },
    { theme: 'dark', what: 'Against the page', ratio: c(t.d, ACC_PAGE.d), min: ACC_MIN.ui },
    { theme: 'dark', what: 'Curtain text', ratio: c(t.cdfg, t.cd), min: ACC_MIN.curtain },
  ].map(x => ({ ...x, pass: x.ratio >= x.min }));
}
/* ACCENT-CORE-END */
function accentCss(t) {
  const L = '--primary:' + t.l + ';--ring:' + t.l + ';--primary-foreground:' + t.lfg + ';--curtain:' + t.cl + ';--curtain-fg:' + t.clfg;
  const D = '--primary:' + t.d + ';--ring:' + t.d + ';--primary-foreground:' + t.dfg + ';--curtain:' + t.cd + ';--curtain-fg:' + t.cdfg;
  // doubled :root outranks the product tokens wherever this style lands in the document
  return ':root:root{' + L + '}@media (prefers-color-scheme: dark){:root:root:not([data-theme="light"]){' + D + '}}:root:root[data-theme="dark"]{' + D + '}';
}
function accChip(value) { const t = deriveAccent(value) || deriveAccent(PRODUCT.accent || 'teal'); return { '--a-l': t.l, '--a-lfg': t.lfg, '--a-d': t.d, '--a-dfg': t.dfg }; }
function applyAccent(value) {   // sign-in, organisation switch, first load, and the moment the owner changes it
  const t = deriveAccent(value) || deriveAccent(PRODUCT.accent || 'teal');
  let el = document.getElementById('org-accent'); if (!el) { el = document.createElement('style'); el.id = 'org-accent'; document.head.appendChild(el); }
  const css = accentCss(t); el.textContent = css;
  try { localStorage.setItem(PRODUCT.storageKey + '-accent', css); } catch (e) {}
  return t;
}

const opt = (label, go_to = 'next') => ({ key: ulid('opt'), label, go_to });
const row = (label) => ({ key: ulid('row'), label });
function makeQuestion(type = 'single_choice', patch = {}) {
  const q = {
    key: ulid('q'), type, title: '', description: '', showDescription: false, required: false,
    logic: false, shuffle: false,
    options: [opt('Option 1')],
    scale: { min: 1, max: 5, min_label: '', max_label: '' },
    rating: { max: 5 },
    rows: [row('Row 1')], columns: [row('Column 1')],
    validation: { enabled: false, min: 1, max: null },
  };
  if (type === 'true_false') q.options = [opt('True'), opt('False')];
  return Object.assign(q, patch);
}
function makeSection(patch = {}) {
  return Object.assign({ key: ulid('sec'), title: '', description: '', time_limit_minutes: 5, next: 'auto', questions: [] }, patch);
}

/* ---------------------------------------------------------------- mock form (Kilima Retail is example data) */
const sec1 = makeSection({ title: 'About you', description: 'Tell us where you work. This decides which sections you see.', time_limit_minutes: 3 });
const sec2 = makeSection({ title: 'Product knowledge', description: 'Answer from memory. You cannot return to this section after it ends.', time_limit_minutes: 8 });
const sec3 = makeSection({ title: 'Feedback', description: '', time_limit_minutes: 4 });

sec1.questions = [
  makeQuestion('single_choice', { title: 'How long have you worked with Kilima Retail?', required: true, logic: true,
    options: [opt('Less than 2 weeks', sec3.key), opt('2 weeks to 6 months'), opt('More than 6 months')] }),
  makeQuestion('dropdown', { title: 'Which branch do you work at?', required: true,
    options: [opt('Arusha'), opt('Dar es Salaam (Kariakoo)'), opt('Dodoma'), opt('Mwanza')] }),
  makeQuestion('single_choice', { title: 'What is your role?', required: true,
    options: [opt('Cashier'), opt('Sales associate'), opt('Store supervisor'), opt('Stock controller')] }),
];
sec2.questions = [
  makeQuestion('multi_choice', { title: 'Which payment methods do our stores accept?', required: true, description: 'Select all that apply.', showDescription: true,
    options: [opt('Cash'), opt('M-Pesa'), opt('Tigo Pesa (Mixx by Yas)'), opt('Airtel Money'), opt('Bank card'), opt('Cheque')],
    validation: { enabled: true, min: 1, max: null } }),
  makeQuestion('true_false', { title: 'A customer can return opened electronics within 7 days if they have the receipt.', required: true }),
  makeQuestion('choice_grid', { title: 'How confident are you handling these situations?', required: true,
    rows: [row('Price disputes at the till'), row('Damaged goods returns'), row('Mobile money reversals')],
    columns: [row('Not confident'), row('Somewhat'), row('Very confident')] }),
];
sec3.questions = [
  makeQuestion('linear_scale', { title: "How useful was last month's product training?", required: true, scale: { min: 1, max: 5, min_label: 'Not useful', max_label: 'Very useful' } }),
  makeQuestion('rating', { title: "Rate your team's customer service this quarter.", rating: { max: 5 } }),
  makeQuestion('checkbox_grid', { title: 'Which shifts do you usually work?',
    rows: [row('Morning (07:00–15:00)'), row('Evening (13:00–21:00)')],
    columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(row) }),
];

