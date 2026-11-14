<script setup lang="ts">
import BrandMark from '@/components/BrandMark.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import { APP_VERSION } from './bridge'
import { UPDATE_SOURCE, appVersion, installedBuild, startUpdate, updateState, updater } from './updates'
import { useI18n } from 'vue-i18n'

/**
 * P53, P67, P79: this version is below the minimum, so nothing else is reachable until the app updates, and Back does nothing
 * (P61). Above everything but the curtain and toasts. The minimum is the server's version (P53) or the download page's
 * minimumCode (P79), which is a build number: the line under the button says whichever is known ("needs build N or newer").
 * In feed mode the words never speak of a server.
 */
const { t } = useI18n()
const build = installedBuild()
const have = build ? `${APP_VERSION} (${t('phoneApp.page.build', { n: build })})` : APP_VERSION
const need = appVersion.minimum ?? (appVersion.minimum_code ? t('phoneApp.page.build', { n: appVersion.minimum_code }) : '')
</script>

<template>
  <Teleport to="body">
    <div v-if="updateState === 'required'" class="fixed inset-0 z-[110] grid place-items-center bg-background px-6" role="alertdialog" aria-modal="true" aria-labelledby="upd-title" style="padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px)">
      <div class="grid max-w-sm justify-items-center text-center">
        <span class="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><BrandMark :size="26" /></span>
        <h2 id="upd-title" class="mt-5 text-xl font-semibold tracking-tight">{{ t('phoneApp.requiredTitle', { product: t('shell.brand') }) }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{{ t(UPDATE_SOURCE === 'feed' ? 'phoneApp.requiredBodyFeed' : 'phoneApp.requiredBody') }}</p>
        <div v-if="updater.phase === 'downloading'" class="mt-6 w-full" role="progressbar" :aria-valuenow="updater.percent" aria-valuemin="0" aria-valuemax="100"><p class="text-sm font-medium tnum">{{ t('phoneApp.downloading', { n: updater.percent }) }}</p><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/15"><div class="h-full rounded-full bg-primary transition-[width]" :style="{ width: `${updater.percent}%` }" /></div></div>
        <template v-else>
          <p v-if="updater.phase === 'failed'" class="mt-4 text-sm text-destructive" role="alert">{{ t(`phoneApp.failed.${updater.error === 'install' || updater.error === 'checksum' ? updater.error : 'download'}`) }}</p>
          <p v-else-if="updater.phase === 'permission'" class="mt-4 text-sm text-muted-foreground">{{ t('phoneApp.permission', { product: t('shell.brand') }) }} {{ t('phoneApp.permissionBody') }}</p>
          <Btn full class="mt-6" :disabled="updater.phase === 'installing'" @click="startUpdate"><Icon name="Download" :size="16" />{{ updater.phase === 'ready' || updater.phase === 'permission' ? t('phoneApp.install') : updater.phase === 'failed' ? t('phoneApp.tryAgain') : t('phoneApp.updateNow') }}</Btn>
        </template>
        <p v-if="need" class="mt-3 text-xs text-muted-foreground tnum">{{ t('phoneApp.versions', { have, need }) }}</p>
      </div>
    </div>
  </Teleport>
</template>
