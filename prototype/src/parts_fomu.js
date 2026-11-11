  /* ================================================================ FOMU (the kit's worked example): its hooks into core parts.
     assemble.py loads this after the core parts, like any product module. A product replaces it with its own.
     P107: what Fomu's approvals do when they are decided. The engine (parts_appr.js) only calls apply / reject. */
  ACTIONS['Forms.publish'].apply = (req) => { if (req.subject.kind !== 'form') return; const f = FORMS.find(x => x.id === req.subject.id); if (f) { f.status = 'live'; f.closes = 'No close date'; } };
  ACTIONS['Responses.export'].apply = (req) => setTimeout(() => toast('Export ready for ' + nameOf(req.requester), (req.subject.meta || 'Excel') + '. Download link valid for 24 hours, also emailed.', 'FileSpreadsheet'), 900);
  ACTIONS['Responses.void'].apply = (req) => { if (req.subject.kind !== 'respondent' || typeof ResponsesMod === 'undefined') return; const r = ResponsesMod.RESP.find(x => x.id === req.subject.id); if (r) r.reset = true; };
