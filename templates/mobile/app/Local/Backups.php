<?php

namespace App\Local;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * P102 on-the-phone mode: this phone is the only copy, so it backs up to a file the person keeps somewhere safe, and
 * restores from one. A backup is JSON: a header (format, app, when) and every record of the store.
 */
class Backups
{
    public const FORMAT = 1;

    /** @return array{name: string, path: string, made_at: string, records: int} */
    public function make(): array
    {
        $records = DB::table('local_records')->whereNull('deleted_at')->orderBy('module')->orderBy('id')->get(['module', 'id', 'data', 'version'])
            ->map(fn ($r) => ['module' => $r->module, 'id' => $r->id, 'version' => $r->version, 'data' => json_decode($r->data, true)])->all();
        $made = now();
        $dir = storage_path('app/backups');
        if (! is_dir($dir)) {
            mkdir($dir, 0700, true);
        }
        $name = Str::slug((string) config('app.name')).'-backup-'.$made->format('Ymd-His').'.json';
        $path = $dir.'/'.$name;
        file_put_contents($path, json_encode(['format' => self::FORMAT, 'app' => config('app.name'), 'made_at' => $made->toIso8601ZuluString(), 'records' => $records], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        // only the latest few stay on the phone; the person keeps the shared copy
        foreach (array_slice(array_reverse(glob($dir.'/*.json') ?: []), 5) as $old) {
            @unlink($old);
        }
        DB::table('local_meta')->updateOrInsert(['key' => 'last_backup_at'], ['value' => $made->toIso8601ZuluString()]);

        return ['name' => $name, 'path' => $path, 'made_at' => $made->toIso8601ZuluString(), 'records' => count($records)];
    }

    /** Replaces everything on the phone with the backup's records. */
    public function restore(string $json): int
    {
        $backup = json_decode($json, true);
        if (! is_array($backup) || ($backup['format'] ?? null) !== self::FORMAT || ! is_array($backup['records'] ?? null)) {
            throw ValidationException::withMessages(['file' => ['This is not a backup this app made.']]);
        }
        foreach ($backup['records'] as $r) {
            if (! is_array($r) || ! is_string($r['module'] ?? null) || ! is_string($r['id'] ?? null) || ! is_array($r['data'] ?? null)) {
                throw ValidationException::withMessages(['file' => ['The backup is damaged: a record is missing its module, id or data.']]);
            }
        }
        Writes::transaction(function () use ($backup) {
            DB::table('local_records')->delete();
            foreach (array_chunk($backup['records'], 200) as $chunk) {
                DB::table('local_records')->insert(array_map(fn ($r) => ['module' => $r['module'], 'id' => $r['id'], 'data' => json_encode($r['data']), 'version' => $r['version'] ?? null, 'updated_at' => now()], $chunk));
            }
        });

        return count($backup['records']);
    }

    public function lastBackupAt(): ?string
    {
        return DB::table('local_meta')->where('key', 'last_backup_at')->value('value');
    }
}
