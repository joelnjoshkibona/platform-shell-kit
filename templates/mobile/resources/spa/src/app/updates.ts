import { computed, reactive } from 'vue'
import { api } from './api'
import { APP_BUILD, APP_VERSION, IS_APP, nativeCall } from './bridge'
import { skipNextLock } from './lock'
import { appLog } from './log'

/**
 * The update flow (P53, P67, P79). Two sources, chosen when the app is built (VITE_UPDATE_SOURCE, scripts/build-web.sh):
 * - `feed` (P79: an app with no server of its own, or APP_UPDATE_FEED set): the phone's own server reads the public
 *   latest.json on the product's download page (GET /api/native/update/check) and starts the download itself
 *   (POST /api/native/update/download), so the APK's address and SHA-256 never reach this page.
 * - `server` (P53): the product's API answers GET /app/version.
 * Either way the decision is made on Android's integer version codes (P67), never on version names; in feed mode the installed
 * code is the one the phone's server read from the package, not the one baked into this build.
 *
 * When: at launch, every hour while open, and on return after 15 minutes; never from a cache (a query parameter, no-store).
 * Below the minimum nothing else is reachable until it updates (AppUpdateRequired.vue). A newer version opens ONE offer
 * (AppUpdateOffer.vue: "<product> X is ready", the summary, the size, Later | Update) at the first calm moment of a launch,
 * never on the hourly check; Later puts that version off (kept by version code), and the dot on the avatar and the New badge on
 * Profile > Updates bring it back. Update goes to the update page (modules/updates), one card that does the work: it looks
 * at the phone first (already downloaded, in progress, an older file, Android's permission), downloads with progress and
 * opens Android's installer (the mobile-updater plugin; it checks the SHA-256). The shell registers how the offer opens
 * (`setOfferOpener`), so this file knows no component.
 *
 * The install never gets stuck: a return from Android's installer is also read from the window gaining focus (some phones
 * send no visibility change), and after a few seconds the page goes back to ready ("The install did not finish", Install
 * again). The first launch of a newer version says "Updated to X" with what changed. Every step is in the app log (P72,
 * P113): codes and outcomes, never content.
 */
export interface AppVersion {
  latest: string | null
  minimum: string | null
  url: string | null
  /** server mode: the direct APK link of the latest release; feed mode keeps it on the phone's server */
  apk_url?: string | null
  size?: number | null
  sha256?: string | null
  /** Android's version codes (P67) and the release date */
  version_code?: number | null
  minimum_code?: number | null
  released_at?: string | null
  changelog?: { type: string; description: string }[]
  /** the download page to open in a browser */
  page?: string | null
  /** the release's one-line summary (the feed's notes) */
  summary?: string | null
}

/** Where updates come from (see above). */
export const UPDATE_SOURCE: 'feed' | 'server' = import.meta.env.VITE_UPDATE_SOURCE === 'feed' ? 'feed' : 'server'
const FEED = UPDATE_SOURCE === 'feed'
/** The installed version code: the package's (read by the phone's server in feed mode, P67), else this build's; 0 when unknown. */
let installedCode = Number(APP_BUILD) || 0

/** Is a release newer than this app: by version code when both are known, else by version name. */
function isNewer(code: number | null | undefined, name: string | null | undefined): boolean {
  if (code && installedCode) return code > installedCode
  return !!name && newer(name, APP_VERSION)
}

const KEPT = '{{product_slug}}.appVersion'
const LATER = '{{product_slug}}.appLater'
const SEEN = '{{product_slug}}.seenVersion'
const ALLOWED = '{{product_slug}}.installAllowed'
const HOUR = 60 * 60 * 1000
/** Coming back to the app asks again when the last answer is older than this (the hourly timer does not run while it sleeps). */
const RETURN_AFTER = 15 * 60 * 1000
/** The last check: when it ran and how it ended ('ok', or the feed's 'off' / 'offline' / 'error'; 'offline' for a server that did not answer). */
export const updateCheck = reactive<{ at: number; result: 'ok' | 'off' | 'offline' | 'error' | '' }>({ at: 0, result: '' })

function read<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
  } catch {
    return null
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode: the answer just isn't kept */
  }
}

export const appVersion = reactive<AppVersion & { later: string | null }>({ latest: null, minimum: null, url: null, apk_url: null, size: null, sha256: null, version_code: null, minimum_code: null, released_at: null, changelog: [], page: null, summary: null, ...read<AppVersion>(KEPT), later: read<string>(LATER) })

/** What Later remembers (P79: by version code; by name only when the source sends no code). */
const laterKey = () => (appVersion.version_code ? `#${appVersion.version_code}` : appVersion.latest)

