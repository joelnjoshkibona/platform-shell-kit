<?php

namespace App\Local;

/**
 * P104, the way out: a module that needs rules on the phone adds app/Local/Modules/{Key}.php implementing this. The store
 * validates a save with rules() and lets saving() adjust the record before it is kept. Without the class, the store keeps
 * what the screen sends (in sync mode the server checks it again when it arrives).
 */
interface LocalModule
{
    /** Laravel validation rules for a save; $op is create or edit. */
    public function rules(string $op): array;

    /** The record about to be kept (validated keys merged into the stored record); return it, changed or not. */
    public function saving(array $record, string $op): array;
}
