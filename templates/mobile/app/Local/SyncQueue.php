<?php

namespace App\Local;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * P102 sync mode, the phone's half. The interface runs a sync (it has the person's sign-in): it asks this queue for the
 * changes to send (outbox), sends them to the API's POST /sync/push, hands the answers back (results), then pulls the
 * API's GET /sync/changes and hands those over (changes) until there are no more. Everything that decides what happens
 * to a record is here, so it is the same on every phone and tested in PHP.
 */
class SyncQueue
{
    public const BATCH = 200;

    /** A change made here, to be sent. Its key is its ULID: the server applies a key once (sync_keys). */
    public function add(string $module, string $op, string $recordId, ?array $payload, ?int $version): string
    {
        $ulid = strtolower((string) Str::ulid());
        DB::table('sync_queue')->insert([
            'ulid' => $ulid, 'module' => $module, 'op' => $op, 'record_id' => $recordId,
            'payload' => $payload === null ? null : json_encode($payload), 'version' => $version, 'key' => $ulid,
            'status' => 'waiting', 'created_at' => now(),
        ]);

        return $ulid;
    }

    /** The next changes to send, oldest first; a record with a change in conflict or refused waits until the person decides. */
    public function outbox(int $limit = self::BATCH): array
    {
        $held = DB::table('sync_queue')->whereIn('status', ['conflict', 'refused'])->get(['module', 'record_id'])
            ->map(fn ($r) => $r->module.'|'.$r->record_id)->flip();

        return DB::table('sync_queue')->where('status', 'waiting')->orderBy('ulid')->get()
            ->reject(fn ($q) => isset($held[$q->module.'|'.$q->record_id]))
            ->take($limit)
            ->map(fn ($q) => ['key' => $q->key, 'module' => $q->module, 'op' => $q->op, 'id' => $q->record_id, 'record' => $q->payload ? json_decode($q->payload, true) : null, 'version' => $q->version])
            ->values()->all();
    }

    /**
     * The server's answers: done removes the change and keeps the server's copy (the later changes to that record now
     * build on its new version); conflict keeps the change with the server's copy until the person chooses; refused
     * keeps it with why.
     *
     * @return array{done: int, conflict: int, refused: int}
     */
    public function results(array $results): array
    {
        $count = ['done' => 0, 'conflict' => 0, 'refused' => 0];
        foreach ($results as $result) {
            $item = DB::table('sync_queue')->where('key', $result['key'] ?? '')->first();
            if (! $item) {
                continue;
            }
            $status = $result['status'] ?? 'refused';
            $count[$status] = ($count[$status] ?? 0) + 1;
            Writes::transaction(function () use ($item, $status, $result) {
                if ($status === 'done') {
                    DB::table('sync_queue')->where('ulid', $item->ulid)->delete();
                    $this->tookServerCopy($item->module, $item->record_id, $item->op === 'delete' ? null : ($result['record'] ?? null));

                    return;
                }
                DB::table('sync_queue')->where('ulid', $item->ulid)->update([
                    'status' => $status === 'conflict' ? 'conflict' : 'refused',
                    'server_record' => isset($result['record']) ? json_encode($result['record']) : null,
                    'error' => $status === 'conflict' ? null : (string) ($result['reason'] ?? 'Refused'),
                    'tries' => $item->tries + 1,
                ]);
            });
        }

        return $count;
    }

    /**
     * The server's changes since the cursor. A record with changes of its own still waiting is left as it is (they are
     * sent on top of it, or meet a conflict); everything else takes the server's copy.
     */
    public function changes(array $changes, ?string $cursor): int
    {
        $applied = 0;
        Writes::transaction(function () use ($changes, $cursor, &$applied) {
            foreach ($changes as $c) {
                if ($this->pending($c['module'], (string) $c['id'])) {
                    continue;
                }
                $this->tookServerCopy($c['module'], (string) $c['id'], ($c['op'] ?? 'upsert') === 'delete' ? null : ($c['record'] ?? null), true);
                $applied++;
            }
            DB::table('sync_state')->updateOrInsert(['module' => '*'], ['cursor' => $cursor, 'last_synced_at' => now()]);
        });

        return $applied;
    }

    /**
     * Keep mine: send it again on the server's new version. It is a new change for the server, so it gets a new key (the
     * old key's answer, the conflict, is what the server remembers for it).
     */
    public function keepMine(string $ulid): void
    {
        $item = $this->item($ulid, 'conflict');
        $server = json_decode((string) $item->server_record, true) ?: [];
        DB::table('sync_queue')->where('ulid', $ulid)->update(['status' => 'waiting', 'version' => $server['version'] ?? $item->version, 'server_record' => null, 'key' => $this->newKey()]);
    }

