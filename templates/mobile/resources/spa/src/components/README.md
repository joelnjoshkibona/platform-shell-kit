# src/components

The phone kit's own pieces, drawn in the product's phone prototype (`docs/design/prototype-phone/`): rows, the round tick, pills,
segmented tabs, chips, empty and loading states, the rich text editor (Tiptap, with the fix for Gboard), and so on.
Never imported from `web/`: the phone app shares only `packages/shared` (P93).

**Here** (P120, lifted from a product's phone app): `SwipeRow.vue` (one action per side, the same action in the long-press
menu), `FirstRun.vue` (one step at a time), `MessageBubble.vue` and `Composer.vue` (a conversation; the counter is
`../app/textParts.ts`). Their words come from `phone.firstRun.*` and `phone.messages.*`, and Undo from `phone.common.undo`
(`src/app/locales/{en,sw}/phone-messages.json`).

**Here** (P121): `PassphraseFields.vue` (a new passphrase twice, a warning when short), `RecoveryKey.vue` (shown once),
`ChoiceSheet.vue` (a question with one tick box) and `MessageDetails.vue` (a message's times). Their words are
`phone.space.*` (`phone-space.json`), `phone.messages.details.*` and `phone.common.cancel`; the space's locks are
`../app/hiddenSpace.ts`.
