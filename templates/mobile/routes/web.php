<?php

use Illuminate\Support\Facades\Route;

/*
 * P93: the phone app's interface is its own Vite project (resources/spa), built into public/spa by scripts/build-web.sh.
 * Every path that is not /api returns its index.html and the interface takes it from there (as Hodie does).
 * The phone's own work (/api/native/*, /api/drafts, /api/cache) is in routes/api.php; the product's data is on the remote API.
 */
Route::get('/{any?}', function () {
    $index = public_path('spa/index.html');
    if (! is_file($index)) {
        return response('The interface is not built: run scripts/build-web.sh.', 503)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    return response(file_get_contents($index))->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache');
})->where('any', '^(?!api/).*$');
