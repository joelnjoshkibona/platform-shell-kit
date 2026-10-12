/* ---------------------------------------------------------------- atoms (names/props mirror shadcn-vue) */
const Icon = {
  name: 'Icon',
  props: { name: String, size: { type: [Number, String], default: 16 }, strokeWidth: { type: [Number, String], default: 2 }, fill: { type: String, default: 'none' } },
  setup(p) {
    return () => {
      const node = (window.lucide && window.lucide.icons && window.lucide.icons[p.name]) || null;
      let kids = [];
      if (node) kids = node[0] === 'svg' ? node[2] : node;
      return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: p.size, height: p.size, viewBox: '0 0 24 24', fill: p.fill, stroke: 'currentColor', 'stroke-width': p.strokeWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'shrink-0', 'aria-hidden': 'true' },
        kids.map(([t, a]) => h(t, a)));
    };
  }
};

const BTN_V = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};
const BTN_S = { default: 'h-9 px-4 py-2', sm: 'h-8 rounded-md px-3 text-xs', lg: 'h-10 rounded-md px-8', icon: 'h-9 w-9', 'icon-sm': 'h-8 w-8' };
const Button = {
  props: { variant: { default: 'default' }, size: { default: 'default' }, type: { default: 'button' }, disabled: Boolean },
  computed: { cls() { return cn('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50', BTN_V[this.variant], BTN_S[this.size]) } },
  template: `<button :type="type" :class="cls" :disabled="disabled"><slot/></button>`
};
const Input = {
  props: { modelValue: [String, Number], type: { default: 'text' } }, emits: ['update:modelValue'],
  template: `<input :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">`
};
const Textarea = {
  props: { modelValue: String, rows: { default: 3 } }, emits: ['update:modelValue'],
  template: `<textarea :rows="rows" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"></textarea>`
};
const Label = { template: `<label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"><slot/></label>` };
const Switch = {
  props: { modelValue: Boolean, disabled: Boolean, id: String }, emits: ['update:modelValue'],
  template: `<button :id="id" type="button" role="switch" :aria-checked="modelValue" :disabled="disabled" @click="$emit('update:modelValue', !modelValue)"
    class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'bg-primary' : 'bg-input'">
    <span class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform" :class="modelValue ? 'translate-x-4' : 'translate-x-0'"></span></button>`
};
const Checkbox = {
  props: { modelValue: Boolean, disabled: Boolean }, emits: ['update:modelValue'],
  template: `<button type="button" role="checkbox" :aria-checked="modelValue" :disabled="disabled" @click="$emit('update:modelValue', !modelValue)" class="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 grid place-items-center" :class="modelValue ? 'bg-primary text-primary-foreground' : ''"><Icon v-if="modelValue" name="Check" :size="12" stroke-width="3"/></button>`
};
const RadioGroupItem = {
  props: { checked: Boolean, disabled: Boolean }, emits: ['select'],
  template: `<button type="button" role="radio" :aria-checked="checked" :disabled="disabled" @click="$emit('select')" class="aspect-square h-4 w-4 shrink-0 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 grid place-items-center"><span v-if="checked" class="h-2 w-2 rounded-full bg-primary"></span></button>`
};
const Badge = {
  props: { variant: { default: 'default' } },
  computed: { cls() { return cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap', {
    default: 'border-transparent bg-primary text-primary-foreground shadow',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    warning: 'border-transparent bg-warning/15 text-warning',
  }[this.variant]) } },
  template: `<span :class="cls"><slot/></span>`
};
const Card = { template: `<div class="rounded-xl border bg-card text-card-foreground shadow-sm"><slot/></div>` };
const Separator = { props: { orientation: { default: 'horizontal' } }, template: `<div role="separator" :class="orientation==='vertical' ? 'h-5 w-px bg-border' : 'h-px w-full bg-border'"></div>` };

