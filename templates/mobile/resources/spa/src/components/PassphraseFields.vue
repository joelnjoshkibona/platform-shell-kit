<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

/**
 * A new passphrase, typed twice (phone kit PassphraseFields, P121): at least `min` characters, the same twice; under
 * `weakBelow` a warning that a short one can be guessed from a copied phone (allowed, not refused). Problems show only
 * after the first try. Emits `submit` with the passphrase; the fields are cleared once it is taken.
 */
const props = withDefaults(defineProps<{ action: string; busy?: boolean; min?: number; weakBelow?: number }>(), { min: 4, weakBelow: 8 })
const emit = defineEmits<{ submit: [passphrase: string] }>()
const { t } = useI18n()
const first = ref('')
const second = ref('')
const tried = ref(false)

const problem = computed(() => passphraseProblem(first.value, second.value, props.min))
const weak = computed(() => first.value.length > 0 && first.value.length < props.weakBelow)

function submit() {
  tried.value = true
  if (problem.value || props.busy) return
  const p = first.value
  first.value = second.value = ''
  tried.value = false
  emit('submit', p)
}
</script>

<script lang="ts">
export type PassphraseProblem = 'short' | 'mismatch' | null
/** Why a new passphrase is refused, or null. */
export function passphraseProblem(first: string, second: string, min = 4): PassphraseProblem {
  if (first.length < min) return 'short'
  if (first !== second) return 'mismatch'
  return null
}
</script>

<template>
  <form class="grid gap-4" data-testid="passphrase-fields" @submit.prevent="submit">
    <label class="grid gap-1.5 text-sm font-medium">
      {{ t('phone.space.pass') }}
      <input v-model="first" type="password" autocomplete="new-password" class="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" data-testid="passphrase-1" />
    </label>
    <p v-if="weak" class="-mt-2 flex gap-2 text-xs text-amber-700 dark:text-amber-400" data-testid="passphrase-weak"><Icon name="TriangleAlert" :size="14" class="mt-px shrink-0" />{{ t('phone.space.weak') }}</p>
    <label class="grid gap-1.5 text-sm font-medium">
      {{ t('phone.space.again') }}
      <input v-model="second" type="password" autocomplete="new-password" class="h-11 rounded-lg border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" data-testid="passphrase-2" />
    </label>
    <p v-if="tried && problem" class="text-sm text-destructive" role="alert" data-testid="passphrase-problem">{{ t(`phone.space.${problem}`, { n: min }) }}</p>
    <slot />
    <Btn full :disabled="busy" data-testid="passphrase-submit" @click="submit">{{ action }}</Btn>
  </form>
</template>
