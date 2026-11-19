# P123 A module can be generated

**Amends** P80 (a module owns its files) and P81 (the manifest). **Owner**, 2026-11-19.

## Why

A code generator can write most of a module from its definition: the columns, the rules, the list's columns and
filters, the form's fields, the tests and the words. The starter's scaffolders already write a module that follows the
kit: its folder, manifest, registration, permissions, menu entry, organisation scope and phone sync. If a generator
wrote the whole module itself, it would carry its own copy of those rules and drift from the kit with every release.
If it rewrote whole files, it would destroy what a person added by hand.

## The decision

### 1. The skeleton belongs to the scaffolder, the body to the generator

A generated module is made in two steps. The scaffolder writes the skeleton once:

```
php artisan bootbox:module Tasks --group=Work --scope=location --generated
npm run make:module -- tasks --generated          # in web/
```

The generator then fills the body and fills it again whenever the module's definition changes. It never runs a
scaffolder again with `--force` on a module that exists: `--force` deletes the folder, with everything a person wrote.

### 2. Scope is chosen when the module is made

| `--scope` | Rows belong to | Model | Columns | Rules | Isolation test |
|---|---|---|---|---|---|
| `organisation` (default) | one organisation (P103) | `BelongsToOrganization` | `organization_id` | `unique_in_org`, `exists_in_org` | another organisation sees nothing |
| `location` | one location inside an organisation (P12, P13) | as above, plus location-bearing | plus `location_id` | plus the location must be one the person can reach | a person sees only rows at locations they reach |
| `global` | nobody: shared reference data every organisation reads | no organisation scope | no `organization_id` | `unique`, `exists` | every organisation sees the same rows |

The manifest records the choice: `"scope": "organisation" | "location" | "global"`.

**Open:** the label column. The skeleton's record is named by `name`, and `name` is used outside the slots too (the
isolation test, the details page title, the delete dialog). A module whose label is another column needs a scaffolder
option for it; until then a generator keeps `name`.

**Open:** quick tabs (P24, P40). The skeleton's list has none, so the list page has no `tabs` slot yet.

**Open:** who may write a `global` module's rows. Today a global core module (Countries) can be edited by any
organisation's owner. Until this is decided, a global module keeps the ordinary permissions.

### 3. Slots

With `--generated`, the scaffolders put every body region between named markers:

```php
// @generated:rules begin
'name' => ['required', 'string', 'max:200', 'unique_in_org:tasks,name'],
// @generated:rules end
```

```vue
<!-- @generated:fields begin -->
<Input v-model="form.name" … />
<!-- @generated:fields end -->
```

- What is between a slot's markers belongs to the generator: it is replaced whole on every run.
- Everything outside the markers belongs to people and is never touched.
- The default body (a `name` and a `description`) sits inside the slots, so a module made with `--generated` works
  before any generator has filled it.
- Without `--generated`, the files are exactly the `--generated` files less their marker lines: a person who
  scaffolds by hand never sees a marker.
- A slot name appears once per file. Markers are always balanced.

The slots, by file:

| File | Slots |
|---|---|
| `{Module}Model.php` | `casts`, `relations`, `select-label` |
| `{Module}Factory.php` | `definition` |
| `Migrations/*_create_*_table.php` | `columns` (with the unique key) |
| `Seeders/{Module}Seeder.php` | `permissions` |
| `Routes/api.php` | `actions` |
| `{Module}Controller.php` | `actions` |
| `Services/{Module}ListService.php` | `filterable`, `sortable`, `searchable`, `eager`, `bulk-actions`, `filter-fields` |
| `Services/{Module}CreateService.php`, `…EditService.php` | `rules` |
| `Services/{Module}ViewService.php` | `with` |
| `Services/{Module}DeleteCheckService.php` | `relationships` |
| `Tests/{Module}Test.php` | `fields` |
| web `api.ts` | `row`, `input` |
| web `pages/{Module}Page.vue` | `sorts`, `columns`, `row-actions` |
| web `pages/{Module}FormDialog.vue` | `state`, `valid`, `body`, `fields` |
| web `pages/{Module}DetailPage.vue` | `overview` |
| web `module.ts` | `tabs`, `actions`, `children` |

JSON files carry no markers. In `module.json` a generator writes only `label`, `references`, `permissions`, `actions`,
`children`, `search`, `select`, `role_defaults`, `approval_actions` and `media_references`, and changes `menu` only to
set its icon. In the locale files it writes only the keys under the module's own namespace.

### 4. The generator contract

The starter's `kit.json` carries `"generator_contract": 1`. It goes up by one whenever a slot is added, removed,
renamed or moved, or a component or composable that generated code calls changes its props or its shape. A generator
declares the contracts it can write for and refuses any other, naming the starter's contract and its own.

### 5. The skeleton is complete

Every scaffolded module, generated or not, has:

- its activity route and service (P101: History is the last tab);
- its `/bulk-action` route and an empty bulk-action list (P84, P99), so the permission the seeder grants has a route;
- on the web, its record page (P101), opened in the record dialog from any link (P111): Overview and History, with
  the list's rows opening it.

## Checks

- A module scaffolded in each scope passes its own tests, including the isolation test for its scope.
- Without `--generated`, the output carries no marker and equals the `--generated` output less its marker lines.
- With `--generated`, every file's markers are balanced and each slot name appears once per file.
- Replacing a slot's content leaves every line outside the slot unchanged.
