# P130 · Links, child tabs and lines on the phone

Status: **decided** (kit 1.49.0). Amends P86, P102, P115, P124 and P129. Owner 2026-11-21, finishing the phone plan: a
parent's children and a document's lines on the record page (P129), in every data mode, and links that work for records
made on the phone.

## Decision

### 1. A link to a record made on the phone

A record made on the phone has no server id until it is synced, and in on-the-phone mode it never has one. A link (a
picked record, a child's parent, a line's item) therefore holds the record's **server id when it has one, else its
uuid**; the picker (P124) and the phone's store keep whichever it is.

- **Sync:** the server turns a uuid link into the id before the module's own service sees the change: it finds the
  record by uuid in the module the column points at. The queue keeps order (P102), so a record made offline always
  arrives before what points at it. After the sync the phone takes the server's copy, which carries the id.
- **On the phone (no server):** links stay uuids.

### 2. A parent's child tabs (P86 on the phone)

A child that declares itself a tab on its parent (`tab_on`) is a tab on the parent's record page (P129), after
Details, as on the website. Its phone `module.ts` says so (`tabOn`: the parent, the tab's key, the `via` column, its
words); the record page gathers every module's tabs on it.

- **Connected:** the rows come through the P86 child routes (`/{parent}/{uuid}/{key}/list`).
- **Sync and on the phone:** the phone's own copy, the rows whose `via` is the parent's id or uuid.
- **Add** opens the child's form with the parent set and locked. A row opens the child's own record page.

### 3. A document's lines (P115 on the phone)

- **The record page** shows the lines read-only with the totals (a **Lines** card).
- **The form** edits them as P115 describes for a phone: **Add a line** opens the catalogue of the item module (search,
  then a quantity sheet); a cart bar shows the count and the total and opens the lines in a sheet to change a quantity,
  a price or remove a line. One draft, one save; the lines are editable only while the document's status allows
  (`editable_status`).
- **Sync and on the phone:** the lines live inside the document's copy on the phone. The feed sends a document with its
  lines, each with its item; a change sends them with the document and **without a claimed total**: the server works the
  totals out and its copy wins on the next sync. On the phone (no server) the phone works them out with the same line
  maths.
- **Each line keeps its item** (its id, uuid and name) in the phone's copy, so the record page names it with no signal;
  the server saves only the line's own columns.
- **The items are on the phone:** a sync document's `sync.reference` names its item module with the columns the
  catalogue needs beyond a picker's (`{ "module": "Products", "columns": ["price"] }`), read-only as P126 says.

### 4. Generated modules

The phone skeleton (P123) has a `tab-on` slot in `module.ts` (the record page gathers a parent's tabs from its children's
declarations, so the parent needs no slot of its own), a `lines` slot on the record page, the lines in the form's slots,
and a `saving` slot in the phone store's module (a priced document's totals on the phone). `generator_contract` **6**;
`--catch-up` adds them to a phone module made before.

## Checks

- A child made offline under a parent made offline reaches the server pointing at that parent.
- A parent's tab lists its children in all three modes; Add makes one with the parent locked.
- A document made with lines (online, offline, on the phone) shows them with totals; after a sync the totals are the
  server's.
