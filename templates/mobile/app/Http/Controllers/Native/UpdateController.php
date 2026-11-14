<?php

namespace App\Http\Controllers\Native;

use App\Update\UpdateFeed;
use Blutrixx\DeviceUtils\Facades\AppLog;
use Blutrixx\MobileUpdater\Facades\MobileUpdater;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Throwable;

/**
 * P79: updates from the download page, under /api/native/update. The interface only asks and shows: the address of the
 * APK and its SHA-256 never leave this server, and a download always uses the feed read here at that moment, so a page
 * cannot point the installer anywhere else. The download, its SHA-256 check and the installer are the mobile-updater
 * plugin's; off the phone (a development server, the tests) the check works and the rest says it needs the phone.
 */
class UpdateController extends Controller
{
    public function __construct(private readonly UpdateFeed $feed) {}

    private function onPhone(): bool
    {
        return function_exists('nativephp_call') && (bool) config('nativephp-internal.running');
    }

    /** The installed version: from the package on the phone, from the config elsewhere. */
    private function installed(): array
    {
        if ($this->onPhone()) {
            $v = MobileUpdater::checkVersion();
            $code = (int) ($v['versionCode'] ?? 0);
            if ($code > 0) {
                return ['name' => (string) ($v['version'] ?? ''), 'code' => $code];
            }
        }

        return ['name' => (string) config('nativephp.version'), 'code' => (int) config('nativephp.version_code')];
    }

    private function offer(): bool
    {
        return $this->onPhone() || (bool) config('app-update.offer_off_phone');
    }

    public function check(): JsonResponse
    {
        $installed = $this->installed();
        $base = ['offer' => false, 'installed' => $installed, 'page' => $this->feed->page(), 'latest' => null, 'download' => ['ready' => false, 'inProgress' => false]];
        if (! $this->feed->enabled()) {
            return response()->json(['state' => 'off'] + $base);
        }
        try {
            $feed = $this->feed->read(config('nativephp.app_id'));
        } catch (Throwable $e) {
            $offline = $e instanceof ConnectionException;
            AppLog::warn('update', $offline ? 'check: no connection' : 'check: '.mb_substr($e->getMessage(), 0, 120));

            return response()->json(['state' => $offline ? 'offline' : 'error'] + $base);
        }
        $state = $this->feed->state($feed, $installed['code']);
        AppLog::info('update', "check: installed {$installed['code']}, latest {$feed['versionCode']}, minimum {$feed['minimumCode']}, {$state}");
        $download = $base['download'];
        if ($state !== 'current' && $this->onPhone()) {
            $s = MobileUpdater::checkDownloadStatus($feed['versionName']);
            $download = ['ready' => (bool) ($s['ready'] ?? false), 'inProgress' => (bool) ($s['inProgress'] ?? false)];
        }

        return response()->json(['state' => $state, 'offer' => $this->offer(), 'installed' => $installed, 'page' => $this->feed->page(), 'download' => $download,
            'latest' => ['versionCode' => $feed['versionCode'], 'versionName' => $feed['versionName'], 'minimumCode' => $feed['minimumCode'],
                'size' => $feed['size'], 'date' => $feed['date'], 'notes' => $feed['notes'], 'changes' => $feed['changes']]]);
    }

    public function download(): JsonResponse
    {
        if (! $this->onPhone()) {
            return response()->json(['ok' => false, 'error' => 'phone'], 409);
        }
        try {
            $feed = $this->feed->read(config('nativephp.app_id'));
        } catch (Throwable $e) {
            return response()->json(['ok' => false, 'error' => 'feed'], 502);
        }
        if ($this->feed->state($feed, $this->installed()['code']) === 'current') {
            return response()->json(['ok' => false, 'error' => 'current'], 409);
        }
        AppLog::info('update', "download started: {$feed['versionName']} (build {$feed['versionCode']}), {$feed['size']} bytes");

        return response()->json(['ok' => true, 'result' => MobileUpdater::download($feed['apk'], $feed['size'], $feed['sha256'], $feed['versionName'])]);
    }

    public function cancel(): JsonResponse
    {
        if ($this->onPhone()) {
            MobileUpdater::cancelDownload();
            AppLog::info('update', 'download cancelled');
        }

        return response()->json(['ok' => true]);
    }

    public function install(): JsonResponse
    {
        if (! $this->onPhone()) {
            return response()->json(['ok' => false, 'error' => 'phone'], 409);
        }
        $r = MobileUpdater::installApk();
        AppLog::info('update', 'installer: '.(! empty($r['permissionRequired']) ? 'install permission needed' : ($r['status'] ?? 'failed')));

        return response()->json(['ok' => true, 'result' => $r]);
    }
}
