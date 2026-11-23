# P134 — Reverse actions: undo everything an action did

Status: decided 2026-11-23 (the owner). Amends P84 (declared actions), P47 (workflow statuses), P133 (locked statuses).

## Why

A record in a terminal or locked status (Approved, Paid, Done) needs a way back that is deliberate, named and complete.
The owner: "the reverse action [must] reverse everything a particular state has received. Example approving a leave
also creates some other records in other modules for delegations etc. So reversing that means those records need to be
removed."

## Decision

1. **A journal of every action run.** While a declared action runs (on the record, in bulk, or after an approval), the
   platform records every record it creates, changes or deletes, in any module, with the changed values from before,
   in the same transaction as the action. A failed action leaves no journal.
2. **A reverse is a declared action**: `"withdraw": { "label": "Withdraw approval", "reverses": "approve" }`. It applies
   from the status the forward action leads to, needs its own permission, may need approval, and shows like any action
   (button, confirm with its effect, a toast that says what happened).
3. **It replays the journal backwards**: what was created is removed (soft-deleted), what was changed gets its old
   values, what was deleted is restored; then the record's status goes back to what it was; History shows both runs.
4. **Changed since? Refused, naming what changed** ("The approval delegation to Juma was changed on 25 Nov: undo that
   first"). Each journaled record's version is checked, as the phone's sync does; nothing is overwritten blindly.
5. **What a journal cannot see, the module undoes itself**: a forward action's service may have `reverse()` (notify the
   person whose delegation ended, void a number). Writes that bypass the models (mass updates, `DB::table`, pivot syncs)
   fail an action that a reverse action undoes, so nothing escapes the journal silently; an action nothing reverses may
   still write them (amended 2026-11-23: a product's own action wrote with `DB::table`, and nothing replays its runs).
6. **What cannot be taken back stays**: a sent notification, a used document number (voided, never reused), a file
   uploaded (detached, not deleted).
7. **Not on the phone offline**: a reverse needs the server, like an approval-gated action.

## Not decided here

A short "Undo" in an action's toast (a misclick within seconds) is a separate feature; it could reuse the journal.
