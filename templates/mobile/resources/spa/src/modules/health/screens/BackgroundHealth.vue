<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import Header from '@/app/ShellHeader.vue'
import { IS_APP } from '@/app/bridge'
import { readHealth, type HealthCheck } from '@/app/health'
import { healthSources } from '@/app/healthSources'
import { skipNextLock } from '@/app/lock'
import { appLog } from '@/app/log'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/*
 * Background health (P119): can this phone let the app's background work through with the app
 * closed? A summary, then one card per check the modules supply (defineModule({ health })): an OK or Needs attention pill,
 * why it matters, what it is now, and the button that fixes it; a setting Android cannot report also has "I allowed it".
 * Under the cards, what each module runs in the background. Coming back from Android's settings re-reads everything.
 */
const { t } = useI18n()
const sources = healthSources()
const checks = ref<HealthCheck[]>([])
const loaded = ref(false)
const failed = ref(0)
const checking = ref(false)

async function load() {
  checking.value = true
  try {
    const r = await readHealth(sources, t)
    checks.value = r.checks
    failed.value = r.failed
  } finally {
    checking.value = false
    loaded.value = true
  }
}
// Back from Android's settings (the page was hidden) or from one of its dialogs over the app (only the focus came back)
const onShow = () => !document.hidden && void load()
onMounted(() => {
  void load()
  document.addEventListener('visibilitychange', onShow)
  window.addEventListener('focus', onShow)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onShow)
  window.removeEventListener('focus', onShow)
})

const needs = computed(() => checks.value.filter((c) => !c.ok).length)

async function fix(c: HealthCheck) {
  appLog.info('health', `fix: ${c.key}`)
  skipNextLock(300_000) // Android's own screen is in front: that is not the person being away
  await c.fix?.run()
  void load()
}
function undo(c: HealthCheck) {
  appLog.info('health', `asked again: ${c.key}`)
  c.undo?.run()
  void load()
}
function confirm(c: HealthCheck) {
  appLog.info('health', `confirmed: ${c.key}`)
  c.confirm?.run()
  void load()
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <Header :title="t('phone.health.title')" pushed hide-search parent="/profile" />
    <div class="scroll min-h-0 flex-1 overflow-y-auto">
      <div class="space-y-3 p-3" :style="{ paddingBottom: 'calc(32px + var(--sa-bottom))' }" data-testid="background-health">
        <p v-if="!IS_APP" class="rounded-xl border bg-card p-4 text-sm text-muted-foreground" data-testid="health-browser">{{ t('phone.health.inBrowser') }}</p>
        <template v-else-if="loaded">
          <p v-if="failed && !checks.length" class="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{{ t('phone.health.failed') }}</p>
          <p v-else-if="!checks.length" class="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{{ t('phone.health.nothing') }}</p>
          <section v-else class="rise flex items-start gap-3 rounded-xl border p-4" :class="needs ? 'border-warning/40 bg-warning/10' : 'border-success/40 bg-success/10'" role="status" data-testid="health-summary">
            <Icon :name="needs ? 'TriangleAlert' : 'ShieldCheck'" :size="22" class="mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="font-semibold">{{ needs ? t('phone.health.needs', { n: needs, product: t('shell.brand') }, needs) : t('phone.health.allGood') }}</p>
              <p class="mt-0.5 text-sm text-muted-foreground">{{ needs ? t('phone.health.needsBody', { product: t('shell.brand') }) : t('phone.health.allGoodBody', { product: t('shell.brand') }) }}</p>
            </div>
          </section>

          <section v-for="c in checks" :key="c.key" class="rounded-xl border bg-card p-4" :data-testid="`health-${c.key}`">
            <div class="flex items-start gap-3">
              <span :class="['grid h-10 w-10 shrink-0 place-items-center rounded-lg', c.ok ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning']"><Icon :name="c.icon" :size="20" /></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-semibold">{{ c.title }}</p>
                  <span :class="['inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', c.ok ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning']" :data-testid="`health-${c.key}-pill`"><Icon :name="c.ok ? 'Check' : 'TriangleAlert'" :size="12" />{{ c.ok ? t('phone.health.ok') : t('phone.health.attention') }}</span>
                </div>
                <p class="mt-0.5 text-sm text-muted-foreground">{{ c.why }}</p>
                <p class="mt-1 text-sm">{{ t('phone.health.now') }} {{ c.now }}</p>
                <div v-if="c.fix || c.confirm" :class="['mt-3 grid gap-2', c.fix && c.confirm ? 'grid-cols-2' : 'justify-items-end']">
                  <Btn v-if="c.fix" :v="c.ok || c.confirm ? 'outline' : 'primary'" :data-testid="`health-${c.key}-fix`" @click="fix(c)">{{ c.fix.label }}</Btn>
                  <Btn v-if="c.confirm" :data-testid="`health-${c.key}-confirm`" @click="confirm(c)">{{ c.confirm.label }}</Btn>
                </div>
                <div v-if="c.undo" class="mt-2 flex justify-end">
                  <button type="button" class="press text-xs font-medium text-primary underline-offset-2 hover:underline" :data-testid="`health-${c.key}-undo`" @click="undo(c)">{{ c.undo.label }}</button>
                </div>
              </div>
            </div>
          </section>

          <component :is="s.extra" v-for="(s, i) in sources.filter((x) => x.extra)" :key="i" />
          <Btn v="outline" full :disabled="checking" data-testid="health-check" @click="load"><Icon name="RefreshCw" :size="16" :class="checking && 'animate-spin'" />{{ t('phone.health.check') }}</Btn>
        </template>
      </div>
    </div>
  </div>
</template>
