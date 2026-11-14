<?php

namespace App\Local;

/**
 * P104, the way out for a module that keeps its own table on the phone: app/Local/Modules/{Key}.php implements this, with
 * its migration in database/migrations. The store hands every call for that module to it. Answers keep the list contract
 * (P87): list() returns ['data' => rows, 'meta' => [current_page, last_page, per_page, total]].
 */
interface LocalModuleStore
{
    public function list(array $filters, array $params): array;

    public function view(string $id): ?array;

    /** Creates (no $id) or edits; returns the stored record. */
    public function save(array $record, ?string $id): array;

    public function delete(string $id): void;
}
