/* ---------------------------------------------------------------- PRODUCT: the only file a product edits for branding.
   Everything else in src/ is the platform shell (locked by the platform decisions in docs/PLATFORM_DECISIONS.md). */
const PRODUCT = {
  name: 'Fomu',                 // shown in the sidebar, sign-in, curtain and page titles
  tagline: 'Forms, results and approvals for every location',
  icon: 'ClipboardList',        // Lucide icon next to the name, used when there is no logo
  logo: null,                   // P48: optional inline 24×24 SVG in currentColor (sidebar, sign-in, curtain, favicon)
  domain: 'fomu.app',           // used in copied links
  city: 'Dar es Salaam',        // footer
  storageKey: 'fomu',           // prefix for localStorage keys (theme, list views, recent searches, last accent)
  accent: 'teal',               // default brand colour: a preset key or '#rrggbb' (P46); the tokens in builder.html are its values
  signin: {                     // P48: the sign-in brand panel (wide screens)
    headline: 'Assessments and surveys your teams can trust.',
    points: [['Timer', 'Timed sections the server keeps honest'], ['ShieldCheck', 'Full screen, one tab, no copy and paste'], ['ChartBarBig', 'Live results, filters and Excel export']],
    art: 'FomuSignInArt',       // a registered component, or null for none
  },
};
