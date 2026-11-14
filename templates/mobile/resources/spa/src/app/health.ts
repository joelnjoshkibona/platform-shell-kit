import type { Component } from 'vue'

/**
 * Background health (P119): can this phone let the app's background work through with the app closed? The screen and
 * the Profile row list every module's checks; a module supplies them with `defineModule({ health })`, so a reminders app
 * checks exact alarms and a messaging module checks that it is the phone's default for its role, each reading its own plugin. A check knows whether it is
 * fine, says what it is now in words, and offers the one action that fixes it.
 *
 * Some settings cannot be read (a maker's auto-start list): the person opens the list and confirms ("I allowed it"), and the
 * phone remembers that for this build. The answer can be taken back ("Not allowed? Ask again"), and it is checked: a module
 * that can tell marks the check fine once the app started by itself after a restart (proven), and withdraws a confirmation
 * when the phone restarted after it and the app did not start by itself (disproven).
 */
export type Translate = (key: string, named?: Record<string, unknown>) => string

export interface HealthCheck {
  /** unique across modules, e.g. `reminders.exact` */
  key: string
  icon: string
  /** already translated */
  title: string
  why: string
  ok: boolean
  /** what it is now, in words */
  now: string
  /** the action that fixes it (or reviews it when fine): opens Android's page, asks for a permission… */
  fix?: { label: string; run: () => unknown }
  /** for a setting Android cannot report: the person says it is done */
  confirm?: { label: string; run: () => void }
  /** takes the person's word back (a mistaken "I allowed it"), so the check asks again */
  undo?: { label: string; run: () => void }
}

export interface HealthSource {
  /** reads the phone and returns this module's checks, in the order shown */
  read: (t: Translate) => Promise<HealthCheck[]>
  /** shown under the checks: what this module runs in the background, test buttons… */
  extra?: Component
  /** where its checks go among the modules' (lower first, default 50) */
  order?: number
}

/** Every source's checks, in order; a source that fails to read is skipped (the others still show). */
export async function readHealth(sources: HealthSource[], t: Translate): Promise<{ checks: HealthCheck[]; failed: number }> {
  const sorted = [...sources].sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
  const results = await Promise.allSettled(sorted.map((s) => s.read(t)))
  return {
    checks: results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    failed: results.filter((r) => r.status === 'rejected').length,
  }
}

/* ---------- auto-start: the makers whose own task killer stops a closed app unless it may start by itself */

/** Makers with an auto-start list of their own (Transsion: Infinix, Tecno, itel). */
export const AUTOSTART_MAKERS = /infinix|tecno|itel|transsion|xiaomi|redmi|poco|oppo|realme|vivo|huawei|honor|oneplus/i
const TRANSSION = /infinix|tecno|itel|transsion/i

const AUTOSTART_KEY = '{{product_slug}}.autostart'
/** When the person said they allowed auto-start (epoch ms), or 0. It cannot be read; kept per build, since an update can reset the maker's list. */
export const autostartConfirmedAt = (build: string): number => {
  try {
    const v = JSON.parse(localStorage.getItem(AUTOSTART_KEY) ?? 'null') as { build?: string; at?: number } | null
    return v?.build === build && typeof v.at === 'number' ? v.at : 0
  } catch {
    return 0
  }
}
export const autostartConfirmed = (build: string): boolean => autostartConfirmedAt(build) > 0
export const confirmAutostart = (build: string, at = Date.now()): void => {
  try {
    localStorage.setItem(AUTOSTART_KEY, JSON.stringify({ build, at }))
  } catch {
    /* private mode: it asks again */
  }
}
export const forgetAutostart = (): void => {
  try {
    localStorage.removeItem(AUTOSTART_KEY)
  } catch {
    /* nothing kept */
  }
}

/**
 * The auto-start check, the same for every module: the path to the maker's list, Open settings, I allowed it, and the state:
 * - proven: the module saw the app start by itself after the phone last started; nothing to ask;
 * - disproven: the phone restarted after the person confirmed and the app did not start by itself; the confirmation is
 *   withdrawn and the check asks again;
 * - confirmed: the person's word, which "Not allowed? Ask again" takes back; the next restart checks it;
 * - blocked: not allowed yet.
 */
export function autostartCheck(o: { key: string; maker: string; product: string; build: string; open: () => unknown; proven?: boolean; disproven?: boolean; why?: string; onChange?: () => void }, t: Translate): HealthCheck {
  if (o.disproven && !o.proven) forgetAutostart()
  const confirmed = !o.proven && autostartConfirmed(o.build)
  const path = TRANSSION.test(o.maker) ? t('phone.health.autostart.pathTranssion', { product: o.product }) : t('phone.health.autostart.pathOther', { maker: o.maker, product: o.product })
  const state = o.proven ? 'proven' : confirmed ? 'confirmed' : o.disproven ? 'disproven' : 'blocked'
  return {
    key: o.key,
    icon: 'Power',
    title: t('phone.health.autostart.title'),
    why: `${o.why ?? t('phone.health.autostart.why', { product: o.product })} ${path}`,
    ok: state === 'proven' || state === 'confirmed',
    now: t(`phone.health.autostart.${state}`, { product: o.product }),
    fix: { label: t('phone.health.autostart.open'), run: o.open },
    confirm: state === 'blocked' || state === 'disproven' ? { label: t('phone.health.autostart.allowed'), run: () => (confirmAutostart(o.build), o.onChange?.()) } : undefined,
    undo: state === 'confirmed' ? { label: t('phone.health.autostart.undo'), run: () => (forgetAutostart(), o.onChange?.()) } : undefined,
  }
}

/** Is this maker one with its own auto-start list. */
export const needsAutostart = (maker: string | null | undefined) => !!maker && AUTOSTART_MAKERS.test(maker)
