# Modules: how a product's code is laid out, found and wired (P80–P90)

The working guide for P80 to P90. It comes from PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, the SYSTEM_SHELL app and `packages/generator-engine`), which proved these ideas on many products; the kit keeps them and fixes the places they broke. Each section names the generator file it came from.

## 1. A module is a folder (P80)

```
api/app/Modules/Custom/Work/Tasks/
  module.json                     the manifest (section 2)
  TasksController.php             thin: hands each request to a service
  TasksModel.php                  $guarded = []; relations; casts; no $fillable
  TasksFactory.php                tests and the e2e seeder use it
  Routes/api.php                  the module's routes (section 3); loaded by the module provider
  Migrations/                     real foreign keys, cascade or restrict per relation
  Seeders/TasksSeeder.php         upserts the module's permissions and its menu row
  Services/                       one class per operation (section 4)
    TasksListService.php  TasksViewService.php  TasksCreateService.php  TasksCreateSplashService.php
    TasksEditService.php  TasksEditSplashService.php  TasksDeleteService.php  TasksDeleteCheckService.php
    TasksActivityService.php
  Actions/                        one class per action (section 5)
    TasksMoveService.php  TasksSetStatusService.php
  Policies/  Providers/           optional: record rules; bindings the module brings
  Tests/                          found by phpunit's app/Modules/**/*Test.php

web/src/modules/tasks/
  module.ts                       defineModule({...}) (section 2)
  routes.ts                       the module's routes
  pages/  TasksListPage.vue  TasksDetailsLayout.vue  TasksDetailsOverviewPage.vue
  components/  TasksFormDialog.vue  TasksDetailsPanel.vue  TasksPreview.vue  TasksMoveDialog.vue
  composables/  useTaskTree.ts
  locales/  en.json  sw.json      merged under the module's namespace
  tests/  tasks.spec.ts  tasks.e2e.ts

phone/src/modules/tasks/          only the modules the phone shows (Shelui D27)
  module.ts  screens/  sheets/  locales/  tests/
```

Generator source: `SYSTEM_SHELL/BACKEND/app/Project/Modules/Core/Locations/Countries/`, `SYSTEM_SHELL/FRONTEND/src/pages/modules/countries/`, `docs/guide/architecture.md` (tiers). Kept: the folder and the names. Changed: tiers are Kernel, Core and Custom only; the phone has the same shape; nothing outside the folder.

## 2. The manifest (P81)

API `module.json`:
```json
{
  "key": "Tasks", "tier": "Custom", "group": "Work", "enabled": true,
  "label": "title",
  "references": {
    "project_id": { "module": "Projects", "label": "name" },
    "parent_id":  { "module": "Tasks",    "label": "title" },
    "assignee_id":{ "module": "Users",    "label": "name" }
  },
  "permissions": ["Tasks.move", "Tasks.setStatus"],
  "actions": {
    "move":      { "service": "TasksMoveService",      "permission": "Tasks.move",      "button": "more",   "opens": "dialog" },
    "setStatus": { "service": "TasksSetStatusService", "permission": "Tasks.setStatus", "button": "header", "opens": "menu", "bulk": true }
  },
  "children": { "subtasks": { "module": "Tasks", "via": "parent_id", "tab": "Subtasks" },
                "comments": { "module": "Comments", "via": "commentable", "tab": "Comments" } },
  "menu": { "group": "Work", "label": "Tasks", "icon": "ListChecks", "order": 10, "permission": "Tasks.list" }
}
```

Web and phone `module.ts`:
```ts
export default defineModule({
  key: 'Tasks',                     // ModuleKey: the union of every registered key
  path: 'tasks',                    // /tasks, /tasks/:key
  routes,                           // from ./routes.ts
  permission: 'Tasks.view',         // RecordLink and the preview check it
  detailsPanel: () => import('./components/TasksDetailsPanel.vue'),
  preview: () => import('./components/TasksPreview.vue'),   // what a RecordLink opens in a sheet
  backParent: 'tasks',              // Back with no trail (P49)
  menu: { group: 'Work', label: 'tasks.menu', icon: 'ListChecks', order: 10, permission: 'Tasks.list' },
  actions: { move: { label: 'tasks.move', icon: 'CornerDownRight', permission: 'Tasks.move', placement: 'more', opens: () => import('./components/TasksMoveDialog.vue') } },
})
```

Generator source: `module.json` (generator-engine) and `{Module}ModuleConfig` in each `routes.ts`, registered by `useEntityNavigation.registerModule`. Changed: no `registry*.json`, no `modules.json`, no central menu seed, no `SelectTrait`; references are declared, never guessed from table names; one test compares the API and web manifests.

