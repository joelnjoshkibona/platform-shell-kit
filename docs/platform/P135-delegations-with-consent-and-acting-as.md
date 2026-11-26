# P135 — Delegations with consent, and acting as

Status: decided 2026-11-23 (the owner), from a product's proposals (`acting-as.md`, `user-flag.md`, kit-proposals).
Amends the approval delegations (D113) and View as.

## Decision

1. **A delegation is asked, not imposed**: requested → accepted | declined; either side may end it; only an accepted
   one counts (legacy "active" counts as accepted). The delegate is told, and the delegator learns the answer.
2. **A delegation may name its source** (a leave): it ends with it, and stops counting the moment its source no longer
   holds (the leave is not approved any more). A module opens one through one hook, which never fails its action; being a
   journaled write (P134), reversing the action that opened it removes it.
3. **Acting as** (off by default; a product turns it on): while an accepted delegation covers all request types, is in
   its dates, its source still holds and it was opened to act, the delegate has the delegator's permissions and
   locations on top of their own.
   - Never passed on: impersonation, delegations, roles and permissions administration, platform-only and Owner rights.
   - It does not chain (the delegator's own covers do not pass).
   - Approvals stay counted once: a step's approver is still decided by the delegation, not by the borrowed permissions.
   - Decided per request, never cached across requests (a delegation starts and ends at midnight, with no event).
4. **Seen everywhere**: a banner above the page ("You are acting as Amina Juma until 5 Dec: you have her permissions as
   well as your own"), the phone's account screen, `acting_as` in the profile, and History rows "update (acting as
   Amina Juma)" with the person recorded, not only in words.
5. **The users list may flag a person** ("On leave until 5 Dec"): a badge beside the role, filled by a product's hook.
