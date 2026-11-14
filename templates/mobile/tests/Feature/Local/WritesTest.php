<?php

namespace Tests\Feature\Local;

use App\Local\Writes;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/** P78: writes that open a transaction run one at a time, and a drifted transaction count is put back once, with a warning. */
class WritesTest extends TestCase
{
    public function test_a_write_runs_in_a_transaction_and_answers_with_its_result(): void
    {
        $this->assertSame([1, 'done'], Writes::transaction(fn () => [DB::transactionLevel(), 'done']));
        $this->assertSame(0, DB::transactionLevel());
    }

    public function test_a_write_inside_a_write_is_a_savepoint_not_a_second_lock(): void
    {
        $this->assertSame(2, Writes::transaction(fn () => Writes::transaction(fn () => DB::transactionLevel())));
    }

    public function test_a_drifted_count_is_reset_and_the_write_runs_once_more(): void
    {
        Log::spy();
        $tries = 0;
        $result = Writes::transaction(function () use (&$tries) {
            if (++$tries === 1) {
                throw new QueryException('sqlite', 'RELEASE SAVEPOINT trans2', [], new \PDOException('SQLSTATE[HY000]: General error: 1 no such savepoint: trans2'));
            }

            return 'kept';
        });

        $this->assertSame(['kept', 2, 0], [$result, $tries, DB::transactionLevel()]);
        Log::shouldHaveReceived('warning')->once()->withArgs(fn ($message) => str_starts_with($message, 'db: transaction count reset'));
    }

    public function test_any_other_failure_is_not_retried(): void
    {
        $tries = 0;
        $this->expectException(\RuntimeException::class);
        try {
            Writes::transaction(function () use (&$tries) {
                $tries++;
                throw new \RuntimeException('no');
            });
        } finally {
            $this->assertSame(1, $tries);
        }
    }
}
