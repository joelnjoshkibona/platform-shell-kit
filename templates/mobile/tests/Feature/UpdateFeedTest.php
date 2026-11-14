<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** P79: the update feed is read here, checked for shape and app, compared by version code, and never hands out the APK address. */
class UpdateFeedTest extends TestCase
{
    private const FEED = 'https://example.github.io/app-download/latest.json';

    protected function setUp(): void
    {
        parent::setUp();
        config(['app-update.feed' => self::FEED, 'app-update.page' => '', 'nativephp.version' => '1.2.0', 'nativephp.version_code' => 12, 'nativephp.app_id' => 'com.example.app']);
    }

    private function feed(array $over = []): array
    {
        return array_merge(['app' => 'com.example.app', 'versionCode' => 13, 'versionName' => '1.3.0', 'minimumCode' => 1,
            'apk' => 'https://github.com/example/app-download/releases/download/v1.3.0/app-1.3.0.apk',
            'sha256' => str_repeat('AB', 32), 'size' => 41_000_000, 'date' => '2026-11-14', 'notes' => 'Faster start.',
            'changes' => [['type' => 'NEW', 'text' => 'Threads'], ['type' => 'WRONG', 'text' => 'dropped'], ['type' => 'FIXED', 'text' => 'Reboot']]], $over);
    }

    /** What the fake download page serves now; one fake for the whole test, so a test can change the feed between checks. */
    private ?array $served = null;

    private function serve(array $feed): void
    {
        if ($this->served === null) {
            Http::fake([self::FEED.'*' => fn () => Http::response($this->served)]);
        }
        $this->served = $feed;
    }

    public function test_a_newer_version_code_is_available_and_the_apk_address_and_hash_stay_on_the_server(): void
    {
        $this->serve($this->feed());

        $r = $this->getJson('/api/native/update/check')->assertOk()
            ->assertJsonPath('state', 'available')
            ->assertJsonPath('installed.code', 12)
            ->assertJsonPath('latest.versionCode', 13)
            ->assertJsonPath('latest.versionName', '1.3.0')
            ->assertJsonPath('latest.changes', [['type' => 'NEW', 'text' => 'Threads'], ['type' => 'FIXED', 'text' => 'Reboot']])
            ->assertJsonPath('page', 'https://example.github.io/app-download/');

        $this->assertStringNotContainsString('releases/download', $r->getContent());
        $this->assertStringNotContainsStringIgnoringCase(str_repeat('ab', 32), $r->getContent());
        Http::assertSent(fn ($req) => str_starts_with($req->url(), self::FEED.'?t=') && $req->hasHeader('Cache-Control', 'no-cache, no-store'));
    }

    public function test_the_same_code_is_current_and_a_code_below_minimum_is_required(): void
    {
        $this->serve($this->feed(['versionCode' => 12]));
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'current');

        $this->serve($this->feed(['versionCode' => 14, 'minimumCode' => 13]));
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'required');
    }

    public function test_names_do_not_decide_only_codes_do(): void
    {
        // a lower name with a higher code is still newer (P67)
        $this->serve($this->feed(['versionName' => '1.0.9', 'versionCode' => 13]));
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'available');
    }

    public function test_a_feed_for_another_app_or_with_a_bad_field_is_an_error(): void
    {
        foreach ([['app' => 'com.other.app'], ['apk' => 'ftp://plain.example/app.apk'], ['sha256' => 'short'], ['versionCode' => '13'], ['size' => 0]] as $bad) {
            $this->serve($this->feed($bad));
            $this->getJson('/api/native/update/check')->assertOk()->assertJsonPath('state', 'error')->assertJsonPath('latest', null);
        }
    }

    public function test_a_release_build_refuses_a_plain_http_feed_or_apk(): void
    {
        $this->serve($this->feed(['apk' => 'http://plain.example/app.apk']));
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'available'); // testing: allowed, as on a local build

        $this->app['env'] = 'production';
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'error');
        config(['app-update.feed' => 'http://example.test/latest.json']);
        $this->getJson('/api/native/update/check')->assertJsonPath('state', 'off');
    }

    public function test_no_connection_is_offline(): void
    {
        Http::fake(fn () => throw new ConnectionException('down'));
        $this->getJson('/api/native/update/check')->assertOk()->assertJsonPath('state', 'offline')->assertJsonPath('offer', false);
    }

    public function test_without_a_feed_the_check_says_off(): void
    {
        config(['app-update.feed' => '']);
        Http::fake();
        $this->getJson('/api/native/update/check')->assertOk()->assertJsonPath('state', 'off');
        Http::assertNothingSent();
    }

    public function test_off_the_phone_the_offer_follows_the_setting_and_the_download_needs_the_phone(): void
    {
        $this->serve($this->feed());
        $this->getJson('/api/native/update/check')->assertJsonPath('offer', false);
        config(['app-update.offer_off_phone' => true]);
        $this->getJson('/api/native/update/check')->assertJsonPath('offer', true);

        $this->postJson('/api/native/update/download')->assertStatus(409)->assertJsonPath('error', 'phone');
        $this->postJson('/api/native/update/install')->assertStatus(409);
        $this->postJson('/api/native/update/cancel')->assertOk();
    }
}
