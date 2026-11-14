<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import Btn from '@/components/Btn.vue'
import { useI18n } from 'vue-i18n'

/**
 * First run, one step at a time (the phone kit's FirstRun, P63: each permission at the moment of need, its reason first):
 * a progress bar, the step's glyph, title and why, the main button, and Not now when the step can wait. When the person
 * says no, `note` says what changes and that it can be done later; the step stays until they choose again.
 * Full screen, above the shell (z-[105]); Back does nothing here (P52 leaves the app on the first screen).
 */
export interface FirstRunStep {
  key: string
  icon: string
  title: string
  text: string
  action: string
  /** Not now: the step can wait (left out: it must be done). */
  later?: boolean
  /** Shown under the step after a no. */
  note?: string
}
defineProps<{ steps: FirstRunStep[]; index: number; busy?: boolean; note?: string }>()
defineEmits<{ act: []; later: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-[105] flex flex-col bg-background px-6" :style="{ paddingTop: 'calc(24px + var(--sa-top, 0px))', paddingBottom: 'calc(20px + var(--sa-bottom, 0px))' }" role="dialog" aria-modal="true" data-testid="first-run">
    <div class="flex gap-1.5" role="progressbar" :aria-valuenow="index + 1" :aria-valuemax="steps.length" :aria-label="t('phone.firstRun.step', { n: index + 1, of: steps.length })">
      <i v-for="(s, i) in steps" :key="s.key" :class="['h-1 flex-1 rounded-full', i <= index ? 'bg-primary' : 'bg-muted']" />
    </div>
    <template v-if="steps[index]">
      <div class="rise mt-14 grid h-[72px] w-[72px] place-items-center rounded-2xl bg-primary/10 text-primary"><Icon :name="steps[index].icon" :size="34" /></div>
      <h2 class="mt-6 text-2xl font-semibold tracking-tight text-balance">{{ steps[index].title }}</h2>
      <p class="mt-2 max-w-[32ch] text-sm text-muted-foreground">{{ steps[index].text }}</p>
      <p v-if="note" class="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground" role="status">{{ note }}</p>
      <div class="flex-1" />
      <div class="flex flex-col gap-2">
        <Btn size="lg" full :disabled="busy" data-testid="first-run-act" @click="$emit('act')">{{ steps[index].action }}</Btn>
        <Btn v-if="steps[index].later" v="ghost" size="lg" full :disabled="busy" data-testid="first-run-later" @click="$emit('later')">{{ t('phone.firstRun.later') }}</Btn>
      </div>
    </template>
  </div>
</template>