function usePopover(getAlign = () => 'start', matchWidth = false) {
  // Mirrors shadcn-vue/reka-ui: content is portalled to <body>, fixed-positioned, flips to stay on screen.
  const open = ref(false), root = ref(null), panel = ref(null), pos = ref({});
  function place() {
    const t = root.value && root.value.getBoundingClientRect(), el = panel.value; if (!t || !el) return;
    const vw = window.innerWidth, vh = window.innerHeight, pad = 8, w = el.offsetWidth, h = el.offsetHeight;
    let left = getAlign() === 'end' ? t.right - w : t.left;
    left = Math.max(pad, Math.min(left, vw - pad - w));
    let top = t.bottom + 4;
    if (top + h > vh - pad && t.top - h - 4 > pad) top = t.top - h - 4;
    pos.value = { left: left + 'px', top: Math.max(pad, top) + 'px', minWidth: matchWidth ? t.width + 'px' : undefined, maxWidth: (vw - pad * 2) + 'px' };
  }
  watch(open, (v) => { if (v) { pos.value = { left: '-9999px', top: '0px', minWidth: matchWidth && root.value ? root.value.getBoundingClientRect().width + 'px' : undefined }; nextTick(place); } });
  const inside = (e) => (root.value && root.value.contains(e.target)) || (panel.value && panel.value.contains(e.target));
  const onDoc = (e) => { if (open.value && !inside(e)) open.value = false; };
  const onKey = (e) => { if (e.key === 'Escape' && open.value) { e.__popClosed = true; open.value = false; } };
  const onMove = (e) => { if (open.value && !(panel.value && panel.value.contains(e.target))) place(); };
  onMounted(() => { document.addEventListener('pointerdown', onDoc); document.addEventListener('keydown', onKey); window.addEventListener('scroll', onMove, true); window.addEventListener('resize', onMove); });
  onBeforeUnmount(() => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onMove, true); window.removeEventListener('resize', onMove); });
  return { open, root, panel, pos };
}

