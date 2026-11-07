# src/app

Everything in the phone app that is not a module, as files (no sub-folders by job). Written in the first product's phone app, then
lifted here. Hodie (`NATIVE-PHP/hodie/resources/spa/src/parts`) is the working example of each piece.

| File | What | P |
| --- | --- | --- |
| `boot.ts`, `App.vue`, `modules.ts` | start-up; `defineModule` and the glob loader over `../modules/*/module.ts` | P81, P82 |
| `i18n.ts`, `session.ts`, `api.ts` | languages; the stored session; the API client from `packages/shared` with the token from secure storage | P57 |
| `bridge.ts` | native calls: the listener registered before the call, a timeout, never throws | |
| `network.ts`, `lifecycle.ts` | the phone's network state plus failed calls; pause, resume, kill | P58, P59 |
| `backstack.ts` | Back closes the top layer, then goes back, then asks twice | P61 |
| `secureStore.ts`, `lock.ts`, `permissions.ts` | the token; the device lock; asking at the moment of need | P57, P63, P65 |
| `writes.ts`, `links.ts`, `updates.ts` | idempotency keys; notification taps open the record; the update flow | P60, P66, P67, P79 |
| `keyboard.ts`, `log.ts` | the keyboard height as `--kb` (lifted from `blutrixx/nativephp-device-utils`); the app log | P71, P72 |
| `drafts.ts`, `media.ts` | drafts written as typed and resumed after a kill; photos, files and voice notes kept until the server has them | P58, P75 |
| `Shell*.vue`, `Sheet.vue`, `Dialog.vue`, `Toast.vue`, `DatePicker.vue`, `Search.vue`, `PhoneStates.vue` | the frame: header, bottom bar, drawer, sheets lifted by the keyboard, dialogs, the no-signal, update and lock states | P56, P62 |

Each `.ts` file is plain TypeScript with unit tests.
