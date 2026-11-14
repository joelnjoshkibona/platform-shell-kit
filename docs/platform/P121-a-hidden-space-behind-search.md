# P121 · A hidden space behind search; asking with one choice; a message's details

Status: **decided** (kit 1.38.0). Amends P120 (the messaging pieces) and P63 (permissions at the moment of need: the same
rule for a space's setup). Built in a product's phone app (an SMS app's vault: blocked texts, hidden messages, private
conversations), tested on an emulator with the real libsodium, and lifted into `templates/mobile/`.

## Why

- A product may keep things the person wants no one to know are there (an SMS app's blocked and private texts, a
  journal's locked entries). A "Private" menu row, a settings entry or a lock icon tells anyone holding the phone that
  something is kept. Nothing said how to hide the door itself, nor how to lock it again.
- Such a space needs pieces the library did not have: a new passphrase typed twice with its warning, a recovery key shown
  once, a question with one choice ("Block? Also move the existing messages"), and, in a conversation, a message's times.

## Decision

### The space

- **No menu, setting, badge or notification shows it.** It opens only by typing its passphrase (or its recovery key)
  into the product's search. The words that open it never stay in the field or the address.
- **Every search tries its words first, at the same cost** (one key derivation, whether or not a space exists). A wrong
  passphrase and an ordinary search then run the same code and show results the same way: search looks and takes the
  same on a phone with a space and one without.
- **It locks** when the person leaves its pages, when the app goes to the background (which also leaves its pages), and
  after 5 minutes without use (the module's own clock, next to the key). A screen that finds it locked goes back to the
  first screen. `guardHiddenSpace(router, { routes, isOpen, lock, home })` does the first two.
- **Its key is wrapped twice**: under a key derived from the passphrase (Argon2id, cost kept with the space so it can
  change) and under a recovery key of at least 128 random bits, shown once. Either opens it. The open key lives only in
  memory; nothing opened is written to disk.
- **Setup comes at the first action that needs it** (P63's rule): the action opens setup, then runs when setup ends.
  Leaving setup drops the action; nothing waits unprotected. Setup says once what the space is, how it opens, and that
  uninstalling or clearing the app deletes it.
- **A product that keeps such a space turns Android backup off** (`android:allowBackup="false"`, backup and
  device-transfer rules that exclude everything), so the space never leaves the phone by a backup.
- **Undo, except for what cannot be put back**: hiding, restoring and removing a rule take Undo (P120); deleting from the
  space forever and wiping it ask first, saying that even the recovery key cannot bring it back.

### The pieces (COMPONENTS.md › Phone)

| Piece | What | Rule |
| --- | --- | --- |
| `PassphraseFields` | a new passphrase twice; under `weakBelow` (8) "A short passcode can be guessed from a copied phone in hours"; `min` (4) and "the same twice" shown after the first try; emits `submit` and clears | a warning, not a refusal, for a short one |
| `RecoveryKey` | the key in groups that never break across lines, selectable, "This is the only time it is shown", **I wrote it down** | shown once; the screen forgets it on the button |
| `ChoiceSheet` | a sheet: a line of text, one tick box, Cancel and the action; emits `confirm(checked)` | for an action whose choice must be made first (Block: also move the existing messages); a plain question stays `Confirm` |
| `MessageDetails` | tapping a message: when it was written, sent and delivered (or not sent), or when the other phone sent it and when it arrived; the SIM; the SMS parts | a time not recorded says "Not recorded", never a guess |
| `app/hiddenSpace.ts` | `guardHiddenSpace` (the locks above) and `tryOpen(words, unlock)` (search's first step; a failure is an ordinary search) | |

The space's own screen is built from existing pieces: the header with **Locks when you leave** under it, `Seg` tabs
(the product's lists, then **Rules** when it has rules), rows, and a rule form (kind, value, Add) with × on each row.

## Built

- `templates/mobile/resources/spa/src/components/` `PassphraseFields.vue`, `RecoveryKey.vue`, `ChoiceSheet.vue`,
  `MessageDetails.vue`; `src/app/hiddenSpace.ts`; words in `src/app/locales/{en,sw}/phone-space.json` and
  `phone-messages.json` (`messages.details`, `sendAsNew`, `askSim`, `common.cancel`).
- `prototype-phone`: Hidden space (P121) in the picker: setup, search that opens it ("open sesame"), Hidden
  (conversations, rules with Undo), and the Block ChoiceSheet with MessageDetails.
