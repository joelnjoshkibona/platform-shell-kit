# src/modules

One folder per module the phone shows, under the same name as on the API and the web (P80), for example `tasks/`:

    module.ts        defineModule: the same key and permissions as the API
    screens/         full screens (TasksScreen.vue, TaskScreen.vue)
    sheets/          bottom sheets (NewTaskSheet.vue, MoveSheet.vue)
    composables/     the module's logic for the phone
    locales/         en.json, sw.json
    tests/

Draw a module in the phone prototype first; build it from `../components` and `../app`, and from `packages/shared` for API calls,
types, statuses and formatting. Never import a web module.

Two of the phone's own modules ship with the template: `updates/` (the update page, one card, P79) and `health/` (Background health,
P119). A module whose work runs with the app closed adds its checks to Background health in its `module.ts`:

    import { autostartCheck, type HealthSource } from '@/app/health'
    export default defineModule({ key: 'Tasks', routes, health: tasksHealth })   // tasksHealth: HealthSource = { order, read(t) }

`read` asks the module's plugin and returns its checks (each with what it is now and the one action that fixes it); on a maker
with its own auto-start list it adds `autostartCheck({ key, maker, product, build, open, proven })`, where `proven` is the
module's own evidence that the app started by itself since the phone last started (for example its boot receiver ran).