## 3. Loading (P82)

API, in the module provider's `boot()`:
1. Glob `app/Modules/**/module.json`; skip `enabled: false`; fail on a repeated key.
2. `loadMigrationsFrom({dir}/Migrations)`.
3. `Route::prefix('api')->middleware(['api', 'auth:sanctum'])->group({dir}/Routes/api.php)`; each route adds `permission:{Module}.{op}`.
4. Register `{dir}/Providers/*` and `{dir}/Policies/*`.
5. The system seeder calls each `{Module}Seeder`, which upserts the CRUD permissions (`list, view, create, edit, delete, bulkAction`), the manifest's extra permissions and its menu row by route.

Web and phone, in `main.ts`:
1. `import.meta.glob('./modules/*/module.ts', { eager: true })`.
2. For each: add its routes under the app layout, its menu entry, its locales under its namespace, its actions and its link entry.

Generator source: `_Src/ApplicationServiceProvider.php::registerModules`, `_Src/SystemSeeder.php`, `FRONTEND/src/router/index.ts`, `FRONTEND/src/i18n.ts`.

## 4. Services (P83)

```php
final class TasksCreateService extends BaseService
{
    public function __construct(private TaskTree $tree, private Notifier $notify) {}

    protected function rules(array $data): array { return ['title' => 'required|string|max:200', 'parent_id' => 'nullable|exists:tasks,id', /* … */]; }

    protected function process(array $valid): array
    {
        $task = TasksModel::create($valid + ['organization_id' => $this->org(), 'created_by' => $this->user(), 'version' => 1]);
        $this->tree->attach($task);
        $this->notify->assigned($task);
        return $this->ok($task, 201);
    }
}
// controller: return $this->respond(app(TasksCreateService::class)->execute($request->all()));
```
`execute()` validates, then runs `process()` with only the validated keys in one transaction. A product changes a kit service by binding its own class in its provider.

## 5. Actions and bulk actions (P84)

`POST /tasks/{uuid}/move` → `TasksMoveService` behind `permission:Tasks.move`; the web reads `actions.move` to put "Move under another task" in the More menu and open `TasksMoveDialog`. Bulk: `POST /tasks/bulk-action { action: 'setStatus', ids: [...] | filter: {...}, payload }` behind `Tasks.bulkAction` and `Tasks.setStatus`.

Generator source: `docs/modules/actions.md`, `CountriesUpdateCountryCodesService.php`, `ListServiceTrait` (bulk dispatch).

## 6. Related records (P85)

API: a list or view eager-loads each reference once and returns it as `{ uuid, label, sub, deleted }` (`withTrashed` on the relation). Web: `<RecordLink module="Projects" :id="row.project.uuid" :label="row.project.label" :deleted="row.project.deleted"/>`. The registry gives the path, the preview, the permission and the back parent. Phone: the same component opens the preview in a bottom sheet.

Generator source: `FRONTEND/src/components/related-record/RelatedRecordLink.vue`, `composables/useEntityNavigation.ts`, `BaseServiceGenerator::generateEagerLoadRelationships`. Changed: a real href (new tab, Copy link), a side sheet instead of a dialog, a reason when it cannot open, deleted and missing states, a thin payload, declared references.

## 7. Child tabs (P86)

`children.subtasks` in the Tasks manifest → a Subtasks tab that renders the Tasks list scoped to the parent, fed by `GET /tasks/{uuid}/subtasks/list` (the server fetches the parent, then filters by `parent_id`), gated by `Tasks.list`; its create form locks the parent.

Generator source: `docs/modules/delegations.md`, `DelegationServiceGenerator`. Changed: the child module owns all its files.

## 8. Lists and API shape (P87, P88)

See the decisions. Generator source: `SYSTEM_SHELL/CONVENTIONS.md` (default filters, operators), `_Src/ListServiceTrait.php`, `_Src/SelectController.php`.

## 9. Tests that hold the rules (P90)

`tests/Conventions/ManifestsTest.php` (valid, unique keys, references exist, API and web agree), `MenusTest.php`, `ServicesUseValidatedDataTest.php`, `NoCrossModuleImportsTest.php`, `ListQueryCountTest.php`; web `tests/conventions/*.spec.ts` (every module has a preview and locales, forms have drafts, no cross-module imports). Generator source: `MenusSeedIntegrityTest`, `FrontendFormsHaveDraftsTest`, `CoreModulesFrontendOwnershipTest`.
