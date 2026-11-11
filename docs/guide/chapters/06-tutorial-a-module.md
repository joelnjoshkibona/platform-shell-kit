# Tutorial: build one module end to end

We build a small **Tasks** module: a task has a title, an optional parent task (so tasks nest), an optional assignee, a status and a due date. Follow the steps in order. Each step ends with a check.

> **Note**: The names below (`BaseService`, `defineModule`, `ListCard`, `useList`, `RecordLink`) are built in Phase 0 of every product from the kit's rules and component library. If you are in Phase 0, build them first (chapter 10, plan steps 0.x).

## Step 1: the manifest

`api/app/Modules/Custom/Work/Tasks/module.json` says what the module is. Everything else reads it.

```json
{
  "key": "Tasks", "tier": "Custom", "group": "Work", "enabled": true,
  "label": "title",
  "references": {
    "parent_id":   { "module": "Tasks", "label": "title" },
    "assignee_id": { "module": "Users", "label": "name" }
  },
  "permissions": ["Tasks.setStatus"],
  "actions": { "setStatus": { "service": "TasksSetStatusService", "permission": "Tasks.setStatus", "button": "header", "opens": "menu", "bulk": true } },
  "children": { "subtasks": { "module": "Tasks", "via": "parent_id", "tab": "Subtasks" } },
  "menu": { "group": "Work", "label": "Tasks", "icon": "ListChecks", "order": 10, "permission": "Tasks.list" }
}
```

**Check**: `php artisan modules:check` lists Tasks with no errors (the manifest is valid; its references point at modules that exist).

## Step 2: the table

`Migrations/2026_11_10_000001_create_tasks_table.php`:

```php
Schema::create('tasks', function (Blueprint $t) {
    $t->id();
    $t->ulid('uuid')->unique();
    $t->foreignId('organization_id')->constrained()->cascadeOnDelete();
    $t->foreignId('parent_id')->nullable()->constrained('tasks')->cascadeOnDelete();   // a subtask goes with its parent
    $t->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
    $t->string('title', 200);
    $t->string('status', 20)->default('todo');
    $t->date('due_date')->nullable();
    $t->unsignedInteger('version')->default(1);                                          // P88: a stale save gets 409
    $t->foreignId('created_by')->constrained('users');
    $t->timestamps(); $t->softDeletes();
});
```

> **Why**: The foreign keys are real (`constrained()`), so the database itself refuses a task whose parent does not exist, and deleting a parent removes its subtasks. Never rely only on code for this.

**Check**: `php artisan migrate` runs; `php artisan migrate:rollback --step=1` and `migrate` again run too.

## Step 3: the model

```php
final class TasksModel extends BaseModel
{
    protected $table = 'tasks';
    protected $casts = ['due_date' => 'date'];
    public function parent()   { return $this->belongsTo(self::class, 'parent_id')->withTrashed(); }
    public function children() { return $this->hasMany(self::class, 'parent_id'); }
    public function assignee() { return $this->belongsTo(UsersModel::class, 'assignee_id')->withTrashed(); }
}
```

There is no `$fillable`: only validated data ever reaches the model (P83), so the validation rules are the one list of what can be written.

## Step 4: the services

One class per operation. `Services/TasksCreateService.php`:

```php
final class TasksCreateService extends BaseService
{
    public function __construct(private Notifier $notify) {}

    protected function rules(array $data): array
    {
        return [
            'title'       => ['required', 'string', 'max:200'],
            'parent_id'   => ['nullable', Rule::exists('tasks', 'id')->where('organization_id', $this->org())],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'due_date'    => ['nullable', 'date'],
        ];
    }

    protected function process(array $valid): array
    {
        $task = TasksModel::create($valid + ['organization_id' => $this->org(), 'created_by' => $this->user()->id]);
        if ($task->assignee_id) $this->notify->send('task.assigned', $task);
        return $this->ok($task, 201);
    }
}
```

`BaseService::execute()` validates, then calls `process()` with **only the validated keys**, inside a database transaction. Write the others the same way: `TasksListService` (uses the list contract, P87), `TasksViewService`, `TasksEditService` (checks `version`, answers 409 when it is stale), `TasksDeleteCheckService` (counts the subtasks that would go), `TasksDeleteService`, and the action `Actions/TasksSetStatusService.php`.

