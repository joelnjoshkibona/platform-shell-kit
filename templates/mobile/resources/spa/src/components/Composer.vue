<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { textParts } from '@/app/textParts'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Where a message is written (the phone kit's Composer): a field that grows to five lines, a counter of characters and
 * SMS parts under it, the SIM chip when the phone has two, and Send. It sits above the keyboard (`--kbd`, P62) at the
 * bottom of the conversation, never position: fixed. Send is off while the text is blank or a send runs (P60).
 */
const model = defineModel<string>({ required: true })
const props = defineProps<{ sim?: string; sending?: boolean; placeholder?: string }>()
const emit = defineEmits<{ send: []; sim: [] }>()
const { t } = useI18n()
const field = ref<HTMLTextAreaElement | null>(null)

const parts = computed(() => textParts(model.value))
const canSend = computed(() => model.value.trim().length > 0 && !props.sending)

function grow() {
  const el = field.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}
watch(model, () => void nextTick(grow))

function send() {
  if (canSend.value) emit('send')
}

defineExpose({ focus: () => field.value?.focus() })
</script>

<template>
  <div class="flex shrink-0 items-end gap-1.5 bg-background px-2 pt-2" :style="{ paddingBottom: 'calc(10px + max(var(--sa-bottom, 0px), var(--kbd, 0px)))' }">
    <div class="flex min-w-0 flex-1 flex-col rounded-3xl bg-muted px-4 pb-1 pt-1">
      <textarea
        ref="field"
        v-model="model"
        rows="1"
        class="max-h-[120px] min-h-[40px] w-full resize-none border-0 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-muted-foreground"
        :placeholder="placeholder ?? t('phone.messages.placeholder')"
        :aria-label="placeholder ?? t('phone.messages.placeholder')"
        data-testid="composer-text"
        @keydown.enter.exact.ctrl.prevent="send"
      />
      <div class="flex items-center justify-between pb-1 text-[11px] text-muted-foreground tnum">
        <button v-if="sim" type="button" class="press rounded-md border px-1.5 font-mono text-[11px]" :aria-label="t('phone.messages.chooseSim')" data-testid="composer-sim" @click="$emit('sim')">{{ sim }}</button>
        <span v-else />
        <span v-if="parts.chars" data-testid="composer-count">{{ t('phone.messages.count', { chars: parts.chars, parts: parts.parts }) }}</span>
      </div>
    </div>
    <button type="button" :disabled="!canSend" class="press grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground" :aria-label="t('phone.messages.send')" data-testid="composer-send" @click="send">
      <Icon :name="sending ? 'LoaderCircle' : 'SendHorizontal'" :size="20" :class="sending ? 'animate-spin' : ''" />
    </button>
  </div>
</template>
