  /* ================================================================ EXAMPLE (the kit's worked example): its hooks into core parts.
     assemble.py loads this after the core parts, like any product module. A product replaces it with its own.
     P107: what the example's approvals do when they are decided. The engine (parts_appr.js) only calls apply / reject.
     P108: where New request picks a form from, and each form's owning location (the gate is given it: loc: form.loc). */
  const FORM_PICK = { module: 'forms', kind: 'form', label: 'Form', find: (id) => { const f = FORMS.find(x => x.id === id); return f && { label: f.title, loc: f.loc }; }, open: (id) => openForm(FORMS.find(x => x.id === id) || {}) };
  ['Forms.publish', 'Responses.export', 'Responses.void'].forEach(a => { ACTIONS[a].pick = FORM_PICK; });
  G.formLoc = (id) => (FORMS.find(x => x.id === id) || {}).loc;   /* for the Results view, outside the shell module */
  ACTIONS['Forms.publish'].apply = (req) => { if (req.subject.kind !== 'form') return; const f = FORMS.find(x => x.id === req.subject.id); if (f) { f.status = 'live'; f.closes = 'No close date'; } };
  ACTIONS['Responses.export'].apply = (req) => setTimeout(() => toast('Export ready for ' + nameOf(req.requester), (req.subject.meta || 'Excel') + '. Download link valid for 24 hours, also emailed.', 'FileSpreadsheet'), 900);
  ACTIONS['Responses.void'].apply = (req) => { if (req.subject.kind !== 'respondent' || typeof ResponsesMod === 'undefined') return; const r = ResponsesMod.RESP.find(x => x.id === req.subject.id); if (r) r.reset = true; };
