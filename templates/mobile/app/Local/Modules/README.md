# The phone's way out per module (P104)

Every module's records live in the phone's one generic store (`local_records`), so a module needs nothing here to work on
the phone in all three data modes. Add a class here only when a module needs more on the phone:

- `Tasks.php implements App\Local\LocalModule`: rules for a save and a `saving()` hook (for example a default, a total).
- `Tasks.php implements App\Local\LocalModuleStore`: the module keeps its own table, with its migration in
  `database/migrations`; the store hands it list, view, save and delete.

The class is named after the module's key (`module.json` "key"). `npm run make:module` writes a `LocalModule` with the
rules the API's generated services start with.
