# P137 · Updates before signing in

Status: **decided** 2026-11-26 (the owner: "I do not want us to log in just so that we can update, that is bad UX"), kit
1.61.0. Built first in a product's phone app, then in Bootbox's. Amends P53 and P79 (when the check runs and where the
offer shows) and P48 (what the phone's sign-in screen carries).

## Why

- The check waited 8 seconds after launch so the screens' own reads went first, and the offer (P79) was registered by the
  signed-in shell only. Someone on the sign-in screen saw nothing unless the version was below the minimum, and the update
  page needs a signed-in organisation. An older app could not be updated without signing in first.
- A person stuck at sign-in (a password reset, a lock, a session that ended) is often the one who most needs the update.

## Decision

1. **The sign-in screens check at once**: sign in, the two-step code, forgot password and the session that ended. There
   is nothing else to read before signing in, so the 8-second wait (P79) does not apply there. One check runs at a time; a
   second caller waits for the one under way.
2. **A newer version shows on those screens as a card at the top**, above the brand mark: "<product> X is ready", the
   release's summary, "It is N MB. Your data stays.", and **Update now**, which downloads and opens Android's installer in
   place with the same states as the update page (progress, Install, Allow and Install again, Try again). Later is not
   offered there; a version below the minimum keeps its full screen (P53).
3. **"Check for updates · <version>" sits at the foot of every sign-in screen**: one small line, the link in the accent,
   the installed version beside it. A tap asks the update source now; the line then says Checking…, "You have the latest
   version", "Could not check: no connection", or the download's progress. What it finds shows in the card (2). The form
   stays centred in the space above it; with the card, the page scrolls.
4. **Signing in asks again**, so the shell's offer opens as the organisation does.
5. **The phone's sign-in carries no reassurance line** ("Protected by rate limits and two-step verification"): the foot
   belongs to Check for updates. The web sign-in is unchanged.

## Built

- Bootbox phone app: `modules/auth/components/LoginUpdate.vue` (the card), `CheckUpdatesLink.vue` (the foot),
  `AuthShell.vue` places both; `app/lib/appUpdate.ts` gains `checkAppVersionSoon(maxAge)` (at once unless the last answer is
  younger) and single-flight checks; `useSignIn.finish` asks again. Words in `auth.json` (`login.updates.*`).
- Prototype (phone): the sign-in screens show the foot line, and the update state shows the card.
