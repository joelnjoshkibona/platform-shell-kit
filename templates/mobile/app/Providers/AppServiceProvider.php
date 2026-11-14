<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        self::ensureStorageFolders();
    }

    /**
     * NativePHP leaves storage/framework/sessions (and the caches) out of the bundle, so a fresh install has no such
     * folders and the first file session or cache write fails with a 500. The app makes them itself, with the folder for
     * backups to a file (P102).
     */
    public static function ensureStorageFolders(): void
    {
        foreach (['framework/sessions', 'framework/cache/data', 'framework/views', 'app/backups', 'logs'] as $dir) {
            $path = storage_path($dir);
            if (! is_dir($path)) {
                @mkdir($path, 0775, true);
            }
        }
    }
}
