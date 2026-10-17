
  /* ================================================================ LOCATIONS (Cobley core: locations tree + closure, user_locations with custom roles + JSON overrides) */
  const LTYPES = { org: { label: 'Organisation', icon: 'Building2' }, zone: { label: 'Zone', icon: 'Map' }, branch: { label: 'Branch', icon: 'Store' }, warehouse: { label: 'Warehouse', icon: 'Warehouse' }, office: { label: 'Office', icon: 'Briefcase' } };
  const LSTAT = { active: { label: 'Active', cls: 'bg-c1/15 text-foreground', dot: 'bg-c1' }, inactive: { label: 'Inactive', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60' } };
  const L = (id, name, code, type, parent, extra = {}) => ({ id, uuid: '9f' + id.padEnd(6, '0') + '-4c1e-8b2a-' + (id.length * 977).toString(16).padStart(4, '0') + 'e51d07a3', photo: '', notes: '', createdAt: '12 Mar 2025', createdBy: 'amina.juma@kilimaretail.co.tz', updatedAt: '2 Oct 2026', updatedBy: 'neema.kimaro@kilimaretail.co.tz', id, name, code, type, parent, status: 'active', country: 'Tanzania', sales: type === 'branch', hours: type === 'branch' ? 'Mon–Sat 08:00–20:00, Sun 10:00–16:00' : 'Mon–Fri 08:00–17:00', resp: 0, spark: null, ...extra });
  const LOCS = reactive({
    k: [
      L('k0', 'Kilima Retail', 'KR', 'org', null, { region: 'Dar es Salaam', district: 'Ilala', ward: 'Kivukoni', address: 'Samora Avenue, Plot 12', phone: '+255 22 211 0400', email: 'info@kilimaretail.co.tz', lat: -6.8163, lng: 39.2894 }),
      L('ho', 'Head Office', 'HO', 'office', 'k0', { region: 'Dar es Salaam', district: 'Ilala', ward: 'Kivukoni', address: 'Samora Avenue, Plot 12, 4th floor', phone: '+255 22 211 0400', email: 'office@kilimaretail.co.tz', lat: -6.8163, lng: 39.2894, resp: 41, spark: [2, 5, 3, 6, 4, 5, 3, 4, 5, 4] }),
      L('nz', 'Northern Zone', 'NZ', 'zone', 'k0', { region: 'Arusha', district: 'Arusha City', ward: 'Kati', address: 'Sokoine Road, Plot 88', phone: '+255 27 254 1100', email: 'north@kilimaretail.co.tz', lat: -3.3667, lng: 36.6833 }),
      L('aru', 'Arusha Branch', 'ARU-01', 'branch', 'nz', { photo: 'm1', notes: '<p>Entrance faces <strong>Sokoine Road</strong>, next to the CRDB branch. Parking behind the building.</p><ul><li>Loading bay opens 06:00</li><li>Ask for the supervisor at the service desk</li></ul>', updatedBy: 'baraka.mushi@kilimaretail.co.tz', region: 'Arusha', district: 'Arusha City', ward: 'Kati', address: 'Sokoine Road, Plot 90', phone: '+255 27 254 1120', email: 'arusha@kilimaretail.co.tz', lat: -3.3690, lng: 36.6880, resp: 96, spark: [6, 9, 8, 12, 10, 11, 9, 10, 12, 9] }),
      L('aruw', 'Arusha Warehouse', 'ARU-W1', 'warehouse', 'aru', { region: 'Arusha', district: 'Arusha City', ward: 'Unga Limited', address: 'Njiro Industrial Area', phone: '+255 27 254 1190', email: 'arusha.wh@kilimaretail.co.tz', sales: false, resp: 12, spark: [1, 1, 2, 1, 0, 2, 1, 2, 1, 1] }),
      L('msh', 'Moshi Branch', 'MSH-01', 'branch', 'nz', { region: 'Kilimanjaro', district: 'Moshi Municipal', ward: 'Mawenzi', address: 'Kibo Road, Plot 7', phone: '+255 27 275 0300', email: 'moshi@kilimaretail.co.tz', lat: -3.3500, lng: 37.3333, resp: 58, spark: [4, 6, 5, 7, 6, 5, 7, 6, 6, 6] }),
      L('lz', 'Lake Zone', 'LZ', 'zone', 'k0', { region: 'Mwanza', district: 'Nyamagana', ward: 'Pamba', address: 'Kenyatta Road, Plot 21', phone: '+255 28 250 2000', email: 'lake@kilimaretail.co.tz', lat: -2.5164, lng: 32.9175 }),
      L('mwz', 'Mwanza Branch', 'MWZ-01', 'branch', 'lz', { region: 'Mwanza', district: 'Nyamagana', ward: 'Pamba', address: 'Kenyatta Road, Plot 23', phone: '+255 28 250 2010', email: 'mwanza@kilimaretail.co.tz', lat: -2.5170, lng: 32.9010, resp: 77, spark: [5, 7, 8, 6, 9, 8, 7, 9, 10, 8] }),
      L('shy', 'Shinyanga Branch', 'SHY-01', 'branch', 'lz', { status: 'inactive', region: 'Shinyanga', district: 'Shinyanga Municipal', ward: 'Kambarage', address: 'Opens January 2027', phone: '', email: 'shinyanga@kilimaretail.co.tz' }),
      L('cz', 'Coastal Zone', 'CZ', 'zone', 'k0', { region: 'Dar es Salaam', district: 'Kinondoni', ward: 'Msasani', address: 'Haile Selassie Road, Plot 4', phone: '+255 22 260 1500', email: 'coast@kilimaretail.co.tz', lat: -6.7500, lng: 39.2700 }),
      L('kko', 'Kariakoo Branch', 'DAR-01', 'branch', 'cz', { region: 'Dar es Salaam', district: 'Ilala', ward: 'Kariakoo', address: 'Msimbazi Street, Plot 31', phone: '+255 22 218 3300', email: 'kariakoo@kilimaretail.co.tz', lat: -6.8190, lng: 39.2720, resp: 134, spark: [12, 14, 13, 15, 12, 14, 16, 13, 12, 13] }),
      L('mlc', 'Mlimani City Branch', 'DAR-02', 'branch', 'cz', { region: 'Dar es Salaam', district: 'Ubungo', ward: 'Ubungo', address: 'Mlimani City Mall, Shop 112', phone: '+255 22 277 4100', email: 'mlimani@kilimaretail.co.tz', lat: -6.7720, lng: 39.2280, resp: 108, spark: [9, 10, 12, 11, 10, 12, 11, 10, 12, 11] }),
    ],
    w: [
      L('w0', 'Kilima Wholesale', 'KW', 'org', null, { region: 'Dar es Salaam', district: 'Temeke', ward: 'Kurasini', address: 'Mandela Road, Plot 3', phone: '+255 22 286 0010', email: 'info@kilimawholesale.co.tz' }),
      L('wdc', 'Dar Distribution Centre', 'KW-DC1', 'warehouse', 'w0', { region: 'Dar es Salaam', district: 'Temeke', ward: 'Kurasini', address: 'Mandela Road, Plot 5', phone: '+255 22 286 0020', email: 'dc1@kilimawholesale.co.tz', resp: 38, spark: [3, 4, 4, 3, 5, 4, 3, 4, 4, 4] }),
      L('wad', 'Arusha Depot', 'KW-ARD', 'warehouse', 'w0', { region: 'Arusha', district: 'Arusha City', ward: 'Unga Limited', address: 'Njiro Road, Plot 14', phone: '+255 27 254 7700', email: 'arusha@kilimawholesale.co.tz', resp: 17, spark: [1, 2, 2, 1, 2, 2, 1, 2, 2, 2] }),
    ],
    p: [
      L('p0', 'Pwani Agro Dealers', 'PAD', 'org', null, { region: 'Pwani', district: 'Kibaha', ward: 'Tumbi', address: 'Morogoro Road, Plot 9', phone: '+255 23 240 2100', email: 'info@pwaniagro.co.tz' }),
      L('pbg', 'Bagamoyo Shop', 'PAD-BG', 'branch', 'p0', { region: 'Pwani', district: 'Bagamoyo', ward: 'Dunda', address: 'India Street, Plot 2', phone: '+255 23 244 0050', email: 'bagamoyo@pwaniagro.co.tz', resp: 61, spark: [5, 6, 7, 6, 5, 7, 6, 6, 7, 6] }),
      L('pkb', 'Kibaha Shop', 'PAD-KB', 'branch', 'p0', { region: 'Pwani', district: 'Kibaha', ward: 'Tumbi', address: 'Morogoro Road, Plot 11', phone: '+255 23 240 2150', email: 'kibaha@pwaniagro.co.tz', resp: 44, spark: [4, 4, 5, 4, 4, 5, 4, 5, 4, 5] }),
    ],
  });
  const A = (email, loc, roles = [], extra = {}) => ({ id: ulid('ul'), email, loc, roles, primary: false, granted: [], denied: [], since: 'Mar 2026', ...extra });
  const ASSIGN = reactive({
    k: [
      A('amina.juma@kilimaretail.co.tz', 'ho', [], { primary: true, since: 'Jan 2025' }),
      A('neema.kimaro@kilimaretail.co.tz', 'ho', [], { primary: true, since: 'Feb 2025' }),
      A('baraka.mushi@kilimaretail.co.tz', 'nz', ['zone_manager'], { primary: true, since: 'Jun 2025' }),
      A('baraka.mushi@kilimaretail.co.tz', 'aru', ['supervisor'], { since: 'Aug 2025' }),
      A('rehema.mrema@kilimaretail.co.tz', 'mwz', ['supervisor'], { primary: true }),
      A('rehema.mrema@kilimaretail.co.tz', 'shy', ['auditor'], { since: 'Sep 2026' }),
      A('hamisi.swai@kilimaretail.co.tz', 'aru', ['supervisor'], { primary: true, granted: ['Responses.void'], denied: ['Responses.export'] }),
      A('upendo.lyimo@kilimaretail.co.tz', 'kko', ['auditor'], { primary: true, since: 'Oct 2026' }),
    ],
    w: [
      A('juma@kilimawholesale.co.tz', 'w0', [], { primary: true }), A('amina.juma@kilimaretail.co.tz', 'w0', [], { primary: true }),
      A('saidi@kilimawholesale.co.tz', 'wdc', ['supervisor'], { primary: true }), A('asha@kilimawholesale.co.tz', 'wad', ['auditor'], { primary: true }),
    ],
    p: [
      A('godfrey@pwaniagro.co.tz', 'p0', [], { primary: true }), A('happiness@pwaniagro.co.tz', 'pbg', ['supervisor'], { primary: true }), A('amina.juma@kilimaretail.co.tz', 'p0', [], { primary: true }),
    ],
  });
  /* P45: recent activity belongs to one organisation; each entry names the location it happened at (null = the organisation itself) */
  const ACTIVITY = reactive({
    k: [
      { icon: 'Send', text: 'Form published', who: 'Baraka Mushi', when: '2h ago', what: 'Customer Feedback: Mwanza Branch', loc: 'mwz' },
      { icon: 'UserPlus', text: 'Person assigned', who: 'Neema Kimaro', when: 'Yesterday', what: 'Branch auditor, Arusha Branch', loc: 'aru' },
      { icon: 'FileSpreadsheet', text: 'Results exported', who: 'Hamisi Swai', when: '3 days ago', what: 'Solar Home Systems training, xlsx', loc: 'nz' },
      { icon: 'Pencil', text: 'Opening hours changed', who: 'Baraka Mushi', when: 'Last week', what: 'Kariakoo Branch', loc: 'kko' },
      { icon: 'Shield', text: 'Role changed', who: 'Amina Juma', when: 'Last week', what: 'Supervisor', loc: null },
    ],
    w: [
      { icon: 'Send', text: 'Form published', who: 'Juma Mrema', when: 'Today', what: 'Distributor Credit Application Review', loc: null },
      { icon: 'ClipboardCheck', text: 'Inspection submitted', who: 'Saidi Ngowi', when: 'Yesterday', what: 'Warehouse Safety Inspection', loc: 'wdc' },
      { icon: 'Lock', text: 'Form closed', who: 'Amina Juma', when: 'Last week', what: 'Quarterly Stock Count Sign-off', loc: 'wad' },
    ],
    p: [
      { icon: 'UserPlus', text: 'Person assigned', who: 'Godfrey Laizer', when: '3 days ago', what: 'Shop supervisor, Bagamoyo Shop', loc: 'pbg' },
    ],
  });
  /* the organisation's feed, narrowed to a location's subtree (location page) and to what the viewer can see (View as, P23) */
  const activityOf = (locId) => { const ids = locId ? new Set(subtreeIds(locId)) : null; return (ACTIVITY[G.org.id] || []).filter(e => (!ids || (e.loc && ids.has(e.loc))) && (!e.loc || inScope(e.loc))).slice(0, 5); };
  const logActivity = (e) => { (ACTIVITY[G.org.id] || (ACTIVITY[G.org.id] = [])).unshift({ who: ME.name, when: 'Just now', loc: null, what: '', ...e }); };

  const locsOf = () => LOCS[G.org.id] || (LOCS[G.org.id] = [L(G.org.id + '0', G.org.name, G.org.initial, 'org', null, { region: 'Dar es Salaam' })]);
  const assignsOf = () => ASSIGN[G.org.id] || (ASSIGN[G.org.id] = []);
  const locById = (id) => locsOf().find(l => l.id === id);
  const childrenOf = (id) => locsOf().filter(l => l.parent === id);
  const ancestorsOf = (id) => { const out = []; let l = locById(id); while (l && l.parent) { l = locById(l.parent); if (l) out.unshift(l); } return out; };
  const descendantsOf = (id) => { const out = []; const walk = (p) => childrenOf(p).forEach(c => { out.push(c); walk(c.id); }); walk(id); return out; };
  const subtreeIds = (id) => [id, ...descendantsOf(id).map(d => d.id)];
  const depthOf = (id) => ancestorsOf(id).length;
  /* Preview as a role (D37): a synthetic person who holds the chosen main role + custom role at a location, never listed anywhere */
  const PREVIEW_EMAIL = '__role_preview__';
  const memberByEmail = (e) => e === PREVIEW_EMAIL ? (G.viewAs && G.viewAs.member) : MEMBERS.find(m => m.email === e);
  const initials = (n) => n.split(' ').map(x => x[0]).join('').slice(0, 2);
  const respOf = (id) => subtreeIds(id).reduce((a, i) => a + (locById(i).resp || 0), 0);
  const sparkOf = (id) => { const out = Array(10).fill(0); subtreeIds(id).forEach(i => (locById(i).spark || []).forEach((v, k) => out[k] += v)); return out; };
  const usersAt = (id) => assignsOf().filter(a => a.loc === id && a.email !== PREVIEW_EMAIL);
  const peopleIn = (id) => new Set(assignsOf().filter(a => subtreeIds(id).includes(a.loc) && a.email !== PREVIEW_EMAIL).map(a => a.email)).size;
  const formsAt = (id, inc = false) => FORMS.filter(f => f.loc && (inc ? subtreeIds(id).includes(f.loc) : f.loc === id));
  const customRoles = computed(() => ROLES.filter(r => !r.system));
  const primaryOf = (email) => { const a = assignsOf().find(x => x.email === email && x.primary) || assignsOf().find(x => x.email === email); return a ? locById(a.loc) : null; };

  /* D21: main role ∪ custom roles at the location and its ancestors ∪ granted − denied (deny wins) */
  function effectiveAt(email, locId, draft) {
    const m = memberByEmail(email); const main = m ? roleById(m.role) : null;
    const chain = [...ancestorsOf(locId).map(l => l.id), locId];
    const rows = assignsOf().filter(a => a.email === email && chain.includes(a.loc)).map(a => draft && a.id === draft.id ? { ...a, ...draft } : a);
    const src = {}; const add = (p, s) => (src[p] = src[p] || []).push(s);
    if (main) main.perms.forEach(p => add(p, 'Main role · ' + main.name));
    rows.forEach(a => { const at = a.loc === locId ? '' : ' at ' + locById(a.loc).name; a.roles.forEach(rid => { const r = roleById(rid); if (r) r.perms.forEach(p => add(p, r.name + at)); }); a.granted.forEach(p => add(p, 'Granted' + at)); });
    const denied = new Set(rows.flatMap(a => a.denied));
    return { src, denied, perms: Object.keys(src).filter(p => !denied.has(p)) };
  }
  function viewAsPerms(email) {
    const rows = assignsOf().filter(a => a.email === email);
    if (!rows.length) { const m = memberByEmail(email); return m ? roleById(m.role).perms : []; }
    return [...new Set(rows.flatMap(a => effectiveAt(email, a.loc).perms))];
  }
  /* Managers see only their own locations (and everything under them); owners and admins see all */
  function scopeOf(email) {
    const m = memberByEmail(email); if (!m || ['owner', 'admin'].includes(m.role)) return null;
    const ids = new Set(); assignsOf().filter(a => a.email === email).forEach(a => subtreeIds(a.loc).forEach(i => ids.add(i))); return ids;
  }
  const myScope = computed(() => G.viewAs ? scopeOf(G.viewAs.email) : null);
  const inScope = (id) => !myScope.value || myScope.value.has(id);
  /* D23: org-wide forms for everyone; location forms for people at that location (or below it when include_descendants) */
  function formVisible(f) {
    if (!myScope.value || !f.loc) return true;
    if (myScope.value.has(f.loc)) return true;
    const mine = assignsOf().filter(a => a.email === G.viewAs.email).map(a => a.loc);
    return !!f.inc && mine.some(l => ancestorsOf(l).some(x => x.id === f.loc));
  }
  const locName = (f) => f.loc ? (locById(f.loc) || {}).name : '';
  const audienceOf = (f) => !f.priv ? { icon: 'Globe', label: 'Public link' } : f.loc ? { icon: 'Users', label: locName(f) + (f.inc ? ' and below' : '') + ' + invited' } : { icon: 'Lock', label: 'Invited only' };

  /* D24: View as (read-only, audited) */
  const canViewAs = () => !G.viewAs && (roleById(G.org.role) || { perms: [] }).perms.includes('Users.impersonate');
  function startViewAs(email, locId) {
    const m = memberByEmail(email); if (!m) return;
    G.viewAs = { email, name: m.name, role: m.role, loc: locId || (primaryOf(email) || {}).id, back: G.route };
    G.viewAsPick = false;
    nav('forms');
    setTimeout(() => toast('Viewing as ' + m.name, 'Read-only. Nothing is saved or sent. This session is in the audit log.', 'Eye'), 500);
  }
  function startRolePreview(mainRole, customRole, locId) {
    const custom = customRole ? roleById(customRole) : null; const loc = locById(locId);
    const label = custom ? custom.name + ' at ' + loc.name : ROLE[mainRole] + (loc && loc.parent ? ' at ' + loc.name : '');
    if (custom) assignsOf().push({ id: 'ul_preview', email: PREVIEW_EMAIL, loc: locId, roles: [customRole], primary: true, granted: [], denied: [], since: 'Preview' });
    G.viewAs = { kind: 'role', email: PREVIEW_EMAIL, name: label, role: mainRole, loc: locId, back: G.route, member: { name: label, email: PREVIEW_EMAIL, role: mainRole, twofa: true, preview: true } };
    G.viewAsPick = false; nav('dashboard');
    setTimeout(() => toast('Previewing ' + label, 'What anyone with this role would see. Read-only, nothing is saved.', 'ScanEye'), 500);
  }
  function exitViewAs() { const list = assignsOf(); const i = list.findIndex(a => a.email === PREVIEW_EMAIL); if (i >= 0) list.splice(i, 1); const back = G.viewAs && G.viewAs.back; G.viewAs = null; nav(back && G.isShell(back) ? back : 'forms'); toast('Back to your own view', '', 'EyeOff'); }
  const readOnly = () => { toast('Read-only while viewing as someone', 'Exit View as to make changes.', 'Lock'); };
  function openLoc(id, tab) { G.locId = id; nav('location', tab); }

  /* ---------- New location dialog */
  const NewLocationDialog = {
    setup() {
      const N = reactive({ name: '', code: '', type: 'branch', parent: '', tried: false });
      const draft = useFormDraft({ module: 'Locations', title: () => 'New location: ' + (N.name.trim() || 'untitled'), getPayload: () => ({ name: N.name, code: N.code, type: N.type, parent: N.parent }), applyPayload: (p) => Object.assign(N, p) });
      watch(() => [N.name, N.code, N.type, N.parent], () => draft.touch());
      watch(() => G.newLoc, (v) => { if (v) { Object.assign(N, { name: '', code: '', type: 'branch', parent: typeof v === 'string' ? v : locsOf()[0].id, tried: false }); draft.D.key = null; draft.D.state = 'idle'; nextTick(() => { draft.arm(); if (v && v.draft) { const d = DRAFTS.find(x => x.key === v.draft); if (d) draft.resume(d); } }); } });
      const types = Object.entries(LTYPES).filter(([k]) => k !== 'org').map(([value, t]) => ({ value, label: t.label, icon: t.icon }));
      const ok = computed(() => N.name.trim().length > 1 && N.code.trim() && N.parent);
      function close() { draft.flush(); G.newLoc = false; if (draft.D.state === 'dirty' || draft.D.state === 'saved') toast('Draft kept', 'Resume it from this form or from My drafts.', 'History'); }
      function save() { N.tried = true; if (!ok.value) return; const id = ulid('loc'); const p = locById(N.parent); locsOf().push(L(id, N.name.trim(), N.code.trim().toUpperCase(), N.type, N.parent, { region: p.region, district: p.district, ward: '', address: '', phone: '', email: '' })); draft.onSuccess(); G.newLoc = false; toast('Location created', `Under ${p.name}. ${depthOf(id) + 1} closure rows written.`, 'MapPin'); openLoc(id, 'details'); }
      function createParent(q) { toast('Opens New location for the parent', q ? 'Prefilled with "' + q + '".' : '', 'Info'); }
      return { G, N, types, ok, save, close, draft, createParent };
    },
    template: `<Dialog :open="!!G.newLoc" @update:open="v => { if (!v) close() }">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">New location</h2><p class="text-sm text-muted-foreground">It inherits people and roles from its parent. Add address and contacts after.</p></div>
      <form class="grid grid-cols-[minmax(0,1fr)] gap-3" @submit.prevent="save">
        <DraftBanner :draft="draft"/>
        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]"><div class="grid gap-1.5"><label for="nl-n" class="text-sm font-medium after:ml-0.5 after:text-destructive after:content-['*']">Name</label><Input id="nl-n" v-model="N.name" placeholder="Dodoma Branch"/><p v-if="N.tried && N.name.trim().length < 2" class="text-xs text-destructive">Give it a name.</p></div>
          <div class="grid gap-1.5"><label for="nl-c" class="text-sm font-medium after:ml-0.5 after:text-destructive after:content-['*']">Code</label><Input id="nl-c" v-model="N.code" placeholder="DOD-01" class="font-mono uppercase"/><p v-if="N.tried && !N.code.trim()" class="text-xs text-destructive">Add a code.</p></div></div>
        <div class="grid gap-1.5"><span class="text-sm font-medium">Type</span><Select v-model="N.type" :options="types"/></div>
        <ApiSelect v-model="N.parent" module="locations" label="Parent" required placeholder="Choose a parent" :error="N.tried && !N.parent ? 'Choose where it sits.' : ''" @create="createParent"/>
        <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end"><DraftStatus :draft="draft"/><Button type="button" variant="outline" @click="close">Cancel</Button><Button type="submit"><Icon name="Plus" :size="14"/>Create location</Button></div>
      </form></Dialog>`
  };

  /* ---------- Locations list: tree table (cards on phones) */
  const LocationsPage = {
    setup() {
      const S = reactive({ open: {} });
      locsOf().filter(l => depthOf(l.id) < 1).forEach(l => S.open[l.id] = true);
      watch(() => G.org.id, () => { S.open = {}; locsOf().filter(l => depthOf(l.id) < 1).forEach(l => S.open[l.id] = true); });
      const LS = useList({ noun: 'locations', rows: () => locsOf().filter(l => inScope(l.id)), search: (l, q) => (l.name + ' ' + l.code + ' ' + (l.region || '')).toLowerCase().includes(q), sort: 'tree',
        sorts: [{ value: 'tree', label: 'Name', get: l => l.name.toLowerCase() }, { value: 'resp', label: 'Responses', get: l => respOf(l.id) }, { value: 'people', label: 'People', get: l => usersAt(l.id).length }, { value: 'code', label: 'Code', get: l => l.code }],
        fields: () => [
          { key: 'type', label: 'Type', type: 'select', options: Object.entries(LTYPES).map(([value, t]) => ({ value, label: t.label })), get: l => l.type },
          { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], get: l => l.status },
          { key: 'region', label: 'Region', type: 'select', options: [...new Set(locsOf().map(l => l.region).filter(Boolean))].sort().map(r => ({ value: r, label: r })), get: l => l.region },
          { key: 'sales', label: 'Sells to public', type: 'boolean', get: l => l.sales ? 'yes' : 'no' },
          { key: 'people', label: 'People here', type: 'number', get: l => usersAt(l.id).length },
        ] });
      const statusTabs = computed(() => { const v = locsOf().filter(l => inScope(l.id)); return [{ value: 'all', label: 'All', count: v.length }, { value: 'active', label: 'Active', count: v.filter(l => l.status === 'active').length }, { value: 'inactive', label: 'Inactive', count: v.filter(l => l.status === 'inactive').length }]; });
      const quick = computed({ get: () => { const f = LS.S.filters.status; return !f ? 'all' : (f.op === 'in' && f.value.length === 1) ? f.value[0] : ''; }, set: v => LS.setFilter('status', v === 'all' ? null : { op: 'in', value: [v] }) });
      const filtering = computed(() => (G.search || '').trim().length > 0 || LS.activeCount.value > 0);
      const matched = computed(() => new Set(LS.rows.value.map(l => l.id)));
      const sib = (arr) => { const sd = LS.sorts.find(x => x.value === LS.S.sort); return [...arr].sort((a, b) => { const A = sd.get(a), B = sd.get(b); return (A > B ? 1 : A < B ? -1 : 0) * (LS.S.dir === 'asc' ? 1 : -1); }); };
      const rows = computed(() => {
        const all = locsOf().filter(l => inScope(l.id));
        const roots = all.filter(l => !l.parent || !inScope(l.parent));
        const keep = new Set();
        if (filtering.value) all.filter(l => matched.value.has(l.id)).forEach(l => { keep.add(l.id); ancestorsOf(l.id).forEach(a => keep.add(a.id)); });
        const out = [];
        const walk = (l, d) => {
          if (filtering.value && !keep.has(l.id)) return;
          const kids = sib(childrenOf(l.id).filter(c => inScope(c.id)));
          out.push({ l, d, kids: kids.length, dim: filtering.value && !matched.value.has(l.id) });
          if (filtering.value || S.open[l.id]) kids.forEach(c => walk(c, d + 1));
        };
        sib(roots).forEach(r => walk(r, 0));
        return out;
      });
      watchEffect(() => { if (G.view === 'locations') listCount.value = (G.search || '').trim().length >= 2 ? matched.value.size : null; });
      const kpi = computed(() => { const v = locsOf().filter(l => inScope(l.id)); const ids = new Set(v.map(l => l.id)); return { total: v.length, active: v.filter(l => l.status === 'active').length, branches: v.filter(l => l.type === 'branch').length, people: new Set(assignsOf().filter(a => ids.has(a.loc)).map(a => a.email)).size, forms: FORMS.filter(f => f.loc && ids.has(f.loc)).length, resp: v.reduce((a, l) => a + (l.resp || 0), 0) }; });
      function toggle(id) { S.open[id] = !S.open[id]; }
      function expandAll(v) { locsOf().forEach(l => S.open[l.id] = v); }
      const allOpen = computed(() => locsOf().filter(l => childrenOf(l.id).length).every(l => S.open[l.id]));
      const canManageLoc = () => canManage() && myPerms.value.includes('Locations.manage');
      const menu = (l) => [{ id: 'open', label: 'Open', icon: 'ArrowUpRight' }, { id: 'users', label: 'People here', icon: 'Users' }, { id: 'forms', label: 'Forms here', icon: 'ClipboardList' },
        ...(canManageLoc() ? [{ separator: true }, { id: 'child', label: 'Add child location', icon: 'CirclePlus' }, ...(l.parent ? [{ id: 'status', label: l.status === 'active' ? 'Deactivate' : 'Activate', icon: l.status === 'active' ? 'Ban' : 'CircleCheck', destructive: l.status === 'active' }] : [])] : [])];
      function onMenu(l, it) {
        if (it.id === 'open') openLoc(l.id); if (it.id === 'users') openLoc(l.id, 'users'); if (it.id === 'forms') openLoc(l.id, 'forms');
        if (it.id === 'child') G.newLoc = l.id;
        if (it.id === 'status') { l.status = l.status === 'active' ? 'inactive' : 'active'; toast(l.name + (l.status === 'active' ? ' activated' : ' deactivated'), l.status === 'inactive' ? 'Its forms stop accepting responses. People keep their roles.' : '', l.status === 'active' ? 'CircleCheck' : 'Ban'); }
      }
      // P40 columns over the tree rows ({ l, d, kids, dim }): identity is indented by depth (P19 tree), status folds right
      const cols = [
        { key: 'name', label: 'Location', identity: true, priority: 1, min: 260, text: r => r.l.name, indent: r => r.d * 18 },
        { key: 'type', label: 'Type', priority: 4, min: 110, fold: 'meta', text: r => LTYPES[r.l.type].label },
        { key: 'people', label: 'People here', priority: 3, min: 120, fold: 'meta', text: r => usersAt(r.l.id).length + ' people' },
        { key: 'forms', label: 'Forms', priority: 5, min: 70, fold: 'meta', right: true, text: r => formsAt(r.l.id).length + ' forms' },
        { key: 'resp', label: 'Responses, 30d', short: '30d', priority: 6, min: 120, fold: 'meta', right: true, text: r => (respOf(r.l.id) || 0) + ' responses, 30d' },
        { key: 'status', label: 'Status', status: true, priority: 2, min: 100, text: r => LSTAT[r.l.status].label },
      ];
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });   // P39: search, sort and filters live in the link
      return { LS, cols, quick, G, S, LTYPES, LSTAT, statusTabs, rows, kpi, toggle, expandAll, allOpen, menu, onMenu, openLoc, usersAt, formsAt, respOf, filtering, canManageLoc, memberByEmail, initials };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Locations</h2><p class="text-sm text-muted-foreground">{{ G.viewAs ? 'Only the locations ' + G.viewAs.name.split(' ')[0] + ' is assigned to, and everything under them.' : 'Every place in ' + G.org.name + ', from the organisation down to warehouses.' }}</p></div>
      </div>
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Locations</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="MapPin" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.total }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ kpi.active }} active · {{ kpi.branches }} branches</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">People assigned</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Users" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.people }}</p><p class="mt-1 text-[11px] text-muted-foreground">Across all locations shown</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Location forms</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="ClipboardList" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.forms }}</p><p class="mt-1 text-[11px] text-muted-foreground">Owned by a location</p></div>
        <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Responses, 30 days</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Inbox" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.resp }}</p><p class="mt-1 text-[11px] text-muted-foreground">Snapshotted per location</p></div>
      </div>
      <ListCard :list="LS" :tabs="statusTabs" v-model:quick="quick">
        <template #actions><Tooltip :content="allOpen ? 'Collapse all' : 'Expand all'" side="left"><Button variant="ghost" size="sm" class="w-8 px-0" :disabled="filtering" @click="expandAll(!allOpen)" :aria-label="allOpen ? 'Collapse all' : 'Expand all'"><Icon :name="allOpen ? 'ChevronsDownUp' : 'ChevronsUpDown'" :size="15"/></Button></Tooltip>
        <Button v-if="canManageLoc()" size="sm" @click="G.newLoc = true"><Icon name="Plus" :size="15"/>New<span class="hidden sm:inline"> location</span></Button></template>
        <ListRows v-if="rows.length" :list="LS" :rows="rows" :columns="cols" :row-key="r => r.l.id" :base-meta="r => [r.l.code, r.l.region].filter(Boolean).join(' · ')" :row-class="r => r.dim ? 'opacity-55' : ''" @open="r => openLoc(r.l.id)">
          <template #icon="{ row: r }"><span class="flex items-center gap-1"><button v-if="r.kids" type="button" @click.stop="toggle(r.l.id)" :disabled="filtering" class="grid h-10 w-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60" :aria-expanded="filtering || !!S.open[r.l.id]" :aria-label="(S.open[r.l.id] ? 'Collapse ' : 'Expand ') + r.l.name"><Icon name="ChevronRight" :size="14" :class="['transition-transform duration-200', (filtering || S.open[r.l.id]) ? 'rotate-90' : '']"/></button><span v-else class="w-6"></span>
            <span :class="['grid h-10 w-10 place-items-center rounded-lg', r.l.type==='org' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary']"><Icon :name="LTYPES[r.l.type].icon" :size="17"/></span></span></template>
          <template #cell-people="{ row: r }"><div v-if="usersAt(r.l.id).length" class="flex items-center"><span v-for="(a, i) in usersAt(r.l.id).slice(0, 3)" :key="a.id" class="-ml-1.5 grid h-6 w-6 place-items-center rounded-full bg-muted text-[9px] font-semibold uppercase ring-2 ring-card first:ml-0" :title="(memberByEmail(a.email)||{}).name">{{ initials((memberByEmail(a.email)||{name:'?'}).name) }}</span><span v-if="usersAt(r.l.id).length > 3" class="ml-1.5 text-xs text-muted-foreground">+{{ usersAt(r.l.id).length - 3 }}</span></div><span v-else class="text-muted-foreground">–</span></template>
          <template #cell-forms="{ row: r }">{{ formsAt(r.l.id).length || '–' }}</template>
          <template #cell-resp="{ row: r }">{{ respOf(r.l.id) || '–' }}</template>
          <template #cell-status="{ row: r }"><span :class="['inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium', LSTAT[r.l.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', LSTAT[r.l.status].dot]"></span>{{ LSTAT[r.l.status].label }}</span></template>
          <template #actions="{ row: r }"><DropdownMenu :items="menu(r.l)" @select="it => onMenu(r.l, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + r.l.name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></template>
        </ListRows>
        <div v-else class="grid place-items-center p-10 text-center"><Icon name="MapPinOff" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">No locations match</p><p class="text-sm text-muted-foreground">Try other filters, or clear the search.</p><Button class="mt-3" variant="outline" size="sm" @click="G.search=''; LS.clearAll()">Clear search and filters</Button></div>
      </ListCard>
      <NewLocationDialog/>
    </div>`
  };

  /* ---------- Assignment editor (sheet): custom roles, primary flag, JSON grants/denies with effective preview */
  const AssignSheet = {
    setup() {
      const E = reactive({ roles: [], primary: false, ov: {} });
      const row = computed(() => G.assignEdit && assignsOf().find(a => a.id === G.assignEdit));
      watch(row, (a) => { if (a) { E.roles = [...a.roles]; E.primary = a.primary; E.ov = {}; a.granted.forEach(p => E.ov[p] = 'grant'); a.denied.forEach(p => E.ov[p] = 'deny'); } }, { immediate: true });
      const person = computed(() => row.value && memberByEmail(row.value.email));
      const loc = computed(() => row.value && locById(row.value.loc));
      const draftEff = computed(() => {
        if (!row.value) return { src: {}, denied: new Set() };
        const a = row.value;
        return effectiveAt(a.email, a.loc, { id: a.id, roles: E.roles, granted: Object.keys(E.ov).filter(k => E.ov[k] === 'grant'), denied: Object.keys(E.ov).filter(k => E.ov[k] === 'deny') });
      });
      const modules = computed(() => { const out = {}; PERMS.forEach(p => (out[p.module] = out[p.module] || []).push(p)); return Object.entries(out); });
      const changed = computed(() => Object.keys(E.ov).length);
      const setOv = (p, v) => { if (v === 'inherit') delete E.ov[p]; else E.ov[p] = v; };
      function save() {
        if (G.viewAs) return readOnly(); const a = row.value;
        if (E.primary && !a.primary) assignsOf().filter(x => x.email === a.email).forEach(x => x.primary = false);
        a.roles = [...E.roles]; a.primary = E.primary; a.granted = Object.keys(E.ov).filter(k => E.ov[k] === 'grant'); a.denied = Object.keys(E.ov).filter(k => E.ov[k] === 'deny');
        G.assignEdit = null; toast('Assignment saved', `${person.value.name} at ${loc.value.name}. Logged with before and after.`, 'ShieldCheck');
      }
      const toggleRole = (id) => { E.roles = E.roles.includes(id) ? E.roles.filter(x => x !== id) : [...E.roles, id]; };
      return { G, E, row, person, loc, draftEff, modules, setOv, save, customRoles, toggleRole, changed, ROLE, roleById, initials };
    },
    template: `<Sheet :open="!!G.assignEdit" @update:open="v => { if (!v) G.assignEdit = null }">
      <template v-if="row && person">
        <div class="border-b p-4 pr-12"><div class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">{{ initials(person.name) }}</span><div class="min-w-0"><h2 class="truncate font-semibold">{{ person.name }}</h2><p class="truncate text-xs text-muted-foreground">at {{ loc.name }} · main role {{ ROLE[person.role] }}</p></div></div></div>
        <div class="flex-1 overflow-y-auto overscroll-contain p-4"><div class="grid gap-5">
          <section class="grid gap-2"><div><h3 class="text-sm font-semibold">Roles here</h3><p class="text-xs text-muted-foreground">Custom roles only. They apply at {{ loc.name }} and every location under it. Owner, Admin, Editor and Viewer are main roles set on the organisation.</p></div>
            <div class="grid gap-1.5"><label v-for="r in customRoles" :key="r.id" class="flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 hover:bg-muted/40" :class="E.roles.includes(r.id) ? 'border-primary/50 bg-primary/5' : ''"><Checkbox class="mt-0.5" :model-value="E.roles.includes(r.id)" @update:model-value="toggleRole(r.id)"/><span class="min-w-0"><span class="block text-sm font-medium">{{ r.name }}</span><span class="block text-xs text-muted-foreground">{{ r.desc }} {{ r.perms.length }} permissions.</span></span></label></div></section>
          <section class="flex items-start justify-between gap-4 rounded-lg border p-3"><div><p class="text-sm font-medium">Primary location</p><p class="text-xs text-muted-foreground">Their default location after sign-in. One per person; turning this on moves it here.</p></div><Switch v-model="E.primary"/></section>
          <section class="grid gap-2"><div class="flex items-end justify-between gap-2"><div><h3 class="text-sm font-semibold">Permission overrides</h3><p class="text-xs text-muted-foreground">Exceptions for this person here. Deny always wins.</p></div><Badge v-if="changed" variant="warning">{{ changed }} set</Badge></div>
            <div v-for="[mod, list] in modules" :key="mod" class="overflow-hidden rounded-lg border">
              <p class="bg-muted/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{{ mod }}</p>
              <div v-for="p in list" :key="p.name" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t px-3 py-2">
                <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-sm"><Icon :name="draftEff.denied.has(p.name) ? 'CircleMinus' : draftEff.src[p.name] ? 'CircleCheck' : 'Circle'" :size="14" :class="draftEff.denied.has(p.name) ? 'text-destructive' : draftEff.src[p.name] ? 'text-c1' : 'text-muted-foreground/50'"/>{{ p.label }}</p>
                  <p class="truncate pl-5 text-[11px] text-muted-foreground"><span class="font-mono">{{ p.name }}</span><template v-if="draftEff.denied.has(p.name)"> · denied here</template><template v-else-if="draftEff.src[p.name]"> · {{ draftEff.src[p.name][0] }}<template v-if="draftEff.src[p.name].length > 1"> +{{ draftEff.src[p.name].length - 1 }}</template></template></p></div>
                <div class="inline-flex shrink-0 rounded-md border bg-muted/40 p-0.5" role="radiogroup" :aria-label="'Override for ' + p.label">
                  <button v-for="o in [['inherit','Inherit'],['grant','Grant'],['deny','Deny']]" :key="o[0]" type="button" role="radio" :aria-checked="(E.ov[p.name]||'inherit')===o[0]" @click="setOv(p.name, o[0])" :class="['h-6 rounded px-2 text-[11px] font-medium', (E.ov[p.name]||'inherit')===o[0] ? (o[0]==='deny' ? 'bg-destructive text-destructive-foreground shadow' : o[0]==='grant' ? 'bg-primary text-primary-foreground shadow' : 'bg-background shadow') : 'text-muted-foreground hover:text-foreground']">{{ o[1] }}</button></div>
              </div></div></section>
        </div></div>
        <div class="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end"><Button variant="outline" @click="G.assignEdit=null">Cancel</Button><Button @click="save"><Icon name="Check" :size="14"/>Save assignment</Button></div>
      </template></Sheet>`
  };

  /* ---------- View as picker (top bar + user rows) */
  const ViewAsDialog = {
    setup() {
      const V = reactive({ mode: 'person', q: '', email: '', loc: '', main: 'viewer', custom: 'supervisor', rloc: 'aru' });
      watch(() => G.viewAsPick, (v) => { if (v) { Object.assign(V, { q: '', email: '', loc: '' }); if (typeof v === 'object' && v.role) { V.mode = 'role'; const r = roleById(v.role); if (r && r.system) { V.main = v.role; V.custom = ''; } else { V.custom = v.role; } } else if (typeof v === 'object') { V.mode = 'person'; V.email = v.email || ''; V.loc = v.loc || ''; } else V.mode = 'person'; if (!locById(V.rloc)) V.rloc = (locsOf().find(l => l.parent) || locsOf()[0]).id; } });
      const people = computed(() => MEMBERS.filter(m => m.email !== ME.email && (!V.q.trim() || (m.name + m.email).toLowerCase().includes(V.q.trim().toLowerCase()))));
      const locOpts = computed(() => assignsOf().filter(a => a.email === V.email).map(a => ({ value: a.loc, label: locById(a.loc).name + (a.primary ? ' (primary)' : '') })));
      watch(() => V.email, (e) => { if (e && !locOpts.value.some(o => o.value === V.loc)) V.loc = (primaryOf(e) || {}).id || ''; });
      const mainOpts = ['viewer', 'editor', 'admin'].map(r => ({ value: r, label: ROLE[r] }));
      const customOpts = computed(() => [{ value: '', label: 'None (main role only)' }, ...ROLES.filter(r => !r.system).map(r => ({ value: r.id, label: r.name }))]);
      /* what this role would get: same rule as real people (D21) */
      const previewPerms = computed(() => { const main = (roleById(V.main) || { perms: [] }).perms; const extra = V.custom ? (roleById(V.custom) || { perms: [] }).perms : []; return [...new Set([...main, ...extra])]; });
      const menusShown = computed(() => MENU.filter(m => menuVisibleFor(m, previewPerms.value)).map(m => m.label));
      const scopeText = computed(() => { if (['owner', 'admin'].includes(V.main)) return 'Every location'; if (!V.custom) return 'No locations (main role only)'; const l = locById(V.rloc); const n = subtreeIds(V.rloc).length; return l.name + (n > 1 ? ' and ' + (n - 1) + ' below it' : ''); });
      const canStart = computed(() => V.mode === 'person' ? !!V.email : !!V.main && (!V.custom || !!V.rloc));
      function start() { if (V.mode === 'person') startViewAs(V.email, V.loc); else startRolePreview(V.main, V.custom, V.rloc); }
      return { G, V, people, locOpts, startViewAs, ROLE, primaryOf, initials, mainOpts, customOpts, previewPerms, menusShown, scopeText, canStart, start };
    },
    template: `<Dialog :open="!!G.viewAsPick" @update:open="v => G.viewAsPick = v">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">View as</h2><p class="text-sm text-muted-foreground">See menus, locations and forms as someone else would. Read-only: nothing is saved and no emails or codes are sent.</p></div>
      <Tabs v-model="V.mode" :items="[{ value: 'person', label: 'A person' }, { value: 'role', label: 'A role' }]" full/>
      <div v-if="V.mode==='person'" class="grid grid-cols-[minmax(0,1fr)] gap-3">
        <div class="relative"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-8" v-model="V.q" placeholder="Find a person"/></div>
        <div class="grid max-h-64 gap-1 overflow-y-auto" role="radiogroup" aria-label="Person">
          <button v-for="m in people" :key="m.email" type="button" role="radio" :aria-checked="V.email===m.email" @click="V.email=m.email" :class="['flex items-center gap-3 rounded-lg border p-2 text-left', V.email===m.email ? 'border-primary/60 bg-primary/5' : 'border-transparent hover:bg-muted/60']">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ initials(m.name) }}</span>
            <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ m.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ ROLE[m.role] }}<template v-if="primaryOf(m.email)"> · {{ primaryOf(m.email).name }}</template></span></span>
            <Icon v-if="V.email===m.email" name="Check" :size="15" class="text-primary"/></button></div>
        <div v-if="locOpts.length > 1" class="grid gap-1.5"><span class="text-sm font-medium">Start at location</span><Select v-model="V.loc" :options="locOpts"/></div>
      </div>
      <div v-else class="grid grid-cols-[minmax(0,1fr)] gap-3">
        <p class="text-xs text-muted-foreground">Build a role the way you would assign it: a main role for the organisation, plus a custom role at a location. No real person is used.</p>
        <div class="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0"><div class="grid gap-1.5"><span class="text-sm font-medium">Main role</span><Select v-model="V.main" :options="mainOpts"/></div><div class="grid gap-1.5"><span class="text-sm font-medium">Custom role</span><Select v-model="V.custom" :options="customOpts"/></div></div>
        <ApiSelect v-if="V.custom" v-model="V.rloc" module="locations" label="At location" required help="Their access covers this location and everything under it."/>
        <div class="grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <p class="flex items-center gap-2"><Icon name="KeyRound" :size="14" class="text-muted-foreground"/><span class="font-medium tnum">{{ previewPerms.length }} permissions</span></p>
          <p class="flex items-start gap-2"><Icon name="MapPin" :size="14" class="mt-0.5 text-muted-foreground"/><span>{{ scopeText }}</span></p>
          <p class="flex items-start gap-2"><Icon name="PanelLeft" :size="14" class="mt-0.5 text-muted-foreground"/><span>Menu: {{ menusShown.join(', ') }}</span></p></div>
      </div>
      <p class="flex items-start gap-2 rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground"><Icon name="ScrollText" :size="14" class="mt-px shrink-0"/>Each session is written to the audit log with who, what was viewed, location and duration.</p>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="G.viewAsPick=false">Cancel</Button><Button :disabled="!canStart" @click="start"><Icon :name="V.mode==='person' ? 'Eye' : 'ScanEye'" :size="14"/>{{ V.mode==='person' ? 'Start viewing' : 'Preview role' }}</Button></div>
    </Dialog>`
  };

  /* ---------- Location detail: Overview / Details / Users / Forms */
  const LocationPage = {
    setup() {
      const T = reactive({ loading: false, updatedAt: Date.now(), tab: G.pendingTab || 'overview', edit: false, inherited: true, incForms: true, assign: false, who: '', roles: [], primary: false });
      const loc = computed(() => locById(G.locId));
      watch(() => G.locId, () => { T.tab = 'overview'; T.edit = false; window.scrollTo({ top: 0 }); });
      watch(() => G.pendingTab, (v) => { if (v) T.tab = v; });
      watch(() => T.tab, (t) => { G.tab = t; }, { immediate: true });   // P39: the tab is part of the link
      const crumbs = computed(() => loc.value ? ancestorsOf(loc.value.id) : []);
      const kids = computed(() => loc.value ? childrenOf(loc.value.id).filter(c => inScope(c.id)) : []);
      const direct = computed(() => loc.value ? usersAt(loc.value.id) : []);
      /* people assigned above this location, one row per person (nearest source first) */
      const inheritedRows = computed(() => {
        if (!loc.value) return [];
        const by = new Map();
        [...crumbs.value].reverse().forEach(anc => usersAt(anc.id).filter(x => x.roles.length || ['owner', 'admin'].includes((memberByEmail(x.email) || {}).role)).forEach(x => {
          if (direct.value.some(d => d.email === x.email)) return;
          const r = by.get(x.email);
          if (!r) by.set(x.email, { ...x, roles: [...x.roles], granted: [...x.granted], denied: [...x.denied], from: anc, fromAll: [anc.name] });
          else { x.roles.forEach(id => { if (!r.roles.includes(id)) r.roles.push(id); }); r.granted.push(...x.granted); r.denied.push(...x.denied); r.fromAll.push(anc.name); }
        }));
        return [...by.values()];
      });
      const people = computed(() => [...direct.value, ...(T.inherited ? inheritedRows.value : [])]);
      const forms = computed(() => loc.value ? formsAt(loc.value.id, T.incForms).filter(formVisible) : []);
      /* P39: the Users tab is one list card: own search, quick tabs (here / from above), filters, sort, Export, Copy link */
      const QU = reactive({ q: '' });
      const LSU = useList({ noun: 'people', rows: () => [...direct.value, ...inheritedRows.value], query: () => QU.q, search: (a, q) => { const m = memberByEmail(a.email) || {}; return ((m.name || '') + ' ' + a.email + ' ' + a.roles.map(r => (roleById(r) || {}).name).join(' ')).toLowerCase().includes(q); }, sort: 'name', dir: 'asc',
        sorts: [{ value: 'name', label: 'Name', get: a => ((memberByEmail(a.email) || {}).name || '').toLowerCase() }, { value: 'since', label: 'Since', get: a => a.since || '' }],
        fields: () => [
          { key: 'from', label: 'Assigned', type: 'select', options: [{ value: 'here', label: 'Here' }, { value: 'above', label: 'At a location above' }], get: a => a.from ? 'above' : 'here' },
          { key: 'main', label: 'Main role', type: 'select', options: Object.entries(ROLE).map(([value, label]) => ({ value, label })), get: a => (memberByEmail(a.email) || {}).role },
          { key: 'overrides', label: 'Overrides', type: 'select', options: [{ value: 'granted', label: 'Has granted permissions' }, { value: 'denied', label: 'Has denied permissions' }, { value: 'none', label: 'No overrides' }], get: a => a.denied.length ? 'denied' : a.granted.length ? 'granted' : 'none' },
        ] });
      const uTabs = computed(() => { const all = [...direct.value, ...inheritedRows.value]; return [{ value: 'all', label: 'All', count: all.length }, { value: 'here', label: 'Here', count: direct.value.length }, { value: 'above', label: 'From above', count: inheritedRows.value.length }]; });
      const uQuick = computed({ get: () => { const f = LSU.S.filters, k = Object.keys(f); if (!k.length) return 'all'; if (k.length === 1 && f.from && f.from.op === 'in' && f.from.value.length === 1) return f.from.value[0]; return ''; },
        set: v => { LSU.S.filters = v === 'all' ? {} : { from: { op: 'in', value: [v] } }; LSU.refresh(); } });
      registerUrlList(LSU, { get: () => QU.q, set: v => { QU.q = v; } }, () => T.tab === 'users');
      // P40 columns for the Users tab: main role folds to a title badge; roles here, overrides and since into the meta line
      const ucols = [
        { key: 'person', label: 'Person', identity: true, priority: 1, min: 220, text: a => (memberByEmail(a.email) || { name: a.email }).name },
        { key: 'main', label: 'Main role', priority: 4, min: 100, fold: 'badge', text: a => ROLE[(memberByEmail(a.email) || {}).role] || '', variant: () => 'secondary' },
        { key: 'roles', label: 'Roles here', priority: 2, min: 180, fold: 'meta', text: a => a.roles.length ? a.roles.map(r => (roleById(r) || {}).name).join(', ') : 'No roles here' },
        { key: 'ov', label: 'Overrides', priority: 3, min: 140, fold: 'meta', text: a => [a.granted.length ? '+' + a.granted.length + ' granted' : '', a.denied.length ? '−' + a.denied.length + ' denied' : ''].filter(Boolean).join(' ') },
        { key: 'since', label: 'Since', priority: 5, min: 100, fold: 'meta', muted: true, text: a => a.since ? 'Since ' + a.since : '' },
      ];
      watch(() => G.locId, () => { QU.q = ''; LSU.S.filters = {}; });
      const exportUsers = () => exportList(LSU, [['Person', a => (memberByEmail(a.email) || {}).name], ['Email', a => a.email], ['Main role', a => ROLE[(memberByEmail(a.email) || {}).role]], ['Roles here', a => a.roles.map(r => (roleById(r) || {}).name).join('; ')], ['Assigned at', a => a.from ? a.from.name : loc.value.name], ['Granted', a => a.granted.join('; ')], ['Denied', a => a.denied.join('; ')], ['Since', a => a.since]], 'people', loc.value.name);

      const tabs = computed(() => [{ value: 'overview', label: 'Overview' }, { value: 'details', label: 'Details' }, { value: 'users', label: 'Users', count: direct.value.length }, { value: 'forms', label: 'Forms', count: loc.value ? formsAt(loc.value.id, true).filter(formVisible).length : 0 }, { value: 'history', label: 'History' }]);
      const bars = computed(() => {
        if (!loc.value) return [];
        const list = kids.value.length ? kids.value.map(k => ({ label: k.name, v: respOf(k.id), id: k.id })) : formsAt(loc.value.id).map(f => ({ label: f.title, v: Math.round(f.responses * 0.4) }));
        const max = Math.max(1, ...list.map(x => x.v)); return list.map((x, i) => ({ ...x, pct: Math.round(x.v / max * 100), color: 'var(--c' + ((i % 5) + 1) + ')' }));
      });
      const kpi = computed(() => { const id = loc.value.id; const fs = formsAt(id, true); return { resp: respOf(id), spark: sparkOf(id), live: fs.filter(f => f.status === 'live').length, forms: fs.length, people: peopleIn(id), sub: descendantsOf(id).length, completion: respOf(id) ? (91 + (id.length % 6) + 0.4).toFixed(1) : null }; });
      const canEditLoc = () => canManage() && myPerms.value.includes('Locations.manage');
      const canAssign = () => canManage() || (!G.viewAs && myPerms.value.includes('Locations.assign'));
      /* details editing */
      const D = reactive({});
      const draft = useFormDraft({ module: 'Locations', recordKey: () => G.locId, title: () => (loc.value ? loc.value.name : '') + ': details', getPayload: () => ({ name: D.name, code: D.code, type: D.type, parent: D.parent, status: D.status, sales: D.sales, phone: D.phone, email: D.email, hours: D.hours, address: D.address, ward: D.ward, district: D.district, photo: D.photo, notes: D.notes }), applyPayload: (p) => Object.assign(D, p) });
      watch(() => JSON.stringify(D), () => { if (T.edit) draft.touch(); });
      function startEdit() { if (G.viewAs) return readOnly(); Object.keys(D).forEach(k => delete D[k]); Object.assign(D, JSON.parse(JSON.stringify(loc.value))); draft.D.key = loc.value.id; T.edit = true; nextTick(() => draft.arm()); }
      function cancelEdit() { draft.flush(); T.edit = false; if (draft.D.state !== 'idle') toast('Draft kept', 'Your changes are waiting the next time you edit.', 'History'); }
      watch(() => G.editLoc, () => { if (loc.value) { T.tab = 'details'; startEdit(); } });
      /* History tab (activity) and delete with dependency check */
      const H = reactive({ shown: 6, loading: false });
      const HIST = computed(() => { const n = loc.value ? loc.value.name : ''; return [
        { icon: 'Pencil', who: 'Baraka Mushi', what: 'changed opening hours', detail: 'Mon–Sat 08:00–20:00 → Mon–Sat 08:00–20:30', when: '2 Oct 2026, 14:12' },
        { icon: 'UserPlus', who: 'Neema Kimaro', what: 'assigned Hamisi Swai as Branch supervisor', detail: '', when: '28 Sep 2026, 09:40' },
        { icon: 'ShieldMinus', who: 'Neema Kimaro', what: 'denied Responses.export for Hamisi Swai', detail: 'JSON override on user_locations', when: '28 Sep 2026, 09:41' },
        { icon: 'Send', who: 'Baraka Mushi', what: 'published a form owned here', detail: 'Branch Opening Checklist: Arusha', when: '20 Sep 2026, 16:03' },
        { icon: 'Image', who: 'Baraka Mushi', what: 'changed the photo', detail: 'arusha-branch-front.jpg', when: '14 Sep 2026, 11:20' },
        { icon: 'Eye', who: 'Amina Juma', what: 'viewed the app as Hamisi Swai', detail: 'Audit: 6 minutes, read-only', when: '9 Sep 2026, 08:55' },
        { icon: 'MapPin', who: 'Amina Juma', what: 'moved ' + n + ' under Northern Zone', detail: 'Closure rebuilt for 2 locations', when: '3 Jun 2025, 10:02' },
        { icon: 'CirclePlus', who: 'Amina Juma', what: 'created ' + n, detail: '', when: '12 Mar 2025, 15:30' },
      ]; });
      function moreHist() { H.loading = true; setTimeout(() => { H.shown += 6; H.loading = false; }, 500); }
      const X = reactive({ del: false });
      const deps = computed(() => { if (!loc.value) return []; const out = []; const k = descendantsOf(loc.value.id).length; if (k) out.push({ icon: 'GitFork', label: k + ' location' + (k > 1 ? 's' : '') + ' under it' }); const u = usersAt(loc.value.id).length; if (u && !(descendantsOf(loc.value.id).length || formsAt(loc.value.id).length)) out.push({ icon: 'Users', label: u + ' people assigned here (assignments are removed)' }); const f = formsAt(loc.value.id).length; if (f) out.push({ icon: 'ClipboardList', label: f + ' form' + (f > 1 ? 's' : '') + ' owned here' }); return out; });
      const blocking = computed(() => !!(loc.value && (descendantsOf(loc.value.id).length || formsAt(loc.value.id).length)));
      function doDelete() { const p = loc.value.parent; const list = locsOf(); list.splice(list.indexOf(loc.value), 1); X.del = false; toast('Location deleted', 'Kept in Trash for 30 days.', 'Trash2'); nav(p ? 'location' : 'locations'); if (p) G.locId = p; }
      const moreItems = computed(() => [{ id: 'copy', label: 'Copy link', icon: 'Link' }, { id: 'hist', label: 'History', icon: 'History' }, ...(canEditLoc() && loc.value && loc.value.parent ? [{ separator: true }, { id: 'del', label: 'Delete location', icon: 'Trash2', destructive: true }] : [])]);
      function onMore(it) { if (it.id === 'copy') toast('Link copied', PRODUCT.domain + '/' + G.org.slug + '/locations/' + loc.value.uuid + '?tab=' + T.tab, 'Link'); if (it.id === 'hist') T.tab = 'history'; if (it.id === 'del') X.del = true; }
      const parentOpts = computed(() => { if (!loc.value) return []; const ban = new Set(subtreeIds(loc.value.id)); return locsOf().filter(l => !ban.has(l.id)).map(l => ({ value: l.id, label: ' '.repeat(depthOf(l.id) * 3) + l.name })); });
      const typeOpts = Object.entries(LTYPES).filter(([k]) => k !== 'org').map(([value, t]) => ({ value, label: t.label, icon: t.icon }));
      const statusOpts = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
      function saveEdit() { const moved = D.parent !== loc.value.parent; const n = subtreeIds(loc.value.id).length; Object.assign(loc.value, D, { updatedAt: fmtDay(isoDay(TODAY)), updatedBy: ME.email }); logActivity({ icon: moved ? 'Move' : 'Pencil', text: moved ? 'Location moved' : 'Location changed', what: loc.value.name, loc: loc.value.id }); draft.onSuccess(); T.edit = false; toast('Location saved', moved ? `Moved under ${locById(D.parent).name}. Closure rebuilt for ${n} location${n > 1 ? 's' : ''}; people below keep inherited roles from the new parent.` : 'Change written to the activity log.', 'MapPin'); }
      /* users */
      const assignable = computed(() => MEMBERS.filter(m => !direct.value.some(a => a.email === m.email)).map(m => ({ value: m.email, label: m.name + ' · ' + ROLE[m.role] })));
      function openAssign() { if (G.viewAs) return readOnly(); Object.assign(T, { assign: true, who: (assignable.value[0] || {}).value || '', roles: [], primary: false }); }
      function doAssign() { const a = A(T.who, loc.value.id, [...T.roles], { since: 'Today' }); if (T.primary) assignsOf().filter(x => x.email === T.who).forEach(x => x.primary = false); a.primary = T.primary || !assignsOf().some(x => x.email === T.who); assignsOf().push(a); T.assign = false; toast('Person assigned', `${memberByEmail(T.who).name} at ${loc.value.name}.`, 'UserPlus'); }
      const userMenu = (a) => a.from ? [{ id: 'src', label: 'Open ' + a.from.name, icon: 'ArrowUpRight' }, ...(canViewAs() && a.email !== ME.email ? [{ id: 'as', label: 'View as', icon: 'Eye' }] : [])] : [
        ...(canAssign() ? [{ id: 'edit', label: 'Edit roles and overrides', icon: 'ShieldCheck' }] : [{ id: 'edit', label: 'See permissions', icon: 'ShieldCheck' }]),
        ...(canViewAs() && a.email !== ME.email ? [{ id: 'as', label: 'View as', icon: 'Eye' }] : []),
        ...(canAssign() ? [{ separator: true }, { id: 'rm', label: 'Remove from location', icon: 'UserMinus', destructive: true }] : [])];
      function onUser(a, it) {
        if (it.id === 'src') openLoc(a.from.id, 'users');
        if (it.id === 'edit') G.assignEdit = a.id;
        if (it.id === 'as') startViewAs(a.email, a.loc);
        if (it.id === 'rm') { if (G.viewAs) return readOnly(); const list = assignsOf(); list.splice(list.indexOf(a), 1); toast('Removed from ' + loc.value.name, (memberByEmail(a.email) || {}).name + ' keeps their main role and other locations.', 'UserMinus'); }
      }
      const toggleRole = (id) => { T.roles = T.roles.includes(id) ? T.roles.filter(x => x !== id) : [...T.roles, id]; };
      function refresh() { if (T.loading) return; T.loading = true; setTimeout(() => { T.loading = false; T.updatedAt = Date.now(); }, 700); }
      function newFormHere() { if (G.viewAs) return readOnly(); nav('builder'); toast('Prototype opens the sample form', 'A real form here starts with location ' + loc.value.code + ' and private to its people.', 'Info'); }
      return { QU, LSU, ucols, uTabs, uQuick, exportUsers, draft, cancelEdit, H, HIST, moreHist, X, deps, blocking, doDelete, moreItems, onMore, G, T, D, loc, crumbs, kids, direct, people, forms, tabs, bars, kpi, LTYPES, LSTAT, STAT, ACCENTS, activityOf, ROLE, openLoc, nav, memberByEmail, roleById, initials, canEditLoc, canAssign, canViewAs, startEdit, saveEdit, parentOpts, typeOpts, statusOpts, assignable, openAssign, doAssign, userMenu, onUser, customRoles, toggleRole, usersAt, respOf, audienceOf, locName, openForm, newFormHere, refresh, startViewAs, inScope, ME, myPerms, mediaById, subtreeIds, locById };
    },
    template: `<div v-if="!loc || !inScope(loc.id)" class="mx-auto grid max-w-md place-items-center gap-2 py-16 text-center"><span class="grid h-12 w-12 place-items-center rounded-full bg-muted"><Icon name="MapPinOff" :size="22" class="text-muted-foreground"/></span><h2 class="text-lg font-semibold">{{ loc ? 'Not one of their locations' : 'Location not found' }}</h2><p class="text-sm text-muted-foreground">{{ loc ? G.viewAs.name + ' is not assigned here or above it, so this page returns 403 for them.' : 'It may have been removed or belong to another organisation.' }}</p><Button class="mt-2" variant="outline" @click="nav('locations')"><Icon name="ArrowLeft" :size="14"/>All locations</Button></div>
    <div v-else class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <nav class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb"><BackButton/><button type="button" class="hover:text-foreground" @click="nav('locations')">Locations</button><template v-for="c in crumbs" :key="c.id"><Icon name="ChevronRight" :size="12"/><button type="button" class="hover:text-foreground disabled:hover:text-muted-foreground" :disabled="!inScope(c.id)" @click="openLoc(c.id)">{{ c.name }}</button></template><Icon name="ChevronRight" :size="12"/><span class="font-medium text-foreground">{{ loc.name }}</span></nav>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3"><span :class="['grid h-11 w-11 shrink-0 place-items-center rounded-lg', loc.type==='org' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary']"><Icon :name="LTYPES[loc.type].icon" :size="20"/></span>
          <div class="min-w-0"><h2 class="truncate text-xl font-semibold tracking-tight sm:text-2xl">{{ loc.name }}</h2><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span class="font-mono text-xs">{{ loc.code }}</span><span>·</span><span>{{ LTYPES[loc.type].label }}</span><span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', LSTAT[loc.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', LSTAT[loc.status].dot]"></span>{{ LSTAT[loc.status].label }}</span></p></div></div>
        <div class="flex gap-1.5"><RefreshButton :loading="T.loading" :updated-at="T.updatedAt" @refresh="refresh"/><Button v-if="canEditLoc() && T.tab!=='details'" variant="outline" @click="T.tab='details'; startEdit()"><Icon name="Pencil" :size="14"/>Edit</Button><Button v-if="canEditLoc()" @click="G.newLoc = loc.id"><Icon name="CirclePlus" :size="14"/><span class="hidden sm:inline">Add child</span><span class="sm:hidden">Child</span></Button><DropdownMenu :items="moreItems" @select="onMore"><template #trigger><Button variant="outline" size="icon" aria-label="More actions"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></div>
      </div>
      <div class="max-w-full overflow-x-auto"><Tabs v-model="T.tab" :items="tabs"/></div>
      <div :class="['grid grid-cols-[minmax(0,1fr)] gap-4 transition-opacity', T.loading && 'pointer-events-none opacity-60']">

      <!-- OVERVIEW -->
      <template v-if="T.tab==='overview'">
        <div class="grid grid-cols-2 gap-2 lg:grid-cols-4 [&>*]:min-w-0">
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Responses, 30 days</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Inbox" :size="13"/></span></div><div class="mt-1.5 flex items-end justify-between gap-2"><p class="text-2xl font-semibold tnum">{{ kpi.resp }}</p><Spark v-if="kpi.resp" :data="kpi.spark" class="h-7 w-20"/></div><p class="mt-1 text-[11px] text-muted-foreground">Here and below</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:60ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Forms</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="ClipboardList" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.forms }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ kpi.live }} live now</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:120ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">People</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="Users" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.people }}</p><p class="mt-1 text-[11px] text-muted-foreground">{{ direct.length }} assigned here</p></div>
          <div class="kpi rounded-xl border bg-card p-3.5 shadow-sm" style="animation-delay:180ms"><div class="flex items-center justify-between"><p class="text-xs font-medium text-muted-foreground">Completed normally</p><span class="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary"><Icon name="CircleCheck" :size="13"/></span></div><p class="mt-1.5 text-2xl font-semibold tnum">{{ kpi.completion ? kpi.completion + '%' : '–' }}</p><div class="mt-2 h-1.5 overflow-hidden rounded-full" style="background:color-mix(in oklab,var(--c1) 18%,hsl(var(--card)))"><div class="h-full rounded-full bg-c1 transition-[width] duration-700" :style="{ width: (kpi.completion || 0) + '%' }"></div></div></div>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-3 [&>*]:min-w-0">
          <Card class="kpi lg:col-span-2" style="animation-delay:200ms"><div class="p-4">
            <div class="flex items-center justify-between gap-2"><h3 class="text-sm font-semibold">{{ kids.length ? 'Responses by location' : 'Responses by form' }}</h3><span class="text-xs text-muted-foreground">Last 30 days</span></div>
            <div v-if="bars.length" class="mt-3 grid gap-2.5">
              <div v-for="(b, i) in bars" :key="b.label" :role="b.id ? 'link' : null" :tabindex="b.id ? 0 : null" @click="b.id && openLoc(b.id)" @keydown.enter="b.id && openLoc(b.id)" :class="['grid gap-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', b.id ? 'group cursor-pointer' : '']">
                <div class="flex items-center justify-between gap-3 text-xs"><span class="truncate font-medium group-hover:underline">{{ b.label }}</span><span class="tnum text-muted-foreground">{{ b.v }}</span></div>
                <div class="h-2 overflow-hidden rounded-full bg-muted"><div class="bar-grow h-full rounded-full" :style="{ width: b.pct + '%', background: b.color, animationDelay: (i*70)+'ms' }"></div></div></div></div>
            <p v-else class="mt-6 pb-4 text-center text-sm text-muted-foreground">No responses here yet.</p></div></Card>
          <Card class="kpi" style="animation-delay:260ms"><div class="p-4">
            <div class="flex items-center justify-between"><h3 class="text-sm font-semibold">Team here</h3><Button variant="ghost" size="sm" class="-mr-2 h-7" @click="T.tab='users'">All<Icon name="ChevronRight" :size="13"/></Button></div>
            <ul v-if="direct.length" class="mt-2 grid gap-2"><li v-for="a in direct.slice(0,5)" :key="a.id" class="flex items-center gap-2.5"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold uppercase text-primary">{{ initials((memberByEmail(a.email)||{name:'?'}).name) }}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ (memberByEmail(a.email)||{}).name }}<Icon v-if="a.primary" name="Star" :size="11" class="ml-1 inline text-warning" fill="currentColor" aria-label="Primary"/></p><p class="truncate text-xs text-muted-foreground">{{ a.roles.length ? a.roles.map(r => (roleById(r)||{}).name).join(', ') : ROLE[(memberByEmail(a.email)||{}).role] + ' (main role)' }}</p></div></li></ul>
            <p v-else class="mt-4 text-sm text-muted-foreground">Nobody assigned directly. People above inherit access here.</p></div></Card>
        </div>
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <Card v-if="kids.length" class="kpi" style="animation-delay:300ms"><div class="p-4"><h3 class="text-sm font-semibold">Under {{ loc.name }}</h3>
            <ul class="mt-2 divide-y"><li v-for="k in kids" :key="k.id"><button type="button" class="flex w-full items-center gap-2.5 py-2 text-left hover:bg-muted/40" @click="openLoc(k.id)"><span class="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"><Icon :name="LTYPES[k.type].icon" :size="13"/></span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ k.name }}</span><span class="block text-xs text-muted-foreground tnum">{{ usersAt(k.id).length }} people · {{ respOf(k.id) }} responses</span></span><span :class="['h-2 w-2 rounded-full', LSTAT[k.status].dot]"></span><Icon name="ChevronRight" :size="14" class="text-muted-foreground"/></button></li></ul></div></Card>
          <Card class="kpi" style="animation-delay:340ms"><div class="p-4"><h3 class="text-sm font-semibold">Recent activity</h3>
            <ol v-if="activityOf(loc.id).length" class="mt-2 grid gap-3"><li v-for="(e, i) in activityOf(loc.id)" :key="i" class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon :name="e.icon" :size="13"/></span><div class="min-w-0 text-sm"><p><span class="font-medium">{{ e.text }}</span><span v-if="e.what" class="text-muted-foreground"> · {{ e.what }}</span></p><p class="text-xs text-muted-foreground">{{ e.who }} · {{ e.when }}</p></div></li></ol><p v-else class="mt-4 text-sm text-muted-foreground">Nothing has happened here recently.</p></div></Card>
        </div>
      </template>

      <!-- DETAILS -->
      <template v-if="T.tab==='details'">
        <div v-if="!T.edit" class="grid grid-cols-1 gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <Card class="kpi"><div class="p-4"><div class="flex items-center justify-between"><h3 class="text-sm font-semibold">Identity</h3><Button v-if="canEditLoc()" variant="ghost" size="sm" class="-mr-2 h-7" @click="startEdit"><Icon name="Pencil" :size="13"/>Edit</Button></div>
            <dl class="mt-2 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
              <dt class="text-muted-foreground">Name</dt><dd class="font-medium">{{ loc.name }}</dd>
              <dt class="text-muted-foreground">Code</dt><dd class="font-mono text-xs leading-5">{{ loc.code }}</dd>
              <dt class="text-muted-foreground">Type</dt><dd>{{ LTYPES[loc.type].label }}</dd>
              <dt class="text-muted-foreground">Parent</dt><dd><RelatedLink v-if="loc.parent" :loc-id="loc.parent"/><span v-else class="text-muted-foreground">Top level</span></dd>
              <dt class="text-muted-foreground">Status</dt><dd>{{ LSTAT[loc.status].label }}</dd>
              <dt class="text-muted-foreground">Sells to public</dt><dd>{{ loc.sales ? 'Yes' : 'No' }}</dd></dl></div></Card>
          <Card class="kpi" style="animation-delay:60ms"><div class="p-4"><h3 class="text-sm font-semibold">Contact</h3>
            <dl class="mt-2 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
              <dt class="text-muted-foreground">Phone</dt><dd class="tnum">{{ loc.phone || '–' }}</dd>
              <dt class="text-muted-foreground">Email</dt><dd class="truncate">{{ loc.email || '–' }}</dd>
              <dt class="text-muted-foreground">Opening hours</dt><dd>{{ loc.hours }}</dd></dl></div></Card>
          <Card class="kpi lg:col-span-2" style="animation-delay:120ms"><div class="p-4"><h3 class="text-sm font-semibold">Address</h3>
            <div class="mt-2 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
              <dl class="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
                <dt class="text-muted-foreground">Street</dt><dd>{{ loc.address || '–' }}</dd>
                <dt class="text-muted-foreground">Ward</dt><dd>{{ loc.ward || '–' }}</dd>
                <dt class="text-muted-foreground">District</dt><dd>{{ loc.district || '–' }}</dd>
                <dt class="text-muted-foreground">Region</dt><dd>{{ loc.region || '–' }}</dd>
                <dt class="text-muted-foreground">Country</dt><dd>{{ loc.country }}</dd></dl>
              <div class="relative grid min-h-[8rem] place-items-center overflow-hidden rounded-lg border bg-muted/40" style="background-image:radial-gradient(hsl(var(--border)) 1px,transparent 1px);background-size:14px 14px">
                <div v-if="loc.lat" class="grid place-items-center text-center"><span class="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"><Icon name="MapPin" :size="16"/></span><p class="mt-2 font-mono text-[11px] text-muted-foreground">{{ loc.lat.toFixed(4) }}, {{ loc.lng.toFixed(4) }}</p></div>
                <p v-else class="text-xs text-muted-foreground">No coordinates yet</p></div>
            </div></div></Card>
          <Card class="kpi" style="animation-delay:160ms"><div class="p-4"><h3 class="text-sm font-semibold">Photo and directions</h3>
            <div class="mt-2 grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <MediaThumb v-if="loc.photo && mediaById(loc.photo)" :m="mediaById(loc.photo)"/><div v-else class="grid aspect-[4/3] place-items-center rounded-lg border border-dashed text-xs text-muted-foreground">No photo</div>
              <div v-if="loc.notes" class="rt-body text-sm" v-html="loc.notes"></div><p v-else class="text-sm text-muted-foreground">No directions yet.</p></div></div></Card>
          <Card class="kpi" style="animation-delay:200ms"><div class="p-4"><h3 class="text-sm font-semibold">Timeline</h3>
            <dl class="mt-2 grid grid-cols-[8rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
              <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="CalendarPlus" :size="13"/>Created</dt><dd>{{ loc.createdAt }}</dd>
              <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="UserPlus" :size="13"/>Created by</dt><dd>{{ (memberByEmail(loc.createdBy) || { name: '–' }).name }}</dd>
              <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="Clock" :size="13"/>Updated</dt><dd>{{ loc.updatedAt }}</dd>
              <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="UserPen" :size="13"/>Updated by</dt><dd>{{ (memberByEmail(loc.updatedBy) || { name: '–' }).name }}</dd>
              <dt class="flex items-center gap-1.5 text-muted-foreground"><Icon name="Hash" :size="13"/>UUID</dt><dd class="truncate font-mono text-xs leading-5" :title="loc.uuid">{{ loc.uuid }}</dd></dl></div></Card>
        </div>
        <Card v-else class="kpi"><form class="grid grid-cols-[minmax(0,1fr)] gap-4 p-4 sm:p-5" @submit.prevent="saveEdit">
          <DraftBanner :draft="draft"/>
          <div class="flex items-center justify-between"><h3 class="font-semibold">Edit location</h3><Badge variant="outline">{{ D.code }}</Badge></div>
          <div class="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
            <div class="grid gap-1.5"><label for="ld-n" class="text-sm font-medium">Name</label><Input id="ld-n" v-model="D.name"/></div>
            <div class="grid gap-1.5"><label for="ld-c" class="text-sm font-medium">Code</label><Input id="ld-c" v-model="D.code" class="font-mono"/></div>
            <div v-if="loc.type!=='org'" class="grid gap-1.5"><span class="text-sm font-medium">Type</span><Select v-model="D.type" :options="typeOpts"/></div>
            <ApiSelect v-if="loc.parent" v-model="D.parent" module="locations" :exclude="subtreeIds(loc.id)" :selected-options="loc.parent ? [{ value: loc.parent, label: (locById(loc.parent) || {}).name, sub: 'Current parent' }] : []" label="Parent" required help="It and everything under it move together."/>
            <div v-if="loc.parent" class="grid gap-1.5"><span class="text-sm font-medium">Status</span><Select v-model="D.status" :options="statusOpts"/></div>
            <div class="flex items-center justify-between gap-4 rounded-lg border px-3 py-2"><span class="text-sm font-medium">Sells to public</span><Switch v-model="D.sales"/></div>
            <div class="grid gap-1.5"><label for="ld-p" class="text-sm font-medium">Phone</label><Input id="ld-p" v-model="D.phone" type="tel"/></div>
            <div class="grid gap-1.5"><label for="ld-e" class="text-sm font-medium">Email</label><Input id="ld-e" v-model="D.email" type="email"/></div>
            <div class="grid gap-1.5 sm:col-span-2"><label for="ld-h" class="text-sm font-medium">Opening hours</label><Input id="ld-h" v-model="D.hours"/></div>
            <div class="grid gap-1.5 sm:col-span-2"><label for="ld-a" class="text-sm font-medium">Street</label><Input id="ld-a" v-model="D.address"/></div>
            <ApiSelect v-model="D.ward" module="wards" label="Ward" placeholder="Search 100 wards"/>
            <div class="grid gap-1.5"><label for="ld-d" class="text-sm font-medium">District</label><Input id="ld-d" v-model="D.district"/></div>
            <div class="sm:col-span-2"><FilePicker v-model="D.photo" accept="image" :max-size="5" label="Photo" help="Shown on the location card and to respondents of its public forms."/></div>
            <div class="sm:col-span-2"><RichText v-model="D.notes" label="Directions and notes" :max="600" placeholder="How to find it, parking, who to ask for…"/></div>
          </div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end"><DraftStatus :draft="draft"/><Button type="button" variant="outline" @click="cancelEdit">Cancel</Button><Button type="submit" :disabled="!D.name || !D.code"><Icon name="Check" :size="14"/>Save changes</Button></div>
        </form></Card>
      </template>

      <!-- USERS -->
      <template v-if="T.tab==='users'">
        <p class="text-sm text-muted-foreground">Main role comes from the organisation. Roles here are custom roles for {{ loc.name }} and everything under it.</p>
        <ListCard :list="LSU" :tabs="uTabs" v-model:quick="uQuick" v-model:search="QU.q" :refresh="false" placeholder="Search people or roles">
          <template #actions><ListShare :export-fn="exportUsers"/><Button v-if="canAssign()" size="sm" @click="openAssign"><Icon name="UserPlus" :size="15"/><span class="hidden sm:inline">Assign person</span></Button></template>
          <ListRows v-if="LSU.rows.value.length" :list="LSU" :rows="LSU.rows.value" :columns="ucols" :row-key="a => a.id + (a.from ? a.from.id : '')" :base-meta="a => a.from ? 'Inherited from ' + a.fromAll.join(', ') : a.email" :row-class="a => a.from ? 'bg-muted/30' : ''" :clickable="false" :actions-width="72">
            <template #icon="{ row: a }"><span class="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">{{ initials((memberByEmail(a.email)||{name:'?'}).name) }}</span></template>
            <template #cell-person="{ row: a }"><span class="inline-flex items-center gap-1">{{ (memberByEmail(a.email)||{name:a.email}).name }}<Tooltip v-if="a.primary && !a.from" content="Primary location"><Icon name="Star" :size="12" class="text-warning" fill="currentColor"/></Tooltip></span></template>
            <template #cell-roles="{ row: a }"><div class="flex flex-wrap gap-1"><Badge v-for="r in a.roles" :key="r" variant="outline"><Icon name="ShieldPlus" :size="11"/>{{ (roleById(r)||{}).name }}</Badge><span v-if="!a.roles.length" class="text-xs text-muted-foreground">None</span></div></template>
            <template #cell-ov="{ row: a }"><span v-if="a.granted.length" class="mr-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary" :title="a.granted.join(', ')">+{{ a.granted.length }} granted</span><span v-if="a.denied.length" class="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive" :title="a.denied.join(', ')">−{{ a.denied.length }} denied</span><span v-if="!a.granted.length && !a.denied.length" class="text-xs text-muted-foreground">–</span></template>
            <template #actions="{ row: a }"><Tooltip v-if="canViewAs() && a.email !== ME.email" content="View as" side="left"><Button variant="ghost" size="icon-sm" @click="startViewAs(a.email, a.loc)" :aria-label="'View as ' + (memberByEmail(a.email)||{}).name"><Icon name="Eye" :size="15"/></Button></Tooltip><DropdownMenu :items="userMenu(a)" @select="it => onUser(a, it)"><template #trigger><Button variant="ghost" size="icon-sm" :aria-label="'Actions for ' + (memberByEmail(a.email)||{}).name"><Icon name="EllipsisVertical" :size="15"/></Button></template></DropdownMenu></template>
          </ListRows>
          <div v-else class="grid place-items-center p-10 text-center"><Icon name="UsersRound" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">{{ QU.q || LSU.activeCount.value ? 'Nobody matches' : 'Nobody here yet' }}</p><p class="text-sm text-muted-foreground">Assign people and give them custom roles for this location.</p><Button v-if="QU.q || LSU.activeCount.value" class="mt-3" variant="outline" size="sm" @click="QU.q=''; LSU.clearAll()">Clear search and filters</Button></div>
        </ListCard>
        <Dialog v-model:open="T.assign">
          <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Assign to {{ loc.name }}</h2><p class="text-sm text-muted-foreground">Pick a person and the custom roles they hold here.</p></div>
          <div class="grid gap-3"><div class="grid gap-1.5"><span class="text-sm font-medium">Person</span><Select v-model="T.who" :options="assignable" placeholder="Everyone is already here"/></div>
            <div class="grid gap-1.5"><span class="text-sm font-medium">Roles here</span><label v-for="r in customRoles" :key="r.id" class="flex cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-2 text-sm hover:bg-muted/40"><Checkbox :model-value="T.roles.includes(r.id)" @update:model-value="toggleRole(r.id)"/>{{ r.name }}<span class="ml-auto text-xs text-muted-foreground tnum">{{ r.perms.length }} perms</span></label>
              <p class="text-xs text-muted-foreground">Main roles (Owner, Admin, Editor, Viewer) can't be given per location.</p></div>
            <label class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">Make this their primary location<Switch v-model="T.primary"/></label></div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="T.assign=false">Cancel</Button><Button :disabled="!T.who" @click="doAssign"><Icon name="UserPlus" :size="14"/>Assign</Button></div>
        </Dialog>
      </template>

      <!-- FORMS -->
      <template v-if="T.tab==='forms'">
        <div class="flex flex-wrap items-center gap-3">
          <p class="min-w-0 flex-1 basis-full text-sm text-muted-foreground sm:basis-0">Private forms here open only to people at {{ loc.name }} and people you invite. Public forms work for anyone with the link.</p>
          <label v-if="kids.length" class="flex items-center gap-2 text-sm"><Switch v-model="T.incForms"/>Include locations below</label>
          <Button v-if="!G.viewAs && myPerms.includes('Forms.create')" @click="newFormHere"><Icon name="Plus" :size="14"/>New form here</Button>
        </div>
        <div v-if="forms.length" class="grid grid-cols-1 gap-3 md:grid-cols-2 [&>*]:min-w-0">
          <article v-for="(f, i) in forms" :key="f.id" class="kpi form-theme group relative flex overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md" :style="{ '--fa-l': ACCENTS[f.accent].l, '--fa-d': ACCENTS[f.accent].d, animationDelay: (i*40)+'ms' }">
            <div class="w-1 shrink-0 bg-fa"></div>
            <div class="min-w-0 flex-1 p-3.5">
              <div class="flex items-center gap-1.5"><span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', STAT[f.status].cls]"><span :class="['h-1.5 w-1.5 rounded-full', STAT[f.status].dot]"></span>{{ STAT[f.status].label }}</span><span v-if="f.loc !== loc.id" class="truncate text-[11px] text-muted-foreground">from {{ locName(f) }}</span></div>
              <button type="button" class="mt-2 block w-full text-left after:absolute after:inset-0 after:content-['']" @click="openForm(f)"><h3 class="truncate text-sm font-semibold">{{ f.title }}</h3></button>
              <div class="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span class="flex min-w-0 items-center gap-1.5"><Icon :name="audienceOf(f).icon" :size="12" class="shrink-0"/><span class="truncate">{{ audienceOf(f).label }}</span></span><span class="shrink-0 tnum"><span class="font-semibold text-foreground">{{ f.responses }}</span> responses</span></div>
            </div></article></div>
        <div v-else class="grid place-items-center rounded-xl border border-dashed p-10 text-center"><Icon name="ClipboardList" :size="22" class="text-muted-foreground"/><p class="mt-2 font-medium">No forms owned here</p><p class="text-sm text-muted-foreground">Organisation-wide forms still reach people here.</p></div>
      </template>
      </div>
      <!-- HISTORY -->
      <Card v-if="T.tab==='history'" class="kpi"><div class="p-4">
        <ol class="relative grid gap-4 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-border">
          <li v-for="(h, i) in HIST.slice(0, H.shown)" :key="i" class="relative flex gap-3"><span class="relative z-[1] grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-card text-muted-foreground"><Icon :name="h.icon" :size="13"/></span>
            <div class="min-w-0 text-sm"><p><span class="font-medium">{{ h.who }}</span> {{ h.what }}</p><p v-if="h.detail" class="text-xs text-muted-foreground">{{ h.detail }}</p><p class="text-xs text-muted-foreground tnum">{{ h.when }}</p></div></li></ol>
        <div class="mt-4 flex justify-center"><Button v-if="H.shown < HIST.length" variant="outline" size="sm" :disabled="H.loading" @click="moreHist"><Icon :name="H.loading ? 'LoaderCircle' : 'ChevronDown'" :size="14" :class="H.loading && 'animate-spin'"/>Load older</Button><p v-else class="text-xs text-muted-foreground">That's everything.</p></div></div></Card>
      <AssignSheet/>
      <DeleteDialog v-model:open="X.del" :name="loc.name" :deps="deps" :blocking="blocking" @confirm="doDelete"/>
      <NewLocationDialog/>
    </div>`
  };

  /* ---------- View-as banner */
  const ViewAsBanner = {
    setup() { const loc = computed(() => G.viewAs && locById(G.viewAs.loc)); const rolesHere = computed(() => { if (!G.viewAs) return ''; const a = assignsOf().find(x => x.email === G.viewAs.email && x.loc === G.viewAs.loc); return a && a.roles.length ? a.roles.map(r => (roleById(r) || {}).name).join(', ') : ''; }); return { G, loc, rolesHere, exitViewAs, ROLE }; },
    template: `<div v-if="G.viewAs" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-warning/40 bg-warning/15 px-3 py-2 text-sm sm:px-5" role="status">
      <Icon :name="G.viewAs.kind==='role' ? 'ScanEye' : 'Eye'" :size="16" class="shrink-0 text-warning"/>
      <p v-if="G.viewAs.kind==='role'" class="min-w-0 flex-1"><span class="font-semibold">Previewing role: {{ G.viewAs.name }}</span><span class="text-muted-foreground"> · main role {{ ROLE[G.viewAs.role] }} · not a real person · read-only</span></p>
      <p v-else class="min-w-0 flex-1"><span class="font-semibold">Viewing as {{ G.viewAs.name }}</span><span class="text-muted-foreground"> · {{ ROLE[G.viewAs.role] }}<template v-if="rolesHere"> · {{ rolesHere }}</template><template v-if="loc"> at {{ loc.name }}</template> · read-only</span></p>
      <Button size="sm" variant="outline" class="h-7 bg-background" @click="exitViewAs"><Icon name="LogOut" :size="13"/>Exit</Button></div>`
  };