/** Set for the first launch of a newer version than the last one seen: the offer says "Updated to X" until it is dismissed. */
export const updated = reactive<{ to: string | null }>({ to: null })

/** a > b for dotted versions (1.10.0 > 1.9.2); a missing part counts as 0. */
export function newer(a: string, b: string): boolean {
  const x = a.split('.').map((n) => parseInt(n, 10) || 0)
  const y = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0)
  }
  return false
}

/** A newer version is out, put off or not (the dot on the avatar): the offer can always be opened again. */
const belowMinimum = () => isNewer(appVersion.minimum_code, appVersion.minimum)
export const updateAvailable = computed(() => IS_APP && !!appVersion.url && !!appVersion.latest && isNewer(appVersion.version_code, appVersion.latest) && !belowMinimum())

/** 'required' (below minimum: Later cannot put it off), 'available' (newer, not put off), else null. */
export const updateState = computed<'required' | 'available' | null>(() => {
  if (!IS_APP || !appVersion.url) return null
  if (belowMinimum()) return 'required'
  if (appVersion.latest && isNewer(appVersion.version_code, appVersion.latest) && appVersion.later !== laterKey()) return 'available'
  return null
})

/** The answer of the phone's own server about the feed (P79). */
interface FeedCheck {
  state: 'off' | 'current' | 'available' | 'required' | 'offline' | 'error'
  page: string
  installed: { name: string; code: number }
  latest: { versionCode: number; versionName: string; minimumCode: number; size: number; date: string | null; notes: string | null; changes: { type: string; text: string }[] } | null
}

/** The phone's own server, /api/native/update/* (P79): plain JSON, never from a cache. */
async function updateServer<T>(path: string, method: 'GET' | 'POST' = 'GET'): Promise<{ ok: boolean; status: number; body: T | null }> {
  const res = await fetch(`/api/native/update/${path}${method === 'GET' ? `?_=${Date.now()}` : ''}`, { method, headers: { Accept: 'application/json' }, cache: 'no-store' })
  return { ok: res.ok, status: res.status, body: (await res.json().catch(() => null)) as T | null }
}

/** The feed's answer in the shape the rest of this file keeps (the APK address and hash stay on the server). */
async function readFeed(): Promise<AppVersion | null> {
  const { body } = await updateServer<FeedCheck>('check')
  if (body?.installed?.code) installedCode = body.installed.code
  if (!body || !body.latest) {
    updateCheck.result = body?.state === 'off' ? 'off' : body?.state === 'offline' ? 'offline' : 'error'
    appLog.warn('update', `check: ${body?.state ?? 'no answer'}`)
    return null
  }
  const l = body.latest
  const changelog = l.changes.length ? l.changes.map((c) => ({ type: c.type, description: c.text })) : l.notes ? [{ type: 'NEW', description: l.notes }] : []
  return { latest: l.versionName, minimum: null, url: body.page, page: body.page, summary: l.notes, apk_url: null, size: l.size, sha256: null, version_code: l.versionCode, minimum_code: l.minimumCode, released_at: l.date, changelog }
}

let lastCheck = 0
export async function checkAppVersion() {
  try {
    // A web view can reuse an old answer despite no-cache (P67): a fresh query each time asks the server.
    const v = FEED ? await readFeed() : await api<AppVersion>('/app/version', { query: { _: Date.now() } })
    lastCheck = Date.now()
    updateCheck.at = lastCheck
    if (!v) return // no feed, no connection or a bad feed: keep the last answer (the server logged why)
    const kept = { latest: v.latest, minimum: v.minimum, url: v.url, apk_url: v.apk_url ?? null, size: v.size ?? null, sha256: v.sha256 ?? null, version_code: v.version_code ?? null, minimum_code: v.minimum_code ?? null, released_at: v.released_at ?? null, changelog: v.changelog ?? [], page: v.page ?? null, summary: v.summary ?? null }
    Object.assign(appVersion, kept)
    write(KEPT, kept)
    updateCheck.result = 'ok'
    appLog.info('update', `check: latest ${v.latest} (build ${v.version_code ?? '?'}), minimum ${v.minimum_code ?? v.minimum ?? '-'}, this ${APP_VERSION} (build ${installedCode || '?'})`)
    void restoreDownload()
    maybeOffer()
  } catch {
    /* no answer: keep the last one */
    updateCheck.at = Date.now()
    updateCheck.result = 'offline'
    appLog.warn('update', 'check: no answer')
  }
}

