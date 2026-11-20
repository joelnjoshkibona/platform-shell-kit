# P125 · A JSON column is stored, shown and never typed into

Status: **decided** (kit 1.43.0). Owner 2026-11-20, for generated modules whose records carry a structure (a module's
spec, a build's results): D14 (kit first) and P123.

## Decision

- A **JSON column** holds a structure the record carries: it is stored as JSON, cast to an array on the model, and
  validated as an array (`nullable|array`, or `required|array`). The API sends it as JSON.
- It is **never a form field**: code writes it (a service, an action, a job) or an editor of its own does. The record's
  form leaves it out, and so does the phone.
- It is **shown read-only** on the record's Overview as a code block (formatted, copyable, collapsed past a few lines),
  and never in the list, the filters or the search.
- A generated module may have JSON columns; the generator writes the migration, cast, rule and Overview block, and a
  sample of `[]` in its tests. The generator contract does not change: no slot is added.

## Why

A product of the kit (the project generator, a reporting module) keeps structured data next to a record. Without a
decision a generator either refuses such a module or writes a text field people would type JSON into.

## Extension point

`type: json` in a generator spec; the website's `code-block` component on the Overview.
