import { defineModule } from '@/app/modules'
import { routes } from './routes'

/**
 * Background health (P119): whether the phone lets the app's background work through with the app closed. The checks come
 * from the modules (`defineModule({ health })`, app/healthSources.ts); this module only draws them.
 */
export default defineModule({
  key: 'BackgroundHealth',
  routes,
})
