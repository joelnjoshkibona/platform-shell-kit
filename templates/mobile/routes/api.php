<?php

use Illuminate\Support\Facades\Route;

/*
 * P93: the phone's own work, served by the app's own Laravel. The product's data is never here: the interface calls the remote API
 * directly with the token from secure storage (P57). Controllers live in app/Http/Controllers/Native/.
 *
 *   /api/native/insets, /keyboard, /back-intercept      safe areas (P62), keyboard height (P71), the Back key (P61)
 *   /api/native/files/*, /photo/*, /voice/*             picking, the camera, voice notes; kept by the plugin until acknowledged (P75)
 *   /api/native/alarms/*                                local reminders (P74)
 *   /api/native/update                                  the update feed, read on this server, never from the page (P79)
 *   /api/drafts/{key}                                   unsent work, written as it is typed, survives Android closing the app (P58, P75)
 *   /api/cache/{key}                                    the last data, for opening without a signal (P57, read-only)
 *   /api/log                                            the app log (P72)
 *
 * Every write that opens a transaction goes through one lock (P78).
 *
 * P102, by APP_DATA_MODE (.env):
 *   connected   the routes above only.
 *   phone       /api/local/{module}/list|view|create|edit|delete|{action}: the modules' own services on the phone's SQLite.
 *   sync        /api/local/* as above, on the working copy, plus /api/sync/push-now and /api/sync/state; a queue (sync_queue)
 *               sends changes in order to the server's POST /sync/push, each with a key; GET /sync/changes?since= brings changes back.
 */
