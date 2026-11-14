import { defineAsyncComponent } from 'vue'
import { APP_BUILD, APP_VERSION } from './bridge'
import { local } from './data'
import { autostartCheck, needsAutostart, type HealthCheck, type HealthSource } from './health'

/**
 * The phone's reminders and what Android lets through (P74; plugin blutrixx/nativephp-alarms, over `/api/local/reminders/*`).
 * A reminder is a list of times Android fires with the app closed; the interface sends the WHOLE plan of one family each time
 * its data changes or the app opens, and the phone schedules those and cancels that family's others (a deleted task leaves
 * no reminder behind). Outside the phone app every call answers `on_device: false` / does nothing.
 */
export interface Reminder {
  /** `<family>:<anything>`, e.g. `tasks:POS-12`. */
  id: string
  title: string
  body?: string
  /** Epoch seconds, soonest first; Android is given the first and arms the next itself. */
  times: number[]
  /** Opened when the reminder is tapped (the app's deep link). */
  url?: string | null
  snooze?: number
  /** Rings like an alarm over the lock screen. */
  screen?: boolean
}
export interface RemindersState {
  on_device: boolean
  notifications: boolean | null
  exact_alarms: boolean | null
  battery_unrestricted: boolean | null
  sdk: number | null
  manufacturer: string | null
  pending: { id: string; title: string; next: number; remaining: number }[]
  last_fired: { id: string; title: string; fired_at: number; shown: boolean } | null
}
export type SettingsPage = 'notifications' | 'exact' | 'battery' | 'autostart' | 'app'

export const reminders = {
  status: () => local<RemindersState>('/reminders/status'),
  plan: (family: string, plan: Reminder[]) => local<{ scheduled: number; cancelled: number }>('/reminders/plan', { method: 'POST', body: { family: `${family}:`, plan } }),
  test: (alarm = false) => local('/reminders/test', { method: 'POST', body: { alarm } }),
  requestNotifications: () => local('/reminders/request-notifications', { method: 'POST' }),
  openSettings: (page: SettingsPage) => local('/reminders/open-settings', { method: 'POST', body: { page } }),
}

/** What stops reminders reaching the person, one entry per thing (auto-start is the shared check in app/health.ts). */
export interface Health {
  key: 'notifications' | 'exact' | 'battery'
  ok: boolean
  /** The settings page that fixes it. */
  page: SettingsPage
}

export function healthOf(s: RemindersState): Health[] {
  if (!s.on_device) return []
  return [
    { key: 'notifications', ok: s.notifications === true, page: 'notifications' },
    // Android 14 and above only; before that exact alarms are granted by default
    ...((s.sdk ?? 0) >= 34 ? [{ key: 'exact' as const, ok: s.exact_alarms === true, page: 'exact' as const }] : []),
    { key: 'battery', ok: s.battery_unrestricted === true, page: 'battery' },
  ]
}

const ICON: Record<Health['key'], string> = { notifications: 'Bell', exact: 'AlarmClock', battery: 'BatteryCharging' }

/**
 * P119: the reminders' checks for Background health, added when a module has reminders (app/healthSources.ts). Under them,
 * what runs in the background (the last reminder that fired, the next one) and the test buttons.
 */
export const remindersHealth: HealthSource = {
  order: 90,
  extra: defineAsyncComponent(() => import('./RemindersRuns.vue')),
  async read(t) {
    const s = await reminders.status()
    if (!s.on_device) return []
    const product = t('shell.brand')
    const open = (h: Health) => async () => {
      if (h.key === 'notifications' && s.notifications === false) await reminders.requestNotifications()
      await reminders.openSettings(h.page)
    }
    const checks: HealthCheck[] = healthOf(s).map((h) => ({
      key: `reminders.${h.key}`,
      icon: ICON[h.key],
      title: t(`phone.health.${h.key}.title`),
      why: t(`phone.health.${h.key}.why`, { product }),
      ok: h.ok,
      now: t(`phone.health.${h.key}.${h.ok ? 'ok' : 'bad'}`, { product }),
      fix: { label: t(h.ok ? 'phone.health.review' : 'phone.health.fix'), run: open(h) },
    }))
    if (needsAutostart(s.manufacturer)) checks.push(autostartCheck({ key: 'reminders.autostart', maker: s.manufacturer ?? '', product, build: APP_BUILD || APP_VERSION, open: () => reminders.openSettings('autostart') }, t))
    return checks
  },
}
