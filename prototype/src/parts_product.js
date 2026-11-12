  /* ================================================================ PRODUCT REGISTRY (P110): what the product gives the shell.
     assemble.py loads this file first, inside the shell module, because the shell builds its permission catalogue, its roles,
     its route check and its page titles from it as it starts. The kit's own modules (Users, Roles, Locations, Approvals,
     Reports, …) register themselves; this is only the product's. In the app: web/src/product/registry.ts (module manifests, P81).
       permissions   the product's Module.action catalogue (P21), merged into the shell's PERMS (before the core ones)
       roles         { <role id>: { perms, desc? } }: what each role gets of the product's permissions by default (merged into
                     ROLES before its core permissions); desc describes the role in the product's words. The Owner gets everything.
       detailRoutes  [{ route, title(G), parent? }]: the product's pages that live inside the shell (breadcrumb, Back). title is
                     the page title; parent is the menu route it belongs to (highlighted in the sidebar, its permission applies).
     This is Fomu's, the kit's worked example. A product replaces it with its own. */
  const PRODUCT_REGISTRY = {
    permissions: [
      { name: 'Forms.list', label: 'See forms', module: 'Forms' }, { name: 'Forms.create', label: 'Create and edit forms', module: 'Forms' }, { name: 'Forms.publish', label: 'Publish and close forms', module: 'Forms' }, { name: 'Forms.delete', label: 'Archive and delete forms', module: 'Forms' },
      { name: 'Templates.list', label: 'See templates', module: 'Forms' },
      { name: 'Responses.list', label: 'See results', module: 'Results' }, { name: 'Responses.export', label: 'Export results', module: 'Results' }, { name: 'Responses.void', label: 'Void responses and reset people', module: 'Results' },
    ],
    roles: {
      admin: { perms: ['Forms.list', 'Forms.create', 'Forms.publish', 'Templates.list', 'Responses.list', 'Responses.export', 'Responses.void'] },
      editor: { desc: 'Builds forms and works with results.', perms: ['Forms.list', 'Forms.create', 'Forms.publish', 'Templates.list', 'Responses.list', 'Responses.export'] },
      viewer: { desc: 'Reads results and reports only.', perms: ['Forms.list', 'Responses.list'] },
      supervisor: { desc: 'Custom role for branch heads: results and their locations.', perms: ['Forms.list', 'Responses.list', 'Responses.export'] },
      zone_manager: { desc: 'Custom role: runs a zone, its branches and their forms.', perms: ['Forms.list', 'Forms.create', 'Forms.publish', 'Templates.list', 'Responses.list', 'Responses.export', 'Responses.void'] },
      auditor: { desc: 'Custom role: reads results and exports them for audits.', perms: ['Forms.list', 'Responses.list', 'Responses.export'] },
    },
    detailRoutes: [],   /* Fomu's own pages (builder, results, respondent) are full-screen views outside the shell (assemble.py → App) */
  };
