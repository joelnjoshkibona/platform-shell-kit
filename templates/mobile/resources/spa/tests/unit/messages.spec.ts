import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

/* P120: the first screen a module may own, and the messaging pieces (run inside a product, where src/app is complete). */
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

import { textParts } from '@/app/textParts'
import { loadModules, type ModuleDefinition } from '@/app/modules'
import SwipeRow from '@/components/SwipeRow.vue'

describe('textParts', () => {
  it('counts GSM texts in 160 and 153, anything else in 70 and 67, extension characters twice', () => {
    expect([textParts('a'.repeat(160)).parts, textParts('a'.repeat(161)).parts, textParts('a'.repeat(307)).parts]).toEqual([1, 2, 3])
    expect(textParts('Habari 😀')).toMatchObject({ parts: 1, unicode: true })
    expect([textParts('€'.repeat(80)).parts, textParts('€'.repeat(81)).parts]).toEqual([1, 2])
  })
})

describe('P120', () => {
  const found = (...defs: ModuleDefinition[]) => Object.fromEntries(defs.map((d, i) => [`../modules/m${i}/module.ts`, { default: d }]))
  it("a module that owns the first screen puts the platform's Home aside; only one may", () => {
    expect(loadModules(found({ key: 'Dashboard', home: 'fallback' }, { key: 'Inbox', home: true }), 'phone').map((m) => m.key)).toEqual(['Inbox'])
    expect(() => loadModules(found({ key: 'A', home: true }, { key: 'B', home: true }), 'phone')).toThrow(/Only one module/)
  })
})

describe('SwipeRow', () => {
  const pointer = (type: string, x: number) => Object.defineProperty(new MouseEvent(type, { clientX: x, clientY: 0, button: 0, bubbles: true }), 'pointerId', { value: 1 })
  it('runs a side past 96px and a tap opens', () => {
    vi.useFakeTimers()
    const w = mount(SwipeRow, { props: { left: { label: 'Archive', icon: 'Archive' } }, slots: { default: '<div>row</div>' } })
    const row = w.find('.bg-background').element
    for (const [t, x] of [['pointerdown', 0], ['pointermove', 20], ['pointermove', 120], ['pointerup', 120]] as const) row.dispatchEvent(pointer(t, x))
    vi.advanceTimersByTime(200)
    row.dispatchEvent(pointer('pointerdown', 0))
    row.dispatchEvent(pointer('pointerup', 0))
    expect([w.emitted('swipe'), w.emitted('open')?.length]).toEqual([[['left']], 1])
    vi.useRealTimers()
  })
})
