import type { RouteRecordRaw } from 'vue-router'

/** Profile > Background health. */
export const routes: RouteRecordRaw[] = [{ path: 'background-health', name: 'background-health', component: () => import('@/modules/health/screens/BackgroundHealth.vue') }]
