<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * One message in a conversation (the phone kit's MessageBubble): sent on the right in the primary colour, received on
 * the left in muted, and under it the time and, for a sent one, its state: Sending, Sent, Delivered, or Not sent with
 * Retry. `selected` outlines it (the selection mode of a long press); `ring` marks the one a search result opened.
 */
export type BubbleStatus = 'received' | 'queued' | 'sending' | 'sent' | 'delivered' | 'failed'
const props = defineProps<{ dir: 'in' | 'out'; body: string; time?: string; status?: BubbleStatus; selected?: boolean; ring?: boolean; fresh?: boolean }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()

const state = computed(() => {
  switch (props.status) {
    case 'queued':
    case 'sending':
      return { icon: 'Clock', word: t('phone.messages.sending') }
    case 'sent':
      return { icon: 'Check', word: t('phone.messages.sent') }
    case 'delivered':
      return { icon: 'CheckCheck', word: t('phone.messages.delivered') }
    case 'failed':
      return { icon: 'CircleAlert', word: t('phone.messages.notSent') }
    default:
      return null
  }
})
</script>

<template>
  <div :class="['flex max-w-[80%] flex-col', dir === 'out' ? 'items-end self-end' : 'items-start self-start', fresh ? 'bubble-in' : '']" :data-dir="dir">
    <div
      :class="[
        'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug [overflow-wrap:anywhere]',
        dir === 'out' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted text-foreground',
        selected ? 'outline outline-2 outline-offset-1 outline-primary' : '',
        ring ? 'ring-4 ring-primary/40' : '',
      ]"
    >{{ body }}</div>
    <div :class="['flex min-h-5 items-center gap-1 px-1.5 pb-1.5 pt-0.5 text-[11px] text-muted-foreground tnum', status === 'failed' ? 'font-semibold text-destructive' : '']">
      <span v-if="time && status !== 'failed' && status !== 'queued' && status !== 'sending'">{{ time }}</span>
      <template v-if="dir === 'out' && state">
        <span v-if="time && status !== 'failed' && status !== 'queued' && status !== 'sending'" aria-hidden="true">·</span>
        <Icon :name="state.icon" :size="13" />
        <span class="status-word">{{ state.word }}</span>
        <button v-if="status === 'failed'" type="button" class="press ml-1 px-1 py-1 underline" data-testid="bubble-retry" @click="$emit('retry')">{{ t('phone.messages.retry') }}</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bubble-in > :first-child { animation: bubble-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both; transform-origin: bottom right; }
[data-dir='in'].bubble-in > :first-child { transform-origin: bottom left; }
@keyframes bubble-in { from { opacity: 0; transform: scale(0.9); } }
.status-word { animation: status-in 150ms ease-out; }
@keyframes status-in { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .bubble-in > :first-child, .status-word { animation: none; } }
</style>
