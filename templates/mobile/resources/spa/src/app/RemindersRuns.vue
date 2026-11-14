<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import { reminders, type RemindersState } from './reminders'
import { toast } from './toast'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/** P74, P119: under the reminders' checks, what runs in the background (the last reminder that fired, the next one) and the test buttons. */
const { t, locale } = useI18n()
const state = ref<RemindersState | null>(null)
onMounted(async () => {
  state.value = await reminders.status().catch(() => null)
})
const clock = (epoch: number) => new Date(epoch * 1000).toLocaleTimeString(locale.value === 'sw' ? 'sw-TZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
const next = () => state.value!.pending.slice().sort((a, b) => a.next - b.next)[0]
async function test(alarm: boolean) {
  await reminders.test(alarm)
  toast(t(alarm ? 'phone.health.alarmSent' : 'phone.health.testSent'), t(alarm ? 'phone.health.alarmSentSub' : 'phone.health.testSentSub'), 'BellRing')
}
</script>

<template>
  <template v-if="state?.on_device">
    <h3 class="px-1 pt-2 text-sm font-semibold">{{ t('phone.health.runs') }}</h3>
    <div class="overflow-hidden rounded-xl border bg-card">
      <div class="flex items-center gap-3 px-4 py-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted"><Icon name="Bell" :size="18" /></span>
        <div class="min-w-0"><p class="text-sm font-medium" data-testid="health-last">{{ state.last_fired ? t('phone.health.last', { time: clock(state.last_fired.fired_at) }) : t('phone.health.noneYet') }}</p><p v-if="state.last_fired" class="truncate text-xs text-muted-foreground">{{ state.last_fired.title }}</p></div>
      </div>
      <div class="flex items-center gap-3 border-t px-4 py-3">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted"><Icon name="AlarmClock" :size="18" /></span>
        <div class="min-w-0"><p class="text-sm font-medium" data-testid="health-next">{{ state.pending.length ? t('phone.health.next', { time: clock(next().next) }) : t('phone.health.noneWaiting') }}</p><p v-if="state.pending.length" class="truncate text-xs text-muted-foreground">{{ next().title }}</p></div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <Btn v="outline" data-testid="health-test" @click="test(false)"><Icon name="BellRing" :size="16" />{{ t('phone.health.testReminder') }}</Btn>
      <Btn v="outline" data-testid="health-alarm" @click="test(true)"><Icon name="AlarmClock" :size="16" />{{ t('phone.health.testAlarm') }}</Btn>
    </div>
    <p class="px-1 text-xs text-muted-foreground">{{ t('phone.health.testHelp') }}</p>
  </template>
</template>
