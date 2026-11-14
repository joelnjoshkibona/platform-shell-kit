<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import Header from '@/app/ShellHeader.vue'
import { APP_VERSION } from '@/app/bridge'
import { UPDATE_SOURCE, beginUpdate, cancelUpdate, checkAppVersion, installUpdate, installedBuild, restoreDownload, startUpdate, updateAvailable, updateCheck, updateInfo, updater } from '@/app/updates'
import { fmtDay } from '@{{product_slug}}/shared'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

/*
 * App update (P79): where the update happens, as one card. The offer (a modal, app/AppUpdateOffer.vue) sends Update
 * here with ?go=1; Profile > Check for updates opens the offer again. On arriving it looks at the phone before doing
 * anything: the file is already there (Install), a download is under way (the progress), an older file (cleared, downloaded
 * again) or nothing (it downloads now). The card's headline, facts (Installed, Newest, Released, Size), what changes, and the
 * one button that fits follow the process. Leaving the page does not stop the download (Android keeps it going).
 */
const { t, locale } = useI18n()
const route = useRoute()
const checking = ref(true)

onMounted(async () => {
  try {
    await checkAppVersion()
    if (route.query.go) await beginUpdate()
    else await restoreDownload()
  } finally {
    checking.value = false
  }
})

type View = 'checking' | 'current' | 'offline' | 'error' | 'start' | 'downloading' | 'ready' | 'unfinished' | 'installing' | 'permission' | 'failed'
const view = computed<View>(() => {
  if (checking.value) return 'checking'
  const p = updater.phase
  if (p === 'idle') {
    if (updateAvailable.value) return 'start'
    if (updateCheck.result === 'offline' || updateCheck.result === 'error') return updateCheck.result
    return 'current'
  }
  if (p === 'ready') return updater.unfinished ? 'unfinished' : 'ready'
  return p
})
const ICON: Record<View, string> = { checking: 'Loader', current: 'CircleCheck', offline: 'WifiOff', error: 'TriangleAlert', start: 'Download', downloading: 'Download', ready: 'PackageCheck', unfinished: 'TriangleAlert', installing: 'Loader', permission: 'ShieldCheck', failed: 'TriangleAlert' }
const tone = computed(() => (view.value === 'current' ? 'bg-success/10 text-success' : ['unfinished', 'failed', 'error'].includes(view.value) ? 'bg-warning/15 text-warning' : view.value === 'offline' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'))
const headline = computed(() => {
  const product = t('shell.brand')
  switch (view.value) {
    case 'checking': return t('phoneApp.page.checking')
    case 'current': return t('phoneApp.page.upToDate')
    case 'offline': return t('phoneApp.page.offline')
    case 'error': return t('phoneApp.page.error')
    case 'downloading': return t('phoneApp.updateReadyV', { v: updateInfo.value.version, product })
    case 'ready': return t('phoneApp.downloaded')
    case 'unfinished': return t('phoneApp.unfinished')
    case 'installing': return t('phoneApp.installing')
    case 'permission': return t('phoneApp.permission', { product })
    case 'failed': return t(`phoneApp.failed.${updater.error === 'install' || updater.error === 'checksum' ? updater.error : 'download'}`)
    default: return t('phoneApp.updateReadyV', { v: updateInfo.value.version, product })
  }
})
const since = computed(() => (updateCheck.at ? new Date(updateCheck.at).toLocaleTimeString(locale.value === 'sw' ? 'sw-TZ' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) : ''))
const installed = computed(() => (installedBuild() ? `${APP_VERSION} (${t('phoneApp.page.build', { n: installedBuild() })})` : APP_VERSION))
const newest = computed(() => (updateInfo.value.build ? `${updateInfo.value.version} (${t('phoneApp.page.build', { n: updateInfo.value.build })})` : updateInfo.value.version))
const pending = computed(() => !['checking', 'current', 'offline', 'error'].includes(view.value))
const CHANGE_ICON: Record<string, string> = { NEW: 'Sparkles', IMPROVED: 'TrendingUp', FIXED: 'Wrench', SECURITY: 'ShieldCheck', ISSUE: 'TriangleAlert' }

const again = ref(false)
async function check() {
  again.value = true
  try {
    await checkAppVersion()
  } finally {
    again.value = false
  }
}
const retry = () => (updater.error === 'install' ? installUpdate() : startUpdate())
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <Header :title="t('phoneApp.page.title')" pushed hide-search parent="/profile" />
    <div class="scroll min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3">
      <section class="rise rounded-xl border bg-card p-4" role="status" :aria-label="t('phoneApp.page.title')" data-testid="update-card">
        <div class="flex items-center gap-3">
          <span :class="['grid h-10 w-10 shrink-0 place-items-center rounded-full', tone]"><Icon :name="ICON[view]" :size="20" :class="view === 'checking' || view === 'installing' ? 'animate-spin' : ''" /></span>
          <span class="min-w-0 flex-1">
            <span class="block text-base font-semibold leading-tight" data-testid="update-headline">{{ headline }}</span>
            <span v-if="since && view !== 'checking'" class="block text-xs text-muted-foreground tnum">{{ t('phoneApp.page.checkedAt', { time: since }) }}</span>
          </span>
        </div>

        <dl v-if="view !== 'checking'" class="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm" data-testid="update-facts">
          <div><dt class="text-xs text-muted-foreground">{{ t('phoneApp.page.installed') }}</dt><dd class="font-medium tnum">{{ installed }}</dd></div>
          <div v-if="updateInfo.version"><dt class="text-xs text-muted-foreground">{{ t('phoneApp.page.newest') }}</dt><dd class="font-medium tnum">{{ newest }}</dd></div>
          <div v-if="updateInfo.releasedAt"><dt class="text-xs text-muted-foreground">{{ t('phoneApp.page.released') }}</dt><dd class="font-medium tnum">{{ fmtDay(updateInfo.releasedAt, locale) }}</dd></div>
          <div v-if="updateInfo.mb"><dt class="text-xs text-muted-foreground">{{ t('phoneApp.size') }}</dt><dd class="font-medium tnum">{{ updateInfo.mb }} MB</dd></div>
        </dl>

        <ul v-if="pending && updateInfo.changes.length" class="mt-3 grid gap-1.5 text-sm text-muted-foreground" data-testid="update-changes">
          <li v-for="c in updateInfo.changes" :key="c.text" class="flex items-start gap-2"><Icon :name="CHANGE_ICON[c.type] ?? 'Dot'" :size="15" class="mt-0.5 shrink-0 text-primary" />{{ c.text }}</li>
        </ul>

        <div v-if="view !== 'checking'" class="mt-4">
          <div v-if="view === 'downloading'" aria-live="polite">
            <div class="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" :aria-valuenow="updater.percent" aria-valuemin="0" aria-valuemax="100"><div class="h-full rounded-full bg-primary transition-[width]" :style="{ width: `${updater.percent}%` }" /></div>
            <p class="mt-1.5 flex justify-between text-xs text-muted-foreground tnum"><span>{{ t('phoneApp.downloading', { n: updater.percent }) }}</span><button type="button" class="press font-medium text-primary" data-testid="update-cancel" @click="cancelUpdate">{{ t('phoneApp.cancel') }}</button></p>
          </div>
          <Btn v-else-if="view === 'start'" full data-testid="update-download" @click="startUpdate"><Icon name="Download" :size="16" />{{ t('phoneApp.page.download', { v: updateInfo.version }) }}</Btn>
          <Btn v-else-if="view === 'ready' || view === 'unfinished' || view === 'installing'" full :disabled="view === 'installing'" data-testid="update-install" @click="installUpdate"><Icon name="PackageOpen" :size="16" />{{ view === 'unfinished' ? t('phoneApp.installAgain') : t('phoneApp.install') }}</Btn>
          <Btn v-else-if="view === 'permission'" full data-testid="update-permission" @click="installUpdate">{{ t('phoneApp.permissionOpen') }}</Btn>
          <Btn v-else-if="view === 'failed'" full data-testid="update-retry" @click="retry">{{ t('phoneApp.tryAgain') }}</Btn>
          <Btn v-else v="outline" full :disabled="again" data-testid="update-check" @click="check"><Icon name="RefreshCw" :size="16" />{{ t('phoneApp.page.checkNow') }}</Btn>

          <p v-if="view === 'ready' || view === 'installing'" class="mt-2 text-xs text-muted-foreground">{{ t('phoneApp.installingBody') }} {{ t('phoneApp.page.playProtect') }}</p>
          <p v-else-if="view === 'unfinished'" class="mt-2 text-xs text-muted-foreground">{{ t('phoneApp.unfinishedBody') }}</p>
          <p v-else-if="view === 'permission'" class="mt-2 rounded-md bg-warning/10 p-2.5 text-xs text-warning" role="alert">{{ t('phoneApp.permissionBody') }}</p>
          <p v-else-if="view === 'downloading'" class="mt-2 text-xs text-muted-foreground">{{ t('phoneApp.page.downloadingBody', { v: updateInfo.version, n: updateInfo.mb ?? '?' }) }}</p>
        </div>
      </section>
      <p class="mt-3 px-1 text-xs text-muted-foreground">{{ t(UPDATE_SOURCE === 'feed' ? 'phoneApp.page.privacyFeed' : 'phoneApp.page.privacyServer', { product: t('shell.brand') }) }}</p>
    </div>
  </div>
</template>
