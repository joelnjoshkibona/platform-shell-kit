<?php

namespace App\Update;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * P79: the update feed, latest.json on the product's public download page, and how the installed app compares with it.
 *
 * The feed is a public file, so the request carries nothing about the person or the phone. Android refuses an APK that is
 * not signed with this app's key and the updater plugin checks the SHA-256, so a wrong feed cannot install a foreign app;
 * the feed is still checked here for shape, and for naming this app.
 *
 *   { "app": "com.example.app", "versionCode": 12, "versionName": "1.2.0", "minimumCode": 1,
 *     "apk": "https://github.com/<owner>/<repo>/releases/download/v1.2.0/<slug>-1.2.0.apk",
 *     "sha256": "<64 hex>", "size": 41546986, "date": "2026-11-14", "notes": "One line.",
 *     "changes": [{ "type": "NEW", "text": "…" }] }
 */
class UpdateFeed
{
    /** The kinds of change a release lists (the same five as server releases, P53). */
    public const TYPES = ['NEW', 'IMPROVED', 'FIXED', 'SECURITY', 'ISSUE'];

    public function url(): string
    {
        return (string) config('app-update.feed');
    }

    public function enabled(): bool
    {
        return $this->secure($this->url());
    }

    /** https, or plain http on a development build (a feed and APK served from the developer's machine); a release needs https. */
    private function secure(string $url): bool
    {
        return str_starts_with($url, 'https://') || (app()->environment(['local', 'testing']) && str_starts_with($url, 'http://'));
    }

    /** The page a person opens in a browser to install by hand: set, or the feed's folder. */
    public function page(): string
    {
        $page = (string) config('app-update.page');

        return $page !== '' ? $page : preg_replace('#/[^/]*$#', '/', $this->url());
    }

    /**
     * The feed, never from a cache (a query parameter and no-store), checked for shape. `$appId` is the installed app's id:
     * a feed for another app is refused.
     *
     * @return array{versionCode:int, versionName:string, minimumCode:int, apk:string, sha256:string, size:int, date:?string, notes:?string, changes:list<array{type:string,text:string}>}
     */
    public function read(?string $appId = null): array
    {
        $r = Http::timeout(8)->withHeaders(['Cache-Control' => 'no-cache, no-store'])->acceptJson()->get($this->url(), ['t' => time()]);
        if (! $r->successful()) {
            throw new RuntimeException('feed answered '.$r->status());
        }
        $j = $r->json();
        if (! is_array($j)) {
            throw new RuntimeException('feed is not JSON');
        }
        $code = $j['versionCode'] ?? null;
        $name = $j['versionName'] ?? null;
        $apk = $j['apk'] ?? null;
        $sha = $j['sha256'] ?? null;
        $size = $j['size'] ?? null;
        if (! is_int($code) || $code < 1 || ! is_string($name) || $name === '' || ! is_string($apk) || ! $this->secure($apk)
            || ! is_string($sha) || ! preg_match('/^[a-f0-9]{64}$/i', $sha) || ! is_int($size) || $size < 1) {
            throw new RuntimeException('feed is missing a field or has a wrong one');
        }
        if ($appId && isset($j['app']) && $j['app'] !== $appId) {
            throw new RuntimeException('feed is for another app');
        }
        $min = isset($j['minimumCode']) && is_int($j['minimumCode']) && $j['minimumCode'] >= 1 ? $j['minimumCode'] : 1;
        $changes = [];
        foreach (is_array($j['changes'] ?? null) ? $j['changes'] : [] as $c) {
            if (is_array($c) && in_array($c['type'] ?? null, self::TYPES, true) && is_string($c['text'] ?? null) && $c['text'] !== '') {
                $changes[] = ['type' => $c['type'], 'text' => mb_substr($c['text'], 0, 300)];
            }
        }

        return [
            'versionCode' => $code, 'versionName' => $name, 'minimumCode' => $min, 'apk' => $apk, 'sha256' => strtolower($sha), 'size' => $size,
            'date' => is_string($j['date'] ?? null) ? $j['date'] : null,
            'notes' => is_string($j['notes'] ?? null) ? mb_substr($j['notes'], 0, 600) : null,
            'changes' => array_slice($changes, 0, 20),
        ];
    }

    /** 'required' below minimumCode (Later cannot put it off), 'available' below versionCode, else 'current'. */
    public function state(array $feed, int $installedCode): string
    {
        if ($installedCode < $feed['minimumCode']) {
            return 'required';
        }

        return $feed['versionCode'] > $installedCode ? 'available' : 'current';
    }
}
