<?php

namespace App\Local;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * P65: the phone's PIN lock. The PIN is four digits, kept hashed in the app's own database (local_meta, private to the
 * app, never sent anywhere). Five wrong PINs in a row sign the person out and forget the PIN. The fingerprint is the
 * phone's own (the biometric plugin); this PIN is what is always there as the second way in.
 */
class AppLock
{
    public const TRIES = 5;

    public function status(): array
    {
        return ['has_pin' => $this->get('lock_pin') !== null, 'tries_left' => max(0, self::TRIES - $this->tries())];
    }

    /**
     * Sets or changes the PIN. Changing needs the current one, and a wrong current PIN counts like any wrong PIN.
     *
     * @return array{ok: bool, tries_left?: int, sign_out?: bool}
     */
    public function set(string $pin, ?string $current): array
    {
        if (! preg_match('/^\d{4}$/', $pin)) {
            throw ValidationException::withMessages(['pin' => ['The PIN is four digits.']]);
        }
        if ($this->get('lock_pin') !== null) {
            $check = $this->verify((string) $current);
            if (! $check['ok']) {
                return $check;
            }
        }
        $this->put('lock_pin', Hash::make($pin));
        $this->put('lock_tries', '0');

        return ['ok' => true, 'tries_left' => self::TRIES];
    }

    /** @return array{ok: bool, tries_left: int, sign_out: bool} */
    public function verify(string $pin): array
    {
        $hash = $this->get('lock_pin');
        if ($hash === null) {
            return ['ok' => false, 'tries_left' => 0, 'sign_out' => false];
        }
        if (preg_match('/^\d{4}$/', $pin) && Hash::check($pin, $hash)) {
            $this->put('lock_tries', '0');

            return ['ok' => true, 'tries_left' => self::TRIES, 'sign_out' => false];
        }
        $tries = $this->tries() + 1;
        if ($tries >= self::TRIES) {
            $this->clear();

            return ['ok' => false, 'tries_left' => 0, 'sign_out' => true];
        }
        $this->put('lock_tries', (string) $tries);

        return ['ok' => false, 'tries_left' => self::TRIES - $tries, 'sign_out' => false];
    }

    /** Forgets the PIN and the count (signing out, or the fifth wrong PIN). */
    public function clear(): void
    {
        DB::table('local_meta')->whereIn('key', ['lock_pin', 'lock_tries'])->delete();
    }

    private function tries(): int
    {
        return (int) $this->get('lock_tries');
    }

    private function get(string $key): ?string
    {
        return DB::table('local_meta')->where('key', $key)->value('value');
    }

    private function put(string $key, string $value): void
    {
        DB::table('local_meta')->updateOrInsert(['key' => $key], ['value' => $value]);
    }
}
