<?php

namespace App\Local\Http;

use App\Http\Controllers\Controller;
use App\Local\Backups;
use App\Local\LocalStore;
use App\Local\SyncQueue;
use App\Local\Writes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Native\Mobile\Facades\Share;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * /api/local/* (P102): the interface's data layer in on-the-phone and sync modes. Reachable only from inside the app (P93).
 * Answers are shaped like the API's ({ status, code, message, data }), so the screens read them the same way.
 */
class LocalController extends Controller
{
    public function __construct(private LocalStore $store, private SyncQueue $queue) {}

    public function list(Request $request, string $module): JsonResponse
    {
        return $this->ok($this->store->list($this->module($module), (array) $request->query('filters', []), (array) $request->query('params', [])));
    }

    public function view(string $module, string $id): JsonResponse
    {
        $record = $this->store->view($this->module($module), $id);
        abort_if($record === null, 404, 'Not found on this phone.');

        return $this->ok($record);
    }

    public function save(Request $request, string $module): JsonResponse
    {
        $module = $this->module($module);
        $id = $request->input('id');
        $sync = $this->syncing();
        $saved = Writes::transaction(function () use ($request, $module, $id, $sync) {
            $saved = $this->store->save($module, (array) $request->input('record', []), $id ? (string) $id : null, ! $sync);
            if ($sync) {
                $this->queue->add($module, $saved['op'], $saved['record']['uuid'], $saved['record'], $saved['version']);
            }

            return $saved;
        });

        return $this->ok($saved['record'], $saved['op'] === 'create' ? 201 : 200);
    }

    public function delete(string $module, string $id): JsonResponse
    {
        $module = $this->module($module);
        Writes::transaction(function () use ($module, $id) {
            $version = $this->store->delete($module, $id);
            if ($this->syncing()) {
                $this->queue->add($module, 'delete', $id, null, $version);
            }
        });

        return $this->ok(null);
    }

    public function syncState(Backups $backups): JsonResponse
    {
        return $this->ok(['mode' => config('local.mode'), 'last_backup_at' => $backups->lastBackupAt()] + $this->queue->state());
    }

    public function outbox(): JsonResponse
    {
        return $this->ok(['changes' => $this->queue->outbox(), 'cursor' => $this->queue->cursor()]);
    }

    public function results(Request $request): JsonResponse
    {
        $request->validate(['results' => ['present', 'array']]);

        return $this->ok($this->queue->results($request->input('results')));
    }

    public function changes(Request $request): JsonResponse
    {
        $request->validate(['changes' => ['present', 'array'], 'cursor' => ['nullable', 'string']]);

        return $this->ok(['applied' => $this->queue->changes($request->input('changes'), $request->input('cursor'))]);
    }

    public function decide(string $ulid, string $choice): JsonResponse
    {
        match ($choice) {
            'keep-mine' => $this->queue->keepMine($ulid),
            'use-theirs' => $this->queue->useTheirs($ulid),
            'retry' => $this->queue->retry($ulid),
            'discard' => $this->queue->discard($ulid),
        };

        return $this->ok($this->queue->state());
    }

    public function forget(): JsonResponse
    {
        $this->queue->forget();

        return $this->ok(null);
    }

    public function backup(Request $request, Backups $backups): JsonResponse
    {
        abort_unless(config('local.mode') === 'phone', 404);
        $made = $backups->make();
        if ($request->boolean('share')) {
            Share::file($made['name'], $made['name'], $made['path']); // in the app: Android's share list (save to Files, Drive, WhatsApp…)
        }

        return $this->ok(['name' => $made['name'], 'made_at' => $made['made_at'], 'records' => $made['records'], 'url' => '/api/local/backup/'.$made['name']]);
    }

    public function download(string $name): BinaryFileResponse
    {
        abort_unless(config('local.mode') === 'phone' && preg_match('/^[a-z0-9-]+-backup-\d{8}-\d{6}\.json$/', $name), 404);
        $path = storage_path('app/backups/'.$name);
        abort_unless(is_file($path), 404);

        return response()->download($path, $name, ['Content-Type' => 'application/json']);
    }

    public function restore(Request $request, Backups $backups): JsonResponse
    {
        abort_unless(config('local.mode') === 'phone', 404);
        $request->validate(['file' => ['required', 'file', 'max:51200']]);

        return $this->ok(['records' => $backups->restore((string) file_get_contents($request->file('file')->getPathname()))]);
    }

    private function syncing(): bool
    {
        return config('local.mode') === 'sync';
    }

    private function module(string $module): string
    {
        abort_unless(in_array(config('local.mode'), ['phone', 'sync'], true), 404, 'This app keeps no data on the phone (APP_DATA_MODE=connected).');
        abort_unless((bool) preg_match('/^[A-Z][A-Za-z0-9]{0,79}$/', $module), 404);

        return $module;
    }

    private function ok(mixed $data, int $code = 200): JsonResponse
    {
        return response()->json(['status' => true, 'code' => $code, 'message' => 'OK', 'data' => $data], $code);
    }
}
