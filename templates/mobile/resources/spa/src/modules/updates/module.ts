import { defineModule } from '@/app/modules'
import { routes } from './routes'

/** The update page (P79): the phone's own, in every data mode. Opened from the offer (Update) and Profile > Check for updates. */
export default defineModule({
  key: 'AppUpdates',
  routes,
})
