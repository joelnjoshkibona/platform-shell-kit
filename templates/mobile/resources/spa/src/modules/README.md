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
