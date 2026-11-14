<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import AppDialog from './Dialog.vue'
import { dismissUpdated, updateInfo, updateLater, updated, updater } from './updates'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * P79: the one question about an update, opened through the modal host once per version (Later is remembered for that
 * version code; the dot on the avatar and Profile > Check for updates bring it back). Short: "<product> X is ready", the
 * release's summary, "It is N MB. Your data stays.", Later and Update side by side. Update goes to the update page, which
 * does the work. The first launch of a newer version than the last one seen: the same card says "Updated to X" and lists
 * what changed, with Got it. Closing it any other way is Later / Got it. Replaces P53's banner.
 */
const props = defineProps<{ open?: boolean; onUpdate?: () => void }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const { t } = useI18n()
const justUpdated = updated.to !== null // read once: dismissing must not turn the card into an offer while it closes
const to = updated.to

function close() {
  if (justUpdated) dismissUpdated()
  else updateLater()
  emit('update:open', false)
}
function update() {
  emit('update:open', false)
  props.onUpdate?.()
}
const notes = updateInfo.value.notes.slice(0, 6)
const sentence = (s: string | null) => (s ? (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`) : '')
const body = computed(() => [sentence(updateInfo.value.summary), t('phoneApp.readyBody', { n: updateInfo.value.mb ?? '?' })].filter(Boolean).join(' '))
</script>

<template>
  <AppDialog :open="open" :title="justUpdated ? t('phoneApp.updatedTo', { v: to }) : t('phoneApp.updateReadyV', { v: updateInfo.version, product: t('shell.brand') })" :description="justUpdated ? t('phoneApp.updatedBody') : body" @update:open="(v: boolean) => (v ? emit('update:open', true) : close())">
    <template v-if="justUpdated">
      <ul v-if="notes.length" class="grid gap-2 text-sm">
        <li v-for="n in notes" :key="n" class="flex items-start gap-2.5 rounded-lg border p-3"><Icon name="Sparkles" :size="15" class="mt-0.5 shrink-0 text-primary" />{{ n }}</li>
      </ul>
      <Btn full class="mt-5" data-testid="update-offer-ok" @click="close">{{ t('phoneApp.gotIt') }}</Btn>
    </template>
    <template v-else>
      <p v-if="!updater.allowed" class="text-xs text-muted-foreground">{{ t('phoneApp.allowOnce', { product: t('shell.brand') }) }}</p>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <Btn v="outline" data-testid="update-offer-later" @click="close">{{ t('phoneApp.later') }}</Btn>
        <Btn data-testid="update-offer-update" @click="update">{{ t('phoneApp.update') }}</Btn>
      </div>
    </template>
  </AppDialog>
</template>
