<?php

use Illuminate\Support\Facades\Route;

/*
 * (the product's phone app decision): every path returns the {{PRODUCT_NAME}} web build (scripts/build-web.sh puts its index.html in resources/spa and its
 * assets in public/assets, which are served as files); Vue's router takes it from there, as on the website.
 */
Route::get('/{any?}', function () {
    $index = resource_path('spa/index.html');
    if (! is_file($index)) {
        return response('The web build is missing: run scripts/build-web.sh.', 503)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    return response(file_get_contents($index))->header('Content-Type', 'text/html; charset=UTF-8')->header('Cache-Control', 'no-cache');
})->where('any', '.*');
