import type { Router } from 'vue-router'

/**
 * A hidden space's locks (phone kit, P121): a space no menu shows, opened by typing its passphrase into search. It locks
 * when the person leaves its pages (any route not in `routes`), and when the app goes to the background, which also
 * leaves its pages for `home`. The module keeps the key and its idle lock; this only decides when to call `lock`.
 */
export function guardHiddenSpace(router: Router, o: { routes: Set<string>; isOpen: () => boolean; lock: () => void; home: string }) {
  const inside = (name: unknown) => o.routes.has(String(name ?? ''))
  router.afterEach((to) => {
    if (o.isOpen() && !inside(to.name)) o.lock()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || !o.isOpen()) return
    o.lock()
    if (inside(router.currentRoute.value.name)) void router.replace(o.home)
  })
}

/**
 * Search's first step: the words tried as the passphrase, every time, at the same cost whether or not a space exists.
 * True only when they opened it; a failure is an ordinary search.
 */
export async function tryOpen(words: string, unlock: (w: string) => Promise<boolean>): Promise<boolean> {
  const w = words.trim()
  if (!w) return false
  try {
    return await unlock(w)
  } catch {
    return false
  }
}
