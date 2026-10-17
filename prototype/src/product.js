/* ---------------------------------------------------------------- PRODUCT: the only file a product edits for branding.
   Everything else in src/ is the platform shell (locked by the platform decisions in docs/PLATFORM_DECISIONS.md). */
const PRODUCT = {
  name: 'Fomu',                 // shown in the sidebar, sign-in, curtain and page titles
  tagline: 'Forms, results and approvals for every location',
  icon: 'ClipboardList',        // Lucide icon next to the name
  domain: 'fomu.app',           // used in copied links
  city: 'Dar es Salaam',        // footer
  storageKey: 'fomu',           // prefix for localStorage keys (theme, list views, recent searches, last accent)
  accent: 'teal',               // default brand colour: a preset key or '#rrggbb' (P42); the tokens in builder.html are its values
};
