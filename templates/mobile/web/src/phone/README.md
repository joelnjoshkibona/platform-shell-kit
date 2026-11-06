# src/phone

The web side of the phone app (P56–P75). See ../../README.md. Built first in the product, then lifted into this template.

Two modules to lift from `blutrixx/nativephp-device-utils` (they are in its `resources/js/`): `keyboard` (`useKeyboard.ts`, P71: the height of the keyboard as `--kb` and `--kb-vh`, a callback, scroll the focused field into view) and `log` (`useAppLog.ts`, P72: `info`/`warn`/`error`, captures JavaScript errors and rejections, `read`, `export`, `crash`). A sheet uses `bottom: var(--kb, 0px)`; the page behind uses `padding-bottom: var(--kb, 0px)`. Hodie's `src/parts/20_chrome.js` (`KB`, `Sheet`) and `10a_log.js` are working examples.