/** Later: no more offer on launch until a newer version than this one is out (the dot stays, Profile > Updates opens the page). */
export function updateLater() {
  appVersion.later = laterKey()
  write(LATER, appVersion.later)
}

/** Opens the download page in the phone's browser (NativePHP sends a new window's outside link there). */
export function openUpdate() {
  if (appVersion.url) window.open(appVersion.url, '_blank', 'noopener')
}

/* ---------- the update inside the app (plugin MobileUpdater.*; events DownloadProgress / DownloadComplete / DownloadFailed) */

/** idle, then downloading (percent), ready (downloaded, not yet installed), installing (Android's installer is open), permission (Android must first allow installing from this app) or failed (error). */
export type UpdatePhase = 'idle' | 'downloading' | 'ready' | 'installing' | 'permission' | 'failed'
export const updater = reactive<{ phase: UpdatePhase; percent: number; error: string; unfinished: boolean; allowed: boolean }>({ phase: 'idle', percent: 0, error: '', unfinished: false, allowed: read<boolean>(ALLOWED) === true })

/** What the offer and the update page say about the release: its version, size in MB and what changed. */
export const updateInfo = computed(() => ({
  version: appVersion.latest,
  mb: appVersion.size ? Math.max(1, Math.round(appVersion.size / 1_000_000)) : null,
  notes: (appVersion.changelog ?? []).map((c) => c.description).filter(Boolean),
  /** one line for the offer: the release's summary, else its first change */
  summary: appVersion.summary || (appVersion.changelog ?? [])[0]?.description || null,
  /** the same, with each change's kind (NEW, IMPROVED, FIXED, SECURITY, ISSUE) */
  changes: (appVersion.changelog ?? []).filter((c) => c.description).map((c) => ({ type: c.type, text: c.description })),
  build: appVersion.version_code ?? null,
  releasedAt: appVersion.released_at ?? null,
}))

/** The installed version code, for the update page and the required screen (0 when unknown). */
export const installedBuild = () => installedCode

/** Says "Updated to X" once, the first time a newer version than the last one seen starts; the first ever launch only records it. */
function noteUpdated() {
  const seen = read<string>(SEEN)
  if (seen !== APP_VERSION) write(SEEN, APP_VERSION)
  if (seen && newer(APP_VERSION, seen)) updated.to = APP_VERSION
}
export function dismissUpdated() {
  updated.to = null
}

let opener: (() => void) | null = null
let offered = false
/** The shell says how the offer opens (a modal); an offer waiting for it opens now. Register it in every data mode. */
export function setOfferOpener(open: (() => void) | null) {
  opener = open
  maybeOffer()
}
/** Once per app launch, at the first calm moment: what changed in a version just installed, else a new version not put off. */
function maybeOffer() {
  if (offered || !opener || !IS_APP) return
  if (updated.to === null && !(updateState.value === 'available' && updater.phase === 'idle')) return
  offered = true
  opener()
}

/** Later for a downloaded update too: the offer goes, the file stays for the next time. */
export function postponeUpdate() {
  updateLater()
  updater.phase = 'idle'
  updater.unfinished = false
}

/** Starts the in-app update; with no way to do it here (no plugin, no direct link) it opens the browser page instead. */
export async function startUpdate() {
  if (updater.phase === 'downloading' || updater.phase === 'installing') return
  if (updater.phase === 'ready') return installUpdate()
  if (!IS_APP || (!FEED && !appVersion.apk_url)) return openUpdate()
  updater.phase = 'downloading'
  updater.percent = 0
  updater.error = ''
  if (FEED) {
    // P79: the server reads the feed again and hands its own address and hash to the plugin
    const r = await updateServer<{ ok: boolean; error?: string }>('download', 'POST')
    if (!r.ok || !r.body?.ok) {
      appLog.warn('update', `download did not start: ${r.body?.error ?? r.status}`)
      if (r.body?.error === 'current') updater.phase = 'idle'
      else {
        updater.phase = 'failed'
        updater.error = 'download'
      }
    }
    return
  }
  const started = await nativeCall('MobileUpdater.Download', { url: appVersion.apk_url, ...(appVersion.latest ? { version: appVersion.latest } : {}), ...(appVersion.size ? { expectedSize: appVersion.size } : {}), ...(appVersion.sha256 ? { sha256: appVersion.sha256 } : {}) })
  if (started === null) {
    updater.phase = 'idle'
    openUpdate()
  }
}

/**
 * What Update does on the update page: looks at the phone first. The file is already there: ready to install. A download is
 * under way: the progress. An older file: cleared by the plugin, then downloaded again. Nothing: it downloads now.
 */
