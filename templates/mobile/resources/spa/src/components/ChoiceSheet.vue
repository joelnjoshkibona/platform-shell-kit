<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Sheet from '@/components/Sheet.vue'
import Btn from '@/components/Btn.vue'

/**
 * A question with one choice (phone kit ChoiceSheet): a sheet with a line of text, one tick box, Cancel and the action.
 * Emits `confirm` with whether the box was ticked. For an action that needs a choice made first (Block: also move the
 * existing messages), where a plain Confirm would hide the choice and Undo cannot hold it.
 */
const props = withDefaults(defineProps<{ open: boolean; title: string; text?: string; choice?: string; checked?: boolean; action: string; tone?: 'primary' | 'destructive' }>(), { checked: true, tone: 'primary' })
const emit = defineEmits<{ close: []; confirm: [checked: boolean] }>()
const { t } = useI18n()
const ticked = ref(props.checked)
watch(() => props.open, (o) => o && (ticked.value = props.checked))
</script>

<template>
  <Sheet :open="open" :title="title" @close="emit('close')">
    <div class="grid gap-4 px-4 pb-4" data-testid="choice-sheet">
      <p v-if="text" class="text-sm text-muted-foreground">{{ text }}</p>
      <label v-if="choice" class="flex items-start gap-3 text-sm">
        <input v-model="ticked" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]" data-testid="choice-sheet-box" />
        <span>{{ choice }}</span>
      </label>
      <div class="grid grid-cols-2 gap-2">
        <Btn v="outline" @click="emit('close')">{{ t('phone.common.cancel') }}</Btn>
        <Btn :v="tone === 'destructive' ? 'destructive' : 'primary'" data-testid="choice-sheet-action" @click="emit('confirm', ticked)">{{ action }}</Btn>
      </div>
    </div>
  </Sheet>
</template>
