# P64 · Phone actions

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: four phone apps compared (none has call, share, WhatsApp).

## Decision

The things a phone does that a desktop does not. Call, SMS and WhatsApp open the system apps from an Action sheet on any phone number; Share and Copy on documents. Scan reads barcodes with the camera and always offers typing the code. Printing is over Bluetooth to a printer the person chose once and the app remembers. Each has its failure said in words.

## Rules

- Phone numbers open the Action sheet: Call (tel:), WhatsApp (wa.me), Send SMS (sms:), Copy number.
- Share and Copy on receipts and documents; a PDF opens in a viewer and shares through the Android share sheet.
- Scan: camera, ML Kit reader, torch, single or several, Type the code instead; photos are downscaled to 1280px before they cross the bridge.
- Printer: only bonded devices, a radio choice, Remember, Test print, retry once on a failed print.

## Why

None of the three apps has call, SMS, WhatsApp or share; one app's printer took the first bonded device with no choice.

## Where

Prototype: app--call-sheet, app--scan, app--scan-several, app--printer*. Product (P93): `mobile/resources/spa/src/app/` → actions.
