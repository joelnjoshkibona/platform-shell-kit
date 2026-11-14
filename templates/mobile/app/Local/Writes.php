<?php

namespace App\Local;

use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * P78: one database write at a time. The page can fire several requests at once and the phone has one SQLite file, so every
 * write that opens a transaction goes through here: a file lock first, then the transaction. If Laravel's count of open
 * transactions has drifted from SQLite's (an outer request died mid-transaction, then "no such savepoint transNN"), the
 * count is put back to zero and the write runs once more, with a warning under the "db" tag. This is a mitigation: the
 * root cause was never proven.
 */
class Writes
{
    /** @var resource|null the lock this process holds while a write runs (nested calls reuse it) */
    private static $held = null;

    public static function transaction(Closure $write): mixed
    {
        if (self::$held !== null) {
            return DB::transaction($write); // already inside a locked write: a savepoint, as Laravel does
        }

        $lock = self::open();
        flock($lock, LOCK_EX);
        self::$held = $lock;
        try {
            try {
                return DB::transaction($write);
            } catch (QueryException $e) {
                if (! str_contains($e->getMessage(), 'no such savepoint')) {
                    throw $e;
                }
                self::reset($e->getMessage());

                return DB::transaction($write);
            }
        } finally {
            self::$held = null;
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /** @return resource */
    private static function open()
    {
        $dir = storage_path('framework');
        if (! is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }

        return fopen($dir.'/db-write.lock', 'c');
    }

    private static function reset(string $why): void
    {
        $connection = DB::connection();
        $level = $connection->transactionLevel();
        try {
            $connection->getPdo()->inTransaction() && $connection->getPdo()->rollBack();
        } catch (\Throwable) {
            // nothing open on SQLite's side: only Laravel's count was wrong
        }
        (fn () => $this->transactions = 0)->call($connection);
        Log::warning("db: transaction count reset from {$level} ({$why})", ['tag' => 'db']);
    }
}
