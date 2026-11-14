<?php

use App\Http\Controllers\Native\UpdateController;
use App\Local\Http\DraftsController;
use App\Local\Http\LocalController;
use App\Local\Http\LockController;
use Illuminate\Support\Facades\Route;

/*
 * P93: the phone's own work, served by the app's own Laravel and reachable only from inside the app. Controllers live in
 * app/Http/Controllers/Native/ (the phone's own features) and app/Local/Http/ (the phone's data).
 *
 *   /api/native/update/check|download|cancel|install    the update feed, read on this server, never from the page (P79; below)
 *   /api/local/lock/*                                   the PIN lock (P65), in every data mode
 *   /api/local/drafts/{key}                             unsent work, kept as it is typed, survives Android closing the app (P58)
 *
 * P102, P104, by APP_DATA_MODE (.env; connected mode keeps nothing here, so these answer 404):
 *   phone       /api/local/{Module}/list|view|save|delete: the generic store (local_records), or the module's own store
 *               (app/Local/Modules/{Module}.php, P104); /api/local/backup and /restore, to a file.
 *   sync        the same on the working copy, plus /api/local/sync/*: a queue (sync_queue) sent in order with keys, and the
 *               server's changes brought back.
 *
 * Every write that opens a transaction goes through App\Local\Writes (P78).
 */
Route::prefix('local')->group(function () {
    Route::get('/lock', [LockController::class, 'status']);
    Route::post('/lock/pin', [LockController::class, 'set']);
    Route::post('/lock/verify', [LockController::class, 'verify']);
    Route::post('/lock/clear', [LockController::class, 'clear']);

    Route::get('/drafts/{key}', [DraftsController::class, 'show']);
    Route::put('/drafts/{key}', [DraftsController::class, 'save']);
    Route::delete('/drafts/{key}', [DraftsController::class, 'forget']);
    Route::delete('/drafts', [DraftsController::class, 'forgetAll']);

    Route::get('/sync/state', [LocalController::class, 'syncState']);
    Route::get('/sync/outbox', [LocalController::class, 'outbox']);
    Route::post('/sync/results', [LocalController::class, 'results']);
    Route::post('/sync/changes', [LocalController::class, 'changes']);
    Route::post('/sync/forget', [LocalController::class, 'forget']);
    Route::post('/sync/queue/{ulid}/{choice}', [LocalController::class, 'decide'])->whereIn('choice', ['keep-mine', 'use-theirs', 'retry', 'discard']);
    Route::post('/backup', [LocalController::class, 'backup']);
    Route::get('/backup/{name}', [LocalController::class, 'download']);
    Route::post('/restore', [LocalController::class, 'restore']);

    Route::get('/{module}/list', [LocalController::class, 'list']);
    Route::get('/{module}/{id}/view', [LocalController::class, 'view']);
    Route::post('/{module}/save', [LocalController::class, 'save']);
    Route::delete('/{module}/{id}/delete', [LocalController::class, 'delete']);
});

// P79: updates from the public download page (APP_UPDATE_FEED). The interface asks and shows; the APK's address and SHA-256
// never leave this server, and a download always uses the feed read here at that moment.
Route::prefix('native/update')->controller(UpdateController::class)->group(function () {
    Route::get('check', 'check');
    Route::post('download', 'download');
    Route::post('cancel', 'cancel');
    Route::post('install', 'install');
});
