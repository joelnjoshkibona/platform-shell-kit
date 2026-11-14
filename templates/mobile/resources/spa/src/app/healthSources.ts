import type { HealthSource } from './health'
import { modules, type ModuleDefinition } from './modules'
import { remindersHealth } from './reminders'

/**
 * P119: what Background health checks. Each module's own checks (`defineModule({ health })`), plus the reminders' (notifications,
 * exact alarms, battery, auto-start) when any module has reminders. Kept apart from app/health.ts so neither the modules
 * nor the reminders import each other.
 */
export function healthSources(mods: ModuleDefinition[] = modules): HealthSource[] {
  const own = mods.flatMap((m) => (m.health ? [m.health] : []))
  return mods.some((m) => m.reminders) ? [...own, remindersHealth] : own
}
