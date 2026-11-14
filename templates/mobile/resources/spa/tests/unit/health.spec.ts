import { beforeEach, describe, expect, it, vi } from 'vitest'

/* P119: Background health from the modules: the shared auto-start check, and which sources apply. A module's own checks
 * (for example a messaging module's default-app role) are tested in that module's tests/. */
vi.mock('@/app/bridge', () => ({ IS_APP: true, APP_VERSION: '0.1.0', APP_BUILD: '7', nativeCall: async () => null }))
vi.mock('@/app/data', () => ({ DATA_MODE: 'connected', local: async () => ({}) }))

import { autostartCheck, autostartConfirmed, confirmAutostart, needsAutostart, readHealth, type HealthSource } from '@/app/health'
import { healthSources } from '@/app/healthSources'
import { remindersHealth } from '@/app/reminders'
import type { ModuleDefinition } from '@/app/modules'

const t = (key: string, named?: Record<string, unknown>) => (named && Object.keys(named).length ? `${key}${JSON.stringify(named)}` : key)

beforeEach(() => localStorage.clear())

describe('auto-start', () => {
  it('is asked on the makers with their own list only', () => {
    expect(needsAutostart('INFINIX MOBILITY LIMITED')).toBe(true)
    expect(needsAutostart('Xiaomi')).toBe(true)
    expect(needsAutostart('Google')).toBe(false)
    expect(needsAutostart(null)).toBe(false)
  })
  it('says the Phone Master path on Transsion, is blocked until confirmed, and remembers the answer for this build only', () => {
    const open = vi.fn()
    const first = autostartCheck({ key: 'x.autostart', maker: 'Infinix', product: 'App', build: '7', open }, t)
    expect(first.ok).toBe(false)
    expect(first.now).toBe('phone.health.autostart.blocked{"product":"App"}')
    expect(first.why).toContain('phone.health.autostart.pathTranssion')
    first.confirm!.run()
    const after = autostartCheck({ key: 'x.autostart', maker: 'Infinix', product: 'App', build: '7', open }, t)
    expect([after.ok, after.now, after.confirm]).toEqual([true, 'phone.health.autostart.confirmed{"product":"App"}', undefined])
    // a new build can come with the maker's list reset: it asks again
    expect(autostartCheck({ key: 'x.autostart', maker: 'Infinix', product: 'App', build: '8', open }, t).ok).toBe(false)
  })
  it('can take a mistaken "I allowed it" back, and then asks again', () => {
    const make = () => autostartCheck({ key: 'x', maker: 'Infinix', product: 'App', build: '7', open: () => {} }, t)
    make().confirm!.run()
    const confirmed = make()
    expect([confirmed.ok, confirmed.now, !!confirmed.undo, confirmed.confirm]).toEqual([true, 'phone.health.autostart.confirmed{"product":"App"}', true, undefined])
    confirmed.undo!.run()
    const again = make()
    expect([again.ok, again.now, !!again.confirm, again.undo]).toEqual([false, 'phone.health.autostart.blocked{"product":"App"}', true, undefined])
  })
  it('withdraws the confirmation when the module saw a restart without the app starting by itself', () => {
    confirmAutostart('7')
    const c = autostartCheck({ key: 'x', maker: 'Infinix', product: 'App', build: '7', open: () => {}, disproven: true }, t)
    expect([c.ok, c.now, !!c.confirm]).toEqual([false, 'phone.health.autostart.disproven{"product":"App"}', true])
    expect(autostartConfirmed('7')).toBe(false)
  })
  it('is fine without asking when the module proves it, and names the maker elsewhere', () => {
    const proven = autostartCheck({ key: 'x', maker: 'Xiaomi', product: 'App', build: '7', open: () => {}, proven: true }, t)
    expect([proven.ok, proven.now, proven.confirm]).toEqual([true, 'phone.health.autostart.proven{"product":"App"}', undefined])
    expect(proven.why).toContain('pathOther')
  })
})

describe('sources', () => {
  const mod = (over: Partial<ModuleDefinition>): ModuleDefinition => ({ key: 'M', ...over })
  it('are the modules own checks, plus the reminders only when a module has reminders', () => {
    const own: HealthSource = { read: async () => [] }
    expect(healthSources([mod({ health: own })])).toEqual([own])
    expect(healthSources([mod({ health: own }), mod({ key: 'R', reminders: { family: 'r', plan: () => [] } })])).toEqual([own, remindersHealth])
    expect(healthSources([mod({})])).toEqual([])
  })
  it('are read in order, and one that fails is skipped while the others still show', async () => {
    const a: HealthSource = { order: 20, read: async () => [{ key: 'a', icon: 'X', title: '', why: '', ok: true, now: '' }] }
    const b: HealthSource = { order: 10, read: async () => [{ key: 'b', icon: 'X', title: '', why: '', ok: false, now: '' }] }
    const broken: HealthSource = { read: async () => { throw new Error('no plugin') } }
    const r = await readHealth([a, broken, b], t)
    expect(r.checks.map((c) => c.key)).toEqual(['b', 'a'])
    expect(r.failed).toBe(1)
  })
})
