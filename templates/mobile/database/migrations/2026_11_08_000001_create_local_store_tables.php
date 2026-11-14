<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * P102, P104: the phone's own data (on-the-phone and sync modes).
 * - local_records: every module's records, one row each, the record as JSON (`data`); in sync mode `synced` is the last
 *   copy the server sent, so a change thrown away goes back to it.
 * - sync_queue: changes made here and not yet on the server, in order; it survives the app being closed (P58).
 * - sync_state: the server's cursor and when the phone last synced.
 * - local_meta: small facts about this phone's data (the date of the last backup).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('local_records', function (Blueprint $t) {
            $t->string('module', 80);
            $t->string('id', 64);
            $t->json('data');
            $t->json('synced')->nullable();
            $t->unsignedInteger('version')->nullable();
            $t->timestamp('updated_at', 6)->nullable();
            $t->timestamp('deleted_at', 6)->nullable();
            $t->primary(['module', 'id']);
            $t->index(['module', 'deleted_at']);
        });
        Schema::create('sync_queue', function (Blueprint $t) {
            $t->string('ulid', 26)->primary();
            $t->string('module', 80);
            $t->string('op', 10);
            $t->string('record_id', 64);
            $t->json('payload')->nullable();
            $t->unsignedInteger('version')->nullable();
            $t->string('key', 64)->unique();
            $t->unsignedInteger('tries')->default(0);
            $t->string('status', 10)->default('waiting'); // waiting | conflict | refused
            $t->json('server_record')->nullable();
            $t->text('error')->nullable();
            $t->timestamp('created_at', 6)->nullable();
            $t->index(['module', 'record_id']);
        });
        Schema::create('sync_state', function (Blueprint $t) {
            $t->string('module', 80)->primary(); // '*': the server's one cursor for every module
            $t->text('cursor')->nullable();
            $t->timestamp('last_synced_at')->nullable();
        });
        Schema::create('local_meta', function (Blueprint $t) {
            $t->string('key', 80)->primary();
            $t->text('value')->nullable();
        });
    }

    public function down(): void
    {
        foreach (['local_meta', 'sync_state', 'sync_queue', 'local_records'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
