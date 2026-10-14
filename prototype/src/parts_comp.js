
  /* ================================================================ CORE COMPONENTS: media + file picker, API select, rich text, drafts, delete gate, related preview */
  const isPhoneNow = () => window.matchMedia('(max-width: 639px)').matches;
  const fmtSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
  const FTYPE = { image: { icon: 'Image', label: 'Image' }, pdf: { icon: 'FileText', label: 'PDF' }, sheet: { icon: 'Sheet', label: 'Spreadsheet' }, doc: { icon: 'FileType', label: 'Document' }, video: { icon: 'Film', label: 'Video' } };
  const typeOfName = (n, mime = '') => mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(n) ? 'image' : /\.pdf$/i.test(n) || mime === 'application/pdf' ? 'pdf' : /\.(xlsx?|csv)$/i.test(n) ? 'sheet' : /\.(mp4|mov|webm)$/i.test(n) || mime.startsWith('video/') ? 'video' : 'doc';
  /* placeholder artwork for seeded images: two-tone gradients, no external files */
  const ART = [['#14937f', '#7dd3c0'], ['#d06d0a', '#f6c48a'], ['#2f6fe0', '#9ec0f7'], ['#d6456a', '#f3a7ba'], ['#7c5ad8', '#c7b6f2'], ['#0f766e', '#d97706']];
  const MEDIA = reactive([
    { id: 'm1', name: 'arusha-branch-front.jpg', type: 'image', size: 812000, by: 'Baraka Mushi', at: daysAgo(2), art: 0, w: 1600, h: 1067 },
    { id: 'm2', name: 'kilima-logo.png', type: 'image', size: 48000, by: 'Amina Juma', at: daysAgo(40), art: 5, w: 512, h: 512 },
    { id: 'm3', name: 'staff-handbook-2026.pdf', type: 'pdf', size: 2450000, by: 'Neema Kimaro', at: daysAgo(12) },
    { id: 'm4', name: 'mwanza-shelf-audit.jpg', type: 'image', size: 640000, by: 'Rehema Mrema', at: daysAgo(5), art: 2, w: 1200, h: 900 },
    { id: 'm5', name: 'q3-stock-count.xlsx', type: 'sheet', size: 180000, by: 'Saidi Ngowi', at: daysAgo(9) },
    { id: 'm6', name: 'fire-drill-poster.png', type: 'image', size: 390000, by: 'Amina Juma', at: daysAgo(1), art: 3, w: 1080, h: 1350 },
    { id: 'm7', name: 'solar-training.mp4', type: 'video', size: 48200000, by: 'Amina Juma', at: daysAgo(20) },
    { id: 'm8', name: 'kariakoo-opening.jpg', type: 'image', size: 955000, by: 'Upendo Lyimo', at: daysAgo(3), art: 1, w: 1600, h: 900 },
    { id: 'm9', name: 'supplier-terms.pdf', type: 'pdf', size: 310000, by: 'Neema Kimaro', at: daysAgo(30) },
    { id: 'm10', name: 'moshi-team.jpg', type: 'image', size: 720000, by: 'Baraka Mushi', at: daysAgo(15), art: 4, w: 1400, h: 933 },
  ]);
  const mediaById = (id) => MEDIA.find(m => m.id === id);

  const MediaThumb = {
    props: { m: Object, size: { default: 'md' } },
    template: `<div :class="['relative grid shrink-0 place-items-center overflow-hidden', size==='sm' ? 'h-10 w-10 rounded-md' : 'aspect-[4/3] w-full rounded-lg']" :style="m.type==='image' && !m.url && m.art!=null ? { background: 'linear-gradient(135deg,' + ART[m.art][0] + ',' + ART[m.art][1] + ')' } : null" :class="m.type!=='image' || (!m.url && m.art==null) ? 'bg-muted' : ''">
      <img v-if="m.url" :src="m.url" :alt="m.name" class="h-full w-full object-cover">
      <template v-else-if="m.type==='image'"><svg viewBox="0 0 40 30" class="h-1/2 w-1/2 opacity-70" aria-hidden="true"><circle cx="12" cy="9" r="4" fill="white"/><path d="M0 30 L14 16 L22 24 L28 18 L40 30 Z" fill="white"/></svg></template>
      <Icon v-else :name="FTYPE[m.type].icon" :size="size==='sm' ? 18 : 28" class="text-muted-foreground"/>
    </div>`,
    setup() { return { ART, FTYPE }; }
  };

  /* ---------- File picker: Upload or Media library; uploads become media ids at once (rules) */
  const FilePicker = {
    props: { modelValue: [Array, String], multiple: Boolean, accept: { default: 'any' }, maxSize: { default: 10 }, maxFiles: { default: 5 }, label: String, required: Boolean, help: String, id: { default: () => ulid('fp') } },
    emits: ['update:modelValue'],
    setup(p, { emit }) {
      const F = reactive({ drag: false, items: [], lib: false, preview: null });
      const ids = computed(() => p.multiple ? (p.modelValue || []) : (p.modelValue ? [p.modelValue] : []));
      const files = computed(() => ids.value.map(mediaById).filter(Boolean));
      const acceptAttr = { image: 'image/*', pdf: '.pdf', any: '' }[p.accept];
      const acceptText = { image: 'Images (PNG, JPG, WEBP)', pdf: 'PDF documents', any: 'Any file type' }[p.accept];
      const room = computed(() => p.multiple ? p.maxFiles - ids.value.length - F.items.filter(i => i.state === 'uploading').length : (ids.value.length || F.items.some(i => i.state === 'uploading') ? 0 : 1));
      const input = ref(null), cam = ref(null);
      function setIds(list) { emit('update:modelValue', p.multiple ? list : (list[list.length - 1] || '')); }
      function addFiles(list) {
        list = Array.from(list);
        if (!p.multiple) list = list.slice(0, 1);
        list.forEach((file, i) => {
          const t = typeOfName(file.name, file.type);
          const it = reactive({ key: ulid('up'), name: file.name, size: file.size, type: t, url: t === 'image' ? URL.createObjectURL(file) : null, progress: 0, state: 'uploading', error: '' });
          if (p.accept === 'image' && t !== 'image') { it.state = 'failed'; it.error = 'Not an image. Allowed: ' + acceptText + '.'; }
          else if (p.accept === 'pdf' && t !== 'pdf') { it.state = 'failed'; it.error = 'Only PDF files are allowed.'; }
          else if (file.size > p.maxSize * 1048576) { it.state = 'failed'; it.error = 'Too large: ' + fmtSize(file.size) + '. The limit is ' + p.maxSize + ' MB.'; }
          else if (p.multiple && i >= room.value) { it.state = 'failed'; it.error = 'Only ' + p.maxFiles + ' files allowed here.'; }
          F.items.push(it);
          if (it.state === 'uploading') run(it);
        });
      }
      function run(it) {
        it.state = 'uploading'; it.error = ''; it.progress = 0;
        it.timer = setInterval(() => {
          it.progress = Math.min(100, it.progress + 8 + Math.random() * 18);
          if (it.progress >= 100) {
            clearInterval(it.timer);
            const m = { id: ulid('m'), name: it.name, type: it.type, size: it.size, by: 'Amina Juma', at: isoDay(TODAY), url: it.url, unattached: true };
            MEDIA.unshift(m); setIds(p.multiple ? [...ids.value, m.id] : [m.id]);
            F.items.splice(F.items.indexOf(it), 1);
          }
        }, 160);
      }
      function cancel(it) { clearInterval(it.timer); F.items.splice(F.items.indexOf(it), 1); }
      function retry(it) { if (/Too large|Not an|Only/.test(it.error)) return; run(it); }
      function remove(id) { setIds(ids.value.filter(x => x !== id)); }
      function onDrop(e) { F.drag = false; if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }
      function onPaste(e) { const fs = [...(e.clipboardData ? e.clipboardData.files : [])]; if (fs.length) { e.preventDefault(); addFiles(fs); } }
      function fromLibrary(list) { setIds(p.multiple ? [...new Set([...ids.value, ...list])].slice(0, p.maxFiles) : list.slice(-1)); F.lib = false; }
      onBeforeUnmount(() => F.items.forEach(i => clearInterval(i.timer)));
      return { F, files, acceptAttr, acceptText, room, input, cam, addFiles, cancel, retry, remove, onDrop, onPaste, fromLibrary, fmtSize, FTYPE, isPhoneNow, G };
    },
    template: `<div class="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <span v-if="label" :class="['text-sm font-medium', required && 'after:ml-0.5 after:text-destructive after:content-[\\'*\\']']">{{ label }}</span>
      <div v-if="room > 0" tabindex="0" @dragover.prevent="F.drag=true" @dragleave.prevent="F.drag=false" @drop.prevent="onDrop" @paste="onPaste" @keydown.enter.prevent="input.click()" :aria-label="(label || 'Files') + ': drop files, paste an image, or browse'"
        :class="['grid place-items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', F.drag ? 'border-primary bg-primary/5' : 'hover:bg-muted/40']">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="CloudUpload" :size="18"/></span>
        <p class="text-sm"><span class="hidden sm:inline">Drag {{ multiple ? 'files' : 'a file' }} here, paste an image, or </span><span class="sm:hidden">Add {{ multiple ? 'files' : 'a file' }} from </span></p>
        <div class="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" @click="input.click()"><Icon name="FolderUp" :size="14"/>{{ isPhoneNow() ? 'Files' : 'Browse' }}</Button>
          <Button v-if="accept==='image' || accept==='any'" size="sm" variant="outline" class="sm:hidden" @click="cam.click()"><Icon name="Camera" :size="14"/>Camera</Button>
          <Button size="sm" variant="outline" @click="F.lib=true"><Icon name="Library" :size="14"/>Media library</Button></div>
        <p class="text-xs text-muted-foreground">{{ acceptText }} · up to {{ maxSize }} MB<template v-if="multiple"> · {{ maxFiles }} files max</template></p>
        <input ref="input" type="file" class="hidden" :accept="acceptAttr" :multiple="multiple" @change="addFiles($event.target.files); $event.target.value=''">
        <input ref="cam" type="file" class="hidden" accept="image/*" capture="environment" @change="addFiles($event.target.files); $event.target.value=''">
      </div>
      <ul v-if="files.length || F.items.length" class="grid grid-cols-[minmax(0,1fr)] gap-1.5">
        <li v-for="it in F.items" :key="it.key" :class="['flex items-center gap-3 rounded-lg border p-2', it.state==='failed' && 'border-destructive/40 bg-destructive/5']">
          <MediaThumb :m="it" size="sm"/>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ it.name }}</p>
            <div v-if="it.state==='uploading'" class="mt-1 flex items-center gap-2"><div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-primary transition-[width] duration-150" :style="{ width: it.progress + '%' }"></div></div><span class="w-9 text-right text-[11px] tnum text-muted-foreground">{{ Math.round(it.progress) }}%</span></div>
            <p v-else class="text-xs text-destructive">{{ it.error }}</p></div>
          <Button v-if="it.state==='uploading'" variant="ghost" size="sm" class="h-7" @click="cancel(it)">Cancel</Button>
          <template v-else><Button v-if="!/Too large|Not an|Only/.test(it.error)" variant="ghost" size="sm" class="h-7" @click="retry(it)">Retry</Button><Button variant="ghost" size="icon-sm" aria-label="Dismiss" @click="cancel(it)"><Icon name="X" :size="14"/></Button></template>
        </li>
        <li v-for="m in files" :key="m.id" class="flex items-center gap-3 rounded-lg border p-2">
          <button type="button" class="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :aria-label="'Preview ' + m.name" @click="F.preview = m"><MediaThumb :m="m" size="sm"/></button>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ m.name }}</p><p class="text-xs text-muted-foreground">{{ FTYPE[m.type].label }} · {{ fmtSize(m.size) }}<template v-if="m.unattached"> · uploaded</template></p></div>
          <Tooltip content="Preview" side="left"><Button variant="ghost" size="icon-sm" :aria-label="'Preview ' + m.name" @click="F.preview = m"><Icon name="Eye" :size="15"/></Button></Tooltip>
          <Tooltip content="Download" side="left"><Button variant="ghost" size="icon-sm" :aria-label="'Download ' + m.name" @click="G.toast('Downloading ' + m.name, 'Fetched as a blob with your session token.', 'Download')"><Icon name="Download" :size="15"/></Button></Tooltip>
          <Tooltip content="Remove" side="left"><Button variant="ghost" size="icon-sm" :aria-label="'Remove ' + m.name" @click="remove(m.id)"><Icon name="X" :size="15"/></Button></Tooltip>
        </li>
      </ul>
      <p v-if="help" class="text-xs text-muted-foreground">{{ help }}</p>
      <MediaLibraryDialog :open="F.lib" @update:open="v => F.lib = v" :multiple="multiple" :accept="accept" :max="multiple ? room : 1" @pick="fromLibrary"/>
      <Dialog :open="!!F.preview" @update:open="v => { if (!v) F.preview = null }">
        <template v-if="F.preview"><div class="grid gap-1 pr-6"><h2 class="truncate text-lg font-semibold leading-none">{{ F.preview.name }}</h2><p class="text-sm text-muted-foreground">{{ FTYPE[F.preview.type].label }} · {{ fmtSize(F.preview.size) }} · added by {{ F.preview.by }}</p></div>
          <MediaThumb :m="F.preview"/></template></Dialog>
    </div>`
  };

  const MediaLibraryDialog = {
    props: { open: Boolean, multiple: Boolean, accept: { default: 'any' }, max: { default: 1 } },
    emits: ['update:open', 'pick'],
    setup(p, { emit }) {
      const M = reactive({ q: '', type: 'all', sel: [] });
      watch(() => p.open, v => { if (v) { M.q = ''; M.sel = []; M.type = p.accept === 'image' ? 'image' : p.accept === 'pdf' ? 'pdf' : 'all'; } });
      const list = computed(() => MEDIA.filter(m => (M.type === 'all' || m.type === M.type) && (p.accept === 'any' || m.type === p.accept) && (!M.q.trim() || m.name.toLowerCase().includes(M.q.trim().toLowerCase()))));
      function toggle(m) { if (!p.multiple) { M.sel = [m.id]; return; } const i = M.sel.indexOf(m.id); if (i >= 0) M.sel.splice(i, 1); else if (M.sel.length < p.max) M.sel.push(m.id); }
      const types = computed(() => [{ value: 'all', label: 'All' }, ...Object.entries(FTYPE).filter(([k]) => p.accept === 'any' || k === p.accept).map(([value, t]) => ({ value, label: t.label }))]);
      return { M, list, toggle, types, fmtSize, emit };
    },
    template: `<Dialog :open="open" @update:open="v => emit('update:open', v)">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Media library</h2><p class="text-sm text-muted-foreground">Pick {{ multiple ? 'up to ' + max + ' files' : 'a file' }} already uploaded to this organisation.</p></div>
      <div class="grid gap-2"><div class="relative"><Icon name="Search" :size="14" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input class="pl-8" v-model="M.q" placeholder="Search files"/></div>
        <div v-if="types.length > 2" class="flex flex-wrap gap-1.5"><button v-for="t in types" :key="t.value" type="button" :aria-pressed="M.type===t.value" @click="M.type=t.value" :class="['h-7 rounded-full border px-3 text-xs font-medium', M.type===t.value ? 'border-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent']">{{ t.label }}</button></div></div>
      <div class="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain p-0.5 sm:grid-cols-3" role="listbox" :aria-multiselectable="multiple" aria-label="Files">
        <button v-for="m in list" :key="m.id" type="button" role="option" :aria-selected="M.sel.includes(m.id)" @click="toggle(m)" :class="['relative grid gap-1.5 rounded-lg border p-1.5 text-left transition-colors', M.sel.includes(m.id) ? 'border-primary ring-2 ring-primary/30' : 'hover:bg-muted/50']">
          <MediaThumb :m="m"/><span class="truncate px-0.5 text-xs font-medium">{{ m.name }}</span><span class="px-0.5 text-[11px] text-muted-foreground">{{ fmtSize(m.size) }}</span>
          <span v-if="M.sel.includes(m.id)" class="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground shadow"><Icon name="Check" :size="12"/></span></button>
        <p v-if="!list.length" class="col-span-full flex h-32 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground"><Icon name="FolderSearch" :size="24" class="text-muted-foreground/60"/>No files match.</p>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="emit('update:open', false)">Cancel</Button><Button :disabled="!M.sel.length" @click="emit('pick', [...M.sel])"><Icon name="Check" :size="14"/>{{ M.sel.length > 1 ? 'Use ' + M.sel.length + ' files' : 'Use file' }}</Button></div>
    </Dialog>`
  };

  /* ---------- Media page (System › Content › Media), toolbar per D31 */
  const MediaPage = {
    setup() {
      const LS = useList({ noun: 'files', rows: () => MEDIA, search: (m, q) => m.name.toLowerCase().includes(q), sort: 'at', dir: 'desc',
        sorts: [{ value: 'at', label: 'Uploaded', get: m => m.at }, { value: 'name', label: 'Name', get: m => m.name }, { value: 'size', label: 'Size', get: m => m.size }],
        fields: () => [{ key: 'type', label: 'Type', type: 'select', options: Object.entries(FTYPE).map(([value, t]) => ({ value, label: t.label })), get: m => m.type }, { key: 'by', label: 'Uploaded by', type: 'select', options: [...new Set(MEDIA.map(m => m.by))].map(v => ({ value: v, label: v })), get: m => m.by }, { key: 'size', label: 'Size (bytes)', type: 'number', get: m => m.size }, { key: 'at', label: 'Uploaded', type: 'date', get: m => m.at }] });
      watchEffect(() => { if (G.view === 'media') listCount.value = (G.search || '').trim().length >= 2 ? LS.rows.value.length : null; });
      const U = reactive({ open: false, files: [], view: null });
      registerUrlList(LS, { get: () => G.search || '', set: (v) => { G.search = v; } });   // P39: search, sort and filters live in the link
      return { LS, U, fmtSize, FTYPE, fmtDay, G, canManage };
    },
    template: `<div class="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-4">
      <div><h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Media</h2><p class="text-sm text-muted-foreground">Every file uploaded in {{ G.org.name }}. Forms, locations and settings pick from here.</p></div>
      <ListToolbar :list="LS"><Button v-if="canManage()" size="sm" @click="U.open=true"><Icon name="Upload" :size="15"/>Upload</Button></ListToolbar>
      <div v-if="LS.rows.value.length" :class="['grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-5 [&>*]:min-w-0', LS.S.loading && 'pointer-events-none opacity-60']">
        <button v-for="(m, i) in LS.rows.value" :key="m.id" type="button" @click="U.view=m" class="kpi grid gap-2 rounded-xl border bg-card p-2 text-left shadow-sm transition-shadow hover:shadow-md" :style="{ animationDelay: (i*30)+'ms' }">
          <MediaThumb :m="m"/><span class="min-w-0 px-0.5"><span class="block truncate text-sm font-medium">{{ m.name }}</span><span class="block truncate text-xs text-muted-foreground">{{ fmtSize(m.size) }} · {{ fmtDay(m.at) }}</span></span></button></div>
      <div v-else class="flex h-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center"><Icon name="FolderSearch" :size="24" class="text-muted-foreground/60"/><p class="text-sm text-muted-foreground">No files match.</p></div>
      <Dialog v-model:open="U.open"><div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Upload files</h2><p class="text-sm text-muted-foreground">Files go into the library straight away.</p></div>
        <FilePicker v-model="U.files" multiple :max-files="10" :max-size="25"/>
        <div class="flex justify-end"><Button @click="U.open=false; U.files=[]">Done</Button></div></Dialog>
      <Dialog :open="!!U.view" @update:open="v => { if (!v) U.view = null }"><template v-if="U.view"><div class="grid gap-1 pr-6"><h2 class="truncate text-lg font-semibold leading-none">{{ U.view.name }}</h2><p class="text-sm text-muted-foreground">{{ FTYPE[U.view.type].label }} · {{ fmtSize(U.view.size) }} · {{ U.view.by }} · {{ fmtDay(U.view.at) }}</p></div><MediaThumb :m="U.view"/>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="U.view=null">Close</Button><Button @click="G.toast('Downloading ' + U.view.name, '', 'Download')"><Icon name="Download" :size="14"/>Download</Button></div></template></Dialog>
    </div>`
  };

  /* ---------- API select: server search from 2 letters, paged, subtitle, chips, create-new (rules) */
  const WARD_NAMES = ['Kati', 'Unga Limited', 'Sombetini', 'Kaloleni', 'Levolosi', 'Themi', 'Sekei', 'Olorien', 'Mawenzi', 'Kiusa', 'Majengo', 'Pasua', 'Bondeni', 'Pamba', 'Mirongo', 'Isamilo', 'Nyamagana', 'Igogo', 'Mkuyuni', 'Kambarage', 'Ndala', 'Kariakoo', 'Gerezani', 'Mchikichini', 'Upanga Mashariki', 'Upanga Magharibi', 'Kivukoni', 'Msasani', 'Mikocheni', 'Kinondoni', 'Ubungo', 'Sinza', 'Manzese', 'Mbezi', 'Kurasini', 'Temeke', 'Chang\'ombe', 'Tandika', 'Dunda', 'Magomeni', 'Tumbi', 'Mailimoja', 'Kibaha', 'Mlandizi', 'Chalinze', 'Uhuru', 'Mjini', 'Kilimani', 'Makorora', 'Chumbageni'];
  const DISTRICTS = ['Arusha City', 'Moshi Municipal', 'Nyamagana', 'Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Bagamoyo', 'Kibaha', 'Tanga City'];
  const WARDS = WARD_NAMES.flatMap((w, i) => [{ value: w, label: w, sub: DISTRICTS[i % DISTRICTS.length] + ' district' }, { value: w + ' Kusini', label: w + ' Kusini', sub: DISTRICTS[(i + 3) % DISTRICTS.length] + ' district' }]);
  const SELECT_SOURCES = {
    /* all(): every row the server knows (incl. archived / out of scope), so the ids[] lookup can describe them */
    locations: { noun: 'locations', perm: 'Locations.create', create: 'New location', paging: 'page', all: () => locsOf().map(l => ({ value: l.id, label: l.name, sub: LTYPES[l.type].label + ' · ' + l.code + (l.parent ? ' · in ' + (locById(l.parent) || {}).name : ''), status: l.status === 'inactive' ? 'archived' : 'active', restricted: !inScope(l.id) })) },
    members: { noun: 'people', perm: 'Users.create', create: 'Invite someone', paging: 'page', all: () => MEMBERS.map(m => ({ value: m.email, label: m.name, sub: ROLE[m.role] + ' · ' + (m.email || m.phone), status: 'active' })) },
    forms: { noun: 'forms', perm: 'Forms.create', paging: 'page', all: () => FORMS.map(f => ({ value: f.id, label: f.title, sub: (STAT[f.status] || {}).label + ' · ' + f.responses + ' responses', status: f.status === 'archived' ? 'archived' : 'active', restricted: !formVisible(f) })) },
    wards: { noun: 'wards', paging: 'cursor', all: () => WARDS.map(w => ({ ...w, status: 'active' })) },
  };
  const API_FAIL = ref(false);
  const SELECT_LOG = reactive([]); // the prototype's network panel: what the real client would send
  /* ---- simulated GET /select/{module}: ranked search, page or keyset cursor, has_more, ids[] lookup */
  function selectServer(module, q) {
    const src = SELECT_SOURCES[module]; const full = src.all();
    const s = (q.search || '').trim().toLowerCase();
    const rank = (r) => { const l = r.label.toLowerCase(); return !s ? 0 : l === s ? 0 : l.startsWith(s) ? 1 : (l + ' ' + (r.sub || '')).toLowerCase().includes(s) ? 2 : 9; };
    let rows = full.filter(r => !r.restricted && r.status !== 'archived' && !(q.exclude || []).includes(r.value) && (s.length < 2 || rank(r) < 9));
    rows.sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label) || String(a.value).localeCompare(String(b.value)));
    const per = q.per_page ?? 20; let data, meta;
    if (per === 0) { data = []; meta = { has_more: false }; } else
    if (src.paging === 'cursor') { const key = (r) => rank(r) + '|' + r.label + '|' + r.value; const after = q.after ? decodeURIComponent(escape(atob(q.after))) : ''; const start = after ? rows.findIndex(r => key(r) > after) : 0; data = start < 0 ? [] : rows.slice(start, start + per); const more = start >= 0 && start + per < rows.length; meta = { has_more: more, next_cursor: more ? btoa(unescape(encodeURIComponent(key(data[data.length - 1])))).replace(/=+$/, '') : null }; }
    else { const page = q.page || 1; data = rows.slice((page - 1) * per, page * per); meta = { has_more: page * per < rows.length }; }
    const selected = (q.ids || []).map(id => { const r = full.find(x => x.value === id); if (!r) return { value: id, label: 'Deleted record', status: 'missing' }; if (r.restricted) return { value: id, label: 'Restricted record', status: 'restricted' }; return { value: r.value, label: r.label, sub: r.sub, status: r.status }; });
    return { data: data.map(({ restricted, ...r }) => r), selected, meta };
  }
  function selectRequest(module, q) {
    const params = Object.entries(q).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)).map(([k, v]) => Array.isArray(v) ? v.map(x => k + '[]=' + encodeURIComponent(x)).join('&') : k + '=' + encodeURIComponent(v)).join('&');
    const entry = reactive({ id: ulid('rq'), url: '/select/' + module + (params ? '?' + params : ''), state: 'pending', ms: 0, n: 0, at: Date.now() });
    SELECT_LOG.unshift(entry); if (SELECT_LOG.length > 12) SELECT_LOG.pop();
    const ms = 220 + Math.round(Math.random() * 260);
    return new Promise((res, rej) => setTimeout(() => { entry.ms = ms; if (API_FAIL.value) { entry.state = 'failed'; rej(new Error('Network error')); return; } const out = selectServer(module, q); entry.state = 'ok'; entry.n = out.data.length + out.selected.length; res(out); }, ms));
  }
  /* ---- layer c: one shared label store; layer b: ids[] lookups batched per module across every picker on the page */
  const LABELS = reactive({});
  const lkey = (m, id) => m + ':' + id;
  const PENDING = {}; let flushTimer = null;
  function rememberLabels(module, list) { (list || []).forEach(o => { if (o && o.value != null) LABELS[lkey(module, o.value)] = { label: o.label, sub: o.sub, status: o.status || 'active' }; }); }
  function resolveLabels(module, ids) {
    const miss = ids.filter(id => id && !LABELS[lkey(module, id)]); if (!miss.length) return;
    (PENDING[module] = PENDING[module] || new Set()); miss.forEach(id => PENDING[module].add(id));
    clearTimeout(flushTimer);
    flushTimer = setTimeout(() => { Object.entries(PENDING).forEach(([m, set]) => { const list = [...set]; delete PENDING[m]; list.forEach(id => { LABELS[lkey(m, id)] = { label: '', status: 'loading' }; }); selectRequest(m, { ids: list, per_page: 0 }).then(r => rememberLabels(m, r.selected)).catch(() => list.forEach(id => { LABELS[lkey(m, id)] = { label: String(id), status: 'unknown' }; })); }); }, 0);
  }
  /* ---- short cache: same module + filters + search reopens instantly, then revalidates */
  const SELECT_CACHE = new Map();

  const ApiSelect = {
    props: { modelValue: [String, Array], module: String, multiple: Boolean, placeholder: { default: 'Select' }, exclude: { type: Array, default: () => [] }, filters: { type: Object, default: () => ({}) }, selectedOptions: { type: Array, default: () => [] }, label: String, required: Boolean, help: String, error: String, disabled: Boolean, perPage: { default: 20 } },
    emits: ['update:modelValue', 'create'],
    setup(p, { emit }) {
      const pop = usePopover(() => 'start', true);
      const A = reactive({ q: '', rows: [], pinned: [], page: 1, cursor: null, hasMore: false, loading: false, more: false, failed: false, hi: 0, seq: 0 });
      const src = computed(() => SELECT_SOURCES[p.module]);
      const vals = computed(() => p.multiple ? (p.modelValue || []) : (p.modelValue ? [p.modelValue] : []));
      /* layer a: labels that came with the record */
      watch(() => p.selectedOptions, o => rememberLabels(p.module, o), { immediate: true });
      watch(vals, v => resolveLabels(p.module, v), { immediate: true });
      const selected = computed(() => vals.value.map(v => ({ value: v, ...(LABELS[lkey(p.module, v)] || { label: '', status: 'loading' }) })));
      const stale = computed(() => selected.value.filter(s => ['archived', 'restricted', 'missing'].includes(s.status)));
      const sheet = ref(false); const search = ref(null); const listEl = ref(null); const sentinel = ref(null);
      let timer = null, io = null;
      const cacheKey = () => p.module + '|' + JSON.stringify(p.filters) + '|' + p.exclude.join(',') + '|' + A.q.trim().toLowerCase();
      function query(next) { const q = { search: A.q.trim().length >= 2 ? A.q.trim() : '', per_page: p.perPage, exclude: [...p.exclude, ...(next || !A.q.trim() ? vals.value : [])], ...Object.fromEntries(Object.entries(p.filters).map(([k, v]) => ['filter[' + k + ']', v])) };
        if (src.value.paging === 'cursor') { if (next) q.after = A.cursor; } else q.page = next ? A.page + 1 : 1;
        if (!next) q.ids = vals.value; return q; }
      function load(next) {
        const seq = ++A.seq; A.failed = false; if (next) A.more = true; else A.loading = true;
        selectRequest(p.module, query(next)).then(r => {
          if (seq !== A.seq) return; /* a newer request won: drop this stale reply (AbortController in the build) */
          rememberLabels(p.module, r.data); rememberLabels(p.module, r.selected);
          if (next) { A.rows.push(...r.data); A.page++; } else { A.rows = r.data; A.page = 1; A.pinned = A.q.trim() ? [] : r.selected; A.hi = 0; }
          A.cursor = r.meta.next_cursor || null; A.hasMore = r.meta.has_more; A.loading = false; A.more = false;
          if (!next) SELECT_CACHE.set(cacheKey(), { rows: A.rows, pinned: A.pinned, hasMore: A.hasMore, cursor: A.cursor, at: Date.now() });
          nextTick(observe);
        }).catch(() => { if (seq !== A.seq) return; A.loading = false; A.more = false; A.failed = true; });
      }
      function fromCache() { const c = SELECT_CACHE.get(cacheKey()); if (c && Date.now() - c.at < 60000) { Object.assign(A, { rows: [...c.rows], pinned: [...c.pinned], hasMore: c.hasMore, cursor: c.cursor, page: 1 }); return true; } return false; }
      function observe() { if (io) io.disconnect(); if (!sentinel.value || !listEl.value) return; io = new IntersectionObserver(es => { if (es[0].isIntersecting && A.hasMore && !A.loading && !A.more) load(true); }, { root: listEl.value, rootMargin: '0px 0px 120px 0px' }); io.observe(sentinel.value); }
      function openIt() { if (p.disabled) return; A.q = ''; const hit = fromCache(); load(false); if (!hit) A.rows = []; if (isPhoneNow()) sheet.value = true; else pop.open.value = true; nextTick(() => { search.value && search.value.focus(); observe(); }); }
      watch(sheet, v => { if (v) nextTick(() => { search.value && search.value.focus(); observe(); }); });
      watch(() => A.q, () => { clearTimeout(timer); const len = A.q.trim().length; if (len === 1) return; A.loading = true; timer = setTimeout(() => { if (!fromCache()) A.rows = []; load(false); }, 300); });
      onBeforeUnmount(() => { if (io) io.disconnect(); clearTimeout(timer); });
      function close() { pop.open.value = false; sheet.value = false; if (io) io.disconnect(); }
      function choose(r) { rememberLabels(p.module, [r]); if (p.multiple) { const v = vals.value.includes(r.value) ? vals.value.filter(x => x !== r.value) : [...vals.value, r.value]; emit('update:modelValue', v); } else { emit('update:modelValue', r.value); close(); } }
      function clear() { emit('update:modelValue', p.multiple ? [] : ''); }
      const options = computed(() => [...A.pinned, ...A.rows]);
      function onKey(e) { const n = options.value.length; if (e.key === 'ArrowDown') { e.preventDefault(); A.hi = Math.min(n - 1, A.hi + 1); nextTick(() => { const el = listEl.value && listEl.value.querySelectorAll('[role=option]')[A.hi]; el && el.scrollIntoView({ block: 'nearest' }); }); } if (e.key === 'ArrowUp') { e.preventDefault(); A.hi = Math.max(0, A.hi - 1); } if (e.key === 'Enter' && options.value[A.hi]) { e.preventDefault(); choose(options.value[A.hi]); } if (e.key === 'Escape') close(); }
      const canCreate = computed(() => src.value.create && !G.viewAs && myPerms.value.includes(src.value.perm));
      function create() { close(); emit('create', A.q.trim()); }
      const mark = (s) => { const q = A.q.trim(); if (q.length < 2 || !s) return [s]; const i = s.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? [s] : [s.slice(0, i), s.slice(i, i + q.length), s.slice(i + q.length)]; };
      const STALE = { archived: '(archived)', restricted: '', missing: '' };
      return { ...pop, A, src, vals, selected, stale, STALE, sheet, search, listEl, sentinel, openIt, choose, clear, onKey, canCreate, create, mark, load, close, options, uid: ulid('as') };
    },
    template: `<div class="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <span v-if="label" :id="uid" :class="['text-sm font-medium', required && 'after:ml-0.5 after:text-destructive after:content-[\\'*\\']']">{{ label }}</span>
      <div class="relative" ref="root">
        <button type="button" :disabled="disabled" @click="open ? close() : openIt()" role="combobox" :aria-expanded="open || sheet" :aria-labelledby="label ? uid : null" :class="['flex min-h-9 w-full items-center gap-1.5 rounded-md border bg-transparent py-1 pl-3 pr-2 text-left text-sm shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50', error ? 'border-destructive' : stale.length ? 'border-warning/60' : 'border-input']">
          <span v-if="!selected.length" class="flex-1 truncate text-muted-foreground">{{ placeholder }}</span>
          <span v-else-if="!multiple" class="flex min-w-0 flex-1 items-center gap-1.5">
            <span v-if="selected[0].status==='loading'" class="h-3.5 w-28 animate-pulse rounded bg-muted" aria-label="Loading"></span>
            <template v-else><Icon v-if="selected[0].status==='restricted'" name="Lock" :size="13" class="shrink-0 text-muted-foreground"/><span :class="['truncate', ['archived','restricted','missing'].includes(selected[0].status) && 'text-muted-foreground']">{{ selected[0].label }}</span><span v-if="selected[0].status==='archived'" class="shrink-0 text-xs text-warning">(archived)</span></template></span>
          <span v-else class="flex min-w-0 flex-1 flex-wrap gap-1">
            <span v-for="s in selected.slice(0, 3)" :key="s.value" :class="['inline-flex max-w-[10rem] items-center gap-1 rounded-md py-0.5 pl-1.5 pr-0.5 text-xs', ['archived','restricted','missing'].includes(s.status) ? 'border border-warning/50 bg-warning/10 text-muted-foreground' : 'bg-secondary']">
              <span v-if="s.status==='loading'" class="h-3 w-14 animate-pulse rounded bg-muted-foreground/20"></span><template v-else><Icon v-if="s.status==='restricted'" name="Lock" :size="10" class="shrink-0"/><Icon v-else-if="s.status==='archived'" name="Archive" :size="10" class="shrink-0 text-warning"/><span class="truncate" :title="s.status==='archived' ? s.label + ' (archived)' : s.label">{{ s.label }}</span></template>
              <span role="button" tabindex="0" :aria-label="'Remove ' + (s.label || s.value)" @click.stop="choose(s)" class="grid h-4 w-4 place-items-center rounded text-muted-foreground hover:bg-background hover:text-foreground"><Icon name="X" :size="11"/></span></span>
            <Tooltip v-if="selected.length > 3" :content="selected.slice(3).map(s => s.label).join(', ')" side="bottom"><span class="rounded-md bg-secondary px-1.5 py-0.5 text-xs tnum">+{{ selected.length - 3 }}</span></Tooltip></span>
          <span v-if="selected.length" role="button" tabindex="0" aria-label="Clear" @click.stop="clear" class="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"><Icon name="X" :size="14"/></span>
          <Icon name="ChevronsUpDown" :size="15" class="shrink-0 opacity-50"/></button>
        <Teleport to="body">
          <Transition name="fade"><div v-if="sheet" class="fixed inset-0 z-[95] bg-black/60" @click="close"></div></Transition>
          <div v-if="open || sheet" ref="panel" :style="sheet ? null : pos" :class="['pop z-[96] flex flex-col overflow-hidden border bg-popover text-popover-foreground', sheet ? 'fixed inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl shadow-xl' : 'fixed max-h-80 min-w-[18rem] rounded-md shadow-md']" role="dialog" :aria-label="'Choose ' + src.noun">
            <div v-if="sheet" class="flex items-center justify-between border-b px-4 py-3"><p class="font-semibold">{{ label || ('Choose ' + src.noun) }}</p><Button variant="ghost" size="sm" @click="close">Done</Button></div>
            <div class="border-b p-1.5"><div class="relative"><Icon name="Search" :size="14" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"/><input ref="search" v-model="A.q" @keydown="onKey" :placeholder="'Search ' + src.noun" class="h-9 w-full rounded-md bg-transparent pl-8 pr-8 text-sm outline-none" aria-autocomplete="list"><Icon v-if="A.loading" name="LoaderCircle" :size="14" class="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"/></div></div>
            <div ref="listEl" class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1" role="listbox" :aria-multiselectable="multiple" :aria-busy="A.loading || A.more">
              <p v-if="A.q.trim().length === 1" class="px-2 py-1.5 text-xs text-muted-foreground">Type one more letter to search.</p>
              <div v-if="A.failed && !options.length" class="flex flex-col items-center gap-2 px-3 py-6 text-center"><Icon name="WifiOff" :size="22" class="text-muted-foreground/60"/><p class="text-sm text-muted-foreground">Couldn't load {{ src.noun }}.</p><Button size="sm" variant="outline" @click="load(false)"><Icon name="RotateCw" :size="13"/>Retry</Button></div>
              <template v-else>
                <p v-if="A.pinned.length" class="px-2 pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Selected</p>
                <button v-for="(r, i) in options" :key="r.value" type="button" role="option" :aria-selected="vals.includes(r.value)" :disabled="['restricted','missing'].includes(r.status)" @mouseenter="A.hi=i" @click="choose(r)" :class="['flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left disabled:cursor-default', A.hi===i ? 'bg-accent' : '', i===A.pinned.length && A.pinned.length ? 'mt-1 border-t pt-2' : '']">
                  <span v-if="multiple" :class="['grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-primary', vals.includes(r.value) && 'bg-primary text-primary-foreground']"><Icon v-if="vals.includes(r.value)" name="Check" :size="11" stroke-width="3"/></span>
                  <span class="min-w-0 flex-1"><span :class="['flex items-center gap-1.5 truncate text-sm', ['archived','restricted','missing'].includes(r.status) && 'text-muted-foreground']"><Icon v-if="r.status==='restricted'" name="Lock" :size="12"/><span class="truncate"><template v-for="(part, pi) in mark(r.label)" :key="pi"><mark v-if="pi===1" class="rounded-sm bg-primary/15 text-foreground">{{ part }}</mark><template v-else>{{ part }}</template></template></span><span v-if="r.status==='archived'" class="shrink-0 text-xs text-warning">(archived)</span></span><span v-if="r.sub" class="block truncate text-xs text-muted-foreground">{{ r.sub }}</span></span>
                  <Icon v-if="!multiple && vals.includes(r.value)" name="Check" :size="14"/></button>
                <div v-if="A.loading && !options.length" class="grid gap-1 p-1"><div v-for="n in 5" :key="n" class="h-9 animate-pulse rounded-sm bg-muted/70"></div></div>
                <p v-else-if="!A.loading && !options.length" class="flex flex-col items-center gap-1 px-3 py-6 text-center text-sm text-muted-foreground"><Icon name="SearchX" :size="22" class="text-muted-foreground/60"/>No {{ src.noun }} match "{{ A.q.trim() }}".</p>
                <div ref="sentinel" class="h-px" aria-hidden="true"></div>
                <p v-if="A.more" class="flex items-center justify-center gap-2 px-2 py-2 text-xs text-muted-foreground"><Icon name="LoaderCircle" :size="13" class="animate-spin"/>Loading more…</p>
                <p v-else-if="A.failed && options.length" class="flex items-center justify-center gap-2 px-2 py-2 text-xs text-muted-foreground">Couldn't load more.<button type="button" class="font-medium text-primary" @click="load(true)">Retry</button></p>
                <p v-else-if="options.length && !A.hasMore && !A.loading" class="px-2 py-1.5 text-center text-[11px] text-muted-foreground">That's all {{ options.length }}</p>
              </template>
            </div>
            <button v-if="canCreate" type="button" @click="create" class="flex items-center gap-2 border-t px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-accent"><Icon name="Plus" :size="15"/>{{ src.create }}<template v-if="A.q.trim()"> "{{ A.q.trim() }}"</template></button>
          </div>
        </Teleport>
      </div>
      <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
      <p v-else-if="stale.length" class="flex items-start gap-1.5 text-xs text-warning"><Icon name="TriangleAlert" :size="13" class="mt-px shrink-0"/><span>{{ stale.map(s => s.status==='archived' ? s.label + ' is archived' : s.status==='restricted' ? 'One value is outside what you can see' : 'One value was deleted').join('. ') }}. It stays saved until you change it.</span></p>
      <p v-else-if="help" class="text-xs text-muted-foreground">{{ help }}</p>
    </div>`
  };

  /* ---------- Rich text: Tiptap in the build; here a contenteditable stand-in with the same toolbar, shortcuts and allowlist */
  const ALLOWED = { P: [], H2: [], H3: [], STRONG: [], B: [], EM: [], I: [], U: [], A: ['href'], UL: [], OL: [], LI: [], BLOCKQUOTE: [], BR: [] };
  function sanitize(html) {
    const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    const walk = (node) => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) return;
      if (n.nodeType !== 1 || /^(SCRIPT|STYLE|IFRAME|OBJECT)$/.test(n.tagName)) { n.remove(); return; }
      walk(n);
      if (n.tagName === 'DIV') { const p = doc.createElement('p'); while (n.firstChild) p.appendChild(n.firstChild); n.replaceWith(p); return; }
      if (!ALLOWED[n.tagName]) { n.replaceWith(...n.childNodes); return; }
      [...n.attributes].forEach(a => { if (!ALLOWED[n.tagName].includes(a.name) || (a.name === 'href' && !/^(https?:|mailto:)/i.test(a.value))) n.removeAttribute(a.name); });
      if (n.tagName === 'A') { n.setAttribute('rel', 'noopener'); }
    });
    walk(doc.body.firstChild);
    return doc.body.firstChild.innerHTML;
  }
  const RichText = {
    props: { modelValue: String, label: String, max: Number, placeholder: { default: 'Write something…' }, required: Boolean, help: String },
    emits: ['update:modelValue'],
    setup(p, { emit }) {
      const ed = ref(null); const R = reactive({ link: false, url: '', active: {}, count: 0 });
      let saved = null;
      onMounted(() => { ed.value.innerHTML = sanitize(p.modelValue || ''); count(); });
      watch(() => p.modelValue, v => { if (ed.value && document.activeElement !== ed.value && sanitize(v || '') !== ed.value.innerHTML) { ed.value.innerHTML = sanitize(v || ''); count(); } });
      function count() { R.count = (ed.value.innerText || '').replace(/\n/g, '').length; }
      function sync() { count(); emit('update:modelValue', sanitize(ed.value.innerHTML)); state(); }
      function state() { try { R.active = { bold: document.queryCommandState('bold'), italic: document.queryCommandState('italic'), underline: document.queryCommandState('underline'), ul: document.queryCommandState('insertUnorderedList'), ol: document.queryCommandState('insertOrderedList'), block: (document.queryCommandValue('formatBlock') || '').toLowerCase() }; } catch (e) {} }
      function cmd(c, v) { ed.value.focus(); document.execCommand(c, false, v); sync(); }
      function block(tag) { const cur = (document.queryCommandValue('formatBlock') || '').toLowerCase(); cmd('formatBlock', cur === tag ? 'p' : tag); }
      function askLink() { const s = window.getSelection(); saved = s.rangeCount ? s.getRangeAt(0).cloneRange() : null; R.url = 'https://'; R.link = true; }
      function setLink() { R.link = false; ed.value.focus(); const s = window.getSelection(); if (saved) { s.removeAllRanges(); s.addRange(saved); } if (/^(https?:\/\/.+|mailto:.+)$/.test(R.url)) cmd('createLink', R.url); }
      function onPaste(e) { e.preventDefault(); const html = e.clipboardData.getData('text/html'); const text = e.clipboardData.getData('text/plain'); document.execCommand('insertHTML', false, html ? sanitize(html) : text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>')); sync(); }
      function onKey(e) {
        if (e.key === ' ') { /* Markdown shortcuts at the start of a line */
          const s = window.getSelection(); if (!s.rangeCount) return; const n = s.anchorNode; if (!n || n.nodeType !== 3) return; const before = n.textContent.slice(0, s.anchorOffset);
          const map = { '-': 'ul', '*': 'ul', '1.': 'ol', '>': 'quote', '##': 'h2', '###': 'h3' }; const k = map[before];
          if (!k || n.previousSibling) return; e.preventDefault(); n.textContent = n.textContent.slice(s.anchorOffset); const r = document.createRange(); r.setStart(n, 0); r.collapse(true); s.removeAllRanges(); s.addRange(r);
          if (k === 'ul') cmd('insertUnorderedList'); else if (k === 'ol') cmd('insertOrderedList'); else if (k === 'quote') cmd('formatBlock', 'blockquote'); else cmd('formatBlock', k);
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); askLink(); }
      }
      const over = computed(() => p.max && R.count > p.max);
      const tools = [['bold', 'Bold', 'Bold', () => cmd('bold')], ['italic', 'Italic', 'Italic', () => cmd('italic')], ['underline', 'Underline', 'Underline', () => cmd('underline')], ['sep'], ['h2', 'Heading2', 'Heading', () => block('h2')], ['h3', 'Heading3', 'Subheading', () => block('h3')], ['quote', 'TextQuote', 'Quote', () => block('blockquote')], ['sep'], ['ul', 'List', 'Bulleted list', () => cmd('insertUnorderedList')], ['ol', 'ListOrdered', 'Numbered list', () => cmd('insertOrderedList')], ['sep'], ['link', 'Link', 'Link (Ctrl+K)', askLink], ['clear', 'RemoveFormatting', 'Clear formatting', () => { cmd('removeFormat'); cmd('formatBlock', 'p'); }]];
      const isOn = (k) => R.active[k] || (k === 'h2' && R.active.block === 'h2') || (k === 'h3' && R.active.block === 'h3') || (k === 'quote' && R.active.block === 'blockquote');
      return { ed, R, sync, state, onPaste, onKey, tools, isOn, setLink, over, uid: ulid('rt') };
    },
    template: `<div class="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <span v-if="label" :id="uid" :class="['text-sm font-medium', required && 'after:ml-0.5 after:text-destructive after:content-[\\'*\\']']">{{ label }}</span>
      <div :class="['overflow-hidden rounded-md border bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring', over ? 'border-destructive' : 'border-input']">
        <div class="sticky top-0 z-[1] flex items-center gap-0.5 overflow-x-auto border-b bg-muted/40 p-1" role="toolbar" :aria-label="(label || 'Text') + ' formatting'">
          <template v-for="(t, i) in tools" :key="i"><span v-if="t[0]==='sep'" class="mx-0.5 h-5 w-px shrink-0 bg-border"></span>
            <button v-else type="button" @mousedown.prevent @click="t[3]()" :aria-label="t[2]" :title="t[2]" :aria-pressed="!!isOn(t[0])" :class="['grid h-8 w-8 shrink-0 place-items-center rounded', isOn(t[0]) ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background hover:text-foreground']"><Icon :name="t[1]" :size="15"/></button></template>
        </div>
        <div v-if="R.link" class="flex items-center gap-2 border-b p-1.5"><Icon name="Link" :size="14" class="ml-1 text-muted-foreground"/><input v-model="R.url" @keydown.enter.prevent="setLink" @keydown.esc="R.link=false" class="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Link address" autofocus><Button size="sm" class="h-7" @click="setLink">Add link</Button><Button size="sm" variant="ghost" class="h-7" @click="R.link=false">Cancel</Button></div>
        <div ref="ed" contenteditable="true" role="textbox" aria-multiline="true" :aria-labelledby="label ? uid : null" :data-placeholder="placeholder" @input="sync" @keyup="state" @mouseup="state" @paste="onPaste" @keydown="onKey" class="rt-body max-h-72 min-h-[7rem] overflow-y-auto px-3 py-2 text-sm outline-none"></div>
        <div v-if="max" :class="['flex justify-end border-t px-3 py-1 text-[11px] tnum', over ? 'text-destructive' : 'text-muted-foreground']">{{ R.count }} / {{ max }}</div>
      </div>
      <p v-if="over" class="text-xs text-destructive">Too long by {{ R.count - max }} characters.</p><p v-else-if="help" class="text-xs text-muted-foreground">{{ help }}</p>
    </div>`
  };

  /* ---------- Drafts (Cobley useFormDraft behaviour; server store simulated) */
  const DRAFTS = reactive([
    { id: 'd1', module: 'Locations', form: 'create', key: 'k-loc-1', title: 'New location: Dodoma Branch', org: 'k', payload: { name: 'Dodoma Branch', code: 'DOD-01', type: 'branch', parent: 'cz' }, at: Date.now() - 3 * 3600e3 },
    { id: 'd2', module: 'Locations', form: 'edit', key: 'aru', title: 'Arusha Branch: details', org: 'k', payload: { hours: 'Mon–Sat 07:30–21:00, Sun 10:00–16:00', phone: '+255 27 254 1120' }, at: Date.now() - 2 * 3600e3 },
  ]);
  const agoLong = (t) => { const s = Math.round((nowTick.value - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' hours ago' : Math.round(s / 86400) + ' days ago'; };
  const clock = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  function useFormDraft(o) {
    /* o: { module, title(), recordKey?, getPayload(), applyPayload(p), exclude? } */
    const isEdit = !!o.recordKey; const rk = () => typeof o.recordKey === 'function' ? o.recordKey() : o.recordKey;
    const D = reactive({ key: isEdit ? rk() : null, state: 'idle', savedAt: null, armed: false, pendingRestore: null, initial: '' });
    let timer = null;
    const mine = () => DRAFTS.filter(d => d.org === G.org.id && d.module === o.module && d.form === (isEdit ? 'edit' : 'create') && (!isEdit || d.key === rk()));
    const list = computed(() => isEdit ? [] : mine().sort((a, b) => b.at - a.at));
    const payload = () => { const p = { ...o.getPayload() }; (o.exclude || []).forEach(k => delete p[k]); return p; };
    function arm() { D.initial = JSON.stringify(payload()); D.armed = true; if (isEdit) { const d = mine()[0]; D.pendingRestore = d || null; } }
    function save(manual) {
      if (D.pendingRestore || G.viewAs) return;
      const now = JSON.stringify(payload());
      if (now === D.initial) { discard(true); return; }
      D.state = 'saving';
      setTimeout(() => {
        let d = DRAFTS.find(x => x.org === G.org.id && x.module === o.module && x.key === D.key);
        if (!D.key) D.key = ulid('dk');
        if (!d) { d = reactive({ id: ulid('d'), module: o.module, form: isEdit ? 'edit' : 'create', key: D.key, org: G.org.id }); DRAFTS.push(d); }
        Object.assign(d, { title: o.title(), payload: JSON.parse(now), at: Date.now() }); D.state = 'saved'; D.savedAt = Date.now();
        if (manual) G.toast('Draft saved', 'Find it again in My drafts, on any device.', 'Save');
      }, 450);
    }
    function touch() { if (!D.armed || D.pendingRestore) return; clearTimeout(timer); D.state = 'dirty'; timer = setTimeout(() => save(false), 4000); }
    function discard(silent) { const i = DRAFTS.findIndex(x => x.org === G.org.id && x.module === o.module && x.key === D.key); if (i >= 0) DRAFTS.splice(i, 1); if (!isEdit) D.key = null; D.state = 'idle'; D.savedAt = null; }
    function flush() { clearTimeout(timer); if (D.state === 'dirty') save(false); }
    function resume(d) { o.applyPayload(d.payload); D.key = d.key; D.state = 'saved'; D.savedAt = d.at; D.initial = '__'; }
    function restore() { o.applyPayload(D.pendingRestore.payload); D.state = 'saved'; D.savedAt = D.pendingRestore.at; D.pendingRestore = null; D.initial = '__'; }
    function dismiss() { const i = DRAFTS.indexOf(D.pendingRestore); if (i >= 0) DRAFTS.splice(i, 1); D.pendingRestore = null; }
    function deleteDraft(d) { const i = DRAFTS.indexOf(d); if (i >= 0) DRAFTS.splice(i, 1); if (d.key === D.key) { D.key = null; D.state = 'idle'; } }
    function onSuccess() { clearTimeout(timer); discard(true); }
    onBeforeUnmount(() => clearTimeout(timer));
    return { D, isEdit, list, arm, touch, save, flush, resume, restore, dismiss, deleteDraft, onSuccess };
  }
  const DraftBanner = {
    props: { draft: Object },
    setup() { return { agoLong, P: reactive({ open: false }) }; },
    template: `<div v-if="!draft.isEdit && draft.list.value.length" class="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
        <Icon name="History" :size="15" class="shrink-0 text-muted-foreground"/><span class="min-w-0 flex-1 truncate">You have {{ draft.list.value.length }} {{ draft.list.value.length === 1 ? 'draft' : 'drafts' }} for this form.</span>
        <Button type="button" size="sm" variant="outline" class="h-7" @click="P.open=true">View drafts</Button></div>
      <div v-else-if="draft.isEdit && draft.D.pendingRestore" class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm" role="status">
        <Icon name="History" :size="15" class="shrink-0 text-warning"/><span class="min-w-0 flex-1">You have unsaved changes from {{ agoLong(draft.D.pendingRestore.at) }}.</span>
        <div class="flex gap-2"><Button type="button" size="sm" variant="outline" class="h-7 bg-background" @click="draft.dismiss()">Discard</Button><Button type="button" size="sm" class="h-7" @click="draft.restore()">Restore</Button></div></div>
      <Dialog v-model:open="P.open"><div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">Your drafts</h2><p class="text-sm text-muted-foreground">Saved automatically. Resume one to keep going.</p></div>
        <ul class="divide-y rounded-lg border"><li v-for="d in draft.list.value" :key="d.id" class="flex items-center gap-3 px-3 py-2"><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ d.title }}</p><p class="text-xs text-muted-foreground">Saved {{ agoLong(d.at) }}<template v-if="d.key===draft.D.key"> · <span class="font-medium text-foreground">open now</span></template></p></div>
          <Button v-if="d.key!==draft.D.key" type="button" size="sm" variant="outline" class="h-7" @click="draft.resume(d); P.open=false">Resume</Button>
          <Button type="button" size="icon-sm" variant="ghost" class="text-destructive" :aria-label="'Delete draft ' + d.title" @click="draft.deleteDraft(d); if (!draft.list.value.length) P.open=false"><Icon name="Trash2" :size="14"/></Button></li></ul></Dialog>`
  };
  const DraftStatus = {
    props: { draft: Object },
    setup() { return { clock }; },
    template: `<div class="flex items-center gap-2 text-xs text-muted-foreground sm:mr-auto" aria-live="polite">
      <template v-if="draft.D.state==='saving'"><Icon name="LoaderCircle" :size="13" class="animate-spin"/>Saving draft…</template>
      <template v-else-if="draft.D.state==='saved' && draft.D.savedAt"><Icon name="Check" :size="13" class="text-c1"/>Draft saved {{ clock(draft.D.savedAt) }}</template>
      <template v-else-if="draft.D.state==='dirty'"><Icon name="Circle" :size="9" class="fill-current"/>Unsaved changes</template>
      <Button v-if="draft.D.state==='dirty'" type="button" variant="ghost" size="sm" class="h-7 px-2" @click="draft.save(true)">Save draft</Button>
    </div>`
  };
  const MyDraftsSheet = {
    setup() {
      const list = computed(() => DRAFTS.filter(d => d.org === G.org.id).sort((a, b) => b.at - a.at));
      function resume(d) { G.myDrafts = false; if (d.module === 'Locations' && d.form === 'create') { nav('locations'); setTimeout(() => { G.newLoc = { draft: d.key }; }, 900); } else if (d.module === 'Locations') { G.locId = d.key; nav('location', 'details'); setTimeout(() => { G.editLoc = Date.now(); }, 900); } else G.toast('Opening ' + d.title, '', 'History'); }
      function del(d) { DRAFTS.splice(DRAFTS.indexOf(d), 1); G.toast('Draft deleted', d.title, 'Trash2'); }
      return { G, list, agoLong, resume, del };
    },
    template: `<Sheet :open="!!G.myDrafts" @update:open="v => G.myDrafts = v">
      <div class="border-b p-4 pr-12"><h2 class="font-semibold">My drafts</h2><p class="text-sm text-muted-foreground">Forms you started and didn't finish, in {{ G.org.name }}. They follow you to any device.</p></div>
      <div class="flex-1 overflow-y-auto p-3"><ul v-if="list.length" class="grid grid-cols-[minmax(0,1fr)] gap-2">
        <li v-for="d in list" :key="d.id" class="flex items-center gap-3 rounded-lg border p-3"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon :name="d.form==='edit' ? 'FilePen' : 'FilePlus'" :size="16"/></span>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ d.title }}</p><p class="text-xs text-muted-foreground">{{ d.module }} · {{ d.form==='edit' ? 'edit' : 'new' }} · saved {{ agoLong(d.at) }}</p></div>
          <Button size="sm" variant="outline" class="h-7" @click="resume(d)">Resume</Button><Button size="icon-sm" variant="ghost" class="text-destructive" :aria-label="'Delete ' + d.title" @click="del(d)"><Icon name="Trash2" :size="14"/></Button></li></ul>
        <div v-else class="flex h-40 flex-col items-center justify-center gap-1 text-center"><Icon name="FileCheck" :size="24" class="text-muted-foreground/60"/><p class="text-sm text-muted-foreground">No drafts. Everything is saved.</p></div></div>
    </Sheet>`
  };

  /* ---------- Delete with dependency check + type YES gate */
  const DeleteDialog = {
    props: { open: Boolean, title: String, name: String, deps: { type: Array, default: () => [] }, blocking: Boolean },
    emits: ['update:open', 'confirm'],
    setup(p) { const yes = ref(''); const checking = ref(true); watch(() => p.open, v => { if (v) { yes.value = ''; checking.value = true; setTimeout(() => checking.value = false, 500); } }); return { yes, checking }; },
    template: `<Dialog :open="open" @update:open="v => $emit('update:open', v)">
      <div class="grid gap-1.5 pr-6"><h2 class="text-lg font-semibold leading-none">{{ title || 'Delete ' + name + '?' }}</h2><p class="text-sm text-muted-foreground">This can't be undone.</p></div>
      <div v-if="checking" class="flex items-center gap-2 text-sm text-muted-foreground"><Icon name="LoaderCircle" :size="15" class="animate-spin"/>Checking what depends on it…</div>
      <template v-else>
        <div v-if="deps.length" :class="['rounded-lg border p-3 text-sm', blocking ? 'border-destructive/40 bg-destructive/5' : 'bg-muted/40']"><p class="font-medium">{{ blocking ? 'Move or remove these first:' : 'Also affected:' }}</p><ul class="mt-1.5 grid gap-1"><li v-for="d in deps" :key="d.label" class="flex items-center gap-2"><Icon :name="d.icon" :size="14" class="text-muted-foreground"/>{{ d.label }}</li></ul></div>
        <div v-if="!blocking" class="grid gap-1.5"><label for="del-yes" class="text-sm">Type <span class="font-mono font-semibold">YES</span> to confirm</label><Input id="del-yes" v-model="yes" autocomplete="off"/></div>
      </template>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" @click="$emit('update:open', false)">Cancel</Button><Button v-if="!blocking" variant="destructive" :disabled="checking || yes !== 'YES'" @click="$emit('confirm')"><Icon name="Trash2" :size="14"/>Delete</Button></div>
    </Dialog>`
  };

  /* ---------- Related-record preview: the target's own panel in a sheet */
  const RelatedLink = {
    props: { locId: String },
    setup(p) { const open = ref(false); const l = computed(() => locById(p.locId)); return { open, l, LTYPES, LSTAT, usersAt, respOf, openLoc, formsAt }; },
    template: `<span><button type="button" class="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline" @click="open=true"><Icon name="PanelRightOpen" :size="13"/>{{ l ? l.name : '–' }}</button>
      <Sheet :open="open" @update:open="v => open = v"><template v-if="l">
        <div class="border-b p-4 pr-12"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon :name="LTYPES[l.type].icon" :size="18"/></span><div class="min-w-0"><h2 class="truncate font-semibold">{{ l.name }}</h2><p class="text-xs text-muted-foreground"><span class="font-mono">{{ l.code }}</span> · {{ LTYPES[l.type].label }} · {{ LSTAT[l.status].label }}</p></div></div>
          <div class="mt-3 flex gap-2"><Button size="sm" variant="outline" @click="open=false; openLoc(l.id)"><Icon name="Maximize2" :size="14"/>View full page</Button></div></div>
        <div class="grid gap-3 overflow-y-auto p-4 text-sm">
          <div class="grid grid-cols-3 gap-2"><div class="rounded-lg border p-2.5"><p class="text-xs text-muted-foreground">People</p><p class="text-lg font-semibold tnum">{{ usersAt(l.id).length }}</p></div><div class="rounded-lg border p-2.5"><p class="text-xs text-muted-foreground">Forms</p><p class="text-lg font-semibold tnum">{{ formsAt(l.id, true).length }}</p></div><div class="rounded-lg border p-2.5"><p class="text-xs text-muted-foreground">Resp. 30d</p><p class="text-lg font-semibold tnum">{{ respOf(l.id) }}</p></div></div>
          <dl class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2"><dt class="text-muted-foreground">Phone</dt><dd class="tnum">{{ l.phone || '–' }}</dd><dt class="text-muted-foreground">Email</dt><dd class="truncate">{{ l.email || '–' }}</dd><dt class="text-muted-foreground">Address</dt><dd>{{ [l.address, l.ward, l.district, l.region].filter(Boolean).join(', ') || '–' }}</dd><dt class="text-muted-foreground">Hours</dt><dd>{{ l.hours }}</dd></dl>
        </div></template></Sheet></span>`
  };
