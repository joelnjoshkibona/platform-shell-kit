// P93: the phone app's start-up. In order: safe areas and the keyboard (P62, P71), the Back key (P61), the app log (P72),
// the stored session (P57: kept without a signal, ended only by a 401), the lifecycle (P58), then the modules this app shows.
import { createApp } from 'vue'
import App from './app/App.vue'
import { boot } from './app/boot'

boot().then((ctx) => createApp(App).use(ctx.router).use(ctx.i18n).mount('#app'))
