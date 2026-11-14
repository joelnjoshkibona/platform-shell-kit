<?php

namespace Tests\Feature\Local;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** P65: a four-digit PIN, hashed on the phone; five wrong in a row sign out. It works in every data mode. */
class AppLockTest extends TestCase
{
    use RefreshDatabase;

    private function verify(string $pin): array
    {
        return $this->postJson('/api/local/lock/verify', ['pin' => $pin])->assertOk()->json('data');
    }

    public function test_a_pin_is_set_hashed_and_checked(): void
    {
        $this->assertSame(['has_pin' => false, 'tries_left' => 5], $this->getJson('/api/local/lock')->assertOk()->json('data'));

        $this->postJson('/api/local/lock/pin', ['pin' => '4821'])->assertOk()->assertJsonPath('data.ok', true);
        $this->assertTrue($this->getJson('/api/local/lock')->json('data.has_pin'));
        $this->assertNotSame('4821', DB::table('local_meta')->where('key', 'lock_pin')->value('value'), 'only a hash is kept');
        $this->assertStringNotContainsString('4821', (string) DB::table('local_meta')->get()->toJson());

        $this->assertSame(['ok' => true, 'tries_left' => 5, 'sign_out' => false], $this->verify('4821'));
    }

    public function test_a_pin_is_exactly_four_digits(): void
    {
        foreach (['123', '12345', 'abcd', '12 4', ''] as $bad) {
            $this->postJson('/api/local/lock/pin', ['pin' => $bad])->assertStatus(422);
        }
        $this->assertFalse($this->getJson('/api/local/lock')->json('data.has_pin'));
    }

    public function test_wrong_pins_count_down_a_right_one_resets_and_the_fifth_wrong_signs_out_and_forgets_the_pin(): void
    {
        $this->postJson('/api/local/lock/pin', ['pin' => '4821'])->assertOk();

        $this->assertSame([false, 4, false], array_values(array_intersect_key($this->verify('0000'), array_flip(['ok', 'tries_left', 'sign_out']))));
        $this->assertSame(3, $this->verify('1111')['tries_left']);
        $this->assertSame(['ok' => true, 'tries_left' => 5, 'sign_out' => false], $this->verify('4821'), 'a right PIN starts the count again');

        foreach ([4, 3, 2, 1] as $left) {
            $this->assertSame($left, $this->verify('9999')['tries_left']);
        }
        $this->assertSame(['ok' => false, 'tries_left' => 0, 'sign_out' => true], $this->verify('9999'));
        $this->assertFalse($this->getJson('/api/local/lock')->json('data.has_pin'), 'the fifth wrong PIN forgets it');
    }

    public function test_changing_the_pin_needs_the_current_one_and_a_wrong_current_counts(): void
    {
        $this->postJson('/api/local/lock/pin', ['pin' => '4821'])->assertOk();

        $refused = $this->postJson('/api/local/lock/pin', ['pin' => '7777', 'current' => '0000'])->assertOk()->json('data');
        $this->assertSame([false, 4], [$refused['ok'], $refused['tries_left']]);
        $this->assertTrue($this->verify('4821')['ok'], 'the PIN did not change');

        $this->postJson('/api/local/lock/pin', ['pin' => '7777', 'current' => '4821'])->assertOk()->assertJsonPath('data.ok', true);
        $this->assertFalse($this->verify('4821')['ok']);
        $this->assertTrue($this->verify('7777')['ok']);
    }

    public function test_signing_out_clears_the_pin_and_it_works_in_every_data_mode(): void
    {
        foreach (['connected', 'phone', 'sync'] as $mode) {
            config(['local.mode' => $mode]);
            $this->postJson('/api/local/lock/pin', ['pin' => '4821'])->assertOk();
            $this->assertTrue($this->verify('4821')['ok'], $mode);
            $this->postJson('/api/local/lock/clear')->assertOk()->assertJsonPath('data.has_pin', false);
        }
        $this->assertSame(['ok' => false, 'tries_left' => 0, 'sign_out' => false], $this->verify('4821'), 'no PIN, nothing to match');
    }
}
