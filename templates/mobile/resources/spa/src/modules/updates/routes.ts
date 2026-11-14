import type { RouteRecordRaw } from 'vue-router'

/** The update page under /:org; Update in the offer opens it with ?go=1 to start at once. */
export const routes: RouteRecordRaw[] = [{ path: 'update', name: 'app-update', component: () => import('@/modules/updates/screens/AppUpdate.vue') }]
