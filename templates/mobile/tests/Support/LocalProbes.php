<?php

// Two modules that use the phone's way out (P104), for LocalStoreTest: one with rules, one with its own store.

namespace App\Local\Modules;

use App\Local\LocalModule;
use App\Local\LocalModuleStore;

class Probes implements LocalModule
{
    public function rules(string $op): array
    {
        return ['name' => ['required', 'string', 'max:20']];
    }

    public function saving(array $record, string $op): array
    {
        return $record + ['shout' => strtoupper($record['name'])];
    }
}

class OwnProbes implements LocalModuleStore
{
    /** @var array<string, array> */
    public static array $rows = [];

    public function list(array $filters, array $params): array
    {
        return ['data' => array_values(self::$rows), 'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 20, 'total' => count(self::$rows)]];
    }

    public function view(string $id): ?array
    {
        return self::$rows[$id] ?? null;
    }

    public function save(array $record, ?string $id): array
    {
        $id ??= 'own-'.(count(self::$rows) + 1);

        return self::$rows[$id] = $record + ['uuid' => $id, 'where' => 'own table'];
    }

    public function delete(string $id): void
    {
        unset(self::$rows[$id]);
    }
}