## Step 5: routes and controller

`Routes/api.php`:

```php
Route::prefix('tasks')->controller(TasksController::class)->group(function () {
    Route::get('list', 'list')->middleware('permission:Tasks.list');
    Route::get('create/splash', 'createSplash')->middleware('permission:Tasks.create');
    Route::post('create', 'create')->middleware('permission:Tasks.create');
    Route::get('{uuid}/view', 'view')->middleware('permission:Tasks.view');
    Route::put('{uuid}/edit', 'edit')->middleware('permission:Tasks.edit');
    Route::get('{uuid}/delete/check', 'deleteCheck')->middleware('permission:Tasks.delete');
    Route::delete('{uuid}/delete', 'delete')->middleware('permission:Tasks.delete');
    Route::get('{uuid}/activity', 'activity')->middleware('permission:Tasks.view');
    Route::post('{uuid}/set-status', 'setStatus')->middleware('permission:Tasks.setStatus');
    Route::post('bulk-action', 'bulkAction')->middleware('permission:Tasks.bulkAction');
    Route::get('{uuid}/subtasks/list', 'subtasks')->middleware('permission:Tasks.list');   // child tab (P86)
});
```

The controller only hands each request to its service: `return $this->respond(app(TasksCreateService::class)->execute($request->all()));`

**Check**: `php artisan route:list --path=api/tasks` shows every route with its permission.

## Step 6: permissions and menu

`Seeders/TasksSeeder.php` upserts `Tasks.list`, `view`, `create`, `edit`, `delete`, `bulkAction` and the manifest's `Tasks.setStatus`, and the menu row from the manifest. Run `php artisan db:seed`.

## Step 7: API tests

`Tests/TasksCreateServiceTest.php` proves: a task is created; a missing title is refused (422); a parent from another organisation is refused; someone without `Tasks.create` gets 403; an extra field sent by the client (`created_by`) is ignored. Run `./vendor/bin/pest app/Modules/Custom/Work/Tasks`.

## Step 8: the web module

`web/src/modules/tasks/module.ts`:

```ts
import { defineModule } from '@/app/modules'
import routes from './routes'

export default defineModule({
  key: 'Tasks', path: 'tasks', routes, permission: 'Tasks.view', backParent: 'tasks',
  detailsPanel: () => import('./components/TasksDetailsPanel.vue'),
  preview: () => import('./components/TasksPreview.vue'),
  menu: { group: 'Work', label: 'tasks.menu', icon: 'ListChecks', order: 10, permission: 'Tasks.list' },
})
```

The app finds it by itself (P82). Then the list page, built only from the library:

```vue
<script setup lang="ts">
import { useList } from '@/app/lists'
const list = useList<Task>({ endpoint: '/tasks/list', search: true, sorts: ['due_date', 'title'] })
const columns = [
  { key: 'title', label: 'Task', identity: true },
  { key: 'assignee', label: 'Assignee', priority: 2, fold: 'meta' },
  { key: 'due_date', label: 'Due', priority: 1, fold: 'meta' },
  { key: 'status', label: 'Status', status: true, priority: 3 },
]
</script>
<template>
  <ListCard :list="list"><ListRows :list="list" :columns="columns" @open="r => $router.push(`/tasks/${r.uuid}`)">
    <template #cell-assignee="{ row }"><RecordLink module="Users" :id="row.assignee?.uuid" :label="row.assignee?.label"/></template>
  </ListRows></ListCard>
</template>
```

Notice `RecordLink`: the assignee is a link, never plain text (P85); a click opens that person's details page in a dialog over the list (P111).

**Check**: `npm run typecheck` passes (a typo in a module key fails here); the page at 1280 light and 390 dark matches the prototype's screenshots (`npm run test:visual`).

## Step 9: explain what you did

Add or update the product guide's chapter for Tasks: what a task is, its table, its files, the commands you ran, the checks. Mark the plan step and the tracker row (chapter 10). Run `tools/guide/check.sh`. Then open the pull request.