const Select = {
  props: { modelValue: [String, Number], options: Array, placeholder: { default: 'Select' }, disabled: Boolean, size: { default: 'default' }, align: { default: 'start' }, triggerClass: String },
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    const { open, root, panel, pos } = usePopover(() => p.align, true);
    const current = computed(() => (p.options || []).find(o => o.value === p.modelValue));
    const pick = (o) => { emit('update:modelValue', o.value); open.value = false; };
    return { open, root, panel, pos, current, pick };
  },
  template: `<div class="relative" ref="root">
    <button type="button" :disabled="disabled" @click="open=!open" :aria-expanded="open" role="combobox"
      :class="['flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', size==='sm' ? 'h-8 text-xs' : 'h-9', triggerClass]">
      <span class="flex min-w-0 items-center gap-2"><Icon v-if="current && current.icon" :name="current.icon" class="text-muted-foreground"/><span class="truncate" :class="!current && 'text-muted-foreground'">{{ current ? current.label : placeholder }}</span></span>
      <Icon name="ChevronDown" :size="16" class="opacity-50"/>
    </button>
    <Teleport to="body"><div v-if="open" ref="panel" :style="pos" class="pop fixed z-[95] max-h-72 min-w-[12rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md" role="listbox">
      <template v-for="o in options" :key="o.value">
        <div v-if="o.group" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">{{ o.group }}</div>
        <button v-else type="button" role="option" :aria-selected="o.value===modelValue" :disabled="o.disabled" @click="pick(o)"
          class="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50">
          <Icon v-if="o.icon" :name="o.icon" class="text-muted-foreground"/><span class="truncate">{{ o.label }}</span>
          <span v-if="o.value===modelValue" class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center"><Icon name="Check" :size="14"/></span>
        </button>
      </template>
    </div></Teleport></div>`
};
const DropdownMenu = {
  props: { items: Array, align: { default: 'end' }, label: String },
  emits: ['select'],
  setup(p) { return usePopover(() => p.align); },
  template: `<div class="relative" ref="root">
    <div @click="open=!open"><slot name="trigger"/></div>
    <Teleport to="body"><div v-if="open" ref="panel" :style="pos" class="pop fixed z-[95] min-w-[13rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md" role="menu">
      <div v-if="label" class="px-2 py-1.5 text-sm font-semibold">{{ label }}</div>
      <template v-for="(it, i) in items" :key="i">
        <div v-if="it.separator" class="-mx-1 my-1 h-px bg-border"></div>
        <button v-else type="button" role="menuitem" :disabled="it.disabled" @click="open=false; $emit('select', it)"
          :class="['relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50', it.destructive ? 'text-destructive' : '']">
          <Icon v-if="it.icon" :name="it.icon" class="opacity-70"/><span class="flex-1">{{ it.label }}</span>
          <Icon v-if="it.checked" name="Check" :size="14"/>
          <span v-if="it.shortcut" class="ml-auto text-xs tracking-widest opacity-60">{{ it.shortcut }}</span>
        </button>
      </template>
    </div></Teleport></div>`
};
const Tooltip = {
  props: { content: String, side: { default: 'top' } },
  template: `<span class="group relative inline-flex"><slot/>
    <span role="tooltip" :class="['pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground opacity-0 shadow transition-opacity delay-300 duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
      side==='left' ? 'right-full top-1/2 mr-2 -translate-y-1/2' : side==='bottom' ? 'top-full left-1/2 mt-2 -translate-x-1/2' : 'bottom-full left-1/2 mb-2 -translate-x-1/2']">{{ content }}</span></span>`
};
/* Escape closes the top-most dialog or sheet only, and only when no popover inside it took the key first */
const OVERLAYS = [];
function useOverlayEsc(p, emit) {
  const id = Symbol('overlay');
  const onKey = (e) => { if (e.key !== 'Escape' || e.__popClosed || e.defaultPrevented || OVERLAYS[OVERLAYS.length - 1] !== id) return; emit('update:open', false); };
  const sync = (v) => { const i = OVERLAYS.indexOf(id); if (v && i < 0) OVERLAYS.push(id); if (!v && i > -1) OVERLAYS.splice(i, 1); };
  watch(() => p.open, sync, { immediate: true });
  onMounted(() => window.addEventListener('keydown', onKey));
  onBeforeUnmount(() => { sync(false); window.removeEventListener('keydown', onKey); });
}
const Dialog = {
  props: { open: Boolean }, emits: ['update:open'],
  setup(p, { emit }) { useOverlayEsc(p, emit); },
  template: `<Teleport to="body"><Transition name="fade"><div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
    <div class="absolute inset-0 bg-black/70" @click="$emit('update:open', false)"></div>
    <div role="dialog" aria-modal="true" class="pop relative grid max-h-[calc(100dvh-1rem)] w-full max-w-lg gap-4 overflow-y-auto overscroll-contain border bg-background p-6 shadow-lg rounded-t-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl" style="padding-bottom:calc(1.5rem + env(safe-area-inset-bottom,0px))">
      <button type="button" class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" @click="$emit('update:open', false)" aria-label="Close"><Icon name="X" :size="16"/></button>
      <slot/></div></div></Transition></Teleport>`
};
const Sheet = {
  props: { open: Boolean }, emits: ['update:open'],
  setup(p, { emit }) { useOverlayEsc(p, emit); },
  template: `<Teleport to="body"><Transition name="fade"><div v-if="open" class="fixed inset-0 z-50 bg-black/60" @click="$emit('update:open', false)"></div></Transition>
    <Transition name="sheet"><div v-if="open" role="dialog" aria-modal="true" class="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l bg-background shadow-lg sm:max-w-lg" style="padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)">
      <button type="button" class="absolute right-4 top-4 z-10 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" style="margin-top:env(safe-area-inset-top,0px)" @click="$emit('update:open', false)" aria-label="Close"><Icon name="X" :size="16"/></button>
      <slot/></div></Transition></Teleport>`
};
const Tabs = {
  props: { modelValue: String, items: Array, full: Boolean }, emits: ['update:modelValue'],
  template: `<div role="tablist" :class="['inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', full ? 'grid w-full' : '']" :style="full ? 'grid-template-columns:repeat(' + items.length + ',minmax(0,1fr))' : ''">
    <button v-for="t in items" :key="t.value" type="button" role="tab" :aria-selected="modelValue===t.value" @click="$emit('update:modelValue', t.value)"
      :class="['inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', modelValue===t.value ? 'bg-background text-foreground shadow' : 'hover:text-foreground']">
      {{ t.label }}<span v-if="t.count != null" class="tnum rounded-full bg-muted-foreground/15 px-1.5 text-[11px] leading-4">{{ t.count }}</span></button></div>`
};

