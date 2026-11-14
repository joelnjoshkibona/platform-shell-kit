import { defineAsyncComponent, type Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { DATA_MODE, type DataMode } from './data'
import type { HealthSource } from './health'
import type { Reminder } from './reminders'

/** A debug build (the dev server, or an app built with APP_DEBUG=true): it also loads the devOnly modules. A release never does. */
const DEBUG_BUILD = import.meta.env.DEV || import.meta.env.VITE_DEBUG === '1'

/**
 * P80–P82, P93: a phone module is a folder, src/modules/<name>/, that declares itself in its module.ts with defineModule();
 * the phone has its own modules (only those it shows), under the same keys as the API.
 * Nothing about a module is listed anywhere else: the loader below finds every module.ts by glob, and the router,
 * the languages and the related-record links read what the modules declare.
 *
 *   export default defineModule({
 *     key: 'Tasks',                       // the API module's key (its module.json key)
 *     routes,                             // pages under /:org, from ./routes.ts
 *     setup: () => registerRelatedPanel('Tasks', TasksPreview),   // optional one-off wiring
 *   })
 *
 * Its locales sit in locales/<lang>/<namespace>.json (src/app/i18n reads them); its tests in tests/.
 */
export interface ModuleDefinition {
  /** The API module's key (module.json "key"); unique. */
  key: string
  /** Pages inside the organisation's frame (/:org/…). */
  routes?: RouteRecordRaw[]
  /** Pages outside the frame (sign-in screens, tools). */
  rootRoutes?: RouteRecordRaw[]
  /** Only in debug builds (the dev server, or APP_DEBUG=true): tools such as a plugin's check screen. */
  devOnly?: boolean
  /** Runs once at start-up, before the router: register previews, panels, listeners. */
  setup?: () => void
  /**
   * The data modes it works in (P102); left out, all three. A module that needs the server (Approvals, Users) says
   * ['connected', 'sync'], so an on-the-phone app leaves it out.
   */
  modes?: DataMode[]
  /**
   * Its reminders (P74): the whole plan of one family, asked for when the app opens and comes back to the front. The phone
   * schedules these with Android's alarms and cancels that family's others, so a deleted record leaves no reminder behind.
   * `family` is a short word (`tasks`); each reminder's id starts with `<family>:`.
   */
  reminders?: { family: string; plan: () => Reminder[] | Promise<Reminder[]> }
  /**
   * Its checks on Background health (P119): what can stop its background work with the app closed (a permission, a role,
   * the battery, the maker's auto-start list), each read from its plugin with the action that fixes it.
   */
  health?: HealthSource
  /** Its links in the menu (the drawer), each shown to someone with `perm`; `group` is the drawer's group (default work). */
  menu?: MenuLink[]
  /**
   * Its places in the bottom bar (at most three across all modules, between Home and Alerts), each shown to someone with
   * `perm`. The page's route needs `meta: { tab: true }` (the bar shows on it) and a `name` equal to the tab's `key`.
   */
  tabs?: TabLink[]
  /** Cards on Home (a product's "my work"), above the platform's quick ways in, each shown to someone with `perm`. */
  homeCards?: HomeCard[]
  /**
   * What the round + in the bottom bar can add (the bar shows it when at least one is allowed): a title, an icon and
   * the page that starts it. The page opens its form when it sees `?new=1` (the phone generator writes that in).
   */
  quickAdd?: QuickAdd[]
  /**
   * P120: the module whose page is the app's first screen (an SMS app opens on its conversations). `true`: its route named
   * `home` replaces the platform's Home, its menu group leads the drawer, and Back on it is "press again to leave".
   * The platform's Home says `'fallback'` and is left out when a module claims the first screen. At most one module may.
   */
  home?: true | 'fallback'
}

export interface HomeCard {
  /** Unique across modules. */
  key: string
  /** The card: a component, or a dynamic import (loaded when Home opens). */
  component: Component | (() => Promise<Component | { default: Component }>)
  /** Lower first (default 100). */
  order?: number
  perm?: string
}

export interface QuickAdd {
  key: string
  /** The words: an i18n key ("New task"). */
  title: string
  icon: string
  /** Under /:org: '/tasks'. */
  path: string
  /** Query sent with it (default `{ new: '1' }`). */
  query?: Record<string, string>
  perm?: string
}

export interface TabLink {
  /** The route's name. */
  key: string
  /** The words: an i18n key. */
  title: string
  icon: string
  /** Under /:org: '/tasks'. */
  path: string
  perm?: string
  /** Lower comes first (default 50). */
  order?: number
}

export interface MenuLink {
  key: string
  /** The words: an i18n key. */
  title: string
  icon: string
  /** Under /:org: '/tasks'. */
  path: string
  perm?: string
  group?: string
  /** A number on the link: `badge` stands out (unread), `count` is quiet (how many there are). Read when the drawer opens. */
  badge?: () => number | undefined
  count?: () => number | undefined
}

export function defineModule(definition: ModuleDefinition): ModuleDefinition {
  return definition
}

/** Every module in src/modules/*\/module.ts, in folder order; a repeated key fails loudly. */
export function loadModules(found: Record<string, { default: ModuleDefinition }> = import.meta.glob<{ default: ModuleDefinition }>('../modules/*/module.ts', { eager: true }), mode: DataMode = DATA_MODE): ModuleDefinition[] {
  const seen = new Map<string, string>()
  const modules: ModuleDefinition[] = []
  for (const [path, mod] of Object.entries(found).sort(([a], [b]) => a.localeCompare(b))) {
    const def = mod.default
    if (!def?.key) throw new Error(`${path} must export default defineModule({ key, … })`)
    if (seen.has(def.key)) throw new Error(`Module key ${def.key} is used twice: ${seen.get(def.key)} and ${path}`)
    seen.set(def.key, path)
    if (def.devOnly && !DEBUG_BUILD) continue
    if (def.modes && !def.modes.includes(mode)) continue
    modules.push(def)
  }
  // P120: one module may own the first screen; the platform's Home steps aside for it
  const owners = modules.filter((m) => m.home === true)
  if (owners.length > 1) throw new Error(`Only one module may own the first screen: ${owners.map((m) => m.key).join(', ')}`)
  return owners.length ? modules.filter((m) => m.home !== 'fallback') : modules
}

export const modules = loadModules()

/** The bottom-bar places the modules declare, in order (TabBar adds Home first and Alerts last). */
export const collectTabs = (mods: ModuleDefinition[]): TabLink[] => mods.flatMap((m) => m.tabs ?? []).sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
/** What the round + offers, in module order. */
export const collectQuickAdds = (mods: ModuleDefinition[]): QuickAdd[] => mods.flatMap((m) => m.quickAdd ?? [])

export const moduleTabs: TabLink[] = collectTabs(modules)
export const moduleQuickAdds: QuickAdd[] = collectQuickAdds(modules)

/** Whether a module with this key is in this app (in this data mode). */
export const hasModule = (key: string) => modules.some((m) => m.key === key)

/** P120: the module that owns the first screen, if any. */
export const homeModule: ModuleDefinition | undefined = modules.find((m) => m.home === true)

/** The modules' Home cards, in order, each ready to render with `<component :is>`. A repeated key fails loudly. */
export function collectHomeCards(mods: ModuleDefinition[] = modules): { key: string; component: Component; perm?: string }[] {
  const seen = new Set<string>()
  const out: { key: string; order: number; component: Component; perm?: string }[] = []
  for (const m of mods) {
    for (const c of m.homeCards ?? []) {
      if (seen.has(c.key)) throw new Error(`Home card ${c.key} is declared twice`)
      seen.add(c.key)
      const component = typeof c.component === 'function' && !('setup' in c.component) && !('render' in c.component) ? defineAsyncComponent(c.component as () => Promise<Component>) : (c.component as Component)
      out.push({ key: c.key, order: c.order ?? 100, component, perm: c.perm })
    }
  }
  return out.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))
}