export async function beginUpdate() {
  if (updater.phase === 'downloading' || updater.phase === 'installing') return
  if (updater.phase === 'idle') await restoreDownload()
  if (updater.phase === 'idle') await startUpdate()
}

/** Opens Android's installer for the downloaded APK (Android first asks, once, to allow installing from this app). */
export async function installUpdate() {
  skipNextLock() // Android's installer in front is not the person being away (P65)
  updater.phase = 'installing'
  updater.error = ''
  updater.unfinished = false
  installingAt = Date.now()
  const r = await nativeCall<{ permissionRequired?: boolean; message?: string }>('MobileUpdater.InstallApk')
  if (r === null) {
    updater.phase = 'failed'
    updater.error = 'install'
  } else if (r.permissionRequired) {
    updater.phase = 'permission'
  } else {
    updater.allowed = true
    write(ALLOWED, true)
    // The installer opened. If the phone never says it closed (it was cancelled), the page must not stay on "Opening the installer".
    setTimeout(installerClosed, INSTALLER_WAIT)
  }
}

let installingAt = 0
const INSTALLER_WAIT = 8000
const SETTLE = 1500
/** Back from Android's installer without the app being replaced (Cancel, Back): offer the install again. */
function installerClosed() {
  if (updater.phase !== 'installing' || Date.now() - installingAt < SETTLE) return
  updater.phase = 'ready'
  updater.unfinished = true
}

export async function cancelUpdate() {
  await nativeCall('MobileUpdater.CancelDownload')
  updater.phase = 'idle'
  updater.percent = 0
}

/** A download the phone finished (or is still making) while the app was closed: offered again without downloading twice, and one of an older version is cleared. */
export async function restoreDownload() {
  if (!IS_APP || !appVersion.latest || !isNewer(appVersion.version_code, appVersion.latest) || updater.phase !== 'idle') return
  const s = await nativeCall<{ ready?: boolean; inProgress?: boolean }>('MobileUpdater.CheckDownloadStatus', { expectedVersion: appVersion.latest })
  if (s?.ready) updater.phase = 'ready'
  else if (s?.inProgress) updater.phase = 'downloading'
}

let listening = false
function listen() {
  if (listening) return
  listening = true
  document.addEventListener('native-event', (e) => {
    const d = (e as CustomEvent<{ event?: string; payload?: unknown }>).detail
    let body: { percent?: number; progress?: number } = {}
    try {
      body = (typeof d?.payload === 'string' ? JSON.parse(d.payload) : d?.payload) ?? {}
    } catch {
      /* a payload that is not JSON carries no progress */
    }
    if (d?.event?.endsWith('MobileUpdater\\DownloadProgress')) {
      updater.phase = 'downloading'
      updater.percent = Math.max(0, Math.min(100, Math.round(Number(body.percent ?? body.progress) || 0)))
    } else if (d?.event?.endsWith('MobileUpdater\\DownloadComplete')) {
      // fired more than once: only the first, while downloading, goes on to the installer
      if (updater.phase !== 'downloading') return
      updater.percent = 100
      updater.phase = 'ready'
      appLog.info('update', `download finished: ${appVersion.latest}`)
      void installUpdate()
    } else if (d?.event?.endsWith('MobileUpdater\\DownloadFailed')) {
      const why = String((body as { error?: string }).error ?? 'unknown')
      updater.phase = 'failed'
      // a file that does not match the release's SHA-256 is refused, not a connection problem
      updater.error = /sha-?256|checksum|mismatch/i.test(why) ? 'checksum' : 'download'
      appLog.error('update', `download failed: ${why.slice(0, 200)}`)
    }
  })
  // Back from Android's settings (the permission) retries the installer; back from the installer without installing offers it again.
  // Back only counts after the app was left (settings, the installer): a focus event while Android is still opening them must not start a loop.
  let left = false
  const gone = () => {
    left = true
  }
  const back = () => {
    if (!left || document.visibilityState === 'hidden') return
    left = false
    if (updater.phase === 'permission') void installUpdate()
    else installerClosed()
  }
  document.addEventListener('visibilitychange', () => (document.visibilityState === 'hidden' ? gone() : back()))
  window.addEventListener('blur', gone)
  window.addEventListener('focus', back)
  window.addEventListener('pageshow', back)
}

let timer: ReturnType<typeof setInterval> | undefined
export function startAppVersionChecks() {
  if (!IS_APP || timer) return
  noteUpdated()
  listen()
  void checkAppVersion()
  timer = setInterval(() => void checkAppVersion(), HOUR)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastCheck > RETURN_AFTER) void checkAppVersion()
  })
}
