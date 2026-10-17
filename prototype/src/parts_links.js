
  /* ================================================================ LINKS: every view has an address (P24 + P26, P39)
     #/locations/DSM-01?tab=users&q=amina&sort=-since&f[from][op]=in&f[from][value]=here
     The route, the record, the tab and the active list's search, filters and sort are kept in the address.
     Back/forward and pasted links restore the same view; Copy link copies it. */
  /* EXTENSION POINT: a details route a link can open. path = the URL segment, get = the record's id in the link, set = open it.
     A product adds its own, e.g. LINK_DETAIL.customer = { path: 'customers', get: () => …, set: (v) => … }. */
  const LINK_DETAIL = {
    role: { path: 'roles', get: () => G.roleId, set: (v) => { const r = roleById(v); if (r) G.roleId = r.id; return !!r; } },
    location: { path: 'locations', get: () => { const l = locById(G.locId); return l && (l.code || l.id); }, set: (v) => { const l = locsOf().find(x => x.code === v || x.id === v); if (l) G.locId = l.id; return !!l; } },
    request: { path: 'requests', get: () => { const r = reqById(G.reqId); return r && (r.no || r.id); }, set: (v) => { const r = reqsOf().find(x => x.no === v || x.id === v); if (r) G.reqId = r.id; return !!r; } },
  };
  const LINK_PATHS = Object.fromEntries(Object.entries(LINK_DETAIL).map(([r, d]) => [d.path, r]));
  const LIST_STACK = reactive([]); const ACT = computed(() => { for (let i = LIST_STACK.length - 1; i >= 0; i--) if (isOn(LIST_STACK[i])) return LIST_STACK[i]; return null; }); let PENDING_LIST = null, applying = false;   // the list registered last owns the address; closing it hands back to the one below
  G.tab = null;

  /* a list on screen registers itself; the one registered last owns the address */
  function registerUrlList(LS, q, active) {
    const entry = markRaw({ LS, q, active });
    onMounted(() => { LIST_STACK.push(entry); if (PENDING_LIST && isOn(entry)) { const p = PENDING_LIST; PENDING_LIST = null; applyListState(entry, p); } });
    onBeforeUnmount(() => { const i = LIST_STACK.indexOf(entry); if (i >= 0) LIST_STACK.splice(i, 1); });
    return entry;
  }
  const isOn = (e) => !e.active || e.active();
  function applyListState(entry, st) {
    applying = true;
    entry.LS.S.filters = st.filters || {};
    if (st.sort && entry.LS.sorts.some(s => s.value === st.sort)) { entry.LS.S.sort = st.sort; entry.LS.S.dir = st.dir || 'asc'; }
    if (entry.q) entry.q.set(st.q || '');
    nextTick(() => { applying = false; write(false); });
  }
  const enc = encodeURIComponent;
  function buildHash() {
    const r = G.route || 'dashboard'; const d = LINK_DETAIL[r];
    let path = r === 'dashboard' ? '/' : d ? '/' + d.path + '/' + enc(d.get() || '') : '/' + r;
    const qs = [];
    if (G.tab && G.tab !== 'overview') qs.push('tab=' + enc(G.tab));   // details tabs, and page-level tabs (e.g. the count's History)
    const L = ACT.value;
    if (L) {
      const q = L.q ? L.q.get() : ''; if (q) qs.push('q=' + enc(q));
      const def = L.LS.S._defSort; if (L.LS.S.sort !== (def && def.sort) || L.LS.S.dir !== (def && def.dir)) qs.push('sort=' + (L.LS.S.dir === 'desc' ? '-' : '') + enc(L.LS.S.sort));
      Object.entries(L.LS.S.filters).forEach(([k, f]) => { qs.push('f[' + enc(k) + '][op]=' + enc(f.op)); if (f.value !== '' && f.value !== undefined) qs.push('f[' + enc(k) + '][value]=' + enc(Array.isArray(f.value) ? f.value.join(',') : f.value)); });
    }
    return path + (qs.length ? '?' + qs.join('&') : '');
  }
  function parseHash(h) {
    h = (h || '').replace(/^#/, ''); if (!h) return null;
    const [path, query] = h.split('?'); const seg = path.split('/').filter(Boolean).map(decodeURIComponent);
    const out = { route: 'dashboard', id: null, tab: null, list: { filters: {}, q: '', sort: null, dir: 'asc' } };
    if (seg.length) { if (LINK_PATHS[seg[0]] && seg[1]) { out.route = LINK_PATHS[seg[0]]; out.id = seg[1]; } else out.route = seg[0]; }
    (query || '').split('&').filter(Boolean).forEach(kv => { const i = kv.indexOf('='); const k = decodeURIComponent(kv.slice(0, i)), v = decodeURIComponent(kv.slice(i + 1));
      if (k === 'tab') out.tab = v; else if (k === 'q') out.list.q = v; else if (k === 'sort') { out.list.dir = v[0] === '-' ? 'desc' : 'asc'; out.list.sort = v.replace(/^-/, ''); }
      else { const m = k.match(/^f\[(.+)\]\[(op|value)\]$/); if (m) { const f = out.list.filters[m[1]] || (out.list.filters[m[1]] = { op: 'eq', value: '' }); if (m[2] === 'op') f.op = v; else f.value = v; } } });
    Object.values(out.list.filters).forEach(f => { if (['in', 'nin'].includes(f.op)) f.value = f.value ? f.value.split(',') : []; else if (f.op === 'between') f.value = f.value.split(','); });
    return out;
  }
  let lastHash = '';
  function write(push) {
    if (applying || G.booting) return; const h = buildHash(); if (h === lastHash) return; lastHash = h;
    try { if (push) history.pushState(null, '', '#' + h); else history.replaceState(null, '', '#' + h); } catch (e) { try { applying = true; location.hash = h; setTimeout(() => { applying = false; }, 0); } catch (e2) { applying = false; } }
  }
  function openLink(h) {
    const st = parseHash(h); if (!st) return false;
    const d = LINK_DETAIL[st.route]; const moving = G.route !== st.route || (d && d.get() !== (LINK_DETAIL[st.route] && st.id)); if (d && !d.set(st.id)) { toast('That link points to a record that no longer exists', st.id, 'TriangleAlert'); return false; }
    if (moving) { const norm = '/' + h.replace(/^#?\/?/, ''); try { history.pushState(null, '', '#' + norm); lastHash = norm; } catch (e) {} }   // a link to another page is a new history entry
    applying = true; PENDING_LIST = st.list; G.tab = st.tab;
    if (G.route === st.route) { if (st.tab) G.pendingTab = st.tab; if (ACT.value && !st.tab) { const p = PENDING_LIST; PENDING_LIST = null; applyListState(ACT.value, p); } }
    else nav(st.route, st.tab || undefined);
    setTimeout(() => { applying = false; write(false); }, 1200);
    return true;
  }
  G.openLink = (text) => { const t = String(text || '').trim(); const i = t.indexOf('#'); return openLink(i >= 0 ? t.slice(i) : t.startsWith('/') ? t : '/' + t.replace(/^https?:\/\/[^/]+/, '')); };
  function copyLink() {
    const h = buildHash(); const top = (() => { try { return window.top === window && location.protocol !== 'about:'; } catch (e) { return false; } })();
    const url = top ? location.href.split('#')[0] + '#' + h : 'https://' + PRODUCT.domain + '/' + G.org.slug + h;
    copyText(url, 'Link copied');
  }
  /* write on every change of route, record, tab or the active list's state */
  // sync: reset the tab the moment the route/record changes, before the new page mounts and sets its own tab
  watch(() => [G.route, ...Object.values(LINK_DETAIL).map(d => d.get())], () => { G.tab = G.pendingTab || null; nextTick(() => write(true)); }, { flush: 'sync' });
  watch(() => G.tab, () => write(true), { flush: 'sync' });   // a tab change is a new history entry: push before the list watcher replaces
  watch(() => ACT.value && [ACT.value.LS, JSON.stringify(ACT.value.LS.S.filters), ACT.value.LS.S.sort, ACT.value.LS.S.dir, ACT.value.q ? ACT.value.q.get() : ''], () => write(false));
  window.addEventListener('popstate', () => { const h = location.hash; if (h && h !== '#' + lastHash) { lastHash = h.slice(1); openLink(h); } });
  window.addEventListener('hashchange', () => { if (applying) return; const h = location.hash; if (h && h !== '#' + lastHash) { lastHash = h.slice(1); openLink(h); } });
  setTimeout(() => { const h = location.hash; if (h && h.length > 2) openLink(h); }, 600);

  /* ================================================================ BACK (P49): every record page starts its breadcrumb with Back.
     A trail of the screens visited (route + its record + tab); Back returns to the one you came from (a list with its
     filters, another record, Home…) and, with no trail (a pasted link, a reload), goes to the record's list.
     EXTENSION POINT: BACK_PARENT maps a record route to its list; a product adds its own, e.g. BACK_PARENT.customer = 'customers'. */
  const BACK_PARENT = { role: 'roles', location: 'locations', request: 'approvals' };
  const TRAIL = []; let here = null, backing = false;
  const snapNow = () => ({ route: G.route, rec: LINK_DETAIL[G.route] ? LINK_DETAIL[G.route].get() : null, tab: G.tab });
  watch(() => { const s = snapNow(); return s.route + '|' + s.rec; }, () => {
    const now = snapNow();
    if (backing) { backing = false; here = now; return; }
    if (here && AREA(here.route) !== 'auth') { TRAIL.push(here); if (TRAIL.length > 30) TRAIL.shift(); }
    here = now;
  }, { immediate: true });
  function goBack() {
    let i = TRAIL.length - 1;
    while (i >= 0 && TRAIL[i].route === G.route && TRAIL[i].rec === snapNow().rec) i--;
    const prev = i >= 0 ? TRAIL[i] : null;
    // the whole step runs only once the page lets go: unsaved edits ask first, and Stay keeps the record and the trail
    const go = () => {
      TRAIL.length = Math.max(0, i);
      if (!prev) { nav(BACK_PARENT[G.route] || 'dashboard'); return; }
      backing = true;
      if (prev.rec != null && LINK_DETAIL[prev.route]) LINK_DETAIL[prev.route].set(prev.rec);
      nav(prev.route, prev.tab);
    };
    if (G.leaveGuard && G.leaveGuard(prev ? prev.route : (BACK_PARENT[G.route] || 'dashboard'), prev && prev.tab, go)) return;
    go();
  }
  const BackButton = {
    setup() {
      const label = computed(() => { const p = TRAIL[TRAIL.length - 1]; return ROUTE_LABEL[p ? p.route : (BACK_PARENT[G.route] || 'dashboard')]; });
      return { goBack, label };
    },
    template: `<button type="button" @click="goBack" class="-ml-1.5 mr-1.5 inline-flex h-7 items-center gap-1 rounded-md border bg-card px-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :aria-label="'Back to ' + label"><Icon name="ArrowLeft" :size="14"/>Back</button>`
  };
