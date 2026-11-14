<?php

namespace App\Local;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * P102, P104: the phone's one store for every module's records (local_records, the record as JSON), answering the same
 * list contract as the API (P87): filters[field] = {operator, value} with the API's 14 operators, filters[search] over
 * the record's text, params sort / order / page / per_page, and { data, meta }. A module with app/Local/Modules/{Key}.php
 * gets its rules applied (LocalModule) or every call handed to it (LocalModuleStore).
 */
class LocalStore
{
    public const OPERATORS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'begins', 'ends', 'between', 'null', 'not_null'];

    public function list(string $module, array $filters = [], array $params = []): array
    {
        if ($own = $this->ownStore($module)) {
            return $own->list($filters, $params);
        }
        $query = $this->rows($module);
        foreach ($filters as $field => $criteria) {
            if (! is_array($criteria) || ! isset($criteria['operator'])) {
                continue;
            }
            $this->filter($query, (string) $field, (string) $criteria['operator'], $criteria['value'] ?? null);
        }
        $perPage = max(1, min((int) ($params['per_page'] ?? 20), 100));
        $page = max(1, (int) ($params['page'] ?? 1));
        $total = (clone $query)->count();
        $sort = (string) ($params['sort'] ?? 'updated_at');
        $order = strtolower((string) ($params['order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderByRaw('json_extract(data, ?) '.$order, [$this->path($sort)])->orderBy('id', $order);
        $rows = $query->forPage($page, $perPage)->pluck('data')->map(fn ($d) => json_decode($d, true))->all();

        return ['data' => $rows, 'meta' => ['current_page' => $page, 'last_page' => max(1, (int) ceil($total / $perPage)), 'per_page' => $perPage, 'total' => $total]];
    }

    public function view(string $module, string $id): ?array
    {
        if ($own = $this->ownStore($module)) {
            return $own->view($id);
        }
        $data = $this->rows($module)->where('id', $id)->value('data');

        return $data === null ? null : json_decode($data, true);
    }

    /**
     * Keeps a new record (no $id: it gets a ULID made here) or changes one. In on-the-phone mode the version counts up
     * here; in sync mode it stays the server's, which the queued change is based on.
     *
     * @return array{record: array, op: string, version: int|null}
     */
    public function save(string $module, array $input, ?string $id = null, bool $countVersion = true): array
    {
        $own = $this->ownStore($module);
        // a module with its own store keeps nothing in local_records: an id there means an edit
        $existing = $id && ! $own ? DB::table('local_records')->where('module', $module)->where('id', $id)->whereNull('deleted_at')->first() : null;
        $op = ($own ? $id !== null : (bool) $existing) ? 'edit' : 'create';
        $input = array_diff_key($input, array_flip(['id', 'uuid', 'version', 'created_at', 'updated_at', 'deleted_at']));
        $hook = $this->hook($module);
        if ($hook) {
            $input = validator($input, $hook->rules($op))->validate();
        }
        if ($own) {
            $record = $own->save($input, $id);

            return ['record' => $record, 'op' => $op, 'version' => $record['version'] ?? null];
        }

        $id = $existing ? $id : ($id ?: strtolower((string) Str::ulid()));
        $now = now()->toIso8601ZuluString('microsecond');
        $record = array_merge($existing ? json_decode($existing->data, true) : ['created_at' => $now], $input, ['uuid' => $id, 'updated_at' => $now]);
        $version = $existing?->version;
        if ($countVersion) {
            $version = ($version ?? 0) + 1;
            $record['version'] = $version;
        }
        if ($hook) {
            $record = $hook->saving($record, $op);
        }
        DB::table('local_records')->updateOrInsert(['module' => $module, 'id' => $id], ['data' => json_encode($record), 'version' => $version, 'updated_at' => now(), 'deleted_at' => null]);

        return ['record' => $record, 'op' => $op, 'version' => $version];
    }

    /** @return int|null the version the record had (what a queued delete is based on); null when there was nothing */
    public function delete(string $module, string $id): ?int
    {
        if ($own = $this->ownStore($module)) {
            $own->delete($id);

            return null;
        }
        $row = DB::table('local_records')->where('module', $module)->where('id', $id)->whereNull('deleted_at')->first();
        if (! $row) {
            return null;
        }
        DB::table('local_records')->where('module', $module)->where('id', $id)->update(['deleted_at' => now()]);

        return $row->version;
    }

    /** Records kept here, per module (the Sync page's "Kept on this phone"). */
    public function counts(): array
    {
        return DB::table('local_records')->whereNull('deleted_at')->groupBy('module')->orderBy('module')->selectRaw('module, count(*) as records')->get()
            ->map(fn ($r) => ['module' => $r->module, 'records' => (int) $r->records])->all();
    }

    private function rows(string $module): Builder
    {
        return DB::table('local_records')->where('module', $module)->whereNull('deleted_at');
    }

    private function filter(Builder $query, string $field, string $operator, mixed $value): void
    {
        if (! in_array($operator, self::OPERATORS, true)) {
            throw ValidationException::withMessages(["filters.{$field}" => ["The operator {$operator} is not one of the list contract's."]]);
        }
        if ($field === 'search') {
            $term = trim((string) $value);
            if ($term !== '') {
                // the record's values, not its field names
                $query->whereRaw("exists (select 1 from json_each(local_records.data) where json_each.type = 'text' and json_each.value like ?)", ['%'.$this->like($term).'%']);
            }

            return;
        }
        $path = $this->path($field);
        $col = 'json_extract(data, ?)';
        $one = fn ($v) => is_numeric($v) && ! is_string($v) ? $v : (is_string($v) && preg_match('/^-?\d+(\.\d+)?$/', $v) ? $v + 0 : $v);
        $list = fn ($v) => array_map($one, is_array($v) ? array_values($v) : explode(',', (string) $v));
        match ($operator) {
            'eq' => $query->whereRaw("{$col} = ?", [$path, $one($value)]),
            'neq' => $query->whereRaw("({$col} is null or {$col} != ?)", [$path, $path, $one($value)]),
            'gt' => $query->whereRaw("{$col} > ?", [$path, $one($value)]),
            'gte' => $query->whereRaw("{$col} >= ?", [$path, $one($value)]),
            'lt' => $query->whereRaw("{$col} < ?", [$path, $one($value)]),
            'lte' => $query->whereRaw("{$col} <= ?", [$path, $one($value)]),
            'in' => $query->whereRaw("{$col} in (".implode(',', array_fill(0, max(1, count($list($value))), '?')).')', [$path, ...($list($value) ?: [null])]),
            'nin' => $query->whereRaw("({$col} is null or {$col} not in (".implode(',', array_fill(0, max(1, count($list($value))), '?')).'))', [$path, $path, ...($list($value) ?: [null])]),
            'contains' => $query->whereRaw("{$col} like ? escape '\\'", [$path, '%'.$this->like((string) $value).'%']),
            'begins' => $query->whereRaw("{$col} like ? escape '\\'", [$path, $this->like((string) $value).'%']),
            'ends' => $query->whereRaw("{$col} like ? escape '\\'", [$path, '%'.$this->like((string) $value)]),
            'between' => $query->whereRaw("{$col} between ? and ?", [$path, ...array_slice(array_pad($list($value), 2, null), 0, 2)]),
            'null' => $query->whereRaw("({$col} is null or {$col} = '')", [$path, $path]),
            'not_null' => $query->whereRaw("({$col} is not null and {$col} != '')", [$path, $path]),
        };
    }

    private function path(string $field): string
    {
        if (! preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/', $field)) {
            throw ValidationException::withMessages(['filters' => ["{$field} is not a field name."]]);
        }

        return '$.'.$field;
    }

    private function like(string $term): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term);
    }

    private function hook(string $module): ?LocalModule
    {
        $class = $this->moduleClass($module);

        return $class && is_subclass_of($class, LocalModule::class) ? app($class) : null;
    }

    private function ownStore(string $module): ?LocalModuleStore
    {
        $class = $this->moduleClass($module);

        return $class && is_subclass_of($class, LocalModuleStore::class) ? app($class) : null;
    }

    private function moduleClass(string $module): ?string
    {
        $class = 'App\\Local\\Modules\\'.Str::studly($module);

        return preg_match('/^[A-Za-z][A-Za-z0-9]*$/', $module) && class_exists($class) ? $class : null;
    }
}
