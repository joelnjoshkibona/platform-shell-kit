<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { onBeforeUnmount, ref } from 'vue'

/**
 * A list row that can be swiped sideways to one action per side (the phone kit's SwipeRow). The action arms past 96px
 * (the label grows, a short vibration), and letting go then runs it; less springs back. A vertical drag cancels, so the
 * list still scrolls. A long press (480 ms) asks for the row's menu. Nothing depends on the gesture: every swipe action
 * must also be in that menu.
 *
 *   <SwipeRow :left="{ label: 'Archive', icon: 'Archive' }" @swipe="archive(t)" @open="go(t)" @menu="menu(t)"> … </SwipeRow>
 */
interface SideAction { label: string; icon: string }
const props = defineProps<{ left?: SideAction; right?: SideAction }>()
const emit = defineEmits<{ swipe: [side: 'left' | 'right']; open: []; menu: [] }>()

const ARM = 96
const PRESS_MS = 480
const dx = ref(0)
const settling = ref(false)
let start: { x: number; y: number; id: number } | null = null
let mode: 'idle' | 'swipe' | 'scroll' = 'idle'
let pressTimer: ReturnType<typeof setTimeout> | undefined
let pressed = false
let armedBefore = false

const buzz = (ms: number) => navigator.vibrate?.(ms)
const armed = () => Math.abs(dx.value) > ARM
/** Swiping right shows the left action (it sits on the left), swiping left the right one. */
const sideFor = (d: number): 'left' | 'right' => (d > 0 ? 'left' : 'right')
const allowed = (d: number) => (d > 0 ? !!props.left : !!props.right)

function down(e: PointerEvent) {
  if (e.button !== 0) return
  start = { x: e.clientX, y: e.clientY, id: e.pointerId }
  mode = 'idle'
  pressed = false
  armedBefore = false
  settling.value = false
  clearTimeout(pressTimer)
  pressTimer = setTimeout(() => {
    pressed = true
    buzz(12)
    emit('menu')
  }, PRESS_MS)
}

function move(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  const x = e.clientX - start.x
  const y = e.clientY - start.y
  if (mode === 'idle') {
    if (Math.abs(y) > 8) mode = 'scroll'
    else if (Math.abs(x) > 8 && allowed(x)) {
      mode = 'swipe'
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      } catch {
        // a pointer the element cannot capture: the drag still follows the moves it gets
      }
    }
    if (mode !== 'idle') clearTimeout(pressTimer)
  }
  if (mode !== 'swipe') return
  dx.value = allowed(x) ? x : 0
  if (armed() !== armedBefore) {
    armedBefore = armed()
    if (armedBefore) buzz(8)
  }
}

function up(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  clearTimeout(pressTimer)
  const wasSwipe = mode === 'swipe'
  start = null
  mode = 'idle'
  if (wasSwipe) {
    settling.value = true
    if (armed()) {
      const side = sideFor(dx.value)
      dx.value = dx.value > 0 ? 400 : -400
      setTimeout(() => {
        emit('swipe', side)
        settling.value = false
        dx.value = 0
      }, 180)
    } else {
      dx.value = 0
    }
    return
  }
  if (!pressed) emit('open')
}

function cancel() {
  clearTimeout(pressTimer)
  start = null
  mode = 'idle'
  settling.value = true
  dx.value = 0
}

onBeforeUnmount(() => clearTimeout(pressTimer))
</script>

<template>
  <div class="relative select-none overflow-hidden" :class="{ armed: armed() }" style="touch-action: pan-y">
    <div v-if="dx !== 0" class="absolute inset-0 flex items-center justify-between bg-primary/15 px-6 text-sm font-semibold text-primary" aria-hidden="true">
      <span v-if="left && dx > 0" class="swipe-label flex items-center gap-2"><Icon :name="left.icon" :size="18" />{{ left.label }}</span>
      <span v-else />
      <span v-if="right && dx < 0" class="swipe-label flex items-center gap-2">{{ right.label }}<Icon :name="right.icon" :size="18" /></span>
    </div>
    <div
      class="relative bg-background"
      :class="settling ? 'transition-transform duration-200 ease-out' : ''"
      :style="{ transform: dx ? `translateX(${dx}px)` : undefined }"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="cancel"
      @contextmenu.prevent
      @keydown.enter.prevent="$emit('open')"
      @keydown.space.prevent="$emit('open')"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.swipe-label { transition: transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.armed .swipe-label { transform: scale(1.12); }
</style>