    /** Use theirs: the server's copy replaces mine; my changes to that record are dropped. */
    public function useTheirs(string $ulid): void
    {
        $item = $this->item($ulid, 'conflict');
        Writes::transaction(function () use ($item) {
            DB::table('sync_queue')->where('module', $item->module)->where('record_id', $item->record_id)->delete();
            $this->tookServerCopy($item->module, $item->record_id, json_decode((string) $item->server_record, true), true);
        });
    }

    /** Send again (a refused change): with a new key, so the server looks at it again instead of repeating its answer. */
    public function retry(string $ulid): void
    {
        $this->item($ulid, 'refused');
        DB::table('sync_queue')->where('ulid', $ulid)->update(['status' => 'waiting', 'error' => null, 'key' => $this->newKey()]);
    }

    private function newKey(): string
    {
        return strtolower((string) Str::ulid());
    }

    /** Throw it away: the change is dropped, and the record goes back to the server's copy (or away, if the server never had it). */
    public function discard(string $ulid): void
    {
        $item = $this->item($ulid);
        Writes::transaction(function () use ($item) {
            DB::table('sync_queue')->where('ulid', $item->ulid)->delete();
            if ($this->pending($item->module, $item->record_id)) {
                return;
            }
            $row = DB::table('local_records')->where('module', $item->module)->where('id', $item->record_id)->first();
            if ($row && $row->synced === null) {
                DB::table('local_records')->where('module', $item->module)->where('id', $item->record_id)->delete();
            } elseif ($row) {
                DB::table('local_records')->where('module', $item->module)->where('id', $item->record_id)->update(['data' => $row->synced, 'deleted_at' => null]);
            }
        });
    }

    /** What the Sync page and Home's line show. */
    public function state(): array
    {
        $state = DB::table('sync_state')->where('module', '*')->first();
        $items = DB::table('sync_queue')->orderBy('ulid')->get()->map(fn ($q) => [
            'ulid' => $q->ulid, 'module' => $q->module, 'op' => $q->op, 'id' => $q->record_id, 'status' => $q->status,
            'title' => $this->title($q), 'reason' => $q->error, 'created_at' => $q->created_at,
            'mine' => $q->payload ? json_decode($q->payload, true) : null,
            'theirs' => $q->server_record ? json_decode($q->server_record, true) : null,
        ]);

        return [
            'last_synced_at' => $state?->last_synced_at,
            'first_sync_done' => $state !== null,
            'waiting' => $items->where('status', 'waiting')->values()->all(),
            'conflicts' => $items->where('status', 'conflict')->values()->all(),
            'refused' => $items->where('status', 'refused')->values()->all(),
            'kept' => app(LocalStore::class)->counts(),
        ];
    }

    public function cursor(): ?string
    {
        return DB::table('sync_state')->where('module', '*')->value('cursor');
    }

    /** Signing out: the phone's copy, queue and cursor go (the next person syncs their own). */
    public function forget(): void
    {
        foreach (['sync_queue', 'sync_state', 'local_records'] as $table) {
            DB::table($table)->delete();
        }
    }

    private function tookServerCopy(string $module, string $id, ?array $record, bool $replaceData = false): void
    {
        if ($record === null) {
            if (! $this->pending($module, $id)) {
                DB::table('local_records')->where('module', $module)->where('id', $id)->delete();
            }

            return;
        }
        $json = json_encode($record);
        $version = isset($record['version']) ? (int) $record['version'] : null;
        $values = ['synced' => $json, 'version' => $version, 'updated_at' => now(), 'deleted_at' => null];
        if ($replaceData || ! $this->pending($module, $id)) {
            $values['data'] = $json;
        }
        $exists = DB::table('local_records')->where('module', $module)->where('id', $id)->exists();
        $exists
            ? DB::table('local_records')->where('module', $module)->where('id', $id)->update($values)
            : DB::table('local_records')->insert(['module' => $module, 'id' => $id, 'data' => $json] + $values);
        // my later changes to this record now build on the server's new version
        DB::table('sync_queue')->where('module', $module)->where('record_id', $id)->where('status', 'waiting')->update(['version' => $version]);
    }

    private function pending(string $module, string $id): bool
    {
        return DB::table('sync_queue')->where('module', $module)->where('record_id', $id)->exists();
    }

    private function item(string $ulid, ?string $status = null): object
    {
        $item = DB::table('sync_queue')->where('ulid', $ulid)->when($status, fn ($q) => $q->where('status', $status))->first();
        abort_if(! $item, 404, 'That change is no longer waiting.');

        return $item;
    }

    private function title(object $q): string
    {
        $data = $q->payload ? json_decode($q->payload, true) : null;
        $data ??= json_decode((string) DB::table('local_records')->where('module', $q->module)->where('id', $q->record_id)->value('data'), true);

        return (string) ($data['name'] ?? $data['title'] ?? $data['number'] ?? $q->record_id);
    }
}
