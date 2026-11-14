<?php

namespace App\Local;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * P58: unfinished forms, kept in the phone's own database (local_meta) so a form survives Android killing the app (a
 * phone with little memory does it while a picker or the camera is in front). One draft per form key
 * (`tasks.new`, `comment.POS-12`); a draft is at most 64 KB of JSON, and forgotten when the form is saved, discarded, or
 * the person signs out. Never a place for secrets: it is what the person typed.
 */
class Drafts
{
    public const MAX_BYTES = 65_536;

    private const PREFIX = 'draft:';

    /** @return array{payload: mixed, saved_at: string}|null */
    public function get(string $key): ?array
    {
        $raw = DB::table('local_meta')->where('key', self::PREFIX.$this->check($key))->value('value');
        $row = $raw === null ? null : json_decode($raw, true);

        return is_array($row) && array_key_exists('payload', $row) ? $row : null;
    }

    public function put(string $key, mixed $payload): void
    {
        $value = json_encode(['payload' => $payload, 'saved_at' => now()->toIso8601String()], JSON_UNESCAPED_UNICODE);
        if (strlen($value) > self::MAX_BYTES) {
            throw ValidationException::withMessages(['payload' => ['The draft is too large to keep.']]);
        }
        DB::table('local_meta')->updateOrInsert(['key' => self::PREFIX.$this->check($key)], ['value' => $value]);
    }

    public function forget(string $key): void
    {
        DB::table('local_meta')->where('key', self::PREFIX.$this->check($key))->delete();
    }

    /** Every draft (signing out). */
    public function forgetAll(): void
    {
        DB::table('local_meta')->where('key', 'like', self::PREFIX.'%')->delete();
    }

    private function check(string $key): string
    {
        if (! preg_match('/^[A-Za-z0-9._:-]{1,70}$/', $key)) {
            throw ValidationException::withMessages(['key' => ['A draft key is letters, digits, dots, colons and dashes.']]);
        }

        return $key;
    }
}
