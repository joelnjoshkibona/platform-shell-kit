<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Btn from '@/components/Btn.vue'

/**
 * A recovery key shown once (phone kit RecoveryKey, P121): groups that never break across lines, selectable, "This is
 * the only time it is shown", and one button, "I wrote it down". The screen forgets the key when it is pressed.
 */
defineProps<{ value: string; busy?: boolean }>()
defineEmits<{ done: [] }>()
const { t } = useI18n()
</script>

<template>
  <section class="grid gap-4" data-testid="recovery-key">
    <h2 class="text-xl font-semibold">{{ t('phone.space.keyTitle') }}</h2>
    <p class="text-sm text-muted-foreground">{{ t('phone.space.keyText') }}</p>
    <p class="select-all rounded-xl border-2 border-dashed bg-muted/40 px-4 py-5 text-center font-mono text-lg font-semibold tracking-wider" data-testid="recovery-key-value"><template v-for="(g, i) in value.split('-')" :key="i"><span v-if="i">-</span><span class="inline-block whitespace-nowrap">{{ g }}</span></template></p>
    <p class="text-xs text-muted-foreground">{{ t('phone.space.keyOnce') }}</p>
    <Btn full :disabled="busy" data-testid="recovery-key-done" @click="$emit('done')">{{ t('phone.space.wrote') }}</Btn>
  </section>
</template>
