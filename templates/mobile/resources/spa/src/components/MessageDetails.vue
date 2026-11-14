<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Sheet from '@/components/Sheet.vue'
import Icon from '@/components/Icon.vue'

/**
 * A message's details (the phone kit's MessageDetails), opened by tapping it: for a sent one when it was sent and
 * delivered (or failed), for a received one when the other phone sent it and when it arrived; the SIM and the number of
 * SMS parts. A time that was not recorded (a text from before the app kept times) says so instead of guessing.
 */
export interface DetailsMessage {
  direction: 'in' | 'out'
  status: string
  ts: number
  sent_at?: number | null
  delivered_at?: number | null
  smsc_at?: number | null
  parts?: { total: number }
}
const props = defineProps<{ open: boolean; message: DetailsMessage | null; sim?: string; who?: string }>()
defineEmits<{ close: [] }>()
const { t, locale } = useI18n()

const at = (ms: number | null | undefined) =>
  ms ? new Date(ms).toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'medium' }) : t('phone.messages.details.unknown')

const rows = computed<[string, string, string][]>(() => {
  const m = props.message
  if (!m) return []
  const out: [string, string, string][] = []
  if (m.direction === 'out') {
    out.push(['Clock', t('phone.messages.details.written'), at(m.ts)])
    if (m.status === 'failed') out.push(['CircleAlert', t('phone.messages.details.failed'), t('phone.messages.notSent')])
    else {
      out.push(['Check', t('phone.messages.details.sent'), m.status === 'queued' || m.status === 'sending' ? t('phone.messages.sending') : at(m.sent_at)])
      out.push(['CheckCheck', t('phone.messages.details.delivered'), m.status === 'delivered' ? at(m.delivered_at) : t('phone.messages.details.notYet')])
    }
  } else {
    out.push(['Send', t('phone.messages.details.sentByThem'), at(m.smsc_at)])
    out.push(['Inbox', t('phone.messages.details.received'), at(m.ts)])
  }
  if (props.sim) out.push(['SimCard', t('phone.messages.details.sim'), props.sim])
  if (m.parts && m.parts.total > 1) out.push(['Layers', t('phone.messages.details.parts'), String(m.parts.total)])
  return out
})
</script>

<template>
  <Sheet :open="open" :title="t('phone.messages.details.title')" :sub="who" @close="$emit('close')">
    <dl class="divide-y px-5 pb-4" data-testid="message-details">
      <div v-for="[icon, k, v] in rows" :key="k" class="flex items-center gap-3 py-2.5 text-sm">
        <Icon :name="icon" :size="16" class="shrink-0 text-muted-foreground" />
        <dt class="flex-1 text-muted-foreground">{{ k }}</dt>
        <dd class="text-right tnum">{{ v }}</dd>
      </div>
    </dl>
  </Sheet>
</template>
