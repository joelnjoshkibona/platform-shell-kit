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

The record's name is a column of its own choosing: `--label-column` (default `name`) on both scaffolders makes every
skeleton use of it (the list's main column, the details title, the delete dialog, the tests) that column.

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
| `{Module}Model.php` | `traits` (its own trait statement, under the skeleton's), `constants` (e.g. `SELECT_LABEL`, P47's `WORKFLOW`), `casts`, `relations` |
| `{Module}Factory.php` | `definition` |
| `Migrations/*_create_*_table.php` | `columns` (with the unique key) |
| `Seeders/{Module}Seeder.php` | `permissions` |
| `Routes/api.php` | `actions` |
| `{Module}Controller.php` | `actions` |
| `{Module}Csv.php` (the list's CSV, P39/P87, D188) | `columns` (header and cell of each column the list shows) |
| `Services/{Module}ListService.php` | `filterable`, `sortable`, `searchable`, `eager`, `bulk-actions`, `filter-fields` |
| `Services/{Module}CreateService.php`, `…EditService.php` | `rules` |
| `Services/{Module}ViewService.php` | `with` |
| `Services/{Module}DeleteCheckService.php` | `relationships` |
| `Tests/{Module}Test.php` | `fields` |
| `Tests/{Module}SyncTest.php` (a sync module, P102) | `fields` (the offline record's other fields: the module test's) |
| web: every script | `imports` (the generator's own import lines; a name already imported is left out) |
| web `api.ts` | `row`, `types`, `input`, `api` (extra client calls) |
| web `pages/{Module}Page.vue` | `sorts`, `tabs`, `columns`, `cells` (a column's own cell: status pill, related link), `row-actions` |
| web `pages/{Module}FormDialog.vue` | `setup`, `state`, `valid`, `body`, `fields`, `size` (the dialog's width: `lg`, or `xl` for a priced document, P115) |
| web `pages/{Module}DetailPage.vue` | `setup`, `header` (`headerIcon`, `headerStatus`), `overview` (a fact with a `link` shows as a RelatedLink), `own-tabs` (the page's tabs between Overview and History), `overview-extra` (below the facts: a document's read-only lines), `tab-bodies` (those tabs' content) |
| web `module.ts` | `tabs`, `declarations` (type entries, e.g. `RecordExtraTabMap`), `actions`, `extra-tabs` (a child's tab on its parent, P86) |
| phone `screens/types.ts` | `row`, `types` (a workflow's declared statuses, for phone mode) |
| phone `screens/{Module}Page.vue` | `imports`, `setup`, `sort`, `tabs`, `cells` |
| phone `screens/{Module}Sheet.vue` | `imports`, `setup`, `state`, `reset`, `draft-get`, `draft-apply`, `input`, `valid`, `fields` |
| phone `module.ts` | `menu` (its icon) |
| phone `app/Local/Modules/{Module}.php` | `rules` (the API's, for the phone's store, P104) |

**PHP imports have no slot.** A formatter that orders imports (Pint) moves them across any marker. A generator adds the
imports its body needs and runs the starter's formatter on the files it wrote, which orders them and removes the ones
nothing uses any more. The formatter may also change blank lines next to a slot; that is the only change it makes
outside one. **The web side's imports have a slot:** nothing reorders them there, and an unused import fails the
typecheck, so the generator owns its import lines whole.

A generator writes a locale key it derives; a translation it has no words for (a missing Swahili label) is written
only where the key is missing, never over one already there.

JSON files carry no markers. In `module.json` a generator writes only `description`, `label`, `references`, `permissions`, `actions`,
`tab_on`, `search`, `select`, `role_defaults`, `approval_actions`, `media_references` and `calendar` (P128), and changes `menu` only to
set its icon, and `workflows` (P47). It may also write whole files of its own beside the skeleton's (a workflow's
statuses migration); those it rewrites every run. A third kind is **written once**: a file whose body is the
developer's (an action's service, P84, and its dialog). A generator writes it when it is missing and never touches it
again, and says so ("kept"). In the locale files it writes only the keys under the module's own namespace.

### 4. The generator contract

The starter's `kit.json` carries `"generator_contract": 7` (2 since 2026-11-20: the web slots added with P84, P86 and P115, and the phone's; 3 the same day: the sync test's `fields`; 4 on 2026-11-21: the list's CSV; 5 the same day: the phone's record page and actions, P129; 6 the same day: the phone's tabs and lines, P130; 7 the same day: media columns, P131). It goes up by one whenever a slot is added, removed,
renamed or moved, or a component or composable that generated code calls changes its props or its shape. A generator
declares the contracts it can write for and refuses any other, naming the starter's contract and its own.

### 5. The skeleton is complete

Every scaffolded module, generated or not, has:

- its activity route and service (P101: History is the last tab);
- its `/bulk-action` route and an empty bulk-action list (P84, P99), so the permission the seeder grants has a route;
- on the web, its record page (P101), opened in the record dialog from any link (P111): Overview and History, with
  the list's rows opening it;
- its list export (P39, P87): `GET /<module>/list/export` answers the whole view (search, filters, sort, scope) as
  CSV through the module's `{Module}Csv` (D188), behind `{Module}.list`; on the web, the list's Export button
  (ListShare) calls it;
- on the web, its list's quick tabs (P24, P40) bound to one filter, with none declared: the `tabs` slot names the filter
  and its tabs once the module has a status (P47).

## Checks

- A module scaffolded in each scope passes its own tests, including the isolation test for its scope.
- Without `--generated`, the output carries no marker and equals the `--generated` output less its marker lines.
- With `--generated`, every file's markers are balanced and each slot name appears once per file.
- Replacing a slot's content leaves every line outside the slot unchanged, apart from the formatter's blank lines and
  imports.
- A generated module is compared with a hand-written one with its markers removed and the formatter run on both.

### The phone (amended 2026-11-20, kit 1.42.0)

The phone scaffolder (`mobile/resources/spa`: `npm run make:module -- tasks --generated --scope=… --label-column=…`)
writes the phone skeleton with the slots above; a generator fills them only for a module that asks for phone screens.
Its fields are the phone's own (P124: DateField, RecordPick, ChoiceSheet, Toggle), never a native picker. The slots
are part of the contract: `generator_contract` **2** (a generator that knows only 1 refuses an app at 2, by name).

### Sync modules (amended 2026-11-20, kit 1.44.0)

A generated module may be a sync module (P102): `"sync": true` (with `"keep_days": N` to limit what a phone keeps), and only with
`"phone": true`. The generator asks the scaffolder for it when it makes the module (`--sync`, `--keep-days`); the
manifest's `sync` key stays the scaffolder's, so for a module that exists a generator never changes it and refuses a
spec that disagrees, naming the key. The sync test's `fields` slot carries the offline record's other fields, the same as
the module test's. `generator_contract` **3**.

### The list's CSV (amended 2026-11-21, kit 1.45.0)

Every scaffolded module exports its list (P39, P87): the skeleton writes `{Module}Csv.php`, a `ListCsv` (D188) whose
rows are the list service's own for the view, its route `GET /<module>/list/export` (`{Module}.list`) and the web
list's Export button. The columns are declared on the server once, in the `columns` slot: by default the label column
and the created date; a generator writes the columns the list shows, each with its header (a key of the module's web
strings) and its cell (a related record's label, a status's name, an enum's words; never a JSON column, P125). The
export still downloads at once; running it in the background (P95) is owed. `generator_contract` **4**.

**Catching up.** A module made before a contract lacks the skeleton pieces that contract brought. Both scaffolders take
`--catch-up` for a module that exists: they add only the missing pieces (here the `{Module}Csv`, its route and the
web list's Export) and touch nothing else, naming any piece whose place they cannot find. A generator runs it for every
module that exists before it fills the slots.

### The phone's record page and actions (amended 2026-11-21, kit 1.48.0)

The phone skeleton writes the record page (`screens/{Module}DetailPage.vue`: slots `imports`, `setup`, `header`,
`facts`) and `module.ts` gains an `actions` slot (P129). `generator_contract` **5**; `--catch-up` adds both to a phone
module made before.

### The phone's tabs and lines (amended 2026-11-21, kit 1.49.0)

The phone's record page gains `tabs` and `lines` slots, its form a `lines` slot, and `module.ts` a `tab-on` slot
(P130). `generator_contract` **6**; `--catch-up` adds them to a phone module made before.

### Media columns and unique across columns (amended 2026-11-21, kit 1.50.0)

- **Media columns (P131):** a `type: media` column fills the existing slots (the migration, the model's constants, the
  rules, the web and phone fields); what it uses is the platform's (`HasMediaColumns`, the web's `MediaValue`, the phone's
  `MediaField` and `MediaView`, the sync push's `attach`), so `generator_contract` is **7**: a starter before it has
  none of them.
- **A record is still named by a typed column**, never by its P115 number: a record made on a phone has no number until
  it syncs, and with no server never (owner, 2026-11-21: an expense's description, a payment's reference).
- **Unique across columns:** `unique: [["item_id", "price_list_id", "order_type"]]` gives a unique index (with
  `organization_id`) and the platform's `UniqueTogether` rule on each column of the set (an edit that changes one of
  them is checked too, with the record's own values for the rest). A single column keeps `unique: true`.

