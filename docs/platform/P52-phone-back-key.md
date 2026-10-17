# P52 · The phone's Back key

Status: **decided** (kit 1.7.0). The DevBiz owner chose "press twice to leave".

## Decision

In the phone app, the Android Back key:

1. closes the open layer first: a dialog, a sheet, the menu;
2. otherwise follows Back (P49): the trail, else the record's list;
3. on the first screen (no trail, no list above it) shows "Press back again to leave" for 2 seconds; a second press
   within that time leaves the app.

## Why

The cashier works one-handed on a phone. Android's default (Back leaves at once) closes the app mid-sale; a dialog
every time is one more tap. Two presses is the common Android pattern and stops accidental exits.

Prototype: Screens pill › Phone app › Back on the first screen; in the phone frame, the ‹ key beside the home bar.
