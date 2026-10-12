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

const ACCENTS = {
  teal:   { label: 'Teal',   l: '174 72% 26%', d: '170 62% 46%' },
  blue:   { label: 'Blue',   l: '221 83% 45%', d: '217 91% 64%' },
  violet: { label: 'Violet', l: '262 62% 50%', d: '262 80% 72%' },
  rose:   { label: 'Rose',   l: '346 72% 44%', d: '346 80% 66%' },
  amber:  { label: 'Amber',  l: '28 90% 36%',  d: '38 92% 56%' },
  slate:  { label: 'Slate',  l: '215 25% 27%', d: '215 20% 72%' },
};

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

